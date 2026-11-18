// Only the explicit browser opt-out signal changes Google's default behavior.
export function googlePrivacySettings(globalPrivacyControl: unknown) {
  return globalPrivacyControl === true ? {
    requestNonPersonalizedAds: 1,
    gtag: {
      restricted_data_processing: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  } : null;
}

// One beforeInteractive script applies privacy settings before GA configuration
// and before either afterInteractive Google library can execute. AdSense must
// receive the opt-out even when Analytics is not configured.
export function googleInitScript(id?: string): string {
  return `
(function(){
  var settings = typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true
    ? ${JSON.stringify(googlePrivacySettings(true))} : ${JSON.stringify(googlePrivacySettings(false))};
  if (!settings) return;
  (window.adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = settings.requestNonPersonalizedAds;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
  window.gtag('set', settings.gtag);
})();
${id ? analyticsConfigScript(id) : ""}
`;
}

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
