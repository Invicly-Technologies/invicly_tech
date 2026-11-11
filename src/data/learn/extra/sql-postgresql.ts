import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  // ───────────────────────── sql-basics ─────────────────────────
  "sql-basics/setup": {
    plain: [
      "A database is a program whose only job is to keep data safe and answer questions about it. PostgreSQL (often just \"Postgres\") is one of the most popular free databases. It runs in the background as a server, and other programs talk to it over a network connection.",
      "Think of Postgres as a library with a strict librarian. You never walk into the shelves yourself. You write a request on a slip (a SQL query), hand it over the counter, and the librarian brings back exactly what you asked for.",
      "psql is the counter where you hand over those slips. It is a small text program that connects to the server, sends what you type, and prints the answer as a neat table. Apps like pgAdmin and DBeaver do the same job with buttons and windows.",
      "To learn, you need three things: a running server, a client to connect with, and a database to play in. Docker gives you the server in one command, psql is the client, and CREATE DATABASE gives you a safe sandbox you can delete and recreate any time.",
    ],
    deepDive: [
      {
        heading: "What a connection actually needs",
        body: "Every client, whether psql or your app, needs the same five facts to connect: the host (which machine), the port (which door, 5432 by default), the user (a role name), the password, and the database name. These are often written together as one connection string, for example postgresql://postgres:secret@localhost:5432/shop.\n\nIf any one is wrong you get a clear error. \"Connection refused\" means nothing is listening on that host and port. \"Password authentication failed\" means the server is there but rejected your login. \"Database does not exist\" means you reached the server but asked for the wrong database.",
        bullets: ["host: where the server runs", "port: 5432 unless changed", "user + password: who you are", "dbname: which database to open"],
        visual: {
          type: "tree",
          title: "Reading a connection string",
          root: "postgresql://postgres:secret@localhost:5432/shop",
          children: [
            { label: "user", children: ["postgres"] },
            { label: "password", children: ["secret"] },
            { label: "host", children: ["localhost"] },
            { label: "port", children: ["5432"] },
            { label: "dbname", children: ["shop"] },
          ],
        },
      },
      {
        heading: "Docker vs a local install",
        body: "A local install puts Postgres on your machine as a system service. It starts with your computer and stores data in a system folder. A Docker container keeps Postgres in its own box. You can run version 16 and 17 side by side on different ports and throw them away when done.\n\nOne catch with Docker: if you delete the container, its data goes too, unless you mount a volume with -v pgdata:/var/lib/postgresql/data. A volume is a folder Docker keeps outside the container, so your tables survive restarts and upgrades.",
      },
      {
        heading: "Getting around psql quickly",
        body: "psql has two kinds of input. SQL statements go to the server and must end with a semicolon. Backslash commands are handled by psql itself and end at the line break.\n\nA few settings make life much easier. \\x auto switches to a vertical layout when rows are too wide. \\timing shows how long each query took. \\e opens your last query in an editor so you can fix long statements. The up arrow recalls history, and Tab completes table and column names.",
        bullets: ["\\x auto: readable wide rows", "\\timing: show query time", "\\e: edit the last query in an editor", "\\i file.sql: run a script file", "\\conninfo: show who and where you are"],
      },
      {
        heading: "How the prompt tells you what is happening",
        body: "The psql prompt changes to show its state. shop=# means you are in database shop as a superuser, and shop=> means a normal user. If the prompt becomes shop-# you have started a statement but not finished it, usually because the semicolon is missing. shop(# means a bracket is still open, and shop'# means a quote is still open.\n\nWhen stuck, type the missing character, or press Ctrl+C to throw away the half-written statement and start again.",
        visual: {
          type: "tree",
          title: "What the psql prompt is telling you",
          root: "psql prompt",
          children: [
            { label: "shop=#", children: ["Ready, superuser"] },
            { label: "shop=>", children: ["Ready, normal user"] },
            { label: "shop-#", children: ["Statement not finished", "Usually a missing ;"] },
            { label: "shop(#", children: ["A bracket is still open"] },
            { label: "shop'#", children: ["A quote is still open"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "What happens when you run one query in psql",
        actors: ["You", "psql", "Postgres server"],
        messages: [
          { from: 0, to: 1, label: "Type SELECT ... ;" },
          { from: 1, to: 2, label: "Send SQL over the connection" },
          { from: 2, to: 1, label: "Parsed, planned, run: rows + status (SELECT 3)" },
          { from: 1, to: 0, label: "Print a formatted table" },
        ],
      },
    ],
    examples: [
      {
        title: "Starting a disposable practice server with saved data",
        explanation: "Step 1: start Postgres in Docker with a named volume so data survives restarts. Step 2: connect with psql. Step 3: create a practice database and a tiny table. Step 4: check it with \\dt and \\d. If you break something, DROP DATABASE practice and start over in seconds.",
        code: {
          lang: "bash",
          code: "docker run --name pg -e POSTGRES_PASSWORD=secret \\\n  -p 5432:5432 -v pgdata:/var/lib/postgresql/data -d postgres:17\n\npsql postgresql://postgres:secret@localhost:5432/postgres\n\n-- inside psql\nCREATE DATABASE practice;\n\\c practice\nCREATE TABLE notes (id serial PRIMARY KEY, body text);\n\\dt\n\\d notes",
        },
      },
      {
        title: "Diagnosing a connection that will not work",
        explanation: "You run psql -h localhost -U postgres and see \"connection refused\". Step 1: docker ps shows whether the container is running. Step 2: if it is not listed, docker ps -a shows it exited; docker logs pg shows why, often \"port is already allocated\" because another Postgres uses 5432. Step 3: map a different host port with -p 5433:5432 and connect with -p 5433. The error message always points at which of the five connection facts is wrong.",
      },
    ],
    cheatSheet: [
      "psql -h HOST -p 5432 -U USER -d DB  (or one URL: postgresql://user:pass@host:5432/db)",
      "\\l databases, \\c db switch, \\dt tables, \\d name describe, \\dn schemas, \\du roles",
      "\\x auto for wide rows; \\timing to time queries; \\q to quit",
      "SQL ends with ; and goes to the server. Backslash commands are handled by psql",
      "Prompt db-# means the statement is unfinished: add ; or press Ctrl+C",
      "Docker data lives in the container unless you mount a volume with -v",
      "SELECT version(); shows the exact server version",
    ],
    quiz: [
      {
        q: "psql says \"connection refused\". What is the most likely cause?",
        options: ["Wrong password", "Nothing is listening on that host and port", "The table does not exist", "A missing semicolon"],
        answer: 1,
        why: "Refused means no server answered at that address, so the server is down or on another port.",
      },
      {
        q: "Your prompt shows shop-# after pressing Enter. What does that mean?",
        options: ["You are a superuser in a new database", "The query failed", "The statement is not finished yet", "psql lost the connection"],
        answer: 2,
        why: "The dash means psql is waiting for more input, usually the closing semicolon.",
      },
      {
        q: "Which command shows the columns and types of the table orders?",
        options: ["\\d orders", "\\dt orders;", "SHOW orders", "\\l orders"],
        answer: 0,
        why: "\\d followed by a name describes that table, view or index.",
      },
      {
        q: "Why add -v pgdata:/var/lib/postgresql/data when running Postgres in Docker?",
        options: ["It makes queries faster", "It opens port 5432", "It sets the password", "It keeps the data when the container is removed"],
        answer: 3,
        why: "A named volume stores the data folder outside the container's own life.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Connect to your server with psql, print the server version, list all databases and quit.",
        hint: "version() is a normal SQL function, so it needs SELECT and a semicolon.",
        solution: "psql -h localhost -U postgres\nSELECT version();\n\\l\n\\q",
      },
      {
        level: "medium",
        task: "Create a database called library, connect to it, create a table books with an id, title and year, insert two rows and show them.",
        hint: "Use \\c to switch database before creating the table.",
        solution: "CREATE DATABASE library;\n\\c library\nCREATE TABLE books (id serial PRIMARY KEY, title text NOT NULL, year int);\nINSERT INTO books (title, year) VALUES ('Dune', 1965), ('Emma', 1815);\nSELECT * FROM books;",
      },
      {
        level: "hard",
        task: "Run two Postgres versions (16 and 17) at once in Docker and prove from psql that you are talking to each one.",
        hint: "Each container needs its own name and its own host port.",
        solution: "docker run --name pg16 -e POSTGRES_PASSWORD=x -p 5416:5432 -d postgres:16\ndocker run --name pg17 -e POSTGRES_PASSWORD=x -p 5417:5432 -d postgres:17\npsql -h localhost -p 5416 -U postgres -c \"SHOW server_version;\"\npsql -h localhost -p 5417 -U postgres -c \"SHOW server_version;\"",
      },
    ],
    faq: [
      { q: "Do I need pgAdmin, or is psql enough?", a: "psql is enough to learn and is available on every server you will ever touch. Graphical tools like pgAdmin or DBeaver are nice for browsing data, so use whichever you like alongside psql." },
      { q: "What is the default password for the postgres user?", a: "There is none. You set it yourself, for example with POSTGRES_PASSWORD in Docker, or with \\password inside psql on a local install." },
      { q: "Is PostgreSQL the same as SQL?", a: "No. SQL is the language, and PostgreSQL is one database that speaks it. Most of what you learn carries over to MySQL or SQL Server, with small differences in extra features." },
    ],
  },

  "sql-basics/select": {
    plain: [
      "A table is like a spreadsheet: rows are records (one customer, one order) and columns are fields (name, price, date). SELECT is how you ask the database to show you some of those rows and columns.",
      "A query reads almost like English. \"Show me the name and price of products in the books category, cheapest first, only the first five.\" In SQL that becomes SELECT name, price FROM products WHERE category = 'books' ORDER BY price LIMIT 5.",
      "Each part has one job. SELECT picks columns. FROM picks the table. WHERE throws away rows that do not match. ORDER BY sorts what is left. LIMIT cuts the list short. You can leave out any part except SELECT.",
      "The database does not change anything when you run SELECT. It only reads. That makes SELECT the safest place to start experimenting: try a condition, look at the result, adjust, and run it again.",
    ],
    deepDive: [
      {
        heading: "How WHERE really decides",
        body: "WHERE checks each row against a condition that must come out true. Rows where it is false, or unknown because of a NULL, are dropped.\n\nYou build conditions from small pieces. Comparisons use =, <>, <, <=, > and >=. BETWEEN 10 AND 20 includes both ends. IN ('a', 'b') matches any value in a list. LIKE 'Sam%' matches text starting with Sam, where % means any characters and _ means exactly one. ILIKE does the same but ignores upper and lower case.\n\nAND binds tighter than OR, just like multiply before add in maths. When you mix them, add brackets so both you and the reader know what you meant.",
        bullets: ["BETWEEN includes both ends", "LIKE is case sensitive; ILIKE is not", "% = any run of characters, _ = one character", "Brackets make AND/OR mixes safe"],
        visual: {
          type: "tree",
          title: "Building blocks of WHERE",
          root: "WHERE condition",
          children: [
            { label: "Comparisons", children: ["=, <>", "<, <=, >, >="] },
            { label: "Ranges and lists", children: ["BETWEEN 10 AND 20 (both ends)", "IN ('a', 'b')"] },
            { label: "Patterns", children: ["LIKE 'Sam%' (case sensitive)", "ILIKE (ignores case)", "% any run, _ one character"] },
            { label: "Logic", children: ["AND binds tighter than OR", "Brackets make mixes safe"] },
          ],
        },
      },
      {
        heading: "Sorting rules that surprise people",
        body: "ORDER BY sorts ascending by default. Add DESC to reverse one column only: ORDER BY price DESC, name sorts by price high to low, then by name A to Z for ties.\n\nNULLs count as larger than every value in Postgres, so they come last in ascending order and first in descending order. You can override this with NULLS FIRST or NULLS LAST.\n\nIf two rows tie on every sort column, their order is not fixed and can change between runs. Add a unique column such as id as the final tie-breaker whenever order matters, especially for paging.",
      },
      {
        heading: "Paging: OFFSET vs keyset",
        body: "LIMIT 20 OFFSET 40 means skip 40 rows, then return 20. It is simple, but the database still has to find and throw away those 40 rows. On page 5,000 it reads 100,000 rows to show 20.\n\nKeyset paging remembers where the last page ended. If the last row had id 1840, the next page is WHERE id > 1840 ORDER BY id LIMIT 20. With an index on id, this is just as fast on page 5,000 as on page 1. It also does not skip or repeat rows when new ones are inserted while someone is paging.",
      },
      {
        heading: "Aliases and expressions",
        body: "Columns in SELECT can be calculations: price * quantity, upper(name), or a constant like 'EUR'. AS gives the result a readable name. Table aliases shorten long names: FROM products AS p lets you write p.price.\n\nThe alias is created in the SELECT step, which runs after WHERE, so WHERE cannot see it. ORDER BY runs last, so it can. If you need to filter on a calculated value, repeat the expression in WHERE or wrap the query in a subquery.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Two ways to get page 3 (rows 41 to 60)",
        columns: [
          { title: "LIMIT / OFFSET", points: ["ORDER BY id LIMIT 20 OFFSET 40", "Reads and throws away 40 rows", "Slower on every later page", "Can repeat rows if new data arrives"] },
          { title: "Keyset (seek)", points: ["WHERE id > 40 ORDER BY id LIMIT 20", "Jumps straight to id 41 via index", "Same speed on page 3 or 3,000", "Needs the last id from the previous page"] },
        ],
      },
    ],
    examples: [
      {
        title: "Building a product search step by step",
        explanation: "A shop page wants books or games under 30 euros whose name contains \"star\", any case, most expensive first. Step 1: start from the table and pick columns. Step 2: add the category filter with IN. Step 3: add the price filter and wrap the OR-style part in brackets. Step 4: add ILIKE for a case-insensitive name match. Step 5: sort with a tie-breaker and limit the result.",
        code: {
          lang: "sql",
          code: "SELECT id, name, category, price\nFROM products\nWHERE category IN ('books', 'games')\n  AND price < 30\n  AND name ILIKE '%star%'\nORDER BY price DESC, id\nLIMIT 10;",
        },
      },
      {
        title: "Finding this week's late orders",
        explanation: "Support wants orders shipped later than promised in the last 7 days. Step 1: compare two columns in WHERE: shipped_at > promised_at. Step 2: limit the time window with created_at >= now() - interval '7 days'. Step 3: show the delay as a calculated column with an alias. Step 4: sort the worst delays first. Notice that ORDER BY can use the alias delay, while WHERE could not.",
        code: {
          lang: "sql",
          code: "SELECT id, customer_id, shipped_at - promised_at AS delay\nFROM orders\nWHERE shipped_at > promised_at\n  AND created_at >= now() - interval '7 days'\nORDER BY delay DESC;",
        },
      },
    ],
    cheatSheet: [
      "SELECT cols FROM t WHERE cond ORDER BY col [DESC] LIMIT n OFFSET m;",
      "Written order: SELECT, FROM, WHERE, ORDER BY, LIMIT. Run order: FROM, WHERE, SELECT, ORDER BY, LIMIT",
      "LIKE 'a%' starts with a; '%a' ends with a; '_' is one character; ILIKE ignores case",
      "BETWEEN a AND b includes both a and b",
      "Add a unique tie-breaker (id) to ORDER BY when paging",
      "Keyset paging: WHERE id > :last_id ORDER BY id LIMIT 20",
      "NULLs sort last in ASC; change with NULLS FIRST / NULLS LAST",
    ],
    quiz: [
      {
        q: "Which query returns products whose name starts with \"Pro\" in any letter case?",
        options: ["WHERE name LIKE 'Pro%'", "WHERE name = 'Pro%'", "WHERE name ILIKE 'pro%'", "WHERE name ILIKE '%pro'"],
        answer: 2,
        why: "ILIKE ignores case and 'pro%' means text that starts with pro.",
      },
      {
        q: "What does WHERE a = 1 OR b = 2 AND c = 3 mean?",
        options: ["a = 1 OR (b = 2 AND c = 3)", "(a = 1 OR b = 2) AND c = 3", "All three must be true", "It is a syntax error"],
        answer: 0,
        why: "AND binds tighter than OR, so it is grouped first.",
      },
      {
        q: "Why is keyset paging faster than a big OFFSET?",
        options: ["It caches all pages", "It uses an index to start right after the last row instead of skipping rows", "It returns fewer columns", "It avoids ORDER BY"],
        answer: 1,
        why: "OFFSET must read and discard every skipped row, while a seek starts at the right spot.",
      },
      {
        q: "Does WHERE price BETWEEN 10 AND 20 include a product that costs exactly 20?",
        options: ["No, BETWEEN excludes both ends", "Only if price is an integer", "No, only the lower end is included", "Yes, both ends are included"],
        answer: 3,
        why: "BETWEEN a AND b is the same as >= a AND <= b.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From customers(id, name, country, created_at), list the names of customers from Germany or France, sorted by name.",
        hint: "IN is shorter than two OR checks.",
        solution: "SELECT name\nFROM customers\nWHERE country IN ('Germany', 'France')\nORDER BY name;",
      },
      {
        level: "medium",
        task: "Show the 5 newest customers whose email ends in @gmail.com, with a column called days_since_signup.",
        hint: "Subtracting two dates gives a number of days; cast created_at to date.",
        solution: "SELECT name, email,\n       current_date - created_at::date AS days_since_signup\nFROM customers\nWHERE email LIKE '%@gmail.com'\nORDER BY created_at DESC, id DESC\nLIMIT 5;",
      },
      {
        level: "hard",
        task: "Write the query for \"next page\" of products sorted by price then id, given the last row of the previous page had price 19.99 and id 734.",
        hint: "Compare the pair (price, id) to the pair from the last row using a row comparison.",
        solution: "SELECT id, name, price\nFROM products\nWHERE (price, id) > (19.99, 734)\nORDER BY price, id\nLIMIT 20;\n-- an index on (price, id) makes this a fast seek",
      },
    ],
    faq: [
      { q: "Is SELECT * bad?", a: "It is fine for exploring in psql. In application code, list the columns you need so the query reads less data and does not break when someone adds a column." },
      { q: "Are SQL keywords case sensitive?", a: "No, SELECT and select are the same. Text values in quotes are case sensitive, so 'Books' and 'books' are different." },
      { q: "Why does my query with double quotes around text fail?", a: "In Postgres, double quotes mean a column or table name and single quotes mean a text value. Write WHERE name = 'Ann', not \"Ann\"." },
    ],
  },

  "sql-basics/nulls-functions": {
    plain: [
      "NULL is a placeholder for \"we do not know\". A customer with no phone number on file has NULL in the phone column. It is not zero, not an empty string, and not the word null. It is the absence of a value.",
      "Because NULL means unknown, any maths or comparison with it is also unknown. If you do not know someone's age, you cannot say whether they are older than 30. So age > 30 is neither true nor false for them, and WHERE quietly drops that row.",
      "Functions are small tools you can use inside a query, like lower() to make text lower case or round() to tidy numbers. They work on each row and give back a new value. The original data in the table never changes.",
      "CASE is the SQL version of if/else. It lets you turn raw values into labels, like turning an order total into \"small\", \"medium\" or \"large\". Combined with functions, it means you can shape data exactly how a report needs it.",
    ],
    deepDive: [
      {
        heading: "Three-valued logic in practice",
        body: "SQL conditions have three possible results: true, false and unknown. WHERE keeps only true. This creates some traps.\n\nWHERE status <> 'cancelled' skips rows where status is NULL, because NULL <> 'cancelled' is unknown. If you want those rows too, write WHERE status IS DISTINCT FROM 'cancelled'. IS DISTINCT FROM treats NULL like a normal value, so two NULLs count as equal and NULL vs 'x' counts as different.\n\nAND and OR follow common sense where they can. false AND unknown is false, because one false is enough. true OR unknown is true. Only when the answer truly depends on the missing value does the result stay unknown.",
        bullets: ["WHERE keeps only true rows", "IS NULL / IS NOT NULL to test for missing", "IS DISTINCT FROM: NULL-safe not-equal", "false AND unknown = false; true OR unknown = true"],
        visual: {
          type: "compare",
          title: "AND and OR with unknown",
          columns: [
            { title: "AND", points: ["true AND unknown = unknown", "false AND unknown = false", "unknown AND unknown = unknown"] },
            { title: "OR", points: ["true OR unknown = true", "false OR unknown = unknown", "unknown OR unknown = unknown"] },
          ],
        },
      },
      {
        heading: "Aggregates and NULL",
        body: "Aggregate functions skip NULLs. COUNT(*) counts rows, but COUNT(phone) counts only rows where phone is not NULL. AVG(rating) divides by the number of non-NULL ratings, not the number of rows. SUM over only NULLs returns NULL, not 0.\n\nThat is usually what you want, but be deliberate. If a missing rating should count as zero, write AVG(COALESCE(rating, 0)). If you want 0 instead of NULL for an empty sum, wrap it: COALESCE(SUM(amount), 0).",
        visual: {
          type: "tree",
          title: "Aggregates over ratings 4, NULL, 2",
          root: "ratings: 4, NULL, 2",
          children: [
            { label: "COUNT(*)", children: ["3 (every row)"] },
            { label: "COUNT(rating)", children: ["2 (NULL skipped)"] },
            { label: "AVG(rating)", children: ["3 = (4 + 2) / 2"] },
            { label: "AVG(COALESCE(rating, 0))", children: ["2 = (4 + 0 + 2) / 3"] },
          ],
        },
      },
      {
        heading: "Text, number and date toolkit",
        body: "Text: lower(), upper(), trim(), length(), left(s, n), replace(s, 'a', 'b'), and || to join strings. concat() also joins but treats NULL as empty, while || returns NULL if any part is NULL.\n\nNumbers: round(x, 2), ceil(), floor(), abs(). Watch out for integer division: 7 / 2 is 3. Write 7 / 2.0 or cast with 7::numeric / 2 to get 3.5.\n\nDates: now() is the current timestamp, current_date is today. date_trunc('week', ts) rounds down to the start of the week. extract(year FROM ts) pulls out a part. age(ts) gives a readable interval, and to_char(ts, 'YYYY-MM-DD') formats it as text.",
      },
      {
        heading: "Writing CASE well",
        body: "CASE checks its WHEN branches from top to bottom and returns the first match. Put the most specific conditions first. If no branch matches and there is no ELSE, the result is NULL, so always add an ELSE unless NULL is what you want.\n\nCASE can go anywhere an expression can: in SELECT to make labels, in ORDER BY to sort in a custom order, and inside aggregates to count conditionally, as in SUM(CASE WHEN paid THEN amount ELSE 0 END). Postgres also offers COUNT(*) FILTER (WHERE paid), which is shorter for that last case.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What happens when a NULL meets...",
        root: "NULL value",
        children: [
          { label: "Comparison (=, <, <>)", children: ["Result is unknown", "Row dropped by WHERE"] },
          { label: "Arithmetic or ||", children: ["Result is NULL"] },
          { label: "Aggregate (SUM, AVG, COUNT(col))", children: ["NULL is skipped", "COUNT(*) still counts the row"] },
          { label: "COALESCE / IS NULL", children: ["Handled safely"] },
          { label: "ORDER BY", children: ["Sorted last in ASC by default"] },
        ],
      },
    ],
    examples: [
      {
        title: "A contact list that never shows blanks",
        explanation: "Marketing wants one contact line per customer. Step 1: prefer mobile, fall back to landline, then to a fixed message, using COALESCE with three arguments. Step 2: build a display name with initcap and trim so messy input looks tidy. Step 3: label customers by how long ago they signed up with CASE, newest rule first.",
        code: {
          lang: "sql",
          code: "SELECT\n  initcap(trim(first_name)) || ' ' || initcap(trim(last_name)) AS display_name,\n  COALESCE(mobile, landline, 'no number') AS contact,\n  CASE\n    WHEN created_at > now() - interval '30 days' THEN 'new'\n    WHEN created_at > now() - interval '1 year'  THEN 'regular'\n    ELSE 'long-time'\n  END AS segment\nFROM customers;",
        },
      },
      {
        title: "Why the average rating looked too high",
        explanation: "A product has 4 reviews: 5, 4, NULL, NULL (two people left no rating). AVG(rating) returns 4.5 because it ignores the NULLs and divides 9 by 2. COUNT(*) is 4 but COUNT(rating) is 2. If the business decides an empty rating means \"no opinion\", 4.5 is right. If it should count as zero, AVG(COALESCE(rating, 0)) gives 9 / 4 = 2.25. The query is not wrong either way; the rule just has to be chosen on purpose.",
        code: {
          lang: "sql",
          code: "SELECT COUNT(*)                  AS reviews,\n       COUNT(rating)             AS rated,\n       AVG(rating)               AS avg_of_rated,\n       AVG(COALESCE(rating, 0))  AS avg_null_as_zero\nFROM reviews\nWHERE product_id = 42;",
        },
      },
    ],
    cheatSheet: [
      "Test for missing values with IS NULL / IS NOT NULL, never = NULL",
      "COALESCE(a, b, 'default') returns the first non-NULL value",
      "NULLIF(x, 0) turns 0 into NULL: handy to avoid division by zero",
      "a IS DISTINCT FROM b: not-equal that treats NULLs as comparable values",
      "7 / 2 = 3 (integer division); 7 / 2.0 = 3.5",
      "date_trunc('month', ts), extract(dow FROM ts), now() - interval '7 days'",
      "COUNT(*) FILTER (WHERE cond) counts only matching rows",
    ],
    quiz: [
      {
        q: "A table has 10 rows; 3 have NULL in bonus. What does COUNT(bonus) return?",
        options: ["10", "7", "3", "NULL"],
        answer: 1,
        why: "COUNT(column) counts only non-NULL values.",
      },
      {
        q: "Which condition keeps rows where status is NULL as well as rows with other statuses, but not 'cancelled'?",
        options: ["status <> 'cancelled'", "status != 'cancelled'", "NOT status = 'cancelled'", "status IS DISTINCT FROM 'cancelled'"],
        answer: 3,
        why: "IS DISTINCT FROM returns true for NULL vs 'cancelled', while <> returns unknown.",
      },
      {
        q: "What is the result of SELECT 'Hi ' || NULL;?",
        options: ["NULL", "'Hi '", "'Hi NULL'", "An error"],
        answer: 0,
        why: "The || operator returns NULL when any part is NULL; concat() would return 'Hi '.",
      },
      {
        q: "A CASE expression has no ELSE and no branch matches. What is returned?",
        options: ["0", "An empty string", "NULL", "An error"],
        answer: 2,
        why: "Without ELSE, CASE falls back to NULL.",
      },
      {
        q: "How do you safely compute revenue / visits when visits can be 0?",
        options: ["revenue / visits", "revenue / COALESCE(visits, 0)", "revenue / NULLIF(visits, 0)", "revenue / (visits + 0)"],
        answer: 2,
        why: "NULLIF turns 0 into NULL, so the division returns NULL instead of an error.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From employees(name, bonus), show each name and the bonus, showing 0 where bonus is missing.",
        hint: "One function picks the first non-NULL value.",
        solution: "SELECT name, COALESCE(bonus, 0) AS bonus\nFROM employees;",
      },
      {
        level: "medium",
        task: "From orders(id, total, created_at), show for each month of this year the number of orders and how many were over 100.",
        hint: "date_trunc groups by month; FILTER counts conditionally.",
        solution: "SELECT date_trunc('month', created_at) AS month,\n       COUNT(*) AS orders,\n       COUNT(*) FILTER (WHERE total > 100) AS big_orders\nFROM orders\nWHERE created_at >= date_trunc('year', now())\nGROUP BY 1\nORDER BY 1;",
      },
      {
        level: "hard",
        task: "Sort tickets(id, priority) so 'urgent' comes first, then 'high', then 'normal', and tickets with no priority come last.",
        hint: "Use CASE inside ORDER BY to turn each label into a number.",
        solution: "SELECT id, priority\nFROM tickets\nORDER BY CASE priority\n           WHEN 'urgent' THEN 1\n           WHEN 'high'   THEN 2\n           WHEN 'normal' THEN 3\n           ELSE 4\n         END,\n         id;",
      },
    ],
    faq: [
      { q: "Should I use NULL or an empty string for missing text?", a: "Pick one meaning and stick to it. Most teams use NULL for \"unknown\" and reserve empty strings for \"known to be empty\", and add a CHECK constraint if they want to forbid one of them." },
      { q: "Why does NOT IN return no rows sometimes?", a: "If the list or subquery contains a NULL, every NOT IN check becomes unknown, so nothing passes. Use NOT EXISTS, or filter NULLs out of the subquery." },
      { q: "What is the difference between now() and current_date?", a: "now() is the current date and time with time zone. current_date is just today's date, with no time part." },
    ],
  },

  "sql-basics/dml": {
    plain: [
      "So far you have only read data. DML (data manipulation language) is the set of commands that change it: INSERT adds new rows, UPDATE changes existing ones, and DELETE removes them. These are the commands behind every sign-up, edit and cancel button in an app.",
      "All three are powerful, and two of them are dangerous. UPDATE and DELETE affect every row that matches the WHERE clause. Forget the WHERE and they affect every row in the table. There is no undo button unless you prepared one.",
      "The prepared undo button is a transaction. Type BEGIN first, make your change, look at the result, and then choose COMMIT to keep it or ROLLBACK to throw it away. It is like writing in pencil before going over it in pen.",
      "RETURNING is a Postgres bonus. It makes INSERT, UPDATE and DELETE give back the rows they touched, as if you had run a SELECT straight after. Apps use it to get the new id of a row they just created.",
    ],
    deepDive: [
      {
        heading: "INSERT in its different shapes",
        body: "The basic shape lists the columns, then the values: INSERT INTO products (name, price) VALUES ('Pen', 1.5). Any column you leave out gets its DEFAULT, or NULL if it has none. Listing columns protects you when someone later adds or reorders columns.\n\nYou can insert many rows at once with several value lists separated by commas. That is far faster than one statement per row because it is one round trip and one commit.\n\nYou can also insert the result of a query: INSERT INTO archive_orders SELECT * FROM orders WHERE created_at < '2024-01-01'. The rows never leave the server, which makes this the quickest way to copy data between tables.",
        bullets: ["Always list column names", "Multi-row VALUES: one trip, one commit", "INSERT ... SELECT copies data inside the server", "DEFAULT fills any column you skip"],
      },
      {
        heading: "UPDATE using values from another table",
        body: "Sometimes the new value lives in another table. Postgres lets you join during an update with UPDATE ... FROM. For example, to copy each customer's country onto their orders: UPDATE orders o SET country = c.country FROM customers c WHERE c.id = o.customer_id.\n\nThe WHERE clause does two jobs here: it joins the tables and it limits which rows change. If the join matches more than one row in the FROM table for the same target row, Postgres picks one of them unpredictably, so make sure the join is one-to-one.",
      },
      {
        heading: "Autocommit and why BEGIN matters",
        body: "psql and most drivers start in autocommit mode: every statement is its own transaction and is committed the moment it succeeds. A mistaken DELETE is permanent before you can blink.\n\nAfter BEGIN, nothing you change is visible to other sessions or permanent until COMMIT. If any statement fails, the whole transaction is marked as failed and Postgres refuses further statements until you ROLLBACK. That feels strict, but it stops half-finished changes from sneaking in.\n\nKeep these manual transactions short. While open, they hold locks on the rows they changed, which can block other users.",
        visual: {
          type: "compare",
          title: "Autocommit vs an explicit transaction",
          columns: [
            { title: "Autocommit (default)", points: ["Each statement is its own transaction", "Committed the moment it succeeds", "A mistaken DELETE is permanent"] },
            { title: "BEGIN ... COMMIT", points: ["Changes hidden from others until COMMIT", "ROLLBACK undoes everything", "After an error, only ROLLBACK works", "Holds row locks while open"] },
          ],
        },
      },
      {
        heading: "DELETE vs TRUNCATE",
        body: "DELETE FROM logs WHERE created_at < now() - interval '90 days' removes matching rows one by one. It can use a WHERE clause, fires triggers and supports RETURNING.\n\nTRUNCATE logs empties the whole table instantly by throwing away its data files. It cannot filter, and it needs a stronger lock, but on a large table it takes milliseconds instead of minutes. Both can be rolled back inside a transaction in Postgres.\n\nDeleting millions of rows in one DELETE creates a long transaction and lots of dead rows for VACUUM to clean. For big clean-ups, delete in batches of a few thousand rows.",
        visual: {
          type: "compare",
          title: "DELETE vs TRUNCATE",
          columns: [
            { title: "DELETE", points: ["Can filter with WHERE", "Removes rows one by one", "Fires row triggers, supports RETURNING", "Leaves dead rows for VACUUM"] },
            { title: "TRUNCATE", points: ["Empties the whole table", "Throws away data files: milliseconds", "Needs a stronger lock", "Can still be rolled back in Postgres"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Two sessions during an uncommitted UPDATE",
        actors: ["Session A", "Postgres", "Session B"],
        messages: [
          { from: 0, to: 1, label: "BEGIN; UPDATE price = 12 WHERE id = 7" },
          { from: 2, to: 1, label: "SELECT price WHERE id = 7" },
          { from: 1, to: 2, label: "Still 10 (A not committed)" },
          { from: 0, to: 1, label: "COMMIT" },
          { from: 2, to: 1, label: "SELECT again" },
          { from: 1, to: 2, label: "Now 12" },
        ],
      },
    ],
    examples: [
      {
        title: "Creating an order and getting its id back",
        explanation: "An app creates an order and must then add order lines that point to it. Step 1: INSERT the order with RETURNING id, so the database tells you the new id. Step 2: insert the lines using that id (shown here as 501). Step 3: wrap both in BEGIN and COMMIT so you never end up with an order that has no lines.",
        code: {
          lang: "sql",
          code: "BEGIN;\nINSERT INTO orders (customer_id, status)\nVALUES (17, 'new')\nRETURNING id;          -- returns 501\n\nINSERT INTO order_lines (order_id, product_id, qty)\nVALUES (501, 3, 2), (501, 9, 1);\nCOMMIT;",
        },
      },
      {
        title: "Fixing bad data without fear",
        explanation: "Some emails were saved with capital letters and spaces. Step 1: preview the rows with SELECT and the same WHERE. Step 2: BEGIN. Step 3: UPDATE with RETURNING to see old and new. Step 4: check the reported row count matches the preview (say UPDATE 37). Step 5: COMMIT. If the count had been 37,000, you would ROLLBACK and look for the bug in the WHERE.",
        code: {
          lang: "sql",
          code: "SELECT id, email FROM users WHERE email <> lower(trim(email));\n\nBEGIN;\nUPDATE users\nSET email = lower(trim(email))\nWHERE email <> lower(trim(email))\nRETURNING id, email;\n-- UPDATE 37, as expected\nCOMMIT;",
        },
      },
    ],
    cheatSheet: [
      "INSERT INTO t (a, b) VALUES (1, 'x'), (2, 'y') RETURNING id;",
      "UPDATE t SET a = a + 1 WHERE id = 5 RETURNING *;",
      "UPDATE t SET col = s.col FROM s WHERE s.id = t.s_id;  (update from another table)",
      "DELETE FROM t WHERE cond RETURNING *;",
      "Run SELECT with the same WHERE before any UPDATE or DELETE",
      "BEGIN ... COMMIT or ROLLBACK; psql otherwise autocommits each statement",
      "TRUNCATE t empties a whole table fast; DELETE can filter",
      "Delete millions of rows in batches, not one giant statement",
    ],
    quiz: [
      {
        q: "What does UPDATE products SET price = 0; do?",
        options: ["Nothing, it needs WHERE", "Updates the first row only", "Sets every product's price to 0", "Asks for confirmation"],
        answer: 2,
        why: "Without WHERE, UPDATE changes every row in the table.",
      },
      {
        q: "Why use INSERT ... RETURNING id?",
        options: ["To get the id the database generated without a second query", "To make the insert faster", "To prevent duplicates", "To lock the table"],
        answer: 0,
        why: "RETURNING sends back values from the new row, including generated ids.",
      },
      {
        q: "Inside BEGIN, one statement fails. What happens to later statements?",
        options: ["They run normally", "They are retried", "They auto-commit", "They are rejected until you ROLLBACK"],
        answer: 3,
        why: "A failed transaction is aborted and only ROLLBACK is accepted.",
      },
      {
        q: "Which is the best way to empty a 50-million-row staging table completely?",
        options: ["DELETE FROM staging;", "TRUNCATE staging;", "UPDATE staging SET id = NULL;", "DROP DATABASE"],
        answer: 1,
        why: "TRUNCATE removes all rows at once without touching each row.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Insert three products (name, price) in one statement and return their ids and names.",
        hint: "Separate the value lists with commas and end with RETURNING.",
        solution: "INSERT INTO products (name, price)\nVALUES ('Mug', 6.5), ('Cap', 12), ('Bag', 20)\nRETURNING id, name;",
      },
      {
        level: "medium",
        task: "Inside a transaction, raise the price of every product in category 'toys' by 5%, rounded to 2 decimals, show the changed rows, then undo it.",
        hint: "round(price * 1.05, 2) and RETURNING, then ROLLBACK.",
        solution: "BEGIN;\nUPDATE products\nSET price = round(price * 1.05, 2)\nWHERE category = 'toys'\nRETURNING id, name, price;\nROLLBACK;",
      },
      {
        level: "hard",
        task: "Move all orders older than 2023 from orders into orders_archive in a single statement, so a row can never be lost or copied twice.",
        hint: "A DELETE ... RETURNING can feed an INSERT through a WITH clause.",
        solution: "WITH moved AS (\n  DELETE FROM orders\n  WHERE created_at < '2023-01-01'\n  RETURNING *\n)\nINSERT INTO orders_archive\nSELECT * FROM moved;",
      },
    ],
    faq: [
      { q: "Can I undo a DELETE after it is committed?", a: "Not with SQL. You would have to restore from a backup, which is why risky changes belong inside BEGIN and ROLLBACK until you have checked them." },
      { q: "What does \"UPDATE 0\" mean?", a: "The statement ran fine but no rows matched the WHERE clause. Check your condition with a SELECT." },
      { q: "Is RETURNING standard SQL?", a: "It is a PostgreSQL extension, also supported by SQLite and MariaDB in some forms. Other databases offer similar features like OUTPUT in SQL Server." },
    ],
  },
  // ───────────────────────── sql-joins ─────────────────────────
  "sql-joins/joins": {
    plain: [
      "Good databases split information into separate tables so each fact is stored once. Customers live in one table, orders in another. Each order holds a customer_id that points back to its customer. A join is how you put the pieces back together in one result.",
      "Imagine two lists on your desk: guests and seat bookings. To print a seating chart you match each booking's guest number to a guest's name. That matching rule is the ON part of a join: ON bookings.guest_id = guests.id.",
      "The type of join answers one question: what should happen to rows that find no partner? INNER JOIN drops them. LEFT JOIN keeps everything from the first table and fills the gaps with NULL. FULL JOIN keeps unmatched rows from both sides.",
      "Joins are not limited to two tables. You can chain them: customers to orders, orders to order items, items to products. Each JOIN adds one more table, matched by its own ON condition.",
    ],
    deepDive: [
      {
        heading: "How Postgres actually performs a join",
        body: "The join you write says what you want, not how to get it. The planner picks one of three methods.\n\nA nested loop takes each row on one side and looks up matches on the other, ideally through an index. It is great when one side is small. A hash join reads the smaller table into an in-memory hash table, then scans the bigger table once and probes the hash for each row. It is great for large, unsorted inputs with an equality condition. A merge join sorts both sides by the join key and walks them together like a zip. It suits inputs that are already sorted, for example by an index.\n\nYou can see which one was chosen with EXPLAIN. You rarely need to force it; good indexes and fresh statistics let Postgres choose well.",
        bullets: ["Nested loop: small outer side + index on inner", "Hash join: big tables, equality join", "Merge join: both sides sorted on the key"],
        visual: {
          type: "compare",
          title: "Three join methods the planner can pick",
          columns: [
            { title: "Nested loop", points: ["For each outer row, find matches", "Best when one side is small", "Index on the inner side helps"] },
            { title: "Hash join", points: ["Build a hash table of the smaller side", "Scan the bigger side once and probe", "Needs an equality condition"] },
            { title: "Merge join", points: ["Both sides sorted on the key", "Walk both lists in step", "Good when an index gives sorted order"] },
          ],
        },
      },
      {
        heading: "Row counts: why joins multiply",
        body: "A join returns one output row for every pair of rows that match. If a customer has 3 orders, that customer appears 3 times. If each order has 4 items and you also join items, the customer appears 12 times.\n\nThis is correct behaviour, but it surprises people when they then add SUM(orders.total): every order total is now counted 4 times, once per item. This is called fan-out. Before summing, ask what one row of the joined result stands for. If it is \"one order item\", only sum item-level columns. If you need order-level totals, sum them in a separate subquery first and then join the results.",
      },
      {
        heading: "ON vs WHERE with outer joins",
        body: "With an INNER JOIN, a condition behaves the same in ON or in WHERE. With a LEFT JOIN it does not.\n\nConditions in ON decide which right-side rows count as a match. Left rows are kept no matter what. Conditions in WHERE run after the join and remove whole result rows. So LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid' keeps every customer and only attaches paid orders. Moving o.status = 'paid' into WHERE throws away customers with no paid order, because their o.status is NULL. The query has silently become an inner join.",
        visual: {
          type: "compare",
          title: "Same filter, two places, LEFT JOIN",
          columns: [
            { title: "In ON: AND o.status = 'paid'", points: ["Every customer is kept", "Only paid orders are attached", "No paid order: order columns are NULL"] },
            { title: "In WHERE: o.status = 'paid'", points: ["Runs after the join", "Rows with NULL status are removed", "Customers with no paid order vanish"] },
          ],
        },
      },
      {
        heading: "Join shortcuts: USING and LATERAL",
        body: "When both tables name the key the same way, JOIN orders USING (customer_id) is shorter than writing the ON condition, and the result has a single customer_id column.\n\nLATERAL is a more advanced tool. It lets a subquery on the right refer to columns of the current left row, like a loop. For example, for each customer you can fetch their three latest orders with a LATERAL subquery that uses ORDER BY and LIMIT 3. A plain join cannot do per-row limits like that.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which join do I need?",
        root: "What should happen to rows with no match?",
        children: [
          { label: "Drop them", children: ["INNER JOIN"] },
          { label: "Keep all rows of the first table", children: ["LEFT JOIN", "Unmatched columns become NULL"] },
          { label: "Keep unmatched rows from both", children: ["FULL OUTER JOIN"] },
          { label: "I want only the unmatched ones", children: ["LEFT JOIN ... WHERE right.id IS NULL", "or NOT EXISTS"] },
          { label: "There is no match condition", children: ["CROSS JOIN: every pair"] },
        ],
      },
      {
        type: "flow",
        title: "Fan-out: one customer becomes many rows",
        steps: [
          { label: "customers", detail: "Ann: 1 row" },
          { label: "JOIN orders", detail: "Ann has 3 orders: 3 rows" },
          { label: "JOIN order_items", detail: "4 items per order: 12 rows" },
          { label: "SUM(orders.total)", detail: "Each order total counted 4 times" },
        ],
      },
    ],
    examples: [
      {
        title: "A three-table order report",
        explanation: "The team wants every order line from today with the customer name and product name. Step 1: start from order_items, the finest grain. Step 2: join orders to get the date and customer_id. Step 3: join customers for the name. Step 4: join products for the product name. Each JOIN uses the foreign key that links the two tables. One output row equals one order line.",
        code: {
          lang: "sql",
          code: "SELECT o.id AS order_id, c.name AS customer,\n       p.name AS product, oi.qty, oi.unit_price\nFROM order_items oi\nJOIN orders    o ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nJOIN products  p ON p.id = oi.product_id\nWHERE o.ordered_at >= current_date\nORDER BY o.id;",
        },
      },
      {
        title: "Every product with its sales this month, including zero",
        explanation: "A plain join would hide products that sold nothing. Step 1: start from products, because every product must appear. Step 2: LEFT JOIN order_items. Step 3: collect this month's order lines in a subquery and LEFT JOIN that, so the date filter can never remove a product. Step 4: COALESCE the sum to show 0 instead of NULL.",
        code: {
          lang: "sql",
          code: "SELECT p.name, COALESCE(SUM(s.qty), 0) AS units_sold\nFROM products p\nLEFT JOIN (\n  SELECT oi.product_id, oi.qty\n  FROM order_items oi\n  JOIN orders o ON o.id = oi.order_id\n  WHERE o.ordered_at >= date_trunc('month', now())\n) s ON s.product_id = p.id\nGROUP BY p.id, p.name\nORDER BY units_sold DESC;",
        },
      },
    ],
    cheatSheet: [
      "FROM a JOIN b ON b.a_id = a.id  (JOIN alone means INNER JOIN)",
      "LEFT JOIN keeps every row of the left table; missing right columns are NULL",
      "Right-table filters for LEFT JOIN go in ON, not WHERE",
      "Anti-join: LEFT JOIN b ... WHERE b.id IS NULL, or WHERE NOT EXISTS (...)",
      "JOIN ... USING (col) when both tables use the same column name",
      "Rows out = matching pairs; one-to-many joins repeat the one side",
      "Count rows before and after each join to catch fan-out early",
    ],
    quiz: [
      {
        q: "customers has 100 rows. 80 customers have at least one order. How many customers appear in customers LEFT JOIN orders?",
        options: ["80", "20", "100", "It depends on the number of orders"],
        answer: 2,
        why: "LEFT JOIN keeps every left row, so all 100 customers appear, some of them several times.",
      },
      {
        q: "You LEFT JOIN orders and add WHERE orders.status = 'paid'. What happens to customers with no orders?",
        options: ["They disappear", "They appear with NULLs", "They appear twice", "The query errors"],
        answer: 0,
        why: "Their status is NULL, so the WHERE condition is not true and the rows are removed.",
      },
      {
        q: "Which join method is usually chosen for two large tables joined on equality with no useful index?",
        options: ["Nested loop", "Cross join", "Merge join with no sort", "Hash join"],
        answer: 3,
        why: "A hash join builds a hash table on one side and scans the other only once.",
      },
      {
        q: "An order has 4 items. You join orders to items and SUM(orders.total). What goes wrong?",
        options: ["Nothing", "Each order total is counted 4 times", "Orders without items are counted twice", "SUM ignores the items"],
        answer: 1,
        why: "The join creates 4 rows per order, so order-level values repeat 4 times.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every order id with the customer's name, using orders(id, customer_id) and customers(id, name).",
        hint: "Join on the foreign key in orders.",
        solution: "SELECT o.id, c.name\nFROM orders o\nJOIN customers c ON c.id = o.customer_id;",
      },
      {
        level: "medium",
        task: "Find products that have never been ordered, using products(id, name) and order_items(product_id).",
        hint: "Write it as an anti-join with NOT EXISTS.",
        solution: "SELECT p.id, p.name\nFROM products p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items oi WHERE oi.product_id = p.id\n);",
      },
      {
        level: "hard",
        task: "For each customer, show their 2 most recent orders (customers with no orders should still appear once).",
        hint: "LEFT JOIN LATERAL lets the subquery use c.id and its own LIMIT.",
        solution: "SELECT c.name, r.id AS order_id, r.ordered_at\nFROM customers c\nLEFT JOIN LATERAL (\n  SELECT o.id, o.ordered_at\n  FROM orders o\n  WHERE o.customer_id = c.id\n  ORDER BY o.ordered_at DESC\n  LIMIT 2\n) r ON true\nORDER BY c.name, r.ordered_at DESC;",
      },
    ],
    faq: [
      { q: "Is RIGHT JOIN ever needed?", a: "Never strictly. A RIGHT JOIN B is the same as B LEFT JOIN A, and most teams write everything as LEFT JOIN so queries read the same way." },
      { q: "Is JOIN the same as INNER JOIN?", a: "Yes. The word INNER is optional, so JOIN on its own means an inner join." },
      { q: "Should I use a join or a subquery?", a: "Use a join when you need columns from both tables. Use EXISTS or NOT EXISTS when you only need to check whether a match exists; it also avoids duplicate rows." },
    ],
  },

  "sql-joins/group-by": {
    plain: [
      "Most business questions are about totals, not single rows. How many orders came in today? What is the revenue per country? Which product sells best? Aggregate functions answer these by squeezing many rows into one number.",
      "GROUP BY decides how the rows are split before squeezing. Picture sorting a pile of receipts into one stack per shop. Then you add up each stack. GROUP BY shop makes the stacks, and SUM(amount) adds up each one.",
      "After grouping, each result row stands for a whole stack, not one receipt. That is why you can only show columns that are the same for the whole stack (the grouping columns) or a summary of it (an aggregate).",
      "HAVING is a filter for stacks. WHERE throws away single receipts before stacking. HAVING throws away whole stacks after they are added up, like \"only shops where we spent more than 100\".",
    ],
    deepDive: [
      {
        heading: "How Postgres builds the groups",
        body: "Postgres has two main ways to group. HashAggregate reads every row once and keeps a small in-memory table with one entry per group, updating the running count or sum as it goes. It is fast when the number of groups fits in memory. GroupAggregate first sorts the rows by the grouping columns, then walks through them and closes a group each time the key changes. It is used when the data is already sorted, for example from an index, or when there are too many groups for memory.\n\nEither way, the output order is not guaranteed. Always add ORDER BY if you care about the order of groups.",
        visual: {
          type: "compare",
          title: "Two ways Postgres groups rows",
          columns: [
            { title: "HashAggregate", points: ["Reads every row once", "In-memory table, one entry per group", "Fast when groups fit in memory"] },
            { title: "GroupAggregate", points: ["Sorts by the grouping columns first", "Closes a group when the key changes", "Used for sorted input or many groups"] },
          ],
        },
      },
      {
        heading: "Choosing the right aggregate",
        body: "COUNT(*) counts rows. COUNT(col) skips NULLs. COUNT(DISTINCT col) counts unique values. SUM, AVG, MIN and MAX work on numbers, and MIN and MAX also work on text and dates.\n\nPostgres adds some very useful ones. string_agg(name, ', ' ORDER BY name) joins values into one text. array_agg(id) collects them into an array. bool_or(paid) is true if any row is true. percentile_cont(0.5) WITHIN GROUP (ORDER BY price) gives the median, which is often more honest than the average when a few huge values exist.",
        bullets: ["COUNT(DISTINCT customer_id): unique buyers", "string_agg: comma-separated list per group", "percentile_cont(0.5): the median", "FILTER (WHERE ...): aggregate only some rows"],
      },
      {
        heading: "The functional dependency shortcut",
        body: "Normally every non-aggregated column must appear in GROUP BY. Postgres relaxes this in one safe case: if you group by a table's primary key, you may select any other column of that same table. Grouping by customers.id means name and email are already fixed for each group, so Postgres lets you select them.\n\nThis keeps queries shorter: GROUP BY c.id instead of GROUP BY c.id, c.name, c.email, c.country. It only works for the primary key, not for a column that merely happens to be unique.",
      },
      {
        heading: "Subtotals with ROLLUP and GROUPING SETS",
        body: "Reports often want totals at several levels: per country and city, per country, and a grand total. Instead of three queries glued with UNION ALL, write GROUP BY ROLLUP (country, city). Postgres returns the city rows, a subtotal row per country with city as NULL, and a grand total row with both NULL.\n\nGROUPING SETS lets you list exactly which combinations you want, and CUBE gives every combination. The GROUPING(city) function returns 1 on subtotal rows, so you can label them \"All cities\" instead of showing NULL.",
        visual: {
          type: "tree",
          title: "Rows from GROUP BY ROLLUP (country, city)",
          root: "ROLLUP (country, city)",
          children: [
            { label: "(country, city)", children: ["One row per city"] },
            { label: "(country)", children: ["Subtotal per country", "city is NULL"] },
            { label: "()", children: ["Grand total", "Both columns NULL"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "WHERE vs HAVING on the same table",
        columns: [
          { title: "WHERE status = 'paid'", points: ["Runs before grouping", "Looks at one row at a time", "Cannot use SUM, COUNT, AVG", "Makes grouping cheaper"] },
          { title: "HAVING SUM(total) > 500", points: ["Runs after grouping", "Looks at one whole group", "Usually uses an aggregate", "Removes groups, not rows"] },
        ],
      },
    ],
    examples: [
      {
        title: "Revenue per country, with only real markets",
        explanation: "Finance wants paid revenue per country, but only countries with at least 20 orders. Step 1: WHERE keeps paid orders only, before grouping. Step 2: join customers to get the country. Step 3: GROUP BY country. Step 4: compute count, sum and average. Step 5: HAVING drops small countries using the count. Step 6: sort by revenue.",
        code: {
          lang: "sql",
          code: "SELECT c.country,\n       COUNT(*)              AS orders,\n       SUM(o.total)          AS revenue,\n       round(AVG(o.total), 2) AS avg_order\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.country\nHAVING COUNT(*) >= 20\nORDER BY revenue DESC;",
        },
      },
      {
        title: "Tracing a grouping by hand",
        explanation: "Take 5 orders: (Ann, 10), (Ann, 30), (Bob, 5), (Cy, 50), (Cy, NULL). GROUP BY customer makes three stacks. Ann: COUNT(*) 2, SUM 40, AVG 20. Bob: COUNT(*) 1, SUM 5. Cy: COUNT(*) 2 but COUNT(total) 1, SUM 50 and AVG 50, because the NULL is ignored. HAVING SUM(total) > 20 keeps Ann and Cy. Doing this once on paper makes the rules stick.",
      },
    ],
    cheatSheet: [
      "Every SELECT column is either in GROUP BY or inside an aggregate",
      "WHERE filters rows before grouping; HAVING filters groups after",
      "GROUP BY table.id lets you select any other column of that table",
      "COUNT(*) FILTER (WHERE status = 'refunded') counts only some rows",
      "string_agg(name, ', ' ORDER BY name) makes a list per group",
      "GROUP BY ROLLUP (a, b) adds subtotals and a grand total",
      "Groups come back unordered unless you add ORDER BY",
    ],
    quiz: [
      {
        q: "Why does SELECT country, city, COUNT(*) FROM customers GROUP BY country; fail?",
        options: ["COUNT needs a column", "city is neither grouped nor aggregated", "GROUP BY must come before FROM", "country must be aggregated"],
        answer: 1,
        why: "Each country group can contain many cities, so Postgres cannot pick one.",
      },
      {
        q: "Where should a condition like status = 'paid' go when you sum revenue per customer?",
        options: ["WHERE", "HAVING", "ORDER BY", "Inside COUNT"],
        answer: 0,
        why: "It filters single rows, so WHERE is right and also makes grouping cheaper.",
      },
      {
        q: "What does GROUP BY ROLLUP (country, city) add compared to GROUP BY country, city?",
        options: ["Nothing", "Sorted output", "Distinct cities only", "Per-country subtotals and a grand total"],
        answer: 3,
        why: "ROLLUP adds rows for each prefix of the grouping columns plus a total.",
      },
      {
        q: "Which expression gives the median order total?",
        options: ["AVG(total)", "MAX(total) / 2", "percentile_cont(0.5) WITHIN GROUP (ORDER BY total)", "COUNT(total) / 2"],
        answer: 2,
        why: "percentile_cont(0.5) returns the middle value of the sorted totals.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From products(category, price), show each category with its number of products and its cheapest price.",
        hint: "GROUP BY category with COUNT and MIN.",
        solution: "SELECT category, COUNT(*) AS products, MIN(price) AS cheapest\nFROM products\nGROUP BY category\nORDER BY category;",
      },
      {
        level: "medium",
        task: "From orders(customer_id, total, status), find customers who placed at least 3 orders but have never had one refunded.",
        hint: "Group per customer; use HAVING with COUNT and a FILTER (or bool_or).",
        solution: "SELECT customer_id, COUNT(*) AS orders\nFROM orders\nGROUP BY customer_id\nHAVING COUNT(*) >= 3\n   AND COUNT(*) FILTER (WHERE status = 'refunded') = 0;",
      },
      {
        level: "hard",
        task: "Show revenue per year and month for paid orders, with a subtotal per year and a grand total, labelling subtotal rows clearly.",
        hint: "ROLLUP on year and month; GROUPING() returns 1 on subtotal rows.",
        solution: "SELECT extract(year FROM ordered_at) AS yr,\n       date_trunc('month', ordered_at)::date AS month,\n       GROUPING(date_trunc('month', ordered_at)) = 1 AS is_subtotal,\n       SUM(total) AS revenue\nFROM orders\nWHERE status = 'paid'\nGROUP BY ROLLUP (extract(year FROM ordered_at), date_trunc('month', ordered_at))\nORDER BY yr NULLS LAST, month NULLS LAST;\n-- yr NULL + month NULL = grand total row",
      },
    ],
    faq: [
      { q: "Can I use a SELECT alias in GROUP BY?", a: "Yes, Postgres allows GROUP BY alias and also GROUP BY 1 to mean the first output column. HAVING, however, needs the full expression." },
      { q: "Is SELECT DISTINCT the same as GROUP BY?", a: "For simply removing duplicates they give the same rows. Use GROUP BY when you also want aggregates per group." },
      { q: "Why does SUM return NULL instead of 0?", a: "When there are no rows, or all values are NULL, SUM has nothing to add and returns NULL. Wrap it in COALESCE(SUM(x), 0) if you want 0." },
    ],
  },

  "sql-joins/set-ops": {
    plain: [
      "Joins put tables side by side, adding columns. Set operations stack results on top of each other, adding rows. They take two finished query results and combine them into one list.",
      "Think of two guest lists for a party, one from you and one from a friend. UNION is the combined list with each name once. INTERSECT is the people on both lists. EXCEPT is the people on your list who are not on your friend's.",
      "The two lists must have the same shape: the same number of columns, in the same order, with types that fit together. The column names in the final result come from the first query.",
      "DISTINCT is the single-query cousin of these tools. It removes duplicate rows from one result, so each unique combination of the selected columns appears just once.",
    ],
    deepDive: [
      {
        heading: "What \"duplicate\" means here",
        body: "UNION, INTERSECT, EXCEPT and DISTINCT compare whole rows, using every selected column. Two rows are duplicates only if every column matches. ('Ann', 'Berlin') and ('Ann', 'Paris') are different rows.\n\nFor this comparison, NULLs count as equal to each other. That is different from WHERE, where NULL = NULL is unknown. So SELECT DISTINCT city returns a single NULL row even if many customers have no city.\n\nText comparison is exact: 'ann@x.com' and 'Ann@x.com ' are different. Normalise with lower() and trim() in both queries if they should match.",
      },
      {
        heading: "The cost of removing duplicates",
        body: "To remove duplicates, Postgres must compare every row with every other, which it does by sorting or by building a hash table of all rows. On millions of rows that costs real time and memory.\n\nUNION ALL skips this work and simply appends the second result after the first. If the two queries cannot overlap, for example orders_2025 and orders_2026, UNION ALL gives the same answer far more cheaply.\n\nINTERSECT ALL and EXCEPT ALL exist too. They keep duplicates by counting: if a value appears 3 times on the left and once on the right, EXCEPT ALL returns it twice.",
        bullets: ["UNION = UNION ALL + remove duplicates", "Know the inputs cannot overlap? Use UNION ALL", "EXCEPT ALL subtracts counts, not just presence"],
      },
      {
        heading: "Sorting and limiting a combined result",
        body: "ORDER BY and LIMIT at the end apply to the whole combined result, not to the last query. To sort or limit each part separately, wrap the part in brackets: (SELECT ... ORDER BY score DESC LIMIT 3) UNION ALL (SELECT ...).\n\nBecause column names come from the first query, ORDER BY should use those names or column numbers. A common trick is to add a constant column such as 'customer' AS source to each part so you can tell later which query each row came from.",
        visual: {
          type: "compare",
          title: "Where ORDER BY and LIMIT apply",
          columns: [
            { title: "At the very end", points: ["Applies to the whole combined result", "Uses the first query's column names", "One sort for everything"] },
            { title: "Inside brackets", points: ["(SELECT ... ORDER BY score DESC LIMIT 3)", "Limits each part separately", "Then UNION ALL the parts"] },
          ],
        },
      },
      {
        heading: "DISTINCT ON: a Postgres favourite",
        body: "DISTINCT ON (customer_id) keeps only the first row for each customer_id, where \"first\" is decided by ORDER BY. For example, SELECT DISTINCT ON (customer_id) * FROM orders ORDER BY customer_id, ordered_at DESC returns each customer's latest order.\n\nThe ORDER BY must start with the same columns as DISTINCT ON. The remaining ORDER BY columns choose which row wins. It is a short, readable alternative to a window function for \"latest row per group\" questions.",
        visual: {
          type: "flow",
          title: "DISTINCT ON: latest order per customer",
          steps: [
            { label: "ORDER BY customer_id, ordered_at DESC", detail: "Newest first inside each customer" },
            { label: "Group by customer_id", detail: "Rows with the same DISTINCT ON value" },
            { label: "Keep the first row", detail: "The newest order wins" },
            { label: "Result", detail: "One row per customer" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What UNION does behind the scenes",
        steps: [
          { label: "Run query A", detail: "e.g. 900 customer emails" },
          { label: "Run query B", detail: "e.g. 400 subscriber emails" },
          { label: "Append", detail: "1,300 rows: this is UNION ALL" },
          { label: "Sort or hash", detail: "Find identical rows" },
          { label: "Drop duplicates", detail: "1,100 unique emails: this is UNION" },
        ],
      },
    ],
    examples: [
      {
        title: "One activity feed from three tables",
        explanation: "An admin page shows recent sign-ups, orders and reviews in one list. Step 1: write one query per table that returns the same three columns: when, kind, detail. Step 2: give the kind column a fixed label in each part. Step 3: join them with UNION ALL because rows from different tables cannot be duplicates. Step 4: sort and limit the combined result once at the end.",
        code: {
          lang: "sql",
          code: "SELECT created_at AS at, 'signup' AS kind, email AS detail FROM users\nUNION ALL\nSELECT ordered_at, 'order', 'order #' || id FROM orders\nUNION ALL\nSELECT created_at, 'review', left(body, 40) FROM reviews\nORDER BY at DESC\nLIMIT 20;",
        },
      },
      {
        title: "Checking that a data migration lost nothing",
        explanation: "You copied customers from an old system into a new table. Step 1: old EXCEPT new lists rows that did not arrive. Step 2: new EXCEPT old lists rows that changed or appeared from nowhere. Step 3: both should return zero rows. Comparing the chosen columns this way finds missing rows and silently altered values, which a simple COUNT(*) comparison would miss.",
        code: {
          lang: "sql",
          code: "SELECT id, email, country FROM old_customers\nEXCEPT\nSELECT id, email, country FROM customers;\n\nSELECT id, email, country FROM customers\nEXCEPT\nSELECT id, email, country FROM old_customers;",
        },
      },
    ],
    cheatSheet: [
      "A UNION B: rows in either (no duplicates). UNION ALL: everything, faster",
      "A INTERSECT B: rows in both. A EXCEPT B: rows in A only",
      "Same number of columns, same order, compatible types; names come from A",
      "ORDER BY / LIMIT at the end apply to the combined result",
      "Add 'label' AS source to each part to know where a row came from",
      "SELECT DISTINCT ON (key) ... ORDER BY key, ts DESC: latest row per key",
      "Set operations treat NULLs as equal to each other",
    ],
    quiz: [
      {
        q: "Query A returns 5 rows and B returns 3 rows, 2 of them identical to rows in A. How many rows does A UNION ALL B return?",
        options: ["6", "8", "5", "3"],
        answer: 1,
        why: "UNION ALL keeps every row, so 5 + 3 = 8.",
      },
      {
        q: "Same data: how many rows does A UNION B return (A has no internal duplicates)?",
        options: ["8", "5", "6", "2"],
        answer: 2,
        why: "The 2 shared rows appear once, so 5 + 3 - 2 = 6.",
      },
      {
        q: "Which query finds customers who bought in 2025 but not in 2026?",
        options: ["2025 buyers EXCEPT 2026 buyers", "2025 buyers INTERSECT 2026 buyers", "2026 buyers EXCEPT 2025 buyers", "2025 buyers UNION 2026 buyers"],
        answer: 0,
        why: "EXCEPT keeps rows from the first query that are missing from the second.",
      },
      {
        q: "What does SELECT DISTINCT ON (user_id) * FROM logins ORDER BY user_id, at DESC return?",
        options: ["All logins", "The first login of each user", "Only users with one login", "The latest login of each user"],
        answer: 3,
        why: "DISTINCT ON keeps the first row per user, and at DESC puts the newest first.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every distinct country that appears in either customers(country) or suppliers(country).",
        hint: "UNION already removes duplicates.",
        solution: "SELECT country FROM customers\nUNION\nSELECT country FROM suppliers\nORDER BY country;",
      },
      {
        level: "medium",
        task: "Find product ids that were ordered in both January and February 2026, using order_items(product_id) and orders(ordered_at).",
        hint: "Write one query per month and INTERSECT them.",
        solution: "SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id\nWHERE o.ordered_at >= '2026-01-01' AND o.ordered_at < '2026-02-01'\nINTERSECT\nSELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id\nWHERE o.ordered_at >= '2026-02-01' AND o.ordered_at < '2026-03-01';",
      },
      {
        level: "hard",
        task: "Show the top 3 products by price from category 'books' and the top 3 from 'games' in one result, each part sorted separately.",
        hint: "Put brackets around each part so its ORDER BY and LIMIT apply only to it.",
        solution: "(SELECT 'books' AS cat, name, price FROM products\n WHERE category = 'books' ORDER BY price DESC LIMIT 3)\nUNION ALL\n(SELECT 'games', name, price FROM products\n WHERE category = 'games' ORDER BY price DESC LIMIT 3);",
      },
    ],
    faq: [
      { q: "Why is UNION slower than UNION ALL?", a: "UNION has to find and remove duplicate rows, which needs a sort or a hash over all rows. UNION ALL just appends the results." },
      { q: "Can I UNION two tables with different column names?", a: "Yes. Only the number and types of columns must match. The result uses the column names from the first query." },
      { q: "Is EXCEPT the same as NOT IN?", a: "Close, but EXCEPT compares whole rows, removes duplicates, and treats NULLs as equal. NOT IN behaves badly when the list contains NULL, so EXCEPT or NOT EXISTS is usually safer." },
    ],
  },

  "sql-joins/join-practice": {
    plain: [
      "Reading about joins is like reading about swimming. You only get good by doing it. Reporting queries are the best practice because they mix everything you have learned: joins, filters, grouping and sorting.",
      "A reporting query starts as a plain-English question from someone else: \"Which city brought in the most revenue last quarter?\" Your job is to translate it, one piece at a time, into SQL that gives a correct and checkable answer.",
      "Use a sample database with realistic tables, such as a shop with customers, orders, order items and products. Free ones like pgexercises or the dvdrental sample load in minutes and come with questions to answer.",
      "The goal is speed with confidence. After twenty or so queries, the common shapes (totals per group, top N, \"who never did X\", month by month) start to feel familiar, and you write them without looking up syntax.",
    ],
    deepDive: [
      {
        heading: "The handful of shapes behind most reports",
        body: "Almost every report is one of a few patterns. Learn to spot them and you already know the skeleton of the query.\n\nTotals per group use JOIN plus GROUP BY. Trends over time group by date_trunc('month', ts). Top N overall uses ORDER BY and LIMIT. Top N per group needs ROW_NUMBER() OVER (PARTITION BY ...) or a LATERAL join. \"Never did X\" is an anti-join with NOT EXISTS. Shares of a whole divide each group's sum by SUM(...) OVER (). Comparisons between periods use FILTER or LAG.",
        bullets: ["Per group: JOIN + GROUP BY", "Over time: date_trunc + GROUP BY", "Top N per group: ROW_NUMBER or LATERAL", "Never did X: NOT EXISTS", "Share of total: x / SUM(x) OVER ()"],
      },
      {
        heading: "Checking your answer like an analyst",
        body: "A query that runs is not the same as a query that is right. Build in checks.\n\nFirst, count rows after each join. If you started with 1,000 orders and now have 3,400 rows, something fanned out. Second, reconcile: the sum of revenue per country should equal total revenue from a simple SELECT SUM(...). Third, test edge cases: a customer with no orders, an order on the last second of the month, a NULL country. Finally, read three or four result rows and check them by hand against the raw tables.",
        visual: {
          type: "flow",
          title: "Checking a report before you trust it",
          steps: [
            { label: "Count rows after each join", detail: "1,000 orders became 3,400 rows? Fan-out" },
            { label: "Reconcile totals", detail: "Sum per country equals the overall SUM" },
            { label: "Test edge cases", detail: "No orders, last second of month, NULL country" },
            { label: "Hand-check rows", detail: "Compare 3 or 4 rows with the raw tables" },
          ],
        },
      },
      {
        heading: "Half-open date ranges",
        body: "Timestamps have times, so \"all of March\" is safest written as ordered_at >= '2026-03-01' AND ordered_at < '2026-04-01'. This is called a half-open range: the start is included, the end is not. It works for any precision, never double-counts a row that falls exactly on midnight, and lets Postgres use an index on ordered_at.\n\nAvoid wrapping the column in a function such as date(ordered_at) = '2026-03-15' in filters on big tables. It is correct, but a normal index on ordered_at cannot be used for it.",
        visual: {
          type: "compare",
          title: "Filtering one month or day",
          columns: [
            { title: "Half-open range", points: ["ordered_at >= '2026-03-01'", "AND ordered_at < '2026-04-01'", "Works for any time precision", "Can use an index on ordered_at"] },
            { title: "Function on the column", points: ["date(ordered_at) = '2026-03-15'", "Correct result", "Plain index on ordered_at not used"] },
          ],
        },
      },
      {
        heading: "Making queries readable for the next person",
        body: "Reports get reused and edited. Write them so the next person can follow.\n\nPut each selected column, each JOIN and each condition on its own line. Use short, meaningful aliases (o for orders, c for customers). Name output columns for the reader: revenue_eur, not sum. Break long queries into named steps with WITH (a CTE), so each step can be run and checked on its own. Add a one-line comment saying what one row of the result represents.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A typical practice schema (online shop)",
        root: "shop database",
        children: [
          { label: "customers", children: ["id, name, city, created_at"] },
          { label: "orders", children: ["id, customer_id -> customers", "ordered_at, status"] },
          { label: "order_items", children: ["order_id -> orders", "product_id -> products", "qty, unit_price"] },
          { label: "products", children: ["id, name, category, price"] },
        ],
      },
    ],
    examples: [
      {
        title: "Top city by revenue last quarter",
        explanation: "Step 1: grain is one row per city. Step 2: revenue lives in order_items (qty times unit_price), city lives in customers, so the path is order_items to orders to customers. Step 3: filter last quarter with a half-open range on orders.ordered_at. Step 4: GROUP BY city and sum. Step 5: order by revenue and take the top 5. Step 6: check that the city totals add up to SELECT SUM over the same filter.",
        code: {
          lang: "sql",
          code: "SELECT c.city, SUM(oi.qty * oi.unit_price) AS revenue\nFROM order_items oi\nJOIN orders o    ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nWHERE o.ordered_at >= date_trunc('quarter', now()) - interval '3 months'\n  AND o.ordered_at <  date_trunc('quarter', now())\n  AND o.status = 'paid'\nGROUP BY c.city\nORDER BY revenue DESC\nLIMIT 5;",
        },
      },
      {
        title: "Best-selling product in each category",
        explanation: "\"Top 1 per group\" cannot be done with LIMIT alone. Step 1: in a CTE, sum units per product. Step 2: in a second step, number the products within each category by units, highest first, with ROW_NUMBER. Step 3: keep rows numbered 1. Each step can be run on its own to check it.",
        code: {
          lang: "sql",
          code: "WITH sales AS (\n  SELECT p.category, p.name, SUM(oi.qty) AS units\n  FROM order_items oi JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category, p.name\n), ranked AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY units DESC) AS rn\n  FROM sales\n)\nSELECT category, name, units\nFROM ranked\nWHERE rn = 1;",
        },
      },
    ],
    cheatSheet: [
      "Say what one result row means before you write any SQL",
      "Date ranges: ts >= start AND ts < next_start (half-open)",
      "Count rows after each join to catch fan-out",
      "Parts must add up: per-group totals = overall total",
      "Top N per group: ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC) then rn <= N",
      "Share of total: SUM(x) / SUM(SUM(x)) OVER () in a grouped query",
      "Name output columns for humans: revenue_eur, orders_count",
    ],
    quiz: [
      {
        q: "Your revenue-per-country query totals 1.4 million, but SELECT SUM(total) FROM orders says 1.0 million. What is the most likely cause?",
        options: ["Rounding errors", "A join fanned out and repeated some rows", "GROUP BY ignores NULLs", "The index is missing"],
        answer: 1,
        why: "A larger total after joining usually means rows were multiplied by a one-to-many join.",
      },
      {
        q: "Which filter correctly selects all orders placed on 15 March 2026?",
        options: ["ordered_at = '2026-03-15'", "ordered_at BETWEEN '2026-03-15' AND '2026-03-15'", "ordered_at LIKE '2026-03-15%'", "ordered_at >= '2026-03-15' AND ordered_at < '2026-03-16'"],
        answer: 3,
        why: "The half-open range includes every time on the 15th and nothing from the 16th.",
      },
      {
        q: "Which pattern answers \"customers who never placed an order\"?",
        options: ["NOT EXISTS subquery on orders", "INNER JOIN orders", "GROUP BY customer HAVING COUNT(*) > 0", "UNION with orders"],
        answer: 0,
        why: "NOT EXISTS keeps customers for whom no matching order row exists.",
      },
      {
        q: "Why use WITH (CTEs) in a long report query?",
        options: ["They always make queries faster", "They are required for GROUP BY", "They split the query into named steps you can check one by one", "They lock the tables"],
        answer: 2,
        why: "CTEs are mainly about readability and step-by-step verification.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Using the shop schema, count how many orders each status has.",
        hint: "One table, GROUP BY status.",
        solution: "SELECT status, COUNT(*) AS orders\nFROM orders\nGROUP BY status\nORDER BY orders DESC;",
      },
      {
        level: "medium",
        task: "Show monthly paid revenue for 2026 with each month's share of the year's total as a percentage.",
        hint: "Group by month, then divide by SUM(...) OVER () of the grouped sums.",
        solution: "SELECT date_trunc('month', o.ordered_at) AS month,\n       SUM(oi.qty * oi.unit_price) AS revenue,\n       round(100 * SUM(oi.qty * oi.unit_price)\n             / SUM(SUM(oi.qty * oi.unit_price)) OVER (), 1) AS pct\nFROM orders o JOIN order_items oi ON oi.order_id = o.id\nWHERE o.status = 'paid'\n  AND o.ordered_at >= '2026-01-01' AND o.ordered_at < '2027-01-01'\nGROUP BY 1\nORDER BY 1;",
      },
      {
        level: "hard",
        task: "List customers whose 2026 spending fell by more than half compared with 2025, with both totals.",
        hint: "Use FILTER to compute both years in one grouped pass, then compare in HAVING.",
        solution: "SELECT c.id, c.name,\n  SUM(oi.qty * oi.unit_price) FILTER (WHERE o.ordered_at >= '2025-01-01' AND o.ordered_at < '2026-01-01') AS y2025,\n  SUM(oi.qty * oi.unit_price) FILTER (WHERE o.ordered_at >= '2026-01-01' AND o.ordered_at < '2027-01-01') AS y2026\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.id, c.name\nHAVING COALESCE(SUM(oi.qty * oi.unit_price) FILTER (WHERE o.ordered_at >= '2026-01-01' AND o.ordered_at < '2027-01-01'), 0)\n     < 0.5 * SUM(oi.qty * oi.unit_price) FILTER (WHERE o.ordered_at >= '2025-01-01' AND o.ordered_at < '2026-01-01');",
      },
    ],
    faq: [
      { q: "Where can I find a sample database to practise on?", a: "pgexercises.com has a ready schema and graded questions in the browser. The dvdrental and Pagila samples load into a local Postgres in a minute." },
      { q: "How do I know my report is correct?", a: "Reconcile it: compare totals against a simpler query, count rows after every join, and check a few rows by hand." },
      { q: "Should I memorise SQL syntax?", a: "You will remember the common shapes naturally through practice. For rarer functions, looking them up in the PostgreSQL docs is normal even for experts." },
    ],
  },
  // ───────────────────────── sql-advanced ─────────────────────────
  "sql-advanced/subqueries-ctes": {
    plain: [
      "Some questions need two steps. \"Which products cost more than the average product?\" First you work out the average, then you compare each product to it. A subquery lets you put the first step inside the second, in brackets, as one query.",
      "A CTE (common table expression) does the same job but gives each step a name at the top, using WITH. It reads like a recipe: first make the paid orders, then total them per customer, then pick the best customers.",
      "Neither one stores anything permanently. They are temporary helper results that exist only while the query runs. Think of them as scratch paper you throw away when the answer is written down.",
      "Recursive CTEs are a special kind that can refer to themselves. They repeat a step until nothing new turns up, which is exactly what you need to walk a family tree, an org chart, or folders inside folders.",
    ],
    deepDive: [
      {
        heading: "Where a subquery can live",
        body: "What a subquery returns decides where it can go. A scalar subquery returns exactly one value, one row and one column, so it can sit anywhere a single value can: SELECT name, (SELECT AVG(price) FROM products) AS avg_price. If it returns more than one row, Postgres raises an error.\n\nA subquery that returns one column of many rows can feed IN, ANY or ALL: WHERE id IN (SELECT customer_id FROM orders). A subquery that returns a full table can go in FROM, where it must have an alias: FROM (SELECT ...) AS t.\n\nEXISTS (SELECT 1 FROM ...) only cares whether at least one row comes back. The selected columns do not matter, which is why people write SELECT 1.",
        bullets: ["One value: SELECT list, WHERE x = (...)", "One column: IN, ANY, ALL", "Full table: FROM (...) AS alias", "Yes or no: EXISTS / NOT EXISTS"],
      },
      {
        heading: "Correlated subqueries and how Postgres runs them",
        body: "A correlated subquery uses a column from the outer row, such as WHERE o.customer_id = c.id. Logically it runs once per outer row, which sounds slow.\n\nIn practice, the planner rewrites many of them. EXISTS and NOT EXISTS are usually turned into a semi-join or anti-join, which can use hash or merge joins and is very fast. Scalar correlated subqueries in the SELECT list are not rewritten and really do run per row, so on large results it is often faster to join to a pre-grouped subquery instead.",
      },
      {
        heading: "CTEs and performance",
        body: "Since PostgreSQL 12, a CTE that is used once and has no side effects is folded into the main query, just like a subquery. The planner can push filters into it and use indexes. So using CTEs for readability costs nothing in the common case.\n\nIf a CTE is referenced more than once, Postgres computes it once and stores the result, called materialising. You can force either behaviour: WITH t AS MATERIALIZED (...) computes it once and acts as a fence, and AS NOT MATERIALIZED lets it be inlined. Reach for these only after EXPLAIN shows a problem.",
        visual: {
          type: "compare",
          title: "Inlined vs materialised CTE",
          columns: [
            { title: "Inlined", points: ["Used once, no side effects (PG 12+)", "Or forced with NOT MATERIALIZED", "Filters pushed in, indexes usable", "Same plan as a subquery"] },
            { title: "Materialised", points: ["Referenced more than once", "Or forced with MATERIALIZED", "Computed once and stored", "Acts as an optimisation fence"] },
          ],
        },
      },
      {
        heading: "Making recursive CTEs safe",
        body: "A recursive CTE stops when a round produces no new rows. If the data has a loop, for example A reports to B and B reports to A, it never stops.\n\nTwo simple guards help. Keep a depth counter and add WHERE depth < 20 in the recursive part. Or keep a path array of visited ids and skip any row already in it: WHERE NOT e.id = ANY(path). PostgreSQL 14 and later also offer a built-in CYCLE clause that does this for you.\n\nUse UNION ALL in recursive CTEs unless you really need duplicates removed. UNION also prevents some loops, but it compares whole rows, so it does not help when a depth column changes each round.",
        visual: {
          type: "tree",
          title: "Guards against looping recursion",
          root: "Stop a recursive CTE",
          children: [
            { label: "Depth counter", children: ["WHERE depth < 20"] },
            { label: "Path of visited ids", children: ["WHERE NOT e.id = ANY(path)"] },
            { label: "CYCLE clause", children: ["Built in, PostgreSQL 14+"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Same question, three ways: customers who ordered in 2026",
        columns: [
          { title: "IN subquery", points: ["WHERE id IN (SELECT customer_id ...)", "Easy to read", "Avoid NOT IN if NULLs are possible"] },
          { title: "EXISTS", points: ["WHERE EXISTS (SELECT 1 ... WHERE o.customer_id = c.id)", "Stops at the first match", "NOT EXISTS is NULL-safe"] },
          { title: "JOIN + DISTINCT", points: ["JOIN orders, then DISTINCT", "Repeats rows before DISTINCT", "Use only when you need order columns"] },
        ],
      },
    ],
    examples: [
      {
        title: "Products priced above their category average",
        explanation: "Step 1: the inner query needs the average for the product's own category, so it must refer to the outer row; that makes it correlated. Step 2: compare each product's price to that value. Step 3: for big tables, the CTE version computes all averages once and joins them, which avoids running the subquery per row.",
        code: {
          lang: "sql",
          code: "-- correlated subquery\nSELECT name, category, price\nFROM products p\nWHERE price > (SELECT AVG(price) FROM products WHERE category = p.category);\n\n-- same result with a CTE + join\nWITH avg_cat AS (\n  SELECT category, AVG(price) AS avg_price FROM products GROUP BY category\n)\nSELECT p.name, p.category, p.price\nFROM products p JOIN avg_cat a USING (category)\nWHERE p.price > a.avg_price;",
        },
      },
      {
        title: "Breadcrumbs for a category tree",
        explanation: "categories(id, name, parent_id) stores a tree. For category 42 we want \"Home > Kitchen > Knives\". Step 1: the anchor selects category 42. Step 2: the recursive part joins each row to its parent. Step 3: it stops at the root, whose parent_id is NULL, because the join finds nothing. Step 4: string_agg joins the names, ordering by depth from the top down.",
        code: {
          lang: "sql",
          code: "WITH RECURSIVE up AS (\n  SELECT id, name, parent_id, 0 AS depth\n  FROM categories WHERE id = 42\n  UNION ALL\n  SELECT c.id, c.name, c.parent_id, up.depth + 1\n  FROM categories c JOIN up ON c.id = up.parent_id\n)\nSELECT string_agg(name, ' > ' ORDER BY depth DESC) AS breadcrumb\nFROM up;",
        },
      },
    ],
    cheatSheet: [
      "Scalar subquery must return 1 row and 1 column, or it errors",
      "Subquery in FROM needs an alias: FROM (SELECT ...) AS t",
      "EXISTS (SELECT 1 ...): only whether a row exists matters",
      "WITH a AS (...), b AS (SELECT ... FROM a) SELECT ... FROM b;",
      "Since PG 12, single-use CTEs are inlined; AS MATERIALIZED forces a fence",
      "WITH RECURSIVE: anchor UNION ALL step; stop with a depth limit or CYCLE clause",
      "NOT EXISTS beats NOT IN when the subquery can contain NULL",
    ],
    quiz: [
      {
        q: "What happens if a scalar subquery in the SELECT list returns two rows?",
        options: ["Postgres uses the first row", "Postgres returns NULL", "Postgres raises an error", "The outer row is duplicated"],
        answer: 2,
        why: "A scalar subquery may return at most one row; more is a runtime error.",
      },
      {
        q: "In PostgreSQL 12+, what happens to a CTE used once with no side effects?",
        options: ["It is inlined into the main query and optimised with it", "It is always stored in a temp table", "It runs twice", "It disables indexes"],
        answer: 0,
        why: "Single-use, side-effect-free CTEs are folded into the outer query by default.",
      },
      {
        q: "How does a recursive CTE know when to stop?",
        options: ["After 100 rounds", "When the anchor returns no rows", "When it reaches LIMIT", "When the recursive step adds no new rows"],
        answer: 3,
        why: "Recursion ends as soon as a round produces an empty result.",
      },
      {
        q: "Why do people write SELECT 1 inside EXISTS?",
        options: ["It is faster than SELECT *", "EXISTS ignores the selected columns, so 1 is a clear placeholder", "EXISTS requires a number", "It limits the subquery to one row"],
        answer: 1,
        why: "EXISTS only checks whether any row exists, so the select list is irrelevant.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List employees(name, salary) who earn more than the company-wide average salary.",
        hint: "Compare salary to a scalar subquery.",
        solution: "SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees);",
      },
      {
        level: "medium",
        task: "Using CTEs, find the share of total paid revenue that comes from the top 10 customers.",
        hint: "Step 1 totals per customer, step 2 takes the top 10, final step divides sums.",
        solution: "WITH per_cust AS (\n  SELECT customer_id, SUM(total) AS revenue\n  FROM orders WHERE status = 'paid' GROUP BY customer_id\n), top10 AS (\n  SELECT revenue FROM per_cust ORDER BY revenue DESC LIMIT 10\n)\nSELECT round(100 * (SELECT SUM(revenue) FROM top10)\n             / (SELECT SUM(revenue) FROM per_cust), 1) AS top10_pct;",
      },
      {
        level: "hard",
        task: "From employees(id, name, manager_id), list everyone who reports (directly or indirectly) to employee 7, with their depth, protected against cycles.",
        hint: "Anchor on direct reports of 7; carry a path array and skip ids already in it.",
        solution: "WITH RECURSIVE team AS (\n  SELECT id, name, 1 AS depth, ARRAY[id] AS path\n  FROM employees WHERE manager_id = 7\n  UNION ALL\n  SELECT e.id, e.name, t.depth + 1, t.path || e.id\n  FROM employees e JOIN team t ON e.manager_id = t.id\n  WHERE NOT e.id = ANY(t.path) AND t.depth < 50\n)\nSELECT id, name, depth FROM team ORDER BY depth, name;",
      },
    ],
    faq: [
      { q: "Is a CTE faster than a subquery?", a: "Usually they perform the same in modern Postgres, because single-use CTEs are inlined. Choose CTEs for readability and check EXPLAIN if speed matters." },
      { q: "Can a CTE modify data?", a: "Yes. WITH can contain INSERT, UPDATE or DELETE with RETURNING, and the main query can use those returned rows, for example to move rows between tables in one statement." },
      { q: "Is a recursive CTE really recursive?", a: "Not quite. It is a loop: each round takes only the rows added by the previous round, joins them again, and stops when nothing new appears." },
    ],
  },

  "sql-advanced/window-functions": {
    plain: [
      "Sometimes you want a summary and the details at the same time. For example, a list of every order, plus the customer's total next to each one. GROUP BY cannot do that because it squashes the orders into one row. Window functions can.",
      "Picture a class photo where each student also holds a card showing their rank in the class. Nobody leaves the photo; everyone just gets extra information about how they compare to the people around them. That is what a window function adds to each row.",
      "The \"window\" is the set of rows each row looks at. OVER () means \"all rows\". OVER (PARTITION BY class) means \"only my classmates\". Adding ORDER BY inside OVER lets you ask ordered questions like \"what was the value just before me?\"",
      "Window functions power many everyday reports: rankings, top 3 per category, running totals, moving averages, and change compared with last month. Once you know them, many long queries become short ones.",
    ],
    deepDive: [
      {
        heading: "The default frame trap",
        body: "When OVER has an ORDER BY but no frame clause, Postgres uses RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. RANGE means rows with the same ORDER BY value are treated as one step. So if two sales share the same day, a running total shows the same combined value on both rows instead of growing row by row.\n\nIf you want strictly one row at a time, say so: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, or add a unique tie-breaker to ORDER BY.\n\nAnother surprise: LAST_VALUE(x) OVER (ORDER BY d) returns the current row's value, because the default frame ends at the current row. Use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING to see the true last value.",
        bullets: ["Default frame with ORDER BY: start to current row, ties grouped", "ROWS counts physical rows; RANGE groups equal values", "LAST_VALUE needs a frame to the end of the partition"],
        visual: {
          type: "compare",
          title: "Running total with a tie on day 2",
          columns: [
            { title: "Default (RANGE)", points: ["Day 1, 10: total 10", "Day 2, 5: total 22", "Day 2, 7: total 22"] },
            { title: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", points: ["Day 1, 10: total 10", "Day 2, 5: total 15", "Day 2, 7: total 22"] },
          ],
        },
      },
      {
        heading: "When window functions run",
        body: "Window functions are computed after FROM, WHERE, GROUP BY and HAVING, and just before the final ORDER BY and LIMIT. Two consequences follow.\n\nFirst, you cannot filter on a window result in WHERE or HAVING, because it does not exist yet. Compute it in a CTE or subquery, then filter outside. Second, window functions can be applied to grouped results. SUM(SUM(amount)) OVER () looks odd, but the inner SUM is the GROUP BY aggregate and the outer SUM is a window over the grouped rows. That is how you compute each group's share of the total in one query.",
        visual: {
          type: "flow",
          title: "Where window functions run",
          steps: [
            { label: "FROM, WHERE", detail: "Window results do not exist yet" },
            { label: "GROUP BY, HAVING", detail: "Still cannot filter on them" },
            { label: "Window functions", detail: "Can wrap aggregates: SUM(SUM(x)) OVER ()" },
            { label: "ORDER BY, LIMIT", detail: "Can use window results" },
            { label: "Need a filter?", detail: "Wrap in a CTE, filter outside" },
          ],
        },
      },
      {
        heading: "Naming windows and the full function family",
        body: "If several columns use the same window, name it once: WINDOW w AS (PARTITION BY customer_id ORDER BY ordered_at), then write ROW_NUMBER() OVER w, SUM(total) OVER w.\n\nThe main families: ranking (ROW_NUMBER, RANK, DENSE_RANK, NTILE(4) for quartiles, PERCENT_RANK), offset (LAG, LEAD, FIRST_VALUE, LAST_VALUE, NTH_VALUE), and any normal aggregate (SUM, AVG, COUNT, MIN, MAX) used with OVER. LAG(x, 1, 0) takes the value one row back and uses 0 instead of NULL for the first row.",
      },
      {
        heading: "Cost and indexes",
        body: "To compute a window, Postgres sorts the rows by the PARTITION BY and ORDER BY columns, then walks them in order. On large tables that sort is the main cost. An index that already matches, such as (customer_id, ordered_at) for PARTITION BY customer_id ORDER BY ordered_at, lets Postgres read rows in order and skip the sort.\n\nSeveral window functions with the same window share one sort. Functions with different windows each need their own sort, so use as few distinct windows as you can.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Scores 90, 85, 85, 70: how each ranking numbers them",
        columns: [
          { title: "ROW_NUMBER()", points: ["1, 2, 3, 4", "Always unique", "Ties broken arbitrarily", "Best for top N per group"] },
          { title: "RANK()", points: ["1, 2, 2, 4", "Ties share a rank", "Leaves a gap after ties", "Like sports standings"] },
          { title: "DENSE_RANK()", points: ["1, 2, 2, 3", "Ties share a rank", "No gaps", "Good for \"top 3 price levels\""] },
        ],
      },
    ],
    examples: [
      {
        title: "Month-over-month growth",
        explanation: "Step 1: in a CTE, total revenue per month. Step 2: LAG(revenue) brings last month's value onto this month's row. Step 3: compute the change and the percentage; NULLIF avoids division by zero. The first month shows NULL growth because it has no previous month, which is honest.",
        code: {
          lang: "sql",
          code: "WITH monthly AS (\n  SELECT date_trunc('month', ordered_at) AS month, SUM(total) AS revenue\n  FROM orders WHERE status = 'paid'\n  GROUP BY 1\n)\nSELECT month, revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev,\n       round(100 * (revenue - LAG(revenue) OVER (ORDER BY month))\n             / NULLIF(LAG(revenue) OVER (ORDER BY month), 0), 1) AS growth_pct\nFROM monthly\nORDER BY month;",
        },
      },
      {
        title: "Spotting each customer's first order",
        explanation: "Marketing wants to know which orders were a customer's first. Step 1: number each customer's orders by date with ROW_NUMBER, partitioned by customer. Step 2: add the customer's lifetime order count with COUNT(*) over the same partition, without an ORDER BY so the frame is the whole partition. Step 3: is_first is just rn = 1. Every order row stays in the output.",
        code: {
          lang: "sql",
          code: "SELECT id, customer_id, ordered_at,\n       ROW_NUMBER() OVER w = 1          AS is_first,\n       COUNT(*) OVER (PARTITION BY customer_id) AS lifetime_orders\nFROM orders\nWINDOW w AS (PARTITION BY customer_id ORDER BY ordered_at, id)\nORDER BY customer_id, ordered_at;",
        },
      },
    ],
    cheatSheet: [
      "fn() OVER (PARTITION BY g ORDER BY x ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)",
      "Filter on a window result in an outer query: WHERE rn <= 3",
      "Share of total: x / SUM(x) OVER ()",
      "LAG(x, 1, 0) OVER (ORDER BY d): previous value, 0 for the first row",
      "NTILE(4) OVER (ORDER BY score): split rows into quartiles",
      "WINDOW w AS (...) to reuse one window definition",
      "Use ROWS, not the default RANGE, for row-by-row running totals with ties",
    ],
    quiz: [
      {
        q: "Scores are 50, 40, 40, 30. What does DENSE_RANK() OVER (ORDER BY score DESC) give the 30?",
        options: ["4", "3", "2", "1"],
        answer: 1,
        why: "DENSE_RANK gives 1, 2, 2, 3, with no gap after the tie.",
      },
      {
        q: "Why does WHERE ROW_NUMBER() OVER (...) <= 3 fail?",
        options: ["ROW_NUMBER needs PARTITION BY", "WHERE cannot use numbers", "Window functions run after WHERE", "It needs GROUP BY"],
        answer: 2,
        why: "Window results do not exist yet when WHERE runs, so filter in an outer query.",
      },
      {
        q: "What does SUM(amount) OVER () add to each row?",
        options: ["The grand total of all rows", "A running total", "The amount of the previous row", "Nothing; it is an error"],
        answer: 0,
        why: "An empty OVER () means the window is every row in the result.",
      },
      {
        q: "Two rows share the same date. With SUM(x) OVER (ORDER BY date) and no frame clause, what do they show?",
        options: ["Different running totals", "NULL", "Only the first gets a value", "The same running total including both rows"],
        answer: 3,
        why: "The default RANGE frame treats peers with equal ORDER BY values as one step.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From employees(name, department, salary), show each employee with the average salary of their department next to them.",
        hint: "AVG with OVER (PARTITION BY department).",
        solution: "SELECT name, department, salary,\n       round(AVG(salary) OVER (PARTITION BY department), 2) AS dept_avg\nFROM employees;",
      },
      {
        level: "medium",
        task: "Show the 2 highest-paid employees in each department.",
        hint: "Number rows per department in a CTE, then keep rn <= 2.",
        solution: "WITH ranked AS (\n  SELECT name, department, salary,\n         ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn\n  FROM employees\n)\nSELECT name, department, salary\nFROM ranked\nWHERE rn <= 2\nORDER BY department, salary DESC;",
      },
      {
        level: "hard",
        task: "From daily_sales(day, revenue), show each day with a 7-day moving average and flag days more than 50% above that average.",
        hint: "AVG over ROWS BETWEEN 6 PRECEDING AND CURRENT ROW; compare in an outer query.",
        solution: "WITH m AS (\n  SELECT day, revenue,\n         AVG(revenue) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg7\n  FROM daily_sales\n)\nSELECT day, revenue, round(avg7, 2) AS avg7,\n       revenue > 1.5 * avg7 AS spike\nFROM m\nORDER BY day;",
      },
    ],
    faq: [
      { q: "What is the difference between PARTITION BY and GROUP BY?", a: "Both split rows into groups. GROUP BY returns one row per group, while PARTITION BY keeps every row and only uses the group for the window calculation." },
      { q: "Can I use a window function inside an aggregate?", a: "No, but you can do it the other way round: an aggregate inside a window, such as SUM(SUM(x)) OVER (). For the reverse, compute the window in a CTE and aggregate outside." },
      { q: "Do window functions work in MySQL and other databases?", a: "Yes. They are standard SQL and are supported by MySQL 8+, SQL Server, Oracle and SQLite, with only small differences." },
    ],
  },

  "sql-advanced/json": {
    plain: [
      "Tables are great when every row has the same fields. But sometimes the fields vary. A laptop has RAM and screen size, a T-shirt has size and colour. Making a column for every possible attribute would leave most cells empty.",
      "JSONB lets one column hold a small document of key-value pairs, like {\"color\": \"red\", \"size\": \"M\"}. Each row can have different keys. Postgres still understands the contents, so you can filter, sort and index on them.",
      "Arrays are the simpler cousin. A text[] column holds a plain list, like tags: {sale, summer, new}. They are handy for short lists of simple values that belong to one row and are not shared with other tables.",
      "The trick is balance. Keep the important, always-present fields as normal columns with proper types and constraints. Use JSONB for the flexible extras, and arrays for small lists. That gives you structure where it matters and freedom where you need it.",
    ],
    deepDive: [
      {
        heading: "Reading nested values",
        body: "-> and ->> take one key or array index. For deeper paths, chain them: data->'address'->>'city'. Or use a path: data #>> '{address,city}'. Arrays inside JSON are indexed from 0, so data->'items'->0 is the first item.\n\nValues from ->> are text, so cast them for maths or date comparisons: (data->>'price')::numeric > 20. If a key is missing, you get NULL, not an error.\n\nTo turn a JSON array into rows, use jsonb_array_elements(data->'items') in the FROM clause. Each element becomes one row you can join and group like a normal table. jsonb_each does the same for the keys of an object.",
        bullets: ["a->'b'->>'c' or a #>> '{b,c}' for nested text", "Cast ->> results: ::numeric, ::int, ::date", "jsonb_array_elements: array to rows", "Missing key gives NULL"],
      },
      {
        heading: "Changing JSONB without rewriting it by hand",
        body: "You rarely need to rebuild a document to change it. The || operator merges objects, with the right side winning: attrs || '{\"color\": \"blue\"}' sets or replaces one key. The - operator removes a key: attrs - 'color'. jsonb_set(attrs, '{dims,width}', '30') changes a nested value.\n\nUnder the hood, Postgres still writes a whole new copy of the row, because rows are never edited in place. Very large documents that change often therefore cost more to update than a few normal columns would.",
        visual: {
          type: "tree",
          title: "Changing JSONB in place",
          root: "attrs (JSONB)",
          children: [
            { label: "|| merge", children: ["attrs || '{\"color\": \"blue\"}'", "Right side wins"] },
            { label: "- remove key", children: ["attrs - 'color'"] },
            { label: "jsonb_set", children: ["jsonb_set(attrs, '{dims,width}', '30')"] },
            { label: "Under the hood", children: ["A new row version is written"] },
          ],
        },
      },
      {
        heading: "Indexing JSONB in practice",
        body: "A GIN index on the whole column speeds up containment (@>) and key checks (?). The default operator class jsonb_ops supports all of them. jsonb_path_ops supports only @> but is smaller and faster for it.\n\nIf you filter on one field with ordinary comparisons, like price ranges, a GIN index will not help. Instead create a B-tree expression index on exactly that expression: CREATE INDEX ON products (((attrs->>'price')::numeric)). The query must use the same expression to benefit.\n\nFor arrays, a GIN index supports @> (contains), <@ (is contained by) and && (overlaps), for example WHERE tags && ARRAY['sale', 'new'].",
        visual: {
          type: "compare",
          title: "Picking a JSONB index",
          columns: [
            { title: "GIN, jsonb_ops (default)", points: ["Containment @>", "Key checks like ?", "Larger index"] },
            { title: "GIN, jsonb_path_ops", points: ["Containment @>", "No key checks like ?", "Smaller and faster for @>"] },
            { title: "B-tree expression index", points: ["((attrs->>'price')::numeric)", "Ranges and normal comparisons", "Query must use the same expression"] },
          ],
        },
      },
      {
        heading: "When JSONB is the wrong choice",
        body: "JSONB gives up several safety features of columns. There are no foreign keys into a JSON field, no NOT NULL or CHECK on individual keys unless you write them by hand, and typos in key names silently create new keys. Planner statistics on JSON fields are weak, so estimates for JSON filters can be poor.\n\nA good rule: if every row has the field, you filter or join on it often, or other tables refer to it, make it a real column. Keep JSONB for genuinely variable data, raw API payloads, and settings blobs.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From a product's attributes to a fast filter",
        steps: [
          { label: "Store", detail: "attrs = {\"color\": \"red\", \"size\": \"M\"}" },
          { label: "Index", detail: "CREATE INDEX ... USING gin (attrs jsonb_path_ops)" },
          { label: "Query", detail: "WHERE attrs @> '{\"color\": \"red\"}'" },
          { label: "Bitmap index scan", detail: "GIN finds matching rows directly" },
          { label: "Return rows", detail: "No full-table scan needed" },
        ],
      },
    ],
    examples: [
      {
        title: "Saving webhook payloads and reporting on them",
        explanation: "A payment provider sends JSON events. Step 1: store each event as received in a jsonb column so nothing is lost. Step 2: pull out the fields you need with ->> and cast them. Step 3: group like normal columns. Step 4: if this report runs often, add an expression index on the event type.",
        code: {
          lang: "sql",
          code: "CREATE TABLE events (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  received_at timestamptz NOT NULL DEFAULT now(),\n  payload jsonb NOT NULL\n);\n\nSELECT payload->>'type' AS type,\n       COUNT(*) AS events,\n       SUM((payload->'data'->>'amount')::numeric) AS amount\nFROM events\nWHERE received_at >= now() - interval '1 day'\nGROUP BY 1;",
        },
      },
      {
        title: "Line items inside an order document",
        explanation: "An order stores items as a JSON array: [{\"sku\": \"A1\", \"qty\": 2}, {\"sku\": \"B7\", \"qty\": 1}]. To find the total quantity per SKU across all orders, Step 1: expand the array into rows with jsonb_array_elements in a LATERAL position. Step 2: read sku and qty from each element. Step 3: group and sum.",
        code: {
          lang: "sql",
          code: "SELECT item->>'sku'               AS sku,\n       SUM((item->>'qty')::int)   AS units\nFROM orders o,\n     jsonb_array_elements(o.doc->'items') AS item\nGROUP BY 1\nORDER BY units DESC;",
        },
      },
    ],
    cheatSheet: [
      "-> returns jsonb, ->> returns text; #> and #>> take a path like '{a,b}'",
      "(doc->>'price')::numeric to compare or do maths",
      "doc @> '{\"k\": \"v\"}' containment; doc ? 'k' key exists",
      "doc || '{\"k\": 1}' set a key; doc - 'k' remove a key; jsonb_set for nested",
      "jsonb_array_elements(doc->'items') turns an array into rows",
      "GIN for @> and ?, B-tree expression index for one field's ranges",
      "Arrays: 'x' = ANY(tags), tags @> ARRAY['x'], tags && ARRAY['x','y']",
    ],
    quiz: [
      {
        q: "Which expression returns the city as text from {\"address\": {\"city\": \"Oslo\"}}?",
        options: ["doc->'address'->'city'", "doc->>'address'->>'city'", "doc.address.city", "doc->'address'->>'city'"],
        answer: 3,
        why: "-> keeps jsonb for the inner object, and ->> on the last step returns text.",
      },
      {
        q: "You filter WHERE (attrs->>'price')::numeric < 20. Which index can help?",
        options: ["A B-tree expression index on ((attrs->>'price')::numeric)", "A GIN index on attrs", "A B-tree index on attrs", "No index can help"],
        answer: 0,
        why: "A range comparison on one extracted value needs a B-tree on that exact expression.",
      },
      {
        q: "What does doc - 'temp' do to a jsonb value?",
        options: ["Subtracts numbers", "Returns only the temp key", "Returns the document without the temp key", "Raises an error"],
        answer: 2,
        why: "The - operator removes a key from a jsonb object.",
      },
      {
        q: "Which data is the best fit for a JSONB column?",
        options: ["A customer's email used for login", "Raw webhook payloads whose shape varies", "The order total used in every report", "A foreign key to products"],
        answer: 1,
        why: "Variable, rarely-filtered data suits JSONB; core fields belong in typed columns.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From products(name, attrs jsonb), list the names of products whose attrs contain color \"red\".",
        hint: "Use the containment operator.",
        solution: "SELECT name\nFROM products\nWHERE attrs @> '{\"color\": \"red\"}';",
      },
      {
        level: "medium",
        task: "Add the key \"discontinued\": true to the attrs of product 15 without touching its other keys, and return the new attrs.",
        hint: "Merge objects with || in an UPDATE.",
        solution: "UPDATE products\nSET attrs = attrs || '{\"discontinued\": true}'\nWHERE id = 15\nRETURNING attrs;",
      },
      {
        level: "hard",
        task: "Products have tags text[]. Find the 5 most common tags across all products and create an index that speeds up \"has tag X\" filters.",
        hint: "unnest turns an array into rows; arrays use GIN indexes.",
        solution: "SELECT tag, COUNT(*) AS products\nFROM products, unnest(tags) AS tag\nGROUP BY tag\nORDER BY products DESC\nLIMIT 5;\n\nCREATE INDEX products_tags_gin ON products USING gin (tags);\n-- then: WHERE tags @> ARRAY['sale']",
      },
    ],
    faq: [
      { q: "Should I use json or jsonb?", a: "Use jsonb almost always. Plain json only makes sense when you must keep the exact original text, including key order and whitespace." },
      { q: "Can Postgres replace MongoDB?", a: "For many apps, yes: jsonb gives document storage, indexing and querying, plus transactions and joins. Very large, schema-free workloads with heavy sharding may still suit a document database better." },
      { q: "Why does my JSON comparison give a type error?", a: "-> returns jsonb, which cannot be compared to plain text or numbers directly. Use ->> to get text, then cast it if needed." },
    ],
  },

  "sql-advanced/upsert-views": {
    plain: [
      "Upsert is short for \"update or insert\". You hand Postgres a row and say: if it is new, add it; if it already exists, update it. It is perfect for syncing data from another system, counting things, or saving user settings.",
      "Without upsert you would first check whether the row exists, then decide what to do. But between the check and the action, another user might insert the same row, and one of you gets an error. Upsert does the check and the action as one step, so that gap disappears.",
      "A view is a saved query with a name. You create it once, and from then on you can SELECT from it like a table. It hides complicated joins behind a simple name, like a shortcut on your desktop.",
      "A materialised view goes one step further: it saves the query's results, not just the query. Reading it is very fast, like reading a printed report. The catch is that the report gets old, so you reprint it with REFRESH when needed.",
    ],
    deepDive: [
      {
        heading: "The parts of ON CONFLICT",
        body: "The conflict target, such as ON CONFLICT (sku), names the columns of a unique index or constraint. Postgres needs it to know what counts as \"already exists\". For a constraint you can also write ON CONFLICT ON CONSTRAINT name.\n\nDO UPDATE SET then says what to change. The special table EXCLUDED holds the row you tried to insert, and the table name refers to the row already there. You can add a WHERE to update only sometimes, for example only when the incoming data is newer: WHERE EXCLUDED.updated_at > inventory.updated_at.\n\nRETURNING works too, so you get back the final row whether it was inserted or updated.",
        bullets: ["Target needs a unique index or constraint", "EXCLUDED = proposed row; table name = existing row", "DO UPDATE ... WHERE for conditional updates", "One statement cannot update the same row twice"],
      },
      {
        heading: "MERGE: the bigger sibling",
        body: "PostgreSQL 15 added MERGE, the SQL-standard way to sync a table from a source. It compares a target with a source query and lets you say what to do WHEN MATCHED (update or delete) and WHEN NOT MATCHED (insert).\n\nMERGE is more flexible because it can also delete, and it can match on any condition, not only a unique key. But ON CONFLICT is still the better choice for concurrent single-row upserts from an app, because it is designed to handle two sessions racing for the same key without errors. MERGE can still raise a unique violation in that situation.",
        visual: {
          type: "compare",
          title: "ON CONFLICT vs MERGE",
          columns: [
            { title: "INSERT ... ON CONFLICT", points: ["Needs a unique index or constraint", "Insert, or update the existing row", "Safe for concurrent single-row upserts"] },
            { title: "MERGE (PostgreSQL 15+)", points: ["Matches on any condition", "WHEN MATCHED: update or delete", "WHEN NOT MATCHED: insert", "Good for syncing from a source"] },
          ],
        },
      },
      {
        heading: "What views are good for",
        body: "A view does not store data and is not faster by itself. When you query it, Postgres pastes the view's query into yours and optimises the whole thing together, so filters you add can still use indexes.\n\nViews shine in three places. They give a simple name to a complicated join that many queries reuse. They provide a stable interface: you can restructure tables underneath while keeping the view's columns the same. And they help security: grant a role access to a view that shows only some columns or rows, without giving access to the table itself.\n\nSimple views on one table are automatically updatable, so INSERT and UPDATE through them work.",
      },
      {
        heading: "Keeping a materialised view fresh",
        body: "REFRESH MATERIALIZED VIEW sales_summary reruns the query and replaces the stored rows. During a normal refresh, readers are blocked until it finishes. Adding CONCURRENTLY lets readers keep using the old data while the new data is built, then swaps in the differences. It requires a unique index on the materialised view and takes a bit longer.\n\nPostgres does not refresh automatically. Teams schedule it with cron, the pg_cron extension, or a job in their app, choosing a rhythm that matches how fresh the numbers need to be: every 5 minutes for a dashboard, nightly for a monthly report.",
        visual: {
          type: "compare",
          title: "Two ways to refresh",
          columns: [
            { title: "REFRESH MATERIALIZED VIEW", points: ["Reruns the query", "Readers blocked until it finishes", "No unique index needed"] },
            { title: "... CONCURRENTLY", points: ["Readers keep using old data", "Needs a unique index on the view", "A bit slower; swaps in differences"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Why check-then-insert breaks and upsert does not",
        actors: ["Session A", "Postgres", "Session B"],
        messages: [
          { from: 0, to: 1, label: "SELECT sku 'A1'? none" },
          { from: 2, to: 1, label: "SELECT sku 'A1'? none" },
          { from: 0, to: 1, label: "INSERT 'A1': ok" },
          { from: 2, to: 1, label: "INSERT 'A1': duplicate key error" },
          { from: 2, to: 1, label: "With ON CONFLICT instead: waits for A" },
          { from: 1, to: 2, label: "Row exists now: DO UPDATE applied" },
        ],
      },
    ],
    examples: [
      {
        title: "Counting page views with an upsert",
        explanation: "Each visit should add 1 to today's counter for a page, creating the counter the first time. Step 1: a unique key on (page, day). Step 2: insert a row with count 1. Step 3: on conflict, add 1 to the existing count. Many users can hit the page at once and no visit is lost or causes an error.",
        code: {
          lang: "sql",
          code: "CREATE TABLE page_views (\n  page  text NOT NULL,\n  day   date NOT NULL,\n  views bigint NOT NULL DEFAULT 0,\n  PRIMARY KEY (page, day)\n);\n\nINSERT INTO page_views (page, day, views)\nVALUES ('/pricing', current_date, 1)\nON CONFLICT (page, day)\nDO UPDATE SET views = page_views.views + 1\nRETURNING views;",
        },
      },
      {
        title: "A fast dashboard with a materialised view",
        explanation: "The daily sales dashboard runs a heavy query over millions of order lines and takes 8 seconds. Step 1: save the result as a materialised view. Step 2: add a unique index so it can refresh concurrently and so lookups are fast. Step 3: schedule a refresh every 10 minutes. The dashboard now reads a few hundred stored rows in milliseconds.",
        code: {
          lang: "sql",
          code: "CREATE MATERIALIZED VIEW daily_sales AS\nSELECT date_trunc('day', o.ordered_at)::date AS day,\n       SUM(oi.qty * oi.unit_price)            AS revenue,\n       COUNT(DISTINCT o.id)                   AS orders\nFROM orders o JOIN order_items oi ON oi.order_id = o.id\nWHERE o.status = 'paid'\nGROUP BY 1;\n\nCREATE UNIQUE INDEX ON daily_sales (day);\n-- every 10 minutes (cron / pg_cron):\nREFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;",
        },
      },
    ],
    cheatSheet: [
      "INSERT ... ON CONFLICT (key) DO UPDATE SET col = EXCLUDED.col;",
      "INSERT ... ON CONFLICT DO NOTHING;  skip duplicates quietly",
      "DO UPDATE SET ... WHERE EXCLUDED.updated_at > t.updated_at  (only newer data wins)",
      "CREATE OR REPLACE VIEW v AS SELECT ...;  a view stores the query, not rows",
      "CREATE MATERIALIZED VIEW mv AS ...;  REFRESH MATERIALIZED VIEW mv;",
      "REFRESH ... CONCURRENTLY needs a unique index and keeps readers unblocked",
      "MERGE (PG 15+) syncs a table from a source with matched / not matched rules",
    ],
    quiz: [
      {
        q: "ON CONFLICT (email) fails with \"there is no unique or exclusion constraint matching\". Why?",
        options: ["email is NULL", "EXCLUDED is misspelled", "The table has no unique index or constraint on email", "Upserts need MERGE"],
        answer: 2,
        why: "The conflict target must match an existing unique index or constraint.",
      },
      {
        q: "In DO UPDATE SET qty = inventory.qty + EXCLUDED.qty, what is EXCLUDED.qty?",
        options: ["The quantity you tried to insert", "The old quantity", "Always 0", "The deleted quantity"],
        answer: 0,
        why: "EXCLUDED holds the values of the row proposed for insertion.",
      },
      {
        q: "Is SELECT from a plain view faster than running its query directly?",
        options: ["Yes, views are cached", "Yes, views have their own indexes", "No, it is always slower", "No, it runs the same query and is planned the same way"],
        answer: 3,
        why: "A plain view is expanded into your query; it stores no data.",
      },
      {
        q: "What does CONCURRENTLY give you when refreshing a materialised view?",
        options: ["Automatic refreshes", "Readers can keep querying the old data during refresh", "A faster refresh", "No need for indexes"],
        answer: 1,
        why: "Concurrent refresh avoids blocking reads, at the cost of needing a unique index.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Insert a user with email 'ann@x.com' into users(email UNIQUE, name), but do nothing if that email already exists.",
        hint: "ON CONFLICT with DO NOTHING.",
        solution: "INSERT INTO users (email, name)\nVALUES ('ann@x.com', 'Ann')\nON CONFLICT (email) DO NOTHING;",
      },
      {
        level: "medium",
        task: "Create a view customer_totals showing each customer's id, name, number of paid orders and paid revenue, including customers with no orders.",
        hint: "LEFT JOIN with the status filter in ON, and COALESCE the sum.",
        solution: "CREATE VIEW customer_totals AS\nSELECT c.id, c.name,\n       COUNT(o.id) AS paid_orders,\n       COALESCE(SUM(o.total), 0) AS paid_revenue\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'\nGROUP BY c.id, c.name;",
      },
      {
        level: "hard",
        task: "Sync product prices from a staging table so that only rows whose incoming updated_at is newer overwrite the stored price, and new products are inserted. Return how each row was handled.",
        hint: "DO UPDATE ... WHERE; the system column xmax = 0 means the row was freshly inserted.",
        solution: "INSERT INTO products (sku, price, updated_at)\nSELECT sku, price, updated_at FROM staging_prices\nON CONFLICT (sku) DO UPDATE\n  SET price = EXCLUDED.price,\n      updated_at = EXCLUDED.updated_at\n  WHERE EXCLUDED.updated_at > products.updated_at\nRETURNING sku, (xmax = 0) AS inserted;",
      },
    ],
    faq: [
      { q: "What is the difference between ON CONFLICT and MERGE?", a: "ON CONFLICT is a Postgres upsert built for concurrent inserts on a unique key. MERGE (PG 15+) is standard SQL for syncing from a source and can also delete, but it is less safe when sessions race for the same key." },
      { q: "Does a view update when the table changes?", a: "A plain view always shows current data because it reruns its query. A materialised view only changes when you REFRESH it." },
      { q: "Can I index a view?", a: "Not a plain view, but its underlying tables can be indexed. Materialised views can have their own indexes because they store rows." },
    ],
  },
};

export default extra;
