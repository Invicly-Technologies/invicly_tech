# invicly.com

Marketing site for **Invicly Tech** — "Think. Build. Invicly."
Next.js 15 (App Router) + TypeScript + Tailwind v4 + Framer Motion + Lenis + React Three Fiber. Marketing pages are prerendered statically; `/learn` (Invicly Learn) is server-rendered with a Neon Postgres database.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # exports the static site to out/
npm start          # runs the production server
```

## Invicly Learn (`/learn`)

Free learning paths plus a personal study tracker. Anyone can browse paths; an account is needed to save plans.

- Paths (content): `src/data/learn/paths.ts`: modules → topics with hour estimates, goals and doc links. Add a path by adding an object to `paths`.
- Scheduler: `src/lib/learn/schedule.ts` lays topics onto study days at N hours/day; `analytics.ts` computes progress, overdue, burn-up and streaks.
- Server actions (auth, plans, topics, study logs): `src/app/learn/actions.ts`. Queries: `src/lib/learn/data.ts`.
- Paths: the four originals in `paths.ts`, seven more in `paths-more.ts`. Each path has a `category` (filters on /learn).
- Auth: email + password (bcrypt), session is an HS256 JWT in an httpOnly cookie (`il_session`, 30 days). New accounts must verify their email with a 6-digit code (15 min expiry, 5 attempts, 60 s resend cooldown); "Forgot password" uses the same codes. Codes are HMAC-hashed in `auth_codes`.
- Email: `src/lib/learn/mail.ts` sends through the existing `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` env vars. Without them (local dev) the code is printed to the server log instead.
- Plans store hours per weekday (`plans.day_hours`, index 0 = Sunday); `schedule.ts` lays topics onto those hours.
- Mind maps: `src/components/learn/MindMap.tsx` (view mode on path and plan pages, edit mode in the plan wizard).
- Notes: `NotionEditor.tsx` (TipTap) for topic notes and the per-plan notebook (`plans.notes`), stored as HTML.
- Subtopics & references: every path topic has `subtopics` (3–6 steps) in the path data; they are copied into `plan_subtopics` when a plan is created and can then be edited per plan. Ticking the last subtopic completes the topic; completing a topic ticks its subtopics. Users can attach their own links per topic (`plan_links`, type auto-detected in `src/lib/learn/links.ts`); the plan's Resources tab lists recommended and personal links together.
- Timers: start/stop on any topic or subtopic (`timer.tsx`, `active_timers` table, one per user). Stopping writes a `study_logs` row with `subtopic_id`, `started_at`, `ended_at` (under 30 s is ignored, capped at 12 h). Subtopics carry `est_minutes` (topic hours split evenly at plan creation).
- Visual explainers: `src/data/learn/explainers/<path>.ts` (one entry per topic: summary, diagrams, key points, terms, example, pitfalls, self-check), rendered by `visuals.tsx` at `/learn/paths/<path>/learn/<module>--<topic>/`.
- Export: topic or whole-plan notes as Markdown (client-side) or PDF (print view at `/learn-export/<planId>/`).
- Tours: `Tour.tsx`; finished tours are stored in `users.tours_done`.
- Theme: Learn has light/dark/system (`ThemeToggle.tsx`, tokens under `.learn-root` in `globals.css`). The marketing site stays dark.
- Database: Neon project `invicly-learn` (aws-us-east-1). Tables: `users`, `auth_codes`, `plans`, `plan_items`, `plan_subtopics`, `plan_links`, `study_logs`, `active_timers`.

Env vars (set in Vercel for Production + Preview; locally in `.env.local`):

```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require
LEARN_AUTH_SECRET=<32+ random chars>   # openssl rand -base64 32
```

Rotating `LEARN_AUTH_SECRET` logs everyone out. `vercel.json` pins functions to `iad1` so they sit next to the database.

## SEO

- Every public page sets its own canonical URL and Open Graph data (`src/lib/seo.tsx`). Never add a canonical in the root layout.
- JSON-LD: Organization + WebSite (root), SoftwareApplication (products), Service list (services), Course (each path), LearningResource (each explainer), BreadcrumbList.
- `sitemap.xml` lists all public pages including every path and explainer; `robots.txt` blocks account pages.
- Share images: `/learn/og.png`, `/learn/paths/<path>/og.png`, `.../learn/<topic>/og.png` (route handlers, so no trailing-slash redirect).
- Search Console: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (and optionally `NEXT_PUBLIC_BING_SITE_VERIFICATION`) in Vercel, redeploy, verify, then submit `https://www.invicly.com/sitemap.xml`.
- IndexNow key file: `public/f522e415587fb2a8bb76ae11aeececd9.txt`. After big content changes, POST the URLs to `https://www.bing.com/indexnow`.

## Content

All copy lives in `src/data/`:

- `site.ts` — company facts, nav, values, process, marquee, `socials` (only entries with a URL render)
- `products.ts` — Flow, Spendly, Kivo, Unreel (detail pages are generated from this). Set `playStoreUrl` on a product to swap the "Coming soon on Google Play" pill for a real store link.
- `services.ts` — the 8 services, engagement models, contact form options

Logo files are in `public/brand/` (transparent PNGs cropped from the original mark).

## Contact form — one-time activation (important)

The form posts from the browser to **FormSubmit** (`https://formsubmit.co/ajax/inviclytech@gmail.com`). No account needed, but:

1. After the site is live, send **one test message** from `/contact`.
2. FormSubmit emails **inviclytech@gmail.com** an activation link. **Click it once.**
3. From then on every submission is delivered to that inbox (Reply goes to the visitor, via `_replyto`).

Until you click the link, submissions are not delivered.

Switch provider with env vars (see `.env.example`):

```
NEXT_PUBLIC_CONTACT_PROVIDER=web3forms
NEXT_PUBLIC_CONTACT_ENDPOINT=https://api.web3forms.com/submit
NEXT_PUBLIC_WEB3FORMS_KEY=your-public-access-key
```

To move the contact form to a backend, only `src/lib/contact.ts` needs to change (`output: "export"` has already been removed for `/learn`).

## Deploy

Vercel (current setup): `npx vercel --prod`. The domain `invicly.com` is attached to the Vercel project.
DNS at your registrar: `A  @  76.76.21.21` and `CNAME  www  cname.vercel-dns.com` (or use Vercel nameservers).
Keep the existing `flow.`, `spendly.`, `kivo-control.` and `unreel.` records as they are.

The site now needs a Node runtime (server actions for `/learn`), so a plain static host no longer works.

## Notes

- Hero visual: `HeroVisual.tsx`, a DOM-based product orbit (no WebGL) sized from its container so cards never clip or overlap. `HeroScene.tsx`, `CssOrbitFallback.tsx` and `CssCubeFallback.tsx` are older versions, now unused.
- All motion respects `prefers-reduced-motion`. Cursor glow, magnetic buttons and card tilt are disabled on touch.
