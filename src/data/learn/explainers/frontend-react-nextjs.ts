import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────────────────── HTML & CSS ─────────────────────────
  "html-css/html-semantics": {
    summary:
      "Semantic HTML uses elements that describe meaning, like nav, main and button, instead of generic divs. Browsers, search engines and screen readers rely on that meaning to understand and navigate your page.",
    analogy: "Semantic tags are like labelled folders instead of one big unlabelled pile.",
    visuals: [
      {
        type: "tree",
        title: "A typical page structure",
        root: "body",
        children: [
          { label: "header", children: ["logo", "nav"] },
          { label: "main", children: ["h1", "section", "article", "form"] },
          { label: "aside", children: ["related links"] },
          { label: "footer", children: ["contact", "copyright"] },
        ],
      },
    ],
    keyPoints: [
      "Use landmarks like header, nav, main and footer so assistive tech can jump between regions.",
      "Use one h1 per page and never skip heading levels for styling.",
      "Every input needs a label; group related inputs with fieldset and legend.",
      "Native elements like button and input type=email give keyboard and validation support for free.",
    ],
    terms: [
      { term: "Semantic element", meaning: "A tag whose name describes its meaning, such as nav or article." },
      { term: "Landmark", meaning: "A page region, like main or nav, that screen readers can jump to." },
      { term: "label", meaning: "Text tied to an input via the for attribute or by wrapping it." },
      { term: "fieldset", meaning: "Groups related form controls; legend gives the group a name." },
      { term: "Validation attribute", meaning: "Attributes like required, min or pattern that the browser enforces." },
    ],
    example: {
      lang: "html",
      code: "<main>\n  <h1>Sign up</h1>\n  <form>\n    <fieldset>\n      <legend>Your details</legend>\n      <label for=\"email\">Email</label>\n      <input id=\"email\" type=\"email\" required />\n      <label for=\"age\">Age</label>\n      <input id=\"age\" type=\"number\" min=\"13\" />\n    </fieldset>\n    <button type=\"submit\">Create account</button>\n  </form>\n</main>",
      caption: "Landmark, heading, labelled inputs and native validation.",
    },
    pitfalls: [
      "Using a clickable div instead of a button, which breaks keyboard access.",
      "Choosing heading levels for their font size instead of document outline.",
      "Using placeholder text as a replacement for a visible label.",
    ],
    check: [
      { q: "Why use button instead of a div with a click handler?", a: "A button is focusable, works with Enter and Space, and is announced as a button by screen readers." },
      { q: "How do you connect a label to an input?", a: "Give the input an id and set the label's for attribute to that id, or wrap the input in the label." },
    ],
  },

  "html-css/css-basics": {
    summary:
      "CSS applies styles through selectors, and the cascade decides which rule wins when several match. The box model defines how content, padding, border and margin add up to an element's size.",
    visuals: [
      {
        type: "layers",
        title: "The box model, outside in",
        layers: [
          { label: "Margin", detail: "Transparent space outside the border, separating elements" },
          { label: "Border", detail: "The visible edge around padding and content" },
          { label: "Padding", detail: "Space between the border and the content" },
          { label: "Content", detail: "Text and children; width applies here by default" },
        ],
      },
      {
        type: "flow",
        title: "How the cascade picks a winner",
        steps: [
          { label: "Origin & importance", detail: "Author styles beat browser defaults; !important flips the order" },
          { label: "Specificity", detail: "IDs beat classes, classes beat element selectors" },
          { label: "Source order", detail: "With equal specificity, the later rule wins" },
          { label: "Inheritance", detail: "Unset properties like color may inherit from the parent" },
        ],
      },
    ],
    keyPoints: [
      "Specificity is compared as IDs, then classes and attributes, then element selectors.",
      "Set box-sizing: border-box so width includes padding and border.",
      "Use rem for font sizes and spacing so layouts respect user font settings.",
      "DevTools shows every matching rule and crosses out the ones that lost.",
    ],
    terms: [
      { term: "Selector", meaning: "A pattern that picks elements, like .card, a[href] or h2." },
      { term: "Specificity", meaning: "A score that decides which matching rule takes priority." },
      { term: "Cascade", meaning: "The algorithm that resolves conflicts between matching rules." },
      { term: "rem", meaning: "A unit relative to the root font size, usually 16px." },
      { term: "em", meaning: "A unit relative to the current element's font size." },
    ],
    example: {
      lang: "css",
      code: "*, *::before, *::after {\n  box-sizing: border-box;\n}\n\n.card {\n  width: 20rem;\n  padding: 1rem;\n  border: 1px solid #ddd;\n  margin-block: 1.5rem;\n}\n\n.card h2 { font-size: 1.25rem; }\n.card[data-featured] { border-color: gold; }",
      caption: "border-box reset, rem units, and class plus attribute selectors.",
    },
    pitfalls: [
      "Reaching for !important instead of fixing specificity.",
      "Forgetting border-box, so padding makes boxes wider than expected.",
    ],
    check: [
      { q: "Which wins: .btn or #save, both setting color?", a: "#save wins because an ID selector is more specific than a class." },
      { q: "With content-box, how wide is a 200px box with 20px padding?", a: "240px, because padding on both sides is added to the width." },
    ],
  },

  "html-css/flex-grid": {
    summary:
      "Flexbox lays items out along one axis, which suits nav bars and toolbars. Grid controls rows and columns together, which suits card grids and page layouts. Most real layouts combine both.",
    visuals: [
      {
        type: "compare",
        title: "Flexbox vs Grid",
        columns: [
          {
            title: "Flexbox",
            points: ["One dimension: row or column", "Content decides item sizes", "justify-content and align-items", "Great for nav bars and toolbars"],
          },
          {
            title: "Grid",
            points: ["Two dimensions: rows and columns", "Container defines the tracks", "grid-template-areas for named regions", "Great for cards and page layouts"],
          },
        ],
      },
    ],
    keyPoints: [
      "Use Flexbox when items flow in a single line; use Grid when you need aligned rows and columns.",
      "gap works in both Flexbox and Grid and replaces margin hacks.",
      "repeat(auto-fill, minmax(16rem, 1fr)) builds a responsive card grid with no media queries.",
      "grid-template-areas lets you name regions like header, sidebar and main.",
    ],
    terms: [
      { term: "Main axis", meaning: "The direction Flexbox items flow, set by flex-direction." },
      { term: "justify-content", meaning: "Distributes items along the main axis." },
      { term: "align-items", meaning: "Aligns items on the cross axis." },
      { term: "fr unit", meaning: "A fraction of the free space in a grid container." },
      { term: "Grid track", meaning: "A single row or column in a grid." },
    ],
    example: {
      lang: "css",
      code: ".nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}\n\n.cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));\n  gap: 1.5rem;\n}",
      caption: "A Flexbox nav bar and a responsive Grid of cards.",
    },
    pitfalls: [
      "Forcing a two-dimensional layout into nested Flexbox rows.",
      "Using margins on children for spacing instead of gap.",
    ],
    check: [
      { q: "Which would you choose for a dashboard with header, sidebar and main?", a: "Grid, ideally with grid-template-areas, because it controls rows and columns together." },
      { q: "What does justify-content do in a flex row?", a: "It distributes the items horizontally along the main axis." },
    ],
  },

  "html-css/responsive": {
    summary:
      "Responsive design makes one layout adapt from phones to desktops. A mobile-first approach writes base styles for small screens, then adds min-width media queries for larger ones.",
    visuals: [
      {
        type: "flow",
        title: "Mobile-first, step by step",
        steps: [
          { label: "Viewport meta tag", detail: "Stops phones from rendering a zoomed-out desktop page" },
          { label: "Base styles", detail: "Single column layout for small screens" },
          { label: "Fluid sizing", detail: "Percentages, max-width and clamp() scale smoothly" },
          { label: "min-width queries", detail: "Add columns as space grows, e.g. at 48rem" },
          { label: "Test many widths", detail: "Use DevTools device mode and resize the window" },
        ],
      },
    ],
    keyPoints: [
      "Without the viewport meta tag, phones show a tiny desktop layout.",
      "Mobile-first queries use min-width and only add complexity as screens grow.",
      "clamp(min, preferred, max) gives fluid type and spacing without many breakpoints.",
      "Set breakpoints where your content breaks, not at specific device sizes.",
    ],
    terms: [
      { term: "Viewport", meaning: "The visible area of the page in the browser window." },
      { term: "Media query", meaning: "A CSS condition that applies styles only when it matches." },
      { term: "Breakpoint", meaning: "A width where the layout changes." },
      { term: "clamp()", meaning: "A CSS function that keeps a value between a minimum and maximum." },
    ],
    example: {
      lang: "css",
      code: "/* In HTML head: <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> */\n\n.layout { display: grid; gap: 1rem; }\n\nh1 { font-size: clamp(1.75rem, 4vw, 3rem); }\n\n@media (min-width: 48rem) {\n  .layout { grid-template-columns: 16rem 1fr; }\n}",
      caption: "Single column by default, sidebar from 48rem up.",
    },
    pitfalls: [
      "Writing desktop styles first, then overriding everything for mobile.",
      "Setting fixed pixel widths that cause horizontal scrolling on phones.",
    ],
    check: [
      { q: "What does mobile-first mean in CSS?", a: "Base styles target small screens, and min-width media queries add styles for larger screens." },
      { q: "What does clamp(1rem, 2vw, 2rem) do?", a: "It scales with the viewport width but never goes below 1rem or above 2rem." },
    ],
  },

  "html-css/a11y": {
    summary:
      "Accessibility means people using keyboards, screen readers or low vision can use your site. Most problems are found with a keyboard test, a contrast check and an automated audit, then fixed in the markup.",
    visuals: [
      {
        type: "cycle",
        title: "Audit and fix loop",
        steps: [
          { label: "Keyboard test", detail: "Tab through everything; focus must be visible and logical" },
          { label: "Automated audit", detail: "Run axe or Lighthouse to catch common issues" },
          { label: "Fix markup", detail: "Add labels, alt text, contrast and semantic elements" },
          { label: "Screen reader check", detail: "Listen to key flows with VoiceOver or NVDA" },
        ],
      },
    ],
    keyPoints: [
      "Every interactive element must be reachable and usable with the keyboard alone.",
      "Body text needs a contrast ratio of at least 4.5:1 for WCAG AA.",
      "Informative images need alt text; decorative images get an empty alt attribute.",
      "Prefer native HTML over ARIA; use ARIA only to fill real gaps.",
      "Automated tools catch only part of the issues, so test by hand too.",
    ],
    terms: [
      { term: "WCAG", meaning: "Web Content Accessibility Guidelines, the common accessibility standard." },
      { term: "Contrast ratio", meaning: "How different text and background colors are, from 1:1 to 21:1." },
      { term: "ARIA", meaning: "Attributes that add accessibility info, like aria-label, to elements." },
      { term: "Focus indicator", meaning: "The visible outline showing which element has keyboard focus." },
      { term: "axe", meaning: "A widely used automated accessibility testing engine." },
    ],
    example: {
      lang: "html",
      code: "<img src=\"chart.png\" alt=\"Sales grew 40% in March\" />\n<img src=\"divider.svg\" alt=\"\" />\n\n<button aria-label=\"Close dialog\">\n  <svg aria-hidden=\"true\"><!-- X icon --></svg>\n</button>\n\n<style>\n  :focus-visible { outline: 3px solid #2563eb; }\n</style>",
      caption: "Meaningful alt text, a labelled icon button and visible focus.",
    },
    pitfalls: [
      "Removing focus outlines with outline: none and no replacement.",
      "Adding ARIA roles to divs instead of using native elements.",
      "Trusting a perfect Lighthouse score as proof the page is accessible.",
    ],
    check: [
      { q: "When should an image have alt=\"\"?", a: "When it is purely decorative, so screen readers skip it." },
      { q: "What is the minimum contrast ratio for normal body text under WCAG AA?", a: "4.5:1." },
    ],
  },

  // ───────────────────────── JavaScript ─────────────────────────
  "javascript/js-core": {
    summary:
      "Modern JavaScript uses const and let, arrow functions, destructuring and array methods. These features make data transformations short and predictable, and they appear everywhere in React code.",
    visuals: [
      {
        type: "tree",
        title: "JavaScript values",
        root: "Value",
        children: [
          { label: "Primitives", children: ["string", "number", "boolean", "null and undefined", "bigint and symbol"] },
          { label: "Objects", children: ["plain objects", "arrays", "functions", "Map and Set", "Date"] },
        ],
      },
    ],
    keyPoints: [
      "Use const by default and let only when you reassign; avoid var.",
      "Primitives are copied by value; objects and arrays are shared by reference.",
      "map, filter and reduce return new values instead of changing the original array.",
      "A closure is a function that remembers variables from where it was created.",
      "Arrow functions do not have their own this; they use the surrounding one.",
    ],
    terms: [
      { term: "Destructuring", meaning: "Unpacking values from objects or arrays into variables." },
      { term: "Spread (...)", meaning: "Expands an array or object into another one." },
      { term: "Rest (...)", meaning: "Collects remaining items or arguments into an array." },
      { term: "Closure", meaning: "A function plus the variables it captured from its scope." },
      { term: "Arrow function", meaning: "Short function syntax that inherits this from its scope." },
    ],
    example: {
      lang: "js",
      code: "const users = [\n  { name: 'Ana', age: 31, active: true },\n  { name: 'Ben', age: 17, active: false },\n];\n\nconst names = users\n  .filter((u) => u.active)\n  .map(({ name }) => name);\n\nconst totalAge = users.reduce((sum, u) => sum + u.age, 0);\nconst updated = { ...users[0], age: 32 };\n\nconsole.log(names, totalAge, updated);",
      caption: "filter, map, reduce, destructuring and spread.",
    },
    pitfalls: [
      "Mutating an object you thought was a copy because objects are shared by reference.",
      "Using == instead of === and getting surprising type coercion.",
    ],
    check: [
      { q: "What does [1, 2, 3].map((n) => n * 2) return?", a: "A new array [2, 4, 6]; the original array is unchanged." },
      { q: "Why might const obj = {}; obj.x = 1 still work?", a: "const prevents reassigning the variable, not changing the object it points to." },
    ],
  },

  "javascript/js-dom": {
    summary:
      "The DOM is the browser's tree of objects representing the page. JavaScript selects elements, changes them and listens for events like clicks to make pages interactive.",
    visuals: [
      {
        type: "flow",
        title: "How a click event travels",
        steps: [
          { label: "Capture phase", detail: "Event travels down from window to the target" },
          { label: "Target phase", detail: "Listeners on the clicked element run" },
          { label: "Bubble phase", detail: "Event travels back up through each ancestor" },
          { label: "Delegated handler", detail: "A parent listener checks event.target and reacts" },
        ],
      },
    ],
    keyPoints: [
      "querySelector and querySelectorAll find elements using CSS selectors.",
      "addEventListener attaches handlers without overwriting existing ones.",
      "Most events bubble, so one parent listener can handle many children.",
      "Use textContent for plain text to avoid injecting unsafe HTML.",
    ],
    terms: [
      { term: "DOM", meaning: "Document Object Model, the live tree of page elements." },
      { term: "Event listener", meaning: "A function that runs when a given event fires." },
      { term: "Event bubbling", meaning: "An event moving up from the target through its ancestors." },
      { term: "Event delegation", meaning: "Handling child events with a single listener on a parent." },
      { term: "event.target", meaning: "The element where the event originally happened." },
    ],
    example: {
      lang: "js",
      code: "const list = document.querySelector('#todos');\nconst input = document.querySelector('#new-todo');\n\ndocument.querySelector('#add').addEventListener('click', () => {\n  const li = document.createElement('li');\n  li.textContent = input.value;\n  list.append(li);\n  input.value = '';\n});\n\nlist.addEventListener('click', (event) => {\n  if (event.target.matches('li')) event.target.classList.toggle('done');\n});",
      caption: "Creating elements and one delegated listener for every item.",
    },
    pitfalls: [
      "Using innerHTML with user input, which allows script injection.",
      "Adding a listener to each list item instead of delegating to the parent.",
    ],
    check: [
      { q: "Why does event delegation work?", a: "Because events bubble up, so a listener on the parent sees clicks on its children." },
      { q: "Why prefer textContent over innerHTML for user input?", a: "textContent inserts plain text, so it cannot inject HTML or scripts." },
    ],
  },

  "javascript/js-async": {
    summary:
      "Network requests take time, so JavaScript handles them asynchronously with promises. async/await makes that code read top to bottom, and fetch is the built-in way to call APIs.",
    visuals: [
      {
        type: "sequence",
        title: "Loading data with fetch",
        actors: ["UI", "Your code", "API server"],
        messages: [
          { from: 0, to: 1, label: "User opens page" },
          { from: 1, to: 0, label: "Show loading state" },
          { from: 1, to: 2, label: "fetch('/api/posts')" },
          { from: 2, to: 1, label: "Response with JSON body" },
          { from: 1, to: 1, label: "Check res.ok, parse JSON" },
          { from: 1, to: 0, label: "Render data or error" },
        ],
      },
      {
        type: "cycle",
        title: "The event loop",
        steps: [
          { label: "Run call stack", detail: "Execute the current synchronous code to completion" },
          { label: "Drain microtasks", detail: "Run resolved promise callbacks" },
          { label: "Render if needed", detail: "Browser may update the screen" },
          { label: "Next task", detail: "Take the next timer, event or network callback" },
        ],
      },
    ],
    keyPoints: [
      "A promise represents a value that will be ready later, or an error.",
      "await pauses only the async function, not the whole page.",
      "fetch only rejects on network failure; check res.ok for HTTP errors like 404.",
      "Always show loading and error states so users know what is happening.",
    ],
    terms: [
      { term: "Promise", meaning: "An object for a future value: pending, fulfilled or rejected." },
      { term: "async/await", meaning: "Syntax for writing promise code that reads like synchronous code." },
      { term: "Event loop", meaning: "The mechanism that runs queued callbacks when the stack is empty." },
      { term: "fetch", meaning: "The built-in browser function for making HTTP requests." },
    ],
    example: {
      lang: "js",
      code: "async function loadPosts() {\n  status.textContent = 'Loading...';\n  try {\n    const res = await fetch('https://jsonplaceholder.typicode.com/posts');\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const posts = await res.json();\n    status.textContent = `${posts.length} posts loaded`;\n  } catch (err) {\n    status.textContent = `Failed: ${err.message}`;\n  }\n}\n\nconst status = document.querySelector('#status');\nloadPosts();",
      caption: "Loading, success and error states with async/await.",
    },
    pitfalls: [
      "Assuming fetch throws on a 404 or 500 response.",
      "Forgetting await, so you get a pending promise instead of data.",
      "Awaiting independent requests one by one instead of using Promise.all.",
    ],
    check: [
      { q: "Does fetch reject when the server returns 500?", a: "No. It resolves, so you must check res.ok or res.status yourself." },
      { q: "How do you run two independent requests at the same time?", a: "Start both and await Promise.all([a, b])." },
    ],
  },

  "javascript/js-modules": {
    summary:
      "ES modules split code into files that import and export values. npm installs third-party packages, and a dev server like Vite serves your modules with instant reloads.",
    visuals: [
      {
        type: "flow",
        title: "From empty folder to running app",
        steps: [
          { label: "npm init", detail: "Creates package.json to track scripts and dependencies" },
          { label: "npm install", detail: "Adds packages to node_modules and the lockfile" },
          { label: "import / export", detail: "Split code into modules that share values" },
          { label: "npm run dev", detail: "Vite serves modules with hot reload" },
          { label: "npm run build", detail: "Bundles and minifies files for production" },
        ],
      },
    ],
    keyPoints: [
      "package.json lists dependencies and scripts; the lockfile pins exact versions.",
      "Commit the lockfile but never commit node_modules.",
      "A module can have many named exports and at most one default export.",
      "Dev servers serve modules fast; build tools bundle them for production.",
    ],
    terms: [
      { term: "ES module", meaning: "A JavaScript file using import and export." },
      { term: "npm", meaning: "Node's package manager and public package registry." },
      { term: "package.json", meaning: "Project manifest with name, scripts and dependencies." },
      { term: "Lockfile", meaning: "package-lock.json, recording exact installed versions." },
      { term: "Bundler", meaning: "A tool that combines modules into optimised files." },
    ],
    example: {
      lang: "js",
      code: "// math.js\nexport function add(a, b) {\n  return a + b;\n}\nexport default function square(n) {\n  return n * n;\n}\n\n// main.js\nimport square, { add } from './math.js';\nconsole.log(add(2, 3), square(4));\n\n// Terminal: npm create vite@latest my-app",
      caption: "Named and default exports, imported in another file.",
    },
    pitfalls: [
      "Mixing require and import in the same project without understanding the difference.",
      "Installing build-only tools as regular dependencies instead of devDependencies.",
    ],
    check: [
      { q: "Should node_modules be committed to Git?", a: "No. Commit package.json and the lockfile; anyone can recreate node_modules with npm install." },
      { q: "How do you import a default export and a named export together?", a: "import square, { add } from './math.js'." },
    ],
  },

  // ───────────────────────── TypeScript ─────────────────────────
  "typescript/ts-basics": {
    summary:
      "TypeScript adds types to JavaScript and checks them before your code runs. It catches typos, missing fields and wrong arguments in the editor, then compiles to plain JavaScript.",
    visuals: [
      {
        type: "flow",
        title: "What happens to TypeScript code",
        steps: [
          { label: "Write .ts code", detail: "Add annotations where inference is not enough" },
          { label: "Type check", detail: "The compiler reports mismatches in the editor and CI" },
          { label: "Strip types", detail: "Types are removed; only JavaScript remains" },
          { label: "Run JavaScript", detail: "Browsers and Node run the output, with no runtime checks" },
        ],
      },
    ],
    keyPoints: [
      "Types exist only at compile time; they do not validate data at runtime.",
      "Let inference type local variables; annotate function parameters and public APIs.",
      "Use interface or type to describe object shapes.",
      "Prefer unknown over any for untrusted data, then narrow or validate it.",
    ],
    terms: [
      { term: "Type annotation", meaning: "Explicitly writing a type, like name: string." },
      { term: "Type inference", meaning: "TypeScript working out a type from the value." },
      { term: "interface", meaning: "A named description of an object's shape." },
      { term: "Type alias", meaning: "A name for any type, created with the type keyword." },
      { term: "any", meaning: "Turns off type checking for a value; use sparingly." },
      { term: "unknown", meaning: "A safe any; you must check it before using it." },
    ],
    example: {
      lang: "ts",
      code: "interface User {\n  id: number;\n  name: string;\n  email?: string;\n}\n\nfunction greet(user: User): string {\n  return `Hi, ${user.name}`;\n}\n\nasync function getUser(id: number): Promise<User> {\n  const res = await fetch(`/api/users/${id}`);\n  return (await res.json()) as User;\n}",
      caption: "An interface and typed function parameters and return types.",
    },
    pitfalls: [
      "Casting API responses with as and assuming the server really matches the type.",
      "Sprinkling any to silence errors instead of fixing the types.",
    ],
    check: [
      { q: "Does TypeScript check API data at runtime?", a: "No. Types are erased, so use runtime validation like Zod for untrusted data." },
      { q: "What does the ? in email?: string mean?", a: "The property is optional and may be undefined." },
    ],
  },

  "typescript/ts-narrowing": {
    summary:
      "Union types say a value can be one of several types, and narrowing lets TypeScript know which one you have. Generics let one function or type work with many types while staying type safe.",
    visuals: [
      {
        type: "tree",
        title: "A discriminated union for request state",
        root: "RequestState",
        children: [
          { label: "status: 'idle'" },
          { label: "status: 'loading'" },
          { label: "status: 'success'", children: ["data: T"] },
          { label: "status: 'error'", children: ["error: string"] },
        ],
      },
    ],
    keyPoints: [
      "A discriminated union shares one literal field, like status, to tell variants apart.",
      "Checking typeof, in, or the discriminant narrows the type inside that branch.",
      "Generics like <T> keep the link between input and output types.",
      "Utility types like Partial, Pick and Omit derive new types from existing ones.",
    ],
    terms: [
      { term: "Union type", meaning: "A value that can be one of several types, written A | B." },
      { term: "Literal type", meaning: "A type that is one exact value, like 'loading'." },
      { term: "Narrowing", meaning: "Refining a broad type to a specific one through checks." },
      { term: "Discriminant", meaning: "The shared field whose value identifies the union variant." },
      { term: "Generic", meaning: "A type parameter like T that is filled in at use time." },
    ],
    example: {
      lang: "ts",
      code: "type State<T> =\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: string };\n\nfunction render(s: State<string[]>): string {\n  switch (s.status) {\n    case 'loading': return 'Loading...';\n    case 'success': return s.data.join(', ');\n    case 'error': return `Error: ${s.error}`;\n  }\n}\n\nconst first = <T,>(items: T[]): T | undefined => items[0];",
      caption: "Narrowing by status, plus a small generic helper.",
    },
    pitfalls: [
      "Modelling state with several optional booleans that can contradict each other.",
      "Writing generics that are never used to relate inputs and outputs.",
    ],
    check: [
      { q: "Why is a discriminated union better than isLoading and isError booleans?", a: "It makes impossible combinations unrepresentable, and TypeScript narrows each case for you." },
      { q: "What type does first(['a', 'b']) return?", a: "string | undefined, because T is inferred as string." },
    ],
  },

  "typescript/ts-config": {
    summary:
      "tsconfig.json controls how TypeScript checks and compiles your project. Turning on strict mode enables the checks that catch the most real bugs, especially around null and undefined.",
    visuals: [
      {
        type: "compare",
        title: "Without vs with strict mode",
        columns: [
          {
            title: "strict: false",
            points: ["Missing types silently become any", "null can go anywhere", "Bugs surface at runtime", "Fewer errors, false confidence"],
          },
          {
            title: "strict: true",
            points: ["noImplicitAny flags untyped params", "strictNullChecks forces null handling", "Bugs surface in the editor", "More errors up front, safer code"],
          },
        ],
      },
    ],
    keyPoints: [
      "Start new projects with strict: true; it is much harder to enable later.",
      "strictNullChecks makes you handle values that may be null or undefined.",
      "target and lib decide which JavaScript features and APIs are available.",
      "Fix strict errors with narrowing and real types, not non-null assertions everywhere.",
    ],
    terms: [
      { term: "tsconfig.json", meaning: "The file holding TypeScript compiler options for a project." },
      { term: "strict", meaning: "A flag that turns on a family of stricter checks." },
      { term: "noImplicitAny", meaning: "Errors when TypeScript would silently fall back to any." },
      { term: "strictNullChecks", meaning: "Keeps null and undefined out of other types unless declared." },
      { term: "Non-null assertion", meaning: "The ! operator telling TypeScript a value is not null." },
    ],
    example: {
      lang: "json",
      code: "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"lib\": [\"dom\", \"ES2022\"],\n    \"module\": \"esnext\",\n    \"moduleResolution\": \"bundler\",\n    \"strict\": true,\n    \"noUncheckedIndexedAccess\": true,\n    \"noEmit\": true,\n    \"jsx\": \"preserve\"\n  },\n  \"include\": [\"src\"]\n}",
      caption: "A strict config for a bundled frontend project.",
    },
    pitfalls: [
      "Silencing strict errors with ! or as any instead of handling the case.",
      "Disabling strict for the whole project because of a few hard files.",
    ],
    check: [
      { q: "What does strictNullChecks catch?", a: "Using a value that might be null or undefined without first checking it." },
      { q: "Why run tsc --noEmit in CI?", a: "It type checks the whole project without producing files, failing the build on type errors." },
    ],
  },

  // ───────────────────────── React ─────────────────────────
  "react/react-components": {
    summary:
      "React apps are built from components: functions that take props and return JSX describing UI. Small components compose into a tree, which makes UIs easier to reuse and reason about.",
    analogy: "Components are like LEGO bricks that snap together into bigger pieces.",
    visuals: [
      {
        type: "tree",
        title: "A product page as a component tree",
        root: "App",
        children: [
          { label: "Header", children: ["Logo", "SearchBar", "CartButton"] },
          { label: "ProductList", children: ["ProductCard", "ProductCard", "ProductCard"] },
          { label: "Footer" },
        ],
      },
    ],
    keyPoints: [
      "A component is a function whose name starts with a capital letter and returns JSX.",
      "Props flow down from parent to child and are read-only.",
      "The children prop lets a component wrap any nested content.",
      "Split a mockup into components by drawing boxes around repeated or distinct parts.",
    ],
    terms: [
      { term: "Component", meaning: "A function that returns UI and can be reused." },
      { term: "JSX", meaning: "HTML-like syntax in JavaScript that compiles to function calls." },
      { term: "Props", meaning: "Inputs passed to a component, like function arguments." },
      { term: "children", meaning: "A special prop holding the content between a component's tags." },
      { term: "Composition", meaning: "Building complex UI by nesting simpler components." },
    ],
    example: {
      lang: "tsx",
      code: "type CardProps = { title: string; price: number };\n\nfunction ProductCard({ title, price }: CardProps) {\n  return (\n    <article className=\"card\">\n      <h2>{title}</h2>\n      <p>${price.toFixed(2)}</p>\n    </article>\n  );\n}\n\nexport default function App() {\n  return <ProductCard title=\"Mug\" price={12} />;\n}",
      caption: "A typed component receiving props from its parent.",
    },
    pitfalls: [
      "Changing props inside a child instead of asking the parent to update them.",
      "Building one giant component instead of splitting it into focused pieces.",
    ],
    check: [
      { q: "Which direction do props flow?", a: "Down, from parent to child. Children cannot modify the props they receive." },
      { q: "Why must component names start with a capital letter?", a: "JSX treats lowercase tags as HTML elements and capitalised ones as components." },
    ],
  },

  "react/react-state": {
    summary:
      "State is data a component remembers between renders, created with useState. Calling the setter schedules a re-render with the new value, and React updates only what changed on screen.",
    visuals: [
      {
        type: "cycle",
        title: "How a state update reaches the screen",
        steps: [
          { label: "Event fires", detail: "User clicks or types" },
          { label: "Call setter", detail: "setCount(c => c + 1) queues an update" },
          { label: "Render", detail: "React calls the component with the new state" },
          { label: "Commit", detail: "React applies the differences to the DOM" },
        ],
      },
    ],
    keyPoints: [
      "State is a snapshot; the new value appears on the next render, not immediately.",
      "Use the updater form setX(prev => ...) when the new value depends on the old one.",
      "Lift state to the closest common parent when siblings need the same data.",
      "Derive values during render instead of storing duplicates in state.",
      "Never mutate state objects; create new ones with spread.",
    ],
    terms: [
      { term: "State", meaning: "Data a component keeps between renders." },
      { term: "useState", meaning: "Hook returning a value and a setter function." },
      { term: "Re-render", meaning: "React calling your component again to compute new UI." },
      { term: "Lifting state up", meaning: "Moving state to a parent so several children can share it." },
      { term: "Derived value", meaning: "A value calculated from existing state or props during render." },
    ],
    example: {
      lang: "tsx",
      code: "import { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n  const isEven = count % 2 === 0; // derived, not stored\n\n  return (\n    <div>\n      <button onClick={() => setCount((c) => c + 1)}>+1</button>\n      <p>{count} is {isEven ? 'even' : 'odd'}</p>\n      {count > 5 && <p>That is a lot of clicks!</p>}\n    </div>\n  );\n}",
      caption: "State, an updater function, a derived value and conditional rendering.",
    },
    pitfalls: [
      "Reading state right after setting it and expecting the new value.",
      "Mutating an array with push and calling setState with the same array.",
      "Storing values in state that could be computed from props.",
    ],
    check: [
      { q: "Why might console.log(count) after setCount(count + 1) show the old value?", a: "State updates apply on the next render; the current render keeps its snapshot." },
      { q: "Two sibling components need the same state. Where should it live?", a: "In their closest common parent, passed down as props." },
    ],
  },

  "react/react-lists-forms": {
    summary:
      "Lists are rendered by mapping arrays to JSX, and each item needs a stable key so React can track it. Controlled forms keep input values in state, which makes validation and submission straightforward.",
    visuals: [
      {
        type: "flow",
        title: "A controlled input",
        steps: [
          { label: "User types", detail: "The input fires a change event" },
          { label: "onChange handler", detail: "Reads e.target.value" },
          { label: "Update state", detail: "setEmail stores the new text" },
          { label: "Re-render", detail: "value={email} shows the latest state" },
          { label: "Validate", detail: "Compute errors from state and show them" },
        ],
      },
    ],
    keyPoints: [
      "Keys must be stable and unique among siblings; database IDs are ideal.",
      "Avoid array indexes as keys when items can be reordered, added or removed.",
      "A controlled input gets value from state and updates it in onChange.",
      "Call e.preventDefault() in onSubmit to stop the full page reload.",
    ],
    terms: [
      { term: "key", meaning: "A special prop that identifies a list item across renders." },
      { term: "Controlled input", meaning: "An input whose value is driven by React state." },
      { term: "onChange", meaning: "Handler that runs on every edit to an input." },
      { term: "preventDefault", meaning: "Stops the browser's default action, like a form reload." },
    ],
    example: {
      lang: "tsx",
      code: "function Signup() {\n  const [email, setEmail] = useState('');\n  const [items, setItems] = useState<{ id: string; email: string }[]>([]);\n  const error = email && !email.includes('@') ? 'Enter a valid email' : '';\n  function onSubmit(e: React.FormEvent) {\n    e.preventDefault();\n    if (error || !email) return;\n    setItems([...items, { id: crypto.randomUUID(), email }]); setEmail('');\n  }\n  return <form onSubmit={onSubmit}>\n    <input value={email} onChange={(e) => setEmail(e.target.value)} />\n    {error && <p role=\"alert\">{error}</p>}\n    <ul>{items.map((i) => <li key={i.id}>{i.email}</li>)}</ul>\n  </form>;\n}",
      caption: "Controlled input, derived validation and a keyed list.",
    },
    pitfalls: [
      "Using Math.random() as a key, which remounts items every render.",
      "Setting value without onChange, which makes the input read-only.",
    ],
    check: [
      { q: "Why are array indexes risky as keys?", a: "When items are reordered or removed, indexes shift and React may reuse the wrong item's state." },
      { q: "What makes an input controlled?", a: "Its value comes from state and onChange updates that state." },
    ],
  },

  "react/react-effects": {
    summary:
      "useEffect runs code after React commits to the screen, to sync with systems outside React like timers, subscriptions or browser APIs. Many effects are unnecessary and can be replaced by computing values during render or handling events directly.",
    visuals: [
      {
        type: "cycle",
        title: "Effect lifecycle",
        steps: [
          { label: "Render", detail: "React computes the UI from props and state" },
          { label: "Commit", detail: "React updates the DOM" },
          { label: "Run effect", detail: "Connect to the external system" },
          { label: "Dependencies change", detail: "React re-renders with new values" },
          { label: "Cleanup", detail: "Disconnect the old setup before running again" },
        ],
      },
    ],
    keyPoints: [
      "Effects are for syncing with external systems, not for transforming data.",
      "List every reactive value the effect uses in its dependency array.",
      "Return a cleanup function to undo subscriptions, timers and listeners.",
      "useRef stores a mutable value or DOM node without causing re-renders.",
      "In development Strict Mode, effects run twice to expose missing cleanup.",
    ],
    terms: [
      { term: "useEffect", meaning: "Hook that runs code after render to sync with outside systems." },
      { term: "Dependency array", meaning: "Values that make the effect re-run when they change." },
      { term: "Cleanup function", meaning: "Returned from an effect to tear down what it set up." },
      { term: "useRef", meaning: "Hook holding a mutable .current value that survives re-renders." },
      { term: "Strict Mode", meaning: "Development mode that double-runs effects to catch bugs." },
    ],
    example: {
      lang: "tsx",
      code: "function Clock() {\n  const [now, setNow] = useState(new Date());\n\n  useEffect(() => {\n    const id = setInterval(() => setNow(new Date()), 1000);\n    return () => clearInterval(id); // cleanup\n  }, []);\n\n  return <p>{now.toLocaleTimeString()}</p>;\n}\n\nfunction SearchBox() {\n  const inputRef = useRef<HTMLInputElement>(null);\n  return <input ref={inputRef} onFocus={() => inputRef.current?.select()} />;\n}",
      caption: "An interval with cleanup, and a ref to a DOM node.",
    },
    pitfalls: [
      "Using an effect to copy props into state instead of deriving the value.",
      "Omitting dependencies, which leaves the effect using stale values.",
      "Forgetting cleanup, causing duplicate listeners or memory leaks.",
    ],
    check: [
      { q: "When does an effect's cleanup run?", a: "Before the effect runs again with new dependencies, and when the component unmounts." },
      { q: "You compute a filtered list in an effect and store it in state. What is better?", a: "Compute it directly during render, optionally with useMemo if it is expensive." },
    ],
  },

  "react/react-context": {
    summary:
      "Context passes a value deep into the component tree without threading props through every level. useReducer centralises complex state changes in one pure function, and the two combine well for app-wide state.",
    visuals: [
      {
        type: "tree",
        title: "Context skips the middle layers",
        root: "CartProvider (value)",
        children: [
          { label: "Layout", children: ["Header uses useCart", "Sidebar"] },
          { label: "ProductPage", children: ["AddButton uses useCart"] },
          { label: "CheckoutPage", children: ["Summary uses useCart"] },
        ],
      },
      {
        type: "flow",
        title: "useReducer update flow",
        steps: [
          { label: "dispatch(action)", detail: "e.g. { type: 'add', item }" },
          { label: "reducer(state, action)", detail: "Pure function returns the next state" },
          { label: "New state", detail: "React stores it and re-renders consumers" },
        ],
      },
    ],
    keyPoints: [
      "Context avoids prop drilling but every consumer re-renders when the value changes.",
      "Create context, wrap a subtree in its Provider, read it with useContext.",
      "A reducer must be pure: same state and action always give the same result.",
      "Split contexts by concern so unrelated updates do not re-render everything.",
    ],
    terms: [
      { term: "Prop drilling", meaning: "Passing props through components that do not use them." },
      { term: "createContext", meaning: "Creates a context object with a default value." },
      { term: "Provider", meaning: "Component that supplies a context value to its subtree." },
      { term: "useReducer", meaning: "Hook managing state through a reducer and dispatched actions." },
      { term: "Action", meaning: "An object describing what happened, usually with a type field." },
    ],
    example: {
      lang: "tsx",
      code: "type Action = { type: 'add'; id: string } | { type: 'clear' };\n\nfunction cartReducer(state: string[], action: Action): string[] {\n  if (action.type === 'add') return [...state, action.id];\n  return [];\n}\n\nconst CartContext = createContext<{ items: string[]; dispatch: React.Dispatch<Action> } | null>(null);\n\nexport function CartProvider({ children }: { children: React.ReactNode }) {\n  const [items, dispatch] = useReducer(cartReducer, []);\n  return <CartContext.Provider value={{ items, dispatch }}>{children}</CartContext.Provider>;\n}\n\nexport const useCart = () => useContext(CartContext)!;",
      caption: "A reducer, a provider and a hook for consumers.",
    },
    pitfalls: [
      "Putting all app state in one context, so every change re-renders everything.",
      "Mutating state inside the reducer instead of returning a new object.",
    ],
    check: [
      { q: "What problem does context solve?", a: "It lets deep components read a value without passing props through every level." },
      { q: "Why must a reducer be pure?", a: "React may call it more than once, and pure functions make state changes predictable and testable." },
    ],
  },

  "react/react-hooks": {
    summary:
      "A custom hook is a function starting with use that calls other hooks to package reusable logic. Components share the logic, but each call gets its own independent state.",
    visuals: [
      {
        type: "layers",
        title: "Hooks build on hooks",
        layers: [
          { label: "Components", detail: "Call useOnlineStatus() and just render the result" },
          { label: "Custom hooks", detail: "useOnlineStatus, useDebounce, useLocalStorage" },
          { label: "Built-in hooks", detail: "useState, useEffect, useRef, useContext" },
          { label: "Browser APIs", detail: "navigator.onLine, localStorage, timers" },
        ],
      },
    ],
    keyPoints: [
      "Extract a hook when two or more components repeat the same stateful logic.",
      "Hook names must start with use so React and linters can check the rules.",
      "Each component calling a hook gets its own separate state.",
      "Only call hooks at the top level, never inside loops or conditions.",
    ],
    terms: [
      { term: "Custom hook", meaning: "A function starting with use that calls other hooks." },
      { term: "Rules of hooks", meaning: "Call hooks only at top level and only from components or hooks." },
      { term: "Composition", meaning: "Building a hook from smaller hooks." },
      { term: "Debounce", meaning: "Waiting until input stops changing before acting on it." },
    ],
    example: {
      lang: "tsx",
      code: "import { useEffect, useState } from 'react';\n\nexport function useDebounce<T>(value: T, delay = 300): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const id = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(id);\n  }, [value, delay]);\n  return debounced;\n}\n\n// In a component:\n// const query = useDebounce(input, 500);",
      caption: "A reusable debounce hook built from useState and useEffect.",
    },
    pitfalls: [
      "Calling a hook inside an if statement, which breaks hook order.",
      "Naming a plain helper useSomething when it calls no hooks.",
    ],
    check: [
      { q: "If two components call useDebounce, do they share state?", a: "No. Each call has its own independent state." },
      { q: "Why must custom hooks start with use?", a: "So React's lint rules can verify they follow the rules of hooks." },
    ],
  },

  "react/react-perf": {
    summary:
      "A component re-renders when its state changes, its parent re-renders, or a context it uses changes. Most re-renders are cheap; measure with the React Profiler before reaching for memo, useMemo or useCallback.",
    visuals: [
      {
        type: "flow",
        title: "From trigger to screen",
        steps: [
          { label: "Trigger", detail: "State, parent render or context change" },
          { label: "Render", detail: "React calls components to produce new JSX" },
          { label: "Reconcile", detail: "Compare new output with the previous tree" },
          { label: "Commit", detail: "Apply only the real DOM changes" },
        ],
      },
      {
        type: "compare",
        title: "Memoisation tools",
        columns: [
          { title: "memo", points: ["Wraps a component", "Skips render if props are equal", "Shallow prop comparison"] },
          { title: "useMemo", points: ["Caches a computed value", "Recomputes when deps change", "For expensive calculations"] },
          { title: "useCallback", points: ["Caches a function identity", "Helps memo children skip renders", "Useless without a memo consumer"] },
        ],
      },
    ],
    keyPoints: [
      "Rendering is not the same as updating the DOM; React commits only differences.",
      "Profile first with React DevTools to find components that are actually slow.",
      "memo only helps when props stay equal, so new objects each render defeat it.",
      "Moving state down or passing children often fixes re-renders without memoisation.",
    ],
    terms: [
      { term: "Render", meaning: "React calling a component function to get its output." },
      { term: "Reconciliation", meaning: "Comparing old and new trees to find changes." },
      { term: "Profiler", meaning: "React DevTools tab that records render timing." },
      { term: "Memoisation", meaning: "Caching a result so it is not recomputed unnecessarily." },
      { term: "Referential equality", meaning: "Two values being the exact same object in memory." },
    ],
    pitfalls: [
      "Wrapping everything in useMemo and useCallback without measuring.",
      "Passing inline objects to a memo component, so it re-renders anyway.",
    ],
    check: [
      { q: "Name three things that make a component re-render.", a: "Its own state changes, its parent re-renders, or a context it reads changes." },
      { q: "When does useCallback actually help?", a: "When the function is passed to a memoised child or used as an effect dependency." },
    ],
  },

  // ───────────────────────── Next.js ─────────────────────────
  "nextjs/next-routing": {
    summary:
      "In the Next.js App Router, folders inside app define URL segments and page.tsx makes a segment visitable. layout.tsx wraps child routes and persists across navigation, while loading.tsx and error.tsx handle waiting and failure.",
    visuals: [
      {
        type: "tree",
        title: "The app directory maps to URLs",
        root: "app/",
        children: [
          { label: "layout.tsx", children: ["Root layout wraps every page"] },
          { label: "page.tsx", children: ["URL: /"] },
          { label: "blog/", children: ["layout.tsx", "page.tsx is /blog", "loading.tsx"] },
          { label: "blog/[slug]/", children: ["page.tsx is /blog/any-slug", "error.tsx"] },
        ],
      },
    ],
    keyPoints: [
      "A folder becomes a route segment only when it contains page.tsx.",
      "Layouts nest and keep their state when you navigate between child pages.",
      "Square brackets like [slug] create dynamic segments read from params.",
      "Use Link for navigation; it prefetches routes and avoids full page reloads.",
      "useRouter from next/navigation handles programmatic navigation in client components.",
    ],
    terms: [
      { term: "App Router", meaning: "Next.js routing based on the app directory." },
      { term: "Route segment", meaning: "One folder level, which becomes one part of the URL." },
      { term: "Layout", meaning: "Shared UI that wraps child routes and persists across navigation." },
      { term: "Dynamic segment", meaning: "A folder like [id] that matches any value." },
      { term: "loading.tsx", meaning: "UI shown instantly while a route segment loads." },
      { term: "error.tsx", meaning: "A client component shown when a segment throws an error." },
    ],
    example: {
      lang: "tsx",
      code: "// app/blog/[slug]/page.tsx\nimport Link from 'next/link';\n\ntype Props = { params: Promise<{ slug: string }> };\n\nexport default async function Post({ params }: Props) {\n  const { slug } = await params;\n  return (\n    <article>\n      <h1>{slug}</h1>\n      <Link href=\"/blog\">Back to blog</Link>\n    </article>\n  );\n}",
      caption: "A dynamic route reading its slug and linking back.",
    },
    pitfalls: [
      "Using a plain anchor tag for internal links and losing client-side navigation.",
      "Forgetting that error.tsx must be a client component.",
    ],
    check: [
      { q: "What URL does app/shop/[id]/page.tsx serve?", a: "/shop/ followed by any value, such as /shop/42, with id available in params." },
      { q: "What happens to a layout when navigating between its child pages?", a: "It stays mounted and keeps its state; only the page part changes." },
    ],
  },

  "nextjs/next-rsc": {
    summary:
      "In the App Router, components are server components by default: they render on the server and send no JavaScript for themselves. Add 'use client' only for parts that need state, effects or browser APIs.",
    visuals: [
      {
        type: "layers",
        title: "Where each part runs",
        layers: [
          { label: "Browser", detail: "Hydrates client components and handles interaction" },
          { label: "Client components", detail: "'use client': state, effects, event handlers" },
          { label: "Server components", detail: "Default: fetch data, read secrets, render HTML" },
          { label: "Data sources", detail: "Databases, APIs and files, reached only from server" },
        ],
      },
      {
        type: "compare",
        title: "Server vs client components",
        columns: [
          { title: "Server component", points: ["Can be async and await data", "Can use secrets safely", "No JS shipped for itself", "No useState or onClick"] },
          { title: "Client component", points: ["Marked with 'use client'", "Uses state, effects, handlers", "Code is sent to the browser", "Still pre-rendered to HTML"] },
        ],
      },
    ],
    keyPoints: [
      "'use client' marks a boundary; everything it imports joins the client bundle.",
      "Push 'use client' down to small leaf components like buttons and forms.",
      "Server components can pass serialisable props, or render server components as children.",
      "Never import server-only code like database clients into client components.",
    ],
    terms: [
      { term: "Server component", meaning: "A component rendered only on the server, the App Router default." },
      { term: "Client component", meaning: "A component marked 'use client' that also runs in the browser." },
      { term: "'use client'", meaning: "Directive at the top of a file that starts a client boundary." },
      { term: "Hydration", meaning: "Attaching event handlers to server-rendered HTML in the browser." },
      { term: "Serialisable", meaning: "Data that can be sent over the network, like JSON values." },
    ],
    example: {
      lang: "tsx",
      code: "// app/page.tsx (server component)\nimport LikeButton from './like-button';\n\nexport default async function Page() {\n  const post = await db.post.findFirst();\n  return <h1>{post.title} <LikeButton initial={post.likes} /></h1>;\n}\n\n// app/like-button.tsx\n'use client';\nimport { useState } from 'react';\nexport default function LikeButton({ initial }: { initial: number }) {\n  const [likes, setLikes] = useState(initial);\n  return <button onClick={() => setLikes(likes + 1)}>{likes}</button>;\n}",
      caption: "Data loads on the server; only the button ships JavaScript.",
    },
    pitfalls: [
      "Putting 'use client' at the top of a whole page and shipping everything.",
      "Passing functions or class instances from server to client components as props.",
    ],
    check: [
      { q: "Can a server component use useState?", a: "No. State and event handlers need a client component." },
      { q: "Why keep client components small?", a: "Everything under a 'use client' boundary is sent to the browser, increasing bundle size." },
    ],
  },

  "nextjs/next-data": {
    summary:
      "Server components can fetch data directly with async/await. Next.js then renders routes statically at build time, dynamically per request, or statically with periodic or on-demand revalidation.",
    visuals: [
      {
        type: "compare",
        title: "Rendering strategies",
        columns: [
          { title: "Static", points: ["Rendered at build time", "Served from cache or CDN", "Fastest response", "Best for marketing and docs"] },
          { title: "Revalidated", points: ["Static, refreshed on a timer", "Or via revalidatePath or revalidateTag", "Fresh enough, still fast", "Best for blogs and catalogs"] },
          { title: "Dynamic", points: ["Rendered on every request", "Uses cookies, headers or live data", "Always fresh, more server work", "Best for dashboards"] },
        ],
      },
    ],
    keyPoints: [
      "Fetch in server components close to where data is used; requests are deduplicated.",
      "Reading cookies, headers or searchParams makes a route dynamic.",
      "Set next: { revalidate: 60 } on fetch to refresh cached data every minute.",
      "Wrap slow parts in Suspense so the rest of the page streams immediately.",
      "Caching defaults have changed across Next.js versions, so check the docs for yours.",
    ],
    terms: [
      { term: "Static rendering", meaning: "HTML generated ahead of time and reused for many requests." },
      { term: "Dynamic rendering", meaning: "HTML generated fresh for each request." },
      { term: "Revalidation", meaning: "Refreshing cached data after a time or a trigger." },
      { term: "Streaming", meaning: "Sending parts of the page as soon as they are ready." },
      { term: "Suspense", meaning: "A boundary that shows a fallback while children load." },
    ],
    example: {
      lang: "tsx",
      code: "import { Suspense } from 'react';\n\nasync function Products() {\n  const res = await fetch('https://api.example.com/products', { next: { revalidate: 60 } });\n  const products: { id: string; name: string }[] = await res.json();\n  return <ul>{products.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;\n}\n\nexport default function Page() {\n  return <Suspense fallback={<p>Loading...</p>}><Products /></Suspense>;\n}",
      caption: "Time-based revalidation with a streamed Suspense boundary.",
    },
    pitfalls: [
      "Fetching from your own route handler inside a server component instead of calling the logic directly.",
      "Assuming data is cached when your Next.js version does not cache fetch by default.",
    ],
    check: [
      { q: "What makes a route render dynamically?", a: "Using request-time data like cookies, headers or searchParams, or opting out of caching." },
      { q: "What does revalidate: 60 mean?", a: "Cached data can be reused for up to 60 seconds before Next.js refreshes it in the background." },
    ],
  },

  "nextjs/next-actions": {
    summary:
      "Server actions are async functions marked 'use server' that run on the server but can be called from forms and client code. They handle mutations without writing a separate API endpoint.",
    visuals: [
      {
        type: "sequence",
        title: "Submitting a form to a server action",
        actors: ["Browser form", "Server action", "Database"],
        messages: [
          { from: 0, to: 1, label: "POST FormData" },
          { from: 1, to: 1, label: "Check auth, validate with Zod" },
          { from: 1, to: 2, label: "Insert row" },
          { from: 2, to: 1, label: "Saved" },
          { from: 1, to: 1, label: "revalidatePath('/todos')" },
          { from: 1, to: 0, label: "Return state, fresh UI" },
        ],
      },
    ],
    keyPoints: [
      "A server action is a public endpoint, so always check auth and validate input.",
      "Forms can call actions directly via the action prop, even before JavaScript loads.",
      "useActionState gives you the returned state and a pending flag.",
      "Call revalidatePath or revalidateTag after a mutation so pages show fresh data.",
    ],
    terms: [
      { term: "Server action", meaning: "An async 'use server' function callable from the client." },
      { term: "'use server'", meaning: "Directive marking functions that run only on the server." },
      { term: "FormData", meaning: "Browser object holding a form's submitted fields." },
      { term: "Zod", meaning: "A TypeScript library for validating data at runtime." },
      { term: "useActionState", meaning: "React hook tracking an action's result and pending state." },
    ],
    example: {
      lang: "tsx",
      code: "// app/todos/actions.ts\n'use server';\nimport { z } from 'zod';\nimport { revalidatePath } from 'next/cache';\n\nconst Todo = z.object({ title: z.string().min(1).max(100) });\n\nexport async function addTodo(prev: { error?: string }, formData: FormData) {\n  const parsed = Todo.safeParse({ title: formData.get('title') });\n  if (!parsed.success) return { error: 'Title is required' };\n  await db.todo.create({ data: parsed.data });\n  revalidatePath('/todos');\n  return {};\n}",
      caption: "Validate, mutate, revalidate, return state for the form.",
    },
    pitfalls: [
      "Trusting form data without validation because the form has required fields.",
      "Forgetting to revalidate, so the page shows stale data after saving.",
    ],
    check: [
      { q: "Why must server actions check authentication?", a: "They are reachable by POST requests from anyone, not just your form." },
      { q: "How do you show a pending state while an action runs?", a: "Use useActionState or useFormStatus to read the pending flag and disable the button." },
    ],
  },

  "nextjs/next-api": {
    summary:
      "Route handlers are route.ts files that export functions like GET and POST to build HTTP endpoints. Middleware runs before matching routes and can redirect or block requests, for example when a user is not signed in.",
    visuals: [
      {
        type: "sequence",
        title: "A request through middleware to a handler",
        actors: ["Client", "Middleware", "Route handler"],
        messages: [
          { from: 0, to: 1, label: "GET /api/notes with cookie" },
          { from: 1, to: 1, label: "Check session cookie" },
          { from: 1, to: 0, label: "Redirect to /login if missing" },
          { from: 1, to: 2, label: "Otherwise continue" },
          { from: 2, to: 0, label: "200 JSON response" },
        ],
      },
    ],
    keyPoints: [
      "Export GET, POST, PUT or DELETE from app/api/.../route.ts.",
      "Return Response.json(data, { status }) with the correct HTTP status code.",
      "Middleware should stay fast and do light checks; verify auth again near the data.",
      "Next.js 16 renamed middleware.ts to proxy.ts; older versions use middleware.ts.",
    ],
    terms: [
      { term: "Route handler", meaning: "A route.ts file exporting functions per HTTP method." },
      { term: "Middleware", meaning: "Code that runs before a request reaches a route." },
      { term: "matcher", meaning: "Config listing which paths middleware applies to." },
      { term: "Status code", meaning: "Number signalling the result, like 200, 400, 401 or 404." },
      { term: "NextResponse", meaning: "Next.js helper for redirects, rewrites and responses." },
    ],
    example: {
      lang: "ts",
      code: "// app/api/notes/route.ts\nexport async function GET() {\n  const notes = await db.note.findMany();\n  return Response.json(notes);\n}\n\nexport async function POST(req: Request) {\n  const body = await req.json();\n  if (typeof body.text !== 'string' || !body.text) {\n    return Response.json({ error: 'text is required' }, { status: 400 });\n  }\n  const note = await db.note.create({ data: { text: body.text } });\n  return Response.json(note, { status: 201 });\n}",
      caption: "GET and POST handlers with proper status codes.",
    },
    pitfalls: [
      "Returning 200 for every response, including errors.",
      "Relying only on middleware for authorization and skipping checks in handlers.",
    ],
    check: [
      { q: "Which status code fits a successful create?", a: "201 Created." },
      { q: "Why re-check auth inside the handler if middleware already did?", a: "Defense in depth: matcher mistakes or other entry points could bypass middleware." },
    ],
  },

  "nextjs/next-assets": {
    summary:
      "Next.js has built-in tools for page metadata, images and fonts. They improve SEO and sharing previews, and they prevent slow loads and layout shifts with little effort.",
    visuals: [
      {
        type: "tree",
        title: "Built-in asset helpers",
        root: "Next.js assets",
        children: [
          { label: "Metadata", children: ["static metadata export", "generateMetadata for dynamic pages", "Open Graph images"] },
          { label: "next/image", children: ["Resizes per device", "Lazy loads by default", "Reserves space to avoid shift"] },
          { label: "next/font", children: ["Self-hosts font files", "No layout shift on swap", "No runtime font requests"] },
        ],
      },
    ],
    keyPoints: [
      "Export a metadata object from a layout or page to set title and description.",
      "Use generateMetadata when metadata depends on route params or fetched data.",
      "next/image needs width and height, or fill, so it can reserve space.",
      "Mark the main above-the-fold image as priority to speed up LCP.",
    ],
    terms: [
      { term: "Metadata", meaning: "Title, description and tags that search engines and social apps read." },
      { term: "Open Graph", meaning: "Tags that control link preview cards on social platforms." },
      { term: "next/image", meaning: "Image component that resizes, lazy loads and optimises images." },
      { term: "next/font", meaning: "Loads fonts at build time and self-hosts them." },
      { term: "Layout shift", meaning: "Content jumping as late-loading elements take up space." },
    ],
    example: {
      lang: "tsx",
      code: "import Image from 'next/image';\nimport { Inter } from 'next/font/google';\nimport type { Metadata } from 'next';\n\nconst inter = Inter({ subsets: ['latin'] });\n\nexport const metadata: Metadata = { title: 'Recipes', description: 'Weeknight recipes' };\n\nexport default function Page() {\n  return (\n    <main className={inter.className}>\n      <Image src=\"/hero.jpg\" alt=\"Pasta on a table\" width={1200} height={600} priority />\n    </main>\n  );\n}",
      caption: "Static metadata, an optimised hero image and a self-hosted font.",
    },
    pitfalls: [
      "Using the same title on every page, which hurts search results.",
      "Leaving off width and height, causing layout shift or build errors.",
    ],
    check: [
      { q: "When would you use generateMetadata instead of a metadata object?", a: "When the title or description depends on dynamic data, like a product name from the database." },
      { q: "How does next/image help with layout shift?", a: "It reserves the image's space using its width and height before the image loads." },
    ],
  },

  "nextjs/next-auth-db": {
    summary:
      "Most apps need users to sign in and data saved per user. An auth library handles sign-in and sessions, a hosted database stores data, and every page and action checks who the user is.",
    visuals: [
      {
        type: "sequence",
        title: "Sign in, then save user data",
        actors: ["User", "Next.js app", "Auth provider", "Database"],
        messages: [
          { from: 0, to: 1, label: "Click Sign in" },
          { from: 1, to: 2, label: "Redirect to provider" },
          { from: 2, to: 1, label: "Callback with verified identity" },
          { from: 1, to: 0, label: "Set secure session cookie" },
          { from: 0, to: 1, label: "Submit new habit" },
          { from: 1, to: 3, label: "Insert with userId from session" },
        ],
      },
    ],
    keyPoints: [
      "Use a maintained auth library or service instead of writing your own crypto.",
      "Always take the user ID from the server session, never from the request body.",
      "Filter every query by the current user so people only see their own data.",
      "Keep database credentials in server-only environment variables.",
    ],
    terms: [
      { term: "Authentication", meaning: "Verifying who the user is." },
      { term: "Authorization", meaning: "Deciding what that user is allowed to do." },
      { term: "Session", meaning: "Server-trusted record that a user is signed in." },
      { term: "OAuth", meaning: "Protocol for signing in with another provider, like GitHub." },
      { term: "ORM", meaning: "Library that maps database tables to typed code." },
    ],
    example: {
      lang: "ts",
      code: "'use server';\nimport { revalidatePath } from 'next/cache';\n\nexport async function addHabit(formData: FormData) {\n  const session = await getSession(); // from your auth library\n  if (!session) throw new Error('Not signed in');\n\n  const name = String(formData.get('name') ?? '').trim();\n  if (!name) return;\n\n  await db.habit.create({ data: { name, userId: session.user.id } });\n  revalidatePath('/habits');\n}",
      caption: "The user ID always comes from the session.",
    },
    pitfalls: [
      "Hiding a button in the UI but not checking permissions on the server.",
      "Trusting a userId sent from the client.",
      "Exposing database secrets with a NEXT_PUBLIC_ prefix.",
    ],
    check: [
      { q: "What is the difference between authentication and authorization?", a: "Authentication confirms identity; authorization decides what that identity may access or change." },
      { q: "Where should the userId for a new record come from?", a: "From the server-side session, not from form fields or the URL." },
    ],
  },

  // ───────────────────────── Styling ─────────────────────────
  "styling/tailwind": {
    summary:
      "Tailwind CSS styles elements with small utility classes like p-4 and text-lg written directly in markup. It generates only the CSS you use, from a shared theme of colors, spacing and breakpoints.",
    visuals: [
      {
        type: "flow",
        title: "How Tailwind produces CSS",
        steps: [
          { label: "Write classes", detail: "e.g. flex gap-4 md:grid-cols-3" },
          { label: "Scan source files", detail: "Tailwind finds class names in your code" },
          { label: "Generate CSS", detail: "Only the utilities you used are emitted" },
          { label: "Ship small CSS", detail: "One compact stylesheet for the whole app" },
        ],
      },
    ],
    keyPoints: [
      "Utility classes keep styles next to markup, so components are self-contained.",
      "Responsive prefixes like md: apply styles from that breakpoint up.",
      "State variants like hover: and focus-visible: style interactions.",
      "Extend the theme with your own tokens instead of hard-coding arbitrary values.",
      "Class names must appear as complete strings so the scanner can find them.",
    ],
    terms: [
      { term: "Utility class", meaning: "A class that applies one small style, like mt-4." },
      { term: "Variant", meaning: "A prefix like hover: or md: that adds a condition." },
      { term: "Theme", meaning: "Shared design values like colors, spacing and fonts." },
      { term: "Arbitrary value", meaning: "A one-off value in brackets, like w-[37px]." },
    ],
    example: {
      lang: "tsx",
      code: "export function Card({ title }: { title: string }) {\n  return (\n    <div className=\"rounded-xl border p-4 shadow-sm hover:shadow-md md:p-6\">\n      <h2 className=\"text-lg font-semibold text-gray-900 dark:text-white\">\n        {title}\n      </h2>\n      <button className=\"mt-4 rounded bg-blue-600 px-3 py-2 text-white focus-visible:outline-2\">\n        Open\n      </button>\n    </div>\n  );\n}",
      caption: "Spacing, hover, responsive and dark variants in markup.",
    },
    pitfalls: [
      "Building class names dynamically like 'text-' + color, which the scanner cannot see.",
      "Copying long class lists everywhere instead of extracting a component.",
    ],
    check: [
      { q: "What does md:p-6 mean?", a: "Apply padding 6 from the md breakpoint and wider." },
      { q: "Why can bg-${color}-500 fail?", a: "Tailwind only sees full class names in source, so dynamically built ones are never generated." },
    ],
  },

  "styling/design-system": {
    summary:
      "A design system is a shared set of tokens and components that keeps UI consistent. Tokens define values like colors and spacing; primitives like Button and Input use them and handle accessibility once.",
    visuals: [
      {
        type: "layers",
        title: "Layers of a design system",
        layers: [
          { label: "Pages", detail: "Screens assembled from patterns" },
          { label: "Patterns", detail: "Forms, cards, dialogs built from primitives" },
          { label: "Primitives", detail: "Button, Input, Card with variants and states" },
          { label: "Design tokens", detail: "Color, spacing, radius and type scale values" },
        ],
      },
    ],
    keyPoints: [
      "Name tokens by purpose, like color-danger, not by value, like red-500.",
      "Give primitives a small set of variants and sizes instead of endless props.",
      "Build focus styles, labels and keyboard support into primitives once.",
      "Document each variant with an example so the team uses them consistently.",
    ],
    terms: [
      { term: "Design token", meaning: "A named design value, like spacing-4 or color-primary." },
      { term: "Primitive", meaning: "A basic reusable component, like Button or Input." },
      { term: "Variant", meaning: "A predefined style option, like primary or ghost." },
      { term: "Component library", meaning: "A shared, documented set of UI components." },
    ],
    example: {
      lang: "tsx",
      code: "type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {\n  variant?: 'primary' | 'secondary';\n};\n\nconst styles = {\n  primary: 'bg-brand text-white hover:bg-brand-dark',\n  secondary: 'border border-gray-300 text-gray-900',\n};\n\nexport function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {\n  const base = 'rounded px-4 py-2 focus-visible:outline-2';\n  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;\n}",
      caption: "A typed Button primitive with variants and native props.",
    },
    pitfalls: [
      "Creating a new one-off button style on every page.",
      "Building custom controls from divs and losing keyboard support.",
    ],
    check: [
      { q: "Why name tokens by purpose instead of value?", a: "So you can change the actual value, such as the brand color, without renaming everywhere." },
      { q: "Why spread ...rest onto the native button?", a: "It passes through standard props like type, disabled and aria attributes." },
    ],
  },

  "styling/dark-mode": {
    summary:
      "Theming stores colors in CSS variables and swaps their values per theme. Respect the user's system preference by default, and let them override it with a toggle that is remembered.",
    visuals: [
      {
        type: "flow",
        title: "Choosing the active theme",
        steps: [
          { label: "Saved choice?", detail: "Read the user's stored theme, if any" },
          { label: "System preference", detail: "Otherwise use prefers-color-scheme" },
          { label: "Set data-theme", detail: "Put the theme on the html element" },
          { label: "Variables switch", detail: "CSS variables change, every component updates" },
        ],
      },
    ],
    keyPoints: [
      "Define colors once as CSS variables and redefine them for dark mode.",
      "prefers-color-scheme reads the operating system's light or dark setting.",
      "Apply the saved theme before first paint to avoid a flash of the wrong theme.",
      "Check contrast in both themes, not just light.",
    ],
    terms: [
      { term: "CSS variable", meaning: "A custom property like --bg that can change at runtime." },
      { term: "prefers-color-scheme", meaning: "Media query for the user's system light or dark setting." },
      { term: "data-theme", meaning: "An attribute used to select the active theme in CSS." },
      { term: "FOUC", meaning: "Flash of unstyled or wrong-themed content before scripts run." },
    ],
    example: {
      lang: "css",
      code: ":root { --bg: #ffffff; --text: #111827; }\n\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme='light']) { --bg: #0b0f19; --text: #e5e7eb; }\n}\n\n:root[data-theme='dark'] { --bg: #0b0f19; --text: #e5e7eb; }\n\nbody {\n  background: var(--bg);\n  color: var(--text);\n}",
      caption: "System preference by default, with a manual override.",
    },
    pitfalls: [
      "Hard-coding colors in components, so they ignore the theme.",
      "Reading localStorage after render and flashing the wrong theme.",
    ],
    check: [
      { q: "Why use CSS variables for theming?", a: "Components reference one variable, so switching themes only changes the variable values." },
      { q: "What should happen if the user never chose a theme?", a: "Follow their system preference via prefers-color-scheme." },
    ],
  },

  // ───────────────────────── Testing ─────────────────────────
  "testing/vitest": {
    summary:
      "Unit tests check small pieces of logic, like utilities and hooks, in isolation. Vitest runs them fast with a Jest-compatible API and re-runs affected tests as you save.",
    visuals: [
      {
        type: "flow",
        title: "Anatomy of a unit test",
        steps: [
          { label: "Arrange", detail: "Set up inputs, mocks and fake timers" },
          { label: "Act", detail: "Call the function or hook under test" },
          { label: "Assert", detail: "Check the result with expect" },
          { label: "Clean up", detail: "Restore mocks and real timers" },
        ],
      },
    ],
    keyPoints: [
      "Pure functions are the easiest and most valuable things to unit test.",
      "Test behaviour and edge cases, such as empty input and boundaries.",
      "vi.mock replaces a module, and vi.useFakeTimers controls time.",
      "Test hooks with renderHook from Testing Library.",
    ],
    terms: [
      { term: "Unit test", meaning: "A test of one small piece of code in isolation." },
      { term: "expect", meaning: "Assertion function, like expect(x).toBe(3)." },
      { term: "Mock", meaning: "A fake replacement for a dependency." },
      { term: "Fake timers", meaning: "Simulated time so tests do not actually wait." },
      { term: "Watch mode", meaning: "Re-running tests automatically when files change." },
    ],
    example: {
      lang: "ts",
      code: "import { describe, it, expect } from 'vitest';\n\nexport function slugify(s: string) {\n  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');\n}\n\ndescribe('slugify', () => {\n  it('lowercases and joins words', () => {\n    expect(slugify('Hello World')).toBe('hello-world');\n  });\n  it('strips symbols and edges', () => {\n    expect(slugify('  React & Next!  ')).toBe('react-next');\n  });\n});",
      caption: "Two focused tests for a pure utility.",
    },
    pitfalls: [
      "Testing implementation details that break on every refactor.",
      "Forgetting to restore mocks, so one test affects another.",
    ],
    check: [
      { q: "What are the three main steps of a test?", a: "Arrange the inputs, act by calling the code, and assert on the result." },
      { q: "How do you test a debounce without waiting in real time?", a: "Use fake timers and advance them with vi.advanceTimersByTime." },
    ],
  },

  "testing/rtl": {
    summary:
      "Testing Library renders components and lets tests interact with them like a user would: finding elements by role and label, typing and clicking. Tests that avoid internals survive refactors.",
    visuals: [
      {
        type: "sequence",
        title: "A component test",
        actors: ["Test", "Rendered DOM", "Component"],
        messages: [
          { from: 0, to: 2, label: "render(<LoginForm />)" },
          { from: 0, to: 1, label: "getByLabelText('Email')" },
          { from: 0, to: 1, label: "user.type and user.click" },
          { from: 1, to: 2, label: "Events trigger handlers" },
          { from: 2, to: 1, label: "Re-render with error text" },
          { from: 0, to: 1, label: "Expect alert to be visible" },
        ],
      },
    ],
    keyPoints: [
      "Query by role, label or text first; use test IDs only as a last resort.",
      "user-event simulates real typing and clicking more faithfully than fireEvent.",
      "Use findBy queries to wait for content that appears asynchronously.",
      "Assert on what users see, not on state or component internals.",
    ],
    terms: [
      { term: "getByRole", meaning: "Finds an element by its accessible role, like button." },
      { term: "getByLabelText", meaning: "Finds a form control by its label text." },
      { term: "findBy", meaning: "Async query that waits for an element to appear." },
      { term: "user-event", meaning: "Library that simulates realistic user interactions." },
      { term: "jsdom", meaning: "A simulated browser DOM that runs in Node for tests." },
    ],
    example: {
      lang: "tsx",
      code: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { expect, it } from 'vitest';\nimport { LoginForm } from './LoginForm';\n\nit('shows an error for an invalid email', async () => {\n  const user = userEvent.setup();\n  render(<LoginForm />);\n  await user.type(screen.getByLabelText(/email/i), 'nope');\n  await user.click(screen.getByRole('button', { name: /sign in/i }));\n  expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);\n});",
      caption: "Find by label and role, act like a user, assert on visible text.",
    },
    pitfalls: [
      "Querying by CSS class, which ties tests to styling.",
      "Using getBy for content that loads later instead of findBy.",
    ],
    check: [
      { q: "Why prefer getByRole over getByTestId?", a: "It mirrors how users and assistive tech find elements, and it also checks accessibility." },
      { q: "When should you use findBy instead of getBy?", a: "When the element appears after an async update, such as after a fetch." },
    ],
  },

  "testing/playwright": {
    summary:
      "End-to-end tests drive a real browser through your running app, covering full user flows like signing in and checking out. Playwright auto-waits for elements and runs in CI on every push.",
    visuals: [
      {
        type: "sequence",
        title: "An E2E test run",
        actors: ["Playwright test", "Real browser", "Your app"],
        messages: [
          { from: 0, to: 1, label: "Launch and goto('/login')" },
          { from: 1, to: 2, label: "Request page" },
          { from: 2, to: 1, label: "Render login form" },
          { from: 0, to: 1, label: "Fill fields, click Sign in" },
          { from: 1, to: 2, label: "Submit credentials" },
          { from: 2, to: 1, label: "Redirect to dashboard" },
          { from: 0, to: 1, label: "Expect heading visible" },
        ],
      },
    ],
    keyPoints: [
      "Test a few critical flows end to end; cover details with faster unit tests.",
      "Locators like getByRole auto-wait, so avoid fixed sleeps.",
      "codegen records your clicks into a starting test script.",
      "Run tests headless in CI and keep traces to debug failures.",
    ],
    terms: [
      { term: "E2E test", meaning: "A test of a full user flow through the real app." },
      { term: "Locator", meaning: "A Playwright handle for finding elements, retried automatically." },
      { term: "Auto-waiting", meaning: "Waiting for elements to be ready before acting." },
      { term: "Headless", meaning: "Running a browser without a visible window." },
      { term: "Trace viewer", meaning: "Tool replaying a test step by step with screenshots." },
    ],
    example: {
      lang: "ts",
      code: "import { test, expect } from '@playwright/test';\n\ntest('user can sign in', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill('demo@example.com');\n  await page.getByLabel('Password').fill('correct-horse');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();\n});\n\n// Run: npx playwright test\n// Record: npx playwright codegen localhost:3000",
      caption: "A sign-in flow using role and label locators.",
    },
    pitfalls: [
      "Using waitForTimeout instead of relying on auto-waiting assertions.",
      "Writing E2E tests for every edge case, making the suite slow and flaky.",
    ],
    check: [
      { q: "Why avoid fixed sleeps in Playwright tests?", a: "They are slow and flaky; locators and expect already wait for the right state." },
      { q: "What should E2E tests focus on?", a: "A small number of critical user flows, like sign-in and the main task." },
    ],
  },

  // ───────────────────────── Deploy ─────────────────────────
  "deploy/web-vitals": {
    summary:
      "Core Web Vitals are three user-centred metrics: loading speed, responsiveness and visual stability. Lighthouse and real-user data show which one is weakest so you fix the biggest problem first.",
    visuals: [
      {
        type: "compare",
        title: "The three Core Web Vitals",
        columns: [
          { title: "LCP", points: ["Largest Contentful Paint", "Loading: when main content shows", "Good: 2.5 s or less", "Fix: optimise hero image, server time"] },
          { title: "INP", points: ["Interaction to Next Paint", "Responsiveness to clicks and keys", "Good: 200 ms or less", "Fix: break up long JavaScript tasks"] },
          { title: "CLS", points: ["Cumulative Layout Shift", "Visual stability while loading", "Good: 0.1 or less", "Fix: set image sizes, reserve space"] },
        ],
      },
    ],
    keyPoints: [
      "Lab data from Lighthouse is for debugging; field data shows real users.",
      "The LCP element is usually a hero image or large heading.",
      "Long main-thread tasks hurt INP; ship less JavaScript and split work.",
      "Give images and embeds dimensions so content does not jump.",
    ],
    terms: [
      { term: "LCP", meaning: "Time until the largest visible element renders." },
      { term: "INP", meaning: "How quickly the page responds visually to user input." },
      { term: "CLS", meaning: "How much visible content shifts unexpectedly." },
      { term: "Lighthouse", meaning: "Chrome tool that audits performance and accessibility." },
      { term: "Field data", meaning: "Metrics collected from real users' browsers." },
    ],
    pitfalls: [
      "Optimising for a Lighthouse score on a fast laptop instead of real devices.",
      "Lazy loading the hero image, which delays LCP.",
    ],
    check: [
      { q: "A page jumps when an ad loads. Which metric suffers?", a: "CLS, cumulative layout shift." },
      { q: "What usually improves INP?", a: "Reducing and splitting long JavaScript tasks so the main thread can respond quickly." },
    ],
  },

  "deploy/deploy-ci": {
    summary:
      "Continuous deployment builds and ships your app on every push. Each pull request gets a preview URL and automated checks, and merging to main deploys to production.",
    visuals: [
      {
        type: "flow",
        title: "From push to production",
        steps: [
          { label: "Push branch", detail: "Open a pull request" },
          { label: "CI checks", detail: "Lint, type check, unit and E2E tests" },
          { label: "Preview deploy", detail: "Unique URL to review the change" },
          { label: "Merge to main", detail: "Only after checks pass and review" },
          { label: "Production deploy", detail: "Same build steps, production env vars" },
        ],
      },
    ],
    keyPoints: [
      "Set environment variables separately for development, preview and production.",
      "Never commit secrets; store them in the hosting platform's settings.",
      "Make CI checks required so failing pull requests cannot merge.",
      "Only variables prefixed NEXT_PUBLIC_ reach the browser in Next.js.",
    ],
    terms: [
      { term: "CI", meaning: "Continuous integration: automatic checks on every change." },
      { term: "CD", meaning: "Continuous deployment: automatic release after checks pass." },
      { term: "Preview deployment", meaning: "A temporary live URL for a branch or pull request." },
      { term: "Environment variable", meaning: "Config value set outside code, like an API key." },
    ],
    example: {
      lang: "yaml",
      code: "# .github/workflows/ci.yml\nname: CI\non: [pull_request]\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci\n      - run: npm run lint\n      - run: npx tsc --noEmit\n      - run: npm test",
      caption: "Lint, type check and test on every pull request.",
    },
    pitfalls: [
      "Using production database credentials in preview deployments.",
      "Letting merges through when CI is red.",
    ],
    check: [
      { q: "What is a preview deployment for?", a: "Reviewing a branch's changes on a real URL before merging to production." },
      { q: "Why use npm ci instead of npm install in CI?", a: "It installs exactly what the lockfile says, making builds reproducible." },
    ],
  },

  // ───────────────────────── Capstone ─────────────────────────
  "fe-capstone/fe-capstone-design": {
    summary:
      "Planning before coding saves rework. Sketch each page, list the routes, define a typed data model and plan the component tree so the build follows a clear map.",
    visuals: [
      {
        type: "flow",
        title: "Design before you build",
        steps: [
          { label: "Wireframes", detail: "Rough sketches of every page and state" },
          { label: "Route map", detail: "URLs, layouts and which pages need auth" },
          { label: "Data model", detail: "TypeScript types and database tables" },
          { label: "Component tree", detail: "Server vs client components per page" },
        ],
      },
      {
        type: "tree",
        title: "Example: habit tracker routes",
        root: "app/",
        children: [
          { label: "/ (landing)" },
          { label: "/login" },
          { label: "/habits", children: ["HabitList", "AddHabitForm"] },
          { label: "/habits/[id]", children: ["HabitStats", "CheckInCalendar"] },
        ],
      },
    ],
    keyPoints: [
      "Sketch empty, loading and error states, not just the happy path.",
      "Write the data model as TypeScript types before creating tables.",
      "Mark which components need interactivity; the rest stay server components.",
      "Keep scope small enough to finish, deploy and polish.",
    ],
    terms: [
      { term: "Wireframe", meaning: "A low-detail sketch of a page's layout." },
      { term: "Route map", meaning: "A list of all URLs and what each shows." },
      { term: "Data model", meaning: "The entities, fields and relationships your app stores." },
      { term: "MVP", meaning: "Minimum viable product: the smallest useful version." },
    ],
    example: {
      lang: "ts",
      code: "export type User = { id: string; email: string };\n\nexport type Habit = {\n  id: string;\n  userId: string;\n  name: string;\n  createdAt: Date;\n};\n\nexport type CheckIn = {\n  id: string;\n  habitId: string;\n  date: string; // YYYY-MM-DD\n};",
      caption: "A typed data model for a habit tracker.",
    },
    pitfalls: [
      "Starting to code without deciding which data each page needs.",
      "Planning too many features to finish in the time available.",
    ],
    check: [
      { q: "Why define TypeScript types before building pages?", a: "Pages, actions and the database then share one agreed shape, catching mismatches early." },
      { q: "Which page states should a wireframe include besides success?", a: "Empty, loading and error states." },
    ],
  },

  "fe-capstone/fe-capstone-build": {
    summary:
      "The capstone combines everything into one deployed app: typed pages, auth, a database, server actions, tests and good performance. Build in thin vertical slices so something works end to end early.",
    visuals: [
      {
        type: "layers",
        title: "The finished app stack",
        layers: [
          { label: "UI", detail: "Pages, layouts and Tailwind components" },
          { label: "Server logic", detail: "Server components and server actions with Zod" },
          { label: "Auth", detail: "Sessions protect pages and actions" },
          { label: "Database", detail: "Hosted Postgres or similar, per-user rows" },
          { label: "Quality gate", detail: "Vitest, Playwright and Lighthouse in CI" },
        ],
      },
      {
        type: "cycle",
        title: "Build in vertical slices",
        steps: [
          { label: "Pick one feature", detail: "e.g. add a habit" },
          { label: "Build UI to DB", detail: "Form, action, table, list" },
          { label: "Test it", detail: "Unit or E2E test for the flow" },
          { label: "Deploy preview", detail: "Check it works on a real URL" },
        ],
      },
    ],
    keyPoints: [
      "Deploy on day one, then keep every merge deployable.",
      "Finish one feature end to end before starting the next.",
      "Cover sign-in and the main task with E2E tests.",
      "Aim for strong Lighthouse scores on mobile, not just desktop.",
      "Write a README with a live link, screenshots and setup steps.",
    ],
    terms: [
      { term: "Vertical slice", meaning: "A feature built through every layer, from UI to database." },
      { term: "Scaffold", meaning: "Generating a starter project, like create-next-app." },
      { term: "Migration", meaning: "A versioned change to the database schema." },
      { term: "Seed data", meaning: "Sample records loaded for development and demos." },
    ],
    example: {
      lang: "bash",
      code: "npx create-next-app@latest habit-tracker --ts --tailwind --app --eslint\ncd habit-tracker\nnpm install zod\nnpm install -D vitest @testing-library/react @playwright/test\nnpm run dev",
      caption: "Scaffold a typed Next.js app with Tailwind and test tools.",
    },
    pitfalls: [
      "Building all UI first and wiring up data at the end.",
      "Leaving deployment until the last day and hitting config surprises.",
    ],
    check: [
      { q: "What is a vertical slice?", a: "One feature built through every layer, from UI through server logic to the database, so it fully works." },
      { q: "Why deploy early?", a: "It surfaces environment, build and config problems while they are small and easy to fix." },
    ],
  },
};

export default explainers;
