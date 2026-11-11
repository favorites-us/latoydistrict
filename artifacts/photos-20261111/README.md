# Official-site photo candidates

Run from any directory: node artifacts/photos-20261111/collect.mjs

Only this artifact directory is written. official-sites.json records URL evidence and exclusions. candidates.json records originals, WebP derivatives, robots rules, rejected images and request failures. Up to three pages and six accepted images per store; at most 36 image attempts per store. Requests use a 10-second timeout; robots failures are treated conservatively and checked on redirect destinations and image hosts.

proposed-manifest-entries.json mirrors the existing manifest shape. These are proposals only, with published as the intended future status; nothing is uploaded or published. storage_path is a proposed Blob key, and its metadata/hash describe the local WebP derivative. Review images and improve captions/alt before applying. Reruns overwrite reports; old image files may remain and only candidates.json defines the current run.
