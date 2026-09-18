'use client';

import Script from 'next/script';
import { useState } from 'react';

// reCAPTCHA v3 runs invisibly: on submit we ask Google for a token tied to the
// "contact" action, then send it to /api/contact where the score is verified.
declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

const INTERESTS = ['In-person training', 'Online training', 'Hybrid coaching', 'Not sure yet'];

type Status = 'idle' | 'submitting' | 'success' | 'error';

function getToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const g = window.grecaptcha;
    if (!g || !SITE_KEY) return reject(new Error('recaptcha-unavailable'));
    g.ready(() => g.execute(SITE_KEY, { action: 'contact' }).then(resolve).catch(reject));
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

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setStatus('submitting');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      interest: data.interest,
      message: data.message,
      company: data.company,
    };

    try {
      let token = '';
      try {
        token = await getToken();
      } catch {
        throw new Error('Spam protection isn’t ready yet. Please refresh and try again.');
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, token }),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || 'Something went wrong. Please try again.');

      setStatus('success');
      form.reset();
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
        <h3 className="mt-4 text-2xl">Message sent!</h3>
        <p className="mt-2" style={{ color: 'var(--slate)' }}>
          Thanks for reaching out — Ashley will get back to you soon.
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="btn btn-outline mt-6">
          Send another
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
            <Label>Email</Label>
            <input name="email" type="email" required autoComplete="email" placeholder="you@email.com" style={fieldStyle} />
          </label>
        </div>

        <label className="block">
          <Label>Phone (optional)</Label>
          <input name="phone" type="tel" autoComplete="tel" placeholder="(555) 123-4567" style={fieldStyle} />
        </label>
        <label className="block">
          <Label>I&apos;m interested in</Label>
          <select name="interest" defaultValue={INTERESTS[0]} style={fieldStyle}>
            {INTERESTS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <Label>Your goals</Label>
          <textarea name="message" required rows={4} placeholder="Tell me a little about what you're hoping to work on..." style={fieldStyle} />
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
          {status === 'submitting' ? 'Sending…' : 'Send message'}
        </button>

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
