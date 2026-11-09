import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  "case-studies-core/url-shortener": {
    plain: [
      "A URL shortener turns a long web address into a tiny one, like invic.ly/aZ3kP9. When someone opens the short link, the service looks up the long address and sends the browser there. Bitly and TinyURL work this way.",
      "Think of it as a coat check. You hand over your coat (the long URL) and get a small ticket (the short code). Later, anyone with the ticket gets the same coat back. The service only has to do two jobs well: hand out tickets that never clash, and find the coat fast.",
      "The tricky part is scale. A popular service might create a hundred million links a day but serve a hundred times more redirects. So the design is built around reading quickly: a fast lookup table, a cache in memory for popular links, and doing slow work like counting clicks in the background.",
    ],
    deepDive: [
      {
        heading: "Making short codes that never clash",
        body: "Every link needs a unique code. The simplest reliable approach is a counter: each new link gets the next number, and you convert that number to base 62 (digits plus lowercase and uppercase letters). Seven base-62 characters give about 3.5 trillion codes, which lasts decades.\n\nOne counter on one server becomes a bottleneck and a single point of failure. So each app server reserves a block of numbers at a time, say 1,000, from a small coordination service. It hands those out locally with no network call, and only asks for a new block when it runs out.",
        bullets: ["Counter + base62: short, unique, no collisions", "Block allocation removes the single-counter bottleneck", "Random codes need a collision check on every insert"],
      },
      {
        heading: "The redirect path has to be fast",
        body: "Most traffic is people clicking links, so the read path matters most. The request hits a load balancer, then a stateless app server, which first checks an in-memory cache like Redis. A cache hit answers in about a millisecond. On a miss, the server reads the key-value database, stores the result in the cache with an expiry time, and replies.\n\nBecause a small share of links get most of the clicks, even a modest cache absorbs the bulk of the load and keeps the database calm.",
      },
      {
        heading: "301 or 302?",
        body: "A 301 redirect says \"moved permanently\", so browsers remember it and may skip your server next time. That is cheaper, but you stop seeing those clicks. A 302 says \"moved temporarily\", so every click comes back to you. Services that sell click analytics use 302.",
        bullets: ["301: faster for users, fewer requests, weaker analytics", "302: every click counted, slightly more load"],
      },
      {
        heading: "Counting clicks without slowing anyone down",
        body: "Writing to an analytics table on every redirect would make clicks slow and could take the redirect service down during a traffic spike. Instead, the server drops a small event onto a queue such as Kafka and replies immediately. Separate workers read the queue and update counts and reports in a data warehouse. If analytics falls behind, redirects keep working.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Creating a short link",
        actors: ["User", "API server", "ID allocator", "Database"],
        messages: [
          { from: 0, to: 1, label: "POST long URL" },
          { from: 1, to: 2, label: "Need IDs (only when block runs out)" },
          { from: 2, to: 1, label: "Block 1000–1999" },
          { from: 1, to: 3, label: "Save code → long URL" },
          { from: 1, to: 0, label: "201 short link" },
        ],
      },
      {
        type: "layers",
        title: "Where each request is answered",
        layers: [
          { label: "CDN / edge", detail: "Optional: cache the hottest redirects worldwide" },
          { label: "Load balancer", detail: "Spreads traffic across app servers" },
          { label: "App servers", detail: "Stateless; easy to add more" },
          { label: "Redis cache", detail: "Answers most redirects in about 1 ms" },
          { label: "Key-value database", detail: "Source of truth for code → URL" },
        ],
      },
    ],
    examples: [
      {
        title: "Turning a number into a short code",
        explanation: "Say the next counter value is 125. In base 62, 125 = 2 × 62 + 1, so the digits are [2, 1]. Using the alphabet 0-9, a-z, A-Z, digit 2 is \"2\" and digit 1 is \"1\", giving the code \"21\". Bigger numbers simply produce longer codes, so we pad to 7 characters for a consistent look.",
        code: {
          lang: "python",
          code: "ALPHABET = \"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\"\n\ndef encode(n: int) -> str:\n    if n == 0:\n        return ALPHABET[0]\n    out = []\n    while n:\n        n, r = divmod(n, 62)\n        out.append(ALPHABET[r])\n    return \"\".join(reversed(out))\n\nprint(encode(125))         # 21\nprint(encode(3_500_000_000_000))",
        },
      },
      {
        title: "Back-of-the-envelope sizing",
        explanation: "Assume 100 million new links a day. That is about 1,200 writes per second. With a 100:1 read-to-write ratio, redirects run at about 120,000 per second. If each stored link takes 500 bytes, five years of links is 100M × 365 × 5 × 500 B ≈ 91 TB. These numbers tell you that reads need a cache and that storage must be spread across several machines.",
      },
    ],
    cheatSheet: [
      "Base62 alphabet: 0-9 a-z A-Z (62 characters)",
      "62^7 ≈ 3.5 trillion possible 7-character codes",
      "100M writes/day ≈ 1,200 writes per second",
      "Read:write is often 100:1, so design for reads",
      "302 = count every click; 301 = cheaper, cached by browsers",
      "Cache hot codes in Redis with a TTL",
      "Send click events to a queue; never block the redirect",
    ],
    quiz: [
      {
        q: "Why do app servers reserve a block of IDs instead of asking a central counter for every new link?",
        options: ["To make codes random", "To avoid a network round trip and a single bottleneck on every create", "Because base62 needs blocks", "To support 301 redirects"],
        answer: 1,
        why: "Handing out IDs locally from a reserved block removes per-request coordination.",
      },
      {
        q: "Which redirect status lets the service count every click?",
        options: ["301 Moved Permanently", "200 OK", "302 Found", "404 Not Found"],
        answer: 2,
        why: "Browsers don't cache a 302 as permanent, so each click reaches the server.",
      },
      {
        q: "Roughly how many unique codes do 7 base62 characters give?",
        options: ["3.5 trillion", "62 million", "1 billion", "7 billion"],
        answer: 0,
        why: "62 to the power 7 is about 3.52 × 10^12.",
      },
      {
        q: "Where should click analytics be written?",
        options: ["In the same database transaction as the redirect", "To a queue that workers process later", "Into the browser's local storage", "Nowhere; it is not needed"],
        answer: 1,
        why: "Asynchronous processing keeps redirects fast even when analytics is slow.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function decode(code) that turns a base62 short code back into its number. Check that decode(encode(n)) == n for n = 0, 61, 62 and 999999.",
        hint: "Walk the characters left to right: value = value * 62 + index_of(char).",
        solution: "def decode(code: str) -> int:\n    n = 0\n    for ch in code:\n        n = n * 62 + ALPHABET.index(ch)\n    return n\n\nfor n in (0, 61, 62, 999999):\n    assert decode(encode(n)) == n",
      },
      {
        level: "medium",
        task: "Design the database table for links. Include the columns, primary key, and one index, and explain how you would expire links after a chosen date.",
        hint: "The redirect only ever looks up by code, so make that the key.",
        solution: "links(code VARCHAR(10) PRIMARY KEY, long_url TEXT NOT NULL,\n      user_id BIGINT, created_at TIMESTAMP, expires_at TIMESTAMP NULL)\nINDEX on (user_id, created_at) to list a user's links.\nExpiry: the redirect returns 404 when expires_at < now();\na nightly job deletes expired rows.",
      },
      {
        level: "hard",
        task: "A celebrity tweets one short link and it gets 50,000 clicks per second. Explain what breaks first in a cache-plus-database design and how you would protect the system.",
        hint: "Think about one hot key and about what happens when it expires from the cache.",
        solution: "One Redis node holds the hot key and becomes the bottleneck; when the key\nexpires, thousands of requests miss at once and hit the database (stampede).\nFixes: replicate hot keys or keep a small in-process cache on each app server,\nserve the redirect from a CDN with a short TTL, and use request coalescing\n(one request refills the cache while others wait) to stop the stampede.",
      },
    ],
    faq: [
      { q: "Can two long URLs get the same short code?", a: "Not with a counter-based design: every number is used once, so every code is unique. Random codes can collide, so they need a check before saving." },
      { q: "Should the same long URL always get the same short code?", a: "It is optional. Reusing codes saves space but needs a lookup by long URL on every create. Many services create a new code each time so each one can have its own analytics." },
      { q: "Which database is best for a URL shortener?", a: "Any store that does fast lookups by key and scales horizontally works: DynamoDB, Cassandra, or sharded PostgreSQL. The access pattern is simple key-value." },
    ],
  },
};

export default extra;
