// Approved reviews for public display — server-only. Ordered by Ashley's manual
// sort, then most-recently approved. Used by the reviews page and the homepage.

import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

export type PublicReview = {
  id: string;
  name: string;
  body: string;
  duration: string | null;
  rating: number;
};

export async function getApprovedReviews(limit?: number): Promise<PublicReview[]> {
  const rows = await db
    .select({
      id: reviews.id,
      name: reviews.name,
      body: reviews.body,
      duration: reviews.duration,
      rating: reviews.rating,
    })
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(asc(reviews.sort), desc(reviews.approvedAt))
    .limit(limit ?? 1000);
  return rows;
}
