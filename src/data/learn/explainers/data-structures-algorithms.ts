import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Complexity analysis & math basics ─────────────
  "dsa-foundations/asymptotic-notation": {
    summary:
      "Asymptotic notation describes how an algorithm's cost grows as the input size n grows, ignoring machine speed and constant factors. Big-O gives an upper bound, Big-Omega a lower bound and Big-Theta a tight bound. It lets you compare algorithms before writing a single benchmark.",
    analogy: "Comparing walking and driving by how travel time grows with distance, not by who has the faster shoes.",
    visuals: [
      {
        type: "flow",
        title: "Common growth rates, fastest to slowest",
        steps: [
          { label: "O(1)", detail: "Array index, hash lookup." },
          { label: "O(log n)", detail: "Binary search." },
          { label: "O(n)", detail: "Single pass over the input." },
          { label: "O(n log n)", detail: "Merge sort, heap sort." },
          { label: "O(n^2)", detail: "Nested loops over pairs." },
          { label: "O(2^n)", detail: "All subsets." },
        ],
      },
      {
        type: "compare",
        title: "The three bounds",
        columns: [
          { title: "Big-O", points: ["Upper bound", "Grows no faster than", "Most quoted in practice"] },
          { title: "Big-Omega", points: ["Lower bound", "Grows at least as fast as", "Used for lower-bound proofs"] },
          { title: "Big-Theta", points: ["Tight bound", "Both O and Omega hold", "Most precise statement"] },
        ],
      },
    ],
    keyPoints: [
      "Drop constants and lower-order terms: 3n^2 + 5n + 7 is O(n^2).",
      "O(n log n) is the best possible for comparison-based sorting.",
      "Best, average and worst case are separate questions from O, Omega and Theta.",
      "For n = 10^6, O(n log n) is about 2 x 10^7 steps while O(n^2) is 10^12.",
    ],
    terms: [
      { term: "n", meaning: "The input size, such as array length or number of vertices." },
      { term: "Big-O", meaning: "f(n) is O(g(n)) if f is eventually at most c times g." },
      { term: "Big-Theta", meaning: "Bounded above and below by constant multiples of g." },
      { term: "Worst case", meaning: "The maximum cost over all inputs of size n." },
    ],
    example: {
      lang: "python",
      code: "def contains(xs, target):      # O(n) time, O(1) space\n    for x in xs:\n        if x == target:\n            return True\n    return False\n\ndef has_pair_sum(xs, k):       # O(n^2) time\n    for i in range(len(xs)):\n        for j in range(i + 1, len(xs)):\n            if xs[i] + xs[j] == k:\n                return True\n    return False",
      caption: "One loop is linear; a loop over all pairs is quadratic.",
    },
    pitfalls: [
      "Treating Big-O as meaning worst case; it is just an upper bound on a function.",
      "Ignoring constants entirely when n is small and a simpler algorithm is faster.",
    ],
    check: [
      { q: "What is 4n^3 + 100n^2 in Big-O?", a: "O(n^3); keep only the dominant term and drop the constant." },
      { q: "Is an O(n) algorithm also O(n^2)?", a: "Yes, Big-O is an upper bound, though Theta(n) is the more informative statement." },
    ],
  },

  "dsa-foundations/analyzing-code": {
    summary:
      "You can usually read an algorithm's complexity straight from its structure. Sequential blocks add, nested loops multiply, and a loop that halves its range runs log n times. Recursive functions are analysed by writing a recurrence and solving it, often with the master theorem.",
    visuals: [
      {
        type: "tree",
        title: "Recursion tree for T(n) = 2T(n/2) + n",
        root: "n work at the top",
        children: [
          { label: "Level 1: 2 calls of n/2", children: ["Total n"] },
          { label: "Level 2: 4 calls of n/4", children: ["Total n"] },
          { label: "Level log n: n calls of 1", children: ["Total n"] },
          { label: "log n levels x n each", children: ["O(n log n)"] },
        ],
      },
    ],
    keyPoints: [
      "Sequential steps add: O(n) + O(n^2) is O(n^2).",
      "Nested loops multiply: an inner O(m) loop inside an O(n) loop is O(n*m).",
      "Halving or doubling a loop variable gives O(log n) iterations.",
      "Master theorem: T(n) = aT(n/b) + O(n^d) compares a with b^d to pick the dominant term.",
    ],
    terms: [
      { term: "Recurrence", meaning: "An equation defining T(n) in terms of smaller inputs." },
      { term: "Master theorem", meaning: "Closed-form solutions for divide-and-conquer recurrences." },
      { term: "Recursion tree", meaning: "Diagram of calls used to sum work level by level." },
      { term: "Dominant term", meaning: "The term that grows fastest and decides the Big-O." },
    ],
    example: {
      lang: "python",
      code: "def count_halvings(n):   # O(log n)\n    steps = 0\n    while n > 1:\n        n //= 2\n        steps += 1\n    return steps\n\ndef triangle(n):         # O(n^2): 0 + 1 + ... + (n-1) inner steps\n    total = 0\n    for i in range(n):\n        for j in range(i):\n            total += 1\n    return total",
    },
    pitfalls: [
      "Assuming a nested loop is always O(n^2) when the inner loop is bounded by a constant.",
      "Forgetting the cost of built-in calls inside loops, such as list.insert(0, x) or slicing.",
    ],
    check: [
      { q: "What does T(n) = T(n/2) + O(1) solve to?", a: "O(log n), as in binary search." },
      { q: "A loop runs i from 1 while i < n, doubling i each time. How many iterations?", a: "About log2 n." },
    ],
  },

  "dsa-foundations/amortized-space": {
    summary:
      "Amortised analysis averages the cost of an operation over a long sequence, so rare expensive steps are paid for by many cheap ones. Space complexity counts the extra memory an algorithm needs beyond its input, including the recursion stack. Both matter when choosing between otherwise similar solutions.",
    analogy: "Paying a little into a savings jar every day so the occasional big bill never hurts.",
    visuals: [
      {
        type: "compare",
        title: "Cost views for list.append",
        columns: [
          { title: "Single worst operation", points: ["Resize copies all n items", "O(n) for that one call", "Happens rarely"] },
          { title: "Amortised over n appends", points: ["Copies total about 2n", "O(1) per append on average", "Guaranteed, not probabilistic"] },
        ],
      },
    ],
    keyPoints: [
      "Amortised O(1) is a guarantee over any sequence, unlike average case over random inputs.",
      "Auxiliary space excludes the input; total space includes it.",
      "A recursion of depth d uses O(d) stack space even with no data structures.",
      "Measure with timeit and tracemalloc to confirm your analysis on real data.",
    ],
    terms: [
      { term: "Amortised cost", meaning: "Total cost of a sequence divided by its length." },
      { term: "Aggregate method", meaning: "Sum the cost of all n operations, then divide by n." },
      { term: "Auxiliary space", meaning: "Extra memory used beyond the input." },
      { term: "In-place", meaning: "Uses O(1) or very small auxiliary space." },
    ],
    example: {
      lang: "python",
      code: "import timeit\n\nsetup = 'xs = list(range(10_000))'\nprint(timeit.timeit('xs.append(1); xs.pop()', setup, number=100_000))\nprint(timeit.timeit('xs.insert(0, 1); xs.pop(0)', setup, number=100_000))\n# append/pop at the end: amortised O(1)\n# insert/pop at index 0: O(n) shifting each time",
    },
    pitfalls: [
      "Calling a recursive solution O(1) space while it uses O(n) stack frames.",
      "Confusing amortised with average case; amortised needs no assumptions about inputs.",
    ],
    check: [
      { q: "Why is append amortised O(1) when resizing costs O(n)?", a: "Capacity doubles, so total copying over n appends is at most about 2n, which is O(1) per append." },
      { q: "What is the space complexity of a recursive DFS on a path graph of n nodes?", a: "O(n), from the recursion stack depth." },
    ],
  },

  "dsa-foundations/math-basics": {
    summary:
      "A small amount of math explains most algorithm costs. Logarithms count halvings, arithmetic and geometric series sum loop work, and modular arithmetic keeps huge numbers manageable. Counting formulas tell you how big a search space is before you try to brute force it.",
    visuals: [
      {
        type: "tree",
        title: "Math you will use most",
        root: "Algorithm math",
        children: [
          { label: "Logarithms", children: ["log2(10^6) is about 20", "Halving and tree height"] },
          { label: "Series", children: ["1 + 2 + ... + n = n(n+1)/2", "1 + 2 + 4 + ... + n < 2n"] },
          { label: "Modular arithmetic", children: ["(a*b) mod m", "Answers mod 10^9+7"] },
          { label: "Counting", children: ["n! permutations", "2^n subsets", "n choose k"] },
        ],
      },
    ],
    keyPoints: [
      "log2 of a billion is about 30, so O(log n) is effectively tiny.",
      "A geometric series is dominated by its largest term, which is why doubling is cheap overall.",
      "Fast exponentiation computes a^b mod m in O(log b) multiplications.",
      "2^n and n! grow so fast that n around 20 to 25 is the brute-force limit.",
    ],
    terms: [
      { term: "Logarithm", meaning: "log_b(n) is the power b must be raised to give n." },
      { term: "Geometric series", meaning: "Sum of terms that each multiply by a constant ratio." },
      { term: "Modulo", meaning: "Remainder after division; a mod m is in 0 to m-1." },
      { term: "Binomial coefficient", meaning: "n choose k: ways to pick k items from n." },
    ],
    example: {
      lang: "python",
      code: "def power_mod(a, b, m):    # O(log b)\n    result = 1\n    a %= m\n    while b > 0:\n        if b & 1:\n            result = result * a % m\n        a = a * a % m\n        b >>= 1\n    return result\n\nprint(power_mod(2, 100, 10**9 + 7), pow(2, 100, 10**9 + 7))",
      caption: "Python's built-in pow(a, b, m) does the same thing.",
    },
    check: [
      { q: "How many subsets does a 20-element set have?", a: "2^20, about one million." },
      { q: "What is 1 + 2 + ... + 100?", a: "100 x 101 / 2 = 5050." },
    ],
  },

  "dsa-foundations/python-for-dsa": {
    summary:
      "Python's built-in containers are already well-tuned data structures, but each operation has a cost you must know. Lists are dynamic arrays, dicts and sets are hash tables, deque is a double-ended queue, and heapq and bisect add heaps and binary search over lists. Choosing the wrong one silently turns O(n) into O(n^2).",
    visuals: [
      {
        type: "compare",
        title: "Operation costs of core containers",
        columns: [
          { title: "list", points: ["Index and append: O(1)", "insert(0) and pop(0): O(n)", "x in list: O(n)", "sort: O(n log n)"] },
          { title: "dict / set", points: ["Get, set, delete: O(1) average", "x in set: O(1) average", "Keys must be hashable", "Dict keeps insertion order"] },
          { title: "deque / heapq", points: ["deque appendleft and popleft: O(1)", "deque index middle: O(n)", "heappush and heappop: O(log n)", "heap[0] is the minimum"] },
        ],
      },
    ],
    keyPoints: [
      "Use a set, not a list, for repeated membership tests.",
      "Use collections.deque for queues; list.pop(0) is O(n).",
      "Counter and defaultdict remove boilerplate for counting and grouping.",
      "heapq is a min-heap; push negated values for a max-heap.",
    ],
    terms: [
      { term: "Hashable", meaning: "Has a stable hash and equality, such as int, str or tuple." },
      { term: "Counter", meaning: "Dict subclass that counts occurrences." },
      { term: "defaultdict", meaning: "Dict that creates missing values with a factory." },
      { term: "bisect", meaning: "Binary search helpers for sorted lists." },
    ],
    example: {
      lang: "python",
      code: "from collections import Counter, defaultdict, deque\nimport heapq, bisect\n\nprint(Counter('banana').most_common(1))   # [('a', 3)]\ngroups = defaultdict(list)\nfor w in ['eat', 'tea', 'tan']:\n    groups[''.join(sorted(w))].append(w)\nq = deque([1, 2]); q.appendleft(0); q.popleft()\nh = [5, 1, 3]; heapq.heapify(h); print(heapq.heappop(h))  # 1\nprint(bisect.bisect_left([1, 3, 5], 4))   # 2",
    },
    pitfalls: [
      "Using a list as a queue with pop(0) in BFS.",
      "Using lists as dict keys; convert them to tuples first.",
    ],
    check: [
      { q: "What is the cost of x in s for a set s?", a: "O(1) on average." },
      { q: "How do you get a max-heap with heapq?", a: "Push negated values and negate again when popping." },
    ],
  },

  // ───────────── Arrays & strings ─────────────
  "dsa-arrays-strings/static-arrays": {
    summary:
      "An array stores elements of the same size in one contiguous block of memory. The address of element i is the base address plus i times the element size, so indexing is O(1). Inserting or deleting in the middle requires shifting everything after it, which is O(n).",
    analogy: "Numbered seats in a cinema row: you find seat 12 instantly, but adding a seat in the middle moves everyone along.",
    visuals: [
      {
        type: "layers",
        title: "From index to memory",
        layers: [
          { label: "Code: a[3]", detail: "You ask for index 3." },
          { label: "Address arithmetic", detail: "base + 3 x element_size." },
          { label: "Contiguous memory block", detail: "Elements sit side by side." },
          { label: "CPU cache line", detail: "Neighbours load together, so scans are fast." },
        ],
      },
    ],
    keyPoints: [
      "Read or write by index: O(1).",
      "Insert or delete at position i: O(n - i) shifts, O(n) worst case.",
      "Contiguous layout gives excellent cache locality for sequential scans.",
      "2D arrays are usually stored row-major: element (r, c) is at r x cols + c.",
    ],
    terms: [
      { term: "Contiguous", meaning: "Stored in one unbroken block of memory." },
      { term: "Base address", meaning: "Memory address of element 0." },
      { term: "Row-major", meaning: "2D layout storing each row one after another." },
      { term: "Cache locality", meaning: "Nearby data is faster to access after a first access." },
    ],
    example: {
      lang: "python",
      code: "def insert_at(arr, size, i, value):\n    # arr has spare capacity; shift right from the end, O(n)\n    for j in range(size, i, -1):\n        arr[j] = arr[j - 1]\n    arr[i] = value\n    return size + 1\n\narr = [1, 2, 4, 0]\nsize = insert_at(arr, 3, 2, 3)\nprint(arr[:size])  # [1, 2, 3, 4]",
    },
    pitfalls: [
      "Shifting left to right during insertion, which overwrites values before moving them.",
      "Iterating column by column over a large row-major grid and losing cache benefits.",
    ],
    check: [
      { q: "Why is a[i] O(1)?", a: "Its address is computed directly as base + i x size, with no searching." },
      { q: "Where is (2, 3) in a row-major 4 x 5 grid?", a: "At offset 2 x 5 + 3 = 13." },
    ],
  },

  "dsa-arrays-strings/dynamic-arrays": {
    summary:
      "A dynamic array wraps a fixed-size array and tracks size and capacity separately. When it fills up it allocates a bigger array, usually about double, and copies the items across. Python's list works this way, which is why append is amortised O(1).",
    visuals: [
      {
        type: "cycle",
        title: "Append lifecycle",
        steps: [
          { label: "Append", detail: "Write at index size if there is room." },
          { label: "Full?", detail: "size equals capacity." },
          { label: "Grow", detail: "Allocate about 2x capacity." },
          { label: "Copy", detail: "Move all items, O(n) once." },
        ],
      },
    ],
    keyPoints: [
      "get and set by index: O(1).",
      "append: amortised O(1), occasionally O(n) when resizing.",
      "Growing by a constant amount instead of a factor makes appends O(n) amortised.",
      "Some implementations shrink when size drops below a quarter of capacity.",
    ],
    terms: [
      { term: "Size", meaning: "Number of elements actually stored." },
      { term: "Capacity", meaning: "Number of slots currently allocated." },
      { term: "Growth factor", meaning: "Multiplier used when resizing, often 1.5 or 2." },
      { term: "Resize", meaning: "Allocate a new array and copy the elements." },
    ],
    example: {
      lang: "python",
      code: "class DynArray:\n    def __init__(self):\n        self.size, self.cap = 0, 1\n        self.data = [None] * self.cap\n\n    def append(self, x):            # amortised O(1)\n        if self.size == self.cap:\n            self.cap *= 2\n            new = [None] * self.cap\n            new[:self.size] = self.data[:self.size]\n            self.data = new\n        self.data[self.size] = x\n        self.size += 1",
    },
    pitfalls: [
      "Forgetting to bounds-check against size rather than capacity in get.",
      "Shrinking at half full, which can thrash between grow and shrink.",
    ],
    check: [
      { q: "Why grow by a factor rather than by 10 slots?", a: "Factor growth makes the total copy cost linear, giving amortised O(1) appends." },
      { q: "What is the cost of inserting at index 0 of a dynamic array?", a: "O(n), every element shifts right." },
    ],
  },

  "dsa-arrays-strings/strings": {
    summary:
      "Strings are sequences of characters, and in Python they are immutable, so every modification builds a new string. Many string problems reduce to counting characters, comparing two ends, or scanning once while tracking state. Knowing these patterns solves most palindrome, anagram and parsing questions.",
    visuals: [
      {
        type: "compare",
        title: "Building a string of n pieces",
        columns: [
          { title: "s += piece in a loop", points: ["May copy the whole string each time", "O(n^2) characters copied worst case", "Fine for a few pieces"] },
          { title: "''.join(pieces)", points: ["Computes final length once", "O(total length)", "Idiomatic and fast"] },
        ],
      },
    ],
    keyPoints: [
      "Indexing and len are O(1); slicing s[i:j] copies and is O(j - i).",
      "Anagram check: compare Counters or sorted strings, O(n) or O(n log n).",
      "Palindrome check with two pointers is O(n) time and O(1) space.",
      "A fixed 26-slot count array is faster than a dict for lowercase letters.",
    ],
    terms: [
      { term: "Immutable", meaning: "Cannot be changed after creation." },
      { term: "Anagram", meaning: "Same characters with the same counts in a different order." },
      { term: "Palindrome", meaning: "Reads the same forwards and backwards." },
      { term: "ord / chr", meaning: "Convert between a character and its code point." },
    ],
    example: {
      lang: "python",
      code: "def is_anagram(a, b):          # O(n) time, O(1) space\n    if len(a) != len(b):\n        return False\n    counts = [0] * 26\n    for x, y in zip(a, b):\n        counts[ord(x) - ord('a')] += 1\n        counts[ord(y) - ord('a')] -= 1\n    return all(c == 0 for c in counts)\n\nprint(is_anagram('listen', 'silent'))  # True",
    },
    pitfalls: [
      "Slicing inside a loop, which hides an extra O(n) per iteration.",
      "Assuming only ASCII input when the problem allows Unicode.",
    ],
    check: [
      { q: "Why prefer join over += in a loop?", a: "Repeated += can copy the growing string each time, giving O(n^2); join is linear." },
      { q: "How do you check a palindrome in O(1) extra space?", a: "Compare characters from both ends moving two pointers inwards." },
    ],
  },

  "dsa-arrays-strings/prefix-sums": {
    summary:
      "A prefix sum array stores the running total up to each index, so any range sum becomes one subtraction. Building it costs O(n) once, after which each query is O(1). The same idea extends to 2D grids and pairs well with in-place techniques like reversal and partitioning.",
    visuals: [
      {
        type: "flow",
        title: "Range sum with prefix sums",
        steps: [
          { label: "Input", detail: "a = [3, 1, 4, 1, 5]" },
          { label: "Build prefix", detail: "p = [0, 3, 4, 8, 9, 14]" },
          { label: "Query sum(a[1..3])", detail: "p[4] - p[1]" },
          { label: "Answer", detail: "9 - 3 = 6 in O(1)" },
        ],
      },
    ],
    keyPoints: [
      "Build: O(n) time and space; query: O(1).",
      "Using a leading zero, sum(a[i..j]) = p[j+1] - p[i].",
      "2D: sum of a rectangle uses four lookups with inclusion-exclusion.",
      "Rotate an array in place in O(n) with three reversals.",
    ],
    terms: [
      { term: "Prefix sum", meaning: "p[k] is the sum of the first k elements." },
      { term: "Range query", meaning: "Asking for an aggregate over a contiguous slice." },
      { term: "Inclusion-exclusion", meaning: "Add and subtract overlapping areas to avoid double counting." },
      { term: "In-place", meaning: "Rearranging inside the same array without a copy." },
    ],
    example: {
      lang: "python",
      code: "from itertools import accumulate\n\na = [3, 1, 4, 1, 5]\np = [0, *accumulate(a)]           # O(n)\n\ndef range_sum(i, j):              # inclusive, O(1)\n    return p[j + 1] - p[i]\n\ndef rotate_right(xs, k):          # in place, O(n)\n    k %= len(xs)\n    xs.reverse()\n    xs[:k] = reversed(xs[:k]); xs[k:] = reversed(xs[k:])\n\nprint(range_sum(1, 3))  # 6",
    },
    pitfalls: [
      "Off-by-one errors from mixing inclusive and exclusive indexes.",
      "Using prefix sums when the array is updated often; use a Fenwick tree instead.",
    ],
    check: [
      { q: "With p having a leading zero, what is sum(a[2..4])?", a: "p[5] - p[2]." },
      { q: "When do prefix sums stop being a good choice?", a: "When values change frequently, since each update costs O(n) to rebuild." },
    ],
  },

  // ───────────── Linked lists, stacks, queues & deques ─────────────
  "dsa-linear-structures/singly-linked-lists": {
    summary:
      "A singly linked list is a chain of nodes where each node holds a value and a pointer to the next node. Inserting or removing at the head is O(1), but reaching index i takes O(i) steps. Most linked list problems are careful pointer rewiring, made simpler with a dummy head node.",
    analogy: "A treasure hunt where each clue tells you only where the next clue is.",
    visuals: [
      {
        type: "flow",
        title: "Reversing a list in place",
        steps: [
          { label: "Start", detail: "prev = None, cur = head" },
          { label: "Save next", detail: "nxt = cur.next" },
          { label: "Flip pointer", detail: "cur.next = prev" },
          { label: "Advance", detail: "prev = cur, cur = nxt" },
          { label: "Finish", detail: "When cur is None, prev is the new head." },
        ],
      },
    ],
    keyPoints: [
      "Insert or delete at head: O(1); at tail: O(1) only if you keep a tail pointer.",
      "Access or search by position: O(n).",
      "Reversal is O(n) time and O(1) space iteratively.",
      "A dummy node removes special cases when the head might change.",
    ],
    terms: [
      { term: "Node", meaning: "Object holding a value and a next pointer." },
      { term: "Head", meaning: "First node of the list." },
      { term: "Dummy node", meaning: "Placeholder before the head to simplify edge cases." },
      { term: "Traversal", meaning: "Following next pointers from head to the end." },
    ],
    example: {
      lang: "python",
      code: "class Node:\n    def __init__(self, val, next=None):\n        self.val, self.next = val, next\n\ndef reverse(head):                # O(n) time, O(1) space\n    prev, cur = None, head\n    while cur:\n        cur.next, prev, cur = prev, cur, cur.next\n    return prev\n\nhead = reverse(Node(1, Node(2, Node(3))))\nwhile head:\n    print(head.val, end=' '); head = head.next   # 3 2 1",
    },
    pitfalls: [
      "Losing the rest of the list by overwriting next before saving it.",
      "Forgetting to handle empty and single-node lists.",
    ],
    check: [
      { q: "What is the cost of getting the k-th element?", a: "O(k), you must follow k next pointers." },
      { q: "Why use a dummy head when merging two sorted lists?", a: "It gives a fixed starting node so you never special-case the first insertion." },
    ],
  },

  "dsa-linear-structures/doubly-circular-lists": {
    summary:
      "A doubly linked list gives each node both next and prev pointers, so a node can be removed in O(1) when you already hold a reference to it. Circular lists link the tail back to the head. Fast and slow pointer techniques find midpoints and detect cycles without extra memory.",
    visuals: [
      {
        type: "cycle",
        title: "Floyd's cycle detection",
        steps: [
          { label: "Start", detail: "slow and fast at head." },
          { label: "Move", detail: "slow 1 step, fast 2 steps." },
          { label: "Compare", detail: "Meet means a cycle exists." },
          { label: "Repeat", detail: "fast reaching None means no cycle." },
        ],
      },
    ],
    keyPoints: [
      "Remove a known node in a doubly linked list: O(1).",
      "Sentinel head and tail nodes remove all null checks.",
      "Floyd's algorithm detects a cycle in O(n) time and O(1) space.",
      "An LRU cache combines a hash map with a doubly linked list for O(1) get and put.",
    ],
    terms: [
      { term: "prev pointer", meaning: "Link to the previous node." },
      { term: "Sentinel", meaning: "Permanent dummy node marking a boundary." },
      { term: "Circular list", meaning: "Tail points back to the head." },
      { term: "Fast and slow pointers", meaning: "Two walkers at different speeds through the list." },
    ],
    example: {
      lang: "python",
      code: "def has_cycle(head):              # O(n) time, O(1) space\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n\ndef middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n    return slow",
    },
    pitfalls: [
      "Updating only one of the two pointers when unlinking a node.",
      "Checking fast.next.next without first checking fast.next.",
    ],
    check: [
      { q: "Why does an LRU cache use a doubly linked list?", a: "To move or remove any node in O(1) given a reference from the hash map." },
      { q: "When fast reaches the end, where is slow?", a: "At the middle of the list." },
    ],
  },

  "dsa-linear-structures/stacks": {
    summary:
      "A stack is last-in, first-out: you push onto the top and pop from the top. It models nested structure, such as brackets, function calls and undo history. Any recursive algorithm can be rewritten with an explicit stack.",
    analogy: "A stack of plates: you always take the one you put down last.",
    visuals: [
      {
        type: "flow",
        title: "Validating brackets '([])'",
        steps: [
          { label: "'('", detail: "Push. Stack: (" },
          { label: "'['", detail: "Push. Stack: ( [" },
          { label: "']'", detail: "Top is [, pop. Stack: (" },
          { label: "')'", detail: "Top is (, pop. Stack empty." },
          { label: "End", detail: "Empty stack means valid." },
        ],
      },
    ],
    keyPoints: [
      "push, pop and peek: O(1) with a Python list using append and pop.",
      "Bracket matching is O(n) time and O(n) space.",
      "Postfix expressions evaluate with one stack in a single pass.",
      "The call stack is a stack; deep recursion can overflow it.",
    ],
    terms: [
      { term: "LIFO", meaning: "Last in, first out." },
      { term: "Push / pop", meaning: "Add to or remove from the top." },
      { term: "Peek", meaning: "Read the top without removing it." },
      { term: "Postfix", meaning: "Operators follow operands, such as 3 4 +." },
    ],
    example: {
      lang: "python",
      code: "def is_valid(s):                  # O(n)\n    pairs = {')': '(', ']': '[', '}': '{'}\n    stack = []\n    for ch in s:\n        if ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n        else:\n            stack.append(ch)\n    return not stack\n\nprint(is_valid('([]{})'), is_valid('(]'))  # True False",
    },
    pitfalls: [
      "Popping from an empty stack instead of returning invalid.",
      "Forgetting to check the stack is empty at the end.",
    ],
    check: [
      { q: "Which end of a Python list should be the stack top?", a: "The end, so append and pop are O(1)." },
      { q: "Evaluate the postfix expression 2 3 4 * +.", a: "2 + (3 x 4) = 14." },
    ],
  },

  "dsa-linear-structures/queues-deques": {
    summary:
      "A queue is first-in, first-out: enqueue at the back, dequeue at the front. A circular buffer implements it on a fixed array by wrapping indexes with modulo. A deque allows O(1) pushes and pops at both ends, which powers BFS and sliding window maximum.",
    visuals: [
      {
        type: "compare",
        title: "Queue implementations in Python",
        columns: [
          { title: "list with pop(0)", points: ["Dequeue is O(n)", "Shifts every element", "Avoid for queues"] },
          { title: "collections.deque", points: ["append and popleft O(1)", "Both ends supported", "Default choice"] },
          { title: "Ring buffer", points: ["Fixed capacity array", "head and tail wrap with modulo", "Used in OS and networking"] },
        ],
      },
    ],
    keyPoints: [
      "Enqueue and dequeue: O(1) with deque or a ring buffer.",
      "Ring buffer index: (head + count) % capacity.",
      "Sliding window maximum runs in O(n) with a monotonic deque of indexes.",
      "queue.Queue adds thread-safety; it is not needed for algorithms.",
    ],
    terms: [
      { term: "FIFO", meaning: "First in, first out." },
      { term: "Deque", meaning: "Double-ended queue." },
      { term: "Ring buffer", meaning: "Fixed array used circularly as a queue." },
      { term: "Front / back", meaning: "Where items leave and where they join." },
    ],
    example: {
      lang: "python",
      code: "from collections import deque\n\ndef window_max(nums, k):          # O(n)\n    dq, out = deque(), []         # dq holds indexes, values decreasing\n    for i, x in enumerate(nums):\n        while dq and nums[dq[-1]] <= x:\n            dq.pop()\n        dq.append(i)\n        if dq[0] <= i - k:\n            dq.popleft()\n        if i >= k - 1:\n            out.append(nums[dq[0]])\n    return out\n\nprint(window_max([1, 3, -1, -3, 5, 3], 3))  # [3, 3, 5, 5]",
    },
    pitfalls: [
      "Using list.pop(0) in BFS, turning O(V + E) into something much slower.",
      "Not distinguishing full and empty states in a ring buffer.",
    ],
    check: [
      { q: "What is the cost of popleft on a deque?", a: "O(1)." },
      { q: "Why store indexes rather than values in the window deque?", a: "So you can tell when the front element has slid out of the window." },
    ],
  },

  "dsa-linear-structures/monotonic-stack": {
    summary:
      "A monotonic stack keeps its elements in increasing or decreasing order by popping anything that would break the order before pushing. Each element is pushed and popped at most once, so the whole scan is O(n). It answers next-greater, previous-smaller and histogram questions that look quadratic.",
    visuals: [
      {
        type: "cycle",
        title: "Loop invariant per element",
        steps: [
          { label: "Read x", detail: "Next array value." },
          { label: "Pop smaller", detail: "Each popped item has found its next greater: x." },
          { label: "Push x", detail: "Stack stays decreasing." },
          { label: "Advance", detail: "Leftovers have no next greater." },
        ],
      },
    ],
    keyPoints: [
      "Total time O(n): every index is pushed once and popped at most once.",
      "Decreasing stack finds next greater; increasing stack finds next smaller.",
      "Store indexes so you can compute distances such as days until warmer.",
      "Largest rectangle in a histogram is O(n) with an increasing stack.",
    ],
    terms: [
      { term: "Monotonic", meaning: "Entirely non-increasing or non-decreasing." },
      { term: "Next greater element", meaning: "First later value larger than the current one." },
      { term: "Amortised", meaning: "Some steps pop many items, but the total is linear." },
    ],
    example: {
      lang: "python",
      code: "def daily_temperatures(t):        # O(n)\n    ans = [0] * len(t)\n    stack = []                    # indexes, temperatures decreasing\n    for i, temp in enumerate(t):\n        while stack and t[stack[-1]] < temp:\n            j = stack.pop()\n            ans[j] = i - j\n        stack.append(i)\n    return ans\n\nprint(daily_temperatures([73, 74, 75, 71, 69, 72, 76]))\n# [1, 1, 4, 2, 1, 1, 0]",
    },
    pitfalls: [
      "Using < versus <= inconsistently, which mishandles equal values.",
      "Calling the nested while loop O(n^2) and abandoning a correct solution.",
    ],
    check: [
      { q: "Why is a monotonic stack scan O(n) despite a nested loop?", a: "Each element is popped at most once, so total pops are at most n." },
      { q: "Which order do you keep to find the next smaller element?", a: "An increasing stack." },
    ],
  },

  // ───────────── Hashing ─────────────
  "dsa-hashing/hash-functions": {
    summary:
      "A hash function turns a key into an integer that is then reduced to a bucket index. A good one is deterministic, fast and spreads keys uniformly so few keys share a bucket. Keys must not change after insertion, otherwise their hash changes and they can no longer be found.",
    visuals: [
      {
        type: "flow",
        title: "From key to bucket",
        steps: [
          { label: "Key", detail: "'cat'" },
          { label: "Hash", detail: "hash('cat') gives a large integer." },
          { label: "Reduce", detail: "index = h % capacity" },
          { label: "Bucket", detail: "Store or look up the entry there." },
        ],
      },
    ],
    keyPoints: [
      "Computing a hash is O(length of key), treated as O(1) for small keys.",
      "Equal keys must produce equal hashes; unequal keys may collide.",
      "Polynomial rolling hashes update in O(1) as a window slides, enabling Rabin-Karp.",
      "Python randomises string hashes per process to resist collision attacks.",
    ],
    terms: [
      { term: "Hash function", meaning: "Maps a key to an integer." },
      { term: "Collision", meaning: "Two different keys map to the same bucket." },
      { term: "Uniformity", meaning: "Keys spread evenly across buckets." },
      { term: "Rolling hash", meaning: "Hash updated incrementally as a window moves." },
    ],
    example: {
      lang: "python",
      code: "def poly_hash(s, base=31, mod=10**9 + 7):\n    h = 0\n    for ch in s:\n        h = (h * base + ord(ch)) % mod\n    return h\n\nprint(poly_hash('abc'), poly_hash('acb'))   # different values\nprint(hash((1, 2)) == hash((1, 2)))         # True\n# hash([1, 2]) raises TypeError: lists are mutable",
    },
    pitfalls: [
      "Defining __eq__ on a class without a matching __hash__.",
      "Assuming equal rolling hashes prove equal strings without verifying.",
    ],
    check: [
      { q: "Why can't a list be a dict key?", a: "It is mutable, so its hash could change after insertion and the key would be lost." },
      { q: "What property must hold between equality and hashing?", a: "If a == b then hash(a) == hash(b)." },
    ],
  },

  "dsa-hashing/hash-tables": {
    summary:
      "A hash table stores key-value pairs in an array of buckets chosen by the key's hash. Collisions are handled either by chaining, where each bucket holds a small list, or by open addressing, where you probe for the next free slot. Keeping the load factor low through resizing keeps operations O(1) on average.",
    visuals: [
      {
        type: "compare",
        title: "Collision strategies",
        columns: [
          { title: "Separate chaining", points: ["Bucket holds a list of entries", "Simple deletes", "Extra pointers per entry", "Degrades gracefully when full"] },
          { title: "Open addressing", points: ["All entries in one array", "Probe linear, quadratic or double hash", "Deletes need tombstones", "Cache friendly; used by Python dict"] },
        ],
      },
    ],
    keyPoints: [
      "Insert, lookup and delete: O(1) average, O(n) worst case if all keys collide.",
      "Load factor = entries / buckets; resize when it passes about 0.7.",
      "Resizing rehashes every key, O(n), but is amortised O(1) per insert.",
      "Linear probing suffers from clustering as the table fills.",
    ],
    terms: [
      { term: "Bucket", meaning: "One slot of the underlying array." },
      { term: "Load factor", meaning: "Ratio of stored entries to buckets." },
      { term: "Probing", meaning: "Searching other slots after a collision." },
      { term: "Tombstone", meaning: "Marker left by a delete so probe chains are not broken." },
      { term: "Rehash", meaning: "Reinsert every key into a larger table." },
    ],
    example: {
      lang: "python",
      code: "class ChainedMap:\n    def __init__(self, cap=8):\n        self.buckets = [[] for _ in range(cap)]\n        self.n = 0\n\n    def put(self, key, val):\n        b = self.buckets[hash(key) % len(self.buckets)]\n        for pair in b:\n            if pair[0] == key:\n                pair[1] = val; return\n        b.append([key, val]); self.n += 1\n\n    def get(self, key):\n        b = self.buckets[hash(key) % len(self.buckets)]\n        return next((v for k, v in b if k == key), None)",
      caption: "Add a resize step when n / len(buckets) exceeds 0.75.",
    },
    pitfalls: [
      "Deleting from an open-addressing table by emptying the slot, which breaks later lookups.",
      "Never resizing, so chains grow and operations become O(n).",
    ],
    check: [
      { q: "What is the worst-case lookup cost and when does it happen?", a: "O(n), when many keys collide into the same bucket." },
      { q: "Why are tombstones needed in open addressing?", a: "An empty slot stops a probe sequence, so deleted slots must be marked to keep later keys reachable." },
    ],
  },

  "dsa-hashing/hashing-patterns": {
    summary:
      "Many brute-force solutions compare every pair or rescan the input repeatedly. A hash map remembers what you have already seen, so each new element can be checked in O(1). Two-sum, grouping, frequency counting and prefix-sum counting all follow this idea.",
    visuals: [
      {
        type: "flow",
        title: "Two-sum in one pass",
        steps: [
          { label: "Read x at index i", detail: "Target t." },
          { label: "Compute need", detail: "need = t - x" },
          { label: "Seen need?", detail: "Return its index and i." },
          { label: "Remember x", detail: "seen[x] = i, then continue." },
        ],
      },
    ],
    keyPoints: [
      "Two-sum drops from O(n^2) to O(n) time at the cost of O(n) space.",
      "Group anagrams by a canonical key such as the sorted string.",
      "Count subarrays summing to k by storing counts of prefix sums.",
      "Use a set when you only need membership, a dict when you need a value.",
    ],
    terms: [
      { term: "Complement", meaning: "The value that pairs with the current one to hit a target." },
      { term: "Canonical key", meaning: "A normalised form shared by all equivalent items." },
      { term: "Frequency map", meaning: "Dict from item to how often it appears." },
    ],
    example: {
      lang: "python",
      code: "def two_sum(nums, target):        # O(n) time, O(n) space\n    seen = {}\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return seen[target - x], i\n        seen[x] = i\n\ndef subarrays_sum_k(nums, k):     # O(n)\n    counts, total, ans = {0: 1}, 0, 0\n    for x in nums:\n        total += x\n        ans += counts.get(total - k, 0)\n        counts[total] = counts.get(total, 0) + 1\n    return ans",
    },
    pitfalls: [
      "Inserting x before checking, which pairs an element with itself.",
      "Forgetting the initial {0: 1} entry when counting prefix sums.",
    ],
    check: [
      { q: "What trade-off does the hash map make in two-sum?", a: "It uses O(n) extra memory to cut time from O(n^2) to O(n)." },
      { q: "What key groups anagrams together?", a: "The sorted characters, or a tuple of 26 letter counts." },
    ],
  },

  // ───────────── Recursion, sorting & searching ─────────────
  "dsa-recursion-sorting/recursion": {
    summary:
      "A recursive function solves a problem by calling itself on a smaller version until it reaches a base case it can answer directly. Each call gets its own frame on the call stack, which unwinds as calls return. Drawing the recursion tree shows both the result and the cost.",
    analogy: "Russian nesting dolls: open each doll until you reach the solid one, then close them back up.",
    visuals: [
      {
        type: "tree",
        title: "Recursion tree of fib(4)",
        root: "fib(4)",
        children: [
          { label: "fib(3)", children: ["fib(2)", "fib(1)"] },
          { label: "fib(2)", children: ["fib(1)", "fib(0)"] },
        ],
      },
    ],
    keyPoints: [
      "Every recursion needs a base case and progress towards it.",
      "Naive fib is O(2^n) because subproblems repeat; memoisation makes it O(n).",
      "Stack space is O(maximum depth).",
      "Python's default recursion limit is about 1000 frames.",
    ],
    terms: [
      { term: "Base case", meaning: "Input answered without further recursion." },
      { term: "Call stack", meaning: "Stack of active function frames." },
      { term: "Stack frame", meaning: "Memory for one call's locals and return point." },
      { term: "Tail call", meaning: "A recursive call that is the last action; Python does not optimise it." },
    ],
    example: {
      lang: "python",
      code: "def factorial(n):                 # O(n) time, O(n) stack\n    if n <= 1:                    # base case\n        return 1\n    return n * factorial(n - 1)   # smaller subproblem\n\ndef sum_digits(n):\n    return n if n < 10 else n % 10 + sum_digits(n // 10)\n\nprint(factorial(5), sum_digits(1234))  # 120 10",
    },
    pitfalls: [
      "Missing or unreachable base cases, causing RecursionError.",
      "Recursing on inputs that do not get smaller.",
    ],
    check: [
      { q: "What is the space complexity of factorial(n) recursively?", a: "O(n), one stack frame per call." },
      { q: "Why is naive recursive Fibonacci exponential?", a: "It recomputes the same subproblems many times, roughly doubling calls per level." },
    ],
  },

  "dsa-recursion-sorting/divide-and-conquer": {
    summary:
      "Divide and conquer splits a problem into independent subproblems, solves each recursively and combines the results. Merge sort, quicksort, binary search and fast multiplication all follow this pattern. The cost is captured by a recurrence like T(n) = 2T(n/2) + O(n).",
    visuals: [
      {
        type: "flow",
        title: "The three steps",
        steps: [
          { label: "Divide", detail: "Split input, often in half." },
          { label: "Conquer", detail: "Solve each part recursively." },
          { label: "Combine", detail: "Merge partial answers." },
          { label: "Base case", detail: "Tiny inputs solved directly." },
        ],
      },
    ],
    keyPoints: [
      "Two halves plus linear combine gives O(n log n).",
      "One half plus constant work gives O(log n), as in binary search.",
      "Counting inversions piggybacks on merge sort in O(n log n).",
      "Subproblems must be independent; overlapping ones call for DP instead.",
    ],
    terms: [
      { term: "Subproblem", meaning: "Smaller instance of the same problem." },
      { term: "Combine step", meaning: "Work to build the answer from sub-answers." },
      { term: "Inversion", meaning: "Pair i < j with a[i] > a[j]." },
    ],
    example: {
      lang: "python",
      code: "def max_subarray(a, lo, hi):      # O(n log n)\n    if lo == hi:\n        return a[lo]\n    mid = (lo + hi) // 2\n    best_left = best_right = float('-inf')\n    s = 0\n    for i in range(mid, lo - 1, -1):\n        s += a[i]; best_left = max(best_left, s)\n    s = 0\n    for i in range(mid + 1, hi + 1):\n        s += a[i]; best_right = max(best_right, s)\n    return max(max_subarray(a, lo, mid), max_subarray(a, mid + 1, hi),\n               best_left + best_right)\n\nprint(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4], 0, 8))  # 6",
      caption: "Kadane's algorithm solves this in O(n), but the structure shows the pattern.",
    },
    check: [
      { q: "What recurrence describes merge sort?", a: "T(n) = 2T(n/2) + O(n), which is O(n log n)." },
      { q: "When is divide and conquer the wrong tool?", a: "When subproblems overlap heavily; dynamic programming avoids recomputing them." },
    ],
  },

  "dsa-recursion-sorting/elementary-sorts": {
    summary:
      "Bubble, selection and insertion sort are simple O(n^2) algorithms that sort in place. They are rarely used on large data, but insertion sort is very fast on small or nearly sorted arrays and is used inside hybrid sorts like Timsort. They also introduce stability and in-place sorting.",
    visuals: [
      {
        type: "compare",
        title: "Quadratic sorts",
        columns: [
          { title: "Bubble", points: ["Swap adjacent out-of-order pairs", "O(n^2), O(n) if no swaps", "Stable", "Teaching only"] },
          { title: "Selection", points: ["Pick the minimum each pass", "Always O(n^2)", "Not stable", "At most n swaps"] },
          { title: "Insertion", points: ["Insert each item into sorted prefix", "O(n^2), O(n) nearly sorted", "Stable", "Best for small n"] },
        ],
      },
    ],
    keyPoints: [
      "All three use O(1) extra space.",
      "Insertion sort's cost is O(n + inversions).",
      "Stable sorts keep equal keys in their original order.",
      "Timsort uses insertion sort on short runs.",
    ],
    terms: [
      { term: "Stable", meaning: "Equal elements keep their relative order." },
      { term: "In-place", meaning: "Sorts with O(1) extra memory." },
      { term: "Pass", meaning: "One sweep over the array." },
    ],
    example: {
      lang: "python",
      code: "def insertion_sort(a):            # O(n^2) worst, O(n) nearly sorted\n    for i in range(1, len(a)):\n        key, j = a[i], i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]\n            j -= 1\n        a[j + 1] = key\n    return a\n\nprint(insertion_sort([5, 2, 4, 6, 1, 3]))",
    },
    pitfalls: [
      "Using > versus >= carelessly, which breaks stability.",
      "Choosing a quadratic sort for large inputs.",
    ],
    check: [
      { q: "Which elementary sort is O(n) on already sorted input?", a: "Insertion sort, and bubble sort with an early-exit check." },
      { q: "Is selection sort stable?", a: "No, long-distance swaps can reorder equal elements." },
    ],
  },

  "dsa-recursion-sorting/merge-sort": {
    summary:
      "Merge sort splits the array in half, sorts each half recursively and merges the two sorted halves in linear time. It always runs in O(n log n) and is stable, but the standard version needs O(n) extra memory. It is the go-to choice for linked lists and external sorting.",
    visuals: [
      {
        type: "tree",
        title: "Splitting [5, 2, 4, 1]",
        root: "[5, 2, 4, 1]",
        children: [
          { label: "[5, 2] merges to [2, 5]", children: ["[5]", "[2]"] },
          { label: "[4, 1] merges to [1, 4]", children: ["[4]", "[1]"] },
          { label: "Final merge", children: ["[1, 2, 4, 5]"] },
        ],
      },
    ],
    keyPoints: [
      "Time: O(n log n) best, average and worst.",
      "Space: O(n) auxiliary for arrays; O(log n) stack.",
      "Stable when the merge takes from the left half on ties.",
      "Merging k sorted lists generalises the merge step with a heap.",
    ],
    terms: [
      { term: "Merge", meaning: "Combine two sorted lists into one sorted list." },
      { term: "Bottom-up merge sort", meaning: "Iteratively merge runs of size 1, 2, 4 and so on." },
      { term: "External sort", meaning: "Sorting data too large for memory." },
    ],
    example: {
      lang: "python",
      code: "def merge_sort(a):                # O(n log n) time, O(n) space\n    if len(a) <= 1:\n        return a\n    mid = len(a) // 2\n    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])\n    out, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:   # <= keeps it stable\n            out.append(left[i]); i += 1\n        else:\n            out.append(right[j]); j += 1\n    return out + left[i:] + right[j:]\n\nprint(merge_sort([5, 2, 4, 6, 1, 3]))",
    },
    pitfalls: [
      "Using < instead of <= in the merge, losing stability.",
      "Forgetting to append the leftover tail of one half.",
    ],
    check: [
      { q: "What is merge sort's worst-case time?", a: "O(n log n)." },
      { q: "Why is merge sort good for linked lists?", a: "Merging lists needs no extra array and no random access." },
    ],
  },

  "dsa-recursion-sorting/quicksort": {
    summary:
      "Quicksort picks a pivot, partitions the array into elements smaller and larger than it, then recursively sorts each side. It sorts in place and is very fast in practice, averaging O(n log n). A poor pivot on sorted input gives O(n^2), so pivots are chosen randomly or by median-of-three.",
    visuals: [
      {
        type: "flow",
        title: "Lomuto partition",
        steps: [
          { label: "Pick pivot", detail: "Here the last element." },
          { label: "Scan", detail: "j moves left to right." },
          { label: "Swap small", detail: "If a[j] < pivot, swap into the left region." },
          { label: "Place pivot", detail: "Swap pivot after the left region." },
          { label: "Recurse", detail: "Sort both sides of the pivot." },
        ],
      },
    ],
    keyPoints: [
      "Average O(n log n), worst O(n^2), O(log n) stack on average.",
      "Not stable in its usual in-place form.",
      "Random pivots make the worst case extremely unlikely.",
      "Quickselect finds the k-th smallest in O(n) average by recursing into one side.",
    ],
    terms: [
      { term: "Pivot", meaning: "Element used to split the array." },
      { term: "Partition", meaning: "Rearrange so smaller items precede the pivot and larger follow." },
      { term: "Hoare scheme", meaning: "Two-pointer partition with fewer swaps than Lomuto." },
      { term: "Quickselect", meaning: "Partition-based selection of the k-th element." },
    ],
    example: {
      lang: "python",
      code: "import random\n\ndef quicksort(a, lo=0, hi=None):  # average O(n log n)\n    if hi is None: hi = len(a) - 1\n    if lo >= hi: return a\n    p = random.randint(lo, hi)\n    a[p], a[hi] = a[hi], a[p]\n    i = lo\n    for j in range(lo, hi):\n        if a[j] < a[hi]:\n            a[i], a[j] = a[j], a[i]; i += 1\n    a[i], a[hi] = a[hi], a[i]\n    quicksort(a, lo, i - 1); quicksort(a, i + 1, hi)\n    return a",
    },
    pitfalls: [
      "Always using the first or last element as pivot on sorted input.",
      "Many duplicates degrade Lomuto; use three-way partitioning.",
    ],
    check: [
      { q: "When does quicksort hit O(n^2)?", a: "When pivots are consistently the smallest or largest element, as with a fixed pivot on sorted input." },
      { q: "What is the average time of quickselect?", a: "O(n), since it recurses into only one side." },
    ],
  },

  "dsa-recursion-sorting/counting-radix-sort": {
    summary:
      "Comparison sorts cannot beat O(n log n), but sorts that use the values themselves can. Counting sort tallies each value in a range of size k for O(n + k) time, and radix sort applies a stable counting sort digit by digit. In everyday Python you use sorted with a key function, which runs Timsort.",
    visuals: [
      {
        type: "compare",
        title: "Non-comparison sorts versus built-in sort",
        columns: [
          { title: "Counting sort", points: ["O(n + k)", "Small integer range k", "Stable variant uses prefix sums"] },
          { title: "Radix sort (LSD)", points: ["O(d x (n + b))", "d digits in base b", "Needs a stable inner sort"] },
          { title: "sorted() / Timsort", points: ["O(n log n), O(n) on runs", "Stable", "key= and reverse= options"] },
        ],
      },
    ],
    keyPoints: [
      "Comparison sorting needs Omega(n log n) comparisons in the worst case.",
      "Counting sort is impractical when the value range k is much larger than n.",
      "Python's sort is stable, so you can sort by secondary key first, then primary.",
      "key functions are called once per element, cheaper than custom comparisons.",
    ],
    terms: [
      { term: "Counting sort", meaning: "Sorts by counting occurrences of each value." },
      { term: "Radix sort", meaning: "Sorts digit by digit using a stable sort." },
      { term: "Timsort", meaning: "Hybrid merge and insertion sort used by Python." },
      { term: "Key function", meaning: "Maps each item to the value it is sorted by." },
    ],
    example: {
      lang: "python",
      code: "def counting_sort(a, max_val):    # O(n + k)\n    counts = [0] * (max_val + 1)\n    for x in a:\n        counts[x] += 1\n    out = []\n    for v, c in enumerate(counts):\n        out.extend([v] * c)\n    return out\n\nprint(counting_sort([3, 1, 4, 1, 5], 5))   # [1, 1, 3, 4, 5]\npeople = [('ana', 31), ('bo', 25), ('cy', 31)]\nprint(sorted(people, key=lambda p: (-p[1], p[0])))",
    },
    check: [
      { q: "Why can counting sort beat O(n log n)?", a: "It never compares elements; it indexes by value, so the lower bound does not apply." },
      { q: "Why must radix sort's inner sort be stable?", a: "So the order from earlier, less significant digits is preserved." },
    ],
  },

  "dsa-recursion-sorting/binary-search": {
    summary:
      "Binary search finds a target in a sorted array by repeatedly halving the search range, in O(log n) time. The same idea works on any monotonic yes-or-no condition, such as the smallest speed that finishes a job in time. Clear invariants about what lo and hi mean prevent off-by-one bugs.",
    visuals: [
      {
        type: "cycle",
        title: "Invariant loop: first index with a[i] >= target",
        steps: [
          { label: "Range [lo, hi)", detail: "Answer lies in this half-open range." },
          { label: "mid", detail: "mid = (lo + hi) // 2" },
          { label: "Test", detail: "a[mid] >= target means hi = mid." },
          { label: "Else", detail: "lo = mid + 1" },
          { label: "Stop", detail: "lo == hi is the answer." },
        ],
      },
    ],
    keyPoints: [
      "O(log n) time and O(1) space iteratively.",
      "Search on the answer: binary search over values when feasibility is monotonic.",
      "bisect_left and bisect_right give first and one-past-last positions.",
      "Rotated sorted arrays: one half is always sorted, so check which.",
    ],
    terms: [
      { term: "Invariant", meaning: "A condition true at every loop iteration." },
      { term: "Half-open range", meaning: "[lo, hi) includes lo but not hi." },
      { term: "Monotonic predicate", meaning: "False then true (or vice versa) with one switch point." },
      { term: "Lower bound", meaning: "First position where target could be inserted." },
    ],
    example: {
      lang: "python",
      code: "def lower_bound(a, target):       # O(log n)\n    lo, hi = 0, len(a)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] >= target: hi = mid\n        else: lo = mid + 1\n    return lo\n\ndef min_speed(piles, hours):      # search on the answer\n    lo, hi = 1, max(piles)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if sum(-(-p // mid) for p in piles) <= hours: hi = mid\n        else: lo = mid + 1\n    return lo",
    },
    pitfalls: [
      "Mixing closed and half-open conventions, causing infinite loops.",
      "Applying binary search to unsorted data or a non-monotonic condition.",
    ],
    check: [
      { q: "How many steps does binary search need for one million items?", a: "About 20, since log2(10^6) is about 20." },
      { q: "What must be true to binary search on an answer?", a: "Feasibility must be monotonic: once true, it stays true for larger values." },
    ],
  },

  // ───────────── Trees, heaps & tries ─────────────
  "dsa-trees/tree-traversals": {
    summary:
      "A binary tree is a hierarchy where each node has at most two children. Depth-first traversals visit nodes in pre-order, in-order or post-order, and breadth-first traversal visits level by level with a queue. Most tree problems are a traversal plus a little work at each node.",
    visuals: [
      {
        type: "tree",
        title: "Example tree and traversal orders",
        root: "1",
        children: [
          { label: "2", children: ["4", "5"] },
          { label: "3" },
          { label: "Pre-order: 1 2 4 5 3" },
          { label: "In-order: 4 2 5 1 3" },
          { label: "Post-order: 4 5 2 3 1" },
        ],
      },
    ],
    keyPoints: [
      "Every traversal is O(n) time.",
      "Space is O(h) for DFS, where h is height, and O(width) for BFS.",
      "Post-order fits problems where a node needs its children's answers first.",
      "Height and diameter are computed in one post-order pass.",
    ],
    terms: [
      { term: "Root / leaf", meaning: "Top node; node with no children." },
      { term: "Height", meaning: "Edges on the longest root-to-leaf path." },
      { term: "Pre / in / post-order", meaning: "Visit node before, between or after its children." },
      { term: "Level order", meaning: "Breadth-first, one depth at a time." },
    ],
    example: {
      lang: "python",
      code: "from collections import deque\n\nclass TreeNode:\n    def __init__(self, val, left=None, right=None):\n        self.val, self.left, self.right = val, left, right\n\ndef inorder(n):\n    return inorder(n.left) + [n.val] + inorder(n.right) if n else []\n\ndef levels(root):\n    out, q = [], deque([root] if root else [])\n    while q:\n        out.append([n.val for n in q])\n        q = deque(c for n in q for c in (n.left, n.right) if c)\n    return out",
    },
    pitfalls: [
      "Recursing on very deep, skewed trees and hitting the recursion limit.",
      "Confusing height in nodes with height in edges.",
    ],
    check: [
      { q: "Which traversal of a BST yields sorted order?", a: "In-order." },
      { q: "What data structure drives level-order traversal?", a: "A queue." },
    ],
  },

  "dsa-trees/bst": {
    summary:
      "A binary search tree keeps every left descendant smaller and every right descendant larger than the node. Search, insert and delete follow one root-to-leaf path, so they cost O(h). If keys arrive in sorted order the tree degenerates into a linked list and h becomes n.",
    visuals: [
      {
        type: "flow",
        title: "Deleting a node",
        steps: [
          { label: "Find node", detail: "Walk left or right by comparison." },
          { label: "No children", detail: "Remove it." },
          { label: "One child", detail: "Replace node with its child." },
          { label: "Two children", detail: "Copy in-order successor value." },
          { label: "Delete successor", detail: "It has at most one child." },
        ],
      },
    ],
    keyPoints: [
      "Search, insert and delete: O(h), which is O(log n) balanced and O(n) skewed.",
      "In-order traversal visits keys in sorted order.",
      "Validate a BST by passing down allowed min and max bounds.",
      "Successor is the leftmost node of the right subtree.",
    ],
    terms: [
      { term: "BST property", meaning: "Left subtree smaller, right subtree larger." },
      { term: "Successor", meaning: "Next larger key in sorted order." },
      { term: "Degenerate tree", meaning: "Every node has one child, like a linked list." },
    ],
    example: {
      lang: "python",
      code: "def insert(node, key):            # O(h)\n    if node is None:\n        return TreeNode(key)\n    if key < node.val:\n        node.left = insert(node.left, key)\n    elif key > node.val:\n        node.right = insert(node.right, key)\n    return node\n\ndef is_bst(node, lo=float('-inf'), hi=float('inf')):\n    if node is None:\n        return True\n    return (lo < node.val < hi and is_bst(node.left, lo, node.val)\n            and is_bst(node.right, node.val, hi))",
    },
    pitfalls: [
      "Validating by comparing only with direct children instead of full bounds.",
      "Assuming O(log n) without guaranteeing balance.",
    ],
    check: [
      { q: "What is the BST search cost for keys inserted in sorted order?", a: "O(n), since the tree becomes a chain." },
      { q: "Where is the in-order successor of a node with a right child?", a: "The leftmost node of its right subtree." },
    ],
  },

  "dsa-trees/balanced-trees": {
    summary:
      "Self-balancing trees restructure themselves with rotations after inserts and deletes so height stays O(log n). AVL trees keep subtree heights within one of each other, while red-black trees use colouring rules that allow a little more imbalance in exchange for fewer rotations. They back ordered maps in many standard libraries.",
    visuals: [
      {
        type: "compare",
        title: "AVL versus red-black",
        columns: [
          { title: "AVL", points: ["Balance factor in -1, 0, 1", "Height about 1.44 log n", "Faster lookups", "More rotations on updates"] },
          { title: "Red-black", points: ["Nodes coloured red or black", "Height at most 2 log(n+1)", "At most 2-3 rotations per insert or delete", "Used by Java TreeMap and C++ std::map"] },
        ],
      },
    ],
    keyPoints: [
      "Search, insert and delete: O(log n) worst case.",
      "A rotation is O(1) and preserves in-order order.",
      "AVL fixes four cases: LL, RR, LR and RL.",
      "Python has no built-in balanced BST; use sortedcontainers or bisect on lists.",
    ],
    terms: [
      { term: "Rotation", meaning: "Local pointer change that shifts height between subtrees." },
      { term: "Balance factor", meaning: "Height of left minus height of right subtree." },
      { term: "Red-black rules", meaning: "Root black, no red-red parent-child, equal black height on every path." },
      { term: "Black height", meaning: "Black nodes on any path from a node to a leaf." },
    ],
    example: {
      lang: "python",
      code: "def height(n):\n    return n.h if n else 0\n\ndef rotate_right(y):              # O(1)\n    x = y.left\n    y.left, x.right = x.right, y\n    y.h = 1 + max(height(y.left), height(y.right))\n    x.h = 1 + max(height(x.left), height(x.right))\n    return x                      # new subtree root\n\ndef balance(n):\n    return height(n.left) - height(n.right)",
      caption: "AVL insert calls rotations when balance(n) leaves the range -1 to 1.",
    },
    check: [
      { q: "Why do balanced trees matter?", a: "They guarantee O(log n) height, so operations never degrade to O(n)." },
      { q: "Which tree usually does fewer rotations on updates?", a: "Red-black trees." },
    ],
  },

  "dsa-trees/binary-heaps": {
    summary:
      "A binary heap is a complete binary tree stored in an array where every parent is no larger than its children (for a min-heap). The minimum is always at index 0. Push adds at the end and sifts up, pop moves the last item to the root and sifts down, each in O(log n).",
    visuals: [
      {
        type: "tree",
        title: "Min-heap [1, 3, 2, 7, 4, 5] as a tree",
        root: "1 (index 0)",
        children: [
          { label: "3 (index 1)", children: ["7 (index 3)", "4 (index 4)"] },
          { label: "2 (index 2)", children: ["5 (index 5)"] },
        ],
      },
    ],
    keyPoints: [
      "Children of i are 2i+1 and 2i+2; parent is (i-1)//2.",
      "Peek O(1); push and pop O(log n).",
      "Heapify an array bottom-up in O(n), not O(n log n).",
      "A heap is not sorted; only the root is guaranteed minimal.",
    ],
    terms: [
      { term: "Complete tree", meaning: "All levels full except the last, filled left to right." },
      { term: "Heap property", meaning: "Parent is less than or equal to its children (min-heap)." },
      { term: "Sift up / down", meaning: "Swap with parent or smaller child until order is restored." },
      { term: "Heapify", meaning: "Turn an arbitrary array into a heap." },
    ],
    example: {
      lang: "python",
      code: "def push(h, x):                   # O(log n)\n    h.append(x)\n    i = len(h) - 1\n    while i > 0 and h[(i - 1) // 2] > h[i]:\n        p = (i - 1) // 2\n        h[i], h[p] = h[p], h[i]; i = p\n\ndef pop(h):                       # O(log n), assumes h is non-empty\n    h[0], h[-1] = h[-1], h[0]\n    top, i = h.pop(), 0\n    while (c := 2 * i + 1) < len(h):\n        if c + 1 < len(h) and h[c + 1] < h[c]: c += 1\n        if h[i] <= h[c]: break\n        h[i], h[c] = h[c], h[i]; i = c\n    return top",
    },
    pitfalls: [
      "Assuming heap[1] is the second smallest.",
      "Sifting down towards the larger child in a min-heap.",
    ],
    check: [
      { q: "What is the parent index of index 6?", a: "(6 - 1) // 2 = 2." },
      { q: "Why is bottom-up heapify O(n)?", a: "Most nodes are near the bottom and sift down only a few levels, so the total work sums to linear." },
    ],
  },

  "dsa-trees/priority-queues": {
    summary:
      "A priority queue always hands out the highest-priority item next, and a heap is the standard implementation. In Python you use heapq on a plain list. Heaps power top-k queries, merging sorted streams, running medians, schedulers and Dijkstra's algorithm, and heap sort sorts in place in O(n log n).",
    visuals: [
      {
        type: "flow",
        title: "Top-k largest with a size-k min-heap",
        steps: [
          { label: "Push x", detail: "Add to the heap." },
          { label: "Too big?", detail: "If size exceeds k, pop the minimum." },
          { label: "Repeat", detail: "For every element." },
          { label: "Result", detail: "Heap holds the k largest." },
        ],
      },
    ],
    keyPoints: [
      "Top-k with a size-k heap: O(n log k) time, O(k) space.",
      "Merge k sorted lists: O(N log k) with one heap entry per list.",
      "Running median: max-heap of lower half, min-heap of upper half.",
      "Heap sort: O(n log n), in place, not stable.",
    ],
    terms: [
      { term: "Priority queue", meaning: "Abstract type: insert and remove the best item." },
      { term: "heapq", meaning: "Python module of min-heap functions on lists." },
      { term: "Tie-breaker", meaning: "Extra tuple field so equal priorities compare safely." },
      { term: "Heap sort", meaning: "Heapify, then repeatedly pop the extreme element." },
    ],
    example: {
      lang: "python",
      code: "import heapq\n\ndef top_k(nums, k):               # O(n log k)\n    h = []\n    for x in nums:\n        heapq.heappush(h, x)\n        if len(h) > k:\n            heapq.heappop(h)\n    return sorted(h, reverse=True)\n\ndef merge_sorted(lists):          # O(N log k)\n    return list(heapq.merge(*lists))\n\nprint(top_k([3, 1, 5, 12, 2, 11], 3))   # [12, 11, 5]\nprint(merge_sorted([[1, 4], [2, 5], [3]]))",
    },
    pitfalls: [
      "Pushing tuples whose second field is not comparable when priorities tie.",
      "Sorting the whole array when only the top k items are needed.",
    ],
    check: [
      { q: "Why use a min-heap to find the k largest?", a: "Its root is the smallest of the current top k, so it is the one to evict." },
      { q: "Is heap sort stable?", a: "No." },
    ],
  },

  "dsa-trees/tries": {
    summary:
      "A trie stores strings character by character along paths from the root, so words with a common prefix share nodes. Lookup and insert cost O(L) for a word of length L, independent of how many words are stored. Tries shine for prefix search, autocomplete and word games.",
    visuals: [
      {
        type: "tree",
        title: "Trie holding car, cat, cup (below root and shared c)",
        root: "c",
        children: [
          { label: "a", children: ["r (end): car", "t (end): cat"] },
          { label: "u", children: ["p (end): cup"] },
        ],
      },
    ],
    keyPoints: [
      "Insert, search and startsWith: O(L) time.",
      "Space can be large: up to one node per character inserted.",
      "An end-of-word flag distinguishes car from a prefix of cart.",
      "Hash sets answer exact lookups but not prefix queries efficiently.",
    ],
    terms: [
      { term: "Trie", meaning: "Prefix tree keyed by characters." },
      { term: "End marker", meaning: "Flag on the node where a word finishes." },
      { term: "Prefix query", meaning: "Does any stored word start with this string?" },
    ],
    example: {
      lang: "python",
      code: "class Trie:\n    def __init__(self): self.root = {}\n\n    def insert(self, word):       # O(L)\n        node = self.root\n        for ch in word:\n            node = node.setdefault(ch, {})\n        node['$'] = True\n\n    def _walk(self, s):\n        node = self.root\n        for ch in s:\n            if ch not in node: return None\n            node = node[ch]\n        return node",
      caption: "search(w) checks '$' in _walk(w); starts_with(p) checks _walk(p) is not None.",
    },
    pitfalls: [
      "Forgetting the end marker, so prefixes are reported as words.",
      "Using a trie for a handful of exact lookups where a set is simpler.",
    ],
    check: [
      { q: "What is the cost of searching a word of length L?", a: "O(L), regardless of how many words are stored." },
      { q: "What can a trie do that a hash set cannot do efficiently?", a: "Find all words with a given prefix." },
    ],
  },

  // ───────────── Graphs: representations & traversal ─────────────
  "dsa-graphs/graph-representations": {
    summary:
      "A graph is a set of vertices connected by edges, which may be directed, undirected or weighted. The representation you pick decides the cost of every later algorithm. Adjacency lists suit the sparse graphs common in practice, while adjacency matrices suit dense graphs and constant-time edge checks.",
    visuals: [
      {
        type: "compare",
        title: "Representations for V vertices and E edges",
        columns: [
          { title: "Adjacency list", points: ["Space O(V + E)", "Iterate neighbours in O(degree)", "Edge check O(degree)", "Default for sparse graphs"] },
          { title: "Adjacency matrix", points: ["Space O(V^2)", "Edge check O(1)", "Iterate neighbours O(V)", "Good for dense graphs"] },
          { title: "Edge list", points: ["Space O(E)", "Simple to sort by weight", "Used by Kruskal and Bellman-Ford"] },
        ],
      },
    ],
    keyPoints: [
      "Most traversal algorithms run in O(V + E) on adjacency lists.",
      "Undirected edges are stored in both directions.",
      "Grids are implicit graphs: neighbours are up, down, left and right.",
      "Sparse means E is close to V; dense means E is close to V^2.",
    ],
    terms: [
      { term: "Vertex / edge", meaning: "A node and a connection between two nodes." },
      { term: "Directed graph", meaning: "Edges have a direction from u to v." },
      { term: "Degree", meaning: "Number of edges touching a vertex." },
      { term: "Weighted graph", meaning: "Each edge carries a cost." },
    ],
    example: {
      lang: "python",
      code: "from collections import defaultdict\n\nedges = [(0, 1), (0, 2), (1, 2), (2, 3)]\nadj = defaultdict(list)\nfor u, v in edges:            # undirected: store both ways\n    adj[u].append(v)\n    adj[v].append(u)\n\nn = 4\nmatrix = [[0] * n for _ in range(n)]\nfor u, v in edges:\n    matrix[u][v] = matrix[v][u] = 1\n\nprint(dict(adj), matrix[2][3])",
    },
    pitfalls: [
      "Building a V x V matrix for a graph with a million vertices.",
      "Adding only one direction for undirected edges.",
    ],
    check: [
      { q: "What is the space cost of an adjacency list?", a: "O(V + E)." },
      { q: "When is an adjacency matrix the better choice?", a: "For dense graphs or when you need O(1) edge existence checks." },
    ],
  },

  "dsa-graphs/bfs": {
    summary:
      "Breadth-first search explores a graph in rings: first all neighbours of the start, then their neighbours, and so on. Because it visits vertices in order of distance, BFS finds shortest paths in unweighted graphs. It uses a queue and a visited set.",
    analogy: "Ripples spreading outward from a stone dropped in a pond.",
    visuals: [
      {
        type: "cycle",
        title: "BFS loop",
        steps: [
          { label: "Dequeue u", detail: "Take the oldest frontier vertex." },
          { label: "Scan neighbours", detail: "For each v adjacent to u." },
          { label: "Mark and record", detail: "If unseen: visited, dist[v] = dist[u] + 1." },
          { label: "Enqueue v", detail: "Add to the back of the queue." },
        ],
      },
    ],
    keyPoints: [
      "Time O(V + E), space O(V).",
      "Mark vertices visited when enqueued, not when dequeued, to avoid duplicates.",
      "Multi-source BFS starts with several vertices in the queue at distance 0.",
      "Store parents to reconstruct the actual path.",
    ],
    terms: [
      { term: "Frontier", meaning: "Vertices discovered but not yet expanded." },
      { term: "Visited set", meaning: "Vertices already discovered." },
      { term: "Unweighted shortest path", meaning: "Path with the fewest edges." },
      { term: "Multi-source BFS", meaning: "BFS starting from many vertices at once." },
    ],
    example: {
      lang: "python",
      code: "from collections import deque\n\ndef shortest_path_len(adj, start, goal):   # O(V + E)\n    dist = {start: 0}\n    q = deque([start])\n    while q:\n        u = q.popleft()\n        if u == goal:\n            return dist[u]\n        for v in adj[u]:\n            if v not in dist:\n                dist[v] = dist[u] + 1\n                q.append(v)\n    return -1",
    },
    pitfalls: [
      "Using BFS for shortest paths on weighted graphs.",
      "Marking visited on dequeue, which enqueues the same vertex many times.",
    ],
    check: [
      { q: "Why does BFS find shortest paths in unweighted graphs?", a: "It processes vertices in non-decreasing order of edge distance from the start." },
      { q: "What is BFS's time complexity?", a: "O(V + E)." },
    ],
  },

  "dsa-graphs/dfs": {
    summary:
      "Depth-first search follows one path as far as it can before backtracking. It is the basis for counting connected components, detecting cycles, flood fill and topological sorting. It can be written recursively or with an explicit stack.",
    visuals: [
      {
        type: "flow",
        title: "Counting islands in a grid",
        steps: [
          { label: "Scan cells", detail: "Row by row." },
          { label: "Find land", detail: "Unvisited '1' starts a new island." },
          { label: "DFS flood", detail: "Mark all connected land visited." },
          { label: "Count", detail: "Increment once per DFS start." },
        ],
      },
    ],
    keyPoints: [
      "Time O(V + E); grids are O(rows x cols).",
      "Directed cycle detection uses three states: unvisited, in progress, done.",
      "An edge to an in-progress vertex is a back edge, which means a cycle.",
      "Use an explicit stack for very deep graphs in Python.",
    ],
    terms: [
      { term: "Connected component", meaning: "Maximal set of mutually reachable vertices." },
      { term: "Back edge", meaning: "Edge to an ancestor on the current DFS path." },
      { term: "Flood fill", meaning: "Mark every cell connected to a start cell." },
      { term: "Three-colour marking", meaning: "White, grey, black states for cycle detection." },
    ],
    example: {
      lang: "python",
      code: "def num_islands(grid):            # O(rows * cols)\n    rows, cols = len(grid), len(grid[0])\n    def sink(r, c):\n        if 0 <= r < rows and 0 <= c < cols and grid[r][c] == '1':\n            grid[r][c] = '0'\n            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):\n                sink(r + dr, c + dc)\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                sink(r, c); count += 1\n    return count",
    },
    pitfalls: [
      "Using an undirected visited check for directed cycle detection.",
      "Recursion depth errors on large grids; raise the limit or go iterative.",
    ],
    check: [
      { q: "How does DFS detect a cycle in a directed graph?", a: "By finding an edge to a vertex that is still in progress on the current path." },
      { q: "How do you count connected components?", a: "Start a DFS from each unvisited vertex and count the starts." },
    ],
  },

  "dsa-graphs/topological-sort": {
    summary:
      "A topological order lists the vertices of a directed acyclic graph so every edge points forward. It answers questions like the order to take courses or build modules. Kahn's algorithm repeatedly removes vertices with no incoming edges; if some remain, the graph has a cycle.",
    visuals: [
      {
        type: "flow",
        title: "Kahn's algorithm",
        steps: [
          { label: "Count in-degrees", detail: "For every vertex." },
          { label: "Seed queue", detail: "All vertices with in-degree 0." },
          { label: "Pop and output", detail: "Append u to the order." },
          { label: "Decrement", detail: "Each neighbour's in-degree; enqueue at 0." },
          { label: "Check", detail: "Fewer than V output means a cycle." },
        ],
      },
    ],
    keyPoints: [
      "Time O(V + E), space O(V).",
      "Only DAGs have a topological order.",
      "Reverse DFS post-order is also a valid topological order.",
      "There may be many valid orders.",
    ],
    terms: [
      { term: "DAG", meaning: "Directed acyclic graph." },
      { term: "In-degree", meaning: "Number of incoming edges." },
      { term: "Topological order", meaning: "Linear order respecting all edge directions." },
    ],
    example: {
      lang: "python",
      code: "from collections import deque\n\ndef topo_order(n, edges):         # O(V + E)\n    adj = [[] for _ in range(n)]\n    indeg = [0] * n\n    for u, v in edges:\n        adj[u].append(v); indeg[v] += 1\n    q = deque(i for i in range(n) if indeg[i] == 0)\n    order = []\n    while q:\n        u = q.popleft(); order.append(u)\n        for v in adj[u]:\n            indeg[v] -= 1\n            if indeg[v] == 0: q.append(v)\n    return order if len(order) == n else []   # [] means a cycle",
    },
    pitfalls: [
      "Forgetting to detect cycles and returning a partial order.",
      "Reversing edge direction when modelling prerequisites.",
    ],
    check: [
      { q: "How does Kahn's algorithm reveal a cycle?", a: "Some vertices never reach in-degree 0, so the output has fewer than V vertices." },
      { q: "Does a topological order exist for an undirected graph?", a: "No, it is defined only for directed acyclic graphs." },
    ],
  },

  "dsa-graphs/union-find": {
    summary:
      "Union-find, or disjoint set union, tracks which elements belong to the same group as groups merge. find returns a group's representative and union merges two groups. With path compression and union by rank, each operation is nearly constant time.",
    visuals: [
      {
        type: "tree",
        title: "Path compression flattens the tree",
        root: "Root r",
        children: [
          { label: "Before: d to c to b to r", children: ["find(d) walks 3 links"] },
          { label: "After find(d)", children: ["b points to r", "c points to r", "d points to r"] },
        ],
      },
    ],
    keyPoints: [
      "With both optimisations, operations cost O(alpha(n)), effectively constant.",
      "union by rank or size attaches the smaller tree under the larger.",
      "Ideal for dynamic connectivity and Kruskal's MST.",
      "Adding an edge between two nodes already connected reveals a cycle.",
    ],
    terms: [
      { term: "Representative", meaning: "Root element identifying a set." },
      { term: "Path compression", meaning: "Point nodes directly at the root during find." },
      { term: "Union by rank", meaning: "Attach the shorter tree under the taller." },
      { term: "Inverse Ackermann", meaning: "alpha(n), at most 4 for any practical n." },
    ],
    example: {
      lang: "python",
      code: "class DSU:\n    def __init__(self, n):\n        self.parent, self.size = list(range(n)), [1] * n\n\n    def find(self, x):\n        while self.parent[x] != x:\n            self.parent[x] = self.parent[self.parent[x]]  # halving\n            x = self.parent[x]\n        return x\n\n    def union(self, a, b):\n        a, b = self.find(a), self.find(b)\n        if a == b: return False\n        if self.size[a] < self.size[b]: a, b = b, a\n        self.parent[b] = a; self.size[a] += self.size[b]; return True",
    },
    pitfalls: [
      "Comparing parent[a] with parent[b] instead of find(a) with find(b).",
      "Skipping union by size, letting trees become long chains.",
    ],
    check: [
      { q: "How can union-find detect a cycle in an undirected graph?", a: "If an edge joins two vertices whose find results are already equal." },
      { q: "What is the amortised cost of find with both optimisations?", a: "O(alpha(n)), effectively constant." },
    ],
  },

  // ───────────── Shortest paths & MST ─────────────
  "dsa-weighted-graphs/dijkstra": {
    summary:
      "Dijkstra's algorithm finds the shortest distance from a source to every vertex when all edge weights are non-negative. It always expands the closest unfinished vertex, taken from a min-heap, and relaxes its outgoing edges. It is the core of route planning and network routing protocols such as OSPF.",
    visuals: [
      {
        type: "cycle",
        title: "Dijkstra main loop",
        steps: [
          { label: "Pop closest", detail: "Smallest (dist, u) from the heap." },
          { label: "Skip stale", detail: "If dist is worse than best[u]." },
          { label: "Relax edges", detail: "best[u] + w < best[v]?" },
          { label: "Push update", detail: "Push (new dist, v)." },
        ],
      },
    ],
    keyPoints: [
      "Time O((V + E) log V) with a binary heap.",
      "Fails with negative edge weights because finalised distances could later improve.",
      "Lazy deletion: push duplicates and skip stale entries when popped.",
      "Stop early when the target is popped if you only need one distance.",
    ],
    terms: [
      { term: "Relaxation", meaning: "Improve dist[v] using dist[u] + w(u, v)." },
      { term: "Single-source", meaning: "Distances from one start to all vertices." },
      { term: "Stale entry", meaning: "Heap item with an outdated distance." },
    ],
    example: {
      lang: "python",
      code: "import heapq\n\ndef dijkstra(adj, src):           # adj[u] = [(v, w), ...]\n    dist = {src: 0}\n    heap = [(0, src)]\n    while heap:\n        d, u = heapq.heappop(heap)\n        if d > dist.get(u, float('inf')):\n            continue                  # stale\n        for v, w in adj[u]:\n            nd = d + w\n            if nd < dist.get(v, float('inf')):\n                dist[v] = nd\n                heapq.heappush(heap, (nd, v))\n    return dist",
    },
    pitfalls: [
      "Running Dijkstra on graphs with negative weights.",
      "Forgetting to skip stale heap entries, wasting time.",
    ],
    check: [
      { q: "Why do negative weights break Dijkstra?", a: "A vertex marked final could later be reached more cheaply via a negative edge." },
      { q: "What is its complexity with a binary heap?", a: "O((V + E) log V)." },
    ],
  },

  "dsa-weighted-graphs/bellman-ford": {
    summary:
      "Bellman-Ford relaxes every edge V-1 times, which is enough for shortest paths with up to V-1 edges, and it works with negative weights. A further pass that still improves a distance proves a negative cycle. Floyd-Warshall computes shortest paths between all pairs with a triple loop.",
    visuals: [
      {
        type: "compare",
        title: "Shortest-path algorithms",
        columns: [
          { title: "Dijkstra", points: ["Non-negative weights only", "O((V + E) log V)", "Single source"] },
          { title: "Bellman-Ford", points: ["Handles negative weights", "Detects negative cycles", "O(V x E)", "Single source"] },
          { title: "Floyd-Warshall", points: ["All pairs", "O(V^3) time, O(V^2) space", "Handles negative edges"] },
        ],
      },
    ],
    keyPoints: [
      "After k rounds, distances are correct for paths of at most k edges.",
      "That property solves cheapest flights within k stops.",
      "Floyd-Warshall's loop order matters: the intermediate vertex k is the outer loop.",
      "Shortest paths are undefined when a negative cycle is reachable.",
    ],
    terms: [
      { term: "Negative cycle", meaning: "Cycle whose total weight is below zero." },
      { term: "All-pairs", meaning: "Shortest distances between every pair of vertices." },
      { term: "Round", meaning: "One relaxation pass over all edges." },
    ],
    example: {
      lang: "python",
      code: "def bellman_ford(n, edges, src):  # O(V * E)\n    dist = [float('inf')] * n\n    dist[src] = 0\n    for _ in range(n - 1):\n        for u, v, w in edges:\n            if dist[u] + w < dist[v]:\n                dist[v] = dist[u] + w\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            return None           # negative cycle\n    return dist\n\nprint(bellman_ford(3, [(0, 1, 4), (0, 2, 5), (2, 1, -2)], 0))  # [0, 3, 5]",
    },
    pitfalls: [
      "Putting k as the inner loop in Floyd-Warshall.",
      "Updating in place when solving the k-stops variant; copy distances each round.",
    ],
    check: [
      { q: "Why V-1 rounds?", a: "A shortest simple path has at most V-1 edges." },
      { q: "How does Bellman-Ford detect a negative cycle?", a: "A V-th pass that still relaxes some edge." },
    ],
  },

  "dsa-weighted-graphs/mst": {
    summary:
      "A minimum spanning tree connects every vertex of a weighted undirected graph with the smallest total edge weight and no cycles. Kruskal's algorithm adds the cheapest edges that do not form a cycle, using union-find. Prim's algorithm grows one tree outward by always taking the cheapest edge leaving it.",
    visuals: [
      {
        type: "flow",
        title: "Kruskal's algorithm",
        steps: [
          { label: "Sort edges", detail: "Ascending by weight." },
          { label: "Take next edge", detail: "Cheapest remaining (u, v)." },
          { label: "Cycle check", detail: "find(u) != find(v)?" },
          { label: "Add and union", detail: "Keep edge, merge sets." },
          { label: "Stop", detail: "After V-1 edges." },
        ],
      },
    ],
    keyPoints: [
      "Kruskal: O(E log E), dominated by sorting.",
      "Prim with a heap: O(E log V); good for dense graphs.",
      "Cut property: the lightest edge across any cut belongs to some MST.",
      "An MST has exactly V-1 edges in a connected graph.",
    ],
    terms: [
      { term: "Spanning tree", meaning: "Tree touching every vertex using graph edges." },
      { term: "Cut", meaning: "Partition of vertices into two sets." },
      { term: "Light edge", meaning: "Minimum-weight edge crossing a cut." },
    ],
    example: {
      lang: "python",
      code: "def kruskal(n, edges):            # edges = [(w, u, v)], O(E log E)\n    dsu = DSU(n)                  # from the union-find topic\n    total, used = 0, []\n    for w, u, v in sorted(edges):\n        if dsu.union(u, v):\n            total += w\n            used.append((u, v))\n    return total, used\n\nprint(kruskal(4, [(1, 0, 1), (3, 1, 2), (2, 0, 2), (4, 2, 3)]))\n# (7, [(0, 1), (0, 2), (2, 3)])",
    },
    pitfalls: [
      "Applying MST algorithms to directed graphs.",
      "Confusing an MST with a shortest-path tree; they differ in general.",
    ],
    check: [
      { q: "Why does Kruskal need union-find?", a: "To check quickly whether an edge would join two vertices already in the same tree." },
      { q: "How many edges does an MST of 10 vertices have?", a: "9." },
    ],
  },

  // ───────────── Greedy & dynamic programming ─────────────
  "dsa-greedy-dp/greedy": {
    summary:
      "A greedy algorithm makes the locally best choice at each step and never revisits it. It works only when the problem has the greedy-choice property, which you justify with an exchange argument. When it applies it is usually simple and fast, often a sort followed by one pass.",
    visuals: [
      {
        type: "flow",
        title: "Interval scheduling: maximum non-overlapping meetings",
        steps: [
          { label: "Sort by end time", detail: "Earliest finishing first." },
          { label: "Take first", detail: "It leaves the most room." },
          { label: "Skip overlaps", detail: "Start before last chosen end." },
          { label: "Take next compatible", detail: "Repeat to the end." },
        ],
      },
    ],
    keyPoints: [
      "Typical cost: O(n log n) for the sort plus O(n) for the scan.",
      "Exchange argument: swapping any optimal choice for the greedy one never makes it worse.",
      "Coin change with denominations 1, 3, 4 and amount 6 breaks greedy (4+1+1 vs 3+3).",
      "If a small counterexample exists, switch to dynamic programming.",
    ],
    terms: [
      { term: "Greedy-choice property", meaning: "A locally optimal choice is part of some global optimum." },
      { term: "Exchange argument", meaning: "Proof that swapping in the greedy choice keeps optimality." },
      { term: "Optimal substructure", meaning: "An optimal solution contains optimal sub-solutions." },
    ],
    example: {
      lang: "python",
      code: "def merge_intervals(intervals):   # O(n log n)\n    out = []\n    for start, end in sorted(intervals):\n        if out and start <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], end)\n        else:\n            out.append([start, end])\n    return out\n\ndef can_jump(nums):               # O(n)\n    reach = 0\n    for i, x in enumerate(nums):\n        if i > reach: return False\n        reach = max(reach, i + x)\n    return True",
    },
    pitfalls: [
      "Trusting greedy without a proof or counterexample search.",
      "Sorting by start time when the argument needs end time.",
    ],
    check: [
      { q: "Why sort meetings by end time rather than start time?", a: "Finishing earliest leaves the most room for remaining meetings, which the exchange argument proves optimal." },
      { q: "Give a case where greedy coin change fails.", a: "Coins 1, 3, 4 and amount 6: greedy uses 3 coins, the optimum is 2 (3 + 3)." },
    ],
  },

  "dsa-greedy-dp/dp-fundamentals": {
    summary:
      "Dynamic programming solves problems whose subproblems overlap by computing each subproblem once and reusing it. Top-down DP adds a cache to a recursive solution; bottom-up DP fills a table in dependency order. Define the state, the recurrence, the base cases and the answer location before writing code.",
    visuals: [
      {
        type: "flow",
        title: "Designing a DP solution",
        steps: [
          { label: "State", detail: "dp[i] means best answer for first i items." },
          { label: "Recurrence", detail: "How dp[i] uses smaller states." },
          { label: "Base cases", detail: "dp[0], dp[1]." },
          { label: "Order", detail: "Fill so dependencies come first." },
          { label: "Answer", detail: "dp[n] or max over dp." },
        ],
      },
      {
        type: "compare",
        title: "Top-down versus bottom-up",
        columns: [
          { title: "Memoisation", points: ["Recursion plus cache", "Computes only needed states", "Risk of deep recursion"] },
          { title: "Tabulation", points: ["Loops over a table", "No recursion overhead", "Easy space optimisation"] },
        ],
      },
    ],
    keyPoints: [
      "Time is roughly number of states times work per state.",
      "House robber: dp[i] = max(dp[i-1], dp[i-2] + nums[i]), O(n) time.",
      "When dp[i] depends only on the last two states, space drops to O(1).",
      "functools.cache memoises a pure function in one line.",
    ],
    terms: [
      { term: "Overlapping subproblems", meaning: "The same subproblem is needed many times." },
      { term: "State", meaning: "Parameters that identify one subproblem." },
      { term: "Transition", meaning: "Formula computing a state from smaller ones." },
      { term: "Memoisation", meaning: "Caching results of function calls." },
    ],
    example: {
      lang: "python",
      code: "from functools import cache\n\n@cache\ndef climb(n):                     # top-down, O(n)\n    return 1 if n <= 1 else climb(n - 1) + climb(n - 2)\n\ndef rob(nums):                    # bottom-up, O(n) time, O(1) space\n    prev2 = prev1 = 0\n    for x in nums:\n        prev2, prev1 = prev1, max(prev1, prev2 + x)\n    return prev1\n\nprint(climb(10), rob([2, 7, 9, 3, 1]))  # 89 12",
    },
    pitfalls: [
      "Starting to code before the state is clearly defined.",
      "Caching on mutable arguments such as lists, which are unhashable.",
    ],
    check: [
      { q: "What two properties signal a DP problem?", a: "Overlapping subproblems and optimal substructure." },
      { q: "What is the time complexity of a DP with n states and O(1) work each?", a: "O(n)." },
    ],
  },

  "dsa-greedy-dp/dp-2d": {
    summary:
      "Two-dimensional DP uses states with two indexes, such as a grid cell or a position in each of two strings. Each cell depends on a few neighbours, usually above, left or diagonal, so the table is filled row by row. Edit distance and grid path counting are the classic examples.",
    visuals: [
      {
        type: "tree",
        title: "Edit distance transitions for dp[i][j]",
        root: "dp[i][j]: edit a[:i] into b[:j]",
        children: [
          { label: "Characters match", children: ["dp[i-1][j-1]"] },
          { label: "Replace", children: ["1 + dp[i-1][j-1]"] },
          { label: "Delete from a", children: ["1 + dp[i-1][j]"] },
          { label: "Insert into a", children: ["1 + dp[i][j-1]"] },
        ],
      },
    ],
    keyPoints: [
      "Edit distance: O(m x n) time and space, O(min(m, n)) space with rolling rows.",
      "Unique paths: dp[r][c] = dp[r-1][c] + dp[r][c-1].",
      "Extra row and column of base cases simplify empty-prefix handling.",
      "Fill order must guarantee every dependency is computed first.",
    ],
    terms: [
      { term: "Edit distance", meaning: "Minimum insertions, deletions and replacements to transform a string." },
      { term: "Rolling array", meaning: "Keep only the previous row to save memory." },
      { term: "Base row", meaning: "Row 0 representing an empty prefix." },
    ],
    example: {
      lang: "python",
      code: "def edit_distance(a, b):          # O(m * n)\n    m, n = len(a), len(b)\n    dp = [[0] * (n + 1) for _ in range(m + 1)]\n    for i in range(m + 1): dp[i][0] = i\n    for j in range(n + 1): dp[0][j] = j\n    for i in range(1, m + 1):\n        for j in range(1, n + 1):\n            if a[i - 1] == b[j - 1]:\n                dp[i][j] = dp[i - 1][j - 1]\n            else:\n                dp[i][j] = 1 + min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])\n    return dp[m][n]\n\nprint(edit_distance('horse', 'ros'))  # 3",
    },
    pitfalls: [
      "Off-by-one errors between string indexes and table indexes.",
      "Creating rows with [[0] * n] * m, which aliases one row.",
    ],
    check: [
      { q: "Which neighbours does a unique-paths cell depend on?", a: "The cell above and the cell to the left." },
      { q: "How can edit distance use O(n) space?", a: "Keep only the previous and current rows." },
    ],
  },

  "dsa-greedy-dp/knapsack": {
    summary:
      "In 0/1 knapsack each item can be taken at most once to maximise value within a weight capacity. The state is the best value for each capacity using the items seen so far. Many problems are knapsack in disguise, including subset sum, equal partition and coin change.",
    visuals: [
      {
        type: "compare",
        title: "Knapsack variants with a 1D table",
        columns: [
          { title: "0/1 knapsack", points: ["Each item once", "Loop capacity downwards", "dp[c] = max(dp[c], dp[c-w] + v)"] },
          { title: "Unbounded knapsack", points: ["Items reusable", "Loop capacity upwards", "Coin change is this form"] },
        ],
      },
    ],
    keyPoints: [
      "Time O(n x W), space O(W) with a 1D table.",
      "It is pseudo-polynomial: fast only when capacity W is small.",
      "Subset sum: boolean dp[c] meaning sum c is reachable.",
      "Iterating capacity downwards prevents reusing an item in the same row.",
    ],
    terms: [
      { term: "Capacity", meaning: "Maximum total weight allowed." },
      { term: "Pseudo-polynomial", meaning: "Polynomial in the numeric value W, not its bit length." },
      { term: "Subset sum", meaning: "Is there a subset adding to a target?" },
    ],
    example: {
      lang: "python",
      code: "def knapsack(items, W):           # items = [(weight, value)], O(n * W)\n    dp = [0] * (W + 1)\n    for w, v in items:\n        for c in range(W, w - 1, -1):     # downwards: each item once\n            dp[c] = max(dp[c], dp[c - w] + v)\n    return dp[W]\n\ndef coin_change(coins, amount):   # unbounded, fewest coins\n    INF = float('inf')\n    dp = [0] + [INF] * amount\n    for c in range(1, amount + 1):\n        dp[c] = min((dp[c - x] + 1 for x in coins if x <= c), default=INF)\n    return dp[amount] if dp[amount] < INF else -1",
    },
    pitfalls: [
      "Looping capacity upwards in 0/1 knapsack, which reuses items.",
      "Assuming knapsack is fast for capacities in the billions.",
    ],
    check: [
      { q: "Why iterate capacity downwards in 0/1 knapsack?", a: "So dp[c - w] still holds the value from before this item was considered." },
      { q: "How is equal partition a knapsack problem?", a: "Ask whether a subset sums to half of the total." },
    ],
  },

  "dsa-greedy-dp/lis-lcs": {
    summary:
      "The longest increasing subsequence and longest common subsequence are two of the most reused DP patterns. LIS has a simple O(n^2) DP and an O(n log n) method that keeps the smallest tail for each length. LCS fills a 2D table comparing prefixes of two sequences.",
    visuals: [
      {
        type: "flow",
        title: "LIS in O(n log n) on [3, 1, 4, 1, 5, 9, 2, 6]",
        steps: [
          { label: "3, 1", detail: "tails = [1]" },
          { label: "4, 1", detail: "tails = [1, 4]" },
          { label: "5, 9", detail: "tails = [1, 4, 5, 9]" },
          { label: "2", detail: "Replace 4: [1, 2, 5, 9]" },
          { label: "6", detail: "Replace 9: [1, 2, 5, 6], length 4" },
        ],
      },
    ],
    keyPoints: [
      "LIS DP: dp[i] = 1 + max(dp[j]) for j < i with a[j] < a[i], O(n^2).",
      "Patience method: binary search into tails, O(n log n).",
      "LCS: O(m x n); match takes the diagonal plus one, else max of up or left.",
      "Reconstruct LCS by walking back from dp[m][n].",
    ],
    terms: [
      { term: "Subsequence", meaning: "Elements in order, not necessarily contiguous." },
      { term: "tails array", meaning: "Smallest ending value of an increasing run of each length." },
      { term: "LCS", meaning: "Longest sequence that is a subsequence of both inputs." },
    ],
    example: {
      lang: "python",
      code: "from bisect import bisect_left\ndef lis_length(nums):             # O(n log n)\n    tails = []\n    for x in nums:\n        i = bisect_left(tails, x)\n        if i == len(tails): tails.append(x)\n        else: tails[i] = x\n    return len(tails)\n\ndef lcs(a, b):                    # O(m * n)\n    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]\n    for i in range(1, len(a) + 1):\n        for j in range(1, len(b) + 1):\n            dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])\n    return dp[-1][-1]",
    },
    pitfalls: [
      "Treating the tails array as the actual LIS; only its length is guaranteed.",
      "Confusing subsequence with substring.",
    ],
    check: [
      { q: "What is the complexity of LIS with binary search?", a: "O(n log n)." },
      { q: "What is the LCS of ABCBDAB and BDCABA in length?", a: "4, for example BCBA." },
    ],
  },

  "dsa-greedy-dp/interval-dp": {
    summary:
      "Interval DP defines a state for every contiguous range i to j and builds answers for longer intervals from shorter ones. A typical transition tries every split point k inside the interval. Matrix chain multiplication, burst balloons and palindrome partitioning all use this shape.",
    visuals: [
      {
        type: "cycle",
        title: "Fill order by interval length",
        steps: [
          { label: "Length 1", detail: "Base cases on the diagonal." },
          { label: "Grow length", detail: "length = 2, 3, ..., n." },
          { label: "Each start i", detail: "j = i + length - 1." },
          { label: "Try splits k", detail: "Combine dp[i][k] and dp[k+1][j]." },
        ],
      },
    ],
    keyPoints: [
      "States O(n^2); with a split loop, total time is O(n^3).",
      "Iterate by length so smaller intervals are always ready.",
      "Palindromic substring checks are O(n^2) interval DP without splits.",
      "Burst balloons chooses the last balloon to burst in each interval.",
    ],
    terms: [
      { term: "Interval state", meaning: "dp[i][j] covers the range from i to j." },
      { term: "Split point", meaning: "Index k dividing an interval into two parts." },
      { term: "Matrix chain", meaning: "Parenthesise a product to minimise multiplications." },
    ],
    example: {
      lang: "python",
      code: "def matrix_chain(dims):           # O(n^3), matrices i is dims[i] x dims[i+1]\n    n = len(dims) - 1\n    dp = [[0] * n for _ in range(n)]\n    for length in range(2, n + 1):\n        for i in range(n - length + 1):\n            j = i + length - 1\n            dp[i][j] = min(\n                dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]\n                for k in range(i, j)\n            )\n    return dp[0][n - 1]\n\nprint(matrix_chain([10, 30, 5, 60]))  # 4500",
    },
    pitfalls: [
      "Filling by row index instead of by length, reading unfilled cells.",
      "Off-by-one errors in the dimension indexes of the split cost.",
    ],
    check: [
      { q: "Why iterate by interval length?", a: "Every transition uses strictly shorter intervals, which must already be computed." },
      { q: "What is the typical complexity of interval DP with splits?", a: "O(n^3)." },
    ],
  },

  // ───────────── Backtracking & bit manipulation ─────────────
  "dsa-backtracking-bits/backtracking": {
    summary:
      "Backtracking builds candidate solutions one choice at a time and undoes the last choice when it leads nowhere. It systematically explores a tree of decisions, generating subsets, permutations and combinations. The choose, explore, unchoose template fits almost every problem in this family.",
    visuals: [
      {
        type: "tree",
        title: "Decision tree for subsets of [1, 2]",
        root: "[] start",
        children: [
          { label: "Take 1: [1]", children: ["Take 2: [1, 2]", "Skip 2: [1]"] },
          { label: "Skip 1: []", children: ["Take 2: [2]", "Skip 2: []"] },
        ],
      },
    ],
    keyPoints: [
      "Subsets: O(n x 2^n); permutations: O(n x n!).",
      "Copy the current path when recording it, otherwise later changes alter it.",
      "Sort input and skip equal neighbours to avoid duplicate results.",
      "Recursion depth equals the number of choices, usually n.",
    ],
    terms: [
      { term: "Backtrack", meaning: "Undo the last choice and try the next option." },
      { term: "State space tree", meaning: "Tree of all partial choices." },
      { term: "Path", meaning: "Choices made so far." },
    ],
    example: {
      lang: "python",
      code: "def subsets(nums):                # O(n * 2^n)\n    out, path = [], []\n    def go(i):\n        if i == len(nums):\n            out.append(path[:])   # copy\n            return\n        path.append(nums[i]); go(i + 1)   # choose, explore\n        path.pop(); go(i + 1)             # unchoose, skip\n    go(0)\n    return out\n\ndef permutations(nums):           # O(n * n!)\n    if not nums: return [[]]\n    return [[x] + p for i, x in enumerate(nums)\n            for p in permutations(nums[:i] + nums[i + 1:])]",
    },
    pitfalls: [
      "Appending path instead of path[:] to the results.",
      "Forgetting to undo state after the recursive call.",
    ],
    check: [
      { q: "How many subsets does a set of n elements have?", a: "2^n." },
      { q: "How do you avoid duplicate subsets when the input has repeats?", a: "Sort it and skip a value equal to the previous one at the same depth." },
    ],
  },

  "dsa-backtracking-bits/constraint-search": {
    summary:
      "Constraint problems like N-Queens, Sudoku and word search are backtracking with strong pruning. Before exploring a choice you check it against the constraints and abandon whole branches that cannot succeed. Good pruning and fast constraint checks make exponential searches practical.",
    visuals: [
      {
        type: "flow",
        title: "Placing queens row by row",
        steps: [
          { label: "Row r", detail: "Try each column c." },
          { label: "Check sets", detail: "Column, r-c and r+c diagonals free?" },
          { label: "Place", detail: "Add to sets, recurse to row r+1." },
          { label: "Remove", detail: "Backtrack and try the next column." },
          { label: "Row n", detail: "All queens placed: record solution." },
        ],
      },
    ],
    keyPoints: [
      "Worst case is still exponential; pruning reduces the explored part.",
      "O(1) constraint checks with sets beat rescanning the board.",
      "Choose the most constrained variable first, such as the Sudoku cell with fewest options.",
      "Word search marks cells in use and restores them on return.",
    ],
    terms: [
      { term: "Pruning", meaning: "Skipping branches that cannot lead to a solution." },
      { term: "Constraint", meaning: "Rule every valid solution must satisfy." },
      { term: "Most constrained first", meaning: "Branch on the variable with fewest legal values." },
    ],
    example: {
      lang: "python",
      code: "def n_queens(n):                  # count solutions\n    cols, d1, d2 = set(), set(), set()\n    def place(r):\n        if r == n: return 1\n        count = 0\n        for c in range(n):\n            if c in cols or r - c in d1 or r + c in d2:\n                continue          # prune\n            cols.add(c); d1.add(r - c); d2.add(r + c)\n            count += place(r + 1)\n            cols.remove(c); d1.remove(r - c); d2.remove(r + c)\n        return count\n    return place(0)\n\nprint(n_queens(8))  # 92",
    },
    pitfalls: [
      "Checking constraints only when the board is full.",
      "Forgetting to restore a visited cell in grid word search.",
    ],
    check: [
      { q: "How do you test both diagonals in O(1) for N-Queens?", a: "Keep sets of r - c and r + c for placed queens." },
      { q: "What heuristic speeds up Sudoku solvers?", a: "Fill the empty cell with the fewest legal digits first." },
    ],
  },

  "dsa-backtracking-bits/bit-manipulation": {
    summary:
      "Integers are stored in binary, and bitwise operators let you read and change individual bits in O(1). Bit tricks test powers of two, count set bits and find a unique element with XOR. A bitmask can represent a subset of up to about 20 to 30 items, enabling compact DP and enumeration.",
    visuals: [
      {
        type: "compare",
        title: "Everyday bit operations",
        columns: [
          { title: "Test and set", points: ["Test bit i: x >> i & 1", "Set bit i: x | (1 << i)", "Clear bit i: x & ~(1 << i)", "Toggle bit i: x ^ (1 << i)"] },
          { title: "Tricks", points: ["Lowest set bit: x & -x", "Drop lowest bit: x & (x - 1)", "Power of two: x > 0 and x & (x - 1) == 0", "a ^ a == 0"] },
        ],
      },
    ],
    keyPoints: [
      "Bitwise operations are O(1) on machine-sized integers.",
      "XOR of all numbers cancels pairs, leaving the single number in O(n).",
      "Enumerating all masks of n items is O(2^n).",
      "Python ints are unbounded, so negative numbers behave like infinite two's complement.",
    ],
    terms: [
      { term: "Bitmask", meaning: "Integer whose bits mark set membership." },
      { term: "XOR", meaning: "Bit is 1 when exactly one input bit is 1." },
      { term: "Two's complement", meaning: "Standard encoding of negative integers." },
      { term: "Popcount", meaning: "Number of 1 bits." },
    ],
    example: {
      lang: "python",
      code: "from functools import reduce\nfrom operator import xor\n\nprint(reduce(xor, [4, 1, 2, 1, 2]))   # 4: pairs cancel\nprint(bin(13), (13).bit_count())      # 0b1101 3\n\ndef is_power_of_two(x):\n    return x > 0 and x & (x - 1) == 0\n\nitems = ['a', 'b', 'c']\nfor mask in range(1 << len(items)):   # all 8 subsets\n    print([items[i] for i in range(len(items)) if mask >> i & 1])",
    },
    pitfalls: [
      "Operator precedence: in Python, & binds tighter than == but looser than + and <<.",
      "Expecting fixed 32-bit overflow behaviour in Python.",
    ],
    check: [
      { q: "What does x & (x - 1) do?", a: "Clears the lowest set bit of x." },
      { q: "How do you find the one number that appears once when all others appear twice?", a: "XOR all numbers together; pairs cancel to zero." },
    ],
  },

  // ───────────── Advanced patterns & range structures ─────────────
  "dsa-advanced/two-pointers": {
    summary:
      "The two-pointer pattern moves two indexes through a sequence, either towards each other from both ends or in the same direction at different speeds. On sorted data it replaces an O(n^2) pair search with an O(n) scan. It also powers in-place deduplication and partitioning.",
    visuals: [
      {
        type: "flow",
        title: "Pair with target sum on sorted input",
        steps: [
          { label: "Start", detail: "left = 0, right = n - 1." },
          { label: "Sum", detail: "s = a[left] + a[right]." },
          { label: "Too small", detail: "left += 1." },
          { label: "Too big", detail: "right -= 1." },
          { label: "Equal", detail: "Found the pair." },
        ],
      },
    ],
    keyPoints: [
      "Converging pointers: O(n) time, O(1) space on sorted arrays.",
      "Three-sum: sort, then fix one element and run two pointers, O(n^2).",
      "Same-direction pointers remove duplicates in place in O(n).",
      "Container with most water: always move the shorter side.",
    ],
    terms: [
      { term: "Converging pointers", meaning: "Start at both ends and move inwards." },
      { term: "Read / write pointers", meaning: "One scans input, the other marks where to write." },
      { term: "Invariant", meaning: "The answer cannot lie outside the current window." },
    ],
    example: {
      lang: "python",
      code: "def two_sum_sorted(a, target):    # O(n), O(1) space\n    left, right = 0, len(a) - 1\n    while left < right:\n        s = a[left] + a[right]\n        if s == target: return left, right\n        if s < target: left += 1\n        else: right -= 1\n\ndef dedupe(a):                    # in place, returns new length\n    w = 0\n    for r in range(len(a)):\n        if r == 0 or a[r] != a[r - 1]:\n            a[w] = a[r]; w += 1\n    return w",
    },
    pitfalls: [
      "Applying converging pointers to unsorted input.",
      "Skipping duplicate handling in three-sum, producing repeated triplets.",
    ],
    check: [
      { q: "Why can you move left forward when the sum is too small?", a: "The array is sorted, so pairing a[left] with any element left of right is even smaller." },
      { q: "What is three-sum's complexity with two pointers?", a: "O(n^2) after an O(n log n) sort." },
    ],
  },

  "dsa-advanced/sliding-window": {
    summary:
      "A sliding window maintains a contiguous range of the input and updates its summary as the range moves, instead of recomputing from scratch. Fixed windows slide one step at a time; variable windows grow the right edge and shrink the left edge while a condition is violated. Each element enters and leaves the window once, so the total is O(n).",
    visuals: [
      {
        type: "cycle",
        title: "Variable window loop",
        steps: [
          { label: "Expand", detail: "Add s[right] to the window state." },
          { label: "Check", detail: "Is the window invalid?" },
          { label: "Shrink", detail: "Remove s[left], left += 1, until valid." },
          { label: "Record", detail: "Update the best answer." },
        ],
      },
    ],
    keyPoints: [
      "Time O(n): both pointers only move forward.",
      "Window state is usually a sum, count or dict of character frequencies.",
      "Longest substring without repeats tracks the last index of each character.",
      "Minimum window substring shrinks while all required characters are covered.",
    ],
    terms: [
      { term: "Window", meaning: "Contiguous range from left to right." },
      { term: "Fixed window", meaning: "Size k stays constant." },
      { term: "Variable window", meaning: "Size grows and shrinks with a condition." },
    ],
    example: {
      lang: "python",
      code: "def longest_unique(s):            # O(n)\n    last, left, best = {}, 0, 0\n    for right, ch in enumerate(s):\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1   # shrink past the repeat\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\n\ndef max_avg(nums, k):             # fixed window\n    s = best = sum(nums[:k])\n    for i in range(k, len(nums)):\n        s += nums[i] - nums[i - k]; best = max(best, s)\n    return best / k",
    },
    pitfalls: [
      "Recomputing the window sum each step, giving O(n x k).",
      "Using sliding window with negative numbers where shrinking does not restore validity.",
    ],
    check: [
      { q: "Why is a variable sliding window O(n) despite a nested shrink loop?", a: "left and right each move forward at most n times in total." },
      { q: "What is the longest substring without repeats in abcabcbb?", a: "3, for example abc." },
    ],
  },

  "dsa-advanced/fenwick-tree": {
    summary:
      "A Fenwick tree, or binary indexed tree, stores partial sums in a plain array so both prefix-sum queries and point updates cost O(log n). Each index is responsible for a range whose length is its lowest set bit. It is shorter to code than a segment tree when you only need sums.",
    visuals: [
      {
        type: "compare",
        title: "Range sums on a changing array",
        columns: [
          { title: "Plain array", points: ["Update O(1)", "Range sum O(n)", "No extra memory"] },
          { title: "Prefix sum array", points: ["Update O(n)", "Range sum O(1)", "Best for static data"] },
          { title: "Fenwick tree", points: ["Update O(log n)", "Range sum O(log n)", "O(n) memory"] },
        ],
      },
    ],
    keyPoints: [
      "Update walks up with i += i & -i; query walks down with i -= i & -i.",
      "Indexes are 1-based to make the lowbit trick work.",
      "Range sum(l, r) = prefix(r) - prefix(l - 1).",
      "Counting inversions with a Fenwick tree is O(n log n).",
    ],
    terms: [
      { term: "Lowbit", meaning: "i & -i, the value of i's lowest set bit." },
      { term: "Point update", meaning: "Change a single element." },
      { term: "Prefix query", meaning: "Sum of elements 1 to i." },
    ],
    example: {
      lang: "python",
      code: "class Fenwick:\n    def __init__(self, n):\n        self.t = [0] * (n + 1)\n\n    def add(self, i, delta):      # 1-based, O(log n)\n        while i < len(self.t):\n            self.t[i] += delta\n            i += i & -i\n\n    def prefix(self, i):          # sum of 1..i, O(log n)\n        s = 0\n        while i > 0:\n            s += self.t[i]\n            i -= i & -i\n        return s",
    },
    pitfalls: [
      "Using index 0, which makes i & -i zero and loops forever.",
      "Setting a value with add without subtracting the old value first.",
    ],
    check: [
      { q: "What are the costs of update and query?", a: "Both O(log n)." },
      { q: "How do you get sum(l..r)?", a: "prefix(r) - prefix(l - 1)." },
    ],
  },

  "dsa-advanced/segment-tree": {
    summary:
      "A segment tree is a binary tree where each node stores an aggregate, such as sum, min or max, for a segment of the array. Queries combine O(log n) nodes and point updates refresh one root-to-leaf path. Lazy propagation extends it to range updates by deferring work to children until needed.",
    visuals: [
      {
        type: "tree",
        title: "Sum segment tree for [2, 1, 5, 3]",
        root: "[0..3] = 11",
        children: [
          { label: "[0..1] = 3", children: ["[0] = 2", "[1] = 1"] },
          { label: "[2..3] = 8", children: ["[2] = 5", "[3] = 3"] },
        ],
      },
    ],
    keyPoints: [
      "Build O(n), query O(log n), point update O(log n).",
      "Memory about 4n for a recursive array-based tree.",
      "Works for any associative operation: sum, min, max, gcd.",
      "Lazy propagation gives O(log n) range updates.",
    ],
    terms: [
      { term: "Segment", meaning: "Contiguous index range a node covers." },
      { term: "Associative", meaning: "(a op b) op c equals a op (b op c)." },
      { term: "Lazy propagation", meaning: "Store pending updates and push them down later." },
    ],
    example: {
      lang: "python",
      code: "class SegTree:                    # iterative sum tree\n    def __init__(self, a):\n        self.n = len(a)\n        self.t = [0] * self.n + list(a)\n        for i in range(self.n - 1, 0, -1):\n            self.t[i] = self.t[2 * i] + self.t[2 * i + 1]\n\n    def query(self, l, r):        # sum of a[l:r], O(log n)\n        s, l, r = 0, l + self.n, r + self.n\n        while l < r:\n            if l & 1: s += self.t[l]; l += 1\n            if r & 1: r -= 1; s += self.t[r]\n            l //= 2; r //= 2\n        return s",
      caption: "A point update sets t[n + i] and recomputes each parent up to the root.",
    },
    pitfalls: [
      "Allocating only 2n for a recursive segment tree, causing index errors.",
      "Using a segment tree when a prefix sum or Fenwick tree is enough.",
    ],
    check: [
      { q: "What do segment trees offer over Fenwick trees?", a: "Any associative operation such as min or max, and range updates with lazy propagation." },
      { q: "What is the cost of a range query?", a: "O(log n)." },
    ],
  },

  // ───────────── Capstone ─────────────
  "dsa-capstone/algorithms-library": {
    summary:
      "Building your own algorithms library turns scattered exercises into a single tested codebase you understand completely. Each structure gets an implementation, tests that cover edge cases, a documented complexity and a benchmark against Python's built-ins. It becomes both a portfolio piece and a personal reference.",
    visuals: [
      {
        type: "layers",
        title: "Library structure",
        layers: [
          { label: "README and docs", detail: "Usage plus a complexity table." },
          { label: "Benchmarks", detail: "timeit comparisons with built-ins." },
          { label: "Tests", detail: "pytest cases: empty, single, duplicates, large." },
          { label: "Algorithms", detail: "Sorting, graphs, DP helpers." },
          { label: "Data structures", detail: "Dynamic array, linked list, heap, trie, DSU, Fenwick." },
        ],
      },
    ],
    keyPoints: [
      "Write tests first for the edge cases that broke your solutions before.",
      "Document time and space complexity in every docstring.",
      "Benchmarks show when constants matter, such as your heap versus heapq.",
      "Keep the public API small and consistent across structures.",
    ],
    terms: [
      { term: "Edge case", meaning: "Unusual input like empty, one element or duplicates." },
      { term: "Benchmark", meaning: "Repeatable timing of code on fixed inputs." },
      { term: "Property-based test", meaning: "Compare against a reference on random inputs." },
    ],
    example: {
      lang: "python",
      code: "import random\nfrom mylib.sorting import merge_sort, quicksort\n\ndef test_sorts_match_builtin():\n    for _ in range(200):\n        xs = [random.randint(-50, 50) for _ in range(random.randint(0, 40))]\n        assert merge_sort(xs[:]) == sorted(xs)\n        assert quicksort(xs[:]) == sorted(xs)\n\ndef test_empty_and_single():\n    assert merge_sort([]) == [] and merge_sort([1]) == [1]",
      caption: "Run with: pytest -q",
    },
    pitfalls: [
      "Testing only the happy path with small sorted inputs.",
      "Copying implementations without being able to rewrite them from memory.",
    ],
    check: [
      { q: "Why compare against sorted() on random inputs?", a: "It is a trusted reference, so random comparisons catch bugs you did not think to test." },
      { q: "What should every function's docstring state?", a: "Its time and space complexity, plus inputs and outputs." },
    ],
  },

  "dsa-capstone/timed-problem-sets": {
    summary:
      "Timed sessions train you to solve unfamiliar problems under pressure with a repeatable method. Clarify the problem, work examples, pick a pattern, state complexity, code, then test with edge cases. Logging every miss shows which patterns need more practice.",
    visuals: [
      {
        type: "flow",
        title: "A 40-minute problem routine",
        steps: [
          { label: "Clarify (5 min)", detail: "Inputs, constraints, edge cases." },
          { label: "Examples (5 min)", detail: "Work small cases by hand." },
          { label: "Plan (5 min)", detail: "Brute force, then a better pattern and its Big-O." },
          { label: "Code (15 min)", detail: "Clean, named variables." },
          { label: "Test (10 min)", detail: "Walk through edge cases and fix." },
        ],
      },
    ],
    keyPoints: [
      "Input constraints hint at the target complexity: n = 10^5 needs about O(n log n).",
      "Say the brute force and its complexity before optimising.",
      "Stop after the time limit, study the solution, and retry in a week.",
      "Mix topics so you practise recognising patterns, not just applying them.",
    ],
    terms: [
      { term: "Constraint", meaning: "Limits on input size or values given in the problem." },
      { term: "Brute force", meaning: "Simplest correct approach, often exhaustive." },
      { term: "Mistake log", meaning: "Record of what went wrong and the missing insight." },
    ],
    pitfalls: [
      "Coding immediately without clarifying constraints.",
      "Reading solutions too early, so no struggle builds intuition.",
      "Never revisiting failed problems.",
    ],
    check: [
      { q: "If n is up to 10^5, which complexities are usually acceptable?", a: "O(n) or O(n log n); O(n^2) is around 10^10 operations and too slow." },
      { q: "What do you do when you exceed the time limit?", a: "Stop, study the solution, log the insight and re-solve it later from scratch." },
    ],
  },

  "dsa-capstone/pattern-review": {
    summary:
      "Most problems are variations of a few dozen patterns. A cheat sheet that maps problem signals to patterns, combined with spaced repetition, keeps every topic fresh and speeds up recognition. Re-solving one representative problem per pattern is the most efficient review.",
    visuals: [
      {
        type: "tree",
        title: "Signals to patterns",
        root: "Problem signals",
        children: [
          { label: "Sorted array or pairs", children: ["Two pointers", "Binary search"] },
          { label: "Contiguous subarray or substring", children: ["Sliding window", "Prefix sums"] },
          { label: "Shortest steps or levels", children: ["BFS"] },
          { label: "All combinations", children: ["Backtracking"] },
          { label: "Count ways or best value", children: ["Dynamic programming"] },
          { label: "Top k or streaming min", children: ["Heap"] },
        ],
      },
    ],
    keyPoints: [
      "Review at growing intervals such as 1, 3, 7 and 21 days.",
      "Write the signal, pattern and complexity on each card.",
      "Focus extra review on patterns from your mistake log.",
    ],
    terms: [
      { term: "Spaced repetition", meaning: "Reviewing at increasing intervals to strengthen memory." },
      { term: "Pattern", meaning: "Reusable approach shared by many problems." },
      { term: "Signal", meaning: "A clue in the problem statement that suggests a pattern." },
    ],
    check: [
      { q: "Which pattern does 'longest substring with at most k distinct characters' suggest?", a: "A variable sliding window with a frequency map." },
      { q: "Which pattern does 'minimum number of moves on a grid' suggest?", a: "BFS." },
    ],
  },
};

export default explainers;
