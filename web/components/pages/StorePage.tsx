import Link from "next/link";
import { Phone, Globe2, MapPin } from "lucide-react";
import SaveStoreButton from "@/components/SaveStoreButton";
import QuoteDraft from "@/components/QuoteDraft";
import StorePhoto from "@/components/StorePhoto";
import { photosForStore } from "@/lib/photos";
import JsonLd from "@/components/JsonLd";
import StoreCard from "@/components/StoreCard";
import StoreInquiryForm from "@/components/StoreInquiryForm";
import StoreViewEvent from "@/components/StoreViewEvent";
import StoreContactLink from "@/components/StoreContactLink";
import { NearestParking } from "@/components/ParkingLots";
import { Header, Footer } from "@/components/SiteChrome";
import { BLOCK_LABELS, fullAddress, stores, type Store, type OnlineSource } from "@/lib/stores";
import { storeJsonLd } from "@/lib/jsonld";
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
        <StoreViewEvent slug={store.slug} />
        <div className="container store-page">
          <nav className="breadcrumb">
            <Link href={localePath(locale, "/") || "/"}>{t(locale, "breadcrumb_home")}</Link>
            {" / "}
            <Link href={`${localePath(locale, "/") || "/"}?street=${store.block}#directory`}>{BLOCK_LABELS[store.block]}</Link>
          </nav>
          <div className="store-heading">
            <div>
              <h1>{store.name}</h1>
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
          {store.verified_at ? (
            <p className="note ok">✓ {t(locale, "verified_note")} — {store.verified_at}</p>
          ) : null}
          <div className="store-detail-layout">
            <div className="store-main-column">
              {gallery.length > 0 && (
                <section id="photos" aria-label={es ? "Imágenes del catálogo" : "Catalog images"}>
                  <StorePhoto photo={gallery[0]} locale={locale} />
                  {gallery.length > 1 && (
                    <details className="src-disclosure">
                      <summary>{es ? "Más imágenes del catálogo" : "More catalog images"} ({gallery.length - 1})</summary>
                      {gallery.slice(1).map((photo) => <StorePhoto key={photo.id} photo={photo} locale={locale} />)}
                    </details>
                  )}
                </section>
              )}

              <section className="fact-card" aria-labelledby="facts-heading">
                <h2 id="facts-heading" className="card-heading">{t(locale, "store_details_h2")}</h2>
                <dl className="fact-list">
                  <div className="fact-row">
                    <dt>{t(locale, "field_address")}</dt>
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
                      <dt>{t(locale, "field_phone")}</dt>
                      <dd>
                        <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone">{store.phone}</StoreContactLink>
                      </dd>
                    </div>
                  ) : null}
                  {store.contact_email ? (
                    <div className="fact-row">
                      <dt>{t(locale, "field_email")}</dt>
                      <dd>
                        <StoreContactLink href={`mailto:${store.contact_email}`} slug={store.slug} method="email">{store.contact_email}</StoreContactLink>
                      </dd>
                    </div>
                  ) : null}
                  {links.length > 0 ? (
                    <div className="fact-row">
                      <dt>{t(locale, "field_links")}</dt>
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
                  {store.hours || store.field_sources?.hours ? (
                    <div className="fact-row">
                      <dt>{t(locale, "field_hours")}</dt>
                      <dd>{store.hours ?? t(locale, "hours_unconfirmed")}</dd>
                    </div>
                  ) : null}
                  {store.moq ? (
                    <div className="fact-row">
                      <dt>{t(locale, "field_moq")}</dt>
                      <dd>{store.moq}</dd>
                    </div>
                  ) : null}
                  {store.payment?.length ? (
                    <div className="fact-row">
                      <dt>{t(locale, "field_payment")}</dt>
                      <dd>{store.payment.join(", ")}</dd>
                    </div>
                  ) : null}
                  {store.languages?.length ? (
                    <div className="fact-row">
                      <dt>{t(locale, "field_languages")}</dt>
                      <dd>{store.languages.map((language) => es && language === "Spanish" ? "Español" : language).join(", ")}</dd>
                    </div>
                  ) : null}
                  {store.since ? (
                    <div className="fact-row">
                      <dt>{t(locale, "since")}</dt>
                      <dd>{store.since.slice(0, 4)}</dd>
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
                        <p>{fact.text[locale]}</p>
                        <SourceNote source={fact.source} locale={locale} slug={store.slug} />
                        {fact.additional_sources?.map((source) => (
                          <SourceNote key={source.url} source={source} locale={locale} slug={store.slug} />
                        ))}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="unknown-line">{t(locale, "carry_registration_note")}</p>
                )}
              </section>

              {buyFacts.length > 0 ? (
                <section className="buying-details" aria-labelledby="buying-heading">
                  <h2 id="buying-heading" className="card-heading">{t(locale, "buying_h2")}</h2>
                  <p>{t(locale, "online_note")}</p>
                  <ul>
                    {buyFacts.map((fact) => (
                      <li key={fact.id}>
                        <p>{fact.text[locale]}</p>
                        <SourceNote source={fact.source} locale={locale} slug={store.slug} />
                        {fact.additional_sources?.map((source) => (
                          <SourceNote key={source.url} source={source} locale={locale} slug={store.slug} />
                        ))}
                      </li>
                    ))}
                  </ul>
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
                <a href={`mailto:hello@toydistrictlosangeles.com?subject=${encodeURIComponent(`Listing: ${store.name}`)}`}>
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
                  {store.phone && <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone"><Phone size={16} />{es ? "Llamar al negocio" : "Call the business"}</StoreContactLink>}
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
      <Footer locale={locale} />
    </>
  );
}
