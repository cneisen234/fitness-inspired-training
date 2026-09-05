// Contact form handler — general inquiries only. Reviews have their own endpoint
// (app/api/reviews) since they're stored + moderated, not just emailed.
//
// Flow: (1) drop obvious bots via a honeypot, (2) verify the reCAPTCHA v3 token
// and risk score, then (3) email Ashley the inquiry through SendGrid.

import { buildContactHtml, buildContactText } from "@/lib/contactEmail";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { sendEmail } from "@/lib/sendgrid";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  message?: string;
  token?: string;
  company?: string; // honeypot — real users never fill this
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
  const email = payload.email?.trim();
  const message = payload.message?.trim();

  // 2. Validate.
  if (!name || !email || !message) {
    return bad("Please fill in your name, email, and a message.");
  }
  if (!EMAIL_RE.test(email)) {
    return bad("Please enter a valid email address.");
  }
  if (!payload.token) {
    return bad("Missing verification token. Please refresh and try again.");
  }

  // 3. reCAPTCHA v3.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const check = await verifyRecaptcha(payload.token, "contact", ip);
  if (!check.ok) {
    if (check.reason === "server-misconfigured") return misconfigured();
    return bad("We couldn’t verify that you’re human. Please try again.", 403);
  }

  // 4. Build + send the inquiry email.
  const fields = {
    name,
    email,
    phone: payload.phone?.trim() || undefined,
    interest: payload.interest?.trim() || undefined,
    message,
  };
  const sent = await sendEmail({
    subject: `New inquiry from ${fields.name}${fields.interest ? ` — ${fields.interest}` : ""}`,
    text: buildContactText(fields),
    html: buildContactHtml(fields),
    replyTo: { email: fields.email, name: fields.name },
  });

  if (!sent.ok) {
    if (sent.reason === "server-misconfigured") return misconfigured();
    return bad("Something went wrong sending your message. Please try again.", 502);
  }

  return Response.json({ ok: true });
}
