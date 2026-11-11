import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "fe-capstone/fe-capstone-design": {
    plain: [
      "Before you write code for a real app, spend a few hours designing it on paper. You decide what pages exist, what each one shows, what data you store and how the screens are split into components. Changing a sketch takes seconds; changing finished code takes days.",
      "A wireframe is a rough drawing of a page: boxes for images, lines for text, rectangles for buttons. No colours, no fonts. It answers one question: what is on this page and where? Draw each page on a phone screen first, because small screens force clear choices.",
      "Next you write a route map, a list of every URL in your app, and a data model, the shapes of the records you will save, written as TypeScript types. These two lists tell you which pages need which data.",
      "Finally you plan the component tree: which pieces each page is made of, which ones only display data, and which ones react to clicks and typing. With this map, building becomes filling in boxes you already understand.",
    ],
    deepDive: [
      {
        heading: "Wireframes that include every state",
        body: "Most beginner apps look great with perfect demo data and break on everything else. For each page, sketch at least five states. Empty: a new user with no habits needs a friendly message and an obvious first action. Loading: what shows while data arrives, ideally a skeleton the same size as the real content so nothing jumps. Error: a clear message and a way to retry. Success: the normal view. Edge: a very long habit name, 200 items, or a slow phone screen.\n\nKeep wireframes low-fidelity, on paper or in a tool like Excalidraw or Figma, so you focus on structure, not colours. Mark what is interactive (buttons, forms, toggles) and where users go next. Sketch the mobile layout first, then note what changes on wide screens, such as a sidebar that becomes a top menu. Each sketch then becomes a checklist for the build and for your tests.",
        bullets: ["Empty, loading, error, success, edge cases", "Mobile first, then wide screens", "Mark every action and where it leads"],
      },
      {
        heading: "From route map to App Router folders",
        body: "Write each URL with what it shows and who may see it: / (public landing), /login (public), /habits (signed in: list and add form), /habits/[id] (signed in, owner only: stats and calendar). Each line maps to a folder with a page.tsx. Square brackets make a dynamic segment; in current Next.js the page receives params as a promise, so you write const { id } = await params.\n\nPlan the special files too. layout.tsx wraps a segment and its children and keeps its state while you navigate inside it. loading.tsx shows instantly while the page's data loads. error.tsx catches errors in that segment and must be a client component. not-found.tsx handles notFound() calls, such as an unknown habit id. Route groups, folders in parentheses like (marketing) and (app), organise routes and give them different layouts without appearing in the URL. Putting all signed-in pages under (app) gives them one shared layout with the navigation.",
        visual: {
          type: "layers",
          title: "What wraps /habits/[id] (outer to inner)",
          layers: [
            { label: "app/layout.tsx", detail: "html, body, fonts, global styles" },
            { label: "app/(app)/layout.tsx", detail: "Navigation for signed-in pages" },
            { label: "app/(app)/habits/[id]/loading.tsx", detail: "Skeleton while data loads" },
            { label: "app/(app)/habits/[id]/error.tsx", detail: "Client boundary for errors" },
            { label: "app/(app)/habits/[id]/page.tsx", detail: "Fetches the habit, renders stats" },
          ],
        },
      },
      {
        heading: "A data model that the database can enforce",
        body: "List the entities (User, Habit, CheckIn), their fields and how they relate: a user has many habits, a habit has many check-ins. Every user-owned row needs a userId, because every query will filter by it. Give rows a stable id (a UUID is common) and a createdAt timestamp.\n\nThen ask what must always be true, and let the database enforce it: a habit name is not null, a check-in references an existing habit (a foreign key, with cascade delete so removing a habit removes its check-ins), and there is at most one check-in per habit per day (a unique constraint on habitId plus day). Decide how to store dates: a check-in belongs to the user's calendar day, so store the day as YYYY-MM-DD in the user's time zone, not a UTC timestamp that can fall on the wrong day. Finally, generate TypeScript types from the schema with your ORM, and describe form input separately with Zod.",
      },
      {
        heading: "Planning the component tree and the client boundary",
        body: "In the App Router every component is a Server Component unless its file starts with \"use client\". Server Components can fetch data directly and send no JavaScript for themselves to the browser. Client Components are needed for state, effects, event handlers and browser APIs. So, for each box in your wireframe, ask: does it respond to clicks or typing? If not, it stays on the server.\n\nPush the client boundary down to the leaves. The habits page (server) fetches the list and renders HabitList (server), which renders a small CheckInButton (client) for each row. Everything imported by a client file also becomes client code, so keep client files small. Props passed from server to client must be serialisable: strings, numbers, plain objects, arrays and dates, but not ordinary functions (server actions are the exception). Mutations go through server actions, so client components call an action instead of fetching an API you have to build yourself.",
        visual: {
          type: "tree",
          title: "Component tree for /habits",
          root: "HabitsPage (server, fetches data)",
          children: [
            { label: "PageHeader (server)", children: ["Title and count"] },
            { label: "AddHabitForm (client)", children: ["useActionState", "Calls createHabit action"] },
            { label: "HabitList (server)", children: ["HabitRow (server)", "CheckInButton (client)"] },
            { label: "EmptyState (server)", children: ["Shown when the list is empty"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Server or client component?",
        columns: [
          { title: "Server Component (default)", points: ["Fetches data directly, can use secrets", "No JavaScript of its own shipped", "No useState, useEffect or onClick", "Pages, lists, layouts, static text"] },
          { title: "Client Component (\"use client\")", points: ["State, effects and event handlers", "Browser APIs like localStorage", "Shipped and hydrated in the browser", "Forms, toggles, menus, charts"] },
        ],
      },
    ],
    examples: [
      {
        title: "A route map turned into folders",
        explanation: "Step 1: list each URL with its access rule. Step 2: put public pages in a (marketing) group and signed-in pages in an (app) group, each with its own layout. Step 3: add loading and error files where data is fetched. Step 4: the folder tree now mirrors the route map exactly, so anyone can find the code for a URL.",
        code: {
          lang: "text",
          code: "URL              Access        Shows\n/                public        landing, sign-up button\n/login           public        sign-in form\n/habits          signed in     list, add form, empty state\n/habits/[id]     owner only    stats, check-in calendar\n\napp/\n  layout.tsx\n  (marketing)/page.tsx          -> /\n  (marketing)/login/page.tsx    -> /login\n  (app)/layout.tsx              nav, session check\n  (app)/habits/page.tsx         -> /habits\n  (app)/habits/loading.tsx\n  (app)/habits/[id]/page.tsx    -> /habits/123\n  (app)/habits/[id]/not-found.tsx",
        },
      },
      {
        title: "The data model as a database schema with constraints",
        explanation: "This sketch uses Drizzle ORM with Postgres; Prisma works the same way with a different syntax. Step 1: every habit has a userId. Step 2: check-ins reference habits with cascade delete. Step 3: a unique constraint allows only one check-in per habit per day. Step 4: $inferSelect turns the table into a TypeScript type, so the types and the database never drift apart.",
        code: {
          lang: "ts",
          code: "import { date, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';\n\nexport const habits = pgTable('habits', {\n  id: uuid('id').primaryKey().defaultRandom(),\n  userId: text('user_id').notNull(),\n  name: text('name').notNull(),\n  createdAt: timestamp('created_at').defaultNow().notNull(),\n});\nexport const checkIns = pgTable('check_ins', {\n  id: uuid('id').primaryKey().defaultRandom(),\n  habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),\n  day: date('day').notNull(), // 'YYYY-MM-DD' in the user's time zone\n}, (t) => [unique().on(t.habitId, t.day)]);\nexport type Habit = typeof habits.$inferSelect;",
        },
      },
    ],
    cheatSheet: [
      "Sketch empty, loading, error, success and edge states for every page",
      "One line per URL: path, who may see it, what it shows",
      "[id] folders are dynamic segments; await params in the page",
      "(group) folders share a layout without changing the URL",
      "error.tsx must be a client component; loading.tsx shows during data loads",
      "Every user-owned table has a userId; every query filters by it",
      "Let the database enforce rules: not null, foreign keys, unique constraints",
      "Server Components by default; \"use client\" only on interactive leaves",
    ],
    quiz: [
      {
        q: "What does the folder app/(app)/habits/page.tsx map to?",
        options: ["/app/habits", "/(app)/habits", "/habits", "/habits/app"],
        answer: 2,
        why: "Folders in parentheses are route groups and are left out of the URL.",
      },
      {
        q: "Which component should usually be a Client Component?",
        options: ["A form with live validation and a pending state", "A page that fetches habits from the database", "A layout with static navigation links", "A footer with copyright text"],
        answer: 0,
        why: "State and event handlers need the client; data fetching and static markup can stay on the server.",
      },
      {
        q: "How do you guarantee only one check-in per habit per day, even with double clicks?",
        options: ["Disable the button for one second", "Check in the client before inserting", "Store check-ins in localStorage", "A unique constraint on habitId and day in the database"],
        answer: 3,
        why: "Only the database can enforce the rule against concurrent requests.",
      },
      {
        q: "Why sketch an empty state for the habits page?",
        options: ["Next.js requires it", "New users see it first, so it must guide them to the first action", "It improves Lighthouse scores", "It replaces the loading state"],
        answer: 1,
        why: "Every new user starts with no data; a good empty state is their onboarding.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a route map for a recipe manager: public browsing, a signed-in area to add and edit your own recipes, and a recipe detail page.",
        hint: "For each URL give access and what it shows; include a dynamic segment.",
        solution: "/                    public      featured recipes, search\n/recipes/[slug]      public      one recipe: ingredients, steps\n/login               public      sign-in form\n/my/recipes          signed in   my recipes, empty state, New button\n/my/recipes/new      signed in   create form\n/my/recipes/[id]/edit owner only edit form, delete button",
      },
      {
        level: "medium",
        task: "Write TypeScript types for Recipe and Ingredient, and a Zod schema for the create-recipe form input.",
        hint: "Separate what the database stores (ids, timestamps, owner) from what the form sends.",
        solution: "import { z } from 'zod';\n\nexport type Ingredient = { name: string; quantity: string };\nexport type Recipe = { id: string; userId: string; slug: string; title: string;\n  ingredients: Ingredient[]; steps: string[]; createdAt: Date };\n\nexport const RecipeInput = z.object({\n  title: z.string().trim().min(3).max(80),\n  ingredients: z.array(z.object({ name: z.string().min(1), quantity: z.string() })).min(1),\n  steps: z.array(z.string().min(1)).min(1),\n});\nexport type RecipeInput = z.infer<typeof RecipeInput>;",
      },
      {
        level: "hard",
        task: "For the recipe detail page, list its components, mark each server or client, and justify the choice.",
        hint: "Only things that react to the user need the client.",
        solution: "RecipePage (server): awaits params, fetches the recipe, calls notFound() if missing\nRecipeHeader (server): title, author, image; static output\nIngredientList (server): plain list; no interaction\nServingsScaler (client): useState to scale quantities as the user changes servings\nFavoriteButton (client): onClick calls a toggleFavorite server action, shows pending state\nStepList (server): numbered steps\nOnly the two interactive leaves ship JavaScript; the rest renders on the server.",
      },
    ],
    faq: [
      { q: "Do I need Figma to design a web app?", a: "No. Paper, a whiteboard or a free tool like Excalidraw is enough for wireframes. Figma helps when you want detailed visual designs or need to share designs with a team." },
      { q: "How do I decide between Server and Client Components?", a: "Start with Server Components everywhere. Add \"use client\" only to components that need state, effects, event handlers or browser APIs, and keep those components as small as possible." },
      { q: "Prisma or Drizzle for a Next.js project?", a: "Both are popular TypeScript ORMs with migrations and generated types. Drizzle stays close to SQL and is lightweight; Prisma has its own schema language and a very polished tooling experience. Either is a fine choice for a capstone." },
      { q: "How big should a capstone app be?", a: "Small enough to finish, test and deploy: about three to five pages and one or two core features done well. A polished small app impresses more than a large unfinished one." },
    ],
  },

  "fe-capstone/fe-capstone-build": {
    plain: [
      "This is where everything you learned comes together in one real app that people can open on their phones. It has pages, sign-in, a database, forms that save data, tests and a live URL. It is a big job, so you build it one small, complete feature at a time.",
      "Start by creating the project and deploying it right away, even when it only says Hello. From then on, every change you merge goes live automatically. Deployment problems show up on day one, when they are small, instead of on the last day.",
      "Then add features as vertical slices. For add a habit, you build the form, the server code that saves it, the database table and the list that shows it, and you finish all of that before starting the next feature. After each slice you have a working app that does a little more.",
      "Near the end you add tests for the most important flows, check performance with Lighthouse, and write a README with a live link and screenshots. That README is what employers read first.",
    ],
    deepDive: [
      {
        heading: "Scaffolding and project structure",
        body: "Run npx create-next-app@latest and accept TypeScript, ESLint, Tailwind CSS, the App Router and the src directory, or pass the matching flags. Keep TypeScript strict. A structure that scales: src/app for routes, src/components for shared UI, src/lib for helpers, src/db for the schema and client, and an actions.ts file next to the routes that use it. The @/ import alias, set up by create-next-app, keeps imports short.\n\nBefore building features, push to GitHub, import the repository into Vercel and confirm the production URL works. Add environment variables for each environment, plus a CI workflow running lint, type check and tests on pull requests. Then work on branches with small pull requests, even alone: each one gets a preview URL and a green or red check, and your Git history tells the story of the project.",
        bullets: ["npx create-next-app@latest habit-tracker", "Deploy on day one; keep main always deployable", "One pull request per vertical slice"],
      },
      {
        heading: "Database persistence done safely",
        body: "Use a hosted Postgres database (Neon, Supabase and others have free tiers, some available through the Vercel Marketplace) with separate databases or branches for development, preview and production. Define tables in your ORM's schema, generate migration files from it (drizzle-kit generate, or prisma migrate dev), commit them, and apply them to production as a deliberate step, not by hand in a SQL console.\n\nDatabase code must run only on the server: in Server Components, server actions and route handlers. Add import \"server-only\" at the top of your db module, so the build fails if a client component ever imports it. Create one database client and reuse it, because each serverless function instance opening many connections can exhaust the database's limit; providers offer pooled connection strings or serverless drivers for this. A seed script that inserts demo data makes local development and E2E tests repeatable.",
        visual: {
          type: "flow",
          title: "A schema change from laptop to production",
          steps: [
            { label: "Edit schema.ts", detail: "Add a column or table" },
            { label: "Generate migration", detail: "A SQL file you can read" },
            { label: "Apply locally", detail: "Run the app and tests" },
            { label: "Pull request", detail: "Migration reviewed with the code" },
            { label: "Apply to production", detail: "Before or with the deploy" },
          ],
        },
      },
      {
        heading: "Authentication and authorisation",
        body: "Use a proven auth library or service rather than writing password storage yourself: Auth.js, Better Auth and Clerk are common choices for Next.js. They handle sign-in providers, secure httpOnly session cookies and CSRF protection. Your job is to check the session in the right places.\n\nAuthentication asks who you are; authorisation asks what you may do. A check in a layout improves the experience, but it is not enough for security: layouts do not re-run on every navigation, and server actions and route handlers can be called directly. So read the session again in every page that loads private data and in every server action. Then authorise each query by filtering on the owner: where id = habitId and userId = session user id. Forgetting this lets any signed-in user read or delete another user's data just by changing an id in the URL, a bug called an insecure direct object reference.",
        bullets: ["Check the session in each page and each server action", "Every query: where userId = the session's user id", "Return notFound() for other users' ids, not their data"],
      },
      {
        heading: "Mutations with server actions",
        body: "A server action is an async function marked with \"use server\". Pass it to a form's action prop and React submits the form data to it with a POST request, even before JavaScript has loaded. Inside, you authenticate, validate with Zod's safeParse, write to the database, then call revalidatePath(\"/habits\") so the next render shows fresh data, or redirect() to another page.\n\nTo show errors and a pending state, wrap the action with React's useActionState in a client component. It returns the latest state the action returned (for example { error: \"Name is required\" }), a form action to pass to the form, and an isPending flag. Treat every server action as a public API endpoint: anyone can call it with any input, so never trust ids or values coming from the client without checking them. For instant feedback on small toggles, useOptimistic can show the new state before the server confirms.",
        visual: {
          type: "sequence",
          title: "Submitting the add habit form",
          actors: ["Browser form", "Server action", "Database", "Page"],
          messages: [
            { from: 0, to: 1, label: "POST form data (name)" },
            { from: 1, to: 1, label: "Check session, safeParse with Zod" },
            { from: 1, to: 2, label: "INSERT habit with userId" },
            { from: 1, to: 3, label: "revalidatePath('/habits')" },
            { from: 3, to: 2, label: "SELECT habits for this user" },
            { from: 1, to: 0, label: "New state and updated page" },
          ],
        },
      },
      {
        heading: "Tests, performance and a strong finish",
        body: "Test where bugs would hurt. Unit test Zod schemas and pure helpers such as streak calculations with Vitest. Component test the interactive client pieces, like the add form's error message, with Testing Library. Write two or three Playwright tests for the critical flows: sign in, add a habit, check in, against a seeded test database. Run them all in CI before merging.\n\nFor Lighthouse, test the deployed production URL on mobile. The usual wins: next/image for every image with sizes set, next/font instead of a font stylesheet, keeping client components small so less JavaScript ships, and loading.tsx skeletons with fixed sizes to avoid layout shift. @next/bundle-analyzer shows which packages bloat your client bundle. Fix accessibility issues Lighthouse reports too: labels, contrast and button names. Finally, write the README: live URL, screenshots, features, tech stack, how to run it locally with env vars, and how to run the tests.",
        bullets: ["Vitest: schemas and logic; RTL: client forms; Playwright: 2 or 3 key flows", "Lighthouse on the production URL, mobile setting", "README: live link, screenshots, setup, tests"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Suggested build order for a habit tracker",
        steps: [
          { label: "Scaffold and deploy", detail: "Hello page live, CI green" },
          { label: "Auth", detail: "Sign in, sign out, protected area" },
          { label: "Add and list habits", detail: "First slice: form, action, table" },
          { label: "Check-ins and stats", detail: "Second slice with constraints" },
          { label: "Tests and polish", detail: "E2E flows, empty and error states" },
          { label: "Performance and README", detail: "Lighthouse on mobile, screenshots" },
        ],
      },
    ],
    examples: [
      {
        title: "A server action that authenticates, validates and saves",
        explanation: "Step 1: \"use server\" makes every export a server action. Step 2: read the session; return an error state if it is missing. Step 3: validate the form data with Zod and return a friendly message on failure. Step 4: insert with the session's userId, never one from the form. Step 5: revalidatePath refreshes the list. The auth and db imports stand for your own auth library helper and database client.",
        code: {
          lang: "ts",
          code: "'use server';\nimport { z } from 'zod';\nimport { revalidatePath } from 'next/cache';\nimport { auth } from '@/auth';\nimport { db } from '@/db';\nimport { habits } from '@/db/schema';\nexport async function createHabit(_prev: { error?: string }, formData: FormData) {\n  const session = await auth();\n  if (!session?.user?.id) return { error: 'Please sign in again.' };\n  const parsed = z.object({ name: z.string().trim().min(1).max(60) }).safeParse({ name: formData.get('name') });\n  if (!parsed.success) return { error: 'Name must be 1 to 60 characters.' };\n  await db.insert(habits).values({ userId: session.user.id, name: parsed.data.name });\n  revalidatePath('/habits');\n  return {};\n}",
        },
      },
      {
        title: "The form that calls it, with errors and a pending state",
        explanation: "Step 1: the form is a small client component, so the page around it stays on the server. Step 2: useActionState wraps createHabit and starts with an empty state. Step 3: the form's action is the wrapped version, and the button is disabled while pending. Step 4: an error from the action appears in an element with role alert, so screen readers announce it and tests can find it.",
        code: {
          lang: "tsx",
          code: "'use client';\nimport { useActionState } from 'react';\nimport { createHabit } from './actions';\n\nexport function AddHabitForm() {\n  const [state, formAction, pending] = useActionState(createHabit, {});\n  return (\n    <form action={formAction}>\n      <label htmlFor=\"name\">Habit name</label>\n      <input id=\"name\" name=\"name\" required maxLength={60} />\n      <button disabled={pending}>{pending ? 'Adding...' : 'Add habit'}</button>\n      {state.error && <p role=\"alert\">{state.error}</p>}\n    </form>\n  );\n}",
        },
      },
    ],
    cheatSheet: [
      "npx create-next-app@latest, push to GitHub, import into Vercel on day one",
      "Build vertical slices: form, action, table and list for one feature at a time",
      "import \"server-only\" in database modules to keep them off the client",
      "Generate and commit migrations; never edit the production schema by hand",
      "Check the session in every private page and every server action",
      "Filter every query by the session's userId, never by an id from the client",
      "useActionState(action, initial) gives [state, formAction, isPending]",
      "revalidatePath(\"/habits\") after a mutation refreshes that page's data",
    ],
    quiz: [
      {
        q: "Why is an auth check in the (app) layout alone not enough?",
        options: ["Layouts cannot read cookies", "Layouts do not re-run on every navigation, and actions can be called directly", "Layouts are client components", "Next.js ignores redirects in layouts"],
        answer: 1,
        why: "Each page that loads private data and each server action must check the session itself.",
      },
      {
        q: "A user changes /habits/42 to /habits/43 in the URL and sees someone else's habit. What is missing?",
        options: ["A loading.tsx file", "HTTPS", "Filtering the query by the signed-in user's id", "A unique constraint"],
        answer: 2,
        why: "Authorisation means every query is limited to rows the current user owns.",
      },
      {
        q: "What should a server action do after inserting a habit so the list shows it?",
        options: ["Call revalidatePath(\"/habits\")", "Reload the browser with location.reload()", "Return the full HTML of the page", "Nothing; data is never cached"],
        answer: 0,
        why: "revalidatePath tells Next.js to render that route with fresh data.",
      },
      {
        q: "Which statement about server actions is true?",
        options: ["They only run in the browser", "Only your own forms can call them", "They need a separate API route", "They are public endpoints, so they must check auth and validate input"],
        answer: 3,
        why: "Anyone can send a POST to an action, so treat its input as untrusted.",
      },
      {
        q: "What does import \"server-only\" in src/db/index.ts protect against?",
        options: ["Slow queries", "A client component importing database code by mistake", "SQL injection", "Missing migrations"],
        answer: 1,
        why: "The build fails if a client module imports a file marked server-only, so credentials never reach the browser bundle.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make the /habits page redirect to /login when there is no session.",
        hint: "Use redirect from next/navigation inside the async page component.",
        solution: "import { redirect } from 'next/navigation';\nimport { auth } from '@/auth';\n\nexport default async function HabitsPage() {\n  const session = await auth();\n  if (!session?.user?.id) redirect('/login');\n  return <h1>Your habits</h1>;\n}",
      },
      {
        level: "medium",
        task: "Write a deleteHabit(habitId) server action that only deletes the habit if it belongs to the signed-in user.",
        hint: "Combine both conditions in the where clause with and().",
        solution: "'use server';\nimport { and, eq } from 'drizzle-orm';\nimport { revalidatePath } from 'next/cache';\nimport { auth } from '@/auth';\nimport { db } from '@/db';\nimport { habits } from '@/db/schema';\nexport async function deleteHabit(habitId: string) {\n  const session = await auth();\n  if (!session?.user?.id) throw new Error('Not signed in');\n  await db.delete(habits).where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)));\n  revalidatePath('/habits');\n}",
      },
      {
        level: "hard",
        task: "Write toggleCheckIn(habitId, day) that removes today's check-in if it exists, otherwise adds it, safely under double clicks and only for the owner.",
        hint: "Check ownership first; delete with returning(); insert with onConflictDoNothing() relying on the unique constraint.",
        solution: "'use server'; // imports as in deleteHabit, plus checkIns\nexport async function toggleCheckIn(habitId: string, day: string) {\n  const session = await auth();\n  if (!session?.user?.id) throw new Error('Not signed in');\n  const [habit] = await db.select().from(habits).where(and(eq(habits.id, habitId), eq(habits.userId, session.user.id)));\n  if (!habit) throw new Error('Not found');\n  const removed = await db.delete(checkIns)\n    .where(and(eq(checkIns.habitId, habitId), eq(checkIns.day, day))).returning();\n  if (removed.length === 0) await db.insert(checkIns).values({ habitId, day }).onConflictDoNothing();\n  revalidatePath(`/habits/${habitId}`);\n}",
      },
    ],
    faq: [
      { q: "What should a Next.js portfolio project include?", a: "A live URL, sign-in, a real database, at least one create, update and delete flow, tests in CI, good mobile Lighthouse scores and a README with screenshots. Clean commits and small pull requests are a bonus reviewers notice." },
      { q: "Should I use server actions or API routes?", a: "Use server actions for mutations from your own forms and buttons: less code and built-in progressive enhancement. Use route handlers when something outside your app calls you, such as a webhook or a mobile client." },
      { q: "Which free database works with Vercel?", a: "Hosted Postgres providers such as Neon and Supabase offer free tiers and connect easily, some through the Vercel Marketplace. Check the current limits on their pricing pages before you rely on them." },
      { q: "How long does a capstone like this take?", a: "Plan for about 15 to 25 focused hours for a small app with auth, a database, two features, tests and deployment. Keeping scope small is what makes it finishable." },
    ],
  },
};

export default extra;
