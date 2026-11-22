import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { altMeta, storeMeta, DEFAULT_OG_IMAGE } from '../lib/meta';
import { streetMetadata, streetParams } from '../lib/navigation-content';
import { directoryLinkLabel } from '../lib/urls';
import { articleJsonLd, storeJsonLd, websiteJsonLd } from '../lib/jsonld';
import { stores, SITE_URL } from '../lib/stores';
import { wholesaleToys } from '../lib/content/wholesale-toys';
import { visiting, wholesaleBasics, buyingChecklist } from '../lib/content/guides';

test('social metadata has explicit images, correct locale and page URL on all page types', () => {
  for (const locale of ['en', 'es'] as const) for (const path of ['/', '/stores', '/street/wall', '/stores/example', '/guide/visiting', '/saved', '/about', '/photos']) {
    const meta = (path.startsWith('/store') || path === '/saved' ? storeMeta : altMeta)(path, locale, 'Title', 'Description');
    const og = meta.openGraph as { url: string; locale: string; siteName: string; type: string; images: { url: string }[] };
    assert.equal(og.url, `${SITE_URL}${locale === 'es' ? `/es${path === '/' ? '' : path}` : path}`);
    assert.equal(og.locale, locale === 'es' ? 'es_US' : 'en_US');
    assert.equal(og.siteName, 'LA Toy District');
    assert.equal(og.type, path.startsWith('/guide/') ? 'article' : 'website');
    assert.equal(og.images[0].url, path.startsWith('/stores/') ? `${SITE_URL}${path}/opengraph-image` : DEFAULT_OG_IMAGE);
    assert.equal((meta.twitter as { card: string }).card, 'summary_large_image');
  }
});
test('street descriptions fit the cap in both languages without truncating the location', () => {
  for (const { block } of streetParams()) for (const locale of ['en', 'es'] as const) {
    const description = streetMetadata(block, locale).description!;
    assert.ok(description.length <= 155, description);
    assert.match(description, /\d/);
    assert.ok(!description.endsWith('…'));
  }
});
test('directory link labels use actual hosts and reject deceptive or unsafe URLs', () => {
  for (const host of ['yelp.com', 'www.yelp.com', 'm.yelp.com']) assert.equal(directoryLinkLabel(`https://${host}/biz/test`, 'en'), 'Yelp');
  assert.equal(directoryLinkLabel('https://yelp.com.evil.test/x', 'en'), 'Directory listing (yelp.com.evil.test)');
  assert.equal(directoryLinkLabel('https://www.example.com/yelp.com', 'es'), 'Ficha en directorio (example.com)');
  assert.equal(directoryLinkLabel('javascript:alert(1)', 'en'), null);
  assert.equal(directoryLinkLabel('https://yelp.com@evil.test', 'en'), null);
});
test('entity-owned sameAs, WebSite publisher and per-guide Article dates/images', () => {
  const links = { website: 'https://example.com', facebook: 'https://facebook.com/example', instagram: 'https://instagram.com/example', yelp: 'https://yelp.com/example', other: ['https://directory.example.com'] };
  assert.deepEqual(storeJsonLd({ ...stores[0], links }).sameAs, [links.website, links.facebook, links.instagram]);
  const site = websiteJsonLd();
  assert.equal(site.name, 'LA Toy District'); assert.equal(site.alternateName, 'LA Toy District Directory'); assert.equal(site.publisher.url, SITE_URL);
  for (const locale of ['en', 'es'] as const) {
    for (const guide of [wholesaleToys[locale], visiting[locale], wholesaleBasics[locale], buyingChecklist[locale]]) {
      const article = articleJsonLd(guide, locale, '/guide/test');
      assert.equal(article.dateModified, guide.updated_at ?? guide.reviewed_at);
      assert.equal(article.datePublished, guide.published_at);
      assert.equal(article.image, DEFAULT_OG_IMAGE);
    }
    assert.equal(wholesaleToys[locale].published_at, '2026-11-19');
    assert.equal(wholesaleToys[locale].updated_at, '2026-11-22');
  }
});
test('wholesale guide starts with every toy listing exactly once, then sourced toy facts; other merchants stay concise', () => {
  for (const locale of ['en', 'es'] as const) {
    const guide = wholesaleToys[locale];
    assert.equal(guide.sections.length, 6);
    const listingLinks = guide.sections[0].groups!.flatMap(g => g.links!.map(l => l.href));
    const toys = stores.filter(s => s.status !== 'closed' && s.category.includes('toys'));
    assert.deepEqual(listingLinks.sort(), toys.map(s => `/stores/${s.slug}`).sort());
    for (const group of guide.sections[0].groups!) assert.match(group.headingHref!, /^\/street\//);
    assert.deepEqual(guide.sections[1].groups!.map(g => g.h).sort(), ['Casa Manga', 'Funland Toys Inc', "Tom's Model"].sort());
    assert.ok(guide.sections[1].groups!.every(g => g.sources?.every(s => s.href && s.checked_at)));
    assert.ok(guide.sections[2].links!.every(l => l.href.startsWith('/street/')));
    assert.equal(guide.sections[4].ps.length, 0);
    assert.equal(guide.sections[4].links!.length, 2);
  }
});
test('generated icon assets have the requested sizes and a valid PNG-in-ICO directory', () => {
  const png = readFileSync(new URL('../app/apple-icon.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), 180); assert.equal(png.readUInt32BE(20), 180);
  const ico = readFileSync(new URL('../app/favicon.ico', import.meta.url));
  assert.equal(ico.readUInt16LE(2), 1); assert.equal(ico[6], 32); assert.equal(ico[7], 32);
  assert.equal(ico.readUInt32LE(18), 22); assert.equal(ico.readUInt32LE(14), ico.length - 22);
});
