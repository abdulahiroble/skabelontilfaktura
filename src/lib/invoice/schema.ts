/**
 * Zod validation schemas for the invoice domain.
 *
 * Danish-specific validation lives here (CVR format, bank account modulus-11,
 * EAN GLN checksum, etc.). The standalone helper functions in `validation.ts`
 * are reused inside refinements so the logic stays in one place.
 */
import { z } from 'zod';

import {
	validateCvr,
	validateEan,
	validateKontonr,
	validateMobilePay,
	validateRegNr
} from './validation';

/* -------------------------------------------------------------------------- */
/* Enum schemas                                                               */
/* -------------------------------------------------------------------------- */

export const VatModeSchema = z.enum(['standard', 'momsfritaget', 'reverse', 'kunstnermoms']);

export const InvoiceStatusSchema = z.enum(['draft', 'sent', 'paid', 'overdue', 'void']);

export const CurrencySchema = z.enum(['DKK', 'EUR', 'USD']);

export const InvoiceLanguageSchema = z.enum(['da', 'en']);

/* -------------------------------------------------------------------------- */
/* Date helper                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Accepts an ISO date string (YYYY-MM-DD) or a full ISO timestamp and coerces it
 * to a Date for validation. The output remains the original string.
 */
const isoDateString = z
	.string()
	.min(1, { message: 'Dato må ikke være tom' })
	.refine((value) => !Number.isNaN(Date.parse(value)), {
		message: 'Ugyldig dato'
	});

/* -------------------------------------------------------------------------- */
/* Invoice item                                                               */
/* -------------------------------------------------------------------------- */

export const InvoiceItemSchema = z.object({
	id: z.string().optional(),
	description: z.string().min(1, { message: 'Beskrivelse skal udfyldes' }),
	quantity: z.number({ error: 'Antal skal være et tal' }).positive({
		message: 'Antal skal være positivt'
	}),
	unit: z.string().min(1).default('stk'),
	unitPrice: z
		.number({ error: 'Stykpris skal være et tal' })
		.min(0, { message: 'Stykpris må ikke være negativ' }),
	vatRate: z.number().min(0).max(1).default(0.25),
	discount: z.number().min(0).max(100).optional()
});

/* -------------------------------------------------------------------------- */
/* Invoice party (seller or buyer)                                            */
/* -------------------------------------------------------------------------- */

export const InvoicePartySchema = z.object({
	name: z.string().min(1, { message: 'Navn skal udfyldes' }),
	address: z.string().optional(),
	postalCode: z.string().optional(),
	city: z.string().optional(),
	cvr: z
		.string()
		.optional()
		.refine((value) => value === undefined || value === '' || validateCvr(value), {
			message: 'CVR skal være 8 cifre'
		}),
	email: z.string().email({ message: 'Ugyldig e-mail' }).optional().or(z.literal('')),
	phone: z.string().optional(),
	ean: z
		.string()
		.optional()
		.refine((value) => value === undefined || value === '' || validateEan(value), {
			message: 'EAN-nummer er ugyldigt'
		})
});

/* -------------------------------------------------------------------------- */
/* Invoice data                                                               */
/* -------------------------------------------------------------------------- */

export const InvoiceDataSchema = z
	.object({
		invoiceNumber: z.string().min(1, { message: 'Fakturanummer skal udfyldes' }),
		series: z.string().min(1),
		issueDate: isoDateString,
		dueDate: isoDateString,
		deliveryDate: isoDateString.optional(),
		seller: InvoicePartySchema,
		buyer: InvoicePartySchema,
		items: z.array(InvoiceItemSchema).min(1, { message: 'Tilføj mindst én linje' }),
		currency: CurrencySchema,
		vatMode: VatModeSchema,
		paymentTerms: z.string().optional(),
		regNr: z
			.string()
			.optional()
			.refine((value) => value === undefined || value === '' || validateRegNr(value), {
				message: 'Registernummer skal være 4 cifre'
			}),
		kontonr: z
			.string()
			.optional()
			.refine((value) => value === undefined || value === '' || validateKontonr(value), {
				message: 'Kontonummer er ugyldigt (modulus-11 check fejlede)'
			}),
		mobilepay: z
			.string()
			.optional()
			.refine((value) => value === undefined || value === '' || validateMobilePay(value), {
				message: 'MobilePay-nummer er ugyldigt'
			}),
		language: InvoiceLanguageSchema,
		notes: z.string().optional(),
		logoDataUrl: z.string().optional(),
		brandColor: z.string().optional(),
		template: z.enum(['minimalist', 'modern']).optional(),
		isProforma: z.boolean().optional(),
		isCreditNote: z.boolean().optional(),
		creditNoteRef: z.string().optional()
	})
	.refine((data) => new Date(data.dueDate) >= new Date(data.issueDate), {
		message: 'Forfaldsdato skal være efter fakturadato',
		path: ['dueDate']
	})
	/**
	 * CVR soft check. We never want to hard-block a standard-rated invoice without
	 * a CVR (the user may be a B2C sole trader), so we surface this as a warning
	 * via the issues map instead of returning failure. Consumers can detect it by
	 * inspecting the validation result for an issue with code 'seller_cvr_missing'.
	 */
	.refine(
		(data) => {
			if (data.vatMode !== 'standard') return true;
			const cvr = data.seller.cvr?.trim();
			return !!cvr && cvr.length > 0;
		},
		{
			message: 'Sælger mangler CVR ved standard moms',
			path: ['seller', 'cvr'],
			params: { code: 'seller_cvr_missing' }
		}
	);

/* -------------------------------------------------------------------------- */
/* Derived types                                                              */
/* -------------------------------------------------------------------------- */

export type InvoiceDataInput = z.infer<typeof InvoiceDataSchema>;
export type InvoicePartyInput = z.infer<typeof InvoicePartySchema>;
export type InvoiceItemInput = z.infer<typeof InvoiceItemSchema>;
