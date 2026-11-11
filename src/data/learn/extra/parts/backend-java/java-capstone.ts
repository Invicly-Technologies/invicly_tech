import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "java-capstone/java-capstone": {
    plain: [
      "The capstone is one real backend that uses everything from this path. A good choice is a room booking API: people sign up, see which rooms are free, and book them; admins add rooms. It is small enough to finish, but it has real problems to solve, like two people trying to book the same room at the same time.",
      "Plan before you code. Write down the things in your app (users, rooms, bookings), the rules (no double bookings, only admins create rooms), and the URLs your API offers. An hour of planning saves days of rework.",
      "Then build in thin slices. First a database table, an entity and one endpoint, with a test. Then security. Then caching. Then Docker and CI. After each slice the app should run and the tests should pass. A small app that works beats a big one that half works.",
      "The finished repo is your proof of skill. A reviewer should be able to clone it, run one command, and see it work. A clear README, passing CI and clean commits tell them you can be trusted with a real codebase.",
    ],
    deepDive: [
      {
        heading: "Design the domain and the REST endpoints",
        body: "Start with nouns and rules. For a booking API the entities are User, Room and Booking. A Booking belongs to one user and one room and has a check-in date, a check-out date and a status (CONFIRMED or CANCELLED). The core rule: two confirmed bookings for the same room must not overlap.\n\nMap resources to URLs and HTTP methods. GET /rooms?from=2026-12-01&to=2026-12-03 lists free rooms. POST /bookings creates one and returns 201 Created with a Location header. DELETE /bookings/{id} cancels (or POST /bookings/{id}/cancel if you prefer keeping history). POST /rooms is admin only.\n\nDecide error responses up front: 400 for invalid input, 401 when not logged in, 403 when logged in but not allowed, 404 for unknown ids, 409 Conflict when a room is already taken. Spring's ProblemDetail gives these a standard JSON shape (RFC 9457).",
        bullets: ["Use DTOs for requests and responses, never entities", "Validate input with @Valid and Bean Validation annotations", "Paginate lists with Pageable from the start"],
        visual: {
          type: "tree",
          title: "Booking API resources",
          root: "/api",
          children: [
            { label: "/auth", children: ["POST /register", "POST /login returns a JWT"] },
            { label: "/rooms", children: ["GET with date range (public)", "POST (ADMIN only)", "GET /{id}"] },
            { label: "/bookings", children: ["POST creates, 409 if taken", "GET mine (USER)", "DELETE /{id} cancels"] },
            { label: "/actuator", children: ["health, info, prometheus"] },
          ],
        },
      },
      {
        heading: "Entities, Flyway and stopping double bookings",
        body: "Let Flyway own the schema. Put SQL files in src/main/resources/db/migration named V1__init.sql, V2__add_room_capacity.sql and so on; Flyway runs new ones at startup in order and records them in its flyway_schema_history table. Set spring.jpa.hibernate.ddl-auto=validate so Hibernate checks that entities match the tables but never changes them.\n\nChecking for overlap in Java (\"is there a booking? if not, insert\") has a race: two requests can both see no booking and both insert. Let the database enforce the rule instead. PostgreSQL can do it with an exclusion constraint over a date range, which needs the btree_gist extension. When the second insert fails, catch DataIntegrityViolationException and return 409.\n\nMap relations as @ManyToOne(fetch = LAZY) on Booking, and use a fetch join or an entity graph when a list needs the room names, to avoid the N+1 query problem.",
        bullets: ["CREATE EXTENSION IF NOT EXISTS btree_gist;", "EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out) WITH &&)", "Never edit a migration that has already run; add a new one"],
      },
      {
        heading: "JWT and roles with Spring Security",
        body: "Spring Security's OAuth2 resource server support validates JWTs for you. For a self-contained capstone, sign tokens yourself with an HMAC key (at least 256 bits, loaded from an environment variable) and give a JwtDecoder bean built with NimbusJwtDecoder.withSecretKey. The login endpoint checks the BCrypt password hash and issues a short-lived token (for example 15 minutes) with the user id as subject and a roles claim.\n\nBy default the resource server maps the scope claim to SCOPE_ authorities. To use roles, configure a JwtGrantedAuthoritiesConverter that reads the roles claim with the ROLE_ prefix. Then protect URLs in the SecurityFilterChain and individual methods with @PreAuthorize(\"hasRole('ADMIN')\") after adding @EnableMethodSecurity.\n\nAlso check ownership, not just roles: a USER may cancel only their own booking. Compare the booking's user id with the token subject in the service, and return 404 or 403 when they differ.",
        visual: {
          type: "sequence",
          title: "Login, then book a room",
          actors: ["Client", "Auth endpoint", "Security filter", "Booking service"],
          messages: [
            { from: 0, to: 1, label: "POST /auth/login email + password" },
            { from: 1, to: 0, label: "JWT: sub=7, roles=[USER], exp 15 min" },
            { from: 0, to: 2, label: "POST /bookings, Bearer token" },
            { from: 2, to: 3, label: "Signature and expiry OK: user 7, ROLE_USER" },
            { from: 3, to: 0, label: "201 Created or 409 room taken" },
          ],
        },
      },
      {
        heading: "Caching, tests, Docker and CI",
        body: "Cache one hot read and measure it. The free-rooms search is a good candidate, but it changes on every booking, so either evict on each booking or use a short TTL such as 30 seconds and accept that the list can be slightly stale (the exclusion constraint still prevents real double bookings). Record response times before and after in the README.\n\nTest in layers. Unit tests cover service rules with Mockito. @WebMvcTest checks controllers, validation and security (use the jwt() request post-processor from spring-security-test). Integration tests use @SpringBootTest with Testcontainers for Postgres and Redis; with @ServiceConnection, Spring Boot wires the container URLs automatically. Include one test where two bookings overlap and expect 409.\n\nFinally, a multi-stage Dockerfile, a compose.yaml with app, Postgres and Redis, and a CI workflow that runs ./mvnw verify and builds the image on every push and pull request.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A reviewer-friendly repo layout",
        root: "booking-api",
        children: [
          { label: "src/main/java", children: ["room, booking, user packages", "security config", "error handling advice"] },
          { label: "src/main/resources", children: ["application.yml", "db/migration/V1__init.sql"] },
          { label: "src/test/java", children: ["unit tests", "WebMvcTest slices", "Testcontainers ITs"] },
          { label: "Root files", children: ["Dockerfile", "compose.yaml", ".env.example", "README.md"] },
          { label: ".github/workflows", children: ["ci.yml"] },
        ],
      },
      {
        type: "compare",
        title: "Where to enforce \"no double booking\"",
        columns: [
          { title: "Java check then insert", points: ["Easy to write", "Race: two requests both pass", "Breaks under load", "Needs locking to be safe"] },
          { title: "Database constraint", points: ["Exclusion constraint on date ranges", "Correct under any concurrency", "Second insert fails, return 409", "Rule lives next to the data"] },
        ],
      },
    ],
    examples: [
      {
        title: "Migration with an overlap constraint",
        explanation: "V1 creates the three tables. The exclusion constraint says: for confirmed bookings, no two rows may have the same room_id and overlapping date ranges. daterange uses a half-open range by default, so a booking that checks out on the 3rd does not clash with one checking in on the 3rd. In the service, catch DataIntegrityViolationException on save and turn it into a 409 response.",
        code: {
          lang: "sql",
          code: "CREATE EXTENSION IF NOT EXISTS btree_gist;\nCREATE TABLE app_user (id bigserial PRIMARY KEY, email text UNIQUE NOT NULL,\n  password_hash text NOT NULL, role text NOT NULL DEFAULT 'USER');\nCREATE TABLE room (id bigserial PRIMARY KEY, name text NOT NULL, capacity int NOT NULL);\nCREATE TABLE booking (\n  id bigserial PRIMARY KEY,\n  room_id bigint NOT NULL REFERENCES room(id),\n  user_id bigint NOT NULL REFERENCES app_user(id),\n  check_in date NOT NULL, check_out date NOT NULL CHECK (check_out > check_in),\n  status text NOT NULL DEFAULT 'CONFIRMED',\n  EXCLUDE USING gist (room_id WITH =, daterange(check_in, check_out) WITH &&)\n    WHERE (status = 'CONFIRMED')\n);",
        },
      },
      {
        title: "An integration test that proves the 409",
        explanation: "The test starts a real Postgres in Docker through Testcontainers, and @ServiceConnection points the datasource at it. It books room 1 for two nights, then tries an overlapping booking and expects 409 Conflict. Because Flyway runs on startup, the test also proves the migrations work.",
        code: {
          lang: "java",
          code: "@SpringBootTest(webEnvironment = RANDOM_PORT)\n@Testcontainers\nclass BookingConflictIT {\n  @Container @ServiceConnection\n  static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>(\"postgres:17\");\n  @Autowired TestRestTemplate http;\n\n  @Test void overlappingBookingIsRejected() {\n    var first = new BookingRequest(1L, LocalDate.of(2026, 12, 1), LocalDate.of(2026, 12, 3));\n    var clash = new BookingRequest(1L, LocalDate.of(2026, 12, 2), LocalDate.of(2026, 12, 4));\n    assertEquals(201, post(first).getStatusCode().value());\n    assertEquals(409, post(clash).getStatusCode().value());\n  }\n  // post(...) adds a test JWT header and calls /api/bookings\n}",
        },
      },
    ],
    cheatSheet: [
      "Return 201 + Location on create, 409 on conflicts, 403 for wrong role, 401 when not logged in",
      "Flyway files: db/migration/V1__init.sql (two underscores); never edit one that already ran",
      "spring.jpa.hibernate.ddl-auto=validate when Flyway owns the schema",
      "Let the database enforce invariants such as no overlapping bookings",
      "@EnableMethodSecurity + @PreAuthorize(\"hasRole('ADMIN')\") for admin-only methods",
      "@ServiceConnection on a Testcontainers field wires the URL into Spring Boot",
      "Load the JWT secret and DB password from env vars; commit only .env.example",
      "README: what it does, how to run it, example curl calls, test and CI badges",
    ],
    quiz: [
      {
        q: "Two users book the same room for the same dates at the same moment. What is the most reliable way to stop a double booking?",
        options: ["Check for existing bookings in Java before saving", "A database constraint that rejects overlapping ranges", "Cache bookings in Redis", "Ask users to refresh the page"],
        answer: 1,
        why: "Only the database sees both inserts atomically; a check-then-insert in Java has a race.",
      },
      {
        q: "A logged-in USER calls POST /api/rooms, which is admin only. Which status should they get?",
        options: ["400", "401", "404", "403"],
        answer: 3,
        why: "401 means not authenticated; this user is authenticated but not allowed, which is 403.",
      },
      {
        q: "Why set ddl-auto to validate when using Flyway?",
        options: ["Hibernate checks the mapping but never changes the schema, so Flyway stays in charge", "It makes startup faster by skipping Flyway", "It creates missing tables automatically", "It deletes old data"],
        answer: 0,
        why: "validate fails fast on mismatches while leaving all schema changes to versioned migrations.",
      },
      {
        q: "With Spring's resource server defaults, a JWT with roles: [\"ADMIN\"] does not pass hasRole('ADMIN'). Why?",
        options: ["JWTs cannot hold roles", "The token is too long", "The default converter reads the scope claim and adds SCOPE_, not ROLE_", "hasRole only works with sessions"],
        answer: 2,
        why: "Configure a JwtGrantedAuthoritiesConverter for the roles claim with the ROLE_ prefix.",
      },
      {
        q: "Which secret handling is right for a public capstone repo?",
        options: ["Commit application-prod.yml with the real JWT key", "Hard-code the key in a Java constant", "Put the key in the Docker image", "Read it from an environment variable and commit only an .env.example"],
        answer: 3,
        why: "Anything committed to a public repo should be treated as leaked.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the endpoint table for your capstone: method, path, role required, success status and main error statuses.",
        hint: "Include auth, rooms and bookings, and think about which calls are public.",
        solution: "POST   /api/auth/register  public  201  400, 409 email taken\nPOST   /api/auth/login     public  200  401\nGET    /api/rooms          public  200  400 bad dates\nPOST   /api/rooms          ADMIN   201  400, 401, 403\nPOST   /api/bookings       USER    201  400, 401, 409\nGET    /api/bookings/mine  USER    200  401\nDELETE /api/bookings/{id}  owner   204  401, 404",
      },
      {
        level: "medium",
        task: "Map the roles claim of your JWT to Spring authorities so hasRole('ADMIN') works.",
        hint: "Build a JwtAuthenticationConverter with a JwtGrantedAuthoritiesConverter.",
        solution: "@Bean\nJwtAuthenticationConverter jwtAuthConverter() {\n  var roles = new JwtGrantedAuthoritiesConverter();\n  roles.setAuthoritiesClaimName(\"roles\");\n  roles.setAuthorityPrefix(\"ROLE_\");\n  var conv = new JwtAuthenticationConverter();\n  conv.setJwtGrantedAuthoritiesConverter(roles);\n  return conv;\n}",
      },
      {
        level: "hard",
        task: "Cache the free-rooms search for 30 seconds and evict it whenever a booking is created or cancelled. Show the measured effect in the README.",
        hint: "The cache key must include both dates; use @CacheEvict(allEntries = true) on writes.",
        solution: "@Cacheable(value = \"freeRooms\", key = \"#from + ':' + #to\")\npublic List<RoomDto> free(LocalDate from, LocalDate to) { ... }\n\n@CacheEvict(value = \"freeRooms\", allEntries = true)\npublic BookingDto book(BookingRequest r) { ... }\n// TTL: freeRooms 30s via RedisCacheManagerBuilderCustomizer\n// README: p95 before/after with e.g. hey -n 2000 http://localhost:8080/api/rooms?..",
      },
    ],
    faq: [
      { q: "What should a Java backend portfolio project include?", a: "Authentication, a real database with migrations, tests that run in CI, Docker for one-command setup, and a README explaining design choices. Depth and polish matter more than the number of features." },
      { q: "Should my capstone use microservices?", a: "No. One well-structured service shows more judgment. You can describe in the README how you would split it if the system grew." },
      { q: "Do I need to deploy it?", a: "It helps but is optional. A working docker compose up and a green CI run already let reviewers verify it; a small cloud deploy is a bonus." },
      { q: "How do I test secured endpoints without a real login?", a: "In @WebMvcTest use the jwt() post-processor from spring-security-test, for example .with(jwt().authorities(new SimpleGrantedAuthority(\"ROLE_ADMIN\")))." },
    ],
  },
};

export default extra;
