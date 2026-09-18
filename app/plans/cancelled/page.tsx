import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default function CheckoutCancelledPage() {
  return (
    <section className="relative overflow-hidden dot-grid">
      <div className="container mx-auto px-4 py-20 md:py-28">
        <div className="card-hard accent-sky max-w-xl mx-auto text-center p-8 md:p-12 fade-up">
          <h1 className="text-3xl md:text-4xl">Checkout cancelled</h1>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--slate)" }}>
            No charge was made. Whenever you&rsquo;re ready, you can pick a plan again — or
            reach out and {site.trainer} will help you choose.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/plans" className="btn btn-coral text-lg">
              Back to plans
            </Link>
            <Link href="/contact" className="btn btn-outline text-lg">
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
