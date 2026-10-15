# Reviewed online evidence

This supersedes the merge/output instructions in briefs A and B. Their source
restrictions still apply. Raw `out/contacts*.json` and OSM candidates are research
queues, never publication inputs.

## Research and acceptance

1. Freeze the cohort before searching. Track GA-priority, known official
   channels, and random registration-derived candidates separately. Previously
   discovered information is not new discovery yield.
2. Search name + full address/suite, then supported aliases and known phone.
   Open the original page. Search snippets and an LLM's answer are not evidence.
3. Match the merchant and street address, including suite in shared buildings.
   Public registrations and historic imports establish leads, not current
   opening, inventory, hours or buying conditions.
4. Business-owned pages may support their explicit contact and buying details.
   A matching public directory may supply **phone only**, labeled as not
   owner-confirmed. Manufacturer pages support attributed listings only.
   Google Maps / Places / Business Profile content remains excluded.
5. Respect source terms and access controls. Stop at access blocks; do not
   bypass them. Do not submit forms or send merchant messages as research.
6. Keep unknowns unknown. A failed website request does not establish closure.
   Free-shipping thresholds are not MOQ; tax-exempt account rules are not a
   universal permit requirement. State channel/scope and remaining uncertainty.

## Durable data

- `data/enrichment-baseline.json` is the committed pre-pilot directory snapshot.
  Its facts are inherited, not freshly verified. Never copy generated review
  fields into it. Review a deliberate baseline refresh separately.
- `data/reviewed-stores.json` holds approved field updates and short EN/ES buying
  facts. Each has source URL/type, date the page was checked, scope, previous
  value, and identity evidence. `checked_at` is not the source publication date
  or a guarantee of current operation. `verified_at` remains for in-person checks.
  Business source URLs must match that merchant's reviewed `business_domains`.
  Directory evidence may only fill a blank phone; it cannot replace an existing
  number or downgrade an existing source label through reconfirmation.
- Online MOQ stays in scoped `online_facts`, rather than a universal `moq` field.
  Do not infer payment or permit booleans from ambiguous prose.
- If official pages conflict, keep both URLs in `source` / `additional_sources`
  and explain the discrepancy. An approved hours correction may set its value to
  null; the UI then asks visitors to confirm hours instead of choosing a closing
  time without evidence. Every additional source gets the same policy/domain checks.
- `05-build.mjs` reapplies the legacy enrichment and reviewed overlay to registry
  output, validating identities and fields. A missing/changed baseline identity
  stops the build for reconciliation instead of attaching data to a new tenant.
- `07-contact.mjs` regenerates the directory from the committed baseline and
  current approved overlay. This works without `out/enriched.json`, and removing
  an overlay restores baseline values rather than leaving stale reviewed data.
  If the generated directory has a different inventory/identity after a registry
  refresh, 07 stops until the baseline is deliberately reconciled.
- `06-free-enrich.mjs` requires name **and** address **and** suite for OSM matches.
  Its contact/URL/hour hints go only to `out/osm-contact-candidates.json` for
  review. Census coordinates and name-based categories are staged in
  `out/free-enrichment-candidates.json`; 06 no longer writes the generated site
  directory. Deliberately update the baseline's coordinates/categories from
  reviewed candidates, then run 07. This avoids losing an intervening 06 write.

```bash
npm run reviewed-enrich -- --dry
npm run reviewed-enrich
npm test
npm run build
```

Review the generated diff before publishing. New records need a reviewed baseline
refresh from the normal registry pipeline. Do not edit generated stores directly.

## Evaluation

Record accepted facts, rejected matches, unavailable sources, and unknowns for
every sampled candidate. Directory-phone yield and owner-published buying-info
yield are different measures. Do not report hourly productivity unless research
and verification time was actually measured separately.

The UI's `store_contact_click` event has `store_slug` and `contact_method` only.
Methods are `phone`, `email`, `website`, `buying_source`; a source-page click is
weaker intent than a contact click, and neither proves an inquiry was sent.
Do not add these counts to GA's enhanced-measurement outbound `click` counts.
