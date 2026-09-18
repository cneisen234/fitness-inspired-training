// Shared Twilio SendGrid sender. Used by the contact + review endpoints to email
// Ashley. All addresses come from env; a missing key fails loudly (never silently
// pretends to have sent).

import "server-only";

type SendResult =
  | { ok: true }
  | { ok: false; reason: "server-misconfigured" | "send-failed"; detail?: string };

export async function sendEmail(opts: {
  subject: string;
  text: string;
  html: string;
  replyTo?: { email: string; name: string };
  to?: string; // defaults to CONTACT_TO_EMAIL (Ashley's inbox)
}): Promise<SendResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  const to = opts.to ?? process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!apiKey || !to || !from) return { ok: false, reason: "server-misconfigured" };

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: "Fitness Inspired Training" },
      ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      subject: opts.subject,
      // SendGrid requires content parts in increasing preference: text, then HTML.
      content: [
        { type: "text/plain", value: opts.text },
        { type: "text/html", value: opts.html },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return { ok: false, reason: "send-failed", detail };
  }
  return { ok: true };
}
