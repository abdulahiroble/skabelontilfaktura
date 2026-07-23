import { eq } from 'drizzle-orm';
import { client } from '$lib/server/db/schema';
import type { Database } from '$lib/server/db/client';

/**
 * Server-side CRUD for the `client` table.
 *
 * Every function takes a per-request `Database` instance (see `getDb`). Callers
 * are responsible for scoping queries by `businessId` so a client never leaks
 * across businesses.
 */

/** Fields that may be provided when creating a client. */
export type NewClient = {
	businessId: string;
	name: string;
	cvr?: string;
	address?: string;
	email?: string;
	peppolId?: string;
};

/** Fields that may be patched when updating a client. */
export type ClientUpdate = Partial<{
	name: string;
	cvr: string;
	address: string;
	email: string;
	peppolId: string;
}>;

/**
 * Return all clients belonging to a business, ordered by creation date
 * (newest first) for a predictable list view.
 */
export async function getClients(db: Database, businessId: string) {
	return db.select().from(client).where(eq(client.businessId, businessId));
}

/** Return a single client scoped to a business, or `null` when not found. */
export async function getClientForBusiness(db: Database, id: string, businessId: string) {
	const rows = await db.select().from(client).where(eq(client.id, id));
	// Defensive: filter by businessId in JS so a caller mistake can never
	// surface another business's client.
	return rows.find((row) => row.businessId === businessId) ?? null;
}

/** Insert a new client and return the created row. */
export async function createClient(db: Database, data: NewClient) {
	const [created] = await db.insert(client).values(data).returning();
	return created;
}

/** Patch a client by id and return the updated row. */
export async function updateClient(db: Database, id: string, data: ClientUpdate) {
	const [updated] = await db
		.update(client)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(client.id, id))
		.returning();
	return updated;
}

/** Delete a client by id. */
export async function deleteClient(db: Database, id: string) {
	await db.delete(client).where(eq(client.id, id));
}
