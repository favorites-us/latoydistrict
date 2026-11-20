import Link from "next/link";
import CategoryVisual from "@/components/CategoryVisual";
import { Phone, Globe2, MapPin, Mail, Clock, Calendar, Info } from "lucide-react";
import SaveStoreButton from "@/components/SaveStoreButton";
import QuoteDraft from "@/components/QuoteDraft";
import StoreGallery from "@/components/StoreGallery";
import { photosForStore } from "@/lib/photos";
import JsonLd from "@/components/JsonLd";
import StoreCard from "@/components/StoreCard";
import StoreInquiryForm from "@/components/StoreInquiryForm";
import StoreViewEvent from "@/components/StoreViewEvent";
import StoreContactLink from "@/components/StoreContactLink";
import { NearestParking } from "@/components/ParkingLots";
import { Header, Footer } from "@/components/SiteChrome";
import { BLOCK_LABELS, fullAddress, stores, type Store, type OnlineFact, type OnlineSource } from "@/lib/stores";
import { storeJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { catLabel, localePath, t, type DictKey, type Locale } from "@/lib/i18n";
import { buyerQuestions } from "@/lib/content/buyer-questions";

import { httpUrl } from "@/lib/urls";

function SourceNote({ source, locale, slug }: { source?: OnlineSource; locale: Locale; slug?: string }) {
  if (!source) return null;
  const href = httpUrl(source.url);
  if (!href) return null;
  return <p className="source-note">
    {t(locale, `source_${source.type}` as DictKey)} · {" "}
    {slug
      ? <StoreContactLink href={href} slug={slug} method="buying_source" external>{source.label} ↗</StoreContactLink>
      : <a href={href} target="_blank" rel="nofollow noopener noreferrer">{source.label} ↗</a>}
    {" · "}{t(locale, "source_checked")} <time dateTime={source.checked_at}>{source.checked_at}</time>
  </p>;
}

function FactSources({ facts, locale, slug }: { facts: OnlineFact[]; locale: Locale; slug: string }) {
  const sources = facts.flatMap(fact => [fact.source, ...(fact.additional_sources ?? [])]);
  return <details className="src-disclosure"><summary>{locale === "es" ? "Fuentes" : "Sources"} ({sources.length})</summary>{facts.map(fact => <div key={fact.id}><p>{fact.text[locale]}</p><SourceNote source={fact.source} locale={locale} slug={slug} />{fact.additional_sources?.map((source, index) => <SourceNote key={index} source={source} locale={locale} slug={slug} />)}</div>)}</details>;
}

const FIELD_SOURCE_LABELS: Record<string, DictKey> = {
  hours: "field_hours",
  phone: "field_phone",
  contact_email: "field_email",
  languages: "field_languages",
  "links.website": "field_website",
};

export default function StorePage({ store, locale }: { store: Store; locale: Locale }) {
  const nearby = stores.filter((s) => s.block === store.block && s.slug !== store.slug).slice(0, 6);
  const mapsQuery = encodeURIComponent(fullAddress(store));
  const questions = buyerQuestions[store.slug]?.[locale];
  const gallery = photosForStore(store.slug);
  const es = locale === "es";

  // Any business-linked URL goes here — website, socials, Yelp, etc. All
  // pass through httpUrl() since links can originate from world-editable data.
  const links: { label: string; href: string }[] = [];
  const addLink = (label: string, raw: string | undefined) => {
    const href = httpUrl(raw);
    if (href) links.push({ label, href });
  };
  addLink(t(locale, "field_website"), store.links?.website);
  addLink("Facebook", store.links?.facebook);
  addLink("Instagram", store.links?.instagram);
  addLink("WhatsApp", store.links?.whatsapp);
  addLink("Yelp", store.links?.yelp);
  for (const raw of store.links?.other ?? []) {
    const href = httpUrl(raw);
    if (href) links.push({ label: new URL(href).hostname.replace(/^www\./, ""), href });
  }

  const carryFacts = store.online_facts?.filter((f) => f.kind === "products" || f.kind === "manufacturer_listing") ?? [];
  const buyFacts = store.online_facts?.filter((f) => f.kind !== "products" && f.kind !== "manufacturer_listing") ?? [];

  const missingEssentials = (
    [
      [!store.hours && !store.field_sources?.hours, "field_hours"],
      [!store.moq, "field_moq"],
      [!store.payment?.length, "field_payment"],
    ] as [boolean, DictKey][]
  )
    .filter(([missing]) => missing)
    .map(([, key]) => t(locale, key));

  const fieldSourceRows = Object.entries(store.field_sources ?? {}).map(([field, source]) => ({
    field,
    label:
      field === "wholesale_retail"
        ? es ? "Mayoreo/menudeo" : "Wholesale/retail"
        : t(locale, (FIELD_SOURCE_LABELS[field] ?? "field_links") as DictKey),
    source,
  }));

  const descriptor = [
    t(locale, `wr_${store.wholesale_retail}` as DictKey),
    store.category.map((c) => catLabel(locale, c)).join(", "),
    BLOCK_LABELS[store.block],
  ].join(" · ");

  return (
    <>
      <Header locale={locale} altPath={`/stores/${store.slug}`} />
      <main id="main-content" lang={locale}>
        <JsonLd data={storeJsonLd(store)} />
        <JsonLd data={breadcrumbJsonLd(locale, `/stores/${store.slug}`, store.name)} />
        <StoreViewEvent slug={store.slug} />
        <div className="container store-page">
          <nav className="breadcrumb">
            <Link href={localePath(locale, "/") || "/"}>{t(locale, "breadcrumb_home")}</Link>
            {" / "}
            <Link href={`${localePath(locale, "/") || "/"}?street=${store.block}#directory`}>{BLOCK_LABELS[store.block]}</Link>
          </nav>
          {gallery.length > 0 && <StoreGallery photos={gallery} locale={locale} category={store.category[0] || "general"} />}
          <div className={`store-heading ${gallery.length ? "" : "no-photos"}`}>
            {!gallery.length && <div className="heading-icon"><CategoryVisual category={store.category[0] || "general"} locale={locale} /></div>}
            <div>
              <h1>{store.name}</h1>{store.verified_at && <span className="badge brand" >✓ {t(locale, "verified_note")} — <time dateTime={store.verified_at}>{store.verified_at}</time></span>}
              <p className="store-descriptor">
                {descriptor}
                {store.field_sources?.wholesale_retail?.type === "business" ? (
                  <span className="badge brand">✓ {t(locale, "source_business")}</span>
                ) : null}
              </p>
              <p className="sub">{fullAddress(store)}</p>
              {!store.field_sources?.wholesale_retail ? (
                <p className="source-note">{t(locale, "wr_registration_note")}</p>
              ) : null}
            </div>
            <SaveStoreButton slug={store.slug} name={store.name} locale={locale} />
          </div>
          <div className="store-detail-layout">
            <div className="store-main-column">

              <section className="fact-card" aria-labelledby="facts-heading">
                <h2 id="facts-heading" className="card-heading">{t(locale, "store_details_h2")}</h2>
                <dl className="fact-list">
                  <div className="fact-row">
                    <dt><MapPin size={18} /><span className="sr-only">{t(locale, "field_address")}</span></dt>
                    <dd>
                      {fullAddress(store)}
                      {" · "}
                      <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} rel="nofollow noopener" target="_blank">
                        Google Maps ↗
                      </a>
                    </dd>
                  </div>
                  {store.phone ? (
                    <div className="fact-row">
                      <dt><Phone size={18} /><span className="sr-only">{t(locale, "field_phone")}</span></dt>
                      <dd>
                        <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone">{store.phone}</StoreContactLink>
                      </dd>
                    </div>
                  ) : null}
                  {store.contact_email ? (
                    <div className="fact-row">
                      <dt><Mail size={18} /><span className="sr-only">{t(locale, "field_email")}</span></dt>
                      <dd>
                        <StoreContactLink href={`mailto:${store.contact_email}`} slug={store.slug} method="email">{store.contact_email}</StoreContactLink>
                      </dd>
                    </div>
                  ) : null}
                  {links.length > 0 ? (
                    <div className="fact-row">
                      <dt><Globe2 size={18} /><span className="sr-only">{t(locale, "field_links")}</span></dt>
                      <dd>
                        {links.map((l, i) => (
                          <span key={l.href}>
                            {i > 0 ? " · " : ""}
                            <StoreContactLink href={l.href} slug={store.slug} method="website" external>{l.label} ↗</StoreContactLink>
                          </span>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                  <div className="fact-row">
                      <dt><Clock size={18} /><span className="sr-only">{t(locale, "field_hours")}</span></dt>
                      <dd><span className="hours-status">{store.hours ? (es ? "Horario publicado" : "Published hours") : t(locale, "hours_unconfirmed")}</span>{store.hours && <p>{store.hours}</p>}</dd>
                    </div>
                  {store.moq ? (
                    <div className="fact-row">
                      <dt className="visible-fact-label">{t(locale, "field_moq")}</dt>
                      <dd>{store.moq}</dd>
                    </div>
                  ) : null}
                  {store.payment?.length ? (
                    <div className="fact-row">
                      <dt className="visible-fact-label">{t(locale, "field_payment")}</dt>
                      <dd>{store.payment.join(", ")}</dd>
                    </div>
                  ) : null}
                  {store.languages?.length ? (
                    <div className="fact-row">
                      <dt className="visible-fact-label">{t(locale, "field_languages")}</dt>
                      <dd>{store.languages.map((language) => es && language === "Spanish" ? "Español" : language).join(", ")}</dd>
                    </div>
                  ) : null}
                  {store.since ? (
                    <div className="fact-row">
                      <dt><Calendar size={18} /><span className="sr-only">{t(locale, "since")}</span></dt>
                      <dd>{t(locale, "since")} {store.since.slice(0, 4)}</dd>
                    </div>
                  ) : null}
                </dl>
                {missingEssentials.length > 0 ? (
                  <p className="unknown-line">
                    {t(locale, "confirm_prefix")} {missingEssentials.join(" · ")}
                  </p>
                ) : null}
                <details className="src-disclosure">
                  <summary>{t(locale, "sources_disclosure")}</summary>
                  <ul>
                    <li>{t(locale, "sources_registry_line")}</li>
                    {fieldSourceRows.map(({ field, label, source }) => {
                      const href = httpUrl(source.url);
                      return (
                        <li key={field}>
                          {label}: {t(locale, `source_${source.type}` as DictKey)} ·{" "}
                          {href ? <a href={href} target="_blank" rel="nofollow noopener noreferrer">{source.label} ↗</a> : source.label}
                          {" · "}{t(locale, "source_checked")} <time dateTime={source.checked_at}>{source.checked_at}</time>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </section>

              <section className="carry-card" aria-labelledby="carry-heading">
                <h2 id="carry-heading" className="card-heading">{t(locale, "carry_h2")}</h2>
                <div className="chips">
                  {store.category.map((c) => (
                    <span key={c} className="badge brand">{catLabel(locale, c)}</span>
                  ))}
                  <span className="badge">{t(locale, `wr_${store.wholesale_retail}` as DictKey)}</span>
                </div>
                {carryFacts.length > 0 ? (
                  <ul className="carry-facts">
                    {carryFacts.map((fact) => (
                      <li key={fact.id}>
                        <details className="fact-detail"><summary>{fact.kind === "minimum_order" ? (es ? "Pedido mínimo" : "Minimum order") : fact.kind === "services" ? (es ? "Servicios" : "Services") : fact.kind === "products" ? (es ? "Productos" : "Products") : fact.kind === "manufacturer_listing" ? (es ? "Listado del fabricante" : "Manufacturer listing") : (es ? "Condiciones de compra" : "Buying terms")}</summary><p>{fact.text[locale]}</p></details>

                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="unknown-line">{t(locale, "carry_registration_note")}</p>
                )}
                {carryFacts.length > 0 && <FactSources facts={carryFacts} locale={locale} slug={store.slug} />}
              </section>

              {buyFacts.length > 0 ? (
                <section className="buying-details" aria-labelledby="buying-heading">
                  <h2 id="buying-heading" className="card-heading">{t(locale, "buying_h2")}</h2>
                  <div className="fact-highlights">{buyFacts.filter(fact => fact.minimum_order_value).map(fact => <span className="badge" key={fact.id}>{es ? "Pedido mínimo" : "Minimum order"}: ${fact.minimum_order_value!.amount.toLocaleString(locale)}</span>)}{store.field_sources?.hours && !store.hours && <span className="badge">{es ? "Horario sin confirmar" : "Hours unconfirmed"}</span>}</div>
                  <p>{t(locale, "online_note")}</p>
                  <ul>
                    {buyFacts.map((fact) => (
                      <li key={fact.id}>
                        <details className="fact-detail"><summary>{fact.kind === "minimum_order" ? (es ? "Pedido mínimo" : "Minimum order") : fact.kind === "services" ? (es ? "Servicios" : "Services") : fact.kind === "products" ? (es ? "Productos" : "Products") : fact.kind === "manufacturer_listing" ? (es ? "Listado del fabricante" : "Manufacturer listing") : (es ? "Condiciones de compra" : "Buying terms")}</summary><p>{fact.text[locale]}</p></details>

                      </li>
                    ))}
                  </ul>
                  <FactSources facts={buyFacts} locale={locale} slug={store.slug} />
                </section>
              ) : null}

              {questions ? (
                <section className="buyer-questions" aria-labelledby="questions-heading">
                  <h2 id="questions-heading" className="card-heading">{t(locale, "buyer_questions_h2")}</h2>
                  <p>{t(locale, "buyer_questions_note")}</p>
                  <ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul>
                  <Link href={localePath(locale, "/guide/buying-checklist")}>{t(locale, "worksheet_link")}</Link>
                </section>
              ) : null}

              <section className="visit-card" aria-labelledby="visit-heading">
                <h2 id="visit-heading" className="card-heading">{t(locale, "visit_h2")}</h2>
                <h3 className="visit-sub">{t(locale, "parking_h2")}</h3>
                <NearestParking lat={store.address.lat} lng={store.address.lng} locale={locale} />
                <p className="visit-guide-link">
                  <Link href={localePath(locale, "/guide/visiting")}>{t(locale, "parking_guide_link")} →</Link>
                </p>
              </section>

              <aside className="claim-banner">
                <h2 className="card-heading">{t(locale, "claim_banner_title")}</h2>
                <p>{t(locale, "claim_banner_body")}</p>
                <a href={`mailto:favorites.app@gmail.com?subject=${encodeURIComponent(`Listing: ${store.name}`)}`}>
                  {t(locale, "claim_banner_cta")} ↗
                </a>
              </aside>

              {!store.verified_at ? <p className="fineprint">{t(locale, "unverified_note")}</p> : null}
            </div>
            <aside className="store-actions">
              <div className="store-contact-box">
                <h2 className="card-heading">{es ? "Prepare su compra" : "Plan your purchase"}</h2>
                <p>{es ? "Confirme los productos y condiciones directamente con el negocio." : "Confirm items and buying terms directly with the business."}</p>
                <div className="store-contact-buttons">
                  {store.phone && store.field_sources?.phone?.type === "business" && <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone"><Phone size={16} />{es ? "Llamar al negocio" : "Call the business"}</StoreContactLink>}
                  {httpUrl(store.links?.website) && <StoreContactLink href={httpUrl(store.links?.website)!} slug={store.slug} method="website" external><Globe2 size={16} />{es ? "Sitio del negocio" : "Business website"}</StoreContactLink>}
                  <QuoteDraft name={store.name} slug={store.slug} locale={locale} />
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="nofollow noopener noreferrer"><MapPin size={16} />{es ? "Ver dirección en Maps" : "Open address in Maps"}</a>
                  <SaveStoreButton slug={store.slug} name={store.name} locale={locale} />
                </div>
              </div>
              <StoreInquiryForm locale={locale} storeSlug={store.slug} storeName={store.name} />
            </aside>
          </div>
          {nearby.length > 0 ? (
            <>
              <h2 className="nearby-heading">
                {t(locale, "nearby_h2")} {BLOCK_LABELS[store.block]}
              </h2>
              <div className="store-grid">
                {nearby.map((s) => (
                  <StoreCard key={s.slug} store={s} locale={locale} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </main>
      <div className="store-sticky-actions" role="group" aria-label={es ? "Acciones del negocio" : "Business actions"}>{store.phone && store.field_sources?.phone?.type === "business" && <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone"><Phone size={18} />{es ? "Llamar" : "Call"}</StoreContactLink>}{!store.phone && <span className="action-unavailable"><Phone size={18} />{es ? "Sin teléfono" : "No phone"}</span>}<a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="nofollow noopener noreferrer"><MapPin size={18} />{es ? "Cómo llegar" : "Directions"}</a>{httpUrl(store.links?.website) ? <StoreContactLink href={httpUrl(store.links?.website)!} slug={store.slug} method="website" external><Globe2 size={18} />{es ? "Sitio web" : "Website"}</StoreContactLink> : <span className="action-unavailable"><Globe2 size={18} />{es ? "Sin sitio web" : "No website"}</span>}<SaveStoreButton slug={store.slug} name={store.name} locale={locale} /></div>
      <Footer locale={locale} />
    </>
  );
}
