import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StorePage from "@/components/pages/StorePage";
import { storeBySlug, stores } from "@/lib/stores";
import { storeMeta, storeTitle, storeDescription } from "@/lib/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return stores.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const store = storeBySlug.get(slug);
  if (!store) return {};
  return storeMeta(
    `/stores/${slug}`,
    "es",
    storeTitle(store, "es"),
    storeDescription(store, "es"),
  );
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = storeBySlug.get(slug);
  if (!store) notFound();
  return <StorePage store={store} locale="es" />;
}
