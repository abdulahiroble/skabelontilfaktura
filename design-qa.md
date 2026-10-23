# Homepage and generator redesign QA

final result: passed

## Visual target and evidence

Selected target: option 3, `/Users/abdulahiroble/.codex/generated_images/01a16882-5876-7973-8144-a7c3be4d9d5d/exec-4835a967-be3d-4476-8ceb-679c6fa47ab2.png`.

Evidence directory: `/Users/abdulahiroble/.codex/visualizations/2026/10/23/01a16882-5876-7973-8144-a7c3be4d9d5d/`.

- `homepage-desktop.png`, `generator-desktop.png`: 1440 × 1024 CSS/pixels, 1× density.
- `homepage-mobile.png`, `generator-mobile.png`, `generator-mobile-preview.png`: 390 × 844 CSS/pixels, 1× density.
- `homepage-comparison.png`, `generator-comparison.png`: source and implementation combined for composition review.
- `document-detail-comparison.png`: readable focused source/implementation document comparison.

Source is a 1054 × 1494 concept board containing two differently sized page crops, not two literal 1440 × 1024 screenshots. Comparison crops remove the board margins and scale proportionally to equal widths without stretching. Therefore compare composition and content rather than asserting pixel identity. Desktop invoice uses fictional populated test data, standard VAT, DKK, Danish, and one line (4 × 750). Source's editor contains an inconsistent second line and total; implementation correctly computes the actual lines. Mobile has no supplied reference and was checked for responsive usability.

## Findings and iteration history

1. Initial desktop editor had excessive vertical density from the original visible labels, redundant document heading, and duplicate marketing navigation. Fixed: desktop compact fields retain accessible labels, optional contact details use disclosure controls, invoice heading sits with metadata, and the guest generator uses a single action header. Signed-in users retain account navigation. Subsequent desktop captures show document and settings side by side, with totals visible at 1440 × 1024.
2. Initial homepage spacing pushed the benefit strip below the intended composition. Reduced hero and sample-document spacing. Final homepage capture shows the hero, invoice and beginning of the benefit strip; the rest follows naturally on scroll.
3. Initial total component retained a boxed card style. Removed its local background, border and padding in the document context. Post-fix document comparison shows plain aligned totals and rules.
4. Development console reported existing unbound object-mutation warnings during editing. Declared editable child data props bindable and bound party data explicitly. Type checking passes without warnings; no runtime errors were reported in browser checks.

No remaining blocking P0/P1/P2 findings for the requested production adaptation.

## Required fidelity surfaces

- Typography: existing Hanken Grotesk supplies a close clean sans match, scoped to these pages; heavy tight homepage headline and spaced invoice title. Mobile headline wraps deliberately. Accessible field labels remain available when visually hidden on desktop.
- Layout: centered homepage CTA and paper example; gray document workspace and right inspector; responsive stacked editor and separate live preview. Extra controls and taller settings preserve existing features rather than reproducing the concept's omissions.
- Colors: white/neutral gray, black text and orange accent. Dark text on orange actions intentionally improves contrast versus the concept's white text. Focus borders remain visible.
- Assets: the invoice is actual text/table/form UI. Existing icon library provides file/search/download/pencil icons; no fabricated artwork or rasterized form controls. Standard icons replace decorative handwritten arrows.
- Copy: Danish hero matches the selected direction. Existing guides, downloads, FAQ, SEO metadata and structured data retained. Generator retains its English language mode. Sample explicitly labeled as an example.

## Functional checks

Verified in the in-app browser:

- Homepage primary CTA opens the generator.
- Invoice fields update totals; 4 × 750 gives 3,000 subtotal, 750 VAT, 3,750 total.
- Add/remove line; 10% discount gives 2,700 subtotal.
- EUR and non-VAT mode update displayed currency and total.
- Danish/English switching and modern/minimalist preview switching.
- Draft survives reload with entered business details.
- Standard PDF and compressed PDF download; pdf-lib parsed both as valid one-page files (3,004 and 1,947 bytes in the tested state).
- Print action opens a PDF blob in a new tab.
- Reset confirmation can be cancelled without losing the draft.
- Mobile editor and preview render without horizontal overflow; mobile homepage width equals viewport (390px).
- Browser error log: no errors.

Static validation: `npm run check` (zero errors/warnings), `npm run build` (including Cloudflare types), ESLint for changed Svelte files, and `git diff --check` passed.

## Preserved features and test limits

Original store, invoice validation, VAT calculations, PDF renderer and entitlement logic are preserved. CVR/VIES handlers and lookup state were hardened in the release follow-up below. Existing CVR/VIES lookup controls, all VAT modes, currencies, language, item discounts, logo upload/removal, all payment fields, saved clients, business-profile prefill, cloud saving and reset remain wired to their original behavior.

CVR/VIES network responses were verified in the release follow-up below. Logo file upload and signed-in cloud persistence were not exercised end to end. Signed-in navigation and cloud controls were inspected in code. A physical printer was not exercised.

## Follow-up polish

The concept's handwritten annotations are represented by readable text and existing icons. Existing lower homepage content remains available below the new hero. Account-only workflows remain an authenticated UAT limitation.


## Release follow-up — 2026-10-23

- Fixed VIES outages/malformed responses being interpreted as invalid VAT numbers; unavailable checks now retain manual-entry fallback. Increased the upstream timeout to 25 seconds.
- Reject unsupported countries and malformed request bodies, including JSON null. Removed GB from VIES countries while retaining XI.
- CVR upstream failures now return an availability error, distinct from a genuine missing company; fallback and returned company identity are checked.
- Editing an identifier clears old feedback, and delayed lookup responses cannot overwrite a newer identifier.
- `node scripts/test-lookups.mjs` passed provider success, invalid, unavailable, malformed, fallback and identity-mismatch checks. Svelte check (zero errors/warnings), build, changed-file ESLint and diff whitespace checks passed.
- Browser end-to-end: CVR autofill, valid EU VAT, invalid EU VAT and feedback reset verified. API malformed-input responses verified.
- Deployed with `wrangler deploy --keep-vars`; version `379547c5-1815-42e6-a90d-1c1724012448`. Previous rollback version: `ff17226c-f7fe-4e73-83b4-0fdb02733859`.
- Production homepage and generator rendering verified, homepage CTA verified, production CVR autofill verified, production CVR and VIES endpoints both returned HTTP 200 with expected registered company data. Production browser console had no errors.
- Production screenshots saved in the task visualization directory as `production-homepage.png` and `production-generator.png`.

## Site-wide design and PDF export follow-up — 2026-10-23

final result: passed

### Findings and fixes

- P1: new design tokens were limited to two routes. Moved the white/neutral/orange palette and Hanken heading typography into the root theme, covering marketing, articles, login, consent and account routes. Removed the obsolete Fraunces font download.
- P1: login was an unstyled narrow form in the old palette. Added a responsive white document panel, larger inputs, consistent CTA and guest-generator link; login/signup behavior remains intact.
- P1: PDF renderer used a separate compact layout and blue fallback. Updated the shared client/server renderer to the reference's spaced title, metadata columns, four-column gray table, separate totals labels/values and monochrome default. Preserved modern branding, logos, document types, VAT modes and compression.
- P1: four existing JSON-LD strings omitted the closing tag bracket, causing blank initial loads. Fixed templates index, invoice requirements, Google Docs and PDF guides. All 24 public routes now return parseable content with headings.
- P2: preview lacked unit prices. Added the fourth column and metadata alignment; neutral paper and title treatments now follow the export.
- P2: long words and descriptions could exceed columns/pages. Added wrapping and page continuation for individual long items, plus paginated notes.

### Visual evidence and scope

Compared the user's attached invoice reference with `pdf-design-comparison.png` in the task visualization directory. Cropped out surrounding website controls and normalized both paper regions to 600px wide. Same sample line items and amounts; the test uses a valid seller CVR instead of the mock number. Export omits editing outlines/icons, and adds payment details below the reference's crop. The initial comparison's overly wide metadata column was narrowed and the header-to-buyer spacing reduced before the final comparison. Typography, neutral colors, layout and table/totals alignment reviewed; no image assets are needed for the text-based invoice.

Login reviewed at 1280px and 390px widths; signup toggle, guest navigation and generator download exercised. Pricing and the repaired invoice-requirements article inspected in browser. Generated PDFs visually inspected for default, English proforma/modern, multi-page rows and the actual browser-downloaded result. Minor font metric differences between Hanken UI and standard PDF Helvetica remain; they do not change the document hierarchy.

### Validation

- Svelte check: zero errors/warnings.
- Build including Cloudflare type check: passed.
- Changed-file ESLint: passed.
- `node scripts/test-pdf.mjs`: standard/compressed, pagination, English/EUR, modern, proforma, credit note, all VAT modes and invalid-CVR rejection passed.
- Actual browser Download PDF produced a readable A4 export with the new layout and correct totals.
- Anonymous public-page coverage: 24 routes. Account route theme inheritance inspected in code; authenticated workflows were not exercised and are not claimed verified.

Deployment: Cloudflare version `23f12be0-182d-44fc-a6b3-3c672b7b4c55`, using `--keep-vars`. Live login and repaired article visually verified; no browser console errors. Screenshot: `unified-login-live.png` in the task visualization directory.
