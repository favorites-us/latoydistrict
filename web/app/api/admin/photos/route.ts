import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { photoById } from "@/lib/photos";
import { privateFiles, checkPrivateStorage } from "@/lib/server/private-files";
import { photoIsReported, removePhoto } from "@/lib/server/photo-service";
import { limitedJson, textField } from "@/lib/request-validation";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  const configured = process.env.PHOTO_ADMIN_TOKEN;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!configured || configured.length < 32 || !supplied || !timingSafeEqual(createHash("sha256").update(configured).digest(), createHash("sha256").update(supplied).digest())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await limitedJson(request, 3_000_000);
  const photo = body && photoById(textField(body.photo_id, 120));
  if (!body || !photo) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (body.action === "check") {
      await checkPrivateStorage();
      return NextResponse.json({ ok: true, private_storage: "validated", diagnostic_files_remaining: 0 });
    }
    if (body.action === "remove") {
      const result = await removePhoto(photo, { name: "Directory operator", contact: "", reason: textField(body.reason, 1500) || "Removed by operator", locale: "en" });
      return NextResponse.json({ ok: true, ...result });
    }
    if (body.action !== "publish" || photo.status !== "published" || typeof body.image_base64 !== "string") return NextResponse.json({ ok: false }, { status: 400 });
    if (await photoIsReported(photo)) return NextResponse.json({ ok: false, reason: "removal_request_pending" }, { status: 409 });
    const bytes = Buffer.from(body.image_base64, "base64");
    if (!bytes.length || bytes.length > 2_000_000 || createHash("sha256").update(bytes).digest("hex") !== photo.sha256) return NextResponse.json({ ok: false, reason: "unreviewed_bytes" }, { status: 400 });
    await privateFiles.write(photo.storage_path, bytes, photo.mime_type);
    if (await photoIsReported(photo)) { await privateFiles.remove(photo.storage_path); return NextResponse.json({ ok: false, reason: "removal_request_pending" }, { status: 409 }); }
    return NextResponse.json({ ok: true, photo_id: photo.id });
  } catch { return NextResponse.json({ ok: false, reason: "private_storage_error" }, { status: 503 }); }
}
