# Invicly Technologies

A full-stack marketing website, admin CMS, and careers/recruiting module for **Invicly Technologies** — built with Next.js (App Router) and MongoDB Atlas. Every piece of content (hero copy, about page, services, products, team, testimonials, job postings, site settings) is stored in the database and editable from a hidden admin dashboard, so the site can be updated without ever touching code.

## Stack

- **Next.js 16** (App Router, JavaScript)
- **MongoDB Atlas** via Mongoose — kept deliberately lean (no file storage, no history logs) to fit comfortably on the free tier
- **NextAuth.js** (Credentials provider) for admin auth; a separate hand-rolled **JWT** system (`jsonwebtoken` + httpOnly cookie) for candidate/careers auth
- **Tailwind CSS** + **next-themes** for the light/dark toggle (available on both the public site and the admin dashboard)
- **framer-motion**, **lucide-react**, **embla-carousel-react**
- **react-hook-form** + **zod** for form validation
- **nodemailer** for contact-form notifications and candidate OTP emails (Gmail SMTP)
- **bcryptjs** for hashing admin/candidate passwords and OTP codes

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.local.example` to `.env.local` and fill in the values (see below).
3. Seed the database (creates the admin login + all dummy content):

   ```bash
   npm run seed
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Environment variables (`.env.local`)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string (Database Access user, not your Atlas account login) |
| `NEXTAUTH_SECRET` | Random string used to sign admin session tokens |
| `NEXTAUTH_URL` | Base URL of the app (`http://localhost:3000` in dev) |
| `CANDIDATE_JWT_SECRET` | Separate random string used to sign candidate (careers) login tokens — deliberately not shared with `NEXTAUTH_SECRET` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Used only by `npm run seed` to create the first **super admin** login |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Gmail SMTP credentials used to email contact-form notifications and candidate OTP codes |
| `CONTACT_NOTIFY_EMAIL` | Where contact-form notification emails are sent |

`.env.local` is git-ignored and never committed.

## Admin dashboard

There is **no login link anywhere on the public site** by design. To manage content:

1. Go to `/admin/login` directly.
2. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env.local` (change the password from the dashboard's Settings page after first login). This account is the **super admin** — flagged `isSuperAdmin: true` by the seed script — and can never be deleted or disabled, even by itself.
3. From the dashboard sidebar you can edit the Hero section, About page, Services, Products, Team, Testimonials, Job postings, Applications, Candidates, contact-form Messages, and global Site Settings. Changes go live on the public site immediately — no redeploy needed. A theme toggle lives next to the sidebar header.
4. **Admin users** (sidebar link, super admin only): create additional admin accounts, disable/delete them. Only the super admin can manage other admins or disable/delete candidate accounts; any admin can manage job postings and update application statuses.

> Signing in again is required after an admin's role changes (e.g. after upgrading `isSuperAdmin` directly in the database) — the permission is baked into the session token at login time, not re-checked from the database on every request.

## Careers module

- Public pages under `/careers` list open roles; applying requires a separate **candidate account** (own signup/login, unrelated to admin auth).
- Candidate signup requires **email verification via a 6-digit OTP**; forgot-password also goes through OTP. Both are emailed via the same Gmail SMTP config used for contact notifications.
- In development (`NODE_ENV !== "production"`), OTP codes are also printed to the server console (`[otp] ...`) so you can test the flow without reading real email — this never happens in production.
- Resumes are submitted as a **link** (Google Drive, Dropbox, etc.) — there's no file upload/storage.
- Candidates can track their application status at `/careers/applications` after logging in.

## Project structure

```text
src/
  app/
    (site)/            # public pages: home, about, services, products, careers, contact
    admin/
      login/            # standalone admin sign-in page
      dashboard/        # protected CMS (middleware-guarded), incl. jobs/applications/candidates/admins
    api/
      admin/            # authenticated CRUD endpoints for every content type
      auth/              # NextAuth route
      candidate/          # candidate signup/login/OTP/application endpoints
      contact/            # public contact-form submission endpoint
  components/
    site/               # public site UI (header, footer, hero, cards, application form, etc.)
    admin/               # dashboard UI (sidebar, resource manager, icon picker, admins/candidates managers)
    ui/                   # shared primitives (button, input, card, modal)
  lib/                    # db connection, auth config, candidate JWT + OTP, validators, data fetchers
  models/                 # Mongoose schemas (incl. Candidate, JobPosting, Application)
scripts/seed.mjs           # idempotent seed script (super admin, dummy content, sample jobs)
```

## Notes

- Images (hero background, service/product photos, team headshots) are set via URL fields in the admin forms — there's no file upload/storage integration.
- Public content pages are rendered dynamically (`force-dynamic`) so admin edits appear instantly without a rebuild.
- MongoDB Atlas free tier (512MB) friendly by design: no binary storage, no growing history/session collections — check current usage anytime with `db.stats()` in a Mongo shell or script.
- Deploying: any Next.js-compatible host works (e.g. Vercel). Set the same environment variables there, and make sure the host's outbound IP is allowed in Atlas Network Access.
