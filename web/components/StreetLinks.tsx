import { BLOCK_LABELS, stores, type Block } from '@/lib/stores';
import { streetGroups } from '@/lib/directory-navigation';
import { localePath, type Locale } from '@/lib/i18n';

export default function StreetLinks({ locale, except }: { locale: Locale; except?: Block }) {
  return <ul className="street-links">{streetGroups(stores).filter(g => g.block !== except).map(g => <li key={g.block}><a href={localePath(locale, `/street/${g.block}`)}>{BLOCK_LABELS[g.block]} <span>({g.stores.length})</span></a></li>)}</ul>;
}
