# Photo and inquiry storage operations

The owner authorized a limited official-site photo reuse trial on 2026-10-30 with an opt-out mechanism. This is not a copyright license. Review sources and actual bytes; record source URL, date, sha256 and unconfirmed rights in `web/data/photos.json`. Reject obvious stock watermarks, Google/Street View images and sources that prohibit copying without permission.

## Current backend

Production uses the dedicated **private** Vercel Blob store `toydistrict-private` (`store_9BRH8s14He6YrKB3`, iad1), connected only to this project's production environment. The existing Supabase hostname no longer resolved during production testing. Its credentials and any historical data were left untouched; no migration of historical inquiries was possible or claimed. `supabase/schema.sql` is historical, not the new runtime schema.

Vercel supplies `BLOB_STORE_ID` and short-lived deployment identity credentials. No storage credential or direct storage URL is sent to a browser. All SDK reads use `access: private` and `useCache: false`, which bypasses the CDN for consistent reads. See [private storage](https://vercel.com/docs/vercel-blob/private-storage) and [consistent reads](https://vercel.com/changelog/vercel-blob-now-supports-consistent-reads-on-private-storage).

No new subscription or plan upgrade was selected. Storage and requests follow the existing team's [Vercel usage pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing); do not describe these resources as unconditionally free. This release uploads two small images (under 300 KB combined). Monitor usage in Vercel as traffic grows.

Paths in the private store:

| Prefix | Contents | Retention / handling |
|---|---|---|
| Manifest `storage_path` | Reviewed photo bytes | Remove on complaint |
| `photo-blocks/<photo-id>.json` | Anonymous permanent suppression | **Keep permanently** while any deployment can serve the ID |
| `photo-requests/<uuid>.json` | Requester name, optional contact, reason | Private inbox; review and remove personal data when no longer needed for handling/follow-up |
| `photo-audits/<uuid>.json` | Anonymous deletion and request-save outcomes | Operational audit |
| `inquiries/YYYY-MM/<uuid>.json` | New directory inquiries, including contact details | Private inbox; review and remove when no longer needed |
| `diagnostics/<uuid>.json` | Temporary storage checks | Normally removed by check; safe to delete leftovers |

No automatic email notification, inbox watcher, or retention job was added. Operators must review the private store regularly and handle data retention manually. Never publish private inquiry files or copy their contents into public issues or logs. There is no customer-facing read API for either inbox.

Use Vercel's project Storage tab or CLI (`vercel blob list`, `vercel blob get`) with the existing project authentication to review records. Do not expose storage tokens to perform these tasks. The public fallback email is `hello@toydistrictlosangeles.com`; mailbox delivery/staffing remains an operator responsibility and was not tested.

## Publish and remove

The bounded `/api/admin/photos` endpoint requires `PHOTO_ADMIN_TOKEN`, stored as a production Vercel Secret. Local CLI reads ignored mode-600 `web/.env.photos-admin.local`. Never print or commit it. This token can only check the private backend and publish/remove manifest-allowlisted photos; it cannot read inquiries or execute arbitrary storage operations.

Run from `web/`:

```sh
npm run photos -- check american-silk-catalog-1
npm run photos -- publish american-silk-catalog-1 ../artifacts/redesign-20261030/photo-preview/silk-catalog-1.jpg
npm run photos -- remove american-silk-catalog-1 "Rights-holder requested removal"
```

`check` writes a uniquely named diagnostic file, verifies both its initial and overwritten contents through uncached reads, removes it and verifies absence. It does not submit a real inquiry or ownership claim, and does not suppress a photo. Do not publish until it passes. `publish` accepts only the exact sha256-reviewed bytes, limits size to 2 MB and refuses to overwrite or republish a suppressed photo. The manifest must be deployed before publishing a new ID.

Images remain outside Git and `public/`. `/api/store-photos/<id>` checks permanent suppression before and after reading bytes, sends no-store/noimageindex headers, and returns 410 for suppressed IDs. There is no image optimizer copy, public URL, or hotlink fallback. Old Supabase-based deployments cannot read the new store. All Blob-based deployments share its suppression paths.

A removal first persists an anonymous block, then attempts private request storage, byte deletion and anonymous audit. It still hides the photo if request/audit storage or byte deletion fails. If blocking cannot be persisted, the form reports failure. If suppression cannot be read, image serving fails closed with 503.

**Do not delete `photo-blocks/` when clearing the request inbox.** A block's existence alone prevents serving; editing notes, handling a request or deleting its private data does not unblock anything. No unblock endpoint exists. A repeated public report returns success without adding further inbox records. Admin `remove` can be repeated to retry physical deletion; confirm `bytes_removed: true` in its result or audit. If an audit is absent, confirm deletion through an authenticated storage inspection.

Already downloaded copies and images still rendered in another browser cannot be recalled. Source metadata may remain after removal. A removal option does not grant copyright permission or automatically provide statutory DMCA safe harbor. Restore nothing automatically after a dispute; reassess rights before any future publication.

Public forms use bounded payloads, validation and a honeypot, but these are not distributed rate limits. The opt-out form deliberately prioritizes removal and can be abused to hide a photo. Review unusual request volume and configure Vercel Firewall rate limits before promoting the service at scale; no rate-limit rule or paid add-on was activated in this release. Do not automatically restore a disputed image based only on a suspicion of abuse.
