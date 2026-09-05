import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { deletePost } from "./actions";
import ConfirmDelete from "../confirm-delete";
import { PenIcon, TrashIcon } from "../icons";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminBlogPage() {
  const all = await db.select().from(posts).orderBy(desc(posts.updatedAt));
  const published = all.filter((p) => p.status === "published").length;

  return (
    <>
      <div className="admin-row-between">
        <h1 className="admin-h1">Blog</h1>
        <div className="admin-actions">
          <Link href="/admin/blog/new" className="admin-btn">
            + New post
          </Link>
        </div>
      </div>
      <p className="admin-sub">
        {all.length} post{all.length === 1 ? "" : "s"} · {published} published
      </p>

      <div className="admin-tablewrap">
        <table className="admin-table cards item-cards">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {all.map((p) => (
              <tr key={p.id}>
                <td data-label="Title">
                  <Link href={`/admin/blog/${p.id}`} className="admin-link">
                    {p.title}
                  </Link>
                </td>
                <td data-label="Status">
                  <span className={`admin-tag ${p.status === "published" ? "on" : "muted"}`}>
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>
                <td data-label="Updated">{fmtDate(p.updatedAt)}</td>
                <td className="admin-num">
                  <div className="admin-actions">
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="admin-btn sm ghost"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <PenIcon />
                    </Link>
                    <ConfirmDelete
                      action={deletePost}
                      fields={{ id: p.id }}
                      title={`Delete “${p.title}”?`}
                      message="This permanently removes the post and its cover image. This can’t be undone."
                      triggerLabel={<TrashIcon />}
                      triggerAriaLabel="Delete post"
                    />
                  </div>
                </td>
              </tr>
            ))}
            {all.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty">
                  No posts yet. Start one with “New post”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
