import { fullAddress, SITE_URL, type Store } from "./stores";

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
    ...(store.phone ? { telephone: store.phone } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "LA Toy District Directory",
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
