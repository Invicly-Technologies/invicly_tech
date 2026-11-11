import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "production/redis": {
    plain: [
      "A database keeps data safely on disk, but every query costs time. Redis keeps data in memory (RAM), so reading a value usually takes well under a millisecond. Teams put Redis in front of the database as a cache: a short-term copy of answers that are asked for again and again, like a product page or a list of open rooms.",
      "Think of a cache as a sticky note on your desk. Looking at the note is faster than walking to the filing cabinet. The danger is that the note can go out of date. So every cache needs two rules: when does a note expire on its own, and who throws it away when the real data changes?",
      "Redis is more than a simple key and value store. A key can hold a string, a hash (a small map of fields), a list, a set, a sorted set (a set ordered by a score, great for leaderboards) or a stream. You talk to it with short commands such as SET, GET, EXPIRE and DEL.",
      "In Spring Boot you rarely type those commands yourself. You add the Redis starter, turn on caching, and put @Cacheable on a method. Spring then checks Redis before running the method and saves the result afterwards. Your job is to pick what to cache, for how long, and when to remove it.",
    ],
    deepDive: [
      {
        heading: "Core data types and the commands behind them",
        body: "Each Redis key has exactly one type, and each type has its own commands. Strings hold text, numbers or serialized JSON: SET page:home \"...\" EX 600 stores a value that expires in 600 seconds, and INCR views:42 adds one atomically, which makes simple counters and rate limiters safe under load. Hashes store fields inside one key (HSET user:7 name Ana plan pro), so you can read or change one field without rewriting the whole object.\n\nLists (LPUSH, RPOP) work as simple queues. Sets (SADD, SISMEMBER) keep unique members, like the tags on a post. Sorted sets (ZADD, ZRANGE with REV) keep members ordered by a score, which is how leaderboards and \"top 10\" lists are built. Most commands on one key run in O(1) or O(log n) time, but commands like KEYS * scan everything and can freeze a busy server.",
        bullets: ["TTL key shows seconds left; -1 means no expiry, -2 means the key is gone", "Use SCAN instead of KEYS in production", "Name keys with colons: app:product:42", "Redis runs commands one at a time, so each command is atomic"],
      },
      {
        heading: "How Spring caching talks to Redis",
        body: "@EnableCaching makes Spring wrap your beans in a proxy. When a caller invokes a @Cacheable method, the proxy builds a key (by default from the method arguments), asks the cache, and only calls the real method on a miss. With the Redis cache manager the stored key looks like products::42: the cache name, two colons, then the key.\n\nBy default the value is stored with Java serialization, which is fragile when classes change and unreadable in redis-cli. Most teams configure a JSON serializer such as GenericJackson2JsonRedisSerializer in a RedisCacheConfiguration bean. That bean is also where you set a TTL per cache, so product data can live 10 minutes while exchange rates live 30 seconds.\n\nBecause it is a proxy, a call from one method to another inside the same class skips the cache. Put cached methods on a separate bean when this matters.",
        visual: {
          type: "flow",
          title: "One call to a @Cacheable method",
          steps: [
            { label: "Caller invokes find(42)", detail: "The call goes to the Spring proxy, not the bean" },
            { label: "Build the key", detail: "Cache name plus key, e.g. products::42" },
            { label: "Ask Redis", detail: "GET on the full key" },
            { label: "Hit: return it", detail: "The method body never runs" },
            { label: "Miss: run method", detail: "Query the database, then SET with the TTL" },
          ],
        },
      },
      {
        heading: "TTLs and what happens when memory is full",
        body: "A TTL (time to live) is a safety net: even if you forget to evict a key, it disappears on its own. Pick it from how stale the data may be. A product description can be 10 minutes old; a bank balance should not be cached at all.\n\nRedis also needs a rule for a full memory. You set a limit with maxmemory and choose a policy with maxmemory-policy. The default, noeviction, refuses new writes with an error. For a pure cache, allkeys-lru (drop the least recently used keys) or allkeys-lfu (drop the least frequently used) is the usual choice. The volatile-* variants only remove keys that have a TTL, which suits a Redis that holds both cache data and data you must keep.\n\nIf many hot keys expire at the same second, the database gets a burst of misses. Add a little random jitter to TTLs to spread them out.",
        bullets: ["noeviction: writes fail when full (default)", "allkeys-lru / allkeys-lfu: typical for caches", "volatile-ttl: evict keys closest to expiry first", "INFO memory shows used_memory and the policy in use"],
      },
      {
        heading: "Keeping the cache correct on writes",
        body: "There are three common write strategies. Evict on write: after updating the database, delete the cached key (@CacheEvict) so the next read reloads fresh data. Update on write: put the new value straight into the cache (@CachePut), which avoids one miss but risks caching a value from a transaction that later rolls back. Expiry only: rely on a short TTL and accept a little staleness.\n\nEvict on write is the safest default. Do it after the database commit, not before, or a reader can reload the old row into the cache between your eviction and your commit. Spring helps here: building the cache manager with transactionAware() delays puts and evictions until the surrounding transaction commits.\n\nFor list caches, such as all products in a category, one change can affect many keys. @CacheEvict(allEntries = true) clears a whole cache, which is simple but heavy, so keep such caches small.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to handle writes",
        columns: [
          { title: "Evict on write", points: ["@CacheEvict after the update", "Next read reloads from the database", "Safest default", "One extra miss per change"] },
          { title: "Update on write", points: ["@CachePut stores the new value", "No miss after a change", "Risky if the transaction rolls back", "Method always runs"] },
          { title: "TTL only", points: ["No eviction code at all", "Data can be stale until expiry", "Fine for slow-changing data", "Pick a short TTL"] },
        ],
      },
    ],
    examples: [
      {
        title: "Try the data types in redis-cli",
        explanation: "Start Redis in Docker, open redis-cli inside the container, and try a string with a TTL, an atomic counter, a hash and a sorted set. Watch the TTL count down, and notice that INCR works on a value stored as text because Redis treats numeric strings as numbers.",
        code: {
          lang: "bash",
          code: "docker run -d --name redis -p 6379:6379 redis:7\ndocker exec -it redis redis-cli\nSET product:42 '{\"name\":\"Mug\"}' EX 600\nTTL product:42            # (integer) 600, then counting down\nINCR views:42             # (integer) 1\nHSET user:7 name Ana plan pro\nHGET user:7 plan          # \"pro\"\nZADD scores 120 ana 95 bob\nZRANGE scores 0 -1 REV WITHSCORES",
        },
      },
      {
        title: "Per-cache TTLs and JSON values in Spring Boot",
        explanation: "The product cache should live 10 minutes and the rates cache 30 seconds, and values should be readable JSON. Step 1: add spring-boot-starter-data-redis and spring-boot-starter-cache, and set spring.data.redis.host. Step 2: define a default RedisCacheConfiguration with a JSON serializer. Step 3: give individual caches their own TTL with a builder customizer. Step 4: check with redis-cli GET \"products::42\".",
        code: {
          lang: "java",
          code: "@Configuration\n@EnableCaching\nclass CacheConfig {\n  @Bean\n  RedisCacheConfiguration cacheDefaults() {\n    return RedisCacheConfiguration.defaultCacheConfig()\n      .entryTtl(Duration.ofMinutes(10))\n      .serializeValuesWith(RedisSerializationContext.SerializationPair\n        .fromSerializer(new GenericJackson2JsonRedisSerializer()));\n  }\n  @Bean\n  RedisCacheManagerBuilderCustomizer perCacheTtl(RedisCacheConfiguration base) {\n    return b -> b.withCacheConfiguration(\"rates\", base.entryTtl(Duration.ofSeconds(30)));\n  }\n}",
        },
      },
    ],
    cheatSheet: [
      "Default Redis port is 6379; check a server with redis-cli PING (answers PONG)",
      "SET key value EX 600 stores a value with a 10 minute TTL",
      "Spring Redis cache keys look like cacheName::key, for example products::42",
      "spring.cache.redis.time-to-live=10m sets one TTL for all caches",
      "maxmemory-policy allkeys-lru is the usual choice for a cache-only Redis",
      "Never run KEYS * on a busy server; use SCAN with a MATCH pattern",
      "@CacheEvict(allEntries = true) clears a whole cache",
      "Do not cache per-user data under a key that ignores the user",
    ],
    quiz: [
      {
        q: "A Redis server reaches maxmemory with the default policy. What happens to a new SET?",
        options: ["The oldest key is deleted", "A random key is deleted", "The write is refused with an error", "Redis writes the value to disk instead"],
        answer: 2,
        why: "The default policy is noeviction, so writes that need memory fail until space is freed.",
      },
      {
        q: "Which Redis type fits a game leaderboard best?",
        options: ["Sorted set", "List", "Hash", "Plain string"],
        answer: 0,
        why: "A sorted set keeps members ordered by score, and ZRANGE with REV returns the top players.",
      },
      {
        q: "Why should you evict the cache after the database commit and not before?",
        options: ["Redis is faster after a commit", "Spring does not allow eviction inside a transaction", "Eviction before commit deletes the database row", "A reader could reload the old row into the cache before your commit lands"],
        answer: 3,
        why: "Between an early eviction and the commit, a concurrent read can cache the old value again.",
      },
      {
        q: "A method in ProductService calls its own @Cacheable method. What happens?",
        options: ["The cache is used normally", "The cache is skipped because the call does not pass through the proxy", "Spring throws an exception at startup", "The value is cached twice"],
        answer: 1,
        why: "Spring caching works through a proxy, and self-calls go straight to the object.",
      },
      {
        q: "Many popular keys were cached at the same moment with the same TTL. What problem can follow?",
        options: ["Keys are stored twice", "Redis stops accepting reads", "A burst of misses hits the database when they all expire together", "The TTLs become negative"],
        answer: 2,
        why: "Synchronised expiry causes a stampede; random jitter on TTLs spreads the reloads.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In redis-cli, store a session value that expires after 30 seconds, check its TTL, wait, and prove it is gone.",
        hint: "Use SET with EX, then TTL and GET.",
        solution: "SET session:abc user7 EX 30\nTTL session:abc      # about 30\n# wait 30 seconds\nGET session:abc      # (nil)\nTTL session:abc      # -2, the key no longer exists",
      },
      {
        level: "medium",
        task: "Add @Cacheable to a findById method and prove with logs that the second call does not hit the database.",
        hint: "Turn on SQL logging with spring.jpa.show-sql=true and call the endpoint twice.",
        solution: "// application.properties\n// spring.cache.type=redis\n// spring.jpa.show-sql=true\n@Cacheable(value = \"products\", key = \"#id\")\npublic ProductDto find(Long id) { ... }\n// curl /products/42 twice: only the first call prints a select.\n// redis-cli KEYS 'products::*' (fine on a dev box) shows products::42",
      },
      {
        level: "hard",
        task: "Make updates evict the cache only after the transaction commits, and write a test that fails if an update is followed by a stale read.",
        hint: "Build the RedisCacheManager with transactionAware(); use Testcontainers for Redis and Postgres.",
        solution: "@Bean\nRedisCacheManager cacheManager(RedisConnectionFactory cf, RedisCacheConfiguration base) {\n  return RedisCacheManager.builder(cf).cacheDefaults(base)\n    .transactionAware().build();\n}\n// Test: find(42) -> \"Mug\"; update(42, \"Cup\") in @Transactional service;\n// assertEquals(\"Cup\", service.find(42).name());",
      },
    ],
    faq: [
      { q: "Is Redis a database or a cache?", a: "It can be both. It keeps data in memory but can also save it to disk with snapshots (RDB) or an append-only file (AOF). Most backends use it as a cache, a session store or a rate limiter." },
      { q: "What is Valkey?", a: "Valkey is an open-source fork of Redis started in 2024 after Redis changed its license. It speaks the same protocol, so Spring Data Redis and redis-cli work with it." },
      { q: "What should I cache first?", a: "Measure first. Cache the endpoint that is read most often and changes rarely, then compare latency and database load before and after." },
      { q: "Should I cache JPA entities directly?", a: "Usually no. Cache small DTOs instead. Entities can carry lazy-loaded relations that fail to serialize or pull in far more data than you meant." },
    ],
  },

  "production/kafka": {
    plain: [
      "Kafka is a system for passing events between services. An event is a small record of something that happened, like \"order 7 was placed\". One service writes it, and any number of other services can read it later, each at its own speed. The writer does not need to know who the readers are.",
      "Picture a shared notebook where people only add new lines at the end. Nobody tears out pages. Each reader keeps a bookmark (an offset) showing how far they have read. Billing may be on line 500 while the email service is on line 480. That notebook is a topic.",
      "One notebook would be too slow for a big system, so a topic is split into partitions: several notebooks that are read and written in parallel. Events with the same key, such as the same order id, always go to the same partition, so their order is kept.",
      "Readers work in teams called consumer groups. Kafka hands each partition to exactly one member of a team, so the work is shared without two members handling the same event. Add members to go faster, up to one per partition. Different teams each get their own full copy of the stream.",
    ],
    deepDive: [
      {
        heading: "Topics, partitions and offsets under the hood",
        body: "Each partition is an append-only log stored on a broker (a Kafka server). New records get the next offset number in that partition: 0, 1, 2 and so on. Offsets are only meaningful inside one partition, so there is no global order across a topic.\n\nKafka does not delete a record when it is read. Records stay until the retention limit, which is 7 days by default (log.retention.hours=168), or until a size limit is reached. That is why a new consumer group can replay a whole week of history, and why a bug fix can be followed by reprocessing old events.\n\nFor safety each partition is copied to several brokers. The replication factor says how many copies exist; one copy is the leader that handles reads and writes, and the others follow. With acks=all, a write is only confirmed once the in-sync replicas have it, controlled by min.insync.replicas.",
        bullets: ["Same key means same partition, so per-key order is kept", "A null key spreads records across partitions", "You can add partitions later, but never remove them", "Adding partitions changes which partition a key maps to"],
      },
      {
        heading: "Running Kafka locally",
        body: "Kafka 4.0 removed ZooKeeper completely. Brokers now manage their own metadata with KRaft (Kafka Raft), so one container is enough for local work. The official apache/kafka image starts a single-node broker listening on port 9092 with sensible defaults.\n\nThe command-line tools live in /opt/kafka/bin inside that image. You can create a topic with a chosen number of partitions, send test records, and, most usefully, describe a consumer group to see each partition's current offset, the latest offset, and the lag between them. Lag is the number of records waiting to be processed, and it is the first metric to watch in production.\n\nIn Spring Boot, point the app at the broker with spring.kafka.bootstrap-servers=localhost:9092. When the app itself runs in Compose, use the service name instead of localhost, and make sure the broker advertises an address the app can reach.",
      },
      {
        heading: "Producing and consuming with Spring Kafka",
        body: "KafkaTemplate.send(topic, key, value) is asynchronous: it returns a CompletableFuture that completes when the broker acknowledges the record. Since Kafka 3.0 the producer defaults to acks=all with idempotence turned on, so a retry after a network glitch does not write duplicates into the partition.\n\n@KafkaListener creates a listener container that polls the broker in a loop and calls your method for each record. Spring turns off the client's automatic offset commit and commits offsets itself after your method returns (by default once per polled batch). If your code throws, the offset is not committed and the record is delivered again. This gives at-least-once delivery: no record is lost, but a record may be processed twice, so handlers must be idempotent.\n\nConfigure JSON with spring.kafka.producer.value-serializer and the matching consumer deserializer, plus spring.json.trusted.packages for the classes you accept.",
        visual: {
          type: "sequence",
          title: "A failed record being redelivered",
          actors: ["Listener", "Spring container", "Broker"],
          messages: [
            { from: 1, to: 2, label: "poll: records 41 to 45" },
            { from: 1, to: 0, label: "record 41" },
            { from: 0, to: 1, label: "throws exception" },
            { from: 1, to: 2, label: "seek back to offset 41" },
            { from: 1, to: 0, label: "record 41 again (retry)" },
            { from: 0, to: 1, label: "success" },
            { from: 1, to: 2, label: "commit offset 42" },
          ],
        },
      },
      {
        heading: "Retries and dead-letter topics",
        body: "Some failures are temporary (the database blinked) and some are permanent (the JSON is broken). Spring Kafka's DefaultErrorHandler retries a failing record in place, by default up to 9 more times with no pause, then logs it and moves on. Give it a backoff and a recoverer instead: a DeadLetterPublishingRecoverer sends the record to a dead-letter topic, by default the original name plus .DLT, with headers that describe the exception.\n\nRetrying in place blocks the partition, because later records wait behind the failing one. For slow retries, @RetryableTopic sends the record to separate retry topics with growing delays and finally to a -dlt topic, so the main topic keeps flowing.\n\nMark exceptions that will never succeed, such as validation errors, as not retryable so they go straight to the dead-letter topic. Then monitor that topic: messages there are real problems someone must look at.",
        bullets: ["Blocking retries keep order but stall the partition", "Retry topics keep flowing but give up strict ordering", "Store a processed event id to make handlers idempotent"],
      },
      {
        heading: "Scaling with consumer groups",
        body: "Within one group, each partition is assigned to exactly one consumer. With 6 partitions and 3 consumers, each gets 2. Add a fourth and Kafka rebalances, moving partitions so the load evens out. Add a seventh and it sits idle. So the partition count is the ceiling on parallelism for one group; choose it with growth in mind.\n\nA rebalance also happens when a consumer crashes or takes too long between polls (max.poll.interval.ms, 5 minutes by default). Slow handlers can therefore cause endless rebalances: process faster, poll fewer records (max.poll.records, default 500), or move heavy work elsewhere.\n\nWhen a group starts with no saved offsets, auto.offset.reset decides where to begin: latest (the default) skips old records, earliest reads from the start of retention.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Two groups reading the same topic",
        root: "Topic orders (3 partitions)",
        children: [
          { label: "Group billing", children: ["Consumer 1: partitions 0 and 1", "Consumer 2: partition 2", "Own offsets per partition"] },
          { label: "Group email", children: ["Consumer 1: partitions 0, 1 and 2", "Reads at its own pace", "Lag does not affect billing"] },
        ],
      },
    ],
    examples: [
      {
        title: "Create a topic and watch consumer lag",
        explanation: "Start a single-node broker, create an orders topic with 3 partitions, send a few keyed records, then read them as group billing. Describe the group afterwards: CURRENT-OFFSET is what the group committed, LOG-END-OFFSET is the newest record, and LAG is the difference.",
        code: {
          lang: "bash",
          code: "docker run -d --name kafka -p 9092:9092 apache/kafka:4.0.0\nK=/opt/kafka/bin\ndocker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 \\\n  --create --topic orders --partitions 3\ndocker exec -it kafka $K/kafka-console-producer.sh --bootstrap-server localhost:9092 \\\n  --topic orders --property parse.key=true --property key.separator=:\n# type: order-7:placed   order-7:paid   then Ctrl+D\ndocker exec kafka $K/kafka-console-consumer.sh --bootstrap-server localhost:9092 \\\n  --topic orders --group billing --from-beginning --max-messages 2\ndocker exec kafka $K/kafka-consumer-groups.sh --bootstrap-server localhost:9092 \\\n  --describe --group billing",
        },
      },
      {
        title: "Retry with backoff, then dead-letter",
        explanation: "Billing sometimes fails because a payment service is down. Step 1: define a DefaultErrorHandler bean with an exponential backoff, so a record is retried a few times with growing pauses. Step 2: give it a DeadLetterPublishingRecoverer so a record that still fails lands in orders.DLT. Step 3: mark validation errors as not retryable. Spring Boot picks up the error handler bean for its listener containers.",
        code: {
          lang: "java",
          code: "@Bean\nDefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {\n  var recoverer = new DeadLetterPublishingRecoverer(template);\n  var backoff = new ExponentialBackOffWithMaxRetries(4);\n  backoff.setInitialInterval(1_000);\n  backoff.setMultiplier(2.0);\n  var handler = new DefaultErrorHandler(recoverer, backoff);\n  handler.addNotRetryableExceptions(IllegalArgumentException.class);\n  return handler;\n}",
        },
      },
    ],
    cheatSheet: [
      "Kafka 4.x runs without ZooKeeper (KRaft mode); the usual client port is 9092",
      "Order is guaranteed only inside one partition, so key events by entity id",
      "Max useful consumers in one group = number of partitions",
      "kafka-consumer-groups.sh --describe --group g shows offsets and lag",
      "Default retention is 7 days; reading a record does not delete it",
      "auto.offset.reset=earliest makes a new group start from the oldest kept record",
      "Delivery is at-least-once by default: make every handler idempotent",
      "DeadLetterPublishingRecoverer sends failed records to topic.DLT by default",
    ],
    quiz: [
      {
        q: "A topic has 4 partitions. How many consumers in one group can actively read it at the same time?",
        options: ["1", "4", "8", "Unlimited"],
        answer: 1,
        why: "Each partition goes to one consumer per group, so extra consumers stay idle.",
      },
      {
        q: "Your listener throws an exception and no error handler is customised. What happens by default in Spring Kafka?",
        options: ["The record is retried in place a few times, then logged and skipped", "The record is lost immediately", "The application shuts down", "The record is sent to a dead-letter topic automatically"],
        answer: 0,
        why: "The DefaultErrorHandler retries (9 retries, no backoff) and then logs the failure; a DLT needs a recoverer.",
      },
      {
        q: "Why should Kafka consumers be idempotent?",
        options: ["Kafka encrypts every record twice", "Producers always send every record twice", "Offsets are committed before processing", "A record can be delivered again after a crash or retry"],
        answer: 3,
        why: "At-least-once delivery means a record processed just before a crash can arrive again.",
      },
      {
        q: "A new consumer group starts with auto.offset.reset left at its default. Which records does it read?",
        options: ["All records from the beginning", "Only records written after it joins", "Only records with a key", "Records from the last 24 hours"],
        answer: 1,
        why: "The default is latest, so existing records are skipped; use earliest to replay.",
      },
      {
        q: "Your handler sometimes takes 10 minutes per batch and the group keeps rebalancing. What is the most likely cause?",
        options: ["Too many partitions", "acks=all on the producer", "The time between polls exceeds max.poll.interval.ms", "The topic has no key"],
        answer: 2,
        why: "If a consumer does not poll within 5 minutes by default, it is removed from the group and partitions move.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a topic with 3 partitions, send records with keys a, b and c several times each, and confirm that each key always lands in the same partition.",
        hint: "The console consumer can print the partition with --property print.partition=true.",
        solution: "kafka-topics.sh --bootstrap-server localhost:9092 --create --topic t --partitions 3\nkafka-console-producer.sh --bootstrap-server localhost:9092 --topic t \\\n  --property parse.key=true --property key.separator=:\n# a:1 b:1 c:1 a:2 b:2 c:2\nkafka-console-consumer.sh --bootstrap-server localhost:9092 --topic t \\\n  --from-beginning --property print.key=true --property print.partition=true\n# every a line shows the same partition number",
      },
      {
        level: "medium",
        task: "Write a @KafkaListener for an orders topic that ignores an order it has already processed, so a redelivery does not bill twice.",
        hint: "Store processed order ids in a table with a unique constraint, in the same transaction as the billing work.",
        solution: "@KafkaListener(topics = \"orders\", groupId = \"billing\")\n@Transactional\npublic void on(OrderPlaced e) {\n  if (processed.existsById(e.eventId())) return;   // seen before\n  billing.charge(e.orderId(), e.amount());\n  processed.save(new ProcessedEvent(e.eventId())); // unique key\n}",
      },
      {
        level: "hard",
        task: "Switch the listener to non-blocking retries: three attempts with 2, 4 and 8 second delays, then a dead-letter topic, while the main topic keeps flowing.",
        hint: "Use @RetryableTopic with @Backoff, and a @DltHandler method.",
        solution: "@RetryableTopic(attempts = \"4\",\n  backoff = @Backoff(delay = 2000, multiplier = 2.0),\n  exclude = IllegalArgumentException.class)\n@KafkaListener(topics = \"orders\", groupId = \"billing\")\npublic void on(OrderPlaced e) { billing.charge(e.orderId(), e.amount()); }\n\n@DltHandler\npublic void dead(OrderPlaced e) { log.error(\"Gave up on {}\", e.orderId()); }",
      },
    ],
    faq: [
      { q: "Kafka or RabbitMQ?", a: "Kafka is a durable log that many groups can replay, which suits event streams and high volume. RabbitMQ is a classic message broker with flexible routing where a message is usually removed once consumed." },
      { q: "Does Kafka guarantee exactly-once delivery?", a: "Kafka supports exactly-once for read, process and write cycles that stay inside Kafka, using transactions. Side effects outside Kafka, like a database write or an email, still need idempotent handling." },
      { q: "How many partitions should a topic have?", a: "Enough for the parallelism you expect, since consumers in a group cannot exceed it. A few to a few dozen is common; adding later is possible but reshuffles which partition each key uses." },
      { q: "Do I still need ZooKeeper?", a: "No. Kafka 4.0 dropped ZooKeeper, and new clusters run in KRaft mode where brokers manage their own metadata." },
    ],
  },

  "production/microservices": {
    plain: [
      "A monolith is one application that holds every feature, deployed as one unit. Microservices split the same system into several small applications, each owning one business area such as orders, payments or inventory, with its own database. They talk to each other over the network.",
      "The main benefit is about people, not speed. Each team can change, test and deploy its own service without waiting for everyone else. You can also scale only the busy part: run ten copies of search and two of billing.",
      "The cost is that a function call becomes a network call. Network calls can be slow, can fail, and can half-succeed. Data that used to live in one database is now spread out, so one database transaction can no longer cover a whole business action.",
      "Microservice patterns are the standard answers to those new problems. A gateway gives clients one front door. Service discovery helps services find each other. Circuit breakers stop a failure from spreading. Sagas keep data consistent across services. Learn the problem each pattern solves, and only use it when you have that problem.",
    ],
    deepDive: [
      {
        heading: "When a monolith is the better choice",
        body: "Most successful systems start as a monolith, and many should stay one. A well-structured monolith, with clear modules and rules about which module may call which, gives you simple debugging, local transactions and one deployment. This is often called a modular monolith.\n\nSplit a service out when there is a real reason: a team that is blocked by others, a part with very different scaling needs, or a part that must be isolated for security or reliability. Draw the boundary around a business capability (bounded context), not a technical layer. A \"database service\" or a \"validation service\" just creates chatty calls.\n\nA warning sign is the distributed monolith: services that must all be deployed together, share a database, or call each other in long synchronous chains. You pay the costs of both styles and get the benefits of neither.",
        bullets: ["One database per service; others ask through its API or events", "Services should deploy independently", "Fewer, larger services are easier to start with"],
      },
      {
        heading: "Gateways, discovery and central config",
        body: "An API gateway is the single entry point for clients. It routes paths starting with /orders to the order service and /users to the user service, and it handles shared concerns once: validating the JWT, rate limiting, CORS and request logging. In Java the common choice is Spring Cloud Gateway; managed options include AWS API Gateway and Kubernetes ingress controllers.\n\nService discovery answers \"where is the inventory service right now?\" when instances come and go. With Spring Cloud Netflix Eureka, each instance registers itself and clients ask the registry by name. On Kubernetes you usually skip Eureka: a Service gives a stable DNS name like inventory.shop.svc.cluster.local that load balances across pods.\n\nA config server keeps settings for every service in one place, often a Git repository, so you can change a timeout without rebuilding images. On Kubernetes, ConfigMaps and Secrets fill the same role.",
        visual: {
          type: "flow",
          title: "Path of one client request",
          steps: [
            { label: "Client calls /orders/7", detail: "One public address" },
            { label: "Gateway", detail: "Checks the JWT, applies rate limits" },
            { label: "Discovery", detail: "Finds a healthy order-service instance" },
            { label: "Order service", detail: "Calls inventory with a timeout and breaker" },
            { label: "Response", detail: "Returns through the gateway to the client" },
          ],
        },
      },
      {
        heading: "Timeouts, retries and circuit breakers",
        body: "Every remote call needs a timeout. Without one, a slow dependency ties up your threads until your own service stops answering, and the failure spreads upstream.\n\nResilience4j provides the standard tools. A retry repeats a call that failed for a temporary reason (default 3 attempts, 500 ms apart); only retry idempotent operations. A circuit breaker counts recent failures in a sliding window. When the failure rate passes a threshold (50% by default) it opens and fails calls instantly for a wait period (60 seconds by default), then lets a few trial calls through. A bulkhead limits how many calls may run at once, so one slow dependency cannot use every thread. A time limiter enforces the timeout for asynchronous calls.\n\nTune with real numbers. The defaults need 100 calls before the breaker can open, which is too many for a low-traffic service.",
        bullets: ["resilience4j.circuitbreaker.instances.inventory.failure-rate-threshold=50", "resilience4j.circuitbreaker.instances.inventory.minimum-number-of-calls=10", "resilience4j.circuitbreaker.instances.inventory.wait-duration-in-open-state=30s"],
      },
      {
        heading: "Sagas and the outbox pattern",
        body: "Placing an order may need three services: reserve stock, charge the card, create the shipment. A saga runs each step as a local transaction in its own service. If a later step fails, earlier steps are undone with compensating actions, such as releasing the stock or refunding the card. Compensations must be safe to repeat.\n\nIn choreography, each service reacts to events from the others (StockReserved triggers the charge). It has no central brain, but the flow is spread across services and hard to follow. In orchestration, one orchestrator tells each service what to do and tracks the state, which is easier to monitor for longer flows.\n\nOne trap: saving to your database and then publishing an event can half-fail. The outbox pattern fixes this by writing the event to an outbox table in the same local transaction, and a separate relay (or a tool like Debezium) publishes it afterwards.",
        visual: {
          type: "sequence",
          title: "Orchestrated order saga with a failure",
          actors: ["Order saga", "Inventory", "Payment"],
          messages: [
            { from: 0, to: 1, label: "Reserve 2 units" },
            { from: 1, to: 0, label: "Reserved" },
            { from: 0, to: 2, label: "Charge 40 EUR" },
            { from: 2, to: 0, label: "Card declined" },
            { from: 0, to: 1, label: "Compensate: release 2 units" },
            { from: 1, to: 0, label: "Released, order marked failed" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Saga styles",
        columns: [
          { title: "Choreography", points: ["Services react to each other's events", "No central coordinator", "Loose coupling", "Flow is hard to see as it grows"] },
          { title: "Orchestration", points: ["One orchestrator sends commands", "State of each saga in one place", "Easier to monitor and debug", "Orchestrator becomes a key component"] },
        ],
      },
    ],
    examples: [
      {
        title: "Tune a circuit breaker for a low-traffic call",
        explanation: "The order service calls inventory a few times per minute, so the default window of 100 calls would take hours to fill. Step 1: shrink the window and minimum calls. Step 2: treat slow calls as failures too. Step 3: shorten the open wait so recovery is noticed sooner. Step 4: check the breaker state at /actuator/circuitbreakers once register-health-indicator is on and the endpoint is exposed.",
        code: {
          lang: "yaml",
          code: "resilience4j:\n  circuitbreaker:\n    instances:\n      inventory:\n        sliding-window-size: 20\n        minimum-number-of-calls: 10\n        failure-rate-threshold: 50\n        slow-call-duration-threshold: 2s\n        slow-call-rate-threshold: 50\n        wait-duration-in-open-state: 30s\n        permitted-number-of-calls-in-half-open-state: 3\n        register-health-indicator: true",
        },
      },
      {
        title: "Design a small two-service system",
        explanation: "A shop needs orders and inventory. Step 1: give each its own database; order-service never reads the inventory tables. Step 2: for the user-facing stock check, order-service calls GET /stock/{sku} with a 1 second timeout and a circuit breaker, falling back to \"stock unknown\". Step 3: when an order is placed, order-service writes the order and an OrderPlaced row to its outbox in one transaction. Step 4: a relay publishes it to Kafka; inventory consumes it and reserves stock, emitting StockReserved or StockRejected. Step 5: order-service listens and marks the order confirmed or cancelled. Now inventory can be down for a minute and orders are still accepted.",
      },
    ],
    cheatSheet: [
      "Start with a modular monolith; split a service only for a clear team or scaling reason",
      "One database per service; share data through APIs or events, never shared tables",
      "Every remote call needs a timeout; retry only idempotent operations",
      "Resilience4j breaker defaults: 50% failure rate, window of 100 calls, 60 s open",
      "On Kubernetes, Service DNS names usually replace a Eureka registry",
      "Saga = local transactions plus compensating actions, no distributed lock",
      "Outbox table + relay publishes events reliably after the local commit",
    ],
    quiz: [
      {
        q: "Two microservices read and write the same database tables. What is the main problem?",
        options: ["Queries become slower", "They are tightly coupled, so schema changes need both teams and deploys", "Databases cannot handle two clients", "It breaks HTTPS"],
        answer: 1,
        why: "A shared schema removes independent deployment, which is the main reason to split services.",
      },
      {
        q: "A circuit breaker is open. What happens to a new call?",
        options: ["It waits until the dependency recovers", "It is retried three times", "It fails fast or uses the fallback without calling the dependency", "It is queued in Kafka"],
        answer: 2,
        why: "The open state protects the caller by not sending calls to a failing service.",
      },
      {
        q: "In a saga, payment fails after stock was reserved. What should happen?",
        options: ["A compensating action releases the reserved stock", "The database rolls back both services automatically", "Nothing, stock stays reserved", "The gateway returns 200 anyway"],
        answer: 0,
        why: "Each step committed locally, so earlier steps must be undone with explicit compensations.",
      },
      {
        q: "Why use the outbox pattern?",
        options: ["To encrypt events", "To make events smaller", "To avoid needing a database", "To make saving data and publishing its event succeed or fail together"],
        answer: 3,
        why: "The event is written in the same local transaction as the data and published afterwards by a relay.",
      },
      {
        q: "Which concern usually belongs in the API gateway?",
        options: ["Calculating order totals", "Validating the JWT and rate limiting", "Storing product data", "Running database migrations"],
        answer: 1,
        why: "Cross-cutting edge concerns are handled once at the gateway; business logic stays in services.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List three signs that a system has become a distributed monolith.",
        hint: "Think about deployments, databases and call chains.",
        solution: "1. Services must be released together for a feature to work.\n2. Several services share one database or tables.\n3. One user request triggers a long chain of synchronous calls,\n   so one slow service makes everything slow.",
      },
      {
        level: "medium",
        task: "Wrap a RestClient call to the inventory service with a retry and a circuit breaker, plus a fallback that returns an unknown stock value.",
        hint: "Resilience4j annotations stack: @Retry and @CircuitBreaker with the same instance name.",
        solution: "@CircuitBreaker(name = \"inventory\", fallbackMethod = \"unknown\")\n@Retry(name = \"inventory\")\npublic Stock check(String sku) {\n  return rest.get().uri(\"/stock/{sku}\", sku).retrieve().body(Stock.class);\n}\nprivate Stock unknown(String sku, Throwable ex) {\n  return Stock.unknown(sku);\n}\n// Also set a read timeout on the RestClient's request factory.",
      },
      {
        level: "hard",
        task: "Design an orchestrated saga for booking a trip (hotel, flight, payment). Write the steps and the compensation for each.",
        hint: "Order the steps so the hardest to undo comes last.",
        solution: "1. Reserve hotel room      -> compensate: cancel reservation\n2. Hold flight seat        -> compensate: release seat\n3. Charge payment          -> compensate: refund\n4. Confirm hotel and flight (no compensation needed after success)\nThe orchestrator stores saga state (STARTED, HOTEL_OK, ...) in its DB.\nOn failure at step N, run compensations N-1..1 in reverse order.\nEvery command and compensation carries the saga id, so repeats are ignored.",
      },
    ],
    faq: [
      { q: "Are microservices faster than a monolith?", a: "Not by themselves. Network calls add latency. Their gains are independent deployment and scaling of busy parts, which matter at larger team and traffic sizes." },
      { q: "Do I need Eureka on Kubernetes?", a: "Usually not. Kubernetes Services give each service a stable DNS name and spread traffic over healthy pods." },
      { q: "What replaced Netflix Hystrix?", a: "Hystrix is in maintenance mode. Resilience4j is the common replacement in Spring Boot, through Spring Cloud Circuit Breaker or its own starter." },
      { q: "How small should a microservice be?", a: "Small enough for one team to own and understand, and aligned with one business capability. Size in lines of code is not a useful rule." },
    ],
  },

  "production/java-docker": {
    plain: [
      "Docker puts your application and everything it needs to run into one package called an image. For a Spring Boot app that means a Java runtime plus your jar file. Anyone with Docker can run that image and get the same result, on a laptop, a CI server or a cloud machine.",
      "A running copy of an image is a container. It is an isolated process with its own files and network, but it shares the host's kernel, so it starts in seconds and uses far less memory than a virtual machine.",
      "The recipe for an image is a Dockerfile. Each line adds a layer, and Docker caches layers it has built before. If you order the lines well, a code change rebuilds only the small part that changed, and builds take seconds instead of minutes.",
      "Real apps need a database too. Docker Compose starts several containers from one YAML file: your app and Postgres, on a shared network, with the right settings. One command, docker compose up, gives every developer the same working setup.",
    ],
    deepDive: [
      {
        heading: "Why layer order matters",
        body: "Docker builds a Dockerfile top to bottom. For each step it checks whether it already has a cached layer for the same instruction and the same input files. The first step whose inputs changed, and every step after it, must be rebuilt.\n\nA Spring Boot fat jar holds about 50 MB of dependencies and maybe 200 KB of your own code. If you copy that jar in one step, every code change creates a whole new 50 MB layer to build, push and pull. Spring Boot can split the jar into layers ordered from least to most changing: dependencies, spring-boot-loader, snapshot-dependencies, application. Copy them in that order and a normal commit only rebuilds the tiny application layer.\n\nThe same idea applies in the build stage: copy pom.xml and download dependencies before copying src, so Maven does not download the internet on every change.",
      },
      {
        heading: "Extracting layers with Spring Boot 3.3 and later",
        body: "Spring Boot 3.3 replaced the old layertools jar mode with a new tools mode. The command java -Djarmode=tools -jar app.jar extract --layers --destination extracted unpacks the jar into one folder per layer. Inside the application layer is a small application.jar that points at the libraries, so the final image still starts with java -jar application.jar.\n\nThere is also a zero-Dockerfile option: ./mvnw spring-boot:build-image (or bootBuildImage in Gradle) uses Cloud Native Buildpacks to produce a layered, non-root image with a tuned JVM memory calculator. It is a good default if you do not need a custom Dockerfile.\n\nWhichever route you take, pick a base image with only a JRE, such as eclipse-temurin:21-jre, and pin the tag so builds are repeatable.",
        visual: {
          type: "flow",
          title: "Layered multi-stage build",
          steps: [
            { label: "Stage 1: JDK", detail: "Copy pom.xml, download dependencies, then copy src" },
            { label: "Build the jar", detail: "./mvnw package produces the fat jar" },
            { label: "Extract layers", detail: "jarmode=tools extract --layers" },
            { label: "Stage 2: JRE", detail: "Copy four layer folders, slowest-changing first" },
            { label: "Run as non-root", detail: "java -jar application.jar" },
          ],
        },
      },
      {
        heading: "Running Java well inside a container",
        body: "Modern JVMs (Java 11 and later) read the container's memory and CPU limits. By default the maximum heap is only 25% of the container's memory, which wastes most of a 1 GB container. Set -XX:MaxRAMPercentage=75.0 through JAVA_TOOL_OPTIONS so the heap uses most of the limit while leaving room for metaspace, threads and buffers.\n\nRun as a normal user, not root: create one in the Dockerfile and switch with USER. Use the exec form of ENTRYPOINT (a JSON array) so java is PID 1 and receives the SIGTERM that Docker sends on stop. Spring Boot 3.4 and later enable graceful shutdown by default, so in-flight requests finish before the app exits.\n\nKeep configuration out of the image. Spring Boot maps environment variables to properties, so SPRING_DATASOURCE_URL overrides spring.datasource.url without rebuilding.",
        bullets: ["JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=75.0", "Exec form: ENTRYPOINT [\"java\", \"-jar\", \"application.jar\"]", "Add a .dockerignore with target/ and .git/"],
      },
      {
        heading: "Compose: app plus database, started in the right order",
        body: "In Compose every service joins a shared network and can reach the others by service name. Your app connects to jdbc:postgresql://db:5432/app, not localhost, because inside the app container localhost is the app itself.\n\ndepends_on alone only waits for the database container to start, not for Postgres to accept connections. Add a healthcheck to the database (pg_isready) and use depends_on with condition: service_healthy, so the app starts once the database is ready.\n\nStore database files in a named volume so data survives docker compose down. Use docker compose down -v only when you really want to wipe it. Keep passwords in an .env file that is not committed; Compose reads it automatically for variable substitution.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Fat jar copy vs layered copy",
        columns: [
          { title: "Copy the fat jar", points: ["One 50 MB layer", "Every commit rebuilds all of it", "Slow pushes and pulls", "Simplest Dockerfile"] },
          { title: "Copy extracted layers", points: ["Dependencies cached separately", "A commit rebuilds about 200 KB", "Fast pushes and deploys", "A few more Dockerfile lines"] },
        ],
      },
    ],
    examples: [
      {
        title: "A layered, non-root Dockerfile",
        explanation: "Stage 1 downloads dependencies before copying source, builds the jar and extracts its layers. Stage 2 starts from a JRE image, creates a non-root user and copies the four layers in two steps, slowest-changing first. Build it twice, change one Java file, and build again: only the last COPY and the Maven steps rerun.",
        code: {
          lang: "dockerfile",
          code: "FROM eclipse-temurin:21-jdk AS build\nWORKDIR /src\nCOPY mvnw pom.xml ./\nCOPY .mvn .mvn\nRUN ./mvnw -q dependency:go-offline\nCOPY src src\nRUN ./mvnw -q package -DskipTests && cp target/*.jar app.jar \\\n && java -Djarmode=tools -jar app.jar extract --layers --destination out\nFROM eclipse-temurin:21-jre\nRUN useradd --system --uid 1001 spring\nUSER spring\nWORKDIR /app\nCOPY --from=build /src/out/dependencies/ /src/out/spring-boot-loader/ ./\nCOPY --from=build /src/out/snapshot-dependencies/ /src/out/application/ ./\nENTRYPOINT [\"java\", \"-jar\", \"application.jar\"]",
        },
      },
      {
        title: "App and Postgres with a health-gated start",
        explanation: "Compose builds the app from the Dockerfile, starts Postgres with a named volume, waits until pg_isready succeeds, then starts the app with its datasource set by environment variables. Run docker compose up --build and open localhost:8080.",
        code: {
          lang: "yaml",
          code: "services:\n  db:\n    image: postgres:17\n    environment: { POSTGRES_DB: app, POSTGRES_USER: app, POSTGRES_PASSWORD: secret }\n    volumes: [pgdata:/var/lib/postgresql/data]\n    healthcheck: { test: [\"CMD\", \"pg_isready\", \"-U\", \"app\"], interval: 5s, retries: 10 }\n  api:\n    build: .\n    ports: [\"8080:8080\"]\n    environment:\n      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/app\n      SPRING_DATASOURCE_USERNAME: app\n      SPRING_DATASOURCE_PASSWORD: secret\n      JAVA_TOOL_OPTIONS: -XX:MaxRAMPercentage=75.0\n    depends_on: { db: { condition: service_healthy } }\nvolumes: { pgdata: {} }",
        },
      },
    ],
    cheatSheet: [
      "Copy pom.xml and fetch dependencies before copying src to keep the cache warm",
      "java -Djarmode=tools -jar app.jar extract --layers --destination out (Boot 3.3+)",
      "./mvnw spring-boot:build-image builds a layered image with buildpacks, no Dockerfile",
      "The JVM uses 25% of container memory for heap by default; set MaxRAMPercentage",
      "Inside Compose, reach the database by service name (db), not localhost",
      "depends_on with condition: service_healthy waits for a passing healthcheck",
      "docker image history my-api shows each layer and its size",
    ],
    quiz: [
      {
        q: "Inside the api container, why does jdbc:postgresql://localhost:5432/app fail?",
        options: ["Postgres does not use port 5432", "localhost means the api container itself, not the db container", "JDBC cannot use hostnames", "Compose blocks port 5432"],
        answer: 1,
        why: "Each container has its own network namespace; use the service name db.",
      },
      {
        q: "A 1 GB container runs a JVM with no memory flags. Roughly how large can the heap grow?",
        options: ["About 1 GB", "About 750 MB", "About 256 MB", "Unlimited"],
        answer: 2,
        why: "The default MaxRAMPercentage is 25%, so about a quarter of the limit.",
      },
      {
        q: "Why use the JSON array (exec) form of ENTRYPOINT?",
        options: ["So java runs as PID 1 and receives SIGTERM on docker stop", "It makes the image smaller", "It is required for multi-stage builds", "It enables layer caching"],
        answer: 0,
        why: "The shell form wraps java in sh, which may not pass the stop signal on, so shutdown is not graceful.",
      },
      {
        q: "What does depends_on without a condition guarantee?",
        options: ["The database accepts connections", "The database schema is migrated", "The app restarts if the database dies", "The database container has been started"],
        answer: 3,
        why: "Only the start order is guaranteed; use a healthcheck and service_healthy to wait for readiness.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Build the image, then use docker image history to find the largest layer and explain what is in it.",
        hint: "Look at the SIZE column next to each COPY step.",
        solution: "docker build -t my-api .\ndocker image history my-api\n# The dependencies COPY layer is the largest (tens of MB):\n# third-party jars. The application layer is a few hundred KB.",
      },
      {
        level: "medium",
        task: "Prove the layer cache works: build, change one line in a controller, rebuild, and note which steps say CACHED.",
        hint: "BuildKit prints CACHED next to reused steps.",
        solution: "docker build -t my-api .\n# edit src/main/java/.../HelloController.java\ndocker build -t my-api .\n# CACHED: base images, COPY pom.xml, dependency:go-offline,\n#         dependencies and spring-boot-loader layers\n# Rebuilt: COPY src, package, and the application layer COPY",
      },
      {
        level: "hard",
        task: "Make the app container report healthy only when Spring Boot is ready, and make Compose restart it if it crashes.",
        hint: "Expose the readiness probe and add a healthcheck; the JRE image may not include curl.",
        solution: "# application.yml: management.endpoint.health.probes.enabled: true\napi:\n  restart: unless-stopped\n  healthcheck:\n    test: [\"CMD-SHELL\", \"wget -qO- localhost:8080/actuator/health/readiness || exit 1\"]\n    interval: 10s\n    start_period: 30s\n# If the base image lacks wget/curl, install one in the Dockerfile\n# or use a tiny Java health client.",
      },
    ],
    faq: [
      { q: "Should I use Alpine images for Java?", a: "You can, but Alpine uses musl instead of glibc, and some native libraries behave differently. Debian or Ubuntu based JRE images like eclipse-temurin:21-jre are the safer default." },
      { q: "Dockerfile or buildpacks?", a: "Buildpacks (spring-boot:build-image) give a good, secure image with no Dockerfile to maintain. Write a Dockerfile when you need full control over the base image or extra tools." },
      { q: "Why is my image over 500 MB?", a: "Usually because the runtime stage uses a full JDK image or copies the source and Maven cache. Use a JRE base and copy only the built layers." },
      { q: "Can I use GraalVM native images instead?", a: "Yes. Spring Boot supports native images that start in milliseconds and use less memory, but builds are slower and some libraries need extra hints. Start with a normal JVM image." },
    ],
  },

  "production/actuator": {
    plain: [
      "Once your app runs in production, you need to know if it is healthy and how it behaves. Is it up? Can it reach the database? How many requests per second does it serve, and how slow are they? Observability is the practice of answering those questions from the outside.",
      "Spring Boot Actuator adds ready-made web endpoints for this, under /actuator. The health endpoint says UP or DOWN, checking things like the database and disk space. The info endpoint shows the app version. The metrics endpoints show numbers.",
      "Micrometer is the library that records those numbers: request counts, response times, memory use, and any counters you add yourself. It is like a universal plug. You write metrics once, and Micrometer can send them to Prometheus, Datadog, CloudWatch and many others.",
      "Prometheus is a popular open-source monitoring server. Every few seconds it visits your /actuator/prometheus page and stores the numbers over time. Grafana then draws graphs from them, and alert rules can wake someone up when errors spike.",
    ],
    deepDive: [
      {
        heading: "Health: what UP really checks",
        body: "The /actuator/health endpoint combines many health indicators into one status. Spring Boot adds indicators automatically for what is on the classpath: the database (it runs a validation query), disk space, Redis, Kafka and more. If any required one is DOWN, the whole status is DOWN and the endpoint returns HTTP 503.\n\nBy default the response shows only the overall status. Set management.endpoint.health.show-details to when-authorized or always to see each component, but do not show details publicly; they reveal your infrastructure.\n\nFor Kubernetes there are two groups. Liveness (/actuator/health/liveness) answers \"is the process stuck and should it be restarted?\" Readiness (/actuator/health/readiness) answers \"should it receive traffic now?\" Keep external checks like the database out of liveness, or a database outage will restart every pod and make things worse. The probes are enabled automatically on Kubernetes, or with management.endpoint.health.probes.enabled=true.",
        visual: {
          type: "tree",
          title: "What feeds /actuator/health",
          root: "health: overall status",
          children: [
            { label: "liveness group", children: ["livenessState", "No external systems"] },
            { label: "readiness group", children: ["readinessState", "Add db here if you want"] },
            { label: "Auto indicators", children: ["db", "diskSpace", "redis", "ping"] },
            { label: "Your own", children: ["A HealthIndicator bean", "e.g. payment provider reachable"] },
          ],
        },
      },
      {
        heading: "Exposing endpoints safely",
        body: "Actuator has many endpoints, but over HTTP only health is exposed by default. You opt in with management.endpoints.web.exposure.include, listing exactly what you need, for example health,info,prometheus. Avoid include: \"*\" on anything public: env shows configuration, heapdump downloads the whole memory, which can contain passwords and tokens.\n\nA common production setup moves Actuator to a separate port with management.server.port=8081. The main port stays open to the internet, while 8081 is reachable only inside the cluster where Prometheus and the load balancer live. You can also protect endpoints with Spring Security, allowing health without login and requiring a role for the rest.\n\nThe info endpoint is empty until you feed it. The build-info goal of the Spring Boot Maven plugin adds the version and build time, and the git-commit-id plugin adds the commit, which helps confirm what is actually deployed.",
      },
      {
        heading: "Micrometer metric types and naming",
        body: "Micrometer has a few core meter types. A counter only goes up, like orders created. A gauge reports a current value that goes up and down, like queue size. A timer records how long something took and how often it happened. A distribution summary records sizes, like payload bytes.\n\nNames use dots, for example orders.created, and tags add dimensions such as status or region. Each backend translates names: in Prometheus, http.server.requests becomes http_server_requests_seconds with _count, _sum and _bucket series.\n\nEvery unique combination of tag values is a separate time series. Tags with few values (method, status, outcome) are cheap. Tags with unbounded values, like user ids or full URLs, create millions of series and can take down your monitoring. Spring already tags HTTP metrics with the URI template, such as /orders/{id}, for this reason.",
        bullets: ["Counter: things that happened", "Gauge: current level", "Timer: duration and count", "Add management.metrics.tags.application to tell apps apart"],
      },
      {
        heading: "Scraping with Prometheus and asking useful questions",
        body: "Add micrometer-registry-prometheus and expose the prometheus endpoint. Prometheus then pulls /actuator/prometheus on each scrape (the global default interval is 1 minute; 15 seconds is common). Each scrape stores the current value of every series with a timestamp.\n\nYou query with PromQL. Counters only grow, so you almost always wrap them in rate(), which gives a per-second speed over a time window. Request rate: sum(rate(http_server_requests_seconds_count[5m])). Error ratio: the same with status=~\"5..\" divided by the total. Latency percentiles need histograms: set management.metrics.distribution.percentiles-histogram.http.server.requests=true, then use histogram_quantile(0.95, ...) over the _bucket series.\n\nA good first dashboard follows the RED method: rate, errors and duration for each endpoint, plus JVM memory and GC pause time.",
        visual: {
          type: "sequence",
          title: "One scrape and one alert",
          actors: ["Spring app", "Prometheus", "Alertmanager", "On-call"],
          messages: [
            { from: 1, to: 0, label: "GET /actuator/prometheus" },
            { from: 0, to: 1, label: "Text format: name, labels, value" },
            { from: 1, to: 2, label: "Rule true for 10m: alert fires" },
            { from: 2, to: 3, label: "Grouped notice to chat or pager" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Liveness vs readiness",
        columns: [
          { title: "Liveness", points: ["Is the process broken?", "Failing it restarts the container", "Keep it simple and internal", "Never depend on the database"] },
          { title: "Readiness", points: ["Can it take traffic now?", "Failing it removes the pod from load balancing", "DOWN during startup and shutdown", "May include key dependencies"] },
        ],
      },
    ],
    examples: [
      {
        title: "Count orders and time the payment call",
        explanation: "Inject MeterRegistry, build a counter with a tag for the channel and a timer around the payment call. After a few requests, open /actuator/prometheus and look for orders_created_total and payment_call_seconds_count. The total suffix is added by Prometheus naming for counters.",
        code: {
          lang: "java",
          code: "@Service\nclass OrderService {\n  private final MeterRegistry registry;\n  private final Timer paymentTimer;\n  OrderService(MeterRegistry registry) {\n    this.registry = registry;\n    this.paymentTimer = Timer.builder(\"payment.call\").register(registry);\n  }\n  void place(Order o) {\n    paymentTimer.record(() -> payments.charge(o));\n    registry.counter(\"orders.created\", \"channel\", o.channel()).increment();\n  }\n}",
        },
      },
      {
        title: "Prometheus scraping the app on a management port",
        explanation: "The app serves traffic on 8080 and Actuator on 8081. Prometheus runs next to it in Compose and scrapes the management port every 15 seconds. Open Prometheus on localhost:9090, check Status then Targets shows the job as UP, and try the query rate(http_server_requests_seconds_count[1m]).",
        code: {
          lang: "yaml",
          code: "# application.yml\nmanagement:\n  server.port: 8081\n  endpoints.web.exposure.include: health,info,prometheus\n  metrics.tags.application: booking-api\n---\n# prometheus.yml\nglobal: { scrape_interval: 15s }\nscrape_configs:\n  - job_name: booking-api\n    metrics_path: /actuator/prometheus\n    static_configs:\n      - targets: [\"api:8081\"]",
        },
      },
    ],
    cheatSheet: [
      "Only /actuator/health is exposed over HTTP by default",
      "management.endpoints.web.exposure.include=health,info,prometheus opts in to more",
      "Probes: /actuator/health/liveness and /actuator/health/readiness",
      "management.server.port=8081 keeps Actuator off the public port",
      "Prometheus endpoint needs the micrometer-registry-prometheus dependency",
      "Wrap counters in rate() in PromQL: rate(http_server_requests_seconds_count[5m])",
      "Never tag metrics with user ids, emails or raw URLs",
      "show-details: when-authorized hides health internals from anonymous users",
    ],
    quiz: [
      {
        q: "Your liveness probe includes the database check, and the database goes down for 2 minutes. What happens on Kubernetes?",
        options: ["Nothing", "Traffic is paused but pods stay up", "Every pod is restarted, adding load and delay without fixing anything", "The database restarts"],
        answer: 2,
        why: "Failed liveness triggers restarts, and restarting cannot fix an external outage.",
      },
      {
        q: "Which Micrometer type fits the current number of items waiting in a queue?",
        options: ["Gauge", "Counter", "Timer", "Distribution summary"],
        answer: 0,
        why: "A gauge reports a value that can go up and down at any moment.",
      },
      {
        q: "Why is exposing the heapdump endpoint publicly dangerous?",
        options: ["It slows down the database", "It disables metrics", "It deletes logs", "A heap dump can contain secrets like passwords and tokens"],
        answer: 3,
        why: "The dump is a copy of the JVM memory, including any secrets the app holds.",
      },
      {
        q: "Why should a metric tag not contain the user id?",
        options: ["Prometheus rejects numbers in tags", "Every unique value creates a new time series and storage explodes", "User ids are always null", "Tags must be booleans"],
        answer: 1,
        why: "High-cardinality tags multiply series and can overload the monitoring system.",
      },
      {
        q: "What does health return as HTTP status when the overall status is DOWN?",
        options: ["200", "404", "500", "503"],
        answer: 3,
        why: "Spring Boot maps DOWN and OUT_OF_SERVICE to 503 Service Unavailable by default.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Expose health, info and prometheus, then call each endpoint with curl and describe what you see.",
        hint: "Add spring-boot-starter-actuator and micrometer-registry-prometheus first.",
        solution: "# application.properties\n# management.endpoints.web.exposure.include=health,info,prometheus\ncurl localhost:8080/actuator/health      # {\"status\":\"UP\"}\ncurl localhost:8080/actuator/info        # {} until you add info\ncurl localhost:8080/actuator/prometheus | grep jvm_memory_used_bytes",
      },
      {
        level: "medium",
        task: "Write a custom HealthIndicator that reports DOWN when a payment provider URL cannot be reached within 2 seconds, and add it to the readiness group only.",
        hint: "Implement HealthIndicator; group membership is set in properties.",
        solution: "@Component(\"payment\")\nclass PaymentHealth implements HealthIndicator {\n  public Health health() {\n    try { client.ping(Duration.ofSeconds(2)); return Health.up().build(); }\n    catch (Exception e) { return Health.down(e).build(); }\n  }\n}\n// management.endpoint.health.group.readiness.include=readinessState,payment",
      },
      {
        level: "hard",
        task: "Write a Prometheus alert rule that fires when more than 5% of requests for booking-api return 5xx for 10 minutes.",
        hint: "Divide the rate of 5xx counts by the rate of all counts, and use for: 10m.",
        solution: "groups:\n  - name: booking-api\n    rules:\n      - alert: HighErrorRate\n        expr: |\n          sum(rate(http_server_requests_seconds_count{application=\"booking-api\",status=~\"5..\"}[5m]))\n          / sum(rate(http_server_requests_seconds_count{application=\"booking-api\"}[5m])) > 0.05\n        for: 10m\n        labels: { severity: page }",
      },
    ],
    faq: [
      { q: "Is Actuator safe to use in production?", a: "Yes, if you expose only what you need, hide health details from anonymous users, and keep sensitive endpoints off the public network, for example on a separate management port." },
      { q: "What is the difference between metrics, logs and traces?", a: "Metrics are numbers over time, cheap and good for alerts. Logs are individual events with detail. Traces follow one request across services; Spring Boot uses Micrometer Tracing for them." },
      { q: "Do I need Prometheus to use Micrometer?", a: "No. Micrometer supports many backends through separate registry dependencies, such as Datadog, CloudWatch or OTLP for OpenTelemetry." },
      { q: "Why do my Prometheus numbers look like they never go down?", a: "Counters only increase. Use rate() or increase() in your queries to see how fast they grow over a time window." },
    ],
  },
};

export default extra;
