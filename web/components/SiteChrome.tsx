import Link from "next/link";
import { t, localePath, type Locale } from "@/lib/i18n";

export function Header({ locale, altPath }: { locale: Locale; altPath: string }) {
  const p = (path: string) => localePath(locale, path);
  const other: Locale = locale === "en" ? "es" : "en";
  return (
    <header className="site-header">
      <div className="container">
        <Link href={p("/") || "/"} className="logo">
          LA Toy District
        </Link>
        <nav className="site-nav">
          <Link href={p("/") || "/"}>{t(locale, "nav_directory")}</Link>
          <Link href={p("/guide/visiting")}>{t(locale, "nav_visiting")}</Link>
          <Link href={p("/guide/wholesale-basics")}>{t(locale, "nav_wholesale")}</Link>
          <Link href={p("/guide/for/party-planners")}>{t(locale, "nav_buyers")}</Link>
        </nav>
        <Link href={localePath(other, altPath) || "/"} className="lang-switch" rel="alternate" hrefLang={other}>
          {locale === "en" ? "Español" : "English"}
        </Link>
      </div>
    </header>
  );
}

export function Footer({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <p>{t(locale, "footer_disclaimer")}</p>
        <p>
          {t(locale, "footer_updated")}: 2026-07 · © {new Date().getFullYear()} latoydistrict.com
        </p>
      </div>
    </footer>
  );
}
