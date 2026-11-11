"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import CategoryVisual from "./CategoryVisual";
import type { StorePhoto as Photo } from "@/lib/photos";
import { localePath, type Locale } from "@/lib/i18n";
import PhotoReport from "./PhotoReport";

export default function StorePhoto({ photo, locale, compact = false, showSource = false, category = "general" }: { photo: Photo; locale: Locale; compact?: boolean; showSource?: boolean; category?: string }) {
  const [unavailable, setUnavailable] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth === 0) setUnavailable(true);
  }, []);
  const es = locale === "es";
  const sourceLabel = `${es ? "Fuente y eliminación de la foto" : "Photo source and removal"}${photo.id.startsWith("american-silk-catalog-") ? (es ? ". Catálogo. Confirme precios." : ". Catalog. Confirm prices.") : ""}`;
  return <figure className={`store-photo${compact ? " compact" : ""}`}>
    {/* Keep the private no-store route uncached so removal takes effect immediately. */}
    {unavailable ? <div className="unavailable-visual"><CategoryVisual category={category} locale={locale} showLabel={!compact} /></div> : <Image unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" ref={image} src={`/api/store-photos/${photo.id}`} alt={photo.alt[locale]} width={photo.width} height={photo.height} loading="lazy" decoding="async" onError={() => setUnavailable(true)} />}
    {compact && showSource && <figcaption className="compact-attribution"><a href={`${localePath(locale, `/stores/${photo.store_slug}`)}#photo-source-${photo.id}`} aria-label={sourceLabel} title={sourceLabel}>{es ? "Fuente" : "Source"}</a></figcaption>}
    {!compact && <figcaption><details className="photo-details" id={`photo-source-${photo.id}`}><summary>{es ? "Fuente, detalles y eliminación" : "Source, details & removal"}</summary><p>{photo.caption[locale]}</p><p>{es ? "Fuente:" : "Source:"} <a href={photo.source_page_url} target="_blank" rel="nofollow noopener noreferrer">{photo.source_label}</a> · <time dateTime={photo.retrieved_at}>{photo.retrieved_at}</time></p><p>{es ? "No se ha confirmado el permiso de uso. No implica afiliación." : "Permission to reuse has not been confirmed. No affiliation implied."}</p><PhotoReport photo={photo} locale={locale} onRemoved={() => setUnavailable(true)} /></details></figcaption>}
  </figure>;
}
