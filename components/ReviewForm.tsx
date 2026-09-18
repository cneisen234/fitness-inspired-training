'use client';

import Script from 'next/script';
import { useState } from 'react';
import { StarIcon } from './Icons';

// reCAPTCHA v3 runs invisibly: on submit we ask Google for a token tied to the
// "review" action, then send it to /api/reviews where the score is verified.
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

type Status = 'idle' | 'submitting' | 'success' | 'error';

function getToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const g = window.grecaptcha;
    if (!g || !SITE_KEY) return reject(new Error('recaptcha-unavailable'));
    g.ready(() => g.execute(SITE_KEY, { action: 'review' }).then(resolve).catch(reject));
  });
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.75rem',
  border: '1.5px solid var(--border)',
  backgroundColor: 'var(--paper)',
  padding: '0.7rem 0.9rem',
  color: 'var(--charcoal)',
  fontSize: '0.95rem',
};

export default function ReviewForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (rating < 1) {
      setStatus('error');
      setError('Please choose a star rating.');
      return;
    }

    setStatus('submitting');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const payload = {
      name: data.name,
      email: data.email,
      duration: data.duration,
      message: data.message,
      rating,
      company: data.company,
    };

    try {
      let token = '';
      try {
        token = await getToken();
      } catch {
        throw new Error('Spam protection isn’t ready yet. Please refresh and try again.');
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, token }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || 'Something went wrong. Please try again.');

      setStatus('success');
      form.reset();
      setRating(0);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div
          className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
          style={{ backgroundColor: 'var(--sky-soft)', color: 'var(--sky-deep)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-2xl">Thank you!</h3>
        <p className="mt-2 max-w-sm mx-auto" style={{ color: 'var(--slate)' }}>
          Thanks for sharing your experience — Ashley reviews each one personally before it goes
          up on the site.
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="btn btn-outline mt-6">
          Leave another
        </button>
      </div>
    );
  }

  return (
    <>
      {SITE_KEY && (
        <Script src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`} strategy="afterInteractive" />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <Label>Name</Label>
            <input name="name" type="text" required autoComplete="name" placeholder="Jamie Rivera" style={fieldStyle} />
          </label>
          <label className="block">
            <Label>Email (optional)</Label>
            <input name="email" type="email" autoComplete="email" placeholder="you@email.com" style={fieldStyle} />
          </label>
        </div>

        {/* Star rating */}
        <div>
          <Label>Your rating</Label>
          <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = (hovered || rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  aria-pressed={rating === n}
                  onMouseEnter={() => setHovered(n)}
                  onClick={() => setRating(n)}
                  className="p-1 transition-transform hover:scale-110"
                  style={{ color: on ? 'var(--amber)' : 'var(--border)', lineHeight: 0 }}
                >
                  <StarIcon size={30} />
                </button>
              );
            })}
            {rating > 0 && (
              <span className="ml-2 text-sm font-bold" style={{ color: 'var(--stone)' }}>{rating}/5</span>
            )}
          </div>
        </div>

        <label className="block">
          <Label>How long have you trained with Ashley? (optional)</Label>
          <input name="duration" type="text" placeholder="e.g. About a year" style={fieldStyle} />
        </label>

        <label className="block">
          <Label>Your review</Label>
          <textarea name="message" required rows={4} placeholder="Share how training with Ashley has gone for you..." style={fieldStyle} />
        </label>

        {/* Honeypot — visually hidden; bots fill it, humans don't. */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label>
            Company
            <input name="company" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {status === 'error' && (
          <p
            className="text-sm rounded-xl px-4 py-3"
            style={{ backgroundColor: 'var(--coral-soft)', color: 'var(--coral-deep)', fontWeight: 600 }}
            role="alert"
          >
            {error}
          </p>
        )}

        <button type="submit" disabled={status === 'submitting'} className="btn btn-coral w-full text-lg" style={status === 'submitting' ? { opacity: 0.7 } : undefined}>
          {status === 'submitting' ? 'Sending…' : 'Submit review'}
        </button>

        <p className="text-xs text-center" style={{ color: 'var(--stone)' }}>
          Reviews are read by Ashley and published after approval.
        </p>

        {!SITE_KEY && (
          <p className="text-xs text-center" style={{ color: 'var(--stone)' }}>
            <span className="placeholder-tag">Setup pending</span> Spam protection keys not yet configured.
          </p>
        )}

        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--stone)' }}>
          Protected by reCAPTCHA. The Google{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>{' '}
          and{' '}
          <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">Terms of Service</a>{' '}
          apply.
        </p>
      </form>
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block mb-1.5 text-sm font-bold" style={{ color: 'var(--charcoal)' }}>
      {children}
    </span>
  );
}
