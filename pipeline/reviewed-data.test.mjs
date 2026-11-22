import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { z } from "zod";
import { applyReviewedData, identityOf, loadReviewedData, readBaselineStores, assertBaselineInventory } from "./reviewed-data.mjs";
import { StoreSchema } from "./store-schema.mjs";
import { osmMatch } from "./osm-match.mjs";
import { buildStores } from "./build-stores.mjs";
import { parseAddress } from "./lib.mjs";

const store = {
  id: "sample", name: "Sample Toys INC", address: { line1: "230 Winston St", unit: "31", zip: "90013" },
  phone: null, hours: null, sources: ["opendata"], verified_at: null,
};
const source = { url: "https://example.com/contact", type: "business", label: "Sample Toys", checked_at: "2026-10-14" };
const empty = { version: 1, note: "Inherited, not verified", entries: [] };
function review() {
  return { version: 1, entries: [{
    id: store.id, identity: identityOf(store), decision: "approved", reviewer: "test", identity_evidence: "Exact name and suite",
    business_domains: ["example.com"],
    updates: [{ field: "phone", value: "(213) 555-0100", previous: null, change_type: "new_fill", scope: "Business contact", source }], facts: [],
  }] };
}

test("approved fields preserve unrelated data and never imply an in-person visit", () => {
  const input = [{ ...store, payment: ["cash"] }];
  const once = applyReviewedData(input, empty, review());
  assert.equal(once[0].phone, "(213) 555-0100");
  assert.equal(once[0].verified_at, null);
  assert.deepEqual(once[0].payment, ["cash"]);
  assert.equal(input[0].phone, null);
  assert.deepEqual(applyReviewedData(once, empty, review()), once);
});

test("another suite or merchant cannot inherit a reviewed phone", () => {
  assert.throws(() => applyReviewedData([{ ...store, address: { ...store.address, unit: "38" } }], empty, review()), /Identity mismatch/);
  assert.throws(() => applyReviewedData([{ ...store, name: "Different Toys" }], empty, review()), /Identity mismatch/);
  assert.throws(() => applyReviewedData([], empty, review()), /missing from input/);
});

test("contact-only rebuild cannot silently erase a newer registry inventory", () => {
  assert.doesNotThrow(() => assertBaselineInventory([store], [store]));
  assert.throws(() => assertBaselineInventory([store, { ...store, id: "new" }], [store]), /inventory changed/);
  assert.throws(() => assertBaselineInventory([{ ...store, name: "New Tenant" }], [store]), /Identity mismatch/);
});

test("conflicting values and unreviewed decisions fail instead of silently replacing data", () => {
  assert.throws(() => applyReviewedData([{ ...store, phone: "(213) 555-0199" }], empty, review()), /Unexpected current value/);
  const candidate = review(); candidate.entries[0].decision = "needs_review";
  assert.throws(() => applyReviewedData([store], empty, candidate));
});

test("legacy migration cannot conceal a conflicting newer contact", () => {
  const inherited = { ...empty, entries: [{ id: store.id, identity: identityOf(store), values: { phone: "(213) 555-0101" } }] };
  const correction = review();
  correction.entries[0].updates[0].previous = "(213) 555-0101";
  correction.entries[0].updates[0].change_type = "correction";
  assert.throws(() => applyReviewedData([{ ...store, phone: "(213) 555-0199" }], inherited, correction), /conflict with inherited data/);
  const once = applyReviewedData([store], inherited, correction);
  assert.deepEqual(applyReviewedData(once, inherited, correction), once);
});

test("directory evidence is phone-only and manufacturer evidence is attribution-only", () => {
  const directory = review(); directory.entries[0].updates[0].source = { ...source, type: "directory" };
  assert.equal(applyReviewedData([store], empty, directory)[0].phone, "(213) 555-0100");
  directory.entries[0].updates[0].field = "hours";
  directory.entries[0].updates[0].value = "9–5";
  assert.throws(() => applyReviewedData([store], empty, directory), /cannot supply/);
  const manufacturer = review(); manufacturer.entries[0].updates[0].source = { ...source, type: "manufacturer" };
  assert.throws(() => applyReviewedData([store], empty, manufacturer), /cannot supply/);
  const replacement = review();
  Object.assign(replacement.entries[0].updates[0], { previous: "(213) 555-0111", change_type: "correction", source: { ...source, type: "directory" } });
  assert.throws(() => applyReviewedData([store], empty, replacement), /never replace/);
  replacement.entries[0].updates[0].previous = replacement.entries[0].updates[0].value;
  replacement.entries[0].updates[0].change_type = "reconfirm";
  assert.throws(() => applyReviewedData([store], empty, replacement), /never replace or relabel/);
});

test("business sources require a reviewed merchant domain and reject mislabeled directories", () => {
  for (const url of ["https://example.com.evil.test/", "https://other.example.net/", "https://www.yellowpages.com/shop"]) {
    const candidate = review(); candidate.entries[0].updates[0].source = { ...source, url };
    assert.throws(() => applyReviewedData([store], empty, candidate), /domain/);
  }
  const badWebsite = review();
  Object.assign(badWebsite.entries[0].updates[0], { field: "links.website", value: "https://unrelated.example.org/" });
  assert.throws(() => applyReviewedData([store], empty, badWebsite), /Website value domain/);
});

test("null baseline coordinates cannot erase a valid new geocode", () => {
  const input = [{ ...store, address: { ...store.address, lat: 34.046, lng: -118.246 } }];
  const inherited = { ...empty, entries: [{ id: store.id, identity: identityOf(store), values: { coordinates: { lat: null, lng: null } } }] };
  assert.deepEqual(applyReviewedData(input, inherited, review())[0].address, input[0].address);
});

test("unsafe URLs, forbidden listing sources, invalid dates and arbitrary phone text fail", () => {
  for (const url of ["javascript:alert(1)", "https://user:password@example.com/", "https://maps.google.com/maps", "https://g.page/shop"]) {
    const candidate = review(); candidate.entries[0].updates[0].source = { ...source, url };
    assert.throws(() => applyReviewedData([store], empty, candidate));
  }
  const badDate = review(); badDate.entries[0].updates[0].source = { ...source, checked_at: "2026-02-30" };
  assert.throws(() => applyReviewedData([store], empty, badDate));
  const badPhone = review(); badPhone.entries[0].updates[0].value = "call2135550100now";
  assert.throws(() => applyReviewedData([store], empty, badPhone));
});

test("minimum order facts require currency/amount and bilingual scoped text", () => {
  const candidate = review(); candidate.entries[0].updates = [];
  candidate.entries[0].facts = [{ id: "minimum", kind: "minimum_order", text: { en: "Wholesale only", es: "Solo mayoreo" }, scope: "Wholesale; other terms unknown", source }];
  assert.throws(() => applyReviewedData([store], empty, candidate), /amount and currency/);
  candidate.entries[0].facts[0].minimum_order_value = { amount: 3000, currency: "USD" };
  assert.equal(applyReviewedData([store], empty, candidate)[0].online_facts[0].minimum_order_value.amount, 3000);
  delete candidate.entries[0].facts[0].text.es;
  assert.throws(() => applyReviewedData([store], empty, candidate));
});

test("conflicting official hours can be withdrawn and remain withdrawn after a rebuild", () => {
  const inherited = { ...empty, entries: [{ id: store.id, identity: identityOf(store), values: { hours: "9am–4pm" } }] };
  const candidate = review();
  candidate.entries[0].updates = [{ field: "hours", value: null, previous: "9am–4pm", change_type: "correction", scope: "Official pages disagree; no single closing time is confirmed", source }];
  const once = applyReviewedData([store], inherited, candidate);
  assert.equal(once[0].hours, null);
  assert.deepEqual(applyReviewedData(once, inherited, candidate), once);
  candidate.entries[0].updates[0].previous = null;
  candidate.entries[0].updates[0].change_type = "new_fill";
  assert.throws(() => applyReviewedData([store], empty, candidate), /empty value/);
});

test("additional conflict sources obey the same domain and evidence policies", () => {
  const candidate = review();
  candidate.entries[0].facts = [{ id: "conflict", kind: "services", text: { en: "Pages disagree", es: "Las páginas difieren" }, scope: "Hours conflict", source, additional_sources: [{ ...source, url: "https://unreviewed.example.net/" }] }];
  assert.throws(() => applyReviewedData([store], empty, candidate), /domain not reviewed/);
  candidate.entries[0].facts[0].additional_sources = [{ ...source, type: "directory" }];
  assert.throws(() => applyReviewedData([store], empty, candidate), /phone-only/);
});

test("duplicate IDs and duplicate field updates cannot silently win", () => {
  assert.throws(() => applyReviewedData([store, store], empty, review()), /Duplicate/);
  const candidate = review(); candidate.entries[0].updates.push(candidate.entries[0].updates[0]);
  assert.throws(() => applyReviewedData([store], empty, candidate), /Duplicate/);
});

test("OSM matching requires name, street address and suite together", () => {
  const element = { tags: { name: "Sample Toys", shop: "toys", "addr:housenumber": "230", "addr:street": "Winston Street", "addr:unit": "31" } };
  assert.ok(osmMatch(store, element));
  for (const patch of [{ name: "Other Gifts" }, { "addr:housenumber": "256" }, { "addr:unit": "38" }, { "addr:unit": undefined }]) {
    assert.equal(osmMatch(store, { tags: { ...element.tags, ...patch } }), null);
  }
});

test("committed pilot retains the baseline, adds exactly four directory phones, and validates all 191 stores", () => {
  const baseline = readBaselineStores();
  const output = z.array(StoreSchema).parse(loadReviewedData(baseline));
  const reviewed = JSON.parse(fs.readFileSync(new URL("./data/reviewed-stores.json", import.meta.url), "utf8"));
  assert.equal(output.length, 191);
  assert.equal(output.filter((s) => s.phone).length - baseline.filter((s) => s.phone).length, 4);
  assert.equal(output.find((s) => s.id === "american-silk-inc-340").hours, null);
  assert.equal(output.filter((s) => s.hours).length, baseline.filter((s) => s.hours).length - 1);
  assert.equal(output.filter((s) => s.contact_email).length, 4);
  assert.equal(output.filter((s) => s.verified_at).length, 0);
  const ids = new Set(reviewed.entries.map((e) => e.id));
  for (const original of baseline) {
    const after = output.find((s) => s.id === original.id);
    if (!ids.has(original.id)) assert.deepEqual(after, original);
  }
  assert.deepEqual(loadReviewedData(output), output);
  assert.deepEqual(z.array(StoreSchema).parse(loadReviewedData(readBaselineStores())), output);
});

test("a registry rebuild with empty contact fields preserves legacy and reviewed enrichment", () => {
  // Simulate the pipeline's registry shape from the frozen inventory; this is
  // an offline rebuild regression check, not a fresh government-data fetch.
  const baseline = readBaselineStores();
  const registry = baseline.map((s) => ({
    display_name: s.name, ...parseAddress(s.address.line1), unit: s.address.unit,
    zip: s.address.zip, coords: null, block: s.block, category: s.category,
    wholesale_retail: s.wholesale_retail, naics: s.naics, place_id: s.place_id,
    confidence: s.confidence, start_date: s.since,
  }));
  const expected = new Map(loadReviewedData(baseline).map((s) => [s.id, s]));
  const output = buildStores(registry);
  assert.equal(output.length, expected.size);
  for (const s of output) assert.deepEqual(s, expected.get(s.id));
});

test("local quality corrections retain inventory, are repeatable, and accept only the reviewed address change", () => {
  const baseline = readBaselineStores();
  const reviews = JSON.parse(fs.readFileSync(new URL('./data/reviewed-stores.json', import.meta.url)));
  const output = z.array(StoreSchema).parse(loadReviewedData(baseline));
  assert.equal(output.length, baseline.length);
  assert.deepEqual(loadReviewedData(output), output);
  assert.doesNotThrow(() => assertBaselineInventory(output, baseline, reviews));
  const bad = structuredClone(output);
  bad.find(s => s.slug === 'toystop-259').address.unit = 'OTHER';
  assert.throws(() => assertBaselineInventory(bad, baseline, reviews), /Identity mismatch/);
  const scopes = output.filter(s => s.listing_scope === 'non_merchant').map(s => s.slug).sort();
  assert.deepEqual(scopes, ['2449-hyperion-llc-231', '300-s-los-angeles-st-partnership-lp-300', 'investment-consultants-llc-326', 'little-tokyo-service-center-community-development-corporatio', 'mumford-brewing-co-llc-416', 'worldwide-aeros-corp-442', 'vain-media-llc-420'].sort());
  assert.equal(output.find(s => s.slug === 'california-balloon-house-c-447').duplicate_of, 'california-balloon-house-447');
  assert.equal(output.find(s => s.slug === 'toystop-259').address.line1, '259 Winston St');
  assert.ok(!output.some(s => /\bStreets\b/i.test(s.address.line1)));
  for (const s of output) {
    const original = baseline.find(b => b.id === s.id);
    const reviewEntry = reviews.entries.find(e => e.id === s.id);
    if (reviewEntry?.corrections && !reviewEntry.updates.length && !reviewEntry.facts.length) {
      assert.equal(s.phone, original.phone);
      assert.equal(s.field_sources, undefined);
      assert.equal(s.online_facts, undefined);
      assert.deepEqual(s.sources, original.sources);
    }
  }
});

test("local correction schema rejects new facts, conflicting previous values, invalid scope and unsafe duplicate targets", () => {
  const baseline = readBaselineStores();
  const reviews = JSON.parse(fs.readFileSync(new URL('./data/reviewed-stores.json', import.meta.url)));
  const apply = input => applyReviewedData(baseline, empty, input);
  for (const field of ['phone', 'hours', 'links.website']) {
    const bad = structuredClone(reviews);
    bad.entries.find(e => e.corrections).corrections[0].field = field;
    assert.throws(() => apply(bad));
  }
  for (const value of ['missing', 'california-balloon-house-c-447', 'toystop-259']) {
    const bad = structuredClone(reviews);
    bad.entries.find(e => e.id === 'california-balloon-house-c-447').corrections[0].value = value;
    assert.throws(() => apply(bad), /Duplicate target/);
  }
  const invalidScope = structuredClone(reviews);
  invalidScope.entries.find(e => e.id === '2449-hyperion-llc-231').corrections[0].value = 'merchant';
  assert.throws(() => apply(invalidScope));
  const conflict = structuredClone(reviews);
  conflict.entries.find(e => e.id === 'toystop-259').corrections[0].previous = '999 Winston St';
  assert.throws(() => apply(conflict), /Unexpected current value/);
  const url = structuredClone(reviews);
  url.entries.find(e => e.id === 'jt-distributors-inc-326').corrections.find(c => c.field === 'links.other').value = ['https://invented.example.com'];
  assert.throws(() => apply(url), /cannot introduce/);
});

test("quality overlay changes exactly the intended record fields and removing it restores previous output", () => {
  const baseline = readBaselineStores();
  const reviews = JSON.parse(fs.readFileSync(new URL('./data/reviewed-stores.json', import.meta.url)));
  const beforeReviews = structuredClone(reviews);
  beforeReviews.entries = beforeReviews.entries.filter(e => !e.corrections || e.updates.length || e.facts.length).map(({ corrections, ...e }) => e);
  const before = applyReviewedData(baseline, empty, beforeReviews);
  const after = applyReviewedData(baseline, empty, reviews);
  const expected = {
    'flowers-and-beyond-international-inc-334': ['links'], 'toystop-259': ['address'], 'van-thai-inc-400': ['links'],
    '2449-hyperion-llc-231': ['listing_scope'], '300-s-los-angeles-st-partnership-lp-300': ['listing_scope'],
    'california-balloon-house-c-447': ['duplicate_of'], 'happy-trading-inc-500': ['links'],
    'investment-consultants-llc-326': ['listing_scope'], 'jt-distributors-inc-326': ['links'],
    'little-tokyo-service-center-community-development-corporatio': ['listing_scope'], 'mega-party-inc-215': ['links'],
    'mumford-brewing-co-llc-416': ['links', 'listing_scope'], 'vain-media-llc-420': ['listing_scope'],
    'worldwide-aeros-corp-442': ['links', 'listing_scope'], 'golden-lite-wholesale-and-import-inc-321': ['links'],
  };
  const changed = {};
  for (let i = 0; i < before.length; i++) {
    const fields = [...new Set([...Object.keys(before[i]), ...Object.keys(after[i])])].filter(k => JSON.stringify(before[i][k]) !== JSON.stringify(after[i][k])).sort();
    if (fields.length) changed[before[i].slug] = fields;
  }
  assert.deepEqual(changed, expected);
  assert.deepEqual(applyReviewedData(baseline, empty, beforeReviews), before);
  for (const slug of ['flowers-and-beyond-international-inc-334', 'jt-distributors-inc-326', 'golden-lite-wholesale-and-import-inc-321']) {
    const old = before.find(s => s.slug === slug), current = after.find(s => s.slug === slug);
    assert.equal(current.links.yelp, undefined); assert.deepEqual(current.links.other, [old.links.yelp]);
  }
});
