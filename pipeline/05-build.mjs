// Validate + finalize → data/stores.json (the single source of truth the site builds from).
import fs from "node:fs";
import { z } from "zod";
import { readOut, titleCase, slugify } from "./lib.mjs";

const Store = z.object({
  id: z.string(),
  slug: z.string().min(1),
  name: z.string().min(1),
  name_es: z.string().nullable(),
  address: z.object({
    line1: z.string(),
    unit: z.string().nullable(),
    zip: z.string(),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }),
  block: z.enum(["winston", "boyd", "werdin", "wall", "3rd", "4th", "5th", "los-angeles", "san-pedro"]),
  category: z.array(z.enum(["toys", "plush", "figures", "party", "seasonal", "electronics", "gifts", "general"])).min(1),
  wholesale_retail: z.enum(["wholesale", "retail", "both", "unknown"]),
  naics: z.string().nullable(),
  place_id: z.string().nullable(),
  phone: z.string().nullable(),
  hours: z.string().nullable(),
  links: z.object({
    website: z.string().optional(),
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    whatsapp: z.string().optional(),
    yelp: z.string().optional(),
    other: z.array(z.string()).optional(),
  }).optional(),
  wechat: z.string().nullable(),
  languages: z.array(z.string()).nullable(),
  payment: z.array(z.string()).nullable(),
  moq: z.string().nullable(),
  resale_cert_required: z.boolean().nullable(),
  mentions: z.array(z.object({ source: z.string(), url: z.string(), note: z.string() })),
  sources: z.array(z.enum(["opendata", "places", "social", "visit", "census", "osm", "web"])).min(1),
  confidence: z.enum(["high", "medium", "low"]),
  since: z.string().nullable(),
  verified_at: z.string().nullable(),
  status: z.enum(["open", "unverified", "closed"]),
});

const enriched = readOut("enriched.json");

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

const parsed = z.array(Store).parse(stores);
parsed.sort((a, b) => (a.confidence === b.confidence ? a.name.localeCompare(b.name) : a.confidence.localeCompare(b.confidence)));
// high < low < medium alphabetically — sort by explicit rank instead
const rank = { high: 0, medium: 1, low: 2 };
parsed.sort((a, b) => rank[a.confidence] - rank[b.confidence] || a.name.localeCompare(b.name));

fs.mkdirSync(new URL("../data/", import.meta.url), { recursive: true });
fs.writeFileSync(
  new URL("../data/stores.json", import.meta.url),
  JSON.stringify({ generated_note: "built by pipeline/, do not edit by hand", stores: parsed }, null, 2),
);
console.log(`data/stores.json: ${parsed.length} stores`);
console.log("confidence:", parsed.reduce((acc, s) => ((acc[s.confidence] = (acc[s.confidence] || 0) + 1), acc), {}));
