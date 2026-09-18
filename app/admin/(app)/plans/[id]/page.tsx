import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { formatCents } from "@/lib/money";
import PlanForm from "./plan-form";
import { activatePlan, deactivatePlan } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [plan] = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  if (!plan) notFound();

  return (
    <>
      <div className="admin-row-between" style={{ alignItems: "center" }}>
        <Link href="/admin/plans" className="admin-link">
          ← Plans
        </Link>
        <div className="admin-actions">
          <span className={`admin-tag ${plan.active ? "on" : "muted"}`}>
            {plan.active ? "Active" : "Inactive"}
          </span>
          {plan.active ? (
            <form action={deactivatePlan} className="admin-inline-form">
              <input type="hidden" name="id" value={plan.id} />
              <button type="submit" className="admin-btn sm ghost">
                Deactivate
              </button>
            </form>
          ) : (
            <form action={activatePlan} className="admin-inline-form">
              <input type="hidden" name="id" value={plan.id} />
              <button type="submit" className="admin-btn sm">
                Activate
              </button>
            </form>
          )}
        </div>
      </div>

      <h1 className="admin-h1" style={{ marginTop: 6 }}>
        {plan.name}
      </h1>
      <p className="admin-sub">
        {plan.priceCents > 0 ? formatCents(plan.priceCents) : "No price set"} · one-time
      </p>

      <PlanForm
        plan={{
          id: plan.id,
          name: plan.name,
          tagline: plan.tagline,
          description: plan.description,
          priceCents: plan.priceCents,
          features: plan.features,
        }}
      />
    </>
  );
}
