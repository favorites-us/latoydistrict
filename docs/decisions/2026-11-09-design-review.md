# November 9 design review and local integration

Reviewed the October 30 buyer redesign decision, existing HANDOFF.md, and GitHub commits `8d8b859` and `f2ead21`. GitHub compare confirms these are the only two commits between local HEAD `942a35c` and `f2ead21` (ahead 2, behind 0).

All nine changed files were retrieved at `f2ead21` using the GitHub connector and applied locally. This brings in the flat cobalt/amber design tokens, compact directory hero, known-facts store layout, grouped source disclosure, catalog facts, claim banner, seven parking facilities, nearby parking, bilingual visiting guide and review corrections. No merchant facts or historical parking rates were re-researched or relabeled as current.

Additional review fixes:

- Parking links have lot-specific accessible names and 44px minimum height.
- Mobile parking rows put the price and rate link below the address rather than compressing the address between an icon and a fixed price column.
- Map parking markers retain small visible symbols inside 44px interactive targets. The installed MapLibre implementation supplies keyboard interaction and button semantics for markers with popups.
- Map popups show the same reference price as the list, with the source check date and a localized warning that Saturday reservation reference prices change.
- Shared price formatting omits invalid rates; invalid coordinates do not produce misleading nearby parking results.

Validation completed:

- Root data tests: 16 passed.
- Web tests: 13 passed, including three new parking regressions (distance ordering when walking minutes tie, invalid locations/rates, lot-specific URLs, bilingual guide/data consistency).
- Production build, type checking and generation of 599 pages passed after all code changes.
- Six generated EN/ES pages checked: visiting guides have seven labeled parking links; two representative store pages in each language have two nearby lots, facts/product sections and source disclosures. Checked dates are present and no NaN/Infinity values appear.
- `git diff --check` passed.

Publication follow-up:

- The execution environment's filesystem/network restrictions were removed after the initial review. Existing GitHub CLI and Vercel CLI logins work; no credential or permission configuration was changed.
- Git fetched the two upstream commits and the local branch fast-forwarded to `f2ead21`. All working files were backed up before the fast-forward and restored afterward. This commit contains only the review delta on top of the original upstream history.
- The pre-existing uncommitted HANDOFF.md remains preserved and is excluded from this publication commit.
- The production server now starts on port 3100. HTTP checks passed for EN/ES home, visiting guides and representative store pages; guides contain seven parking rows and store pages contain two.
- Browser automation still reports an unavailable access host. Visual screenshots and interactive map QA remain unverified; successful HTTP checks are not visual QA.
- The user explicitly authorized commit, push and production deployment. Deployment outcome will be verified and reported separately.
