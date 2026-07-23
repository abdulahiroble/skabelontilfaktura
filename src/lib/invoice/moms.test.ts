/**
 * Tests for the Danish VAT (moms) calculation engine.
 *
 * This is a self-contained test file with a tiny assert harness — no external
 * test runner required. Run directly with a TypeScript-aware runner, e.g.:
 *
 *     npx tsx src/lib/invoice/moms.test.ts
 *
 * Each test fails loudly by throwing; success prints a checkmark line.
 */
import type { InvoiceItem } from './types';
import {
	calcKunstnermoms,
	calcLineTotal,
	calcMomsfritaget,
	calcReverseCharge,
	calcStandard,
	calcSubtotal,
	calculateTotals,
	formatTotals
} from './moms';
import { formatCurrency } from './validation';

/* -------------------------------------------------------------------------- */
/* Minimal assert harness                                                     */
/* -------------------------------------------------------------------------- */

let passed = 0;
let failed = 0;

function approxEqual(a: number, b: number, epsilon = 1e-9): boolean {
	return Math.abs(a - b) <= epsilon;
}

function assertClose(
	actual: number,
	expected: number,
	labelOrEpsilon: string | number,
	label?: string
): void {
	const epsilon = typeof labelOrEpsilon === 'number' ? labelOrEpsilon : 1e-9;
	const name = typeof labelOrEpsilon === 'string' ? labelOrEpsilon : (label ?? '');
	if (approxEqual(actual, expected, epsilon)) {
		passed++;
		console.log(`  ok  ${name} (${actual})`);
	} else {
		failed++;
		console.error(`FAIL  ${name}: expected ${expected}, got ${actual}`);
		throw new Error(`Assertion failed: ${name}`);
	}
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
	if (Object.is(actual, expected)) {
		passed++;
		console.log(`  ok  ${label}`);
	} else {
		failed++;
		console.error(`FAIL  ${label}: expected ${String(expected)}, got ${String(actual)}`);
		throw new Error(`Assertion failed: ${label}`);
	}
}

function assertMatch(actual: string, pattern: RegExp, label: string): void {
	if (pattern.test(actual)) {
		passed++;
		console.log(`  ok  ${label} ("${actual}")`);
	} else {
		failed++;
		console.error(`FAIL  ${label}: "${actual}" did not match ${pattern}`);
		throw new Error(`Assertion failed: ${label}`);
	}
}

/* -------------------------------------------------------------------------- */
/* Fixtures                                                                   */
/* -------------------------------------------------------------------------- */

const item = (unitPrice: number, quantity = 1): InvoiceItem => ({
	description: 'Test item',
	quantity,
	unit: 'stk',
	unitPrice,
	vatRate: 0.25
});

const items1000: InvoiceItem[] = [item(1000)];

/* -------------------------------------------------------------------------- */
/* Tests                                                                      */
/* -------------------------------------------------------------------------- */

function testLineTotal(): void {
	console.log('calcLineTotal');
	assertClose(calcLineTotal(item(100, 2)), 200, 'quantity x unitPrice');
	const discounted: InvoiceItem = {
		description: 'Discounted',
		quantity: 1,
		unit: 'stk',
		unitPrice: 1000,
		vatRate: 0.25,
		discount: 10
	};
	assertClose(calcLineTotal(discounted), 900, '10% discount applied');
}

function testSubtotal(): void {
	console.log('calcSubtotal');
	assertClose(calcSubtotal([item(100), item(200), item(300)]), 600, 'sums line totals');
	assertClose(calcSubtotal([]), 0, 'empty list -> 0');
}

function testStandard(): void {
	console.log('calcStandard');
	const t = calcStandard(items1000);
	assertClose(t.subtotal, 1000, 'subtotal 1000');
	assertClose(t.vatAmount, 250, 'vat 250 (25%)');
	assertClose(t.total, 1250, 'total 1250');
	assertClose(t.vatRate, 0.25, 'vatRate 0.25');
}

function testKunstnermoms(): void {
	console.log('calcKunstnermoms');
	const t = calcKunstnermoms(items1000);
	assertClose(t.subtotal, 1000, 'subtotal/gross 1000');
	assertClose(t.taxableBase ?? -1, 200, 'taxableBase 200 (20%)');
	assertClose(t.exemptBase ?? -1, 800, 'exemptBase 800 (80%)');
	assertClose(t.vatAmount, 50, 'vat 50 (25% of 200)');
	assertClose(t.total, 1050, 'total 1050');
	assertEqual(typeof t.label, 'string', 'label is a string');
}

function testMomsfritaget(): void {
	console.log('calcMomsfritaget');
	const t = calcMomsfritaget(items1000);
	assertClose(t.subtotal, 1000, 'subtotal 1000');
	assertClose(t.vatRate, 0, 'vatRate 0');
	assertClose(t.vatAmount, 0, 'vat 0');
	assertClose(t.total, 1000, 'total 1000');
}

function testReverseCharge(): void {
	console.log('calcReverseCharge');
	const t = calcReverseCharge(items1000);
	assertClose(t.subtotal, 1000, 'subtotal 1000');
	assertClose(t.vatRate, 0, 'vatRate 0');
	assertClose(t.vatAmount, 0, 'vat 0');
	assertClose(t.total, 1000, 'total 1000');
}

function testEmptyItems(): void {
	console.log('empty items');
	for (const mode of ['standard', 'kunstnermoms', 'momsfritaget', 'reverse'] as const) {
		const t = calculateTotals([], mode);
		assertClose(t.subtotal, 0, `${mode}: subtotal 0`);
		assertClose(t.vatAmount, 0, `${mode}: vat 0`);
		assertClose(t.total, 0, `${mode}: total 0`);
	}
}

function testRounding(): void {
	console.log('rounding at display time');
	// 999.99 x 0.25 = 249.9975 — engine keeps full precision; display rounds.
	const t = calcStandard([item(999.99)]);
	assertClose(t.vatAmount, 249.9975, 1e-6, 'raw vat 249.9975 (not pre-rounded)');
	const formatted = formatCurrency(t.vatAmount, 'DKK', 'en');
	assertMatch(formatted, /^kr\. \d[\d,]*\.\d{2}$/, 'formatted to exactly 2 decimals');
}

function testDispatcher(): void {
	console.log('calculateTotals dispatch');
	assertClose(
		calculateTotals(items1000, 'standard').total,
		calcStandard(items1000).total,
		'standard'
	);
	assertClose(
		calculateTotals(items1000, 'kunstnermoms').total,
		calcKunstnermoms(items1000).total,
		'kunstnermoms'
	);
	assertClose(
		calculateTotals(items1000, 'momsfritaget').total,
		calcMomsfritaget(items1000).total,
		'momsfritaget'
	);
	assertClose(
		calculateTotals(items1000, 'reverse').total,
		calcReverseCharge(items1000).total,
		'reverse'
	);
	// Custom vatRate honored for standard, ignored for others.
	assertClose(calculateTotals(items1000, 'standard', 0).vatAmount, 0, 'standard 0% override');
	assertClose(
		calculateTotals(items1000, 'momsfritaget', 0.25).vatAmount,
		0,
		'momsfritaget ignores vatRate'
	);
}

function testFormatTotals(): void {
	console.log('formatTotals');
	const t = calcStandard(items1000);
	const da = formatTotals(t, 'DKK', 'da');
	assertEqual(da.subtotal.includes('1.000,00'), true, 'da subtotal formatted');
	assertEqual(da.vatRate, '25%', 'da vatRate "25%"');
	const en = formatTotals(t, 'EUR', 'en');
	assertEqual(en.total.includes('1,250.00'), true, 'en total formatted');
	assertEqual(en.vatRate, '25%', 'en vatRate "25%"');

	const k = formatTotals(calcKunstnermoms(items1000), 'DKK', 'da');
	assertEqual(k.taxableBase !== undefined, true, 'kunstnermoms taxableBase formatted');
	assertEqual(k.exemptBase !== undefined, true, 'kunstnermoms exemptBase formatted');
	assertEqual(k.label?.includes('Kunstnermoms'), true, 'kunstnermoms label present');
}

/* -------------------------------------------------------------------------- */
/* Runner                                                                     */
/* -------------------------------------------------------------------------- */

function main(): void {
	console.log('--- moms tests ---');
	testLineTotal();
	testSubtotal();
	testStandard();
	testKunstnermoms();
	testMomsfritaget();
	testReverseCharge();
	testEmptyItems();
	testRounding();
	testDispatcher();
	testFormatTotals();
	console.log('--- done ---');
	console.log(`passed=${passed} failed=${failed}`);
	if (failed > 0) {
		process.exit(1);
	}
}

main();
