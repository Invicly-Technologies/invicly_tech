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
        visual: {
          type: "compare",
          title: "301 vs 302 for a short link",
          columns: [
            { title: "301 Moved Permanently", points: ["Browser remembers the answer", "Later clicks may skip your server", "Cheaper to serve", "Weaker click analytics"] },
            { title: "302 Found (temporary)", points: ["Browser asks again every time", "Every click reaches your server", "Every click can be counted", "Slightly more load"] },
          ],
        },
      },
      {
        heading: "Counting clicks without slowing anyone down",
        body: "Writing to an analytics table on every redirect would make clicks slow and could take the redirect service down during a traffic spike. Instead, the server drops a small event onto a queue such as Kafka and replies immediately. Separate workers read the queue and update counts and reports in a data warehouse. If analytics falls behind, redirects keep working.",
        visual: {
          type: "flow",
          title: "Counting a click off the hot path",
          steps: [
            { label: "Redirect request", detail: "Code looked up" },
            { label: "Drop an event", detail: "Small click event onto Kafka" },
            { label: "Reply at once", detail: "302 sent, user moves on" },
            { label: "Workers consume", detail: "Read events at their own pace" },
            { label: "Update reports", detail: "Counts in a data warehouse" },
          ],
        },
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

  // ───────────────────────── Fundamentals ─────────────────────────
  "sd-fundamentals/framework": {
    plain: [
      "A system design interview asks you to design something huge, like YouTube or WhatsApp, in about 45 minutes. Nobody can build that in 45 minutes, so the interviewer is not looking for a perfect answer. They are watching how you think: do you ask good questions, make sensible choices and explain why?",
      "A framework is simply a fixed order of steps you follow every time, like a recipe. When you are nervous, you do not have to invent a plan. You just do the next step: ask questions, agree on the API, draw the big picture, then zoom into the hard parts.",
      "The most common mistake is drawing boxes straight away. If you do not know whether the app has a thousand users or a billion, you cannot know whether you need one database or fifty. Five minutes of questions at the start stops you from designing the wrong system.",
      "Treat the interview as a conversation, not an exam. Think out loud, check in with the interviewer, and treat their hints as gifts. Every time you pick something, say what you gave up to get it. That one habit separates strong candidates from average ones.",
    ],
    deepDive: [
      {
        heading: "Asking questions that change the design",
        body: "Good questions are ones whose answers would change what you draw. \"Which colour is the button?\" changes nothing. \"Do messages need to arrive in order?\" changes a lot.\n\nAim for three groups. First, features: pick the two or three that matter most and say the rest is out of scope. Second, scale: users per day, how often they read versus write, and how much data each action creates. Third, qualities: how fast it must feel, whether data can ever be lost, and whether slightly stale data is acceptable.\n\nWrite the answers on the board. You will point back at them later to justify choices.",
        bullets: ["Features: what are the 2–3 must-haves?", "Scale: daily users, reads vs writes, data size", "Speed: what latency feels acceptable?", "Correctness: can we lose data or show stale data?", "Scope: what are we explicitly not building?"],
      },
      {
        heading: "Turning features into an API",
        body: "Each core feature usually becomes one or two API endpoints. Writing them down forces you to decide what goes in and what comes out, and it quietly reveals your data model.\n\nFor a photo app, \"upload a photo\" becomes POST /photos with the image and a caption, returning a photo ID. \"See my feed\" becomes GET /feed with a cursor, returning a page of photos. Now you know you need a photos table, a way to build feeds and somewhere to store image bytes. Keep it short: five endpoints are plenty for an interview.",
        visual: {
          type: "tree",
          title: "Features become endpoints (photo app)",
          root: "Photo app API",
          children: [
            { label: "Upload a photo", children: ["POST /photos", "Image + caption in, photo ID out"] },
            { label: "See my feed", children: ["GET /feed with a cursor", "Returns a page of photos"] },
            { label: "What it reveals", children: ["A photos table", "A way to build feeds", "Storage for image bytes"] },
          ],
        },
      },
      {
        heading: "The first drawing should be boring",
        body: "Start with the simplest design that actually works end to end: client, load balancer, one service, one database. Then walk one real request through it out loud, for example \"a user opens their feed\". If the walk-through works, you have a baseline.\n\nOnly then improve it, using the numbers you gathered earlier. Reads are 100 times writes? Add a cache. Images are large? Move them to object storage behind a CDN. Each addition now has a clear reason, which is exactly what interviewers want to hear.",
        visual: {
          type: "flow",
          title: "Boring first, then improve with numbers",
          steps: [
            { label: "Baseline", detail: "Client, load balancer, one service, one database" },
            { label: "Walk one request", detail: "\"A user opens their feed\"" },
            { label: "Reads 100x writes?", detail: "Add a cache" },
            { label: "Large images?", detail: "Object storage behind a CDN" },
            { label: "Each box has a reason", detail: "Tied to an estimate" },
          ],
        },
      },
      {
        heading: "Choosing what to deep dive",
        body: "You will not have time to perfect everything, so choose one or two areas. The best choice is the real bottleneck shown by your estimates: the hottest read path, the biggest data store or the trickiest consistency need. If unsure, ask: \"I could go deeper on feed generation or on storage. Which would you prefer?\"\n\nCommon deep dives are hot keys, cache invalidation, sharding the database, handling failures and keeping two copies of data in sync.",
      },
      {
        heading: "Managing a 45-minute clock",
        body: "A rough budget keeps you honest: about 5 minutes for requirements, 5 for estimates and the API, 10 to 15 for the high-level design, 15 for deep dives and the last 3 to 5 for a summary. Glance at the clock at the 15 and 30 minute marks.\n\nIf you are behind, say so and simplify: \"To save time, I will assume a managed database here.\" Finishing a complete, simple design beats half of a brilliant one.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Questions for the first five minutes",
        root: "Clarify the problem",
        children: [
          { label: "Users and features", children: ["Who uses it?", "Which 2–3 features matter most?", "What is out of scope?"] },
          { label: "Scale", children: ["Daily active users?", "Reads per write?", "Data created per action?"] },
          { label: "Performance", children: ["Latency target?", "Peak traffic pattern?"] },
          { label: "Data rules", children: ["Can data ever be lost?", "Is stale data OK for a few seconds?"] },
        ],
      },
      {
        type: "cycle",
        title: "How to make each design decision",
        steps: [
          { label: "Name the problem", detail: "\"Reads will overload the database\"" },
          { label: "Offer two options", detail: "Cache vs read replicas" },
          { label: "Pick one with a reason", detail: "Tie it to a requirement or number" },
          { label: "State the cost", detail: "Stale data, extra moving parts" },
          { label: "Check in", detail: "Ask if the interviewer agrees, then move on" },
        ],
      },
    ],
    examples: [
      {
        title: "The first ten minutes of \"Design Pastebin\"",
        explanation: "Step 1, features: users paste text and get a link; anyone with the link can read it; pastes can expire. Editing and accounts are out of scope. Step 2, scale: assume 1 million new pastes a day and 10 reads per paste, so reads matter most. Step 3, qualities: reads should feel instant, pastes must never be lost, and a few seconds of delay before a new paste is readable is fine. Step 4, API: two endpoints. Step 5, first drawing: client → load balancer → paste service → database, with large text stored in object storage.",
        code: {
          lang: "text",
          code: "Functional: create paste, read paste by link, optional expiry\nOut of scope: accounts, editing, search\nScale: 1M writes/day (~12/s), 10M reads/day (~120/s)\nQualities: fast reads, durable, eventual consistency OK\n\nAPI:\n  POST /pastes { text, expiresIn }  -> 201 { id, url }\n  GET  /pastes/{id}                 -> 200 { text } | 404\n\nDesign v1: client -> LB -> paste service -> DB (metadata)\n                                       -> object storage (text)",
        },
      },
      {
        title: "Saying a trade-off out loud",
        explanation: "The interviewer asks why you added a cache in front of the Pastebin database. A weak answer is \"caches make things fast\". A strong answer follows a pattern: problem, choice, reason, cost. \"Reads are ten times writes and popular pastes are read again and again. I put Redis in front of the database so most reads take about a millisecond and the database stays calm. The cost is that a deleted paste may still be served for up to the cache expiry time, which I would set to five minutes. That is acceptable here because we agreed slight staleness is fine.\"",
      },
    ],
    cheatSheet: [
      "Order: requirements → estimates → API → high-level design → deep dive → wrap up",
      "Pick 2–3 core features and say out loud what is out of scope",
      "Ask: daily users, reads per write, latency target, can data be stale or lost?",
      "One core feature ≈ one endpoint; write its inputs and outputs",
      "Draw the simplest working design first, then fix bottlenecks with numbers",
      "Trade-off pattern: \"I chose X because Y; the cost is Z, which is fine because W\"",
      "Check the clock at 15 and 30 minutes; finish a full design before polishing",
    ],
    quiz: [
      {
        q: "Which question is most useful in the first five minutes?",
        options: ["Which programming language should we use?", "Roughly how many reads happen for each write?", "What colour is the logo?", "Should we use tabs or spaces?"],
        answer: 1,
        why: "The read/write ratio directly shapes caching, replication and storage choices.",
      },
      {
        q: "Why draw a simple end-to-end design before adding caches and queues?",
        options: ["Interviewers dislike caches", "Simple designs never need changes", "It gives a working baseline so every later addition has a clear reason", "Queues cannot be drawn early"],
        answer: 2,
        why: "A baseline lets you justify each improvement against a real bottleneck.",
      },
      {
        q: "You are at minute 35 and still on the database schema. What should you do?",
        options: ["Summarise the rest of the design quickly so it is complete, then note what you would refine", "Keep perfecting the schema", "Ask to restart", "Stop talking and draw silently"],
        answer: 0,
        why: "A complete, simple design is worth more than one perfect component.",
      },
      {
        q: "What makes a trade-off statement strong?",
        options: ["Naming as many technologies as possible", "Saying there are no downsides", "Quoting a famous company", "Stating the choice, the reason and what it costs"],
        answer: 3,
        why: "Interviewers want to see that you understand the price of each decision.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the functional requirements, non-functional requirements and out-of-scope list for \"Design a to-do list app for teams\".",
        hint: "Keep functional to 3 items and give each non-functional item a number or a clear rule.",
        solution: "Functional: create/complete tasks, assign a task to a teammate,\n  see the team's task list\nNon-functional: 1M daily users, list loads in < 300 ms (p99),\n  no lost tasks, changes visible to teammates within 2 s\nOut of scope: file attachments, comments, calendar sync",
      },
      {
        level: "medium",
        task: "Write the API for a photo-sharing app with three features: upload a photo, follow a user, view your feed. Include inputs, outputs and status codes.",
        hint: "Use a cursor for the feed and return the new ID when something is created.",
        solution: "POST /v1/photos  body: image, caption      -> 201 { photoId }\nPOST /v1/users/{id}/follow                  -> 204\nDELETE /v1/users/{id}/follow                -> 204\nGET  /v1/feed?cursor=X&limit=20\n     -> 200 { items: [{ photoId, url, author, caption }], nextCursor }\nErrors: 400 bad input, 401 not logged in, 404 unknown user",
      },
      {
        level: "hard",
        task: "Do a full timed 45-minute design of a Pastebin on paper. Set phone timers at 5, 15, 30 and 40 minutes. Afterwards write a five-line wrap-up of your design and its trade-offs.",
        hint: "At the 40-minute timer, stop adding and start summarising.",
        solution: "Example wrap-up:\n1. Stateless paste service behind a load balancer; text in S3, metadata in Postgres.\n2. IDs from a counter encoded in base62, allocated in blocks per server.\n3. Redis cache for hot pastes (5 min TTL); CDN for very popular ones.\n4. Expiry: lazy check on read plus a nightly cleanup job.\n5. Trade-offs: slight staleness after delete; next step would be sharding\n   metadata by paste ID once one database is not enough.",
      },
    ],
    faq: [
      { q: "Is there one correct answer to a system design question?", a: "No. Several designs can be good. You are judged on whether your choices fit the requirements and whether you can explain their costs." },
      { q: "What if the interviewer mentions a tool I do not know?", a: "Say so honestly and ask what it does, or describe the job it does in general terms, like \"a distributed log\". Reasoning clearly matters more than knowing every product." },
      { q: "Should I start with microservices?", a: "Usually not. Start with a few clear components and split only when a part has different scaling or ownership needs. Interviewers like seeing that you avoid needless complexity." },
      { q: "How much should I talk?", a: "Almost all the time, but in short sentences. Narrate what you are doing and why, and pause regularly to let the interviewer steer." },
    ],
  },

  "sd-fundamentals/estimation": {
    plain: [
      "Estimation is quick, rough maths that tells you how big a system needs to be. You start with a number you know or assume, such as 10 million daily users, and turn it into requests per second, gigabytes of storage and network traffic.",
      "Think of planning a road trip. You do not need fuel to the last millilitre, but you need to know whether it is one tank or five. Being off by two times is fine. Being off by a thousand times leads to the wrong car.",
      "The numbers decide the design. Fifty requests per second fit on one small server and one database. Five hundred thousand requests per second need caches, many servers and a split-up database. Without an estimate, you are guessing which world you are in.",
      "The trick is to round hard and keep your units. Treat a day as 100,000 seconds, write every step on the board and say your assumptions out loud. The interviewer can then correct an assumption instead of your arithmetic.",
    ],
    deepDive: [
      {
        heading: "From requests per second to number of servers",
        body: "Once you know peak QPS, divide it by what one server can handle. A typical web server doing simple database-backed work handles somewhere between a few hundred and a few thousand requests per second. Pick a number, say it out loud, and move on.\n\nThen add headroom. Servers should run at about 50 to 70 percent of their limit so they can absorb spikes and lose a machine without falling over. So 300,000 peak QPS divided by 2,000 per server is 150 servers, and at 60 percent busy you need about 250.",
        bullets: ["Servers = peak QPS ÷ per-server QPS ÷ target utilisation", "Spread them over at least 2–3 availability zones"],
      },
      {
        heading: "How much cache memory?",
        body: "Traffic is rarely spread evenly. A common rule of thumb is 80/20: about 20 percent of items get 80 percent of the reads. So you do not need to cache everything, only the hot fifth.\n\nMultiply the number of items read per day by their size, then take 20 percent. If users read 50 million distinct posts a day at 1 KB each, that is 50 GB, and caching 20 percent needs about 10 GB. That fits comfortably on one Redis server, though you would run two or three for redundancy.",
        visual: {
          type: "flow",
          title: "Sizing a cache with the 80/20 rule",
          steps: [
            { label: "Items read per day", detail: "50 million distinct posts" },
            { label: "Times size", detail: "x 1 KB = 50 GB" },
            { label: "Hot 20%", detail: "About 10 GB" },
            { label: "Fits one Redis node", detail: "Run 2 or 3 for safety" },
          ],
        },
      },
      {
        heading: "Bandwidth: bytes versus bits",
        body: "Bandwidth is QPS times the size of each request or response. Ingress is data coming in (uploads) and egress is data going out (downloads). Egress is usually much bigger and costs money with most cloud providers.\n\nWatch the units. Storage is measured in bytes, but network links are sold in bits per second. Multiply bytes by 8. If you serve 2,000 images per second at 500 KB each, that is 1 GB per second, or 8 gigabits per second. That is more than many single servers can push, which is exactly why images go through a CDN.",
        visual: {
          type: "flow",
          title: "From image traffic to link speed",
          steps: [
            { label: "Requests", detail: "2,000 images per second" },
            { label: "Times size", detail: "x 500 KB = 1 GB per second" },
            { label: "Bytes to bits", detail: "x 8 = 8 gigabits per second" },
            { label: "Compare", detail: "More than many single servers can push" },
          ],
        },
      },
      {
        heading: "Hidden multipliers people forget",
        body: "Raw numbers are only the start. Real systems store extra copies and extra data, and traffic is not flat. Mention these multipliers briefly to show you know real-world sizes are larger than the naive maths.",
        bullets: ["Replication: usually 3 copies, so storage × 3", "Indexes and metadata: often 20–50% on top", "Peak hours: 2–3 × average traffic, more for events", "Growth: plan for 1–2 years ahead", "Backups and logs: extra storage that is easy to forget"],
      },
      {
        heading: "Sanity-checking with known capacities",
        body: "After you get a number, compare it with what real machines can do. These are rough, but they tell you whether one box is enough. A single Redis node handles around 100,000 simple operations per second. A well-tuned PostgreSQL server can serve roughly 10,000 or more simple reads per second and a few thousand writes. A large server has hundreds of GB of RAM and tens of TB of SSD. A Kafka broker can move hundreds of MB per second.\n\nIf your estimate is 5,000 writes per second, one strong database might cope. At 500,000, you clearly need to partition.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From peak traffic to a server count",
        steps: [
          { label: "Peak QPS", detail: "300,000 requests per second" },
          { label: "Per-server capacity", detail: "Assume 2,000 requests per second each" },
          { label: "Raw servers", detail: "300,000 ÷ 2,000 = 150" },
          { label: "Add headroom", detail: "Run at 60% busy: 150 ÷ 0.6 = 250" },
          { label: "Spread out", detail: "About 85 servers in each of 3 zones" },
        ],
      },
      {
        type: "layers",
        title: "Typical sizes to plug into estimates",
        layers: [
          { label: "Short text (tweet, chat message)", detail: "100–300 bytes" },
          { label: "Row of metadata or JSON response", detail: "About 1 KB" },
          { label: "Compressed photo for a feed", detail: "200–500 KB" },
          { label: "Original phone photo", detail: "2–5 MB" },
          { label: "One minute of HD video", detail: "About 40 MB at 5 Mbps" },
        ],
      },
    ],
    examples: [
      {
        title: "Storage and bandwidth for a photo app",
        explanation: "Assume 50 million daily users. Step 1: 10 percent upload one photo a day, so 5 million photos daily. Step 2: each stored photo with its thumbnails is about 2 MB, so 10 TB a day, or about 3.6 PB a year before replication. Step 3: each user views 50 photos a day at 200 KB, so 50M × 50 × 200 KB = 500 TB of egress a day. Step 4: divide by 100,000 seconds to get about 5 GB per second, which is 40 gigabits per second on average and more at peak. Conclusion: photos belong in object storage and must be served through a CDN.",
      },
      {
        title: "A tiny estimation calculator",
        explanation: "Writing the steps as code makes each assumption visible. Here 20 million daily users each make 30 reads. Average QPS is 6,000 and peak is 18,000. If one server handles 1,000 requests per second and we keep servers 60 percent busy, we need about 30 servers. Change any one input and you instantly see its effect.",
        code: {
          lang: "python",
          code: "dau = 20_000_000\nreads_per_user = 30\nday = 100_000                    # seconds, rounded up from 86,400\n\navg_qps = dau * reads_per_user / day\npeak_qps = avg_qps * 3\nservers = peak_qps / 1_000 / 0.6   # 1,000 req/s each, run at 60%\n\nprint(avg_qps, peak_qps, round(servers))  # 6000.0 18000.0 30",
        },
      },
    ],
    cheatSheet: [
      "1 day ≈ 10^5 seconds, so 1 million requests a day ≈ 12 per second",
      "Peak ≈ 2–3 × average; size servers for peak at 50–70% utilisation",
      "Cache size ≈ 20% of the data read per day (80/20 rule)",
      "Bandwidth = QPS × size; multiply bytes by 8 to get bits",
      "1 million × 1 KB = 1 GB; 1 billion × 1 KB = 1 TB",
      "Storage × 3 for replicas, plus 20–50% for indexes and metadata",
      "Rough single-node limits: Redis ~100k ops/s, Postgres ~10k simple reads/s",
    ],
    quiz: [
      {
        q: "A service gets 1 billion requests a day. What is the rough average QPS?",
        options: ["About 1,000", "About 100,000", "About 10,000", "About 1 million"],
        answer: 2,
        why: "1 billion divided by about 100,000 seconds is about 10,000 per second.",
      },
      {
        q: "Users read 100 million distinct items a day at 1 KB each. Using the 80/20 rule, how much cache do you need?",
        options: ["About 20 GB", "About 100 GB", "About 1 TB", "About 2 GB"],
        answer: 0,
        why: "100 million × 1 KB is 100 GB, and 20 percent of that is 20 GB.",
      },
      {
        q: "You send 500 MB per second. What is that in gigabits per second?",
        options: ["0.5 Gbps", "50 Gbps", "4 Gbps", "500 Gbps"],
        answer: 2,
        why: "500 MB × 8 bits per byte is 4,000 megabits, which is 4 gigabits per second.",
      },
      {
        q: "Why should servers run at around 60 percent busy instead of 100 percent?",
        options: ["Cloud providers forbid 100 percent", "To leave room for spikes and for losing a machine", "CPUs break at 100 percent", "It makes code run faster"],
        answer: 1,
        why: "Headroom absorbs traffic bursts and lets the rest of the fleet cover a failed server.",
      },
      {
        q: "Raw data is 100 TB. Which is a more realistic total disk need?",
        options: ["50 TB", "100 TB", "110 TB", "Around 350–450 TB"],
        answer: 3,
        why: "Three replicas plus index and metadata overhead multiply the raw size several times.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "An app has 5 million daily users who each make 20 requests a day. Estimate average and peak QPS.",
        hint: "Total requests divided by 100,000 seconds, then multiply by about 3.",
        solution: "Total = 5M × 20 = 100M requests/day\nAverage = 100M / 100,000 = 1,000 QPS\nPeak ≈ 3 × 1,000 = 3,000 QPS",
      },
      {
        level: "medium",
        task: "A chat app has 100 million daily users who send 40 messages a day, each about 100 bytes. Estimate storage for 5 years, including replication.",
        hint: "Messages per day × size, then × 365 × 5, then × 3.",
        solution: "Messages/day = 100M × 40 = 4 billion\nBytes/day = 4B × 100 B = 400 GB/day\n5 years = 400 GB × 365 × 5 ≈ 730 TB\nWith 3 replicas ≈ 2.2 PB\n(Add indexes and metadata: plan for roughly 3 PB.)",
      },
      {
        level: "hard",
        task: "A video site receives 500 hours of video every minute. It stores 5 quality levels totalling 3 GB per hour of video. Estimate daily and yearly storage and say what it means for the design.",
        hint: "First find hours uploaded per day.",
        solution: "Hours/day = 500 × 60 × 24 = 720,000 hours\nStorage/day = 720,000 × 3 GB ≈ 2.2 PB\nStorage/year ≈ 2.2 PB × 365 ≈ 800 PB (before replication)\nMeaning: only object storage across many data centres can hold this.\nMove rarely watched videos to cheaper cold storage tiers, and consider\nonly creating high quality levels once a video gets views.",
      },
    ],
    faq: [
      { q: "Should I use 86,400 or 100,000 seconds in a day?", a: "Use 100,000 in interviews. It is within 15 percent of the real value and makes the maths instant, which is what matters." },
      { q: "What if the interviewer gives me no numbers?", a: "Propose reasonable ones yourself, such as \"let's assume 10 million daily users\", and ask if that sounds right. Interviewers usually just want you to pick a scale." },
      { q: "How precise do my estimates need to be?", a: "Only the order of magnitude matters. If the true answer is 3,000 QPS, saying 2,000 or 5,000 is fine, but saying 300 or 300,000 would lead to a different design." },
    ],
  },

  "sd-fundamentals/perf-concepts": {
    plain: [
      "Three words describe how well a system performs. Latency is how long you wait for one answer. Throughput is how much work gets done each second. Availability is how often the system works at all.",
      "Picture a coffee shop. Latency is the time from ordering to holding your coffee. Throughput is cups served per hour. Availability is whether the shop is open. A shop can serve 200 cups an hour and still make each customer wait five minutes, so the two numbers are different.",
      "Not every request is equally fast. If you line up all requests from fastest to slowest, the one 95 percent of the way along is the p95. Users remember the slow moments, so teams watch these upper percentiles closely.",
      "Teams turn these ideas into promises. They measure something (an SLI), aim for a target (an SLO) and sometimes sign a contract with customers about it (an SLA). This turns \"the site feels slow\" into a number everyone can agree on.",
    ],
    deepDive: [
      {
        heading: "Little's Law: how latency and throughput connect",
        body: "Little's Law says the number of requests in progress equals throughput times latency. A service handling 1,000 requests per second, each taking 0.2 seconds, has about 200 requests in flight at any moment.\n\nThis explains a common outage. If a database slows down and latency jumps from 0.2 to 2 seconds, the same traffic now needs 2,000 requests in flight. If the server only has 500 worker threads or connections, new requests start queueing, time out and fail, even though the server's CPU looks idle. Slowness turns into an outage.",
        visual: {
          type: "compare",
          title: "Little's Law: same traffic, slower database",
          columns: [
            { title: "Normal", points: ["1,000 requests/s x 0.2 s", "200 requests in flight", "500 workers: plenty of room"] },
            { title: "Database slows down", points: ["1,000 requests/s x 2 s", "2,000 requests in flight", "500 workers: queueing and timeouts"] },
          ],
        },
      },
      {
        heading: "Why latency explodes when servers get busy",
        body: "When a server is lightly used, a new request starts immediately. As it gets busier, requests wait in a queue first. Simple queueing models show the average time in the system is roughly the work time divided by (1 minus utilisation).\n\nAt 50 percent busy, requests take about twice as long as the work itself. At 90 percent, about ten times. At 99 percent, about a hundred times. Latency does not grow gently; it shoots up near the limit. This is why capacity plans keep servers around 60 to 70 percent busy at peak.",
        bullets: ["50% busy → ~2× the work time", "90% busy → ~10×", "99% busy → ~100×"],
      },
      {
        heading: "Tail latency gets worse with fan-out",
        body: "Many pages call several backends at once and wait for all of them. If each backend is slow 1 percent of the time, a page that calls 100 of them hits at least one slow call 1 − 0.99^100 ≈ 63 percent of the time. The rare slow case for one service becomes the normal case for the user.\n\nFixes include calling fewer services, caching results, setting tight timeouts and returning partial results, and hedged requests: if a reply has not arrived by the p95 time, send the same request to a second replica and use whichever answers first.",
      },
      {
        heading: "Measuring percentiles correctly",
        body: "You cannot average percentiles. If server A reports p99 of 100 ms and server B reports 300 ms, the overall p99 is not 200 ms. It depends on how many requests each served and how they were spread.\n\nThe right approach is to record a histogram, a count of requests in latency buckets such as 0–10 ms and 10–25 ms, on every server. Histograms can be added together, and the percentile is computed from the merged result. Prometheus histograms and HdrHistogram work this way. Also measure from the client side when you can, because it includes network and queueing time that server timers miss.",
        visual: {
          type: "flow",
          title: "Getting a fleet-wide p99 right",
          steps: [
            { label: "Record histograms", detail: "Counts per latency bucket on every server" },
            { label: "Collect them", detail: "e.g. Prometheus histograms" },
            { label: "Add bucket counts", detail: "Histograms can be summed" },
            { label: "Compute p99", detail: "From the merged histogram, not by averaging" },
          ],
        },
      },
      {
        heading: "Counting availability honestly",
        body: "There are two common ways to count availability. Time-based counts the minutes the system was up. Request-based divides successful requests by valid requests, which better matches what users feel during a partial outage.\n\nDecide up front what counts as a failure. Server errors (5xx) and responses slower than the target usually count. Client mistakes such as a 404 for a page that does not exist usually do not. Planned maintenance still feels like downtime to users, so many teams count it too.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How one slow dependency takes a server down",
        steps: [
          { label: "Database slows down", detail: "Latency goes from 0.2 s to 2 s" },
          { label: "Requests pile up", detail: "Little's Law: 10× more in flight" },
          { label: "Threads run out", detail: "All workers wait on the database" },
          { label: "New requests queue", detail: "Even healthy endpoints become slow" },
          { label: "Timeouts everywhere", detail: "Users see errors, retries add more load" },
        ],
      },
      {
        type: "compare",
        title: "Tuning for latency vs throughput",
        columns: [
          { title: "Lower latency", points: ["Handle each request right away", "Keep servers lightly loaded", "Cache close to the user", "Costs more machines per request"] },
          { title: "Higher throughput", points: ["Batch work together", "Keep servers busy", "Queue and process in bulk", "Each item may wait longer"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why the average lies",
        explanation: "Ten requests are measured. Nine take 11 to 16 ms and one takes 900 ms because of a slow disk. The average is 102 ms, a number that describes no real request. The p50 is 13 ms (what a typical user sees) and the p90 is 16 ms, while the p99 exposes the 900 ms outlier. The nearest-rank method below sorts the values and picks the item at position ceil(p/100 × n).",
        code: {
          lang: "python",
          code: "import math\n\ntimes_ms = [12, 15, 11, 14, 13, 16, 12, 900, 14, 13]\n\ndef percentile(values, p):\n    s = sorted(values)\n    rank = math.ceil(p / 100 * len(s))  # nearest-rank method\n    return s[rank - 1]\n\nprint(sum(times_ms) / len(times_ms))  # 102.0\nprint(percentile(times_ms, 50))       # 13\nprint(percentile(times_ms, 90))       # 16\nprint(percentile(times_ms, 99))       # 900",
        },
      },
      {
        title: "Writing an SLO for a checkout API",
        explanation: "Step 1, choose the SLI: the share of POST /checkout requests that return a non-5xx response within 500 ms, measured at the load balancer. Step 2, set the SLO: 99.9 percent over a rolling 30 days. Step 3, compute the error budget: with 2 million checkouts a month, 0.1 percent means 2,000 bad requests are allowed. Step 4, set the external SLA lower, say 99.5 percent with service credits, so a bad week does not breach the contract. Step 5, alert when the budget is burning fast, for example 10 percent gone in one hour.",
      },
    ],
    cheatSheet: [
      "Little's Law: requests in flight = throughput × latency",
      "Keep servers below ~70% busy at peak; queueing delay explodes above that",
      "Never average percentiles; merge histograms, then compute the percentile",
      "Chance a fan-out of N calls hits a slow one = 1 − (1 − p)^N",
      "Request-based availability = good requests ÷ valid requests",
      "Downtime per year ≈ (1 − availability) × 525,600 minutes",
      "SLA target < SLO target < what you normally achieve",
    ],
    quiz: [
      {
        q: "A service handles 2,000 requests per second with 50 ms latency. How many requests are in flight on average?",
        options: ["40", "100", "1,000", "2,000"],
        answer: 1,
        why: "By Little's Law, 2,000 per second × 0.05 seconds is 100 requests in flight.",
      },
      {
        q: "What happens to waiting time as a server goes from 50 percent to 95 percent busy?",
        options: ["It grows many times over", "It stays the same", "It halves", "It grows by exactly 45 percent"],
        answer: 0,
        why: "Queueing delay rises sharply near full utilisation, roughly with 1 ÷ (1 − utilisation).",
      },
      {
        q: "Server A's p99 is 100 ms and server B's is 300 ms. What is the combined p99?",
        options: ["200 ms", "300 ms", "100 ms", "It cannot be known without the underlying distributions"],
        answer: 3,
        why: "Percentiles cannot be averaged; you need merged histograms or raw data.",
      },
      {
        q: "A page calls 50 services in parallel, each slow 1 percent of the time. Roughly how often is the page slow?",
        options: ["1 percent", "5 percent", "About 40 percent", "50 percent"],
        answer: 2,
        why: "1 − 0.99^50 is about 0.39, so roughly 40 percent of page loads hit a slow call.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Convert 99.95 percent availability into allowed downtime per 30-day month and per year.",
        hint: "Multiply 0.0005 by the minutes in the period.",
        solution: "Month: 0.0005 × 30 × 24 × 60 = 0.0005 × 43,200 = 21.6 minutes\nYear:  0.0005 × 525,600 ≈ 263 minutes ≈ 4.4 hours",
      },
      {
        level: "medium",
        task: "A service gets 500 requests per second with an average latency of 80 ms and has 200 worker threads. The database suddenly slows and latency becomes 1 second. What happens, and what would you do?",
        hint: "Apply Little's Law before and after.",
        solution: "Before: 500 × 0.08 = 40 requests in flight, well under 200 threads.\nAfter: 500 × 1.0 = 500 in flight, but only 200 threads exist.\nRequests queue, latency climbs further, clients time out and retry.\nFixes: short timeouts on database calls, a circuit breaker to fail fast,\nshed low-priority traffic, and fix or scale the database.",
      },
      {
        level: "hard",
        task: "A page calls 20 services in parallel. Each has p50 of 20 ms and p99 of 300 ms. Estimate how many page loads wait at least 300 ms, then propose two fixes.",
        hint: "The chance that one call is in its slowest 1 percent is 0.01.",
        solution: "P(at least one slow) = 1 − 0.99^20 ≈ 1 − 0.82 = 18%\nSo almost 1 in 5 page loads waits 300 ms or more.\nFix 1: hedged requests - if no reply by ~p95, ask a second replica.\nFix 2: cut fan-out - cache or precompute rarely changing parts.\nFix 3: timeout non-critical calls at ~50 ms and render without them.",
      },
    ],
    faq: [
      { q: "What is a good latency for a web API?", a: "For user-facing calls, many teams target p99 under 200 to 300 ms on the server. Under about 100 ms feels instant to people, while over a second feels slow." },
      { q: "Is 100 percent availability possible?", a: "No. Networks, hardware and deployments all fail sometimes, and each extra nine costs much more. Teams choose a target that users actually need." },
      { q: "Why watch p99 instead of the maximum?", a: "The maximum is often one freak event, like a garbage collection pause, and jumps around a lot. p99 and p99.9 are stable enough to set targets on while still showing the slow tail." },
    ],
  },

  "sd-fundamentals/networking": {
    plain: [
      "When an app shows your messages, it sent a request across the internet and got an answer back. Networking is how that request travels. An API is the agreed shape of the question and the answer, so both sides understand each other.",
      "Think of the postal system. The protocol is the set of postal rules: how to write an address and what goes on the envelope. The API is the specific form you fill in at one office. HTTP is the postal system most of the web uses.",
      "On top of HTTP there are different styles. REST treats everything as resources like /users/42. gRPC sends compact binary messages between services. GraphQL lets the client ask for exactly the fields it wants. WebSockets keep a line open so either side can talk at any time.",
      "Choosing one comes down to three questions. Who is calling: a browser, a mobile app or another service? How often do they talk? And does the server need to push news to the client without being asked?",
    ],
    deepDive: [
      {
        heading: "What one HTTPS request really costs",
        body: "Before the first byte of your data moves, a new connection needs setup. The client looks up the server's address with DNS. Then a TCP handshake takes one round trip, and a TLS 1.3 handshake for encryption takes another. Only then does the request go out, taking a third round trip.\n\nInside one data centre a round trip is under a millisecond, so this barely matters. Between continents it is about 150 ms, so a fresh connection can cost 450 ms before any work happens. That is why clients reuse connections (keep-alive and connection pools) and why CDNs place servers close to users.",
      },
      {
        heading: "HTTP/1.1, HTTP/2 and HTTP/3",
        body: "HTTP/1.1 sends one request at a time per connection, so browsers open about six connections per site to work in parallel. HTTP/2 multiplexes many requests as separate streams over one TCP connection and compresses headers, which saves handshakes.\n\nHTTP/2 has one weakness: TCP delivers bytes strictly in order, so one lost packet stalls every stream until it is resent. HTTP/3 runs over QUIC, which is built on UDP. Each stream recovers from loss on its own, and the connection and encryption handshakes are combined. It helps most on mobile networks with lossy signals.",
        visual: {
          type: "compare",
          title: "HTTP/1.1 vs HTTP/2 vs HTTP/3",
          columns: [
            { title: "HTTP/1.1", points: ["One request at a time per connection", "Browsers open about 6 per site", "No header compression"] },
            { title: "HTTP/2", points: ["Many streams on one TCP connection", "Compressed headers", "One lost packet stalls every stream"] },
            { title: "HTTP/3", points: ["Runs over QUIC on UDP", "Each stream recovers from loss alone", "Connection and TLS handshakes combined"] },
          ],
        },
      },
      {
        heading: "Designing REST endpoints that age well",
        body: "Use nouns for resources and HTTP methods for actions: GET to read, POST to create, PUT or PATCH to update, DELETE to remove. Return honest status codes so clients can react without parsing text. Give errors one consistent JSON shape with a machine-readable code and a human message.\n\nPublic APIs live for years, so plan for change. Put a version in the path, like /v1/. Adding new optional fields is safe. Removing or renaming fields breaks old apps that people never update, so do that only in a new version.",
        bullets: ["201 Created, 204 No Content", "400 bad input, 401 not logged in, 403 not allowed", "404 not found, 409 conflict", "429 too many requests, 503 try again later"],
      },
      {
        heading: "Keeping WebSocket connections at scale",
        body: "A WebSocket stays open for minutes or hours, so the server holding it becomes stateful: it is the only one that can talk to that user. One well-tuned server can hold tens of thousands to hundreds of thousands of mostly idle connections, limited by memory and file descriptors.\n\nTo send a message to a user, other servers must find which server holds their connection. A shared registry in Redis, mapping user to server, plus a pub/sub channel between servers, solves this. Send heartbeats every 20 to 30 seconds so dead connections are noticed and proxies do not close idle ones. During deploys, close connections gradually and let clients reconnect with random delays.",
        visual: {
          type: "sequence",
          title: "Reaching a user on another WebSocket server",
          actors: ["Server A", "Redis", "Server B", "User 42"],
          messages: [
            { from: 0, to: 1, label: "Which server holds user 42?" },
            { from: 1, to: 0, label: "Server B" },
            { from: 0, to: 1, label: "Publish on server B's channel" },
            { from: 1, to: 2, label: "Message for user 42" },
            { from: 2, to: 3, label: "Push over the open WebSocket" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "First HTTPS request to a new server",
        actors: ["Client", "DNS resolver", "API server"],
        messages: [
          { from: 0, to: 1, label: "Where is api.example.com?" },
          { from: 1, to: 0, label: "203.0.113.10" },
          { from: 0, to: 2, label: "TCP SYN" },
          { from: 2, to: 0, label: "SYN-ACK (1st round trip done)" },
          { from: 0, to: 2, label: "ACK + TLS ClientHello" },
          { from: 2, to: 0, label: "TLS ServerHello + certificate (2nd)" },
          { from: 0, to: 2, label: "GET /v1/feed (encrypted)" },
          { from: 2, to: 0, label: "200 OK + JSON (3rd)" },
        ],
      },
      {
        type: "tree",
        title: "Picking a protocol",
        root: "Who talks, and how?",
        children: [
          { label: "Browser or public client", children: ["REST + JSON", "GraphQL if many screens need different fields"] },
          { label: "Service to service", children: ["gRPC for speed and typed contracts"] },
          { label: "Server pushes, client listens", children: ["Server-Sent Events"] },
          { label: "Both sides talk constantly", children: ["WebSockets"] },
          { label: "Big file upload or download", children: ["Presigned URL straight to object storage"] },
        ],
      },
    ],
    examples: [
      {
        title: "A REST API for a book review site",
        explanation: "Features: browse books, read one book, write a review, edit or delete your own review. Each becomes an endpoint with a resource noun and a method. Notice the status codes: 201 with a Location header after creating, 204 when there is nothing to return, 403 when someone edits another person's review. The list uses a cursor so pages stay stable when new books are added. Errors share one JSON shape.",
        code: {
          lang: "text",
          code: "GET    /v1/books?limit=20&cursor=abc  -> 200 { items, nextCursor }\nGET    /v1/books/123                  -> 200 book | 404\nPOST   /v1/books/123/reviews          -> 201 + Location: /v1/reviews/987\nPATCH  /v1/reviews/987                -> 200 | 403 if not the author\nDELETE /v1/reviews/987                -> 204\n\nError body:\n{ \"error\": { \"code\": \"REVIEW_TOO_LONG\", \"message\": \"Max 5000 characters\" } }",
        },
      },
      {
        title: "Choosing a protocol for live sports scores",
        explanation: "Requirement: 5 million fans watch a match and scores should update within a few seconds. Option 1, polling every 5 seconds: 5M ÷ 5 = 1 million requests per second, almost all returning \"no change\". Option 2, WebSockets: works, but fans never send anything, so two-way is wasted complexity. Option 3, Server-Sent Events: one long HTTP response per fan, the server pushes only when the score changes, and browsers reconnect automatically. Choose SSE. Each SSE server subscribes to a pub/sub topic for the match, so one score event fans out to every connected fan.",
      },
    ],
    cheatSheet: [
      "New HTTPS connection ≈ 3 round trips before the response; reuse connections",
      "Cross-continent round trip ≈ 150 ms; same data centre < 1 ms",
      "HTTP/2: many requests on one connection; HTTP/3: QUIC over UDP, better on lossy networks",
      "Version public APIs (/v1); adding fields is safe, removing or renaming is not",
      "429 = slow down (send Retry-After); 503 = temporarily unavailable",
      "WebSocket servers are stateful: keep a user → server map in a shared store",
      "Heartbeat every 20–30 s so dead or idle connections are detected",
    ],
    quiz: [
      {
        q: "Why does the first request to a far-away server feel slow even if the server is fast?",
        options: ["HTTP is a slow format", "DNS, TCP and TLS setup add several round trips first", "Servers sleep between requests", "JSON must be compiled"],
        answer: 1,
        why: "Each handshake costs a round trip, and long distances make each round trip expensive.",
      },
      {
        q: "Which HTTP version avoids one lost packet stalling every stream on the connection?",
        options: ["HTTP/1.0", "HTTP/1.1", "HTTP/2", "HTTP/3"],
        answer: 3,
        why: "HTTP/3 runs on QUIC, where each stream recovers from packet loss independently.",
      },
      {
        q: "A client sends too many requests. Which status code fits best?",
        options: ["429 Too Many Requests", "500 Internal Server Error", "404 Not Found", "301 Moved Permanently"],
        answer: 0,
        why: "429 tells the client to slow down, ideally with a Retry-After header.",
      },
      {
        q: "What extra component does a multi-server WebSocket system usually need?",
        options: ["A second DNS provider", "A GraphQL schema", "A shared registry of which server holds each user's connection", "A larger JSON parser"],
        answer: 2,
        why: "Other servers must know where to route messages for a connected user.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Give the HTTP method, path and success status code for: create an order, fetch an order, change its shipping address, cancel it by deleting it.",
        hint: "Creating returns 201; deleting usually returns 204.",
        solution: "POST   /v1/orders            -> 201 Created\nGET    /v1/orders/{id}       -> 200 OK\nPATCH  /v1/orders/{id}       -> 200 OK  (body: { shippingAddress })\nDELETE /v1/orders/{id}       -> 204 No Content",
      },
      {
        level: "medium",
        task: "Design a cursor-paginated endpoint that lists a user's notifications, newest first. Show a request, a response, and explain what the cursor contains.",
        hint: "The cursor can encode the sort position of the last item returned.",
        solution: "GET /v1/notifications?limit=20&cursor=eyJ0IjoxNzAwfQ\n200 { items: [ { id, text, createdAt } ...20 ], nextCursor: \"...\" }\nCursor = base64 of { createdAt, id } of the last item sent.\nQuery: WHERE (created_at, id) < (:createdAt, :id)\n       ORDER BY created_at DESC, id DESC LIMIT 20\nnextCursor is null when there are no more items.",
      },
      {
        level: "hard",
        task: "Design connection handling for 2 million users connected by WebSocket at once. How many servers, how a message reaches a user on another server, and what happens during a deploy?",
        hint: "Assume around 50,000 connections per server and think about a shared map plus pub/sub.",
        solution: "Servers: 2M / 50k = 40, plus headroom for failures -> about 60.\nOn connect: store userId -> serverId in Redis with a TTL, refreshed by heartbeat.\nSending: the API looks up the user's server and publishes the message\n  to that server's pub/sub channel; that server pushes it down the socket.\nOffline users: store the message and send a push notification instead.\nDeploy: drain one server at a time, close sockets gradually;\n  clients reconnect with random backoff so the others are not flooded.",
      },
    ],
    faq: [
      { q: "Is REST the same as HTTP?", a: "No. HTTP is the protocol that carries requests. REST is a style of designing APIs on top of HTTP using resources, methods and status codes." },
      { q: "Should I use GraphQL for everything?", a: "No. It shines when many different screens need different slices of data. For simple public APIs, REST is easier to cache and operate, and gRPC is better between internal services." },
      { q: "Do WebSockets work behind a load balancer?", a: "Yes, as long as it supports the HTTP upgrade and long-lived connections, which AWS ALB, NGINX and most modern balancers do. Set idle timeouts longer than your heartbeat interval." },
    ],
  },

  "sd-fundamentals/scaling": {
    plain: [
      "When an app gets more users, one server eventually cannot keep up. There are two ways to grow. Vertical scaling means buying a bigger server. Horizontal scaling means adding more servers and splitting the work between them.",
      "Picture a busy kitchen. You can buy a bigger stove, or hire more cooks. More cooks only help if orders are pinned on a shared board, not kept in one cook's head. If a cook goes home, the orders must still be on the board.",
      "In software, \"state\" is anything a server remembers between requests: who is logged in, what is in a cart, an uploaded file. If that lives in one server's memory and the server dies, it is gone, and other servers cannot see it.",
      "The fix is to move state into shared places like a database, Redis or object storage. Then every server is identical and replaceable. You can add ten more during a sale and remove them afterwards without anyone noticing.",
    ],
    deepDive: [
      {
        heading: "A checklist of hidden state",
        body: "Sessions are the famous example, but servers hide state in other places too. Before you put a service behind a load balancer and scale it out, go through this list. Each item either breaks when a second server appears or disappears when a server is replaced.",
        bullets: ["Sessions in memory: move to Redis or signed tokens", "Files on local disk: move to object storage like S3", "Scheduled jobs on every server: they run N times; use one scheduler", "Local rate-limit counters: each server counts only its own share", "In-process caches: fine, as long as losing them is harmless"],
      },
      {
        heading: "Sessions: Redis or signed tokens?",
        body: "With server-side sessions, the browser holds only a random session ID, and every server looks up the details in Redis, which takes about a millisecond. Logging someone out is easy: delete the key.\n\nWith signed tokens such as JWTs, the user's ID and roles live inside the token, signed by the server. Any server can check the signature without a lookup. The downside is that you cannot easily cancel a token before it expires. The common compromise is a short-lived access token, 5 to 15 minutes, plus a longer refresh token that is checked against a store and can be revoked.",
        visual: {
          type: "compare",
          title: "Server-side sessions vs signed tokens",
          columns: [
            { title: "Session in Redis", points: ["Browser holds a random session ID", "About 1 ms lookup per request", "Logout: delete the key"] },
            { title: "Signed token (JWT)", points: ["User ID and roles inside the token", "Any server checks the signature", "Hard to cancel before expiry", "Usual fix: 5-15 min token + refresh"] },
          ],
        },
      },
      {
        heading: "How auto scaling actually works",
        body: "Auto scaling watches a metric, such as average CPU or requests per instance, and compares it with a target, for example 60 percent CPU. Above target, it adds instances; below, it removes them. AWS Auto Scaling groups and the Kubernetes Horizontal Pod Autoscaler both work this way.\n\nNew instances are not instant. Booting, pulling the image and warming caches can take one to five minutes. So scale out early and quickly, scale in slowly with a cooldown, keep a sensible minimum, and use scheduled scaling for predictable peaks such as 9 a.m. on Mondays.",
      },
      {
        heading: "The database is the last stateful piece",
        body: "Once app servers are stateless, the database becomes the bottleneck. Scale it in order of effort. First, go bigger: a large PostgreSQL machine handles a lot. Second, add a cache so repeated reads never reach it. Third, add read replicas for read-heavy traffic. Last, split the data across machines (sharding), which is powerful but complex.\n\nWatch connections too. Every app server holds a pool of connections, so 50 servers with 20 connections each is 1,000. PostgreSQL often struggles above a few hundred, so put a pooler such as PgBouncer in between.",
        visual: {
          type: "flow",
          title: "Scaling the database, cheapest first",
          steps: [
            { label: "Bigger machine", detail: "Vertical scaling goes far" },
            { label: "Add a cache", detail: "Repeated reads never reach it" },
            { label: "Read replicas", detail: "For read-heavy traffic" },
            { label: "Sharding", detail: "Powerful but complex" },
            { label: "Pool connections", detail: "PgBouncer in front of PostgreSQL" },
          ],
        },
      },
      {
        heading: "When vertical scaling is the right answer",
        body: "Horizontal scaling is not always better. A single big machine has no network calls between parts, no partial failures and much simpler code. Cloud servers with over a hundred CPU cores and terabytes of memory are available today. Stack Overflow famously served huge traffic from a small number of powerful database servers.\n\nVertical scaling is a great first move for databases and young products. Its limits are a hard ceiling on size, rising prices at the top end, and a single point of failure, so you still want a standby copy ready to take over.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Making a stateful app stateless",
        steps: [
          { label: "Find the state", detail: "Sessions, files, jobs, counters" },
          { label: "Sessions to Redis", detail: "Or short-lived signed tokens" },
          { label: "Files to object storage", detail: "S3 or similar, served by a CDN" },
          { label: "Jobs to one scheduler", detail: "Or a queue with workers" },
          { label: "Add a load balancer", detail: "Run 2+ copies in different zones" },
          { label: "Turn on auto scaling", detail: "Target ~60% CPU" },
        ],
      },
      {
        type: "cycle",
        title: "The auto scaling loop",
        steps: [
          { label: "Measure", detail: "CPU or requests per instance" },
          { label: "Compare to target", detail: "For example 60% CPU" },
          { label: "Adjust", detail: "Add or remove instances" },
          { label: "Wait", detail: "Warm-up and cooldown before acting again" },
        ],
      },
    ],
    examples: [
      {
        title: "Moving a shopping cart out of server memory",
        explanation: "Before: each server kept carts in a Python dictionary, so a user whose next request hit another server saw an empty cart, and a restart emptied everyone's cart. After: the cart lives in a Redis hash keyed by session ID. Any server can add items with HINCRBY, and EXPIRE forgets carts left idle for a week. The servers now keep nothing between requests.",
        code: {
          lang: "python",
          code: "import redis\n\nr = redis.Redis(host=\"sessions.internal\", port=6379)\n\ndef add_to_cart(session_id: str, product_id: str, qty: int) -> None:\n    key = f\"cart:{session_id}\"\n    r.hincrby(key, product_id, qty)   # any server can update it\n    r.expire(key, 7 * 24 * 3600)      # drop idle carts after 7 days\n\ndef get_cart(session_id: str) -> dict:\n    raw = r.hgetall(f\"cart:{session_id}\")\n    return {k.decode(): int(v) for k, v in raw.items()}",
        },
      },
      {
        title: "Growing from 1,000 to 10 million users",
        explanation: "Stage 1: one server runs the app and the database. Stage 2: the database moves to its own machine so each can be sized separately. Stage 3: sessions move to Redis and uploads to S3, then two app servers sit behind a load balancer in different zones, so one can fail safely. Stage 4: a cache and a read replica absorb read traffic, and a CDN serves images and scripts. Stage 5: auto scaling adds app servers at peak. Only when writes outgrow the biggest database machine does sharding enter the picture.",
      },
    ],
    cheatSheet: [
      "Stateless = any server can serve any request, and any server can die safely",
      "Sessions → Redis or tokens; files → object storage; jobs → one scheduler or a queue",
      "Run at least 2 instances in different zones, even with little traffic",
      "Auto scale on CPU (~60%) or requests per instance; out fast, in slowly",
      "DB connections = app servers × pool size; use PgBouncer when it gets large",
      "Database order: bigger machine → cache → read replicas → sharding",
      "JWT: no lookup, hard to revoke; keep access tokens to 5–15 minutes",
    ],
    quiz: [
      {
        q: "An app saves user uploads to /var/uploads on each server. What breaks when you add a second server?",
        options: ["Nothing", "Uploads saved on one server are missing when the other server handles the request", "The load balancer refuses to start", "The database runs out of space"],
        answer: 1,
        why: "Local disk is per-server state; files must move to shared object storage.",
      },
      {
        q: "A nightly email job runs via cron on every app server. With 8 servers, what happens?",
        options: ["Users get the email 8 times", "The job runs faster", "Only the first server runs it", "The emails are split 8 ways"],
        answer: 0,
        why: "Each server runs its own copy, so the job needs a single scheduler or a lock.",
      },
      {
        q: "What is the main downside of long-lived JWTs for sessions?",
        options: ["They need a database lookup", "They only work with one server", "They are hard to revoke before they expire", "They cannot hold a user ID"],
        answer: 2,
        why: "A signed token stays valid until expiry unless you add a deny list.",
      },
      {
        q: "60 app servers each use a pool of 20 connections, and PostgreSQL allows 500. What is the problem?",
        options: ["Queries will be too fast", "Nothing, pools are shared automatically", "Too few servers", "1,200 connections exceed the database limit"],
        answer: 3,
        why: "Connections add up across servers; a pooler such as PgBouncer is needed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "An app keeps sessions in memory, saves profile pictures to local disk and sends a daily digest via cron on each server. List each piece of state and where it should move.",
        hint: "Match each to a shared store or a single place to run.",
        solution: "Sessions in memory  -> Redis (or short-lived signed tokens)\nProfile pictures    -> object storage such as S3, served via a CDN\nDaily digest cron   -> one scheduler (e.g. a Kubernetes CronJob)\n                       or a queue so exactly one worker sends it",
      },
      {
        level: "medium",
        task: "40 app servers each have a database pool of 20 connections, and PostgreSQL's max_connections is 500. You plan to scale to 60 servers. What goes wrong and how do you fix it?",
        hint: "Multiply servers by pool size.",
        solution: "Today: 40 × 20 = 800 > 500 already, so some pools cannot fill.\nAt 60 servers: 1,200 attempted connections -> connection errors.\nFix: put PgBouncer in transaction-pooling mode between app and DB,\nso hundreds of client connections share ~100 real ones.\nAlso: shrink per-server pools and send reads to replicas.",
      },
      {
        level: "hard",
        task: "Traffic jumps 5× at 9:00 every weekday, and new instances need 4 minutes to be ready. Design an auto scaling policy that avoids slowdowns at 9:00 and wasted money at night.",
        hint: "Combine scheduled scaling with target tracking.",
        solution: "1. Scheduled action at 08:45: raise minimum capacity to the 9:00 level.\n2. Target tracking at ~55% CPU handles surprises during the day.\n3. Scale-out: no cooldown; add several instances per step.\n4. Scale-in: 15-minute cooldown, remove a few at a time.\n5. Evening scheduled action: lower the minimum again.\n6. Bake images ahead of time and warm caches on start to cut the 4 minutes.\n7. Load test the 9:00 jump before relying on it.",
      },
    ],
    faq: [
      { q: "Does stateless mean the app has no database?", a: "No. The app servers keep nothing between requests, but the data still lives in databases and caches. Statelessness moves state out of servers, it does not remove it." },
      { q: "Are sticky sessions always bad?", a: "They are a workaround that hurts balancing and loses users' sessions when a server dies. They are acceptable for long-lived connections like WebSockets, where a client naturally stays on one server." },
      { q: "When should I switch from vertical to horizontal scaling?", a: "When you need redundancy, when the next bigger machine is too expensive, or when you hit the largest size available. For stateless app servers, start horizontal early since it is cheap." },
    ],
  },

  // ───────────────────────── Building blocks ─────────────────────────
  "building-blocks/load-balancing": {
    plain: [
      "A load balancer stands in front of a group of servers and decides which one handles each request. Users only ever see one address. Behind it there might be two servers or two thousand, and users never need to know.",
      "Think of a supermarket worker who points each shopper to a checkout lane. They send people to the shortest line, and if a cashier goes home sick, they stop sending anyone to that lane. Shoppers just see a store that keeps moving.",
      "That second job, noticing broken servers, is just as important as spreading load. The load balancer keeps checking each server. If one crashes or is being updated, traffic quietly flows to the others. This is how big sites stay up during failures and deployments.",
      "You will also hear the term reverse proxy: a server that sits in front of your app and talks on its behalf. NGINX, HAProxy, Envoy and AWS Application Load Balancer can all act as both a reverse proxy and a load balancer.",
    ],
    deepDive: [
      {
        heading: "Choosing an algorithm",
        body: "Round robin is fine when servers are identical and requests cost about the same. Real fleets are messier. Weighted round robin sends more traffic to bigger machines. Least connections and least response time follow actual load, which helps when some requests take seconds.\n\nA clever, cheap option is \"power of two choices\": pick two servers at random and send the request to the less busy one. It performs almost as well as checking every server, and it avoids herding, where every balancer piles onto the same \"least busy\" server at once. Hash-based routing is for cases where the same key should land on the same server, such as caches.",
        bullets: ["Equal servers, similar requests: round robin", "Mixed machine sizes: weighted round robin", "Uneven request times: least connections", "Many balancers, big fleet: power of two choices", "Cache or session affinity: consistent hashing"],
      },
      {
        heading: "Health checks done right",
        body: "A typical setup probes each server every 5 to 10 seconds, marks it unhealthy after 2 or 3 failures in a row, and healthy again after 2 or 3 successes. The thresholds stop one slow reply from flapping a server in and out.\n\nBe careful with deep checks that also test the database. If the database has a hiccup, every server fails its check at the same moment and the balancer has nowhere to send traffic. Keep the health check shallow (\"is this process able to serve?\") and handle dependency problems in the app. Many balancers also fail open: if every target looks unhealthy, they send traffic to all of them anyway.",
        visual: {
          type: "cycle",
          title: "A server's health check states",
          steps: [
            { label: "Healthy", detail: "Probed every 5 to 10 seconds" },
            { label: "Failing", detail: "2 or 3 failed probes in a row" },
            { label: "Out of rotation", detail: "Gets no new traffic" },
            { label: "Recovering", detail: "2 or 3 successes in a row: back in" },
          ],
        },
      },
      {
        heading: "Connection draining and safe deploys",
        body: "Pulling a server out abruptly cuts off requests that are halfway done. Instead, the balancer drains it: it stops sending new requests but lets in-flight ones finish, usually with a limit of about 30 seconds. AWS calls this the deregistration delay.\n\nThe reverse matters too. A fresh server should only get traffic once its readiness check passes, meaning it has loaded config, opened database connections and warmed its caches. Some balancers add a slow start, ramping new servers up gradually instead of hitting them with a full share at once.",
      },
      {
        heading: "Balancing across the globe",
        body: "Inside one region a load balancer picks a server. Across regions, something has to pick the region first. GeoDNS or latency-based DNS, such as Amazon Route 53, answers each user with the address of a nearby region and stops returning a region that fails its health checks. The catch is caching: clients and resolvers may keep an old DNS answer for the TTL or longer, so failover can take minutes.\n\nAnycast is the other approach. The same IP address is announced from many locations, and internet routing carries each user to the nearest one. Cloudflare and Google's global load balancer use anycast, which reacts faster than DNS changes.",
      },
      {
        heading: "Who balances the balancer?",
        body: "A single load balancer is a single point of failure. Managed ones, such as AWS ALB and NLB or Google Cloud Load Balancing, are built from many machines across zones, so you get redundancy without thinking about it.\n\nIf you run your own, the classic setup is two HAProxy or NGINX machines and a tool called keepalived. They share one virtual IP address using a protocol called VRRP. The active machine holds the address, and if it stops responding, the standby claims it within a few seconds. Large systems often stack layers: a fast L4 balancer in front of a fleet of L7 proxies.",
        visual: {
          type: "sequence",
          title: "keepalived failover with a virtual IP",
          actors: ["Active balancer", "Standby balancer", "Clients"],
          messages: [
            { from: 0, to: 1, label: "VRRP adverts: I hold the virtual IP" },
            { from: 2, to: 0, label: "Traffic to the virtual IP" },
            { from: 0, to: 1, label: "Adverts stop (active fails)" },
            { from: 1, to: 2, label: "Standby claims the IP within seconds" },
            { from: 2, to: 1, label: "Same virtual IP, new machine" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Load balancing happens at several levels",
        layers: [
          { label: "DNS or anycast", detail: "Picks the nearest healthy region" },
          { label: "Edge / CDN", detail: "Serves cached content, absorbs floods" },
          { label: "Regional L4 balancer", detail: "Spreads TCP connections, very fast" },
          { label: "L7 proxies", detail: "Route by path or header, terminate TLS" },
          { label: "Service instances", detail: "Spread across availability zones" },
        ],
      },
      {
        type: "sequence",
        title: "Draining a server during a deploy",
        actors: ["Deploy tool", "Load balancer", "Server A"],
        messages: [
          { from: 0, to: 1, label: "Start draining Server A" },
          { from: 1, to: 2, label: "No new requests; in-flight ones continue" },
          { from: 2, to: 1, label: "Last in-flight response sent" },
          { from: 1, to: 0, label: "A drained (or 30 s limit reached)" },
          { from: 0, to: 2, label: "Stop and start new version" },
          { from: 2, to: 1, label: "Readiness check passes" },
          { from: 1, to: 2, label: "Send traffic again, ramping up slowly" },
        ],
      },
    ],
    examples: [
      {
        title: "How round robin piles slow work on one server",
        explanation: "Three servers sit behind round robin. A client sends requests in a repeating pattern: fast, fast, export, where an export takes 10 seconds and the others take 10 ms. Round robin sends request 1 to server A, 2 to B, 3 to C, then 4 to A again. Every third request is an export, so every export lands on server C. Within a minute C has dozens of exports running and is overloaded while A and B sit idle. Least connections fixes this: C has many open requests, so new work goes elsewhere.",
      },
      {
        title: "A small NGINX load balancer",
        explanation: "This config terminates HTTPS and spreads requests across three app servers using least connections. The third server is bigger, so it gets double weight. max_fails and fail_timeout give passive health checking: after 3 failed requests within 10 seconds, NGINX skips that server for 10 seconds. Active health probes need NGINX Plus or a different proxy such as HAProxy or Envoy.",
        code: {
          lang: "nginx",
          code: "upstream api {\n    least_conn;\n    server 10.0.1.11:8080 max_fails=3 fail_timeout=10s;\n    server 10.0.1.12:8080 max_fails=3 fail_timeout=10s;\n    server 10.0.1.13:8080 weight=2;   # bigger machine\n}\n\nserver {\n    listen 443 ssl;\n    server_name api.example.com;\n    ssl_certificate     /etc/nginx/tls/api.crt;\n    ssl_certificate_key /etc/nginx/tls/api.key;\n    location / { proxy_pass http://api; }\n}",
        },
      },
    ],
    cheatSheet: [
      "Round robin for equal servers and requests; least connections for uneven request times",
      "Power of two choices: pick 2 random servers, send to the less busy one",
      "Health check every 5–10 s; remove after 2–3 failures, re-add after 2–3 passes",
      "Keep health checks shallow so one database blip does not remove every server",
      "Drain for ~30 s before stopping a server; only send traffic once it is ready",
      "DNS failover is slowed by cached answers; keep health-checked records at low TTLs",
      "Self-hosted HA: two HAProxy nodes with keepalived sharing a virtual IP",
    ],
    quiz: [
      {
        q: "What problem does \"power of two choices\" solve?",
        options: ["It encrypts traffic twice", "It balances well without checking every server and avoids herding", "It doubles server capacity", "It keeps users on the same server"],
        answer: 1,
        why: "Comparing just two random servers gives near-optimal spread with very little coordination.",
      },
      {
        q: "Why can a health check that queries the database be dangerous?",
        options: ["A database blip makes every server fail at once, leaving no healthy targets", "Databases cannot be queried by health checks", "It makes the check too fast", "It breaks TLS"],
        answer: 0,
        why: "A shared dependency failing turns into all servers being marked down together.",
      },
      {
        q: "What does connection draining do?",
        options: ["Deletes old logs", "Closes all connections immediately", "Stops new requests to a server while letting in-flight ones finish", "Moves the database"],
        answer: 2,
        why: "Draining lets a server leave the pool without cutting off users mid-request.",
      },
      {
        q: "Why can DNS-based regional failover be slow?",
        options: ["DNS servers are slow to reply", "DNS only works over UDP", "Load balancers block DNS", "Clients and resolvers cache old answers for the TTL or longer"],
        answer: 3,
        why: "Users keep going to the failed region until their cached DNS answer expires.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pick a balancing algorithm for each case: (a) identical API servers with similar requests; (b) servers that mix 5 ms reads with 5 s report exports; (c) cache servers where the same key should hit the same node.",
        hint: "Think about whether request cost or key location matters.",
        solution: "(a) Round robin - simple and fair when everything is equal.\n(b) Least connections (or least response time) - follows real load.\n(c) Consistent hashing on the cache key - same key, same node,\n    and few keys move when nodes are added or removed.",
      },
      {
        level: "medium",
        task: "Design the health check for a web service that depends on PostgreSQL and Redis. Say what the endpoint checks, the probe interval and thresholds, and how you handle a database outage.",
        hint: "Separate \"is this process OK?\" from \"are my dependencies OK?\".",
        solution: "GET /healthz: returns 200 if the process is running, not overloaded,\n  and has finished startup (config loaded, pools created). No DB query.\nProbe every 5 s; unhealthy after 3 failures, healthy after 2 passes.\nDB outage: the app returns 503 for DB-backed endpoints and serves\n  cached data where possible, but stays in the pool.\nSeparately, alert on DB errors through metrics, not the health check.",
      },
      {
        level: "hard",
        task: "Design load balancing for an app running in three regions so that users go to the nearest region and survive the loss of a whole region.",
        hint: "Think about the global layer, the regional layer and spare capacity.",
        solution: "Global: latency-based DNS (e.g. Route 53) with health checks and a\n  60 s TTL, or an anycast global load balancer for faster failover.\nRegional: managed L7 balancer spread over 3 zones, least connections.\nCapacity: each region runs at <= 60% so the other two can absorb\n  a failed region's traffic (+50% each).\nData: each region must be able to serve reads locally; writes go to\n  the primary region or a multi-region database.\nTest: regularly drain a region on purpose to prove failover works.",
      },
    ],
    faq: [
      { q: "Is a load balancer the same as a reverse proxy?", a: "They overlap. A reverse proxy sits in front of servers and forwards requests; a load balancer spreads those requests across several servers. Most modern tools such as NGINX and Envoy do both." },
      { q: "Does a load balancer slow down requests?", a: "Very little. A load balancer in the same data centre usually adds well under a millisecond, which is tiny compared with the time the app itself takes." },
      { q: "Do I need a load balancer if I use Kubernetes?", a: "Kubernetes Services already spread traffic across pods inside the cluster. You still need an Ingress or a cloud load balancer to bring outside traffic into the cluster." },
    ],
  },

  "building-blocks/caching": {
    plain: [
      "A cache is a small, fast store that keeps copies of things you need often. Reading from memory takes microseconds, a database query takes milliseconds, and fetching from the other side of the world takes hundreds of milliseconds. A cache keeps answers close and quick.",
      "Think of your fridge. You do not drive to the shop every time you want milk. You keep some at home, and when it goes off you buy fresh. A cache is the fridge, the database is the shop, and the use-by date is the TTL.",
      "Caches exist at many layers: your browser, a CDN near your city, the app server's memory, a shared Redis server and even inside the database. Each layer saves a trip to the slower layer behind it.",
      "The catch is that copies can go out of date. A famous joke says the two hardest things in computing are cache invalidation and naming things. So for every cache, decide how stale is acceptable: one second, one minute or one day.",
    ],
    deepDive: [
      {
        heading: "Hit ratio is the number that matters",
        body: "The database only sees cache misses. At a 90 percent hit ratio it receives 10 percent of reads. At 99 percent it receives 1 percent. So going from 90 to 99 percent cuts database load by ten times, even though it sounds like a small change.\n\nMeasure hits and misses for every cache. A low hit ratio usually has one of three causes: keys that are too specific (each user's slightly different query cached separately), TTLs that are too short, or a cache too small for the hot data so items are pushed out before they are reused.",
      },
      {
        heading: "A race that leaves stale data",
        body: "Cache-aside has a subtle race. A reader misses the cache and reads the old value from the database. Before it stores that value, a writer updates the database and deletes the cache key. Then the slow reader finally writes the old value into the cache. The cache is now wrong until the TTL runs out.\n\nThis is rare but real at high traffic. Defences: always set a TTL as a safety net, delete the key a second time shortly after the write (a delayed double delete), or update the cache from the database's change stream so writes are applied in order.",
      },
      {
        heading: "Stampedes: beyond simple locks",
        body: "When a hot key expires, thousands of requests can miss at once and hammer the database. Besides letting one request rebuild while others wait, two gentler techniques exist.\n\nStale-while-revalidate keeps serving the old value for a short grace period while one background request fetches a fresh one, so nobody waits. Probabilistic early refresh gives each read a small and growing chance to refresh the key just before it expires, so one lucky request renews it early. Also plan for a cold start: after a cache restart, every key is a miss, so warm the most popular keys before sending full traffic.",
        visual: {
          type: "compare",
          title: "Three ways to avoid a stampede",
          columns: [
            { title: "Single rebuild (lock)", points: ["One request rebuilds the key", "Others wait for it", "Simple, but adds waiting"] },
            { title: "Stale-while-revalidate", points: ["Serve the old value for a grace period", "One background refresh", "Nobody waits"] },
            { title: "Probabilistic early refresh", points: ["Growing chance to refresh near expiry", "One lucky request renews early", "Key never expires under load"] },
          ],
        },
      },
      {
        heading: "HTTP caching and CDNs",
        body: "Browsers and CDNs follow the Cache-Control header. For files whose name includes a content hash, like app.3f9a2c.js, send \"public, max-age=31536000, immutable\": the file can be cached for a year because a new version gets a new name. For HTML, send \"no-cache\", which means store it but check with the server each time. For personal data, send \"private, no-store\" so shared caches never keep it.\n\nRevalidation is cheap with ETags. The server tags each response, the browser sends If-None-Match with that tag, and the server replies 304 Not Modified with no body if nothing changed.",
        visual: {
          type: "tree",
          title: "Cache-Control by content type",
          root: "Cache-Control",
          children: [
            { label: "Hashed files (app.3f9a2c.js)", children: ["public, max-age=31536000, immutable"] },
            { label: "HTML pages", children: ["no-cache", "Stored, but checked every time"] },
            { label: "Personal data", children: ["private, no-store"] },
            { label: "Revalidation", children: ["ETag + If-None-Match", "304 Not Modified, no body"] },
          ],
        },
      },
      {
        heading: "When memory fills up",
        body: "A cache has limited memory, so it must evict something. LRU drops the item unused for the longest. LFU drops the item used least often, which suits steady favourites. In Redis, set maxmemory and a policy such as allkeys-lru for a pure cache. The default noeviction makes writes fail when memory is full, which surprises many teams.\n\nAlso cache misses on purpose. If many requests ask for an ID that does not exist, each one goes to the database. Caching \"not found\" for a short time, say 30 seconds, stops that, including from attackers probing random IDs.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Cache layers from the user inward",
        layers: [
          { label: "Browser cache", detail: "0 ms: no network at all" },
          { label: "CDN edge", detail: "~10–30 ms: a server in the user's region" },
          { label: "In-process app cache", detail: "Microseconds, but per server" },
          { label: "Shared Redis", detail: "~0.5–1 ms over the data-centre network" },
          { label: "Database buffer pool", detail: "Pages already in database memory" },
          { label: "Disk", detail: "The slowest layer and the source of truth" },
        ],
      },
      {
        type: "sequence",
        title: "The stale-cache race in cache-aside",
        actors: ["Reader", "Writer", "Cache", "Database"],
        messages: [
          { from: 0, to: 2, label: "GET user:7 → miss" },
          { from: 0, to: 3, label: "Read user:7 (old value)" },
          { from: 1, to: 3, label: "UPDATE user:7" },
          { from: 1, to: 2, label: "DELETE user:7" },
          { from: 0, to: 2, label: "SET user:7 = old value (now stale)" },
        ],
      },
    ],
    examples: [
      {
        title: "Cache headers for a typical web app",
        explanation: "Step 1: built JavaScript and CSS have a content hash in their names, so they are cached for a year and never revalidated. Step 2: index.html must always point at the latest files, so it is revalidated on each visit using its ETag. Step 3: a public product API is cached at the CDN for 60 seconds (s-maxage) but not in browsers (max-age=0). Step 4: the logged-in user's profile must never sit in a shared cache.",
        code: {
          lang: "text",
          code: "/assets/app.3f9a2c.js  Cache-Control: public, max-age=31536000, immutable\n/index.html            Cache-Control: no-cache      (revalidate via ETag)\n/api/products/42       Cache-Control: public, s-maxage=60, max-age=0\n/api/me                Cache-Control: private, no-store",
        },
      },
      {
        title: "Letting only one request rebuild a hot key",
        explanation: "On a miss, each caller tries to take a short lock with SET NX (set only if not exists) and a 10-second expiry. The winner loads from the database, fills the cache and releases the lock. Everyone else sleeps for 50 ms and tries again, by which time the value is usually cached. The lock's expiry means a crashed winner cannot block others forever. In production, also cap the number of retries.",
        code: {
          lang: "python",
          code: "def get_product(pid):\n    key = f\"product:{pid}\"\n    val = r.get(key)\n    if val is not None:\n        return json.loads(val)\n    # only one caller rebuilds; the rest wait briefly and retry\n    if r.set(f\"lock:{key}\", \"1\", nx=True, ex=10):\n        try:\n            data = load_product_from_db(pid)\n            r.set(key, json.dumps(data), ex=300)\n            return data\n        finally:\n            r.delete(f\"lock:{key}\")\n    time.sleep(0.05)\n    return get_product(pid)",
        },
      },
    ],
    cheatSheet: [
      "Hit ratio 90% → DB sees 10% of reads; 99% → just 1%",
      "Hashed file names + Cache-Control: public, max-age=31536000, immutable",
      "Personal data: Cache-Control: private, no-store",
      "Stale-while-revalidate: serve the old value while one request refreshes it",
      "Redis as a pure cache: set maxmemory and maxmemory-policy allkeys-lru",
      "Cache \"not found\" results for ~30 s to stop repeated misses",
      "Always set a TTL, even when you also invalidate on write",
    ],
    quiz: [
      {
        q: "A service gets 100,000 reads per second. How many reach the database at a 98 percent hit ratio?",
        options: ["98,000", "2,000", "200", "20,000"],
        answer: 1,
        why: "Only misses reach the database, and 2 percent of 100,000 is 2,000.",
      },
      {
        q: "Which header is right for a file named app.3f9a2c.js?",
        options: ["Cache-Control: no-store", "Cache-Control: private", "Cache-Control: public, max-age=31536000, immutable", "No header at all"],
        answer: 2,
        why: "A content-hashed name never changes content, so it can be cached for a year.",
      },
      {
        q: "What does stale-while-revalidate do?",
        options: ["Serves the old value briefly while one request fetches a fresh one", "Deletes all stale keys", "Blocks reads until the value is fresh", "Doubles the TTL"],
        answer: 0,
        why: "Users get an instant answer and only one background request hits the database.",
      },
      {
        q: "Redis is full and uses the default noeviction policy. What happens?",
        options: ["Old keys are removed", "Redis restarts", "Reads start failing", "New writes return errors"],
        answer: 3,
        why: "With noeviction, Redis refuses writes that need more memory instead of evicting keys.",
      },
      {
        q: "Why cache a \"not found\" result?",
        options: ["To save disk space", "So repeated lookups for missing IDs do not all reach the database", "Because 404s are slow to generate", "To improve SEO"],
        answer: 1,
        why: "Without it, every request for a missing ID is a guaranteed miss that hits the database.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A service gets 50,000 reads per second. How many reach the database at 95 percent and at 99 percent hit ratio? What does this tell you?",
        hint: "Database reads = total × (1 − hit ratio).",
        solution: "95%: 50,000 × 0.05 = 2,500 reads/s\n99%: 50,000 × 0.01 = 500 reads/s\nA 4-point hit ratio gain cuts database load 5x,\nso tuning keys, TTLs and cache size is very worthwhile.",
      },
      {
        level: "medium",
        task: "Choose Cache-Control headers for: a logo with a hash in its file name, the homepage HTML, public search results that may be 30 seconds old, and a user's order history.",
        hint: "Ask for each: can it change, and is it personal?",
        solution: "Logo (hashed):     public, max-age=31536000, immutable\nHomepage HTML:     no-cache   (store, but revalidate with ETag)\nSearch results:    public, s-maxage=30, max-age=0\nOrder history:     private, no-store",
      },
      {
        level: "hard",
        task: "During a flash sale, one product page gets 200,000 requests per second, all for the same cache key. Design the caching so neither Redis nor the database falls over, while stock counts stay roughly correct.",
        hint: "One key on one Redis node is a hot spot. Add layers and split what changes fast from what does not.",
        solution: "1. CDN caches the page shell for ~5 s (s-maxage=5, stale-while-revalidate).\n2. Each app server keeps an in-process copy of product details for 1-2 s,\n   so Redis sees at most a few requests per server per second.\n3. Spread the hot key over replicas or copies (product:42#0..#9).\n4. Single-flight rebuilds so only one request reloads from the DB.\n5. Stock count is separate: a Redis counter decremented atomically,\n   shown approximately; the real check happens at checkout.",
      },
    ],
    faq: [
      { q: "Should I use Redis or Memcached?", a: "Both are fast in-memory caches. Redis is the common default because it also has data structures, persistence and replication; Memcached is simpler and very efficient for plain key-value caching." },
      { q: "Should I cache everything?", a: "No. Cache data that is read often and can be slightly stale. Caching rarely read or constantly changing data wastes memory and adds bugs without much benefit." },
      { q: "What TTL should I choose?", a: "Ask how stale the data can be without hurting users. Product details might live 5 minutes, a news homepage 30 seconds, and a stock price a second or less." },
    ],
  },

  "building-blocks/queues": {
    plain: [
      "A message queue is a waiting line for work. One part of the system drops in a message such as \"send this email\" or \"resize this photo\". Another part picks it up and does the work when it can. The sender does not wait.",
      "Think of a post box. You drop in a letter and walk away. You do not stand there until the postman comes. Letters wait safely in the box until someone collects them, even if the postman is late today.",
      "This brings three big benefits. Spikes are absorbed: a thousand orders in one minute just make the line longer for a while. A slow or broken worker does not break the website. And you can add more workers to catch up faster.",
      "There are two main flavours. A work queue gives each job to exactly one worker. Pub/sub and event streams give every interested service its own copy of each message. Kafka belongs to the second group and also keeps history, so you can replay old events.",
    ],
    deepDive: [
      {
        heading: "What happens when a worker crashes mid-job",
        body: "Queues must survive workers dying. In Amazon SQS, receiving a message does not delete it. It becomes invisible for a visibility timeout, say 30 seconds. The worker deletes it only after finishing. If the worker crashes, the timeout expires and the message reappears for another worker. RabbitMQ does something similar: unacknowledged messages are requeued when a worker's connection drops.\n\nSet the timeout longer than your slowest job, or extend it while working. If it is too short, a slow but healthy worker's job reappears and a second worker starts it too. This is exactly why delivery is \"at least once\".",
      },
      {
        heading: "Keys, partitions and ordering in Kafka",
        body: "A Kafka topic is split into partitions. When a producer sends a message with a key, Kafka hashes the key to choose the partition, so all messages with the same key land in the same partition, in order. Choose the key to match what must stay in order: an order ID, an account ID or a user ID.\n\nTwo warnings. Adding partitions later changes which partition a key maps to, which can briefly break ordering. And a very busy key, such as one huge customer, overloads its single partition. The partition count also caps parallelism: a consumer group can use at most one consumer per partition.",
      },
      {
        heading: "When to commit: the source of delivery guarantees",
        body: "A consumer tells the system it is done by acknowledging or, in Kafka, committing its offset. The timing decides the guarantee. Commit before processing and crash: the message is skipped, which is at-most-once. Commit after processing and crash: the message is processed again, which is at-least-once.\n\nKafka offers transactions that give exactly-once results when you read from Kafka and write back to Kafka. Once an outside system is involved, such as a database or an email provider, you get exactly-once effects by combining at-least-once delivery with idempotent work: record each message ID and skip ones you have already handled.",
        visual: {
          type: "compare",
          title: "When you commit decides the guarantee",
          columns: [
            { title: "Commit, then process", points: ["Offset saved first", "Crash: message skipped", "At-most-once"] },
            { title: "Process, then commit", points: ["Work done first", "Crash: message processed again", "At-least-once; add idempotency"] },
          ],
        },
      },
      {
        heading: "Retries and poison messages",
        body: "A poison message always fails, perhaps because it has bad data. Retrying it forever wastes workers and, in Kafka, blocks every message behind it in the partition.\n\nRetry with growing delays, then give up. In SQS, a redrive policy with maxReceiveCount of about 5 moves the message to a dead-letter queue automatically. In Kafka, the usual pattern is to publish the failing message to a retry topic, and then to a dead-letter topic, so the main partition keeps moving. Alert when a dead-letter queue is not empty, fix the bug, then replay the parked messages.",
        visual: {
          type: "flow",
          title: "Retry and dead-letter topics in Kafka",
          steps: [
            { label: "Main topic", detail: "Message fails processing" },
            { label: "Retry topic", detail: "Tried again after a delay" },
            { label: "Still failing", detail: "Give up after a few tries" },
            { label: "Dead-letter topic", detail: "Main partition keeps moving" },
            { label: "Alert and fix", detail: "Then replay the parked messages" },
          ],
        },
      },
      {
        heading: "Watching lag and sizing workers",
        body: "Consumer lag is how far behind workers are. In Kafka it is the newest offset minus the committed offset; in SQS it is the number of visible messages and the age of the oldest one. Rising lag means work arrives faster than it is done.\n\nLittle's Law sizes the worker pool: needed concurrency equals arrival rate times processing time. At 500 messages per second taking 0.2 seconds each, you need 100 messages in progress at once. Scale workers on lag or queue depth rather than CPU, since workers waiting on network calls can be idle on CPU yet far behind. KEDA does this for Kubernetes.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A worker crashes mid-job (SQS style)",
        actors: ["Producer", "Queue", "Worker A", "Worker B"],
        messages: [
          { from: 0, to: 1, label: "Send job 42" },
          { from: 1, to: 2, label: "Deliver job 42, hide it for 30 s" },
          { from: 1, to: 3, label: "No delete after 30 s: deliver job 42 again" },
          { from: 3, to: 1, label: "Done: delete job 42" },
        ],
      },
      {
        type: "tree",
        title: "Picking a messaging tool",
        root: "What do you need?",
        children: [
          { label: "Background jobs", children: ["Amazon SQS", "RabbitMQ", "Celery or Sidekiq on Redis"] },
          { label: "One event, many services", children: ["SNS topic fanning out to SQS queues", "Google Pub/Sub"] },
          { label: "High-volume ordered stream with replay", children: ["Apache Kafka", "Amazon Kinesis", "Redpanda"] },
          { label: "Complex routing rules", children: ["RabbitMQ exchanges"] },
        ],
      },
    ],
    examples: [
      {
        title: "Sending a welcome email without slowing sign-up",
        explanation: "Step 1: the sign-up API saves the user, sends a message with the user ID and a unique message ID to SQS, and returns in about 50 ms. Step 2: a worker long-polls the queue, waiting up to 20 seconds for messages. Step 3: for each message it checks whether that message ID was already handled, because SQS may deliver twice. Step 4: it sends the email, records the ID, and only then deletes the message. If the email provider is down, the message reappears and is retried; after 5 attempts a redrive policy moves it to a dead-letter queue.",
        code: {
          lang: "python",
          code: "import json\nimport boto3\n\nsqs = boto3.client(\"sqs\")\nURL = \"https://sqs.us-east-1.amazonaws.com/123456789012/welcome-emails\"\n\nwhile True:\n    resp = sqs.receive_message(QueueUrl=URL, MaxNumberOfMessages=10, WaitTimeSeconds=20)\n    for msg in resp.get(\"Messages\", []):\n        job = json.loads(msg[\"Body\"])\n        if not already_sent(job[\"messageId\"]):   # idempotency check\n            send_welcome_email(job[\"userId\"])\n            mark_sent(job[\"messageId\"])\n        sqs.delete_message(QueueUrl=URL, ReceiptHandle=msg[\"ReceiptHandle\"])",
        },
      },
      {
        title: "Keeping bank events in order with Kafka keys",
        explanation: "Account 77 gets two events: deposit 100, then withdraw 80. If they go to different partitions, two consumers may process them at the same time, and the withdrawal could run first and be rejected for insufficient funds. Step 1: use the account ID as the message key. Step 2: Kafka hashes \"77\" to, say, partition 4, so both events go there in order. Step 3: the topic has 12 partitions, so up to 12 consumers share the work, each owning whole partitions. Different accounts are processed in parallel, but each account's events stay in order.",
      },
    ],
    cheatSheet: [
      "SQS visibility timeout must be longer than your slowest job",
      "Kafka: same key → same partition → same order; consumers per group ≤ partitions",
      "Commit after processing = at-least-once; commit before = at-most-once",
      "Exactly-once effects = at-least-once delivery + idempotent processing",
      "After ~5 failed attempts, move the message to a dead-letter queue and alert",
      "Workers needed ≈ messages per second × seconds per message",
      "Scale consumers on lag or queue depth, not CPU",
    ],
    quiz: [
      {
        q: "An SQS job takes 60 seconds but the visibility timeout is 30 seconds. What happens?",
        options: ["The job is deleted early", "The message reappears and a second worker starts the same job", "SQS rejects the message", "The job runs twice as fast"],
        answer: 1,
        why: "The message becomes visible again before the first worker deletes it.",
      },
      {
        q: "How do you make sure all events for one order are processed in order in Kafka?",
        options: ["Use one topic per order", "Send them with no key", "Use the order ID as the message key", "Use more consumers than partitions"],
        answer: 2,
        why: "Messages with the same key go to the same partition, which is ordered.",
      },
      {
        q: "A consumer commits its offset before processing and then crashes. What is the result?",
        options: ["The message is lost (at-most-once)", "The message is processed twice", "Kafka retries automatically forever", "The partition is deleted"],
        answer: 0,
        why: "The offset already moved past the message, so nobody processes it again.",
      },
      {
        q: "Messages arrive at 300 per second and each takes 0.5 seconds. How many must be processed at once to keep up?",
        options: ["60", "600", "300", "150"],
        answer: 3,
        why: "By Little's Law, 300 per second × 0.5 seconds is 150 concurrent jobs.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Choose a work queue, pub/sub or a replayable log for each: (a) resize each uploaded photo once; (b) when an order is placed, notify inventory, email and analytics; (c) rebuild last week's click report with new logic.",
        hint: "One worker, many services, or history?",
        solution: "(a) Work queue (e.g. SQS) - each photo resized once by one worker.\n(b) Pub/sub (e.g. SNS -> one SQS queue per service, or a Kafka topic)\n    - every service gets its own copy.\n(c) Replayable log (Kafka with enough retention) - re-read old events.",
      },
      {
        level: "medium",
        task: "A queue receives 800 messages per second and each takes 250 ms. Each worker process handles 10 messages at a time. How many processes do you need, with 50 percent headroom?",
        hint: "Find concurrent messages first with Little's Law.",
        solution: "Concurrency = 800 × 0.25 = 200 messages in progress\nProcesses = 200 / 10 = 20\nWith 50% headroom: 20 × 1.5 = 30 processes\nAutoscale on queue depth so it can grow during spikes.",
      },
      {
        level: "hard",
        task: "A consumer reads payment events from Kafka and updates account balances in PostgreSQL. Design it so a crash or redelivery never applies a payment twice.",
        hint: "Make the database remember what it has already applied, in the same transaction as the update.",
        solution: "Table processed_events(event_id PRIMARY KEY).\nFor each event, in ONE database transaction:\n  INSERT INTO processed_events VALUES (:event_id)\n    -- if it already exists, rollback and skip (duplicate)\n  UPDATE accounts SET balance = balance + :amount WHERE id = :acct\nCOMMIT, then commit the Kafka offset.\nCrash before the DB commit: nothing applied, event is redelivered.\nCrash after DB commit but before the offset commit: event comes back,\nthe insert hits the primary key, and it is skipped. Use the account ID as\nthe Kafka key so each account's events stay in order.",
      },
    ],
    faq: [
      { q: "Kafka or RabbitMQ?", a: "Use RabbitMQ or SQS for job queues with per-message retries and routing. Use Kafka for high-volume event streams that several services read and that you may want to replay." },
      { q: "Can a queue lose messages?", a: "Managed queues like SQS and properly configured Kafka (replication factor 3, acks=all) are very durable. Messages are more often lost by consumers that acknowledge before finishing their work." },
      { q: "Can I just use a database table as a queue?", a: "For modest volumes, yes. A PostgreSQL SELECT with FOR UPDATE SKIP LOCKED lets many workers safely claim rows. Move to a real queue when volume or fan-out grows." },
    ],
  },

  "building-blocks/gateway-ratelimit": {
    plain: [
      "As a company grows from one service to dozens, each would need its own login checks, logging and traffic limits. An API gateway is a single front door that handles these shared chores once, so each service can focus on its real job.",
      "Think of a hotel reception desk. It checks your booking, tells you which floor to go to and stops a crowd from rushing the lifts. The rooms themselves do not need to check IDs; reception already did.",
      "Rate limiting caps how many requests one client can make in a period, for example 100 per minute. It protects you from buggy apps stuck in a loop, from scrapers and password guessers, and it keeps things fair so one customer cannot starve the rest.",
      "When a client goes over its limit, the server replies with status 429, \"Too Many Requests\", and says when to try again. Well-behaved clients wait and retry. The servers stay healthy for everyone else.",
    ],
    deepDive: [
      {
        heading: "What belongs in a gateway, and what does not",
        body: "A gateway should do jobs that are the same for every service and that should happen before a request reaches one. Business rules do not belong there. Once a gateway starts querying databases and making product decisions, every team has to change it, and it becomes a slow, risky bottleneck.\n\nA related pattern is the backend for frontend (BFF): a small gateway per client type, such as one for the mobile app and one for the website, that combines several backend calls into the exact shape each screen needs. Popular gateways include Kong, AWS API Gateway, Envoy-based gateways and Apigee.",
        bullets: ["Verify tokens and API keys", "Route paths to services; send 5% to a canary version", "Enforce rate limits and request size limits", "Add a request ID for tracing; log every call", "Handle CORS and TLS"],
      },
      {
        heading: "The sliding window counter trick",
        body: "A true sliding window log stores a timestamp for every request, which uses a lot of memory. The sliding window counter gets close with just two numbers per client: the count for the current fixed window and the count for the previous one.\n\nIt assumes the previous window's requests were spread evenly and counts only the part still inside the sliding window. Estimate = current count + previous count × (fraction of the previous window still in view). With a limit of 100 per minute, 80 requests last minute, 30 so far this minute, and 15 seconds into this minute, 45 of the previous 60 seconds are still in view: 30 + 80 × 0.75 = 90, so the request is allowed. Cloudflare has described using this approach.",
        visual: {
          type: "flow",
          title: "Sliding window counter, worked through",
          steps: [
            { label: "Limit", detail: "100 requests per minute" },
            { label: "Counts", detail: "Previous minute 80, this minute 30" },
            { label: "Position", detail: "15 s into the minute: 75% of previous still in view" },
            { label: "Estimate", detail: "30 + 80 x 0.75 = 90" },
            { label: "Decision", detail: "90 is under 100: allowed" },
          ],
        },
      },
      {
        heading: "Leaky bucket vs token bucket",
        body: "A token bucket lets a client burst: if it saved up tokens, it can spend them quickly. That suits user-facing APIs, where short bursts are normal.\n\nA leaky bucket instead puts requests into a queue that drains at a fixed rate, like water dripping from a hole. Output is perfectly smooth, but requests may wait. It is ideal in front of something fragile, such as an SMS provider that allows exactly 10 messages per second. NGINX's limit_req is a leaky bucket; its burst setting lets some requests queue up instead of being rejected, and nodelay serves those queued requests immediately.",
        visual: {
          type: "compare",
          title: "Token bucket vs leaky bucket",
          columns: [
            { title: "Token bucket", points: ["Saved tokens allow bursts", "Suits user-facing APIs", "No tokens left: rejected"] },
            { title: "Leaky bucket", points: ["Requests queue, drain at a fixed rate", "Perfectly smooth output", "Requests may wait", "NGINX limit_req works this way"] },
          ],
        },
      },
      {
        heading: "Choosing what to limit by",
        body: "The key you count against matters as much as the algorithm. For logged-in traffic, limit by user ID or API key, which is fair and hard to dodge. For anonymous traffic, IP address is all you have, but many people can share one IP behind an office or mobile network, and with IPv6 one person may control a huge range, so limit by the /64 block.\n\nMost real systems stack several limits: a generous overall limit per key, tighter limits on sensitive endpoints such as login, and a global limit that protects a fragile backend no matter who calls it.",
        bullets: ["Per user or API key: fair quotas and paid tiers", "Per IP: anonymous traffic and floods", "Per endpoint: login, sign-up, password reset", "Global: protect a backend's total capacity"],
      },
      {
        heading: "Telling clients about their limits",
        body: "Good APIs make limits visible so clients can slow down before hitting them. Always send Retry-After with a 429. Many APIs also send headers such as X-RateLimit-Limit, X-RateLimit-Remaining and X-RateLimit-Reset, and an IETF draft standardises RateLimit headers. GitHub, for example, allows 5,000 requests per hour for authenticated REST API users and reports what is left on every response.\n\nWhen introducing a new limit, run it in shadow mode first: log who would have been blocked without blocking anyone. This catches limits that would hurt real customers before they cause an incident.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Where limits are enforced, from the outside in",
        layers: [
          { label: "CDN / WAF", detail: "Block floods and bad IPs before they reach you" },
          { label: "API gateway", detail: "Per-key quotas and paid tiers" },
          { label: "Service", detail: "Per-endpoint limits on expensive operations" },
          { label: "Outbound calls", detail: "Respect partner limits, e.g. SMS 10 per second" },
        ],
      },
      {
        type: "sequence",
        title: "A client hits its limit and backs off",
        actors: ["Client", "Gateway", "Counter store", "Orders service"],
        messages: [
          { from: 0, to: 1, label: "GET /orders (key k1)" },
          { from: 1, to: 2, label: "Count request for k1" },
          { from: 2, to: 1, label: "101 this minute (limit 100)" },
          { from: 1, to: 0, label: "429 + Retry-After: 20" },
          { from: 0, to: 1, label: "Retry 20 s later" },
          { from: 1, to: 2, label: "Count for k1: 1 in new window" },
          { from: 1, to: 3, label: "Forward request" },
          { from: 3, to: 1, label: "200 orders" },
        ],
      },
    ],
    examples: [
      {
        title: "Sliding window counter in a few lines",
        explanation: "This function estimates the requests in the last 60 seconds from two counters. The previous window's count is weighted by how much of it still overlaps the sliding window. Run it for three situations: early in a minute with modest traffic (allowed), early in a minute with heavy traffic (blocked), and late in a minute when the previous window barely counts (allowed).",
        code: {
          lang: "python",
          code: "def allowed(prev_count, curr_count, secs_into_window, limit=100, window=60):\n    overlap = (window - secs_into_window) / window\n    estimate = curr_count + prev_count * overlap\n    return estimate < limit\n\nprint(allowed(80, 30, 15))  # 30 + 80*0.75 = 90.0  -> True\nprint(allowed(80, 50, 15))  # 50 + 80*0.75 = 110.0 -> False\nprint(allowed(80, 50, 45))  # 50 + 80*0.25 = 70.0  -> True",
        },
      },
      {
        title: "Designing limits for a public API",
        explanation: "Step 1, tiers per API key: free gets 60 requests per minute, pro gets 1,000. Step 2, sensitive endpoints: login allows 5 attempts per 15 minutes per account and IP, which stops password guessing without hurting real users. Step 3, expensive endpoints: data export allows 10 per hour per key. Step 4, a global guard: the gateway caps total traffic to the search service at 20,000 per second to protect its cluster. Step 5, every response includes remaining-quota headers and every 429 includes Retry-After. Step 6, run all new limits in log-only mode for a week first.",
      },
    ],
    cheatSheet: [
      "Sliding window counter ≈ current + previous × share of previous window still in view",
      "Token bucket allows bursts; leaky bucket gives a smooth, fixed output rate",
      "Limit logged-in users by user or key; anonymous users by IP (IPv6: by /64)",
      "Tight limits on login and password reset, e.g. 5 per 15 minutes",
      "Always return 429 with Retry-After; expose remaining quota in headers",
      "Test new limits in shadow (log-only) mode first",
      "Gateways do shared chores; business logic stays in services",
    ],
    quiz: [
      {
        q: "Limit is 100 per minute. Last minute had 60 requests, this minute has 70, and we are 30 seconds in. Using a sliding window counter, is the next request allowed?",
        options: ["Yes, the estimate is 70", "Yes, the estimate is 85", "No, the estimate is exactly 100, which is not below the limit", "No, the estimate is 130"],
        answer: 2,
        why: "70 + 60 × 0.5 = 100, which is not below the limit of 100.",
      },
      {
        q: "Which algorithm best protects a partner API that accepts exactly 10 calls per second?",
        options: ["Leaky bucket", "Fixed window", "No limit", "Random dropping"],
        answer: 0,
        why: "A leaky bucket releases requests at a steady fixed rate.",
      },
      {
        q: "Why is limiting only by IP address risky?",
        options: ["IPs are secret", "IPs change every request", "Gateways cannot read IPs", "Many real users can share one IP behind an office or mobile network"],
        answer: 3,
        why: "A per-IP limit can block a whole office or carrier network because of one heavy user.",
      },
      {
        q: "What should a gateway NOT do?",
        options: ["Verify API keys", "Apply product business rules and query the orders database", "Add request IDs", "Return 429 when limits are exceeded"],
        answer: 1,
        why: "Business logic in the gateway makes it a shared bottleneck that every team must change.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Limit: 10 requests per minute. The previous minute had 8 requests, this minute has 4 so far, and we are 30 seconds in. Is the next request allowed with a sliding window counter?",
        hint: "Half of the previous window is still in view.",
        solution: "Overlap = (60 - 30) / 60 = 0.5\nEstimate = 4 + 8 × 0.5 = 8\n8 < 10, so the request is allowed.",
      },
      {
        level: "medium",
        task: "Configure NGINX to allow each client IP 10 requests per second on /api/, with bursts of up to 20 served immediately, and return 429 when the limit is exceeded.",
        hint: "Use limit_req_zone, limit_req with burst and nodelay, and limit_req_status.",
        solution: "limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n\nserver {\n    location /api/ {\n        limit_req zone=api burst=20 nodelay;\n        limit_req_status 429;\n        proxy_pass http://backend;\n    }\n}",
      },
      {
        level: "hard",
        task: "Your gateway runs 30 instances in 3 regions and serves 50,000 API customers with per-key limits. Design rate limiting that stays fast (under 1 ms added) and survives the counter store failing.",
        hint: "Think about where counters live, how exact they must be, and what to do when the store is down.",
        solution: "1. Counters in a Redis cluster per region, keyed by API key + window.\n2. Each gateway also keeps a local token bucket and syncs counts to Redis\n   every ~100 ms in batches, so most decisions need no network call.\n3. Accept small overshoot (a few %) in exchange for speed.\n4. Per-region quota = global quota split by traffic share, rebalanced\n   every few minutes.\n5. If Redis is down: fail open using local buckets only, and alert.\n6. Tier limits are loaded from config and cached in each gateway.",
      },
    ],
    faq: [
      { q: "Is an API gateway the same as a load balancer?", a: "No, though they overlap. A load balancer spreads traffic across copies of a service; a gateway also authenticates, rate limits and routes requests to many different services." },
      { q: "What if the rate limiter's data store goes down?", a: "Most teams fail open and let traffic through, because blocking every customer is worse than briefly allowing extra requests. Local per-server limits can act as a rough backup." },
      { q: "Do I need a gateway if I only have one service?", a: "Usually not. A reverse proxy or your framework's middleware can handle auth and rate limits. Gateways pay off once several services share these concerns." },
    ],
  },

  "building-blocks/blob-search": {
    plain: [
      "Databases are great at small, structured records like users and orders. They are poor at two other jobs: holding huge files and finding text by its words. Each job has its own specialised tool.",
      "Object storage, such as Amazon S3, Google Cloud Storage or Cloudflare R2, is like a giant warehouse of labelled boxes. You put a file in under a name, called a key, and fetch it later by that name. It is cheap, almost never loses data and has no practical size limit.",
      "A search engine, such as Elasticsearch, OpenSearch or Meilisearch, works like the index at the back of a book: each word points to the pages that contain it. It can find \"red running shoes\" among millions of products in milliseconds and put the best matches first.",
      "The database stays the source of truth. Object storage holds the bytes of files, and the database stores their keys. The search index is a copy built purely for finding things, so if it is ever lost, you rebuild it from the database.",
    ],
    deepDive: [
      {
        heading: "How object storage stays safe and cheap",
        body: "Amazon S3 is designed for 99.999999999 percent (eleven nines) durability. It achieves this by spreading each object across several facilities, using copies or erasure coding, which splits a file into data and parity pieces so it can be rebuilt even if some pieces are lost.\n\nThe namespace is flat. \"photos/2024/cat.jpg\" is just one key; the slashes only look like folders. Cost has three parts: gigabytes stored per month, number of requests, and data downloaded to the internet. Storage classes such as Standard, Infrequent Access and Glacier trade cheaper storage for slower or pricier access, and lifecycle rules move old objects between them automatically.",
      },
      {
        heading: "Uploading big files the right way",
        body: "Sending a 2 GB video through your app servers wastes their bandwidth and memory. Instead, the app hands the client a presigned URL, a link that allows one upload to one key for a limited time, and the client sends the bytes straight to storage.\n\nLarge files use multipart upload. The file is split into parts of 5 MB to 5 GB, up to 10,000 parts, which upload in parallel and can be retried one by one if the network drops. S3 objects can be up to 5 TB. When the upload finishes, an event notification can trigger processing, such as creating thumbnails. Store the object key in your database and generate download URLs when needed.",
        visual: {
          type: "flow",
          title: "Multipart upload of a large file",
          steps: [
            { label: "Get presigned URLs", detail: "From your API, time limited" },
            { label: "Split the file", detail: "Parts of 5 MB to 5 GB, up to 10,000" },
            { label: "Upload in parallel", detail: "Straight to storage" },
            { label: "Retry failed parts", detail: "Only the parts that dropped" },
            { label: "Complete", detail: "Event can trigger thumbnails" },
          ],
        },
      },
      {
        heading: "What happens to text before it is indexed",
        body: "Before indexing, a search engine runs each text field through an analyzer. It splits text into tokens, lowercases them, often removes very common stop words such as \"the\" and \"for\", and may stem words so \"running\" and \"runs\" both become \"run\". Synonym rules can make \"sneakers\" match \"shoes\".\n\nThe same analyzer runs on the user's query, so both sides end up in the same form and match. Results are then ranked, usually with BM25, which gives more weight to rare words and to matches in short fields such as a title.",
      },
      {
        heading: "Shards, replicas and refresh",
        body: "An Elasticsearch index is split into primary shards, each a self-contained Lucene index that can live on a different machine. Replica shards are copies that serve reads and take over if a node fails. Elastic's guidance is to keep shards roughly between 10 and 50 GB.\n\nSearch is near real-time, not instant. New documents become searchable after a refresh, which happens every second by default. Some changes, such as changing how a field is analysed, need a full reindex. The safe way is to build a new index, then point an alias, a stable name your app queries, at it in one atomic step.",
        visual: {
          type: "flow",
          title: "Reindexing without downtime",
          steps: [
            { label: "App queries an alias", detail: "e.g. products points at products_v1" },
            { label: "Create products_v2", detail: "With the new analysis settings" },
            { label: "Reindex documents", detail: "Fill v2 from the source data" },
            { label: "Swap the alias", detail: "One atomic step to v2" },
            { label: "Drop products_v1", detail: "Once v2 looks right" },
          ],
        },
      },
      {
        heading: "When you do not need a search engine",
        body: "A separate search cluster is one more system to run, secure and keep in sync. PostgreSQL has solid built-in full-text search: a tsvector column holds the processed words, a GIN index makes lookups fast, and ts_rank orders results. The pg_trgm extension adds fuzzy matching and speeds up LIKE queries. This comfortably handles millions of rows for many apps.\n\nReach for Elasticsearch or OpenSearch when you need advanced relevance tuning, typo tolerance, faceted filters across huge catalogues, or when search traffic would put too much load on your main database.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Direct upload with a presigned URL",
        actors: ["Client", "API server", "Object storage", "Database"],
        messages: [
          { from: 0, to: 1, label: "I want to upload cat.jpg (2 MB)" },
          { from: 1, to: 0, label: "Presigned PUT URL, valid 15 min" },
          { from: 0, to: 2, label: "PUT file bytes directly" },
          { from: 2, to: 0, label: "200 OK" },
          { from: 0, to: 1, label: "Upload done: photos/u42/cat.jpg" },
          { from: 1, to: 3, label: "Save photo record with key" },
        ],
      },
      {
        type: "flow",
        title: "From text to index entries",
        steps: [
          { label: "Raw text", detail: "\"Running Shoes for Men!\"" },
          { label: "Tokenise", detail: "Running, Shoes, for, Men" },
          { label: "Lowercase", detail: "running, shoes, for, men" },
          { label: "Drop stop words", detail: "running, shoes, men" },
          { label: "Stem", detail: "run, shoe, men" },
          { label: "Index", detail: "Each word → list of matching documents" },
        ],
      },
    ],
    examples: [
      {
        title: "Full-text search in PostgreSQL first",
        explanation: "Step 1: add a generated tsvector column that combines the product name and description, analysed with English rules. Step 2: add a GIN index on it. Step 3: turn the user's text into a query with websearch_to_tsquery, which understands quotes and minus signs like a web search box. Step 4: filter with @@ and sort by ts_rank. For many shops this is all the search they need.",
        code: {
          lang: "sql",
          code: "ALTER TABLE products ADD COLUMN search tsvector\n  GENERATED ALWAYS AS (\n    to_tsvector('english', name || ' ' || coalesce(description, ''))\n  ) STORED;\n\nCREATE INDEX products_search_idx ON products USING GIN (search);\n\nSELECT id, name, ts_rank(search, q) AS rank\nFROM products, websearch_to_tsquery('english', 'red running shoes') AS q\nWHERE search @@ q\nORDER BY rank DESC\nLIMIT 20;",
        },
      },
      {
        title: "Reindexing with zero downtime",
        explanation: "You want to add synonyms to the product index, which needs a reindex. Step 1: create products_v2 with the new settings. Step 2: bulk-load it from the database, the source of truth. Step 3: replay changes that happened during the load from the change stream. Step 4: compare document counts and run sample queries. Step 5: switch the alias \"products\" from v1 to v2 in one atomic call. The app always queries \"products\", so users never notice. Keep v1 for a day in case you need to roll back.",
        code: {
          lang: "json",
          code: "POST /_aliases\n{\n  \"actions\": [\n    { \"remove\": { \"index\": \"products_v1\", \"alias\": \"products\" } },\n    { \"add\":    { \"index\": \"products_v2\", \"alias\": \"products\" } }\n  ]\n}",
        },
      },
    ],
    cheatSheet: [
      "Files go in object storage; the database keeps only the key and metadata",
      "S3 multipart: parts of 5 MB–5 GB, up to 10,000 parts, objects up to 5 TB",
      "Lifecycle rules move old objects to cheaper storage classes automatically",
      "Use the same analyzer for indexing and for queries, or words will not match",
      "Elasticsearch shards: aim for roughly 10–50 GB each",
      "New documents are searchable after a refresh, about 1 s by default",
      "Query through an alias so you can reindex and switch with no downtime",
      "PostgreSQL tsvector + GIN index is enough search for many apps",
    ],
    quiz: [
      {
        q: "Why let clients upload directly to object storage with a presigned URL?",
        options: ["It makes files smaller", "App servers do not have to carry the file bytes", "It skips authentication", "Object storage cannot accept uploads otherwise"],
        answer: 1,
        why: "The heavy transfer bypasses your servers, which only issue a short-lived permission.",
      },
      {
        q: "A user searches \"Running\" but the index stored \"run\". Why might it still match?",
        options: ["Search engines ignore the query", "Because of the CDN", "The query goes through the same analyzer, which stems it to \"run\"", "Elasticsearch guesses randomly"],
        answer: 2,
        why: "Analysing both documents and queries the same way puts them into the same form.",
      },
      {
        q: "You add a product and search for it immediately in Elasticsearch, but it is missing. Most likely why?",
        options: ["The index has not refreshed yet, which takes about a second by default", "The product was deleted", "Shards are full", "S3 is down"],
        answer: 0,
        why: "Elasticsearch is near real-time; documents appear after the next refresh.",
      },
      {
        q: "What does an index alias let you do?",
        options: ["Store files", "Compress shards", "Skip the analyzer", "Switch queries from an old index to a new one atomically"],
        answer: 3,
        why: "Apps query the alias name, so you can repoint it to a rebuilt index with no downtime.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Decide where each belongs (database, object storage or search index): a profile photo, a user's email address, product descriptions users search through, a nightly database backup, order rows.",
        hint: "Big bytes, structured truth, or a searchable copy?",
        solution: "Profile photo         -> object storage (key stored in the database)\nUser's email          -> database\nProduct descriptions  -> database (truth) + search index (copy for search)\nNightly backup        -> object storage, cold storage class\nOrder rows            -> database",
      },
      {
        level: "medium",
        task: "Design a presigned upload flow for profile photos up to 5 MB, JPEG or PNG only. Say what the API checks, what the URL allows and what the database stores.",
        hint: "Validate before issuing the URL, and verify after the upload.",
        solution: "1. POST /uploads { contentType, size } - API checks the user is logged in,\n   type is image/jpeg or image/png, size <= 5 MB.\n2. API creates key avatars/{userId}/{uuid} and a presigned PUT URL\n   valid 10 minutes, bound to that key and content type.\n3. Client PUTs the file straight to storage.\n4. Storage event triggers a worker that checks the real file type,\n   makes thumbnails and marks the upload valid.\n5. Database stores key, size, type and status - never the bytes.",
      },
      {
        level: "hard",
        task: "Keep a product search index in sync with PostgreSQL for 10 million products and about 200 updates per second. Changes must be searchable within 5 seconds, and an indexer crash must not lose or reorder updates.",
        hint: "Capture changes from the database itself and make the indexer safe to replay.",
        solution: "1. CDC (e.g. Debezium) reads the Postgres WAL and publishes changes\n   to Kafka, keyed by product ID so each product stays in order.\n2. Indexer batches events (e.g. every 500 ms) into bulk upserts.\n3. Use the row version as an external version in Elasticsearch, so\n   an older update can never overwrite a newer one.\n4. Commit Kafka offsets only after the bulk request succeeds;\n   replays are harmless because upserts are idempotent.\n5. Alert on consumer lag > 5 s. Keep a full-rebuild job that\n   reloads from a database snapshot into a new index + alias swap.",
      },
    ],
    faq: [
      { q: "Can I store images inside my database?", a: "You can, but it bloats backups, slows replication and costs more than object storage. Store the image in S3 or similar and keep its key in the database." },
      { q: "Is Elasticsearch a database?", a: "It stores data, but treat it as a search copy rather than the source of truth. It lacks the transactions and strong guarantees that a primary database provides." },
      { q: "Is object storage the same as a file server?", a: "No. Object storage is accessed over HTTP by key, cannot edit part of a file in place, and scales almost without limit. A file server offers folders and in-place edits but is much harder to scale." },
    ],
  },
};

export default extra;
