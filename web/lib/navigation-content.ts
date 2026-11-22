import { BLOCK_LABELS, stores, type Block } from './stores';
import { activeStores, streetGroups, streetNumber } from './directory-navigation';
import { catLabel, formatText, t, type Locale } from './i18n';
import { storeMeta } from './meta';

export function indexMetadata(locale: Locale) {
  return storeMeta('/stores', locale, t(locale, 'index_title'), formatText(locale, 'index_description', { count: activeStores(stores).length }));
}
export const streetParams = () => streetGroups(stores).map(({ block }) => ({ block }));
export function streetContent(block: Block, locale: Locale) {
  const items = streetGroups(stores, locale).find(g => g.block === block)?.stores || [];
  const numbers = items.map(streetNumber).filter((n): n is number => n !== null);
  const counts = new Map<string, number>();
  for (const s of items) for (const c of new Set(s.category)) counts.set(c, (counts.get(c) || 0) + 1);
  const intro = formatText(locale, 'street_intro', { count: items.length, street: BLOCK_LABELS[block] });
  const range = numbers.length ? formatText(locale, 'street_range', { low: Math.min(...numbers), high: Math.max(...numbers) }) : '';
  return { items, intro, range, categories: [...counts].map(([c, count]) => `${catLabel(locale, c)}: ${count}`).join(' · ') };
}
export function streetMetadata(block: Block, locale: Locale) {
  const content = streetContent(block, locale);
  const categories = content.categories.split(' · ');
  const base = `${content.intro} ${content.range}`.trim();
  while (categories.length && `${base} ${categories.join(' · ')}`.length > 155) categories.pop();
  const description = `${base} ${categories.join(' · ')}`.trim();
  return storeMeta(`/street/${block}`, locale, formatText(locale, 'street_meta_title', { street: BLOCK_LABELS[block] }), description);
}
