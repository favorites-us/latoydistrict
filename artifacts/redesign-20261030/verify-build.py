from pathlib import Path
from html.parser import HTMLParser
import json
from urllib.parse import unquote
root=Path(__file__).resolve().parents[2]
class Page(HTMLParser):
 def __init__(self): super().__init__();self.headings=0;self.main=False;self.lang=None;self.canonical=None;self.alts={};self.skip=0;self.text=[];self.assets=[];self.imgs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='script':self.skip+=1
  if tag=='h1':self.headings+=1
  if tag=='main':self.main=a.get('id')=='main-content';self.lang=a.get('lang')
  if tag=='link' and a.get('rel')=='canonical':self.canonical=a.get('href')
  if tag=='link' and a.get('rel')=='alternate':self.alts[a.get('hrefLang',a.get('hreflang'))]=a.get('href')
  if tag=='img':self.imgs.append(a.get('src'))
  if tag=='script' and a.get('src','').startswith('/_next/'):self.assets.append(a['src'])
  if tag=='link' and a.get('rel')=='stylesheet':self.assets.append(a.get('href'))
 def handle_endtag(self,tag):
  if tag=='script':self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip:self.text.append(data)
paths=['/','/es','/saved','/es/saved','/photos','/es/photos']
for slug in ['american-silk-inc-340','california-balloon-house-447','casa-manga-218','tom-s-model-501','abc-toys-wholesale-323','bigmart-inc-230']:
 paths.extend(['/stores/'+slug,'/es/stores/'+slug])
for slug in ['buying-checklist','visiting','wholesale-basics','for/resellers']:
 paths.extend(['/guide/'+slug,'/es/guide/'+slug])
results=[]
for path in paths:
 f=root/'web/.next/server/app'/('index.html' if path=='/' else path.lstrip('/')+'.html')
 html=f.read_text();p=Page();p.feed(html)
 assert p.headings==1,(path,'h1 count',p.headings)
 assert p.main,(path,'main landmark')
 assert p.lang==('es' if path.startswith('/es') else 'en'),(path,'language',p.lang)
 assert p.canonical==('https://toydistrictlosangeles.com' if path=='/' else 'https://toydistrictlosangeles.com'+path),(path,'canonical',p.canonical)
 assert all(k in p.alts for k in ['en','es','x-default']),(path,'alternates')
 for asset in p.assets: assert (root/'web/.next'/unquote(asset.removeprefix('/_next/').split('?')[0])).exists(),(path,asset)
 assert '[SENSITIVE]' not in html,(path,'placeholder env leaked')
 if '/american-silk-inc-340' in path: assert '/api/store-photos/american-silk-catalog-1' in p.imgs,(path,'photo route')
 results.append({'path':path,'h1_count':p.headings,'canonical':p.canonical,'assets':len(p.assets),'status':'pass'})
# Source-linked purchase facts survive the template rewrite in both languages.
data=json.loads((root/'web/data/stores.json').read_text())['stores']
for store in data:
 if not store.get('online_facts'):continue
 for locale in ['en','es']:
  path=('/es' if locale=='es' else '')+'/stores/'+store['slug']
  html=(root/'web/.next/server/app'/(path.lstrip('/')+'.html')).read_text();p=Page();p.feed(html);text=''.join(p.text)
  for fact in store['online_facts']:
   assert fact['text'][locale] in text,(path,fact['id'])
   assert fact['source']['url'].replace('&','&amp;') in html,(path,'source')
(root/'artifacts/redesign-20261030/build-checks.json').write_text(json.dumps({'pages':results,'source_facts':'all preserved in EN/ES','result':'pass'},indent=2))
print(f'{len(results)} built pages passed: landmarks, locale, canonical, hreflang, assets, photo routes. All published buyer facts preserved in EN/ES.')
