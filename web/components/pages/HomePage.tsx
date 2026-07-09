import Link from "next/link";
import DirectoryBrowser from "@/components/DirectoryBrowser";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import { Header, Footer } from "@/components/SiteChrome";
import { stores } from "@/lib/stores";
import { websiteJsonLd } from "@/lib/jsonld";
import { t, localePath, type Locale } from "@/lib/i18n";

export default function HomePage({ locale }: { locale: Locale }) {
  const p = (path: string) => localePath(locale, path);
  return (
    <>
      <Header locale={locale} altPath="/" />
      <main lang={locale}>
        <JsonLd data={websiteJsonLd()} />
        <section className="hero">
          <div className="container">
            <h1>{t(locale, "home_h1")}</h1>
            <p>{t(locale, "home_sub")}</p>
            <div className="badge-row">
              <span className="badge brand">{stores.length} {t(locale, "stores_count")}</span>
              <span className="badge">Wall St · Winston St · Boyd St</span>
              <span className="badge">DTLA 90013</span>
            </div>
          </div>
        </section>
        <section className="section" id="directory">
          <div className="container">
            <h2>{t(locale, "directory_h2")}</h2>
            <DirectoryBrowser stores={stores} locale={locale} />
          </div>
        </section>
        <section className="section">
          <div className="container">
            <h2>{t(locale, "where_h2")}</h2>
            <p>{t(locale, "where_p")}</p>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <h2>{t(locale, "guides_h2")}</h2>
            <div className="guide-cards">
              <Link className="guide-card" href={p("/guide/visiting")}>
                <h3>{t(locale, "guide_visiting_title")}</h3>
                <p>{t(locale, "nav_visiting")}</p>
              </Link>
              <Link className="guide-card" href={p("/guide/wholesale-basics")}>
                <h3>{t(locale, "guide_wholesale_title")}</h3>
                <p>{t(locale, "nav_wholesale")}</p>
              </Link>
              <Link className="guide-card" href={p("/guide/for/party-planners")}>
                <h3>{t(locale, "guide_buyers_title")}</h3>
                <p>{t(locale, "lead_type_party")} · {t(locale, "lead_type_store")} · {t(locale, "lead_type_reseller")}</p>
              </Link>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <LeadForm locale={locale} />
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
