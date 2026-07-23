import { eq } from 'drizzle-orm';
import { business } from '$lib/server/db/schema';
import type { Database } from '$lib/server/db/client';

/**
 * Business lookups used by route handlers to scope Pro-tier data to the
 * authenticated user's business. Each authenticated user owns exactly one
 * business row (`business.userId`).
 */

/** Return the business owned by `userId`, or `null` when none exists yet. */
export async function getBusinessByUserId(db: Database, userId: string) {
	const rows = await db.select().from(business).where(eq(business.userId, userId));
	return rows[0] ?? null;
}
