/**
 * Client-side PDF renderer for the free-tier invoice generator.
 *
 * Uses `pdf-lib` with the built-in `StandardFonts.Helvetica` family. Helvetica's
 * WinAnsi encoding includes the Danish characters æøåÆØÅ (and §, €), so no custom
 * font files are required. The output is **true text** — every label and value is
 * drawn with `page.drawText()` so it remains selectable and searchable.
 *
 * The single exported function is **pure**: it accepts an `InvoiceData` snapshot
 * and resolves to a `Uint8Array` of PDF bytes. It performs no I/O and mutates no
 * shared state, making it safe to call from a click handler in the browser.
 *
 * Layout is computed top-down on an A4 page (595.28 × 841.89 pt). The renderer
 * paginates automatically when the content overflows the bottom margin.
 */
import {
	PDFDocument,
	StandardFonts,
	rgb,
	type PDFFont,
	type PDFImage,
	type PDFPage,
	type RGB
} from 'pdf-lib';
import type { InvoiceData, InvoiceItem, InvoiceLanguage, InvoiceParty } from '$lib/invoice/types';
import { calcLineTotal, calculateTotals } from '$lib/invoice/moms';
import { formatCurrency, validateCvr } from '$lib/invoice/validation';

/* -------------------------------------------------------------------------- */
/* Page geometry                                                              */
/* -------------------------------------------------------------------------- */

/** A4 page size in PDF points (1/72 inch). */
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;

/** Uniform side margin in points. */
const MARGIN = 40;

/** Right edge of the content area. */
const RIGHT_EDGE = PAGE_WIDTH - MARGIN;

/** Usable content width. */
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Height of the accent bar drawn at the top of the "modern" template. */
const ACCENT_BAR_HEIGHT = 6;

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

const SIZE_TITLE = 24;
const SIZE_BODY = 10;
const SIZE_TABLE_HEADER = 7;
const SIZE_TABLE_BODY = 10;
const SIZE_SMALL = 8;

const LINE_GAP = 4;
const SECTION_GAP = 30;

/* -------------------------------------------------------------------------- */
/* Colors                                                                     */
/* -------------------------------------------------------------------------- */

const TEXT = rgb(0.145, 0.145, 0.145);
const MUTED = rgb(0.38, 0.38, 0.38);
const DIVIDER = rgb(0.85, 0.87, 0.9);
const TABLE_HEADER_BG = rgb(0.957, 0.957, 0.949);
const FALLBACK_BRAND = TEXT;

/** Fallback accent bar color for the "modern" template when no brand color set. */
const MODERN_ACCENT_FALLBACK = rgb(0.957, 0.318, 0.071);

/* -------------------------------------------------------------------------- */
/* Label dictionaries (Danish / English)                                      */
/* -------------------------------------------------------------------------- */

interface Labels {
	invoice: string;
	proforma: string;
	creditNote: string;
	proformaNote: string;
	invoiceNumber: string;
	date: string;
	dueDate: string;
	deliveryDate: string;
	seller: string;
	buyer: string;
	description: string;
	quantity: string;
	unitPrice: string;
	amount: string;
	subtotal: string;
	vat: string;
	total: string;
	paymentTerms: string;
	regNr: string;
	accountNo: string;
	mobilepay: string;
	bankAccount: string;
	cvr: string;
	ean: string;
	notes: string;
	creditNoteRef: string;
	paymentReference: string;
}

const LABELS: Record<InvoiceLanguage, Labels> = {
	da: {
		invoice: 'FAKTURA',
		proforma: 'PROFORMAFAKTURA',
		creditNote: 'KREDITNOTA',
		proformaNote: 'Proformafaktura - ikke en regning',
		invoiceNumber: 'Fakturanr.',
		date: 'Fakturadato',
		dueDate: 'Forfaldsdato',
		deliveryDate: 'Leveringsdato',
		seller: 'Sælger',
		buyer: 'Køber (modtager)',
		description: 'Beskrivelse',
		quantity: 'Antal',
		unitPrice: 'Enhedspris',
		amount: 'Beløb',
		subtotal: 'Subtotal (ekskl. moms)',
		vat: 'Moms',
		total: 'Total',
		paymentTerms: 'Betalingsbetingelser',
		regNr: 'Reg.nr.',
		accountNo: 'Kontonr.',
		mobilepay: 'MobilePay',
		bankAccount: 'Bankkonto',
		cvr: 'CVR',
		ean: 'EAN',
		notes: 'Noter',
		creditNoteRef: 'Kreditnota vedrører faktura',
		paymentReference: 'Angiv fakturanr. {invoiceNumber} ved bankoverførsel.'
	},
	en: {
		invoice: 'INVOICE',
		proforma: 'PROFORMA INVOICE',
		creditNote: 'CREDIT NOTE',
		proformaNote: 'Pro forma invoice - not a demand for payment',
		invoiceNumber: 'Invoice number',
		date: 'Date',
		dueDate: 'Due date',
		deliveryDate: 'Delivery date',
		seller: 'Seller',
		buyer: 'Buyer',
		description: 'Description',
		quantity: 'Qty',
		unitPrice: 'Unit price',
		amount: 'Amount',
		subtotal: 'Subtotal',
		vat: 'VAT',
		total: 'Total',
		paymentTerms: 'Payment terms',
		regNr: 'Reg. no.',
		accountNo: 'Account no.',
		mobilepay: 'MobilePay',
		bankAccount: 'Bank account',
		cvr: 'VAT no.',
		ean: 'EAN',
		notes: 'Notes',
		creditNoteRef: 'Credit note for invoice',
		paymentReference: 'Use invoice no. {invoiceNumber} as the bank transfer reference.'
	}
};

/* -------------------------------------------------------------------------- */
/* Mutable render context                                                     */
/* -------------------------------------------------------------------------- */

interface RenderCtx {
	doc: PDFDocument;
	font: PDFFont;
	bold: PDFFont;
	page: PDFPage;
	/** Current cursor measured from the top of the page, in points. */
	y: number;
	/** Top margin to apply when starting a fresh page (clears accent bar). */
	topInset: number;
	brand: RGB;
}

/* -------------------------------------------------------------------------- */
/* Pure helpers                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Parse a `#RRGGBB` (or `RRGGBB`) hex string into a pdf-lib `RGB` color.
 * Falls back to a professional dark blue when the input is missing or malformed.
 */
function parseBrandColor(hex: string | undefined): RGB {
	if (!hex) return FALLBACK_BRAND;
	const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
	if (!m) return FALLBACK_BRAND;
	const r = parseInt(m[1].slice(0, 2), 16) / 255;
	const g = parseInt(m[1].slice(2, 4), 16) / 255;
	const b = parseInt(m[1].slice(4, 6), 16) / 255;
	return rgb(r, g, b);
}

/** Decode a raw base64 string into a `Uint8Array` using the browser `atob`. */
function base64ToUint8Array(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

/**
 * Embed a logo from a `data:` URL (PNG or JPEG). Returns `null` when the URL is
 * absent, unrecognised, or fails to decode so callers can simply skip the logo.
 */
async function embedLogo(doc: PDFDocument, dataUrl: string | undefined): Promise<PDFImage | null> {
	if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;
	const comma = dataUrl.indexOf(',');
	if (comma === -1) return null;
	const isPng = /^data:image\/png/i.test(dataUrl);
	const isJpeg = /^data:image\/jpe?g/i.test(dataUrl);
	if (!isPng && !isJpeg) return null;
	try {
		const bytes = base64ToUint8Array(dataUrl.slice(comma + 1));
		return isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
	} catch {
		return null;
	}
}

/**
 * Word-wrap `text` into lines that each fit within `maxWidth` at the given font
 * size. Whitespace-only input yields an empty array.
 */
function wrapText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
	const clean = text.replace(/\s+/g, ' ').trim();
	if (!clean) return [];
	const words = clean.split(' ').flatMap((word) => {
		const chunks: string[] = [];
		let chunk = '';
		for (const char of word) {
			if (chunk && font.widthOfTextAtSize(chunk + char, size) > maxWidth) {
				chunks.push(chunk);
				chunk = '';
			}
			chunk += char;
		}
		if (chunk) chunks.push(chunk);
		return chunks;
	});
	const lines: string[] = [];
	let line = '';
	for (const word of words) {
		const candidate = line ? `${line} ${word}` : word;
		if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
			lines.push(line);
			line = word;
		} else {
			line = candidate;
		}
	}
	if (line) lines.push(line);
	return lines;
}

/** Render a quantity as an integer when whole, otherwise with 2 decimals. */
function formatQty(qty: number): string {
	return Number.isInteger(qty) ? String(qty) : qty.toFixed(2);
}

/**
 * Format an ISO date string per locale: Danish uses `dd.mm.yyyy`, English uses
 * `dd/mm/yyyy`. Falls back to the raw input when parsing fails.
 */
function formatDate(iso: string | undefined, language: InvoiceLanguage): string {
	if (!iso) return '';
	const date = new Date(`${iso}T00:00:00`);
	if (Number.isNaN(date.getTime())) return iso;
	const dd = String(date.getDate()).padStart(2, '0');
	const mm = String(date.getMonth() + 1).padStart(2, '0');
	const yyyy = date.getFullYear();
	return language === 'da' ? `${dd}.${mm}.${yyyy}` : `${dd}/${mm}/${yyyy}`;
}

/** Build the displayable address lines for an invoice party. */
function partyLines(
	party: InvoiceParty,
	labels: Labels,
	language: InvoiceLanguage,
	isSeller = false
): string[] {
	const lines: string[] = [];
	if (party.name) lines.push(party.name);
	if (party.address) lines.push(party.address);
	const cityLine = [party.postalCode, party.city].filter(Boolean).join(' ');
	if (cityLine) lines.push(cityLine);
	if (party.cvr) {
		const cvr = isSeller && language === 'en' ? `DK${party.cvr}` : party.cvr;
		const separator = language === 'da' ? ' ' : ': ';
		lines.push(`${labels.cvr}${separator}${cvr}`);
	}
	if (party.ean) lines.push(`${labels.ean}: ${party.ean}`);
	if (party.email) lines.push(party.email);
	if (party.phone) lines.push(party.phone);
	return lines;
}

/* -------------------------------------------------------------------------- */
/* Drawing primitives (operate on the context cursor)                         */
/* -------------------------------------------------------------------------- */

/** Draw left-aligned text at the given x, advancing the cursor by one line. */
function drawLine(
	ctx: RenderCtx,
	text: string,
	x: number,
	size: number,
	opts: { font?: PDFFont; color?: RGB; gap?: number } = {}
): void {
	if (!text) return;
	const { font = ctx.font, color = TEXT, gap = size + LINE_GAP } = opts;
	ctx.page.drawText(text, { x, y: PAGE_HEIGHT - ctx.y - size, size, font, color });
	ctx.y += gap;
}

/** Draw right-aligned text so its right edge lands at `rightX`. */
function drawLineRight(
	ctx: RenderCtx,
	text: string,
	rightX: number,
	size: number,
	opts: { font?: PDFFont; color?: RGB; gap?: number } = {}
): void {
	if (!text) return;
	const { font = ctx.font, color = TEXT, gap = size + LINE_GAP } = opts;
	const width = font.widthOfTextAtSize(text, size);
	ctx.page.drawText(text, { x: rightX - width, y: PAGE_HEIGHT - ctx.y - size, size, font, color });
	ctx.y += gap;
}

/**
 * Draw a block of left-aligned lines (optionally word-wrapped). Each visible
 * line advances the cursor. Used for party addresses and notes.
 */
function drawBlock(
	ctx: RenderCtx,
	lines: string[],
	x: number,
	size: number,
	color: RGB = TEXT,
	font: PDFFont = ctx.font
): void {
	for (const line of lines) {
		for (const wrapped of wrapText(
			font,
			line,
			size,
			x === MARGIN ? CONTENT_WIDTH : RIGHT_EDGE - x
		)) {
			ensureSpace(ctx, size + LINE_GAP);
			drawLine(ctx, wrapped, x, size, { font, color });
		}
	}
}

/** Draw a horizontal divider line spanning the content width. */
function drawDivider(ctx: RenderCtx): void {
	const y = PAGE_HEIGHT - ctx.y;
	ctx.page.drawLine({
		start: { x: MARGIN, y },
		end: { x: RIGHT_EDGE, y },
		thickness: 0.5,
		color: DIVIDER
	});
	ctx.y += 8;
}

/**
 * Ensure at least `needed` points remain before the bottom margin; otherwise
 * start a fresh page. Returns the (possibly new) context.
 */
function ensureSpace(ctx: RenderCtx, needed: number): void {
	if (ctx.y + needed > PAGE_HEIGHT - MARGIN) {
		addPage(ctx);
	}
}

/** Add a new page to the document and reset the cursor to the top inset. */
function addPage(ctx: RenderCtx): void {
	ctx.page = ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
	ctx.y = ctx.topInset;
}

/* -------------------------------------------------------------------------- */
/* Section renderers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Render the document title plus invoice meta block (top right).
 *
 * Operates directly on the supplied context cursor (treated as the right/meta
 * column); the caller reconciles this column's end-Y against the left/seller
 * column.
 */
function renderHeader(ctx: RenderCtx, data: InvoiceData, labels: Labels): void {
	const isCredit = data.isCreditNote === true;
	const isProforma = data.isProforma === true;
	const title = isCredit ? labels.creditNote : isProforma ? labels.proforma : labels.invoice;

	// Letter spacing is confined to the title; labels and values have separate columns.
	const titleSize = title.length > 12 ? 18 : SIZE_TITLE;
	const tracking = 2.5;
	const titleWidth = ctx.bold.widthOfTextAtSize(title, titleSize) + tracking * (title.length - 1);
	let titleX = RIGHT_EDGE - titleWidth;
	for (const char of title) {
		ctx.page.drawText(char, {
			x: titleX,
			y: PAGE_HEIGHT - ctx.y - titleSize,
			size: titleSize,
			font: ctx.bold,
			color: ctx.brand
		});
		titleX += ctx.bold.widthOfTextAtSize(char, titleSize) + tracking;
	}
	ctx.y += titleSize + 22;
	if (isProforma) drawLineRight(ctx, labels.proformaNote, RIGHT_EDGE, SIZE_SMALL, { color: MUTED });
	const meta = [
		[labels.invoiceNumber, data.invoiceNumber],
		[labels.date, formatDate(data.issueDate, data.language)],
		[labels.dueDate, formatDate(data.dueDate, data.language)]
	];
	if (data.deliveryDate)
		meta.push([labels.deliveryDate, formatDate(data.deliveryDate, data.language)]);
	if (isCredit && data.creditNoteRef) meta.push([labels.creditNoteRef, data.creditNoteRef]);
	for (const [label, value] of meta) {
		const valueLines = wrapText(ctx.font, value, SIZE_BODY, 75);
		const labelLines = wrapText(ctx.font, label, SIZE_BODY, 70);
		const top = ctx.y;
		drawBlock(ctx, labelLines, RIGHT_EDGE - 150, SIZE_BODY);
		ctx.y = top;
		for (const line of valueLines) drawLineRight(ctx, line, RIGHT_EDGE, SIZE_BODY);
		ctx.y = top + Math.max(labelLines.length, valueLines.length) * (SIZE_BODY + LINE_GAP) + 4;
	}
}

/** Render the seller block (top left), with an optional logo above it. */
function renderSeller(
	ctx: RenderCtx,
	logo: PDFImage | null,
	data: InvoiceData,
	labels: Labels
): void {
	if (logo) {
		// Scale so the logo is at most 140pt wide and 46pt tall, preserving ratio.
		const maxW = 140;
		const maxH = 46;
		const scale = Math.min(maxW / logo.width, maxH / logo.height, 1);
		const w = logo.width * scale;
		const h = logo.height * scale;
		ctx.page.drawImage(logo, { x: MARGIN, y: PAGE_HEIGHT - ctx.y - h, width: w, height: h });
		ctx.y += h + 10;
	}
	const lines = partyLines(data.seller, labels, data.language, true);
	if (lines.length) {
		for (const line of wrapText(ctx.bold, lines[0], SIZE_BODY, 240))
			drawLine(ctx, line, MARGIN, SIZE_BODY, { font: ctx.bold });
		for (const line of lines.slice(1)) {
			for (const part of wrapText(ctx.font, line, SIZE_BODY, 240))
				drawLine(ctx, part, MARGIN, SIZE_BODY);
		}
	}
}

/** Render the buyer block beneath the header area. */
function renderBuyer(ctx: RenderCtx, data: InvoiceData, labels: Labels): void {
	ensureSpace(ctx, 70);
	drawLine(ctx, labels.buyer.toUpperCase(), MARGIN, SIZE_SMALL, { color: MUTED });
	const lines = partyLines(data.buyer, labels, data.language);
	if (lines.length) {
		for (const line of wrapText(ctx.bold, lines[0], SIZE_BODY, 240))
			drawLine(ctx, line, MARGIN, SIZE_BODY, { font: ctx.bold });
		for (const line of lines.slice(1)) {
			for (const part of wrapText(ctx.font, line, SIZE_BODY, 240))
				drawLine(ctx, part, MARGIN, SIZE_BODY);
		}
	}
	ctx.y += SECTION_GAP;
}

/** Column x-positions for the line-items table. */
const COL_QTY = 337;
const COL_UNIT = 443;
const COL_AMOUNT = RIGHT_EDGE - 7;

/** Render the table header row. */
function drawTableHeader(ctx: RenderCtx, labels: Labels): void {
	const headerHeight = 30;
	ctx.page.drawRectangle({
		x: MARGIN,
		y: PAGE_HEIGHT - ctx.y - headerHeight,
		width: CONTENT_WIDTH,
		height: headerHeight,
		color: TABLE_HEADER_BG
	});
	ctx.y += 10;
	drawLine(ctx, labels.description.toUpperCase(), MARGIN + 7, SIZE_TABLE_HEADER, {
		font: ctx.bold,
		gap: 0
	});
	drawLineRight(ctx, labels.quantity.toUpperCase(), COL_QTY, SIZE_TABLE_HEADER, {
		font: ctx.bold,
		gap: 0
	});
	drawLineRight(ctx, labels.unitPrice.toUpperCase(), COL_UNIT, SIZE_TABLE_HEADER, {
		font: ctx.bold,
		gap: 0
	});
	drawLineRight(ctx, labels.amount.toUpperCase(), COL_AMOUNT, SIZE_TABLE_HEADER, {
		font: ctx.bold,
		gap: 0
	});
	ctx.y += headerHeight - 10;
}

/** Render the full line-items table with automatic pagination. */
function renderTable(
	ctx: RenderCtx,
	items: InvoiceItem[],
	data: InvoiceData,
	labels: Labels
): void {
	drawTableHeader(ctx, labels);
	const descMaxWidth = 240;

	for (const item of items) {
		const descLines = wrapText(ctx.font, item.description || '-', SIZE_TABLE_BODY, descMaxWidth);
		const maxLines = Math.floor(
			(PAGE_HEIGHT - MARGIN - ctx.topInset - 54) / (SIZE_TABLE_BODY + LINE_GAP)
		);
		const chunks: string[][] = [];
		for (let i = 0; i < descLines.length; i += maxLines)
			chunks.push(descLines.slice(i, i + maxLines));
		if (!chunks.length) chunks.push(['-']);
		for (const [chunkIndex, chunk] of chunks.entries()) {
			const rowHeight = chunk.length * (SIZE_TABLE_BODY + LINE_GAP) + 24;
			if (ctx.y + rowHeight > PAGE_HEIGHT - MARGIN) {
				addPage(ctx);
				drawTableHeader(ctx, labels);
			}
			const rowTop = ctx.y;
			ctx.y += 12;
			for (const line of chunk) drawLine(ctx, line, MARGIN + 7, SIZE_TABLE_BODY);
			if (chunkIndex === 0) {
				const lineTotal = calcLineTotal(item);
				// Numeric cells: drawn vertically centered-ish against the row top.
				const cellY = rowTop + 12;
				drawCellRight(ctx, `${formatQty(item.quantity)} ${item.unit || ''}`.trim(), COL_QTY, cellY);
				drawCellRight(
					ctx,
					formatCurrency(item.unitPrice, data.currency, data.language),
					COL_UNIT,
					cellY
				);
				drawCellRight(
					ctx,
					formatCurrency(lineTotal, data.currency, data.language),
					COL_AMOUNT,
					cellY,
					ctx.font
				);
			}
			ctx.y = rowTop + rowHeight;
		}
	}
	drawDivider(ctx);
}

/** Draw a single right-aligned numeric cell at an absolute top offset. */
function drawCellRight(
	ctx: RenderCtx,
	text: string,
	rightX: number,
	topY: number,
	font: PDFFont = ctx.font
): void {
	if (!text) return;
	const width = font.widthOfTextAtSize(text, SIZE_TABLE_BODY);
	ctx.page.drawText(text, {
		x: rightX - width,
		y: PAGE_HEIGHT - topY - SIZE_TABLE_BODY,
		size: SIZE_TABLE_BODY,
		font,
		color: TEXT
	});
}

/** Render the totals block (right-aligned) plus any special VAT-mode note. */
function renderTotals(ctx: RenderCtx, data: InvoiceData, labels: Labels): void {
	const totals = calculateTotals(data.items, data.vatMode);
	ensureSpace(ctx, 90);

	ctx.y += 12;
	const totalRow = (label: string, amount: number, bold = false) => {
		const font = bold ? ctx.bold : ctx.font;
		const size = bold ? 12 : SIZE_BODY;
		drawLine(ctx, label, 287, size, { font, gap: 0 });
		drawLineRight(ctx, formatCurrency(amount, data.currency, data.language), RIGHT_EDGE, size, {
			font,
			gap: 22
		});
	};
	totalRow(labels.subtotal, totals.subtotal);
	if (data.vatMode !== 'ikke_momsregistreret')
		totalRow(`${labels.vat} (${Math.round(totals.vatRate * 100)}%)`, totals.vatAmount);
	if (totals.label) {
		for (const line of wrapText(ctx.font, totals.label, SIZE_SMALL, RIGHT_EDGE - 287)) {
			drawLine(ctx, line, 287, SIZE_SMALL, { color: MUTED });
		}
	}
	ctx.page.drawLine({
		start: { x: 287, y: PAGE_HEIGHT - ctx.y },
		end: { x: RIGHT_EDGE, y: PAGE_HEIGHT - ctx.y },
		thickness: 0.5,
		color: DIVIDER
	});
	ctx.y += 12;
	totalRow(labels.total, totals.total, true);

	ctx.y += SECTION_GAP;
}

/** Render payment details, payment terms and notes (left-aligned). */
function renderFooterSections(ctx: RenderCtx, data: InvoiceData, labels: Labels): void {
	const hasBank = data.bankName || data.regNr || data.kontonr;
	const hasMobilepay = data.mobilepay;
	const hasTerms = data.paymentTerms;
	const hasNotes = data.notes && data.notes.trim();

	ensureSpace(ctx, 160);

	// Payment details column.
	if (hasBank || hasMobilepay) {
		drawLine(ctx, labels.bankAccount.toUpperCase(), MARGIN, SIZE_SMALL, { color: MUTED });
		if (data.bankName) {
			drawLine(ctx, data.bankName, MARGIN, SIZE_BODY, { font: ctx.bold });
		}
		if (data.regNr) {
			drawLine(ctx, `${labels.regNr} ${data.regNr}`, MARGIN, SIZE_BODY);
		}
		if (data.kontonr) {
			drawLine(ctx, `${labels.accountNo} ${data.kontonr}`, MARGIN, SIZE_BODY);
		}
		if (hasBank) {
			drawLine(
				ctx,
				labels.paymentReference.replace('{invoiceNumber}', data.invoiceNumber),
				MARGIN,
				SIZE_SMALL,
				{ color: MUTED }
			);
		}
		if (hasMobilepay) {
			drawLine(ctx, `${labels.mobilepay}: ${data.mobilepay}`, MARGIN, SIZE_BODY);
		}
		ctx.y += SECTION_GAP / 2;
	}

	if (hasTerms) {
		drawLine(ctx, `${labels.paymentTerms}:`, MARGIN, SIZE_BODY, { font: ctx.bold });
		const termLines = wrapText(ctx.font, data.paymentTerms!, SIZE_BODY, CONTENT_WIDTH);
		drawBlock(ctx, termLines, MARGIN, SIZE_BODY, TEXT);
		ctx.y += SECTION_GAP / 2;
	}

	if (hasNotes) {
		drawLine(ctx, labels.notes, MARGIN, SIZE_BODY, { font: ctx.bold });
		const noteLines = wrapText(ctx.font, data.notes!, SIZE_BODY, CONTENT_WIDTH);
		drawBlock(ctx, noteLines, MARGIN, SIZE_BODY, MUTED);
		ctx.y += SECTION_GAP / 2;
	}
}

/* -------------------------------------------------------------------------- */
/* Main entry point                                                           */
/* -------------------------------------------------------------------------- */

/** Optional rendering knobs exposed to callers of `renderInvoicePdf`. */
export interface RenderInvoicePdfOptions {
	/**
	 * When true, the output PDF uses object streams (cross-reference streams
	 * with compressed objects), producing a smaller file. This is pdf-lib's
	 * `save({ useObjectStreams: true })` option. Defaults to `false` to keep
	 * the standard output backwards-compatible and maximally parseable.
	 */
	useObjectStreams?: boolean;
}

/**
 * Render an invoice to a PDF byte array.
 *
 * @param data the invoice snapshot to render.
 * @param options optional rendering knobs (e.g. object-stream compression).
 * @returns a `Uint8Array` of PDF bytes, suitable for `new Blob([bytes], ...)`.
 */
export async function renderInvoicePdf(
	data: InvoiceData,
	options: RenderInvoicePdfOptions = {}
): Promise<Uint8Array> {
	if (data.vatMode === 'standard' && !validateCvr(data.seller.cvr ?? '')) {
		throw new Error('A valid seller CVR number is required for a standard VAT invoice.');
	}

	const doc = await PDFDocument.create();
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);

	const labels = LABELS[data.language] ?? LABELS.da;
	const brand = parseBrandColor(data.brandColor);
	const template = data.template ?? 'minimalist';
	const topInset = MARGIN + (template === 'modern' ? ACCENT_BAR_HEIGHT + 4 : 0);

	const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

	// Accent bar for the "modern" template.
	if (template === 'modern') {
		page.drawRectangle({
			x: 0,
			y: PAGE_HEIGHT - ACCENT_BAR_HEIGHT,
			width: PAGE_WIDTH,
			height: ACCENT_BAR_HEIGHT,
			color: data.brandColor ? brand : MODERN_ACCENT_FALLBACK
		});
	}

	const ctx: RenderCtx = { doc, font, bold, page, y: topInset, topInset, brand };

	// Header: logo + seller on the left, title + meta on the right.
	const logo = await embedLogo(doc, data.logoDataUrl);
	const sellerCtx: RenderCtx = { ...ctx, y: ctx.y };
	renderSeller(sellerCtx, logo, data, labels);
	renderHeader(ctx, data, labels);
	// Reconcile cursor with the seller column height.
	ctx.y = Math.max(ctx.y, sellerCtx.y) + 22;

	// Parties + table + totals.
	renderBuyer(ctx, data, labels);
	renderTable(ctx, data.items, data, labels);
	renderTotals(ctx, data, labels);
	renderFooterSections(ctx, data, labels);

	return doc.save({ useObjectStreams: options.useObjectStreams ?? false });
}
