// Source 1 (primary): LA City Office of Finance — Listing of Active Businesses.
// Public record → free to store and display. https://data.lacity.org/resource/6rrh-rzua
import { writeOut, parseAddress, matchStreet, coordsOf, inBbox } from "./lib.mjs";

const URL =
  "https://data.lacity.org/resource/6rrh-rzua.json?" +
  new URLSearchParams({ $where: "starts_with(zip_code,'90013')", $limit: "50000" });

const res = await fetch(URL);
if (!res.ok) throw new Error(`Socrata ${res.status}`);
const all = await res.json();
console.log(`90013 active businesses: ${all.length}`);

const records = [];
for (const b of all) {
  const parsed = parseAddress(b.street_address);
  const street = matchStreet(parsed);
  if (!street) continue;
  const coords = coordsOf(b);
  // coords are a backstop: keep records with no/broken coords if the street matched,
  // drop records whose valid coords fall outside the district.
  if (coords && !inBbox(coords)) continue;
  records.push({
    account: b.location_account,
    legal_name: (b.business_name || "").trim(),
    dba_name: (b.dba_name || "").trim() || null,
    address_raw: (b.street_address || "").trim(),
    num: parsed.num,
    street: parsed.street,
    unit: parsed.unit,
    block: street.block,
    zip: (b.zip_code || "").slice(0, 5),
    naics: b.naics || null,
    naics_desc: b.primary_naics_description || null,
    start_date: (b.location_start_date || "").slice(0, 10) || null,
    coords,
  });
}

writeOut("opendata.json", records);
const byBlock = {};
records.forEach((r) => (byBlock[r.block] = (byBlock[r.block] || 0) + 1));
console.log("by block:", byBlock);
