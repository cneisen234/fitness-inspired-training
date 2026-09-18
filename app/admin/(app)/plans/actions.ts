"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { stripe } from "@/lib/stripe";
import { field } from "@/lib/form";
import { dollarsToCents } from "@/lib/money";
import { flashToast } from "../flash";

// ---- create ----

export async function createPlan(form: FormData): Promise<void> {
  await requireAdmin();
  const name = field(form, "name") || "Untitled plan";
  const [{ c }] = await db.select({ c: sql<number>`count(*)::int` }).from(plans);
  const [row] = await db
    .insert(plans)
    .values({ name, sort: c })
    .returning({ id: plans.id });
  await flashToast("Plan created");
  // Stripe sync happens on first Save (once it has a price).
  redirect(`/admin/plans/${row.id}`);
}

// ---- update (+ Stripe sync) ----

export async function updatePlan(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const [existing] = await db.select().from(plans).where(eq(plans.id, id));
  if (!existing) return;

  const name = field(form, "name") || "Untitled plan";
  const tagline = field(form, "tagline") || null;
  const description = field(form, "description") || null;
  const features = form
    .getAll("features")
    .map((f) => String(f).trim())
    .filter(Boolean);
  const priceCents = dollarsToCents(field(form, "price"));

  let stripeProductId = existing.stripeProductId;
  let stripePriceId = existing.stripePriceId;
  let syncError: string | null = null;

  try {
    const s = stripe();
    // Product: create on first sync, otherwise keep name/description in step.
    if (!stripeProductId) {
      const product = await s.products.create({
        name,
        description: description || undefined,
      });
      stripeProductId = product.id;
    } else {
      await s.products.update(stripeProductId, {
        name,
        description: description || undefined,
      });
    }

    // Price: immutable in Stripe — create a new one-time Price and archive the
    // old whenever the amount changes (or none exists yet). Skip when price is 0.
    if (priceCents > 0 && (priceCents !== existing.priceCents || !stripePriceId)) {
      const price = await s.prices.create({
        product: stripeProductId,
        unit_amount: priceCents,
        currency: "usd",
      });
      if (stripePriceId) {
        await s.prices.update(stripePriceId, { active: false }).catch(() => {});
      }
      stripePriceId = price.id;
    }
  } catch (e) {
    syncError = e instanceof Error ? e.message : "Stripe sync failed";
  }

  await db
    .update(plans)
    .set({
      name,
      tagline,
      description,
      features,
      priceCents,
      stripeProductId,
      stripePriceId,
      // A plan can't stay active without a price.
      active: priceCents > 0 ? existing.active : false,
      updatedAt: new Date(),
    })
    .where(eq(plans.id, id));

  await flashToast(
    syncError ? `Saved, but Stripe sync failed: ${syncError}` : "Plan saved",
  );
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${id}`);
}

// ---- activate / deactivate ----

export async function activatePlan(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) return;
  if (!plan.stripePriceId || plan.priceCents <= 0) {
    await flashToast("Set a price and save before activating.");
    return;
  }
  await db.update(plans).set({ active: true, updatedAt: new Date() }).where(eq(plans.id, id));
  await flashToast("Plan is live");
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${id}`);
}

export async function deactivatePlan(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.update(plans).set({ active: false, updatedAt: new Date() }).where(eq(plans.id, id));
  await flashToast("Plan hidden");
  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${id}`);
}

// ---- reorder ----

export async function movePlan(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  const dir = field(form, "dir");
  if (!id || (dir !== "up" && dir !== "down")) return;

  const ordered = await db
    .select({ id: plans.id })
    .from(plans)
    .orderBy(asc(plans.sort), asc(plans.name));

  const idx = ordered.findIndex((p) => p.id === id);
  const swap = dir === "up" ? idx - 1 : idx + 1;
  if (idx < 0 || swap < 0 || swap >= ordered.length) return;

  [ordered[idx], ordered[swap]] = [ordered[swap], ordered[idx]];
  await Promise.all(
    ordered.map((p, i) => db.update(plans).set({ sort: i }).where(eq(plans.id, p.id))),
  );
  revalidatePath("/admin/plans");
}

// ---- delete ----

export async function deletePlan(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id));
  if (!plan) return;

  // Archive the Stripe Product + Price so nothing new can be bought, but keep the
  // records in Stripe for past-purchase history.
  if (plan.stripeProductId) {
    const s = stripe();
    if (plan.stripePriceId) {
      await s.prices.update(plan.stripePriceId, { active: false }).catch(() => {});
    }
    await s.products.update(plan.stripeProductId, { active: false }).catch(() => {});
  }

  await db.delete(plans).where(eq(plans.id, id));
  await flashToast("Plan deleted");
  revalidatePath("/admin/plans");
  redirect("/admin/plans");
}
