// Decide which businesses belong in a toy-district directory, and infer
// category / wholesale-vs-retail / confidence from NAICS + name signals.
import { readOut, writeOut } from "./lib.mjs";

const master = readOut("master.json");

const KW = {
  plush: /\b(PLUSH|STUFFED|TEDDY)\b/,
  figures: /\b(FIGURE|FIGURES|ANIME|COLLECTIBLE|COLLECTIBLES)\b/,
  party: /\b(PARTY|PINATA|PI[NÑ]ATA|BALLOON|BALLOONS|FIESTA|CANDY)\b/,
  seasonal: /\b(CHRISTMAS|HALLOWEEN|HOLIDAY|SEASONAL)\b/,
  electronics: /\b(ELECTRONIC|ELECTRONICS|R\/?C|REMOTE CONTROL|GADGET)\b/,
  toys: /\b(TOY|TOYS|JUGUETE|JUGUETES|DOLL|DOLLS|HOBBY|GAMES?)\b/,
  gifts: /\b(GIFT|GIFTS|NOVELTY|NOVELTIES|SOUVENIR)\b/,
};
const STRONG = new RegExp(
  Object.values(KW)
    .map((r) => r.source)
    .join("|"),
);
const WEAK = /\b(TRADING|IMPORT|IMPORTS|EXPORT|WHOLESALE|DISCOUNT|VARIETY|GENERAL MERCHANDISE)\b/;

// NAICS → { include, category, wr(wholesale_retail), conf }
// needsKw: registration codes too generic on their own — require a name signal too
const NAICS_RULES = [
  { pre: "423920", category: "toys", wr: "wholesale", conf: "high" }, // toy & hobby wholesale
  { pre: "451120", category: "toys", wr: "retail", conf: "high" }, // hobby/toy/game retail (2017 NAICS)
  { pre: "459120", category: "toys", wr: "retail", conf: "high" }, // (2022 NAICS)
  { pre: "423990", category: "general", wr: "wholesale", conf: "medium" }, // misc durable
  { pre: "424990", category: "general", wr: "wholesale", conf: "medium" }, // misc nondurable
  { pre: "4236", category: "electronics", wr: "wholesale", conf: "medium" },
  { pre: "452", category: "general", wr: "retail", conf: "medium" }, // general merchandise
  { pre: "453220", category: "gifts", wr: "retail", conf: "medium" },
  { pre: "425120", category: "general", wr: "wholesale", conf: "low", needsKw: true }, // agents & brokers
  { pre: "453990", category: "general", wr: "retail", conf: "low", needsKw: true },
  { pre: "454390", category: "party", wr: "wholesale", conf: "low", needsKw: true },
];
// physically in the district but out of directory scope unless the NAME says toys/party/gifts:
// services/real estate/food + off-topic goods (tobacco, apparel, vehicles, grocery, alcohol, drugs)
const EXCLUDE_NAICS = /^(531|812|722|721|621|541|515|512|511|611|811|485|713|623|624|522|523|524|92|4231|4241|4242|4243|4244|4245|4246|4247|4248|42494|315|445|446|448)/;

// "Kwan Pyo Hong"-style sole-proprietor registrations: real, but only directory-worthy
// when the NAICS or name says toys — otherwise they read as noise on the site.
function looksLikePersonName(s) {
  const words = s.trim().split(/\s+/);
  if (words.length < 2 || words.length > 3) return false;
  return words.every((w) => /^[A-Za-z'-]+$/.test(w)) && !/(INC|LLC|CORP|CO\b|TRADING|IMPORT|TOY|WHOLESALE|SUPPLY|SUPPLIES|GIFT|PARTY)/i.test(s);
}

function classify(m) {
  const name = `${m.display_name} ${m.legal_name}`.toUpperCase();
  const naics = m.naics || "";
  const strong = STRONG.test(name);
  const weak = WEAK.test(name);
  const rule = NAICS_RULES.find((r) => naics.startsWith(r.pre));

  if (EXCLUDE_NAICS.test(naics) && !strong) return null; // offices, lessors, restaurants...
  if (rule?.needsKw && !strong && !weak) return null;
  if (!rule && !strong && !(weak && naics.startsWith("42"))) return null;
  if (looksLikePersonName(m.display_name) && !strong && !naics.startsWith("423920")) return null;

  const categories = new Set();
  for (const [cat, re] of Object.entries(KW)) if (re.test(name)) categories.add(cat);
  if (categories.size === 0 && rule) categories.add(rule.category);
  if (categories.size === 0) categories.add("general");
  // "toys" subsumes nothing; but plush/figures imply toys context — keep as-is.

  let wr = rule?.wr ?? "unknown";
  if (/\bWHOLESALE\b/.test(name)) wr = wr === "retail" ? "both" : "wholesale";
  if (naics.startsWith("42")) wr = wr === "retail" ? "both" : "wholesale";

  let conf = rule?.conf ?? "low";
  if (strong && naics.startsWith("423920")) conf = "high";
  else if (strong) conf = conf === "low" ? "medium" : conf;
  if (m.business_status === "OPERATIONAL") conf = conf === "low" ? "medium" : "high";

  return { categories: [...categories], wr, conf };
}

const enriched = [];
let dropped = 0;
for (const m of master) {
  const c = classify(m);
  if (!c) {
    dropped++;
    continue;
  }
  if (m.business_status === "CLOSED_PERMANENTLY") {
    dropped++;
    continue;
  }
  enriched.push({ ...m, category: c.categories, wholesale_retail: c.wr, confidence: c.conf });
}

console.log(`kept ${enriched.length}, dropped ${dropped} (out of scope)`);
const byCat = {};
enriched.forEach((e) => e.category.forEach((c) => (byCat[c] = (byCat[c] || 0) + 1)));
console.log("by category:", byCat);
writeOut("enriched.json", enriched);
