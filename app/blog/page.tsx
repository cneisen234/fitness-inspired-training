import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { site } from "@/lib/site";
import { PulseLine } from "@/components/PulseLine";

export const metadata: Metadata = {
  title: "Blog",
  description: `Training tips, coaching notes, and inspiration from ${site.trainer} at ${site.name}.`,
};

export const dynamic = "force-dynamic";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndex() {
  const published = await db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));

  return (
    <>
      {/* ===================== Hero ===================== */}
      <section className="relative overflow-hidden dot-grid">
        <div className="container mx-auto px-4 pt-16 pb-14 md:pt-24 md:pb-16 text-center">
          <p className="eyebrow eyebrow-coral fade-up d-1">The Blog</p>
          <h1 className="mt-4 fade-up d-2 text-4xl md:text-6xl">
            Notes from the <span style={{ color: "var(--coral)" }}>gym floor</span>
          </h1>
          <p
            className="mt-6 fade-up d-3 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: "var(--slate)" }}
          >
            Training tips, honest coaching notes, and a little inspiration to keep you
            moving — from {site.trainer}.
          </p>
          <div className="mt-10 max-w-3xl mx-auto fade-up d-4">
            <PulseLine color="var(--coral)" height={44} draw />
          </div>
        </div>
      </section>

      {/* ===================== Posts ===================== */}
      <section className="section" style={{ backgroundColor: "var(--paper)" }}>
        <div className="container mx-auto px-4">
          {published.length === 0 ? (
            <div className="max-w-xl mx-auto text-center">
              <div className="divider-pulse divider-pulse-on-paper mx-auto" />
              <h2 className="mt-8 text-2xl md:text-3xl">New posts are on the way</h2>
              <p className="mt-3 text-lg" style={{ color: "var(--slate)" }}>
                {site.trainer} is putting together training tips and stories. Check back
                soon — or reach out if there&apos;s something you&apos;d like to see covered.
              </p>
              <div className="mt-8">
                <Link href="/contact" className="btn btn-coral">
                  Get in touch
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {published.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className={`panel accent-${["sky", "coral", "amber"][i % 3]} overflow-hidden flex flex-col group`}
                >
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: "16 / 10", backgroundColor: "var(--sky-soft)" }}
                  >
                    {p.coverImageUrl ? (
                      <Image
                        src={p.coverImageUrl}
                        alt={p.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PulseLine color="var(--sky)" height={40} />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    {p.publishedAt && (
                      <p
                        className="text-xs font-extrabold uppercase tracking-[0.14em]"
                        style={{ color: "var(--stone)" }}
                      >
                        {fmtDate(p.publishedAt)}
                      </p>
                    )}
                    <h2 className="mt-2 text-2xl leading-tight">{p.title}</h2>
                    {p.excerpt && (
                      <p className="mt-3 leading-relaxed flex-1" style={{ color: "var(--slate)" }}>
                        {p.excerpt}
                      </p>
                    )}
                    <span
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold"
                      style={{ color: "var(--coral-deep)" }}
                    >
                      Read post
                      <span aria-hidden className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
