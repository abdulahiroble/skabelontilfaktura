import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getDb } from '$lib/server/db/client';
import { getBusinessByUserId, upsertBusinessForUser } from '$lib/server/queries';
import {
	validateCvr,
	validateKontonr,
	validateMobilePay,
	validateRegNr
} from '$lib/invoice/validation';

function readValues(formData: FormData) {
	return {
		name: String(formData.get('name') ?? '').trim(),
		cvr: String(formData.get('cvr') ?? '').replace(/\s/g, ''),
		address: String(formData.get('address') ?? '').trim(),
		regNr: String(formData.get('regNr') ?? '').replace(/\s/g, ''),
		kontonr: String(formData.get('kontonr') ?? '').replace(/\s/g, ''),
		mobilepay: String(formData.get('mobilepay') ?? '').replace(/\s/g, ''),
		brandColor: String(formData.get('brandColor') ?? '#000000').trim()
	};
}

function validate(values: ReturnType<typeof readValues>) {
	const errors: Record<string, string> = {};
	if (!values.name) errors.name = 'Virksomhedsnavn er påkrævet';
	if (values.cvr && !validateCvr(values.cvr)) errors.cvr = 'CVR skal være 8 cifre';
	if (values.regNr && !validateRegNr(values.regNr)) errors.regNr = 'Reg.nr. skal være 4 cifre';
	if (values.kontonr && !validateKontonr(values.kontonr)) {
		errors.kontonr = 'Kontonummeret er ugyldigt';
	}
	if (values.mobilepay && !validateMobilePay(values.mobilepay)) {
		errors.mobilepay = 'MobilePay-nummeret er ugyldigt';
	}
	if (!/^#[0-9a-f]{6}$/i.test(values.brandColor)) {
		errors.brandColor = 'Vælg en gyldig farve';
	}
	return errors;
}

export const load: PageServerLoad = async ({ locals, platform }) => {
	if (!locals.user) throw redirect(302, '/login/?next=/indstillinger/');
	if (!platform?.env?.DATABASE_URL) throw error(500, 'Database ikke konfigureret');

	const db = getDb(platform.env.DATABASE_URL);
	const profile = await getBusinessByUserId(db, locals.user.id);
	return { profile };
};

export const actions: Actions = {
	default: async ({ request, locals, platform }) => {
		if (!locals.user) throw redirect(302, '/login/?next=/indstillinger/');
		if (!platform?.env?.DATABASE_URL) throw error(500, 'Database ikke konfigureret');

		const values = readValues(await request.formData());
		const errors = validate(values);
		if (Object.keys(errors).length > 0) return fail(400, { values, errors });

		const db = getDb(platform.env.DATABASE_URL);
		await upsertBusinessForUser(db, locals.user.id, values);
		return { success: true, values };
	}
};
