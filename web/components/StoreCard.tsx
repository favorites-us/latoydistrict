import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, BookOpen, Building2 } from "lucide-react";
import type { Store } from "@/lib/stores";
import { catLabel, localePath, type Locale } from "@/lib/i18n";
import { hasBuyingInfo } from "@/lib/buyer-tools";
import SaveStoreButton from "./SaveStoreButton";
import StoreContactLink from "./StoreContactLink";
import StorePhoto from "./StorePhoto";
import { photoForStore } from "@/lib/photos";
export default function StoreCard({ store, locale }: { store: Store; locale: Locale }) {
  const es = locale === "es"; const photo = photoForStore(store.slug); const info = hasBuyingInfo(store); const unit = store.address.unit ? ` #${store.address.unit}` : "";
  return <article className="store-card"><div className={`store-card-visual category-${store.category[0]}`}>{photo ? <StorePhoto photo={photo} locale={locale} compact /> : <div className="store-monogram" aria-hidden="true"><Building2 size={30} strokeWidth={1.4} /><span>{store.name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("")}</span></div>}</div><div className="store-card-body"><div className="store-card-title"><h3><Link href={localePath(locale, `/stores/${store.slug}`)}>{store.name}</Link></h3><SaveStoreButton slug={store.slug} name={store.name} locale={locale} compact /></div><p className="store-address"><MapPin size={14} />{store.address.line1}{unit}</p><div className="store-tags">{store.category.map((category) => <span key={category}>{catLabel(locale, category)}</span>)}{info && <span className="info-tag"><BookOpen size={12} />{es ? "Información de compra" : "Buying info"}</span>}</div><div className="store-card-bottom"><span className="store-data-note">{info ? (es ? "Con fuentes del negocio" : "Business sources linked") : (es ? "Datos de registro" : "Registration details")}</span><div>{store.phone && store.field_sources?.phone?.type === "business" && <StoreContactLink href={`tel:${store.phone.replace(/[^+\d]/g, "")}`} slug={store.slug} method="phone"><Phone size={14} /><span>{es ? "Llamar" : "Call"}</span></StoreContactLink>}<Link href={localePath(locale, `/stores/${store.slug}`)}>{es ? "Ver ficha" : "View supplier"}<ArrowUpRight size={15} /></Link></div></div></div></article>;
}
