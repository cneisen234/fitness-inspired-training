# Build Plan — Fitness Inspired Admin Portal

> **Temporary working doc.** Delete this file once all Phase 1 + Phase 2 work is complete.

Modeled on the Soady Poppers admin (`app/admin/(app)/*`, Drizzle + Neon, bcrypt + jose
single-admin auth, Server Actions, UploadThing). Payments swap Square → **Stripe**.

## Locked decisions
- **Reviews** → moderation queue: submit → lands in portal as *pending* → **Approve** publishes
  it to the reviews page, **Reject** hard-deletes it. No manual entry.
- **Blog** → rich **WYSIWYG** editor (**Tiptap**, storing **sanitized HTML**), with featured +
  inline images (UploadThing), auto slug, draft/publish.
- **Workout plans / packages (P2)** → **one-time purchase** (NOT subscriptions). Stripe collects a
  single payment; **Ashley fulfills manually** — after payment she personally reaches out and
  builds each buyer a custom **Everfit** profile/link (Everfit plans are built per-person; there is
  **NO Everfit integration**). No customer login / gated content, no recurring billing, no Portal.
- **Plans (P2)** → fully portal-managed: Ashley edits name/price/features in the portal (admin
  defines **any number** of packages — in-person, online, or hybrid combos, e.g. "Strength — 3
  months") and the app **syncs Products & one-time Prices to Stripe**.
- **Checkout capture (P2)** → collect the buyer's name + email and an optional **goals/notes**
  field (she customizes per person), so the confirmation email gives Ashley what she needs to reach
  out and set up their Everfit link.
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

## PHASE 2 — Stripe one-time workout-plan purchases

> **Requirement change (2026-09-15):** one-time payments, NOT subscriptions. No recurring
> billing, no Stripe Customer Portal, no subscription-lifecycle webhooks.

Money is stored as **integer cents** everywhere (mirrors Soady). All amounts sent to / read from
Stripe are cents. Reuse the shared `lib/sendgrid.ts` for emails.

### Step 6 — Stripe wiring
- Add `stripe` dep. `lib/stripe.ts` — a single server-only Stripe client from `STRIPE_SECRET_KEY`
  (pin `apiVersion`), the way `lib/db/index.ts` centralizes the DB client. Mirrors Soady's
  `lib/square.ts`.
- Env (add to `.env.example`): `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
  `STRIPE_WEBHOOK_SECRET` (filled in Step 9), and a public base URL for Checkout return links —
  reuse/introduce `NEXT_PUBLIC_SITE_URL`.
- Add "Plans" to the admin nav (`admin-nav.tsx`); add `stripe` money helpers if needed
  (`lib/money.ts` — dollars↔cents, formatCents).

**Done when:** the app builds with the Stripe client importable; no user-facing change yet.

### Step 7 — Plans: data + portal management (synced to Stripe)
- Schema `plans`: `id, name, tagline?, description?, features (jsonb string[]), priceCents,
  stripeProductId?, stripePriceId?, active (bool), sort (int), createdAt, updatedAt`.
  (No `interval` — one-time only.) Generate + run migration.
- `app/admin/(app)/plans/` mirroring the blog CRUD:
  - `page.tsx` — list (name, price, Active/Inactive, sort) + "New plan".
  - `new/page.tsx` → `createPlan` (name → draft row, `active=false`), redirect to editor.
  - `[id]/page.tsx` + `plan-form.tsx` — edit name/tagline/description/**features list**/price;
    Activate/Deactivate; reorder; Delete (confirm).
  - `actions.ts` (Server Actions) — on save, **sync to Stripe**: create/update the Stripe Product;
    Stripe Prices are immutable, so when `priceCents` changes create a **new one-time Price** and
    archive the old, storing the new `stripePriceId`. A plan can't be **activated** without a valid
    Stripe price. Delete archives the Stripe Product (don't hard-delete if referenced by a
    purchase — keep the snapshot intact).
- Validation: price ≥ some floor; a plan with no price stays inactive.

**Done when:** Ashley creates a plan in the portal and a matching Product + one-time Price appear in
her Stripe dashboard; editing the price rotates the Stripe Price.

### Step 8 — Public plans page + checkout
- `/plans` page (brand styling, like `/reviews`) rendering **active** plans — name, price, feature
  list, and a **Buy / Get this plan** button. Empty state when none are active.
- `app/api/checkout/route.ts` (or a Server Action) → creates a **Stripe Checkout Session** in
  **`payment` mode** for the plan's `stripePriceId`, `success_url`/`cancel_url` back to the site,
  with `customer_email` capture + an optional **goals/notes** field (Checkout `custom_fields`), and
  `metadata.planId`. Server always trusts the DB price, never a client-sent amount.
- `/plans/success` (reads the session, thank-you + "Ashley will reach out about your Everfit setup")
  and `/plans/cancelled`. No Customer Portal.
- Add "Plans" (or "Training Plans") to the site nav.

**Done when:** clicking Buy opens Stripe Checkout for the right price and a test card completes to
the success page.

### Step 9 — Webhook, purchases, fulfillment
- Schema `purchases`: `id, stripeCheckoutSessionId (unique), stripePaymentIntentId?,
  planId? (set null on plan delete), planName + amountPaidCents (**snapshot** at purchase),
  customerName?, customerEmail, customerNote?, status ('paid'|'refunded'), createdAt`. Snapshots so
  editing/deleting a plan never rewrites a past receipt. Migration.
- `app/api/stripe/webhook/route.ts` — **signature-verified** with `STRIPE_WEBHOOK_SECRET` (raw body;
  its own route, not under the auth proxy). Handle:
  - `payment_intent.succeeded` → idempotently insert a `purchases` row (dedupe on PaymentIntent id) →
    **email Ashley** (buyer name, email, package, goals/notes) so she can reach out + build the
    Everfit link, and a **confirmation email to the buyer** (via `lib/sendgrid.ts`).
  - `charge.refunded` → flip that purchase's `status` to `refunded`.
- Admin `app/admin/(app)/purchases/page.tsx` — list purchases (buyer, package, amount, date,
  status, note); read-only. Add "Purchases" to admin nav + a dashboard count.
- Local testing via the **Stripe CLI** (`stripe listen --forward-to …/api/stripe/webhook`) — that's
  where `STRIPE_WEBHOOK_SECRET` comes from in dev.

**Done when:** a test-card purchase writes a `purchases` row, Ashley + the buyer get emailed, the
purchase shows in the portal, and a refund flips its status.

### Step 9b — Vercel env + production go-live
Set every env var in **Vercel → Project → Settings → Environment Variables** (Production, and
Preview if used). Full list — all currently in `.env.example`:
`DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`,
`UPLOADTHING_TOKEN`, `SENDGRID_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`,
`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`, `RECAPTCHA_MIN_SCORE`,
`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_SITE_URL`. (Postgres vars auto-inject if the Vercel Postgres integration is added.)
- **Claude never touches Vercel.** Claude's only job here is to hand over a paste-ready checklist
  of name/value pairs; the user adds them in the Vercel dashboard themselves.
- **Production Stripe (live mode):** switch to **live** keys; because live mode is a separate
  Stripe environment, Ashley re-syncs her plans in the admin (creates live Products/Prices), OR we
  re-create them. Set `NEXT_PUBLIC_SITE_URL` to the real domain.
- **Production webhook:** Stripe Dashboard → Developers → Webhooks → add endpoint
  `https://<domain>/api/stripe/webhook`, subscribe to `payment_intent.succeeded` +
  `charge.refunded`, copy its **signing secret** into Vercel as `STRIPE_WEBHOOK_SECRET`.
- **Migrations run automatically on deploy** — `package.json` has a `vercel-build` script
  (`drizzle-kit migrate && next build`) that Vercel runs instead of `build`, so every push applies
  pending migrations before building. Requires `POSTGRES_URL_NON_POOLING` (or `DATABASE_URL`) set
  in Vercel; `drizzle-kit` is a devDependency, which Vercel installs at build time.
- Verify: a live (or test-endpoint) event hits the deployed webhook and a purchase is recorded.

**Done when:** the deployed site takes a real purchase end-to-end (checkout → webhook → purchase
recorded → emails sent) with all secrets living in Vercel, not the repo.

---

## New env vars (added incrementally)
`DATABASE_URL`, `POSTGRES_URL_NON_POOLING`, `AUTH_SECRET`, `ADMIN_PASSWORD_HASH`,
`UPLOADTHING_TOKEN` *(P1)* · `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` *(Step 6)*,
`STRIPE_WEBHOOK_SECRET` *(Step 9, from the Stripe CLI in dev)*, `NEXT_PUBLIC_SITE_URL` *(Checkout
return URLs)* *(P2)*. Reuses existing `SENDGRID_*`, `CONTACT_TO_EMAIL`, `*RECAPTCHA*`. Use Stripe
**test** keys (`sk_test_…` / `pk_test_…`) while building; swap to live at launch.

## Deferred / decide later (not blocking)
- Blog tags/categories & search (v1 is one flat feed).
- Rich-text image cleanup (GC of orphaned UploadThing files).
- Coupons / promo codes on plans; automatic plan delivery (Everfit invite / file download) instead
  of manual fulfillment.

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
- [~] Step 6 — Stripe wiring — **code complete, typecheck + lint clean**. `lib/stripe.ts` (lazy
      server-only client), `lib/money.ts` (cents helpers), "Plans" in admin nav + stub page,
      `.env.example` updated (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_SITE_URL, STRIPE_WEBHOOK_SECRET). Needs the two test keys in `.env.local`.
- [~] Step 7 — Plans data + portal management — **code complete, typecheck + lint clean, migration
      generated (`0001`)**. `plans` table (features jsonb, priceCents, Stripe product/price ids,
      active, sort). Admin CRUD at `/admin/plans` (list + reorder), `new`, `[id]` editor with
      dynamic features list; Save **syncs to Stripe** (create/update Product, rotate one-time Price
      on price change); Activate/Deactivate (needs a synced price); Delete archives in Stripe.
      Run `npm run db:migrate`, then test with the Stripe **test** keys already in `.env.local`.
- [~] Step 8 — Public plans page + one-time checkout — **code complete, typecheck + lint clean**.
      `/plans` renders active plans (price, features) with **Get this plan** → `startCheckout`
      → `/plans/checkout` **branded on-site checkout** (Stripe Payment Element + deferred
      PaymentIntent; server trusts DB price; collects name/email/goals in our own fields).
      `/plans/success` (retrieves the PaymentIntent to personalize). "Plans" in site nav. Needs a
      test-card run (`4242…`).
- [~] Step 9 — Webhook, purchases, fulfillment — **code complete, typecheck + lint clean, migration
      generated (`0002`)**. `purchases` table (snapshots plan name + amount; planId set-null on plan
      delete). Signature-verified `/api/stripe/webhook`: `payment_intent.succeeded` → idempotent
      insert + email Ashley + confirm buyer; `charge.refunded` → status refunded. Admin
      `/admin/purchases` (read-only) + "Purchases" nav + dashboard count. Run `npm run db:migrate`;
      dev webhook via `stripe listen` → `STRIPE_WEBHOOK_SECRET` in `.env.local`.
- [ ] Step 9b — Vercel env + production go-live (Stripe live keys + prod webhook)  ← **Phase 2 complete**
- [ ] **Delete this PLAN.md** when all steps are done
