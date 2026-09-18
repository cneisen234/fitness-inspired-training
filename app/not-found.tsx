import Link from "next/link";

// Root 404 — shown for any unmatched URL and for notFound() calls. It renders
// inside the root layout, so the site nav + footer frame it on public routes,
// while HideOnAdmin strips them on /admin. The "0" of 404 is a weight-plate ring
// with the brand's heartbeat pulse across it, keeping it on-brand.
export default function NotFound() {
  return (
    <section className="relative overflow-hidden dot-grid">
      {/* Ambient coral glow, echoing the hero bands */}
      <div
        className="absolute top-0 right-0 w-[520px] h-[520px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--coral) 0%, transparent 70%)",
          transform: "translate(25%, -35%)",
        }}
      />

      <div className="container mx-auto px-4 py-20 md:py-28 relative">
        <div className="card-hard accent-coral max-w-xl mx-auto text-center p-8 md:p-12 fade-up">
          <span className="chip chip-coral">
            <span className="chip-dot" />
            Page not found
          </span>

          {/* 4 · pulse-plate · 4 */}
          <div className="mt-5 flex items-center justify-center gap-2 sm:gap-3">
            <Four />
            <PulsePlate />
            <Four />
          </div>
          <span className="sr-only">404 — page not found</span>

          <h1 className="mt-5 text-3xl md:text-4xl leading-[1.05]">
            This page <span style={{ color: "var(--coral)" }}>skipped</span> leg day.
          </h1>
          <p className="mt-3 text-lg" style={{ color: "var(--slate)", lineHeight: 1.7 }}>
            That link didn&rsquo;t make the cut — but we can get you back to the good stuff.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn btn-coral text-lg">
              Take me home
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

// The oversized sky-deep "4" flanking the plate.
function Four() {
  return (
    <span
      aria-hidden
      className="wordmark leading-none"
      style={{
        fontSize: "clamp(80px, 23vw, 146px)",
        color: "var(--sky-deep)",
      }}
    >
      4
    </span>
  );
}

// Branded weight-plate ring standing in for the "0", with the heartbeat pulse
// running across it and a coral "beat" dot at the end.
function PulsePlate() {
  return (
    <svg
      viewBox="0 0 104 120"
      aria-hidden
      style={{ width: "clamp(66px, 19vw, 112px)", height: "auto", flexShrink: 0 }}
    >
      {/* rising sparks */}
      <circle cx="70" cy="14" r="2.6" fill="var(--amber)" opacity="0.85" />
      <circle cx="78" cy="7" r="1.8" fill="var(--coral)" opacity="0.6" />
      {/* plate ring */}
      <circle cx="52" cy="64" r="42" fill="var(--paper)" stroke="var(--coral)" strokeWidth="11" />
      {/* inner hairline */}
      <circle cx="52" cy="64" r="30" fill="none" stroke="var(--coral-deep)" strokeWidth="2" opacity="0.35" />
      {/* heartbeat pulse across the plate */}
      <path
        d="M22 64 H40 L47 44 L57 86 L63 64 H82"
        fill="none"
        stroke="var(--sky-deep)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* the beat */}
      <circle className="beat" cx="82" cy="64" r="4.5" fill="var(--coral)" />
    </svg>
  );
}
