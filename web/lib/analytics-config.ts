// Explicit URL overrides keep free-text searches out of GA's default URL fields.
// Update before history listeners run so enhanced measurement sees clean URLs too.
export function analyticsConfigScript(id: string): string {
  return `
window.dataLayer=window.dataLayer||[];
function gtag(){window.dataLayer.push(arguments);}
function analyticsUrl(value){
  if(!value)return '';
  try{var url=new URL(value,window.location.href);url.searchParams.delete('q');return url.href;}catch{return '';}
}
// Preserve an incoming header search for hydration, then remove it before GA loads.
var incomingUrl=new URL(window.location.href);
if(incomingUrl.searchParams.has('q')){
  window.__directorySearchQuery=incomingUrl.searchParams.get('q');
  incomingUrl.searchParams.delete('q');
  history.replaceState(history.state,'',incomingUrl.href);
}
var analyticsId=${JSON.stringify(id)};
var analyticsReferrer=analyticsUrl(document.referrer);
function analyticsLocation(value){
  gtag('set',{page_location:analyticsUrl(value),page_referrer:analyticsReferrer});
}
analyticsLocation(window.location.href);
gtag('js',new Date());
gtag('config',analyticsId,{page_location:analyticsUrl(window.location.href),page_referrer:analyticsReferrer});
['pushState','replaceState'].forEach(function(method){
  var original=history[method];
  history[method]=function(state,title,url){
    var previous=analyticsUrl(window.location.href);
    analyticsLocation(url==null?window.location.href:new URL(url,window.location.href).href);
    try{return original.apply(this,arguments);}catch(error){analyticsLocation(previous);throw error;}
  };
});
window.addEventListener('popstate',function(){analyticsLocation(window.location.href);});
`;
}
