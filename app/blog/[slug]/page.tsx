import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { site } from "@/lib/site";
import { sanitizePostHtml } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug: string) {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);
  return post ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  const description =
    post.excerpt ?? `A post from ${site.trainer} at ${site.name}.`;
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  // Content was sanitized on write; sanitize again on render as defense in depth.
  const html = sanitizePostHtml(post.contentHtml);

  return (
    <>
      <article>
        {/* ===== Header ===== */}
        <div className="container mx-auto px-4 pt-12 md:pt-16 max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-extrabold transition-colors"
            style={{ color: "var(--sky-deep)" }}
          >
            <span aria-hidden>←</span> All posts
          </Link>

          <p
            className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em]"
            style={{ color: "var(--coral-deep)" }}
          >
            {fmtDate(post.publishedAt)}
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl">{post.title}</h1>
          {post.excerpt && (
            <p className="mt-5 text-lg md:text-xl leading-relaxed" style={{ color: "var(--slate)" }}>
              {post.excerpt}
            </p>
          )}
          <div className="divider-pulse mt-8" />
        </div>

        {/* ===== Cover ===== */}
        {post.coverImageUrl && (
          <div className="container mx-auto px-4 mt-10 max-w-4xl">
            <div
              className="relative w-full overflow-hidden rounded-3xl"
              style={{ aspectRatio: "16 / 9", border: "2px solid var(--border)" }}
            >
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* ===== Body ===== */}
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-3xl">
          <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>

      {/* ===== CTA band ===== */}
      <section className="relative overflow-hidden lanes-dark" style={{ backgroundColor: "var(--sky-deep)" }}>
        <div className="container mx-auto px-4 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl" style={{ color: "#fff" }}>
            Ready to train with intention?
          </h2>
          <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "rgba(234, 242, 248, 0.85)" }}>
            Tell {site.trainer} about your goals and find the right way to train — in person
            or online.
          </p>
          <div className="mt-8">
            <Link href="/contact" className="btn btn-light text-lg">
              Start Training
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
