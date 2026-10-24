ALTER TABLE "kit_purchase" ADD COLUMN "reconcile_after" timestamp DEFAULT (now() at time zone 'UTC') NOT NULL;--> statement-breakpoint
ALTER TABLE "kit_purchase" ADD COLUMN "reconcile_lease_until" timestamp;--> statement-breakpoint
ALTER TABLE "kit_purchase" ADD COLUMN "reconcile_token" uuid;--> statement-breakpoint
ALTER TABLE "kit_purchase" ADD COLUMN "reconcile_checked_at" timestamp;--> statement-breakpoint
ALTER TABLE "kit_purchase" ADD COLUMN "reconcile_refunded_at" timestamp;--> statement-breakpoint
ALTER TABLE "kit_purchase" ADD COLUMN "reconcile_run_id" uuid;--> statement-breakpoint
CREATE INDEX "kit_purchase_reconcile_due_idx" ON "kit_purchase" USING btree ("environment","sku","reconcile_after","id") WHERE "kit_purchase"."status" in ('paid', 'review');