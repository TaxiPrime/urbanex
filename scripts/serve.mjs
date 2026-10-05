import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
const port = Number(process.env.PORT || 3013);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8' };
const headers = Object.fromEntries(config.headers[0].headers.map(h => [h.key, h.value]));
createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, `.${path}`);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(400).end(); return; }
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      await stat(file);
    } catch { file = resolve(root, '404.html'); status = 404; }
    const data = await readFile(file);
    res.writeHead(status, { ...headers, 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', ...(status === 404 ? { 'X-Robots-Tag': 'noindex' } : {}) });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(400).end(); }
}).listen(port, '127.0.0.1', () => console.log(`Urbanex preview: http://127.0.0.1:${port}`));
