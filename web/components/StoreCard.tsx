import Link from "next/link";
import CategoryVisual from "./CategoryVisual";
import { Phone } from "lucide-react";
import type { Store } from "@/lib/stores";
import { catLabel, localePath, type Locale } from "@/lib/i18n";
import SaveStoreButton from "./SaveStoreButton";
import StoreContactLink from "./StoreContactLink";
import StorePhoto from "./StorePhoto";
import { photoForStore } from "@/lib/photos";
export default function StoreCard({ store, locale, featured = false }: { store: Store; locale: Locale; featured?: boolean }) {
  const photo = photoForStore(store.slug);
  return <article className={`store-card ${featured ? "featured-card" : "compact-row"}`}>
    {featured && <Link className="featured-card-link" href={localePath(locale, `/stores/${store.slug}`)} aria-label={store.name} />}
    {/* List thumbnails omit attribution: the row links to the store page's source/removal section. */}
    <div className="store-card-visual">{photo ? <StorePhoto photo={photo} locale={locale} category={store.category[0]} compact showSource={featured} /> : <CategoryVisual category={store.category[0] || "general"} locale={locale} showLabel={false} />}</div>
    <div className="store-card-body"><h3>{featured ? store.name : <Link className="store-row-link" href={localePath(locale, `/stores/${store.slug}`)}>{store.name}</Link>}</h3>
      <p className="store-address">{store.address.line1}{store.address.unit ? ` #${store.address.unit}` : ""}</p>
      <div className="store-tags">{store.category.slice(0, 2).map(category => <span key={category}>{catLabel(locale, category)}</span>)}</div>
    </div>
    <div className="row-actions"><SaveStoreButton slug={store.slug} name={store.name} locale={locale} compact />{!featured && store.phone && store.field_sources?.phone?.type === "business" && <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone"><Phone size={17} /><span className="sr-only">{locale === "es" ? "Llamar a" : "Call"} {store.name}</span></StoreContactLink>}</div>
  </article>;
}
