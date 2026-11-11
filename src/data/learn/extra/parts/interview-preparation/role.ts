import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "role/java-qs": {
    plain: [
      "Java interviews rarely ask you to recite an API. They ask why it works the way it does. Why does HashMap need hashCode? Why is String immutable? Why does @Transactional sometimes do nothing? If you can explain the mechanism, you can answer the follow-up questions too.",
      "Most questions come from five areas: collections (HashMap, ConcurrentHashMap), object rules (equals, hashCode, immutability), threads (locks, volatile, executors), the JVM (memory areas and garbage collection) and Spring (beans, dependency injection, proxies, transactions).",
      "A good answer has three parts: what it does, how it works inside, and when it goes wrong. For example: HashMap stores entries in buckets, picks the bucket from the hash code, and becomes slow if many keys share a bucket. That last part is what shows real experience.",
      "Practise saying answers out loud in about one minute each, then be ready to go one level deeper. Short code snippets on a whiteboard, like a correct equals method or a thread-safe counter, make your answer concrete.",
    ],
    deepDive: [
      {
        heading: "HashMap deeper: capacity, resize and tree bins",
        body: "A HashMap starts with 16 buckets and a load factor of 0.75, so it resizes when it holds more than 12 entries. Capacity is always a power of two, which lets it find the bucket with hash & (n - 1) instead of a slow modulo. Before that, it mixes the high bits of hashCode into the low bits, so keys that differ only in high bits still spread out.\n\nOn resize, the table doubles and each entry either stays at index i or moves to i + oldCapacity, depending on one bit. If one bucket grows to 8 entries and the table has at least 64 buckets, that bucket becomes a red-black tree, so worst-case lookups are O(log n) instead of O(n). If the table is smaller, it resizes instead. Trees turn back into lists when they shrink to 6.\n\nHashMap allows one null key (stored in bucket 0) and is not thread-safe. Its iterators are fail-fast: changing the map while iterating throws ConcurrentModificationException.",
        bullets: ["Pre-size with new HashMap<>(expected * 4 / 3 + 1) to avoid resizes", "Treeify needs 8 nodes in a bucket and capacity 64 or more", "Mutable keys break lookups if their hashCode changes after insertion"],
      },
      {
        heading: "How ConcurrentHashMap stays fast and safe",
        body: "In Java 7 ConcurrentHashMap used segments, each with its own lock. Since Java 8 it locks per bucket instead. Reads never lock: the table and node values are read with volatile semantics, so a get sees the latest completed write. To insert into an empty bucket, it uses a CAS (compare-and-swap) instruction with no lock at all. To change a non-empty bucket, it synchronises on that bucket's first node only, so threads writing to different buckets never wait for each other.\n\nResizing is shared: threads that touch the map during a resize help move buckets. size() is computed from a set of counter cells, like LongAdder, so it is an estimate during heavy writes. Iterators are weakly consistent: they never throw ConcurrentModificationException and may or may not show changes made during iteration.\n\nUse compute, merge and putIfAbsent for atomic read-modify-write. A separate get followed by put is two operations and is not atomic.",
        visual: {
          type: "flow",
          title: "ConcurrentHashMap.put since Java 8",
          steps: [
            { label: "Spread the hash", detail: "Same bit mixing as HashMap" },
            { label: "Bucket empty?", detail: "CAS the new node in, no lock" },
            { label: "Resize running?", detail: "Help move buckets, then retry" },
            { label: "Lock first node", detail: "synchronized on that one bucket" },
            { label: "Insert or replace", detail: "Treeify long bins, update counters" },
          ],
        },
      },
      {
        heading: "Threads: synchronized, locks, volatile and the memory model",
        body: "The Java Memory Model defines happens-before rules. An unlock happens-before the next lock of the same monitor, and a volatile write happens-before every later read of that field. Without such a rule, one thread may never see another's write, because of CPU caches and compiler reordering.\n\nsynchronized gives both mutual exclusion and visibility, and it is reentrant (the same thread can enter again). ReentrantLock adds tryLock with a timeout, interruptible waiting and optional fairness, but you must unlock in a finally block. volatile only gives visibility and ordering: count++ on a volatile field is still a read, an add and a write, so two threads can lose updates. Use AtomicInteger (CAS based) or LongAdder for counters.\n\nFor real code, prefer an ExecutorService or virtual threads (final in Java 21) over raw new Thread. Virtual threads are cheap enough for one per request, which suits blocking I/O code.",
        bullets: ["wait and notify must be called while holding the object's monitor", "Always call wait inside a while loop that re-checks the condition", "Double-checked locking needs the field to be volatile", "A static synchronized method locks the Class object, not the instance"],
      },
      {
        heading: "JVM memory areas and garbage collection",
        body: "The heap holds objects and is shared by all threads. Most collectors split it into a young generation (Eden plus two survivor spaces) and an old generation, because most objects die young. A minor GC copies live young objects to a survivor space; objects that survive several cycles are promoted to old. Each thread also has its own stack of frames for local variables; deep recursion gives StackOverflowError. Class metadata lives in Metaspace, in native memory, which replaced PermGen in Java 8.\n\nG1 is the default collector since Java 9. It splits the heap into regions and aims for a pause target (200 ms by default, set with -XX:MaxGCPauseMillis). ZGC targets sub-millisecond pauses on very large heaps, and since JDK 23 runs in generational mode by default. Know -Xms and -Xmx for initial and maximum heap, and the different OutOfMemoryError messages: Java heap space, Metaspace, and unable to create native thread.",
        visual: {
          type: "layers",
          title: "Where JVM memory goes",
          layers: [
            { label: "Thread stacks", detail: "One per thread, frames and locals" },
            { label: "Young generation", detail: "Eden and two survivor spaces" },
            { label: "Old generation", detail: "Long-lived objects, promoted from young" },
            { label: "Metaspace", detail: "Class metadata, native memory" },
            { label: "Code cache and direct buffers", detail: "JIT-compiled code, NIO buffers" },
          ],
        },
      },
      {
        heading: "Spring beans, proxies and @Transactional",
        body: "The Spring container creates beans in steps: instantiate, inject dependencies, run BeanPostProcessors before init, call @PostConstruct, then run BeanPostProcessors after init. That last step is where Spring may replace your bean with a proxy. Beans are singletons by default, one instance per container, so they must not keep per-request state in fields.\n\nA proxy is a wrapper around your bean. Spring uses a JDK dynamic proxy when it proxies through an interface, and a CGLIB subclass otherwise; Spring Boot uses CGLIB by default. When another bean calls a @Transactional method, the call goes through the proxy, which opens a transaction, calls your method, and commits or rolls back.\n\nThis explains the classic traps. A call from one method to another in the same class uses this, not the proxy, so the annotation is skipped. Private methods cannot be intercepted. By default, rollback happens only for unchecked exceptions (RuntimeException and Error); add rollbackFor for checked ones. The default propagation is REQUIRED (join or start); REQUIRES_NEW suspends the outer transaction.",
        bullets: ["Constructor injection makes dependencies final and easy to test", "Fix self-invocation by moving the method to another bean", "@Transactional(readOnly = true) can enable read optimisations"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Why self-invocation skips @Transactional",
        actors: ["Controller", "Proxy", "OrderService"],
        messages: [
          { from: 0, to: 1, label: "placeOrder()" },
          { from: 1, to: 1, label: "Begin transaction" },
          { from: 1, to: 2, label: "placeOrder() on real bean" },
          { from: 2, to: 2, label: "this.audit(): no proxy, no new tx" },
          { from: 2, to: 1, label: "Return normally" },
          { from: 1, to: 0, label: "Commit and return" },
        ],
      },
    ],
    examples: [
      {
        title: "A thread-safe hit counter, three ways",
        explanation: "The interviewer asks you to count page hits from many threads. Step 1: show the bug, a plain int with count++ loses updates because it is read, add, write. Step 2: fix with synchronized, correct but every thread waits on one lock. Step 3: fix with AtomicInteger, which uses CAS and no lock. Step 4: for very high contention, use LongAdder, which spreads updates across cells and sums them on read. For counts per page, use ConcurrentHashMap.merge, which is atomic per key.",
        code: {
          lang: "java",
          code: "class Counter {\n  private int plain;                            // broken: lost updates\n  private final AtomicInteger atomic = new AtomicInteger();\n  private final LongAdder adder = new LongAdder();\n  private final ConcurrentHashMap<String, Long> perPage = new ConcurrentHashMap<>();\n\n  void hit(String page) {\n    plain++;                                    // not atomic\n    atomic.incrementAndGet();                   // CAS loop\n    adder.increment();                          // best under heavy contention\n    perPage.merge(page, 1L, Long::sum);         // atomic per key\n  }\n}",
        },
      },
      {
        title: "Diagnosing an OutOfMemoryError in production",
        explanation: "A service dies with java.lang.OutOfMemoryError: Java heap space after running for two days. Step 1: say it is probably a leak, not a too-small heap, because it grows slowly. Step 2: make sure the JVM writes a heap dump on OOM with -XX:+HeapDumpOnOutOfMemoryError. Step 3: open the dump in Eclipse MAT or VisualVM and look at the dominator tree for the biggest retained objects. Step 4: typical culprits are a static map used as a cache with no eviction, listeners never removed, or ThreadLocal values in pooled threads. Step 5: fix with a bounded cache such as Caffeine, and watch heap after GC in your metrics.",
        code: {
          lang: "bash",
          code: "java -Xms1g -Xmx1g \\\n  -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/dumps \\\n  -Xlog:gc*:file=/var/log/app/gc.log \\\n  -jar app.jar\n\njcmd <pid> GC.heap_info          # current heap usage\njcmd <pid> GC.class_histogram    # object counts by class\njcmd <pid> GC.heap_dump /tmp/heap.hprof",
        },
      },
    ],
    cheatSheet: [
      "HashMap: 16 buckets, load factor 0.75, index = hash & (n - 1), treeify at 8 when capacity is 64+",
      "ConcurrentHashMap: lock-free reads, CAS into empty bins, synchronized on the bin head otherwise",
      "volatile = visibility and ordering, not atomicity; use AtomicInteger or LongAdder for counters",
      "Override equals and hashCode together; records generate both",
      "G1 is the default GC since Java 9; Metaspace replaced PermGen in Java 8",
      "@Transactional rolls back on unchecked exceptions by default; self-calls skip the proxy",
      "Spring beans are singletons by default: no per-request state in fields",
    ],
    quiz: [
      {
        q: "A HashMap with default settings has 12 entries. What happens when you add the 13th?",
        options: ["Nothing until it reaches 16", "The table doubles to 32 buckets", "The bucket becomes a tree", "It throws an exception"],
        answer: 1,
        why: "The threshold is capacity times load factor, 16 times 0.75 = 12, so going past it triggers a resize.",
      },
      {
        q: "Why is count++ on a volatile int still unsafe across threads?",
        options: ["volatile fields cannot be changed", "volatile disables the CPU cache entirely", "The JVM ignores volatile on ints", "It is a read, an add and a write, and two threads can interleave them"],
        answer: 3,
        why: "volatile makes each read and write visible but does not make the three steps one atomic action.",
      },
      {
        q: "A @Transactional method throws a checked IOException. With default settings, what happens?",
        options: ["The transaction commits", "The transaction rolls back", "Spring retries the method", "The exception is swallowed"],
        answer: 0,
        why: "By default Spring rolls back only on RuntimeException and Error, so add rollbackFor = IOException.class if needed.",
      },
      {
        q: "Which statement about ConcurrentHashMap iterators is true?",
        options: ["They throw ConcurrentModificationException", "They lock the whole map", "They are weakly consistent and never throw ConcurrentModificationException", "They always show every concurrent change"],
        answer: 2,
        why: "They reflect the map at some point during iteration and tolerate concurrent changes.",
      },
      {
        q: "A Java service crashes with OutOfMemoryError: Metaspace. What is the most likely cause?",
        options: ["Too many large arrays on the heap", "Too much class metadata, for example from a class loader leak or many generated classes", "Deep recursion", "Too many open files"],
        answer: 1,
        why: "Metaspace holds class metadata, so it fills when classes keep being loaded and never unloaded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a final, immutable Money class with amount and currency, correct equals and hashCode, and a plus method that returns a new object.",
        hint: "final class, private final fields, no setters, Objects.hash.",
        solution: "public final class Money {\n  private final long cents; private final String currency;\n  public Money(long cents, String currency) { this.cents = cents; this.currency = Objects.requireNonNull(currency); }\n  public Money plus(Money o) {\n    if (!currency.equals(o.currency)) throw new IllegalArgumentException(\"currency\");\n    return new Money(cents + o.cents, currency);\n  }\n  @Override public boolean equals(Object o) {\n    return o instanceof Money m && m.cents == cents && m.currency.equals(currency);\n  }\n  @Override public int hashCode() { return Objects.hash(cents, currency); }\n}",
      },
      {
        level: "medium",
        task: "Count word frequencies from many threads into one shared map without losing updates and without a global lock.",
        hint: "ConcurrentHashMap has an atomic method that combines the old and new value.",
        solution: "ConcurrentHashMap<String, Integer> freq = new ConcurrentHashMap<>();\n\nvoid add(String word) {\n  freq.merge(word, 1, Integer::sum);   // atomic per key\n}\n// Wrong: Integer c = freq.get(w); freq.put(w, c == null ? 1 : c + 1);\n// That is two separate operations, so two threads can both read the same c.",
      },
      {
        level: "hard",
        task: "OrderService.placeOrder() calls this.saveAudit(), which is annotated @Transactional(propagation = REQUIRES_NEW), but the audit row is rolled back with the order. Explain why and fix it.",
        hint: "Who handles the annotation, and does a call through this reach it?",
        solution: "The annotation is handled by the Spring proxy. this.saveAudit() calls the\nreal object directly, so no new transaction starts and the audit joins the\nouter one, rolling back with it.\nFix: move saveAudit into its own bean and inject it.\n\n@Service class AuditService {\n  @Transactional(propagation = Propagation.REQUIRES_NEW)\n  public void saveAudit(Order o) { repo.save(new Audit(o)); }\n}\n// OrderService calls auditService.saveAudit(order), which goes through the proxy.",
      },
    ],
    faq: [
      { q: "Why is String immutable in Java?", a: "Immutability makes strings safe to share between threads, lets the JVM reuse literals from the string pool, and lets String cache its hash code. It also stops a value like a file path from changing after a security check." },
      { q: "What is the difference between HashMap and Hashtable?", a: "Hashtable is a legacy class where every method is synchronized and nulls are not allowed. HashMap is unsynchronised and allows one null key; for concurrency use ConcurrentHashMap instead of either." },
      { q: "Should I use virtual threads for everything now?", a: "They are great for many blocking I/O tasks, such as one per HTTP request. They do not make CPU-heavy work faster, and you should still limit access to scarce resources like database connections." },
      { q: "What is the difference between @Component, @Service and @Repository?", a: "All three register a bean. @Service and @Repository are specialisations that describe intent, and @Repository also enables translation of persistence exceptions into Spring's DataAccessException." },
    ],
  },

  "role/devops-qs": {
    plain: [
      "DevOps interviews feel different from coding rounds. Instead of a puzzle, you get a story: the site is down, a pod keeps restarting, or the team wants faster releases. The interviewer wants to see how you think when things are uncertain.",
      "A good answer follows a calm method. First gather facts with real commands. Then form a guess about the cause. Then test it and fix it. Say each step out loud, including the commands you would type, so the interviewer can follow your reasoning.",
      "You also need to know the tools well enough to explain how they work inside. What is a Docker layer? How do two containers talk to each other? What does Kubernetes do when a probe fails? These details turn a generic answer into a convincing one.",
      "Finally, show judgement. Every choice has a cost. Blue-green gives instant rollback but doubles your servers. A long CI pipeline catches more bugs but slows everyone down. Naming the trade-off is often what separates a senior answer from a junior one.",
    ],
    deepDive: [
      {
        heading: "Docker images and layers under the hood",
        body: "An image is a stack of read-only layers plus a config (entrypoint, environment, exposed ports). In a Dockerfile, RUN, COPY and ADD each create a filesystem layer; instructions like ENV and CMD only change the config. Layers are identified by a hash of their content and shared between images, so ten images built FROM the same base store that base once.\n\nWhen a container starts, Docker adds a thin writable layer on top, using the overlay2 storage driver. Reads fall through to the first layer that has the file. Writing to a file from a lower layer first copies it up into the writable layer. Deleting a file only hides it, so a file removed in a later RUN still makes the image bigger.\n\nThe build cache reuses a layer if the instruction and its inputs have not changed, and every layer after a changed one is rebuilt. That is why you copy the dependency file and install dependencies before copying the source code.",
        bullets: ["Multi-stage builds: compile in one stage, copy only the result into a small runtime image", "docker history image shows the size of each layer", "Use .dockerignore to keep .git and node_modules out of the build context", "Put rm in the same RUN that created the files, or they stay in an earlier layer"],
      },
      {
        heading: "Container networking in one picture",
        body: "By default, containers join the bridge network. Docker creates a virtual bridge (docker0) on the host and gives each container a private IP and a virtual ethernet pair. Outbound traffic is NATed through the host. Inbound traffic needs a published port: -p 8080:80 forwards host port 8080 to port 80 in the container.\n\nOn the default bridge, containers cannot find each other by name. On a user-defined bridge network (docker network create app), Docker runs an embedded DNS server, so the api container can reach the db container at db:5432. Docker Compose creates such a network for you, which is why service names just work there.\n\nOther modes: host shares the host's network stack (no isolation, no port mapping needed, Linux only in practice) and none gives no network at all. In Kubernetes, all containers in one pod share a network namespace, so they talk over localhost, and every pod gets its own IP.",
        visual: {
          type: "flow",
          title: "A request reaching a container",
          steps: [
            { label: "Client", detail: "Calls host-ip:8080" },
            { label: "Host port mapping", detail: "-p 8080:80 rule, NAT to the container" },
            { label: "Bridge network", detail: "Virtual switch on the host" },
            { label: "Container eth0", detail: "Private IP like 172.18.0.3" },
            { label: "App on port 80", detail: "Must listen on 0.0.0.0, not 127.0.0.1" },
          ],
        },
      },
      {
        heading: "Reading exit codes and pod states",
        body: "When a container stops, its exit code tells you a lot. 0 means it finished, which still causes restarts if a Deployment expects a long-running process. 1 is a generic application error, so read the logs. 127 means the command was not found, often a typo in the entrypoint or a missing binary in a slim image. 137 is 128 + 9 (SIGKILL), usually the kernel OOM killer when the container passes its memory limit; describe shows Reason: OOMKilled. 143 is 128 + 15 (SIGTERM), a normal stop request.\n\nCrashLoopBackOff is not an error by itself; it means the container keeps exiting and the kubelet waits longer between restarts: 10 seconds, doubling up to a 5 minute cap. A failing liveness probe also causes restarts, so check probe settings when the app starts slowly. Other states point elsewhere: ImagePullBackOff means a wrong image name or missing registry credentials, Pending is usually a scheduling problem, and CreateContainerConfigError is often a missing ConfigMap or Secret.",
        bullets: ["kubectl describe pod: Last State, Reason, Exit Code, Events", "kubectl logs pod --previous: output of the crashed run", "kubectl get events --sort-by=.lastTimestamp: recent cluster events"],
      },
      {
        heading: "Designing a CI/CD pipeline out loud",
        body: "Start from goals: fast feedback for developers, the same artifact promoted through every environment, and a safe, quick path to roll back. Then describe stages. On every pull request: lint, unit tests and a build, ideally under ten minutes. On merge to main: build the image once, tag it with the commit SHA, scan it for vulnerabilities, push to a registry, deploy to staging, run integration or smoke tests. Production deploys use the same image, behind a manual approval or automatically with a canary.\n\nMention the details that show experience: cache dependencies between runs, run independent jobs in parallel, keep secrets in the CI secret store or fetch them with OIDC instead of long-lived keys, and never rebuild per environment, because then you test one thing and ship another. With GitOps tools like Argo CD, the pipeline only updates the image tag in a Git repo, and the cluster pulls the change.",
        visual: {
          type: "flow",
          title: "Build once, promote everywhere",
          steps: [
            { label: "Pull request", detail: "Lint, unit tests, build" },
            { label: "Merge to main", detail: "Build image, tag with commit SHA" },
            { label: "Scan and push", detail: "Vulnerability scan, push to registry" },
            { label: "Staging", detail: "Deploy, smoke and integration tests" },
            { label: "Production", detail: "Same image, approval or canary" },
          ],
        },
      },
      {
        heading: "Handling a production outage scenario",
        body: "Interviewers want structure, not heroics. 1. Acknowledge and assess impact: which users, how many, since when. Check dashboards for the four golden signals: latency, traffic, errors and saturation. 2. Communicate early: open an incident channel, name an incident commander, post status updates. 3. Find what changed. Most outages follow a deploy, a config change, a certificate expiry or a traffic spike. 4. Mitigate first: roll back, scale up, disable a feature flag or fail over. Restoring service beats finding the root cause. 5. Resolve and verify the metrics are back to normal. 6. Write a blameless postmortem with a timeline, root cause, what went well and action items with owners.\n\nUse SLOs to talk about impact: if the SLO is 99.9% availability per month, the error budget is about 43 minutes of downtime, and this incident spent part of it.",
        bullets: ["Mitigate first, investigate second", "Ask: what changed in the last hour?", "99.9% monthly availability allows about 43 minutes of downtime"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Rolling update knobs vs canary tooling",
        columns: [
          { title: "Kubernetes rolling update", points: ["maxSurge: extra pods allowed, default 25%", "maxUnavailable: pods allowed down, default 25%", "Readiness probe gates each new pod", "kubectl rollout undo to go back"] },
          { title: "Canary with a rollout tool", points: ["Shift 5%, then 25%, then 100% of traffic", "Needs a mesh or ingress that splits traffic", "Automatic analysis of error rate and latency", "Argo Rollouts or Flagger are common"] },
        ],
      },
    ],
    examples: [
      {
        title: "Shrinking a 1.2 GB Python image",
        explanation: "Interview prompt: our image is huge and builds slowly. Step 1: check docker history to see which layers are big. Step 2: start from a slim base instead of the full one. Step 3: copy requirements.txt first and install, so code changes do not reinstall dependencies. Step 4: use --no-cache-dir so pip does not keep its download cache in the layer. Step 5: run as a non-root user. Step 6: add a .dockerignore for .git, tests and local venvs. The result is often a few hundred megabytes and rebuilds in seconds when only code changes.",
        code: {
          lang: "dockerfile",
          code: "FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nRUN useradd --create-home app\nUSER app\nEXPOSE 8000\nCMD [\"gunicorn\", \"-b\", \"0.0.0.0:8000\", \"app:app\"]",
        },
      },
      {
        title: "Latency spike after a deploy",
        explanation: "Scenario: p99 latency jumped from 200 ms to 3 seconds ten minutes after a release. Step 1: check impact on the dashboard, error rate is flat but latency is high. Step 2: correlate with the deploy time, it matches. Step 3: mitigate by rolling back the Deployment, and confirm latency recovers. Step 4: now investigate calmly: compare the diff, check slow query logs and traces. Suppose a new query lacks an index. Step 5: fix with an index, add a load test to CI, and write the postmortem. Saying rollback before root cause is the key point.",
        code: {
          lang: "bash",
          code: "kubectl rollout history deployment/api -n shop\nkubectl rollout undo deployment/api -n shop\nkubectl rollout status deployment/api -n shop\nkubectl top pods -n shop          # CPU and memory per pod\nkubectl logs deploy/api -n shop --since=15m | grep -i slow",
        },
      },
    ],
    cheatSheet: [
      "RUN, COPY and ADD create layers; order Dockerfile steps from rarely changed to often changed",
      "User-defined bridge networks give DNS by container name; the default bridge does not",
      "Exit 137 = SIGKILL, often OOMKilled; 143 = SIGTERM; 127 = command not found",
      "CrashLoopBackOff delay doubles from 10 s up to a 5 minute cap",
      "Build the image once, tag it with the commit SHA, promote the same image to every environment",
      "In an outage: assess, communicate, find what changed, mitigate, then find root cause",
      "Rolling update defaults: maxSurge 25% and maxUnavailable 25%",
    ],
    quiz: [
      {
        q: "A Dockerfile runs COPY . . before RUN pip install -r requirements.txt. What is the problem?",
        options: ["The image will not run", "pip cannot read the file", "Any code change invalidates the cache, so dependencies reinstall on every build", "COPY must always be last"],
        answer: 2,
        why: "A changed layer rebuilds every layer after it, so copy only requirements.txt before installing.",
      },
      {
        q: "Two containers on Docker's default bridge network cannot reach each other by name. What fixes it?",
        options: ["Put them on a user-defined bridge network", "Use -p on both containers", "Restart the Docker daemon", "Add EXPOSE to both Dockerfiles"],
        answer: 0,
        why: "User-defined networks include Docker's embedded DNS, which resolves container names.",
      },
      {
        q: "A pod shows Last State: Terminated, Reason: OOMKilled, Exit Code: 137. What is the best first fix to consider?",
        options: ["Increase the liveness probe timeout", "Change the image pull policy", "Delete the namespace", "Check actual memory use and raise the memory limit or fix the leak"],
        answer: 3,
        why: "The container went over its memory limit and the kernel killed it.",
      },
      {
        q: "Which deployment strategy gives instant rollback by switching traffic, at the cost of running two full environments?",
        options: ["Rolling update", "Blue-green", "Recreate", "Canary"],
        answer: 1,
        why: "Blue-green keeps the old environment running, so rollback is just pointing traffic back.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run nginx with port 8080 on your machine mapped to port 80 in the container, then find the container's IP and its exit code after you stop it.",
        hint: "docker run -d -p, docker inspect, docker stop.",
        solution: "docker run -d --name web -p 8080:80 nginx\ncurl -I http://localhost:8080\ndocker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' web\ndocker stop web\ndocker inspect -f '{{.State.ExitCode}}' web   # nginx usually exits 0 on SIGTERM",
      },
      {
        level: "medium",
        task: "Create a pod that gets OOMKilled on purpose, then use kubectl to prove why it died.",
        hint: "Give a container a 50Mi limit and make it allocate more memory.",
        solution: "kubectl run hog --image=python:3.12-slim --restart=Never \\\n  --overrides='{\"spec\":{\"containers\":[{\"name\":\"hog\",\"image\":\"python:3.12-slim\",\n  \"command\":[\"python\",\"-c\",\"x=bytearray(200*1024*1024)\"],\n  \"resources\":{\"limits\":{\"memory\":\"50Mi\"}}}]}}'\nkubectl get pod hog            # STATUS OOMKilled\nkubectl describe pod hog | grep -A3 'State'\n# Reason: OOMKilled, Exit Code: 137",
      },
      {
        level: "hard",
        task: "Write a short outline answer for: design a CI/CD pipeline for 20 microservices in one monorepo, deploying to Kubernetes.",
        hint: "Think about building only what changed, artifacts, environments, safety and rollback.",
        solution: "1. PR: detect changed services by path, lint and test only those, in parallel\n2. Merge: build changed images once, tag with commit SHA, scan, push\n3. GitOps: CI updates image tags in a deploy repo; Argo CD syncs staging\n4. Staging: smoke tests per service, contract tests between services\n5. Production: canary 5% then 100% with automatic metric checks\n6. Rollback: revert the tag commit; old image is still in the registry\n7. Secrets via OIDC to the cloud, caches for dependencies, under 10 min PR feedback",
      },
    ],
    faq: [
      { q: "What is the difference between CMD and ENTRYPOINT?", a: "ENTRYPOINT sets the executable that always runs, and CMD gives default arguments that docker run can override. If only CMD is set, the whole command can be replaced at run time." },
      { q: "What is the difference between a liveness and a readiness probe?", a: "A failing liveness probe makes the kubelet restart the container. A failing readiness probe only removes the pod from Service endpoints, so it stops receiving traffic without being restarted." },
      { q: "Canary or blue-green: which is better?", a: "Neither always wins. Blue-green is simpler and rolls back instantly but needs double capacity; canary limits risk with real traffic and needs traffic splitting and good metrics." },
      { q: "How do I practise DevOps scenario questions?", a: "Break things on purpose in a local cluster like kind or minikube: wrong image tags, low memory limits, failing probes, missing secrets. Then practise diagnosing each one aloud with kubectl." },
    ],
  },

  "role/sql-qs": {
    plain: [
      "SQL interview problems look different each time, but most use the same few patterns: group and count, join two tables, rank rows, compare a row with the row before it, or find rows that have no match. Once you can spot the pattern, writing the query is quick.",
      "Before writing anything, ask what one row of the answer should represent. One row per customer? Per day? Per department? This is called the grain. Most wrong answers come from mixing grains, for example joining orders to items and then counting orders twice.",
      "Window functions are the most powerful tool here. They calculate something across a group of rows, like a rank or a running total, but keep every row in the result. GROUP BY, on the other hand, squashes each group into one row.",
      "Interviewers also test edge cases. What if two people have the same salary? What if there is no second highest? What if a column has NULLs? Saying these out loud, even before you are asked, shows care and experience.",
    ],
    deepDive: [
      {
        heading: "The logical order a query runs in",
        body: "SQL is written SELECT first, but it is evaluated in a different order. First FROM and JOIN build the rows. Then WHERE filters individual rows. Then GROUP BY forms groups, and HAVING filters groups. Then SELECT computes output columns, including window functions. Then DISTINCT, then ORDER BY, then LIMIT or OFFSET.\n\nThis order explains many errors. You cannot use a window function in WHERE, because windows are computed after WHERE; wrap the query in a CTE and filter outside. You cannot filter an aggregate in WHERE; use HAVING. In standard SQL you cannot use a SELECT alias in WHERE either, though PostgreSQL and MySQL do allow aliases in ORDER BY. The planner may physically run things differently, but the result must match this logical order.",
        visual: {
          type: "flow",
          title: "Logical evaluation order of a SELECT",
          steps: [
            { label: "FROM and JOIN", detail: "Build the combined rows" },
            { label: "WHERE", detail: "Filter single rows" },
            { label: "GROUP BY and HAVING", detail: "Make groups, filter groups" },
            { label: "SELECT and windows", detail: "Compute columns, ranks, totals" },
            { label: "DISTINCT and ORDER BY", detail: "Remove duplicates, sort" },
            { label: "LIMIT", detail: "Keep the first N rows" },
          ],
        },
      },
      {
        heading: "Window functions beyond ranking",
        body: "A window function has the form f() OVER (PARTITION BY ... ORDER BY ...). PARTITION BY splits rows into groups that do not see each other; ORDER BY sets the order inside each group. Ranking functions (ROW_NUMBER, RANK, DENSE_RANK, NTILE) need ORDER BY.\n\nLAG(col) and LEAD(col) read the previous or next row, which solves day-over-day change and \"consecutive\" problems. SUM(amount) OVER (PARTITION BY user_id ORDER BY day) gives a running total. Watch the frame: with ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, which treats rows with equal ORDER BY values as one peer group. For a true row-by-row running total or a 7-day moving average, say ROWS BETWEEN 6 PRECEDING AND CURRENT ROW explicitly.\n\nAn aggregate with an empty OVER (), like COUNT(*) OVER (), adds the total to every row, which helps compute percentages of the whole.",
        bullets: ["LAG(x, 1, 0) gives a default of 0 for the first row", "FIRST_VALUE and LAST_VALUE depend on the frame; LAST_VALUE often needs ROWS BETWEEN ... UNBOUNDED FOLLOWING", "Percentage of total: amount * 100.0 / SUM(amount) OVER ()"],
      },
      {
        heading: "Anti-joins and the NOT IN trap",
        body: "\"Find customers who never ordered\" is an anti-join: rows in A with no match in B. Two safe ways: LEFT JOIN orders o ON ... WHERE o.id IS NULL, or WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id). Both are clear and well optimised.\n\nThe dangerous one is WHERE c.id NOT IN (SELECT customer_id FROM orders). If even one customer_id in orders is NULL, the comparison with NULL gives unknown, and the whole query returns zero rows. Interviewers love this trap. Prefer NOT EXISTS, or add WHERE customer_id IS NOT NULL inside the subquery.\n\nAlso know the join row counts: an inner join drops unmatched rows, a left join keeps all left rows, and a one-to-many join multiplies rows, so aggregate before joining or count DISTINCT when needed.",
      },
      {
        heading: "Gaps and islands: finding consecutive runs",
        body: "Problems like \"users who logged in three days in a row\" or \"find streaks\" are gaps-and-islands problems. The trick: number each user's rows by date with ROW_NUMBER, then subtract that number (as days) from the date. For consecutive dates, the date and the row number grow together, so the difference stays the same. Every run of consecutive days shares one constant value, called the island key.\n\nThen GROUP BY user and island key, and count the rows in each group to get streak lengths. Remove duplicate dates first (SELECT DISTINCT user_id, login_date), or repeats will break the pattern. LAG is an alternative: mark a row as a new streak when the date is not the previous date plus one, then a running SUM of those marks gives the island id.",
        visual: {
          type: "compare",
          title: "Island key: date minus row number",
          columns: [
            { title: "Login date", points: ["Jan 1", "Jan 2", "Jan 3", "Jan 6", "Jan 7"] },
            { title: "Row number", points: ["1", "2", "3", "4", "5"] },
            { title: "Date minus rn days", points: ["Dec 31 (island A)", "Dec 31 (island A)", "Dec 31 (island A)", "Jan 2 (island B)", "Jan 2 (island B)"] },
          ],
        },
      },
      {
        heading: "A routine for timed SQL rounds",
        body: "Timed rounds are usually 15 to 30 minutes per problem. Spend the first two minutes on the schema: primary keys, nullable columns, whether duplicates exist. Say the grain out loud. Then write the query as a chain of small CTEs, each doing one step, and run each step if the platform allows it. That makes debugging fast.\n\nCheck these edge cases before you say done: ties (RANK or DENSE_RANK instead of ROW_NUMBER?), NULLs in joins and aggregates (COUNT(col) skips NULLs, AVG ignores them), an empty result that must return NULL, and integer division (in PostgreSQL 7 / 2 is 3, so multiply by 1.0 or cast). If the question names a database, use its functions: DATE_TRUNC in PostgreSQL, DATE_FORMAT in MySQL.\n\nPractise on LeetCode's SQL 50, DataLemur or StrataScratch, timing yourself to around 10 minutes for easy and 20 for medium.",
        bullets: ["Ask: one output row per what?", "Write CTEs, test each one", "Check ties, NULLs, empty results, integer division"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Pick the pattern from the question",
        root: "SQL question",
        children: [
          { label: "Top N or Nth", children: ["DENSE_RANK for distinct values", "ROW_NUMBER for exactly one per group"] },
          { label: "Compare to previous row", children: ["LAG or LEAD", "Self-join on date + 1"] },
          { label: "Never or missing", children: ["LEFT JOIN ... IS NULL", "NOT EXISTS"] },
          { label: "Totals and ratios", children: ["GROUP BY with HAVING", "SUM(CASE WHEN ...) or FILTER"] },
          { label: "Streaks", children: ["Date minus ROW_NUMBER", "Running SUM of new-streak flags"] },
        ],
      },
    ],
    examples: [
      {
        title: "Top 3 distinct salaries per department",
        explanation: "Classic problem (LeetCode 185, Department Top Three Salaries). Step 1: grain is one row per employee who qualifies. Step 2: ties matter, the question says \"top three unique salaries\", so use DENSE_RANK, not ROW_NUMBER. Step 3: partition by department and order by salary descending. Step 4: filter in an outer query because window results are not available in WHERE. Step 5: join departments for the name. Edge case: a department with only two distinct salaries just returns those.",
        code: {
          lang: "sql",
          code: "WITH ranked AS (\n  SELECT e.name, e.salary, e.department_id,\n         DENSE_RANK() OVER (PARTITION BY e.department_id\n                            ORDER BY e.salary DESC) AS rnk\n  FROM employees e\n)\nSELECT d.name AS department, r.name AS employee, r.salary\nFROM ranked r\nJOIN departments d ON d.id = r.department_id\nWHERE r.rnk <= 3\nORDER BY d.name, r.salary DESC;",
        },
      },
      {
        title: "Day-over-day revenue change with conditional totals",
        explanation: "Prompt: show daily revenue, the change from the previous day, and revenue from refunds separately. Step 1: aggregate orders to one row per day first, because LAG must compare days, not orders. Step 2: use conditional aggregation to split sales and refunds in one pass. Step 3: apply LAG on the daily rows. Step 4: note that the first day has no previous value, so the change is NULL, which is honest. If days can be missing, mention joining to a generated calendar (generate_series in PostgreSQL).",
        code: {
          lang: "sql",
          code: "WITH daily AS (\n  SELECT DATE_TRUNC('day', created_at)::date AS day,\n         SUM(amount) FILTER (WHERE kind = 'sale')   AS sales,\n         SUM(amount) FILTER (WHERE kind = 'refund') AS refunds\n  FROM orders\n  GROUP BY 1\n)\nSELECT day, sales, refunds,\n       sales - LAG(sales) OVER (ORDER BY day) AS change_vs_prev\nFROM daily\nORDER BY day;",
        },
      },
    ],
    cheatSheet: [
      "Logical order: FROM, WHERE, GROUP BY, HAVING, SELECT (windows), DISTINCT, ORDER BY, LIMIT",
      "Filter on a window function in an outer query or CTE, never in the same WHERE",
      "Nth highest distinct: DENSE_RANK() = N, or SELECT DISTINCT ... ORDER BY ... LIMIT 1 OFFSET N-1",
      "Duplicates: GROUP BY col HAVING COUNT(*) > 1",
      "Never matched: LEFT JOIN ... WHERE right.id IS NULL, or NOT EXISTS (avoid NOT IN with NULLs)",
      "Running total: SUM(x) OVER (PARTITION BY k ORDER BY d ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
      "Streaks: date minus ROW_NUMBER() gives a constant key per consecutive run",
      "PostgreSQL integer division truncates: use 100.0 * a / b for percentages",
    ],
    quiz: [
      {
        q: "WHERE id NOT IN (SELECT customer_id FROM orders) returns no rows, though some customers never ordered. Why?",
        options: ["NOT IN is not valid SQL", "orders.customer_id contains a NULL", "The subquery needs DISTINCT", "NOT IN only works on numbers"],
        answer: 1,
        why: "Comparing with NULL gives unknown, so NOT IN can never be true when the list has a NULL.",
      },
      {
        q: "Salaries are 500, 400, 400, 300. What does RANK() OVER (ORDER BY salary DESC) give for 300?",
        options: ["3", "2", "5", "4"],
        answer: 3,
        why: "RANK leaves a gap after ties: 1, 2, 2, 4.",
      },
      {
        q: "Which query finds emails that appear more than once in users?",
        options: ["SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1", "SELECT email FROM users WHERE COUNT(*) > 1", "SELECT DISTINCT email FROM users", "SELECT email, ROW_NUMBER() OVER () FROM users"],
        answer: 0,
        why: "Aggregates cannot be used in WHERE; HAVING filters groups after GROUP BY.",
      },
      {
        q: "You need a 7-day moving average of daily sales, one row per day. Which frame is correct?",
        options: ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN 7 PRECEDING AND 7 FOLLOWING", "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "No frame; use GROUP BY"],
        answer: 2,
        why: "Six previous rows plus the current row make seven days, assuming no missing days.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From employees(id, name, salary), return the second highest distinct salary as second_highest, or NULL if there is none, without window functions.",
        hint: "An aggregate over zero rows returns NULL.",
        solution: "SELECT MAX(salary) AS second_highest\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);\n-- If all salaries are equal, the WHERE leaves no rows and MAX gives NULL.",
      },
      {
        level: "medium",
        task: "From logins(user_id, login_date), list users who logged in on at least 3 consecutive days.",
        hint: "Remove duplicate dates, then use date minus ROW_NUMBER as an island key.",
        solution: "WITH d AS (SELECT DISTINCT user_id, login_date FROM logins),\nk AS (\n  SELECT user_id, login_date,\n         login_date - (ROW_NUMBER() OVER (PARTITION BY user_id\n                       ORDER BY login_date))::int AS island\n  FROM d\n)\nSELECT DISTINCT user_id\nFROM k\nGROUP BY user_id, island\nHAVING COUNT(*) >= 3;",
      },
      {
        level: "hard",
        task: "Delete duplicate rows from users(id, email), keeping only the row with the smallest id for each email. Write it for PostgreSQL.",
        hint: "Number the rows per email, then delete the ones that are not first.",
        solution: "DELETE FROM users\nWHERE id IN (\n  SELECT id FROM (\n    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS rn\n    FROM users\n  ) t\n  WHERE rn > 1\n);\n-- Afterwards: CREATE UNIQUE INDEX ON users (email); to stop it happening again.",
      },
    ],
    faq: [
      { q: "What is the difference between WHERE and HAVING?", a: "WHERE filters individual rows before grouping. HAVING filters groups after GROUP BY, so it can use aggregates like COUNT(*) or SUM." },
      { q: "When should I use ROW_NUMBER instead of DENSE_RANK?", a: "Use ROW_NUMBER when you need exactly one row per group, such as the latest order per customer. Use DENSE_RANK when ties should share a position, such as the top three distinct salaries." },
      { q: "Where can I practise SQL interview questions?", a: "LeetCode's SQL 50 list, DataLemur and StrataScratch have real interview problems with checkers. Time yourself and run each CTE step separately to build speed." },
      { q: "Are CTEs slower than subqueries?", a: "In modern PostgreSQL (12 and later) simple CTEs are usually inlined, so they perform like subqueries. Use them for readability, and check EXPLAIN if performance matters." },
    ],
  },
};

export default extra;
