import type { Metadata } from "next";
import { localePath, type Locale } from "./i18n";
import { SITE_URL } from "./stores";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image`;

export function socialMeta(enPath: string, locale: Locale, title: string, description: string): Metadata {
  const image = enPath.startsWith("/stores/") ? `${SITE_URL}${enPath}/opengraph-image` : DEFAULT_OG_IMAGE;
  return {
    openGraph: { title, description, url: `${SITE_URL}${localePath(locale, enPath)}`, siteName: "LA Toy District", locale: locale === "es" ? "es_US" : "en_US", type: enPath.startsWith("/guide/") ? "article" : "website", images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

// hreflang alternates for a page identified by its EN path. ES slugs mirror EN.
export function altMeta(enPath: string, locale: Locale, title: string, description: string): Metadata {
  const esPath = enPath === "/" ? "/es" : `/es${enPath}`;
  return {
    title,
    description,
    ...socialMeta(enPath, locale, title, description),
    alternates: {
      canonical: locale === "en" ? enPath : esPath,
      languages: { en: enPath, es: esPath, "x-default": enPath },
    },
  };
}

// Store translations remain accessible, but are excluded from indexing/hreflang.
export function storeMeta(enPath: string, locale: Locale, title: string, description: string): Metadata {
  return {
    title, description,
    ...socialMeta(enPath, locale, title, description),
    alternates: { canonical: locale === "en" ? enPath : `/es${enPath}` },
    ...(locale === "es" ? { robots: { index: false, follow: true } } : {}),
  };
}

import { fullAddress, type Store } from './stores';
import { catLabel } from './i18n';

export function storeTitle(store: Store, locale: Locale): string {
  return `${store.name} — ${store.address.line1}, ${locale === 'es' ? 'Los Ángeles' : 'Los Angeles'}`;
}

/** Prefer complete factual sentences; optional claims are the first to go. */
export function storeDescription(store: Store, locale: Locale): string {
  const es = locale === 'es';
  const category = store.category.map(c => catLabel(locale, c)).join(', ');
  const year = store.since?.match(/^\d{4}/)?.[0];
  const address = fullAddress(store).replace('Los Angeles', es ? 'Los Ángeles' : 'Los Angeles');
  const location = es ? `${store.name}, ${address}, en el Toy District de LA.` : `${store.name}, ${address}, in LA's Toy District.`;
  const registration = es ? `Ficha de ${category}; registro comercial de la Ciudad de LA${year ? ` desde ${year}` : ''}.` : `${category} listing; City of LA business registration${year ? ` since ${year}` : ''}.`;
  const sentences = [location, registration];
  if (store.online_facts?.some(f => f.source.type === 'business')) sentences.push(es ? 'Información de compra publicada con fuentes.' : 'Published buying information with sources.');
  if (store.phone) sentences.push(es ? 'Teléfono publicado.' : 'Phone listed.');
  while (sentences.length > 2 && sentences.join(' ').length > 155) sentences.pop();
  if (sentences.join(' ').length <= 155) return sentences.join(' ');
  // Long names/addresses leave too little room for the registration sentence.
  // Keep the full location and category when they fit, then location alone.
  const short = `${location} ${es ? `Ficha de ${category}.` : `${category} listing.`}`;
  if (short.length <= 155) return short;
  if (location.length <= 155) return location;
  return `${location.slice(0, 154).replace(/\s+\S*$/, '').replace(/[.,;:]$/, '')}…`;
}

export function storePageMeta(store: Store, locale: Locale): Metadata {
  return {
    ...storeMeta(`/stores/${store.slug}`, locale, storeTitle(store, locale), storeDescription(store, locale)),
    ...(store.listing_scope === "non_merchant" ? { robots: { index: false, follow: true } } : {}),
  };
}
