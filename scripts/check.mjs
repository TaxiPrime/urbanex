import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
const c = JSON.parse(await readFile(resolve(root, 'content/es.json'), 'utf8'));
const pages = ['index.html', 'aviso-legal/index.html', 'privacidad/index.html', '404.html'];
const seenTitles = new Set();
for (const page of pages) {
  const html = await readFile(resolve(output, page), 'utf8');
  assert.match(html, /<html lang="es">/);
  assert.equal((html.match(/<h1>/g) || []).length, 1, `${page}: one primary heading`);
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  assert.ok(title && !seenTitles.has(title), `${page}: unique title`);
  seenTitles.add(title);
  for (const text of [c.site.nif, c.site.email, 'P&amp;P URBANEX SL', c.site.address]) {
    assert.ok(html.includes(text), `${page}: complete corporate identity`);
  }
  assert.doesNotMatch(html, /<script\b|<iframe\b|<form\b|<input\b|<img[^>]+https?:|<link[^>]+(?:href="https?:.*?stylesheet|rel="(?:preconnect|dns-prefetch)")/i, `${page}: no tracking, embeds or remote resources`);
  assert.doesNotMatch(html, /undefined|\[correo|\[pendiente|TODO|XXXX/i, `${page}: no unresolved placeholders`);
  if (page !== '404.html') assert.match(html, /rel="canonical" href="https:\/\/urbanex\.taxiprime\.app\//);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: unique anchor IDs`);
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (href.startsWith('mailto:')) {
      assert.equal(href, `mailto:${c.site.email}`);
      continue;
    }
    if (href.startsWith('https://')) continue;
    assert.ok(!href.startsWith('//') && !href.includes('..'), `${page}: safe local link`);
    const [path, fragment] = href.split('#');
    const target = path ? resolve(output, `.${path}`, path.endsWith('/') ? 'index.html' : '') : resolve(output, page);
    await access(target);
    if (fragment) assert.ok((await readFile(target, 'utf8')).includes(`id="${fragment}"`), `${page}: existing anchor ${href}`);
  }
}
const privacy = await readFile(resolve(output, 'privacidad/index.html'), 'utf8');
assert.ok(privacy.includes('id="cookies"'));
assert.match(privacy, /Vercel/);
assert.match(privacy, /Google/);
assert.match(privacy, /interés legítimo/);
const home = await readFile(resolve(output, 'index.html'), 'utf8');
const visibleHomeCopy = home.replace(/<[^>]*>/g, ' ');
assert.doesNotMatch(visibleHomeCopy, /licencias|\bVTC\b|\bTaxiPrime\b|reservas/i, 'No unsupported affiliations or active transport services');
async function auditDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) await auditDirectory(file);
    else assert.ok(['.html', '.css', '.svg', '.txt', '.xml'].includes(extname(entry.name)), `Unexpected public file: ${entry.name}`);
  }
}
await auditDirectory(output);
const config = JSON.parse(await readFile(resolve(root, 'vercel.json'), 'utf8'));
const headers = Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]));
assert.match(headers['Content-Security-Policy'], /script-src 'none'/);
assert.match(headers['Content-Security-Policy'], /connect-src 'none'/);
console.log('Passed: identity, page structure, links, anchors, privacy, public file allowlist and tracking protection.');
