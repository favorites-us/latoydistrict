// Merge open-data registrations into one master list:
//  - collapse duplicate registrations (same name at same street number)
//  - attach place_id from Places reconciliation when a confident match exists
import { readOut, writeOut } from "./lib.mjs";

const opendata = readOut("opendata.json");
const places = readOut("places.json");

function normName(s) {
  return (s || "")
    .toUpperCase()
    .replace(/\b(LLC|INC|CORP|CORPORATION|LTD|CO|COMPANY)\b\.?/g, "")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();
}

// group registrations: same normalized display name + same street number & street
const groups = new Map();
for (const r of opendata) {
  const display = r.dba_name || r.legal_name;
  const key = `${normName(display)}|${r.num}|${r.street}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(r);
}

const master = [];
for (const regs of groups.values()) {
  regs.sort((a, b) => (a.start_date || "").localeCompare(b.start_date || ""));
  const base = regs[regs.length - 1]; // most recent registration wins for fields
  const coords = regs.map((r) => r.coords).find(Boolean) || null;
  master.push({
    ...base,
    coords,
    display_name: base.dba_name || base.legal_name,
    registrations: regs.length,
    place_id: null,
    business_status: null,
  });
}

// attach place_id: match by street number + fuzzy name token overlap
function tokens(s) {
  return new Set(normName(s).split(" ").filter((t) => t.length > 2));
}
let matched = 0;
for (const p of places) {
  const numMatch = p.match_address.match(/^(\d+)/);
  const pNum = numMatch ? Number(numMatch[1]) : null;
  const pTok = tokens(p.match_name);
  let best = null;
  let bestScore = 0;
  for (const m of master) {
    if (pNum && m.num !== pNum) continue;
    const mTok = tokens(m.display_name);
    const overlap = [...pTok].filter((t) => mTok.has(t)).length;
    const score = overlap / Math.max(1, Math.min(pTok.size, mTok.size));
    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  if (best && bestScore >= 0.6) {
    best.place_id = p.place_id;
    best.business_status = p.business_status;
    matched++;
  }
}
console.log(`place_id matched: ${matched}/${places.length}`);

writeOut("master.json", master);
