import Link from "next/link";
import { createPost } from "../actions";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <>
      <h1 className="admin-h1">New post</h1>
      <p className="admin-sub">
        Give it a title to start — you can write the body, add a cover image, and
        publish on the next screen.
      </p>
      <form action={createPost} className="admin-card admin-form">
        <label className="admin-field">
          <span>Title</span>
          <input
            name="title"
            required
            autoFocus
            className="admin-input"
            placeholder="e.g. 5 mobility drills to start your week"
          />
        </label>
        <div className="admin-actions">
          <Link href="/admin/blog" className="admin-btn ghost">
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
