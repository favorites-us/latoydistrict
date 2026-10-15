import { parseAddress } from "./lib.mjs";

const PLAUSIBLE_SHOPS = new Set([
  "toys", "gift", "variety_store", "wholesale", "department_store", "party",
  "convenience", "cosmetics", "stationery", "craft", "general", "houseware",
  "electronics", "mobile_phone", "games", "collector", "interior_decoration",
]);

function normalizeStreet(value = "") {
  return value.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(STREET|ST\.)\b/g, "ST").replace(/\b(AVENUE|AVE\.)\b/g, "AVE")
    .replace(/\b(PLACE|PL\.)\b/g, "PL").replace(/\bEAST\b/g, "E")
    .replace(/\bSOUTH\b/g, "S").replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeName(value = "") {
  return value.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " AND ").replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\b(LLC|INC|INCORPORATED|CORP|CORPORATION|LTD|COMPANY|CO)\b/g, " ")
    .replace(/\s+/g, " ").trim();
}

function nameSimilarity(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return { accepted: false, score: 0 };
  if (left.includes(right) || right.includes(left)) return { accepted: true, score: 1 };
  const aa = new Set(left.split(" "));
  const bb = new Set(right.split(" "));
  const intersection = [...aa].filter((token) => bb.has(token)).length;
  const score = intersection / new Set([...aa, ...bb]).size;
  return { accepted: score >= 0.6, score };
}

export function osmMatch(store, element) {
  const tags = element.tags || {};
  if (!PLAUSIBLE_SHOPS.has(tags.shop)) return null;
  const parsed = parseAddress(store.address.line1);
  const sameAddress = parsed && String(parsed.num) === String(tags["addr:housenumber"] || "").trim()
    && normalizeStreet(parsed.street) === normalizeStreet(tags["addr:street"]);
  const similarity = nameSimilarity(store.name, tags.name);
  const unit = (value) => String(value ?? "").replace(/^(?:#|SUITE|STE|UNIT)\s*/i, "").trim().toUpperCase();
  if (!sameAddress || !similarity.accepted || unit(store.address.unit) !== unit(tags["addr:unit"])) return null;
  return `name + address + suite (${similarity.score.toFixed(2)})`;
}
