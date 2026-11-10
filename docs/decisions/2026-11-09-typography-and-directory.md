# Typography and directory redesign

The user rejected the overall visual system and asked to reference pickycamper's design philosophy and fonts without copying its style, then deploy the changes.

## Reference and direction

Read pickycamper's `docs/plans/2026-10-15-brand-search-header.md`, `docs/specs/2026-10-13-mvp-design.md`, application styles and pinned font documentation in the sibling campsite-scout project. The applicable principles are search-first hierarchy, restrained brand expression, readable controls, and a distinct purpose for each type treatment. Its green palette, campsite imagery, logo and condensed site-number styling are not adopted.

Toy District uses IBM Plex Sans throughout: 400 body, 500 controls, 600 headings. The existing compressed display face and DM Sans dependencies are removed. Latin and Latin-extended variable files are hosted locally, with the original SIL OFL license and fingerprinted names. Their bytes match the pinned reference assets.

Palette: page #FAFAF9, surface #FFFFFF, ink #24272C, secondary text #62666D, border #DEDFDF, action #28549A. Amber remains reserved for parking and keyboard focus. The shared type scale is 12/14/16/18/20/24px, with page titles at 28–36px. Spacing follows 4/8/12/16/24/32/48px.

```text
Header: identity                         navigation / saved / language
Short directory introduction                      visiting guide
Search
Product / street / information filters
Results and view switch                 saved-trip tools
Supplier name + address                 buying guidance
Categories / provenance / actions
```

Before implementation, rejected merely replacing one decorative headline font with another: removing the competing promotional panel and placeholder imagery is necessary to improve hierarchy. The home introduction now explains what the directory contains. Supplier rows prioritize real names and addresses. Real catalog images remain supported; invented initial/avatar thumbnails do not.

## Implementation

- Removed the large blue district sign, marketing headline and extra pre-heading.
- Consolidated font roles and sizes across the directory, store detail, sources, guides, forms and saved/comparison views.
- Replaced separate floating supplier cards with a grouped list; simplified badges, sidebar and brand mark treatment.
- Made detail fields stack on mobile, retained 44px interactive controls, and moved the navigation breakpoint to 1024px to accommodate readable text.
- Preserved supplier data, source caveats, parking references, filtering, saved lists and private photo/inquiry handling.

## Validation and limitations

Existing data and web tests: 29 passed. No new appearance-mirroring tests were added. Production build/type checking and generated-page checks are used for validation. The browser access host remains unavailable, and native Chrome access returned “Computer Use was not approved”; no alternate automation was used to bypass it. Therefore visual screenshots and interactive responsive QA are not claimed.

The pre-existing HANDOFF.md modification is preserved and excluded from the design commit. The user explicitly authorized production deployment.
