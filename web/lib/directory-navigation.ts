import { BLOCK_LABELS, type Block, type Store } from './stores';
import { normalizeDisplayName } from './display-name';
import type { Locale } from './i18n';

export const activeStores = (items: readonly Store[]) => items.filter(s => s.status !== 'closed' && !s.duplicate_of);
export const displayName = (s: Store, locale: Locale) => normalizeDisplayName(locale === 'es' ? s.name_es || s.name : s.name);
export function groupStores(items: readonly Store[], locale: Locale) {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  const groups = new Map<string, Store[]>();
  for (const store of activeStores(items).sort((a, b) => collator.compare(displayName(a, locale), displayName(b, locale)) || a.slug.localeCompare(b.slug))) {
    const initial = displayName(store, locale).trim().charAt(0).toLocaleUpperCase(locale);
    const letter = /[0-9]/.test(initial) ? '0–9' : initial;
    groups.set(letter, [...(groups.get(letter) || []), store]);
  }
  return [...groups].sort(([a], [b]) => a === '0–9' ? -1 : b === '0–9' ? 1 : collator.compare(a, b));
}
export function streetNumber(store: Store): number | null {
  const match = store.address.line1.match(/^\s*(\d+(?:\.\d+)?)(?=\s|$)/);
  return match ? Number(match[1]) : null;
}
export function compareStreet(a: Store, b: Store, locale: Locale = 'en') {
  return (streetNumber(a) ?? Infinity) - (streetNumber(b) ?? Infinity) ||
    (a.address.unit || '').localeCompare(b.address.unit || '', locale, { numeric: true, sensitivity: 'base' }) ||
    displayName(a, locale).localeCompare(displayName(b, locale), locale, { sensitivity: 'base' }) || a.slug.localeCompare(b.slug);
}
export function streetGroups(items: readonly Store[], locale: Locale = 'en') {
  return (Object.keys(BLOCK_LABELS) as Block[]).map(block => ({ block, stores: activeStores(items).filter(s => s.block === block).sort((a, b) => compareStreet(a, b, locale)) })).filter(group => group.stores.length);
}
export function hasCoordinates(s: Store) {
  const { lat, lng } = s.address;
  return lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}
export function nearestStores(store: Store, items: readonly Store[], limit = 8): Store[] {
  const candidates = activeStores(items).filter(s => s.slug !== store.slug);
  if (!hasCoordinates(store)) return candidates.filter(s => s.block === store.block).sort((a, b) => compareStreet(a, b)).slice(0, limit);
  const rad = (n: number) => n * Math.PI / 180;
  const distance = (s: Store) => {
    const a = Math.sin(rad(s.address.lat! - store.address.lat!) / 2) ** 2 + Math.cos(rad(store.address.lat!)) * Math.cos(rad(s.address.lat!)) * Math.sin(rad(s.address.lng! - store.address.lng!) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(Math.min(1, a)));
  };
  return candidates.filter(hasCoordinates).map(s => ({ s, distance: distance(s) })).sort((a, b) => a.distance - b.distance || a.s.slug.localeCompare(b.s.slug)).slice(0, limit).map(({ s }) => s);
}
