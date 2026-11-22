import test from 'node:test';
import assert from 'node:assert/strict';
import { activeStores, groupStores, nearestStores, streetGroups, streetNumber } from '../lib/directory-navigation';
import { stores, SITE_URL, type Store } from '../lib/stores';
import { storeDescription, storeTitle } from '../lib/meta';
import { storeBreadcrumbJsonLd } from '../lib/jsonld';
import sitemap from '../app/sitemap';
import { indexMetadata, streetMetadata, streetParams as generateStaticParams } from '../lib/navigation-content';

const fixture = (slug: string, changes: Partial<Store> = {}): Store => ({ ...stores[0], slug, status: 'unverified', ...changes });
test('A–Z covers every active listing once in both locales, including digits and normalized names', () => {
  for (const locale of ['en', 'es'] as const) {
    const result = groupStores(stores, locale).flatMap(([, items]) => items.map(s => s.slug));
    assert.equal(result.length, new Set(result).size);
    assert.deepEqual(result.sort(), activeStores(stores).map(s => s.slug).sort());
  }
  const groups = groupStores([fixture('b', { name: 'beta' }), fixture('a', { name: 'Alpha' }), fixture('digit', { name: '3 Toys' }), fixture('closed', { status: 'closed' })], 'en');
  assert.deepEqual(groups.map(([letter]) => letter), ['0–9', 'A', 'B']);
});
test('each non-closed listing belongs to exactly one populated street; numeric address and unit ordering', () => {
  const groups = streetGroups(stores);
  const slugs = groups.flatMap(g => g.stores.map(s => s.slug));
  assert.equal(slugs.length, new Set(slugs).size);
  assert.deepEqual(slugs.sort(), activeStores(stores).map(s => s.slug).sort());
  assert.deepEqual(generateStaticParams(), groups.map(({ block }) => ({ block })));
  const address = { ...stores[0].address, line1: '10 Wall St' };
  const items = [fixture('u10', { address: { ...address, unit: '10' } }), fixture('u2', { address: { ...address, unit: '2' } }), fixture('first', { address: { ...address, line1: '2 Wall St' } })];
  assert.deepEqual(streetGroups(items)[0].stores.map(s => s.slug), ['first', 'u2', 'u10']);
  assert.equal(streetNumber(fixture('x', { address: { ...address, line1: 'Wall St' } })), null);
});
test('nearest neighbors use distance, exclude self/closed/missing coordinates and resolve ties by slug', () => {
  const address = { ...stores[0].address, lat: 34, lng: -118 };
  const origin = fixture('origin', { address });
  const near = fixture('a', { address, block: origin.block === 'wall' ? 'boyd' : 'wall' });
  const tied = fixture('b', { address });
  const far = fixture('far', { address: { ...address, lat: 35 } });
  const missing = fixture('missing', { address: { ...address, lat: null } });
  const closed = fixture('closed', { address, status: 'closed' });
  const items = [far, tied, origin, near, missing, closed];
  assert.deepEqual(nearestStores(origin, items).map(s => s.slug), ['a', 'b', 'far']);
  assert.deepEqual(nearestStores(origin, items), nearestStores(origin, [...items].reverse()));
  assert.equal(nearestStores(origin, items, 1)[0].slug, 'a');
  const fallback = fixture('missing', { address: { ...address, lat: null } });
  assert.deepEqual(nearestStores(fallback, items), nearestStores(fallback, [...items].reverse()));
  assert.ok(nearestStores(fallback, items).every(s => s.slug !== fallback.slug && s.status !== 'closed' && s.block === fallback.block));
  const noCoordinates = fixture('origin', { address: { ...address, lat: null } });
  const high = fixture('high', { address: { ...address, line1: '400 Wall St' } });
  const low = fixture('low', { address: { ...address, line1: '20 Wall St' } });
  assert.deepEqual(nearestStores(noCoordinates, [high, low, noCoordinates, closed]).map(s => s.slug), ['low', 'high']);
  assert.equal(nearestStores(stores[0], stores).length, 8);
});
test('sitemap includes only English navigation pages with stable dates, correct priorities and no hreflang', () => {
  const entries = sitemap();
  for (const [path, priority] of [['/stores', .8], ...streetGroups(stores).map(g => [`/street/${g.block}`, .7])] as [string, number][]) {
    const entry = entries.find(e => e.url === `${SITE_URL}${path}`)!;
    assert.equal(entry.priority, priority);
    assert.equal(entry.lastModified, '2026-11-22');
    assert.equal(entry.alternates, undefined);
  }
  assert.ok(!entries.some(e => /\/es\/(stores|street)(\/|$)/.test(e.url)));
});
test('Spanish index and street metadata are noindex/follow and self canonical without hreflang', async () => {
  for (const [path, meta] of [['/es/stores', indexMetadata('es')], ['/es/street/wall', streetMetadata('wall', 'es')]] as const) {
    assert.deepEqual(meta.robots, { index: false, follow: true });
    assert.equal(meta.alternates?.canonical, path);
    assert.equal(meta.alternates?.languages, undefined);
  }
});
test('store descriptions fit 155 characters, omit unsupported claims, and titles distinguish addresses', () => {
  for (const locale of ['en', 'es'] as const) for (const s of stores) {
    const description = storeDescription(s, locale);
    assert.ok(description.length <= 155, `${s.slug}: ${description}`);
    assert.doesNotMatch(description, /wholesale info|información de mayoreo/);
    if (!s.phone) assert.doesNotMatch(description, /Phone listed|Teléfono publicado/);
    if (!s.online_facts?.some(f => f.source.type === 'business')) assert.doesNotMatch(description, /Published buying|compra publicada/);
    if (!s.since) assert.doesNotMatch(description, /since \d|desde \d/);
    assert.ok(storeTitle(s, locale).includes(s.address.line1));
    const crumbs = storeBreadcrumbJsonLd(s, locale).itemListElement;
    assert.equal(crumbs.length, 3);
    assert.equal(crumbs[1].item, `${SITE_URL}${locale === 'es' ? '/es' : ''}/street/${s.block}`);
    assert.equal(crumbs[2].item, `${SITE_URL}${locale === 'es' ? '/es' : ''}/stores/${s.slug}`);
  }
  const small = fixture('short', { name: 'A', address: { line1: '1 St', unit: null, zip: '', lat: null, lng: null }, category: [], since: null, phone: null, online_facts: [] });
  assert.doesNotMatch(storeDescription(small, 'en'), /since/);
  assert.match(storeDescription({ ...small, phone: '123' }, 'en'), /Phone listed/);
  assert.match(storeDescription({ ...small, since: '2001-01-01' }, 'en'), /since 2001/);
  const fact = { id: 'test', kind: 'buying' as const, text: { en: 'Terms', es: 'Condiciones' }, scope: 'business', source: { type: 'directory' as const, label: 'Directory', url: 'https://example.com', checked_at: '2026-11-22' } };
  assert.doesNotMatch(storeDescription({ ...small, online_facts: [fact] }, 'en'), /Published buying/);
  assert.match(storeDescription({ ...small, online_facts: [{ ...fact, source: { ...fact.source, type: 'business' } }] }, 'en'), /Published buying information with sources/);
  assert.ok(storeDescription({ ...small, name: 'A'.repeat(200) }, 'es').length <= 155);
});
