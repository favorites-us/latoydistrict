import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { visiting } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta("/guide/visiting", "es", visiting.es.title, visiting.es.description);

export default function Page() {
  return <GuidePage guide={visiting.es} locale="es" path="/guide/visiting" />;
}
