import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(`${root}tmp/package.json`);
const ExcelJS = require('exceljs');
const { Parser } = require('hot-formula-parser');
const ts = require(`${root}node_modules/typescript`);
const { packageBase64, packageSha256 } =
	await import('../src/lib/server/products/fakturapakke-asset.ts');
const archive = Buffer.from(packageBase64, 'base64');
assert.equal(createHash('sha256').update(archive).digest('hex'), packageSha256);
assert(archive.length > 10_000);
assert.equal(
	execFileSync('unzip', ['-Z1', `${root}outputs/fakturapakken-v1.zip`], { encoding: 'utf8' })
		.trim()
		.split('\n').length,
	8
);

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile(`${root}outputs/fakturapakken/fakturapakken.xlsx`);
assert.equal(workbook.worksheets.length, 5);

function valueAt(sheet, address, seen = new Set()) {
	assert(!seen.has(address), `Circular formula ${address}`);
	const cell = sheet.getCell(address);
	if (!cell.formula) return cell.value ?? 0;
	const next = new Set(seen).add(address);
	const parser = new Parser();
	parser.on('callCellValue', (coord, done) => done(valueAt(sheet, coord.label, next)));
	parser.on('callRangeValue', (start, end, done) => {
		const values = [];
		for (let row = start.row.index + 1; row <= end.row.index + 1; row++) {
			const cells = [];
			for (let col = start.column.index + 1; col <= end.column.index + 1; col++) {
				cells.push(valueAt(sheet, sheet.getCell(row, col).address, next));
			}
			values.push(cells);
		}
		done(values);
	});
	const parsed = parser.parse(cell.formula);
	assert.equal(parsed.error, null, `${sheet.name}!${address}: ${parsed.error}`);
	return parsed.result;
}
for (const [index, expected] of [
	[0, 1875],
	[1, 1500],
	[2, 1875],
	[3, -1875]
]) {
	const sheet = workbook.worksheets[index];
	sheet.getCell('B14').value = 2;
	sheet.getCell('D14').value = 750;
	assert.equal(valueAt(sheet, 'E26'), expected);
	sheet.getCell('B14').value = 1;
	sheet.getCell('D14').value = 0.01;
	const sign = index === 3 ? -1 : 1;
	assert.equal(valueAt(sheet, 'E24'), 0.01 * sign);
	assert.equal(Math.abs(valueAt(sheet, 'E25')), 0);
}
assert.equal(valueAt(workbook.worksheets[4], 'B6'), 1875);
assert.equal(valueAt(workbook.worksheets[4], 'B7'), -1875);
const free = new ExcelJS.Workbook();
await free.xlsx.readFile(`${root}static/templates/faktura-skabelon.xlsx`);
assert.equal(free.worksheets[0].getCell('A1').value, 'FAKTURA');
assert.equal(free.worksheets[0].getCell('E12').formula, 'B12*D12');
free.worksheets[0].getCell('B12').value = 2;
free.worksheets[0].getCell('D12').value = 750;
assert.equal(valueAt(free.worksheets[0], 'E16'), 1875);

const source = readFileSync(`${root}src/lib/analytics/consent.ts`, 'utf8');
const js = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.ESNext }
}).outputText;
const analytics = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const events = [];
globalThis.window = { localStorage: { getItem: () => 'rejected' }, dataLayer: events };
analytics.trackEvent('test_event');
assert.equal(events.length, 0);
window.localStorage.getItem = () => 'accepted';
analytics.trackEvent('invoice_pdf_downloaded', { compressed: 0 });
assert.deepEqual(events[0], ['event', 'invoice_pdf_downloaded', { compressed: 0 }]);
delete globalThis.window;
analytics.trackEvent('server_noop');
const availabilitySource = readFileSync(
	`${root}src/routes/api/billing/availability/+server.ts`,
	'utf8'
);
const availabilityJs = ts.transpileModule(availabilitySource, {
	compilerOptions: { module: ts.ModuleKind.ESNext }
}).outputText;
const availability = await import(
	`data:text/javascript;base64,${Buffer.from(availabilityJs).toString('base64')}`
);
for (const [env, expected] of [
	[{}, false],
	[{ KIT_CHECKOUT_ENABLED: 'true' }, false],
	[{ KIT_CHECKOUT_ENABLED: 'false', KIT_VAT_RATE_ID: 'txr_Test123' }, false],
	[{ KIT_CHECKOUT_ENABLED: 'true', KIT_VAT_RATE_ID: 'txr_Test123' }, true]
]) {
	const response = await availability.GET({ platform: { env } });
	assert.deepEqual(await response.json(), { available: expected });
	assert.equal(response.headers.get('Cache-Control'), 'no-store');
	assert.equal(response.headers.get('X-Robots-Tag'), 'noindex');
}
console.log(
	'PASS: ZIP integrity, eight files, five sheets, VAT/no-VAT/credit calculations, rounding, free template, consent-gated GA4 events, closed-default purchase availability.'
);
