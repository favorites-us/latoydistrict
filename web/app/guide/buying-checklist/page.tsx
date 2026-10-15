import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { buyingChecklist } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta("/guide/buying-checklist", "en", buyingChecklist.en.title, buyingChecklist.en.description);

export default function Page() {
  return <GuidePage guide={buyingChecklist.en} locale="en" path="/guide/buying-checklist" />;
}
