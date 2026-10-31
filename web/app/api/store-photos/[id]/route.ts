import { photoById } from "@/lib/photos";
import { privateFiles } from "@/lib/server/private-files";
import { photoIsReported } from "@/lib/server/photo-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const headers = { "Cache-Control": "private, no-store, max-age=0", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store", "X-Robots-Tag": "noindex, noimageindex", "X-Content-Type-Options": "nosniff" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const photo = photoById(id);
  if (!photo || photo.status !== "published") return new Response(null, { status: 404, headers });
  try {
    if (await photoIsReported(photo)) return new Response(null, { status: 410, headers });
    const bytes = await privateFiles.read(photo.storage_path);
    if (!bytes) return new Response(null, { status: 404, headers });
    if (await photoIsReported(photo)) return new Response(null, { status: 410, headers });
    return new Response(new Uint8Array(bytes), { headers: { ...headers, "Content-Type": photo.mime_type } });
  } catch { return new Response(null, { status: 503, headers }); }
}
