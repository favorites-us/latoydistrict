"use client";
import { useRef, useState } from "react";
import StorePhoto from "./StorePhoto";
import type { StorePhoto as Photo } from "@/lib/photos";
import type { Locale } from "@/lib/i18n";
export default function StoreGallery({ photos, locale, category }: { photos: Photo[]; locale: Locale; category: string }) {
  const [active, setActive] = useState(0);
  const gallery = useRef<HTMLDivElement>(null);
  return <section id="photos" className="gallery-section" aria-label={locale === "es" ? "Fotos del negocio" : "Business photos"}>
    <div className="store-gallery" ref={gallery} onScroll={() => { const el = gallery.current; if (el) setActive(Math.round(el.scrollLeft / el.clientWidth)); }}>{photos.map((photo, index) => <StorePhoto priority={index === 0} key={photo.id} photo={photo} locale={locale} category={category} />)}</div>
    <div className="gallery-controls"><span aria-live="polite">{active + 1} / {photos.length}</span>{photos.map((photo, index) => <button key={photo.id} aria-label={`${locale === "es" ? "Foto" : "Photo"} ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => gallery.current?.scrollTo({ left: index * gallery.current.clientWidth, behavior: "smooth" })}><span /></button>)}</div>
  </section>;
}
