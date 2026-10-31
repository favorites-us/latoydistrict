"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { readShortlist, SHORTLIST_KEY, SHORTLIST_LIMIT } from "@/lib/buyer-tools";
import { track } from "@/lib/analytics";

const Context = createContext<{ saved: string[]; ready: boolean; persistent: boolean; toggle: (slug: string) => boolean }>({ saved: [], ready: false, persistent: true, toggle: () => false });

export function BuyerProvider({ children, knownSlugs }: { children: React.ReactNode; knownSlugs: string[] }) {
  const known = useMemo(() => new Set(knownSlugs), [knownSlugs]);
  const [saved, setSaved] = useState<string[]>([]);
  const current = useRef<string[]>([]);
  const [ready, setReady] = useState(false);
  const [persistent, setPersistent] = useState(true);
  useEffect(() => {
    const refresh = () => {
      try { current.current = readShortlist(localStorage.getItem(SHORTLIST_KEY), known); setSaved(current.current); }
      catch { setPersistent(false); }
    };
    refresh(); setReady(true);
    const sync = (e: StorageEvent) => { if (e.key === SHORTLIST_KEY || e.key === null) refresh(); };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [known]);
  function toggle(slug: string) {
    if (!ready || !known.has(slug)) return false;
    const exists = current.current.includes(slug);
    if (!exists && current.current.length >= SHORTLIST_LIMIT) return false;
    const next = exists ? current.current.filter((item) => item !== slug) : [...current.current, slug];
    current.current = next; setSaved(next);
    try { localStorage.setItem(SHORTLIST_KEY, JSON.stringify({ version: 1, slugs: next })); }
    catch { setPersistent(false); }
    track(exists ? "shortlist_remove" : "shortlist_add", { store_slug: slug, count: next.length });
    return true;
  }
  return <Context.Provider value={{ saved, ready, persistent, toggle }}>{children}</Context.Provider>;
}

export function useBuyer() { return useContext(Context); }
