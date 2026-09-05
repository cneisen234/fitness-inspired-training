// Shared Google reCAPTCHA v3 verification. Used by the contact + review endpoints.
// The SECRET key is server-only; the token comes from the browser (grecaptcha).

import "server-only";

const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");

type Result =
  | { ok: true }
  | { ok: false; reason: "server-misconfigured" | "failed" | "bad-action" | "low-score" };

export async function verifyRecaptcha(
  token: string,
  expectedAction: string,
  ip?: string,
): Promise<Result> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return { ok: false, reason: "server-misconfigured" };

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as {
    success: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };

  if (!data.success) return { ok: false, reason: "failed" };
  if (data.action && data.action !== expectedAction) {
    return { ok: false, reason: "bad-action" };
  }
  if (typeof data.score === "number" && data.score < MIN_SCORE) {
    return { ok: false, reason: "low-score" };
  }
  return { ok: true };
}
