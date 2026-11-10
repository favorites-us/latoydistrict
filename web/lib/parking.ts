import raw from "../data/parking.json";
import type { Locale } from "./i18n";

export interface ParkingLot {
  id: string;
  name: string;
  type: "garage" | "lot";
  lat: number;
  lng: number;
  sat_day_from_usd?: number;
  note?: Record<Locale, string>;
}

interface ParkingData {
  checked_at: string;
  source: { label: string; url: string };
  lots: ParkingLot[];
}

const data = raw as ParkingData;

export const parkingCheckedAt = data.checked_at;
export const parkingSource = data.source;
export const parkingLots: ParkingLot[] = data.lots;

const WALK_METERS_PER_MIN = 75; // slow pace — buyers push hand trucks here

function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const sa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sa));
}

export interface NearbyLot extends ParkingLot {
  walk_min: number;
}

/** Nearest lots to a point, with a rough walking time (straight-line based). */
export function nearestLots(lat: number, lng: number, n = 2): NearbyLot[] {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return [];
  return parkingLots
    .map((lot) => {
      // Street grid: straight-line underestimates the walk — pad by ~30%.
      // 75 m/min is a deliberately slow pace (buyers push hand trucks); both
      // constants are estimates, so the UI labels walk times as approximate.
      const meters = haversineMeters(lat, lng, lot.lat, lot.lng) * 1.3;
      return { ...lot, meters, walk_min: Math.max(1, Math.round(meters / WALK_METERS_PER_MIN)) };
    })
    .sort((a, b) => a.meters - b.meters)
    .slice(0, n)
    .map(({ meters: _meters, ...lot }) => lot);
}

/** Historical reference price, never a live quote. */
export function parkingPrice(lot: ParkingLot): string | null {
  const price = lot.sat_day_from_usd;
  return price != null && Number.isFinite(price) && price >= 0 ? `~$${Math.round(price)}` : null;
}

/** Search link with live prices, centered on one lot. */
export function lotRatesUrl(lot: ParkingLot): string {
  return `https://spothero.com/search?latitude=${lot.lat}&longitude=${lot.lng}&zoom=17`;
}
