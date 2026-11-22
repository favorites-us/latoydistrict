import { streetGroups } from "@/lib/directory-navigation";
import type { MetadataRoute } from "next";
import { SITE_URL, stores } from "@/lib/stores";
import { buyerGuides } from "@/lib/content/guides";

import { INDEX_CONTENT_DATE, STREET_CONTENT_DATE, GUIDE_CONTENT_DATE, STORE_CONTENT_DATE, INFO_CONTENT_DATE, HOME_CONTENT_DATE, PHOTOS_CONTENT_DATE } from "@/lib/content-dates";

// One indexable page => two <url> entries (EN + ES), each carrying the full hreflang
// cluster (en, es, x-default) so both language versions are explicitly listed
// and reciprocally linked — the form Google recommends for multilingual sites.
function entries(enPath: string, priority: number, lastModified = GUIDE_CONTENT_DATE): MetadataRoute.Sitemap {
  const esPath = enPath === "/" ? "/es" : `/es${enPath}`;
  const enUrl = `${SITE_URL}${enPath}`;
  const esUrl = `${SITE_URL}${esPath}`;
  const languages = { en: enUrl, es: esUrl, "x-default": enUrl };
  const common = { lastModified, changeFrequency: "weekly" as const, priority, alternates: { languages } };
  return [
    { url: enUrl, ...common },
    { url: esUrl, ...common },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entries("/", 1, HOME_CONTENT_DATE),
    { url: `${SITE_URL}/stores`, priority: 0.8, lastModified: INDEX_CONTENT_DATE },
    ...streetGroups(stores).map(({ block }) => ({ url: `${SITE_URL}/street/${block}`, priority: 0.7, lastModified: STREET_CONTENT_DATE })),
    entries("/guide/visiting", 0.9),
    entries("/guide/wholesale-toys-los-angeles", 0.9),
    entries("/guide/wholesale-basics", 0.8),
    entries("/guide/buying-checklist", 0.8),
    entries("/photos", 0.2, PHOTOS_CONTENT_DATE),
    entries("/about", 0.3, INFO_CONTENT_DATE),
    entries("/privacy", 0.2, INFO_CONTENT_DATE),
    entries("/contact", 0.3, INFO_CONTENT_DATE),
    ...Object.keys(buyerGuides).map((b) => entries(`/guide/for/${b}`, 0.8)),
    ...stores.filter(s => s.listing_scope !== "non_merchant").map((s) => ({ url: `${SITE_URL}/stores/${s.slug}`, priority: 0.6, lastModified: s.verified_at && s.verified_at > STORE_CONTENT_DATE ? s.verified_at : STORE_CONTENT_DATE })),
  ].flat();
}
