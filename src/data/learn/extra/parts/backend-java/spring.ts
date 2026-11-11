import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "spring/spring-di": {
    plain: [
      "In plain Java, a class creates the objects it needs with new. An OrderService might write new PaymentClient() inside itself. That works, but now OrderService is stuck with that exact class, and testing it without calling a real payment system is hard.",
      "Dependency injection flips this around. The class just says what it needs, usually as constructor parameters, and someone else hands those objects in. That someone is the Spring container, also called the application context.",
      "At startup, Spring finds your classes, works out who needs what, creates every object in the right order and connects them. These managed objects are called beans. This idea, where the framework creates and wires objects instead of your code, is called Inversion of Control (IoC).",
      "The payoff is loose coupling. You can swap a real email sender for a fake one in tests, or one payment provider for another, without touching the classes that use them. Almost every Spring feature, from transactions to security, builds on this container.",
    ],
    deepDive: [
      {
        heading: "What the container does at startup",
        body: "Spring Boot starts component scanning from the package of your @SpringBootApplication class and goes down through every sub-package. Classes outside that tree are not found, a common beginner surprise. For each class marked @Component (or @Service, @Repository, @Controller) and each @Bean method, Spring first records a bean definition: a recipe saying which class, which scope and which dependencies.\n\nThen it creates the singleton beans, eagerly, in dependency order: if OrderService needs PaymentClient, PaymentClient is built first. Bean post-processors then get a chance to wrap beans in proxies, which is how @Transactional and @Cacheable work. Because all of this happens at startup, a missing or ambiguous dependency fails the application immediately with a clear message, rather than at the first request.",
        visual: {
          type: "flow",
          title: "From classes to a ready context",
          steps: [
            { label: "Scan packages", detail: "Find @Component classes and @Bean methods" },
            { label: "Bean definitions", detail: "Record class, scope and dependencies" },
            { label: "Sort by dependencies", detail: "Build what others need first" },
            { label: "Create and inject", detail: "Call constructors with their dependencies" },
            { label: "Post-process", detail: "@PostConstruct, then proxies for AOP features" },
            { label: "Context ready", detail: "App starts serving" },
          ],
        },
      },
      {
        heading: "How Spring picks the right bean",
        body: "Injection works by type. If a constructor needs a PaymentClient and exactly one bean of that type exists, Spring uses it. If none exists, startup fails with NoSuchBeanDefinitionException. If several exist, Spring needs a hint, otherwise you get NoUniqueBeanDefinitionException.\n\nThe hints, in practice: mark one bean @Primary to make it the default, or put @Qualifier(\"stripe\") on the parameter to choose by name. As a last resort, Spring matches the parameter name to a bean name. You can also ask for all of them at once: a List<PaymentClient> parameter gets every implementation, and a Map<String, PaymentClient> gets them keyed by bean name, which is a neat way to build a strategy pattern. For optional dependencies, inject ObjectProvider<T> or Optional<T>.",
        bullets: ["One candidate: injected", "None: NoSuchBeanDefinitionException", "Several: @Primary, @Qualifier, or inject a List or Map"],
      },
      {
        heading: "@Component, @Bean and @Configuration",
        body: "Use @Component and its specialised names on classes you write. @Service and @Controller are just labels for readers and tools. @Repository adds one behaviour: database exceptions are translated into Spring's DataAccessException hierarchy.\n\nUse @Bean methods inside a @Configuration class for objects you cannot annotate, such as a Clock, an ObjectMapper tweak or a client from a third-party library, or when creating the object needs logic. In a @Configuration class, Spring subclasses the class so that calling one @Bean method from another returns the same singleton rather than a new object. Conditional annotations such as @Profile(\"dev\") or @ConditionalOnProperty decide whether a bean is created at all.",
      },
      {
        heading: "Scopes and why singletons must be stateless",
        body: "The default scope is singleton: one instance for the whole application, shared by every thread serving every request. That is efficient, but it means a singleton must not keep per-request data in fields. A field like private User currentUser in a service will be overwritten by concurrent requests, leaking one user's data to another. Keep request data in method parameters and local variables.\n\nOther scopes exist. prototype creates a new instance each time the bean is requested. In web apps, request and session scopes create one instance per HTTP request or user session. A trap: injecting a prototype bean into a singleton gives you only one instance, created once. To get a fresh one each time, inject ObjectProvider<MyBean> and call getObject() when you need it.",
        bullets: ["singleton: one per context (default)", "prototype: new one per lookup", "request and session: one per HTTP request or session"],
      },
      {
        heading: "Lifecycle callbacks and proxies",
        body: "After a bean is created and its dependencies are injected, a method annotated with @PostConstruct runs; use it for light setup like warming a small cache. When the context shuts down, @PreDestroy methods run, which is the place to close resources. Both come from jakarta.annotation.\n\nMany Spring features work by wrapping your bean in a proxy: another object with the same type that runs extra logic before and after your method. @Transactional, @Cacheable, @Async and method security all use this. The proxy only sees calls that come from outside the bean. When one method calls another method in the same class with this, the call skips the proxy and the annotation does nothing. Since Spring Boot 2.6, circular dependencies between beans are rejected by default; treat that error as a design hint to split responsibilities.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Creating dependencies vs receiving them",
        columns: [
          { title: "new inside the class", points: ["Class picks its own collaborators", "Hard to swap or fake in tests", "Hidden dependencies", "Changes ripple to callers"] },
          { title: "Constructor injection", points: ["Class declares what it needs", "Tests pass fakes with new", "Dependencies visible in one place", "Fields can be final"] },
        ],
      },
    ],
    examples: [
      {
        title: "Choosing a payment provider at run time",
        explanation: "You support Stripe and PayPal, and each order says which to use. Step 1: both classes implement PaymentProvider and are named beans. Step 2: inject Map<String, PaymentProvider>; Spring fills it with every implementation, keyed by bean name. Step 3: look up the provider by the order's choice and fail clearly if it is unknown. Adding a third provider is now just a new class; the router never changes.",
        code: {
          lang: "java",
          code: `interface PaymentProvider { Receipt charge(Order order); }

@Component("stripe") class StripeProvider implements PaymentProvider { /* ... */ }
@Component("paypal") class PaypalProvider implements PaymentProvider { /* ... */ }

@Service
class PaymentRouter {
  private final Map<String, PaymentProvider> providers;
  PaymentRouter(Map<String, PaymentProvider> providers) { this.providers = providers; }

  Receipt pay(Order order) {
    var p = providers.get(order.provider());
    if (p == null) throw new IllegalArgumentException("unknown provider " + order.provider());
    return p.charge(order);
  }
}`,
        },
      },
      {
        title: "Testing time-based logic without Spring",
        explanation: "An InvoiceService marks invoices overdue after 30 days. Calling LocalDate.now() inside would make tests depend on today's date. Step 1: register a Clock bean in a configuration class. Step 2: inject the Clock through the constructor. Step 3: in the unit test, create the service with new and a fixed clock; no Spring context starts and the test runs in milliseconds. This is the practical benefit of constructor injection.",
        code: {
          lang: "java",
          code: `@Configuration
class TimeConfig {
  @Bean Clock clock() { return Clock.systemUTC(); }
}

@Service
class InvoiceService {
  private final Clock clock;
  InvoiceService(Clock clock) { this.clock = clock; }
  boolean isOverdue(Invoice inv) {
    return inv.issued().plusDays(30).isBefore(LocalDate.now(clock));
  }
}
// Test: var fixed = Clock.fixed(Instant.parse("2026-03-01T00:00:00Z"), ZoneOffset.UTC);
//       assertTrue(new InvoiceService(fixed).isOverdue(new Invoice(LocalDate.of(2026, 1, 1))));`,
        },
      },
    ],
    cheatSheet: [
      "Component scanning starts at the package of the @SpringBootApplication class",
      "One constructor needs no @Autowired; Spring uses it automatically",
      "Several beans of one type: @Primary for the default, @Qualifier to choose",
      "Inject List<T> or Map<String, T> to get every implementation",
      "Singletons are shared across threads: no per-request state in fields",
      "Use ObjectProvider<T> to get a fresh prototype bean or an optional one",
      "@PostConstruct runs after injection; @PreDestroy runs on shutdown",
      "Self-invocation skips proxies, so @Transactional or @Cacheable is ignored",
    ],
    quiz: [
      {
        q: "Two beans implement NotificationSender and a constructor asks for one. Neither is marked. What happens?",
        options: ["Spring picks the first one found", "Startup fails with NoUniqueBeanDefinitionException", "Both are injected", "The constructor gets null"],
        answer: 1,
        why: "Spring cannot choose without @Primary, @Qualifier or a matching parameter name.",
      },
      {
        q: "A singleton service stores the current user in a field during each request. What is the risk?",
        options: ["None, each request gets its own service", "The field is reset automatically", "Concurrent requests overwrite each other's user", "Spring throws at startup"],
        answer: 2,
        why: "One singleton instance serves all threads, so the field is shared state.",
      },
      {
        q: "A prototype bean is injected into a singleton's constructor. How many prototype instances does the singleton use?",
        options: ["One, created when the singleton was built", "A new one per method call", "A new one per request", "None, it is an error"],
        answer: 0,
        why: "Injection happens once; use ObjectProvider to get new instances later.",
      },
      {
        q: "Your new @Service class is not found at startup. It lives in com.other, while the main class is in com.shop. Why?",
        options: ["@Service needs @Autowired", "Services must be public", "The class needs a no-argument constructor", "Scanning only covers com.shop and its sub-packages"],
        answer: 3,
        why: "Move the class under com.shop or configure scanning for the extra package.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a GreetingService bean with a method greet(name) and use it from a CommandLineRunner bean that prints a greeting at startup.",
        hint: "A @Bean method can take other beans as parameters.",
        solution: "@Service\nclass GreetingService {\n  String greet(String name) { return \"Hello, \" + name; }\n}\n\n@Configuration\nclass StartupConfig {\n  @Bean\n  CommandLineRunner hello(GreetingService greetings) {\n    return args -> System.out.println(greetings.greet(\"Spring\"));\n  }\n}",
      },
      {
        level: "medium",
        task: "Create EmailSender and SmsSender, both implementing NotificationSender. Make email the default, but inject SMS into an AlertService.",
        hint: "@Primary on one, @Qualifier on the parameter that needs the other.",
        solution: "interface NotificationSender { void send(String to, String msg); }\n\n@Primary @Component(\"email\")\nclass EmailSender implements NotificationSender { public void send(String t, String m) { /* ... */ } }\n\n@Component(\"sms\")\nclass SmsSender implements NotificationSender { public void send(String t, String m) { /* ... */ } }\n\n@Service\nclass AlertService {\n  private final NotificationSender sender;\n  AlertService(@Qualifier(\"sms\") NotificationSender sender) { this.sender = sender; }\n}",
      },
      {
        level: "hard",
        task: "Create a request-scoped bean RequestContext holding a request id, and use it from a singleton service safely.",
        hint: "Request-scoped beans injected into singletons need a scoped proxy, which @RequestScope provides.",
        solution: "@Component\n@RequestScope   // proxyMode = TARGET_CLASS by default\nclass RequestContext {\n  private final String requestId = UUID.randomUUID().toString();\n  String requestId() { return requestId; }\n}\n\n@Service\nclass AuditService {\n  private final RequestContext ctx;   // actually a proxy\n  AuditService(RequestContext ctx) { this.ctx = ctx; }\n  void log(String action) { System.out.println(ctx.requestId() + \" \" + action); }\n}",
      },
    ],
    faq: [
      { q: "Do I still need @Autowired?", a: "Not on a class with a single constructor; Spring has used it automatically since version 4.3. You only need @Autowired when there are several constructors and you must mark the one to use." },
      { q: "Why is field injection discouraged?", a: "Fields injected by reflection cannot be final, hide how many dependencies a class has, and force tests to use Spring or reflection. Constructor injection has none of these problems." },
      { q: "What is the difference between @Component and @Bean?", a: "@Component goes on your own class and is found by scanning. @Bean goes on a factory method in a @Configuration class and is used for third-party objects or objects that need custom creation logic." },
      { q: "Is a Spring bean thread-safe?", a: "Not automatically. A singleton bean is shared by all threads, so it is only safe if it has no changing state, which is the normal design for services." },
    ],
  },

  "spring/spring-boot": {
    plain: [
      "Plain Spring can do almost anything, but setting it up used to take lots of configuration. Spring Boot is a layer on top that makes sensible choices for you, so a working web app with a database needs only a few lines of your own code.",
      "Boot has three big ideas. Starters are dependency bundles: add spring-boot-starter-web and you get Spring MVC, JSON support and an embedded Tomcat server. Auto-configuration creates the beans those libraries need. And the embedded server means your app is a single jar you run with java -jar.",
      "Configuration lives outside your code, in application.yml or application.properties, and can be overridden by environment variables or command-line flags. The same jar can therefore run on your laptop, in a test pipeline and in production, each with its own settings.",
      "Profiles group settings by environment. A dev profile might use a local database and verbose logging; prod uses the real database and quiet logs. You choose the profile when starting the app, without rebuilding anything.",
    ],
    deepDive: [
      {
        heading: "Starting a project with Spring Initializr",
        body: "start.spring.io generates a ready-to-build project. You choose the build tool, the Java version, the Spring Boot version, your group and artifact names, and the dependencies, such as Spring Web, Spring Data JPA, PostgreSQL Driver and Validation. Most IDEs offer the same wizard. You can even script it: curl https://start.spring.io/starter.zip -d dependencies=web,data-jpa,postgresql -d javaVersion=21 -o demo.zip.\n\nThe generated project has the standard layout, a main class annotated with @SpringBootApplication, an empty application.properties, a test that checks the context starts, and the build wrapper. Building with ./mvnw package produces an executable fat jar in target/ that contains your code, every dependency and a small launcher, so the server needs nothing but a Java runtime.",
        bullets: ["./mvnw spring-boot:run starts the app from source", "java -jar target/demo-0.0.1-SNAPSHOT.jar runs the packaged jar", "Pick the latest stable Boot version and a supported LTS Java"],
      },
      {
        heading: "How auto-configuration decides",
        body: "@SpringBootApplication combines three annotations: @SpringBootConfiguration, @ComponentScan and @EnableAutoConfiguration. The last one loads a long list of auto-configuration classes shipped inside Boot's jars. Each one is guarded by conditions. @ConditionalOnClass means only if a library is on the classpath. @ConditionalOnMissingBean means only if you have not defined your own bean of that type. @ConditionalOnProperty means only if a setting is present or has a certain value.\n\nThat is why defining your own DataSource or ObjectMapper bean makes Boot's version back off. To see every decision, start the app with --debug: Boot prints a conditions evaluation report listing which auto-configurations matched and why others did not. To switch one off, use @SpringBootApplication(exclude = ...).",
        visual: {
          type: "flow",
          title: "Should Boot create a DataSource?",
          steps: [
            { label: "JDBC classes present?", detail: "No: skip. Yes: continue" },
            { label: "Your own DataSource bean?", detail: "Yes: back off and use yours" },
            { label: "Read spring.datasource.*", detail: "URL, username, password, pool settings" },
            { label: "Pick a pool", detail: "HikariCP when it is on the classpath" },
            { label: "Register the bean", detail: "JPA and JdbcTemplate can now use it" },
          ],
        },
      },
      {
        heading: "Properties, environment variables and typed config",
        body: "Boot uses relaxed binding, so one setting can be written several ways. spring.datasource.url in YAML, and the environment variable SPRING_DATASOURCE_URL, mean the same thing: upper-case it, replace dots with underscores, and drop dashes. This is how containers and Kubernetes configure Spring apps without changing files.\n\nFor your own settings, prefer @ConfigurationProperties over many scattered @Value annotations. Bind a prefix such as app.mail to a record with typed fields; Boot converts strings like 5s into a Duration and 10MB into a DataSize. Add @Validated and Bean Validation annotations so the app refuses to start with a missing or invalid value, which is much better than failing at 3 a.m. on the first email. spring.config.import can load extra files, for example optional:file:./secrets.yml.",
        bullets: ["server.port=8081 or SERVER_PORT=8081", "@Value(\"${app.name}\") for a single value", "@ConfigurationPropertiesScan finds properties records"],
      },
      {
        heading: "Profiles in practice",
        body: "A profile is a name such as dev, test or prod. When a profile is active, Boot also loads application-dev.yml (or a document inside application.yml marked with spring.config.activate.on-profile). Values there override the shared defaults. Activate profiles with spring.profiles.active, the SPRING_PROFILES_ACTIVE environment variable, or @ActiveProfiles(\"test\") in tests. If none is set, the profile named default is active.\n\nProfiles can also switch beans: @Profile(\"dev\") on a FakeEmailSender means it exists only in dev. Profile groups bundle several: spring.profiles.group.prod=prod-db,prod-mail. Keep profiles few and meaningful. A common mistake is putting real secrets into application-prod.yml in Git; keep only non-secret settings there and inject secrets through environment variables or a secret store. The startup log always names the active profiles, so check it first when config looks wrong.",
        visual: {
          type: "tree",
          title: "Which files load with SPRING_PROFILES_ACTIVE=prod",
          root: "src/main/resources",
          children: [
            { label: "application.yml", children: ["Always loaded", "Shared defaults"] },
            { label: "application-prod.yml", children: ["Loaded, overrides defaults", "Non-secret prod settings"] },
            { label: "application-dev.yml", children: ["Not loaded", "Only when dev is active"] },
            { label: "Environment variables", children: ["Override both files", "Secrets such as DB passwords"] },
          ],
        },
      },
      {
        heading: "Developer comfort and production defaults",
        body: "spring-boot-devtools restarts the app automatically when classes change and disables template caching during development; it is switched off automatically when running a packaged jar. The spring-boot-docker-compose module (Boot 3.1+) can start the services in your compose.yaml when the app starts and wire their connection details, so a local Postgres needs no manual config.\n\nFor production, Boot has sensible defaults. The embedded server is Tomcat on port 8080. Graceful shutdown lets in-flight requests finish when the app is stopped; it is the default since Boot 3.4 and tunable with spring.lifecycle.timeout-per-shutdown-phase. Logging goes to the console, which suits containers. Add the Actuator starter to get health checks and metrics, covered later in this path.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What @SpringBootApplication contains",
        root: "@SpringBootApplication",
        children: [
          { label: "@SpringBootConfiguration", children: ["Marks the main configuration class"] },
          { label: "@EnableAutoConfiguration", children: ["Loads conditional auto-configurations", "Backs off when you define beans"] },
          { label: "@ComponentScan", children: ["Scans this package and below", "Finds @Component, @Service, @Controller"] },
        ],
      },
    ],
    examples: [
      {
        title: "Typed, validated configuration with a record",
        explanation: "Your app sends emails and needs a sender address, a timeout and an on/off switch. Step 1: declare a record bound to the app.mail prefix. Step 2: add @Validated and @NotBlank so startup fails if the sender is missing. Step 3: use @DefaultValue for the timeout; Boot converts 5s into a Duration. Step 4: enable scanning on the main class. Step 5: inject MailProperties anywhere like a normal bean. In Kubernetes you would set APP_MAIL_FROM as an environment variable.",
        code: {
          lang: "java",
          code: `@ConfigurationProperties(prefix = "app.mail")
@Validated
public record MailProperties(
    @NotBlank String from,
    @DefaultValue("5s") Duration timeout,
    boolean enabled) {}

@SpringBootApplication
@ConfigurationPropertiesScan
public class App {
  public static void main(String[] args) { SpringApplication.run(App.class, args); }
}

// application.yml
// app.mail.from: noreply@shop.example
// app.mail.enabled: true`,
        },
      },
      {
        title: "Dev and prod settings from one jar",
        explanation: "Step 1: shared settings go in application.yml. Step 2: application-dev.yml points at a local database and turns on SQL logging. Step 3: application-prod.yml sets production behaviour but reads the database URL and password from environment variables, so no secret is in Git. Step 4: locally, run with the dev profile; in the container, set SPRING_PROFILES_ACTIVE=prod plus the variables. Step 5: confirm in the startup log line that names the active profile.",
        code: {
          lang: "yaml",
          code: `# application-dev.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shop
    username: shop
    password: shop
  jpa:
    show-sql: true

# application-prod.yml
spring:
  datasource:
    url: \${DB_URL}
    username: \${DB_USER}
    password: \${DB_PASSWORD}
# Run: SPRING_PROFILES_ACTIVE=prod DB_URL=... java -jar app.jar`,
        },
      },
    ],
    cheatSheet: [
      "spring.datasource.url can be set as the environment variable SPRING_DATASOURCE_URL",
      "--debug prints the conditions report: which auto-configurations matched and why",
      "Define your own bean to replace Boot's: @ConditionalOnMissingBean backs off",
      "application-{profile}.yml overrides application.yml when that profile is active",
      "SPRING_PROFILES_ACTIVE=prod or --spring.profiles.active=prod picks the profile",
      "@ConfigurationProperties records give typed, validated settings",
      "Durations and sizes bind from text: 30s, 5m, 10MB",
      "Keep secrets in environment variables or a secret store, never in Git",
    ],
    quiz: [
      {
        q: "What environment variable sets spring.datasource.username?",
        options: ["spring.datasource.username", "SPRING_DATASOURCE_USERNAME", "DATASOURCE_USERNAME", "SPRING-DATASOURCE-USERNAME"],
        answer: 1,
        why: "Relaxed binding: upper-case the name and replace dots with underscores.",
      },
      {
        q: "You define your own ObjectMapper bean. What does Boot's Jackson auto-configuration do?",
        options: ["Throws a duplicate bean error", "Creates a second ObjectMapper anyway", "Merges both into one", "Backs off for that bean because of @ConditionalOnMissingBean"],
        answer: 3,
        why: "Auto-configured beans are only created when you have not supplied your own.",
      },
      {
        q: "How can you find out why an auto-configuration did not apply?",
        options: ["Start the app with --debug and read the conditions evaluation report", "Read the pom.xml", "Set server.port to 0", "Delete the target folder"],
        answer: 0,
        why: "The report lists every auto-configuration with the conditions that matched or failed.",
      },
      {
        q: "No profile is set. Which profile is active?",
        options: ["dev", "prod", "default", "None, the app fails to start"],
        answer: 2,
        why: "Spring uses a profile named default when no other profile is active.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Generate a Spring Boot web project from the command line, run it on port 9090 instead of 8080, and check it responds.",
        hint: "Use start.spring.io with curl, then pass --server.port.",
        solution: "curl https://start.spring.io/starter.zip -d dependencies=web,actuator \\\n  -d javaVersion=21 -d name=demo -o demo.zip\nunzip demo.zip -d demo && cd demo\n./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=9090\n# in another terminal\ncurl localhost:9090/actuator/health   # {\"status\":\"UP\"}",
      },
      {
        level: "medium",
        task: "Bind settings app.upload.max-size (default 10MB) and app.upload.dir (required) to a record and print them at startup.",
        hint: "DataSize converts from text like 10MB; use @Validated with @NotBlank.",
        solution: "@ConfigurationProperties(prefix = \"app.upload\")\n@Validated\nrecord UploadProperties(@NotBlank String dir, @DefaultValue(\"10MB\") DataSize maxSize) {}\n\n@Bean\nCommandLineRunner show(UploadProperties p) {\n  return args -> System.out.println(p.dir() + \" max \" + p.maxSize().toMegabytes() + \" MB\");\n}\n// Add @ConfigurationPropertiesScan to the main class.\n// application.yml: app.upload.dir: /tmp/uploads",
      },
      {
        level: "hard",
        task: "Use a fake email sender in the dev profile and a real SMTP sender in all other profiles, and prove which one is active.",
        hint: "@Profile accepts negation with an exclamation mark.",
        solution: "interface EmailSender { void send(String to, String body); }\n\n@Component @Profile(\"dev\")\nclass LoggingEmailSender implements EmailSender {\n  public void send(String to, String body) { System.out.println(\"[fake mail] \" + to + \": \" + body); }\n}\n\n@Component @Profile(\"!dev\")\nclass SmtpEmailSender implements EmailSender {\n  public void send(String to, String body) { /* JavaMailSender call */ }\n}\n// Startup with --spring.profiles.active=dev, then log sender.getClass().getSimpleName()",
      },
    ],
    faq: [
      { q: "Should I use application.yml or application.properties?", a: "Both work the same. YAML is easier to read for nested settings; properties files are simpler to grep. Pick one per project and do not mix them for the same keys." },
      { q: "How do I set the profile in Docker or Kubernetes?", a: "Set the environment variable SPRING_PROFILES_ACTIVE=prod in the container definition. Other settings follow the same pattern, such as SPRING_DATASOURCE_URL." },
      { q: "What is the difference between Spring and Spring Boot?", a: "Spring Framework provides the container, MVC, data access and more. Spring Boot is built on top and adds starters, auto-configuration, an embedded server and production features, so you configure far less." },
      { q: "Which Spring Boot version should I use?", a: "Use the latest stable release from start.spring.io. Spring Boot 3 needs Java 17 or newer, and Boot 4 (released in late 2025) is built on Spring Framework 7." },
    ],
  },

  "spring/spring-rest": {
    plain: [
      "A REST API lets other programs, such as a mobile app or a React website, talk to your backend over HTTP. Each thing your system manages, like a book or an order, is a resource with its own URL, such as /api/books/42.",
      "HTTP methods say what to do with a resource. GET reads it, POST creates a new one, PUT replaces it, PATCH changes part of it, and DELETE removes it. Status codes in the response say how it went: 200 for OK, 201 for created, 404 for not found, and so on.",
      "In Spring, a controller class handles these requests. You annotate a method with @GetMapping(\"/{id}\"), and Spring calls it for matching requests, turns the JSON body into a Java object, and turns your return value back into JSON.",
      "A good API is predictable. Clients should be able to guess URLs, rely on status codes, and get the same JSON shapes every time. DTOs (data transfer objects) help here: they are small classes shaped for the API, separate from your database entities, so you control exactly what goes in and out.",
    ],
    deepDive: [
      {
        heading: "Designing URLs and choosing methods",
        body: "Use plural nouns for collections and ids for single items: /api/books and /api/books/42. Nest only one level for clear ownership, such as /api/customers/7/orders. Put filters, search and sorting in query parameters: /api/books?author=tolkien&sort=title. Avoid verbs in paths; the HTTP method is the verb. For actions that are not simple CRUD, a sub-resource such as POST /api/orders/42/cancel is an accepted compromise.\n\nKnow which methods are safe and idempotent. GET changes nothing. PUT and DELETE are idempotent: repeating the same request leaves the same state, so clients can retry them after a timeout. POST is not: sending it twice may create two orders. That is why payment APIs accept an idempotency key header on POST.",
        visual: {
          type: "tree",
          title: "One resource, five operations",
          root: "/api/books",
          children: [
            { label: "GET /api/books", children: ["List, with page and sort", "200 OK"] },
            { label: "POST /api/books", children: ["Create", "201 Created + Location"] },
            { label: "GET /api/books/42", children: ["Read one", "200 or 404"] },
            { label: "PUT /api/books/42", children: ["Replace, idempotent", "200 or 404"] },
            { label: "DELETE /api/books/42", children: ["Remove, idempotent", "204 No Content"] },
          ],
        },
      },
      {
        heading: "Status codes clients can rely on",
        body: "Success codes: 200 OK with a body, 201 Created after POST with a Location header pointing at the new resource, and 204 No Content when there is nothing to return, typical for DELETE. Client errors: 400 Bad Request for malformed or invalid input, 401 when not logged in, 403 when logged in but not allowed, 404 when the resource does not exist, 409 Conflict when the request clashes with current state, such as a duplicate email or a stale version. 500 means a bug on the server and should never be returned on purpose.\n\nIn Spring, return ResponseEntity when you need to choose the status or headers, use @ResponseStatus(HttpStatus.NO_CONTENT) for fixed codes, and throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"book 42\") for quick error cases. Larger apps map their own exceptions to codes in one global handler.",
        bullets: ["ResponseEntity.created(uri).body(dto) gives 201 with Location", "ResponseEntity.noContent().build() gives 204", "422 Unprocessable Content is also used for validation errors by some APIs"],
      },
      {
        heading: "Binding requests: path, query, body and headers",
        body: "@PathVariable takes a value from the URL template, as in /books/{id}. @RequestParam reads query parameters; give optional ones a default with @RequestParam(defaultValue = \"0\") or use Optional. @RequestBody converts the JSON body into an object, using Jackson through Spring's message converters. @RequestHeader reads headers such as an idempotency key.\n\nSpring converts types for you: a String path segment becomes a Long, an ISO date string becomes a LocalDate, and a mismatch, such as /books/abc for a Long id, gives a 400 error before your code runs. Spring Boot configures Jackson to ignore unknown JSON fields, so older clients keep working when you add fields. Records make excellent request and response types, because they are immutable and Jackson can bind them through their constructor.",
      },
      {
        heading: "Why DTOs and not entities",
        body: "Returning JPA entities directly from controllers causes three kinds of trouble. First, leaks: every field becomes public JSON, including password hashes or internal flags, and every database change breaks the API. Second, mass assignment: if you bind a request straight into an entity, a client can send \"role\": \"ADMIN\" and set fields it should never touch. Third, lazy loading and cycles: Jackson touches every getter, which can trigger extra queries, LazyInitializationException, or endless recursion when Book points to Author and Author back to Book.\n\nUse separate DTOs for each purpose: CreateBookRequest with only the fields a client may set, and BookResponse with only the fields it may see. Map between them in a small mapper class or with a tool like MapStruct. The flow diagram shows where each conversion happens.",
        visual: {
          type: "flow",
          title: "Where DTOs and entities meet",
          steps: [
            { label: "JSON request", detail: "{ \"title\": \"Dune\", \"authorId\": 7 }" },
            { label: "CreateBookRequest", detail: "Only the fields a client may set" },
            { label: "Entity", detail: "Mapper builds Book; service applies rules" },
            { label: "Repository save", detail: "Database assigns the id" },
            { label: "BookResponse", detail: "Only the fields a client may see" },
            { label: "JSON response", detail: "201 Created with Location" },
          ],
        },
      },
      {
        heading: "Pagination and sorting",
        body: "Never return an unbounded list; a table that has 50 rows today may have 5 million next year. With Spring Data, add a Pageable parameter to a controller method and Spring fills it from the query string: ?page=0&size=20&sort=title,asc. Pages are zero-based. Pass the Pageable to a repository method that returns Page<T>, which also runs a count query to report total elements and pages. Use Slice<T> to skip that count when you only need a next link.\n\nProtect yourself: spring.data.web.pageable.max-page-size caps the size (2000 by default; set something like 100), and only allow sorting by indexed columns. Since Spring Data 3.3, serialising PageImpl directly logs a warning; return your own page DTO or enable PagedModel serialisation. For very deep pages, offset pagination gets slow, so large feeds use keyset pagination: WHERE id > lastSeenId ORDER BY id LIMIT 20.",
        bullets: ["?page=2&size=20&sort=price,desc&sort=title", "@PageableDefault(size = 20, sort = \"title\")", "Keyset pagination for infinite scroll and big tables"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "POST /api/books end to end",
        actors: ["Client", "BookController", "BookService", "BookRepository"],
        messages: [
          { from: 0, to: 1, label: "POST JSON body" },
          { from: 1, to: 2, label: "create(CreateBookRequest)" },
          { from: 2, to: 3, label: "save(new Book)" },
          { from: 3, to: 2, label: "Book with id 42" },
          { from: 2, to: 1, label: "BookResponse" },
          { from: 1, to: 0, label: "201 Created, Location: /api/books/42" },
        ],
      },
    ],
    examples: [
      {
        title: "Update and delete with correct status codes",
        explanation: "Step 1: PUT replaces the book; the service throws ResponseStatusException with 404 if the id is unknown, so the client gets a clear error. Step 2: a successful PUT returns 200 with the updated representation. Step 3: DELETE returns 204 No Content via @ResponseStatus, and deleting an id that is already gone can also return 204, which keeps DELETE idempotent. Step 4: the controller stays thin; rules live in the service.",
        code: {
          lang: "java",
          code: `@PutMapping("/{id}")
BookResponse replace(@PathVariable long id, @Valid @RequestBody UpdateBookRequest req) {
  return service.replace(id, req);
}

@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
void delete(@PathVariable long id) {
  service.delete(id);   // no error if already deleted
}

// In BookService
Book load(long id) {
  return repo.findById(id).orElseThrow(
      () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "book " + id + " not found"));
}`,
        },
      },
      {
        title: "A paged search endpoint",
        explanation: "The book list must support search by author, sorting and pages. Step 1: accept an optional author filter and a Pageable with defaults. Step 2: the repository method findByAuthorContainingIgnoreCase(String, Pageable) is derived by Spring Data. Step 3: map each entity to a response DTO with Page.map. Step 4: return a small page DTO so the JSON shape is stable. A request like GET /api/books?author=le%20guin&page=0&size=10&sort=title returns the first ten matches.",
        code: {
          lang: "java",
          code: `record PageResponse<T>(List<T> items, int page, int size, long total) {}

@GetMapping
PageResponse<BookResponse> list(
    @RequestParam(defaultValue = "") String author,
    @PageableDefault(size = 20, sort = "title") Pageable pageable) {
  Page<BookResponse> page = repo
      .findByAuthorContainingIgnoreCase(author, pageable)
      .map(mapper::toResponse);
  return new PageResponse<>(page.getContent(), page.getNumber(),
      page.getSize(), page.getTotalElements());
}`,
        },
      },
    ],
    cheatSheet: [
      "Plural nouns for collections: /api/books, /api/books/{id}",
      "GET, PUT and DELETE are idempotent; POST is not",
      "201 Created plus Location after POST; 204 No Content after DELETE",
      "409 Conflict for duplicates or stale versions; 404 for unknown ids",
      "throw new ResponseStatusException(HttpStatus.NOT_FOUND, msg) for quick errors",
      "Separate request and response DTOs prevent leaks and mass assignment",
      "Pageable binds ?page=0&size=20&sort=title,asc; pages start at 0",
      "Cap page size with spring.data.web.pageable.max-page-size",
    ],
    quiz: [
      {
        q: "A client times out and retries a request. For which method is a blind retry always safe in terms of final state?",
        options: ["POST", "PATCH (any)", "PUT", "None of them"],
        answer: 2,
        why: "PUT is idempotent: sending the same full replacement twice gives the same result.",
      },
      {
        q: "A user registers with an email that already exists. Which status fits best?",
        options: ["409 Conflict", "404 Not Found", "500 Internal Server Error", "200 OK"],
        answer: 0,
        why: "The request is valid but clashes with the current state of the resource.",
      },
      {
        q: "Why is binding a request body directly into a User entity dangerous?",
        options: ["Entities cannot be deserialised", "It is slower than a DTO", "Spring forbids it", "Clients can set fields like role or id that they should never control"],
        answer: 3,
        why: "This is mass assignment; a request DTO limits input to allowed fields.",
      },
      {
        q: "What does GET /api/books?page=1&size=20 return with Spring Data paging?",
        options: ["Books 1 to 20", "Books 21 to 40", "Books 20 to 40", "Page size 1"],
        answer: 1,
        why: "Pages are zero-based, so page 1 is the second page of 20.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create GET /api/ping that returns JSON {\"status\": \"ok\"} with status 200.",
        hint: "Return a record from a @RestController method.",
        solution: "@RestController\n@RequestMapping(\"/api\")\nclass PingController {\n  record Ping(String status) {}\n\n  @GetMapping(\"/ping\")\n  Ping ping() { return new Ping(\"ok\"); }\n}\n// curl localhost:8080/api/ping -> {\"status\":\"ok\"}",
      },
      {
        level: "medium",
        task: "Write POST /api/books that returns 201 Created with a Location header built from the current request URL.",
        hint: "ServletUriComponentsBuilder.fromCurrentRequest() avoids hard-coding the host and path.",
        solution: "@PostMapping\nResponseEntity<BookResponse> create(@Valid @RequestBody CreateBookRequest req) {\n  BookResponse saved = service.create(req);\n  URI location = ServletUriComponentsBuilder.fromCurrentRequest()\n      .path(\"/{id}\")\n      .buildAndExpand(saved.id())\n      .toUri();\n  return ResponseEntity.created(location).body(saved);\n}",
      },
      {
        level: "hard",
        task: "Build GET /api/customers/{customerId}/orders that returns the customer's orders newest first, 404 if the customer does not exist, and never more than 50 per page.",
        hint: "Check existence first, use @PageableDefault, and set the global max page size.",
        solution: "@GetMapping(\"/api/customers/{customerId}/orders\")\nPage<OrderResponse> orders(@PathVariable long customerId,\n    @PageableDefault(size = 20, sort = \"createdAt\", direction = Sort.Direction.DESC) Pageable p) {\n  if (!customers.existsById(customerId))\n    throw new ResponseStatusException(HttpStatus.NOT_FOUND, \"customer \" + customerId);\n  return orders.findByCustomerId(customerId, p).map(mapper::toResponse);\n}\n// application.yml\n// spring.data.web.pageable.max-page-size: 50",
      },
    ],
    faq: [
      { q: "What is the difference between PUT and PATCH?", a: "PUT replaces the whole resource with the body you send, so missing fields are cleared. PATCH changes only the fields you send, which is handy for large resources." },
      { q: "Should I version my API?", a: "Version when you must make breaking changes for existing clients. A path prefix such as /api/v1 is the simplest and most visible approach; adding optional fields does not need a new version." },
      { q: "What is the difference between @Controller and @RestController?", a: "@RestController is @Controller plus @ResponseBody, so return values are written as JSON. Plain @Controller is for server-rendered pages where the return value names a view template." },
      { q: "Do I always need to return ResponseEntity?", a: "No. Return the DTO directly for the normal 200 case and use ResponseEntity only when you need a different status or extra headers." },
    ],
  },

  "spring/spring-validation": {
    plain: [
      "Never trust input. A client may send an empty name, an email without an @ sign, a negative quantity, or a 10 MB string. If your code does not check, bad data ends up in the database or causes strange errors deep in your logic.",
      "Bean Validation lets you write the rules as annotations right on your DTO fields: @NotBlank on a name, @Email on an email, @Positive on a quantity. Add @Valid to the controller parameter and Spring checks every rule before your method even starts.",
      "When a rule fails, Spring throws an exception instead of calling your method. By default the client gets a 400 Bad Request. The next step is making that error useful: say which field failed and why, in a format every endpoint shares.",
      "That is the job of a global error handler. One class annotated with @RestControllerAdvice catches exceptions from all controllers and turns each kind into a clean JSON response. Clients can then handle errors the same way everywhere.",
    ],
    deepDive: [
      {
        heading: "The common constraints and how they treat null",
        body: "Add spring-boot-starter-validation to the build; the web starter does not include it, and without it every annotation is silently ignored. The most used constraints: @NotNull, @NotEmpty and @NotBlank (see the diagram), @Size(min, max) for strings and collections, @Min, @Max, @Positive and @PositiveOrZero for numbers, @Email, @Pattern(regexp = ...) for formats, @Past and @Future for dates, and @Digits(integer, fraction) for amounts.\n\nAn important rule: almost every constraint except the @Not... family treats null as valid. @Email on a null field passes, and @Size(min = 3) on null passes too. That is deliberate, so optional fields can be validated only when present. For a required field, combine them: @NotBlank @Email String email.",
        visual: {
          type: "compare",
          title: "@NotNull vs @NotEmpty vs @NotBlank",
          columns: [
            { title: "@NotNull", points: ["Rejects null", "Accepts \"\"", "Accepts \"   \"", "Any type"] },
            { title: "@NotEmpty", points: ["Rejects null", "Rejects \"\"", "Accepts \"   \"", "Strings, collections, maps, arrays"] },
            { title: "@NotBlank", points: ["Rejects null", "Rejects \"\"", "Rejects \"   \"", "Strings only"] },
          ],
        },
      },
      {
        heading: "Where validation runs and what it throws",
        body: "@Valid on a @RequestBody parameter validates the object and throws MethodArgumentNotValidException on failure. Nested objects are validated only if the field also has @Valid, and items in a list need List<@Valid ItemRequest>. Without that, a broken nested address passes silently.\n\nConstraints directly on method parameters, such as @PathVariable @Positive long id or @RequestParam @Max(100) int size, use method validation. Since Spring Framework 6.1, controllers apply it automatically and raise HandlerMethodValidationException; older setups put @Validated on the class and got ConstraintViolationException. You can also put @Validated on a service so its methods are checked, which protects rules that do not come from HTTP, such as messages from a queue. Handle all of these in one advice so the client sees the same shape.",
        bullets: ["@Valid on the body parameter", "@Valid on nested fields and List<@Valid T>", "Parameter constraints: HandlerMethodValidationException (Spring 6.1+)"],
      },
      {
        heading: "Custom and cross-field constraints",
        body: "When the built-ins are not enough, write your own constraint. It has two parts: an annotation marked @Constraint(validatedBy = SkuValidator.class) with message, groups and payload attributes, and a class implementing ConstraintValidator<ValidSku, String> whose isValid method returns true or false. Return true for null and let @NotNull handle required checks, matching the built-in style.\n\nFor rules that involve two fields, such as an end date after a start date or a password matching its confirmation, put the constraint on the class instead of a field. The validator then receives the whole object. On a record, a simpler alternative is a boolean method annotated with @AssertTrue, such as @AssertTrue boolean isRangeValid(), which Bean Validation treats as a property. Messages can come from a ValidationMessages.properties file, which allows translation.",
      },
      {
        heading: "A standard error body: ProblemDetail",
        body: "RFC 9457 (which replaced RFC 7807) defines a standard JSON error format called problem details, with the media type application/problem+json. It has a few standard fields: type (a URI naming the error kind), title, status, detail and instance (the request path), and you may add your own, such as an errors map of field messages.\n\nSpring supports this with the ProblemDetail class. Return it from an @ExceptionHandler, or throw ErrorResponseException. Setting spring.mvc.problemdetails.enabled=true makes Spring's own exceptions, such as a 405 or a 415, use the format too. You can extend ResponseEntityExceptionHandler in your advice to inherit handlers for all built-in MVC exceptions and override only what you want to change.",
        bullets: ["ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, msg)", "problem.setProperty(\"errors\", fieldErrors)", "spring.mvc.problemdetails.enabled=true"],
      },
      {
        heading: "Designing the global handler",
        body: "Map each kind of failure to one status: validation errors to 400, your NotFoundException to 404, a duplicate or version clash to 409, an access problem to 403. Put these mappings in a single @RestControllerAdvice. Keep the domain code clean: services throw meaningful exceptions and know nothing about HTTP.\n\nAdd a last handler for Exception that returns 500 with a generic message and logs the full stack trace on the server, ideally with a request or trace id that you also put in the response. Clients can quote that id when they report a problem. Never return stack traces, SQL or class names to clients: they help attackers and confuse users. Spring Boot's defaults already hide them, with server.error.include-stacktrace set to never.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "An invalid request, start to finish",
        actors: ["Client", "Spring MVC", "Validator", "Error advice"],
        messages: [
          { from: 0, to: 1, label: "POST /users { \"email\": \"bad\" }" },
          { from: 1, to: 2, label: "validate CreateUserRequest" },
          { from: 2, to: 1, label: "email: must be a well-formed email" },
          { from: 1, to: 3, label: "MethodArgumentNotValidException" },
          { from: 3, to: 0, label: "400 problem+json with field errors" },
        ],
      },
    ],
    examples: [
      {
        title: "One advice for validation and not-found errors",
        explanation: "Step 1: a NotFoundException thrown anywhere becomes a 404 ProblemDetail with a clear message. Step 2: validation failures become a 400 ProblemDetail with an errors map from field to message. Step 3: anything else becomes a 500 with a generic message, while the real error is logged. Every endpoint now returns the same error shape without any try-catch in controllers.",
        code: {
          lang: "java",
          code: `@RestControllerAdvice
class ApiErrorHandler {
  private static final Logger log = LoggerFactory.getLogger(ApiErrorHandler.class);

  @ExceptionHandler(NotFoundException.class)
  ProblemDetail notFound(NotFoundException ex) {
    return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail invalid(MethodArgumentNotValidException ex) {
    var pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
    var errors = new TreeMap<String, String>();
    ex.getBindingResult().getFieldErrors().forEach(f -> errors.put(f.getField(), f.getDefaultMessage()));
    pd.setProperty("errors", errors);
    return pd;
  }

  @ExceptionHandler(Exception.class)
  ProblemDetail unexpected(Exception ex) {
    log.error("Unhandled error", ex);
    return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error");
  }
}`,
        },
      },
      {
        title: "A booking request with nested and cross-field rules",
        explanation: "A booking has a guest and a date range. Step 1: field constraints check each value. Step 2: @Valid on the guest field makes the nested Guest rules run too. Step 3: an @AssertTrue method checks that checkOut is after checkIn; if it is false, the error is reported under the name validRange. Step 4: with @Valid on the controller parameter, all rules run before the service sees the request.",
        code: {
          lang: "java",
          code: `record Guest(@NotBlank String name, @NotBlank @Email String email) {}

record BookingRequest(
    @NotNull @Valid Guest guest,
    @NotNull @FutureOrPresent LocalDate checkIn,
    @NotNull LocalDate checkOut,
    @Min(1) @Max(8) int guests) {

  @AssertTrue(message = "checkOut must be after checkIn")
  boolean isValidRange() {
    return checkIn == null || checkOut == null || checkOut.isAfter(checkIn);
  }
}

// @PostMapping("/bookings") ... create(@Valid @RequestBody BookingRequest req)`,
        },
      },
    ],
    cheatSheet: [
      "Add spring-boot-starter-validation or annotations are ignored",
      "@NotBlank for required text; @NotNull for required objects and numbers",
      "Most constraints accept null; combine with @NotNull for required fields",
      "Nested objects need @Valid on the field; lists need List<@Valid T>",
      "@Valid body failure: MethodArgumentNotValidException, 400 by default",
      "ProblemDetail gives RFC 9457 error bodies (application/problem+json)",
      "One @RestControllerAdvice maps exceptions to status codes for all controllers",
      "Never return stack traces; log them with a request id instead",
    ],
    quiz: [
      {
        q: "A field annotated @NotEmpty receives \"   \" (three spaces). What happens?",
        options: ["It passes, because the string is not empty", "It fails", "It is trimmed to empty and fails", "It becomes null"],
        answer: 0,
        why: "@NotEmpty only checks length; use @NotBlank to reject whitespace-only text.",
      },
      {
        q: "A DTO field is annotated only with @Email and the client omits it (null). What happens?",
        options: ["Validation fails with must not be null", "A NullPointerException", "Validation passes", "Jackson rejects the request"],
        answer: 2,
        why: "Most constraints treat null as valid; add @NotNull or @NotBlank to require it.",
      },
      {
        q: "An order DTO has a List<Item> items, and Item has @Positive quantity. A negative quantity gets through. Why?",
        options: ["@Positive does not work on int", "Lists cannot be validated", "The controller needs @Validated", "The list needs List<@Valid Item> (or @Valid on the field)"],
        answer: 3,
        why: "Validation does not cascade into nested objects unless you mark them with @Valid.",
      },
      {
        q: "Which standard defines the problem+json error format that Spring's ProblemDetail follows?",
        options: ["RFC 6749", "RFC 9457", "RFC 7519", "RFC 2616"],
        answer: 1,
        why: "RFC 9457 replaced RFC 7807 as the problem details standard.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a SignupRequest record: username 3 to 20 characters, a valid email, a password of at least 12 characters, and an age of at least 16.",
        hint: "Combine @NotBlank with @Size and @Email.",
        solution: "record SignupRequest(\n    @NotBlank @Size(min = 3, max = 20) String username,\n    @NotBlank @Email String email,\n    @NotBlank @Size(min = 12) String password,\n    @Min(16) int age) {}",
      },
      {
        level: "medium",
        task: "Make GET /api/products/{id} reject ids below 1 with a 400, and map your ProductNotFoundException to a 404 ProblemDetail.",
        hint: "Use @Positive on the path variable (Spring 6.1+ validates it) and an @ExceptionHandler.",
        solution: "@GetMapping(\"/api/products/{id}\")\nProductResponse get(@PathVariable @Positive long id) { return service.find(id); }\n\n@RestControllerAdvice\nclass ProductErrors {\n  @ExceptionHandler(ProductNotFoundException.class)\n  ProblemDetail notFound(ProductNotFoundException ex) {\n    var pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());\n    pd.setTitle(\"Product not found\");\n    return pd;\n  }\n}",
      },
      {
        level: "hard",
        task: "Create a custom @Sku constraint that accepts codes like AB-1234 (two capital letters, a dash, four digits) and treats null as valid.",
        hint: "An annotation with @Constraint plus a ConstraintValidator implementation.",
        solution: "@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})\n@Retention(RetentionPolicy.RUNTIME)\n@Constraint(validatedBy = SkuValidator.class)\n@interface Sku {\n  String message() default \"must look like AB-1234\";\n  Class<?>[] groups() default {};\n  Class<? extends Payload>[] payload() default {};\n}\n\nclass SkuValidator implements ConstraintValidator<Sku, String> {\n  public boolean isValid(String v, ConstraintValidatorContext c) {\n    return v == null || v.matches(\"[A-Z]{2}-\\\\d{4}\");\n  }\n}",
      },
    ],
    faq: [
      { q: "What is the difference between @Valid and @Validated?", a: "@Valid is the Jakarta standard and triggers validation, including cascading into nested objects. @Validated is Spring's variant that also supports validation groups and enables method validation when placed on a class." },
      { q: "Should I validate in the service layer as well?", a: "Validate input format at the edge with DTO annotations, and enforce business rules, such as stock or uniqueness, in the service, because they need data and can be reached from other entry points too." },
      { q: "How do I change the default error messages?", a: "Set message on the annotation, for example @Size(min = 3, message = \"too short\"), or use a key like {user.name.size} defined in ValidationMessages.properties." },
      { q: "Why does my uniqueness check still allow duplicates?", a: "A check like existsByEmail can race with another request. Keep a UNIQUE constraint in the database and map the resulting DataIntegrityViolationException to a 409." },
    ],
  },

  "spring/spring-jpa": {
    plain: [
      "Writing SQL by hand for every insert, update and select gets repetitive. JPA (Jakarta Persistence API) lets you map a Java class to a table, and then save and load objects instead of writing SQL. Hibernate is the library that does the actual work and generates the SQL.",
      "Spring Data JPA removes even more code. You write an interface such as interface BookRepository extends JpaRepository<Book, Long>, and you immediately get save, findById, findAll, delete and paging, without writing a single method body.",
      "You can add your own queries just by naming methods: findByAuthorAndYearGreaterThan(String author, int year). Spring reads the method name and builds the query at startup. For harder cases you write JPQL, a SQL-like language over your entities, or plain native SQL.",
      "The convenience has a price: it is easy to run many more queries than you think. Loading 100 authors and then touching each author's books can quietly run 101 queries. Learning to see and control the SQL that Hibernate sends is the key skill in this topic.",
    ],
    deepDive: [
      {
        heading: "Mapping entities properly",
        body: "An entity needs @Entity, an @Id and a no-argument constructor (it can be protected). For ids in PostgreSQL, @GeneratedValue(strategy = GenerationType.IDENTITY) uses an identity column, which is simple but prevents Hibernate from batching inserts. GenerationType.SEQUENCE with a sequence allows batching and is preferred for bulk inserts.\n\nUse @Column(nullable = false, length = 200) to document constraints, but remember the database schema, created by your migrations, is what really enforces them. Map enums with @Enumerated(EnumType.STRING). The default, ORDINAL, stores 0, 1, 2, so inserting a new constant in the middle silently changes the meaning of existing rows. Set spring.jpa.hibernate.ddl-auto=validate in real environments: Hibernate checks the schema matches the entities but never changes it; Flyway owns the schema.",
        bullets: ["@Enumerated(EnumType.STRING), never the ORDINAL default", "ddl-auto: none or validate outside local experiments", "Base equals and hashCode on a stable business key or id carefully"],
      },
      {
        heading: "The persistence context and entity states",
        body: "Inside a transaction, Hibernate keeps a persistence context: a map of every entity it has loaded or saved, at most one object per row. Loading the same id twice returns the same object, without a second query. These entities are managed, and Hibernate watches them. When the transaction commits, it compares each managed entity with its original state and writes UPDATE statements for the changes. This is called dirty checking, and it means you do not need to call save() after changing a managed entity.\n\nWhen the transaction ends, entities become detached: changes to them are no longer tracked, and touching an unloaded lazy relation throws LazyInitializationException. A new object you create with new is transient until you persist it. Understanding these states explains most surprising JPA behaviour.",
        visual: {
          type: "flow",
          title: "Entity states",
          steps: [
            { label: "Transient", detail: "new Book(): Hibernate does not know it" },
            { label: "Managed", detail: "After persist or find: changes are tracked" },
            { label: "Flush and commit", detail: "Dirty checking writes INSERT and UPDATE" },
            { label: "Detached", detail: "Transaction over: no tracking, no lazy loading" },
            { label: "Merged or removed", detail: "merge copies state back; remove deletes" },
          ],
        },
      },
      {
        heading: "Relationships without surprises",
        body: "In a one-to-many pair, the @ManyToOne side holds the foreign key and is the owning side; the @OneToMany(mappedBy = \"author\") side is only a mirror. Only changes to the owning side are written to the database, so keep both sides in sync with helper methods like addBook(book), which adds to the list and sets book.setAuthor(this).\n\nWatch the defaults. @ManyToOne and @OneToOne are EAGER by default, so loading a list of books also loads every author, often with extra queries. Set fetch = FetchType.LAZY on them. Collections are lazy by default. cascade = CascadeType.ALL plus orphanRemoval = true suits parent-child pairs like an order and its lines. For @ManyToMany use a Set and never cascade removal, because the other side is shared. If the link needs its own data, such as a quantity, model the join table as its own entity.",
        bullets: ["@ManyToOne(fetch = FetchType.LAZY) everywhere", "mappedBy marks the non-owning side", "Use helper methods to update both sides"],
      },
      {
        heading: "Queries: derived, JPQL, native and projections",
        body: "Derived queries are built from method names: findByEmail, findByStatusAndCreatedAtAfter, existsBySku, countByStatus, findTop10ByOrderByPriceDesc, deleteByExpiresAtBefore. They are checked at startup, so a typo fails fast. When a name gets long, switch to @Query with JPQL: select o from Order o where o.customer.id = :customerId and o.total > :min. JPQL uses entity and field names, not tables and columns.\n\nFor reports, load only what you need. A JPQL constructor expression, select new com.shop.OrderSummary(o.id, o.total) from Order o, fills a record directly, with no entity tracking. Interface projections work too. Use nativeQuery = true for database-specific SQL, such as PostgreSQL JSON operators. Bulk updates with @Modifying @Query(\"update ...\") bypass the persistence context, so loaded entities may be stale afterwards.",
      },
      {
        heading: "Seeing and fixing N+1 queries",
        body: "First, make queries visible. In development set logging.level.org.hibernate.SQL=debug, or spring.jpa.show-sql=true, and look at the log while you click through a page. If one list request prints dozens of similar SELECTs, you have N+1.\n\nThere are several fixes. A fetch join, select a from Author a join fetch a.books, loads parents and children in one query. @EntityGraph(attributePaths = \"books\") on a repository method does the same without writing JPQL. Setting hibernate.default_batch_fetch_size (spring.jpa.properties.hibernate.default_batch_fetch_size=50) makes Hibernate load lazy collections for many parents at once with IN queries, which is a good global safety net. For read-only screens, a DTO projection avoids the problem entirely. Be careful combining a collection fetch join with paging: Hibernate applies the limit in memory and logs a warning.",
        visual: {
          type: "compare",
          title: "Three ways to stop N+1",
          columns: [
            { title: "Fetch join / @EntityGraph", points: ["One query with a JOIN", "Chosen per repository method", "Watch out with paging", "Best for detail screens"] },
            { title: "Batch fetching", points: ["default_batch_fetch_size=50", "Lazy loads grouped with IN (...)", "Works for every relation", "Good global default"] },
            { title: "DTO projection", points: ["select new ...Summary(...)", "Only needed columns", "No entity tracking cost", "Best for lists and reports"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "What N+1 looks like in the SQL log",
        actors: ["Controller loop", "Hibernate", "PostgreSQL"],
        messages: [
          { from: 0, to: 1, label: "authorRepo.findAll()" },
          { from: 1, to: 2, label: "select * from author (100 rows)" },
          { from: 0, to: 1, label: "author1.getBooks().size()" },
          { from: 1, to: 2, label: "select * from book where author_id=1" },
          { from: 0, to: 1, label: "author2.getBooks().size()" },
          { from: 1, to: 2, label: "select * from book where author_id=2" },
          { from: 1, to: 2, label: "... 98 more queries" },
        ],
      },
    ],
    examples: [
      {
        title: "An order with lines as a parent-child aggregate",
        explanation: "An order owns its lines: lines are saved and deleted with the order. Step 1: the OrderLine side holds the foreign key with a lazy @ManyToOne. Step 2: the Order side uses mappedBy, cascade ALL and orphanRemoval, so removing a line from the list deletes its row. Step 3: the addLine helper keeps both sides in sync. Step 4: saving the order inserts the order and all its lines in one transaction.",
        code: {
          lang: "java",
          code: `@Entity
class PurchaseOrder {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderLine> lines = new ArrayList<>();

  void addLine(OrderLine line) { lines.add(line); line.order = this; }
  void removeLine(OrderLine line) { lines.remove(line); line.order = null; }
}

@Entity
class OrderLine {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;
  @ManyToOne(fetch = FetchType.LAZY, optional = false) PurchaseOrder order;
  String sku; int quantity;
}`,
        },
      },
      {
        title: "Fixing N+1 on an author list page",
        explanation: "The authors page shows each author with their book titles and takes 2 seconds. Step 1: turn on SQL logging and see 1 query for authors plus 1 per author for books. Step 2: add a repository method with @EntityGraph so books are fetched in the same query. Step 3: use it in the service. Step 4: reload the page; the log shows a single select with a left join, and the page loads in milliseconds.",
        code: {
          lang: "java",
          code: `# application.yml (development)
# logging.level.org.hibernate.SQL: debug

interface AuthorRepository extends JpaRepository<Author, Long> {
  @EntityGraph(attributePaths = "books")
  @Query("select a from Author a order by a.name")
  List<Author> findAllWithBooks();
}

// Service, inside @Transactional(readOnly = true)
List<AuthorView> authors = repo.findAllWithBooks().stream()
    .map(a -> new AuthorView(a.getName(),
        a.getBooks().stream().map(Book::getTitle).toList()))
    .toList();`,
        },
      },
    ],
    cheatSheet: [
      "Set fetch = FetchType.LAZY on every @ManyToOne and @OneToOne",
      "Map enums with @Enumerated(EnumType.STRING)",
      "Managed entities are saved by dirty checking at commit; no save() needed",
      "logging.level.org.hibernate.SQL=debug shows every SQL statement",
      "Fix N+1 with join fetch, @EntityGraph, batch fetching or DTO projections",
      "spring.jpa.open-in-view=false keeps lazy loading out of the web layer",
      "ddl-auto=validate in real environments; Flyway owns the schema",
      "select new com.x.Dto(...) in JPQL loads read-only data without entities",
    ],
    quiz: [
      {
        q: "What is the default fetch type of a @ManyToOne relation?",
        options: ["LAZY", "EAGER", "It depends on the database", "None, you must set it"],
        answer: 1,
        why: "JPA makes to-one relations EAGER by default, so set LAZY explicitly.",
      },
      {
        q: "Inside a @Transactional method you load a Book, call book.setTitle(\"New\"), and do not call save(). What happens at commit?",
        options: ["Nothing, the change is lost", "An exception is thrown", "The change is written, because dirty checking detects it", "Only the cache is updated"],
        answer: 2,
        why: "Managed entities are compared with their loaded state and updated automatically on flush.",
      },
      {
        q: "An enum Status { NEW, PAID } is stored with the default mapping. Someone adds CANCELLED between them. What breaks?",
        options: ["Existing PAID rows now read as CANCELLED", "Nothing", "The app fails to start", "New rows cannot be saved"],
        answer: 0,
        why: "ORDINAL stores positions, so inserting a constant shifts the meaning of stored numbers.",
      },
      {
        q: "A controller returns entities after the transaction ended, and Jackson throws LazyInitializationException. What is the cause?",
        options: ["The database is down", "The entity has no @Id", "Jackson cannot serialise lists", "A lazy relation was touched on a detached entity"],
        answer: 3,
        why: "Lazy loading needs an open persistence context; map to DTOs inside the transaction instead.",
      },
      {
        q: "In a bidirectional Author-Book relation, which side's changes decide the foreign key value?",
        options: ["The @OneToMany side", "The @ManyToOne side, which owns the relation", "Whichever side was changed last", "Both must be saved separately"],
        answer: 1,
        why: "The side without mappedBy is the owner; the mappedBy side is ignored for writes.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a Product entity (id, sku, name, price) and a repository with methods to find by SKU ignoring case and to get the 5 most expensive products.",
        hint: "Derived queries: IgnoreCase and Top5...OrderBy...Desc.",
        solution: "@Entity\nclass Product {\n  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) Long id;\n  @Column(nullable = false, unique = true) String sku;\n  String name;\n  BigDecimal price;\n}\n\ninterface ProductRepository extends JpaRepository<Product, Long> {\n  Optional<Product> findBySkuIgnoreCase(String sku);\n  List<Product> findTop5ByOrderByPriceDesc();\n}",
      },
      {
        level: "medium",
        task: "Return a list of OrderSummary(id, customerName, total) records for orders above a minimum total, without loading Order entities.",
        hint: "JPQL constructor expression with the fully qualified record name.",
        solution: "record OrderSummary(Long id, String customerName, BigDecimal total) {}\n\ninterface OrderRepository extends JpaRepository<Order, Long> {\n  @Query(\"\"\"\n      select new com.shop.OrderSummary(o.id, c.name, o.total)\n      from Order o join o.customer c\n      where o.total > :min\n      order by o.total desc\"\"\")\n  List<OrderSummary> summariesAbove(@Param(\"min\") BigDecimal min);\n}",
      },
      {
        level: "hard",
        task: "A page lists authors with the number of books each has. It currently loads every book. Rewrite it as one query that returns counts, including authors with zero books.",
        hint: "Left join and group by, returning a projection record.",
        solution: "record AuthorBookCount(Long id, String name, long books) {}\n\n@Query(\"\"\"\n    select new com.shop.AuthorBookCount(a.id, a.name, count(b))\n    from Author a left join a.books b\n    group by a.id, a.name\n    order by a.name\"\"\")\nList<AuthorBookCount> authorsWithBookCounts();\n// One SQL query; count(b) gives 0 for authors without books.",
      },
    ],
    faq: [
      { q: "What is the difference between JPA, Hibernate and Spring Data JPA?", a: "JPA is the specification (annotations and the EntityManager API). Hibernate is the most popular implementation of it. Spring Data JPA sits on top and generates repository implementations for you." },
      { q: "Should I turn off open-in-view?", a: "Usually yes. With it on, the default, lazy loading works during JSON rendering, which hides N+1 problems and holds database connections longer. Set spring.jpa.open-in-view=false and load what you need in the service." },
      { q: "Why does findAll() feel slow on a big table?", a: "It loads every row into managed entities. Use paging with findAll(Pageable), a narrower query, or a DTO projection." },
      { q: "When should I use native queries?", a: "When you need database-specific features such as window functions, JSON operators or upserts that JPQL cannot express. Keep them in the repository and cover them with Testcontainers tests." },
    ],
  },

  "spring/spring-tx": {
    plain: [
      "A transaction is a group of database changes that must succeed or fail together. Moving money is the classic case: take 100 from account A and add 100 to account B. If the second step fails, the first must be undone, or money disappears. The database can do this for you, but someone has to say where the group starts and ends.",
      "In Spring you say it with one annotation: @Transactional on a service method. Spring opens a transaction before the method runs. If the method returns normally, it commits (saves everything). If it throws an unchecked exception, it rolls back (undoes everything). You write normal code and Spring handles the begin, commit and rollback.",
      "The second half of this topic is the shape of the database itself: tables, columns and indexes. That shape is called the schema, and it changes as your app grows. Flyway keeps those changes as numbered SQL files in your project, such as V1__create_users.sql and V2__add_email.sql, and applies the missing ones every time the app starts.",
      "Together they give you two safety nets. Transactions keep the data consistent while the app runs. Migrations keep the schema the same on every laptop, test server and production database, and give you a written history of every change.",
    ],
    deepDive: [
      {
        heading: "The proxy: why some @Transactional methods do nothing",
        body: "Spring does not change your class. At startup it wraps the bean in a proxy, a small object with the same methods. Other beans get the proxy injected. When they call a method, the proxy asks the transaction manager to begin, calls your real method, then commits or rolls back.\n\nThat design explains the classic traps. A call from one method to another inside the same class uses this, not the proxy, so the inner annotation is ignored. Private methods can never be intercepted. A bean you create yourself with new is not a Spring bean, so it has no proxy at all. The fix is usually to move the method to a second bean, or to put @Transactional on the public entry method that the controller calls.",
        bullets: [
          "Put @Transactional on service methods, not on controllers or repositories you write",
          "Self-invocation skips the proxy: this.other() runs with no new transaction rules",
          "Log org.springframework.transaction at DEBUG to see begin, commit and rollback",
        ],
      },
      {
        heading: "Propagation: joining or starting a transaction",
        body: "Propagation decides what happens when a transactional method is called while a transaction is already running. The default, REQUIRED, joins the existing one or starts a new one if there is none. Most of your code should use it.\n\nREQUIRES_NEW suspends the outer transaction and starts a completely separate one, with its own database connection. It commits or rolls back on its own, which is useful for audit logs that must be saved even when the main work fails. Use it with care: each nested call holds a second connection from the pool, so heavy use can exhaust the pool. NESTED creates a savepoint inside the same transaction, so a failure can roll back to that point without losing the earlier work; it needs a JDBC-based transaction manager that supports savepoints. MANDATORY throws if no transaction exists, a good guard for methods that must never run alone.",
        visual: {
          type: "compare",
          title: "Three propagation types side by side",
          columns: [
            { title: "REQUIRED (default)", points: ["Joins the caller's transaction", "One connection, one commit", "Inner failure fails everything", "Right choice for most code"] },
            { title: "REQUIRES_NEW", points: ["Suspends the caller's transaction", "Second connection from the pool", "Commits even if the caller rolls back", "Good for audit and outbox rows"] },
            { title: "NESTED", points: ["Same transaction, adds a savepoint", "Rolls back only to the savepoint", "Outer rollback still undoes it", "Needs savepoint support (JDBC)"] },
          ],
        },
      },
      {
        heading: "Rollback rules and the rollback-only surprise",
        body: "By default Spring rolls back on RuntimeException and Error, and commits on checked exceptions such as IOException. The idea comes from old EJB rules: a checked exception was seen as an expected business outcome. Change it per method with rollbackFor = Exception.class, or keep a specific runtime exception from rolling back with noRollbackFor.\n\nA common surprise: an inner REQUIRED method throws, the outer method catches the exception and carries on. Because both share one transaction, the inner failure already marked it rollback-only. When the outer method returns, Spring tries to commit, finds the mark, rolls back and throws UnexpectedRollbackException. If the inner work is allowed to fail on its own, it needs REQUIRES_NEW or NESTED, not a try/catch.",
        bullets: [
          "@Transactional(rollbackFor = Exception.class) also rolls back on checked exceptions",
          "readOnly = true lets Hibernate skip dirty checking and flushing for queries",
          "timeout = 5 rolls back if the transaction runs longer than 5 seconds",
        ],
      },
      {
        heading: "How Flyway names, orders and checks migrations",
        body: "Spring Boot runs Flyway automatically when flyway-core is on the classpath, before JPA starts. Files live in classpath:db/migration by default. A versioned file is named V, a version, two underscores, then a description: V3__add_order_index.sql. Versions sort numerically, so V10 runs after V9. Repeatable files start with R__ and rerun whenever their content changes, handy for views and functions.\n\nFlyway stores each applied version and a checksum in the flyway_schema_history table. On the next start it validates: if an applied file was edited, the checksum differs and startup fails. That is a feature, it stops two databases from quietly drifting apart. For an existing database with no history table, set spring.flyway.baseline-on-migrate=true once. Since Flyway 10, PostgreSQL support lives in a separate module, flyway-database-postgresql, which you add next to flyway-core.",
        bullets: [
          "spring.flyway.locations=classpath:db/migration is the default location",
          "Use spring.jpa.hibernate.ddl-auto=validate so Hibernate checks but never changes the schema",
          "Undo migrations are not in the free edition: write a new forward migration instead",
        ],
      },
      {
        heading: "Changing a live schema without downtime",
        body: "During a rolling deploy, old and new versions of the app run at the same time against one database. A migration that renames or drops a column breaks the old version instantly. The safe method is called expand and contract.\n\nFirst expand: add the new column or table, nullable, so old code ignores it. Deploy code that writes to both old and new places. Backfill old rows in batches so you do not lock a large table for minutes. Switch reads to the new column. Only after no running version uses the old column do you contract with a final migration that drops it. In PostgreSQL, create indexes on big tables with CREATE INDEX CONCURRENTLY, which cannot run inside a transaction, so put it in its own migration file and turn off the transaction for that script.",
        visual: {
          type: "flow",
          title: "Expand and contract: renaming a column safely",
          steps: [
            { label: "Add new column", detail: "Nullable, so old code keeps working" },
            { label: "Write to both", detail: "New release fills old and new columns" },
            { label: "Backfill in batches", detail: "Copy old rows a few thousand at a time" },
            { label: "Read from new", detail: "Next release uses only the new column" },
            { label: "Drop old column", detail: "Final migration, once nothing reads it" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "The rollback-only trap with a caught exception",
        actors: ["OrderService (outer)", "StockService (inner)", "Transaction manager"],
        messages: [
          { from: 0, to: 2, label: "Begin transaction (REQUIRED)" },
          { from: 0, to: 1, label: "reserve(): joins the same transaction" },
          { from: 1, to: 2, label: "Throws: mark rollback-only" },
          { from: 1, to: 0, label: "Exception caught, outer carries on" },
          { from: 0, to: 2, label: "Method returns: try to commit" },
          { from: 2, to: 0, label: "Rolls back, throws UnexpectedRollbackException" },
        ],
      },
    ],
    examples: [
      {
        title: "An audit row that survives a failed order",
        explanation: "Every order attempt must be audited, even when the order fails. Step 1: put the audit write in its own bean, so the call goes through a proxy. Step 2: mark it REQUIRES_NEW, so it commits in its own transaction. Step 3: call it from placeOrder. If chargeCard throws, the order rows roll back, but the audit row is already committed. Keep the audit method short, because while it runs the outer transaction holds its connection too.",
        code: {
          lang: "java",
          code: "@Service\nclass AuditService {\n  private final AuditRepository audits;\n  AuditService(AuditRepository audits) { this.audits = audits; }\n\n  @Transactional(propagation = Propagation.REQUIRES_NEW)\n  public void record(String event) { audits.save(new AuditEntry(event, Instant.now())); }\n}\n\n@Transactional\npublic void placeOrder(Order o) {\n  audit.record(\"order attempt \" + o.getRef());   // commits on its own\n  orders.save(o);\n  payments.chargeCard(o);                         // throws: order rolls back, audit stays\n}",
        },
      },
      {
        title: "Adding a required column to a big table",
        explanation: "You need users.country to be NOT NULL, and the table has 20 million rows. Doing it in one ALTER with a default is fine in modern PostgreSQL (11 and later store a constant default without rewriting the table), but a computed value needs a backfill. Step 1: V7 adds the column as nullable. Step 2: V8 fills it. Step 3: V9 adds the NOT NULL rule once every row has a value. Each file is applied once and recorded in flyway_schema_history.",
        code: {
          lang: "sql",
          code: "-- V7__add_user_country.sql\nALTER TABLE users ADD COLUMN country TEXT;\n\n-- V8__backfill_user_country.sql\nUPDATE users u SET country = a.country\nFROM addresses a\nWHERE a.user_id = u.id AND u.country IS NULL;\nUPDATE users SET country = 'unknown' WHERE country IS NULL;\n\n-- V9__user_country_not_null.sql\nALTER TABLE users ALTER COLUMN country SET NOT NULL;",
        },
      },
    ],
    cheatSheet: [
      "@Transactional rolls back on RuntimeException and Error, not on checked exceptions",
      "rollbackFor = Exception.class makes checked exceptions roll back too",
      "Self-invocation and private methods bypass the proxy: no transaction rules apply",
      "REQUIRES_NEW uses a second connection; NESTED uses a savepoint in the same one",
      "Flyway file name: V2__add_email.sql (V, version, two underscores, description) in db/migration",
      "Never edit an applied migration; its checksum is validated on every start",
      "Pair Flyway with spring.jpa.hibernate.ddl-auto=validate",
      "Keep transactions short: no HTTP calls or slow work while a connection is held",
    ],
    quiz: [
      {
        q: "A @Transactional method throws java.io.IOException (a checked exception). With default settings, what happens?",
        options: ["The transaction rolls back", "The transaction commits", "Spring retries the method", "The application fails to start"],
        answer: 1,
        why: "By default only unchecked exceptions and errors trigger rollback; checked ones commit unless you set rollbackFor.",
      },
      {
        q: "Which propagation suspends the caller's transaction and commits independently?",
        options: ["REQUIRED", "MANDATORY", "SUPPORTS", "REQUIRES_NEW"],
        answer: 3,
        why: "REQUIRES_NEW starts a separate physical transaction that commits or rolls back on its own.",
      },
      {
        q: "An outer method catches an exception thrown by an inner REQUIRED method, then returns normally. What is the result?",
        options: ["UnexpectedRollbackException and a rollback", "Both changes commit", "Only the inner change commits", "Only the outer change commits"],
        answer: 0,
        why: "The inner failure marked the shared transaction rollback-only, so the commit attempt fails.",
      },
      {
        q: "A teammate edited V3__init.sql after it ran in production. What does Flyway do on the next start?",
        options: ["Runs the new version of V3", "Ignores the change silently", "Fails validation because the checksum changed", "Renames the file to V4"],
        answer: 2,
        why: "Flyway compares stored checksums with the files and stops when an applied migration has changed.",
      },
      {
        q: "Why should a column drop come in a later release than the code change that stops using it?",
        options: ["Flyway cannot drop columns", "Old app instances still running during a rolling deploy would break", "PostgreSQL forbids drops in the same week", "Hibernate caches the column forever"],
        answer: 1,
        why: "During a rolling deploy the old version still reads the column, so dropping it early causes errors.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make a service method roll back when it throws a checked BusinessException, and prove it with a test that checks the row count.",
        hint: "Use rollbackFor on the annotation; in the test call the method, catch the exception, then count rows.",
        solution: "@Transactional(rollbackFor = BusinessException.class)\npublic void create(Item i) throws BusinessException {\n  items.save(i);\n  if (i.price().signum() < 0) throw new BusinessException(\"negative price\");\n}\n\n// test\nassertThrows(BusinessException.class, () -> service.create(badItem));\nassertEquals(0, items.count());",
      },
      {
        level: "medium",
        task: "You have a private @Transactional helper called from a public method in the same class, and it never rolls back. Fix it two different ways.",
        hint: "Either move the annotation to the public entry point, or move the helper to another bean.",
        solution: "// Fix 1: annotate the public method the controller calls\n@Transactional\npublic void importAll(List<Row> rows) { rows.forEach(this::saveRow); }\nprivate void saveRow(Row r) { repo.save(r.toEntity()); }\n\n// Fix 2: move the helper to its own bean so calls go through the proxy\n@Service class RowWriter {\n  @Transactional public void saveRow(Row r) { repo.save(r.toEntity()); }\n}",
      },
      {
        level: "hard",
        task: "Add an index to a 50-million-row orders table in PostgreSQL through Flyway without blocking writes.",
        hint: "CREATE INDEX CONCURRENTLY cannot run inside a transaction; Flyway lets one script opt out.",
        solution: "-- V12__orders_customer_idx.sql\n-- flyway:executeInTransaction=false\nCREATE INDEX CONCURRENTLY IF NOT EXISTS orders_customer_id_idx\n  ON orders (customer_id);\n\n-- Keep this as the only statement in the file.\n-- If it fails midway, drop the INVALID index and rerun:\n-- DROP INDEX CONCURRENTLY orders_customer_id_idx;",
      },
    ],
    faq: [
      { q: "Should @Transactional go on the class or on each method?", a: "Either works; on the class it applies to every public method. Many teams put readOnly = true on the class and override with a plain @Transactional on the methods that write." },
      { q: "Do I need @Transactional on Spring Data repository methods?", a: "Not for the methods inherited from JpaRepository: they are already transactional, with save in a write transaction and findById or findAll read-only. You add it on your service to group several calls into one transaction." },
      { q: "Flyway or Liquibase?", a: "Both version your schema well. Flyway uses plain SQL files and is simpler to learn; Liquibase adds XML, YAML or JSON changelogs and more built-in rollback features." },
      { q: "Can Flyway roll back a migration?", a: "The free edition has no undo command. The usual practice is to write a new forward migration that reverses the change, and to back up before risky releases." },
    ],
  },

  "spring/spring-security": {
    plain: [
      "Most APIs need two questions answered on every request. Who is calling? And is this caller allowed to do this? The first is authentication (proving identity). The second is authorization (checking permission). Spring Security answers both before your controller code ever runs.",
      "It works like a row of guards at a door. Each request passes a line of small checks called filters. One filter reads the login token, another checks the rules for that URL, another turns failures into the right HTTP error. If any guard says no, the request stops and your controller never sees it.",
      "Passwords need special care. You never store the password itself. You store a hash, a one-way scrambled version made with BCrypt. At login, Spring hashes what the user typed and compares the two. If your database leaks, attackers get hashes that are slow and expensive to crack.",
      "For APIs used by mobile apps and single-page web apps, a common pattern is JWT (JSON Web Token). The user logs in once and receives a signed token. They send it in the Authorization header on every request. The server checks the signature and the expiry time, and knows who the user is without a session.",
    ],
    deepDive: [
      {
        heading: "How the filter chain is wired into the server",
        body: "The servlet container (Tomcat) knows nothing about Spring beans. Spring Boot registers one servlet filter, DelegatingFilterProxy, which hands each request to a Spring bean called FilterChainProxy. That bean holds one or more SecurityFilterChain objects you define with @Bean. For each request it picks the first chain whose matcher fits the URL and runs only that chain's filters.\n\nThis lets you have different rules for different parts of the app, for example a stateless JWT chain for /api/** and a form-login chain for /admin/**. Use securityMatcher on each chain and @Order to control which is checked first. Near the end of every chain, ExceptionTranslationFilter catches security errors: an AuthenticationException becomes 401 through the AuthenticationEntryPoint, and an AccessDeniedException becomes 403 through the AccessDeniedHandler. AuthorizationFilter, the last one, applies your URL rules.",
        visual: {
          type: "layers",
          title: "Where Spring Security sits in a request",
          layers: [
            { label: "Tomcat", detail: "Receives the HTTP request" },
            { label: "DelegatingFilterProxy", detail: "Plain servlet filter that bridges to Spring" },
            { label: "FilterChainProxy", detail: "Picks the first matching SecurityFilterChain" },
            { label: "Security filters", detail: "CORS, CSRF, token reading, exception translation" },
            { label: "AuthorizationFilter", detail: "Applies URL rules: permit, deny, hasRole" },
            { label: "DispatcherServlet and controller", detail: "Your code, reached only if allowed" },
          ],
        },
      },
      {
        heading: "Authentication with a user store",
        body: "A login check has three parts. AuthenticationManager (usually ProviderManager) receives a username and password token. It asks its providers; for passwords that is DaoAuthenticationProvider. That provider calls your UserDetailsService.loadUserByUsername to fetch the stored user, then PasswordEncoder.matches to compare the typed password with the stored hash.\n\nYou supply the UserDetailsService, typically a small class that loads a user entity with a JPA repository and returns a UserDetails with the hash and authorities. If the user is not found, throw UsernameNotFoundException; Spring reports it as bad credentials, so attackers cannot tell which usernames exist. On success the result is an authenticated Authentication object, which is stored in the SecurityContext for the rest of the request.",
        visual: {
          type: "sequence",
          title: "What happens inside authenticate()",
          actors: ["Login endpoint", "AuthenticationManager", "UserDetailsService", "PasswordEncoder"],
          messages: [
            { from: 0, to: 1, label: "authenticate(username, password)" },
            { from: 1, to: 2, label: "loadUserByUsername(username)" },
            { from: 2, to: 1, label: "UserDetails: hash and roles" },
            { from: 1, to: 3, label: "matches(typed, storedHash)" },
            { from: 3, to: 1, label: "true" },
            { from: 1, to: 0, label: "Authenticated, with authorities" },
          ],
        },
      },
      {
        heading: "BCrypt: what the stored hash really contains",
        body: "A BCrypt hash looks like $2a$10$ followed by 53 characters, 60 in total. The 10 is the cost factor: the algorithm runs 2 to the power of 10 rounds. Each extra point doubles the work, so cost 12 takes about four times longer than 10. Spring's BCryptPasswordEncoder uses 10 by default. Aim for a login check that takes a few hundred milliseconds on your servers.\n\nThe next 22 characters are a random salt, made fresh for every password. Two users with the same password get different hashes, so precomputed tables are useless. Note that BCrypt only uses the first 72 bytes of the input. For future upgrades, PasswordEncoderFactories.createDelegatingPasswordEncoder() stores a prefix such as {bcrypt} so you can later switch algorithms and still verify old hashes.",
        bullets: [
          "new BCryptPasswordEncoder(12) raises the cost factor",
          "Never compare hashes yourself; use encoder.matches(raw, hash)",
          "Spring Security 6.3+ can also check passwords against known breach lists",
        ],
      },
      {
        heading: "Issuing and validating JWTs",
        body: "A JWT has three base64url parts separated by dots: a header (the algorithm), a payload of claims, and a signature. Standard claims include sub (the user), iat (issued at), exp (expiry), iss (issuer) and aud (audience). Anyone can decode the payload, so it must never hold secrets.\n\nWith HS256 the same secret signs and verifies; it must be at least 256 bits and come from configuration, not source code. With RS256 a private key signs and any service can verify with the public key, which suits many services. You do not need to write your own filter: add spring-boot-starter-oauth2-resource-server and call oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults())). Spring then validates the signature, exp and nbf on every request. Keep access tokens short-lived (5 to 15 minutes) and use refresh tokens for longer sessions, because a signed JWT cannot easily be revoked before it expires.",
        bullets: [
          "spring.security.oauth2.resourceserver.jwt.issuer-uri points at a real identity provider",
          "By default the scope claim becomes SCOPE_ authorities; map a roles claim yourself",
          "Return 401 with WWW-Authenticate: Bearer when the token is missing or invalid",
        ],
      },
      {
        heading: "Role-based access rules",
        body: "URL rules in authorizeHttpRequests are checked top to bottom and the first match wins, so put specific paths before general ones and finish with anyRequest().authenticated(). hasRole(\"ADMIN\") checks for the authority ROLE_ADMIN; hasAuthority(\"orders:write\") checks the exact string. Roles are coarse groups; authorities can be fine-grained permissions.\n\nURL rules cannot see the data. For rules like \"users may only read their own orders\", add @EnableMethodSecurity and use @PreAuthorize on service methods, for example @PreAuthorize(\"hasRole('ADMIN')\"), or simply query by owner: findByIdAndOwner(id, currentUser). Many APIs return 404 instead of 403 for other people's resources, so they do not reveal that the record exists.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Spring Security building blocks",
        root: "Spring Security",
        children: [
          { label: "Filter chain", children: ["FilterChainProxy", "SecurityFilterChain beans", "ExceptionTranslationFilter"] },
          { label: "Authentication", children: ["AuthenticationManager", "DaoAuthenticationProvider", "UserDetailsService"] },
          { label: "Passwords", children: ["PasswordEncoder", "BCryptPasswordEncoder", "DelegatingPasswordEncoder"] },
          { label: "Tokens", children: ["JwtEncoder", "JwtDecoder", "oauth2ResourceServer"] },
          { label: "Authorization", children: ["authorizeHttpRequests", "hasRole, hasAuthority", "@PreAuthorize"] },
        ],
      },
    ],
    examples: [
      {
        title: "A login endpoint that issues a 15-minute JWT",
        explanation: "Step 1: expose the AuthenticationManager as a bean and inject a JwtEncoder (for HS256, a NimbusJwtEncoder built from your secret key). Step 2: authenticate the username and password; a wrong password throws and becomes 401. Step 3: build claims with subject, expiry and roles. Step 4: sign and return the token. Clients then send Authorization: Bearer followed by the token, and the resource server config validates it on each call.",
        code: {
          lang: "java",
          code: "@PostMapping(\"/auth/login\")\nTokenResponse login(@RequestBody LoginRequest req) {\n  Authentication auth = authManager.authenticate(\n      UsernamePasswordAuthenticationToken.unauthenticated(req.username(), req.password()));\n  Instant now = Instant.now();\n  JwtClaimsSet claims = JwtClaimsSet.builder()\n      .issuer(\"bookings-api\").subject(auth.getName())\n      .issuedAt(now).expiresAt(now.plus(15, ChronoUnit.MINUTES))\n      .claim(\"roles\", auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())\n      .build();\n  JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();\n  return new TokenResponse(jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue());\n}",
        },
      },
      {
        title: "Users can only see their own bookings",
        explanation: "The URL rule /api/bookings/** requires login, but any logged-in user could still guess another booking id. Step 1: read the current user from the Authentication argument (Spring injects it into controller methods). Step 2: load the booking by id and owner in one query. Step 3: if nothing comes back, return 404, so the API does not reveal that the id exists. Admins get a separate endpoint protected with hasRole.",
        code: {
          lang: "java",
          code: "@GetMapping(\"/api/bookings/{id}\")\nBookingDto get(@PathVariable Long id, Authentication auth) {\n  return bookings.findByIdAndOwnerUsername(id, auth.getName())\n      .map(BookingDto::from)\n      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));\n}\n\n@PreAuthorize(\"hasRole('ADMIN')\")\n@GetMapping(\"/api/admin/bookings\")\nList<BookingDto> all() { return bookings.findAll().stream().map(BookingDto::from).toList(); }",
        },
      },
    ],
    cheatSheet: [
      "401 = not authenticated (who are you?); 403 = authenticated but not allowed",
      "hasRole(\"ADMIN\") checks the authority ROLE_ADMIN; hasAuthority checks the exact string",
      "URL rules match top to bottom: specific paths first, anyRequest() last",
      "BCryptPasswordEncoder default cost is 10; each +1 doubles the hashing time",
      "JWT payloads are only base64url encoded: anyone can read them",
      "HS256 secrets need at least 256 bits and belong in config or a vault, not code",
      "@EnableMethodSecurity turns on @PreAuthorize for service methods",
      "Stateless token APIs usually disable CSRF; cookie session apps must keep it",
    ],
    quiz: [
      {
        q: "Which component turns an AccessDeniedException into a 403 response?",
        options: ["DispatcherServlet", "UserDetailsService", "ExceptionTranslationFilter", "PasswordEncoder"],
        answer: 2,
        why: "ExceptionTranslationFilter catches security exceptions and calls the entry point (401) or access denied handler (403).",
      },
      {
        q: "Two users choose the same password. Why are their BCrypt hashes different?",
        options: ["Each hash includes a random salt", "The username is hashed in", "BCrypt adds the current time", "Spring encrypts one of them"],
        answer: 0,
        why: "A fresh random salt is generated per password and stored inside the hash string.",
      },
      {
        q: "A rule list has anyRequest().authenticated() first, then requestMatchers(\"/public/**\").permitAll(). What happens?",
        options: ["/public/** is still open", "Spring sorts the rules automatically", "Every request is denied", "Spring rejects the configuration at startup"],
        answer: 3,
        why: "Spring Security fails fast when a matcher is registered after anyRequest(), because it could never be reached.",
      },
      {
        q: "Why keep JWT access tokens short-lived?",
        options: ["Short tokens are smaller", "A stolen signed token stays valid until it expires and is hard to revoke", "Browsers reject long expiry times", "BCrypt requires it"],
        answer: 1,
        why: "Servers verify JWTs by signature alone, so a short expiry limits how long a leaked token works.",
      },
      {
        q: "What does UsernameNotFoundException become in the HTTP response by default?",
        options: ["404 Not Found", "500 Internal Server Error", "A generic bad credentials failure (401)", "403 Forbidden"],
        answer: 2,
        why: "Spring hides whether the username or the password was wrong, so attackers cannot list valid accounts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Hash the password secret123 with BCrypt cost 12, print the hash, and check that matches works for the right password and fails for a wrong one.",
        hint: "Create new BCryptPasswordEncoder(12) and call encode and matches.",
        solution: "var enc = new BCryptPasswordEncoder(12);\nString hash = enc.encode(\"secret123\");\nSystem.out.println(hash);                         // $2a$12$... 60 chars\nSystem.out.println(enc.matches(\"secret123\", hash)); // true\nSystem.out.println(enc.matches(\"Secret123\", hash)); // false",
      },
      {
        level: "medium",
        task: "Write a UserDetailsService that loads users from a JPA UserRepository with a role column such as ADMIN or USER.",
        hint: "Use User.withUsername(...).password(hash).roles(role).build(); roles() adds the ROLE_ prefix.",
        solution: "@Service\nclass DbUserDetailsService implements UserDetailsService {\n  private final UserRepository users;\n  DbUserDetailsService(UserRepository users) { this.users = users; }\n\n  @Override\n  public UserDetails loadUserByUsername(String username) {\n    AppUser u = users.findByUsername(username)\n        .orElseThrow(() -> new UsernameNotFoundException(username));\n    return User.withUsername(u.getUsername()).password(u.getPasswordHash()).roles(u.getRole()).build();\n  }\n}",
      },
      {
        level: "hard",
        task: "Your JWTs carry a roles claim like [\"ROLE_ADMIN\"]. Configure the resource server so hasRole(\"ADMIN\") works.",
        hint: "Use a JwtGrantedAuthoritiesConverter with a custom claim name and an empty prefix.",
        solution: "@Bean\nJwtAuthenticationConverter jwtAuthConverter() {\n  var roles = new JwtGrantedAuthoritiesConverter();\n  roles.setAuthoritiesClaimName(\"roles\");\n  roles.setAuthorityPrefix(\"\");          // claim already holds ROLE_ADMIN\n  var conv = new JwtAuthenticationConverter();\n  conv.setJwtGrantedAuthoritiesConverter(roles);\n  return conv;\n}\n// http.oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtAuthConverter())));",
      },
    ],
    faq: [
      { q: "Should I store the JWT in localStorage or a cookie?", a: "localStorage is readable by any script, so an XSS bug can steal the token. An HttpOnly, Secure, SameSite cookie hides it from scripts, but then you need CSRF protection. Many teams use short access tokens in memory plus a refresh token in an HttpOnly cookie." },
      { q: "Why does my new Spring Boot app ask for a password on every page?", a: "With spring-boot-starter-security on the classpath and no config of your own, Boot secures everything and prints a generated password for the user named user at startup. Define your own SecurityFilterChain bean to set real rules." },
      { q: "Do I need to write my own JWT filter?", a: "Usually not. The OAuth2 resource server starter validates bearer tokens for you; you only configure the decoder and how claims map to authorities." },
      { q: "What is the difference between a role and an authority?", a: "Both are GrantedAuthority strings. A role is just an authority with the ROLE_ prefix, and hasRole adds that prefix for you." },
    ],
  },

  "spring/spring-testing": {
    plain: [
      "Tests prove your code still works after every change. In a Spring app there are different kinds. A unit test checks one class alone, with no Spring at all, and runs in milliseconds. A slice test starts only one layer, such as the web layer. An integration test starts the whole app and calls it like a real client.",
      "A good test suite is shaped like a pyramid: many fast unit tests at the bottom, fewer slice tests in the middle, and a handful of full integration tests on top. Each layer catches different bugs. Wiring mistakes only show up when the whole app starts; logic bugs are cheaper to catch in unit tests.",
      "Databases are where tests often lie. An in-memory database like H2 speaks a slightly different SQL from PostgreSQL, so a query can pass in tests and fail in production. Testcontainers fixes this by starting a real PostgreSQL in Docker for the test run, then throwing it away afterwards.",
      "Security needs testing too. You want proof that a missing token gives 401, a normal user gets 403 on admin pages, and the right user gets 200. Spring Security's test support lets you pretend to be any user in one line.",
    ],
    deepDive: [
      {
        heading: "The context cache: why test suites get slow",
        body: "Starting a Spring application context takes seconds. To avoid paying that for every test class, Spring's TestContext framework caches contexts and reuses one whenever a later test class has exactly the same configuration. The cache key includes the annotations, active profiles, properties and the set of mocked beans.\n\nThat is why small differences cost a lot. One class with @MockitoBean PaymentClient and another with @MockitoBean EmailClient need two different contexts. @DirtiesContext throws a context away and forces a fresh start. In a big suite, build a few shared base classes or test configurations so most tests hit the same cached context. The cache holds up to 32 contexts by default (spring.test.context.cache.maxSize), and setting logging.level.org.springframework.test.context.cache=DEBUG prints hit and miss statistics.",
        bullets: [
          "Same configuration = cached context, started once per JVM",
          "Each distinct set of @MockitoBean fields creates a new context",
          "Avoid @DirtiesContext unless a test truly breaks shared state",
        ],
      },
      {
        heading: "What each slice loads, and what it leaves out",
        body: "@WebMvcTest loads controllers, @ControllerAdvice, Jackson, converters, filters and MockMvc. It does not load @Service or @Repository beans, so you replace them with @MockitoBean (the newer name for @MockBean, which is deprecated since Boot 3.4). Name the controller, as in @WebMvcTest(BookController.class), to keep the context small. Spring Security is applied too; if your rules live in a @Configuration class, add @Import(SecurityConfig.class) so the test uses your real rules instead of Boot's defaults.\n\n@DataJpaTest loads entities, repositories, the DataSource and Flyway or Liquibase. Each test runs in a transaction that is rolled back at the end, so tests do not see each other's data. By default it swaps your database for an embedded one; with Testcontainers add @AutoConfigureTestDatabase(replace = Replace.NONE). Because nothing is committed, call flush() (or saveAndFlush) when you want the database to actually check constraints inside the test.",
        visual: {
          type: "compare",
          title: "Which beans each test type creates",
          columns: [
            { title: "@WebMvcTest", points: ["Controllers and advice", "Jackson and validation", "Security filters", "No services or repositories"] },
            { title: "@DataJpaTest", points: ["Entities and repositories", "DataSource and migrations", "TestEntityManager", "No controllers or services"] },
            { title: "@SpringBootTest", points: ["Every bean in the app", "Real server on RANDOM_PORT", "All config and profiles", "Mocks only where you add them"] },
          ],
        },
      },
      {
        heading: "Testcontainers lifecycle and speed",
        body: "Testcontainers talks to your local Docker, pulls the image once, and starts a container on a random free port. A static field marked @Container starts once per test class and stops after it. A small helper container called Ryuk removes everything when the JVM exits, even after a crash.\n\nWith @ServiceConnection (Boot 3.1+), Boot reads the container's JDBC URL, user and password and configures the DataSource for you. The older way is @DynamicPropertySource, which you still need for settings @ServiceConnection does not cover. A PostgreSQL container usually starts in a few seconds. To share one container across all test classes, start it in a static block of a base class or define it as a @Bean in a @TestConfiguration; Spring's context cache then reuses it too. Pin the image tag, such as postgres:16-alpine, to the version production runs.",
        visual: {
          type: "sequence",
          title: "One test class with a Postgres container",
          actors: ["JUnit", "Testcontainers", "Docker", "Spring context"],
          messages: [
            { from: 0, to: 1, label: "Start static @Container" },
            { from: 1, to: 2, label: "Run postgres:16 on a random port" },
            { from: 2, to: 1, label: "Ready: database accepts connections" },
            { from: 1, to: 3, label: "@ServiceConnection: JDBC URL and login" },
            { from: 3, to: 3, label: "Flyway migrates, beans start" },
            { from: 0, to: 3, label: "Run each test method" },
            { from: 1, to: 2, label: "Stop container after the class" },
          ],
        },
      },
      {
        heading: "Testing secured endpoints",
        body: "Add spring-security-test to get two kinds of helpers. Annotations such as @WithMockUser(roles = \"ADMIN\") put a fake authenticated user into the SecurityContext for one test. Request post-processors attach credentials to a single MockMvc call: jwt() for an OAuth2 resource server, user(\"bob\").roles(\"USER\") for a simple user, and csrf() when CSRF protection is on and you send a POST.\n\nThe jwt() helper skips the real signature check, so it tests your rules, not the token parsing. Add at least one @SpringBootTest that sends a real signed token to prove the decoder settings work. For each protected endpoint, cover three cases: no credentials (401), wrong role (403) and right role (200). Those three tests catch most security regressions, such as a rule accidentally moved below a broader permitAll.",
        bullets: [
          "@WithMockUser defaults to username user with role USER",
          "with(jwt().authorities(new SimpleGrantedAuthority(\"ROLE_ADMIN\"))) fakes an admin token",
          "with(csrf()) is needed for POST in apps that keep CSRF on",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "The Spring test pyramid",
        layers: [
          { label: "Few: @SpringBootTest + Testcontainers", detail: "Whole app, real HTTP, real database" },
          { label: "Some: @WebMvcTest", detail: "Routing, validation, JSON, security rules" },
          { label: "Some: @DataJpaTest", detail: "Queries and mappings on real Postgres" },
          { label: "Many: plain JUnit unit tests", detail: "Business logic with no Spring context" },
        ],
      },
    ],
    examples: [
      {
        title: "Controller test: validation error returns 400",
        explanation: "You want proof that POST /api/books rejects a blank title without touching the database. Step 1: start only the web layer with @WebMvcTest(BookController.class). Step 2: replace the service with @MockitoBean. Step 3: send invalid JSON with a mock user and CSRF token. Step 4: expect 400 and verify the service was never called. This runs in well under a second once the context is cached.",
        code: {
          lang: "java",
          code: "@WebMvcTest(BookController.class)\nclass BookControllerTest {\n  @Autowired MockMvc mvc;\n  @MockitoBean BookService service;\n\n  @Test @WithMockUser\n  void rejectsBlankTitle() throws Exception {\n    mvc.perform(post(\"/api/books\").with(csrf())\n            .contentType(MediaType.APPLICATION_JSON)\n            .content(\"{\\\"title\\\":\\\"\\\",\\\"pages\\\":120}\"))\n       .andExpect(status().isBadRequest());\n    verifyNoInteractions(service);\n  }\n}",
        },
      },
      {
        title: "Repository test on real PostgreSQL",
        explanation: "A custom query uses ILIKE, which H2 handles differently from PostgreSQL. Step 1: annotate the class with @DataJpaTest and keep the real database with Replace.NONE. Step 2: start a Postgres container with @ServiceConnection. Step 3: Flyway creates the schema from your migrations. Step 4: save rows, run the query, check the result. The test transaction rolls back at the end, so the next test starts clean.",
        code: {
          lang: "java",
          code: "@DataJpaTest\n@AutoConfigureTestDatabase(replace = Replace.NONE)\n@Testcontainers\nclass BookRepositoryTest {\n  @Container @ServiceConnection\n  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>(\"postgres:16-alpine\");\n\n  @Autowired BookRepository books;\n\n  @Test\n  void searchIsCaseInsensitive() {\n    books.saveAndFlush(new Book(\"Clean Code\"));\n    assertThat(books.searchTitle(\"%clean%\")).hasSize(1);\n  }\n}",
        },
      },
    ],
    cheatSheet: [
      "@WebMvcTest(XController.class) + @MockitoBean for services: fast web-layer tests",
      "@DataJpaTest rolls back each test; flush() to make the database check constraints",
      "@AutoConfigureTestDatabase(replace = Replace.NONE) keeps your Testcontainers database",
      "@SpringBootTest(webEnvironment = RANDOM_PORT) starts a real server on a free port",
      "@ServiceConnection wires a container's URL and login into Spring (Boot 3.1+)",
      "@MockitoBean replaces the deprecated @MockBean (Spring Framework 6.2, Boot 3.4)",
      "Security tests: no token gives 401, wrong role 403, right role 200",
      "Different mocks or properties per class mean new contexts and a slower suite",
    ],
    quiz: [
      {
        q: "Which beans does @WebMvcTest NOT create?",
        options: ["@RestController beans", "@ControllerAdvice beans", "@Service beans", "The Jackson ObjectMapper"],
        answer: 2,
        why: "Web slices stop at the web layer, so services must be mocked with @MockitoBean.",
      },
      {
        q: "A @DataJpaTest saves an entity that breaks a unique constraint, yet the test passes. What is the likely reason?",
        options: ["The INSERT was never flushed before the rollback", "Unique constraints are disabled in tests", "Testcontainers ignores constraints", "@DataJpaTest uses MongoDB"],
        answer: 0,
        why: "Without a flush, Hibernate may hold the INSERT until commit, and the test rolls back instead.",
      },
      {
        q: "Your suite starts the Spring context 40 times. What is the most likely cause?",
        options: ["Too many @Test methods", "JUnit runs tests in parallel", "Docker is slow", "Test classes use different @MockitoBean sets or properties"],
        answer: 3,
        why: "Each unique configuration is a separate cache key, so the context cannot be reused.",
      },
      {
        q: "What does @ServiceConnection do on a Testcontainers field?",
        options: ["Starts the app inside Docker", "Configures Spring's connection details from the running container", "Opens an SSH tunnel to production", "Runs Flyway inside the container"],
        answer: 1,
        why: "Boot reads the container's host, port and credentials and builds the matching connection details bean.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a plain unit test (no Spring) for a PriceCalculator that gives 10% off orders over 100.",
        hint: "Create the class with new and use assertEquals with BigDecimal values.",
        solution: "class PriceCalculatorTest {\n  PriceCalculator calc = new PriceCalculator();\n\n  @Test void discountsLargeOrders() {\n    assertEquals(new BigDecimal(\"180.00\"), calc.total(new BigDecimal(\"200.00\")));\n  }\n  @Test void keepsSmallOrders() {\n    assertEquals(new BigDecimal(\"50.00\"), calc.total(new BigDecimal(\"50.00\")));\n  }\n}",
      },
      {
        level: "medium",
        task: "Write three MockMvc tests for GET /api/admin/stats: no user gives 401, a USER gives 403, an ADMIN gives 200.",
        hint: "Use @WebMvcTest, @Import your security config, and @WithMockUser(roles = ...).",
        solution: "@Test void anonymousIs401() throws Exception {\n  mvc.perform(get(\"/api/admin/stats\")).andExpect(status().isUnauthorized());\n}\n@Test @WithMockUser(roles = \"USER\") void userIs403() throws Exception {\n  mvc.perform(get(\"/api/admin/stats\")).andExpect(status().isForbidden());\n}\n@Test @WithMockUser(roles = \"ADMIN\") void adminIs200() throws Exception {\n  mvc.perform(get(\"/api/admin/stats\")).andExpect(status().isOk());\n}",
      },
      {
        level: "hard",
        task: "Share one PostgreSQL container across all integration test classes so it starts only once per run.",
        hint: "Define the container as a @Bean with @ServiceConnection in a @TestConfiguration and import it everywhere.",
        solution: "@TestConfiguration(proxyBeanMethods = false)\nclass TestcontainersConfig {\n  @Bean @ServiceConnection\n  PostgreSQLContainer<?> postgres() {\n    return new PostgreSQLContainer<>(\"postgres:16-alpine\");\n  }\n}\n\n@SpringBootTest @Import(TestcontainersConfig.class)\nclass OrderApiIT { /* tests */ }\n// Same config in every class = one cached context = one container.",
      },
    ],
    faq: [
      { q: "Is H2 good enough for tests?", a: "For quick demos, maybe. For real projects it hides differences in SQL, types and locking from PostgreSQL or MySQL, so use Testcontainers with the same engine and version as production." },
      { q: "Do I need Docker in CI to use Testcontainers?", a: "Yes, the CI runner needs a Docker-compatible engine. GitHub Actions Ubuntu runners have Docker installed, so it works out of the box." },
      { q: "What replaced @MockBean?", a: "@MockitoBean and @MockitoSpyBean from Spring Framework 6.2. @MockBean still works in Boot 3.4 and 3.5 but is deprecated for removal, so new code should use the Mockito versions." },
      { q: "Should integration tests clean the database between tests?", a: "Yes, or make each test create its own unique data. Shared leftover rows make tests pass or fail depending on order." },
    ],
  },

  "spring/openapi": {
    plain: [
      "When another team, a mobile developer or your future self wants to use your API, they need to know the URLs, the fields to send, and what comes back. OpenAPI is a standard file format, in JSON or YAML, that describes exactly that. Many tools understand it.",
      "Writing that file by hand is slow and it quickly goes out of date. springdoc-openapi reads your Spring controllers while the app runs and builds the file for you. Add one dependency, start the app, and the description is live at /v3/api-docs.",
      "Swagger UI turns that file into a web page. Every endpoint is listed with its parameters and example bodies, and a Try it out button sends a real request from the browser. It is often the fastest way for someone new to understand and test your API.",
      "You can add detail with annotations: a summary for each endpoint, a list of possible error codes, and descriptions or examples for fields. The better the description, the more useful it is for people and for tools that generate client code in other languages.",
    ],
    deepDive: [
      {
        heading: "Picking the right springdoc artifact and version",
        body: "springdoc ships separate starters. springdoc-openapi-starter-webmvc-ui is for normal Spring MVC apps and includes Swagger UI. springdoc-openapi-starter-webflux-ui is the reactive version. The -api variants (webmvc-api, webflux-api) generate only the spec, without the UI, which suits production builds where you do not want a docs page.\n\nVersions follow Spring Boot: springdoc 1.x was for Boot 2 and is no longer maintained, 2.x is for Boot 3, and 3.x targets Boot 4. Mixing the wrong major versions is the most common reason the docs page shows a white screen or the app fails to start. Do not also add the old springfox library; it is unmaintained and conflicts with springdoc.",
        bullets: [
          "Spec as JSON: /v3/api-docs; as YAML: /v3/api-docs.yaml",
          "UI: /swagger-ui.html redirects to /swagger-ui/index.html",
          "springdoc.swagger-ui.enabled=false turns off only the UI",
          "springdoc.api-docs.enabled=false turns off the spec too",
        ],
      },
      {
        heading: "What springdoc infers without any annotations",
        body: "springdoc inspects each handler method. From @GetMapping, @PostMapping and friends it builds paths and HTTP methods. @PathVariable and @RequestParam become parameters, with required set from the annotation. The @RequestBody type and the return type become schemas under components, built by reading the class fields through Jackson, so @JsonProperty names and @JsonIgnore are respected.\n\nBean Validation annotations are translated as well: @NotNull and @NotBlank mark a field required, @Size becomes minLength and maxLength, @Min and @Max become minimum and maximum, and @Pattern becomes a regex pattern. Java records work the same as classes. What it cannot infer is meaning: why an endpoint exists, which error codes it returns, and what a field like status really holds. That is where annotations help.",
        visual: {
          type: "flow",
          title: "How a controller method becomes spec entries",
          steps: [
            { label: "Mapping annotation", detail: "@PostMapping(\"/books\") gives path and method" },
            { label: "Parameters", detail: "@PathVariable and @RequestParam become parameters" },
            { label: "Request body", detail: "DTO fields become a schema in components" },
            { label: "Validation rules", detail: "@Size, @NotBlank become constraints" },
            { label: "Return type", detail: "Becomes the 200 response schema" },
          ],
        },
      },
      {
        heading: "Annotations that make the docs worth reading",
        body: "These come from the io.swagger.v3.oas.annotations package. @Tag(name = \"Books\") on a controller groups its endpoints. @Operation(summary = ..., description = ...) explains one endpoint. @ApiResponse(responseCode = \"404\", description = ...) documents each status code; add content = @Content(schema = @Schema(implementation = ProblemDetail.class)) to show the error body. @Parameter(description = ..., example = ...) explains a path or query parameter.\n\nOn DTOs, @Schema(description = ..., example = \"Clean Code\") adds help text and sample values, and accessMode = Schema.AccessMode.READ_ONLY marks fields like id that the server sets. @Hidden removes an endpoint or controller from the docs completely. Global information such as the title, version, contact and security schemes goes in a single OpenAPI bean rather than on every controller.",
        bullets: [
          "Document the error format once, for example RFC 9457 ProblemDetail",
          "Real examples beat long descriptions",
          "Use @Hidden for internal or admin-only endpoints",
        ],
      },
      {
        heading: "Code-first, design-first and the spec in CI",
        body: "Generating the spec from code is called code-first: the code is the source of truth and the docs can never drift. Design-first is the opposite: teams agree on an openapi.yaml before coding, often to let the frontend start early, then generate server interfaces from it with openapi-generator.\n\nEither way, treat the spec as an artifact. A useful CI step starts the app, downloads /v3/api-docs, and saves it, or uses the springdoc-openapi Maven or Gradle plugin to do that during the build. With the file checked in, a pull request shows every API change as a diff, and a tool such as openapi-diff can fail the build on breaking changes like a removed field. The same file can generate typed clients, for example a TypeScript client for the web app, so field renames show up as compile errors instead of runtime bugs.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Main parts of an OpenAPI 3 document",
        root: "openapi.json",
        children: [
          { label: "info", children: ["title", "version", "description"] },
          { label: "servers", children: ["Base URLs, such as https://api.example.com"] },
          { label: "paths", children: ["/books: get, post", "Parameters", "Responses by status code"] },
          { label: "components", children: ["schemas (DTOs)", "securitySchemes (bearer JWT)"] },
          { label: "security", children: ["Which scheme applies by default"] },
        ],
      },
      {
        type: "sequence",
        title: "Calling a secured endpoint from Swagger UI",
        actors: ["Developer", "Swagger UI", "Spring API"],
        messages: [
          { from: 1, to: 2, label: "GET /v3/api-docs" },
          { from: 2, to: 1, label: "Spec with bearer security scheme" },
          { from: 0, to: 1, label: "Authorize: paste JWT" },
          { from: 0, to: 1, label: "Try it out on GET /api/books/7" },
          { from: 1, to: 2, label: "GET /api/books/7 with Bearer token" },
          { from: 2, to: 1, label: "200 OK with JSON body" },
        ],
      },
    ],
    examples: [
      {
        title: "Documenting a create endpoint fully",
        explanation: "POST /api/books returns 201 on success, 400 on invalid input and 409 when the ISBN exists. Step 1: group the controller with @Tag. Step 2: write a one-line summary. Step 3: list each response code, pointing errors at ProblemDetail. Step 4: add examples on the DTO fields. Open Swagger UI: the endpoint now shows sample JSON, field rules from validation, and all three outcomes.",
        code: {
          lang: "java",
          code: "@Tag(name = \"Books\")\n@RestController @RequestMapping(\"/api/books\")\nclass BookController {\n  @Operation(summary = \"Add a book to the catalogue\")\n  @ApiResponse(responseCode = \"201\", description = \"Book created\")\n  @ApiResponse(responseCode = \"400\", description = \"Invalid input\",\n      content = @Content(schema = @Schema(implementation = ProblemDetail.class)))\n  @ApiResponse(responseCode = \"409\", description = \"ISBN already exists\")\n  @PostMapping @ResponseStatus(HttpStatus.CREATED)\n  BookDto create(@Valid @RequestBody CreateBook body) { return service.create(body); }\n}\n\nrecord CreateBook(@Schema(example = \"Clean Code\") @NotBlank String title,\n                  @Schema(example = \"9780132350884\") @Size(min = 13, max = 13) String isbn) {}",
        },
      },
      {
        title: "Adding a JWT Authorize button",
        explanation: "Your API uses bearer tokens, but Swagger UI calls fail with 401. Step 1: declare a bearer security scheme in an OpenAPI bean. Step 2: apply it globally with a security requirement. Step 3: allow the docs paths through Spring Security. Now Swagger UI shows an Authorize button; paste a token once and every Try it out request sends it.",
        code: {
          lang: "java",
          code: "@Bean\nOpenAPI api() {\n  return new OpenAPI()\n      .info(new Info().title(\"Bookings API\").version(\"v1\"))\n      .components(new Components().addSecuritySchemes(\"bearer\",\n          new SecurityScheme().type(SecurityScheme.Type.HTTP)\n              .scheme(\"bearer\").bearerFormat(\"JWT\")))\n      .addSecurityItem(new SecurityRequirement().addList(\"bearer\"));\n}\n\n// In the SecurityFilterChain:\n// .requestMatchers(\"/v3/api-docs/**\", \"/swagger-ui/**\", \"/swagger-ui.html\").permitAll()",
        },
      },
    ],
    cheatSheet: [
      "Dependency for MVC apps: org.springdoc:springdoc-openapi-starter-webmvc-ui",
      "springdoc 2.x is for Spring Boot 3; 3.x for Boot 4; 1.x for Boot 2 (end of life)",
      "Spec: /v3/api-docs and /v3/api-docs.yaml; UI: /swagger-ui.html",
      "@Tag groups endpoints, @Operation describes one, @ApiResponse lists status codes",
      "@Schema(example = ...) on DTO fields gives realistic sample bodies",
      "@Hidden removes an endpoint from the generated docs",
      "springdoc.swagger-ui.enabled=false hides the UI in production",
      "Permit /v3/api-docs/** and /swagger-ui/** in Spring Security when docs are public",
    ],
    quiz: [
      {
        q: "Which dependency adds both the OpenAPI spec and Swagger UI to a Spring Boot 3 MVC app?",
        options: ["springfox-boot-starter", "springdoc-openapi-starter-webmvc-ui", "springdoc-openapi-starter-webflux-api", "swagger-codegen-cli"],
        answer: 1,
        why: "The webmvc-ui starter is the springdoc artifact for servlet apps that includes the UI.",
      },
      {
        q: "A DTO field has @Size(max = 50). How does it appear in the generated schema?",
        options: ["It is ignored", "As a description text", "As a required flag", "As maxLength: 50"],
        answer: 3,
        why: "springdoc translates Bean Validation annotations into matching OpenAPI constraints.",
      },
      {
        q: "Which annotation removes an internal endpoint from the docs?",
        options: ["@Hidden", "@Deprecated", "@Tag(name = \"internal\")", "@Operation(summary = \"\")"],
        answer: 0,
        why: "@Hidden tells springdoc to skip the method or controller entirely.",
      },
      {
        q: "Why save the generated spec in the repository and diff it in CI?",
        options: ["Swagger UI needs the file to start", "It makes the app start faster", "API changes, including breaking ones, become visible in every pull request", "springdoc cannot work without it"],
        answer: 2,
        why: "A checked-in spec turns API changes into reviewable diffs and lets tools flag breaking changes.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add springdoc to a Spring Boot 3 Maven project and open Swagger UI.",
        hint: "One dependency; then visit /swagger-ui.html on port 8080.",
        solution: "<dependency>\n  <groupId>org.springdoc</groupId>\n  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>\n  <version><!-- latest 2.x release --></version>\n</dependency>\n\n./mvnw spring-boot:run\n# open http://localhost:8080/swagger-ui.html\n# raw spec: curl localhost:8080/v3/api-docs",
      },
      {
        level: "medium",
        task: "Document GET /api/books/{id} with a parameter description and a 404 response, and give the id an example value.",
        hint: "Use @Operation, @Parameter on the path variable, and @ApiResponse for 404.",
        solution: "@Operation(summary = \"Get one book\")\n@ApiResponse(responseCode = \"200\", description = \"Found\")\n@ApiResponse(responseCode = \"404\", description = \"No book with this id\")\n@GetMapping(\"/{id}\")\nBookDto get(@Parameter(description = \"Book id\", example = \"42\")\n            @PathVariable Long id) {\n  return service.find(id);\n}",
      },
      {
        level: "hard",
        task: "Serve docs in dev and staging, but expose neither the spec nor the UI in production.",
        hint: "Use a profile-specific properties file to turn springdoc off.",
        solution: "# application-prod.properties\nspringdoc.api-docs.enabled=false\nspringdoc.swagger-ui.enabled=false\n\n# start production with the prod profile\njava -jar app.jar --spring.profiles.active=prod\n\n# check\ncurl -i localhost:8080/v3/api-docs   # 404 (or 401 if security blocks it first)",
      },
    ],
    faq: [
      { q: "What is the difference between Swagger and OpenAPI?", a: "OpenAPI is the name of the specification since version 3. Swagger is the older name and now refers to tools around it, like Swagger UI and Swagger Editor." },
      { q: "Why does Swagger UI show a blank page or 404?", a: "Usually a springdoc version that does not match your Spring Boot version, or Spring Security blocking /swagger-ui/** and /v3/api-docs/**. Check both first." },
      { q: "Can I generate a client from my spec?", a: "Yes. openapi-generator can produce clients for TypeScript, Java, Python, Go and many more languages from the /v3/api-docs file." },
      { q: "Should production APIs expose Swagger UI?", a: "Public APIs often do, as developer docs. Private or internal APIs should disable it or put it behind authentication." },
    ],
  },
};

export default extra;
