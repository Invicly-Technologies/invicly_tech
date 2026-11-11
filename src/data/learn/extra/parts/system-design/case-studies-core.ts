import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "case-studies-core/rate-limiter": {
    plain: [
      "A rate limiter is a bouncer for your API. It counts how many requests each client makes and turns away the extra ones once they pass a limit, such as 100 requests per minute. This protects your servers from overload, stops abuse like password guessing, and keeps one heavy customer from slowing everyone else.",
      "On one server, counting is easy: keep a number in memory. But real APIs run on many servers behind a load balancer, and one client's requests land on different servers. If each server counts alone, a client could get 100 requests per server. So the counters must be shared.",
      "The usual answer is a fast shared store, most often Redis, which keeps data in memory and answers in well under a millisecond. Every API server asks Redis: may this client make one more request? Redis updates the count and answers yes or no in one step, so two servers cannot both sneak in the last allowed request.",
      "When a client is over the limit, the API replies with status 429 Too Many Requests and tells the client when to try again. A well-built limiter adds less than a millisecond or two to each request and keeps working sensibly even when Redis itself has trouble.",
    ],
    deepDive: [
      {
        heading: "Requirements and limit rules",
        body: "Start by asking who is limited and by what key: API key, user ID, IP address, or a combination. Then which limits: per endpoint (login is stricter than reads), per plan (free 60 per minute, paid 1,000), and sometimes several at once (10 per second and 1,000 per hour). Non-functional needs: added latency under about 1 to 2 ms, high availability, and accuracy that is close but not necessarily exact.\n\nStore rules as configuration, not code, for example a YAML list of key type, endpoint pattern, limit and window. Each limiter instance loads the rules at startup and refreshes them every few seconds, so changing a limit needs no deploy.\n\nAlso agree on the response: HTTP 429 with a Retry-After header, plus headers that show the limit, the remaining requests and when the window resets, so good clients can slow down before they hit the wall.",
        bullets: ["Key: API key, user, IP, or tenant", "Several limits can apply to one request", "Rules in config, refreshed without deploys", "429 plus Retry-After and remaining-count headers"],
      },
      {
        heading: "Choosing the algorithm",
        body: "Fixed window counts requests per calendar minute. It is one INCR per request, but a client can send 100 at 12:00:59 and 100 more at 12:01:00, so 200 pass in two seconds. Sliding window log stores a timestamp per request (a Redis sorted set) and counts those in the last 60 seconds. It is exact but uses memory for every request. Sliding window counter blends the current and previous fixed windows by how far into the current window you are. It is nearly exact, cheap, and the usual choice for per-minute quotas. Token bucket refills tokens at a steady rate up to a capacity and spends one per request. It allows short bursts while enforcing an average rate, which suits APIs with spiky but legitimate clients.\n\nA good interview answer names the trade-off: token bucket for burst-friendly limits, sliding window counter for smooth quotas, and the log only for low-volume, strict limits.",
        visual: {
          type: "compare",
          title: "Rate limiting algorithms at a glance",
          columns: [
            { title: "Fixed window", points: ["1 counter per window", "Very cheap", "2x burst at window edges", "Simple quotas"] },
            { title: "Sliding window counter", points: ["2 counters, weighted", "Nearly exact", "Smooth limits", "Per-minute API quotas"] },
            { title: "Token bucket", points: ["Tokens plus last refill time", "Allows bursts up to capacity", "Enforces average rate", "Spiky but fair clients"] },
          ],
        },
      },
      {
        heading: "Shared counters in Redis without races",
        body: "The naive version reads the count, checks it in the app, then writes the new value. Two servers can both read 99, both decide it is fine, and both write 100: the limit is exceeded. The fix is to make check and update one atomic step inside Redis.\n\nFor a fixed window, INCR is atomic: it returns the new count, and the app compares that. For anything more complex, such as a token bucket that reads tokens, refills based on time, and decrements, use a Lua script. Redis runs each script to completion without interleaving other commands, so the whole decision is atomic. Load the script once with SCRIPT LOAD and call it by hash with EVALSHA.\n\nIn Redis Cluster, all keys used in one script must be in the same hash slot, so keep each client's bucket in one key, or use a hash tag such as rl:{user42}.",
        visual: {
          type: "sequence",
          title: "The race that atomic scripts prevent",
          actors: ["Server 1", "Redis", "Server 2"],
          messages: [
            { from: 0, to: 1, label: "GET count: 99" },
            { from: 2, to: 1, label: "GET count: 99" },
            { from: 0, to: 1, label: "SET 100 (allowed)" },
            { from: 2, to: 1, label: "SET 100 (also allowed: 101st request slips in)" },
            { from: 0, to: 1, label: "Fix: one EVALSHA does check and update" },
          ],
        },
      },
      {
        heading: "Failures, hot keys and multiple regions",
        body: "Decide in advance what happens when Redis is slow or down. Fail open (allow requests) protects availability and suits most APIs. Fail closed (reject) suits abuse-sensitive endpoints such as login or SMS sending, where letting everything through would be costly. Either way, give the Redis call a short timeout, around 5 to 20 ms, and wrap it in a circuit breaker so a sick Redis does not slow every request.\n\nOne very busy client puts all its load on one Redis key and therefore one shard. Spread hot clients by giving them a small local allowance per server, or split their bucket across a few sub-keys.\n\nAcross regions, a global counter would add a cross-region round trip to every request. Usually each region enforces its own share of the limit (for example half each in two regions), or regions sync counts asynchronously and accept a small overshoot.",
      },
      {
        heading: "Latency and accuracy trade-offs",
        body: "Calling Redis on every request costs a network round trip, often 0.3 to 1 ms in the same zone. At very high traffic, or when that is too slow, limiters trade accuracy for speed.\n\nLocal pre-check: each server keeps an in-memory token bucket set to its share of the limit, for example the global limit divided by the number of servers, and only syncs with Redis periodically. This adds no network hop, but the global limit can be exceeded briefly when traffic is uneven.\n\nBatching: a server takes a batch of tokens from Redis at once (say 10) and spends them locally, cutting Redis calls by ten times at the cost of a little unfairness.\n\nWhere to enforce matters too. An API gateway or edge (Envoy's global rate limit service, NGINX limit_req, a CDN rule) stops bad traffic before it costs you anything; per-service limits protect individual backends. Many systems use both: coarse limits at the edge, precise ones in the service.",
        bullets: ["Exact: one Redis call per request", "Faster: local buckets synced periodically", "Fewer calls: reserve tokens in batches", "Edge limits for abuse, service limits for fairness"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "One request through the limiter",
        steps: [
          { label: "Identify client", detail: "API key, user ID or IP" },
          { label: "Match rules", detail: "From config cached in memory" },
          { label: "Atomic check in Redis", detail: "Lua script, 5 ms timeout" },
          { label: "Allowed?", detail: "Forward and add remaining-count headers" },
          { label: "Denied?", detail: "429 with Retry-After" },
          { label: "Redis down?", detail: "Fail open or closed per rule" },
        ],
      },
    ],
    examples: [
      {
        title: "A token bucket as a Redis Lua script",
        explanation: "Each client has a hash with its current tokens and the last refill time. Step 1: read both fields. Step 2: add tokens for the time elapsed, up to the capacity. Step 3: if at least one token remains, take it and allow the request. Step 4: save the state and set an expiry so idle clients disappear. Using Redis's own clock (TIME) avoids clock differences between app servers; Redis 7 replicates scripts by their effects, so this is safe. Call it with EVALSHA sha 1 rl:{user42} 10 100 for 10 tokens per second and a burst of 100.",
        code: {
          lang: "lua",
          code: "local rate, cap = tonumber(ARGV[1]), tonumber(ARGV[2])\nlocal t = redis.call('TIME')\nlocal now = t[1] * 1000 + math.floor(t[2] / 1000)\nlocal s = redis.call('HMGET', KEYS[1], 'tokens', 'ts')\nlocal tokens = tonumber(s[1]) or cap\nlocal ts = tonumber(s[2]) or now\ntokens = math.min(cap, tokens + (now - ts) / 1000 * rate)\nlocal allowed = 0\nif tokens >= 1 then tokens = tokens - 1; allowed = 1 end\nredis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)\nredis.call('PEXPIRE', KEYS[1], math.ceil(cap / rate * 1000))\nreturn {allowed, math.floor(tokens)}",
        },
      },
      {
        title: "Sizing the Redis tier",
        explanation: "Assume 50,000 API requests per second at peak and 5 million active API keys. Step 1: each request is one EVALSHA, so Redis must handle 50,000 script calls per second; a single Redis node can typically do roughly 50,000 to 100,000 simple script calls per second, so use a cluster of 3 to 6 primaries for headroom. Step 2: memory: each bucket is a small hash of about 100 bytes, so 5 million keys need about 500 MB, tiny for Redis. Step 3: add one replica per primary so a node failure does not reset everyone's counters. Step 4: latency budget: about 0.5 ms per check in the same zone, within the 2 ms target.",
      },
    ],
    cheatSheet: [
      "Return 429 Too Many Requests with Retry-After; expose remaining and reset in headers",
      "Fixed window: INCR plus EXPIRE; allows up to 2x the limit at window edges",
      "Sliding window counter: prev x (1 - elapsed/window) + current",
      "Token bucket: refill at rate r up to capacity b; allows bursts of b",
      "Check and update atomically: INCR or one Lua script, never GET then SET",
      "In Redis Cluster, keep each script's keys in one slot with a {hash tag}",
      "Short Redis timeout plus fail open (most APIs) or fail closed (login, SMS)",
    ],
    quiz: [
      {
        q: "A limit is 100 per minute with a fixed window. What is the most a client can send within 2 seconds around a window boundary?",
        options: ["100", "101", "150", "200"],
        answer: 3,
        why: "100 at the end of one window and 100 at the start of the next can all pass.",
      },
      {
        q: "Why use a Lua script for a token bucket in Redis?",
        options: ["Lua is faster than C", "The read, refill and decrement run atomically, so concurrent requests cannot race", "Redis cannot store numbers otherwise", "It makes the key expire"],
        answer: 1,
        why: "Redis runs a script without interleaving other commands, making the whole decision one atomic step.",
      },
      {
        q: "Redis is unreachable. Which endpoint should most likely fail closed?",
        options: ["Sending one-time SMS codes", "Reading public product pages", "Fetching a user's own profile", "Health checks"],
        answer: 0,
        why: "Unlimited SMS sends cost real money and enable abuse, so rejecting is safer there.",
      },
      {
        q: "What does a local, per-server token bucket trade away compared with a Redis check on every request?",
        options: ["Availability", "Durability of user data", "Exact global accuracy, in exchange for zero network latency", "The ability to return 429"],
        answer: 2,
        why: "Each server only sees its own traffic, so the global limit can be briefly exceeded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A sliding window counter has a limit of 100 per minute. The previous minute had 80 requests, and 20 seconds into the current minute there have been 50. Is the next request allowed?",
        hint: "Weight the previous window by the share of it still inside the last 60 seconds.",
        solution: "Weight = 1 - 20/60 = 0.667\nEstimate = 80 x 0.667 + 50 = 53.3 + 50 = 103.3\n103 >= 100, so the request is rejected with 429.",
      },
      {
        level: "medium",
        task: "Write a Python function using redis-py that enforces a fixed-window limit of 100 per minute per user, safe under concurrency, and returns (allowed, remaining).",
        hint: "Use INCR and set EXPIRE on the first increment, in one pipeline transaction.",
        solution: "import time, redis\nr = redis.Redis()\n\ndef allow(user_id, limit=100, window=60):\n    key = f\"rl:{user_id}:{int(time.time()) // window}\"\n    pipe = r.pipeline()          # MULTI/EXEC transaction\n    pipe.incr(key)\n    pipe.expire(key, window, nx=True)  # only set if no TTL (Redis 7+)\n    count, _ = pipe.execute()\n    return count <= limit, max(0, limit - count)",
      },
      {
        level: "hard",
        task: "Design rate limiting for a public API running in 3 regions with a global limit of 3,000 requests per minute per API key. Explain how you keep latency low and how much overshoot you allow.",
        hint: "Avoid a cross-region call per request; split the limit and rebalance.",
        solution: "Each region enforces a local share in its own Redis: start at 1,000/min.\nEvery 5-10 s, regions publish their usage per key to each other\n(async, for example via a small Kafka topic or a global table).\nShares are rebalanced toward where the key's traffic actually is\n(e.g. 2,400 / 400 / 200), with a floor so a sudden shift still works.\nOvershoot is bounded by one sync interval of traffic, often a few %.\nLatency: one local Redis call (<1 ms); no cross-region hop.\nFail open per region if its Redis is down, with an alert.",
      },
    ],
    faq: [
      { q: "What is the difference between rate limiting and throttling?", a: "People often use them as synonyms. Strictly, rate limiting rejects requests over the limit, while throttling slows them down, for example by queuing or delaying them." },
      { q: "Which HTTP headers should a rate limiter return?", a: "Return 429 with Retry-After when rejecting. Many APIs also send X-RateLimit-Limit, X-RateLimit-Remaining and X-RateLimit-Reset; an IETF draft standardises similar RateLimit headers." },
      { q: "Should I rate limit by IP address?", a: "Only as a fallback for unauthenticated traffic. Many users can share one IP behind a corporate or mobile network, and attackers can rotate IPs, so limit by API key or user when you can." },
    ],
  },

  "case-studies-core/key-value-store": {
    plain: [
      "A key-value store is a giant dictionary spread over many machines. You give it a key, like cart:42, and a value, like the contents of a shopping cart, and later you ask for the value by its key. Amazon's Dynamo paper described this design, and Cassandra, Riak and DynamoDB all borrow its ideas.",
      "Because there is too much data for one machine, the keys are spread across many nodes using consistent hashing, so adding a machine only moves a small part of the data. Each key is also copied to several nodes, usually three, so a dead machine loses nothing.",
      "The design favours staying available. Any node can accept a request and pass it to the right replicas. A write succeeds once enough replicas confirm it, and a read asks enough replicas to be likely to see the newest value. You tune how many with three numbers: N copies, W write confirmations and R read replies.",
      "Machines fail all the time at this scale, so repair is built in. Writes for a down node are held by a neighbour and handed over later. Background jobs compare replicas and fix differences. And when two writes clash, the store keeps version information to decide what to do.",
    ],
    deepDive: [
      {
        heading: "Requirements and API",
        body: "Clarify the shape of the data and the traffic first. Typical answers: small values (up to about 1 MB, usually a few KB), simple operations get(key), put(key, value) and delete(key), no range queries or joins, very high scale (say 100,000 operations per second and tens of terabytes), single-digit millisecond latency, and above all high availability: writes must keep working when nodes or even a zone fail.\n\nThat last point is a choice. Saying we prefer availability over strong consistency means the store is eventually consistent by default, with quorum settings to get closer to strong consistency when a use case needs it.\n\nThe Dynamo-style API adds a context: get returns the value plus an opaque version context, and put takes that context back. This lets the store know which version the client was updating, which is how it detects concurrent writes.",
        bullets: ["get(key) returns value(s) and a version context", "put(key, value, context)", "Small values, no range queries", "Availability first, consistency tunable"],
      },
      {
        heading: "Partitioning and replica placement",
        body: "Keys are hashed onto a ring, and each physical node owns many virtual node positions so load stays even and a new node takes small slices from all the others. A key's coordinator is the first node clockwise from its hash, and its replicas are the next N distinct physical nodes clockwise. This ordered list is the key's preference list.\n\nTwo details matter. Skip virtual nodes that belong to a physical node already in the list, or two replicas could land on the same machine. And make placement zone-aware: pick replicas so that the N copies sit in different availability zones or racks, as Cassandra's NetworkTopologyStrategy does. Then losing a whole zone still leaves N - 1 copies.\n\nEvery node knows the ring through gossip, so any node can act as coordinator, or a smart client can send requests straight to a replica and save a hop.",
        visual: {
          type: "flow",
          title: "Finding the replicas for a key",
          steps: [
            { label: "hash(key)", detail: "Position on the ring" },
            { label: "Walk clockwise", detail: "Visit virtual nodes in order" },
            { label: "Skip duplicates", detail: "Ignore nodes already chosen" },
            { label: "Spread across zones", detail: "One replica per zone where possible" },
            { label: "Preference list", detail: "First N distinct nodes hold the key" },
          ],
        },
      },
      {
        heading: "Inside one storage node",
        body: "Each node stores its share with an LSM-tree engine, which suits the write-heavy load. A write is appended to a commit log on disk for durability, inserted into an in-memory memtable, and acknowledged. When the memtable fills, it is flushed as an immutable sorted file (SSTable). Background compaction merges files and drops overwritten values and expired tombstones.\n\nA read checks the memtable, then SSTables from newest to oldest, using per-file Bloom filters to skip files that cannot contain the key. A row cache or page cache keeps hot keys fast.\n\nDeletes are tombstones, not immediate removals, because a replica that was down during the delete must not bring the old value back later. Tombstones are kept for a grace period (Cassandra's gc_grace_seconds defaults to 10 days) that must be longer than the time it takes to repair a failed replica.",
      },
      {
        heading: "Failure detection, hinted handoff and repair",
        body: "Nodes detect failures through gossip: each node regularly exchanges heartbeat counters with a few random peers, and a node whose counter stops rising is suspected down. Cassandra uses a phi accrual detector, which turns heartbeat delays into a suspicion level rather than a fixed timeout.\n\nFor short failures, the store uses a sloppy quorum with hinted handoff. If a replica is down, the coordinator writes to the next healthy node on the ring with a hint saying this belongs to node C. When C returns, the hint is replayed to it. Writes stay available, but during that time W + R > N no longer guarantees overlap.\n\nFor long failures or lost hints, anti-entropy repair compares replicas. Each replica builds a Merkle tree over its key ranges; comparing root hashes, then only the subtrees that differ, finds mismatched keys while transferring very little data.",
        visual: {
          type: "sequence",
          title: "Hinted handoff while a replica is down",
          actors: ["Coordinator", "Replica B", "Replica C (down)", "Node E"],
          messages: [
            { from: 0, to: 1, label: "Write k=v" },
            { from: 0, to: 2, label: "Write k=v (no reply)" },
            { from: 0, to: 3, label: "Write k=v with hint: for C" },
            { from: 3, to: 0, label: "Ack: W=2 reached" },
            { from: 3, to: 2, label: "C is back: replay hinted write" },
          ],
        },
      },
      {
        heading: "Resolving conflicting writes",
        body: "With sloppy quorums and concurrent clients, two replicas can accept different values for the same key. The store must decide which value survives.\n\nLast-write-wins (LWW) attaches a timestamp to each write and keeps the highest. It is simple and is what Cassandra does per column, but concurrent writes silently lose one side, and clock skew between nodes can make an older write win.\n\nVector clocks record a counter per node that has updated the value. If one clock is greater than or equal to the other in every entry, it is a newer version and replaces the older one. If neither dominates, the writes were concurrent, and the store keeps both as siblings and returns both on the next read. The application merges them: the original Dynamo merged shopping carts by taking the union of items. Riak works this way. CRDTs, data types like counters and sets that merge automatically, avoid hand-written merge code.",
        bullets: ["LWW: simple, can drop concurrent writes", "Vector clocks: detect concurrency, return siblings", "CRDTs: merge automatically for counters and sets"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "The main design decisions",
        root: "Distributed KV store",
        children: [
          { label: "Partitioning", children: ["Consistent hashing", "Virtual nodes"] },
          { label: "Replication", children: ["N copies", "Zone-aware placement"] },
          { label: "Consistency", children: ["Tunable W and R", "W + R > N for overlap"] },
          { label: "Failure handling", children: ["Gossip detection", "Hinted handoff", "Merkle tree repair"] },
          { label: "Storage engine", children: ["Commit log", "LSM tree", "Tombstones"] },
          { label: "Conflicts", children: ["Last-write-wins", "Vector clocks", "CRDTs"] },
        ],
      },
    ],
    examples: [
      {
        title: "Sizing the cluster",
        explanation: "Requirements: 20 TB of live data, replication factor 3, 200,000 operations per second at peak. Step 1: raw storage is 20 TB x 3 = 60 TB. Step 2: LSM trees need room for compaction, so plan to fill disks only to about 50%: 120 TB of disk. Step 3: with 4 TB of SSD per node, that is 30 nodes. Step 4: check throughput: 200,000 ops/s over 30 nodes is about 6,700 per node, and because each write touches 3 replicas, about 20,000 replica writes per node at most, which a modern node handles. Step 5: place 10 nodes in each of 3 zones so every key has one copy per zone.",
      },
      {
        title: "Detecting a conflict with vector clocks",
        explanation: "Step 1: a client writes cart = [book] through node A: clock {A:1}. Step 2: a client reads it and adds a pen through node A: {A:2}, which dominates {A:1}, so it replaces it. Step 3: a network split happens. One client adds a mug via A: {A:3}. Another, holding the {A:2} version, adds a lamp via B: {A:2, B:1}. Step 4: compare {A:3} and {A:2, B:1}: A is higher in the first, B in the second, so neither dominates. Step 5: the next read returns both siblings. Step 6: the app merges them into [book, pen, mug, lamp] and writes back with clock {A:3, B:1}, which dominates both.",
      },
    ],
    cheatSheet: [
      "API: get(key) returns value plus version context; put(key, value, context)",
      "Replicas: next N distinct physical nodes clockwise, spread across zones",
      "N=3, W=2, R=2 overlaps and survives one node down",
      "Hinted handoff keeps writes available; sloppy quorums weaken the overlap guarantee",
      "Merkle trees find differing key ranges while transferring very little data",
      "Tombstone grace period must exceed your repair interval (Cassandra default 10 days)",
      "Vector clocks detect concurrent writes; LWW silently drops one of them",
    ],
    quiz: [
      {
        q: "Why must replica placement skip virtual nodes of a physical node already chosen?",
        options: ["To make hashing faster", "So two copies of a key never end up on the same machine", "To reduce memory", "Because gossip requires it"],
        answer: 1,
        why: "Replicas on the same machine would all be lost together.",
      },
      {
        q: "Vector clocks {A:3} and {A:2, B:1} are compared. What is the result?",
        options: ["{A:3} is newer", "{A:2, B:1} is newer", "They are equal", "They are concurrent, so both are kept as siblings"],
        answer: 3,
        why: "Each clock is ahead in a different entry, so neither happened before the other.",
      },
      {
        q: "Why are deletes stored as tombstones instead of removing the value immediately?",
        options: ["So a replica that missed the delete cannot bring the old value back during repair", "To save disk space", "To make reads faster", "Because SSTables are encrypted"],
        answer: 0,
        why: "Without a tombstone, repair would see the old value on one replica and copy it back.",
      },
      {
        q: "What do Merkle trees make cheap in anti-entropy repair?",
        options: ["Electing a leader", "Encrypting data", "Finding which key ranges differ between replicas", "Choosing W and R"],
        answer: 2,
        why: "Comparing hashes top-down narrows to the differing ranges without sending all data.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "With N = 3, give W and R settings for: (a) fastest writes, (b) fastest reads, (c) a balanced setting that still overlaps. Say what each tolerates.",
        hint: "Overlap needs W + R > N.",
        solution: "(a) W=1, R=3: writes need 1 ack; reads fail if any replica is down.\n(b) W=3, R=1: reads hit 1 replica; writes fail if any replica is down.\n(c) W=2, R=2: both survive one replica down.",
      },
      {
        level: "medium",
        task: "Write a Python function compare(vc1, vc2) for vector clocks stored as dicts. Return 'before', 'after', 'equal' or 'concurrent'.",
        hint: "Check whether every entry of one is <= the other, treating missing entries as 0.",
        solution: "def compare(a, b):\n    keys = a.keys() | b.keys()\n    le = all(a.get(k, 0) <= b.get(k, 0) for k in keys)\n    ge = all(a.get(k, 0) >= b.get(k, 0) for k in keys)\n    if le and ge: return 'equal'\n    if le: return 'before'\n    if ge: return 'after'\n    return 'concurrent'",
      },
      {
        level: "hard",
        task: "A node is replaced after its disk died. Describe, step by step, how it gets its data back, and how the cluster stays available meanwhile.",
        hint: "Combine hinted handoff (short outages) with streaming and Merkle-tree repair (long ones).",
        solution: "1. While it is down, coordinators use the other replicas and store\n   hints on neighbours; reads use the remaining replicas (R=2 of 3).\n2. The new node joins with the same ring tokens (replace mode).\n3. It streams its key ranges from the surviving replicas.\n4. Hints held by neighbours are replayed to it.\n5. An anti-entropy repair compares Merkle trees with other replicas\n   and fixes any remaining differences.\n6. Only then is it marked fully healthy and used for reads at R=1.",
      },
    ],
    faq: [
      { q: "Is Redis a distributed key-value store like this?", a: "Redis Cluster shards keys across nodes and replicates them, but it uses a leader per shard and asynchronous replication, not Dynamo-style quorums. It favours speed and simplicity over this kind of tunable availability." },
      { q: "What is the difference between DynamoDB and the Dynamo paper?", a: "The 2007 Dynamo paper described Amazon's internal leaderless store with vector clocks and sloppy quorums. DynamoDB is a managed service that shares the key-value model but uses a different design internally, with leader-based replication per partition." },
      { q: "Why not just use consistent hashing without virtual nodes?", a: "With one position per node, the ring slices are uneven and a new or failed node shifts load onto only one neighbour. Many virtual positions per node spread both data and rebalancing work evenly." },
    ],
  },

  "case-studies-core/notification-system": {
    plain: [
      "A notification system sends messages to users on behalf of the rest of the product: your order shipped, someone replied to you, here is your login code. It can send them through several channels: push notifications to a phone, email, SMS text messages, and sometimes in-app messages.",
      "Other services do not send these messages themselves. They tell the notification system what happened and who should know. The notification system then decides which channels to use, fills in the message text from a template, and hands it to an outside provider such as Apple's or Google's push service, an email service or an SMS service.",
      "Outside providers are slow sometimes and fail sometimes. So the system puts messages in queues and sends them in the background. If a send fails, it tries again later. The service that asked for the notification gets a quick OK and moves on.",
      "It also protects users. It respects their settings (no marketing emails, no pushes at night), avoids sending the same message twice, and limits how many messages one person can get. A noisy notification system makes people turn off notifications entirely, which hurts the product.",
    ],
    deepDive: [
      {
        heading: "Requirements and volume estimate",
        body: "Clarify channels (push on iOS and Android, email, SMS, in-app), message types (transactional like receipts and login codes, versus marketing), latency (login codes within seconds, digests can wait), and whether broadcasts to all users are needed.\n\nThen estimate. Say 50 million daily users. Push: 10 per user per day is 500 million a day, about 6,000 per second on average. Email: 20 million a day, about 230 per second. SMS: 1 million a day, about 12 per second, but SMS is the expensive one, often a few cents each, so it gets strict limits. Plan for peaks of 5 to 10 times the average, plus marketing broadcasts that can send tens of millions of messages in an hour.\n\nThese numbers say: push needs horizontally scaled workers, SMS needs cost controls more than throughput, and broadcasts need their own path so they never delay login codes.",
      },
      {
        heading: "API and data model",
        body: "The main API is asynchronous: POST /v1/notifications with user ID, type, data and a dedupe key returns 202 Accepted with a notification ID. Add a bulk endpoint for many users and a scheduled send time for reminders.\n\nCore tables: templates (type, channel, locale, subject and body with placeholders, version), user_preferences (user, type or category, channel, enabled, quiet hours and time zone), devices (user, platform, push token, last seen), contact info (verified email and phone), and a notification log (ID, user, type, channel, status, provider message ID, timestamps).\n\nThe notification log is large and append-heavy, so it fits a wide-column store or a partitioned table keyed by user and time; it powers the in-app inbox, support lookups and analytics. Preferences and devices are read on every send, so cache them, with short TTLs, in Redis.",
        bullets: ["POST /v1/notifications returns 202 with an ID", "Templates per type, channel and language", "Preferences per category and channel, with quiet hours", "Device tokens per app install"],
      },
      {
        heading: "Fanning out large broadcasts",
        body: "A single event can target millions of people: a new feature announcement, a sports score, a breaking news alert. You cannot handle that in one request.\n\nInstead, the API stores a campaign record and returns immediately. A fan-out job pages through the target segment (for example 1,000 user IDs at a time), and for each page enqueues one batch message. Workers expand each batch: load preferences and devices for those users, render templates, and enqueue per-channel sends. FCM and APNs both accept many concurrent requests over HTTP/2 connections, so push workers keep long-lived connections open and send in parallel.\n\nBroadcasts run on separate, lower-priority queues and are paced, for example a few hundred thousand sends per minute, so they cannot starve transactional messages, overload providers, or send a wave of users to your servers all at once when they tap the notification.",
        visual: {
          type: "flow",
          title: "Broadcast to 20 million users",
          steps: [
            { label: "Create campaign", detail: "API stores it, returns 202" },
            { label: "Fan-out job", detail: "Pages the segment, 1,000 users per batch" },
            { label: "Batch queue", detail: "Low priority, paced" },
            { label: "Expand workers", detail: "Preferences, devices, templates" },
            { label: "Channel queues", detail: "Push, email, in-app" },
            { label: "Senders", detail: "Parallel HTTP/2 to FCM and APNs" },
          ],
        },
      },
      {
        heading: "Delivery, retries and provider errors",
        body: "Workers must treat provider responses differently. Temporary errors (timeouts, 429, 5xx) are retried with exponential backoff and jitter, a few times, then moved to a dead-letter queue for inspection. Permanent errors are not retried. An APNs response of 410 Unregistered, or FCM's UNREGISTERED error, means the app was uninstalled: delete that device token so you stop paying to send to it. An invalid email address or a hard bounce should mark the address as undeliverable.\n\nDelivery is at least once, so keep sends idempotent: record the notification ID before or with the send, and pass it to providers that support idempotency.\n\nTrack outcomes through provider callbacks: email services post delivered, bounced, opened and clicked events to a webhook, and SMS providers send status callbacks. For critical channels, configure a second provider and fail over when the first one's error rate jumps.",
      },
      {
        heading: "Preferences, quiet hours, limits and dedupe",
        body: "Before any send, a pipeline of checks runs. Is this category allowed for this user and channel? Marketing needs explicit opt-in in many countries, while security alerts usually cannot be turned off. Is it quiet hours in the user's time zone? If so, hold non-urgent messages until morning. Has the user hit a frequency cap, such as at most 3 marketing pushes a day? Has this exact event already been sent?\n\nDeduplication uses the dedupe key from the producer, such as order_shipped:o-77, combined with the user and channel. A Redis SET with NX and an expiry of a day or so records it atomically; a second request with the same key is dropped.\n\nPriority separates traffic: one-time passwords and security alerts go on a high-priority queue with dedicated workers, ahead of social and marketing messages. Some systems also collapse bursts into a digest, like 5 people liked your photo.",
        visual: {
          type: "flow",
          title: "Checks before a message is sent",
          steps: [
            { label: "Dedupe", detail: "SET NX on dedupe key" },
            { label: "Preferences", detail: "Category and channel allowed?" },
            { label: "Quiet hours", detail: "Hold non-urgent until morning" },
            { label: "Frequency cap", detail: "Per user, per category" },
            { label: "Render and enqueue", detail: "Template, by priority" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Transactional vs marketing notifications",
        columns: [
          { title: "Transactional", points: ["Login codes, receipts, alerts", "Seconds matter", "High-priority queue", "Usually cannot be fully disabled"] },
          { title: "Marketing", points: ["Promotions, digests, announcements", "Minutes or hours are fine", "Low-priority, paced queue", "Opt-in, caps and quiet hours apply"] },
        ],
      },
    ],
    examples: [
      {
        title: "Atomic dedupe with Redis",
        explanation: "The order service retries its notify call after a timeout, so the notification service receives order_shipped:o-77 twice for user 42. Step 1: the first request runs SET with NX (only if not exists) and EX 86400; Redis replies OK, so the send proceeds. Step 2: the second request runs the same command; Redis replies nil because the key exists, so the service returns 202 with the original notification ID and sends nothing. Step 3: after a day the key expires on its own. Include the channel in the key so the same event can still go out by both push and email.",
        code: {
          lang: "bash",
          code: "redis-cli SET dedupe:42:push:order_shipped:o-77 n-9001 NX EX 86400\n# OK   -> first time: send it\nredis-cli SET dedupe:42:push:order_shipped:o-77 n-9002 NX EX 86400\n# (nil) -> duplicate: skip\nredis-cli GET dedupe:42:push:order_shipped:o-77\n# \"n-9001\" -> return the original notification ID",
        },
      },
      {
        title: "Handling a dead device token",
        explanation: "A user uninstalled the app last month. Step 1: an event triggers a push to their iPhone token. Step 2: the push worker sends it to APNs, which answers 410 with reason Unregistered. Step 3: the worker does not retry; it deletes the token from the devices table and logs the send as failed: unregistered. Step 4: if the user has no other devices and the message is important, the system falls back to email. Over time this cleanup keeps send volume, cost and error rates honest.",
      },
    ],
    cheatSheet: [
      "Return 202 Accepted; send asynchronously from per-channel queues",
      "Separate high-priority queues for OTPs and security alerts",
      "Retry 429, 5xx and timeouts with backoff, then dead-letter",
      "APNs 410 Unregistered or FCM UNREGISTERED: delete the device token",
      "Dedupe: SET key NX EX 86400 on user + channel + dedupe key",
      "Respect preferences, quiet hours in the user's time zone, and frequency caps",
      "Pace broadcasts on their own low-priority path",
      "Track delivered, bounced, opened via provider webhooks",
    ],
    quiz: [
      {
        q: "Why should login codes and marketing pushes use different queues?",
        options: ["Marketing messages are encrypted", "Providers require it", "A large marketing backlog would otherwise delay time-critical codes", "Queues cannot hold more than one type"],
        answer: 2,
        why: "Priority isolation keeps urgent messages fast whatever else is queued.",
      },
      {
        q: "APNs returns 410 Unregistered for a device token. What should the worker do?",
        options: ["Remove the token and stop sending to it", "Retry with exponential backoff", "Send the same push via FCM", "Ignore it"],
        answer: 0,
        why: "The app is no longer installed there, so retries only waste resources.",
      },
      {
        q: "Which Redis command atomically records a dedupe key only if it is new, with an expiry?",
        options: ["GET then SET", "INCR key", "EXPIRE key 86400", "SET key value NX EX 86400"],
        answer: 3,
        why: "NX makes the set conditional and EX adds the expiry, in one atomic command.",
      },
      {
        q: "With 50 million daily users each receiving 10 pushes a day, what is the average push rate?",
        options: ["About 600 per second", "About 6,000 per second", "About 60,000 per second", "About 600,000 per second"],
        answer: 1,
        why: "500 million per day divided by 86,400 seconds is roughly 5,800 per second.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the checks, in order, that a notification should pass before it is sent, and say what happens when each check fails.",
        hint: "Think duplicates, user choices, time of day and volume.",
        solution: "1. Dedupe: already sent? drop it.\n2. Preferences: category or channel disabled? drop for that channel.\n3. Quiet hours: non-urgent? delay until the window ends.\n4. Frequency cap: over the cap? drop or fold into a digest.\n5. Contact data: no valid token/email/phone? try another channel or drop.",
      },
      {
        level: "medium",
        task: "Design the notification log table so you can show a user's in-app inbox (newest first) and look up one notification by ID.",
        hint: "Partition by user for the inbox; add a separate lookup for IDs.",
        solution: "Wide-column table inbox_by_user:\n  PRIMARY KEY ((user_id), created_at, notification_id)\n  CLUSTERING ORDER BY (created_at DESC)\n  columns: type, channel, title, body, status, read_at\nLookup table notification_by_id:\n  PRIMARY KEY (notification_id) -> user_id, created_at\nWrite both on send; TTL old inbox rows (for example 90 days).",
      },
      {
        level: "hard",
        task: "Your SMS provider has an outage for 20 minutes and 30,000 login codes are queued. Design how the system behaves during and after the outage.",
        hint: "Login codes go stale quickly; consider failover, expiry and user experience.",
        solution: "Detect: error rate on provider A spikes; a circuit breaker opens.\nFail over: route SMS to provider B (pre-configured, tested monthly).\nIf no backup: offer other channels (email code, authenticator app).\nExpiry: each OTP message carries an expires_at (for example 5 min);\nworkers drop expired ones instead of sending stale codes later.\nRecovery: the breaker half-opens; drain the queue at the provider's\nrate limit, highest priority first; users who retried get only the\nnewest code (dedupe by user + purpose, keep latest).",
      },
    ],
    faq: [
      { q: "What is the difference between FCM and APNs?", a: "APNs is Apple's push service for iOS and macOS devices. FCM (Firebase Cloud Messaging) is Google's service for Android, and it can also forward to iOS through APNs. Most systems talk to both, or use FCM for both platforms." },
      { q: "Should I build this or use a service?", a: "Services such as Amazon SNS, Firebase, OneSignal or Braze handle channels and providers for you. Building your own makes sense when you need custom preferences, routing and analytics at a scale where the service cost is significant." },
      { q: "How do I avoid sending notifications at night?", a: "Store each user's time zone and quiet hours, and have the pipeline delay non-urgent messages that fall in that window until it ends. Urgent messages like security alerts usually bypass quiet hours." },
    ],
  },

  "case-studies-core/typeahead": {
    plain: [
      "Typeahead, or autocomplete, is the list of suggestions that appears under a search box while you type. Type 'how to b' and you may see 'how to boil an egg'. It saves typing, fixes spelling and guides people toward searches that will find something.",
      "The hard part is speed. A new request goes out on nearly every keystroke, and the suggestions must appear within about 100 milliseconds or the feature feels laggy. That is far less time than a normal search takes, so the system cannot do much work per request.",
      "The trick is to do the heavy work ahead of time. A background job counts which searches are popular, builds a prefix tree (called a trie) from them, and stores the best few suggestions for every prefix right in the tree. Answering a request is then just a quick lookup in memory.",
      "Popular searches change, especially during news events, so the tree is rebuilt regularly and swapped in all at once. Caches in the browser, at the edge, and on the servers handle the very common short prefixes so most requests never reach the core service.",
    ],
    deepDive: [
      {
        heading: "Requirements and the latency budget",
        body: "Clarify: suggestions are prefix matches of past popular queries; show 5 to 10; support many languages; filter offensive terms; personalisation and spelling correction are nice to have. The key non-functional requirement is latency: under about 100 ms from keystroke to suggestions on screen.\n\nSplit that budget. Network round trip on mobile might take 30 to 60 ms, rendering about 10 ms, so the server has maybe 10 to 20 ms. That rules out querying a database or scanning anything at request time.\n\nEstimate volume too. With 10 million daily users doing 10 searches each, and requests on about 6 of the keystrokes per search, that is 600 million requests a day: around 7,000 per second on average and perhaps 20,000 at peak. Reads massively dominate; the index only changes when it is rebuilt.",
        bullets: ["Server budget: about 10 to 20 ms", "Reads only on the hot path; writes happen in batch", "Top 5 to 10 suggestions per prefix"],
      },
      {
        heading: "Fitting the trie in memory",
        body: "A plain trie with one node per character is large. Three techniques keep it manageable. First, only include queries that were searched at least a few times in the period; the long tail of one-off queries is huge and rarely useful as a suggestion. Second, compress chains of single-child nodes into one node holding a string (a radix tree), which cuts the node count dramatically. Third, store the top-k list at each node as small integer IDs pointing into a table of query strings, not as copies of the strings.\n\nRough maths: 50 million distinct queries kept, about 4 to 5 nodes each after compression, so a few hundred million nodes; at tens of bytes each, that is on the order of tens of GB. That fits on a large-memory server, so many systems simply replicate the whole trie on every suggestion server. When it does not fit, shard by prefix, choosing split points by traffic rather than alphabet, because far more queries start with s than with x.",
      },
      {
        heading: "Ranking suggestions",
        body: "Raw all-time counts make suggestions stale: last year's big event would stay on top forever. A common fix is time decay: each day's count is multiplied by a decay factor, so score = sum of count_day x 0.9 ^ (days ago), for example. Recent popularity weighs most, and old spikes fade.\n\nOther signals refine the order: freshness (trending queries from the last hour), location (people in Mumbai and London type the same prefix for different things), language, and personal history (your own past searches can be merged in on the client or by a small per-user lookup). Quality signals matter too: prefer queries that led to clicks, not ones people immediately rewrote.\n\nFiltering is part of ranking: remove offensive, dangerous or legally problematic suggestions with a blocklist and classifier at build time, with an emergency override list that is applied instantly at serve time.",
      },
      {
        heading: "The build pipeline",
        body: "Search logs flow into a log system such as Kafka and land in a data lake. A batch job (for example in Spark), daily or hourly, aggregates counts per normalised query (lower-cased, trimmed), applies decay and filters, and keeps queries above a threshold. A builder then creates the trie with top-k at every node, serialises it into a compact file, and stores it with a version number in object storage.\n\nSuggestion servers download the new version, load it into memory next to the old one, run a few sanity checks (does 'face' still suggest 'facebook'?), and then atomically switch a pointer. Requests in flight finish on the old trie; new ones use the new trie. Rolling back is just switching the pointer back.\n\nFor trending topics, a streaming job counts the last few minutes of queries and feeds a small trending overlay that the server merges with the main trie's results.",
        visual: {
          type: "cycle",
          title: "The index rebuild loop",
          steps: [
            { label: "Collect logs", detail: "Search events into Kafka and the lake" },
            { label: "Aggregate", detail: "Counts with decay, filters applied" },
            { label: "Build trie", detail: "Top-k per node, serialised with a version" },
            { label: "Validate", detail: "Size and sanity checks" },
            { label: "Swap in", detail: "Load beside the old one, flip a pointer" },
          ],
        },
      },
      {
        heading: "Caching at every layer",
        body: "Most typeahead traffic is for very short, very common prefixes, which makes caching extremely effective.\n\nIn the browser: debounce input (wait about 50 to 150 ms after a keystroke), cancel requests that are no longer needed with AbortController, cache responses per prefix for the session, and reuse earlier results: if 'syst' returned 10 items, the client can filter those locally for 'syste' while waiting for fresh results.\n\nAt the edge: responses for prefixes of one or two characters are identical for everyone in a region, so a CDN can cache them for a few minutes with a Cache-Control max-age. Personalised results should not be CDN-cached, or must be cached per user.\n\nOn the servers: a small in-process LRU cache of hot prefixes avoids even the trie walk. Together these layers mean the trie servers see only a fraction of keystrokes.",
        visual: {
          type: "layers",
          title: "Where a suggestion request is answered",
          layers: [
            { label: "Browser", detail: "Debounce, session cache, local filtering" },
            { label: "CDN edge", detail: "Short, non-personal prefixes, cached minutes" },
            { label: "Suggestion server cache", detail: "In-process LRU of hot prefixes" },
            { label: "In-memory trie", detail: "Walk the prefix, read stored top-k" },
            { label: "Trending overlay", detail: "Merged recent spikes" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Custom trie service vs search engine suggester",
        columns: [
          { title: "Custom trie service", points: ["Top-k precomputed per node", "Very low, predictable latency", "Full control of ranking", "You build and run the pipeline"] },
          { title: "Search engine suggester", points: ["Elasticsearch completion suggester", "In-memory FST per shard", "Less code to maintain", "Ranking limited to its features"] },
        ],
      },
    ],
    examples: [
      {
        title: "Building a trie with top-k at each node",
        explanation: "This builder inserts each query with its score and, at every node along the way, keeps the k best queries for that prefix. Step 1: walk or create a node per character. Step 2: at each node, add the query and keep only the top k by score. Step 3: a lookup walks the prefix and returns the stored list, with no subtree search. Real builders sort queries first and use compact arrays, but the idea is the same.",
        code: {
          lang: "python",
          code: "import heapq\nclass Node:\n    def __init__(self): self.kids, self.top = {}, []\n\ndef build(queries, k=5):\n    root = Node()\n    for q, score in queries.items():\n        node = root\n        for ch in q:\n            node = node.kids.setdefault(ch, Node())\n            node.top = heapq.nlargest(k, node.top + [(score, q)])\n    return root\n\ndef suggest(node, prefix):\n    for ch in prefix:\n        if (node := node.kids.get(ch)) is None: return []\n    return [q for _, q in node.top]",
        },
      },
      {
        title: "Time-decayed ranking in practice",
        explanation: "Two queries share the prefix 'world'. 'world cup final' got 1,000,000 searches 30 days ago and few since. 'world news today' gets 60,000 searches every day. Step 1: use decay 0.9 per day. Step 2: the old spike now counts 1,000,000 x 0.9^30, about 42,000. Step 3: the steady query's score is roughly 60,000 x (1 + 0.9 + 0.81 + ...), which approaches 60,000 / 0.1 = 600,000. Step 4: 'world news today' ranks first, as users expect. Tune the decay rate so real spikes rise within hours but fade within weeks.",
      },
    ],
    cheatSheet: [
      "Budget: about 100 ms end to end, about 10 to 20 ms on the server",
      "Store top-k at every trie node so a lookup is a walk of the prefix length",
      "Prune rare queries and compress single-child chains (radix tree)",
      "Rank with time decay: score = sum of daily counts x decay^age",
      "Rebuild offline, load beside the old trie, then flip a pointer",
      "Debounce 50 to 150 ms and cancel stale requests in the browser",
      "CDN-cache short non-personal prefixes; never CDN-cache personal results",
      "Shard by prefix using traffic-based split points, not the alphabet",
    ],
    quiz: [
      {
        q: "Why is top-k stored at each trie node rather than computed per request?",
        options: ["It saves memory", "It makes the trie easier to rebuild", "Computing it would mean searching the whole subtree on every keystroke", "Tries cannot be searched otherwise"],
        answer: 2,
        why: "Precomputing turns each request into a short walk instead of a subtree scan.",
      },
      {
        q: "Which change helps trending queries appear quickly without rebuilding the whole trie every minute?",
        options: ["A streaming job feeding a small trending overlay merged at serve time", "Increasing the CDN TTL", "Using all-time counts", "Removing debounce"],
        answer: 0,
        why: "A fast, small overlay covers recent spikes while the big trie rebuilds on a slower schedule.",
      },
      {
        q: "Why should trie shards be split by traffic rather than one shard per letter?",
        options: ["Letters cannot be hashed", "Tries require equal-size shards", "To support more languages", "Some starting letters get far more queries, so alphabetical shards would be uneven"],
        answer: 3,
        why: "Traffic-based split points balance load across servers.",
      },
      {
        q: "Which responses are safe to cache at a CDN?",
        options: ["Personalised suggestions for logged-in users", "Suggestions for short, non-personal prefixes", "All responses for a day", "None, CDNs cannot cache JSON"],
        answer: 1,
        why: "Non-personal results for common prefixes are the same for everyone in a region.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Estimate peak suggestion QPS for 50 million daily users, 4 searches each, 8 characters typed per search, with debounce cutting requests to half the keystrokes and peak at 3x average.",
        hint: "Requests per day, divide by 86,400, then apply the peak factor.",
        solution: "50M x 4 x 8 x 0.5 = 800M requests/day\n800M / 86,400 = about 9,300 per second average\nPeak: about 28,000 per second\n(before browser and CDN caches absorb a large share)",
      },
      {
        level: "medium",
        task: "Write browser JavaScript that debounces the input by 100 ms, cancels the previous request, and caches results per prefix.",
        hint: "Use setTimeout, clearTimeout, AbortController and a Map.",
        solution: "const cache = new Map(); let timer, ctrl;\ninput.addEventListener('input', () => {\n  clearTimeout(timer);\n  timer = setTimeout(async () => {\n    const q = input.value.trim().toLowerCase();\n    if (cache.has(q)) return render(cache.get(q));\n    ctrl?.abort(); ctrl = new AbortController();\n    const res = await fetch('/suggest?q=' + encodeURIComponent(q), { signal: ctrl.signal });\n    const items = await res.json(); cache.set(q, items); render(items);\n  }, 100);\n});",
      },
      {
        level: "hard",
        task: "A harmful suggestion is trending and legal asks for it to be removed within 5 minutes. The next trie rebuild is in 6 hours. Design the mechanism.",
        hint: "You need a serve-time filter that every server picks up quickly.",
        solution: "Keep a small blocklist (exact queries and patterns) in a config store\nsuch as etcd or a database, versioned and audited.\nEvery suggestion server watches it (or polls every 30 s) and applies it\nas a final filter on results, then fills the gap from the next-best item\n(store top-k+5 per node so there are spares).\nPurge CDN and server caches for affected prefixes.\nThe next rebuild also applies the blocklist so the entry disappears\nfrom the trie itself.",
      },
    ],
    faq: [
      { q: "Is a trie the only way to build autocomplete?", a: "No. Search engines offer prefix suggesters (Elasticsearch's completion suggester uses an in-memory finite state transducer), and smaller apps can use a sorted list with binary search or an indexed prefix query. Tries with precomputed top-k shine at very high traffic." },
      { q: "How do I add spelling correction to typeahead?", a: "A common approach is fuzzy prefix matching that allows one or two character edits (edit distance), tried only when exact prefixes return few results, because fuzzy search is much more expensive." },
      { q: "Should autocomplete be personalised?", a: "It helps, especially showing a user's own recent searches. Keep it a light layer: merge a short personal list with the global suggestions, and keep personal data out of shared caches." },
    ],
  },
};

export default extra;
