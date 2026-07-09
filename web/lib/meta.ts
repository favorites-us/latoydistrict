import type { Metadata } from "next";
import type { Locale } from "./i18n";

// hreflang alternates for a page identified by its EN path. ES slugs mirror EN.
export function altMeta(enPath: string, locale: Locale, title: string, description: string): Metadata {
  const esPath = enPath === "/" ? "/es" : `/es${enPath}`;
  return {
    title,
    description,
    alternates: {
      canonical: locale === "en" ? enPath : esPath,
      languages: { en: enPath, es: esPath, "x-default": enPath },
    },
  };
}
