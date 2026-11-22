// Run after npm run build: verifies the emitted HTML, without a server/network.
import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../.next/server/app/', import.meta.url);
const { stores: inventory } = JSON.parse(await readFile(new URL('../data/stores.json', import.meta.url), 'utf8'));
const duplicates = inventory.filter(s => s.duplicate_of);
const nonMerchants = inventory.filter(s => s.listing_scope === 'non_merchant');
async function* files(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) yield* files(new URL(`${entry.name}/`, dir), `${prefix}${entry.name}/`);
    else if (entry.name.endsWith('.html')) yield [prefix + entry.name, await readFile(new URL(entry.name, dir), 'utf8')];
  }
}
let count = 0;
for await (const [path, html] of files(root)) {
  for (const duplicate of duplicates) {
    assert.ok(!path.endsWith(`stores/${duplicate.slug}.html`), `Duplicate page generated: ${path}`);
    assert.ok(!html.includes(`href="/stores/${duplicate.slug}"`) && !html.includes(`href="/es/stores/${duplicate.slug}"`), `Duplicate inbound link: ${path}`);
  }
  if (nonMerchants.some(s => path === `stores/${s.slug}.html`)) assert.match(html, /name="robots" content="noindex, follow"/);
  const tags = html.match(/<(?:meta|link)\b[^>]*>/g) || [];
  for (const property of ['title', 'description', 'url', 'site_name', 'locale', 'type', 'image']) {
    assert.ok(tags.some(tag => tag.includes(`property="og:${property}"`) && /content="[^"]+"/.test(tag)), `${path} missing og:${property}`);
  }
  assert.ok(tags.some(tag => tag.includes('name="twitter:card"') && tag.includes('summary_large_image')), path);
  assert.ok(tags.some(tag => tag.includes('rel="icon"') && tag.includes('/favicon.ico')), `${path}: favicon`);
  assert.ok(tags.some(tag => tag.includes('rel="apple-touch-icon"')), `${path}: apple icon`);
  if (/^(es\/)?saved.html$/.test(path)) {
    assert.ok(!tags.some(tag => /hreflang/i.test(tag)), path);
    assert.ok(tags.some(tag => tag.includes('name="robots"') && tag.includes('noindex')), path);
    assert.ok(tags.some(tag => tag.includes('rel="canonical"')), path);
  }
  if (/^(es\/)?guide\//.test(path)) {
    const sections = html.match(/<details class="guide-accordion"[^>]*>/g) || [];
    assert.ok(sections[0]?.includes('open=""'), `${path}: first section closed`);
    assert.ok(sections.slice(1).every(tag => !tag.includes('open=')), `${path}: later sections open`);
  }
  if (path === 'index.html' || path === 'es.html' || /^(es\/)?stores\/[^/]+.html$/.test(path)) {
    const photos = (html.match(/<img\b[^>]*>/g) || []).filter(tag => tag.includes('/api/store-photos/'));
    const hasPriorityPhoto = html.includes('class="featured-carousel"') || html.includes('class="store-gallery"');
    if (photos.length && hasPriorityPhoto) {
      assert.ok(photos[0].includes('loading="eager"') && /fetchPriority="high"/i.test(photos[0]), `${path}: first photo priority`);
      assert.ok(photos.slice(1).every(tag => tag.includes('loading="lazy"')), `${path}: remaining photos lazy`);
    }
  }
  count++;
}
const routes = JSON.parse(await readFile(new URL('../.next/server/app-paths-manifest.json', import.meta.url), 'utf8'));
assert.ok(routes['/favicon.ico/route'], 'favicon route missing');
const favicon = JSON.parse(await readFile(new URL('favicon.ico.meta', root), 'utf8'));
assert.equal(favicon.status, 200);
assert.equal(favicon.headers['content-type'], 'image/x-icon');
const routeManifest = JSON.parse(await readFile(new URL('../.next/routes-manifest.json', import.meta.url), 'utf8'));
assert.ok(routeManifest.redirects.some(r => r.statusCode === 308 && r.destination === 'https://toydistrictlosangeles.com/:path*' && r.has?.some(h => h.type === 'host' && h.value === 'www.toydistrictlosangeles.com')));
console.log(`Verified social metadata and icons on ${count} HTML pages, saved-page robots, guide expansion and photo priority.`);

for (const duplicate of duplicates) for (const prefix of ["", "/es"]) {
  assert.ok(routeManifest.redirects.some(r => r.source === `${prefix}/stores/${duplicate.slug}` && r.destination === `${prefix}/stores/${duplicate.duplicate_of}` && r.statusCode === 308));
}
const prerender = JSON.parse(await readFile(new URL('../.next/prerender-manifest.json', import.meta.url), 'utf8'));
for (const prefix of ["", "/es"]) {
  const count = Object.keys(prerender.routes).filter(route => new RegExp(`^${prefix}/stores/[^/]+$`).test(route)).length;
  assert.equal(count, inventory.filter(s => !s.duplicate_of).length);
  console.log(`${prefix || "EN"}: ${count} generated store pages; duplicate redirects verified.`);
}
