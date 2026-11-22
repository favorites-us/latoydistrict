import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryStores, stores } from '../lib/stores';
import { groupStores, streetGroups, nearestStores } from '../lib/directory-navigation';
import { filterStores, emptyFilters } from '../lib/buyer-tools';
import { storePageMeta } from '../lib/meta';
import sitemap from '../app/sitemap';

const duplicate = 'california-balloon-house-c-447';
const scoped = ['2449-hyperion-llc-231', '300-s-los-angeles-st-partnership-lp-300', 'investment-consultants-llc-326', 'little-tokyo-service-center-community-development-corporatio', 'mumford-brewing-co-llc-416', 'worldwide-aeros-corp-442', 'vain-media-llc-420'];
test('duplicate stays in inventory but not public lists, counts, nearby candidates or sitemap', () => {
  assert.equal(inventoryStores.length, 191); assert.equal(stores.length, 190);
  assert.equal(inventoryStores.find(s => s.slug === duplicate)?.duplicate_of, 'california-balloon-house-447');
  const results = [stores, filterStores(inventoryStores, emptyFilters), ...(['en', 'es'] as const).flatMap(locale => [groupStores(inventoryStores, locale).flatMap(([, s]) => s), streetGroups(inventoryStores, locale).flatMap(g => g.stores)])];
  for (const list of results) { assert.equal(list.length, 190); assert.ok(!list.some(s => s.slug === duplicate)); }
  for (const store of stores) assert.ok(!nearestStores(store, inventoryStores).some(s => s.slug === duplicate));
  assert.ok(!sitemap().some(e => e.url.endsWith(`/stores/${duplicate}`)));
});
test('exactly seven scoped registrations remain visible but are noindex and absent from sitemap', () => {
  assert.deepEqual(stores.filter(s => s.listing_scope === 'non_merchant').map(s => s.slug).sort(), [...scoped].sort());
  for (const slug of scoped) {
    const store = stores.find(s => s.slug === slug)!;
    assert.ok(store);
    for (const locale of ['en', 'es'] as const) assert.deepEqual(storePageMeta(store, locale).robots, { index: false, follow: true });
    assert.ok(!sitemap().some(e => e.url.endsWith(`/stores/${slug}`)));
  }
  const merchant = stores.find(s => s.slug === 'california-balloon-house-447')!;
  assert.equal(storePageMeta(merchant, 'en').robots, undefined);
});
