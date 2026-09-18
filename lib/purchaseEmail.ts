// Emails for a completed plan purchase: a notification to Ashley (so she can reach
// out and build the Everfit plan) and a confirmation to the buyer. Same email-safe
// approach as contactEmail.ts — table layout, inlined styles, escaped input.

import { formatCents } from "./money";

const C = {
  skyDeep: "#2c6e9b",
  coral: "#f2765c",
  cream: "#f3f8fb",
  charcoal: "#253340",
  slate: "#4a5a67",
  stone: "#7b8a96",
  border: "#dce6ed",
  headerSub: "#bcd7ea",
};
const FONT = "'Nunito', 'Segoe UI', Helvetica, Arial, sans-serif";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function shell(opts: { preheader: string; eyebrow: string; heading: string; intro: string; body: string; footer: string }): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" /><title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${C.border};">
        <tr><td style="background-color:${C.skyDeep};padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.3px;color:#ffffff;font-family:${FONT};">Fitness Inspired Training</p>
          <p style="margin:6px 0 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.headerSub};font-family:${FONT};">Personal Training &middot; Est. 2018</p>
        </td></tr>
        <tr><td style="height:5px;background-color:${C.coral};line-height:5px;font-size:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.coral};font-family:${FONT};">${opts.eyebrow}</p>
          <h1 style="margin:0 0 8px;font-size:24px;line-height:1.2;font-weight:800;color:${C.charcoal};font-family:${FONT};">${opts.heading}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${C.slate};font-family:${FONT};">${opts.intro}</p>
          ${opts.body}
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid ${C.border};">
          <p style="margin:0;font-size:12px;line-height:1.6;color:${C.stone};font-family:${FONT};">${opts.footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:14px 0;border-bottom:1px solid ${C.border};">
    <p style="margin:0 0 3px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.stone};font-family:${FONT};">${label}</p>
    <p style="margin:0;font-size:16px;font-weight:700;color:${C.charcoal};font-family:${FONT};">${value}</p>
  </td></tr>`;
}

export type PurchaseFields = {
  planName: string;
  amountCents: number;
  name?: string;
  email: string;
  note?: string;
};

// ---- To Ashley ----

export function buildPurchaseAdminText(p: PurchaseFields): string {
  return [
    "New plan purchase — Fitness Inspired Training",
    "",
    `Plan:     ${p.planName}`,
    `Amount:   ${formatCents(p.amountCents)}`,
    `Customer: ${p.name || "—"}`,
    `Email:    ${p.email}`,
    `Goals:    ${p.note || "—"}`,
    "",
    "Reach out to set them up in Everfit.",
    "",
    "—",
    "Sent from the plans checkout at fitnessinspiredtraining.com",
  ].join("\n");
}

export function buildPurchaseAdminHtml(p: PurchaseFields): string {
  const name = p.name ? escapeHtml(p.name) : "—";
  const email = escapeHtml(p.email);
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Plan", escapeHtml(p.planName))}
      ${row("Amount paid", formatCents(p.amountCents))}
      ${row("Customer", name)}
      ${row("Email", `<a href="mailto:${email}" style="color:${C.skyDeep};text-decoration:none;">${email}</a>`)}
      ${row("Their goals", p.note ? escapeHtml(p.note) : "—")}
    </table>`;
  return shell({
    preheader: `${escapeHtml(p.planName)} — ${formatCents(p.amountCents)} from ${name}`,
    eyebrow: "New plan purchase",
    heading: "You&rsquo;ve got a new client",
    intro: "Someone just bought a plan. Reach out to get them set up in Everfit:",
    body,
    footer: "Sent from the plans checkout at fitnessinspiredtraining.com.",
  });
}

// ---- To the customer ----

export function buildPurchaseCustomerText(p: PurchaseFields): string {
  return [
    `Thanks for your purchase — ${p.planName}`,
    "",
    `You bought: ${p.planName}`,
    `Amount:     ${formatCents(p.amountCents)}`,
    "",
    "Ashley will reach out personally to get your Everfit plan set up. Talk soon!",
    "",
    "—",
    "Fitness Inspired Training",
  ].join("\n");
}

export function buildPurchaseCustomerHtml(p: PurchaseFields): string {
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Your plan", escapeHtml(p.planName))}
      ${row("Amount", formatCents(p.amountCents))}
    </table>`;
  return shell({
    preheader: `Thanks for buying ${escapeHtml(p.planName)}`,
    eyebrow: "Purchase confirmed",
    heading: "You&rsquo;re in — thank you!",
    intro:
      "Thanks for your purchase. Ashley will reach out personally to get your Everfit plan set up around your goals.",
    body,
    footer: "Questions? Just reply to this email. — Fitness Inspired Training",
  });
}
