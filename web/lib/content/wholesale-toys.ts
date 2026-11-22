import { stores, BLOCK_LABELS } from "../stores";
import { CATEGORIES } from "../buyer-tools";
import { catLabel, t, type Locale } from "../i18n";
import { streetGroups } from "../directory-navigation";
import { buyerGuides, type Guide, type GuideSection } from "./guides";

// Evaluated from committed data when these static guide routes are built.
// Match the directory's exclusion of closed listings; categories can overlap.
export const listedStores = stores.filter((store) => store.status !== "closed");
export const categoryCounts = CATEGORIES.map((category) => ({
  category, count: listedStores.filter((store) => store.category.includes(category)).length,
}));
export const streetCounts = Object.entries(BLOCK_LABELS).map(([block, label]) => ({
  block, label, count: listedStores.filter((store) => store.block === block).length,
})).filter(({ count }) => count > 0);

function guide(locale: Locale): Guide {
  const es = locale === "es";
  const toyStores = listedStores.filter(store => store.category.includes("toys"));
  const published: GuideSection[] = toyStores.flatMap((store) => {
    const facts = store.online_facts?.filter((fact) => (fact.source.type === "business" && ["products", "buying", "minimum_order", "services"].includes(fact.kind)) || (fact.source.type === "manufacturer" && fact.kind === "manufacturer_listing")) ?? [];
    if (!facts.length) return [];
    const sources = new Map(facts.flatMap((fact) => [fact.source, ...(fact.additional_sources ?? [])])
      .map((source) => [`${source.url}|${source.checked_at}|${source.label}`, { label: source.label, href: source.url, checked_at: source.checked_at }]));
    return [{ h: store.name, ps: facts.map((fact) => fact.text[locale]),
      links: [{ label: es ? `Ver ficha: ${store.name}` : `View listing: ${store.name}`, href: `/stores/${store.slug}` }],
      sources: [...sources.values()] }];
  });
  return {
    title: es ? "Juguetes al por mayor en Los Ángeles: dónde comprar" : "Wholesale toys in Los Angeles: where to buy",
    description: es
      ? "Explore las fichas del Toy District por categoría y calle, consulte condiciones de compra publicadas y prepare sus preguntas, documentos y recogida."
      : "Find Toy District business listings by category and street, review published buying terms, and plan your wholesale toy store visit, documents and pickup.",
    reviewed_at: "2026-11-22",
    published_at: "2026-11-19",
    updated_at: "2026-11-22",
    sections: [
      { h: es ? "Fichas de juguetes en el Toy District" : "Toy listings in the Toy District",
        ps: [es ? `${toyStores.length} fichas de juguetes: la clasificación proviene de registros comerciales y no confirma inventario ni condiciones de mayoreo.` : `${toyStores.length} toy listings: classification comes from business registration data and does not confirm inventory or wholesale terms.`],
        groups: streetGroups(toyStores, locale).map(({ block, stores }) => ({ h: BLOCK_LABELS[block], headingHref: `/street/${block}`, ps: [], links: stores.map(store => ({ label: `${store.name} — ${store.address.line1}${store.address.unit ? ` #${store.address.unit}` : ""}`, href: `/stores/${store.slug}` })) })) },
      { h: es ? "Proveedores de juguetes con información publicada de productos o compra" : "Toy suppliers with published product or buying information",
        ps: [es ? "Consulte las fuentes y confirme productos y condiciones directamente con cada negocio." : "Review the sources and confirm products and terms directly with each business."], groups: published },
      { h: es ? "Dónde buscar en el Toy District" : "Where to look in the Toy District",
        ps: [t(locale, "where_p"), es
          ? "Use estas calles para planear sus paradas. Las cifras cuentan fichas del directorio, no tiendas confirmadas como abiertas ni distribuidores autorizados. Confirme la ubicación y las condiciones de compra antes de ir."
          : "Use these streets to plan your stops. Counts represent directory listings, not confirmed open stores or authorized distributors. Confirm the location and buying terms before visiting."],
        links: streetCounts.map(({ block, label, count }) => ({ label: `${label}: ${count}`, href: `/street/${block}` })) },
      { h: es ? "Fichas por categoría" : "Business listings by category",
        ps: [es
          ? `${listedStores.length} fichas no están marcadas como cerradas. Las categorías pueden coincidir; una ficha puede aparecer en más de una. La clasificación no confirma inventario ni venta al mayoreo.`
          : `${listedStores.length} listings are not marked closed. Categories can overlap, so a listing may appear in more than one. Classification does not confirm inventory or wholesale purchasing.`],
        links: categoryCounts.filter(({ count }) => count > 0).map(({ category, count }) => ({
          label: `${catLabel(locale, category)}: ${count}`, href: `/?cat=${category}#directory`,
        })) },
      { h: es ? "Otros negocios del Toy District con condiciones de compra publicadas" : "Other Toy District merchants with published buying terms",
        ps: [], links: listedStores.filter(store => !store.category.includes("toys") && store.online_facts?.some(fact => fact.source.type === "business" && ["buying", "minimum_order", "services"].includes(fact.kind))).map(store => ({ label: store.name, href: `/stores/${store.slug}` })) },
      { h: es ? "Prepare su pedido y visita" : "Prepare your order and visit",
        ps: [es
          ? "Pregunte por unidades por caja, mínimos, formas de pago y documentos. Confirme el horario del día de su visita, el estacionamiento y cómo recogerá el pedido."
          : "Ask about case quantities, minimums, payment methods and documents. Confirm hours for your visit date, parking and how you will collect the order."],
        links: [
          { label: es ? "California: seller’s permit y resale certificate" : "California: seller’s permits and resale certificates", href: "/guide/wholesale-basics" },
          { label: es ? "Horarios, estacionamiento y recogida" : "Hours, parking and pickup", href: "/guide/visiting" },
          { label: t(locale, "worksheet_link"), href: "/guide/buying-checklist" },
          ...Object.entries(buyerGuides).map(([slug, guides]) => ({ label: guides[locale].title, href: `/guide/for/${slug}` })),
        ] },
    ],
    faq: es ? [
      { q: "¿Dónde puedo buscar juguetes al por mayor en Los Ángeles?", a: "Empiece con las fichas de juguetes del Toy District y filtre por calle. Los registros no confirman inventario ni condiciones de mayoreo; consulte al negocio antes de visitar." },
      { q: "¿Hay un pedido mínimo para todo el Toy District?", a: "Confirme la cantidad o el importe mínimo con cada negocio para su pedido. Un umbral de envío gratis no es un pedido mínimo." },
      { q: "¿Qué horario tienen las tiendas?", a: "Confirme con cada negocio el horario para el día de su visita y el plazo de recogida. Los horarios contradictorios siguen sin confirmar en el directorio." },
    ] : [
      { q: "Where can I look for wholesale toys in Los Angeles?", a: "Start with the Toy District toy listings and filter by street. Registration records do not confirm inventory or wholesale terms; contact the business before visiting." },
      { q: "Is there a minimum order for the whole Toy District?", a: "Confirm the minimum quantity or order amount with each business for your order. A free-shipping threshold is not a minimum order." },
      { q: "What hours are the stores open?", a: "Confirm each business’s hours for your visit date and its pickup deadline. Conflicting hours remain unconfirmed in the directory." },
    ],
  };
}

export const wholesaleToys: Record<Locale, Guide> = { en: guide("en"), es: guide("es") };
