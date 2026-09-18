import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { formatCents } from "@/lib/money";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan: planId } = await searchParams;
  if (!planId) redirect("/plans");

  const [plan] = await db.select().from(plans).where(eq(plans.id, planId)).limit(1);
  if (!plan || !plan.active || plan.priceCents <= 0) {
    redirect("/plans?error=unavailable");
  }

  return (
    <section className="section" style={{ backgroundColor: "var(--cream)" }}>
      <div className="container mx-auto px-4">
        <Link
          href="/plans"
          className="inline-flex items-center gap-1.5 text-sm font-extrabold"
          style={{ color: "var(--sky-deep)" }}
        >
          <span aria-hidden>←</span> All plans
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-5 max-w-5xl mx-auto items-start">
          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="panel panel-spine accent-coral p-7">
              <p className="eyebrow eyebrow-coral">Your plan</p>
              <h1 className="mt-2 text-2xl">{plan.name}</h1>
              {plan.tagline && (
                <p className="mt-1 text-sm" style={{ color: "var(--stone)" }}>
                  {plan.tagline}
                </p>
              )}

              {plan.features.length > 0 && (
                <ul className="mt-5 space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex gap-2">
                      <span style={{ color: "var(--coral)" }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div
                className="mt-6 pt-5 flex items-baseline justify-between"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span className="text-sm font-bold" style={{ color: "var(--stone)" }}>
                  Total (one-time)
                </span>
                <span className="wordmark text-3xl" style={{ color: "var(--charcoal)" }}>
                  {formatCents(plan.priceCents)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="lg:col-span-3">
            <div className="panel accent-sky p-7 md:p-9">
              <h2 className="text-2xl">Checkout</h2>
              <p className="mt-2 mb-6 text-sm" style={{ color: "var(--stone)" }}>
                After payment, Ashley reaches out personally to build your Everfit plan.
              </p>
              <CheckoutForm plan={{ id: plan.id, name: plan.name, priceCents: plan.priceCents }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
