import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { StarIcon } from "@/components/Icons";
import ConfirmDelete from "../confirm-delete";
import { CheckIcon } from "../icons";
import {
  approveReview,
  rejectReview,
  unpublishReview,
  deleteReview,
  moveReview,
} from "./actions";

export const dynamic = "force-dynamic";

type Review = typeof reviews.$inferSelect;

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="admin-review-stars" aria-label={`${rating} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} size={16} className={n <= rating ? "" : "off"} />
      ))}
    </span>
  );
}

function ReviewCard({ r, children }: { r: Review; children: React.ReactNode }) {
  return (
    <div className="admin-card">
      <div className="admin-review-head">
        <span className="admin-review-name">{r.name}</span>
        <Stars rating={r.rating} />
      </div>
      <p className="admin-review-meta">
        {r.duration ? `Trained: ${r.duration} · ` : ""}
        {r.status === "approved"
          ? `Approved ${fmtDate(r.approvedAt)}`
          : `Submitted ${fmtDate(r.submittedAt)}`}
        {r.email ? (
          <>
            {" · "}
            <a href={`mailto:${r.email}`}>{r.email}</a>
          </>
        ) : null}
      </p>
      <p className="admin-review-body">{r.body}</p>
      <div className="admin-review-actions">{children}</div>
    </div>
  );
}

export default async function AdminReviewsPage() {
  const [pending, approved] = await Promise.all([
    db
      .select()
      .from(reviews)
      .where(eq(reviews.status, "pending"))
      .orderBy(desc(reviews.submittedAt)),
    db
      .select()
      .from(reviews)
      .where(eq(reviews.status, "approved"))
      .orderBy(asc(reviews.sort), desc(reviews.approvedAt)),
  ]);

  return (
    <>
      <h1 className="admin-h1">Reviews</h1>
      <p className="admin-sub">
        {pending.length} awaiting approval · {approved.length} published
      </p>

      {/* ---- Pending queue ---- */}
      <p className="admin-section-label">Awaiting approval</p>
      {pending.length === 0 ? (
        <div className="admin-card">
          <p className="admin-stub" style={{ margin: 0 }}>
            Nothing waiting. New submissions from the reviews page land here.
          </p>
        </div>
      ) : (
        pending.map((r) => (
          <ReviewCard key={r.id} r={r}>
            <form action={approveReview} className="admin-inline-form">
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="admin-btn sm">
                <CheckIcon /> Approve
              </button>
            </form>
            <ConfirmDelete
              action={rejectReview}
              fields={{ id: r.id }}
              title={`Reject ${r.name}’s review?`}
              message="Rejecting permanently deletes this submission. This can’t be undone."
              triggerClass="admin-btn sm danger"
              triggerLabel="Reject"
              confirmLabel="Reject & delete"
            />
          </ReviewCard>
        ))
      )}

      {/* ---- Published ---- */}
      <p className="admin-section-label">Published on the site</p>
      {approved.length === 0 ? (
        <div className="admin-card">
          <p className="admin-stub" style={{ margin: 0 }}>
            No published reviews yet. Approve one above and it appears on the reviews
            page and homepage.
          </p>
        </div>
      ) : (
        approved.map((r, i) => (
          <ReviewCard key={r.id} r={r}>
            <form action={moveReview} className="admin-inline-form">
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="dir" value="up" />
              <button
                type="submit"
                className="admin-btn sm ghost"
                disabled={i === 0}
                aria-label="Move up"
                title="Move up"
              >
                ↑
              </button>
            </form>
            <form action={moveReview} className="admin-inline-form">
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="dir" value="down" />
              <button
                type="submit"
                className="admin-btn sm ghost"
                disabled={i === approved.length - 1}
                aria-label="Move down"
                title="Move down"
              >
                ↓
              </button>
            </form>
            <span className="spacer" />
            <form action={unpublishReview} className="admin-inline-form">
              <input type="hidden" name="id" value={r.id} />
              <button type="submit" className="admin-btn sm ghost">
                Unpublish
              </button>
            </form>
            <ConfirmDelete
              action={deleteReview}
              fields={{ id: r.id }}
              title={`Delete ${r.name}’s review?`}
              message="This permanently removes the review from the site. This can’t be undone."
              triggerClass="admin-btn sm danger"
              triggerLabel="Delete"
            />
          </ReviewCard>
        ))
      )}
    </>
  );
}
