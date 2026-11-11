import type { Locale } from "@/lib/i18n";
export default function DistrictVisual({ locale }: { locale: Locale }) {
  return <div className="district-visual"><svg viewBox="0 0 640 320" role="img" aria-label={locale === "es" ? "Mapa ilustrativo del Toy District, no a escala" : "Illustrative Toy District map, not to scale"}>
    <defs><pattern id="blocks" width="112" height="86" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect x="9" y="9" width="94" height="68" rx="10" fill="#d9e9e2"/><rect x="17" y="17" width="78" height="52" rx="6" fill="#e7f1ec"/></pattern></defs>
    <rect width="640" height="320" fill="#f5f8f6"/><rect width="640" height="320" fill="url(#blocks)"/>
    <path d="M-20 255L660 34" stroke="white" strokeWidth="28"/><path d="M200 -20L320 350M410 -20L530 350" stroke="white" strokeWidth="20"/>
    <path d="M230 172L425 110L480 270L285 330Z" fill="#b1d7c5" fillOpacity=".65" stroke="#087657" strokeWidth="2" strokeDasharray="5 5"/>
    <g fontFamily="Arial, sans-serif" fontSize="13" fill="#456358"><text x="70" y="210" transform="rotate(-18 70 210)">E 3rd Street</text><text x="340" y="155" transform="rotate(72 340 155)">Maple Avenue</text><text x="520" y="145" transform="rotate(72 520 145)">San Pedro Street</text></g>
    {[[280,175],[380,165],[425,235]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><circle r="23" fill="white"/><circle r="17" fill="#087657"/><path d="M-7 -5H7V7H-7ZM-4 -5V-9H4V-5" fill="none" stroke="white" strokeWidth="2"/></g>)}
    <rect x="24" y="24" width="168" height="40" rx="12" fill="white"/><text x="42" y="49" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="600" fill="#173a2d">LA Toy District</text>
  </svg><span className="map-caption">{locale === "es" ? "Explore el barrio · Mapa ilustrativo" : "Explore the neighborhood · Illustrative map"}</span></div>;
}
