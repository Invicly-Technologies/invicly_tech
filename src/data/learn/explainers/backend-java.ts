import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  "java-core/java-syntax": {
    summary:
      "Java is a statically typed language: every variable has a type that the compiler checks before the program runs. Source files are compiled to bytecode, which the JVM runs on any operating system.",
    analogy: "Bytecode is like sheet music: any JVM can play it, whatever the instrument.",
    visuals: [
      {
        type: "flow",
        title: "From source file to running program",
        steps: [
          { label: "Write Main.java", detail: "Plain text source with a class and a main method" },
          { label: "javac compiles", detail: "Checks types and syntax, reports errors early" },
          { label: "Main.class bytecode", detail: "Platform-independent instructions for the JVM" },
          { label: "JVM loads class", detail: "Class loader reads and verifies the bytecode" },
          { label: "main() runs", detail: "JIT compiler turns hot code into fast machine code" },
        ],
      },
      {
        type: "tree",
        title: "Two families of types",
        root: "Java types",
        children: [
          { label: "Primitives (8)", children: ["int, long, short, byte", "double, float", "boolean", "char"] },
          { label: "References", children: ["String", "Arrays like int[]", "Classes and interfaces", "Can be null"] },
        ],
      },
    ],
    keyPoints: [
      "Java has 8 primitive types; everything else is a reference to an object.",
      "Compare strings with equals(), because == compares references, not text.",
      "Integer division drops the remainder: 7 / 2 is 3, not 3.5.",
      "Switch with arrow labels (case X ->) never falls through to the next case.",
    ],
    terms: [
      { term: "JDK", meaning: "Java Development Kit: compiler, JVM and tools to build programs." },
      { term: "JVM", meaning: "Java Virtual Machine that runs compiled bytecode." },
      { term: "Bytecode", meaning: "The .class instructions produced by javac." },
      { term: "Primitive", meaning: "A basic value type like int or boolean, not an object." },
      { term: "Method", meaning: "A named block of code inside a class that can take parameters." },
    ],
    example: {
      lang: "java",
      code: "public class Main {\n  public static void main(String[] args) {\n    int[] nums = {3, 8, 1, 5};\n    int max = nums[0];\n    for (int n : nums) {\n      if (n > max) max = n;\n    }\n    String size = switch (nums.length) {\n      case 0 -> \"empty\";\n      case 1, 2, 3 -> \"small\";\n      default -> \"large\";\n    };\n    System.out.println(\"Max: \" + max + \", size: \" + size);\n  }\n}",
      caption: "Run it with: java Main.java (single-file launch, Java 11+).",
    },
    pitfalls: [
      "Using == to compare String values instead of equals().",
      "Reading nums[nums.length], which throws ArrayIndexOutOfBoundsException.",
      "Expecting int division to keep decimals; cast to double first.",
    ],
    check: [
      { q: "What does javac produce?", a: "Bytecode in .class files, which the JVM then loads and runs." },
      { q: "Why is a == b risky for two Strings?", a: "It checks whether both refer to the same object, not whether the text is equal." },
    ],
  },

  "java-core/java-oop": {
    summary:
      "Object-oriented Java models a domain as classes that bundle state and behaviour. Interfaces define what an object can do, and polymorphism lets one call work on many types.",
    analogy: "An interface is a job description; each class is a person who does the job their own way.",
    visuals: [
      {
        type: "tree",
        title: "One interface, many implementations",
        root: "interface Shape { area() }",
        children: [
          { label: "class Circle", children: ["field: radius", "area = pi * r * r"] },
          { label: "class Square", children: ["field: side", "area = side * side"] },
          { label: "class Triangle", children: ["fields: base, height", "area = base * height / 2"] },
        ],
      },
      {
        type: "compare",
        title: "Inheritance vs composition",
        columns: [
          {
            title: "Inheritance (is-a)",
            points: ["class Dog extends Animal", "Reuses parent code directly", "Tight coupling to parent internals", "Only one superclass allowed"],
          },
          {
            title: "Composition (has-a)",
            points: ["class Car has an Engine", "Delegates work to a field", "Swap parts without changing callers", "Usually the safer default"],
          },
        ],
      },
    ],
    keyPoints: [
      "Keep fields private and expose behaviour through methods (encapsulation).",
      "Program to interfaces so callers do not depend on concrete classes.",
      "Prefer composition; use inheritance only for a true is-a relationship.",
      "If you override equals, also override hashCode, or HashMap and HashSet break.",
    ],
    terms: [
      { term: "Class", meaning: "A blueprint that defines fields and methods for objects." },
      { term: "Interface", meaning: "A contract of methods that classes promise to implement." },
      { term: "Encapsulation", meaning: "Hiding internal state behind a controlled public API." },
      { term: "Polymorphism", meaning: "One method call behaving differently depending on the object type." },
      { term: "Abstract class", meaning: "A partial class that cannot be instantiated and may hold shared code." },
    ],
    example: {
      lang: "java",
      code: "interface Shape { double area(); }\n\nclass Circle implements Shape {\n  private final double r;\n  Circle(double r) { this.r = r; }\n  public double area() { return Math.PI * r * r; }\n}\n\nclass Square implements Shape {\n  private final double side;\n  Square(double side) { this.side = side; }\n  public double area() { return side * side; }\n}\n\n// Polymorphism: for (Shape s : List.of(new Circle(1), new Square(2))) s.area();",
      caption: "Callers only know Shape, so new shapes need no caller changes.",
    },
    pitfalls: [
      "Making every field public, so any code can break the object's rules.",
      "Building deep inheritance chains where a small interface would do.",
      "Overriding equals without hashCode.",
    ],
    check: [
      { q: "When should you prefer composition over inheritance?", a: "When the relationship is has-a or you want to swap behaviour; it avoids tight coupling to a parent class." },
      { q: "What is polymorphism in one sentence?", a: "Calling the same method on different types and getting each type's own behaviour." },
    ],
  },

  "java-core/java-exceptions": {
    summary:
      "Exceptions signal that something went wrong and let you handle it in one place. Generics let classes and methods work with any type while the compiler still checks type safety.",
    visuals: [
      {
        type: "tree",
        title: "Exception hierarchy",
        root: "Throwable",
        children: [
          { label: "Error (do not catch)", children: ["OutOfMemoryError", "StackOverflowError"] },
          { label: "Exception (checked)", children: ["IOException", "SQLException", "Must catch or declare"] },
          {
            label: "RuntimeException (unchecked)",
            children: ["NullPointerException", "IllegalArgumentException", "IndexOutOfBoundsException", "Subclass of Exception"],
          },
        ],
      },
    ],
    keyPoints: [
      "Checked exceptions must be caught or declared with throws; unchecked ones need not be.",
      "RuntimeException extends Exception, but the compiler does not force you to handle it.",
      "try-with-resources closes files and connections automatically, even when an exception occurs.",
      "Bounded generics like <T extends Comparable<T>> let you call methods of the bound safely.",
    ],
    terms: [
      { term: "Checked exception", meaning: "An exception the compiler forces you to handle or declare." },
      { term: "Unchecked exception", meaning: "A RuntimeException subclass, usually a programming bug." },
      { term: "try-with-resources", meaning: "try (resource) block that auto-closes AutoCloseable objects." },
      { term: "Generic type", meaning: "A class or method with a type parameter, like List<T>." },
      { term: "Wildcard", meaning: "? in a type, e.g. List<? extends Number> accepts any Number list." },
    ],
    example: {
      lang: "java",
      code: "class NotFoundException extends RuntimeException {\n  NotFoundException(String msg) { super(msg); }\n}\n\nstatic <T extends Comparable<T>> T max(List<T> list) {\n  if (list.isEmpty()) throw new NotFoundException(\"empty list\");\n  T best = list.get(0);\n  for (T x : list) if (x.compareTo(best) > 0) best = x;\n  return best;\n}\ntry (var reader = Files.newBufferedReader(Path.of(\"data.txt\"))) {\n  System.out.println(reader.readLine());\n} catch (IOException e) {\n  System.err.println(\"Could not read: \" + e.getMessage());\n}",
      caption: "A custom unchecked exception, a bounded generic method and auto-closing a reader.",
    },
    pitfalls: [
      "Catching Exception and ignoring it, which hides real bugs.",
      "Using raw types like List instead of List<String>, losing type checks.",
      "Forgetting to close resources when not using try-with-resources.",
    ],
    check: [
      { q: "Is NullPointerException checked or unchecked?", a: "Unchecked; it extends RuntimeException, so the compiler does not force handling." },
      { q: "What does try-with-resources guarantee?", a: "Every resource declared in the try header is closed when the block ends, normally or by exception." },
      { q: "What does <T extends Comparable<T>> allow?", a: "Only types that can compare themselves, so the method may call compareTo on T." },
    ],
  },

  "java-core/java-collections": {
    summary:
      "The collections framework gives ready-made lists, sets, maps and queues. Choosing the right one is mostly about access pattern, ordering and the Big-O cost of the operations you use most.",
    visuals: [
      {
        type: "tree",
        title: "Main collection types",
        root: "Java collections",
        children: [
          { label: "List (ordered, duplicates)", children: ["ArrayList", "LinkedList"] },
          { label: "Set (no duplicates)", children: ["HashSet", "LinkedHashSet", "TreeSet (sorted)"] },
          { label: "Queue / Deque", children: ["ArrayDeque", "PriorityQueue", "LinkedList"] },
          { label: "Map (key to value)", children: ["HashMap", "LinkedHashMap", "TreeMap (sorted)"] },
        ],
      },
      {
        type: "compare",
        title: "ArrayList vs LinkedList",
        columns: [
          {
            title: "ArrayList",
            points: ["get(i) is O(1)", "add at end is amortised O(1)", "Insert or remove in middle is O(n)", "Compact, cache-friendly memory"],
          },
          {
            title: "LinkedList",
            points: ["get(i) is O(n)", "Add or remove at ends is O(1)", "Extra memory per node", "Rarely faster in practice"],
          },
        ],
      },
    ],
    keyPoints: [
      "HashMap and HashSet give average O(1) lookups but no ordering.",
      "TreeMap and TreeSet keep keys sorted with O(log n) operations.",
      "LinkedHashMap keeps insertion order, handy for predictable output and LRU caches.",
      "Use ArrayDeque for stacks and queues and PriorityQueue when you need the smallest first.",
    ],
    terms: [
      { term: "List", meaning: "Ordered collection that allows duplicates and index access." },
      { term: "Set", meaning: "Collection with no duplicate elements." },
      { term: "Map", meaning: "Key to value lookup table; keys are unique." },
      { term: "Deque", meaning: "Double-ended queue: add or remove at both ends." },
      { term: "Amortised O(1)", meaning: "Usually constant time, with an occasional costly resize averaged out." },
    ],
    example: {
      lang: "java",
      code: "List<String> words = List.of(\"to\", \"be\", \"or\", \"not\", \"to\", \"be\");\n\nMap<String, Integer> counts = new HashMap<>();\nfor (String w : words) counts.merge(w, 1, Integer::sum);\n\nSet<String> sorted = new TreeSet<>(words);  // [be, not, or, to]\n\nDeque<Integer> stack = new ArrayDeque<>();\nstack.push(1); stack.push(2);\nint top = stack.pop();  // 2\n\nPriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5, 1, 3));\nint smallest = pq.poll();  // 1",
    },
    pitfalls: [
      "Using LinkedList.get(i) in a loop, which makes the loop O(n squared).",
      "Mutating a HashMap key after insertion, so it can no longer be found.",
      "Removing items in a for-each loop, which throws ConcurrentModificationException.",
    ],
    check: [
      { q: "Which map keeps keys sorted?", a: "TreeMap, with O(log n) get and put." },
      { q: "Why is ArrayList usually preferred over LinkedList?", a: "It has O(1) index access and better memory locality, which wins for most workloads." },
    ],
  },

  "java-core/java-streams": {
    summary:
      "Lambdas are short anonymous functions, and streams chain them into readable data pipelines. Optional makes a possibly missing value explicit instead of returning null.",
    visuals: [
      {
        type: "flow",
        title: "A stream pipeline",
        steps: [
          { label: "Source", detail: "orders.stream() from a collection" },
          { label: "filter", detail: "Keep elements matching a predicate" },
          { label: "map", detail: "Transform each element to a new value" },
          { label: "Terminal operation", detail: "collect, reduce, count or forEach starts the work" },
          { label: "Result", detail: "A list, map, number or Optional" },
        ],
      },
    ],
    keyPoints: [
      "Intermediate operations are lazy; nothing runs until a terminal operation is called.",
      "A stream can be consumed only once; create a new one to reuse the source.",
      "Collectors.groupingBy builds a Map from a key function in one line.",
      "Return Optional for maybe-missing results; never call get() without checking.",
    ],
    terms: [
      { term: "Lambda", meaning: "Inline function like x -> x * 2." },
      { term: "Method reference", meaning: "Shorthand for a lambda, like String::length." },
      { term: "Intermediate op", meaning: "Lazy step returning a stream, such as map or filter." },
      { term: "Terminal op", meaning: "Step that produces a result and runs the pipeline." },
      { term: "Optional", meaning: "Container that holds a value or is empty." },
    ],
    example: {
      lang: "java",
      code: "record Order(String customer, String city, double total) {}\n\nList<Order> orders = List.of(\n    new Order(\"ana\", \"Pune\", 120), new Order(\"raj\", \"Delhi\", 40),\n    new Order(\"li\", \"Pune\", 75));\n\nMap<String, Double> totalByCity = orders.stream()\n    .filter(o -> o.total() > 50)\n    .collect(Collectors.groupingBy(Order::city,\n        Collectors.summingDouble(Order::total)));  // {Pune=195.0}\n\nOptional<Order> biggest = orders.stream()\n    .max(Comparator.comparingDouble(Order::total));\nString who = biggest.map(Order::customer).orElse(\"none\");",
    },
    pitfalls: [
      "Changing shared variables inside a lambda instead of collecting results.",
      "Calling Optional.get() without isPresent, which defeats the purpose.",
      "Forcing every loop into a stream when a plain loop is clearer.",
    ],
    check: [
      { q: "When does a stream pipeline actually execute?", a: "Only when a terminal operation such as collect or count is called." },
      { q: "What does orElse do on an Optional?", a: "Returns the contained value, or the given default if the Optional is empty." },
    ],
  },

  "java-core/java-modern": {
    summary:
      "Java 17 to 21 added records, sealed types and pattern matching. Together they cut boilerplate and let the compiler check that every case of a type hierarchy is handled.",
    visuals: [
      {
        type: "compare",
        title: "Classic class vs record",
        columns: [
          {
            title: "Classic POJO",
            points: ["Write fields, constructor, getters", "Hand-write equals and hashCode", "Hand-write toString", "Often 40+ lines"],
          },
          {
            title: "record",
            points: ["record Point(int x, int y) {}", "Fields are final, immutable", "equals, hashCode, toString generated", "One line"],
          },
        ],
      },
      {
        type: "tree",
        title: "A sealed hierarchy",
        root: "sealed interface Shape",
        children: [
          { label: "record Circle", children: ["double r"] },
          { label: "record Square", children: ["double side"] },
          { label: "No other implementations", children: ["switch can be exhaustive", "No default branch needed"] },
        ],
      },
    ],
    keyPoints: [
      "Records are immutable data carriers with generated accessors like point.x().",
      "Sealed types list exactly which classes may extend or implement them.",
      "Pattern matching for instanceof binds a typed variable: if (o instanceof String s).",
      "Switch expressions with type patterns (Java 21) are checked for exhaustiveness on sealed types.",
    ],
    terms: [
      { term: "record", meaning: "A compact, immutable data class with generated methods." },
      { term: "sealed", meaning: "Restricts which classes can extend a type, via permits." },
      { term: "Pattern matching", meaning: "Testing a type and binding a variable in one step." },
      { term: "Switch expression", meaning: "A switch that returns a value, using case X -> syntax." },
      { term: "Exhaustive", meaning: "Every possible case is covered, checked by the compiler." },
    ],
    example: {
      lang: "java",
      code: "sealed interface Shape permits Circle, Square {}\nrecord Circle(double r) implements Shape {}\nrecord Square(double side) implements Shape {}\n\nstatic double area(Shape s) {\n  return switch (s) {\n    case Circle c -> Math.PI * c.r() * c.r();\n    case Square sq -> sq.side() * sq.side();\n  };  // no default: the compiler knows all cases\n}\n\nObject o = \"hello\";\nif (o instanceof String str && str.length() > 3) {\n  System.out.println(str.toUpperCase());\n}",
    },
    pitfalls: [
      "Putting mutable lists in a record and assuming the record is fully immutable.",
      "Adding a default branch to a sealed switch, which hides missing new cases.",
      "Trying to extend a record; records are implicitly final.",
    ],
    check: [
      { q: "What does a record generate for you?", a: "A constructor, accessors, equals, hashCode and toString based on its components." },
      { q: "Why pair sealed types with switch?", a: "The compiler can verify every permitted subtype is handled, so adding one flags missing cases." },
    ],
  },

  "java-core/java-concurrency": {
    summary:
      "Concurrency lets a program do several things at once, but shared mutable state can cause race conditions. Java offers locks, atomics, executors, CompletableFuture and, since Java 21, cheap virtual threads.",
    visuals: [
      {
        type: "flow",
        title: "Thread states",
        steps: [
          { label: "NEW", detail: "Thread object created, start() not yet called" },
          { label: "RUNNABLE", detail: "Running or ready to run on a CPU" },
          { label: "BLOCKED / WAITING", detail: "Waiting for a lock, join, sleep or I/O" },
          { label: "Back to RUNNABLE", detail: "Lock acquired or wait finished" },
          { label: "TERMINATED", detail: "run() finished or threw an exception" },
        ],
      },
      {
        type: "compare",
        title: "Platform vs virtual threads",
        columns: [
          {
            title: "Platform threads",
            points: ["One OS thread each", "About 1 MB stack each", "Thousands at most", "Pool them with fixed executors"],
          },
          {
            title: "Virtual threads (Java 21)",
            points: ["Scheduled by the JVM", "Very cheap to create", "Millions possible", "Great for blocking I/O tasks"],
          },
        ],
      },
    ],
    keyPoints: [
      "A race condition happens when threads read and write shared state without coordination.",
      "Use synchronized, locks, atomics or concurrent collections to protect shared state.",
      "ExecutorService reuses threads; always shut it down or use try-with-resources.",
      "Virtual threads suit I/O-bound work; they do not make CPU-bound work faster.",
    ],
    terms: [
      { term: "Race condition", meaning: "Result depends on unpredictable timing between threads." },
      { term: "synchronized", meaning: "Lets only one thread at a time run a block on a given lock." },
      { term: "AtomicInteger", meaning: "Thread-safe counter using lock-free compare-and-set." },
      { term: "ExecutorService", meaning: "Manages a pool of threads that run submitted tasks." },
      { term: "CompletableFuture", meaning: "A future you can chain async steps onto." },
      { term: "Virtual thread", meaning: "Lightweight JVM-managed thread introduced in Java 21." },
    ],
    example: {
      lang: "java",
      code: "AtomicInteger counter = new AtomicInteger();\n\ntry (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {\n  for (int i = 0; i < 1_000; i++) {\n    ex.submit(() -> { counter.incrementAndGet(); });\n  }\n}  // close() waits for all submitted tasks\n\nSystem.out.println(counter.get());  // always 1000\n\nCompletableFuture.supplyAsync(() -> 42)\n    .thenApply(x -> x * 2)\n    .thenAccept(System.out::println);  // 84",
      caption: "With a plain int counter++ the total could be less than 1000.",
    },
    pitfalls: [
      "Using count++ on a shared int; it is not atomic.",
      "Forgetting to shut down an executor, which keeps the JVM alive.",
      "Taking two locks in different orders in different threads, causing deadlock.",
    ],
    check: [
      { q: "Why is count++ unsafe across threads?", a: "It is a read, add and write; two threads can read the same value and lose an update." },
      { q: "When do virtual threads help most?", a: "For many tasks that spend time blocked on I/O, such as HTTP or database calls." },
    ],
  },

  "java-core/jvm": {
    summary:
      "The JVM splits memory into the heap for objects, a stack per thread for method calls, and metaspace for class data. The garbage collector frees heap objects that nothing references any more.",
    visuals: [
      {
        type: "layers",
        title: "JVM memory areas",
        layers: [
          { label: "Heap: young generation", detail: "Eden plus survivor spaces; new objects live here" },
          { label: "Heap: old generation", detail: "Long-lived objects promoted from young gen" },
          { label: "Thread stacks", detail: "One per thread: frames, local variables, references" },
          { label: "Metaspace", detail: "Class metadata, stored in native memory" },
          { label: "Code cache", detail: "Machine code produced by the JIT compiler" },
        ],
      },
      {
        type: "cycle",
        title: "Generational garbage collection",
        steps: [
          { label: "Allocate in Eden", detail: "New objects are created quickly in Eden" },
          { label: "Minor GC", detail: "Eden fills; unreachable objects are discarded" },
          { label: "Copy survivors", detail: "Live objects move to a survivor space" },
          { label: "Promote to old gen", detail: "Objects surviving several GCs are promoted" },
          { label: "Major or mixed GC", detail: "Old gen is collected when it fills up" },
        ],
      },
    ],
    keyPoints: [
      "Objects live on the heap; local primitives and references live on the thread stack.",
      "Most objects die young, so collecting the young generation is cheap and frequent.",
      "G1 is the default collector; ZGC targets very short pauses on large heaps.",
      "A memory leak in Java is objects still referenced, often from static maps or caches.",
    ],
    terms: [
      { term: "Heap", meaning: "Shared memory area where all objects are allocated." },
      { term: "Stack", meaning: "Per-thread memory for method frames and local variables." },
      { term: "Metaspace", meaning: "Native memory holding class definitions." },
      { term: "GC root", meaning: "Starting reference, like a static field or live local, for reachability." },
      { term: "Heap dump", meaning: "Snapshot of all heap objects, used to find leaks." },
    ],
    example: {
      lang: "bash",
      code: "# Fixed 512 MB heap, G1 collector, GC log, dump on OOM\njava -Xms512m -Xmx512m -XX:+UseG1GC -Xlog:gc:file=gc.log -XX:+HeapDumpOnOutOfMemoryError -jar app.jar\n\n# Inspect a running JVM\njcmd <pid> GC.heap_info\njcmd <pid> GC.heap_dump /tmp/heap.hprof\n\n# Open heap.hprof in VisualVM or Eclipse MAT to find what holds memory",
    },
    pitfalls: [
      "Raising -Xmx to hide a leak instead of finding what holds references.",
      "Unbounded static caches that grow forever.",
      "Deep or infinite recursion causing StackOverflowError.",
    ],
    check: [
      { q: "Where does a new object live, and where does its local reference live?", a: "The object is on the heap; the local variable holding its reference is on the thread stack." },
      { q: "Why is GC generational?", a: "Most objects die young, so frequently collecting a small young area is cheap and frees most garbage." },
    ],
  },

  "build-test/maven-gradle": {
    summary:
      "Maven and Gradle download dependencies, compile code, run tests and package your app. They make builds repeatable on every machine and in CI.",
    visuals: [
      {
        type: "flow",
        title: "Maven default lifecycle",
        steps: [
          { label: "validate", detail: "Check the project and pom.xml are correct" },
          { label: "compile", detail: "Compile src/main/java" },
          { label: "test", detail: "Run unit tests with Surefire" },
          { label: "package", detail: "Build the jar" },
          { label: "verify", detail: "Run integration tests and checks" },
          { label: "install", detail: "Copy the jar to the local ~/.m2 repository" },
          { label: "deploy", detail: "Publish to a remote repository" },
        ],
      },
      {
        type: "compare",
        title: "Maven vs Gradle",
        columns: [
          {
            title: "Maven",
            points: ["XML pom.xml", "Fixed, conventional lifecycle", "Very predictable builds", "Huge plugin ecosystem"],
          },
          {
            title: "Gradle",
            points: ["Kotlin or Groovy scripts", "Flexible task graph", "Incremental builds and build cache", "Common for Android and large builds"],
          },
        ],
      },
    ],
    keyPoints: [
      "Running a phase runs every earlier phase too: mvn package also compiles and tests.",
      "Dependency scope controls where a jar is used: compile, test, runtime or provided.",
      "Use the wrapper (mvnw or gradlew) so everyone builds with the same tool version.",
      "Multi-module builds split a project into modules with a shared parent build.",
    ],
    terms: [
      { term: "pom.xml", meaning: "Maven's project file: coordinates, dependencies and plugins." },
      { term: "Coordinates", meaning: "groupId, artifactId and version that identify a library." },
      { term: "Scope", meaning: "Where a dependency is available, such as test only." },
      { term: "Plugin", meaning: "Code that performs build work, like compiling or packaging." },
      { term: "Wrapper", meaning: "Script that downloads and runs a pinned build tool version." },
    ],
    example: {
      lang: "xml",
      code: "<!-- pom.xml: add JUnit for tests only -->\n<dependency>\n  <groupId>org.junit.jupiter</groupId>\n  <artifactId>junit-jupiter</artifactId>\n  <version>5.10.2</version>\n  <scope>test</scope>\n</dependency>\n\n<!-- Then run: ./mvnw clean package -->\n<!-- Gradle equivalent: testImplementation(\"org.junit.jupiter:junit-jupiter:5.10.2\") -->",
    },
    pitfalls: [
      "Committing build output folders like target or build.",
      "Declaring test libraries without test scope, bloating the final jar.",
      "Letting several modules pin different versions of the same library.",
    ],
    check: [
      { q: "What does mvn package run?", a: "Every phase up to package: validate, compile, test and then package." },
      { q: "Why use the Maven or Gradle wrapper?", a: "It pins the build tool version so all developers and CI build the same way." },
    ],
  },

  "build-test/junit": {
    summary:
      "JUnit 5 is the standard Java testing framework. You write small methods annotated with @Test that arrange data, call the code and assert the result.",
    visuals: [
      {
        type: "flow",
        title: "JUnit 5 test lifecycle",
        steps: [
          { label: "@BeforeAll", detail: "Runs once before all tests in the class" },
          { label: "@BeforeEach", detail: "Fresh setup before every single test" },
          { label: "@Test runs", detail: "Arrange, act, assert" },
          { label: "@AfterEach", detail: "Clean up after every test" },
          { label: "@AfterAll", detail: "Runs once after all tests finish" },
        ],
      },
    ],
    keyPoints: [
      "Each test gets a new instance of the test class by default, so tests stay independent.",
      "Structure each test as arrange, act, assert, and test one behaviour per method.",
      "Use @ParameterizedTest to run the same check over many inputs.",
      "Use assertThrows to check that bad input raises the right exception.",
    ],
    terms: [
      { term: "@Test", meaning: "Marks a method as a test case." },
      { term: "Assertion", meaning: "A check like assertEquals that fails the test if false." },
      { term: "@BeforeEach", meaning: "Setup method that runs before each test." },
      { term: "@ParameterizedTest", meaning: "Runs one test method with several sets of arguments." },
      { term: "@DisplayName", meaning: "Human-readable name shown in test reports." },
    ],
    example: {
      lang: "java",
      code: "class CalculatorTest {\n  private Calculator calc;\n\n  @BeforeEach\n  void setUp() { calc = new Calculator(); }\n\n  @Test\n  void addsTwoNumbers() {\n    assertEquals(5, calc.add(2, 3));\n  }\n\n  @ParameterizedTest\n  @CsvSource({\"1,1,2\", \"2,3,5\", \"-1,1,0\"})\n  void addsMany(int a, int b, int expected) { assertEquals(expected, calc.add(a, b)); }\n}",
    },
    pitfalls: [
      "Tests that depend on the order they run in.",
      "Asserting too many unrelated things in one test.",
      "Names like test1 that do not say what behaviour is checked.",
    ],
    check: [
      { q: "What is the difference between @BeforeEach and @BeforeAll?", a: "@BeforeEach runs before every test; @BeforeAll runs once for the whole class and must be static by default." },
      { q: "Why use a parameterized test?", a: "To check many input and output pairs without copying the same test method." },
    ],
  },

  "build-test/mockito": {
    summary:
      "Mockito creates fake versions of dependencies so you can test one class in isolation. You stub what the fake returns and verify how it was called.",
    visuals: [
      {
        type: "sequence",
        title: "A unit test with a mock",
        actors: ["Test", "UserService", "Mock repository"],
        messages: [
          { from: 0, to: 2, label: "when findById(1) thenReturn Ana" },
          { from: 0, to: 1, label: "getName(1)" },
          { from: 1, to: 2, label: "findById(1)" },
          { from: 2, to: 1, label: "stubbed User Ana" },
          { from: 1, to: 0, label: "returns Ana" },
          { from: 0, to: 2, label: "verify findById(1) called once" },
        ],
      },
    ],
    keyPoints: [
      "@Mock creates a fake; @InjectMocks builds the class under test with those fakes.",
      "Stub with when(...).thenReturn(...) and check calls with verify(...).",
      "ArgumentCaptor grabs the argument passed to a mock so you can assert on it.",
      "Do not mock value objects or the class you are testing; mock its collaborators.",
    ],
    terms: [
      { term: "Mock", meaning: "A fake object whose methods return stubbed or default values." },
      { term: "Stub", meaning: "A preset answer for a specific call on a mock." },
      { term: "verify", meaning: "Asserts that a mock method was called, and how often." },
      { term: "ArgumentCaptor", meaning: "Captures arguments passed to a mock for later assertions." },
      { term: "Spy", meaning: "Wraps a real object, calling real methods unless stubbed." },
    ],
    example: {
      lang: "java",
      code: "@ExtendWith(MockitoExtension.class)\nclass UserServiceTest {\n  @Mock UserRepository repo;\n  @InjectMocks UserService service;\n\n  @Test\n  void returnsUserName() {\n    when(repo.findById(1L)).thenReturn(Optional.of(new User(1L, \"Ana\")));\n\n    assertEquals(\"Ana\", service.getName(1L));\n    verify(repo).findById(1L);\n  }\n}",
    },
    pitfalls: [
      "Mocking everything, so tests only check that mocks call mocks.",
      "Verifying every internal call, making tests break on harmless refactors.",
      "Mocking a database layer that an integration test should cover for real.",
    ],
    check: [
      { q: "What does @InjectMocks do?", a: "Creates the class under test and injects the @Mock fields into it." },
      { q: "When should you not mock?", a: "For simple value objects, the class under test itself, or code better tested against a real dependency." },
    ],
  },

  "databases/sql": {
    summary:
      "SQL is how you ask a relational database questions. Joins combine tables, GROUP BY summarises rows, and window functions rank or total rows without collapsing them.",
    visuals: [
      {
        type: "flow",
        title: "Logical order a SELECT runs in",
        steps: [
          { label: "FROM and JOIN", detail: "Build the combined set of rows" },
          { label: "WHERE", detail: "Filter individual rows" },
          { label: "GROUP BY", detail: "Collapse rows into groups" },
          { label: "HAVING", detail: "Filter whole groups by aggregates" },
          { label: "SELECT", detail: "Compute columns and window functions" },
          { label: "ORDER BY", detail: "Sort the result" },
          { label: "LIMIT", detail: "Keep the first N rows" },
        ],
      },
      {
        type: "compare",
        title: "INNER JOIN vs LEFT JOIN",
        columns: [
          {
            title: "INNER JOIN",
            points: ["Only rows with a match in both", "Unmatched rows disappear", "Use when the relation must exist"],
          },
          {
            title: "LEFT JOIN",
            points: ["All rows from the left table", "Right side is NULL when no match", "Use to find missing data"],
          },
        ],
      },
    ],
    keyPoints: [
      "WHERE filters rows before grouping; HAVING filters groups after aggregation.",
      "Because SELECT runs late, column aliases usually cannot be used in WHERE.",
      "Window functions like RANK() OVER (PARTITION BY ...) keep every row.",
      "CTEs (WITH ...) name intermediate results and make long queries readable.",
    ],
    terms: [
      { term: "JOIN", meaning: "Combines rows from two tables using a matching condition." },
      { term: "Aggregate", meaning: "Function over many rows, like COUNT, SUM or AVG." },
      { term: "Subquery", meaning: "A query nested inside another query." },
      { term: "CTE", meaning: "Named temporary result defined with WITH." },
      { term: "Window function", meaning: "Computes over related rows without collapsing them." },
    ],
    example: {
      lang: "sql",
      code: "-- Departments with more than 5 staff\nSELECT d.name, COUNT(*) AS staff, AVG(e.salary) AS avg_pay\nFROM employees e\nJOIN departments d ON d.id = e.dept_id\nGROUP BY d.name\nHAVING COUNT(*) > 5;\n\n-- Rank employees by salary inside each department\nSELECT name, dept_id, salary,\n       RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk\nFROM employees;",
    },
    pitfalls: [
      "Filtering a LEFT JOIN's right table in WHERE, which turns it into an INNER JOIN.",
      "Comparing with = NULL instead of IS NULL.",
      "Selecting non-grouped columns alongside aggregates.",
    ],
    check: [
      { q: "What is the difference between WHERE and HAVING?", a: "WHERE filters rows before grouping; HAVING filters groups after aggregates are computed." },
      { q: "How is a window function different from GROUP BY?", a: "It computes per group but keeps every input row instead of collapsing them." },
    ],
  },

  "databases/db-design": {
    summary:
      "Good schema design stores each fact once and links tables with keys. Indexes then make the common queries fast, and EXPLAIN shows whether the database actually uses them.",
    visuals: [
      {
        type: "flow",
        title: "Designing a schema",
        steps: [
          { label: "List entities", detail: "Users, orders, products: the nouns of the domain" },
          { label: "Map relationships", detail: "One-to-many, many-to-many via a join table" },
          { label: "Add keys", detail: "Primary, foreign and unique constraints" },
          { label: "Normalise to 3NF", detail: "Each fact stored once, no repeating groups" },
          { label: "Index hot queries", detail: "Index columns used in WHERE, JOIN, ORDER BY" },
          { label: "Check EXPLAIN", detail: "Confirm index scans instead of full scans" },
        ],
      },
      {
        type: "compare",
        title: "Without vs with an index",
        columns: [
          {
            title: "No index",
            points: ["Sequential scan of every row", "O(n) per lookup", "Fast writes"],
          },
          {
            title: "B-tree index",
            points: ["Index scan jumps to matches", "O(log n) per lookup", "Slightly slower writes, extra storage"],
          },
        ],
      },
    ],
    keyPoints: [
      "Normalisation removes duplicated data so updates happen in one place.",
      "Foreign keys let the database reject orphaned rows.",
      "Indexes speed reads but cost write time and storage; add them for real queries.",
      "A composite index on (a, b) helps queries filtering on a, or a and b, not b alone.",
    ],
    terms: [
      { term: "Primary key", meaning: "Column that uniquely identifies each row." },
      { term: "Foreign key", meaning: "Column referencing another table's primary key." },
      { term: "3NF", meaning: "Third normal form: non-key columns depend only on the key." },
      { term: "Index", meaning: "Separate sorted structure that speeds up lookups." },
      { term: "EXPLAIN", meaning: "Shows the plan the database will use for a query." },
    ],
    example: {
      lang: "sql",
      code: "CREATE TABLE customers (\n  id    BIGSERIAL PRIMARY KEY,\n  email TEXT NOT NULL UNIQUE\n);\n\nCREATE TABLE orders (\n  id          BIGSERIAL PRIMARY KEY,\n  customer_id BIGINT NOT NULL REFERENCES customers(id),\n  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\nCREATE INDEX idx_orders_customer ON orders (customer_id, created_at);\n\nEXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at;",
    },
    pitfalls: [
      "Storing comma-separated lists in one column.",
      "Forgetting indexes on foreign key columns used in joins.",
      "Indexing every column, which slows all writes.",
    ],
    check: [
      { q: "Why normalise a schema?", a: "So each fact is stored once, avoiding inconsistent copies when data changes." },
      { q: "What is the cost of an index?", a: "Extra storage and slower inserts, updates and deletes, since the index must be maintained." },
    ],
  },

  "databases/jdbc": {
    summary:
      "JDBC is Java's low-level API for talking to databases, and JPA uses it underneath. A connection pool keeps open connections ready, because opening a new one per request is slow.",
    visuals: [
      {
        type: "layers",
        title: "What sits under JPA",
        layers: [
          { label: "Spring Data repository", detail: "Your interface, e.g. UserRepository" },
          { label: "JPA / Hibernate", detail: "Maps objects to rows and generates SQL" },
          { label: "HikariCP pool", detail: "Hands out reusable open connections" },
          { label: "JDBC driver", detail: "Speaks the database's network protocol" },
          { label: "Database", detail: "PostgreSQL, MySQL and others" },
        ],
      },
      {
        type: "sequence",
        title: "One query through a pool",
        actors: ["App", "HikariCP", "Database"],
        messages: [
          { from: 0, to: 1, label: "getConnection()" },
          { from: 1, to: 0, label: "already-open connection" },
          { from: 0, to: 2, label: "PreparedStatement with ? params" },
          { from: 2, to: 0, label: "ResultSet rows" },
          { from: 0, to: 1, label: "close() returns it to pool" },
        ],
      },
    ],
    keyPoints: [
      "Always use PreparedStatement with ? placeholders; never concatenate user input into SQL.",
      "Close connections, statements and result sets with try-with-resources.",
      "With a pool, close() returns the connection for reuse instead of closing it.",
      "Size the pool modestly; too many connections can overload the database.",
    ],
    terms: [
      { term: "JDBC", meaning: "Java Database Connectivity, the standard database API." },
      { term: "Connection", meaning: "An open session with the database." },
      { term: "PreparedStatement", meaning: "Precompiled SQL with safe, typed parameters." },
      { term: "ResultSet", meaning: "Cursor over the rows a query returned." },
      { term: "Connection pool", meaning: "Cache of open connections reused across requests." },
      { term: "SQL injection", meaning: "Attack where input is executed as SQL code." },
    ],
    example: {
      lang: "java",
      code: "String sql = \"SELECT id, name FROM users WHERE email = ?\";\n\ntry (Connection conn = dataSource.getConnection();\n     PreparedStatement ps = conn.prepareStatement(sql)) {\n  ps.setString(1, email);  // safe: value is never parsed as SQL\n  try (ResultSet rs = ps.executeQuery()) {\n    while (rs.next()) {\n      System.out.println(rs.getLong(\"id\") + \" \" + rs.getString(\"name\"));\n    }\n  }\n}",
      caption: "dataSource is a HikariDataSource, which Spring Boot configures by default.",
    },
    pitfalls: [
      "Building SQL with string concatenation of user input.",
      "Leaking connections by not closing them, exhausting the pool.",
      "Setting a huge pool size thinking it always means more throughput.",
    ],
    check: [
      { q: "How does PreparedStatement prevent SQL injection?", a: "Parameters are sent separately from the SQL text, so input is treated as data, not code." },
      { q: "Why use a connection pool?", a: "Opening connections is slow; a pool reuses open ones and limits load on the database." },
    ],
  },

  "spring/spring-di": {
    summary:
      "Spring's IoC container creates your objects, called beans, and injects their dependencies for you. Classes declare what they need, and Spring wires the graph at startup.",
    analogy: "Like a restaurant kitchen: chefs ask for ingredients and the supply team delivers them.",
    visuals: [
      {
        type: "cycle",
        title: "Bean lifecycle (singleton)",
        steps: [
          { label: "Instantiate", detail: "Spring calls the constructor" },
          { label: "Inject dependencies", detail: "Constructor args or setters are filled" },
          { label: "Initialise", detail: "@PostConstruct and post-processors, proxies created" },
          { label: "In use", detail: "Shared instance serves the whole application" },
          { label: "Destroy", detail: "@PreDestroy runs when the context closes" },
        ],
      },
    ],
    keyPoints: [
      "@Component, @Service and @Repository mark classes for component scanning.",
      "@Bean methods in a @Configuration class register objects you cannot annotate.",
      "Prefer constructor injection: dependencies are final, explicit and easy to test.",
      "Default scope is singleton: one shared instance per application context.",
    ],
    terms: [
      { term: "IoC", meaning: "Inversion of Control: the framework creates and wires objects." },
      { term: "Bean", meaning: "An object created and managed by the Spring container." },
      { term: "ApplicationContext", meaning: "The container that holds and wires all beans." },
      { term: "Dependency injection", meaning: "Receiving collaborators from outside instead of creating them." },
      { term: "Scope", meaning: "How many instances exist, e.g. singleton or prototype." },
    ],
    example: {
      lang: "java",
      code: "@Service\npublic class OrderService {\n  private final PaymentClient payments;\n\n  public OrderService(PaymentClient payments) {  // constructor injection\n    this.payments = payments;\n  }\n}\n\n@Configuration\nclass AppConfig {\n  @Bean\n  Clock clock() { return Clock.systemUTC(); }  // third-party object as a bean\n}",
    },
    pitfalls: [
      "Field injection with @Autowired, which hides dependencies and hampers tests.",
      "Storing per-request state in a singleton bean.",
      "Circular dependencies between beans, a sign the design needs splitting.",
    ],
    check: [
      { q: "Why is constructor injection preferred?", a: "Dependencies are explicit and final, and tests can pass fakes without Spring." },
      { q: "What is the default bean scope?", a: "Singleton: one shared instance per application context." },
    ],
  },

  "spring/spring-boot": {
    summary:
      "Spring Boot adds starters, auto-configuration and an embedded server so an app runs with almost no setup. Profiles and external config let one build behave correctly in dev, test and prod.",
    visuals: [
      {
        type: "flow",
        title: "What happens at startup",
        steps: [
          { label: "SpringApplication.run", detail: "Entry point in the @SpringBootApplication class" },
          { label: "Load config", detail: "application.yml plus the active profile's file" },
          { label: "Auto-configuration", detail: "Creates beans based on classpath and properties" },
          { label: "Create your beans", detail: "Component scan finds your classes" },
          { label: "Start embedded server", detail: "Tomcat listens on server.port" },
        ],
      },
      {
        type: "layers",
        title: "Config precedence (highest first)",
        layers: [
          { label: "Command-line arguments", detail: "--server.port=9090" },
          { label: "Environment variables", detail: "SERVER_PORT=9090, typical in containers" },
          { label: "Profile config file", detail: "application-prod.yml when prod is active" },
          { label: "application.yml", detail: "Shared defaults committed with the code" },
        ],
      },
    ],
    keyPoints: [
      "A starter like spring-boot-starter-web pulls in a tested set of dependencies.",
      "Auto-configuration backs off when you define your own bean of the same type.",
      "Activate profiles with spring.profiles.active or SPRING_PROFILES_ACTIVE.",
      "Keep secrets out of the repo; inject them through environment variables.",
    ],
    terms: [
      { term: "Starter", meaning: "Dependency bundle for a feature, like web or data-jpa." },
      { term: "Auto-configuration", meaning: "Beans Boot creates automatically from the classpath." },
      { term: "Profile", meaning: "Named set of config, such as dev or prod." },
      { term: "Spring Initializr", meaning: "start.spring.io, which generates a new project." },
      { term: "@ConfigurationProperties", meaning: "Binds a config prefix to a typed Java object." },
    ],
    example: {
      lang: "yaml",
      code: "# application.yml\nspring:\n  datasource:\n    url: jdbc:postgresql://localhost:5432/app\n    username: app\nserver:\n  port: 8080\n---\n# Only when the prod profile is active\nspring:\n  config:\n    activate:\n      on-profile: prod\n  datasource:\n    url: ${DB_URL}",
      caption: "Run with java -jar app.jar --spring.profiles.active=prod",
    },
    pitfalls: [
      "Committing production passwords to application.yml.",
      "Not knowing which profile is active; check the startup log line.",
      "Fighting auto-configuration instead of overriding a single property or bean.",
    ],
    check: [
      { q: "What does auto-configuration do?", a: "It creates sensible beans based on the libraries on the classpath and your properties." },
      { q: "Which wins: application.yml or an environment variable?", a: "The environment variable, because it has higher precedence than packaged config files." },
    ],
  },

  "spring/spring-rest": {
    summary:
      "Spring MVC maps HTTP requests to controller methods and converts Java objects to JSON. A clean API uses resource URLs, the right HTTP methods and status codes, and DTOs instead of entities.",
    visuals: [
      {
        type: "flow",
        title: "Spring MVC request handling",
        steps: [
          { label: "HTTP request", detail: "POST /api/books with a JSON body" },
          { label: "DispatcherServlet", detail: "Front controller receives every request" },
          { label: "Handler mapping", detail: "Finds the matching @PostMapping method" },
          { label: "Controller method", detail: "JSON body bound to a DTO parameter" },
          { label: "Service and repository", detail: "Business logic and data access" },
          { label: "JSON response", detail: "Jackson writes the DTO, status code set" },
        ],
      },
      {
        type: "layers",
        title: "Typical layering",
        layers: [
          { label: "Controller", detail: "HTTP details, DTOs, status codes" },
          { label: "Service", detail: "Business rules and transactions" },
          { label: "Repository", detail: "Database access with Spring Data" },
          { label: "Database", detail: "Tables and rows" },
        ],
      },
    ],
    keyPoints: [
      "Use nouns for URLs (/books/42) and HTTP methods for actions (GET, POST, PUT, DELETE).",
      "Return 201 Created with a Location header after POST, and 404 when not found.",
      "Map entities to DTOs so you control the JSON and avoid leaking internals.",
      "Use Pageable for large collections: /books?page=0&size=20&sort=title.",
    ],
    terms: [
      { term: "@RestController", meaning: "Controller whose return values are written as the response body." },
      { term: "DTO", meaning: "Data Transfer Object shaped for the API, not the database." },
      { term: "@PathVariable", meaning: "Binds a URL segment like {id} to a parameter." },
      { term: "@RequestBody", meaning: "Binds the JSON request body to an object." },
      { term: "ResponseEntity", meaning: "Lets you set status, headers and body explicitly." },
    ],
    example: {
      lang: "java",
      code: "@RestController\n@RequestMapping(\"/api/books\")\nclass BookController {\n  private final BookService service;\n  BookController(BookService service) { this.service = service; }\n\n  @GetMapping(\"/{id}\")\n  BookDto get(@PathVariable Long id) { return service.find(id); }\n\n  @PostMapping\n  ResponseEntity<BookDto> create(@Valid @RequestBody CreateBookDto dto) {\n    BookDto saved = service.create(dto);\n    return ResponseEntity.created(URI.create(\"/api/books/\" + saved.id())).body(saved);\n  }\n}",
    },
    pitfalls: [
      "Returning JPA entities directly, causing lazy-loading errors and leaked fields.",
      "Returning 200 for everything, including errors.",
      "Verbs in URLs like /getBook instead of GET /books/{id}.",
    ],
    check: [
      { q: "What status should a successful create return?", a: "201 Created, ideally with a Location header pointing at the new resource." },
      { q: "Why use DTOs instead of entities in controllers?", a: "They decouple the API from the database model and control exactly which fields are exposed." },
    ],
  },

  "spring/spring-validation": {
    summary:
      "Bean Validation annotations declare rules on DTO fields, and @Valid makes Spring enforce them before your code runs. A global @RestControllerAdvice turns every error into the same JSON shape.",
    visuals: [
      {
        type: "flow",
        title: "When validation fails",
        steps: [
          { label: "Request arrives", detail: "JSON body with an invalid email" },
          { label: "@Valid checks DTO", detail: "Annotations like @NotBlank and @Email run" },
          { label: "Exception thrown", detail: "MethodArgumentNotValidException, controller is skipped" },
          { label: "Advice handles it", detail: "@ExceptionHandler in @RestControllerAdvice" },
          { label: "400 error body", detail: "Consistent JSON listing each bad field" },
        ],
      },
    ],
    keyPoints: [
      "Put constraints like @NotBlank, @Email, @Size and @Min on DTO fields.",
      "Add @Valid to the @RequestBody parameter or nothing is validated.",
      "Handle exceptions once in @RestControllerAdvice instead of in every controller.",
      "Return one error format everywhere, for example status, message and field errors.",
    ],
    terms: [
      { term: "Bean Validation", meaning: "Jakarta standard for declaring constraints with annotations." },
      { term: "@Valid", meaning: "Triggers validation of the annotated parameter." },
      { term: "@RestControllerAdvice", meaning: "Global exception handling for all controllers." },
      { term: "@ExceptionHandler", meaning: "Method that turns a given exception into a response." },
      { term: "ProblemDetail", meaning: "Spring's built-in RFC 7807 error body type." },
    ],
    example: {
      lang: "java",
      code: "record CreateUserDto(@NotBlank String name, @Email String email, @Min(18) int age) {}\n\n@RestControllerAdvice\nclass ApiErrors {\n  @ExceptionHandler(MethodArgumentNotValidException.class)\n  ResponseEntity<Map<String, Object>> invalid(MethodArgumentNotValidException ex) {\n    Map<String, String> fields = new HashMap<>();\n    ex.getBindingResult().getFieldErrors()\n        .forEach(e -> fields.put(e.getField(), e.getDefaultMessage()));\n    return ResponseEntity.badRequest().body(Map.of(\"status\", 400, \"errors\", fields));\n  }\n}",
    },
    pitfalls: [
      "Forgetting @Valid, so annotations are silently ignored.",
      "Returning stack traces to clients in error responses.",
      "Each controller inventing its own error JSON shape.",
    ],
    check: [
      { q: "What happens when an @Valid request body fails validation?", a: "Spring throws MethodArgumentNotValidException before the controller method runs, giving 400 by default." },
      { q: "Why use @RestControllerAdvice?", a: "It centralises exception handling so every endpoint returns the same error format." },
    ],
  },

  "spring/spring-jpa": {
    summary:
      "JPA maps Java classes to tables, and Hibernate is the implementation that generates the SQL. Spring Data JPA adds repository interfaces whose queries are derived from method names.",
    visuals: [
      {
        type: "layers",
        title: "Spring Data JPA stack",
        layers: [
          { label: "Repository interface", detail: "findByEmail declared, no implementation written" },
          { label: "Spring Data proxy", detail: "Generates the implementation at runtime" },
          { label: "Hibernate EntityManager", detail: "Tracks entities and generates SQL" },
          { label: "JDBC and pool", detail: "Sends SQL over pooled connections" },
          { label: "Database", detail: "Tables mapped from @Entity classes" },
        ],
      },
      {
        type: "compare",
        title: "N+1 problem vs fetch join",
        columns: [
          {
            title: "N+1 queries",
            points: ["1 query loads 100 authors", "100 more load each author's books", "Hidden by lazy loading", "Slow as data grows"],
          },
          {
            title: "Fetch join",
            points: ["join fetch a.books", "One query loads both", "Or use @EntityGraph", "Check SQL logs to confirm"],
          },
        ],
      },
    ],
    keyPoints: [
      "Mark classes with @Entity and the key with @Id; relations use @OneToMany and @ManyToOne.",
      "Collections are lazy by default, loaded only when first accessed.",
      "N+1 queries happen when looping over lazy relations; fix with join fetch or @EntityGraph.",
      "Turn on SQL logging in development to see the queries Hibernate actually runs.",
    ],
    terms: [
      { term: "Entity", meaning: "A class mapped to a database table." },
      { term: "Derived query", meaning: "Query generated from a method name like findByName." },
      { term: "JPQL", meaning: "Query language over entities rather than tables." },
      { term: "Lazy loading", meaning: "Related data is fetched only when accessed." },
      { term: "N+1 problem", meaning: "One query, then one extra query per row loaded." },
      { term: "Persistence context", meaning: "Hibernate's cache of managed entities in a transaction." },
    ],
    example: {
      lang: "java",
      code: "@Entity\nclass Author {\n  @Id @GeneratedValue Long id;\n  String name;\n  @OneToMany(mappedBy = \"author\") List<Book> books = new ArrayList<>();\n}\n\ninterface AuthorRepository extends JpaRepository<Author, Long> {\n  List<Author> findByNameContainingIgnoreCase(String part);\n\n  @Query(\"select distinct a from Author a join fetch a.books\")\n  List<Author> findAllWithBooks();  // one query instead of N+1\n}",
      caption: "Book has a matching @ManyToOne Author author field.",
    },
    pitfalls: [
      "Switching everything to EAGER to dodge lazy errors, loading far too much.",
      "Accessing lazy collections outside a transaction (LazyInitializationException).",
      "Using CascadeType.ALL on many-to-many, deleting shared rows.",
    ],
    check: [
      { q: "What causes the N+1 problem?", a: "Loading a list, then lazily loading a relation for each item, which runs one query per item." },
      { q: "How does findByEmail work without code?", a: "Spring Data parses the method name and generates the query at startup." },
    ],
  },

  "spring/spring-tx": {
    summary:
      "@Transactional makes a method all-or-nothing: either every database change commits, or all are rolled back. Flyway versions your schema with numbered SQL files applied in order at startup.",
    visuals: [
      {
        type: "sequence",
        title: "How @Transactional works",
        actors: ["Caller", "Spring proxy", "Your service", "Database"],
        messages: [
          { from: 0, to: 1, label: "transfer(1, 2, 100)" },
          { from: 1, to: 3, label: "BEGIN" },
          { from: 1, to: 2, label: "call real method" },
          { from: 2, to: 3, label: "UPDATE debit, UPDATE credit" },
          { from: 2, to: 1, label: "returns or throws" },
          { from: 1, to: 3, label: "COMMIT, or ROLLBACK on exception" },
          { from: 1, to: 0, label: "result" },
        ],
      },
      {
        type: "flow",
        title: "Flyway on startup",
        steps: [
          { label: "App starts", detail: "Flyway runs before JPA uses the schema" },
          { label: "Read history table", detail: "flyway_schema_history lists applied versions" },
          { label: "Find pending files", detail: "V3__add_index.sql not yet applied" },
          { label: "Apply in order", detail: "Each migration runs once, by version number" },
          { label: "Record checksum", detail: "Edited old files are detected and rejected" },
        ],
      },
    ],
    keyPoints: [
      "By default, rollback happens for unchecked exceptions, not checked ones; use rollbackFor to change that.",
      "Calling a @Transactional method from the same class skips the proxy, so no transaction starts.",
      "Default propagation REQUIRED joins an existing transaction or starts a new one.",
      "Never edit an applied Flyway migration; add a new versioned file instead.",
    ],
    terms: [
      { term: "Transaction", meaning: "Group of operations that commit or roll back together." },
      { term: "Propagation", meaning: "How a method joins or creates a surrounding transaction." },
      { term: "Rollback", meaning: "Undoing every change made in the transaction." },
      { term: "Proxy", meaning: "Spring wrapper that adds transaction logic around your bean." },
      { term: "Migration", meaning: "Versioned script that changes the schema, like V2__add_email.sql." },
    ],
    example: {
      lang: "java",
      code: "@Service\nclass TransferService {\n  private final AccountRepository accounts;\n  TransferService(AccountRepository accounts) { this.accounts = accounts; }\n\n  @Transactional\n  public void transfer(long from, long to, BigDecimal amount) {\n    accounts.debit(from, amount);\n    accounts.credit(to, amount);  // if this throws, the debit is rolled back\n  }\n}\n\n// src/main/resources/db/migration/V2__add_email.sql\n// ALTER TABLE users ADD COLUMN email TEXT;",
    },
    pitfalls: [
      "Putting @Transactional on a private method or self-invoked method, where it has no effect.",
      "Expecting a checked exception to trigger rollback by default.",
      "Letting Hibernate ddl-auto change production schemas instead of migrations.",
    ],
    check: [
      { q: "Why does self-invocation break @Transactional?", a: "The call goes directly to this, not through the Spring proxy that starts the transaction." },
      { q: "How does Flyway know what to run?", a: "It compares migration files against the versions recorded in its schema history table." },
    ],
  },

  "spring/spring-security": {
    summary:
      "Spring Security runs every request through a chain of filters that authenticate the caller and check permissions. With JWT, the client logs in once, then sends a signed token on each request.",
    visuals: [
      {
        type: "sequence",
        title: "JWT login and an authorised call",
        actors: ["Client", "Auth endpoint", "JWT filter", "Controller"],
        messages: [
          { from: 0, to: 1, label: "POST /auth/login username, password" },
          { from: 1, to: 0, label: "BCrypt hash matches: signed JWT returned" },
          { from: 0, to: 2, label: "GET /orders, Authorization: Bearer token" },
          { from: 2, to: 3, label: "signature valid: set SecurityContext" },
          { from: 3, to: 0, label: "200 OK with orders" },
        ],
      },
      {
        type: "flow",
        title: "Security filter chain",
        steps: [
          { label: "Request in", detail: "Every HTTP request enters the chain" },
          { label: "CORS and CSRF filters", detail: "Cross-origin and forgery protections" },
          { label: "Authentication filter", detail: "Reads the JWT and identifies the user" },
          { label: "Authorization check", detail: "Rules like hasRole ADMIN; else 401 or 403" },
          { label: "Controller", detail: "Runs only if every filter passes" },
        ],
      },
    ],
    keyPoints: [
      "Authentication answers who you are; authorization answers what you may do.",
      "Store only BCrypt hashes of passwords, never plain text.",
      "JWTs are signed, not encrypted; never put secrets in the payload.",
      "401 means not authenticated; 403 means authenticated but not allowed.",
    ],
    terms: [
      { term: "Filter chain", meaning: "Ordered security filters every request passes through." },
      { term: "JWT", meaning: "Signed token holding claims like user id, roles and expiry." },
      { term: "BCrypt", meaning: "Slow, salted password hashing algorithm." },
      { term: "SecurityContext", meaning: "Holds the authenticated user for the current request." },
      { term: "Role", meaning: "Named permission group, like ROLE_ADMIN." },
    ],
    example: {
      lang: "java",
      code: "@Bean\nSecurityFilterChain api(HttpSecurity http, JwtFilter jwtFilter) throws Exception {\n  return http\n      .csrf(csrf -> csrf.disable())  // stateless token API\n      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))\n      .authorizeHttpRequests(auth -> auth\n          .requestMatchers(\"/auth/**\").permitAll()\n          .requestMatchers(\"/admin/**\").hasRole(\"ADMIN\")\n          .anyRequest().authenticated())\n      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)\n      .build();\n}\n\n@Bean\nPasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }",
    },
    pitfalls: [
      "Hard-coding the JWT signing key in source code.",
      "Issuing tokens with no expiry.",
      "Disabling CSRF on a cookie-based session app, where it is still needed.",
    ],
    check: [
      { q: "What is the difference between 401 and 403?", a: "401 means the caller is not authenticated; 403 means they are known but lack permission." },
      { q: "Why hash passwords with BCrypt?", a: "It is salted and deliberately slow, so leaked hashes are hard to brute-force." },
    ],
  },

  "spring/spring-testing": {
    summary:
      "Spring offers test slices that start only part of the app, plus full @SpringBootTest integration tests. Testcontainers runs a real Postgres in Docker so repository tests match production.",
    visuals: [
      {
        type: "compare",
        title: "Choosing a Spring test type",
        columns: [
          {
            title: "@WebMvcTest",
            points: ["Loads controllers only", "Services are mocked", "Uses MockMvc, no server", "Fast"],
          },
          {
            title: "@DataJpaTest",
            points: ["Loads JPA and repositories", "Rolls back after each test", "Pair with Testcontainers", "Medium speed"],
          },
          {
            title: "@SpringBootTest",
            points: ["Loads the whole app", "Real HTTP on a random port", "Catches wiring problems", "Slowest"],
          },
        ],
      },
    ],
    keyPoints: [
      "Use slices for focused, fast tests and a few full tests for end-to-end wiring.",
      "Testcontainers starts disposable Docker databases for realistic tests.",
      "@ServiceConnection (Boot 3.1+) wires a container's URL into Spring automatically.",
      "Test secured endpoints with @WithMockUser or by sending a real token.",
    ],
    terms: [
      { term: "Test slice", meaning: "Test annotation that loads only one layer of the app." },
      { term: "MockMvc", meaning: "Sends fake HTTP requests to controllers without a server." },
      { term: "@MockitoBean", meaning: "Replaces a bean in the context with a Mockito mock." },
      { term: "Testcontainers", meaning: "Library that runs Docker containers during tests." },
      { term: "Integration test", meaning: "Test that runs several real components together." },
    ],
    example: {
      lang: "java",
      code: "@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)\n@Testcontainers\nclass OrderApiIT {\n  @Container @ServiceConnection\n  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>(\"postgres:16\");\n\n  @Autowired TestRestTemplate rest;\n\n  @Test\n  void createsOrder() {\n    var res = rest.postForEntity(\"/api/orders\", new CreateOrder(\"book\", 2), OrderDto.class);\n    assertEquals(HttpStatus.CREATED, res.getStatusCode());\n  }\n}",
    },
    pitfalls: [
      "Using H2 in tests while production runs Postgres, hiding SQL differences.",
      "Making every test a @SpringBootTest, so the suite becomes slow.",
      "Tests that share data and pass or fail depending on order.",
    ],
    check: [
      { q: "When would you pick @WebMvcTest?", a: "To test controller mapping, validation and JSON quickly, with services mocked." },
      { q: "Why use Testcontainers instead of an in-memory database?", a: "It runs the same database engine as production, so queries behave identically." },
    ],
  },

  "spring/openapi": {
    summary:
      "OpenAPI is a standard description of a REST API. springdoc-openapi generates it from your controllers, and Swagger UI turns it into interactive docs where you can try calls.",
    visuals: [
      {
        type: "flow",
        title: "From code to interactive docs",
        steps: [
          { label: "Add springdoc starter", detail: "springdoc-openapi-starter-webmvc-ui dependency" },
          { label: "App scans controllers", detail: "Reads mappings, parameters and DTO fields" },
          { label: "Spec at /v3/api-docs", detail: "Machine-readable OpenAPI JSON" },
          { label: "Swagger UI page", detail: "Browse and try endpoints at /swagger-ui.html" },
          { label: "Clients generated", detail: "Optional: generate typed clients from the spec" },
        ],
      },
    ],
    keyPoints: [
      "springdoc builds the spec automatically; annotations only add detail.",
      "Use @Operation for summaries and @ApiResponse for documented status codes.",
      "Validation annotations on DTOs show up as schema constraints.",
      "Disable or protect Swagger UI in production if the API is private.",
    ],
    terms: [
      { term: "OpenAPI", meaning: "Standard format for describing REST endpoints and schemas." },
      { term: "Swagger UI", meaning: "Web page that renders an OpenAPI spec interactively." },
      { term: "springdoc", meaning: "Library that generates OpenAPI from Spring code." },
      { term: "Schema", meaning: "Description of a request or response body's fields." },
    ],
    example: {
      lang: "java",
      code: "// pom.xml: org.springdoc:springdoc-openapi-starter-webmvc-ui\n\n@Operation(summary = \"Get a book by id\")\n@ApiResponse(responseCode = \"200\", description = \"Book found\")\n@ApiResponse(responseCode = \"404\", description = \"No book with that id\")\n@GetMapping(\"/{id}\")\nBookDto get(@PathVariable Long id) {\n  return service.find(id);\n}\n\n// Open http://localhost:8080/swagger-ui.html",
    },
    pitfalls: [
      "Leaving docs describing old behaviour by hand instead of generating them.",
      "Exposing internal admin endpoints in public docs.",
    ],
    check: [
      { q: "Where does springdoc serve the raw spec?", a: "At /v3/api-docs by default, as JSON." },
      { q: "Do you need annotations for docs to appear?", a: "No; springdoc infers endpoints automatically, and annotations only enrich descriptions." },
    ],
  },

  "production/redis": {
    summary:
      "Redis is an in-memory key-value store, often used as a cache in front of a database. Caching hot reads cuts latency and database load, but you must decide when cached data expires or is invalidated.",
    visuals: [
      {
        type: "sequence",
        title: "Cache-aside read",
        actors: ["App", "Redis", "Database"],
        messages: [
          { from: 0, to: 1, label: "GET product:42" },
          { from: 1, to: 0, label: "miss" },
          { from: 0, to: 2, label: "SELECT product 42" },
          { from: 2, to: 0, label: "row" },
          { from: 0, to: 1, label: "SET product:42 with 10 min TTL" },
          { from: 0, to: 1, label: "next request: GET product:42" },
          { from: 1, to: 0, label: "hit, no database call" },
        ],
      },
    ],
    keyPoints: [
      "@Cacheable returns the cached value if present, otherwise runs the method and stores it.",
      "@CacheEvict or @CachePut keep the cache consistent when data changes.",
      "Always set a TTL so stale entries eventually disappear.",
      "Cache data that is read often and changes rarely.",
    ],
    terms: [
      { term: "Cache hit", meaning: "The value was found in the cache." },
      { term: "Cache miss", meaning: "Not cached, so the source must be queried." },
      { term: "TTL", meaning: "Time to live: how long an entry stays before expiring." },
      { term: "Eviction policy", meaning: "Rule for removing keys when memory is full, like LRU." },
      { term: "Cache-aside", meaning: "App checks the cache first and fills it on a miss." },
    ],
    example: {
      lang: "java",
      code: "@EnableCaching\n@SpringBootApplication\nclass App {}\n\n@Service\nclass ProductService {\n  @Cacheable(value = \"products\", key = \"#id\")\n  public ProductDto find(Long id) { return repo.findById(id).map(mapper::toDto).orElseThrow(); }\n\n  @CacheEvict(value = \"products\", key = \"#dto.id()\")\n  public ProductDto update(ProductDto dto) { return mapper.toDto(repo.save(mapper.toEntity(dto))); }\n}\n\n// application.yml: spring.cache.redis.time-to-live: 10m",
    },
    pitfalls: [
      "Caching without TTL or eviction, serving stale data forever.",
      "Caching per-user data under a shared key.",
      "Calling a @Cacheable method from the same class, bypassing the proxy.",
    ],
    check: [
      { q: "What does @Cacheable do on a second call with the same key?", a: "Returns the cached value without running the method body." },
      { q: "Why invalidate on writes?", a: "Otherwise readers keep getting the old cached value until the TTL expires." },
    ],
  },

  "production/kafka": {
    summary:
      "Kafka is a distributed log for events. Producers append events to topics, which are split into partitions, and consumer groups read them independently at their own pace using offsets.",
    visuals: [
      {
        type: "sequence",
        title: "Producer, broker, consumer",
        actors: ["Producer", "Kafka broker", "Consumer (group billing)"],
        messages: [
          { from: 0, to: 1, label: "send orders, key=order-7" },
          { from: 1, to: 0, label: "ack: partition 2, offset 41" },
          { from: 2, to: 1, label: "poll partition 2" },
          { from: 1, to: 2, label: "records from offset 41" },
          { from: 2, to: 1, label: "commit offset 42 after processing" },
        ],
      },
      {
        type: "tree",
        title: "Topic and consumer group",
        root: "Topic: orders",
        children: [
          { label: "Partition 0", children: ["Consumer A reads it"] },
          { label: "Partition 1", children: ["Consumer A reads it"] },
          { label: "Partition 2", children: ["Consumer B reads it"] },
        ],
      },
    ],
    keyPoints: [
      "Events with the same key go to the same partition, so their order is kept.",
      "Within a group, each partition is read by one consumer; more consumers than partitions sit idle.",
      "Consumers commit offsets to remember progress; delivery is usually at-least-once.",
      "Make handlers idempotent and send poison messages to a dead-letter topic.",
    ],
    terms: [
      { term: "Topic", meaning: "Named stream of events, like orders." },
      { term: "Partition", meaning: "Ordered, append-only slice of a topic." },
      { term: "Offset", meaning: "Position of a record within a partition." },
      { term: "Consumer group", meaning: "Consumers sharing the work of reading a topic." },
      { term: "Dead-letter topic", meaning: "Where messages go after repeated processing failures." },
    ],
    example: {
      lang: "java",
      code: "@Service\nclass OrderEvents {\n  private final KafkaTemplate<String, OrderPlaced> kafka;\n  OrderEvents(KafkaTemplate<String, OrderPlaced> kafka) { this.kafka = kafka; }\n\n  void publish(OrderPlaced e) {\n    kafka.send(\"orders\", e.orderId(), e);  // same key, same partition\n  }\n\n  @KafkaListener(topics = \"orders\", groupId = \"billing\")\n  void onOrder(OrderPlaced e) {\n    System.out.println(\"Billing order \" + e.orderId());\n  }\n}",
    },
    pitfalls: [
      "Assuming global ordering across partitions; order holds only within one.",
      "Non-idempotent consumers that double-charge on redelivery.",
      "Retrying a bad message forever and blocking the partition.",
    ],
    check: [
      { q: "How do you keep events for one order in sequence?", a: "Use the order id as the key so all its events land in the same partition." },
      { q: "What happens with 3 partitions and 5 consumers in one group?", a: "Only 3 consumers get a partition; the other 2 stay idle as standbys." },
    ],
  },

  "production/microservices": {
    summary:
      "Microservices split a system into small services that deploy independently and own their data. That buys team autonomy and scaling, at the cost of network failures and distributed data to manage.",
    visuals: [
      {
        type: "compare",
        title: "Monolith vs microservices",
        columns: [
          {
            title: "Monolith",
            points: ["One deployable unit", "Simple local calls and transactions", "Easy to start and debug", "Scales as one block"],
          },
          {
            title: "Microservices",
            points: ["Many small deployable services", "Network calls that can fail", "Independent deploys and scaling", "Needs gateway, discovery, monitoring"],
          },
        ],
      },
      {
        type: "cycle",
        title: "Circuit breaker states",
        steps: [
          { label: "Closed", detail: "Calls flow normally while failures are counted" },
          { label: "Open", detail: "Failure rate too high: fail fast, use fallback" },
          { label: "Half-open", detail: "After a wait, allow a few trial calls" },
          { label: "Back to closed", detail: "Trial calls succeed; otherwise reopen" },
        ],
      },
    ],
    keyPoints: [
      "An API gateway is the single entry point that routes, authenticates and rate limits.",
      "Service discovery lets services find each other without hard-coded addresses.",
      "Circuit breakers stop one slow service from dragging down its callers.",
      "Sagas replace distributed transactions with local steps plus compensating actions.",
    ],
    terms: [
      { term: "API gateway", meaning: "Front door that routes client requests to services." },
      { term: "Service discovery", meaning: "Registry that maps service names to live instances." },
      { term: "Circuit breaker", meaning: "Stops calling a failing dependency for a while." },
      { term: "Saga", meaning: "Sequence of local transactions with compensations on failure." },
      { term: "Resilience4j", meaning: "Java library for circuit breakers, retries and rate limits." },
    ],
    example: {
      lang: "java",
      code: "@Service\nclass StockChecker {\n  private final InventoryClient inventory;\n  StockChecker(InventoryClient inventory) { this.inventory = inventory; }\n\n  @CircuitBreaker(name = \"inventory\", fallbackMethod = \"stockUnknown\")\n  public Stock check(String sku) {\n    return inventory.getStock(sku);  // remote HTTP call\n  }\n\n  private Stock stockUnknown(String sku, Throwable ex) {\n    return Stock.unknown(sku);  // degrade instead of failing\n  }\n}",
    },
    pitfalls: [
      "Splitting into microservices too early, before the domain is understood.",
      "Several services sharing one database, coupling them tightly.",
      "Chains of synchronous calls with no timeouts.",
    ],
    check: [
      { q: "What does an open circuit breaker do?", a: "It fails calls immediately or uses a fallback instead of waiting on a failing service." },
      { q: "Why use a saga instead of one database transaction?", a: "Each service owns its own database, so you coordinate local transactions and undo with compensations." },
    ],
  },

  "production/java-docker": {
    summary:
      "Docker packages your Spring Boot jar and a Java runtime into one image that runs the same everywhere. A multi-stage build compiles with a JDK but ships only a smaller JRE image.",
    visuals: [
      {
        type: "flow",
        title: "Multi-stage Docker build",
        steps: [
          { label: "Build stage", detail: "JDK image with Maven wrapper" },
          { label: "Package jar", detail: "./mvnw package produces the fat jar" },
          { label: "Runtime stage", detail: "Fresh, smaller JRE image" },
          { label: "Copy jar only", detail: "No source code or build tools shipped" },
          { label: "Run container", detail: "docker compose up with Postgres" },
        ],
      },
      {
        type: "layers",
        title: "Layered jar inside the image",
        layers: [
          { label: "Application classes", detail: "Changes on almost every commit" },
          { label: "Snapshot dependencies", detail: "Changes sometimes" },
          { label: "Spring Boot loader", detail: "Rarely changes" },
          { label: "Dependencies", detail: "Third-party jars, cached between builds" },
          { label: "Base JRE image", detail: "eclipse-temurin:21-jre" },
        ],
      },
    ],
    keyPoints: [
      "Multi-stage builds keep compilers and source out of the final image.",
      "Layered jars put rarely changing dependencies in early, cached layers.",
      "Pass configuration through environment variables, not baked-in files.",
      "In Compose, services reach each other by service name, e.g. jdbc:postgresql://db:5432/app.",
    ],
    terms: [
      { term: "Image", meaning: "Read-only template containing app and runtime." },
      { term: "Container", meaning: "A running instance of an image." },
      { term: "Multi-stage build", meaning: "Dockerfile with separate build and runtime stages." },
      { term: "Layer", meaning: "Cached filesystem change created by one Dockerfile step." },
      { term: "Docker Compose", meaning: "Tool that runs several containers from one YAML file." },
    ],
    example: {
      lang: "dockerfile",
      code: "FROM eclipse-temurin:21-jdk AS build\nWORKDIR /app\nCOPY . .\nRUN ./mvnw -q package -DskipTests\n\nFROM eclipse-temurin:21-jre\nWORKDIR /app\nCOPY --from=build /app/target/*.jar app.jar\nEXPOSE 8080\nENTRYPOINT [\"java\", \"-jar\", \"app.jar\"]",
      caption: "Build with docker build -t my-api . and run with docker run -p 8080:8080 my-api",
    },
    pitfalls: [
      "Shipping the full JDK and source code in the runtime image.",
      "Using localhost for the database inside a container instead of the service name.",
      "Copying all source before dependencies, so every change re-downloads them.",
    ],
    check: [
      { q: "Why use a multi-stage build?", a: "The final image has only the JRE and jar, so it is smaller and safer." },
      { q: "Why split a jar into layers?", a: "Docker can reuse cached dependency layers and rebuild only the small app layer." },
    ],
  },

  "production/actuator": {
    summary:
      "Spring Boot Actuator adds endpoints for health, info and metrics. Micrometer records metrics in a vendor-neutral way, and Prometheus scrapes them so Grafana can graph and alert.",
    visuals: [
      {
        type: "flow",
        title: "From app to dashboard",
        steps: [
          { label: "Micrometer records", detail: "Request timers, JVM memory, custom counters" },
          { label: "Actuator exposes", detail: "/actuator/prometheus in text format" },
          { label: "Prometheus scrapes", detail: "Pulls metrics every 15 seconds or so" },
          { label: "Grafana graphs", detail: "Dashboards for latency, errors, traffic" },
          { label: "Alerts fire", detail: "Notify when error rate or latency spikes" },
        ],
      },
    ],
    keyPoints: [
      "Only health is exposed over HTTP by default; opt in to other endpoints.",
      "Liveness and readiness probes tell Kubernetes when to restart or route traffic.",
      "Micrometer works like SLF4J for metrics: one API, many backends.",
      "Never expose sensitive endpoints like env or heapdump publicly.",
    ],
    terms: [
      { term: "Actuator", meaning: "Spring Boot module adding operational endpoints." },
      { term: "Micrometer", meaning: "Metrics facade used by Spring Boot." },
      { term: "Counter", meaning: "Metric that only goes up, like requests served." },
      { term: "Timer", meaning: "Metric measuring how long operations take." },
      { term: "Scrape", meaning: "Prometheus pulling metrics from an HTTP endpoint." },
    ],
    example: {
      lang: "yaml",
      code: "# application.yml (needs micrometer-registry-prometheus)\nmanagement:\n  endpoints:\n    web:\n      exposure:\n        include: health,info,prometheus\n  endpoint:\n    health:\n      probes:\n        enabled: true\n\n# Custom metric in Java:\n# meterRegistry.counter(\"orders.created\").increment();",
    },
    pitfalls: [
      "Exposing all endpoints with include: \"*\" on a public port.",
      "Using unbounded values like user ids as metric tags.",
    ],
    check: [
      { q: "Which endpoint does Prometheus scrape?", a: "/actuator/prometheus, once the Prometheus registry is on the classpath and exposed." },
      { q: "What is a readiness probe for?", a: "It tells the platform whether the app can receive traffic right now." },
    ],
  },

  "java-capstone/java-capstone": {
    summary:
      "The capstone combines everything into one deployable backend, such as a booking or expense API. A finished repo with auth, tests, caching, Docker and CI is strong evidence in interviews.",
    visuals: [
      {
        type: "layers",
        title: "Capstone architecture",
        layers: [
          { label: "Security filter chain", detail: "JWT authentication and role checks" },
          { label: "REST controllers", detail: "DTOs, validation, error handling, OpenAPI" },
          { label: "Services", detail: "Business rules inside @Transactional methods" },
          { label: "Redis cache", detail: "Hot reads like listing available rooms" },
          { label: "JPA repositories", detail: "Entities, relations, fetch joins" },
          { label: "PostgreSQL", detail: "Schema versioned by Flyway migrations" },
        ],
      },
      {
        type: "flow",
        title: "Suggested build order",
        steps: [
          { label: "Design domain", detail: "Entities, endpoints and rules on paper" },
          { label: "Entities and migrations", detail: "JPA mappings plus Flyway V1 schema" },
          { label: "CRUD endpoints and tests", detail: "Unit tests and Testcontainers integration tests" },
          { label: "Add security", detail: "Login, JWT, roles on endpoints" },
          { label: "Add caching", detail: "Redis for the most read endpoint" },
          { label: "Docker and CI", detail: "Compose file and a pipeline running tests" },
        ],
      },
    ],
    keyPoints: [
      "Keep scope small but finished: a few resources done well beat many half-built ones.",
      "Write a README with setup steps, an architecture diagram and example requests.",
      "CI should build, run all tests and build the Docker image on every push.",
      "Be ready to explain each design choice and what you would change at scale.",
    ],
    terms: [
      { term: "Domain model", meaning: "The entities and rules your app is about." },
      { term: "CI pipeline", meaning: "Automated build and tests on every push." },
      { term: "Seed data", meaning: "Sample rows that make the app easy to demo." },
      { term: "README", meaning: "Front page explaining what the project is and how to run it." },
    ],
    example: {
      lang: "yaml",
      code: "# .github/workflows/ci.yml\nname: ci\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-java@v4\n        with:\n          distribution: temurin\n          java-version: 21\n          cache: maven\n      - run: ./mvnw -B verify\n      - run: docker build -t booking-api .",
      caption: "Testcontainers runs on GitHub-hosted Ubuntu runners because Docker is available.",
    },
    pitfalls: [
      "Starting with microservices instead of one well-structured service.",
      "No tests or a broken setup, so reviewers cannot run it.",
      "Committing secrets such as the JWT key or database password.",
    ],
    check: [
      { q: "What should CI do for this project?", a: "Build the code, run unit and integration tests, and build the Docker image on every push." },
      { q: "Why put a cache on only one endpoint at first?", a: "To show measurable impact on a hot read without adding invalidation complexity everywhere." },
    ],
  },
};

export default explainers;
