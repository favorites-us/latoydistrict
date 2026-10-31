import "server-only";
import { privateFiles } from "./private-files";
import type { StorePhoto } from "@/lib/photos";

type RemovalRequest = { name: string; contact: string; reason: string; locale: string };
export function photoBlockPath(photo: StorePhoto) { return `photo-blocks/${photo.id}.json`; }
export async function photoIsReported(photo: StorePhoto) {
  // Existence is the permanent block. Request handling and inbox deletion do
  // not affect it. Read errors propagate, so image serving fails closed.
  return (await privateFiles.read(photoBlockPath(photo))) !== null;
}

export async function removePhoto(photo: StorePhoto, report: RemovalRequest) {
  const id = crypto.randomUUID();
  const created_at = new Date().toISOString();
  // Persist anonymous suppression first. Its only meaning is "never serve".
  await privateFiles.write(photoBlockPath(photo), JSON.stringify({ photo_id: photo.id, blocked_at: created_at }), "application/json", true);
  let request_saved = false;
  try {
    await privateFiles.write(`photo-requests/${id}.json`, JSON.stringify({ id, created_at, photo_id: photo.id, ...report }));
    request_saved = true;
  } catch { /* Removing the photo takes priority over storing contact details. */ }
  let bytes_removed = false;
  try { await privateFiles.remove(photo.storage_path); bytes_removed = true; } catch { /* Persisted block still prevents serving. */ }
  try { await privateFiles.write(`photo-audits/${id}.json`, JSON.stringify({ photo_id: photo.id, created_at, bytes_removed, request_saved })); } catch { /* Block remains permanent even if audit storage fails. */ }
  return { hidden: true, bytes_removed, request_saved };
}
