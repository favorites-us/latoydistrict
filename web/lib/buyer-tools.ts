import type { Store } from "./stores";
import { BLOCK_LABELS } from "./stores";
import { catLabel, type Locale } from "./i18n";

export const SHORTLIST_LIMIT = 12;
export const SHORTLIST_KEY = "toy-district:shortlist:v1";
export const CATEGORIES = ["toys", "plush", "figures", "party", "seasonal", "electronics", "gifts", "general"] as const;

export function readShortlist(raw: string | null, knownSlugs: Set<string>): string[] {
  try {
    const parsed = JSON.parse(raw ?? "null");
    if (parsed?.version !== 1 || !Array.isArray(parsed.slugs)) return [];
    return [...new Set<string>(parsed.slugs.filter((slug: unknown) => typeof slug === "string" && knownSlugs.has(slug)))].slice(0, SHORTLIST_LIMIT);
  } catch { return []; }
}

export function hasBuyingInfo(store: Store): boolean {
  return !!store.online_facts?.some((fact) => fact.source.type === "business" && ["buying", "minimum_order", "services"].includes(fact.kind));
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\bstreet\b/g, "st");
}

export interface DirectoryFilters { query: string; category: string; block: string; info: boolean; contact: boolean }
export const emptyFilters: DirectoryFilters = { query: "", category: "", block: "", info: false, contact: false };

export function filterStores(stores: Store[], filters: DirectoryFilters): Store[] {
  const words = normalize(filters.query.trim()).split(/\s+/).filter(Boolean);
  return stores.filter((store) => {
    if (store.status === "closed") return false;
    if (filters.category && !store.category.some((cat) => cat === filters.category)) return false;
    if (filters.block && store.block !== filters.block) return false;
    if (filters.info && !hasBuyingInfo(store)) return false;
    if (filters.contact && !store.phone && !store.contact_email) return false;
    const haystack = normalize([store.name, store.address.line1, BLOCK_LABELS[store.block], store.address.unit, ...store.category.flatMap((cat) => [catLabel("en", cat), catLabel("es", cat)]), ...(store.online_facts ?? []).filter((fact) => fact.kind === "products").flatMap((fact) => [fact.text.en, fact.text.es])].join(" "));
    return words.every((word) => haystack.includes(word));
  });
}

export function makeQuoteDraft(locale: Locale, name: string, values: { items: string; quantity: string; date: string }): string {
  return locale === "es"
    ? `Hola ${name},\n\nQuisiera cotizar los siguientes productos:\n${values.items.trim() || "[artículo, marca y SKU]"}\nCantidad: ${values.quantity.trim() || "[unidades o cajas]"}\nFecha requerida: ${values.date.trim() || "[fecha]"}\n\n¿Pueden confirmar disponibilidad, precio por unidad/caja, pedido mínimo y requisitos de cuenta? Indiquen el total con impuestos y cargos aplicables, formas de pago, recogida o envío, vigencia de la cotización y condiciones de devolución.\n\nGracias.`
    : `Hello ${name},\n\nI'd like a quote for:\n${values.items.trim() || "[item, brand and SKU]"}\nQuantity: ${values.quantity.trim() || "[units or cases]"}\nNeeded by: ${values.date.trim() || "[date]"}\n\nCould you confirm availability, unit/case pricing, minimum order and account requirements? Please include the total with applicable tax and fees, payment options, pickup or shipping, quote validity and return terms.\n\nThank you.`;
}
