// Money helpers. All amounts in this app are integer cents; these are the one
// place we convert to/from that representation. Pure and safe on client + server.

/** Format integer cents as a dollar string, e.g. 4500 -> "$45.00". */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Parse a dollar string (e.g. "45.00") to integer cents. Invalid/negative -> 0. */
export function dollarsToCents(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : 0;
}

/** Integer cents as a plain dollar amount for an input value, e.g. 4500 -> "45.00". */
export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
