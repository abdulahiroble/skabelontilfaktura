/**
 * TypeScript types for the Peppol e-invoicing integration.
 *
 * Peppol is the EU e-invoicing network used by Denmark's NemHandel platform.
 * These types are provider-agnostic: they describe what a Peppol participant
 * looks like and what an adapter must implement, without coupling to any
 * specific Access Point (Storecove, Pagero, Tradeshift, …).
 *
 * All Peppol code is server-side only — these types are intentionally not
 * imported from client components.
 */

/**
 * A Peppol participant (sender or receiver) identified by an EAS code +
 * identifier pair.
 *
 * - `easCode` follows the Peppol Electronic Address Scheme registry
 *   (e.g. `0184` for Danish CVR, `9901` for Danish EAN/GLN).
 * - `identifier` is the value of that scheme for this participant
 *   (e.g. the CVR number `12345678`).
 */
export interface PeppolParticipant {
	easCode: string; // e.g. '0184' for DK CVR
	identifier: string; // e.g. the CVR number
	name?: string;
	country?: string;
}

/**
 * Result of checking whether a participant is reachable on the Peppol network.
 *
 * `accessPoint` is the name of the certified Access Point that has registered
 * the participant, when the lookup is able to determine it.
 */
export interface PeppolLookupResult {
	reachable: boolean;
	participant: PeppolParticipant;
	accessPoint?: string;
}

/**
 * A single invoice line, mapped to the Peppol BIS Billing 3.0 / EN 16931
 * line model. Monetary values are plain JS numbers at full precision.
 */
export interface PeppolInvoiceLine {
	description: string;
	quantity: number;
	unitPrice: number;
	vatRate: number;
	vatAmount: number;
	total: number;
}

/**
 * Aggregated totals for a Peppol invoice payload.
 */
export interface PeppolInvoiceTotals {
	subtotal: number;
	vatAmount: number;
	total: number;
}

/**
 * Provider-agnostic invoice payload. Real Access Point adapters translate this
 * into their own wire format (e.g. BIS 4 XML or UBL).
 */
export interface PeppolInvoicePayload {
	invoiceNumber: string;
	issueDate: string;
	dueDate: string;
	currency: string;
	seller: PeppolParticipant;
	buyer: PeppolParticipant;
	lineItems: PeppolInvoiceLine[];
	totals: PeppolInvoiceTotals;
}

/**
 * Outcome of a send attempt.
 *
 * `messageId` is the Peppol transmission identifier returned by the Access
 * Point on success (used for tracking and delivery receipts).
 */
export interface PeppolSendResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * The adapter contract every Peppol provider implementation must satisfy.
 *
 * A stub implementation is provided in `adapter.ts`; a real implementation
 * (e.g. StorecoveAdapter) would be selected based on environment config in
 * `createPeppolAdapter`.
 */
export interface PeppolAdapter {
	lookupParticipant(participant: PeppolParticipant): Promise<PeppolLookupResult>;
	sendInvoice(payload: PeppolInvoicePayload): Promise<PeppolSendResult>;
}
