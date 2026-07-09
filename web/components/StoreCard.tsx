import Link from "next/link";
import type { Store } from "@/lib/stores";
import { catLabel, localePath, t, type Locale } from "@/lib/i18n";

export default function StoreCard({ store, locale }: { store: Store; locale: Locale }) {
  const unit = store.address.unit ? ` #${store.address.unit}` : "";
  return (
    <div className="store-card">
      <h3>
        <Link href={localePath(locale, `/stores/${store.slug}`)}>{store.name}</Link>
      </h3>
      <div className="addr">
        {store.address.line1}
        {unit}, LA {store.address.zip}
      </div>
      <span className={`wr-tag wr-${store.wholesale_retail}`}>
        {t(locale, `wr_${store.wholesale_retail}` as Parameters<typeof t>[1])}
      </span>
      <div className="chips">
        {store.category.map((c) => (
          <span key={c} className="badge">
            {catLabel(locale, c)}
          </span>
        ))}
        {store.verified_at ? <span className="badge brand">✓ {t(locale, "verified_note")}</span> : null}
      </div>
    </div>
  );
}
