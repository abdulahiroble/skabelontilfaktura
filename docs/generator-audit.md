# Generator audit and QA

Date: 2026-10-23

Scope: public `/generator/`, its shared invoice components, validation, and browser persistence. Live-site inspection followed by local implementation and isolated Chromium QA.

## Design verdict

The existing Fraunces/Hanken typography and warm paper palette give the site a recognizable identity. The generator did not need a new brand. Its main problems were a blank preview, excessive nested containers, weak action hierarchy, and a long mobile form with no convenient preview navigation.

## Findings and fixes

| Severity | Finding and impact                                                                                                                                           | Location                         | Resolution                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| High     | Preview remained empty until every required field passed validation, so users received no visual feedback while composing.                                   | Generator page                   | Lightweight reactive HTML draft preview, available even for incomplete drafts. PDF rendering is deferred until export.                      |
| High     | Per-line VAT selectors offered rates that invoice-level calculations ignored. Users could expect the wrong tax amount.                                       | `ItemTable.svelte`               | Removed misleading selectors. Invoice VAT mode remains the explicit source of truth for calculations and exports.                           |
| High     | Party field IDs depended on editable names and collided when seller and buyer names matched or were empty. Labels could target the wrong field (WCAG 1.3.1). | `PartySection.svelte`            | Stable seller/buyer IDs, with native required semantics on names.                                                                           |
| High     | PDF exceptions escaped the download handler without actionable feedback.                                                                                     | Generator page                   | Visible error state, loading-state recovery, duplicate-click guard, and delayed object-URL revocation.                                      |
| High     | Reset immediately destroyed the draft.                                                                                                                       | `InvoiceForm.svelte`             | Inline confirmation and cancel action.                                                                                                      |
| High     | The buyer schema rejected foreign EU VAT numbers despite offering VIES validation.                                                                           | `schema.ts`                      | Buyer accepts supported EU VAT country prefixes; seller retains Danish CVR validation.                                                      |
| Medium   | Clearing the optional delivery date made the whole invoice invalid.                                                                                          | `schema.ts`                      | Empty optional date accepted, with a regression test.                                                                                       |
| Medium   | The toolbar used a 56px sticky offset beneath a 64px header and consumed substantial mobile viewport space.                                                  | Generator page                   | Correct desktop offset; non-sticky, compact mobile toolbar with accessible secondary actions.                                               |
| Medium   | Public mobile navigation disappeared. Tablet navigation could crowd the header.                                                                              | Marketing layout                 | Native keyboard-operable menu below the desktop breakpoint.                                                                                 |
| Medium   | Clearing a numeric field could show `NaN` in live totals.                                                                                                    | Totals and preview               | Safe temporary display values while validation continues to prevent invalid export.                                                         |
| Medium   | Autosave failures were silent and the autosave effect was detached from component lifecycle.                                                                 | `store.svelte.ts`                | Saving/saved/error status, component-owned effects, pending-write cleanup, and page-exit flush.                                             |
| Medium   | Several small controls were difficult to tap, and mobile text fields could trigger iOS zoom.                                                                 | Generator page and item controls | 44px minimum form/button targets, 16px mobile input text, explicit action focus outlines, and reduced-motion handling (WCAG 2.4.7 / 2.5.8). |
| Medium   | Nested cards and oversized gaps made the form unnecessarily long. Low-emphasis section labels were hard to scan.                                             | Invoice components               | Flatter sections, tighter spacing, stronger brand-colored labels, compact settings, and editor/preview switching on smaller screens.        |
| Low      | Validation repeated ambiguous “name required” messages without identifying seller, buyer, or item. Whitespace-only fields passed required checks.            | Validation summary and schema    | Contextual messages, additional field translations, and trimmed required text.                                                              |

## Preserved strengths

- Client-side PDF export without sending free-tier invoice contents to a server.
- Existing brand fonts, warm neutral colors, SEO metadata, and guide links.
- Central VAT calculation engine shared by totals and PDF generation.
- Native labeled form controls.

## Verification

Passed:

- `npm run check`: zero errors and warnings.
- `npm run build`: production build and Wrangler binding-type check.
- Targeted ESLint for all changed source files and invoice components.
- `git diff --check`.
- Existing VAT test suite: 58 assertions.
- New `src/lib/invoice/schema.test.ts`: 12 regression checks.
- Isolated Chromium QA: fresh draft, incomplete preview, disabled invalid export, unique IDs, discounts and VAT, adding/removing lines, last-line protection, draft restoration after hydration, standard/compressed downloads, PDF print popup, foreign VAT, non-registered seller, date ordering, cleared numeric fields, English editor, reset confirmation/cancellation/completion, and visible storage/PDF failures.
- Responsive overflow checks at 320, 375, 768, 1024, and 1440 CSS pixels.
- Mobile preview/editor switching, secondary export actions, and navigation.
- No unlabeled inputs/selects in the generator and no runtime exceptions in the successful browser QA run.

Full `npm run lint` stops at the pre-existing, user-modified `.factory/skills/autumn-sandbox-payment-e2e/SKILL.md` formatting warning. That file was not changed by this work.

## Boundaries and follow-up

- Changes are local, not deployed. Production was inspected but not modified.
- The HTML preview is explicitly labeled as a draft view. The downloaded PDF is the authoritative final layout.
- The existing PDF font supports Danish/Western text, not arbitrary Unicode or emoji. Unsupported characters now produce an actionable error rather than an unhandled failure.
- This was not a legal/tax compliance certification, full WCAG conformance assessment, or screen-reader audit.
- Authenticated cloud storage, paid entitlements, real CVR/VIES service responses, and Safari/Firefox/native print dialogs were not end-to-end tested in this pass. Verify those with approved test accounts before a broader release.
