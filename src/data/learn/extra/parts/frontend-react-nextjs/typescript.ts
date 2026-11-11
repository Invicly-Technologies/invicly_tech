import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "typescript/ts-basics": {
    plain: [
      "JavaScript lets you pass anything anywhere. If a function expects a user object and you pass a number, you only find out when the code runs, often in front of a real user. TypeScript adds a checker that reads your code first and warns you in the editor, before anything runs.",
      "A type is a description of what a value looks like. string, number and boolean are simple types. An object type lists the fields and their types, for example a user has an id that is a number and a name that is a string.",
      "You do not have to write types everywhere. TypeScript can often work them out by itself, which is called inference. If you write const count = 3, it already knows count is a number. You mostly add types to function inputs and to shared data shapes.",
      "The most important thing to remember: types disappear when the code is compiled. They help you while writing, but they cannot stop a server from sending bad data. For data that comes from outside your program, you still need a runtime check.",
    ],
    deepDive: [
      {
        heading: "Structural typing: shape beats name",
        body: "TypeScript compares types by their shape, not by their name. If a function wants a value with id: number and name: string, any object that has at least those two fields is accepted, even if it was never declared as that type. This is called structural typing, and it matches how JavaScript objects really behave.\n\nThere is one extra safety net. When you pass an object literal directly, written inline in the call, TypeScript runs an excess property check and complains about fields the type does not know. That is how it catches typos like timeoutMS instead of timeoutMs. If you first store the object in a variable and then pass the variable, the extra fields are allowed, because the object might be used elsewhere.",
        bullets: ["Extra fields are fine for variables", "Extra fields are an error for inline object literals", "Missing required fields are always an error"],
      },
      {
        heading: "interface or type?",
        body: "Both can describe an object shape, and for most code the choice does not matter. The differences are small but real. An interface can be declared twice and the two declarations merge, which libraries use to let you add fields to their types. An interface extends another with the extends keyword and gives clear error messages.\n\nA type alias can name anything: a union like \"admin\" | \"user\", a tuple, a function type, or a mapped type. Only type can do unions. A common team rule is: use interface for object shapes that others may extend, and type for everything else. Pick one rule and stay consistent.",
        visual: {
          type: "compare",
          title: "interface vs type alias",
          columns: [
            { title: "interface", points: ["Object shapes only", "Can be declared again and merged", "Extends with the extends keyword", "Good for public object APIs"] },
            { title: "type", points: ["Any type: unions, tuples, functions", "Cannot be reopened once declared", "Combines with & (intersection)", "Needed for unions and mapped types"] },
          ],
        },
      },
      {
        heading: "Where inference works and where to annotate",
        body: "Inference is strong for local variables and return values. const total = price * qty is a number without help. Return types are inferred from the return statements.\n\nAnnotate function parameters: TypeScript cannot guess what callers will pass, and with strict mode an unannotated parameter is an error. Annotate exported functions and public APIs too, so a change inside the function cannot silently change the type other files depend on.\n\nWatch out for widening. let mode = \"dark\" is typed as string, because a let can change. const mode = \"dark\" is the literal type \"dark\". Adding as const to an object or array keeps every value as a readonly literal, which is handy for config lists and route names.",
        bullets: ["Parameters: always annotate", "Locals: let inference work", "Exported functions: annotate the return type", "Empty arrays: annotate, for example const ids: number[] = []"],
      },
      {
        heading: "Typing API responses without any",
        body: "res.json() returns any, so whatever you assign it to is accepted without checks. Writing as User only tells the compiler to trust you; it checks nothing. If the server renames a field, your code still compiles and breaks at runtime.\n\nThe safe pattern is to treat outside data as unknown, then validate it. unknown forces you to check before use. A schema library like Zod does the checking for you: you describe the shape once, call parse on the data, and get back a fully typed value or a clear error. z.infer gives you the TypeScript type from the same schema, so the type and the runtime check can never drift apart.",
        visual: {
          type: "flow",
          title: "Turning outside data into a trusted type",
          steps: [
            { label: "fetch()", detail: "The body is just bytes from the network" },
            { label: "res.json()", detail: "Store it as unknown, not any" },
            { label: "Schema.parse()", detail: "Checks every field at runtime" },
            { label: "Typed value", detail: "Safe to use; bad data throws early" },
          ],
        },
      },
      {
        heading: "Arrays, tuples, optional and readonly",
        body: "An array of strings is written string[]. A tuple is a fixed-length array where each position has its own type, like [number, number] for a point. React's useState returns a tuple, which is why you can destructure it.\n\nA question mark makes a field optional: email?: string means the field may be missing, so its type is string | undefined. readonly stops reassignment of a field, and readonly string[] removes push and splice. These are compile-time only; nothing freezes the object at runtime. Use them to document intent and to stop accidental mutation of shared data, such as React state.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "The everyday types",
        root: "TypeScript types",
        children: [
          { label: "Primitives", children: ["string, number, boolean", "bigint, symbol", "null, undefined"] },
          { label: "Objects", children: ["interface or type shapes", "Arrays: string[]", "Tuples: [number, number]"] },
          { label: "Functions", children: ["(a: number) => string", "void for no return value"] },
          { label: "Literals", children: ["\"dark\" | \"light\"", "Made with const or as const"] },
          { label: "Escape hatches", children: ["any: no checking", "unknown: check before use", "never: cannot happen"] },
        ],
      },
    ],
    examples: [
      {
        title: "Loading products with a schema",
        explanation: "A product page loads JSON from an API. Step 1: describe the product once with Zod. Step 2: get the TypeScript type from the schema with z.infer, so you never write it twice. Step 3: store the JSON as unknown. Step 4: parse it. If the server sends price as a string by mistake, parse throws a clear error right here, not deep inside a component later.",
        code: {
          lang: "ts",
          code: "import { z } from \"zod\";\n\nconst Product = z.object({\n  id: z.number(),\n  name: z.string(),\n  price: z.number(),\n  tags: z.array(z.string()).default([]),\n});\ntype Product = z.infer<typeof Product>;\n\nexport async function getProducts(): Promise<Product[]> {\n  const res = await fetch(\"/api/products\");\n  if (!res.ok) throw new Error(\"HTTP \" + res.status);\n  const data: unknown = await res.json();\n  return z.array(Product).parse(data);\n}",
        },
      },
      {
        title: "Why one typo is caught and the other is not",
        explanation: "Step 1: call load with an inline object that has a typo. TypeScript runs the excess property check and even suggests the right name. Step 2: put the same object in a variable first and pass that. Now there is no error, because structural typing allows extra fields, and timeoutMs is optional. Lesson: pass options inline, or annotate the variable with the type so the check runs at the assignment.",
        code: {
          lang: "ts",
          code: "interface Options {\n  retries: number;\n  timeoutMs?: number;\n}\n\nfunction load(url: string, opts: Options) {\n  console.log(url, opts.retries);\n}\n\nload(\"/api\", { retries: 3, timeoutMS: 500 });\n// Error: 'timeoutMS' does not exist in type 'Options'.\n\nconst opts = { retries: 3, timeoutMS: 500 };\nload(\"/api\", opts); // no error: the typo slips through\n\nconst safe: Options = { retries: 3, timeoutMS: 500 }; // error again",
        },
      },
    ],
    cheatSheet: [
      "Annotate parameters and exported functions; let inference handle locals",
      "let x = \"a\" is string; const x = \"a\" is the literal type \"a\"",
      "Use unknown for outside data, then validate or narrow it before use",
      "as Type only silences the checker; it never converts or checks data",
      "email?: string means the field may be missing (string | undefined)",
      "Only type aliases can name unions like \"admin\" | \"user\"",
      "as const keeps literal values and makes arrays and objects readonly",
      "Types are erased at build time and add zero runtime cost",
    ],
    quiz: [
      {
        q: "What type does TypeScript infer for let status = \"idle\"?",
        options: ["\"idle\"", "any", "string", "unknown"],
        answer: 2,
        why: "A let can be reassigned, so the literal widens to string; const would keep \"idle\".",
      },
      {
        q: "Which can a type alias do that an interface cannot?",
        options: ["Name a union like \"sm\" | \"md\" | \"lg\"", "Describe an object shape", "Have optional fields", "Be exported from a module"],
        answer: 0,
        why: "Unions, tuples and mapped types need the type keyword; the other options work for both.",
      },
      {
        q: "You write const user = (await res.json()) as User. What does TypeScript check at runtime?",
        options: ["That every required field exists", "That the field types match", "That the JSON is valid", "Nothing; the cast only affects compile-time checks"],
        answer: 3,
        why: "Types are erased, so as is a promise to the compiler, not a runtime check.",
      },
      {
        q: "A variable holds { retries: 3, extra: true } and you pass it to a function expecting { retries: number }. What happens?",
        options: ["Compile error for the extra field", "It compiles, because structural typing allows extra fields", "Runtime error", "extra is removed automatically"],
        answer: 1,
        why: "The excess property check only applies to object literals written inline.",
      },
      {
        q: "You have a value of type unknown. What must you do before calling value.toUpperCase()?",
        options: ["Nothing, unknown allows any call", "Annotate it as any first", "Narrow it, for example with typeof value === \"string\"", "Add a non-null assertion with !"],
        answer: 2,
        why: "unknown blocks every operation until you prove the type with a check.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write formatPrice(cents, currency) that returns a string like \"$12.50\". currency is optional and defaults to \"USD\". Add types to the parameters and the return value.",
        hint: "Use a default parameter value and Intl.NumberFormat.",
        solution: "function formatPrice(cents: number, currency: string = \"USD\"): string {\n  return new Intl.NumberFormat(\"en-US\", {\n    style: \"currency\",\n    currency,\n  }).format(cents / 100);\n}\n\nformatPrice(1250); // \"$12.50\"",
      },
      {
        level: "medium",
        task: "Model a blog Post with a readonly id, title, body, an optional list of tags and an author object with name and optional avatarUrl. Write a function that returns the post's tags or an empty array.",
        hint: "Nest an Author interface inside Post and use ?? for the default.",
        solution: "interface Author { name: string; avatarUrl?: string }\ninterface Post {\n  readonly id: number;\n  title: string;\n  body: string;\n  tags?: string[];\n  author: Author;\n}\nfunction tagsOf(post: Post): string[] {\n  return post.tags ?? [];\n}",
      },
      {
        level: "hard",
        task: "Fetch /api/users, validate that it is an array of { id: number; email: string } with Zod, and return the typed array. If validation fails, log which fields were wrong and return an empty array.",
        hint: "safeParse returns { success, data, error } instead of throwing.",
        solution: "import { z } from \"zod\";\nconst Users = z.array(z.object({ id: z.number(), email: z.string() }));\ntype User = z.infer<typeof Users>[number];\n\nasync function getUsers(): Promise<User[]> {\n  const res = await fetch(\"/api/users\");\n  const result = Users.safeParse(await res.json());\n  if (!result.success) {\n    console.error(result.error.issues);\n    return [];\n  }\n  return result.data;\n}",
      },
    ],
    faq: [
      { q: "Should I use interface or type in TypeScript?", a: "Either works for object shapes. Many teams use interface for objects and type for unions and everything else; consistency matters more than the choice." },
      { q: "Does TypeScript make my app slower?", a: "No. Types are removed at build time, so the JavaScript that runs is the same speed. The only cost is the type-checking step during development and CI." },
      { q: "Is it ever OK to use any?", a: "Rarely, for example while migrating old JavaScript. Prefer unknown, which keeps safety by forcing a check before use." },
      { q: "Can browsers run TypeScript directly?", a: "No. A compiler or bundler strips the types first. Recent Node.js versions can strip types from .ts files on the fly, but they still do not type check them." },
    ],
  },

  "typescript/ts-narrowing": {
    plain: [
      "Sometimes a value can be one of a few things. An id might be a number or a string. A request might be loading, finished, or failed. TypeScript writes this with a union type, using the | sign: string | number means either one.",
      "Before you use a union value, you usually need to know which one you have. If you check typeof id === \"string\", TypeScript understands that inside the if block id is a string. This is called narrowing: the type gets smaller as you learn more.",
      "A discriminated union is a union of objects that all share one field with a fixed value, often called status or kind. Checking that one field tells TypeScript exactly which object you have and which other fields exist. It is the cleanest way to model screens that can be in several states.",
      "Generics are type placeholders, usually written T. A generic function like first(items) works for a list of numbers or a list of users and still knows what it returns. You write the logic once and keep full type safety for every caller.",
    ],
    deepDive: [
      {
        heading: "How narrowing really works",
        body: "TypeScript follows your code paths, a technique called control-flow analysis. At each line it tracks what the type of a variable can still be. A check removes possibilities: after if (value === null) return, the rest of the function knows value is not null.\n\nMany checks narrow: typeof for primitives, === against a literal, truthiness (if (name)), the in operator (\"email\" in contact), instanceof for classes like Date or Error, and Array.isArray. One trap: typeof null is \"object\", so typeof x === \"object\" does not exclude null. Another: a truthiness check also removes 0 and the empty string, which may be valid values.",
        bullets: ["typeof for string, number, boolean, function", "in for checking that a field exists", "instanceof for classes like Error and Date", "Early return narrows everything after it"],
        visual: {
          type: "flow",
          title: "Narrowing string | number | null step by step",
          steps: [
            { label: "Start", detail: "value: string | number | null" },
            { label: "if (value === null) return", detail: "After this: string | number" },
            { label: "if (typeof value === \"number\")", detail: "Inside: number" },
            { label: "Else branch", detail: "Only string is left" },
          ],
        },
      },
      {
        heading: "Your own type guards",
        body: "Sometimes the check is too complex for TypeScript to follow, for example validating an object from an API. You can write a type guard: a function whose return type is value is Fish. When it returns true, TypeScript narrows the argument to Fish in the caller.\n\nBe careful: TypeScript trusts your guard completely. If the function body is wrong, the narrowing is wrong too. Keep guards small and test them.\n\nSince TypeScript 5.5, simple arrow functions get an inferred type predicate. That means items.filter((x) => x !== undefined) now returns an array without undefined, which used to need a hand-written guard.",
      },
      {
        heading: "Exhaustive checks with never",
        body: "never is the type of something that cannot happen. After you handle every case of a union in a switch, the variable in the default branch has type never. You can use this to make the compiler remind you about new cases.\n\nAssign the value to a variable typed never in the default branch. Today it compiles. When a teammate adds status: \"cancelled\" to the union and forgets to handle it, that line becomes an error that points straight at the switch that needs updating. This turns a silent runtime bug into a compile error, which is exactly what types are for.",
        bullets: ["const unreachable: never = state;", "Adding a variant breaks the build until it is handled", "Works for switch and if/else chains"],
      },
      {
        heading: "Generics: constraints and keyof",
        body: "A generic says: the type here is decided by the caller, and these types are linked. In first<T>(items: T[]): T | undefined, the T in the input and output must be the same, so first([1, 2]) returns number | undefined.\n\nOften you need T to have some feature. A constraint does this: T extends { id: string } means any type with an id field. keyof T is the union of T's property names, so getField<T, K extends keyof T>(obj: T, key: K): T[K] only accepts real keys and returns the right field type.\n\nA good rule: a type parameter should appear at least twice, to connect things. If T is used only once, a plain type is simpler.",
      },
      {
        heading: "Built-in utility types",
        body: "Utility types build new types from existing ones, so you do not copy and paste shapes. Partial<T> makes every field optional, which fits update forms. Required<T> does the opposite. Readonly<T> blocks reassignment. Pick<T, \"id\" | \"name\"> keeps some fields and Omit<T, \"password\"> drops some. Record creates an object type from a key type and a value type.\n\nFor functions, ReturnType and Parameters (used with typeof fn) extract the result and argument types, and Awaited unwraps a Promise. NonNullable removes null and undefined, and Exclude and Extract filter unions. Deriving types this way means a change to the base type flows everywhere automatically.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Utility types by job",
        root: "Utility types",
        children: [
          { label: "Change every field", children: ["Partial", "Required", "Readonly"] },
          { label: "Choose fields", children: ["Pick", "Omit"] },
          { label: "Build objects", children: ["Record (keys to values)"] },
          { label: "Read functions", children: ["ReturnType", "Parameters", "Awaited"] },
          { label: "Filter unions", children: ["Exclude", "Extract", "NonNullable"] },
        ],
      },
      {
        type: "compare",
        title: "Boolean flags vs a discriminated union",
        columns: [
          { title: "isLoading, isError, data?", points: ["4 flag combinations are possible", "isLoading and isError can both be true", "data may be undefined even on success", "Every reader must guess the rules"] },
          { title: "status: \"loading\" | \"success\" | \"error\"", points: ["Exactly one state at a time", "data exists only in the success variant", "switch narrows each branch", "never check catches missing cases"] },
        ],
      },
    ],
    examples: [
      {
        title: "A payment result with an exhaustive switch",
        explanation: "A checkout can end in three ways. Step 1: model them as a union with a shared kind field. Step 2: switch on kind; in each case TypeScript knows exactly which fields exist, so result.receiptUrl is only allowed in the paid case. Step 3: the default branch assigns to never. If someone adds a \"refunded\" variant later, this file stops compiling until they handle it.",
        code: {
          lang: "ts",
          code: "type PaymentResult =\n  | { kind: \"paid\"; receiptUrl: string }\n  | { kind: \"declined\"; reason: string }\n  | { kind: \"pending\"; retryInMs: number };\n\nfunction message(result: PaymentResult): string {\n  switch (result.kind) {\n    case \"paid\": return \"Thanks! Receipt: \" + result.receiptUrl;\n    case \"declined\": return \"Card declined: \" + result.reason;\n    case \"pending\": return \"Still processing...\";\n    default: {\n      const unreachable: never = result;\n      return unreachable;\n    }\n  }\n}",
        },
      },
      {
        title: "A generic groupBy helper",
        explanation: "You often need to group a list, such as orders by status. Step 1: make the item type generic, T, so it works for any list. Step 2: constrain the key K to string because it becomes an object key. Step 3: take a function that picks the key. The result is typed as an object of T arrays, so grouped.paid is Order[] with full autocomplete. Since ES2024, Object.groupBy does the same at runtime in modern browsers.",
        code: {
          lang: "ts",
          code: "function groupBy<T, K extends string>(\n  items: T[],\n  keyOf: (item: T) => K,\n): Partial<Record<K, T[]>> {\n  const out: Partial<Record<K, T[]>> = {};\n  for (const item of items) {\n    const key = keyOf(item);\n    (out[key] ??= []).push(item);\n  }\n  return out;\n}\n\ntype Order = { id: number; status: \"paid\" | \"open\" };\nconst orders: Order[] = [{ id: 1, status: \"paid\" }, { id: 2, status: \"open\" }];\nconst grouped = groupBy(orders, (o) => o.status); // grouped.paid: Order[] | undefined",
        },
      },
    ],
    cheatSheet: [
      "A | B means the value is one of them; narrow before using type-specific features",
      "typeof null is \"object\": check for null separately",
      "Give every union variant the same literal field (kind or status) to discriminate it",
      "In a default branch, const x: never = value catches unhandled variants",
      "function isUser(v: unknown): v is User declares a custom type guard",
      "K extends keyof T restricts K to real property names of T",
      "Partial, Pick and Omit derive types instead of copying shapes",
      "If a type parameter appears only once, you probably do not need a generic",
    ],
    quiz: [
      {
        q: "value has type string | null. Inside if (typeof value === \"object\") { ... }, what is its type?",
        options: ["string", "never", "object", "null"],
        answer: 3,
        why: "typeof null is \"object\", so the only member of the union that survives is null.",
      },
      {
        q: "What makes a union a discriminated union?",
        options: ["Every variant shares a field with a different literal value", "It has more than two members", "It is declared with interface", "It contains only primitive types"],
        answer: 0,
        why: "The shared literal field, such as kind or status, lets TypeScript tell the variants apart.",
      },
      {
        q: "What does Omit<User, \"password\"> produce?",
        options: ["User with password made optional", "Only the password field", "User with every field except password", "A union of User and password"],
        answer: 2,
        why: "Omit removes the listed keys and keeps all the others.",
      },
      {
        q: "Why add K extends keyof T in getField(obj, key)?",
        options: ["To make the function faster", "So only real property names of obj are accepted and the return type matches the field", "To allow any string as key", "It is required for all generics"],
        answer: 1,
        why: "The constraint rejects invalid keys at compile time, and T[K] gives the exact field type back.",
      },
      {
        q: "What happens when a new variant is added to a union that is switched over with a never check in the default branch?",
        options: ["A runtime error the first time it runs", "Nothing changes", "The variant is ignored silently", "A compile error at the never assignment"],
        answer: 3,
        why: "The new variant reaches the default branch, and it is not assignable to never.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write describe(input: string | number | boolean) that returns \"text\", \"number\" or \"flag\" using typeof checks.",
        hint: "After two checks, TypeScript knows only one type is left.",
        solution: "function describe(input: string | number | boolean): string {\n  if (typeof input === \"string\") return \"text\";\n  if (typeof input === \"number\") return \"number\";\n  return \"flag\"; // input is boolean here\n}",
      },
      {
        level: "medium",
        task: "Model a file upload as a discriminated union: idle, uploading with a progress number, done with a url, and failed with an error message. Write label(state) that returns a short text for each state.",
        hint: "Use a status field and a switch.",
        solution: "type Upload =\n  | { status: \"idle\" }\n  | { status: \"uploading\"; progress: number }\n  | { status: \"done\"; url: string }\n  | { status: \"failed\"; error: string };\n\nfunction label(s: Upload): string {\n  switch (s.status) {\n    case \"idle\": return \"Choose a file\";\n    case \"uploading\": return `Uploading ${s.progress}%`;\n    case \"done\": return `Uploaded to ${s.url}`;\n    case \"failed\": return `Failed: ${s.error}`;\n  }\n}",
      },
      {
        level: "hard",
        task: "Write a generic pluck(items, key) that returns an array of the values of that key, typed correctly. pluck(users, \"email\") should be string[], and pluck(users, \"nope\") should not compile.",
        hint: "Use two type parameters: T for the item and K extends keyof T for the key. The result is T[K][].",
        solution: "function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {\n  return items.map((item) => item[key]);\n}\n\ntype User = { id: number; email: string };\nconst users: User[] = [{ id: 1, email: \"a@b.c\" }];\nconst emails = pluck(users, \"email\"); // string[]\n// pluck(users, \"nope\"); // error: not a key of User",
      },
    ],
    faq: [
      { q: "What is the difference between a union and an intersection type?", a: "A union A | B is either A or B. An intersection A & B must be both at once, so it has all the fields of A and B combined." },
      { q: "When should I use a generic instead of any?", a: "Whenever the output type depends on the input type. A generic keeps that link, while any throws the type information away." },
      { q: "Why does TypeScript forget my narrowing inside a callback?", a: "A callback may run later, after the variable has changed. Copy the narrowed value into a const before the callback, and TypeScript keeps the narrowed type." },
    ],
  },

  "typescript/ts-config": {
    plain: [
      "Every TypeScript project has a tsconfig.json file at its root. It tells the compiler which files to check, how strict to be, and which version of JavaScript and which browser or Node features to expect.",
      "The most important setting is strict. With strict turned off, TypeScript is very forgiving: values it cannot figure out quietly become any, and null can slip in anywhere. Many real bugs, like reading a field of undefined, are never reported.",
      "Turning on strict makes TypeScript point out those risky places. At first you see more errors. But each error is a spot where your app could crash for a real user. Fixing them before release is much cheaper than fixing them after a bug report.",
      "In modern frontend projects, such as Next.js or Vite apps, TypeScript usually only checks your code. Another fast tool removes the types and builds the bundle. That is why the config often says noEmit: true, and why you should run the type check in CI as its own step.",
    ],
    deepDive: [
      {
        heading: "What strict actually turns on",
        body: "strict is a shortcut for a family of flags. The two you will notice most are noImplicitAny, which errors when a parameter or variable would silently become any, and strictNullChecks, which keeps null and undefined out of every type unless you write them in.\n\nOthers matter too. strictFunctionTypes checks callback parameter types properly. strictPropertyInitialization requires class fields to be set in the constructor. useUnknownInCatchVariables makes the error in catch (err) unknown instead of any, so you must check err instanceof Error before reading err.message. New strict checks are added in some TypeScript releases, so upgrading TypeScript can reveal new errors in a strict project. That is expected and usually worth it.",
        bullets: ["noImplicitAny", "strictNullChecks", "strictFunctionTypes and strictBindCallApply", "strictPropertyInitialization", "useUnknownInCatchVariables and alwaysStrict"],
      },
      {
        heading: "Who type checks and who builds",
        body: "In a Next.js or Vite project, three tools touch your TypeScript. The editor runs the TypeScript language service for red squiggles as you type. A fast transpiler, SWC in Next.js or esbuild in Vite, strips the types file by file without checking them, so builds stay fast. And tsc --noEmit checks the whole project without writing any files.\n\nBecause the transpiler sees one file at a time, isolatedModules: true is required: it flags code that needs whole-program knowledge to compile, such as re-exporting a type without the type keyword. Next.js runs a type check during next build, but a separate tsc --noEmit step in CI catches errors earlier and gives cleaner output.",
        visual: {
          type: "layers",
          title: "TypeScript in a bundled frontend project",
          layers: [
            { label: "Editor language service", detail: "Instant errors and autocomplete as you type" },
            { label: "tsc --noEmit", detail: "Whole-project type check in CI, writes nothing" },
            { label: "SWC or esbuild", detail: "Strips types per file, no checking" },
            { label: "Bundler output", detail: "Plain JavaScript shipped to browsers" },
          ],
        },
      },
      {
        heading: "target, lib, module and moduleResolution",
        body: "target sets which JavaScript syntax the output uses; ES2022 is a safe modern choice. lib lists the built-in APIs TypeScript knows exist: include \"dom\" for browser code, and leave it out for pure Node code so you cannot accidentally use window. Note that lib only describes APIs; it does not add polyfills.\n\nmodule and moduleResolution decide how imports are read. For apps built by a bundler, use module \"esnext\" with moduleResolution \"bundler\", which allows imports without file extensions. For code run directly by Node.js, use \"nodenext\" for both, which follows Node's real rules, including required .js extensions in ESM imports.",
        bullets: ["Bundled app: module esnext, moduleResolution bundler", "Node.js library or server: module and moduleResolution nodenext", "jsx: preserve lets Next.js handle JSX itself"],
      },
      {
        heading: "Checks beyond strict",
        body: "A few useful flags are not part of strict. noUncheckedIndexedAccess adds undefined to every array index and dictionary lookup, so items[0] is Item | undefined. This catches the classic empty-array crash. exactOptionalPropertyTypes separates a missing field from one set to undefined. noImplicitReturns errors when some paths of a function return a value and others do not. noFallthroughCasesInSwitch catches a forgotten break.\n\nTurn these on in new projects. In an old codebase, add one at a time and fix its errors before the next. paths sets import aliases such as \"@/*\": [\"./src/*\"], so you can write import { db } from \"@/lib/db\" instead of long ../../ chains; Next.js reads these aliases automatically.",
      },
      {
        heading: "Fixing the errors strict reveals",
        body: "Most strict errors fall into a few patterns. \"Object is possibly undefined\": add an early return, optional chaining (user?.name), or a default with ??. \"Parameter implicitly has an any type\": add an annotation. \"err is of type unknown\": check err instanceof Error first. \"Property has no initializer\": set it in the constructor or give it a default.\n\nAvoid fixing errors with the non-null assertion ! or as any. They make the error go away without making the code safer. When you truly cannot fix a line yet, prefer // @ts-expect-error with a comment over // @ts-ignore: expect-error itself fails once the underlying problem is fixed, so stale suppressions do not pile up.",
        visual: {
          type: "compare",
          title: "Common strict error: quick fix vs real fix",
          columns: [
            { title: "Silencing", points: ["user!.name", "(data as any).items", "// @ts-ignore", "Error hidden, crash still possible"] },
            { title: "Handling", points: ["if (!user) return null;", "Validate data, then use items", "// @ts-expect-error with a reason", "Error gone because the case is covered"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Turning on strict in an existing project",
        steps: [
          { label: "Baseline", detail: "Run tsc --noEmit and note the error count" },
          { label: "One flag", detail: "Enable noImplicitAny first, then strictNullChecks" },
          { label: "Fix by folder", detail: "Small pull requests, shared code first" },
          { label: "Full strict", detail: "Replace the single flags with strict: true" },
          { label: "Lock it in", detail: "Type check in CI so errors cannot come back" },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing three strict errors in one function",
        explanation: "This function compiled without strict. With strict on, TypeScript reports three problems. Step 1: users is an implicit any, so annotate it. Step 2: find can return undefined, so handle the not-found case instead of reading .name blindly. Step 3: err in catch is unknown, so check it is an Error before reading message. Each fix covers a real crash path.",
        code: {
          lang: "ts",
          code: "type User = { id: number; name: string };\n\nfunction nameOf(users: User[], id: number): string {\n  const user = users.find((u) => u.id === id);\n  if (!user) return \"Unknown user\";\n  return user.name;\n}\n\ntry {\n  JSON.parse(\"{bad json\");\n} catch (err) {\n  const msg = err instanceof Error ? err.message : String(err);\n  console.error(msg);\n}",
        },
      },
      {
        title: "noUncheckedIndexedAccess catches an empty list",
        explanation: "A dashboard shows the latest order with orders[0].total. When a new user has no orders, this crashes. Step 1: enable noUncheckedIndexedAccess in tsconfig. Step 2: TypeScript now types orders[0] as Order | undefined and flags .total. Step 3: handle the empty case. The same applies to lookups in a dictionary object: prices[\"sku-1\"] might be missing.",
        code: {
          lang: "ts",
          code: "// tsconfig: \"noUncheckedIndexedAccess\": true\ntype Order = { id: number; total: number };\n\nfunction latestTotal(orders: Order[]): number {\n  const latest = orders[0]; // Order | undefined\n  return latest?.total ?? 0;\n}\n\nconst prices: { [sku: string]: number } = { \"sku-1\": 999 };\nconst p = prices[\"sku-2\"]; // number | undefined\nconsole.log(p ?? \"not found\");",
        },
      },
    ],
    cheatSheet: [
      "\"strict\": true enables noImplicitAny, strictNullChecks and the rest of the strict family",
      "npx tsc --noEmit type checks the whole project without writing files",
      "Bundled apps: \"module\": \"esnext\" with \"moduleResolution\": \"bundler\"",
      "Node.js without a bundler: \"module\" and \"moduleResolution\": \"nodenext\"",
      "\"noUncheckedIndexedAccess\": true makes arr[0] possibly undefined",
      "\"paths\": { \"@/*\": [\"./src/*\"] } gives you clean import aliases",
      "Prefer // @ts-expect-error over // @ts-ignore; it fails once the error is fixed",
      "\"skipLibCheck\": true skips checking .d.ts files in node_modules for faster builds",
    ],
    quiz: [
      {
        q: "Your Vite app builds even though there are type errors. Why?",
        options: ["Vite ignores tsconfig.json", "esbuild only strips types and never checks them", "strict is off by default in Vite", "Type errors are warnings in production"],
        answer: 1,
        why: "The transpiler removes types file by file for speed, so you need a separate tsc --noEmit check.",
      },
      {
        q: "With useUnknownInCatchVariables (part of strict), what is the type of err in catch (err)?",
        options: ["Error", "any", "string", "unknown"],
        answer: 3,
        why: "Anything can be thrown in JavaScript, so err is unknown until you narrow it.",
      },
      {
        q: "Which flag makes items[0] have type Item | undefined?",
        options: ["noUncheckedIndexedAccess", "strictNullChecks", "noImplicitAny", "exactOptionalPropertyTypes"],
        answer: 0,
        why: "It adds undefined to index access results; it is not included in strict.",
      },
      {
        q: "What does adding \"dom\" to lib do?",
        options: ["Adds browser polyfills to the bundle", "Lets TypeScript know browser APIs like document and window exist", "Enables JSX", "Makes the build target the browser"],
        answer: 1,
        why: "lib only declares which APIs exist for type checking; it adds no runtime code.",
      },
      {
        q: "Why is // @ts-expect-error usually better than // @ts-ignore?",
        options: ["It also fixes the error", "It is faster to compile", "It reports an error once the line no longer has a problem", "It works in JavaScript files only"],
        answer: 2,
        why: "An unused expect-error is itself an error, so stale suppressions get cleaned up.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a typecheck script to package.json that checks the project without emitting files, and run it.",
        hint: "Use tsc with the --noEmit flag.",
        solution: "// package.json\n\"scripts\": {\n  \"typecheck\": \"tsc --noEmit\"\n}\n\n// terminal\nnpm run typecheck",
      },
      {
        level: "medium",
        task: "This compiles without strict but fails with it: function total(items) { return items.reduce((s, i) => s + i.price, 0); } and const first = document.querySelector(\"input\").value. Rewrite both so they pass strict.",
        hint: "Annotate the parameter, and remember querySelector can return null.",
        solution: "type Item = { price: number };\nfunction total(items: Item[]): number {\n  return items.reduce((s, i) => s + i.price, 0);\n}\n\nconst input = document.querySelector(\"input\");\nconst first = input?.value ?? \"\";",
      },
      {
        level: "hard",
        task: "Write a tsconfig.json for a Next.js-style app: strict, no emit, bundler resolution, unchecked index access on, JSX preserved, an @/* alias to ./src/*, and isolated modules.",
        hint: "All options go in compilerOptions; include your source files.",
        solution: "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\", \"lib\": [\"dom\", \"dom.iterable\", \"ES2022\"],\n    \"module\": \"esnext\", \"moduleResolution\": \"bundler\",\n    \"strict\": true, \"noUncheckedIndexedAccess\": true,\n    \"noEmit\": true, \"isolatedModules\": true, \"skipLibCheck\": true,\n    \"jsx\": \"preserve\",\n    \"paths\": { \"@/*\": [\"./src/*\"] }\n  },\n  \"include\": [\"next-env.d.ts\", \"**/*.ts\", \"**/*.tsx\"]\n}",
      },
    ],
    faq: [
      { q: "Should I turn on strict mode in TypeScript?", a: "Yes for every new project. For an old one, enable the strict flags one at a time and fix errors folder by folder." },
      { q: "What does skipLibCheck do and is it safe?", a: "It skips type checking of declaration files (.d.ts), mostly in node_modules. It speeds up builds and avoids errors in third-party types; your own code is still fully checked." },
      { q: "Why does my code run even though tsc shows errors?", a: "Most build tools strip types without checking them, and tsc also writes output by default even when errors exist. Run tsc --noEmit as a separate CI step so errors fail the build." },
    ],
  },
};

export default extra;
