import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { purchases } from "@/lib/db/schema";
import { formatCents } from "@/lib/money";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminPurchasesPage() {
  const all = await db.select().from(purchases).orderBy(desc(purchases.createdAt));
  const paid = all.filter((p) => p.status === "paid");
  const revenueCents = paid.reduce((sum, p) => sum + p.amountPaidCents, 0);

  return (
    <>
      <h1 className="admin-h1">Purchases</h1>
      <p className="admin-sub">
        {all.length} purchase{all.length === 1 ? "" : "s"} · {formatCents(revenueCents)} collected
      </p>

      <div className="admin-tablewrap">
        <table className="admin-table cards item-cards">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Goals</th>
            </tr>
          </thead>
          <tbody>
            {all.map((p) => (
              <tr key={p.id}>
                <td data-label="Customer">
                  <span style={{ fontWeight: 700 }}>{p.customerName || "—"}</span>
                  <br />
                  <a href={`mailto:${p.customerEmail}`} className="admin-link">
                    {p.customerEmail}
                  </a>
                </td>
                <td data-label="Plan">{p.planName}</td>
                <td className="admin-num" data-label="Amount">
                  {formatCents(p.amountPaidCents)}
                </td>
                <td data-label="Date">{fmtDate(p.createdAt)}</td>
                <td data-label="Status">
                  <span className={`admin-tag ${p.status === "paid" ? "on" : "bad"}`}>
                    {p.status === "paid" ? "Paid" : "Refunded"}
                  </span>
                </td>
                <td data-label="Goals">
                  {p.customerNote ? p.customerNote : <span className="admin-muted">—</span>}
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty">
                  No purchases yet. Sales from the plans page appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
