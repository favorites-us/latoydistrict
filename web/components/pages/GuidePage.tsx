import Link from "next/link";
import JsonLd from "@/components/JsonLd";
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
      <main lang={locale}>
        {guide.faq ? <JsonLd data={faqJsonLd(guide.faq)} /> : null}
        <article className="container prose">
          <nav className="breadcrumb">
            <Link href={localePath(locale, "/") || "/"}>{t(locale, "breadcrumb_home")}</Link>
            {" / "}
            {t(locale, "guides_h2")}
          </nav>
          <h1>{guide.title}</h1>
          <p className="lede">{guide.description}</p>
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
            </section>
          ))}
        </article>
      </main>
      <Footer locale={locale} />
    </>
  );
}
