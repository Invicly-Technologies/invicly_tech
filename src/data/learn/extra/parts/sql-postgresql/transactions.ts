import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "transactions/acid": {
    plain: [
      "Many real actions need several changes at once. Moving money means taking it from one account and adding it to another. Placing an order means saving the order, its lines and lowering the stock. If the server crashes halfway, you must not end up with only half of it done.",
      "A transaction is a box around those changes. You open it with BEGIN, make your changes, and close it with COMMIT to keep everything or ROLLBACK to throw everything away. Until you commit, other users do not see your changes.",
      "ACID is a short name for the four promises a transaction gives you. Atomic: all or nothing. Consistent: rules like constraints still hold at the end. Isolated: other people's work running at the same time does not mix into yours. Durable: once COMMIT says yes, the data survives a crash or power cut.",
      "A savepoint is a bookmark inside a transaction. If one step fails, you can go back to the bookmark and try something else, without losing the work done before it.",
    ],
    deepDive: [
      {
        heading: "Autocommit, drivers and the aborted state",
        body: "If you never type BEGIN, Postgres wraps every single statement in its own transaction and commits it at once. That is autocommit, and it is how psql behaves by default.\n\nDrivers differ, so check yours. Python's psycopg is not in autocommit mode by default: it opens a transaction at your first statement, and nothing is saved until you call conn.commit() or leave a with conn.transaction() block. JDBC starts with autocommit on. ORMs usually manage transactions per request or per unit of work.\n\nIf any statement inside a transaction fails, the whole transaction becomes aborted. Every later statement returns \"current transaction is aborted, commands ignored until end of transaction block\" until you send ROLLBACK. That is a feature: Postgres refuses to let you commit half a job by accident. In psql, \\set ON_ERROR_ROLLBACK interactive makes typing mistakes less painful by using a hidden savepoint before each statement.",
        bullets: ["psql: autocommit on by default", "psycopg: transaction opens implicitly; you must commit", "After an error, only ROLLBACK (or ROLLBACK TO SAVEPOINT) works", "SELECT now() returns the same time for the whole transaction"],
      },
      {
        heading: "How COMMIT becomes durable: the write-ahead log",
        body: "Postgres does not rewrite table files on every change. It changes pages in memory (shared_buffers) and first records each change in the write-ahead log (WAL), a sequential journal on disk. On COMMIT it writes a commit record and flushes the WAL to durable storage (fsync) before telling you \"COMMIT\". The changed table pages are written later, in bulk, by the background writer and at checkpoints.\n\nIf the server crashes, recovery starts from the last checkpoint and replays the WAL, so every committed change comes back and uncommitted ones are ignored. That is durability, and it is also why Postgres can recover without a long repair step.\n\nYou can trade a little durability for speed with synchronous_commit = off, per transaction if you like. COMMIT then returns before the flush; a crash can lose the last fraction of a second of commits, but the database never becomes corrupt. It suits things like analytics events, never payments.",
        visual: {
          type: "flow",
          title: "What happens on COMMIT",
          steps: [
            { label: "Change pages in memory", detail: "shared_buffers holds the dirty pages" },
            { label: "Append WAL records", detail: "A journal entry for every change" },
            { label: "Write commit record", detail: "Marks the transaction as committed" },
            { label: "Flush WAL to disk", detail: "fsync; then COMMIT returns to the app" },
            { label: "Pages written later", detail: "Background writer and checkpoints" },
          ],
        },
      },
      {
        heading: "Atomicity and consistency in practice",
        body: "Rollback in Postgres is cheap. Changes are not undone row by row; the transaction is simply marked as aborted in the commit log (pg_xact), and the row versions it created become invisible and are later cleaned up by vacuum. So a rollback of a million-row insert is instant, although the space is reclaimed later.\n\nConsistency means the data obeys your rules after every commit. Postgres checks constraints at the end of each statement. Some changes need a moment of inconsistency, such as swapping two rows' positions under a UNIQUE constraint, or inserting two rows that reference each other. For those, declare the constraint DEFERRABLE and run SET CONSTRAINTS ALL DEFERRED inside the transaction; the check then happens at COMMIT.\n\nNote that the C in ACID only covers rules the database knows. A business rule kept only in app code is consistent only if every writer follows it, which is why constraints matter.",
        bullets: ["ROLLBACK just marks the transaction aborted", "Constraints are checked per statement by default", "DEFERRABLE + SET CONSTRAINTS ALL DEFERRED checks at COMMIT", "Most DDL is transactional and can be rolled back too"],
      },
      {
        heading: "Savepoints and keeping transactions short",
        body: "SAVEPOINT name marks a point. ROLLBACK TO SAVEPOINT name undoes everything after it and clears the aborted state, so the transaction can continue. RELEASE SAVEPOINT name forgets the bookmark but keeps the work. ORMs use savepoints for nested transactions: Django's nested atomic() blocks and SQLAlchemy's begin_nested() both create them.\n\nTypical use: importing 1,000 rows where a few may be bad. Put a savepoint before each row; on error, roll back to it, log the row and continue. Use them in moderation: each savepoint starts a subtransaction, and a transaction with thousands of them can slow down the whole server.\n\nThe most important habit is to keep transactions short. An open transaction holds its locks and stops vacuum from removing old row versions. Never wait for a user, an HTTP call or an email inside one. The setting idle_in_transaction_session_timeout ends sessions that sit idle inside a transaction for too long.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "An error inside a transaction",
        actors: ["App", "Postgres"],
        messages: [
          { from: 0, to: 1, label: "BEGIN; INSERT order" },
          { from: 0, to: 1, label: "INSERT line with bad product_id" },
          { from: 1, to: 0, label: "ERROR: violates foreign key" },
          { from: 0, to: 1, label: "UPDATE stock ..." },
          { from: 1, to: 0, label: "ERROR: current transaction is aborted" },
          { from: 0, to: 1, label: "ROLLBACK" },
          { from: 1, to: 0, label: "Nothing was saved, not even the order" },
        ],
      },
    ],
    examples: [
      {
        title: "Placing an order as one transaction in Python",
        explanation: "An order must save the order row, its line and reduce stock, or do nothing. Step 1: open a transaction block with psycopg's conn.transaction(). Step 2: decrease stock only if enough is left; the WHERE stock >= 2 check and the update happen in one statement. Step 3: if no row was updated, raise an error, which rolls everything back. Step 4: on leaving the block without an error, psycopg commits.",
        code: {
          lang: "python",
          code: "import psycopg\n\nwith psycopg.connect(\"dbname=shop\") as conn:\n    with conn.transaction():\n        order_id = conn.execute(\n            \"INSERT INTO orders (customer_id) VALUES (%s) RETURNING id\", (7,)\n        ).fetchone()[0]\n        conn.execute(\n            \"INSERT INTO order_items (order_id, product_id, qty) VALUES (%s, %s, %s)\",\n            (order_id, 42, 2))\n        cur = conn.execute(\n            \"UPDATE products SET stock = stock - 2 WHERE id = 42 AND stock >= 2\")\n        if cur.rowcount == 0:\n            raise ValueError(\"out of stock\")  # rolls back all three statements",
        },
      },
      {
        title: "Importing rows and skipping the bad ones",
        explanation: "A CSV import has 3 rows and one breaks a CHECK. Without savepoints, the error aborts the whole transaction. Step 1: set a savepoint before each risky insert. Step 2: when an insert fails, roll back to that savepoint, which clears the error. Step 3: carry on and commit; the good rows are saved and the bad one is skipped. In app code you would loop and log each failure.",
        code: {
          lang: "sql",
          code: "BEGIN;\nSAVEPOINT r1;\nINSERT INTO products (sku, price) VALUES ('A1', 9.99);\nRELEASE SAVEPOINT r1;\n\nSAVEPOINT r2;\nINSERT INTO products (sku, price) VALUES ('A2', -5);  -- ERROR: check constraint\nROLLBACK TO SAVEPOINT r2;                            -- transaction is usable again\n\nSAVEPOINT r3;\nINSERT INTO products (sku, price) VALUES ('A3', 4.50);\nRELEASE SAVEPOINT r3;\nCOMMIT;  -- A1 and A3 saved",
        },
      },
    ],
    cheatSheet: [
      "BEGIN; ... COMMIT;  or ROLLBACK; to discard everything since BEGIN",
      "SAVEPOINT s; ROLLBACK TO SAVEPOINT s; RELEASE SAVEPOINT s;",
      "After any error the transaction is aborted until ROLLBACK",
      "\\set ON_ERROR_ROLLBACK interactive  psql keeps your transaction alive after typos",
      "SET LOCAL synchronous_commit = off;  faster commit, may lose the last moments on crash",
      "now() is the transaction start time; clock_timestamp() is the real current time",
      "idle_in_transaction_session_timeout ends sessions left idle inside a transaction",
    ],
    quiz: [
      {
        q: "An INSERT fails inside a transaction. You run another SELECT. What happens?",
        options: ["It works normally", "It runs but returns no rows", "It fails with \"current transaction is aborted\" until you ROLLBACK", "Postgres commits the earlier statements automatically"],
        answer: 2,
        why: "After an error the transaction is aborted, and only ROLLBACK or ROLLBACK TO SAVEPOINT is accepted.",
      },
      {
        q: "When does COMMIT return success in PostgreSQL with default settings?",
        options: ["After the commit record is flushed to the WAL on disk", "After all changed table pages are written to disk", "Immediately, before anything is written", "After the next checkpoint"],
        answer: 0,
        why: "The WAL flush makes the commit durable; table pages can be written later because the WAL can replay them.",
      },
      {
        q: "Which ACID property does a CHECK (balance >= 0) constraint mainly support?",
        options: ["Atomicity", "Durability", "Isolation", "Consistency"],
        answer: 3,
        why: "Constraints keep the data valid according to your rules after every transaction.",
      },
      {
        q: "Why is a long-running idle transaction harmful?",
        options: ["It uses a lot of CPU", "It holds locks and stops vacuum from removing old row versions", "It slows down COMMIT for everyone", "It disables the WAL"],
        answer: 1,
        why: "Its snapshot keeps dead rows alive and its locks can block other sessions.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In psql, start a transaction, delete all rows from a test table, check the count, then roll back and check again.",
        hint: "The DELETE is visible inside your own transaction only.",
        solution: "BEGIN;\nDELETE FROM test_items;\nSELECT count(*) FROM test_items;   -- 0\nROLLBACK;\nSELECT count(*) FROM test_items;   -- original count",
      },
      {
        level: "medium",
        task: "Transfer 50 from account 1 to account 2 so that it fails completely if account 1 would go below zero.",
        hint: "Use a CHECK constraint, or an UPDATE whose WHERE includes the balance test, inside one transaction.",
        solution: "ALTER TABLE accounts ADD CONSTRAINT balance_not_negative CHECK (balance >= 0);\n\nBEGIN;\nUPDATE accounts SET balance = balance - 50 WHERE id = 1;\n-- if this violates the CHECK, the transaction is aborted\nUPDATE accounts SET balance = balance + 50 WHERE id = 2;\nCOMMIT;  -- after an error, COMMIT acts as ROLLBACK",
      },
      {
        level: "hard",
        task: "Two rows in a playlist must swap their position values, and (playlist_id, position) is UNIQUE. Make the swap possible in one transaction.",
        hint: "A normal UNIQUE is checked after each statement. Make it DEFERRABLE.",
        solution: "ALTER TABLE playlist_items DROP CONSTRAINT playlist_items_playlist_id_position_key;\nALTER TABLE playlist_items ADD CONSTRAINT playlist_pos_key\n  UNIQUE (playlist_id, position) DEFERRABLE INITIALLY IMMEDIATE;\n\nBEGIN;\nSET CONSTRAINTS playlist_pos_key DEFERRED;\nUPDATE playlist_items SET position = 2 WHERE id = 10;\nUPDATE playlist_items SET position = 1 WHERE id = 11;\nCOMMIT;  -- uniqueness checked here",
      },
    ],
    faq: [
      { q: "Do I need BEGIN for a single statement?", a: "No. A single statement is always atomic on its own, because Postgres wraps it in its own transaction. Use BEGIN when several statements must succeed or fail together." },
      { q: "Is COMMIT slow?", a: "Each COMMIT waits for a disk flush of the WAL, often well under a millisecond on SSDs. Thousands of tiny transactions add up, so batch many small writes into one transaction." },
      { q: "Can I roll back a CREATE TABLE or ALTER TABLE?", a: "Yes, in PostgreSQL most DDL is transactional. A few commands, such as CREATE INDEX CONCURRENTLY and CREATE DATABASE, cannot run inside a transaction block." },
    ],
  },

  "transactions/isolation": {
    plain: [
      "A busy database runs many transactions at the same time. Isolation decides what each one can see of the others while they are still running. Too little isolation and you read numbers that are changing under your feet. Too much and transactions get in each other's way.",
      "Postgres solves most of this with MVCC (multi-version concurrency control). When a row is updated, Postgres does not overwrite it. It writes a new version and keeps the old one for a while. Each transaction looks at a snapshot: a picture of which versions were committed when it started looking.",
      "Because readers look at old versions and writers create new ones, readers never wait for writers and writers never wait for readers. That is why Postgres stays fast under mixed reading and writing.",
      "Isolation levels set how long a snapshot lasts. Read Committed (the default) takes a new snapshot for each statement. Repeatable Read keeps one snapshot for the whole transaction. Serializable adds checks so the result is as if transactions ran one after another.",
    ],
    deepDive: [
      {
        heading: "MVCC under the hood: xmin, xmax and snapshots",
        body: "Every transaction that writes gets a transaction ID (XID). Every row version stores two hidden columns: xmin, the XID that created it, and xmax, the XID that deleted or replaced it (0 if still current). An UPDATE is really \"mark the old version with xmax, insert a new version with xmin\". You can see them yourself: SELECT xmin, xmax, * FROM accounts.\n\nA snapshot records which XIDs had committed at the moment it was taken. A row version is visible to you if its xmin committed before your snapshot, and its xmax is either empty or not yet committed in your snapshot. pg_current_snapshot() shows the current one.\n\nThe cost: old versions pile up as dead rows. They stay until no running snapshot could still need them, and then VACUUM removes them. That is why a single transaction left open for hours causes table bloat everywhere.",
        visual: {
          type: "sequence",
          title: "Two row versions, two different readers",
          actors: ["Txn 100 (writer)", "Table", "Txn 101 (reader)"],
          messages: [
            { from: 2, to: 1, label: "Snapshot taken: 100 still running" },
            { from: 0, to: 1, label: "UPDATE: old row xmax=100" },
            { from: 0, to: 1, label: "New row xmin=100" },
            { from: 0, to: 1, label: "COMMIT" },
            { from: 2, to: 1, label: "SELECT in same snapshot" },
            { from: 1, to: 2, label: "Old version: 100 was not committed in my snapshot" },
          ],
        },
      },
      {
        heading: "The anomalies, and which level stops which",
        body: "The SQL standard describes problems that concurrency can cause. A dirty read sees another transaction's uncommitted data; Postgres never allows this, and even READ UNCOMMITTED behaves as Read Committed. A non-repeatable read reads the same row twice and gets different values. A phantom read runs the same query twice and gets new rows. A lost update is two read-then-write transactions where one write overwrites the other. Write skew is two transactions that each read overlapping data, make decisions, and write different rows, together breaking a rule neither broke alone.\n\nIn Postgres, Read Committed stops dirty reads only. Repeatable Read is implemented as snapshot isolation, which is stronger than the standard asks: it also stops non-repeatable reads and phantoms, and detects lost updates by failing with a serialization error. Only Serializable also stops write skew.",
        visual: {
          type: "compare",
          title: "What each Postgres level allows",
          columns: [
            { title: "Read Committed", points: ["Dirty read: never", "Non-repeatable read: possible", "Phantom: possible", "Write skew: possible"] },
            { title: "Repeatable Read", points: ["Non-repeatable read: no", "Phantom: no (in Postgres)", "Lost update: error 40001", "Write skew: possible"] },
            { title: "Serializable", points: ["All of Repeatable Read", "Write skew: error 40001", "Result equals some serial order", "Needs retry logic"] },
          ],
        },
      },
      {
        heading: "How Read Committed handles concurrent UPDATEs",
        body: "Read Committed is not as weak as it sounds for simple writes. When your UPDATE finds a row that another transaction is changing, it waits. If the other one commits, Postgres re-reads the newest version of that row, checks your WHERE again, and applies your change to that version. So UPDATE accounts SET balance = balance - 30 WHERE id = 1 is safe: two of these in parallel subtract 60 in total.\n\nThe danger is the read-modify-write pattern done in application code: SELECT the balance, compute a new number in the app, then UPDATE SET balance = 70. The second writer's computed value is based on an old read, so one change is lost. Fix it by doing the math in SQL, by locking with SELECT ... FOR UPDATE, or by using Repeatable Read, which raises an error instead of losing data.\n\nAlso note that in Read Committed two SELECTs in one report can see different data, so totals may not add up. Run reports in Repeatable Read.",
        bullets: ["UPDATE ... SET x = x - 1 is safe under Read Committed", "SELECT, compute in app, UPDATE is not", "Reports that need consistent totals: Repeatable Read"],
      },
      {
        heading: "Serializable and retries",
        body: "Postgres implements Serializable with Serializable Snapshot Isolation (SSI). Transactions still run in parallel with snapshots, but Postgres tracks what each one read (shown as SIReadLock entries in pg_locks) and what it wrote. If it finds a pattern of read and write dependencies that could not happen in any one-at-a-time order, it aborts one transaction with SQLSTATE 40001, serialization_failure.\n\nThat means your application must retry: catch 40001, roll back, and run the whole transaction again, including the reads, a few times with a short random backoff. Treat 40P01 (deadlock detected) the same way. Retry logic belongs in one helper so every transaction uses it.\n\nTips: keep serializable transactions short; declare read-only ones with READ ONLY, which helps SSI; and for a long report use SERIALIZABLE READ ONLY DEFERRABLE, which waits for a safe snapshot and then can never fail. You can also set default_transaction_isolation for a role or database.",
        bullets: ["Retry on SQLSTATE 40001 and 40P01", "Retry the whole transaction, not just the last statement", "BEGIN ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE for long reports"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Write skew: two doctors leave on-call at once",
        actors: ["Session A (Alice)", "Postgres", "Session B (Bob)"],
        messages: [
          { from: 0, to: 1, label: "count on-call doctors: 2" },
          { from: 2, to: 1, label: "count on-call doctors: 2" },
          { from: 0, to: 1, label: "UPDATE Alice off-call; COMMIT" },
          { from: 2, to: 1, label: "UPDATE Bob off-call; COMMIT" },
          { from: 1, to: 2, label: "Repeatable Read: ok, now 0 on call" },
          { from: 1, to: 2, label: "Serializable: ERROR 40001, retry" },
        ],
      },
    ],
    examples: [
      {
        title: "Reproducing write skew in two psql windows",
        explanation: "Rule: at least one doctor must stay on call. Step 1: create the table with two doctors on call. Step 2: in both sessions, begin a Repeatable Read transaction and count on-call doctors; both see 2. Step 3: each session takes itself off call and commits. Both succeed and nobody is on call: write skew. Step 4: repeat with SERIALIZABLE; the second COMMIT (or update) fails with 40001, and the retry sees only 1 doctor and refuses.",
        code: {
          lang: "sql",
          code: "CREATE TABLE doctors (name text PRIMARY KEY, on_call boolean NOT NULL);\nINSERT INTO doctors VALUES ('alice', true), ('bob', true);\n\n-- Session A                          -- Session B\nBEGIN ISOLATION LEVEL SERIALIZABLE;   -- BEGIN ISOLATION LEVEL SERIALIZABLE;\nSELECT count(*) FROM doctors          -- SELECT count(*) FROM doctors\n  WHERE on_call;          -- 2        --   WHERE on_call;          -- 2\nUPDATE doctors SET on_call = false    -- UPDATE doctors SET on_call = false\n  WHERE name = 'alice';               --   WHERE name = 'bob';\nCOMMIT;  -- ok                        -- COMMIT;\n                                      -- ERROR: could not serialize access\n                                      -- due to read/write dependencies ...",
        },
      },
      {
        title: "A retry helper for serializable transactions",
        explanation: "Any serializable transaction may fail and must be retried from the start. Step 1: wrap the work in a function that receives the connection. Step 2: run it inside a transaction whose first statement sets the isolation level. Step 3: on SerializationFailure or DeadlockDetected, wait a short random time and try again. Step 4: give up after a few attempts so a real bug does not loop forever.",
        code: {
          lang: "python",
          code: "import random, time\nfrom psycopg import errors\n\ndef run_serializable(conn, work, attempts=5):\n    for attempt in range(attempts):\n        try:\n            with conn.transaction():\n                conn.execute(\"SET TRANSACTION ISOLATION LEVEL SERIALIZABLE\")\n                return work(conn)\n        except (errors.SerializationFailure, errors.DeadlockDetected):\n            time.sleep(random.uniform(0, 0.05 * 2 ** attempt))\n    raise RuntimeError(\"transaction failed after retries\")",
        },
      },
    ],
    cheatSheet: [
      "BEGIN ISOLATION LEVEL REPEATABLE READ;  or SERIALIZABLE",
      "SHOW transaction_isolation;  current level (default: read committed)",
      "SELECT xmin, xmax, * FROM t;  see the MVCC version columns",
      "SQLSTATE 40001 = serialization failure; 40P01 = deadlock: retry the whole transaction",
      "Postgres never shows uncommitted data, even at READ UNCOMMITTED",
      "BEGIN ISOLATION LEVEL SERIALIZABLE READ ONLY DEFERRABLE;  long reports that never fail",
      "ALTER ROLE app SET default_transaction_isolation = 'serializable';",
    ],
    quiz: [
      {
        q: "Under Read Committed, two sessions run UPDATE stock SET qty = qty - 1 WHERE id = 5 at the same time. What happens?",
        options: ["One update is lost", "Both fail with 40001", "The second waits, then applies its change to the new version: qty drops by 2", "Postgres raises a deadlock"],
        answer: 2,
        why: "The second UPDATE waits for the first to commit, re-reads the latest row and applies its own decrement.",
      },
      {
        q: "Which anomaly can still happen under Repeatable Read in PostgreSQL?",
        options: ["Write skew", "Dirty read", "Non-repeatable read", "Phantom read"],
        answer: 0,
        why: "Postgres Repeatable Read is snapshot isolation, which prevents phantoms but not write skew.",
      },
      {
        q: "What does the hidden column xmax on a row version hold?",
        options: ["The largest value in the row", "The time the row was created", "The number of times it was read", "The ID of the transaction that deleted, replaced or locked it"],
        answer: 3,
        why: "xmax marks the end of a row version's life (or a lock on it); 0 means no transaction has done so.",
      },
      {
        q: "A serializable transaction fails with SQLSTATE 40001. What should the app do?",
        options: ["Ignore it", "Roll back and run the whole transaction again", "Retry only the last statement", "Switch to READ UNCOMMITTED"],
        answer: 1,
        why: "Serialization failures are expected; the full transaction, including its reads, must be retried.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show that an UPDATE creates a new row version by comparing the hidden ctid and xmin columns before and after.",
        hint: "ctid is the physical location of the row version.",
        solution: "CREATE TABLE t (id int PRIMARY KEY, v int);\nINSERT INTO t VALUES (1, 10);\nSELECT ctid, xmin, xmax, * FROM t;   -- e.g. (0,1)\nUPDATE t SET v = 11 WHERE id = 1;\nSELECT ctid, xmin, xmax, * FROM t;   -- e.g. (0,2), new xmin",
      },
      {
        level: "medium",
        task: "In two psql sessions, show a non-repeatable read under Read Committed, then show that Repeatable Read prevents it.",
        hint: "Session A reads twice; session B updates and commits in between.",
        solution: "-- A: BEGIN;  SELECT v FROM t WHERE id = 1;   -- 11\n-- B: UPDATE t SET v = 99 WHERE id = 1;        -- autocommit\n-- A: SELECT v FROM t WHERE id = 1;   -- 99 (changed)\n-- A: COMMIT;\n-- A: BEGIN ISOLATION LEVEL REPEATABLE READ;\n-- A: SELECT v FROM t WHERE id = 1;   -- 99\n-- B: UPDATE t SET v = 5 WHERE id = 1;\n-- A: SELECT v FROM t WHERE id = 1;   -- still 99\n-- A: COMMIT;",
      },
      {
        level: "hard",
        task: "Under Repeatable Read, make a lost update attempt fail: both sessions read balance 100, then both run UPDATE ... SET balance = 70 and 50. Describe what each session sees.",
        hint: "The second writer waits for the first, then gets an error instead of overwriting.",
        solution: "-- A: BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT balance ... -- 100\n-- B: BEGIN ISOLATION LEVEL REPEATABLE READ; SELECT balance ... -- 100\n-- A: UPDATE accounts SET balance = 70 WHERE id = 1;\n-- B: UPDATE accounts SET balance = 50 WHERE id = 1;  -- waits\n-- A: COMMIT;\n-- B: ERROR: could not serialize access due to concurrent update\n-- B: ROLLBACK; retry: reads 70, writes 20",
      },
    ],
    faq: [
      { q: "Should I just use Serializable everywhere?", a: "It is the safest level, but every transaction then needs retry logic and there is some overhead. Many teams use Read Committed with careful locking, and Serializable for the few flows with tricky invariants." },
      { q: "What is the difference between Repeatable Read and Serializable in Postgres?", a: "Both use one snapshot per transaction. Serializable also tracks read and write dependencies and aborts transactions that would cause anomalies like write skew." },
      { q: "Does MVCC mean Postgres never locks?", a: "No. Reads do not block writes, but two writers on the same row still wait for each other, and DDL takes table locks." },
    ],
  },

  "transactions/locking": {
    plain: [
      "MVCC lets readers and writers work side by side, but two writers changing the same row must take turns. Postgres uses locks for that. A lock is like an \"in use\" sign: while one transaction holds it, others that need a conflicting lock wait in line.",
      "Most locks are taken for you. UPDATE and DELETE lock the rows they change until the transaction ends. ALTER TABLE locks the whole table. You can also ask for a row lock on purpose with SELECT ... FOR UPDATE, when you plan to read a row and then change it.",
      "A deadlock is a traffic jam with no way out: transaction A waits for a row B holds, while B waits for a row A holds. Neither can move. Postgres notices after about a second and cancels one of them with an error, so the other can finish.",
      "The best protection against lock trouble is boring: keep transactions short, lock rows in the same order everywhere, and never wait for something slow while holding a lock.",
    ],
    deepDive: [
      {
        heading: "Table-level lock modes",
        body: "Every statement takes a lock on each table it touches. There are eight modes; you only need to recognise a few. ACCESS SHARE is taken by SELECT and conflicts only with ACCESS EXCLUSIVE. ROW SHARE is taken by SELECT ... FOR UPDATE or FOR SHARE. ROW EXCLUSIVE is taken by INSERT, UPDATE and DELETE; these do not conflict with each other, because row locks sort out the details. SHARE UPDATE EXCLUSIVE is taken by VACUUM, ANALYZE and CREATE INDEX CONCURRENTLY. SHARE is taken by plain CREATE INDEX and blocks writes. ACCESS EXCLUSIVE is taken by most ALTER TABLE forms, DROP, TRUNCATE and VACUUM FULL, and blocks everything, even SELECT.\n\nTable locks are held until the transaction ends, not until the statement ends. A migration that runs ALTER TABLE and then a slow backfill in the same transaction keeps everyone out for the whole time.",
        visual: {
          type: "layers",
          title: "Common table lock modes, weakest to strongest",
          layers: [
            { label: "ACCESS SHARE", detail: "SELECT; blocked only by ACCESS EXCLUSIVE" },
            { label: "ROW SHARE", detail: "SELECT ... FOR UPDATE / FOR SHARE" },
            { label: "ROW EXCLUSIVE", detail: "INSERT, UPDATE, DELETE" },
            { label: "SHARE UPDATE EXCLUSIVE", detail: "VACUUM, ANALYZE, CREATE INDEX CONCURRENTLY" },
            { label: "SHARE", detail: "CREATE INDEX; blocks writes" },
            { label: "ACCESS EXCLUSIVE", detail: "Most ALTER TABLE, DROP, TRUNCATE; blocks all" },
          ],
        },
      },
      {
        heading: "Row locks: four strengths plus NOWAIT and SKIP LOCKED",
        body: "Row locks come in four strengths. FOR UPDATE is the strongest: you intend to change or delete the row. FOR NO KEY UPDATE is what a normal UPDATE takes when it does not change a key column. FOR SHARE says \"do not change this row while I look at it\". FOR KEY SHARE is the weakest; foreign key checks use it so that inserting a child does not block updates of the parent's non-key columns.\n\nTwo options change what happens when a row is already locked. NOWAIT fails immediately with an error instead of waiting. SKIP LOCKED silently skips locked rows, which is perfect for job queues: many workers can each grab different jobs without waiting on each other.\n\nRow locks are stored in the row itself (in xmax), not in memory, so a transaction can lock millions of rows cheaply. That also means pg_locks does not list every locked row, only the transactions someone is waiting for.",
        bullets: ["FOR UPDATE > FOR NO KEY UPDATE > FOR SHARE > FOR KEY SHARE", "NOWAIT: error at once instead of waiting", "SKIP LOCKED: ignore rows others hold (queues)", "FOR UPDATE OF t locks rows of one table in a join"],
      },
      {
        heading: "Preventing lost updates: four options",
        body: "A lost update happens when two transactions read the same value, each computes a new value in the app, and both write it back. There are four standard fixes.\n\nAtomic update: do the math in SQL. UPDATE accounts SET balance = balance - 30 WHERE id = 1 AND balance >= 30. No read is needed, and the row count tells you whether it worked. This is the simplest and fastest when it fits.\n\nPessimistic locking: SELECT ... FOR UPDATE, then UPDATE in the same transaction. Others wait, so the read is always fresh. Good when the logic needs app code between read and write.\n\nOptimistic locking: add a version column. UPDATE ... SET ..., version = version + 1 WHERE id = 1 AND version = 7. If 0 rows change, someone else won; reload and retry. Good for edits that span a user's think time, where holding a lock is impossible.\n\nStricter isolation: Repeatable Read or Serializable turn the lost update into an error that you retry.",
        visual: {
          type: "compare",
          title: "Lost update fixes",
          columns: [
            { title: "Atomic UPDATE", points: ["Math in SQL", "No extra round trip", "Check row count", "Only when logic fits SQL"] },
            { title: "FOR UPDATE", points: ["Lock, read, write, commit", "Others wait", "Logic can live in the app", "Keep the transaction short"] },
            { title: "Version column", points: ["No lock held while user thinks", "WHERE version = n", "0 rows = conflict, retry", "Common in web forms and APIs"] },
          ],
        },
      },
      {
        heading: "Deadlocks and finding who blocks whom",
        body: "When a lock wait lasts longer than deadlock_timeout (default 1 second), Postgres checks for a cycle of waiters. If it finds one, it cancels one transaction with SQLSTATE 40P01, \"deadlock detected\", and the server log shows which processes waited for which locks and the statements involved. The app should roll back and retry.\n\nPrevention: lock rows in a consistent order. If a transfer always locks the lower account id first (SELECT ... WHERE id IN (1, 2) ORDER BY id FOR UPDATE), two transfers can never wait on each other in a circle.\n\nFor ordinary waits, look at pg_stat_activity: wait_event_type = 'Lock' means a session is waiting, and pg_blocking_pids(pid) lists who blocks it. Follow the chain to the root blocker, which is often a session in state \"idle in transaction\". pg_cancel_backend(pid) cancels its current query; pg_terminate_backend(pid) ends the session. Turn on log_lock_waits to log waits longer than deadlock_timeout, and set lock_timeout so statements give up instead of waiting forever.",
        bullets: ["40P01 = deadlock detected; retry", "Lock in a fixed order, e.g. ORDER BY id FOR UPDATE", "pg_blocking_pids(pid) shows the blockers", "log_lock_waits = on, plus lock_timeout"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How a deadlock forms and is resolved",
        actors: ["Txn A", "Postgres", "Txn B"],
        messages: [
          { from: 0, to: 1, label: "UPDATE account 1 (locks row 1)" },
          { from: 2, to: 1, label: "UPDATE account 2 (locks row 2)" },
          { from: 0, to: 1, label: "UPDATE account 2: waits for B" },
          { from: 2, to: 1, label: "UPDATE account 1: waits for A" },
          { from: 1, to: 2, label: "After 1s: ERROR 40P01 deadlock detected" },
          { from: 1, to: 0, label: "Lock on row 2 granted, A continues" },
        ],
      },
    ],
    examples: [
      {
        title: "A job queue with FOR UPDATE SKIP LOCKED",
        explanation: "Several workers pull jobs from one table. With plain FOR UPDATE, all workers would wait on the same first row. Step 1: each worker selects the oldest pending job with FOR UPDATE SKIP LOCKED, so rows locked by other workers are skipped. Step 2: it marks the job as running in the same statement and commits at once, so the lock is short. Step 3: it does the work outside the transaction and records the result. A partial index on pending jobs keeps the query fast.",
        code: {
          lang: "sql",
          code: "CREATE INDEX jobs_pending_idx ON jobs (run_at) WHERE status = 'pending';\n\nUPDATE jobs SET status = 'running', started_at = now()\nWHERE id = (\n  SELECT id FROM jobs\n  WHERE status = 'pending' AND run_at <= now()\n  ORDER BY run_at\n  FOR UPDATE SKIP LOCKED\n  LIMIT 1\n)\nRETURNING id, payload;",
        },
      },
      {
        title: "Finding the root blocker during an incident",
        explanation: "The app is timing out and many sessions are waiting. Step 1: list waiting sessions with their blockers using pg_blocking_pids. Step 2: the blockers are all pid 4242, which is \"idle in transaction\" for 25 minutes: a script opened a transaction and never committed. Step 3: terminate that session; its transaction rolls back and the queue drains. Step 4: set idle_in_transaction_session_timeout so it cannot happen again.",
        code: {
          lang: "sql",
          code: "SELECT pid, pg_blocking_pids(pid) AS blocked_by, wait_event_type,\n       now() - xact_start AS xact_age, state, left(query, 60) AS query\nFROM pg_stat_activity\nWHERE wait_event_type = 'Lock' OR state = 'idle in transaction'\nORDER BY xact_start;\n\nSELECT pg_terminate_backend(4242);\n\nALTER DATABASE shop SET idle_in_transaction_session_timeout = '5min';",
        },
      },
    ],
    cheatSheet: [
      "SELECT ... FOR UPDATE locks rows until COMMIT or ROLLBACK",
      "FOR UPDATE SKIP LOCKED: queue workers skip rows others hold",
      "FOR UPDATE NOWAIT: error at once if the row is locked",
      "SET lock_timeout = '3s';  give up instead of waiting forever",
      "SELECT pid, pg_blocking_pids(pid) FROM pg_stat_activity WHERE wait_event_type = 'Lock';",
      "pg_cancel_backend(pid) stops a query; pg_terminate_backend(pid) ends the session",
      "Deadlock = SQLSTATE 40P01; lock rows in a consistent order to avoid it",
      "Optimistic lock: UPDATE ... SET version = version + 1 WHERE id = $1 AND version = $2",
    ],
    quiz: [
      {
        q: "Which lock does a plain SELECT take on a table?",
        options: ["ROW EXCLUSIVE", "ACCESS EXCLUSIVE", "SHARE", "ACCESS SHARE"],
        answer: 3,
        why: "ACCESS SHARE only conflicts with ACCESS EXCLUSIVE, so SELECTs run alongside normal writes.",
      },
      {
        q: "Ten workers poll the same jobs table. Which clause lets each grab a different job without waiting?",
        options: ["FOR UPDATE SKIP LOCKED", "FOR SHARE", "FOR UPDATE NOWAIT", "LOCK TABLE jobs"],
        answer: 0,
        why: "SKIP LOCKED ignores rows already locked by other workers, so each finds a free one.",
      },
      {
        q: "Two transfers lock accounts in opposite orders and one fails with 40P01. What is the best lasting fix?",
        options: ["Increase deadlock_timeout", "Use a bigger server", "Always lock the accounts in the same order, such as by id", "Remove the transactions"],
        answer: 2,
        why: "A consistent lock order makes a circular wait impossible.",
      },
      {
        q: "An UPDATE ... WHERE id = 1 AND version = 7 reports 0 rows updated. What does that mean with optimistic locking?",
        options: ["The row was deleted for sure", "Another transaction changed the row first; reload and retry", "The database is read-only", "A deadlock occurred"],
        answer: 1,
        why: "The version no longer matches, so someone else's write won and your change must be redone on fresh data.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Rewrite this lost-update-prone code as one safe statement: SELECT qty FROM stock WHERE sku = 'A1'; then in the app qty = qty - 3; then UPDATE stock SET qty = (the new value) WHERE sku = 'A1'.",
        hint: "Do the subtraction in SQL and guard against going negative.",
        solution: "UPDATE stock\nSET qty = qty - 3\nWHERE sku = 'A1' AND qty >= 3\nRETURNING qty;\n-- 0 rows returned = not enough stock",
      },
      {
        level: "medium",
        task: "Reproduce a deadlock in two psql sessions with two rows of accounts, and read the error message.",
        hint: "Each session updates a different row first, then the other row.",
        solution: "-- A: BEGIN; UPDATE accounts SET balance = balance - 1 WHERE id = 1;\n-- B: BEGIN; UPDATE accounts SET balance = balance - 1 WHERE id = 2;\n-- A: UPDATE accounts SET balance = balance + 1 WHERE id = 2;  -- waits\n-- B: UPDATE accounts SET balance = balance + 1 WHERE id = 1;\n-- one session after ~1s:\n-- ERROR: deadlock detected\n-- DETAIL: Process ... waits for ShareLock on transaction ...; blocked by process ...\n-- the other session's UPDATE then completes; COMMIT it",
      },
      {
        level: "hard",
        task: "Write a transfer of 30 from account 1 to account 2 that cannot deadlock with a concurrent transfer the other way, and that refuses to overdraw.",
        hint: "Lock both rows in id order first, then check and update.",
        solution: "BEGIN;\nSELECT id, balance FROM accounts\nWHERE id IN (1, 2)\nORDER BY id\nFOR UPDATE;\n-- app: abort with ROLLBACK if balance of id 1 < 30\nUPDATE accounts SET balance = balance - 30 WHERE id = 1;\nUPDATE accounts SET balance = balance + 30 WHERE id = 2;\nCOMMIT;",
      },
    ],
    faq: [
      { q: "Does SELECT ever block in PostgreSQL?", a: "Only when something holds an ACCESS EXCLUSIVE lock on the table, such as most ALTER TABLE commands, TRUNCATE or VACUUM FULL. Normal writes never block plain SELECTs." },
      { q: "What is the difference between FOR UPDATE and FOR SHARE?", a: "FOR UPDATE is exclusive: only one transaction can hold it on a row. FOR SHARE lets several transactions hold it at once, but blocks anyone who wants to update or delete the row." },
      { q: "Should I use LOCK TABLE?", a: "Rarely. It locks the whole table and hurts concurrency. Row locks with FOR UPDATE, or an advisory lock with pg_advisory_xact_lock, almost always fit better." },
      { q: "What is an advisory lock?", a: "A lock on a number you choose rather than on a row or table, taken with pg_advisory_lock or pg_advisory_xact_lock. Apps use it to make sure only one worker runs a job at a time." },
    ],
  },
};

export default extra;
