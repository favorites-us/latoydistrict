import "server-only";
import { del, get, put } from "@vercel/blob";

// All files belong to this site's private store. Never expose storage URLs or
// credentials. Suppression reads must bypass the CDN, including cached misses.
export const privateFiles = {
  async read(path: string): Promise<Buffer | null> {
    const result = await get(path, { access: "private", useCache: false, abortSignal: AbortSignal.timeout(12000) });
    if (!result) return null;
    if (result.statusCode !== 200 || !result.stream) throw new Error("private_read_failed");
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  },
  async write(path: string, bytes: string | Buffer, contentType = "application/json", overwrite = false) {
    const result = await put(path, bytes, { access: "private", addRandomSuffix: false, allowOverwrite: overwrite, contentType, cacheControlMaxAge: 60, abortSignal: AbortSignal.timeout(12000) });
    if (!new URL(result.url).hostname.endsWith(".private.blob.vercel-storage.com")) throw new Error("private_store_required");
  },
  async remove(path: string) { await del(path, { abortSignal: AbortSignal.timeout(12000) }); },
};

export async function checkPrivateStorage() {
  const path = `diagnostics/${crypto.randomUUID()}.json`;
  try {
    await privateFiles.write(path, JSON.stringify({ diagnostic: "storage check", revision: 1 }));
    if (JSON.parse((await privateFiles.read(path))?.toString() ?? "null")?.revision !== 1) throw new Error("write_read_failed");
    await privateFiles.write(path, JSON.stringify({ diagnostic: "storage check", revision: 2 }), "application/json", true);
    if (JSON.parse((await privateFiles.read(path))?.toString() ?? "null")?.revision !== 2) throw new Error("consistent_read_failed");
  } finally { await privateFiles.remove(path); }
  if (await privateFiles.read(path)) throw new Error("cleanup_unconfirmed");
}
