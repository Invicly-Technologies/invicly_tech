import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "testing/vitest": {
    plain: [
      "A unit test is a tiny program that checks one small piece of your code. You give a function some input and check that the output is what you expect. If someone breaks that function later, the test fails and tells them right away.",
      "Vitest is a test runner for JavaScript and TypeScript projects. It finds your test files, runs them very fast and shows which checks passed. In watch mode it re-runs only the tests affected by the file you just saved, so you get feedback in about a second.",
      "Some code depends on things that are slow or unpredictable: the network, the clock, random numbers. In tests you replace these with fakes called mocks. A mock returns exactly what you tell it to, and it records how it was called.",
      "Unit tests are cheap to write and fast to run, so you can have hundreds of them. They are best for logic: formatting, validation, calculations and custom React hooks. Whole pages and user flows are better covered by component and end-to-end tests.",
    ],
    deepDive: [
      {
        heading: "Setting up Vitest in a React or Next.js project",
        body: "Install it with npm install -D vitest. For React components and hooks you also need a simulated browser DOM, so add jsdom (or happy-dom), @vitejs/plugin-react and the Testing Library packages. Create vitest.config.ts with defineConfig from vitest/config, add the React plugin, and set test.environment to \"jsdom\". A setupFiles entry runs before every test file, which is where you import @testing-library/jest-dom/vitest for matchers like toBeInTheDocument.\n\nAdd \"test\": \"vitest\" to package.json scripts. npm test then starts watch mode on your machine, while vitest run (or any environment where the CI variable is set) runs once and exits with a non-zero code on failure. Vitest finds files ending in .test.ts, .spec.ts and their tsx versions. Set globals: true if you want describe, it and expect without imports; otherwise import them from vitest, which keeps types explicit.",
        bullets: ["npx vitest run src/utils runs only tests under that folder", "npx vitest -t \"slugify\" runs tests whose name matches", "npx vitest run --coverage with @vitest/coverage-v8 installed"],
      },
      {
        heading: "Writing good tests for pure functions",
        body: "A pure function always returns the same output for the same input and changes nothing outside itself. That makes it ideal for unit tests: no setup, no cleanup. Cover the normal case, then the edges: empty strings and arrays, zero and negative numbers, very long input, unusual characters, and values exactly on a boundary such as a 10-character limit.\n\nChoose the right matcher. toBe compares with Object.is, so use it for numbers, strings and booleans. toEqual compares objects and arrays by their contents; toStrictEqual also checks undefined properties and class types. For errors, wrap the call: expect(() => parse(\"\")).toThrow(\"empty\"). For promises, use await expect(load()).resolves.toEqual(...) or .rejects.toThrow(). test.each takes a table of cases and creates one test per row, which keeps edge cases visible and cheap to add.",
        bullets: ["expect(0.1 + 0.2).toBeCloseTo(0.3) for floating point", "expect(list).toContain(\"a\") and expect(obj).toMatchObject({ id: 1 })", "it.each([[1, \"1st\"], [2, \"2nd\"]])(\"ordinal(%i)\", ...)"],
      },
      {
        heading: "Testing custom hooks with renderHook",
        body: "Hooks can only run inside a React component, so Testing Library provides renderHook. It renders a tiny invisible component that calls your hook and gives you result.current, the latest value the hook returned. To pass new arguments, call rerender with new props, which simulates the parent component re-rendering.\n\nWhen your test triggers a state update directly, for example by calling a function returned from the hook or by advancing fake timers, wrap it in act(). act tells React to process the update and re-render before your next line runs, so result.current is fresh. Read result.current after the update, not before: if you save it in a variable early, you keep the old value. Hooks that need a context provider (a theme, a router, a query client) take a wrapper option, a component that renders the providers around the hook.",
        visual: {
          type: "sequence",
          title: "renderHook and a state update",
          actors: ["Test", "renderHook", "useCounter"],
          messages: [
            { from: 0, to: 1, label: "renderHook(() => useCounter(5))" },
            { from: 1, to: 2, label: "Call hook inside a test component" },
            { from: 2, to: 1, label: "Return { count: 5, increment }" },
            { from: 0, to: 2, label: "act(() => result.current.increment())" },
            { from: 2, to: 1, label: "Re-render, return { count: 6 }" },
            { from: 0, to: 1, label: "expect(result.current.count).toBe(6)" },
          ],
        },
      },
      {
        heading: "Mocks, spies and fake timers",
        body: "vi.fn() creates a fake function that records every call; check it with toHaveBeenCalledWith or toHaveBeenCalledTimes. vi.spyOn(object, \"method\") wraps a real method so you can watch it or replace its result with mockReturnValue or mockResolvedValue. vi.mock(\"./api\") replaces a whole module for this test file. Vitest hoists vi.mock calls to the top of the file, before imports, so the code under test receives the fake. Use vi.mocked(fn) to get proper TypeScript types on a mocked import.\n\nvi.useFakeTimers() swaps setTimeout, setInterval and Date for controllable versions. vi.advanceTimersByTime(300) jumps 300 ms instantly, vi.runAllTimers() runs everything pending, and vi.setSystemTime(new Date(\"2026-01-01\")) fixes the clock. Always undo fakes in afterEach (vi.useRealTimers(), vi.restoreAllMocks()), or enable restoreMocks in the config, so one test cannot leak into the next.",
        visual: {
          type: "compare",
          title: "Three kinds of test doubles in Vitest",
          columns: [
            { title: "vi.fn()", points: ["A brand-new fake function", "Pass it as a callback prop", "Records calls and arguments"] },
            { title: "vi.spyOn()", points: ["Wraps an existing method", "Can keep or replace the real behaviour", "Restore with mockRestore()"] },
            { title: "vi.mock()", points: ["Replaces a whole module", "Hoisted above imports", "Good for API clients"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "The testing pyramid for a React app",
        layers: [
          { label: "E2E (Playwright)", detail: "A few critical flows in a real browser" },
          { label: "Component (Testing Library)", detail: "Components as users see them" },
          { label: "Unit (Vitest)", detail: "Many fast tests for logic and hooks" },
          { label: "Static checks", detail: "TypeScript and ESLint catch typos for free" },
        ],
      },
    ],
    examples: [
      {
        title: "Testing a debounce hook with fake timers",
        explanation: "useDebounce(value, 300) should return the old value until 300 ms pass without a change. Step 1: switch to fake timers before each test. Step 2: renderHook with initialProps so the value can change. Step 3: rerender with a new value and check the old one is still returned. Step 4: advance time inside act and check the new value appears.",
        code: {
          lang: "tsx",
          code: "import { renderHook, act } from '@testing-library/react';\nimport { afterEach, beforeEach, expect, it, vi } from 'vitest';\nimport { useDebounce } from './useDebounce';\n\nbeforeEach(() => vi.useFakeTimers());\nafterEach(() => vi.useRealTimers());\n\nit('updates only after the delay', () => {\n  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: 'a' } });\n  rerender({ v: 'ab' });\n  expect(result.current).toBe('a');\n  act(() => vi.advanceTimersByTime(300));\n  expect(result.current).toBe('ab');\n});",
        },
      },
      {
        title: "Mocking an API module",
        explanation: "getGreeting(id) calls fetchUser from ./api and builds a sentence. The test must not hit the network. Step 1: vi.mock replaces ./api with an object whose fetchUser is a vi.fn. Step 2: vi.mocked gives it types, and mockResolvedValue sets what the promise returns. Step 3: assert on the result with resolves. Step 4: check the mock was called with the right id.",
        code: {
          lang: "ts",
          code: "import { expect, it, vi } from 'vitest';\nimport { fetchUser } from './api';\nimport { getGreeting } from './greeting';\n\nvi.mock('./api', () => ({ fetchUser: vi.fn() }));\n\nit('greets the user by name', async () => {\n  vi.mocked(fetchUser).mockResolvedValue({ id: '1', name: 'Asha' });\n  await expect(getGreeting('1')).resolves.toBe('Hello, Asha!');\n  expect(fetchUser).toHaveBeenCalledWith('1');\n});",
        },
      },
    ],
    cheatSheet: [
      "npm install -D vitest jsdom @vitejs/plugin-react @testing-library/react",
      "vitest = watch mode; vitest run = run once (use in CI)",
      "toBe for primitives, toEqual for objects and arrays, toThrow for errors",
      "await expect(promise).resolves.toEqual(x) / .rejects.toThrow()",
      "vi.fn(), vi.spyOn(obj, \"m\"), vi.mock(\"./module\") (hoisted)",
      "vi.useFakeTimers(); vi.advanceTimersByTime(ms); vi.useRealTimers()",
      "renderHook(() => useX()) then read result.current after act()",
      "Restore mocks in afterEach or set restoreMocks: true in the config",
    ],
    quiz: [
      {
        q: "Which matcher should compare two arrays by their contents?",
        options: ["toBe", "toEqual", "toBeTruthy", "toHaveLength"],
        answer: 1,
        why: "toBe checks identity with Object.is; toEqual compares contents recursively.",
      },
      {
        q: "Why does vi.mock work even though it appears after the import lines?",
        options: ["Vitest hoists vi.mock calls above the imports", "Imports are lazy in Vitest", "It only works with globals: true", "It does not; it must come first"],
        answer: 0,
        why: "Vitest moves vi.mock to the top of the file so the module is replaced before anything imports it.",
      },
      {
        q: "A test calls a function returned by a hook that sets state. What should wrap the call?",
        options: ["waitFor", "setTimeout", "vi.fn", "act"],
        answer: 3,
        why: "act makes React process the update so result.current shows the new value.",
      },
      {
        q: "How do you run the suite once and exit, as CI needs?",
        options: ["vitest --watch", "vitest dev", "vitest run", "vitest --ui"],
        answer: 2,
        why: "vitest run executes once and returns a failing exit code if any test fails.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write tests for formatPrice(cents: number) that returns strings like $12.50, covering 0, 5 and 1250.",
        hint: "Use it.each with a table of [input, expected].",
        solution: "import { expect, it } from 'vitest';\nimport { formatPrice } from './formatPrice';\n\nit.each([\n  [0, '$0.00'],\n  [5, '$0.05'],\n  [1250, '$12.50'],\n])('formatPrice(%i) is %s', (cents, expected) => {\n  expect(formatPrice(cents)).toBe(expected);\n});",
      },
      {
        level: "medium",
        task: "Test a useToggle(initial) hook that returns [value, toggle]: it starts with initial and flips on each toggle call.",
        hint: "Call result.current[1]() inside act, then read result.current[0].",
        solution: "import { act, renderHook } from '@testing-library/react';\nimport { expect, it } from 'vitest';\nimport { useToggle } from './useToggle';\n\nit('flips the value', () => {\n  const { result } = renderHook(() => useToggle(false));\n  expect(result.current[0]).toBe(false);\n  act(() => result.current[1]());\n  expect(result.current[0]).toBe(true);\n});",
      },
      {
        level: "hard",
        task: "isExpired(token) compares token.expiresAt (ms) with Date.now(). Test it at exactly the expiry moment and one millisecond after, without depending on the real clock.",
        hint: "vi.useFakeTimers() then vi.setSystemTime(ms). Decide whether equal counts as expired.",
        solution: "import { afterEach, expect, it, vi } from 'vitest';\nimport { isExpired } from './token';\n\nafterEach(() => vi.useRealTimers());\nit('expires after expiresAt', () => {\n  vi.useFakeTimers();\n  const token = { expiresAt: 1_000_000 };\n  vi.setSystemTime(1_000_000);\n  expect(isExpired(token)).toBe(false);\n  vi.setSystemTime(1_000_001);\n  expect(isExpired(token)).toBe(true);\n});",
      },
    ],
    faq: [
      { q: "Vitest or Jest for a new project?", a: "Vitest is the common choice for Vite and modern Next.js projects: it handles TypeScript and ES modules without extra setup and is very fast. Its API is close to Jest's, so most Jest knowledge carries over." },
      { q: "Can I test async Server Components with Vitest?", a: "Not reliably today; the Next.js docs recommend end-to-end tests for async Server Components. Test their logic by moving it into plain functions you can unit test." },
      { q: "Should I aim for 100 percent code coverage?", a: "No. Coverage shows which lines never ran, which is useful, but 100 percent does not mean the tests check the right things. Focus on logic that would hurt users if it broke." },
      { q: "What is the difference between jsdom and happy-dom?", a: "Both simulate a browser DOM inside Node. jsdom is older and more complete; happy-dom is often faster but implements less. Start with jsdom unless speed becomes a problem." },
    ],
  },

  "testing/rtl": {
    plain: [
      "A component test renders one React component, for example a login form, and then uses it the way a person would. It finds the email box by its label, types into it, clicks the button and checks what appears on screen.",
      "React Testing Library is the standard tool for this. Its main idea is simple: the more your tests look like the way people use your app, the more you can trust them. So you never check a component's internal state; you check the text, buttons and messages a user would see.",
      "Tests written this way keep passing when you refactor. You can rename a state variable, split a component in two or switch from useState to a reducer, and the test still passes as long as the user sees the same thing.",
      "There is a bonus. Finding elements by their role and label only works if they are accessible. So a test that can find the Sign in button by role is also a quick check that screen reader users can find it too.",
    ],
    deepDive: [
      {
        heading: "Rendering and the screen object",
        body: "render(component) mounts the component into a document.body provided by jsdom, a browser simulation that runs in Node. After that, the screen object queries the whole document, so you rarely need the values render returns. Testing Library unmounts everything after each test automatically when your runner exposes a global afterEach (in Vitest, set globals: true or call cleanup yourself).\n\nComponents often need providers: a router, a theme, a data-fetching client or a context with the current user. Pass a wrapper option to render, or write your own renderWithProviders helper once and use it everywhere. Install @testing-library/jest-dom and import it in the setup file to get readable matchers: toBeInTheDocument, toBeVisible, toHaveTextContent, toBeDisabled, toHaveValue and toHaveAccessibleName. When a test fails and you cannot see why, screen.debug() prints the current DOM.",
        bullets: ["screen.debug() prints the DOM; logRoles(container) lists roles", "render(ui, { wrapper: Providers })", "Keep providers in one test-utils file"],
      },
      {
        heading: "Choosing the right query",
        body: "Each query comes in three flavours. getBy returns the element, and throws if there are none or more than one; use it for things that should be there now. queryBy returns null instead of throwing, so it is the only good way to assert that something is absent: expect(screen.queryByText(/error/i)).not.toBeInTheDocument(). findBy returns a promise and retries until the element appears or a timeout passes (1000 ms by default); use it after anything asynchronous. Each has an All version (getAllBy and so on) for lists.\n\nTesting Library recommends a priority order based on how users find things. Prefer getByRole with a name option, such as getByRole(\"button\", { name: /save/i }). Then getByLabelText for form fields, getByPlaceholderText, getByText, getByDisplayValue, then getByAltText and getByTitle. getByTestId is the last resort, for elements with no accessible role or text.",
        visual: {
          type: "tree",
          title: "Query priority (try from left to right)",
          root: "Find an element",
          children: [
            { label: "Accessible to everyone", children: ["getByRole + name", "getByLabelText", "getByPlaceholderText", "getByText", "getByDisplayValue"] },
            { label: "Semantic attributes", children: ["getByAltText", "getByTitle"] },
            { label: "Last resort", children: ["getByTestId (data-testid)"] },
          ],
        },
      },
      {
        heading: "Simulating users with user-event",
        body: "@testing-library/user-event fires the full chain of browser events a real person causes. A click includes pointer down, mouse down, focus, pointer up, mouse up and click. Typing fires keydown, keypress, input and keyup for each character. The older fireEvent.click fires only the single click event, so it can miss bugs, such as a handler attached to onMouseDown.\n\nWith user-event version 14, call const user = userEvent.setup() at the start of the test, before render, and await every action: await user.type(input, \"hello\"), await user.click(button), await user.keyboard(\"{Enter}\"), await user.tab(), await user.selectOptions(select, \"fr\"), await user.clear(input). user-event also respects the rules of the page: it will not type into a disabled input, and clicking an element covered by pointer-events: none fails, just as it would for a person.",
        visual: {
          type: "compare",
          title: "fireEvent vs user-event",
          columns: [
            { title: "fireEvent.click", points: ["Dispatches one click event", "Synchronous", "Ignores focus and disabled rules", "Fine for rare low-level cases"] },
            { title: "user.click", points: ["Full pointer and mouse sequence", "Async: await every call", "Moves focus like a browser", "The default choice"] },
          ],
        },
      },
      {
        heading: "Asserting on visible output, including async data",
        body: "Assert on what the user can perceive: text that appears, a button that becomes disabled, an input's value, an element that disappears. Avoid checking props passed to child components, state values or CSS class names, which change during refactors without changing behaviour.\n\nFor data loaded with fetch, control the network. You can spy on globalThis.fetch with vi.spyOn and mockResolvedValue, or use Mock Service Worker (MSW), which intercepts requests at the network level so your component code stays untouched. Then wait for the result with await screen.findByText(...) or waitFor(() => expect(...)). Do not wrap getBy in waitFor just to be safe, and do not put side effects like clicks inside waitFor, because it may run them many times. If React warns that an update was not wrapped in act, it usually means something changed after the test ended; await the final state you expect.",
        bullets: ["await screen.findByRole(\"alert\")", "await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))", "within(row).getByRole(\"button\", { name: /delete/i })"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "getBy, queryBy and findBy",
        columns: [
          { title: "getBy", points: ["Returns the element now", "Throws if 0 or 2+ matches", "For things already on screen"] },
          { title: "queryBy", points: ["Returns element or null", "Never throws for 0 matches", "For asserting something is absent"] },
          { title: "findBy", points: ["Returns a promise", "Retries until found or timeout", "For content that appears later"] },
        ],
      },
    ],
    examples: [
      {
        title: "A list that loads from an API",
        explanation: "UserList fetches /api/users on mount, shows Loading... and then a list. Step 1: spy on fetch and return a fake response with two users. Step 2: render and check the loading text with getByText, because it is there immediately. Step 3: findAllByRole waits for the list items. Step 4: queryByText proves the loading text is gone.",
        code: {
          lang: "tsx",
          code: "import { render, screen } from '@testing-library/react';\nimport { expect, it, vi } from 'vitest';\nimport { UserList } from './UserList';\n\nit('shows users after loading', async () => {\n  vi.spyOn(globalThis, 'fetch').mockResolvedValue({\n    ok: true, json: async () => [{ id: 1, name: 'Asha' }, { id: 2, name: 'Ben' }],\n  } as Response);\n  render(<UserList />);\n  expect(screen.getByText(/loading/i)).toBeInTheDocument();\n  expect(await screen.findAllByRole('listitem')).toHaveLength(2);\n  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();\n});",
        },
      },
      {
        title: "Clicking the right button inside a list row",
        explanation: "Every row in a todo list has its own Delete button, so getByRole(\"button\", { name: /delete/i }) would find several and throw. Step 1: pass a vi.fn as the onDelete prop. Step 2: pick the second row with getAllByRole. Step 3: within(row) limits the search to that row. Step 4: assert the callback got the second todo's id.",
        code: {
          lang: "tsx",
          code: "import { render, screen, within } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { expect, it, vi } from 'vitest';\nimport { TodoList } from './TodoList';\n\nit('deletes the chosen todo', async () => {\n  const user = userEvent.setup();\n  const onDelete = vi.fn();\n  render(<TodoList todos={[{ id: 'a', text: 'Milk' }, { id: 'b', text: 'Eggs' }]} onDelete={onDelete} />);\n  const row = screen.getAllByRole('listitem')[1];\n  await user.click(within(row).getByRole('button', { name: /delete/i }));\n  expect(onDelete).toHaveBeenCalledWith('b');\n});",
        },
      },
    ],
    cheatSheet: [
      "getBy: must exist now; queryBy: may be absent; findBy: will appear (async)",
      "screen.getByRole(\"button\", { name: /save/i }) is the default query",
      "const user = userEvent.setup(); then await user.click / type / keyboard",
      "expect(screen.queryByText(/x/)).not.toBeInTheDocument() checks absence",
      "within(element) scopes queries to part of the page",
      "import \"@testing-library/jest-dom/vitest\" in the setup file for matchers",
      "screen.debug() prints the DOM when a query fails",
      "Mock the network (vi.spyOn on fetch, or MSW), not your component internals",
    ],
    quiz: [
      {
        q: "Which query should you use to check that an error message is NOT shown?",
        options: ["getByText", "findByText", "queryByText", "getAllByText"],
        answer: 2,
        why: "queryBy returns null when nothing matches, so you can assert absence without an exception.",
      },
      {
        q: "Why is user.click usually better than fireEvent.click?",
        options: ["It fires the full sequence of events a real user causes", "It is synchronous", "It works without render", "It skips disabled checks"],
        answer: 0,
        why: "user-event simulates pointer, mouse and focus events, so it catches bugs a single click event would miss.",
      },
      {
        q: "A component shows data after a fetch. Which line waits for it correctly?",
        options: ["screen.getByText(\"Asha\")", "await screen.findByText(\"Asha\")", "screen.queryByText(\"Asha\")", "setTimeout(() => screen.getByText(\"Asha\"), 100)"],
        answer: 1,
        why: "findBy retries until the element appears or the timeout passes.",
      },
      {
        q: "getByRole(\"button\", { name: /delete/i }) throws because there are five Delete buttons. What is the cleanest fix?",
        options: ["Use getByTestId on every button", "Use fireEvent instead", "Add a CSS class to each button", "Scope the query with within(row)"],
        answer: 3,
        why: "within limits the search to one row, keeping the query user-facing.",
      },
      {
        q: "Which assertion best follows Testing Library's philosophy?",
        options: ["The component's isOpen state is true", "The dialog with the name Settings is visible", "The div has the class modal-open", "setOpen was called once"],
        answer: 1,
        why: "It checks what the user perceives, so it survives refactors of state and styling.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Test that a Counter component shows Count: 0 and Count: 1 after clicking the Increment button.",
        hint: "getByRole for the button, getByText for the count.",
        solution: "import { render, screen } from '@testing-library/react';\nimport userEvent from '@testing-library/user-event';\nimport { expect, it } from 'vitest';\nimport { Counter } from './Counter';\n\nit('increments', async () => {\n  const user = userEvent.setup();\n  render(<Counter />);\n  expect(screen.getByText('Count: 0')).toBeInTheDocument();\n  await user.click(screen.getByRole('button', { name: /increment/i }));\n  expect(screen.getByText('Count: 1')).toBeInTheDocument();\n});",
      },
      {
        level: "medium",
        task: "A SignupForm's Submit button is disabled until the Email field has text. Test both states.",
        hint: "toBeDisabled and toBeEnabled come from jest-dom; type with user.type.",
        solution: "it('enables submit when email is filled', async () => {\n  const user = userEvent.setup();\n  render(<SignupForm />);\n  const submit = screen.getByRole('button', { name: /submit/i });\n  expect(submit).toBeDisabled();\n  await user.type(screen.getByLabelText(/email/i), 'a@b.co');\n  expect(submit).toBeEnabled();\n});",
      },
      {
        level: "hard",
        task: "A SearchBox calls onSearch(query) when the user presses Enter, but not for an empty query. Test both cases with a mock function.",
        hint: "user.type(input, \"react{Enter}\") types and presses Enter in one call.",
        solution: "it('searches on Enter, ignores empty input', async () => {\n  const user = userEvent.setup();\n  const onSearch = vi.fn();\n  render(<SearchBox onSearch={onSearch} />);\n  const box = screen.getByRole('searchbox');\n  await user.type(box, '{Enter}');\n  expect(onSearch).not.toHaveBeenCalled();\n  await user.type(box, 'react{Enter}');\n  expect(onSearch).toHaveBeenCalledWith('react');\n});",
      },
    ],
    faq: [
      { q: "What is the difference between React Testing Library and Jest or Vitest?", a: "Vitest or Jest is the test runner: it finds and runs tests and provides expect. React Testing Library renders components and offers user-centred queries. You use them together." },
      { q: "When is it OK to use data-testid?", a: "When an element has no accessible role, label or text that identifies it, such as a decorative chart container. Treat it as a last resort, because it does not check accessibility." },
      { q: "Why do I get a warning that an update was not wrapped in act?", a: "Something in the component updated state after your test stopped waiting, often a fetch that resolved late. Await the final UI state with findBy or waitFor so the update happens inside the test." },
      { q: "Should I use snapshot tests for components?", a: "Use them sparingly. Large snapshots break on every markup change and get approved without reading. Specific assertions on visible text and roles are clearer and more stable." },
    ],
  },

  "testing/playwright": {
    plain: [
      "An end-to-end test, or E2E test, checks your whole app the way a real user meets it: a real browser opens your site, clicks links, fills forms and checks what appears. If the database, the server and the page all work together, the test passes.",
      "Playwright is a tool from Microsoft for writing these tests. One test can run in Chromium, Firefox and WebKit, the engine behind Safari. It can run with a visible window while you watch, or headless (without a window) on a server.",
      "Older E2E tools were famous for flaky tests that passed one day and failed the next, often because the test clicked before the page was ready. Playwright waits automatically until an element is visible and ready before acting, which removes most of that flakiness.",
      "E2E tests are slower than unit tests, so you write only a handful, for the flows that must never break: signing in, the main task of your app, and paying if you take payments. Then you run them on every pull request.",
    ],
    deepDive: [
      {
        heading: "Installing Playwright and recording a first test",
        body: "Run npm init playwright@latest in your project. It asks a few questions, then creates playwright.config.ts, a tests folder with an example, optionally a GitHub Actions workflow, and downloads browser builds. On a new machine or CI runner, npx playwright install --with-deps installs the browsers plus the system libraries they need.\n\nnpx playwright codegen http://localhost:3000 opens a browser and an inspector window. Everything you click and type is turned into test code using recommended locators, which you can copy into a file. Treat it as a starting point: rename the test, remove extra steps, and add expect assertions for what should be true after each important action. Run tests with npx playwright test, open the interactive UI mode with --ui, or step through one test with --debug. After a run, npx playwright show-report opens the HTML report.",
        bullets: ["npx playwright test tests/login.spec.ts --project=chromium", "npx playwright test --headed shows the browser", "npx playwright test -g \"sign in\" filters by title"],
      },
      {
        heading: "Locators, auto-waiting and web-first assertions",
        body: "A locator, such as page.getByRole(\"button\", { name: \"Save\" }), is a description of how to find an element, not the element itself. Playwright looks it up again every time you use it, so it survives re-renders. Locators are strict: if an action matches more than one element, Playwright throws instead of guessing. Narrow it with a parent locator, filter({ hasText }), or a more specific name.\n\nBefore every action Playwright runs actionability checks. For a click, the element must be attached, visible, stable (not animating), able to receive events (not covered by another element) and enabled. It retries until these pass or the action times out. Assertions like await expect(locator).toBeVisible(), toHaveText, toHaveValue and expect(page).toHaveURL also retry, by default for up to 5 seconds. That is why you should never need page.waitForTimeout: wait for a state, not for a number of seconds.",
        visual: {
          type: "flow",
          title: "What happens inside locator.click()",
          steps: [
            { label: "Resolve locator", detail: "Exactly one element, or a strictness error" },
            { label: "Check actionable", detail: "Visible, stable, enabled, not covered" },
            { label: "Retry if not", detail: "Until the action timeout" },
            { label: "Scroll into view", detail: "Then click at its centre" },
            { label: "Next step", detail: "Assertions retry the same way" },
          ],
        },
      },
      {
        heading: "Testing sign-in once and reusing the session",
        body: "Every Playwright test gets a fresh browser context, like a new private window with no cookies, so tests cannot affect each other. That isolation is good, but logging in through the form before every test is slow. The recommended pattern is a setup project: one test signs in, then saves cookies and local storage with page.context().storageState({ path: \"playwright/.auth/user.json\" }).\n\nIn playwright.config.ts, other projects declare dependencies: [\"setup\"] and use: { storageState: \"playwright/.auth/user.json\" }, so they start already signed in. Keep the auth folder in .gitignore, because it contains a real session. Still keep one test that goes through the sign-in form itself, including a wrong password, so the login page is covered. Use a dedicated test account with credentials from environment variables, never a real user's account.",
        visual: {
          type: "sequence",
          title: "Setup project and dependent tests",
          actors: ["setup project", "App", "Auth file", "Other tests"],
          messages: [
            { from: 0, to: 1, label: "Fill login form, submit" },
            { from: 1, to: 0, label: "Set session cookie" },
            { from: 0, to: 2, label: "storageState saved" },
            { from: 3, to: 2, label: "New context loads the state" },
            { from: 3, to: 1, label: "Open /dashboard, already signed in" },
          ],
        },
      },
      {
        heading: "Running Playwright in CI without flakiness",
        body: "The webServer option in the config starts your app before the tests, for example command: \"npm run build && npm run start\" with url: \"http://localhost:3000\" and reuseExistingServer: !process.env.CI. Test against a production build, which behaves like the real site, rather than the dev server. Set use.baseURL so tests can call page.goto(\"/login\").\n\nThe generated config already sets retries: 2 and workers: 1 when the CI variable is present, and trace: \"on-first-retry\". A trace records every action with DOM snapshots, network calls and console logs; upload the playwright-report folder as a CI artifact and open a trace with npx playwright show-trace or at trace.playwright.dev. A test that passes only on retry is reported as flaky: fix it rather than ignore it. Common causes are shared test data, missing awaits and depending on test order. Give each test its own data, or reset the database before the run.",
        bullets: ["retries: process.env.CI ? 2 : 0", "use: { baseURL: \"http://localhost:3000\", trace: \"on-first-retry\" }", "page.route(urlPattern, route => route.fulfill({ json: data })) mocks one API call"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What playwright.config.ts controls",
        root: "playwright.config.ts",
        children: [
          { label: "testDir and timeouts", children: ["Where tests live", "30 s per test by default"] },
          { label: "use", children: ["baseURL", "trace and screenshot", "storageState"] },
          { label: "projects", children: ["setup", "chromium, firefox, webkit", "Mobile devices"] },
          { label: "webServer", children: ["Command to start the app", "URL to wait for"] },
          { label: "CI behaviour", children: ["retries", "workers", "reporter"] },
        ],
      },
    ],
    examples: [
      {
        title: "A setup project that signs in once",
        explanation: "Step 1: a file named auth.setup.ts uses test as setup and signs in through the real form. Step 2: it waits until the URL shows the dashboard, proving the login worked. Step 3: it saves the browser state to a file. Step 4: in the config, the chromium project depends on setup and loads that file, so every other test starts signed in.",
        code: {
          lang: "ts",
          code: "// tests/auth.setup.ts\nimport { test as setup, expect } from '@playwright/test';\nconst authFile = 'playwright/.auth/user.json';\n\nsetup('sign in', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill(process.env.E2E_EMAIL!);\n  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page).toHaveURL(/dashboard$/);\n  await page.context().storageState({ path: authFile });\n});\n// playwright.config.ts, projects:\n// { name: 'setup', testMatch: /.*\\.setup\\.ts/ },\n// { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: authFile }, dependencies: ['setup'] }",
        },
      },
      {
        title: "Running E2E tests on every pull request",
        explanation: "Step 1: check out the code and install dependencies from the lockfile. Step 2: install only the Chromium browser and its system libraries to save time. Step 3: run the tests; the config's webServer builds and starts the app. Step 4: always upload the HTML report, unless the run was cancelled, so you can open traces of any failure.",
        code: {
          lang: "yaml",
          code: "name: E2E\non: [pull_request]\njobs:\n  e2e:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci\n      - run: npx playwright install --with-deps chromium\n      - run: npx playwright test\n      - uses: actions/upload-artifact@v4\n        if: ${{ !cancelled() }}\n        with: { name: playwright-report, path: playwright-report/, retention-days: 7 }",
        },
      },
    ],
    cheatSheet: [
      "npm init playwright@latest sets up config, example tests and browsers",
      "npx playwright codegen localhost:3000 records actions as test code",
      "npx playwright test --ui for an interactive runner; --debug to step through",
      "page.getByRole / getByLabel / getByText are the preferred locators",
      "await expect(locator).toBeVisible() retries; never use waitForTimeout",
      "storageState plus a setup project: sign in once, reuse everywhere",
      "trace: \"on-first-retry\" then npx playwright show-trace trace.zip",
      "webServer in the config starts the app before the tests",
    ],
    quiz: [
      {
        q: "What does Playwright do if page.getByRole(\"button\", { name: \"Save\" }).click() matches two buttons?",
        options: ["Clicks the first one", "Clicks both", "Throws a strictness error", "Waits until one disappears"],
        answer: 2,
        why: "Locators are strict for actions, so ambiguous matches fail instead of clicking the wrong thing.",
      },
      {
        q: "How do most tests start already signed in without using the login form each time?",
        options: ["A setup project saves storageState that other projects load", "Turn off authentication in tests", "Share one browser context across all tests", "Set a cookie in playwright.config.ts by hand"],
        answer: 0,
        why: "The setup project logs in once and saves cookies and storage; dependent projects reuse the file.",
      },
      {
        q: "A test fails only in CI. What is the best first debugging tool?",
        options: ["Add waitForTimeout(5000)", "Delete the test", "Run it 100 times locally", "Open the recorded trace from the CI artifact"],
        answer: 3,
        why: "The trace shows each action with DOM snapshots, network and console output from the failing run.",
      },
      {
        q: "Which of these is NOT part of Playwright's actionability checks before a click?",
        options: ["The element is visible", "The element is enabled", "The element has a data-testid", "The element is not covered by another element"],
        answer: 2,
        why: "Playwright checks attached, visible, stable, receives events and enabled; test ids are optional.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a test that opens the home page and checks that the main heading Habit Tracker is visible and the page title contains Habit.",
        hint: "Use getByRole(\"heading\") and expect(page).toHaveTitle with a regex.",
        solution: "import { test, expect } from '@playwright/test';\n\ntest('home page', async ({ page }) => {\n  await page.goto('/');\n  await expect(page.getByRole('heading', { name: 'Habit Tracker' })).toBeVisible();\n  await expect(page).toHaveTitle(/Habit/);\n});",
      },
      {
        level: "medium",
        task: "Test that signing in with a wrong password shows an alert containing Invalid and keeps the user on /login.",
        hint: "getByRole(\"alert\") plus toContainText, and toHaveURL with a regex.",
        solution: "test('wrong password', async ({ page }) => {\n  await page.goto('/login');\n  await page.getByLabel('Email').fill('demo@example.com');\n  await page.getByLabel('Password').fill('wrong');\n  await page.getByRole('button', { name: 'Sign in' }).click();\n  await expect(page.getByRole('alert')).toContainText('Invalid');\n  await expect(page).toHaveURL(/login$/);\n});",
      },
      {
        level: "hard",
        task: "A signed-in user adds a habit called Read 10 pages and sees it in the list. Make the name unique per run so repeated runs do not clash.",
        hint: "Append Date.now() to the name, then find the list item by text.",
        solution: "test('add a habit', async ({ page }) => {\n  const name = `Read 10 pages ${Date.now()}`;\n  await page.goto('/habits');\n  await page.getByLabel('Habit name').fill(name);\n  await page.getByRole('button', { name: 'Add habit' }).click();\n  await expect(page.getByRole('listitem').filter({ hasText: name })).toBeVisible();\n});",
      },
    ],
    faq: [
      { q: "Playwright or Cypress?", a: "Both are good E2E tools. Playwright supports Chromium, Firefox and WebKit, runs tests in parallel for free and handles multiple tabs and origins easily, which is why many new projects choose it." },
      { q: "How many E2E tests should I write?", a: "Usually a small number, one per critical user flow such as sign-in, the main task and checkout. Cover details and edge cases with faster unit and component tests." },
      { q: "Should E2E tests use a real database?", a: "Yes, a dedicated test database that you seed or reset before the run, never production. You can mock external third-party APIs with page.route to keep tests stable." },
      { q: "Why does my test pass locally but time out in CI?", a: "CI machines are slower and start from a clean state: missing browsers, missing environment variables, a server that is not built, or data that exists only on your laptop. Check the trace and the webServer output." },
    ],
  },
};

export default extra;
