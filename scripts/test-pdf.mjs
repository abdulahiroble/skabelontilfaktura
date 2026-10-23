import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';
import { PDFDocument } from 'pdf-lib';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const output = await mkdtemp(join(tmpdir(), 'faktura-pdf-'));
try {
	const { renderInvoicePdf } = await server.ssrLoadModule('/src/lib/pdf/renderer.ts');
	const invoice = {
		invoiceNumber: '2026-0042',
		series: '2026',
		issueDate: '2026-10-23',
		dueDate: '2026-10-31',
		seller: {
			name: 'Nordlys Studio',
			address: 'Frederiksgade 12',
			postalCode: '8000',
			city: 'Aarhus C',
			cvr: '46295218'
		},
		buyer: {
			name: 'Klar Media ApS',
			address: 'Ryesgade 10',
			postalCode: '2200',
			city: 'København N'
		},
		items: [
			{ description: 'Grafisk design', quantity: 4, unit: 'timer', unitPrice: 750, vatRate: 0.25 },
			{ description: 'Rådgivning', quantity: 2, unit: 'timer', unitPrice: 600, vatRate: 0.25 }
		],
		language: 'da',
		currency: 'DKK',
		vatMode: 'standard',
		template: 'minimalist',
		paymentTerms: 'Netto 8 dage'
	};
	const standard = await renderInvoicePdf(invoice);
	const compressed = await renderInvoicePdf(invoice, { useObjectStreams: true });
	assert.equal((await PDFDocument.load(standard)).getPageCount(), 1);
	assert.equal((await PDFDocument.load(compressed)).getPageCount(), 1);
	assert.ok(compressed.length < standard.length);
	await writeFile(join(output, 'reference.pdf'), standard);
	for (const [name, changes] of Object.entries({
		english: {
			language: 'en',
			currency: 'EUR',
			template: 'modern',
			brandColor: '#171717',
			isProforma: true
		},
		credit: {
			isCreditNote: true,
			creditNoteRef: '2026-0001',
			items: [{ ...invoice.items[0], quantity: -1 }]
		},
		long: {
			items: Array.from({ length: 80 }, (_, i) => ({
				...invoice.items[0],
				description: `Service ${i + 1} - en længere beskrivelse af leverancen med detaljer og dokumentation`,
				discount: 10
			})),
			notes: 'Betalingsoplysninger og vilkår. '.repeat(200)
		},
		reverse: { vatMode: 'reverse' },
		noVat: { vatMode: 'ikke_momsregistreret' },
		exempt: { vatMode: 'momsfritaget' },
		artist: { vatMode: 'kunstnermoms' }
	})) {
		const bytes = await renderInvoicePdf({ ...invoice, ...changes });
		const doc = await PDFDocument.load(bytes);
		assert.ok(doc.getPageCount() >= 1);
		if (name === 'long') assert.ok(doc.getPageCount() > 2);
		await writeFile(join(output, `${name}.pdf`), bytes);
	}
	await assert.rejects(() => renderInvoicePdf({ ...invoice, seller: { name: 'Missing CVR' } }));
	console.log(`PDF checks passed. Visual fixtures: ${output}`);
} finally {
	await server.close();
}
