import type { MetadataRoute } from "next";
import { SITE_URL, stores } from "@/lib/stores";
import { buyerGuides } from "@/lib/content/guides";

function entry(enPath: string, priority: number): MetadataRoute.Sitemap[number] {
  const esPath = enPath === "/" ? "/es" : `/es${enPath}`;
  return {
    url: `${SITE_URL}${enPath}`,
    changeFrequency: "weekly",
    priority,
    alternates: {
      languages: { en: `${SITE_URL}${enPath}`, es: `${SITE_URL}${esPath}` },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", 1),
    entry("/guide/visiting", 0.9),
    entry("/guide/wholesale-basics", 0.8),
    ...Object.keys(buyerGuides).map((b) => entry(`/guide/for/${b}`, 0.8)),
    ...stores.map((s) => entry(`/stores/${s.slug}`, 0.6)),
  ];
}
