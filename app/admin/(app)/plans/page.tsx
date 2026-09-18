import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { plans } from "@/lib/db/schema";
import { formatCents } from "@/lib/money";
import { deletePlan, movePlan } from "./actions";
import ConfirmDelete from "../confirm-delete";
import { PenIcon, TrashIcon } from "../icons";

export const dynamic = "force-dynamic";

export default async function AdminPlansPage() {
  const all = await db.select().from(plans).orderBy(asc(plans.sort), asc(plans.name));
  const active = all.filter((p) => p.active).length;

  return (
    <>
      <div className="admin-row-between">
        <h1 className="admin-h1">Plans</h1>
        <div className="admin-actions">
          <Link href="/admin/plans/new" className="admin-btn">
            + New plan
          </Link>
        </div>
      </div>
      <p className="admin-sub">
        {all.length} plan{all.length === 1 ? "" : "s"} · {active} active
      </p>

      <div className="admin-tablewrap">
        <table className="admin-table cards item-cards plan-cards">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Status</th>
              <th>Order</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {all.map((p, i) => (
              <tr key={p.id}>
                <td data-label="Name">
                  <Link href={`/admin/plans/${p.id}`} className="admin-link">
                    {p.name}
                  </Link>
                </td>
                <td className="admin-num" data-label="Price">
                  {p.priceCents > 0 ? formatCents(p.priceCents) : <span className="admin-muted">—</span>}
                </td>
                <td data-label="Status">
                  <span className={`admin-tag ${p.active ? "on" : "muted"}`}>
                    {p.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td data-label="Order">
                  <div className="admin-actions" style={{ justifyContent: "flex-start" }}>
                    <form action={movePlan} className="admin-inline-form">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button type="submit" className="admin-btn sm ghost" disabled={i === 0} aria-label="Move up" title="Move up">
                        ↑
                      </button>
                    </form>
                    <form action={movePlan} className="admin-inline-form">
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button type="submit" className="admin-btn sm ghost" disabled={i === all.length - 1} aria-label="Move down" title="Move down">
                        ↓
                      </button>
                    </form>
                  </div>
                </td>
                <td className="admin-num">
                  <div className="admin-actions">
                    <Link href={`/admin/plans/${p.id}`} className="admin-btn sm ghost" aria-label="Edit" title="Edit">
                      <PenIcon />
                    </Link>
                    <ConfirmDelete
                      action={deletePlan}
                      fields={{ id: p.id }}
                      title={`Delete “${p.name}”?`}
                      message="This removes the plan and archives it in Stripe. This can’t be undone."
                      triggerLabel={<TrashIcon />}
                      triggerAriaLabel="Delete plan"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty">
                  No plans yet. Create one with “New plan”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
