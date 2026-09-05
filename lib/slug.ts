// URL slug helpers for blog posts — server-only (ensureUniqueSlug hits the DB).

import "server-only";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";

/** Normalize any string into a URL-safe slug: lowercase, hyphen-separated. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents (combining marks)
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 80);
}

/**
 * Return a slug guaranteed unique across posts. Starts from `desired` (or a
 * fallback), and appends -2, -3, … if another post already owns it. `excludeId`
 * skips the post being edited so it can keep its own slug.
 */
export async function ensureUniqueSlug(
  desired: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(desired) || "post";
  let candidate = base;
  let n = 2;

  // Loop until no OTHER post holds the candidate slug.
  for (;;) {
    const clash = await db
      .select({ id: posts.id })
      .from(posts)
      .where(
        excludeId
          ? and(eq(posts.slug, candidate), ne(posts.id, excludeId))
          : eq(posts.slug, candidate),
      )
      .limit(1);
    if (clash.length === 0) return candidate;
    candidate = `${base}-${n++}`;
  }
}
