import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "react/react-components": {
    plain: [
      "A web page has many parts: a header, a search bar, a list of products, a footer. React lets you build each part as its own small piece of code, called a component. Then you put the pieces together, like building a house from bricks.",
      "A component is just a JavaScript function. It returns a description of what should appear on screen, written in JSX, which looks like HTML inside JavaScript. React reads that description and updates the real page for you.",
      "Components take inputs called props, short for properties. A ProductCard might take a title and a price. The same component can show a mug or a T-shirt, depending on the props you give it. Props go one way only: from the parent down to the child.",
      "The skill that matters most is splitting a design into components. Draw boxes around each part of the mockup. If a box repeats, or does one clear job, it is probably a component. Good components are small, focused and easy to reuse.",
    ],
    deepDive: [
      {
        heading: "What JSX turns into",
        body: "Browsers do not understand JSX. A compiler (SWC in Next.js, esbuild or Babel elsewhere) turns each tag into a function call. With the modern JSX transform, an h2 with some text becomes a call to jsx(\"h2\", { children: title }), imported automatically from react/jsx-runtime. The result is a plain JavaScript object called a React element, which describes what you want, not the real DOM node.\n\nThis explains the JSX rules. Curly braces hold any JavaScript expression, but not statements like if or for. A component must return one root, or a Fragment to group siblings without an extra div. Attributes use JavaScript names: className instead of class, htmlFor instead of for, onClick in camelCase, and style takes an object such as style={{ marginTop: 8 }}.",
        visual: {
          type: "flow",
          title: "From JSX to the page",
          steps: [
            { label: "JSX in a .tsx file", detail: "Looks like HTML with curly-brace values" },
            { label: "Compiler", detail: "Turns tags into jsx() function calls" },
            { label: "React elements", detail: "Plain objects describing the UI" },
            { label: "React DOM", detail: "Compares with the last render" },
            { label: "Real DOM", detail: "Only the changed nodes are updated" },
          ],
        },
      },
      {
        heading: "Props in practice",
        body: "Props are a single object passed to your function, so you usually destructure them: function Avatar({ name, size = 40 }). Default values cover optional props. Props are read-only. If a child needs to change something, the parent passes down a function, such as onSelect, and the child calls it.\n\nFor wrapper components, accept the native props too. Typing props as ComponentProps of \"button\" plus your own fields lets callers pass disabled, type or aria-label, and you forward them with a rest spread. In React 19, ref is a normal prop for function components, so a wrapper can receive and pass a ref without the old forwardRef helper. The key prop is special: React uses it and does not pass it to your component.",
        bullets: ["Destructure props and give defaults", "Pass functions down so children can ask for changes", "Forward native props with ...rest", "React 19: ref is a regular prop"],
      },
      {
        heading: "children and composition",
        body: "Anything you put between a component's opening and closing tags arrives as the children prop. This makes layout components easy: a Card can draw the border and padding while the caller decides what goes inside. Typed as ReactNode, children accepts text, elements, arrays, or nothing.\n\nWhen you need more than one hole, use named slot props: a Dialog with title, children and footer props, each a ReactNode. Composition often removes the need for deep prop passing. Instead of passing user through Layout and Sidebar just so Avatar can use it, the page renders Layout with the Avatar already inside it as children. The middle components never need to know about user.",
      },
      {
        heading: "Breaking a mockup into components",
        body: "The React docs call this Thinking in React. First, draw boxes around every part of the design and name them. A good rule is one component, one job. Second, arrange the boxes into a hierarchy: boxes inside other boxes become children. Third, build a static version that only renders props, with no interactivity. This is quick and shows whether your split works.\n\nOnly then decide which data changes over time and must be state, and which component should own it. Look at the shape of your data too: if the API returns categories, each with products, a CategorySection containing ProductRows probably mirrors it nicely.",
        visual: {
          type: "flow",
          title: "From mockup to components",
          steps: [
            { label: "Draw boxes", detail: "One box per distinct or repeated part" },
            { label: "Name and nest", detail: "Inner boxes become child components" },
            { label: "Static version", detail: "Render from props only, no state" },
            { label: "Find the state", detail: "What changes over time?" },
            { label: "Place the state", detail: "Closest common parent of its users" },
          ],
        },
      },
      {
        heading: "Components must be pure",
        body: "React expects components to behave like pure functions during rendering: the same props and state should always produce the same JSX, and rendering must not change anything outside the component. Do not edit global variables, mutate props, start network requests or write to localStorage in the function body.\n\nReact relies on this. It may render a component more than once, pause a render, or throw one away. In development, Strict Mode renders every component twice on purpose so that impure code shows up as odd behavior early. Side effects belong in event handlers, which run because the user did something, or in effects, which run after rendering.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Who owns what",
        columns: [
          { title: "Props", points: ["Passed in by the parent", "Read-only for the child", "Change when the parent re-renders", "Like function arguments"] },
          { title: "children", points: ["Content between the tags", "Chosen by the caller", "Lets wrappers stay generic", "Typed as ReactNode"] },
          { title: "State", points: ["Owned by the component itself", "Changed with a setter", "Survives re-renders", "Covered in the next topic"] },
        ],
      },
    ],
    examples: [
      {
        title: "A Card with slots",
        explanation: "Many screens need the same box with a title, a body and an optional footer. Step 1: make Card take title, children and an optional footer, all ReactNode. Step 2: Card only handles the frame and spacing. Step 3: each page fills the slots with its own content. The settings page and the billing page share one look, but neither Card nor its callers know about each other's data.",
        code: {
          lang: "tsx",
          code: "import type { ReactNode } from \"react\";\n\ntype CardProps = { title: ReactNode; children: ReactNode; footer?: ReactNode };\n\nexport function Card({ title, children, footer }: CardProps) {\n  return (\n    <section className=\"card\">\n      <h2 className=\"card-title\">{title}</h2>\n      <div className=\"card-body\">{children}</div>\n      {footer && <footer className=\"card-footer\">{footer}</footer>}\n    </section>\n  );\n}\n\n// <Card title=\"Plan\" footer={<a href=\"/billing\">Change</a>}>Pro, $12/month</Card>",
        },
      },
      {
        title: "A Button that behaves like a real button",
        explanation: "A custom Button should still accept everything a native button does. Step 1: type the props as the native button props plus a variant. Step 2: pull out the fields you handle and collect the rest. Step 3: spread the rest onto the button, so type, disabled, onClick, aria-label and even ref (a plain prop in React 19) just work. Callers never have to ask you to add another prop.",
        code: {
          lang: "tsx",
          code: "import type { ComponentProps } from \"react\";\n\ntype ButtonProps = ComponentProps<\"button\"> & {\n  variant?: \"primary\" | \"ghost\";\n};\n\nexport function Button({ variant = \"primary\", className = \"\", ...rest }: ButtonProps) {\n  return <button type=\"button\" className={`btn btn-${variant} ${className}`} {...rest} />;\n}\n\n// <Button variant=\"ghost\" onClick={close} aria-label=\"Close\">X</Button>",
        },
      },
    ],
    cheatSheet: [
      "Component names start with a capital letter; lowercase tags are HTML elements",
      "Use className, htmlFor and camelCase event names like onClick in JSX",
      "Return one root element, or wrap siblings in a Fragment",
      "Props are read-only; pass a callback like onChange so children can request changes",
      "Type children as ReactNode to accept text, elements or nothing",
      "Spread ...rest to forward native props such as disabled and aria-label",
      "React 19: function components receive ref as a normal prop, no forwardRef needed",
      "Keep rendering pure: no fetches, timers or mutations in the component body",
    ],
    quiz: [
      {
        q: "What does JSX like an h1 with the text Hi compile to?",
        options: ["A string of HTML", "A real DOM node", "A call that creates a plain React element object", "A CSS rule"],
        answer: 2,
        why: "The compiler turns tags into jsx() calls that return lightweight element objects.",
      },
      {
        q: "A child component needs to change a value its parent owns. What is the React way?",
        options: ["The parent passes a callback prop that the child calls", "The child edits props.value directly", "The child uses a global variable", "The child re-renders the parent with forceUpdate"],
        answer: 0,
        why: "Props are read-only; data flows down and change requests flow up through callbacks.",
      },
      {
        q: "Why does React render components twice in development Strict Mode?",
        options: ["To make apps faster", "Because of a bug in React", "To warm up the cache", "To reveal impure rendering code early"],
        answer: 3,
        why: "A pure component gives the same result twice; side effects in render show up as strange behavior.",
      },
      {
        q: "In React 19, how does a function component receive a ref from its parent?",
        options: ["Only through forwardRef", "As a regular prop named ref", "Through context", "Refs cannot be passed to function components"],
        answer: 1,
        why: "React 19 made ref a normal prop for function components; forwardRef is no longer needed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a Badge component that takes a label and an optional tone of \"info\" or \"danger\" (default \"info\") and renders a span with a matching class.",
        hint: "Destructure props and give tone a default value.",
        solution: "type BadgeProps = { label: string; tone?: \"info\" | \"danger\" };\n\nexport function Badge({ label, tone = \"info\" }: BadgeProps) {\n  return <span className={`badge badge-${tone}`}>{label}</span>;\n}",
      },
      {
        level: "medium",
        task: "Build a Layout component with a sidebar slot and children, then use it so a UserMenu inside the sidebar gets the user directly from the page, without Layout knowing about users.",
        hint: "Pass the already-built UserMenu element as the sidebar prop.",
        solution: "import type { ReactNode } from \"react\";\n\nfunction Layout({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {\n  return <div className=\"layout\"><aside>{sidebar}</aside><main>{children}</main></div>;\n}\n\nfunction Page({ user }: { user: { name: string } }) {\n  return <Layout sidebar={<UserMenu name={user.name} />}><h1>Dashboard</h1></Layout>;\n}\nfunction UserMenu({ name }: { name: string }) { return <p>Hi, {name}</p>; }",
      },
      {
        level: "hard",
        task: "Take a mockup of a recipe page (header, search, filter chips, a grid of recipe cards with title, time and tags, and pagination). Write the component tree and the props each component needs.",
        hint: "Start from the data: a list of recipes, the current query and the active filters.",
        solution: "RecipePage (recipes, query, filters, page)\n  Header\n  SearchBar (query, onQueryChange)\n  FilterChips (filters, active, onToggle)\n  RecipeGrid (recipes)\n    RecipeCard (title, minutes, tags) x N\n      TagList (tags)\n  Pagination (page, totalPages, onPageChange)\n// State (query, active filters, page) lives in RecipePage.",
      },
    ],
    faq: [
      { q: "What is the difference between a component and an element in React?", a: "A component is the function you write. An element is the small object it returns, describing what to show; React turns elements into real DOM nodes." },
      { q: "Should I use default or named exports for components?", a: "Either works. Named exports are easier to auto-import and rename safely; Next.js requires default exports only for special files like page.tsx and layout.tsx." },
      { q: "Do I still need forwardRef in React 19?", a: "No for new code. Function components can take ref as a normal prop; forwardRef still works but is no longer needed." },
      { q: "How small should a React component be?", a: "Small enough to do one job and have a clear name. If you need the word and to describe it, consider splitting it." },
    ],
  },

  "react/react-state": {
    plain: [
      "Normal variables inside a component are forgotten every time it runs again. If you write let count = 0 and add one on click, the screen never changes. State is React's memory: a value that survives between renders and tells React to update the screen when it changes.",
      "You create state with useState. It gives you the current value and a setter function. When you call the setter, React runs your component again with the new value and updates only the parts of the page that changed.",
      "Events connect the user to state. onClick on a button or onChange on an input calls a function you write, and that function calls the setter. Conditional rendering then shows different UI depending on the state, such as a spinner while loading or a message when a list is empty.",
      "A big part of React is deciding where state lives. If two components need the same value, put the state in their closest common parent and pass it down. And keep state small: if you can calculate something from existing values, do not store it twice.",
    ],
    deepDive: [
      {
        heading: "Snapshots and batching",
        body: "Each render sees a fixed snapshot of state. Inside a click handler, count keeps its value from that render even after you call setCount. So calling setCount(count + 1) three times in a row adds only one: all three read the same old count.\n\nReact also batches updates. It waits until your event handler finishes, applies all queued updates together, and renders once. Since React 18 this happens everywhere, including inside timeouts and after await. If the next value depends on the previous one, pass an updater function: setCount((c) => c + 1). React queues the functions and runs them in order, each receiving the result of the one before.",
        visual: {
          type: "compare",
          title: "Three updates in one click, starting at 0",
          columns: [
            { title: "setCount(count + 1) x3", points: ["Each call reads the snapshot: 0", "Queues: set to 1, 1, 1", "One render with count 1", "Result: 1"] },
            { title: "setCount(c => c + 1) x3", points: ["Each call queues a function", "Runs 0 to 1, 1 to 2, 2 to 3", "One render with count 3", "Result: 3"] },
          ],
        },
      },
      {
        heading: "Update objects and arrays by replacing them",
        body: "React decides whether state changed by comparing the old and new value with Object.is. For objects and arrays, that compares references, not contents. If you push into the existing array and call setItems(items), the reference is the same, so React may skip the update and other code sees surprising changes.\n\nAlways create a new value. Add with [...items, newItem], remove with items.filter, change one item with items.map, and update an object field with { ...user, name }. For sorting, use toSorted, which returns a new array, instead of sort, which changes the original. For deeply nested data, consider flattening it, or use a helper like Immer.",
        bullets: ["Add: [...items, item]", "Remove: items.filter((i) => i.id !== id)", "Edit: items.map((i) => (i.id === id ? { ...i, done: true } : i))", "Sort: items.toSorted(compareFn)"],
      },
      {
        heading: "Choosing where state lives",
        body: "Start by keeping state in the component that uses it. When a sibling also needs it, lift it up: move the state to the closest common parent, and pass the value and a setter function down as props. Now there is one source of truth, and both children always agree.\n\nLifting too high has a cost: every update re-renders the parent and everything under it. So lift only as far as needed. State that is used in one place, such as whether a dropdown is open, should stay local. Data from the server is a special case; in Next.js it often lives in server components and is not React state at all.",
        visual: {
          type: "tree",
          title: "Lifted state: one owner, two readers",
          root: "FilterPage owns query",
          children: [
            { label: "SearchInput", children: ["gets value={query}", "calls onChange(text)"] },
            { label: "ResultList", children: ["gets query", "filters during render"] },
            { label: "ResultCount", children: ["derives the count, no state"] },
          ],
        },
      },
      {
        heading: "Avoid redundant state",
        body: "Every extra piece of state is something that can get out of sync. If you store firstName, lastName and fullName, one day fullName will be stale. Calculate fullName during render instead. The same applies to filtered lists, totals and counts.\n\nOther common fixes: do not copy a prop into state, because it will not update when the prop changes. Store an id, not a copy of the selected object, so edits to the list show up in the selection. Replace several booleans that can contradict each other, like isSending and isSent, with one status value such as \"typing\", \"sending\" or \"sent\".",
      },
      {
        heading: "Conditional rendering and the 0 trap",
        body: "Use a ternary for either-or UI, && for show-or-hide, and an early return for whole-component cases like loading. Be careful with && and numbers: {items.length && <List />} renders the text 0 when the list is empty, because 0 is a value React can display. Write items.length > 0 instead.\n\nState is tied to a component's position in the tree. If you render the same component in the same place, React keeps its state even if props change. To reset it on purpose, give it a different key: rendering a ChatPanel with key={contactId} gives each contact a fresh panel with an empty draft.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "What happens on one click",
        actors: ["User", "Event handler", "React", "Browser DOM"],
        messages: [
          { from: 0, to: 1, label: "click calls onClick" },
          { from: 1, to: 2, label: "setCount(c => c + 1) queued" },
          { from: 1, to: 2, label: "handler finishes" },
          { from: 2, to: 2, label: "re-render with new state" },
          { from: 2, to: 3, label: "commit only the changed text" },
        ],
      },
    ],
    examples: [
      {
        title: "An accordion where only one panel is open",
        explanation: "Each Panel used to keep its own isOpen, so several could be open at once. Step 1: remove the state from Panel. Step 2: the parent stores openId, a single value. Step 3: each Panel gets isOpen and onToggle props. Now opening one panel closes the other automatically, because there is only one source of truth.",
        code: {
          lang: "tsx",
          code: "import { useState, type ReactNode } from \"react\";\n\nfunction Panel(props: { title: string; isOpen: boolean; onToggle: () => void; children: ReactNode }) {\n  return (<section>\n    <button aria-expanded={props.isOpen} onClick={props.onToggle}>{props.title}</button>\n    {props.isOpen && <div>{props.children}</div>}\n  </section>);\n}\nexport function FAQ() {\n  const [openId, setOpenId] = useState<string | null>(null);\n  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));\n  return (<>\n    <Panel title=\"Shipping\" isOpen={openId === \"ship\"} onToggle={() => toggle(\"ship\")}>3 to 5 days</Panel>\n    <Panel title=\"Returns\" isOpen={openId === \"ret\"} onToggle={() => toggle(\"ret\")}>30 days</Panel>\n  </>);\n}",
        },
      },
      {
        title: "Resetting a draft when the contact changes",
        explanation: "A chat app shows one ChatPanel with a draft message. Bug: you type to Alice, switch to Bob, and the draft is still there. Step 1: understand why: same component, same position, so React keeps its state. Step 2: add key={contact.id}. Step 3: switching contacts now creates a fresh ChatPanel. No effect and no manual reset needed.",
        code: {
          lang: "tsx",
          code: "import { useState } from \"react\";\n\nfunction ChatPanel({ name }: { name: string }) {\n  const [draft, setDraft] = useState(\"\");\n  return <textarea aria-label={`Message ${name}`} value={draft} onChange={(e) => setDraft(e.target.value)} />;\n}\n\nexport function Messenger({ contact }: { contact: { id: string; name: string } }) {\n  return <ChatPanel key={contact.id} name={contact.name} />;\n}",
        },
      },
    ],
    cheatSheet: [
      "const [value, setValue] = useState(initial) gives a snapshot and a setter",
      "New value depends on the old one? Use setX((prev) => next)",
      "Never mutate state: copy with spread, map, filter or toSorted",
      "Calculate derived values during render instead of storing them",
      "{list.length > 0 && ...} avoids rendering a stray 0",
      "Change a component's key to reset all of its state",
      "useState(() => expensiveInit()) runs the initializer only on the first render",
      "Lift state to the closest common parent of every component that needs it",
    ],
    quiz: [
      {
        q: "count is 0. A click handler calls setCount(count + 1) twice. What is count after the re-render?",
        options: ["2", "0", "1", "It throws an error"],
        answer: 2,
        why: "Both calls read the same snapshot (0), so both queue the value 1.",
      },
      {
        q: "You call items.push(newItem) and then setItems(items). What is the problem?",
        options: ["push is not allowed in TypeScript", "The array reference is unchanged, so React may skip the update", "setItems only accepts strings", "Nothing, this is correct"],
        answer: 1,
        why: "React compares with Object.is; mutating keeps the same reference, so create a new array.",
      },
      {
        q: "count is 0. What does the expression count && (a paragraph element) render?",
        options: ["The text 0", "Nothing", "The paragraph New", "An error"],
        answer: 0,
        why: "0 is falsy, so && returns 0, and React renders numbers as text.",
      },
      {
        q: "A form stores selectedProduct as a copy of an item from the products state. What is the better design?",
        options: ["Store selectedProduct in a ref", "Store both and sync them in an effect", "Use a global variable", "Store selectedId and look the product up during render"],
        answer: 3,
        why: "Storing only the id avoids duplicated data that can go stale.",
      },
      {
        q: "How do you give a component fresh state when it starts showing a different user?",
        options: ["Call a reset function in an effect", "Render it with key={user.id}", "Wrap it in a Fragment", "Use useMemo"],
        answer: 1,
        why: "A new key makes React treat it as a new component and discard the old state.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Build a LikeButton that shows a heart count, adds one per click, and changes its label to Liked after the first click.",
        hint: "One state value is enough; the label can be derived from it.",
        solution: "import { useState } from \"react\";\n\nexport function LikeButton() {\n  const [likes, setLikes] = useState(0);\n  return (\n    <button onClick={() => setLikes((n) => n + 1)}>\n      {likes > 0 ? \"Liked\" : \"Like\"} ({likes})\n    </button>\n  );\n}",
      },
      {
        level: "medium",
        task: "Build a shopping list: an input, an Add button, and a list where each item can be toggled done. Show \"Nothing yet\" when empty and a derived count of remaining items.",
        hint: "Keep an array of { id, text, done } and update it immutably with map.",
        solution: "const [items, setItems] = useState<{ id: string; text: string; done: boolean }[]>([]);\nconst [text, setText] = useState(\"\");\nconst add = () => { if (!text.trim()) return; setItems((xs) => [...xs, { id: crypto.randomUUID(), text, done: false }]); setText(\"\"); };\nconst toggle = (id: string) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));\nconst left = items.filter((x) => !x.done).length;\n// JSX: input value={text} onChange; button onClick={add};\n// {items.length === 0 ? <p>Nothing yet</p> : <ul>{items.map((x) =>\n//   <li key={x.id} onClick={() => toggle(x.id)}>{x.done ? \"[x] \" : \"\"}{x.text}</li>)}</ul>}\n// <p>{left} left</p>",
      },
      {
        level: "hard",
        task: "A temperature converter has a Celsius input and a Fahrenheit input. Typing in either updates the other. Design the state so they can never disagree.",
        hint: "Store one value plus which scale it was typed in, and derive the other.",
        solution: "const [temp, setTemp] = useState({ value: \"\", scale: \"c\" as \"c\" | \"f\" });\nconst n = parseFloat(temp.value);\nconst c = temp.scale === \"c\" ? temp.value : isNaN(n) ? \"\" : (((n - 32) * 5) / 9).toFixed(1);\nconst f = temp.scale === \"f\" ? temp.value : isNaN(n) ? \"\" : ((n * 9) / 5 + 32).toFixed(1);\n// <input value={c} onChange={(e) => setTemp({ value: e.target.value, scale: \"c\" })} />\n// <input value={f} onChange={(e) => setTemp({ value: e.target.value, scale: \"f\" })} />",
      },
    ],
    faq: [
      { q: "Why does my React state not update immediately?", a: "The setter schedules a re-render; the current function keeps its snapshot. Use the new value you computed, or read the state in the next render." },
      { q: "When should I use useState vs a normal variable?", a: "Use state for values that change over time and should update the screen. Use a normal variable for values you can calculate from props or state on every render." },
      { q: "Can I call a state setter during rendering?", a: "Avoid it; it usually causes an infinite loop. Set state in event handlers or effects, or derive the value during render instead." },
    ],
  },

  "react/react-lists-forms": {
    plain: [
      "Most apps show lists: products, messages, search results. In React you turn an array of data into an array of JSX with map. React then draws one item for each entry.",
      "Each list item needs a key, a unique and stable label such as the item's database id. Keys let React tell items apart when the list changes. Without good keys, React can mix up which item is which, for example keeping text typed into one row attached to the wrong row.",
      "Forms collect input from users. In a controlled form, React state holds every field value, and each change updates that state. This makes it easy to validate as the user types, disable the submit button, or show a live preview.",
      "React 19 adds a second style: give the form an action function. React passes it the form data when the user submits, tracks whether it is still running, and resets the fields when it succeeds. Both styles are valid; pick what fits the form.",
    ],
    deepDive: [
      {
        heading: "How keys guide React",
        body: "When a list re-renders, React matches old and new items by key, not by position. Same key: keep that component and its state, update its props. New key: create a new component. Missing key: remove it.\n\nWith index keys, inserting an item at the top shifts every index by one. React thinks item 0 is still item 0, so the state of the first row, like an open editor or typed text, now belongs to a different product. Keys must be unique among siblings, stable across renders, and come from the data. Never generate them during render with Math.random() or crypto.randomUUID(): that creates new keys every time and remounts every row. Put the key on the outermost element returned from map; use a keyed Fragment when you return several elements.",
        visual: {
          type: "compare",
          title: "Inserting \"Kiwi\" at the top of [Apple, Pear]",
          columns: [
            { title: "key={index}", points: ["Old: 0 Apple, 1 Pear", "New: 0 Kiwi, 1 Apple, 2 Pear", "React reuses row 0 for Kiwi", "Apple's typed text now shows on Kiwi"] },
            { title: "key={item.id}", points: ["Old: a Apple, p Pear", "New: k Kiwi, a Apple, p Pear", "React adds one new row for k", "Every row keeps its own state"] },
          ],
        },
      },
      {
        heading: "Controlled and uncontrolled inputs",
        body: "A controlled input has value={state} and an onChange that updates the state, so React is the source of truth. Use it when the UI reacts to each keystroke: live validation, character counters, formatting, or enabling a button.\n\nAn uncontrolled input keeps its own value in the DOM. You set a starting value with defaultValue and read the values on submit, usually with new FormData(form). It is less code for simple forms and works well with React 19 form actions.\n\nDo not mix them on one input: value without onChange makes it read-only and React warns, and switching value from undefined to a string makes it flip from uncontrolled to controlled. Start text state as an empty string, not undefined. For checkboxes, use checked and defaultChecked instead of value.",
      },
      {
        heading: "Validation users can understand",
        body: "Start with HTML: required, type=\"email\", minLength, min, max and pattern give you free checks and the right mobile keyboard. Then add your own rules in JavaScript, and always validate again on the server, because client checks can be skipped.\n\nTiming matters. Showing \"invalid email\" after the first keystroke is annoying. A common pattern is to validate a field when it loses focus (onBlur) and every field on submit. Make errors accessible: put the message in an element with an id, link it with aria-describedby on the input, and set aria-invalid=\"true\". Move focus to the first invalid field on submit so keyboard and screen reader users know what to fix.",
        bullets: ["Native attributes first: required, type, minLength", "Validate on blur and on submit, not every keystroke", "aria-invalid plus aria-describedby for each error", "The server must validate again"],
      },
      {
        heading: "React 19 form actions",
        body: "In React 19 you can pass a function to a form's action prop. On submit, React calls it with a FormData object; no preventDefault needed. useActionState wraps that function: it gives you the latest result (for example an errors object), a formAction to pass to the form, and an isPending flag. Your function receives the previous state and the form data and returns the next state.\n\nAny component inside the form can call useFormStatus from react-dom to read pending, which is ideal for a reusable SubmitButton. When the action finishes successfully, React resets uncontrolled fields automatically. The same API works with Next.js server actions, so the form can submit to the server and still work before JavaScript loads.",
        visual: {
          type: "sequence",
          title: "Submitting a form with useActionState",
          actors: ["User", "form", "action function", "React"],
          messages: [
            { from: 0, to: 1, label: "clicks Submit" },
            { from: 1, to: 3, label: "submit with FormData" },
            { from: 3, to: 3, label: "isPending becomes true" },
            { from: 3, to: 2, label: "call with (prevState, formData)" },
            { from: 2, to: 3, label: "return { errors } or { ok }" },
            { from: 3, to: 1, label: "re-render with new state, pending false" },
          ],
        },
      },
      {
        heading: "Rendering long lists well",
        body: "Filter and sort in render, before map: items.filter(...).toSorted(...).map(...). Do not call sort on state directly, since it mutates the array. If the calculation is expensive and runs on every keystroke, useMemo can cache it, but measure first.\n\nA few hundred simple rows render fine. Thousands of rows, or rows with heavy content, make typing and scrolling slow because every row is a real DOM node. The fixes are pagination, a Load more button, or virtualization: libraries like TanStack Virtual or react-window render only the rows visible in the scroll area, so 10,000 items cost about the same as 30.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to build a form",
        columns: [
          { title: "Controlled", points: ["value + onChange per field", "Live validation and previews", "More code per field", "Good for dynamic UIs"] },
          { title: "Uncontrolled + FormData", points: ["defaultValue, read on submit", "Little code", "Native validation works well", "Good for simple forms"] },
          { title: "React 19 action", points: ["form action={fn}", "isPending and result built in", "Auto reset on success", "Works with server actions"] },
        ],
      },
    ],
    examples: [
      {
        title: "A newsletter form with useActionState",
        explanation: "Step 1: write subscribe(prevState, formData) that reads the email, validates it, and returns either an error or a success message. Step 2: useActionState gives the current state, the formAction and isPending. Step 3: pass formAction to the form's action prop. Step 4: show the error with role=\"alert\" and disable the button while pending. No preventDefault and no controlled state are needed; the field resets after success.",
        code: {
          lang: "tsx",
          code: "import { useActionState } from \"react\";\ntype State = { error?: string; message?: string };\n\nasync function subscribe(_prev: State, formData: FormData): Promise<State> {\n  const email = String(formData.get(\"email\") ?? \"\");\n  if (!email.includes(\"@\")) return { error: \"Enter a valid email\" };\n  await fetch(\"/api/subscribe\", { method: \"POST\", body: formData });\n  return { message: \"Check your inbox!\" };\n}\n\nexport function Newsletter() {\n  const [state, formAction, isPending] = useActionState(subscribe, {});\n  return (<form action={formAction}>\n    <input name=\"email\" type=\"email\" required aria-label=\"Email\" />\n    <button disabled={isPending}>{isPending ? \"Sending...\" : \"Subscribe\"}</button>\n    <p role=\"alert\">{state.error ?? state.message}</p>\n  </form>);\n}",
        },
      },
      {
        title: "Accessible error messages on blur",
        explanation: "Step 1: keep the value and a touched flag in state. Step 2: derive the error from the value; do not store it. Step 3: show it only after the field was blurred, so users are not scolded while typing. Step 4: link the message with aria-describedby and set aria-invalid, so screen readers announce what is wrong.",
        code: {
          lang: "tsx",
          code: "import { useState } from \"react\";\n\nexport function PasswordField() {\n  const [value, setValue] = useState(\"\");\n  const [touched, setTouched] = useState(false);\n  const error = value.length < 12 ? \"Use at least 12 characters\" : \"\";\n  const show = touched && error !== \"\";\n  return (\n    <label>\n      Password\n      <input type=\"password\" value={value} onChange={(e) => setValue(e.target.value)} onBlur={() => setTouched(true)}\n        aria-invalid={show} aria-describedby={show ? \"pw-error\" : undefined} />\n      {show && <span id=\"pw-error\">{error}</span>}\n    </label>\n  );\n}",
        },
      },
    ],
    cheatSheet: [
      "Keys: unique among siblings, stable, from the data (like id); never Math.random()",
      "Index keys are fine only for static lists that never reorder, insert or delete",
      "Controlled: value + onChange; uncontrolled: defaultValue + FormData on submit",
      "Start text state as \"\" not undefined, to avoid uncontrolled-to-controlled warnings",
      "React 19: const [state, formAction, isPending] = useActionState(fn, initial)",
      "useFormStatus (from react-dom) gives pending to any child of a form",
      "Link errors with aria-describedby and mark fields with aria-invalid",
      "Thousands of rows? Paginate or virtualize with TanStack Virtual or react-window",
    ],
    quiz: [
      {
        q: "Why is key={Math.random()} a bad key?",
        options: ["It is too slow to compute", "Keys must be strings", "Every render gets new keys, so every item remounts and loses state", "It only works in development"],
        answer: 2,
        why: "React sees all-new keys each time and recreates every row from scratch.",
      },
      {
        q: "An input has value={name} but no onChange. What happens?",
        options: ["The user cannot change the text and React warns", "It works like a normal input", "React adds onChange automatically", "The value is ignored"],
        answer: 0,
        why: "A controlled value with no way to update it makes the field read-only.",
      },
      {
        q: "In React 19, what does useActionState return?",
        options: ["[value, setValue]", "{ data, error }", "A promise", "[state, formAction, isPending]"],
        answer: 3,
        why: "It returns the latest action result, a function to pass to form action, and a pending flag.",
      },
      {
        q: "Where can useFormStatus read the pending state from?",
        options: ["Any component on the page", "A component rendered inside the form", "Only the form component itself", "Only server components"],
        answer: 1,
        why: "useFormStatus reads the status of the parent form, so call it in a child such as a SubmitButton.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Render a list of countries from [{ code: \"FR\", name: \"France\" }, ...] as an unordered list with correct keys.",
        hint: "The country code is unique and stable.",
        solution: "const countries = [{ code: \"FR\", name: \"France\" }, { code: \"JP\", name: \"Japan\" }];\n\nexport function Countries() {\n  return (\n    <ul>\n      {countries.map((c) => <li key={c.code}>{c.name}</li>)}\n    </ul>\n  );\n}",
      },
      {
        level: "medium",
        task: "Build a contact form with name and message (both required, message at least 20 characters) as an uncontrolled form. On submit, read FormData, show errors in a list, or log the values if valid.",
        hint: "Use onSubmit with e.preventDefault() and new FormData(e.currentTarget).",
        solution: "const [errors, setErrors] = useState<string[]>([]);\nfunction onSubmit(e: React.FormEvent<HTMLFormElement>) {\n  e.preventDefault();\n  const data = new FormData(e.currentTarget);\n  const name = String(data.get(\"name\") ?? \"\").trim();\n  const message = String(data.get(\"message\") ?? \"\").trim();\n  const errs: string[] = [];\n  if (!name) errs.push(\"Name is required\");\n  if (message.length < 20) errs.push(\"Message needs 20+ characters\");\n  setErrors(errs);\n  if (errs.length === 0) console.log({ name, message });\n}",
      },
      {
        level: "hard",
        task: "Write a reusable SubmitButton that shows \"Saving...\" and is disabled while its parent form's action runs, without receiving any props about pending state.",
        hint: "useFormStatus must be called in a component rendered inside the form.",
        solution: "import { useFormStatus } from \"react-dom\";\n\nexport function SubmitButton({ label = \"Save\" }: { label?: string }) {\n  const { pending } = useFormStatus();\n  return (\n    <button type=\"submit\" disabled={pending} aria-disabled={pending}>\n      {pending ? \"Saving...\" : label}\n    </button>\n  );\n}\n// <form action={saveAction}> ... <SubmitButton /> </form>",
      },
    ],
    faq: [
      { q: "Can I use the array index as a key in React?", a: "Only if the list is static and never reordered, filtered, or added to in the middle. Otherwise use a stable id from your data." },
      { q: "Do I need a form library like React Hook Form?", a: "Not for small forms; React state or React 19 actions are enough. Libraries help with large forms that have many fields, complex validation or dynamic field arrays." },
      { q: "Is client-side validation enough?", a: "No. It helps users, but anyone can bypass it, so always validate on the server too." },
    ],
  },

  "react/react-effects": {
    plain: [
      "React components describe the screen. But sometimes you need to talk to things outside React: start a timer, connect to a chat server, listen for window resizes, or control a video player. useEffect is the tool for that.",
      "An effect runs after React has updated the page. You tell it which values it depends on. When one of them changes, React first runs your cleanup, which undoes the old setup, and then runs the effect again with the new values.",
      "Refs are a second tool. useRef gives you a box with a current field that keeps its value between renders, but changing it does not re-render the component. Use it for timer ids or to reach a real DOM element, for example to focus an input.",
      "Effects are easy to overuse. If you only need to calculate something from props or state, do it during render. If something should happen because the user clicked, do it in the click handler. Fewer effects mean fewer bugs.",
    ],
    deepDive: [
      {
        heading: "When an effect actually runs",
        body: "React renders your component, commits the changes to the DOM, lets the browser paint, and then runs useEffect callbacks. Because they run after paint, effects never block the user from seeing the update. Effects do not run during server rendering at all, which is why browser-only code like window or localStorage belongs in an effect or an event handler.\n\nuseLayoutEffect runs after the DOM update but before paint. Use it only when you must measure layout, such as a tooltip's size, and adjust it before the user sees a flicker; it blocks painting, so keep it short. With an empty dependency array, an effect runs once after mount. With no array at all, it runs after every render, which is rarely what you want.",
        visual: {
          type: "flow",
          title: "One render with an effect",
          steps: [
            { label: "Render", detail: "Your function runs and returns JSX" },
            { label: "Commit", detail: "React updates the DOM" },
            { label: "useLayoutEffect", detail: "Runs before paint; can measure layout" },
            { label: "Browser paints", detail: "The user sees the new screen" },
            { label: "useEffect", detail: "Cleanup of the old effect, then the new one" },
          ],
        },
      },
      {
        heading: "Dependencies are not a choice",
        body: "The dependency array is not a list of when you want the effect to run. It must contain every reactive value the effect reads: props, state, and anything calculated from them. React compares each item with Object.is. The eslint rule react-hooks/exhaustive-deps checks this for you; do not silence it.\n\nObjects and functions created during render are new on every render, so listing them makes the effect run every time. Move them inside the effect, or move them outside the component if they do not use props or state. When an effect must read a value without reacting to it, such as the current theme when logging a page view, React 19.2 adds useEffectEvent: wrap that logic in an effect event and call it from the effect; it always sees the latest values and does not belong in the array.",
        bullets: ["Every prop or state read inside goes in the array", "Move helper objects and functions inside the effect", "Use the updater form of a setter to drop state from deps", "useEffectEvent for non-reactive logic (React 19.2+)"],
      },
      {
        heading: "Cleanup, Strict Mode and race conditions",
        body: "Every effect that starts something should stop it: clearInterval for timers, removeEventListener for listeners, disconnect for sockets. In development, Strict Mode mounts each component, immediately unmounts it, and mounts it again. A correct effect with cleanup behaves the same; a missing cleanup shows up as two connections or doubled events. This only happens in development.\n\nFetching in an effect has a classic race. If userId changes from 1 to 2 quickly, the response for 1 may arrive last and overwrite user 2. Fix it in cleanup: abort the request with an AbortController, or set an ignore flag that the old request checks before calling setState. In real apps, prefer a data library such as TanStack Query, or server components in Next.js, which handle caching and races for you.",
      },
      {
        heading: "You might not need an effect",
        body: "Many effects copy data from one place to another and cause an extra render each time. Common cases have simpler fixes. Derived data: compute it in render (const visible = todos.filter(...)), with useMemo if it is truly expensive. Resetting state when a prop changes: render the component with a key. Reacting to a user action, like sending analytics after Buy: do it in the event handler, because you know exactly why it happened there.\n\nA good test is to ask why this code runs. If the answer is because the component was displayed, an effect fits. If the answer is because the user did something, it belongs in a handler.",
        visual: {
          type: "compare",
          title: "Effect vs better place",
          columns: [
            { title: "With an effect (avoid)", points: ["Effect sets fullName from first and last", "Effect resets the form when userId changes", "Effect posts to /api/buy when bought is true", "Effect copies a prop into state"] },
            { title: "Without (prefer)", points: ["const fullName = first + \" \" + last", "Render the form with key={userId}", "Call the API in the Buy click handler", "Read the prop directly"] },
          ],
        },
      },
      {
        heading: "Refs: memory without re-rendering",
        body: "useRef returns the same object on every render. Changing ref.current does not re-render, which makes it right for values the UI does not show: a timer id, the previous value of a prop, or a flag like hasShownToast. Do not read or write ref.current during rendering, except for lazy setup; the screen would not stay in sync with it. Use refs in handlers and effects.\n\nFor DOM nodes, pass the ref to an element and React sets ref.current after commit, so it is null during the first render. Use it to focus, scroll into view, measure size, or call play() on a video. In React 19, a ref callback can return a cleanup function, which React calls when the element is removed.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "roomId changes from \"general\" to \"music\"",
        actors: ["Component", "React", "Chat server"],
        messages: [
          { from: 1, to: 2, label: "effect: connect(\"general\")" },
          { from: 0, to: 1, label: "re-render with roomId \"music\"" },
          { from: 1, to: 2, label: "cleanup: disconnect(\"general\")" },
          { from: 1, to: 2, label: "effect: connect(\"music\")" },
          { from: 0, to: 1, label: "unmount" },
          { from: 1, to: 2, label: "cleanup: disconnect(\"music\")" },
        ],
      },
    ],
    examples: [
      {
        title: "Fetching a profile without race conditions",
        explanation: "Step 1: the effect depends on userId, so it reruns when the user changes. Step 2: create an AbortController and pass its signal to fetch. Step 3: in cleanup, abort. If userId changes before the old response arrives, the old request is cancelled and can never overwrite the new data. Step 4: ignore the AbortError, because it is expected.",
        code: {
          lang: "tsx",
          code: "import { useEffect, useState } from \"react\";\n\ntype User = { id: string; name: string };\n\nexport function Profile({ userId }: { userId: string }) {\n  const [user, setUser] = useState<User | null>(null);\n  useEffect(() => {\n    const controller = new AbortController();\n    fetch(`/api/users/${userId}`, { signal: controller.signal })\n      .then((res) => res.json())\n      .then((data: User) => setUser(data))\n      .catch((err) => { if (err.name !== \"AbortError\") console.error(err); });\n    return () => controller.abort();\n  }, [userId]);\n  return <h1>{user ? user.name : \"Loading...\"}</h1>;\n}",
        },
      },
      {
        title: "Deleting an effect that caused double renders",
        explanation: "The original code kept a filtered list in state and updated it in an effect whenever todos or filter changed. That costs an extra render each time and shows one frame of stale data. Step 1: delete the visibleTodos state. Step 2: delete the effect. Step 3: compute the list during render. Same result, less code, no stale frame.",
        code: {
          lang: "tsx",
          code: "type Todo = { id: string; text: string; done: boolean };\n\n// Before:\n// const [visible, setVisible] = useState<Todo[]>([]);\n// useEffect(() => { setVisible(todos.filter(...)); }, [todos, filter]);\n\n// After:\nexport function TodoList({ todos, filter }: { todos: Todo[]; filter: \"all\" | \"open\" }) {\n  const visible = filter === \"open\" ? todos.filter((t) => !t.done) : todos;\n  return <ul>{visible.map((t) => <li key={t.id}>{t.text}</li>)}</ul>;\n}",
        },
      },
    ],
    cheatSheet: [
      "useEffect runs after paint; useLayoutEffect runs before paint (measure layout only)",
      "No deps array: every render. []: after mount. [a, b]: when a or b changes",
      "Return a cleanup function for every timer, listener, socket or subscription",
      "Strict Mode mounts, unmounts and remounts in development to test your cleanup",
      "Abort stale fetches in cleanup with AbortController",
      "Derived data goes in render; user-caused work goes in event handlers",
      "ref.current changes do not re-render; do not read it during render",
      "React 19.2: useEffectEvent reads latest values without adding them to deps",
    ],
    quiz: [
      {
        q: "An effect has the dependency array [roomId]. roomId changes. What happens, in order?",
        options: ["The new effect runs, then the old cleanup", "Only the new effect runs", "The old cleanup runs, then the new effect", "Nothing until unmount"],
        answer: 2,
        why: "React tears down the previous setup before running the effect with the new value.",
      },
      {
        q: "In development your WebSocket connects twice on page load. What is the most likely cause?",
        options: ["A bug in React", "Strict Mode remounting a component whose effect has no cleanup", "The server is slow", "The dependency array is empty"],
        answer: 1,
        why: "Strict Mode mounts, unmounts and remounts; without a disconnect in cleanup you see two connections.",
      },
      {
        q: "You need fullName from firstName and lastName state. What should you do?",
        options: ["Compute it during render", "Store it in state and update it in an effect", "Store it in a ref", "Use useLayoutEffect"],
        answer: 0,
        why: "Values computable from existing state should be derived, not synced.",
      },
      {
        q: "Why is inputRef.current null during the first render?",
        options: ["useRef is broken in React 19", "Refs only work in class components", "The ref was not imported", "React sets DOM refs during commit, after render"],
        answer: 3,
        why: "The DOM node does not exist until React commits it, so read refs in effects or handlers.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the window width in a component and keep it updated when the window is resized. Clean up the listener.",
        hint: "Add a resize listener in an effect with an empty dependency array.",
        solution: "import { useEffect, useState } from \"react\";\n\nexport function WidthLabel() {\n  const [width, setWidth] = useState(0);\n  useEffect(() => {\n    const onResize = () => setWidth(window.innerWidth);\n    onResize();\n    window.addEventListener(\"resize\", onResize);\n    return () => window.removeEventListener(\"resize\", onResize);\n  }, []);\n  return <p>{width}px</p>;\n}",
      },
      {
        level: "medium",
        task: "Build a Stopwatch with Start, Stop and Reset. Store the interval id in a ref so you can stop it, and make sure unmounting stops the timer.",
        hint: "Keep elapsed seconds in state and the interval id in useRef; clear it in a cleanup effect.",
        solution: "const [secs, setSecs] = useState(0);\nconst id = useRef<ReturnType<typeof setInterval> | null>(null);\nconst stop = () => { if (id.current) clearInterval(id.current); id.current = null; };\nconst start = () => {\n  if (id.current) return;\n  id.current = setInterval(() => setSecs((s) => s + 1), 1000);\n};\nconst reset = () => { stop(); setSecs(0); };\nuseEffect(() => stop, []); // clear on unmount\n// <p>{secs}s</p><button onClick={start}>Start</button>\n// <button onClick={stop}>Stop</button><button onClick={reset}>Reset</button>",
      },
      {
        level: "hard",
        task: "Search results load in an effect whenever query changes. Typing \"rea\" then \"react\" sometimes shows results for \"rea\". Fix it with an ignore flag (no AbortController).",
        hint: "Each effect run has its own ignore variable; cleanup sets it to true.",
        solution: "useEffect(() => {\n  let ignore = false;\n  fetch(`/api/search?q=${encodeURIComponent(query)}`)\n    .then((r) => r.json())\n    .then((data) => {\n      if (!ignore) setResults(data);\n    });\n  return () => {\n    ignore = true;\n  };\n}, [query]);",
      },
    ],
    faq: [
      { q: "Why does useEffect run twice in development?", a: "React Strict Mode mounts, unmounts and remounts components in development to check that your effects clean up correctly. It does not happen in production builds." },
      { q: "Should I fetch data in useEffect?", a: "It works for simple cases if you handle races and loading states. For real apps, prefer a data library like TanStack Query or, in Next.js, fetching in server components." },
      { q: "What is the difference between useRef and useState?", a: "Both keep values between renders, but only changing state triggers a re-render. Use a ref for values the screen does not show." },
      { q: "Can I make the effect callback async?", a: "Not directly, because an async function returns a promise and React expects a cleanup function or nothing. Define an async function inside the effect and call it." },
    ],
  },

  "react/react-context": {
    plain: [
      "Imagine the logged-in user's name is needed by the header, a sidebar and a comment box, each many levels deep. Passing it as a prop through every component in between is called prop drilling. It is tiring and makes the middle components carry data they never use.",
      "Context solves this. A parent component provides a value, and any component below it can read that value directly with useContext or use, no matter how deep it is. Themes, the current user, the language and a shopping cart are typical examples.",
      "useReducer is a different tool that pairs well with context. Instead of many setState calls spread around, you describe what happened with an action, like add item, and one function called a reducer decides the new state. All the update rules live in one place.",
      "Together they give you simple app-wide state: the reducer holds the logic, and context makes the state and the dispatch function available everywhere in the tree, without any extra library.",
    ],
    deepDive: [
      {
        heading: "How a component finds its context value",
        body: "createContext(defaultValue) makes a context object. A provider wraps part of the tree and sets the value; in React 19 you can render the context itself as the provider, and the older Context.Provider form still works. When a component reads the context, React walks up the tree and uses the value from the nearest provider above it. If there is none, it gets the default value.\n\nProviders can be nested, so an inner provider overrides an outer one for its subtree, which is handy for a dark section inside a light page. React 19 also lets you read context with use(MyContext). Unlike useContext, use may be called inside if statements and loops, but still only in components and hooks.",
        visual: {
          type: "layers",
          title: "Nearest provider wins",
          layers: [
            { label: "ThemeContext provider: \"light\"", detail: "Wraps the whole app" },
            { label: "Page components", detail: "Read \"light\"" },
            { label: "ThemeContext provider: \"dark\"", detail: "Wraps only the footer" },
            { label: "Footer components", detail: "Read \"dark\", the nearest value" },
          ],
        },
      },
      {
        heading: "The re-render cost and how to contain it",
        body: "When a provider's value changes (compared with Object.is), every component that reads that context re-renders, even if it only uses one field. A common accident is value={{ user, setUser }}: that object is new on every render of the provider, so all consumers re-render whenever the provider re-renders for any reason. Wrap it in useMemo, or pass values that are already stable.\n\nSplit contexts by how often they change. The dispatch function from useReducer never changes, so put it in its own context; components that only send actions then never re-render from state changes. Context is great for values that change rarely, like theme, locale or the signed-in user. For data that updates many times per second, a store library like Zustand, or useSyncExternalStore, lets components subscribe to just the slice they need.",
        bullets: ["Every consumer re-renders when the value changes", "Memoize object values with useMemo", "Separate StateContext and DispatchContext", "Fast-changing data: use a store with selectors"],
      },
      {
        heading: "Writing a good reducer",
        body: "A reducer is a pure function: (state, action) returns the next state. It must not mutate state, call APIs, read the current time or generate random ids; do those in the event handler and put the results in the action. React may call reducers twice in development to catch impurity.\n\nName actions after what happened, not what to set: { type: \"item_added\", item } reads better in logs than { type: \"set_items\", items }. Use a TypeScript discriminated union for actions, so each case knows its fields, and a switch with an exhaustive never check. Because reducers are plain functions, you can unit test them without rendering anything, which is one of their biggest advantages.",
      },
      {
        heading: "useState or useReducer?",
        body: "useState is simpler and is the right default for independent values. useReducer starts to win when several values change together, when the next state depends on the previous one in non-trivial ways, or when many event handlers update the same state. Moving that logic into a reducer makes components shorter: handlers just dispatch.\n\nThe reducer is also easier to debug: you can log each action and the resulting state in one place. Both hooks can be mixed freely in one component, and you can switch from one to the other later without changing the component's output.",
        visual: {
          type: "compare",
          title: "Picking the state hook",
          columns: [
            { title: "useState", points: ["One or a few independent values", "Simple updates like toggle or set", "Logic sits in each handler", "Least code"] },
            { title: "useReducer", points: ["Several values that change together", "Many actions on the same data", "All rules in one pure function", "Easy to unit test and log"] },
          ],
        },
      },
      {
        heading: "When not to reach for context",
        body: "Passing a prop through two levels is fine and makes data flow obvious. Before adding context, try composition: pass the component that needs the data as children, so the middle layers never touch it.\n\nServer data such as product lists is usually better handled by server components in Next.js or a data library like TanStack Query, which add caching and refetching that context does not have. In the Next.js App Router, context only works in client components: the provider file needs \"use client\", but you can still render it in a server layout and pass server components as its children.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Adding an item to a context-based cart",
        actors: ["AddButton", "CartProvider", "reducer", "CartBadge"],
        messages: [
          { from: 0, to: 1, label: "dispatch({ type: \"item_added\", id })" },
          { from: 1, to: 2, label: "reducer(state, action)" },
          { from: 2, to: 1, label: "returns a new state object" },
          { from: 1, to: 3, label: "new context value" },
          { from: 3, to: 3, label: "re-renders with count + 1" },
        ],
      },
    ],
    examples: [
      {
        title: "A safe theme context in React 19 style",
        explanation: "Step 1: create the context with null as default, so a missing provider is detectable. Step 2: ThemeProvider owns the state and memoizes the value so consumers re-render only when the theme really changes. Step 3: render ThemeContext directly as the provider (React 19). Step 4: useTheme throws a clear error if used outside the provider, instead of failing later with undefined.",
        code: {
          lang: "tsx",
          code: "\"use client\";\nimport { createContext, use, useMemo, useState, type ReactNode } from \"react\";\n\ntype Theme = \"light\" | \"dark\";\nconst ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  const [theme, setTheme] = useState<Theme>(\"light\");\n  const value = useMemo(() => ({ theme, toggle: () => setTheme((t) => (t === \"light\" ? \"dark\" : \"light\")) }), [theme]);\n  return <ThemeContext value={value}>{children}</ThemeContext>;\n}\n\nexport function useTheme() {\n  const ctx = use(ThemeContext);\n  if (!ctx) throw new Error(\"useTheme must be used inside ThemeProvider\");\n  return ctx;\n}",
        },
      },
      {
        title: "A tested todo reducer",
        explanation: "Step 1: type the actions as a union, named after events. Step 2: handle each action with an immutable update; ids are created in the handler and passed in, keeping the reducer pure. Step 3: test it as a plain function, no rendering needed. Step 4: in the component, useReducer(todosReducer, []) and dispatch from handlers.",
        code: {
          lang: "ts",
          code: "type Todo = { id: string; text: string; done: boolean };\ntype Action =\n  | { type: \"added\"; id: string; text: string }\n  | { type: \"toggled\"; id: string }\n  | { type: \"removed\"; id: string };\n\nexport function todosReducer(state: Todo[], action: Action): Todo[] {\n  switch (action.type) {\n    case \"added\": return [...state, { id: action.id, text: action.text, done: false }];\n    case \"toggled\": return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));\n    case \"removed\": return state.filter((t) => t.id !== action.id);\n  }\n}\n\n// test: expect(todosReducer([], { type: \"added\", id: \"1\", text: \"Milk\" })).toHaveLength(1);",
        },
      },
    ],
    cheatSheet: [
      "createContext(default), wrap with the provider, read with useContext or use",
      "React 19: render the context itself as the provider; Context.Provider still works",
      "use(Context) can be called inside conditions; useContext cannot",
      "Default to null and throw in a custom hook to catch a missing provider",
      "Memoize object values passed to a provider to avoid needless re-renders",
      "Put dispatch in its own context; it never changes",
      "Reducers are pure: no mutation, no API calls, no Date.now() or random ids",
      "In Next.js App Router, providers live in a \"use client\" file",
    ],
    quiz: [
      {
        q: "A component reads ThemeContext but no provider is above it. What does it get?",
        options: ["undefined always", "An error is thrown by React", "The value from the nearest sibling provider", "The default value passed to createContext"],
        answer: 3,
        why: "Without a provider above, React falls back to the default given to createContext.",
      },
      {
        q: "A provider passes value={{ user, setUser }}. Why can this cause extra re-renders?",
        options: ["The object is recreated every render, so consumers see a new value each time", "setUser is not allowed in context", "Context values must be strings", "user is stored twice"],
        answer: 0,
        why: "A new object fails the Object.is check, so every consumer re-renders whenever the provider renders.",
      },
      {
        q: "Which of these is allowed inside a reducer?",
        options: ["Calling fetch to save the change", "Generating an id with crypto.randomUUID()", "Returning a new array built with filter", "Pushing into the existing state array"],
        answer: 2,
        why: "Reducers must be pure; creating new values from state and action is exactly their job.",
      },
      {
        q: "What does React 19's use(MyContext) allow that useContext does not?",
        options: ["Reading context in server components only", "Being called inside an if statement", "Writing to context", "Skipping the provider"],
        answer: 1,
        why: "use can be called conditionally, though still only in components and hooks.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a LocaleContext with \"en\" as the default value and a Greeting component that shows Hello or Bonjour depending on the context.",
        hint: "A provider is optional here because there is a sensible default.",
        solution: "import { createContext, useContext } from \"react\";\n\nconst LocaleContext = createContext<\"en\" | \"fr\">(\"en\");\n\nfunction Greeting() {\n  const locale = useContext(LocaleContext);\n  return <p>{locale === \"fr\" ? \"Bonjour\" : \"Hello\"}</p>;\n}\n\n// <LocaleContext value=\"fr\"><Greeting /></LocaleContext>",
      },
      {
        level: "medium",
        task: "Write a counter reducer that handles increment, decrement (never below 0) and reset actions, with typed actions.",
        hint: "Use a discriminated union for the action and Math.max for the floor.",
        solution: "type Action = { type: \"increment\" } | { type: \"decrement\" } | { type: \"reset\" };\n\nfunction counter(state: number, action: Action): number {\n  switch (action.type) {\n    case \"increment\": return state + 1;\n    case \"decrement\": return Math.max(0, state - 1);\n    case \"reset\": return 0;\n  }\n}\n// const [n, dispatch] = useReducer(counter, 0);",
      },
      {
        level: "hard",
        task: "Build a CartProvider that exposes state and dispatch through two separate contexts, plus useCart and useCartDispatch hooks that throw outside the provider.",
        hint: "Two createContext calls; the dispatch context value never changes.",
        solution: "const CartState = createContext<Item[] | null>(null);\nconst CartDispatch = createContext<React.Dispatch<Action> | null>(null);\n\nexport function CartProvider({ children }: { children: React.ReactNode }) {\n  const [items, dispatch] = useReducer(cartReducer, []);\n  return <CartState value={items}><CartDispatch value={dispatch}>{children}</CartDispatch></CartState>;\n}\nexport function useCart() {\n  const v = use(CartState); if (!v) throw new Error(\"No CartProvider\"); return v;\n}\nexport function useCartDispatch() {\n  const d = use(CartDispatch); if (!d) throw new Error(\"No CartProvider\"); return d;\n}",
      },
    ],
    faq: [
      { q: "Is React context a replacement for Redux?", a: "For many apps, context plus useReducer is enough. Libraries like Redux Toolkit or Zustand add selectors, devtools and better performance for large, frequently changing state." },
      { q: "Does context make my app slow?", a: "Only when a frequently changing value is read by many components. Split contexts, memoize values, or use a store with selectors for fast-changing data." },
      { q: "Can I use React context in Next.js server components?", a: "No. Server components cannot read context. Put the provider in a \"use client\" component and wrap your layout's children with it." },
    ],
  },

  "react/react-hooks": {
    plain: [
      "After a while you notice the same code in many components: listening to the window size, saving a value to localStorage, waiting until the user stops typing. Copying it everywhere means fixing bugs in many places.",
      "A custom hook is a normal function whose name starts with use and which calls other hooks inside. You move the repeated logic into it, and components call it in one line, like const isOnline = useOnlineStatus().",
      "Custom hooks share logic, not state. If two components both call useCounter, each gets its own separate counter. It works exactly as if each component had written the code itself.",
      "Hooks can call other hooks, so you can build bigger ones out of small ones. A useSearch hook might use useDebounce to wait for typing to stop and then fetch results. Each piece stays small and easy to test.",
    ],
    deepDive: [
      {
        heading: "Why the rules of hooks exist",
        body: "React does not see the names of your state variables. It remembers hook state by call order: the first useState call in a component gets slot 1, the second gets slot 2, and so on. On the next render, React hands back the values in the same order.\n\nIf a hook is called inside an if, a loop or after an early return, the order can change between renders, and React would give one hook another hook's state. That is why hooks must be called at the top level of a component or custom hook, every render, in the same order. The use prefix lets the eslint-plugin-react-hooks rules find hooks and check this. React 19's use is the one exception that may be called conditionally.",
        visual: {
          type: "flow",
          title: "How React matches hook state by order",
          steps: [
            { label: "Call 1: useState(\"\")", detail: "Slot 1 holds the query" },
            { label: "Call 2: useDebounce()", detail: "Its own useState is slot 2" },
            { label: "Call 3: useEffect()", detail: "Slot 3 holds the effect" },
            { label: "Next render", detail: "Same order, same slots, same values" },
          ],
        },
      },
      {
        heading: "Designing a hook's API",
        body: "Treat a custom hook like a small library. Name it after its purpose, not its implementation: useOnlineStatus rather than useNavigatorEventListener. Return a single value when there is one result, a tuple when callers will want to rename two things (like useState), and an object when there are three or more fields.\n\nIf you return functions that callers may put in effect dependencies or pass to memoized children, keep them stable with useCallback; otherwise every render produces a new function. Accept options as an object with defaults so you can add more later without breaking callers. A hook that calls no hooks is just a function: drop the use prefix.",
        bullets: ["One result: return the value", "Two results: return a tuple", "Three or more: return an object", "Stable callbacks with useCallback", "No hooks inside? Then it is not a hook"],
      },
      {
        heading: "Subscribing to browser APIs with useSyncExternalStore",
        body: "Many custom hooks read something outside React that can change: online status, a media query, localStorage, a store. The naive version copies the value into state in an effect. React provides a better primitive: useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot).\n\nsubscribe adds a listener and returns an unsubscribe function. getSnapshot returns the current value and must return the same value when nothing changed. getServerSnapshot gives the value to use during server rendering and hydration, where window does not exist. React handles the timing, avoids tearing (different parts of the UI showing different values during one render), and works correctly with concurrent rendering. Keep subscribe stable, defined outside the component or wrapped in useCallback, or React will resubscribe on every render.",
      },
      {
        heading: "Composing hooks",
        body: "Hooks compose like functions. A component can call useDebounce and pass the result into useSearchResults, and a hook can do the same internally. Each hook owns its own state slots, and values flow from one to the next during the same render.\n\nThis keeps every piece small. useDebounce knows nothing about searching. useSearchResults knows nothing about typing speed. useProductSearch combines them for one feature. You can test useDebounce alone with fake timers, and reuse it for an autosave feature later. When a hook grows past one clear job, split it the same way you would split a large component.",
        visual: {
          type: "tree",
          title: "A feature hook built from small hooks",
          root: "useProductSearch(query)",
          children: [
            { label: "useDebounce(query, 300)", children: ["useState", "useEffect with a timer"] },
            { label: "useSearchResults(debounced)", children: ["useState for results and status", "useEffect with AbortController"] },
            { label: "returns { results, status }" },
          ],
        },
      },
      {
        heading: "When not to write a custom hook",
        body: "Do not extract a hook after seeing logic once. Wait until two or three components truly repeat it; premature hooks hide simple code behind a name you must look up. Avoid lifecycle-style hooks such as useMount or useUpdateEffect: they hide what the effect synchronizes with and make dependency mistakes easy.\n\nAlso check whether you need a hook at all. Fetching and caching server data is solved better by TanStack Query, SWR or Next.js server components than by a homemade useFetch. Formatting a date needs a plain function. A good custom hook describes a concrete purpose and wraps real React state or effects.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Before and after extracting a hook",
        columns: [
          { title: "Copied in each component", points: ["useState + useEffect + listener in 3 files", "Bug fixes needed in 3 places", "Components mix UI and plumbing", "Hard to test in isolation"] },
          { title: "One custom hook", points: ["const online = useOnlineStatus()", "One place to fix and improve", "Components only render", "Hook tested once with renderHook"] },
        ],
      },
    ],
    examples: [
      {
        title: "useMediaQuery with useSyncExternalStore",
        explanation: "Step 1: subscribe creates a MediaQueryList and listens for change events; it is wrapped in useCallback so React does not resubscribe every render. Step 2: getSnapshot returns the current matches boolean. Step 3: getServerSnapshot returns false, since the server has no screen; the client corrects it after hydration. Step 4: any component can now write const isWide = useMediaQuery(\"(min-width: 768px)\").",
        code: {
          lang: "tsx",
          code: "import { useCallback, useSyncExternalStore } from \"react\";\n\nexport function useMediaQuery(query: string): boolean {\n  const subscribe = useCallback(\n    (onChange: () => void) => {\n      const mql = window.matchMedia(query);\n      mql.addEventListener(\"change\", onChange);\n      return () => mql.removeEventListener(\"change\", onChange);\n    },\n    [query],\n  );\n  return useSyncExternalStore(\n    subscribe,\n    () => window.matchMedia(query).matches,\n    () => false,\n  );\n}",
        },
      },
      {
        title: "Composing useDebounce into a search hook",
        explanation: "Step 1: reuse useDebounce (from the explainer) to wait 300ms after typing stops. Step 2: fetch only when the debounced query changes, aborting stale requests in cleanup. Step 3: return a small object with results and status. The component stays tiny: const { results, status } = useProductSearch(text).",
        code: {
          lang: "tsx",
          code: "import { useEffect, useState } from \"react\";\nimport { useDebounce } from \"./useDebounce\";\n\nexport function useProductSearch(query: string) {\n  const debounced = useDebounce(query, 300);\n  const [results, setResults] = useState<string[]>([]);\n  const [status, setStatus] = useState<\"idle\" | \"loading\" | \"error\">(\"idle\");\n  useEffect(() => {\n    if (!debounced) return;\n    const ctrl = new AbortController();\n    setStatus(\"loading\");\n    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })\n      .then((r) => r.json()).then((data: string[]) => { setResults(data); setStatus(\"idle\"); })\n      .catch((e) => { if (e.name !== \"AbortError\") setStatus(\"error\"); });\n    return () => ctrl.abort();\n  }, [debounced]);\n  return { results, status };\n}",
        },
      },
    ],
    cheatSheet: [
      "A custom hook is a function named useSomething that calls other hooks",
      "Each call gets its own state; hooks share logic, not data",
      "Call hooks at the top level, in the same order every render",
      "Return a value, a tuple or an object depending on how many results there are",
      "Wrap returned functions in useCallback if callers may use them as dependencies",
      "Browser or store subscriptions: useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)",
      "Test hooks with renderHook from @testing-library/react",
      "Server data? Prefer TanStack Query, SWR or server components over a homemade useFetch",
    ],
    quiz: [
      {
        q: "How does React know which state belongs to which useState call?",
        options: ["By the variable name", "By the order of hook calls in each render", "By a hidden id in the JSX", "By the file name"],
        answer: 1,
        why: "Hook state is stored in call order, which is why that order must never change.",
      },
      {
        q: "Two components call useToggle(). One toggles. What happens to the other?",
        options: ["It toggles too", "It re-renders but keeps its value", "It throws an error", "Nothing; each call has independent state"],
        answer: 3,
        why: "Custom hooks reuse logic; every call creates its own state.",
      },
      {
        q: "What is getServerSnapshot for in useSyncExternalStore?",
        options: ["The value used during server rendering and hydration", "Fetching data from the server", "Caching the last value in localStorage", "Subscribing to server events"],
        answer: 0,
        why: "The server has no window, so React needs a safe value to render there and on the first client pass.",
      },
      {
        q: "A function named useFormatDate only calls Intl.DateTimeFormat. What should you do?",
        options: ["Keep it; all helpers should start with use", "Add a useEffect inside", "Rename it formatDate, since it calls no hooks", "Wrap it in useMemo"],
        answer: 2,
        why: "The use prefix signals hook rules; a plain function should not carry it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write useToggle(initial = false) that returns [value, toggle].",
        hint: "Use the updater form inside a stable callback.",
        solution: "import { useCallback, useState } from \"react\";\n\nexport function useToggle(initial = false) {\n  const [value, setValue] = useState(initial);\n  const toggle = useCallback(() => setValue((v) => !v), []);\n  return [value, toggle] as const;\n}",
      },
      {
        level: "medium",
        task: "Write useLocalStorage(key, initial) that works like useState but loads the starting value from localStorage and saves every change as JSON.",
        hint: "Use a lazy initializer that checks typeof window, and save in an effect.",
        solution: "export function useLocalStorage<T>(key: string, initial: T) {\n  const [value, setValue] = useState<T>(() => {\n    if (typeof window === \"undefined\") return initial;\n    const saved = window.localStorage.getItem(key);\n    return saved !== null ? (JSON.parse(saved) as T) : initial;\n  });\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n  return [value, setValue] as const;\n}",
      },
      {
        level: "hard",
        task: "Write useOnlineStatus() with useSyncExternalStore, listening to the online and offline window events, returning true on the server.",
        hint: "Define subscribe outside the component so it is stable.",
        solution: "import { useSyncExternalStore } from \"react\";\n\nfunction subscribe(cb: () => void) {\n  window.addEventListener(\"online\", cb);\n  window.addEventListener(\"offline\", cb);\n  return () => {\n    window.removeEventListener(\"online\", cb);\n    window.removeEventListener(\"offline\", cb);\n  };\n}\nexport function useOnlineStatus() {\n  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);\n}",
      },
    ],
    faq: [
      { q: "Can custom hooks share state between components?", a: "No, each call has its own state. To share state, lift it to a common parent, use context, or use an external store that the hook subscribes to." },
      { q: "Can I call a hook inside a regular function or a loop?", a: "No. Call hooks only at the top level of components and custom hooks. React 19's use is the only exception that may be called inside conditions and loops." },
      { q: "How do I test a custom hook?", a: "Use renderHook from @testing-library/react, read result.current, and wrap updates in act. For timers, use your test runner's fake timers." },
    ],
  },

  "react/react-perf": {
    plain: [
      "Re-rendering means React calls your component function again to see what the screen should look like. It sounds expensive, but usually it is fast: React then compares the result with the last one and changes only the parts of the page that are different.",
      "A component re-renders when its own state changes, when its parent re-renders, or when a context it reads changes. Note that a parent re-render re-renders all its children by default, even if their props did not change.",
      "Most apps never need performance tuning. When something does feel slow, like typing lag in a big list, do not guess. Open the React DevTools Profiler, record the slow action, and see which components took the most time.",
      "Then fix the real cause. Often moving state closer to where it is used is enough. Tools like memo, useMemo and useCallback help in specific cases, and the React Compiler can now add that memoization for you automatically.",
    ],
    deepDive: [
      {
        heading: "Render is cheap, commit is targeted",
        body: "React work has two phases. In the render phase, React calls component functions and builds a new tree of elements. In the commit phase, it applies only the differences to the DOM. A component can render many times without touching the DOM at all if its output is the same.\n\nRenders become a problem in three situations: a component does expensive work in its body (sorting thousands of items, heavy formatting), a huge subtree re-renders on every keystroke, or the commit itself is big (thousands of DOM nodes). Each needs a different fix, which is why measuring comes first. Always judge speed on a production build: development builds include extra checks and Strict Mode double rendering, so they are much slower.",
      },
      {
        heading: "Profiling with React DevTools",
        body: "Install the React Developer Tools browser extension and open the Profiler tab. Click record, do the slow action, and stop. The flame chart shows every component that rendered in each commit, colored by how long it took; the ranked chart sorts them by time. In the settings, turn on Record why each component rendered while profiling, and the Profiler tells you whether props, state, hooks or the parent caused each render.\n\nThe Components tab setting Highlight updates when components render flashes a border around everything that re-renders, which quickly shows a whole page re-rendering on each keystroke. For deeper analysis, the Chrome DevTools Performance panel shows long tasks, and React 19.2 adds React-specific tracks there for scheduler and component work.",
        visual: {
          type: "cycle",
          title: "The performance loop",
          steps: [
            { label: "Notice", detail: "Lag while typing, scrolling or clicking" },
            { label: "Record", detail: "Profiler on a production-like build" },
            { label: "Find the cause", detail: "Slowest component and why it rendered" },
            { label: "Fix one thing", detail: "Move state, memo, defer, virtualize" },
            { label: "Measure again", detail: "Keep the change only if it helped" },
          ],
        },
      },
      {
        heading: "Structural fixes before memoization",
        body: "Two layout changes fix many slow renders without any memo. Move state down: if only a search input needs the query, keep the state in a small SearchBox component instead of the page, so typing re-renders SearchBox and not the whole page. Lift content up: if a component with changing state wraps expensive content, accept that content as children. The children elements were created by the parent, so they keep the same identity and React skips re-rendering them.\n\nFor urgent and non-urgent work, React has useTransition and useDeferredValue. Typing in an input is urgent; filtering a 5,000-row table can wait. useDeferredValue(query) gives a value that lags behind during fast typing, so React keeps the input responsive and renders the heavy list in the background. For very long lists, virtualization renders only the visible rows.",
        visual: {
          type: "compare",
          title: "Moving state down",
          columns: [
            { title: "State in Page", points: ["Page owns query", "Each keystroke re-renders Page", "Header, Chart and Table re-render too", "Typing feels slow"] },
            { title: "State in SearchBox", points: ["SearchBox owns query", "Each keystroke re-renders SearchBox", "Header, Chart and Table are untouched", "Typing feels instant"] },
          ],
        },
      },
      {
        heading: "memo, useMemo and useCallback precisely",
        body: "memo(Component) skips re-rendering when every prop is equal to last time by Object.is, a shallow comparison. Strings and numbers compare by value, but objects, arrays and functions compare by identity. So style={{ color: \"red\" }} or onClick={() => ...} written inline is new every render and defeats memo.\n\nuseMemo(() => compute(a, b), [a, b]) caches a calculated value until a or b change. Use it for expensive work, or to keep an object prop stable for a memo child. useCallback(fn, deps) is useMemo for functions: it keeps the same function identity, which only matters if a memo child or an effect depends on it. Each tool costs a little memory and comparison work, so wrapping everything can make code slower and harder to read.",
        bullets: ["memo: skip a child render when props are shallow-equal", "useMemo: cache an expensive value", "useCallback: keep a function identity stable", "Inline objects and arrow functions break memo"],
      },
      {
        heading: "The React Compiler",
        body: "React Compiler is a build-time tool, stable since its 1.0 release in late 2025, that reads your components and inserts memoization automatically. It caches JSX, values and callbacks at a fine level, often better than hand-written useMemo and useCallback, and it does so only where it is safe.\n\nIt relies on your code following the rules of React: pure render, no mutating props or state, hooks at the top level. Code that breaks the rules is skipped, not miscompiled, and the eslint-plugin-react-hooks rules flag the problems. In Next.js 16 you install babel-plugin-react-compiler and set reactCompiler: true in next.config.ts; Vite projects add the Babel plugin. With the compiler on, manual memo is mostly unnecessary in new code, but profiling still matters: it cannot fix an oversized list or a slow algorithm.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Why did this component re-render?",
        root: "Component re-rendered",
        children: [
          { label: "Its state changed", children: ["useState or useReducer setter", "Fix: move state down"] },
          { label: "Its parent re-rendered", children: ["Default for all children", "Fix: children prop or memo"] },
          { label: "A context it reads changed", children: ["Every consumer re-renders", "Fix: split or memoize the value"] },
          { label: "Props changed identity", children: ["Inline objects or functions", "Fix: useMemo or useCallback, or the compiler"] },
        ],
      },
    ],
    examples: [
      {
        title: "Keeping typing fast with useDeferredValue",
        explanation: "A product table with 5,000 rows filters on every keystroke and typing lags. Step 1: keep the input bound to query, which updates urgently. Step 2: create deferredQuery with useDeferredValue. Step 3: pass deferredQuery to the memoized table, so React can render it in the background and interrupt that work when a new key is pressed. Step 4: dim the table while it is stale.",
        code: {
          lang: "tsx",
          code: "import { memo, useDeferredValue, useState } from \"react\";\n\nconst ProductTable = memo(function ProductTable({ query }: { query: string }) {\n  const rows = PRODUCTS.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));\n  return <ul>{rows.map((p) => <li key={p.id}>{p.name}</li>)}</ul>;\n});\n\nexport function Search() {\n  const [query, setQuery] = useState(\"\");\n  const deferredQuery = useDeferredValue(query);\n  const stale = query !== deferredQuery;\n  return (<>\n    <input value={query} onChange={(e) => setQuery(e.target.value)} aria-label=\"Search\" />\n    <div style={{ opacity: stale ? 0.6 : 1 }}><ProductTable query={deferredQuery} /></div>\n  </>);\n}\ndeclare const PRODUCTS: { id: string; name: string }[];",
        },
      },
      {
        title: "Making memo actually work for list rows",
        explanation: "The Profiler shows every TodoRow re-rendering when one todo toggles, even though TodoRow is wrapped in memo. Step 1: check why each rendered; the onToggle prop changed. Step 2: the parent creates onToggle inline, so it is a new function each render. Step 3: wrap it in useCallback and use the updater form so it does not depend on todos. Now only the changed row re-renders.",
        code: {
          lang: "tsx",
          code: "import { memo, useCallback, useState } from \"react\";\n\ntype Todo = { id: string; text: string; done: boolean };\n\nconst TodoRow = memo(function TodoRow({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) {\n  return <li onClick={() => onToggle(todo.id)}>{todo.done ? \"[x]\" : \"[ ]\"} {todo.text}</li>;\n});\n\nexport function TodoList({ initial }: { initial: Todo[] }) {\n  const [todos, setTodos] = useState(initial);\n  const onToggle = useCallback((id: string) => {\n    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));\n  }, []);\n  return <ul>{todos.map((t) => <TodoRow key={t.id} todo={t} onToggle={onToggle} />)}</ul>;\n}",
        },
      },
    ],
    cheatSheet: [
      "Re-render triggers: own state, parent render, or a context it reads",
      "Profile a production build; development mode is much slower",
      "Profiler setting: Record why each component rendered while profiling",
      "Move state down, or pass expensive content as children, before using memo",
      "memo compares props with Object.is; inline objects and functions break it",
      "useDeferredValue keeps inputs responsive while heavy UI catches up",
      "React Compiler auto-memoizes; Next.js 16: reactCompiler: true in next.config.ts",
      "Thousands of rows: virtualize instead of memoizing each row",
    ],
    quiz: [
      {
        q: "A parent re-renders. Its child's props did not change and the child is not wrapped in memo. Does the child re-render?",
        options: ["No, React skips it automatically", "Only if it uses context", "Yes, children re-render with their parent by default", "Only in development"],
        answer: 2,
        why: "Without memo, React re-renders the whole subtree under a component that rendered.",
      },
      {
        q: "A memo child receives style={{ padding: 8 }} written inline. What happens?",
        options: ["It re-renders every time, because the object is new each render", "It never re-renders", "memo compares the object deeply, so it skips", "React throws a warning"],
        answer: 0,
        why: "memo uses Object.is per prop, and a new object literal has a new identity each time.",
      },
      {
        q: "Typing in a search box lags because a big table filters on each keystroke. Which hook is designed for this?",
        options: ["useLayoutEffect", "useRef", "useReducer", "useDeferredValue"],
        answer: 3,
        why: "It lets React render the heavy part with a lagging value while keeping the input urgent.",
      },
      {
        q: "What does the React Compiler do?",
        options: ["Converts React to plain HTML", "Adds memoization automatically at build time", "Removes unused components", "Replaces the virtual DOM"],
        answer: 1,
        why: "It analyzes components and inserts fine-grained caching where it is safe.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Turn on Highlight updates in React DevTools, type into any input in your app, and list which components flash. Write down one that should not re-render.",
        hint: "The setting is in the Components tab settings (gear icon), under General.",
        solution: "1. Open DevTools > Components > settings gear.\n2. Enable \"Highlight updates when components render\".\n3. Type in the input and watch the borders.\n4. Example finding: the whole Page and its Footer flash on each\n   keystroke because the query state lives in Page.\n   Fix idea: move the state into the SearchBox component.",
      },
      {
        level: "medium",
        task: "A Page holds a ticking clock in state (updates every second) and also renders an ExpensiveChart. Restructure it so the chart does not re-render every second, without using memo.",
        hint: "Move the clock state into its own component.",
        solution: "function Clock() {\n  const [now, setNow] = useState(() => new Date());\n  useEffect(() => {\n    const id = setInterval(() => setNow(new Date()), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <p>{now.toLocaleTimeString()}</p>;\n}\n\nexport function Page() {\n  return (<><Clock /><ExpensiveChart /></>); // Page no longer re-renders\n}",
      },
      {
        level: "hard",
        task: "A memo ProductCard gets product, onAdd and a formatted price object { amount, currency } built inline in the parent. Fix the parent so ProductCard only re-renders when its product changes.",
        hint: "Stabilize the function with useCallback and avoid the inline object (pass primitives or useMemo).",
        solution: "const onAdd = useCallback((id: string) => {\n  setCart((c) => [...c, id]);\n}, []);\n\n// Option A: pass primitives instead of an object\n<ProductCard product={p} onAdd={onAdd} amount={p.price} currency=\"EUR\" />\n\n// Option B: memoize the object per render of the list\nconst price = useMemo(() => ({ amount: p.price, currency: \"EUR\" }), [p.price]);\n// (useMemo must be called inside a component, e.g. a row wrapper)",
      },
    ],
    faq: [
      { q: "Should I wrap every component in React.memo?", a: "No. memo adds comparison work and only helps when props stay equal and the render is costly. Measure first, or let the React Compiler handle it." },
      { q: "Do I still need useMemo and useCallback with the React Compiler?", a: "Rarely in new code, because the compiler memoizes automatically. They are still useful as escape hatches, for example to keep an effect dependency stable in code the compiler skips." },
      { q: "Why is my React app slow only in development?", a: "Development builds add warnings, extra checks and Strict Mode double rendering. Always measure performance on a production build." },
    ],
  },
};

export default extra;
