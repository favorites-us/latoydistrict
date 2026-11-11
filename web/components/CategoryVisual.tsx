import { Blocks, Heart, Bot, PartyPopper, Sparkles, Headphones, Gift, Store } from "lucide-react";
import { catLabel, type Locale } from "@/lib/i18n";
const icons = { toys: Blocks, plush: Heart, figures: Bot, party: PartyPopper, seasonal: Sparkles, electronics: Headphones, gifts: Gift, general: Store };
export function CategoryIcon({ category, size = 24 }: { category: string; size?: number }) { const Icon = icons[category as keyof typeof icons] || Store; return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />; }
export default function CategoryVisual({ category, locale, showLabel = true }: { category: string; locale: Locale; showLabel?: boolean }) { return <div className={`category-visual category-${category}`}><CategoryIcon category={category} size={64} />{showLabel && <span>{catLabel(locale, category)}</span>}</div>; }
