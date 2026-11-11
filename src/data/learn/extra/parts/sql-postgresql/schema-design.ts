import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "schema-design/modelling": {
    plain: [
      "Before you write any SQL, you decide what the database should remember. That plan is called a data model. You read the requirements and look for the important nouns: customer, order, product, course, student. Each of these kinds of thing usually becomes a table. The facts about it (a name, a price, a date) become columns.",
      "Then you ask how the things connect. One customer places many orders, but each order belongs to one customer: that is one-to-many. A student takes many courses, and a course has many students: that is many-to-many. The answer to \"how many?\" on each side decides where the links go.",
      "Links are stored as foreign keys: a column that holds the id of a row in another table. For one-to-many, the id goes on the many side. For many-to-many, you add a small extra table in the middle that holds pairs of ids.",
      "An ER diagram (entity-relationship diagram) is the picture of this plan: boxes for tables, lines for relationships, and small symbols at the line ends that show one or many. It is cheap to change a drawing and expensive to change a live database, so draw first.",
    ],
    deepDive: [
      {
        heading: "From requirements to entities and attributes",
        body: "Start with sentences from the people who will use the app, for example: \"A customer places orders. An order contains several products. Each product belongs to one category.\" Underline the nouns. Nouns that have their own facts and their own life become entities (tables). Nouns that only describe something become attributes (columns).\n\nA useful test: does it need its own id, and can it exist on its own? A category has a name and many products, so it is an entity. A colour of a product is usually just a column. An address is a judgement call: if customers have several saved addresses, it becomes its own table.\n\nAlso ask what must be remembered over time. If prices change, an order line must store the price that was paid, not just point to today's price.",
        bullets: ["Nouns with their own facts become tables", "Describing words become columns", "Verbs (places, contains, teaches) become relationships", "Ask: can it exist alone, and can there be several?"],
        visual: {
          type: "flow",
          title: "From a requirement to tables",
          steps: [
            { label: "Collect sentences", detail: "Short statements from users and the product owner" },
            { label: "Find the nouns", detail: "Candidates for entities and attributes" },
            { label: "Find the verbs", detail: "Candidates for relationships" },
            { label: "Ask how many", detail: "One or many on each side of each verb" },
            { label: "Place the keys", detail: "FK on the many side, join table for many-to-many" },
            { label: "Draw and review", detail: "Check every requirement can be answered" },
          ],
        },
      },
      {
        heading: "One-to-many and one-to-one in practice",
        body: "One-to-many is the most common link. The child table gets a column such as customer_id that references customers(id). Add NOT NULL if every order must have a customer, and leave it nullable if the link is optional. Remember to index that column, because Postgres does not do it for you and you will often look up \"all orders of customer 42\".\n\nOne-to-one links are rarer. Use them to split rarely used or sensitive columns into a second table, such as user_profiles next to users. The child gets a foreign key plus a UNIQUE constraint, or it simply uses the parent's id as its own primary key. If two tables are always read together and always one-to-one, they probably belong in one table.\n\nA table can also point to itself. employees.manager_id references employees(id) to build an org chart.",
        bullets: ["FK column + NOT NULL = the link is required", "FK + UNIQUE = one-to-one", "Self reference: a row points to another row in the same table"],
      },
      {
        heading: "Many-to-many and join tables that carry data",
        body: "A relational column holds one value, so you cannot store \"all the courses of this student\" in one cell without breaking the rules. Instead, a join table (also called a junction or link table) holds one row per pair, for example enrolments(student_id, course_id). A composite primary key on both columns stops the same pair being added twice.\n\nJoin tables often grow their own facts. An enrolment has an enrolled_at date and a grade. An order line has a quantity and the unit price at the time of purchase. When that happens, the join table becomes a real entity with a meaningful name (enrolments, order_items), and that is a good sign.\n\nTo find all courses for a student, you join three tables: students to enrolments to courses.",
      },
      {
        heading: "Reading and drawing an ER diagram",
        body: "Most teams use crow's foot notation. Each table is a box listing its columns, with PK and FK marked. A line joins two related tables. At each end of the line, a single bar means \"one\", a three-pronged crow's foot means \"many\", and a small circle means \"zero is allowed\" (optional). So a line from customers (bar) to orders (circle plus crow's foot) reads: one customer has zero or many orders.\n\nYou can draw by hand, but tools save time. dbdiagram.io turns a short text description into a diagram, pgAdmin has an ERD Tool, DBeaver can draw a diagram from an existing database, and Mermaid erDiagram blocks render inside many Markdown viewers, so the diagram can live in Git next to your code.",
        visual: {
          type: "compare",
          title: "Line-end symbols in crow's foot notation",
          columns: [
            { title: "Exactly one", points: ["Two short bars", "The row must exist", "orders to customers", "FK is NOT NULL"] },
            { title: "Zero or one", points: ["Circle and a bar", "Optional single link", "users to user_profiles", "FK + UNIQUE, nullable"] },
            { title: "Zero or many", points: ["Circle and a crow's foot", "Any number, even none", "customers to orders", "The FK lives on this side"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where the keys go for each cardinality",
        columns: [
          { title: "One-to-one", points: ["users and user_profiles", "FK on either side", "Add UNIQUE on the FK", "Or share the same primary key"] },
          { title: "One-to-many", points: ["customers and orders", "FK on the many side", "orders.customer_id", "Index the FK column"] },
          { title: "Many-to-many", points: ["students and courses", "New join table", "enrolments(student_id, course_id)", "Composite PK on both ids"] },
        ],
      },
    ],
    examples: [
      {
        title: "Modelling a small online course site",
        explanation: "Requirements: \"Instructors create courses. Students enrol in many courses. Each enrolment records the date and a final grade.\" Step 1: nouns give instructors, courses and students. Step 2: one instructor teaches many courses, so courses gets instructor_id. Step 3: students and courses are many-to-many, so add enrolments. Step 4: the date and grade describe the pair, not the student or the course, so they go on enrolments.",
        code: {
          lang: "sql",
          code: "CREATE TABLE instructors (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL);\nCREATE TABLE students    (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email text NOT NULL UNIQUE);\nCREATE TABLE courses (\n  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  instructor_id bigint NOT NULL REFERENCES instructors(id),\n  title         text NOT NULL\n);\nCREATE INDEX ON courses (instructor_id);\nCREATE TABLE enrolments (\n  student_id  bigint REFERENCES students(id),\n  course_id   bigint REFERENCES courses(id),\n  enrolled_on date NOT NULL DEFAULT current_date,\n  grade       smallint CHECK (grade BETWEEN 0 AND 100),\n  PRIMARY KEY (student_id, course_id)\n);",
        },
      },
      {
        title: "Fixing a comma-separated tags column",
        explanation: "A blog stores tags as text like 'sql,postgres,tips' in posts.tags. Finding all posts tagged sql needs slow LIKE searches, typos create near-duplicate tags, and renaming a tag means editing every post. Step 1: create a tags table with a unique name. Step 2: create post_tags as a join table. Step 3: copy the data across with string_to_table, which splits text into rows. Step 4: drop the old column after the app reads the new tables.",
        code: {
          lang: "sql",
          code: "CREATE TABLE tags (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL UNIQUE);\nCREATE TABLE post_tags (\n  post_id bigint REFERENCES posts(id) ON DELETE CASCADE,\n  tag_id  bigint REFERENCES tags(id)  ON DELETE CASCADE,\n  PRIMARY KEY (post_id, tag_id)\n);\nINSERT INTO tags (name)\nSELECT DISTINCT trim(t.tag) FROM posts p, string_to_table(p.tags, ',') AS t(tag)\nON CONFLICT (name) DO NOTHING;\nINSERT INTO post_tags (post_id, tag_id)\nSELECT DISTINCT p.id, g.id\nFROM posts p\nCROSS JOIN LATERAL string_to_table(p.tags, ',') AS t(tag)\nJOIN tags g ON g.name = trim(t.tag);",
        },
      },
    ],
    cheatSheet: [
      "Nouns become tables, describing facts become columns, verbs become relationships",
      "One-to-many: the foreign key goes on the many side, and you add an index on it",
      "Many-to-many: a join table with both FKs and a composite PRIMARY KEY",
      "One-to-one: FK plus UNIQUE, or share the parent's primary key",
      "Facts about a pair (grade, quantity) belong on the join table",
      "Crow's foot: bar = one, crow's foot = many, circle = optional",
      "Self reference: employees.manager_id REFERENCES employees(id)",
    ],
    quiz: [
      {
        q: "Each order has exactly one customer, and a customer can have many orders. Where does the foreign key go?",
        options: ["customers.order_id", "A join table customer_orders", "orders.customer_id", "Both tables"],
        answer: 2,
        why: "In one-to-many the many side (orders) stores the id of the one side.",
      },
      {
        q: "Students take many courses and courses have many students. Where should a student's grade for a course be stored?",
        options: ["On the enrolments join table", "On students", "On courses", "In a JSON list on students"],
        answer: 0,
        why: "The grade describes one student in one course, which is exactly one row of the join table.",
      },
      {
        q: "How do you make a foreign key relationship one-to-one?",
        options: ["Add an index to the FK", "Use ON DELETE CASCADE", "Make the FK nullable", "Add a UNIQUE constraint on the FK column"],
        answer: 3,
        why: "UNIQUE stops two child rows pointing to the same parent, so each parent has at most one.",
      },
      {
        q: "In crow's foot notation, what does a small circle next to a crow's foot mean?",
        options: ["Exactly one", "Zero or many", "One or many", "A primary key"],
        answer: 1,
        why: "The circle means zero is allowed and the crow's foot means many.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A blog has authors and posts. Each post has one author; authors write many posts. Write the two CREATE TABLE statements and the index you need.",
        hint: "Put author_id on posts and remember Postgres does not index foreign keys for you.",
        solution: "CREATE TABLE authors (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL);\nCREATE TABLE posts (\n  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  author_id bigint NOT NULL REFERENCES authors(id),\n  title     text NOT NULL\n);\nCREATE INDEX ON posts (author_id);",
      },
      {
        level: "medium",
        task: "Model employees where each employee may have one manager, who is also an employee. Then list each employee with their manager's name, including the CEO who has none.",
        hint: "A self-referencing nullable FK, then a LEFT JOIN of the table to itself.",
        solution: "CREATE TABLE employees (\n  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  name       text NOT NULL,\n  manager_id bigint REFERENCES employees(id)\n);\nSELECT e.name, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id;",
      },
      {
        level: "hard",
        task: "Design tables for a cinema: films, screens, showings (a film on a screen at a time), customers and tickets (one seat per ticket). No seat may be sold twice for the same showing.",
        hint: "Showings links films and screens. Tickets link showings and customers. Use UNIQUE on (showing_id, seat).",
        solution: "CREATE TABLE films     (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, title text NOT NULL);\nCREATE TABLE screens   (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL);\nCREATE TABLE customers (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email text NOT NULL UNIQUE);\nCREATE TABLE showings (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  film_id bigint NOT NULL REFERENCES films(id),\n  screen_id bigint NOT NULL REFERENCES screens(id), starts_at timestamptz NOT NULL);\nCREATE TABLE tickets (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  showing_id bigint NOT NULL REFERENCES showings(id),\n  customer_id bigint NOT NULL REFERENCES customers(id),\n  seat text NOT NULL, UNIQUE (showing_id, seat));",
      },
    ],
    faq: [
      { q: "What is the difference between a logical and a physical data model?", a: "A logical model shows entities, attributes and relationships without database details. A physical model adds real table names, data types, indexes and constraints for one specific database like PostgreSQL." },
      { q: "Should every table have an id column?", a: "Every table needs a primary key. Most entity tables use a generated id, but a pure join table often uses the pair of foreign keys as its primary key instead." },
      { q: "What tool should I use to draw ER diagrams?", a: "Any tool works. dbdiagram.io and Mermaid are text based and easy to keep in Git; pgAdmin and DBeaver can draw a diagram straight from an existing database." },
    ],
  },

  "schema-design/normalisation": {
    plain: [
      "Normalisation is a set of rules for splitting data into tables so that every fact is stored in exactly one place. If a customer's address is written on 500 orders, a move means 500 updates, and missing one leaves the data saying two different things.",
      "The rules come in levels called normal forms. First normal form (1NF) says one value per cell. Second (2NF) says every column must depend on the whole key. Third (3NF) says columns must not depend on other non-key columns. Most app databases aim for 3NF.",
      "The problems normalisation prevents are called anomalies. An update anomaly is changing a fact in one place but not another. An insert anomaly is being unable to save a fact until some unrelated data exists. A delete anomaly is losing a fact by accident when you delete something else.",
      "Denormalising means copying data on purpose, usually to make reads faster. It is a trade: faster reads, but now you must keep the copies in sync. Do it only after measuring a real problem, and write down how the copies stay correct.",
    ],
    deepDive: [
      {
        heading: "1NF: one value per cell, no repeating groups",
        body: "A table is in first normal form when each cell holds a single value and there are no repeating columns. Two common breaks: a phones column holding '555-1234, 555-9876', and columns like phone1, phone2, phone3. Both make queries awkward (how do you find who owns 555-9876?) and both put a silent limit on the data.\n\nThe fix is a child table: customer_phones(customer_id, phone, kind), one row per phone. Now any number of phones fits, each one can be indexed, and a UNIQUE constraint can stop duplicates.\n\nPostgres arrays and jsonb technically let you store lists in a cell. That is fine for data you always read and write as a whole, such as a list of UI preferences. If you need to search, join, or enforce rules on the items, use rows instead.",
        bullets: ["Lists in a cell: split into a child table", "Columns named x1, x2, x3: split into rows", "Arrays and jsonb are fine for blobs you never query by item"],
      },
      {
        heading: "2NF and 3NF: depend on the key, the whole key, and nothing but the key",
        body: "A functional dependency means one column decides another: product_id decides product_name. Normal forms are about checking that these dependencies point at the key.\n\n2NF matters when the key has several columns. In order_items(order_id, product_id, quantity, product_name), quantity depends on both columns, but product_name depends only on product_id. That is a partial dependency, so product_name moves to products.\n\n3NF removes transitive dependencies, where a column depends on another non-key column. In employees(id, name, dept_id, dept_name), dept_name depends on dept_id, not on the employee. Move it to departments.\n\nBoyce-Codd normal form (BCNF) is a slightly stricter 3NF that matters in rare tables with several overlapping candidate keys. For everyday app design, 3NF is the goal.",
        visual: {
          type: "flow",
          title: "Normalising one messy orders table",
          steps: [
            { label: "Raw sheet", detail: "orders with customer, city and a product list" },
            { label: "1NF", detail: "One row per order line; no lists in cells" },
            { label: "2NF", detail: "Product name moves to products (depends on product_id only)" },
            { label: "3NF", detail: "City moves to customers (depends on customer, not order)" },
            { label: "Result", detail: "customers, orders, order_items, products" },
          ],
        },
      },
      {
        heading: "Spotting anomalies in a real table",
        body: "Picture a single enrolments sheet: student_name, student_email, course_code, course_title, teacher_name. Three anomalies hide inside.\n\nUpdate anomaly: a teacher changes their name and you must update every row for every course they teach. Miss one and reports disagree.\n\nInsert anomaly: you want to add a new course before anyone enrols. There is no row to put it in without inventing a fake student.\n\nDelete anomaly: the last student leaves a course, you delete the row, and the course title and teacher disappear with it.\n\nThe quick test for any table: if I change this one fact, how many rows must change? If the answer is \"more than one\", that fact probably belongs in its own table.",
      },
      {
        heading: "Denormalising on purpose, and doing it safely",
        body: "Sometimes a join or an aggregate is too slow on a hot path, like showing comment counts on every post in a feed. Common, controlled denormalisations are:\n\nA counter column (posts.comment_count) kept in sync by the same transaction that inserts a comment, or by a trigger. A materialised view for dashboards, refreshed on a schedule. A generated column (GENERATED ALWAYS AS (...) STORED) for a value computed from other columns in the same row, which Postgres keeps correct automatically.\n\nNote that some copies are not denormalisation at all. order_items.unit_price is the price paid at that moment, a separate historical fact, and it must not change when the product price changes.\n\nBefore you denormalise, measure with EXPLAIN ANALYZE, try an index first, and write down who updates the copy and how you would rebuild it if it drifts.",
        bullets: ["Measure first; an index often fixes it", "Counter column + trigger or same-transaction update", "Materialised view for reports", "Generated column for same-row calculations", "Plan how to rebuild a drifted copy"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "The three anomalies",
        columns: [
          { title: "Update", points: ["Same fact on many rows", "Teacher name on every enrolment", "Change one, miss others", "Data disagrees with itself"] },
          { title: "Insert", points: ["Fact needs unrelated data", "New course, no students yet", "Must invent a fake row", "Or simply can't save it"] },
          { title: "Delete", points: ["Fact lives only with other data", "Last student leaves", "Course info vanishes too", "Lost by accident"] },
        ],
      },
    ],
    examples: [
      {
        title: "Normalising a spreadsheet import",
        explanation: "A shop imported a sheet: sales(invoice_no, invoice_date, customer_email, customer_name, sku, product_name, qty, unit_price). Step 1: the key of a row is (invoice_no, sku). Step 2: invoice_date and customer_email depend only on invoice_no (partial dependency), so they move to invoices. Step 3: customer_name depends on customer_email, a non-key column (transitive), so it moves to customers. Step 4: product_name depends only on sku, so it moves to products. unit_price stays on the line because it is the price paid on that invoice.",
        code: {
          lang: "sql",
          code: "CREATE TABLE customers (email text PRIMARY KEY, name text NOT NULL);\nCREATE TABLE products  (sku text PRIMARY KEY, name text NOT NULL);\nCREATE TABLE invoices (\n  invoice_no     text PRIMARY KEY,\n  invoice_date   date NOT NULL,\n  customer_email text NOT NULL REFERENCES customers(email)\n);\nCREATE TABLE invoice_lines (\n  invoice_no text REFERENCES invoices(invoice_no),\n  sku        text REFERENCES products(sku),\n  qty        int  NOT NULL CHECK (qty > 0),\n  unit_price numeric(10,2) NOT NULL,\n  PRIMARY KEY (invoice_no, sku)\n);",
        },
      },
      {
        title: "A safe comment counter",
        explanation: "The home feed shows 50 posts with their comment counts, and counting comments for each post on every page view is slow. Step 1: add posts.comment_count with default 0. Step 2: a trigger adds 1 on insert and subtracts 1 on delete, inside the same transaction, so the count cannot drift from normal writes. Step 3: keep a repair query that recomputes all counts, to run if a bulk load ever bypasses the trigger.",
        code: {
          lang: "sql",
          code: "ALTER TABLE posts ADD COLUMN comment_count int NOT NULL DEFAULT 0;\n\nCREATE FUNCTION bump_comment_count() RETURNS trigger LANGUAGE plpgsql AS $$\nBEGIN\n  IF TG_OP = 'INSERT' THEN\n    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;\n  ELSE\n    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;\n  END IF;\n  RETURN NULL;\nEND $$;\n\nCREATE TRIGGER comments_count AFTER INSERT OR DELETE ON comments\nFOR EACH ROW EXECUTE FUNCTION bump_comment_count();",
        },
      },
    ],
    cheatSheet: [
      "1NF: one value per cell, no phone1/phone2/phone3 columns",
      "2NF: with a composite key, no column may depend on only part of it",
      "3NF: no column may depend on another non-key column",
      "Test: if one fact changes, how many rows must change? More than one means split",
      "Price paid on an order line is a historical fact, not a duplicate",
      "Denormalise only after EXPLAIN ANALYZE shows a real problem an index can't fix",
      "Generated column: total numeric GENERATED ALWAYS AS (qty * price) STORED",
    ],
    quiz: [
      {
        q: "order_items(order_id, product_id, qty, product_name) has key (order_id, product_id). Which normal form does product_name break?",
        options: ["1NF", "3NF only", "None", "2NF"],
        answer: 3,
        why: "product_name depends on only part of the composite key (product_id), which is a partial dependency.",
      },
      {
        q: "employees(id, name, dept_id, dept_name). What is wrong?",
        options: ["dept_name depends on dept_id, a non-key column, which breaks 3NF", "Nothing, it is in 3NF", "It breaks 1NF", "id should be composite"],
        answer: 0,
        why: "That is a transitive dependency: id decides dept_id, and dept_id decides dept_name.",
      },
      {
        q: "You cannot add a new course until a student enrols in it. Which anomaly is this?",
        options: ["Update anomaly", "Insert anomaly", "Delete anomaly", "Phantom read"],
        answer: 1,
        why: "An insert anomaly is when a fact cannot be stored without some unrelated data.",
      },
      {
        q: "Which is the best first step before denormalising a slow page?",
        options: ["Copy the data into every table that reads it", "Switch to a NoSQL database", "Measure the query with EXPLAIN ANALYZE and try an index", "Remove all foreign keys"],
        answer: 2,
        why: "Many slow reads are fixed by an index, and measuring tells you whether copying data would really help.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "contacts(id, name, phones) stores phones as '555-1, 555-2'. Redesign it to meet 1NF.",
        hint: "Move phones to a child table with one row per phone.",
        solution: "CREATE TABLE contacts (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL);\nCREATE TABLE contact_phones (\n  contact_id bigint NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,\n  phone      text   NOT NULL,\n  PRIMARY KEY (contact_id, phone)\n);",
      },
      {
        level: "medium",
        task: "Normalise loans(member_id, member_email, book_isbn, book_title, loaned_on, returned_on) to 3NF. One member can borrow the same book on different days.",
        hint: "List what each column depends on. The loan itself needs its own key.",
        solution: "CREATE TABLE members (id bigint PRIMARY KEY, email text NOT NULL UNIQUE);\nCREATE TABLE books   (isbn text PRIMARY KEY, title text NOT NULL);\nCREATE TABLE loans (\n  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  member_id   bigint NOT NULL REFERENCES members(id),\n  book_isbn   text   NOT NULL REFERENCES books(isbn),\n  loaned_on   date   NOT NULL,\n  returned_on date\n);",
      },
      {
        level: "hard",
        task: "posts.comment_count is kept by a trigger, but a bulk import skipped triggers. Write one statement that repairs every count, including posts with zero comments.",
        hint: "UPDATE ... FROM a grouped subquery misses posts with no comments; a correlated subquery does not.",
        solution: "UPDATE posts p\nSET comment_count = (\n  SELECT count(*) FROM comments c WHERE c.post_id = p.id\n)\nWHERE comment_count IS DISTINCT FROM (\n  SELECT count(*) FROM comments c WHERE c.post_id = p.id\n);",
      },
    ],
    faq: [
      { q: "Do I need to normalise beyond 3NF?", a: "Rarely. 3NF removes the anomalies that hurt most apps. BCNF, 4NF and 5NF handle unusual cases with overlapping keys or independent multi-valued facts." },
      { q: "Is storing JSON in Postgres against normalisation?", a: "A jsonb column holding many values breaks strict 1NF, but it is fine for data you read and write as a whole. If you filter, join or enforce rules on the parts, use normal columns and tables." },
      { q: "Are data warehouses normalised?", a: "Usually not fully. Analytics systems often use star schemas, where a big fact table joins to wide, deliberately denormalised dimension tables, because they are read far more than written." },
    ],
  },

  "schema-design/types-constraints": {
    plain: [
      "Every column has a data type that decides what it can hold: whole numbers, exact decimals, text, dates, true or false. Picking the right type gives you free checking (you cannot store 'banana' in a date) and makes storage and sorting correct.",
      "Constraints are rules the database enforces on every insert and update, no matter which app, script or person sends the data. A primary key says each row is unique. A foreign key says a referenced row must exist. CHECK says a condition must be true. UNIQUE says no duplicates.",
      "Why not just validate in the app? Because there is never only one app. There are admin scripts, data imports, a second service, and a tired developer in psql at midnight. The database is the last line of defence, and it never forgets to check.",
      "When a rule is broken, Postgres rejects the statement with a clear error, such as \"violates check constraint\". That is good: a loud failure today is much cheaper than quietly wrong data found months later.",
    ],
    deepDive: [
      {
        heading: "Choosing data types in PostgreSQL",
        body: "Numbers: integer is 4 bytes and tops out at about 2.1 billion; bigint is 8 bytes and is the safe default for ids. Use numeric(p,s) for money and anything that must be exact, never real or double precision, which are approximate.\n\nText: in Postgres, text and varchar(n) perform the same. varchar(n) only adds a length check, so use text and add a CHECK if a limit is a real business rule.\n\nTime: timestamptz stores an exact moment (internally in UTC) and converts to the session time zone for display. Use it for events. Use date for calendar days like a birthday, and plain timestamp only for local wall-clock times with no zone.\n\nOthers: boolean for yes or no, uuid for ids generated outside the database, jsonb for flexible documents, and inet for IP addresses.",
        bullets: ["Ids: bigint identity (or uuid)", "Money: numeric(12,2)", "Moments: timestamptz; calendar days: date", "Strings: text, plus CHECK for real limits", "Flexible attributes: jsonb"],
      },
      {
        heading: "Surrogate or natural keys, identity or UUID",
        body: "A natural key is a real-world value that is already unique, like an ISBN or a country code. A surrogate key is a made-up id with no meaning. Natural keys feel tidy, but real-world values change (people change emails) and are sometimes reused, and every foreign key must change with them. Most teams use a surrogate primary key and add a UNIQUE constraint on the natural key.\n\nFor surrogate ids, bigint GENERATED ALWAYS AS IDENTITY is the modern standard SQL way; it replaces the older serial type. UUIDs are useful when ids are created by clients or across many databases, or when you do not want ids to be guessable. gen_random_uuid() (UUID version 4) is built in, and PostgreSQL 18 adds uuidv7(), whose time-ordered values keep B-tree indexes compact.",
        visual: {
          type: "compare",
          title: "Common choices for a primary key",
          columns: [
            { title: "bigint identity", points: ["8 bytes, fast to compare", "Ordered, compact indexes", "Guessable in URLs", "Needs the database to create it"] },
            { title: "UUID", points: ["16 bytes", "Created anywhere, no clash", "Not guessable", "v7 is time-ordered, v4 is random"] },
            { title: "Natural key", points: ["Already meaningful (ISBN)", "No extra column", "Can change or be reused", "Changes ripple to every FK"] },
          ],
        },
      },
      {
        heading: "Foreign keys and their ON DELETE rules",
        body: "A foreign key checks that every value in the child column exists in the parent. What happens when someone deletes a parent row is your choice. NO ACTION (the default) and RESTRICT both reject the delete if children exist; the difference is that NO ACTION can be checked at the end of the transaction if the constraint is declared DEFERRABLE. CASCADE deletes the children too, which is right for parts that cannot live alone, like order lines. SET NULL keeps the child but clears the link, which suits optional links like a post whose author account was removed. SET DEFAULT puts the column's default value instead.\n\nThe same choices exist for ON UPDATE, but surrogate keys never change, so it rarely matters.\n\nTwo practical notes: index the child column yourself, and remember that CASCADE on a big table can delete millions of rows in one statement.",
        visual: {
          type: "tree",
          title: "DELETE FROM customers WHERE id = 7",
          root: "Children still point to customer 7",
          children: [
            { label: "NO ACTION / RESTRICT", children: ["Delete is rejected", "Safest default"] },
            { label: "CASCADE", children: ["Child rows are deleted too", "Use for owned parts"] },
            { label: "SET NULL", children: ["Child FK becomes NULL", "Column must be nullable"] },
            { label: "SET DEFAULT", children: ["Child FK gets its default", "Default row must exist"] },
          ],
        },
      },
      {
        heading: "UNIQUE, CHECK and the rules beyond them",
        body: "UNIQUE creates a unique index behind the scenes. By default NULLs count as different, so many rows can have a NULL email. Since PostgreSQL 15 you can write UNIQUE NULLS NOT DISTINCT to allow only one.\n\nA unique index can also be partial or use an expression. CREATE UNIQUE INDEX ON users (lower(email)) blocks 'Ann@x.com' when 'ann@x.com' exists. Adding WHERE deleted_at IS NULL lets a soft-deleted user's email be reused.\n\nCHECK takes any boolean expression on the same row: price >= 0, status IN ('new','paid','shipped'), end_at > start_at. It cannot look at other rows or tables.\n\nFor \"no two bookings of the same room may overlap\", use an exclusion constraint with a range column: EXCLUDE USING gist (room_id WITH =, during WITH &&), which needs the btree_gist extension for the equality part.",
        bullets: ["UNIQUE NULLS NOT DISTINCT (PG 15+)", "Case-insensitive unique: index on lower(email)", "CHECK sees only the current row", "EXCLUDE USING gist for overlaps"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Checks Postgres runs on one INSERT",
        steps: [
          { label: "Type input", detail: "Each value must parse as its column type" },
          { label: "NOT NULL", detail: "Required columns must have a value" },
          { label: "CHECK", detail: "Each row condition must not be false" },
          { label: "UNIQUE / PK", detail: "Unique indexes reject duplicates" },
          { label: "FOREIGN KEY", detail: "Referenced parent row must exist" },
          { label: "Row stored", detail: "Any failure aborts the whole statement" },
        ],
      },
    ],
    examples: [
      {
        title: "A users table that rejects bad data",
        explanation: "Requirements: emails are unique ignoring case, usernames are 3 to 30 characters, a status is one of three values, and the signup time is an exact moment. Step 1: text columns with CHECKs for length and allowed values. Step 2: a unique expression index on lower(email). Step 3: try a duplicate in different case and watch it fail with a clear error.",
        code: {
          lang: "sql",
          code: "CREATE TABLE users (\n  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email      text NOT NULL,\n  username   text NOT NULL UNIQUE CHECK (length(username) BETWEEN 3 AND 30),\n  status     text NOT NULL DEFAULT 'active'\n             CHECK (status IN ('active', 'suspended', 'deleted')),\n  created_at timestamptz NOT NULL DEFAULT now()\n);\nCREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));\n\nINSERT INTO users (email, username) VALUES ('Ann@x.com', 'ann');\nINSERT INTO users (email, username) VALUES ('ann@x.com', 'ann2');\n-- ERROR: duplicate key value violates unique constraint \"users_email_lower_key\"",
        },
      },
      {
        title: "Stopping double-booked rooms",
        explanation: "A UNIQUE (room_id, start_at) only blocks bookings that start at exactly the same time; 10:00 to 12:00 and 11:00 to 13:00 would both be accepted. Step 1: store the booking as a tstzrange (a range of timestamptz). Step 2: enable btree_gist so the gist index can compare room_id with =. Step 3: add an exclusion constraint saying no two rows may have the same room and overlapping ranges (&&).",
        code: {
          lang: "sql",
          code: "CREATE EXTENSION IF NOT EXISTS btree_gist;\n\nCREATE TABLE room_bookings (\n  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  room_id bigint NOT NULL REFERENCES rooms(id),\n  during  tstzrange NOT NULL,\n  EXCLUDE USING gist (room_id WITH =, during WITH &&)\n);\n\nINSERT INTO room_bookings (room_id, during)\nVALUES (1, '[2026-03-01 10:00+00, 2026-03-01 12:00+00)');\nINSERT INTO room_bookings (room_id, during)\nVALUES (1, '[2026-03-01 11:00+00, 2026-03-01 13:00+00)');\n-- ERROR: conflicting key value violates exclusion constraint",
        },
      },
    ],
    cheatSheet: [
      "id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY  (preferred over serial)",
      "numeric(12,2) for money; never real or double precision",
      "text and varchar(n) are equally fast in Postgres; varchar(n) only adds a length check",
      "timestamptz for events; date for calendar days",
      "FK default is NO ACTION; add ON DELETE CASCADE only for owned children",
      "CREATE UNIQUE INDEX ON users (lower(email));  case-insensitive uniqueness",
      "UNIQUE NULLS NOT DISTINCT (PG 15+) allows at most one NULL",
      "\\d table in psql lists columns, indexes and constraints",
    ],
    quiz: [
      {
        q: "Which type should store a product price?",
        options: ["real", "double precision", "integer", "numeric(10,2)"],
        answer: 3,
        why: "numeric stores exact decimals; floating-point types round in surprising ways.",
      },
      {
        q: "A table has UNIQUE (email) and email is nullable. How many rows can have a NULL email by default?",
        options: ["None", "Exactly one", "Any number", "It depends on the index type"],
        answer: 2,
        why: "By default NULLs are treated as distinct, so UNIQUE allows many of them unless you add NULLS NOT DISTINCT.",
      },
      {
        q: "Which ON DELETE rule fits order_items referencing orders, where lines make no sense without their order?",
        options: ["CASCADE", "SET NULL", "SET DEFAULT", "No foreign key at all"],
        answer: 0,
        why: "Order lines are owned by the order, so deleting the order should delete them too.",
      },
      {
        q: "Why can't a CHECK constraint stop two bookings of the same room from overlapping?",
        options: ["CHECK cannot compare timestamps", "CHECK only sees the current row, not other rows", "CHECK only works on numbers", "CHECK is ignored on INSERT"],
        answer: 1,
        why: "CHECK evaluates one row at a time; overlap between rows needs an exclusion constraint.",
      },
      {
        q: "What does GENERATED ALWAYS AS IDENTITY give you compared with serial?",
        options: ["Random ids", "UUIDs", "Standard SQL identity that blocks accidental manual ids by default", "Smaller storage"],
        answer: 2,
        why: "Identity columns are the SQL-standard replacement for serial, and ALWAYS rejects manual values unless you use OVERRIDING SYSTEM VALUE.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a products table with a unique sku, a non-empty name, a price that can't be negative, and a stock count that can't go below zero.",
        hint: "Use NOT NULL, UNIQUE and CHECK.",
        solution: "CREATE TABLE products (\n  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  sku   text NOT NULL UNIQUE,\n  name  text NOT NULL CHECK (name <> ''),\n  price numeric(10,2) NOT NULL CHECK (price >= 0),\n  stock int NOT NULL DEFAULT 0 CHECK (stock >= 0)\n);",
      },
      {
        level: "medium",
        task: "posts.author_id references users(id). When a user is deleted, their posts should stay but show no author. Write the column definition and the index.",
        hint: "The column must be nullable for SET NULL to work.",
        solution: "ALTER TABLE posts\n  ADD COLUMN author_id bigint REFERENCES users(id) ON DELETE SET NULL;\nCREATE INDEX ON posts (author_id);",
      },
      {
        level: "hard",
        task: "Users soft-delete by setting deleted_at. Make email unique (ignoring case) among active users only, so a deleted user's email can sign up again.",
        hint: "A unique index can be both an expression index and a partial index.",
        solution: "CREATE UNIQUE INDEX users_active_email_key\n  ON users (lower(email))\n  WHERE deleted_at IS NULL;\n-- Two rows with 'a@x.com' are allowed only if\n-- at least one of them has deleted_at set.",
      },
    ],
    faq: [
      { q: "Should I use varchar(255) or text in PostgreSQL?", a: "Use text. They are stored and processed the same way, and 255 is a habit from other databases. If a length limit is a real rule, add a CHECK or use varchar(n) on purpose." },
      { q: "Does PostgreSQL create an index for a foreign key?", a: "No. It indexes the referenced primary key or unique column, but not the referencing column. Add one yourself, especially if you join on it or delete parent rows." },
      { q: "Should I use an ENUM type or a CHECK constraint for status values?", a: "Both work. CHECK (status IN (...)) is easy to change in a migration. An enum type is compact and self-documenting, but removing or renaming values is harder." },
      { q: "Is UUID slower than bigint as a primary key?", a: "A bit: UUIDs are twice as big, and random v4 UUIDs scatter inserts across the index. Time-ordered UUIDs such as v7 avoid most of the insert cost." },
    ],
  },

  "schema-design/migrations": {
    plain: [
      "A migration is a small script that changes your database structure, such as adding a table or a column. Each one gets a version number and lives in Git next to your code, so every laptop, test server and production database can be brought to exactly the same shape.",
      "A migration tool runs the scripts in order and records which ones have already run in a special table. When you deploy, it applies only the new ones. You never change the production schema by hand, because then nobody knows what the real schema is.",
      "The hard part is changing a busy database without stopping the app. Some changes lock a table while they work, and every query waits behind them. Big updates can run for minutes. So risky changes are split into small, safe steps.",
      "The golden rule: at every moment, the database must work with both the old and the new version of your code, because during a deploy both versions are running at once.",
    ],
    deepDive: [
      {
        heading: "How migration tools work",
        body: "Every tool follows the same idea. Migrations are files with an order, such as V3__add_orders.sql (Flyway), 0003_add_orders.up.sql and .down.sql (golang-migrate), or Python files with upgrade() and downgrade() functions (Alembic). The tool creates a history table in your database, for example flyway_schema_history, alembic_version or schema_migrations, and records each migration it applies.\n\nOn deploy, the tool compares the files with the history table and runs only the missing ones, in order. Some tools also store a checksum and refuse to run if an applied file was edited later.\n\nPostgres has transactional DDL: most CREATE and ALTER statements can run inside a transaction, so a failed migration rolls back cleanly instead of leaving half a change. A few commands, like CREATE INDEX CONCURRENTLY, cannot run in a transaction, and tools let you mark those migrations specially.",
        bullets: ["Flyway, Liquibase: SQL or XML, any language", "Alembic (Python), Prisma Migrate, Django and Rails migrations", "golang-migrate, dbmate, sqitch: plain SQL files", "Never edit a migration that already ran; add a new one"],
        visual: {
          type: "sequence",
          title: "A deploy that applies one new migration",
          actors: ["CI deploy", "Migration tool", "PostgreSQL"],
          messages: [
            { from: 0, to: 1, label: "migrate up" },
            { from: 1, to: 2, label: "Read history table" },
            { from: 2, to: 1, label: "Applied: 1, 2, 3" },
            { from: 1, to: 2, label: "BEGIN; run 0004; COMMIT" },
            { from: 1, to: 2, label: "Insert 0004 into history" },
            { from: 1, to: 0, label: "Done, start new app version" },
          ],
        },
      },
      {
        heading: "Locks: why a tiny ALTER can freeze the app",
        body: "Most ALTER TABLE forms take an ACCESS EXCLUSIVE lock, which blocks even plain SELECTs. If the change itself is instant, like adding a nullable column, the lock lasts only milliseconds. The danger is the wait before it.\n\nSuppose a long report query holds a lock on the table. Your ALTER waits for it. Every new query on that table now queues behind your waiting ALTER, because Postgres grants locks in order. In seconds, all app connections are stuck and the site looks down.\n\nThe fix is to give DDL a short patience. Run SET lock_timeout = '5s' at the start of the migration. If the lock is not granted in time, the ALTER fails instead of blocking everyone, and you retry later. Many teams also set statement_timeout for migrations, and check pg_stat_activity for long-running transactions before deploying.",
        visual: {
          type: "flow",
          title: "The lock queue pile-up",
          steps: [
            { label: "Long query running", detail: "Holds a shared lock on orders" },
            { label: "ALTER TABLE waits", detail: "Needs ACCESS EXCLUSIVE" },
            { label: "New SELECTs queue", detail: "They wait behind the ALTER" },
            { label: "Connections run out", detail: "The app times out" },
            { label: "Fix", detail: "lock_timeout makes the ALTER give up and retry" },
          ],
        },
      },
      {
        heading: "Which changes are safe, and how to do the risky ones",
        body: "Fast and safe: adding a nullable column; adding a column with a constant default (instant since PostgreSQL 11, no table rewrite); dropping a column (only marks it hidden); making a varchar longer.\n\nRewrites the whole table under a full lock: changing most column types, such as integer to bigint, and adding a column with a volatile default like clock_timestamp().\n\nScans the whole table while holding a strong lock: SET NOT NULL and adding a CHECK (both block reads and writes), or a foreign key (blocks writes). The safe pattern is to add the constraint with NOT VALID (instant, applies to new rows only), then run VALIDATE CONSTRAINT, which checks old rows under a lighter lock that allows reads and writes. Since PostgreSQL 12, SET NOT NULL skips its scan if a valid CHECK (col IS NOT NULL) already exists.\n\nIndexes: use CREATE INDEX CONCURRENTLY. If it fails, it leaves an INVALID index that you must drop and recreate.",
        bullets: ["Instant: nullable column, constant default, DROP COLUMN", "Rewrite: most type changes", "Constraint: ADD ... NOT VALID, then VALIDATE CONSTRAINT", "Index: CREATE INDEX CONCURRENTLY, outside a transaction"],
      },
      {
        heading: "Backfills and rolling back",
        body: "A single UPDATE of 50 million rows holds row locks for its whole run, creates 50 million dead row versions at once, can fill the disk with WAL (the write-ahead log) and makes replicas fall behind. Instead, update in batches of a few thousand rows, each in its own short transaction, walking through the table by id range. Pause briefly between batches and watch replication lag.\n\nDown migrations are useful in development, but in production they can destroy data: the down for \"add column\" drops the column and everything written to it. Many teams prefer to roll forward: fix a mistake with a new migration. Whatever you choose, test the migration on a copy of production-sized data first, because a change that is instant on 1,000 rows can take an hour on 100 million.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "How expensive is this ALTER?",
        columns: [
          { title: "Instant (metadata only)", points: ["ADD COLUMN, nullable", "ADD COLUMN DEFAULT 0 (PG 11+)", "DROP COLUMN", "ADD CONSTRAINT ... NOT VALID"] },
          { title: "Scans under a strong lock", points: ["SET NOT NULL without a valid CHECK", "ADD CHECK without NOT VALID", "ADD FOREIGN KEY without NOT VALID"] },
          { title: "Rewrites the table", points: ["integer to bigint", "Volatile default, e.g. clock_timestamp()", "VACUUM FULL or CLUSTER"] },
        ],
      },
    ],
    examples: [
      {
        title: "Making a column NOT NULL on a big table",
        explanation: "orders.customer_id has been nullable for years, and you now want NOT NULL on a 40 million row table without blocking traffic. Step 1: add a CHECK with NOT VALID, which is instant. Step 2: VALIDATE it; this scans the table but allows reads and writes. Step 3: SET NOT NULL, which uses the valid CHECK and skips its own scan (PostgreSQL 12+). Step 4: drop the now redundant CHECK. A short lock_timeout protects each step.",
        code: {
          lang: "sql",
          code: "SET lock_timeout = '5s';\n\nALTER TABLE orders\n  ADD CONSTRAINT orders_customer_id_not_null\n  CHECK (customer_id IS NOT NULL) NOT VALID;\n\nALTER TABLE orders VALIDATE CONSTRAINT orders_customer_id_not_null;\n\nALTER TABLE orders ALTER COLUMN customer_id SET NOT NULL;\nALTER TABLE orders DROP CONSTRAINT orders_customer_id_not_null;",
        },
      },
      {
        title: "Backfilling in batches from a script",
        explanation: "A new column orders.total_cents must be filled from total for 30 million rows. Step 1: loop over id ranges of 10,000. Step 2: each UPDATE commits on its own, so locks are short and autovacuum can clean up as you go. Step 3: sleep a little between batches. Step 4: stop when the range passes the max id. psql runs each statement in its own transaction by default, so a simple shell loop works.",
        code: {
          lang: "bash",
          code: "max=$(psql -tAc \"SELECT max(id) FROM orders\")\nstep=10000\nfor ((start=1; start<=max; start+=step)); do\n  psql -q -c \"UPDATE orders\n    SET total_cents = (total * 100)::bigint\n    WHERE id >= $start AND id < $start + $step\n      AND total_cents IS NULL;\"\n  sleep 0.2\ndone",
        },
      },
    ],
    cheatSheet: [
      "SET lock_timeout = '5s'; at the top of every migration on a busy database",
      "ADD COLUMN with a constant DEFAULT is instant since PostgreSQL 11",
      "ADD CONSTRAINT ... NOT VALID, then ALTER TABLE ... VALIDATE CONSTRAINT ...",
      "CREATE INDEX CONCURRENTLY cannot run inside BEGIN ... COMMIT",
      "Failed concurrent build leaves an INVALID index: DROP INDEX CONCURRENTLY and retry",
      "Backfill by id range in small committed batches, not one giant UPDATE",
      "Never edit an applied migration; write a new one",
      "Test migrations on production-sized data before deploying",
    ],
    quiz: [
      {
        q: "An ALTER TABLE that should take 1 ms has frozen the whole app. What is the most likely cause?",
        options: ["The ALTER is rewriting the table", "Postgres ran out of disk", "It is waiting for a lock behind a long transaction, and other queries queue behind it", "The migration tool crashed"],
        answer: 2,
        why: "A waiting ACCESS EXCLUSIVE request blocks every later query on that table, so set lock_timeout.",
      },
      {
        q: "Which change rewrites the whole table?",
        options: ["ALTER COLUMN id TYPE bigint (from integer)", "ADD COLUMN note text", "ADD COLUMN active boolean DEFAULT true", "DROP COLUMN note"],
        answer: 0,
        why: "Changing integer to bigint changes the stored size of every row, so the table is rewritten.",
      },
      {
        q: "What does adding a foreign key with NOT VALID do?",
        options: ["Disables the foreign key", "Checks only old rows", "Deletes invalid rows", "Enforces it for new and changed rows without scanning existing rows yet"],
        answer: 3,
        why: "NOT VALID skips the initial scan; VALIDATE CONSTRAINT checks existing rows later under a lighter lock.",
      },
      {
        q: "Why do many teams prefer rolling forward over running down migrations in production?",
        options: ["Down migrations are not supported by Postgres", "A down migration can destroy data written since the up ran", "Rolling forward is faster to type", "Migration tools forbid down migrations"],
        answer: 1,
        why: "Dropping a column or table in a down migration throws away real data written after the deploy.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write an up and a down migration that add a nullable text column phone to customers.",
        hint: "Two files; the down reverses the up.",
        solution: "-- 0012_add_customer_phone.up.sql\nALTER TABLE customers ADD COLUMN phone text;\n\n-- 0012_add_customer_phone.down.sql\nALTER TABLE customers DROP COLUMN phone;",
      },
      {
        level: "medium",
        task: "Add a foreign key from orders.customer_id to customers(id) on a large, busy table without a long blocking scan.",
        hint: "Two statements: add NOT VALID, then validate.",
        solution: "SET lock_timeout = '5s';\nALTER TABLE orders\n  ADD CONSTRAINT orders_customer_fk\n  FOREIGN KEY (customer_id) REFERENCES customers(id) NOT VALID;\nALTER TABLE orders VALIDATE CONSTRAINT orders_customer_fk;",
      },
      {
        level: "hard",
        task: "Plan the zero-downtime rename of users.name to users.full_name as a list of migrations and deploys, in order.",
        hint: "Expand, migrate, contract. Old and new code must both work at every step.",
        solution: "1. Migration: ADD COLUMN full_name text (nullable).\n2. Deploy: code writes both name and full_name, reads name.\n3. Backfill: UPDATE ... SET full_name = name in id batches.\n4. Deploy: code reads full_name, still writes both.\n5. Migration: CHECK NOT VALID, VALIDATE, SET NOT NULL.\n6. Deploy: code stops writing name.\n7. Migration: DROP COLUMN name.",
      },
    ],
    faq: [
      { q: "Can I just use ALTER TABLE RENAME COLUMN?", a: "It is instant, but every running app instance that still uses the old name breaks immediately. It is only safe if you can stop the app or if a view or code change covers both names during the deploy." },
      { q: "Should migrations run automatically when the app starts?", a: "It is simple for small apps, but with many instances they may race. Many teams run migrations as a separate deploy step before starting the new app version." },
      { q: "Do ORMs handle zero-downtime migrations for me?", a: "No. ORMs generate the SQL, but they do not know your table sizes or traffic. You still need to split risky changes and use patterns like NOT VALID and CONCURRENTLY." },
    ],
  },
};

export default extra;
