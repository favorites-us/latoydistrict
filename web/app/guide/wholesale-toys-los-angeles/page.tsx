import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { wholesaleToys } from "@/lib/content/wholesale-toys";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta("/guide/wholesale-toys-los-angeles", "en", wholesaleToys.en.title, wholesaleToys.en.description);

export default function Page() {
  return <GuidePage guide={wholesaleToys.en} locale="en" path="/guide/wholesale-toys-los-angeles" />;
}
