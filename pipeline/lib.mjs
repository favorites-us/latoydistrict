import fs from "node:fs";
import path from "node:path";

export const OUT_DIR = new URL("./out/", import.meta.url).pathname;

export function readOut(name) {
  return JSON.parse(fs.readFileSync(path.join(OUT_DIR, name), "utf8"));
}

export function writeOut(name, data) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2));
  console.log(`wrote ${name} (${Array.isArray(data) ? data.length + " records" : "object"})`);
}

// Toy District: 3rd St (N) to 5th St (S), Los Angeles St (W) to San Pedro St (E), DTLA 90013.
// Bounding box derived from actual coordinates of NAICS 423920 registrations (see docs).
export const BBOX = { latMin: 34.0425, latMax: 34.0495, lngMin: -118.249, lngMax: -118.2395 };

// Street → block slug + allowed address-number range (backstop against long streets
// like 3rd/5th St that run far beyond the district).
export const STREETS = [
  { re: /\bWINSTON\s+ST/i, block: "winston", min: 150, max: 599 },
  { re: /\bBOYD\s+ST/i, block: "boyd", min: 150, max: 599 },
  { re: /\bWERDIN\s+PL/i, block: "werdin", min: 100, max: 599 },
  { re: /\bWALL\s+ST/i, block: "wall", min: 300, max: 599 },
  { re: /\bE\s+3RD\s+ST/i, block: "3rd", min: 200, max: 599 },
  { re: /\bE\s+4TH\s+ST/i, block: "4th", min: 200, max: 599 },
  { re: /\bE\s+5TH\s+ST/i, block: "5th", min: 200, max: 599 },
  { re: /\bS\s+LOS\s+ANGELES\s+ST/i, block: "los-angeles", min: 300, max: 599 },
  { re: /\bS\s+SAN\s+PEDRO\s+ST/i, block: "san-pedro", min: 300, max: 599 },
];

// Normalize "225 WINSTON STREET SUITE #1" → { num: 225, street: "WINSTON ST", unit: "1" }
export function parseAddress(raw) {
  if (!raw) return null;
  let s = raw
    .toUpperCase()
    .replace(/\s+/g, " ")
    .replace(/\bSTREET\b/g, "ST")
    .replace(/\bPLACE\b/g, "PL")
    .replace(/\bEAST\b/g, "E")
    .replace(/\bSOUTH\b/g, "S")
    .trim();
  const unitMatch = s.match(/\b(?:UNIT|SUITE|STE|SPC|SPACE|APT|#)\s*#?\s*([\w-]+)\s*$/);
  let unit = null;
  if (unitMatch) {
    unit = unitMatch[1];
    s = s.slice(0, unitMatch.index).trim();
  }
  // trailing bare "#P-23"
  const hash = s.match(/#\s*([\w-]+)\s*$/);
  if (hash) {
    unit = unit ?? hash[1];
    s = s.slice(0, hash.index).trim();
  }
  const m = s.match(/^(\d+)\s+(.+)$/);
  if (!m) return null;
  return { num: Number(m[1]), street: m[2], unit };
}

export function matchStreet(parsed) {
  if (!parsed) return null;
  for (const st of STREETS) {
    if (st.re.test(parsed.street)) {
      if (parsed.num >= st.min && parsed.num <= st.max) return st;
      return null;
    }
  }
  return null;
}

export function coordsOf(rec) {
  const l = rec.location_1;
  if (!l || !l.latitude || !l.longitude) return null;
  const lat = Number(l.latitude);
  const lng = Number(l.longitude);
  // known data glitches: lng === lat, zeros, positive longitude
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lng >= 0 || lat === lng) return null;
  return { lat, lng };
}

export function inBbox(c) {
  return (
    c && c.lat >= BBOX.latMin && c.lat <= BBOX.latMax && c.lng >= BBOX.lngMin && c.lng <= BBOX.lngMax
  );
}

export function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m, c) => c.toUpperCase())
    .replace(/\b(Llc|Inc|Corp|Ltd|Co)\b\.?/g, (m) => m.toUpperCase().replace(".", ""))
    .replace(/'([A-Z])/g, (m, c) => `'${c.toLowerCase()}`)
    .trim();
}

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
