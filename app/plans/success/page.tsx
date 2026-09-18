import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { stripe } from "@/lib/stripe";
import { Emblem } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // Best-effort: confirm the session and personalize. Never block the thank-you
  // on a Stripe hiccup — the webhook (Step 9) is the source of truth for orders.
  let email: string | null = null;
  let planName: string | null = null;
  if (session_id) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      email = s.customer_details?.email ?? null;
      planName = (s.metadata?.planName as string | undefined) ?? null;
    } catch {
      // ignore
    }
  }

  return (
    <section className="relative overflow-hidden dot-grid">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="card-hard accent-coral max-w-xl mx-auto text-center p-8 md:p-12 fade-up">
          <div
            className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
            style={{ backgroundColor: "var(--sky-soft)", color: "var(--sky-deep)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl md:text-4xl">
            You&rsquo;re <span style={{ color: "var(--coral)" }}>in!</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--slate)" }}>
            {planName ? (
              <>Thanks for buying <strong>{planName}</strong>. </>
            ) : (
              <>Thanks for your purchase. </>
            )}
            {site.trainer} will reach out{email ? <> at <strong>{email}</strong></> : ""} shortly to
            get your Everfit plan set up.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn btn-coral text-lg">
              Back home
            </Link>
            <Link href="/contact" className="btn btn-outline text-lg">
              Get in touch
            </Link>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Emblem width={72} color="var(--sky-deep)" />
        </div>
      </div>
    </section>
  );
}
