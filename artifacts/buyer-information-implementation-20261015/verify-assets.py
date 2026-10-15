"""Verify delivered asset bytes without executing JavaScript or rendering a page."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
import hashlib
import json

ORIGIN = 'https://toydistrictlosangeles.com'


class Assets(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        url = a.get('src') if tag == 'script' else a.get('href') if tag == 'link' and a.get('rel') == 'stylesheet' else None
        if url and url.startswith('/_next/static/'):
            self.urls.add(url)


def fetch(path):
    with urlopen(Request(ORIGIN + path, headers={'User-Agent': 'ToyDistrict-release-check'}), timeout=30) as response:
        assert response.status == 200
        return response.read()


urls = set()
for path in ['/guide/buying-checklist', '/es/stores/california-balloon-house-447']:
    page = Assets()
    page.feed(fetch(path).decode('utf-8'))
    urls.update(page.urls)


def asset(path):
    data = fetch(path)
    return {'path': path, 'status': 200, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}, data.decode('utf-8')


results = list(ThreadPoolExecutor(max_workers=4).map(asset, sorted(urls)))
# Vercel may append deployment query parameters to asset URLs.
js = '\n'.join(text for row, text in results if urlsplit(row['path']).path.endswith('.js'))
css = '\n'.join(text for row, text in results if urlsplit(row['path']).path.endswith('.css'))
assert 'window.print()' in js
assert '.worksheet-fields' in css and '@media print' in css
output = {
    'checked_at': datetime.now(timezone.utc).isoformat(),
    'assets': [row for row, text in results],
    'print_action_in_delivered_js': True,
    'worksheet_print_css_delivered': True,
    'visual_or_print_execution': False,
}
Path(__file__).with_name('production-assets.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'{len(results)} production assets passed; print action and print styles delivered.')
