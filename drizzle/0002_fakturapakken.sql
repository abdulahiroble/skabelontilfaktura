CREATE TABLE "billing_event" (
	"environment" text NOT NULL,
	"message_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "billing_event_environment_message_id_pk" PRIMARY KEY("environment","message_id")
);
--> statement-breakpoint
CREATE TABLE "kit_checkout" (
	"user_id" text NOT NULL,
	"environment" text NOT NULL,
	"sku" text NOT NULL,
	"attempt_id" uuid NOT NULL,
	"payment_url" text,
	"expires_at" timestamp NOT NULL,
	CONSTRAINT "kit_checkout_user_id_environment_sku_pk" PRIMARY KEY("user_id","environment","sku")
);
--> statement-breakpoint
CREATE TABLE "kit_purchase" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"environment" text NOT NULL,
	"sku" text NOT NULL,
	"provider_invoice_id" text NOT NULL,
	"stripe_invoice_id" text NOT NULL,
	"status" text NOT NULL,
	"total_minor" integer NOT NULL,
	"paid_minor" integer NOT NULL,
	"refunded_minor" integer DEFAULT 0 NOT NULL,
	"asset_sha256" text NOT NULL,
	"purchased_at" timestamp NOT NULL,
	"verified_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kit_purchase_environment_invoice_unq" UNIQUE("environment","provider_invoice_id"),
	CONSTRAINT "kit_purchase_environment_stripe_unq" UNIQUE("environment","stripe_invoice_id")
);
--> statement-breakpoint
ALTER TABLE "kit_checkout" ADD CONSTRAINT "kit_checkout_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kit_purchase" ADD CONSTRAINT "kit_purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kit_purchase_user_environment_idx" ON "kit_purchase" USING btree ("user_id","environment");