import type { Metadata } from "next";
import GuidePage from "@/components/pages/GuidePage";
import { wholesaleBasics } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const metadata: Metadata = altMeta(
  "/guide/wholesale-basics",
  "en",
  wholesaleBasics.en.title,
  wholesaleBasics.en.description,
);

export default function Page() {
  return <GuidePage guide={wholesaleBasics.en} locale="en" path="/guide/wholesale-basics" />;
}
