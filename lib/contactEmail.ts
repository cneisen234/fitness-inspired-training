// Builds the notification emails Ashley receives — for a general inquiry and
// for a client review — each as branded HTML plus a plain-text fallback.
//
// Email clients are not browsers: table layout, fully inlined styles, safe web
// fonts, and — critically — every piece of user input is HTML-escaped before it
// touches the markup. No shared CSS, no external assets (so nothing breaks in
// an inbox before the domain is live).

export type ContactFields = {
  name: string;
  email: string;
  phone?: string;
  interest?: string;
  message: string;
};

export type ReviewFields = {
  name: string;
  email?: string;
  rating: number; // 1–5
  duration?: string; // e.g. "About a year"
  consent: boolean; // OK to feature on the website
  message: string; // the review text
};

// Brand palette (mirrors globals.css — hard-coded because email has no vars).
const C = {
  skyDeep: '#2c6e9b',
  coral: '#f2765c',
  amber: '#f2b84b',
  cream: '#f3f8fb',
  charcoal: '#253340',
  slate: '#4a5a67',
  stone: '#7b8a96',
  border: '#dce6ed',
  headerSub: '#bcd7ea',
};

const FONT = "'Nunito', 'Segoe UI', Helvetica, Arial, sans-serif";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function field(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${C.border};">
        <p style="margin:0 0 3px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.stone};font-family:${FONT};">${label}</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:${C.charcoal};font-family:${FONT};">${value}</p>
      </td>
    </tr>`;
}

function messageBlock(label: string, html: string): string {
  return `
    <p style="margin:24px 0 8px;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${C.stone};font-family:${FONT};">${label}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color:${C.cream};border-left:4px solid ${C.coral};border-radius:0 8px 8px 0;padding:16px 18px;">
          <p style="margin:0;font-size:15px;line-height:1.65;color:${C.charcoal};font-family:${FONT};">${html}</p>
        </td>
      </tr>
    </table>`;
}

// Full HTML document wrapper: brand header, coral pulse accent, body, footer.
function emailShell(opts: { preheader: string; eyebrow: string; heading: string; intro: string; body: string; footer: string }): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light only" />
<title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${C.border};">
          <tr>
            <td style="background-color:${C.skyDeep};padding:28px 32px;">
              <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.3px;color:#ffffff;font-family:${FONT};">Fitness Inspired Training</p>
              <p style="margin:6px 0 0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${C.headerSub};font-family:${FONT};">Personal Training &middot; Est. 2018</p>
            </td>
          </tr>
          <tr><td style="height:5px;background-color:${C.coral};line-height:5px;font-size:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${C.coral};font-family:${FONT};">${opts.eyebrow}</p>
              <h1 style="margin:0 0 8px;font-size:24px;line-height:1.2;font-weight:800;color:${C.charcoal};font-family:${FONT};">${opts.heading}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${C.slate};font-family:${FONT};">${opts.intro}</p>
              ${opts.body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${C.border};">
              <p style="margin:0;font-size:12px;line-height:1.6;color:${C.stone};font-family:${FONT};">${opts.footer}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function replyButton(email: string, name: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        <td style="border-radius:9999px;background-color:${C.coral};">
          <a href="mailto:${email}?subject=Re:%20Your%20message%20to%20Fitness%20Inspired%20Training" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;font-family:${FONT};">Reply to ${name}</a>
        </td>
      </tr>
    </table>`;
}

// ---- Inquiry -----------------------------------------------------------------

export function buildContactText(p: ContactFields): string {
  return [
    'New contact form submission — Fitness Inspired Training',
    '',
    `Name:     ${p.name}`,
    `Email:    ${p.email}`,
    `Phone:    ${p.phone || '—'}`,
    `Interest: ${p.interest || '—'}`,
    '',
    'Message:',
    p.message,
    '',
    '—',
    'Sent from the contact form at fitnessinspiredtraining.com',
    'Reply directly to this email to respond to the sender.',
  ].join('\n');
}

export function buildContactHtml(p: ContactFields): string {
  const name = escapeHtml(p.name);
  const email = escapeHtml(p.email);
  const phone = p.phone ? escapeHtml(p.phone) : '—';
  const interest = p.interest ? escapeHtml(p.interest) : '—';
  const message = escapeHtml(p.message).replace(/\r?\n/g, '<br />');

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${field('Name', name)}
      ${field('Email', `<a href="mailto:${email}" style="color:${C.skyDeep};text-decoration:none;">${email}</a>`)}
      ${field('Phone', phone)}
      ${field('Interested in', interest)}
    </table>
    ${messageBlock('Their message', message)}
    ${replyButton(email, name)}`;

  return emailShell({
    preheader: `New inquiry from ${name}${p.interest ? ` — ${interest}` : ''}`,
    eyebrow: 'New contact inquiry',
    heading: 'You&rsquo;ve got a new message',
    intro: 'Someone reached out through your website. Here are their details:',
    body,
    footer: `Sent from the contact form at fitnessinspiredtraining.com. You can reply directly to this email &mdash; it goes straight to ${name}.`,
  });
}

// ---- Review ------------------------------------------------------------------

function starsText(rating: number): string {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

export function buildReviewText(p: ReviewFields): string {
  return [
    'New client review — Fitness Inspired Training',
    '',
    `Name:        ${p.name}`,
    `Rating:      ${starsText(p.rating)} (${p.rating}/5)`,
    `Email:       ${p.email || '—'}`,
    `Trained for: ${p.duration || '—'}`,
    `OK to post:  ${p.consent ? 'Yes — may be featured on the website' : 'No — keep private'}`,
    '',
    'Review:',
    p.message,
    '',
    '—',
    'Sent from the review form at fitnessinspiredtraining.com',
  ].join('\n');
}

export function buildReviewHtml(p: ReviewFields): string {
  const name = escapeHtml(p.name);
  const email = p.email ? escapeHtml(p.email) : '';
  const duration = p.duration ? escapeHtml(p.duration) : '—';
  const message = escapeHtml(p.message).replace(/\r?\n/g, '<br />');
  const r = Math.max(0, Math.min(5, Math.round(p.rating)));
  const stars = `<span style="color:${C.amber};font-size:20px;letter-spacing:2px;">${'★'.repeat(r)}</span><span style="color:${C.border};font-size:20px;letter-spacing:2px;">${'★'.repeat(5 - r)}</span> <span style="font-size:13px;color:${C.stone};font-weight:700;">${r}/5</span>`;

  const consent = p.consent
    ? `<span style="color:#1f7a4d;font-weight:700;">Yes &mdash; may be featured on the website</span>`
    : `<span style="color:${C.stone};font-weight:700;">Not granted &mdash; keep private</span>`;

  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${field('Name', name)}
      ${field('Rating', stars)}
      ${field('Email', email ? `<a href="mailto:${email}" style="color:${C.skyDeep};text-decoration:none;">${email}</a>` : '—')}
      ${field('Trained for', duration)}
      ${field('OK to feature publicly', consent)}
    </table>
    ${messageBlock('Their review', message)}
    ${email ? replyButton(email, name) : ''}`;

  return emailShell({
    preheader: `New ${r}-star review from ${name}`,
    eyebrow: 'New client review',
    heading: 'You&rsquo;ve got a new review',
    intro: p.consent
      ? 'A client left a review and gave the okay to feature it on your website.'
      : 'A client left a review. They did not grant permission to publish it — reach out before featuring it.',
    body,
    footer: 'Sent from the review form at fitnessinspiredtraining.com.',
  });
}
