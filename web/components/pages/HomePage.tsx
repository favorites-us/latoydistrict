import Link from "next/link";
import { ArrowUpRight, MapPin, ClipboardList, Store, Navigation } from "lucide-react";
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
    <section className="directory-hero container"><div><p className="location-line"><MapPin size={16} />{es ? "Centro de Los Ángeles, California" : "Downtown Los Angeles, California"}</p><h1>{es ? "Su próxima compra empieza aquí." : "Your next buying trip starts here."}</h1><p className="hero-description">{es ? "Encuentre proveedores de juguetes, regalos y artículos de fiesta. Compare la información publicada y prepare su visita al Toy District." : "Find toy, gift and party suppliers. Compare published buying details and make a plan for the Toy District."}</p></div><div className="district-sign"><div className="district-sign-top"><Navigation size={19} /><span>Los Angeles / 90013</span></div><strong>Toy<br />District<span className="sign-dot" /></strong><div className="district-sign-bottom"><span>3rd & 5th St</span><span>Wall · Winston · Boyd</span></div><div className="sign-streets" aria-hidden="true"><i /><i /><i /><i /></div></div></section>
    <section id="directory" className="directory-section"><div className="container"><DirectoryBrowser stores={stores} locale={locale} /></div></section>
    <section className="planning-section container"><div className="section-intro"><p className="location-line"><ClipboardList size={17} />{es ? "Antes de salir" : "Before you head out"}</p><h2>{es ? "Menos dudas. Una visita mejor preparada." : "A little planning. A better buying trip."}</h2><p>{es ? "Prepare sus preguntas, documentos y recogida antes de llegar." : "Know what to ask, what to bring and how you’ll collect your order."}</p></div><div className="guide-cards">{[{ path: "/guide/visiting", icon: MapPin, title: t(locale, "guide_visiting_title"), detail: es ? "Llegar, estacionarse y recoger su pedido." : "Getting there, parking and collecting your order." }, { path: "/guide/wholesale-basics", icon: Store, title: t(locale, "guide_wholesale_title"), detail: es ? "Qué confirmar antes de su primera compra." : "What to confirm before your first purchase." }, { path: "/guide/buying-checklist", icon: ClipboardList, title: t(locale, "guide_buyers_title"), detail: es ? "Preguntas útiles y una hoja para imprimir." : "Useful questions and a worksheet to take along." }].map(({ path, icon: Icon, title, detail }) => <Link key={path} className="guide-card" href={p(path)}><Icon className="guide-icon" /><h3>{title}</h3><p>{detail}</p><ArrowUpRight className="guide-arrow" /></Link>)}</div></section>
    <section className="district-context container"><div><h2>{t(locale, "where_h2")}</h2><p>{t(locale, "where_p")}</p></div><LeadForm locale={locale} /></section>
  </main><Footer locale={locale} /></>;
}
