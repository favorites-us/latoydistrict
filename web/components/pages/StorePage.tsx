import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import StoreCard from "@/components/StoreCard";
import StoreInquiryForm from "@/components/StoreInquiryForm";
import StoreViewEvent from "@/components/StoreViewEvent";
import StoreContactLink from "@/components/StoreContactLink";
import { Header, Footer } from "@/components/SiteChrome";
import { BLOCK_LABELS, fullAddress, stores, type Store, type OnlineSource } from "@/lib/stores";
import { storeJsonLd } from "@/lib/jsonld";
import { catLabel, localePath, t, type DictKey, type Locale } from "@/lib/i18n";
import { buyerQuestions } from "@/lib/content/buyer-questions";

// Defense in depth: website comes from world-editable OSM data. Only render http(s).
function httpUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const p = new URL(u);
    return (p.protocol === "http:" || p.protocol === "https:") && !p.username && !p.password ? p.toString() : null;
  } catch {
    return null;
  }
}

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

export default function StorePage({ store, locale }: { store: Store; locale: Locale }) {
  const nearby = stores.filter((s) => s.block === store.block && s.slug !== store.slug).slice(0, 6);
  const mapsQuery = encodeURIComponent(fullAddress(store));
  const questions = buyerQuestions[store.slug]?.[locale];

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
  return (
    <>
      <Header locale={locale} altPath={`/stores/${store.slug}`} />
      <main lang={locale}>
        <JsonLd data={storeJsonLd(store)} />
        <StoreViewEvent slug={store.slug} />
        <div className="container store-page">
          <nav className="breadcrumb">
            <Link href={localePath(locale, "/") || "/"}>{t(locale, "breadcrumb_home")}</Link>
            {" / "}
            {BLOCK_LABELS[store.block]}
          </nav>
          <h1>{store.name}</h1>
          <p className="sub">
            {fullAddress(store)} · {BLOCK_LABELS[store.block]}
          </p>
          <div className="chips">
            <span className={`badge brand`}>{t(locale, `wr_${store.wholesale_retail}` as DictKey)}</span>
            {store.category.map((c) => (
              <span key={c} className="badge">
                {catLabel(locale, c)}
              </span>
            ))}
          </div>
          <SourceNote source={store.field_sources?.wholesale_retail} locale={locale} />
          {store.verified_at ? (
            <p className="note ok">
              ✓ {t(locale, "verified_note")} — {store.verified_at}
            </p>
          ) : null}
          <table className="detail-table">
            <tbody>
              <tr>
                <th>{t(locale, "field_address")}</th>
                <td>
                  {fullAddress(store)}
                  {" · "}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    rel="nofollow noopener"
                    target="_blank"
                  >
                    Google Maps ↗
                  </a>
                </td>
              </tr>
              {store.hours || store.field_sources?.hours ? (
                <tr>
                  <th>{t(locale, "field_hours")}</th>
                  <td>{store.hours ?? t(locale, "hours_unconfirmed")}<SourceNote source={store.field_sources?.hours} locale={locale} /></td>
                </tr>
              ) : null}
              {store.phone ? (
                <tr>
                  <th>{t(locale, "field_phone")}</th>
                  <td>
                    <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone">{store.phone}</StoreContactLink>
                    <SourceNote source={store.field_sources?.phone} locale={locale} />
                  </td>
                </tr>
              ) : null}
              {store.contact_email ? (
                <tr>
                  <th>{t(locale, "field_email")}</th>
                  <td>
                    <StoreContactLink href={`mailto:${store.contact_email}`} slug={store.slug} method="email">{store.contact_email}</StoreContactLink>
                    <SourceNote source={store.field_sources?.contact_email} locale={locale} />
                  </td>
                </tr>
              ) : null}
              {links.length > 0 ? (
                <tr>
                  <th>{t(locale, "field_links")}</th>
                  <td className="links-row">
                    {links.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 ? " · " : ""}
                        <StoreContactLink href={l.href} slug={store.slug} method="website" external>
                          {l.label} ↗
                        </StoreContactLink>
                      </span>
                    ))}
                    <SourceNote source={store.field_sources?.["links.website"]} locale={locale} />
                  </td>
                </tr>
              ) : null}
              {store.moq ? (
                <tr>
                  <th>{t(locale, "field_moq")}</th>
                  <td>{store.moq}</td>
                </tr>
              ) : null}
              {store.payment?.length ? (
                <tr>
                  <th>{t(locale, "field_payment")}</th>
                  <td>{store.payment.join(", ")}</td>
                </tr>
              ) : null}
              {store.languages?.length ? (
                <tr>
                  <th>{t(locale, "field_languages")}</th>
                  <td>
                    {store.languages.map((language) => locale === "es" && language === "Spanish" ? "Español" : language).join(", ")}
                    <SourceNote source={store.field_sources?.languages} locale={locale} />
                  </td>
                </tr>
              ) : null}
              {store.since ? (
                <tr>
                  <th>{t(locale, "since")}</th>
                  <td>{store.since.slice(0, 4)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
          {store.online_facts?.length ? (
            <section className="buying-details" aria-labelledby="buying-heading">
              <h2 id="buying-heading">{t(locale, "buying_h2")}</h2>
              <p>{t(locale, "online_note")}</p>
              <ul>
                {store.online_facts.map((fact) => (
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
          {questions ? <section className="buyer-questions" aria-labelledby="questions-heading">
            <h2 id="questions-heading">{t(locale, "buyer_questions_h2")}</h2>
            <p>{t(locale, "buyer_questions_note")}</p>
            <ul>{questions.map((question) => <li key={question}>{question}</li>)}</ul>
            <Link href={localePath(locale, "/guide/buying-checklist")}>{t(locale, "worksheet_link")}</Link>
          </section> : null}
          {!store.verified_at ? <p className="fineprint">{t(locale, "unverified_note")}</p> : null}
          <p>
            <a href={`mailto:hello@toydistrictlosangeles.com?subject=${encodeURIComponent(`Listing: ${store.name}`)}`}>
              {t(locale, "claim_cta")} ↗
            </a>
          </p>
          <StoreInquiryForm locale={locale} storeSlug={store.slug} storeName={store.name} />
          {nearby.length > 0 ? (
            <>
              <h2 style={{ marginTop: 36 }}>
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
