-- Uses only transaction-local temporary tables. No customer/application writes.
BEGIN;
SET LOCAL statement_timeout = '10s';
CREATE TEMP TABLE kit_purchase_fixture (LIKE public.kit_purchase INCLUDING ALL) ON COMMIT DROP;
CREATE TEMP TABLE billing_event_fixture (LIKE public.billing_event INCLUDING ALL) ON COMMIT DROP;
CREATE TEMP TABLE kit_checkout_fixture (LIKE public.kit_checkout INCLUDING ALL) ON COMMIT DROP;
INSERT INTO kit_purchase_fixture
	(user_id,environment,sku,provider_invoice_id,stripe_invoice_id,status,total_minor,paid_minor,refunded_minor,asset_sha256,purchased_at)
VALUES ('fixture','live','fakturapakken_v1','inv_fixture','in_fixture','paid',9900,9900,0,'fixture',now())
ON CONFLICT (environment,provider_invoice_id) DO NOTHING;
INSERT INTO kit_purchase_fixture
	(user_id,environment,sku,provider_invoice_id,stripe_invoice_id,status,total_minor,paid_minor,refunded_minor,asset_sha256,purchased_at)
VALUES ('fixture','live','fakturapakken_v1','inv_fixture','in_fixture','paid',9900,9900,0,'fixture',now())
ON CONFLICT (environment,provider_invoice_id) DO NOTHING;
DO $$ BEGIN
	IF (SELECT count(*) FROM kit_purchase_fixture) <> 1 THEN RAISE EXCEPTION 'Duplicate invoice grant'; END IF;
END $$;
-- A full refund followed by an older paid read must not regrant downloads.
UPDATE kit_purchase_fixture SET refunded_minor = 9900, status = 'refunded';
INSERT INTO kit_purchase_fixture
	(user_id,environment,sku,provider_invoice_id,stripe_invoice_id,status,total_minor,paid_minor,refunded_minor,asset_sha256,purchased_at)
VALUES ('fixture','live','fakturapakken_v1','inv_fixture','in_fixture','paid',9900,9900,0,'fixture',now())
ON CONFLICT (environment,provider_invoice_id) DO UPDATE SET
	refunded_minor = greatest(kit_purchase_fixture.refunded_minor, excluded.refunded_minor),
	status = CASE
		WHEN kit_purchase_fixture.status = 'blocked' THEN 'blocked'
		WHEN greatest(kit_purchase_fixture.refunded_minor, excluded.refunded_minor) >= 9900 THEN 'refunded'
		WHEN greatest(kit_purchase_fixture.refunded_minor, excluded.refunded_minor) > 0 THEN 'review'
		ELSE excluded.status END;
DO $$ BEGIN
	IF (SELECT status FROM kit_purchase_fixture LIMIT 1) <> 'refunded' THEN RAISE EXCEPTION 'Refund reinstated'; END IF;
END $$;
-- Same external identifiers in sandbox are separate financial records.
INSERT INTO kit_purchase_fixture
	(user_id,environment,sku,provider_invoice_id,stripe_invoice_id,status,total_minor,paid_minor,refunded_minor,asset_sha256,purchased_at)
VALUES ('fixture','sandbox','fakturapakken_v1','inv_fixture','in_fixture','paid',9900,9900,0,'fixture',now());
INSERT INTO billing_event_fixture(environment,message_id,event_type) VALUES ('live','msg_fixture','billing.updated') ON CONFLICT DO NOTHING;
INSERT INTO billing_event_fixture(environment,message_id,event_type) VALUES ('live','msg_fixture','billing.updated') ON CONFLICT DO NOTHING;
DO $$ BEGIN
	IF (SELECT count(*) FROM kit_purchase_fixture) <> 2 THEN RAISE EXCEPTION 'Environment collision'; END IF;
	IF (SELECT count(*) FROM billing_event_fixture) <> 1 THEN RAISE EXCEPTION 'Webhook dedupe failed'; END IF;
END $$;
INSERT INTO kit_checkout_fixture(user_id,environment,sku,attempt_id,expires_at)
VALUES ('fixture','live','fakturapakken_v1',gen_random_uuid(),now()+interval '31 minutes');
DO $$
DECLARE competing_count integer;
BEGIN
	WITH competing AS (
		INSERT INTO kit_checkout_fixture(user_id,environment,sku,attempt_id,expires_at)
		VALUES ('fixture','live','fakturapakken_v1',gen_random_uuid(),now()+interval '31 minutes')
		ON CONFLICT(user_id,environment,sku) DO UPDATE SET attempt_id=excluded.attempt_id
		WHERE kit_checkout_fixture.expires_at < now()
		RETURNING *
	)
	SELECT count(*) INTO competing_count FROM competing;
	IF competing_count <> 0 THEN RAISE EXCEPTION 'Concurrent checkout lease granted'; END IF;
END $$;
SELECT 'PASS: checkout lease excludes second request';
SELECT 'PASS: invoice dedupe, refund monotonicity, environment isolation, webhook dedupe';
ROLLBACK;
