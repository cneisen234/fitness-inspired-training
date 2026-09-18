"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/dal";
import { field } from "@/lib/form";
import { ensureUniqueSlug } from "@/lib/slug";
import { sanitizePostHtml } from "@/lib/sanitize";
import { flashToast } from "../flash";

const utapi = new UTApi();

// ---- create ----

export async function createPost(form: FormData): Promise<void> {
  await requireAdmin();
  const title = field(form, "title") || "Untitled post";
  const slug = await ensureUniqueSlug(title);
  const [row] = await db
    .insert(posts)
    .values({ title, slug })
    .returning({ id: posts.id });
  await flashToast("Draft created");
  redirect(`/admin/blog/${row.id}`);
}

// ---- autosave: title / excerpt / body ----
// Called on a debounce from the editor. No toast, no current-page refresh (the
// client already holds the values) — just mark the list stale.

export async function updatePost(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db
    .update(posts)
    .set({
      title: field(form, "title") || "Untitled post",
      excerpt: field(form, "excerpt") || null,
      contentHtml: sanitizePostHtml(String(form.get("contentHtml") ?? "")),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
  revalidatePath("/admin/blog");
}

// ---- slug (explicit save so a normalized/deduped value can surface) ----

export async function updateSlug(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const desired = field(form, "slug") || field(form, "title") || "post";
  const slug = await ensureUniqueSlug(desired, id);
  await db.update(posts).set({ slug, updatedAt: new Date() }).where(eq(posts.id, id));
  await flashToast("Link updated");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/admin/blog");
}

// ---- cover image ----

export async function setCoverImage(input: {
  postId: string;
  url: string;
  key: string;
}): Promise<void> {
  await requireAdmin();
  // Replacing an existing cover: delete the old file from UploadThing first.
  const [existing] = await db
    .select({ key: posts.coverImageKey })
    .from(posts)
    .where(eq(posts.id, input.postId));
  if (existing?.key) await utapi.deleteFiles([existing.key]).catch(() => {});

  await db
    .update(posts)
    .set({ coverImageUrl: input.url, coverImageKey: input.key, updatedAt: new Date() })
    .where(eq(posts.id, input.postId));
  await flashToast("Cover image set");
  revalidatePath(`/admin/blog/${input.postId}`);
  revalidatePath("/admin/blog");
}

export async function removeCoverImage(form: FormData): Promise<void> {
  await requireAdmin();
  const postId = field(form, "postId");
  if (!postId) return;
  const [existing] = await db
    .select({ key: posts.coverImageKey })
    .from(posts)
    .where(eq(posts.id, postId));
  if (existing?.key) await utapi.deleteFiles([existing.key]).catch(() => {});
  await db
    .update(posts)
    .set({ coverImageUrl: null, coverImageKey: null, updatedAt: new Date() })
    .where(eq(posts.id, postId));
  await flashToast("Cover image removed");
  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/admin/blog");
}

// ---- publish / unpublish ----

export async function publishPost(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  // Set publishedAt only the first time it goes live (keeps the original date on
  // re-publish).
  const [row] = await db
    .select({ publishedAt: posts.publishedAt })
    .from(posts)
    .where(eq(posts.id, id));
  await db
    .update(posts)
    .set({
      status: "published",
      publishedAt: row?.publishedAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));
  await flashToast("Post published");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/admin/blog");
}

export async function unpublishPost(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  await db
    .update(posts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(posts.id, id));
  await flashToast("Moved to draft");
  revalidatePath(`/admin/blog/${id}`);
  revalidatePath("/admin/blog");
}

// ---- delete ----

export async function deletePost(form: FormData): Promise<void> {
  await requireAdmin();
  const id = field(form, "id");
  if (!id) return;
  const [row] = await db
    .select({ key: posts.coverImageKey })
    .from(posts)
    .where(eq(posts.id, id));
  if (row?.key) await utapi.deleteFiles([row.key]).catch(() => {});
  await db.delete(posts).where(eq(posts.id, id));
  await flashToast("Post deleted");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}
