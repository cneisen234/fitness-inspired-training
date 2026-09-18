CREATE TYPE "public"."purchase_status" AS ENUM('paid', 'refunded');--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_checkout_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"plan_id" uuid,
	"plan_name" text NOT NULL,
	"amount_paid_cents" integer NOT NULL,
	"customer_name" text,
	"customer_email" text NOT NULL,
	"customer_note" text,
	"status" "purchase_status" DEFAULT 'paid' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_session_key" ON "purchases" USING btree ("stripe_checkout_session_id");--> statement-breakpoint
CREATE INDEX "purchases_created_idx" ON "purchases" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "purchases_payment_intent_idx" ON "purchases" USING btree ("stripe_payment_intent_id");