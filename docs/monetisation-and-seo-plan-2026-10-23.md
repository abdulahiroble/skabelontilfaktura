# Faktura: simpler product, paid pilot, and SEO plan

Research date: 23 October 2026. Owner approved deployment and a **99 DKK incl. VAT** one-time paid pilot. This is a test price, not validated willingness to pay.

## Decision

Keep the free invoice generator and existing simple free downloads. Sell **Fakturapakken version 1.0**, a fixed downloadable toolkit, rather than a subscription to invoice administration.

- 99 DKK gross = 79.20 DKK net + 19.80 DKK VAT.
- Eight files: four editable Word document templates (VAT invoice, no-VAT invoice, quote, credit note), one Excel workbook with five sheets, a Word guide, a Word gentle-payment-reminder text and README.
- No cloud archive, customer database, automatic sending, ongoing updates, software licenses or accounting-compliance promise included.
- Keep existing user accounts and the business profile. No customer data deletion.
- Do not change old provider product IDs or infer that absent local subscriptions prove absent provider obligations.
- Paid files are private and only delivered after independently verified payment. A checkout redirect is not proof of payment.
- Consumers retain a 14-day withdrawal right; no checkbox falsely claiming download automatically removes it.

### Pricing evidence and limits

Exa and Firecrawl found many **free** Danish Word/Excel alternatives, including e-conomic, Dinero, inv24 and faktura-skabelon.dk. A German comparable, BloomGeneration's office bundle, lists invoice/quote/reminder/cash-book templates at EUR 14.90, roughly DKK 111. That is an asking price in a different market, **not proof of sales, Danish demand, or validated willingness to pay**. Logogenie advertises branded Word/Excel invoice downloads, but the inspected page did not disclose a comparable price.

The initial 99 DKK pilot tests whether buyers value a coherent ready-to-use workflow above a free single invoice. Do not add a crossed-out 149 DKK price or fabricated scarcity. Only test a higher price after enough qualified buyers see the deliverable. Compare **net revenue per qualified offer viewer**, not conversion rate alone.

## Baseline and technical evidence

Search Console's 90-day overview returned:

| Site                       | Google clicks | Impressions | Average position |
| -------------------------- | ------------: | ----------: | ---------------: |
| skabelontilfaktura.dk      |             1 |         835 |             46.6 |
| transskriberingaflydfil.dk |           209 |       6,357 |              4.9 |
| billedetiltekst.dk         |            26 |       1,881 |              9.9 |

Latest returned daily data: 21 October. These are Google organic metrics, not all-source visits or sales. A separate explicitly dated page report (25 July–21 October) returned four visible page rows; do not add its page-level impressions to the overview or treat the two query scopes as interchangeable.

Individual URL inspections on 23 October:

- `/`: submitted and indexed; mobile crawl 17 October; successful fetch; Google's canonical matches.
- `/generator/`: discovered, currently not indexed.
- `/blog/faktura-skabelon-word/`: unknown to Google.
- Submitted sitemap: 46 URLs, last read 19 October, zero reported errors/warnings.

**Interpretation:** this is an acquisition and indexation problem before it is a statistically established pricing failure. A valid sitemap does not mean its pages have been indexed. Do not claim Google has blocked the entire site.

A first batch inspection used the wrong URL delimiter and produced a result for one concatenated URL. That result was discarded; the evidence above comes from valid individual inspections. The basic sitemap tool failed; the enhanced sitemap tool returned the evidence above.

Production read-only usage audit:

- 3 users, 1 business, 0 clients.
- 0 invoices, invoice items, stored PDF references, counters and reminders.
- 0 local subscription rows.
- Autumn live: 2 customers, 0 subscriptions, 0 purchases, 0 licenses, with complete pagination.
- R2 objects and independent direct Stripe obligations were not separately inventoried.

Retire the **new-sale cloud offer**, preserve old records and IDs, and recheck obligations before deleting infrastructure. Physical R2/database destruction is not required to simplify the product.

## KWRDS research

Locale requested: `da-DK`. Tools: `search_volume`, `keywords_with_volumes`, `serp`. Volumes are vendor estimates of monthly Google searches, not measured site traffic.

| Keyword                              | Est. monthly searches | Intent / action                                                         |
| ------------------------------------ | --------------------: | ----------------------------------------------------------------------- |
| faktura skabelon                     |                 1,600 | Core free template hub on homepage                                      |
| fakturaskabelon                      |                 1,600 | Same close-variant cluster, not another 1,600                           |
| skabelon til faktura                 |                 1,600 | Same close-variant cluster                                              |
| lav faktura                          |                   390 | Generator, immediate task                                               |
| gratis faktura skabelon              |                   210 | Same free-template hub, not another page                                |
| faktura skabelon word                |                   210 | Word download and usage instructions                                    |
| faktura skabelon excel               |                    90 | Excel download, working formulas                                        |
| faktura uden cvr                     |                   140 | Existing guide; legal accuracy first                                    |
| lav faktura gratis                   |                   140 | Same generator cluster                                                  |
| faktura privatperson                 |                    70 | Existing no-CVR guide, not duplicate landing                            |
| faktura skabelon privatperson        |                    70 | Same no-CVR guide cluster                                               |
| tilbud skabelon                      |                    70 | Future useful quote download page                                       |
| tilbudsskabelon                      |                    50 | Same quote cluster                                                      |
| faktura uden moms                    |                    50 | Potential specific no-VAT guide/download                                |
| faktura skabelon uden moms           |                    40 | Same no-VAT cluster                                                     |
| kreditnota skabelon                  |                    20 | Existing credit-note guide + useful example                             |
| faktura skabelon pdf                 |                    20 | Existing PDF page                                                       |
| faktura skabelon google docs         |                    20 | Existing Docs guide, low priority                                       |
| tilbud skabelon word                 |                    20 | Same quote page, not separate page                                      |
| tilbud skabelon excel                |                    20 | Same quote page                                                         |
| rykker skabelon                      |                    20 | Later; legal accuracy and genuine utility                               |
| proforma faktura                     |                   140 | Existing informational page; supporting priority                        |
| kreditnota                           |                 1,900 | Primarily definition/help; not 1,900 ready buyers                       |
| faktura engelsk / faktura på engelsk |            1,000 each | Same close variants; SERP primarily translation, not template purchases |
| gratis fakturaprogram                |                    30 | Vendor reported; broad strong competition, not main target              |
| fakturaprogram                       |                    10 | Vendor estimate looks unusually low; do not base strategy on it         |
| fakturaprogram uden abonnement       |                     0 | Conversion message, not primary keyword                                 |
| faktura skabelon håndværker          |                     0 | No measured exact demand; not proof of no demand                        |
| faktura skabelon freelancer          |                     0 | No measured exact demand; do not generate more thin variants            |

### Research quality controls

- Match returned keyword strings, not original request indexes: the API sorts its response.
- One batch of 16 keywords returned only 10 rows. Missing keywords were queried in a smaller batch; omitted rows are **not zero**.
- Never sum close variants to inflate total market size.
- Competition LOW/MEDIUM/HIGH in the response is advertising competition, **not organic keyword difficulty**.
- Some KWRDS SERPs contained Norwegian/English results and opaque `/goto` URLs despite Danish locale. Treat those as directional intent evidence only, not an authoritative Danish top-10 rank report.
- English-invoice and credit-note head terms mostly returned dictionaries/definitions. Do not select them just because volume exceeds Word/Excel.
- CPC currency was not established in this investigation; CPC is deliberately omitted.

## Keyword-to-page map

Preserve existing URLs. Do not create `/word/` or `/excel/` pages that compete with the existing guides.

| Priority              | Canonical page                  | Primary job                                                       | Free-to-paid path                                                         |
| --------------------- | ------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| P0                    | `/`                             | Free faktura skabelon hub; editable tool + Word/Excel/PDF options | Toolkit preview to `/pris/`                                               |
| P0                    | `/generator/`                   | Make an invoice immediately                                       | Relevant offer after successful PDF generation                            |
| P0                    | `/blog/faktura-skabelon-word/`  | Download .docx first; then instructions                           | Matched quote/credit-note kit                                             |
| P0                    | `/blog/faktura-skabelon-excel/` | Download working .xlsx; show formulas and worked example          | Full workbook + document kit                                              |
| P0                    | `/pris/`                        | Explain fixed product, exact contents, price and delivery         | One SKU, one purchase CTA                                                 |
| P1                    | `/blog/faktura-uden-cvr/`       | Resolve private-person invoicing questions accurately             | Free generator first, optional kit                                        |
| P1                    | `/blog/kreditnota/`             | Explain and show a real credited-invoice example                  | Matching credit note in kit                                               |
| P1, new only after P0 | `/blog/tilbud-skabelon/`        | Actual useful free quote sample/download, not prose only          | Full editable matched documents                                           |
| P1, new only after P0 | `/blog/faktura-uden-moms/`      | Distinguish non-registration/exemption; useful example            | Correct no-VAT template in kit                                            |
| P2                    | `/blog/kvittering-skabelon/`    | Improve the page that already earned the only click               | Relevant invoice tool, optional kit                                       |
| P2                    | `/blog/faktura-skabelon-pdf/`   | Printable example + editable-generator alternative                | Optional kit                                                              |
| P2                    | Existing sector pages           | Useful sector-specific worked examples                            | Generator or toolkit; never pretend a generic download is sector-specific |

## First 14 days: fix the foundation

1. Ship complete paid delivery, private downloads and recovery before promoting purchases. Verify the actual 99 DKK checkout total and VAT, not merely the label.
2. Keep free Word/Excel/PDF promises. Test the files, not just HTTP 200 responses.
3. Place downloadable Word/Excel options before long instructions. Add direct descriptive links to those pages from homepage, templates hub and footer.
4. Remove stale Pro/cloud CTAs and broad compliance guarantees. Publish real seller/contact/terms/privacy details.
5. Review the **existing** core pages individually in GSC. Use URL Inspection on homepage, generator, Word, Excel, package page and the already-performing receipt page.
6. Verify public pages render useful content without a session, self-canonicalize, return 200 and have no accidental noindex. Verify protected downloads, account and auth pages do not enter the sitemap.
7. Use actual change dates in the sitemap; do not bump every page's date merely to suggest freshness. `priority` and `changefreq` are not ranking levers.
8. After deployment, validate sitemap readback and changed URLs. Request indexing for a few high-value URLs using Search Console where supported; request submission does not guarantee indexation.
9. Do not publish new sector pages while core download pages remain undiscovered/unindexed. Inspect content usefulness and internal discovery before assuming a technical block.

## Days 15–30: improve existing intent matches

- Word: provide the file immediately, a filled example, how to save PDF, which fields are optional, and honest manual-calculation limitations.
- Excel: demonstrate 2 × 750 = 1,500; VAT 375; total 1,875; show editable inputs, rounding and no-VAT handling. Include a screenshot of the real workbook, not an invented dashboard.
- No-CVR: verify current Danish legal guidance and distinguish CVR, VAT registration and invoice content. Do not use the 50,000 DKK VAT threshold as a universal permission to operate without registration.
- Credit note: show an original invoice reference and the exact reversal of 1,500 + 375. This is a better commercial fit than a broad dictionary definition alone.
- Add contextual links between requirements, Word, Excel, no-CVR and credit-note pages. Each page should lead to the appropriate free result before an optional paid bundle.
- Check title/description CTR only after a page receives meaningful impressions. Keep the selected homepage design; improve clarity rather than redesigning it again.

## Days 31–60: fill two gaps, build authority carefully

- Publish a quote-template page and no-VAT-template page only if P0 pages are reachable, useful and progressing in indexation.
- Each must include an actual usable sample, original worked example, clear limitations and relevant sources. Do not clone an article and swap its keyword.
- Audit 26 existing sector pages. A generic Word/Excel file is not a tailored trade download. Either deliver genuine sector-specific document content or label it clearly as a generic file with sector examples on the page.
- Prioritise sectors supported by actual GSC impressions or user feedback. Merge genuinely redundant content only after URL/backlink review and deliberate redirects; no mass noindex/delete operation based on zero exact keyword volume.
- Prepare a useful resource for Danish freelancer communities, business organisations or relevant tutorial sites. Only contact/publish externally with owner approval. No paid link schemes or automatic cross-linking across unrelated owned sites.
- Do not prioritise dictionary traffic for “faktura engelsk,” national bookkeeping-law head terms or another generic “best programs” list over usable templates.

## Measurement and decision rules

### Funnel

With explicit analytics consent only:

1. `generator_viewed`
2. `invoice_pdf_downloaded` — no invoice number, customer or invoice content in params
3. `kit_offer_clicked` with placement source
4. `kit_viewed`
5. `kit_checkout_requested`
6. `begin_checkout` only after a provider URL is returned
7. `kit_checkout_failed` with a non-sensitive error code

Use verified provider/local purchase records for **actual paid orders, revenue and delivery**, not `checkout=success` or GA4 alone. Add a standard GA4 purchase event only with proper item payload and transaction deduplication; do not report browser redirects as revenue.

Track weekly:

- Indexation of the six priority pages, not merely submitted sitemap count.
- Non-brand impressions/clicks by query cluster and landing page.
- Qualified template users and completed generator downloads.
- Offer-to-checkout rate by placement.
- Checkout-to-paid conversion, gross/net revenue, refunds and fulfillment failures.
- Support complaints, successful downloads and repeat download recovery.

Do not A/B split the current near-zero search traffic. Review one coherent pilot first:

- First 20 qualified users: usability and objection interviews, not conversion claims.
- At 100 **qualified offer viewers**, review directional funnel counts. This is a practical checkpoint, not statistical proof.
- Offer viewed but no checkout: investigate relevance, differentiation, trust and price.
- Checkout starts but no payment: inspect checkout friction, payment errors and total/VAT.
- Payment but no valid download: stop promotion and fix fulfillment.
- Purchases but refunds/unused files: fix product value before raising price.
- After initial evidence, compare 99 vs 149 DKK sequential cohorts with traffic-source controls. Optimise net revenue per qualified viewer and support cost, not a target conversion rate invented in advance.

### Planning milestones, not traffic guarantees

- Day 14: purchase path and files verified; indexation gaps explicitly tracked.
- Day 30: core Word/Excel pages have an actionable inspection outcome and stronger discovery; evaluate any real click/impression change.
- Day 60: assess whether template traffic generates paid intent and whether the two new pages are justified.
- Day 90: decide whether to expand the toolkit, adjust price, or keep the site mainly as a free acquisition/affiliate utility.

No top-three ranking, sales count or organic traffic increase is promised.

## Sources

- Connected Google Search Console: performance overviews, explicit page report, individual URL Inspection, enhanced sitemap listing, 23 October 2026.
- KWRDS MCP, `da-DK`: seed volumes, keyword suggestions and SERP checks, 23 October 2026.
- https://www.e-conomic.dk/regnskabsprogram/fakturaskabelon
- https://dinero.dk/fakturaservice/
- https://www.inv24.dk/dk/tpl/
- https://faktura-skabelon.dk/
- https://www.logogenie.dk/faktura-skabelon
- https://bloomgeneration.de/produkt/buero-paket-kleinunternehmer-rechnung-angebot-mahnung-kassenbuch/
- https://erhvervsstyrelsen.dk/vejledning-bogfoeringsloven

## Reproduce product checks

Generation/test dependencies are isolated from the application:

```sh
npm install --prefix tmp --ignore-scripts exceljs@4.4.0 docx@9.5.1 hot-formula-parser@4.0.0
node scripts/generate-fakturapakke.mjs
node scripts/test-fakturapakke.mjs
```

`outputs/` and `tmp/` are ignored. The generated server-only module contains the paid ZIP and hash. Never import it from client code or put the ZIP under `static/`.
