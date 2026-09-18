// Stripe webhook — the source of truth for recording purchases + firing
// fulfillment emails. Signature-verified against STRIPE_WEBHOOK_SECRET using the
// RAW request body. Public route, intentionally NOT under the auth proxy matcher;
// the signature check is the gate.
//
// Handled events:
//  - payment_intent.succeeded → record a purchase (idempotent) + email Ashley + buyer.
//  - charge.refunded          → flip the matching purchase to `refunded`.

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
    if (event.type === "payment_intent.succeeded") {
      await handleSucceeded(event.data.object as Stripe.PaymentIntent);
    } else if (event.type === "charge.refunded") {
      await handleRefunded(event.data.object as Stripe.Charge);
    }
  } catch (err) {
    console.error("[stripe webhook] handler error:", err);
    return new Response("Handler error", { status: 500 }); // Stripe retries
  }

  return new Response(null, { status: 200 });
}

async function handleSucceeded(pi: Stripe.PaymentIntent) {
  const m = pi.metadata ?? {};
  const planName = m.planName || "Plan";
  const planId = m.planId || null;
  const note = m.customerNote || null;
  const amountPaidCents = pi.amount_received || pi.amount || 0;
  const email = pi.receipt_email || m.customerEmail || "";
  const name = m.customerName || null;

  // Idempotent: the unique PaymentIntent id means a redelivered event inserts nothing.
  const inserted = await db
    .insert(purchases)
    .values({
      stripePaymentIntentId: pi.id,
      planId,
      planName,
      amountPaidCents,
      customerName: name,
      customerEmail: email,
      customerNote: note,
    })
    .onConflictDoNothing({ target: purchases.stripePaymentIntentId })
    .returning({ id: purchases.id });

  if (inserted.length === 0) return; // already processed

  const fields: PurchaseFields = {
    planName,
    amountCents: amountPaidCents,
    name: name ?? undefined,
    email,
    note: note ?? undefined,
  };

  // A send failure must not fail the webhook — the purchase is saved.
  await sendEmail({
    subject: `New plan purchase: ${planName} — ${formatCents(amountPaidCents)}`,
    text: buildPurchaseAdminText(fields),
    html: buildPurchaseAdminHtml(fields),
    replyTo: email ? { email, name: name ?? email } : undefined,
  }).catch((e) => console.error("[stripe webhook] admin email failed:", e));

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
