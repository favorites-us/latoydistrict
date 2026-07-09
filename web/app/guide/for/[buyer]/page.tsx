import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuidePage from "@/components/pages/GuidePage";
import { buyerGuides, type BuyerSlug } from "@/lib/content/guides";
import { altMeta } from "@/lib/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(buyerGuides).map((buyer) => ({ buyer }));
}

export async function generateMetadata({ params }: { params: Promise<{ buyer: string }> }): Promise<Metadata> {
  const { buyer } = await params;
  const g = buyerGuides[buyer as BuyerSlug]?.en;
  if (!g) return {};
  return altMeta(`/guide/for/${buyer}`, "en", g.title, g.description);
}

export default async function Page({ params }: { params: Promise<{ buyer: string }> }) {
  const { buyer } = await params;
  const g = buyerGuides[buyer as BuyerSlug]?.en;
  if (!g) notFound();
  return <GuidePage guide={g} locale="en" path={`/guide/for/${buyer}`} />;
}
