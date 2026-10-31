import test from "node:test";
import assert from "node:assert/strict";
import { filterStores, emptyFilters, readShortlist, makeQuoteDraft, hasBuyingInfo } from "../lib/buyer-tools";
import { stores } from "../lib/stores";

const known = new Set(stores.map((store) => store.slug));
test("corrupted, stale and oversized saved lists do not become arbitrary suppliers", () => {
  assert.deepEqual(readShortlist("{bad", known), []);
  assert.deepEqual(readShortlist(JSON.stringify({ version: 2, slugs: [stores[0].slug] }), known), []);
  const candidates = [stores[0].slug, stores[0].slug, "not-a-supplier", null, 5, ...stores.slice(1, 18).map((store) => store.slug)];
  const result = readShortlist(JSON.stringify({ version: 1, slugs: candidates }), known);
  assert.equal(result.length, 12); assert.equal(new Set(result).size, 12); assert.ok(result.every((slug) => known.has(slug)));
});
test("official product names are searchable without treating policy text as inventory", () => {
  const lego = filterStores(stores, { ...emptyFilters, query: "LEGO" });
  assert.ok(lego.some((store) => store.slug === "tom-s-model-501"));
  const silk = stores.find((store) => store.slug === "american-silk-inc-340")!;
  assert.equal(filterStores([silk], { ...emptyFilters, query: "minimum" }).length, 0);
  assert.equal(filterStores([silk], { ...emptyFilters, query: "artificial flowers" }).length, 1);
});
test("filters intersect, closed businesses are excluded, and zero matches stay empty", () => {
  assert.ok(filterStores(stores, { ...emptyFilters, info: true }).every(hasBuyingInfo));
  assert.ok(filterStores(stores, { ...emptyFilters, contact: true }).every((store) => store.phone || store.contact_email));
  assert.equal(filterStores(stores, { ...emptyFilters, query: "no-such-business-987123" }).length, 0);
  assert.equal(filterStores([{ ...stores[0], status: "closed" }], emptyFilters).length, 0);
  assert.equal(filterStores(stores, { ...emptyFilters, category: "party", block: "wall", info: true }).some((store) => store.slug === "california-balloon-house-447"), true);
});
test("quote drafts keep user quantities but do not invent a quote, minimum or availability", () => {
  const draft = makeQuoteDraft("en", "Sample supplier", { items: "Plush bear", quantity: "12 cases", date: "2026-11-12" });
  assert.match(draft, /Plush bear/); assert.match(draft, /12 cases/); assert.match(draft, /confirm availability/); assert.doesNotMatch(draft, /\$/);
  const spanish = makeQuoteDraft("es", "Proveedor", { items: "", quantity: "", date: "" });
  assert.match(spanish, /\[artículo, marca y SKU\]/); assert.match(spanish, /pedido mínimo/);
});
