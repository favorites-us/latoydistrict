"use client";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, Boxes, Globe2, Menu, X } from "lucide-react";
import { t, localePath, type Locale } from "@/lib/i18n";
import { useBuyer } from "./BuyerProvider";
import { Button, buttonVariants } from "./ui/button";

export function Header({ locale, altPath }: { locale: Locale; altPath: string }) {
  const p = (path: string) => localePath(locale, path);
  const other: Locale = locale === "en" ? "es" : "en";
  const [open, setOpen] = useState(false);
  const { saved } = useBuyer();
  const es = locale === "es";
  return <>
    <a className="skip-link" href="#main-content">{es ? "Saltar al contenido" : "Skip to content"}</a>
    <header className="site-header">
      <div className="container header-inner">
        <Link href={p("/")} className="logo" onClick={() => setOpen(false)} aria-label="LA Toy District"><span className="logo-mark"><Boxes size={25} strokeWidth={1.7} /></span><span>LA Toy District<small>{es ? "Directorio de proveedores" : "The buyer’s directory"}</small></span></Link>
        <nav className="desktop-nav" aria-label={es ? "Navegación principal" : "Main navigation"}><Link href={p("/#directory")}>{t(locale, "nav_directory")}</Link><Link href={p("/guide/visiting")}>{es ? "Planear visita" : "Plan your visit"}</Link><Link href={p("/guide/buying-checklist")}>{es ? "Guía de compra" : "Buying guide"}</Link></nav>
        <div className="header-actions">
          <Link href={p("/saved")} aria-label={`${es ? "Mi lista" : "Saved suppliers"}: ${saved.length}`} className={buttonVariants({ variant: "outline", size: "sm" })}><Bookmark /><span className="saved-label">{es ? "Mi lista" : "Saved"}</span><span className="count-pill">{saved.length}</span></Link>
          <Link href={localePath(other, altPath)} className="language-link" rel="alternate" hrefLang={other} aria-label={es ? "Read in English" : "Leer en español"}><Globe2 size={16} /><span>{es ? "EN" : "ES"}</span></Link>
          <Button className="mobile-menu-button min-[901px]:hidden" variant="ghost" size="icon" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? (es ? "Cerrar menú" : "Close menu") : (es ? "Abrir menú" : "Open menu")} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
      </div>
      {open && <nav id="mobile-menu" className="mobile-nav" aria-label={es ? "Navegación móvil" : "Mobile navigation"} onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>{[["/", t(locale, "nav_directory")], ["/guide/visiting", t(locale, "nav_visiting")], ["/guide/wholesale-basics", t(locale, "nav_wholesale")], ["/guide/buying-checklist", t(locale, "nav_buyers")]].map(([path, label]) => <Link key={path} href={p(path)} onClick={() => setOpen(false)}>{label}</Link>)}</nav>}
    </header>
  </>;
}
export function Footer({ locale }: { locale: Locale }) {
  const p = (path: string) => localePath(locale, path);
  return <footer className="site-footer"><div className="container footer-grid"><div><Link href={p("/")} className="footer-brand">LA Toy District</Link><p>{t(locale, "footer_disclaimer")}</p></div><div className="footer-links"><Link href={p("/guide/visiting")}>{t(locale, "nav_visiting")}</Link><Link href={p("/guide/wholesale-basics")}>{t(locale, "nav_wholesale")}</Link><Link href={p("/photos")}>{locale === "es" ? "Fotos y solicitudes de eliminación" : "Photos & removal requests"}</Link><a href="mailto:hello@toydistrictlosangeles.com">{locale === "es" ? "Contactar al directorio" : "Contact the directory"}</a></div></div><div className="container footer-bottom"><p>{t(locale, "footer_sources")}</p><p>{t(locale, "footer_updated")}: 2026-07<br />© {new Date().getFullYear()} LA Toy District</p></div></footer>;
}
