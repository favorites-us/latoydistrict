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
