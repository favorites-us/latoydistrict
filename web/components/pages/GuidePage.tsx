import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import BuyerWorksheet from "@/components/BuyerWorksheet";
import { Header, Footer } from "@/components/SiteChrome";
import type { Guide } from "@/lib/content/guides";
import { faqJsonLd } from "@/lib/jsonld";
import { localePath, t, type Locale } from "@/lib/i18n";

export default function GuidePage({
  guide,
  locale,
  path,
}: {
  guide: Guide;
  locale: Locale;
  path: string;
}) {
  return (
    <>
      <Header locale={locale} altPath={path} />
      <main lang={locale} className={guide.worksheet ? "worksheet-page" : undefined}>
        {guide.faq ? <JsonLd data={faqJsonLd(guide.faq)} /> : null}
        <article className="container prose">
          <div className="guide-copy">
            <nav className="breadcrumb">
              <Link href={localePath(locale, "/") || "/"}>{t(locale, "breadcrumb_home")}</Link>
              {" / "}
              {t(locale, "guides_h2")}
            </nav>
            <h1>{guide.title}</h1>
            <p className="lede">{guide.description}</p>
            <p className="source-note">{t(locale, "guide_reviewed")} <time dateTime={guide.reviewed_at}>{guide.reviewed_at}</time></p>
            {guide.worksheet ? <p><a href="#worksheet-heading">{t(locale, "worksheet_jump")}</a></p> : null}
            {guide.sections.map((sec) => (
              <section key={sec.h}>
                <h2>{sec.h}</h2>
                {sec.ps.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {sec.bullets ? (
                  <ul>
                    {sec.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {sec.links ? <ul className="guide-links">
                  {sec.links.map((link) => <li key={link.href}>
                    <Link href={localePath(locale, link.href)}>{link.label}</Link>
                  </li>)}
                </ul> : null}
                {sec.sources?.map((source) => <p className="source-note" key={source.href}>
                  <a href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>
                  {" · "}{t(locale, "source_checked")} <time dateTime={source.checked_at}>{source.checked_at}</time>
                </p>)}
              </section>
            ))}
            {guide.faq ? <section aria-labelledby="faq-heading">
              <h2 id="faq-heading">{t(locale, "guide_faq")}</h2>
              {guide.faq.map((item) => <div key={item.q}>
                <h3>{item.q}</h3><p>{item.a}</p>
              </div>)}
            </section> : null}
            {!guide.worksheet ? <p className="guide-next"><Link href={localePath(locale, "/guide/buying-checklist")}>{t(locale, "worksheet_link")}</Link></p> : null}
          </div>
          {guide.worksheet ? <BuyerWorksheet locale={locale} /> : null}
        </article>
      </main>
      <Footer locale={locale} />
    </>
  );
}
