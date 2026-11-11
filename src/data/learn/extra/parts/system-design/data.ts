import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "data/sql-nosql": {
    plain: [
      "A database is a program that stores data safely and finds it again quickly. There are several families, and each one is shaped around a different way of asking for data. Relational databases (SQL) store rows in tables and let you ask almost any question. NoSQL is a loose name for everything else: key-value, document, wide-column and graph databases.",
      "A relational database is like a well-organised spreadsheet with strict columns. You store each fact once and connect tables with IDs. You can join tables, filter on any column and wrap many changes in one transaction that either fully happens or not at all. That makes it the safe default for orders, payments and user accounts.",
      "NoSQL databases give up some of that freedom to win something else. A key-value store is a giant dictionary: give a key, get a value, very fast. A document store keeps one JSON-like object per record. A wide-column store spreads huge write volumes across many machines. A graph database is built for following links between things, like friends of friends.",
      "The real question is never SQL or NoSQL in general. It is: what are the exact queries my app runs, how much data, how many writes per second, and what must never go wrong? Answer those first, then pick the family that makes those queries cheap.",
    ],
    deepDive: [
      {
        heading: "Relational databases: more scalable than people think",
        body: "PostgreSQL and MySQL handle far more than most products ever need. One well-tuned server with fast SSDs can serve tens of thousands of simple queries per second and store several terabytes. You add read replicas to spread reads, and a cache in front for hot data.\n\nModern relational databases also blur the line with NoSQL. PostgreSQL has a JSONB column type that stores JSON documents and can index them with a GIN index, so you can keep flexible attributes next to strict columns. Extensions like Citus, and databases like CockroachDB, YugabyteDB and Google Spanner, shard SQL tables across many machines while keeping transactions.\n\nThe real limit appears when one server can no longer absorb the writes, or when the data is too big for one disk. That is usually much later than teams fear.",
        bullets: ["Start relational unless you can name the access pattern it cannot serve", "JSONB plus a GIN index covers many document-style needs", "Distributed SQL keeps transactions while scaling out, at a latency cost"],
      },
      {
        heading: "Key-value and document stores",
        body: "A key-value store only understands one operation well: look up a value by its exact key. Redis keeps everything in memory, so reads take well under a millisecond, which suits sessions, carts, counters and caches. DynamoDB stores data on disk across many partitions and returns items in single-digit milliseconds at almost any scale, with a 400 KB limit per item.\n\nA document store such as MongoDB understands the inside of each value. Each record is a JSON-like document (BSON in MongoDB, up to 16 MB each), and you can query and index fields inside it. This fits data that is read and written as one unit, like a product with a varying list of attributes, or a user profile with nested settings.\n\nThe catch: data split across many documents has no cheap join, so you embed related data that is read together and accept some duplication.",
      },
      {
        heading: "Wide-column stores: built for huge write volumes",
        body: "Cassandra, ScyllaDB, HBase and Google Bigtable store rows grouped into partitions. In Cassandra, the primary key has two parts: the partition key decides which nodes hold the row, and the clustering columns sort rows inside that partition. Reading one partition in clustering order is very fast. Reading across many partitions is slow or not allowed.\n\nWrites go to an append-only commit log and an in-memory table, so they are cheap, and every node can accept them. That is why these stores suit chat messages, sensor readings, activity logs and time series, where you write constantly and read a slice of one partition.\n\nThe rule is query-first modelling: you design one table per query and duplicate data between tables. Keep each partition bounded (a common guideline is under about 100 MB), for example by adding a month to the partition key.",
        visual: {
          type: "compare",
          title: "Document vs wide-column modelling",
          columns: [
            { title: "Document (MongoDB)", points: ["One record = one nested document", "Index any field inside it", "Good for objects read as a whole", "Flexible, per-record shape"] },
            { title: "Wide-column (Cassandra)", points: ["Partition key picks the nodes", "Clustering columns sort rows", "Good for slices of one partition", "One table per query, data duplicated"] },
          ],
        },
      },
      {
        heading: "Graph databases: when relationships are the data",
        body: "In a graph database like Neo4j or Amazon Neptune, data is stored as nodes (things) and edges (relationships), and each node points directly to its neighbours. Following a relationship costs about the same no matter how big the whole graph is.\n\nIn SQL, a question like friends of friends who like the same band needs several self-joins. Each extra hop multiplies the work, and queries get slow and hard to write. In a graph query language like Cypher, the same question is a short pattern: MATCH (a)-[:FRIEND]->()-[:FRIEND]->(c).\n\nGraphs fit recommendations, fraud rings (accounts sharing cards and devices), network maps and permission hierarchies. They are a poor fit for simple lookups or big aggregate reports, so they usually sit beside a main database rather than replace it.",
      },
      {
        heading: "Matching a database to an access pattern",
        body: "Write down your top queries first, with expected volume. Then ask a few questions in order. Do you need multi-row transactions with strict rules, like moving money or reserving stock? Use relational. Is it lookup by one key at huge scale with no joins? Key-value. Do you write constantly and read recent items for one owner? Wide-column. Are multi-hop relationships the main query? Graph. Do you need full-text search? Add a search engine like Elasticsearch next to your main store.\n\nMost real systems are polyglot: they use two or three stores, each for what it is good at, and keep them in sync with events. Each extra database adds operations work, backups and failure modes, so add one only when the main store clearly cannot do the job.",
        visual: {
          type: "flow",
          title: "A quick path to a database choice",
          steps: [
            { label: "List top queries", detail: "With reads and writes per second" },
            { label: "Need transactions?", detail: "Yes: start relational" },
            { label: "Only lookup by key?", detail: "Yes: key-value store" },
            { label: "Write-heavy timelines?", detail: "Yes: wide-column store" },
            { label: "Multi-hop links?", detail: "Yes: graph database" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "One order stored three ways",
        columns: [
          { title: "Relational", points: ["orders, order_items, products tables", "Joined by IDs at read time", "Each fact stored once", "Any new query is easy"] },
          { title: "Document", points: ["One order document", "Items and prices embedded", "Read in one fetch", "Product name copied in"] },
          { title: "Key-value", points: ["Key: order#123", "Value: the whole order blob", "Only lookup by order ID", "Other queries need another table"] },
        ],
      },
    ],
    examples: [
      {
        title: "An online shop that uses three stores",
        explanation: "Step 1: list the access patterns. Checkout must reduce stock and create an order atomically, so orders and inventory live in PostgreSQL. Step 2: shopping carts are read and written on every page view and are fine to lose after a few days, so they go in Redis with a TTL (time to live). Step 3: product search needs typo tolerance and filters, so products are copied into Elasticsearch, which is updated from change events. PostgreSQL stays the source of truth. The checkout transaction below never sells stock that does not exist.",
        code: {
          lang: "sql",
          code: "BEGIN;\nUPDATE inventory SET qty = qty - 1\n WHERE sku = 'MUG-01' AND qty > 0;\n-- the app checks that 1 row was updated, else ROLLBACK\nINSERT INTO orders (user_id, sku, price_cents)\nVALUES (42, 'MUG-01', 1299);\nCOMMIT;",
        },
      },
      {
        title: "Storing chat messages in Cassandra",
        explanation: "The main query is: show the latest 50 messages of one conversation, then scroll back. Step 1: make conversation_id the partition key so one conversation lives together. Step 2: make message_id (a time-based UUID) the clustering column, sorted newest first. Step 3: the query reads one partition in order, which is fast at any scale. Step 4: for very busy group chats, add a bucket such as the month to the partition key so no partition grows forever.",
        code: {
          lang: "sql",
          code: "CREATE TABLE messages (\n  conversation_id uuid,\n  message_id timeuuid,\n  sender_id uuid,\n  body text,\n  PRIMARY KEY ((conversation_id), message_id)\n) WITH CLUSTERING ORDER BY (message_id DESC);\n\nSELECT * FROM messages\n WHERE conversation_id = 6a1f0c3e-2b4d-4e8a-9c1f-0d2e3f4a5b6c\n LIMIT 50;",
        },
      },
    ],
    cheatSheet: [
      "Default to PostgreSQL or MySQL; move to NoSQL for a named access pattern, not for fashion",
      "Money, stock, bookings: you want ACID transactions",
      "Sessions, carts, counters, caches: key-value (Redis, DynamoDB)",
      "Chat, events, time series at huge write rates: wide-column (Cassandra, Bigtable)",
      "Friends of friends, fraud rings, recommendations: graph (Neo4j, Neptune)",
      "In NoSQL, design one table per query and accept duplicated data",
      "DynamoDB item limit: 400 KB; MongoDB document limit: 16 MB",
      "Full-text search goes in a search engine kept in sync with the main database",
    ],
    quiz: [
      {
        q: "A bank needs to move money between two accounts so that either both balances change or neither does. Which store fits best?",
        options: ["A relational database with transactions", "A key-value cache", "A wide-column store with eventual consistency", "A search engine"],
        answer: 0,
        why: "Multi-row atomic updates are exactly what ACID transactions guarantee.",
      },
      {
        q: "In Cassandra, what decides which nodes store a row?",
        options: ["The clustering column", "The partition key", "The secondary index", "The insertion time"],
        answer: 1,
        why: "The partition key is hashed to place the row; clustering columns only sort rows inside the partition.",
      },
      {
        q: "Why do NoSQL data models often duplicate data?",
        options: ["To save disk space", "Because NoSQL cannot store numbers", "Because there are no cheap joins, so each query reads one prepared table", "To make writes slower and safer"],
        answer: 2,
        why: "Denormalising lets each known query be answered from one place without joins.",
      },
      {
        q: "Which query is the strongest sign that a graph database could help?",
        options: ["Get a user by ID", "Sum sales per month", "Store a session for 30 minutes", "Find people within three hops who share a device with a known fraudster"],
        answer: 3,
        why: "Multi-hop relationship traversal is the workload graph databases are built for.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pick a database family for each workload and give one reason: (a) login sessions, (b) invoices, (c) IoT temperature readings every second from 1 million devices, (d) a 'people you may know' feature.",
        hint: "Think about the main query and whether you need transactions.",
        solution: "(a) Key-value (Redis): lookup by session ID with a TTL.\n(b) Relational: invoices need transactions, joins and reports.\n(c) Wide-column or time-series store: huge write rate,\n    read a time slice per device.\n(d) Graph database: multi-hop friend relationships.",
      },
      {
        level: "medium",
        task: "Design a DynamoDB table for two queries: get an order by ID, and list one customer's orders newest first. Name the keys and any index.",
        hint: "A table has a partition key and an optional sort key; a global secondary index (GSI) gives a second access path.",
        solution: "Table Orders: partition key order_id.\n  -> get order by ID is a single GetItem.\nGSI ByCustomer: partition key customer_id, sort key created_at.\n  -> Query ByCustomer where customer_id = X,\n     ScanIndexForward = false, Limit = 20 for newest first.\nThe GSI is updated asynchronously, so it is eventually consistent.",
      },
      {
        level: "hard",
        task: "A social app stores follows in PostgreSQL (follows(follower_id, followee_id)). Write the 'suggest people followed by people I follow' query in Cypher, and explain when moving this feature to a graph database is worth it.",
        hint: "Count how many of your followees follow each candidate, and exclude people you already follow.",
        solution: "MATCH (me:User {id: $id})-[:FOLLOWS]->(:User)-[:FOLLOWS]->(s:User)\nWHERE s <> me AND NOT EXISTS { (me)-[:FOLLOWS]->(s) }\nRETURN s.id, count(*) AS mutual\nORDER BY mutual DESC LIMIT 10;\n\nWorth it when queries go 3+ hops or run interactively on a large graph,\nwhere SQL self-joins explode. For 2 hops, a SQL join plus a\nprecomputed table refreshed hourly is often enough.",
      },
    ],
    faq: [
      { q: "Is NoSQL faster than SQL?", a: "Not in general. A NoSQL store is fast for the queries it was modelled for and slow or unable to run others. A relational database with the right indexes is fast for a wide range of queries." },
      { q: "Can PostgreSQL replace MongoDB?", a: "Often, yes. A JSONB column with a GIN index stores and queries JSON documents well. MongoDB still has an edge in built-in sharding and developer tooling for document-first apps." },
      { q: "Does NoSQL mean no schema?", a: "No. The database may not enforce a schema, but your code still expects a shape. You end up managing the schema in the application instead." },
      { q: "What does polyglot persistence mean?", a: "Using more than one kind of database in one system, each for the queries it does best, such as PostgreSQL for orders and Redis for sessions." },
    ],
  },

  "data/replication": {
    plain: [
      "Replication means keeping the same data on more than one machine. If one machine dies, another still has the data. If many people read at once, several machines can share the work. And if your users live on different continents, a copy near each group makes reads faster.",
      "The simplest setup has one leader and some followers. Only the leader accepts changes. It writes each change to a log, a list of every change in order, and sends that log to the followers, which replay it. It is like a teacher writing on the board while students copy it into their notebooks.",
      "Copying takes time. The gap between the leader having a change and a follower having it is called replication lag. It is usually milliseconds, but under heavy load it can grow to seconds or minutes. During that gap, a reader asking a follower can see old data.",
      "Other setups let more than one machine accept writes. That helps when the leader is far away or down, but two people can now change the same thing at the same time in different places. Then the system must decide which change wins, and that is where most of the hard problems are.",
    ],
    deepDive: [
      {
        heading: "Synchronous, asynchronous and semi-synchronous",
        body: "With synchronous replication the leader waits for a follower to confirm a write before telling the client it succeeded. No acknowledged write is lost if the leader dies, but every write is as slow as the slowest waited-for follower, and if that follower is down, writes stop.\n\nWith asynchronous replication the leader confirms immediately and ships changes in the background. Writes are fast, but anything not yet shipped is lost if the leader fails.\n\nMost production setups choose a middle path: wait for one follower (or a quorum) and let the rest catch up asynchronously. PostgreSQL does this with synchronous_standby_names, for example ANY 1 (replica_a, replica_b), and the synchronous_commit setting. MySQL offers semi-synchronous replication, where the source waits until at least one replica has received the change.",
        bullets: ["Sync: no lost acknowledged writes, slower, blocked by a dead follower", "Async: fast, may lose the last writes on failover", "Semi-sync: wait for one, the rest catch up"],
        visual: {
          type: "sequence",
          title: "A semi-synchronous write",
          actors: ["Client", "Leader", "Sync follower", "Async follower"],
          messages: [
            { from: 0, to: 1, label: "UPDATE balance" },
            { from: 1, to: 2, label: "Ship log record" },
            { from: 2, to: 1, label: "Received and flushed" },
            { from: 1, to: 0, label: "Commit OK" },
            { from: 1, to: 3, label: "Ship log record later" },
          ],
        },
      },
      {
        heading: "What replication lag does to users",
        body: "When reads go to followers, lag shows up as strange behaviour. Read-your-writes breaks: a user edits their profile, the page reloads from a follower, and the old name appears. Monotonic reads break: two refreshes hit two followers with different lag, and a new comment appears, then vanishes. Consistent prefix breaks: on a partitioned system, you see an answer before the question it replies to.\n\nFixes are cheap if you plan for them. Read data the user just changed from the leader for a few seconds. Pin each user to one follower so their view never goes backwards. Or remember the log position of the user's last write and only read from a follower that has replayed at least that far. In PostgreSQL, pg_current_wal_lsn() on the primary and pg_last_wal_replay_lsn() on a replica give those positions.",
        bullets: ["Read-your-writes: route recent writers to the leader", "Monotonic reads: stick a user to one replica", "Monitor lag and pull replicas out of rotation when it grows"],
      },
      {
        heading: "Failover and split brain",
        body: "When the leader dies, a follower must take over. Failover has three steps: notice the failure (usually a missed heartbeat timeout of some seconds), choose the follower with the most recent data, and send all writes to it. Tools like Patroni for PostgreSQL and Orchestrator for MySQL automate this; Patroni, for example, keeps the leader lock in a consensus store such as etcd.\n\nTwo things can go wrong. With asynchronous replication, the new leader may lack the old leader's last writes, which are then lost or conflict when the old leader returns. Worse is split brain: the old leader was only cut off, not dead, and keeps accepting writes while the new one does too. Systems prevent this with fencing: the old leader must lose its lease, be shut off, or have its writes rejected before the new one starts.",
        visual: {
          type: "flow",
          title: "Automatic failover, step by step",
          steps: [
            { label: "Heartbeats stop", detail: "Leader misses its timeout" },
            { label: "Agree it is down", detail: "Coordinator or quorum decides" },
            { label: "Pick best follower", detail: "The one with the newest log position" },
            { label: "Fence the old leader", detail: "Revoke its lease or shut it off" },
            { label: "Promote and repoint", detail: "Clients and followers use the new leader" },
          ],
        },
      },
      {
        heading: "Multi-leader: local writes, shared conflicts",
        body: "In a multi-leader setup each region (or each offline device) has its own leader that accepts writes, and the leaders replicate to each other asynchronously. Users get fast local writes, and a region can keep working if the link to others breaks. Calendar and note apps that work offline are a form of this.\n\nThe price is write conflicts: two leaders change the same record before seeing each other's change. Common resolutions are last-write-wins (keep the change with the latest timestamp, silently dropping the other), merging fields, CRDTs (data types like counters and sets designed to merge automatically), or keeping both versions and asking the user or app to choose.\n\nA practical trick is to avoid conflicts: route all writes for one user or one document to the same home region, so conflicts only happen during failover.",
      },
      {
        heading: "Leaderless: any replica takes the write",
        body: "Dynamo-style stores such as Cassandra and Riak have no leader. The client, or a coordinator node, sends each write to all N replicas of a key and treats it as successful when W of them confirm. Reads ask R replicas and take the newest version. If W + R > N, at least one replica in every read has the latest acknowledged write.\n\nReplicas that missed a write are repaired in three ways. Read repair: during a read, stale replicas are updated with the newest value. Hinted handoff: a neighbour stores the write for a down node and passes it on when the node returns. Anti-entropy: a background job compares replicas, often with Merkle trees (hash trees that find differing ranges quickly), and copies missing data. Leaderless designs stay writable through node failures, but conflicting concurrent writes still need a rule.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Read-your-writes broken by lag",
        actors: ["User", "Leader", "Follower"],
        messages: [
          { from: 0, to: 1, label: "Change name to Ana" },
          { from: 1, to: 0, label: "Saved" },
          { from: 0, to: 2, label: "Load profile page" },
          { from: 2, to: 0, label: "Name is still Anna (not replayed yet)" },
          { from: 1, to: 2, label: "Log record arrives 2 s later" },
        ],
      },
    ],
    examples: [
      {
        title: "Measuring lag on a PostgreSQL replica set",
        explanation: "Your dashboard shows some users see stale order statuses. Step 1: on the primary, list replicas and their lag. replay_lag shows how far behind each replica is in time. Step 2: on a replica, check how old its last replayed transaction is. Step 3: if lag is regularly over a second, route order-status reads for 10 seconds after a change to the primary, and alert when any replica falls more than 30 seconds behind so the load balancer can drop it.",
        code: {
          lang: "sql",
          code: "-- on the primary\nSELECT client_addr, state, sync_state,\n       replay_lsn, replay_lag\n  FROM pg_stat_replication;\n\n-- on a replica\nSELECT now() - pg_last_xact_replay_timestamp() AS lag;",
        },
      },
      {
        title: "Lost writes after an asynchronous failover",
        explanation: "A primary in region A replicates asynchronously to region B with about 500 ms of lag. It accepts 2,000 writes per second. Step 1: the primary crashes. Step 2: the failover tool promotes B. Step 3: about 0.5 s x 2,000 = 1,000 acknowledged writes never reached B. Users were told those orders succeeded. Step 4: when A comes back, its extra writes conflict with new writes on B and must be reconciled by hand. The lesson: for data like payments, use at least one synchronous follower, and accept the extra write latency.",
      },
    ],
    cheatSheet: [
      "Leader-follower: one writer, simple, the default in PostgreSQL and MySQL",
      "Async replication loses the unshipped tail of writes on failover",
      "Semi-sync: wait for one follower, the rest catch up in the background",
      "Read-your-writes: send a user's reads to the leader for a few seconds after they write",
      "pg_stat_replication.replay_lag shows how far each PostgreSQL replica is behind",
      "Split brain is prevented by fencing: leases, STONITH, or rejecting stale-term writes",
      "Multi-leader and leaderless setups need a conflict rule: LWW, merge, or CRDT",
      "Leaderless repair: read repair, hinted handoff, anti-entropy with Merkle trees",
    ],
    quiz: [
      {
        q: "A user updates their bio and immediately sees the old one. Reads go to followers. What guarantee is missing?",
        options: ["Linearizable writes", "Monotonic writes", "Read-your-writes", "Durability"],
        answer: 2,
        why: "The user's own write has not reached the follower that served their read.",
      },
      {
        q: "What is the main risk of fully asynchronous replication?",
        options: ["Writes become very slow", "Followers cannot serve reads", "Recent acknowledged writes can be lost when the leader fails", "Conflicts happen on every write"],
        answer: 2,
        why: "The leader confirms before followers have the change, so a crash can drop the unshipped tail.",
      },
      {
        q: "Two nodes both accept writes as leader after a network glitch. What is this called?",
        options: ["Split brain", "Read repair", "Hinted handoff", "Replication lag"],
        answer: 0,
        why: "Split brain means two leaders diverge; fencing the old leader prevents it.",
      },
      {
        q: "Which is a reason to choose multi-leader replication?",
        options: ["It removes the need for conflict resolution", "It guarantees linearizable reads", "It uses less disk", "Users in several regions need low-latency writes"],
        answer: 3,
        why: "A leader per region lets writes complete locally, at the cost of conflicts.",
      },
      {
        q: "In a leaderless store, how does a replica that was down get the writes it missed?",
        options: ["It cannot; the data is lost", "Through hinted handoff, read repair and anti-entropy", "It becomes leader and replays its own log", "The client resends every write"],
        answer: 1,
        why: "These three mechanisms copy missed writes back onto the recovered replica.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For each feature, say whether reading from a lagging follower is acceptable: (a) a product's like count, (b) a user's own just-posted comment, (c) the balance shown before a transfer.",
        hint: "Ask: would a few seconds of old data confuse or harm the user?",
        solution: "(a) Acceptable: nobody notices a slightly old count.\n(b) Not acceptable for that user: read from the leader\n    or use read-your-writes routing.\n(c) Not acceptable: read from the leader (or a sync follower)\n    so the decision uses current data.",
      },
      {
        level: "medium",
        task: "Write pseudocode for a read router that guarantees read-your-writes using the leader's log position (LSN) stored in the user's session.",
        hint: "After a write, save the leader's current LSN. Before a read, find a replica that has replayed at least that LSN.",
        solution: "on_write(user):\n    leader.execute(write)\n    session[user].min_lsn = leader.query('SELECT pg_current_wal_lsn()')\n\non_read(user):\n    need = session[user].min_lsn or 0\n    for r in healthy_replicas():\n        if r.query('SELECT pg_last_wal_replay_lsn()') >= need:\n            return r.execute(read)\n    return leader.execute(read)   # no replica caught up yet",
      },
      {
        level: "hard",
        task: "Design replication for a notes app used offline on phones and laptops that syncs when online. Choose a model, explain how conflicts are handled for (a) note text and (b) a set of tags.",
        hint: "Each device is effectively a leader. Different data types can use different merge rules.",
        solution: "Model: multi-leader; every device accepts writes and syncs later.\nEach change carries a device ID and a version vector to detect concurrency.\n(a) Text: use a text CRDT or operational merge so concurrent edits\n    combine; if that is too complex, keep both versions and show a\n    conflict copy to the user rather than silently dropping one.\n(b) Tags: an observed-remove set CRDT; adds and removes from\n    different devices merge automatically without a winner.\nAvoid plain last-write-wins: clock skew between devices loses edits.",
      },
    ],
    faq: [
      { q: "Is replication the same as a backup?", a: "No. Replication copies every change, including mistakes like a DROP TABLE, to all replicas within seconds. Backups and point-in-time recovery let you go back to before the mistake." },
      { q: "How many replicas should I run?", a: "A common setup is three copies of the data: one leader and two followers, ideally in different availability zones. That survives one failure while keeping a spare during repairs." },
      { q: "What is a normal replication lag?", a: "In the same region, usually well under a second. Long transactions, heavy write bursts, slow replica disks or cross-region links can push it to seconds or more, so monitor it and alert on it." },
    ],
  },

  "data/partitioning": {
    plain: [
      "When data grows too big for one machine, or one machine cannot keep up with the writes, you split it into pieces. Each piece is called a partition or shard, and each lives on a different machine. Together they hold everything, but each machine only handles its own part.",
      "The key question is how to decide which row goes where. You pick a field called the shard key, like user ID, and use a rule to map it to a shard. A good rule spreads the data and the traffic evenly. A bad one sends most of the work to one unlucky machine, called a hot spot.",
      "There are two common rules. Range partitioning gives each shard a range of keys, like names A to F, which keeps nearby keys together. Hash partitioning runs the key through a hash function, which scrambles it into a number, and uses that number to pick the shard. That spreads keys evenly but scatters nearby keys.",
      "Data keeps growing, so you will add machines later. Moving data around is slow and risky, so good designs make it cheap: consistent hashing, a fixed number of small partitions, or automatic splitting of big ones. You also need a way for every request to find the right shard.",
    ],
    deepDive: [
      {
        heading: "Range partitioning in practice",
        body: "With range partitioning each shard owns a continuous slice of the sorted keys. HBase and Google Bigtable call these slices regions or tablets, and they split a slice in two automatically when it grows too big. Because keys stay sorted, a query like all orders from 1 to 7 March, or all keys starting with user42:, reads one or two shards instead of all of them.\n\nThe danger is sequential keys. If the key is a timestamp or an auto-increment ID, every new write lands at the end of the range, on one shard, while the others sit idle. The usual fix is a compound key that puts a well-spread field first, such as sensor_id then timestamp. Writes then spread across sensors, and one sensor's history is still a cheap range scan.",
        bullets: ["Good for range scans and ordered reads", "Splits automatically as ranges grow (HBase, Bigtable)", "Never lead the key with a timestamp"],
      },
      {
        heading: "Choosing a shard key",
        body: "A good shard key has three properties. High cardinality: many distinct values, so data can be spread across many shards (country has maybe 200 values; user ID has millions). Even frequency: no single value owns a large share of rows or traffic. Query alignment: your most common queries include the key, so each one goes to a single shard.\n\nThe third property is the one people forget. If you shard orders by order_id but the main screen is a customer's order history, every page view must ask all shards and merge results, which is called scatter-gather. Sharding by customer_id keeps one customer's orders together.\n\nMulti-tenant SaaS apps usually shard by tenant_id for this reason, and move very large tenants to their own dedicated shards.",
      },
      {
        heading: "Hot spots and how to cool them",
        body: "Even a well-spread key can have one very hot value: a celebrity's post, a viral product, a huge customer. That value lives on one shard, so that shard overloads while others are quiet.\n\nFor read-heavy hot keys, caching is the first answer: put the value in a cache, replicate it to several cache nodes, or keep a small in-memory copy on each app server for a few seconds. For write-heavy hot keys, split the key itself. Instead of writing to likes:post9, write to likes:post9:0 through likes:post9:9, chosen at random. Ten shards now share the writes. To read the total, read all ten and add them up.\n\nThis trade, called key salting or write sharding, makes reads ten times more expensive, so only apply it to keys you know are hot. Detect them with per-key metrics, not guesses.",
        visual: {
          type: "flow",
          title: "Splitting one hot counter across shards",
          steps: [
            { label: "Like arrives", detail: "For post 9" },
            { label: "Add random suffix", detail: "likes:post9:0 to :9" },
            { label: "Write lands on 1 of 10 keys", detail: "Spread over several shards" },
            { label: "Reader fetches all 10", detail: "One batched request" },
            { label: "Sum and cache", detail: "Total served for a few seconds" },
          ],
        },
      },
      {
        heading: "Three ways to rebalance",
        body: "When you add a machine, some data must move to it. Plain hash mod N moves almost everything, so real systems use one of three approaches.\n\nFixed number of partitions: create many more partitions than machines up front, and move whole partitions when machines join. Redis Cluster uses 16,384 hash slots (slot = CRC16(key) mod 16384) and moves slots between nodes. Elasticsearch fixes the number of primary shards when an index is created.\n\nDynamic splitting: start with few partitions and split any that grow too large, then move halves to other machines. HBase and Bigtable work this way.\n\nConsistent hashing with virtual nodes: each machine takes many positions on a hash ring, so a new machine takes small slices from all the others. Cassandra and DynamoDB-style systems use this; Cassandra 4.0 and later default to 16 tokens per node.",
        visual: {
          type: "compare",
          title: "Rebalancing strategies",
          columns: [
            { title: "Fixed partitions", points: ["Many slots created up front", "Move whole slots to new nodes", "Simple mapping table", "Redis Cluster, Elasticsearch"] },
            { title: "Dynamic splitting", points: ["Split partitions that grow", "Adapts to data size", "Starts on few nodes", "HBase, Bigtable"] },
            { title: "Consistent hashing", points: ["Nodes take many ring positions", "New node takes small slices", "No central size tracking", "Cassandra, Dynamo-style"] },
          ],
        },
      },
      {
        heading: "Routing requests and cross-shard queries",
        body: "Every request must find the shard holding its key. There are three common designs. A routing tier: clients talk to a proxy that knows the shard map, like mongos in MongoDB or Vitess's vtgate for MySQL. Smart clients: the client library caches the map and talks to the right node directly, as Redis Cluster clients do, following a MOVED reply when slots change. Any-node: the client talks to any node, which forwards the request, as in Cassandra, where nodes learn the ring through gossip.\n\nThe shard map itself usually lives in a small, strongly consistent store such as ZooKeeper or etcd.\n\nQueries without the shard key must ask every shard. Secondary indexes make this sharper: a local index lives on each shard (cheap writes, scatter-gather reads), while a global index is partitioned by the indexed field (one-shard reads, but every write may touch another shard).",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Anatomy of a sharded database",
        layers: [
          { label: "Application", detail: "Sends queries with the shard key" },
          { label: "Router or smart client", detail: "Looks up which shard owns the key" },
          { label: "Shard map", detail: "Kept in etcd, ZooKeeper or config servers" },
          { label: "Shards", detail: "Each holds one slice of the data" },
          { label: "Replicas per shard", detail: "Copies for failover and reads" },
        ],
      },
    ],
    examples: [
      {
        title: "Keeping related keys together in Redis Cluster",
        explanation: "You store a user's cart and profile as two keys and want to update both in one MULTI transaction. Redis Cluster only allows multi-key commands when all keys are in the same hash slot. Step 1: check the slots; different keys usually land in different slots. Step 2: wrap the shared part in braces, called a hash tag. Redis then hashes only the text inside the braces, so both keys share a slot. Step 3: use this sparingly, because putting too much under one tag creates a hot slot.",
        code: {
          lang: "bash",
          code: "redis-cli -c CLUSTER KEYSLOT cart:42\nredis-cli -c CLUSTER KEYSLOT profile:42\n# usually two different slots\n\nredis-cli -c CLUSTER KEYSLOT {user:42}:cart\nredis-cli -c CLUSTER KEYSLOT {user:42}:profile\n# same slot: only 'user:42' is hashed",
        },
      },
      {
        title: "Sharding a multi-tenant SaaS database",
        explanation: "A project tool has 20,000 customer companies and almost every query filters by company. Step 1: choose tenant_id as the shard key, so each query hits one shard and a tenant's data can be joined locally. Step 2: hash tenant_id into 1,024 logical partitions and map them onto 8 database servers, 128 each. Step 3: when growing to 16 servers, move 64 partitions from each old server to a new one; no row needs re-hashing. Step 4: the three largest tenants, which make up 15% of traffic, get their own dedicated servers so they cannot overload neighbours.",
      },
    ],
    cheatSheet: [
      "Good shard key: high cardinality, even traffic, and present in your main query",
      "Range partitioning: fast range scans, but sequential keys create one hot shard",
      "Hash partitioning: even spread, but range queries must ask every shard",
      "Redis Cluster: 16,384 slots, slot = CRC16(key) mod 16384; {tag} keeps keys together",
      "Create many more logical partitions than servers, then move partitions, not rows",
      "Hot write key: add a random suffix (key:0..9) and sum on read",
      "Local secondary index: cheap writes, scatter-gather reads; global index: the reverse",
    ],
    quiz: [
      {
        q: "Orders are sharded by order_id, but the busiest page lists one customer's orders. What happens?",
        options: ["Each page view must query every shard and merge results", "The page is served from one shard", "Writes become impossible", "Range scans become faster"],
        answer: 0,
        why: "The query does not include the shard key, so it becomes scatter-gather across all shards.",
      },
      {
        q: "Why is a timestamp a poor leading shard key for range partitioning?",
        options: ["Timestamps cannot be hashed", "All new writes go to the last range, creating a hot shard", "Timestamps have low cardinality", "It makes reads impossible"],
        answer: 1,
        why: "Time only moves forward, so the newest range receives every insert.",
      },
      {
        q: "How many hash slots does Redis Cluster use?",
        options: ["256", "1,024", "65,536", "16,384"],
        answer: 3,
        why: "Redis Cluster maps keys to 16,384 slots using CRC16 of the key.",
      },
      {
        q: "A like counter for one viral post overloads its shard with writes. What is a standard fix?",
        options: ["Shard by country instead", "Use one bigger key", "Split it into several suffixed sub-keys and sum them on read", "Turn off replication"],
        answer: 2,
        why: "Salting spreads writes for one logical key across many physical keys and shards.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Rate each shard key for a ride app's trips table (good or bad, and why): (a) city, (b) trip_id, (c) rider_id, (d) created_at.",
        hint: "Check cardinality, evenness and which queries include the key.",
        solution: "(a) city: bad, low cardinality and huge cities become hot.\n(b) trip_id: even spread, but 'my trips' queries become scatter-gather.\n(c) rider_id: good for rider history; heavy riders are still small.\n(d) created_at: bad, all new trips land on one shard.",
      },
      {
        level: "medium",
        task: "An IoT table stores readings(device_id, ts, value) with 50,000 writes per second. The main query is: readings for one device over the last 24 hours. Choose a partitioning scheme and key.",
        hint: "Combine a spreading field with an ordering field, and keep partitions bounded.",
        solution: "Partition key: (device_id, day) hashed across nodes.\nOrdering within a partition: ts.\nWrites spread over many devices; one device's day is one\nsorted partition, so the 24-hour query reads at most two\npartitions (today and yesterday). The day bucket stops any\npartition from growing forever.",
      },
      {
        level: "hard",
        task: "Implement a consistent hash ring with virtual nodes in Python. Show that adding a fourth node moves roughly a quarter of 10,000 keys.",
        hint: "Place each node at many hashed positions, sort them, and use bisect to find the first position clockwise from the key's hash.",
        solution: "import bisect, hashlib\nh = lambda s: int(hashlib.md5(s.encode()).hexdigest(), 16)\nclass Ring:\n    def __init__(self, nodes, v=100):\n        self.r = sorted((h(f'{n}#{i}'), n) for n in nodes for i in range(v))\n        self.k = [p for p, _ in self.r]\n    def get(self, key):\n        return self.r[bisect.bisect(self.k, h(key)) % len(self.r)][1]\nkeys = [f'k{i}' for i in range(10000)]\na, b = Ring(['A','B','C']), Ring(['A','B','C','D'])\nprint(sum(a.get(k) != b.get(k) for k in keys) / len(keys))  # about 0.25",
      },
    ],
    faq: [
      { q: "What is the difference between partitioning and sharding?", a: "They mean the same thing: splitting data into pieces held by different machines. Sharding is the common word for databases; partitioning is used more generally, and PostgreSQL also uses it for splitting one table on a single server." },
      { q: "When should I start sharding?", a: "As late as you reasonably can. Try indexes, caching, read replicas and a bigger server first, since sharding makes joins, transactions and operations harder. Shard when writes or data size truly outgrow one primary." },
      { q: "Can I change the shard key later?", a: "Usually only by copying all data into a new layout, which is slow and risky. Some systems help (MongoDB can reshard a collection online since version 5.0), but it is still expensive, so choose carefully at the start." },
    ],
  },

  "data/consistency": {
    plain: [
      "When data is copied to several machines, a question appears: if I write a value and then read it, will I always see my new value? Consistency models are the rules that answer this. They describe what a reader is allowed to see while copies are being updated.",
      "Strong consistency means the system behaves as if there were only one copy. Once a write is done, every reader sees it. Eventual consistency means the copies may disagree for a short time, but if writes stop, they all end up the same. Strong is easier to reason about; eventual is faster and keeps working during failures.",
      "The CAP theorem explains why you cannot always have both. If the network between machines breaks, called a partition, each machine must choose: answer requests with possibly old data (stay available), or refuse until it can talk to the others (stay consistent). Networks do break, so this choice is real.",
      "PACELC adds the everyday case. Even when the network is fine, waiting for other copies to agree takes time. So you trade speed against consistency all the time, not just during failures. Good designs make this choice per feature: strict for payments, relaxed for like counts.",
    ],
    deepDive: [
      {
        heading: "What CAP actually means",
        body: "CAP is often summarised as pick two of three, which is misleading. In the theorem, C means linearizability (every read sees the latest completed write, as if there were one copy), A means every request to a working node gets a non-error answer, and P means the system keeps running when messages between nodes are lost.\n\nYou cannot opt out of partitions, so the real choice only appears when one happens. A CP system refuses some requests during the partition to avoid stale or conflicting data: etcd, ZooKeeper and a PostgreSQL primary with synchronous replicas behave like this. An AP system keeps answering on both sides and reconciles later: Cassandra at consistency level ONE, or DNS.\n\nMost of the time there is no partition at all, which is why CAP alone says little about everyday behaviour.",
        visual: {
          type: "sequence",
          title: "The CAP choice during a partition",
          actors: ["Client", "Node A", "Node B"],
          messages: [
            { from: 0, to: 1, label: "Write x = 2" },
            { from: 1, to: 2, label: "Replicate x = 2 (lost: network split)" },
            { from: 0, to: 2, label: "Read x" },
            { from: 2, to: 0, label: "CP: error, cannot confirm latest" },
            { from: 2, to: 0, label: "AP: x = 1, possibly stale" },
          ],
        },
      },
      {
        heading: "PACELC: the everyday trade-off",
        body: "PACELC reads: if there is a Partition, choose Availability or Consistency; Else, choose Latency or Consistency. The second half matters more day to day, because waiting for other replicas costs a network round trip, and across regions that is tens to hundreds of milliseconds.\n\nReal systems expose this as a setting. DynamoDB reads are eventually consistent by default; a strongly consistent read (ConsistentRead set to true) returns the latest value but uses twice the read capacity and is not supported on global secondary indexes. Cassandra lets you choose a consistency level per query. Google Spanner chooses consistency in both cases and uses tightly synchronised clocks (TrueTime) to keep the latency cost acceptable.\n\nSo the useful question is not which letter a database is, but what each read and write in your app actually needs.",
        bullets: ["Cassandra and DynamoDB defaults: PA/EL (fast, may be stale)", "Spanner, etcd: PC/EC (consistent, pays latency)", "Many systems let you choose per request"],
      },
      {
        heading: "Quorum math and where it falls short",
        body: "With N replicas, a write waits for W acknowledgements and a read asks R replicas. If W + R > N, every read set overlaps every write set in at least one replica, so the read can see the latest acknowledged write. A majority quorum is floor(N/2) + 1: 2 of 3, or 3 of 5. Each setting has a failure budget: with N = 3, W = 2 and R = 2, one replica can be down and both reads and writes still work.\n\nQuorums alone do not give full linearizability. A write that reaches only one replica before failing can still be seen by some reads and not others. Concurrent writes need a rule like last-write-wins, which can drop data. Sloppy quorums (writing to substitute nodes during failures) break the overlap guarantee. Cassandra exposes these choices as ONE, QUORUM, LOCAL_QUORUM and ALL.",
        visual: {
          type: "flow",
          title: "A quorum read with N = 3, R = 2",
          steps: [
            { label: "Client asks coordinator", detail: "Read key x at QUORUM" },
            { label: "Query replicas", detail: "Send to replicas holding x" },
            { label: "Wait for 2 replies", detail: "Ignore the slowest one" },
            { label: "Pick newest version", detail: "Compare timestamps or versions" },
            { label: "Repair and reply", detail: "Fix a stale replica, return value" },
          ],
        },
      },
      {
        heading: "The models in between",
        body: "Between strong and eventual there are useful middle levels. Causal consistency means if one action could have caused another, everyone sees them in that order: a reply never appears before the message it answers. Unrelated actions may appear in different orders to different users. It can be provided without the cost of global coordination, which makes it attractive for social and collaborative apps.\n\nSession guarantees are promises to one user. Read-your-writes: you always see your own changes. Monotonic reads: once you have seen a value, you never see an older one. Monotonic writes: your writes are applied in the order you made them. Writes-follow-reads: a write you make after reading something is ordered after that thing.\n\nMongoDB offers causally consistent sessions, and many apps get session guarantees by pinning a user to one replica or reading from the leader after a write.",
      },
      {
        heading: "Choosing consistency per feature",
        body: "One system can mix levels. In an online shop, the stock count during checkout must be strongly consistent, or you sell the same last item twice. The product page's stock badge (in stock, low stock) can be a few seconds stale. Reviews and ratings can be eventually consistent. The user's own cart needs read-your-writes but nothing stronger.\n\nAsk two questions for each piece of data. What is the cost if a reader sees a value that is a few seconds old? And what is the cost if the feature is unavailable during a network problem? If stale data causes money loss, double-booking, or security holes (like a revoked permission still working), pay for strong consistency. If unavailability is worse than staleness, choose eventual consistency and design the UI to tolerate it.",
        bullets: ["Strong: money, stock at checkout, unique usernames, locks, permissions", "Session guarantees: a user's own profile, cart, settings", "Eventual: counts, feeds, recommendations, analytics"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "CP vs AP behaviour during a network split",
        columns: [
          { title: "CP system", points: ["Minority side rejects requests", "No stale or conflicting data", "Some users see errors", "etcd, ZooKeeper, Spanner"] },
          { title: "AP system", points: ["Both sides keep answering", "Reads may be stale", "Conflicts merged after healing", "Cassandra at ONE, DNS"] },
        ],
      },
    ],
    examples: [
      {
        title: "Tuning consistency in Cassandra",
        explanation: "A keyspace keeps 3 replicas in one data centre. Step 1: for order writes and the checkout read, use QUORUM, which waits for 2 of 3 replicas: W + R = 4 > 3, so reads overlap writes, and one replica may be down. Step 2: for an activity log that is read rarely, write at ONE for speed. Step 3: in a multi-region setup, LOCAL_QUORUM keeps the wait inside the local data centre, avoiding cross-region latency on every request. CONSISTENCY is a cqlsh command; drivers set the level per statement.",
        code: {
          lang: "sql",
          code: "CREATE KEYSPACE shop WITH replication =\n  {'class': 'NetworkTopologyStrategy', 'dc1': 3};\n\nCONSISTENCY QUORUM;\nINSERT INTO shop.orders (id, status) VALUES (1001, 'PAID');\nSELECT status FROM shop.orders WHERE id = 1001;\n\nCONSISTENCY ONE;\nINSERT INTO shop.activity (user_id, ts, event)\nVALUES (42, toTimestamp(now()), 'viewed');",
        },
      },
      {
        title: "Strong reads in DynamoDB only where needed",
        explanation: "A booking service stores seat holds in DynamoDB. Step 1: the seat map shown while browsing uses default eventually consistent reads, which are cheaper and faster. Step 2: right before confirming a booking, the service reads the seat with a strongly consistent read so it sees the latest hold. Step 3: the final write uses a condition expression so it only succeeds if the seat is still free, which protects against races even between two strong reads.",
        code: {
          lang: "bash",
          code: "aws dynamodb get-item --table-name Seats \\\n  --key '{\"seat_id\": {\"S\": \"F12\"}}' \\\n  --consistent-read\n\naws dynamodb put-item --table-name Seats \\\n  --item '{\"seat_id\": {\"S\": \"F12\"}, \"holder\": {\"S\": \"u42\"}}' \\\n  --condition-expression 'attribute_not_exists(holder)'",
        },
      },
    ],
    cheatSheet: [
      "CAP: during a partition, a replica either refuses (CP) or may answer stale (AP)",
      "PACELC: else, when healthy, trade latency against consistency",
      "Quorum overlap rule: W + R > N; majority = floor(N/2) + 1",
      "N=3, W=2, R=2 tolerates one down replica for reads and writes",
      "DynamoDB strong reads cost 2x read capacity and are not available on GSIs",
      "Cassandra levels: ONE, QUORUM, LOCAL_QUORUM, ALL, chosen per query",
      "Causal consistency: replies never appear before the message they answer",
      "Pick consistency per feature by asking what a stale read would cost",
    ],
    quiz: [
      {
        q: "What does the C in CAP formally mean?",
        options: ["Linearizability: reads see the latest completed write", "ACID consistency of constraints", "Eventual convergence", "Consistent hashing"],
        answer: 0,
        why: "CAP's C is the single-copy, linearizable behaviour, not the C in ACID.",
      },
      {
        q: "With N = 5 replicas and W = 2, what is the smallest R that guarantees overlap?",
        options: ["2", "3", "5", "4"],
        answer: 3,
        why: "W + R must exceed 5, so R must be at least 4.",
      },
      {
        q: "What does PACELC add to CAP?",
        options: ["A rule for backups", "A latency versus consistency trade-off when there is no partition", "A way to avoid partitions", "A formula for shard counts"],
        answer: 1,
        why: "The ELC part covers the normal case, where coordination costs latency.",
      },
      {
        q: "A user posts a reply, and a friend sees the reply but not the original message. Which model would prevent this?",
        options: ["Monotonic writes only", "Eventual consistency", "Causal consistency", "Last-write-wins"],
        answer: 2,
        why: "Causal consistency guarantees that a cause is seen before its effects.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For N = 3, list every (W, R) pair from 1 to 3 that satisfies W + R > N, and say which pair gives the fastest reads.",
        hint: "There are six pairs that work.",
        solution: "(1,3) (2,2) (2,3) (3,1) (3,2) (3,3)\nFastest reads: W=3, R=1 (read one replica),\nbut writes then fail if any replica is down.",
      },
      {
        level: "medium",
        task: "Classify each feature of a social app as needing strong, session, or eventual consistency and justify: unique username signup, own profile edits, follower count, blocking a user.",
        hint: "Think about what a stale read would cause.",
        solution: "Username signup: strong, or two people get the same name.\nOwn profile edits: session (read-your-writes) is enough.\nFollower count: eventual; a few seconds stale is invisible.\nBlocking: strong (or at least fast and reliable), because a\nstale permission lets the blocked person keep interacting.",
      },
      {
        level: "hard",
        task: "A Dynamo-style store with no blocking read repair uses N = 3 and reads and writes at quorum (2 of 3). Describe a sequence of events where a read still returns an old value even though W + R > N.",
        hint: "Consider a write that fails after reaching only one replica, or concurrent writes with clock skew.",
        solution: "1. Write x=2 reaches replica A only, then the coordinator times out;\n   the client is told the write failed.\n2. Read 1 asks A and B: newest is x=2 (from A), returns 2.\n3. Read 2 asks B and C: both still have x=1, returns 1.\nThe value went from 2 back to 1: not linearizable.\nAlso: two concurrent writes resolved by last-write-wins pick\nthe higher timestamp, so a clock-skewed node can make an older\nwrite win.",
      },
    ],
    faq: [
      { q: "Is MongoDB CP or AP?", a: "It depends on settings. With majority write concern and majority or linearizable read concern it behaves like CP; reading from secondaries with weaker settings gives AP-style behaviour. Labels matter less than the settings you choose per operation." },
      { q: "Can a system be CA?", a: "Only if network partitions never happen, which is true for a single machine but not for a distributed system. In practice, calling a distributed database CA means it was not designed for partitions." },
      { q: "Does eventual consistency mean data can be lost?", a: "Not by itself. It means replicas may temporarily disagree. Data loss comes from other choices, such as last-write-wins conflict resolution or acknowledging writes before they are safely stored." },
    ],
  },

  "data/indexes-storage": {
    plain: [
      "A storage engine is the part of a database that decides how data is laid out on disk and how it is found again. Two designs power most databases today: B-trees and LSM trees. They make opposite trade-offs, which is why some databases are great at reads and others at heavy writes.",
      "An index is like the index at the back of a book. Instead of reading every page to find a word, you look it up in a sorted list that tells you the page number. A database index does the same: it keeps a sorted structure of some column's values pointing to the rows.",
      "A B-tree keeps the data sorted in fixed-size blocks called pages and changes them in place, like editing a filing cabinet. An LSM tree never edits old files. It collects new writes in memory, writes them out as new sorted files, and merges files later in the background, like a pile of notes you tidy up once in a while.",
      "Nothing is free. Every index makes reads faster and writes slower, because each insert must also update the index. B-trees give steady, fast reads. LSM trees take writes faster but may check several files on a read and spend background work merging.",
    ],
    deepDive: [
      {
        heading: "Inside a B-tree",
        body: "A B-tree splits data into pages, 8 KB in PostgreSQL and 16 KB by default in MySQL's InnoDB. The root page holds keys that divide the key space, and each points to a child page covering that range. Leaf pages at the bottom hold the actual keys with either the row (InnoDB stores rows in the primary key's leaves) or a pointer to the row in the table (PostgreSQL's heap).\n\nBecause each page holds hundreds of keys, the tree is very shallow. With 500 keys per page, three levels cover 125 million keys and four cover 62.5 billion. The top levels stay cached in memory, so a lookup usually costs one or two disk reads. Leaves are linked, so a range scan walks along them.\n\nWhen a page is full, it splits in two and the parent gets a new key. Changes are first written to a write-ahead log so a crash mid-split cannot corrupt the tree.",
        visual: {
          type: "layers",
          title: "Looking up id = 7421 in a B-tree",
          layers: [
            { label: "Root page", detail: "Keys 1 to 10M split into ranges; go to 5,000-9,999" },
            { label: "Internal page", detail: "Narrows to 7,000-7,499" },
            { label: "Leaf page", detail: "Finds key 7421 and its row pointer" },
            { label: "Table row", detail: "Heap tuple (PostgreSQL) or the leaf itself (InnoDB)" },
          ],
        },
      },
      {
        heading: "Inside an LSM tree: the read path",
        body: "Writes in an LSM tree (log-structured merge tree) are cheap: append to a log, insert into the sorted in-memory memtable, done. When the memtable fills (64 MB by default in RocksDB), it becomes read-only and is flushed to disk as an SSTable, a sorted, immutable file.\n\nReads are where the cost hides. The newest version of a key could be in the memtable, in a recent SSTable, or in an old one. So a read checks the memtable first, then SSTables from newest to oldest, stopping at the first hit. To avoid opening every file, each SSTable has a Bloom filter, a small bit array that answers definitely not here or maybe here, and a sparse index of block offsets. With about 10 bits per key a Bloom filter gives roughly a 1% false positive rate.\n\nDeletes are written as tombstones, markers that hide older values until compaction removes both.",
        visual: {
          type: "flow",
          title: "LSM tree read path for one key",
          steps: [
            { label: "Memtable", detail: "Newest writes, in memory" },
            { label: "Immutable memtables", detail: "Waiting to be flushed" },
            { label: "Bloom filter check", detail: "Skip SSTables that cannot hold the key" },
            { label: "SSTable block index", detail: "Jump to the right block" },
            { label: "Return newest version", detail: "A tombstone means not found" },
          ],
        },
      },
      {
        heading: "Compaction strategies",
        body: "Without compaction, SSTables pile up, reads check more and more files, and deleted or overwritten data wastes space. Compaction merges sorted files, keeping only the newest version of each key, like a merge step in merge sort.\n\nSize-tiered compaction (Cassandra's long-standing default) merges several files of similar size into one bigger file. It writes data fewer times, which suits write-heavy loads, but needs spare disk space during big merges and leaves more files for reads to check.\n\nLeveled compaction (the default in RocksDB and LevelDB) keeps data in levels, each about 10 times larger than the one above, with non-overlapping files inside a level. A read checks at most one file per level, and space overhead is low, but data is rewritten more often, which raises write amplification.\n\nTime-window compaction groups data by time, ideal for time series that expire with a TTL, because whole old files can simply be dropped.",
        bullets: ["Size-tiered: fewer rewrites, more space, more files to read", "Leveled: predictable reads, more rewriting", "Time-window: best for TTL time series"],
      },
      {
        heading: "Read, write and space amplification",
        body: "Engineers compare engines with three numbers. Write amplification: bytes physically written per byte the app writes. A B-tree changing a 100-byte row writes at least a full 8 KB page plus a WAL record. An LSM tree writes each byte to the log, then again at each compaction, often 10 or more times overall with leveled compaction. Read amplification: how many pages or files a read touches. B-trees are low and predictable; LSM trees vary with the number of files. Space amplification: disk used per byte of live data. LSM trees hold stale versions until compaction; B-trees waste space in half-empty pages.\n\nYou cannot minimise all three at once. This is why write-heavy stores (Cassandra, RocksDB, ScyllaDB) choose LSM trees and general-purpose relational databases choose B-trees. Write amplification also matters on SSDs, because it wears them out.",
      },
      {
        heading: "Making indexes work for you",
        body: "A composite index on (a, b) is sorted by a, then by b. It serves filters on a, or on a and b, but not on b alone: the leftmost-prefix rule. Put equality columns first and range columns last: (customer_id, created_at) serves WHERE customer_id = 42 AND created_at > last week.\n\nA covering index includes every column a query needs, so the database never visits the table. PostgreSQL supports this with INCLUDE (since version 11) and index-only scans. Wrapping a column in a function, like WHERE lower(email) = ..., skips a plain index; create an expression index on lower(email) instead.\n\nAlways check with EXPLAIN ANALYZE, which runs the query and shows whether an index was used and how long each step took. Remove unused indexes: PostgreSQL's pg_stat_user_indexes shows idx_scan counts, and each idle index still slows every write.",
        bullets: ["Leftmost prefix: (a, b) helps a, and a + b, not b alone", "Equality columns first, range column last", "Low-selectivity columns (like a boolean) rarely benefit alone"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where each engine pays its cost",
        columns: [
          { title: "B-tree", points: ["Write: rewrite whole page in place", "Read: one path root to leaf", "Space: partly empty pages", "Background work: vacuum or page merges"] },
          { title: "LSM tree", points: ["Write: append and flush, cheap", "Read: may check several files", "Space: old versions until compaction", "Background work: compaction I/O"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing a slow query with a composite index",
        explanation: "The orders page runs: latest 20 orders for one customer. With 50 million rows and no suitable index, EXPLAIN ANALYZE shows a sequential scan reading the whole table. Step 1: add an index on (customer_id, created_at DESC), equality column first. Step 2: run EXPLAIN ANALYZE again: it now shows an Index Scan that stops after 20 rows, typically under a millisecond. Step 3: CONCURRENTLY builds the index without blocking writes, which matters on a live table.",
        code: {
          lang: "sql",
          code: "EXPLAIN ANALYZE\nSELECT id, total_cents, created_at FROM orders\n WHERE customer_id = 42\n ORDER BY created_at DESC LIMIT 20;\n-- before: Seq Scan on orders ... rows removed by filter\n\nCREATE INDEX CONCURRENTLY idx_orders_cust_created\n    ON orders (customer_id, created_at DESC);\n\n-- after: Index Scan using idx_orders_cust_created",
        },
      },
      {
        title: "How deep is a B-tree over 1 billion rows?",
        explanation: "Assume 8 KB pages and index entries of about 16 bytes (an 8-byte key plus pointer and overhead), so roughly 500 entries per page. Step 1: 1 billion keys / 500 per page = 2 million leaf pages. Step 2: the level above needs 2,000,000 / 500 = 4,000 pages, the next 8 pages, and then one root. So the tree has 4 levels. Step 3: the upper three levels are only about 4,000 pages, roughly 32 MB, which stays in memory, so a point lookup needs about one disk read for the leaf. This is why B-tree lookups stay fast even on huge tables.",
      },
    ],
    cheatSheet: [
      "Page size: PostgreSQL 8 KB, InnoDB 16 KB by default",
      "B-tree depth is about log base fanout of N: 1 billion keys fit in about 4 levels",
      "LSM write path: WAL, memtable, flush to SSTable, compaction",
      "Bloom filter at about 10 bits per key gives about a 1% false positive rate",
      "Leveled compaction: predictable reads, higher write amplification",
      "Composite index (a, b): helps a and a + b, not b alone",
      "CREATE INDEX CONCURRENTLY avoids blocking writes in PostgreSQL",
      "EXPLAIN ANALYZE shows the real plan and timing; pg_stat_user_indexes finds unused indexes",
    ],
    quiz: [
      {
        q: "What does a Bloom filter tell an LSM tree during a read?",
        options: ["The exact file offset of the key", "That the key is definitely not in this SSTable, or might be", "The newest version of the key", "How many tombstones exist"],
        answer: 1,
        why: "Bloom filters have no false negatives, so a 'no' lets the read skip that file.",
      },
      {
        q: "A table has an index on (country, city). Which query cannot use it efficiently?",
        options: ["WHERE country = 'IN'", "WHERE country = 'IN' AND city = 'Pune'", "WHERE country = 'IN' ORDER BY city", "WHERE city = 'Pune'"],
        answer: 3,
        why: "The leftmost-prefix rule means the index is sorted by country first, so city alone cannot seek into it.",
      },
      {
        q: "Why do LSM trees usually have higher write amplification than the app's write volume suggests?",
        options: ["Each byte is rewritten during several compactions", "They write every key twice to memory", "They never use a write-ahead log", "They store data uncompressed"],
        answer: 0,
        why: "Data is copied again each time compaction merges it into a lower level.",
      },
      {
        q: "How does a delete work in an LSM tree?",
        options: ["The key is removed from every SSTable immediately", "The memtable is cleared", "A tombstone is written and the data is removed during compaction", "The file containing the key is deleted"],
        answer: 2,
        why: "SSTables are immutable, so a tombstone hides older values until compaction drops both.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Name the best storage engine family for: (a) an app logging 200,000 metric points per second, (b) an accounts database with many point reads and occasional updates.",
        hint: "Which one turns writes into sequential appends?",
        solution: "(a) LSM tree (for example Cassandra, ScyllaDB or a RocksDB-based\n    store): sequential appends absorb huge write rates.\n(b) B-tree (PostgreSQL, MySQL InnoDB): predictable fast reads\n    and in-place updates.",
      },
      {
        level: "medium",
        task: "A query runs WHERE status = 'open' AND created_at > now() - interval '1 day' ORDER BY created_at. Design a PostgreSQL index for it and explain the column order. Bonus: make it smaller if only 2% of rows are open.",
        hint: "Equality first, range last. A partial index stores only matching rows.",
        solution: "CREATE INDEX idx_open_recent ON tickets (status, created_at);\nstatus is equality, created_at is the range and sort column.\n\nBonus, partial index (only open rows are stored):\nCREATE INDEX idx_open_created ON tickets (created_at)\n WHERE status = 'open';",
      },
      {
        level: "hard",
        task: "Write a tiny LSM-style key-value store in Python with a memtable, flush to immutable sorted runs, reads newest-first, and tombstone deletes.",
        hint: "A dict for the memtable, a list of sorted lists for runs, and a special object for tombstones.",
        solution: "TOMB = object()\nclass LSM:\n    def __init__(self, limit=4): self.mem, self.runs, self.limit = {}, [], limit\n    def put(self, k, v):\n        self.mem[k] = v\n        if len(self.mem) >= self.limit:\n            self.runs.insert(0, sorted(self.mem.items())); self.mem = {}\n    def delete(self, k): self.put(k, TOMB)\n    def get(self, k):\n        for table in [self.mem] + [dict(r) for r in self.runs]:\n            if k in table: return None if table[k] is TOMB else table[k]\n        return None",
      },
    ],
    faq: [
      { q: "Should I add an index on every column?", a: "No. Each index takes disk space and slows every insert, update and delete. Index the columns your frequent queries filter, join or sort on, and check with EXPLAIN ANALYZE." },
      { q: "Which databases use LSM trees?", a: "Cassandra, ScyllaDB, HBase, Google Bigtable, and anything built on RocksDB or LevelDB, which includes CockroachDB (via Pebble, a RocksDB-inspired engine) and MyRocks for MySQL." },
      { q: "What is the difference between a clustered and a non-clustered index?", a: "A clustered index stores the table rows themselves in index order, as InnoDB does with the primary key. A non-clustered index stores keys with pointers to rows kept elsewhere, as all PostgreSQL indexes do." },
    ],
  },
};

export default extra;
