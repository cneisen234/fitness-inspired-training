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
  redirect(`/admin/plans/${row.id}`);
}

// ---- save (+ Stripe sync), shared by Save / Activate / Deactivate ----
// forceActive: null = auto (live when it has a synced price), true = try to make
// live, false = hide. Save always persists the current field values first.
async function persistPlan(form: FormData, forceActive: boolean | null): Promise<void> {
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
    if (!stripeProductId) {
      const product = await s.products.create({ name, description: description || undefined });
      stripeProductId = product.id;
    } else {
      await s.products.update(stripeProductId, { name, description: description || undefined });
    }
    // Stripe Prices are immutable — rotate to a new one-time Price when the amount
    // changes (or none exists yet). Skip when the price is 0.
    if (priceCents > 0 && (priceCents !== existing.priceCents || !stripePriceId)) {
      const price = await s.prices.create({
        product: stripeProductId,
        unit_amount: priceCents,
        currency: "usd",
      });
      if (stripePriceId) await s.prices.update(stripePriceId, { active: false }).catch(() => {});
      stripePriceId = price.id;
    }
  } catch (e) {
    syncError = e instanceof Error ? e.message : "Stripe sync failed";
  }

  const canBeActive = priceCents > 0 && !!stripePriceId;
  const active = forceActive === null ? canBeActive : forceActive && canBeActive;

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
      active,
      updatedAt: new Date(),
    })
    .where(eq(plans.id, id));

  if (syncError) {
    await flashToast(`Saved, but Stripe sync failed: ${syncError}`);
  } else if (forceActive && !canBeActive) {
    await flashToast("Add a price to make this plan live");
  } else if (active) {
    await flashToast("Plan saved & live");
  } else if (forceActive === false) {
    await flashToast("Plan saved & hidden");
  } else {
    await flashToast("Plan saved — add a price to sell it");
  }

  revalidatePath("/admin/plans");
  revalidatePath(`/admin/plans/${id}`);
}

// Save → auto-activates when it has a synced price (per product spec).
export async function updatePlan(form: FormData): Promise<void> {
  return persistPlan(form, null);
}

// Activate → saves the current edits, then makes it live (syncing a price if needed).
export async function saveAndActivate(form: FormData): Promise<void> {
  return persistPlan(form, true);
}

// Deactivate → saves the current edits, then hides it.
export async function saveAndDeactivate(form: FormData): Promise<void> {
  return persistPlan(form, false);
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
