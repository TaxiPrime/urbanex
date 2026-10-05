import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const content = JSON.parse(await readFile(resolve(root, 'content/es.json'), 'utf8'));
const { site, shared } = content;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const mail = `<a href="mailto:${escape(site.email)}">${escape(site.email)}</a>`;
const links = `<a href="/aviso-legal/">${escape(shared.legal)}</a><a href="/privacidad/">${escape(shared.privacy)}</a>`;
const brand = `<a class="brand" href="/" aria-label="${escape(site.name)}"><span class="brand-mark" aria-hidden="true">u.</span><span>${escape(site.brand)}</span></a>`;

function shell(page, path, body, { legal = false, noindex = false } = {}) {
  const canonical = new URL(path, `${site.url}/`).href;
  return `<!doctype html>
<html lang="${escape(content.lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(page.title)}</title>
  <meta name="description" content="${escape(page.intro || site.description)}">
  <meta name="color-scheme" content="light">
  <meta name="theme-color" content="#1e302b">
  ${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${escape(canonical)}">`}
  <meta property="og:title" content="${escape(page.title)}">
  <meta property="og:description" content="${escape(site.description)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="es_ES">
  ${noindex ? '' : `<meta property="og:url" content="${escape(canonical)}">`}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <a class="skip-link" href="#main">${escape(shared.skip)}</a>
  <header class="site-header wrap">${brand}<nav aria-label="${escape(shared.navLabel)}"><a href="/#sociedad">${escape(shared.about)}</a><a href="/#contacto">${escape(shared.contact)}<span aria-hidden="true"> ↗</span></a></nav></header>
  <main id="main"${legal ? ' class="legal wrap"' : ''}>${body}</main>
  <footer class="site-footer"><div class="wrap footer-grid"><div><p class="footer-name">${escape(site.name)}</p><p>${escape(site.status)} · ${escape(shared.nifLabel)} ${escape(site.nif)}</p><p>${escape(site.address)}</p><p>${mail}</p></div><nav aria-label="${escape(shared.footerNav)}">${links}</nav></div></footer>
</body>
</html>
`;
}

function paragraphs(section) {
  return `<section${section.id ? ` id="${escape(section.id)}"` : ''}><h2>${escape(section.heading)}</h2>${section.paragraphs.map(p => `<p>${escape(p)}</p>`).join('')}</section>`;
}

const h = content.home;
const home = shell(h, '/', `
  <section class="hero wrap">
    <div class="hero-copy"><p class="eyebrow">${escape(h.eyebrow)}</p><h1>${escape(h.heading)}</h1><p class="hero-intro">${escape(h.intro)}</p><a class="button" href="#contacto">${escape(h.cta)}<span aria-hidden="true">↗</span></a></div>
    <div class="hero-art" aria-hidden="true"><div class="art-frame"><div class="arch arch-one"></div><div class="arch arch-two"></div><div class="arch arch-three"></div><div class="art-horizon"></div><span class="art-label">${escape(h.location)}</span><span class="art-monogram">u.</span></div></div>
  </section>
  <section class="about wrap" id="sociedad"><div class="section-label"><span>${escape(h.aboutNumber)}</span><p>${escape(h.aboutLabel)}</p></div><div class="section-content"><h2>${escape(h.aboutTitle)}</h2><p class="lead">${escape(h.aboutText)}</p><dl class="activities"><div><dt>${escape(h.activityLabel)}</dt><dd>${escape(h.activity)}</dd></div><div><dt>${escape(h.otherLabel)}</dt><dd>${escape(h.other)}</dd></div></dl></div></section>
  <section class="contact" id="contacto"><div class="wrap contact-grid"><div><p class="eyebrow">${escape(h.contactNumber)} / ${escape(shared.contact)}</p><h2>${escape(h.contactTitle)}</h2><p class="contact-intro">${escape(h.contactIntro)}</p></div><div class="contact-details"><div><h3>${escape(h.emailLabel)}</h3><p class="email">${mail}<span aria-hidden="true"> ↗</span></p></div><div><h3>${escape(h.addressLabel)}</h3><address>${site.addressLines.map(escape).join('<br>')}</address></div><p class="privacy-note">${escape(h.privacyNote)} <a href="/privacidad/">${escape(shared.privacy)}</a></p></div></div></section>
`);

const l = content.legal;
const identity = ['name', 'status', 'nif', 'address', 'email', 'registry'].map(key => `<div><dt>${escape(l.identityLabels[key])}</dt><dd>${key === 'email' ? mail : escape(site[key])}</dd></div>`).join('');
const legal = shell(l, '/aviso-legal/', `<a class="back-link" href="/">← ${escape(shared.back)}</a><p class="eyebrow">${escape(site.name)}</p><h1>${escape(l.heading)}</h1><p class="legal-intro">${escape(l.intro)}</p><p class="updated">${escape(shared.updated)}</p><section><h2>${escape(l.identityHeading)}</h2><dl class="identity">${identity}</dl></section>${l.sections.map(paragraphs).join('')}`, { legal: true });

const p = content.privacy;
const privacy = shell(p, '/privacidad/', `<a class="back-link" href="/">← ${escape(shared.back)}</a><p class="eyebrow">${escape(site.name)}</p><h1>${escape(p.heading)}</h1><p class="legal-intro">${escape(p.intro)}</p><p class="updated">${escape(shared.updated)}</p><section><h2>${escape(p.identityHeading)}</h2><p>${escape(p.identityIntro)}</p><p>${escape(p.identityContact)} ${mail}</p></section>${p.sections.map(section => `${paragraphs(section)}${section.heading.startsWith('5.') ? `<ul class="provider-links">${p.providerLinks.map(link => `<li><a href="${escape(link.url)}">${escape(link.label)}</a></li>`).join('')}</ul>` : ''}${section.heading.startsWith('6.') ? `<p><a href="${escape(p.authorityUrl)}">${escape(p.authorityLabel)}</a></p>` : ''}`).join('')}`, { legal: true });

const n = content.notFound;
const notFound = shell(n, '/404.html', `<section class="not-found wrap"><p class="eyebrow">404</p><h1>${escape(n.heading)}</h1><p class="lead">${escape(n.intro)}</p><a class="button" href="/">${escape(shared.back)}<span aria-hidden="true">↗</span></a></section>`, { noindex: true });

await rm(resolve(root, 'dist'), { recursive: true, force: true });
await mkdir(resolve(root, 'dist/aviso-legal'), { recursive: true });
await mkdir(resolve(root, 'dist/privacidad'), { recursive: true });
await cp(resolve(root, 'public'), resolve(root, 'dist'), { recursive: true });
for (const [path, html] of [['index.html', home], ['aviso-legal/index.html', legal], ['privacidad/index.html', privacy], ['404.html', notFound]]) {
  await writeFile(resolve(root, 'dist', path), html);
}
await writeFile(resolve(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
await writeFile(resolve(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', '/aviso-legal/', '/privacidad/'].map(path => `<url><loc>${escape(new URL(path, site.url).href)}</loc></url>`).join('')}</urlset>\n`);
console.log('Built three corporate pages, a 404 page and local assets.');
