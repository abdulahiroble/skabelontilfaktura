# Fakturapakken release verification

## Final outcome, 24 October 2026

**Deployed and enabled:** the 99 DKK VAT-inclusive, one-time Fakturapakken pilot is live at `https://skabelontilfaktura.dk/pris/`. The free generator and downloads remain free. No live charge was made.

Final active Worker version: `6c785b91-e7da-47e1-aee1-f06a40054c37`, 100% traffic, after removing the temporary operator bindings. Public availability is true with no-store headers. The actual purchase button is enabled; anonymous purchase redirects to `/login/?next=%2Fpris%2F`.

All 81 billing/reconciliation/preflight/deployment-policy tests pass, as do package/document tests, typecheck (zero errors/warnings), ESLint and whitespace checks. The production build passed. Final public-asset scan: 187 files, zero private archive matches.

## Scope and approval

Owner approved:

- A simpler free utility plus one-time downloadable product.
- A measured **99 DKK including VAT** pilot, not a validated willingness-to-pay claim.
- Deployment, preserving accounts and data; cloud retirement only after checking use.
- An isolated, reversible Stripe/Autumn sandbox purchase and scoped cleanup.
- Use of the Factory Desktop browser pane, including creation of a new test-only account.
- Seller: Ace Solutions, CVR 46295218, Avedøreholmen 96C, 2650 Hvidovre; contact `kontakt@skabelontilfaktura.dk`.

No live charge is authorized or required by this run.

The owner subsequently explicitly approved one unpaid live Checkout preflight: one synthetic customer and session, no card details, charge or email, followed by exact session expiry and test-record cleanup.

## Preserved existing work and records

Pre-existing modifications to `.factory/skills/autumn-sandbox-payment-e2e/SKILL.md`, `.playwright-mcp/` and existing screenshots are not reverted or formatted.

Read-only production audit found three accounts, one business profile, zero invoices and zero live provider subscriptions/purchases. Accounts and business profile are preserved. The original shared sandbox's seven customers and one subscription are not part of the disposable test.

Cloud retirement means closing new recurring checkout and removing cloud-product promotion. It does not mean destructive removal of database tables, accounts, provider product IDs or R2 objects.

## Product and application checks

Verified locally:

- Private eight-file ZIP passes archive and SHA-256 checks.
- Workbook has five sheets; formula engine recalculates VAT, no-VAT, quote and credit-note examples correctly.
- Rounding check covers a one-øre line.
- The previously broken free Excel download now opens with its labels and formulas.
- Existing PDF and CVR/VIES regression scripts pass.
- Svelte/TypeScript check passes with zero diagnostics.
- Full ESLint passes after the backend error-cause fix.
- Task-owned files pass formatting checks.
- Global `npm run lint` remains blocked by formatting warnings in pre-existing `.factory/skills/autumn-sandbox-payment-e2e/SKILL.md` and `design-qa.md`. These were not changed merely to silence the checker.
- Final production-candidate build passes, including the availability endpoint and expiry-margin fix.
- Final Svelte/TypeScript check reports zero errors/warnings; full ESLint, all 46 billing regressions and the document/package regression script pass.
- Final public build scan checked 187 files with zero paid ZIP/base64 matches.
- Closed-default purchase-availability endpoint tests pass; it sends no-store and noindex headers.

Browser checks performed against the local app:

- Pricing at desktop 1440 px and mobile 390 px: no horizontal overflow, one purchase CTA, no old subscription-price copy, no page errors.
- Anonymous purchase preserved `/pris/` through login (before the explicit closed-default UI gate was added).
- Actual free PDF download succeeded, no cloud-save button appeared, and the relevant toolkit offer appeared afterward.
- Google Analytics made no loading request before consent. Acceptance caused the expected script request; test blocked it rather than sending test activity to Google.
- Resetting cookie consent preserved unrelated local browser data.

These checks do **not** establish paid delivery.

## Billing configuration verified through the approved pane

Live:

- Correct Faktura Stripe account selected through Autumn's own dashboard link.
- New approved SKU mapped to an active, non-recurring Stripe price.
- Independent API readback verified **9900 minor units in DKK**.
- Created and inspected an active **25% inclusive VAT** rate for Denmark.
- No live customer, checkout or charge was created to force price provisioning.
- Live checkout activation was held until sandbox and unpaid live verification passed.

Isolated:

- Created a named Autumn sandbox and a fresh Stripe **test-only** account.
- Existing business profiles from other projects were not reused.
- A restricted temporary key was stored in macOS Keychain, not in source or logs.
- Named sandbox currency is DKK; its own active 25% inclusive Danish VAT rate was created and read back.
- Separate Worker, database, role, synthetic application user and automatic webhook were prepared.
- Anonymous protected download returned 401.
- Checkout with missing VAT configuration returned 503 rather than charging.
- Signed receiver diagnostics returned 200 with no ownership grants. A diagnostic is not an automatic provider webhook.

## Payment verification chronology

The first genuine isolated checkout attempt failed before payment. Subsequent status showed:

- Zero provider kit invoices.
- Zero paid purchases and zero webhook events.
- No automatic paid fulfillment observed.

Stripe Workbench subsequently established the cause: its `POST /v1/checkout/sessions` request at 21:18:59 UTC returned HTTP 400 (`invalid_request_error`) because the fresh test account lacked an account or business name. The response was an error, not a Checkout Session. This is provider evidence of rejection, not an inference from the absence of invoices.

The disposable test account has since been named through Stripe's public settings form. The saved name appears in its account switcher and the Save button is disabled again. No identity from an unrelated project was reused.

Separately, checkout expiry now has a five-minute margin over Stripe's 30-minute minimum (35-minute session, 36-minute local lease). The billing specialist reports 46 regression tests, Svelte/TypeScript check, ESLint and build passing for that fix. The isolated Worker was refreshed; production was not deployed or enabled.

Do not mark the paid pilot verified, launch-ready or enabled on the basis of signed diagnostics, redirects or manually written entitlements.

The single permitted retry succeeded after naming the test account. Actual Stripe-hosted sandbox Checkout displayed 99.00 DKK total with 19.80 DKK inclusive VAT. Payment used only Stripe's published test card and synthetic details. Subsequent isolated status showed one canonical kit invoice, one paid purchase, two webhook events, zero cloud subscriptions and `automaticFulfillmentObserved: true`. No manual ownership write or replay was used.

The browser had no helper-created application session, so the successful payment returned to the app's login page rather than an already authenticated account. A redirect wait timed out; canonical payment and automatic ownership checks independently established success, and payment was not resubmitted.

Final release gates, subsequently completed below:

1. Production live-key/webhook pairing, deployment and signed unknown-event readback.
2. The approved single unpaid live preflight and exact cleanup.
3. Public availability, pricing and free-tool smoke checks after activation.

Checkout stayed closed through these proof gates. It was enabled only after the live readbacks and exact cleanup below.

### Completed delivery, refund and cleanup gates

- Authenticated ZIP download returned the real 52,807-byte archive with SHA-256 `44167e735780ac3fb15d6a551c0baabc7bdd4d004ee6c2efa5152fdc847bc576`.
- Fresh sign-in and purchase recovery returned the same ZIP; canonical invoices remained one.
- The exact test invoice was fully refunded 99 DKK. No second purchase was made.
- Autumn did not emit an outgoing refund update in the observed flow. A five-minute production reconciliation schedule was added, with bounded batches, concurrency, expiring leases, token fencing, fair retry ordering and monotonic refund state.
- A real Cloudflare scheduled run in the isolated environment revoked the already-refunded purchase at 22:38:27 UTC, before any protected download request. The following tick processed zero rows. The next authenticated download returned 403. No manual scheduler invocation, replay or ownership write supplied this proof.
- The scheduler change passed 57 regression tests. The subsequent operator-only live-preflight gate brings the verified total to 77; ESLint, typecheck and build pass.
- Production migration `0003` was applied before deployment. The index is valid, all six queue columns exist and application-role SELECT/INSERT/UPDATE/DELETE grants were verified. Counts remain three users, one business and zero financial records.
- Exact task Worker, database, role, PgBouncer entry/backup, webhook and Autumn customer were removed and absence verified. Original shared sandbox remains seven customers / one subscription.
- Parent independently opened the saved Stripe customer ID and observed “This customer account has been permanently deleted”, a successful DELETE log and the fully refunded test payment.
- Parent revoked the task-named Autumn API key, deleted only `faktura-kit-uat-20261023`, and confirmed the environment menu retained only Production and the original Sandbox.
- Parent deleted only the fresh Stripe sandbox named “Faktura kit UAT 20261023”. Stripe returned to the sandbox list showing zero account sandboxes used. No live account was deleted.
- The temporary test credential was removed from Keychain. The specialist removed its own task bundle, checkout capability and downloaded test ZIP.

### Production deployment, sales closed

- Deployed production version `a5c5bbb1-8de4-44a9-ae45-b4b014717373`, including the five-minute reconciliation schedule, with `KIT_CHECKOUT_ENABLED=false`.
- Live homepage and legal page return 200 and display the approved offer/seller.
- The actual pricing UI displays a disabled “Salget åbner snart” button; availability returns `{"available":false}`.
- Anonymous protected ZIP returns 401.
- Public Word, Excel and PDF downloads return 200, correct MIME types and bytes matching the release's static assets.
- Live credential-pair staging initially returned the helper's generic failure. No activation was attempted after that result; the specialist is establishing whether staging occurred before any retry.

### Final live verification and activation

- The staging failure was caused by CLI output suppression and oldest-first version ordering, not a billing request. Version inventory established no version had been staged by that failed command. The helper was corrected and the live pair was subsequently staged and activated atomically.
- The exact live endpoint's correctly signed unknown event returned 200, an invalid signature returned 401, and database counts did not change. The new matching endpoint was enabled; only captured same-URL predecessor endpoints were paused.
- Prepared one owner-approved synthetic live identity. Stripe's own read-only Workbench retrieved the exact customer with `livemode:true` and no default payment method or customer balance.
- Complete customer-scoped pagination showed zero Checkout sessions, invoices, payment intents, charges, subscriptions (all statuses), payment methods and balance transactions before the preflight.
- The deployed application's private operator gate created exactly one live, one-off Checkout session. Actual Checkout identified **Ace Solutions**, product **Fakturapakken**, total **99 DKK**, including **19.80 DKK VAT**. No card, bank, phone or Link details were entered.
- Independent Stripe readbacks established exactly one open/unpaid live session with the expected customer, amount, currency and attempt identity. All other financial collections remained empty.
- Stripe's browser console refused the exact expiration command because it is read-only in live mode. The owner approved a temporary Checkout-only key; only that permission was selected. Stripe requested account-owner verification before issuing it. The request was cancelled instead, and the key list confirmed **No restricted keys**. No verification email was requested and no key was issued.
- Stripe subsequently reported the session **expired/unpaid** naturally. Complete scoped readbacks again showed zero invoices, payment intents, charges, subscriptions, payment methods and balance transactions. Recovery was not enabled.
- Closed the operator gate, removed the exact Autumn customer, independently retrieved Stripe's exact `deleted:true` customer tombstone, then removed the exact app fixture. The private Checkout capability was removed.
- Enabled public checkout only after these gates passed. Removed all four temporary `KIT_PREFLIGHT_*` Worker bindings and the task's live-preflight Keychain bundle. Durable live billing and scheduled-reconciliation credentials remain installed.
- Final public checks: availability true/no-store; enabled “Køb og download · 99 kr.” button; anonymous purchase preserves pricing intent through login; anonymous paid download denied with 401. Free Word, Excel and PDF assets match the release.

## Verification limits

- The sandbox purchase proves payment-to-file delivery, fresh sign-in/recovery and automatic refund revocation. The live run proves deployed live Checkout wiring, seller/price/VAT and no-charge cleanup, not a real live payment or a production paid invoice/email.
- Password-reset email delivery to an actual inbox was not tested. No transactional-email delivery claim is made here.
- The 99 DKK price remains a measured pilot, not proven willingness to pay.

## SEO deliverable

See `docs/monetisation-and-seo-plan-2026-10-23.md` for the KWRDS estimates, research-quality caveats, Search Console baseline, canonical page map, indexation evidence and 14/30/60/90-day priorities.
