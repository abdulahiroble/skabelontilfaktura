/**
 * Minimal i18n layer for the free-tier invoice editor.
 *
 * Two locales are supported: Danish ('da') and English ('en'). Message
 * catalogs are flat string maps keyed by stable identifiers. The translator
 * returns the key itself when a translation is missing so broken UI is
 * obvious during development without crashing.
 *
 * Locale preference is persisted to localStorage so a returning user keeps
 * their language choice across sessions.
 */
import type { InvoiceLanguage } from '$lib/invoice/types';

export type MessageCatalog = Record<string, string>;

/** localStorage key for the user's chosen UI language. */
const LOCALE_STORAGE_KEY = 'faktura:locale';

/* -------------------------------------------------------------------------- */
/* Danish message catalog                                                     */
/* -------------------------------------------------------------------------- */

const da: MessageCatalog = {
	// Generic
	'app.title': 'Fakturagenerator',
	'app.subtitle': 'Udfyld felterne nedenfor for at oprette din faktura.',
	'common.required': 'Påkrævet',
	'common.optional': 'Valgfrit',
	'common.remove': 'Fjern',
	'common.add': 'Tilføj',
	'common.save': 'Gem',
	'common.reset': 'Nulstil',
	'common.dkk': 'DKK',
	'common.eur': 'EUR',
	'common.usd': 'USD',

	// Sections
	'section.seller': 'Sælger (afsender)',
	'section.buyer': 'Køber (modtager)',
	'section.items': 'Linjer',
	'section.payment': 'Betaling',
	'section.settings': 'Indstillinger',
	'section.preview': 'Forhåndsvisning',
	'section.dates': 'Datoer',

	// Party fields
	'party.name': 'Navn / firmanavn',
	'party.address': 'Adresse',
	'party.postalCode': 'Postnummer',
	'party.city': 'By',
	'party.cvr': 'CVR-nummer',
	'party.email': 'E-mail',
	'party.phone': 'Telefon',
	'party.ean': 'EAN-nummer',

	// CVR / VIES lookups
	'party.cvrLookup': 'Slå op',
	'party.cvrLooking': 'Søger…',
	'party.cvrLookupFailed': 'CVR ikke fundet',
	'party.cvrLookupSuccess': 'Udfyldt fra CVR-registret',
	'party.viesValidate': 'Valider EU-moms',
	'party.viesValidating': 'Validerer…',
	'party.viesValid': 'Gyldigt EU-momsnummer',
	'party.viesInvalid': 'Ugyldigt EU-momsnummer',
	'party.viesHint': 'Brug formatet «LANDKODE momsnummer», f.eks. «SE1234567890»',

	// Item fields
	'items.description': 'Beskrivelse',
	'items.quantity': 'Antal',
	'items.unit': 'Enhed',
	'items.unitPrice': 'Stykpris',
	'items.vatRate': 'Moms (%)',
	'items.discount': 'Rabat (%)',
	'items.lineTotal': 'Beløb',
	'items.addLine': 'Tilføj linje',
	'items.empty': 'Tilføj mindst én varelinje.',

	// Totals summary
	'totals.subtotal': 'Subtotal (ekskl. moms)',
	'totals.vat': 'Moms',
	'totals.total': 'Total (inkl. moms)',
	'totals.empty': 'Tilføj mindst én linje',
	'totals.taxableBase': 'Momspligtig del (20%)',
	'totals.exemptBase': 'Momsfri del (80%)',
	'totals.vatMismatch':
		'Linjerne har blandede momssatser, men fakturaen er i standard-tilstand. Moms beregnes ud fra fakturaens momstilstand.',

	// Payment
	'payment.regNr': 'Registreringsnummer',
	'payment.kontonr': 'Kontonummer',
	'payment.mobilepay': 'MobilePay-nummer',
	'payment.terms': 'Betalingsbetingelser',
	'payment.dueDate': 'Forfaldsdato',
	'payment.issueDate': 'Fakturadato',
	'payment.deliveryDate': 'Leveringsdato',
	'payment.invoiceNumber': 'Fakturanummer',
	'payment.series': 'Serie',

	// Settings
	'settings.language': 'Sprog',
	'settings.currency': 'Valuta',
	'settings.vatMode': 'Momstilstand',
	'settings.template': 'Skabelon',
	'settings.notes': 'Noter',

	// VAT modes
	'vat.standard': 'Standard (25%)',
	'vat.momsfritaget': 'Momsfritaget',
	'vat.reverse': 'Reverse charge',
	'vat.kunstnermoms': 'Kunstnermoms',

	// Templates
	'template.minimalist': 'Minimalistisk',
	'template.modern': 'Moderne',

	// Buttons
	'button.downloadPdf': 'Download PDF',
	'button.reset': 'Nulstil formular',
	'button.addLine': 'Tilføj linje',

	// Validation messages
	'validation.nameRequired': 'Navn skal udfyldes',
	'validation.descriptionRequired': 'Beskrivelse skal udfyldes',
	'validation.quantityPositive': 'Antal skal være positivt',
	'validation.unitPriceNonNegative': 'Stykpris må ikke være negativ',
	'validation.cvrFormat': 'CVR skal være 8 cifre',
	'validation.eanFormat': 'EAN-nummer er ugyldigt',
	'validation.emailFormat': 'Ugyldig e-mail',
	'validation.regNrFormat': 'Registreringsnummer skal være 4 cifre',
	'validation.kontonrFormat': 'Kontonummer er ugyldigt (modulus-11 check fejlede)',
	'validation.mobilepayFormat': 'MobilePay-nummer er ugyldigt',
	'validation.dueDateAfterIssue': 'Forfaldsdato skal være efter fakturadato',
	'validation.dateRequired': 'Dato må ikke være tom',
	'validation.dateInvalid': 'Ugyldig dato',
	'validation.atLeastOneItem': 'Tilføj mindst én linje',
	'validation.sellerCvrMissing': 'Sælger mangler CVR ved standard moms',
	'validation.title': 'Tjek venligst følgende:'
};

/* -------------------------------------------------------------------------- */
/* English message catalog                                                    */
/* -------------------------------------------------------------------------- */

const en: MessageCatalog = {
	// Generic
	'app.title': 'Invoice generator',
	'app.subtitle': 'Fill in the fields below to create your invoice.',
	'common.required': 'Required',
	'common.optional': 'Optional',
	'common.remove': 'Remove',
	'common.add': 'Add',
	'common.save': 'Save',
	'common.reset': 'Reset',
	'common.dkk': 'DKK',
	'common.eur': 'EUR',
	'common.usd': 'USD',

	// Sections
	'section.seller': 'Seller (sender)',
	'section.buyer': 'Buyer (recipient)',
	'section.items': 'Line items',
	'section.payment': 'Payment',
	'section.settings': 'Settings',
	'section.preview': 'Preview',
	'section.dates': 'Dates',

	// Party fields
	'party.name': 'Name / company',
	'party.address': 'Address',
	'party.postalCode': 'Postal code',
	'party.city': 'City',
	'party.cvr': 'VAT (CVR) number',
	'party.email': 'Email',
	'party.phone': 'Phone',
	'party.ean': 'EAN number',

	// CVR / VIES lookups
	'party.cvrLookup': 'Look up',
	'party.cvrLooking': 'Searching…',
	'party.cvrLookupFailed': 'CVR not found',
	'party.cvrLookupSuccess': 'Filled from the CVR register',
	'party.viesValidate': 'Validate EU VAT',
	'party.viesValidating': 'Validating…',
	'party.viesValid': 'Valid EU VAT number',
	'party.viesInvalid': 'Invalid EU VAT number',
	'party.viesHint': 'Use the format “COUNTRYCODE VATNUMBER”, e.g. “SE1234567890”',

	// Item fields
	'items.description': 'Description',
	'items.quantity': 'Quantity',
	'items.unit': 'Unit',
	'items.unitPrice': 'Unit price',
	'items.vatRate': 'VAT (%)',
	'items.discount': 'Discount (%)',
	'items.lineTotal': 'Amount',
	'items.addLine': 'Add line',
	'items.empty': 'Add at least one line item.',

	// Totals summary
	'totals.subtotal': 'Subtotal (excl. VAT)',
	'totals.vat': 'VAT',
	'totals.total': 'Total (incl. VAT)',
	'totals.empty': 'Add at least one line',
	'totals.taxableBase': 'Taxable portion (20%)',
	'totals.exemptBase': 'VAT-exempt portion (80%)',
	'totals.vatMismatch':
		'Lines have mixed VAT rates but the invoice is in standard mode. VAT is computed from the invoice VAT mode.',

	// Payment
	'payment.regNr': 'Registration number',
	'payment.kontonr': 'Account number',
	'payment.mobilepay': 'MobilePay number',
	'payment.terms': 'Payment terms',
	'payment.dueDate': 'Due date',
	'payment.issueDate': 'Invoice date',
	'payment.deliveryDate': 'Delivery date',
	'payment.invoiceNumber': 'Invoice number',
	'payment.series': 'Series',

	// Settings
	'settings.language': 'Language',
	'settings.currency': 'Currency',
	'settings.vatMode': 'VAT mode',
	'settings.template': 'Template',
	'settings.notes': 'Notes',

	// VAT modes
	'vat.standard': 'Standard (25%)',
	'vat.momsfritaget': 'VAT exempt',
	'vat.reverse': 'Reverse charge',
	'vat.kunstnermoms': 'Artist VAT',

	// Templates
	'template.minimalist': 'Minimalist',
	'template.modern': 'Modern',

	// Buttons
	'button.downloadPdf': 'Download PDF',
	'button.reset': 'Reset form',
	'button.addLine': 'Add line',

	// Validation messages
	'validation.nameRequired': 'Name is required',
	'validation.descriptionRequired': 'Description is required',
	'validation.quantityPositive': 'Quantity must be positive',
	'validation.unitPriceNonNegative': 'Unit price must not be negative',
	'validation.cvrFormat': 'CVR must be 8 digits',
	'validation.eanFormat': 'EAN number is invalid',
	'validation.emailFormat': 'Invalid email',
	'validation.regNrFormat': 'Registration number must be 4 digits',
	'validation.kontonrFormat': 'Account number is invalid (modulus-11 check failed)',
	'validation.mobilepayFormat': 'MobilePay number is invalid',
	'validation.dueDateAfterIssue': 'Due date must be after the invoice date',
	'validation.dateRequired': 'Date must not be empty',
	'validation.dateInvalid': 'Invalid date',
	'validation.atLeastOneItem': 'Add at least one line item',
	'validation.sellerCvrMissing': 'Seller is missing a CVR for standard VAT',
	'validation.title': 'Please review the following:'
};

/** Map of all known locales to their message catalogs. */
export const catalogs: Record<InvoiceLanguage, MessageCatalog> = { da, en };

/** All locales the application supports. */
export const SUPPORTED_LOCALES: readonly InvoiceLanguage[] = ['da', 'en'];

/**
 * Return a translation function bound to the supplied locale.
 *
 * `t(key)` returns the localized string for the key. When the key is missing
 * it returns the key itself — this surfaces missing translations during
 * development without throwing at runtime.
 */
export function createTranslator(locale: InvoiceLanguage): (key: string) => string {
	const catalog = catalogs[locale] ?? catalogs.da;
	return function t(key: string): string {
		return catalog[key] ?? key;
	};
}

/**
 * Read the persisted locale preference, falling back to Danish when unset or
 * invalid. Safe to call during SSR (returns the default).
 */
export function getStoredLocale(): InvoiceLanguage {
	if (typeof localStorage === 'undefined') return 'da';
	try {
		const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
		if (raw === 'da' || raw === 'en') return raw;
	} catch {
		// ignore
	}
	return 'da';
}

/** Persist the chosen locale so it survives reloads. No-op on SSR. */
export function setStoredLocale(locale: InvoiceLanguage): void {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(LOCALE_STORAGE_KEY, locale);
	} catch {
		// ignore
	}
}
