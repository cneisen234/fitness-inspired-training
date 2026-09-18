import Link from "next/link";
import { createPlan } from "../actions";

export const dynamic = "force-dynamic";

export default function NewPlanPage() {
  return (
    <>
      <h1 className="admin-h1">New plan</h1>
      <p className="admin-sub">
        Name it to start — you can add the price, description, and features on the next
        screen, then activate it once it’s synced to Stripe.
      </p>
      <form action={createPlan} className="admin-card admin-form">
        <label className="admin-field">
          <span>Name</span>
          <input
            name="name"
            required
            autoFocus
            className="admin-input"
            placeholder="e.g. Online Training — 3 months"
          />
        </label>
        <div className="admin-actions">
          <Link href="/admin/plans" className="admin-btn ghost">
            Cancel
          </Link>
          <button type="submit" className="admin-btn">
            Create &amp; continue
          </button>
        </div>
      </form>
    </>
  );
}
