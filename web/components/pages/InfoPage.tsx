import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { Header, Footer } from "@/components/SiteChrome";
import { CONTACT_EMAIL, PRIVACY_EFFECTIVE_DATE, siteInfo, type InfoPageKey } from "@/lib/content/site-info";
import { localePath, t, type Locale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/stores";

export default function InfoPage({ page, locale }: { page: InfoPageKey; locale: Locale }) {
  const content = siteInfo[page][locale];
  const path = `/${page}`;
  return <>
    <Header locale={locale} altPath={path} />
    <main id="main-content" lang={locale}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": page === "about" ? "AboutPage" : page === "contact" ? "ContactPage" : "WebPage",
        name: content.title,
        description: content.description,
        url: `${SITE_URL}${localePath(locale, path)}`,
        inLanguage: locale,
        publisher: {
          "@type": "Organization",
          name: "Favorites",
          legalName: "Yeojin Kim DBA Favorites",
          email: CONTACT_EMAIL,
          address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA", addressCountry: "US" },
        },
      }} />
      <article className="container prose">
        <div className="guide-copy">
          <nav className="breadcrumb" aria-label={locale === "es" ? "Ruta de navegación" : "Breadcrumb"}>
            <Link href={localePath(locale, "/")}>{t(locale, "breadcrumb_home")}</Link>
            {" / "}<span aria-current="page">{content.title}</span>
          </nav>
          <h1>{content.title}</h1>
          <p className="lede">{content.description}</p>
          {page === "privacy" && <p className="source-note">{locale === "es" ? "Fecha de entrada en vigor" : "Effective date"}: <time dateTime={PRIVACY_EFFECTIVE_DATE}>{PRIVACY_EFFECTIVE_DATE}</time></p>}
          {content.sections.map((section) => <section key={section.id} aria-labelledby={section.id}>
            <h2 id={section.id}>{section.h}</h2>
            {section.ps.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            {section.links && <ul className="guide-links">
              {section.links.map((link) => <li key={link.href}>
                {link.href.startsWith("/")
                  ? <Link href={localePath(locale, link.href)}>{link.label}</Link>
                  : <a href={link.href}>{link.label}</a>}
              </li>)}
            </ul>}
          </section>)}
        </div>
      </article>
    </main>
    <Footer locale={locale} />
  </>;
}
