# LA Toy District Directory

Bilingual (EN/ES) directory of wholesale toy, party and gift suppliers in
Downtown LA's Toy District, built from public records. Plan and rationale:
[`docs/PLAN.md`](docs/PLAN.md) · review & architecture:
[`docs/REVIEW-AND-BUILD-PLAN.md`](docs/REVIEW-AND-BUILD-PLAN.md).

## Layout

| Path | What |
|---|---|
| `pipeline/` | Data collection scripts (Node, run manually ~quarterly) |
| `data/stores.json` | Single source of truth the site builds from (committed) |
| `web/` | Next.js 15 app (SSG) |
| `supabase/schema.sql` | Leads table for the Get Quotes form |
| `docs/` | Plan, review, and phase-gate verdicts |

## Data pipeline

```bash
npm install          # root: zod
npm run pipeline     # 01 opendata → 02 places → 03 crossmatch → 04 enrich → 05 build
```

- **Primary source:** LA Office of Finance "Listing of Active Businesses"
  (Socrata, public record — free to store/display).
- **Google Places** (`02`) runs only when `GOOGLE_MAPS_API_KEY` is set, and is
  used for reconciliation only (place_id, open/closed). Per Google Maps ToS we
  do not store or display Places content.
- Output is `data/stores.json`; review the diff before committing a refresh.

## Web app

```bash
cd web && npm install
npm run dev     # http://localhost:3000
npm run build   # SSG — ~400 static pages (EN + /es mirror)
```

Environment (all optional; site builds without them):

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (default `https://toydistrictlosangeles.com`) |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement id — enables page views + `store_view`/`lead_submit` events |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Lead form storage (`supabase/schema.sql`) |

Deploy: Vercel, root directory `web/`.

## Editing content

- UI strings: `web/lib/i18n.ts` (EN/ES side by side).
- Guides: `web/lib/content/guides.ts` — committed copy, both locales;
  do not regenerate translations at build time.
- Store facts (hours, MOQ, payment…): filled by in-person verification
  (Phase 3); set `verified_at` when confirmed.
