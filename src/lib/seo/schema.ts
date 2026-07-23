/**
 * Schema.org JSON-LD helpers for skabelontilfaktura.dk.
 *
 * Every function returns a plain object (not a JSON string). Consumers are
 * expected to wrap the result with `JSON.stringify(...)` inside a
 * `<svelte:head>` `<script type="application/ld+json">` tag.
 *
 * All objects use the `@context` of https://schema.org.
 */

const SCHEMA_CONTEXT = 'https://schema.org' as const;

export interface FaqQuestion {
	question: string;
	answer: string;
}

/**
 * Build a FAQPage schema.org object.
 *
 * @see https://schema.org/FAQPage
 */
export function faqPageSchema(questions: FaqQuestion[]): {
	'@context': string;
	'@type': 'FAQPage';
	mainEntity: Array<{
		'@type': 'Question';
		name: string;
		acceptedAnswer: { '@type': 'Answer'; text: string };
	}>;
} {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'FAQPage',
		mainEntity: questions.map((q) => ({
			'@type': 'Question',
			name: q.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: q.answer
			}
		}))
	};
}

export interface HowToStep {
	name: string;
	text: string;
}

export interface HowToOptions {
	/** Name/title of the how-to guide. */
	name?: string;
	/** Short description of the guide. */
	description?: string;
}

/**
 * Build a HowTo schema.org object.
 *
 * @see https://schema.org/HowTo
 */
export function howToSchema(
	steps: HowToStep[],
	opts: HowToOptions = {}
): {
	'@context': string;
	'@type': 'HowTo';
	name?: string;
	description?: string;
	step: Array<{
		'@type': 'HowToStep';
		name: string;
		text: string;
	}>;
} {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'HowTo',
		...(opts.name ? { name: opts.name } : {}),
		...(opts.description ? { description: opts.description } : {}),
		step: steps.map((s) => ({
			'@type': 'HowToStep',
			name: s.name,
			text: s.text
		}))
	};
}

export interface SoftwareApplicationOffer {
	price: number;
	priceCurrency: string;
}

export interface SoftwareApplicationOptions {
	name: string;
	description: string;
	applicationCategory: string;
	operatingSystem: string;
	offers?: SoftwareApplicationOffer;
}

/**
 * Build a SoftwareApplication schema.org object.
 *
 * @see https://schema.org/SoftwareApplication
 */
export function softwareApplicationSchema(opts: SoftwareApplicationOptions): {
	'@context': string;
	'@type': 'SoftwareApplication';
	name: string;
	description: string;
	applicationCategory: string;
	operatingSystem: string;
	offers?: {
		'@type': 'Offer';
		price: number;
		priceCurrency: string;
	};
} {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'SoftwareApplication',
		name: opts.name,
		description: opts.description,
		applicationCategory: opts.applicationCategory,
		operatingSystem: opts.operatingSystem,
		...(opts.offers
			? {
					offers: {
						'@type': 'Offer',
						price: opts.offers.price,
						priceCurrency: opts.offers.priceCurrency
					}
				}
			: {})
	};
}

export interface BreadcrumbItem {
	name: string;
	url: string;
}

/**
 * Build a BreadcrumbList schema.org object.
 *
 * @see https://schema.org/BreadcrumbList
 */
export function breadcrumbSchema(items: BreadcrumbItem[]): {
	'@context': string;
	'@type': 'BreadcrumbList';
	itemListElement: Array<{
		'@type': 'ListItem';
		position: number;
		name: string;
		item: string;
	}>;
} {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: item.url
		}))
	};
}

export interface OrganizationOptions {
	name: string;
	url: string;
	logo?: string;
	description?: string;
}

/**
 * Build an Organization schema.org object.
 *
 * @see https://schema.org/Organization
 */
export function organizationSchema(opts: OrganizationOptions): {
	'@context': string;
	'@type': 'Organization';
	name: string;
	url: string;
	logo?: string;
	description?: string;
} {
	return {
		'@context': SCHEMA_CONTEXT,
		'@type': 'Organization',
		name: opts.name,
		url: opts.url,
		...(opts.logo ? { logo: opts.logo } : {}),
		...(opts.description ? { description: opts.description } : {})
	};
}
