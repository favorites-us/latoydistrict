// Merge researched contact data (business's OWN web presence only — see
// pipeline/CONTACT-RESEARCH.md) into data/stores.json. Conservative and
// idempotent: never overwrites an existing value, only fills blanks, and
// only accepts http(s) URLs. Input: pipeline/out/contacts.json.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { OUT_DIR } from "./lib.mjs";

const DATA_FILE = fileURLToPath(new URL("../web/data/stores.json", import.meta.url));
const CONTACTS_FILE = path.join(OUT_DIR, "contacts.json");
const DRY = process.argv.includes("--dry");

const filled = (v) => v !== null && v !== undefined && v !== "";
const httpUrl = (u) => {
  if (typeof u !== "string") return null;
  try {
    const p = new URL(u.trim());
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : null;
  } catch {
    return null;
  }
};
// Keep 7+ digits so we don't accept junk; strip nothing, store as researched.
const looksLikePhone = (v) => typeof v === "string" && (v.match(/\d/g) || []).length >= 7;

if (!fs.existsSync(CONTACTS_FILE)) {
  console.error(`Missing ${CONTACTS_FILE}. Run the contact research first (see pipeline/CONTACT-RESEARCH.md).`);
  process.exit(1);
}

const document = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const stores = structuredClone(document.stores);
const byId = new Map(stores.map((s) => [s.id, s]));
const contacts = JSON.parse(fs.readFileSync(CONTACTS_FILE, "utf8"));
const results = Array.isArray(contacts) ? contacts : contacts.results || [];

const LINK_KEYS = ["website", "facebook", "instagram", "whatsapp", "yelp"];
let touched = 0, phones = 0, hoursN = 0, linkN = 0, unknownIds = 0;

for (const r of results) {
  const store = byId.get(r.id);
  if (!store) { unknownIds++; continue; }
  let changed = false;

  if (!filled(store.phone) && looksLikePhone(r.phone)) { store.phone = r.phone.trim(); phones++; changed = true; }
  if (!filled(store.hours) && filled(r.hours)) { store.hours = String(r.hours).trim(); hoursN++; changed = true; }

  const incoming = r.links || {};
  const links = { ...(store.links || {}) };
  for (const key of LINK_KEYS) {
    const url = httpUrl(incoming[key]);
    if (url && !filled(links[key])) { links[key] = url; linkN++; changed = true; }
  }
  const others = [...(links.other || [])];
  for (const raw of incoming.other || []) {
    const url = httpUrl(raw);
    if (url && !others.includes(url)) { others.push(url); linkN++; changed = true; }
  }
  if (others.length) links.other = others;
  if (Object.keys(links).length) store.links = links;

  // Provenance: cite where phone/hours came from so it's auditable in committed data.
  const prov = httpUrl(r.provenance);
  if (prov && (phones || hoursN) && changed && !(store.mentions || []).some((m) => m.url === prov)) {
    store.mentions = [...(store.mentions || []), { source: "web", url: prov, note: r.notes ? String(r.notes).slice(0, 200) : "business contact info" }];
  }

  if (changed) {
    if (!store.sources.includes("web")) store.sources.push("web");
    if (store.confidence === "low") store.confidence = "medium";
    touched++;
  }
}

console.log(`Contact results: ${results.length}`);
console.log(`Stores touched: ${touched}  (phones +${phones}, hours +${hoursN}, links +${linkN})`);
if (unknownIds) console.log(`WARNING: ${unknownIds} result ids not found in stores.json`);

if (DRY) {
  console.log("Dry run: data/stores.json not written");
} else {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify({ ...document, stores }, null, 2)}\n`);
  console.log("wrote data/stores.json");
}
