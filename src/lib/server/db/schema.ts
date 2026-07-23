import {
	boolean,
	jsonb,
	integer,
	numeric,
	pgTable,
	text,
	timestamp,
	uuid,
	unique
} from 'drizzle-orm/pg-core';

/**
 * Drizzle schema for Faktura.
 *
 * Better Auth core tables (user, session, account, verification) are defined
 * here so they can be referenced by Better Auth later. Application tables
 * (business, client, invoice, invoiceItem, reminderLog, subscription) follow.
 *
 * Conventions:
 * - UUID primary keys use `defaultRandom()` (calls `gen_random_uuid()`).
 * - All timestamps use `mode: 'date'` so consumers get JS `Date` objects.
 * - `export *` pattern so consumers can import individual tables.
 */

// ---------------------------------------------------------------------------
// Better Auth core tables
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	name: text('name'),
	emailVerified: boolean('email_verified').default(false),
	image: text('image'),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	accessExpiresAt: timestamp('access_expires_at', { mode: 'date' }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

// ---------------------------------------------------------------------------
// Application tables
// ---------------------------------------------------------------------------

export const business = pgTable('business', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	cvr: text('cvr'),
	address: text('address'),
	regNr: text('reg_nr'),
	kontonr: text('kontonr'),
	mobilepay: text('mobilepay'),
	logoUrl: text('logo_url'),
	brandColor: text('brand_color').default('#000000'),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

export const client = pgTable('client', {
	id: uuid('id').primaryKey().defaultRandom(),
	businessId: uuid('business_id')
		.notNull()
		.references(() => business.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	cvr: text('cvr'),
	address: text('address'),
	email: text('email'),
	peppolId: text('peppol_id'),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});

export const invoice = pgTable(
	'invoice',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		businessId: uuid('business_id')
			.notNull()
			.references(() => business.id, { onDelete: 'cascade' }),
		clientId: uuid('client_id').references(() => client.id, { onDelete: 'set null' }),
		invoiceNumber: text('invoice_number').notNull(),
		series: text('series').notNull().default('2026'),
		// draft | sent | paid | overdue | void
		status: text('status').notNull().default('draft'),
		currency: text('currency').notNull().default('DKK'),
		subtotal: numeric('subtotal', { precision: 12, scale: 2 }).notNull().default('0'),
		vatRate: numeric('vat_rate', { precision: 5, scale: 4 }).notNull().default('0.25'),
		vatAmount: numeric('vat_amount', { precision: 12, scale: 2 }).default('0'),
		total: numeric('total', { precision: 12, scale: 2 }).default('0'),
		items: jsonb('items'),
		pdfR2Key: text('pdf_r2_key'),
		issuedAt: timestamp('issued_at', { mode: 'date' }),
		dueAt: timestamp('due_at', { mode: 'date' }),
		paidAt: timestamp('paid_at', { mode: 'date' }),
		createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
	},
	(table) => [
		unique('invoice_business_series_number_unq').on(
			table.businessId,
			table.series,
			table.invoiceNumber
		)
	]
);

export const invoiceItem = pgTable('invoice_item', {
	id: uuid('id').primaryKey().defaultRandom(),
	invoiceId: uuid('invoice_id')
		.notNull()
		.references(() => invoice.id, { onDelete: 'cascade' }),
	description: text('description').notNull(),
	quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull().default('1'),
	unitPrice: numeric('unit_price', { precision: 12, scale: 2 }).notNull(),
	vatRate: numeric('vat_rate', { precision: 5, scale: 4 }).default('0.25'),
	sortOrder: integer('sort_order').default(0)
});

export const reminderLog = pgTable('reminder_log', {
	id: uuid('id').primaryKey().defaultRandom(),
	invoiceId: uuid('invoice_id')
		.notNull()
		.references(() => invoice.id, { onDelete: 'cascade' }),
	sentAt: timestamp('sent_at', { mode: 'date' }).defaultNow().notNull(),
	template: text('template').default('first')
});

export const subscription = pgTable('subscription', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	autumnCustomerId: text('autumn_customer_id'),
	// free | pro | business | lifetime_pro
	plan: text('plan').notNull(),
	// active | canceled | past_due
	status: text('status'),
	currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
	createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull()
});
