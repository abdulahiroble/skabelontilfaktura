/**
 * Danish-specific validation helpers and formatters.
 *
 * The functions here are pure and free of side effects so they can be reused
 * both inside Zod refinements and directly in UI components.
 */
import type { Currency, InvoiceLanguage } from './types';

/**
 * Danish bank account number (kontonummer) modulus-11 check.
 *
 * The algorithm uses weights [2,3,4,5,6,7] applied right-to-left on the digits
 * of the account number (excluding the final check digit). The weighted sum,
 * divided by 11, must leave a remainder equal to (11 - checkDigit) mod 11.
 *
 * Account numbers can be 7-14 digits; the check digit is the last digit.
 */
export function validateKontonr(account: string): boolean {
	if (!account) return false;
	const digits = account.replace(/\D/g, '');
	// Danish bank account numbers are between 7 and 14 digits.
	if (digits.length < 7 || digits.length > 14) return false;

	const checkDigit = Number(digits[digits.length - 1]);
	const payload = digits.slice(0, -1);
	const weights = [2, 3, 4, 5, 6, 7];

	let sum = 0;
	for (let i = 0; i < payload.length; i++) {
		// Walk the payload right-to-left and cycle through the weights.
		const digit = Number(payload[payload.length - 1 - i]);
		const weight = weights[i % weights.length];
		sum += digit * weight;
	}

	const remainder = sum % 11;
	const expected = (11 - remainder) % 11;
	return expected === checkDigit;
}

/**
 * Danish bank registration number (registreringsnummer) — exactly 4 digits.
 */
export function validateRegNr(reg: string): boolean {
	if (!reg) return false;
	return /^\d{4}$/.test(reg);
}

/**
 * Danish CVR number — exactly 8 digits. (The CVR modulus-11 check is intentionally
 * not applied here because real-world CVRs occasionally fail it; format-only is
 * the conventional check for UI validation.)
 */
export function validateCvr(cvr: string): boolean {
	if (!cvr) return false;
	return /^\d{8}$/.test(cvr);
}

/**
 * EAN/GLN number — 13 digits with a GLN (mod 10) check digit.
 */
export function validateEan(ean: string): boolean {
	if (!ean) return false;
	if (!/^\d{13}$/.test(ean)) return false;

	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const digit = Number(ean[i]);
		// Odd positions (1-indexed) have weight 1, even positions have weight 3.
		sum += i % 2 === 0 ? digit : digit * 3;
	}

	const checkDigit = (10 - (sum % 10)) % 10;
	return checkDigit === Number(ean[12]);
}

/**
 * MobilePay / Danish phone number. Accepts either 8 digits, or international
 * format +45 followed by 8 digits.
 */
export function validateMobilePay(phone: string): boolean {
	if (!phone) return false;
	return /^(?:\+45)?\s?\d{8}$/.test(phone.replace(/\s+/g, ''));
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Format a numeric amount as a localized currency string.
 *
 * - DKK + da: "1.234,56 kr."
 * - DKK + en: "kr. 1,234.56"
 * - EUR + da: "1.234,56 €"
 * - EUR + en: "€1,234.56"
 * - USD + da: "1.234,56 $"
 * - USD + en: "$1,234.56"
 */
export function formatCurrency(
	amount: number,
	currency: Currency,
	language: InvoiceLanguage
): string {
	if (!Number.isFinite(amount)) return '';

	const safeAmount = Number.isNaN(amount) ? 0 : amount;

	if (language === 'da') {
		// Danish convention: period as thousands separator, comma as decimal separator.
		const formatted = formatDaNumber(safeAmount);
		switch (currency) {
			case 'DKK':
				return `${formatted} kr.`;
			case 'EUR':
				return `${formatted} €`;
			case 'USD':
				return `${formatted} $`;
		}
	}

	// English convention: comma as thousands separator, period as decimal separator.
	const formatted = formatEnNumber(safeAmount);
	switch (currency) {
		case 'DKK':
			return `kr. ${formatted}`;
		case 'EUR':
			return `€${formatted}`;
		case 'USD':
			return `$${formatted}`;
	}
}

function formatDaNumber(value: number): string {
	const fixed = value.toFixed(2);
	const [integer, fraction] = fixed.split('.');
	const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return `${withThousands},${fraction}`;
}

function formatEnNumber(value: number): string {
	const fixed = value.toFixed(2);
	const [integer, fraction] = fixed.split('.');
	const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	return `${withThousands}.${fraction}`;
}
