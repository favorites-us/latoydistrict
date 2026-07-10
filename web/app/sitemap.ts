import type { MetadataRoute } from "next";
import { SITE_URL, stores } from "@/lib/stores";
import { buyerGuides } from "@/lib/content/guides";

// One page => two <url> entries (EN + ES), each carrying the full hreflang
// cluster (en, es, x-default) so both language versions are explicitly listed
// and reciprocally linked — the form Google recommends for multilingual sites.
function entries(enPath: string, priority: number): MetadataRoute.Sitemap {
  const esPath = enPath === "/" ? "/es" : `/es${enPath}`;
  const enUrl = `${SITE_URL}${enPath}`;
  const esUrl = `${SITE_URL}${esPath}`;
  const languages = { en: enUrl, es: esUrl, "x-default": enUrl };
  const common = { changeFrequency: "weekly" as const, priority, alternates: { languages } };
  return [
    { url: enUrl, ...common },
    { url: esUrl, ...common },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entries("/", 1),
    entries("/guide/visiting", 0.9),
    entries("/guide/wholesale-basics", 0.8),
    ...Object.keys(buyerGuides).map((b) => entries(`/guide/for/${b}`, 0.8)),
    ...stores.map((s) => entries(`/stores/${s.slug}`, 0.6)),
  ].flat();
}
