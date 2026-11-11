import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "deploy/web-vitals": {
    plain: [
      "People leave slow websites. Google measures how a page feels to real visitors with three numbers called Core Web Vitals. They answer three simple questions: does the main content show up quickly, does the page react quickly when I tap, and does the page stay still while it loads?",
      "LCP measures the first question: how long until the biggest image or block of text appears. INP measures the second: how long after a click or key press until the screen changes. CLS measures the third: how much things jump around, like a button that moves just as you try to tap it.",
      "You can measure these two ways. A lab test, such as Lighthouse in Chrome, loads your page on a simulated slow phone and gives you a detailed report. Field data comes from real visitors on their own phones and networks. The lab helps you find the cause; the field tells you if real people are happy.",
      "Fixing performance works best one problem at a time. Find which metric is worst, find the element or script that causes it, fix that, and measure again.",
    ],
    deepDive: [
      {
        heading: "How the thresholds are judged",
        body: "Each metric has three bands. LCP is good at 2.5 seconds or less and poor above 4 seconds. INP is good at 200 milliseconds or less and poor above 500 ms. CLS is good at 0.1 or less and poor above 0.25. Anything between is \"needs improvement\".\n\nA page passes when the 75th percentile of real visits is in the good band, for each metric separately, and mobile and desktop are judged separately too. The 75th percentile means three out of four visits must be at least that fast, so a fast laptop on office Wi-Fi does not hide slow phones. Google's public field data, the Chrome UX Report (CrUX), uses a rolling 28-day window, so a fix takes weeks to show fully there. INP replaced the older First Input Delay (FID) metric in March 2024; FID measured only the delay before the first interaction, while INP looks at nearly all interactions on the page.",
        visual: {
          type: "compare",
          title: "Good and poor thresholds (75th percentile)",
          columns: [
            { title: "LCP", points: ["Good: 2.5 s or less", "Poor: over 4 s", "Measured once per page load"] },
            { title: "INP", points: ["Good: 200 ms or less", "Poor: over 500 ms", "Close to the slowest interaction"] },
            { title: "CLS", points: ["Good: 0.1 or less", "Poor: over 0.25", "Largest burst of layout shifts"] },
          ],
        },
      },
      {
        heading: "Running Lighthouse and reading the report",
        body: "Open Chrome DevTools, choose the Lighthouse panel, pick Mobile and Performance, and analyse the page in an incognito window so extensions do not interfere. By default Lighthouse simulates a mid-range phone on a slow 4G connection, which is why scores are lower than your own experience. PageSpeed Insights (pagespeed.web.dev) runs the same audit on Google's servers and also shows CrUX field data for your URL when enough visitors exist.\n\nThe performance score combines five lab metrics: Total Blocking Time (30 percent), LCP (25), CLS (25), First Contentful Paint (10) and Speed Index (10). A lab test has no real user clicking, so it cannot measure INP; Total Blocking Time, the time long JavaScript tasks block the main thread, stands in for it. Scores vary a few points between runs, so run it several times. Below the score, the Diagnostics section names the LCP element and the scripts and images causing problems.",
        bullets: ["npx lighthouse https://example.com --view runs it from the terminal", "Test a production build, never the dev server", "DevTools Performance panel shows live LCP, INP and CLS as you interact"],
      },
      {
        heading: "Finding and fixing the LCP bottleneck",
        body: "LCP can be split into four parts: Time to First Byte (the server's response), resource load delay (how long before the browser even starts downloading the LCP image), resource load duration (the download itself), and element render delay (time until it is painted). Lighthouse and the DevTools Performance panel show this breakdown, so you fix the biggest part instead of guessing.\n\nCommon fixes match each part. Slow TTFB: cache pages, render static pages at build time, or use a CDN. Long load delay: the image is discovered late, often because it is a CSS background or added by JavaScript, or because it is lazy loaded; put it in the HTML, give it the fetchpriority=\"high\" attribute, and never lazy load the hero. Long download: serve a correctly sized modern format such as WebP or AVIF; next/image does this, and on the hero you can pass loading=\"eager\" and fetchPriority=\"high\". Render delay: render-blocking CSS, web fonts or client-side rendering of the main content.",
        visual: {
          type: "flow",
          title: "The four parts of LCP",
          steps: [
            { label: "TTFB", detail: "Server sends the first byte of HTML" },
            { label: "Load delay", detail: "Browser discovers the hero image" },
            { label: "Load duration", detail: "Image bytes download" },
            { label: "Render delay", detail: "CSS, fonts, JS finish; image painted" },
          ],
        },
      },
      {
        heading: "Improving INP: keeping the main thread free",
        body: "An interaction has three phases: input delay (the browser is busy with other work when you tap), processing time (your event handlers run), and presentation delay (the browser recalculates layout and paints the next frame). JavaScript runs on a single main thread, so any task longer than 50 ms, called a long task, can delay all three.\n\nFixes: ship less JavaScript, for example by keeping components as Server Components in Next.js and loading heavy widgets with dynamic import only when needed. Break long work into chunks and yield to the browser between them, with await scheduler.yield() where supported or a setTimeout of 0 as a fallback. In React, wrap non-urgent updates such as filtering a big list in startTransition (or useTransition), so typing stays responsive. Debounce expensive handlers, avoid huge DOM trees, and give immediate visual feedback, such as a pressed state, before the slow work starts.",
      },
      {
        heading: "Removing layout shifts",
        body: "A layout shift happens when a visible element moves without the user causing it. Each shift gets a score from how much of the screen moved and how far. CLS is not a simple total: shifts are grouped into session windows (bursts of shifts less than 1 second apart, up to 5 seconds long) and the worst window counts. Shifts within 500 ms after a click or key press are excluded, because the user expects the page to react.\n\nThe usual causes and fixes: images and videos without size, so give them width and height attributes or CSS aspect-ratio and the browser reserves the space. Ads, embeds and cookie banners injected above content, so reserve a fixed-size slot or show banners as an overlay. Web fonts that swap in with different sizes; next/font self-hosts fonts and adjusts the fallback font's metrics to reduce the jump. Animate with transform and opacity, which never cause layout shifts, instead of top, left, width or height.",
        bullets: ["Use width and height on every img, or next/image which requires them", "Skeleton placeholders the same size as the final content", "DevTools Performance panel highlights each layout shift"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Lab data vs field data",
        columns: [
          { title: "Lab (Lighthouse)", points: ["One simulated device and network", "Repeatable, run any time", "Detailed diagnostics", "Cannot measure INP (uses TBT)"] },
          { title: "Field (CrUX, RUM)", points: ["Real users, devices and networks", "75th percentile over 28 days in CrUX", "What Google uses for ranking signals", "Tells you that it is slow, not why"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing a slow hero image in Next.js",
        explanation: "Lighthouse says LCP is 4.8 s on mobile and the LCP element is the hero image, with a long resource load delay. Step 1: the image was a CSS background, discovered only after the CSS loaded. Step 2: switch to next/image in the HTML. Step 3: load it eagerly with high fetch priority, and set sizes so phones download a small version. Step 4: rerun Lighthouse; load delay drops and LCP moves under 2.5 s.",
        code: {
          lang: "tsx",
          code: "import Image from 'next/image';\nimport hero from './hero.jpg'; // static import gives width, height and blur data\nexport function Hero() {\n  return (\n    <Image\n      src={hero}\n      alt=\"Runners at sunrise on the beach\"\n      loading=\"eager\"     // never lazy load the LCP image\n      fetchPriority=\"high\" // download it before other images\n      sizes=\"100vw\"       // browser picks a size that fits the screen\n      placeholder=\"blur\"\n      style={{ width: '100%', height: 'auto' }}\n    />\n  );\n}",
        },
      },
      {
        title: "Sending real-user Web Vitals to your analytics",
        explanation: "Lab scores looked fine, but you want to see real phones. Step 1: Next.js provides useReportWebVitals, a hook that receives each metric as the browser measures it. Step 2: put it in a small client component rendered from the root layout. Step 3: send name, value and rating with navigator.sendBeacon, which still delivers when the page is closing. Step 4: in your analytics, chart the 75th percentile per page.",
        code: {
          lang: "tsx",
          code: "'use client';\nimport { useReportWebVitals } from 'next/web-vitals';\n\nexport function WebVitals() {\n  useReportWebVitals((metric) => {\n    // metric.name is 'LCP', 'INP', 'CLS', 'FCP' or 'TTFB'\n    const body = JSON.stringify({ name: metric.name, value: metric.value, rating: metric.rating, page: location.pathname });\n    navigator.sendBeacon('/api/vitals', body);\n  });\n  return null;\n}\n// app/layout.tsx: render <WebVitals /> inside <body>",
        },
      },
    ],
    cheatSheet: [
      "Good: LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less (75th percentile)",
      "Lighthouse = lab (simulated slow phone); CrUX and RUM = field (real users)",
      "Never lazy load the LCP image; give it fetchpriority=\"high\" (fetchPriority in JSX)",
      "LCP parts: TTFB, load delay, load duration, render delay",
      "Long task = over 50 ms on the main thread; split work and yield",
      "startTransition for non-urgent React updates keeps input responsive",
      "Set width and height (or aspect-ratio) on images and embeds to prevent CLS",
      "Animate transform and opacity, not top, left, width or height",
    ],
    quiz: [
      {
        q: "Which metric can Lighthouse NOT measure directly, because no real user interacts?",
        options: ["LCP", "CLS", "INP", "Speed Index"],
        answer: 2,
        why: "INP needs real interactions; Lighthouse reports Total Blocking Time as a lab proxy.",
      },
      {
        q: "The LCP breakdown shows a long resource load delay. What is the most likely fix?",
        options: ["Make the hero image discoverable in the HTML and give it high priority", "Minify CSS", "Add more web fonts", "Increase the CLS budget"],
        answer: 0,
        why: "Load delay means the browser found the image late, often because it was lazy loaded or set in CSS or JavaScript.",
      },
      {
        q: "When does a page pass a Core Web Vital in field data?",
        options: ["When the average visit is good", "When the fastest visit is good", "When Lighthouse scores 90", "When the 75th percentile of visits is good"],
        answer: 3,
        why: "Using the 75th percentile makes sure most visitors, including slower devices, get a good experience.",
      },
      {
        q: "Which change avoids layout shift when an image loads?",
        options: ["Loading the image with JavaScript", "Setting width and height attributes", "Using a PNG instead of a JPEG", "Animating the image's height"],
        answer: 1,
        why: "With dimensions known, the browser reserves the right space before the image arrives.",
      },
      {
        q: "Typing in a search box feels laggy because each key re-filters a 10,000-row list. What helps INP most directly?",
        options: ["Preload the hero image", "Add a CDN", "Mark the list update as a transition and keep the input update urgent", "Add width and height to the rows"],
        answer: 2,
        why: "startTransition lets React keep the input responsive and render the heavy list update without blocking it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run a mobile Lighthouse audit on a production build of your app and write down the LCP element, LCP time, TBT and CLS.",
        hint: "npm run build && npm run start, then DevTools, Lighthouse panel, Mobile, Performance.",
        solution: "1. npm run build && npm run start\n2. Open http://localhost:3000 in an incognito window\n3. DevTools > Lighthouse > Mobile > Performance > Analyze page load\n4. Note LCP, TBT and CLS in the Metrics section\n5. In Diagnostics, open \"Largest Contentful Paint element\" to see which element it is\n6. Run it 3 times and use the median",
      },
      {
        level: "medium",
        task: "A product card image causes a CLS of 0.18. The img has no size and loads from a CMS URL. Fix it without changing the design.",
        hint: "Reserve the space with known dimensions or an aspect ratio.",
        solution: "Option 1, plain img: add width=\"400\" height=\"300\" and CSS width: 100%; height: auto.\nOption 2, CSS: wrap it in a box with aspect-ratio: 4 / 3 and make the image fill it with object-fit: cover.\nOption 3, next/image: pass width and height (or fill inside a sized parent) and add the CMS host to images.remotePatterns in next.config.\nThen rerun Lighthouse and confirm CLS is 0.1 or less.",
      },
      {
        level: "hard",
        task: "A click handler processes 5,000 items in one loop and blocks the main thread for 400 ms. Rewrite it to yield to the browser every 500 items.",
        hint: "Use scheduler.yield() when it exists, otherwise a setTimeout(0) promise.",
        solution: "const yieldToMain = () =>\n  'scheduler' in globalThis && 'yield' in (globalThis as any).scheduler\n    ? (globalThis as any).scheduler.yield()\n    : new Promise((r) => setTimeout(r, 0));\n\nasync function processAll(items: Item[]) {\n  for (let i = 0; i < items.length; i++) {\n    processItem(items[i]);\n    if (i % 500 === 499) await yieldToMain();\n  }\n}",
      },
    ],
    faq: [
      { q: "Do Core Web Vitals affect Google rankings?", a: "Yes, they are part of Google's page experience signals, but content relevance matters far more. Treat them mainly as a user experience goal: faster pages keep more visitors." },
      { q: "Why is my Lighthouse score different every time?", a: "Network, CPU load and server response time vary between runs. Run it several times, use the median, and compare before and after changes under the same conditions." },
      { q: "What replaced First Input Delay?", a: "Interaction to Next Paint (INP) replaced FID as a Core Web Vital in March 2024. INP measures the full time from interaction to the next frame, across almost all interactions, not just the first." },
      { q: "Is a Lighthouse score of 100 necessary?", a: "No. Aim for the good thresholds in field data on mobile. A score of 90 or more on a mid-range phone simulation is a strong result for most apps." },
    ],
  },

  "deploy/deploy-ci": {
    plain: [
      "Deploying means putting your app on a server so anyone can open it. In the old days that was a manual job with many steps. Today a platform like Vercel watches your Git repository and deploys automatically every time you push.",
      "Every pull request gets its own preview deployment: a real, live copy of the site with your changes at its own URL. Teammates can click through it before anything reaches real users. When the pull request is merged into main, the platform builds and deploys to production.",
      "Apps need settings like database addresses and API keys. These live in environment variables, set in the platform's dashboard, with different values for development, preview and production. They never go into your Git repository.",
      "Continuous integration (CI) is the safety net. Before a change can be merged, automatic checks run: lint, type check, tests and a build. If any check fails, the merge button stays blocked.",
    ],
    deepDive: [
      {
        heading: "Connecting a repository to Vercel",
        body: "In the Vercel dashboard, choose to add a new project and import your GitHub, GitLab or Bitbucket repository. Vercel detects Next.js and fills in the build command and output settings, so the defaults usually work. The first deployment runs immediately and gives you a production URL on vercel.app; add your own domain later in the project's domain settings.\n\nFrom then on, the Git integration does the work: a push to the production branch (main by default) creates a production deployment, and a push to any other branch creates a preview deployment. Vercel reports each deployment's status on the commit and comments on the pull request with the preview link. Every deployment is immutable and keeps its own URL, which is why Instant Rollback can switch production back to an earlier deployment in seconds without rebuilding. The Vercel CLI (npm i -g vercel) offers the same from the terminal: vercel link, vercel for a preview and vercel --prod.",
        visual: {
          type: "flow",
          title: "What one git push triggers",
          steps: [
            { label: "git push", detail: "Branch or main" },
            { label: "Webhook", detail: "Git provider notifies Vercel" },
            { label: "Build", detail: "npm install, next build with env vars" },
            { label: "Deploy", detail: "Immutable deployment with its own URL" },
            { label: "Assign", detail: "Preview URL, or production domain if main" },
          ],
        },
      },
      {
        heading: "Environment variables per environment",
        body: "Vercel has three environments: Production, Preview and Development. Each variable can be set for any of them with different values, so production uses the real database while previews use a test database. You can even scope a preview value to one branch. Values are read at build time and at runtime by server code. After changing a variable, redeploy, because existing deployments keep the values they were built with.\n\nNext.js adds one important rule. Variables are server-only by default. Only names starting with NEXT_PUBLIC_ are inlined into the JavaScript sent to browsers, and they are fixed when the app is built. So a secret must never have that prefix, and a public value changed after the build needs a new build. For local development, run vercel env pull .env.local to download development values; .env.local should be in .gitignore. Vercel also provides system variables such as VERCEL_ENV (production, preview or development) and VERCEL_GIT_COMMIT_SHA.",
        bullets: ["DATABASE_URL: server-only, different per environment", "NEXT_PUBLIC_SITE_URL: visible to everyone, baked in at build", "Validate required variables at start-up, for example with Zod"],
        visual: {
          type: "compare",
          title: "Server-only vs public variables in Next.js",
          columns: [
            { title: "DATABASE_URL", points: ["Read by server code only", "Never in the browser bundle", "Use for secrets and keys", "Read at runtime"] },
            { title: "NEXT_PUBLIC_API_URL", points: ["Inlined into client JavaScript", "Anyone can read it", "Only for public values", "Fixed at build time"] },
          ],
        },
      },
      {
        heading: "Preview deployments in a review workflow",
        body: "A preview turns review from reading code into using the change. Product owners and designers can test on their own phones; reviewers can check that a bug is really fixed. Previews can be protected so only your team can open them, which matters when they show unreleased features. Automated tools can also use the URL: GitHub sends a deployment_status event when Vercel finishes, so a workflow can run Playwright or Lighthouse against the exact preview.\n\nPreviews need their own data. Never point them at the production database: one test that deletes rows would delete real user data. Use a separate preview database, or a database branch per pull request if your provider supports branching. Third-party integrations need the same care: use test-mode API keys for payments and email, and add preview domains to your auth provider's allowed callback URLs, or sign-in will fail on previews.",
      },
      {
        heading: "CI checks that guard the main branch",
        body: "A typical CI job for a Next.js app runs on every pull request: install with npm ci (exact versions from package-lock.json), lint, type check with tsc --noEmit, run unit tests with vitest run, and run next build, which catches errors only visible in a production build. E2E tests can run in the same workflow or against the preview URL. Cache npm downloads with actions/setup-node's cache option to save time, and add a concurrency group with cancel-in-progress: true so a new push cancels the outdated run.\n\nChecks only protect you if they are required. In GitHub, add a branch protection rule or ruleset on main that requires pull requests, requires the CI status checks to pass, and blocks direct pushes. Fast feedback matters: if CI takes 20 minutes, people start ignoring it. Run cheap checks first and in parallel jobs, and keep the full suite under about 10 minutes.",
        bullets: ["npm ci, not npm install, in CI", "tsc --noEmit catches type errors that next dev may not stop on", "concurrency group ci-${{ github.ref }} with cancel-in-progress: true"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One repo, three environments",
        root: "Your Git repository",
        children: [
          { label: "Development", children: ["Your laptop, next dev", ".env.local (not committed)", "Local or dev database"] },
          { label: "Preview", children: ["Every branch and pull request", "Unique URL per deployment", "Test database, test API keys"] },
          { label: "Production", children: ["The main branch", "Your real domain", "Real database and secrets"] },
        ],
      },
    ],
    examples: [
      {
        title: "A fast, parallel CI workflow for pull requests",
        explanation: "Step 1: the workflow runs on pull requests and on pushes to main. Step 2: concurrency cancels older runs for the same branch. Step 3: one job installs once with the npm cache and runs lint, type check, unit tests and build. Step 4: in GitHub settings, mark the check job as required on main so red pull requests cannot merge.",
        code: {
          lang: "yaml",
          code: "name: CI\non: { pull_request: {}, push: { branches: [main] } }\nconcurrency:\n  group: ci-${{ github.ref }}\n  cancel-in-progress: true\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci\n      - run: npm run lint && npx tsc --noEmit && npx vitest run\n      - run: npm run build",
        },
      },
      {
        title: "Failing fast when an environment variable is missing",
        explanation: "A preview deploy works but every page crashes, because DATABASE_URL was set only for Production. Step 1: describe the required variables with a Zod schema in one file. Step 2: parse process.env when the server starts, so a missing value fails with a clear message instead of a confusing error later. Step 3: import env from this file instead of reading process.env directly. Step 4: add the variable for Preview in Vercel and redeploy.",
        code: {
          lang: "ts",
          code: "// src/env.ts (server-only)\nimport { z } from 'zod';\n\nconst schema = z.object({\n  DATABASE_URL: z.string().url(),\n  AUTH_SECRET: z.string().min(32),\n  NEXT_PUBLIC_SITE_URL: z.string().url(),\n});\n\nconst parsed = schema.safeParse(process.env);\nif (!parsed.success) {\n  throw new Error('Invalid environment variables: ' + parsed.error.message);\n}\nexport const env = parsed.data;",
        },
      },
    ],
    cheatSheet: [
      "Push to main = production deploy; push to any other branch = preview deploy",
      "vercel link, vercel (preview), vercel --prod, vercel env pull .env.local",
      "Set env vars per environment; redeploy after changing them",
      "Only NEXT_PUBLIC_ variables reach the browser, and they are fixed at build time",
      "Never point previews at the production database",
      "CI: npm ci, lint, tsc --noEmit, vitest run, next build",
      "Make CI checks required on main with branch protection or a ruleset",
      "Instant Rollback restores an earlier production deployment without rebuilding",
    ],
    quiz: [
      {
        q: "You change an environment variable in Vercel. When does a running deployment see the new value?",
        options: ["Immediately", "After the next deployment", "After 24 hours", "Only in preview"],
        answer: 1,
        why: "Deployments keep the values they were built with, so you must redeploy.",
      },
      {
        q: "Which variable can safely hold a Stripe secret key in Next.js?",
        options: ["NEXT_PUBLIC_STRIPE_KEY", "A constant in a client component", "A value in next.config with the public prefix", "STRIPE_SECRET_KEY, read only in server code"],
        answer: 3,
        why: "Variables without the NEXT_PUBLIC_ prefix are not sent to the browser.",
      },
      {
        q: "Why use npm ci instead of npm install in CI?",
        options: ["It installs exactly the versions in the lockfile and fails if they do not match", "It is the only command that works on Linux", "It skips devDependencies", "It updates packages to the latest versions"],
        answer: 0,
        why: "Reproducible installs mean CI tests the same dependencies you tested locally.",
      },
      {
        q: "A failing CI check does not stop a pull request from being merged. What is missing?",
        options: ["A preview deployment", "A Vercel token", "A required status check in branch protection", "The NEXT_PUBLIC_ prefix"],
        answer: 2,
        why: "Checks only block merging when the branch protection rule marks them as required.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the environment variables your app needs and decide, for each, which environments get it and whether it may be public.",
        hint: "Ask: would it be a problem if a stranger saw this value?",
        solution: "DATABASE_URL          server-only; prod = real DB, preview = test DB, dev = local\nAUTH_SECRET           server-only; different random value per environment\nAUTH_GOOGLE_SECRET    server-only; preview and dev use a test OAuth app\nNEXT_PUBLIC_SITE_URL  public; production domain, preview uses its deployment URL\nSENTRY_DSN            public DSN is fine; auth token for uploads is server-only",
      },
      {
        level: "medium",
        task: "Add a concurrency rule and npm caching to an existing CI workflow, and explain what each does.",
        hint: "concurrency at the workflow level; cache on actions/setup-node.",
        solution: "concurrency:\n  group: ci-${{ github.ref }}\n  cancel-in-progress: true   # a new push cancels the outdated run\n\n- uses: actions/setup-node@v4\n  with:\n    node-version: 22\n    cache: npm                # reuses downloaded packages, keyed on package-lock.json",
      },
      {
        level: "hard",
        task: "Run Playwright against each Vercel preview after it finishes deploying, using the preview URL as the base URL.",
        hint: "Trigger on deployment_status and read github.event.deployment_status.target_url; in playwright.config.ts set use.baseURL to process.env.BASE_URL.",
        solution: "on: deployment_status\njobs:\n  e2e:\n    if: github.event.deployment_status.state == 'success'\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci && npx playwright install --with-deps chromium\n      - run: npx playwright test\n        env: { BASE_URL: \"${{ github.event.deployment_status.target_url }}\" }",
      },
    ],
    faq: [
      { q: "Is Vercel free for personal projects?", a: "Vercel has a free Hobby plan meant for personal, non-commercial projects, with usage limits. Team and commercial use needs a paid plan, so check the current pricing page before you launch a business on it." },
      { q: "Can I deploy Next.js somewhere other than Vercel?", a: "Yes. Next.js runs anywhere Node.js runs (next build then next start), in a Docker container, or on platforms such as Netlify, AWS Amplify and Cloudflare with adapters. Static exports can go on any static host." },
      { q: "Why does my app work locally but fail on Vercel?", a: "The most common causes are a missing environment variable for that environment, a file name whose letter case differs from the import (Linux is case-sensitive), and code that only works with next dev. Read the build logs and run next build locally." },
      { q: "What is the difference between CI and CD?", a: "Continuous integration runs automatic checks on every change. Continuous deployment goes one step further and releases each change that passes those checks to production automatically." },
    ],
  },
};

export default extra;
