"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { field } from "@/lib/form";

// Public: start a one-time Stripe Checkout for a plan. Progressive-enhancement
// friendly — a plain <form> posts here, we create the session server-side (always
// trusting the DB price, never a client-sent amount), and redirect to Stripe.
export async function startCheckout(form: FormData): Promise<void> {
  const planId = field(form, "planId");
  if (!planId) redirect("/plans?error=unavailable");

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan || !plan.active || !plan.stripePriceId) {
    redirect("/plans?error=unavailable");
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${base}/plans/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/plans/cancelled`,
    // Read back by the webhook (Step 9) to record the purchase against this plan.
    metadata: { planId: plan.id, planName: plan.name },
    payment_intent_data: { metadata: { planId: plan.id, planName: plan.name } },
    // Stripe collects the email; we also ask for goals so Ashley can tailor the
    // Everfit setup before reaching out.
    custom_fields: [
      {
        key: "goals",
        label: { type: "custom", custom: "Your goals (optional)" },
        type: "text",
        optional: true,
      },
    ],
  });

  if (!session.url) redirect("/plans?error=unavailable");
  redirect(session.url);
}
