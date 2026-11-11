import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "build-test/maven-gradle": {
    plain: [
      "A real Java project uses dozens of libraries: a web framework, a JSON library, a database driver, test tools. Downloading each jar by hand and keeping versions straight would be a nightmare. A build tool does it for you.",
      "You list what you need in a project file, pom.xml for Maven or build.gradle.kts for Gradle. The tool downloads those libraries, plus the libraries they need, compiles your code, runs your tests and packages everything into a jar you can run or deploy.",
      "Both tools expect the same folder layout: your code in src/main/java, config files in src/main/resources and tests in src/test/java. Because every project looks the same, a new developer can find their way around in minutes.",
      "The real benefit is repeatability. The same command gives the same result on your laptop, your colleague's laptop and the CI server. That is why every team commits the build file and the wrapper script (mvnw or gradlew) to Git.",
    ],
    deepDive: [
      {
        heading: "Where dependencies come from",
        body: "A library is identified by its coordinates: groupId, artifactId and version, for example org.postgresql:postgresql:42.7.4. When you build, the tool first looks in a local cache. Maven uses ~/.m2/repository and Gradle uses ~/.gradle/caches. If the jar is missing, it is downloaded from a remote repository, by default Maven Central, and cached for next time.\n\nEach library also has its own list of dependencies, called transitive dependencies, and the tool pulls those in too. That is how one Spring Boot starter brings in dozens of jars. Versions ending in -SNAPSHOT mean work in progress and may change; release versions never change once published. Companies often run their own repository, such as Nexus or Artifactory, as a proxy and a place to publish internal libraries.",
        visual: {
          type: "flow",
          title: "How a dependency reaches your classpath",
          steps: [
            { label: "Declared in build file", detail: "groupId, artifactId, version" },
            { label: "Check local cache", detail: "~/.m2 or ~/.gradle/caches" },
            { label: "Download if missing", detail: "From Maven Central or a company mirror" },
            { label: "Resolve transitive deps", detail: "Read its pom, repeat for each dependency" },
            { label: "Settle conflicts", detail: "Pick one version per library" },
            { label: "Build the classpath", detail: "Used to compile, test and run" },
          ],
        },
      },
      {
        heading: "Scopes and configurations",
        body: "Not every library is needed everywhere. Maven uses scopes and Gradle uses configurations to say where a jar belongs. Maven's compile scope (the default) means needed to compile and run. provided means needed to compile, but the runtime supplies it, such as a servlet API inside an app server. runtime means only needed when running, like a JDBC driver. test means only for compiling and running tests.\n\nGradle's names are clearer once you learn them. implementation is for your own code; api (with the java-library plugin) also exposes the library to modules that depend on yours. compileOnly, runtimeOnly, testImplementation and testRuntimeOnly match the other cases. Getting scopes right keeps test tools out of production jars and keeps compile times short.",
        visual: {
          type: "tree",
          title: "Where is the library needed?",
          root: "Dependency",
          children: [
            { label: "Compile and run", children: ["Maven: compile (default)", "Gradle: implementation or api"] },
            { label: "Compile only", children: ["Maven: provided", "Gradle: compileOnly"] },
            { label: "Run only", children: ["Maven: runtime", "Gradle: runtimeOnly"] },
            { label: "Tests only", children: ["Maven: test", "Gradle: testImplementation"] },
          ],
        },
      },
      {
        heading: "Version conflicts and BOMs",
        body: "Two of your libraries may need different versions of the same jar. Only one can be on the classpath. Maven chooses by nearest definition: the version closest to your project in the dependency tree wins, and on a tie the one declared first. Gradle by default picks the highest requested version. Either way, the winner may not be what one library expects, and you get errors like NoSuchMethodError at run time.\n\nTo see what really happened, run mvn dependency:tree or ./gradlew dependencies, and for one library ./gradlew dependencyInsight --dependency jackson-databind. To fix versions centrally, use a BOM (bill of materials): a pom that only lists tested versions. Spring Boot's BOM is why you can write Spring dependencies without versions. In Maven you put pins in the dependencyManagement section; in Gradle you use platform(...).",
        bullets: ["mvn dependency:tree -Dincludes=com.fasterxml.jackson.core", "Maven: nearest wins. Gradle: highest wins", "NoSuchMethodError at run time often means a version conflict"],
      },
      {
        heading: "Maven phases, goals and plugins",
        body: "A phase is a step in the lifecycle, like compile or package. A goal is a concrete task provided by a plugin, like compiler:compile or surefire:test. Maven binds goals to phases, so mvn package runs every bound goal from validate up to package. You can also run a goal directly, for example mvn dependency:tree, without running the lifecycle.\n\nThe Surefire plugin runs unit tests in the test phase. The Failsafe plugin runs integration tests (classes ending in IT) in integration-test and verify, so mvn verify runs both. Useful flags: -DskipTests skips running tests, -pl api -am builds only the api module and what it needs, -U forces a re-check of snapshots, -o works offline, and -T 1C builds modules in parallel with one thread per core.",
        bullets: ["mvn clean verify is the usual CI command", "mvn -q quiet output, mvn -X debug output", "Spring Boot: ./mvnw spring-boot:run"],
      },
      {
        heading: "How Gradle thinks: tasks and caching",
        body: "Gradle builds a graph of tasks such as compileJava, test and jar, and runs only the ones needed for what you asked. ./gradlew build runs assemble and check, which includes compiling and testing. Each task declares inputs and outputs. If nothing changed since the last run, the task is UP-TO-DATE and skipped, which makes repeat builds fast. The build cache can even reuse outputs from other machines or branches.\n\nA multi-project build has a settings.gradle.kts that lists modules with include(...), and modules depend on each other with implementation(project(\":domain\")). Maven does the same with a parent pom whose packaging is pom and a modules section. Splitting by layer or feature keeps boundaries clear: the domain module cannot accidentally use web classes if it does not depend on them.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Standard Maven and Gradle project layout",
        root: "my-app/",
        children: [
          { label: "pom.xml or build.gradle.kts", children: ["Coordinates, dependencies, plugins"] },
          { label: "mvnw or gradlew", children: ["Wrapper scripts, committed to Git"] },
          { label: "src/main", children: ["java: application code", "resources: config, SQL, templates"] },
          { label: "src/test", children: ["java: tests", "resources: test-only config"] },
          { label: "target/ or build/", children: ["Compiled output and jars", "Never commit it"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing a NoSuchMethodError caused by a version conflict",
        explanation: "The app compiles but crashes at start with NoSuchMethodError inside Jackson. Step 1: run mvn dependency:tree -Dincludes=com.fasterxml.jackson.core and see two versions requested; an old SDK pulls in 2.12 and it wins as the nearest. Step 2: the code was compiled against a newer API that 2.12 lacks. Step 3: pin one version for the whole build with Jackson's BOM in dependencyManagement. Step 4: run the tree again; every Jackson module now shows the same version.",
        code: {
          lang: "xml",
          code: `<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson</groupId>
      <artifactId>jackson-bom</artifactId>
      <version>2.18.2</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
<!-- mvn dependency:tree -Dincludes=com.fasterxml.jackson.core -->`,
        },
      },
      {
        title: "A two-module Gradle build",
        explanation: "You split a shop into domain (pure business logic) and api (web layer). Step 1: list both modules in settings.gradle.kts. Step 2: domain uses the java-library plugin because other modules consume it. Step 3: api depends on domain with implementation(project(...)). Step 4: JUnit versions come from its BOM via platform(...), and the launcher is added for the test runtime. Now ./gradlew :api:test builds domain first, then tests api, and domain can never import web classes.",
        code: {
          lang: "kotlin",
          code: `// settings.gradle.kts
rootProject.name = "shop"
include("domain", "api")
// domain/build.gradle.kts
plugins { id("java-library") }

// api/build.gradle.kts
plugins { java }
repositories { mavenCentral() }
dependencies {
    implementation(project(":domain"))
    testImplementation(platform("org.junit:junit-bom:5.11.4"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}`,
        },
      },
    ],
    cheatSheet: [
      "./mvnw clean verify runs unit tests (Surefire) and integration tests (Failsafe)",
      "./gradlew build runs compile, tests and checks; ./gradlew test runs tests only",
      "mvn dependency:tree and ./gradlew dependencies show where each jar comes from",
      "Maven picks the nearest version in the tree; Gradle picks the highest",
      "mvn -pl api -am package builds one module plus the modules it needs",
      "Use a BOM (dependencyManagement or platform()) to pin related versions together",
      "Local caches: ~/.m2/repository (Maven) and ~/.gradle/caches (Gradle)",
      "Commit mvnw or gradlew and its wrapper folder; never commit target/ or build/",
    ],
    quiz: [
      {
        q: "A JDBC driver is only needed when the app runs, not to compile it. Which Maven scope fits?",
        options: ["compile", "provided", "runtime", "test"],
        answer: 2,
        why: "runtime puts the jar on the run and test classpaths but not on the compile classpath.",
      },
      {
        q: "Two libraries pull in different versions of the same jar. How does Maven choose by default?",
        options: ["The version nearest to your project in the tree", "Always the highest version", "Always the lowest version", "It fails the build"],
        answer: 0,
        why: "Maven uses nearest definition; Gradle uses the highest version by default.",
      },
      {
        q: "In Gradle, what is the difference between api and implementation?",
        options: ["api is for tests only", "implementation is faster to download", "There is no difference", "api also exposes the library to modules that depend on yours"],
        answer: 3,
        why: "api leaks the dependency onto consumers' compile classpath; implementation keeps it internal.",
      },
      {
        q: "Which plugin runs integration tests named *IT in Maven's verify phase?",
        options: ["Surefire", "Failsafe", "Compiler", "Shade"],
        answer: 1,
        why: "Failsafe runs integration tests in integration-test and checks results in verify.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Generate a new Maven project from the quickstart archetype, package it and run the generated App class.",
        hint: "Use mvn archetype:generate in batch mode, then java -cp with the jar in target/.",
        solution: "mvn archetype:generate -DgroupId=com.example -DartifactId=demo \\\n  -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false\ncd demo\nmvn package\njava -cp target/demo-1.0-SNAPSHOT.jar com.example.App   # Hello World!",
      },
      {
        level: "medium",
        task: "In a Spring Boot project, find out which version of jackson-databind is used and which dependency brought it in.",
        hint: "Filter the dependency tree to one artifact.",
        solution: "# Maven\n./mvnw dependency:tree -Dincludes=com.fasterxml.jackson.core:jackson-databind\n\n# Gradle\n./gradlew dependencyInsight --dependency jackson-databind --configuration runtimeClasspath\n\n# Both print the chosen version and the path from your project to it,\n# for example via spring-boot-starter-web -> spring-boot-starter-json.",
      },
      {
        level: "hard",
        task: "Turn a single Maven project into a parent with two modules, core and web, where web depends on core.",
        hint: "The parent uses packaging pom and lists modules; web declares core as a normal dependency with the project version.",
        solution: "<!-- parent pom.xml -->\n<groupId>com.example</groupId><artifactId>shop</artifactId>\n<version>1.0.0</version><packaging>pom</packaging>\n<modules><module>core</module><module>web</module></modules>\n\n<!-- web/pom.xml (core/pom.xml is the same without the dependency) -->\n<parent><groupId>com.example</groupId><artifactId>shop</artifactId><version>1.0.0</version></parent>\n<artifactId>web</artifactId>\n<dependencies><dependency>\n  <groupId>com.example</groupId><artifactId>core</artifactId><version>${project.version}</version>\n</dependency></dependencies>",
      },
    ],
    faq: [
      { q: "Should I choose Maven or Gradle for a new project?", a: "Both are fine and both are supported by Spring Initializr. Maven is simpler and more uniform; Gradle is faster on big builds and more flexible. Follow what your team already uses." },
      { q: "What does SNAPSHOT mean in a version?", a: "It marks a work-in-progress build that can be replaced by a newer one with the same version. Release versions like 1.4.0 never change once published." },
      { q: "Why is my first build so slow?", a: "The tool is downloading every dependency and plugin into its local cache. Later builds reuse the cache and are much faster." },
      { q: "What is the Maven wrapper (mvnw)?", a: "A small script plus a properties file that downloads and runs a pinned Maven version, so nobody needs Maven installed and everyone uses the same version." },
    ],
  },

  "build-test/junit": {
    plain: [
      "A unit test is a small program that checks one piece of your code. It sets up some data, calls a method and checks that the result is what you expected. If it is not, the test fails and tells you exactly what went wrong.",
      "JUnit is the standard tool for this in Java. You write a test class, mark methods with @Test, and use assertions such as assertEquals(5, calc.add(2, 3)). Your IDE, Maven and Gradle can all run every test with one click or command.",
      "Good tests are fast and independent. A whole suite of hundreds of unit tests should run in seconds, and each test must pass or fail on its own, no matter which tests ran before it. Then you can run them after every change.",
      "Tests are also documentation. A test named rejectsPasswordsShorterThanEightCharacters tells the next developer what the code is supposed to do. When they change something by mistake, a red test warns them before users do.",
    ],
    deepDive: [
      {
        heading: "How JUnit 5 is built",
        body: "JUnit 5 has three parts. The JUnit Platform is the foundation that IDEs and build tools talk to; it discovers and launches tests. JUnit Jupiter is the programming model you write against: @Test, assertions, extensions. JUnit Vintage is an optional engine that runs old JUnit 3 and 4 tests on the same platform, which helps during migration.\n\nThe single dependency org.junit.jupiter:junit-jupiter brings the API, parameterized tests and the engine. Maven's Surefire plugin finds test classes whose names match Test*, *Test, *Tests or *TestCase; a class called CalculatorCheck is silently ignored. Gradle needs tasks.test { useJUnitPlatform() }. Spring Boot's spring-boot-starter-test already includes JUnit Jupiter, AssertJ and Mockito.",
        visual: {
          type: "layers",
          title: "Who runs your tests",
          layers: [
            { label: "IDE, Maven Surefire, Gradle", detail: "Ask the platform to run tests" },
            { label: "JUnit Platform", detail: "Discovers tests and reports results" },
            { label: "Test engines", detail: "Jupiter for JUnit 5 tests, Vintage for old ones" },
            { label: "Your test classes", detail: "@Test methods with assertions" },
          ],
        },
      },
      {
        heading: "Assertions that give good failure messages",
        body: "assertEquals takes the expected value first and the actual value second; swapping them gives confusing messages like expected 7 but was 5 when the opposite is true. For doubles, pass a tolerance: assertEquals(0.3, result, 1e-9). assertThrows(IllegalArgumentException.class, () -> parse(\"x\")) returns the exception, so you can also check its message.\n\nassertAll runs several checks and reports every failure together instead of stopping at the first, which is useful for checking several fields of one result. Every assertion accepts an optional last argument with a message. Many teams prefer AssertJ, which reads like a sentence: assertThat(list).hasSize(3).contains(\"a\"). It produces very clear failure output and is already included in Spring Boot's test starter.",
        bullets: ["assertEquals(expected, actual)", "assertTrue(cond, \"message\")", "assertThrows returns the exception", "assertAll(() -> ..., () -> ...)", "assertTimeout(Duration.ofSeconds(1), () -> ...)"],
      },
      {
        heading: "Parameterized tests and their sources",
        body: "A @ParameterizedTest runs once per set of arguments, and each run appears as its own result. @ValueSource gives single values: ints, strings and so on. @CsvSource gives rows of several values, and you can use a text block for readability. @EnumSource runs for each constant of an enum. @NullAndEmptySource adds null and an empty string, which are classic edge cases. @MethodSource points to a static method that returns a Stream of Arguments, for objects that cannot be written as text.\n\nGive runs readable names with name = \"{index}: {0} + {1} = {2}\". Parameterized tests are ideal for boundary values: if a discount starts at 100, test 99, 100 and 101 rather than random numbers.",
        bullets: ["@ValueSource(strings = {\"\", \" \"})", "@CsvSource({\"2, 3, 5\", \"-1, 1, 0\"})", "@MethodSource(\"cases\") with static Stream<Arguments> cases()"],
      },
      {
        heading: "Naming and organising tests",
        body: "A good test name says what behaviour is expected, in which situation. Patterns like withdraw_failsWhenBalanceTooLow or plain sentences with @DisplayName(\"fails when the balance is too low\") both work; pick one and stay consistent. Inside each test, keep three visible parts: arrange (build inputs), act (call the method once), assert (check the result). Test one behaviour per test so a failure points at one cause.\n\n@Nested inner classes group tests by situation, such as WhenEmpty and WhenFull, and the report shows them as a tree. @Tag(\"slow\") lets you include or exclude groups in the build. @Disabled(\"reason\") skips a test but should be temporary. Tests should not depend on run order; JUnit uses a fixed but deliberately non-obvious order.",
        visual: {
          type: "tree",
          title: "A test class organised with @Nested",
          root: "ShoppingCartTest",
          children: [
            { label: "@Nested WhenEmpty", children: ["totalIsZero", "checkoutIsRejected"] },
            { label: "@Nested WithOneItem", children: ["totalEqualsItemPrice", "removingItemEmptiesCart"] },
            { label: "@Nested WithDiscountCode", children: ["appliesTenPercent", "rejectsExpiredCode"] },
          ],
        },
      },
      {
        heading: "Lifecycle, temp folders and extensions",
        body: "By default JUnit creates a new instance of the test class for every test method. That is why fields set in one test never leak into the next, and why @BeforeAll methods must be static. If you annotate the class with @TestInstance(Lifecycle.PER_CLASS), one instance is shared and @BeforeAll can be non-static; then you must reset state yourself.\n\nJUnit has useful built-in helpers. A parameter or field annotated with @TempDir gets a fresh temporary directory that is deleted afterwards, perfect for file code. TestInfo gives the current test's name. Extensions plug in extra behaviour through @ExtendWith: MockitoExtension creates mocks, and Spring's SpringExtension starts an application context. Most framework test support you will use is built as a JUnit extension.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Red, green, refactor",
        steps: [
          { label: "Red", detail: "Write a small test for new behaviour; it fails" },
          { label: "Green", detail: "Write the simplest code that makes it pass" },
          { label: "Refactor", detail: "Clean up code and tests while staying green" },
          { label: "Repeat", detail: "Next small behaviour" },
        ],
      },
    ],
    examples: [
      {
        title: "Testing rules and error messages of a validator",
        explanation: "A PasswordPolicy rejects passwords that are too short or have no digit. Step 1: a happy-path test proves a good password passes. Step 2: assertThrows checks the exception type and returns it, so step 3 can assert the message users will see. Step 4: assertAll checks two independent rules and reports both if both fail. Each test name states the rule it protects.",
        code: {
          lang: "java",
          code: `class PasswordPolicyTest {
  private final PasswordPolicy policy = new PasswordPolicy(8);

  @Test
  void acceptsLongPasswordWithDigit() {
    assertDoesNotThrow(() -> policy.check("s3cretPass"));
  }

  @Test
  void rejectsShortPasswordWithClearMessage() {
    var ex = assertThrows(IllegalArgumentException.class, () -> policy.check("ab1"));
    assertEquals("password must have at least 8 characters", ex.getMessage());
  }
}`,
        },
      },
      {
        title: "Boundary values with @MethodSource",
        explanation: "Shipping is free from an order total of 50.00. Bugs hide at the edges, so step 1: list cases just below, exactly at and above the boundary, plus zero. Step 2: return them from a static method as a Stream of Arguments. Step 3: the parameterized test runs once per row with a readable name. If someone changes >= to >, the 50.00 row fails immediately.",
        code: {
          lang: "java",
          code: `static Stream<Arguments> totals() {
  return Stream.of(
      Arguments.of(new BigDecimal("0.00"), false),
      Arguments.of(new BigDecimal("49.99"), false),
      Arguments.of(new BigDecimal("50.00"), true),
      Arguments.of(new BigDecimal("50.01"), true));
}

@ParameterizedTest(name = "total {0} -> free shipping: {1}")
@MethodSource("totals")
void freeShippingFromFifty(BigDecimal total, boolean expected) {
  assertEquals(expected, Shipping.isFree(total));
}`,
        },
      },
    ],
    cheatSheet: [
      "assertEquals(expected, actual): expected always comes first",
      "assertThrows returns the exception so you can check its message",
      "assertAll reports every failing check, not just the first",
      "./mvnw test -Dtest=CartTest#addsItem runs a single test method",
      "./gradlew test --tests 'CartTest.addsItem' runs one test in Gradle",
      "Surefire only picks up classes named *Test, Test*, *Tests or *TestCase",
      "@TempDir Path dir gives a fresh folder that is deleted afterwards",
      "A new test class instance is created for every test method by default",
    ],
    quiz: [
      {
        q: "Why does JUnit create a new instance of the test class for each test by default?",
        options: ["To run tests in parallel", "So state in fields cannot leak between tests", "Because static methods are not allowed", "To make tests run in alphabetical order"],
        answer: 1,
        why: "A fresh instance per test keeps tests independent of each other.",
      },
      {
        q: "Which source gives several arguments per run as comma-separated rows?",
        options: ["@ValueSource", "@EnumSource", "@NullSource", "@CsvSource"],
        answer: 3,
        why: "@CsvSource rows are split into one argument per column.",
      },
      {
        q: "You named a test class OrderChecks and Maven reports 0 tests run. Why?",
        options: ["Surefire's default patterns do not match that name", "It needs @RunWith", "Test classes must be public", "@Test is only for JUnit 4"],
        answer: 0,
        why: "Surefire includes classes named Test*, *Test, *Tests or *TestCase by default.",
      },
      {
        q: "What is the main advantage of assertAll?",
        options: ["It runs faster", "It retries flaky assertions", "It reports all failed checks together instead of stopping at the first", "It replaces @BeforeEach"],
        answer: 2,
        why: "assertAll executes every grouped assertion and reports all failures at once.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write tests for a method boolean isLeapYear(int year). Cover 2024, 2023, 1900 and 2000.",
        hint: "Divisible by 4, except centuries, unless divisible by 400.",
        solution: "class LeapYearTest {\n  @Test void divisibleByFourIsLeap()      { assertTrue(Years.isLeapYear(2024)); }\n  @Test void ordinaryYearIsNotLeap()     { assertFalse(Years.isLeapYear(2023)); }\n  @Test void centuryIsNotLeap()          { assertFalse(Years.isLeapYear(1900)); }\n  @Test void every400YearsIsLeap()       { assertTrue(Years.isLeapYear(2000)); }\n}",
      },
      {
        level: "medium",
        task: "Write one parameterized test for String slugify(String title), for example \"Hello World\" to \"hello-world\" and \"  Java 21!  \" to \"java-21\".",
        hint: "Use @CsvSource with quotes around values that contain spaces.",
        solution: "@ParameterizedTest(name = \"{0} -> {1}\")\n@CsvSource({\n    \"'Hello World', hello-world\",\n    \"'  Java 21!  ', java-21\",\n    \"'Already-a-slug', already-a-slug\"\n})\nvoid makesSlugs(String title, String expected) {\n  assertEquals(expected, Slugs.slugify(title));\n}",
      },
      {
        level: "hard",
        task: "Test a class NotesStore that saves notes to files in a given folder: saving then loading returns the same text, and loading a missing note throws NoSuchFileException.",
        hint: "Use @TempDir so each test gets a clean folder.",
        solution: "class NotesStoreTest {\n  @TempDir Path dir;\n  @Test void savedNoteCanBeLoaded() throws IOException {\n    var store = new NotesStore(dir);\n    store.save(\"todo\", \"buy milk\");\n    assertEquals(\"buy milk\", store.load(\"todo\"));\n  }\n\n  @Test void missingNoteThrows() {\n    assertThrows(NoSuchFileException.class, () -> new NotesStore(dir).load(\"nope\"));\n  }\n}",
      },
    ],
    faq: [
      { q: "What changed from JUnit 4 to JUnit 5?", a: "Annotations moved to org.junit.jupiter.api, @Before and @After became @BeforeEach and @AfterEach, rules were replaced by extensions, and test classes and methods no longer need to be public. JUnit 6, released in 2025, keeps the same Jupiter API and requires Java 17." },
      { q: "Should I use JUnit assertions or AssertJ?", a: "Both work. AssertJ's fluent assertThat style gives richer checks for collections, strings and exceptions and clearer messages, and it is included in the Spring Boot test starter." },
      { q: "How do I measure test coverage?", a: "Add the JaCoCo plugin to Maven or Gradle; it produces an HTML report of which lines and branches your tests ran. Use it to find untested logic, not as a number to chase." },
      { q: "How many unit tests should one method have?", a: "One per behaviour: the normal case, each edge case, and each error case. A parameterized test can cover many input values for the same behaviour." },
    ],
  },

  "build-test/mockito": {
    plain: [
      "Most classes depend on other classes. An OrderService might use a repository, a payment client and an email sender. To unit test OrderService alone, you do not want a real database, a real bank and real emails. You want stand-ins you control.",
      "Mockito creates those stand-ins, called mocks. A mock looks like the real class but does nothing on its own. You tell it what to return for specific calls, which is called stubbing, and afterwards you can ask it what calls it received, which is called verifying.",
      "This lets you test tricky situations easily. What if the payment fails? Make the payment mock throw an exception. What if the user is missing? Make the repository mock return an empty Optional. No setup of real systems is needed.",
      "Mocks are a tool, not a goal. Mock the things at the edge of your class, like other services and outside systems. Do not mock simple data objects, and do not mock so much that the test only proves that mocks call mocks.",
    ],
    deepDive: [
      {
        heading: "What a mock really is",
        body: "Mockito generates a class at run time, using the ByteBuddy library, that extends or instruments your type. Every method on it is intercepted. Since Mockito 5 the inline mock maker is the default, so final classes and final methods can be mocked too. Static methods can be mocked with mockStatic inside a try-with-resources block, but needing it is usually a design smell.\n\nAn unstubbed method does not throw; it returns a harmless default. Numbers give 0, booleans false, objects null, and common container types give empty values: an empty List, Set, Map, Optional or Stream. That is convenient, but it also means a forgotten stub can make code quietly take the wrong path, so read failures carefully.",
        bullets: ["Unstubbed: 0, false, null, empty collection, Optional.empty()", "Mockito 5 needs Java 11 or later", "On Java 21+, configure Mockito as a -javaagent to avoid dynamic agent warnings"],
      },
      {
        heading: "Stubbing and argument matchers",
        body: "when(repo.findById(1L)).thenReturn(Optional.of(user)) stubs one exact call. thenThrow makes a call fail, thenAnswer computes a reply from the arguments, and chaining thenReturn(a, b) returns a then b on later calls. For void methods and spies use the do-family: doThrow(new MailException()).when(mailer).send(any()).\n\nMatchers like any(), anyString(), eq(5) and argThat(...) match many values. One strict rule: if any argument uses a matcher, all arguments must use matchers. when(repo.find(anyString(), \"x\")) fails; write eq(\"x\") instead. With MockitoExtension, Mockito uses strict stubs: a stub that the test never uses causes UnnecessaryStubbingException, and a call with different arguments is reported, which keeps tests honest and tidy.",
        bullets: ["thenReturn, thenThrow, thenAnswer", "doReturn / doThrow / doNothing for void methods and spies", "All arguments matchers or none"],
      },
      {
        heading: "Verifying calls and capturing arguments",
        body: "verify(mailer).send(any()) checks that a call happened exactly once. You can change the count with times(2), never(), atLeastOnce() or atMost(3). InOrder checks the sequence of calls across one or more mocks, for example that you saved the order before sending the email.\n\nWhen the important thing is what was passed, use an ArgumentCaptor. Declare @Captor ArgumentCaptor<Email> captor, call verify(mailer).send(captor.capture()), then assert on captor.getValue(). This is cleaner than a complicated argThat matcher and gives readable failures. Verify only interactions that matter to the behaviour, like a payment being charged or an email being sent. Verifying every internal call ties the test to the implementation, and it breaks on harmless refactors.",
        visual: {
          type: "flow",
          title: "Using an ArgumentCaptor",
          steps: [
            { label: "Declare captor", detail: "@Captor ArgumentCaptor<Email> captor" },
            { label: "Run the code", detail: "service.register(\"ana@x.com\")" },
            { label: "Capture", detail: "verify(mailer).send(captor.capture())" },
            { label: "Read the value", detail: "Email sent = captor.getValue()" },
            { label: "Assert", detail: "Check recipient, subject and body" },
          ],
        },
      },
      {
        heading: "@InjectMocks and its traps",
        body: "@InjectMocks creates the class under test and fills its dependencies with your @Mock fields. It tries constructor injection first, using the biggest constructor, then setter injection, then field injection. The trap: if it cannot match a dependency, it does not fail. The field simply stays null, and you get a NullPointerException deep in the test that looks unrelated.\n\nMany teams therefore skip @InjectMocks and build the object themselves in @BeforeEach: service = new OrderService(repo, payments, mailer). It is one extra line, the compiler checks it, and adding a new dependency breaks the test loudly instead of silently. A spy (@Spy or spy(realObject)) wraps a real object and calls real methods unless stubbed; use it sparingly, mostly for legacy code.",
      },
      {
        heading: "When not to mock",
        body: "Do not mock value objects such as records, DTOs, String or BigDecimal; just create real ones. Do not mock the class under test. Avoid mocking types you do not own, such as an HTTP client, JdbcTemplate or EntityManager: your stubs encode your guess of how they behave, and the guess may be wrong. Wrap them in your own small interface and mock that, or test them for real.\n\nDatabase code is the classic case. A mocked repository proves nothing about your SQL, mappings or constraints. Use @DataJpaTest with Testcontainers for that layer. Sometimes a fake is better than a mock: a simple in-memory implementation of a repository interface lets you test real behaviour across several calls without any stubbing. Keep mocks for slow, remote or side-effecting collaborators.",
        visual: {
          type: "compare",
          title: "Mock, fake or the real thing?",
          columns: [
            { title: "Mock", points: ["Scripted answers per test", "Can verify calls", "Good for remote or side effects", "Tied to how code calls it"] },
            { title: "Fake", points: ["Simple working implementation", "Like an in-memory repository", "Behaves the same across tests", "No stubbing needed"] },
            { title: "Real (Testcontainers)", points: ["Actual Postgres, Redis, Kafka", "Catches SQL and mapping bugs", "Slower: seconds, not milliseconds", "Best for integration tests"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "The family of test doubles",
        root: "Test double",
        children: [
          { label: "Dummy", children: ["Passed in but never used"] },
          { label: "Stub", children: ["Returns preset answers"] },
          { label: "Fake", children: ["Working shortcut, such as an in-memory store"] },
          { label: "Mock", children: ["Stubbed and verified, as Mockito does"] },
          { label: "Spy", children: ["Real object that also records calls"] },
        ],
      },
    ],
    examples: [
      {
        title: "Checking the welcome email with an ArgumentCaptor",
        explanation: "When a user registers, the service saves them and sends a welcome email. Step 1: stub the repository to return the saved user. Step 2: call register. Step 3: capture the Email passed to the mailer. Step 4: assert on its fields: recipient and subject. The test does not care how the service builds the email, only what is sent, so internal refactors will not break it.",
        code: {
          lang: "java",
          code: `@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {
  @Mock UserRepository users;
  @Mock Mailer mailer;
  @Captor ArgumentCaptor<Email> email;
  @Test
  void sendsWelcomeEmail() {
    when(users.save(any())).thenAnswer(inv -> inv.getArgument(0));
    new RegistrationService(users, mailer).register("ana@x.com");
    verify(mailer).send(email.capture());
    assertEquals("ana@x.com", email.getValue().to());
    assertEquals("Welcome!", email.getValue().subject());
  }
}`,
        },
      },
      {
        title: "Simulating a failed payment",
        explanation: "You want to know that a declined payment marks the order as failed and never ships it. Step 1: stub the payment client to throw PaymentDeclinedException. Step 2: call placeOrder. Step 3: assert the returned status. Step 4: verify that shipping was never called. Producing this failure with a real payment provider would be slow and hard; with a mock it is one line.",
        code: {
          lang: "java",
          code: `@Test
void declinedPaymentFailsOrderAndDoesNotShip() {
  var payments = mock(PaymentClient.class);
  var shipping = mock(ShippingClient.class);
  when(payments.charge(any(), any()))
      .thenThrow(new PaymentDeclinedException("insufficient funds"));
  var service = new OrderService(payments, shipping);

  OrderStatus status = service.placeOrder(new Order("o-1", new BigDecimal("30.00")));

  assertEquals(OrderStatus.PAYMENT_FAILED, status);
  verify(shipping, never()).ship(any());
}`,
        },
      },
    ],
    cheatSheet: [
      "when(x.call(arg)).thenReturn(value) for methods that return something",
      "doThrow(new Ex()).when(x).voidCall(any()) for void methods",
      "If one argument uses a matcher, all must: eq(\"x\"), not \"x\"",
      "verify(x, never()).call(any()) proves something did not happen",
      "ArgumentCaptor: verify(x).send(captor.capture()); captor.getValue()",
      "Unstubbed calls return 0, false, null or empty collections and Optionals",
      "Strict stubs: unused stubs fail with UnnecessaryStubbingException",
      "Prefer building the object under test with new over @InjectMocks",
    ],
    quiz: [
      {
        q: "An unstubbed mock method returns List<User>. What does it return?",
        options: ["null", "An empty list", "It throws an exception", "A list with one mock user"],
        answer: 1,
        why: "Mockito returns empty collections for collection return types.",
      },
      {
        q: "What is wrong with when(repo.find(anyString(), \"active\"))?",
        options: ["Nothing", "anyString() only works with verify", "find must be void", "Mixing a matcher with a raw value; use eq(\"active\")"],
        answer: 3,
        why: "When any argument uses a matcher, every argument must be a matcher.",
      },
      {
        q: "How do you make a void method mailer.send(...) throw in a test?",
        options: ["doThrow(new MailException()).when(mailer).send(any())", "when(mailer.send(any())).thenThrow(...)", "mailer.send(any()).thenThrow(...)", "verify(mailer).thenThrow(...)"],
        answer: 0,
        why: "when(...) needs a return value, so void methods use the doThrow form.",
      },
      {
        q: "@InjectMocks cannot find a mock for one dependency. What usually happens?",
        options: ["The test fails with a clear message", "Mockito creates a real instance", "The field stays null and you see a NullPointerException later", "The dependency is skipped at compile time"],
        answer: 2,
        why: "@InjectMocks fails silently, which is why many teams use constructors directly.",
      },
      {
        q: "Which is the best way to test that your JPA repository query is correct?",
        options: ["Mock the repository", "Mock the EntityManager", "Use a spy on the repository", "Run it against a real database, for example with Testcontainers"],
        answer: 3,
        why: "Only a real database checks the SQL, mappings and constraints.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "GreetingService.greet(long id) returns \"Hello, NAME\" or \"Hello, guest\" when the user is missing. Write a test for the missing case.",
        hint: "Stub findById to return Optional.empty().",
        solution: "@ExtendWith(MockitoExtension.class)\nclass GreetingServiceTest {\n  @Mock UserRepository repo;\n\n  @Test void greetsGuestWhenUserMissing() {\n    when(repo.findById(42L)).thenReturn(Optional.empty());\n    assertEquals(\"Hello, guest\", new GreetingService(repo).greet(42L));\n  }\n}",
      },
      {
        level: "medium",
        task: "Verify that OrderService.place(order) saves the order once and then sends a confirmation, in that order.",
        hint: "Use inOrder(repo, mailer).",
        solution: "@Test void savesThenConfirms() {\n  var repo = mock(OrderRepository.class);\n  var mailer = mock(Mailer.class);\n  var order = new Order(\"o-1\", new BigDecimal(\"10.00\"));\n\n  new OrderService(repo, mailer).place(order);\n\n  InOrder inOrder = inOrder(repo, mailer);\n  inOrder.verify(repo).save(order);\n  inOrder.verify(mailer).sendConfirmation(order);\n}",
      },
      {
        level: "hard",
        task: "A PriceFetcher retries a flaky client up to 3 times. Test that it succeeds when the first two calls throw and the third returns 9.99, and that the client was called exactly 3 times.",
        hint: "Chain thenThrow and thenReturn to script consecutive calls.",
        solution: "@Test void retriesUntilSuccess() {\n  var client = mock(PriceClient.class);\n  when(client.fetch(\"SKU-1\"))\n      .thenThrow(new RuntimeException(\"timeout\"))\n      .thenThrow(new RuntimeException(\"timeout\"))\n      .thenReturn(new BigDecimal(\"9.99\"));\n\n  var price = new PriceFetcher(client, 3).price(\"SKU-1\");\n\n  assertEquals(new BigDecimal(\"9.99\"), price);\n  verify(client, times(3)).fetch(\"SKU-1\");\n}",
      },
    ],
    faq: [
      { q: "What is the difference between a mock and a stub?", a: "A stub only returns preset answers. A mock also records calls so you can verify them. Mockito objects can play both roles." },
      { q: "Can Mockito mock final classes and static methods?", a: "Yes. Since Mockito 5 the inline mock maker is the default, so final classes work out of the box, and Mockito.mockStatic can mock static methods inside a try-with-resources block." },
      { q: "What is the difference between @Mock and @MockitoBean?", a: "@Mock is plain Mockito for unit tests without Spring. @MockitoBean (Spring Framework 6.2+, replacing the older @MockBean) puts a mock into the Spring application context for slice and integration tests." },
      { q: "Why do I get UnnecessaryStubbingException?", a: "MockitoExtension uses strict stubs, and one of your when(...) stubs was never used by the code under test. Remove it, or check whether the code took an unexpected path." },
    ],
  },
};

export default extra;
