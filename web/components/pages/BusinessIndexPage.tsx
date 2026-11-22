import { Header, Footer } from '@/components/SiteChrome';
import JsonLd from '@/components/JsonLd';
import StreetLinks from '@/components/StreetLinks';
import { stores, fullAddress, type Store } from '@/lib/stores';
import { activeStores, displayName, groupStores } from '@/lib/directory-navigation';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { catLabel, formatText, localePath, t, type Locale } from '@/lib/i18n';

export function BusinessRows({ items, locale, full = false }: { items: Store[]; locale: Locale; full?: boolean }) {
  return <ul className="business-rows">{items.map(s => <li key={s.slug}><a href={localePath(locale, `/stores/${s.slug}`)}>{displayName(s, locale)}</a><span>{full ? fullAddress(s) : `${s.address.line1}${s.address.unit ? ` #${s.address.unit}` : ''}`}</span><span className="business-category">{s.category.map(c => catLabel(locale, c)).join(', ')}</span></li>)}</ul>;
}
export default function BusinessIndexPage({ locale }: { locale: Locale }) {
  const groups = groupStores(stores, locale);
  return <><Header locale={locale} altPath="/stores" /><main id="main-content" lang={locale} className="container navigation-page">
    <JsonLd data={breadcrumbJsonLd(locale, '/stores', t(locale, 'all_businesses'))} />
    <nav className="breadcrumb"><a href={localePath(locale, '/')}>{t(locale, 'breadcrumb_home')}</a> / {t(locale, 'all_businesses')}</nav>
    <h1>{t(locale, 'index_title')}</h1><p>{formatText(locale, 'index_intro', { count: activeStores(stores).length })} {t(locale, 'registration_caveat')}</p>
    <section><h2>{t(locale, 'browse_streets')}</h2><StreetLinks locale={locale} /></section>
    <nav className="letter-links" aria-label={t(locale, 'jump_letters')}>{groups.map(([letter]) => <a key={letter} href={`#letter-${letter}`}>{letter}</a>)}</nav>
    {groups.map(([letter, items]) => <section key={letter} id={`letter-${letter}`}><h2>{letter}</h2><BusinessRows items={items} locale={locale} /></section>)}
  </main><Footer locale={locale} /></>;
}
