"""Check built HTML or deployed HTTP responses; does not run browser JS or forms."""
import argparse
import hashlib
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = Path(__file__).resolve().parent
STORES = json.loads((ROOT / 'web/data/stores.json').read_text())['stores']
COHORT = [s for s in STORES if s['id'] in {
    'american-silk-inc-340', 'california-balloon-house-447',
    'casa-manga-218', 'tom-s-model-501',
}]
GUIDES = ['/guide/' + p for p in [
    'visiting', 'wholesale-basics', 'buying-checklist',
    'for/party-planners', 'for/store-owners', 'for/resellers',
]]


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.skip = 0
        self.parts = []
        self.links = []
        self.canonicals = []
        self.alternates = {}
        self.ids = []
        self.main_lang = None
        self.feed(html)
        self.text = ' '.join(' '.join(self.parts).split())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'):
            self.skip += 1
        if tag == 'main':
            self.main_lang = a.get('lang')
        if 'id' in a:
            self.ids.append(a['id'])
        if tag == 'a':
            self.links.append(a)
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonicals.append(a.get('href'))
        if tag == 'link' and a.get('rel') == 'alternate':
            self.alternates[a.get('hreflang')] = a.get('href')

    def handle_endtag(self, tag):
        if tag in ('script', 'style'):
            self.skip = max(0, self.skip - 1)

    def handle_data(self, data):
        if not self.skip and data.strip():
            self.parts.append(data.strip())


def built(path):
    file = ROOT / 'web/.next/server/app' / ((path.strip('/') or 'index') + '.html')
    return file.read_text()


def check(path, html, locale, store=None):
    page = Page(html)
    assert page.main_lang == locale, (path, 'main language')
    assert len(page.ids) == len(set(page.ids)), (path, 'duplicate IDs')
    assert page.canonicals == ['https://toydistrictlosangeles.com' + path], (path, 'canonical')
    assert set(page.alternates) >= {'en', 'es', 'x-default'}, (path, 'hreflang')
    checklist = ('/es' if locale == 'es' else '') + '/guide/buying-checklist'
    assert any(a.get('href') == checklist for a in page.links), (path, 'checklist discovery')
    for banned in ['90%', '$3/hour', '$11–22', '200 N Alameda', 'pay cash for better',
                   'Generic and unbranded toys avoid', 'lo genérico y sin marca es seguro']:
        assert banned not in page.text, (path, banned)
    if locale == 'es':
        for a in page.links:
            href = a.get('href', '')
            if href.startswith(('/guide/', '/stores/')):
                assert a.get('hreflang') == 'en', (path, 'wrong-language content link', href)
    if path.endswith('buying-checklist'):
        assert 'worksheet-heading' in page.ids
        assert ('Print worksheet' if locale == 'en' else 'Imprimir hoja') in page.text
        assert html.count('class="worksheet-field"') == 12
        assert '<input' not in html and '<textarea' not in html, 'Worksheet must not collect data'
        for merchant in COHORT:
            expected = ('/es' if locale == 'es' else '') + '/stores/' + merchant['slug']
            assert any(a.get('href') == expected for a in page.links)
    if store:
        assert 'questions-heading' in page.ids
        for fact in store.get('online_facts', []):
            assert ' '.join(fact['text'][locale].split()) in page.text, (path, fact['id'])
            for src in [fact['source']] + fact.get('additional_sources', []):
                assert any(a.get('href') == src['url'] for a in page.links), (path, src['url'])
                assert src['checked_at'] in page.text
        if store['id'] == 'american-silk-inc-340':
            assert store['hours'] is None
        if store['id'] == 'california-balloon-house-447':
            assert '48 business hours' in page.text
        if store['id'] == 'casa-manga-218':
            assert '#D' in page.text
    return {'path': path or '/', 'locale': locale, 'passed': True}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--origin', help='Optional production origin; never used for browser rendering')
    args = parser.parse_args()
    cases = []
    for locale, prefix in [('en', ''), ('es', '/es')]:
        for route in [''] + GUIDES:
            cases.append((prefix + route, locale, None))
        for store in COHORT:
            cases.append((prefix + '/stores/' + store['slug'], locale, store))

    def run(case):
        path, locale, store = case
        if args.origin:
            url = args.origin.rstrip('/') + (path or '/')
            with urlopen(Request(url, headers={'User-Agent': 'ToyDistrict-release-check'}), timeout=30) as response:
                assert response.status == 200, (url, response.status)
                html = response.read().decode('utf-8')
        else:
            html = built(path)
        return check(path, html, locale, store)

    pages = list(ThreadPoolExecutor(max_workers=4).map(run, cases))
    if not args.origin:
        old = json.loads(subprocess.check_output(['git', 'show', '2a05e7ed1da90dd5b2f576d8a3cfaa918bb5bd2d:web/data/stores.json'], cwd=ROOT))['stores']
        old_by_id = {s['id']: s for s in old}
        assert len(STORES) == len(old) == 191
        for store in STORES:
            current = {k: v for k, v in store.items() if k != 'online_facts'}
            prior = {k: v for k, v in old_by_id[store['id']].items() if k != 'online_facts'}
            assert current == prior, (store['id'], 'unrelated fields changed')
        before = (ROOT / 'web/data/stores.json').read_bytes()
        subprocess.run(['npm', 'run', 'reviewed-enrich'], cwd=ROOT, check=True, capture_output=True)
        assert before == (ROOT / 'web/data/stores.json').read_bytes(), 'Non-deterministic rebuild'
        sitemap = (ROOT / 'web/.next/server/app/sitemap.xml.body').read_text()
        for route in ['/guide/buying-checklist', '/es/guide/buying-checklist']:
            assert 'https://toydistrictlosangeles.com' + route in sitemap
    report = {
        'date': '2026-10-15', 'mode': 'production_http' if args.origin else 'built_html',
        'origin': args.origin, 'pages': pages, 'page_count': len(pages),
        'store_count': len(STORES), 'online_fact_count': sum(len(s.get('online_facts', [])) for s in STORES),
        'stores_sha256': hashlib.sha256((ROOT / 'web/data/stores.json').read_bytes()).hexdigest(),
        'browser_visual_check': 'blocked by saved localhost browser preference; no workaround attempted',
        'print_preview_check': 'not performed', 'actual_inquiry_or_ga_delivery_test': 'not performed',
    }
    out = ARTIFACTS / ('production-checks.json' if args.origin else 'validation.json')
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(f'{len(pages)} pages passed; {report["online_fact_count"]} source-backed online facts. Saved {out.name}.')


if __name__ == '__main__':
    main()
