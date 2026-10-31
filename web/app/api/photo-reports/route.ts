import { NextResponse } from "next/server";
import { photoById } from "@/lib/photos";
import { limitedJson, sameOrigin, textField, validPhotoReport } from "@/lib/request-validation";
import { photoIsReported, removePhoto } from "@/lib/server/photo-service";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });
  const body = await limitedJson(request);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  const photo = photoById(textField(body.photo_id, 120));
  const report = validPhotoReport(body);
  if (!photo || !report) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    // Idempotent: repeated reports cannot grow the inbox after a photo is hidden.
    if (await photoIsReported(photo)) return NextResponse.json({ ok: true, hidden: true });
    const result = await removePhoto(photo, report);
    return NextResponse.json({ ok: true, hidden: result.hidden });
  } catch { return NextResponse.json({ ok: false }, { status: 503 }); }
}
