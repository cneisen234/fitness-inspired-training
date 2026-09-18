// POST /api/checkout/intent
// Body: { planId, name, email, goals }
// Creates a Stripe PaymentIntent for the plan (branded on-site checkout). The
// amount ALWAYS comes from the DB — never trusted from the client. Buyer name /
// email / goals ride along in metadata so the webhook can record + notify.

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { stripe } from "@/lib/stripe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = { planId?: string; name?: string; email?: string; goals?: string };

function bad(message: string, status = 400) {
  return Response.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return bad("Invalid request.");
  }

  if (!body.planId) return bad("Missing plan.");
  const email = (body.email ?? "").trim();
  if (!EMAIL_RE.test(email)) return bad("Please enter a valid email address.");
  const name = (body.name ?? "").trim();
  if (!name) return bad("Please enter your name.");

  const [plan] = await db.select().from(plans).where(eq(plans.id, body.planId)).limit(1);
  if (!plan || !plan.active || plan.priceCents <= 0) {
    return bad("That plan isn’t available right now.", 409);
  }

  try {
    const intent = await stripe().paymentIntents.create({
      amount: plan.priceCents, // trusted DB price, in cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        customerName: name,
        customerEmail: email,
        customerNote: (body.goals ?? "").trim().slice(0, 500),
      },
    });
    return Response.json({ ok: true, clientSecret: intent.client_secret });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not start checkout.";
    return bad(message, 502);
  }
}
