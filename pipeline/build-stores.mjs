// Validate + finalize → data/stores.json (the single source of truth the site builds from).

import { z } from "zod";
import { titleCase, slugify } from "./lib.mjs";
import { loadReviewedData } from "./reviewed-data.mjs";
import { StoreSchema } from "./store-schema.mjs";

export function buildStores(enriched) {
  const stores = [];
  const usedSlugs = new Set();
  for (const e of enriched) {
    const name = titleCase(e.display_name);
    let slug = slugify(`${name}-${e.num}`);
    while (usedSlugs.has(slug)) slug += "-2";
    usedSlugs.add(slug);
    const line1 = titleCase(`${e.num} ${e.street}`).replace(/\b(\d+)(st|nd|rd|th)\b/gi, (m, n, s) => n + s.toLowerCase());
    stores.push({
      id: slug,
      slug,
      name,
      name_es: null, // proper names stay as-is; ES pages translate UI, not names
      address: {
        line1,
        unit: e.unit ?? null,
        zip: e.zip || "90013",
        lat: e.coords?.lat ?? null,
        lng: e.coords?.lng ?? null,
      },
      block: e.block,
      category: e.category,
      wholesale_retail: e.wholesale_retail,
      naics: e.naics,
      place_id: e.place_id,
      phone: null,
      hours: null,
      wechat: null,
      languages: null,
      payment: null,
      moq: null,
      resale_cert_required: null,
      mentions: [],
      sources: ["opendata", ...(e.place_id ? ["places"] : [])],
      confidence: e.confidence,
      since: e.start_date,
      verified_at: null,
      status: "unverified",
    });
  }

  const parsed = z.array(StoreSchema).parse(loadReviewedData(stores));
  const rank = { high: 0, medium: 1, low: 2 };
  parsed.sort((a, b) => rank[a.confidence] - rank[b.confidence] || a.name.localeCompare(b.name));
  return parsed;
}
