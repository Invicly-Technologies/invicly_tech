import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "styling/tailwind": {
    plain: [
      "Normally you write CSS in one file and class names in another, then jump between them. Tailwind turns this around. It gives you thousands of tiny ready-made classes, each doing one job: p-4 adds padding, text-lg makes text bigger, rounded-xl rounds the corners. You put them straight on the element.",
      "This sounds messy at first, but it has a big benefit. Everything about how a component looks is in one place, so you can change it without fear of breaking another page. You also stop inventing class names like card-wrapper-inner.",
      "Tailwind only ships the classes you actually use. It reads your source files, finds the class names, and builds one small CSS file. A huge site often ends up with a stylesheet of just a few kilobytes after compression.",
      "The values come from a shared theme: one spacing scale, one color palette, one set of screen sizes. Because everyone picks from the same menu, the whole app looks consistent, and changing a brand color is a one-line edit.",
    ],
    deepDive: [
      {
        heading: "Setting up Tailwind v4 in Next.js",
        body: "Tailwind v4 is configured in CSS, not in a JavaScript file. If you run create-next-app and answer yes to Tailwind, it is set up for you. To add it by hand, install tailwindcss and @tailwindcss/postcss, add the plugin to postcss.config.mjs, and put one line at the top of app/globals.css: @import \"tailwindcss\". The root layout imports globals.css, so every page gets the styles.\n\nYou no longer list your files in a content array. Tailwind v4 detects source files automatically and skips anything in .gitignore. If classes live somewhere it cannot see, such as a UI package inside node_modules, add an @source line pointing at that folder.",
        bullets: [
          "npm install tailwindcss @tailwindcss/postcss postcss",
          "postcss.config.mjs: plugins: { \"@tailwindcss/postcss\": {} }",
          "globals.css: @import \"tailwindcss\";",
          "@source \"../node_modules/my-ui\"; scans extra folders",
        ],
        visual: {
          type: "flow",
          title: "Where Tailwind fits in a Next.js build",
          steps: [
            { label: "globals.css", detail: "Starts with @import \"tailwindcss\"" },
            { label: "PostCSS plugin", detail: "@tailwindcss/postcss runs during the build" },
            { label: "Source scan", detail: "Finds class names in app and components" },
            { label: "Generated CSS", detail: "Only used utilities plus theme variables" },
            { label: "Root layout", detail: "Imports globals.css for every route" },
          ],
        },
      },
      {
        heading: "How variants stack",
        body: "A variant is a prefix that adds a condition. You can chain them, and they read left to right: md:hover:bg-blue-700 means on medium screens and wider, when hovered. Breakpoints are mobile first. A class without a prefix applies everywhere, and md: kicks in from 48rem (768px) up. The defaults are sm 40rem, md 48rem, lg 64rem, xl 80rem and 2xl 96rem.\n\nTo target only small screens, use max-md:, which applies below md. There are also state variants (focus-visible:, disabled:, aria-expanded:), parent and sibling variants (group-hover: and peer-invalid:), and container queries: mark a parent with @container and use @md: on children so a card responds to its own width, not the window.",
        bullets: [
          "Unprefixed classes are the mobile style; add md: and lg: for bigger screens",
          "max-md:hidden hides an element below the md breakpoint",
          "group on a parent plus group-hover:underline on a child",
          "peer on an input plus peer-invalid:block on its error message",
        ],
      },
      {
        heading: "The theme is just CSS variables",
        body: "In v4 you extend the theme with an @theme block in your CSS. Each variable you add creates utilities. --color-brand: oklch(0.55 0.2 260) gives you bg-brand, text-brand, border-brand and so on. --font-display creates font-display, and --breakpoint-3xl: 120rem creates a 3xl: variant.\n\nSpacing works from one base value, --spacing, which is 0.25rem by default. p-4 is 4 times that, so 1rem. Every theme value is also a real CSS variable at runtime, so you can use var(--color-brand) in plain CSS or inline styles.\n\nFor one-off values use arbitrary values in square brackets, like w-[37px] or grid-cols-[200px_1fr], where an underscore means a space. If you write the same arbitrary value twice, it probably belongs in the theme.",
        bullets: [
          "@theme { --color-brand: oklch(0.55 0.2 260); }",
          "bg-(--my-var) uses a CSS variable directly",
          "@utility defines your own utility that works with variants",
        ],
      },
      {
        heading: "Keeping class lists maintainable",
        body: "Long class lists are fine inside a component, but repeated lists are a smell. The main fix is to make a component, not a CSS class: one Button component holds the classes once, and every page uses it.\n\nWhen classes depend on props, never build names from pieces like \"bg-\" + color, because the scanner only sees complete strings. Use a lookup object that maps each variant to full class names. Two small libraries help: clsx joins classes conditionally, and tailwind-merge resolves conflicts so a passed-in p-2 replaces the default p-4 instead of fighting it. Many teams wrap them in a helper called cn. The official Prettier plugin, prettier-plugin-tailwindcss, sorts classes into a consistent order.",
        bullets: [
          "Map props to full class strings: { primary: \"bg-blue-600\", danger: \"bg-red-600\" }",
          "cn(...inputs) = twMerge(clsx(inputs)) is a common helper",
          "@apply exists, but use it sparingly, mostly for third-party markup",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to style the same card",
        columns: [
          { title: "Plain CSS file", points: ["Class names you invent", "Styles live in another file", "Easy to leave dead CSS behind", "Global names can clash"] },
          { title: "CSS Modules", points: ["Scoped class names per file", "Still a separate stylesheet", "No shared scale unless you add one", "Built into Next.js"] },
          { title: "Tailwind utilities", points: ["Classes from a shared theme", "Styles sit on the markup", "Unused CSS is never generated", "Reuse by making components"] },
        ],
      },
    ],
    examples: [
      {
        title: "A responsive product grid",
        explanation: "You want one column on phones, two on tablets and four on desktops, with the gap growing on larger screens. Step 1: write the mobile layout with no prefix: grid grid-cols-1 gap-4. Step 2: add sm:grid-cols-2 for screens from 40rem. Step 3: add lg:grid-cols-4 lg:gap-6 for 64rem and up. Step 4: give each card a hover and keyboard focus style, so it works for mouse and keyboard users. Resize the browser and watch the columns change at each breakpoint.",
        code: {
          lang: "tsx",
          code: "export function ProductGrid({ items }: { items: { id: string; name: string }[] }) {\n  return (\n    <ul className=\"grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6\">\n      {items.map((p) => (\n        <li key={p.id}>\n          <a\n            href={`/products/${p.id}`}\n            className=\"block rounded-lg border p-4 hover:shadow-md focus-visible:outline-2 focus-visible:outline-blue-600\"\n          >\n            {p.name}\n          </a>\n        </li>\n      ))}\n    </ul>\n  );\n}",
        },
      },
      {
        title: "Adding brand tokens to the theme",
        explanation: "Your designer gives you a brand color, a darker hover shade and a display font. Step 1: open app/globals.css under the import line. Step 2: add an @theme block with --color-brand, --color-brand-dark and --font-display. Step 3: use them as normal classes: bg-brand, hover:bg-brand-dark, font-display. Step 4: when the brand color changes, edit one line and every button updates. The same variables are available as var(--color-brand) for any custom CSS.",
        code: {
          lang: "css",
          code: "@import \"tailwindcss\";\n\n@theme {\n  --color-brand: oklch(0.55 0.2 260);\n  --color-brand-dark: oklch(0.45 0.2 260);\n  --font-display: \"Inter\", sans-serif;\n  --breakpoint-3xl: 120rem;\n}\n\n/* Usage: <button class=\"bg-brand hover:bg-brand-dark font-display 3xl:px-8\"> */",
        },
      },
    ],
    cheatSheet: [
      "Tailwind v4 setup: @import \"tailwindcss\" in your CSS plus the @tailwindcss/postcss plugin",
      "Mobile first: no prefix applies to all sizes, md: applies from 48rem (768px) up",
      "max-md: applies only below the md breakpoint",
      "@theme { --color-x: ... } creates bg-x, text-x, border-x and a CSS variable",
      "Spacing: p-4 = 4 x --spacing (0.25rem) = 1rem",
      "Arbitrary values: w-[37px], grid-cols-[200px_1fr] (underscore means space)",
      "Never build class names from parts; map props to complete class strings",
      "cn = twMerge(clsx(...)) merges conditional classes and resolves conflicts",
    ],
    quiz: [
      {
        q: "In Tailwind v4, where do you add a custom brand color so that bg-brand works?",
        options: ["In the content array of tailwind.config.js", "In an @theme block in your CSS as --color-brand", "In next.config.ts under images", "In a style tag inside the root layout"],
        answer: 1,
        why: "v4 is configured in CSS, and each --color-* variable in @theme generates color utilities.",
      },
      {
        q: "What does the class lg:hover:underline do?",
        options: ["Underlines on hover, but only on screens 64rem and wider", "Underlines on large text only", "Underlines on hover on screens below lg", "Nothing, variants cannot be chained"],
        answer: 0,
        why: "Variants stack, so both conditions must be true: lg breakpoint or wider, and hovered.",
      },
      {
        q: "A component receives className=\"p-2\" but also has p-4 in its defaults. Which tool makes p-2 win reliably?",
        options: ["clsx", "@apply", "autoprefixer", "tailwind-merge"],
        answer: 3,
        why: "tailwind-merge understands that p-2 and p-4 conflict and keeps the last one.",
      },
      {
        q: "Your classes live in a shared UI package inside node_modules and are not generated. What is the fix?",
        options: ["Rename the files to .css", "Use only arbitrary values", "Add an @source line pointing at that package", "Turn off automatic detection by deleting .gitignore"],
        answer: 2,
        why: "Automatic detection skips ignored folders like node_modules, and @source adds paths explicitly.",
      },
      {
        q: "Why should you avoid className={\"text-\" + color + \"-600\"}?",
        options: ["It is slower at runtime", "TypeScript rejects string concatenation", "React escapes the hyphens", "The scanner never sees the full class name, so the CSS is not generated"],
        answer: 3,
        why: "Tailwind finds classes as complete strings in source, so built-up names are missed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Style a button that is blue, white text, rounded, slightly darker on hover, and shows a clear outline only for keyboard focus.",
        hint: "Use hover: for the shade and focus-visible: for the outline.",
        solution: "<button className=\"rounded-md bg-blue-600 px-4 py-2 text-white\n  hover:bg-blue-700 focus-visible:outline-2\n  focus-visible:outline-offset-2 focus-visible:outline-blue-600\">\n  Save\n</button>",
      },
      {
        level: "medium",
        task: "Build a page header that stacks the logo and nav vertically on phones and puts them side by side from md up, with the nav hidden below sm.",
        hint: "flex-col by default, md:flex-row, and max-sm:hidden on the nav.",
        solution: "<header className=\"flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between\">\n  <a href=\"/\" className=\"text-xl font-bold\">Acme</a>\n  <nav className=\"flex gap-4 max-sm:hidden\">\n    <a href=\"/docs\">Docs</a>\n    <a href=\"/blog\">Blog</a>\n  </nav>\n</header>",
      },
      {
        level: "hard",
        task: "Write an Alert component with a tone prop (info, success, danger) that maps to full class strings and lets callers override classes safely.",
        hint: "Use a lookup object and a cn helper built from clsx and tailwind-merge.",
        solution: "import { clsx } from \"clsx\";\nimport { twMerge } from \"tailwind-merge\";\nconst cn = (...c: Parameters<typeof clsx>) => twMerge(clsx(c));\nconst tones = {\n  info: \"bg-blue-50 text-blue-900 border-blue-200\",\n  success: \"bg-green-50 text-green-900 border-green-200\",\n  danger: \"bg-red-50 text-red-900 border-red-200\",\n};\nexport function Alert({ tone = \"info\", className, ...rest }:\n  React.ComponentProps<\"div\"> & { tone?: keyof typeof tones }) {\n  return <div role=\"status\" className={cn(\"rounded border p-4\", tones[tone], className)} {...rest} />;\n}",
      },
    ],
    faq: [
      { q: "Does Tailwind make my HTML too big?", a: "Class lists add some bytes, but HTML compresses very well because the same class names repeat. In practice the small CSS file usually saves more than the extra markup costs." },
      { q: "Where did tailwind.config.js go in Tailwind v4?", a: "v4 moves configuration into CSS with @theme, @source and @utility. A JavaScript config still works if you load it with @config, which helps when migrating older projects." },
      { q: "Can I use Tailwind with CSS Modules or plain CSS?", a: "Yes. They mix fine, and theme values are real CSS variables you can use anywhere. In a separate CSS Module that uses @apply, add @reference to your main stylesheet so Tailwind knows the theme." },
      { q: "Is Tailwind good for accessibility?", a: "Tailwind only handles looks. You still need semantic HTML, labels and keyboard support, but variants like focus-visible: and aria-*: make accessible states easy to style." },
    ],
  },

  "styling/design-system": {
    plain: [
      "Imagine every page in your app has a slightly different button: one is blue with round corners, one is a little darker, one forgets the focus outline. Users notice, even if they cannot say why. A design system stops this by giving the whole team one shared set of building blocks.",
      "It has two parts. Design tokens are named values: the brand color, the spacing steps, the corner radius, the font sizes. Components are the reusable pieces built from those tokens, like Button, Input and Card.",
      "The real win is that hard things are solved once. The Button already has the right focus ring, the disabled style and the loading state. The Input already connects its label and its error message for screen readers. Every new page gets that for free.",
      "You do not need a huge library to start. Five well-made components and a short list of tokens will make a small app look and feel professional.",
    ],
    deepDive: [
      {
        heading: "Three tiers of tokens",
        body: "Good token systems have layers. Base tokens hold raw values: blue-600 is a specific color, space-4 is 1rem. Semantic tokens give those values a job: color-primary points to blue-600, color-danger points to red-600, color-surface is the card background. Component tokens, used only when needed, point at semantic ones: button-bg is color-primary.\n\nComponents should use semantic tokens, never base ones. Then a rebrand changes one mapping, and dark mode simply maps color-surface to a dark value. Keep scales small and spaced on purpose, for example spacing in steps of 4px, and a type scale of five or six sizes. A small, strict menu is what makes the UI look consistent.",
        visual: {
          type: "flow",
          title: "How a token reaches a button",
          steps: [
            { label: "Base token", detail: "blue-600 = oklch(0.55 0.2 260)" },
            { label: "Semantic token", detail: "color-primary = blue-600" },
            { label: "Component token", detail: "button-bg = color-primary (optional)" },
            { label: "Component", detail: "Button uses bg-primary" },
          ],
        },
      },
      {
        heading: "Designing a primitive's API",
        body: "A primitive should feel like the native element it wraps, with a few extra options. Accept every native prop by typing it as React.ComponentProps<\"button\"> and spreading the rest onto the element, so type, disabled, onClick and aria attributes all just work. In React 19, ref is a normal prop for function components, so you no longer need forwardRef to let parents focus your Input.\n\nLimit choices on purpose: a variant prop (primary, secondary, ghost, danger) and a size prop (sm, md, lg) cover most needs. Avoid props like color or padding that let every caller invent new styles. Libraries such as class-variance-authority (cva) map variant combinations to class strings neatly. Default a Button's type to \"button\", because a button inside a form submits it by default.",
        bullets: [
          "Spread native props so the component behaves like the element",
          "Allow className for layout tweaks, merged with tailwind-merge",
          "Default type=\"button\" to avoid surprise form submits",
        ],
      },
      {
        heading: "Accessibility baked into each primitive",
        body: "Use the real element whenever one exists. A native button already handles Tab focus and activates on Enter and Space; a div with onClick does none of that. Show focus with a visible ring on focus-visible, and keep text contrast at least 4.5:1 (3:1 for large text and for borders of controls), as WCAG asks.\n\nFor Input, generate an id with useId and link the label with htmlFor. When there is an error, set aria-invalid=\"true\" and point aria-describedby at the error text so screen readers read it out. Prefer showing a disabled button with an explanation, or use aria-disabled, because a disabled button cannot be focused and users may not learn why. For complex widgets like menus, dialogs and tabs, follow the WAI-ARIA Authoring Practices or build on a tested library like Radix or React Aria.",
        bullets: [
          "Native elements first: button, a, input, select, dialog",
          "useId() links label, input, hint and error",
          "WCAG 2.2 AA asks for touch targets of at least 24 by 24 CSS pixels",
        ],
        visual: {
          type: "sequence",
          title: "How a screen reader meets an Input with an error",
          actors: ["User", "Screen reader", "Input primitive"],
          messages: [
            { from: 0, to: 1, label: "Presses Tab to the field" },
            { from: 1, to: 2, label: "Reads label via htmlFor" },
            { from: 2, to: 1, label: "aria-invalid=true" },
            { from: 1, to: 2, label: "Follows aria-describedby" },
            { from: 1, to: 0, label: "Email, invalid, Enter a valid email" },
          ],
        },
      },
      {
        heading: "Documenting variants so people use them",
        body: "A component nobody can find gets rebuilt. Storybook is the common tool: each component gets a stories file showing every variant and state (default, hover, disabled, loading, error), and the team browses them in one place. Its accessibility addon runs automatic checks on every story. Smaller projects can use a single /ui page in the app that renders every component.\n\nFor each component, write down when to use it and when not to, for example use the danger variant only for destructive actions. Keep a short changelog. When you change a primitive, every screen that uses it changes too, so visual review of the stories catches surprises before release.",
        bullets: [
          "npx storybook@latest init sets Storybook up in an existing project",
          "One story per variant and state",
          "Document do and don't usage next to each example",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A starter design system",
        root: "ui/",
        children: [
          { label: "tokens", children: ["Colors (semantic)", "Spacing scale", "Radius and shadow", "Type scale"] },
          { label: "Button", children: ["primary, secondary, ghost, danger", "sm, md, lg", "loading and disabled"] },
          { label: "Input", children: ["Label and hint", "Error state", "Linked with useId"] },
          { label: "Card", children: ["Header, body, footer", "Uses surface tokens"] },
          { label: "Docs", children: ["Story per variant", "Do and don't notes"] },
        ],
      },
    ],
    examples: [
      {
        title: "An accessible Input primitive",
        explanation: "Your forms keep forgetting to connect labels and errors. Step 1: build one Input that takes label, hint and error props. Step 2: create a stable id with useId. Step 3: link the label with htmlFor and the hint or error with aria-describedby. Step 4: set aria-invalid when there is an error, and give the error role=\"alert\" so it is announced when it appears. Now every form gets correct screen reader behavior by default.",
        code: {
          lang: "tsx",
          code: "import { useId } from \"react\";\ntype Props = React.ComponentProps<\"input\"> & { label: string; error?: string };\n\nexport function Input({ label, error, ...rest }: Props) {\n  const id = useId();\n  const errId = `${id}-err`;\n  return (\n    <div className=\"grid gap-1\">\n      <label htmlFor={id} className=\"text-sm font-medium\">{label}</label>\n      <input id={id} aria-invalid={!!error} aria-describedby={error ? errId : undefined}\n        className=\"rounded border px-3 py-2 aria-[invalid=true]:border-red-600\" {...rest} />\n      {error && <p id={errId} role=\"alert\" className=\"text-sm text-red-700\">{error}</p>}\n    </div>\n  );\n}",
        },
      },
      {
        title: "Semantic tokens that survive a rebrand",
        explanation: "Marketing changes the brand from blue to green. Step 1: your components use bg-primary and text-on-primary, never bg-blue-600. Step 2: those utilities come from semantic variables in @theme that point at base values. Step 3: change the mapping of --color-primary from the blue value to the green one. Step 4: every Button, link and badge updates in one commit, and nobody greps the codebase for blue-600.",
        code: {
          lang: "css",
          code: "@import \"tailwindcss\";\n\n@theme {\n  /* semantic tokens used by components */\n  --color-primary: oklch(0.6 0.17 150);    /* was a blue */\n  --color-on-primary: oklch(1 0 0);\n  --color-danger: oklch(0.58 0.22 27);\n  --color-surface: oklch(0.99 0 0);\n  --radius-control: 0.5rem;\n}\n\n/* Button: bg-primary text-on-primary rounded-control */",
        },
      },
    ],
    cheatSheet: [
      "Name tokens by job (primary, danger, surface), not by value (blue-600)",
      "Components use semantic tokens; semantic tokens point at base values",
      "Type primitives as React.ComponentProps<\"button\"> and spread ...rest",
      "React 19: ref is a regular prop, forwardRef is no longer required",
      "Default Button type to \"button\" so it does not submit forms by accident",
      "Text contrast 4.5:1 (3:1 for large text and control borders) per WCAG",
      "aria-invalid plus aria-describedby connect an input to its error",
      "Use Radix, React Aria or the WAI-ARIA patterns for menus, dialogs and tabs",
    ],
    quiz: [
      {
        q: "Which token name is best for a component to use?",
        options: ["blue-600", "#2563eb", "color-primary", "button-blue-dark-2"],
        answer: 2,
        why: "A semantic name describes the job, so the value can change without renaming.",
      },
      {
        q: "A Button inside a form submits the form when clicked, even though it only opens a menu. Why?",
        options: ["The default type of a button is submit", "onClick always submits forms", "React adds type=submit", "The menu uses a link"],
        answer: 0,
        why: "Buttons default to type=\"submit\" inside forms, so primitives should default to type=\"button\".",
      },
      {
        q: "How should an Input tell screen readers about its error message?",
        options: ["Make the border red", "Put the error in the placeholder", "Use a title attribute", "Set aria-invalid and link the error with aria-describedby"],
        answer: 3,
        why: "Color alone is invisible to screen readers; aria-describedby makes them read the message.",
      },
      {
        q: "Why is a div with onClick a poor replacement for a button?",
        options: ["It cannot be styled", "It is not focusable with Tab and ignores Enter and Space by default", "It renders slower", "React warns and refuses to render it"],
        answer: 1,
        why: "Native buttons bring focus and keyboard activation for free; a div needs all of it added by hand.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write three semantic color tokens (primary, danger, surface) in an @theme block and use them in a Button class list.",
        hint: "Each --color-* variable creates matching bg- and text- utilities.",
        solution: "@theme {\n  --color-primary: oklch(0.55 0.2 260);\n  --color-danger: oklch(0.58 0.22 27);\n  --color-surface: oklch(0.99 0 0);\n}\n/* <button className=\"bg-primary text-white\"> */\n/* <div className=\"bg-surface\"> */",
      },
      {
        level: "medium",
        task: "Build a typed Button with variant (primary, ghost, danger) and size (sm, md) props, native props passed through, and type defaulting to button.",
        hint: "Use two lookup objects and React.ComponentProps<\"button\">.",
        solution: "const variants = { primary: \"bg-primary text-white\", ghost: \"hover:bg-gray-100\", danger: \"bg-danger text-white\" };\nconst sizes = { sm: \"px-2 py-1 text-sm\", md: \"px-4 py-2\" };\ntype Props = React.ComponentProps<\"button\"> & {\n  variant?: keyof typeof variants; size?: keyof typeof sizes;\n};\nexport function Button({ variant = \"primary\", size = \"md\", type = \"button\", className = \"\", ...rest }: Props) {\n  return <button type={type} className={`rounded focus-visible:outline-2 ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />;\n}",
      },
      {
        level: "hard",
        task: "Add a loading state to your Button that keeps the button width, shows a spinner, blocks repeat clicks and tells screen readers it is busy.",
        hint: "Use aria-busy, disable clicks while loading, and keep the label in the DOM.",
        solution: "export function Button({ loading = false, children, onClick, ...rest }:\n  React.ComponentProps<\"button\"> & { loading?: boolean }) {\n  return (\n    <button {...rest} aria-busy={loading} aria-disabled={loading}\n      onClick={loading ? undefined : onClick} className=\"relative rounded px-4 py-2\">\n      <span className={loading ? \"invisible\" : \"\"}>{children}</span>\n      {loading && <span aria-hidden className=\"absolute inset-0 m-auto size-4 animate-spin rounded-full border-2 border-current border-t-transparent\" />}\n    </button>\n  );\n}",
      },
    ],
    faq: [
      { q: "Should I build my own components or use a library like shadcn/ui?", a: "For most apps, start from a library. shadcn/ui copies Radix-based components into your project so you own and restyle them, which gives you tested accessibility without starting from zero." },
      { q: "What is the difference between a design system and a component library?", a: "A component library is the code. A design system also includes the tokens, the usage rules and the documentation that tell people when and how to use each piece." },
      { q: "How many variants should a Button have?", a: "Usually three to five, such as primary, secondary, ghost and danger, plus two or three sizes. More than that is a sign people are inventing styles instead of following the system." },
    ],
  },

  "styling/dark-mode": {
    plain: [
      "Many people set their phone or laptop to dark mode, especially at night. A good website notices this and switches to dark colors by itself. It should also let people pick light or dark by hand, and remember that choice next time.",
      "The trick is to never write a color directly in a component. Instead, components use named colors like background and text. Those names are CSS variables. In light mode, background means white; in dark mode, the same name means almost black. Swap the values and the whole app changes at once.",
      "The browser tells you the system setting through a media query called prefers-color-scheme. Your saved choice, if any, wins over it. That choice is usually stored in localStorage or a cookie.",
      "The tricky part is timing. If your page first paints in light mode and then a script switches it to dark, users see an ugly white flash. The fix is a tiny script that sets the theme before the first paint.",
    ],
    deepDive: [
      {
        heading: "Designing dark colors, not just inverting",
        body: "Dark mode is not light mode with the colors flipped. Pure black backgrounds with pure white text cause glare and halos for many readers, so most designs use a dark grey or navy background and slightly softened text. Elevated surfaces like cards and menus get a little lighter than the page, because shadows barely show on dark backgrounds.\n\nSaturated brand colors often look too bright on dark, so you may need a lighter, less intense version. Check contrast for both themes: at least 4.5:1 for normal text. Images and illustrations may need their own versions, and you can use the picture element with a media attribute to serve a dark image.",
        bullets: [
          "Use dark grey (for example #0b0f19) rather than #000",
          "Raise surfaces with lighter fills instead of shadows",
          "Re-check contrast in both themes",
        ],
      },
      {
        heading: "Telling the browser about your theme",
        body: "The CSS property color-scheme tells the browser which themes your page supports. Set color-scheme: light dark on :root and native parts like form controls, scrollbars and the default canvas follow the active theme. When the user forces a theme, set color-scheme: dark on that theme's selector too, or native inputs stay light.\n\nModern CSS also has a light-dark() function: color: light-dark(#111, #eee) picks the first value in light scheme and the second in dark, based on color-scheme. It is supported in all major browsers since 2024. In JavaScript, window.matchMedia(\"(prefers-color-scheme: dark)\") reads the setting, and its change event fires when the user flips their system theme.",
        bullets: [
          ":root { color-scheme: light dark; }",
          "[data-theme=\"dark\"] { color-scheme: dark; }",
          "light-dark(a, b) needs color-scheme to be set",
        ],
      },
      {
        heading: "Avoiding the flash on first paint",
        body: "In a server-rendered app, the server does not know what is in the browser's localStorage. So the HTML arrives without the user's choice. If React applies the theme after hydration, the page has already painted in the wrong colors.\n\nThere are two good fixes. One: a small inline script in the head reads localStorage and sets data-theme on the html element before the body paints. Because the server HTML and the browser DOM now differ on that one attribute, add suppressHydrationWarning to the html tag. The next-themes library does exactly this for you. Two: store the choice in a cookie, read it on the server with cookies(), and render the right data-theme straight into the HTML. The cookie way makes the route dynamic, so it costs static caching.",
        visual: {
          type: "sequence",
          title: "Loading a page with a saved dark theme",
          actors: ["Server", "Browser", "Inline head script", "React"],
          messages: [
            { from: 0, to: 1, label: "HTML with no theme attribute" },
            { from: 1, to: 2, label: "Runs before body paints" },
            { from: 2, to: 1, label: "Reads localStorage, sets data-theme=dark" },
            { from: 1, to: 3, label: "Paints dark, then loads JS" },
            { from: 3, to: 1, label: "Hydrates; toggle shows Dark" },
          ],
        },
      },
      {
        heading: "Wiring Tailwind's dark variant to your toggle",
        body: "By default, Tailwind's dark: variant follows prefers-color-scheme, so dark:bg-gray-900 works with no setup. Once you add a manual toggle, you need dark: to follow your attribute instead. In Tailwind v4, add one line to your CSS: @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *)). Now dark: applies inside any element with data-theme=\"dark\".\n\nA cleaner approach for big apps is to rarely use dark: at all. Define semantic colors such as --color-bg and --color-fg in @theme, then redefine those variables under [data-theme=dark]. Components just use bg-bg and text-fg and never think about themes. Save dark: for the odd exception, like a logo that needs a different shade.",
        bullets: [
          "@custom-variant dark (&:where(.dark, .dark *)); for a class toggle",
          "Prefer semantic variables over many dark: classes",
          "A three-way toggle: light, dark, system",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Which theme wins",
        layers: [
          { label: "User's saved choice", detail: "light or dark in localStorage or a cookie" },
          { label: "System preference", detail: "prefers-color-scheme from the OS" },
          { label: "Site default", detail: "Usually light, used when nothing else is known" },
        ],
      },
    ],
    examples: [
      {
        title: "A three-way theme toggle",
        explanation: "You want Light, Dark and System options. Step 1: store the choice as \"light\", \"dark\" or \"system\" in localStorage. Step 2: to apply it, if the choice is system, read matchMedia; otherwise use the choice. Step 3: set data-theme on document.documentElement. Step 4: while on system, listen for the media query change event so the page follows the OS live. Wrap localStorage in try and catch, because it can throw in private modes.",
        code: {
          lang: "ts",
          code: "type Choice = \"light\" | \"dark\" | \"system\";\nconst mq = window.matchMedia(\"(prefers-color-scheme: dark)\");\n\nexport function applyTheme(choice: Choice) {\n  const dark = choice === \"dark\" || (choice === \"system\" && mq.matches);\n  document.documentElement.dataset.theme = dark ? \"dark\" : \"light\";\n  try { localStorage.setItem(\"theme\", choice); } catch {}\n}\n\nmq.addEventListener(\"change\", () => {\n  let saved: string | null = null;\n  try { saved = localStorage.getItem(\"theme\"); } catch {}\n  if (!saved || saved === \"system\") applyTheme(\"system\");\n});",
        },
      },
      {
        title: "No flash in the Next.js root layout",
        explanation: "Step 1: in app/layout.tsx, add a tiny script string that runs before paint and sets data-theme. Step 2: render it with dangerouslySetInnerHTML inside head, so it runs synchronously. Step 3: add suppressHydrationWarning to the html tag, because the attribute differs from the server HTML. Step 4: reload with dark saved and confirm there is no white flash, even with network throttling on.",
        code: {
          lang: "tsx",
          code: "const themeScript = `try{var t=localStorage.getItem('theme');\nvar d=t==='dark'||((!t||t==='system')&&matchMedia('(prefers-color-scheme: dark)').matches);\ndocument.documentElement.dataset.theme=d?'dark':'light'}catch(e){}`;\n\nexport default function RootLayout({ children }: { children: React.ReactNode }) {\n  return (\n    <html lang=\"en\" suppressHydrationWarning>\n      <head>\n        <script dangerouslySetInnerHTML={{ __html: themeScript }} />\n      </head>\n      <body>{children}</body>\n    </html>\n  );\n}",
        },
      },
    ],
    cheatSheet: [
      "@media (prefers-color-scheme: dark) { ... } follows the OS setting",
      ":root { color-scheme: light dark; } makes form controls and scrollbars match",
      "color: light-dark(#111, #eee) picks a value by the active color scheme",
      "matchMedia(\"(prefers-color-scheme: dark)\").matches reads the setting in JS",
      "Set the theme in an inline head script to avoid a flash of the wrong theme",
      "Add suppressHydrationWarning on html when a script changes its attributes",
      "Tailwind v4: @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));",
    ],
    quiz: [
      {
        q: "Your dark theme works, but native select boxes and scrollbars stay light. What is missing?",
        options: ["A dark: class on each select", "color-scheme: dark for the dark theme", "A prefers-reduced-motion query", "An SVG filter"],
        answer: 1,
        why: "color-scheme tells the browser to render its built-in UI in dark colors.",
      },
      {
        q: "Why does reading localStorage in a useEffect cause a white flash?",
        options: ["localStorage is slow", "useEffect runs on the server", "Effects run after the page has already painted", "React blocks CSS until hydration"],
        answer: 2,
        why: "The first paint uses the server HTML, and the effect only runs afterwards.",
      },
      {
        q: "What does Tailwind's dark: variant follow if you change nothing?",
        options: ["The user's prefers-color-scheme setting", "A class named dark on html", "A data-theme attribute", "The time of day"],
        answer: 0,
        why: "By default dark: uses the prefers-color-scheme media query; a toggle needs @custom-variant.",
      },
      {
        q: "A user chose Dark on your site but their OS is in light mode. What should the site show?",
        options: ["Light, because the OS wins", "Whatever loads first", "Light during the day only", "Dark, because an explicit choice overrides the system"],
        answer: 3,
        why: "A saved choice is more specific than the system preference, so it wins.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Define --bg and --fg for light mode, redefine them for prefers-color-scheme dark, and apply them to body.",
        hint: "One :root block and one media query block.",
        solution: ":root { --bg: #ffffff; --fg: #111827; color-scheme: light dark; }\n@media (prefers-color-scheme: dark) {\n  :root { --bg: #0b0f19; --fg: #e5e7eb; }\n}\nbody { background: var(--bg); color: var(--fg); }",
      },
      {
        level: "medium",
        task: "Extend the easy solution so a data-theme attribute on html can force light or dark, whatever the system says.",
        hint: "Guard the media query with :not([data-theme=light]) and add a [data-theme=dark] rule.",
        solution: ":root { --bg: #fff; --fg: #111827; color-scheme: light; }\n@media (prefers-color-scheme: dark) {\n  :root:not([data-theme=\"light\"]) { --bg: #0b0f19; --fg: #e5e7eb; color-scheme: dark; }\n}\n:root[data-theme=\"dark\"] { --bg: #0b0f19; --fg: #e5e7eb; color-scheme: dark; }\nbody { background: var(--bg); color: var(--fg); }",
      },
      {
        level: "hard",
        task: "Build a ThemeToggle client component that cycles light, dark, system, shows the current choice and keeps it after reload without a flash.",
        hint: "Pair it with an inline head script; the component only updates state, the attribute and storage.",
        solution: "\"use client\"; import { useEffect, useState } from \"react\";\nconst order = [\"light\", \"dark\", \"system\"] as const; type C = (typeof order)[number];\nexport function ThemeToggle() {\n  const [c, setC] = useState<C>(\"system\");\n  useEffect(() => { try { setC((localStorage.getItem(\"theme\") as C) || \"system\"); } catch {} }, []);\n  function next() {\n    const n = order[(order.indexOf(c) + 1) % 3]; setC(n);\n    const dark = n === \"dark\" || (n === \"system\" && matchMedia(\"(prefers-color-scheme: dark)\").matches);\n    document.documentElement.dataset.theme = dark ? \"dark\" : \"light\";\n    try { localStorage.setItem(\"theme\", n); } catch {} }\n  return <button type=\"button\" onClick={next} aria-label={`Theme: ${c}`}>{c}</button>;\n}",
      },
    ],
    faq: [
      { q: "Should I use next-themes or write my own?", a: "next-themes is small, handles the inline script, system changes and syncing across tabs, so it is a good default. Writing your own is fine for learning and takes about 20 lines." },
      { q: "Is dark mode better for the eyes or the battery?", a: "It can save battery on OLED screens, where black pixels are off. For reading comfort it depends on the person and the room, which is why letting users choose matters." },
      { q: "Should I store the theme in localStorage or a cookie?", a: "localStorage is simplest and keeps pages static. A cookie lets the server render the right theme directly, but reading cookies makes those routes dynamic in Next.js." },
    ],
  },
};

export default extra;
