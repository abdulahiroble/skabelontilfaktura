/**
 * Build the versioned, private download. Generation dependencies are isolated:
 * npm install --prefix tmp --ignore-scripts exceljs@4.4.0 docx@9.5.1
 * node scripts/generate-fakturapakke.mjs
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(`${root}tmp/package.json`);
const ExcelJS = require('exceljs');
const {
	Document,
	Packer,
	Paragraph,
	TextRun,
	Table,
	TableRow,
	TableCell,
	WidthType
} = require('docx');
const out = `${root}outputs/fakturapakken`;
mkdirSync(out, { recursive: true });
mkdirSync(`${root}tmp`, { recursive: true });
mkdirSync(`${root}src/lib/server/products`, { recursive: true });

const blue = '233F52';
const money = '#,##0.00" kr."';
const documents = [
	{ name: 'faktura-med-moms', title: 'FAKTURA', vat: true, credit: false },
	{ name: 'faktura-uden-moms', title: 'FAKTURA', vat: false, credit: false },
	{ name: 'tilbud', title: 'TILBUD', vat: true, credit: false },
	{ name: 'kreditnota', title: 'KREDITNOTA', vat: true, credit: true }
];
const workbookSpec = { sheets: [] };

for (const item of documents) {
	const rows = [
		[{ value: item.title, bold: true, color: '#233F52', fill: '#EAF0F3' }],
		['Udfyld de blå felter. Gem en kopi for hvert dokument.'],
		['Dokumentnummer', '[nummer]', null, 'Dato', '[dd.mm.åååå]'],
		[
			item.title === 'TILBUD' ? 'Gyldigt til' : 'Forfaldsdato',
			'[dd.mm.åååå]',
			null,
			'Leveringsdato',
			'[dd.mm.åååå]'
		],
		[item.credit ? 'Henviser til faktura' : 'Reference', '[reference]'],
		['AFSENDER', null, null, 'MODTAGER'],
		['[Navn / virksomhedsnavn]', null, null, '[Navn / virksomhedsnavn]'],
		['[Adresse]', null, null, '[Adresse]'],
		['[Postnr. og by]', null, null, '[Postnr. og by]'],
		['[CVR, hvis relevant]', null, null, '[CVR, hvis relevant]'],
		['[E-mail / telefon]'],
		[],
		['Beskrivelse', 'Antal', 'Enhed', 'Enhedspris ekskl. moms', 'Beløb ekskl. moms']
	];
	for (let n = 14; n <= 23; n++) {
		rows.push([
			n === 14 ? '[Beskriv vare eller ydelse]' : '',
			{ value: n === 14 ? 1 : 0, color: '#245F9A' },
			{ value: n === 14 ? 'stk.' : '', color: '#245F9A' },
			{ value: 0, numFmt: money, color: '#245F9A' },
			{ formula: `${item.credit ? '-' : ''}ROUND(B${n}*D${n},2)`, result: 0, numFmt: money }
		]);
	}
	rows.push(
		[null, null, null, 'Subtotal', { formula: 'ROUND(SUM(E14:E23),2)', result: 0, numFmt: money }],
		[
			null,
			null,
			'Momssats',
			{ value: item.vat ? 0.25 : 0, numFmt: '0%', color: '#245F9A' },
			{ formula: 'ROUND(E24*D25,2)', result: 0, numFmt: money }
		],
		[
			null,
			null,
			null,
			item.credit ? 'I alt til kreditering' : 'I alt',
			{ formula: 'ROUND(E24+E25,2)', result: 0, numFmt: money, bold: true }
		],
		[],
		['Betaling', '[Bank / reg.nr. / kontonr. eller anden aftalt betalingsmetode]'],
		[
			'Betingelser',
			item.credit
				? '[Tilbagebetaling eller modregning efter aftale]'
				: '[Udfyld aftalte betalingsbetingelser]'
		],
		[
			'Bemærkning',
			item.vat
				? '[Evt. leveringsvilkår eller reference]'
				: '[Angiv relevant årsag til, at der ikke opkræves moms]'
		],
		[],
		['Skabelon, ikke bogføringssystem. Kontrollér oplysninger, moms og dokumentnummer før brug.']
	);
	rows[12] = rows[12].map((value) => ({ value, bold: true, fill: '#EAF0F3' }));
	workbookSpec.sheets.push({
		name: item.name.replaceAll('-', ' ').slice(0, 31),
		rows,
		columns: [{ width: 38 }, { width: 15 }, { width: 13 }, { width: 28 }, { width: 23 }],
		freezeRows: 13,
		merges: ['A1:E1', 'A2:E2', 'A32:E32']
	});

	const spec = {
		title: item.title,
		metadata: { title: `${item.title} – Fakturapakken`, creator: 'skabelontilfaktura.dk' },
		sections: [
			{
				children: [
					{ type: 'heading', level: 1, text: item.title },
					{ type: 'paragraph', text: `Nummer: [nummer]     Dato: [dd.mm.åååå]` },
					{
						type: 'paragraph',
						text: `${item.title === 'TILBUD' ? 'Gyldigt til' : 'Forfaldsdato'}: [dd.mm.åååå]     Leveringsdato: [dd.mm.åååå]`
					},
					...(item.credit
						? [
								{
									type: 'paragraph',
									text: 'Krediterer fakturanummer: [oprindelig faktura] af [dato]'
								}
							]
						: []),
					{ type: 'heading', level: 2, text: 'Afsender' },
					{
						type: 'paragraph',
						text: '[Navn / virksomhedsnavn]\n[Adresse, postnr. og by]\n[CVR, hvis relevant]\n[E-mail / telefon]'
					},
					{ type: 'heading', level: 2, text: 'Modtager' },
					{
						type: 'paragraph',
						text: '[Navn / virksomhedsnavn]\n[Adresse, postnr. og by]\n[CVR, hvis relevant]'
					},
					{
						type: 'table',
						widthPercent: 100,
						rows: [
							['Beskrivelse', 'Antal', 'Enhedspris', 'Beløb'].map((text) => ({
								text,
								shading: '#EAF0F3'
							})),
							['[Vare eller ydelse]', '[antal]', '[pris]', '[beløb]'].map((text) => ({ text })),
							['[Vare eller ydelse]', '[antal]', '[pris]', '[beløb]'].map((text) => ({ text }))
						]
					},
					{ type: 'paragraph', text: 'Subtotal ekskl. moms: [beløb] kr.' },
					{
						type: 'paragraph',
						text: item.vat
							? 'Moms 25%: [beløb] kr.'
							: 'Der opkræves ikke moms. Årsag: [udfyld relevant grundlag].'
					},
					{
						type: 'paragraph',
						text: `${item.credit ? 'I alt til kreditering' : 'I alt'}: [beløb] kr.`
					},
					{
						type: 'heading',
						level: 2,
						text: item.credit ? 'Tilbagebetaling / modregning' : 'Betaling og betingelser'
					},
					{
						type: 'paragraph',
						text: '[Udfyld betalingsmetode, betalingsbetingelser og øvrige aftalte vilkår]'
					},
					{
						type: 'paragraph',
						text: 'Word beregner ikke beløbene i denne skabelon. Brug Excel-filen, hvis du vil have automatiske beregninger. Kontrollér alle oplysninger før afsendelse.'
					}
				]
			}
		]
	};
	writeFileSync(`${root}tmp/${item.name}.docx.json`, JSON.stringify(spec, null, 2));
	await writeWord(spec, `${out}/${item.name}.docx`);
}

const guide = [
	{ type: 'heading', level: 1, text: 'Kom godt i gang med Fakturapakken' },
	{ type: 'paragraph', text: 'Version 1.0 · 23. oktober 2026 · skabelontilfaktura.dk' },
	{ type: 'heading', level: 2, text: '1. Vælg dit dokument' },
	{
		type: 'paragraph',
		text: 'Brug faktura med moms, hvis du er momsregistreret og sælger en ydelse eller vare med dansk standardmoms. Brug faktura uden moms, hvis du ikke skal opkræve moms; angiv den relevante årsag. Særlige momsregler, eksport og omvendt betalingspligt kræver en konkret vurdering.'
	},
	{ type: 'heading', level: 2, text: '2. Udfyld, kontrollér og gem' },
	{
		type: 'paragraph',
		text: 'Word-filerne er manuelt redigerbare. Excel-filen har fire dokumentark med formler og et udfyldt regneeksempel. Skriv positive antal og priser i kreditnotaarket; formlerne gør beløbene negative. Gem en ny kopi for hvert dokument, og eksportér din færdige kopi til PDF fra dit program.'
	},
	{ type: 'heading', level: 2, text: '3. Kontrollér før afsendelse' },
	{
		type: 'paragraph',
		text: 'Kontrollér fakturadato, unikt fortløbende fakturanummer, afsenders navn og adresse samt relevant CVR-/momsnummer, modtagers navn og adresse, beskrivelse og mængde af vare eller ydelse, leveringsdato hvor relevant, prisgrundlag, momssats og momsbeløb. Betalingsmetode og forfaldsdato skal svare til din aftale.'
	},
	{
		type: 'paragraph',
		text: 'Kundens CVR er ikke et generelt krav på alle danske fakturaer. Undlad CPR og andre unødvendige personoplysninger. Ved kreditnota: henvis til den oprindelige faktura, og afstem beløb og moms med det, der krediteres.'
	},
	{ type: 'heading', level: 2, text: '4. Et enkelt regneeksempel' },
	{
		type: 'paragraph',
		text: '2 timer × 750 kr. = 1.500 kr. ekskl. moms. 25% moms = 375 kr. I alt = 1.875 kr. Kreditnota på samme salg: -1.500 kr., -375 kr. moms, i alt -1.875 kr. Ved et salg uden opkrævning af moms: 1.500 kr. i alt og ingen moms opkrævet.'
	},
	{ type: 'heading', level: 2, text: '5. Opbevaring og bogføring' },
	{
		type: 'paragraph',
		text: 'Gem selv dine filer og færdige dokumenter, og tag backup et separat sted. Pakken er ikke et digitalt bogføringssystem og indeholder ikke cloud-arkiv, automatisk nummerering eller automatisk afsendelse. PDF og skabeloner erstatter ikke eventuelle krav om digital bogføring. Tjek dine forpligtelser hos Erhvervsstyrelsen.'
	},
	{ type: 'heading', level: 2, text: 'Brugsret og afgrænsning' },
	{
		type: 'paragraph',
		text: 'Du må tilpasse og genbruge filerne i din egen virksomhed og sende de udfyldte dokumenter til kunder og bogholder. Du må ikke videresælge eller dele de tomme skabeloner som et produkt. Købet omfatter de leverede filer i version 1.0, ikke abonnement, personlig rådgivning eller løfte om fremtidige opdateringer. Dine ufravigelige rettigheder efter lovgivningen påvirkes ikke.'
	},
	{ type: 'heading', level: 2, text: 'Kilder og hjælp' },
	{
		type: 'paragraph',
		text: 'Kontrollér gældende fakturakrav hos Skattestyrelsen: https://skat.dk/erhverv/moms. Bogføringsregler: https://erhvervsstyrelsen.dk/vejledning-bogfoeringsloven. Skabelonerne er praktiske hjælpemidler og ikke juridisk eller skattemæssig rådgivning. Ved tvivl: spørg en revisor.'
	}
];
const reminders = [
	{ type: 'heading', level: 1, text: 'Venlig betalingspåmindelse' },
	{ type: 'paragraph', text: 'Emne: Påmindelse om faktura [nummer]' },
	{
		type: 'paragraph',
		text: 'Hej [navn]\nVi kan ikke se betalingen for faktura [nummer] på [beløb] kr., som forfaldt den [dato]. Vil du tjekke, om den er gået igennem?\nDu finder fakturaen vedhæftet. Betaling kan ske til [betalingsoplysninger] med reference [nummer].\nHvis du allerede har betalt, må du gerne se bort fra denne mail. Har du spørgsmål, så svar endelig.\nVenlig hilsen\n[navn / virksomhed]'
	},
	{ type: 'heading', level: 2, text: 'Før du sender' },
	{
		type: 'paragraph',
		text: 'Kontrollér først konto og betalingsstatus. Vedhæft den rigtige faktura, og kontrollér modtageren. Denne venlige påmindelse indeholder ikke rykkergebyr, renter eller inkassovarsel. Hvis du vil tilføje dem, skal du først undersøge de konkrete regler og betingelser; denne tekst er ikke en juridisk rykkerprocedure.'
	}
];
for (const [name, children] of [
	['kom-godt-i-gang', guide],
	['betalingspaamindelse', reminders]
]) {
	const spec = {
		title: children[0].text,
		metadata: { creator: 'skabelontilfaktura.dk' },
		sections: [{ children }]
	};
	writeFileSync(`${root}tmp/${name}.docx.json`, JSON.stringify(spec, null, 2));
	await writeWord(spec, `${out}/${name}.docx`);
}

workbookSpec.sheets.push({
	name: 'Regneeksempel',
	freezeRows: 1,
	columns: [{ width: 38 }, { width: 20 }],
	rows: [
		[{ value: 'Eksempel – ikke en faktura', bold: true, fill: '#EAF0F3' }, 'Beløb'],
		['Antal timer', 2],
		['Pris pr. time', { value: 750, numFmt: money }],
		['Subtotal', { formula: 'ROUND(B2*B3,2)', result: 1500, numFmt: money }],
		['Moms 25%', { formula: 'ROUND(B4*0.25,2)', result: 375, numFmt: money }],
		['I alt', { formula: 'ROUND(B4+B5,2)', result: 1875, numFmt: money, bold: true }],
		['Kreditering af samme salg', { formula: '-B6', result: -1875, numFmt: money }],
		['Salg uden opkrævning af moms', { formula: 'B4', result: 1500, numFmt: money }]
	]
});
writeFileSync(`${root}tmp/fakturapakken.xlsx.json`, JSON.stringify(workbookSpec, null, 2));
const workbook = new ExcelJS.Workbook();
workbook.creator = 'skabelontilfaktura.dk';
workbook.calcProperties.fullCalcOnLoad = true;
for (const spec of workbookSpec.sheets) {
	const sheet = workbook.addWorksheet(spec.name);
	sheet.columns = spec.columns;
	sheet.views = [{ state: 'frozen', ySplit: spec.freezeRows }];
	for (const values of spec.rows) {
		const row = sheet.addRow(
			values.map((v) =>
				v && typeof v === 'object'
					? v.formula
						? { formula: v.formula, result: v.result }
						: v.value
					: v
			)
		);
		row.height = 23;
		values.forEach((v, i) => {
			const cell = row.getCell(i + 1);
			cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF233F52' } };
			cell.alignment = { vertical: 'middle', wrapText: true };
			if (!v || typeof v !== 'object') return;
			cell.font = {
				...cell.font,
				bold: v.bold,
				color: { argb: `FF${(v.color ?? '#233F52').slice(1)}` }
			};
			if (v.numFmt) cell.numFmt = v.numFmt;
			if (v.fill)
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: `FF${v.fill.slice(1)}` }
				};
		});
	}
	for (const merge of spec.merges ?? []) sheet.mergeCells(merge);
	if (spec.name !== 'Regneeksempel') {
		for (let n = 14; n <= 23; n++) {
			for (const col of ['B', 'D']) {
				sheet.getCell(`${col}${n}`).dataValidation = {
					type: 'decimal',
					operator: 'greaterThanOrEqual',
					formulae: [0],
					showErrorMessage: true,
					error: 'Brug et positivt tal eller 0.'
				};
			}
		}
		sheet.getCell('D25').dataValidation = {
			type: 'decimal',
			operator: 'between',
			formulae: [0, 1],
			showErrorMessage: true,
			error: 'Skriv momssatsen som procent, fx 25%.'
		};
		sheet.getRow(32).height = 38;
	}
	sheet.pageSetup = {
		paperSize: 9,
		orientation: 'portrait',
		fitToPage: true,
		fitToWidth: 1,
		fitToHeight: 1
	};
}
await workbook.xlsx.writeFile(`${out}/fakturapakken.xlsx`);
const reopened = new ExcelJS.Workbook();
await reopened.xlsx.readFile(`${out}/fakturapakken.xlsx`);
if (
	reopened.worksheets.length !== 5 ||
	reopened.worksheets[0].getCell('E24').formula !== 'ROUND(SUM(E14:E23),2)'
)
	throw new Error('Workbook verification failed');
writeFileSync(
	`${out}/LAES-MIG.txt`,
	'FAKTURAPAKKEN version 1.0\n\nStart med kom-godt-i-gang.docx.\n4 redigerbare Word-skabeloner, 1 Excel-fil med 5 ark, guide og betalingspåmindelse.\nWord: manuelle beløb. Excel: automatiske formler. Ingen makroer.\nGem dine egne kopier og backup. Ikke et bogføringssystem.\n'
);
const zipPath = `${root}outputs/fakturapakken-v1.zip`;
execFileSync('zip', [
	'-j',
	'-X',
	'-q',
	zipPath,
	...documents.map((d) => `${out}/${d.name}.docx`),
	`${out}/fakturapakken.xlsx`,
	`${out}/kom-godt-i-gang.docx`,
	`${out}/betalingspaamindelse.docx`,
	`${out}/LAES-MIG.txt`
]);
execFileSync('unzip', ['-t', zipPath], { stdio: 'pipe' });
const bytes = readFileSync(zipPath);
const hash = createHash('sha256').update(bytes).digest('hex');
writeFileSync(
	`${root}src/lib/server/products/fakturapakke-asset.ts`,
	`// Generated by scripts/generate-fakturapakke.mjs. Private: never import into client code.\nexport const packageFilename = 'fakturapakken-v1.zip';\nexport const packageSha256 = '${hash}';\nexport const packageBase64 = '${bytes.toString('base64')}';\n`
);
console.log(`Verified private package: 8 files, ${bytes.length} bytes, sha256 ${hash}`);

async function writeWord(spec, path) {
	const block = (b) => {
		if (b.type === 'table')
			return new Table({
				width: { size: 100, type: WidthType.PERCENTAGE },
				rows: b.rows.map(
					(row) =>
						new TableRow({
							children: row.map(
								(cell) =>
									new TableCell({
										shading: cell.shading ? { fill: cell.shading.slice(1) } : undefined,
										children: [
											new Paragraph({
												children: [new TextRun({ text: cell.text, size: 21, color: blue })]
											})
										]
									})
							)
						})
				)
			});
		return new Paragraph({
			spacing: { before: b.type === 'heading' ? 220 : 0, after: 130 },
			children: b.text.split('\n').map(
				(text, i) =>
					new TextRun({
						text,
						break: i ? 1 : undefined,
						bold: b.type === 'heading',
						size: b.type === 'heading' ? (b.level === 1 ? 38 : 25) : 21,
						color: blue,
						font: 'Calibri'
					})
			)
		});
	};
	const doc = new Document({
		creator: spec.metadata.creator,
		title: spec.title,
		sections: spec.sections.map((s) => ({
			properties: { page: { margin: { top: 750, right: 850, bottom: 750, left: 850 } } },
			children: s.children.map(block)
		}))
	});
	await writeFileSync(path, await Packer.toBuffer(doc));
	execFileSync('unzip', ['-t', path], { stdio: 'pipe' });
}
