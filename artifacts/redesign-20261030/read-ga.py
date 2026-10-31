import subprocess,json,urllib.request,urllib.error,concurrent.futures,datetime
from pathlib import Path
out=Path(__file__).parent
access=None
for args in [['gcloud','auth','application-default','print-access-token','--quiet'],['gcloud','auth','print-access-token','--quiet']]:
 r=subprocess.run(args,capture_output=True,text=True,timeout=25)
 if r.returncode==0 and r.stdout.strip(): access=r.stdout.strip(); break
if not access:
 print('GA read unavailable: no existing gcloud token could be obtained.'); raise SystemExit(0)
base={'dateRanges':[{'startDate':'2026-09-02','endDate':'2026-09-29','name':'previous'},{'startDate':'2026-09-30','endDate':'2026-10-27','name':'recent'}], 'dimensionFilter':{'filter':{'fieldName':'hostName','stringFilter':{'matchType':'EXACT','value':'toydistrictlosangeles.com'}}}}
reports={
 'overview':{'metrics':[{'name':s} for s in ['totalUsers','sessions','engagedSessions','screenPageViews','engagementRate']]},
 'channels':{'dimensions':[{'name':'sessionDefaultChannelGroup'}],'metrics':[{'name':s} for s in ['totalUsers','sessions','engagedSessions']]},
 'devices':{'dimensions':[{'name':'deviceCategory'}],'metrics':[{'name':s} for s in ['totalUsers','sessions','engagementRate']]},
 'pages':{'dimensions':[{'name':'pagePath'}],'metrics':[{'name':'screenPageViews'},{'name':'totalUsers'}],'orderBys':[{'metric':{'metricName':'screenPageViews'},'desc':True}],'limit':40},
 'events':{'dimensions':[{'name':'eventName'}],'metrics':[{'name':'eventCount'},{'name':'totalUsers'}]},
}
def read(pair):
 name,extra=pair; body={**base,**extra}; req=urllib.request.Request('https://analyticsdata.googleapis.com/v1beta/properties/545044706:runReport',data=json.dumps(body).encode(),headers={'Authorization':'Bearer '+access,'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=30) as r: payload=json.load(r)
  (out/('ga-'+name+'.json')).write_text(json.dumps({'queried_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'request':body,'response':payload},indent=2))
  return {'report':name,'rows':payload.get('rows',[])[:12],'rowCount':payload.get('rowCount'),'metadata':payload.get('metadata')}
 except urllib.error.HTTPError as e: return {'report':name,'http_status':e.code,'error':json.loads(e.read()).get('error',{}).get('message')}
for result in concurrent.futures.ThreadPoolExecutor(max_workers=5).map(read,reports.items()): print(json.dumps(result))
