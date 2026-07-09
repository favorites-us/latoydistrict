import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StorePage from "@/components/pages/StorePage";
import { fullAddress, storeBySlug, stores } from "@/lib/stores";
import { altMeta } from "@/lib/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return stores.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const store = storeBySlug.get(slug);
  if (!store) return {};
  return altMeta(
    `/stores/${slug}`,
    "en",
    `${store.name} — Toy District, Los Angeles`,
    `${store.name} at ${fullAddress(store)} in LA's Toy District. Address, category and wholesale info.`,
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = storeBySlug.get(slug);
  if (!store) notFound();
  return <StorePage store={store} locale="en" />;
}
