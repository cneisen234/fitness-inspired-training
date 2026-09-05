// Drizzle schema — the single source of truth for our Postgres tables.
//
// The fitness site's first database. Phase 1 introduces two entities:
//  - posts    : blog posts authored in the admin (WYSIWYG → sanitized HTML)
//  - reviews  : client reviews submitted publicly, moderated in the admin
// Phase 2 (Stripe subscriptions) will add `plans` and `subscriptions` here.
//
// Conventions:
//  - Timestamps are timezone-aware and default to now() in the DB.
//  - Rating is an integer 1–5, guarded by a check constraint.

import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

// ---- Enums ----

export const postStatus = pgEnum("post_status", ["draft", "published"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved"]);

// ---- Blog ----

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // URL slug — unique, generated from the title (editable in the admin).
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    // Short summary for the blog index + meta description.
    excerpt: text("excerpt"),
    // Sanitized HTML from the Tiptap editor (Step 2 sanitizes before insert).
    contentHtml: text("content_html").notNull().default(""),
    // Featured image (UploadThing URL + file key for later deletion).
    coverImageUrl: text("cover_image_url"),
    coverImageKey: text("cover_image_key"),
    status: postStatus("status").notNull().default("draft"),
    // Set the first time a post is published; drives the public sort order.
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("posts_slug_key").on(t.slug),
    index("posts_status_idx").on(t.status),
    index("posts_published_idx").on(t.publishedAt),
  ],
);

// ---- Reviews ----

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    rating: integer("rating").notNull(), // 1–5, see check below
    body: text("body").notNull(),
    // Optional context, e.g. "Trained ~1 year".
    duration: text("duration"),
    // Optional — captured so Ashley can reach out; never shown publicly.
    email: text("email"),
    // pending → shows only in the admin queue; approved → live on /reviews.
    status: reviewStatus("status").notNull().default("pending"),
    // Manual display order for approved reviews (lower = earlier).
    sort: integer("sort").notNull().default(0),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
  },
  (t) => [
    index("reviews_status_idx").on(t.status),
    check("reviews_rating_range", sql`${t.rating} >= 1 and ${t.rating} <= 5`),
  ],
);

// No relations yet — posts and reviews are standalone. `relations()` blocks will
// arrive with `plans`/`subscriptions` in Phase 2.
export const postsRelations = relations(posts, () => ({}));
export const reviewsRelations = relations(reviews, () => ({}));
