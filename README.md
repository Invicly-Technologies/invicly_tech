# invicly.com

The website for **Invicly Tech** ("Think. Build. Invicly."): the company site, **Invicly Learn** (free learning paths and a study tracker) and the **Invicly Blog** (600+ visual guides).

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Neon Postgres · deployed on Vercel.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL and LEARN_AUTH_SECRET for /learn accounts
npm run dev                  # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (prerenders ~1,300 pages) |
| `npm start` | Runs the production build locally |
| `npm run lint` | Type-checks the project (`tsc --noEmit`) |
| `npm run content:check` | Validates all article content (shape, quiz answers, diagram sizes, plain-text rules) |
| `npm run content:index` | Regenerates `src/data/learn/extra/parts/index.ts` after adding article files |

## What lives where

| Area | URL | Code |
| --- | --- | --- |
| Company site | `/`, `/products/`, `/services/`, `/about/`, `/contact/` (form backend: `/api/contact/`) | `src/app/(site)`, `src/components/sections`, copy in `src/data/{site,products,services}.ts` |
| Invicly Learn | `/learn/`, `/learn/paths/<path>/`, `/learn/dashboard/`, `/learn/plans/…` | `src/app/learn`, `src/components/learn`, `src/lib/learn` |
| Blog | `/blog/`, `/blog/<article>/`, `/blog/series/<path>/` | `src/app/(learn-blog)/blog` (uses the Learn header and footer) |
| Blog search index | `/blog/search.json` | static, loaded the first time someone focuses the search box |
| RSS feed | `/blog/rss.xml` | for feed readers (not linked in the UI) |

### Learning paths and articles

Every topic in every path is published as a blog article. An article is built from three data sources, all plain TypeScript:

1. **Path data**: `src/data/learn/paths.ts` and `paths-more.ts`. Modules, then topics with hours, a goal, 3–6 subtopics and doc links.
2. **Explainer** (every topic): `src/data/learn/explainers/<path>.ts`. The summary, analogy, 1–2 step-through diagrams, key points, terms, a code example, pitfalls and self-check. Types are in `explainers/types.ts`.
3. **Extended content** (590 of 611 topics): "Explained simply", "In depth" (sections can carry their own diagram), extra diagrams, two worked examples, quick reference, a quiz, three practice exercises and an FAQ. Types and length rules are in `src/data/learn/extra/types.ts`.
   - The original entries are in `src/data/learn/extra/<path>.ts`.
   - Newer entries are one file per module in `src/data/learn/extra/parts/<path>/<module>.ts`.
   - Topics without extended content just hide those sections.

To add or edit article content:

1. Write the entry following `extra/types.ts`. Keep the text plain (no Markdown), short sentences, and make sure facts and commands are accurate.
2. `npm run content:index` (only when you add a new file under `parts/`).
3. `npm run content:check`, then `npm run lint`.

Diagrams are rendered by `src/components/learn/visuals.tsx` (`flow`, `layers`, `cycle`, `compare`, `tree`, `sequence`).

The 21 remaining topics are in the Ethical Hacking path (web testing, exploitation, post-exploitation, wireless/AD, capstone). They need to be written by a person.

### Invicly Learn accounts and plans

- **Auth**: email and password (bcrypt). The session is an HS256 JWT in an httpOnly cookie (`il_session`, 30 days). New accounts verify their email with a 6-digit code (15 min expiry, 5 attempts, 60 s resend cooldown). "Forgot password" uses the same codes, which are HMAC-hashed in `auth_codes`.
- **No admin role**: every account is a learner account.
- **Email**: `src/lib/learn/mail.ts` uses `SMTP_*`. Without SMTP settings (local dev) the code is printed to the server log.
- **Plans**: hours per weekday (`plans.day_hours`, 0 = Sunday). `src/lib/learn/schedule.ts` lays topics onto study days, and `analytics.ts` computes progress, overdue, burn-up and streaks.
- **Plan features**:
  - Subtopics are copied into `plan_subtopics` and are editable.
  - Personal links per topic go in `plan_links`.
  - Start/stop timers write `study_logs` (`timer.tsx`, `active_timers`).
  - Notes use a Tiptap editor (`NotionEditor.tsx`), loaded on demand through `LazyNotionEditor.tsx`.
  - Mind maps: `MindMap.tsx`.
  - Export as Markdown, or PDF via `/learn-export/<planId>/`.
- **"Mark as learned"** on articles and the per-module progress on path roadmaps are stored in the browser (`localStorage`, `il-learned:<path>`). They are separate from signed-in plan progress.
- **Database**: Neon project `invicly-learn` (aws-us-east-1). Tables: `users`, `auth_codes`, `plans`, `plan_items`, `plan_subtopics`, `plan_links`, `study_logs`, `active_timers`. Functions run in `iad1` (`vercel.json`), next to the database.
- **Cold starts**: on Neon's free plan the database sleeps after about 5 idle minutes and the first query takes several seconds. The login, signup and reset pages call `POST /learn/api/warm/` as soon as they open (`DbWarmup.tsx`), so the database is awake by the time the form is sent.

## Design system

- **Tokens** are in `src/app/globals.css` (`@theme`):
  - `--color-blue` (#0a84ff) is the brand accent.
  - `--color-blue-fill` (#006fe0) goes behind white text (4.8:1 contrast).
  - Light mode redefines the tokens under `html[data-theme="light"]`.
- **Fonts**: Poppins (display), Manrope (body), JetBrains Mono (code).
- **Theme**: site-wide light/dark toggle, dark by default (`ThemeToggle.tsx`, `src/lib/learn/theme.ts`).
- **Background**: a mouse-reactive blueprint dot grid (`src/components/ui/BlueprintField.tsx`).
  - It appears only on showcase pages: home, products, Learn landing, blog index and 404 (list in `src/components/layout/SiteBackground.tsx`).
  - It animates only while the pointer moves or a ring is passing, pauses off-screen, and is still for touch and reduced-motion users.
  - Hovering buttons and link-cards sends a small ring through it. Pages can trigger one with `window.dispatchEvent(new CustomEvent("field:pulse", { detail: { x, y } }))`.
- **Motion**: one entrance moment per page (hero headlines via `SplitReveal` with `onMount`). Sections and headings further down render in place. Everything respects `prefers-reduced-motion`.
- **Scrollbars**: 6 px, hidden until you scroll (`ScrollbarAutoHide.tsx`).
- **Style rules**:
  - One colour per headline, with "Invicly." in the home hero as the brand exception.
  - No all-caps labels or label lines above headings.
  - Numbers only where the order matters.
  - Outline buttons have a solid fill.

### Design and accessibility skills for Claude Code

`.claude/skills/` contains reviewed UI/UX skills that Claude Code loads automatically in this repo: `frontend-design`, `web-design-guidelines`, `vercel-react-best-practices`, `vercel-composition-patterns`, `ui-ux-pro-max`, `bencium-*-ux-designer`, and the AccessLint `accessibility-*` skills.

- AccessLint's `npx` commands are pinned to exact versions.
- The web interface guidelines are bundled locally instead of fetched.

## SEO

- Every public page sets its own canonical URL and Open Graph data (`src/lib/seo.tsx`). Never add a canonical in the root layout.
- JSON-LD:
  - Organization and WebSite (root).
  - SoftwareApplication (products), Service list (services) and Course (paths).
  - BlogPosting and LearningResource for each article, plus FAQPage when it has an FAQ, and BreadcrumbList.
- `sitemap.xml` lists every public page and article, with each article's share image.
  - `lastmod` comes from `BLOG_MODIFIED` in `src/data/learn/blog.ts`. Bump it when articles change substantially.
  - `robots.txt` blocks account pages.
- Share images are route handlers: `/learn/og.png`, `/learn/paths/<path>/og.png` and `/blog/<article>/og.png`.
- **Search Console**: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (and optionally the Bing one) in Vercel, deploy, verify, then submit `https://www.invicly.com/sitemap.xml`.
- **IndexNow** key file: `public/f522e415587fb2a8bb76ae11aeececd9.txt`.

## Contact form

The form on `/contact/` posts to the site's own endpoint, `POST /api/contact/` (`src/app/api/contact/route.ts`). No third-party form service is used.

- **Server-side checks**: the fields are validated again on the server.
- **Spam filtering**:
  - A hidden field and a minimum time-to-fill filter bots; they get a fake "sent" reply.
  - Each visitor is limited to 5 messages per 10 minutes.
- **The email**:
  - It goes to `CONTACT_NOTIFY_EMAIL` (falls back to `inviclytech@gmail.com`), sent through the same SMTP account as the Learn codes (`SMTP_*`).
  - It's a formatted table: name, email, company, service, time (IST and UTC), the page it was sent from and the approximate location, followed by the message.
  - "Reply" answers the visitor directly.
- **Without SMTP settings**: in local development the enquiry is printed to the server log. In production the visitor is asked to email directly.

## Git and deploys

- **Repository**: `github.com/Invicly-Technologies/invicly_tech`. Push `master` to `main` over SSH using the `github-invicly` host alias.
- **Commits** are authored as `Invicly <inviclytech@gmail.com>`, with no co-author or attribution lines.
- **Deploys are automatic**: every push to `main` triggers a Vercel production build (about 8–10 minutes). Builds run one at a time, so several quick pushes queue up. Don't also run `vercel --prod` for the same commit; that only adds a duplicate build to the queue.
- **Domain**: `invicly.com` is attached to the Vercel project `invicly-tech`. At the registrar: `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`.
  - Keep the existing `flow.`, `spendly.`, `kivo-control.` and `unreel.` records.
- **Environment variables**: see `.env.example`. Set them in Vercel for Production and Preview. Rotating `LEARN_AUTH_SECRET` logs everyone out.
