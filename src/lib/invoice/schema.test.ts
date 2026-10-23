import assert from 'node:assert/strict';
import { InvoiceDataSchema } from './schema';
import { createDefaultInvoice } from './defaults';

const valid = () => ({
	...createDefaultInvoice(),
	seller: { name: 'Eksempel Studio ApS', cvr: '12345678' },
	buyer: { name: 'Testkunde ApS' },
	items: [{ description: 'Rådgivning', quantity: 2, unit: 'stk', unitPrice: 500, vatRate: 0.25 }]
});

const invoice = valid();
assert.equal(InvoiceDataSchema.safeParse(invoice).success, true);
assert.equal(InvoiceDataSchema.safeParse({ ...invoice, deliveryDate: '' }).success, true);
assert.equal(
	InvoiceDataSchema.safeParse({ ...invoice, seller: { name: '  ', cvr: '12345678' } }).success,
	false
);
assert.equal(InvoiceDataSchema.safeParse({ ...invoice, invoiceNumber: '  ' }).success, false);
assert.equal(
	InvoiceDataSchema.safeParse({
		...invoice,
		items: [{ ...invoice.items[0], description: '  ' }]
	}).success,
	false
);
assert.equal(InvoiceDataSchema.safeParse({ ...invoice, dueDate: '2020-01-01' }).success, false);
assert.equal(InvoiceDataSchema.safeParse({ ...invoice, seller: { name: 'Test' } }).success, false);
assert.equal(
	InvoiceDataSchema.safeParse({
		...invoice,
		vatMode: 'ikke_momsregistreret',
		seller: { name: 'Test' }
	}).success,
	true
);
assert.equal(
	InvoiceDataSchema.safeParse({
		...invoice,
		vatMode: 'reverse',
		buyer: { name: 'EU customer', cvr: 'SE 1234567890' }
	}).success,
	true
);
assert.equal(
	InvoiceDataSchema.safeParse({
		...invoice,
		buyer: { name: 'EU customer', cvr: 'NOT-A-VAT-NUMBER' }
	}).success,
	false
);
assert.equal(
	InvoiceDataSchema.safeParse({
		...invoice,
		items: [{ ...invoice.items[0], quantity: undefined }]
	}).success,
	false
);
assert.equal(
	InvoiceDataSchema.safeParse({
		...invoice,
		items: [{ ...invoice.items[0], discount: 101 }]
	}).success,
	false
);
console.log('12 invoice schema regression checks passed.');
