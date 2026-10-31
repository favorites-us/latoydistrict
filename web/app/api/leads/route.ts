import { NextResponse } from "next/server";
import { storeBySlug } from "@/lib/stores";
import { limitedJson, sameOrigin, textField } from "@/lib/request-validation";
import { privateFiles } from "@/lib/server/private-files";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, reason: "origin" }, { status: 403 });
  const body = await limitedJson(request);
  if (!body || body.website) return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  const slug = textField(body.store_slug, 120);
  const store = slug ? storeBySlug.get(slug) : undefined;
  if (slug && !store) return NextResponse.json({ ok: false, reason: "unknown_store" }, { status: 400 });
  const buyer = textField(body.buyer_type, 40);
  const lead = {
    name: textField(body.name, 120), contact: textField(body.contact, 200),
    buyer_type: ["party_planner", "store_owner", "reseller", "other"].includes(buyer) ? buyer : "other",
    items: textField(body.items, 2000), locale: body.locale === "es" ? "es" : "en",
    store_slug: store?.slug ?? null, store_name: store?.name ?? null,
  };
  if (!lead.name || !lead.contact || !lead.items) return NextResponse.json({ ok: false, reason: "missing_fields" }, { status: 400 });
  try {
    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    await privateFiles.write(`inquiries/${created_at.slice(0, 7)}/${id}.json`, JSON.stringify({ id, created_at, ...lead }));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ ok: false, reason: "storage_error" }, { status: 502 }); }
}
