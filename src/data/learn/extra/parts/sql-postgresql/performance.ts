import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "performance/btree": {
    plain: [
      "Without an index, Postgres finds rows the slow way: it reads every row of the table and checks each one. That is called a sequential scan. On a table with 10 rows it is instant. On a table with 50 million rows it can take seconds.",
      "An index is a separate, sorted copy of one or more columns, with a pointer from each value back to its row. Because it is sorted, Postgres can jump close to the value it wants, the way you find a word in a dictionary without reading every page.",
      "The default index type in Postgres is the B-tree. It is a short, wide tree of pages. The top page says which page to go to next, and after three or four jumps you reach the bottom page that holds your value. Even for huge tables, that is only a handful of reads.",
      "Indexes are not free. Every INSERT, UPDATE and DELETE must also update every index on the table, and each index takes disk space. So you add indexes for the queries you actually run, not for every column.",
    ],
    deepDive: [
      {
        heading: "Inside the tree: pages, fan-out and depth",
        body: "Postgres stores data in 8 kB pages, and a B-tree index is made of these pages too. Leaf pages at the bottom hold the indexed values in sorted order, each with a pointer called a TID (tuple ID: the table page number and the slot in that page). Upper pages hold only separator keys that say which child page covers which range.\n\nBecause one page holds hundreds of keys, the tree is very wide and very shallow. With a few hundred entries per page, three or four levels are enough for hundreds of millions of rows. The upper levels are small and are almost always cached in memory, so a lookup usually costs one or two real disk reads.\n\nLeaf pages are linked to their neighbours in both directions. After finding the first match, Postgres simply walks along the leaves, which is why ranges, ORDER BY and even ORDER BY ... DESC are cheap.",
        visual: {
          type: "flow",
          title: "Looking up WHERE email = 'kim@x.com'",
          steps: [
            { label: "Root page", detail: "Separator keys say: go to branch 3" },
            { label: "Branch page", detail: "Narrows the range: go to leaf 812" },
            { label: "Leaf page", detail: "Finds the key and its TID (page 4410, slot 7)" },
            { label: "Table (heap) page", detail: "Reads the row itself" },
            { label: "Visibility check", detail: "Is this row version visible to my transaction?" },
          ],
        },
      },
      {
        heading: "When the planner uses an index, and when it doesn't",
        body: "Having an index does not force Postgres to use it. The planner estimates the cost of each option from table statistics. If a condition matches a small fraction of rows (high selectivity), an index wins. If it matches a large share, say 30 percent of the table, reading the whole table in order is cheaper than thousands of random jumps, so you will see a Seq Scan, and that is correct.\n\nIn between, Postgres often picks a Bitmap Index Scan: it collects all matching TIDs from the index, sorts them by page, then reads each table page once.\n\nA B-tree can serve =, <, <=, >, >=, BETWEEN, IN, IS NULL and prefix LIKE 'abc%' (the last one needs the C collation or the text_pattern_ops operator class). It cannot help with LIKE '%abc', with a function wrapped around the column, or with a cast that changes the column's type.",
        bullets: ["Few matching rows: Index Scan", "Medium share: Bitmap Index Scan + Bitmap Heap Scan", "Large share: Seq Scan is cheaper", "Functions on the column hide it from a plain index"],
      },
      {
        heading: "Composite indexes, the leftmost prefix and ORDER BY",
        body: "An index on (a, b) is sorted by a first, then by b inside each value of a, like a phone book sorted by last name, then first name. It is very good for WHERE a = ? and WHERE a = ? AND b = ?, and for WHERE a = ? ORDER BY b, because inside one value of a the rows are already in b order. Postgres can then stop after LIMIT rows with no sort at all.\n\nWHERE b = ? alone is the weak case, because matching rows are scattered across every value of a. PostgreSQL 18 added skip scan, which can still use the index when a has only a few distinct values, but the safe rule is still to put the columns you filter by equality first.\n\nSort direction matters only when you mix directions. ORDER BY a, b DESC needs an index on (a, b DESC). For ORDER BY a DESC, b DESC, the plain index read backwards works.",
      },
      {
        heading: "Index-only scans and the visibility map",
        body: "A normal index scan reads the index, then visits the table to fetch the row. If every column the query needs is in the index, Postgres can skip the table and answer from the index alone: an Index Only Scan.\n\nThere is a catch. The index does not know whether a row version is visible to your transaction; that information lives in the table. Postgres keeps a visibility map, one flag per table page saying \"every row here is visible to everyone\". Only for those pages can it skip the table. VACUUM sets these flags, so on a table with many recent changes you will see a high Heap Fetches number in EXPLAIN ANALYZE.\n\nYou can make an index cover extra columns without sorting by them using INCLUDE (PostgreSQL 11+): CREATE INDEX ON orders (customer_id) INCLUDE (total). The included column is stored in the leaves only.",
        bullets: ["Index Only Scan needs every selected column in the index", "Heap Fetches: 0 is the ideal", "VACUUM keeps the visibility map up to date", "INCLUDE adds payload columns to the leaves"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to read rows",
        columns: [
          { title: "Index Scan", points: ["Walk index, then fetch each row", "Rows come out in index order", "Best for very few rows", "Can satisfy ORDER BY + LIMIT"] },
          { title: "Bitmap Heap Scan", points: ["Collect TIDs, sort by page", "Each table page read once", "Good for hundreds to thousands of rows", "Can combine two indexes (AND / OR)"] },
          { title: "Seq Scan", points: ["Read every page in order", "No index needed", "Best when many rows match", "Can run in parallel"] },
        ],
      },
    ],
    examples: [
      {
        title: "Watching a plan change when you add an index",
        explanation: "Step 1: build a million-row test table with generate_series. Step 2: look up one customer's orders; with no index the plan is a (parallel) Seq Scan that reads every page. Step 3: add an index on customer_id and run ANALYZE. Step 4: the same query now uses a Bitmap Heap Scan or Index Scan and reads only a few pages. Compare the Execution Time lines: typically tens of milliseconds before and well under one millisecond after.",
        code: {
          lang: "sql",
          code: "CREATE TABLE orders_demo AS\nSELECT g AS id,\n       (random() * 10000)::int AS customer_id,\n       now() - g * interval '1 minute' AS created_at,\n       round((random() * 100)::numeric, 2) AS total\nFROM generate_series(1, 1000000) AS g;\nANALYZE orders_demo;\n\nEXPLAIN ANALYZE SELECT * FROM orders_demo WHERE customer_id = 42;\n\nCREATE INDEX orders_demo_customer_idx ON orders_demo (customer_id);\nANALYZE orders_demo;\nEXPLAIN ANALYZE SELECT * FROM orders_demo WHERE customer_id = 42;",
        },
      },
      {
        title: "The latest 10 orders of a customer, with no sort",
        explanation: "The page \"my recent orders\" runs WHERE customer_id = ? ORDER BY created_at DESC LIMIT 10. With only an index on customer_id, Postgres fetches all that customer's rows and sorts them. Step 1: create a composite index with the equality column first and the sort column second. Step 2: run EXPLAIN; the Sort node is gone and a Limit sits directly on an Index Scan, which stops after 10 entries. Step 3: because the index also INCLUDEs total and the query selects only columns stored in the index, you get an Index Only Scan.",
        code: {
          lang: "sql",
          code: "CREATE INDEX orders_demo_cust_created_idx\n  ON orders_demo (customer_id, created_at DESC) INCLUDE (total);\nVACUUM ANALYZE orders_demo;   -- sets the visibility map\n\nEXPLAIN ANALYZE\nSELECT created_at, total\nFROM orders_demo\nWHERE customer_id = 42\nORDER BY created_at DESC\nLIMIT 10;\n-- Limit -> Index Only Scan using orders_demo_cust_created_idx\n--          Heap Fetches: 0",
        },
      },
    ],
    cheatSheet: [
      "CREATE INDEX CONCURRENTLY idx ON t (col);  build without blocking writes",
      "Composite index: equality columns first, then range or ORDER BY columns",
      "ORDER BY a, b DESC needs an index on (a, b DESC); same directions can read backwards",
      "LIKE 'abc%' uses a B-tree only with C collation or text_pattern_ops",
      "CREATE INDEX ON t (a) INCLUDE (b);  covering index for index-only scans",
      "\\di+ in psql lists indexes with their sizes",
      "SELECT indexrelname, idx_scan FROM pg_stat_user_indexes;  find unused indexes",
    ],
    quiz: [
      {
        q: "A query matches 40 percent of a large table, and there is an index on the filtered column. What will the planner most likely choose?",
        options: ["Index Only Scan", "Seq Scan", "Index Scan", "It will error"],
        answer: 1,
        why: "When a large share of rows match, reading the table in order is cheaper than many random index jumps.",
      },
      {
        q: "There is an index on (customer_id, created_at). Which query benefits most?",
        options: ["WHERE created_at > now() - interval '1 day'", "WHERE total > 100", "ORDER BY created_at", "WHERE customer_id = 5 ORDER BY created_at"],
        answer: 3,
        why: "Equality on the leading column gives rows already sorted by the second column.",
      },
      {
        q: "EXPLAIN ANALYZE shows Index Only Scan with Heap Fetches: 9500. What helps most?",
        options: ["VACUUM the table so the visibility map is up to date", "Drop the index", "Add more RAM", "Use a hash index"],
        answer: 0,
        why: "Heap fetches happen on pages not marked all-visible, and VACUUM sets those flags.",
      },
      {
        q: "Why does WHERE lower(email) = 'a@x.com' not use a plain index on email?",
        options: ["Indexes ignore text columns", "lower() is too slow", "The index stores email values, not lower(email) values", "B-trees only support numbers"],
        answer: 2,
        why: "The planner can only use an index whose stored values match the expression in the condition.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On orders_demo, create an index that speeds up WHERE created_at >= now() - interval '1 day', then confirm with EXPLAIN that it is used.",
        hint: "A plain B-tree on created_at supports range conditions.",
        solution: "CREATE INDEX ON orders_demo (created_at);\nANALYZE orders_demo;\nEXPLAIN SELECT * FROM orders_demo\nWHERE created_at >= now() - interval '1 day';\n-- expect Index Scan or Bitmap Heap Scan on the new index",
      },
      {
        level: "medium",
        task: "A query runs WHERE status = 'paid' AND customer_id = ? ORDER BY created_at DESC LIMIT 20. Design one index that avoids a Sort node.",
        hint: "Both equality columns first (either order), the sort column last with the same direction.",
        solution: "CREATE INDEX orders_paid_cust_created_idx\n  ON orders (customer_id, status, created_at DESC);\n-- EXPLAIN should show Limit -> Index Scan, no Sort",
      },
      {
        level: "hard",
        task: "Find indexes in your database that have never been used since statistics were last reset, with their size, largest first. Explain why you should not drop them blindly.",
        hint: "Join pg_stat_user_indexes to pg_index and skip unique indexes, which enforce rules.",
        solution: "SELECT s.schemaname, s.relname, s.indexrelname,\n       pg_size_pretty(pg_relation_size(s.indexrelid)) AS size\nFROM pg_stat_user_indexes s\nJOIN pg_index i ON i.indexrelid = s.indexrelid\nWHERE s.idx_scan = 0 AND NOT i.indisunique\nORDER BY pg_relation_size(s.indexrelid) DESC;\n-- Stats are per server: check replicas too, and cover\n-- rare jobs like month-end reports before dropping.",
      },
    ],
    faq: [
      { q: "Does PostgreSQL index the primary key automatically?", a: "Yes. PRIMARY KEY and UNIQUE constraints create a unique B-tree index. Foreign key columns are not indexed automatically." },
      { q: "How many indexes is too many?", a: "There is no fixed number. Each index slows writes and uses space, so keep the ones your real queries use and check pg_stat_user_indexes for indexes with idx_scan = 0." },
      { q: "Why is my index not used on a small table?", a: "For a table that fits in a few pages, a Seq Scan is cheaper than going through an index. This is expected and not a problem." },
      { q: "Can an index make a query slower?", a: "A read rarely gets slower because of a new index, but a bad row estimate can lead the planner to a poor index choice. Writes always get a little slower with each extra index." },
    ],
  },

  "performance/explain": {
    plain: [
      "When you send a query, Postgres does not just run it. First the planner thinks of many ways to get the answer: which table to read first, whether to use an index, how to join. It estimates the cost of each way and picks the cheapest. EXPLAIN shows you the plan it picked.",
      "The plan is a tree of steps called nodes. Each node does one job, such as reading a table, joining two inputs or sorting, and passes its rows up to its parent. The top node gives the final result to you.",
      "Plain EXPLAIN only shows guesses. EXPLAIN ANALYZE really runs the query and adds what actually happened: how many rows each step produced and how long it took. Comparing the guesses with reality is the key skill, because most bad plans come from bad guesses.",
      "Be careful: because EXPLAIN ANALYZE really runs the query, an UPDATE or DELETE will really change data. Wrap those in BEGIN and ROLLBACK.",
    ],
    deepDive: [
      {
        heading: "Decoding one plan line",
        body: "A typical line looks like this: Index Scan using orders_pkey on orders (cost=0.43..8.45 rows=1 width=64) (actual time=0.020..0.021 rows=1 loops=1).\n\nThe first bracket is the estimate. cost=0.43..8.45 means start-up cost (before the first row) and total cost, in arbitrary planner units where reading one page in order costs 1.0; they are not milliseconds. rows=1 is the estimated number of rows this node returns, and width=64 the average row size in bytes.\n\nThe second bracket comes from ANALYZE. actual time is in milliseconds, first row then last row, per loop. rows is the real row count, averaged per loop, and loops is how many times the node ran. For the inner side of a nested loop, multiply time and rows by loops to get the real total.\n\nAt the bottom, Planning Time and Execution Time give the totals for the whole statement.",
        bullets: ["cost = startup..total, in planner units", "rows/width = estimated rows and bytes per row", "actual time is per loop, in ms", "Node total = actual time x loops"],
      },
      {
        heading: "Scan and join nodes you will meet",
        body: "Scans read a table: Seq Scan reads every page; Index Scan follows an index and fetches rows; Index Only Scan answers from the index; Bitmap Index Scan plus Bitmap Heap Scan collect matches first, then read pages in order. A line Rows Removed by Filter tells you how much work was thrown away.\n\nJoins combine two inputs. Nested Loop runs the inner side once per outer row; great when the outer side is small and the inner side has an index, terrible when both are large. Hash Join builds a hash table from the smaller input, then streams the other one past it; good for large unsorted inputs. Merge Join walks two inputs already sorted on the join key.\n\nOther common nodes: Sort (watch for Sort Method: external merge Disk, meaning it spilled to disk), HashAggregate and GroupAggregate for GROUP BY, Limit, Gather for parallel workers, and Memoize (PostgreSQL 14+), which caches inner lookups in a nested loop.",
        visual: {
          type: "compare",
          title: "The three join strategies",
          columns: [
            { title: "Nested Loop", points: ["For each outer row, probe inner", "Small outer + indexed inner", "No setup cost", "Slow if both sides are big"] },
            { title: "Hash Join", points: ["Build hash on smaller input", "Stream the larger past it", "Equality joins only", "Needs work_mem; may spill to disk"] },
            { title: "Merge Join", points: ["Both inputs sorted on the key", "Walk them side by side", "Great with indexes on both keys", "Sorting first can be costly"] },
          ],
        },
      },
      {
        heading: "Estimated vs actual rows: finding the real problem",
        body: "The planner picks join types and orders from its row estimates. If it expects 10 rows and gets 200,000, it may choose a nested loop that runs 200,000 times. So scan each node and compare rows in the estimate with rows in actual. A gap of 10 times or more is worth investigating, and the lowest node with a big gap is usually the cause.\n\nEstimates come from statistics that ANALYZE collects: a sample of each column with its most common values, a histogram and the number of distinct values (see the pg_stats view). They go stale after big loads; autovacuum re-analyses eventually, but run ANALYZE yourself after bulk changes.\n\nTwo classic causes beyond stale stats: correlated columns (city = 'Paris' AND country = 'FR' is estimated as if independent; fix with CREATE STATISTICS) and skewed data that needs a bigger sample (ALTER TABLE ... ALTER COLUMN ... SET STATISTICS 500).",
        bullets: ["Gap of 10x or more: suspect the estimate", "ANALYZE table after bulk loads", "CREATE STATISTICS for correlated columns", "SET STATISTICS raises the sample for one column"],
      },
      {
        heading: "BUFFERS, settings and tools that help",
        body: "Add BUFFERS to see I/O: shared hit is pages found in Postgres's cache, shared read is pages fetched from the operating system or disk, and temp read/written means data spilled to temporary files. Since PostgreSQL 18, EXPLAIN ANALYZE includes buffer counts by default. Timings change between a cold and a warm cache, so run a query two or three times and compare buffers as well as milliseconds.\n\nOther useful options: VERBOSE shows output columns, SETTINGS lists non-default planner settings, and FORMAT JSON produces machine-readable output for visualisers such as explain.depesz.com or explain.dalibo.com, which colour the slowest nodes.\n\nIn production you usually cannot rerun the slow query by hand. The auto_explain module logs the plans of statements that take longer than auto_explain.log_min_duration, so you can read the plan of the exact slow run later.",
        visual: {
          type: "layers",
          title: "Where a page read is served from",
          layers: [
            { label: "shared_buffers", detail: "Postgres cache: counted as shared hit" },
            { label: "OS page cache", detail: "Counted as shared read, but still fast" },
            { label: "Disk or network storage", detail: "Also shared read; slowest" },
            { label: "Temp files", detail: "Sorts and hashes larger than work_mem" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Symptoms in a plan and what they suggest",
        root: "Slow node found",
        children: [
          { label: "Seq Scan, many Rows Removed by Filter", children: ["Missing or unusable index"] },
          { label: "Estimate far from actual", children: ["Stale stats: ANALYZE", "Correlated columns: CREATE STATISTICS"] },
          { label: "Nested Loop with huge loops", children: ["Bad estimate below it", "Missing index on inner side"] },
          { label: "Sort Method: external merge Disk", children: ["Raise work_mem for this query", "Or an index that gives the order"] },
          { label: "Hash Batches greater than 1", children: ["Hash spilled to disk", "More work_mem or fewer rows"] },
        ],
      },
    ],
    examples: [
      {
        title: "Spotting a stale-statistics problem",
        explanation: "A nightly job loaded 2 million new events, and a dashboard query became slow. Step 1: EXPLAIN ANALYZE shows Index Scan on events (rows=120) (actual rows=1980000). The planner thinks the filter matches 120 rows, so it chose a nested loop over them. Step 2: run ANALYZE events to refresh the statistics. Step 3: rerun the plan; the estimate is now close to 2 million and the planner switches to a Hash Join, and the query drops from 40 seconds to 2.",
        code: {
          lang: "sql",
          code: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT u.country, count(*)\nFROM events e JOIN users u ON u.id = e.user_id\nWHERE e.created_at >= current_date\nGROUP BY u.country;\n\n-- check when the table was last analysed\nSELECT relname, last_analyze, last_autoanalyze, n_mod_since_analyze\nFROM pg_stat_user_tables WHERE relname = 'events';\n\nANALYZE events;",
        },
      },
      {
        title: "Fixing a sort that spills to disk",
        explanation: "A report sorts 3 million rows and the plan shows Sort Method: external merge Disk: 180000kB. The sort did not fit in work_mem (default 4MB), so it wrote temp files. Step 1: raise work_mem for this session only and rerun. Step 2: the plan now says quicksort Memory, and the time drops. Step 3: if the query runs often, a better fix is an index that already delivers rows in that order, or a LIMIT so less data is sorted.",
        code: {
          lang: "sql",
          code: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders ORDER BY total DESC;\n-- Sort Method: external merge  Disk: 180000kB\n\nSET work_mem = '256MB';   -- this session only\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders ORDER BY total DESC;\n-- Sort Method: quicksort  Memory: ...\nRESET work_mem;",
        },
      },
    ],
    cheatSheet: [
      "EXPLAIN (ANALYZE, BUFFERS) query;  real rows, times and page reads",
      "BEGIN; EXPLAIN ANALYZE DELETE ...; ROLLBACK;  analyse writes safely",
      "cost is in planner units, not ms; actual time is ms per loop",
      "Estimated vs actual rows off by 10x or more: run ANALYZE or add statistics",
      "Sort Method: external merge Disk means the sort spilled; check work_mem",
      "EXPLAIN (FORMAT JSON) output pastes into explain.dalibo.com or explain.depesz.com",
      "auto_explain logs plans of slow statements automatically",
    ],
    quiz: [
      {
        q: "A node shows actual time=0.050..0.060 rows=1 loops=20000. Roughly how long did this node take in total?",
        options: ["0.06 ms", "1.2 seconds", "20 ms", "60 seconds"],
        answer: 1,
        why: "Actual time is per loop, so 0.06 ms times 20,000 loops is about 1,200 ms.",
      },
      {
        q: "What does cost=0.43..8.45 measure?",
        options: ["Milliseconds", "Rows returned", "Estimated start-up and total cost in planner units", "Memory in kB"],
        answer: 2,
        why: "Cost numbers are relative estimates based on settings like seq_page_cost, not real time.",
      },
      {
        q: "The estimate is rows=50 but actual rows=400000 at a Seq Scan feeding a Nested Loop. What should you try first?",
        options: ["Run ANALYZE on the table", "Drop all indexes", "Increase shared_buffers", "Rewrite the query in a CTE"],
        answer: 0,
        why: "A huge estimate gap usually means stale or insufficient statistics, and ANALYZE refreshes them.",
      },
      {
        q: "In BUFFERS output, what does shared read count?",
        options: ["Pages written by this query", "Pages found in shared_buffers", "Rows read from the index", "Pages not in Postgres's cache, fetched from the OS or disk"],
        answer: 3,
        why: "shared hit counts cache hits; shared read counts pages Postgres had to request from the operating system.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run EXPLAIN and then EXPLAIN ANALYZE on SELECT count(*) FROM orders WHERE status = 'paid'. Write down the estimated rows and actual rows of the scan node.",
        hint: "Look at rows= in the first and second brackets of the scan line.",
        solution: "EXPLAIN SELECT count(*) FROM orders WHERE status = 'paid';\nEXPLAIN ANALYZE SELECT count(*) FROM orders WHERE status = 'paid';\n-- e.g. Seq Scan on orders (cost=... rows=24800 ...)\n--      (actual time=... rows=25113 loops=1)\n-- Estimate and actual are close, so stats are fine.",
      },
      {
        level: "medium",
        task: "Safely measure how long DELETE FROM sessions WHERE expires_at < now() - interval '30 days' would take, without deleting anything.",
        hint: "EXPLAIN ANALYZE runs the statement, so wrap it in a transaction you roll back.",
        solution: "BEGIN;\nEXPLAIN (ANALYZE, BUFFERS)\nDELETE FROM sessions WHERE expires_at < now() - interval '30 days';\nROLLBACK;\n-- Note: the delete still takes row locks until ROLLBACK,\n-- so do this off-peak on a busy table.",
      },
      {
        level: "hard",
        task: "WHERE city = 'Paris' AND country = 'FR' is estimated at 40 rows but returns 9,000. Explain why and fix the estimate.",
        hint: "The planner assumes the two conditions are independent and multiplies their selectivities.",
        solution: "-- city decides country, but the planner multiplies\n-- P(city) x P(country), which underestimates.\nCREATE STATISTICS addr_city_country (dependencies, mcv)\n  ON city, country FROM addresses;\nANALYZE addresses;\nEXPLAIN ANALYZE SELECT * FROM addresses\nWHERE city = 'Paris' AND country = 'FR';\n-- estimate should now be close to 9000",
      },
    ],
    faq: [
      { q: "Is EXPLAIN ANALYZE safe to run in production?", a: "For SELECT it is as safe as running the query, which may be heavy. For INSERT, UPDATE and DELETE it really changes data, so wrap it in BEGIN and ROLLBACK." },
      { q: "Why is the plan different on my laptop and in production?", a: "Plans depend on table sizes, statistics and settings. A tiny dev table is often cheapest to Seq Scan, so test with realistic data volumes." },
      { q: "What is a good tool to visualise EXPLAIN output?", a: "Paste the text or JSON plan into explain.depesz.com or explain.dalibo.com. pgAdmin also has a graphical explain view." },
      { q: "Can I force Postgres to use my index?", a: "There are no built-in query hints. For testing you can SET enable_seqscan = off in one session, but the real fix is better statistics, a better index or a rewritten query." },
    ],
  },

  "performance/index-types": {
    plain: [
      "A plain index on one column is only the start. Real queries filter on several columns, look for words inside text, search inside JSON documents, or scan billions of log rows by date. Postgres has a special kind of index for each of these.",
      "A composite index covers several columns at once, like a phone book sorted by last name and then first name. A partial index covers only some rows, for example only orders that are still pending. An expression index stores the result of a calculation, such as lower(email).",
      "GIN is an index for values that contain many parts: the words in a document, the keys in a JSON object, the items in an array. It works like the index at the back of a book, listing each word and every page it appears on.",
      "BRIN is a tiny index for huge tables where rows are stored roughly in order, like log events arriving over time. It only remembers the smallest and largest value in each block of pages, so it can skip blocks that cannot match.",
    ],
    deepDive: [
      {
        heading: "Choosing column order in a composite index",
        body: "A composite B-tree is sorted by its first column, then the second, and so on. The rule that works almost every time: columns compared with = go first, then the one column used for a range (<, >, BETWEEN) or for ORDER BY. After a range column, later columns can no longer narrow the search; they can only be checked one by one.\n\nExample: WHERE tenant_id = ? AND status = ? AND created_at > ? ORDER BY created_at. The index (tenant_id, status, created_at) jumps straight to the right tenant and status and reads created_at in order. The index (created_at, tenant_id, status) would have to scan every recent row of every tenant.\n\nAmong equality columns, order matters less for that query, but it decides which other queries can share the index. An index on (tenant_id, status) also serves WHERE tenant_id = ? alone, so the column used on its own most often should lead.",
        visual: {
          type: "flow",
          title: "Designing a composite index for one query",
          steps: [
            { label: "List equality filters", detail: "tenant_id = ?, status = ?" },
            { label: "Add one range or sort column", detail: "created_at > ?, ORDER BY created_at" },
            { label: "Optional INCLUDE", detail: "Extra selected columns for index-only scans" },
            { label: "Check reuse", detail: "Can other queries use its leading columns?" },
            { label: "Verify", detail: "EXPLAIN shows no Sort and few rows removed" },
          ],
        },
      },
      {
        heading: "Partial and expression indexes",
        body: "A partial index has a WHERE clause: CREATE INDEX ON jobs (run_at) WHERE status = 'pending'. If 99 percent of jobs are done, this index is a tiny fraction of the full one, stays in memory, and is cheap to maintain, because rows outside the condition never touch it. The planner uses it only when it can prove the query's WHERE implies the index's WHERE, so write the same condition with a literal value. A prepared statement with status = $1 may not match. A partial unique index also enforces rules on some rows only, such as one active subscription per user.\n\nAn expression index stores a computed value: ON users (lower(email)), ON events ((payload->>'type')), ON products (upper(sku)). The query must use exactly the same expression. Functions in it must be IMMUTABLE (same input, same output), so date() on a timestamptz is not allowed because the answer depends on the time zone. Run ANALYZE after creating one so the planner gets statistics on the expression.",
        bullets: ["Partial: query condition must match the index WHERE", "Partial unique: rules that apply to some rows", "Expression: query must repeat the exact expression", "Only IMMUTABLE functions are allowed"],
      },
      {
        heading: "GIN for JSONB, arrays and full-text search",
        body: "GIN (Generalized Inverted Index) splits each value into elements and stores, for every element, the list of rows that contain it. That makes \"which rows contain X?\" fast.\n\nJSONB: the default jsonb_ops operator class supports @> (contains), ? (has key), ?| and ?& as well as jsonpath operators @? and @@. jsonb_path_ops supports only @> and the jsonpath operators, but is smaller and usually faster for containment. Neither helps payload->>'type' = 'click'; use attrs @> '{\"type\":\"click\"}' or an expression B-tree instead.\n\nArrays: && (overlap), @> and <@ (contains, contained by).\n\nFull text: store a tsvector (for example a generated column from to_tsvector('english', title || ' ' || body)), index it with GIN and query with @@ to_tsquery(...). For LIKE '%abc%' or fuzzy matches, the pg_trgm extension adds gin_trgm_ops.\n\nThe cost is write speed: one new row can add many GIN entries. GIN buffers them in a pending list (fastupdate) that vacuum later merges.",
        bullets: ["jsonb_ops: @>, ?, ?|, ?&, @?, @@", "jsonb_path_ops: @>, @?, @@ only, smaller", "Full text: GIN on a tsvector, query with @@", "pg_trgm + gin_trgm_ops for LIKE '%x%'"],
      },
      {
        heading: "BRIN for huge, naturally ordered tables",
        body: "BRIN (Block Range Index) divides the table into ranges of pages, 128 pages by default (pages_per_range), and stores one small summary per range: the minimum and maximum value. For a WHERE created_at between two dates, Postgres reads the summaries, skips every range that cannot match, and scans only the rest, rechecking each row.\n\nBecause it stores so little, a BRIN index on a billion-row table can be a few megabytes where a B-tree would be tens of gigabytes. It only works if values follow the physical order of rows, which is true for append-only data like logs, events or sensor readings. Check pg_stats.correlation for the column: values near 1 or -1 are good; near 0 means every range covers everything and BRIN skips nothing.\n\nNew page ranges are summarised by vacuum, or immediately if you create the index WITH (autosummarize = on). PostgreSQL 14 added minmax_multi operator classes that cope better with a few out-of-order rows.",
        visual: {
          type: "flow",
          title: "A BRIN lookup for one day of events",
          steps: [
            { label: "Read range summaries", detail: "Min and max created_at per 128 pages" },
            { label: "Skip ranges", detail: "Max before the day or min after it" },
            { label: "Bitmap of candidate pages", detail: "Only ranges that might match" },
            { label: "Scan those pages", detail: "Recheck each row against the condition" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which index for which query?",
        root: "What does the WHERE look like?",
        children: [
          { label: "=, <, >, ORDER BY", children: ["B-tree", "Composite if several columns"] },
          { label: "Only a small subset of rows", children: ["Partial index with WHERE"] },
          { label: "Function of a column", children: ["Expression index, e.g. lower(email)"] },
          { label: "Contains: JSONB, arrays, words", children: ["GIN", "pg_trgm for LIKE '%x%'"] },
          { label: "Range on a huge append-only table", children: ["BRIN on the time column"] },
          { label: "Overlaps, geometry, nearest", children: ["GiST (ranges, PostGIS)"] },
        ],
      },
    ],
    examples: [
      {
        title: "Searching product attributes stored as JSONB",
        explanation: "products.attrs holds documents like {\"color\": \"red\", \"size\": \"M\"}. Shoppers filter by any combination of attributes. Step 1: create a GIN index with jsonb_path_ops, since only containment is needed. Step 2: write filters with @>, which the index supports. Step 3: confirm with EXPLAIN that you get a Bitmap Index Scan on the GIN index. Note that attrs->>'color' = 'red' would not use this index.",
        code: {
          lang: "sql",
          code: "CREATE INDEX products_attrs_gin\n  ON products USING gin (attrs jsonb_path_ops);\n\nEXPLAIN ANALYZE\nSELECT id, name FROM products\nWHERE attrs @> '{\"color\": \"red\", \"size\": \"M\"}';\n-- Bitmap Heap Scan on products\n--   -> Bitmap Index Scan on products_attrs_gin",
        },
      },
      {
        title: "Full-text search on articles",
        explanation: "Users search blog articles by words. LIKE '%index%' is slow and finds 'reindexing' too. Step 1: add a stored generated column holding the tsvector, so it stays in sync automatically. Step 2: index it with GIN. Step 3: query with websearch_to_tsquery, which understands input like \"postgres index -mysql\", and rank the matches with ts_rank.",
        code: {
          lang: "sql",
          code: "ALTER TABLE articles ADD COLUMN search tsvector\n  GENERATED ALWAYS AS (\n    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))\n  ) STORED;\nCREATE INDEX articles_search_gin ON articles USING gin (search);\n\nSELECT id, title, ts_rank(search, q) AS rank\nFROM articles, websearch_to_tsquery('english', 'postgres index -mysql') AS q\nWHERE search @@ q\nORDER BY rank DESC\nLIMIT 10;",
        },
      },
    ],
    cheatSheet: [
      "Composite order: equality columns, then one range or sort column, then INCLUDE extras",
      "CREATE INDEX ON jobs (run_at) WHERE status = 'pending';  partial index",
      "CREATE INDEX ON events ((payload->>'type'));  expression needs double brackets",
      "USING gin (doc jsonb_path_ops) is smaller and serves @> containment",
      "CREATE EXTENSION pg_trgm; USING gin (name gin_trgm_ops) speeds LIKE '%x%'",
      "USING brin (created_at) for huge append-only tables; check pg_stats.correlation",
      "USING gist for ranges, exclusion constraints and PostGIS geometry",
    ],
    quiz: [
      {
        q: "Query: WHERE user_id = ? AND created_at > ? ORDER BY created_at. Which index is best?",
        options: ["(created_at, user_id)", "(user_id) and (created_at) as two separate indexes", "(user_id, created_at)", "A GIN index on user_id"],
        answer: 2,
        why: "Equality column first, then the range and sort column, so matching rows are read in order.",
      },
      {
        q: "Which query can use a GIN index on attrs (jsonb_path_ops)?",
        options: ["WHERE attrs @> '{\"color\": \"red\"}'", "WHERE attrs->>'color' = 'red'", "WHERE attrs ? 'color'", "ORDER BY attrs"],
        answer: 0,
        why: "jsonb_path_ops supports containment (@>) and jsonpath operators, not ->> comparisons or the ? key operator.",
      },
      {
        q: "A BRIN index on events.created_at skips almost nothing. What is the likely reason?",
        options: ["BRIN needs more memory", "The table is too large", "BRIN only works on text", "Rows are not stored in created_at order, so every range covers all dates"],
        answer: 3,
        why: "BRIN depends on correlation between the column and physical row order.",
      },
      {
        q: "Why can't you create an expression index on date(created_at) when created_at is timestamptz?",
        options: ["Expression indexes only accept text", "The cast depends on the time zone setting, so it is not IMMUTABLE", "date() is too slow", "You need a GIN index"],
        answer: 1,
        why: "Index expressions must be immutable; converting timestamptz to date changes with the session time zone.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create an index so WHERE lower(email) = lower($1) on users can use an index, and verify it.",
        hint: "Expression index, then ANALYZE and EXPLAIN.",
        solution: "CREATE INDEX users_lower_email_idx ON users (lower(email));\nANALYZE users;\nEXPLAIN SELECT * FROM users WHERE lower(email) = lower('Ann@X.com');\n-- Index Scan using users_lower_email_idx",
      },
      {
        level: "medium",
        task: "A worker polls SELECT * FROM jobs WHERE status = 'pending' ORDER BY run_at LIMIT 10. 99 percent of jobs are done. Create the smallest index that serves this query.",
        hint: "Partial index on the sort column, filtered by the status.",
        solution: "CREATE INDEX jobs_pending_run_at_idx\n  ON jobs (run_at)\n  WHERE status = 'pending';\n-- EXPLAIN: Limit -> Index Scan using jobs_pending_run_at_idx\n-- Compare sizes: SELECT pg_size_pretty(pg_relation_size('jobs_pending_run_at_idx'));",
      },
      {
        level: "hard",
        task: "Make WHERE name ILIKE '%phone%' fast on a 5 million row products table, and compare the plan before and after.",
        hint: "Trigram indexes support LIKE and ILIKE with leading wildcards.",
        solution: "EXPLAIN ANALYZE SELECT id FROM products WHERE name ILIKE '%phone%';\n-- Seq Scan, Rows Removed by Filter: ...\nCREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX products_name_trgm\n  ON products USING gin (name gin_trgm_ops);\nEXPLAIN ANALYZE SELECT id FROM products WHERE name ILIKE '%phone%';\n-- Bitmap Index Scan on products_name_trgm",
      },
    ],
    faq: [
      { q: "Should I create one index per column or one composite index?", a: "For a query that filters on several columns together, one well-ordered composite index is usually better. Postgres can combine single-column indexes with a bitmap AND, but that is slower and cannot provide sort order." },
      { q: "When should I use a hash index?", a: "Rarely. Hash indexes support only equality and are crash-safe since PostgreSQL 10, but a B-tree does equality almost as well and also supports ranges, sorting and uniqueness." },
      { q: "What is the difference between GIN and GiST?", a: "GIN is an inverted index, best for exact contains queries on JSONB, arrays and full text. GiST is a balanced tree of bounding shapes, used for ranges, overlap and exclusion constraints, geometry and nearest-neighbour search." },
    ],
  },

  "performance/query-tuning": {
    plain: [
      "A slow app is rarely slow everywhere. Usually a few queries cause most of the pain: one that reads far too much data, or a tiny one that runs thousands of times. Tuning means finding those few and fixing them, one at a time.",
      "Measure before you change anything. Guessing wastes time and often makes things worse. Find the query that costs the most total time, look at its plan, change one thing, and measure again. Keep the change only if the numbers really improve.",
      "The N+1 problem is the most common cause of slow pages. Code loads a list of 100 orders with one query, then loops and loads each order's customer with its own query: 1 + 100 queries. Each query is quick, but each one waits for a network round trip.",
      "The cure is batching: fetch all the customers in one query with a JOIN or a list of ids. One trip instead of a hundred. The same idea works for writes: insert 1,000 rows in one statement instead of 1,000 statements.",
    ],
    deepDive: [
      {
        heading: "Rewrites that let the planner use indexes",
        body: "A condition that can use an index is called sargable. Common rewrites:\n\nDo not wrap the column in a function. Replace date(created_at) = '2026-03-01' with a half-open range on created_at. Replace extract(year from d) = 2026 with d >= '2026-01-01' AND d < '2027-01-01'.\n\nMatch types. Comparing a text column with a number, or a bigint column with a numeric parameter, can force a cast on every row.\n\nReplace NOT IN (subquery) with NOT EXISTS. If the subquery returns a single NULL, NOT IN returns no rows at all, and NOT EXISTS also plans better.\n\nSelect only the columns you need. SELECT * reads wide rows, pulls large TOAST values (big text or JSON stored out of line) and rules out index-only scans.\n\nSince PostgreSQL 12, simple CTEs used once are inlined into the main query, so a CTE is no longer an automatic optimisation fence; add MATERIALIZED when you want one.",
        bullets: ["No functions on indexed columns", "Half-open ranges: >= start AND < next", "NOT EXISTS instead of NOT IN", "Name your columns instead of SELECT *"],
      },
      {
        heading: "Pagination: OFFSET versus keyset",
        body: "LIMIT 20 OFFSET 100000 looks cheap but is not. Postgres must find and throw away 100,000 rows before returning 20, so each page is slower than the one before, and rows inserted between page loads can shift results so users see duplicates or miss rows.\n\nKeyset pagination (also called seek pagination) remembers where the last page ended and asks for rows after it. With an index on (created_at, id), the query WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20 jumps straight to the right spot in the index, so page 5,000 is as fast as page 1. The id column breaks ties when two rows share a timestamp. Postgres compares the row values (created_at, id) as a pair, which a composite B-tree serves directly.\n\nThe trade-off: you cannot jump to \"page 37\" directly. For infinite scroll and APIs with a next cursor, that is usually fine.",
        visual: {
          type: "compare",
          title: "OFFSET vs keyset pagination",
          columns: [
            { title: "OFFSET", points: ["Reads and discards skipped rows", "Deep pages get slower", "Rows shift when data changes", "Can jump to any page number"] },
            { title: "Keyset (seek)", points: ["Starts after the last seen key", "Every page equally fast", "Stable while rows are added", "Only next or previous page"] },
          ],
        },
      },
      {
        heading: "Detecting N+1 in real apps",
        body: "N+1 hides inside ORMs (libraries that map tables to objects). Code like for order in orders: print(order.customer.name) looks innocent, but each .customer triggers a lazy load, which is one more query.\n\nWays to catch it: In development, log every statement (log_min_duration_statement = 0) or turn on your ORM's SQL logging (SQLAlchemy echo=True, Django's connection.queries or the Django Debug Toolbar, the Bullet gem for Rails). Count queries per request; dozens of near-identical queries with different ids is the signature. In production, pg_stat_statements shows a query with a huge calls count and a tiny mean time, such as SELECT ... FROM customers WHERE id = $1 called 3 million times an hour.\n\nORM fixes: eager loading. Django has select_related (JOIN for foreign keys) and prefetch_related (one extra IN query). SQLAlchemy has joinedload and selectinload. Rails has includes. Some teams add a test that fails if a page runs more than a set number of queries.",
        visual: {
          type: "sequence",
          title: "Eager loading: 2 queries instead of 101",
          actors: ["App", "ORM", "Postgres"],
          messages: [
            { from: 0, to: 1, label: "orders with customers, limit 100" },
            { from: 1, to: 2, label: "SELECT * FROM orders LIMIT 100" },
            { from: 2, to: 1, label: "100 orders, 37 distinct customer ids" },
            { from: 1, to: 2, label: "SELECT * FROM customers WHERE id IN (...37 ids)" },
            { from: 2, to: 1, label: "37 customers" },
            { from: 1, to: 0, label: "Orders with customer attached" },
          ],
        },
      },
      {
        heading: "Batching writes and measuring honestly",
        body: "Writes have the same round-trip cost. Inserting 10,000 rows one statement at a time, each in its own transaction, also pays for 10,000 commits, and each commit waits for the WAL to reach disk. Batch instead: a multi-row INSERT ... VALUES (...), (...), one INSERT ... SELECT FROM unnest($1::bigint[], $2::text[]) with arrays as parameters, or COPY for bulk loads, which is the fastest path. At minimum, wrap many statements in one transaction.\n\nMeasure in a fair way. Use EXPLAIN (ANALYZE, BUFFERS) for one query, and run it several times so the cache is warm for both versions. Turn on \\timing in psql to see wall-clock time including the round trip. For load, pgbench can replay your own query file: pgbench -n -f query.sql -c 8 -T 30 mydb reports transactions per second and latency. Write the before and after numbers down; that record is what convinces reviewers.",
        bullets: ["Multi-row VALUES or unnest arrays", "COPY for bulk loads", "One transaction for many small writes", "\\timing and pgbench -f for before/after numbers"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Where one query's time goes",
        steps: [
          { label: "Network to server", detail: "Often 0.2 to 1 ms in one data centre" },
          { label: "Parse and plan", detail: "Shown as Planning Time" },
          { label: "Execute", detail: "Shown as Execution Time" },
          { label: "Send rows back", detail: "Grows with rows and columns selected" },
          { label: "App builds objects", detail: "ORM overhead per row" },
        ],
      },
    ],
    examples: [
      {
        title: "Keyset pagination for an orders API",
        explanation: "The orders API used OFFSET, and page 2,000 took 900 ms. Step 1: add an index on (created_at DESC, id DESC). Step 2: the first page has no cursor. Step 3: the response returns the created_at and id of the last row as a cursor. Step 4: the next request passes them back and the query seeks past them. Every page now takes about 1 ms regardless of depth.",
        code: {
          lang: "sql",
          code: "CREATE INDEX orders_created_id_idx ON orders (created_at DESC, id DESC);\n\n-- first page\nSELECT id, created_at, total FROM orders\nORDER BY created_at DESC, id DESC\nLIMIT 20;\n\n-- next page: $1, $2 = created_at and id of the last row shown\nSELECT id, created_at, total FROM orders\nWHERE (created_at, id) < ($1, $2)\nORDER BY created_at DESC, id DESC\nLIMIT 20;",
        },
      },
      {
        title: "Fixing an N+1 in Python with one batched query",
        explanation: "A report loops over 500 order ids and runs a query for each order's items, taking 1.5 seconds mostly in round trips. Step 1: collect the ids. Step 2: send them as one array parameter with = ANY(%s). Step 3: group the rows in Python. Result: one round trip and about 40 ms. psycopg turns a Python list into a Postgres array automatically.",
        code: {
          lang: "python",
          code: "import psycopg\nfrom collections import defaultdict\n\nwith psycopg.connect(\"dbname=shop\") as conn:\n    order_ids = [r[0] for r in conn.execute(\n        \"SELECT id FROM orders WHERE created_at >= now() - interval '1 day'\")]\n    rows = conn.execute(\n        \"SELECT order_id, sku, qty FROM order_items WHERE order_id = ANY(%s)\",\n        (order_ids,)).fetchall()\n\nitems = defaultdict(list)\nfor order_id, sku, qty in rows:\n    items[order_id].append((sku, qty))",
        },
      },
    ],
    cheatSheet: [
      "Half-open date range: created_at >= '2026-03-01' AND created_at < '2026-03-02'",
      "NOT EXISTS instead of NOT IN when the subquery column can be NULL",
      "Keyset paging: WHERE (created_at, id) < ($1, $2) ORDER BY created_at DESC, id DESC",
      "WHERE id = ANY($1) with an array parameter replaces N separate lookups",
      "COPY or multi-row INSERT for bulk writes; wrap small writes in one transaction",
      "\\timing in psql shows wall-clock time per statement",
      "pgbench -n -f query.sql -c 8 -T 30 mydb  load-test your own query",
    ],
    quiz: [
      {
        q: "pg_stat_statements shows SELECT * FROM users WHERE id = $1 with 2 million calls per hour and 0.05 ms mean time. What does this most likely mean?",
        options: ["The query needs an index", "Nothing; fast queries are never a problem", "The users table is bloated", "An N+1 pattern in the app is calling it in a loop"],
        answer: 3,
        why: "A tiny query with an enormous call count is the classic signature of N+1 lazy loading.",
      },
      {
        q: "Why does LIMIT 20 OFFSET 200000 get slow?",
        options: ["Postgres must produce and discard 200,000 rows first", "OFFSET disables all indexes", "LIMIT is applied before ORDER BY", "The result is cached badly"],
        answer: 0,
        why: "OFFSET rows are still found and then thrown away, so the work grows with the page number.",
      },
      {
        q: "WHERE id NOT IN (SELECT manager_id FROM employees) returns no rows, though you expected many. Why?",
        options: ["NOT IN needs an index", "manager_id contains a NULL, which makes NOT IN unknown for every row", "The subquery runs too late", "NOT IN only works with constants"],
        answer: 1,
        why: "x NOT IN (..., NULL) is never true, so use NOT EXISTS or filter out NULLs.",
      },
      {
        q: "Which change is most likely to make WHERE extract(year from created_at) = 2026 use an index on created_at?",
        options: ["Add LIMIT 1000", "Wrap it in a CTE", "Rewrite it as created_at >= '2026-01-01' AND created_at < '2027-01-01'", "Use SELECT DISTINCT"],
        answer: 2,
        why: "A range on the bare column is sargable, while a function on the column hides it from the index.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Rewrite WHERE to_char(created_at, 'YYYY-MM') = '2026-03' so it can use an index on created_at.",
        hint: "Use a half-open range from the first of the month to the first of the next month.",
        solution: "SELECT * FROM orders\nWHERE created_at >= '2026-03-01'\n  AND created_at <  '2026-04-01';",
      },
      {
        level: "medium",
        task: "Insert 3 products in a single statement and return their new ids, then do the same for any number of products using arrays as parameters.",
        hint: "Multi-row VALUES, then INSERT ... SELECT FROM unnest().",
        solution: "INSERT INTO products (sku, name) VALUES\n  ('A1', 'Mug'), ('A2', 'Cup'), ('A3', 'Plate')\nRETURNING id;\n\n-- any number of rows, two array parameters:\nINSERT INTO products (sku, name)\nSELECT * FROM unnest($1::text[], $2::text[])\nRETURNING id;",
      },
      {
        level: "hard",
        task: "A page lists 50 customers with their latest order date and order count, and runs 101 queries. Write one query that returns everything.",
        hint: "LEFT JOIN a grouped subquery (or use a LATERAL join), so customers without orders still appear.",
        solution: "SELECT c.id, c.name, o.last_order_at, coalesce(o.orders, 0) AS orders\nFROM customers c\nLEFT JOIN LATERAL (\n  SELECT max(created_at) AS last_order_at, count(*) AS orders\n  FROM orders WHERE customer_id = c.id\n) o ON true\nORDER BY c.name\nLIMIT 50;",
      },
    ],
    faq: [
      { q: "Is a JOIN always better than two queries?", a: "Not always. A JOIN repeats the parent columns for every child row, so for one parent with many large children, two queries (parents, then children WHERE parent_id = ANY(...)) can transfer less data. Both are far better than N+1." },
      { q: "Should I fix N+1 with a cache?", a: "Fix the query first. A cache hides the problem until it expires, adds stale-data bugs, and the batched query is usually fast enough on its own." },
      { q: "How do I count rows quickly on a huge table?", a: "An exact count(*) must read the table or an index. If an estimate is enough, read reltuples from pg_class, which is updated by VACUUM and ANALYZE." },
    ],
  },
};

export default extra;
