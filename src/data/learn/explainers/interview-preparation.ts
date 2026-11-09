import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  "dsa/big-o": {
    summary:
      "Big-O describes how an algorithm's time or memory grows as the input size n grows. Interviewers expect you to state it for every solution and to compare options by it.",
    analogy: "Big-O is the shape of the cost curve, not the exact stopwatch time.",
    visuals: [
      {
        type: "flow",
        title: "How to analyse a solution",
        steps: [
          { label: "Define n", detail: "Name what grows: array length, nodes, string size" },
          { label: "Count loop work", detail: "One pass is O(n); nested passes multiply" },
          { label: "Count recursion", detail: "Roughly branches to the power of depth" },
          { label: "Drop constants", detail: "O(2n + 5) simplifies to O(n)" },
          { label: "Keep dominant term", detail: "O(n squared + n) simplifies to O(n squared)" },
          { label: "State extra space", detail: "Maps, arrays, recursion stack depth" },
        ],
      },
      {
        type: "layers",
        title: "Growth rates, fastest first",
        layers: [
          { label: "O(1)", detail: "Array index, hash map lookup" },
          { label: "O(log n)", detail: "Binary search, balanced tree lookup" },
          { label: "O(n)", detail: "Single pass over the input" },
          { label: "O(n log n)", detail: "Efficient sorting" },
          { label: "O(n squared)", detail: "Comparing every pair" },
          { label: "O(2 to the n)", detail: "Trying every subset" },
        ],
      },
    ],
    keyPoints: [
      "Big-O is an upper bound, Big-Omega a lower bound, Big-Theta a tight bound.",
      "Interviews usually mean worst-case Big-O unless they say average or amortised.",
      "Recursion uses stack space: depth d costs O(d) memory.",
      "Trading memory for speed, such as a hash set, is the most common optimisation.",
    ],
    terms: [
      { term: "Time complexity", meaning: "How the number of steps grows with input size." },
      { term: "Space complexity", meaning: "How extra memory grows with input size." },
      { term: "Big-O", meaning: "Upper bound on growth, ignoring constants." },
      { term: "Amortised", meaning: "Average cost per operation over a long sequence." },
      { term: "Logarithmic", meaning: "Grows by one step each time n doubles." },
    ],
    example: {
      lang: "python",
      code: "def has_dup_slow(nums):  # O(n^2) time, O(1) space\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] == nums[j]:\n                return True\n    return False\n\ndef has_dup_fast(nums):  # O(n) time, O(n) space\n    seen = set()\n    for x in nums:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False",
      caption: "Same answer, different trade-off between time and memory.",
    },
    pitfalls: [
      "Forgetting that slicing or string concatenation in a loop costs O(n) each time.",
      "Ignoring recursion stack space.",
      "Calling an O(n) operation like list.remove inside a loop and claiming O(n) overall.",
    ],
    check: [
      { q: "What is the complexity of two nested loops over n items?", a: "O(n squared), because the inner loop runs n times for each of n outer iterations." },
      { q: "Why is binary search O(log n)?", a: "Each step halves the search range, so about log2(n) steps are needed." },
    ],
  },

  "dsa/arrays": {
    summary:
      "Array and string problems test careful indexing, in-place updates and precomputation. Prefix sums and two-pass scans turn repeated work into a single O(n) pass.",
    visuals: [
      {
        type: "flow",
        title: "Prefix sum pattern",
        steps: [
          { label: "Start p = [0]", detail: "p[i] will hold the sum of the first i items" },
          { label: "Add each item", detail: "p[i + 1] = p[i] + nums[i]" },
          { label: "Answer a range", detail: "sum(l..r) = p[r + 1] - p[l]" },
          { label: "Each query O(1)", detail: "After an O(n) build" },
        ],
      },
      {
        type: "flow",
        title: "Product of array except self",
        steps: [
          { label: "Left pass", detail: "out[i] = product of everything left of i" },
          { label: "Right pass", detail: "Multiply out[i] by product of everything right" },
          { label: "Return out", detail: "O(n) time, no division needed" },
        ],
      },
    ],
    keyPoints: [
      "Prefix sums answer many range-sum queries in O(1) each after O(n) setup.",
      "Track a running minimum or maximum to solve stock-style problems in one pass.",
      "Build strings with a list and join; repeated concatenation can be O(n squared).",
      "Always test empty input, one element, duplicates and negative numbers.",
    ],
    terms: [
      { term: "In-place", meaning: "Modifying the input array without extra arrays." },
      { term: "Prefix sum", meaning: "Array where each entry is the running total so far." },
      { term: "Running min", meaning: "Smallest value seen so far while scanning." },
      { term: "Off-by-one", meaning: "Bug from a loop bound or index one step wrong." },
    ],
    example: {
      lang: "python",
      code: "def build_prefix(nums):\n    p = [0]\n    for x in nums:\n        p.append(p[-1] + x)\n    return p  # sum(nums[l..r]) = p[r + 1] - p[l]\n\ndef max_profit(prices):  # Best Time to Buy and Sell Stock\n    best, low = 0, float('inf')\n    for price in prices:\n        low = min(low, price)\n        best = max(best, price - low)\n    return best  # O(n) time, O(1) space",
    },
    pitfalls: [
      "Off-by-one errors in range bounds; write a tiny example and trace it.",
      "Modifying an array while iterating over it.",
      "Using division in Product Except Self, which breaks on zeros.",
    ],
    check: [
      { q: "How do you get the sum of nums[2..5] from a prefix array p?", a: "p[6] - p[2], where p[i] is the sum of the first i elements." },
      { q: "Why track the lowest price so far in the stock problem?", a: "The best sale today pairs with the cheapest earlier buy, giving O(n) instead of checking all pairs." },
    ],
  },

  "dsa/hashing": {
    summary:
      "Hash maps and sets give average O(1) insert and lookup. Replacing an inner search loop with a hash lookup is the classic way to turn O(n squared) into O(n).",
    visuals: [
      {
        type: "flow",
        title: "How a hash map finds a key",
        steps: [
          { label: "Hash the key", detail: "hash('cat') gives a large integer" },
          { label: "Pick a bucket", detail: "index = hash mod number of buckets" },
          { label: "Scan the bucket", detail: "Compare keys with equals to find a match" },
          { label: "Resize when full", detail: "Past the load factor, double and rehash" },
        ],
      },
      {
        type: "compare",
        title: "Two Sum approaches",
        columns: [
          { title: "Brute force", points: ["Check every pair", "O(n squared) time", "O(1) extra space"] },
          { title: "Hash map", points: ["Store value to index", "Look up target minus x", "O(n) time, O(n) space"] },
        ],
      },
    ],
    keyPoints: [
      "Average O(1) operations; worst case O(n) if many keys collide.",
      "Use a map to count frequencies and a set for fast membership checks.",
      "A canonical key, like sorted letters, groups equivalent items such as anagrams.",
      "Keys must be immutable: tuples work in Python, lists do not.",
    ],
    terms: [
      { term: "Hash function", meaning: "Maps a key to an integer used to pick a bucket." },
      { term: "Collision", meaning: "Two keys landing in the same bucket." },
      { term: "Load factor", meaning: "Entries divided by buckets; triggers resizing." },
      { term: "Frequency map", meaning: "Map from item to how many times it appears." },
    ],
    example: {
      lang: "python",
      code: "def two_sum(nums, target):\n    seen = {}  # value -> index\n    for i, x in enumerate(nums):\n        if target - x in seen:\n            return [seen[target - x], i]\n        seen[x] = i\n    return []\n\ndef group_anagrams(words):\n    groups = {}\n    for w in words:\n        groups.setdefault(''.join(sorted(w)), []).append(w)\n    return list(groups.values())",
    },
    pitfalls: [
      "Inserting x before checking target - x, which pairs an element with itself.",
      "Using a mutable list as a dictionary key.",
      "Forgetting the O(n) extra memory in the complexity answer.",
    ],
    check: [
      { q: "Why is hash lookup O(1) on average but O(n) worst case?", a: "Usually each bucket holds few keys, but if all keys collide one bucket must be scanned linearly." },
      { q: "What key groups anagrams together?", a: "The word's letters sorted, or a tuple of 26 letter counts." },
    ],
  },

  "dsa/two-pointers": {
    summary:
      "Two pointers walk an array from both ends or at different speeds, avoiding nested loops. A sliding window is a pair of pointers marking a range that grows and shrinks as you scan.",
    visuals: [
      {
        type: "flow",
        title: "Variable sliding window",
        steps: [
          { label: "Expand right", detail: "Add s[right] to the window state" },
          { label: "Check validity", detail: "Does the window break the rule?" },
          { label: "Shrink left", detail: "While invalid, remove s[left] and move left" },
          { label: "Update best", detail: "Record window size or sum" },
          { label: "Repeat to end", detail: "Each index enters and leaves once: O(n)" },
        ],
      },
      {
        type: "compare",
        title: "Which pointer pattern?",
        columns: [
          { title: "Opposite ends", points: ["left = 0, right = n - 1", "Sorted input or palindromes", "Move the pointer that can improve", "3Sum, Container With Most Water"] },
          { title: "Sliding window", points: ["Both start at 0", "Contiguous subarray or substring", "Grow right, shrink left", "Longest Substring Without Repeats"] },
        ],
      },
    ],
    keyPoints: [
      "Sliding window works for contiguous ranges; each element is added and removed at most once.",
      "Opposite-end pointers usually need sorted input or a symmetric check.",
      "3Sum is sort plus a two-pointer scan per element: O(n squared) overall.",
      "Phrases like longest substring or subarray with sum hint at a window.",
    ],
    terms: [
      { term: "Window", meaning: "The current range between left and right pointers." },
      { term: "Fixed window", meaning: "Window of constant size k sliding one step at a time." },
      { term: "Variable window", meaning: "Window that grows and shrinks to satisfy a rule." },
      { term: "Invariant", meaning: "Condition that stays true after every step." },
    ],
    example: {
      lang: "python",
      code: "def longest_unique(s):\n    seen = set()\n    left = best = 0\n    for right, ch in enumerate(s):\n        while ch in seen:          # window invalid: shrink\n            seen.remove(s[left])\n            left += 1\n        seen.add(ch)               # expand\n        best = max(best, right - left + 1)\n    return best  # O(n) time",
    },
    pitfalls: [
      "Using a window on non-contiguous problems, where it does not apply.",
      "Forgetting to update state when shrinking the window.",
      "Skipping duplicate handling in 3Sum, producing repeated triplets.",
    ],
    check: [
      { q: "Why is a sliding window O(n) despite the inner while loop?", a: "Each index is added once and removed at most once, so total work is linear." },
      { q: "In Container With Most Water, which pointer moves?", a: "The shorter line, because moving the taller one can never increase the area." },
    ],
  },

  "dsa/stacks": {
    summary:
      "A stack is last-in, first-out and a queue is first-in, first-out. A monotonic stack keeps elements in sorted order to find the next greater or smaller element in O(n).",
    visuals: [
      {
        type: "flow",
        title: "Monotonic stack: next warmer day",
        steps: [
          { label: "Scan left to right", detail: "Stack holds indexes of unresolved days" },
          { label: "Pop while warmer", detail: "Current temp beats the top: top found its answer" },
          { label: "Record the gap", detail: "answer[j] = i - j for each popped j" },
          { label: "Push current index", detail: "It waits for its own warmer day" },
          { label: "Leftovers get 0", detail: "No warmer day ever came" },
        ],
      },
      {
        type: "compare",
        title: "Stack vs queue",
        columns: [
          { title: "Stack (LIFO)", points: ["push and pop at the top", "Undo, brackets, DFS", "Python list, Java ArrayDeque"] },
          { title: "Queue (FIFO)", points: ["Add at back, remove at front", "BFS, task scheduling", "Python deque, Java ArrayDeque"] },
        ],
      },
    ],
    keyPoints: [
      "Valid Parentheses: push openers, pop and match on closers, stack empty at the end.",
      "Monotonic stack problems are O(n) because each index is pushed and popped once.",
      "Min Stack stores the current minimum alongside each pushed value.",
      "Use collections.deque for queues; list.pop(0) is O(n).",
    ],
    terms: [
      { term: "LIFO", meaning: "Last in, first out: the newest item leaves first." },
      { term: "FIFO", meaning: "First in, first out: the oldest item leaves first." },
      { term: "Monotonic stack", meaning: "Stack kept in increasing or decreasing order." },
      { term: "Deque", meaning: "Double-ended queue with fast operations at both ends." },
    ],
    example: {
      lang: "python",
      code: "def daily_temperatures(temps):\n    ans = [0] * len(temps)\n    stack = []  # indexes with decreasing temps\n    for i, t in enumerate(temps):\n        while stack and temps[stack[-1]] < t:\n            j = stack.pop()\n            ans[j] = i - j\n        stack.append(i)\n    return ans  # O(n) time, O(n) space",
    },
    pitfalls: [
      "Popping from an empty stack; check before popping.",
      "Storing values when you need indexes to compute distances.",
      "Using a list as a queue with pop(0).",
    ],
    check: [
      { q: "Why does a monotonic stack give O(n)?", a: "Each index is pushed once and popped at most once, so total operations are linear." },
      { q: "How does Min Stack return the minimum in O(1)?", a: "Each entry stores the minimum at that point, so the top always knows the current minimum." },
    ],
  },

  "dsa/linked-lists": {
    summary:
      "A linked list is a chain of nodes where each points to the next. Problems test pointer rewiring without losing nodes, often using a dummy head or fast and slow pointers.",
    visuals: [
      {
        type: "flow",
        title: "Reverse a list in place",
        steps: [
          { label: "Start: prev = None", detail: "cur = head; nothing reversed yet" },
          { label: "Save next", detail: "nxt = cur.next so the rest is not lost" },
          { label: "Flip the pointer", detail: "cur.next = prev" },
          { label: "Advance both", detail: "prev = cur, cur = nxt" },
          { label: "Return prev", detail: "prev is the new head when cur is None" },
        ],
      },
      {
        type: "compare",
        title: "Two helper techniques",
        columns: [
          { title: "Dummy head", points: ["Fake node before the real head", "No special case for the first node", "Return dummy.next", "Merge lists, remove nodes"] },
          { title: "Fast and slow pointers", points: ["Fast moves 2, slow moves 1", "They meet if there is a cycle", "Slow ends at the middle", "Cycle detection, find middle"] },
        ],
      },
    ],
    keyPoints: [
      "Reversal is O(n) time and O(1) space when done in place.",
      "Fast and slow pointers detect a cycle in O(n) time and O(1) space.",
      "To remove the Nth node from the end, move one pointer n steps ahead first.",
      "Draw the boxes and arrows before coding; most bugs are lost references.",
    ],
    terms: [
      { term: "Node", meaning: "Holds a value and a reference to the next node." },
      { term: "Head", meaning: "The first node in the list." },
      { term: "Dummy node", meaning: "Placeholder before head that simplifies edge cases." },
      { term: "Floyd's algorithm", meaning: "Tortoise and hare cycle detection." },
    ],
    example: {
      lang: "python",
      code: "def reverse(head):\n    prev, cur = None, head\n    while cur:\n        nxt = cur.next\n        cur.next = prev\n        prev, cur = cur, nxt\n    return prev\n\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast:\n            return True\n    return False",
    },
    pitfalls: [
      "Overwriting cur.next before saving it, losing the rest of the list.",
      "Not checking fast.next before fast.next.next.",
      "Forgetting the empty-list and single-node cases.",
    ],
    check: [
      { q: "Why use a dummy head when merging lists?", a: "It gives a fixed starting node, so you never special-case which list provides the first node." },
      { q: "How do fast and slow pointers find the middle?", a: "Fast moves two steps per one for slow, so slow is at the middle when fast reaches the end." },
    ],
  },

  "dsa/binary-search": {
    summary:
      "Binary search halves a sorted range each step to find a target in O(log n). It also works on any yes/no condition that flips once, such as finding the smallest speed that is fast enough.",
    visuals: [
      {
        type: "flow",
        title: "First-true binary search template",
        steps: [
          { label: "Set lo and hi", detail: "Range that surely contains the answer" },
          { label: "Take mid", detail: "mid = (lo + hi) // 2" },
          { label: "Test condition", detail: "Is ok(mid) true?" },
          { label: "Narrow the range", detail: "True: hi = mid. False: lo = mid + 1" },
          { label: "Return lo", detail: "Loop ends when lo == hi: first true value" },
        ],
      },
      {
        type: "compare",
        title: "Search the array vs search the answer",
        columns: [
          { title: "On sorted data", points: ["Range is array indexes", "Condition: nums[mid] >= target", "First and last position", "Rotated sorted array"] },
          { title: "On the answer", points: ["Range is possible answers", "Condition: is answer k feasible?", "Must be monotonic in k", "Koko Eating Bananas"] },
        ],
      },
    ],
    keyPoints: [
      "Binary search runs in O(log n) because each step halves the range.",
      "Use one template (first index where the condition is true) and adapt the condition.",
      "On the answer: total cost is O(log range) times the cost of one feasibility check.",
      "For rotated arrays, one half is always sorted; check whether the target lies in it.",
    ],
    terms: [
      { term: "Monotonic", meaning: "Once the condition becomes true it stays true." },
      { term: "Search space", meaning: "The lo to hi range still being considered." },
      { term: "Lower bound", meaning: "First index whose value is at least the target." },
      { term: "Feasibility check", meaning: "Function testing whether a candidate answer works." },
    ],
    example: {
      lang: "python",
      code: "def first_true(lo, hi, ok):\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if ok(mid):\n            hi = mid\n        else:\n            lo = mid + 1\n    return lo\n\ndef min_eating_speed(piles, h):  # Koko Eating Bananas\n    hours = lambda k: sum((p + k - 1) // k for p in piles)\n    return first_true(1, max(piles), lambda k: hours(k) <= h)",
      caption: "O(n log m), where m is the largest pile.",
    },
    pitfalls: [
      "Using while lo <= hi with hi = mid, which loops forever.",
      "Mixing templates and getting off-by-one results.",
      "Applying it to a condition that is not monotonic.",
    ],
    check: [
      { q: "What property makes binary search on the answer valid?", a: "Feasibility is monotonic: if speed k works, every faster speed works too." },
      { q: "What is the complexity of Koko Eating Bananas with binary search?", a: "O(n log m): log m speeds tried, each checked in O(n)." },
    ],
  },

  "dsa/recursion": {
    summary:
      "Recursion solves a problem by calling itself on smaller inputs until a base case. Backtracking uses recursion to build candidates step by step, undoing each choice to try the next.",
    visuals: [
      {
        type: "flow",
        title: "Backtracking template",
        steps: [
          { label: "Base case", detail: "Candidate complete? Record a copy and return" },
          { label: "Choose", detail: "Add one option to the current path" },
          { label: "Explore", detail: "Recurse on the remaining problem" },
          { label: "Unchoose", detail: "Remove the option to restore state" },
          { label: "Prune", detail: "Skip options that cannot lead to a valid answer" },
        ],
      },
      {
        type: "tree",
        title: "Recursion tree: subsets of [1, 2]",
        root: "start: []",
        children: [
          { label: "take 1: [1]", children: ["take 2: [1, 2]", "skip 2: [1]"] },
          { label: "skip 1: []", children: ["take 2: [2]", "skip 2: []"] },
        ],
      },
    ],
    keyPoints: [
      "Every recursive function needs a base case that stops further calls.",
      "Subsets are O(2^n) and permutations O(n!), times the cost of copying each result.",
      "Pruning early, such as stopping when a sum exceeds the target, saves huge work.",
      "Append a copy of the path; appending the path itself stores a reference that keeps changing.",
    ],
    terms: [
      { term: "Base case", meaning: "Input small enough to answer without recursing." },
      { term: "Call stack", meaning: "Frames of active function calls waiting to return." },
      { term: "Backtracking", meaning: "Try a choice, recurse, then undo it." },
      { term: "Pruning", meaning: "Cutting off branches that cannot succeed." },
      { term: "State space", meaning: "All partial candidates the search could visit." },
    ],
    example: {
      lang: "python",
      code: "def subsets(nums):\n    res, path = [], []\n    def backtrack(i):\n        if i == len(nums):\n            res.append(path[:])   # copy!\n            return\n        path.append(nums[i])      # choose\n        backtrack(i + 1)          # explore\n        path.pop()                # unchoose\n        backtrack(i + 1)          # skip nums[i]\n    backtrack(0)\n    return res  # O(n * 2^n)",
    },
    pitfalls: [
      "Missing or wrong base case, causing infinite recursion.",
      "Appending path instead of path[:] to results.",
      "Forgetting to undo a choice, leaking state into sibling branches.",
    ],
    check: [
      { q: "How many subsets does a set of n elements have?", a: "2^n, because each element is either taken or skipped." },
      { q: "Why must you undo a choice in backtracking?", a: "The path is shared, so sibling branches must start from the same state as before the choice." },
    ],
  },

  "dsa/trees": {
    summary:
      "Tree problems are mostly about traversal: depth-first with recursion or breadth-first with a queue. In a binary search tree, every left value is smaller and every right value larger than the node.",
    visuals: [
      {
        type: "flow",
        title: "Recursive DFS template",
        steps: [
          { label: "Base case", detail: "Node is None: return a neutral value" },
          { label: "Solve left", detail: "Recurse into the left subtree" },
          { label: "Solve right", detail: "Recurse into the right subtree" },
          { label: "Combine", detail: "e.g. 1 + max(left, right) for depth" },
          { label: "Return upward", detail: "Parent uses this result" },
        ],
      },
      {
        type: "compare",
        title: "DFS vs BFS on trees",
        columns: [
          { title: "DFS", points: ["Recursion or explicit stack", "Preorder, inorder, postorder", "Path sums, depth, LCA", "Space O(height)"] },
          { title: "BFS", points: ["Queue, level by level", "Level order traversal", "Shortest depth, right side view", "Space O(widest level)"] },
        ],
      },
    ],
    keyPoints: [
      "Most traversals are O(n) time, since each node is visited once.",
      "Inorder traversal of a BST yields values in sorted order.",
      "Validate a BST by passing allowed min and max bounds down, not just comparing children.",
      "Recursion depth equals tree height: O(log n) if balanced, O(n) if skewed.",
    ],
    terms: [
      { term: "Root", meaning: "Top node with no parent." },
      { term: "Leaf", meaning: "Node with no children." },
      { term: "Height", meaning: "Number of edges on the longest root-to-leaf path." },
      { term: "BST", meaning: "Binary tree with left < node < right everywhere." },
      { term: "LCA", meaning: "Lowest common ancestor of two nodes." },
    ],
    example: {
      lang: "python",
      code: "def max_depth(root):\n    if not root:\n        return 0\n    return 1 + max(max_depth(root.left), max_depth(root.right))\n\ndef is_valid_bst(node, lo=float('-inf'), hi=float('inf')):\n    if not node:\n        return True\n    if not (lo < node.val < hi):\n        return False\n    return (is_valid_bst(node.left, lo, node.val) and\n            is_valid_bst(node.right, node.val, hi))",
    },
    pitfalls: [
      "Checking only node.left.val < node.val, which misses violations deeper down.",
      "Forgetting the empty tree case.",
      "Assuming a tree is balanced when stating recursion space.",
    ],
    check: [
      { q: "Why is checking each node against its children not enough to validate a BST?", a: "A deep node can satisfy its parent but violate an ancestor's bound, so you must pass ranges down." },
      { q: "Which traversal gives level order?", a: "BFS with a queue, processing one level at a time." },
    ],
  },

  "dsa/heaps": {
    summary:
      "A heap always keeps the smallest (or largest) element at the top, with O(log n) insert and remove. It is the go-to structure for top-k, k-th largest and merge-k problems.",
    visuals: [
      {
        type: "flow",
        title: "Top-k with a size-k min-heap",
        steps: [
          { label: "Push each item", detail: "heappush costs O(log k)" },
          { label: "Too big? Pop", detail: "If size exceeds k, remove the smallest" },
          { label: "Heap holds top k", detail: "Only the k largest survive" },
          { label: "Read the root", detail: "heap[0] is the k-th largest" },
        ],
      },
      {
        type: "tree",
        title: "A min-heap viewed as a tree",
        root: "1 (smallest at root)",
        children: [
          { label: "3", children: ["5", "4"] },
          { label: "2", children: ["8"] },
        ],
      },
    ],
    keyPoints: [
      "Push and pop are O(log n); peeking the top is O(1); heapify is O(n).",
      "Top-k with a size-k heap costs O(n log k), better than sorting when k is small.",
      "Python heapq is a min-heap; negate values to simulate a max-heap.",
      "In Java, new PriorityQueue<>(Comparator.reverseOrder()) gives a max-heap.",
    ],
    terms: [
      { term: "Heap", meaning: "Complete binary tree where each parent is at most its children (min-heap)." },
      { term: "Priority queue", meaning: "Queue that always serves the highest-priority item." },
      { term: "Heapify", meaning: "Turning an array into a heap in O(n)." },
      { term: "Comparator", meaning: "Function deciding the order of two items." },
    ],
    example: {
      lang: "python",
      code: "import heapq\n\ndef kth_largest(nums, k):\n    heap = []\n    for x in nums:\n        heapq.heappush(heap, x)\n        if len(heap) > k:\n            heapq.heappop(heap)  # drop the smallest\n    return heap[0]  # O(n log k)\n\n# Java: PriorityQueue<Integer> pq = new PriorityQueue<>();",
    },
    pitfalls: [
      "Using a max-heap of all n items when a size-k min-heap suffices.",
      "Assuming the heap list is fully sorted; only the root is guaranteed.",
      "Pushing tuples with uncomparable second items in Python.",
    ],
    check: [
      { q: "Why use a min-heap to find the k largest elements?", a: "The root is the smallest of the current top k, so it is the one to evict when a bigger item arrives." },
      { q: "What is the cost of Merge K Sorted Lists with a heap?", a: "O(N log k), where N is the total number of nodes and k the number of lists." },
    ],
  },

  "dsa/graphs": {
    summary:
      "A graph is nodes connected by edges, stored as an adjacency list. BFS finds fewest-edge paths, DFS explores components, topological sort orders dependencies and Dijkstra handles weighted shortest paths.",
    visuals: [
      {
        type: "flow",
        title: "BFS template",
        steps: [
          { label: "Queue the start", detail: "Mark it seen with distance 0" },
          { label: "Pop the front", detail: "Process nodes in order of distance" },
          { label: "Visit neighbours", detail: "Skip any already seen" },
          { label: "Mark and enqueue", detail: "Mark when enqueued to avoid duplicates" },
          { label: "Repeat until empty", detail: "O(V + E) total" },
        ],
      },
      {
        type: "compare",
        title: "Which graph algorithm?",
        columns: [
          { title: "BFS", points: ["Queue", "Fewest edges, unweighted", "Grids, word ladders", "O(V + E)"] },
          { title: "DFS / topo sort", points: ["Stack or recursion", "Components, cycles, ordering", "Islands, Course Schedule", "O(V + E)"] },
          { title: "Dijkstra", points: ["Min-heap of distances", "Weighted, non-negative edges", "Network Delay Time", "O(E log V)"] },
        ],
      },
    ],
    keyPoints: [
      "Build an adjacency list first; a grid is a graph whose neighbours are up, down, left, right.",
      "BFS and DFS both run in O(V + E) time with a seen set.",
      "Kahn's topological sort repeatedly takes nodes with in-degree 0; leftovers mean a cycle.",
      "Dijkstra needs non-negative weights and runs in O(E log V) with a heap.",
    ],
    terms: [
      { term: "Adjacency list", meaning: "Map from each node to its neighbours." },
      { term: "In-degree", meaning: "Number of edges pointing into a node." },
      { term: "Topological order", meaning: "Order where every edge goes from earlier to later." },
      { term: "Connected component", meaning: "Group of nodes all reachable from each other." },
      { term: "Weighted edge", meaning: "Edge with a cost, like distance or time." },
    ],
    example: {
      lang: "python",
      code: "from collections import deque\n\ndef bfs(graph, start):\n    dist = {start: 0}\n    queue = deque([start])\n    while queue:\n        node = queue.popleft()\n        for nxt in graph[node]:\n            if nxt not in dist:\n                dist[nxt] = dist[node] + 1\n                queue.append(nxt)\n    return dist  # fewest edges from start to each node",
    },
    pitfalls: [
      "Marking nodes seen when popped instead of when pushed, adding duplicates.",
      "Using BFS for weighted shortest paths.",
      "Forgetting disconnected parts: loop over every node as a possible start.",
    ],
    check: [
      { q: "Why does BFS find the fewest-edge path?", a: "It visits nodes in order of distance, so the first time it reaches a node is via the shortest path." },
      { q: "How does Kahn's algorithm detect a cycle?", a: "If fewer than all nodes get processed, the rest never reached in-degree 0, so a cycle exists." },
    ],
  },

  "dsa/dp": {
    summary:
      "Dynamic programming solves problems with overlapping subproblems by storing each answer once. You define a state, write how it depends on smaller states, then compute with memoisation or a table.",
    visuals: [
      {
        type: "flow",
        title: "From recursion to tabulation",
        steps: [
          { label: "Define the state", detail: "dp[a] = fewest coins to make amount a" },
          { label: "Write the transition", detail: "dp[a] = min over coins of dp[a - c] + 1" },
          { label: "Set base cases", detail: "dp[0] = 0" },
          { label: "Memoise", detail: "Cache recursive results to avoid repeats" },
          { label: "Tabulate", detail: "Fill the table bottom-up in dependency order" },
          { label: "Optimise space", detail: "Keep only rows or values still needed" },
        ],
      },
      {
        type: "compare",
        title: "Memoisation vs tabulation",
        columns: [
          { title: "Memoisation (top-down)", points: ["Recursion plus a cache", "Computes only needed states", "Easy to derive from brute force", "Recursion depth limits"] },
          { title: "Tabulation (bottom-up)", points: ["Loops fill a table", "Computes all states in order", "No recursion overhead", "Easier to optimise space"] },
        ],
      },
    ],
    keyPoints: [
      "Complexity is the number of states times the work per state.",
      "Coin Change is O(amount x coins) time and O(amount) space.",
      "2D problems like LCS and Unique Paths use a grid indexed by two positions.",
      "If brute-force recursion recomputes the same arguments, DP probably applies.",
    ],
    terms: [
      { term: "State", meaning: "Parameters that describe one subproblem." },
      { term: "Transition", meaning: "Formula linking a state to smaller states." },
      { term: "Memoisation", meaning: "Caching results of recursive calls." },
      { term: "Tabulation", meaning: "Filling a DP table iteratively from base cases." },
      { term: "Overlapping subproblems", meaning: "The same subproblem appears many times." },
    ],
    example: {
      lang: "python",
      code: "from functools import cache\n\n@cache\ndef climb(n):  # Climbing Stairs, memoised\n    return 1 if n <= 1 else climb(n - 1) + climb(n - 2)\n\ndef coin_change(coins, amount):  # tabulation\n    INF = amount + 1\n    dp = [0] + [INF] * amount  # dp[a] = fewest coins for a\n    for a in range(1, amount + 1):\n        for c in coins:\n            if c <= a:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != INF else -1",
    },
    pitfalls: [
      "Starting to code before writing the state and transition in words.",
      "Wrong base cases, such as dp[0] = 1 when counting minimum coins.",
      "Filling the table in an order where dependencies are not yet computed.",
    ],
    check: [
      { q: "How do you find the complexity of a DP solution?", a: "Multiply the number of states by the work done per state." },
      { q: "What signals that a problem needs DP?", a: "An optimal or counting question whose brute-force recursion repeats the same subproblems." },
    ],
  },

  "dsa/greedy": {
    summary:
      "A greedy algorithm makes the locally best choice at each step and never revisits it. It is fast and simple, but only correct when a local choice can be proven safe; intervals are the classic case.",
    visuals: [
      {
        type: "flow",
        title: "Merge intervals",
        steps: [
          { label: "Sort by start", detail: "O(n log n), overlapping intervals become adjacent" },
          { label: "Take the first", detail: "It starts the output list" },
          { label: "Overlaps last?", detail: "start <= end of the last merged interval" },
          { label: "Extend or append", detail: "Overlap: extend end. Otherwise: new interval" },
          { label: "Return merged", detail: "One pass after sorting" },
        ],
      },
      {
        type: "compare",
        title: "Greedy vs dynamic programming",
        columns: [
          { title: "Greedy", points: ["One choice per step, no going back", "Often sort then scan", "Needs a proof it is safe", "Usually O(n log n) or O(n)"] },
          { title: "Dynamic programming", points: ["Considers all choices per state", "Stores subproblem answers", "Always correct if states are right", "Usually slower"] },
        ],
      },
    ],
    keyPoints: [
      "Sort intervals by start to merge, or by end to pick the most non-overlapping ones.",
      "Non-overlapping Intervals: keep the interval that ends first, remove the others.",
      "Jump Game: track the farthest reachable index in one O(n) pass.",
      "Test greedy ideas on small counterexamples; Coin Change with odd coins breaks greedy.",
    ],
    terms: [
      { term: "Greedy choice", meaning: "The locally best option taken at each step." },
      { term: "Exchange argument", meaning: "Proof that swapping in the greedy choice never hurts." },
      { term: "Interval", meaning: "A [start, end] range." },
      { term: "Overlap", meaning: "Two intervals sharing at least one point." },
    ],
    example: {
      lang: "python",
      code: "def merge(intervals):\n    intervals.sort(key=lambda iv: iv[0])\n    out = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= out[-1][1]:            # overlaps\n            out[-1][1] = max(out[-1][1], end)\n        else:\n            out.append([start, end])\n    return out  # O(n log n) for the sort",
    },
    pitfalls: [
      "Using greedy without checking a counterexample.",
      "Sorting by the wrong key for the problem.",
      "Forgetting max() when extending, so a contained interval shrinks the end.",
    ],
    check: [
      { q: "Why sort by end time in interval scheduling?", a: "Finishing earliest leaves the most room for later intervals, which the exchange argument proves optimal." },
      { q: "Why does greedy fail for coins [1, 3, 4] and amount 6?", a: "Greedy takes 4+1+1 (three coins), but 3+3 uses only two." },
    ],
  },

  "dsa/tries": {
    summary:
      "A trie stores words character by character so all words sharing a prefix share a path. Union-find tracks which items are connected, merging groups in nearly constant time.",
    visuals: [
      {
        type: "tree",
        title: "Trie holding car, cat, dog",
        root: "(root)",
        children: [
          { label: "c then a", children: ["r (end of car)", "t (end of cat)"] },
          { label: "d then o", children: ["g (end of dog)"] },
        ],
      },
      {
        type: "flow",
        title: "Union-find steps",
        steps: [
          { label: "Each node alone", detail: "parent[i] = i, every node its own root" },
          { label: "find(x)", detail: "Follow parents to the root, compressing the path" },
          { label: "union(a, b)", detail: "Attach the smaller root under the larger" },
          { label: "Same root?", detail: "Then a and b are connected" },
        ],
      },
    ],
    keyPoints: [
      "Trie insert and search cost O(L), where L is the word length.",
      "Use a trie for prefix queries and Word Search II to prune the board search.",
      "Union-find with path compression and union by size is almost O(1) per operation.",
      "Count connected components as n minus the number of successful unions.",
    ],
    terms: [
      { term: "Trie", meaning: "Prefix tree where each edge is one character." },
      { term: "End marker", meaning: "Flag showing a complete word ends at this node." },
      { term: "Union-find", meaning: "Structure tracking disjoint sets; also called DSU." },
      { term: "Path compression", meaning: "Pointing nodes closer to the root during find." },
      { term: "Union by size", meaning: "Attach the smaller tree under the larger one." },
    ],
    example: {
      lang: "python",
      code: "class Trie:\n    def __init__(self):\n        self.root = {}\n    def insert(self, word):\n        node = self.root\n        for ch in word:\n            node = node.setdefault(ch, {})\n        node['$'] = True  # end-of-word marker\n    def search(self, word, prefix=False):\n        node = self.root\n        for ch in word:\n            if ch not in node:\n                return False\n            node = node[ch]\n        return prefix or '$' in node",
      caption: "search(w, prefix=True) answers startsWith.",
    },
    pitfalls: [
      "Forgetting the end marker, so prefixes count as words.",
      "Union-find without path compression, degrading to O(n) finds.",
      "Unioning nodes instead of their roots.",
    ],
    check: [
      { q: "Why is a trie good for prefix search?", a: "All words with a prefix share one path, so you walk L characters instead of scanning every word." },
      { q: "How do you know two nodes are connected in union-find?", a: "find returns the same root for both." },
    ],
  },

  "system-design/sd-basics": {
    summary:
      "System design interviews test how you scale a service and reason about trade-offs. The core ideas are horizontal scaling behind load balancers, and the consistency versus availability choice described by CAP.",
    visuals: [
      {
        type: "flow",
        title: "A design interview framework",
        steps: [
          { label: "Clarify requirements", detail: "Functional features and non-functional goals" },
          { label: "Estimate scale", detail: "Users, requests per second, storage" },
          { label: "API and data model", detail: "Key endpoints and main tables" },
          { label: "High-level design", detail: "Clients, load balancer, services, stores" },
          { label: "Deep dive", detail: "Bottlenecks, scaling, failure handling" },
          { label: "Trade-offs", detail: "What you chose, why, and alternatives" },
        ],
      },
      {
        type: "compare",
        title: "Vertical vs horizontal scaling",
        columns: [
          { title: "Vertical (scale up)", points: ["Bigger machine", "Simple, no code changes", "Hard upper limit", "Single point of failure"] },
          { title: "Horizontal (scale out)", points: ["More machines behind a load balancer", "Near-unlimited capacity", "Needs stateless services", "Survives a machine failing"] },
        ],
      },
    ],
    keyPoints: [
      "Keep app servers stateless so any server can handle any request.",
      "Load balancers spread traffic with round robin, least connections or hashing.",
      "CAP: during a network partition you choose consistency or availability.",
      "Do quick estimates: about 100k seconds per day turns daily totals into per-second rates.",
    ],
    terms: [
      { term: "Load balancer", meaning: "Distributes requests across many servers." },
      { term: "Stateless", meaning: "Server keeps no client session data between requests." },
      { term: "CAP theorem", meaning: "Under partition, pick consistency or availability." },
      { term: "Eventual consistency", meaning: "Replicas agree after a short delay." },
      { term: "QPS", meaning: "Queries per second, a traffic measure." },
    ],
    example: {
      lang: "text",
      code: "Back-of-envelope: photo app\n100M daily users x 10 views = 1B reads/day\n1B / ~100k seconds = ~10k reads/s, peak ~30k/s\n1M uploads/day x 2 MB = 2 TB/day of storage\n2 TB x 365 = ~730 TB/year -> object storage + CDN",
    },
    pitfalls: [
      "Jumping into components before clarifying requirements.",
      "Ignoring estimates, then choosing the wrong storage scale.",
      "Naming technologies without explaining the trade-off.",
    ],
    check: [
      { q: "Why must servers be stateless to scale horizontally?", a: "So the load balancer can send any request to any server without losing session data." },
      { q: "What does CAP force you to choose during a partition?", a: "Either reject some requests to stay consistent, or answer with possibly stale data to stay available." },
    ],
  },

  "system-design/sd-data": {
    summary:
      "Data choices dominate system design: which database, how to cache, how to copy data for reads and how to split it across machines. Each choice trades latency, consistency and complexity.",
    visuals: [
      {
        type: "compare",
        title: "SQL vs NoSQL",
        columns: [
          { title: "SQL (relational)", points: ["Tables with a fixed schema", "Joins and ACID transactions", "Scale reads with replicas", "Orders, payments, users"] },
          { title: "NoSQL", points: ["Key-value, document, wide-column", "Flexible schema", "Built-in horizontal scaling", "Feeds, sessions, huge event logs"] },
        ],
      },
      {
        type: "sequence",
        title: "Leader-follower replication",
        actors: ["Client", "Leader", "Follower"],
        messages: [
          { from: 0, to: 1, label: "write: update profile" },
          { from: 1, to: 0, label: "ack after local commit" },
          { from: 1, to: 2, label: "replicate change log (async)" },
          { from: 0, to: 2, label: "read profile" },
          { from: 2, to: 0, label: "maybe stale until caught up" },
        ],
      },
    ],
    keyPoints: [
      "Cache-aside reads the cache first and fills it on a miss; write-through updates both on writes.",
      "Replicas scale reads and add redundancy, but async replicas can serve stale data.",
      "Sharding splits data by a key; consistent hashing moves few keys when nodes change.",
      "Pick a shard key that spreads load evenly and keeps related data together.",
    ],
    terms: [
      { term: "Replication", meaning: "Keeping copies of data on several machines." },
      { term: "Sharding", meaning: "Splitting data across machines by a key." },
      { term: "Consistent hashing", meaning: "Hash ring that remaps only nearby keys when nodes change." },
      { term: "Replication lag", meaning: "Delay before a follower sees the leader's writes." },
      { term: "Hot shard", meaning: "One shard getting far more traffic than others." },
    ],
    example: {
      lang: "python",
      code: "import bisect, hashlib\n\ndef h(key):\n    return int(hashlib.md5(key.encode()).hexdigest(), 16)\n\nclass Ring:\n    def __init__(self, nodes, vnodes=100):\n        self.ring = sorted((h(f'{n}#{i}'), n) for n in nodes for i in range(vnodes))\n        self.keys = [k for k, _ in self.ring]\n    def node_for(self, key):\n        i = bisect.bisect(self.keys, h(key)) % len(self.ring)\n        return self.ring[i][1]\n\n# Ring(['db1', 'db2', 'db3']).node_for('user:42')",
      caption: "Virtual nodes spread each server around the ring for even load.",
    },
    pitfalls: [
      "Sharding by a key like country, creating hot shards.",
      "Reading your own write from a lagging replica.",
      "Adding a cache without an invalidation plan.",
    ],
    check: [
      { q: "Why use consistent hashing instead of hash mod N?", a: "With mod N, changing N remaps almost every key; a hash ring moves only about 1/N of them." },
      { q: "What is the downside of async replication?", a: "Followers can lag, so reads from them may return stale data." },
    ],
  },

  "system-design/sd-async": {
    summary:
      "Queues let a service accept work quickly and process it later in background workers. Rate limiting protects services from overload by capping how many requests each client can make.",
    visuals: [
      {
        type: "sequence",
        title: "Async processing with a queue",
        actors: ["Client", "API", "Queue", "Worker"],
        messages: [
          { from: 0, to: 1, label: "POST /videos (upload)" },
          { from: 1, to: 2, label: "enqueue transcode job 17" },
          { from: 1, to: 0, label: "202 Accepted, job 17" },
          { from: 2, to: 3, label: "deliver job 17" },
          { from: 3, to: 2, label: "ack after success" },
          { from: 0, to: 1, label: "GET /jobs/17: done" },
        ],
      },
      {
        type: "compare",
        title: "Token bucket vs leaky bucket",
        columns: [
          { title: "Token bucket", points: ["Tokens refill at a fixed rate", "Each request spends one token", "Allows short bursts", "Common for API limits"] },
          { title: "Leaky bucket", points: ["Requests queue in a bucket", "Drained at a constant rate", "Smooths bursts out", "Overflow is rejected"] },
        ],
      },
    ],
    keyPoints: [
      "Queues decouple producers from consumers and absorb traffic spikes.",
      "Most queues deliver at least once, so workers must be idempotent.",
      "Retry with backoff, then move repeat failures to a dead-letter queue.",
      "Rate limit per user or API key and return 429 Too Many Requests.",
    ],
    terms: [
      { term: "Message queue", meaning: "Buffer holding tasks until a worker takes them." },
      { term: "Idempotent", meaning: "Running it twice has the same effect as once." },
      { term: "Backoff", meaning: "Waiting longer between each retry." },
      { term: "Dead-letter queue", meaning: "Holds messages that kept failing." },
      { term: "Rate limiter", meaning: "Caps requests per client per time window." },
    ],
    example: {
      lang: "python",
      code: "import time\n\nclass TokenBucket:\n    def __init__(self, rate, capacity):\n        self.rate, self.capacity = rate, capacity\n        self.tokens, self.last = capacity, time.monotonic()\n\n    def allow(self):\n        now = time.monotonic()\n        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)\n        self.last = now\n        if self.tokens >= 1:\n            self.tokens -= 1\n            return True\n        return False  # caller returns HTTP 429",
    },
    pitfalls: [
      "Workers that charge or email twice when a message is redelivered.",
      "Retrying instantly in a tight loop, worsening an outage.",
      "Rate limiting in each server's memory when traffic is spread across many servers.",
    ],
    check: [
      { q: "Why must queue workers be idempotent?", a: "Messages can be delivered more than once, so repeated processing must not cause duplicate effects." },
      { q: "Which rate limiter allows short bursts?", a: "Token bucket, because saved-up tokens can be spent at once." },
    ],
  },

  "system-design/sd-practice": {
    summary:
      "Practice applies the framework to classic prompts like a URL shortener, chat, news feed and rate limiter. The goal is a clear 45-minute walk from requirements to a defended design.",
    visuals: [
      {
        type: "layers",
        title: "URL shortener design",
        layers: [
          { label: "Clients", detail: "POST long URL, GET short code" },
          { label: "Load balancer", detail: "Spreads traffic over app servers" },
          { label: "Stateless app servers", detail: "Generate codes, return 301 or 302 redirects" },
          { label: "Redis cache", detail: "Hot code to URL lookups, read-heavy" },
          { label: "Key-value database", detail: "code to long URL, sharded by code" },
        ],
      },
      {
        type: "flow",
        title: "45-minute timeline",
        steps: [
          { label: "Requirements: 5 min", detail: "Features, scale, read/write ratio" },
          { label: "Estimates: 5 min", detail: "QPS and storage" },
          { label: "API and data: 5 min", detail: "Endpoints and schema" },
          { label: "High level: 10 min", detail: "Draw the boxes and data flow" },
          { label: "Deep dive: 15 min", detail: "Bottlenecks, scaling, failures" },
          { label: "Wrap up: 5 min", detail: "Trade-offs and next steps" },
        ],
      },
    ],
    keyPoints: [
      "URL shortener: unique id from a counter or ID service, encoded in base62.",
      "Chat: WebSockets for live delivery, store messages per conversation, track presence.",
      "News feed: fan-out on write for most users, fan-out on read for celebrities.",
      "Rate limiter: token bucket counters in Redis shared by all servers.",
    ],
    terms: [
      { term: "Base62", meaning: "Encoding with 0-9, a-z, A-Z to make short codes." },
      { term: "Fan-out on write", meaning: "Push a new post into followers' feeds when created." },
      { term: "Fan-out on read", meaning: "Build the feed when the user opens it." },
      { term: "WebSocket", meaning: "Persistent two-way connection for real-time messages." },
      { term: "CDN", meaning: "Edge servers caching static content near users." },
    ],
    example: {
      lang: "python",
      code: "ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'\n\ndef base62(n):\n    if n == 0:\n        return ALPHABET[0]\n    out = []\n    while n:\n        n, r = divmod(n, 62)\n        out.append(ALPHABET[r])\n    return ''.join(reversed(out))\n\n# base62(125) -> '21'; 7 chars cover 62^7, about 3.5 trillion ids",
    },
    pitfalls: [
      "Spending 20 minutes on requirements and never reaching a design.",
      "Drawing boxes without saying what data flows between them.",
      "Not practising out loud under a timer.",
    ],
    check: [
      { q: "How many URLs can 7 base62 characters represent?", a: "62^7, about 3.5 trillion." },
      { q: "Why not fan out on write for a celebrity's posts?", a: "Writing to millions of follower feeds per post is too slow; merge their posts at read time instead." },
    ],
  },

  "cs/os": {
    summary:
      "The operating system shares the CPU and memory among programs. Interviews ask about processes versus threads, scheduling, virtual memory and how deadlocks happen and are prevented.",
    visuals: [
      {
        type: "compare",
        title: "Process vs thread",
        columns: [
          { title: "Process", points: ["Own address space", "Isolated: a crash stays contained", "Heavier to create and switch", "Talk via pipes, sockets"] },
          { title: "Thread", points: ["Shares memory with its process", "Cheap to create and switch", "Needs locks for shared data", "One crash can kill all threads"] },
        ],
      },
      {
        type: "tree",
        title: "Deadlock needs all four conditions",
        root: "Deadlock",
        children: [
          { label: "Mutual exclusion", children: ["Resource held by one at a time"] },
          { label: "Hold and wait", children: ["Fix: request all locks up front"] },
          { label: "No preemption", children: ["Fix: tryLock with timeout, back off"] },
          { label: "Circular wait", children: ["Fix: always lock in a global order"] },
        ],
      },
    ],
    keyPoints: [
      "Context switches between threads are cheaper because memory mappings stay the same.",
      "Virtual memory gives each process its own address space, mapped to RAM in pages.",
      "A page fault loads a missing page from disk; too many cause thrashing.",
      "A mutex allows one holder; a counting semaphore allows up to N.",
    ],
    terms: [
      { term: "Process", meaning: "Running program with its own memory space." },
      { term: "Thread", meaning: "Unit of execution inside a process." },
      { term: "Context switch", meaning: "Saving one task's state and loading another's." },
      { term: "Paging", meaning: "Splitting memory into fixed-size pages mapped to frames." },
      { term: "Mutex", meaning: "Lock that only one thread can hold at a time." },
      { term: "Semaphore", meaning: "Counter that limits concurrent access to N holders." },
    ],
    example: {
      lang: "python",
      code: "import threading\naccount_lock = threading.Lock()\naudit_lock = threading.Lock()\n\n# Every thread takes locks in the SAME order: account, then audit.\n# This breaks the circular-wait condition, so no deadlock.\ndef transfer():\n    with account_lock:\n        with audit_lock:\n            pass  # update balance and audit log\n\ndef report():\n    with account_lock:\n        with audit_lock:\n            pass  # read both consistently",
    },
    pitfalls: [
      "Saying threads are always faster; CPU-bound Python threads are limited by the GIL.",
      "Listing deadlock conditions without a concrete prevention example.",
      "Confusing virtual memory with swap space.",
    ],
    check: [
      { q: "Name the four conditions for deadlock.", a: "Mutual exclusion, hold and wait, no preemption and circular wait." },
      { q: "Why is a thread switch cheaper than a process switch?", a: "Threads share an address space, so page tables and caches need not be swapped." },
    ],
  },

  "cs/cn": {
    summary:
      "Networking questions centre on how data travels reliably and securely. Knowing TCP vs UDP, DNS, HTTP and TLS lets you explain what happens when you type a URL.",
    visuals: [
      {
        type: "sequence",
        title: "What happens when you type a URL",
        actors: ["Browser", "DNS resolver", "Web server"],
        messages: [
          { from: 0, to: 1, label: "Where is example.com?" },
          { from: 1, to: 0, label: "93.184.215.14" },
          { from: 0, to: 2, label: "TCP SYN" },
          { from: 2, to: 0, label: "SYN-ACK" },
          { from: 0, to: 2, label: "ACK, then TLS ClientHello" },
          { from: 2, to: 0, label: "Certificate, keys agreed" },
          { from: 0, to: 2, label: "GET / over HTTPS" },
          { from: 2, to: 0, label: "200 OK with HTML" },
        ],
      },
      {
        type: "compare",
        title: "TCP vs UDP",
        columns: [
          { title: "TCP", points: ["Connection with 3-way handshake", "Reliable, ordered delivery", "Retransmits lost packets", "Web, email, databases"] },
          { title: "UDP", points: ["No connection setup", "No delivery or order guarantee", "Low latency, small overhead", "Video calls, games, DNS"] },
        ],
      },
    ],
    keyPoints: [
      "DNS resolves names via cache, then root, TLD and authoritative servers.",
      "TLS proves the server's identity with a certificate and sets up encryption keys.",
      "HTTP/2 multiplexes many requests on one connection; HTTP/3 runs over QUIC on UDP.",
      "Then the browser parses HTML and fetches CSS, JS and images, often from a CDN.",
    ],
    terms: [
      { term: "TCP", meaning: "Reliable, ordered, connection-based transport protocol." },
      { term: "UDP", meaning: "Fast, connectionless transport without delivery guarantees." },
      { term: "DNS", meaning: "System mapping domain names to IP addresses." },
      { term: "TLS", meaning: "Encryption and authentication layer used by HTTPS." },
      { term: "Handshake", meaning: "Opening exchange that sets up a connection." },
    ],
    example: {
      lang: "bash",
      code: "# Resolve a name and see the answer chain\ndig example.com +short\ndig example.com +trace\n\n# Watch TCP connect, TLS handshake and HTTP exchange\ncurl -v https://example.com -o /dev/null",
    },
    pitfalls: [
      "Skipping DNS or TLS when describing the URL journey.",
      "Saying UDP is unreliable so it is never used; DNS and video rely on it.",
      "Confusing HTTPS encryption with authentication of the user.",
    ],
    check: [
      { q: "What are the steps of the TCP handshake?", a: "Client sends SYN, server replies SYN-ACK, client sends ACK." },
      { q: "Why does video calling often use UDP?", a: "Low latency matters more than retransmitting a late frame that is already useless." },
    ],
  },

  "cs/dbms": {
    summary:
      "DBMS questions cover how databases keep data correct under concurrency and failure, and how they find rows fast. Key topics are ACID, isolation levels, B-tree indexes and normal forms.",
    visuals: [
      {
        type: "tree",
        title: "ACID properties",
        root: "ACID transaction",
        children: [
          { label: "Atomicity", children: ["All changes or none"] },
          { label: "Consistency", children: ["Constraints hold before and after"] },
          { label: "Isolation", children: ["Concurrent transactions do not interfere"] },
          { label: "Durability", children: ["Committed data survives a crash"] },
        ],
      },
      {
        type: "compare",
        title: "Isolation levels",
        columns: [
          { title: "Read committed", points: ["No dirty reads", "Non-repeatable reads possible", "Default in PostgreSQL"] },
          { title: "Repeatable read", points: ["Same row reads stay stable", "Phantoms possible in the SQL standard", "Default in MySQL InnoDB"] },
          { title: "Serializable", points: ["As if run one at a time", "No anomalies", "Slowest, may need retries"] },
        ],
      },
    ],
    keyPoints: [
      "Higher isolation prevents more anomalies but reduces concurrency.",
      "B-tree indexes give O(log n) lookups and support range queries and sorting.",
      "Indexes speed reads but slow writes and use extra storage.",
      "Normalise to remove redundancy; denormalise deliberately for read performance.",
    ],
    terms: [
      { term: "Dirty read", meaning: "Reading another transaction's uncommitted change." },
      { term: "Non-repeatable read", meaning: "Same row gives different values within one transaction." },
      { term: "Phantom read", meaning: "Re-running a query returns new rows." },
      { term: "B-tree", meaning: "Balanced tree index with sorted keys in pages." },
      { term: "Normal form", meaning: "Rule set for reducing redundancy, like 1NF to 3NF." },
    ],
    example: {
      lang: "sql",
      code: "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;  -- or ROLLBACK on error: both happen or neither\n\nCREATE INDEX idx_accounts_owner ON accounts (owner_id);\nEXPLAIN SELECT * FROM accounts WHERE owner_id = 7;",
    },
    pitfalls: [
      "Listing ACID without a concrete example such as a bank transfer.",
      "Claiming indexes are always good.",
      "Mixing up non-repeatable reads and phantom reads.",
    ],
    check: [
      { q: "What anomaly does read committed still allow?", a: "Non-repeatable reads: a row read twice in one transaction can change in between." },
      { q: "Why are B-trees used for indexes?", a: "They stay balanced, give O(log n) lookups, and keep keys sorted for range scans." },
    ],
  },

  "role/java-qs": {
    summary:
      "Java interviews probe internals: how HashMap works, equals and hashCode, thread safety, JVM memory and how Spring builds beans and proxies. Explain the why, not just the API.",
    visuals: [
      {
        type: "flow",
        title: "HashMap.put internals",
        steps: [
          { label: "Compute hashCode()", detail: "High bits mixed in to spread values" },
          { label: "Find bucket", detail: "index = hash & (capacity - 1)" },
          { label: "Empty bucket?", detail: "Store a new node directly" },
          { label: "Else compare keys", detail: "equals() match replaces value, else append" },
          { label: "Treeify long buckets", detail: "8+ nodes become a red-black tree" },
          { label: "Resize past 0.75", detail: "Double capacity and redistribute entries" },
        ],
      },
      {
        type: "compare",
        title: "Thread-safe map options",
        columns: [
          { title: "HashMap", points: ["Not thread-safe", "Allows one null key", "Fastest single-threaded"] },
          { title: "Collections.synchronizedMap", points: ["One lock for all operations", "Simple but contended", "Iterate inside synchronized block"] },
          { title: "ConcurrentHashMap", points: ["Fine-grained locking and CAS", "No null keys or values", "Atomic compute and merge"] },
        ],
      },
    ],
    keyPoints: [
      "Equal objects must have equal hash codes, or hash-based collections lose them.",
      "volatile gives visibility, not atomicity; use atomics or locks for compound updates.",
      "Spring wraps beans in proxies for @Transactional, so self-calls bypass it.",
      "Immutable objects are thread-safe by design: final fields, no setters, defensive copies.",
    ],
    terms: [
      { term: "hashCode contract", meaning: "a.equals(b) implies a.hashCode() == b.hashCode()." },
      { term: "volatile", meaning: "Makes writes to a field immediately visible to other threads." },
      { term: "CAS", meaning: "Compare-and-swap, an atomic CPU instruction behind atomics." },
      { term: "Dynamic proxy", meaning: "Runtime wrapper adding behaviour around a bean's methods." },
      { term: "Immutability", meaning: "Object state cannot change after construction." },
    ],
    example: {
      lang: "java",
      code: "final class Point {\n  private final int x, y;\n  Point(int x, int y) { this.x = x; this.y = y; }\n\n  @Override public boolean equals(Object o) {\n    return o instanceof Point p && p.x == x && p.y == y;\n  }\n  @Override public int hashCode() { return Objects.hash(x, y); }\n}\n// Without hashCode, map.get(new Point(1, 2)) can return null.\n// Shortcut: record Point(int x, int y) {} generates both.",
    },
    pitfalls: [
      "Saying HashMap lookups are always O(1) without mentioning collisions.",
      "Claiming volatile makes count++ safe.",
      "Not knowing why @Transactional fails on private or self-invoked methods.",
    ],
    check: [
      { q: "What happens if you override equals but not hashCode?", a: "Equal objects may land in different buckets, so HashMap and HashSet fail to find them." },
      { q: "Why doesn't ConcurrentHashMap allow null values?", a: "A null from get would be ambiguous between missing and stored null, which cannot be checked atomically." },
    ],
  },

  "role/devops-qs": {
    summary:
      "DevOps interviews are scenario-driven: debug a failing pod, design a pipeline, handle an outage. Show a calm, step-by-step method and explain the trade-offs of each tool.",
    visuals: [
      {
        type: "flow",
        title: "Debugging CrashLoopBackOff",
        steps: [
          { label: "kubectl get pods", detail: "See restarts and status" },
          { label: "kubectl describe pod", detail: "Events, exit code, OOMKilled, probe failures" },
          { label: "kubectl logs --previous", detail: "Logs from the crashed container" },
          { label: "Check config", detail: "Env vars, secrets, image tag, resource limits" },
          { label: "Fix or roll back", detail: "Redeploy, or kubectl rollout undo" },
        ],
      },
      {
        type: "compare",
        title: "Deployment strategies",
        columns: [
          { title: "Rolling", points: ["Replace pods gradually", "Kubernetes default", "Old and new versions mix briefly"] },
          { title: "Blue-green", points: ["Two full environments", "Switch traffic at once", "Instant rollback, double cost"] },
          { title: "Canary", points: ["Small % of traffic to new version", "Watch metrics, then widen", "Limits blast radius"] },
        ],
      },
    ],
    keyPoints: [
      "Docker images are stacks of cached layers; order Dockerfile steps from stable to changing.",
      "Exit code 137 usually means the container was OOMKilled.",
      "A good pipeline: lint, test, build image, scan, deploy to staging, then production.",
      "In outages, mitigate first (roll back), then find the root cause and write a postmortem.",
    ],
    terms: [
      { term: "CrashLoopBackOff", meaning: "Pod keeps crashing, and Kubernetes waits longer between restarts." },
      { term: "Image layer", meaning: "Cached filesystem change from one Dockerfile instruction." },
      { term: "Readiness probe", meaning: "Check that decides if a pod receives traffic." },
      { term: "Blast radius", meaning: "How many users a bad change can affect." },
      { term: "Postmortem", meaning: "Blameless write-up of an incident and its fixes." },
    ],
    example: {
      lang: "bash",
      code: "kubectl get pods -n shop\nkubectl describe pod api-7d9f -n shop        # events, exit code, OOMKilled?\nkubectl logs api-7d9f -n shop --previous     # logs from the crashed run\nkubectl get events -n shop --sort-by=.lastTimestamp\nkubectl rollout undo deployment/api -n shop  # roll back a bad release",
    },
    pitfalls: [
      "Guessing at causes before reading events and previous logs.",
      "Describing tools without trade-offs, such as canary versus blue-green cost.",
      "Fixing forward during an outage when a rollback is faster.",
    ],
    check: [
      { q: "Where do you find why a pod crashed?", a: "kubectl describe pod for events and exit codes, and kubectl logs --previous for the crashed container's output." },
      { q: "When is canary better than blue-green?", a: "When you want to test with a small share of real traffic and limit impact, without doubling infrastructure." },
    ],
  },

  "role/sql-qs": {
    summary:
      "SQL interview problems focus on ranking, aggregation and joins, often timed. Recognising which window function or join pattern fits is most of the work.",
    visuals: [
      {
        type: "compare",
        title: "Ranking functions on salaries 300, 200, 200, 100",
        columns: [
          { title: "ROW_NUMBER", points: ["1, 2, 3, 4", "Always unique", "Pick exactly one row per group"] },
          { title: "RANK", points: ["1, 2, 2, 4", "Ties share, then a gap", "Competition-style ranking"] },
          { title: "DENSE_RANK", points: ["1, 2, 2, 3", "Ties share, no gap", "Nth highest distinct value"] },
        ],
      },
      {
        type: "flow",
        title: "Approach for a SQL puzzle",
        steps: [
          { label: "Read the schema", detail: "Keys, nullable columns, duplicates" },
          { label: "State the grain", detail: "One output row per what?" },
          { label: "Pick the pattern", detail: "Join, GROUP BY, window function or self-join" },
          { label: "Write in CTEs", detail: "Small named steps, easy to check" },
          { label: "Test edge cases", detail: "Ties, NULLs, empty results" },
        ],
      },
    ],
    keyPoints: [
      "Nth highest distinct salary: DENSE_RANK() = N, returning NULL if none exists.",
      "Top N per group: ROW_NUMBER() OVER (PARTITION BY group ORDER BY value DESC).",
      "Self-joins compare rows in one table, such as employees earning more than their manager.",
      "COUNT(col) skips NULLs while COUNT(*) counts every row.",
    ],
    terms: [
      { term: "PARTITION BY", meaning: "Splits rows into groups for a window function." },
      { term: "Self-join", meaning: "Joining a table to itself with aliases." },
      { term: "DENSE_RANK", meaning: "Rank with ties and no gaps." },
      { term: "Grain", meaning: "What one row of the result represents." },
    ],
    example: {
      lang: "sql",
      code: "-- Second highest distinct salary (NULL if none)\nSELECT MAX(salary) AS second_highest\nFROM (\n  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk\n  FROM employees\n) ranked\nWHERE rnk = 2;\n\n-- Employees earning more than their manager\nSELECT e.name\nFROM employees e\nJOIN employees m ON m.id = e.manager_id\nWHERE e.salary > m.salary;",
    },
    pitfalls: [
      "Using ROW_NUMBER for Nth highest, which breaks on ties.",
      "Forgetting the no-result case should return NULL.",
      "Filtering on a window function in WHERE; wrap it in a subquery or CTE.",
    ],
    check: [
      { q: "Why use DENSE_RANK for the Nth highest salary?", a: "Ties share a rank with no gaps, so rank N is exactly the Nth distinct value." },
      { q: "Why can't you write WHERE RANK() OVER (...) = 1 directly?", a: "Window functions are computed after WHERE, so you filter in an outer query or CTE." },
    ],
  },

  "behavioral/resume": {
    summary:
      "Your resume, LinkedIn and GitHub get you the interview. Recruiters skim in seconds, so each bullet must show what you did and the measurable result.",
    visuals: [
      {
        type: "flow",
        title: "Rewrite a resume bullet",
        steps: [
          { label: "Action verb", detail: "Built, cut, led, automated" },
          { label: "What you did", detail: "The feature, system or process" },
          { label: "How", detail: "Key technologies or approach" },
          { label: "Measurable result", detail: "Latency, cost, users, time saved" },
        ],
      },
      {
        type: "compare",
        title: "Weak vs strong bullet",
        columns: [
          { title: "Weak", points: ["Worked on payments API", "Responsible for testing", "No numbers", "Says duties, not impact"] },
          { title: "Strong", points: ["Cut payments p95 latency 75%", "Added Redis cache, fixed N+1 queries", "Specific numbers", "Shows impact and skills"] },
        ],
      },
    ],
    keyPoints: [
      "Keep it to one page with the most relevant experience first.",
      "Every bullet should answer: so what? Add numbers wherever honest.",
      "Match keywords from the job description where they truly apply.",
      "Pin 3 to 6 GitHub repos with clear READMEs, screenshots and run steps.",
    ],
    terms: [
      { term: "ATS", meaning: "Applicant tracking system that parses and filters resumes." },
      { term: "Impact metric", meaning: "Number showing a result, like 40% faster." },
      { term: "Headline", meaning: "LinkedIn line under your name; say role and stack." },
      { term: "Pinned repo", meaning: "Project shown first on your GitHub profile." },
    ],
    example: {
      lang: "text",
      code: "Before: Worked on the payments API and fixed bugs.\n\nAfter:  Cut payments API p95 latency from 800 ms to 200 ms by adding\n        Redis caching and removing N+1 queries (Spring Boot, PostgreSQL).\n\nLinkedIn headline: Backend Engineer | Java, Spring Boot, AWS | APIs at scale",
    },
    pitfalls: [
      "Listing responsibilities instead of results.",
      "Two-column fancy layouts that ATS parsers scramble.",
      "Pinned repos with no README or broken setup.",
    ],
    check: [
      { q: "What makes a resume bullet strong?", a: "An action verb, what you did and how, and a measurable result." },
      { q: "What should a pinned GitHub repo include?", a: "A README explaining the project, how to run it, and screenshots or example output." },
    ],
  },

  "behavioral/star": {
    summary:
      "Behavioural questions check how you work with people and handle setbacks. The STAR structure keeps answers focused, and a small bank of rehearsed stories covers most questions.",
    visuals: [
      {
        type: "flow",
        title: "STAR answer structure",
        steps: [
          { label: "Situation", detail: "Brief context: team, project, stakes" },
          { label: "Task", detail: "Your specific responsibility or goal" },
          { label: "Action", detail: "What you did, in I statements; the longest part" },
          { label: "Result", detail: "Outcome with numbers, plus what you learned" },
        ],
      },
      {
        type: "tree",
        title: "Your story bank",
        root: "6 to 8 stories",
        children: [
          { label: "Conflict", children: ["Disagreed with a teammate or lead"] },
          { label: "Failure", children: ["A mistake you owned and fixed"] },
          { label: "Leadership", children: ["Drove something without being asked"] },
          { label: "Impact", children: ["Your biggest measurable win"] },
          { label: "Ambiguity", children: ["Made progress with unclear requirements"] },
        ],
      },
    ],
    keyPoints: [
      "Spend most of the time on Action, describing what you personally did.",
      "Keep each story to about two minutes, then let the interviewer dig in.",
      "One story can answer several questions; tag each story with themes.",
      "For failure stories, show ownership and the lesson, not blame.",
    ],
    terms: [
      { term: "STAR", meaning: "Situation, Task, Action, Result." },
      { term: "Story bank", meaning: "Prepared stories mapped to common questions." },
      { term: "Follow-up probe", meaning: "Interviewer question digging into your story's details." },
      { term: "Ownership", meaning: "Taking responsibility for outcomes, good or bad." },
    ],
    example: {
      lang: "text",
      code: "Q: Tell me about a time you disagreed with a teammate.\nS: Our team planned to cache all API responses before a launch.\nT: I owned the orders service and worried about stale order data.\nA: I measured hit rates, showed orders changed every few seconds,\n   and proposed caching only the product catalogue. We tested both.\nR: Catalogue cache cut DB load 40% with no stale orders.\n   I learned to bring data, not opinions, to disagreements.",
    },
    pitfalls: [
      "Saying we throughout, hiding your own contribution.",
      "Long Situation setups that leave no time for Action.",
      "Picking a fake weakness or a failure with no lesson.",
    ],
    check: [
      { q: "Which part of STAR should be longest?", a: "Action, because it shows what you personally did and how you think." },
      { q: "How many stories should you prepare?", a: "About six to eight, covering conflict, failure, leadership, impact and ambiguity." },
    ],
  },

  "behavioral/mocks": {
    summary:
      "Mock interviews reveal gaps that solo practice hides, like freezing or going silent. A loop of timed mocks, honest feedback and targeted drills is the fastest way to improve.",
    visuals: [
      {
        type: "cycle",
        title: "Mock interview practice loop",
        steps: [
          { label: "Timed mock", detail: "45 minutes, real conditions, thinking aloud" },
          { label: "Record feedback", detail: "Write what went well and badly right away" },
          { label: "Find weak area", detail: "e.g. graph problems or design deep dives" },
          { label: "Targeted drills", detail: "5 to 10 problems on that weak area" },
          { label: "Schedule next mock", detail: "Mix DSA, design and behavioural rounds" },
        ],
      },
      {
        type: "flow",
        title: "Thinking aloud in a coding round",
        steps: [
          { label: "Clarify", detail: "Restate, ask about input size and edge cases" },
          { label: "Examples", detail: "Walk through a small case by hand" },
          { label: "Brute force", detail: "State it and its complexity" },
          { label: "Optimise", detail: "Name the pattern and the new complexity" },
          { label: "Code", detail: "Narrate decisions as you write" },
          { label: "Test", detail: "Trace an example and edge cases" },
        ],
      },
    ],
    keyPoints: [
      "Do at least four timed mocks before real interviews.",
      "Practise with peers or platforms; being watched changes how you perform.",
      "Keep a feedback log and track repeating mistakes.",
      "Silence is the most common failure; narrate even when you are stuck.",
    ],
    terms: [
      { term: "Mock interview", meaning: "Practice interview under realistic, timed conditions." },
      { term: "Think aloud", meaning: "Saying your reasoning while solving." },
      { term: "Feedback log", meaning: "Notes from each mock used to plan practice." },
      { term: "Drill", meaning: "Focused repetition on one weak skill." },
    ],
    example: {
      lang: "text",
      code: "Mock #3 - DSA, 45 min\nProblem: Merge K Sorted Lists (solved in 38 min)\nWent well: clarified edge cases, stated O(N log k) early\nWent badly: off-by-one in heap loop, silent for 5 min\nNext drills: 5 heap problems, narrate every step aloud",
    },
    pitfalls: [
      "Only solving problems alone, never under observation.",
      "Ignoring feedback and repeating the same mistakes.",
      "Doing only DSA mocks and skipping design and behavioural rounds.",
    ],
    check: [
      { q: "Why think aloud while coding?", a: "Interviewers grade your reasoning, and talking lets them guide you before you go off track." },
      { q: "What should you do right after a mock?", a: "Write down feedback and pick one weak area to drill before the next mock." },
    ],
  },
};

export default explainers;
