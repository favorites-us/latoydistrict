import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { visiting } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta("/guide/visiting", "en", visiting.en.title, visiting.en.description);

export default function Page() {
  return <GuidePage guide={visiting.en} locale="en" path="/guide/visiting" />;
}
