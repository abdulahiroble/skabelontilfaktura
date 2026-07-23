/**
 * TypeScript domain types for the invoice module.
 *
 * These types mirror the Zod schemas in `schema.ts` but are standalone and can
 * be imported without pulling in the validation runtime. Use the `InvoiceDataInput`
 * type (re-exported from `schema.ts`) when you want the shape that Zod accepts.
 */

export type VatMode = 'standard' | 'momsfritaget' | 'reverse' | 'kunstnermoms';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export type Currency = 'DKK' | 'EUR' | 'USD';

export type InvoiceLanguage = 'da' | 'en';

export interface InvoiceItem {
	id?: string;
	description: string;
	quantity: number;
	unit: string; // e.g., 'stk', 'timer', 'kg'
	unitPrice: number; // price per unit excluding VAT
	vatRate: number; // typically 0.25 for 25%
	discount?: number; // percentage 0-100
}

export interface InvoiceParty {
	name: string;
	address?: string;
	postalCode?: string;
	city?: string;
	cvr?: string; // Danish CVR or buyer VAT
	email?: string;
	phone?: string;
	ean?: string; // EAN/GLN for public sector
}

export interface InvoiceData {
	invoiceNumber: string;
	series: string; // e.g., '2026'
	issueDate: string; // ISO date
	dueDate: string; // ISO date
	deliveryDate?: string; // ISO date
	seller: InvoiceParty;
	buyer: InvoiceParty;
	items: InvoiceItem[];
	currency: Currency;
	vatMode: VatMode;
	paymentTerms?: string; // e.g., 'Netto 8 dage'
	regNr?: string; // bank registration number
	kontonr?: string; // bank account number
	mobilepay?: string; // phone number
	language: InvoiceLanguage;
	notes?: string;
	logoDataUrl?: string; // base64 logo
	brandColor?: string;
	template?: 'minimalist' | 'modern';
	isProforma?: boolean;
	isCreditNote?: boolean;
	creditNoteRef?: string; // original invoice number for credit notes
}
