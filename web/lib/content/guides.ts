// Reviewed EN/ES copy. Questions are preparation prompts, not merchant facts.
import type { Locale } from "../i18n";

export interface GuideLink { label: string; href: string }
export interface GuideSource extends GuideLink { checked_at: string }
export interface GuideSection {
  h: string;
  ps: string[];
  bullets?: string[];
  links?: GuideLink[];
  sources?: GuideSource[];
}
export interface Guide {
  title: string;
  description: string;
  reviewed_at: string;
  sections: GuideSection[];
  faq?: { q: string; a: string }[];
  worksheet?: boolean;
}

const reviewed_at = "2026-10-15";
const source = (label: string, href: string): GuideSource => ({ label, href, checked_at: reviewed_at });
const meters = source("LADOT: parking meters", "https://ladotparking.org/parking-meters/faq/");
const loading = source("LADOT: colored curb zones", "https://ladot.lacity.gov/residents/colored-curb-zones");
const transit = source("Metro: trip planner", "https://www.metro.net/riding/trip-planner/");
const resale = source("CDTFA: sales for resale", "https://cdtfa.ca.gov/industry/new-permit-and-license-holders/managing-your-sales.htm");
const recalls = source("CPSC: recalls", "https://www.cpsc.gov/Recalls");
const productSafety = source("CPSC: online sellers’ safety guide", "https://www.cpsc.gov/Business--Manufacturing/Online-Sellers-Safety-Guide");
const checklistLink = (locale: Locale): GuideLink => ({
  label: locale === "en" ? "Purchase checklist & printable worksheet" : "Lista de compra y hoja para imprimir",
  href: "/guide/buying-checklist",
});

export const visiting: Record<Locale, Guide> = {
  en: {
    title: "Visiting the Toy District: plan your purchase and pickup",
    description: "Check store hours, purchasing arrangements, parking and pickup before a buying trip to Downtown Los Angeles.",
    reviewed_at,
    sections: [
      {
        h: "Start with the exact store address",
        ps: ["This directory covers the area between E 3rd and E 5th Streets, from S Los Angeles Street to S San Pedro Street. Use the address and suite on each listing to plan your stops.", "Listings begin with city business registrations. A registration or map pin does not confirm that a storefront is currently open. Contact the business before making a dedicated trip."],
      },
      {
        h: "Confirm hours and purchasing arrangements",
        ps: ["Ask about the day you intend to visit, whether walk-in purchases are available, and whether an appointment or approved wholesale account is required. A service or pickup deadline may be earlier than the shop’s closing time.", "Reviewed online information includes a source and the date we read that page. Conflicting hours remain unconfirmed."],
        links: [checklistLink("en")],
      },
      {
        h: "Check parking for your arrival time",
        ps: ["LADOT meter rates vary by location and sometimes time. Read the meter and all posted restrictions before parking. Metered spaces cannot be reserved.", "For a private lot or garage, check the operator’s current total price, opening hours, vehicle-height limit and re-entry rules. We have not verified current spaces or district-wide prices."],
        sources: [meters],
      },
      {
        h: "Arrange pickup before buying bulky items",
        ps: ["Ask the merchant where to collect the order, whether it can be held until pickup, and how many boxes you will need to carry.", "LADOT distinguishes freight loading by vehicles with commercial plates from passenger and baggage loading by other vehicles at yellow curbs. A yellow curb is not general shopping parking. Check the posted signs and the full rules for your vehicle and arrival time."],
        sources: [loading],
      },
      {
        h: "Plan transit for your actual destination",
        ps: ["Use Metro’s trip planner with the exact store address, travel date and arrival time. Check current service and the walking connection. Consider the size of your order and how you will carry it on the return trip."],
        sources: [transit],
      },
      {
        h: "Confirm payment and access",
        ps: ["Ask which payment methods are accepted, whether minimums or fees apply, and whether the merchant can provide an itemized invoice.", "If you need step-free entry, room for a cart or help collecting an order, ask the merchant directly. We have not assessed route safety, accessible entrances or current street conditions."],
      },
    ],
    faq: [
      { q: "What time do Toy District stores open?", a: "Confirm with the individual business for your visit date. Store hours, service cutoffs and pickup deadlines can differ." },
      { q: "Do I need a wholesale account to shop?", a: "It depends on the merchant and purchase channel. Ask about walk-in retail, wholesale approval and the minimum for your specific order." },
      { q: "Do stores accept credit cards?", a: "Confirm payment methods, minimums and fees with each merchant. This directory does not assume a district-wide cash or card policy." },
      { q: "How much does parking cost?", a: "Check the meter or parking operator for your location and arrival time. Prices and restrictions vary; we do not publish a district-wide rate." },
    ],
  },
  es: {
    title: "Visitar el Toy District: prepare su compra y recogida",
    description: "Confirme horarios, condiciones de compra, estacionamiento y recogida antes de visitar el centro de Los Ángeles.",
    reviewed_at,
    sections: [
      {
        h: "Empiece con la dirección exacta",
        ps: ["Este directorio cubre el área entre E 3rd y E 5th Streets, desde S Los Angeles Street hasta S San Pedro Street. Use la dirección y el número de local de cada ficha para planear sus visitas.", "Las fichas parten de registros comerciales de la ciudad. Un registro o marcador en el mapa no confirma que la tienda siga abierta. Contacte al negocio antes de hacer un viaje dedicado."],
      },
      {
        h: "Confirme horarios y condiciones de compra",
        ps: ["Pregunte por el día de su visita, si puede comprar sin cita y si necesita una cuenta de mayoreo aprobada. El límite para un servicio o una recogida puede ser anterior al cierre de la tienda.", "La información en línea revisada incluye su fuente y la fecha de consulta. Los horarios contradictorios se mantienen sin confirmar."],
        links: [checklistLink("es")],
      },
      {
        h: "Revise el estacionamiento para su hora de llegada",
        ps: ["Las tarifas de los parquímetros de LADOT varían según el lugar y, en algunos casos, la hora. Lea el parquímetro y todas las restricciones antes de estacionarse. Los espacios con parquímetro no se pueden reservar.", "Para un lote o garaje privado, consulte el precio total actual, el horario, el límite de altura y las condiciones de reingreso. No hemos verificado espacios disponibles ni una tarifa general para el distrito."],
        sources: [meters],
      },
      {
        h: "Organice la recogida de artículos voluminosos",
        ps: ["Pregunte dónde recoger el pedido, si pueden guardarlo hasta esa hora y cuántas cajas tendrá que transportar.", "LADOT distingue la carga de mercancía en vehículos con placas comerciales de la subida y bajada de pasajeros y equipaje en otros vehículos junto a bordillos amarillos. No son estacionamiento general para ir de compras. Revise los letreros y las reglas completas para su vehículo y hora de llegada."],
        sources: [loading],
      },
      {
        h: "Planee el transporte a su destino exacto",
        ps: ["Use el planificador de Metro con la dirección de la tienda, la fecha y la hora de llegada. Revise el servicio actual y el tramo a pie. Considere el tamaño del pedido y cómo lo transportará de regreso."],
        sources: [transit],
      },
      {
        h: "Confirme el pago y el acceso",
        ps: ["Pregunte qué formas de pago aceptan, si hay mínimos o cargos y si pueden emitir una factura detallada.", "Si necesita una entrada sin escalones, espacio para un carrito o ayuda con la recogida, pregunte directamente al negocio. No hemos evaluado la seguridad de las rutas, la accesibilidad de las entradas ni las condiciones actuales de la calle."],
      },
    ],
    faq: [
      { q: "¿A qué hora abren las tiendas del Toy District?", a: "Confirme con cada negocio para la fecha de su visita. El horario de la tienda y los límites para servicios o recogidas pueden ser distintos." },
      { q: "¿Necesito una cuenta de mayoreo para comprar?", a: "Depende del negocio y del canal de compra. Pregunte por compras al menudeo en persona, aprobación de mayoreo y mínimos para su pedido." },
      { q: "¿Aceptan tarjetas de crédito?", a: "Confirme formas de pago, mínimos y cargos con cada negocio. No suponemos una política de efectivo o tarjetas para todo el distrito." },
      { q: "¿Cuánto cuesta el estacionamiento?", a: "Consulte el parquímetro o el operador para el lugar y la hora de su visita. Los precios y las restricciones varían; no publicamos una tarifa general." },
    ],
  },
};

export const wholesaleBasics: Record<Locale, Guide> = {
  en: {
    title: "Buying wholesale: accounts, order minimums & resale documents",
    description: "Separate a merchant’s wholesale terms from resale tax documentation, and prepare questions for your order.", reviewed_at,
    sections: [
      { h: "Ask which buying channel applies", ps: ["Check whether the merchant offers retail, wholesale or both, and whether an account must be approved before you can order or visit. An online shop does not by itself confirm walk-in purchasing."], links: [checklistLink("en")] },
      { h: "Keep resale documents separate from account approval", ps: ["CDTFA explains that a seller’s permit copy is not a substitute for a resale certificate. Its guidance describes the information required for sales for resale and how sellers handle those records.", "A merchant’s account approval, eligibility for its prices and the tax treatment of a purchase are separate questions. Use CDTFA guidance for your circumstances, including purchases for your own use or by an out-of-state business. Confirm the merchant’s document requirements before ordering."], sources: [resale] },
      { h: "Get the minimum and quote for your items", ps: ["Ask for the minimum quantity or order amount, units per case, whether items can be mixed, and the price at your chosen quantity. A free-shipping threshold is not a minimum order.", "Record the quote date, currency, shipping charges and expiry. Ask which payment methods are accepted and whether fees apply. Do not assume that cash changes the price."], links: [checklistLink("en")] },
      { h: "Check product identity and return terms", ps: ["Record the brand, model or SKU, and ask for an itemized invoice. Confirm return conditions and the deadline for reporting incorrect or damaged goods before paying.", "CPSC provides recall searches and guidance for sellers. Match product identifiers and affected batches with the original notice. An empty search does not establish safety, authenticity or compliance; unbranded products are not automatically exempt from product requirements."], sources: [recalls, productSafety] },
    ],
  },
  es: {
    title: "Comprar al por mayor: cuentas, mínimos y documentos de reventa",
    description: "Distinga las condiciones de mayoreo de los documentos fiscales de reventa y prepare preguntas para su pedido.", reviewed_at,
    sections: [
      { h: "Pregunte qué canal de compra corresponde", ps: ["Confirme si el negocio vende al menudeo, al mayoreo o ambos y si debe aprobar una cuenta antes de comprar o visitar. Una tienda en línea no confirma por sí sola la compra en persona."], links: [checklistLink("es")] },
      { h: "Distinga los documentos de reventa de la aprobación de cuenta", ps: ["CDTFA explica que una copia del seller’s permit no sustituye un resale certificate. Su guía describe la información necesaria para las ventas para reventa y cómo los vendedores conservan esos registros.", "La aprobación de una cuenta, el acceso a ciertos precios y el tratamiento fiscal de una compra son preguntas distintas. Consulte la guía de CDTFA para su situación, incluidas compras para uso propio o realizadas por negocios de otro estado. Confirme los documentos que pide el negocio antes de ordenar."], sources: [resale] },
      { h: "Pida el mínimo y la cotización para sus artículos", ps: ["Pregunte por la cantidad o el importe mínimo, las unidades por caja, si puede mezclar artículos y el precio para la cantidad elegida. Un umbral de envío gratis no es un pedido mínimo.", "Anote la fecha, la moneda, los gastos de envío y la vigencia de la cotización. Pregunte por las formas de pago y los cargos. No suponga que pagar en efectivo cambia el precio."], links: [checklistLink("es")] },
      { h: "Revise la identidad del producto y las devoluciones", ps: ["Anote la marca, el modelo o SKU y pida una factura detallada. Confirme las condiciones de devolución y el plazo para reportar artículos incorrectos o dañados antes de pagar.", "CPSC ofrece búsquedas de retiros del mercado y orientación para vendedores. Compare los identificadores y lotes afectados con el aviso original. No encontrar resultados no confirma seguridad, autenticidad ni cumplimiento; un producto sin marca no está automáticamente exento de requisitos."], sources: [recalls, productSafety] },
    ],
  },
};

export type BuyerSlug = "party-planners" | "store-owners" | "resellers";
export const buyerGuides: Record<BuyerSlug, Record<Locale, Guide>> = {
  "party-planners": {
    en: {
      title: "Toy District buying guide for party planners",
      description: "Prepare quantities, event dates and pickup questions before contacting a party supplier.", reviewed_at,
      sections: [
        { h: "Build the event order", ps: ["List the event date, guest count, quantities, sizes and acceptable substitutions. Use the Party supplies category to find candidates, then check each merchant’s official catalog and availability.", "A catalog photo is a product reference, not confirmation of stock at a particular store."], links: [{ label: "Browse the directory", href: "/" }] },
        { h: "Work back from pickup time", ps: ["Ask when you must place and pay for the order, which services require advance booking, and the latest collection time. Confirm whether assembly, inflation or delivery is included.", "California Balloon House has published helium ordering and service information linked on its listing. Check the terms for your quantity and event date."], links: [{ label: "California Balloon House: buying details", href: "/stores/california-balloon-house-447" }] },
        { h: "Record the agreement", ps: ["Confirm payment, substitutions, cancellation and return terms. Ask whether the order can be held for collection and how much vehicle space it needs."], links: [checklistLink("en"), { label: "Parking and pickup planning", href: "/guide/visiting" }] },
      ],
    },
    es: {
      title: "Guía de compra del Toy District para organizadores de fiestas",
      description: "Prepare cantidades, fechas y preguntas de recogida antes de contactar a un proveedor de fiestas.", reviewed_at,
      sections: [
        { h: "Prepare el pedido del evento", ps: ["Anote la fecha, el número de invitados, las cantidades, los tamaños y las sustituciones aceptables. Use la categoría Artículos de fiesta para encontrar candidatos y después confirme el catálogo oficial y la disponibilidad.", "Una foto de catálogo sirve de referencia; no confirma las existencias en una tienda concreta."], links: [{ label: "Ver el directorio", href: "/" }] },
        { h: "Planee desde la hora de recogida", ps: ["Pregunte cuándo debe hacer y pagar el pedido, qué servicios requieren reserva previa y cuál es la última hora de recogida. Confirme si incluye armado, inflado o entrega.", "La ficha de California Balloon House enlaza información publicada sobre pedidos y servicio de helio. Revise las condiciones para su cantidad y fecha de evento."], links: [{ label: "California Balloon House: detalles de compra", href: "/stores/california-balloon-house-447" }] },
        { h: "Anote lo acordado", ps: ["Confirme el pago, las sustituciones, la cancelación y las devoluciones. Pregunte si pueden guardar el pedido hasta recogerlo y cuánto espacio necesitará en el vehículo."], links: [checklistLink("es"), { label: "Estacionamiento y recogida", href: "/guide/visiting" }] },
      ],
    },
  },
  "store-owners": {
    en: {
      title: "Toy District buying guide for store owners",
      description: "Prepare a restock order with item identifiers, case quantities, quotes and delivery questions.", reviewed_at,
      sections: [
        { h: "Make a restock shortlist", ps: ["Use the directory’s categories to find potential suppliers. Record products and quantities, then confirm stock and purchasing arrangements directly. A listing does not promise same-day collection."], links: [{ label: "Browse the directory", href: "/" }] },
        { h: "Compare quotes on the same basis", ps: ["Check units per case, product size and assortment before comparing unit prices. Record order minimums, quote expiry, shipping and pickup costs. Ask whether the same SKU can be reordered and how to check future availability."], links: [checklistLink("en")] },
        { h: "Prepare documents and problem handling", ps: ["Ask about account approval and the documents required for this purchase. Keep an itemized invoice and confirm how to report shortages, damage or incorrect items."], links: [{ label: "Wholesale accounts and resale documents", href: "/guide/wholesale-basics" }] },
      ],
    },
    es: {
      title: "Guía de compra del Toy District para dueños de tiendas",
      description: "Prepare su resurtido con identificadores de productos, cantidades por caja, cotizaciones y preguntas de entrega.", reviewed_at,
      sections: [
        { h: "Seleccione posibles proveedores", ps: ["Use las categorías del directorio para encontrar candidatos. Anote productos y cantidades y confirme directamente existencias y condiciones de compra. Una ficha no promete recogida el mismo día."], links: [{ label: "Ver el directorio", href: "/" }] },
        { h: "Compare cotizaciones equivalentes", ps: ["Revise unidades por caja, tamaño y surtido antes de comparar precios unitarios. Anote mínimos, vigencia de la cotización y costos de envío y recogida. Pregunte si puede volver a pedir el mismo SKU y cómo confirmar su disponibilidad futura."], links: [checklistLink("es")] },
        { h: "Prepare documentos y condiciones de reclamación", ps: ["Pregunte por la aprobación de cuenta y los documentos necesarios para esta compra. Guarde una factura detallada y confirme cómo reportar faltantes, daños o artículos incorrectos."], links: [{ label: "Cuentas de mayoreo y documentos de reventa", href: "/guide/wholesale-basics" }] },
      ],
    },
  },
  resellers: {
    en: {
      title: "Toy District buying guide for online resellers",
      description: "Check product identity, sourcing documents, purchase costs and reorder terms before buying inventory.", reviewed_at,
      sections: [
        { h: "Identify the exact product", ps: ["Record the brand, model, SKU and relevant batch information. Ask which sourcing documents the merchant can supply and check the requirements of the marketplace where you plan to sell. A catalog listing or invoice alone is not an authenticity certification."], links: [{ label: "Browse the directory", href: "/" }] },
        { h: "Check recall information", ps: ["Use CPSC’s official search and compare the product with identifiers and affected batches in a notice. An empty search does not certify safety or compliance. CPSC’s seller guide provides further product-specific resources."], sources: [recalls, productSafety] },
        { h: "Confirm the economics and reorder terms", ps: ["Ask for a quote at your intended quantity and record case size, minimums, shipping, applicable tax and other purchase costs. Add your own selling fees when evaluating the order.", "Confirm returns, claim deadlines, reorder availability and timing. We have not verified wholesale prices, resale margins or a same-week restock schedule."], links: [checklistLink("en"), { label: "Wholesale accounts and resale documents", href: "/guide/wholesale-basics" }] },
      ],
    },
    es: {
      title: "Guía de compra del Toy District para revendedores en línea",
      description: "Revise la identidad del producto, los documentos de procedencia o compra, los costos y las condiciones de resurtido antes de comprar inventario.", reviewed_at,
      sections: [
        { h: "Identifique el producto exacto", ps: ["Anote marca, modelo, SKU y datos de lote pertinentes. Pregunte qué documentos de procedencia o compra puede proporcionar el negocio y revise los requisitos de la plataforma donde venderá. Un catálogo o una factura por sí solos no certifican autenticidad."], links: [{ label: "Ver el directorio", href: "/" }] },
        { h: "Consulte los retiros del mercado", ps: ["Use la búsqueda oficial de CPSC y compare el producto con los identificadores y lotes afectados en el aviso. No encontrar resultados no certifica seguridad ni cumplimiento. La guía de CPSC para vendedores ofrece más recursos por producto."], sources: [recalls, productSafety] },
        { h: "Confirme los costos y el resurtido", ps: ["Pida una cotización para su cantidad y anote unidades por caja, mínimos, envío, impuestos aplicables y otros costos de compra. Añada sus propias comisiones de venta al evaluar el pedido.", "Confirme devoluciones, plazos de reclamación, disponibilidad y fechas de resurtido. No hemos verificado precios de mayoreo, márgenes de reventa ni resurtido en la misma semana."], links: [checklistLink("es"), { label: "Cuentas de mayoreo y documentos de reventa", href: "/guide/wholesale-basics" }] },
      ],
    },
  },
};

export const buyingChecklist: Record<Locale, Guide> = {
  en: {
    title: "Your Toy District purchase checklist",
    description: "Choose a supplier, confirm the terms and take a printable sheet for your quotes and pickup details.", reviewed_at, worksheet: true,
    sections: [
      { h: "Start with published buying information", ps: ["These four listings link to reviewed merchant information. Each shows the source and the date we read it. Confirm current terms, stock and visit arrangements directly."], links: [
        { label: "American Silk: retail, wholesale application and conflicting hours", href: "/stores/american-silk-inc-340" },
        { label: "California Balloon House: ordering, helium service and refund policy", href: "/stores/california-balloon-house-447" },
        { label: "Casa Manga: wholesale signup and catalog", href: "/stores/casa-manga-218" },
        { label: "Tom’s Model: buying channels and catalog", href: "/stores/tom-s-model-501" },
      ] },
      { h: "Questions to ask before you go", ps: ["Use these questions where a condition is not documented or where you need terms for your specific order."], bullets: [
        "Can I buy in person? Do I need an appointment or an approved account?",
        "What minimum quantity or order amount applies? How many units are in a case, and can I mix items?",
        "Which payment methods and documents do you require? Are there any fees?",
        "When and where can I collect the order? Can you hold it until that time?",
        "What are the return terms and the deadline for reporting incorrect or damaged items?",
        "How can I reorder the same item and confirm its availability?",
      ] },
      { h: "Prepare for the visit", ps: ["Check parking or transit, arrange how to carry the order and review resale documents if relevant. For toys you plan to resell, consult official product-safety resources."], links: [
        { label: "Parking and pickup planning", href: "/guide/visiting" },
        { label: "Wholesale accounts and resale documents", href: "/guide/wholesale-basics" },
        { label: "Party planners", href: "/guide/for/party-planners" },
        { label: "Store owners", href: "/guide/for/store-owners" },
        { label: "Online resellers", href: "/guide/for/resellers" },
      ] },
    ],
  },
  es: {
    title: "Su lista de compra para el Toy District",
    description: "Elija un proveedor, confirme las condiciones y lleve una hoja impresa para cotizaciones y detalles de recogida.", reviewed_at, worksheet: true,
    sections: [
      { h: "Empiece con información de compra publicada", ps: ["Estas cuatro fichas enlazan información del negocio que hemos revisado. Cada dato muestra la fuente y la fecha de consulta. Confirme directamente condiciones actuales, existencias y visita."], links: [
        { label: "American Silk: menudeo, solicitud de mayoreo y horarios contradictorios", href: "/stores/american-silk-inc-340" },
        { label: "California Balloon House: pedidos, helio y política de reembolsos", href: "/stores/california-balloon-house-447" },
        { label: "Casa Manga: registro de mayoreo y catálogo", href: "/stores/casa-manga-218" },
        { label: "Tom’s Model: canales de compra y catálogo", href: "/stores/tom-s-model-501" },
      ] },
      { h: "Preguntas antes de visitar", ps: ["Use estas preguntas cuando una condición no esté documentada o necesite saber qué se aplica a su pedido."], bullets: [
        "¿Puedo comprar en persona? ¿Necesito cita o una cuenta aprobada?",
        "¿Qué cantidad o importe mínimo se aplica? ¿Cuántas unidades contiene una caja y puedo mezclar artículos?",
        "¿Qué métodos de pago y documentos requieren? ¿Hay cargos adicionales?",
        "¿Cuándo y dónde puedo recoger el pedido? ¿Pueden guardarlo hasta entonces?",
        "¿Cuáles son las condiciones de devolución y el plazo para reportar artículos incorrectos o dañados?",
        "¿Cómo puedo volver a pedir el mismo artículo y confirmar su disponibilidad?",
      ] },
      { h: "Prepare su visita", ps: ["Revise el estacionamiento o transporte, organice cómo llevar el pedido y consulte los documentos de reventa si corresponde. Si revenderá juguetes, consulte los recursos oficiales de seguridad de productos."], links: [
        { label: "Estacionamiento y recogida", href: "/guide/visiting" },
        { label: "Cuentas de mayoreo y documentos de reventa", href: "/guide/wholesale-basics" },
        { label: "Organizadores de fiestas", href: "/guide/for/party-planners" },
        { label: "Dueños de tiendas", href: "/guide/for/store-owners" },
        { label: "Revendedores en línea", href: "/guide/for/resellers" },
      ] },
    ],
  },
};
