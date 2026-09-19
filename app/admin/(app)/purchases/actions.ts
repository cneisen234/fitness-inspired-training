"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { stripe } from "@/lib/stripe";
import { field } from "@/lib/form";
import { flashToast } from "../flash";

// Refund a purchase via Stripe, then mark it refunded (the charge.refunded webhook
// flips it too — idempotent). If the charge was already refunded directly in
// Stripe, skip the refund call and just mark it refunded here.
export async function refundPurchase(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;

  const [purchase] = await db.select().from(purchases).where(eq(purchases.id, id));
  if (!purchase || purchase.status === "refunded") return;

  try {
    await stripe().refunds.create({ payment_intent: purchase.stripePaymentIntentId });
  } catch (e) {
    const code = (e as { code?: string })?.code;
    const alreadyRefunded =
      code === "charge_already_refunded" ||
      (e instanceof Error && /already been refunded/i.test(e.message));
    if (!alreadyRefunded) {
      await flashToast(`Refund failed: ${e instanceof Error ? e.message : "error"}`);
      return;
    }
    // Already refunded in Stripe — fall through and mark it refunded here.
  }

  await db.update(purchases).set({ status: "refunded" }).where(eq(purchases.id, id));
  await flashToast("Refund issued");
  revalidatePath("/admin/purchases");
}

// Delete a refunded purchase record (no Stripe call).
export async function deletePurchase(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db.delete(purchases).where(eq(purchases.id, id));
  await flashToast("Purchase removed");
  revalidatePath("/admin/purchases");
}
