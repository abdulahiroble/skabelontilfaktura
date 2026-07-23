import { eq } from 'drizzle-orm';
import type { Database } from '$lib/server/db/client';
import { subscription } from '$lib/server/db/schema';

/**
 * Central, local-table-backed entitlement resolution.
 *
 * The subscription table is the single source of truth for a user's plan and
 * status. It is written by Autumn webhooks (and the checkout flow) and is
 * always reachable from the Cloudflare Workers runtime — unlike the Autumn API
 * itself, which can be temporarily unavailable. Resolving entitlements from
 * the local table therefore lets the app gate features even when Autumn is
 * unreachable.
 *
 * The Autumn `check` API (`src/lib/server/payments/entitlements.ts`) can be
 * used as a complementary, real-time check for metered features, but the
 * plan-level gating used across the product is driven by the helpers below.
 */

/** Plans supported by the product, mirroring `autumn.config.ts`. */
export type Plan = 'free' | 'pro' | 'business' | 'lifetime_pro';

/**
 * Feature identifiers gated per plan. These match the `feature.id` values in
 * `autumn.config.ts` so the local table and Autumn stay in sync.
 */
export type FeatureId =
	| 'cloud_storage'
	| 'client_database'
	| 'saft_export'
	| 'reminder_emails'
	| 'cross_device_numbering'
	| 'peppol_send'
	| 'multi_user'
	| 'api_access'
	| 'white_label';

/**
 * Resolved entitlement context for a user.
 *
 * `plan` is the highest active tier the user holds; `features` is the full set
 * of feature ids that plan grants.
 */
export interface EntitlementContext {
	plan: Plan;
	features: Set<FeatureId>;
}

/**
 * Features granted by each plan. `business` is a superset of `pro`;
 * `lifetime_pro` grants the same features as `pro`.
 */
const PLAN_FEATURES: Record<Plan, FeatureId[]> = {
	free: [],
	pro: [
		'cloud_storage',
		'client_database',
		'saft_export',
		'reminder_emails',
		'cross_device_numbering'
	],
	business: [
		'cloud_storage',
		'client_database',
		'saft_export',
		'reminder_emails',
		'cross_device_numbering',
		'peppol_send',
		'multi_user',
		'api_access',
		'white_label'
	],
	lifetime_pro: [
		'cloud_storage',
		'client_database',
		'saft_export',
		'reminder_emails',
		'cross_device_numbering'
	]
};

/** Free-tier context returned when there is no active paid subscription. */
const FREE_CONTEXT: EntitlementContext = {
	plan: 'free',
	features: new Set<FeatureId>()
};

/**
 * Relative rank used to pick the highest active plan a user holds. Business is
 * the highest tier; pro and lifetime_pro are peers feature-wise (both rank
 * above free).
 */
const PLAN_RANK: Record<Plan, number> = {
	free: 0,
	pro: 2,
	lifetime_pro: 2,
	business: 3
};

/** Context returned to the client (load functions) — features as an array. */
export interface SerializableEntitlements {
	plan: Plan;
	features: FeatureId[];
}

/** Convert a context into a plain, serializable object for load data. */
export function serializeEntitlements(ctx: EntitlementContext): SerializableEntitlements {
	return { plan: ctx.plan, features: Array.from(ctx.features) };
}

/** Rebuild a context from serialized load data. */
export function deserializeEntitlements(
	data: SerializableEntitlements | null | undefined
): EntitlementContext {
	if (!data) return { ...FREE_CONTEXT, features: new Set() };
	return { plan: data.plan, features: new Set(data.features) };
}

/**
 * Resolve a user's entitlement context from the local subscription table.
 *
 * Rules:
 * - No subscription rows → free tier.
 * - `lifetime_pro` is always active (it has no `currentPeriodEnd`).
 * - Other paid plans are active only when `status = 'active'` and (when
 *   `currentPeriodEnd` is set) that timestamp is still in the future. An
 *   expired period downgrades the user to free.
 * - When multiple active rows exist, the highest-ranked plan wins.
 *
 * Errors are treated as "no entitlements": a transient DB failure does not
 * grant paid access — the caller will typically surface a free-tier
 * experience and (for hard gates) a redirect.
 */
export async function getEntitlements(db: Database, userId: string): Promise<EntitlementContext> {
	let rows: { plan: string; status: string | null; currentPeriodEnd: Date | null }[];

	try {
		rows = await db
			.select({
				plan: subscription.plan,
				status: subscription.status,
				currentPeriodEnd: subscription.currentPeriodEnd
			})
			.from(subscription)
			.where(eq(subscription.userId, userId));
	} catch (error) {
		console.error('[entitlements] Failed to load subscription rows:', error);
		return { ...FREE_CONTEXT, features: new Set() };
	}

	const now = Date.now();
	let bestPlan: Plan = 'free';

	for (const row of rows) {
		if (!isKnownPlan(row.plan)) continue;

		const plan = row.plan as Plan;
		if (!isPlanActive(plan, row.status, row.currentPeriodEnd, now)) continue;
		if (PLAN_RANK[plan] > PLAN_RANK[bestPlan]) {
			bestPlan = plan;
		}
	}

	return { plan: bestPlan, features: new Set(PLAN_FEATURES[bestPlan]) };
}

/** Type guard narrowing a raw plan string to the known {@link Plan} union. */
function isKnownPlan(plan: string): plan is Plan {
	return plan in PLAN_FEATURES;
}

/**
 * Decide whether a single subscription row represents an active entitlement.
 *
 * `lifetime_pro` is a one-time purchase and is always active. Recurring plans
 * require an explicit `active` status and, when `currentPeriodEnd` is set, an
 * unexpired period.
 */
function isPlanActive(
	plan: Plan,
	status: string | null,
	currentPeriodEnd: Date | null,
	now: number
): boolean {
	if (plan === 'lifetime_pro') return true;
	if (status !== 'active') return false;
	if (currentPeriodEnd && currentPeriodEnd.getTime() < now) return false;
	return true;
}

/** True when the plan grants the given feature. */
export function hasFeature(ctx: EntitlementContext, featureId: FeatureId): boolean {
	return ctx.features.has(featureId);
}

/** True for any paid plan (pro, business, or lifetime_pro). */
export function isProOrHigher(ctx: EntitlementContext): boolean {
	return ctx.plan !== 'free';
}

/** True only for the business tier. */
export function isBusiness(ctx: EntitlementContext): boolean {
	return ctx.plan === 'business';
}
