import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-recursion-sorting/recursion": {
    plain: [
      "Recursion means a function calls itself. That sounds like a loop that never ends, but there is a rule: every call works on a smaller piece of the problem, and there is a smallest piece that the function answers directly. That smallest piece is the base case.",
      "Think of counting people in a long queue without leaving your spot. You ask the person behind you, \"How many people are behind you?\" They ask the person behind them, and so on. The last person says \"zero\" (the base case). Each person adds one and passes the answer forward.",
      "While all this asking happens, each person has to wait and remember their place. A computer does the same with the call stack. Every call gets a frame, a small block of memory holding its local variables and where to return. When a call finishes, its frame is removed.",
      "The stack has a limit. Python stops at about 1000 nested calls and raises RecursionError. So recursion is great for trees and divide-and-conquer, where depth stays small, but risky for walking a list of a million items one at a time.",
      "Any recursive function can be rewritten with a loop and your own stack. Learning to switch between the two styles is one of the most useful skills in algorithms.",
    ],
    deepDive: [
      {
        heading: "Writing a correct recursive function",
        body: "Use a three-question checklist. First, what is the smallest input I can answer without recursing? That is the base case, for example an empty list or n == 0. Second, how do I make the input smaller? Slice off one item, halve the range, or move to a child node. Third, if I trust that the recursive call returns the right answer for the smaller input, how do I build my answer from it?\n\nThe third step is the leap of faith. Do not trace every level in your head. Prove the base case is right, prove each step combines correctly, and induction does the rest.\n\nWatch for progress. sum_list(a) = a[0] + sum_list(a[1:]) shrinks by one each call, so it ends. A call like f(n) = f(n) + 1 never shrinks and only stops when the stack overflows.",
        bullets: ["Base case first, at the top of the function", "Every call must move towards the base case", "Trust the recursive call; check only the combine step"],
      },
      {
        heading: "What happens on the call stack",
        body: "Each call pushes a frame holding its arguments, local variables and the point to resume. The caller pauses until the callee returns. So the stack grows on the way down and shrinks on the way back up, and the deepest point decides the memory used: O(depth).\n\nTake factorial(3). The stack grows to factorial(3), factorial(2), factorial(1). factorial(1) returns 1, its frame is popped, factorial(2) resumes and returns 2, and finally factorial(3) returns 6.\n\nThe work done after the recursive call returns is the unwinding phase. In n * factorial(n - 1), the multiplication happens on the way up. A call that is the very last action, like return helper(n - 1, acc * n), is a tail call. Some languages reuse the frame for tail calls, but Python never does, so a tail-recursive Python function still uses O(n) stack.",
        visual: {
          type: "sequence",
          title: "Call stack for factorial(3)",
          actors: ["factorial(3)", "factorial(2)", "factorial(1)"],
          messages: [
            { from: 0, to: 1, label: "call with n = 2" },
            { from: 1, to: 2, label: "call with n = 1" },
            { from: 2, to: 1, label: "base case: return 1" },
            { from: 1, to: 0, label: "return 2 * 1 = 2" },
          ],
        },
      },
      {
        heading: "Recursion trees and their cost",
        body: "Draw each call as a node and its recursive calls as children. Total time is the sum of the work at every node. Maximum stack space is the height of the tree.\n\nFor a single recursive call per level, like factorial, the tree is a path: n nodes, O(n) time, O(n) space. For two calls on n - 1, like naive Fibonacci or Tower of Hanoi, the tree roughly doubles each level. Hanoi with n disks makes exactly 2^n - 1 moves. Naive fib(n) makes 2 * fib(n + 1) - 1 calls, which grows like 1.618^n, yet uses only O(n) stack because only one path is active at a time.\n\nFor two calls on n / 2 with O(n) extra work, like merge sort, the tree has log2 n levels, each doing O(n) total work: O(n log n).",
        bullets: ["Time = sum of work at all nodes", "Space = depth of the tree (plus any copies made)", "Repeated identical subtrees mean memoisation will help"],
      },
      {
        heading: "Python's recursion limit and hidden costs",
        body: "sys.getrecursionlimit() returns 1000 by default. You can raise it with sys.setrecursionlimit(10_000), but that only moves the guard rail. Very deep recursion can still crash the interpreter if the underlying C stack runs out, so for depths in the hundreds of thousands, switch to iteration.\n\nTwo hidden costs often surprise people. Slicing, as in f(a[1:]), copies the list every call, turning an O(n) algorithm into O(n^2) time and memory. Pass indexes instead: f(a, i + 1). And building strings by concatenation in each call has the same problem.\n\nFunction calls in Python are also relatively slow, roughly tens of nanoseconds each in recent versions. For hot inner loops, an iterative version is often several times faster. Memoising with @functools.cache (Python 3.9 and later) removes repeated calls entirely when subproblems repeat.",
        bullets: ["Default limit: 1000 frames", "Pass indexes, not slices", "@functools.cache turns repeated subcalls into dict lookups"],
      },
      {
        heading: "Turning recursion into iteration",
        body: "There are two common conversions. If the function does its work on the way down and has only one recursive call, a simple loop works: keep the changing values in variables and update them each pass. Tail-recursive functions always convert this way.\n\nIf there are several recursive calls, or work after the call, use an explicit stack. Push the starting input. Loop: pop an item, process it, and push its sub-items. This is exactly what the call stack was doing, but now the stack is a Python list on the heap, which can hold millions of items.\n\nWhen the result needs work after children finish (post-order), push a marker. A common trick is pushing (node, True) to mean \"children are done, now combine\". The iterative version is longer but cannot hit RecursionError.",
        visual: {
          type: "cycle",
          title: "Explicit stack loop",
          steps: [
            { label: "Push start", detail: "stack = [root input]" },
            { label: "Pop", detail: "Take the most recent item." },
            { label: "Process", detail: "Do the work for this item." },
            { label: "Push children", detail: "Smaller sub-inputs go on the stack." },
            { label: "Repeat", detail: "Until the stack is empty." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Recursive versus iterative style",
        columns: [
          { title: "Recursive", points: ["Mirrors the definition", "Stack managed by Python", "Limited to about 1000 deep", "Short code for trees and backtracking"] },
          { title: "Iterative with a stack", points: ["You manage the stack list", "Depth limited only by memory", "Faster in Python", "More code, easier to get order wrong"] },
        ],
      },
    ],
    examples: [
      {
        title: "Tower of Hanoi: 2^n - 1 moves",
        explanation: "To move n disks from peg A to peg C, move the top n - 1 disks to B, move the biggest disk to C, then move the n - 1 disks from B to C. The base case is zero disks, which needs no moves. The number of moves obeys M(n) = 2M(n - 1) + 1 with M(0) = 0, so M(n) = 2^n - 1. For 3 disks that is 7 moves; for 64 disks it is more than 18 quintillion.",
        code: {
          lang: "python",
          code: "def hanoi(n, src, dst, via, moves):\n    if n == 0:\n        return\n    hanoi(n - 1, src, via, dst, moves)\n    moves.append((src, dst))\n    hanoi(n - 1, via, dst, src, moves)\n\nmoves = []\nhanoi(3, 'A', 'C', 'B', moves)\nprint(len(moves), moves[:3])  # 7 [('A', 'C'), ('A', 'B'), ('C', 'B')]",
        },
      },
      {
        title: "Flattening nested lists, recursive and iterative",
        explanation: "A nested list like [1, [2, [3, 4]], 5] is itself recursive: each item is a number or another list. The recursive version reads naturally. The iterative version uses a stack of iterators so it handles nesting thousands of levels deep without RecursionError. Both return [1, 2, 3, 4, 5].",
        code: {
          lang: "python",
          code: "def flatten(x):\n    if not isinstance(x, list):\n        return [x]\n    return [y for item in x for y in flatten(item)]\n\ndef flatten_iter(x):\n    out, stack = [], [iter(x)]\n    while stack:\n        item = next(stack[-1], StopIteration)\n        if item is StopIteration: stack.pop()\n        elif isinstance(item, list): stack.append(iter(item))\n        else: out.append(item)\n    return out\n\nprint(flatten([1, [2, [3, 4]], 5]), flatten_iter([1, [2, [3, 4]], 5]))",
        },
      },
    ],
    cheatSheet: [
      "Every recursive function needs a base case and a step that shrinks the input",
      "Stack space = maximum recursion depth, not total number of calls",
      "sys.getrecursionlimit() is 1000 by default; sys.setrecursionlimit() raises it",
      "Python never optimises tail calls",
      "Pass index ranges instead of slices to avoid O(n) copies per call",
      "Naive fib(n) makes 2 * fib(n + 1) - 1 calls; @functools.cache makes it O(n)",
      "Iterative rewrite: a list as the stack, pop, process, push sub-problems",
    ],
    quiz: [
      {
        q: "What is the stack space of naive recursive fib(n)?",
        options: ["O(n)", "O(2^n)", "O(1)", "O(n^2)"],
        answer: 0,
        why: "Only one root-to-leaf path is active at a time, and the deepest path has about n calls.",
      },
      {
        q: "How many moves does Tower of Hanoi need for 5 disks?",
        options: ["25", "32", "16", "31"],
        answer: 3,
        why: "The minimum is 2^n - 1, which is 31 for n = 5.",
      },
      {
        q: "Why does def total(a): return 0 if not a else a[0] + total(a[1:]) take O(n^2) time?",
        options: ["Addition is slow", "Each slice a[1:] copies the rest of the list", "The base case is wrong", "Recursion is always quadratic"],
        answer: 1,
        why: "Copies of length n - 1, n - 2, ... add up to about n^2 / 2 element copies.",
      },
      {
        q: "What does Python do with a tail-recursive call?",
        options: ["Reuses the current frame", "Converts it to a loop at compile time", "Pushes a new frame like any other call", "Runs it in a new thread"],
        answer: 2,
        why: "CPython has no tail-call optimisation, so tail recursion still uses O(depth) stack.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write is_palindrome(s, i, j) recursively, checking s[i..j] without slicing. Example: is_palindrome('racecar', 0, 6) is True, is_palindrome('abca', 0, 3) is False.",
        hint: "Base case: i >= j. Otherwise compare the ends and recurse inward.",
        solution: "def is_palindrome(s, i, j):\n    if i >= j:\n        return True\n    return s[i] == s[j] and is_palindrome(s, i + 1, j - 1)\n\nprint(is_palindrome('racecar', 0, 6))  # True\nprint(is_palindrome('abca', 0, 3))     # False\n# Time O(n), stack O(n)",
      },
      {
        level: "medium",
        task: "Write power(x, n) for integer n >= 0 using recursion in O(log n) multiplications. Example: power(2, 10) is 1024.",
        hint: "x^n = (x^(n//2))^2, times x if n is odd. Compute the half once.",
        solution: "def power(x, n):\n    if n == 0:\n        return 1\n    half = power(x, n // 2)\n    return half * half * (x if n % 2 else 1)\n\nprint(power(2, 10), power(3, 5))  # 1024 243\n# Depth and multiplications: O(log n)",
      },
      {
        level: "hard",
        task: "Write subsets(a) that returns all subsets of a list, first recursively, then convince yourself of the count: a list of n items has 2^n subsets. Example: subsets([1, 2, 3]) has 8 entries.",
        hint: "Subsets of a[1:] are needed twice: once without a[0] and once with a[0] added.",
        solution: "def subsets(a, i=0):\n    if i == len(a):\n        return [[]]\n    rest = subsets(a, i + 1)\n    return rest + [[a[i]] + s for s in rest]\n\nprint(len(subsets([1, 2, 3])), subsets([1, 2]))\n# 8 [[], [2], [1], [1, 2]]\n# Each level doubles the list: 2^n subsets, O(n * 2^n) total",
      },
    ],
    faq: [
      { q: "Is recursion slower than a loop?", a: "In Python, usually yes, because each call creates a frame and calls cost tens of nanoseconds. The difference only matters in hot code; choose the clearer version first." },
      { q: "How do I fix RecursionError: maximum recursion depth exceeded?", a: "First check the base case is reachable. If the depth is genuinely large, rewrite with an explicit stack; raising sys.setrecursionlimit is a short-term patch." },
      { q: "What is the difference between recursion and dynamic programming?", a: "Recursion is a way to write a function. Dynamic programming is recursion (or iteration) where overlapping subproblems are stored and reused, so each is solved once." },
    ],
  },

  "dsa-recursion-sorting/divide-and-conquer": {
    plain: [
      "Divide and conquer is a strategy for big problems: cut the problem into smaller pieces of the same kind, solve each piece, then join the answers. The pieces are solved the same way, so the idea repeats until the pieces are tiny and easy.",
      "Imagine checking 1,000 exam papers alone. You could split them into two piles and give each to a helper. Each helper splits their pile again, and so on, until each person has one paper. Marking one paper is easy. Then the scores travel back up and are added together.",
      "The power comes from halving. A problem of size one million needs only about 20 rounds of halving to reach size one. If joining the answers is cheap, the whole job becomes much faster than handling everything at once.",
      "Merge sort, quicksort and binary search are all divide and conquer. So are fast ways to multiply huge numbers and to find the closest pair of points on a map.",
    ],
    deepDive: [
      {
        heading: "Reading recurrences with the master theorem",
        body: "A divide-and-conquer algorithm that makes a calls on pieces of size n / b and does f(n) extra work has running time T(n) = a T(n / b) + f(n). Compare f(n) with n^(log_b a), the number of leaves in the recursion tree.\n\nIf f(n) is smaller (polynomially), the leaves dominate: T(n) = O(n^(log_b a)). If they match, every level does the same work and you pay a log factor: T(n) = O(n^(log_b a) log n). If f(n) is larger (and regular), the top level dominates: T(n) = O(f(n)).\n\nExamples: binary search is T(n) = T(n/2) + O(1), so a = 1, b = 2, n^0 = 1 matches f, giving O(log n). Merge sort is 2T(n/2) + O(n), matching again: O(n log n). Tree traversal 2T(n/2) + O(1) gives O(n). A naive split with 4T(n/2) + O(n) gives O(n^2).",
        bullets: ["T(n) = a T(n/b) + f(n)", "Compare f(n) with n^(log_b a)", "Equal: multiply by log n"],
        visual: {
          type: "compare",
          title: "Common recurrences",
          columns: [
            { title: "One half, O(1) work", points: ["T(n) = T(n/2) + O(1)", "O(log n)", "Binary search"] },
            { title: "Two halves, O(n) work", points: ["T(n) = 2T(n/2) + O(n)", "O(n log n)", "Merge sort, closest pair"] },
            { title: "Three halves, O(n) work", points: ["T(n) = 3T(n/2) + O(n)", "O(n^1.585)", "Karatsuba multiplication"] },
          ],
        },
      },
      {
        heading: "Maximum subarray: the crossing case",
        body: "Split the array at mid. The best subarray lies entirely in the left half, entirely in the right half, or it crosses the middle. The first two come from recursion. The crossing case is the clever combine step.\n\nA crossing subarray must include a[mid] and a[mid + 1]. So the best one is the best sum ending exactly at mid (scan left from mid) plus the best sum starting exactly at mid + 1 (scan right). Those two scans cost O(n) together, so T(n) = 2T(n/2) + O(n) = O(n log n).\n\nYou can make the combine O(1) by having each call return four numbers: total sum, best prefix, best suffix and best overall. Then best = max(left.best, right.best, left.suffix + right.prefix). This gives O(n) total and is the idea behind segment trees that answer max-subarray queries on ranges.",
        bullets: ["Three candidates: left, right, crossing", "Crossing = best suffix of left + best prefix of right", "Returning (sum, prefix, suffix, best) makes it O(n)"],
      },
      {
        heading: "Counting inversions while merging",
        body: "An inversion is a pair i < j with a[i] > a[j]. It measures how unsorted an array is: 0 for sorted, n(n-1)/2 for reversed. Checking every pair is O(n^2).\n\nDivide and conquer does it in O(n log n). Count inversions inside the left half, inside the right half, and those that cross. While merging two sorted halves, each time you take an element from the right half before the remaining left elements, it is smaller than all of them. If len(left) - i items remain in the left half, add that many crossing inversions at once.\n\nUses: measuring how similar two rankings are (Kendall tau distance), and predicting the cost of insertion sort, which does exactly one shift per inversion.",
        visual: {
          type: "flow",
          title: "Merging [2, 5] and [1, 3] while counting",
          steps: [
            { label: "Compare 2 and 1", detail: "Take 1 from right; 2 left items remain: +2." },
            { label: "Compare 2 and 3", detail: "Take 2 from left: +0." },
            { label: "Compare 5 and 3", detail: "Take 3 from right; 1 left item remains: +1." },
            { label: "Drain", detail: "Take 5. Output [1, 2, 3, 5]." },
            { label: "Total", detail: "3 crossing inversions: (2,1), (5,1), (5,3)." },
          ],
        },
      },
      {
        heading: "When the combine step is the whole trick",
        body: "Many famous algorithms differ only in how cleverly they combine. Karatsuba multiplication splits two n-digit numbers into halves and needs only 3 half-size products instead of 4, using (a + b)(c + d) - ac - bd for the middle term. That changes 4T(n/2) + O(n) = O(n^2) into 3T(n/2) + O(n) = O(n^1.585). CPython uses Karatsuba for very large integers.\n\nThe closest pair of points sorts by x, splits at the median, and only needs to check points in a narrow strip around the split line. Inside that strip each point needs comparing with at most a constant number of neighbours (7 is a common bound) when sorted by y, giving O(n log n).\n\nStrassen's matrix multiplication uses 7 half-size products instead of 8, giving O(n^2.807).",
      },
      {
        heading: "When not to divide and conquer",
        body: "Divide and conquer assumes the subproblems are independent: solving the left half tells you nothing you need for the right half, and the same subproblem does not appear twice. When subproblems overlap, as in Fibonacci or edit distance, plain recursion repeats work exponentially. That is the signal to use dynamic programming, which stores each subproblem's answer.\n\nAlso watch the overheads. Splitting into tiny pieces costs function calls and memory. Real implementations stop recursing below a cutoff (for example 16 to 64 elements) and use a simple method like insertion sort there. This is why library sorts are hybrids.\n\nFinally, the split must be balanced enough. Halving gives log n levels. Peeling off one element per level (as quicksort does with a bad pivot) gives n levels and quadratic time.",
        bullets: ["Overlapping subproblems: use DP", "Use a cutoff for small inputs", "Unbalanced splits lose the log factor"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Recursion tree for T(n) = 2T(n/2) + n",
        root: "Level 0: one problem, work n",
        children: [
          { label: "Level 1: two of size n/2", children: ["Work n/2 + n/2 = n"] },
          { label: "Level 2: four of size n/4", children: ["Work 4 x n/4 = n"] },
          { label: "Level log2 n: n leaves", children: ["Work n x 1 = n"] },
          { label: "Total", children: ["n per level x (log2 n + 1) levels = O(n log n)"] },
        ],
      },
    ],
    examples: [
      {
        title: "Counting inversions in O(n log n)",
        explanation: "For [3, 1, 2, 5, 4], the inversions are (3,1), (3,2) and (5,4), so the answer is 3. The function sorts and counts at once. Each call returns the sorted list and the count of inversions inside it. When a right-half element is taken first, all remaining left-half elements are bigger, so we add len(left) - i in one step.",
        code: {
          lang: "python",
          code: "def sort_count(a):\n    if len(a) <= 1:\n        return a, 0\n    mid = len(a) // 2\n    left, x = sort_count(a[:mid])\n    right, y = sort_count(a[mid:])\n    out, i, j, cross = [], 0, 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]:\n            out.append(left[i]); i += 1\n        else:\n            out.append(right[j]); j += 1\n            cross += len(left) - i\n    return out + left[i:] + right[j:], x + y + cross\n\nprint(sort_count([3, 1, 2, 5, 4])[1])  # 3",
        },
      },
      {
        title: "Maximum subarray in O(n) with a four-value combine",
        explanation: "Each call returns (total, best prefix, best suffix, best). For a single element x, all four are x. To combine left L and right R: total = L.total + R.total; prefix = max(L.prefix, L.total + R.prefix); suffix = max(R.suffix, R.total + L.suffix); best = max(L.best, R.best, L.suffix + R.prefix). The combine is O(1), so T(n) = 2T(n/2) + O(1) = O(n).",
        code: {
          lang: "python",
          code: "def solve(a, lo, hi):\n    if lo == hi:\n        x = a[lo]\n        return x, x, x, x\n    mid = (lo + hi) // 2\n    lt, lp, ls, lb = solve(a, lo, mid)\n    rt, rp, rs, rb = solve(a, mid + 1, hi)\n    return (lt + rt, max(lp, lt + rp), max(rs, rt + ls),\n            max(lb, rb, ls + rp))\n\na = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nprint(solve(a, 0, len(a) - 1)[3])  # 6",
        },
      },
    ],
    cheatSheet: [
      "Template: if small, solve directly; else split, recurse, combine",
      "T(n) = 2T(n/2) + O(n) is O(n log n); T(n) = T(n/2) + O(1) is O(log n)",
      "T(n) = 2T(n/2) + O(1) is O(n); T(n) = 4T(n/2) + O(n) is O(n^2)",
      "Karatsuba: 3 half-size products, O(n^1.585); Strassen: 7, O(n^2.807)",
      "Inversions: add len(left) - i whenever the merge takes from the right",
      "Overlapping subproblems mean dynamic programming, not divide and conquer",
      "Real code switches to a simple method below a small cutoff",
    ],
    quiz: [
      {
        q: "What does T(n) = 2T(n/2) + O(1) solve to?",
        options: ["O(log n)", "O(n log n)", "O(n)", "O(n^2)"],
        answer: 2,
        why: "There are about 2n nodes in the recursion tree, each doing constant work.",
      },
      {
        q: "In the maximum subarray algorithm, what does the crossing case combine?",
        options: ["The best suffix of the left half and the best prefix of the right half", "The two halves' totals", "The maximum element of each half", "The first and last elements"],
        answer: 0,
        why: "A crossing subarray ends somewhere in the left half at mid and starts at mid + 1 in the right half.",
      },
      {
        q: "How many inversions does a reversed array of 6 distinct elements have?",
        options: ["6", "36", "12", "15"],
        answer: 3,
        why: "Every pair is inverted: 6 * 5 / 2 = 15.",
      },
      {
        q: "Why does Karatsuba beat schoolbook multiplication for big numbers?",
        options: ["It uses 3 half-size multiplications instead of 4", "It avoids carrying digits", "It uses floating point", "It sorts the digits first"],
        answer: 0,
        why: "3T(n/2) + O(n) solves to O(n^log2(3)), about O(n^1.585), versus O(n^2).",
      },
      {
        q: "Which problem is a poor fit for plain divide and conquer?",
        options: ["Sorting an array", "Finding the closest pair of points", "Computing the n-th Fibonacci number", "Counting inversions"],
        answer: 2,
        why: "Fibonacci subproblems overlap heavily, so plain recursion repeats work exponentially; use DP.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write find_max(a, lo, hi) using divide and conquer: split in half, find each half's maximum, return the larger. State its recurrence and time. Example: find_max([3, 9, 2, 7], 0, 3) is 9.",
        hint: "Base case lo == hi. The combine step is a single max.",
        solution: "def find_max(a, lo, hi):\n    if lo == hi:\n        return a[lo]\n    mid = (lo + hi) // 2\n    return max(find_max(a, lo, mid), find_max(a, mid + 1, hi))\n\nprint(find_max([3, 9, 2, 7], 0, 3))  # 9\n# T(n) = 2T(n/2) + O(1) = O(n), stack O(log n)",
      },
      {
        level: "medium",
        task: "Write majority(a, lo, hi) that returns the element appearing more than half the time in a[lo..hi] using divide and conquer, assuming one exists. Example: [2, 2, 1, 1, 2, 2, 3] gives 2.",
        hint: "A majority of the whole must be a majority of at least one half. Count both candidates over the range.",
        solution: "def majority(a, lo, hi):\n    if lo == hi:\n        return a[lo]\n    mid = (lo + hi) // 2\n    x, y = majority(a, lo, mid), majority(a, mid + 1, hi)\n    if x == y:\n        return x\n    cx = sum(1 for i in range(lo, hi + 1) if a[i] == x)\n    return x if cx * 2 > hi - lo + 1 else y\n\nprint(majority([2, 2, 1, 1, 2, 2, 3], 0, 6))  # 2\n# T(n) = 2T(n/2) + O(n) = O(n log n)",
      },
      {
        level: "hard",
        task: "Write karatsuba(x, y) for non-negative integers. Split each number at m decimal digits, compute three products recursively, and check against x * y. Example: karatsuba(1234, 5678) is 7006652.",
        hint: "x = a * 10^m + b, y = c * 10^m + d; middle = (a + b)(c + d) - ac - bd.",
        solution: "def karatsuba(x, y):\n    if x < 10 or y < 10:\n        return x * y\n    m = max(len(str(x)), len(str(y))) // 2\n    a, b = divmod(x, 10 ** m)\n    c, d = divmod(y, 10 ** m)\n    ac, bd = karatsuba(a, c), karatsuba(b, d)\n    mid = karatsuba(a + b, c + d) - ac - bd\n    return ac * 10 ** (2 * m) + mid * 10 ** m + bd\n\nprint(karatsuba(1234, 5678), 1234 * 5678)  # 7006652 7006652",
      },
    ],
    faq: [
      { q: "Is divide and conquer the same as recursion?", a: "No. Recursion is a coding technique; divide and conquer is a problem-solving strategy that is usually written recursively, but can also be iterative, like bottom-up merge sort." },
      { q: "Do I need the master theorem in interviews?", a: "Rarely by name, but you should know the common results: one half with O(1) work is O(log n), two halves with O(n) work is O(n log n)." },
      { q: "Can divide and conquer run in parallel?", a: "Yes, and that is one of its strengths. Independent subproblems can run on different cores, which is how parallel merge sort and many MapReduce jobs work." },
    ],
  },

  "dsa-recursion-sorting/elementary-sorts": {
    plain: [
      "Sorting means putting items in order, like arranging cards in your hand. The three simplest methods are bubble sort, selection sort and insertion sort. They are easy to understand and use almost no extra memory, but they get slow on big lists.",
      "Bubble sort walks through the list and swaps any two neighbours that are in the wrong order. After one walk, the largest item has bubbled to the end. Repeat until a walk makes no swaps.",
      "Selection sort finds the smallest item and puts it first, then finds the next smallest and puts it second, and so on. Insertion sort works like sorting cards: take the next card and slide it left into its correct place among the cards already sorted.",
      "All three take about n^2 steps for n items in the worst case. With 10 items that is fine. With a million items it is a trillion steps. But insertion sort has a secret strength: on a list that is already almost sorted, it is very fast. That is why real sorting libraries still use it for small pieces.",
    ],
    deepDive: [
      {
        heading: "Counting the work exactly",
        body: "Bubble sort compares neighbours. Pass k compares n - k pairs, so a full run is (n - 1) + (n - 2) + ... + 1 = n(n - 1)/2 comparisons. With an early-exit flag, it stops after the first pass with no swaps, so sorted input takes only n - 1 comparisons.\n\nSelection sort always makes n(n - 1)/2 comparisons, even on sorted input, because it must scan the rest of the list to be sure it has the minimum. But it makes at most n - 1 swaps, the fewest of the three. That helps only when writing to memory is very expensive.\n\nInsertion sort's cost depends on the input. Each shift fixes exactly one inversion (a pair in the wrong order), so the number of shifts equals the number of inversions. That is 0 for sorted input, n(n - 1)/2 for reversed input, and n(n - 1)/4 on average for random input.",
        bullets: ["Bubble: n(n-1)/2 comparisons, n - 1 with early exit on sorted input", "Selection: always n(n-1)/2 comparisons, at most n - 1 swaps", "Insertion: shifts = inversions"],
      },
      {
        heading: "Stability: why it matters",
        body: "A sort is stable if items that compare equal keep their original order. Suppose you have orders already sorted by time, and you sort them by customer. A stable sort keeps each customer's orders in time order. An unstable sort may shuffle them.\n\nInsertion sort is stable because it shifts an item left only past strictly greater items (a[j] > key). Change that to >= and equal items jump over each other, breaking stability. Bubble sort is stable for the same reason: it swaps only when the left item is strictly greater.\n\nSelection sort is not stable in its usual form. Sorting [(2, 'a'), (2, 'b'), (1, 'c')] by the number, the first pass swaps (1, 'c') with (2, 'a'), giving [(1, 'c'), (2, 'b'), (2, 'a')]: the two 2s have changed order. A stable version shifts items instead of swapping, but then it does more writes.",
        visual: {
          type: "flow",
          title: "Selection sort breaking stability",
          steps: [
            { label: "Start", detail: "[2a, 2b, 1c]" },
            { label: "Find min", detail: "1c is the minimum." },
            { label: "Swap with first", detail: "[1c, 2b, 2a]: 2a jumped over 2b." },
            { label: "Pass 2", detail: "2b is the minimum of the rest: no change." },
            { label: "Result", detail: "Sorted, but 2b now comes before 2a." },
          ],
        },
      },
      {
        heading: "Why insertion sort wins on nearly sorted data",
        body: "Insertion sort runs in O(n + I) time, where I is the number of inversions. If every item is at most k positions from its final place, each item shifts at most k times, so the total is O(n k). For k = 3 that is linear time.\n\nReal data is often like this: a log file that is mostly in timestamp order, a leaderboard where only a few scores changed, or a list where new items were appended to an already sorted list.\n\nInsertion sort is also fast on tiny arrays (say under 32 to 64 items) because its inner loop is simple and touches neighbouring memory. Fancy O(n log n) sorts have higher constant costs. So hybrid sorts split the work: Timsort, used by Python, extends short natural runs to a minimum length (between 32 and 64) using binary insertion sort, then merges the runs.",
        bullets: ["Time O(n + inversions)", "Items at most k away from home: O(nk)", "Small inputs: lowest overhead of any sort"],
      },
      {
        heading: "In-place, online and adaptive",
        body: "Three more words help describe sorts. In-place means only O(1) extra memory is used besides the input. All three elementary sorts are in-place.\n\nOnline means the algorithm can sort items as they arrive, without seeing the whole input first. Insertion sort is online: each new item is inserted into the already sorted prefix. Python's bisect.insort does the same for a list, with O(log n) comparisons to find the spot but O(n) time to shift items.\n\nAdaptive means the algorithm runs faster when the input is already partly sorted. Insertion sort and bubble sort with early exit are adaptive. Selection sort is not: it does the same comparisons regardless of input.\n\nBinary insertion sort uses binary search to find where to insert, cutting comparisons to O(n log n), but shifts remain O(n^2) in the worst case.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Insertion sort on [4, 2, 5, 1]",
        steps: [
          { label: "Start", detail: "Sorted prefix [4], rest [2, 5, 1]." },
          { label: "Insert 2", detail: "Shift 4 right: [2, 4, 5, 1]. 1 shift." },
          { label: "Insert 5", detail: "No shift: [2, 4, 5, 1]." },
          { label: "Insert 1", detail: "Shift 5, 4, 2: [1, 2, 4, 5]. 3 shifts." },
          { label: "Done", detail: "4 shifts = 4 inversions in the input." },
        ],
      },
    ],
    examples: [
      {
        title: "Counting operations on sorted, reversed and random input",
        explanation: "We instrument insertion sort to count shifts and compare three inputs of 1,000 items. Sorted input needs 0 shifts. Reversed input needs 1000 * 999 / 2 = 499,500 shifts. Random input lands near the average of n(n - 1)/4, about 250,000. The same algorithm differs by a factor of hundreds of thousands depending on the data.",
        code: {
          lang: "python",
          code: "import random\n\ndef insertion_shifts(a):\n    a, shifts = a[:], 0\n    for i in range(1, len(a)):\n        key, j = a[i], i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]; j -= 1; shifts += 1\n        a[j + 1] = key\n    return shifts\n\nn = 1000\nprint(insertion_shifts(list(range(n))))         # 0\nprint(insertion_shifts(list(range(n, 0, -1))))  # 499500\nprint(insertion_shifts(random.sample(range(n), n)))  # about 250000",
        },
      },
      {
        title: "Bubble and selection sort side by side",
        explanation: "Bubble sort with a swapped flag stops early when a pass makes no swaps. Selection sort finds the index of the minimum in the unsorted part and does one swap per pass. On [5, 1, 4, 2, 8], bubble sort needs 3 passes (the third has no swaps), while selection sort always does 4 passes, comparing every remaining item each time.",
        code: {
          lang: "python",
          code: "def bubble_sort(a):\n    for end in range(len(a) - 1, 0, -1):\n        swapped = False\n        for i in range(end):\n            if a[i] > a[i + 1]:\n                a[i], a[i + 1] = a[i + 1], a[i]; swapped = True\n        if not swapped: break\n    return a\n\ndef selection_sort(a):\n    for i in range(len(a) - 1):\n        m = min(range(i, len(a)), key=a.__getitem__)\n        a[i], a[m] = a[m], a[i]\n    return a\n\nprint(bubble_sort([5, 1, 4, 2, 8]), selection_sort([5, 1, 4, 2, 8]))",
        },
      },
    ],
    cheatSheet: [
      "Bubble: O(n^2), O(n) on sorted input with early exit, stable, in-place",
      "Selection: always n(n-1)/2 comparisons, at most n - 1 swaps, not stable",
      "Insertion: O(n + inversions), stable, in-place, online, adaptive",
      "Average inversions in a random permutation: n(n-1)/4",
      "Keep stability: shift or swap only on strictly greater (>), never >=",
      "Timsort uses binary insertion sort to build runs of 32 to 64 items",
      "bisect.insort keeps a list sorted: O(log n) search, O(n) insert",
    ],
    quiz: [
      {
        q: "How many comparisons does selection sort make on an already sorted list of 10 items?",
        options: ["9", "45", "10", "0"],
        answer: 1,
        why: "It always scans the rest of the list: 9 + 8 + ... + 1 = 45.",
      },
      {
        q: "An array has 12 inversions. How many shifts will insertion sort perform?",
        options: ["12", "24", "It depends on n only", "144"],
        answer: 0,
        why: "Each shift moves one item past one larger item, removing exactly one inversion.",
      },
      {
        q: "Which change makes insertion sort unstable?",
        options: ["Starting the loop at index 1", "Using a temporary variable for the key", "Using a[j] >= key instead of a[j] > key", "Counting shifts"],
        answer: 2,
        why: "With >=, an item moves left past equal items, reversing their original order.",
      },
      {
        q: "Why does Python's Timsort use insertion sort at all?",
        options: ["It is the only stable sort", "It uses less memory than merging", "It is required by the language spec", "It has very low overhead on short runs"],
        answer: 3,
        why: "For small pieces, the simple inner loop beats the overhead of recursive or merging sorts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write count_inversions_slow(a) that counts pairs i < j with a[i] > a[j] using two loops. Check that it matches the number of shifts insertion sort makes on [4, 2, 5, 1].",
        hint: "Two nested loops over i and j > i.",
        solution: "def count_inversions_slow(a):\n    n = len(a)\n    return sum(1 for i in range(n) for j in range(i + 1, n)\n               if a[i] > a[j])\n\nprint(count_inversions_slow([4, 2, 5, 1]))  # 4\n# Insertion sort also shifts 4 times on this input",
      },
      {
        level: "medium",
        task: "Write a stable insertion sort that sorts a list of (name, age) tuples by age only. Example: [('a', 30), ('b', 25), ('c', 30)] gives [('b', 25), ('a', 30), ('c', 30)].",
        hint: "Compare only the age field, and shift only when strictly greater.",
        solution: "def sort_by_age(people):\n    a = people[:]\n    for i in range(1, len(a)):\n        item, j = a[i], i - 1\n        while j >= 0 and a[j][1] > item[1]:\n            a[j + 1] = a[j]\n            j -= 1\n        a[j + 1] = item\n    return a\n\nprint(sort_by_age([('a', 30), ('b', 25), ('c', 30)]))",
      },
      {
        level: "hard",
        task: "Each item in a list is at most k positions away from its sorted position. Sort it in O(n log k) using a heap, and explain why insertion sort would be O(nk). Example: ([3, 1, 2, 6, 4, 5], k=2) gives [1, 2, 3, 4, 5, 6].",
        hint: "The smallest remaining item is always among the next k + 1 items. Keep them in a min-heap.",
        solution: "import heapq\n\ndef sort_k_sorted(a, k):\n    heap, out = a[:k + 1], []\n    heapq.heapify(heap)\n    for x in a[k + 1:]:\n        out.append(heapq.heappushpop(heap, x))\n    while heap:\n        out.append(heapq.heappop(heap))\n    return out\n\nprint(sort_k_sorted([3, 1, 2, 6, 4, 5], 2))\n# Insertion sort: each item shifts at most k times, O(nk)",
      },
    ],
    faq: [
      { q: "Is bubble sort ever used in real code?", a: "Almost never. Insertion sort does the same job with fewer writes and better speed, so bubble sort survives mainly as a teaching tool." },
      { q: "Which simple sort should I learn first?", a: "Insertion sort. It is stable, adaptive, used inside real library sorts, and the shifting loop teaches the invariant of a sorted prefix." },
      { q: "Why is selection sort not stable if it only swaps?", a: "A long-distance swap can move an element past another equal element. For example, swapping the first of two equal items to the far end reverses their order." },
    ],
  },

  "dsa-recursion-sorting/merge-sort": {
    plain: [
      "Merge sort uses one simple idea: merging two lists that are already sorted is easy. Look at the front of each list, take the smaller item, and repeat. You never have to look back.",
      "So merge sort splits the list in half, then splits each half, and keeps going until every piece has one item. A list of one item is already sorted. Then it merges pairs of pieces back together, step by step, into bigger and bigger sorted lists.",
      "Splitting in half again and again takes about log2 n rounds. Each round of merging touches every item once. So the total work is about n times log n. For a million items that is roughly 20 million steps, instead of a trillion for the simple sorts.",
      "Merge sort is predictable: it takes the same time whether the input is sorted, reversed or random. It is also stable, keeping equal items in their original order. Its main cost is memory: it needs extra space about the size of the input to do the merging.",
    ],
    deepDive: [
      {
        heading: "The merge step in detail",
        body: "Keep two indexes, i into the left list and j into the right list. Compare left[i] and right[j]; append the smaller to the output and move that index forward. When one list runs out, copy the rest of the other.\n\nEach comparison outputs exactly one item, so merging lists of sizes p and q takes at most p + q - 1 comparisons and exactly p + q writes. That is O(n) for the merge.\n\nStability comes from tie-breaking. On equal values, take from the left list first (left[i] <= right[j]). Because the left half came earlier in the original order, equal items stay in order.\n\nAn in-place merge without extra memory is possible but complicated and slower, so practical merge sorts accept O(n) extra space. A common optimisation is skipping the merge entirely when left[-1] <= right[0], because the two halves are already in order. That makes merge sort run in O(n) on already sorted input.",
        bullets: ["At most p + q - 1 comparisons", "Ties go to the left half for stability", "Skip the merge if left[-1] <= right[0]"],
      },
      {
        heading: "Analysing the recursion tree",
        body: "The recurrence is T(n) = 2T(n/2) + O(n). Draw the tree: the top level merges n items. The next level has two merges of n/2 items, n in total. Every level does n work, and there are log2 n levels of splitting. So the total is n log2 n.\n\nThis holds for every input, because the splits always happen at the middle, no matter what the values are. Best, average and worst cases are all Theta(n log n) for the basic version.\n\nSpace has two parts. The merge buffers add up to O(n) at any one time if you reuse one buffer (the slicing version in the explainer allocates new lists each level, which is still O(n) live memory but more garbage). The recursion depth is log2 n, so the stack is O(log n). For n = 10^6, that is only 20 levels, far under Python's recursion limit.",
        visual: {
          type: "layers",
          title: "Work per level for n = 8",
          layers: [
            { label: "Level 0", detail: "1 merge of 8 items: 8 writes" },
            { label: "Level 1", detail: "2 merges of 4 items: 8 writes" },
            { label: "Level 2", detail: "4 merges of 2 items: 8 writes" },
            { label: "Level 3", detail: "8 single items: nothing to merge" },
            { label: "Total", detail: "3 levels x 8 = 24 writes = n log2 n" },
          ],
        },
      },
      {
        heading: "Bottom-up merge sort",
        body: "You do not need recursion at all. Treat each item as a sorted run of width 1. Merge neighbouring runs into runs of width 2, then 4, then 8, until one run covers the whole array. That is ceil(log2 n) passes, each O(n).\n\nThe bottom-up version avoids the recursion stack and slicing, and it works well with one auxiliary buffer: each pass reads from one array and writes into the other, then they swap roles.\n\nIt is also the natural way to merge sort a linked list. Merging two linked lists only relinks next pointers, so no extra array is needed. Bottom-up merge sort on a linked list runs in O(n log n) time with O(1) extra space, which is why it is the standard way to sort linked lists. The last run may be shorter than the others when n is not a power of two; the merge handles uneven sizes naturally.",
        bullets: ["Widths 1, 2, 4, 8 ... until width >= n", "ceil(log2 n) passes of O(n)", "Linked lists: O(1) extra space"],
      },
      {
        heading: "Merge sort in the real world",
        body: "Python's list.sort and sorted use Timsort, a merge sort that first finds runs already in order (ascending, or strictly descending, which it reverses), extends short ones with insertion sort, and merges them smartly. It uses a galloping mode that skips quickly through long stretches when one run keeps winning. Java uses Timsort for sorting objects, where stability is required.\n\nExternal sorting handles data bigger than memory, like a 100 GB file with 8 GB of RAM. Read chunks that fit in memory, sort each and write it to disk as a sorted run. Then do a k-way merge: keep a min-heap with the front item of each run, repeatedly output the smallest, and refill from its run. Each item is read and written a small number of times, and disk reads are sequential, which disks handle well.\n\nPython provides heapq.merge(*iterables) for lazily merging already sorted inputs.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Merging [1, 4] with [2, 3]",
        actors: ["Left [1, 4]", "Right [2, 3]", "Output"],
        messages: [
          { from: 0, to: 2, label: "1 < 2: take 1" },
          { from: 1, to: 2, label: "2 < 4: take 2" },
          { from: 1, to: 2, label: "3 < 4: take 3" },
          { from: 0, to: 2, label: "right empty: copy 4" },
        ],
      },
    ],
    examples: [
      {
        title: "Bottom-up merge sort with one buffer",
        explanation: "For [5, 2, 4, 6, 1, 3], width 1 merges pairs: [2, 5, 4, 6, 1, 3]. Width 2 merges runs of two: [2, 4, 5, 6, 1, 3]. Width 4 merges [2, 4, 5, 6] with [1, 3]: [1, 2, 3, 4, 5, 6]. Width 8 is larger than n, so we stop. Three passes, each O(n), no recursion.",
        code: {
          lang: "python",
          code: "def merge_sort_bu(a):\n    n, src, dst, width = len(a), a[:], [None] * len(a), 1\n    while width < n:\n        for lo in range(0, n, 2 * width):\n            mid, hi = min(lo + width, n), min(lo + 2 * width, n)\n            i, j = lo, mid\n            for k in range(lo, hi):\n                if j >= hi or (i < mid and src[i] <= src[j]):\n                    dst[k] = src[i]; i += 1\n                else:\n                    dst[k] = src[j]; j += 1\n        src, dst = dst, src\n        width *= 2\n    return src\n\nprint(merge_sort_bu([5, 2, 4, 6, 1, 3]))  # [1, 2, 3, 4, 5, 6]",
        },
      },
      {
        title: "Merging k sorted files with heapq.merge",
        explanation: "Imagine three log files, each already sorted by timestamp. heapq.merge keeps one item from each input in a small heap and yields the smallest each time. It never loads everything into memory, and with k inputs each output step costs O(log k). Total time for N items is O(N log k). The key argument works just like in sorted().",
        code: {
          lang: "python",
          code: "import heapq\n\nlog_a = [(1, 'a: start'), (5, 'a: done')]\nlog_b = [(2, 'b: start'), (3, 'b: retry'), (9, 'b: done')]\nlog_c = [(4, 'c: start')]\n\nfor ts, msg in heapq.merge(log_a, log_b, log_c):\n    print(ts, msg)\n# 1 a: start / 2 b: start / 3 b: retry / 4 c: start / 5 a: done / 9 b: done",
        },
      },
    ],
    cheatSheet: [
      "Time: Theta(n log n) best, average and worst for the basic version",
      "Extra space: O(n) buffer plus O(log n) recursion stack",
      "Stable when ties take from the left half (<=)",
      "Skip the merge when left[-1] <= right[0]: sorted input becomes O(n)",
      "Bottom-up: merge widths 1, 2, 4 ... for ceil(log2 n) passes, no recursion",
      "Linked lists: merge sort in O(n log n) time and O(1) extra space",
      "heapq.merge(*sorted_iterables) merges lazily in O(N log k)",
    ],
    quiz: [
      {
        q: "How many comparisons can merging two sorted lists of sizes 4 and 6 take at most?",
        options: ["10", "24", "9", "5"],
        answer: 2,
        why: "Each comparison outputs one item, and the last item needs no comparison: 4 + 6 - 1 = 9.",
      },
      {
        q: "Why is merge sort's worst case the same as its best case?",
        options: ["The split always happens at the middle regardless of values", "It uses random pivots", "It checks if the input is sorted first", "It only works on distinct values"],
        answer: 0,
        why: "The recursion tree shape depends only on n, so every input does about n log n work.",
      },
      {
        q: "How many passes does bottom-up merge sort make on 1,000 items?",
        options: ["1000", "500", "100", "10"],
        answer: 3,
        why: "Widths double from 1 until they reach at least n: ceil(log2 1000) = 10 passes.",
      },
      {
        q: "Which task is merge sort especially suited to?",
        options: ["Finding the median quickly", "Sorting a file far larger than RAM", "Sorting with no extra memory on arrays", "Sorting tiny arrays of 5 items"],
        answer: 1,
        why: "External sorting writes sorted runs to disk and merges them with sequential reads.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write merge(a, b) that merges two sorted lists into one sorted list without calling sort. Example: merge([1, 3, 5], [2, 4]) gives [1, 2, 3, 4, 5].",
        hint: "Two indexes and a loop that runs while both lists have items left.",
        solution: "def merge(a, b):\n    out, i, j = [], 0, 0\n    while i < len(a) and j < len(b):\n        if a[i] <= b[j]:\n            out.append(a[i]); i += 1\n        else:\n            out.append(b[j]); j += 1\n    return out + a[i:] + b[j:]\n\nprint(merge([1, 3, 5], [2, 4]))  # [1, 2, 3, 4, 5]",
      },
      {
        level: "medium",
        task: "Given a linked list built from class Node(val, next), write merge_lists(a, b) that merges two sorted lists by relinking nodes, without creating new nodes except one dummy head.",
        hint: "Keep a tail pointer starting at a dummy node; attach the smaller head each time.",
        solution: "class Node:\n    def __init__(self, val, next=None): self.val, self.next = val, next\n\ndef merge_lists(a, b):\n    dummy = tail = Node(0)\n    while a and b:\n        if a.val <= b.val: tail.next, a = a, a.next\n        else: tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next",
      },
      {
        level: "hard",
        task: "Write sort_list(head) that merge sorts a linked list top-down: find the middle with slow and fast pointers, split, sort each half, and merge with merge_lists. Time O(n log n).",
        hint: "Start fast at head.next so that a two-node list splits into one and one.",
        solution: "def sort_list(head):\n    if not head or not head.next:\n        return head\n    slow, fast = head, head.next\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n    right, slow.next = slow.next, None\n    return merge_lists(sort_list(head), sort_list(right))\n# Stack depth O(log n); no arrays allocated",
      },
    ],
    faq: [
      { q: "Is merge sort faster than quicksort?", a: "Both are O(n log n) on average. Quicksort is often faster on arrays because it works in place with good cache use, while merge sort wins when you need stability, guaranteed worst-case time, linked lists or external data." },
      { q: "Does Python use merge sort?", a: "Python uses Timsort, a hybrid of merge sort and insertion sort that finds existing sorted runs. It is stable and runs in O(n log n) worst case and O(n) on already sorted data." },
      { q: "Can merge sort be done in place?", a: "In-place merging algorithms exist, but they are complex and much slower in practice. Standard implementations use an O(n) buffer." },
    ],
  },

  "dsa-recursion-sorting/quicksort": {
    plain: [
      "Quicksort picks one item called the pivot. It then rearranges the list so that every item smaller than the pivot is on its left and every larger item is on its right. Now the pivot is in its final place. Repeat the same thing on the left part and the right part.",
      "Picture a teacher lining up students by height. She picks one student, says \"shorter ones stand to my left, taller to my right\", and then does the same for each group. Each group shrinks until every group has one student.",
      "If the pivot lands near the middle each time, the groups halve, and the whole sort takes about n log n steps. If the pivot is always the smallest or largest item, one group is empty and the other barely shrinks. Then it takes about n^2 steps. Picking the pivot at random makes that bad case extremely unlikely.",
      "Quicksort sorts in place, using very little extra memory, and it is fast on real computers. A close relative, quickselect, uses the same splitting to find, for example, the median or the 10th smallest item without sorting everything.",
    ],
    deepDive: [
      {
        heading: "Lomuto versus Hoare partitioning",
        body: "Lomuto partition uses the last element as pivot and one write index i. Scan j from left to right; whenever a[j] < pivot, swap it into position i and advance i. Finally swap the pivot into position i. It is simple and returns the pivot's final index.\n\nHoare partition uses two indexes moving towards each other. The left one moves right while items are less than the pivot; the right one moves left while items are greater. When both stop, swap the two items and continue until the indexes cross. On average Hoare does about three times fewer swaps than Lomuto and handles many equal keys better, because equal items stop both scans and get spread across both sides.\n\nThe catch with Hoare: the pivot does not necessarily end up in its final position, and the function returns a split point j. You then recurse on a[lo..j] and a[j+1..hi], not on j - 1.",
        bullets: ["Lomuto: one scan, pivot placed exactly, more swaps", "Hoare: two scans inward, fewer swaps, recurse on [lo, j] and [j+1, hi]", "Both: O(n) time per partition, O(1) extra space"],
        visual: {
          type: "compare",
          title: "Lomuto and Hoare",
          columns: [
            { title: "Lomuto", points: ["Pivot = last element", "One pointer scans left to right", "Returns pivot's final index", "Degrades to O(n^2) on all-equal keys"] },
            { title: "Hoare", points: ["Pivot = middle or first element", "Two pointers move inward", "Returns a split point, not the pivot index", "Splits equal keys evenly"] },
          ],
        },
      },
      {
        heading: "Why the worst case is O(n^2), and how to avoid it",
        body: "Each partition costs O(n). If the pivot splits the array into sizes n - 1 and 0, the recurrence becomes T(n) = T(n - 1) + O(n), which sums to n(n - 1)/2 comparisons: quadratic. With a last-element pivot this happens on already sorted or reversed input, which is very common in practice.\n\nRandom pivots fix this in expectation. The expected number of comparisons is about 2n ln n, roughly 1.39 n log2 n, for every input. No specific input is bad; only unlucky coin flips are, and the chance of quadratic behaviour on large inputs is tiny.\n\nMedian-of-three takes the median of the first, middle and last elements. It handles sorted input well and gives slightly better splits, but crafted inputs can still defeat it. That is why C++ std::sort uses introsort: quicksort that switches to heapsort if recursion gets deeper than about 2 log2 n, guaranteeing O(n log n).",
        bullets: ["Bad split every time: T(n) = T(n-1) + O(n) = O(n^2)", "Random pivot: about 1.39 n log2 n expected comparisons", "Introsort caps the worst case at O(n log n)"],
      },
      {
        heading: "Duplicates and three-way partitioning",
        body: "If many keys are equal, Lomuto puts all items equal to the pivot on one side. An array of all equal values then produces the worst-case split every time: O(n^2).\n\nThree-way partitioning, also known as the Dutch national flag method, splits into three regions: less than, equal to, and greater than the pivot. Keep three indexes lt, i and gt. If a[i] < pivot, swap it to the lt region and advance both. If greater, swap it with a[gt] and shrink gt (do not advance i, because the swapped-in item is unchecked). If equal, just advance i. Then recurse only on the less and greater regions.\n\nWith few distinct values, this approaches O(n) per distinct value. Java's sort for primitive arrays uses a dual-pivot quicksort that also groups equal elements well.",
        visual: {
          type: "flow",
          title: "Three-way partition regions",
          steps: [
            { label: "a[lo..lt-1]", detail: "Less than pivot." },
            { label: "a[lt..i-1]", detail: "Equal to pivot." },
            { label: "a[i..gt]", detail: "Not yet examined." },
            { label: "a[gt+1..hi]", detail: "Greater than pivot." },
            { label: "Recurse", detail: "Only on the less and greater regions." },
          ],
        },
      },
      {
        heading: "Stack depth and practical tuning",
        body: "Quicksort's stack depth is O(log n) on average, but O(n) in the worst case, which in Python means RecursionError for large bad inputs. A standard fix: recurse into the smaller side and loop on the larger side. The smaller side is at most half the size, so the depth is at most log2 n, even with bad pivots.\n\nOther tuning used by library sorts: stop recursing on small ranges (around 16 elements) and finish with insertion sort; choose pivots by median-of-three or a sample; and use three-way partitioning when duplicates are common.\n\nQuicksort is not stable: partitioning swaps items over long distances. If you need stability, use merge sort or Timsort. In Python you will rarely write quicksort for production, because sorted() is implemented in C and is faster. You write it to understand partitioning, which powers quickselect and many array problems.",
        bullets: ["Recurse on the smaller side: depth at most log2 n", "Insertion sort below about 16 items", "Not stable"],
      },
      {
        heading: "Quickselect for the k-th smallest",
        body: "After partitioning, the pivot is at its final sorted index p. If p equals k, you are done. If k < p, the answer is on the left; otherwise on the right. Unlike quicksort, you recurse into only one side.\n\nWith random pivots, the expected work is n + n/2 + n/4 + ... which is O(n), between about 2n and 3.4n comparisons depending on k. The worst case is still O(n^2). The median-of-medians algorithm picks a pivot guaranteed to be near the middle and gives O(n) worst case, but its constant factor is large, so it is rarely used directly.\n\nAlternatives in Python: heapq.nsmallest(k, a) runs in O(n log k) and is great for small k. sorted(a)[k] is O(n log n) and often fastest for moderate sizes because it runs in C. statistics.median sorts the data. numpy.partition implements introselect if you use NumPy.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Quickselect for k = 2 (third smallest) in [7, 2, 9, 4, 1]",
        root: "Pivot 4: [2, 1] 4 [7, 9], pivot index 2",
        children: [
          { label: "k == 2: answer is 4", children: ["Only one partition needed"] },
          { label: "If k were 0 or 1", children: ["Recurse into [2, 1] only"] },
          { label: "If k were 3 or 4", children: ["Recurse into [7, 9] only"] },
        ],
      },
    ],
    examples: [
      {
        title: "Hoare partition with tail-call elimination",
        explanation: "This quicksort uses Hoare's scheme. It swaps a random element to the front and uses it as the pivot (a pivot taken from the last slot can make Hoare return hi and loop forever). Then it recurses into the smaller part and loops on the larger part. It sorts the list in place. The while loop replaces the second recursive call, so stack depth stays at most log2 n even with unlucky pivots.",
        code: {
          lang: "python",
          code: "import random\ndef quicksort(a, lo, hi):\n    while lo < hi:\n        r = random.randint(lo, hi); a[lo], a[r] = a[r], a[lo]\n        p, i, j = a[lo], lo - 1, hi + 1\n        while True:\n            i += 1\n            while a[i] < p: i += 1\n            j -= 1\n            while a[j] > p: j -= 1\n            if i >= j: break\n            a[i], a[j] = a[j], a[i]\n        if j - lo < hi - j: quicksort(a, lo, j); lo = j + 1\n        else: quicksort(a, j + 1, hi); hi = j\n\na = [3, 8, 2, 5, 1, 4, 7, 6]; quicksort(a, 0, len(a) - 1); print(a)",
        },
      },
      {
        title: "Quickselect: the k-th smallest in expected O(n)",
        explanation: "To find the median of 101 numbers we need k = 50 (0-based). Each round partitions around a random pivot with a three-way split into less, equal and greater lists. If k falls inside the equal block, we return the pivot. Otherwise we keep only the side containing k and adjust k. This version builds new lists for clarity; an in-place version uses the Lomuto partition from the explainer.",
        code: {
          lang: "python",
          code: "import random\n\ndef quickselect(a, k):\n    while True:\n        p = random.choice(a)\n        less = [x for x in a if x < p]\n        equal = a.count(p)\n        if k < len(less):\n            a = less\n        elif k < len(less) + equal:\n            return p\n        else:\n            k -= len(less) + equal\n            a = [x for x in a if x > p]\n\nprint(quickselect([7, 2, 9, 4, 1], 2))  # 4",
        },
      },
    ],
    cheatSheet: [
      "Average O(n log n), worst O(n^2), in-place, not stable",
      "Random pivot: about 1.39 n log2 n expected comparisons on any input",
      "Lomuto: recurse on [lo, p-1] and [p+1, hi]; Hoare: on [lo, j] and [j+1, hi]",
      "Many duplicates: three-way partition into <, ==, >",
      "Recurse on the smaller side and loop on the larger: stack O(log n)",
      "Quickselect: expected O(n), worst O(n^2); median of medians: O(n) worst",
      "Small k: heapq.nsmallest(k, a) in O(n log k)",
    ],
    quiz: [
      {
        q: "Quicksort with a last-element pivot runs on an already sorted array of n items. What is the time?",
        options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"],
        answer: 3,
        why: "Each pivot is the maximum, so splits are n - 1 and 0, giving n(n - 1)/2 comparisons.",
      },
      {
        q: "After a Hoare partition returns j, which ranges do you recurse on?",
        options: ["[lo, j] and [j + 1, hi]", "[lo, j - 1] and [j + 1, hi]", "[lo, j - 1] and [j, hi]", "Only the larger range"],
        answer: 0,
        why: "Hoare's split point is not necessarily the pivot's final index, so j stays in the left range.",
      },
      {
        q: "What is the main benefit of three-way partitioning?",
        options: ["It makes quicksort stable", "It avoids recursion entirely", "It handles many equal keys efficiently", "It guarantees O(n log n) worst case"],
        answer: 2,
        why: "Equal keys are grouped once and excluded from further recursion.",
      },
      {
        q: "What is the expected time of quickselect with random pivots?",
        options: ["O(n log n)", "O(n)", "O(log n)", "O(k log n)"],
        answer: 1,
        why: "It recurses into one side, so expected work is n + n/2 + n/4 + ... = O(n).",
      },
      {
        q: "How does introsort guarantee O(n log n)?",
        options: ["It always picks the true median", "It switches to heapsort when recursion gets too deep", "It sorts small arrays with merge sort", "It shuffles the input first"],
        answer: 1,
        why: "Once depth exceeds about 2 log2 n, it falls back to heapsort, which is O(n log n) worst case.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write lomuto(a, lo, hi) that partitions a[lo..hi] around a[hi] and returns the pivot's final index. Example: on [4, 7, 2, 6, 5] it returns 2 and the list becomes [4, 2, 5, 6, 7].",
        hint: "Keep i as the next spot for a small item. Swap the pivot to i at the end.",
        solution: "def lomuto(a, lo, hi):\n    pivot, i = a[hi], lo\n    for j in range(lo, hi):\n        if a[j] < pivot:\n            a[i], a[j] = a[j], a[i]\n            i += 1\n    a[i], a[hi] = a[hi], a[i]\n    return i\n\na = [4, 7, 2, 6, 5]\nprint(lomuto(a, 0, 4), a)  # 2 [4, 2, 5, 6, 7]",
      },
      {
        level: "medium",
        task: "Write sort_colors(a) that sorts a list of 0s, 1s and 2s in one pass and in place (Dutch national flag). Example: [2, 0, 2, 1, 1, 0] becomes [0, 0, 1, 1, 2, 2].",
        hint: "Three-way partition with pivot 1: indexes lt, i and gt.",
        solution: "def sort_colors(a):\n    lt, i, gt = 0, 0, len(a) - 1\n    while i <= gt:\n        if a[i] == 0:\n            a[lt], a[i] = a[i], a[lt]; lt += 1; i += 1\n        elif a[i] == 2:\n            a[i], a[gt] = a[gt], a[i]; gt -= 1\n        else:\n            i += 1\n    return a\n\nprint(sort_colors([2, 0, 2, 1, 1, 0]))  # [0, 0, 1, 1, 2, 2]",
      },
      {
        level: "hard",
        task: "Write kth_largest(a, k) in place with quickselect using the lomuto function and a random pivot, in expected O(n). Example: kth_largest([3, 2, 1, 5, 6, 4], 2) is 5.",
        hint: "The k-th largest is index len(a) - k in sorted order. Swap a random element to hi before partitioning.",
        solution: "import random\n\ndef kth_largest(a, k):\n    target, lo, hi = len(a) - k, 0, len(a) - 1\n    while True:\n        r = random.randint(lo, hi)\n        a[r], a[hi] = a[hi], a[r]\n        p = lomuto(a, lo, hi)\n        if p == target: return a[p]\n        if p < target: lo = p + 1\n        else: hi = p - 1\n\nprint(kth_largest([3, 2, 1, 5, 6, 4], 2))  # 5",
      },
    ],
    faq: [
      { q: "Why is it called quicksort if its worst case is O(n^2)?", a: "In practice it is very fast: it works in place, has a tight inner loop and good cache behaviour. With random or well-chosen pivots the quadratic case is extremely unlikely." },
      { q: "Is quicksort stable?", a: "No. Partitioning swaps items across long distances, so equal items can change order. Use merge sort or Python's sorted() when stability matters." },
      { q: "What is the fastest way to get the median in Python?", a: "statistics.median(a) is simple and runs in O(n log n) because it sorts. For huge arrays, numpy.median or numpy.partition use a selection algorithm and are much faster." },
    ],
  },

  "dsa-recursion-sorting/counting-radix-sort": {
    plain: [
      "Most sorts work by comparing two items: is this one smaller than that one? There is a mathematical limit to how fast that can be: about n log n comparisons. But if your items are small whole numbers, you can skip comparing altogether.",
      "Counting sort works like sorting exam papers by grade from 0 to 100. You set up 101 piles, put each paper on the pile for its grade, and then pick up the piles in order. No two papers are ever compared. The time depends on the number of papers plus the number of piles.",
      "Radix sort handles bigger numbers. It sorts by the last digit first, then by the second-last digit, and so on. Each round uses a stable counting sort with only 10 piles. After the last round, the numbers are fully sorted.",
      "In everyday Python you do not write these yourself. You call sorted() and tell it what to sort by with a key function, for example sorted(people, key=lambda p: p.age). Understanding the special sorts helps you recognise when a problem can be solved in linear time.",
    ],
    deepDive: [
      {
        heading: "The n log n lower bound for comparison sorts",
        body: "Any sort that learns about the order only by comparing pairs can be drawn as a decision tree. Each internal node is a comparison, each branch is its outcome, and each leaf is one final ordering. There are n! possible orderings of n distinct items, so the tree needs at least n! leaves.\n\nA binary tree of height h has at most 2^h leaves, so h >= log2(n!). Using Stirling's approximation, log2(n!) is about n log2 n - 1.44n, which is Omega(n log n). The height is the worst-case number of comparisons, so no comparison sort can beat this.\n\nFor n = 10, log2(10!) is about 21.8, so at least 22 comparisons are needed in the worst case. Merge sort and heap sort achieve O(n log n), so they are optimal up to constants. Counting and radix sort escape the bound because they never compare items; they use the values as array indexes.",
        bullets: ["n! possible orderings need log2(n!) yes/no answers", "log2(n!) is about n log2 n - 1.44n", "Using values as indexes avoids the bound"],
      },
      {
        heading: "Stable counting sort with prefix sums",
        body: "The simple version in the explainer rebuilds the output from counts, which loses any data attached to the keys. To sort records by an integer key and stay stable, use prefix sums.\n\nStep 1: count how many records have each key. Step 2: turn counts into starting positions with a running total, so pos[v] is the number of records with key less than v. Step 3: walk the input from left to right, place each record at pos[key] and increase pos[key]. Records with the same key are placed in the order they appeared: stable.\n\n(Many textbooks compute end positions and walk backwards instead; the result is the same.) Time is O(n + k) and extra space O(n + k), where k is the number of possible key values. It only pays off when k is not much larger than n. Sorting 1,000 ages in the range 0 to 120 is perfect. Sorting 1,000 values up to 10^9 would need a billion counters.",
        visual: {
          type: "flow",
          title: "Stable counting sort, keys 0 to 3",
          steps: [
            { label: "Input keys", detail: "[2, 0, 2, 1, 3, 0]" },
            { label: "Count", detail: "count = [2, 1, 2, 1]" },
            { label: "Start positions", detail: "pos = [0, 2, 3, 5]" },
            { label: "Place in order", detail: "Each record goes to pos[key], then pos[key] += 1." },
            { label: "Output", detail: "[0, 0, 1, 2, 2, 3], equal keys in input order" },
          ],
        },
      },
      {
        heading: "LSD radix sort",
        body: "Least significant digit (LSD) radix sort processes digits from the right. Each pass sorts the whole list by one digit using a stable counting sort with b buckets (the base). After pass i, the list is sorted by its last i digits. Stability is the reason this works: when two numbers tie on the current digit, their order from earlier passes, which reflects the lower digits, is kept.\n\nWith d digits in base b, the time is O(d (n + b)). For 32-bit unsigned integers in base 256, d = 4 passes, each with 256 buckets, so the sort is linear in n. Choosing a larger base means fewer passes but more buckets.\n\nNegative numbers need care: sort by value plus an offset, or split negatives and positives. Strings of equal length can be radix sorted character by character from the right. Most significant digit (MSD) radix sort goes left to right and recurses into each bucket, which suits variable-length strings.",
        bullets: ["Time O(d (n + b)), space O(n + b)", "The inner sort must be stable", "32-bit ints: 4 passes of base 256"],
      },
      {
        heading: "Sorting in practice: key functions and Timsort",
        body: "Python's list.sort() sorts in place and returns None. sorted() returns a new list and accepts any iterable. Both take key= and reverse=. The key function is called exactly once per item, and the results are compared. That is faster than an old-style comparison function, which would be called O(n log n) times. Use functools.cmp_to_key if you truly need pairwise logic.\n\nThe sort is guaranteed stable, even with reverse=True. So multi-key sorts can be done in passes: sort by the secondary key, then by the primary. Or use a tuple key: key=lambda p: (-p.age, p.name) sorts by age descending, then name ascending. Negation only works for numbers; for strings, use two stable passes with reverse.\n\noperator.itemgetter(1) and operator.attrgetter('age') are fast, readable key functions. Timsort is O(n log n) worst case and O(n) on data that is already sorted or made of a few sorted runs.",
        bullets: ["list.sort() is in place and returns None", "key is called once per item", "Stable even with reverse=True"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "LSD radix sort on [170, 45, 75, 90, 802, 24, 2, 66]",
        steps: [
          { label: "By ones digit", detail: "[170, 90, 802, 2, 24, 45, 75, 66]" },
          { label: "By tens digit", detail: "[802, 2, 24, 45, 66, 170, 75, 90]" },
          { label: "By hundreds digit", detail: "[2, 24, 45, 66, 75, 90, 170, 802]" },
          { label: "Done", detail: "3 digits, 3 stable passes, no comparisons" },
        ],
      },
    ],
    examples: [
      {
        title: "Radix sort for non-negative integers",
        explanation: "This LSD radix sort uses base 10 and a bucket list for each digit. Appending to buckets in input order and then concatenating them is a stable counting sort. The loop runs once per digit of the largest number. For [170, 45, 75, 90, 802, 24, 2, 66] it makes three passes and prints the sorted list.",
        code: {
          lang: "python",
          code: "def radix_sort(a, base=10):\n    if not a:\n        return a\n    exp, biggest = 1, max(a)\n    while biggest // exp > 0:\n        buckets = [[] for _ in range(base)]\n        for x in a:\n            buckets[(x // exp) % base].append(x)\n        a = [x for b in buckets for x in b]\n        exp *= base\n    return a\n\nprint(radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))\n# [2, 24, 45, 66, 75, 90, 170, 802]",
        },
      },
      {
        title: "Multi-key sorting with stable passes",
        explanation: "We want employees by department ascending, and inside each department by salary descending, and for equal salaries by name ascending. A tuple key handles numbers with negation. When a field cannot be negated (like a string in descending order), do stable passes from the least important key to the most important.",
        code: {
          lang: "python",
          code: "from operator import itemgetter\n\nstaff = [('ana', 'ops', 70), ('bo', 'dev', 90),\n         ('cy', 'dev', 90), ('di', 'ops', 80), ('ed', 'dev', 75)]\n\nby_tuple = sorted(staff, key=lambda s: (s[1], -s[2], s[0]))\n\nby_passes = sorted(staff, key=itemgetter(0))              # name asc\nby_passes.sort(key=itemgetter(2), reverse=True)           # salary desc\nby_passes.sort(key=itemgetter(1))                         # dept asc\n\nprint(by_tuple == by_passes)  # True\nprint([s[0] for s in by_tuple])  # ['bo', 'cy', 'ed', 'di', 'ana']",
        },
      },
    ],
    cheatSheet: [
      "Comparison sorts need at least log2(n!), about n log2 n, comparisons in the worst case",
      "Counting sort: O(n + k) time and space for keys in range 0..k-1",
      "Stable counting sort: counts, prefix sums to start positions, place in input order",
      "LSD radix sort: O(d (n + b)); each pass must be stable",
      "list.sort() sorts in place and returns None; sorted() returns a new list",
      "Python's sort is stable, also with reverse=True: sort by secondary key first",
      "Descending numbers in a tuple key: use -value",
      "functools.cmp_to_key wraps an old-style compare(a, b) function",
    ],
    quiz: [
      {
        q: "You must sort 10 million exam scores from 0 to 100. Which method is asymptotically fastest?",
        options: ["Merge sort", "Quicksort", "Insertion sort", "Counting sort"],
        answer: 3,
        why: "With only 101 possible keys, counting sort runs in O(n + 101), linear time.",
      },
      {
        q: "Why must LSD radix sort use a stable sort for each digit?",
        options: ["To save memory", "To keep the order established by lower digits when higher digits tie", "Because unstable sorts cannot handle digits", "To handle negative numbers"],
        answer: 1,
        why: "Ties on the current digit must keep the order already sorted by less significant digits.",
      },
      {
        q: "What is the minimum worst-case number of comparisons to sort 4 distinct items with any comparison sort?",
        options: ["5", "4", "6", "3"],
        answer: 0,
        why: "log2(4!) = log2(24), about 4.58, so at least 5 comparisons are needed.",
      },
      {
        q: "What does nums.sort() return?",
        options: ["The sorted list", "A new sorted copy", "None", "An iterator"],
        answer: 2,
        why: "list.sort() sorts in place and returns None; sorted(nums) returns a new list.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Sort a list of words by length, and words of equal length alphabetically, with one call to sorted. Example: ['pear', 'fig', 'apple', 'kiwi'] gives ['fig', 'kiwi', 'pear', 'apple'].",
        hint: "Use a tuple key: (len(w), w).",
        solution: "words = ['pear', 'fig', 'apple', 'kiwi']\nprint(sorted(words, key=lambda w: (len(w), w)))\n# ['fig', 'kiwi', 'pear', 'apple']",
      },
      {
        level: "medium",
        task: "Write counting_sort_by_key(records, key, k) that stably sorts records by an integer key in range 0..k-1 using counts and prefix sums. Example: sort [('a', 2), ('b', 0), ('c', 2), ('d', 1)] by the number.",
        hint: "Count keys, convert to start positions, then place records in input order.",
        solution: "def counting_sort_by_key(records, key, k):\n    count = [0] * k\n    for r in records: count[key(r)] += 1\n    pos, total = [0] * k, 0\n    for v in range(k): pos[v], total = total, total + count[v]\n    out = [None] * len(records)\n    for r in records:\n        out[pos[key(r)]] = r; pos[key(r)] += 1\n    return out\n\nrecs = [('a', 2), ('b', 0), ('c', 2), ('d', 1)]\nprint(counting_sort_by_key(recs, lambda r: r[1], 3))\n# [('b', 0), ('d', 1), ('a', 2), ('c', 2)]",
      },
      {
        level: "hard",
        task: "Find the maximum gap between successive elements in sorted order of a list of non-negative integers in O(n) time without a comparison sort. Example: [3, 6, 9, 1] gives 3.",
        hint: "Radix sort the list in linear time, then scan neighbouring pairs. (A bucket method based on the pigeonhole principle also works.)",
        solution: "def maximum_gap(a):\n    if len(a) < 2:\n        return 0\n    s = radix_sort(a)          # from the example, O(d (n + 10))\n    return max(s[i + 1] - s[i] for i in range(len(s) - 1))\n\nprint(maximum_gap([3, 6, 9, 1]))  # 3",
      },
    ],
    faq: [
      { q: "If radix sort is linear, why doesn't Python use it?", a: "It only works directly on integers or fixed-length keys, needs extra memory, and its constant factors are high. Timsort works on any comparable objects and is very fast on real data with existing order." },
      { q: "What is the difference between sort() and sorted()?", a: "list.sort() changes the list in place and returns None. sorted() accepts any iterable and returns a new list, leaving the original unchanged." },
      { q: "How do I sort in descending order by one field and ascending by another?", a: "For numbers, negate in a tuple key, like key=lambda x: (-x.score, x.name). Otherwise, sort in stable passes from the least important key to the most important, using reverse=True where needed." },
    ],
  },

  "dsa-recursion-sorting/binary-search": {
    plain: [
      "Binary search is how you find a word in a paper dictionary. You open it in the middle. If your word comes earlier, you ignore the second half; if later, you ignore the first half. Each look throws away half of what is left.",
      "That halving is very powerful. A sorted list of one million items needs only about 20 looks. A billion items needs about 30. A simple scan from the start could need a billion looks.",
      "Binary search needs one thing: the data must be sorted, or more generally, there must be a yes-or-no question whose answers go \"no, no, no, yes, yes, yes\" without switching back. You search for the point where the answer flips.",
      "That second idea opens up many problems. \"What is the smallest truck capacity that ships all boxes in 5 days?\" Bigger capacities always work if smaller ones do. So you can binary search over the capacity itself, even though there is no sorted list in sight.",
      "Binary search is short, but easy to get wrong by one. The trick is to decide exactly what lo and hi mean and keep that promise on every loop.",
    ],
    deepDive: [
      {
        heading: "Invariants that prevent off-by-one bugs",
        body: "Pick one convention and never mix it. The half-open style keeps the answer in [lo, hi): lo is a possible answer, hi is one past the last possible answer. Start with lo = 0, hi = len(a). Loop while lo < hi. Compute mid = (lo + hi) // 2, which is always strictly less than hi. If mid could be the answer, set hi = mid; otherwise set lo = mid + 1. Each step shrinks the range, and the loop ends with lo == hi, the answer.\n\nThe closed style keeps the answer in [lo, hi] with hi = len(a) - 1, loops while lo <= hi, and uses hi = mid - 1 or lo = mid + 1. It suits \"find exact match or return -1\".\n\nThe classic infinite loop: using lo = mid together with mid = (lo + hi) // 2. When hi = lo + 1, mid equals lo and nothing changes. If you need lo = mid, round up: mid = (lo + hi + 1) // 2.",
        bullets: ["[lo, hi): while lo < hi, hi = mid or lo = mid + 1", "[lo, hi]: while lo <= hi, hi = mid - 1 or lo = mid + 1", "lo = mid needs mid rounded up"],
      },
      {
        heading: "First and last occurrence with bisect",
        body: "In a sorted list with duplicates, lower bound is the first index i with a[i] >= x. Upper bound is the first index with a[i] > x. The occurrences of x fill exactly the range [lower, upper), so the count is upper - lower, found in O(log n).\n\nPython's bisect module provides these: bisect_left(a, x) is the lower bound and bisect_right(a, x) (also called bisect) is the upper bound. To test membership: i = bisect_left(a, x); found = i < len(a) and a[i] == x. Last occurrence is bisect_right(a, x) - 1 if that index holds x.\n\ninsort_left and insort_right insert while keeping the list sorted: O(log n) to find the spot but O(n) to shift elements. Since Python 3.10, all bisect functions take a key= argument, applied to the list items (not to x), so x must already be a key value.",
        bullets: ["count of x = bisect_right(a, x) - bisect_left(a, x)", "Largest item < x: a[bisect_left(a, x) - 1]", "key= on bisect functions needs Python 3.10+"],
        visual: {
          type: "flow",
          title: "bisect on a = [1, 3, 3, 3, 5], x = 3",
          steps: [
            { label: "bisect_left", detail: "Returns 1: first index with a[i] >= 3." },
            { label: "bisect_right", detail: "Returns 4: first index with a[i] > 3." },
            { label: "Range [1, 4)", detail: "All the 3s." },
            { label: "Count", detail: "4 - 1 = 3 copies." },
          ],
        },
      },
      {
        heading: "Searching a rotated sorted array",
        body: "A sorted array rotated at some pivot looks like [4, 5, 6, 7, 0, 1, 2]. It is not sorted, but one fact rescues binary search: for any mid, at least one of the two halves [lo, mid] or [mid, hi] is sorted.\n\nWith distinct values and the closed convention: if a[lo] <= a[mid], the left half is sorted. Then the target is in the left half exactly when a[lo] <= target < a[mid]; otherwise go right. If instead the right half is sorted, the target is there exactly when a[mid] < target <= a[hi]. Each step still halves the range, so it is O(log n).\n\nTo find the rotation point (the minimum), compare a[mid] with a[hi]: if a[mid] > a[hi], the minimum is to the right of mid; otherwise it is at mid or to the left. With duplicates, a case like a[mid] == a[hi] gives no information, so you can only drop hi by one, and the worst case becomes O(n).",
      },
      {
        heading: "Binary search on the answer",
        body: "Many optimisation problems have the shape: find the smallest value v such that feasible(v) is true, where feasible is monotonic (once true, true for all bigger v). Then binary search over v instead of over an array.\n\nThe recipe: find a range [lo, hi] that surely contains the answer. Write feasible(v), usually a greedy O(n) check. Run the half-open lower-bound loop: if feasible(mid), hi = mid, else lo = mid + 1. Total time is O(n log R) where R is the range size.\n\nExample: ship packages in order within D days; find the minimum ship capacity. lo = max(weights) (one package must fit), hi = sum(weights) (one day). feasible(c) loads packages greedily day by day and counts days needed. Other examples: Koko eating bananas, splitting an array into k parts to minimise the largest sum, or the square root of an integer. For real-valued answers, loop a fixed number of times (say 100) instead of comparing floats.",
        visual: {
          type: "flow",
          title: "Ship within D days: search over capacity",
          steps: [
            { label: "Range", detail: "lo = max(w), hi = sum(w)" },
            { label: "Try mid", detail: "Simulate days needed with capacity mid." },
            { label: "Fits in D days", detail: "hi = mid (maybe smaller works)." },
            { label: "Too many days", detail: "lo = mid + 1" },
            { label: "lo == hi", detail: "Minimum capacity found." },
          ],
        },
      },
      {
        heading: "Real-world details",
        body: "In languages with fixed-size integers, (lo + hi) / 2 can overflow when lo and hi are large. A famous case was Java's Arrays.binarySearch, which carried this bug for years until it was fixed in 2006. Writing lo + (hi - lo) / 2 avoids it. Python integers never overflow, so (lo + hi) // 2 is safe.\n\nBinary search makes at most floor(log2 n) + 1 probes for an exact-match search: 20 for one million items. But each probe jumps around memory, so for small arrays (under roughly 100 items) a linear scan can be just as fast in compiled languages.\n\nBinary search appears in many tools. git bisect finds the commit that introduced a bug by testing the middle commit and halving. Databases use B-tree indexes, which are a many-way generalisation. And sorted arrays plus bisect make a simple, memory-light alternative to a balanced tree when updates are rare.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Two loop conventions",
        columns: [
          { title: "Half-open [lo, hi)", points: ["lo = 0, hi = len(a)", "while lo < hi", "hi = mid or lo = mid + 1", "Returns an insertion point"] },
          { title: "Closed [lo, hi]", points: ["lo = 0, hi = len(a) - 1", "while lo <= hi", "hi = mid - 1 or lo = mid + 1", "Returns index or -1"] },
        ],
      },
    ],
    examples: [
      {
        title: "Search in a rotated sorted array",
        explanation: "Search [4, 5, 6, 7, 0, 1, 2] for 0. lo = 0, hi = 6, mid = 3 (value 7). The left half [4..7] is sorted, but 0 is not in [4, 7), so go right: lo = 4. mid = 5 (value 1). a[4] = 0 <= 1, so the left half [0, 1] is sorted and 0 is in [0, 1): hi = 4. mid = 4, value 0: found at index 4.",
        code: {
          lang: "python",
          code: "def search_rotated(a, target):\n    lo, hi = 0, len(a) - 1\n    while lo <= hi:\n        mid = (lo + hi) // 2\n        if a[mid] == target:\n            return mid\n        if a[lo] <= a[mid]:                  # left half sorted\n            if a[lo] <= target < a[mid]: hi = mid - 1\n            else: lo = mid + 1\n        else:                                # right half sorted\n            if a[mid] < target <= a[hi]: lo = mid + 1\n            else: hi = mid - 1\n    return -1\n\nprint(search_rotated([4, 5, 6, 7, 0, 1, 2], 0))  # 4",
        },
      },
      {
        title: "Minimum ship capacity within D days",
        explanation: "weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], D = 5. The answer lies between 10 (the heaviest package) and 55 (everything in one day). The check fills each day greedily and starts a new day when the next package would not fit. Capacity 15 works: [1..5], [6, 7], [8], [9], [10] is 5 days. Capacity 14 needs 6 days. So the answer is 15, found with about log2(46), about 6, checks of O(n) each.",
        code: {
          lang: "python",
          code: "def ship_within_days(w, days):\n    def days_needed(cap):\n        d, load = 1, 0\n        for x in w:\n            if load + x > cap:\n                d, load = d + 1, 0\n            load += x\n        return d\n    lo, hi = max(w), sum(w)\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if days_needed(mid) <= days: hi = mid\n        else: lo = mid + 1\n    return lo\n\nprint(ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))  # 15",
        },
      },
    ],
    cheatSheet: [
      "Worst case floor(log2 n) + 1 probes: 20 for 10^6, 30 for 10^9",
      "Half-open: lo, hi = 0, len(a); while lo < hi; hi = mid or lo = mid + 1",
      "bisect_left: first i with a[i] >= x; bisect_right: first i with a[i] > x",
      "Count of x in sorted a: bisect_right(a, x) - bisect_left(a, x)",
      "If you write lo = mid, use mid = (lo + hi + 1) // 2 to avoid an infinite loop",
      "Search on answer: monotonic feasible(v), cost O(check x log range)",
      "Rotated array: one half is always sorted; with duplicates worst case is O(n)",
    ],
    quiz: [
      {
        q: "For a = [2, 4, 4, 4, 7], what does bisect_right(a, 4) return?",
        options: ["1", "3", "5", "4"],
        answer: 3,
        why: "It returns the first index whose value is greater than 4, which is index 4 (value 7).",
      },
      {
        q: "A loop uses mid = (lo + hi) // 2 and sometimes sets lo = mid. What can go wrong?",
        options: ["It may loop forever when hi = lo + 1", "It skips the last element", "It overflows in Python", "Nothing, it is always correct"],
        answer: 0,
        why: "With hi = lo + 1, mid equals lo, so lo = mid makes no progress.",
      },
      {
        q: "Which condition is required to binary search on an answer value v?",
        options: ["The input array is sorted", "feasible(v) is monotonic in v", "All values are distinct", "The answer is an integer power of two"],
        answer: 1,
        why: "The search needs one switch point from false to true; the input itself can be unsorted.",
      },
      {
        q: "In a rotated sorted array of distinct values, a[lo] <= a[mid]. What do you know?",
        options: ["The target is on the left", "The array is not rotated", "The left half [lo, mid] is sorted", "The minimum is at mid"],
        answer: 2,
        why: "With distinct values, a[lo] <= a[mid] means no rotation point lies inside [lo, mid].",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write search_range(a, x) that returns [first, last] indexes of x in a sorted list, or [-1, -1], in O(log n) using bisect. Example: ([5, 7, 7, 8, 8, 10], 8) gives [3, 4].",
        hint: "bisect_left for the first; bisect_right minus one for the last.",
        solution: "from bisect import bisect_left, bisect_right\n\ndef search_range(a, x):\n    lo = bisect_left(a, x)\n    if lo == len(a) or a[lo] != x:\n        return [-1, -1]\n    return [lo, bisect_right(a, x) - 1]\n\nprint(search_range([5, 7, 7, 8, 8, 10], 8))  # [3, 4]\nprint(search_range([5, 7, 7, 8, 8, 10], 6))  # [-1, -1]",
      },
      {
        level: "medium",
        task: "Write isqrt(n) that returns the largest integer r with r * r <= n using binary search, without math functions. Example: isqrt(26) is 5, isqrt(0) is 0.",
        hint: "Search for the last r where r * r <= n. Because you set lo = mid, round mid up.",
        solution: "def isqrt(n):\n    lo, hi = 0, n\n    while lo < hi:\n        mid = (lo + hi + 1) // 2\n        if mid * mid <= n: lo = mid\n        else: hi = mid - 1\n    return lo\n\nprint(isqrt(26), isqrt(0), isqrt(10**18))  # 5 0 1000000000\n# Python also has math.isqrt",
      },
      {
        level: "hard",
        task: "Write find_min_rotated(a) that returns the minimum of a rotated sorted array of distinct values in O(log n). Example: [4, 5, 6, 7, 0, 1, 2] gives 0, [1, 2, 3] gives 1.",
        hint: "Compare a[mid] with a[hi]. If a[mid] > a[hi], the minimum is right of mid.",
        solution: "def find_min_rotated(a):\n    lo, hi = 0, len(a) - 1\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if a[mid] > a[hi]:\n            lo = mid + 1\n        else:\n            hi = mid\n    return a[lo]\n\nprint(find_min_rotated([4, 5, 6, 7, 0, 1, 2]), find_min_rotated([1, 2, 3]))  # 0 1",
      },
    ],
    faq: [
      { q: "Does binary search work on linked lists?", a: "Not efficiently. Reaching the middle of a linked list takes O(n) steps, so the whole search is O(n). Use an array, a balanced tree or a skip list instead." },
      { q: "Should I use bisect or write my own binary search?", a: "Use bisect for sorted lists: it is implemented in C, tested and clear. Write your own when searching over an answer range or a custom condition." },
      { q: "Is it worth sorting just to binary search once?", a: "No. Sorting costs O(n log n), more than a single O(n) linear scan. Sort once when you will make many searches on the same data." },
    ],
  },
};

export default extra;
