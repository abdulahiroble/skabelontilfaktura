/**
 * Generates the free downloadable invoice templates served from /templates/.
 *
 * Outputs:
 *   static/templates/faktura-skabelon.docx  – Word template (OOXML)
 *   static/templates/faktura-skabelon.xlsx  – Excel template with moms formulas
 *   static/templates/faktura-skabelon.pdf   – Print-ready PDF template
 *
 * The OOXML files are assembled by hand and zipped with the system `zip`
 * binary, so the script has no npm dependencies. Run: node scripts/generate-templates.mjs
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = new URL('../static/templates/', import.meta.url).pathname;
const TODAY = 'DD.MM.ÅÅÅÅ';

/* ---------- shared invoice copy (Danish, lovkrav-compliant fields) ---------- */

const LINE_ROWS = [
	['Arbejde - beskrivelse', '1', 'tim', '0,00', '0,00'],
	['Materialer - beskrivelse', '1', 'stk', '0,00', '0,00']
];

/* ---------- DOCX ---------- */

function docxTable(rows, { header = [], widths = [], boldLastRow = false } = {}) {
	const border = (edge) => `<w:${edge} w:val="single" w:sz="4" w:space="0" w:color="999999"/>`;
	const borders = [border('top'), border('left'), border('bottom'), border('right')].join('');
	const cell = (text, { bold = false, align = 'left' } = {}, widthCm) => `\
<w:tc>
	<w:tcPr>
		${widthCm ? `<w:tcW w:w="${Math.round(widthCm * 567)}" w:type="dxa"/>` : ''}
		<w:tcBorders>${borders}</w:tcBorders>
		<w:vAlign w:val="center"/>
	</w:tcPr>
	<w:p>
		<w:pPr>${align === 'right' ? '<w:jc w:val="right"/>' : ''}</w:pPr>
		<w:r>${bold ? '<w:rPr><w:b/></w:rPr>' : ''}<w:t xml:space="preserve">${text}</w:t></w:r>
	</w:p>
</w:tc>`;

	const headerRow = header.length
		? `<w:tr>${header
				.map((h, i) => cell(h, { bold: true, align: i > 0 ? 'right' : 'left' }, widths[i]))
				.join('')}</w:tr>`
		: '';

	const bodyRows = rows
		.map(
			(row, ri) =>
				`<w:tr>${row
					.map((c, ci) =>
						cell(
							c,
							{
								bold: boldLastRow && ri === rows.length - 1,
								align: ci > 0 ? 'right' : 'left'
							},
							widths[ci]
						)
					)
					.join('')}</w:tr>`
		)
		.join('');

	return `<w:tbl>
	<w:tblPr><w:tblBorders>${borders}</w:tblBorders></w:tblPr>
	${headerRow}${bodyRows}
</w:tbl>`;
}

function paragraph(text, { size = 22, bold = false, spaceAfter = 120 } = {}) {
	return `\
<w:p>
	<w:pPr><w:spacing w:after="${spaceAfter}"/></w:pPr>
	<w:r>
		<w:rPr>${bold ? '<w:b/>' : ''}<w:sz w:val="${size}"/></w:rPr>
		<w:t xml:space="preserve">${text}</w:t>
	</w:r>
</w:p>`;
}

function buildDocx() {
	const lineTable = docxTable(LINE_ROWS, {
		header: ['Beskrivelse', 'Antal', 'Enhed', 'Enhedspris (kr.)', 'Beløb (kr.)'],
		widths: [6, 1.6, 1.6, 2.6, 2.6]
	});

	const totals = docxTable(
		[
			['Subtotal ekskl. moms (kr.)', '0,00'],
			['Moms 25% (kr.)', '0,00'],
			['Total inkl. moms (kr.)', '0,00']
		],
		{ widths: [4, 3], boldLastRow: true }
	);

	const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
	<w:body>
		${paragraph('FAKTURA', { size: 48, bold: true, spaceAfter: 240 })}
		${paragraph(`Fakturanummer: 0001        Fakturadato: ${TODAY}        Forfaldsdato: ${TODAY} + 30 dage`)}
		${paragraph('SÆLGER (udsteder)', { bold: true })}
		${paragraph('Virksomhedsnavn\\nAdresse, Postnr. og by\\nCVR-nummer\\nTelefon / E-mail')}
		${paragraph('KØBER (modtager)', { bold: true })}
		${paragraph('Navn / Virksomhedsnavn\\nAdresse, Postnr. og by\\nCVR-nummer')}
		${paragraph('FAKTURALINJER', { bold: true })}
		${lineTable}
		${totals}
		${paragraph('BETALINGSOPLYSNINGER', { bold: true })}
		${paragraph('Regnummer: 0000    Kontonummer: 0000000000    MobilePay: 00 00 00 00')}
		${paragraph('Betalingsbetingelser: Betaling senest 30 dage efter fakturadato.')}
		${paragraph('Er du momsregistreret, skal momsen beregnes (normalt 25%). Er du momsfritaget, sættes moms til 0 kr., og "Moms 25%" ændres til "Moms (0% - momsfritaget)". Fakturanummeret skal være fortløbende og må kun bruges én gang.', { size: 18 })}
	</w:body>
</w:document>`;

	const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
	<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
	<Default Extension="xml" ContentType="application/xml"/>
	<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

	const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

	return [
		{ path: '[Content_Types].xml', data: contentTypes },
		{ path: '_rels/.rels', data: rels },
		{ path: 'word/document.xml', data: document }
	];
}

/* ---------- XLSX ---------- */

function buildXlsx() {
	// Cell map for sheet1. Keys are A1-style refs.
	const cells = new Map();
	const put = (ref, value, style = {}) => cells.set(ref, { value, ...style });

	put('A1', 'FAKTURA', { bold: true, size: 16 });
	put('A3', 'Fakturanummer:', { bold: true });
	put('B3', '0001');
	put('C3', 'Fakturadato:', { bold: true });
	put('D3', TODAY);
	put('E3', 'Forfaldsdato:', { bold: true });
	put('F3', TODAY);

	put('A5', 'SÆLGER (udsteder)', { bold: true });
	put('A6', 'Virksomhedsnavn');
	put('A7', 'Adresse');
	put('A8', 'Postnr. og by');
	put('A9', 'CVR-nummer');
	put('D5', 'KØBER (modtager)', { bold: true });
	put('D6', 'Navn / virksomhed');
	put('D7', 'Adresse');
	put('D8', 'Postnr. og by');
	put('D9', 'CVR-nummer');

	put('A11', 'Beskrivelse', { bold: true });
	put('B11', 'Antal', { bold: true });
	put('C11', 'Enhed', { bold: true });
	put('D11', 'Enhedspris (kr.)', { bold: true });
	put('E11', 'Beløb (kr.)', { bold: true });

	const firstLineRow = 12;
	LINE_ROWS.forEach((row, i) => {
		const r = firstLineRow + i;
		put(`A${r}`, row[0]);
		put(`B${r}`, row[1]);
		put(`C${r}`, row[2]);
		put(`D${r}`, row[3]);
		put(`E${r}`, `=B${r}*D${r}`, { format: '#,##0.00' });
	});
	const lastLineRow = firstLineRow + LINE_ROWS.length - 1;

	const subtotalRow = lastLineRow + 1;
	put(`D${subtotalRow}`, 'Subtotal ekskl. moms (kr.)', { bold: true });
	put(`E${subtotalRow}`, `=SUM(E${firstLineRow}:E${lastLineRow})`, {
		bold: true,
		format: '#,##0.00'
	});
	const momsRow = subtotalRow + 1;
	put(`D${momsRow}`, 'Moms 25% (kr.)', { bold: true });
	put(`E${momsRow}`, `=E${subtotalRow}*0.25`, { bold: true, format: '#,##0.00' });
	const totalRow = momsRow + 1;
	put(`D${totalRow}`, 'Total inkl. moms (kr.)', { bold: true });
	put(`E${totalRow}`, `=E${subtotalRow}+E${momsRow}`, { bold: true, format: '#,##0.00' });

	const payRow = totalRow + 2;
	put(`A${payRow}`, 'BETALINGSOPLYSNINGER', { bold: true });
	put(`A${payRow + 1}`, 'Regnummer');
	put(`B${payRow + 1}`, '0000');
	put(`A${payRow + 2}`, 'Kontonummer');
	put(`B${payRow + 2}`, '0000000000');
	put(`A${payRow + 3}`, 'MobilePay');
	put(`B${payRow + 3}`, '00 00 00 00');
	put(`A${payRow + 4}`, 'Betalingsbetingelse');
	put(`B${payRow + 4}`, 'Netto 30 dage');

	const noteRow = payRow + 6;
	put(
		`A${noteRow}`,
		'Er du momsfritaget, sættes momssatsen i cellen til venstre for "Moms 25%" til 0%. Fakturanumre skal være fortløbende.'
	);

	// Build sheet XML from the cell map, tracking the used range.
	const rowOf = (ref) => Number(ref.match(/\d+$/)[0]);
	const lastRow = Math.max(...[...cells.keys()].map(rowOf));

	const rowsXml = [];
	for (let r = 1; r <= lastRow; r++) {
		const rowCells = [...cells.entries()]
			.filter(([ref]) => rowOf(ref) === r)
			.map(([ref, cell]) => {
				const isFormula = String(cell.value).startsWith('=');
				const valueXml = isFormula ? `<f>${cell.value.slice(1)}</f>` : `<v>${cell.value}</v>`;
				return `<c r="${ref}"${cell.format ? ' s="1"' : ''}>${valueXml}</c>`;
			})
			.join('');
		rowsXml.push(`<row r="${r}">${rowCells}</row>`);
	}

	const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
	<sheetData>${rowsXml.join('')}</sheetData>
	<cols>
		<col min="1" max="1" width="38" customWidth="1"/>
		<col min="2" max="3" width="12" customWidth="1"/>
		<col min="4" max="6" width="18" customWidth="1"/>
	</cols>
</worksheet>`;

	const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
	<sheets><sheet name="Faktura" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

	const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`;

	const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
	<numFmts count="1"><numFmt numFmtId="164" formatCode="#,##0.00"/></numFmts>
	<cellXfs count="2"><xf numFmtId="0"/><xf numFmtId="164" applyNumberFormat="1"/></cellXfs>
</styleSheet>`;

	const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
	<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
	<Default Extension="xml" ContentType="application/xml"/>
	<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
	<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
	<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

	const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
	<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

	return [
		{ path: '[Content_Types].xml', data: contentTypes },
		{ path: '_rels/.rels', data: rels },
		{ path: 'xl/workbook.xml', data: workbook },
		{ path: 'xl/_rels/workbook.xml.rels', data: workbookRels },
		{ path: 'xl/worksheets/sheet1.xml', data: sheet },
		{ path: 'xl/styles.xml', data: styles }
	];
}

/* ---------- PDF ---------- */

/** Escape text for PDF literal-string output. */
function pdfEscape(text) {
	return text
		.replaceAll('\\', '\\\\')
		.replaceAll('(', '\\(')
		.replaceAll(')', '\\)')
		.replaceAll(/[^\x20-\x7E]/g, (ch) =>
			/[åæøÅÆØ]/.test(ch)
				? { å: '\u00e5', æ: '\u00e6', ø: '\u00f8', Å: '\u00c5', Æ: '\u00c6', Ø: '\u00d8' }[
						ch
					].replace(/./u, (c) => `\\${c.charCodeAt(0).toString(8).padStart(3, '0')}`)
				: ''
		);
}

function buildPdf() {
	// Danish letters are octal-escaped in WinAnsi so a standard font works.
	const esc = (s) =>
		pdfEscape(s)
			.replace(/å/g, '\\345')
			.replace(/æ/g, '\\346')
			.replace(/ø/g, '\\370')
			.replace(/Å/g, '\\305')
			.replace(/Æ/g, '\\306')
			.replace(/Ø/g, '\\330');

	const ops = [];
	const text = (x, y, size, font, str, gray = 0) =>
		ops.push(
			`BT /${font} ${size} Tf ${gray === 0 ? '' : `${gray} g `}${x} ${y} Td (${esc(str)}) Tj ET`
		);
	const line = (x1, y1, x2, y2, gray = 0.6) =>
		ops.push(`${gray} G 0.8 w ${x1} ${y1} m ${x2} ${y2} l S`);

	// Header
	text(57, 790, 22, 'F2', 'FAKTURA');
	text(400, 790, 10, 'F1', `Fakturanummer: 0001`);
	text(400, 776, 10, 'F1', `Fakturadato: ${TODAY}`);
	text(400, 762, 10, 'F1', `Forfaldsdato: +30 dage`);
	line(57, 750, 538, 750);

	// Seller / buyer blocks
	text(57, 722, 11, 'F2', 'SÆLGER (udsteder)');
	text(300, 722, 11, 'F2', 'KØBER (modtager)');
	const seller = ['Virksomhedsnavn', 'Adresse', 'Postnr. og by', 'CVR-nummer'];
	seller.forEach((s, i) => {
		text(57, 704 - i * 14, 10, 'F1', s, 0.35);
		text(300, 704 - i * 14, 10, 'F1', s, 0.35);
	});

	// Line-item table
	const tableTop = 600;
	const headers = ['Beskrivelse', 'Antal', 'Enhed', 'Pris (kr.)', 'Beløb (kr.)'];
	const cols = [57, 320, 370, 415, 475];
	text(cols[0], tableTop, 10, 'F2', headers[0]);
	text(cols[1], tableTop, 10, 'F2', headers[1]);
	text(cols[2], tableTop, 10, 'F2', headers[2]);
	text(cols[3], tableTop, 10, 'F2', headers[3]);
	text(cols[4], tableTop, 10, 'F2', headers[4]);
	line(57, tableTop - 8, 538, tableTop - 8);
	LINE_ROWS.forEach((row, i) => {
		const y = tableTop - 26 - i * 18;
		text(cols[0], y, 10, 'F1', row[0], 0.25);
		text(cols[1], y, 10, 'F1', row[1], 0.25);
		text(cols[2], y, 10, 'F1', row[2], 0.25);
		text(cols[3], y, 10, 'F1', row[3], 0.25);
		text(cols[4], y, 10, 'F1', row[4], 0.25);
	});

	// Totals
	const totalsY = tableTop - 80;
	const totals = [
		['Subtotal ekskl. moms (kr.)', '0,00'],
		['Moms 25% (kr.)', '0,00'],
		['Total inkl. moms (kr.)', '0,00']
	];
	totals.forEach(([label, value], i) => {
		const y = totalsY - i * 16;
		const font = i === 2 ? 'F2' : 'F1';
		text(340, y, 10, font, label);
		text(475, y, 10, font, value);
	});
	line(340, totalsY - 3 * 16 + 8, 538, totalsY - 3 * 16 + 8);

	// Payment block
	const payY = totalsY - 3 * 16 - 20;
	text(57, payY, 11, 'F2', 'BETALINGSOPLYSNINGER');
	text(
		57,
		payY - 16,
		10,
		'F1',
		'Regnummer: 0000    Kontonummer: 0000000000    MobilePay: 00 00 00 00',
		0.35
	);
	text(57, payY - 32, 10, 'F1', 'Betaling senest 30 dage efter fakturadato.', 0.35);

	text(
		57,
		60,
		8,
		'F1',
		'Momsfritaget? Sæt moms til 0 kr. og skriv "Moms (0% - momsfritaget)". Fakturanumre skal være fortløbende.',
		0.45
	);

	const content = ops.join('\n');

	// Minimal PDF: catalog, pages, one page, two fonts, one content stream.
	const objects = [];
	const add = (body) => objects.push(body);
	// 1: Catalog, 2: Pages, 3: Page, 4: F1 (Helvetica), 5: F2 (Helvetica-Bold), 6: Contents
	add('<< /Type /Catalog /Pages 2 0 R >>');
	add('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
	add(
		'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>'
	);
	add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
	add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
	add(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

	let pdf = '%PDF-1.4\n';
	const offsets = [0];
	objects.forEach((body, i) => {
		offsets.push(pdf.length);
		pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
	});
	const xrefStart = pdf.length;
	pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (let i = 1; i <= objects.length; i++) {
		pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
	}
	pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
	return pdf;
}

/* ---------- write ---------- */

function writeZip(name, files) {
	const staging = join(OUT_DIR, `.${name}.staging`);
	rmSync(staging, { recursive: true, force: true });
	mkdirSync(staging, { recursive: true });
	for (const file of files) {
		const fullPath = join(staging, file.path);
		mkdirSync(join(fullPath, '..'), { recursive: true });
		writeFileSync(fullPath, file.data);
	}
	// -X keeps the zip free of platform extras; mimetype-like ordering is not
	// required for OOXML (unlike ODF/EPUB).
	execFileSync('zip', ['-r', '-X', '-q', join(OUT_DIR, name), '.'], { cwd: staging });
	rmSync(staging, { recursive: true, force: true });
	console.log(`wrote static/templates/${name}`);
}

mkdirSync(OUT_DIR, { recursive: true });
writeZip('faktura-skabelon.docx', buildDocx());
writeZip('faktura-skabelon.xlsx', buildXlsx());
writeFileSync(join(OUT_DIR, 'faktura-skabelon.pdf'), buildPdf(), 'latin1');
console.log('wrote static/templates/faktura-skabelon.pdf');
