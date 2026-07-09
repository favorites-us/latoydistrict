"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import StoreCard from "./StoreCard";
import type { Store } from "@/lib/stores";
import { BLOCK_LABELS } from "@/lib/stores";
import { catLabel, t, type Locale } from "@/lib/i18n";

const DistrictMap = dynamic(() => import("./DistrictMap"), {
  ssr: false,
  loading: () => <div className="map-placeholder">Loading map…</div>,
});

const CATEGORIES = ["toys", "plush", "figures", "party", "seasonal", "electronics", "gifts", "general"];

export default function DirectoryBrowser({ stores, locale }: { stores: Store[]; locale: Locale }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [block, setBlock] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return stores.filter((s) => {
      if (cat && !s.category.includes(cat as Store["category"][number])) return false;
      if (block && s.block !== block) return false;
      if (needle && !`${s.name} ${s.address.line1}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [stores, q, cat, block]);

  const mapStores = useMemo(
    () =>
      filtered
        .filter((s) => s.address.lat && s.address.lng)
        .map((s) => ({
          slug: s.slug,
          name: s.name,
          line1: s.address.line1,
          lat: s.address.lat as number,
          lng: s.address.lng as number,
        })),
    [filtered],
  );

  return (
    <>
      <div className="map-wrap">
        <DistrictMap stores={mapStores} locale={locale} />
      </div>
      <div className="toolbar">
        <input
          type="search"
          placeholder={t(locale, "search_placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={t(locale, "search_placeholder")}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label={t(locale, "filter_all")}>
          <option value="">{t(locale, "filter_all")}</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {catLabel(locale, c)}
            </option>
          ))}
        </select>
        <select value={block} onChange={(e) => setBlock(e.target.value)} aria-label={t(locale, "filter_block")}>
          <option value="">{t(locale, "filter_block")}</option>
          {Object.entries(BLOCK_LABELS).map(([slug, label]) => (
            <option key={slug} value={slug}>
              {label}
            </option>
          ))}
        </select>
        <span className="badge" style={{ alignSelf: "center" }}>
          {filtered.length} {t(locale, "stores_count")}
        </span>
      </div>
      <div className="store-grid">
        {filtered.map((s) => (
          <StoreCard key={s.slug} store={s} locale={locale} />
        ))}
      </div>
    </>
  );
}
