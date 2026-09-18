// Stripe webhook — records purchases and fires fulfillment emails. Signature-
// verified against STRIPE_WEBHOOK_SECRET using the RAW request body. This route
// is public (Stripe calls it) and intentionally NOT under the auth proxy matcher;
// the signature check is the gate.
//
// Handled events:
//  - checkout.session.completed → record a purchase (idempotent) + email Ashley
//    and the buyer.
//  - charge.refunded            → flip the matching purchase to `refunded`.

import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/sendgrid";
import { formatCents } from "@/lib/money";
import {
  buildPurchaseAdminHtml,
  buildPurchaseAdminText,
  buildPurchaseCustomerHtml,
  buildPurchaseCustomerText,
  type PurchaseFields,
} from "@/lib/purchaseEmail";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 500 });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "invalid";
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCompleted(event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "charge.refunded") {
      await handleRefunded(event.data.object as Stripe.Charge);
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    // 500 → Stripe retries later.
    return new Response("Handler error", { status: 500 });
  }

  return new Response(null, { status: 200 });
}

async function handleCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;

  const note =
    session.custom_fields?.find((f) => f.key === "goals")?.text?.value || null;
  const planName = (session.metadata?.planName as string | undefined) || "Plan";
  const planId = (session.metadata?.planId as string | undefined) || null;
  const amountPaidCents = session.amount_total ?? 0;
  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  // Idempotent: the unique session id means a redelivered event inserts nothing.
  const inserted = await db
    .insert(purchases)
    .values({
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      planId,
      planName,
      amountPaidCents,
      customerName: name,
      customerEmail: email,
      customerNote: note,
    })
    .onConflictDoNothing({ target: purchases.stripeCheckoutSessionId })
    .returning({ id: purchases.id });

  if (inserted.length === 0) return; // already processed

  const fields: PurchaseFields = {
    planName,
    amountCents: amountPaidCents,
    name: name ?? undefined,
    email,
    note: note ?? undefined,
  };

  // Notify Ashley (a send failure must not fail the webhook — the purchase is saved).
  await sendEmail({
    subject: `New plan purchase: ${planName} — ${formatCents(amountPaidCents)}`,
    text: buildPurchaseAdminText(fields),
    html: buildPurchaseAdminHtml(fields),
    replyTo: email ? { email, name: name ?? email } : undefined,
  }).catch((e) => console.error("[stripe webhook] admin email failed:", e));

  // Confirm to the buyer.
  if (email) {
    await sendEmail({
      to: email,
      subject: `Thanks for your purchase — ${planName}`,
      text: buildPurchaseCustomerText(fields),
      html: buildPurchaseCustomerHtml(fields),
    }).catch((e) => console.error("[stripe webhook] customer email failed:", e));
  }
}

async function handleRefunded(charge: Stripe.Charge) {
  const pi =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!pi) return;
  await db
    .update(purchases)
    .set({ status: "refunded" })
    .where(eq(purchases.stripePaymentIntentId, pi));
}
