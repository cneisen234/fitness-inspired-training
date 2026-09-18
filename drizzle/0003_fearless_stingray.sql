DROP INDEX "purchases_session_key";--> statement-breakpoint
DROP INDEX "purchases_payment_intent_idx";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "stripe_payment_intent_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_payment_intent_key" ON "purchases" USING btree ("stripe_payment_intent_id");--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "stripe_checkout_session_id";