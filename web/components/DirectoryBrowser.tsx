"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, List, Map, X, Bookmark, BookOpen } from "lucide-react";
import Link from "next/link";
import StoreCard from "./StoreCard";
import { Button, buttonVariants } from "./ui/button";
import { BLOCK_LABELS, type Store } from "@/lib/stores";
import { catLabel, localePath, t, type Locale } from "@/lib/i18n";
import { CATEGORIES, emptyFilters, filterStores, hasBuyingInfo, type DirectoryFilters } from "@/lib/buyer-tools";
import { useBuyer } from "./BuyerProvider";
import { track } from "@/lib/analytics";
const DistrictMap = dynamic(() => import("./DistrictMap"), { ssr: false, loading: () => <div className="map-placeholder" aria-busy="true">…</div> });
export default function DirectoryBrowser({ stores, locale }: { stores: Store[]; locale: Locale }) {
  const [filters, setFilters] = useState<DirectoryFilters>(emptyFilters);
  const [view, setView] = useState<"list" | "map">("list");
  const [sort, setSort] = useState("information");
  const [limit, setLimit] = useState(24);
  const [expanded, setExpanded] = useState(false);
  const { saved } = useBuyer();
  const es = locale === "es";
  useEffect(() => {
    const read = () => { const params = new URLSearchParams(window.location.search); setFilters({ query: "", category: CATEGORIES.some((value) => value === params.get("cat")) ? params.get("cat")! : "", block: params.get("street") && Object.hasOwn(BLOCK_LABELS, params.get("street")!) ? params.get("street")! : "", info: params.get("info") === "1", contact: params.get("contact") === "1" }); setLimit(24); };
    read(); window.addEventListener("popstate", read); return () => window.removeEventListener("popstate", read);
  }, []);
  const filtered = useMemo(() => filterStores(stores, filters).sort((a, b) => sort === "information" ? Number(hasBuyingInfo(b)) - Number(hasBuyingInfo(a)) || a.name.localeCompare(b.name, "en") : a.name.localeCompare(b.name, "en")), [stores, filters, sort]);
  const mapStores = useMemo(() => filtered.filter((store) => store.address.lat !== null && store.address.lng !== null).map((store) => ({ slug: store.slug, name: store.name, line1: `${store.address.line1}${store.address.unit ? ` #${store.address.unit}` : ""}`, lat: store.address.lat!, lng: store.address.lng! })), [filtered]);
  const activeCount = Number(!!filters.category) + Number(!!filters.block) + Number(filters.info) + Number(filters.contact);
  function update(patch: Partial<DirectoryFilters>) {
    const next = { ...filters, ...patch }; setFilters(next); setLimit(24); const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({ cat: next.category, street: next.block, info: next.info ? "1" : "", contact: next.contact ? "1" : "" })) { if (value) url.searchParams.set(key, value); else url.searchParams.delete(key); }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    if (Object.keys(patch).some((key) => key !== "query")) track("directory_filter", { category: next.category || "all", street: next.block || "all", buying_info: next.info, contact: next.contact, has_query: !!next.query });
  }
  return <>
    <div className="directory-search-row"><label className="directory-search"><Search size={22} aria-hidden="true" /><input type="search" value={filters.query} maxLength={160} onChange={(event) => update({ query: event.target.value })} aria-label={es ? "Buscar producto, proveedor o calle" : "Search product, supplier or street"} placeholder={es ? "Busque juguetes, proveedores o calles…" : "Search toys, suppliers or streets…"} /></label><Button variant="outline" className="filter-toggle min-[641px]:hidden" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="directory-filters"><SlidersHorizontal />{es ? "Filtros" : "Filters"}{activeCount > 0 && <span className="count-pill">{activeCount}</span>}</Button></div>
    <div id="directory-filters" className={`directory-filters${expanded ? " expanded" : ""}`}>
      <label className="select-filter"><span>{es ? "Productos" : "Products"}</span><select value={filters.category} onChange={(event) => update({ category: event.target.value })}><option value="">{t(locale, "filter_all")}</option>{CATEGORIES.map((category) => <option key={category} value={category}>{catLabel(locale, category)}</option>)}</select></label>
      <label className="select-filter"><span>{es ? "Ubicación" : "Location"}</span><select value={filters.block} onChange={(event) => update({ block: event.target.value })}><option value="">{t(locale, "filter_block")}</option>{Object.entries(BLOCK_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="check-filter"><input type="checkbox" checked={filters.info} onChange={(event) => update({ info: event.target.checked })} />{es ? "Con información de compra" : "Published buying info"}</label><label className="check-filter"><input type="checkbox" checked={filters.contact} onChange={(event) => update({ contact: event.target.checked })} />{es ? "Con teléfono o correo" : "Phone or email listed"}</label>{(activeCount > 0 || filters.query) && <Button variant="ghost" size="sm" onClick={() => update(emptyFilters)}><X />{es ? "Limpiar" : "Clear"}</Button>}
    </div>
    <div className="directory-layout"><div className="directory-results"><div className="results-bar"><div><h2>{t(locale, "directory_h2")}</h2><p role="status" aria-live="polite">{filtered.length} {es ? (filtered.length === 1 ? "resultado" : "resultados") : (filtered.length === 1 ? "result" : "results")}{filters.query && <span> {es ? "para" : "for"} “{filters.query}”</span>}</p></div><div className="view-switch" role="group" aria-label={es ? "Vista de resultados" : "Results view"}><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={16} />{es ? "Lista" : "List"}</button><button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}><Map size={16} />{es ? "Mapa" : "Map"}</button></div></div>
      <div className="results-explainer"><p>{es ? "Fichas basadas en registros. Confirme la operación actual antes de visitar." : "Registration-based listings. Confirm current operation before visiting."}</p><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label={es ? "Ordenar resultados" : "Sort results"}><option value="information">{es ? "Información de compra primero" : "Buying info first"}</option><option value="name">{es ? "Nombre A–Z" : "Name A–Z"}</option></select></div>
      {view === "map" && <div className="map-wrap"><DistrictMap stores={mapStores} locale={locale} /></div>}
      {filtered.length ? <div className="supplier-list">{filtered.slice(0, limit).map((store) => <StoreCard key={store.slug} store={store} locale={locale} />)}</div> : <div className="empty-results"><Search size={30} /><h3>{es ? "No encontramos coincidencias" : "No matching suppliers"}</h3><p>{es ? "Pruebe otro producto o quite un filtro." : "Try a different product or remove a filter."}</p><Button variant="outline" onClick={() => update(emptyFilters)}>{es ? "Ver todos los negocios" : "Show all businesses"}</Button></div>}
      {filtered.length > limit && <div className="load-more"><Button variant="outline" onClick={() => setLimit(limit + 24)}>{es ? "Mostrar más proveedores" : "Show more suppliers"}<span className="text-muted-foreground">({Math.min(24, filtered.length - limit)})</span></Button><p>{Math.min(limit, filtered.length)} / {filtered.length}</p></div>}
    </div><aside className="buyer-sidebar"><div className="trip-card"><Bookmark size={25} /><h2>{es ? "Arme su lista de visita" : "Build your buying trip"}</h2><p>{es ? "Guarde proveedores, compare sus datos y lleve una lista impresa." : "Save suppliers, compare their details and bring a printed list along."}</p><Link href={localePath(locale, "/saved")} className={buttonVariants()}>{es ? "Ver mi lista" : "View saved suppliers"}<span className="count-pill inverted">{saved.length}</span></Link><small>{es ? "Sin cuenta. Guardado en este navegador." : "No account needed. Saved in this browser."}</small></div><div className="sidebar-note"><BookOpen size={20} /><h3>{es ? "¿Primera compra al por mayor?" : "New to wholesale buying?"}</h3><p>{es ? "Los mínimos y requisitos varían. Prepare las preguntas adecuadas." : "Minimums and account requirements vary. Go in with the right questions."}</p><Link href={localePath(locale, "/guide/wholesale-basics")}>{es ? "Lea la guía de compra" : "Read the buying guide"}</Link></div></aside></div>
  </>;
}
