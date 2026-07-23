import { NextResponse } from "next/server";

// Supabase keepalive: the free tier pauses a project after 7 days with no
// database activity. Leads trickle in too rarely to guarantee that, so a daily
// Vercel Cron (see web/vercel.json) hits this route to run one cheap read
// against the leads table, which resets the inactivity timer.
//
// Env-gated like /api/leads: without Supabase configured it no-ops instead of
// erroring, so the site still builds and deploys anywhere.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // When CRON_SECRET is set in the Vercel project, Vercel sends it as a Bearer
  // token on cron invocations. Require it so the endpoint can't be spammed by
  // anyone who finds the URL. If unset, stay open (graceful default).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, reason: "unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 503 });
  }

  // A HEAD count is the cheapest possible query that still touches the DB and
  // counts as activity. No rows are transferred.
  const res = await fetch(`${url}/rest/v1/leads?select=id&limit=1`, {
    method: "HEAD",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "count=exact",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ ok: false, reason: "storage_error", status: res.status }, { status: 502 });
  }
  return NextResponse.json({ ok: true, pinged: new Date().toISOString() });
}
