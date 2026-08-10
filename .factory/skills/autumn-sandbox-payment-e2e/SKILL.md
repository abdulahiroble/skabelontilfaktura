---
name: autumn-sandbox-payment-e2e
description: Run a real, reversible Autumn and Stripe sandbox purchase against a deployed web app, verify webhook-driven entitlements and every advertised paid workflow, then clean up all test data and restore production billing configuration. Use before connecting live Stripe, after changing Autumn plans or checkout code, or when proving paid features work end to end.
user-invocable: true
version: 1.0.0
metadata:
  owner: abdulahiroble
  derived-from: skabelontilfaktura.dk launch verification
---

# Autumn Sandbox Payment End-to-End Verification

## Purpose

Prove that a deployed application's paid experience works as a real customer
experiences it:

1. A disposable user signs up.
2. Autumn creates a Stripe sandbox checkout.
3. Stripe accepts a real test payment.
4. Autumn activates the expected plan.
5. Svix delivers the billing webhook.
6. The application persists local entitlements.
7. Every advertised paid workflow works against real deployed bindings.
8. All throwaway data is removed.
9. Production billing configuration is restored before the run ends.

This is not a unit-test checklist. Use a real browser, the deployed app, the
real Autumn sandbox, Stripe test mode, the deployed database, and any deployed
object storage or email provider required by the advertised features.

## Non-negotiable completion rule

Do not report paid billing as **verified**, **working**, **launch-ready**, or
**safe to connect to live Stripe** unless all of these gates pass:

- Stripe-hosted sandbox checkout completes.
- Autumn shows the expected active plan.
- An automatic signed webhook reaches the application.
- Local entitlement state updates without manual database changes or manual
  webhook replay.
- A newly entitled session can use every currently advertised paid feature.
- Cancellation/deletion and application-data cleanup are complete.
- The production/live billing key is restored if it was temporarily replaced.

If a manually signed webhook works but automatic Autumn/Svix delivery does not,
report:

> Checkout and the webhook receiver are partially verified. Automatic
> entitlement activation is a release blocker.

Never hide this distinction.

## Safety model

### Prefer isolation

Use this order of preference:

1. Temporary Worker/service, temporary database, temporary object bucket, and
   sandbox-only webhook endpoint.
2. Existing staging deployment with isolated bindings.
3. A short, controlled sandbox-key window on production only when the first two
   are impossible and the user has explicitly authorized the test.

When using production runtime bindings:

- Use a globally unique disposable identity.
- Use provider simulator addresses for email.
- Record exact user, tenant/business, customer, invoice, and object IDs.
- Never inspect, alter, or delete unrelated customer data.
- Restore the live Autumn key immediately after paid workflow testing.
- Prove cleanup with exact counts and exact object keys.

### Secrets

- Never print or commit Autumn, Stripe, Svix, database, email, or Cloudflare
  credentials.
- Load secrets from the project's existing secret store or environment.
- Identify environments by prefix only:
  - `am_sk_test_` means Autumn sandbox.
  - `am_sk_live_` means Autumn production.
- Do not infer a secret from redacted output.
- If a live key has appeared in chat, logs, or source control, recommend
  rotation after the rollout.

### Consequential actions

Treat these as explicit, high-impact actions:

- Replacing a production Worker secret.
- Completing a Stripe checkout.
- Sending an email, even to a simulator.
- Canceling a subscription.
- Deleting an Autumn/Stripe customer.
- Deleting production database or object-storage rows.
- Pushing commits or changing live configuration.

Get authorization when it is not already present, scope every action to the
disposable test identity, and restore state before finishing.

## Inputs to discover

Do not assume names from a previous project. Inspect the current repository and
deployed environment to find:

- Public application URL.
- Signup/login flow and authentication library.
- Autumn SDK version and checkout route.
- Checkout request shape and allowed plan IDs.
- Success/cancel redirect URLs.
- Sandbox and live Autumn secret locations.
- Autumn webhook route and Svix signing secret.
- Local entitlement source of truth.
- User, tenant, subscription, and paid-feature tables.
- Object-storage bucket and key format.
- Email provider and simulator/test recipient support.
- Paid routes and every claim currently shown on pricing/account pages.
- Deployment provider and runtime-log command.

Create the test matrix from the product's current public claims, not from old
documentation or planned features.

## Phase 1: Preflight and evidence baseline

1. Read repository instructions and inspect `git status`.
2. Preserve all pre-existing modified and untracked files.
3. Identify the exact deployed commit/version.
4. Read the pricing page, account page, and paid navigation.
5. Produce a matrix with one row per advertised paid feature.
6. Inspect the checkout, webhook, entitlement, cleanup, storage, and email code.
7. Confirm whether sandbox and live Autumn webhook applications are configured
   separately. They usually are.
8. Record the current production billing-key state without exposing the key.
9. Start runtime logs or live tail when available.

Stop before payment if:

- The checkout route allows unintended products.
- The sandbox key lacks `billing:write`.
- The selected plan is missing from the sandbox catalog.
- The displayed price/currency differs from Autumn's sandbox plan.
- The webhook secret cannot be identified safely.
- Cleanup paths are unknown.

## Phase 2: Create disposable application state

1. Generate a unique identity, for example:

   ```text
   sandbox-e2e-<timestamp>@example.test
   ```

   Use a real controlled inbox only if the signup flow requires email
   verification. Otherwise use a reserved or provider-supported test domain.

2. Sign up through the deployed UI or the same-origin browser API used by the
   UI. Raw command-line requests may be blocked by bot protection and do not
   prove browser behavior.
3. Confirm:
   - Session cookie exists.
   - Disposable user row exists.
   - Required tenant/business/profile row can be created.
4. Exercise real validation. If intentionally invalid input is rejected,
   record that as evidence rather than bypassing it.
5. Save exact test IDs for cleanup.

## Phase 3: Open the sandbox billing window

Skip this phase on a dedicated staging deployment that already uses the Autumn
sandbox key.

When temporarily testing through a production deployment:

1. Confirm the candidate key begins with `am_sk_test_`.
2. Confirm the preserved production key begins with `am_sk_live_`.
3. Upload the sandbox key without echoing it.
4. Record the secret-only deployment/version.
5. Keep the window as short as possible.
6. Do not invite or allow real customers to purchase during this window.

Never end the session while the production application still uses the sandbox
key.

## Phase 4: Complete a real Stripe sandbox purchase

Use Playwright or equivalent browser automation.

1. Start checkout through the real paid button or the same-origin checkout
   request used by the UI.
2. Assert:
   - HTTP success.
   - Returned URL is Stripe-hosted.
   - Checkout session begins with `cs_test_`.
   - Product and amount match the selected Autumn plan.
3. Complete Stripe test checkout with:

   ```text
   Card:   4242 4242 4242 4242
   Expiry: any valid future date
   CVC:    any valid three digits
   ```

4. Use a clearly disposable cardholder name.
5. Assert redirect to the expected application success URL.
6. Record the Autumn external customer ID and plan ID. Do not print tokens,
   cookies, or payment secrets.

Do not treat the redirect alone as proof of entitlement activation.

## Phase 5: Verify Autumn, webhook, and local entitlements separately

These are three distinct gates.

### Gate A: Autumn subscription

Read the customer from Autumn using the sandbox key and assert:

- Expected customer ID.
- Expected plan ID.
- `status = active`.
- Correct recurring interval or one-off purchase type.
- Expected feature flags/balances.

### Gate B: Automatic Svix delivery

Wait a bounded interval, normally 30-60 seconds, while monitoring:

- Worker/application request logs.
- Autumn/Svix delivery history when dashboard access is available.
- Webhook response status.

Assert that the automatic event:

- Reached the configured endpoint.
- Used the expected sandbox signing secret.
- Passed signature verification.
- Used the event type expected by the receiver, normally
  `data.object = "billing.updated"`.
- Returned `2xx`.

Sandbox and live Autumn organizations have separate Svix applications. Verify
the endpoint in the same environment as the key used for checkout.

### Gate C: Local entitlement persistence

Without replaying or modifying anything manually, assert:

- Local subscription/entitlement row exists.
- Plan and status are correct.
- Authenticated account UI shows the paid plan.
- Paid navigation becomes available.
- A server-enforced paid route allows access.

If Gate A passes but Gates B or C fail:

1. Capture the failure.
2. Test the receiver with one correctly signed, disposable event to isolate
   signature/parsing/database behavior.
3. Label manual replay evidence separately.
4. Keep automatic delivery marked failed.
5. Do not recommend connecting live Stripe.

## Phase 6: Exercise every advertised paid feature

Build assertions from the public pricing/account copy. Typical categories:

### Customer/client database

- Perform a real lookup/autofill if advertised.
- Save a disposable client.
- Confirm it appears in the client list.
- Select it in the generator.
- Confirm buyer name, registration number, address, and email populate.

### Cloud invoice storage and history

- Save at least two cloud invoices.
- Confirm both appear in history.
- Fetch a stored PDF through the application.
- Assert `200`, `application/pdf`, `%PDF` magic bytes, and non-zero size.

### Atomic invoice numbering

- Send two concurrent cloud-save requests for the same business and series.
- Assert both succeed.
- Assert numbers are unique and consecutive.
- Do not accept browser-local numbering as evidence.

### Status and reminder workflow

- Set one invoice to `sent`.
- Set another to `paid`.
- Reload and confirm persistence.
- Use an overdue invoice and a provider simulator recipient.
- Send the first reminder.
- Confirm provider acceptance and one reminder-history row.
- Immediately retry and assert spacing/idempotency blocks the duplicate.

### Accounting export

- Keep at least one sent invoice, one paid invoice, and one draft.
- Export the advertised format.
- Assert sent/paid invoice numbers and totals are present.
- Assert the draft is excluded when that is the intended rule.
- Validate headers, delimiter/encoding, and MIME type.

### Other paid claims

For each additional advertised claim:

- Exercise the real deployed path.
- Assert persistent or externally observable output.
- Do not mark a feature passed merely because code exists.
- Hide or soften the claim if it cannot be validated.

## Phase 7: Restore production configuration

Immediately after paid workflow testing:

1. Restore the preserved live Autumn key.
2. Confirm the secret upload/deployment succeeded.
3. Verify the application still serves normally.
4. Do not use the deleted disposable session to infer production billing-key
   state.
5. Record that the sandbox billing window is closed.

Complete cleanup after restoring the key.

## Phase 8: Cleanup

### Application data

1. Delete test invoices through the application's real deletion path so object
   storage cleanup runs.
2. Confirm invoice history is empty for the disposable account.
3. Delete the disposable client.
4. Read exact database row counts for the disposable user ID/email.
5. Delete the user only after proving the rows are test-owned.
6. Confirm cascades removed tenant/business, subscription, sessions, counters,
   and related rows.
7. Re-query exact counts and require zero.

### Object storage

- Derive exact keys from the recorded invoice rows or documented key format.
- Verify each test object is absent after application deletion.
- Never run broad prefix deletion against a production bucket.

### Autumn and Stripe sandbox

1. Read the sandbox customer and record active plan state.
2. Cancel recurring subscriptions immediately:

   ```ts
   await autumn.billing.update({
     customerId,
     planId,
     cancelAction: 'cancel_immediately'
   });
   ```

3. Re-read the customer and confirm no active subscription remains.
4. Delete the sandbox customer and its Stripe test customer when supported:

   ```ts
   await autumn.customers.delete({
     customerId,
     deleteInStripe: true
   });
   ```

5. Confirm a subsequent customer lookup fails or returns not found.

### Local artifacts

- Close browser sessions.
- Stop tails and background processes.
- Remove only snapshots/logs created by this run.
- Preserve older or pre-existing untracked files.
- Confirm final `git status`.

## Failure taxonomy

| Result | Meaning |
|---|---|
| PASS | Real deployed behavior completed with persistent/external evidence |
| FAIL | Expected behavior was attempted and did not complete |
| BLOCKED | Required credential, dashboard access, or environment was unavailable |
| NOT TESTED | The workflow was intentionally skipped; explain why |

Special billing labels:

- **Checkout verified**: Stripe sandbox payment completed.
- **Autumn activation verified**: Autumn customer shows active plan.
- **Webhook receiver verified**: a correctly signed event is accepted.
- **Automatic webhook verified**: Autumn/Svix delivered automatically and local
  state updated without intervention.
- **Paid flow fully verified**: all four labels above plus every advertised
  paid feature passed and cleanup completed.

## Final report contract

Use this structure:

```markdown
# Autumn sandbox E2E result

Overall: PASS / FAIL / BLOCKED
Live Stripe recommendation: CONNECT / DO NOT CONNECT

| Gate or feature | Result | Evidence |
|---|---|---|
| Stripe sandbox checkout | PASS | ... |
| Autumn plan activation | PASS | ... |
| Automatic webhook delivery | FAIL | ... |
| Local entitlement persistence | ... | ... |
| Advertised feature | ... | ... |

## Cleanup
- Live key restored: yes/no/not applicable
- Sandbox subscription canceled: yes/no
- Autumn/Stripe test customer deleted: yes/no
- Database rows remaining: counts
- Object-storage keys remaining: count
- Browser/log artifacts removed: yes/no

## Blockers
- ...

## Next action
- ...
```

Report exact checks and outcomes without including secrets, session cookies,
full payment identifiers, or real customer data.

## Going-live decision

Recommend connecting live Stripe only when:

- Sandbox checkout succeeds.
- The live catalog is synchronized and prices/currency are correct.
- Automatic sandbox webhook delivery is proven.
- The live Svix endpoint and signing secret are configured separately.
- Local entitlements activate and deactivate correctly.
- Every advertised paid feature passes.
- Cleanup succeeds.
- Exposed keys are rotated.

If automatic webhook delivery is the only failure, the application can still
have functioning paid features, but billing automation is not launch-ready.
