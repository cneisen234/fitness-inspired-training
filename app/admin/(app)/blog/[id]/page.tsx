import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import PostEditor from "./post-editor";
import CoverImage from "./cover-image";
import ConfirmDelete from "../../confirm-delete";
import { ExternalLinkIcon, SaveIcon, TrashIcon } from "../../icons";
import { publishPost, unpublishPost, updateSlug, deletePost } from "../actions";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) notFound();

  const isPublished = post.status === "published";

  return (
    <>
      <div className="admin-row-between" style={{ alignItems: "center" }}>
        <Link href="/admin/blog" className="admin-link">
          ← Blog
        </Link>
        <div className="admin-actions">
          <span className={`admin-tag ${isPublished ? "on" : "muted"}`}>
            {isPublished ? "Published" : "Draft"}
          </span>
          {isPublished && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noreferrer"
              className="admin-btn sm ghost"
              aria-label="View on site"
              title="View on site"
            >
              <ExternalLinkIcon />
            </a>
          )}
          {isPublished ? (
            <form action={unpublishPost} className="admin-inline-form">
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" className="admin-btn sm ghost">
                Unpublish
              </button>
            </form>
          ) : (
            <form action={publishPost} className="admin-inline-form">
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" className="admin-btn sm">
                Publish
              </button>
            </form>
          )}
        </div>
      </div>

      <h1 className="admin-h1" style={{ marginTop: 6 }}>
        {post.title}
      </h1>
      <p className="admin-sub">
        {isPublished ? `Published ${fmtDate(post.publishedAt)} · ` : ""}
        Last edited {fmtDate(post.updatedAt)}
      </p>

      {/* Title, excerpt, and the rich-text body (all auto-save) */}
      <PostEditor
        post={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          contentHtml: post.contentHtml,
        }}
      />

      {/* Cover image */}
      <div className="admin-card">
        <h2 className="admin-h2">Cover image</h2>
        <p className="admin-sub" style={{ marginBottom: 16 }}>
          Shown at the top of the post and on the blog index. Upload up to 8&nbsp;MB;
          large phone photos are fine.
        </p>
        <CoverImage postId={post.id} coverImageUrl={post.coverImageUrl} />
      </div>

      {/* URL slug */}
      <div className="admin-card">
        <h2 className="admin-h2">Link (URL slug)</h2>
        <form action={updateSlug}>
          <input type="hidden" name="id" value={post.id} />
          <div className="admin-field">
            <span>This post lives at /blog/…</span>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                name="slug"
                className="admin-input"
                defaultValue={post.slug}
                placeholder="my-post"
                style={{ flex: 1 }}
              />
              <button type="submit" className="admin-btn ghost" aria-label="Save link" title="Save link">
                <SaveIcon />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="admin-card">
        <h2 className="admin-h2">Delete</h2>
        <div className="admin-row-between" style={{ alignItems: "center" }}>
          <p className="admin-stub" style={{ margin: 0 }}>
            Permanently remove this post and its cover image. This can’t be undone.
          </p>
          <ConfirmDelete
            action={deletePost}
            fields={{ id: post.id }}
            title={`Delete “${post.title}”?`}
            message="This action can't be undone."
            triggerLabel={<TrashIcon />}
            triggerAriaLabel="Delete post"
          />
        </div>
      </div>
    </>
  );
}
