"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";
import { flashToast } from "../flash";

// Approving publishes the review to the public reviews page (and homepage). It
// appends to the end of the published order.
export async function approveReview(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${reviews.sort}), -1)::int` })
    .from(reviews)
    .where(eq(reviews.status, "approved"));
  await db
    .update(reviews)
    .set({ status: "approved", approvedAt: new Date(), sort: max + 1 })
    .where(eq(reviews.id, id));
  await flashToast("Review approved");
  revalidatePath("/admin/reviews");
}

// Rejecting permanently deletes the submission.
export async function rejectReview(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(reviews).where(eq(reviews.id, id));
  await flashToast("Review rejected");
  revalidatePath("/admin/reviews");
}

// Take a published review back down (returns it to the pending queue).
export async function unpublishReview(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db
    .update(reviews)
    .set({ status: "pending", approvedAt: null })
    .where(eq(reviews.id, id));
  await flashToast("Moved back to pending");
  revalidatePath("/admin/reviews");
}

// Permanently delete a published review.
export async function deleteReview(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(reviews).where(eq(reviews.id, id));
  await flashToast("Review deleted");
  revalidatePath("/admin/reviews");
}

// Reorder a published review up/down. Renumbers the whole published set by its
// current order, then swaps the two neighbours — robust even if sorts collide.
export async function moveReview(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const dir = field(form, "dir");
  if (!id || (dir !== "up" && dir !== "down")) return;

  const approved = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.status, "approved"))
    .orderBy(asc(reviews.sort), desc(reviews.approvedAt));

  const idx = approved.findIndex((r) => r.id === id);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= approved.length) return;

  [approved[idx], approved[swap]] = [approved[swap], approved[idx]];
  await Promise.all(
    approved.map((r, i) =>
      db.update(reviews).set({ sort: i }).where(eq(reviews.id, r.id)),
    ),
  );
  revalidatePath("/admin/reviews");
}
