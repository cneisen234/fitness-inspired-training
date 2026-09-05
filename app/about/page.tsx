import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { site } from '@/lib/site';
import { PulseLine } from '@/components/PulseLine';
import { Emblem } from '@/components/Logo';
import { Icon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About',
  description: `Meet ${site.trainer}, the coach behind ${site.name} — ${site.yearsExperience}+ years helping people get stronger, in person and online.`,
};

const approach = [
  {
    step: '01',
    title: 'We start with you',
    body: 'Your goals, your history, your schedule, any nagging injuries — everything that shapes a plan that actually fits your life.',
  },
  {
    step: '02',
    title: 'We build the plan',
    body: 'A personalized, progressive program — in person, through the Everfit app, or a blend of both — that meets you at your level.',
  },
  {
    step: '03',
    title: 'We keep you moving',
    body: 'We track progress, dial in form, and adjust as you get stronger, so you keep reaching goals instead of plateauing.',
  },
];

export default function About() {
  return (
    <>
      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <p className="eyebrow eyebrow-coral fade-up d-1">About</p>
          <h1 className="mt-4 fade-up d-2 text-4xl md:text-6xl">
            Coaching with <span style={{ color: 'var(--sky-deep)' }}>heart</span> and{' '}
            <span style={{ color: 'var(--coral)' }}>experience</span>
          </h1>
          <p className="mt-6 fade-up d-3 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--slate)' }}>
            {site.intro}
          </p>
          <div className="mt-10 max-w-3xl mx-auto fade-up d-4">
            <PulseLine color="var(--coral)" height={44} draw />
          </div>
        </div>
      </section>

      {/* ===================== Story ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-5 items-center">
            {/* Ashley */}
            <div className="md:col-span-2">
              <div
                className="relative rounded-3xl overflow-hidden mx-auto"
                style={{ aspectRatio: '4 / 5', maxWidth: 380, border: '2px solid var(--border)' }}
              >
                <Image
                  src="/Ashley.webp"
                  alt="Ashley, personal trainer and owner of Fitness Inspired Training"
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="eyebrow">My story</p>
              <h2 className="mt-3 text-3xl md:text-4xl">Nearly a decade in the gym with people like you</h2>
              <div className="divider-pulse divider-pulse-on-paper mt-6" />
              <div className="mt-6 space-y-4 text-lg leading-relaxed" style={{ color: 'var(--slate)' }}>
                <p>{site.blurb}</p>
                <p>
                  Over the last {site.yearsExperience} years I&apos;ve coached beginners taking their very first steps and
                  seasoned lifters chasing goals they couldn&apos;t reach on their own. The common thread isn&apos;t a
                  magic program — it&apos;s a plan built around the person, and a coach who actually shows up for it.
                </p>
                <p>
                  Whether you&apos;re looking to get strong, move without pain, shake up a stale routine, or finally
                  stay consistent, I&apos;d love to help you get there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== How it works ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 text-3xl md:text-5xl">Simple, personal, built to last</h2>
            <div className="divider-pulse mx-auto mt-6" />
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {approach.map((a, i) => (
              <div key={a.step} className={`panel panel-spine accent-${['sky', 'coral', 'amber'][i]} p-7`}>
                <span className="wordmark text-5xl" style={{ color: `var(--${['sky', 'coral', 'amber'][i]}${i === 2 ? '-deep' : ''})`, opacity: 0.9 }}>
                  {a.step}
                </span>
                <h3 className="mt-3 text-2xl">{a.title}</h3>
                <p className="mt-2 leading-relaxed" style={{ color: 'var(--slate)' }}>
                  {a.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== Online training explainer ===================== */}
      <section className="section" style={{ backgroundColor: 'var(--paper)' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto card-hard accent-sky p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <span
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ color: 'var(--sky-deep)', backgroundColor: 'var(--sky-soft)' }}
              >
                <Icon name="device" size={30} />
              </span>
              <div>
                <p className="eyebrow">What online training means</p>
                <h2 className="mt-2 text-2xl md:text-4xl">Your program, delivered through Everfit</h2>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 text-lg leading-relaxed" style={{ color: 'var(--slate)' }}>
              <p>
                For clients who already know their way around the gym, I write custom programs inside the Everfit
                app. You get a calendar of workouts you can open any day — each session laid out with video demos,
                your sets and reps, and notes written just for you.
              </p>
              <p>
                It&apos;s ideal if you travel, train on an unpredictable schedule, or just want fresh programming to
                break a plateau. Everything is tailored to you and adjusted as you progress — same personal coaching,
                from wherever you are.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              <span className="chip">Custom workouts</span>
              <span className="chip chip-coral">Video demos</span>
              <span className="chip chip-amber">Sets &amp; reps</span>
              <span className="chip">Coaching notes</span>
              <span className="chip chip-coral">Train anywhere</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CTA band ===================== */}
      <section className="relative overflow-hidden lanes-dark" style={{ backgroundColor: 'var(--sky-deep)' }}>
        <div className="container mx-auto px-4 py-20 text-center relative">
          <Emblem width={96} color="#fff" className="mx-auto" />
          <h2 className="mt-6 text-3xl md:text-5xl" style={{ color: '#fff' }}>
            Let&apos;s build your plan
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: 'rgba(234, 242, 248, 0.85)' }}>
            Reach out and tell me about your goals. I&apos;ll help you figure out the right way to train.
          </p>
          <div className="mt-8">
            <Link href="/contact" className="btn btn-light text-lg">
              Start Training
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
