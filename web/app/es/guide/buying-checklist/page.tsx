import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { buyingChecklist } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta("/guide/buying-checklist", "es", buyingChecklist.es.title, buyingChecklist.es.description);

export default function Page() {
  return <GuidePage guide={buyingChecklist.es} locale="es" path="/guide/buying-checklist" />;
}
