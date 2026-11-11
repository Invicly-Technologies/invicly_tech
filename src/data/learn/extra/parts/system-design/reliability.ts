import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "reliability/redundancy": {
    plain: [
      "Every machine, cable and data centre fails sooner or later. Redundancy means having a spare for each important part, so when one fails another takes over and users barely notice. A part with no spare, whose failure stops everything, is called a single point of failure.",
      "Think of a car with a spare tyre. The spare is useless unless you also know how to change the tyre and the jack is in the boot. In systems, the spare is a second server or database, and changing the tyre is failover: moving traffic from the broken part to the healthy one.",
      "There are two main styles. In active-passive, the spare waits quietly and only starts working when the main one fails. In active-active, every copy serves real traffic all the time, so losing one just means the others carry a bit more.",
      "Cloud providers split each region into availability zones: separate data centres with their own power and network, a few kilometres apart. Spreading copies across zones survives a data-centre outage. Spreading across regions survives the loss of a whole city's worth of infrastructure, but costs more and makes keeping data in sync harder.",
    ],
    deepDive: [
      {
        heading: "Finding single points of failure",
        body: "Walk one user request from start to finish and ask, at each hop, what happens if this one thing disappears. The obvious ones are a single database server or a single load balancer. The hidden ones cause more outages: one DNS provider, one NAT gateway that all outbound traffic uses, a config service every app reads at startup, a TLS certificate that expires, one shared Redis used by every service, the deploy pipeline, or the one engineer who knows how the system works.\n\nAlso look for shared fate: two redundant servers in the same rack, on the same power feed, or both depending on the same zone's storage are not really independent. True redundancy needs independent failure domains (racks, zones, regions) and no shared dependency below them.",
        bullets: ["Draw the request path and mark every component with only one copy", "Check dependencies used at startup, not just per request", "Two copies in one failure domain count as one"],
      },
      {
        heading: "Spare capacity: N+1 and the zone math",
        body: "Having a spare is not enough if the survivors cannot carry the load. If you run in three zones and lose one, the other two must carry everything, so each zone must handle half of peak traffic. That means in normal times each zone should run at no more than about two thirds of its capacity. With two zones, each must be able to carry all traffic alone, so normal use must stay under 50%.\n\nThis is called N+1 (enough for peak plus one failure) or N+2 (still safe while one unit is down for maintenance and another fails). Autoscaling helps but is not instant: new instances may take minutes to start, which is too slow for a sudden zone loss. Keep the static headroom, and make sure your cloud quota allows the extra instances you will need.",
      },
      {
        heading: "Active-passive failover in detail",
        body: "In active-passive, a standby copy is kept ready. How ready decides the recovery time (RTO) and cost. A cold standby is restored from backups (hours). A warm standby runs a smaller copy with data replicated continuously (minutes). A hot standby is a full copy ready to take traffic (seconds).\n\nFailover time is the sum of its steps: detecting the failure (health checks every few seconds, failing after several misses), deciding (automatic or a human), promoting the standby, and moving traffic. DNS-based failover adds the record's TTL on top, and some clients and resolvers cache longer than the TTL. A floating virtual IP or a load balancer switch moves traffic faster.\n\nThe data loss (RPO) depends on replication: synchronous replication can reach zero, asynchronous loses whatever was not shipped yet.",
        visual: {
          type: "flow",
          title: "Where failover time goes",
          steps: [
            { label: "Detect", detail: "3 missed checks x 10 s = 30 s" },
            { label: "Decide", detail: "Automatic: seconds; human: minutes" },
            { label: "Promote standby", detail: "Database promotion: 10 to 30 s" },
            { label: "Move traffic", detail: "DNS TTL 60 s or instant VIP switch" },
            { label: "Verify", detail: "Health checks pass on new primary" },
          ],
        },
      },
      {
        heading: "Active-active across regions",
        body: "In active-active, every region serves users all the time. Routing sends each user to a nearby healthy region using latency-based or geo DNS, or anycast (one IP address announced from many places). If a region fails, routing simply stops sending users there.\n\nThe hard part is data. Read-only or cacheable data is easy to copy everywhere. For writes there are three common patterns. Home region: each user's data lives in one region, and other regions forward that user's writes there. Multi-active with conflict rules: DynamoDB global tables accept writes in every region and reconcile concurrent updates with last writer wins. Globally consistent databases: Spanner and CockroachDB use consensus across regions, which gives strong consistency but adds cross-region latency to writes.\n\nCapacity matters here too: if one of three regions fails, the other two must absorb its users.",
        visual: {
          type: "compare",
          title: "Handling writes in active-active",
          columns: [
            { title: "Home region per user", points: ["Each user's data has one owner region", "No write conflicts", "Writes from afar are slower", "Failover moves the home"] },
            { title: "Multi-active, LWW", points: ["Write anywhere", "Async replication between regions", "Concurrent edits: last one wins", "DynamoDB global tables"] },
            { title: "Global consensus", points: ["Strongly consistent everywhere", "Write latency includes a quorum", "No conflict code needed", "Spanner, CockroachDB"] },
          ],
        },
      },
      {
        heading: "Testing failover before you need it",
        body: "Failover that has never been tested is a guess. Common surprises: the standby has an old config, the runbook points to a renamed dashboard, the promoted database lacks a needed index, DNS takes ten minutes instead of one, or the remaining capacity is too small.\n\nTeams build confidence with regular drills. A game day is a planned exercise where you deliberately fail a component in a controlled way, with everyone watching. Chaos engineering automates this: Netflix's Chaos Monkey randomly terminates production instances so services must tolerate it. Start in staging, then move to production during working hours with a clear abort plan.\n\nMeasure each drill against your targets: how long until users recovered (RTO) and how much data was lost (RPO). Fix what broke, then repeat. Failing back to the original primary is a separate step and deserves its own test.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Disaster recovery strategies, cheapest to fastest",
        root: "DR strategy",
        children: [
          { label: "Backup and restore", children: ["Restore from backups", "RTO hours, RPO up to the last backup"] },
          { label: "Pilot light", children: ["Data replicated, servers off", "RTO tens of minutes"] },
          { label: "Warm standby", children: ["Small running copy", "Scale up on failover, RTO minutes"] },
          { label: "Active-active", children: ["Full capacity in each region", "RTO near zero, highest cost"] },
        ],
      },
    ],
    examples: [
      {
        title: "Availability math for redundant parts",
        explanation: "A single app server is available 99.9% of the time, so it is down 0.1% of the time. Step 1: put two independent servers behind a load balancer. The service fails only when both are down at once: 0.001 x 0.001 = 0.000001, so availability is 99.9999%. Step 2: but components in a chain multiply. If the load balancer (99.99%) and the database (99.95%) are each single, the whole path is 0.9999 x 0.999999 x 0.9995, about 99.94%. Step 3: the weakest single component dominates, so make the database redundant next. These numbers assume failures are independent, which shared dependencies can break.",
      },
      {
        title: "Planning failover for a web app in two zones",
        explanation: "Targets: RTO under 2 minutes, RPO zero for orders. Step 1: run app servers in zones A and B behind a managed load balancer that spans both zones; each zone can carry full peak load. Step 2: run PostgreSQL with a primary in zone A and a synchronous standby in zone B, so committed orders exist in both. Step 3: use a failover manager such as Patroni with etcd; it promotes the standby about 30 seconds after the primary stops renewing its leader lock. Step 4: apps connect through a stable endpoint that follows the leader. Step 5: rehearse monthly by stopping the primary on purpose and timing recovery.",
      },
    ],
    cheatSheet: [
      "Two independent 99.9% parts in parallel give about 99.9999%; in series they give about 99.8%",
      "With 3 zones, keep each zone under about 66% at peak so 2 zones can carry everything",
      "RTO = how long recovery takes; RPO = how much recent data you may lose",
      "Failover time = detect + decide + promote + move traffic (+ DNS TTL)",
      "Hidden SPOFs: DNS, NAT gateway, config service, certificates, shared cache, one person",
      "DR ladder: backup-restore, pilot light, warm standby, active-active",
      "Test failover and failback regularly with game days",
    ],
    quiz: [
      {
        q: "You run in three availability zones. What is the highest safe normal utilisation per zone if you must survive losing one zone?",
        options: ["About 100%", "About 90%", "About 66%", "About 33%"],
        answer: 2,
        why: "Two remaining zones must carry all traffic, so each needs room to absorb half of the total.",
      },
      {
        q: "Which is a single point of failure even though you run 10 app servers?",
        options: ["All 10 read their settings at startup from one config server", "Each server has its own disk", "Servers are in three zones", "A load balancer pair in two zones"],
        answer: 0,
        why: "If the shared config service is down, no server can start, so it is a single point of failure.",
      },
      {
        q: "What mainly decides the RPO of a database failover?",
        options: ["The DNS TTL", "How many app servers you run", "The health check interval", "Whether replication is synchronous or asynchronous"],
        answer: 3,
        why: "RPO is about lost data, which depends on how much had not reached the standby.",
      },
      {
        q: "DynamoDB global tables accept writes in every region. How are concurrent updates to the same item resolved?",
        options: ["They are rejected", "Last writer wins", "The user is asked to choose", "By a two-phase commit"],
        answer: 1,
        why: "Global tables use asynchronous multi-active replication with last-writer-wins reconciliation.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every single point of failure in this setup: one DNS provider, one load balancer, three app servers in one zone, one PostgreSQL server, one Redis server.",
        hint: "Count copies and failure domains.",
        solution: "DNS provider (one vendor), load balancer (one),\nthe zone itself (all app servers share it),\nPostgreSQL (one server), Redis (one server).\nOnly the app servers have copies, and even they share one zone.",
      },
      {
        level: "medium",
        task: "Peak traffic is 9,000 requests per second and each server handles 1,000. How many servers do you need in total across 3 zones to survive one zone failure at peak?",
        hint: "After losing a zone, the other two must serve 9,000 rps.",
        solution: "Two zones must carry 9,000 rps, so each needs 4,500 rps of capacity.\n4,500 / 1,000 = 4.5, round up to 5 servers per zone.\nTotal: 5 x 3 = 15 servers (normal use: 9,000 / 15,000 = 60%).",
      },
      {
        level: "hard",
        task: "Design active-active for a note-taking app in two regions (EU and US) with RTO under 1 minute. Explain routing, where writes go, and what happens to EU users if the EU region fails.",
        hint: "Consider a home region per user plus asynchronous replication to the other region.",
        solution: "Routing: latency-based DNS with health checks sends users to the\nnearest healthy region.\nData: each user has a home region; writes go there (forwarded if needed)\nand replicate asynchronously to the other region.\nEU fails: DNS health checks stop routing to EU; US becomes home for EU\nusers using its replica. Notes written in the last seconds before the\nfailure may be missing (RPO of seconds) and are reconciled when EU returns.\nCapacity: each region sized to carry both regions' peak.",
      },
    ],
    faq: [
      { q: "Is a backup a form of redundancy?", a: "It is redundancy for data, not for service. A backup lets you recover lost data, but restoring it takes time, so it does not keep the system running during a failure." },
      { q: "Do I need multi-region?", a: "Most applications are fine in one region with multiple availability zones. Go multi-region when the business needs to survive a full regional outage, or when users on several continents need low latency." },
      { q: "What is the difference between high availability and disaster recovery?", a: "High availability keeps the service running through common failures like a server or zone loss, usually automatically. Disaster recovery is the plan for rare, large events such as losing a region or data corruption." },
    ],
  },

  "reliability/retries": {
    plain: [
      "When one computer calls another over a network, many things can go wrong: the message gets lost, the other side is busy, or the reply never comes back. A timeout is a rule that says: if no answer comes within this time, stop waiting. Without one, a program can wait forever.",
      "Many failures are temporary, so trying again often works. That is a retry. But retries have two dangers. First, if the request did succeed and only the reply was lost, trying again can do the action twice, like charging a card twice. Second, if a service is struggling, a flood of retries can knock it over completely.",
      "The fixes are simple ideas. Make actions idempotent, which means doing them twice has the same effect as doing them once. Wait longer after each failed try, called exponential backoff. Add a little randomness to the wait, called jitter, so thousands of clients don't all retry at the same moment.",
      "Done well, retries turn small hiccups into invisible delays. Done badly, they turn a small hiccup into a full outage. The difference is in the details: how long to wait, what to retry, how many times, and at which layer.",
    ],
    deepDive: [
      {
        heading: "Choosing timeout values",
        body: "There are usually two timeouts. The connect timeout covers opening the connection and should be short, often under a second inside a data centre. The request (or read) timeout covers waiting for the answer and should be based on the dependency's real latency: a common starting point is a bit above its p99 or p99.9 latency, so normal slow requests finish but stuck ones are cut off.\n\nTimeouts must shrink as you go deeper. If the user's request has a 2 second budget, the gateway cannot give a backend 3 seconds. Pass a deadline down the chain instead of fixed values: gRPC does this natively, sending the remaining time with each call so every service knows when the caller will give up. Work for a caller that already gave up is wasted, so check the deadline before starting expensive steps.",
        visual: {
          type: "layers",
          title: "A timeout budget shrinking down the call chain",
          layers: [
            { label: "Browser", detail: "Gives up after 5 s" },
            { label: "API gateway", detail: "Deadline 4 s" },
            { label: "Order service", detail: "Remaining 3.5 s; calls two backends" },
            { label: "Inventory service", detail: "Timeout 800 ms, one retry allowed" },
            { label: "Database query", detail: "Statement timeout 500 ms" },
          ],
        },
      },
      {
        heading: "What to retry and what not to",
        body: "Retry only errors that might succeed next time. Good candidates: connection failures and resets, timeouts, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout, and 429 Too Many Requests. For 429 and 503, honour the Retry-After header if the server sends one. 500 Internal Server Error is a judgement call: retry only if the operation is idempotent.\n\nNever retry errors that will fail again the same way: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict and 422 Unprocessable Content. Retrying them only adds load.\n\nAlso limit total attempts (3 to 5 is common) and total time. A retry policy that can run for minutes behind a user's click is worse than a fast, clear error.",
        bullets: ["Retry: timeouts, resets, 429, 502, 503, 504", "Maybe: 500, only for idempotent calls", "Never: 400, 401, 403, 404, 409, 422"],
      },
      {
        heading: "Backoff and jitter variants",
        body: "Exponential backoff doubles the wait each time: 100 ms, 200 ms, 400 ms, capped at some maximum. On its own, it keeps clients in sync: if a thousand clients failed at the same moment, they all retry at the same moments. Jitter breaks that pattern.\n\nAWS's well-known analysis compares three variants. Full jitter: sleep a random time between 0 and the capped backoff, which spreads retries most and does the least total work. Equal jitter: keep half the backoff and randomise the other half, which guarantees some minimum wait. Decorrelated jitter: each sleep is random between the base and three times the previous sleep, capped, which also spreads well.\n\nIn practice, full jitter with a cap is a solid default. AWS SDKs, gRPC retry policies and libraries like Python's tenacity already implement backoff with jitter, so prefer them over hand-written loops.",
      },
      {
        heading: "Idempotency keys in depth",
        body: "Some operations are naturally idempotent: setting a value (PUT), deleting by ID, or a conditional update like UPDATE ... WHERE version = 7. Others, like creating a payment, are not, so you add an idempotency key: a unique ID the client generates (a UUID) and sends with the request, for example in an Idempotency-Key header.\n\nThe server stores the key before doing the work, with a state of in progress, then saves the final response. A repeat with the same key gets the saved response instead of a second charge. Edge cases matter. A repeat that arrives while the first is still running should get a conflict (Stripe returns 409) rather than run in parallel. A repeat with the same key but a different body is a client bug and should be rejected. Keys expire after a window, for example 24 hours, so storage does not grow forever.",
        visual: {
          type: "flow",
          title: "Server handling of an idempotency key",
          steps: [
            { label: "Request with key", detail: "Idempotency-Key: 7f3c..." },
            { label: "Insert key if new", detail: "Unique constraint; state = in progress" },
            { label: "Key exists?", detail: "Done: return saved response; running: 409" },
            { label: "Do the work once", detail: "Charge card, create order" },
            { label: "Save response", detail: "State = done, expires in 24 h" },
          ],
        },
      },
      {
        heading: "Stopping retry storms",
        body: "Retries multiply. If a page calls service A, which calls B, which calls C, and every layer tries 3 times, one failure at C can produce 3 x 3 x 3 = 27 calls. When C is overloaded, this is exactly the wrong moment to send it 27 times more traffic.\n\nRules that prevent storms: retry at one layer only, usually the one closest to the failure or the client edge. Use a retry budget: allow retries to add at most about 10% extra traffic, and stop retrying when the budget is used up. AWS SDKs do something similar in standard retry mode with a retry token bucket. Combine retries with a circuit breaker, so when a dependency is clearly down, callers stop trying for a while. Finally, servers should shed load with a fast 503 or 429 plus Retry-After, which tells well-behaved clients exactly when to come back.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Safe and unsafe to retry",
        columns: [
          { title: "Safe as is", points: ["GET and HEAD reads", "PUT that sets a full value", "DELETE by ID", "Conditional update with a version"] },
          { title: "Needs a key or check", points: ["POST that creates a payment", "Increment a counter", "Send an email or SMS", "Append to a list"] },
        ],
      },
    ],
    examples: [
      {
        title: "Retries with tenacity in Python",
        explanation: "A service calls a partner API that sometimes returns 503. Step 1: set a short connect timeout and a read timeout based on the partner's p99. Step 2: retry only on timeouts, connection errors and retryable status codes. Step 3: use exponential backoff with random jitter, capped at 10 seconds, and stop after 4 attempts. Step 4: send an idempotency key so a retried POST cannot create a duplicate. The same key is reused on every attempt because it is created once outside the retried function.",
        code: {
          lang: "python",
          code: "import uuid, requests\nfrom tenacity import retry, stop_after_attempt, wait_random_exponential, retry_if_exception_type\nclass Retryable(Exception): pass\n\n@retry(retry=retry_if_exception_type((Retryable, requests.ConnectionError, requests.Timeout)),\n       wait=wait_random_exponential(multiplier=0.2, max=10), stop=stop_after_attempt(4))\ndef create_payment(body, key):\n    r = requests.post(\"https://api.example.com/payments\", json=body,\n                      headers={\"Idempotency-Key\": key}, timeout=(1, 3))\n    if r.status_code in (429, 502, 503, 504):\n        raise Retryable(r.status_code)\n    r.raise_for_status()\n    return r.json()\ncreate_payment({\"amount\": 1299}, str(uuid.uuid4()))",
        },
      },
      {
        title: "Storing idempotency keys in PostgreSQL",
        explanation: "Step 1: create a table with the key as primary key. Step 2: at the start of the request, try to insert the key; ON CONFLICT DO NOTHING tells you whether it was new. Step 3: if the insert returned nothing, the key exists: read its status and either return the stored response or a 409 if still processing. Step 4: after the work, store the response. Step 5: a nightly job deletes keys older than 24 hours.",
        code: {
          lang: "sql",
          code: "CREATE TABLE idempotency_keys (\n  key text PRIMARY KEY,\n  request_hash text NOT NULL,\n  status text NOT NULL DEFAULT 'processing',\n  response jsonb,\n  created_at timestamptz NOT NULL DEFAULT now()\n);\n\nINSERT INTO idempotency_keys (key, request_hash)\nVALUES ('7f3c9a1e', 'sha256-of-body')\nON CONFLICT (key) DO NOTHING\nRETURNING key;  -- no row returned means: seen before",
        },
      },
    ],
    cheatSheet: [
      "Always set both a connect timeout and a request timeout",
      "Request timeout: a little above the dependency's p99 latency, and below the caller's deadline",
      "Retry 429, 502, 503, 504, resets and timeouts; never 400, 401, 403, 404, 422",
      "Honour Retry-After on 429 and 503 responses",
      "Full jitter: sleep = random(0, min(cap, base x 2^attempt))",
      "3 retries at 3 layers = up to 27 calls; retry at one layer only",
      "Retry budget: retries may add at most about 10% to normal traffic",
      "Idempotency key: client-generated UUID, stored with the response, expires after about 24 h",
    ],
    quiz: [
      {
        q: "Why does exponential backoff need jitter?",
        options: ["To make retries faster", "So clients that failed together don't all retry at the same instant", "To make the request idempotent", "Because servers reject exact intervals"],
        answer: 1,
        why: "Without randomness, synchronised clients retry in waves that hit the service together.",
      },
      {
        q: "Which response should a client NOT retry?",
        options: ["503 Service Unavailable", "504 Gateway Timeout", "429 Too Many Requests", "422 Unprocessable Content"],
        answer: 3,
        why: "A 422 means the request itself is invalid, so sending it again will fail the same way.",
      },
      {
        q: "A user request has a 2 second deadline. What should the backend call's timeout be?",
        options: ["Less than the remaining deadline, for example 500 ms", "5 seconds, to be safe", "No timeout", "Exactly 2 seconds plus retry time"],
        answer: 0,
        why: "Inner timeouts must fit inside the caller's remaining budget, or the work is wasted.",
      },
      {
        q: "A retry with an idempotency key arrives while the first request is still processing. What is the best response?",
        options: ["Process it again in parallel", "Return 200 with an empty body", "Return a 409 Conflict so the client retries later", "Delete the key and start over"],
        answer: 2,
        why: "Running both in parallel could do the work twice; a conflict tells the client to wait and retry.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "With base = 100 ms, cap = 2 s and no jitter, list the backoff before each of 6 retries. Then say the range of the 4th wait with full jitter.",
        hint: "Double each time and stop at the cap.",
        solution: "100, 200, 400, 800, 1600, 2000 (capped) ms\n4th wait with full jitter: random between 0 and 800 ms.",
      },
      {
        level: "medium",
        task: "Write a Python function retry_call(fn, attempts=4, base=0.1, cap=5) that retries only on TimeoutError and ConnectionError, uses full jitter, and re-raises after the last attempt.",
        hint: "Sleep for random.uniform(0, min(cap, base * pow(2, i))) between attempts.",
        solution: "import random, time\n\ndef retry_call(fn, attempts=4, base=0.1, cap=5.0):\n    for i in range(attempts):\n        try:\n            return fn()\n        except (TimeoutError, ConnectionError):\n            if i == attempts - 1:\n                raise\n            time.sleep(random.uniform(0, min(cap, base * 2 ** i)))",
      },
      {
        level: "hard",
        task: "Design a retry budget: clients may retry only while retries stay under 10% of successful requests. Write the core logic as pseudocode.",
        hint: "Keep a token bucket: each success adds 0.1 tokens, each retry costs 1 token, with a cap.",
        solution: "tokens = 10.0; CAP = 10.0\non_success(): tokens = min(CAP, tokens + 0.1)\ncan_retry():\n    if tokens >= 1:\n        tokens -= 1\n        return True\n    return False           # budget spent: fail fast instead\n# 10 successes earn 1 retry, so retries <= about 10% of traffic.\n# During an outage, successes stop, tokens run out, and retries stop.",
      },
    ],
    faq: [
      { q: "How many times should I retry?", a: "Usually 2 to 4 attempts in total is enough to ride out brief hiccups. More attempts rarely help and add load and delay when a service is really down." },
      { q: "Is POST ever idempotent?", a: "Not by default, but you can make it so with an idempotency key or a unique client-supplied ID, so the server recognises and ignores repeats." },
      { q: "What is the difference between a timeout and a deadline?", a: "A timeout is a duration for one call, like 500 ms. A deadline is an absolute point in time for the whole request, passed down so every service knows how much time is left." },
    ],
  },

  "reliability/resilience-patterns": {
    plain: [
      "In a big system, services call other services. If one of them becomes slow or broken, the callers can get stuck waiting, then their callers get stuck, and soon everything is down. This chain reaction is called a cascading failure. Resilience patterns are tricks that stop the damage from spreading.",
      "A circuit breaker watches calls to a dependency. When too many fail, it trips and stops calling for a while, returning an error or a fallback answer at once. A bulkhead, named after the walls that divide a ship into watertight sections, gives each dependency its own limited pool of resources, so one leak cannot sink the whole ship.",
      "Backpressure means telling the sender to slow down when you cannot keep up, instead of quietly piling up work. Load shedding means politely refusing some requests when overloaded, so the ones you accept still get served well. A fast no is better than a slow maybe.",
      "Together, these patterns keep a problem small. One slow recommendation service should mean the product page has no recommendations, not that the whole shop is down.",
    ],
    deepDive: [
      {
        heading: "Why slow is worse than down",
        body: "A dependency that is down fails fast: you get a connection error in milliseconds and move on. A dependency that is slow holds your threads, connections and memory while you wait. Little's Law shows how fast this goes wrong: requests in flight = arrival rate x time per request. At 1,000 requests per second and 50 ms each, about 50 requests are in flight. If the dependency slows to 5 seconds, 5,000 are in flight. A server with a pool of 200 threads is full in a fraction of a second, and now even requests that never touch the slow dependency cannot get a thread.\n\nThis is how one slow database query or one sluggish third-party API takes down services that have nothing to do with it. Timeouts limit how long each request can hold resources, and the other patterns limit how many can.",
        visual: {
          type: "flow",
          title: "How one slow dependency spreads",
          steps: [
            { label: "Dependency slows", detail: "Latency 50 ms to 5 s" },
            { label: "Requests pile up", detail: "In flight grows 100x" },
            { label: "Pool exhausted", detail: "All threads waiting" },
            { label: "Healthy paths fail too", detail: "No free threads for anything" },
            { label: "Callers time out and retry", detail: "Failure moves upstream" },
          ],
        },
      },
      {
        heading: "Tuning a circuit breaker",
        body: "A breaker needs a few settings. Failure rate threshold: open when, say, 50% of calls fail. Sliding window: measure over the last 100 calls or the last 10 seconds. Minimum calls: do not judge on 3 calls; require at least, say, 20 in the window. Slow-call threshold: count calls slower than a limit (like 2 seconds) as failures, because slowness is the real danger. Open duration: stay open for, say, 30 seconds, then go half-open and allow a few trial calls.\n\nScope matters. One breaker per dependency, and sometimes per endpoint or per host, so one bad replica does not block calls to healthy ones. Libraries implement all of this: Resilience4j for Java, Polly for .NET, and service meshes like Envoy offer outlier detection, which ejects failing hosts from the load-balancing pool. Expose breaker state as a metric so you can see when and why it opened.",
        bullets: ["Count slow calls, not just errors", "Require a minimum number of calls before tripping", "One breaker per dependency (or host)", "Alert on breaker state changes"],
      },
      {
        heading: "Bulkheads in practice",
        body: "A bulkhead caps the resources any one dependency can use. The simplest form is a separate connection pool or thread pool per dependency, or a semaphore that limits concurrent calls. If the payment service may use at most 30 concurrent calls, a slow payment provider can tie up 30 slots and no more; requests for search, login and browsing keep their own capacity.\n\nThe same idea works at larger scales. Separate worker pools for interactive requests and batch jobs keep a big export from slowing the website. Per-tenant limits stop one noisy customer from starving others. Cell-based architecture splits the whole system into independent copies (cells), each serving a subset of customers, so a bad deploy or overload hits one cell, not everyone. In Kubernetes, CPU and memory limits are a bulkhead between pods on the same node.",
      },
      {
        heading: "Backpressure and load shedding",
        body: "When work arrives faster than you can process it, it must go somewhere. An unbounded queue just hides the problem: latency grows, memory grows, and requests time out after you have spent effort on them. So bound every queue, and when it is full, push back.\n\nBackpressure signals the producer to slow down: a full bounded queue blocks the producer, TCP flow control slows a sender, or Kafka consumers simply read more slowly. At an HTTP edge, the signal is a fast 503 or 429 with a Retry-After header.\n\nLoad shedding chooses what to drop. Drop low-priority work first (analytics, prefetches) before checkout. Drop requests whose deadline has already passed, since nobody is waiting for them. Adaptive concurrency limiters, like Netflix's concurrency-limits library or Envoy's adaptive concurrency filter, watch latency and lower the number of in-flight requests automatically when it rises.",
        visual: {
          type: "flow",
          title: "Load shedding at a busy server",
          steps: [
            { label: "Request arrives", detail: "With priority and deadline" },
            { label: "Deadline passed?", detail: "Yes: drop, nobody is waiting" },
            { label: "Over concurrency limit?", detail: "Yes: shed low priority first" },
            { label: "Return fast 503", detail: "With Retry-After" },
            { label: "Otherwise serve", detail: "Accepted work stays fast" },
          ],
        },
      },
      {
        heading: "Fallbacks and graceful degradation",
        body: "When a breaker is open or a call fails, return something useful instead of an error. Options include cached data (yesterday's recommendations), a default (a generic top-sellers list), a reduced feature (hide the reviews widget), or queuing the action for later (accept the order, process it when the payment provider recovers).\n\nGood fallbacks are simple and independent. A fallback that calls another service, or the same database, can fail at the same moment as the main path. And some operations have no safe fallback: you cannot pretend a payment succeeded. In those cases, fail clearly and fast.\n\nDecide fallbacks per feature ahead of time, and test them. Many teams run game days where they block a dependency on purpose and check that pages still load. A fallback that is never exercised tends to break quietly.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A circuit breaker tripping and recovering",
        actors: ["Caller", "Breaker", "Dependency"],
        messages: [
          { from: 0, to: 1, label: "Calls pass while closed" },
          { from: 1, to: 2, label: "Requests time out repeatedly" },
          { from: 1, to: 1, label: "Failure rate over 50%: open" },
          { from: 0, to: 1, label: "New call" },
          { from: 1, to: 0, label: "Fail fast with fallback" },
          { from: 1, to: 2, label: "After 30 s: one trial call (half-open)" },
          { from: 2, to: 1, label: "Success: close again" },
        ],
      },
      {
        type: "layers",
        title: "Defences from the edge to the dependency",
        layers: [
          { label: "Edge rate limits", detail: "Stop abusive or excess traffic early" },
          { label: "Load shedding", detail: "Reject what the server cannot finish" },
          { label: "Bulkhead per dependency", detail: "Cap concurrent calls" },
          { label: "Timeout and retry budget", detail: "Bound how long and how often" },
          { label: "Circuit breaker and fallback", detail: "Stop calling, serve a default" },
        ],
      },
    ],
    examples: [
      {
        title: "A minimal circuit breaker",
        explanation: "This class counts consecutive failures. After 5 in a row it opens and rejects calls for 30 seconds by raising at once. After that it allows one trial call (half-open): success closes it, failure reopens it. Real libraries use failure rates over a sliding window and count slow calls, but the state machine is the same. The caller catches CircuitOpen and serves a fallback.",
        code: {
          lang: "python",
          code: "import time\nclass CircuitOpen(Exception): pass\nclass Breaker:\n    def __init__(self, limit=5, cooldown=30):\n        self.limit, self.cooldown, self.fails, self.opened = limit, cooldown, 0, None\n    def call(self, fn):\n        if self.opened and time.monotonic() - self.opened < self.cooldown:\n            raise CircuitOpen()\n        try: result = fn()\n        except Exception:\n            self.fails += 1\n            if self.fails >= self.limit or self.opened: self.opened = time.monotonic()\n            raise\n        self.fails, self.opened = 0, None\n        return result",
        },
      },
      {
        title: "Sizing a bulkhead with Little's Law",
        explanation: "The product page calls a reviews service at 400 requests per second with a normal latency of 40 ms. Step 1: normal concurrency = 400 x 0.04 = 16 calls in flight. Step 2: allow headroom for bursts and p99 latency of 150 ms: 400 x 0.15 = 60. Step 3: set the bulkhead to 60 concurrent calls and the timeout to 300 ms. Step 4: if reviews slow to 5 seconds, only 60 slots are tied up; extra calls are rejected at once and the page renders without reviews. Without the cap, 400 x 5 = 2,000 requests would wait and could exhaust the whole server.",
      },
    ],
    cheatSheet: [
      "Little's Law: requests in flight = arrival rate x latency",
      "Breaker: open at about 50% failures over a window, with a minimum call count",
      "Count slow calls as failures; slowness is what exhausts pools",
      "One pool or semaphore per dependency is a bulkhead",
      "Bound every queue; an unbounded queue is a hidden outage",
      "Shed load with a fast 503 or 429 plus Retry-After",
      "Drop requests whose deadline already passed",
      "Fallbacks: cached data, defaults, hide the feature, or queue for later",
    ],
    quiz: [
      {
        q: "A service handles 2,000 requests per second. A dependency's latency rises from 20 ms to 2 s. Roughly how many calls are now in flight?",
        options: ["40", "400", "4,000", "40,000"],
        answer: 2,
        why: "2,000 per second x 2 seconds = 4,000 concurrent calls, by Little's Law.",
      },
      {
        q: "What does a bulkhead protect against?",
        options: ["One slow dependency using up resources that other features need", "Duplicate messages", "Network partitions between regions", "Expired TLS certificates"],
        answer: 0,
        why: "Separate, capped pools keep one dependency's slowness from exhausting shared threads or connections.",
      },
      {
        q: "Why is an unbounded in-memory queue dangerous under overload?",
        options: ["It drops messages randomly", "It makes requests idempotent", "It closes the circuit breaker", "Latency and memory grow until requests time out or the process crashes"],
        answer: 3,
        why: "Work piles up invisibly instead of being rejected early, so everything gets slow at once.",
      },
      {
        q: "Which is a poor fallback for a failing payment provider?",
        options: ["Queue the order and confirm payment later", "Show a clear error and ask to retry", "Report the payment as successful", "Offer another payment method"],
        answer: 2,
        why: "Faking success for money creates real losses; some operations must fail honestly.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For a news site's article page, name a fallback for each failing dependency: comments service, recommendation service, ad server, article database.",
        hint: "Ask: can the page work without it, and is there a cached version?",
        solution: "Comments: hide the section or show 'comments unavailable'.\nRecommendations: serve a cached or generic popular list.\nAds: render the page without ads.\nArticle database: serve the cached copy from the CDN; if none,\nshow an error, since the article is the core content.",
      },
      {
        level: "medium",
        task: "Implement a bulkhead in Python with a semaphore that allows at most 20 concurrent calls and rejects immediately (no waiting) when full.",
        hint: "threading.BoundedSemaphore with acquire(blocking=False).",
        solution: "import threading\nclass BulkheadFull(Exception): pass\nclass Bulkhead:\n    def __init__(self, limit=20):\n        self.sem = threading.BoundedSemaphore(limit)\n    def call(self, fn, *args):\n        if not self.sem.acquire(blocking=False):\n            raise BulkheadFull()\n        try:\n            return fn(*args)\n        finally:\n            self.sem.release()",
      },
      {
        level: "hard",
        task: "During a sale, checkout latency rises and the site starts failing. Design a load-shedding policy with three priority classes and describe what the server does at 80%, 95% and 100% of its concurrency limit.",
        hint: "Rank traffic by business value and shed the cheapest first.",
        solution: "Classes: P0 checkout and payment, P1 browsing and search,\nP2 analytics, prefetch, recommendations.\nAt 80%: reject P2 with 503 + Retry-After.\nAt 95%: also reject P1 for new sessions; serve cached pages via CDN.\nAt 100%: accept only P0; reject everything else fast.\nAlways: drop requests whose deadline has passed and use LIFO for\nthe queue so fresh requests win.\nAlert when shedding starts; scale out and review afterwards.",
      },
    ],
    faq: [
      { q: "What is the difference between a circuit breaker and a retry?", a: "A retry tries again hoping the next attempt works. A circuit breaker stops trying for a while when failures are frequent. They work together: retry a little, and let the breaker stop retries when a dependency is clearly down." },
      { q: "Do I need these patterns if I use a service mesh?", a: "A mesh like Istio or Linkerd can provide timeouts, retries, outlier detection and connection limits without code changes. You still need application-level fallbacks, because only your code knows what a sensible default answer is." },
      { q: "What is the difference between rate limiting and load shedding?", a: "Rate limiting enforces a fixed allowance per client, such as 100 requests per minute, even when the server is idle. Load shedding reacts to the server's actual condition and rejects work only when it is overloaded." },
    ],
  },

  "reliability/distributed-tx": {
    plain: [
      "Inside one database, a transaction makes several changes all-or-nothing. But when an action spans several services, each with its own database, there is no single transaction to wrap around them. Placing an order might mean charging a card in one service, reserving stock in another and booking a courier in a third.",
      "One classic answer is two-phase commit: a coordinator asks everyone to prepare, then tells everyone to commit. It works, but it is slow and fragile, because everyone must hold locks and wait, and if the coordinator dies at the wrong moment, they are stuck.",
      "Most modern systems use a saga instead. A saga is a chain of small local transactions, one per service. If a later step fails, the earlier steps are undone by compensations: for example, refund the payment if the stock cannot be reserved. The system is briefly inconsistent, but it always ends up in a correct state.",
      "Sagas need reliable messages between steps. The outbox pattern saves the event in the same database transaction as the change, so neither can happen without the other. Since messages can still arrive twice, every receiver must be able to handle duplicates safely.",
    ],
    deepDive: [
      {
        heading: "Why two-phase commit is costly",
        body: "In two-phase commit (2PC), a coordinator first sends prepare to every participant. Each one makes the change durable but not visible, keeps its locks, and votes yes or no. If all vote yes, the coordinator sends commit; otherwise abort. Once a participant votes yes, it may not decide on its own: it must wait for the coordinator.\n\nThat is the problem. Locks are held across at least two network round trips, so throughput drops. If the coordinator crashes after prepare, participants are in doubt and keep their locks until it recovers, blocking other work. Every participant must support the protocol (XA in many databases), and message brokers and third-party APIs usually do not.\n\n2PC still lives inside distributed databases like Spanner and CockroachDB, where each participant is itself a replicated consensus group, so a crashed node does not block the transaction for long.",
        visual: {
          type: "sequence",
          title: "Two-phase commit",
          actors: ["Coordinator", "Orders DB", "Payments DB"],
          messages: [
            { from: 0, to: 1, label: "Prepare" },
            { from: 0, to: 2, label: "Prepare" },
            { from: 1, to: 0, label: "Yes (locks held)" },
            { from: 2, to: 0, label: "Yes (locks held)" },
            { from: 0, to: 1, label: "Commit" },
            { from: 0, to: 2, label: "Commit" },
          ],
        },
      },
      {
        heading: "Orchestration vs choreography",
        body: "A saga can be run two ways. In orchestration, one service (the orchestrator) holds the saga's state and tells each participant what to do next: charge, then reserve, then ship, or compensate on failure. The flow is in one place, easy to read, monitor and change. Workflow engines like Temporal, AWS Step Functions and Camunda are built for this, with durable state and retries.\n\nIn choreography, there is no central brain. Each service listens for events and reacts: Orders publishes OrderCreated, Payments hears it and publishes PaymentCaptured, Inventory hears that and reserves stock. It is loosely coupled and simple for two or three steps, but the overall flow is scattered across services, and it is hard to answer where is order 77 right now.\n\nA common rule of thumb: choreography for short, simple flows; orchestration once a saga has more than three or four steps or complex failure handling.",
        visual: {
          type: "compare",
          title: "Two ways to run a saga",
          columns: [
            { title: "Orchestration", points: ["Central coordinator sends commands", "Flow visible in one place", "Easier to add steps and timeouts", "Temporal, Step Functions"] },
            { title: "Choreography", points: ["Services react to events", "No single coordinator", "Flow spread across services", "Good for 2 or 3 steps"] },
          ],
        },
      },
      {
        heading: "Designing compensations",
        body: "A compensation is a semantic undo, not a database rollback. You cannot unsend an email or un-charge a card, but you can send a correction or issue a refund. Each compensation must itself be idempotent and retryable, because it may run more than once.\n\nOrder the steps carefully. Put steps that are easy to undo, or likely to fail, early. Many sagas have a pivot step: the point of no return, such as capturing a payment or shipping a parcel. Steps before the pivot are compensatable; steps after it must be retried until they succeed rather than undone.\n\nSagas give up isolation: other requests can see the half-done state. Countermeasures include a semantic lock (mark the order PENDING so other flows treat it carefully), reserving rather than taking resources (hold stock, then confirm), and re-reading current values before acting.",
        bullets: ["Compensation = business-level undo (refund, release, cancel)", "Steps after the pivot are retried, not compensated", "Use PENDING states so others see work in progress"],
      },
      {
        heading: "The outbox relay: polling or CDC",
        body: "The outbox pattern writes an event row in the same transaction as the business change. A separate relay then publishes those rows to the broker. There are two ways to build the relay.\n\nPolling: a worker repeatedly selects unsent rows, publishes them, and marks them sent. With PostgreSQL, SELECT ... FOR UPDATE SKIP LOCKED lets several workers share the table without taking the same rows. It is simple but adds query load and some delay.\n\nChange data capture (CDC): a tool like Debezium reads the database's change log (the PostgreSQL WAL or MySQL binlog) and turns new outbox rows into Kafka messages, with low latency and no polling queries.\n\nEither way the relay may publish a row, crash before marking it sent, and publish it again, so delivery is at least once. Keep events for the same entity in order by using the entity ID as the Kafka message key, and delete old outbox rows regularly.",
      },
      {
        heading: "Idempotent consumers",
        body: "Because the outbox, brokers and retries all give at-least-once delivery, a consumer will sometimes see the same event twice. It must apply the effect only once.\n\nThe standard technique is a processed-events table with the event ID as its primary key. In one local transaction, the consumer inserts the event ID and applies the change. If the insert hits a duplicate key, the event was already handled, so the consumer skips it and acknowledges the message. Because both writes share one transaction, there is no window where the effect happened but the ID was not recorded.\n\nSome effects are naturally idempotent and need no table: setting status = SHIPPED, or an upsert keyed by order ID. Effects like add 10 points or send an email need the dedupe record. For external calls such as email providers, pass the event ID as their idempotency key too.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A travel booking saga with a pivot",
        steps: [
          { label: "Hold flight seat", detail: "Compensate: release hold" },
          { label: "Hold hotel room", detail: "Compensate: release hold" },
          { label: "Capture payment", detail: "Pivot: point of no return" },
          { label: "Confirm flight and hotel", detail: "Retry until it succeeds" },
          { label: "Send itinerary", detail: "Retry; idempotent by booking ID" },
        ],
      },
    ],
    examples: [
      {
        title: "A food order saga with a failure",
        explanation: "Step 1: Orders creates order 77 as PENDING and writes OrderCreated to its outbox in the same transaction. Step 2: the orchestrator tells Payments to authorise 25 dollars; it succeeds. Step 3: it tells Restaurant to accept the order; the restaurant is closed and replies rejected. Step 4: the orchestrator runs compensations in reverse: void the payment authorisation, then mark the order CANCELLED. Step 5: the customer sees a clear message. At no point were locks held across services, and every step and compensation can be retried safely because each uses the order ID as an idempotency key.",
      },
      {
        title: "Deduplicating events in a consumer",
        explanation: "A loyalty service gives 10 points per paid order. Kafka redelivers event e-901 after a consumer restart. Step 1: the consumer begins a transaction. Step 2: it inserts e-901 into processed_events; the first time this succeeds. Step 3: it adds the points. Step 4: it commits, then acknowledges the message. On redelivery, the insert does nothing, the consumer sees zero rows inserted, skips the points, and acknowledges. The customer gets 10 points, not 20.",
        code: {
          lang: "sql",
          code: "BEGIN;\nINSERT INTO processed_events (event_id)\nVALUES ('e-901')\nON CONFLICT (event_id) DO NOTHING;\n-- if 0 rows were inserted: ROLLBACK and acknowledge the message\nUPDATE loyalty SET points = points + 10\n WHERE user_id = 42;\nCOMMIT;",
        },
      },
    ],
    cheatSheet: [
      "2PC: prepare, then commit; participants hold locks and block if the coordinator dies",
      "Saga: local transactions plus compensations, eventually consistent",
      "Orchestration: one coordinator (Temporal, Step Functions); choreography: services react to events",
      "Pivot step = point of no return; later steps are retried, not undone",
      "Outbox: business row + event row in one transaction; a relay publishes later",
      "Relay options: polling with FOR UPDATE SKIP LOCKED, or CDC with Debezium",
      "Consumers dedupe with a processed_events table in the same transaction as the effect",
      "Use the entity ID as the Kafka key to keep its events in order",
    ],
    quiz: [
      {
        q: "What happens in 2PC if the coordinator crashes after all participants voted yes?",
        options: ["Participants commit on their own", "Participants abort on their own", "Participants stay in doubt, holding locks, until the coordinator recovers", "The client retries the commit"],
        answer: 2,
        why: "After voting yes, a participant cannot decide alone, so it blocks.",
      },
      {
        q: "What is a compensation in a saga?",
        options: ["A business action that reverses an earlier step, like a refund", "A database rollback across services", "A retry with backoff", "A distributed lock"],
        answer: 0,
        why: "Earlier steps already committed locally, so they are undone by a new, opposite action.",
      },
      {
        q: "What problem does the outbox pattern solve?",
        options: ["Slow queries", "Duplicate delivery to consumers", "Network partitions", "The dual write: saving to the database and publishing an event as two separate steps"],
        answer: 3,
        why: "Writing the event in the same transaction means it exists if and only if the change committed.",
      },
      {
        q: "Why must saga consumers be idempotent?",
        options: ["Because sagas use 2PC", "Because events can be delivered more than once", "Because compensations never run", "Because brokers reorder all messages"],
        answer: 1,
        why: "Outbox relays and brokers give at-least-once delivery, so duplicates are normal.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For a hotel booking saga (reserve room, charge card, send confirmation email), write the compensation for each step, or say why there is none.",
        hint: "Think about which step is the point of no return.",
        solution: "Reserve room: compensate by releasing the reservation.\nCharge card: compensate by issuing a refund.\nSend email: no real undo; make it the last step and retry it\nuntil it succeeds (or send a correction email if needed).",
      },
      {
        level: "medium",
        task: "Write the SQL a polling outbox relay runs to safely claim up to 100 unsent events when several relay workers run at once.",
        hint: "Lock rows and skip rows other workers already locked.",
        solution: "BEGIN;\nSELECT event_id, topic, payload FROM outbox\n WHERE sent_at IS NULL\n ORDER BY created_at\n LIMIT 100\n FOR UPDATE SKIP LOCKED;\n-- publish each row to the broker\nUPDATE outbox SET sent_at = now() WHERE event_id = ANY($1);\nCOMMIT;",
      },
      {
        level: "hard",
        task: "Design an orchestrated saga for 'transfer money between two banks' (debit at bank A, credit at bank B). Cover the steps, the pivot, compensations, and what happens if the orchestrator crashes mid-way.",
        hint: "Store saga state durably and make every step idempotent with the transfer ID.",
        solution: "1. Create transfer T (PENDING) in the orchestrator's DB.\n2. Bank A: place a hold on the amount (compensate: release hold).\n3. Bank B: credit, keyed by T (the pivot: money is now visible).\n4. Bank A: convert hold to debit (retry until success, not undone).\n5. Mark T COMPLETED.\nIf step 3 fails: release the hold, mark T FAILED.\nCrash: state and the next step are saved after each step; on restart\nthe orchestrator resumes T, re-sending the current step with key T,\nwhich the banks treat as idempotent.",
      },
    ],
    faq: [
      { q: "Is a saga the same as eventual consistency?", a: "A saga produces eventual consistency: for a short time other readers can see a half-finished state, but the saga always ends either fully done or fully compensated." },
      { q: "Can Kafka transactions replace sagas?", a: "No. Kafka transactions make reading from and writing to Kafka atomic within Kafka. They do not cover your service databases or external APIs, which is what a saga coordinates." },
      { q: "When is 2PC still acceptable?", a: "Inside a single distributed database that implements it on replicated nodes, such as Spanner or CockroachDB, or between a few tightly coupled systems with low latency where blocking on failure is acceptable." },
    ],
  },

  "reliability/consensus": {
    plain: [
      "Consensus is the problem of getting several computers to agree on one thing, even when some of them crash or messages are delayed. Who is the leader right now? Which order did these writes happen in? Is this lock taken? If machines disagree on such questions, data gets corrupted.",
      "The trick that makes it work is the majority. A decision only counts when more than half of the nodes accept it. Two different majorities of the same group always share at least one member, so two conflicting decisions can never both win. With five nodes, any three can decide, and the system survives two failures.",
      "Raft is the most popular consensus algorithm today because it was designed to be easy to understand. One node is elected leader, it puts every change into an ordered log, and a change is committed once a majority has stored it. If the leader dies, the others elect a new one.",
      "You rarely build consensus yourself. Tools like etcd (which runs Kubernetes) and ZooKeeper package it as a small, very reliable database for coordination: who is leader, which config is current, and which process holds a lock.",
    ],
    deepDive: [
      {
        heading: "What consensus actually solves",
        body: "Consensus means a group of nodes agrees on a value so that every node that decides picks the same value, the value was proposed by someone, and eventually the healthy nodes decide. Repeat that for every slot in a log and you get a replicated log: every node applies the same commands in the same order and ends in the same state. This is called state machine replication.\n\nThat one tool solves many problems: electing exactly one leader, assigning unique increasing IDs, storing cluster membership and config atomically, and implementing locks.\n\nThere is a theoretical limit, the FLP result: in a fully asynchronous network, no deterministic algorithm can guarantee it always finishes if even one node may crash. Real algorithms like Raft and Paxos stay always safe (never disagree) and use timeouts to make progress whenever the network behaves reasonably.",
      },
      {
        heading: "Raft log replication",
        body: "In Raft, all writes go to the leader. The leader appends the command to its log with the current term number and sends it to followers in AppendEntries messages, which also serve as heartbeats. When a majority (including the leader) has stored the entry, the leader marks it committed, applies it to its state machine and replies to the client. Followers learn the new commit index in later messages and apply the entry too.\n\nTwo rules keep this safe. The election restriction: a node only votes for a candidate whose log is at least as up to date as its own, so a new leader always has every committed entry. And log matching: each AppendEntries carries the index and term of the previous entry; if a follower's log does not match, it rejects the message and the leader backs up until the logs agree, overwriting the follower's uncommitted extras.",
        visual: {
          type: "sequence",
          title: "Committing one write in a 3-node Raft cluster",
          actors: ["Client", "Leader", "Follower 1", "Follower 2"],
          messages: [
            { from: 0, to: 1, label: "SET x = 5" },
            { from: 1, to: 2, label: "AppendEntries index 8, term 3" },
            { from: 1, to: 3, label: "AppendEntries index 8, term 3" },
            { from: 2, to: 1, label: "Stored" },
            { from: 1, to: 1, label: "2 of 3 stored: commit index 8" },
            { from: 1, to: 0, label: "OK" },
            { from: 1, to: 3, label: "Next heartbeat carries commit index 8" },
          ],
        },
      },
      {
        heading: "Sizing a consensus cluster",
        body: "A cluster of N nodes needs a majority of floor(N/2) + 1 to make progress, so it tolerates floor((N-1)/2) failures: 3 nodes tolerate 1, 5 tolerate 2, 7 tolerate 3. An even number adds cost without adding tolerance: 4 nodes need 3 for a majority and still survive only 1 failure.\n\nMore nodes are not free. Every write waits for a majority, so more members and longer distances mean slower writes. 3 or 5 members is typical for etcd and ZooKeeper.\n\nPlacement matters as much as count. Put members in different availability zones so one zone failure leaves a majority. With 5 nodes across 3 zones (2, 2, 1), losing any one zone leaves at least 3. Spreading members across regions survives a region loss but adds tens of milliseconds to every write, because each write waits for a cross-region round trip.",
        bullets: ["3 nodes: tolerate 1 failure; 5 nodes: tolerate 2", "Even sizes add cost, not tolerance", "Spread members across zones so no zone holds a majority"],
      },
      {
        heading: "etcd and ZooKeeper in practice",
        body: "etcd is a key-value store built on Raft. Kubernetes stores all its cluster state in it. It offers watches (get notified when a key changes), leases (keys that vanish if the owner stops sending keep-alives) and transactions (compare-and-set). Leader election uses a lease: the first process to create the leader key with its lease wins, and if it dies, the lease expires and the key disappears. etcdctl even has lock and elect commands. Keep data small: etcd is designed for megabytes to a few gigabytes of metadata, with a default storage quota of 2 GB.\n\nZooKeeper uses its own protocol, ZAB, and stores data in a tree of znodes. Ephemeral znodes vanish when the client session ends, and sequential znodes get an increasing number, which gives a classic election recipe: lowest number wins. Kafka used ZooKeeper for years, but Kafka 4.0 removed it in favour of KRaft, its built-in Raft.",
      },
      {
        heading: "Distributed locks done safely",
        body: "A distributed lock lets only one process at a time do some work. Locks must expire, or a crashed holder would block everyone forever, so they are leases with a time limit. That creates the classic danger: a process gets the lock, pauses for 40 seconds in a garbage collection or a slow disk write, the lease expires, another process gets the lock, and then the first wakes up and writes, believing it still holds the lock.\n\nThe fix is a fencing token: a number that increases each time the lock is granted. The holder sends it with every write, and the storage rejects any token lower than the highest it has seen. etcd's key revision and ZooKeeper's zxid can serve as tokens.\n\nAsk what the lock is for. If it only avoids duplicate work, a simple Redis lock with an expiry is fine. If correctness depends on it, use a consensus-backed lock plus fencing.",
        visual: {
          type: "compare",
          title: "Two reasons to use a lock",
          columns: [
            { title: "For efficiency", points: ["Avoid doing the same job twice", "A rare double run is acceptable", "Redis SET NX with expiry is enough", "Example: one cron runner"] },
            { title: "For correctness", points: ["Two holders would corrupt data", "Needs consensus (etcd, ZooKeeper)", "Must use fencing tokens", "Example: one writer to a file"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Raft node states",
        steps: [
          { label: "Follower", detail: "Accepts entries, waits for heartbeats" },
          { label: "Candidate", detail: "Election timeout: new term, ask for votes" },
          { label: "Leader", detail: "Won a majority, sends heartbeats" },
          { label: "Steps down", detail: "Sees a higher term, becomes follower" },
        ],
      },
    ],
    examples: [
      {
        title: "Leader election and locks with etcdctl",
        explanation: "Step 1: grant a lease with a 10 second TTL. Step 2: create the leader key only if it does not exist, attached to the lease, in one transaction. Step 3: the winner runs keep-alive to renew the lease; if the process dies, the lease expires and the key vanishes, so another node can win. Step 4: for simple cases, etcdctl has built-in elect and lock commands that do this for you and hold until the process is stopped.",
        code: {
          lang: "bash",
          code: "etcdctl lease grant 10\n# lease 694d7d1e2f3a0b11 granted with TTL(10s)\netcdctl txn --interactive\n# compares: create(\"/svc/leader\") = \"0\"\n# success:  put /svc/leader node-a --lease=694d7d1e2f3a0b11\netcdctl lease keep-alive 694d7d1e2f3a0b11\n\n# built-in helpers\netcdctl elect svc-election node-a\netcdctl lock nightly-report-lock ./run_report.sh",
        },
      },
      {
        title: "Why a 4-node cluster is worse than a 3-node one",
        explanation: "Step 1: 3 nodes need 2 for a majority, so they survive 1 failure. Step 2: 4 nodes need 3 for a majority, so they also survive only 1 failure. Step 3: but with 4 nodes, more machines can fail, so the chance that 2 fail together is higher, and every write must wait for 3 acknowledgements instead of 2. Step 4: if the 4 nodes are split 2 and 2 across two zones and the link between zones breaks, neither side has a majority and the cluster stops. So go from 3 straight to 5, and spread across 3 zones.",
      },
    ],
    cheatSheet: [
      "Majority = floor(N/2) + 1; tolerated failures = floor((N-1)/2)",
      "Use odd sizes: 3 nodes tolerate 1 failure, 5 tolerate 2",
      "Raft: leader appends, majority stores, then the entry is committed",
      "A node only votes for a candidate whose log is at least as up to date",
      "etcd: watches, leases, transactions; default storage quota 2 GB; keep data small",
      "ZooKeeper: ephemeral and sequential znodes; Kafka 4.0 replaced it with KRaft",
      "Locks are leases; protect real correctness with fencing tokens",
    ],
    quiz: [
      {
        q: "How many node failures can a 7-node Raft cluster tolerate?",
        options: ["1", "2", "3", "4"],
        answer: 2,
        why: "A majority of 7 is 4, so up to 3 nodes can fail.",
      },
      {
        q: "When is an entry committed in Raft?",
        options: ["When the leader writes it locally", "When all followers have stored it", "When the client acknowledges it", "When a majority of nodes have stored it"],
        answer: 3,
        why: "Majority storage guarantees any future leader will have the entry.",
      },
      {
        q: "A process holding a lease-based lock pauses for a long GC and wakes after the lease expired. What prevents its stale write?",
        options: ["A fencing token checked by the storage", "A longer TTL", "Retrying with backoff", "Using an even number of nodes"],
        answer: 0,
        why: "Storage rejects writes carrying a token older than the newest it has seen.",
      },
      {
        q: "What is etcd a good fit for?",
        options: ["Storing user-uploaded videos", "Leader election, config and service metadata", "Analytics queries over billions of rows", "A high-volume message queue"],
        answer: 1,
        why: "etcd is a small, strongly consistent store meant for coordination data.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Fill in the majority size and tolerated failures for clusters of 1, 2, 3, 4, 5 and 6 nodes.",
        hint: "Majority = floor(N/2) + 1.",
        solution: "N=1: majority 1, tolerates 0\nN=2: majority 2, tolerates 0\nN=3: majority 2, tolerates 1\nN=4: majority 3, tolerates 1\nN=5: majority 3, tolerates 2\nN=6: majority 4, tolerates 2",
      },
      {
        level: "medium",
        task: "A 5-node etcd cluster must survive the loss of any single availability zone. How do you place the nodes across 3 zones, and why not 2 zones?",
        hint: "After losing the biggest zone, at least 3 nodes must remain.",
        solution: "Place 2, 2, 1 across zones A, B, C.\nLosing any zone leaves at least 3 nodes, still a majority.\nWith 2 zones (3 + 2), losing the zone with 3 leaves only 2,\nwhich is not a majority, so the cluster stops.",
      },
      {
        level: "hard",
        task: "Write pseudocode for a storage service that enforces fencing tokens on writes to a file, and show how it blocks a client whose lock expired.",
        hint: "Store the highest token seen per resource and compare on every write.",
        solution: "highest = {}   # resource -> largest token seen\n\ndef write(resource, token, data):\n    if token < highest.get(resource, 0):\n        raise StaleToken(token)        # holder lost the lock\n    highest[resource] = token\n    persist(resource, data)\n\n# Client 1 gets token 33, pauses; lease expires.\n# Client 2 gets token 34 and writes: highest = 34.\n# Client 1 wakes and writes with 33: rejected.",
      },
    ],
    faq: [
      { q: "What is the difference between Raft and Paxos?", a: "Both solve the same problem with similar guarantees. Raft was designed to be easier to understand and implement, with a strong leader and clear election rules, so most new systems (etcd, Consul, CockroachDB, Kafka KRaft) use Raft." },
      { q: "Can I use Redis for distributed locks?", a: "Yes for efficiency, such as making sure a job usually runs once, using SET key value NX PX 30000. For locks that protect correctness, prefer a consensus-backed store and fencing tokens, because Redis locks can be held by two clients after failovers or long pauses." },
      { q: "Why not run consensus on every database write?", a: "Each consensus write waits for a majority round trip, which limits throughput and adds latency. Systems use it for the critical metadata (who leads, what the config is) and often for replicated logs within each shard, not one global log for everything." },
    ],
  },

  "reliability/observability": {
    plain: [
      "Observability means being able to look at a running system from the outside and understand what is happening inside, especially when something goes wrong. You get there by making the system report three kinds of signals: metrics, logs and traces.",
      "Metrics are numbers over time, like requests per second or error rate. They are cheap and good for dashboards and alerts. Logs are written records of events, like a diary. Traces follow one request as it hops between services, showing how long each hop took. Each answers a different question.",
      "To decide what good enough means, teams set an SLO (service level objective), a target like 99.9% of requests succeed within 300 ms over 30 days. The measurement behind it is the SLI (service level indicator). The SLA is the contract with customers, usually looser than the SLO and backed by refunds.",
      "The gap between 100% and the SLO is the error budget. If you have budget left, ship features freely. If you have used it up, slow down and fix reliability. This turns endless arguments about speed versus stability into a simple, shared rule.",
    ],
    deepDive: [
      {
        heading: "Choosing good SLIs",
        body: "A good SLI measures what users actually experience. The usual form is a ratio: good events divided by valid events. Availability: successful requests divided by all requests. Latency: requests faster than a threshold (say 300 ms) divided by all requests. For pipelines, freshness (data updated within 10 minutes) and correctness also work.\n\nMeasure as close to the user as practical: the load balancer logs are better than server metrics, because they include requests the server never saw. Exclude what you cannot control or should not count, like 4xx errors caused by bad client input, but be careful: a bug that returns 404 for real pages is your fault.\n\nDefine SLIs per user journey, not per server: checkout, search, login. A few meaningful SLOs (often 3 to 5 per service) beat dozens that nobody watches.",
        bullets: ["SLI = good events / valid events", "Measure at the load balancer or client when you can", "One SLO per important user journey"],
      },
      {
        heading: "Error budgets and burn-rate alerts",
        body: "A 99.9% SLO over 30 days allows 0.1% bad requests, or about 43 minutes of full downtime. The burn rate is how fast you are spending that budget: a burn rate of 1 uses exactly the whole budget in 30 days; a burn rate of 14.4 uses 2% of it in one hour.\n\nAlerting on raw error rate is noisy. Google's SRE Workbook recommends multi-window, multi-burn-rate alerts. Page someone when 2% of the budget burns in 1 hour (burn rate 14.4) or 5% in 6 hours (burn rate 6). Open a ticket when 10% burns in 3 days (burn rate 1). Each alert also checks a short window (for example 5 minutes for the 1-hour alert) so it stops firing quickly once the problem is fixed.\n\nAgree on an error budget policy in advance: what happens when the budget is spent, such as freezing feature releases until reliability work brings it back.",
        visual: {
          type: "flow",
          title: "From SLO to a page",
          steps: [
            { label: "SLO 99.9% / 30 days", detail: "Budget: 0.1% of requests" },
            { label: "Measure error ratio", detail: "Over 1 h and 5 min windows" },
            { label: "Burn rate = ratio / 0.001", detail: "1.44% errors is burn rate 14.4" },
            { label: "Both windows above 14.4?", detail: "2% of budget gone in an hour" },
            { label: "Page on-call", detail: "Slower burns open a ticket" },
          ],
        },
      },
      {
        heading: "Metrics: RED, USE and histograms",
        body: "Two checklists help decide what to measure. For request-driven services, RED: Rate (requests per second), Errors (failed requests per second), Duration (latency distribution). For resources like CPUs, disks and queues, USE: Utilisation (how busy), Saturation (how much work is waiting), Errors. Google's four golden signals (latency, traffic, errors, saturation) combine the two.\n\nRecord latency as a histogram, not an average. Averages hide the slow tail that users complain about, and you cannot average percentiles across servers. With Prometheus histograms, you aggregate bucket counts first and compute percentiles afterwards with histogram_quantile.\n\nWatch cardinality: every unique combination of label values is a separate time series. Labels like endpoint, status code and region are fine. Labels like user_id or request_id can create millions of series and overload the metrics system. Put those in logs and traces instead.",
      },
      {
        heading: "Logs that help at 3 a.m.",
        body: "Write logs as structured JSON with consistent fields: timestamp, level, service, message, and context such as user_id, order_id and trace_id. Structured logs can be filtered and aggregated (all errors for order 77) instead of grepped.\n\nInclude the trace ID in every log line. That is what lets you jump from a slow trace to the exact log lines for that request across all services. Use levels with discipline: ERROR for things someone should look at, WARN for suspicious but handled, INFO for key business events, DEBUG off in production by default.\n\nLogs are the most expensive signal at scale, because every line is stored and indexed. Control cost by sampling noisy success logs, keeping detailed logs for days and summaries longer, and never logging secrets, passwords, tokens or full card numbers.",
      },
      {
        heading: "Distributed tracing with OpenTelemetry",
        body: "A trace records one request's journey. Each step is a span with a name, start time, duration, attributes and a parent span. Spans from all services share one trace ID, so a tracing backend like Jaeger or Grafana Tempo can draw the whole request as a waterfall and show which hop was slow.\n\nThe trace context travels with the request. The W3C standard header is traceparent, for example 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01: version, trace ID, parent span ID and flags. OpenTelemetry, the vendor-neutral standard for traces, metrics and logs, provides SDKs and auto-instrumentation that create spans and pass this header for common frameworks.\n\nTracing every request is costly, so systems sample. Head sampling decides at the start (keep 5% of traces). Tail sampling decides after the trace finishes, so it can keep all errors and slow requests, at the cost of buffering spans in a collector.",
        visual: {
          type: "sequence",
          title: "One trace across three services",
          actors: ["Gateway", "Order service", "Payment service", "Database"],
          messages: [
            { from: 0, to: 1, label: "POST /orders, traceparent: trace T, span A" },
            { from: 1, to: 3, label: "INSERT order (span B, parent A)" },
            { from: 1, to: 2, label: "Charge, traceparent: trace T, span C" },
            { from: 2, to: 1, label: "OK after 820 ms (the slow hop)" },
            { from: 1, to: 0, label: "201 Created, total 900 ms" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "A typical observability pipeline",
        layers: [
          { label: "Instrumented apps", detail: "OpenTelemetry SDKs emit metrics, logs, traces" },
          { label: "Collector", detail: "OpenTelemetry Collector batches, samples, routes" },
          { label: "Storage backends", detail: "Prometheus metrics, Loki logs, Tempo or Jaeger traces" },
          { label: "Dashboards and queries", detail: "Grafana views linked by trace ID" },
          { label: "Alerting and on-call", detail: "Burn-rate alerts page a person" },
        ],
      },
    ],
    examples: [
      {
        title: "SLIs as Prometheus queries",
        explanation: "Assume the service exports http_requests_total with a code label and a latency histogram http_request_duration_seconds. Step 1: availability SLI is the share of non-5xx requests over the window. Step 2: latency SLI is the share of requests faster than 300 ms, using the le=\"0.3\" bucket (the histogram needs a bucket at exactly 0.3). Step 3: p99 latency for a dashboard aggregates buckets across instances first, then computes the percentile. Use these expressions in recording rules and burn-rate alerts.",
        code: {
          lang: "text",
          code: "# availability over 5 minutes\nsum(rate(http_requests_total{job=\"api\",code!~\"5..\"}[5m]))\n  / sum(rate(http_requests_total{job=\"api\"}[5m]))\n\n# share of requests under 300 ms\nsum(rate(http_request_duration_seconds_bucket{job=\"api\",le=\"0.3\"}[5m]))\n  / sum(rate(http_request_duration_seconds_count{job=\"api\"}[5m]))\n\n# p99 latency\nhistogram_quantile(0.99,\n  sum by (le) (rate(http_request_duration_seconds_bucket{job=\"api\"}[5m])))",
        },
      },
      {
        title: "Using the error budget to make a release decision",
        explanation: "The checkout SLO is 99.9% availability over 30 days, which allows about 43 minutes of full outage (30 x 24 x 60 x 0.001 = 43.2). Step 1: on day 12, a bad deploy caused 25 minutes of errors, and two smaller incidents cost 10 more. Step 2: 35 of 43 minutes are spent, leaving about 8. Step 3: a large database migration is planned for this week. Step 4: following the agreed policy, the team postpones the migration, ships only low-risk fixes, and adds an automatic rollback on error-rate spikes. When the window rolls forward and budget recovers, the migration goes ahead.",
      },
    ],
    cheatSheet: [
      "SLI = good events / valid events; SLO = target for it; SLA = contract with penalties",
      "99.9% over 30 days = about 43 minutes of downtime; 99.99% = about 4.3 minutes",
      "Burn rate 14.4 for 1 hour spends 2% of a 30-day budget: page",
      "RED for services (rate, errors, duration); USE for resources (utilisation, saturation, errors)",
      "Use latency histograms; never average percentiles",
      "Never put user_id or request_id in metric labels",
      "Put trace_id in every log line; propagate the W3C traceparent header",
      "Tail sampling keeps all slow and failed traces; head sampling is cheaper",
    ],
    quiz: [
      {
        q: "An SLO is 99.9% over 30 days. Errors run at 1.44% for an hour. What is the burn rate?",
        options: ["1.44", "14.4", "144", "0.144"],
        answer: 1,
        why: "Burn rate = observed error ratio / allowed ratio = 0.0144 / 0.001 = 14.4.",
      },
      {
        q: "Why should user_id not be a Prometheus metric label?",
        options: ["Prometheus cannot store strings", "It makes queries return wrong numbers", "It hides errors", "Each user creates a new time series, which explodes cardinality"],
        answer: 3,
        why: "Every unique label value is a separate series, so millions of users mean millions of series.",
      },
      {
        q: "Which signal best shows which service made one specific request slow?",
        options: ["A distributed trace", "A CPU metric", "A daily log summary", "An uptime check"],
        answer: 0,
        why: "A trace records every hop of that request with its timing.",
      },
      {
        q: "What is the main advantage of tail sampling over head sampling?",
        options: ["It needs no collector", "It is cheaper", "It can keep every error and slow trace because it decides after the trace completes", "It removes the need for trace IDs"],
        answer: 2,
        why: "Head sampling decides before knowing the outcome; tail sampling can choose interesting traces.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Compute the monthly (30-day) downtime allowed by SLOs of 99%, 99.9%, 99.95% and 99.99%.",
        hint: "30 days = 43,200 minutes.",
        solution: "99%:    432 minutes (7.2 hours)\n99.9%:  43.2 minutes\n99.95%: 21.6 minutes\n99.99%: 4.32 minutes",
      },
      {
        level: "medium",
        task: "Write two SLOs for a photo upload feature: one for availability and one for latency. Say exactly what counts as good and valid, and where you measure.",
        hint: "Exclude errors caused by the client, and pick a latency threshold for a given file size.",
        solution: "Availability: 99.9% of valid upload requests return 2xx, over 28 days.\n  Valid: all POST /photos except 4xx caused by bad input or files\n  over the size limit. Measured at the load balancer.\nLatency: 95% of uploads under 5 MB complete within 2 s, over 28 days.\n  Measured from the load balancer request duration histogram.",
      },
      {
        level: "hard",
        task: "Write a Prometheus alert expression that pages when the 1-hour AND 5-minute error ratios both exceed 14.4 times the budget of a 99.9% SLO.",
        hint: "Compute each ratio with rate() over the window, compare to 14.4 * 0.001, and combine with and.",
        solution: "(\n  sum(rate(http_requests_total{job=\"api\",code=~\"5..\"}[1h]))\n    / sum(rate(http_requests_total{job=\"api\"}[1h])) > (14.4 * 0.001)\n)\nand\n(\n  sum(rate(http_requests_total{job=\"api\",code=~\"5..\"}[5m]))\n    / sum(rate(http_requests_total{job=\"api\"}[5m])) > (14.4 * 0.001)\n)",
      },
    ],
    faq: [
      { q: "What is the difference between monitoring and observability?", a: "Monitoring watches for known problems with predefined dashboards and alerts. Observability is the broader ability to ask new questions about behaviour you did not predict, which needs rich, connected metrics, logs and traces." },
      { q: "Should my SLO be the same as my SLA?", a: "No. Set the internal SLO stricter than the external SLA, so you notice and fix problems before you owe customers refunds." },
      { q: "Is OpenTelemetry a monitoring tool?", a: "No. It is a standard and a set of SDKs and a collector for producing and shipping telemetry. You still need backends such as Prometheus, Jaeger, Tempo or a commercial vendor to store and view the data." },
      { q: "Why is 100% a bad SLO?", a: "It leaves no room for any change or failure, so every deploy becomes a risk to the target. Users also cannot tell 100% from 99.99%, because their own networks and devices fail more often than that." },
    ],
  },
};

export default extra;
