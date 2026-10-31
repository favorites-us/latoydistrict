"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, Columns3, Printer, X } from "lucide-react";
import { Header, Footer } from "@/components/SiteChrome";
import { useBuyer } from "@/components/BuyerProvider";
import StoreCard from "@/components/StoreCard";
import { Button, buttonVariants } from "@/components/ui/button";
import QuoteDraft from "@/components/QuoteDraft";
import { BLOCK_LABELS, fullAddress, stores, type OnlineSource, type Store } from "@/lib/stores";
import { catLabel, localePath, t, type Locale } from "@/lib/i18n";
import { buyerQuestions } from "@/lib/content/buyer-questions";
import { httpUrl } from "@/lib/urls";
import { track } from "@/lib/analytics";

function Source({ source, locale }: { source?: OnlineSource; locale: Locale }) {
  if (!source) return null;
  return <small>{httpUrl(source.url) ? <a href={httpUrl(source.url)!} target="_blank" rel="nofollow noopener noreferrer">{source.label}</a> : source.label}<br />{source.type === "directory" && (locale === "es" ? "Sin confirmar con el propietario. " : "Not owner-confirmed. ")}{t(locale, "source_checked")} {source.checked_at}</small>;
}

function Comparison({ selected, locale }: { selected: Store[]; locale: Locale }) {
  const es = locale === "es";
  const unknown = es ? "Pregunte al negocio" : "Ask the business";
  const rows: { label: string; render: (store: Store) => React.ReactNode }[] = [
    { label: es ? "Dirección" : "Address", render: (store) => <>{fullAddress(store)}<small>{es ? "Dirección del directorio; confirme local y operación." : "Directory address; confirm suite and current operation."}</small></> },
    { label: es ? "Categoría del directorio" : "Directory category", render: (store) => store.category.map((category) => catLabel(locale, category)).join(", ") },
    { label: es ? "Contacto" : "Contact", render: (store) => <>{store.phone ? <><a href={`tel:${store.phone.replace(/[^+\d]/g, "")}`}>{store.phone}</a><Source source={store.field_sources?.phone} locale={locale} />{!store.field_sources?.phone && <small>{es ? "Registro existente; sin reconfirmar." : "Existing listing; not rechecked."}</small>}</> : unknown}{store.contact_email && <p><a href={`mailto:${store.contact_email}`}>{store.contact_email}</a><Source source={store.field_sources?.contact_email} locale={locale} /></p>}</> },
    { label: es ? "Forma de compra" : "Buying options", render: (store) => store.field_sources?.wholesale_retail?.type === "business" ? <>{t(locale, `wr_${store.wholesale_retail}`)}<Source source={store.field_sources.wholesale_retail} locale={locale} /><small>{es ? "Confirme la compra en persona." : "Confirm in-person purchasing."}</small></> : unknown },
    { label: es ? "Horario" : "Hours", render: (store) => store.field_sources?.hours?.type === "business" ? <>{store.hours ?? t(locale, "hours_unconfirmed")}<Source source={store.field_sources.hours} locale={locale} /></> : unknown },
    { label: es ? "Mínimos y cuentas" : "Minimums & accounts", render: (store) => {
      const facts = store.online_facts?.filter((fact) => fact.source.type === "business" && (fact.kind === "minimum_order" || fact.kind === "buying"));
      return facts?.length ? facts.map((fact) => <p key={fact.id}>{fact.text[locale]}<Source source={fact.source} locale={locale} />{fact.additional_sources?.map((source) => <Source key={source.url} source={source} locale={locale} />)}</p>) : unknown;
    } },
    { label: es ? "Pago y recogida" : "Payment & pickup", render: () => unknown },
    { label: es ? "Siguiente paso" : "Next step", render: (store) => <QuoteDraft name={store.name} slug={store.slug} locale={locale} /> },
  ];
  return <div className="compare-wrap" role="region" aria-label={es ? "Comparación de proveedores; desplácese horizontalmente" : "Supplier comparison; scroll horizontally"} tabIndex={0}>
    <table className="compare-table" style={{ minWidth: 160 + selected.length * 260 }}><caption className="sr-only">{es ? "Compare la información publicada. Los espacios desconocidos requieren consulta." : "Compare published information. Unknown details require confirmation."}</caption><thead><tr><th scope="col">{es ? "Información" : "Details"}</th>{selected.map((store) => <th scope="col" key={store.slug}><Link href={localePath(locale, `/stores/${store.slug}`)}>{store.name}</Link></th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.label}><th scope="row">{row.label}</th>{selected.map((store) => <td key={store.slug}>{row.render(store)}</td>)}</tr>)}</tbody></table>
  </div>;
}

export default function SavedPage({ locale }: { locale: Locale }) {
  const es = locale === "es";
  const { saved, ready, persistent } = useBuyer();
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [message, setMessage] = useState("");
  const savedStores = useMemo(() => stores.filter((store) => saved.includes(store.slug)).sort((a, b) => a.block.localeCompare(b.block, "en") || a.name.localeCompare(b.name, "en")), [saved]);
  const comparingStores = savedStores.filter((store) => selected.includes(store.slug));
  return <><Header locale={locale} altPath="/saved" /><main id="main-content" lang={locale} className="container saved-page">
    <div className="saved-screen"><nav className="breadcrumb"><Link href={localePath(locale, "/")}>{t(locale, "nav_directory")}</Link><span>/</span><span>{es ? "Mi lista" : "Saved suppliers"}</span></nav><p className="location-line"><Bookmark size={16} />{es ? "Su próxima visita" : "Your next buying trip"}</p><h1>{es ? "Su lista de proveedores." : "A shortlist worth taking along."}</h1><p className="saved-intro">{es ? "Hasta 12 proveedores, guardados en este navegador. Elija de 2 a 4 para comparar; imprima su lista ordenada por calle." : "Up to 12 suppliers, saved in this browser. Select 2–4 to compare, or print your list grouped by street."}</p>
      {!persistent && <p role="status" className="mt-4 text-sm text-red-700">{es ? "El navegador no permite guardar. Esta lista solo dura esta sesión." : "Browser storage is unavailable. This list lasts for this session only."}</p>}
      {!ready ? <p role="status" className="my-8">{es ? "Cargando su lista…" : "Loading your list…"}</p> : savedStores.length ? <>
        <div className="saved-toolbar"><Button disabled={comparingStores.length < 2} onClick={() => { setComparing(true); track("compare_open", { count: comparingStores.length }); }}><Columns3 />{es ? "Comparar" : "Compare"} ({comparingStores.length}/4)</Button><Button variant="outline" onClick={() => { track("visit_print", { count: savedStores.length }); window.print(); }}><Printer />{es ? "Imprimir lista de visita" : "Print visit list"}</Button><Link href={localePath(locale, "/guide/buying-checklist")} className={buttonVariants({ variant: "ghost" })}>{es ? "Hoja de compra" : "Purchase worksheet"}</Link></div>
        <p className="text-xs text-muted-foreground">{es ? "Datos incompletos no significan que el negocio no ofrezca un servicio. Consulte los campos sin confirmar." : "Missing details do not mean a service is unavailable. Ask about any unconfirmed fields."}</p><p role="status" className="mt-2 text-sm text-red-700">{message}</p>
        {comparing && comparingStores.length >= 2 && <section className="mt-8"><div className="flex items-center justify-between"><h2>{es ? "Compare antes de visitar" : "Compare before you go"}</h2><Button variant="ghost" size="icon" aria-label={es ? "Cerrar comparación" : "Close comparison"} onClick={() => setComparing(false)}><X /></Button></div><Comparison selected={comparingStores} locale={locale} /></section>}
        <div className="mt-8">{savedStores.map((store) => <div key={store.slug} className="saved-store"><label><input type="checkbox" aria-label={`${es ? "Comparar" : "Compare"} ${store.name}`} checked={selected.includes(store.slug)} onChange={(event) => { if (event.target.checked && comparingStores.length >= 4) { setMessage(es ? "Elija hasta 4 proveedores." : "Choose up to 4 suppliers."); return; } setSelected(event.target.checked ? [...selected.filter((slug) => saved.includes(slug)), store.slug] : selected.filter((slug) => slug !== store.slug)); setMessage(""); }} /></label><StoreCard store={store} locale={locale} /></div>)}</div>
      </> : <div className="empty-results mt-8"><Bookmark size={32} /><h2>{es ? "Su lista empieza con un proveedor" : "Your list starts with one supplier"}</h2><p>{es ? "Use Guardar en cualquier ficha para reunir proveedores aquí." : "Use Save on any supplier listing to collect them here."}</p><Link href={localePath(locale, "/#directory")} className={buttonVariants()}>{es ? "Explorar proveedores" : "Browse suppliers"}</Link></div>}
    </div>
    <section className="visit-print-only"><h2 className="visit-print-title">{es ? "Lista de visita al Toy District" : "Toy District visit list"}</h2><p>{es ? "Confirme operación, horario y disponibilidad antes de salir. Agrupada por calle; no es una ruta calculada." : "Confirm current operation, hours and availability before leaving. Grouped by street; not a calculated walking route."}</p>{savedStores.map((store, index) => <div key={store.slug}>{index === 0 || savedStores[index - 1].block !== store.block ? <h2>{BLOCK_LABELS[store.block]}</h2> : null}<div className="visit-print-store"><h3>{store.name}</h3><p>{fullAddress(store)}</p><p>{store.phone ?? (es ? "Teléfono sin confirmar" : "Phone unconfirmed")}{store.contact_email ? ` / ${store.contact_email}` : ""}</p>{!store.field_sources?.phone && store.phone && <p>{es ? "Teléfono del registro existente; sin reconfirmar." : "Phone from the existing listing; not rechecked."}</p>}{store.phone && store.field_sources?.phone && <p>{store.field_sources.phone.label} · {t(locale, "source_checked")} {store.field_sources.phone.checked_at}{store.field_sources.phone.type === "directory" ? (es ? " · Sin confirmar con el propietario" : " · Not owner-confirmed") : ""}</p>}<p>{store.field_sources?.hours?.type === "business" && store.hours ? store.hours : (es ? "Confirme el horario." : "Confirm opening hours.")}</p>{store.field_sources?.hours?.type === "business" && <p>{store.field_sources.hours.label} · {t(locale, "source_checked")} {store.field_sources.hours.checked_at}</p>}{(buyerQuestions[store.slug]?.[locale] ?? [es ? "¿Qué mínimo, pago y recogida aplican a mi pedido?" : "What minimum, payment and pickup terms apply to my order?"]).map((question) => <p key={question}>□ {question}</p>)}<p className="visit-print-notes">{es ? "Notas:" : "Notes:"}</p><p>toydistrictlosangeles.com{localePath(locale, `/stores/${store.slug}`)}</p></div></div>)}</section>
  </main><Footer locale={locale} /></>;
}
