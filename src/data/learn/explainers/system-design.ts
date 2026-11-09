import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────────────────── Fundamentals ─────────────────────────
  "sd-fundamentals/framework": {
    summary:
      "A system design interview rewards structure more than clever tricks. Move through requirements, estimates, API, high-level design and deep dives, time-boxing each phase so you finish with a complete, defensible design.",
    analogy: "Like an architect: first ask who lives there, then sketch rooms, then detail the plumbing.",
    visuals: [
      {
        type: "flow",
        title: "The 45-minute interview flow",
        steps: [
          { label: "Requirements", detail: "Functional and non-functional needs, about 5 minutes" },
          { label: "Estimates", detail: "QPS, storage and bandwidth, a few minutes" },
          { label: "API", detail: "Key endpoints with inputs and outputs" },
          { label: "High-level design", detail: "Boxes and arrows for the main request path" },
          { label: "Deep dive", detail: "Bottlenecks, scaling and failure handling" },
          { label: "Wrap up", detail: "Summarise trade-offs and future improvements" },
        ],
      },
      {
        type: "compare",
        title: "Functional vs non-functional requirements",
        columns: [
          {
            title: "Functional",
            points: ["What the system does", "Users can post a photo", "Users can follow others", "Defines the API"],
          },
          {
            title: "Non-functional",
            points: ["How well it does it", "p99 latency under 200 ms", "99.99% availability", "Drives the architecture"],
          },
        ],
      },
    ],
    keyPoints: [
      "Spend the first minutes clarifying scope; never start drawing before you know the requirements.",
      "Non-functional requirements like latency, scale and consistency decide most architecture choices.",
      "Draw a simple working design first, then improve its bottlenecks.",
      "Always state trade-offs explicitly; there is rarely one correct answer.",
    ],
    terms: [
      { term: "Functional requirement", meaning: "A feature the system must provide to users." },
      { term: "Non-functional requirement", meaning: "A quality target such as latency, availability or durability." },
      { term: "High-level design", meaning: "The main components and how a request flows between them." },
      { term: "Deep dive", meaning: "Detailed discussion of one component, bottleneck or failure mode." },
      { term: "Time box", meaning: "A fixed time budget for one phase of the interview." },
    ],
    example: {
      lang: "text",
      code: "Prompt: Design Instagram\n\nFunctional: upload photo, follow user, view feed\nNon-functional: 500M DAU, feed p99 < 200 ms,\n  high availability, eventual consistency OK\n\nAPI:\n  POST /photos           -> photoId\n  POST /users/{id}/follow\n  GET  /feed?cursor=...  -> photos[], nextCursor\n\nHigh-level: client -> LB -> API -> cache -> DB\n            photos -> object storage + CDN",
      caption: "A requirements and API sketch before drawing boxes.",
    },
    pitfalls: [
      "Jumping into databases and caches before agreeing on requirements.",
      "Spending 30 minutes on one component and never finishing the design.",
      "Naming technologies without explaining why they fit.",
    ],
    check: [
      {
        q: "Why clarify non-functional requirements early?",
        a: "Scale, latency and consistency targets determine choices like caching, sharding and replication, so they shape the whole design.",
      },
      {
        q: "What should you do if you run short on time?",
        a: "Make sure a complete end-to-end design exists, then summarise the deep-dive areas and trade-offs you would explore next.",
      },
    ],
  },

  "sd-fundamentals/estimation": {
    summary:
      "Back-of-envelope estimation turns user numbers into QPS, storage and bandwidth so you can size the system. Rough, rounded numbers are fine; the goal is the right order of magnitude.",
    analogy: "Like estimating groceries for a party: guests times portions, rounded up.",
    visuals: [
      {
        type: "flow",
        title: "From users to capacity",
        steps: [
          { label: "Daily active users", detail: "Start from a stated or assumed DAU" },
          { label: "Actions per user", detail: "Reads and writes per user per day" },
          { label: "Average QPS", detail: "Daily requests divided by about 100,000 seconds" },
          { label: "Peak QPS", detail: "Multiply average by 2 to 3" },
          { label: "Storage and bandwidth", detail: "Requests times object size, over retention period" },
        ],
      },
      {
        type: "tree",
        title: "Numbers worth memorising",
        root: "Estimation cheat sheet",
        children: [
          { label: "Powers of two", children: ["2^10 ≈ 1 thousand (KB)", "2^20 ≈ 1 million (MB)", "2^30 ≈ 1 billion (GB)", "2^40 ≈ 1 trillion (TB)"] },
          { label: "Latency", children: ["Memory read: ~100 ns", "SSD random read: ~100 µs", "Same-datacenter round trip: ~0.5 ms", "Cross-continent round trip: ~150 ms"] },
          { label: "Time", children: ["1 day ≈ 86,400 s ≈ 10^5 s", "1 month ≈ 2.5 million s", "1 year ≈ 3 x 10^7 s"] },
        ],
      },
    ],
    keyPoints: [
      "Round aggressively; a day is about 100,000 seconds.",
      "Peak traffic is often two to three times the average.",
      "Separate read and write QPS because they scale differently.",
      "Storage equals writes per day times object size times retention.",
      "State assumptions out loud so the interviewer can correct them.",
    ],
    terms: [
      { term: "QPS", meaning: "Queries per second handled by a service." },
      { term: "DAU", meaning: "Daily active users." },
      { term: "Read/write ratio", meaning: "How many reads happen for each write." },
      { term: "Peak factor", meaning: "Multiplier from average load to busiest-hour load." },
      { term: "Retention", meaning: "How long data must be stored." },
    ],
    example: {
      lang: "text",
      code: "100M DAU, each user posts 2 tweets/day, reads 100\n\nWrite QPS = 100M * 2 / 10^5      = 2,000/s\nRead QPS  = 100M * 100 / 10^5    = 100,000/s\nPeak read = 100,000 * 3          = 300,000/s\n\nTweet size ~ 300 bytes text\nDaily     = 200M * 300 B         = 60 GB/day\n5 years   = 60 GB * 365 * 5      ≈ 110 TB",
      caption: "A Twitter-style estimate in under five minutes.",
    },
    pitfalls: [
      "Doing precise arithmetic and wasting minutes on exact numbers.",
      "Forgetting media files, which usually dominate storage.",
      "Ignoring replication, which multiplies raw storage by about three.",
    ],
    check: [
      {
        q: "10M daily users each make 10 requests. What is the average QPS?",
        a: "100M requests divided by about 10^5 seconds gives roughly 1,000 QPS.",
      },
      {
        q: "Why estimate at all in an interview?",
        a: "Numbers show whether one database is enough or you need caching, sharding or a CDN, which justifies the design.",
      },
    ],
  },

  "sd-fundamentals/perf-concepts": {
    summary:
      "Latency is how long one request takes, throughput is how many requests you handle per second, and availability is the fraction of time the system works. SLAs, SLOs and SLIs turn these into measurable promises.",
    analogy: "A highway: latency is trip time, throughput is cars per hour, availability is how often it is open.",
    visuals: [
      {
        type: "compare",
        title: "Nines of availability",
        columns: [
          { title: "99.9% (three nines)", points: ["About 8.8 hours down per year", "About 43 minutes per month", "Typical for internal tools"] },
          { title: "99.99% (four nines)", points: ["About 53 minutes down per year", "About 4.3 minutes per month", "Needs redundancy and automated failover"] },
          { title: "99.999% (five nines)", points: ["About 5 minutes down per year", "About 26 seconds per month", "Very costly, multi-region required"] },
        ],
      },
      {
        type: "layers",
        title: "SLI, SLO and SLA",
        layers: [
          { label: "SLA", detail: "Contract with customers, with penalties if missed" },
          { label: "SLO", detail: "Internal target, stricter than the SLA" },
          { label: "SLI", detail: "The measured metric, such as success rate" },
        ],
      },
    ],
    keyPoints: [
      "Report latency as percentiles; averages hide slow outliers.",
      "p99 means 99% of requests are faster than this value.",
      "Each extra nine cuts allowed downtime by a factor of ten.",
      "Components in series multiply availability, so more dependencies lower overall uptime.",
      "Set SLOs stricter than SLAs to leave a safety margin.",
    ],
    terms: [
      { term: "Latency", meaning: "Time taken to serve a single request." },
      { term: "Throughput", meaning: "Requests or bytes processed per unit time." },
      { term: "p99 latency", meaning: "The latency that 99% of requests beat." },
      { term: "SLI", meaning: "Service level indicator: the metric actually measured." },
      { term: "SLO", meaning: "Service level objective: target value for an SLI." },
      { term: "SLA", meaning: "Service level agreement: external promise with consequences." },
    ],
    example: {
      lang: "text",
      code: "Two services in series, each 99.9% available:\n  0.999 * 0.999 = 0.998  -> 99.8%\n\nTwo redundant replicas, each 99%:\n  1 - (0.01 * 0.01) = 0.9999 -> 99.99%\n\nAllowed downtime at 99.95% per 30 days:\n  0.0005 * 30 * 24 * 60 = 21.6 minutes",
      caption: "Series lowers availability; redundancy raises it.",
    },
    pitfalls: [
      "Quoting average latency when users feel the tail.",
      "Promising an SLA equal to your SLO with no buffer.",
      "Forgetting that a page calling many services sees the worst tail.",
    ],
    check: [
      {
        q: "Why does p99 matter more than the average?",
        a: "Averages hide slow requests; a page that makes many calls almost always hits at least one tail-latency request.",
      },
      {
        q: "How much downtime does 99.99% allow per year?",
        a: "About 53 minutes per year, or roughly 4.3 minutes per month.",
      },
    ],
  },

  "sd-fundamentals/networking": {
    summary:
      "Clients and services talk over protocols like HTTP, and API styles like REST, gRPC and GraphQL shape those conversations. Choose based on who the client is, how chatty the traffic is and whether the server must push updates.",
    visuals: [
      {
        type: "compare",
        title: "REST vs gRPC vs GraphQL",
        columns: [
          { title: "REST", points: ["Resources over HTTP verbs", "JSON, human readable", "Easy caching with HTTP", "Best for public APIs"] },
          { title: "gRPC", points: ["Protobuf over HTTP/2", "Compact and fast", "Typed contracts, streaming", "Best for service-to-service"] },
          { title: "GraphQL", points: ["Client picks fields", "One endpoint, typed schema", "Avoids over-fetching", "Best for varied frontends"] },
        ],
      },
      {
        type: "compare",
        title: "Server push options",
        columns: [
          { title: "Polling", points: ["Client asks every few seconds", "Simple but wasteful", "Delayed updates"] },
          { title: "SSE", points: ["Server streams events one way", "Plain HTTP, auto reconnect", "Good for feeds and dashboards"] },
          { title: "WebSockets", points: ["Full duplex persistent connection", "Low latency both directions", "Good for chat and games"] },
        ],
      },
    ],
    keyPoints: [
      "REST suits public, cacheable, resource-oriented APIs.",
      "gRPC suits internal low-latency calls with strict typed contracts.",
      "Use WebSockets when both sides send frequently; SSE when only the server pushes.",
      "Paginate list endpoints with cursors rather than large offsets.",
      "Make writes idempotent where clients may retry.",
    ],
    terms: [
      { term: "HTTP/2", meaning: "HTTP version with multiplexed streams over one connection." },
      { term: "Protobuf", meaning: "Compact binary serialisation format used by gRPC." },
      { term: "WebSocket", meaning: "Persistent two-way connection upgraded from HTTP." },
      { term: "SSE", meaning: "Server-Sent Events: one-way server-to-client stream over HTTP." },
      { term: "Cursor pagination", meaning: "Paging by an opaque pointer to the last item seen." },
    ],
    example: {
      lang: "http",
      code: "GET /v1/users/42/posts?limit=20&cursor=eyJpZCI6OTl9\n\n200 OK\n{\n  \"items\": [ { \"id\": 98, \"text\": \"hi\" } ],\n  \"nextCursor\": \"eyJpZCI6Nzh9\"\n}\n\nPOST /v1/payments\nIdempotency-Key: 7f3c-91ab\n{ \"amount\": 500, \"currency\": \"USD\" }",
      caption: "Cursor pagination and an idempotent write.",
    },
    pitfalls: [
      "Using offset pagination on huge tables, which gets slower per page.",
      "Choosing WebSockets for rare updates where polling or SSE suffices.",
      "Exposing gRPC directly to browsers without a gateway or gRPC-Web.",
    ],
    check: [
      {
        q: "When would you pick gRPC over REST?",
        a: "For internal service-to-service calls needing low latency, typed contracts and streaming.",
      },
      {
        q: "Why is cursor pagination better than offset for large lists?",
        a: "The database seeks straight to the cursor instead of scanning and skipping rows, and results stay stable as items are inserted.",
      },
    ],
  },

  "sd-fundamentals/scaling": {
    summary:
      "Vertical scaling buys a bigger machine; horizontal scaling adds more machines behind a load balancer. Horizontal scaling only works when servers are stateless, so session and user state must live in shared stores.",
    analogy: "Vertical is hiring a faster cashier; horizontal is opening more checkout lanes.",
    visuals: [
      {
        type: "compare",
        title: "Vertical vs horizontal scaling",
        columns: [
          { title: "Vertical (scale up)", points: ["Bigger CPU, RAM, disk", "No code changes", "Hard hardware ceiling", "Single point of failure"] },
          { title: "Horizontal (scale out)", points: ["Add more servers", "Near-linear capacity growth", "Needs stateless services", "Survives individual server failures"] },
        ],
      },
      {
        type: "layers",
        title: "A stateless service tier",
        layers: [
          { label: "Load balancer", detail: "Sends any request to any healthy server" },
          { label: "Stateless app servers", detail: "Identical, disposable, auto-scaled by load" },
          { label: "Shared session store", detail: "Redis holds sessions and short-lived state" },
          { label: "Database and object storage", detail: "Durable source of truth for data" },
        ],
      },
    ],
    keyPoints: [
      "Start vertical for simplicity, go horizontal when you hit limits or need redundancy.",
      "A stateless server can be killed or added at any time without losing data.",
      "Move sessions to Redis or signed tokens instead of server memory.",
      "Sticky sessions are a workaround that hurts balancing and failover.",
    ],
    terms: [
      { term: "Vertical scaling", meaning: "Increasing resources of a single machine." },
      { term: "Horizontal scaling", meaning: "Adding more machines to share the load." },
      { term: "Stateless service", meaning: "Server keeps no client data between requests." },
      { term: "Sticky session", meaning: "Load balancer pins a client to one server." },
      { term: "Auto scaling", meaning: "Automatically adding or removing servers based on load." },
    ],
    pitfalls: [
      "Storing uploaded files on local server disks.",
      "Keeping in-memory sessions, so users log out when a server dies.",
      "Forgetting the database also needs a scaling plan.",
    ],
    check: [
      {
        q: "Why must servers be stateless to scale horizontally?",
        a: "Any server must be able to handle any request, and servers must be replaceable without losing user data.",
      },
      {
        q: "Where do sessions go in a stateless design?",
        a: "In a shared store like Redis or inside a signed token such as a JWT that the client sends each request.",
      },
    ],
  },

  // ───────────────────────── Building blocks ─────────────────────────
  "building-blocks/load-balancing": {
    summary:
      "A load balancer spreads traffic across healthy servers so no single machine is overwhelmed. Layer 4 balancers route by IP and port; Layer 7 balancers read HTTP and can route by path, header or cookie.",
    analogy: "A restaurant host seating guests at whichever table has a free waiter.",
    visuals: [
      {
        type: "flow",
        title: "Request through a load balancer",
        steps: [
          { label: "Client", detail: "Resolves DNS to the load balancer address" },
          { label: "Load balancer", detail: "Terminates TLS, picks a healthy backend" },
          { label: "Health checks", detail: "Unhealthy servers removed from rotation" },
          { label: "App server", detail: "Handles the request and responds" },
        ],
      },
      {
        type: "compare",
        title: "L4 vs L7 load balancing",
        columns: [
          { title: "Layer 4 (transport)", points: ["Routes by IP and port", "Does not read HTTP", "Very fast, low overhead", "Good for raw TCP or UDP"] },
          { title: "Layer 7 (application)", points: ["Reads URLs, headers, cookies", "Path-based routing, TLS termination", "Can cache, compress, rewrite", "More CPU per request"] },
        ],
      },
    ],
    keyPoints: [
      "Round robin suits similar requests; least connections suits uneven request durations.",
      "Hash-based routing keeps a client or key on the same backend.",
      "Health checks remove failed servers automatically.",
      "Run load balancers in redundant pairs so they are not a single point of failure.",
      "A reverse proxy also adds TLS termination, caching and compression.",
    ],
    terms: [
      { term: "Round robin", meaning: "Send each new request to the next server in turn." },
      { term: "Least connections", meaning: "Send to the server with fewest active connections." },
      { term: "Health check", meaning: "Periodic probe deciding if a backend can receive traffic." },
      { term: "Reverse proxy", meaning: "Server-side proxy that forwards client requests to backends." },
      { term: "TLS termination", meaning: "Decrypting HTTPS at the proxy instead of each server." },
    ],
    pitfalls: [
      "Using round robin when some requests take seconds and others milliseconds.",
      "Health checks that only test the port, not real dependencies.",
      "A single load balancer instance becoming the new single point of failure.",
    ],
    check: [
      {
        q: "When do you need an L7 load balancer?",
        a: "When routing depends on HTTP details like paths, headers or cookies, or you want TLS termination and caching at the edge.",
      },
      {
        q: "Why might least connections beat round robin?",
        a: "If request costs vary a lot, round robin can pile slow requests on one server, while least connections balances actual load.",
      },
    ],
  },

  "building-blocks/caching": {
    summary:
      "A cache stores hot data in fast memory so repeated reads skip the slower database. The hard parts are choosing a write strategy, keeping data fresh with TTLs and invalidation, and preventing stampedes when hot keys expire.",
    analogy: "Keeping your most-used tools on the desk instead of walking to the shed.",
    visuals: [
      {
        type: "cycle",
        title: "Cache-aside read and write",
        steps: [
          { label: "Read from cache", detail: "App checks Redis for the key first" },
          { label: "Miss: query database", detail: "Fetch the value from the source of truth" },
          { label: "Populate cache", detail: "Store the value with a TTL" },
          { label: "Write to database", detail: "Updates go to the database first" },
          { label: "Invalidate key", detail: "Delete cached entry so next read refreshes" },
        ],
      },
      {
        type: "compare",
        title: "Cache write strategies",
        columns: [
          { title: "Cache-aside", points: ["App manages cache explicitly", "Only requested data cached", "First read is a miss", "Most common default"] },
          { title: "Write-through", points: ["Write cache and DB together", "Cache always fresh", "Slower writes", "Caches data never read"] },
          { title: "Write-back", points: ["Write cache, flush DB later", "Very fast writes", "Data loss risk on crash", "Good for counters, metrics"] },
        ],
      },
    ],
    keyPoints: [
      "Cache data that is read often and changes rarely.",
      "TTLs bound staleness even when invalidation fails.",
      "Prevent stampedes with request coalescing, locks or jittered TTLs.",
      "CDNs cache static assets at the edge, close to users.",
      "Eviction policies like LRU decide what to drop when memory fills.",
    ],
    terms: [
      { term: "Cache hit ratio", meaning: "Fraction of reads served from the cache." },
      { term: "TTL", meaning: "Time to live: how long an entry stays valid." },
      { term: "LRU", meaning: "Least recently used eviction policy." },
      { term: "Cache stampede", meaning: "Many requests hit the database at once when a hot key expires." },
      { term: "CDN", meaning: "Content delivery network of edge caches near users." },
    ],
    example: {
      lang: "python",
      code: "def get_user(user_id):\n    key = f\"user:{user_id}\"\n    cached = redis.get(key)\n    if cached:\n        return json.loads(cached)\n    user = db.query(\"SELECT * FROM users WHERE id=%s\", user_id)\n    ttl = 3600 + random.randint(0, 300)  # jitter avoids stampedes\n    redis.set(key, json.dumps(user), ex=ttl)\n    return user\n\ndef update_user(user_id, fields):\n    db.update(\"users\", user_id, fields)\n    redis.delete(f\"user:{user_id}\")  # invalidate after write",
      caption: "Cache-aside with jittered TTL and delete-on-write.",
    },
    pitfalls: [
      "Updating the cache before the database, leaving stale data on failure.",
      "Giving every key the same TTL so they all expire together.",
      "Caching personalised responses at a shared CDN by mistake.",
    ],
    check: [
      {
        q: "Why delete the cache key on write instead of updating it?",
        a: "Deleting avoids races where two concurrent writers leave an older value in the cache; the next read reloads fresh data.",
      },
      {
        q: "How do you prevent a cache stampede?",
        a: "Let only one request rebuild a missing key using a lock or request coalescing, and add jitter to TTLs.",
      },
    ],
  },

  "building-blocks/queues": {
    summary:
      "Message queues decouple producers from consumers so work can be buffered, retried and processed asynchronously. A queue hands each message to one worker, while a log like Kafka keeps an ordered, replayable stream many groups can read.",
    analogy: "A restaurant ticket rail: waiters pin orders, cooks take them when ready.",
    visuals: [
      {
        type: "flow",
        title: "Asynchronous processing with a queue",
        steps: [
          { label: "Producer", detail: "API publishes a job and returns quickly" },
          { label: "Queue or topic", detail: "Durably buffers messages" },
          { label: "Consumer workers", detail: "Pull messages and process them" },
          { label: "Ack or retry", detail: "Acknowledged on success, redelivered on failure" },
          { label: "Dead-letter queue", detail: "Messages that keep failing are parked" },
        ],
      },
      {
        type: "compare",
        title: "Queue vs log (Kafka)",
        columns: [
          { title: "Queue (SQS, RabbitMQ)", points: ["Message deleted after ack", "Each message to one consumer", "Easy per-message retries", "Good for task distribution"] },
          { title: "Log (Kafka)", points: ["Messages retained for days", "Ordered within a partition", "Many consumer groups replay", "Good for event streams"] },
        ],
      },
    ],
    keyPoints: [
      "Queues absorb traffic spikes and let producers and consumers scale independently.",
      "Kafka orders messages per partition, not across the whole topic.",
      "Each partition is read by one consumer within a consumer group.",
      "At-least-once delivery is the norm, so consumers must be idempotent.",
      "Exactly-once usually means at-least-once delivery plus idempotent processing.",
    ],
    terms: [
      { term: "Pub/sub", meaning: "Each message is delivered to every subscriber." },
      { term: "Partition", meaning: "Ordered shard of a Kafka topic." },
      { term: "Consumer group", meaning: "Set of consumers sharing a topic's partitions." },
      { term: "Offset", meaning: "Position of a message within a partition." },
      { term: "At-least-once", meaning: "Messages are never lost but may be delivered twice." },
      { term: "Dead-letter queue", meaning: "Holding queue for messages that repeatedly fail." },
    ],
    pitfalls: [
      "Assuming global ordering in Kafka across partitions.",
      "Non-idempotent consumers that double-charge on redelivery.",
      "Having more consumers in a group than partitions, leaving some idle.",
    ],
    check: [
      {
        q: "When would you choose Kafka over a simple queue?",
        a: "When several independent consumers need the same events, you need replay, or ordering per key matters at high throughput.",
      },
      {
        q: "Why must consumers be idempotent?",
        a: "With at-least-once delivery a message can arrive twice, so processing it again must not change the result.",
      },
    ],
  },

  "building-blocks/gateway-ratelimit": {
    summary:
      "An API gateway is the single front door that handles auth, routing, rate limiting and logging for many services. Rate limiting protects services from abuse and overload using algorithms like token bucket or sliding window.",
    analogy: "A token bucket is a ticket dispenser that refills at a steady rate.",
    visuals: [
      {
        type: "layers",
        title: "API gateway responsibilities",
        layers: [
          { label: "TLS and authentication", detail: "Verify tokens or API keys once at the edge" },
          { label: "Rate limiting", detail: "Reject excess requests with HTTP 429" },
          { label: "Routing", detail: "Map paths to backend services" },
          { label: "Transformation", detail: "Aggregate responses, translate protocols" },
          { label: "Observability", detail: "Request logs, metrics and trace IDs" },
        ],
      },
      {
        type: "compare",
        title: "Rate limiting algorithms",
        columns: [
          { title: "Token bucket", points: ["Tokens refill at fixed rate", "Each request spends one token", "Allows short bursts", "Used by AWS and Stripe"] },
          { title: "Fixed window", points: ["Counter per minute window", "Very simple", "Bursts at window edges", "Can allow 2x limit"] },
          { title: "Sliding window", points: ["Counts last N seconds", "Smooth and accurate", "Log or weighted counter", "More memory or math"] },
        ],
      },
    ],
    keyPoints: [
      "Enforce limits at the gateway so bad traffic never reaches services.",
      "Limit per user, API key or IP depending on the threat.",
      "Return 429 with a Retry-After header so clients back off.",
      "Distributed limits need a shared counter store like Redis.",
    ],
    terms: [
      { term: "API gateway", meaning: "Single entry point that routes and secures API traffic." },
      { term: "Token bucket", meaning: "Algorithm allowing bursts up to bucket size, refilled steadily." },
      { term: "Sliding window", meaning: "Counts requests over a rolling time window." },
      { term: "HTTP 429", meaning: "Too Many Requests status code." },
      { term: "Retry-After", meaning: "Header telling clients when to try again." },
    ],
    example: {
      lang: "python",
      code: "def allow(bucket, now, rate=10, capacity=20):\n    # refill tokens based on elapsed time\n    elapsed = now - bucket.last\n    bucket.tokens = min(capacity, bucket.tokens + elapsed * rate)\n    bucket.last = now\n    if bucket.tokens >= 1:\n        bucket.tokens -= 1\n        return True   # allow\n    return False      # reject with 429",
      caption: "Token bucket: 10 requests/second, bursts up to 20.",
    },
    pitfalls: [
      "Using per-server counters, so the real limit becomes limit times servers.",
      "Rate limiting only by IP, punishing users behind shared NAT.",
      "Making the gateway hold business logic and become a bottleneck.",
    ],
    check: [
      {
        q: "Why does a fixed window allow bursts?",
        a: "A client can send the full limit at the end of one window and again at the start of the next, doubling the rate briefly.",
      },
      {
        q: "Why put rate limiting in the gateway?",
        a: "It rejects excess traffic before it consumes backend resources and keeps the policy in one consistent place.",
      },
    ],
  },

  "building-blocks/blob-search": {
    summary:
      "Databases are poor at storing large files and at full-text search. Object storage like S3 holds blobs cheaply and durably, while search engines like Elasticsearch use inverted indexes to find documents by words fast.",
    visuals: [
      {
        type: "flow",
        title: "Keeping a search index in sync",
        steps: [
          { label: "Write to database", detail: "Database stays the source of truth" },
          { label: "Change event", detail: "CDC or outbox emits the change" },
          { label: "Queue or stream", detail: "Kafka buffers change events" },
          { label: "Indexer", detail: "Transforms rows into search documents" },
          { label: "Search index", detail: "Elasticsearch serves text queries" },
        ],
      },
      {
        type: "compare",
        title: "Where should the data live?",
        columns: [
          { title: "Database", points: ["Structured records", "Transactions and joins", "Exact lookups by key", "Small values"] },
          { title: "Object storage", points: ["Images, video, backups", "Cheap, highly durable", "Access by key over HTTP", "Pair with a CDN"] },
          { title: "Search index", points: ["Full-text and fuzzy search", "Relevance ranking", "Faceted filters", "Derived, rebuildable copy"] },
        ],
      },
    ],
    keyPoints: [
      "Store blobs in object storage and only their URLs or keys in the database.",
      "Let clients upload directly to object storage with pre-signed URLs.",
      "An inverted index maps each word to the documents containing it.",
      "Search indexes are eventually consistent copies, never the source of truth.",
    ],
    terms: [
      { term: "Object storage", meaning: "Flat key-to-blob store such as S3 or GCS." },
      { term: "Pre-signed URL", meaning: "Time-limited URL granting direct upload or download." },
      { term: "Inverted index", meaning: "Map from term to list of documents containing it." },
      { term: "CDC", meaning: "Change data capture: streaming database changes as events." },
      { term: "Tokenisation", meaning: "Splitting text into searchable terms." },
    ],
    pitfalls: [
      "Storing images as BLOBs inside the relational database.",
      "Dual-writing to DB and search index from the app without retries.",
      "Treating the search engine as the primary data store.",
    ],
    check: [
      {
        q: "Why not use SQL LIKE for search at scale?",
        a: "LIKE with a leading wildcard scans every row and has no relevance ranking, while an inverted index finds matches directly.",
      },
      {
        q: "How do users upload large files without overloading app servers?",
        a: "The app issues a pre-signed URL and the client uploads straight to object storage.",
      },
    ],
  },

  // ───────────────────────── Data storage ─────────────────────────
  "data/sql-nosql": {
    summary:
      "Relational databases offer schemas, joins and transactions; NoSQL families trade some of that for scale or flexibility. Pick the data model that matches your access patterns, not the trendiest technology.",
    visuals: [
      {
        type: "tree",
        title: "Database families",
        root: "Databases",
        children: [
          { label: "Relational", children: ["PostgreSQL, MySQL", "Joins and ACID transactions"] },
          { label: "Key-value", children: ["Redis, DynamoDB", "Fast lookups by key"] },
          { label: "Document", children: ["MongoDB", "Flexible JSON documents"] },
          { label: "Wide-column", children: ["Cassandra, Bigtable", "Massive writes, partition keys"] },
          { label: "Graph", children: ["Neo4j", "Relationship traversals"] },
        ],
      },
      {
        type: "compare",
        title: "SQL vs NoSQL",
        columns: [
          { title: "SQL", points: ["Fixed schema, normalised", "Joins and ACID transactions", "Flexible ad-hoc queries", "Scales up, sharding is manual"] },
          { title: "NoSQL", points: ["Schema-flexible or denormalised", "Designed around known queries", "Scales out horizontally", "Weaker or tunable consistency"] },
        ],
      },
    ],
    keyPoints: [
      "Default to a relational database unless a clear need says otherwise.",
      "Key-value stores excel at simple lookups like sessions and carts.",
      "Wide-column stores suit huge write volumes like messages or time series.",
      "Graph databases fit queries about multi-hop relationships.",
      "In NoSQL you model tables around queries, often duplicating data.",
    ],
    terms: [
      { term: "ACID", meaning: "Atomicity, consistency, isolation, durability guarantees for transactions." },
      { term: "Normalisation", meaning: "Storing each fact once and linking with keys." },
      { term: "Denormalisation", meaning: "Duplicating data to make reads faster." },
      { term: "Partition key", meaning: "Field deciding which node stores a row." },
      { term: "Access pattern", meaning: "The specific queries an application runs." },
    ],
    pitfalls: [
      "Choosing NoSQL for scale the product will never reach.",
      "Modelling Cassandra tables like relational tables and then needing joins.",
      "Forgetting transactions when money or inventory is involved.",
    ],
    check: [
      {
        q: "Which database family suits storing billions of chat messages?",
        a: "A wide-column store like Cassandra, partitioned by conversation and sorted by time, handles huge write volume well.",
      },
      {
        q: "When is a relational database clearly better?",
        a: "When you need multi-row transactions, joins and flexible queries, such as orders and payments.",
      },
    ],
  },

  "data/replication": {
    summary:
      "Replication keeps copies of data on several nodes for availability, durability and read scaling. The models differ in who accepts writes: one leader, several leaders, or any replica.",
    visuals: [
      {
        type: "flow",
        title: "Leader-follower replication",
        steps: [
          { label: "Client write", detail: "All writes go to the leader" },
          { label: "Leader commits", detail: "Appends change to its replication log" },
          { label: "Log shipped", detail: "Followers receive changes sync or async" },
          { label: "Followers apply", detail: "Copies catch up after some lag" },
          { label: "Reads scale out", detail: "Read queries can hit followers" },
        ],
      },
      {
        type: "compare",
        title: "Replication models",
        columns: [
          { title: "Leader-follower", points: ["One node takes writes", "Simple, no write conflicts", "Failover needed if leader dies", "PostgreSQL, MySQL"] },
          { title: "Multi-leader", points: ["Leader per region", "Local writes, low latency", "Write conflicts to resolve", "Multi-region apps"] },
          { title: "Leaderless", points: ["Any replica takes writes", "Quorum reads and writes", "High availability", "Cassandra, Dynamo"] },
        ],
      },
    ],
    keyPoints: [
      "Asynchronous replication is fast but can lose recent writes on failover.",
      "Replication lag means followers may serve stale reads.",
      "Read-your-writes can be ensured by reading from the leader after a write.",
      "Multi-leader and leaderless systems need conflict resolution.",
    ],
    terms: [
      { term: "Leader", meaning: "Node that accepts writes and streams changes." },
      { term: "Follower", meaning: "Replica that copies changes from the leader." },
      { term: "Replication lag", meaning: "Delay before a follower reflects a write." },
      { term: "Failover", meaning: "Promoting a follower when the leader fails." },
      { term: "Last-write-wins", meaning: "Conflict rule keeping the write with latest timestamp." },
    ],
    pitfalls: [
      "Reading from a lagging follower right after a write, confusing users.",
      "Split brain: two nodes both believing they are leader.",
      "Relying on last-write-wins and silently losing concurrent updates.",
    ],
    check: [
      {
        q: "What is a downside of asynchronous replication?",
        a: "If the leader fails before followers receive recent writes, those writes are lost after failover.",
      },
      {
        q: "How do you give users read-your-writes consistency?",
        a: "Route a user's reads to the leader for a short time after they write, or wait until a follower reaches their write's position.",
      },
    ],
  },

  "data/partitioning": {
    summary:
      "Partitioning, or sharding, splits data across nodes so each holds only part of it. A good shard key spreads load evenly, and consistent hashing lets you add nodes while moving only a small slice of data.",
    analogy: "Splitting a phone book into volumes so several people can search at once.",
    visuals: [
      {
        type: "compare",
        title: "Range vs hash partitioning",
        columns: [
          { title: "Range", points: ["Keys split into ordered ranges", "Efficient range scans", "Risk of hot spots", "Example: by date or name"] },
          { title: "Hash", points: ["hash(key) picks the shard", "Even distribution", "Range queries hit all shards", "Example: by user ID"] },
        ],
      },
      {
        type: "sequence",
        title: "Consistent hashing lookup",
        actors: ["Client", "Router", "Hash ring", "Node B"],
        messages: [
          { from: 0, to: 1, label: "GET key user:42" },
          { from: 1, to: 2, label: "hash(user:42) gives ring position" },
          { from: 2, to: 1, label: "Next node clockwise is Node B" },
          { from: 1, to: 3, label: "Forward read to Node B" },
          { from: 3, to: 0, label: "Return value" },
        ],
      },
    ],
    keyPoints: [
      "Choose a shard key with high cardinality that matches your main query.",
      "Plain hash mod N reshuffles almost all keys when N changes.",
      "Consistent hashing moves only about 1/N of keys when a node joins.",
      "Virtual nodes smooth out uneven load across physical servers.",
      "Hot keys may need splitting or extra caching.",
    ],
    terms: [
      { term: "Shard", meaning: "One partition of the data held by a node." },
      { term: "Shard key", meaning: "Field used to decide a row's shard." },
      { term: "Hot spot", meaning: "A shard receiving far more traffic than others." },
      { term: "Hash ring", meaning: "Circular hash space where nodes and keys are placed." },
      { term: "Virtual node", meaning: "Many ring positions per physical server for balance." },
    ],
    example: {
      lang: "text",
      code: "Naive: shard = hash(key) % N\n  N goes 4 -> 5: about 80% of keys move\n\nConsistent hashing:\n  nodes placed at hash(nodeId) on ring [0, 2^32)\n  key goes to first node clockwise from hash(key)\n  add node E: only keys between D and E move\n  -> about 1/5 of keys move",
      caption: "Why consistent hashing makes rebalancing cheap.",
    },
    pitfalls: [
      "Sharding by timestamp so all new writes land on one shard.",
      "Picking a low-cardinality key like country.",
      "Needing cross-shard joins for the most common query.",
    ],
    check: [
      {
        q: "Why is hash mod N bad for rebalancing?",
        a: "Changing N changes the result for most keys, forcing nearly all data to move.",
      },
      {
        q: "How do you handle a celebrity hot key?",
        a: "Cache it aggressively, replicate it, or split it into sub-keys with a random suffix and merge on read.",
      },
    ],
  },

  "data/consistency": {
    summary:
      "CAP says that during a network partition a distributed system must choose consistency or availability. PACELC adds that even without partitions you trade latency against consistency. Quorums let you tune where you sit.",
    visuals: [
      {
        type: "compare",
        title: "Strong vs eventual consistency",
        columns: [
          { title: "Strong", points: ["Reads see the latest write", "Coordination on every write", "Higher latency", "Banking, inventory, locks"] },
          { title: "Eventual", points: ["Replicas converge over time", "Reads may be stale", "Low latency, highly available", "Likes, feeds, view counts"] },
        ],
      },
      {
        type: "tree",
        title: "Consistency models",
        root: "Consistency models",
        children: [
          { label: "Linearizable", children: ["Strongest", "Acts like one copy"] },
          { label: "Sequential", children: ["One agreed order of operations"] },
          { label: "Causal", children: ["Cause seen before effect"] },
          { label: "Session guarantees", children: ["Read-your-writes", "Monotonic reads"] },
          { label: "Eventual", children: ["Weakest", "Converges if writes stop"] },
        ],
      },
    ],
    keyPoints: [
      "Partitions are unavoidable, so the real CAP choice is C or A during one.",
      "PACELC: else, when healthy, choose latency or consistency.",
      "With N replicas, W + R > N guarantees reads overlap the latest write.",
      "Pick consistency per feature, not for the whole system.",
    ],
    terms: [
      { term: "CAP theorem", meaning: "Under partition, choose consistency or availability." },
      { term: "PACELC", meaning: "If partition, A or C; else latency or consistency." },
      { term: "Quorum", meaning: "Minimum replicas that must respond to an operation." },
      { term: "Linearizability", meaning: "Every read returns the most recent completed write." },
      { term: "Eventual consistency", meaning: "Replicas agree eventually if updates stop." },
    ],
    example: {
      lang: "text",
      code: "N = 3 replicas\n\nW=2, R=2 -> W+R=4 > 3  strong-ish reads, tolerates 1 failure\nW=1, R=1 -> W+R=2 <= 3 fast, may read stale data\nW=3, R=1 -> fast reads, writes fail if any node is down\n\nRule: W + R > N means read and write sets overlap",
      caption: "Tuning quorums trades latency for consistency.",
    },
    pitfalls: [
      "Saying a system is CA; real networks partition.",
      "Applying strong consistency everywhere and paying latency for nothing.",
      "Assuming quorums alone give linearizability without careful conflict handling.",
    ],
    check: [
      {
        q: "With N=5, what W and R guarantee overlap?",
        a: "Any W and R with W + R greater than 5, for example W=3 and R=3.",
      },
      {
        q: "Which needs strong consistency: a like counter or a seat booking?",
        a: "Seat booking, because double-selling is unacceptable; a like counter can be eventually consistent.",
      },
    ],
  },

  "data/indexes-storage": {
    summary:
      "Storage engines decide how data sits on disk. B-trees update pages in place and favour reads; LSM trees buffer writes in memory and flush sorted files, favouring heavy write workloads.",
    visuals: [
      {
        type: "flow",
        title: "LSM tree write path",
        steps: [
          { label: "Write-ahead log", detail: "Append for durability" },
          { label: "Memtable", detail: "Sorted in-memory buffer" },
          { label: "Flush to SSTable", detail: "Immutable sorted file on disk" },
          { label: "Compaction", detail: "Merge files, drop overwritten and deleted keys" },
        ],
      },
      {
        type: "compare",
        title: "B-tree vs LSM tree",
        columns: [
          { title: "B-tree", points: ["Fixed-size pages updated in place", "Fast, predictable reads", "Random writes cost more", "PostgreSQL, MySQL InnoDB"] },
          { title: "LSM tree", points: ["Sequential appends and merges", "Very high write throughput", "Reads may check several files", "Cassandra, RocksDB"] },
        ],
      },
    ],
    keyPoints: [
      "Indexes speed reads but slow every write that must update them.",
      "B-trees keep keys sorted in a shallow tree of pages.",
      "LSM trees use Bloom filters to skip files that lack a key.",
      "Compaction reclaims space but costs background I/O.",
    ],
    terms: [
      { term: "B-tree", meaning: "Balanced tree of disk pages kept sorted for lookups." },
      { term: "LSM tree", meaning: "Log-structured merge tree: buffered writes merged into sorted files." },
      { term: "SSTable", meaning: "Sorted string table: immutable sorted key-value file." },
      { term: "Compaction", meaning: "Merging SSTables to remove obsolete entries." },
      { term: "Write amplification", meaning: "Bytes written to disk per byte written by the app." },
      { term: "Bloom filter", meaning: "Compact structure saying a key is definitely absent." },
    ],
    pitfalls: [
      "Adding indexes on every column and slowing writes.",
      "Ignoring compaction load spikes in LSM-based databases.",
      "Expecting an index to help a query that wraps the column in a function.",
    ],
    check: [
      {
        q: "Why are LSM trees good for write-heavy workloads?",
        a: "They turn random writes into sequential appends and batched flushes, which disks handle much faster.",
      },
      {
        q: "What is the cost of adding an index?",
        a: "Extra storage and slower inserts and updates, since every write must also update the index.",
      },
    ],
  },

  // ───────────────────────── Reliability ─────────────────────────
  "reliability/redundancy": {
    summary:
      "Redundancy removes single points of failure by running spare copies of every critical component. Failover moves traffic to a healthy copy, either a standby (active-passive) or peers that already serve traffic (active-active).",
    visuals: [
      {
        type: "layers",
        title: "Redundancy at every tier",
        layers: [
          { label: "DNS and global routing", detail: "Health-checked records steer users between regions" },
          { label: "Load balancers", detail: "Redundant pair across availability zones" },
          { label: "App servers", detail: "Multiple instances in several zones" },
          { label: "Cache cluster", detail: "Replicas with automatic promotion" },
          { label: "Database", detail: "Primary plus standby replica in another zone" },
        ],
      },
      {
        type: "compare",
        title: "Active-passive vs active-active",
        columns: [
          { title: "Active-passive", points: ["Standby idle until failover", "Simple data consistency", "Failover takes seconds to minutes", "Pays for idle capacity"] },
          { title: "Active-active", points: ["All regions serve traffic", "Instant failover, lower latency", "Write conflicts across regions", "More complex to operate"] },
        ],
      },
    ],
    keyPoints: [
      "Spread instances across availability zones to survive data-center failures.",
      "Every tier needs redundancy, including load balancers and databases.",
      "Test failover regularly; untested failover usually fails.",
      "RTO is how fast you recover; RPO is how much data you can lose.",
    ],
    terms: [
      { term: "Single point of failure", meaning: "Component whose failure takes the whole system down." },
      { term: "Availability zone", meaning: "Isolated data center within a cloud region." },
      { term: "Failover", meaning: "Switching traffic from a failed component to a healthy one." },
      { term: "RTO", meaning: "Recovery time objective: maximum acceptable downtime." },
      { term: "RPO", meaning: "Recovery point objective: maximum acceptable data loss window." },
    ],
    pitfalls: [
      "Redundant servers that all depend on one shared database or config service.",
      "Running at 90% capacity so survivors overload after failover.",
      "Never rehearsing a region failover.",
    ],
    check: [
      {
        q: "When is active-active worth the complexity?",
        a: "When you need near-zero downtime or low latency for users worldwide, and can handle cross-region write conflicts.",
      },
      {
        q: "What is the difference between RTO and RPO?",
        a: "RTO is how long recovery may take; RPO is how much recent data you can afford to lose.",
      },
    ],
  },

  "reliability/retries": {
    summary:
      "Networks fail, so clients need timeouts and retries. Retries are only safe when operations are idempotent, and they must back off with jitter so a struggling service is not flattened by a retry storm.",
    visuals: [
      {
        type: "cycle",
        title: "Retry with backoff and jitter",
        steps: [
          { label: "Send request", detail: "Include an idempotency key" },
          { label: "Timeout or 5xx", detail: "Treat as retryable failure" },
          { label: "Compute backoff", detail: "base x 2^attempt, capped" },
          { label: "Add jitter", detail: "Random delay spreads clients apart" },
          { label: "Retry or give up", detail: "Stop after max attempts or budget" },
        ],
      },
      {
        type: "sequence",
        title: "Idempotency key prevents double charge",
        actors: ["Client", "Payments API", "Key store"],
        messages: [
          { from: 0, to: 1, label: "POST /charge key=abc" },
          { from: 1, to: 2, label: "Save key=abc with result" },
          { from: 1, to: 0, label: "Response lost (timeout)" },
          { from: 0, to: 1, label: "Retry POST key=abc" },
          { from: 1, to: 2, label: "Key exists, fetch stored result" },
          { from: 1, to: 0, label: "Return original result, no new charge" },
        ],
      },
    ],
    keyPoints: [
      "Always set timeouts; a call without one can hang forever.",
      "Retry only transient errors like timeouts, 503 and 429, never 400.",
      "Exponential backoff with jitter prevents synchronized retry waves.",
      "Retrying at every layer multiplies traffic; retry at one layer only.",
      "Idempotency keys make non-idempotent writes like payments safe to retry.",
    ],
    terms: [
      { term: "Timeout", meaning: "Maximum time to wait for a response." },
      { term: "Exponential backoff", meaning: "Doubling the wait between successive retries." },
      { term: "Jitter", meaning: "Random variation added to retry delays." },
      { term: "Idempotent", meaning: "Repeating the operation gives the same result." },
      { term: "Retry storm", meaning: "Retries overwhelming an already struggling service." },
    ],
    example: {
      lang: "python",
      code: "def call_with_retry(fn, max_attempts=5, base=0.1, cap=5.0):\n    for attempt in range(max_attempts):\n        try:\n            return fn(timeout=2.0)\n        except (Timeout, ServiceUnavailable):\n            if attempt == max_attempts - 1:\n                raise\n            delay = min(cap, base * 2 ** attempt)\n            time.sleep(random.uniform(0, delay))  # full jitter",
      caption: "Capped exponential backoff with full jitter.",
    },
    pitfalls: [
      "Retrying non-idempotent POSTs without a key, causing duplicates.",
      "Nested retries: 3 retries in 3 layers means up to 27 calls.",
      "Timeouts longer than the caller's own timeout.",
    ],
    check: [
      {
        q: "Why add jitter to backoff?",
        a: "Without it, all clients retry at the same moments and hit the service in synchronized waves.",
      },
      {
        q: "How does an idempotency key work?",
        a: "The server stores the key with the first result and returns that same result for any repeat with the same key.",
      },
    ],
  },

  "reliability/resilience-patterns": {
    summary:
      "Resilience patterns stop one slow or failing dependency from dragging the whole system down. Circuit breakers fail fast, bulkheads isolate resources, and backpressure and load shedding keep overload from spreading.",
    analogy: "A circuit breaker in your house cuts power before a fault burns everything.",
    visuals: [
      {
        type: "cycle",
        title: "Circuit breaker states",
        steps: [
          { label: "Closed", detail: "Requests flow, failures are counted" },
          { label: "Open", detail: "Failure threshold hit, calls fail fast" },
          { label: "Half-open", detail: "After cooldown, allow a few trial calls" },
          { label: "Close or reopen", detail: "Successes close it, failures reopen it" },
        ],
      },
      {
        type: "compare",
        title: "Three containment patterns",
        columns: [
          { title: "Circuit breaker", points: ["Stops calling a failing dependency", "Fails fast with fallback", "Gives it time to recover"] },
          { title: "Bulkhead", points: ["Separate pools per dependency", "One slow call cannot take all threads", "Limits blast radius"] },
          { title: "Backpressure", points: ["Signal producers to slow down", "Bounded queues, shed excess", "Prefer 503 over collapse"] },
        ],
      },
    ],
    keyPoints: [
      "Slow dependencies are more dangerous than dead ones because they tie up threads.",
      "Open circuits should return a fallback such as cached or default data.",
      "Bulkheads give each dependency its own connection or thread pool.",
      "Unbounded queues hide overload until memory runs out.",
      "Shed low-priority traffic first during overload.",
    ],
    terms: [
      { term: "Circuit breaker", meaning: "Stops calls to a failing service after repeated errors." },
      { term: "Bulkhead", meaning: "Isolated resource pool limiting failure spread." },
      { term: "Backpressure", meaning: "Signalling upstream to slow down when overloaded." },
      { term: "Load shedding", meaning: "Rejecting some requests to protect the rest." },
      { term: "Cascading failure", meaning: "One failure triggering failures in dependent services." },
    ],
    pitfalls: [
      "Sharing one thread pool for all outbound calls.",
      "Circuit breaker with no fallback, so users still see errors everywhere.",
      "Queues with no size limit.",
    ],
    check: [
      {
        q: "What does the half-open state do?",
        a: "It lets a few trial requests through after a cooldown to test whether the dependency has recovered.",
      },
      {
        q: "How does a bulkhead prevent cascading failure?",
        a: "Each dependency gets its own limited pool, so one slow dependency cannot exhaust resources others need.",
      },
    ],
  },

  "reliability/distributed-tx": {
    summary:
      "When one business action spans several services, a single database transaction is no longer possible. Two-phase commit locks everyone and blocks on failures, so most systems use sagas with compensations and the outbox pattern for reliable events.",
    visuals: [
      {
        type: "sequence",
        title: "Order saga with compensation",
        actors: ["Order svc", "Payment svc", "Inventory svc"],
        messages: [
          { from: 0, to: 0, label: "Create order (PENDING)" },
          { from: 0, to: 1, label: "Charge customer" },
          { from: 1, to: 0, label: "Payment succeeded" },
          { from: 0, to: 2, label: "Reserve items" },
          { from: 2, to: 0, label: "Out of stock" },
          { from: 0, to: 1, label: "Compensate: refund payment" },
          { from: 0, to: 0, label: "Mark order CANCELLED" },
        ],
      },
      {
        type: "flow",
        title: "Transactional outbox",
        steps: [
          { label: "One local transaction", detail: "Write business row and outbox row together" },
          { label: "Relay reads outbox", detail: "Polling or CDC picks up new rows" },
          { label: "Publish to broker", detail: "Event sent to Kafka or a queue" },
          { label: "Mark as sent", detail: "Retries are safe, duplicates possible" },
          { label: "Idempotent consumers", detail: "Dedupe by event ID" },
        ],
      },
    ],
    keyPoints: [
      "2PC blocks participants if the coordinator fails mid-commit.",
      "A saga is a chain of local transactions, each with a compensating action.",
      "Orchestrated sagas use a coordinator; choreographed sagas react to events.",
      "The outbox avoids the dual-write problem between database and broker.",
      "Consumers must deduplicate because events can arrive twice.",
    ],
    terms: [
      { term: "Two-phase commit", meaning: "Prepare then commit protocol across participants." },
      { term: "Saga", meaning: "Sequence of local transactions with compensating undo steps." },
      { term: "Compensation", meaning: "Action that semantically reverses an earlier step." },
      { term: "Transactional outbox", meaning: "Events stored in the same DB transaction, published later." },
      { term: "Dual write", meaning: "Writing to two systems separately, risking inconsistency." },
    ],
    example: {
      lang: "sql",
      code: "BEGIN;\nINSERT INTO orders (id, user_id, status)\n  VALUES ('o-77', 42, 'PENDING');\nINSERT INTO outbox (event_id, topic, payload)\n  VALUES ('e-901', 'order.created',\n          '{\"orderId\":\"o-77\",\"userId\":42}');\nCOMMIT;\n-- A relay later publishes outbox rows and marks them sent",
      caption: "Order row and event committed atomically.",
    },
    pitfalls: [
      "Writing to the database then publishing to Kafka without an outbox.",
      "Compensations that are not idempotent.",
      "Forgetting that saga intermediate states are visible to other readers.",
    ],
    check: [
      {
        q: "Why avoid two-phase commit across microservices?",
        a: "It holds locks across services and blocks if the coordinator fails, hurting availability and latency.",
      },
      {
        q: "What problem does the outbox pattern solve?",
        a: "It guarantees an event is published if and only if the database change committed, avoiding lost or phantom events.",
      },
    ],
  },

  "reliability/consensus": {
    summary:
      "Consensus lets a group of nodes agree on a value, such as who the leader is, even when some fail. Raft does this with elected leaders and majority votes, and tools like etcd and ZooKeeper package it for coordination.",
    visuals: [
      {
        type: "sequence",
        title: "Raft leader election",
        actors: ["Node A", "Node B", "Node C"],
        messages: [
          { from: 0, to: 0, label: "Heartbeat timeout, become candidate" },
          { from: 0, to: 1, label: "RequestVote (term 5)" },
          { from: 0, to: 2, label: "RequestVote (term 5)" },
          { from: 1, to: 0, label: "Vote granted" },
          { from: 0, to: 0, label: "Majority reached, become leader" },
          { from: 0, to: 1, label: "Heartbeat / AppendEntries" },
          { from: 0, to: 2, label: "Heartbeat / AppendEntries" },
        ],
      },
      {
        type: "sequence",
        title: "Lock with fencing token",
        actors: ["Client 1", "Lock service", "Storage"],
        messages: [
          { from: 0, to: 1, label: "Acquire lock" },
          { from: 1, to: 0, label: "Granted, token 33" },
          { from: 0, to: 2, label: "Write with token 33" },
          { from: 2, to: 2, label: "Reject any token below 33" },
        ],
      },
    ],
    keyPoints: [
      "Consensus needs a majority, so 5 nodes tolerate 2 failures.",
      "Raft elects a leader per term; the leader replicates a log to followers.",
      "Use etcd or ZooKeeper for leader election, config and locks, not bulk data.",
      "Distributed locks can expire mid-work; fencing tokens stop stale holders.",
    ],
    terms: [
      { term: "Consensus", meaning: "Nodes agreeing on one value despite failures." },
      { term: "Raft", meaning: "Understandable consensus algorithm using leaders and terms." },
      { term: "Term", meaning: "Raft election epoch; higher terms override lower ones." },
      { term: "Quorum", meaning: "Majority of nodes needed to make progress." },
      { term: "Fencing token", meaning: "Increasing number that lets storage reject stale lock holders." },
    ],
    pitfalls: [
      "Running consensus with an even number of nodes, gaining no extra fault tolerance.",
      "Trusting a lock lease without fencing after a long GC pause.",
      "Storing large application data in etcd or ZooKeeper.",
    ],
    check: [
      {
        q: "How many failures can a 5-node Raft cluster tolerate?",
        a: "Two, because the remaining three still form a majority.",
      },
      {
        q: "Why are fencing tokens needed with distributed locks?",
        a: "A paused client may keep writing after its lease expired; storage rejects its older token once a newer one is seen.",
      },
    ],
  },

  "reliability/observability": {
    summary:
      "Observability is the ability to understand what a system is doing from its outputs. Metrics, logs and traces answer different questions, while SLOs and error budgets turn reliability into a clear rule for when to ship or slow down.",
    visuals: [
      {
        type: "compare",
        title: "Three pillars of observability",
        columns: [
          { title: "Metrics", points: ["Numeric time series", "Cheap, aggregated", "Dashboards and alerts", "Answers: is it broken?"] },
          { title: "Logs", points: ["Discrete event records", "Rich detail, costly at scale", "Structured JSON best", "Answers: what happened?"] },
          { title: "Traces", points: ["One request across services", "Spans with timings", "Find slow hops", "Answers: where is it slow?"] },
        ],
      },
      {
        type: "cycle",
        title: "Error budget loop",
        steps: [
          { label: "Set SLO", detail: "For example 99.9% successful requests" },
          { label: "Measure SLI", detail: "Track success rate over 30 days" },
          { label: "Budget remains", detail: "Ship features at full speed" },
          { label: "Budget spent", detail: "Freeze risky releases, fix reliability" },
        ],
      },
    ],
    keyPoints: [
      "Alert on user-facing symptoms like errors and latency, not every CPU spike.",
      "An error budget is 100% minus the SLO.",
      "Propagate a trace ID through every service and log line.",
      "Track the four golden signals: latency, traffic, errors, saturation.",
    ],
    terms: [
      { term: "SLI", meaning: "Measured indicator, such as fraction of fast successful requests." },
      { term: "SLO", meaning: "Target for an SLI over a time window." },
      { term: "Error budget", meaning: "Allowed unreliability before releases slow down." },
      { term: "Span", meaning: "One timed operation within a distributed trace." },
      { term: "Golden signals", meaning: "Latency, traffic, errors and saturation." },
    ],
    example: {
      lang: "text",
      code: "SLI: requests with status < 500 and latency < 300 ms\n     divided by all requests\nSLO: 99.9% over rolling 30 days\n\nError budget = 0.1% of requests\n  at 10M requests/month -> 10,000 bad requests allowed\n\nAlert: burn rate > 14x for 1 hour -> page on-call",
      caption: "Defining an SLO and its error budget.",
    },
    pitfalls: [
      "Paging on causes like high CPU instead of user impact.",
      "Unstructured logs that cannot be searched or correlated.",
      "Setting 100% SLOs, which leave no room to ship.",
    ],
    check: [
      {
        q: "What does an error budget decide?",
        a: "Whether the team can keep releasing quickly or must pause risky changes to focus on reliability.",
      },
      {
        q: "When would you reach for traces over logs?",
        a: "When you need to see which service or hop made a single request slow across a distributed call chain.",
      },
    ],
  },

  // ───────────────────────── Case studies I ─────────────────────────
  "case-studies-core/url-shortener": {
    summary:
      "A URL shortener maps short codes to long URLs and redirects billions of clicks. It is read-heavy, so the key choices are collision-free ID generation, a fast key-value lookup, aggressive caching and asynchronous analytics.",
    visuals: [
      {
        type: "flow",
        title: "High-level architecture",
        steps: [
          { label: "Client", detail: "Creates links or clicks short URLs" },
          { label: "Load balancer", detail: "Spreads traffic over stateless API servers" },
          { label: "API service", detail: "Create and redirect endpoints" },
          { label: "Redis cache", detail: "Hot code-to-URL mappings" },
          { label: "Key-value DB", detail: "Durable code to long URL store" },
          { label: "Analytics stream", detail: "Click events to Kafka, then warehouse" },
        ],
      },
      {
        type: "sequence",
        title: "Redirect request",
        actors: ["Browser", "API server", "Redis", "Database"],
        messages: [
          { from: 0, to: 1, label: "GET /aZ3kP9" },
          { from: 1, to: 2, label: "GET code aZ3kP9" },
          { from: 2, to: 1, label: "Miss" },
          { from: 1, to: 3, label: "Lookup long URL" },
          { from: 3, to: 1, label: "https://example.com/..." },
          { from: 1, to: 2, label: "Cache mapping with TTL" },
          { from: 1, to: 0, label: "302 Location: long URL" },
        ],
      },
    ],
    keyPoints: [
      "Base62 with 7 characters gives about 3.5 trillion codes.",
      "Generate IDs from a counter or ID ranges, then base62-encode, to avoid collisions.",
      "Use 302 to count every click; 301 lets browsers cache and skip you.",
      "Reads dominate, so cache hot codes and scale reads horizontally.",
      "Log clicks asynchronously so analytics never slows redirects.",
    ],
    terms: [
      { term: "Base62", meaning: "Encoding with digits, lowercase and uppercase letters." },
      { term: "301 redirect", meaning: "Permanent redirect that browsers may cache." },
      { term: "302 redirect", meaning: "Temporary redirect; every click reaches the server." },
      { term: "ID range allocation", meaning: "Each server reserves a block of counter values." },
      { term: "Hash collision", meaning: "Two inputs producing the same short code." },
    ],
    example: {
      lang: "text",
      code: "POST /api/links { \"url\": \"https://...\", \"alias\"?: \"sale\" }\n  -> 201 { \"code\": \"aZ3kP9\" }\nGET  /{code} -> 302 Location: long URL\n\nTable links(code PK, long_url, user_id, created_at, expires_at)\n\nScale: 100M new links/day -> ~1,200 writes/s\n  read:write 100:1 -> ~120,000 redirects/s\n  500 bytes/link * 100M * 365 * 5 ≈ 90 TB\n62^7 ≈ 3.5 trillion codes, enough for decades",
      caption: "API, schema and back-of-envelope math.",
    },
    pitfalls: [
      "Truncating MD5 hashes without handling collisions.",
      "A single global counter becoming a bottleneck; use ranges instead.",
      "Writing analytics synchronously on the redirect path.",
    ],
    check: [
      {
        q: "301 or 302 for redirects?",
        a: "302 if you need click analytics, since 301 lets browsers cache and skip your server.",
      },
      {
        q: "How do you generate unique codes across many servers?",
        a: "Give each server a range of IDs from a coordinator and base62-encode them, so no collision checks are needed.",
      },
    ],
  },

  "case-studies-core/rate-limiter": {
    summary:
      "A distributed rate limiter enforces limits like 100 requests per minute per user across many API servers. Counters live in a shared low-latency store such as Redis, updated atomically so concurrent requests cannot slip past the limit.",
    visuals: [
      {
        type: "layers",
        title: "High-level architecture",
        layers: [
          { label: "Clients", detail: "Identified by API key, user ID or IP" },
          { label: "API gateway or middleware", detail: "Checks limit before forwarding" },
          { label: "Rules config", detail: "Limits per endpoint and tier, cached locally" },
          { label: "Redis cluster", detail: "Shared counters, sharded by client key" },
          { label: "Backend services", detail: "Only receive allowed requests" },
        ],
      },
      {
        type: "sequence",
        title: "Rate limit check",
        actors: ["Client", "Gateway", "Redis", "Service"],
        messages: [
          { from: 0, to: 1, label: "GET /api/orders" },
          { from: 1, to: 2, label: "Run Lua: refill and take token" },
          { from: 2, to: 1, label: "Allowed, 42 tokens left" },
          { from: 1, to: 3, label: "Forward request" },
          { from: 3, to: 1, label: "200 OK" },
          { from: 1, to: 0, label: "200 plus X-RateLimit-Remaining" },
        ],
      },
    ],
    keyPoints: [
      "Shared counters are needed so the limit holds across all servers.",
      "Use a Lua script or atomic INCR to avoid read-then-write races.",
      "Token bucket allows bursts; sliding window counter is smooth and cheap.",
      "Decide fail-open or fail-closed when Redis is unavailable.",
      "Local in-memory pre-checks cut Redis latency at the cost of accuracy.",
    ],
    terms: [
      { term: "Race condition", meaning: "Concurrent updates producing a wrong count." },
      { term: "Lua script", meaning: "Runs atomically inside Redis." },
      { term: "Fail open", meaning: "Allow traffic when the limiter is unavailable." },
      { term: "Sliding window counter", meaning: "Weighted mix of current and previous window counts." },
      { term: "X-RateLimit headers", meaning: "Tell clients their limit, remaining and reset time." },
    ],
    example: {
      lang: "text",
      code: "Fixed-window counter in Redis (per user, per minute):\n\nkey   = \"rl:{userId}:{epochMinute}\"\ncount = INCR key\nif count == 1: EXPIRE key 60\nif count > 100: return 429 Too Many Requests\nelse: forward request\n\nSliding window approximation:\n  rate = prev_count * (1 - elapsed/60) + curr_count",
      caption: "Atomic INCR avoids races; sliding window smooths edges.",
    },
    pitfalls: [
      "GET then SET in two calls, letting concurrent requests exceed the limit.",
      "Hot keys for one heavy client overloading a single Redis shard.",
      "Adding a cross-region Redis round trip to every request.",
    ],
    check: [
      {
        q: "Why can't each server keep its own counter?",
        a: "Requests spread across servers, so a client could get the limit times the number of servers.",
      },
      {
        q: "Should the limiter fail open or closed?",
        a: "Usually fail open for general APIs to protect availability, but fail closed for abuse-sensitive endpoints like login.",
      },
    ],
  },

  "case-studies-core/key-value-store": {
    summary:
      "A Dynamo-style key-value store spreads keys over nodes with consistent hashing, replicates each key to N nodes, and uses tunable quorums. Hinted handoff, anti-entropy and versioning keep it available and convergent through failures.",
    visuals: [
      {
        type: "layers",
        title: "High-level architecture",
        layers: [
          { label: "Client API", detail: "get(key) and put(key, value)" },
          { label: "Coordinator node", detail: "Any node routes the request" },
          { label: "Consistent hash ring", detail: "Maps keys to N replica nodes" },
          { label: "Storage engine", detail: "LSM tree with commit log per node" },
          { label: "Gossip and repair", detail: "Membership, failure detection, Merkle tree sync" },
        ],
      },
      {
        type: "sequence",
        title: "Quorum write (N=3, W=2)",
        actors: ["Client", "Coordinator", "Replica A", "Replica B"],
        messages: [
          { from: 0, to: 1, label: "put(k, v)" },
          { from: 1, to: 2, label: "Write k=v, version" },
          { from: 1, to: 3, label: "Write k=v, version" },
          { from: 2, to: 1, label: "Ack" },
          { from: 3, to: 1, label: "Ack" },
          { from: 1, to: 0, label: "Success, W=2 reached" },
        ],
      },
    ],
    keyPoints: [
      "Each key is stored on the next N distinct nodes clockwise on the ring.",
      "W + R > N gives overlapping quorums for fresher reads.",
      "Hinted handoff stores writes for a down node and replays them later.",
      "Merkle trees let replicas find and repair differences cheaply.",
      "Vector clocks or last-write-wins resolve conflicting versions.",
    ],
    terms: [
      { term: "Replication factor", meaning: "Number of nodes storing each key, N." },
      { term: "Hinted handoff", meaning: "Temporary holder keeps writes for an unavailable replica." },
      { term: "Gossip protocol", meaning: "Nodes share membership and health with random peers." },
      { term: "Merkle tree", meaning: "Hash tree for quickly comparing replica contents." },
      { term: "Vector clock", meaning: "Per-node counters that detect concurrent updates." },
      { term: "Read repair", meaning: "Fixing stale replicas noticed during a read." },
    ],
    example: {
      lang: "text",
      code: "API:\n  put(key, value, context?) -> ok\n  get(key) -> [values], context\n\nConfig: N=3, W=2, R=2  (W+R > N)\n\nput(\"cart:42\") -> hash -> nodes B, C, D\n  C down -> write to E with hint \"for C\"\n  C returns -> E hands off the write to C",
      caption: "Tunable quorums with hinted handoff.",
    },
    pitfalls: [
      "Placing all N replicas in one availability zone.",
      "Using wall-clock last-write-wins and losing concurrent writes.",
      "Skipping anti-entropy so replicas drift permanently.",
    ],
    check: [
      {
        q: "What does hinted handoff provide?",
        a: "Writes still succeed while a replica is down, and the missed data is delivered when it recovers.",
      },
      {
        q: "How would you tune N, W and R for fast reads?",
        a: "Use a small R such as 1 with a larger W such as N, so reads hit one replica while overlap is kept.",
      },
    ],
  },

  "case-studies-core/notification-system": {
    summary:
      "A notification system accepts events from many services and delivers them via push, email and SMS. Queues per channel decouple sending from third-party providers, while preferences, rate limits, retries and deduplication protect users.",
    visuals: [
      {
        type: "flow",
        title: "High-level architecture",
        steps: [
          { label: "Producer services", detail: "Call the notification API with an event" },
          { label: "Notification service", detail: "Validates, checks preferences, renders templates" },
          { label: "Channel queues", detail: "Separate queues for push, email, SMS" },
          { label: "Channel workers", detail: "Send with retries and backoff" },
          { label: "Providers", detail: "APNs, FCM, SendGrid, Twilio" },
          { label: "Delivery log", detail: "Status tracking and analytics" },
        ],
      },
      {
        type: "sequence",
        title: "Sending one notification",
        actors: ["Order svc", "Notif svc", "Push queue", "Push worker"],
        messages: [
          { from: 0, to: 1, label: "POST /notify (dedupe key)" },
          { from: 1, to: 1, label: "Check prefs and dedupe" },
          { from: 1, to: 2, label: "Enqueue push message" },
          { from: 1, to: 0, label: "202 Accepted" },
          { from: 3, to: 2, label: "Consume message" },
          { from: 3, to: 3, label: "Send via APNs, retry on failure" },
        ],
      },
    ],
    keyPoints: [
      "Separate queues per channel so a slow SMS provider does not block push.",
      "Return 202 immediately; delivery happens asynchronously.",
      "Deduplicate with an event ID so retries never double-notify.",
      "Respect user preferences, quiet hours and per-user rate limits.",
      "Failed sends retry with backoff, then land in a dead-letter queue.",
    ],
    terms: [
      { term: "APNs and FCM", meaning: "Apple and Google push notification gateways." },
      { term: "Device token", meaning: "Identifier for sending push to one app install." },
      { term: "Fan-out", meaning: "One event producing many notifications." },
      { term: "Dedupe key", meaning: "Unique ID used to drop duplicate sends." },
      { term: "Template", meaning: "Reusable message with placeholders filled per user." },
    ],
    example: {
      lang: "text",
      code: "POST /v1/notifications\n{\n  \"userId\": 42,\n  \"type\": \"order_shipped\",\n  \"channels\": [\"push\", \"email\"],\n  \"data\": { \"orderId\": \"o-77\" },\n  \"dedupeKey\": \"order_shipped:o-77\"\n}\n-> 202 Accepted\n\nTables: user_prefs(user_id, channel, enabled, quiet_hours)\n        devices(user_id, token, platform)",
      caption: "API and core data model.",
    },
    pitfalls: [
      "Calling providers synchronously in the request path.",
      "One shared queue where an email backlog delays urgent pushes.",
      "No dedupe, so retries send the same SMS several times.",
    ],
    check: [
      {
        q: "Why use a queue per channel?",
        a: "Channels have different throughput and failure modes, so isolation stops one slow provider from delaying the others.",
      },
      {
        q: "How do you prevent duplicate notifications?",
        a: "Store a dedupe key per event and user and skip sends whose key was already processed.",
      },
    ],
  },

  "case-studies-core/typeahead": {
    summary:
      "Search autocomplete suggests popular completions as a user types, within about 100 ms. Precompute top-k suggestions per prefix in a trie built offline from query logs, serve it from memory, and cache aggressively.",
    visuals: [
      {
        type: "flow",
        title: "High-level architecture",
        steps: [
          { label: "Query logs", detail: "Every search is logged" },
          { label: "Aggregation job", detail: "Count query frequencies hourly or daily" },
          { label: "Trie builder", detail: "Build trie with top-k per node" },
          { label: "Suggestion servers", detail: "Serve trie snapshot from memory" },
          { label: "Cache and CDN", detail: "Cache hot short prefixes" },
          { label: "Client", detail: "Debounced requests per keystroke" },
        ],
      },
      {
        type: "sequence",
        title: "Fetching suggestions",
        actors: ["Browser", "Cache", "Suggest server"],
        messages: [
          { from: 0, to: 0, label: "User types \"syst\", debounce 50 ms" },
          { from: 0, to: 1, label: "GET /suggest?q=syst" },
          { from: 1, to: 2, label: "Miss, forward" },
          { from: 2, to: 2, label: "Walk trie to node \"syst\"" },
          { from: 2, to: 1, label: "Top 5 stored at node" },
          { from: 1, to: 0, label: "system design, systemd, ..." },
        ],
      },
    ],
    keyPoints: [
      "Store top-k completions at each trie node so lookup is O(prefix length).",
      "Rebuild the trie offline and swap snapshots instead of updating live.",
      "Shard the trie by prefix range when it no longer fits one machine.",
      "Debounce keystrokes and cache results in the browser too.",
    ],
    terms: [
      { term: "Trie", meaning: "Prefix tree where each path spells a string." },
      { term: "Top-k", meaning: "The k highest-ranked items." },
      { term: "Debounce", meaning: "Wait for a pause in typing before sending a request." },
      { term: "Prefix sharding", meaning: "Splitting the trie across servers by starting letters." },
      { term: "Snapshot swap", meaning: "Replacing the live index atomically with a new build." },
    ],
    example: {
      lang: "text",
      code: "Scale: 10M DAU * 10 searches * 6 keystrokes = 600M/day\n  ≈ 7,000 QPS average, ~20,000 QPS peak\n\nTrieNode {\n  children: map<char, TrieNode>\n  top5: [(\"system design\", 98000), (\"systemd\", 41000), ...]\n}\n\nsuggest(prefix): node = walk(prefix); return node.top5",
      caption: "Volume estimate and a trie node with cached top-k.",
    },
    pitfalls: [
      "Computing top-k by traversing the whole subtree at query time.",
      "Updating the trie in real time under heavy read load.",
      "Forgetting to filter offensive or unsafe suggestions.",
    ],
    check: [
      {
        q: "Why store top-k at every node?",
        a: "It turns each lookup into a short walk down the prefix, avoiding a costly subtree search per keystroke.",
      },
      {
        q: "How do trending queries appear quickly?",
        a: "Run a faster streaming aggregation for recent queries and merge its results with the periodic full rebuild.",
      },
    ],
  },

  // ───────────────────────── Case studies II ─────────────────────────
  "case-studies-scale/news-feed": {
    summary:
      "A news feed shows each user recent posts from people they follow. The central choice is fan-out on write (precompute feeds) versus fan-out on read (merge at request time), and most real systems use a hybrid for celebrities.",
    visuals: [
      {
        type: "compare",
        title: "Fan-out on write vs read",
        columns: [
          { title: "Fan-out on write (push)", points: ["Insert post into followers' feeds", "Very fast feed reads", "Costly for millions of followers", "Wasted on inactive users"] },
          { title: "Fan-out on read (pull)", points: ["Fetch followees' posts at read time", "Cheap writes", "Slow reads, heavy merging", "Fits celebrity accounts"] },
          { title: "Hybrid", points: ["Push for normal users", "Pull for celebrities", "Merge both at read", "Used by large networks"] },
        ],
      },
      {
        type: "sequence",
        title: "Publishing a post (hybrid)",
        actors: ["Author", "Post svc", "Fan-out workers", "Feed cache"],
        messages: [
          { from: 0, to: 1, label: "POST /posts" },
          { from: 1, to: 1, label: "Save post to DB" },
          { from: 1, to: 2, label: "Enqueue fan-out job" },
          { from: 1, to: 0, label: "201 Created" },
          { from: 2, to: 2, label: "Load follower IDs, skip if celebrity" },
          { from: 2, to: 3, label: "Prepend post ID to followers' feeds" },
        ],
      },
    ],
    keyPoints: [
      "Feed caches store post IDs, not full posts, to save memory.",
      "Fan-out runs asynchronously through a queue.",
      "Celebrity posts are pulled at read time and merged in.",
      "Paginate feeds with a cursor based on post ID or time.",
      "Ranking can be applied after candidate posts are gathered.",
    ],
    terms: [
      { term: "Fan-out", meaning: "Delivering one post to many followers' feeds." },
      { term: "Push model", meaning: "Precompute feeds when posts are written." },
      { term: "Pull model", meaning: "Build feeds when users read them." },
      { term: "Hot user", meaning: "Account with huge follower count." },
      { term: "Feed cache", meaning: "Per-user list of recent post IDs, often in Redis." },
    ],
    example: {
      lang: "text",
      code: "POST /v1/posts { text, mediaIds } -> postId\nGET  /v1/feed?cursor=... -> posts[], nextCursor\n\nposts(post_id, author_id, text, created_at)\nfollows(follower_id, followee_id)\nfeed cache: feed:{userId} -> list of last 500 post IDs\n\nRead: ids = feed:{me} + recent posts of followed celebs\n      merge by time, hydrate posts from cache, rank",
      caption: "APIs, data model and hybrid read path.",
    },
    pitfalls: [
      "Pushing a celebrity's post into 100 million feeds synchronously.",
      "Storing full post bodies in every follower's feed.",
      "Ignoring deletes and privacy changes in precomputed feeds.",
    ],
    check: [
      {
        q: "Why not push every post to every follower?",
        a: "Accounts with millions of followers make each post an enormous write burst, so their posts are pulled at read time instead.",
      },
      {
        q: "What goes into a feed cache entry?",
        a: "Usually post IDs with timestamps; full post data is fetched from a separate post cache when rendering.",
      },
    ],
  },

  "case-studies-scale/chat": {
    summary:
      "A chat system delivers messages in real time over persistent WebSocket connections, stores history durably and tracks who is online. The hard parts are routing to the right connection server, ordering per conversation and offline delivery.",
    visuals: [
      {
        type: "layers",
        title: "High-level architecture",
        layers: [
          { label: "Clients", detail: "Keep a WebSocket open while active" },
          { label: "Chat gateway servers", detail: "Hold connections, stateful per user" },
          { label: "Session registry", detail: "Redis maps user to gateway server" },
          { label: "Message service and queue", detail: "Assigns IDs, routes, fans out to groups" },
          { label: "Message store", detail: "Cassandra partitioned by conversation ID" },
          { label: "Presence and push", detail: "Heartbeats for online; APNs/FCM when offline" },
        ],
      },
      {
        type: "sequence",
        title: "One-to-one message delivery",
        actors: ["Alice", "Gateway A", "Message svc", "Gateway B"],
        messages: [
          { from: 0, to: 1, label: "send(msg, clientMsgId)" },
          { from: 1, to: 2, label: "Forward message" },
          { from: 2, to: 2, label: "Assign seq ID, persist" },
          { from: 2, to: 1, label: "Ack stored" },
          { from: 1, to: 0, label: "Sent tick" },
          { from: 2, to: 3, label: "Route to Bob's gateway" },
          { from: 3, to: 2, label: "Delivered ack from Bob" },
        ],
      },
    ],
    keyPoints: [
      "Gateways are stateful, so a registry tracks which server holds each user.",
      "Order messages per conversation with a sequence number, not wall clocks.",
      "Persist before acknowledging so messages survive crashes.",
      "Offline users get a push notification and sync missed messages on reconnect.",
      "Client message IDs let the server drop duplicate sends.",
    ],
    terms: [
      { term: "WebSocket", meaning: "Persistent bidirectional connection for real-time messages." },
      { term: "Presence", meaning: "Online or offline status, driven by heartbeats." },
      { term: "Sequence ID", meaning: "Monotonic per-conversation number giving message order." },
      { term: "Delivery receipt", meaning: "Ack showing a message reached the recipient." },
      { term: "Session registry", meaning: "Lookup from user to the server holding their connection." },
    ],
    example: {
      lang: "text",
      code: "Scale: 50M DAU * 40 messages = 2B messages/day\n  ≈ 23,000 msg/s average, ~70,000 peak\n  100 bytes * 2B = 200 GB/day\n\nmessages (\n  conversation_id  PARTITION KEY,\n  seq_id           CLUSTERING KEY DESC,\n  sender_id, body, created_at\n)\nSync: GET /conversations/{id}/messages?after_seq=1042",
      caption: "Estimate and a conversation-partitioned message table.",
    },
    pitfalls: [
      "Ordering by server timestamps that drift across machines.",
      "Treating gateway servers as stateless and losing routing info.",
      "Broadcasting presence changes to every contact in huge groups.",
    ],
    check: [
      {
        q: "How does a message find the recipient's connection?",
        a: "The message service looks up the recipient in a session registry that maps user ID to gateway server, then forwards it there.",
      },
      {
        q: "How do you guarantee ordering within a chat?",
        a: "Assign a monotonically increasing sequence ID per conversation when storing, and clients sort by it.",
      },
    ],
  },

  "case-studies-scale/video-streaming": {
    summary:
      "A video platform ingests uploads, transcodes them into many resolutions and serves small segments from CDNs. Adaptive bitrate streaming lets the player switch quality as bandwidth changes, and storage and egress dominate the cost.",
    visuals: [
      {
        type: "flow",
        title: "Upload and transcoding pipeline",
        steps: [
          { label: "Upload", detail: "Client sends file to object storage via pre-signed URL" },
          { label: "Upload event", detail: "Queue triggers processing job" },
          { label: "Split and transcode", detail: "Parallel workers produce 240p to 4K renditions" },
          { label: "Package segments", detail: "HLS or DASH chunks plus manifest" },
          { label: "Store and publish", detail: "Object storage, metadata DB marks ready" },
          { label: "CDN delivery", detail: "Edge caches serve segments to viewers" },
        ],
      },
      {
        type: "sequence",
        title: "Adaptive bitrate playback",
        actors: ["Player", "API", "CDN edge"],
        messages: [
          { from: 0, to: 1, label: "GET /videos/123/play" },
          { from: 1, to: 0, label: "Manifest URL (signed)" },
          { from: 0, to: 2, label: "Fetch master manifest" },
          { from: 0, to: 2, label: "Fetch 720p segment 1" },
          { from: 0, to: 0, label: "Bandwidth dropped, switch down" },
          { from: 0, to: 2, label: "Fetch 480p segment 2" },
        ],
      },
    ],
    keyPoints: [
      "Upload directly to object storage; never stream large files through app servers.",
      "Transcode chunks in parallel to finish long videos quickly.",
      "Segments of a few seconds let the player switch bitrate smoothly.",
      "The CDN serves nearly all bytes; origin only handles misses.",
      "Encode rarely watched videos in fewer renditions to save cost.",
    ],
    terms: [
      { term: "Transcoding", meaning: "Converting video into different codecs and resolutions." },
      { term: "Rendition", meaning: "One encoded version at a specific bitrate and resolution." },
      { term: "HLS or DASH", meaning: "Protocols serving video as segments with a manifest." },
      { term: "Adaptive bitrate", meaning: "Player switches quality based on measured bandwidth." },
      { term: "Egress", meaning: "Data transferred out to viewers, a major cost." },
    ],
    example: {
      lang: "text",
      code: "Uploads: 500 hours of video per minute\n  1 hour of 1080p ≈ 3 GB; all renditions ≈ 6 GB\n  500 * 60 * 24 * 6 GB ≈ 4.3 PB/day of new storage\n\nPlayback: 5M concurrent viewers * 5 Mbps\n  = 25 Tbps egress, must come from CDN edges\n\nmaster.m3u8 -> 1080p.m3u8, 720p.m3u8, 480p.m3u8\n720p.m3u8   -> seg_0001.ts, seg_0002.ts, ... (4 s each)",
      caption: "Storage and bandwidth estimates and an HLS manifest.",
    },
    pitfalls: [
      "Transcoding the whole file on one machine serially.",
      "Serving video from origin servers instead of a CDN.",
      "Encoding every video in every format regardless of popularity.",
    ],
    check: [
      {
        q: "How does adaptive bitrate streaming work?",
        a: "Video is split into short segments in several qualities, and the player picks each next segment's quality based on current bandwidth.",
      },
      {
        q: "Why is the CDN essential here?",
        a: "Egress bandwidth is enormous, and edge caches serve popular segments close to viewers, cutting latency and origin load.",
      },
    ],
  },

  "case-studies-scale/ride-sharing": {
    summary:
      "A ride-sharing service tracks millions of moving drivers, matches riders to nearby available drivers and manages each trip's lifecycle. Location writes are huge and ephemeral, so they live in memory with a geospatial index.",
    visuals: [
      {
        type: "layers",
        title: "High-level architecture",
        layers: [
          { label: "Rider and driver apps", detail: "Drivers send GPS every 4 seconds" },
          { label: "API gateway and WebSockets", detail: "Requests in, live updates out" },
          { label: "Location service", detail: "In-memory geohash index of available drivers" },
          { label: "Matching service", detail: "Finds nearby drivers, sends offers" },
          { label: "Trip service", detail: "Trip state machine in a transactional DB" },
          { label: "Payments and history", detail: "Charges, receipts and analytics" },
        ],
      },
      {
        type: "sequence",
        title: "Requesting a ride",
        actors: ["Rider", "Matching svc", "Location svc", "Driver"],
        messages: [
          { from: 0, to: 1, label: "Request ride (pickup lat/lng)" },
          { from: 1, to: 2, label: "Nearby available drivers?" },
          { from: 2, to: 1, label: "Drivers in geohash cell and neighbours" },
          { from: 1, to: 3, label: "Offer trip (15 s to accept)" },
          { from: 3, to: 1, label: "Accept" },
          { from: 1, to: 0, label: "Driver assigned, ETA 4 min" },
        ],
      },
    ],
    keyPoints: [
      "Location updates are write-heavy and short-lived, so keep them in memory.",
      "Geohash or quadtree cells turn nearby searches into small key lookups.",
      "Search the rider's cell plus neighbours to avoid edge misses.",
      "Lock a driver while an offer is pending to prevent double booking.",
      "Model trips as a state machine with strongly consistent transitions.",
    ],
    terms: [
      { term: "Geohash", meaning: "String encoding a lat/lng cell; shared prefixes mean nearby." },
      { term: "Quadtree", meaning: "Tree splitting space into four cells recursively." },
      { term: "Matching", meaning: "Choosing the best driver for a ride request." },
      { term: "Trip state machine", meaning: "Requested, accepted, arrived, in progress, completed." },
      { term: "ETA", meaning: "Estimated time of arrival from routing data." },
    ],
    example: {
      lang: "text",
      code: "Scale: 5M active drivers, update every 4 s\n  -> 1.25M location writes/s, kept in memory\n\nRedis: GEOADD drivers:available lng lat driverId\n       GEOSEARCH drivers:available FROMLONLAT lng lat\n                 BYRADIUS 2 km ASC COUNT 10\n\ntrips(trip_id, rider_id, driver_id, state,\n      pickup, dropoff, fare, updated_at)\nREQUESTED -> ACCEPTED -> ARRIVED -> IN_PROGRESS -> COMPLETED",
      caption: "Location volume, geo queries and trip states.",
    },
    pitfalls: [
      "Writing every GPS ping to a relational database.",
      "Searching only the rider's own geohash cell.",
      "Offering one driver to two riders at once.",
    ],
    check: [
      {
        q: "Why use geohash for nearby driver search?",
        a: "Nearby points share prefixes, so finding drivers becomes a lookup of a few cells instead of scanning every driver.",
      },
      {
        q: "How do you prevent a driver being matched twice?",
        a: "Atomically mark the driver as reserved when sending an offer, and release them only if the offer is declined or expires.",
      },
    ],
  },

  "case-studies-scale/web-crawler": {
    summary:
      "A web crawler downloads billions of pages by repeatedly taking URLs from a frontier, fetching them, extracting links and queuing new ones. It must be polite to each host, avoid revisiting duplicates and scale across many workers.",
    visuals: [
      {
        type: "cycle",
        title: "Crawl loop",
        steps: [
          { label: "URL frontier", detail: "Prioritised, per-host queues" },
          { label: "Fetcher", detail: "Check robots.txt, download with DNS cache" },
          { label: "Content dedupe", detail: "Skip pages whose fingerprint was seen" },
          { label: "Store and parse", detail: "Save HTML to blob storage, extract links" },
          { label: "URL filter", detail: "Normalise, drop seen URLs via Bloom filter" },
        ],
      },
      {
        type: "sequence",
        title: "Fetching one URL politely",
        actors: ["Frontier", "Fetcher", "Host site", "Seen-URL store"],
        messages: [
          { from: 1, to: 0, label: "Next URL for ready host" },
          { from: 1, to: 2, label: "GET /robots.txt (cached)" },
          { from: 1, to: 2, label: "GET page" },
          { from: 2, to: 1, label: "200 HTML" },
          { from: 1, to: 3, label: "Check extracted links" },
          { from: 1, to: 0, label: "Enqueue new URLs, delay host" },
        ],
      },
    ],
    keyPoints: [
      "Politeness: one connection per host and a delay between requests.",
      "Partition the frontier by host so each host maps to one worker queue.",
      "Bloom filters cheaply test whether a URL was already seen.",
      "Content fingerprints such as SimHash catch duplicate pages under different URLs.",
      "Guard against spider traps with depth and URL-length limits.",
    ],
    terms: [
      { term: "URL frontier", meaning: "Data structure of URLs waiting to be crawled." },
      { term: "robots.txt", meaning: "Site file listing paths crawlers must not fetch." },
      { term: "Politeness", meaning: "Limiting request rate per host." },
      { term: "Bloom filter", meaning: "Space-efficient set test with rare false positives." },
      { term: "Spider trap", meaning: "Pages generating infinite unique URLs." },
    ],
    example: {
      lang: "text",
      code: "Goal: 1B pages per month\n  1B / (30 * 10^5 s) ≈ 400 pages/s, ~800 peak\n  avg page 500 KB -> 400 * 500 KB = 200 MB/s download\n  storage: 1B * 500 KB = 500 TB/month (compress ~5x)\n\nSeen URLs: 1B * ~10 bits in Bloom filter ≈ 1.25 GB RAM",
      caption: "Throughput, bandwidth and dedupe memory.",
    },
    pitfalls: [
      "Hammering one host with many parallel requests.",
      "Not normalising URLs, so tracking parameters create endless duplicates.",
      "Letting DNS lookups become the throughput bottleneck.",
    ],
    check: [
      {
        q: "How does the frontier enforce politeness?",
        a: "It keeps a queue per host with a next-allowed time, and a worker only takes a host's URL once that delay has passed.",
      },
      {
        q: "Why use a Bloom filter for seen URLs?",
        a: "It answers membership for billions of URLs in little memory; rare false positives only skip a few pages.",
      },
    ],
  },

  // ───────────────────────── Mock interviews ─────────────────────────
  "sd-practice/self-mocks": {
    summary:
      "Solo timed designs build the habit of covering every phase within 45 minutes. Writing down the trade-offs you chose, then comparing with reference solutions, shows exactly where your reasoning is thin.",
    visuals: [
      {
        type: "cycle",
        title: "Solo practice loop",
        steps: [
          { label: "Pick a prompt", detail: "One classic design per session" },
          { label: "Timed 45 minutes", detail: "Talk aloud, draw in Excalidraw" },
          { label: "Write trade-offs", detail: "Each choice, alternative and reason" },
          { label: "Compare reference", detail: "Note missed components and risks" },
          { label: "Redo weak parts", detail: "Fix gaps, then try a new prompt" },
        ],
      },
      {
        type: "flow",
        title: "Suggested time boxes",
        steps: [
          { label: "Requirements", detail: "5 minutes" },
          { label: "Estimates", detail: "5 minutes" },
          { label: "API and data model", detail: "5 to 10 minutes" },
          { label: "High-level design", detail: "10 minutes" },
          { label: "Deep dives", detail: "10 to 15 minutes" },
        ],
      },
    ],
    keyPoints: [
      "Use a real timer; running over is the most common failure.",
      "Speak aloud even alone, because interviews test communication.",
      "Record every decision as choice, alternative and reason.",
      "Re-attempt a weak prompt days later to confirm improvement.",
    ],
    terms: [
      { term: "Time box", meaning: "Fixed time limit for a design phase." },
      { term: "Trade-off log", meaning: "Written list of decisions and their alternatives." },
      { term: "Reference solution", meaning: "A published design used to check your work." },
      { term: "Deep dive", meaning: "Detailed look at one bottleneck or component." },
    ],
    example: {
      lang: "text",
      code: "Trade-off log: News feed (45 min)\n\n1. Fan-out: hybrid push/pull\n   Alt: pure push. Reason: celebrities cause write storms\n2. Feed store: Redis lists of post IDs\n   Alt: SQL query per read. Reason: p99 < 200 ms\n3. Consistency: eventual for feeds\n   Alt: strong. Reason: seconds of delay are acceptable\n\nMissed vs reference: ranking, deletes in cached feeds",
      caption: "A short trade-off write-up after a solo session.",
    },
    pitfalls: [
      "Reading reference solutions before attempting the design.",
      "Practising silently and freezing when asked to talk.",
      "Only practising favourite prompts.",
    ],
    check: [
      {
        q: "Why write trade-offs after each solo design?",
        a: "It forces you to justify choices and makes gaps visible when compared with reference designs.",
      },
      {
        q: "What should you do when you go over time?",
        a: "Note which phase overran and tighten that time box next session, aiming for a complete design first.",
      },
    ],
  },

  "sd-practice/peer-mocks": {
    summary:
      "Peer mock interviews add the pressure and interruptions of a real interviewer. Structured feedback on communication, requirements, design and depth tells you which gaps to fix before trying again.",
    visuals: [
      {
        type: "cycle",
        title: "Mock and feedback loop",
        steps: [
          { label: "Schedule mock", detail: "Peer or a mock interview platform" },
          { label: "Interview 45 minutes", detail: "Interviewer probes and changes requirements" },
          { label: "Structured feedback", detail: "Score each area with examples" },
          { label: "Fix top gaps", detail: "Study and practise the weakest area" },
          { label: "Retry the prompt", detail: "Repeat a failed design to confirm progress" },
        ],
      },
      {
        type: "tree",
        title: "Feedback rubric",
        root: "Interview signals",
        children: [
          { label: "Requirements", children: ["Asked clarifying questions", "Stated scale assumptions"] },
          { label: "Design", children: ["Complete end-to-end flow", "Sensible components"] },
          { label: "Depth", children: ["Found real bottlenecks", "Handled failures"] },
          { label: "Trade-offs", children: ["Named alternatives", "Justified choices"] },
          { label: "Communication", children: ["Clear structure", "Drove the discussion"] },
        ],
      },
    ],
    keyPoints: [
      "Ask for feedback against a rubric, not just general impressions.",
      "Swap roles; interviewing others shows what good answers look like.",
      "Treat interviewer hints as signals to adjust, not interruptions.",
      "Fix one or two gaps per round, then retry the same prompt.",
    ],
    terms: [
      { term: "Mock interview", meaning: "Practice interview simulating real conditions." },
      { term: "Rubric", meaning: "Fixed criteria used to score performance." },
      { term: "Signal", meaning: "Evidence the interviewer looks for in your answer." },
      { term: "Curveball", meaning: "Requirement change introduced mid-interview." },
    ],
    pitfalls: [
      "Asking friends who only say it was good.",
      "Ignoring interviewer hints and continuing on your own path.",
      "Doing many mocks without fixing the gaps they reveal.",
    ],
    check: [
      {
        q: "Why use a rubric for mock feedback?",
        a: "It turns vague impressions into specific scores per area, so you know exactly what to improve.",
      },
      {
        q: "What should you do when an interviewer gives a hint?",
        a: "Acknowledge it and adjust your design, since hints usually point to what they want to evaluate.",
      },
    ],
  },
};

export default explainers;
