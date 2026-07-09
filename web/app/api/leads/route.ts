import { NextResponse } from "next/server";

// Lead storage: Supabase REST (service role, server-side only). Env-gated so the
// site builds and runs without Supabase configured — the form then reports the
// mailto fallback to the visitor.
export async function POST(req: Request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_json" }, { status: 400 });
  }

  const lead = {
    name: String(body.name ?? "").slice(0, 120),
    contact: String(body.contact ?? "").slice(0, 200),
    buyer_type: String(body.buyer_type ?? "").slice(0, 40),
    items: String(body.items ?? "").slice(0, 2000),
    locale: body.locale === "es" ? "es" : "en",
  };
  if (!lead.name || !lead.contact || !lead.items) {
    return NextResponse.json({ ok: false, reason: "missing_fields" }, { status: 400 });
  }

  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  const res = await fetch(`${url}/rest/v1/leads`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, reason: "storage_error" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
