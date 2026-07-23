/**
 * Builder that converts an {@link InvoiceData} (our internal invoice model)
 * into a provider-agnostic {@link PeppolInvoicePayload}.
 *
 * The mapping is purely deterministic: it derives the buyer/seller EAS codes,
 * maps line items, and recomputes totals through the moms engine so the payload
 * is internally consistent regardless of how the source invoice was authored.
 *
 * No I/O is performed here — this is the boundary between our domain model and
 * the Peppol wire model. The adapter layer is responsible for any network
 * activity.
 */
import type { InvoiceData, InvoiceItem, InvoiceParty } from '$lib/invoice/types';
import { calculateTotals, calcLineTotal } from '$lib/invoice/moms';
import type { PeppolInvoicePayload, PeppolInvoiceLine, PeppolParticipant } from './types';
import { EAS_CODES } from './adapter';

/**
 * Derive a Peppol participant identifier from a party's CVR / EAN fields.
 *
 * Rules (match the official Peppol EAS registry):
 * - If an EAN/GLN is present (13 digits), use the Danish EAN scheme (`9901`).
 *   EAN takes precedence because it is required for public-sector buyers and
 *   unambiguously identifies a single delivery location.
 * - Otherwise, if a CVR is present (8 digits), use the Danish CVR scheme
 *   (`0184`).
 * - Otherwise return `null` — the party is not Peppol-addressable.
 *
 * The checks are intentionally permissive about whitespace, but the underlying
 * value must consist solely of the expected digits.
 */
export function deriveEasCode(party: {
	cvr?: string;
	ean?: string;
	name?: string;
}): PeppolParticipant | null {
	const ean = party.ean?.replace(/\s+/g, '');
	if (ean && /^\d{13}$/.test(ean)) {
		return {
			easCode: EAS_CODES.DK_EAN,
			identifier: ean,
			name: party.name,
			country: 'DK'
		};
	}

	const cvr = party.cvr?.replace(/\s+/g, '');
	if (cvr && /^\d{8}$/.test(cvr)) {
		return {
			easCode: EAS_CODES.DK_CVR,
			identifier: cvr,
			name: party.name,
			country: 'DK'
		};
	}

	return null;
}

/**
 * Build a {@link PeppolParticipant} from an {@link InvoiceParty}, falling back
 * to a name-only participant when no CVR/EAN is available. This is used for the
 * seller, which must always be present on the payload even if it is not itself
 * Peppol-reachable.
 *
 * @throws when neither CVR nor EAN is available — sellers must be addressable.
 */
function requireParticipant(party: InvoiceParty): PeppolParticipant {
	const participant = deriveEasCode(party);
	if (!participant) {
		throw new Error(
			`Kan ikke danne Peppol-identifikator for "${party.name}". Angiv CVR (8 cifre) eller EAN (13 cifre).`
		);
	}
	return participant;
}

/**
 * Map an {@link InvoiceItem} to a {@link PeppolInvoiceLine}, computing the
 * line VAT amount and net+VAT total inline (Peppol expects per-line totals).
 *
 * The invoice-level VAT rate is applied to the line, mirroring the moms engine
 * which computes VAT once per invoice using `vatRate`.
 */
function mapLineItem(item: InvoiceItem, vatRate: number): PeppolInvoiceLine {
	const net = calcLineTotal(item);
	const vatAmount = net * vatRate;
	return {
		description: item.description,
		quantity: item.quantity,
		unitPrice: item.unitPrice,
		vatRate,
		vatAmount,
		total: net + vatAmount
	};
}

/**
 * Build a {@link PeppolInvoicePayload} from an internal invoice.
 *
 * - Seller must be Peppol-addressable (CVR or EAN), otherwise this throws.
 * - Buyer is optional: if it cannot be addressed the returned payload still
 *   carries `null` for `buyer`, and the caller decides whether that is fatal
 *   (it usually is — you cannot send without a reachable buyer — but the
 *   lookup UI uses the same builder to populate a lookup call).
 *
 * Totals are recomputed via {@link calculateTotals} so the payload cannot drift
 * from what the rest of the app considers canonical.
 *
 * @throws if the seller has no CVR/EAN.
 */
export function buildPeppolPayload(data: InvoiceData): PeppolInvoicePayload {
	const seller = requireParticipant(data.seller);
	const buyer = deriveEasCode(data.buyer);
	if (!buyer) {
		throw new Error(
			`Kan ikke danne Peppol-identifikator for køber "${data.buyer.name}". Angiv CVR (8 cifre) eller EAN (13 cifre).`
		);
	}

	const totals = calculateTotals(data.items, data.vatMode, data.items[0]?.vatRate);

	const lineItems: PeppolInvoiceLine[] = data.items.map((item) =>
		mapLineItem(item, totals.vatRate)
	);

	return {
		invoiceNumber: data.invoiceNumber,
		issueDate: data.issueDate,
		dueDate: data.dueDate,
		currency: data.currency,
		seller,
		buyer,
		lineItems,
		totals: {
			subtotal: totals.subtotal,
			vatAmount: totals.vatAmount,
			total: totals.total
		}
	};
}
