CREATE TABLE "invoice_counter" (
	"business_id" uuid NOT NULL,
	"series" text NOT NULL,
	"next_value" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "invoice_counter_business_id_series_pk" PRIMARY KEY("business_id","series")
);
--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "business" DROP CONSTRAINT IF EXISTS "business_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT IF EXISTS "subscription_user_id_user_id_fk";--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text;--> statement-breakpoint
ALTER TABLE "business" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "user_id" SET DATA TYPE text USING "user_id"::text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "data" jsonb;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "buyer_name" text;--> statement-breakpoint
ALTER TABLE "invoice" ADD COLUMN IF NOT EXISTS "buyer_email" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ip_address" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "user_agent" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN IF NOT EXISTS "autumn_event_at" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_counter" ADD CONSTRAINT "invoice_counter_business_id_business_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."business"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
INSERT INTO "invoice_counter" ("business_id", "series", "next_value")
SELECT
	"business_id",
	"series",
	COALESCE(MAX(substring("invoice_number" from '([0-9]+)$')::integer), 0)
FROM "invoice"
GROUP BY "business_id", "series";--> statement-breakpoint
CREATE INDEX "invoice_business_created_idx" ON "invoice" USING btree ("business_id","created_at");--> statement-breakpoint
CREATE INDEX "invoice_status_due_idx" ON "invoice" USING btree ("status","due_at");--> statement-breakpoint
CREATE INDEX "invoice_business_issued_status_idx" ON "invoice" USING btree ("business_id","issued_at","status");--> statement-breakpoint
CREATE INDEX "invoice_item_invoice_idx" ON "invoice_item" USING btree ("invoice_id");--> statement-breakpoint
DELETE FROM "reminder_log" a
USING "reminder_log" b
WHERE a."invoice_id" = b."invoice_id"
	AND COALESCE(a."template", 'first') = COALESCE(b."template", 'first')
	AND a."id" < b."id";--> statement-breakpoint
DELETE FROM "subscription" a
USING "subscription" b
WHERE a."user_id" = b."user_id"
	AND a."plan" = b."plan"
	AND (a."updated_at", a."id") < (b."updated_at", b."id");--> statement-breakpoint
ALTER TABLE "business" ADD CONSTRAINT "business_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
ALTER TABLE "reminder_log" ADD CONSTRAINT "reminder_invoice_template_unq" UNIQUE("invoice_id","template");--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_plan_unq" UNIQUE("user_id","plan");