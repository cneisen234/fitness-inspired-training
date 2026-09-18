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
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";

// ---- Enums ----

export const postStatus = pgEnum("post_status", ["draft", "published"]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved"]);
export const purchaseStatus = pgEnum("purchase_status", ["paid", "refunded"]);

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

// ---- Plans (one-time workout-plan purchases) ----
// Ashley defines any number of packages (in-person, online, or hybrid). Each is
// synced to Stripe as a Product + a single one-time Price. Stripe Prices are
// immutable, so changing the price rotates to a new Price and archives the old.

export const plans = pgTable(
  "plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    // Bullet-point features shown on the plan card.
    features: jsonb("features").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    priceCents: integer("price_cents").notNull().default(0),
    // Stripe linkage — null until the plan is first synced with a valid price.
    stripeProductId: text("stripe_product_id"),
    stripePriceId: text("stripe_price_id"),
    // Only active plans with a Stripe price show on the public /plans page.
    active: boolean("active").notNull().default(false),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("plans_active_idx").on(t.active), index("plans_sort_idx").on(t.sort)],
);

// ---- Purchases (one-time plan orders) ----
// Written by the Stripe webhook on checkout.session.completed. Snapshots the plan
// name + amount at purchase time so editing/deleting a plan never rewrites a past
// receipt; planId is a soft link (nulled if the plan is later deleted).

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // The PaymentIntent is the payment + idempotency key (branded on-site checkout).
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
    planId: uuid("plan_id").references(() => plans.id, { onDelete: "set null" }),
    // Snapshots — frozen at purchase time.
    planName: text("plan_name").notNull(),
    amountPaidCents: integer("amount_paid_cents").notNull(),
    customerName: text("customer_name"),
    customerEmail: text("customer_email").notNull(),
    customerNote: text("customer_note"),
    status: purchaseStatus("status").notNull().default("paid"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("purchases_payment_intent_key").on(t.stripePaymentIntentId),
    index("purchases_created_idx").on(t.createdAt),
  ],
);

// No relations yet — posts, reviews, plans, and purchases are queried standalone.
export const postsRelations = relations(posts, () => ({}));
export const reviewsRelations = relations(reviews, () => ({}));
