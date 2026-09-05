import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, reviews } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [published, drafts, pending, approved] = await Promise.all([
    db.select({ c: count() }).from(posts).where(eq(posts.status, "published")),
    db.select({ c: count() }).from(posts).where(eq(posts.status, "draft")),
    db.select({ c: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ c: count() }).from(reviews).where(eq(reviews.status, "approved")),
  ]);

  const pendingCount = pending[0]?.c ?? 0;

  return (
    <>
      <h1 className="admin-h1">Dashboard</h1>
      <p className="admin-sub">
        {pendingCount > 0 ? (
          <span className="admin-pill off">
            ● {pendingCount} review{pendingCount === 1 ? "" : "s"} awaiting approval
          </span>
        ) : (
          <span className="admin-pill on">● No reviews waiting</span>
        )}
      </p>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <div className="n">{published[0]?.c ?? 0}</div>
          <div className="l">Published posts</div>
        </div>
        <div className="admin-stat">
          <div className="n">{drafts[0]?.c ?? 0}</div>
          <div className="l">Drafts</div>
        </div>
        <div className="admin-stat">
          <div className="n">{pendingCount}</div>
          <div className="l">Pending reviews</div>
        </div>
        <div className="admin-stat">
          <div className="n">{approved[0]?.c ?? 0}</div>
          <div className="l">Approved reviews</div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="admin-h2">Quick links</h2>
        <div className="admin-actions" style={{ justifyContent: "flex-start" }}>
          <Link href="/admin/blog" className="admin-btn">
            Manage blog
          </Link>
          <Link href="/admin/reviews" className="admin-btn blue">
            Review submissions
          </Link>
        </div>
        <p className="admin-stub" style={{ margin: "14px 0 0" }}>
          Write and publish posts, and approve or reject client reviews. Subscription
          plans (Stripe) arrive in Phase 2.
        </p>
      </div>
    </>
  );
}
