import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { wholesaleToys } from "@/lib/content/wholesale-toys";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta("/guide/wholesale-toys-los-angeles", "es", wholesaleToys.es.title, wholesaleToys.es.description);

export default function Page() {
  return <GuidePage guide={wholesaleToys.es} locale="es" path="/guide/wholesale-toys-los-angeles" />;
}
