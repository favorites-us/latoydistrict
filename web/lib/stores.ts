import raw from "../data/stores.json";

export type Category =
  | "toys"
  | "plush"
  | "figures"
  | "party"
  | "seasonal"
  | "electronics"
  | "gifts"
  | "general";

export type Block =
  | "winston"
  | "boyd"
  | "werdin"
  | "wall"
  | "3rd"
  | "4th"
  | "5th"
  | "los-angeles"
  | "san-pedro";

export interface Store {
  id: string;
  slug: string;
  name: string;
  name_es: string | null;
  address: {
    line1: string;
    unit: string | null;
    zip: string;
    lat: number | null;
    lng: number | null;
  };
  block: Block;
  category: Category[];
  wholesale_retail: "wholesale" | "retail" | "both" | "unknown";
  naics: string | null;
  place_id: string | null;
  phone: string | null;
  hours: string | null;
  links?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    yelp?: string;
    other?: string[];
  };
  wechat: string | null;
  languages: string[] | null;
  payment: string[] | null;
  moq: string | null;
  resale_cert_required: boolean | null;
  mentions: { source: string; url: string; note: string }[];
  sources: string[];
  confidence: "high" | "medium" | "low";
  since: string | null;
  verified_at: string | null;
  status: "open" | "unverified" | "closed";
}

export const stores: Store[] = (raw as { stores: Store[] }).stores;

export const storeBySlug = new Map(stores.map((s) => [s.slug, s]));

export const BLOCK_LABELS: Record<Block, string> = {
  winston: "Winston St",
  boyd: "Boyd St",
  werdin: "Werdin Pl",
  wall: "Wall St",
  "3rd": "E 3rd St",
  "4th": "E 4th St",
  "5th": "E 5th St",
  "los-angeles": "S Los Angeles St",
  "san-pedro": "S San Pedro St",
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toydistrictlosangeles.com";

export function fullAddress(s: Store): string {
  const unit = s.address.unit ? ` #${s.address.unit}` : "";
  return `${s.address.line1}${unit}, Los Angeles, CA ${s.address.zip}`;
}
