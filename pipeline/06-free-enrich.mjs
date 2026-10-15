// Stage free public-data enrichment for review before updating the baseline:
// Census coordinates, conservatively matched OpenStreetMap details, and
// deterministic category signals from business names.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BBOX, OUT_DIR } from "./lib.mjs";
import { osmMatch } from "./osm-match.mjs";

const DATA_FILE = fileURLToPath(new URL("../web/data/stores.json", import.meta.url));
const CENSUS_DIR = path.join(OUT_DIR, "census");
const OVERPASS_FILE = path.join(OUT_DIR, "overpass-shops.json");
const DRY = process.argv.includes("--dry");
const USER_AGENT = "LAToyDistrictDirectory/1.0 (public-data enrichment; https://toydistrictlosangeles.com)";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const filled = (value) => value !== null && value !== undefined && value !== "";
// OSM tags are world-editable — only trust http(s) URLs, drop javascript:/data: etc.
const safeHttpUrl = (u) => {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
};
const addSource = (store, source) => {
  if (!store.sources.includes(source)) store.sources.push(source);
};

function metrics(stores) {
  const categories = {};
  for (const store of stores) {
    for (const category of store.category) categories[category] = (categories[category] || 0) + 1;
  }
  return {
    phone: stores.filter((s) => filled(s.phone)).length,
    hours: stores.filter((s) => filled(s.hours)).length,
    website: stores.filter((s) => filled(s.links?.website)).length,
    categories,
  };
}

function printMetrics(before, after, total) {
  const pct = (n) => `${((100 * n) / total).toFixed(1)}%`;
  console.log("\nFill rates");
  console.log("field          before          after");
  for (const key of ["phone", "hours", "website"]) {
    console.log(`${key.padEnd(14)} ${String(before[key]).padStart(3)}/${total} ${pct(before[key]).padStart(6)}   ${String(after[key]).padStart(3)}/${total} ${pct(after[key]).padStart(6)}`);
  }
  console.log("\nCategory distribution before:", before.categories);
  console.log("Category distribution after: ", after.categories);
  console.log(`general: ${before.categories.general || 0}/${total} ${pct(before.categories.general || 0)} -> ${after.categories.general || 0}/${total} ${pct(after.categories.general || 0)}`);
}

async function fetchJson(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { "User-Agent": USER_AGENT, ...options.headers },
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(1000 * attempt);
    }
  }
  throw lastError;
}

async function censusResponse(store) {
  fs.mkdirSync(CENSUS_DIR, { recursive: true });
  const cache = path.join(CENSUS_DIR, `${store.id}.json`);
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, "utf8"));
  const address = `${store.address.line1}, Los Angeles, CA ${store.address.zip}`;
  const params = new URLSearchParams({ address, benchmark: "Public_AR_Current", format: "json" });
  const result = await fetchJson(`https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?${params}`);
  fs.writeFileSync(cache, JSON.stringify(result, null, 2));
  await sleep(125);
  return result;
}

async function fetchOverpass() {
  if (fs.existsSync(OVERPASS_FILE)) return JSON.parse(fs.readFileSync(OVERPASS_FILE, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const query = `[out:json][timeout:25];(node["shop"](${BBOX.latMin},${BBOX.lngMin},${BBOX.latMax},${BBOX.lngMax});way["shop"](${BBOX.latMin},${BBOX.lngMin},${BBOX.latMax},${BBOX.lngMax}););out tags center;`;
  const result = await fetchJson("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    body: new URLSearchParams({ data: query }),
  });
  fs.writeFileSync(OVERPASS_FILE, JSON.stringify(result, null, 2));
  return result;
}


const NAME_CATEGORIES = [
  ["plush", /\b(PLUSH|STUFFED|TEDDY|PELUCHE|PELUCHES)\b/],
  ["figures", /\b(FIGURE|FIGURES|FIGURA|FIGURAS|ANIME|COLLECTIBLE|COLLECTIBLES)\b/],
  ["party", /\b(PARTY|FIESTA|PINATA|PI[NÑ]ATA|GLOBO|GLOBOS|BALLOON|BALLOONS|DULCE|DULCES|CANDY|QUINCEA[NÑ]ERA)\b/],
  ["seasonal", /\b(CHRISTMAS|NAVIDAD|HALLOWEEN|HOLIDAY|SEASONAL)\b/],
  ["electronics", /\b(ELECTRONIC|ELECTRONICS|ELECTRONICA|R\/?C|REMOTE CONTROL|GADGET)\b/],
  ["toys", /\b(TOY|TOYS|JUGUETE|JUGUETES|DOLL|DOLLS|MU[NÑ]ECA|MU[NÑ]ECAS|HOBBY|GAME|GAMES)\b/],
  ["gifts", /\b(GIFT|GIFTS|REGALO|REGALOS|NOVELTY|NOVELTIES|SOUVENIR|SOUVENIRS|STATIONERY|PAPELERIA|CRAFT|CRAFTS)\b/],
];

const document = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const stores = structuredClone(document.stores);
const before = metrics(stores);

let censusMatches = 0;
for (const [index, store] of stores.entries()) {
  const response = await censusResponse(store);
  const match = response.result?.addressMatches?.[0];
  const lat = Number(match?.coordinates?.y);
  const lng = Number(match?.coordinates?.x);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    store.address.lat = lat;
    store.address.lng = lng;
    addSource(store, "census");
    censusMatches++;
  }
  if ((index + 1) % 25 === 0 || index + 1 === stores.length) console.log(`Census: ${index + 1}/${stores.length}`);
}

const overpass = await fetchOverpass();
let osmMatches = 0;
const contactCandidates = [];
for (const store of stores) {
  const candidates = (overpass.elements || []).map((element) => ({ element, reason: osmMatch(store, element) })).filter((x) => x.reason);
  if (candidates.length !== 1) {
    if (candidates.length > 1) console.log(`OSM ambiguous, skipped: ${store.id} (${candidates.length} candidates)`);
    continue;
  }
  const { element, reason } = candidates[0];
  const tags = element.tags || {};
  const phone = tags.phone || tags["contact:phone"];
  const website = safeHttpUrl(tags.website || tags["contact:website"]);
  // Public map tags are discovery candidates, never owner-confirmed facts.
  contactCandidates.push({
    id: store.id, decision: "needs_review", matched_by: reason,
    discovered_at: new Date().toISOString().slice(0, 10),
    source_url: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    phone: phone || null, website, hours_hint: tags.opening_hours || null,
    note: "Verify identity and original sources under CONTACT-RESEARCH-C.md. Hours require the business website.",
  });
  osmMatches++;
  console.log(`OSM match: ${store.id} <- ${element.type}/${element.id} (${reason})`);
}

let categoryRefinements = 0;
for (const store of stores) {
  if (!(store.category.length === 1 && store.category[0] === "general")) continue;
  const categories = NAME_CATEGORIES.filter(([, pattern]) => pattern.test(store.name.toUpperCase())).map(([category]) => category);
  if (categories.length) {
    store.category = [...new Set(categories)];
    categoryRefinements++;
  }
}

const after = metrics(stores);
console.log(`\nCensus matches: ${censusMatches}/${stores.length}`);
console.log(`Accepted OSM matches: ${osmMatches}`);
console.log(`Name category refinements: ${categoryRefinements}`);
printMetrics(before, after, stores.length);

if (DRY) {
  console.log("\nDry run: candidate files not written");
} else {
  fs.writeFileSync(path.join(OUT_DIR, "osm-contact-candidates.json"), `${JSON.stringify({ results: contactCandidates }, null, 2)}\n`);
  fs.writeFileSync(path.join(OUT_DIR, "free-enrichment-candidates.json"), `${JSON.stringify({ generated_note: "Research candidates only; review coordinates/categories before deliberately updating the baseline. Strip generated online_facts/field_sources/contact_email; never copy the whole generated store into baseline.", stores }, null, 2)}\n`);
  console.log("wrote enrichment candidates to pipeline/out/; web/data/stores.json unchanged");
}
