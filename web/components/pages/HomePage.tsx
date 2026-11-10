import Link from "next/link";
import { ArrowUpRight, MapPin, ClipboardList, Store } from "lucide-react";
import DirectoryBrowser from "@/components/DirectoryBrowser";
import LeadForm from "@/components/LeadForm";
import JsonLd from "@/components/JsonLd";
import { Header, Footer } from "@/components/SiteChrome";
import { stores } from "@/lib/stores";
import { websiteJsonLd } from "@/lib/jsonld";
import { t, localePath, type Locale } from "@/lib/i18n";
export default function HomePage({ locale }: { locale: Locale }) {
  const p = (path: string) => localePath(locale, path);
  const es = locale === "es";
  return <><Header locale={locale} altPath="/" /><main lang={locale} id="main-content"><JsonLd data={websiteJsonLd()} />
    <section className="directory-hero container" aria-labelledby="directory-title">
      <div>
        <h1 id="directory-title">{es ? "Encuentre proveedores en el Toy District" : "Find suppliers in LA’s Toy District"}</h1>
        <p className="hero-description">{es ? "Juguetes, regalos y artículos de fiesta. Compare proveedores y prepare su visita." : "Toys, gifts and party supplies. Compare businesses and plan your visit."}</p>
      </div>
      <Link className="hero-visit" href={p("/guide/visiting")}><MapPin size={17} aria-hidden="true" />{es ? "Cómo llegar y estacionarse" : "Getting here & parking"}</Link>
    </section>
    <section id="directory" className="directory-section"><div className="container"><DirectoryBrowser stores={stores} locale={locale} /></div></section>
    <section className="planning-section container"><div className="section-intro"><h2>{es ? "Prepare su visita" : "Before you visit"}</h2><p>{es ? "Prepare sus preguntas, documentos y recogida antes de llegar." : "Know what to ask, what to bring and how you’ll collect your order."}</p></div><div className="guide-cards">{[{ path: "/guide/visiting", icon: MapPin, title: t(locale, "guide_visiting_title"), detail: es ? "Llegar, estacionarse y recoger su pedido." : "Getting there, parking and collecting your order." }, { path: "/guide/wholesale-basics", icon: Store, title: t(locale, "guide_wholesale_title"), detail: es ? "Qué confirmar antes de su primera compra." : "What to confirm before your first purchase." }, { path: "/guide/buying-checklist", icon: ClipboardList, title: t(locale, "guide_buyers_title"), detail: es ? "Preguntas útiles y una hoja para imprimir." : "Useful questions and a worksheet to take along." }].map(({ path, icon: Icon, title, detail }) => <Link key={path} className="guide-card" href={p(path)}><Icon className="guide-icon" /><h3>{title}</h3><p>{detail}</p><ArrowUpRight className="guide-arrow" /></Link>)}</div></section>
    <section className="district-context container"><div><h2>{t(locale, "where_h2")}</h2><p>{t(locale, "where_p")}</p></div><LeadForm locale={locale} /></section>
  </main><Footer locale={locale} /></>;
}
