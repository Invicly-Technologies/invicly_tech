import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "java-core/java-syntax": {
    plain: [
      "To write Java you install a JDK (Java Development Kit). It contains javac, the compiler, and java, the program that starts the JVM. You write code in a .java file, the compiler checks it, and the JVM runs it. Use a long-term support (LTS) version such as Java 21 or Java 25, because they get updates for years.",
      "Java is strict about types. When you write int age = 30, the variable age can only ever hold whole numbers. If you try to put text in it, the compiler stops you before the program even runs. This feels slow at first, but it catches many bugs early.",
      "A Java program is made of classes, and classes contain methods. A method is a named block of code, like a small machine: values go in, a result may come out. The JVM starts your program by calling a special method named main.",
      "Inside methods you make decisions with if and switch, and you repeat work with for and while loops. Arrays hold a fixed number of values of one type. With just these tools you can already solve many small puzzles, and that practice is the fastest way to get comfortable.",
    ],
    deepDive: [
      {
        heading: "Installing a JDK and three ways to run code",
        body: "Any OpenJDK build works the same way. Popular free builds are Eclipse Temurin, Amazon Corretto and Oracle OpenJDK. On Linux and macOS, SDKMAN (sdk install java) makes switching versions easy. Check your setup with java -version and javac -version, and set JAVA_HOME so build tools find the right JDK.\n\nThere are three common ways to run code. The classic way compiles with javac Main.java and runs with java Main. Since Java 11 you can skip the separate step: java Main.java compiles in memory and runs at once, which is perfect for exercises. For one-line experiments, jshell gives you an interactive prompt where each line runs immediately.",
        bullets: ["java -version prints the runtime version", "javac -d out Main.java puts .class files in out/", "java -cp out Main runs a compiled class", "jshell then /exit to leave"],
        visual: {
          type: "compare",
          title: "Three ways to run Java",
          columns: [
            { title: "javac + java", points: ["Two steps: compile, then run", "Leaves .class files on disk", "How build tools work", "Needed for multi-file projects"] },
            { title: "java Main.java", points: ["One step, compiles in memory", "Java 11 and later", "Great for single-file exercises", "No .class files left behind"] },
            { title: "jshell", points: ["Interactive prompt", "No class or main needed", "Instant feedback per line", "Best for trying an API"] },
          ],
        },
      },
      {
        heading: "Primitive numbers: sizes, overflow and decimals",
        body: "Each primitive has a fixed size. An int is 32 bits and holds about plus or minus 2.1 billion. A long is 64 bits; write long literals with an L, like 3_000_000_000L. When an int goes past its maximum, it does not crash. It silently wraps around: Integer.MAX_VALUE + 1 equals Integer.MIN_VALUE. Use Math.addExact or Math.multiplyExact when you want an ArithmeticException instead.\n\nDecimals use double, which stores numbers in binary. Many decimal values, like 0.1, cannot be stored exactly, so 0.1 + 0.2 prints 0.30000000000000004. That is fine for physics, but not for money. For money, use long cents or BigDecimal.",
        bullets: ["byte 8 bits, short 16, int 32, long 64", "float 32 bits, double 64 bits", "char is a 16-bit UTF-16 code unit", "Underscores in literals are allowed: 1_000_000"],
      },
      {
        heading: "Strings are immutable objects",
        body: "A String is an object, not a primitive, and it can never change after it is created. Methods like toUpperCase() or replace() return a new String and leave the old one untouched. So s.trim() on its own line does nothing useful; you must write s = s.trim().\n\nBecause every change makes a new object, building a long string with += inside a loop creates lots of garbage. Use StringBuilder for that: append in the loop, then call toString() once. String literals with the same text share one object in the string pool, which is why == sometimes seems to work on strings and then fails on text read from a user or a file. Always compare text with equals(), or equalsIgnoreCase() when case should not matter.",
        bullets: ["Text blocks (Java 15) use triple quotes for multi-line strings", "String.format(\"%.2f\", x) prints two decimals", "s.isBlank() is true for empty or whitespace-only text", "String.valueOf(42) and Integer.parseInt(\"42\") convert both ways"],
      },
      {
        heading: "Methods, arrays and pass-by-value",
        body: "Java always passes arguments by value. For a primitive, the method gets a copy of the number, so changing it inside the method does not affect the caller. For an object or array, the method gets a copy of the reference. Both references point to the same array, so writing arr[0] = 99 inside the method is visible to the caller. But assigning a brand new array to the parameter only changes the local copy.\n\nArrays have a fixed length, read from the length field (no brackets). New arrays are filled with default values: 0 for numbers, false for boolean, and null for objects. Arrays.toString(arr) prints the contents, Arrays.sort(arr) sorts in place, and Arrays.copyOf makes a bigger copy when you need to grow.",
        bullets: ["int[] a = new int[5] creates five zeros", "a.length, but s.length() for a String", "Overloading: same method name, different parameter types"],
      },
      {
        heading: "Control flow details that trip people up",
        body: "Conditions must be boolean. Java has no truthy values, so if (count) does not compile; write if (count > 0). The operators && and || short-circuit: in if (s != null && s.length() > 3), the length check only runs when s is not null.\n\nThe classic switch with colons falls through to the next case unless you write break. The arrow form (case 1 ->) never falls through and can return a value as a switch expression. When a branch needs several statements, use a block and give back the value with yield. Loops come in four shapes: classic for, the enhanced for-each, while, and do-while, which always runs its body at least once. break leaves a loop and continue skips to the next round.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "How a classic for loop runs",
        steps: [
          { label: "Init", detail: "int i = 0 runs once, before anything else" },
          { label: "Check condition", detail: "If i < n is false, the loop ends" },
          { label: "Run body", detail: "The statements inside the braces" },
          { label: "Update", detail: "i++ runs, then back to the check" },
        ],
      },
      {
        type: "compare",
        title: "Old switch statement vs switch expression",
        columns: [
          { title: "case X: (statement)", points: ["Falls through without break", "Does not return a value", "Easy to forget a break", "Still valid in all Java versions"] },
          { title: "case X -> (expression)", points: ["Never falls through", "Returns a value directly", "Several labels: case 1, 2 ->", "Use yield inside a block"] },
        ],
      },
    ],
    examples: [
      {
        title: "A small console program with a method and a loop",
        explanation: "Goal: print a Celsius to Fahrenheit table from 0 to 100 in steps of 20. Step 1: put the formula in its own method so it can be tested and reused. Step 2: loop with a step of 20 instead of 1. Step 3: format the output with printf so the columns line up. Note the 9.0: with 9 / 5 in int maths you would get 1, not 1.8. Run it with java Table.java.",
        code: {
          lang: "java",
          code: `public class Table {
  static double toFahrenheit(double c) {
    return c * 9.0 / 5 + 32;
  }

  public static void main(String[] args) {
    for (int c = 0; c <= 100; c += 20) {
      System.out.printf("%3d C = %5.1f F%n", c, toFahrenheit(c));
    }
  }
}
// Output starts:   0 C =  32.0 F`,
        },
      },
      {
        title: "Adding up prices without rounding errors",
        explanation: "A shop adds ten items costing 0.10 each and expects 1.00, but a double total prints 0.9999999999999999. Step 1: notice the cause: 0.1 has no exact binary form. Step 2: switch to BigDecimal and create it from a String, not from a double, so the value is exact. Step 3: use add() because BigDecimal is immutable, just like String. Many teams instead store whole cents in a long, which is fast and also exact.",
        code: {
          lang: "java",
          code: `import java.math.BigDecimal;

public class Prices {
  public static void main(String[] args) {
    double d = 0;
    for (int i = 0; i < 10; i++) d += 0.10;
    System.out.println(d);              // 0.9999999999999999

    BigDecimal total = BigDecimal.ZERO;
    BigDecimal price = new BigDecimal("0.10");
    for (int i = 0; i < 10; i++) total = total.add(price);
    System.out.println(total);          // 1.00
  }
}`,
        },
      },
    ],
    cheatSheet: [
      "java Main.java runs a single source file directly (Java 11+)",
      "int holds about plus or minus 2.1 billion; use long for bigger whole numbers",
      "7 / 2 is 3, 7 % 2 is 1, 7 / 2.0 is 3.5",
      "Compare text with equals(); == compares references",
      "Use StringBuilder to build strings inside loops",
      "Arrays.toString(arr) prints an array; arr.length gives its size",
      "Arrow switch never falls through; use yield to return from a block",
      "Use BigDecimal (from a String) or long cents for money, never double",
    ],
    quiz: [
      {
        q: "What does Integer.MAX_VALUE + 1 evaluate to?",
        options: ["It throws ArithmeticException", "Integer.MIN_VALUE", "It becomes a long automatically", "Integer.MAX_VALUE"],
        answer: 1,
        why: "int arithmetic wraps around silently on overflow; only methods like Math.addExact throw.",
      },
      {
        q: "A method sets arr[0] = 5 on an int[] it received as a parameter. What does the caller see?",
        options: ["Nothing changes, Java passes by value", "A compile error", "A copy of the array was changed", "arr[0] is now 5 in the caller's array too"],
        answer: 3,
        why: "The method got a copy of the reference, which still points to the same array object.",
      },
      {
        q: "Which line compiles in Java?",
        options: ["if (count > 0) { ... }", "if (count) { ... }", "if (count = 1) { ... }", "if count > 0 then { ... }"],
        answer: 0,
        why: "Java conditions must be boolean expressions, and an int is not a boolean.",
      },
      {
        q: "What does s.trim(); on its own line do to the String s?",
        options: ["Removes spaces from s in place", "Throws if s has no spaces", "Nothing to s, because Strings are immutable and the result is thrown away", "Converts s to a StringBuilder"],
        answer: 2,
        why: "trim() returns a new String; you must assign it, as in s = s.trim().",
      },
      {
        q: "Which loop always runs its body at least once?",
        options: ["for", "while", "for-each", "do-while"],
        answer: 3,
        why: "do-while checks its condition after the body, so the first run always happens.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a program that prints the numbers 1 to 20, but prints Fizz for multiples of 3, Buzz for multiples of 5 and FizzBuzz for multiples of both.",
        hint: "Check the 15 case first, and use the % operator.",
        solution: "public class Fizz {\n  public static void main(String[] args) {\n    for (int i = 1; i <= 20; i++) {\n      if (i % 15 == 0) System.out.println(\"FizzBuzz\");\n      else if (i % 3 == 0) System.out.println(\"Fizz\");\n      else if (i % 5 == 0) System.out.println(\"Buzz\");\n      else System.out.println(i);\n    }\n  }\n}",
      },
      {
        level: "medium",
        task: "Write a method static int[] reversed(int[] a) that returns a new reversed array without changing the original, and print both arrays.",
        hint: "Create a new array of the same length and fill it from the end of the original.",
        solution: "static int[] reversed(int[] a) {\n  int[] r = new int[a.length];\n  for (int i = 0; i < a.length; i++) {\n    r[i] = a[a.length - 1 - i];\n  }\n  return r;\n}\n// int[] a = {1, 2, 3};\n// System.out.println(Arrays.toString(a) + \" \" + Arrays.toString(reversed(a)));",
      },
      {
        level: "hard",
        task: "Write static boolean isPalindrome(String s) that ignores case and any character that is not a letter or digit, so \"A man, a plan, a canal: Panama\" returns true. Do it without creating a new String.",
        hint: "Use two indexes moving toward each other and Character.isLetterOrDigit.",
        solution: "static boolean isPalindrome(String s) {\n  int i = 0, j = s.length() - 1;\n  while (i < j) {\n    char a = s.charAt(i), b = s.charAt(j);\n    if (!Character.isLetterOrDigit(a)) { i++; continue; }\n    if (!Character.isLetterOrDigit(b)) { j--; continue; }\n    if (Character.toLowerCase(a) != Character.toLowerCase(b)) return false;\n    i++; j--;\n  }\n  return true;\n}",
      },
    ],
    faq: [
      { q: "Which Java version should a beginner install in 2026?", a: "Install a current LTS release, Java 21 or Java 25. Both are supported by Spring Boot and all major tools, and everything in this path works on Java 21." },
      { q: "What is the difference between the JDK and the JRE?", a: "The JDK is the full kit for developers: compiler, JVM and tools. The JRE was only the runtime; modern Java ships just the JDK, and apps often bundle a trimmed runtime made with jlink." },
      { q: "Why does my program say \"Could not find or load main class\"?", a: "Usually the class name and file name do not match, you ran it from the wrong folder, or the classpath is wrong. Check that public class Main lives in Main.java and run java from the folder that contains the compiled classes." },
      { q: "Should I use var for local variables?", a: "var (Java 10) lets the compiler infer the type, as in var list = new ArrayList<String>(). Use it when the type is obvious from the right side, and write the type when it helps the reader." },
    ],
  },

  "java-core/java-oop": {
    plain: [
      "A class is a blueprint. It says what data an object holds (fields) and what it can do (methods). When you write new BankAccount(), Java builds one object from that blueprint. You can make thousands of objects from one class, and each keeps its own data.",
      "Encapsulation means an object guards its own data. You make fields private and offer methods like deposit() that check the rules first. Then no other code can set the balance to minus one million by accident. The object stays valid all the time.",
      "An interface is a promise: any class that implements it must provide certain methods. Code that only depends on the interface works with every class that keeps the promise. This is polymorphism: the same call, many behaviours.",
      "Inheritance lets one class extend another and reuse its code. It is powerful but ties the two classes tightly together. Composition, where an object simply holds other objects and asks them to do work, is usually more flexible. Most modern Java code uses small interfaces plus composition, and inheritance only for true is-a cases.",
    ],
    deepDive: [
      {
        heading: "Constructors, this and static",
        body: "A constructor runs when you call new and must leave the object in a valid state. If you write no constructor, Java adds an empty one with no parameters. As soon as you write any constructor, that free one disappears. One constructor can call another with this(...), which avoids repeating code, and a subclass constructor calls its parent with super(...) on its first line.\n\nMark fields final when they should never change after construction; the compiler then insists that every constructor sets them. Fields and methods marked static belong to the class itself, not to any one object. A static counter is shared by all objects, and a static method cannot read instance fields because there is no this.",
        bullets: ["Fields get default values: 0, false or null", "Validate arguments in the constructor and throw early", "Static factory methods like Money.of(...) can have clear names"],
      },
      {
        heading: "Access modifiers from closed to open",
        body: "Java has four access levels. private means only code inside the same class can see the member. With no keyword at all you get package-private: any class in the same package can see it, which is handy for tests and helpers. protected adds subclasses in other packages. public means everyone.\n\nA good default is: fields private, methods as closed as possible, and only the real API public. Getters are not automatically good. Adding getX and setX for every field just moves the rules out of the object. Prefer methods that express intent, like account.withdraw(50), over setBalance(balance - 50) written by the caller.",
        visual: {
          type: "layers",
          title: "Who can see a member",
          layers: [
            { label: "public", detail: "Any class, in any package" },
            { label: "protected", detail: "Same package, plus subclasses anywhere" },
            { label: "package-private (no keyword)", detail: "Only classes in the same package" },
            { label: "private", detail: "Only code inside the same class" },
          ],
        },
      },
      {
        heading: "Interfaces vs abstract classes today",
        body: "Since Java 8 an interface can contain default methods (with a body) and static methods, and since Java 9 private helper methods too. What it cannot hold is instance state: any fields are automatically public static final constants. A class can implement many interfaces but extend only one class.\n\nAn abstract class can have constructors, protected fields and partly finished logic, and it cannot be created with new. Use it when several closely related classes share real state and code, such as a template where subclasses fill in one step. Use an interface to describe a capability that unrelated classes may offer, like Comparable or Runnable. When in doubt, start with an interface; you can add a small abstract base class behind it later.",
        bullets: ["interface: many per class, no instance fields", "abstract class: one parent, can hold state", "default methods let you add to an interface without breaking implementers"],
      },
      {
        heading: "How polymorphism really works",
        body: "When you call shape.area(), the JVM looks at the actual object at run time and runs that class's version. This is called dynamic dispatch, and it is why a List of Shape can hold circles and squares that each compute their own area. Always add @Override on overriding methods: if you misspell the name or get a parameter type wrong, the compiler tells you instead of silently creating a new method.\n\nOverloading is different. Methods with the same name but different parameters are chosen at compile time, using the declared types of the arguments. Static methods and fields are not polymorphic either: a static method in a subclass hides the parent one, and the choice depends on the declared type, not the object.",
      },
      {
        heading: "The equals and hashCode contract",
        body: "By default equals() means same object, which is rarely what you want for value-like classes such as Money or Email. If you override equals, the rules are: an object equals itself, a.equals(b) matches b.equals(a), equality is transitive, and the answer does not change over time. And equal objects must return the same hashCode().\n\nHashMap and HashSet first use hashCode() to pick a bucket and only then call equals() inside it. If two equal objects have different hash codes, they land in different buckets and contains() returns false. Build both methods from the same fields, using Objects.equals and Objects.hash, or let your IDE or a record generate them. Avoid mutable fields in them: if a field changes while the object is inside a HashSet, it gets lost.",
        visual: {
          type: "flow",
          title: "What set.contains(x) does",
          steps: [
            { label: "x.hashCode()", detail: "Turn the object into an int" },
            { label: "Pick bucket", detail: "The hash decides which bucket to search" },
            { label: "Compare in bucket", detail: "Call equals() on each entry there" },
            { label: "Answer", detail: "true only if equals() matched in that bucket" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Composition: a Car delegates to its Engine",
        actors: ["Driver code", "Car", "Engine"],
        messages: [
          { from: 0, to: 1, label: "car.start()" },
          { from: 1, to: 2, label: "engine.ignite()" },
          { from: 2, to: 1, label: "running" },
          { from: 1, to: 0, label: "started" },
        ],
      },
    ],
    examples: [
      {
        title: "Encapsulating a bank account",
        explanation: "Requirement: the balance can never go negative. Step 1: make the balance private so nothing outside can write to it. Step 2: offer deposit and withdraw methods that check the rule before changing state. Step 3: expose a read-only getter. Now every BankAccount object is always valid, and the rule lives in exactly one place instead of in every caller.",
        code: {
          lang: "java",
          code: `public class BankAccount {
  private final String owner;
  private long balanceCents;
  public BankAccount(String owner) { this.owner = owner; }
  public void deposit(long cents) {
    if (cents <= 0) throw new IllegalArgumentException("amount must be positive");
    balanceCents += cents;
  }
  public void withdraw(long cents) {
    if (cents > balanceCents) throw new IllegalStateException("insufficient funds");
    balanceCents -= cents;
  }
  public long balanceCents() { return balanceCents; }
}`,
        },
      },
      {
        title: "When inheritance breaks: counting adds in a HashSet",
        explanation: "You want a set that counts how many elements were ever added. Extending HashSet and overriding both add and addAll looks natural, but addAll in the parent calls add for each element, so every element is counted twice. Your class depends on hidden details of its parent. The fix is composition: wrap a Set in a field, implement the counting yourself and delegate the real work. The wrapper no longer cares how the inner set is built.",
        code: {
          lang: "java",
          code: `class CountingSet<E> {
  private final Set<E> inner = new HashSet<>();
  private int addCount = 0;

  public boolean add(E e) { addCount++; return inner.add(e); }

  public boolean addAll(Collection<? extends E> c) {
    addCount += c.size();
    return inner.addAll(c);   // inner's internals no longer matter
  }

  public int addCount() { return addCount; }
  public boolean contains(Object o) { return inner.contains(o); }
}`,
        },
      },
    ],
    cheatSheet: [
      "Fields private, methods as closed as possible, only the real API public",
      "Writing any constructor removes the free no-argument constructor",
      "Put @Override on every overriding method so typos become compile errors",
      "Override equals and hashCode together, built from the same fields",
      "Overloading is chosen at compile time; overriding is chosen at run time",
      "A class extends one class but can implement many interfaces",
      "Prefer composition (has-a) unless the subclass truly is-a parent",
    ],
    quiz: [
      {
        q: "A class has fields but you wrote only Person(String name). What happens with new Person()?",
        options: ["It compiles and sets name to null", "Compile error: no such constructor", "It calls the Object constructor", "Runtime exception"],
        answer: 1,
        why: "Java adds the free no-argument constructor only when you write no constructor at all.",
      },
      {
        q: "Which access level lets classes in the same package see a member, but not subclasses in other packages?",
        options: ["private", "protected", "public", "package-private (no modifier)"],
        answer: 3,
        why: "No modifier means package-private; protected would also include subclasses elsewhere.",
      },
      {
        q: "Two Point objects are equal by equals() but have different hashCode() values. What breaks?",
        options: ["HashSet may store both and contains() may return false", "Nothing, hashCode is optional", "The code does not compile", "Only TreeSet is affected"],
        answer: 0,
        why: "Hash-based collections pick the bucket by hashCode, so equal objects end up in different buckets.",
      },
      {
        q: "What can an abstract class have that an interface cannot?",
        options: ["Static methods", "Default method bodies", "Instance fields and constructors", "Multiple implementers"],
        answer: 2,
        why: "Interfaces can have static and default methods but no instance state or constructors.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a class Temperature with a private double celsius, a constructor that rejects values below -273.15, and a method toFahrenheit().",
        hint: "Throw IllegalArgumentException from the constructor.",
        solution: "public class Temperature {\n  private final double celsius;\n  public Temperature(double celsius) {\n    if (celsius < -273.15) throw new IllegalArgumentException(\"below absolute zero\");\n    this.celsius = celsius;\n  }\n  public double toFahrenheit() { return celsius * 9 / 5 + 32; }\n}",
      },
      {
        level: "medium",
        task: "Define an interface Discount with double apply(double price). Write two implementations, PercentOff and FixedOff, and a Checkout class that receives a Discount in its constructor.",
        hint: "Checkout should only know the interface, so a new discount type needs no change to Checkout.",
        solution: "interface Discount { double apply(double price); }\nrecord PercentOff(double pct) implements Discount {\n  public double apply(double p) { return p * (1 - pct / 100); }\n}\nrecord FixedOff(double amount) implements Discount {\n  public double apply(double p) { return Math.max(0, p - amount); }\n}\nclass Checkout {\n  private final Discount discount;\n  Checkout(Discount d) { this.discount = d; }\n  double total(double price) { return discount.apply(price); }\n}",
      },
      {
        level: "hard",
        task: "Write a class Email that stores an address and implements equals, hashCode and toString so that \"A@x.com\" and \"a@x.com\" are equal. Prove it works in a HashSet.",
        hint: "Normalise the value once in the constructor, then base equals and hashCode on that one field.",
        solution: "public final class Email {\n  private final String value;\n  public Email(String raw) { this.value = raw.trim().toLowerCase(); }\n  @Override public boolean equals(Object o) {\n    return o instanceof Email e && value.equals(e.value);\n  }\n  @Override public int hashCode() { return value.hashCode(); }\n  @Override public String toString() { return value; }\n}\n// Set<Email> s = new HashSet<>(List.of(new Email(\"A@x.com\")));\n// s.contains(new Email(\"a@x.com\"))  -> true",
      },
    ],
    faq: [
      { q: "Should every field have a getter and a setter?", a: "No. Add only what callers really need. Setters for everything break encapsulation, because the rules then live in every caller instead of in the class." },
      { q: "Why does Java not allow extending two classes?", a: "Multiple inheritance of state causes conflicts when both parents define the same field or method. Java allows many interfaces instead, and resolves default method clashes by forcing you to override." },
      { q: "When should I use an abstract class instead of an interface?", a: "When several closely related classes share real fields and code, such as a template method. For describing what a type can do, prefer an interface." },
      { q: "Is a record a replacement for classes?", a: "Records replace simple immutable data classes. Classes with changing state, complex behaviour or inheritance needs are still written as normal classes." },
    ],
  },

  "java-core/java-exceptions": {
    plain: [
      "An exception is Java's way of saying something went wrong and the current method cannot continue normally. Instead of returning a strange value like -1, the method throws an exception object. It flies up through the callers until some code catches it and decides what to do.",
      "Some exceptions are checked. The compiler forces you to either catch them or say throws in the method signature, because they describe things outside your control, like a missing file. Others are unchecked. They usually mean a bug, such as using a null reference, and the compiler does not force you to handle them.",
      "Files, network connections and database connections must be closed after use. try-with-resources does this for you: you open the resource in the try header, and Java closes it at the end, even if an exception happens in the middle.",
      "Generics let you write one class or method that works for many types while the compiler still checks them. A List<String> only accepts strings, so you never need risky casts. Bounds and wildcards, like <T extends Number>, let you say which types are allowed.",
    ],
    deepDive: [
      {
        heading: "How an exception travels",
        body: "When code throws, Java stops the current method and looks for a matching catch block in it. If there is none, the method ends and the exception moves to the caller, and so on up the call stack. This is called stack unwinding. If nothing catches it, the thread dies and the stack trace is printed. In a web app, the framework catches it at the top and returns an error response.\n\nCatch blocks are checked from top to bottom, so put specific types before general ones; the compiler rejects a catch that can never be reached. A finally block runs whether or not an exception happened, which is why it was used for cleanup before try-with-resources. One catch can handle several unrelated types: catch (IOException | SQLException e).",
        visual: {
          type: "flow",
          title: "An exception unwinding the call stack",
          steps: [
            { label: "readConfig() throws", detail: "IOException: file not found" },
            { label: "loadSettings() has no catch", detail: "Its finally block runs, then it exits" },
            { label: "startApp() catches", detail: "catch (IOException e) matches" },
            { label: "Handle", detail: "Log it and use default settings" },
            { label: "Program continues", detail: "Code after the catch runs normally" },
          ],
        },
      },
      {
        heading: "try-with-resources in detail",
        body: "Any object that implements AutoCloseable can go in the try header. When the block ends, Java calls close() on each resource in reverse order of opening, so a statement is closed before its connection. If the body throws and close() also throws, the body's exception wins and the close failure is attached to it as a suppressed exception; you can read it with getSuppressed(). Old code with finally often lost the original error this way.\n\nSince Java 9 you can also list an existing variable, as long as it is effectively final: try (conn) { ... }. You can still add catch and finally blocks; they run after the resources are closed.",
        bullets: ["Resources close in reverse order", "Close failures become suppressed exceptions", "Works with your own classes if they implement AutoCloseable"],
      },
      {
        heading: "Designing your own exceptions",
        body: "Create a custom exception when callers need to react to a specific problem, such as OrderNotFoundException or InsufficientFundsException. Extend RuntimeException for errors the caller usually cannot fix on the spot; most modern frameworks, including Spring, use unchecked exceptions for this reason. Use a checked exception only when every caller really should handle the case.\n\nWhen you catch a low-level exception and throw your own, always pass the original as the cause: throw new ReportException(\"cannot build report\", e). The stack trace then shows both, joined by Caused by. Throwing a new exception without the cause destroys the most useful debugging information. And never write an empty catch block; at minimum log the error or rethrow it.",
        bullets: ["Add a constructor (String message, Throwable cause)", "Put useful data in the message: ids, values, limits", "Do not use exceptions for normal control flow"],
      },
      {
        heading: "Generics and type erasure",
        body: "Generics are checked by the compiler and then mostly erased. At run time, List<String> and List<Integer> are the same class, java.util.List, and the compiler has inserted casts where you read values. This is called type erasure, and it explains several rules. You cannot write new T() or new T[10], because the type is unknown at run time. You cannot test obj instanceof List<String>. And a class cannot have two overloads that differ only by type argument.\n\nGeneric methods declare their own type parameter before the return type: static <T> T first(List<T> list). The compiler usually infers T from the arguments. Avoid raw types like plain List: they switch off the checks, and the mistake shows up later as a ClassCastException far from the real cause.",
      },
      {
        heading: "Bounds and wildcards: PECS",
        body: "A bound limits a type parameter: <T extends Comparable<T>> means T must be comparable, so you may call compareTo. Wildcards use ? in a parameter type. The rule of thumb is PECS: Producer Extends, Consumer Super. If a method only reads items from a collection, accept List<? extends Number>, so a List<Integer> or List<Double> both work. If it only writes items into a collection, accept List<? super Integer>, so a List<Number> or List<Object> also works.\n\nThe JDK uses this everywhere. Collections.copy is declared as copy(List<? super T> dest, List<? extends T> src). Note that List<Integer> is not a subtype of List<Number>, even though Integer is a Number. Wildcards are how you get that flexibility back safely.",
        visual: {
          type: "compare",
          title: "? extends vs ? super",
          columns: [
            { title: "List<? extends Number>", points: ["Producer: you read from it", "Accepts List<Integer>, List<Double>", "get() returns a Number", "add() is not allowed (except null)"] },
            { title: "List<? super Integer>", points: ["Consumer: you write into it", "Accepts List<Integer>, List<Number>, List<Object>", "add(5) is allowed", "get() only gives Object"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Deciding what to do with a caught exception",
        steps: [
          { label: "Can you recover here?", detail: "Yes: handle it, for example retry or use a default" },
          { label: "Can you add context?", detail: "Yes: wrap it with a cause and a clearer message" },
          { label: "Otherwise let it go", detail: "Do not catch it; declare or propagate" },
          { label: "Top-level handler", detail: "One place logs it and returns an error" },
        ],
      },
    ],
    examples: [
      {
        title: "Wrapping a low-level error with context",
        explanation: "A service reads a price list from disk. Step 1: the file call throws a checked IOException. Step 2: the service cannot fix a missing file, so it wraps the error in its own unchecked PriceListException and passes the cause. Step 3: the message names the file, so the log line is useful on its own. Step 4: callers do not need throws clauses, and the stack trace still shows Caused by: java.nio.file.NoSuchFileException.",
        code: {
          lang: "java",
          code: `class PriceListException extends RuntimeException {
  PriceListException(String msg, Throwable cause) { super(msg, cause); }
}

List<String> loadPrices(Path file) {
  try {
    return Files.readAllLines(file);
  } catch (IOException e) {
    throw new PriceListException("cannot read price list " + file, e);
  }
}`,
        },
      },
      {
        title: "A generic method that sums any numbers",
        explanation: "You want one sum method for List<Integer>, List<Long> and List<Double>. Step 1: List<Number> will not accept a List<Integer>, because generic types are not covariant. Step 2: the method only reads, so it is a producer: use List<? extends Number>. Step 3: call doubleValue(), which every Number has. Step 4: the same method now works for all three lists without casts.",
        code: {
          lang: "java",
          code: `static double sum(List<? extends Number> nums) {
  double total = 0;
  for (Number n : nums) total += n.doubleValue();
  return total;
}

sum(List.of(1, 2, 3));        // 6.0
sum(List.of(1.5, 2.5));       // 4.0
sum(List.of(10L, 20L));       // 30.0`,
        },
      },
    ],
    cheatSheet: [
      "Checked: catch it or declare throws. Unchecked (RuntimeException): optional",
      "Catch specific exceptions before general ones",
      "Always pass the cause when wrapping: new MyException(msg, e)",
      "try-with-resources closes in reverse order and keeps close errors as suppressed",
      "Never leave a catch block empty",
      "PECS: Producer extends (read), Consumer super (write)",
      "List<Integer> is not a List<Number>; use List<? extends Number>",
      "Type erasure: no new T(), no instanceof List<String>",
    ],
    quiz: [
      {
        q: "In try-with-resources, the body throws an exception and close() also throws. What does the caller receive?",
        options: ["The close() exception only", "The body's exception, with the close failure as suppressed", "Both, as two separate throws", "Nothing, close errors are ignored"],
        answer: 1,
        why: "The primary exception is kept and the close failure is added with addSuppressed.",
      },
      {
        q: "Why can you not write new T() inside a generic class?",
        options: ["T might be abstract", "Generics only work with interfaces", "Constructors cannot be generic", "Type erasure means T is not known at run time"],
        answer: 3,
        why: "After compilation T is erased, so the JVM does not know which class to create.",
      },
      {
        q: "A method should add Integers into a list given by the caller. Which parameter type is most flexible?",
        options: ["List<? super Integer>", "List<? extends Integer>", "List<Integer>", "List<Object>"],
        answer: 0,
        why: "The list consumes Integers, and super accepts List<Integer>, List<Number> and List<Object>.",
      },
      {
        q: "What is the main problem with catch (Exception e) {} in business code?",
        options: ["It is slower than catching specific types", "It does not compile", "It hides real bugs because errors vanish silently", "It catches Errors such as OutOfMemoryError"],
        answer: 2,
        why: "An empty catch swallows every failure, so the program continues in a broken state with no trace.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a method parseAge(String s) that returns the age as an int and throws IllegalArgumentException with a clear message if s is not a number or is negative.",
        hint: "Integer.parseInt throws NumberFormatException; catch it and wrap it.",
        solution: "static int parseAge(String s) {\n  int age;\n  try {\n    age = Integer.parseInt(s.trim());\n  } catch (NumberFormatException e) {\n    throw new IllegalArgumentException(\"age is not a number: \" + s, e);\n  }\n  if (age < 0) throw new IllegalArgumentException(\"age is negative: \" + age);\n  return age;\n}",
      },
      {
        level: "medium",
        task: "Write a class Timer that implements AutoCloseable and prints how many milliseconds passed between its creation and close(). Use it in try-with-resources around some work.",
        hint: "Record System.nanoTime() in the constructor.",
        solution: "class Timer implements AutoCloseable {\n  private final String name;\n  private final long start = System.nanoTime();\n  Timer(String name) { this.name = name; }\n  @Override public void close() {\n    long ms = (System.nanoTime() - start) / 1_000_000;\n    System.out.println(name + \" took \" + ms + \" ms\");\n  }\n}\n// try (var t = new Timer(\"load\")) { Thread.sleep(200); }",
      },
      {
        level: "hard",
        task: "Write a generic method static <T extends Comparable<? super T>> T maxOf(Collection<? extends T> items) that throws NoSuchElementException on an empty collection.",
        hint: "Iterate once, keeping the best so far; the ? super T bound allows types that inherit compareTo from a parent.",
        solution: "static <T extends Comparable<? super T>> T maxOf(Collection<? extends T> items) {\n  Iterator<? extends T> it = items.iterator();\n  if (!it.hasNext()) throw new NoSuchElementException(\"empty\");\n  T best = it.next();\n  while (it.hasNext()) {\n    T x = it.next();\n    if (x.compareTo(best) > 0) best = x;\n  }\n  return best;\n}",
      },
    ],
    faq: [
      { q: "Should I use checked or unchecked exceptions?", a: "Use unchecked exceptions for most application errors; that is what Spring and most modern libraries do. Use checked ones only when every caller can and should recover, such as a parser that reports bad input." },
      { q: "Should I ever catch Throwable or Error?", a: "Almost never. Errors like OutOfMemoryError mean the JVM is in trouble, and trying to continue usually makes things worse. A top-level handler may log them before the process exits." },
      { q: "What does \"unchecked cast\" warning mean?", a: "You cast to a generic type that the JVM cannot verify at run time because of type erasure. The code may fail later with ClassCastException, so fix the types instead of suppressing the warning where possible." },
      { q: "Is it slow to throw exceptions?", a: "Creating an exception fills in a stack trace, which costs time, so do not use exceptions for normal control flow in hot loops. For real error cases the cost does not matter." },
    ],
  },

  "java-core/java-collections": {
    plain: [
      "A collection is an object that holds a group of other objects. Instead of writing your own resizable arrays or lookup tables, you use ready-made ones from java.util. They are well tested and fast, so the main skill is picking the right one.",
      "There are four big families. A List keeps items in order and allows duplicates, like a shopping list. A Set refuses duplicates, like a guest list. A Map stores pairs of key and value, like a phone book. A Queue hands items out in a certain order, like a line at a counter.",
      "Each family has several implementations. They behave the same from the outside but are built differently inside, so some operations are fast in one and slow in another. Big-O notation describes this: O(1) means the time stays the same as the collection grows, O(n) means it grows with the size.",
      "In daily backend work, ArrayList and HashMap cover most needs. You reach for others when you need sorting (TreeMap), stable order (LinkedHashMap), a stack or queue (ArrayDeque), or always taking the smallest item first (PriorityQueue).",
    ],
    deepDive: [
      {
        heading: "Inside HashMap",
        body: "A HashMap is an array of buckets. To store a key, it calls key.hashCode(), mixes the bits, and uses the result to choose a bucket. If two keys land in the same bucket (a collision), they are kept together, and equals() tells them apart on lookup. With a good hashCode, most buckets hold zero or one entry, so get and put are O(1) on average.\n\nThe table starts with 16 buckets. When the number of entries passes 75 percent of the bucket count (the load factor 0.75), the table doubles and every entry is moved. If you know you will store a million items, size it upfront to avoid repeated resizing. If one bucket grows past 8 entries and the table has at least 64 buckets, that bucket turns into a balanced tree, so even bad hash codes give O(log n) instead of O(n).",
        visual: {
          type: "flow",
          title: "map.put(key, value)",
          steps: [
            { label: "key.hashCode()", detail: "An int computed from the key" },
            { label: "Choose bucket", detail: "Hash bits pick an index in the array" },
            { label: "Search bucket", detail: "equals() finds an existing key" },
            { label: "Replace or append", detail: "Old value replaced, or new entry added" },
            { label: "Resize if needed", detail: "Over 75% full: double the table" },
          ],
        },
      },
      {
        heading: "How ArrayList grows",
        body: "An ArrayList wraps a plain array. new ArrayList<>() starts with an empty array and allocates room for 10 elements on the first add. When the array is full, it allocates a new one about 1.5 times bigger and copies everything over. Each single copy costs O(n), but it happens so rarely that adding at the end is O(1) on average, which is what amortised O(1) means.\n\nInserting or removing in the middle shifts every element after that position, which is O(n). That sounds bad, but the shift is one fast memory copy, so for small and medium lists ArrayList still beats LinkedList, whose nodes are spread across memory. If you know the final size, pass it to the constructor: new ArrayList<>(10_000).",
        bullets: ["get(i) and set(i) are O(1)", "add at end: amortised O(1)", "add or remove at index i: O(n)", "contains and indexOf: O(n) linear scan"],
      },
      {
        heading: "Sorted collections and their navigation methods",
        body: "TreeMap and TreeSet keep keys sorted using a red-black tree, a self-balancing binary tree. Every get, put and remove is O(log n). The order comes from the key's compareTo (Comparable) or from a Comparator you pass to the constructor.\n\nTheir real power is navigation. floorKey(x) finds the largest key less than or equal to x, ceilingKey(x) the smallest key greater than or equal to x, and headMap, tailMap and subMap give live views of a range. This is perfect for price tiers, time windows or finding the nearest slot. One trap: a TreeSet decides equality with compareTo, not equals. If your comparator says two different objects compare as 0, the set keeps only one of them.",
        bullets: ["firstKey() and lastKey() give the extremes", "pollFirstEntry() removes and returns the smallest", "descendingMap() iterates largest first"],
      },
      {
        heading: "Queues, deques and priority queues",
        body: "Deque (pronounced deck) lets you add and remove at both ends. ArrayDeque is the go-to implementation: use push and pop for a stack (last in, first out), and offer and poll for a queue (first in, first out). It is faster than the old Stack class and than LinkedList. It does not accept null.\n\nPriorityQueue is a binary heap. offer and poll are O(log n), peek is O(1), and poll always returns the smallest element by natural order or by your Comparator. For largest first, pass Comparator.reverseOrder(). Iterating over a PriorityQueue or printing it does not show sorted order; only repeated poll calls do. In concurrent code, use the BlockingQueue family (ArrayBlockingQueue, LinkedBlockingQueue) instead.",
      },
      {
        heading: "Immutable, unmodifiable and sequenced collections",
        body: "List.of, Set.of and Map.of (Java 9) create truly immutable collections. Any add or remove throws UnsupportedOperationException, and they reject null elements. List.copyOf makes an immutable copy of an existing list. Collections.unmodifiableList is different: it is a read-only view, so changes to the original list still show through.\n\nJava 21 added sequenced collections. List, Deque, LinkedHashSet, LinkedHashMap, TreeSet and TreeMap now share methods like getFirst(), getLast(), addFirst(), removeLast() and reversed(). So list.getLast() replaces list.get(list.size() - 1). Also remember: removing items in a for-each loop throws ConcurrentModificationException. Use list.removeIf(x -> ...) or an explicit Iterator with it.remove().",
        bullets: ["Map.of allows up to 10 pairs; use Map.ofEntries for more", "Set.of throws if you pass duplicates", "Return immutable collections from methods to protect internal state"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "HashMap vs LinkedHashMap vs TreeMap",
        columns: [
          { title: "HashMap", points: ["get and put O(1) average", "No predictable order", "Allows one null key", "The default choice"] },
          { title: "LinkedHashMap", points: ["get and put O(1) average", "Insertion or access order", "Slightly more memory", "Good for LRU caches"] },
          { title: "TreeMap", points: ["get and put O(log n)", "Keys always sorted", "floorKey, ceilingKey, subMap", "No null keys with natural order"] },
        ],
      },
      {
        type: "flow",
        title: "Picking a collection in four questions",
        steps: [
          { label: "Look up by key?", detail: "Yes: a Map (HashMap by default)" },
          { label: "Must be unique?", detail: "Yes: a Set (HashSet by default)" },
          { label: "Need sorted order?", detail: "Yes: TreeMap or TreeSet" },
          { label: "Process in order?", detail: "FIFO or LIFO: ArrayDeque. Smallest first: PriorityQueue" },
          { label: "Otherwise", detail: "ArrayList" },
        ],
      },
    ],
    examples: [
      {
        title: "A tiny LRU cache with LinkedHashMap",
        explanation: "You need to keep the 100 most recently used results and drop the oldest. Step 1: create a LinkedHashMap with accessOrder set to true, so every get moves the entry to the end. Step 2: override removeEldestEntry, which LinkedHashMap calls after each put. Step 3: return true when the size passes the limit, and the least recently used entry at the front is removed. Note: this class is not thread-safe; for production caches use a library such as Caffeine.",
        code: {
          lang: "java",
          code: `class LruCache<K, V> extends LinkedHashMap<K, V> {
  private final int max;

  LruCache(int max) {
    super(16, 0.75f, true);   // true = access order
    this.max = max;
  }

  @Override
  protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
    return size() > max;
  }
}
// var c = new LruCache<String, Integer>(2);
// c.put("a", 1); c.put("b", 2); c.get("a"); c.put("c", 3);  // "b" is evicted`,
        },
      },
      {
        title: "Top 3 scores from a big stream with a PriorityQueue",
        explanation: "You read a million scores and need only the three highest. Sorting everything costs O(n log n). Instead, step 1: keep a min-heap of size 3. Step 2: add each score. Step 3: if the heap grows past 3, poll removes the smallest, so only the best three stay. The work is O(n log k) with k = 3, and memory stays tiny. Step 4: at the end, the heap holds the top three; sort them for display.",
        code: {
          lang: "java",
          code: `static List<Integer> top3(int[] scores) {
  PriorityQueue<Integer> heap = new PriorityQueue<>();   // smallest on top
  for (int s : scores) {
    heap.offer(s);
    if (heap.size() > 3) heap.poll();                   // drop the smallest
  }
  List<Integer> result = new ArrayList<>(heap);
  result.sort(Comparator.reverseOrder());
  return result;
}
// top3(new int[]{40, 95, 12, 77, 88, 63}) -> [95, 88, 77]`,
        },
      },
    ],
    cheatSheet: [
      "HashMap starts with 16 buckets and doubles when 75% full",
      "new HashMap<>(expected * 4 / 3 + 1) avoids resizes for a known size",
      "TreeMap: floorKey, ceilingKey, subMap for range lookups in O(log n)",
      "Use ArrayDeque for stacks and queues, not Stack or LinkedList",
      "PriorityQueue: offer and poll O(log n), peek O(1), printing is not sorted",
      "List.of is immutable and rejects null; unmodifiableList is only a view",
      "Remove while iterating with list.removeIf(...) or Iterator.remove()",
      "Java 21: list.getFirst(), list.getLast(), list.reversed()",
    ],
    quiz: [
      {
        q: "A HashMap has 16 buckets and default settings. Roughly when does it resize?",
        options: ["When it has 16 entries", "When it has more than 12 entries", "When a bucket has 8 entries", "Never, it grows one bucket at a time"],
        answer: 1,
        why: "The load factor 0.75 times 16 buckets gives a threshold of 12 entries.",
      },
      {
        q: "You need the largest key that is less than or equal to 250 in a map of price tiers. Which call fits?",
        options: ["hashMap.get(250)", "treeMap.ceilingKey(250)", "treeMap.firstKey()", "treeMap.floorKey(250)"],
        answer: 3,
        why: "floorKey returns the greatest key less than or equal to the given value.",
      },
      {
        q: "What does System.out.println(priorityQueue) show?",
        options: ["The internal heap array order, not fully sorted", "Elements sorted smallest first", "Elements in insertion order", "Only the smallest element"],
        answer: 0,
        why: "Iteration and toString follow the heap's array layout; only poll returns elements in priority order.",
      },
      {
        q: "A TreeSet uses a Comparator that compares people only by age. You add two different people aged 30. How many are stored?",
        options: ["Two", "It throws an exception", "One", "Zero"],
        answer: 2,
        why: "TreeSet treats compareTo or compare returning 0 as a duplicate, regardless of equals.",
      },
      {
        q: "What happens when you call add on a list created with List.of(1, 2, 3)?",
        options: ["It adds the element", "It throws UnsupportedOperationException", "It returns false", "It creates a copy with the new element"],
        answer: 1,
        why: "List.of returns an immutable list, so every modifying method throws.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given a list of words, print each distinct word once, in the order it first appeared.",
        hint: "Which Set keeps insertion order?",
        solution: "List<String> words = List.of(\"b\", \"a\", \"b\", \"c\", \"a\");\nSet<String> seen = new LinkedHashSet<>(words);\nSystem.out.println(seen);   // [b, a, c]",
      },
      {
        level: "medium",
        task: "Check whether a string of brackets like \"{[()]}\" is balanced, using a Deque as a stack.",
        hint: "Push opening brackets; on a closing bracket, pop and check it matches.",
        solution: "static boolean balanced(String s) {\n  Deque<Character> st = new ArrayDeque<>();\n  for (char c : s.toCharArray()) {\n    if (c == '(' || c == '[' || c == '{') st.push(c);\n    else {\n      if (st.isEmpty()) return false;\n      char o = st.pop();\n      if ((c == ')' && o != '(') || (c == ']' && o != '[') || (c == '}' && o != '{')) return false;\n    }\n  }\n  return st.isEmpty();\n}",
      },
      {
        level: "hard",
        task: "Shipping costs depend on weight tiers: from 0 kg costs 5, from 2 kg costs 9, from 10 kg costs 20. Write cost(double kg) using a TreeMap so new tiers need only one new line.",
        hint: "Store the tier start as the key and use floorEntry.",
        solution: "static final TreeMap<Double, Integer> TIERS = new TreeMap<>(Map.of(\n    0.0, 5,\n    2.0, 9,\n    10.0, 20));\n\nstatic int cost(double kg) {\n  if (kg < 0) throw new IllegalArgumentException(\"negative weight\");\n  return TIERS.floorEntry(kg).getValue();\n}\n// cost(1.5) -> 5, cost(2) -> 9, cost(42) -> 20",
      },
    ],
    faq: [
      { q: "Is LinkedList ever the right choice?", a: "Rarely. ArrayDeque is better for queues and stacks, and ArrayList is better for indexed lists. LinkedList only helps when you insert or remove in the middle through an iterator you already hold, and even then memory overhead often eats the gain." },
      { q: "What is the difference between HashMap and Hashtable?", a: "Hashtable is a legacy class with every method synchronized and no null keys or values. Use HashMap in single-threaded code and ConcurrentHashMap when threads share the map." },
      { q: "Why does my HashMap lookup return null for a key I just put?", a: "Usually the key class does not override equals and hashCode consistently, or a field used in hashCode changed after the key was inserted. Use immutable keys such as String, records or enums." },
      { q: "Does HashMap keep insertion order?", a: "No. The order depends on hash codes and can change after a resize. Use LinkedHashMap when you need insertion order." },
    ],
  },

  "java-core/java-streams": {
    plain: [
      "A lambda is a small function you can write inline and pass around like a value. x -> x * 2 means: take x, give back x times two. Before Java 8 you needed a whole anonymous class for this, which took five lines instead of one.",
      "A stream is a pipeline for data. You start from a source, such as a list, then add steps: keep only some items (filter), change each item (map), and finally collect the results. You describe what you want, and the stream does the looping for you.",
      "Streams do not change the original list. They read from it and produce something new, like a new list, a map or a single number. This makes code easier to reason about, because data is not modified in many places.",
      "Optional is a small box that either holds a value or is empty. A method that might not find anything, like findUserByEmail, can return Optional<User> instead of null. The caller then has to decide what to do when the box is empty, which prevents many NullPointerExceptions.",
    ],
    deepDive: [
      {
        heading: "Functional interfaces and method references",
        body: "A lambda is always an implementation of a functional interface: an interface with exactly one abstract method. java.util.function provides the common shapes. Function<T, R> turns a T into an R. Predicate<T> returns a boolean. Consumer<T> takes a value and returns nothing. Supplier<T> takes nothing and returns a value. BiFunction, UnaryOperator and BinaryOperator cover two inputs or same-type results.\n\nA lambda may read local variables from the surrounding method only if they are effectively final, meaning never reassigned. That is why count++ inside a lambda does not compile. When a lambda just calls one existing method, a method reference is shorter and often clearer. There are four kinds, shown in the diagram.",
        bullets: ["Predicate<String> empty = String::isEmpty", "Function<String, Integer> len = String::length", "Supplier<List<String>> make = ArrayList::new"],
        visual: {
          type: "tree",
          title: "Four kinds of method reference",
          root: "Method reference",
          children: [
            { label: "Static method", children: ["Integer::parseInt", "same as s -> Integer.parseInt(s)"] },
            { label: "Method of a given object", children: ["System.out::println", "same as x -> System.out.println(x)"] },
            { label: "Method of the argument", children: ["String::toUpperCase", "same as s -> s.toUpperCase()"] },
            { label: "Constructor", children: ["ArrayList::new", "same as () -> new ArrayList<>()"] },
          ],
        },
      },
      {
        heading: "Laziness: one element at a time",
        body: "Intermediate operations like filter and map only describe work. Nothing happens until a terminal operation such as collect, count, findFirst or forEach asks for results. Then each element travels through the whole pipeline before the next one starts. A stream does not run filter on the whole list, then map on the whole list.\n\nThis lets short-circuit operations stop early. findFirst, anyMatch, allMatch, noneMatch and limit stop pulling elements as soon as they know the answer, so a pipeline over a million items may only touch three. It also means a stream can even be infinite, like Stream.iterate(1, x -> x * 2), as long as something like limit(10) ends it. Operations such as sorted and distinct must see all elements first, so they break this one-at-a-time flow.",
        visual: {
          type: "sequence",
          title: "filter(even).map(x * 10).findFirst() on 1, 2, 3, 4",
          actors: ["Source", "filter", "map", "findFirst"],
          messages: [
            { from: 0, to: 1, label: "sends 1" },
            { from: 1, to: 0, label: "1 rejected, next please" },
            { from: 0, to: 1, label: "sends 2" },
            { from: 1, to: 2, label: "2 passes" },
            { from: 2, to: 3, label: "20" },
            { from: 3, to: 0, label: "done: 3 and 4 never read" },
          ],
        },
      },
      {
        heading: "Collectors you will use every week",
        body: "Stream.toList() (Java 16) returns an unmodifiable list, which is usually what you want. Collectors.toList() makes no promise about mutability. Collectors.toMap(keyFn, valueFn) throws IllegalStateException when two elements produce the same key; pass a third argument, a merge function such as (a, b) -> a, to decide which value wins.\n\ngroupingBy(classifier) builds a Map from key to List of elements. Its second argument, a downstream collector, says what to do with each group: counting() gives a Long count, summingInt and averagingDouble give numbers, mapping(fn, toList()) keeps only one field. partitioningBy(predicate) is a special case that always returns a Map with the keys true and false. joining(\", \") concatenates strings. groupingBy uses a HashMap; pass TreeMap::new as the middle argument when you want sorted keys.",
        bullets: ["groupingBy(Order::city, counting())", "groupingBy(Order::city, TreeMap::new, toList())", "partitioningBy(o -> o.total() > 100)", "toMap(User::id, u -> u, (a, b) -> a)"],
      },
      {
        heading: "Using Optional well",
        body: "Optional was designed as a return type for methods that may have no result. Do not use it for fields, method parameters or collections; an empty list already means no items. Create one with Optional.of(value), which throws on null, or Optional.ofNullable(value) when null is possible.\n\nUnwrap it safely. map and filter transform the value only if present. flatMap is for functions that already return an Optional. orElse(default) gives a fallback, but its argument is always evaluated, even when the value is present. If the fallback is expensive, such as a database call, use orElseGet(() -> loadDefault()), which runs only when needed. orElseThrow() throws NoSuchElementException, and orElseThrow(() -> new NotFoundException(id)) throws your own exception. ifPresentOrElse handles both cases in one call.",
      },
      {
        heading: "Primitive streams, parallel streams and when to use a loop",
        body: "A Stream<Integer> boxes every number into an object. IntStream, LongStream and DoubleStream work with raw primitives and offer sum(), average() and summaryStatistics(). Switch with mapToInt(Order::quantity), and go back with boxed(). IntStream.range(0, n) replaces many counting loops.\n\nparallelStream() splits the work across the common ForkJoinPool, which has about one thread per CPU core. It only helps for large, CPU-heavy work with no shared state, and it can hurt in a web server where all requests share that pool. Measure before using it.\n\nPlain loops are still better when you need to break out early with complex conditions, update several variables, or call methods that throw checked exceptions. Use streams where they read like a sentence.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Same task as a loop and as a stream",
        columns: [
          { title: "for loop", points: ["Says how: index, temp list, add", "Easy to break and continue", "Handles checked exceptions simply", "Can mutate several variables"] },
          { title: "Stream pipeline", points: ["Says what: filter, map, collect", "No temporary mutable list", "Easy to add grouping or sorting", "Lazy and can stop early"] },
        ],
      },
    ],
    examples: [
      {
        title: "Refactoring a loop into a stream",
        explanation: "The loop builds a sorted list of names of active adult users in upper case. Step 1: each if becomes a filter. Step 2: the value you add becomes a map. Step 3: the sort becomes sorted(). Step 4: the result list becomes toList(). The stream version has no temporary list and reads top to bottom as the rules themselves. Both versions give the same output.",
        code: {
          lang: "java",
          code: `record User(String name, boolean active, int age) {}

// Before
List<String> names = new ArrayList<>();
for (User u : users) {
  if (u.active() && u.age() >= 18) names.add(u.name().toUpperCase());
}
Collections.sort(names);

// After
List<String> names2 = users.stream()
    .filter(u -> u.active() && u.age() >= 18)
    .map(u -> u.name().toUpperCase())
    .sorted()
    .toList();`,
        },
      },
      {
        title: "Top 3 most common words",
        explanation: "Step 1: split the text into words and stream them. Step 2: groupingBy with counting() builds a Map of word to count. Step 3: stream the map's entries and sort by count, highest first, breaking ties alphabetically so the output is stable. Step 4: limit(3) keeps the top three, and map formats each entry. The result is [the=3, and=2, bat=1].",
        code: {
          lang: "java",
          code: `String text = "the cat and the hat and the bat";

Map<String, Long> freq = Arrays.stream(text.split(" "))
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

List<String> top = freq.entrySet().stream()
    .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
        .thenComparing(Map.Entry.comparingByKey()))
    .limit(3)
    .map(e -> e.getKey() + "=" + e.getValue())
    .toList();`,
        },
      },
    ],
    cheatSheet: [
      "Nothing runs until a terminal operation: collect, toList, count, findFirst, forEach",
      "Lambdas can only use local variables that are effectively final",
      "toMap throws on duplicate keys unless you pass a merge function",
      "groupingBy(key, counting()) gives Map<K, Long>",
      "orElse always evaluates its argument; orElseGet only when empty",
      "Use mapToInt(...).sum() instead of boxing with reduce(0, Integer::sum)",
      "A stream can be used once; call stream() again for a second pass",
      "Avoid parallelStream() in web servers unless you have measured a gain",
    ],
    quiz: [
      {
        q: "What does Stream.of(1, 2, 3).peek(System.out::println).filter(x -> x > 1); print?",
        options: ["1 2 3", "2 3", "Nothing, because there is no terminal operation", "It does not compile"],
        answer: 2,
        why: "Intermediate operations are lazy, so without a terminal operation no element is processed.",
      },
      {
        q: "You call Collectors.toMap(Person::city, Person::name) and two people live in Pune. What happens?",
        options: ["IllegalStateException for the duplicate key", "The last name wins", "The first name wins", "Both names are kept in a list"],
        answer: 0,
        why: "Without a merge function, toMap refuses duplicate keys.",
      },
      {
        q: "Which method reference matches the lambda s -> s.length()?",
        options: ["s::length", "String::length()", "length::String", "String::length"],
        answer: 3,
        why: "An unbound instance method reference uses the class name and the method name, without parentheses.",
      },
      {
        q: "Why might user.orElse(loadDefaultUserFromDb()) be wasteful?",
        options: ["orElse is deprecated", "loadDefaultUserFromDb() runs even when the user is present", "It returns null when empty", "It throws when the user is present"],
        answer: 1,
        why: "Java evaluates method arguments before the call, so the database call always happens; orElseGet avoids it.",
      },
      {
        q: "A lambda contains total += x, where total is a local int. What happens?",
        options: ["It works but is slow", "total is updated correctly", "It only fails in parallel streams", "Compile error: total must be effectively final"],
        answer: 3,
        why: "Lambdas may only capture local variables that are never reassigned.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From List.of(1, 2, 3, 4, 5, 6, 7), produce a list of the squares of the odd numbers.",
        hint: "filter, then map, then toList.",
        solution: "List<Integer> squares = List.of(1, 2, 3, 4, 5, 6, 7).stream()\n    .filter(n -> n % 2 != 0)\n    .map(n -> n * n)\n    .toList();   // [1, 9, 25, 49]",
      },
      {
        level: "medium",
        task: "Given record Employee(String dept, String name, double salary), build a Map from department to average salary, with departments sorted by name.",
        hint: "groupingBy has a version that takes a map factory and a downstream collector.",
        solution: "Map<String, Double> avg = employees.stream()\n    .collect(Collectors.groupingBy(\n        Employee::dept,\n        TreeMap::new,\n        Collectors.averagingDouble(Employee::salary)));",
      },
      {
        level: "hard",
        task: "Given record Order(String customer, List<Item> items) and record Item(String name, double price), return the name of the customer who spent the most in total, as an Optional<String>.",
        hint: "Sum each order's items, group totals by customer, then take the max entry by value.",
        solution: "Optional<String> best = orders.stream()\n    .collect(Collectors.groupingBy(Order::customer,\n        Collectors.summingDouble(o -> o.items().stream()\n            .mapToDouble(Item::price).sum())))\n    .entrySet().stream()\n    .max(Map.Entry.comparingByValue())\n    .map(Map.Entry::getKey);",
      },
    ],
    faq: [
      { q: "Are streams slower than for loops?", a: "For tiny hot loops a plain loop can be a little faster, mostly because of boxing and extra calls. For normal business code the difference is too small to matter, so choose whichever reads better." },
      { q: "What is the difference between map and flatMap?", a: "map turns each element into exactly one new element. flatMap turns each element into a stream of zero or more elements and joins them, for example orders.stream().flatMap(o -> o.items().stream())." },
      { q: "Should I use Optional for fields or parameters?", a: "No. Optional is meant for return values. For parameters use overloads or allow null with clear docs, and for fields use null internally and return Optional from the getter if needed." },
      { q: "When should I use parallel streams?", a: "Only for large CPU-bound work with no shared mutable state, after measuring a real speed-up. In server apps, a separate executor usually gives more control." },
    ],
  },

  "java-core/java-modern": {
    plain: [
      "Java changed a lot between Java 8 and Java 21. Many new features have one goal: let you say more with less code, while the compiler still checks everything. If you learned Java long ago, modern code may look surprisingly short.",
      "A record is a class whose only job is to carry data. You write record Point(int x, int y) {} and Java creates the constructor, the accessors x() and y(), equals, hashCode and toString. Records are perfect for DTOs (data transfer objects), events and results.",
      "A sealed type is a closed family. You say exactly which classes are allowed to be its children, and nobody else can join. Because the compiler knows the full list, it can check that your code handles every member of the family.",
      "Pattern matching lets you test what type something is and use it in one step. Combined with switch, you can write clean code like: if it is a Circle, do this; if it is a Square, do that. Forget a case and the compiler tells you.",
    ],
    deepDive: [
      {
        heading: "Records beyond one line",
        body: "A record's components become private final fields, and its accessors use the component names: point.x(), not getX(). You can add your own methods, static factory methods and static fields. You can implement interfaces. You cannot extend another class, add instance fields, or extend a record, because records are final.\n\nTo validate data, write a compact constructor: record Range(int start, int end) { Range { if (start > end) throw new IllegalArgumentException(); } }. It runs before the fields are assigned, and you can even reassign the parameters there, for example to trim a string. Records are only shallowly immutable: a List component can still be changed by whoever holds it, so copy it with List.copyOf in the compact constructor.\n\nRecords work well as Spring DTOs and JSON bodies (Jackson supports them) but not as JPA entities, which need a no-argument constructor and mutable fields.",
        bullets: ["Accessors: p.x(), p.y()", "Compact constructor for validation", "List.copyOf for deep-ish immutability"],
      },
      {
        heading: "Sealed types and their three kinds of children",
        body: "You declare a sealed class or interface with a permits list: sealed interface Shape permits Circle, Square. If all children are in the same source file, you can leave out permits and the compiler works it out. The children must be in the same module, or in the same package when you do not use modules.\n\nEvery permitted child must state how it continues the hierarchy. final means it can have no children of its own; records and enums are implicitly final. sealed means it has its own permits list. non-sealed opens that branch again so any class may extend it, which is useful when a library wants one extension point. This forced choice keeps the whole hierarchy known to the compiler, except where you clearly opted out.",
        visual: {
          type: "tree",
          title: "What a permitted subclass must declare",
          root: "sealed interface Vehicle permits Car, Truck, Bike",
          children: [
            { label: "final class Car", children: ["No subclasses at all", "Records are final automatically"] },
            { label: "sealed class Truck permits Van", children: ["Lists its own children", "Still fully known to the compiler"] },
            { label: "non-sealed class Bike", children: ["Anyone may extend it", "Exhaustive checks still work at this level"] },
          ],
        },
      },
      {
        heading: "Pattern matching for instanceof",
        body: "The old style tested a type and then cast: if (o instanceof String) { String s = (String) o; ... }. Since Java 16 you write if (o instanceof String s) and s is ready to use. You can combine it with conditions: if (o instanceof String s && !s.isBlank()). It does not work with ||, because then s might not be set.\n\nThe binding variable follows flow scoping: it exists wherever the compiler can prove the test passed. So this works: if (!(o instanceof String s)) return; followed by s.length() on the next line. This pattern also makes equals methods shorter: return o instanceof Money m && cents == m.cents && currency.equals(m.currency).",
      },
      {
        heading: "Switch with patterns, guards and records",
        body: "Java 21 lets switch match on types. case Circle c -> runs when the value is a Circle and binds c. A guard adds a condition: case Circle c when c.r() > 100 ->. Record patterns can take a record apart in place: case Point(int x, int y) -> gives you x and y directly, and patterns can nest.\n\nCases are tested from top to bottom, so specific cases must come before general ones. The compiler rejects a case that an earlier one dominates, such as case Circle c before case Circle c when .... A switch normally throws NullPointerException on null, but you may add case null ->. On a sealed type, a switch that covers every permitted subtype is exhaustive and needs no default. If someone later adds a subtype, every such switch fails to compile until it is handled, which is exactly the safety you want.",
        bullets: ["case Type t when condition -> adds a guard", "case Point(int x, int y) -> deconstructs a record", "case null -> handles null explicitly", "Avoid default on sealed switches so new cases are caught"],
      },
      {
        heading: "A short timeline of modern Java",
        body: "Features usually arrive as previews first and become final a few releases later. You only need the final versions. Java 10 added var for local variables. Java 14 made switch expressions final and added helpful NullPointerException messages that name the exact null variable. Java 15 brought text blocks with triple quotes. Java 16 finalised records and pattern matching for instanceof. Java 17, an LTS release, finalised sealed classes. Java 21, the next LTS, finalised record patterns, pattern matching for switch, virtual threads and sequenced collections. Java 22 added unnamed variables, so you can write _ for a value you do not use, as in catch (Exception _). Java 25 is the LTS after 21.",
        visual: {
          type: "flow",
          title: "When each feature became final",
          steps: [
            { label: "Java 14", detail: "Switch expressions, helpful NPE messages" },
            { label: "Java 15", detail: "Text blocks" },
            { label: "Java 16", detail: "Records, instanceof patterns" },
            { label: "Java 17 LTS", detail: "Sealed classes" },
            { label: "Java 21 LTS", detail: "Switch patterns, record patterns, virtual threads" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How a pattern switch picks a branch",
        steps: [
          { label: "Evaluate the value", detail: "The selector expression runs once" },
          { label: "Is it null?", detail: "Use case null, otherwise NullPointerException" },
          { label: "Try cases top to bottom", detail: "Type must match and the guard must be true" },
          { label: "First match wins", detail: "Its pattern variables are bound" },
          { label: "Run that branch", detail: "The result is the switch value" },
        ],
      },
    ],
    examples: [
      {
        title: "A validated Money record",
        explanation: "You want a Money type that can never hold a negative amount or a missing currency. Step 1: declare a record with two components. Step 2: add a compact constructor that checks the rules; it runs on every creation, so no invalid Money can exist. Step 3: add behaviour as normal methods; plus returns a new Money because records are immutable. Step 4: equals and hashCode come for free, so Money works as a map key.",
        code: {
          lang: "java",
          code: `record Money(long cents, String currency) {
  Money {
    if (cents < 0) throw new IllegalArgumentException("negative amount");
    Objects.requireNonNull(currency, "currency");
    currency = currency.toUpperCase();
  }

  Money plus(Money other) {
    if (!currency.equals(other.currency)) throw new IllegalArgumentException("currency mismatch");
    return new Money(cents + other.cents, currency);
  }
}
// new Money(500, "eur").plus(new Money(250, "EUR"))  -> Money[cents=750, currency=EUR]`,
        },
      },
      {
        title: "Modelling payment results with a sealed type",
        explanation: "A payment can be approved, declined or fail. Step 1: model each outcome as a record that carries exactly the data it needs. Step 2: seal the interface so these are the only outcomes. Step 3: switch with record patterns to pull out fields, and a guard to treat retryable failures differently. The guarded case must come before the plain Failed case. Step 4: there is no default, so adding a new outcome later breaks the build here until you handle it.",
        code: {
          lang: "java",
          code: `sealed interface PaymentResult permits Approved, Declined, Failed {}
record Approved(String txId, long cents) implements PaymentResult {}
record Declined(String reason) implements PaymentResult {}
record Failed(Exception error, boolean retryable) implements PaymentResult {}

static String message(PaymentResult r) {
  return switch (r) {
    case Approved(String id, long cents) -> "Paid " + cents / 100.0 + " (tx " + id + ")";
    case Declined(String reason) -> "Card declined: " + reason;
    case Failed f when f.retryable() -> "Temporary problem, please retry";
    case Failed f -> "Payment failed: " + f.error().getMessage();
  };
}`,
        },
      },
    ],
    cheatSheet: [
      "record Point(int x, int y) {} gives a constructor, p.x(), equals, hashCode, toString",
      "Compact constructor Point { ... } validates before fields are set",
      "Every child of a sealed type must be final, sealed or non-sealed",
      "if (o instanceof String s && !s.isBlank()) binds and tests in one step",
      "case Circle c when c.r() > 10 -> adds a guard to a pattern",
      "case Point(int x, int y) -> deconstructs a record in a switch",
      "Leave out default on sealed switches so new subtypes cause compile errors",
      "Records suit DTOs and events; JPA entities still need normal classes",
    ],
    quiz: [
      {
        q: "Given record Point(int x, int y), how do you read x?",
        options: ["p.getX()", "p.x", "p.x()", "p.get(\"x\")"],
        answer: 2,
        why: "Record accessors are named after the components and are methods, so p.x().",
      },
      {
        q: "A class directly implements a sealed interface. What must it be declared as?",
        options: ["final, sealed or non-sealed", "abstract", "public and static", "Nothing special"],
        answer: 0,
        why: "Each permitted subtype must state how the hierarchy continues; records are implicitly final.",
      },
      {
        q: "In a switch, case Failed f -> comes before case Failed f when f.retryable() ->. What happens?",
        options: ["The guarded case runs first anyway", "It compiles; the second case is just unused", "Runtime MatchException", "Compile error: the second case is dominated by the first"],
        answer: 3,
        why: "Cases are tried in order, and the compiler rejects a case that can never be reached.",
      },
      {
        q: "Does this compile? if (!(o instanceof String s)) return; System.out.println(s.length());",
        options: ["No, s is only visible inside the if", "Yes, because of flow scoping", "Only with var s", "Only in Java 8"],
        answer: 1,
        why: "After the early return, the compiler knows the test passed, so s is in scope.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Turn this class into a record and add a method distanceTo(Point other): a class Point with final int x and y, a constructor, getters, equals and hashCode.",
        hint: "Records can have normal methods; Math.hypot computes the distance.",
        solution: "record Point(int x, int y) {\n  double distanceTo(Point o) {\n    return Math.hypot(x - o.x, y - o.y);\n  }\n}\n// new Point(0, 0).distanceTo(new Point(3, 4)) -> 5.0",
      },
      {
        level: "medium",
        task: "Write record Range(int start, int end) that rejects start > end, plus methods length() and contains(int n).",
        hint: "Use a compact constructor for the check.",
        solution: "record Range(int start, int end) {\n  Range {\n    if (start > end) throw new IllegalArgumentException(start + \" > \" + end);\n  }\n  int length() { return end - start; }\n  boolean contains(int n) { return n >= start && n < end; }\n}",
      },
      {
        level: "hard",
        task: "Model arithmetic expressions as a sealed interface Expr with records Num(int value), Add(Expr left, Expr right) and Mul(Expr left, Expr right). Write int eval(Expr e) with a pattern switch and no default.",
        hint: "Use record patterns and recursion.",
        solution: "sealed interface Expr permits Num, Add, Mul {}\nrecord Num(int value) implements Expr {}\nrecord Add(Expr left, Expr right) implements Expr {}\nrecord Mul(Expr left, Expr right) implements Expr {}\n\nstatic int eval(Expr e) {\n  return switch (e) {\n    case Num(int v) -> v;\n    case Add(Expr l, Expr r) -> eval(l) + eval(r);\n    case Mul(Expr l, Expr r) -> eval(l) * eval(r);\n  };\n}",
      },
    ],
    faq: [
      { q: "Can I use records with Spring Boot and Jackson?", a: "Yes. Records work as request and response bodies, configuration properties and query projections. Only JPA entities still need regular classes." },
      { q: "Do I need Java 21 for these features?", a: "Records need Java 16+, sealed types Java 17+, and pattern matching for switch plus record patterns Java 21+. Using Java 21 or newer gives you all of them as final features." },
      { q: "Can a record have extra fields?", a: "Not instance fields; all state must be in the components. Static fields and any number of methods are allowed." },
      { q: "Is pattern matching slower than instanceof and casts?", a: "No meaningful difference. The compiler and JIT produce efficient type checks, so choose it for clarity." },
    ],
  },

  "java-core/java-concurrency": {
    plain: [
      "A thread is a path of execution inside your program. With several threads, your program can do several things at once: serve many web requests, or download files while it computes. Modern CPUs have many cores, and threads are how Java uses them.",
      "The danger is shared data. If two threads change the same variable at the same time, updates can be lost, a bug called a race condition. It may appear once in a thousand runs, which makes it very hard to find. Protecting shared data is the core skill of concurrency.",
      "Java gives you several tools. synchronized and locks let only one thread at a time into a critical section. Atomic classes and concurrent collections do safe updates without you writing locks. Executors manage a pool of threads so you just submit tasks.",
      "Java 21 added virtual threads. They are so cheap that you can start one per task, even a million of them. They shine when tasks spend most of their time waiting, for example on a database or an HTTP call, which is exactly what most backend code does.",
    ],
    deepDive: [
      {
        heading: "Visibility and the Java Memory Model",
        body: "Races are not the only problem. Without coordination, one thread may not even see another thread's write, because CPUs and the JIT compiler keep values in caches and registers and may reorder instructions. A classic bug: a worker loops while (running), another thread sets running = false, and the worker never stops.\n\nThe Java Memory Model defines happens-before rules that guarantee visibility. Marking the flag volatile fixes the example: every write to a volatile field is visible to later reads of it. But volatile does not make count++ atomic. Releasing a lock happens-before the next acquisition of the same lock, so data written inside synchronized is seen by the next thread that enters. Thread.start() and Thread.join() also create these edges.",
        bullets: ["volatile: visibility and ordering, not atomicity", "Unlock happens-before the next lock on the same monitor", "Everything before start() is visible to the new thread", "Immutable objects with final fields are safe to share"],
      },
      {
        heading: "synchronized, ReentrantLock and deadlock",
        body: "synchronized is the simplest lock: only one thread at a time can run code synchronized on the same object, and the lock is released automatically, even on an exception. ReentrantLock does the same job with more control: tryLock(1, TimeUnit.SECONDS) gives up instead of waiting forever, lockInterruptibly can be cancelled, and Conditions let threads wait for a signal. You must call unlock() in a finally block. ReadWriteLock allows many readers or one writer.\n\nDeadlock happens when two threads each hold a lock the other needs, so both wait forever. The standard cure is a global lock order: always take locks in the same order, for example by account id. A thread dump (jstack or jcmd Thread.print) reports Java-level deadlocks directly.",
        visual: {
          type: "sequence",
          title: "A deadlock between two transfers",
          actors: ["Thread A", "Lock X", "Lock Y", "Thread B"],
          messages: [
            { from: 0, to: 1, label: "A takes X" },
            { from: 3, to: 2, label: "B takes Y" },
            { from: 0, to: 2, label: "A waits for Y" },
            { from: 3, to: 1, label: "B waits for X" },
            { from: 1, to: 0, label: "Nobody can move: deadlock" },
          ],
        },
      },
      {
        heading: "Atomics and concurrent collections",
        body: "AtomicInteger, AtomicLong and AtomicReference use a CPU instruction called compare-and-set (CAS): update the value only if it still equals what I read, otherwise retry. No thread ever blocks. Under very heavy contention, LongAdder is faster for counters because it spreads updates over several cells and sums them when read.\n\nConcurrentHashMap lets many threads read and write without locking the whole map. But two safe calls in a row are not one safe call: if (!map.containsKey(k)) map.put(k, v) is a check-then-act race. Use the atomic methods instead: putIfAbsent, computeIfAbsent, compute and merge. map.merge(word, 1, Integer::sum) is a thread-safe counter per key. CopyOnWriteArrayList suits lists that are read constantly but rarely changed, such as listeners.",
        bullets: ["counter.incrementAndGet() is atomic", "map.computeIfAbsent(k, x -> new ArrayList<>()) is atomic per key", "Collections.synchronizedMap locks the whole map for every call"],
      },
      {
        heading: "Executors and CompletableFuture",
        body: "Creating a platform thread per task is expensive, so you usually submit tasks to an ExecutorService. Executors.newFixedThreadPool(8) keeps 8 threads. submit returns a Future, and future.get() blocks until the result is ready. Always shut an executor down; since Java 19 it implements AutoCloseable, so try-with-resources waits for tasks and closes it.\n\nCompletableFuture lets you describe async steps instead of blocking. supplyAsync starts work; thenApply transforms the result; thenCompose chains another async call; thenCombine joins two independent futures; allOf waits for many; exceptionally and handle deal with errors; orTimeout fails the future if it is too slow. Without an executor argument, async methods run on the shared ForkJoinPool.commonPool(), which is sized for CPU work. Pass your own executor for blocking I/O.",
      },
      {
        heading: "How virtual threads work",
        body: "A virtual thread is a Java object scheduled by the JVM, not the operating system. The JVM runs it on a small pool of carrier threads, normally one per CPU core. When a virtual thread blocks on I/O, such as a socket read, the JVM unmounts it, saving its small stack on the heap, and the carrier picks up another virtual thread. Your code stays simple and blocking, yet one server can have hundreds of thousands of requests in flight.\n\nRules of thumb: do not pool virtual threads; create one per task. Limit access to scarce resources with a Semaphore or a connection pool instead. Avoid huge ThreadLocal caches, since you may have millions of threads. Before Java 24, blocking inside synchronized pinned the carrier; Java 24 removed that limitation. In Spring Boot 3.2+, spring.threads.virtual.enabled=true switches request handling to virtual threads.",
        visual: {
          type: "layers",
          title: "Virtual threads on top of the OS",
          layers: [
            { label: "Virtual threads", detail: "Millions possible, one per task" },
            { label: "JVM scheduler", detail: "Mounts and unmounts them as they block" },
            { label: "Carrier threads", detail: "A few platform threads, about one per core" },
            { label: "OS threads", detail: "Scheduled by the kernel" },
            { label: "CPU cores", detail: "Where code actually runs" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Two remote calls in parallel with CompletableFuture",
        steps: [
          { label: "supplyAsync(user)", detail: "Starts the user call on an executor" },
          { label: "supplyAsync(orders)", detail: "Starts the orders call at the same time" },
          { label: "thenCombine", detail: "Builds a Profile when both are done" },
          { label: "orTimeout(2 s)", detail: "Fails the future if it is too slow" },
          { label: "exceptionally", detail: "Falls back to an empty profile" },
          { label: "join()", detail: "Waits for the final result" },
        ],
      },
      {
        type: "compare",
        title: "Which tool for shared state?",
        columns: [
          { title: "Atomic classes", points: ["One variable", "Lock-free compare-and-set", "Counters, flags, references", "LongAdder for hot counters"] },
          { title: "synchronized or Lock", points: ["Several variables changed together", "One thread at a time", "Keep the critical section short", "Lock lets you time out"] },
          { title: "Concurrent collections", points: ["Shared maps, queues, lists", "ConcurrentHashMap merge and compute", "BlockingQueue for producer-consumer", "No external locking needed"] },
        ],
      },
    ],
    examples: [
      {
        title: "Calling two services in parallel with a timeout",
        explanation: "A profile page needs the user and their orders from two slow services. Called one after the other, they take 300 ms plus 400 ms. Step 1: start both with supplyAsync on an executor meant for I/O. Step 2: thenCombine builds the Profile when both finish, so the wait is about 400 ms. Step 3: orTimeout fails the future after 2 seconds. Step 4: exceptionally returns a fallback instead of an error. Note that orTimeout does not cancel the underlying calls; set timeouts on the HTTP clients too.",
        code: {
          lang: "java",
          code: `ExecutorService io = Executors.newVirtualThreadPerTaskExecutor();

CompletableFuture<User> user =
    CompletableFuture.supplyAsync(() -> userClient.get(id), io);
CompletableFuture<List<Order>> orders =
    CompletableFuture.supplyAsync(() -> orderClient.forUser(id), io);

Profile profile = user
    .thenCombine(orders, Profile::new)
    .orTimeout(2, TimeUnit.SECONDS)
    .exceptionally(ex -> Profile.empty(id))
    .join();`,
        },
      },
      {
        title: "Producer and consumer with a BlockingQueue",
        explanation: "One thread reads jobs and another processes them at its own speed. Step 1: create a bounded ArrayBlockingQueue with room for 100 jobs. Step 2: the producer calls put, which waits when the queue is full, so memory cannot explode. Step 3: the consumer calls take, which waits when the queue is empty, so it never spins. Step 4: a special STOP message, often called a poison pill, tells the consumer to finish. Step 5: on InterruptedException, restore the interrupt flag instead of ignoring it.",
        code: {
          lang: "java",
          code: `BlockingQueue<String> queue = new ArrayBlockingQueue<>(100);

Thread producer = Thread.ofPlatform().start(() -> {
  try {
    for (int i = 0; i < 1_000; i++) queue.put("job-" + i);  // waits if full
    queue.put("STOP");
  } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
});

Thread consumer = Thread.ofPlatform().start(() -> {
  try {
    String job;
    while (!(job = queue.take()).equals("STOP")) process(job); // waits if empty
  } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
});`,
        },
      },
    ],
    cheatSheet: [
      "volatile gives visibility, not atomicity: volatile count++ is still a race",
      "Always unlock a ReentrantLock in a finally block",
      "Take multiple locks in one global order to avoid deadlock",
      "Use map.merge(k, 1, Integer::sum) for thread-safe counting per key",
      "try (var ex = Executors.newFixedThreadPool(4)) { ... } waits and closes (Java 19+)",
      "CompletableFuture async methods default to ForkJoinPool.commonPool()",
      "Do not pool virtual threads; limit concurrency with a Semaphore",
      "jcmd PID Thread.print dumps all threads and reports deadlocks",
    ],
    quiz: [
      {
        q: "Two threads run count++ on a field declared volatile int count. Is it safe?",
        options: ["Yes, volatile makes it atomic", "No, volatile gives visibility but count++ is still read, add, write", "Yes, but only on 64-bit CPUs", "No, volatile fields cannot be incremented"],
        answer: 1,
        why: "Two threads can still read the same value and both write back the same result.",
      },
      {
        q: "What is wrong with if (!map.containsKey(k)) map.put(k, v) on a ConcurrentHashMap?",
        options: ["ConcurrentHashMap has no containsKey", "It throws ConcurrentModificationException", "Nothing, each call is thread-safe", "Another thread can insert between the check and the put"],
        answer: 3,
        why: "Each call is safe alone, but the pair is a check-then-act race; use putIfAbsent or computeIfAbsent.",
      },
      {
        q: "A task computes prime numbers for 10 seconds without any I/O. What do virtual threads give you?",
        options: ["No real speed-up, because the work is CPU-bound", "A 10x speed-up", "Lower memory per calculation", "Automatic parallelism inside the task"],
        answer: 0,
        why: "Virtual threads help with waiting, not computing; CPU work is limited by the number of cores.",
      },
      {
        q: "Where must lock.unlock() go when using ReentrantLock?",
        options: ["At the start of the method", "In a catch block", "In a finally block after the try", "It is called automatically"],
        answer: 2,
        why: "finally guarantees the lock is released even if the protected code throws.",
      },
      {
        q: "Which call combines two independent CompletableFutures into one result?",
        options: ["thenApply", "thenCompose", "exceptionally", "thenCombine"],
        answer: 3,
        why: "thenCombine waits for both futures and merges their results with a function.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start 4 threads that each increment a shared counter 10,000 times. Show that a plain int gives wrong totals and an AtomicInteger always gives 40,000.",
        hint: "Use join() to wait for all threads before printing.",
        solution: "AtomicInteger safe = new AtomicInteger();\nint[] unsafe = {0};\nList<Thread> ts = new ArrayList<>();\nfor (int t = 0; t < 4; t++) {\n  ts.add(Thread.ofPlatform().start(() -> {\n    for (int i = 0; i < 10_000; i++) { unsafe[0]++; safe.incrementAndGet(); }\n  }));\n}\nfor (Thread t : ts) t.join();\nSystem.out.println(unsafe[0] + \" vs \" + safe.get());  // e.g. 27313 vs 40000",
      },
      {
        level: "medium",
        task: "Sum the squares of 1 to 1,000,000 using a fixed pool of 4 threads, splitting the range into 4 Callable tasks.",
        hint: "invokeAll returns a list of Futures; use long for the sums.",
        solution: "try (ExecutorService pool = Executors.newFixedThreadPool(4)) {\n  List<Callable<Long>> tasks = new ArrayList<>();\n  for (int p = 0; p < 4; p++) {\n    long from = p * 250_000L + 1, to = from + 250_000;\n    tasks.add(() -> { long s = 0; for (long i = from; i < to; i++) s += i * i; return s; });\n  }\n  long total = 0;\n  for (Future<Long> f : pool.invokeAll(tasks)) total += f.get();\n  System.out.println(total);\n}",
      },
      {
        level: "hard",
        task: "Run 1,000 tasks on virtual threads, but allow at most 10 of them to call a slow API at the same time.",
        hint: "A Semaphore with 10 permits; acquire before the call and release in finally.",
        solution: "Semaphore permits = new Semaphore(10);\ntry (var ex = Executors.newVirtualThreadPerTaskExecutor()) {\n  for (int i = 0; i < 1_000; i++) {\n    int id = i;\n    ex.submit(() -> {\n      permits.acquire();\n      try { return slowApi.call(id); }\n      finally { permits.release(); }\n    });\n  }\n}",
      },
    ],
    faq: [
      { q: "How many threads should a thread pool have?", a: "For CPU-bound work, about the number of cores (Runtime.getRuntime().availableProcessors()). For I/O-bound work you need many more, which is where virtual threads are simpler than tuning a big pool." },
      { q: "Should I still use synchronized in 2026?", a: "Yes, for short critical sections it is simple and fast, and since Java 24 it no longer pins virtual threads. Use ReentrantLock when you need timeouts, interruptible waits or several conditions." },
      { q: "Does Spring Boot support virtual threads?", a: "Yes. From Spring Boot 3.2 on Java 21+, setting spring.threads.virtual.enabled=true makes Tomcat and Spring's task executors use virtual threads." },
      { q: "What is the difference between a Future and a CompletableFuture?", a: "A Future only lets you block with get() or cancel. A CompletableFuture can also be completed manually and lets you chain, combine and handle errors without blocking." },
    ],
  },

  "java-core/jvm": {
    plain: [
      "When your Java program runs, the JVM asks the operating system for memory and divides it into areas. The biggest is the heap, where every object lives. Each thread also has its own small stack for the methods it is currently running.",
      "In Java you never free memory yourself. The garbage collector (GC) does it. From time to time it finds objects that nothing can reach any more and reclaims their space. This removes whole classes of bugs, but the GC needs CPU time and sometimes pauses your program briefly.",
      "Java can still leak memory. If your code keeps a reference to objects it no longer needs, for example in a static map that only grows, the GC must keep them. The heap fills up, the GC runs more and more often, and finally the app crashes with OutOfMemoryError.",
      "To debug memory you use a few tools: GC logs show how often the GC runs and how much it frees, and a heap dump is a snapshot of every object. With VisualVM or Eclipse MAT you can open a dump and see which objects hold the most memory and who is keeping them alive.",
    ],
    deepDive: [
      {
        heading: "How big is the heap, really?",
        body: "If you set nothing, the JVM uses a maximum heap of one quarter of the available memory. The JVM is container-aware, so inside Docker or Kubernetes it reads the container memory limit, not the host's RAM. On a 2 GB container you get a 512 MB heap by default, which is often too small. Set the heap with -Xmx (maximum) and -Xms (initial), or, better for containers, use -XX:MaxRAMPercentage=75 so the heap scales with the limit.\n\nThe heap is not the whole process. Thread stacks (about 1 MB each by default on 64-bit Linux, set with -Xss), metaspace for classes, the JIT code cache, direct byte buffers used by Netty and NIO, and the GC's own data all live outside it. That is why the process uses more memory than -Xmx.",
        bullets: ["-Xmx2g sets a 2 GB maximum heap", "-XX:MaxRAMPercentage=75 sizes the heap from the container limit", "java -XX:+PrintFlagsFinal -version shows every default"],
      },
      {
        heading: "Choosing a garbage collector",
        body: "All modern collectors are generational or region-based and stop the application only briefly, but they trade different things. Throughput is how much CPU time goes to your code rather than the GC; latency is how long the pauses are. G1 has been the default since Java 9. It splits the heap into equal regions, collects the ones with most garbage first, and tries to meet a pause goal, 200 ms by default (-XX:MaxGCPauseMillis). Parallel GC maximises throughput and suits batch jobs that do not mind longer pauses. ZGC does almost all work concurrently and keeps pauses under a millisecond even on huge heaps, at the cost of some extra CPU and memory. On a machine with fewer than 2 CPUs or under about 1.8 GB of memory, the JVM quietly picks the Serial collector unless you choose one.",
        visual: {
          type: "compare",
          title: "Three collectors you will meet",
          columns: [
            { title: "Parallel (-XX:+UseParallelGC)", points: ["Best raw throughput", "Longer stop-the-world pauses", "Good for batch jobs", "Simple to tune"] },
            { title: "G1 (default)", points: ["Region-based heap", "Pause goal, 200 ms by default", "Balanced for most services", "Works well from 1 GB up"] },
            { title: "ZGC (-XX:+UseZGC)", points: ["Pauses usually under 1 ms", "Generational since Java 21", "Scales to very large heaps", "Uses a bit more CPU and RAM"] },
          ],
        },
      },
      {
        heading: "Reading GC logs",
        body: "Turn on logging with -Xlog:gc (short) or -Xlog:gc* (detailed), and add :file=gc.log to write to a file. A typical G1 line looks like: GC(41) Pause Young (Normal) (G1 Evacuation Pause) 410M->95M(512M) 7.8ms. Read it as: collection number 41, a young collection, heap used before was 410 MB, after was 95 MB, total heap is 512 MB, and the app was paused for 7.8 ms.\n\nWhat to look for: short young pauses every few seconds are normal. The number after the arrow is the live data that survived. If that number keeps rising over hours, even after full collections, something is holding on to objects. Lines with Pause Full mean the GC had to stop everything and compact, which in G1 usually means the heap is too small or there is a leak. jstat -gcutil PID 1000 shows the same picture live, once per second.",
        bullets: ["-Xlog:gc*:file=gc.log:time,uptime,level,tags", "Watch heap-after-GC over time, not heap-before", "Frequent Pause Full lines are a red flag"],
      },
      {
        heading: "Heap dumps and finding the leak",
        body: "A heap dump is a file with every object on the heap and every reference between them. Take one from a running app with jcmd PID GC.heap_dump /tmp/app.hprof, or let the JVM write one automatically with -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/dumps. Dumps are roughly as big as the used heap and pause the app while being written, so be careful in production.\n\nOpen the file in Eclipse MAT or VisualVM (a separate download since Java 9). Two sizes matter. Shallow size is the memory of the object itself. Retained size is how much memory would be freed if that object disappeared, including everything only it keeps alive. Sort by retained size, pick the biggest, and follow its path to a GC root, such as a static field or a running thread. That path names the code that holds the memory.",
        visual: {
          type: "tree",
          title: "A typical retention path in a dump",
          root: "GC root: static field AuditService.SEEN",
          children: [
            { label: "HashMap (retained 1.4 GB)", children: ["HashMap$Node[] table", "2.1 million entries"] },
            { label: "Each entry", children: ["String key: request id", "RequestInfo value"] },
            { label: "Each RequestInfo", children: ["byte[] request body", "Headers map"] },
          ],
        },
      },
      {
        heading: "Kinds of OutOfMemoryError",
        body: "The message after OutOfMemoryError tells you which area ran out, and each needs a different fix. Java heap space means the heap is full: find a leak or raise -Xmx if the live data really is bigger. GC overhead limit exceeded means the JVM spends almost all its time in GC and frees almost nothing, which is a leak in most cases. Metaspace means too many classes were loaded, often from repeated hot redeploys or runaway code generation. Unable to create native thread means the OS refused more threads. Direct buffer memory points to off-heap buffers.\n\nIn containers there is one more case: the process is killed with exit code 137 and no Java error at all. The total process memory passed the container limit, so the kernel killed it. Lower the heap percentage to leave room for non-heap memory.",
        bullets: ["Java heap space: leak or heap too small", "Metaspace: class loading problem", "unable to create native thread: too many threads", "Exit code 137: container OOM kill, not a Java OOM"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Diagnosing a memory leak step by step",
        steps: [
          { label: "Notice the symptom", detail: "Memory climbs, GC runs more often, latency rises" },
          { label: "Check GC logs", detail: "Is heap-after-GC rising over hours?" },
          { label: "Take two heap dumps", detail: "jcmd GC.heap_dump, some time apart" },
          { label: "Compare in MAT or VisualVM", detail: "Which classes grew the most?" },
          { label: "Follow path to GC root", detail: "Find the field that holds them" },
          { label: "Fix and verify", detail: "Bound or remove it, then watch the logs again" },
        ],
      },
    ],
    examples: [
      {
        title: "Reading a worrying GC log",
        explanation: "An API gets slower every few hours. Step 1: you enable -Xlog:gc and look at the lines. Step 2: young pauses are short, which is fine, but the heap-after-GC value climbs from 95 MB to 330 MB over an hour. Step 3: then a Pause Full appears that frees almost nothing and takes over a second. Step 4: conclusion: live data is growing without limit, so this is a leak, not a tuning problem. Raising -Xmx would only delay the crash. Next step: take a heap dump.",
        code: {
          lang: "text",
          code: `[  120.4s][info][gc] GC(41)  Pause Young (Normal) (G1 Evacuation Pause) 410M->95M(512M) 7.8ms
[ 1310.9s][info][gc] GC(390) Pause Young (Normal) (G1 Evacuation Pause) 452M->160M(512M) 9.1ms
[ 2402.2s][info][gc] GC(702) Pause Young (Normal) (G1 Evacuation Pause) 470M->240M(512M) 11.6ms
[ 3605.7s][info][gc] GC(988) Pause Young (Normal) (G1 Evacuation Pause) 488M->330M(512M) 14.0ms
[ 3911.3s][info][gc] GC(1032) Pause Full (G1 Compaction Pause) 505M->498M(512M) 1450.2ms`,
        },
      },
      {
        title: "Finding and fixing a static map leak",
        explanation: "Step 1: take a heap dump with jcmd and open it in VisualVM or MAT. Step 2: sort by retained size; one HashMap holds most of the heap. Step 3: the path to the GC root shows the static field AuditService.SEEN. Step 4: the code adds every request and never removes anything. Step 5: fix it with a bounded cache that caps the size and expires old entries, or stop storing the data at all. Step 6: deploy and confirm in the GC logs that heap-after-GC stays flat.",
        code: {
          lang: "java",
          code: `public class AuditService {
  // Leak: grows on every request and is never cleared
  private static final Map<String, RequestInfo> SEEN = new HashMap<>();

  public void record(String requestId, RequestInfo info) {
    SEEN.put(requestId, info);
  }
}

// Fix: a bounded cache (Caffeine)
private final Cache<String, RequestInfo> seen = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(10))
    .build();`,
        },
      },
    ],
    cheatSheet: [
      "Default max heap is 1/4 of available memory, including inside containers",
      "Use -XX:MaxRAMPercentage=75 in containers instead of a fixed -Xmx",
      "-Xlog:gc*:file=gc.log turns on detailed GC logging (Java 9+)",
      "jcmd PID GC.heap_dump /tmp/app.hprof writes a heap dump",
      "-XX:+HeapDumpOnOutOfMemoryError captures the moment of failure",
      "Retained size, not shallow size, shows what really holds memory",
      "jstat -gcutil PID 1000 prints GC usage every second",
      "Exit code 137 in a container means the kernel killed the process for memory",
    ],
    quiz: [
      {
        q: "A Spring Boot app runs in a container with a 1 GB limit and no heap flags. What is the default maximum heap?",
        options: ["1 GB", "About 256 MB", "Unlimited", "64 MB"],
        answer: 1,
        why: "The container-aware JVM uses 25 percent of the container's memory limit by default.",
      },
      {
        q: "In a heap analyser, what does retained size mean?",
        options: ["Memory that would be freed if this object were collected", "The size of the object's own fields only", "The size of the object's class in metaspace", "How long the object has lived"],
        answer: 0,
        why: "Retained size includes everything kept alive only through that object.",
      },
      {
        q: "Your pod restarts with exit code 137, but the logs show no OutOfMemoryError. What is most likely?",
        options: ["The heap was full", "A StackOverflowError", "The process passed the container memory limit and was killed by the kernel", "Metaspace ran out"],
        answer: 2,
        why: "137 means SIGKILL; heap plus non-heap memory exceeded the limit before Java noticed.",
      },
      {
        q: "Which collector is designed for sub-millisecond pauses on large heaps?",
        options: ["Serial", "Parallel", "G1", "ZGC"],
        answer: 3,
        why: "ZGC does nearly all its work concurrently, keeping pauses very short regardless of heap size.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the maximum heap the JVM will use. Run it once with no flags and once with -Xmx256m, and compare.",
        hint: "Runtime.getRuntime().maxMemory() returns bytes.",
        solution: "public class Heap {\n  public static void main(String[] args) {\n    long mb = Runtime.getRuntime().maxMemory() / (1024 * 1024);\n    System.out.println(\"Max heap: \" + mb + \" MB\");\n  }\n}\n// java Heap.java\n// java -Xmx256m Heap.java   -> about 256 MB",
      },
      {
        level: "medium",
        task: "Write a recursive method that counts how deep it can go before StackOverflowError. Run it with the default stack and with -Xss4m and compare the depth.",
        hint: "Catch StackOverflowError once in main, only for this experiment.",
        solution: "public class Depth {\n  static int depth = 0;\n  static void dive() { depth++; dive(); }\n  public static void main(String[] args) {\n    try { dive(); } catch (StackOverflowError e) {\n      System.out.println(\"Depth: \" + depth);\n    }\n  }\n}\n// java Depth.java        -> e.g. tens of thousands\n// java -Xss4m Depth.java -> several times deeper",
      },
      {
        level: "hard",
        task: "Write a program that leaks memory into a static list, run it with -Xmx128m and -XX:+HeapDumpOnOutOfMemoryError, then open the dump and find the field holding the memory.",
        hint: "Add 1 MB byte arrays in a loop with a short sleep so you can watch it grow.",
        solution: "public class Leak {\n  static final List<byte[]> HOLD = new ArrayList<>();\n  public static void main(String[] args) throws Exception {\n    while (true) { HOLD.add(new byte[1024 * 1024]); Thread.sleep(10); }\n  }\n}\n// java -Xmx128m -XX:+HeapDumpOnOutOfMemoryError Leak.java\n// Open java_pid*.hprof in VisualVM or MAT: the biggest retained object\n// is the ArrayList, and its GC root is the static field Leak.HOLD.",
      },
    ],
    faq: [
      { q: "Does calling System.gc() help?", a: "Usually not. It is only a hint, it can trigger an expensive full collection, and the GC already knows better when to run. Fix what holds memory instead." },
      { q: "Can Java have memory leaks if it has a garbage collector?", a: "Yes. The GC only frees unreachable objects, so anything still referenced, such as entries in a static map, a listener list or a ThreadLocal in a pooled thread, stays forever." },
      { q: "What is the difference between StackOverflowError and OutOfMemoryError?", a: "StackOverflowError means one thread's stack is full, almost always from too-deep or endless recursion. OutOfMemoryError means a shared memory area, usually the heap, is exhausted." },
      { q: "Should I set -Xms equal to -Xmx?", a: "For servers it is common, because the heap never has to grow or shrink and memory use is predictable. In containers, percentage flags such as MaxRAMPercentage are often easier to manage." },
    ],
  },
};

export default extra;
