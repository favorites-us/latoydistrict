import test from "node:test";
import assert from "node:assert/strict";
import { normalizeDisplayName } from "../lib/display-name";
import { stores, SITE_URL } from "../lib/stores";
import { storeMeta, altMeta } from "../lib/meta";
import sitemap from "../app/sitemap";
import { articleJsonLd, breadcrumbJsonLd, storeJsonLd, faqJsonLd } from "../lib/jsonld";
import { wholesaleToys, categoryCounts, streetCounts, listedStores } from "../lib/content/wholesale-toys";
import { visiting, wholesaleBasics, buyerGuides, buyingChecklist } from "../lib/content/guides";
import { filterStores, emptyFilters } from "../lib/buyer-tools";
import { localePath } from "../lib/i18n";

test("display names normalize explicit whole-word tokens without guessing or changing substrings", () => {
  assert.equal(normalizeDisplayName("Toy Time La"), "Toy Time LA");
  assert.equal(normalizeDisplayName("Gm Fashion Usa"), "GM Fashion USA");
  assert.equal(normalizeDisplayName("Dtla Llc Lp Ltd Ii Iii Ca Ny INC Inc"), "DTLA LLC LP LTD II III CA NY Inc Inc");
  assert.equal(normalizeDisplayName("Abc Jk LaLa Plaza Usa2 Café-La (usa), inc."), "Abc Jk LaLa Plaza Usa2 Café-LA (USA), Inc.");
  assert.equal(normalizeDisplayName("Lañ La_Store"), "Lañ La_Store");
  for (const store of stores) assert.equal(normalizeDisplayName(store.name), store.name);
});

test("sitemap dates are stable and Spanish stores are excluded without losing translated guides", () => {
  const entries = sitemap();
  assert.deepEqual(entries, sitemap());
  assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length);
  assert.ok(entries.every((entry) => /^\d{4}-\d{2}-\d{2}$/.test(String(entry.lastModified))));
  assert.ok(!entries.some((entry) => entry.url.includes("/es/stores/")));
  for (const store of stores) {
    const entry = entries.find((entry) => entry.url === `${SITE_URL}/stores/${store.slug}`)!;
    assert.ok(entry); assert.equal(entry.alternates, undefined);
    assert.equal(entry.lastModified, store.verified_at && store.verified_at > "2026-11-21" ? store.verified_at : "2026-11-21");
  }
  for (const path of ["/", "/guide/visiting", "/guide/wholesale-basics", "/guide/buying-checklist", "/guide/wholesale-toys-los-angeles", "/photos", "/about", "/privacy", "/contact", ...Object.keys(buyerGuides).map(slug => `/guide/for/${slug}`)]) {
    for (const locale of ["en", "es"] as const) {
      const entry = entries.find(entry => entry.url === `${SITE_URL}${localePath(locale, path)}`)!;
      assert.ok(entry?.alternates?.languages?.es);
      if (path.includes("wholesale-toys-los-angeles")) assert.equal(entry.priority, 0.9);
    }
  }
});

test("store canonicals remain self-referential with no hreflang and only ES noindexed", () => {
  for (const locale of ["en", "es"] as const) {
    const meta = storeMeta("/stores/example", locale, "Example", "Description");
    assert.equal(meta.alternates?.canonical, localePath(locale, "/stores/example"));
    assert.equal(meta.alternates?.languages, undefined);
    assert.deepEqual(meta.robots, locale === "es" ? { index: false, follow: true } : undefined);
  }
  assert.ok(altMeta("/guide/visiting", "es", "Guide", "Description").alternates?.languages?.es);
});

test("Article and breadcrumbs reflect every guide's locale and canonical; FAQ mirrors visible content", () => {
  const guides = [["/guide/visiting", visiting], ["/guide/wholesale-basics", wholesaleBasics], ["/guide/buying-checklist", buyingChecklist], ["/guide/wholesale-toys-los-angeles", wholesaleToys], ...Object.entries(buyerGuides).map(([slug, guide]) => [`/guide/for/${slug}`, guide] as const)] as const;
  for (const [path, translations] of guides) for (const locale of ["en", "es"] as const) {
    const guide = translations[locale];
    const article = articleJsonLd(guide, locale, path);
    assert.equal(article.headline, guide.title); assert.equal(article.inLanguage, locale);
    assert.equal(article.mainEntityOfPage["@id"], `${SITE_URL}${localePath(locale, path)}`);
    assert.equal(article.publisher.url, SITE_URL); assert.equal(article.author.name, "LA Toy District");
    assert.match(article.dateModified, /^\d{4}-\d{2}-\d{2}$/);
    const crumbs = breadcrumbJsonLd(locale, path, guide.title).itemListElement;
    assert.equal(crumbs.length, 2); assert.equal(crumbs[1].name, guide.title);
    assert.equal(crumbs[0].name, locale === "es" ? "Inicio" : "Home");
    if (guide.faq) assert.deepEqual(faqJsonLd(guide.faq).mainEntity.map(q => q.acceptedAnswer.text), guide.faq.map(q => q.a));
  }
  assert.equal(storeJsonLd(stores[0]).name, stores[0].name);
});

test("landing guide counts match directory filters and published claims retain citations", () => {
  for (const { category, count } of categoryCounts) assert.equal(count, filterStores(stores, { ...emptyFilters, category }).length);
  for (const { block, count } of streetCounts) assert.equal(count, filterStores(stores, { ...emptyFilters, block }).length);
  for (const locale of ["en", "es"] as const) {
    const guide = wholesaleToys[locale];
    for (const store of listedStores) for (const fact of store.online_facts ?? []) {
      if (fact.source.type !== "business" || !["buying", "minimum_order", "services"].includes(fact.kind)) continue;
      const section = guide.sections.find(section => section.h === store.name)!;
      assert.ok(section.ps.includes(fact.text[locale]));
      assert.ok(section.sources?.some(source => source.href === fact.source.url && source.checked_at === fact.source.checked_at));
    }
    for (const section of guide.sections) for (const link of section.links ?? []) {
      if (link.href.startsWith("/stores/")) assert.ok(stores.some(store => link.href === `/stores/${store.slug}`));
      if (link.href.startsWith("/?")) assert.ok(filterStores(stores, { ...emptyFilters, category: new URL(link.href, SITE_URL).searchParams.get("cat") ?? "", block: new URL(link.href, SITE_URL).searchParams.get("street") ?? "" }).length);
    }
  }
});
