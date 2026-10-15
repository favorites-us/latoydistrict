"use client";

import type { Locale } from "@/lib/i18n";

const copy = {
  en: {
    title: "Quote & pickup worksheet",
    intro: "Print one sheet per supplier. Fill it in with the merchant’s answers; a blank field means you still need to ask.",
    print: "Print worksheet",
    fields: ["Store & contact", "Visit / quote date", "Address & suite", "Appointment / account approval", "Item, brand & SKU", "Quantity & units per case", "Unit price, currency & quote expiry", "Minimum order / mixed cases", "Shipping, applicable tax & other costs", "Payment methods & documents", "Pickup date, cutoff & location", "Returns & claim deadline"],
    notes: "Order holding, reorders & other questions",
    reminder: "Confirm the final total and pickup arrangements before paying.",
  },
  es: {
    title: "Hoja de cotización y recogida",
    intro: "Imprima una hoja por proveedor. Anote sus respuestas; un espacio vacío significa que aún debe preguntar.",
    print: "Imprimir hoja",
    fields: ["Negocio y contacto", "Fecha de visita / cotización", "Dirección y local", "Cita / aprobación de cuenta", "Artículo, marca y SKU", "Cantidad y unidades por caja", "Precio unitario, moneda y vigencia", "Pedido mínimo / cajas mixtas", "Envío, impuestos aplicables y otros costos", "Formas de pago y documentos", "Fecha, hora límite y lugar de recogida", "Devoluciones y plazo de reclamación"],
    notes: "Reserva del pedido, resurtido y otras preguntas",
    reminder: "Confirme el total final y la recogida antes de pagar.",
  },
};

export default function BuyerWorksheet({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return (
    <section className="buyer-worksheet" aria-labelledby="worksheet-heading">
      <div className="worksheet-heading">
        <h2 id="worksheet-heading">{c.title}</h2>
        <button type="button" className="print-worksheet" onClick={() => window.print()}>{c.print}</button>
      </div>
      <p className="worksheet-intro">{c.intro}</p>
      <dl className="worksheet-fields">
        {c.fields.map((field) => (
          <div key={field} className="worksheet-field">
            <dt>{field}</dt>
            <dd aria-hidden="true" />
          </div>
        ))}
        <div className="worksheet-field worksheet-notes">
          <dt>{c.notes}</dt>
          <dd aria-hidden="true" />
        </div>
      </dl>
      <p className="worksheet-reminder">{c.reminder}</p>
      <p className="worksheet-origin">toydistrictlosangeles.com{locale === "es" ? "/es" : ""}/guide/buying-checklist</p>
    </section>
  );
}
