import type { Metadata } from "next";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { site } from "@/lib/site";
import { formatCents } from "@/lib/money";
import { PulseLine } from "@/components/PulseLine";
import { startCheckout } from "./actions";

export const metadata: Metadata = {
  title: "Training Plans",
  description: `Coaching packages from ${site.trainer} at ${site.name} — train in person, online through Everfit, or a blend of both.`,
};

export const dynamic = "force-dynamic";

function Check() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--coral)"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const active = await db
    .select()
    .from(plans)
    .where(eq(plans.active, true))
    .orderBy(asc(plans.sort), asc(plans.name));

  return (
    <>
      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <p className="eyebrow eyebrow-coral fade-up d-1">Training Plans</p>
          <h1 className="mt-4 fade-up d-2 text-4xl md:text-6xl">
            Pick your <span style={{ color: "var(--coral)" }}>starting line</span>
          </h1>
          <p
            className="mt-6 fade-up d-3 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--slate)" }}
          >
            Coaching packages built around you — in person, online through Everfit, or a
            blend of both. Purchase below and {site.trainer} reaches out to set up your plan.
          </p>
          <div className="mt-10 max-w-3xl mx-auto fade-up d-4">
            <PulseLine color="var(--coral)" height={44} draw />
          </div>
        </div>
      </section>

      {/* ===================== Plans ===================== */}
      <section className="section pt-4" style={{ backgroundColor: "var(--cream)" }}>
        <div className="container mx-auto px-4">
          {error === "unavailable" && (
            <p
              className="max-w-xl mx-auto mb-8 text-center text-sm rounded-xl px-4 py-3"
              style={{ backgroundColor: "var(--coral-soft)", color: "var(--coral-deep)", fontWeight: 600 }}
              role="alert"
            >
              That plan isn’t available right now. Please pick another or get in touch.
            </p>
          )}

          {active.length === 0 ? (
            <div className="max-w-xl mx-auto text-center">
              <div className="divider-pulse mx-auto" />
              <h2 className="mt-8 text-2xl md:text-3xl">Plans are coming soon</h2>
              <p className="mt-3 text-lg" style={{ color: "var(--slate)" }}>
                {site.trainer} is putting together coaching packages. In the meantime, reach
                out and we’ll find the right way for you to train.
              </p>
              <div className="mt-8">
                <Link href="/contact" className="btn btn-coral">
                  Get in touch
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-start">
              {active.map((p, i) => (
                <div
                  key={p.id}
                  className={`panel panel-spine accent-${["sky", "coral", "amber"][i % 3]} p-7 flex flex-col`}
                >
                  <h2 className="text-2xl">{p.name}</h2>
                  {p.tagline && (
                    <p className="mt-1 text-sm" style={{ color: "var(--stone)" }}>
                      {p.tagline}
                    </p>
                  )}

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="wordmark text-4xl" style={{ color: "var(--charcoal)" }}>
                      {formatCents(p.priceCents)}
                    </span>
                    <span className="text-sm" style={{ color: "var(--stone)" }}>
                      one-time
                    </span>
                  </div>

                  {p.description && (
                    <p className="mt-4 leading-relaxed" style={{ color: "var(--slate)" }}>
                      {p.description}
                    </p>
                  )}

                  {p.features.length > 0 && (
                    <ul className="mt-5 space-y-2.5 flex-1">
                      {p.features.map((f, j) => (
                        <li key={j} className="flex gap-2.5 text-[0.97rem]" style={{ color: "var(--charcoal)" }}>
                          <Check />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form action={startCheckout} className="mt-7">
                    <input type="hidden" name="planId" value={p.id} />
                    <button type="submit" className="btn btn-coral w-full text-lg">
                      Get this plan
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
