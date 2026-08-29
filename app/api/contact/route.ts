// Contact form handler.
//
// Handles two kinds of submission from the site's form — a general inquiry and
// a client review. For each we (1) drop obvious bots via a honeypot, (2) verify
// the reCAPTCHA v3 token and risk score, then (3) email Ashley the submission
// through Twilio SendGrid (branded HTML + plain-text).
//
// Everything is driven by env vars (see .env.example). If a key is missing we
// fail loudly with a clear message rather than pretending the message sent.

import {
  buildContactHtml,
  buildContactText,
  buildReviewHtml,
  buildReviewText,
} from '@/lib/contactEmail';

type Payload = {
  type?: 'inquiry' | 'review';
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
  rating?: number | string; // review only
  duration?: string; // review only
  consent?: boolean; // review only
  token?: string;
  company?: string; // honeypot — real users never fill this
};

const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

async function verifyRecaptcha(token: string, ip?: string) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false as const, reason: 'server-misconfigured' as const };

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = (await res.json()) as {
    success: boolean;
    score?: number;
    action?: string;
    'error-codes'?: string[];
  };

  if (!data.success) return { ok: false as const, reason: 'failed' as const, data };
  if (data.action && data.action !== 'contact') return { ok: false as const, reason: 'bad-action' as const, data };
  if (typeof data.score === 'number' && data.score < MIN_SCORE) {
    return { ok: false as const, reason: 'low-score' as const, data };
  }
  return { ok: true as const, data };
}

async function sendViaSendGrid(opts: {
  subject: string;
  text: string;
  html: string;
  replyTo?: { email: string; name: string };
}) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return { ok: false as const, reason: 'server-misconfigured' as const };

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: 'Fitness Inspired Training' },
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      // SendGrid requires content parts in increasing preference: text first, HTML last.
      content: [
        { type: 'text/plain', value: opts.text },
        { type: 'text/html', value: opts.html },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return { ok: false as const, reason: 'send-failed' as const, detail };
  }
  return { ok: true as const };
}

function misconfigured() {
  return bad('The form isn’t fully set up yet. Please try again soon.', 503);
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return bad('Invalid request.');
  }

  // 1. Honeypot — pretend success so bots don't learn anything.
  if (payload.company && payload.company.trim() !== '') {
    return Response.json({ ok: true });
  }

  const isReview = payload.type === 'review';
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const message = payload.message?.trim();

  // 2. Validate per submission type.
  if (isReview) {
    const rating = Math.round(Number(payload.rating));
    if (!name || !message) {
      return bad('Please add your name and a few words for your review.');
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return bad('Please choose a star rating from 1 to 5.');
    }
    if (email && !EMAIL_RE.test(email)) {
      return bad('Please enter a valid email address (or leave it blank).');
    }
  } else {
    if (!name || !email || !message) {
      return bad('Please fill in your name, email, and a message.');
    }
    if (!EMAIL_RE.test(email)) {
      return bad('Please enter a valid email address.');
    }
  }

  if (!payload.token) {
    return bad('Missing verification token. Please refresh and try again.');
  }

  // 3. reCAPTCHA v3.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const check = await verifyRecaptcha(payload.token, ip);
  if (!check.ok) {
    if (check.reason === 'server-misconfigured') return misconfigured();
    return bad('We couldn’t verify that you’re human. Please try again.', 403);
  }

  // 4. Build + send the right email.
  let sent;
  if (isReview) {
    const fields = {
      name: name!,
      email: email || undefined,
      rating: Math.round(Number(payload.rating)),
      duration: payload.duration?.trim() || undefined,
      consent: Boolean(payload.consent),
      message: message!,
    };
    sent = await sendViaSendGrid({
      subject: `New ${fields.rating}-star review from ${fields.name}`,
      text: buildReviewText(fields),
      html: buildReviewHtml(fields),
      replyTo: fields.email ? { email: fields.email, name: fields.name } : undefined,
    });
  } else {
    const fields = {
      name: name!,
      email: email!,
      phone: payload.phone?.trim() || undefined,
      interest: payload.interest?.trim() || undefined,
      message: message!,
    };
    sent = await sendViaSendGrid({
      subject: `New inquiry from ${fields.name}${fields.interest ? ` — ${fields.interest}` : ''}`,
      text: buildContactText(fields),
      html: buildContactHtml(fields),
      replyTo: { email: fields.email, name: fields.name },
    });
  }

  if (!sent.ok) {
    if (sent.reason === 'server-misconfigured') return misconfigured();
    return bad('Something went wrong sending your message. Please try again.', 502);
  }

  return Response.json({ ok: true });
}
