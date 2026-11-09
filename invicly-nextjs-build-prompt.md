# Build prompt: Invicly Tech company website (Next.js, static)

Paste everything below into your coding assistant (Claude Code, Cursor, etc.). Put the logo files in `public/brand/` first.

---

## 1. Goal

Build the marketing website for **Invicly Tech** ("Think. Build. Invicly."), a product and services company. It is a multi-page, responsive, animated website with 3D effects, scroll animations, hover effects and drag interaction.

- Framework: **Next.js (App Router) + TypeScript**
- It must be a **fully static site**: `output: 'export'` in `next.config.ts`. No server, no database for now.
- Structure the code so a backend (API routes + PostgreSQL with Prisma) can be added later without a rewrite. Keep all content in `src/data/*.ts`, not hard-coded in components.
- The **contact form must really send an email to inviclytech@gmail.com** from a static site (see section 6).

## 2. Stack

- Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4
- Framer Motion for reveals, hover and scroll-linked animation
- Lenis for smooth scrolling
- React Three Fiber + drei + three for the hero 3D object (lazy loaded, client only)
- react-hook-form + zod for the form
- lucide-react for icons
- Fonts via `next/font/google`: **Poppins** (headings, 600-800), **Manrope** (body), **JetBrains Mono** (small labels)

## 3. Brand and design tokens

Use the attached logo files:
- `public/brand/invicly-mark.png` (the "i + check" mark on black)
- `public/brand/invicly-full.png` (mark + "InviclyTech" + tagline)
The logo images have a black background. The site background is pure black `#000`, so render them with `mix-blend-mode: lighten` or crop them. Better: ask me for a transparent PNG/SVG and replace later.

Wordmark: "Invicly" in white, "Tech" in blue, Poppins 800.

Colors:
- Background `#000000`, deep surface `#03060C`, card `#080E1C`, border `rgba(255,255,255,0.10)`
- Text `#F5F8FF`, muted `#B4C0D8`, quiet `#8FA0BD`
- Primary blue `#0A84FF`, light blue `#5AB0FF`, deep blue `#1650A0`
- Product accents (icon tiles only): Flow `#3D9BFF`, Spendly `#34D399`, Kivo `#A78BFA`, Unreel `#A3E635`

Style: dark, high contrast, generous spacing, large Poppins headings with tight tracking, rounded 20-32px cards, pill buttons. All text must meet WCAG AA contrast.

## 4. Pages and routes

| Route | Content |
|---|---|
| `/` | Home |
| `/products` | All products, alternating rows with app mock visuals |
| `/products/[slug]` | One page per product (`flow`, `spendly`, `kivo`, `unreel`) using `generateStaticParams` |
| `/services` | The 8 services, engagement models, CTA |
| `/about` | Story, values, how we work |
| `/contact` | Contact form, email, what happens next |
| `/not-found` | Branded 404 |

Shared: sticky-on-scroll header (hides on scroll down, shows on scroll up), mobile drawer menu, footer, page transitions, `sitemap.ts`, `robots.ts`, per-page metadata and Open Graph image.

### Home sections, in order
1. **Hero**: chip "Product and services company · 4 products live", H1 "Think. Build. Invicly." (Invicly in blue), subtext, buttons "Explore products" and "Start a project". Right side: 3D scene (see section 5).
2. **Marquee**: WEBSITES · ANDROID APPS · WINDOWS APPS · LINUX APPS · CLOUD MANAGEMENT · SERVERS · SUPPORT · CONSULTING, looping.
3. **Products**: "Four products. All free to use." Four cards (icon tile, name, one-line description, platforms, status badge, "Open X" link).
4. **Services**: "Built for your business, not just ours." Eight numbered cards linking to `/services`.
5. **How we work**: Think / Build / Invicly with a connecting line that draws on scroll.
6. **Showcase**: "We use what we build." A tilted browser window showing the Flow app that flattens as you scroll, with a floating card in front (depth).
7. **CTA**: "Have a project in mind?" with button and email link.

## 5. Animation and 3D spec (important)

Build all of these. Every animation must respect `prefers-reduced-motion` (replace with simple fades).

**3D**
- Hero: a glowing wireframe cube (R3F) with product names on the faces (Flow, Spendly, Kivo, Unreel), the Invicly mark on top. It auto-rotates slowly and the visitor can **drag to rotate** with inertia. It also tilts slightly toward the mouse (parallax). Around it: two tilted dashed orbit rings rotating in opposite directions, a moving blue grid floor with a radial fade, and small floating chips (Next.js, Android, Cloud, Linux) that bob up and down.
- If WebGL is unavailable, the device is low-power or the screen is narrow, fall back to a CSS 3D cube.
- About page: the logo mark spinning on its Y axis inside a tilted orbit ring.
- Services header: three concentric rings rotating on different axes around a pulsing blue core.

**Scroll**
- Smooth scrolling with Lenis.
- Sections and cards fade and rise in (`whileInView`, once), staggered.
- The tilted Flow window on Home uses `useScroll` + `useTransform` to rotate from `rotateX(16deg) rotateY(-14deg)` to flat as it centers in the viewport.
- The process line on Home draws from 0 to 100% with scroll progress.
- Thin blue scroll progress bar at the top of the page.
- Header background blurs in after 40px of scroll.

**Hover and pointer**
- Cards: 3D tilt following the pointer (max 6deg) with a soft blue glow border and a moving highlight.
- Buttons: lift 3px with a blue glow; primary buttons have a subtle magnetic pull toward the cursor.
- Product link arrow nudges up-right on hover.
- Custom soft blue glow that follows the cursor on desktop only (hidden on touch).
- Input focus: blue ring.

**Page transitions**: short fade and rise between routes.

## 6. Contact form that works on a static site

Requirement: submissions arrive in **inviclytech@gmail.com**, with no server.

Use a form-to-email service called from the browser. Implement **FormSubmit** first (no account needed):

- `POST https://formsubmit.co/ajax/inviclytech@gmail.com` with JSON body
- Fields: `name`, `email`, `company` (optional), `service`, `message`, plus `_subject: "New enquiry from invicly.com"`, `_template: "table"`, `_captcha: "false"`, and `_replyto` = the visitor's email so you can reply directly
- **One-time activation**: the first submission makes FormSubmit email inviclytech@gmail.com an activation link. Click it once. After that every submission is delivered. Tell me this clearly in the README.
- Put the endpoint in an env var `NEXT_PUBLIC_CONTACT_ENDPOINT` so it can be swapped. Also support **Web3Forms** (`https://api.web3forms.com/submit` with a public `access_key`) as an alternative behind `NEXT_PUBLIC_CONTACT_PROVIDER=web3forms`.
- Validate with zod (name 2+ chars, valid email, message 10+ chars). Add a hidden honeypot field `_honey`; if filled, silently pretend success.
- States: idle, sending (button spinner, disabled), success (confirmation panel with "We reply within one business day"), error (message plus a `mailto:inviclytech@gmail.com` fallback link). Keep what the visitor typed on error.
- Rate limit client-side: block a second submit for 30 seconds.
- Service dropdown options: Website development, Mobile app development, Windows or Linux application, Cloud management, Servers and Linux, Support and maintenance, IT consulting, Automation, Something else.
- Later (when we add the backend): a Next.js route handler that stores each message in PostgreSQL via Prisma and sends the email with Nodemailer. Leave a `src/lib/contact.ts` adapter so only that file changes.

## 7. Content data (put in `src/data`)

### Products (`products.ts`)
| Slug | Name | Tagline | Platforms | URL | Status |
|---|---|---|---|---|---|
| flow | Flow | Plan your day. Ship your projects. | Web, Windows, Linux, Android | https://flow.invicly.com/ | Free, **Google Play coming soon** |
| spendly | Spendly | Know what you spend. Never miss what you owe. | Android, Web | https://spendly.invicly.com/ | Free, **Google Play coming soon** |
| kivo | Kivo | Your time data stays on your servers. | Self-hosted (Docker) | https://kivo-control.invicly.com/ | Free key available |
| unreel | Unreel | Count it. Cap it. Unreel. | Android | **https://unreel.invicly.com/** | Free, early preview, **Google Play coming soon** |

Descriptions (use these, they come from the live product sites):
- **Flow**: a light task and project manager. Type a task the way you think (`@Project`, `#label`, `p1`, `tomorrow`, `every mon at 7am`) and Flow picks it up. Daily goals with streaks, a week planner with workload bars, weekly review, focus timer, offline support. Team workspaces add boards, sprints, issue keys and burndown reports. Downloads: Linux (.deb, .rpm), Windows (preview), Android.
- **Spendly**: add expenses by typing ("swiggy 450 upi"), English, Hindi and Hinglish. Credit card dues, loans and EMIs, bills and subscriptions, budgets, reports, works offline and syncs with the web. Never asks for bank logins or moves money.
- **Kivo** (with Kivo Control for licenses): self-hosted time tracking. Timer, timesheets, projects, approvals, invoices, leave, attendance, REST API, SSO. Time data never leaves your server. Unlimited users.
- **Unreel**: counts Instagram Reels and YouTube Shorts you scroll, with a plant called Sprout that wilts as the count climbs. Daily limits that stop the feed, break reminders, stats. No accounts, no servers, works offline.

Show the "Coming soon on Google Play" badge (small outlined pill with a play-triangle icon) on Flow, Spendly and Unreel cards and detail pages. Make the badge a single component so it can become a real Play Store button later (`playStoreUrl?: string` in the data; if set, show the real badge linking to it).

`/products/[slug]` layout (see the Flow mockup): breadcrumb, hero with name and tagline, tilted app window, feature sections specific to the product, platforms grid with links, CTA. Link out to the live product site for sign-up and downloads.

### Services (`services.ts`)
1. Website Development: Next.js and React, SEO-ready, forms, logins, payments, CMS, PostgreSQL apps
2. Mobile App Development: Android, offline-first, notifications and widgets, Play Store or direct APK
3. Windows and Linux Applications: installers, .deb and .rpm, tray icons, offline mode
4. Cloud Management: Azure, AWS, Google Cloud, migrations, cost reviews, monitoring
5. Servers and Linux Administration: Ubuntu and Debian setup, Docker, reverse proxy and SSL, databases and backups
6. Support and Maintenance: bug fixes, security updates, uptime monitoring, monthly or on-demand plans
7. IT Consulting: architecture and code reviews, tool selection, roadmaps and estimates
8. Automation and Integrations: workflow automation, APIs and webhooks, scheduled reports

Engagement models: Fixed project, Monthly retainer, Consulting hours. No prices on the site; "quote after a short call".

### Company facts
- Email: inviclytech@gmail.com
- Reply time: within one business day
- Values: Craftsmanship, Transparency, Ownership, Velocity
- Do **not** invent a phone number, street address, social links, years in business, client counts or testimonials. Leave social links out until I provide them (make a `socials` array in `site.ts` that renders only non-empty entries).

## 8. Responsive behavior

Breakpoints: 390 (mobile), 768 (tablet), 1024, 1280+ (content max width 1240px, side padding 20px mobile and 40px desktop).
- Header collapses to a drawer menu under 1024px. Touch targets 44px or more.
- Card grids use `flex-wrap` or auto-fit so 4 columns become 2, then 1.
- Hero stacks: text first, 3D scene below at about 260px tall on mobile.
- H1 sizes: 92px desktop, 60px mobile. Disable cursor glow, magnetic buttons and card tilt on touch.

## 9. Quality bar

- Lighthouse 95+ on Performance, Accessibility, Best Practices, SEO (mobile)
- Load the 3D scene lazily (`next/dynamic`, `ssr: false`) after first paint; the hero text must render without it
- Images through `next/image` with `unoptimized: true` (required for static export), with width and height set
- Semantic HTML, visible focus states, `aria-label` on icon buttons, alt text on images, skip-to-content link
- Page titles like "Products | Invicly Tech", unique meta descriptions, JSON-LD `Organization`

## 10. Suggested structure

```
src/
  app/
    layout.tsx  page.tsx  not-found.tsx  sitemap.ts  robots.ts
    products/page.tsx  products/[slug]/page.tsx
    services/page.tsx  about/page.tsx  contact/page.tsx
  components/
    layout/ (Header, Footer, MobileMenu, SmoothScroll, PageTransition)
    three/ (HeroScene, CssCubeFallback)
    ui/ (Button, Card3D, Reveal, Marquee, GooglePlayBadge, SectionHeading, CursorGlow)
    sections/ (Hero, ProductsGrid, ServicesGrid, Process, Showcase, CtaBand)
    forms/ (ContactForm)
  data/ (site.ts, products.ts, services.ts)
  lib/ (contact.ts, cn.ts)
public/brand/  public/og.png
```

## 11. Build order

1. Scaffold the project, Tailwind tokens, fonts, layout, header and footer.
2. Build `data/*` and the shared UI components.
3. Home page without 3D, then add the 3D hero and scroll effects.
4. Products, product detail, Services, About.
5. Contact page and the form, then test a real submission and complete the FormSubmit activation.
6. Responsive pass at 390, 768, 1280. Reduced-motion pass.
7. SEO, sitemap, OG image, Lighthouse fixes.
8. `npm run build` must succeed and export to `out/`. Write a README with run, build and deploy steps.

## 12. Deployment

Static export deploys to Vercel, Netlify, Cloudflare Pages, or any web server (serve the `out/` folder). Point `invicly.com` at it. Subdomains `flow.`, `spendly.`, `kivo-control.` and `unreel.` already belong to the products, so keep those as external links.

## 13. Acceptance checklist

- [ ] All 6 route types render and link correctly; 404 works
- [ ] Unreel links to https://unreel.invicly.com/ everywhere
- [ ] Flow, Spendly and Unreel show the "Coming soon on Google Play" badge
- [ ] Contact form delivers an email to inviclytech@gmail.com (tested after activation)
- [ ] Hero 3D cube auto-rotates, drags, and falls back gracefully
- [ ] Scroll reveals, tilted-window flatten, process line and card tilt all work
- [ ] No horizontal scroll at 390px
- [ ] Reduced-motion mode works
- [ ] `npm run build` exports a static site with no errors
