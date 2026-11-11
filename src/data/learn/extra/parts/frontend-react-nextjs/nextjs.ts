import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "nextjs/next-routing": {
    plain: [
      "In a Next.js app, you do not write a list of routes by hand. The folders inside the app directory are the routes. A folder called about with a page.tsx file inside it becomes the page at /about.",
      "Some files have special names. page.tsx is what people see at that address. layout.tsx is a frame that wraps the page, such as a header and sidebar. loading.tsx is shown while the page is getting ready, and error.tsx is shown if something breaks.",
      "Layouts are clever: when you move between pages that share a layout, the layout stays on screen and keeps its state. Only the inside part changes. So a sidebar's scroll position or a search box's text is not lost.",
      "To move between pages, use the Link component instead of a plain a tag. Link loads the next page in the background and swaps it in without a full reload, so navigation feels instant.",
    ],
    deepDive: [
      {
        heading: "The special files and how they nest",
        body: "Each route segment can have its own set of special files, and Next.js wraps them in a fixed order. From outside to inside: layout.tsx, then template.tsx, then an error boundary built from error.tsx, then a Suspense boundary built from loading.tsx, then a not-found boundary from not-found.tsx, and finally page.tsx. A child segment's layout sits inside its parent's page slot.\n\nThis order explains real behavior. An error in a page is caught by the error.tsx in the same folder, but an error in that folder's layout is caught by the parent's error.tsx, because the boundary sits inside the layout. template.tsx is like a layout that remounts on every navigation, useful for enter animations. The root layout must render the html and body tags.",
        visual: {
          type: "layers",
          title: "How one segment's files wrap each other",
          layers: [
            { label: "layout.tsx", detail: "Persists across navigation" },
            { label: "template.tsx", detail: "Optional; remounts on each navigation" },
            { label: "error.tsx boundary", detail: "Catches errors below it" },
            { label: "loading.tsx boundary", detail: "Suspense fallback while the page loads" },
            { label: "not-found.tsx boundary", detail: "Shown when notFound() is called" },
            { label: "page.tsx", detail: "The unique content for this URL" },
          ],
        },
      },
      {
        heading: "Dynamic segments in depth",
        body: "A folder in square brackets matches any value: app/products/[id] serves /products/42. A catch-all [...slug] matches several parts, so app/docs/[...slug] serves /docs/a/b/c with slug as [\"a\", \"b\", \"c\"]. Double brackets [[...slug]] make it optional, so /docs matches too.\n\nIn current Next.js, params and searchParams are promises in pages and layouts: you write const { id } = await params. To build pages ahead of time, export generateStaticParams and return the list of params, for example every product id; Next.js renders those at build time. Call notFound() from next/navigation when the id does not exist, and the nearest not-found.tsx is shown with a 404 status.",
        bullets: ["[id]: one segment", "[...slug]: one or more segments", "[[...slug]]: zero or more segments", "generateStaticParams pre-renders known values"],
      },
      {
        heading: "Organizing without changing URLs",
        body: "Some folder names do not become part of the URL. A route group is a folder in parentheses, such as (marketing) or (dashboard). It lets you group routes and give each group its own layout, so the marketing pages and the app pages can look completely different while URLs stay /pricing and /settings.\n\nA private folder starts with an underscore, such as _components, and is never routable, which is a safe place for files that belong to a route but are not pages. Advanced patterns also exist: parallel routes use @folder slots to render two pages in one layout, and intercepting routes like (.)photo show a page as a modal while keeping a real URL. Learn the basics first; reach for these when a design needs them.",
      },
      {
        heading: "How navigation and prefetching work",
        body: "The Link component renders a real a tag, so it works without JavaScript and for screen readers. Once the app is running, clicking it fetches only the data for the new route (the React Server Component payload), not a full HTML page, and React swaps in the changed segments while shared layouts stay.\n\nIn production, Next.js prefetches links when they scroll into view. For static routes it prefetches the whole route; for dynamic routes it prefetches down to the nearest loading.tsx, so the loading state can appear instantly. In client components, useRouter from next/navigation gives push, replace, back and refresh for navigation in code, such as after a form succeeds. usePathname and useSearchParams read the current URL. In server components and actions, use redirect() instead.",
        visual: {
          type: "sequence",
          title: "Clicking a Link to /blog/hello",
          actors: ["User", "Browser (Next.js router)", "Server"],
          messages: [
            { from: 1, to: 2, label: "prefetch when the link is visible" },
            { from: 2, to: 1, label: "route payload up to loading.tsx" },
            { from: 0, to: 1, label: "click" },
            { from: 1, to: 0, label: "show loading state at once, layout stays" },
            { from: 1, to: 2, label: "fetch the rest of the page data" },
            { from: 2, to: 1, label: "stream the page content" },
          ],
        },
      },
      {
        heading: "Error handling that users can recover from",
        body: "error.tsx must be a client component, so it starts with \"use client\". It receives the error and a reset function; calling reset tries to render the segment again, which helps with temporary failures. In production, the message of errors thrown in server components is hidden from the browser for security, and you get a digest id you can match with your server logs.\n\nErrors in the root layout cannot be caught by app/error.tsx, because the boundary sits inside the layout. For that, add app/global-error.tsx, which replaces the whole document and must render its own html and body. For expected problems, such as a missing product or a failed validation, do not throw: return a message or call notFound(). Throwing is for unexpected failures.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One app, three kinds of folders",
        root: "app/",
        children: [
          { label: "(marketing)/", children: ["layout.tsx with a big hero header", "pricing/page.tsx is /pricing"] },
          { label: "(app)/", children: ["layout.tsx with sidebar", "settings/page.tsx is /settings"] },
          { label: "docs/[...slug]/", children: ["page.tsx is /docs/a/b/c"] },
          { label: "_components/", children: ["Not routable, shared UI"] },
          { label: "not-found.tsx and global-error.tsx", children: ["App-wide 404 and crash screens"] },
        ],
      },
    ],
    examples: [
      {
        title: "A product page with static params and a 404",
        explanation: "Step 1: generateStaticParams returns all known ids, so those pages are built ahead of time. Step 2: the page awaits params and loads the product. Step 3: if it is missing, notFound() shows the nearest not-found.tsx with a real 404 status, which search engines understand. Step 4: a loading.tsx next to the page covers slow loads.",
        code: {
          lang: "tsx",
          code: "// app/products/[id]/page.tsx\nimport { notFound } from \"next/navigation\";\nimport { getProduct, getProductIds } from \"@/lib/products\";\n\nexport async function generateStaticParams() {\n  const ids = await getProductIds();\n  return ids.map((id) => ({ id }));\n}\n\nexport default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  const product = await getProduct(id);\n  if (!product) notFound();\n  return <h1>{product.name}</h1>;\n}",
        },
      },
      {
        title: "An error screen with a retry button",
        explanation: "Step 1: create error.tsx in the dashboard folder and mark it \"use client\". Step 2: log the error, for example to your monitoring tool, in an effect. Step 3: show a friendly message and a Try again button that calls reset. If the dashboard's data fetch fails, only the dashboard area shows this screen; the root layout with the navigation keeps working.",
        code: {
          lang: "tsx",
          code: "// app/dashboard/error.tsx\n\"use client\";\nimport { useEffect } from \"react\";\n\nexport default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {\n  useEffect(() => {\n    console.error(error);\n  }, [error]);\n  return (\n    <div role=\"alert\">\n      <h2>Could not load your dashboard.</h2>\n      <button onClick={() => reset()}>Try again</button>\n    </div>\n  );\n}",
        },
      },
    ],
    cheatSheet: [
      "A folder is a URL segment; it is public only when it contains page.tsx",
      "params and searchParams are promises: const { id } = await params",
      "(group) folders organize routes and layouts without changing the URL",
      "_folder is private and never becomes a route",
      "error.tsx needs \"use client\"; root layout errors need global-error.tsx",
      "notFound() shows not-found.tsx with a 404; redirect() works in server code",
      "Link prefetches visible links in production; useRouter is for client-side code",
      "generateStaticParams pre-renders dynamic routes at build time",
    ],
    quiz: [
      {
        q: "Which URL does app/(shop)/cart/page.tsx serve?",
        options: ["/shop/cart", "/(shop)/cart", "/cart", "It is not a route"],
        answer: 2,
        why: "Folders in parentheses are route groups and are left out of the URL.",
      },
      {
        q: "An error is thrown inside app/dashboard/layout.tsx. Which error.tsx catches it?",
        options: ["app/error.tsx, the parent's boundary", "app/dashboard/error.tsx", "None, layouts cannot throw", "app/dashboard/page.tsx"],
        answer: 0,
        why: "A segment's error boundary sits inside its layout, so layout errors go to the parent's boundary.",
      },
      {
        q: "What does app/docs/[[...slug]]/page.tsx match that [...slug] does not?",
        options: ["/docs/a/b", "/docs/a", "Query strings", "/docs with no extra segments"],
        answer: 3,
        why: "Double brackets make the catch-all optional, so the bare /docs path matches too.",
      },
      {
        q: "In a client component, how do you send the user to /thanks after a successful save?",
        options: ["window.location.href = \"/thanks\" is the only way", "router.push(\"/thanks\") with useRouter from next/navigation", "Import redirect from next/router", "Render a Link and wait for a click"],
        answer: 1,
        why: "useRouter from next/navigation gives client-side push, replace, back and refresh.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create the files for /, /about and /blog, where /blog has its own layout with a sidebar that does not appear on /about.",
        hint: "A layout.tsx inside the blog folder only wraps blog routes.",
        solution: "app/layout.tsx          // root: html, body, site header\napp/page.tsx            // /\napp/about/page.tsx      // /about\napp/blog/layout.tsx     // sidebar + {children}\napp/blog/page.tsx       // /blog",
      },
      {
        level: "medium",
        task: "Add a dynamic route /blog/[slug] that reads the slug, shows a loading state while it loads, and returns a 404 for unknown posts.",
        hint: "You need page.tsx, loading.tsx and a call to notFound().",
        solution: "// app/blog/[slug]/loading.tsx\nexport default function Loading() { return <p>Loading post...</p>; }\n\n// app/blog/[slug]/page.tsx\nimport { notFound } from \"next/navigation\";\nexport default async function Post({ params }: { params: Promise<{ slug: string }> }) {\n  const { slug } = await params;\n  const post = await getPost(slug);\n  if (!post) notFound();\n  return <article><h1>{post.title}</h1></article>;\n}",
      },
      {
        level: "hard",
        task: "Split an app into marketing pages (/, /pricing) with a hero layout and app pages (/dashboard, /settings) with a sidebar layout, each with its own error screen.",
        hint: "Use two route groups, each with a layout.tsx and an error.tsx. Keep one root layout.",
        solution: "app/layout.tsx                    // html + body only\napp/(marketing)/layout.tsx        // hero header + footer\napp/(marketing)/page.tsx          // /\napp/(marketing)/pricing/page.tsx  // /pricing\napp/(marketing)/error.tsx         // \"use client\"\napp/(app)/layout.tsx              // sidebar shell\napp/(app)/dashboard/page.tsx      // /dashboard\napp/(app)/settings/page.tsx       // /settings\napp/(app)/error.tsx               // \"use client\"",
      },
    ],
    faq: [
      { q: "What is the difference between the App Router and the Pages Router?", a: "The App Router (app directory) is the current model, with server components, nested layouts and streaming. The Pages Router (pages directory) is the older model and is still supported, but new projects should use the App Router." },
      { q: "Should I use Link or an a tag in Next.js?", a: "Use Link for links inside your app; it renders an a tag but adds prefetching and client-side navigation. Use a plain a tag for external sites." },
      { q: "Why are params a Promise in Next.js?", a: "Since Next.js 15, params and searchParams are async so Next.js can start rendering before they are needed. Await them in server components, or use React's use() in client components." },
    ],
  },

  "nextjs/next-rsc": {
    plain: [
      "In the App Router, a component runs on the server unless you say otherwise. A server component can read a database or a secret key directly and send finished HTML to the browser. Its own code never travels to the user's device.",
      "Some parts of a page must run in the browser: a button that counts clicks, a menu that opens, a form that reacts as you type. For those you write \"use client\" at the top of the file. That file becomes a client component, and its code is sent to the browser.",
      "The goal is simple: keep as much as possible on the server, and make only the interactive pieces client components. Less JavaScript in the browser means faster loading, especially on cheap phones and slow networks.",
      "The two kinds work together. A server page can fetch data and pass it as props to a small client button. The data travels as plain values, like text and numbers, so it must be something that can be turned into JSON-like data.",
    ],
    deepDive: [
      {
        heading: "What actually goes over the wire",
        body: "When a request comes in, Next.js renders server components to a compact format called the React Server Component payload. It describes the finished UI: HTML-like elements, the props for each client component, and references to the JavaScript files those client components need. Next.js also turns it into HTML for the first load, so the user sees content before any JavaScript runs.\n\nIn the browser, React reads the payload, downloads only the client component code, and hydrates those parts, which means attaching event handlers to the existing HTML. Server components are never hydrated because they have no browser code. On later navigations, only the payload is fetched, not a full HTML page.",
        visual: {
          type: "flow",
          title: "From request to interactive page",
          steps: [
            { label: "Server renders", detail: "Server components run and fetch data" },
            { label: "RSC payload", detail: "UI tree plus props for client components" },
            { label: "HTML", detail: "Sent first so content shows fast" },
            { label: "Client JS loads", detail: "Only code for \"use client\" components" },
            { label: "Hydration", detail: "Client parts become interactive" },
          ],
        },
      },
      {
        heading: "\"use client\" is a boundary, not a label",
        body: "The directive goes at the very top of a file and marks an entry point into the client bundle. Every module that file imports also becomes client code, even if those files have no directive. So marking a layout or page with \"use client\" pulls its whole import tree into the browser.\n\nYou only need the directive on the file where server code first hands over to client code. A component without it, imported from a client file, runs on the client too. Note that client components are still rendered to HTML on the server for the first load; \"client\" means their code also ships and runs in the browser. Use it when you need state, effects, event handlers, browser APIs like localStorage, or context.",
        bullets: ["Needs useState, useEffect or onClick: client", "Uses window, localStorage or context: client", "Reads a database or secret: server", "Only renders data: server"],
      },
      {
        heading: "Passing data and components across the boundary",
        body: "Props from a server component to a client component must be serializable: strings, numbers, booleans, null, plain objects and arrays, Date, Map, Set, and promises. Functions cannot be passed, with one exception: server actions, which become references the client can call. Class instances lose their methods.\n\nYou can still put server components inside client components through composition. A client Tabs component can receive server-rendered content as children or as other props. The server renders those children first, and the client component only decides where to place them. This keeps heavy content, like a rendered markdown article, on the server while the tab switching runs in the browser.",
        visual: {
          type: "tree",
          title: "Server content inside a client wrapper",
          root: "page.tsx (server)",
          children: [
            { label: "Tabs (client)", children: ["children: Article (server)", "children: Comments (server)"] },
            { label: "LikeButton (client)", children: ["initial={42} is a plain number"] },
            { label: "Footer (server)" },
          ],
        },
      },
      {
        heading: "Keeping secrets on the server",
        body: "Server components can read process.env.DATABASE_URL safely, because their code never ships. The risk is accidental imports: if a client component imports a file that reads a secret, the bundler may try to include it. Only environment variables prefixed with NEXT_PUBLIC_ are inlined into client code; others are empty there, which can cause confusing bugs.\n\nGuard server-only modules by adding import \"server-only\" at the top of the file (install the server-only package). Any attempt to import that module from a client component then fails at build time with a clear error. Put your database client, auth helpers and data-access functions behind this guard.",
      },
      {
        heading: "Checking what you ship",
        body: "Measure instead of guessing. In the browser, open DevTools, go to the Network tab, filter by JS, and reload: you see every script the page downloads and its size. The Coverage tab shows how much of that code actually runs. For a breakdown by package, use a bundle analyzer such as @next/bundle-analyzer, which draws a map of each chunk and the libraries inside it.\n\nTypical findings: a date or chart library pulled into the client by a component that only formats data, or a whole page marked \"use client\" for one button. Fixes are moving that work to a server component, splitting the interactive part into its own small file, or loading a heavy widget only when needed with next/dynamic.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where to put the boundary",
        columns: [
          { title: "Too high", points: ["\"use client\" on page.tsx", "Whole page and its imports ship", "No direct database access", "Large bundle, slower hydration"] },
          { title: "Just right", points: ["Page stays a server component", "Only LikeButton has \"use client\"", "Data fetched on the server", "Tiny bundle for one button"] },
        ],
      },
    ],
    examples: [
      {
        title: "Splitting a product page",
        explanation: "The original page was fully client-side: it fetched in an effect and shipped a markdown library. Step 1: remove \"use client\" from the page and make it async. Step 2: fetch the product and render the markdown description on the server; the library never ships. Step 3: move the Add to cart button into its own client file that receives just the id and price. The browser now downloads only the button's code.",
        code: {
          lang: "tsx",
          code: "// app/products/[id]/page.tsx (server)\nimport { renderMarkdown } from \"@/lib/markdown\";\nimport { getProduct } from \"@/lib/products\";\nimport { AddToCart } from \"./add-to-cart\";\n\nexport default async function Page({ params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  const product = await getProduct(id);\n  return (\n    <article>\n      <h1>{product.name}</h1>\n      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(product.description) }} />\n      <AddToCart id={product.id} price={product.price} />\n    </article>\n  );\n}",
        },
      },
      {
        title: "Protecting the database module",
        explanation: "A teammate once imported the db helper into a client component, and the build tried to bundle the database driver for the browser. Step 1: install the server-only package. Step 2: import it at the top of lib/db.ts. Step 3: now any client import of lib/db fails the build with a clear message, before a secret or driver can leak.",
        code: {
          lang: "ts",
          code: "// lib/db.ts\nimport \"server-only\";\nimport { neon } from \"@neondatabase/serverless\";\n\nconst sql = neon(process.env.DATABASE_URL!);\n\nexport async function getProduct(id: string) {\n  const rows = await sql`SELECT id, name, price FROM products WHERE id = ${id}`;\n  return rows[0] ?? null;\n}",
        },
      },
    ],
    cheatSheet: [
      "Components are server components by default in the app directory",
      "\"use client\" at the top of a file makes it and everything it imports client code",
      "Client components are still pre-rendered to HTML on the server",
      "Props across the boundary must be serializable; functions are not (except server actions)",
      "Pass server components to client components as children to keep them on the server",
      "import \"server-only\" makes client imports of a module fail at build time",
      "Only NEXT_PUBLIC_ environment variables are available in client code",
      "Check JS size in DevTools Network (filter JS) or with @next/bundle-analyzer",
    ],
    quiz: [
      {
        q: "A file without \"use client\" is imported by a client component. Where does its code run?",
        options: ["Only on the server", "It causes a build error", "Only during build", "On the client too, as part of the client bundle"],
        answer: 3,
        why: "Everything imported from a client entry point joins the client bundle.",
      },
      {
        q: "Which prop can a server component NOT pass to a client component?",
        options: ["A plain arrow function like () => alert(1)", "A Date", "An array of objects", "A server action"],
        answer: 0,
        why: "Regular functions are not serializable; server actions are the exception.",
      },
      {
        q: "Are client components rendered on the server at all?",
        options: ["Never", "Only in development", "Yes, to HTML for the first load, then hydrated in the browser", "Only if they have no state"],
        answer: 2,
        why: "Client components are pre-rendered to HTML; their code also ships so they become interactive.",
      },
      {
        q: "What does import \"server-only\" do?",
        options: ["Speeds up server rendering", "Makes the build fail if a client component imports that module", "Hides the file from Git", "Encrypts environment variables"],
        answer: 1,
        why: "It is a guard that turns accidental client imports into a build error.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A page shows a list of posts and one Subscribe button with a click counter. Decide which component is server and which is client, and write the directive in the right file.",
        hint: "Only the part with state and onClick needs the directive.",
        solution: "// app/page.tsx: server (async, fetches posts, no directive)\n// app/subscribe-button.tsx:\n\"use client\";\nimport { useState } from \"react\";\nexport function SubscribeButton() {\n  const [n, setN] = useState(0);\n  return <button onClick={() => setN(n + 1)}>Subscribe ({n})</button>;\n}",
      },
      {
        level: "medium",
        task: "Build a client Collapsible component that toggles open and closed, and use it from a server page to wrap server-rendered content.",
        hint: "Pass the server content as children; the client component only shows or hides it.",
        solution: "// collapsible.tsx\n\"use client\";\nimport { useState, type ReactNode } from \"react\";\nexport function Collapsible({ title, children }: { title: string; children: ReactNode }) {\n  const [open, setOpen] = useState(false);\n  return (<section><button onClick={() => setOpen(!open)}>{title}</button>{open && children}</section>);\n}\n\n// app/page.tsx (server)\n// <Collapsible title=\"Details\"><ServerRenderedSpecs /></Collapsible>",
      },
      {
        level: "hard",
        task: "A dashboard page has \"use client\" at the top because of one date picker, and it imports a large charting library to draw static charts. Plan the refactor to cut the client bundle and list the steps.",
        hint: "Find which parts truly need the browser, and render static charts on the server (for example as SVG).",
        solution: "1. Remove \"use client\" from page.tsx; make it async and fetch data there.\n2. Move the date picker into date-filter.tsx with \"use client\".\n3. Make the picker update the URL (?from=...) with useRouter.\n4. Page reads searchParams and fetches filtered data on the server.\n5. Render static charts as server components (SVG), so the chart\n   library is not shipped; keep only interactive charts client-side,\n   loaded with next/dynamic.\n6. Compare JS size in the Network tab before and after.",
      },
    ],
    faq: [
      { q: "Do server components replace API routes?", a: "For reading data in your own pages, mostly yes: fetch directly in the server component. You still need route handlers for webhooks, mobile apps and other external clients." },
      { q: "Can I use useState in a server component?", a: "No. Hooks with state or effects, and event handlers, only work in client components. Move the interactive part into a small \"use client\" file." },
      { q: "Is \"use client\" bad for SEO?", a: "No. Client components are still rendered to HTML on the server for the first load. The cost is extra JavaScript, not missing content." },
    ],
  },

  "nextjs/next-data": {
    plain: [
      "In the App Router, a server component can simply be an async function. You await your data, from a database or an API, and return the UI. No useEffect, no loading flags for the first render.",
      "Next.js then decides when to build that page. Some pages can be built once and served to everyone, like a pricing page. Some must be built for each visitor, like a dashboard that reads the user's cookie. Some sit in between: built once and refreshed every few minutes.",
      "Revalidation is how cached pages get fresh again. You can say refresh at most every 60 seconds, or you can tell Next.js to refresh right now, for example after an editor publishes a new blog post.",
      "Streaming makes slow data less painful. Wrap a slow part of the page in a Suspense boundary, and Next.js sends the rest of the page immediately, then fills in the slow part when its data arrives.",
    ],
    deepDive: [
      {
        heading: "Static or dynamic: how Next.js decides",
        body: "By default, Next.js tries to render each route at build time. A route becomes dynamic, rendered per request, as soon as it uses request-time information: cookies(), headers(), searchParams, or the connection() function. Since Next.js 15, fetch requests are not cached by default either, so a route that fetches without any cache option renders fresh on every request.\n\nYou can see the result in the next build output, which marks each route as static or dynamic. You can also force a choice with route segment config: export const dynamic = \"force-dynamic\" or export const revalidate = 3600 in a page or layout. A dynamic route is not bad: dashboards and pages with user data should be dynamic. Just make it a deliberate choice.",
        bullets: ["cookies(), headers(), searchParams: dynamic", "fetch with no cache option: not cached (Next.js 15+)", "fetch(url, { cache: \"force-cache\" }): cached", "export const revalidate = 60: refresh the route at most each minute"],
      },
      {
        heading: "The caching layers",
        body: "Next.js has several caches, and confusion usually comes from mixing them up. Request memoization: during one render, identical GET fetch calls run only once, so two components can fetch the same URL without a double request; for database calls, wrap the function in React's cache() to get the same effect. Data cache: stores fetch results across requests and deployments when you opt in with force-cache or revalidate. Full route cache: the rendered HTML and payload of static routes, built at build time. Router cache: in the browser, it keeps payloads of visited and prefetched routes for fast back and forward navigation.\n\nRevalidation clears the data cache and the affected routes. After a mutation, call router.refresh() or revalidate on the server so the browser cache picks up new data too.",
        visual: {
          type: "layers",
          title: "Next.js caches, from browser to source",
          layers: [
            { label: "Router cache (browser)", detail: "Visited and prefetched route payloads" },
            { label: "Full route cache (server)", detail: "Pre-rendered HTML and payload for static routes" },
            { label: "Data cache (server)", detail: "Opt-in fetch results across requests" },
            { label: "Request memoization", detail: "Dedupes identical calls in one render" },
            { label: "Data source", detail: "Your database or API" },
          ],
        },
      },
      {
        heading: "Revalidating by time or on demand",
        body: "Time-based revalidation uses stale-while-revalidate. With revalidate: 60, the first visitor after 60 seconds still gets the cached page instantly, and Next.js rebuilds it in the background; the next visitor sees the fresh version. It is simple and fits content that may be a little stale.\n\nOn-demand revalidation refreshes exactly when data changes. revalidatePath(\"/blog\") clears one route. revalidateTag(\"posts\") clears every fetch tagged with next: { tags: [\"posts\"] }, across all pages that use it. Call these from server actions or route handlers, for example from a CMS webhook. In Next.js 16, revalidateTag takes a second argument for the cache profile, such as \"max\", and the new updateTag(\"posts\") is meant for server actions where users must see their own change immediately.",
      },
      {
        heading: "Streaming with Suspense",
        body: "Without streaming, the whole page waits for its slowest query. With a Suspense boundary around a slow component, Next.js sends the page shell and the fallback first, keeps the HTTP response open, and streams the finished component when its data arrives. React inserts it in place. loading.tsx is simply a Suspense boundary around the whole page.\n\nPlace boundaries by how users read the page: the header and main content should not wait for a recommendations widget. Start independent fetches in parallel, either in separate components inside separate Suspense boundaries, or with Promise.all, so you do not build a waterfall where each request waits for the previous one.",
        visual: {
          type: "sequence",
          title: "A streamed product page",
          actors: ["Browser", "Next.js server", "Reviews API"],
          messages: [
            { from: 0, to: 1, label: "GET /products/42" },
            { from: 1, to: 0, label: "HTML: header, product, reviews fallback" },
            { from: 1, to: 2, label: "fetch reviews (slow)" },
            { from: 2, to: 1, label: "reviews data" },
            { from: 1, to: 0, label: "stream the reviews HTML chunk" },
            { from: 0, to: 0, label: "React swaps fallback for content" },
          ],
        },
      },
      {
        heading: "The newer model: Cache Components and \"use cache\"",
        body: "Next.js 16 adds an opt-in model called Cache Components, enabled with cacheComponents: true in next.config.ts. Everything is dynamic by default, and you mark what can be cached with the \"use cache\" directive at the top of a function, component or file. cacheLife(\"hours\") sets how long it lives, and cacheTag(\"posts\") lets you revalidate it by tag. Uncached data that is slow must sit inside a Suspense boundary.\n\nThis pairs with partial prerendering: the static shell of a page is served instantly from the edge, and dynamic holes stream in. It works for database calls, not only fetch. Route segment options like dynamic and revalidate do not apply in this mode. Because caching rules changed across Next.js 13, 14, 15 and 16, always check the docs for the version in your package.json.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Choosing a rendering strategy for a page",
        steps: [
          { label: "Per-user data?", detail: "Yes: dynamic, uses cookies or a session" },
          { label: "Changes on a known event?", detail: "Yes: cache and revalidate by tag" },
          { label: "Can be a few minutes stale?", detail: "Yes: cache with revalidate seconds" },
          { label: "Never changes until deploy?", detail: "Fully static" },
          { label: "Slow parts?", detail: "Wrap them in Suspense to stream" },
        ],
      },
    ],
    examples: [
      {
        title: "A blog that refreshes when an editor publishes",
        explanation: "Step 1: tag the posts fetch with \"posts\" and cache it. Step 2: the blog pages are now served from cache. Step 3: the CMS calls a webhook route when a post is published. Step 4: the route checks a shared secret and revalidates the tag, so every page that lists posts refreshes on the next visit. In Next.js 15, call revalidateTag(\"posts\") with one argument instead.",
        code: {
          lang: "ts",
          code: "// lib/posts.ts\nexport async function getPosts() {\n  const res = await fetch(\"https://cms.example.com/posts\", {\n    cache: \"force-cache\",\n    next: { tags: [\"posts\"] },\n  });\n  return res.json();\n}\n\n// app/api/revalidate/route.ts\nimport { revalidateTag } from \"next/cache\";\nexport async function POST(req: Request) {\n  if (req.headers.get(\"x-secret\") !== process.env.REVALIDATE_SECRET) return new Response(null, { status: 401 });\n  revalidateTag(\"posts\", \"max\");\n  return Response.json({ revalidated: true });\n}",
        },
      },
      {
        title: "Removing a waterfall",
        explanation: "A user page awaited the profile, then the orders, then the recommendations, taking 200 + 300 + 800 ms. Step 1: start profile and orders together with Promise.all, cutting that part to 300 ms. Step 2: move recommendations into their own async component inside a Suspense boundary, so the page appears after about 300 ms and recommendations stream in later.",
        code: {
          lang: "tsx",
          code: "import { Suspense } from \"react\";\nimport { getProfile, getOrders, getRecommendations } from \"@/lib/data\";\n\nasync function Recommendations({ userId }: { userId: string }) {\n  const items = await getRecommendations(userId);\n  return <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;\n}\n\nexport default async function Account() {\n  const [profile, orders] = await Promise.all([getProfile(), getOrders()]);\n  return (<main>\n    <h1>{profile.name}</h1><p>{orders.length} orders</p>\n    <Suspense fallback={<p>Loading picks...</p>}><Recommendations userId={profile.id} /></Suspense>\n  </main>);\n}",
        },
      },
    ],
    cheatSheet: [
      "Async server components fetch data directly; no useEffect needed",
      "Next.js 15+: fetch is not cached unless you pass cache: \"force-cache\" or next.revalidate",
      "cookies(), headers() and searchParams make a route dynamic",
      "fetch(url, { next: { tags: [\"posts\"] } }) then revalidateTag to refresh by tag",
      "revalidatePath(\"/blog\") refreshes one route after a change",
      "Wrap slow components in Suspense; loading.tsx does it for a whole page",
      "Use Promise.all for independent requests to avoid waterfalls",
      "Next.js 16 opt-in: cacheComponents: true, then \"use cache\" with cacheLife and cacheTag",
    ],
    quiz: [
      {
        q: "In Next.js 15, a server component calls fetch(url) with no options. Is the result cached between requests?",
        options: ["Yes, forever", "Yes, for 60 seconds", "Only in development", "No, it is fetched fresh on each request"],
        answer: 3,
        why: "Since Next.js 15, fetch is uncached by default; you opt in with force-cache or revalidate.",
      },
      {
        q: "With revalidate: 60, what does the first visitor after 61 seconds see?",
        options: ["The cached page, while a fresh one is built in the background", "A loading spinner", "An error", "A page built just for them, after waiting"],
        answer: 0,
        why: "It is stale-while-revalidate: serve stale instantly, regenerate in the background.",
      },
      {
        q: "Which call refreshes every cached fetch tagged \"products\" across all pages?",
        options: ["router.refresh()", "revalidatePath(\"/\")", "revalidateTag(\"products\")", "cookies().delete(\"products\")"],
        answer: 2,
        why: "Tags group cached data across routes, and revalidateTag clears that group.",
      },
      {
        q: "Why wrap a slow reviews section in a Suspense boundary?",
        options: ["To cache it forever", "So the rest of the page can be sent first and reviews stream in later", "To run it on the client", "To make it static"],
        answer: 1,
        why: "Suspense lets Next.js stream the shell and fallback without waiting for the slow data.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make a server component that fetches https://api.example.com/rates and caches the result for 10 minutes.",
        hint: "Use the next.revalidate option in seconds.",
        solution: "export default async function Rates() {\n  const res = await fetch(\"https://api.example.com/rates\", {\n    next: { revalidate: 600 },\n  });\n  const rates: Record<string, number> = await res.json();\n  return <pre>{JSON.stringify(rates, null, 2)}</pre>;\n}",
      },
      {
        level: "medium",
        task: "Two components on one page both need the current user from the database. Make sure only one query runs per request.",
        hint: "Database calls are not deduplicated like fetch; wrap the function in React's cache.",
        solution: "// lib/user.ts\nimport \"server-only\";\nimport { cache } from \"react\";\nimport { db } from \"@/lib/db\";\n\nexport const getCurrentUser = cache(async (id: string) => {\n  return db.user.findUnique({ where: { id } });\n});\n// Both components call getCurrentUser(id); the query runs once per request.",
      },
      {
        level: "hard",
        task: "A product page shows details (fast), stock levels (must be live) and reviews (slow, can be an hour old). Design the data loading so the page appears quickly and each part has the right freshness.",
        hint: "Mix caching per fetch and separate Suspense boundaries.",
        solution: "// details: fetch(url, { next: { revalidate: 3600, tags: [\"product-42\"] } })\n// stock: fetch(stockUrl, { cache: \"no-store\" }) in a Stock component\n// reviews: fetch(reviewsUrl, { next: { revalidate: 3600 } }) in a Reviews component\nexport default async function Page() {\n  const product = await getDetails();\n  return (<>\n    <h1>{product.name}</h1>\n    <Suspense fallback={<p>Checking stock...</p>}><Stock id={product.id} /></Suspense>\n    <Suspense fallback={<p>Loading reviews...</p>}><Reviews id={product.id} /></Suspense>\n  </>);\n}",
      },
    ],
    faq: [
      { q: "Why does my Next.js page show old data after I update the database?", a: "The page or its data is cached. Call revalidatePath or revalidateTag after the change, or make that data uncached if it must always be live." },
      { q: "Should I fetch my own API route from a server component?", a: "No. It adds an extra network hop and breaks at build time. Call the same function the route handler uses directly." },
      { q: "What is the difference between loading.tsx and Suspense?", a: "loading.tsx is a Suspense boundary around a whole route segment. A Suspense boundary you write yourself can wrap just one slow part of a page." },
      { q: "Is static rendering always better?", a: "It is fastest, but only for data that is the same for everyone. Personalized or live data should be dynamic, with slow parts streamed." },
    ],
  },

  "nextjs/next-actions": {
    plain: [
      "Most apps need to change data: add a todo, save a profile, delete a comment. Traditionally you would write an API endpoint and then call it with fetch from the browser. Server actions skip that extra layer.",
      "A server action is an async function marked with \"use server\". It always runs on the server, so it can talk to the database. But you can pass it to a form's action, or call it from a button, as if it were a normal function.",
      "Behind the scenes, Next.js turns each action into a POST request. That means anyone could call it with their own data, not just your form. So every action must check who the user is and validate the input, usually with a library like Zod.",
      "After saving, you tell Next.js which pages now show old data, with revalidatePath or revalidateTag. The form can show a pending state while it waits and an error message if something is wrong.",
    ],
    deepDive: [
      {
        heading: "How a server action call really works",
        body: "When you mark a function with \"use server\", the build replaces it in client code with a reference: an encrypted id. Calling it sends a POST request to the current page with that id and the arguments, serialized like props. On the server, Next.js finds the function, runs it, and returns the result, along with an updated page payload if you revalidated something, all in one round trip.\n\nYou can define actions in a separate file with \"use server\" at the top, which is the cleanest choice and the only one usable from client components, or inline inside a server component function. Inline actions can close over variables; Next.js encrypts those values so the client cannot read them, but do not rely on that for secrets. Actions run one at a time per client, so they are made for mutations, not for fetching data.",
        visual: {
          type: "sequence",
          title: "One action call, one round trip",
          actors: ["Client component", "Next.js server", "Database"],
          messages: [
            { from: 0, to: 1, label: "POST with action id + FormData" },
            { from: 1, to: 1, label: "auth check, Zod validation" },
            { from: 1, to: 2, label: "INSERT ... for this user" },
            { from: 1, to: 1, label: "revalidatePath(\"/todos\")" },
            { from: 1, to: 0, label: "return value + fresh page payload" },
          ],
        },
      },
      {
        heading: "Validating input with Zod",
        body: "FormData values are strings or files, and anyone can send anything. Define a schema that describes valid input and parse it at the top of the action. z.coerce.number() turns \"3\" into 3, .min() and .max() limit lengths, and z.email() checks the format in Zod 4. Use safeParse, which returns success or error instead of throwing, so you can send field errors back to the form.\n\nIn Zod 4, z.flattenError(result.error).fieldErrors gives an object like { title: [\"Too short\"] }, which maps straight onto messages under each input. Return the user's previous values too, so a failed submit does not wipe the form. Never trust hidden inputs either: a userId in a hidden field can be edited in DevTools, so read the user from the session.",
        bullets: ["safeParse returns { success, data } or { success, error }", "z.coerce.number() for numeric fields", "z.flattenError(error).fieldErrors for per-field messages", "Take the userId from the session, never from the form"],
      },
      {
        heading: "Pending, errors and optimistic updates",
        body: "Pass the action to useActionState in a client component. The action then receives the previous state as its first argument and returns the next one, for example { errors } or { ok: true }. The hook gives you that state, the formAction for the form, and isPending for disabling the button. useFormStatus works for a submit button deep inside the form.\n\nFor instant feedback, useOptimistic shows the expected result before the server answers, such as adding the todo to the list at once. When the action finishes and the page revalidates, the real data replaces the optimistic version; if it failed, the optimistic item disappears. Forms that pass an action straight to the action prop also work before JavaScript has loaded, which is called progressive enhancement.",
      },
      {
        heading: "After the mutation: revalidate and redirect",
        body: "Changing the database does not change cached pages. Call revalidatePath(\"/todos\") for one route or revalidateTag(\"todos\") for all data with that tag. Because the response from an action includes the refreshed payload, the user sees the new data without a second request.\n\nTo send the user elsewhere, such as from a create form to the new item, call redirect(\"/todos/\" + id) from next/navigation. redirect works by throwing a special error, so call it after your try/catch block, not inside it, or your catch will swallow it. Server actions have a default body size limit of 1 MB, which you can raise with serverActions.bodySizeLimit in next.config if you accept file uploads.",
        visual: {
          type: "flow",
          title: "A safe server action, top to bottom",
          steps: [
            { label: "Authenticate", detail: "Read the session; reject if missing" },
            { label: "Validate", detail: "Zod safeParse on FormData" },
            { label: "Authorize", detail: "Does this user own the record?" },
            { label: "Mutate", detail: "Write to the database" },
            { label: "Revalidate", detail: "revalidatePath or revalidateTag" },
            { label: "Return or redirect", detail: "State for the form, or redirect()" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Server action vs route handler for a mutation",
        columns: [
          { title: "Server action", points: ["Called from your own forms and components", "No URL or fetch code to write", "Typed arguments and return value", "Refreshes the page in one round trip"] },
          { title: "Route handler", points: ["Public URL like /api/todos", "Any client: mobile apps, webhooks, scripts", "You choose method, headers, status codes", "Better for third-party integrations"] },
        ],
      },
    ],
    examples: [
      {
        title: "A validated create form with field errors",
        explanation: "Step 1: define the schema and parse FormData with safeParse. Step 2: on failure, return field errors from z.flattenError. Step 3: on success, save the row for the signed-in user and revalidate. Step 4: in the client form, useActionState shows errors under each field and disables the button while pending.",
        code: {
          lang: "ts",
          code: "// app/todos/actions.ts\n\"use server\";\nimport { z } from \"zod\";\nimport { revalidatePath } from \"next/cache\";\nimport { getSession } from \"@/lib/auth\";\nimport { db } from \"@/lib/db\";\n\nconst Todo = z.object({ title: z.string().trim().min(1, \"Required\").max(100), due: z.coerce.date().optional() });\nexport type FormState = { errors?: Record<string, string[] | undefined>; ok?: boolean };\n\nexport async function createTodo(_prev: FormState, formData: FormData): Promise<FormState> {\n  const session = await getSession();\n  if (!session) return { errors: { title: [\"Please sign in\"] } };\n  const parsed = Todo.safeParse({ title: formData.get(\"title\"), due: formData.get(\"due\") || undefined });\n  if (!parsed.success) return { errors: z.flattenError(parsed.error).fieldErrors };\n  await db.todo.create({ data: { ...parsed.data, userId: session.user.id } });\n  revalidatePath(\"/todos\");\n  return { ok: true };\n}",
        },
      },
      {
        title: "An instant-feeling like button with useOptimistic",
        explanation: "Step 1: the server action likePost increments the count and revalidates. Step 2: in the client button, useOptimistic starts from the real count. Step 3: on click, inside startTransition, add one optimistically and call the action. The number changes at once; when the server answers, the real count takes over.",
        code: {
          lang: "tsx",
          code: "\"use client\";\nimport { useOptimistic, startTransition } from \"react\";\nimport { likePost } from \"./actions\";\n\nexport function LikeButton({ postId, likes }: { postId: string; likes: number }) {\n  const [optimistic, addLike] = useOptimistic(likes, (current: number) => current + 1);\n  return (\n    <button onClick={() => startTransition(async () => {\n      addLike(null);\n      await likePost(postId);\n    })}>\n      Like ({optimistic})\n    </button>\n  );\n}",
        },
      },
    ],
    cheatSheet: [
      "\"use server\" at the top of a file makes every export a server action",
      "Every action is a public POST endpoint: authenticate and validate inside it",
      "Read the user id from the session, never from FormData or hidden inputs",
      "Zod: Schema.safeParse(data); field errors via z.flattenError(error).fieldErrors",
      "useActionState gives [state, formAction, isPending] for a form",
      "Call revalidatePath or revalidateTag after writes so pages show fresh data",
      "redirect() throws on purpose: call it outside try/catch",
      "Default body limit is 1 MB; raise serverActions.bodySizeLimit for uploads",
    ],
    quiz: [
      {
        q: "Your form has a hidden userId input. Why is it wrong to use it in the action?",
        options: ["Hidden inputs are not sent", "Anyone can change it in DevTools or send their own request", "FormData cannot hold ids", "It slows down the action"],
        answer: 1,
        why: "Actions accept any POST; only the server session tells you who is really calling.",
      },
      {
        q: "You call redirect(\"/done\") inside a try block, and the catch logs \"Unexpected error\". Why?",
        options: ["redirect works by throwing, and your catch caught it", "redirect only works in client components", "The path must be absolute", "Server actions cannot redirect"],
        answer: 0,
        why: "redirect throws a special error that Next.js handles, so call it after the try/catch.",
      },
      {
        q: "After saving a new todo, the list page still shows the old list. What is missing?",
        options: ["A useEffect in the list", "A page reload by the user", "revalidatePath(\"/todos\") or revalidateTag in the action", "A route handler"],
        answer: 2,
        why: "Cached data stays until you revalidate the route or tag that uses it.",
      },
      {
        q: "Which React hook shows the expected result before the server action finishes?",
        options: ["useFormStatus", "useActionState", "useDeferredValue", "useOptimistic"],
        answer: 3,
        why: "useOptimistic shows a temporary state that is replaced when the real data arrives.",
      },
      {
        q: "When is a route handler a better choice than a server action?",
        options: ["For a mobile app or webhook that needs a stable URL", "For your own form on a page", "For any database write", "When you want less code"],
        answer: 0,
        why: "Server actions are meant for your own UI; external clients need a public, documented endpoint.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a server action deleteNote(id: string) that deletes a note owned by the signed-in user and revalidates /notes.",
        hint: "Filter the delete by both id and userId.",
        solution: "\"use server\";\nimport { revalidatePath } from \"next/cache\";\n\nexport async function deleteNote(id: string) {\n  const session = await getSession();\n  if (!session) throw new Error(\"Not signed in\");\n  await db.note.deleteMany({ where: { id, userId: session.user.id } });\n  revalidatePath(\"/notes\");\n}",
      },
      {
        level: "medium",
        task: "Write a Zod schema for a signup form: email (valid), password (12 to 72 chars), and age (number, at least 13, sent as a string from the form).",
        hint: "Use z.email() and z.coerce.number() in Zod 4.",
        solution: "import { z } from \"zod\";\n\nexport const Signup = z.object({\n  email: z.email(),\n  password: z.string().min(12).max(72),\n  age: z.coerce.number().int().min(13),\n});\n\n// const result = Signup.safeParse(Object.fromEntries(formData));",
      },
      {
        level: "hard",
        task: "Build a client form for createTodo (from the example) that shows field errors under the input, keeps the button disabled while saving, and clears the input after success.",
        hint: "useActionState plus a key that changes on success to reset the field.",
        solution: "\"use client\";\nimport { useActionState } from \"react\";\nimport { createTodo, type FormState } from \"./actions\";\n\nexport function NewTodo() {\n  const [state, formAction, pending] = useActionState(createTodo, {} as FormState);\n  return (<form action={formAction}>\n    <input name=\"title\" aria-label=\"Title\" aria-invalid={!!state.errors?.title} />\n    {state.errors?.title && <p role=\"alert\">{state.errors.title[0]}</p>}\n    <button disabled={pending}>{pending ? \"Saving...\" : \"Add\"}</button>\n  </form>); // uncontrolled fields reset automatically after the action\n}",
      },
    ],
    faq: [
      { q: "Are Next.js server actions secure?", a: "They run on the server and Next.js checks the request origin, but each action is still a public endpoint. You must authenticate, validate and authorize inside every action." },
      { q: "Can I use server actions to fetch data?", a: "You can, but it is not what they are for: actions are POST requests that run one at a time. Fetch data in server components or route handlers instead." },
      { q: "Do server actions work without JavaScript?", a: "Yes, when a form passes the action to its action prop. The form submits as a normal POST, and JavaScript adds pending states and no-reload updates once it loads." },
    ],
  },

  "nextjs/next-api": {
    plain: [
      "Sometimes your app needs a real web address that other programs can call: a mobile app loading data, a payment provider sending a webhook, or a script uploading files. In Next.js you build these with route handlers.",
      "A route handler is a file called route.ts inside the app folder. You export functions named after HTTP methods, like GET or POST. Each one receives the request and returns a response, usually JSON.",
      "Good APIs use status codes to tell the caller what happened: 200 for OK, 201 for created, 400 for bad input, 401 when not signed in, 404 when not found, 500 for a server error. Callers rely on these numbers, so do not return 200 for errors.",
      "A proxy file (called middleware before Next.js 16) runs before your routes. It can check for a login cookie and redirect visitors to the sign-in page. It is a fast first filter, not the only lock: the route itself must still check permissions.",
    ],
    deepDive: [
      {
        heading: "Route handler basics",
        body: "Put route.ts in any folder under app, such as app/api/notes/route.ts for /api/notes. Export GET, POST, PUT, PATCH, DELETE, HEAD or OPTIONS. Each receives a standard Web Request, or a NextRequest which adds helpers like request.nextUrl.searchParams and request.cookies. Dynamic segments work like pages: app/api/notes/[id]/route.ts receives a second argument { params }, which is a promise in current Next.js.\n\nA folder cannot have both route.ts and page.tsx, because both would answer the same URL. Since Next.js 15, GET handlers are not cached by default. Return responses with Response.json(data, { status }) or NextResponse.json. For non-JSON, build a new Response with a body and headers, for example a CSV file with a Content-Type of text/csv.",
        bullets: ["app/api/notes/route.ts serves /api/notes", "Second argument: { params } as a Promise", "request.nextUrl.searchParams.get(\"q\") for query strings", "route.ts and page.tsx cannot share a folder"],
      },
      {
        heading: "Status codes and error shapes",
        body: "Pick status codes that match what happened, so clients can react without parsing messages. 200 OK for reads, 201 Created for a new resource (often with its data or a Location header), 204 No Content for a delete with no body. Client mistakes: 400 for invalid input, 401 when not authenticated, 403 when authenticated but not allowed, 404 when the item does not exist, 409 for a conflict like a duplicate email, 422 is also common for validation errors. Server failures: 500.\n\nKeep one error shape for the whole API, such as { error: { code, message, fields } }, so clients write one error handler. Never send stack traces or database messages to the client; log them on the server. Wrap the handler body in try/catch and turn unexpected errors into a generic 500.",
        visual: {
          type: "tree",
          title: "Common status codes for a JSON API",
          root: "Response status",
          children: [
            { label: "2xx success", children: ["200 OK", "201 Created", "204 No Content"] },
            { label: "4xx client problem", children: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found", "409 Conflict"] },
            { label: "5xx server problem", children: ["500 Internal Server Error", "503 Service Unavailable"] },
          ],
        },
      },
      {
        heading: "Proxy (formerly middleware)",
        body: "Next.js 16 renamed middleware.ts to proxy.ts, and the exported function from middleware to proxy; the old name still works for now but is deprecated. The file sits at the project root (or in src). It runs before routes and before cached content are served, for every request that matches its config.matcher.\n\nInside, you can read cookies and headers, then return NextResponse.next() to continue, NextResponse.redirect(url) to send the user elsewhere, NextResponse.rewrite(url) to serve another path invisibly, or a Response directly. Use the matcher to skip static files and images, because the proxy runs on every matching request and adds latency. Keep it light: check that a session cookie exists, add headers, handle locales or redirects. Do not run slow database queries there.",
        visual: {
          type: "flow",
          title: "Where proxy sits in a request",
          steps: [
            { label: "Request arrives", detail: "GET /dashboard with cookies" },
            { label: "Matcher", detail: "Does this path match config.matcher?" },
            { label: "proxy()", detail: "Light checks: cookie, locale, headers" },
            { label: "Decision", detail: "next(), redirect() or rewrite()" },
            { label: "Route", detail: "Page or route handler checks auth again" },
          ],
        },
      },
      {
        heading: "Why the proxy is not your only lock",
        body: "Treat the proxy as an optimistic check. It sees only the request, and a typo in the matcher can leave a route unprotected. In March 2025, a vulnerability (CVE-2025-29927) let attackers skip Next.js middleware entirely with a special header on self-hosted apps; apps that also checked auth in their pages and handlers stayed safe.\n\nThe pattern recommended by the Next.js docs is a data access layer: a few server-only functions that verify the session and the user's rights right before reading or writing data. Every route handler, server action and server component calls them. Then the proxy only improves user experience, sending signed-out users to /login early, while security lives next to the data.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "PATCH /api/notes/7 by a user who does not own note 7",
        actors: ["Client", "Proxy", "Route handler", "Database"],
        messages: [
          { from: 0, to: 1, label: "PATCH with session cookie" },
          { from: 1, to: 2, label: "cookie present: next()" },
          { from: 2, to: 2, label: "verify session: user 12" },
          { from: 2, to: 3, label: "find note 7 where userId = 12" },
          { from: 3, to: 2, label: "no row" },
          { from: 2, to: 0, label: "404 Not Found (do not reveal it exists)" },
        ],
      },
    ],
    examples: [
      {
        title: "A validated CRUD endpoint for one item",
        explanation: "Step 1: read the id from the awaited params. Step 2: verify the session and return 401 if missing. Step 3: validate the JSON body with Zod and return 400 with field errors if invalid. Step 4: update only a note owned by this user; if none matched, return 404. Step 5: return the updated note with 200. DELETE would follow the same pattern and return 204.",
        code: {
          lang: "ts",
          code: "// app/api/notes/[id]/route.ts\nimport { z } from \"zod\";\nimport { getSession } from \"@/lib/auth\";\nimport { db } from \"@/lib/db\";\n\nconst Patch = z.object({ text: z.string().min(1).max(5000) });\n\nexport async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {\n  const { id } = await params;\n  const session = await getSession();\n  if (!session) return Response.json({ error: \"Sign in first\" }, { status: 401 });\n  const parsed = Patch.safeParse(await req.json().catch(() => null));\n  if (!parsed.success) return Response.json({ error: z.flattenError(parsed.error).fieldErrors }, { status: 400 });\n  const { count } = await db.note.updateMany({ where: { id, userId: session.user.id }, data: parsed.data });\n  if (count === 0) return Response.json({ error: \"Not found\" }, { status: 404 });\n  return Response.json({ id, ...parsed.data });\n}",
        },
      },
      {
        title: "A proxy that sends signed-out users to login",
        explanation: "Step 1: create proxy.ts at the project root (middleware.ts with a middleware function on Next.js 15). Step 2: read the session cookie. Step 3: if it is missing, redirect to /login and remember where the user wanted to go. Step 4: limit the matcher to the private areas so public pages and static files skip the proxy. Pages under /dashboard still verify the session properly.",
        code: {
          lang: "ts",
          code: "// proxy.ts\nimport { NextResponse, type NextRequest } from \"next/server\";\n\nexport function proxy(request: NextRequest) {\n  const hasSession = request.cookies.has(\"session\");\n  if (!hasSession) {\n    const url = new URL(\"/login\", request.url);\n    url.searchParams.set(\"next\", request.nextUrl.pathname);\n    return NextResponse.redirect(url);\n  }\n  return NextResponse.next();\n}\n\nexport const config = {\n  matcher: [\"/dashboard/:path*\", \"/settings/:path*\"],\n};",
        },
      },
    ],
    cheatSheet: [
      "app/api/x/route.ts exports GET, POST, PUT, PATCH or DELETE",
      "Response.json(data, { status: 201 }) for created resources",
      "400 bad input, 401 not signed in, 403 not allowed, 404 missing, 409 conflict",
      "Dynamic route handlers: { params }: { params: Promise<{ id: string }> }",
      "Next.js 16: proxy.ts exporting proxy(); Next.js 15 and earlier: middleware.ts",
      "Use config.matcher so the proxy skips static files and public pages",
      "The proxy is a fast pre-check; verify auth again next to the data",
      "Never return stack traces or raw database errors to clients",
    ],
    quiz: [
      {
        q: "A signed-in user asks to delete a note that belongs to someone else. Which status is a good answer?",
        options: ["200", "404 or 403", "401", "500"],
        answer: 1,
        why: "The user is authenticated but not allowed; 404 also avoids revealing that the note exists.",
      },
      {
        q: "What does NextResponse.rewrite(url) do in the proxy?",
        options: ["Sends a 301 to the browser", "Blocks the request", "Changes the response body", "Serves a different path while the browser URL stays the same"],
        answer: 3,
        why: "A rewrite is internal; a redirect is the one the browser sees.",
      },
      {
        q: "Why should the proxy matcher exclude static files and images?",
        options: ["The proxy runs on every matching request and adds latency", "Static files cannot have cookies", "It is required by Next.js", "Images break the proxy"],
        answer: 0,
        why: "Running code for every asset request slows the site for no benefit.",
      },
      {
        q: "Can app/settings/ contain both page.tsx and route.ts?",
        options: ["Yes, route.ts handles POST and page.tsx handles GET", "Yes, if route.ts only exports GET", "No, both would answer the same URL", "Only in the Pages Router"],
        answer: 2,
        why: "A segment is either a page or an API route; put the API in another folder like app/api/settings.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write GET /api/health that returns { ok: true, time } with status 200 and a Cache-Control header of no-store.",
        hint: "Response.json accepts headers in its second argument.",
        solution: "// app/api/health/route.ts\nexport function GET() {\n  return Response.json(\n    { ok: true, time: new Date().toISOString() },\n    { status: 200, headers: { \"Cache-Control\": \"no-store\" } },\n  );\n}",
      },
      {
        level: "medium",
        task: "Write GET /api/search?q=... that returns 400 if q is missing or shorter than 2 characters, otherwise returns matching product names from a local array.",
        hint: "Use request.nextUrl.searchParams with a NextRequest.",
        solution: "import type { NextRequest } from \"next/server\";\nconst products = [\"Red mug\", \"Blue mug\", \"Teapot\"];\n\nexport function GET(request: NextRequest) {\n  const q = request.nextUrl.searchParams.get(\"q\")?.trim() ?? \"\";\n  if (q.length < 2) {\n    return Response.json({ error: \"q must be at least 2 characters\" }, { status: 400 });\n  }\n  const results = products.filter((p) => p.toLowerCase().includes(q.toLowerCase()));\n  return Response.json({ results });\n}",
      },
      {
        level: "hard",
        task: "Write a webhook handler POST /api/webhooks/payments that reads the raw body, verifies an HMAC-SHA256 signature from the x-signature header with a secret from env, and returns 401 for bad signatures.",
        hint: "Use req.text() for the raw body and crypto.timingSafeEqual to compare.",
        solution: "import { createHmac, timingSafeEqual } from \"node:crypto\";\n\nexport async function POST(req: Request) {\n  const body = await req.text();\n  const sig = req.headers.get(\"x-signature\") ?? \"\";\n  const expected = createHmac(\"sha256\", process.env.WEBHOOK_SECRET!).update(body).digest(\"hex\");\n  const a = Buffer.from(sig), b = Buffer.from(expected);\n  if (a.length !== b.length || !timingSafeEqual(a, b)) {\n    return Response.json({ error: \"Bad signature\" }, { status: 401 });\n  }\n  const event = JSON.parse(body); // handle event.type here\n  return Response.json({ received: true, type: event.type });\n}",
      },
    ],
    faq: [
      { q: "Is middleware deprecated in Next.js 16?", a: "The file was renamed: Next.js 16 uses proxy.ts with an exported proxy function, and middleware.ts is deprecated. The features are the same." },
      { q: "Do I need route handlers if I use server actions?", a: "For your own forms, often not. You still need route handlers for webhooks, mobile apps, public APIs and file downloads." },
      { q: "Where do I put API routes in the App Router?", a: "Anywhere under app as a route.ts file; app/api/... is a common convention, not a requirement." },
    ],
  },

  "nextjs/next-assets": {
    plain: [
      "When someone shares your page on social media or finds it on Google, they first see its title, description and a preview image. This information is called metadata. Next.js lets you set it for each page with a simple exported object.",
      "Images are often the heaviest part of a page. The Next.js Image component resizes each image for the visitor's screen, converts it to modern formats like WebP or AVIF, and loads images below the fold only when the user scrolls near them.",
      "Fonts can cause text to jump when they finish loading, or to be invisible for a moment. next/font downloads the font files when you build, serves them from your own site, and adjusts the fallback font so the swap barely moves anything.",
      "Together these three tools improve search results and sharing previews, and they help your Core Web Vitals scores, which measure how fast and stable a page feels.",
    ],
    deepDive: [
      {
        heading: "Metadata: static, dynamic and inherited",
        body: "Export a metadata object from a layout.tsx or page.tsx. Metadata merges down the tree: the root layout can set defaults, and pages override fields. A title template saves repetition: title: { template: \"%s | Recipes\", default: \"Recipes\" } in the root layout makes a page titled \"Pasta\" show as \"Pasta | Recipes\". Set metadataBase to your site URL once, so relative image URLs in openGraph become absolute, which social networks require.\n\nWhen metadata depends on data, export async function generateMetadata({ params }) instead. It runs on the server, can fetch the same data as the page (fetch calls are deduplicated, and you can wrap database calls in React's cache), and returns the same shape. Only server components can export metadata.",
        bullets: ["Root layout: metadataBase, title template, defaults", "Pages: title, description, openGraph, alternates.canonical", "Dynamic pages: generateMetadata({ params })", "robots: { index: false } for private pages"],
      },
      {
        heading: "File-based metadata",
        body: "Some metadata is easier as files in the app directory. favicon.ico, icon.png and apple-icon.png become the right link tags automatically. opengraph-image.png (or .jpg) in a segment becomes that route's share image. For per-page images, opengraph-image.tsx can generate one with ImageResponse from next/og, drawing the post title on a template at request or build time.\n\nsitemap.ts returns a list of URLs with lastModified dates, and robots.ts returns rules plus the sitemap URL; Next.js serves them at /sitemap.xml and /robots.txt. Generating the sitemap from the same data as your pages means new pages are listed automatically.",
        visual: {
          type: "tree",
          title: "Metadata files in the app directory",
          root: "app/",
          children: [
            { label: "favicon.ico, icon.png", children: ["Browser tab icons"] },
            { label: "opengraph-image.tsx", children: ["Generated share image with next/og"] },
            { label: "sitemap.ts", children: ["Served at /sitemap.xml"] },
            { label: "robots.ts", children: ["Served at /robots.txt"] },
            { label: "blog/[slug]/opengraph-image.tsx", children: ["One image per post"] },
          ],
        },
      },
      {
        heading: "How next/image optimizes",
        body: "The Image component renders an img tag with a srcset: several sizes of the same picture. The browser picks the smallest one that fits the screen, and the Next.js image optimizer (or your host's) creates those sizes on demand and caches them. It serves WebP or AVIF when the browser supports them.\n\nIt also prevents layout shift. With width and height, it reserves the right space before the image loads. With fill, the image covers its parent, which must have position relative and a size, and you should pass sizes, such as sizes=\"(max-width: 768px) 100vw, 50vw\", so the browser does not download a full-width image for a half-width slot. Images are lazy loaded by default. Mark the main above-the-fold image with priority so it loads early, which helps Largest Contentful Paint. Remote images need their hosts listed in images.remotePatterns in next.config.",
        visual: {
          type: "flow",
          title: "One Image request, end to end",
          steps: [
            { label: "Render", detail: "img with srcset and reserved space" },
            { label: "Browser picks", detail: "Smallest size for screen and sizes" },
            { label: "Optimizer", detail: "Resizes, converts to WebP or AVIF" },
            { label: "Cache", detail: "Later requests served from cache" },
          ],
        },
      },
      {
        heading: "How next/font avoids layout shift",
        body: "Fonts from next/font/google are downloaded at build time and served from your domain, so the browser makes no request to Google and no visitor data goes there. The CSS is generated with font-display: swap by default and a fallback font tuned with size-adjust, so the text takes nearly the same space before and after the real font arrives.\n\nCall the font function once at module level, for example in the root layout, and pass subsets: [\"latin\"] to keep files small. Variable fonts give every weight in one file. Use the className on an element, or the variable option, such as variable: \"--font-sans\", to expose a CSS custom property you can use in Tailwind or plain CSS. For your own font files, next/font/local takes a src path.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Plain tags vs Next.js components",
        columns: [
          { title: "Plain img and font link", points: ["One full-size file for every screen", "No reserved space unless you add it", "Font loads from a third-party server", "Text can jump when the font swaps"] },
          { title: "next/image and next/font", points: ["Resized per screen, modern formats", "Space reserved from width and height", "Font self-hosted from your domain", "Fallback metrics adjusted to limit shift"] },
        ],
      },
    ],
    examples: [
      {
        title: "Metadata for a blog post page",
        explanation: "Step 1: in the root layout, set metadataBase and a title template. Step 2: in the post page, generateMetadata awaits params and loads the post; the page can call the same getPost, deduplicated by React's cache. Step 3: return title, description, a canonical URL and Open Graph data. The browser tab shows \"How to boil pasta | Recipes\", and shares show the post's image.",
        code: {
          lang: "tsx",
          code: "// app/blog/[slug]/page.tsx\nimport type { Metadata } from \"next\";\nimport { getPost } from \"@/lib/posts\";\n\ntype Props = { params: Promise<{ slug: string }> };\n\nexport async function generateMetadata({ params }: Props): Promise<Metadata> {\n  const { slug } = await params;\n  const post = await getPost(slug);\n  return {\n    title: post.title,\n    description: post.excerpt,\n    alternates: { canonical: `/blog/${slug}` },\n    openGraph: { type: \"article\", images: [post.coverUrl] },\n  };\n}",
        },
      },
      {
        title: "A responsive hero image and a variable font",
        explanation: "Step 1: load Inter once in the root layout with a CSS variable. Step 2: the hero uses fill inside a positioned box with a fixed aspect ratio, so no layout shift. Step 3: sizes tells the browser the image is full width on phones and half width on desktops. Step 4: priority loads it early because it is the LCP element.",
        code: {
          lang: "tsx",
          code: "// app/layout.tsx: const inter = Inter({ subsets: [\"latin\"], variable: \"--font-sans\" });\n// <html className={inter.variable}> ... then use font-family: var(--font-sans)\nimport Image from \"next/image\";\n\nexport function Hero() {\n  return (\n    <div style={{ position: \"relative\", aspectRatio: \"16 / 9\" }}>\n      <Image src=\"/hero.jpg\" alt=\"A bowl of fresh pasta\" fill priority\n        sizes=\"(max-width: 768px) 100vw, 50vw\" style={{ objectFit: \"cover\" }} />\n    </div>\n  );\n}",
        },
      },
    ],
    cheatSheet: [
      "export const metadata = { title, description } in a server layout or page",
      "Root layout: title: { template: \"%s | Site\", default: \"Site\" } and metadataBase",
      "generateMetadata({ params }) for data-driven titles and descriptions",
      "app/sitemap.ts and app/robots.ts serve /sitemap.xml and /robots.txt",
      "Image needs width and height, or fill inside a positioned parent plus sizes",
      "Only the main above-the-fold image gets priority; the rest lazy load",
      "List remote image hosts in images.remotePatterns in next.config",
      "next/font self-hosts fonts at build time; use variable: \"--font-x\" for CSS",
    ],
    quiz: [
      {
        q: "The root layout has title: { template: \"%s | Shop\", default: \"Shop\" }. A page sets title: \"Cart\". What is shown?",
        options: ["Shop", "Cart", "Cart | Shop", "Shop | Cart"],
        answer: 2,
        why: "The template wraps the page title in place of %s.",
      },
      {
        q: "You use Image with fill. What else is needed to avoid problems?",
        options: ["A parent with position relative and a size, plus a sizes prop", "width and height props too", "The priority prop", "A remote URL"],
        answer: 0,
        why: "fill covers its parent, so the parent needs a size, and sizes keeps downloads right-sized.",
      },
      {
        q: "Why does next/font reduce layout shift?",
        options: ["It blocks rendering until the font loads", "It disables custom fonts on mobile", "It inlines fonts as images", "It tunes the fallback font's metrics to match the real font"],
        answer: 3,
        why: "With adjusted fallback metrics, text keeps nearly the same size when the real font swaps in.",
      },
      {
        q: "Where can generateMetadata be exported from?",
        options: ["Any client component", "A server layout.tsx or page.tsx", "Only the root layout", "next.config.ts"],
        answer: 1,
        why: "Metadata exports are only supported in server layouts and pages.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add metadata to app/about/page.tsx with the title About us and a short description.",
        hint: "Export a typed metadata object.",
        solution: "import type { Metadata } from \"next\";\n\nexport const metadata: Metadata = {\n  title: \"About us\",\n  description: \"Who we are and why we build this app.\",\n};\n\nexport default function About() {\n  return <h1>About us</h1>;\n}",
      },
      {
        level: "medium",
        task: "Write app/sitemap.ts that lists the home page and every blog post from getAllPosts(), each with lastModified.",
        hint: "Return MetadataRoute.Sitemap, an array of { url, lastModified }.",
        solution: "import type { MetadataRoute } from \"next\";\nimport { getAllPosts } from \"@/lib/posts\";\n\nexport default async function sitemap(): Promise<MetadataRoute.Sitemap> {\n  const base = \"https://example.com\";\n  const posts = await getAllPosts();\n  return [\n    { url: base, lastModified: new Date() },\n    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt })),\n  ];\n}",
      },
      {
        level: "hard",
        task: "Create app/blog/[slug]/opengraph-image.tsx that generates a 1200x630 image with the post title on a dark background.",
        hint: "Use ImageResponse from next/og and export size and contentType.",
        solution: "import { ImageResponse } from \"next/og\";\nimport { getPost } from \"@/lib/posts\";\nexport const size = { width: 1200, height: 630 };\nexport const contentType = \"image/png\";\n\nexport default async function Image({ params }: { params: Promise<{ slug: string }> }) {\n  const post = await getPost((await params).slug);\n  return new ImageResponse(\n    (<div style={{ width: \"100%\", height: \"100%\", display: \"flex\", alignItems: \"center\", padding: 80, background: \"#111\", color: \"#fff\", fontSize: 64 }}>{post.title}</div>),\n    size,\n  );\n}",
      },
    ],
    faq: [
      { q: "Why is my Next.js image blurry or too large?", a: "Usually the sizes prop is missing or wrong with fill, so the browser picks the wrong file. Set sizes to match how wide the image really appears at each breakpoint." },
      { q: "Do I need a favicon in the public folder?", a: "No. Put favicon.ico or icon.png in the app directory and Next.js adds the right tags for you." },
      { q: "Does next/font send requests to Google Fonts?", a: "No. Google fonts are downloaded at build time and served from your own domain." },
    ],
  },

  "nextjs/next-auth-db": {
    plain: [
      "Many apps need accounts: each user signs in and sees only their own data, like their habits or recipes. Two parts make this work. Authentication proves who someone is. Authorization decides what that person is allowed to see and change.",
      "Do not build sign-in from scratch. Passwords, sessions and security are easy to get wrong. Use a maintained auth library or service. Many apps offer Sign in with GitHub or Google, so the user never creates another password.",
      "After sign-in, the server gives the browser a session cookie. On every request, your server reads that cookie to know who is calling. This is the only trustworthy source of the user's id.",
      "The data lives in a hosted database, often PostgreSQL from a provider like Neon or Supabase. Every row that belongs to someone stores their userId, and every query filters by it, so people can never see each other's data.",
    ],
    deepDive: [
      {
        heading: "Choosing an auth approach",
        body: "There are two broad options. Hosted services, such as Clerk or Supabase Auth, give you sign-in pages, user management and security features, and you pay as you grow. Libraries you run in your app, such as Auth.js or Better Auth, store users in your own database and are free, but you configure more yourself.\n\nWhatever you choose, check four things: it supports the App Router and server components, it can read the session on the server in actions and route handlers, it supports the providers you need (OAuth with GitHub or Google, email magic links, passkeys), and it is actively maintained. OAuth means the user signs in on the provider's site, and the provider sends your app a verified identity, so you never handle their password.",
        bullets: ["Hosted: Clerk, Supabase Auth and others", "Self-run libraries: Auth.js, Better Auth", "OAuth providers: GitHub, Google", "Check server-side session access in actions"],
      },
      {
        heading: "Sessions and cookies",
        body: "After sign-in the app must remember the user. There are two common designs. A database session stores a random session id in a cookie and the details in a sessions table, so you can sign a user out everywhere by deleting rows. A JWT session stores signed (and often encrypted) user data in the cookie itself, so no database lookup is needed, but revoking it before it expires is harder.\n\nEither way, the cookie should be HttpOnly so JavaScript cannot read it, Secure so it only travels over HTTPS, and SameSite=Lax, which blocks most cross-site request forgery. Keep the signing secret, such as AUTH_SECRET, in environment variables and rotate it if it leaks. Expire sessions after a sensible time, and renew them while the user is active.",
        visual: {
          type: "compare",
          title: "Database session vs JWT session",
          columns: [
            { title: "Database session", points: ["Cookie holds a random id", "Lookup on each request", "Easy to revoke instantly", "Needs a sessions table"] },
            { title: "JWT session", points: ["Cookie holds signed user data", "No lookup needed", "Hard to revoke before expiry", "Keep the payload small"] },
          ],
        },
      },
      {
        heading: "Connecting a hosted database",
        body: "Create a Postgres database at a host, copy its connection string into DATABASE_URL in .env.local for development and into your hosting provider's environment settings for production. Never prefix it with NEXT_PUBLIC_, which would ship it to browsers.\n\nServerless platforms start many short-lived function instances, and each opening its own database connection can exhaust the database's connection limit. Use the provider's pooled connection string (a connection pooler such as PgBouncer sits in front of Postgres) or a serverless driver that talks over HTTP or WebSockets, such as Neon's. An ORM or query builder like Drizzle or Prisma gives you typed queries and migrations; run migrations as a deploy step, not when the app starts.",
      },
      {
        heading: "Authorization on every path",
        body: "Hiding a Delete button does not protect anything. Every server component that reads private data, every server action and every route handler must check the session itself. The cleanest way is a small data access layer: server-only functions like getHabitsForCurrentUser() and deleteHabit(id) that read the session, return nothing or throw when it is missing, and always include userId in the query.\n\nWatch for IDOR (insecure direct object reference): an action deleteHabit(id) that deletes by id alone lets anyone delete any habit by guessing ids. Always filter by both: where id = $1 and user_id = $2. If nothing matches, treat it as not found. Pages can redirect signed-out users with redirect(\"/login\") from next/navigation.",
        visual: {
          type: "layers",
          title: "Where checks live in a Next.js app",
          layers: [
            { label: "Proxy", detail: "Optional fast redirect when no session cookie" },
            { label: "Pages, actions, route handlers", detail: "Call the data access layer only" },
            { label: "Data access layer", detail: "Verify session, check ownership" },
            { label: "Database", detail: "Every query filtered by user_id" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Loading /habits for a signed-in user",
        actors: ["Browser", "Server component", "Data access layer", "Database"],
        messages: [
          { from: 0, to: 1, label: "GET /habits with session cookie" },
          { from: 1, to: 2, label: "getMyHabits()" },
          { from: 2, to: 2, label: "verify session: user 12" },
          { from: 2, to: 3, label: "SELECT ... WHERE user_id = 12" },
          { from: 3, to: 2, label: "only user 12's rows" },
          { from: 1, to: 0, label: "HTML with their habits" },
        ],
      },
    ],
    examples: [
      {
        title: "GitHub sign-in with Auth.js v5",
        explanation: "Step 1: create a GitHub OAuth app with the callback URL /api/auth/callback/github. Step 2: set AUTH_SECRET, AUTH_GITHUB_ID and AUTH_GITHUB_SECRET as environment variables. Step 3: configure NextAuth once in auth.ts, which exports handlers, auth, signIn and signOut. Step 4: mount the handlers in a catch-all route. Step 5: any server component or action can now call await auth() to get the session.",
        code: {
          lang: "ts",
          code: "// auth.ts\nimport NextAuth from \"next-auth\";\nimport GitHub from \"next-auth/providers/github\";\n\nexport const { handlers, auth, signIn, signOut } = NextAuth({\n  providers: [GitHub],\n});\n\n// app/api/auth/[...nextauth]/route.ts\nimport { handlers } from \"@/auth\";\nexport const { GET, POST } = handlers;\n\n// in a server component or action:\n// const session = await auth();\n// if (!session?.user) redirect(\"/login\");",
        },
      },
      {
        title: "A per-user habits table with Drizzle",
        explanation: "Step 1: define the table with a user_id column and an index on it. Step 2: create the db client from DATABASE_URL using the Neon HTTP driver, which suits serverless. Step 3: every query filters by the current user's id. Step 4: delete uses both id and userId, so guessing another habit's id does nothing.",
        code: {
          lang: "ts",
          code: "import { pgTable, serial, text, timestamp, index } from \"drizzle-orm/pg-core\";\nimport { drizzle } from \"drizzle-orm/neon-http\";\nimport { and, eq } from \"drizzle-orm\";\n\nexport const habits = pgTable(\"habits\", {\n  id: serial(\"id\").primaryKey(),\n  userId: text(\"user_id\").notNull(),\n  name: text(\"name\").notNull(),\n  createdAt: timestamp(\"created_at\").defaultNow().notNull(),\n}, (t) => [index(\"habits_user_idx\").on(t.userId)]);\n\nexport const db = drizzle(process.env.DATABASE_URL!);\n\nexport const listHabits = (userId: string) => db.select().from(habits).where(eq(habits.userId, userId));\nexport const removeHabit = (id: number, userId: string) =>\n  db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)));",
        },
      },
    ],
    cheatSheet: [
      "Authentication: who you are. Authorization: what you may do",
      "Use a maintained auth library or service; never hand-roll password storage",
      "Session cookies: HttpOnly, Secure, SameSite=Lax",
      "Always take userId from the server session, never from the request",
      "Filter every read and write by user_id to prevent IDOR bugs",
      "Database URLs are server-only: never prefix them with NEXT_PUBLIC_",
      "On serverless, use a pooled connection string or an HTTP/WebSocket driver",
      "Put session checks in a server-only data access layer that everything calls",
    ],
    quiz: [
      {
        q: "deleteHabit(id) runs DELETE FROM habits WHERE id = $1 after checking the user is signed in. What is wrong?",
        options: ["Nothing, the user is signed in", "It should use a GET request", "Any signed-in user can delete anyone's habit by id", "DELETE needs a transaction"],
        answer: 2,
        why: "Being signed in is not ownership; filter by user_id as well.",
      },
      {
        q: "Which cookie flag stops JavaScript in the page from reading the session cookie?",
        options: ["HttpOnly", "Secure", "SameSite", "Max-Age"],
        answer: 0,
        why: "HttpOnly hides the cookie from document.cookie, which limits damage from XSS.",
      },
      {
        q: "Your serverless app hits too many connections errors on Postgres under load. What is the usual fix?",
        options: ["Make the database bigger only", "Open a new connection per query", "Store data in cookies instead", "Use a pooled connection string or a serverless HTTP driver"],
        answer: 3,
        why: "Many short-lived instances each open connections; a pooler or HTTP driver shares or avoids them.",
      },
      {
        q: "What is a downside of JWT sessions compared with database sessions?",
        options: ["They need a database lookup on every request", "They are hard to revoke before they expire", "They cannot hold a user id", "They do not work over HTTPS"],
        answer: 1,
        why: "The token is valid on its own until expiry, so instant sign-out everywhere needs extra work.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Protect the /habits page so signed-out visitors are sent to /login.",
        hint: "Call your auth helper in the server page and use redirect from next/navigation.",
        solution: "import { redirect } from \"next/navigation\";\nimport { auth } from \"@/auth\";\n\nexport default async function HabitsPage() {\n  const session = await auth();\n  if (!session?.user) redirect(\"/login\");\n  return <h1>Your habits, {session.user.name}</h1>;\n}",
      },
      {
        level: "medium",
        task: "Write a server-only data access function getMyHabits() that returns the current user's habits, or throws if nobody is signed in.",
        hint: "Combine import \"server-only\", the session, and a query filtered by user id.",
        solution: "import \"server-only\";\nimport { auth } from \"@/auth\";\nimport { listHabits } from \"@/db/habits\";\n\nexport async function getMyHabits() {\n  const session = await auth();\n  const userId = session?.user?.id;\n  if (!userId) throw new Error(\"Not signed in\");\n  return listHabits(userId);\n}",
      },
      {
        level: "hard",
        task: "Write a server action renameHabit(formData) that validates id (number) and name (1 to 50 chars) with Zod, updates only the current user's habit, returns an error if nothing matched, and revalidates /habits.",
        hint: "Use z.coerce.number() for id, and check how many rows the update returned.",
        solution: "\"use server\";\nconst Input = z.object({ id: z.coerce.number().int(), name: z.string().trim().min(1).max(50) });\nexport async function renameHabit(formData: FormData) {\n  const session = await auth();\n  if (!session?.user?.id) return { error: \"Sign in first\" };\n  const parsed = Input.safeParse(Object.fromEntries(formData));\n  if (!parsed.success) return { error: \"Invalid input\" };\n  const rows = await db.update(habits).set({ name: parsed.data.name })\n    .where(and(eq(habits.id, parsed.data.id), eq(habits.userId, session.user.id))).returning();\n  if (rows.length === 0) return { error: \"Habit not found\" };\n  revalidatePath(\"/habits\");\n  return { ok: true };\n}",
      },
    ],
    faq: [
      { q: "Which auth library should I use with Next.js?", a: "Pick a maintained option that supports the App Router and server-side session access, such as Auth.js, Better Auth, Clerk or Supabase Auth. Hosted services save setup time; self-run libraries keep users in your own database." },
      { q: "Is it safe to check auth only in middleware or proxy?", a: "No. Use it for fast redirects, but check the session again in every page, server action and route handler that touches private data." },
      { q: "Where should I store the database password?", a: "In server-only environment variables: .env.local for development (not committed) and your host's settings for production." },
    ],
  },
};

export default extra;
