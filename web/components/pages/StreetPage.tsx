import { Header, Footer } from '@/components/SiteChrome';
import JsonLd from '@/components/JsonLd';
import StreetLinks from '@/components/StreetLinks';
import { NearestParking } from '@/components/ParkingLots';
import { BusinessRows } from './BusinessIndexPage';
import { BLOCK_LABELS, stores, type Block } from '@/lib/stores';
import { hasCoordinates, streetGroups, streetNumber } from '@/lib/directory-navigation';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { catLabel, formatText, localePath, t, type Locale } from '@/lib/i18n';
import { streetContent } from '@/lib/navigation-content';

export default function StreetPage({ block, locale }: { block: Block; locale: Locale }) {
  const { items, intro, range, categories } = streetContent(block, locale);
  const street = BLOCK_LABELS[block];
  // Use an actual central listed address as the stated walking origin.
  const located = items.filter(hasCoordinates);
  const origin = located[Math.floor(located.length / 2)];
  return <><Header locale={locale} altPath={`/street/${block}`} /><main id="main-content" lang={locale} className="container navigation-page">
    <JsonLd data={breadcrumbJsonLd(locale, `/street/${block}`, street)} />
    <nav className="breadcrumb"><a href={localePath(locale, '/')}>{t(locale, 'breadcrumb_home')}</a> / {street}</nav>
    <h1>{formatText(locale, 'street_title', { street })}</h1><p>{intro} {range}</p><p>{categories}</p><p>{t(locale, 'registration_caveat')}</p>
    <nav className="navigation-links"><a href={`${localePath(locale, '/')}?street=${block}#directory`}>{t(locale, 'street_map')}</a><a href={localePath(locale, '/stores')}>{t(locale, 'all_businesses')}</a><a href={localePath(locale, '/guide/visiting')}>{t(locale, 'guide_visiting_title')}</a></nav>
    <BusinessRows items={items} locale={locale} full />
    {origin && <section><h2>{formatText(locale, 'parking_near_street', { street })}</h2><p>{formatText(locale, 'parking_origin', { address: origin.address.line1 })}</p><NearestParking lat={origin.address.lat} lng={origin.address.lng} locale={locale} /></section>}
    <section><h2>{t(locale, 'other_streets')}</h2><StreetLinks locale={locale} except={block} /></section>
  </main><Footer locale={locale} /></>;
}
