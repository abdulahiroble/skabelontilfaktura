import { eq } from 'drizzle-orm';
import { business } from '$lib/server/db/schema';
import type { Database } from '$lib/server/db/client';
import type { InvoiceParty } from '$lib/invoice/types';

/**
 * Business lookups used by route handlers to scope Pro-tier data to the
 * authenticated user's business. Each authenticated user owns exactly one
 * business row (`business.userId`).
 */

/** Return the business owned by `userId`, or `null` when none exists yet. */
export async function getBusinessByUserId(db: Database, userId: string) {
	const rows = await db.select().from(business).where(eq(business.userId, userId)).limit(1);
	return rows[0] ?? null;
}

export type BusinessProfileInput = {
	name: string;
	cvr?: string | null;
	address?: string | null;
	regNr?: string | null;
	kontonr?: string | null;
	mobilepay?: string | null;
	logoUrl?: string | null;
	brandColor?: string | null;
};

/** Create or update the single business profile owned by a user. */
export async function upsertBusinessForUser(
	db: Database,
	userId: string,
	input: BusinessProfileInput
) {
	const existing = await getBusinessByUserId(db, userId);
	const values = {
		name: input.name,
		cvr: input.cvr || null,
		address: input.address || null,
		regNr: input.regNr || null,
		kontonr: input.kontonr || null,
		mobilepay: input.mobilepay || null,
		logoUrl: input.logoUrl || null,
		brandColor: input.brandColor || '#000000',
		updatedAt: new Date()
	};

	if (existing) {
		const [updated] = await db
			.update(business)
			.set(values)
			.where(eq(business.id, existing.id))
			.returning();
		return updated;
	}

	const [created] = await db
		.insert(business)
		.values({ userId, ...values })
		.returning();
	return created;
}

/** Convert a stored business profile into the seller shape used by the generator. */
export function businessToSeller(profile: typeof business.$inferSelect): InvoiceParty {
	const addressParts = (profile.address ?? '').split(/\r?\n/).map((part) => part.trim());
	const street = addressParts[0] ?? '';
	const cityLine = addressParts.slice(1).join(' ');
	const cityMatch = /^(\d{4})\s+(.+)$/.exec(cityLine);

	return {
		name: profile.name,
		address: street,
		postalCode: cityMatch?.[1] ?? '',
		city: cityMatch?.[2] ?? cityLine,
		cvr: profile.cvr ?? ''
	};
}
