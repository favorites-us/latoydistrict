"use client";

import Link from "next/link";
import { useState } from "react";
import { t, localePath, type Locale } from "@/lib/i18n";

export function Header({ locale, altPath }: { locale: Locale; altPath: string }) {
  const p = (path: string) => localePath(locale, path);
  const other: Locale = locale === "en" ? "es" : "en";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="container">
        <Link href={p("/") || "/"} className="logo" onClick={close}>
          LA Toy District
        </Link>
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
          <span className="nav-toggle-bar" />
        </button>
        <nav className={`site-nav${open ? " open" : ""}`}>
          <Link href={p("/") || "/"} onClick={close}>
            {t(locale, "nav_directory")}
          </Link>
          <Link href={p("/guide/visiting")} onClick={close}>
            {t(locale, "nav_visiting")}
          </Link>
          <Link href={p("/guide/wholesale-basics")} onClick={close}>
            {t(locale, "nav_wholesale")}
          </Link>
          <Link href={p("/guide/for/party-planners")} onClick={close}>
            {t(locale, "nav_buyers")}
          </Link>
          <Link
            href={localePath(other, altPath) || "/"}
            className="lang-switch"
            rel="alternate"
            hrefLang={other}
            onClick={close}
          >
            {locale === "en" ? "Español" : "English"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>{t(locale, "footer_disclaimer")}</p>
        <p>{t(locale, "footer_sources")}</p>
        <p>
          {t(locale, "footer_updated")}: 2026-07 · © {new Date().getFullYear()} toydistrictlosangeles.com
        </p>
      </div>
    </footer>
  );
}
