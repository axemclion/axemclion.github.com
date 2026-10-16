// Builds src/ into dist/. Node built-ins only, no dependencies.
//
//   node build.mjs                 build once
//   node build.mjs --serve         build, then serve dist/ on http://localhost:9000
//   node build.mjs --watch --serve rebuild on change (dev mode)
//
// Each page in src/*.html is expanded with these markers:
//   <!--@include partials/x.html-->   replaced by that file (may nest)
//   <!--@css-->                       replaced by <style>…main.css…</style>
//   <!--@js js/x.js-->                replaced by <script>…x.js…</script>
// Everything in src/media/ (images, CNAME, favicon) is copied flat into dist/.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, copyFileSync, watch, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');
const args = process.argv.slice(2);
const read = (p) => readFileSync(join(src, p), 'utf8').replace(/\r\n/g, '\n');

function expand(html) {
  html = html.replace(/<!--@include (\S+)\s*-->/g, (_, p) => expand(read(p)));
  html = html.replace(/<!--@css-->/g, () => '<style type="text/css">\n' + read('css/main.css').trim() + '\n</style>');
  html = html.replace(/<!--@js (\S+)\s*-->/g, (_, p) => '<script type="text/javascript">\n' + read(p).trim() + '\n</script>');
  return html;
}

function build() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  for (const f of readdirSync(src).filter((f) => f.endsWith('.html'))) {
    writeFileSync(join(dist, f), expand(read(f)));
  }
  for (const f of readdirSync(join(src, 'media'))) {
    copyFileSync(join(src, 'media', f), join(dist, f));
  }
  console.log('built dist/ at ' + new Date().toLocaleTimeString());
}

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.css': 'text/css', '.js': 'text/javascript' };

function serve(port) {
  createServer((req, res) => {
    let p = normalize(decodeURIComponent(req.url.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
    if (p.endsWith('/')) p += 'index.html';
    let file = join(dist, p);
    let status = 200;
    if (!existsSync(file)) { file = join(dist, '404.html'); status = 404; } // same as GitHub Pages
    res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  }).listen(port, () => console.log('serving dist/ at http://localhost:' + port));
}

build();
if (args.includes('--watch')) {
  let timer;
  watch(src, { recursive: true }, () => { clearTimeout(timer); timer = setTimeout(() => { try { build(); } catch (e) { console.error(e.message); } }, 50); });
}
if (args.includes('--serve')) serve(Number(process.env.PORT) || 9000);
