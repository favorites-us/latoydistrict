from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from urllib.parse import unquote
import json, hashlib, runpy
root=Path(__file__).resolve().parents[2]
context=runpy.run_path(str(Path(__file__).with_name('verify-build.py')))
Page=context['Page']; paths=context['paths']; origin='https://toydistrictlosangeles.com'
def get(path, data=None, headers=None):
 req=Request(origin+path, data=data, headers=headers or {})
 try:r=urlopen(req,timeout=45)
 except HTTPError as e:r=e
 return r.status,dict(r.headers),r.read()
def checkpage(path):
 status,headers,body=get(path);assert status==200,(path,status)
 html=body.decode();p=Page();p.feed(html)
 expected=Page();f=root/'web/.next/server/app'/('index.html' if path=='/' else path.lstrip('/')+'.html');expected.feed(f.read_text())
 assert p.headings==1 and p.main and p.lang==expected.lang,(path,'landmarks')
 assert p.canonical==expected.canonical and p.alts==expected.alts,(path,'SEO')
 assert ''.join(p.text)==''.join(expected.text),(path,'deployed content differs from build')
 assert '[SENSITIVE]' not in html
 return {'path':path,'status':status,'canonical':p.canonical,'assets':p.assets}
with ThreadPoolExecutor(max_workers=4) as pool:pages=list(pool.map(checkpage,paths))
assets=sorted({asset for p in pages for asset in p['assets']})
def checkasset(path):
 status,headers,body=get(path);assert status==200 and body,(path,status)
 return {'path':path,'status':status,'bytes':len(body)}
with ThreadPoolExecutor(max_workers=4) as pool:assetresults=list(pool.map(checkasset,assets))
photoresults=[]
for photo in json.loads((root/'web/data/photos.json').read_text())['photos']:
 status,headers,body=get('/api/store-photos/'+photo['id'])
 lowered={k.lower():v for k,v in headers.items()}
 assert status==200,(photo['id'],status)
 sha=hashlib.sha256(body).hexdigest();assert sha==photo['sha256']
 assert 'no-store' in lowered.get('cache-control','')
 assert 'noimageindex' in lowered.get('x-robots-tag','')
 photoresults.append({'id':photo['id'],'status':status,'bytes':len(body),'sha256':sha,'cache_control':lowered.get('cache-control'),'x_robots_tag':lowered.get('x-robots-tag')})
status,_,_=get('/api/store-photos/not-a-listed-photo');assert status==404
status,_,_=get('/api/admin/photos',b'{}',{'Content-Type':'application/json'});assert status==401
status,_,_=get('/api/photo-reports',b'{}',{'Content-Type':'application/json','Origin':'https://unrelated.example'});assert status==403
result={'origin':origin,'pages':pages,'assets':assetresults,'photos':photoresults,'unknown_photo':404,'unauthenticated_admin':401,'cross_origin_report':403,'live_inquiry_or_removal_submitted':False,'result':'pass'}
Path(__file__).with_name('production-checks.json').write_text(json.dumps(result,indent=2))
print(f'Production passed: {len(pages)} pages, {len(assetresults)} assets, {len(photoresults)} exact photo hashes; invalid requests rejected. No real inquiry/removal submitted.')
