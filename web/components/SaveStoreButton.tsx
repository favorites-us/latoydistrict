"use client";

import { Bookmark, Check } from "lucide-react";
import { useState } from "react";
import { useBuyer } from "./BuyerProvider";
import { Button } from "./ui/button";
import type { Locale } from "@/lib/i18n";

export default function SaveStoreButton({ slug, name, locale, compact = false }: { slug: string; name: string; locale: Locale; compact?: boolean }) {
  const { saved, ready, persistent, toggle } = useBuyer();
  const [message, setMessage] = useState("");
  const selected = saved.includes(slug);
  const label = selected ? (locale === "es" ? "Guardado" : "Saved") : (locale === "es" ? "Guardar" : "Save");
  return <span className="save-control">
    <Button type="button" variant={selected ? "secondary" : "outline"} size={compact ? "icon" : "default"} disabled={!ready} aria-pressed={selected} aria-label={`${label}: ${name}`} title={label} onClick={() => {
      const ok = toggle(slug);
      setMessage(ok ? (!persistent ? (locale === "es" ? "Solo en esta sesión" : "Saved for this session only") : "") : (locale === "es" ? "Máximo 12. Quite una tienda de su lista." : "12-store limit. Remove a store from your list first."));
    }}>{selected ? <Check /> : <Bookmark />}{!compact && label}</Button>
    {message && <span role="status" className="save-message">{message}</span>}
  </span>;
}
