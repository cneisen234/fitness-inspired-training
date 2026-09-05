// Review submission handler. A public visitor submits a review; we (1) drop bots
// via a honeypot, (2) verify reCAPTCHA, (3) store it as `pending` in Postgres for
// Ashley to approve/reject in the admin, and (4) email her a heads-up.
//
// Submitting a review is consent to have it published if Ashley approves it — the
// form says so — so there's no separate consent flag.

import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { buildReviewHtml, buildReviewText } from "@/lib/contactEmail";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendEmail } from "@/lib/sendgrid";

type Payload = {
  name?: string;
  email?: string;
  rating?: number | string;
  duration?: string;
  message?: string;
  token?: string;
  company?: string; // honeypot
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

function misconfigured() {
  return bad("The form isn’t fully set up yet. Please try again soon.", 503);
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return bad("Invalid request.");
  }

  // 1. Honeypot — pretend success so bots don't learn anything.
  if (payload.company && payload.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const name = payload.name?.trim();
  const message = payload.message?.trim();
  const email = payload.email?.trim();
  const rating = Math.round(Number(payload.rating));
  const duration = payload.duration?.trim() || undefined;

  // 2. Validate.
  if (!name || !message) {
    return bad("Please add your name and a few words for your review.");
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return bad("Please choose a star rating from 1 to 5.");
  }
  if (email && !EMAIL_RE.test(email)) {
    return bad("Please enter a valid email address (or leave it blank).");
  }
  if (!payload.token) {
    return bad("Missing verification token. Please refresh and try again.");
  }

  // 3. reCAPTCHA v3.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const check = await verifyRecaptcha(payload.token, "review", ip);
  if (!check.ok) {
    if (check.reason === "server-misconfigured") return misconfigured();
    return bad("We couldn’t verify that you’re human. Please try again.", 403);
  }

  // 4. Store as pending (Ashley moderates it in the admin).
  try {
    await db.insert(reviews).values({
      name,
      rating,
      body: message,
      duration,
      email: email || null,
      status: "pending",
    });
  } catch {
    return bad("Something went wrong saving your review. Please try again.", 500);
  }

  // 5. Email Ashley a heads-up. A delivery failure here shouldn't lose the review
  // (it's already stored), so we don't fail the request on a send error.
  await sendEmail({
    subject: `New ${rating}-star review from ${name} — awaiting approval`,
    text: buildReviewText({ name, email, rating, duration, consent: true, message }),
    html: buildReviewHtml({ name, email, rating, duration, consent: true, message }),
    replyTo: email ? { email, name } : undefined,
  }).catch(() => {});

  return Response.json({ ok: true });
}
