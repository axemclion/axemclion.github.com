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
//   <!--@var name: value-->           per-page variable, used as {{name}} anywhere (HTML-escaped)
// Everything in src/media/ (images, CNAME, favicon) is copied flat into dist/.
// Output is minified (comments and indentation removed) unless --watch is given.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, copyFileSync, watch, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const src = join(root, 'src');
const dist = join(root, 'dist');
const args = process.argv.slice(2);
const read = (p) => readFileSync(join(src, p), 'utf8').replace(/\r\n/g, '\n');

const esc = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

function expand(html) {
  html = html.replace(/<!--@include (\S+)\s*-->/g, (_, p) => expand(read(p)));
  html = html.replace(/<!--@css-->/g, () => '<style type="text/css">\n' + minifyCss(read('css/main.css')) + '\n</style>');
  html = html.replace(/<!--@js (\S+)\s*-->/g, (_, p) => '<script type="text/javascript">\n' + minifyJs(read(p)) + '\n</script>');
  return html;
}

// Small, conservative minifiers: nothing here changes how a page renders or runs.
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{};,])\s*/g, '$1')
    .replace(/:\s+/g, ':')
    .replace(/;}/g, '}')
    .trim();
}
function minifyJs(js) {
  return js.split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
}
function minifyHtml(html) {
  // leave <script> and <style> bodies alone, tidy everything else
  return html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/g).map((part, i) => i % 2 ? part : part
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, '')
    .replace(/^[ \t]+/gm, '')
    .replace(/\n{2,}/g, '\n')).join('').replace(/^\n+/, '');
}

function render(file, minify) {
  let html = read(file);
  const vars = {};
  html = html.replace(/<!--@var (\w+):\s*([\s\S]*?)-->\n?/g, (_, k, v) => { vars[k] = v.trim(); return ''; });
  html = expand(html);
  html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(file + ': no <!--@var ' + k + ': …--> defined');
    return esc(vars[k]);
  });
  return minify ? minifyHtml(html) : html;
}

function build() {
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });
  for (const f of readdirSync(src).filter((f) => f.endsWith('.html'))) {
    writeFileSync(join(dist, f), render(f, !args.includes('--watch')));
  }
  for (const f of readdirSync(join(src, 'media'))) {
    copyFileSync(join(src, 'media', f), join(dist, f));
  }
  console.log('built dist/ at ' + new Date().toLocaleTimeString());
}

const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.css': 'text/css', '.js': 'text/javascript' };

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
