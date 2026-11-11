import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-hashing/hash-functions": {
    plain: [
      "Think of a big coat room with 100 numbered hooks. When a guest arrives, you do not search for a free hook at random. You use a rule, for example the last two digits of their phone number, to pick a hook. Later, you use the same rule to find their coat at once. A hash function is that rule for data.",
      "A hash function takes a key, such as a word or a number, and turns it into an integer. The program then shrinks that integer to fit the table, usually with the remainder after division (h % size). The result is the bucket, the slot where the item lives.",
      "A good hash function has three jobs. It must always give the same answer for the same key (deterministic). It must be fast. And it must spread keys evenly, so a few buckets do not get crowded while others stay empty.",
      "Two different keys sometimes land in the same bucket. This is called a collision, and it cannot be avoided completely, because there are more possible keys than buckets. A good hash function just makes collisions rare and random, and the table has a plan for handling them.",
      "There is one strict rule: a key must not change after you store it. If it changes, its hash changes, and the table looks in the wrong bucket. That is why Python lets you use strings, numbers and tuples as dict keys, but not lists.",
    ],
    deepDive: [
      {
        heading: "From any key to a bucket index",
        body: "Hashing happens in two stages. First, the key becomes a fixed-size integer, often 64 bits. Second, that integer is reduced to an index in the range 0 to capacity - 1.\n\nThe common reduction is h % capacity. Many real tables (Python dict, Java HashMap) use a capacity that is a power of two, so the reduction becomes h & (capacity - 1), which keeps only the low bits and is faster than division. The danger: if keys differ only in their high bits, they all collide. So these tables mix the bits first. Java's HashMap XORs the top 16 bits into the low 16 bits, and Python's dict feeds the high bits into its probe sequence.\n\nAnother classic method is multiplicative (Fibonacci) hashing: multiply the key by 2654435769 (about 2^32 divided by the golden ratio), keep 32 bits, and take the top r bits for a table of 2^r slots.",
        bullets: ["Stage 1: key to integer", "Stage 2: integer to index", "Power-of-two capacity: index = h & (cap - 1)", "Prime capacity with % is more forgiving of weak hashes"],
        visual: {
          type: "flow",
          title: "Inside a dict lookup",
          steps: [
            { label: "Key", detail: "For example the string 'cat'." },
            { label: "hash(key)", detail: "A 64-bit integer, cached on str objects." },
            { label: "Mix bits", detail: "Spread high bits into low bits." },
            { label: "Mask", detail: "h & (capacity - 1) gives the slot." },
            { label: "Compare", detail: "Check hash and then == on the stored key." },
          ],
        },
      },
      {
        heading: "Uniformity, collisions and the birthday effect",
        body: "With n keys and m buckets, a uniform hash puts n / m keys in each bucket on average. That ratio is the load factor, and it decides how fast lookups are.\n\nCollisions come sooner than intuition says. This is the birthday paradox: in a room of only 23 people, the chance that two share a birthday is over 50 percent, even though there are 365 days. In general, you expect the first collision after about the square root of m keys. For a 32-bit hash that is roughly 77,000 keys for a 50 percent chance. This is why tables must handle collisions, and why you should never treat a 32-bit hash as a unique ID.\n\nA weak hash makes things worse. Summing character codes, for example, gives 'abc', 'acb' and 'cba' the same value, so all anagrams collide.",
        bullets: ["Load factor = n / m", "Expect a collision after about sqrt(m) keys", "Order-blind hashes (like sums) collide on anagrams"],
      },
      {
        heading: "Polynomial rolling hashes for strings",
        body: "Treat a string as a number in base B: h(s) = s[0]*B^(k-1) + s[1]*B^(k-2) + ... + s[k-1], all taken mod a large prime M. Because each position has a different power of B, order matters, so 'abc' and 'cba' differ.\n\nThe trick is the rolling update. When a window of length k slides one step right, you remove the leftmost character's term, shift everything by multiplying by B, and add the new character: h = ((h - s[i]*B^(k-1)) * B + s[i+k]) mod M. Each step is O(1), so you can hash every window of a text of length n in O(n) total.\n\nRabin-Karp search uses this: compare window hashes with the pattern hash, and only check characters when hashes match. Expected time is O(n + k); the worst case is O(n * k) if many hashes match falsely. Pick a random base, or use two moduli, to make false matches very unlikely.",
        bullets: ["Typical choice: B = 31 or random, M = 10^9 + 7", "Precompute B^(k-1) mod M once", "Equal hash is a hint, not a proof: verify"],
      },
      {
        heading: "Why keys must be immutable",
        body: "A table stores each entry in the bucket chosen by the key's hash at insertion time. If the key later changes, its new hash points to a different bucket. Lookups now search the wrong place, and the old entry becomes a ghost: still taking space, but unreachable.\n\nPython protects you for built-in types. list, dict and set have __hash__ set to None, so hash([1, 2]) raises TypeError. A tuple is hashable only if everything inside it is hashable, so hash((1, [2])) also fails. Use tuple or frozenset as keys instead.\n\nFor your own classes, the default hash is based on object identity, which is safe. If you define __eq__, Python sets __hash__ to None unless you also define __hash__. When you do, hash exactly the fields that __eq__ compares, and never change those fields while the object is inside a set or dict. A frozen dataclass does this for you.",
        bullets: ["Rule: a == b must imply hash(a) == hash(b)", "Unequal objects may share a hash", "@dataclass(frozen=True) gives a matching __hash__"],
      },
      {
        heading: "Hash flooding and Python's randomised hashes",
        body: "If an attacker knows your hash function, they can send thousands of keys that all land in one bucket, for example as form fields in a web request. Every insert then scans a long chain, turning O(1) into O(n) and a request into a CPU-burning O(n^2) job. This is called hash flooding, a denial-of-service attack.\n\nThe defence is a keyed hash: mix a secret random seed into the hash. Since Python 3.3, str and bytes hashes are randomised per process, and since 3.4 they use SipHash with a secret random key. Run python -c \"print(hash('cat'))\" twice and you get two different numbers. Set the environment variable PYTHONHASHSEED=0 to turn this off for reproducible debugging.\n\nIntegers are not randomised: hash(42) is 42. Note also that hash(1) == hash(1.0) == hash(True), because they compare equal, so they act as the same dict key.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Weak versus good string hash",
        columns: [
          { title: "Sum of character codes", points: ["'abc', 'bca', 'cab' all collide", "Ignores order", "Small range for short words", "Easy to attack"] },
          { title: "Polynomial mod prime", points: ["Order changes the value", "Spreads over the full range", "Rolls in O(1) per step", "Random base resists attacks"] },
        ],
      },
    ],
    examples: [
      {
        title: "Seeing a collision with a bad hash",
        explanation: "We hash five words into 8 buckets using two functions. The sum hash sends the anagrams 'listen', 'silent' and 'enlist' to the same bucket, because addition does not care about order. The polynomial hash spreads them out. Same input, same table size: only the quality of the function changed.",
        code: {
          lang: "python",
          code: "def sum_hash(s):\n    return sum(map(ord, s))\n\ndef poly_hash(s, base=31, mod=10**9 + 7):\n    h = 0\n    for ch in s:\n        h = (h * base + ord(ch)) % mod\n    return h\n\nwords = ['listen', 'silent', 'enlist', 'cat', 'dog']\nprint([sum_hash(w) % 8 for w in words])   # first three equal\nprint([poly_hash(w) % 8 for w in words])  # spread out",
        },
      },
      {
        title: "Finding a pattern with a rolling hash",
        explanation: "Rabin-Karp searches 'abracadabra' for 'cad'. We hash the pattern once, then hash the first window 'abr'. Each step drops the left character, multiplies by the base and adds the next character, so each window costs O(1). When the window hash equals the pattern hash, we compare the actual characters to rule out a false match. The match is at index 4.",
        code: {
          lang: "python",
          code: "def rabin_karp(text, pat, B=256, M=1_000_000_007):\n    k, n = len(pat), len(text)\n    if k > n: return -1\n    top = pow(B, k - 1, M)\n    hp = ht = 0\n    for i in range(k):\n        hp = (hp * B + ord(pat[i])) % M\n        ht = (ht * B + ord(text[i])) % M\n    for i in range(n - k + 1):\n        if hp == ht and text[i:i + k] == pat:\n            return i\n        if i + k < n:\n            ht = ((ht - ord(text[i]) * top) * B + ord(text[i + k])) % M\n    return -1\n\nprint(rabin_karp('abracadabra', 'cad'))  # 4",
        },
      },
    ],
    cheatSheet: [
      "Bucket index = hash(key) % capacity, or hash & (capacity - 1) when capacity is a power of two",
      "If a == b then hash(a) == hash(b); the reverse need not hold",
      "Hashable: int, float, str, bytes, tuple of hashables, frozenset. Not: list, dict, set",
      "Rolling update: h = ((h - left * B^(k-1)) * B + new) % M",
      "First collision expected after about sqrt(m) keys (birthday effect)",
      "PYTHONHASHSEED=0 disables str hash randomisation for debugging",
      "hash(1) == hash(1.0) == hash(True): they are one dict key",
    ],
    quiz: [
      {
        q: "Which property is required of every hash function used in a hash table?",
        options: ["Equal keys always give equal hashes", "Different keys always give different hashes", "The output is always a prime number", "The output is smaller than the key"],
        answer: 0,
        why: "Determinism for equal keys is required; collisions between different keys are allowed.",
      },
      {
        q: "Why does summing character codes make a poor string hash?",
        options: ["It is too slow", "It cannot handle Unicode", "It gives all anagrams the same value", "It produces negative numbers"],
        answer: 2,
        why: "Addition ignores order, so any rearrangement of the same letters collides.",
      },
      {
        q: "A table has 2^32 possible hash values. Roughly how many random keys give a 50 percent chance of at least one collision?",
        options: ["About 2^31", "About 1,000", "About 4 billion", "About 77,000"],
        answer: 3,
        why: "By the birthday effect, collisions appear after about sqrt(m) keys, and sqrt(2^32) scaled for 50 percent is about 77,000.",
      },
      {
        q: "You define __eq__ on a class but not __hash__. What happens when you put an instance in a set?",
        options: ["It uses identity hashing as before", "It raises TypeError: unhashable type", "It hashes all attributes automatically", "It works but lookups are O(n)"],
        answer: 1,
        why: "Defining __eq__ without __hash__ sets __hash__ to None, making instances unhashable.",
      },
      {
        q: "What is the cost of sliding a polynomial rolling hash window one position?",
        options: ["O(k) for window length k", "O(log k)", "O(1)", "O(n) for text length n"],
        answer: 2,
        why: "You subtract one term, multiply once and add one term, all constant work.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show that a list cannot be a dict key but a tuple can. Then write a function that converts a list of lists into a set of tuples so duplicates are removed. Example: [[1, 2], [1, 2], [3]] gives {(1, 2), (3,)}.",
        hint: "Convert each inner list with tuple().",
        solution: "try:\n    d = {[1, 2]: 'x'}\nexcept TypeError as e:\n    print(e)   # unhashable type: 'list'\n\ndef unique_rows(rows):\n    return {tuple(r) for r in rows}\n\nprint(unique_rows([[1, 2], [1, 2], [3]]))  # {(1, 2), (3,)}",
      },
      {
        level: "medium",
        task: "Write a Point class with x and y where two points with the same coordinates are equal and work as the same set member. Example: len({Point(1, 2), Point(1, 2)}) is 1.",
        hint: "Define __eq__ and a __hash__ that hashes the same fields, or use a frozen dataclass.",
        solution: "from dataclasses import dataclass\n\n@dataclass(frozen=True)\nclass Point:\n    x: int\n    y: int\n\nprint(len({Point(1, 2), Point(1, 2)}))  # 1\n# frozen=True makes fields read-only and adds\n# __hash__ based on (x, y), matching __eq__",
      },
      {
        level: "hard",
        task: "Write count_distinct_substrings_of_len(s, k) that counts distinct substrings of length k in O(n) expected time using a rolling hash. Example: ('abab', 2) returns 2 ('ab' and 'ba').",
        hint: "Roll the hash over every window and store the hashes in a set. Use a large modulus to keep false collisions rare.",
        solution: "def count_k(s, k, B=911382323, M=(1 << 61) - 1):\n    if k > len(s): return 0\n    top, h = pow(B, k - 1, M), 0\n    for ch in s[:k]:\n        h = (h * B + ord(ch)) % M\n    seen = {h}\n    for i in range(k, len(s)):\n        h = ((h - ord(s[i - k]) * top) * B + ord(s[i])) % M\n        seen.add(h)\n    return len(seen)\n\nprint(count_k('abab', 2))  # 2",
      },
    ],
    faq: [
      { q: "Is hash() the same as a cryptographic hash like SHA-256?", a: "No. Python's hash() is built for speed in tables and is randomised per process for strings. For passwords, file checksums or signatures use hashlib (SHA-256) or a password hash like bcrypt or Argon2." },
      { q: "Why does hash('cat') change every time I run Python?", a: "String hashes are seeded with a random key at startup to block hash flooding attacks. Set PYTHONHASHSEED to a fixed number if you need repeatable values." },
      { q: "Can I store hash values in a database to compare later?", a: "Not from Python's hash(), because it differs between runs. Use a stable hash such as hashlib.sha256 or zlib.crc32 instead." },
    ],
  },

  "dsa-hashing/hash-tables": {
    plain: [
      "A hash table is the structure behind Python's dict and set. It is an array of slots called buckets. To store a key, you hash it, pick a bucket, and put the key and its value there. To find it again, you hash the key and jump straight to that bucket. No searching through the whole array.",
      "The hard part is collisions: two keys that want the same bucket. There are two main fixes. Chaining keeps a small list in each bucket, so colliding keys just share the list. Open addressing keeps one entry per slot, and when a slot is taken you try the next one, and the next, until you find room.",
      "The table must not get too full. The load factor is the number of stored keys divided by the number of buckets. When it gets high, collisions pile up and everything slows down. So the table grows, usually to double its size, and moves every key to its new bucket. That move is called rehashing.",
      "Rehashing is slow when it happens, but it happens rarely. Spread over all the inserts, each insert still costs O(1) on average. That is why a dict feels instant even with millions of keys.",
    ],
    deepDive: [
      {
        heading: "Separate chaining in practice",
        body: "Each bucket holds a list (or linked list) of key-value pairs. Insert hashes the key, scans that bucket for the key, and either updates the value or appends a new pair. Lookup and delete scan the same bucket.\n\nWith a uniform hash and load factor a = n / m, a bucket holds a keys on average. An unsuccessful search checks about 1 + a entries, and a successful one about 1 + a/2. Keep a bounded, for example below 1, and every operation is O(1) on average.\n\nChaining is forgiving: it still works above a load factor of 1, and delete is simply removing an item from a list. The costs are extra memory for list objects or pointers, and poor cache use because entries are scattered. Java's HashMap uses chaining with a default load factor of 0.75, and turns a bucket into a small red-black tree once it grows past 8 entries (when the table has at least 64 buckets), so a bad bucket costs O(log n), not O(n).",
        bullets: ["Average O(1 + a) per operation", "Delete is easy: remove from the bucket list", "Java HashMap: chaining, 0.75 load factor, trees for long chains"],
      },
      {
        heading: "Open addressing and linear probing",
        body: "All entries live directly in the array. To insert, start at index h % m. If that slot is taken by another key, try the next slot (h + 1) % m, then (h + 2) % m, until you find an empty one. Lookup follows the same path and stops when it finds the key or reaches an empty slot.\n\nLinear probing is very cache friendly, because the probes touch neighbouring memory. Its weakness is primary clustering: occupied slots form long runs, and any key landing inside a run must walk to its end, making the run longer still. Knuth's analysis gives about (1 + 1/(1 - a)) / 2 probes for a hit and (1 + 1/(1 - a)^2) / 2 for a miss. At a = 0.5 that is 1.5 and 2.5 probes. At a = 0.9 it is 5.5 and 50.5. So open-addressing tables stay well below full.\n\nQuadratic probing and double hashing jump further to break up clusters.",
        visual: {
          type: "flow",
          title: "Linear probing insert of key K with h % 8 = 3",
          steps: [
            { label: "Slot 3", detail: "Taken by another key: move on." },
            { label: "Slot 4", detail: "Taken: move on." },
            { label: "Slot 5", detail: "Tombstone: remember it, keep checking for K." },
            { label: "Slot 6", detail: "Empty: K is not in the table." },
            { label: "Store", detail: "Put K in slot 5, the first reusable slot." },
          ],
        },
      },
      {
        heading: "Deleting with tombstones",
        body: "In open addressing you cannot just empty a slot on delete. Suppose keys A and B both hash to slot 3, so B was pushed to slot 4. If you delete A by clearing slot 3, a later lookup for B stops at the empty slot 3 and wrongly reports that B is missing.\n\nThe fix is a tombstone: a special marker meaning \"deleted, but keep probing\". Lookups skip over tombstones. Inserts may reuse a tombstone slot, but only after confirming the key is not further along the chain, otherwise you create a duplicate.\n\nTombstones still count as used slots for probing, so a table with many deletes gets slow even with few live keys. Implementations track live keys plus tombstones and rebuild the table when the total gets too high. CPython's dict does exactly this: deleted entries become dummy markers that are cleared on the next resize.",
        bullets: ["Lookup: skip tombstones, stop at empty", "Insert: reuse the first tombstone after checking the key is absent", "Rebuild when live + tombstones passes the threshold"],
      },
      {
        heading: "Load factor, resizing and amortised cost",
        body: "When the load factor passes a threshold, allocate a bigger array (usually double) and reinsert every key, because each key's index depends on the capacity. This rehash costs O(n).\n\nWhy is insert still O(1)? With doubling, a table that ends with n keys has rehashed at sizes about n/2, n/4, n/8 and so on. Those add up to less than n moves in total, so the cost per insert is a constant on average. This is amortised O(1): any one insert may be slow, but a long run of inserts is fast overall.\n\nThresholds differ by design. Java HashMap resizes at 0.75. CPython's dict resizes when it is 2/3 full, starts with 8 slots, and keeps power-of-two sizes. Linear probing tables often stop at 0.5 to 0.7. Some tables also shrink after many deletes to save memory, which needs a lower threshold (like 0.25) to avoid resizing back and forth.",
        bullets: ["Rehash cost: O(n), amortised O(1) per insert", "Grow by a factor (2x), not by a fixed amount", "Shrink threshold must be well below the grow threshold"],
      },
      {
        heading: "Average versus worst case, and what CPython does",
        body: "With a good hash and bounded load factor, insert, lookup and delete are O(1) on average. In the worst case, every key collides and each operation is O(n). That happens with a broken __hash__ (for example one that returns a constant) or with deliberate hash flooding.\n\nCPython's dict is an open-addressing table with a clever probe order. Instead of stepping +1, each step shifts perturb right by 5 bits and computes j = (5*j + 1 + perturb) % size. This brings in the high bits of the hash and eventually visits every slot. Since Python 3.6 the dict also keeps a compact array of entries in insertion order, with the hash table holding only small indexes into it. That saves memory and is why dicts remember insertion order, which the language guarantees since 3.7.\n\nOther designs worth knowing: Robin Hood hashing, cuckoo hashing (O(1) worst-case lookup) and Swiss tables, used by Rust's standard HashMap.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "CPython dict memory layout (3.6 and later)",
        layers: [
          { label: "Index table", detail: "Small ints per slot: entry number, EMPTY or DUMMY." },
          { label: "Entries array", detail: "(hash, key, value) rows in insertion order." },
          { label: "Key objects", detail: "str caches its hash, so it is computed once." },
          { label: "Value objects", detail: "Any Python object, referenced by pointer." },
        ],
      },
      {
        type: "compare",
        title: "Cost per operation",
        columns: [
          { title: "Average case", points: ["Insert O(1) amortised", "Lookup O(1)", "Delete O(1)", "Needs good hash and bounded load"] },
          { title: "Worst case", points: ["Insert O(n)", "Lookup O(n)", "Delete O(n)", "All keys in one bucket or cluster"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why deletes need tombstones, traced",
        explanation: "Capacity 8. Keys 3, 11 and 19 all have 3 as their index (x % 8 = 3), so with linear probing they land in slots 3, 4 and 5. Now delete 11 from slot 4. If we make slot 4 empty, searching for 19 starts at slot 3 (holds 3, not 19), moves to slot 4, sees empty and stops: 19 looks missing. If we mark slot 4 as a tombstone, the search skips it, reaches slot 5 and finds 19. A new insert of 27 also starts at 3; it checks 3, skips the tombstone at 4 while remembering it, checks 5, hits empty slot 6, and then stores 27 in slot 4.",
      },
      {
        title: "A linear probing map with tombstones and resizing",
        explanation: "This compact map stores (key, value) pairs in one list. DEL is the tombstone. put first walks the probe chain to find the key or an empty slot, remembering the first tombstone, so keys are never duplicated. The table doubles when live keys plus tombstones exceed half the capacity, which also clears the tombstones.",
        code: {
          lang: "python",
          code: "DEL = object()\nclass ProbeMap:\n    def __init__(self, cap=8): self.t, self.used = [None] * cap, 0  # live + tombstones\n    def _find(self, k):\n        i, first_del = hash(k) % len(self.t), None\n        while self.t[i] is not None:\n            if self.t[i] is DEL: first_del = i if first_del is None else first_del\n            elif self.t[i][0] == k: return i, True\n            i = (i + 1) % len(self.t)\n        return (i if first_del is None else first_del), False\n    def put(self, k, v):\n        i, found = self._find(k)\n        if not found and self.t[i] is None: self.used += 1\n        self.t[i] = (k, v)\n        if self.used * 2 > len(self.t): self._grow()",
        },
      },
    ],
    cheatSheet: [
      "Load factor a = n / m; keep it below about 0.7 for probing, around 1 for chaining",
      "Chaining: average O(1 + a) per operation, delete by removing from the bucket list",
      "Linear probing misses cost about (1 + 1/(1 - a)^2) / 2 probes: 2.5 at 0.5, 50.5 at 0.9",
      "Open addressing delete: leave a tombstone, never an empty slot",
      "Doubling on resize makes insert amortised O(1); rehash itself is O(n)",
      "CPython dict: open addressing, power-of-two size, grows at 2/3 full, insertion ordered",
      "Java HashMap: chaining, initial capacity 16, load factor 0.75, buckets over 8 entries become trees",
    ],
    quiz: [
      {
        q: "In linear probing, why can't delete simply set the slot back to empty?",
        options: ["It would leak memory", "Later lookups could stop early and miss keys further along the chain", "Python forbids None in lists", "It would make the load factor negative"],
        answer: 1,
        why: "An empty slot ends a probe sequence, so keys placed after it become unreachable.",
      },
      {
        q: "A hash table doubles its capacity whenever it gets too full. What is the amortised cost of an insert?",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        answer: 3,
        why: "Total rehash work over n inserts is less than 2n, so each insert averages constant time.",
      },
      {
        q: "What is primary clustering?",
        options: ["Runs of occupied slots that grow and slow down probing", "Keys sorted into groups by value", "Buckets that hold sub-tables", "Grouping tables across servers"],
        answer: 0,
        why: "In linear probing, a key that hits a run must walk to its end, extending the run further.",
      },
      {
        q: "Your custom class's __hash__ returns 7 for every object. What happens to a set of n such objects?",
        options: ["Nothing, Python rehashes automatically", "Inserting raises an error", "Operations degrade to O(n) each because every key collides", "The set holds only one object"],
        answer: 2,
        why: "All keys probe the same path, so each insert or lookup compares against many keys; equality still keeps distinct objects.",
      },
      {
        q: "Which statement about Java's HashMap is correct?",
        options: ["It uses linear probing", "Its default load factor is 0.75", "It keeps keys in insertion order", "It never resizes"],
        answer: 1,
        why: "HashMap uses chaining with a default load factor of 0.75; LinkedHashMap is the ordered variant.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a resize step to a chaining map: when n / len(buckets) exceeds 0.75, double the bucket count and reinsert every pair. Show that 100 inserts end with 256 buckets when starting from 8.",
        hint: "Build new empty buckets, then loop over every old pair and append it to its new bucket.",
        solution: "def _resize(self):\n    old = self.buckets\n    self.buckets = [[] for _ in range(2 * len(old))]\n    for b in old:\n        for k, v in b:\n            self.buckets[hash(k) % len(self.buckets)].append([k, v])\n\n# in put, after a new key is added:\n#     if self.n / len(self.buckets) > 0.75: self._resize()\n# 8 -> 16 -> 32 -> 64 -> 128 -> 256 (100/128 > 0.75)",
      },
      {
        level: "medium",
        task: "Complete the ProbeMap from the example: write get(k) and delete(k). get returns None for a missing key; delete marks the slot with DEL and returns True if the key existed.",
        hint: "Reuse _find. Only treat the result as a hit when found is True.",
        solution: "def get(self, k):\n    i, found = self._find(k)\n    return self.t[i][1] if found else None\n\ndef delete(self, k):\n    i, found = self._find(k)\n    if not found:\n        return False\n    self.t[i] = DEL        # used stays the same: tombstones count\n    return True",
      },
      {
        level: "hard",
        task: "Write _grow for ProbeMap: double the capacity, reinsert only live entries, and reset used. Explain why tombstones disappear and why used must be recomputed.",
        hint: "Save the old list, create a fresh one, then call put for each real (key, value) tuple.",
        solution: "def _grow(self):\n    old = self.t\n    self.t, self.used = [None] * (2 * len(old)), 0\n    for e in old:\n        if e is not None and e is not DEL:\n            self.put(e[0], e[1])\n# Tombstones are skipped, so the new table has none.\n# used counted live + tombstones; after rebuild it\n# equals the live count, rebuilt by each put.",
      },
    ],
    faq: [
      { q: "Is a Python dict lookup really O(1)?", a: "On average, yes, with ordinary keys. The worst case is O(n) if many keys collide, which is rare with built-in types and randomised string hashes." },
      { q: "What is the difference between a dict and a set in Python?", a: "Both are hash tables. A set stores only keys, while a dict stores a value with each key; set and dict use separate implementations but the same hashing ideas." },
      { q: "Why do dicts keep insertion order?", a: "Since Python 3.6, CPython stores entries in a compact array in the order they were added, and the hash table points into it. Python 3.7 made that order part of the language." },
      { q: "When should I use chaining instead of open addressing?", a: "Chaining is simpler, tolerates high load and makes deletes easy. Open addressing uses less memory and is faster due to cache locality, so most high-performance tables use it." },
    ],
  },

  "dsa-hashing/hashing-patterns": {
    plain: [
      "Many slow solutions look like this: for every item, scan all the other items. That is O(n^2), and with 100,000 items it means 10 billion steps. Hashing patterns fix this by remembering things in a dict or set as you go. Then checking \"have I seen this before?\" takes O(1).",
      "The classic example is two-sum: find two numbers that add up to a target. Instead of trying every pair, walk the list once. For each number x, ask: have I already seen target - x? If yes, you are done. If not, remember x and move on.",
      "Another pattern is grouping. You compute a key for each item, such as the sorted letters of a word, and put items with the same key in the same list. All anagrams of 'listen' end up together, because they all sort to 'eilnst'.",
      "Counting is the third pattern. A frequency map tells you how often each item appears. From it you can find duplicates, the most common items, or whether two strings use exactly the same letters.",
      "The price is memory. You trade O(n) extra space for a big drop in time. In almost every interview and real program, that trade is worth it.",
    ],
    deepDive: [
      {
        heading: "Complement maps: two-sum and friends",
        body: "The pattern: while scanning, store something about earlier items in a dict, and for the current item compute exactly what partner it needs. If the partner is in the dict, you found a pair.\n\nOrder matters. Check first, then insert. If you insert x before checking, a target of 10 and x = 5 would pair 5 with itself. Checking first also handles duplicates correctly: for [5, 5] and target 10, the second 5 finds the first.\n\nThe same idea counts pairs. To count pairs with difference k, store counts of seen values and add count[x - k] + count[x + k] at each step (for k > 0). To count pairs whose sum is divisible by k, store counts of x % k and look up (k - x % k) % k. Python's % always returns a non-negative result for positive k, which keeps negative numbers simple.",
        bullets: ["Check for the partner, then store the current item", "Store an index if you must return positions, a count if you only count", "Time O(n), space O(n)"],
      },
      {
        heading: "Grouping by a canonical key",
        body: "A canonical key is one normal form shared by every item that should be grouped together. Use a defaultdict(list) and append each item under its key.\n\nFor anagrams, the sorted string works: ''.join(sorted(w)). That costs O(L log L) per word of length L. For lowercase letters, a tuple of 26 counts is O(L) per word. Either key must be hashable, so use a str or tuple, never a list.\n\nOther canonical keys: for shifted strings like 'abc' and 'bcd', use the tuple of gaps between neighbouring letters mod 26. For points on the same line through the origin, use the reduced fraction (dy // g, dx // g) with g = gcd(dy, dx) and a fixed sign. For files with the same content, use a hash of their bytes.\n\nTotal cost for n words: O(n L log L) with sorting, or O(n L) with counts.",
        visual: {
          type: "tree",
          title: "Grouping anagrams by sorted key",
          root: "defaultdict(list)",
          children: [
            { label: "'aet'", children: ["eat", "tea", "ate"] },
            { label: "'ant'", children: ["tan", "nat"] },
            { label: "'abt'", children: ["bat"] },
          ],
        },
      },
      {
        heading: "Frequency counting and top-k",
        body: "collections.Counter builds a frequency map in O(n). From there, several questions become easy. Are two strings anagrams? Compare Counter(a) == Counter(b). What is the first unique character? Count, then scan the string again and return the first with count 1.\n\nFor the k most common items, Counter.most_common(k) uses a heap internally and runs in O(n log k). With no argument it sorts everything, O(n log n) for n distinct items.\n\nThere is an O(n) method called bucket sort by frequency. No item can appear more than n times, so make a list of n + 1 buckets where bucket f holds items seen f times. Walk the buckets from high to low until you have k items. This is a classic answer to \"top k frequent elements\" when the interviewer asks for better than O(n log n).",
        bullets: ["Counter(a) == Counter(b) checks same multiset", "most_common(k): O(n log k)", "Bucket by frequency: O(n) top-k"],
      },
      {
        heading: "Sets for duplicates, membership and sequences",
        body: "Use a set when you only need yes or no. Contains duplicate: len(set(a)) < len(a), O(n). Duplicate within distance k: keep a set of the last k items, removing a[i - k] as you move, so the set never grows beyond k.\n\nLongest consecutive sequence is a set classic. Put all numbers in a set. Only start counting from x if x - 1 is not in the set, because then x begins a run. From each start, count up while x + 1 is in the set. Each number is visited at most twice (once in the outer loop, once while counting a run), so the total is O(n), beating the O(n log n) sort-based answer.\n\nFor intersections, Python's a & b on sets is O(min(len(a), len(b))) on average, because it iterates over the smaller set and probes the larger.",
      },
      {
        heading: "Prefix sums plus a map",
        body: "For subarray questions with a target, combine a running total with a dict of earlier totals. A subarray from i to j sums to k exactly when prefix[j+1] - prefix[i] = k. So at each step, look up how many earlier prefixes equal total - k.\n\nStart the dict with {0: 1}. That represents the empty prefix and lets subarrays starting at index 0 be counted. To find the longest subarray with sum k instead of the count, store the first index where each total appeared and never overwrite it.\n\nMany problems reduce to this. Equal numbers of 0s and 1s: replace each 0 with -1 and find the longest subarray with sum 0. Subarray sum divisible by k: store counts of total % k. Unlike a sliding window, this works when numbers are negative.",
        visual: {
          type: "flow",
          title: "Longest subarray with sum 0 in [1, -1, 3, -3, 2]",
          steps: [
            { label: "Init", detail: "first = {0: -1}, total = 0, best = 0" },
            { label: "i=0..1", detail: "Totals 1, 0. Total 0 seen at -1: length 2." },
            { label: "i=2", detail: "Total 3, first time: first[3] = 2." },
            { label: "i=3", detail: "Total 0 again: length 3 - (-1) = 4." },
            { label: "i=4", detail: "Total 2, new. Answer: 4, [1, -1, 3, -3]." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Brute force versus hashing",
        columns: [
          { title: "Nested loops", points: ["Compare every pair", "O(n^2) time", "O(1) extra space", "10^5 items: about 5 x 10^9 pairs"] },
          { title: "One pass with a dict", points: ["Remember what you have seen", "O(n) average time", "O(n) extra space", "10^5 items: 10^5 lookups"] },
        ],
      },
    ],
    examples: [
      {
        title: "Top k frequent elements in O(n)",
        explanation: "For [1, 1, 1, 2, 2, 3] and k = 2, count first: {1: 3, 2: 2, 3: 1}. Make buckets indexed by frequency 0 to 6. Put 1 in bucket 3, 2 in bucket 2, 3 in bucket 1. Walk from bucket 6 down and collect items until we have 2: we get 1, then 2. Every step is linear, so the whole thing is O(n).",
        code: {
          lang: "python",
          code: "from collections import Counter\n\ndef top_k(nums, k):\n    buckets = [[] for _ in range(len(nums) + 1)]\n    for x, f in Counter(nums).items():\n        buckets[f].append(x)\n    out = []\n    for f in range(len(nums), 0, -1):\n        for x in buckets[f]:\n            out.append(x)\n            if len(out) == k:\n                return out\n    return out\n\nprint(top_k([1, 1, 1, 2, 2, 3], 2))  # [1, 2]",
        },
      },
      {
        title: "Longest consecutive sequence with a set",
        explanation: "For [100, 4, 200, 1, 3, 2], put everything in a set. Check each number: 100 has no 99, so it starts a run of length 1. 4 has a 3, so skip it. 200 starts a run of 1. 1 has no 0, so it starts a run: 2, 3 and 4 are present, giving length 4. 3 and 2 are skipped. The answer is 4, in O(n) time.",
        code: {
          lang: "python",
          code: "def longest_consecutive(nums):\n    s = set(nums)\n    best = 0\n    for x in s:\n        if x - 1 not in s:          # x starts a run\n            y = x\n            while y + 1 in s:\n                y += 1\n            best = max(best, y - x + 1)\n    return best\n\nprint(longest_consecutive([100, 4, 200, 1, 3, 2]))  # 4",
        },
      },
    ],
    cheatSheet: [
      "Two-sum: check target - x in seen, then seen[x] = i",
      "Group: defaultdict(list) keyed by a canonical form (sorted string or count tuple)",
      "Anagram check: Counter(a) == Counter(b), O(n)",
      "Top-k frequent: Counter.most_common(k) is O(n log k); frequency buckets are O(n)",
      "Subarray sum k: counts = {0: 1}; ans += counts[total - k]",
      "Longest run of consecutive ints: only start counting at x when x - 1 is absent",
      "Need only membership? Use a set. Need a value per key? Use a dict",
    ],
    quiz: [
      {
        q: "In one-pass two-sum, why do you check for target - x before storing x?",
        options: ["To keep the dict sorted", "So an element is not paired with itself", "To save memory", "Because dicts cannot be updated during a loop"],
        answer: 1,
        why: "Storing x first would let target = 2x match the same element.",
      },
      {
        q: "Which is a valid dict key for grouping anagrams of lowercase words?",
        options: ["A list of 26 counts", "A set of letters", "A tuple of 26 counts", "The word itself"],
        answer: 2,
        why: "A tuple is hashable and identical for all anagrams; a set loses repeated letters and a list is unhashable.",
      },
      {
        q: "What does the {0: 1} entry represent when counting subarrays that sum to k?",
        options: ["The empty prefix before index 0", "The first element", "A sentinel to avoid KeyError only", "The value of k"],
        answer: 0,
        why: "It lets subarrays that start at index 0 match when the running total itself equals k.",
      },
      {
        q: "What is the time complexity of the set-based longest consecutive sequence algorithm?",
        options: ["O(n log n)", "O(n^2)", "O(k) for the answer length k", "O(n) on average"],
        answer: 3,
        why: "Runs are only walked from their start, so each number is visited a constant number of times.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write first_unique(s) that returns the index of the first character that appears exactly once, or -1. Example: 'leetcode' returns 0, 'loveleetcode' returns 2, 'aabb' returns -1.",
        hint: "Count all characters first, then scan the string a second time.",
        solution: "from collections import Counter\n\ndef first_unique(s):\n    c = Counter(s)\n    for i, ch in enumerate(s):\n        if c[ch] == 1:\n            return i\n    return -1\n\nprint(first_unique('loveleetcode'))  # 2\n# Time O(n), space O(alphabet)",
      },
      {
        level: "medium",
        task: "Write group_shifted(words) that groups strings that are letter shifts of each other. Example: ['abc', 'bcd', 'xyz', 'az', 'ba', 'a'] gives groups [abc, bcd, xyz], [az, ba], [a].",
        hint: "Use the tuple of (ord(w[i]) - ord(w[i-1])) % 26 for each position as the key.",
        solution: "from collections import defaultdict\n\ndef group_shifted(words):\n    groups = defaultdict(list)\n    for w in words:\n        key = tuple((ord(w[i]) - ord(w[i - 1])) % 26\n                    for i in range(1, len(w)))\n        groups[key].append(w)\n    return list(groups.values())\n\nprint(group_shifted(['abc', 'bcd', 'xyz', 'az', 'ba', 'a']))",
      },
      {
        level: "hard",
        task: "Write longest_balanced(bits) that returns the length of the longest contiguous subarray with equal numbers of 0s and 1s. Example: [0, 1, 0, 0, 1, 1, 0] returns 6.",
        hint: "Treat 0 as -1. A balanced subarray then has sum 0. Store the first index of each running total.",
        solution: "def longest_balanced(bits):\n    first, total, best = {0: -1}, 0, 0\n    for i, b in enumerate(bits):\n        total += 1 if b else -1\n        if total in first:\n            best = max(best, i - first[total])\n        else:\n            first[total] = i\n    return best\n\nprint(longest_balanced([0, 1, 0, 0, 1, 1, 0]))  # 6",
      },
    ],
    faq: [
      { q: "When should I sort instead of using a hash map?", a: "Sort when you need order (ranges, nearest values, or output in sorted order) or when memory is tight. Sorting costs O(n log n) time but can run in place, while a hash map gives O(n) time with O(n) extra space." },
      { q: "Is defaultdict better than dict.get?", a: "They do the same job. defaultdict(list) or defaultdict(int) makes grouping and counting code shorter; dict.get(key, 0) is fine for one-off lookups and does not insert missing keys." },
      { q: "Does using a set always make code faster?", a: "Membership tests drop from O(n) on a list to O(1) on average, which matters inside loops. For a handful of items, or a single check, building the set may cost more than it saves." },
    ],
  },
};

export default extra;
