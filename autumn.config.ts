/**
 * Autumn product / plan definition.
 *
 * This file is the single source of truth for Faktura's pricing plans and the
 * features each plan gates. It mirrors what is configured in the Autumn
 * dashboard (https://app.useautumn.com) and is what the Autumn CLI syncs when
 * running `npx autumn sync` (or `atmn`).
 *
 * NOTE: `defineConfig` is provided by Autumn's CLI package, not by `autumn-js`
 * (the runtime SDK). To avoid a hard dependency on the CLI in the app's type
 * graph, the config is authored as a plain, fully-typed object. Once the
 * Autumn CLI is installed it can be wrapped with `defineConfig()` from
 * `"autumn"` and re-synced — the shape below is intentionally compatible.
 *
 * @see https://docs.useautumn.com
 */

type PriceInterval = 'day' | 'week' | 'month' | 'year';

interface ProductPrice {
	id: string;
	payment_mode: 'subscription' | 'one-time';
	amount: number;
	currency: string;
	interval?: PriceInterval;
}

interface ProductFeature {
	id: string;
	name: string;
	type: 'boolean' | 'metered';
}

interface Product {
	id: string;
	name: string;
	description: string;
	prices: ProductPrice[];
	features: ProductFeature[];
}

const proFeatures: ProductFeature[] = [
	{ id: 'cloud_storage', name: 'Cloud Storage', type: 'boolean' },
	{ id: 'client_database', name: 'Client Database', type: 'boolean' },
	{ id: 'saft_export', name: 'SAF-T Export', type: 'boolean' },
	{ id: 'reminder_emails', name: 'Reminder Emails', type: 'boolean' },
	{ id: 'cross_device_numbering', name: 'Cross-Device Numbering', type: 'boolean' }
];

const config: { products: Product[] } = {
	products: [
		{
			id: 'pro',
			name: 'Pro',
			description: 'Cloud-lagring, klientdatabase, SAF-T eksport, rykkermails',
			prices: [
				{
					id: 'pro_monthly',
					payment_mode: 'subscription',
					amount: 49,
					currency: 'dkk',
					interval: 'month'
				},
				{
					id: 'pro_yearly',
					payment_mode: 'subscription',
					amount: 470,
					currency: 'dkk',
					interval: 'year'
				}
			],
			features: proFeatures
		},
		{
			id: 'business',
			name: 'Business',
			description: 'Peppol e-faktura, multi-user, API, white-label',
			prices: [
				{
					id: 'business_monthly',
					payment_mode: 'subscription',
					amount: 149,
					currency: 'dkk',
					interval: 'month'
				}
			],
			features: [
				{ id: 'peppol_send', name: 'Peppol Send', type: 'boolean' },
				{ id: 'multi_user', name: 'Multi-User (2-5 seats)', type: 'metered' },
				{ id: 'api_access', name: 'API Access', type: 'boolean' },
				{ id: 'white_label', name: 'White-Label PDFs', type: 'boolean' }
			]
		},
		{
			id: 'lifetime_pro',
			name: 'Lifetime Pro',
			description: 'All Pro features forever',
			prices: [
				{
					id: 'lifetime_pro_once',
					payment_mode: 'one-time',
					amount: 999,
					currency: 'dkk'
				}
			],
			features: proFeatures
		}
	]
};

export default config;
