import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "databases/sql": {
    plain: [
      "A relational database stores data in tables, like spreadsheets with strict columns. Each row is one thing: one customer, one order, one product. SQL (Structured Query Language) is the language you use to ask questions about those tables.",
      "The core of SQL is SELECT. You say which columns you want, from which table, and which rows to keep. SELECT name FROM customers WHERE city = 'Pune' reads almost like English. You describe the result you want, and the database works out how to get it fast.",
      "Real questions usually need several tables. Orders live in one table and customers in another, linked by a customer id. A JOIN puts matching rows side by side so you can ask things like: which customers spent the most last month?",
      "Then you summarise. GROUP BY turns many rows into one row per group, such as one row per city with a total. Window functions go further: they can rank or total rows while still keeping every row. With these tools you can answer most business questions without writing any Java at all.",
    ],
    deepDive: [
      {
        heading: "Joins and how they multiply rows",
        body: "A join pairs every row on the left with every row on the right that meets the ON condition. If a customer has three orders, that customer appears three times in the result. This is expected, but it surprises people when they then SUM a column from the customer side and get a number three times too big. Aggregate at the right level, or aggregate in a subquery before joining.\n\nLEFT JOIN keeps every left row and fills the right side with NULL when there is no match. That makes it the tool for finding missing data: LEFT JOIN orders and keep rows WHERE o.id IS NULL to find customers with no orders. This pattern is called an anti-join; NOT EXISTS does the same and is often clearer. A self-join joins a table to itself, for example employees to their managers.",
        visual: {
          type: "tree",
          title: "Join types at a glance",
          root: "JOIN",
          children: [
            { label: "INNER JOIN", children: ["Only matching pairs", "The default for plain JOIN"] },
            { label: "LEFT JOIN", children: ["All left rows", "NULLs where no match"] },
            { label: "FULL OUTER JOIN", children: ["All rows from both sides", "Useful for reconciling two lists"] },
            { label: "CROSS JOIN", children: ["Every combination", "Rows multiply: n times m"] },
            { label: "Self join", children: ["Table joined to itself", "employees e JOIN employees m"] },
          ],
        },
      },
      {
        heading: "NULL is not a value",
        body: "NULL means unknown or missing, and it follows its own logic. Any comparison with NULL, even NULL = NULL, gives unknown, and WHERE keeps only rows where the condition is true. So WHERE phone = NULL never matches anything; write WHERE phone IS NULL.\n\nThis causes real bugs. COUNT(*) counts rows, but COUNT(phone) counts only rows where phone is not NULL. AVG ignores NULLs instead of treating them as zero. The nastiest trap: WHERE id NOT IN (SELECT manager_id FROM employees) returns no rows at all if any manager_id is NULL, because the database cannot be sure the id is not equal to that unknown value. Use NOT EXISTS instead, which behaves as you expect.",
        bullets: ["COALESCE(phone, 'none') replaces NULL with a default", "a IS DISTINCT FROM b treats NULLs as comparable (PostgreSQL)", "NOT IN plus a NULL in the list returns nothing"],
      },
      {
        heading: "Grouping, HAVING and conditional counts",
        body: "With GROUP BY, every column in SELECT must either be in the GROUP BY list or be inside an aggregate like COUNT, SUM, AVG, MIN or MAX. Otherwise the database would not know which of the many row values to show. PostgreSQL relaxes this a little: if you group by a table's primary key, you may select its other columns.\n\nOften you want several counts in one pass, such as paid and refunded orders per day. PostgreSQL supports a FILTER clause: COUNT(*) FILTER (WHERE status = 'paid'). The portable version is SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END). Both avoid running several separate queries. Use HAVING only for conditions on aggregates; plain row filters belong in WHERE, where they reduce the work before grouping.",
        bullets: ["date_trunc('month', created_at) groups by month in PostgreSQL", "GROUP BY 1, 2 groups by the first and second selected columns", "ORDER BY the aggregate: ORDER BY SUM(total) DESC"],
      },
      {
        heading: "Subqueries and CTEs",
        body: "A subquery is a query inside another query. A scalar subquery returns one value, as in WHERE total > (SELECT AVG(total) FROM orders). IN and EXISTS test membership. A correlated subquery refers to the outer row, like EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id), and conceptually runs once per outer row, though the planner often turns it into a join.\n\nA CTE (common table expression) gives a subquery a name with WITH, so a long query reads as steps. Since PostgreSQL 12, simple CTEs are inlined into the main query and optimised like subqueries; write AS MATERIALIZED to force one to be computed once. WITH RECURSIVE walks hierarchies such as category trees or org charts by repeatedly joining a table to the rows found so far.",
      },
      {
        heading: "Window functions: rank, compare and run totals",
        body: "A window function computes a value across a set of related rows, called the window, without collapsing them. OVER (PARTITION BY dept ORDER BY salary DESC) means: restart for each department, ordered by salary. ROW_NUMBER, RANK and DENSE_RANK differ only on ties, as the diagram shows. LAG(total) and LEAD(total) read the previous or next row's value, which makes month-over-month change easy. SUM(total) OVER (ORDER BY day) gives a running total.\n\nWindow functions run after WHERE, GROUP BY and HAVING, so you cannot filter on them in the same WHERE clause. To keep only the top row per group, compute ROW_NUMBER in a CTE or subquery and filter on it outside. PostgreSQL also offers DISTINCT ON for the simple top-one-per-group case.",
        visual: {
          type: "compare",
          title: "Ranking salaries 900, 800, 800, 700",
          columns: [
            { title: "ROW_NUMBER()", points: ["1, 2, 3, 4", "Always unique", "Ties broken arbitrarily", "Best for top N per group"] },
            { title: "RANK()", points: ["1, 2, 2, 4", "Ties share a rank", "Leaves a gap after ties", "Like sports rankings"] },
            { title: "DENSE_RANK()", points: ["1, 2, 2, 3", "Ties share a rank", "No gaps", "Good for distinct levels"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Writing a query step by step",
        steps: [
          { label: "Restate the question", detail: "What does one result row represent?" },
          { label: "Find the tables", detail: "Which tables hold the facts you need?" },
          { label: "Join and check counts", detail: "Run SELECT COUNT(*) after each join" },
          { label: "Filter rows", detail: "WHERE before any grouping" },
          { label: "Group or window", detail: "Summarise, rank or compare rows" },
          { label: "Sanity-check", detail: "Test with a customer you know by hand" },
        ],
      },
    ],
    examples: [
      {
        title: "Customers with their order counts, including zero",
        explanation: "Marketing wants every customer and how many orders they placed, including people who never ordered. Step 1: an inner join would drop customers without orders, so use LEFT JOIN. Step 2: count o.id, not *, because for customers without orders the single joined row has NULL in o.id, so COUNT(o.id) gives 0 while COUNT(*) would wrongly give 1. Step 3: group by the customer's primary key. Step 4: a second query finds only the customers who never ordered, using NOT EXISTS.",
        code: {
          lang: "sql",
          code: `SELECT c.id, c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.name
ORDER BY orders DESC;

-- Only customers who never ordered
SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);`,
        },
      },
      {
        title: "Top 2 products per category",
        explanation: "You need the two best-selling products in each category. Step 1: in a CTE, sum sales per product. Step 2: in a second CTE, number products inside each category by sales, highest first, with ROW_NUMBER. Step 3: filter rn <= 2 in the outer query, because a window function cannot be used in WHERE directly. If you want ties to share second place, swap ROW_NUMBER for DENSE_RANK.",
        code: {
          lang: "sql",
          code: `WITH sales AS (
  SELECT p.id, p.name, p.category_id, SUM(oi.quantity) AS sold
  FROM products p
  JOIN order_items oi ON oi.product_id = p.id
  GROUP BY p.id, p.name, p.category_id
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY sold DESC) AS rn
  FROM sales
)
SELECT category_id, name, sold
FROM ranked
WHERE rn <= 2
ORDER BY category_id, rn;`,
        },
      },
    ],
    cheatSheet: [
      "Use IS NULL and IS NOT NULL; = NULL never matches",
      "COUNT(*) counts rows; COUNT(col) skips NULLs",
      "Prefer NOT EXISTS over NOT IN when the subquery can return NULL",
      "Put conditions on the right table of a LEFT JOIN in ON, not in WHERE",
      "COUNT(*) FILTER (WHERE status = 'paid') counts a subset (PostgreSQL)",
      "Filter on a window function by wrapping it in a CTE or subquery",
      "LAG(x) OVER (ORDER BY d) gives the previous row's value",
      "UNION removes duplicates; UNION ALL keeps them and is faster",
    ],
    quiz: [
      {
        q: "A subquery used in NOT IN returns 3, 7 and NULL. What does WHERE id NOT IN (...) return?",
        options: ["All rows except ids 3 and 7", "Only rows where id is NULL", "No rows at all", "A syntax error"],
        answer: 2,
        why: "Comparing with the NULL is unknown, so no row can be proven to be not in the list.",
      },
      {
        q: "Salaries are 900, 800, 800, 700. What does RANK() give the 700 row?",
        options: ["4", "3", "2", "1"],
        answer: 0,
        why: "RANK leaves a gap after the two tied rows, so the next rank is 4; DENSE_RANK would give 3.",
      },
      {
        q: "A table has 10 rows, and 4 of them have NULL in email. What does COUNT(email) return?",
        options: ["10", "4", "NULL", "6"],
        answer: 3,
        why: "COUNT(column) only counts non-NULL values.",
      },
      {
        q: "You LEFT JOIN orders and add WHERE o.status = 'paid'. Customers without orders disappear. Why?",
        options: ["LEFT JOIN does not keep unmatched rows", "Their o.status is NULL, so the WHERE condition removes them", "status needs an index", "WHERE always runs before the join"],
        answer: 1,
        why: "Move the condition into the ON clause to keep customers without paid orders.",
      },
      {
        q: "Why does WHERE ROW_NUMBER() OVER (...) <= 3 fail?",
        options: ["ROW_NUMBER needs PARTITION BY", "It only works in MySQL", "You must use RANK instead", "Window functions are computed after WHERE"],
        answer: 3,
        why: "Compute the window function in a subquery or CTE, then filter it outside.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the 10 largest orders from the last 30 days with the customer's name.",
        hint: "Join orders to customers, filter on created_at, sort descending and limit.",
        solution: "SELECT o.id, c.name, o.total, o.created_at\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.created_at >= now() - interval '30 days'\nORDER BY o.total DESC\nLIMIT 10;",
      },
      {
        level: "medium",
        task: "Show revenue per month for this year, plus the number of paid and refunded orders per month.",
        hint: "Group by date_trunc('month', created_at) and use FILTER for the two counts.",
        solution: "SELECT date_trunc('month', created_at) AS month,\n       SUM(total) FILTER (WHERE status = 'paid')  AS revenue,\n       COUNT(*)   FILTER (WHERE status = 'paid')  AS paid,\n       COUNT(*)   FILTER (WHERE status = 'refunded') AS refunded\nFROM orders\nWHERE created_at >= date_trunc('year', now())\nGROUP BY 1\nORDER BY 1;",
      },
      {
        level: "hard",
        task: "For each customer, show each order with a running total of their spending and the difference from their previous order.",
        hint: "Use SUM and LAG with the same PARTITION BY and ORDER BY.",
        solution: "SELECT customer_id, id, created_at, total,\n       SUM(total) OVER w AS running_total,\n       total - LAG(total) OVER w AS change_from_previous\nFROM orders\nWINDOW w AS (PARTITION BY customer_id ORDER BY created_at)\nORDER BY customer_id, created_at;",
      },
    ],
    faq: [
      { q: "Is a JOIN faster than a subquery?", a: "Often they perform the same, because the planner rewrites one into the other. Write the clearer version, then check with EXPLAIN if it is slow." },
      { q: "What is the difference between UNION and UNION ALL?", a: "UNION removes duplicate rows from the combined result, which needs extra sorting or hashing. UNION ALL keeps every row and is faster when duplicates are impossible or fine." },
      { q: "Is SQL case-sensitive?", a: "Keywords are not. In PostgreSQL, unquoted table and column names are folded to lower case, while string comparisons such as name = 'Ana' are case-sensitive; use ILIKE or lower() to ignore case." },
      { q: "Where can I practise SQL for free?", a: "Install PostgreSQL locally or in Docker and load a sample database such as Pagila, or use interactive sites like SQLBolt and pgexercises." },
    ],
  },

  "databases/db-design": {
    plain: [
      "Designing a schema means deciding which tables you need, which columns go in each, and how the tables link together. A good design makes the right queries easy and makes wrong data hard to store.",
      "The main rule is: store each fact in one place. If a customer's email is copied into every order, changing it means updating hundreds of rows, and sooner or later two copies disagree. Instead, store the email once in customers and let each order point to the customer by id.",
      "Keys and constraints make the database guard your data. A primary key identifies each row. A foreign key says an order must belong to a customer that really exists. NOT NULL, UNIQUE and CHECK reject bad values even if your Java code has a bug.",
      "Indexes make lookups fast. Without one, the database reads every row to find a match. An index is like the index at the back of a book: it tells the database exactly where to look. EXPLAIN shows you whether the database actually uses it.",
    ],
    deepDive: [
      {
        heading: "Turning relationships into tables",
        body: "Start from the nouns of the domain (customer, order, product) and how they relate. For one-to-many, such as one customer with many orders, put a foreign key on the many side: orders.customer_id. For many-to-many, such as orders and products, you need a join table, order_items, holding order_id and product_id. That table often carries its own data, like quantity and unit price at the time of sale.\n\nOne-to-one is rarer. Use it to split rarely used or sensitive columns into a separate table that shares the same primary key. Ask about each relationship: is it required or optional, and what happens when the parent is deleted? Those answers become NOT NULL and ON DELETE rules.",
        visual: {
          type: "tree",
          title: "How each relationship is stored",
          root: "Relationship",
          children: [
            { label: "One-to-one", children: ["Same primary key in both tables", "user and user_profile"] },
            { label: "One-to-many", children: ["Foreign key on the many side", "orders.customer_id"] },
            { label: "Many-to-many", children: ["Join table with two foreign keys", "order_items(order_id, product_id)", "Can hold extra columns"] },
          ],
        },
      },
      {
        heading: "Normal forms in plain words",
        body: "Normalisation is a checklist for removing duplicated facts. First normal form (1NF): each column holds one value, so no comma-separated tags and no phone1, phone2, phone3 columns; put repeating items in their own table. Second normal form (2NF): when the key has several columns, every other column must depend on the whole key. In order_items(order_id, product_id), product_name depends only on product_id, so it belongs in products. Third normal form (3NF): non-key columns must not depend on other non-key columns. If orders stores customer_id and customer_city, the city depends on the customer, not the order.\n\nDenormalising on purpose is fine for read-heavy reports, but do it knowingly and keep the normalised data as the source of truth.",
        visual: {
          type: "flow",
          title: "Normalising an order spreadsheet",
          steps: [
            { label: "One wide row", detail: "Order, customer, and items as item1, item2..." },
            { label: "1NF", detail: "Move items into their own rows" },
            { label: "2NF", detail: "Product details move to products" },
            { label: "3NF", detail: "Customer details move to customers" },
            { label: "Result", detail: "customers, orders, order_items, products" },
          ],
        },
      },
      {
        heading: "Keys and constraints that protect data",
        body: "Most tables use a surrogate key: a meaningless number generated by the database. In modern PostgreSQL write id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, the SQL-standard replacement for SERIAL. UUIDs are useful when ids are created outside the database or must not be guessable; time-ordered UUID version 7 keeps index inserts efficient. Keep real-world identifiers like email as UNIQUE columns rather than as the primary key, because they can change.\n\nAdd constraints for every rule you can state: NOT NULL for required fields, UNIQUE for natural identifiers, CHECK (quantity > 0) for value rules, and foreign keys with a chosen ON DELETE action: RESTRICT (the default behaviour is similar) blocks deleting a parent with children, CASCADE deletes them too. PostgreSQL creates indexes for primary keys and unique constraints, but not for foreign key columns; add those yourself.",
        bullets: ["Use NUMERIC(12, 2) for money, never float", "Use TIMESTAMPTZ for points in time", "Name constraints so error messages are readable"],
      },
      {
        heading: "How a B-tree index finds rows",
        body: "The default index type is a B-tree: a shallow, balanced tree of pages with keys in sorted order. Even with 100 million rows it is only about four levels deep, so a lookup reads a handful of pages instead of the whole table. Because keys are sorted, the same index also helps range filters and ORDER BY.\n\nA composite index on (customer_id, created_at) is sorted by customer first, then by date within each customer. So it serves WHERE customer_id = 42, and WHERE customer_id = 42 AND created_at > ..., but not a filter on created_at alone. Put equality columns first and range columns last. Wrapping a column in a function, like WHERE lower(email) = ..., skips a plain index; create an expression index on lower(email) instead. Partial indexes such as ... WHERE status = 'open' stay small when you only query a subset.",
        visual: {
          type: "layers",
          title: "Inside a B-tree lookup for customer_id = 42",
          layers: [
            { label: "Root page", detail: "Key ranges point to the right child page" },
            { label: "Internal pages", detail: "Narrow the range at each level" },
            { label: "Leaf pages", detail: "Sorted keys with pointers to rows" },
            { label: "Table (heap)", detail: "Fetch only the matching rows" },
          ],
        },
      },
      {
        heading: "Reading an EXPLAIN plan",
        body: "EXPLAIN shows the plan the database intends to use; EXPLAIN ANALYZE actually runs the query and adds real timings and row counts. Because it really runs, wrap ANALYZE of an UPDATE or DELETE in BEGIN and ROLLBACK. Read the plan from the most indented line outward.\n\nScan types tell you how a table is read. Seq Scan reads every row, which is fine for small tables or when most rows match. Index Scan uses an index, Index Only Scan answers from the index alone, and Bitmap Heap Scan collects many matches first. Join nodes are Nested Loop (good for few rows), Hash Join and Merge Join. The most useful check is estimated rows versus actual rows: if the planner expected 10 and got 100,000, its statistics are stale or the data is skewed, so run ANALYZE on the table.",
        bullets: ["EXPLAIN (ANALYZE, BUFFERS) also shows pages read", "cost=0.43..8.45: startup cost, then total cost", "Large gaps between estimated and actual rows mean bad statistics"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Normalised vs denormalised",
        columns: [
          { title: "Normalised", points: ["Each fact stored once", "Updates touch one row", "Needs joins to read", "The default for OLTP apps"] },
          { title: "Denormalised", points: ["Facts copied for fast reads", "Updates must touch every copy", "Fewer joins", "Good for reports and caches"] },
        ],
      },
    ],
    examples: [
      {
        title: "Designing orders, products and the join table",
        explanation: "An online shop needs orders that contain many products. Step 1: products and orders each get an identity primary key. Step 2: order_items links them, with a composite primary key so a product appears once per order. Step 3: unit_price is stored on the item because prices change later and the order must keep the price paid; this is not duplication but a different fact. Step 4: CHECK constraints reject zero quantities and negative prices. Step 5: index the foreign key product_id, which PostgreSQL does not do automatically.",
        code: {
          lang: "sql",
          code: `CREATE TABLE products (
  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku   TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE order_items (
  order_id   BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
CREATE INDEX idx_order_items_product ON order_items (product_id);`,
        },
      },
      {
        title: "Fixing a slow query with an index",
        explanation: "The open-tickets page takes 900 ms. Step 1: run EXPLAIN ANALYZE and see a Seq Scan over 2 million rows that keeps only 40. Step 2: the query filters on status = 'open' and sorts by created_at. Step 3: since only a few rows are open, a partial index on created_at WHERE status = 'open' is small and matches the sort. Step 4: rerun EXPLAIN ANALYZE: an Index Scan returns the rows in under a millisecond, and no separate sort step is needed.",
        code: {
          lang: "sql",
          code: `EXPLAIN ANALYZE
SELECT id, title FROM tickets
WHERE status = 'open' ORDER BY created_at LIMIT 50;
-- Before: Seq Scan on tickets (actual rows=40) ... Execution Time: 905 ms

CREATE INDEX idx_tickets_open_created
  ON tickets (created_at) WHERE status = 'open';

-- After: Index Scan using idx_tickets_open_created on tickets
--        ... Execution Time: 0.2 ms`,
        },
      },
    ],
    cheatSheet: [
      "One-to-many: foreign key on the many side. Many-to-many: a join table",
      "id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY is the modern PostgreSQL default",
      "PostgreSQL does not index foreign key columns automatically",
      "Composite index (a, b) serves filters on a, or a and b, but not b alone",
      "Put equality columns first and range columns last in a composite index",
      "CREATE INDEX ... ON t (lower(email)) supports WHERE lower(email) = ...",
      "EXPLAIN ANALYZE runs the query; wrap writes in BEGIN ... ROLLBACK",
      "Run ANALYZE table_name when estimated and actual rows differ wildly",
    ],
    quiz: [
      {
        q: "There is an index on (customer_id, created_at). Which filter cannot use it efficiently?",
        options: ["WHERE customer_id = 7", "WHERE created_at > '2026-01-01'", "WHERE customer_id = 7 AND created_at > '2026-01-01'", "WHERE customer_id = 7 ORDER BY created_at"],
        answer: 1,
        why: "The index is sorted by customer_id first, so created_at alone is not a usable prefix.",
      },
      {
        q: "orders has columns id, customer_id and customer_email. Which normal form does customer_email break?",
        options: ["Third normal form, because it depends on customer_id, not on the order", "First normal form", "None, it is fine", "Second normal form only"],
        answer: 0,
        why: "A non-key column depending on another non-key column is a transitive dependency.",
      },
      {
        q: "What does EXPLAIN ANALYZE do that EXPLAIN does not?",
        options: ["Updates table statistics", "Creates missing indexes", "Shows the SQL text", "Actually runs the query and reports real times and row counts"],
        answer: 3,
        why: "That is why you should wrap ANALYZE of data-changing statements in a rolled-back transaction.",
      },
      {
        q: "How do you model students who take many courses, where each course has many students?",
        options: ["A course_ids text column in students", "A foreign key in each table pointing to the other", "A join table enrolments(student_id, course_id)", "One table with both entities"],
        answer: 2,
        why: "Many-to-many relationships need a separate table with a foreign key to each side.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create tables users and posts, where every post belongs to one user and is deleted when the user is deleted.",
        hint: "Foreign key with ON DELETE CASCADE, and index it.",
        solution: "CREATE TABLE users (\n  id    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE\n);\nCREATE TABLE posts (\n  id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  title   TEXT NOT NULL\n);\nCREATE INDEX idx_posts_user ON posts (user_id);",
      },
      {
        level: "medium",
        task: "Model students and courses with an enrolment that stores the grade. A student may enrol in a course only once, and grades must be between 0 and 100.",
        hint: "Composite primary key plus a CHECK constraint.",
        solution: "CREATE TABLE enrolments (\n  student_id BIGINT NOT NULL REFERENCES students(id),\n  course_id  BIGINT NOT NULL REFERENCES courses(id),\n  grade      INT CHECK (grade BETWEEN 0 AND 100),\n  PRIMARY KEY (student_id, course_id)\n);\nCREATE INDEX idx_enrolments_course ON enrolments (course_id);",
      },
      {
        level: "hard",
        task: "Users log in by email, typed in any case. Make emails unique regardless of case and make login lookups fast. Show the lookup query.",
        hint: "A unique expression index on lower(email); the query must use the same expression.",
        solution: "CREATE UNIQUE INDEX uq_users_email_lower ON users (lower(email));\n\n-- Lookup must use the same expression to match the index\nSELECT id, password_hash FROM users WHERE lower(email) = lower($1);\n\n-- Verify\nEXPLAIN SELECT id FROM users WHERE lower(email) = 'ana@x.com';\n-- Index Scan using uq_users_email_lower on users",
      },
    ],
    faq: [
      { q: "Should I use UUIDs or numeric ids?", a: "Numeric identity columns are smaller and fast. Use UUIDs when ids are generated outside the database or must not be guessable, and prefer UUID version 7, which is time-ordered and kinder to indexes." },
      { q: "How many indexes is too many?", a: "Every index slows writes and uses space, so add each one for a real query you have measured. Check unused indexes in PostgreSQL with the pg_stat_user_indexes view." },
      { q: "Should I use ON DELETE CASCADE?", a: "Use it for child rows that have no meaning without their parent, like order items. For important data such as orders of a customer, prefer blocking the delete or soft-deleting." },
      { q: "Do I always need third normal form?", a: "Aim for 3NF in transactional tables, then denormalise only for measured performance needs such as reporting tables or caches." },
    ],
  },

  "databases/jdbc": {
    plain: [
      "JDBC (Java Database Connectivity) is the standard Java API for talking to a database. Every higher tool, from Spring's JdbcTemplate to Hibernate, ends up calling JDBC. Knowing it helps you understand what those tools do for you, and debug them when they go wrong.",
      "The basic flow is simple: get a connection, send a SQL statement, read the rows that come back, and close everything. A driver, a jar provided by the database vendor, turns these calls into the database's network protocol.",
      "Safety matters here. If you glue user input straight into SQL text, an attacker can type SQL instead of a name and run it. PreparedStatement sends the SQL and the values separately, so input is always treated as data. This one habit blocks SQL injection.",
      "Opening a database connection is slow, often tens of milliseconds, because of the network handshake and login. A connection pool such as HikariCP keeps a few connections open and lends them out. Spring Boot sets HikariCP up for you automatically.",
    ],
    deepDive: [
      {
        heading: "Connections, statements and result sets",
        body: "A JDBC URL tells the driver where to connect, for example jdbc:postgresql://localhost:5432/shop. Since JDBC 4 the driver registers itself when its jar is on the classpath, so the old Class.forName(...) line is not needed. In applications, get connections from a DataSource (usually a pool) rather than DriverManager, which opens a new physical connection every time.\n\nexecuteQuery returns a ResultSet for SELECT; executeUpdate returns the number of changed rows for INSERT, UPDATE and DELETE. A ResultSet is a cursor: call next() to move to each row. Column positions start at 1, not 0. Watch out for NULLs: rs.getLong(\"age\") returns 0 for a NULL value. Use rs.getObject(\"age\", Long.class), which returns null, or check rs.wasNull() after reading.",
        bullets: ["Parameter and column indexes start at 1", "getInt and getLong return 0 for SQL NULL", "Close ResultSet, Statement and Connection with try-with-resources"],
      },
      {
        heading: "SQL injection and its limits",
        body: "Concatenating input into SQL lets the input change the meaning of the query. With \"... WHERE email = '\" + email + \"'\", the input ' OR '1'='1 returns every user. With a PreparedStatement, the SQL text with ? placeholders is sent first and the values are sent separately, so the database never parses the value as SQL.\n\nPlaceholders only work for values. You cannot use ? for a table name, a column name or the ASC/DESC keyword. When a user chooses the sort column, check it against a fixed list of allowed names (an allowlist) and only then put it into the SQL text. For a variable number of values in an IN list, PostgreSQL lets you pass one array: WHERE id = ANY(?) with conn.createArrayOf(\"bigint\", ids).",
        visual: {
          type: "compare",
          title: "String concatenation vs PreparedStatement",
          columns: [
            { title: "Concatenated SQL", points: ["Input becomes part of the SQL text", "' OR '1'='1 changes the query", "Quotes in names break it", "Never do this with user input"] },
            { title: "PreparedStatement", points: ["SQL text has ? placeholders", "Values sent separately as data", "Types handled by setString, setLong", "Works for values, not identifiers"] },
          ],
        },
      },
      {
        heading: "Transactions in plain JDBC",
        body: "A new connection is in auto-commit mode: every statement is its own transaction and is saved at once. To make several statements succeed or fail together, call conn.setAutoCommit(false), run them, and call conn.commit(). If anything throws, call conn.rollback() so nothing is saved. Pooled connections are reset when returned, but restoring auto-commit yourself is still good practice.\n\nThis is exactly what Spring's @Transactional does for you behind a proxy: it borrows a connection, turns off auto-commit, runs your method, then commits or rolls back. You can also set the isolation level with setTransactionIsolation, for example TRANSACTION_REPEATABLE_READ, although PostgreSQL's default READ COMMITTED is right for most work.",
        visual: {
          type: "flow",
          title: "A JDBC transaction",
          steps: [
            { label: "Borrow connection", detail: "dataSource.getConnection()" },
            { label: "setAutoCommit(false)", detail: "Start grouping statements" },
            { label: "Run statements", detail: "Debit one account, credit another" },
            { label: "commit()", detail: "Both changes become visible together" },
            { label: "On error: rollback()", detail: "Neither change is saved" },
          ],
        },
      },
      {
        heading: "Batching and streaming large results",
        body: "Inserting 10,000 rows one executeUpdate at a time means 10,000 network round trips. With batching, call ps.addBatch() for each row and ps.executeBatch() every few hundred or thousand rows, inside one transaction. For PostgreSQL, adding reWriteBatchedInserts=true to the JDBC URL lets the driver merge them into multi-row INSERTs for a further speed-up.\n\nReading works the other way. By default the PostgreSQL driver loads the entire result into memory, which can crash the app on a huge table. To stream it in chunks, turn off auto-commit and call ps.setFetchSize(1000); the driver then uses a cursor and fetches 1,000 rows at a time. MySQL's driver has different rules, so check your driver's docs.",
        bullets: ["executeBatch() returns an int[] of update counts", "Commit batches inside a transaction for speed", "setFetchSize only streams in PostgreSQL when auto-commit is off"],
      },
      {
        heading: "Configuring HikariCP",
        body: "HikariCP is the default pool in Spring Boot. Its key setting is maximumPoolSize, which defaults to 10. Bigger is not better: a database with 8 CPU cores can only do so much at once, and extra connections just queue inside the database and add overhead. HikariCP's own guide suggests starting near (cores times 2) plus the number of disks and measuring from there. Remember that the total is pool size times app instances: 6 instances with 20 connections need 120 database connections, more than PostgreSQL's default max_connections of 100.\n\nOther settings: connectionTimeout (default 30 seconds) is how long a request waits for a free connection before failing; maxLifetime (default 30 minutes) retires connections before the network or database closes them; leakDetectionThreshold logs a stack trace when a connection is held too long, which finds code that forgets to close.",
        bullets: ["spring.datasource.hikari.maximum-pool-size=10", "spring.datasource.hikari.connection-timeout=30000", "spring.datasource.hikari.leak-detection-threshold=20000"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Life of a pooled connection",
        steps: [
          { label: "Idle in pool", detail: "Open, logged in, waiting" },
          { label: "Borrowed", detail: "getConnection() hands it to a thread" },
          { label: "In use", detail: "Statements and transactions run" },
          { label: "Returned", detail: "close() gives it back, state is reset" },
          { label: "Retired", detail: "Replaced after maxLifetime or a failure" },
        ],
      },
    ],
    examples: [
      {
        title: "Inserting a row and getting its new id",
        explanation: "You insert a customer and need the generated id. Step 1: in PostgreSQL, add RETURNING id to the INSERT so the database sends back the new value. Step 2: because the statement now returns rows, run it with executeQuery. Step 3: read the id from the single result row. Step 4: try-with-resources closes the statement and returns the connection to the pool. The portable alternative is prepareStatement(sql, Statement.RETURN_GENERATED_KEYS) with getGeneratedKeys().",
        code: {
          lang: "java",
          code: `long createCustomer(DataSource ds, String name, String email) throws SQLException {
  String sql = "INSERT INTO customers (name, email) VALUES (?, ?) RETURNING id";
  try (Connection conn = ds.getConnection();
       PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, name);
    ps.setString(2, email);
    try (ResultSet rs = ps.executeQuery()) {
      rs.next();
      return rs.getLong("id");
    }
  }
}`,
        },
      },
      {
        title: "Moving money in one transaction",
        explanation: "A transfer must debit one account and credit another, or do neither. Step 1: turn off auto-commit. Step 2: run both updates with the same connection. Step 3: if the debit touched no row because the balance was too low, throw, so the catch rolls back. Step 4: commit only when both succeed. Step 5: the finally block restores auto-commit before the connection goes back to the pool.",
        code: {
          lang: "java",
          code: `try (Connection c = ds.getConnection()) {
  c.setAutoCommit(false);
  try (var debit = c.prepareStatement("UPDATE accounts SET balance = balance - ? WHERE id = ? AND balance >= ?");
       var credit = c.prepareStatement("UPDATE accounts SET balance = balance + ? WHERE id = ?")) {
    debit.setBigDecimal(1, amount); debit.setLong(2, fromId); debit.setBigDecimal(3, amount);
    if (debit.executeUpdate() != 1) throw new SQLException("insufficient funds");
    credit.setBigDecimal(1, amount); credit.setLong(2, toId);
    credit.executeUpdate(); c.commit();
  } catch (SQLException e) {
    c.rollback();
    throw e;
  } finally {
    c.setAutoCommit(true);
  }
}`,
        },
      },
    ],
    cheatSheet: [
      "URL format: jdbc:postgresql://host:5432/dbname",
      "Never concatenate input into SQL; use ? placeholders and setString or setLong",
      "Placeholders cannot hold table or column names; use an allowlist",
      "Indexes in JDBC start at 1 for both parameters and columns",
      "rs.getObject(\"col\", Long.class) returns null instead of 0 for SQL NULL",
      "addBatch() plus executeBatch() cuts thousands of round trips to a few",
      "HikariCP maximumPoolSize defaults to 10; total connections = pool size x instances",
      "Spring 6.1+ JdbcClient gives a fluent API over JDBC with far less code",
    ],
    quiz: [
      {
        q: "A column is NULL and you call rs.getInt(\"score\"). What do you get?",
        options: ["null", "An SQLException", "0", "-1"],
        answer: 2,
        why: "Primitive getters return 0 for NULL; use getObject or wasNull to tell the difference.",
      },
      {
        q: "Users can sort a list by a column name they pick. How do you build the ORDER BY safely?",
        options: ["Use ORDER BY ? with setString", "Check the name against a fixed allowlist, then add it to the SQL", "Escape quotes in the input", "Use executeUpdate instead of executeQuery"],
        answer: 1,
        why: "Placeholders only bind values, so identifiers must be validated against known names.",
      },
      {
        q: "What is the default auto-commit mode of a new JDBC connection?",
        options: ["On: each statement commits immediately", "Off: you must always call commit", "On only for SELECT statements", "It depends on the pool size"],
        answer: 0,
        why: "Connections start in auto-commit mode; turn it off to group statements in a transaction.",
      },
      {
        q: "Four app instances each have a HikariCP pool of 30. PostgreSQL has max_connections = 100. What can happen?",
        options: ["Nothing, pools share connections", "HikariCP lowers the size automatically", "PostgreSQL queues the extra connections forever", "Some instances fail to get connections because 120 exceeds the limit"],
        answer: 3,
        why: "Each instance has its own pool, so the database sees up to 120 connections.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a method that returns how many users have a given country code, using a PreparedStatement.",
        hint: "SELECT COUNT(*) returns exactly one row.",
        solution: "long countByCountry(DataSource ds, String country) throws SQLException {\n  try (var c = ds.getConnection();\n       var ps = c.prepareStatement(\"SELECT COUNT(*) FROM users WHERE country = ?\")) {\n    ps.setString(1, country);\n    try (var rs = ps.executeQuery()) {\n      rs.next();\n      return rs.getLong(1);\n    }\n  }\n}",
      },
      {
        level: "medium",
        task: "Insert a list of 5,000 products efficiently with batching inside one transaction, sending a batch every 500 rows.",
        hint: "addBatch for each row, executeBatch every 500 and once at the end, then commit.",
        solution: "try (var c = ds.getConnection();\n     var ps = c.prepareStatement(\"INSERT INTO products (sku, name) VALUES (?, ?)\")) {\n  c.setAutoCommit(false);\n  for (int i = 0; i < products.size(); i++) {\n    ps.setString(1, products.get(i).sku());\n    ps.setString(2, products.get(i).name());\n    ps.addBatch();\n    if ((i + 1) % 500 == 0) ps.executeBatch();\n  }\n  ps.executeBatch();\n  c.commit();\n}",
      },
      {
        level: "hard",
        task: "Write findUsers(String sortBy, boolean desc) that lets callers sort by name, email or created_at only, and rejects anything else.",
        hint: "Map allowed input to a fixed column name; the direction comes from a boolean, not a string.",
        solution: "private static final Map<String, String> SORTABLE = Map.of(\n    \"name\", \"name\", \"email\", \"email\", \"created\", \"created_at\");\nList<String> findUsers(DataSource ds, String sortBy, boolean desc) throws SQLException {\n  String col = SORTABLE.get(sortBy);\n  if (col == null) throw new IllegalArgumentException(\"cannot sort by \" + sortBy);\n  String sql = \"SELECT name FROM users ORDER BY \" + col + (desc ? \" DESC\" : \" ASC\");\n  List<String> out = new ArrayList<>();\n  try (var c = ds.getConnection(); var ps = c.prepareStatement(sql); var rs = ps.executeQuery()) {\n    while (rs.next()) out.add(rs.getString(1));\n  }\n  return out;\n}",
      },
    ],
    faq: [
      { q: "Should I use plain JDBC or JPA?", a: "JPA is productive for typical entity CRUD. Plain JDBC, or Spring's JdbcClient, is better for complex reporting SQL, bulk operations and when you want full control of each query; many apps use both." },
      { q: "Do I still need Class.forName to load the driver?", a: "No. Since JDBC 4 drivers on the classpath register themselves automatically." },
      { q: "How big should my connection pool be?", a: "Usually much smaller than people expect: start with HikariCP's default of 10 per instance, load test, and only grow it if threads wait for connections while the database still has spare capacity." },
      { q: "What is the difference between Statement and PreparedStatement?", a: "Statement runs a fixed SQL string. PreparedStatement takes parameters separately, which prevents SQL injection and lets the database reuse the query plan." },
    ],
  },
};

export default extra;
