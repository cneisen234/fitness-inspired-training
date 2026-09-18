// Stripe API client — the single source of truth for talking to Stripe.
//
// Server-only: never import this into a Client Component; the secret key must
// not reach the browser. Payments are ONE-TIME (workout-plan purchases), so this
// is used for Products, one-time Prices, and Checkout Sessions in `payment` mode
// — no subscriptions. Mirrors the lazy-singleton shape of Soady's lib/square.ts.

import "server-only";
import Stripe from "stripe";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy .env.example to .env.local and add your Stripe test keys (sk_test_… / pk_test_…).`,
    );
  }
  return value;
}

// Lazily constructed so importing this module never throws at build time — the
// key is only read on first actual use (a request handler / server action).
let client: Stripe | null = null;

export function stripe(): Stripe {
  if (!client) {
    // No explicit apiVersion: the installed SDK pins its own default, so the API
    // version only moves when we deliberately upgrade the `stripe` package.
    client = new Stripe(required("STRIPE_SECRET_KEY"), {
      appInfo: { name: "Fitness Inspired Training" },
      typescript: true,
    });
  }
  return client;
}
