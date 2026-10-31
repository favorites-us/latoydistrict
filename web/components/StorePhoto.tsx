"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { StorePhoto as Photo } from "@/lib/photos";
import { localePath, type Locale } from "@/lib/i18n";
import PhotoReport from "./PhotoReport";

export default function StorePhoto({ photo, locale, compact = false }: { photo: Photo; locale: Locale; compact?: boolean }) {
  const [unavailable, setUnavailable] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth === 0) setUnavailable(true);
  }, []);
  const es = locale === "es";
  if (unavailable) return <div className="photo-unavailable"><ImageOff size={22} /><span>{es ? "Foto no disponible" : "Photo unavailable"}</span></div>;
  return <figure className={`store-photo${compact ? " compact" : ""}`}>
    <img ref={image} src={`/api/store-photos/${photo.id}`} alt={photo.alt[locale]} width={photo.width} height={photo.height} loading="lazy" decoding="async" onError={() => setUnavailable(true)} />
    <figcaption>{compact ? <><p>{es ? "Catálogo. Confirme precios." : "Catalog. Confirm prices."}</p><Link href={localePath(locale, `/stores/${photo.store_slug}#photos`)}>{es ? "Fuente y derechos" : "Source & rights"}</Link></> : <><p>{photo.caption[locale]}</p><p>{es ? "Fuente:" : "Source:"} <a href={photo.source_page_url} target="_blank" rel="nofollow noopener noreferrer">{photo.source_label}</a> · <time dateTime={photo.retrieved_at}>{photo.retrieved_at}</time></p><p>{es ? "No se ha confirmado el permiso de uso. No implica afiliación." : "Permission to reuse has not been confirmed. No affiliation implied."}</p><PhotoReport photo={photo} locale={locale} onRemoved={() => setUnavailable(true)} /></>}</figcaption>
  </figure>;
}
