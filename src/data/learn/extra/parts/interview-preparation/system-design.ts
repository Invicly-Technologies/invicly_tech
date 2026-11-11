import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "system-design/sd-basics": {
    plain: [
      "A system design interview is a conversation about building something big, like a photo app or a chat service, for millions of people. There is no single right answer. The interviewer wants to see how you think: what you ask, what you estimate, and how you explain the trade-offs of each choice.",
      "Scaling means handling more users. You can buy a bigger machine (vertical scaling) or add more machines (horizontal scaling). A bigger machine is simple but has a ceiling and is one point of failure. More machines can grow almost without limit, but now you need something to share the work between them.",
      "That something is a load balancer. It sits in front of your servers and passes each request to one of them, skipping any server that is down. For this to work, servers should be stateless: they keep no user data in their own memory, so any server can answer any request.",
      "When data is copied across machines, a new problem appears: the copies can disagree for a moment. The CAP theorem says that when the network between machines breaks, you must choose. Either refuse some requests to stay correct, or keep answering and risk showing old data.",
    ],
    deepDive: [
      {
        heading: "Load balancers: layer 4 vs layer 7",
        body: "A layer 4 load balancer works at the transport level. It sees IP addresses and ports and forwards TCP or UDP connections without reading the content, so it is very fast. A layer 7 load balancer understands HTTP. It can send /api to one group of servers and /images to another, route by host name or header, end TLS (decrypt HTTPS) so servers do not have to, and retry a failed request on another server.\n\nCommon algorithms: round robin (take turns), weighted round robin (bigger servers get more), least connections (best when requests vary a lot in length) and hashing on the client IP or a key (the same client keeps going to the same server). Health checks call each server every few seconds and remove ones that stop answering. The balancer itself must not be a single point of failure, so it runs as a redundant pair or as a managed cloud service.",
        visual: {
          type: "compare",
          title: "Layer 4 vs layer 7 load balancing",
          columns: [
            { title: "Layer 4 (transport)", points: ["Sees IPs and ports only", "Forwards TCP or UDP connections", "Very fast, protocol-agnostic", "Example: AWS Network Load Balancer"] },
            { title: "Layer 7 (application)", points: ["Reads HTTP paths, hosts, headers", "Can end TLS and retry requests", "Smarter routing, a bit more work", "Example: AWS Application Load Balancer, NGINX"] },
          ],
        },
      },
      {
        heading: "How to make app servers stateless",
        body: "State is anything a server remembers between requests: login sessions, shopping carts, uploaded files, in-memory counters. If it lives in one server's memory, the user loses it when the balancer sends them elsewhere or the server restarts.\n\nMove each kind of state out. Sessions go into a shared store such as Redis, or into a signed token (like a JWT) that the client sends with every request. Uploaded files go to object storage such as Amazon S3. Counters and locks go to a database or Redis. Sticky sessions, where the balancer pins a user to one server, are a quick fix but spread load unevenly and still lose the session when that server dies. Once servers are stateless, you can add or remove them freely, which is what autoscaling needs.",
        bullets: ["Sessions: Redis or signed tokens", "Files: object storage", "Counters and locks: database or Redis", "Sticky sessions: a crutch, not a design"],
      },
      {
        heading: "CAP, PACELC and consistency models",
        body: "CAP says that during a network partition (some machines cannot reach others), a replicated system must give up either consistency (every read sees the latest write) or availability (every request gets an answer). A bank balance should pick consistency: better to reject a request than show money that is not there. A like counter can pick availability: a slightly old count harms no one.\n\nPACELC adds the everyday case: Else, when there is no partition, you still trade Latency against Consistency, because waiting for replicas to agree takes time. Between strong and eventual consistency there are useful middle levels. Read-your-writes means you always see your own changes. Monotonic reads means you never see time go backwards. In quorum systems with N copies, if each write waits for W copies and each read asks R copies with W + R > N, every read overlaps at least one copy that has the latest write.",
        visual: {
          type: "compare",
          title: "During a partition: CP or AP?",
          columns: [
            { title: "Choose consistency (CP)", points: ["Reject or delay some requests", "Never show stale data", "Payments, stock levels, bookings", "Example: etcd, ZooKeeper"] },
            { title: "Choose availability (AP)", points: ["Always answer, maybe stale", "Merge differences later", "Likes, feeds, shopping carts", "Example: Cassandra, DynamoDB default reads"] },
          ],
        },
      },
      {
        heading: "Back-of-the-envelope numbers to remember",
        body: "Estimates decide your design, so keep a few numbers in your head. A day has 86,400 seconds; round it to 100,000 to divide easily. So 1 million requests per day is about 12 per second, and 1 billion per day is about 12,000 per second. Peak traffic is often two to three times the average, and you design for the peak.\n\nRough latencies: reading from memory takes about 100 nanoseconds, a random read from an SSD around 100 microseconds, a round trip inside one data centre about half a millisecond, and a round trip across an ocean around 100 milliseconds or more. That is why caches sit close to the app and why global apps put servers near users. For storage, multiply items per day by bytes per item by days kept, then add room for replicas.",
        bullets: ["1M per day is about 12 per second", "Peak is about 2 to 3 times average", "Memory is about 1000 times faster than an SSD read", "Storage = items x size x retention x replicas"],
      },
      {
        heading: "Availability: counting the nines",
        body: "Availability is the share of time a system works. 99.9% (three nines) allows about 8.8 hours of downtime a year, or about 43 minutes a month. 99.99% allows about 53 minutes a year, and 99.999% about 5 minutes.\n\nParts in a chain multiply. If a request must pass a load balancer, an app server and a database, each 99.9%, the whole path is about 99.7%. Parts in parallel help: two independent servers that are each 99.9% available fail together only 0.1% x 0.1% of the time, giving 99.9999%. That is the maths behind removing single points of failure: every box on your diagram that has no backup caps the availability of everything behind it.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "A typical horizontally scaled web stack",
        layers: [
          { label: "DNS and CDN", detail: "Send users to the nearest edge; cache static files" },
          { label: "Load balancer pair", detail: "Health checks, TLS, spread requests" },
          { label: "Stateless app servers", detail: "Autoscaled; no local sessions" },
          { label: "Cache (Redis)", detail: "Hot reads and shared sessions" },
          { label: "Database primary and replicas", detail: "Writes to primary, reads spread to replicas" },
          { label: "Object storage", detail: "Images, videos, backups" },
        ],
      },
      {
        type: "sequence",
        title: "Health checks take a broken server out of rotation",
        actors: ["Load balancer", "Server A", "Server B"],
        messages: [
          { from: 0, to: 1, label: "GET /health" },
          { from: 1, to: 0, label: "200 OK" },
          { from: 0, to: 2, label: "GET /health" },
          { from: 2, to: 0, label: "No reply (timeout)" },
          { from: 0, to: 1, label: "All new traffic goes to A" },
          { from: 0, to: 2, label: "Keep probing; re-add after healthy checks" },
        ],
      },
    ],
    examples: [
      {
        title: "Estimating a text-only social feed with 50 million daily users",
        explanation: "Ask first: how many posts and feed views per user? Say each user writes 2 posts and opens the feed 10 times a day. Writes: 100 million posts a day, about 1,200 per second on average and maybe 3,500 at peak. Reads: 500 million feed loads a day, about 5,800 per second, peaking near 17,000. Reads beat writes by 5 to 1, so caching feeds matters more than write speed. Storage: about 500 bytes per post, so 50 GB a day, or about 18 TB a year before replicas. That fits a sharded database comfortably.",
        code: {
          lang: "text",
          code: `Users:     50M daily active
Writes:    50M x 2 posts      = 100M/day  -> ~1,200/s  (peak ~3,500/s)
Reads:     50M x 10 feed loads = 500M/day -> ~5,800/s  (peak ~17,000/s)
Storage:   100M x 500 bytes   = 50 GB/day -> ~18 TB/year (x3 with replicas)
Takeaway:  read-heavy -> cache feeds; 18 TB/year -> shard by user`,
        },
      },
      {
        title: "Same company, two features, two consistency choices",
        explanation: "Feature 1 is a wallet balance. If two data centres lose contact, letting both accept withdrawals could spend the same money twice. So this path is CP: writes go to one leader, and if it cannot be reached the app shows \"try again later\". Feature 2 is the view count on a video. If the regions disagree for a minute, nobody is hurt, and refusing to show the page would be far worse. So this path is AP: each region counts locally and the totals are merged later. Saying \"it depends\" is not enough in an interview; name the feature, the failure, and the choice.",
      },
    ],
    cheatSheet: [
      "1 day = 86,400 s, about 10^5; 1M requests a day is about 12 requests per second",
      "Peak traffic is often 2 to 3 times the daily average; design for the peak",
      "99.9% allows about 8.8 hours of downtime a year; 99.99% about 53 minutes",
      "Parts in a chain multiply: 99.9% x 99.9% x 99.9% is about 99.7%",
      "Layer 4 balancers route by IP and port; layer 7 balancers route HTTP by path, host or header",
      "Quorum rule: with N copies, W + R > N means every read overlaps the latest write",
      "Rough latency: RAM 100 ns, SSD read 100 microseconds, same data centre 0.5 ms, cross-ocean 100+ ms",
      "Least connections suits requests of very different lengths; round robin suits similar ones",
    ],
    quiz: [
      {
        q: "Some requests take 10 ms and others take 10 seconds. Which load-balancing algorithm keeps servers most evenly busy?",
        options: ["Round robin", "Random", "Least connections", "Alphabetical by client name"],
        answer: 2,
        why: "Least connections sends new work to the server with the fewest requests in progress, so slow requests do not pile up on one server.",
      },
      {
        q: "About how many requests per second is 1 million requests per day?",
        options: ["About 12", "About 120", "About 1,200", "About 1.2"],
        answer: 0,
        why: "1,000,000 divided by 86,400 seconds is about 11.6.",
      },
      {
        q: "During a network partition, what does a CP system do?",
        options: ["Answers every request with whatever data it has", "Shuts down every server", "Switches to UDP", "Rejects or delays some requests so no one reads stale data"],
        answer: 3,
        why: "CP keeps consistency by giving up availability for the requests it cannot serve correctly.",
      },
      {
        q: "Roughly how much downtime per year does 99.99% availability allow?",
        options: ["About 8.8 hours", "About 53 minutes", "About 5 minutes", "About 3.6 days"],
        answer: 1,
        why: "0.01% of 525,600 minutes in a year is about 53 minutes.",
      },
      {
        q: "A store keeps N = 3 copies of each item. Which setting guarantees that reads see the latest write?",
        options: ["W = 1, R = 1", "W = 1, R = 2", "W = 2, R = 2", "W = 0, R = 3"],
        answer: 2,
        why: "W + R = 4 > 3, so the set of copies read always includes at least one copy that took the write.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A photo app has 10 million daily users. Each views 50 photos a day, and 10% of users upload one 500 KB photo a day. Estimate average and peak read QPS and the storage added per year.",
        hint: "Divide daily totals by about 100,000 seconds, and multiply peak by about 3.",
        solution: `Reads:   10M x 50 = 500M/day -> ~5,800/s average, ~17,000/s peak
Uploads: 10% x 10M = 1M/day  -> ~12/s
Storage: 1M x 500 KB = 500 GB/day -> ~180 TB/year (before replicas)
Design hint: very read-heavy, so put photos behind a CDN; store files in object storage.`,
      },
      {
        level: "medium",
        task: "A request passes a load balancer (99.99%), then one of two app servers in parallel (each 99.9%), then a single database (99.95%). Estimate the availability of the whole path and the yearly downtime.",
        hint: "Parallel: 1 - (1 - a)^2. Chain: multiply.",
        solution: `App tier (parallel): 1 - 0.001 x 0.001 = 0.999999
Path: 0.9999 x 0.999999 x 0.9995 = about 0.9994 (99.94%)
Downtime: 0.0006 x 8,760 hours = about 5.3 hours a year
The single database is the weakest link: add a standby replica with automatic failover.`,
      },
      {
        level: "hard",
        task: "Outline a 45-minute answer to \"Design Pastebin\" (users paste text and get a short link) in about ten lines, following the framework.",
        hint: "Requirements, estimates, API, data model, high-level design, deep dive, trade-offs.",
        solution: `1. Functional: create paste, read by link, optional expiry. Non-functional: reads fast, highly available.
2. Scale: 1M pastes/day (~12/s writes), 10:1 reads (~120/s), avg 10 KB -> ~10 GB/day.
3. API: POST /pastes {text, ttl} -> {id}; GET /pastes/{id}.
4. Data: pastes(id PK, object_key, created_at, expires_at); text bodies in object storage.
5. High level: LB -> stateless app -> metadata DB + object storage; CDN in front of GET.
6. IDs: random 8-char base62, retry on the rare collision.
7. Deep dive: cache hot pastes in Redis; a background job deletes expired pastes.
8. Trade-off: object storage is cheap and durable, at the cost of one extra hop on a cache miss.`,
      },
    ],
    faq: [
      { q: "Do I need to name specific technologies in a system design interview?", a: "Naming a well-known tool (PostgreSQL, Redis, Kafka, S3) helps, but only if you say why it fits. A generic \"key-value store with fast reads\" plus a reason beats a list of brand names." },
      { q: "How precise do my estimates need to be?", a: "Within a factor of about two is fine. Round aggressively, say your assumptions out loud, and use the result to make a decision, such as \"this fits on one machine\" or \"we need to shard\"." },
      { q: "Should I start with vertical scaling?", a: "Often yes. A single strong database server goes a long way, and saying \"start simple, scale out when the numbers require it\" shows good judgement. Then explain what you would change when the limits are reached." },
      { q: "Is the CAP theorem still worth knowing?", a: "Yes, as a way to talk about trade-offs during network failures. Pair it with PACELC to show you know that latency versus consistency matters even when the network is fine." },
    ],
  },

  "system-design/sd-data": {
    plain: [
      "Most of a system design is about data: where it lives, how fast you can read it, and what happens when a machine fails. The servers that run your code are easy to copy. The data is the hard part.",
      "A cache is a small, fast store that keeps copies of popular data in memory, so you do not ask the slower database every time. It is like keeping your keys by the door instead of searching the house each morning. The hard part is keeping the copy fresh when the real data changes.",
      "Replication means keeping copies of the whole database on several machines. One machine, the leader, takes the writes and passes them on to followers, which can serve reads. If the leader dies, a follower can take its place.",
      "Sharding means splitting the data into pieces and putting each piece on a different machine, for example users A to M on one and N to Z on another. You shard when the data or the write traffic is too big for one machine. It gives you more room but makes queries that span pieces harder.",
    ],
    deepDive: [
      {
        heading: "Choosing a database: let the access pattern decide",
        body: "Start with how the data is read and written, not with a favourite product. Do you need joins and multi-row transactions, as with orders and payments? Choose a relational database such as PostgreSQL or MySQL. Do you look things up by a single key at huge scale, as with sessions or carts? A key-value store such as Redis or DynamoDB fits. Do records have flexible, nested fields? A document store such as MongoDB. Do you write enormous streams of time-ordered events? A wide-column store such as Cassandra. Do you need full-text search with relevance ranking? Elasticsearch or OpenSearch.\n\nLarge files such as images and videos go in object storage, with only their URL in the database. Many real systems use several of these, each for the job it does best.",
        visual: {
          type: "tree",
          title: "Storage by job",
          root: "What does the data need?",
          children: [
            { label: "Joins and transactions", children: ["PostgreSQL, MySQL"] },
            { label: "Fast lookup by key", children: ["Redis, DynamoDB"] },
            { label: "Flexible documents", children: ["MongoDB"] },
            { label: "Huge write streams", children: ["Cassandra, ScyllaDB"] },
            { label: "Full-text search", children: ["Elasticsearch, OpenSearch"] },
            { label: "Big files", children: ["Object storage such as S3"] },
          ],
        },
      },
      {
        heading: "Caching patterns and how they fail",
        body: "Cache-aside is the most common: the app checks the cache, and on a miss reads the database and stores the result with a TTL (time to live). On a write, update the database and then delete the cache key, so the next read reloads fresh data. Deleting is safer than updating the cache, because two racing updates can leave the cache holding the older value. Write-through writes to the cache and database together. Write-back (write-behind) writes only to the cache and flushes to the database later: very fast, but data is lost if the cache dies first.\n\nThe classic failure is a stampede: a hot key expires and thousands of requests hit the database at once. Fixes: let one request rebuild the key while others wait or get the old value, and add random jitter to TTLs so many keys do not expire together. When memory fills up, the cache evicts keys, usually the least recently used (LRU).",
        bullets: ["On write: update the database, then delete the key", "Always set a TTL, with jitter", "Stampede: one rebuilder, others wait", "Write-back trades safety for speed"],
      },
      {
        heading: "Replication: synchronous, asynchronous and failover",
        body: "With synchronous replication the leader waits for a follower to confirm each write. No committed data is lost if the leader dies, but every write is slower, and a slow follower slows everyone. With asynchronous replication the leader confirms at once and followers catch up a little later. Writes are fast, but followers lag (replication lag), and a failover can lose the last few writes. Many setups mix the two: one synchronous follower and the rest asynchronous.\n\nLag causes a classic bug: a user saves their profile, reloads, and a lagging follower shows the old version. To give read-your-writes, send that user's reads to the leader for a short time after they write. Failover itself has risks: if the old leader comes back still thinking it leads, two leaders accept writes (split brain), so systems use fencing to shut the old one out.",
      },
      {
        heading: "Sharding strategies and their trade-offs",
        body: "Range sharding splits by key ranges, such as dates or user names A to F. Range queries stay on one shard, but new data often lands on the same shard and makes it hot. Hash sharding puts a key on shard hash(key) mod N. Load spreads evenly, but a range query must ask every shard, and changing N moves most keys. Consistent hashing places shards and keys on a ring, so adding a shard moves only about 1/N of the keys. Directory sharding keeps a lookup table from key to shard: flexible, but the table is another service to run.\n\nPick a shard key that spreads load and keeps data queried together on the same shard, such as user_id for a user's own data. Hot keys, like a celebrity's profile, may need extra caching or splitting the key into several sub-keys. Joins and transactions across shards are slow and complex, so design to avoid them.",
        visual: {
          type: "compare",
          title: "Three ways to shard",
          columns: [
            { title: "Range", points: ["Split by key ranges", "Range scans stay on one shard", "Newest keys can make a hot shard"] },
            { title: "Hash", points: ["Shard = hash(key) mod N", "Even spread of load", "Range queries hit every shard"] },
            { title: "Directory", points: ["Lookup table: key to shard", "Move data freely", "The table is one more system to run"] },
          ],
        },
      },
      {
        heading: "Justifying your choices out loud",
        body: "Interviewers score the reasoning, not the product name. Use a four-part sentence: the requirement, the choice, the trade-off and the mitigation. For example: \"Orders need transactions, so I'll use PostgreSQL. It has a single write leader, which limits write throughput, but our estimate of 500 writes per second is well within one machine. If that grows, we can shard by customer_id.\"\n\nDo the same for caching: \"Product pages are read 100 times for each write, so a Redis cache-aside layer with a 5-minute TTL removes most database reads. Prices may be stale for up to 5 minutes, so on a price change we delete the key.\" This shows you know what each choice costs and how you would contain the cost.",
        bullets: ["Requirement: what the data needs", "Choice: the store or pattern", "Trade-off: what it costs", "Mitigation: how you limit that cost"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Cache-aside: a read miss, then a hit",
        actors: ["App", "Redis", "Database"],
        messages: [
          { from: 0, to: 1, label: "GET user:42" },
          { from: 1, to: 0, label: "miss (nil)" },
          { from: 0, to: 2, label: "SELECT * FROM users WHERE id = 42" },
          { from: 2, to: 0, label: "row" },
          { from: 0, to: 1, label: "SET user:42 with a 300 s TTL" },
          { from: 0, to: 1, label: "Next request: GET user:42" },
          { from: 1, to: 0, label: "hit, no database call" },
        ],
      },
      {
        type: "layers",
        title: "Layers of caching on the read path",
        layers: [
          { label: "Browser cache", detail: "Cache-Control headers; no request at all" },
          { label: "CDN edge", detail: "Static files and public pages near the user" },
          { label: "In-process cache", detail: "Tiny, per server, microseconds" },
          { label: "Shared cache (Redis)", detail: "Shared by all servers, under a millisecond" },
          { label: "Database buffer pool", detail: "Hot pages already in database memory" },
          { label: "Disk", detail: "The slowest and final source of truth" },
        ],
      },
    ],
    examples: [
      {
        title: "Cache-aside for user profiles with Redis",
        explanation: "A profile page is read thousands of times for every edit. On a read, try Redis first. On a miss, load from the database and store the result for 300 seconds. On an update, write the database first and then delete the key, so the next read refills it with fresh data. If Redis is down, the reads still work, just more slowly, because the database is the source of truth.",
        code: {
          lang: "python",
          code: `import json
import redis
r = redis.Redis(host="localhost", port=6379)
def get_user(user_id, db):
    key = f"user:{user_id}"
    cached = r.get(key)
    if cached is not None:
        return json.loads(cached)              # hit
    user = db.fetch_user(user_id)              # miss: ask the database
    if user is not None:
        r.set(key, json.dumps(user), ex=300)   # keep for 5 minutes
    return user
def update_user(user_id, fields, db):
    db.update_user(user_id, fields)            # source of truth first
    r.delete(f"user:{user_id}")                # then invalidate`,
        },
      },
      {
        title: "Adding a fifth shard: mod N vs consistent hashing",
        explanation: "Users are spread over 4 shards with hash(user_id) mod 4. Traffic grows and you add a fifth. With mod 5, a key stays put only if hash mod 4 equals hash mod 5, which is true for about 1 key in 5, so about 80% of all users must move: a huge migration. With consistent hashing, the new shard takes over a few arcs of the ring from its neighbours, and only about 1/5 (20%) of keys move, all onto the new shard. Virtual nodes (each shard placed at many points on the ring) keep the arcs, and so the load, even.",
      },
    ],
    cheatSheet: [
      "Cache-aside: read cache, on a miss read the database and fill; on write, update the DB then delete the key",
      "Set a TTL on every cache key and add random jitter so keys do not all expire at once",
      "Write-back caching is fastest but loses data if the cache dies before flushing",
      "Async replication: fast writes, but followers lag and a failover can lose recent writes",
      "Read-your-writes: route a user's reads to the leader for a short time after they write",
      "Going from mod 4 to mod 5 moves about 80% of keys; consistent hashing moves about 20%",
      "Range sharding keeps scans cheap, but the newest keys can pile onto one hot shard",
      "Store big files in object storage such as S3 and keep only the URL in the database",
    ],
    quiz: [
      {
        q: "A very popular cache key expires and thousands of requests hit the database at once. What is the best fix?",
        options: ["Remove all TTLs", "Let one request rebuild the key while the others wait or use the old value", "Buy a bigger database", "Switch to write-back caching"],
        answer: 1,
        why: "Request coalescing stops the stampede, so the database sees one query instead of thousands.",
      },
      {
        q: "Where should an app store 5 MB profile videos?",
        options: ["Object storage such as S3, with the URL saved in the database", "A single Redis key", "A VARCHAR column", "The app server's local disk"],
        answer: 0,
        why: "Object storage is cheap, durable and built for large files, and it keeps app servers stateless.",
      },
      {
        q: "A user edits their profile, reloads, and sees the old version. What is the most likely cause?",
        options: ["The cache TTL is too long", "The database lost the write", "The load balancer is broken", "The read went to an asynchronous follower that has not caught up"],
        answer: 3,
        why: "Replication lag on followers is the classic cause of not reading your own write.",
      },
      {
        q: "What is the main drawback of hash sharding?",
        options: ["Load is spread unevenly", "It needs a lookup table", "Range queries across keys must ask every shard", "Shards can never be added"],
        answer: 2,
        why: "Hashing scatters neighbouring keys across shards, so a range has no single home.",
      },
      {
        q: "What is the main cost of synchronous replication?",
        options: ["Losing data on failover", "Higher write latency, since the leader waits for a follower", "Reads from the leader are stale", "Followers cannot serve reads"],
        answer: 1,
        why: "Every write waits for at least one follower's confirmation, which adds a network round trip.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pick a data store for each, with one reason: user accounts and payments; login sessions; product images; 1 million click events per second for analytics.",
        hint: "Think about transactions, key lookups, big files and huge write streams.",
        solution: `Accounts and payments: PostgreSQL, because they need transactions and constraints.
Sessions: Redis, because it gives fast key lookups with a TTL.
Product images: object storage (S3) behind a CDN, because the files are large and read a lot.
Click events: Kafka into a wide-column or analytics store (Cassandra, ClickHouse),
because it is a huge append-only write stream.`,
      },
      {
        level: "medium",
        task: "Write a cache read in Python with redis-py that prevents a stampede: on a miss, only one caller rebuilds the value while the others wait and retry.",
        hint: "SET with nx=True and an expiry works as a simple lock.",
        solution: `import time
def get_with_lock(r, key, load, ttl=300):
    while True:
        val = r.get(key)
        if val is not None: return val
        if r.set(f"lock:{key}", "1", nx=True, ex=10):   # only one caller rebuilds
            try:
                val = load(); r.set(key, val, ex=ttl); return val
            finally:
                r.delete(f"lock:{key}")
        time.sleep(0.05)                                 # others wait, then retry`,
      },
      {
        level: "hard",
        task: "A chat app stores billions of messages. Choose a shard key, explain how you would read one conversation, and how you would handle one huge, very active group chat.",
        hint: "Think about which data is read together and what happens when one key gets most of the traffic.",
        solution: `Shard key: conversation_id, so one conversation lives on one shard and
reading recent messages is a single-shard range scan sorted by message id.
Avoid user_id: a conversation has two or more users and would be split.
Store: a wide-column table, partition = conversation_id, clustering = message_id DESC.
Huge group: split the partition by time bucket (conversation_id + month),
so one partition never grows without limit; cache the latest page in Redis.
Resharding: consistent hashing with virtual nodes, so adding nodes moves few partitions.`,
      },
    ],
    faq: [
      { q: "When should I choose NoSQL over SQL?", a: "Choose NoSQL when your access pattern is simple key or document lookups at very high scale, or the schema changes often. Stay with SQL when you need joins, transactions and strict constraints, which covers most business data." },
      { q: "What is the difference between replication and sharding?", a: "Replication copies the same data to several machines for read capacity and safety. Sharding splits different data across machines for more storage and write capacity. Large systems use both: each shard is replicated." },
      { q: "Should I use Redis or Memcached?", a: "Memcached is a simple, multi-threaded key-value cache. Redis adds data structures such as lists, sets and sorted sets, optional persistence and replication, so it is the more common choice today." },
      { q: "How do I handle cache invalidation?", a: "Set a TTL on every key so stale data expires on its own, and delete the key whenever the underlying data changes. For data that must never be stale, such as balances, read from the database instead." },
    ],
  },

  "system-design/sd-async": {
    plain: [
      "Some work is too slow to do while the user waits: resizing a video, sending a thousand emails, building a monthly report. Instead, the app writes a note saying \"this job needs doing\" into a queue and answers the user right away. A separate program, a worker, picks up notes from the queue and does the work in the background.",
      "Think of a restaurant. The waiter takes your order, pins the ticket on the kitchen rail and goes back to other tables. The cooks take tickets one by one. If a rush arrives, tickets wait on the rail instead of the waiter freezing.",
      "Queues bring one surprise: a job can arrive twice. If a worker finishes but crashes before saying \"done\", the queue gives the job to someone else. So workers must be safe to run twice on the same job. That property is called idempotent.",
      "Rate limiting is the other side of protection. It caps how many requests one user or API key may send, such as 100 per minute. Extra requests get a polite \"slow down\" (HTTP 429), so one noisy client cannot take the service down for everyone.",
    ],
    deepDive: [
      {
        heading: "Message queue or event log?",
        body: "Classic message queues such as RabbitMQ and Amazon SQS hand each message to one worker and delete it once the worker acknowledges it. Many workers can share one queue (competing consumers), which spreads work automatically. In SQS a received message becomes invisible for a visibility timeout (30 seconds by default); if the worker does not delete it in time, it reappears for another worker.\n\nAn event log such as Apache Kafka keeps messages for a set time, often days, even after they are read. Each consumer group tracks its own position (offset), so several different services can read the same events, and you can replay history after a bug. Kafka keeps order only within a partition, and messages with the same key always go to the same partition, so all events for one order can stay in order.",
        visual: {
          type: "compare",
          title: "Queue vs log",
          columns: [
            { title: "Queue (RabbitMQ, SQS)", points: ["Message removed after ack", "Each message to one worker", "Great for background jobs", "No replay once consumed"] },
            { title: "Log (Kafka)", points: ["Messages kept for a retention period", "Each consumer group has its own offset", "Order kept within a partition", "Replay and many readers"] },
          ],
        },
      },
      {
        heading: "Delivery guarantees, honestly",
        body: "At-most-once delivery acknowledges a message before processing it: if the worker crashes, the job is lost. At-least-once acknowledges after processing: nothing is lost, but a crash between finishing and acknowledging means the job runs again. Most systems choose at-least-once.\n\nExactly-once delivery across a network is not possible in general, because the sender can never be sure whether a lost acknowledgement means the work did not happen. What systems offer is exactly-once processing: at-least-once delivery plus deduplication. Kafka transactions and SQS FIFO queues (which drop duplicates sent within a 5-minute window) help, but your own side effects, such as charging a card or sending an email, still need idempotency in your code.",
        visual: {
          type: "sequence",
          title: "Why at-least-once means duplicates",
          actors: ["Queue", "Worker 1", "Worker 2"],
          messages: [
            { from: 0, to: 1, label: "Deliver job 17 (now invisible)" },
            { from: 1, to: 1, label: "Does the work" },
            { from: 1, to: 0, label: "Crashes before the ack" },
            { from: 0, to: 2, label: "Timeout passed: deliver job 17 again" },
            { from: 2, to: 0, label: "Does the work again, then acks" },
          ],
        },
      },
      {
        heading: "Making workers idempotent",
        body: "An idempotent worker can see the same message twice and leave the world as if it saw it once. The most common tool is a unique ID per message or job. Record processed IDs in a table with a unique constraint, in the same database transaction as the work itself. If the insert fails because the ID exists, skip the work and acknowledge the message.\n\nOther techniques: write with upserts (insert or update) instead of plain inserts; use conditional updates such as UPDATE orders SET status = 'paid' WHERE id = 7 AND status = 'pending'; and pass an idempotency key to external APIs, as payment providers like Stripe support, so a retried charge is not charged twice. For publishing events reliably, the outbox pattern writes the event into an outbox table in the same transaction as the data change, and a separate relay publishes it to the queue.",
        bullets: ["Unique message ID plus a processed table", "Upserts instead of blind inserts", "Conditional updates on the current state", "Idempotency keys for external APIs", "Outbox pattern for reliable events"],
      },
      {
        heading: "Retries, backoff and dead letters",
        body: "Failures are often temporary: a timeout, a database failover, a busy downstream service. Retrying fixes them, but retrying instantly in a tight loop makes an outage worse. Use exponential backoff: wait about 1 s, then 2 s, then 4 s, up to a cap. Add random jitter (pick a random time up to that delay) so a thousand workers do not all retry at the same moment.\n\nSome messages will never succeed, for example because of bad data. These poison messages must not block the queue forever. After a maximum number of attempts, move them to a dead-letter queue (DLQ), raise an alert, and let a person inspect and replay them once fixed. Also watch queue depth and consumer lag: a growing backlog is your signal to add workers or find a slow dependency.",
      },
      {
        heading: "Rate limiting algorithms beyond the buckets",
        body: "A fixed window counts requests per clock minute. It is simple, but a client can send the full limit at 12:00:59 and again at 12:01:00, getting twice the limit in two seconds. A sliding window log stores each request's timestamp and counts those in the last 60 seconds: exact, but it uses memory per request. A sliding window counter estimates by weighting the previous window's count by how much of it still overlaps, which is cheap and close enough for most APIs.\n\nWith many servers, the counters must be shared, usually in Redis, and the check-and-increment must be atomic (one INCR, a MULTI transaction or a Lua script). Reply with 429 Too Many Requests and a Retry-After header. Decide what happens if Redis is down: fail open (allow requests) to protect users, or fail closed to protect the backend.",
        visual: {
          type: "compare",
          title: "Window-based limiters",
          columns: [
            { title: "Fixed window", points: ["One counter per clock window", "Tiny memory", "Allows 2x bursts at the boundary"] },
            { title: "Sliding window log", points: ["Timestamp per request", "Exact count", "Memory grows with traffic"] },
            { title: "Sliding window counter", points: ["Two counters, weighted", "Cheap and smooth", "A close estimate, not exact"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Life of a failing job",
        steps: [
          { label: "Enqueued", detail: "API writes the job and returns 202" },
          { label: "Attempt 1 fails", detail: "Downstream timed out" },
          { label: "Backoff and retry", detail: "Wait about 1 s, 2 s, 4 s plus jitter" },
          { label: "Max attempts reached", detail: "For example 5 tries" },
          { label: "Dead-letter queue", detail: "Alert fires; nothing else is blocked" },
          { label: "Fix and replay", detail: "Move messages back after the bug is fixed" },
        ],
      },
    ],
    examples: [
      {
        title: "A fixed-window rate limiter shared by all servers",
        explanation: "Limit: 100 requests per minute per API key. Each request builds a key from the API key and the current minute number, increments it in Redis and sets it to expire after the window. The 101st request in that minute sees a count of 101 and gets 429. Because Redis is shared, it does not matter which app server handles the request. Explain the weakness too: up to 200 requests can pass in the two seconds around a minute boundary; a sliding window fixes that.",
        code: {
          lang: "python",
          code: `import time
import redis
r = redis.Redis()
def allow(api_key, limit=100, window=60):
    bucket = int(time.time()) // window          # current window number
    key = f"rl:{api_key}:{bucket}"
    pipe = r.pipeline()                          # MULTI/EXEC: runs as one unit
    pipe.incr(key)
    pipe.expire(key, window)
    count, _ = pipe.execute()
    return count <= limit                        # False -> reply 429`,
        },
      },
      {
        title: "An idempotent \"mark order paid\" worker",
        explanation: "The queue may deliver the \"payment succeeded\" message twice. Inside one database transaction, the worker inserts the message ID into processed_messages, a table whose primary key is the ID. On the first delivery the insert succeeds and the order is updated. On a duplicate, the insert affects no rows, so the worker skips the update. Only after the transaction commits does the worker acknowledge the message. If it crashes before the ack, the redelivery is harmless.",
        code: {
          lang: "python",
          code: `import psycopg
def handle(msg, conn: psycopg.Connection):
    with conn.transaction():
        cur = conn.execute(
            "INSERT INTO processed_messages (id) VALUES (%s) ON CONFLICT DO NOTHING",
            (msg["id"],))
        if cur.rowcount == 0:
            return               # duplicate: the effect was already applied
        conn.execute("UPDATE orders SET status = 'paid' WHERE id = %s",
                     (msg["order_id"],))
    # transaction committed: now it is safe to ack the message`,
        },
      },
    ],
    cheatSheet: [
      "Ack a message only after the work is done; a crash before the ack means redelivery",
      "SQS visibility timeout defaults to 30 s; set it longer than your slowest job",
      "Kafka keeps order only within a partition; the same key always goes to the same partition",
      "Backoff: wait up to base x 2^attempt with random jitter, cap it, then send to a DLQ",
      "Idempotency: save processed message IDs under a unique key, in the same transaction as the work",
      "Return 429 Too Many Requests with a Retry-After header",
      "Fixed windows can let through 2x the limit around a window boundary",
      "Scale workers on queue depth and consumer lag, not only on CPU",
    ],
    quiz: [
      {
        q: "With at-least-once delivery, a worker finishes a job but crashes before acknowledging it. What happens?",
        options: ["The job is lost", "The queue deletes it anyway", "The job is delivered again and may run a second time", "The queue stops accepting messages"],
        answer: 2,
        why: "The queue never got the ack, so after the timeout it hands the job to another worker.",
      },
      {
        q: "A fixed-window limiter allows 100 requests per minute. What is the most a client can send in the two seconds around a minute boundary?",
        options: ["200", "100", "101", "50"],
        answer: 0,
        why: "It can use the full 100 at the end of one window and another 100 at the start of the next.",
      },
      {
        q: "What ordering does Kafka guarantee?",
        options: ["Global order across the whole topic", "No ordering at all", "Order by message size", "Order within a single partition"],
        answer: 3,
        why: "Each partition is an ordered log; there is no order between partitions.",
      },
      {
        q: "Why add random jitter to retry delays?",
        options: ["To make retries faster", "So many clients do not retry at exactly the same moment", "Because queues require it", "To reduce message size"],
        answer: 1,
        why: "Synchronised retries create waves of load that can keep a recovering service down.",
      },
      {
        q: "What problem does the outbox pattern solve?",
        options: ["Messages arriving out of order", "Rate limiting across servers", "Saving a data change and publishing its event so that both happen or neither does", "Compressing large messages"],
        answer: 2,
        why: "The event is written in the same transaction as the data, and a relay publishes it afterwards.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Decide synchronous or asynchronous for each, with a reason: checking a login password; sending a welcome email; building a 200-page yearly PDF report; confirming card payment at checkout.",
        hint: "Ask: does the user need the result before they can continue?",
        solution: `Login check: synchronous; the user cannot continue without the answer.
Welcome email: async; the user does not wait for it and retries are easy.
Yearly PDF: async; return 202 with a job ID, notify when ready.
Card payment: synchronous call to the provider with an idempotency key,
then async follow-ups (receipt email, analytics) through a queue.`,
      },
      {
        level: "medium",
        task: "Write a Python helper that calls a function with up to 5 attempts, using exponential backoff with full jitter and a 30-second cap.",
        hint: "Full jitter means sleeping a random time between 0 and the current backoff limit.",
        solution: `import random, time
def call_with_retries(fn, attempts=5, base=0.5, cap=30):
    for attempt in range(attempts):
        try:
            return fn()
        except Exception:
            if attempt == attempts - 1:
                raise                              # give up: caller sends to the DLQ
            delay = min(cap, base * 2 ** attempt)
            time.sleep(random.uniform(0, delay))   # full jitter`,
      },
      {
        level: "hard",
        task: "Implement a single-process sliding window counter limiter: allow(now) returns True if the weighted count of the previous and current windows is under the limit.",
        hint: "Weight the previous window's count by the fraction of it that still overlaps the last 60 seconds.",
        solution: `import time
class SlidingWindowCounter:
    def __init__(self, limit, window=60):
        self.limit, self.window, self.counts = limit, window, {}  # window no. -> count
    def allow(self, now=None):
        now = time.time() if now is None else now
        cur = int(now // self.window)
        passed = (now % self.window) / self.window   # share of current window gone
        est = self.counts.get(cur - 1, 0) * (1 - passed) + self.counts.get(cur, 0)
        if est >= self.limit: return False
        self.counts[cur] = self.counts.get(cur, 0) + 1   # old windows can be deleted
        return True`,
      },
    ],
    faq: [
      { q: "Should I use Kafka, RabbitMQ or SQS?", a: "Use SQS or RabbitMQ for background jobs where each task goes to one worker. Use Kafka when many services need the same stream of events, you need replay, or throughput is very high. On AWS, SQS is the simplest to operate." },
      { q: "Is exactly-once delivery possible?", a: "Not in general across a network. Systems give at-least-once delivery plus deduplication, which is called exactly-once processing, and your own side effects still need to be idempotent." },
      { q: "Where should rate limiting live?", a: "Usually at the edge, in an API gateway or load balancer, so bad traffic is stopped early. Services can add their own limits too, to protect expensive operations or downstream dependencies." },
      { q: "What is the difference between rate limiting and load shedding?", a: "Rate limiting caps each client at a fair share, even when the server is healthy. Load shedding drops or delays requests from everyone when the server itself is overloaded, often replying 503." },
    ],
  },

  "system-design/sd-practice": {
    plain: [
      "Practising system design is like practising a speech. You can read every article about URL shorteners, but the first time you explain one out loud under a timer, you will run out of time or forget the database. The only fix is doing it many times.",
      "The four classic prompts each teach something different. A URL shortener teaches ID generation and read-heavy caching. A chat system teaches real-time connections and message ordering. A news feed teaches the fan-out trade-off. A rate limiter teaches shared counters and atomic operations.",
      "Each design follows the same path: requirements, estimates, API and data, a high-level drawing, then a deep dive and trade-offs. After a few rounds the path becomes automatic, and you can spend your energy on the interesting parts.",
      "Treat the interviewer as a teammate. Ask what matters most to them, check in every ten minutes, and offer choices: \"we could do A or B; I'd pick A because...\". That conversation is what they are grading.",
    ],
    deepDive: [
      {
        heading: "URL shortener: IDs, redirects and caching",
        body: "The core is generating short, unique codes. Option 1: a database counter encoded in base62. To avoid one hot counter, each app server reserves a block of IDs (say 1,000 at a time) and hands them out from memory. Option 2: a Snowflake-style 64-bit ID made of a timestamp, a machine number and a sequence; it needs no coordination but gives longer codes. Option 3: hash the long URL and take 7 characters, checking for collisions. Sequential codes are guessable, so some designs shuffle or encrypt the number first.\n\nRedirects: 301 (permanent) lets browsers cache it and skip you next time, which saves load but hides clicks. 302 (temporary) brings every click back to you, which analytics needs. Reads outnumber writes by about 100 to 1, so put the hot codes in Redis and the rest in a key-value store sharded by code.",
        visual: {
          type: "sequence",
          title: "Following a short link",
          actors: ["Browser", "App server", "Redis", "Database"],
          messages: [
            { from: 0, to: 1, label: "GET /abc123" },
            { from: 1, to: 2, label: "GET code abc123" },
            { from: 2, to: 1, label: "miss" },
            { from: 1, to: 3, label: "look up abc123" },
            { from: 3, to: 1, label: "long URL" },
            { from: 1, to: 2, label: "cache it with a TTL" },
            { from: 1, to: 0, label: "302 Location: long URL" },
          ],
        },
      },
      {
        heading: "Chat: connections, ordering and offline users",
        body: "Clients keep a WebSocket open to a gateway server, so messages can be pushed instantly. Because users connect to different gateways, keep a registry (often in Redis) of which gateway holds each user's connection. When Alice sends a message, the chat service stores it, gives it a sequence number within the conversation, acknowledges Alice, and pushes it to Bob through Bob's gateway.\n\nServer-assigned sequence numbers per conversation give a clear order even when phone clocks disagree. If Bob is offline, the message waits in storage and a push notification goes out; when he reconnects, his app asks for everything after the last sequence number it saw. Messages are typically stored in a wide-column store partitioned by conversation_id. Presence (online or offline) comes from heartbeats every few seconds. Large group chats multiply delivery work, so they are often capped in size or handled by a separate fan-out path.",
        visual: {
          type: "sequence",
          title: "Alice sends Bob a message",
          actors: ["Alice", "Chat service", "Message store", "Bob"],
          messages: [
            { from: 0, to: 1, label: "send over WebSocket" },
            { from: 1, to: 2, label: "write with seq 42" },
            { from: 2, to: 1, label: "stored" },
            { from: 1, to: 0, label: "sent (seq 42)" },
            { from: 1, to: 3, label: "push via Bob's gateway" },
            { from: 3, to: 1, label: "delivered ack" },
          ],
        },
      },
      {
        heading: "News feed: push, pull or both",
        body: "Fan-out on write (push) adds each new post's ID to every follower's feed list, often a Redis list capped at a few hundred IDs. Reading a feed is then one fast lookup, which suits the common case where reads far outnumber writes. Fan-out on read (pull) builds the feed when the user opens it, by fetching recent posts from everyone they follow and merging them. It is cheap to write but slow to read for people who follow many accounts.\n\nThe usual answer is a hybrid. Push for normal accounts. For celebrities with millions of followers, skip the push and merge their recent posts in at read time. The feed stores only post IDs; post bodies come from a separate cache, which keeps the feed small. Page through feeds with a cursor (the last seen ID or timestamp), not OFFSET, so new posts do not shift pages. Ranking, if asked, is a scoring step after merging.",
      },
      {
        heading: "Rate limiter as a service",
        body: "Clarify first: limit by user, API key or IP? One rule or many (login is stricter than search)? Where does it run? A common design puts the limiter in the API gateway or as middleware in each service, with rules loaded from configuration and counters stored in Redis so every server sees the same numbers.\n\nThe check and the increment must be atomic, or two servers can both read 99 and both allow request 100. Use a single INCR (fixed window), a MULTI transaction, or a Lua script that Redis runs as one step (token bucket or sliding window). Return 429 with a Retry-After header. Discuss failure: if Redis is unreachable, fail open (allow traffic) or fail closed (block it), and say which suits this API. For very high traffic, servers can keep small local counters and sync with Redis periodically, trading a little accuracy for speed.",
        bullets: ["Key: user, API key or IP", "Atomic check plus increment in Redis", "429 with Retry-After", "Decide fail-open or fail-closed", "Rules in config, not in code"],
      },
      {
        heading: "Running the 45 minutes well",
        body: "Write the requirements in two short lists, functional and non-functional, and confirm them before drawing. Give estimates quickly and use them: \"40 writes per second fits one database; 4,000 reads per second means we cache\". Draw the high-level boxes and say what data flows along each arrow.\n\nAt about the 25-minute mark, ask \"which part would you like me to go deeper on?\" or pick the riskiest part yourself. Keep a list of trade-offs as you go, so the wrap-up is easy. If you get stuck, say what you are weighing; silence is the worst outcome. Finish by naming what you would add with more time: monitoring, alerts, multi-region, security. In timed mock practice, record yourself, then check where the minutes really went.",
        bullets: ["Confirm requirements before drawing", "Use every estimate to make a decision", "Ask where to go deep", "Name the trade-offs you made", "End with what you would add next"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "A Snowflake-style 64-bit ID",
        layers: [
          { label: "1 sign bit", detail: "Always 0, so IDs stay positive" },
          { label: "41 bits: timestamp", detail: "Milliseconds since a chosen start, about 69 years" },
          { label: "10 bits: machine ID", detail: "Up to 1,024 generators" },
          { label: "12 bits: sequence", detail: "Up to 4,096 IDs per millisecond per machine" },
        ],
      },
      {
        type: "compare",
        title: "News feed fan-out strategies",
        columns: [
          { title: "Push (on write)", points: ["Write post ID to each follower's feed", "Reads are one fast lookup", "Celebrity posts mean millions of writes"] },
          { title: "Pull (on read)", points: ["Merge followed accounts' posts at read time", "Writes are cheap", "Slow for users following thousands"] },
          { title: "Hybrid", points: ["Push for normal accounts", "Pull celebrities at read time and merge", "Used by large social apps"] },
        ],
      },
    ],
    examples: [
      {
        title: "URL shortener: from numbers to decisions",
        explanation: "Requirements: shorten a URL, redirect fast, links last for years, click counts wanted. Estimates: 100 million new links a month is about 40 writes per second. With 100 reads per write, that is about 4,000 redirects per second on average. Each record is about 500 bytes, so 50 GB a month, about 6 TB over ten years. Decisions follow from the numbers: writes are tiny, so one ID service with block allocation is enough; reads dominate, so cache hot codes in Redis; 6 TB needs a sharded key-value store; analytics needs 302, not 301; 7 base62 characters give about 3.5 trillion codes, far more than the 12 billion needed.",
        code: {
          lang: "text",
          code: `Writes:  100M/month / (30 x 86,400 s)    = ~40/s
Reads:   100 x writes                      = ~4,000/s (peak ~12,000/s)
Storage: 100M x 500 B = 50 GB/month       -> ~6 TB in 10 years
Codes:   62^7 = ~3.5 trillion            >> 12 billion links in 10 years
Choices: block-allocated counter IDs, Redis for hot codes,
         sharded key-value store, 302 redirects for click analytics`,
        },
      },
      {
        title: "News feed: one normal user and one celebrity post",
        explanation: "Maya has 300 followers. When she posts, a fan-out worker reads her follower list and pushes the post ID into 300 feed lists in Redis: 300 small writes, done in milliseconds, and each follower's next feed load is one list read. A singer with 50 million followers posts. Pushing would mean 50 million writes for one post, minutes of work, repeated for every post. So her account is marked as a celebrity and skipped by fan-out. When a follower opens the feed, the service reads their precomputed list, fetches the latest posts of the few celebrities they follow, merges both by time, and returns the first page with a cursor.",
      },
    ],
    cheatSheet: [
      "URL shortener: 7 base62 characters give 62^7, about 3.5 trillion codes",
      "302 redirects bring every click back for analytics; 301 lets browsers cache and skip you",
      "Snowflake ID: 41 bits time, 10 bits machine, 12 bits sequence (4,096 IDs per ms per machine)",
      "Chat: WebSockets plus a user-to-gateway registry; order by a per-conversation sequence number",
      "Feed: push post IDs to followers; pull celebrity posts at read time and merge",
      "Page feeds with a cursor (last seen ID), not OFFSET",
      "Rate limiter: atomic counters in Redis (INCR, MULTI or Lua); choose fail-open or fail-closed",
      "Every 10 minutes of a mock, sum up where you are and what comes next",
    ],
    quiz: [
      {
        q: "A URL shortener must count every click. Which redirect status fits best?",
        options: ["301 Moved Permanently", "302 Found (temporary)", "200 OK with the page content", "404 Not Found"],
        answer: 1,
        why: "Browsers may cache a 301 and stop asking you, so you would miss clicks; a 302 brings each click back.",
      },
      {
        q: "How many IDs can one Snowflake-style generator create per millisecond?",
        options: ["1,024", "256", "65,536", "4,096"],
        answer: 3,
        why: "The 12-bit sequence field gives 2^12 = 4,096 values per millisecond.",
      },
      {
        q: "What is the main problem with pure fan-out on write?",
        options: ["A post by an account with millions of followers needs millions of writes", "Feeds are slow to read", "Posts are lost", "It cannot use caching"],
        answer: 0,
        why: "The write cost grows with follower count, which explodes for celebrities.",
      },
      {
        q: "In a chat system, how does the service know which server holds Bob's WebSocket?",
        options: ["It asks every server", "Bob's phone number encodes it", "It looks it up in a shared registry of user to gateway", "The load balancer remembers it forever"],
        answer: 2,
        why: "Gateways register each connection in a shared store such as Redis, so any service can route to it.",
      },
      {
        q: "Your rate limiter's Redis is down. What does fail-open mean?",
        options: ["Requests are allowed through without limits until Redis returns", "All requests are blocked", "The limiter switches to a fixed window", "Redis restarts itself"],
        answer: 0,
        why: "Fail-open keeps the product working at the risk of overload; fail-closed protects the backend at the cost of users.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A shortener expects 500 million new links per month, 20 reads per write, and keeps links for 5 years. Estimate write and read QPS and total storage at 500 bytes per link.",
        hint: "A month has about 2.6 million seconds.",
        solution: `Writes:  500M / 2.6M s = ~190/s
Reads:   20 x 190 = ~3,800/s average (plan for ~10,000/s peak)
Links:   500M x 60 months = 30 billion
Storage: 30B x 500 B = ~15 TB (before replicas)
Codes:   62^7 = ~3.5 trillion, so 7 characters are plenty`,
      },
      {
        level: "medium",
        task: "Describe, in about eight lines, how a chat system delivers a message when the recipient is offline, and how it keeps messages in order.",
        hint: "Think about storage first, then notifications, then what the app does when it reconnects.",
        solution: `1. Sender's message reaches the chat service over WebSocket.
2. The service assigns the next sequence number for that conversation and stores it.
3. It acks the sender ("sent").
4. Registry lookup: the recipient has no live connection.
5. A push notification is sent (through APNs or FCM).
6. On reconnect, the app sends the last sequence number it has.
7. The server returns all later messages in sequence order.
8. The app acks them, and the sender sees "delivered".`,
      },
      {
        level: "hard",
        task: "Write your checkpoint notes for a timed 45-minute \"Design a news feed\" mock: what you will cover by minutes 5, 10, 15, 25, 40 and 45.",
        hint: "Follow the framework, and plan the deep dive around the fan-out decision.",
        solution: `0-5:   Requirements: post, follow, home feed sorted by time; 200M DAU; feed under 200 ms.
5-10:  Estimates: ~2 posts/user/day -> ~4,600 posts/s; ~20 feed loads -> ~46,000 reads/s.
10-15: API: POST /posts, GET /feed?cursor=; tables: users, follows, posts.
15-25: High level: post service, fan-out workers via queue, Redis feed lists, post cache.
25-40: Deep dive: hybrid fan-out with a celebrity threshold, cursor paging,
       shard posts by post_id and follows by user_id, cache misses, retries.
40-45: Trade-offs: push cost vs read speed, staleness of feeds;
       next steps: ranking, monitoring, multi-region.`,
      },
    ],
    faq: [
      { q: "How many system designs should I practise before interviews?", a: "Aim for eight to ten different prompts, with at least four done out loud under a 45-minute timer. Repeating a prompt a week later is a good test of whether the framework has stuck." },
      { q: "Should I draw diagrams during the interview?", a: "Yes. Draw boxes for clients, load balancer, services, caches and stores, and label the arrows with what flows along them. A clear drawing gives you and the interviewer something to point at." },
      { q: "What if the interviewer mentions a technology I don't know?", a: "Say so honestly and ask what property they care about, such as ordering or durability. Then reason from that property; interviewers value clear thinking over memorised product details." },
      { q: "How deep should I go on one component?", a: "Deep enough to show real trade-offs, such as how IDs are generated and what happens when that service fails. Ask the interviewer which area they want, and keep an eye on the clock so you still have time to wrap up." },
    ],
  },
};

export default extra;
