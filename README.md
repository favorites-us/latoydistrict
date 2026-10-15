# LA Toy District Directory

Bilingual (EN/ES) directory of wholesale toy, party and gift suppliers in
Downtown LA's Toy District, built from public records. Plan and rationale:
[`docs/PLAN.md`](docs/PLAN.md) · review & architecture:
[`docs/REVIEW-AND-BUILD-PLAN.md`](docs/REVIEW-AND-BUILD-PLAN.md).

## Layout

| Path | What |
|---|---|
| `pipeline/` | Data collection scripts (Node, run manually ~quarterly) |
| `web/data/stores.json` | Generated, validated directory the site builds from (committed) |
| `pipeline/data/` | Preserved baseline and reviewed field-level evidence |
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
- Output is `web/data/stores.json`; review the diff before committing a refresh.
- Reviewed online facts survive rebuilding. Identity changes stop the build for
  reconciliation. See [the evidence workflow](pipeline/CONTACT-RESEARCH-C.md).
- To apply reviewed facts without refreshing registry data:
  `npm run reviewed-enrich -- --dry`, then `npm run reviewed-enrich`.
- Run `npm test` for identity, source-policy and data-preservation checks.
- `npm run free-enrich` stages Census/category and OSM candidates in `pipeline/out/`.
  It no longer publishes contacts or mutates the site directory; see brief C.

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
| `NEXT_PUBLIC_GA_ID` | GA4 measurement id — page views, `store_view`, `store_contact_click`, `lead_submit` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Lead form storage (`supabase/schema.sql`) |

Deploy: Vercel, root directory `web/`.

## Editing content

- UI strings: `web/lib/i18n.ts` (EN/ES side by side).
- Guides: `web/lib/content/guides.ts` — committed copy, both locales;
  do not regenerate translations at build time.
- Online store facts: edit `pipeline/data/reviewed-stores.json`, with exact
  source, identity match, scope and EN/ES copy. Only business-owned pages support
  hours/buying terms; public-directory phones carry a separate source label.
  Keep `verified_at` reserved for in-person verification.
- `store_contact_click` distinguishes phone/email/website/buying-source clicks;
  it measures intent, not a completed lead. No contact address is sent in the
  custom event payload. Production GA delivery requires deployment with GA enabled.
