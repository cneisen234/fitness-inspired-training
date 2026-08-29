import Link from 'next/link';
import { site, services, values, stats, testimonials } from '@/lib/site';
import { PulseLine } from '@/components/PulseLine';
import { Emblem } from '@/components/Logo';
import { Icon, StarIcon } from '@/components/Icons';

export default function Home() {
  return (
    <>
      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden dot-grid">
        {/* Faint fist-emblem watermark */}
        <Emblem
          width={520}
          color="var(--sky)"
          className="pointer-events-none select-none hidden md:block floaty-slow"
          style={{ position: 'absolute', top: '14%', right: '-90px', opacity: 0.07 }}
        />
        <div className="container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 relative">
          <div className="max-w-3xl mx-auto text-center">
            <span className="chip chip-coral fade-up d-1">
              <span className="chip-dot" /> Est. {site.established} · {site.yearsExperience}+ years coaching
            </span>

            <h1 className="mt-6 fade-up d-2 text-[2.6rem] leading-[1.02] sm:text-6xl md:text-7xl">
              Get stronger.
              <br />
              <span style={{ color: 'var(--sky-deep)' }}>Move better.</span>{' '}
              <span style={{ color: 'var(--coral)' }}>Feel it.</span>
            </h1>

            <p className="mt-6 fade-up d-3 text-lg md:text-xl leading-relaxed mx-auto max-w-2xl" style={{ color: 'var(--slate)' }}>
              {site.intro}
            </p>

            <div className="mt-9 fade-up d-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn btn-coral text-lg">
                Start Training
              </Link>
              <Link href="/about" className="btn btn-outline text-lg">
                Meet Ashley
              </Link>
            </div>
          </div>

          {/* Signature heartbeat under the hero */}
          <div className="mt-14 max-w-4xl mx-auto fade-up d-5">
            <PulseLine color="var(--coral)" height={54} draw strokeWidth={3} />
          </div>

          {/* Her motto */}
          <p
            className="mt-6 text-center text-lg md:text-xl fade-up d-5"
            style={{ color: 'var(--sky-deep)', fontStyle: 'italic', fontWeight: 700 }}
          >
            &ldquo;{site.tagline}&rdquo;
          </p>

          {/* Stat band */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`panel panel-spine accent-${['sky', 'coral', 'amber'][i]} px-6 py-5 text-center fade-up`}
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
              >
                <div className="text-4xl wordmark" style={{ color: 'var(--sky-deep)' }}>{s.value}</div>
                <div className="mt-1 text-sm font-semibold" style={{ color: 'var(--stone)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== How I train ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">How we&apos;ll work together</p>
            <h2 className="mt-3 text-3xl md:text-5xl">Coaching that fits your life</h2>
            <div className="divider-pulse divider-pulse-on-paper mx-auto mt-6" />
            <p className="mt-6 text-lg" style={{ color: 'var(--slate)' }}>
              Train with me in person, follow a custom program from anywhere, or mix the two. Every option is built around you.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {services.map((svc) => {
              const deep = svc.accent === 'amber' ? 'amber-deep' : svc.accent === 'coral' ? 'coral-deep' : 'sky-deep';
              return (
                <div key={svc.key} className={`panel accent-${svc.accent} p-7 flex flex-col`}>

                  <h3 className="mt-5 text-2xl">{svc.name}</h3>
                  <p className="mt-1 text-sm font-bold" style={{ color: `var(--${deep})` }}>
                    {svc.tagline}
                  </p>
                  <p className="mt-3 text-[0.95rem] leading-relaxed" style={{ color: 'var(--slate)' }}>
                    {svc.description}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {svc.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--charcoal)' }}>
                        <span className="mt-0.5 shrink-0" style={{ color: 'var(--coral)' }}>
                          <Icon name="check" size={18} />
                        </span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-6">
                    <Link
                      href="/contact"
                      className="text-sm font-extrabold inline-flex items-center gap-1.5 transition-all hover:gap-2.5"
                      style={{ color: 'var(--sky-deep)', fontFamily: 'var(--font-nunito)' }}
                    >
                      Ask about this <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== Meet Ashley teaser ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Portrait placeholder — swapped for a real photo once Ashley sends hers. */}
            <div className="order-2 md:order-1">
              <div
                className="relative rounded-3xl overflow-hidden flex items-center justify-center"
                style={{ aspectRatio: '4 / 5', backgroundColor: 'var(--sky-soft)', border: '2px solid var(--border)' }}
              >
                <div className="text-center px-6">
                  <Emblem width={120} color="var(--sky-deep)" className="mx-auto" />
                  <p className="mt-4 font-extrabold" style={{ color: 'var(--sky-deep)' }}>Photo of Ashley</p>
                  <span className="placeholder-tag mt-2">Photo coming soon</span>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="eyebrow eyebrow-coral">Meet your coach</p>
              <h2 className="mt-3 text-3xl md:text-5xl">Hi, I&apos;m Ashley.</h2>
              <div className="divider-pulse mt-6" />
              <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--slate)' }}>
                {site.blurb}
              </p>
              <div className="mt-8">
                <Link href="/about" className="btn btn-blue">
                  My approach
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Values ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">What my coaching is built on</p>
            <div className="divider-pulse divider-pulse-on-paper mx-auto mt-6" />
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <div key={v.title} className={`card-hard accent-${['sky', 'coral', 'amber', 'deep'][i]} p-6`}>
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ color: 'var(--sky-deep)', backgroundColor: 'var(--sky-soft)' }}
                >
                  <Icon name={v.icon} size={22} />
                </span>
                <h3 className="mt-4 text-xl">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--slate)' }}>
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== Testimonials ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">In their words</p>
            <h2 className="mt-3 text-3xl md:text-5xl">Real people, real progress</h2>
            <div className="divider-pulse mx-auto mt-6" />
            <p className="mt-6 text-sm" style={{ color: 'var(--stone)' }}>
              Ashley&apos;s clients are sharing their own stories — the ones below are stand-ins until hers arrive.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <figure key={i} className={`panel panel-spine accent-${['sky', 'coral', 'amber'][i]} p-7 flex flex-col`}>
                <div className="flex items-center gap-1" style={{ color: 'var(--amber)' }}>
                  {[...Array(5)].map((_, s) => (
                    <StarIcon key={s} size={16} />
                  ))}
                </div>
                <blockquote className="mt-4 text-[0.98rem] leading-relaxed flex-1" style={{ color: 'var(--charcoal)' }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-sm" style={{ color: 'var(--charcoal)' }}>{t.name}</span>
                    {t.placeholder && <span className="placeholder-tag">Placeholder</span>}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--stone)' }}>{t.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Invite clients to leave their own review */}
          <div className="mt-12 text-center">
            <p className="text-lg font-bold" style={{ color: 'var(--charcoal)' }}>
              Trained with Ashley?
            </p>
            <p className="mt-1 mb-5 text-sm" style={{ color: 'var(--slate)' }}>
              Share your experience — it helps others take the first step.
            </p>
            <Link href="/contact#review" className="btn btn-outline">
              Leave a review
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== CTA band ===================== */}
      <section className="relative overflow-hidden lanes-dark" style={{ backgroundColor: 'var(--sky-deep)' }}>
        <div className="container mx-auto px-4 py-20 text-center relative">
          <Emblem width={96} color="#fff" className="mx-auto" />
          <h2 className="mt-6 text-3xl md:text-5xl" style={{ color: '#fff' }}>
            Ready to start?
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: 'rgba(234, 242, 248, 0.85)' }}>
            Tell me a little about your goals and how you&apos;d like to train. Let&apos;s build a plan that&apos;s actually yours.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn btn-light text-lg">
              Start Training
            </Link>
            <Link href="/about" className="btn btn-outline-light text-lg">
              Learn more
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
