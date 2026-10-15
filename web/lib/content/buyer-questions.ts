import type { Locale } from "../i18n";

// Editorial questions, not source-backed assertions or a list of absent services.
export const buyerQuestions: Record<string, Record<Locale, string[]>> = {
  "american-silk-inc-340": {
    en: ["Which wholesale program and minimum apply to my items and quantity?", "What is the closing time on my visit date, and can I buy in person?", "What payment, pickup and return terms apply to this order?"],
    es: ["¿Qué programa de mayoreo y mínimo se aplican a mis artículos y cantidad?", "¿A qué hora cierran el día de mi visita y puedo comprar en persona?", "¿Qué condiciones de pago, recogida y devolución se aplican a este pedido?"],
  },
  "california-balloon-house-447": {
    en: ["Can you fulfill my quantity for my event date, and when must I order?", "When and where can I collect the order, and can you hold it until then?", "What payment and account requirements apply to this purchase?"],
    es: ["¿Pueden preparar mi cantidad para la fecha del evento y cuándo debo pedirla?", "¿Cuándo y dónde puedo recoger el pedido y pueden guardarlo hasta entonces?", "¿Qué requisitos de pago y cuenta se aplican a esta compra?"],
  },
  "casa-manga-218": {
    en: ["Can I buy in person before my wholesale account is approved?", "What minimum, case size and price apply to the items I need?", "What are the pickup, payment and return terms for this order?"],
    es: ["¿Puedo comprar en persona antes de que aprueben mi cuenta de mayoreo?", "¿Qué mínimo, unidades por caja y precio se aplican a mis artículos?", "¿Cuáles son las condiciones de recogida, pago y devolución de este pedido?"],
  },
  "tom-s-model-501": {
    en: ["Are these specific items and quantities available for in-store purchase?", "Which account requirements, minimums and prices apply to a retailer order?", "What are the confirmed pickup and return terms for my purchase?"],
    es: ["¿Están disponibles estos artículos y cantidades para comprar en tienda?", "¿Qué requisitos de cuenta, mínimos y precios se aplican a un pedido de un minorista?", "¿Cuáles son las condiciones confirmadas de recogida y devolución de mi compra?"],
  },
};
