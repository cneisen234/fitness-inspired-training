# Build Plan — Fitness Inspired Admin Portal

> **Temporary working doc.** Delete this file once all Phase 1 + Phase 2 work is complete.

Modeled on the Soady Poppers admin (`app/admin/(app)/*`, Drizzle + Neon, bcrypt + jose
single-admin auth, Server Actions, UploadThing). Payments swap Square → **Stripe**.

## Locked decisions
- **Reviews** → moderation queue: submit → lands in portal as *pending* → **Approve** publishes
  it to the reviews page, **Reject** hard-deletes it. No manual entry.
- **Blog** → rich **WYSIWYG** editor (**Tiptap**, storing **sanitized HTML**), with featured +
  inline images (UploadThing), auto slug, draft/publish.
- **Subscriptions (P2)** → Stripe collects recurring payment; Ashley fulfills manually via
  Everfit. No customer login / gated content on the site.
- **Tiers (P2)** → fully portal-managed: Ashley edits name/price/interval/features in the portal
  and the app **syncs Products & Prices to Stripe**.
- Single admin = Ashley. Public review form lives on a new `/reviews` page and still emails
  Ashley a heads-up per submission (existing SendGrid setup). Blog v1 is one flat feed (no
  tags/categories yet).

---

## Step 0 — Foundation (shared by everything)
Introduces the site's first database and the admin shell.

1. Add deps: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `ws`/`@types/ws`,
   `bcryptjs`/`@types/bcryptjs`, `jose`, `server-only`, `tsx`, `dotenv`.
2. DB client — `lib/db/index.ts` (Neon pooled Pool + Drizzle), `lib/db/schema.ts`,
   `drizzle.config.ts`, and `db:generate` / `db:migrate` / `db:push` scripts (mirror Soady).
3. Provision Neon/Vercel Postgres; set `DATABASE_URL` + `POSTGRES_URL_NON_POOLING`.
4. Auth — copy Soady's `lib/auth/{jwt,password,session,dal}.ts`, `proxy.ts` (Edge optimistic
   gate), and the `admin:hash` script. Env: `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`.
5. Admin shell — `app/admin/admin.css`, `app/admin/login/*`, `app/admin/(app)/layout.tsx`
   (calls `requireAdmin()`), `admin-nav.tsx` (Dashboard · Blog · Reviews · *Plans [P2]* ·
   Settings), sign-out action, `toaster` + `flash` + `confirm-delete` helpers. Restyle to the
   Fitness Inspired palette (in `globals.css` / `contactEmail.ts`).
6. Dashboard — live counts (published posts, pending reviews) from Postgres.

**Done when:** Ashley can log in at `/admin`, see the shell + live counts, and log out;
unauthenticated access redirects to login.

---

## PHASE 1 — Blog + Reviews

### Step 1 — Image uploads (UploadThing)
- Add `uploadthing` + `@uploadthing/react`, `app/api/uploadthing/route.ts`,
  `lib/uploadthing-client.ts`. Env: `UPLOADTHING_TOKEN`. Reused by blog cover + inline images.

### Step 2 — Blog: data + admin CRUD
- Schema `posts`: `id, slug (unique), title, excerpt, contentHtml, coverImageUrl,
  coverImageKey, status ('draft'|'published'), publishedAt, createdAt, updatedAt`.
- Admin `app/admin/(app)/blog/`: list (draft/published), `new`, `[id]` Tiptap editor
  (bold/italic/headings/lists/links + image insert via UploadThing), cover-image manager,
  auto-slug from title (editable), Save draft / Publish / Unpublish, Delete (confirm).
  Server Actions for all mutations. **Sanitize** `contentHtml` server-side before persisting.

### Step 3 — Blog: public pages
- `/blog` index (published only, newest first, cover + excerpt) and `/blog/[slug]` rendering
  sanitized HTML with brand typography. Add "Blog" to `components/Navigation.tsx`. Per-post SEO.

**Done when:** Ashley writes/edits/publishes a post with images and it appears at `/blog`.

### Step 4 — Reviews: data + submission
- Schema `reviews`: `id, name, rating (1–5), body, duration?, email?,
  status ('pending'|'approved'), submittedAt, approvedAt, sort`.
- Public review form on new `/reviews` page → Server Action/route that validates, runs
  reCAPTCHA (already wired), inserts as `pending`, and emails Ashley a "new review" notice
  (reuse SendGrid + `buildReviewHtml`). Retire the review branch of `app/api/contact/route.ts`
  or point it at the DB.

### Step 5 — Reviews: admin moderation + public display
- Admin `app/admin/(app)/reviews/`: pending queue with **Approve** (→ `approved`, sets
  `approvedAt`) and **Reject** (hard delete, confirm); list of approved with hide/reorder/delete.
- Public `/reviews` renders approved reviews (stars + name + optional duration). Homepage
  testimonials in `lib/site.ts` switch from the hardcoded array to reading approved reviews.

**Done when:** a visitor submits → it appears pending in the portal → Approve publishes it to
`/reviews` (+ homepage); Reject removes it.

**➡️ Phase 1 ships here** (blog + reviews, no payments).

---

## PHASE 2 — Stripe Subscriptions (3 workout-plan tiers)

### Step 6 — Stripe wiring
- Add `stripe`. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`. `lib/stripe.ts` client. Mirrors Soady's `lib/square.ts`.

### Step 7 — Plans: data + portal management (synced to Stripe)
- Schema `plans`: `id, name, tagline, description, features (jsonb string[]), priceCents,
  interval ('month'|'year'), stripeProductId, stripePriceId, active, sort, timestamps`.
- Admin `app/admin/(app)/plans/`: create/edit tiers. On save, create/update the Stripe Product;
  because Stripe Prices are immutable, create a new Price and archive the old when price/interval
  change, storing the new `stripePriceId`. Reorder / activate / deactivate.

### Step 8 — Public pricing + checkout
- `/plans` page rendering the 3 active tiers with **Subscribe** → Stripe Checkout
  (subscription mode). "Manage subscription" link → Stripe Customer Portal.

### Step 9 — Webhooks, subscribers, fulfillment
- Schema `subscriptions`: `id, stripeCustomerId, stripeSubscriptionId, customerName,
  customerEmail, planId, status, currentPeriodEnd, timestamps`.
- `app/api/stripe/webhook/route.ts` (signature-verified) syncs subscription lifecycle →
  `subscriptions`. On new active sub: email Ashley + customer (SendGrid) for manual Everfit
  fulfillment.
- Admin Subscribers view: active/past-due/canceled subscribers with plan + status. Optional
  Settings toggle "accepting new subscriptions."

**Done when:** a customer subscribes via Stripe, the subscription appears in the portal, and
Ashley + customer get notified for manual fulfillment.

---

## New env vars (added incrementally)
`DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`,
`UPLOADTHING_TOKEN` *(P1)* · `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` *(P2)*. Reuses existing `SENDGRID_*`, `CONTACT_TO_EMAIL`,
`*RECAPTCHA*`.

## Deferred / decide later (not blocking)
- Blog tags/categories & search (v1 is one flat feed).
- Rich-text image cleanup (GC of orphaned UploadThing files).
- Annual-vs-monthly toggle / trials / coupons on plans.

---

## Progress
- [x] Step 0 — Foundation (DB, auth, admin shell, dashboard) — **verified working**.
- [x] Step 1 — UploadThing — endpoint + client helpers + SSR plugin. Needs `UPLOADTHING_TOKEN`
      in `.env.local` for uploads to actually run (also required by Step 2 images).
- [~] Step 2 — Blog data + admin CRUD — **code complete, typecheck + lint clean**. Tiptap WYSIWYG
      editor (bold/italic/underline/strike, H2–H4, lists, quote, link, inline image upload,
      undo/redo) with debounced autosave; cover-image manager; auto/edited slug with dedupe;
      draft ⇄ publish; delete (removes cover from storage); server-side HTML sanitize. List at
      `/admin/blog`, editor at `/admin/blog/[id]`. Smoke test removed. Needs runtime testing.
- [~] Step 3 — Blog public pages — **code complete, typecheck + lint clean**. `/blog` index
      (published only, cover + excerpt, brand styling, empty state) and `/blog/[slug]` (cover,
      sanitized body via `.post-content`, per-post SEO/OG metadata, CTA). "Blog" added to site
      nav; UploadThing hosts allowed in `next.config.ts`. Pages are `force-dynamic` so publishing
      reflects immediately. Ready to test Steps 2 + 3 together.
- [x] Step 4 — Reviews data + submission — dedicated `/reviews` page + `ReviewForm`;
      `/api/reviews` stores submissions as `pending` + emails Ashley. Shared `lib/recaptcha.ts`
      + `lib/sendgrid.ts`; `/api/contact` + `ContactForm` slimmed to inquiries only.
- [x] Step 5 — Reviews moderation + public display — **code complete, typecheck + lint clean**.
      Admin queue at `/admin/reviews` (Approve → publishes; Reject → deletes; Unpublish; reorder
      ↑/↓; Delete). Public approved reviews render via shared `ReviewList` on `/reviews` and the
      homepage (both live from `lib/reviews.ts`); hardcoded `testimonials` removed from `site.ts`.
      ← **Phase 1 complete** (pending final runtime test)
- [ ] Step 6 — Stripe wiring
- [ ] Step 7 — Plans data + portal management
- [ ] Step 8 — Public pricing + checkout
- [ ] Step 9 — Webhooks, subscribers, fulfillment  ← **Phase 2 complete**
- [ ] **Delete this PLAN.md** when all steps are done
