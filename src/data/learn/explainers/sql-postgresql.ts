import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────────────────── sql-basics ─────────────────────────
  "sql-basics/setup": {
    summary:
      "PostgreSQL is a database server: a program that stores data and answers SQL queries over a network connection. psql is its command-line client, where you type SQL plus backslash meta-commands to explore databases and tables.",
    visuals: [
      {
        type: "layers",
        title: "From psql to disk",
        layers: [
          { label: "Client (psql, app)", detail: "Sends SQL over a connection, usually port 5432" },
          { label: "Backend process", detail: "One server process per connection runs your query" },
          { label: "Shared buffers", detail: "In-memory cache of table and index pages" },
          { label: "WAL", detail: "Write-ahead log records changes before data files" },
          { label: "Data files on disk", detail: "Tables and indexes stored as files" },
        ],
      },
      {
        type: "tree",
        title: "How a server is organised",
        root: "Postgres server (cluster)",
        children: [
          { label: "Database: shop", children: ["Schema: public", "Tables: customers, orders"] },
          { label: "Database: postgres", children: ["Default admin database"] },
          { label: "Roles", children: ["postgres (superuser)", "app_user"] },
        ],
      },
    ],
    keyPoints: [
      "Docker is the quickest way to run Postgres locally for learning.",
      "Connect with psql -h localhost -U postgres -d shop.",
      "Meta-commands start with a backslash and are handled by psql, not the server.",
      "SQL statements end with a semicolon; meta-commands do not.",
    ],
    terms: [
      { term: "PostgreSQL", meaning: "Open-source relational database server." },
      { term: "psql", meaning: "Postgres's interactive terminal client." },
      { term: "Meta-command", meaning: "psql shortcut like \\dt that starts with a backslash." },
      { term: "Database", meaning: "Named collection of schemas and tables on a server." },
      { term: "Schema", meaning: "Namespace inside a database that groups tables." },
    ],
    example: {
      lang: "bash",
      code: "docker run --name pg -e POSTGRES_PASSWORD=secret -p 5432:5432 -d postgres:17\npsql -h localhost -U postgres\n\n-- inside psql\nCREATE DATABASE shop;\n\\l              -- list databases\n\\c shop         -- connect to shop\n\\dt             -- list tables\n\\d customers    -- describe a table\n\\?             -- help on meta-commands\n\\q              -- quit",
    },
    pitfalls: [
      "Forgetting the semicolon, so psql waits silently for more input.",
      "Another Postgres already using port 5432, so the container cannot bind.",
      "Creating tables while connected to the wrong database.",
    ],
    check: [
      { q: "What does \\dt show?", a: "The tables in the current database's visible schemas." },
      { q: "Who handles \\d customers, psql or the server?", a: "psql handles it, translating it into catalog queries it sends to the server." },
    ],
  },

  "sql-basics/select": {
    summary:
      "SELECT reads rows from a table. WHERE keeps only rows that match a condition, ORDER BY sorts them and LIMIT returns just the first few. Without ORDER BY, row order is not guaranteed.",
    visuals: [
      {
        type: "flow",
        title: "Logical order of a simple query",
        steps: [
          { label: "FROM", detail: "Pick the table to read" },
          { label: "WHERE", detail: "Keep rows where the condition is true" },
          { label: "SELECT", detail: "Compute the output columns and aliases" },
          { label: "ORDER BY", detail: "Sort the remaining rows" },
          { label: "LIMIT / OFFSET", detail: "Return only the requested slice" },
        ],
      },
    ],
    keyPoints: [
      "List only the columns you need instead of SELECT *.",
      "Use AS to rename output columns: price * qty AS total.",
      "IN (...) is shorthand for several OR equality checks.",
      "Wrap mixed AND/OR conditions in parentheses to make intent explicit.",
      "Large OFFSET values get slow; keyset paging with WHERE id > last_id scales better.",
    ],
    terms: [
      { term: "SELECT", meaning: "Statement that reads and returns rows." },
      { term: "WHERE", meaning: "Filter that keeps rows matching a condition." },
      { term: "ORDER BY", meaning: "Sorts results, ASC by default or DESC." },
      { term: "LIMIT / OFFSET", meaning: "Return N rows, optionally skipping some first." },
      { term: "Alias", meaning: "Temporary name for a column or table, with AS." },
    ],
    example: {
      lang: "sql",
      code: "SELECT id, name, price, price * 1.18 AS price_with_tax\nFROM products\nWHERE category IN ('books', 'games')\n  AND (price < 20 OR on_sale)\nORDER BY price DESC, name\nLIMIT 10 OFFSET 20;   -- page 3 of 10 rows",
    },
    pitfalls: [
      "Paging with LIMIT but no ORDER BY, so pages overlap or skip rows.",
      "a OR b AND c parses as a OR (b AND c) — use parentheses.",
      "Using a SELECT alias inside WHERE; WHERE runs before SELECT.",
    ],
    check: [
      { q: "Why can't WHERE use a column alias defined in SELECT?", a: "WHERE is evaluated before SELECT, so the alias does not exist yet." },
      { q: "Is the order of rows guaranteed without ORDER BY?", a: "No. Postgres may return rows in any order unless you sort them explicitly." },
    ],
  },

  "sql-basics/nulls-functions": {
    summary:
      "NULL means \"unknown or missing\", not zero or empty text. Any comparison with NULL is unknown, so you need IS NULL and COALESCE. CASE and built-in functions transform strings, numbers and dates inside queries.",
    visuals: [
      {
        type: "compare",
        title: "Handling NULL: wrong vs right",
        columns: [
          { title: "Looks right, is wrong", points: ["WHERE phone = NULL matches nothing", "price + NULL gives NULL", "NOT IN (subquery with NULL) returns nothing", "COUNT(phone) skips NULLs silently"] },
          { title: "Correct approach", points: ["WHERE phone IS NULL", "price + COALESCE(fee, 0)", "Use NOT EXISTS instead", "COUNT(*) to count all rows"] },
        ],
      },
    ],
    keyPoints: [
      "NULL = NULL is not true; it is NULL (unknown).",
      "COALESCE(a, b, c) returns the first non-NULL argument.",
      "CASE WHEN ... THEN ... ELSE ... END is SQL's if/else.",
      "Useful functions: lower(), length(), round(), now(), date_trunc().",
      "Date arithmetic uses intervals: now() - interval '7 days'.",
    ],
    terms: [
      { term: "NULL", meaning: "Marker for a missing or unknown value." },
      { term: "Three-valued logic", meaning: "Conditions can be true, false or unknown." },
      { term: "COALESCE", meaning: "Returns the first argument that is not NULL." },
      { term: "CASE", meaning: "Conditional expression returning different values." },
      { term: "interval", meaning: "A span of time like '3 days' or '2 hours'." },
    ],
    example: {
      lang: "sql",
      code: "SELECT\n  name,\n  COALESCE(phone, 'no phone') AS phone,\n  upper(left(name, 1)) AS initial,\n  CASE\n    WHEN total >= 1000 THEN 'gold'\n    WHEN total >= 100  THEN 'silver'\n    ELSE 'bronze'\n  END AS tier,\n  date_trunc('month', created_at) AS signup_month\nFROM customers\nWHERE deleted_at IS NULL\n  AND created_at > now() - interval '30 days';",
    },
    pitfalls: [
      "Writing = NULL or != NULL, which never matches any row.",
      "Assuming AVG(col) counts NULL rows as zero; it ignores them.",
      "Storing empty strings and NULLs for the same meaning.",
    ],
    check: [
      { q: "What does SELECT NULL = NULL return?", a: "NULL, because comparing two unknown values gives an unknown result." },
      { q: "How do you replace NULL discounts with 0 in a calculation?", a: "Use COALESCE(discount, 0) in the expression." },
    ],
  },

  "sql-basics/dml": {
    summary:
      "INSERT, UPDATE and DELETE change data. The WHERE clause decides which rows are touched, so run risky changes inside a transaction and use RETURNING to see exactly which rows changed before committing.",
    visuals: [
      {
        type: "flow",
        title: "A safe data change",
        steps: [
          { label: "BEGIN", detail: "Start a transaction you can undo" },
          { label: "SELECT first", detail: "Preview rows with the same WHERE" },
          { label: "UPDATE ... RETURNING", detail: "Change rows and list what changed" },
          { label: "Check the result", detail: "Row count and values as expected?" },
          { label: "COMMIT or ROLLBACK", detail: "Keep the change, or undo it" },
        ],
      },
    ],
    keyPoints: [
      "INSERT can add many rows in one statement with several VALUES lists.",
      "UPDATE or DELETE without WHERE affects every row in the table.",
      "RETURNING sends back the inserted, updated or deleted rows, including new ids.",
      "psql commits each statement immediately unless you start with BEGIN.",
    ],
    terms: [
      { term: "DML", meaning: "Data Manipulation Language: INSERT, UPDATE, DELETE." },
      { term: "INSERT", meaning: "Adds new rows to a table." },
      { term: "UPDATE", meaning: "Changes column values in existing rows." },
      { term: "DELETE", meaning: "Removes rows from a table." },
      { term: "RETURNING", meaning: "Postgres clause that outputs the affected rows." },
    ],
    example: {
      lang: "sql",
      code: "INSERT INTO products (name, price)\nVALUES ('Pen', 1.50), ('Notebook', 4.00)\nRETURNING id, name;\n\nBEGIN;\nUPDATE products\nSET price = price * 1.10\nWHERE category = 'stationery'\nRETURNING id, name, price;\n-- looks right? COMMIT; otherwise:\nROLLBACK;\n\nDELETE FROM carts WHERE updated_at < now() - interval '90 days';",
    },
    pitfalls: [
      "Running UPDATE without WHERE and changing every row.",
      "Forgetting that autocommit made a mistake permanent instantly.",
      "Inserting without listing column names, which breaks when columns change.",
    ],
    check: [
      { q: "What does RETURNING add to an UPDATE?", a: "It returns the updated rows, so you can see the new values without a separate SELECT." },
      { q: "How can you undo a mistaken DELETE?", a: "Only if you ran it inside a transaction: issue ROLLBACK before COMMIT." },
    ],
  },

  // ───────────────────────── sql-joins ─────────────────────────
  "sql-joins/joins": {
    summary:
      "A join combines rows from two tables using a matching condition, usually a foreign key. The join type decides what happens to rows that have no match: dropped, kept with NULLs, or paired with everything.",
    visuals: [
      {
        type: "compare",
        title: "INNER vs LEFT vs FULL JOIN",
        columns: [
          { title: "INNER JOIN", points: ["Only rows with a match on both sides", "Unmatched customers disappear", "Most common join"] },
          { title: "LEFT JOIN", points: ["Every left row is kept", "No match: right columns are NULL", "Find missing: WHERE right.id IS NULL"] },
          { title: "FULL OUTER JOIN", points: ["All rows from both sides", "NULLs fill either side", "Good for reconciling lists"] },
        ],
      },
    ],
    keyPoints: [
      "Join on keys: JOIN orders o ON o.customer_id = c.id.",
      "One-to-many joins repeat the \"one\" side once per matching row.",
      "A WHERE filter on the right table of a LEFT JOIN turns it into an inner join.",
      "A self join joins a table to itself with two aliases, e.g. employee and manager.",
      "CROSS JOIN pairs every row with every row: rows multiply.",
    ],
    terms: [
      { term: "Join condition", meaning: "The ON expression that decides which rows pair up." },
      { term: "INNER JOIN", meaning: "Keeps only matched pairs." },
      { term: "LEFT JOIN", meaning: "Keeps all left rows, NULLs where unmatched." },
      { term: "Self join", meaning: "Joining a table to itself under different aliases." },
      { term: "CROSS JOIN", meaning: "Cartesian product of two tables." },
    ],
    example: {
      lang: "sql",
      code: "-- customers with no orders\nSELECT c.id, c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nWHERE o.id IS NULL;\n\n-- employees and their managers (self join)\nSELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id;",
    },
    pitfalls: [
      "Putting a right-table filter in WHERE instead of ON in a LEFT JOIN.",
      "Joining two one-to-many tables at once and double-counting totals.",
      "Forgetting the ON condition, accidentally creating a huge cross join.",
    ],
    check: [
      { q: "Why might a customer disappear from an INNER JOIN with orders?", a: "They have no orders, so there is no matching row and INNER JOIN drops them." },
      { q: "How do you find rows in A with no match in B?", a: "LEFT JOIN B and keep rows where a B key IS NULL, or use NOT EXISTS." },
    ],
  },

  "sql-joins/group-by": {
    summary:
      "Aggregates such as COUNT, SUM and AVG collapse many rows into one value. GROUP BY makes one result row per group, and HAVING filters those groups after the aggregates are computed.",
    visuals: [
      {
        type: "flow",
        title: "Query execution order",
        steps: [
          { label: "FROM / JOIN", detail: "Build the combined set of rows" },
          { label: "WHERE", detail: "Filter individual rows" },
          { label: "GROUP BY", detail: "Bucket rows sharing the same key" },
          { label: "HAVING", detail: "Filter whole groups by aggregate values" },
          { label: "SELECT", detail: "Compute output columns and aggregates" },
          { label: "ORDER BY", detail: "Sort the final rows" },
          { label: "LIMIT", detail: "Keep the first N" },
        ],
      },
    ],
    keyPoints: [
      "Every selected column must be in GROUP BY or inside an aggregate.",
      "WHERE filters rows before grouping; HAVING filters groups after.",
      "COUNT(*) counts rows; COUNT(col) counts non-NULL values.",
      "COUNT(DISTINCT col) counts unique values per group.",
    ],
    terms: [
      { term: "Aggregate function", meaning: "Combines many values into one: COUNT, SUM, AVG, MIN, MAX." },
      { term: "GROUP BY", meaning: "Splits rows into groups sharing column values." },
      { term: "HAVING", meaning: "Filter applied to groups after aggregation." },
      { term: "Grain", meaning: "What one result row represents, e.g. one per customer." },
    ],
    example: {
      lang: "sql",
      code: "SELECT\n  customer_id,\n  COUNT(*)            AS orders,\n  SUM(total)          AS revenue,\n  ROUND(AVG(total), 2) AS avg_order\nFROM orders\nWHERE status = 'paid'\nGROUP BY customer_id\nHAVING SUM(total) > 500\nORDER BY revenue DESC\nLIMIT 10;",
    },
    pitfalls: [
      "Putting an aggregate condition in WHERE, which is an error.",
      "Selecting a column that is neither grouped nor aggregated.",
      "Summing after a one-to-many join and counting values twice.",
    ],
    check: [
      { q: "What is the difference between WHERE and HAVING?", a: "WHERE filters rows before grouping; HAVING filters groups after aggregates are computed." },
      { q: "Why might COUNT(email) be lower than COUNT(*)?", a: "COUNT(email) ignores rows where email is NULL; COUNT(*) counts every row." },
    ],
  },

  "sql-joins/set-ops": {
    summary:
      "Set operations stack or compare the results of two queries with the same number of compatible columns. UNION combines, INTERSECT keeps common rows, EXCEPT keeps rows from the first not in the second.",
    visuals: [
      {
        type: "compare",
        title: "Combining two result sets A and B",
        columns: [
          { title: "UNION / UNION ALL", points: ["Rows in A or B", "UNION removes duplicates", "UNION ALL keeps all, faster"] },
          { title: "INTERSECT", points: ["Rows in both A and B", "Duplicates removed", "Like an AND across queries"] },
          { title: "EXCEPT", points: ["Rows in A but not B", "Order of queries matters", "Great for finding gaps"] },
        ],
      },
    ],
    keyPoints: [
      "Both queries need the same column count and compatible types.",
      "Column names come from the first query.",
      "Prefer UNION ALL unless you really need duplicates removed.",
      "DISTINCT removes duplicate rows from a single query's output.",
    ],
    terms: [
      { term: "UNION", meaning: "Combine results, removing duplicate rows." },
      { term: "UNION ALL", meaning: "Combine results, keeping every row." },
      { term: "INTERSECT", meaning: "Rows present in both results." },
      { term: "EXCEPT", meaning: "Rows in the first result but not the second." },
      { term: "DISTINCT", meaning: "Removes duplicate rows from output." },
    ],
    example: {
      lang: "sql",
      code: "-- everyone to email: customers and newsletter subscribers\nSELECT email FROM customers\nUNION\nSELECT email FROM subscribers;\n\n-- subscribers who never bought anything\nSELECT email FROM subscribers\nEXCEPT\nSELECT email FROM customers;\n\nSELECT DISTINCT country FROM customers ORDER BY country;",
    },
    pitfalls: [
      "Using UNION when UNION ALL is meant, paying for an unneeded sort or hash.",
      "Mismatched column order, so values land under the wrong heading.",
      "Using DISTINCT to hide duplicate rows caused by a bad join.",
    ],
    check: [
      { q: "What is the difference between UNION and UNION ALL?", a: "UNION removes duplicate rows; UNION ALL keeps them all and is cheaper." },
      { q: "Does A EXCEPT B equal B EXCEPT A?", a: "No. EXCEPT returns rows from the first query that are missing from the second." },
    ],
  },

  "sql-joins/join-practice": {
    summary:
      "Reporting queries turn business questions into SQL. Practise the same routine on a sample schema until joins, grouping and top-N patterns come without looking anything up.",
    visuals: [
      {
        type: "cycle",
        title: "Writing a reporting query",
        steps: [
          { label: "Restate the question", detail: "What does one output row represent?" },
          { label: "Find the tables", detail: "Follow foreign keys between them" },
          { label: "Join & filter", detail: "Start small; check row counts" },
          { label: "Aggregate", detail: "GROUP BY the grain you chose" },
          { label: "Verify", detail: "Spot-check totals against a simpler query" },
        ],
      },
    ],
    keyPoints: [
      "Decide the grain first: per day, per customer, per product?",
      "Build queries step by step and run each step.",
      "Top-N per group needs a window function or LATERAL join, not just LIMIT.",
      "Cross-check totals: the sum of parts should equal the whole.",
    ],
    terms: [
      { term: "Sample schema", meaning: "Practice database like pgexercises or dvdrental." },
      { term: "Grain", meaning: "What a single row in the result stands for." },
      { term: "Top-N query", meaning: "Returns the N highest or lowest rows." },
      { term: "Fan-out", meaning: "Row multiplication caused by joining one-to-many." },
    ],
    example: {
      lang: "sql",
      code: "-- monthly revenue for 2026\nSELECT date_trunc('month', o.ordered_at) AS month,\n       SUM(oi.qty * oi.unit_price)     AS revenue\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nWHERE o.ordered_at >= '2026-01-01' AND o.ordered_at < '2027-01-01'\nGROUP BY month\nORDER BY month;",
    },
    pitfalls: [
      "Writing the whole query at once and not knowing which part is wrong.",
      "Using BETWEEN with timestamps and missing the last day's times.",
      "Not checking for duplicated rows after a join.",
    ],
    check: [
      { q: "Why decide the grain before writing a report?", a: "It tells you what to GROUP BY and prevents mixing per-order and per-item values." },
      { q: "Why is ordered_at < '2027-01-01' safer than BETWEEN ... AND '2026-12-31'?", a: "BETWEEN would stop at midnight on Dec 31 and miss later times that day." },
    ],
  },

  // ───────────────────────── sql-advanced ─────────────────────────
  "sql-advanced/subqueries-ctes": {
    summary:
      "A subquery is a query inside another query. CTEs (WITH clauses) name those steps so complex logic reads top to bottom, and recursive CTEs repeat a step to walk hierarchies like org charts or category trees.",
    visuals: [
      {
        type: "flow",
        title: "A query built from CTEs",
        steps: [
          { label: "WITH paid AS (...)", detail: "Step 1: filter paid orders" },
          { label: "totals AS (...)", detail: "Step 2: sum per customer from paid" },
          { label: "ranked AS (...)", detail: "Step 3: rank customers by total" },
          { label: "Final SELECT", detail: "Read from the last step" },
        ],
      },
      {
        type: "cycle",
        title: "How a recursive CTE runs",
        steps: [
          { label: "Anchor query", detail: "Start rows, e.g. the CEO" },
          { label: "Recursive step", detail: "Join previous rows to their children" },
          { label: "Append new rows", detail: "Add them to the result" },
          { label: "Repeat until empty", detail: "Stops when a step finds no new rows" },
        ],
      },
    ],
    keyPoints: [
      "A scalar subquery returns one value; it can appear in SELECT or WHERE.",
      "A correlated subquery refers to the outer row and runs per row logically.",
      "EXISTS stops at the first match and handles NULLs safely.",
      "WITH RECURSIVE needs an anchor, UNION ALL, and a step that eventually finds nothing.",
    ],
    terms: [
      { term: "Subquery", meaning: "A SELECT nested inside another statement." },
      { term: "Correlated subquery", meaning: "Subquery that uses a column from the outer query." },
      { term: "CTE", meaning: "Common Table Expression: a named query defined with WITH." },
      { term: "EXISTS", meaning: "True if the subquery returns at least one row." },
      { term: "Recursive CTE", meaning: "CTE that references itself to walk hierarchies." },
    ],
    example: {
      lang: "sql",
      code: "WITH RECURSIVE chain AS (\n  SELECT id, name, manager_id, 1 AS depth\n  FROM employees\n  WHERE manager_id IS NULL            -- anchor: the CEO\n  UNION ALL\n  SELECT e.id, e.name, e.manager_id, c.depth + 1\n  FROM employees e\n  JOIN chain c ON e.manager_id = c.id -- recursive step\n)\nSELECT repeat('  ', depth - 1) || name AS org_chart\nFROM chain\nORDER BY depth, name;",
    },
    pitfalls: [
      "Recursive CTEs that never stop because data contains a cycle.",
      "NOT IN with a subquery that can return NULL, which returns no rows.",
      "Deeply nested subqueries where a few named CTEs would be clearer.",
    ],
    check: [
      { q: "What two parts does a recursive CTE need?", a: "An anchor query for the starting rows and a recursive query joined to the CTE itself, combined with UNION ALL." },
      { q: "Why prefer NOT EXISTS over NOT IN with subqueries?", a: "If the subquery returns any NULL, NOT IN yields no rows; NOT EXISTS behaves as expected." },
    ],
  },

  "sql-advanced/window-functions": {
    summary:
      "Window functions compute values across related rows without collapsing them. Each row keeps its identity but gains a rank, running total or previous value from its window, defined with OVER and PARTITION BY.",
    visuals: [
      {
        type: "compare",
        title: "GROUP BY vs window function",
        columns: [
          { title: "GROUP BY", points: ["One row per group", "Detail rows are collapsed", "SUM(total) per customer"] },
          { title: "OVER (PARTITION BY ...)", points: ["Every row is kept", "Adds a value from the window", "Each order shows its customer's SUM"] },
        ],
      },
      {
        type: "flow",
        title: "How a window is defined",
        steps: [
          { label: "PARTITION BY", detail: "Split rows into independent groups" },
          { label: "ORDER BY", detail: "Order rows within each partition" },
          { label: "Frame", detail: "Which nearby rows count, e.g. 6 preceding" },
          { label: "Function", detail: "ROW_NUMBER, SUM, LAG... computed per row" },
        ],
      },
    ],
    keyPoints: [
      "ROW_NUMBER gives unique numbers; RANK leaves gaps after ties; DENSE_RANK does not.",
      "SUM(x) OVER (ORDER BY day) gives a running total.",
      "LAG(x) reads the previous row's value; LEAD(x) reads the next one.",
      "Window functions cannot go in WHERE; filter them in an outer query or CTE.",
    ],
    terms: [
      { term: "Window function", meaning: "Function computed over a set of rows related to the current row." },
      { term: "OVER", meaning: "Clause that turns a function into a window function." },
      { term: "PARTITION BY", meaning: "Divides rows into separate windows." },
      { term: "Frame", meaning: "The subset of partition rows used, like ROWS 6 PRECEDING." },
      { term: "LAG / LEAD", meaning: "Value from a previous / following row." },
    ],
    example: {
      lang: "sql",
      code: "SELECT\n  day,\n  revenue,\n  SUM(revenue) OVER (ORDER BY day)                AS running_total,\n  revenue - LAG(revenue) OVER (ORDER BY day)      AS change_vs_prev,\n  AVG(revenue) OVER (ORDER BY day\n       ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)  AS avg_7d\nFROM daily_sales;\n\n-- top 3 products per category\nSELECT * FROM (\n  SELECT p.*, ROW_NUMBER() OVER (PARTITION BY category ORDER BY sales DESC) AS rn\n  FROM products p\n) t\nWHERE rn <= 3;",
    },
    pitfalls: [
      "Trying to use a window function in WHERE.",
      "Default frame with ORDER BY includes tied rows, surprising running totals.",
      "Forgetting PARTITION BY, so ranks span the whole table.",
    ],
    check: [
      { q: "How does a window function differ from GROUP BY?", a: "It adds a computed value to each row instead of collapsing rows into one per group." },
      { q: "How do you get the top 3 rows per category?", a: "Compute ROW_NUMBER() OVER (PARTITION BY category ORDER BY ...) in a subquery, then filter rn <= 3." },
    ],
  },

  "sql-advanced/json": {
    summary:
      "JSONB stores JSON documents in a binary form that Postgres can query and index. It suits flexible attributes that vary per row, while array columns hold simple lists of values.",
    visuals: [
      {
        type: "tree",
        title: "Working with JSONB",
        root: "attrs JSONB column",
        children: [
          { label: "Extract", children: ["-> returns jsonb", "->> returns text", "#>> takes a path"] },
          { label: "Test", children: ["@> contains", "? has key"] },
          { label: "Index", children: ["GIN (jsonb_ops)", "GIN (jsonb_path_ops)"] },
          { label: "Arrays", children: ["text[] column", "ANY(tags)", "@> ARRAY['a']"] },
        ],
      },
      {
        type: "compare",
        title: "json vs jsonb",
        columns: [
          { title: "json", points: ["Stored as exact text", "Keeps whitespace, key order", "Re-parsed on every use", "No GIN indexing"] },
          { title: "jsonb", points: ["Stored parsed and binary", "Duplicate keys removed", "Faster to query", "Indexable with GIN"] },
        ],
      },
    ],
    keyPoints: [
      "Use ->> when comparing to text or casting: (attrs->>'price')::numeric.",
      "attrs @> '{\"color\": \"red\"}' finds rows containing that key and value.",
      "A GIN index makes @> and key-existence queries fast.",
      "Put fields you filter and join on constantly into real columns.",
    ],
    terms: [
      { term: "JSONB", meaning: "Binary, indexable JSON type in Postgres." },
      { term: "->", meaning: "Gets a JSON field as jsonb." },
      { term: "->>", meaning: "Gets a JSON field as text." },
      { term: "@>", meaning: "Containment: left value contains the right value." },
      { term: "GIN index", meaning: "Inverted index for values with many parts, like JSONB keys." },
    ],
    example: {
      lang: "sql",
      code: "CREATE TABLE products (\n  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  name  text NOT NULL,\n  attrs jsonb NOT NULL DEFAULT '{}',\n  tags  text[] NOT NULL DEFAULT '{}'\n);\nCREATE INDEX ON products USING gin (attrs);\n\nSELECT name, attrs->>'color' AS color, (attrs->>'weight_kg')::numeric AS kg\nFROM products\nWHERE attrs @> '{\"brand\": \"Acme\"}'\n  AND 'sale' = ANY(tags);",
    },
    pitfalls: [
      "Comparing -> output (jsonb) to plain text and getting type errors.",
      "Putting everything in JSONB, losing types, constraints and foreign keys.",
      "Expecting a B-tree index on the column to speed up @> queries.",
    ],
    check: [
      { q: "What is the difference between -> and ->>?", a: "-> returns the value as jsonb; ->> returns it as text." },
      { q: "Which index type speeds up @> containment on JSONB?", a: "A GIN index on the jsonb column." },
    ],
  },

  "sql-advanced/upsert-views": {
    summary:
      "An upsert inserts a row or updates it if it already exists, in one atomic statement. Views save a query under a name; materialised views also store its results so expensive reports read instantly.",
    visuals: [
      {
        type: "flow",
        title: "INSERT ... ON CONFLICT",
        steps: [
          { label: "Try the insert", detail: "New row for sku 'A1'" },
          { label: "Unique key clash?", detail: "Needs a unique index or constraint on sku" },
          { label: "No clash: insert", detail: "Row is added as usual" },
          { label: "Clash: DO UPDATE", detail: "EXCLUDED holds the values you tried to insert" },
        ],
      },
      {
        type: "compare",
        title: "View vs materialised view",
        columns: [
          { title: "View", points: ["Stores only the query", "Always shows fresh data", "Runs the query each time"] },
          { title: "Materialised view", points: ["Stores the result rows", "Stale until REFRESH", "Fast reads, can be indexed"] },
        ],
      },
    ],
    keyPoints: [
      "ON CONFLICT (col) DO UPDATE SET x = EXCLUDED.x updates the existing row.",
      "ON CONFLICT DO NOTHING silently skips duplicates.",
      "Upserts avoid race conditions that a SELECT-then-INSERT pattern has.",
      "REFRESH MATERIALIZED VIEW CONCURRENTLY avoids blocking readers but needs a unique index.",
    ],
    terms: [
      { term: "Upsert", meaning: "Insert, or update if the row already exists." },
      { term: "ON CONFLICT", meaning: "Clause defining what to do on a unique violation." },
      { term: "EXCLUDED", meaning: "Pseudo-table holding the row proposed for insertion." },
      { term: "View", meaning: "Saved query that behaves like a virtual table." },
      { term: "Materialised view", meaning: "View whose results are stored and refreshed on demand." },
    ],
    example: {
      lang: "sql",
      code: "INSERT INTO inventory (sku, qty)\nVALUES ('A1', 5)\nON CONFLICT (sku)\nDO UPDATE SET qty = inventory.qty + EXCLUDED.qty;\n\nCREATE VIEW active_customers AS\nSELECT * FROM customers WHERE deleted_at IS NULL;\n\nCREATE MATERIALIZED VIEW monthly_sales AS\nSELECT date_trunc('month', ordered_at) AS month, SUM(total) AS revenue\nFROM orders GROUP BY 1;\n\nREFRESH MATERIALIZED VIEW monthly_sales;",
    },
    pitfalls: [
      "ON CONFLICT on columns without a unique index, which raises an error.",
      "Forgetting to refresh a materialised view, so reports show old numbers.",
      "Expecting a plain view to be faster than the query it wraps.",
    ],
    check: [
      { q: "What does EXCLUDED refer to in an upsert?", a: "The row you tried to insert, so you can use its values in DO UPDATE." },
      { q: "When should you use a materialised view instead of a view?", a: "When the query is expensive and slightly stale results are acceptable between refreshes." },
    ],
  },

  // ───────────────────────── schema-design ─────────────────────────
  "schema-design/modelling": {
    summary:
      "Data modelling turns requirements into tables. Nouns become entities (tables), their facts become columns, and relationships become foreign keys, with a join table for many-to-many links.",
    visuals: [
      {
        type: "tree",
        title: "Library schema",
        root: "library database",
        children: [
          { label: "authors", children: ["id PK", "name"] },
          { label: "books", children: ["id PK", "title", "published_year"] },
          { label: "book_authors (join)", children: ["book_id FK", "author_id FK", "PK (book_id, author_id)"] },
          { label: "members", children: ["id PK", "email UNIQUE"] },
          { label: "loans", children: ["id PK", "book_id FK", "member_id FK", "due_on"] },
        ],
      },
    ],
    keyPoints: [
      "One-to-many: put the foreign key on the \"many\" side (loans.member_id).",
      "Many-to-many: add a join table holding both foreign keys.",
      "Each table should describe one kind of thing.",
      "An ER diagram shows tables as boxes and relationships as lines.",
    ],
    terms: [
      { term: "Entity", meaning: "A thing you store data about, becoming a table." },
      { term: "Attribute", meaning: "A fact about an entity, becoming a column." },
      { term: "Foreign key", meaning: "Column referencing a primary key in another table." },
      { term: "Join table", meaning: "Table linking two others for many-to-many." },
      { term: "Cardinality", meaning: "How many rows relate: one-to-one, one-to-many, many-to-many." },
    ],
    example: {
      lang: "sql",
      code: "CREATE TABLE authors (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL);\nCREATE TABLE books   (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title text NOT NULL);\n\nCREATE TABLE book_authors (\n  book_id   bigint REFERENCES books(id)   ON DELETE CASCADE,\n  author_id bigint REFERENCES authors(id) ON DELETE CASCADE,\n  PRIMARY KEY (book_id, author_id)\n);",
    },
    pitfalls: [
      "Storing a comma-separated list of ids in one column instead of a join table.",
      "Columns like author1, author2, author3.",
      "Mixing two different entities in one table.",
    ],
    check: [
      { q: "Where does the foreign key go in a one-to-many relationship?", a: "On the many side, pointing to the one side's primary key." },
      { q: "How do you model students and courses where each has many of the other?", a: "Create a join table like enrolments with student_id and course_id foreign keys." },
    ],
  },

  "schema-design/normalisation": {
    summary:
      "Normalisation removes duplicated facts so each piece of data lives in one place. That prevents update anomalies, where changing a fact in one row leaves stale copies elsewhere. Denormalise only on purpose, for measured speed.",
    visuals: [
      {
        type: "tree",
        title: "The first three normal forms",
        root: "Normal forms",
        children: [
          { label: "1NF", children: ["Atomic values per cell", "No repeating groups or lists"] },
          { label: "2NF", children: ["Is 1NF", "Non-key columns depend on the whole key"] },
          { label: "3NF", children: ["Is 2NF", "No column depends on another non-key column"] },
        ],
      },
      {
        type: "compare",
        title: "Normalised vs denormalised",
        columns: [
          { title: "Normalised", points: ["Each fact stored once", "Updates touch one row", "More joins to read", "Default for app data"] },
          { title: "Denormalised", points: ["Facts copied for speed", "Updates must sync copies", "Fewer joins", "Reports, caches, analytics"] },
        ],
      },
    ],
    keyPoints: [
      "Update anomaly: a customer's city stored on every order goes out of sync.",
      "Insert anomaly: you cannot record a fact without some unrelated data.",
      "3NF rule of thumb: every column describes the key, the whole key, and nothing else.",
      "Justify denormalisation with a measured performance need and a sync plan.",
    ],
    terms: [
      { term: "Normalisation", meaning: "Structuring tables to remove redundant data." },
      { term: "Update anomaly", meaning: "Inconsistency when only some copies of a fact change." },
      { term: "Functional dependency", meaning: "Column A determines column B." },
      { term: "3NF", meaning: "No non-key column depends on another non-key column." },
      { term: "Denormalisation", meaning: "Deliberately duplicating data for faster reads." },
    ],
    example: {
      lang: "sql",
      code: "-- Before: orders(id, customer_name, customer_city, product, price)\n-- customer_city repeats on every order -> update anomaly\n\nCREATE TABLE customers (\n  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  name text NOT NULL,\n  city text\n);\nCREATE TABLE orders (\n  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  customer_id bigint NOT NULL REFERENCES customers(id),\n  ordered_at  timestamptz NOT NULL DEFAULT now()\n);",
    },
    pitfalls: [
      "Copying data \"for speed\" without measuring a real problem.",
      "Over-normalising tiny lookup values into dozens of tables.",
      "Forgetting that a price at order time is a fact worth storing on the order.",
    ],
    check: [
      { q: "What problem does normalisation prevent?", a: "Update, insert and delete anomalies caused by storing the same fact in several places." },
      { q: "When is denormalising reasonable?", a: "When a measured read-performance need outweighs the cost of keeping duplicated data in sync." },
    ],
  },

  "schema-design/types-constraints": {
    summary:
      "Good types and constraints make the database reject bad data instead of hoping every app gets it right. Keys identify rows, foreign keys protect relationships, and CHECK and UNIQUE enforce business rules.",
    visuals: [
      {
        type: "tree",
        title: "Constraints that guard your data",
        root: "Table constraints",
        children: [
          { label: "PRIMARY KEY", children: ["Unique and NOT NULL", "Identity or natural key"] },
          { label: "FOREIGN KEY", children: ["ON DELETE RESTRICT", "ON DELETE CASCADE", "ON DELETE SET NULL"] },
          { label: "UNIQUE", children: ["No duplicate emails"] },
          { label: "CHECK", children: ["price >= 0", "end_at > start_at"] },
          { label: "NOT NULL", children: ["Value is required"] },
        ],
      },
    ],
    keyPoints: [
      "Use numeric for money, timestamptz for moments in time, text for strings.",
      "Surrogate keys (identity columns) never change; natural keys like email can.",
      "ON DELETE CASCADE deletes children too; RESTRICT blocks the delete.",
      "Postgres does not index foreign key columns automatically; add indexes yourself.",
    ],
    terms: [
      { term: "Primary key", meaning: "Column(s) uniquely identifying each row." },
      { term: "Surrogate key", meaning: "Generated id with no business meaning." },
      { term: "Natural key", meaning: "Real-world unique value, like an ISBN." },
      { term: "Foreign key", meaning: "Constraint that a value exists in another table." },
      { term: "CHECK", meaning: "Constraint that a row satisfies a boolean condition." },
      { term: "timestamptz", meaning: "Timestamp stored as an absolute moment in UTC." },
    ],
    example: {
      lang: "sql",
      code: "CREATE TABLE bookings (\n  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  room_id     bigint NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,\n  guest_email text   NOT NULL,\n  price       numeric(10,2) NOT NULL CHECK (price >= 0),\n  start_at    timestamptz NOT NULL,\n  end_at      timestamptz NOT NULL,\n  CHECK (end_at > start_at),\n  UNIQUE (room_id, start_at)\n);\nCREATE INDEX ON bookings (room_id);",
    },
    pitfalls: [
      "Storing money in float, which causes rounding errors.",
      "Using timestamp without time zone for events from many time zones.",
      "Relying only on app validation, so a script inserts bad data.",
    ],
    check: [
      { q: "What does ON DELETE CASCADE do?", a: "Deleting a parent row also deletes the child rows that reference it." },
      { q: "Why use numeric rather than float for prices?", a: "numeric stores exact decimals; float is approximate and can produce rounding errors." },
    ],
  },

  "schema-design/migrations": {
    summary:
      "Migrations are versioned scripts that change the schema step by step, stored in Git and applied the same way everywhere. Zero-downtime changes split risky edits into small, backward-compatible steps.",
    visuals: [
      {
        type: "flow",
        title: "Expand and contract: rename a column safely",
        steps: [
          { label: "Add new column", detail: "Nullable, so the change is instant" },
          { label: "Write both", detail: "Deploy code that writes old and new" },
          { label: "Backfill in batches", detail: "Copy old values a few thousand rows at a time" },
          { label: "Read the new column", detail: "Switch code; add NOT NULL when filled" },
          { label: "Drop old column", detail: "Only after nothing uses it" },
        ],
      },
    ],
    keyPoints: [
      "Every schema change is a numbered migration file, never a manual edit.",
      "Write a down migration, or a clear rollback plan, for each change.",
      "CREATE INDEX CONCURRENTLY builds an index without blocking writes.",
      "Big UPDATEs lock many rows; backfill in batches instead.",
    ],
    terms: [
      { term: "Migration", meaning: "Versioned script that changes the database schema." },
      { term: "Up / down", meaning: "Apply a change / reverse it." },
      { term: "Backfill", meaning: "Fill a new column with values for existing rows." },
      { term: "Expand-contract", meaning: "Add new structure, migrate, then remove the old." },
      { term: "DDL", meaning: "Data Definition Language: CREATE, ALTER, DROP." },
    ],
    example: {
      lang: "sql",
      code: "-- 0007_add_full_name.up.sql\nALTER TABLE users ADD COLUMN full_name text;\n\n-- backfill in batches (repeat until 0 rows updated)\nUPDATE users SET full_name = first_name || ' ' || last_name\nWHERE id IN (\n  SELECT id FROM users WHERE full_name IS NULL LIMIT 5000\n);\n\nCREATE INDEX CONCURRENTLY users_full_name_idx ON users (full_name);\n\n-- 0007_add_full_name.down.sql\nALTER TABLE users DROP COLUMN full_name;",
    },
    pitfalls: [
      "Editing a migration that has already run in production.",
      "Renaming or dropping a column that running code still reads.",
      "Running CREATE INDEX CONCURRENTLY inside a transaction block, which fails.",
    ],
    check: [
      { q: "Why add a new column as nullable first?", a: "It is a quick metadata change; existing rows can be backfilled later without long locks." },
      { q: "Why backfill in batches?", a: "Small batches keep locks and transaction size short, so normal traffic continues." },
    ],
  },

  // ───────────────────────── performance ─────────────────────────
  "performance/btree": {
    summary:
      "A B-tree index is a sorted, balanced tree of key values pointing to table rows. Postgres can walk from the root to the right leaf in a few page reads instead of scanning the whole table, and read leaves in order for sorting.",
    analogy: "Like a book index: jump to \"Postgres, page 214\" instead of reading every page.",
    visuals: [
      {
        type: "tree",
        title: "B-tree on customers.id",
        root: "Root page: <500 | >=500",
        children: [
          { label: "Branch: 1–499", children: ["Leaf: 1–120", "Leaf: 121–260", "Leaf: 261–499"] },
          { label: "Branch: 500–999", children: ["Leaf: 500–700", "Leaf: 701–999"] },
        ],
      },
      {
        type: "compare",
        title: "Index on (last_name, first_name)",
        columns: [
          { title: "Can use it well", points: ["WHERE last_name = 'Lee'", "last_name = 'Lee' AND first_name = 'Al'", "ORDER BY last_name, first_name", "last_name LIKE 'Le%' (with C collation)"] },
          { title: "Usually cannot", points: ["WHERE first_name = 'Al' only", "WHERE lower(last_name) = 'lee'", "last_name LIKE '%ee'", "ORDER BY first_name"] },
        ],
      },
    ],
    keyPoints: [
      "Lookups cost about log(n) page reads, even for millions of rows.",
      "Leaves are linked in sorted order, so ranges and ORDER BY are cheap.",
      "A function on the column, like lower(col), hides it from a plain index.",
      "Index-only scans answer from the index alone when all needed columns are in it.",
      "Every index slows writes slightly and uses disk space.",
    ],
    terms: [
      { term: "B-tree", meaning: "Balanced sorted tree; Postgres's default index type." },
      { term: "Leaf page", meaning: "Bottom level holding keys and row pointers." },
      { term: "Index scan", meaning: "Walk the index, then fetch matching rows from the table." },
      { term: "Index-only scan", meaning: "Answer the query from the index without visiting the table." },
      { term: "Selectivity", meaning: "Fraction of rows a condition matches; lower is better for indexes." },
    ],
    example: {
      lang: "sql",
      code: "CREATE INDEX customers_name_idx ON customers (last_name, first_name);\n\n-- uses the index (leading column filtered)\nSELECT * FROM customers WHERE last_name = 'Lee' ORDER BY first_name;\n\n-- index-only scan possible: every needed column is in the index\nSELECT last_name, first_name FROM customers WHERE last_name = 'Lee';\n\n-- plain index not used: wrapped in a function\nSELECT * FROM customers WHERE lower(last_name) = 'lee';",
    },
    pitfalls: [
      "Indexing every column \"just in case\", slowing down every write.",
      "Expecting an index to help when a query matches most of the table.",
      "Putting the low-selectivity column first in a composite index without reason.",
    ],
    check: [
      { q: "Why can a B-tree index speed up ORDER BY?", a: "Its leaves are already sorted, so Postgres can read rows in order without a separate sort." },
      { q: "Why might WHERE lower(email) = 'x' ignore an index on email?", a: "The index stores email, not lower(email); you need an expression index on lower(email)." },
    ],
  },

  "performance/explain": {
    summary:
      "EXPLAIN shows the plan Postgres chose for a query: a tree of scan and join steps with cost estimates. EXPLAIN ANALYZE actually runs it and adds real row counts and timings, revealing where time goes.",
    visuals: [
      {
        type: "tree",
        title: "A plan is a tree (read inside out)",
        root: "Hash Join on customer_id",
        children: [
          { label: "Seq Scan on orders", children: ["Filter: status = 'paid'", "Outer input, streamed"] },
          { label: "Hash", children: ["Built from Seq Scan on customers", "Inner input, loaded first"] },
        ],
      },
      {
        type: "flow",
        title: "Reading EXPLAIN ANALYZE",
        steps: [
          { label: "Run with ANALYZE, BUFFERS", detail: "Real times, rows and pages read" },
          { label: "Start at the deepest nodes", detail: "Children run first and feed parents" },
          { label: "Compare rows", detail: "Estimated vs actual: big gaps mean bad stats" },
          { label: "Find the slow node", detail: "Largest actual time times loops" },
          { label: "Fix & re-run", detail: "Index, rewrite, or ANALYZE the table" },
        ],
      },
    ],
    keyPoints: [
      "Seq Scan reads the whole table; fine for small tables, costly for big filtered ones.",
      "Cost numbers are relative estimates, not milliseconds.",
      "actual time is per loop; multiply by loops for the node's total.",
      "Wildly wrong row estimates often mean stale statistics; run ANALYZE.",
    ],
    terms: [
      { term: "Query plan", meaning: "The steps Postgres will take to run a query." },
      { term: "Seq Scan", meaning: "Reads every row of a table." },
      { term: "Index Scan", meaning: "Uses an index to find rows, then fetches them." },
      { term: "Nested Loop / Hash Join", meaning: "Two common strategies for joining tables." },
      { term: "Planner statistics", meaning: "Column data summaries used to estimate row counts." },
    ],
    example: {
      lang: "sql",
      code: "EXPLAIN (ANALYZE, BUFFERS)\nSELECT c.name, SUM(o.total) AS total\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.status = 'paid'\nGROUP BY c.name\nORDER BY total DESC;\n\n-- Safely analyse a write: it really runs, so roll it back\nBEGIN;\nEXPLAIN ANALYZE UPDATE orders SET status = 'void' WHERE id = 1;\nROLLBACK;",
    },
    pitfalls: [
      "Running EXPLAIN ANALYZE on DELETE or UPDATE outside a transaction — it really executes.",
      "Treating cost units as milliseconds.",
      "Tuning on a tiny dev database whose plans differ from production.",
    ],
    check: [
      { q: "What is the difference between EXPLAIN and EXPLAIN ANALYZE?", a: "EXPLAIN only shows the estimated plan; EXPLAIN ANALYZE executes the query and reports actual rows and times." },
      { q: "What does a big gap between estimated and actual rows suggest?", a: "The planner's statistics are off, so it may choose a poor plan; try ANALYZE or better indexes." },
    ],
  },

  "performance/index-types": {
    summary:
      "Beyond plain B-trees, Postgres offers composite, partial and expression indexes to match specific queries, and other index types: GIN for JSONB, arrays and full-text search, and BRIN for huge, naturally ordered tables.",
    visuals: [
      {
        type: "compare",
        title: "B-tree vs GIN vs BRIN",
        columns: [
          { title: "B-tree", points: ["Default, sorted keys", "=, <, >, BETWEEN, ORDER BY", "Medium size", "Most columns"] },
          { title: "GIN", points: ["Inverted index of elements", "JSONB @>, arrays, full text", "Larger, slower to update", "Many values per row"] },
          { title: "BRIN", points: ["Min/max per block range", "Tiny index", "Needs physically ordered data", "Huge append-only time series"] },
        ],
      },
    ],
    keyPoints: [
      "Composite index column order: equality columns first, then range or sort columns.",
      "Partial index: WHERE status = 'pending' indexes only the rows you query.",
      "Expression index: ON users (lower(email)) serves WHERE lower(email) = ...",
      "Hash indexes support only equality; B-tree is usually just as good.",
    ],
    terms: [
      { term: "Composite index", meaning: "Index on several columns in a set order." },
      { term: "Partial index", meaning: "Index covering only rows matching a WHERE." },
      { term: "Expression index", meaning: "Index on the result of an expression or function." },
      { term: "GIN", meaning: "Generalised Inverted Index for multi-valued data." },
      { term: "BRIN", meaning: "Block Range Index storing summaries per range of pages." },
    ],
    example: {
      lang: "sql",
      code: "-- WHERE customer_id = ? ORDER BY created_at DESC\nCREATE INDEX ON orders (customer_id, created_at DESC);\n\n-- only the small set of rows the job queue reads\nCREATE INDEX ON jobs (run_at) WHERE status = 'pending';\n\n-- case-insensitive email lookup\nCREATE UNIQUE INDEX ON users (lower(email));\n\nCREATE INDEX ON products USING gin (attrs);\nCREATE INDEX ON events USING brin (created_at);",
    },
    pitfalls: [
      "Composite index with the range column first, so the equality filter cannot narrow it.",
      "Partial index whose WHERE does not match the query's condition exactly.",
      "BRIN on randomly ordered data, where every range overlaps and nothing is skipped.",
    ],
    check: [
      { q: "When is BRIN a good choice?", a: "On very large tables where the column follows physical order, like timestamps in append-only logs." },
      { q: "How do you index a case-insensitive email lookup?", a: "Create an expression index on lower(email) and query with WHERE lower(email) = ..." },
    ],
  },

  "performance/query-tuning": {
    summary:
      "Most slow apps suffer from a few slow queries or from too many small ones. Measure first, rewrite or index the worst query, and replace N+1 patterns, where code runs one query per item, with a single batched query.",
    visuals: [
      {
        type: "sequence",
        title: "The N+1 problem",
        actors: ["App", "Postgres"],
        messages: [
          { from: 0, to: 1, label: "SELECT * FROM orders LIMIT 100" },
          { from: 1, to: 0, label: "100 orders" },
          { from: 0, to: 1, label: "SELECT * FROM customers WHERE id = 7" },
          { from: 0, to: 1, label: "SELECT * FROM customers WHERE id = 9" },
          { from: 0, to: 1, label: "...98 more round trips" },
          { from: 0, to: 1, label: "Fix: WHERE id = ANY($1) or a JOIN" },
        ],
      },
      {
        type: "cycle",
        title: "Tuning loop",
        steps: [
          { label: "Measure", detail: "Find the costliest query by total time" },
          { label: "Explain", detail: "EXPLAIN ANALYZE to locate the slow node" },
          { label: "Change one thing", detail: "Index, rewrite or batch" },
          { label: "Re-measure", detail: "Keep it only if it really helped" },
        ],
      },
    ],
    keyPoints: [
      "Each round trip adds network latency; 100 tiny queries can beat one slow query for slowness.",
      "ORMs cause N+1 when lazy-loading related rows in a loop; use eager loading.",
      "Fetch related rows in one query with a JOIN or WHERE id = ANY(array).",
      "Change one thing at a time and compare plans before and after.",
    ],
    terms: [
      { term: "N+1 query", meaning: "One query for a list, then one more per item." },
      { term: "Round trip", meaning: "One request and response between app and database." },
      { term: "Batching", meaning: "Combining many small operations into one." },
      { term: "Eager loading", meaning: "ORM fetching related data up front in few queries." },
      { term: "Sargable", meaning: "A condition written so an index can be used." },
    ],
    example: {
      lang: "sql",
      code: "-- slow: function on the column prevents index use\nSELECT * FROM orders WHERE date(created_at) = '2026-03-01';\n\n-- fast: range on the raw column can use an index\nSELECT * FROM orders\nWHERE created_at >= '2026-03-01' AND created_at < '2026-03-02';\n\n-- batch instead of N+1: one query for all customers\nSELECT id, name FROM customers WHERE id = ANY('{7,9,12}'::bigint[]);",
    },
    pitfalls: [
      "Optimising by guesswork without measuring.",
      "Fixing N+1 with a cache instead of a better query.",
      "Changing several things at once and not knowing which helped.",
    ],
    check: [
      { q: "What is an N+1 query pattern?", a: "Running one query to get a list and then one extra query per item, instead of one batched query." },
      { q: "Why rewrite date(created_at) = X as a range?", a: "A range on the raw column can use an index on created_at; the function call cannot." },
    ],
  },

  // ───────────────────────── transactions ─────────────────────────
  "transactions/acid": {
    summary:
      "A transaction groups several statements into one all-or-nothing unit. Either every change is committed together or none are, so a transfer can never take money from one account without adding it to the other.",
    visuals: [
      {
        type: "cycle",
        title: "Transaction lifecycle",
        steps: [
          { label: "BEGIN", detail: "Open a transaction" },
          { label: "Run statements", detail: "Changes are visible only to this session" },
          { label: "SAVEPOINT (optional)", detail: "Mark a point you can roll back to" },
          { label: "COMMIT or ROLLBACK", detail: "Make all changes durable, or discard them" },
          { label: "Next transaction", detail: "The session is ready to BEGIN again" },
        ],
      },
      {
        type: "tree",
        title: "ACID",
        root: "ACID guarantees",
        children: [
          { label: "Atomicity", children: ["All or nothing"] },
          { label: "Consistency", children: ["Constraints hold after commit"] },
          { label: "Isolation", children: ["Concurrent work does not interfere"] },
          { label: "Durability", children: ["Committed data survives a crash (WAL)"] },
        ],
      },
    ],
    keyPoints: [
      "Without BEGIN, each statement is its own auto-committed transaction.",
      "An error inside a transaction aborts it; you must ROLLBACK before continuing.",
      "ROLLBACK TO SAVEPOINT undoes part of the work and keeps the rest.",
      "COMMIT returns only after the change is safely written to the WAL.",
    ],
    terms: [
      { term: "Transaction", meaning: "Group of statements that succeed or fail together." },
      { term: "COMMIT", meaning: "Make the transaction's changes permanent and visible." },
      { term: "ROLLBACK", meaning: "Discard all changes since BEGIN." },
      { term: "Savepoint", meaning: "Named point inside a transaction for partial rollback." },
      { term: "WAL", meaning: "Write-ahead log that makes commits durable." },
    ],
    example: {
      lang: "sql",
      code: "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\n\nSAVEPOINT before_fee;\nINSERT INTO fees (account_id, amount) VALUES (1, 2.50);\n-- fee rule was wrong: undo just the fee\nROLLBACK TO SAVEPOINT before_fee;\n\nCOMMIT;  -- the transfer is saved, the fee is not",
    },
    pitfalls: [
      "Forgetting BEGIN, so the first UPDATE commits on its own.",
      "Leaving transactions open while waiting on users or network calls.",
      "Ignoring the \"current transaction is aborted\" error and continuing.",
    ],
    check: [
      { q: "What does atomicity guarantee?", a: "That all statements in a transaction take effect together, or none do." },
      { q: "What is a savepoint for?", a: "Rolling back part of a transaction without discarding the work done before it." },
    ],
  },

  "transactions/isolation": {
    summary:
      "MVCC lets readers and writers work at the same time: every transaction sees a snapshot, and updates create new row versions instead of overwriting. Isolation levels decide how fresh that snapshot is and which anomalies can occur.",
    visuals: [
      {
        type: "sequence",
        title: "Read Committed: a non-repeatable read",
        actors: ["Session A", "Postgres", "Session B"],
        messages: [
          { from: 0, to: 1, label: "BEGIN; SELECT stock → 10" },
          { from: 2, to: 1, label: "UPDATE stock = 4; COMMIT" },
          { from: 0, to: 1, label: "SELECT stock again" },
          { from: 1, to: 0, label: "4 (new snapshot per statement)" },
          { from: 0, to: 1, label: "Under Repeatable Read: still 10" },
        ],
      },
      {
        type: "compare",
        title: "Postgres isolation levels",
        columns: [
          { title: "Read Committed (default)", points: ["New snapshot per statement", "No dirty reads", "Values can change mid-transaction"] },
          { title: "Repeatable Read", points: ["One snapshot per transaction", "Stable reads, no phantoms", "Conflicting update: error, retry"] },
          { title: "Serializable", points: ["As if run one at a time", "Prevents write skew", "Must retry on serialization failure"] },
        ],
      },
    ],
    keyPoints: [
      "Readers never block writers and writers never block readers under MVCC.",
      "Postgres never shows uncommitted data, at any isolation level.",
      "Repeatable Read and Serializable can fail with error 40001; the app must retry.",
      "Set the level per transaction: BEGIN ISOLATION LEVEL SERIALIZABLE.",
    ],
    terms: [
      { term: "MVCC", meaning: "Multi-Version Concurrency Control: readers see consistent row versions." },
      { term: "Snapshot", meaning: "The set of committed data a statement or transaction can see." },
      { term: "Non-repeatable read", meaning: "Same row read twice returns different values." },
      { term: "Phantom read", meaning: "Same query returns new rows on a second run." },
      { term: "Write skew", meaning: "Two transactions each read, then write, breaking a shared rule." },
      { term: "Serialization failure", meaning: "Error asking you to retry a conflicting transaction." },
    ],
    example: {
      lang: "sql",
      code: "-- Session A\nBEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT stock FROM products WHERE id = 1;  -- 10\n\n-- Session B (meanwhile)\nUPDATE products SET stock = 4 WHERE id = 1;  -- autocommits\n\n-- Session A\nSELECT stock FROM products WHERE id = 1;  -- still 10 (same snapshot)\nUPDATE products SET stock = stock - 1 WHERE id = 1;\n-- ERROR: could not serialize access due to concurrent update\nROLLBACK;  -- then retry the whole transaction",
    },
    pitfalls: [
      "Using Serializable without retry logic in the application.",
      "Assuming Read Committed values stay the same during a transaction.",
      "Holding long transactions that keep old row versions alive.",
    ],
    check: [
      { q: "What is Postgres's default isolation level?", a: "Read Committed, where each statement sees data committed before it began." },
      { q: "What must the app do when a serializable transaction fails?", a: "Roll back and retry the whole transaction from the beginning." },
      { q: "Why don't readers block writers in Postgres?", a: "MVCC keeps old row versions, so readers see their snapshot while writers create new versions." },
    ],
  },

  "transactions/locking": {
    summary:
      "Row locks stop two transactions from changing the same row at once. SELECT ... FOR UPDATE locks rows you plan to change, preventing lost updates. Deadlocks happen when two transactions wait on each other; Postgres aborts one.",
    visuals: [
      {
        type: "sequence",
        title: "Preventing a lost update with FOR UPDATE",
        actors: ["Session A", "Postgres", "Session B"],
        messages: [
          { from: 0, to: 1, label: "SELECT balance ... FOR UPDATE" },
          { from: 1, to: 0, label: "100, row locked" },
          { from: 2, to: 1, label: "SELECT balance ... FOR UPDATE" },
          { from: 1, to: 2, label: "waits for A's lock" },
          { from: 0, to: 1, label: "UPDATE balance = 70; COMMIT" },
          { from: 1, to: 2, label: "lock granted: 70" },
          { from: 2, to: 1, label: "UPDATE balance = 50; COMMIT" },
        ],
      },
    ],
    keyPoints: [
      "Lost update: two sessions read 100, both write their own result, one change vanishes.",
      "FOR UPDATE makes other writers wait until you commit or roll back.",
      "Lock rows in a consistent order, such as by id, to avoid deadlocks.",
      "Postgres detects deadlocks after deadlock_timeout and cancels one transaction.",
      "Keep transactions short so locks are held briefly.",
    ],
    terms: [
      { term: "Row lock", meaning: "Lock on specific rows taken by UPDATE, DELETE or FOR UPDATE." },
      { term: "Lost update", meaning: "One write silently overwrites another concurrent write." },
      { term: "FOR UPDATE", meaning: "Lock selected rows for the rest of the transaction." },
      { term: "Deadlock", meaning: "Two transactions each waiting for a lock the other holds." },
      { term: "pg_locks", meaning: "System view listing current locks and waiters." },
    ],
    example: {
      lang: "sql",
      code: "BEGIN;\nSELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\n-- app checks balance >= 30\nUPDATE accounts SET balance = balance - 30 WHERE id = 1;\nCOMMIT;\n\n-- who is waiting on whom?\nSELECT pid, pg_blocking_pids(pid) AS blocked_by, state, query\nFROM pg_stat_activity\nWHERE cardinality(pg_blocking_pids(pid)) > 0;",
    },
    pitfalls: [
      "Read, compute in the app, then write without a lock: classic lost update.",
      "Locking rows in different orders in different code paths.",
      "Calling slow external services while holding locks.",
    ],
    check: [
      { q: "How does SELECT ... FOR UPDATE prevent lost updates?", a: "It locks the rows, so a second transaction must wait and then reads the committed new value." },
      { q: "How do you reduce deadlocks?", a: "Lock rows in a consistent order and keep transactions short." },
    ],
  },

  // ───────────────────────── admin ─────────────────────────
  "admin/roles": {
    summary:
      "In Postgres, users and groups are both roles. Give each app and person its own login role, grant privileges to group roles, and add row-level security when different users may see only their own rows.",
    visuals: [
      {
        type: "layers",
        title: "Permission checks, outside in",
        layers: [
          { label: "pg_hba.conf", detail: "May this host and user connect at all?" },
          { label: "Database CONNECT", detail: "May the role open this database?" },
          { label: "Schema USAGE", detail: "May it see objects in the schema?" },
          { label: "Table privileges", detail: "SELECT, INSERT, UPDATE, DELETE grants" },
          { label: "Row-level security", detail: "Policies filter which rows are visible" },
        ],
      },
      {
        type: "tree",
        title: "Example role setup",
        root: "Roles",
        children: [
          { label: "app_owner", children: ["Owns tables, runs migrations"] },
          { label: "app_rw (group)", children: ["api_service (login)"] },
          { label: "app_ro (group)", children: ["analyst_ana (login)", "bi_tool (login)"] },
        ],
      },
    ],
    keyPoints: [
      "A role with LOGIN can connect; one without LOGIN acts as a group.",
      "Grant to group roles, then add people and apps as members.",
      "ALTER DEFAULT PRIVILEGES covers tables created in the future.",
      "Table owners and superusers bypass RLS unless FORCE ROW LEVEL SECURITY is set.",
    ],
    terms: [
      { term: "Role", meaning: "A user or group identity in Postgres." },
      { term: "GRANT", meaning: "Give a privilege on an object to a role." },
      { term: "Least privilege", meaning: "Give only the access a role really needs." },
      { term: "Row-level security", meaning: "Policies limiting which rows a role can see or change." },
      { term: "Superuser", meaning: "Role that bypasses all permission checks." },
    ],
    example: {
      lang: "sql",
      code: "CREATE ROLE app_ro NOLOGIN;\nGRANT CONNECT ON DATABASE shop TO app_ro;\nGRANT USAGE ON SCHEMA public TO app_ro;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO app_ro;\nALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_ro;\n\nCREATE ROLE analyst_ana LOGIN PASSWORD 'change-me' IN ROLE app_ro;\n\nALTER TABLE notes ENABLE ROW LEVEL SECURITY;\nCREATE POLICY own_notes ON notes\n  USING (owner_name = current_user);",
    },
    pitfalls: [
      "Letting the application connect as a superuser.",
      "Granting on existing tables only, so new tables are inaccessible.",
      "Testing RLS as the table owner, who bypasses the policies.",
    ],
    check: [
      { q: "What is the difference between a login role and a group role?", a: "A login role can connect; a group role has no LOGIN and just bundles privileges for its members." },
      { q: "What does row-level security add on top of GRANT?", a: "It filters which individual rows a role can see or modify, using policies." },
    ],
  },

  "admin/backup": {
    summary:
      "pg_dump makes a logical backup of one database as SQL or an archive you restore with pg_restore. Point-in-time recovery combines a physical base backup with archived WAL so you can restore to any moment, such as just before a bad delete.",
    visuals: [
      {
        type: "sequence",
        title: "How WAL enables point-in-time recovery",
        actors: ["Client", "Postgres", "WAL", "WAL archive"],
        messages: [
          { from: 0, to: 1, label: "INSERT ...; COMMIT" },
          { from: 1, to: 2, label: "append change record" },
          { from: 2, to: 1, label: "flushed to disk" },
          { from: 1, to: 0, label: "COMMIT ok" },
          { from: 2, to: 3, label: "archive_command copies segment" },
          { from: 3, to: 1, label: "restore: replay WAL to target time" },
        ],
      },
      {
        type: "compare",
        title: "pg_dump vs base backup + WAL",
        columns: [
          { title: "pg_dump (logical)", points: ["One database at a time", "Portable across versions", "Restores to the dump moment", "Slow for very large data"] },
          { title: "Base backup + WAL (PITR)", points: ["Whole server, file level", "Same major version only", "Restore to any moment", "Needs continuous WAL archiving"] },
        ],
      },
    ],
    keyPoints: [
      "pg_dump -Fc creates a compressed custom-format archive for pg_restore.",
      "pg_dumpall --globals-only saves roles, which pg_dump does not include.",
      "A backup you have never restored is not proven to work.",
      "Store backups off the database server and schedule them automatically.",
    ],
    terms: [
      { term: "Logical backup", meaning: "Backup as SQL or data, made by pg_dump." },
      { term: "Physical backup", meaning: "Copy of the data files, e.g. pg_basebackup." },
      { term: "WAL archiving", meaning: "Continuously copying finished WAL files to safe storage." },
      { term: "PITR", meaning: "Point-in-time recovery: replay WAL up to a chosen moment." },
      { term: "pg_restore", meaning: "Tool that restores custom or directory format dumps." },
    ],
    example: {
      lang: "bash",
      code: "#!/usr/bin/env bash\nset -euo pipefail\nstamp=$(date +%F_%H%M)\n\npg_dump -h localhost -U postgres -Fc -d shop -f \"/backups/shop_$stamp.dump\"\n\n# restore into a fresh database to verify\ncreatedb -U postgres shop_restore_test\npg_restore -U postgres -d shop_restore_test \"/backups/shop_$stamp.dump\"\n\n# keep 14 days\nfind /backups -name 'shop_*.dump' -mtime +14 -delete",
    },
    pitfalls: [
      "Never testing a restore until the day you need it.",
      "Keeping backups on the same disk as the database.",
      "Forgetting roles and other global objects that pg_dump skips.",
    ],
    check: [
      { q: "What extra does point-in-time recovery need beyond a base backup?", a: "A continuous archive of WAL files to replay up to the chosen moment." },
      { q: "Which tool restores a pg_dump -Fc file?", a: "pg_restore." },
    ],
  },

  "admin/vacuum": {
    summary:
      "Because of MVCC, UPDATE and DELETE leave old row versions behind as dead tuples. VACUUM marks that space reusable and ANALYZE refreshes planner statistics; autovacuum runs both in the background so tables do not bloat.",
    visuals: [
      {
        type: "cycle",
        title: "Life of row space",
        steps: [
          { label: "UPDATE / DELETE", detail: "Old row version becomes a dead tuple" },
          { label: "Dead tuples pile up", detail: "Table and indexes grow: bloat" },
          { label: "Autovacuum triggers", detail: "After enough rows changed" },
          { label: "VACUUM cleans", detail: "Marks space free and updates visibility map" },
          { label: "Space reused", detail: "New rows fill the freed slots" },
        ],
      },
    ],
    keyPoints: [
      "Dead tuples remain until no running transaction can still see them.",
      "Plain VACUUM does not lock out reads or writes, and rarely shrinks the file.",
      "VACUUM FULL rewrites the table compactly but takes an exclusive lock.",
      "Autovacuum also prevents transaction ID wraparound; never disable it.",
      "Long-running transactions stop vacuum from removing dead rows.",
    ],
    terms: [
      { term: "Dead tuple", meaning: "Old row version no transaction needs any more." },
      { term: "Bloat", meaning: "Wasted space from dead tuples in tables or indexes." },
      { term: "VACUUM", meaning: "Reclaims dead tuple space for reuse." },
      { term: "ANALYZE", meaning: "Collects statistics the query planner uses." },
      { term: "Autovacuum", meaning: "Background workers that vacuum and analyse automatically." },
    ],
    example: {
      lang: "sql",
      code: "VACUUM (VERBOSE, ANALYZE) orders;\n\nSELECT relname,\n       n_live_tup,\n       n_dead_tup,\n       last_autovacuum,\n       last_autoanalyze\nFROM pg_stat_user_tables\nORDER BY n_dead_tup DESC\nLIMIT 10;",
    },
    pitfalls: [
      "Turning off autovacuum to \"save resources\".",
      "Leaving idle-in-transaction sessions open, blocking cleanup.",
      "Running VACUUM FULL on a busy production table during peak hours.",
    ],
    check: [
      { q: "Why does Postgres need VACUUM at all?", a: "MVCC leaves old row versions after updates and deletes; vacuum makes their space reusable." },
      { q: "What is the difference between VACUUM and VACUUM FULL?", a: "VACUUM frees space for reuse without blocking; VACUUM FULL rewrites the table to shrink it but locks it exclusively." },
    ],
  },

  "admin/monitoring": {
    summary:
      "Postgres records what it is doing in pg_stat views. pg_stat_activity shows live sessions, and the pg_stat_statements extension aggregates every query shape so you can find the slowest and most frequent queries.",
    visuals: [
      {
        type: "flow",
        title: "Finding the queries worth fixing",
        steps: [
          { label: "Enable extension", detail: "shared_preload_libraries, then CREATE EXTENSION" },
          { label: "Let traffic run", detail: "Stats collect per normalised query" },
          { label: "Sort by total time", detail: "calls times mean time = real load" },
          { label: "EXPLAIN the top few", detail: "Find the slow plan node" },
          { label: "Fix & reset stats", detail: "pg_stat_statements_reset(), then compare" },
        ],
      },
    ],
    keyPoints: [
      "pg_stat_activity shows each connection's state, query and wait event.",
      "\"idle in transaction\" sessions hold locks and block vacuum.",
      "Rank by total_exec_time to find the biggest overall cost.",
      "A fast query called a million times can matter more than one slow report.",
    ],
    terms: [
      { term: "pg_stat_activity", meaning: "View of current sessions and what they run." },
      { term: "pg_stat_statements", meaning: "Extension tracking execution stats per query shape." },
      { term: "total_exec_time", meaning: "Sum of time spent across all calls of a query." },
      { term: "Wait event", meaning: "What a session is currently waiting for, like a lock." },
      { term: "Normalised query", meaning: "Query text with literal values replaced by $1, $2." },
    ],
    example: {
      lang: "sql",
      code: "-- postgresql.conf: shared_preload_libraries = 'pg_stat_statements'\nCREATE EXTENSION IF NOT EXISTS pg_stat_statements;\n\nSELECT calls,\n       round(total_exec_time) AS total_ms,\n       round(mean_exec_time, 2) AS mean_ms,\n       left(query, 80) AS query\nFROM pg_stat_statements\nORDER BY total_exec_time DESC\nLIMIT 10;\n\nSELECT pid, state, wait_event_type, now() - query_start AS running_for, query\nFROM pg_stat_activity WHERE state <> 'idle';",
    },
    pitfalls: [
      "Creating the extension without preloading the library, so it errors.",
      "Only looking at mean time and missing very frequent queries.",
      "Never resetting stats, so old behaviour hides recent changes.",
    ],
    check: [
      { q: "Why sort pg_stat_statements by total_exec_time?", a: "It combines call count and duration, showing which queries use the most server time overall." },
      { q: "Why is an \"idle in transaction\" session a problem?", a: "It holds locks and old snapshots, blocking other writers and stopping vacuum from cleaning up." },
    ],
  },

  "admin/pooling-config": {
    summary:
      "Each Postgres connection is a separate server process with its own memory, so thousands of connections hurt performance. A pooler like PgBouncer shares a few server connections among many clients, and memory settings decide how much is cached and used per query.",
    visuals: [
      {
        type: "layers",
        title: "Connections and memory",
        layers: [
          { label: "App instances", detail: "Hundreds of client connections" },
          { label: "PgBouncer", detail: "Hands out a small pool of server connections" },
          { label: "Postgres backends", detail: "One process per server connection" },
          { label: "work_mem", detail: "Per sort or hash step, per backend" },
          { label: "shared_buffers", detail: "Shared page cache, often ~25% of RAM" },
          { label: "OS page cache & disk", detail: "Everything not in shared buffers" },
        ],
      },
    ],
    keyPoints: [
      "Opening a connection forks a process; reuse connections instead.",
      "PgBouncer transaction mode gives a server connection only for each transaction.",
      "Transaction mode can break session features like SET or advisory locks across transactions.",
      "work_mem applies per operation, so one query can use it several times over.",
    ],
    terms: [
      { term: "Connection pool", meaning: "Set of reusable open database connections." },
      { term: "PgBouncer", meaning: "Lightweight connection pooler for Postgres." },
      { term: "max_connections", meaning: "Upper limit on simultaneous server connections." },
      { term: "shared_buffers", meaning: "Memory Postgres uses to cache data pages." },
      { term: "work_mem", meaning: "Memory per sort or hash before spilling to disk." },
    ],
    example: {
      lang: "ini",
      code: "; pgbouncer.ini\n[databases]\nshop = host=127.0.0.1 port=5432 dbname=shop\n\n[pgbouncer]\nlisten_port = 6432\npool_mode = transaction\nmax_client_conn = 1000\ndefault_pool_size = 20\n\n; postgresql.conf (16 GB server, starting points)\n; shared_buffers = 4GB\n; work_mem = 32MB\n; max_connections = 100",
    },
    pitfalls: [
      "Raising max_connections to thousands instead of adding a pooler.",
      "Setting a huge work_mem globally and running out of memory under load.",
      "Using session features with transaction pooling and getting odd behaviour.",
    ],
    check: [
      { q: "Why are many direct connections expensive in Postgres?", a: "Each one is a separate server process with its own memory and setup cost." },
      { q: "Why can a high work_mem be dangerous?", a: "It applies per sort or hash operation per connection, so total memory use can multiply quickly." },
    ],
  },

  // ───────────────────────── sql-capstone ─────────────────────────
  "sql-capstone/sql-capstone-model": {
    summary:
      "The capstone starts on paper: gather what the app must store, draw the entities and relationships, then write DDL and review it against 3NF before any data goes in.",
    visuals: [
      {
        type: "flow",
        title: "From requirements to DDL",
        steps: [
          { label: "Gather requirements", detail: "User stories and the questions reports must answer" },
          { label: "List entities", detail: "Nouns: customer, product, order" },
          { label: "Map relationships", detail: "One-to-many, many-to-many, optional or required" },
          { label: "Draw the ER diagram", detail: "Boxes, keys and crow's-foot lines" },
          { label: "Write DDL", detail: "Types, keys and constraints" },
          { label: "Review against 3NF", detail: "Remove repeated facts, note deliberate exceptions" },
        ],
      },
    ],
    keyPoints: [
      "Write down the questions the database must answer before designing tables.",
      "Every relationship needs a clear owner of the foreign key.",
      "Choose types and constraints while modelling, not later.",
      "Document any deliberate denormalisation and the reason for it.",
    ],
    terms: [
      { term: "ER diagram", meaning: "Drawing of entities and their relationships." },
      { term: "Crow's foot", meaning: "ER notation showing \"many\" at the end of a line." },
      { term: "DDL", meaning: "SQL that creates and alters tables." },
      { term: "Requirements", meaning: "What the system must store and answer." },
    ],
    example: {
      lang: "sql",
      code: "-- e-commerce core (excerpt)\nCREATE TABLE customers (\n  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email text NOT NULL UNIQUE\n);\nCREATE TABLE orders (\n  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  customer_id bigint NOT NULL REFERENCES customers(id),\n  status      text NOT NULL CHECK (status IN ('cart', 'paid', 'shipped'))\n);\nCREATE TABLE order_items (\n  order_id   bigint REFERENCES orders(id) ON DELETE CASCADE,\n  product_id bigint REFERENCES products(id),\n  qty int NOT NULL CHECK (qty > 0), unit_price numeric(10,2) NOT NULL,\n  PRIMARY KEY (order_id, product_id));",
    },
    pitfalls: [
      "Designing tables before knowing what questions they must answer.",
      "Skipping constraints during modelling and never adding them later.",
      "Forgetting to store historical facts like the price at time of order.",
    ],
    check: [
      { q: "Why write down report questions before designing tables?", a: "They reveal which entities, relationships and columns the schema must support." },
      { q: "Why store unit_price on order_items when products already have a price?", a: "Product prices change; the order must keep the price actually charged." },
    ],
  },

  "sql-capstone/sql-capstone-build": {
    summary:
      "The build turns the model into a working, documented database repo: versioned migrations, realistic seed data, analytics queries with CTEs and window functions, indexes proven by EXPLAIN, and a tested backup script.",
    visuals: [
      {
        type: "tree",
        title: "Capstone repository layout",
        root: "shop-db/",
        children: [
          { label: "migrations/", children: ["0001_init.sql", "0002_indexes.sql"] },
          { label: "seed/", children: ["seed.sql (thousands of rows)"] },
          { label: "queries/", children: ["monthly_revenue.sql", "top_products.sql", "explain_notes.md"] },
          { label: "scripts/", children: ["backup.sh", "restore_test.sh"] },
          { label: "README.md", children: ["ER diagram", "How to run"] },
        ],
      },
      {
        type: "cycle",
        title: "Justifying each index",
        steps: [
          { label: "Write the query", detail: "A real report from the requirements" },
          { label: "EXPLAIN ANALYZE", detail: "Record plan and time without the index" },
          { label: "Add one index", detail: "Matched to the WHERE and ORDER BY" },
          { label: "Compare plans", detail: "Keep it only if it clearly helps" },
        ],
      },
    ],
    keyPoints: [
      "Seed enough data that plans differ from a near-empty table.",
      "Run migrations from scratch to prove they rebuild the schema.",
      "Save before-and-after EXPLAIN output next to each index decision.",
      "Test the backup by restoring it into a fresh database.",
    ],
    terms: [
      { term: "Seed data", meaning: "Sample rows loaded for development and testing." },
      { term: "generate_series", meaning: "Postgres function producing rows for bulk test data." },
      { term: "Analytics query", meaning: "Read-only query that summarises data for reports." },
      { term: "Reproducible setup", meaning: "Anyone can rebuild the database from the repo." },
    ],
    example: {
      lang: "sql",
      code: "-- seed 50,000 orders spread over a year\nINSERT INTO orders (customer_id, status, ordered_at)\nSELECT (random() * 999 + 1)::bigint,\n       (ARRAY['paid', 'shipped', 'cart'])[1 + floor(random() * 3)::int],\n       now() - random() * interval '365 days'\nFROM generate_series(1, 50000);\n\nANALYZE orders;",
      caption: "Realistic volume makes EXPLAIN results meaningful.",
    },
    pitfalls: [
      "Testing performance with only a handful of rows.",
      "Adding indexes without evidence from EXPLAIN.",
      "A backup script that has never been used to restore.",
    ],
    check: [
      { q: "Why seed thousands of rows instead of ten?", a: "With tiny tables the planner just scans everything, so index decisions cannot be tested meaningfully." },
      { q: "How do you prove the backup script works?", a: "Restore its output into a fresh database and check the data is there." },
    ],
  },
};

export default explainers;
