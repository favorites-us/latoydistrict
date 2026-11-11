import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
const OUT = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(OUT, '../..');
const require = createRequire(path.join(ROOT, 'web/package.json'));
const sharp = require('sharp');
const UA = 'Mozilla/5.0 (compatible; directory-bot)';
const read = async p => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));
const write = async (p, v) => fs.writeFile(path.join(OUT, p), JSON.stringify(v, null, 2) + '\n');
const hash = b => createHash('sha256').update(b).digest('hex');
const stores = (await read('web/data/stores.json')).stores;
const baselinePath = 'artifacts/online-pilot-20261014/baseline-stores.json';
const reviewedPath = 'pipeline/data/reviewed-stores.json';
const baseline = (await read(baselinePath)).stores;
const reviewed = (await read(reviewedPath)).entries;
const excluded = [
  {domain:'caballoonhouse.com',reason:'Terms restrict reproduction without permission; do not collect or republish'},
  {domain:'ltsc.org',reason:'Community service organization, not a store'},
  {domain:'jadatoys.com',reason:'Manufacturer dealer listing for Funland, not the store’s own site'},
  {domain:'ffls.com',reason:'Directory'},
  {domain:'losangeles.jinbay.com',reason:'Directory'},
];
const denied = /(^|\.)(caballoonhouse\.com|ltsc\.org|jadatoys\.com|ffls\.com|jinbay\.com|yelp\.[a-z.]+|cylex\.[a-z.]+|411\.info|buzzfile\.com|cybo\.com|allbiz\.[a-z.]+|superpages\.com|loc8nearme\.com|google\.[a-z.]+|yellowpages\.com|mapquest\.com)$/i;
const sites = new Map();
function adopt(slug,url,evidence) {
  if (!stores.some(s=>s.slug===slug)) return;
  const u = new URL(url);
  if (denied.test(u.hostname)) return;
  sites.set(slug,{slug,name:stores.find(s=>s.slug===slug).name,url:u.origin+'/',evidence});
}
for (const s of baseline) if(s.links?.website) adopt(s.slug,s.links.website,{file:baselinePath,field:'links.website'});
for (const e of reviewed) if(e.decision==='approved') for(const u of e.updates||[]) if(u.field==='links.website'&&u.source?.type==='business') adopt(e.id,u.value,{file:reviewedPath,field:'updates.links.website',identity_evidence:e.identity_evidence});
await write('official-sites.json',{sites:[...sites.values()],excluded});
const robots = new Map();
const robotsLog = [];
async function request(url) {
  return fetch(url,{headers:{'User-Agent':UA},signal:AbortSignal.timeout(10000),redirect:'manual'});
}
function parseRobots(text) {
  const groups=[];let g=null;let rulesStarted=false;
  for(const raw of text.split(/\r?\n/)) {
    const line=raw.replace(/#.*/,'').trim();const i=line.indexOf(':');if(i<0)continue;
    const key=line.slice(0,i).toLowerCase().trim(), value=line.slice(i+1).trim();
    if(key==='user-agent') {if(!g||rulesStarted){g={agents:[],rules:[]};groups.push(g);rulesStarted=false;}g.agents.push(value.toLowerCase());}
    else if(g&&['allow','disallow'].includes(key)){rulesStarted=true;if(value)g.rules.push({allow:key==='allow',pattern:value});}
  }
  const matched=groups.filter(g=>g.agents.some(a=>a!=='*'&&'directory-bot'.includes(a)));
  const selected=matched.length?matched:groups.filter(g=>g.agents.includes('*'));
  return selected.flatMap(g=>g.rules);
}
async function policy(origin) {
  if(!robots.has(origin)) robots.set(origin,(async()=>{
    let url=origin+'/robots.txt';
    for(let i=0;i<6;i++){
      const r=await request(url);
      if(r.status>=300&&r.status<400&&r.headers.get('location')){url=new URL(r.headers.get('location'),url).href;continue;}
      if(r.status===404||r.status===410){robotsLog.push({origin,status:r.status,rules:[]});return [];}
      if(!r.ok)throw new Error(`robots.txt HTTP ${r.status}; skipped conservatively`);
      const body=await r.text();
      if(/<html[\s>]/i.test(body))throw new Error('robots.txt returned HTML; skipped conservatively');
      const rules=parseRobots(body);robotsLog.push({origin,status:r.status,rules});return rules;
    }
    throw new Error('robots.txt redirect limit');
  })());
  return robots.get(origin);
}
async function allowed(url) {
  const u=new URL(url), rules=await policy(u.origin);let best=null;
  for(const rule of rules){
    const end=rule.pattern.endsWith('$');
    const p=(end?rule.pattern.slice(0,-1):rule.pattern).split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    if(new RegExp('^'+p+(end?'$':'')).test(u.pathname+u.search)){
      const n=rule.pattern.replace(/[*$]/g,'').length;
      if(!best||n>best.n||(n===best.n&&rule.allow))best={n,allow:rule.allow};
    }
  }
  if(best&&!best.allow)throw new Error(`robots.txt disallows ${u.pathname}`);
}
async function get(url) {
  for(let i=0;i<6;i++){
    await allowed(url);
    const r=await request(url);
    if(r.status>=300&&r.status<400&&r.headers.get('location')){url=new URL(r.headers.get('location'),url).href;continue;}
    if(!r.ok)throw new Error(`HTTP ${r.status}: ${url}`);
    return {r,url};
  }
  throw new Error('redirect limit');
}
const decode = s => s.replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&#(x[\da-f]+|\d+);/gi,(_,n)=>String.fromCodePoint(n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n)));
function attrs(tag) {const a={};for(const m of tag.matchAll(/([^\s=<>/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g))a[m[1].toLowerCase()]=decode(m[2]??m[3]??m[4]);return a;}
function absolute(s,base){try{const u=new URL(s,base);return /^https?:$/.test(u.protocol)?u.href:null;}catch{return null;}}
const skip = /(?:logo|favicon|sprite|tracking|pixel|payment[_-]?icon|placeholder|badge|\.svg(?:[?#]|$)|\.ico(?:[?#]|$))/i;
function extract(html,base) {
  const images=[];
  function add(src,kind,a={}){const url=absolute(src,base);if(!url||skip.test(url+' '+(a.alt||'')+' '+(a.class||'')))return;if(a.width&&/^\d+$/.test(a.width)&&+a.width<600)return;images.push({url,kind,alt:a.alt||''});}
  for(const m of html.matchAll(/<meta\b[^>]*>/gi)){const a=attrs(m[0]);if(/^(og:image(?::url)?|twitter:image(?::src)?)$/i.test(a.property||a.name||'')&&a.content)add(a.content,'social');}
  for(const m of html.matchAll(/<img\b[^>]*>/gi)){
    const a=attrs(m[0]);const ss=a['data-srcset']||a.srcset;
    if(ss){const variants=ss.split(',').map(s=>{const [url,size]=s.trim().split(/\s+/);return {url,size:parseFloat(size)||0};}).sort((a,b)=>b.size-a.size);if(variants[0])add(variants[0].url,'img-srcset',{...a,width:undefined});}
    const src=a['data-src']||a['data-original']||a.src;if(src)add(src,'img',a);
  }
  const links=[];for(const m of html.matchAll(/<a\b[^>]*>/gi)){const a=attrs(m[0]);if(!a.href)continue;const u=absolute(a.href,base);if(u&&new URL(u).origin===new URL(base).origin&&/\/(?:products?|catalog|collections?|shop)(?:[/?#-]|$)/i.test(new URL(u).pathname))links.push(u.split('#')[0]);}
  return {images,links:[...new Set(links)].slice(0,2)};
}
const result={started_at:new Date().toISOString(),user_agent:UA,stores:[],candidates:[],robots:robotsLog};
const proposals=[];
for(const site of sites.values()){
  const report={slug:site.slug,site:site.url,count:0,pages:[],failures:[],rejected:[]};result.stores.push(report);
  const candidates=[];let pages=[site.url];
  for(let i=0;i<pages.length&&i<3;i++){
    try{const {r,url}=await get(pages[i]);const parsed=extract(await r.text(),url);report.pages.push(url);candidates.push(...parsed.images.map(c=>({...c,page:url})));if(i===0)pages.push(...parsed.links);}
    catch(e){report.failures.push({stage:'page',url:pages[i],error:e.message,cause:e.cause?.message});}
  }
  const seenUrls=new Set(),seenHashes=new Set();let attempts=0;
  for(const c of candidates){
    if(report.count>=6||attempts>=36)break;if(seenUrls.has(c.url))continue;seenUrls.add(c.url);attempts++;
    try{
      const {r,url}=await get(c.url);
      if(Number(r.headers.get('content-length'))>30*1024*1024)throw new Error('image exceeds 30 MB limit');
      const buffer=Buffer.from(await r.arrayBuffer());if(buffer.length>30*1024*1024)throw new Error('image exceeds 30 MB limit');
      const meta=await sharp(buffer,{limitInputPixels:60000000}).metadata();
      if(!meta.width||meta.width<600||meta.height<100||!['jpeg','png','webp','avif','gif','tiff'].includes(meta.format)){report.rejected.push({url,reason:'too small, thin, or unsupported format',width:meta.width,height:meta.height});continue;}
      const digest=hash(buffer);if(seenHashes.has(digest))continue;seenHashes.add(digest);
      const id=`${site.slug}-official-20261111-${report.count+1}`;
      const rawRel=`raw/${site.slug}/${id}.${meta.format==='jpeg'?'jpg':meta.format}`, webRel=`web/${site.slug}/${id}.webp`;
      await fs.mkdir(path.dirname(path.join(OUT,rawRel)),{recursive:true});await fs.mkdir(path.dirname(path.join(OUT,webRel)),{recursive:true});
      const webp=await sharp(buffer).rotate().resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();const wm=await sharp(webp).metadata();
      await fs.writeFile(path.join(OUT,rawRel),buffer);await fs.writeFile(path.join(OUT,webRel),webp);
      const candidate={id,store_slug:site.slug,source_page_url:c.page,source_image_url:url,discovered_image_url:c.url,kind:c.kind,source_alt:c.alt,retrieved_at:new Date().toISOString().slice(0,10),width:meta.width,height:meta.height,mime_type:`image/${meta.format}`,sha256:digest,raw_path:rawRel,web:{path:webRel,width:wm.width,height:wm.height,mime_type:'image/webp',sha256:hash(webp)}};
      result.candidates.push(candidate);report.count++;
      proposals.push({id,store_slug:site.slug,status:'published',storage_path:`${id}.webp`,source_page_url:c.page,source_image_url:url,source_label:`${site.name} official website`,retrieved_at:candidate.retrieved_at,rights_status:'not_confirmed',publication_basis:'official_site_opt_out_2026_11_11',width:wm.width,height:wm.height,mime_type:'image/webp',sha256:hash(webp),caption:{en:`Image from the official website of ${site.name}. Confirm current products and availability with the business.`,es:`Imagen del sitio web oficial de ${site.name}. Confirme los productos actuales y la disponibilidad con el negocio.`},alt:{en:`Image featured on the official website of ${site.name}`,es:`Imagen publicada en el sitio web oficial de ${site.name}`}});
    }catch(e){report.failures.push({stage:'image',url:c.url,error:e.message,cause:e.cause?.message});}
  }
  console.log(`${site.slug}: ${report.count} candidates; ${report.failures.length} failures`);
  await write('candidates.json',result);
}
result.finished_at=new Date().toISOString();
await write('candidates.json',result);
await write('proposed-manifest-entries.json',{photos:proposals});
await fs.writeFile(path.join(OUT,'README.md'),`# Official-site photo candidates\n\nRun from any directory: node ${path.relative(ROOT,fileURLToPath(import.meta.url))}\n\nOnly this artifact directory is written. official-sites.json records URL evidence and exclusions. candidates.json records originals, WebP derivatives, robots rules, rejected images and request failures. Up to three pages and six accepted images per store; at most 36 image attempts per store. Requests use a 10-second timeout; robots failures are treated conservatively and checked on redirect destinations and image hosts.\n\nproposed-manifest-entries.json mirrors the existing manifest shape. These are proposals only, with published as the intended future status; nothing is uploaded or published. storage_path is a proposed Blob key, and its metadata/hash describe the local WebP derivative. Review images and improve captions/alt before applying. Reruns overwrite reports; old image files may remain and only candidates.json defines the current run.\n`);
