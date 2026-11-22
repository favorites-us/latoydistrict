import { streetMetadata, streetParams } from '@/lib/navigation-content';
import { notFound } from 'next/navigation';
import StreetPage from '@/components/pages/StreetPage';
import type { Block } from '@/lib/stores';
export const dynamicParams = false;
export const generateStaticParams = streetParams;
type Props = { params: Promise<{ block: string }> };
function validBlock(block: string): block is Block { return streetParams().some(p => p.block === block); }
export async function generateMetadata({ params }: Props) {
  const { block } = await params;
  if (!validBlock(block)) return {};
  return streetMetadata(block, 'en');
}
export default async function Page({ params }: Props) {
  const { block } = await params;
  if (!validBlock(block)) notFound();
  return <StreetPage block={block} locale="en" />;
}
