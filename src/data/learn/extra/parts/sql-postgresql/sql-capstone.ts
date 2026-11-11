import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sql-capstone/sql-capstone-model": {
    plain: [
      "Before you write a single CREATE TABLE, you need to know what the app must remember and what questions people will ask it. A library app, for example, must remember members, books and loans, and must answer questions like \"which books are overdue?\" and \"how many loans did we have last month?\"",
      "From those notes you pick out entities: the main things the app is about, usually nouns such as member, book and loan. Then you work out relationships: one member can have many loans; one book can have many authors, and one author can write many books.",
      "An ER diagram (entity relationship diagram) draws this as boxes and lines. Each box is a table with its columns and keys. The ends of each line show how many: one, or many (the crow's foot, a line that splits into three like a bird's foot).",
      "Last, you turn the drawing into DDL (the SQL that creates tables) and check it against third normal form (3NF): every fact is stored once, in the table where it belongs. A schema that passes this review is much easier to keep correct as the app grows.",
    ],
    deepDive: [
      {
        heading: "Gathering requirements that shape the schema",
        body: "Collect three kinds of notes. User stories say what people do: \"A member borrows a copy of a book for 21 days.\" Business rules say what must always be true: \"A copy can be on loan to only one member at a time\" and \"A member may hold at most 5 loans.\" Report questions say what the data must answer: \"Top 10 most borrowed books this year\" or \"members with overdue loans\".\n\nEach note points at schema decisions. \"Copy\" and \"book\" are different entities, because the library owns several physical copies of one title. The 21-day rule means you need a due date. The report on overdue loans means you need both due_at and returned_at, not just a status text.\n\nAsk about history early. Do you need to know who borrowed a copy two years ago? Then loans are never deleted, only closed. Questions like this are cheap to answer now and expensive to change later.",
        bullets: ["Nouns become candidate tables", "Verbs between nouns become relationships", "Must, never and at most become constraints", "Reports tell you which columns and indexes you need"],
      },
      {
        heading: "Reading and drawing relationships",
        body: "For each pair of entities, ask two questions, one from each side. Can one member have many loans? Yes. Can one loan belong to many members? No. That is one-to-many, and the foreign key goes on the many side: loans.member_id.\n\nIf the answer is many from both sides (one book has many authors, one author has many books), you need a junction table, book_authors, with two foreign keys and a composite primary key. Junction tables can carry their own facts too, such as the author's position on the cover.\n\nAlso decide optional or required. Every loan must have a member, so member_id is NOT NULL. A book may have no copies yet, so nothing forces a copy to exist. In crow's-foot notation, a bar means exactly one, a circle means zero is allowed, and the crow's foot means many. Tools like dbdiagram.io, draw.io or pgAdmin's ERD tool can draw this for you from the DDL.",
        visual: {
          type: "tree",
          title: "Library entities and their relationships",
          root: "Library schema",
          children: [
            { label: "members", children: ["1 to many: loans"] },
            { label: "books", children: ["1 to many: copies", "many to many: authors via book_authors"] },
            { label: "copies", children: ["1 to many: loans (one open at a time)"] },
            { label: "loans", children: ["member_id, copy_id NOT NULL", "borrowed_at, due_at, returned_at"] },
            { label: "authors", children: ["many to many: books"] },
          ],
        },
      },
      {
        heading: "Choosing types and constraints while modelling",
        body: "Decide types and constraints at the same time as tables, because they are part of the design. Use bigint GENERATED ALWAYS AS IDENTITY for surrogate keys, text for strings (in PostgreSQL, varchar(n) is not faster, it only adds a length check), timestamptz for moments in time, date for calendar days, and numeric for money.\n\nTurn every business rule you can into a constraint. NOT NULL for required fields. UNIQUE for natural keys like a member's email or a book's ISBN. CHECK for simple rules such as due_at > borrowed_at. Foreign keys with a deliberate ON DELETE choice: CASCADE for parts that cannot exist alone (book_authors rows), RESTRICT, or the default NO ACTION, for history you must keep (loans).\n\nSome rules need more than a simple constraint. \"Only one open loan per copy\" becomes a partial unique index on loans(copy_id) WHERE returned_at IS NULL. \"At most 5 loans\" usually lives in application code or a trigger, so write down where it is enforced.",
      },
      {
        heading: "Reviewing against 3NF",
        body: "Walk through each table and check three things. First normal form: every column holds one value, with no lists like authors = 'Smith, Lee' and no repeating columns like phone1, phone2. Second normal form: in a table with a composite key, every non-key column depends on the whole key, not just part of it; in book_authors, the book title would depend only on book_id, so it belongs in books. Third normal form: non-key columns depend only on the key, not on other non-key columns; storing member_city and member_postcode on every loan repeats facts about the member.\n\nThe practical test: if one real-world fact changes, how many rows must you update? The answer should be one.\n\nDeliberate exceptions are fine when written down. Storing the loan's due_at, even though it could be computed from borrowed_at plus a policy, is correct, because the policy may change later while old loans keep their original due date.",
        visual: {
          type: "compare",
          title: "Before and after the 3NF review",
          columns: [
            { title: "Before", points: ["loans has member_name and member_email", "books has authors as a comma list", "copies repeats the book title", "Changing an email means many updates"] },
            { title: "After", points: ["loans has member_id only", "book_authors junction table", "copies has book_id only", "Every fact stored once"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From one requirement to schema pieces",
        steps: [
          { label: "Rule", detail: "A copy is lent to one member at a time" },
          { label: "Entities", detail: "copies and loans are separate tables" },
          { label: "Relationship", detail: "copies 1 to many loans over time" },
          { label: "Column", detail: "loans.returned_at, NULL while open" },
          { label: "Constraint", detail: "Unique copy_id where returned_at is NULL" },
        ],
      },
    ],
    examples: [
      {
        title: "DDL for the library core",
        explanation: "This DDL follows the model. Note the junction table for authors, the CHECK on loan dates, the RESTRICT on loans so history cannot be deleted by accident, and the partial unique index that allows many closed loans per copy but only one open one.",
        code: {
          lang: "sql",
          code: "CREATE TABLE members (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email text NOT NULL UNIQUE, name text NOT NULL, joined_on date NOT NULL DEFAULT current_date);\nCREATE TABLE books (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  isbn text NOT NULL UNIQUE, title text NOT NULL, published_year int);\nCREATE TABLE authors (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL);\nCREATE TABLE book_authors (book_id bigint REFERENCES books(id) ON DELETE CASCADE,\n  author_id bigint REFERENCES authors(id), PRIMARY KEY (book_id, author_id));\nCREATE TABLE copies (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  book_id bigint NOT NULL REFERENCES books(id), barcode text NOT NULL UNIQUE);\nCREATE TABLE loans (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  member_id bigint NOT NULL REFERENCES members(id) ON DELETE RESTRICT,\n  copy_id bigint NOT NULL REFERENCES copies(id) ON DELETE RESTRICT,\n  borrowed_at timestamptz NOT NULL DEFAULT now(), due_at timestamptz NOT NULL,\n  returned_at timestamptz, CHECK (due_at > borrowed_at));\nCREATE UNIQUE INDEX one_open_loan_per_copy ON loans (copy_id) WHERE returned_at IS NULL;",
        },
      },
      {
        title: "Fixing a 3NF problem found in review",
        explanation: "A first draft had loans(member_id, member_email, copy_id, book_title, ...). Step 1: ask what each column depends on. member_email depends on member_id, and book_title depends on the copy's book, not on the loan. Step 2: both are transitive dependencies, so they break 3NF. Step 3: drop them from loans; they already live in members and books. Step 4: confirm the report \"overdue loans with member email and book title\" still works with joins.",
        code: {
          lang: "sql",
          code: "SELECT m.email, b.title, l.due_at\nFROM loans l\nJOIN members m ON m.id = l.member_id\nJOIN copies  c ON c.id = l.copy_id\nJOIN books   b ON b.id = c.book_id\nWHERE l.returned_at IS NULL AND l.due_at < now()\nORDER BY l.due_at;",
        },
      },
    ],
    cheatSheet: [
      "Write report questions first; they decide columns and indexes",
      "One-to-many: the foreign key goes on the many side",
      "Many-to-many: a junction table with a composite primary key",
      "Crow's foot = many, bar = exactly one, circle = zero allowed",
      "3NF test: changing one real fact should update exactly one row",
      "Partial unique index enforces rules like one open loan per copy",
      "Use timestamptz for moments, date for days, numeric for money",
      "Write down every deliberate denormalisation and why",
    ],
    quiz: [
      {
        q: "One book can have several authors and one author can write several books. How do you model this?",
        options: ["An author_id column on books", "A books column on authors holding a list", "A junction table book_authors with both foreign keys", "One table for books and authors together"],
        answer: 2,
        why: "Many-to-many relationships need a junction table; a single foreign key only models one-to-many.",
      },
      {
        q: "In a one-to-many relationship between members and loans, where does the foreign key go?",
        options: ["loans.member_id", "members.loan_id", "In a separate junction table", "On both tables"],
        answer: 0,
        why: "The many side (loans) points at the one side (members).",
      },
      {
        q: "A loans table stores member_email next to member_id. Which rule does this break?",
        options: ["First normal form", "Second normal form", "Referential integrity", "Third normal form"],
        answer: 3,
        why: "member_email depends on member_id, a non-key column, which is a transitive dependency.",
      },
      {
        q: "How can PostgreSQL enforce that a copy has at most one open loan, while keeping old loans?",
        options: ["A UNIQUE constraint on copy_id", "A partial unique index on copy_id WHERE returned_at IS NULL", "A CHECK constraint", "A foreign key with CASCADE"],
        answer: 1,
        why: "The partial index only covers open loans, so closed ones do not count.",
      },
      {
        q: "Why store due_at on each loan instead of computing it from a 21-day policy?",
        options: ["The policy may change, but old loans keep their original due date", "PostgreSQL cannot add intervals", "It saves disk space", "Computed values cannot be indexed"],
        answer: 0,
        why: "It is a historical fact about that loan, so storing it is correct, not redundant.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write five report questions and three business rules for a library app, and list the entities they imply.",
        hint: "Look for nouns in the questions and must or never in the rules.",
        solution: "Reports: overdue loans today; top 10 books this year; loans per month;\n  members with no loans in 6 months; copies never borrowed.\nRules: one open loan per copy; max 5 open loans per member;\n  due date is set when the loan starts.\nEntities: members, books, authors, copies, loans (+ book_authors).",
      },
      {
        level: "medium",
        task: "Add reservations: a member can reserve a book (not a specific copy), and the queue order matters. Write the DDL and state the relationships.",
        hint: "A reservation belongs to one member and one book; store when it was made.",
        solution: "CREATE TABLE reservations (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  member_id bigint NOT NULL REFERENCES members(id),\n  book_id bigint NOT NULL REFERENCES books(id),\n  reserved_at timestamptz NOT NULL DEFAULT now(),\n  fulfilled_at timestamptz);\nCREATE UNIQUE INDEX one_active_reservation ON reservations (member_id, book_id)\n  WHERE fulfilled_at IS NULL;\n-- members 1:N reservations, books 1:N reservations; queue = ORDER BY reserved_at",
      },
      {
        level: "hard",
        task: "Review this draft table against 1NF, 2NF and 3NF and fix it: book_authors(book_id, author_id, book_title, author_name, author_country, position).",
        hint: "Ask what each column depends on: the whole key, part of it, or another column.",
        solution: "Key: (book_id, author_id).\nbook_title depends only on book_id -> partial (2NF): move to books.\nauthor_name, author_country depend only on author_id -> 2NF: move to authors.\nposition depends on the whole key -> stays.\nResult: book_authors(book_id, author_id, position),\n        books(id, title, ...), authors(id, name, country).",
      },
    ],
    faq: [
      { q: "Which tool should I use to draw the ER diagram?", a: "Any tool is fine: dbdiagram.io, draw.io, or pgAdmin's ERD tool, which can also generate diagrams from an existing database. What matters is that keys and cardinalities are shown clearly." },
      { q: "Should I use natural keys like ISBN as primary keys?", a: "Usually use a surrogate identity key as the primary key and keep the natural key UNIQUE. Natural keys can change or be missing, and they make foreign keys bigger." },
      { q: "Is 3NF always the goal?", a: "For the core write tables, yes. Reporting tables or caches can be denormalised on purpose, as long as you document why and how they stay in sync." },
    ],
  },

  "sql-capstone/sql-capstone-build": {
    plain: [
      "Now the design becomes a real, working database that anyone can rebuild from your repository. Each change to the schema lives in a numbered file called a migration, and running them in order recreates the database exactly.",
      "An empty database cannot teach you much, so you fill it with seed data: thousands of realistic rows made with SQL. Real-looking volume matters, because PostgreSQL chooses how to run a query based on table sizes.",
      "Then you write the queries the business asked for: monthly totals, rankings, trends. Common table expressions (CTEs, the WITH ... AS blocks) break big queries into readable steps, and window functions compute running totals and rankings without losing the individual rows.",
      "Finally you make it production-like: add indexes only where EXPLAIN proves they help, write a backup script and prove it by restoring, and document it all in a README so a reviewer can run everything in a few minutes.",
    ],
    deepDive: [
      {
        heading: "Versioned migrations",
        body: "A migration is a file that moves the schema from one version to the next: 0001_init.sql, 0002_add_reservations.sql, 0003_indexes.sql. A migration tool records which files have run in a table, so each runs exactly once and in order. Popular choices are Flyway, Liquibase, dbmate and sqitch; for a capstone, even a short shell script that runs each file with psql and records it in a schema_migrations table works.\n\nRules that keep migrations safe: never edit a file that has already run anywhere, add a new one instead. Wrap each migration in a transaction; PostgreSQL supports transactional DDL, so a failed migration leaves no half-built tables. Commands that cannot run in a transaction, like CREATE INDEX CONCURRENTLY, need their own file and a tool setting that allows it.\n\nProve reproducibility: in CI or locally, drop the database, run all migrations from zero, then load the seed. If that works, anyone can rebuild your project.",
        bullets: ["psql -v ON_ERROR_STOP=1 makes a script stop at the first error", "psql -1 runs a whole file in one transaction", "Keep seed data separate from schema migrations"],
      },
      {
        heading: "Realistic seed data with generate_series",
        body: "generate_series(1, 50000) produces 50,000 rows you can turn into data with random(). Realism matters more than raw size. Real data is skewed: a few books are borrowed far more often than others, and most loans are returned on time. Plans and index choices depend on that shape. You can skew values with a power of random(), for example floor(power(random(), 3) * 5000) + 1 picks low ids much more often.\n\nMake seeds repeatable. Call SELECT setseed(0.42) at the start of the seed script so random() gives the same sequence every time, which keeps EXPLAIN results and example outputs in your README stable.\n\nLoad in dependency order (members and books, then copies, then loans), respect your constraints (the one-open-loan-per-copy index will reject bad seed rows, which is a good test), and run ANALYZE afterwards so the planner has fresh statistics.",
      },
      {
        heading: "Analytics with CTEs and window functions",
        body: "A CTE names a step of a query: WITH monthly AS (SELECT ...) SELECT ... FROM monthly. It reads top to bottom like a recipe. Since PostgreSQL 12, simple CTEs used once are inlined into the main query, so they no longer block optimisation; add MATERIALIZED only when you want a step computed once.\n\nWindow functions calculate across related rows while keeping every row. SUM(n) OVER (ORDER BY month) gives a running total. LAG(n) OVER (ORDER BY month) gives last month's value for month-over-month change. ROW_NUMBER() or DENSE_RANK() OVER (PARTITION BY category ORDER BY loans DESC) ranks items inside each group, and a filter on that rank gives \"top 3 per category\".\n\nWindow results cannot be filtered in the same WHERE, because WHERE runs before windows are computed. Wrap the query in a CTE and filter outside it.",
        visual: {
          type: "flow",
          title: "Top 3 books per genre, step by step",
          steps: [
            { label: "Join loans to books", detail: "One row per loan with its genre" },
            { label: "Group and count", detail: "Loans per book within the year" },
            { label: "Rank with a window", detail: "DENSE_RANK per genre by count" },
            { label: "Filter in outer query", detail: "WHERE rank <= 3" },
          ],
        },
      },
      {
        heading: "Indexes justified by EXPLAIN",
        body: "For each important query, run EXPLAIN (ANALYZE, BUFFERS) and save the output. Look at the node types (Seq Scan, Index Scan, Bitmap Heap Scan), the actual time, the rows estimated versus actual, and the buffers read. Then add one index that matches the query's WHERE, JOIN and ORDER BY columns, rerun, and compare.\n\nColumn order in a composite index matters: put equality filters first, then range filters or sort columns. An index on loans(member_id, borrowed_at) serves \"loans for member 7, newest first\" directly. A partial index such as loans(due_at) WHERE returned_at IS NULL is tiny and perfect for the overdue report.\n\nKeep an index only if it clearly helps a query you actually run. Each index slows inserts and updates and uses disk. Write a short note per index in the repo: the query, the plan before and after, and the timing.",
        visual: {
          type: "compare",
          title: "Overdue report before and after a partial index",
          columns: [
            { title: "Before", points: ["Seq Scan on loans", "Reads every loan row", "Filter removes most rows", "Time grows with history"] },
            { title: "After", points: ["Index Scan on a partial index", "Only open loans are in the index", "Already ordered by due_at", "Time stays low as history grows"] },
          ],
        },
      },
      {
        heading: "Backup, restore test and README",
        body: "pg_dump makes a logical backup of one database. The custom format (-Fc) is compressed and lets pg_restore pick objects, run in parallel with -j, and reorder steps. pg_dumpall --globals-only saves roles, which pg_dump does not include.\n\nA backup only counts when a restore has been tested. The script should create a fresh database, restore into it, and check something real: table row counts match, or a known query returns the same answer. Run it on a schedule or in CI, and keep the backup file name dated so old ones can be pruned.\n\nThe README ties everything together: what the database is for, the ER diagram, how to run migrations and seed (ideally one command, such as docker compose up plus make seed), the analytics queries with sample output, the index notes, and how to back up and restore. A reviewer should go from git clone to a working database in under five minutes.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Rebuild from zero, every time",
        steps: [
          { label: "Drop database", detail: "Start from nothing" },
          { label: "Run migrations", detail: "0001 to latest, in order" },
          { label: "Load seed", detail: "setseed for repeatable data, then ANALYZE" },
          { label: "Run queries", detail: "Check outputs and EXPLAIN plans" },
          { label: "Backup and restore test", detail: "Row counts must match" },
        ],
      },
    ],
    examples: [
      {
        title: "Monthly loans with running total and change",
        explanation: "The CTE counts loans per month. The outer query adds a running total with SUM OVER, last month's count with LAG, and the percentage change. NULLIF avoids division by zero in an empty month. date_trunc returns the first moment of each month.",
        code: {
          lang: "sql",
          code: "WITH monthly AS (\n  SELECT date_trunc('month', borrowed_at) AS month, count(*) AS loans\n  FROM loans\n  WHERE borrowed_at >= now() - interval '12 months'\n  GROUP BY 1\n)\nSELECT month::date,\n       loans,\n       SUM(loans) OVER (ORDER BY month)  AS running_total,\n       LAG(loans) OVER (ORDER BY month)  AS prev_month,\n       round(100.0 * (loans - LAG(loans) OVER (ORDER BY month))\n             / NULLIF(LAG(loans) OVER (ORDER BY month), 0), 1) AS pct_change\nFROM monthly\nORDER BY month;",
        },
      },
      {
        title: "A backup script that proves itself",
        explanation: "The script dumps the library database in custom format with a dated name, restores it into a scratch database, and compares row counts for key tables. If any count differs, it exits with an error, so a scheduler or CI job notices. set -euo pipefail stops on the first failure.",
        code: {
          lang: "bash",
          code: "#!/usr/bin/env bash\nset -euo pipefail\nfile=\"backups/library_$(date +%F).dump\"\npg_dump -Fc -d library -f \"$file\"\ndropdb --if-exists library_restore_test\ncreatedb library_restore_test\npg_restore -d library_restore_test -j 4 \"$file\"\nfor t in members books copies loans; do\n  a=$(psql -tAc \"SELECT count(*) FROM $t\" library)\n  b=$(psql -tAc \"SELECT count(*) FROM $t\" library_restore_test)\n  [ \"$a\" = \"$b\" ] || { echo \"mismatch in $t: $a vs $b\"; exit 1; }\ndone\necho \"backup $file verified\"",
        },
      },
    ],
    cheatSheet: [
      "Never edit a migration that has run; add a new numbered file",
      "psql -v ON_ERROR_STOP=1 -1 -f file.sql runs one file atomically and stops on error",
      "SELECT setseed(0.42); before random() makes seed data repeatable",
      "Run ANALYZE after loading seed data so plans use real statistics",
      "Window results cannot be filtered in WHERE; wrap in a CTE first",
      "EXPLAIN (ANALYZE, BUFFERS) shows real time, row counts and pages read",
      "pg_dump -Fc + pg_restore -j 4 for fast, flexible restores; roles need pg_dumpall -g",
      "A backup is only proven by a successful restore and a data check",
    ],
    quiz: [
      {
        q: "A migration that already ran in production has a typo in a column name. What should you do?",
        options: ["Edit the old file and rerun everything", "Write a new migration that renames the column", "Delete the migration history table", "Fix it manually and tell nobody"],
        answer: 1,
        why: "Migrations are history; changing an applied file makes environments disagree about the schema.",
      },
      {
        q: "Why can you not write WHERE rank <= 3 in the same query that computes rank with a window function?",
        options: ["Window functions are not allowed with WHERE at all", "rank is a reserved word", "PostgreSQL does not support ranking", "WHERE is evaluated before window functions are computed"],
        answer: 3,
        why: "Compute the window in a CTE or subquery, then filter in the outer query.",
      },
      {
        q: "Which index best serves: open loans ordered by due_at for the overdue report?",
        options: ["CREATE INDEX ON loans (due_at) WHERE returned_at IS NULL", "CREATE INDEX ON loans (member_id)", "CREATE INDEX ON loans (returned_at, member_id)", "CREATE INDEX ON members (email)"],
        answer: 0,
        why: "The partial index holds only open loans, already sorted by due_at.",
      },
      {
        q: "What does pg_dump of one database not include?",
        options: ["Table data", "Indexes", "Roles and other cluster-wide objects", "Views"],
        answer: 2,
        why: "Roles are global; save them with pg_dumpall --globals-only.",
      },
      {
        q: "Why call setseed before generating seed data with random()?",
        options: ["It makes random() faster", "It makes the generated data the same on every run", "It is required by generate_series", "It encrypts the data"],
        answer: 1,
        why: "Repeatable data keeps EXPLAIN results and README examples stable.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a migration runner in bash that applies every file in migrations/ in order, stopping at the first error.",
        hint: "Files sort by their numeric prefix; use psql's ON_ERROR_STOP and single-transaction flags.",
        solution: "#!/usr/bin/env bash\nset -euo pipefail\nfor f in migrations/*.sql; do\n  echo \"applying $f\"\n  psql -v ON_ERROR_STOP=1 -1 -d library -f \"$f\"\ndone\n# A real tool also records applied files so each runs only once.",
      },
      {
        level: "medium",
        task: "Seed 2,000 members, 5,000 books with one or two copies each, and 100,000 loans where popular books are borrowed far more often. Make it repeatable.",
        hint: "Use setseed, generate_series, and power(random(), 3) to skew copy choice.",
        solution: "SELECT setseed(0.42);\nINSERT INTO members (email, name) SELECT 'm'||g||'@example.com', 'Member '||g FROM generate_series(1,2000) g;\nINSERT INTO books (isbn, title) SELECT 'ISBN'||g, 'Book '||g FROM generate_series(1,5000) g;\nINSERT INTO copies (book_id, barcode)\n  SELECT b.id, 'C'||b.id||'-'||n FROM books b, generate_series(1, 1 + (b.id % 2)) n;\nINSERT INTO loans (member_id, copy_id, borrowed_at, due_at, returned_at)\n  SELECT 1 + floor(random()*2000), 1 + floor(power(random(),3)*7500),\n         t, t + interval '21 days', t + interval '14 days'\n  FROM (SELECT now() - random()*interval '700 days' AS t FROM generate_series(1,100000)) s;\nANALYZE;",
      },
      {
        level: "hard",
        task: "Write the query \"top 3 most borrowed books per year\" and justify one index for it with EXPLAIN (ANALYZE, BUFFERS) output before and after.",
        hint: "Group by year and book, rank with DENSE_RANK partitioned by year, filter outside.",
        solution: "WITH counts AS (\n  SELECT extract(year FROM l.borrowed_at) AS yr, c.book_id, count(*) AS n\n  FROM loans l JOIN copies c ON c.id = l.copy_id GROUP BY 1, 2),\nranked AS (SELECT *, DENSE_RANK() OVER (PARTITION BY yr ORDER BY n DESC) AS r FROM counts)\nSELECT yr, book_id, n FROM ranked WHERE r <= 3 ORDER BY yr, r;\n-- This reads all loans, so try CREATE INDEX ON loans (copy_id, borrowed_at);\n-- compare plans: keep it only if an index-only scan clearly beats the seq scan.",
      },
    ],
    faq: [
      { q: "Which migration tool should I use with PostgreSQL?", a: "Flyway and Liquibase are common in Java teams, dbmate and sqitch are simple standalone tools, and frameworks like Django and Rails have their own. Any tool that runs numbered files once and in order is fine for a capstone." },
      { q: "How much seed data is enough?", a: "Enough that the planner's choices change: tens of thousands to a few million rows in the main tables. Realistic skew matters as much as size." },
      { q: "Is pg_dump enough for production backups?", a: "For small databases it is a good start. Larger systems usually add physical backups with point-in-time recovery, using tools like pgBackRest or a managed service's built-in backups." },
      { q: "Should I commit the seed data as a big SQL file?", a: "Commit the script that generates it, not the output. A generator with setseed is small, reviewable and gives the same data every time." },
    ],
  },
};

export default extra;
