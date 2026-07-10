import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import StoreCard from "@/components/StoreCard";
import StoreInquiryForm from "@/components/StoreInquiryForm";
import StoreViewEvent from "@/components/StoreViewEvent";
import { Header, Footer } from "@/components/SiteChrome";
import { BLOCK_LABELS, fullAddress, stores, type Store } from "@/lib/stores";
import { storeJsonLd } from "@/lib/jsonld";
import { catLabel, localePath, t, type DictKey, type Locale } from "@/lib/i18n";

// Defense in depth: website comes from world-editable OSM data. Only render http(s).
function httpUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : null;
  } catch {
    return null;
  }
}

export default function StorePage({ store, locale }: { store: Store; locale: Locale }) {
  const nearby = stores.filter((s) => s.block === store.block && s.slug !== store.slug).slice(0, 6);
  const mapsQuery = encodeURIComponent(fullAddress(store));

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
              {store.hours ? (
                <tr>
                  <th>{t(locale, "field_hours")}</th>
                  <td>{store.hours}</td>
                </tr>
              ) : null}
              {store.phone ? (
                <tr>
                  <th>{t(locale, "field_phone")}</th>
                  <td>{store.phone}</td>
                </tr>
              ) : null}
              {links.length > 0 ? (
                <tr>
                  <th>{t(locale, "field_links")}</th>
                  <td className="links-row">
                    {links.map((l, i) => (
                      <span key={l.href}>
                        {i > 0 ? " · " : ""}
                        <a href={l.href} rel="nofollow noopener" target="_blank">
                          {l.label} ↗
                        </a>
                      </span>
                    ))}
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
                  <td>{store.languages.join(", ")}</td>
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
          {!store.verified_at ? <p className="fineprint">{t(locale, "unverified_note")}</p> : null}
          <p>
            <a href={`mailto:hello@latoydistrict.com?subject=${encodeURIComponent(`Listing: ${store.name}`)}`}>
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
