import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { wholesaleBasics } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta(
  "/guide/wholesale-basics",
  "es",
  wholesaleBasics.es.title,
  wholesaleBasics.es.description,
);

export default function Page() {
  return <GuidePage guide={wholesaleBasics.es} locale="es" path="/guide/wholesale-basics" />;
}
