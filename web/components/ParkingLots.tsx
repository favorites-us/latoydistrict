import { Car, SquareParking } from "lucide-react";
import { nearestLots, parkingCheckedAt, parkingLots, parkingSource, parkingPrice, lotRatesUrl, type NearbyLot, type ParkingLot } from "@/lib/parking";
import { t, type Locale } from "@/lib/i18n";

function LotRow({ lot, locale, walk }: { lot: ParkingLot; locale: Locale; walk?: number }) {
  const price = parkingPrice(lot);
  return (
    <li className="parking-lot">
      <span className="parking-icon" aria-hidden="true">
        {lot.type === "garage" ? <SquareParking size={17} strokeWidth={1.8} /> : <Car size={17} strokeWidth={1.8} />}
      </span>
      <div className="parking-lot-main">
        <p className="parking-lot-name">{lot.name}</p>
        <p className="parking-lot-meta">
          {t(locale, lot.type === "garage" ? "parking_garage" : "parking_lot")}
          {walk != null ? <> · ~{walk} {t(locale, "parking_walk_min")}</> : null}
          {lot.note ? <> · {lot.note[locale]}</> : null}
        </p>
      </div>
      <div className="parking-lot-price">
        {price ? <strong>{t(locale, "parking_from")} {price}</strong> : null}
        <a href={lotRatesUrl(lot)} aria-label={`${t(locale, "parking_rates_link")}: ${lot.name}`} target="_blank" rel="nofollow noopener noreferrer">
          {t(locale, "parking_rates_link")} ↗
        </a>
      </div>
    </li>
  );
}

function SourceLine({ locale }: { locale: Locale }) {
  return (
    <p className="source-note">
      {t(locale, "parking_rates_note")}{" "}
      <a href={parkingSource.url} target="_blank" rel="nofollow noopener noreferrer">{parkingSource.label} ↗</a>
      {" · "}
      {t(locale, "source_checked")} <time dateTime={parkingCheckedAt}>{parkingCheckedAt}</time>
    </p>
  );
}

/** Full list for the visiting guide. */
export function ParkingLotList({ locale }: { locale: Locale }) {
  return (
    <div className="parking-block">
      <ul className="parking-list">
        {parkingLots.map((lot) => (
          <LotRow key={lot.id} lot={lot} locale={locale} />
        ))}
      </ul>
      <SourceLine locale={locale} />
    </div>
  );
}

/** Compact "nearest parking" block for a store page. */
export function NearestParking({ lat, lng, locale }: { lat: number | null; lng: number | null; locale: Locale }) {
  const lots: NearbyLot[] = lat != null && lng != null ? nearestLots(lat, lng, 2) : [];
  if (lots.length === 0) return null;
  return (
    <div className="parking-block">
      <ul className="parking-list">
        {lots.map((lot) => (
          <LotRow key={lot.id} lot={lot} locale={locale} walk={lot.walk_min} />
        ))}
      </ul>
      <SourceLine locale={locale} />
    </div>
  );
}
