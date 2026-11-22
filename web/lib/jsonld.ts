import { DEFAULT_OG_IMAGE } from "./meta";
import { BLOCK_LABELS, fullAddress, SITE_URL, type Store } from "./stores";

export function storeJsonLd(store: Store) {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    url: `${SITE_URL}/stores/${store.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address.unit
        ? `${store.address.line1} #${store.address.unit}`
        : store.address.line1,
      addressLocality: "Los Angeles",
      addressRegion: "CA",
      postalCode: store.address.zip,
      addressCountry: "US",
    },
    ...(store.address.lat && store.address.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: store.address.lat,
            longitude: store.address.lng,
          },
        }
      : {}),
    // New directory-only phones retain their uncertainty label in the UI;
    // don't export them as an unqualified structured-data telephone claim.
    ...(store.phone && store.field_sources?.phone?.type !== "directory" ? { telephone: store.phone } : {}),
    ...(() => {
      const l = store.links ?? {};
      const sameAs = [l.website, l.facebook, l.instagram]
        .filter((u): u is string => typeof u === "string" && /^https?:\/\//i.test(u));
      return sameAs.length ? { sameAs } : {};
    })(),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LA Toy District",
    alternateName: "LA Toy District Directory",
    publisher: { "@type": "Organization", name: "LA Toy District", url: SITE_URL },
    url: SITE_URL,
    inLanguage: ["en", "es"],
  };
}

export function faqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(locale: import("./i18n").Locale, path: string, name: string) {
  const home = locale === "es" ? "/es" : "/";
  const page = locale === "es" ? `/es${path}` : path;
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "es" ? "Inicio" : "Home", item: `${SITE_URL}${home}` },
      { "@type": "ListItem", position: 2, name, item: `${SITE_URL}${page}` },
    ],
  };
}

export function articleJsonLd(guide: import("./content/guides").Guide, locale: import("./i18n").Locale, path: string) {
  const organization = { "@type": "Organization", name: "LA Toy District", url: SITE_URL };
  return {
    "@context": "https://schema.org", "@type": "Article",
    headline: guide.title, description: guide.description, inLanguage: locale,
    image: DEFAULT_OG_IMAGE,
    ...(guide.published_at ? { datePublished: guide.published_at } : {}),
    dateModified: guide.updated_at ?? guide.reviewed_at, author: organization, publisher: organization,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}${locale === "es" ? `/es${path}` : path}` },
  };
}

export function storeBreadcrumbJsonLd(store: Store, locale: import("./i18n").Locale) {
  const breadcrumb = breadcrumbJsonLd(locale, `/street/${store.block}`, BLOCK_LABELS[store.block]);
  breadcrumb.itemListElement.push({ "@type": "ListItem", position: 3, name: store.name, item: `${SITE_URL}${locale === "es" ? "/es" : ""}/stores/${store.slug}` });
  return breadcrumb;
}
