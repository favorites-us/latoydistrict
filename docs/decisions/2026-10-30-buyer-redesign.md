# 2026-10-30 buyer experience redesign

User authorized responsive design-system work, limited reuse of official-site photos with removal support, buyer feature proposals, and actual Claude Code review. Earlier broad-investment holds are superseded by this instruction.

## Design plan before implementation

Color: white #ffffff; mist #f6f8fc; ink #172b4d; cobalt #2456d3; pale blue #eff4fc; orange #ef8d32. DM Sans body, Barlow Semi Condensed 600/700 headings, Latin accents included and self-hosted. Tailwind 4 tokens and shadcn-style local primitives with Radix modal behavior.

Desktop: compact navigation, left-aligned buying-trip headline and district illustration, search and filters, editorial supplier rows with optional photos, optional map, saved suppliers sidebar/page. Mobile: compact heading, visible search, single-column rows, map on demand, saved-list shortcut. Merchant page: identity and source-linked image, readable buying notes, contact/save/quote actions.

```text
[District brand] [Directory | Buying guide] [Saved] [ES]
[Buying trip headline + explanation] [district streets]
[Search products, suppliers, streets_________________]
[Category / Street / Buying information / Contact]
[Result count + sort]                     [List / Map]
[Supplier row: identity / info / contact / save_______]
[Supplier row________________________________________]
```

Review against brief: avoid a generic hero plus equal empty cards. Most of 191 records are sparse; rows remain useful without stock photos. Cobalt district graphic is the one expressive element. No invented ratings, live stock, verified-open badges, or placeholder photos implying real stores. Official product descriptions drive product search.

## Claude first review

See artifacts/redesign-20261030/claude-plan.txt (actual Claude Code; supplied-code review, no independent browsing). Accept search-first, info labels, URL filters, empty states, no raw queries/PII in analytics, browser-local list, source context in comparison, explicit operator-inquiry destination, and private photo storage with removal covering direct URLs. Reject replacing verified_at with online check dates: those fields have different meanings, and all current records have null in-person verification. July registration snapshot remains factual rather than being relabeled today.

## GA evidence

Authenticated GA Home UI, last-28-days preset: active users 314 (+37.1%), views 790 (+45.8%), new users 312 (+36.8%), key events 0. Read on October 30. Home cards have independent date ranges; do not call the last-7-days channel totals 28-day figures. API token lacked analytics scopes; UI supplied these readings. No host/internal filter added in this UI view. Not proof of buyer conversion or redesign causal impact.

## Buyer roadmap after this release

| Priority | Buyer need | Useful addition | Evidence needed |
|---|---|---|---|
| 1 | Avoid a wasted trip or unusable order size | Merchant-reviewed MOQ, units per case, mixed-case rules, pickup cutoff, appointment and account requirements | Structured owner submissions, identity/address match and moderation; show checked dates and scope |
| 2 | Source products suitable for the buyer’s channel | Exact brand/product-line tags, authorized-distributor evidence, retailer and marketplace restrictions where published | Manufacturer/merchant documents; never infer authorization from a logo or catalog photo |
| 3 | Compare the real order cost | Buyer-entered case-price / quantity / shipping / tax quote worksheet with per-unit total and quote expiry | Actual supplier quote entered by buyer; no invented wholesale prices or automatic tax assumptions |
| 4 | Finish a visit efficiently | Group saved shops by block, optional explicit walking route and pickup checklist | Verified entrances/suites and pickup locations; current tool groups streets and is not a route optimizer |
| 5 | Keep source information useful | Recheck queue for popular landing pages and stale official URLs; visible current-source status | Latest GA landing report plus observed source availability; do not infer closure from a failed website |

This release implements the browser-local shortlist, source-context comparison, street-grouped print sheet and copy-only inquiry draft. These address a buyer’s next action without inventing missing commercial terms. No paid API, advertising spend, buyer account, automatic supplier messaging or stock/price feed was activated.

## Photo scope and source decisions

Two American Silk catalog-page images were selected from https://www.americansilkinc.com/catalog, retrieved October 30. Captions explicitly say printed prices, pack sizes and availability require confirmation. These are catalog illustrations, not store exterior photos or a current price offer. Permission is not confirmed; publication follows the user’s explicit opt-out request and is not recorded as a license or legal clearance.

Excluded: American Silk homepage photo with a stock watermark; California Balloon House and Casa Manga assets because their terms explicitly restrict reproduction without permission; Tom’s Model’s previously cited Shopify site returned HTTP 402 on this check. No Google/Street View images or fabricated store photos. Exclusions are source-specific and do not estimate coverage of all 191 listings.

U.S. Copyright Office: [photographs](https://www.copyright.gov/engage/photographers/) and [section 512](https://www.copyright.gov/512/). A takedown option does not itself supply permission or automatically cover operator-uploaded copies with safe harbor. No legal-risk guarantee is made.

Images stay outside Git and the public directory. The serving route checks persisted removal records and sends no-store/noimageindex. A successful report blocks the image even if object deletion fails. The byte store is private; no optimizer, signed public URL or fallback hotlink bypasses the block. Already downloaded copies cannot be recalled. Source metadata may remain after removal.

## Data and measurement boundaries

All 191 store records and in-person verification dates remain unchanged. Free-text search and inquiry drafts are not sent as analytics parameters. Search words intentionally stay out of URL history; category/street/boolean filters remain shareable. Drafts are kept in component memory only. Saved slugs remain in localStorage; storage failures are disclosed. Existing operator inquiries now explicitly identify the directory as recipient, with no promise of forwarding or guaranteed replies.

New measurement events: shortlist_add/remove, compare_open, visit_print, quote_copy, directory_filter, photo_removal_submit. Contact/store events queue before gtag initialization. Runtime delivery to GA is separate from code/browser checks; do not claim business conversion from these interactions.

## Implementation review and dispositions

Actual Claude Code performed the implementation review and a focused follow-up (artifacts `claude-implementation.*`, `claude-followup.*`). These are supplied-code reviews, not independent browser or live-service tests.

Fixed findings: durable anonymous `photo_block` records separate from private request handling; byte-deletion outcome persisted; pre-hydration image failure detection; compact catalog price/source warning; shared URL sanitizer for comparison sources; explicit website-check date labels; consistent official-source hours in print/comparison; select labels, view grouping and report-result focus/live region; street-label search; narrower buying-info filter; small-text legibility; provider receives only known slugs; explicit sorting locale; neutral unsupported wholesale badge; result plural/clear-event handling; narrow-screen modal layout.

The focused follow-up caught PostgREST bulk-insert NULL behavior when only one row supplied an `id`. Both rows now receive explicit UUIDs through a shared row factory used by both real removal and the bounded production schema check. Regression tests reject a bulk insert with missing IDs. The permanent suppression remains independent of `handled`, note edits or deleting private request data.

Residual operations: keep anonymous suppression rows when cleaning the leads inbox; review requests manually (no new notification service); removal request personal data has no automatic retention job; the opt-out form deliberately hides photos before adjudicating a dispute, so it can be abused. These tradeoffs and cleanup commands are in `docs/operations/photos.md`. No rights clearance or automatic statutory safe harbor is asserted.


## Production discovery: storage replacement

The initial Supabase-backed release passed mocks, but the real private-backend check failed before any photos were published. Its configured hostname `oetxtnhnizzgfjvvjmfw.supabase.co` failed DNS both in the function and locally. This also prevented the prior inquiry endpoint from storing new submissions. No historical data was read or migrated, and the old credentials were not modified.

The final runtime uses a dedicated private Vercel Blob store connected only to this project production. Images, anonymous permanent suppression, private removal requests, anonymous audits and new directory inquiries have separate prefixes. Every SDK read bypasses the CDN (`useCache: false`); serving checks suppression twice. Blocking is stored before other operations. Inbox/audit or physical deletion failure cannot undo suppression. The Supabase-specific bulk-insert implementation above is historical and has been replaced, not left as a fallback.

The real backend diagnostic now tests private write/read/overwrite/read/delete/absence without a real ownership claim or inquiry. No plan upgrade or subscription was purchased; normal usage charges follow the existing Vercel plan. See the operations guide for inbox review and permanent block retention. An additional actual Claude Code review covers this final storage implementation.

Desktop browser inspection found Tailwind's utility display overriding two component hiding rules; mobile menu/filter toggles now use explicit responsive utilities. The mobile saved-list icon now has a full accessible label independent of its hidden text.

Final storage review dispositions: actual `check` returned 200 with private storage validated and zero diagnostic files remaining, confirming the SDK's missing-object behavior, private-host format and consistent reads. `StorePhoto` uses a plain image element, with Next image optimization disabled. The deliberate opt-out mechanism can be abused to suppress a photo; no automatic restoration is added. Public inquiry abuse/rate limiting remains an operational monitoring item, not a claim of comprehensive anti-abuse protection. No public endpoint reads either private inbox.

Browser QA also found MapLibre 6's worker was not located by the bundle, although raster tiles loaded. Applied the official Next.js worker URL setup so the build emits the worker as a hashed asset, and set source maxzoom 19 above clusterMaxZoom 18. Reference: https://maplibre.org/maplibre-gl-js/docs/ (ESM/Next.js installation).
