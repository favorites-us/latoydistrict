// Reviewed evidence lives outside generated stores.json and survives rebuilding.
import fs from "node:fs";
import { z } from "zod";

const httpUrl = z.string().url().refine((value) => {
  const u = new URL(value);
  return ["http:", "https:"].includes(u.protocol) && !u.username && !u.password;
}, "Expected a public http(s) URL");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Invalid calendar date");
const text = z.string().trim().min(1);
const equal = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const categories = z.array(z.enum(["toys", "plush", "figures", "party", "seasonal", "electronics", "gifts", "general"])).min(1);
const salesMode = z.enum(["wholesale", "retail", "both", "unknown"]);
const phone = z.string().refine((value) => /^[+()\d .-]+$/.test(value) && /^(1)?\d{10}$/.test(value.replace(/[^\d]/g, "")), "Expected a US business phone");
const links = z.object({
  website: httpUrl.optional(), facebook: httpUrl.optional(), instagram: httpUrl.optional(),
  whatsapp: httpUrl.optional(), yelp: httpUrl.optional(), other: z.array(httpUrl).optional(),
}).strict();

export const SourceSchema = z.object({
  url: httpUrl.refine((value) => !/(^|\.)(google\.[a-z.]+|googleapis\.com|g\.page|goo\.gl)$/.test(new URL(value).hostname), "Google listing sources are excluded by project policy"),
  type: z.enum(["business", "directory", "manufacturer"]), label: text, checked_at: date,
}).strict().superRefine((source, ctx) => {
  const host = new URL(source.url).hostname;
  const directories = ["yellowpages.com", "loc8nearme.com", "411.info", "yelp.com", "cylex.us.com", "localsearch.com"];
  if (source.type === "business" && directories.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A directory domain cannot be labeled business-owned" });
  }
});

export const OnlineFactSchema = z.object({
  id: text,
  kind: z.enum(["buying", "minimum_order", "services", "products", "manufacturer_listing"]),
  text: z.object({ en: text, es: text }).strict(),
  scope: text, source: SourceSchema,
  additional_sources: z.array(SourceSchema).optional(),
  minimum_order_value: z.object({ amount: z.number().positive(), currency: z.literal("USD") }).strict().optional(),
}).strict().superRefine((fact, ctx) => {
  for (const source of [fact.source, ...(fact.additional_sources || [])]) {
    if (source.type === "directory" || (source.type === "manufacturer" && fact.kind !== "manufacturer_listing")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Directory facts are phone-only; manufacturer evidence is listing-only" });
    }
  }
  if ((fact.kind === "minimum_order") !== Boolean(fact.minimum_order_value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "A minimum order fact must specify amount and currency" });
  }
});

const Identity = z.object({ name: text, line1: text, unit: z.string().nullable(), zip: text }).strict();
const LegacyValues = z.object({
  phone: z.string().optional(), hours: text.optional(), links: links.optional(),
  wechat: text.optional(), languages: z.array(text).optional(), payment: z.array(text).optional(),
  moq: text.optional(), resale_cert_required: z.boolean().optional(), verified_at: date.optional(),
  category: categories.optional(), wholesale_retail: salesMode.optional(),
  coordinates: z.object({ lat: z.number().nullable(), lng: z.number().nullable() }).strict().optional(),
  mentions: z.array(z.object({ source: text, url: httpUrl, note: z.string() }).strict()).optional(),
  sources: z.array(text).optional(), confidence: z.enum(["high", "medium", "low"]).optional(),
}).strict();
const LegacySchema = z.object({
  version: z.literal(1), note: text,
  entries: z.array(z.object({ id: text, identity: Identity, values: LegacyValues }).strict()),
}).strict();

const fieldTypes = {
  phone, hours: text.nullable(), "links.website": httpUrl, contact_email: z.string().email(),
  wholesale_retail: salesMode, languages: z.array(text).min(1), category: categories,
};
const Update = z.discriminatedUnion("field", Object.entries(fieldTypes).map(([field, schema]) => z.object({
  field: z.literal(field), value: schema, previous: schema.nullable(),
  change_type: z.enum(["new_fill", "reconfirm", "correction"]), scope: text, source: SourceSchema,
}).strict())).superRefine((update, ctx) => {
  if (update.source.type === "manufacturer" || (update.source.type === "directory" && update.field !== "phone")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "This source cannot supply this field" });
  }
  if (update.source.type === "directory" && update.change_type !== "new_fill") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Directory phones may only fill blanks; never replace or relabel an existing phone" });
  }
  const expected = update.previous === null ? "new_fill" : equal(update.value, update.previous) ? "reconfirm" : "correction";
  if (update.value === null && update.previous === null) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "An empty value cannot fill an empty field" });
  if (update.change_type !== expected) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Incorrect change_type" });
});
const ReviewSchema = z.object({
  version: z.literal(1),
  entries: z.array(z.object({
    id: text, identity: Identity, decision: z.literal("approved"), reviewer: text,
    business_domains: z.array(z.string().regex(/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/)),
    identity_evidence: text, updates: z.array(Update), facts: z.array(OnlineFactSchema),
  }).strict()),
}).strict();

const normalize = (value) => String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
export function identityOf(store) {
  return { name: store.name, line1: store.address.line1, unit: store.address.unit, zip: store.address.zip };
}
function matchEntry(byId, entry) {
  const store = byId.get(entry.id);
  if (!store) throw new Error(`Reviewed store missing from input: ${entry.id}. Reconcile the ID before rebuilding.`);
  const current = identityOf(store);
  if (Object.keys(current).some((key) => normalize(current[key]) !== normalize(entry.identity[key]))) {
    throw new Error(`Identity mismatch: ${entry.id}. Name, address, suite and ZIP must match.`);
  }
  return store;
}
function unique(values, description) {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${description}`);
}

export function assertBaselineInventory(current, baseline) {
  unique(current.map((s) => s.id), "current store ID");
  if (current.length !== baseline.length) throw new Error("Directory inventory changed; reconcile and refresh the baseline before applying contacts.");
  const byId = new Map(current.map((s) => [s.id, s]));
  for (const store of baseline) matchEntry(byId, { id: store.id, identity: identityOf(store) });
}

export function applyReviewedData(input, legacyInput, reviewInput) {
  const legacy = LegacySchema.parse(legacyInput);
  const reviews = ReviewSchema.parse(reviewInput);
  const stores = structuredClone(input);
  unique(stores.map((s) => s.id), "store ID");
  unique(legacy.entries.map((s) => s.id), "legacy ID");
  unique(reviews.entries.map((s) => s.id), "review ID");
  const byId = new Map(stores.map((s) => [s.id, s]));
  const reviewById = new Map(reviews.entries.map((s) => [s.id, s]));
  // One-time migration of existing enrichment. This does not mark it verified.
  for (const entry of legacy.entries) {
    const store = matchEntry(byId, entry);
    const { coordinates, links: inheritedLinks, sources: inheritedSources, ...values } = entry.values;
    // Registry rebuilds leave contacts blank. If another input provides a
    // different contact, never silently hide that conflict behind the baseline.
    const contacts = ["phone", "hours", "wechat", "languages", "payment", "moq", "resale_cert_required", "verified_at"];
    const checkInherited = (field, current, inherited) => {
      if (current == null || inherited == null || equal(current, inherited)) return;
      const approved = reviewById.get(entry.id)?.updates.find((update) => update.field === field);
      if (!approved || !equal(current, approved.value)) {
        throw new Error(`Unexpected current value: ${entry.id}.${field}. Review the conflict with inherited data.`);
      }
    };
    for (const field of contacts) checkInherited(field, store[field], values[field]);
    for (const [key, value] of Object.entries(inheritedLinks || {})) checkInherited(`links.${key}`, store.links?.[key], value);
    Object.assign(store, structuredClone(values));
    if (inheritedLinks) store.links = { ...structuredClone(inheritedLinks), ...(store.links || {}) };
    if (inheritedSources) store.sources = [...new Set([...inheritedSources, ...(store.sources || [])])];
    if (coordinates) {
      for (const key of ["lat", "lng"]) if (coordinates[key] != null) store.address[key] = coordinates[key];
    }
  }
  for (const entry of reviews.entries) {
    const store = matchEntry(byId, entry);
    unique(entry.updates.map((u) => u.field), `updated field for ${entry.id}`);
    unique(entry.facts.map((f) => f.id), `fact ID for ${entry.id}`);
    const evidenceSources = [...entry.updates, ...entry.facts].map((item) => item.source)
      .concat(entry.facts.flatMap((fact) => fact.additional_sources || []));
    for (const source of evidenceSources) {
      const host = new URL(source.url).hostname;
      if (source.type === "business" && !entry.business_domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
        throw new Error(`Business source domain not reviewed for ${entry.id}: ${host}`);
      }
    }
    for (const update of entry.updates) {
      if (update.field === "links.website") {
        const host = new URL(update.value).hostname;
        if (!entry.business_domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
          throw new Error(`Website value domain not reviewed for ${entry.id}: ${host}`);
        }
      }
      const current = update.field === "links.website" ? store.links?.website : store[update.field];
      if (!equal(current, update.previous) && !equal(current, update.value)) {
        throw new Error(`Unexpected current value: ${entry.id}.${update.field}. Review the conflict before replacing it.`);
      }
      if (update.field === "links.website") store.links = { ...(store.links || {}), website: update.value };
      else store[update.field] = structuredClone(update.value);
      store.field_sources = { ...(store.field_sources || {}), [update.field]: structuredClone(update.source) };
    }
    store.online_facts = structuredClone(entry.facts);
    if (entry.updates.length || entry.facts.length) store.sources = [...new Set([...store.sources, "web"])];
    // verified_at is intentionally untouched: an online check is not a visit.
  }
  return stores;
}

const read = (name) => JSON.parse(fs.readFileSync(new URL(`./data/${name}`, import.meta.url), "utf8"));
export function readBaselineStores() {
  const baseline = read("enrichment-baseline.json");
  if (baseline.version !== 1 || !Array.isArray(baseline.stores)) throw new Error("Invalid directory baseline");
  if (baseline.stores.some((s) => s.online_facts || s.field_sources || s.contact_email)) {
    throw new Error("Baseline must not contain generated review fields");
  }
  return baseline.stores;
}
export function loadReviewedData(stores) {
  const fields = Object.keys(LegacyValues.shape).filter((key) => key !== "coordinates");
  const entries = readBaselineStores().map((store) => ({
    id: store.id, identity: identityOf(store),
    values: {
      ...Object.fromEntries(fields.filter((key) => store[key] != null).map((key) => [key, store[key]])),
      coordinates: { lat: store.address.lat, lng: store.address.lng },
    },
  }));
  return applyReviewedData(stores, { version: 1, note: "Inherited enrichment; not newly verified", entries }, read("reviewed-stores.json"));
}
