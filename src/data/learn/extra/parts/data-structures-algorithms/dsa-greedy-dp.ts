import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-greedy-dp/greedy": {
    plain: [
      "A greedy algorithm is like a hungry person at a buffet who always grabs the best-looking dish right now and never puts anything back. It makes the choice that looks best at this moment and moves on. It never goes back to change an earlier choice.",
      "Sometimes that works perfectly. If you want to attend as many meetings as possible, always pick the meeting that ends first. It leaves you the most free time for the rest. Sometimes it fails badly, like paying 6 with coins 1, 3 and 4: taking the biggest coin first gives 4 + 1 + 1 (three coins), but 3 + 3 needs only two.",
      "So the hard part of greedy is not the code. The code is usually a sort plus one loop. The hard part is knowing whether the greedy choice is safe. For that, you either prove it or try hard to break it with small examples.",
      "When greedy works, it is very fast, usually O(n log n) because of the sort. When it does not, the usual fix is dynamic programming, which tries all choices but remembers results so it does not repeat work.",
    ],
    deepDive: [
      {
        heading: "The exchange argument, step by step",
        body: "To prove a greedy choice is safe, take any optimal solution and show you can swap the greedy choice into it without making it worse. For interval scheduling: let g be the meeting that ends first overall. Take any best schedule S and look at its first meeting f. Since g ends no later than f, replacing f with g cannot overlap anything else in S. The new schedule has the same number of meetings, so it is also optimal and it starts with g.\n\nNow repeat the argument on the meetings that start after g ends. By induction, the whole greedy schedule is optimal. Most greedy proofs follow this exact pattern: same size, still valid, contains the greedy choice.",
        visual: {
          type: "flow",
          title: "Shape of an exchange argument",
          steps: [
            { label: "Take any optimum S", detail: "It may disagree with greedy." },
            { label: "Find the first difference", detail: "S picks f where greedy picks g." },
            { label: "Swap f for g", detail: "Show the result is still valid." },
            { label: "Compare cost", detail: "It is no worse than S." },
            { label: "Repeat", detail: "Induction covers every later choice." },
          ],
        },
      },
      {
        heading: "The interval family",
        body: "Intervals are the most common greedy topic, and the right sort key changes with the question. To keep the most non-overlapping intervals, sort by end time. The minimum number to remove so the rest do not overlap is n minus that count. To merge overlapping intervals, sort by start time and extend the last merged interval. To find the minimum number of meeting rooms, sort by start time and keep a min-heap of end times: if the earliest end is at or before the new start, reuse that room (pop), then push the new end. The heap size at the end is the answer, in O(n log n).\n\nAlways ask whether touching intervals like [1, 2] and [2, 3] count as overlapping. Problems differ, and the answer changes whether you compare with < or <=.",
        bullets: ["Most non-overlapping: sort by end", "Merge: sort by start", "Rooms needed: sort by start, heap of ends", "Check the touching-endpoints rule"],
      },
      {
        heading: "Jump game and gas station",
        body: "Jump game asks whether you can reach the last index when nums[i] is the longest jump from i. Greedy keeps reach, the furthest index reachable so far. If the loop ever passes reach, you are stuck. For the fewest jumps, treat it like BFS in levels: track the end of the current level and the furthest point the next level can reach. When i reaches the current end, you must jump once more. Both run in O(n).\n\nGas station: a car drives a circle of stations. If the total gas is less than the total cost, no start works. Otherwise at least one start works, and you find one in a single pass: keep a running tank, and whenever it drops below zero at station i, no station from the current start up to i can be the start, so restart at i + 1 with an empty tank.",
      },
      {
        heading: "Where greedy breaks",
        body: "Greedy fails when an early cheap choice blocks a better combination later. Coin change with coins 1, 3, 4 is the classic case. With normal coins like 1, 5, 10, 25, greedy happens to be correct, but that is a property of those coins, not of the method.\n\nKnapsack shows the difference sharply. If you may take fractions of items (fractional knapsack), sorting by value per kilogram and filling up is optimal. If items are all-or-nothing (0/1 knapsack), the same rule fails: capacity 50, items (10 kg, 60), (20 kg, 100), (30 kg, 120). Best ratio first takes the first two for 160, but the last two give 220.\n\nTo hunt for counterexamples, write a brute force for tiny inputs and compare it with your greedy on thousands of random cases.",
        visual: {
          type: "compare",
          title: "Greedy works or fails",
          columns: [
            { title: "Greedy is optimal", points: ["Interval scheduling by end time", "Fractional knapsack by value per weight", "Huffman coding", "Dijkstra and MST"] },
            { title: "Greedy can fail", points: ["Coin change with arbitrary coins", "0/1 knapsack", "Longest path in a graph", "Travelling salesperson"] },
          ],
        },
      },
      {
        heading: "Greedy with a heap",
        body: "Many greedy algorithms repeatedly need \"the best item right now\" from a changing set, which is a job for a heap. Huffman coding, used inside compression formats such as DEFLATE, repeatedly merges the two lowest-frequency symbols into one node; each merge costs O(log n) with heapq, so building the code is O(n log n). The same pattern solves \"minimum cost to connect sticks\": always join the two shortest sticks.\n\nScheduling problems often combine a sort with a heap: sort tasks by deadline, keep the chosen tasks in a heap, and when the schedule becomes impossible, drop the worst task so far. Each step makes a locally best choice, and an exchange argument justifies it.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Pick the sort key for the question",
        root: "Greedy on a list",
        children: [
          { label: "Most non-overlapping intervals", children: ["Sort by end time"] },
          { label: "Merge intervals", children: ["Sort by start time"] },
          { label: "Meeting rooms needed", children: ["Sort by start, heap of end times"] },
          { label: "Fractional knapsack", children: ["Sort by value per weight, descending"] },
          { label: "Minimise maximum lateness", children: ["Sort by deadline"] },
        ],
      },
      {
        type: "flow",
        title: "Gas station: gas [1,2,3,4,5], cost [3,4,5,1,2]",
        steps: [
          { label: "Total check", detail: "Gas 15, cost 15: a start exists." },
          { label: "i = 0, 1, 2", detail: "Tank goes to -2 each time; restart after." },
          { label: "Start = 3", detail: "Tank 4 - 1 = 3." },
          { label: "i = 4", detail: "Tank 3 + 5 - 2 = 6." },
          { label: "Answer", detail: "Start at station 3." },
        ],
      },
    ],
    examples: [
      {
        title: "Fewest intervals to remove",
        explanation: "Intervals [1,2], [2,3], [3,4], [1,3]. Touching ends do not overlap here. Step 1: sort by end: [1,2], [2,3], [1,3], [3,4]. Step 2: keep [1,2], end = 2. Step 3: [2,3] starts at 2, which is not before 2, so keep it, end = 3. Step 4: [1,3] starts before 3, so remove it. Step 5: [3,4] is fine, keep it. We kept 3, so we remove 4 - 3 = 1.",
        code: {
          lang: "python",
          code: `def erase_overlaps(intervals):     # O(n log n)
    kept, end = 0, float("-inf")
    for s, e in sorted(intervals, key=lambda x: x[1]):
        if s >= end:                  # no overlap with the last kept one
            kept += 1
            end = e
    return len(intervals) - kept

print(erase_overlaps([[1, 2], [2, 3], [3, 4], [1, 3]]))  # 1
print(erase_overlaps([[1, 2], [1, 2], [1, 2]]))          # 2`,
        },
      },
      {
        title: "Gas station in one pass",
        explanation: "This is the trace from the diagram turned into code. The variable total checks whether any answer exists. The variable tank tracks fuel since the current candidate start. When tank goes negative at i, every start from the candidate to i would also fail at i (each of them arrives with no more fuel), so the next candidate is i + 1. Time O(n), space O(1).",
        code: {
          lang: "python",
          code: `def can_complete_circuit(gas, cost):
    total = tank = start = 0
    for i in range(len(gas)):
        diff = gas[i] - cost[i]
        total += diff
        tank += diff
        if tank < 0:                  # cannot reach i + 1 from start
            start, tank = i + 1, 0
    return start if total >= 0 else -1

print(can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))  # 3
print(can_complete_circuit([2, 3, 4], [3, 4, 3]))              # -1`,
        },
      },
    ],
    cheatSheet: [
      "Greedy cost is usually O(n log n) for the sort plus O(n) for one pass",
      "Max non-overlapping intervals: sort by end; removals = n - kept",
      "Merge intervals: sort by start and extend the last one",
      "Meeting rooms: sort by start, min-heap of end times, answer = heap size",
      "Gas station: total gas < total cost means -1; else restart after each negative tank",
      "Coins 1, 3, 4 and amount 6 break greedy: 4+1+1 vs 3+3",
      "Fractional knapsack is greedy; 0/1 knapsack needs DP",
      "Test a greedy idea against brute force on many small random inputs",
    ],
    quiz: [
      {
        q: "To keep the maximum number of non-overlapping intervals, what should you sort by?",
        options: ["Start time", "Length", "End time", "Start time, descending"],
        answer: 2,
        why: "Finishing earliest leaves the most room for the rest, which the exchange argument proves.",
      },
      {
        q: "Intervals [1,10], [2,3], [4,5]. A greedy sorted by start time takes [1,10] first. How many does it keep, and what is optimal?",
        options: ["It keeps 1; optimal is 2", "It keeps 2; optimal is 2", "It keeps 1; optimal is 3", "It keeps 3; optimal is 3"],
        answer: 0,
        why: "[1,10] blocks the other two, while [2,3] and [4,5] fit together.",
      },
      {
        q: "Capacity 50, items (10 kg, 60), (20 kg, 100), (30 kg, 120), whole items only. What does best-ratio-first greedy get?",
        options: ["220", "180", "240", "160"],
        answer: 3,
        why: "It takes the 10 kg and 20 kg items (ratios 6 and 5) for 160; the 30 kg item no longer fits, while 100 + 120 = 220 is optimal.",
      },
      {
        q: "In gas station, the tank becomes negative at station 5 when starting from station 2. What can you conclude?",
        options: ["Station 3 is the answer", "No station from 2 to 5 can be the start", "There is no answer", "Restart from station 2 with more gas"],
        answer: 1,
        why: "Any start in between arrives at each later station with no more fuel than the start at 2 did.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Each child i needs a cookie of size at least greed[i]. Each cookie goes to at most one child. Return the most children you can satisfy. Example: greed [1, 2, 3], sizes [1, 1] gives 1.",
        hint: "Sort both lists and give the smallest cookie that works to the least greedy child.",
        solution: `def find_content_children(greed, sizes):
    greed.sort(); sizes.sort()
    child = 0
    for s in sizes:
        if child < len(greed) and s >= greed[child]:
            child += 1
    return child
print(find_content_children([1, 2, 3], [1, 1]))  # 1
print(find_content_children([1, 2], [1, 2, 3]))  # 2`,
      },
      {
        level: "medium",
        task: "nums[i] is the longest jump from index i. You can always reach the end. Return the fewest jumps needed. Example: [2, 3, 1, 1, 4] gives 2.",
        hint: "Think of BFS levels: the current jump covers indexes up to end; track the furthest the next jump can reach.",
        solution: `def jump(nums):                       # O(n)
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:                      # must jump to go further
            jumps += 1
            end = far
    return jumps
print(jump([2, 3, 1, 1, 4]))  # 2
print(jump([2, 3, 0, 1, 4]))  # 2`,
      },
      {
        level: "hard",
        task: "Children stand in a line with ratings. Each child gets at least one candy, and a child with a higher rating than a neighbour must get more than that neighbour. Return the minimum total. Example: [1, 0, 2] gives 5.",
        hint: "Two greedy passes: left to right for left neighbours, then right to left for right neighbours, keeping the max.",
        solution: `def candy(ratings):                   # O(n)
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]: c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]: c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)
print(candy([1, 0, 2]))  # 5
print(candy([1, 2, 2]))  # 4`,
      },
    ],
    faq: [
      { q: "How do I know if a problem can be solved greedily?", a: "Look for a choice you can prove is always safe, usually with an exchange argument. If you cannot prove it, try to break it with tiny inputs and a brute-force checker; if it breaks, switch to DP." },
      { q: "What is the difference between greedy and dynamic programming?", a: "Greedy commits to one choice per step and never reconsiders. DP considers every choice for each subproblem and keeps the best, which is slower but works when the locally best choice can be wrong." },
      { q: "Is Dijkstra's algorithm greedy?", a: "Yes. It always finalises the closest unfinished vertex, and the non-negative weights are exactly what makes that greedy choice safe. Kruskal and Prim are greedy too." },
      { q: "Why is greedy correct for coin change with normal coins?", a: "Systems like 1, 5, 10, 25 are designed so the largest coin is always part of some best answer. This is a property of those specific coins, called a canonical coin system, and fails for sets like 1, 3, 4." },
    ],
  },

  "dsa-greedy-dp/dp-fundamentals": {
    plain: [
      "Dynamic programming, or DP, is a fancy name for a simple habit: do not solve the same small problem twice. Write the answer down the first time, and look it up next time.",
      "Take climbing stairs, where you can step 1 or 2 stairs at a time. The number of ways to reach stair 10 is the ways to reach stair 9 plus the ways to reach stair 8. A plain recursive solution asks for stair 8 many, many times. If you save each answer, every stair is computed just once.",
      "DP fits when two things are true. First, the big problem breaks into smaller problems of the same kind (optimal substructure). Second, those smaller problems repeat (overlapping subproblems). If they never repeat, saving answers does not help, and plain recursion or divide and conquer is enough.",
      "There are two ways to write it. Top-down: write the recursion and add a cache, called memoisation. Bottom-up: fill a list from the smallest case upwards, called tabulation. Both give the same answers and usually the same Big-O.",
    ],
    deepDive: [
      {
        heading: "How bad is it without a cache?",
        body: "The naive Fibonacci function fib(n) = fib(n - 1) + fib(n - 2) makes a number of calls that grows like 1.618^n (the golden ratio to the power n). fib(30) already makes 2,692,537 calls, and fib(50) would take hours in Python. Yet there are only 51 different values, fib(0) to fib(50).\n\nThe tree of calls shows why: fib(3) appears twice under fib(5), fib(2) three times, and the repeats double with each level. A cache turns that tree into a straight line. Each distinct state is computed once and every later request is a dictionary lookup.\n\nThis gives the basic DP cost rule: time = number of states x work per state. Fibonacci has n states and O(1) work each, so O(n).",
        visual: {
          type: "tree",
          title: "Calls made by naive fib(5)",
          root: "fib(5)",
          children: [
            { label: "fib(4)", children: ["fib(3): computed again below", "fib(2)"] },
            { label: "fib(3)", children: ["fib(2): third time overall", "fib(1)"] },
          ],
        },
      },
      {
        heading: "Memoisation in Python",
        body: "functools.cache (Python 3.9 and later) is a decorator that stores results keyed by the arguments. It is the same as lru_cache(maxsize=None). Arguments must be hashable, so pass a tuple or an index instead of a list. Define the cached helper inside the main function when it depends on input data; then each call of the main function gets a fresh cache.\n\nThe catch is recursion depth. CPython's default limit is 1,000 frames, so a top-down DP over 10,000 states raises RecursionError. sys.setrecursionlimit can raise it, but very deep recursion can still crash the interpreter, which is a good reason to switch to bottom-up for long 1D problems.",
        bullets: ["@cache or @lru_cache(maxsize=None)", "Arguments must be hashable: ints, strings, tuples", "f.cache_clear() empties the cache", "Default recursion limit: 1,000"],
      },
      {
        heading: "From recursion to a table",
        body: "Converting top-down to bottom-up is mechanical. The function's arguments become the table's indexes. The recursion's base cases become the first table entries. The recursive calls tell you which entries each cell needs, so you loop in an order where those are already filled. Finally, the original call tells you which cell holds the answer.\n\nFor house robber, rob(i) = max(rob(i - 1), rob(i - 2) + nums[i]). Each state needs smaller indexes, so loop i upwards. Bottom-up has no recursion limit and less overhead per state, while top-down only computes states that are actually needed, which can be far fewer in some problems.",
        visual: {
          type: "flow",
          title: "Top-down to bottom-up",
          steps: [
            { label: "Arguments", detail: "Become table indexes: dp[i]." },
            { label: "Base cases", detail: "Fill dp[0], dp[1] first." },
            { label: "Recursive calls", detail: "Show which cells each cell reads." },
            { label: "Loop order", detail: "Fill so those cells come first." },
            { label: "First call", detail: "Its state is the answer cell." },
          ],
        },
      },
      {
        heading: "Shrinking the memory",
        body: "Look at which earlier cells the recurrence reads. If dp[i] only reads dp[i - 1] and dp[i - 2], you never need the whole list, only the last two values. Keep two variables and shift them forward each step, and space drops from O(n) to O(1).\n\nThe same idea works for any fixed window: if dp[i] reads back k steps, keep a list or deque of the last k values for O(k) space. The trade-off is that you lose the full table, so you cannot reconstruct which choices led to the answer. If you need the actual choices, keep the table or a separate list of decisions.",
      },
      {
        heading: "A small catalogue of 1D DP",
        body: "Most 1D problems use one of two state meanings. \"dp[i] = answer for the first i items\" fits house robber and decode ways. \"dp[i] = best answer that ends exactly at i\" fits maximum subarray (Kadane's algorithm: dp[i] = max(a[i], dp[i - 1] + a[i]), then take the max over all i) and the longest increasing subsequence.\n\nThe combining operation depends on the question. Counting ways adds the options. Finding a best value takes max or min. Asking whether something is possible uses or (any option works). Spotting which of the three you need is half of writing the recurrence.",
        bullets: ["Count ways: dp[i] = sum of options", "Best value: dp[i] = max or min of options", "Is it possible: dp[i] = any option is True"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "House robber on [2, 7, 9, 3, 1]",
        steps: [
          { label: "House 2", detail: "best = max(0, 0 + 2) = 2" },
          { label: "House 7", detail: "best = max(2, 0 + 7) = 7" },
          { label: "House 9", detail: "best = max(7, 2 + 9) = 11" },
          { label: "House 3", detail: "best = max(11, 7 + 3) = 11" },
          { label: "House 1", detail: "best = max(11, 11 + 1) = 12" },
        ],
      },
      {
        type: "compare",
        title: "Three kinds of DP question",
        columns: [
          { title: "Count ways", points: ["Add the options", "Base: one way to do nothing", "Climbing stairs, decode ways"] },
          { title: "Best value", points: ["max or min of options", "Base: 0 or infinity", "House robber, coin change"] },
          { title: "Is it possible", points: ["any option is True", "Base: empty is True", "Word break, subset sum"] },
        ],
      },
    ],
    examples: [
      {
        title: "Decode ways",
        explanation: "Letters are coded A = 1 to Z = 26. How many ways can \"226\" be decoded? State: dp[i] = ways to decode the first i characters. dp[0] = 1 (the empty string has one decoding). A single digit d adds dp[i - 1] if d is not 0. A pair of digits adds dp[i - 2] if it is between 10 and 26. For \"226\": dp[1] = 1 (B), dp[2] = 2 (BB, V), dp[3] = 3 (BBF, BZ, VF). A 0 that cannot pair, like in \"06\", gives 0.",
        code: {
          lang: "python",
          code: `def num_decodings(s):              # O(n) time, O(n) space
    n = len(s)
    dp = [1] + [0] * n                 # dp[i]: ways for s[:i]
    for i in range(1, n + 1):
        if s[i - 1] != "0":
            dp[i] += dp[i - 1]
        if i >= 2 and 10 <= int(s[i - 2:i]) <= 26:
            dp[i] += dp[i - 2]
    return dp[n]

print(num_decodings("226"), num_decodings("06"), num_decodings("11106"))  # 3 0 2`,
        },
      },
      {
        title: "Word break with memoisation",
        explanation: "Can \"leetcode\" be split into words from {\"leet\", \"code\"}? State: can(i) = can the suffix starting at i be split? can(len(s)) is True. For each word that matches at position i, try can(i + len(word)). The cache makes sure each starting index is solved once, so there are n + 1 states and each tries every word. Without the cache, an input like \"aaaa...ab\" with words a, aa, aaa makes the search exponential.",
        code: {
          lang: "python",
          code: `from functools import cache

def word_break(s, words):
    @cache
    def can(i):
        if i == len(s):
            return True
        return any(s.startswith(w, i) and can(i + len(w)) for w in words)
    return can(0)

print(word_break("leetcode", ["leet", "code"]))                    # True
print(word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]))  # False`,
        },
      },
    ],
    cheatSheet: [
      "DP needs optimal substructure plus overlapping subproblems",
      "Time = number of states x work per state",
      "Write the state in words first: dp[i] = ... for the first i items",
      "@functools.cache memoises; arguments must be hashable",
      "CPython's default recursion limit is 1,000: go bottom-up for long inputs",
      "dp[i] reads only dp[i-1] and dp[i-2]: keep two variables, O(1) space",
      "Count ways: add; best value: max or min; feasibility: any",
      "Kadane: best ending here = max(a[i], best ending before + a[i])",
    ],
    quiz: [
      {
        q: "Which pair of properties makes DP a good fit?",
        options: ["Sorted input and unique values", "A greedy choice and a heap", "Optimal substructure and overlapping subproblems", "Recursion and a stack"],
        answer: 2,
        why: "DP saves time only when subproblems repeat and the answer can be built from sub-answers.",
      },
      {
        q: "A top-down DP has 10,000 states in a chain. What usually goes wrong in CPython?",
        options: ["The cache runs out of keys", "RecursionError, since the default limit is 1,000 frames", "It becomes O(n^2)", "Nothing, recursion is unlimited"],
        answer: 1,
        why: "Each state adds a stack frame, and the default limit is 1,000.",
      },
      {
        q: "Why does @cache fail on def f(nums: list, i: int)?",
        options: ["Lists are unhashable, so they cannot be cache keys", "Integers cannot be cached", "@cache only works on methods", "It needs maxsize set"],
        answer: 0,
        why: "The cache is a dict keyed by the arguments, and lists cannot be dict keys.",
      },
      {
        q: "dp[i] = max(dp[i - 1], dp[i - 2] + a[i]). How much extra space does the optimised version need?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        answer: 3,
        why: "Only the previous two values are ever read, so two variables are enough.",
      },
      {
        q: "Decode ways for \"12\". What is the answer?",
        options: ["1", "3", "2", "0"],
        answer: 2,
        why: "\"1, 2\" decodes to AB and \"12\" decodes to L.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Tribonacci: T0 = 0, T1 = 1, T2 = 1, and Tn = Tn-1 + Tn-2 + Tn-3. Write it with functools.cache and print T25.",
        hint: "Three base cases, then the recurrence.",
        solution: `from functools import cache

@cache
def trib(n):
    if n == 0: return 0
    if n <= 2: return 1
    return trib(n - 1) + trib(n - 2) + trib(n - 3)

print(trib(25))  # 1389537`,
      },
      {
        level: "medium",
        task: "cost[i] is the price of stepping on stair i. You may start at stair 0 or 1 and climb 1 or 2 stairs at a time. Return the minimum cost to get past the last stair, in O(1) space. Example: [1, 100, 1, 1, 1, 100, 1, 1, 100, 1] gives 6.",
        hint: "Let a and b be the cheapest cost to stand on the two previous stairs.",
        solution: `def min_cost_climbing(cost):
    a = b = 0                       # cost to stand on stairs i-2 and i-1
    for c in cost:
        a, b = b, min(a, b) + c     # cheapest way to stand on this stair
    return min(a, b)                # finish from either of the last two
print(min_cost_climbing([10, 15, 20]))                         # 15
print(min_cost_climbing([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]))  # 6`,
      },
      {
        level: "hard",
        task: "House robber II: the houses form a circle, so the first and last are neighbours. Return the most you can rob. Examples: [2, 3, 2] gives 3, [1, 2, 3, 1] gives 4.",
        hint: "Either the first house is skipped or the last is. Solve the line problem twice.",
        solution: `def rob_line(nums):
    prev2 = prev1 = 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1

def rob_circle(nums):
    if len(nums) == 1: return nums[0]
    return max(rob_line(nums[1:]), rob_line(nums[:-1]))
print(rob_circle([2, 3, 2]), rob_circle([1, 2, 3, 1]))  # 3 4`,
      },
    ],
    faq: [
      { q: "Should I write DP top-down or bottom-up?", a: "Top-down is faster to write and only visits needed states, so it is great in interviews. Bottom-up avoids recursion limits, runs faster in Python and makes space optimisation easy." },
      { q: "How do I find the DP state?", a: "Ask what information you need to describe the remaining problem. Usually it is a position i, sometimes plus a small extra like remaining capacity or a flag; that list of values is the state." },
      { q: "Is memoisation the same as caching?", a: "Yes, memoisation is caching applied to a function's results, keyed by its arguments. In Python, functools.cache does it for you." },
      { q: "Why is it called dynamic programming?", a: "Richard Bellman chose the name in the 1950s. \"Programming\" meant planning, as in a schedule, not writing code, and he picked \"dynamic\" partly because it sounded impressive." },
    ],
  },

  "dsa-greedy-dp/dp-2d": {
    plain: [
      "Some problems need two numbers to describe where you are. On a grid, it is the row and the column. When comparing two words, it is how far you are in the first word and how far in the second. A DP with two numbers in its state is called 2D DP, and its memory is a table.",
      "Each cell of the table is the answer to one small problem. For a grid, cell (r, c) might hold the number of ways to walk from the top-left corner to that cell. For two words, cell (i, j) might hold how many edits turn the first i letters of one word into the first j letters of the other.",
      "Every cell is built from a few nearby cells that were filled earlier, usually the one above, the one to the left, and the one diagonally above-left. So you fill the table row by row, left to right, and the answer sits in the bottom-right corner.",
      "Tables can get big. A 10,000 by 10,000 table has 100 million cells, too much memory for Python. The good news is that most of these problems only look at the previous row, so you can keep just one or two rows.",
    ],
    deepDive: [
      {
        heading: "Two kinds of 2D state",
        body: "Grid DP: dp[r][c] describes the cell at row r, column c. Moves are limited (often only right and down), so each cell depends on its neighbours above and to the left. This is why grid DP needs a restriction on moves: if you could move in all four directions, cells would depend on each other in a loop, and you would need a graph algorithm such as BFS or Dijkstra instead.\n\nTwo-sequence DP: dp[i][j] describes the prefixes a[:i] and b[:j]. The table has (m + 1) x (n + 1) cells, because row 0 and column 0 stand for empty prefixes. Those base cases are usually easy: turning an empty word into j letters takes j insertions. Shifting by one keeps string index i - 1 paired with table index i, which is where most off-by-one bugs live.",
        bullets: ["Grid: dp[r][c] from up and left", "Strings: dp[i][j] over prefixes, size (m + 1) x (n + 1)", "Four-way moves create cycles: use a graph algorithm"],
      },
      {
        heading: "Choosing the fill order",
        body: "Draw an arrow from each cell to the cells it reads. The fill order must visit the cells at the tail of each arrow first. If cells read up, left and up-left, plain row-major order (outer loop rows, inner loop columns) works. If a recurrence reads down and right, as when the state means \"from (r, c) to the bottom-right corner\", loop rows and columns backwards.\n\nSome problems read only the diagonal, such as interval problems where dp[i][j] needs dp[i + 1][j - 1]. Then you fill by the length j - i, or with i descending and j ascending. When in doubt, top-down memoisation sidesteps the question, because the recursion computes dependencies on demand.",
        visual: {
          type: "compare",
          title: "Dependency shape decides the loop",
          columns: [
            { title: "Reads up and left", points: ["Unique paths, edit distance, LCS", "Rows 0 to m, columns 0 to n", "Answer at dp[m][n]"] },
            { title: "Reads down and right", points: ["Dungeon game, paths to the corner", "Rows m-1 down to 0, columns backwards", "Answer at dp[0][0]"] },
            { title: "Reads inner interval", points: ["Palindromes, matrix chain", "Loop by length j - i", "Answer at dp[0][n-1]"] },
          ],
        },
      },
      {
        heading: "Rolling rows without bugs",
        body: "If row r only needs row r - 1, keep one list. For unique paths it is beautifully short: start with row = [1] * n, then for each new row do row[c] += row[c - 1] for c from 1. Before the update, row[c] still holds the cell above; row[c - 1] already holds the cell to the left. Space becomes O(n).\n\nEdit distance also reads the diagonal dp[i - 1][j - 1], which the one-row version overwrites one step earlier. Save it in a variable, often called prev or diag, before overwriting each cell. Pick the shorter string for the columns to get O(min(m, n)) space. You lose the ability to trace back the actual edits, so keep the full table when you need them.",
        visual: {
          type: "flow",
          title: "One-row edit distance: updating cell j",
          steps: [
            { label: "Save diag", detail: "tmp = row[j], the old up value." },
            { label: "Read neighbours", detail: "Up = row[j], left = row[j - 1], diag = prev." },
            { label: "Write", detail: "row[j] = prev if match, else 1 + min of the three." },
            { label: "Shift", detail: "prev = tmp for the next column." },
          ],
        },
      },
      {
        heading: "Grids with obstacles, costs and maths",
        body: "Obstacles are a small change: a blocked cell gets 0 ways, and the rest of the recurrence stays the same. Watch the first row and column: a single obstacle there blocks every cell after it in that line. Minimum path sum replaces + with min: dp[r][c] = grid[r][c] + min(up, left).\n\nWithout obstacles, unique paths has a closed form. Every route makes exactly m - 1 down moves and n - 1 right moves in some order, so the count is the binomial coefficient C(m + n - 2, m - 1). For a 3 x 7 grid that is C(8, 2) = 28, and Python's math.comb(8, 2) computes it directly. The DP is still worth knowing because the formula breaks as soon as obstacles or costs appear.",
      },
      {
        heading: "Where these tables are used",
        body: "Edit distance (also called Levenshtein distance) powers spell checkers and \"did you mean\" suggestions. Fuzzy search libraries compute it, often with a cut-off to stop early when the distance is already too large. Sequence alignment in biology (Needleman-Wunsch) is the same table with costs for matches, mismatches and gaps.\n\nText diff tools compare two files line by line with the same idea. git diff uses the Myers algorithm by default, a cleverer method that runs in O((m + n) D) time, where D is the size of the difference, so it is very fast when two files are nearly the same.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Unique paths on a 3 x 3 grid, row by row",
        steps: [
          { label: "Row 0", detail: "1, 1, 1: only one way along the top" },
          { label: "Row 1", detail: "1, 2, 3: each cell = up + left" },
          { label: "Row 2", detail: "1, 3, 6" },
          { label: "Answer", detail: "6 = C(4, 2)" },
        ],
      },
    ],
    examples: [
      {
        title: "Minimum path sum with one row",
        explanation: "Grid [[1, 2, 3], [4, 5, 6]], moves only right or down. We want the cheapest total from top-left to bottom-right. Step 1: the first row is a running sum: 1, 3, 6. Step 2: for the second row, the first cell can only come from above: 1 + 4 = 5. Then 5 + min(3, 5) = 8, and 6 + min(6, 8) = 12. The answer is 12, along 1, 2, 3, 6. Only one list of length n is kept.",
        code: {
          lang: "python",
          code: `def min_path_sum(grid):            # O(m * n) time, O(n) space
    row = []
    for r, line in enumerate(grid):
        for c, x in enumerate(line):
            if r == 0:
                row.append(x + (row[c - 1] if c else 0))
            elif c == 0:
                row[0] += x            # only from above
            else:
                row[c] = x + min(row[c], row[c - 1])   # up, left
    return row[-1]

print(min_path_sum([[1, 2, 3], [4, 5, 6]]))           # 12
print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))  # 7`,
        },
      },
      {
        title: "Edit distance with the actual edits",
        explanation: "\"kitten\" to \"sitting\" needs 3 edits. To list them, fill the full table, then walk back from the bottom-right corner. At each cell, if the letters match, step diagonally for free. Otherwise, find which neighbour plus one gives this cell's value: diagonal means replace, up means delete from the first word, left means insert. The walk produces edits backwards, so reverse them at the end.",
        code: {
          lang: "python",
          code: `def edit_ops(a, b):
    m, n = len(a), len(b)
    dp = [[i + j if i * j == 0 else 0 for j in range(n + 1)] for i in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] if a[i-1] == b[j-1] else 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])
    ops, i, j = [], m, n
    while i or j:
        if i and j and a[i-1] == b[j-1]: i, j = i - 1, j - 1
        elif i and j and dp[i][j] == dp[i-1][j-1] + 1: ops.append(f"replace {a[i-1]}->{b[j-1]}"); i, j = i - 1, j - 1
        elif i and dp[i][j] == dp[i-1][j] + 1: ops.append(f"delete {a[i-1]}"); i -= 1
        else: ops.append(f"insert {b[j-1]}"); j -= 1
    return dp[m][n], ops[::-1]
print(edit_ops("kitten", "sitting"))
# (3, ['replace k->s', 'replace e->i', 'insert g'])`,
        },
      },
    ],
    cheatSheet: [
      "Grid DP needs restricted moves (like right and down); four-way moves need BFS or Dijkstra",
      "Sequence DP tables are (m + 1) x (n + 1); row 0 and column 0 mean empty prefixes",
      "Build rows with [[0] * n for _ in range(m)], never [[0] * n] * m",
      "Unique paths without obstacles = math.comb(m + n - 2, m - 1)",
      "One-row unique paths: row[c] += row[c - 1]",
      "One-row edit distance: save the old row[j] as the next diagonal",
      "Edit distance: O(m x n) time; O(min(m, n)) space if you do not need the edits",
      "Reconstruct by walking back from dp[m][n] and matching each value to its source",
    ],
    quiz: [
      {
        q: "How many unique right-or-down paths cross a 3 x 7 grid?",
        options: ["21", "28", "10", "36"],
        answer: 1,
        why: "C(3 + 7 - 2, 3 - 1) = C(8, 2) = 28.",
      },
      {
        q: "A grid allows moves in all four directions with a cost per cell. Why does plain grid DP fail?",
        options: ["The table would be too small", "Python cannot index negative rows", "Cells depend on each other in cycles, so no fill order works", "It works but is slower"],
        answer: 2,
        why: "With four-way moves there is no order where every dependency comes first; use Dijkstra.",
      },
      {
        q: "In one-row edit distance, what extra value must you keep while updating cell j?",
        options: ["The old value of row[j - 1] before this row, the diagonal", "The whole previous row", "The answer so far", "The length of the shorter string"],
        answer: 0,
        why: "row[j - 1] has already been overwritten with the current row, so the old diagonal must be saved.",
      },
      {
        q: "What is the edit distance between \"abc\" and \"\" (empty string)?",
        options: ["0", "1", "6", "3"],
        answer: 3,
        why: "You must delete all 3 characters; this is the base case dp[3][0] = 3.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Count right-or-down paths in a grid where 1 marks an obstacle. Example: [[0,0,0],[0,1,0],[0,0,0]] gives 2.",
        hint: "Use one row; set row[c] = 0 on obstacles, else add the left value.",
        solution: `def paths_with_obstacles(g):
    row = [0] * len(g[0]); row[0] = 1
    for line in g:
        for c, cell in enumerate(line):
            if cell == 1: row[c] = 0
            elif c > 0: row[c] += row[c - 1]
    return row[-1]
print(paths_with_obstacles([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))  # 2`,
      },
      {
        level: "medium",
        task: "Given a grid of \"0\" and \"1\" strings, return the area of the largest square made only of \"1\". Example below gives 4.",
        hint: "dp[r][c] = side of the largest square whose bottom-right corner is (r, c) = 1 + min(up, left, diagonal).",
        solution: `def maximal_square(g):
    R, C = len(g), len(g[0])
    dp = [[0] * (C + 1) for _ in range(R + 1)]
    best = 0
    for r in range(R):
        for c in range(C):
            if g[r][c] == "1":
                dp[r+1][c+1] = 1 + min(dp[r][c+1], dp[r+1][c], dp[r][c])
                best = max(best, dp[r+1][c+1])
    return best * best
g = ["10100", "10111", "11111", "10010"]
print(maximal_square([list(x) for x in g]))  # 4`,
      },
      {
        level: "hard",
        task: "Write edit distance in O(min(m, n)) extra space.",
        hint: "Swap so b is the shorter word, keep one row, and carry the diagonal in a variable.",
        solution: `def edit_distance_small(a, b):
    if len(b) > len(a): a, b = b, a
    row = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        prev, row[0] = row[0], i              # prev = old row[0], the diagonal
        for j in range(1, len(b) + 1):
            tmp = row[j]
            row[j] = prev if a[i-1] == b[j-1] else 1 + min(prev, row[j], row[j-1])
            prev = tmp
    return row[-1]
print(edit_distance_small("horse", "ros"), edit_distance_small("intention", "execution"))  # 3 5`,
      },
    ],
    faq: [
      { q: "How do I know a problem needs 2D DP?", a: "If one index is not enough to describe what is left to solve, add another. Two strings, a grid, or one position plus a remaining budget are the usual signs." },
      { q: "Why does my table have one extra row and column?", a: "Row 0 and column 0 stand for empty prefixes. They hold simple base cases and remove the special cases at the edges." },
      { q: "Is edit distance the same as Levenshtein distance?", a: "Yes, Levenshtein distance is edit distance with insert, delete and replace each costing 1. Variants add swaps of neighbouring letters (Damerau-Levenshtein) or allow different costs." },
    ],
  },

  "dsa-greedy-dp/knapsack": {
    plain: [
      "You are packing a backpack for a hike. It can carry at most 7 kg. Each item has a weight and a value to you. You cannot cut items in half. Which items should you take to get the most value? That is the 0/1 knapsack problem: each item is either in (1) or out (0).",
      "Trying every combination works for a few items, but n items have 2^n combinations, over a million for just 20 items. DP is much faster when the weights are whole numbers and the capacity is not huge. It asks: what is the best value for every capacity from 0 to 7, using the items seen so far?",
      "For each new item, every capacity has two choices. Skip the item and keep the old best. Or take it, which uses up its weight, and add its value to the best for the smaller capacity left over. Keep whichever is larger.",
      "Many problems are knapsack wearing a costume. Can these numbers be split into two equal halves? Can some of them add up to a target? What is the fewest number of coins to make an amount? The items and the capacity change names, but the table is the same.",
    ],
    deepDive: [
      {
        heading: "Start with the 2D table",
        body: "The clearest form is dp[i][c] = the best value using only the first i items with capacity c. Row 0 (no items) is all zeros. For item i with weight w and value v, dp[i][c] = dp[i - 1][c] if you skip it, or dp[i - 1][c - w] + v if you take it and c >= w. The answer is dp[n][W].\n\nThere are (n + 1) x (W + 1) cells, each O(1), so time is O(n x W). The 2D table is also what lets you rebuild the chosen items: if dp[i][c] differs from dp[i - 1][c], item i was taken, so subtract its weight and move up a row.\n\nEvery row only reads the row directly above it. That observation leads to the one-row version.",
        visual: {
          type: "tree",
          title: "Two choices for dp[i][c]",
          root: "dp[i][c]: first i items, capacity c",
          children: [
            { label: "Skip item i", children: ["dp[i-1][c]"] },
            { label: "Take item i (if w <= c)", children: ["dp[i-1][c - w] + v"] },
          ],
        },
      },
      {
        heading: "Why the 1D loop runs backwards",
        body: "With one row, dp[c] = max(dp[c], dp[c - w] + v). The right side must still hold the old row's values. Looping c from W down to w guarantees that: dp[c - w] is to the left of c and has not been touched yet in this item's pass.\n\nLoop forwards and dp[c - w] may already include the current item, so the same item is taken twice. Try one item of weight 2 and value 3 with W = 4. Forwards: dp[2] = 3, then dp[4] = dp[2] + 3 = 6, using the item twice. Backwards: dp[4] = dp[2] + 3 = 0 + 3 = 3, then dp[2] = 3. Correct.\n\nThat bug is exactly the unbounded knapsack, where items can be reused. So the loop direction is the whole difference between the two problems.",
        visual: {
          type: "compare",
          title: "One item (w 2, v 3), W = 4",
          columns: [
            { title: "Backwards (0/1)", points: ["c = 4: dp[2] is still 0, so 3", "c = 3: 3", "c = 2: 3", "Final dp[4] = 3"] },
            { title: "Forwards (unbounded)", points: ["c = 2: 3", "c = 3: 3", "c = 4: dp[2] is already 3, so 6", "Final dp[4] = 6"] },
          ],
        },
      },
      {
        heading: "Coin change: combinations versus orderings",
        body: "Counting ways to make an amount with unlimited coins is an unbounded knapsack where values are replaced by counts: ways[c] += ways[c - coin], with ways[0] = 1. The loop order now changes the meaning.\n\nCoins in the outer loop, amounts inside: each coin is added in a fixed order, so 1 + 2 and 2 + 1 count once. That counts combinations. For coins [1, 2, 5] and amount 5 it gives 4. Amounts in the outer loop, coins inside: every last coin is tried at every amount, so different orders count separately. That counts sequences. For [1, 2, 3] and target 4 it gives 7.\n\nThe fewest-coins version uses min instead of +, and either loop order works because the minimum does not care about order.",
        bullets: ["Combinations: for coin, then for amount", "Orderings: for amount, then for coin", "Fewest coins: min, any order"],
      },
      {
        heading: "Subset sum, partition and target sum",
        body: "Subset sum asks whether some items add up to exactly T. It is 0/1 knapsack with True/False: can[c] = can[c] or can[c - x], looping backwards. Equal partition is subset sum with T = total / 2, and an odd total is an instant no.\n\nTarget sum assigns + or - to every number to reach a target S. If P is the sum of the plus group, then P - (total - P) = S, so P = (total + S) / 2. Now count subsets with sum P. If (total + S) is odd or negative, the answer is 0.\n\nPython has a neat trick for subset sum: store reachable sums as bits of one big integer. Start with bits = 1 (sum 0 reachable) and for each x do bits |= bits << x. Then sum T is reachable when bits >> T & 1 is 1. Python's big integers do the shifting in machine words, so this runs many times faster than a list loop.",
      },
      {
        heading: "When the capacity is huge",
        body: "Knapsack is NP-hard: no known algorithm is polynomial in the input size. O(n x W) looks polynomial, but W is a number, and writing W takes only about log2(W) bits. Doubling the number of digits squares the work. That is what pseudo-polynomial means.\n\nIf W is 10^9 but values are small, flip the table: dp[v] = the minimum weight needed to reach value exactly v, then take the largest v with dp[v] <= W. That costs O(n x total value). If n is at most about 40, meet in the middle works: list all subset sums of each half (2^20 each, about a million), sort one list, and binary search it for each sum from the other.",
        bullets: ["NP-hard in general", "Small values: DP over value instead of weight", "n up to about 40: meet in the middle"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "1D 0/1 knapsack: items (1,1), (3,4), (4,5), W = 7",
        steps: [
          { label: "Start", detail: "dp = [0, 0, 0, 0, 0, 0, 0, 0]" },
          { label: "Item (1, 1)", detail: "dp = [0, 1, 1, 1, 1, 1, 1, 1]" },
          { label: "Item (3, 4)", detail: "dp = [0, 1, 1, 4, 5, 5, 5, 5]" },
          { label: "Item (4, 5)", detail: "dp = [0, 1, 1, 4, 5, 6, 6, 9]" },
          { label: "Answer", detail: "dp[7] = 9: items 2 and 3" },
        ],
      },
    ],
    examples: [
      {
        title: "Which items were packed?",
        explanation: "Same items as the diagram: weights 1, 3, 4 and values 1, 4, 5, capacity 7. Step 1: fill the 2D table. Step 2: start at dp[3][7] = 9. It differs from dp[2][7] = 5, so item 3 was taken; capacity becomes 7 - 4 = 3. Step 3: dp[2][3] = 4 differs from dp[1][3] = 1, so item 2 was taken; capacity becomes 0. Step 4: dp[1][0] equals dp[0][0], so item 1 was skipped.",
        code: {
          lang: "python",
          code: `def knapsack_items(items, W):         # items = [(weight, value)]
    n = len(items)
    dp = [[0] * (W + 1) for _ in range(n + 1)]
    for i, (w, v) in enumerate(items, 1):
        for c in range(W + 1):
            dp[i][c] = dp[i - 1][c]
            if w <= c:
                dp[i][c] = max(dp[i][c], dp[i - 1][c - w] + v)
    chosen, c = [], W
    for i in range(n, 0, -1):
        if dp[i][c] != dp[i - 1][c]:
            chosen.append(i - 1); c -= items[i - 1][0]
    return dp[n][W], chosen[::-1]

print(knapsack_items([(1, 1), (3, 4), (4, 5)], 7))  # (9, [1, 2])`,
        },
      },
      {
        title: "Same coins, two different counts",
        explanation: "With coins [1, 2, 5] and amount 5, the combinations are 5, 2+2+1, 2+1+1+1 and 1+1+1+1+1: four. If order matters, 2+2+1, 2+1+2 and 1+2+2 are all different, and the count is 9. The two functions below differ only in which loop is outside.",
        code: {
          lang: "python",
          code: `def combinations(coins, amount):      # order does not matter
    ways = [1] + [0] * amount
    for coin in coins:
        for c in range(coin, amount + 1):
            ways[c] += ways[c - coin]
    return ways[amount]

def orderings(coins, amount):         # order matters
    ways = [1] + [0] * amount
    for c in range(1, amount + 1):
        ways[c] = sum(ways[c - coin] for coin in coins if coin <= c)
    return ways[amount]

print(combinations([1, 2, 5], 5), orderings([1, 2, 5], 5))  # 4 9`,
        },
      },
    ],
    cheatSheet: [
      "0/1 knapsack: for item, for c from W down to w: dp[c] = max(dp[c], dp[c - w] + v)",
      "Unbounded knapsack: the same line with c looping upwards",
      "Time O(n x W), space O(W): pseudo-polynomial",
      "Count combinations: coins outer loop; count orderings: amount outer loop",
      "Equal partition: subset sum to total / 2; odd total means False",
      "Target sum with +/-: count subsets with sum (total + S) / 2",
      "Python subset-sum trick: bits |= bits << x, then test bits >> T & 1",
      "Need the chosen items? Keep the 2D table and walk back from dp[n][W]",
    ],
    quiz: [
      {
        q: "In 1D 0/1 knapsack, what goes wrong if the capacity loop runs upwards?",
        options: ["Nothing, it is just slower", "An item can be used more than once", "Values become negative", "The table needs to be 2D"],
        answer: 1,
        why: "dp[c - w] may already include the current item, which turns it into unbounded knapsack.",
      },
      {
        q: "Coins [1, 2] and amount 3. How many ways if order does not matter, and if it does?",
        options: ["3 and 3", "2 and 2", "3 and 2", "2 and 3"],
        answer: 3,
        why: "Combinations: 1+1+1, 1+2. Orderings: 1+1+1, 1+2, 2+1.",
      },
      {
        q: "Why is O(n x W) called pseudo-polynomial?",
        options: ["It is polynomial in the value W but exponential in the number of bits of W", "It only works for small n", "It uses randomness", "It is slower than O(2^n) for every input"],
        answer: 0,
        why: "Adding one digit to W multiplies the work by about 10.",
      },
      {
        q: "Numbers [1, 1, 1, 1, 1], target sum 3 using + and -. Which subset sum do you count?",
        options: ["3", "5", "4", "1"],
        answer: 2,
        why: "P = (total + S) / 2 = (5 + 3) / 2 = 4.",
      },
      {
        q: "n = 100 items, W = 10^9, every value at most 100. Which approach fits?",
        options: ["DP over weight, O(n x W)", "Try all 2^100 subsets", "Greedy by value per weight", "DP over total value: the minimum weight for each value"],
        answer: 3,
        why: "Total value is at most 10,000, so the value-indexed table is small, unlike the weight-indexed one.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Return True if nums can be split into two groups with equal sums. Examples: [1, 5, 11, 5] is True, [1, 2, 3, 5] is False.",
        hint: "Subset sum to total // 2, looping capacity backwards.",
        solution: `def can_partition(nums):
    total = sum(nums)
    if total % 2: return False
    T = total // 2
    can = [True] + [False] * T
    for x in nums:
        for c in range(T, x - 1, -1):
            can[c] = can[c] or can[c - x]
    return can[T]
print(can_partition([1, 5, 11, 5]), can_partition([1, 2, 3, 5]))  # True False`,
      },
      {
        level: "medium",
        task: "Put + or - in front of every number so the total equals target. Count the ways. Example: [1, 1, 1, 1, 1], target 3 gives 5.",
        hint: "Count subsets with sum (total + target) / 2.",
        solution: `def find_target_sum_ways(nums, target):
    total = sum(nums)
    if (total + target) % 2 or abs(target) > total: return 0
    P = (total + target) // 2
    ways = [1] + [0] * P
    for x in nums:
        for c in range(P, x - 1, -1):
            ways[c] += ways[c - x]
    return ways[P]
print(find_target_sum_ways([1, 1, 1, 1, 1], 3))  # 5`,
      },
      {
        level: "hard",
        task: "Each string is made of 0s and 1s. Pick the largest number of strings using at most m zeros and n ones in total. Example: [\"10\", \"0001\", \"111001\", \"1\", \"0\"], m = 5, n = 3 gives 4.",
        hint: "Knapsack with two capacities: dp[i][j] = most strings with i zeros and j ones. Loop both backwards.",
        solution: `def find_max_form(strs, m, n):
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for s in strs:
        z, o = s.count("0"), s.count("1")
        for i in range(m, z - 1, -1):
            for j in range(n, o - 1, -1):
                dp[i][j] = max(dp[i][j], dp[i - z][j - o] + 1)
    return dp[m][n]
print(find_max_form(["10", "0001", "111001", "1", "0"], 5, 3))  # 4`,
      },
    ],
    faq: [
      { q: "What is the difference between 0/1 and unbounded knapsack?", a: "In 0/1 knapsack each item can be used once; in unbounded knapsack items can be reused without limit. In the 1D code, the only change is whether the capacity loop runs down or up." },
      { q: "Why does greedy not work for 0/1 knapsack?", a: "Taking the best value per weight first can leave space you cannot fill. Greedy is only correct for fractional knapsack, where you may take part of an item." },
      { q: "Is coin change a knapsack problem?", a: "Yes, it is an unbounded knapsack: coins are reusable items and the amount is the capacity. Fewest coins uses min, and counting ways uses addition." },
      { q: "How big can W be for knapsack DP in Python?", a: "Roughly n x W up to about 10^7 simple steps runs in a few seconds. Beyond that, use the bitset trick for subset sum, NumPy, or a different formulation." },
    ],
  },

  "dsa-greedy-dp/lis-lcs": {
    plain: [
      "A subsequence is what you get by crossing out some items from a list but keeping the rest in their original order. From [3, 1, 4, 1, 5] you can get [3, 4, 5] or [1, 1, 5], but not [5, 3]. A substring or subarray is different: its items must sit next to each other.",
      "The longest increasing subsequence, or LIS, is the longest subsequence where every item is bigger than the one before. In [3, 1, 4, 1, 5, 9, 2, 6], one LIS is [1, 4, 5, 9], length 4. Think of a stock price: LIS tells you the longest run of days you could pick where the price kept going up.",
      "The longest common subsequence, or LCS, compares two sequences and finds the longest subsequence they share. For \"ABCBDAB\" and \"BDCABA\" it is 4 letters long, for example \"BCBA\". Comparing two versions of a file line by line works this way: the lines in the LCS stayed the same, and the rest were added or removed.",
      "LIS has a simple O(n^2) DP and a clever O(n log n) method. LCS uses a 2D table in O(m x n). Both let you rebuild the actual subsequence, not just its length, if you keep a little extra information.",
    ],
    deepDive: [
      {
        heading: "The O(n^2) LIS and rebuilding it",
        body: "Let dp[i] be the length of the longest increasing subsequence that ends exactly at index i. Every item alone has length 1. For each earlier j with a[j] < a[i], you could extend that subsequence, so dp[i] = 1 + max(dp[j]). The answer is max(dp), not dp[n - 1], because the best subsequence can end anywhere.\n\nTo get the subsequence itself, store prev[i] = the j that gave the max. Start at the index with the largest dp and follow prev back to -1, then reverse. This version is easy to adapt: counting how many LIS exist, using a weight per item, or a different comparison such as \"divisible by\" all fit the same double loop.",
        bullets: ["dp[i] = 1 + max(dp[j] for j < i if a[j] < a[i])", "Answer is max(dp), not dp[-1]", "prev[i] stores the best j for rebuilding"],
      },
      {
        heading: "Why the tails trick works",
        body: "The O(n log n) method keeps tails[k] = the smallest possible last value of an increasing subsequence of length k + 1 seen so far. A smaller tail is always at least as good, because it is easier to extend.\n\ntails stays sorted: a length-3 run ends with something larger than some length-2 run's end. So for each new x, binary search finds the first tail that is >= x. If there is none, x extends the longest run and is appended. Otherwise x replaces that tail, making that length easier to extend in future. n binary searches give O(n log n).\n\ntails itself is not a valid subsequence; its values can come from different runs. To rebuild a real LIS, store the index of each tail and, for every element, the index of the tail before it at the moment it was placed.",
        visual: {
          type: "compare",
          title: "Strict or not: one character decides",
          columns: [
            { title: "bisect_left", points: ["Strictly increasing", "Equal x replaces an equal tail", "[2, 2, 2] gives length 1"] },
            { title: "bisect_right", points: ["Non-decreasing allowed", "Equal x goes after equal tails", "[2, 2, 2] gives length 3"] },
          ],
        },
      },
      {
        heading: "LCS table and the walk back",
        body: "dp[i][j] is the LCS length of a[:i] and b[:j]. If a[i - 1] == b[j - 1], that shared character ends a common subsequence: dp[i][j] = dp[i - 1][j - 1] + 1. Otherwise, at least one of the two last characters is unused, so dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]). Time and space are O(m x n).\n\nTo rebuild the string, start at (m, n). On a match, record the character and move diagonally. Otherwise move towards the larger neighbour, up or left. Stop when either index hits 0 and reverse what you collected. When up and left are equal, either choice gives a correct LCS, which is why different programs can print different but equally long answers.",
        visual: {
          type: "flow",
          title: "Walking back from dp[m][n]",
          steps: [
            { label: "Start", detail: "i = m, j = n." },
            { label: "Letters match?", detail: "Record it, move to (i-1, j-1)." },
            { label: "Else up >= left?", detail: "Move up to (i-1, j)." },
            { label: "Else", detail: "Move left to (i, j-1)." },
            { label: "Stop", detail: "When i or j is 0; reverse the result." },
          ],
        },
      },
      {
        heading: "Problems that are secretly LIS or LCS",
        body: "Several classics reduce to these two. The shortest common supersequence of a and b has length m + n - LCS. The fewest insertions and deletions (no replacements) to turn a into b is m + n - 2 x LCS. The longest palindromic subsequence of s is the LCS of s and its reverse.\n\nWhen both inputs are permutations of the same distinct values, LCS becomes LIS: replace each value of b by its position in a, and the LCS is the LIS of that list, in O(n log n) instead of O(n^2). Russian doll envelopes (fit envelopes inside each other) is LIS after sorting by width ascending and, for equal widths, height descending, so two envelopes of the same width can never both be picked.\n\nFor huge inputs, Hirschberg's algorithm rebuilds an LCS in O(m x n) time but only O(min(m, n)) space.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What reduces to LIS or LCS",
        root: "LIS / LCS",
        children: [
          { label: "LIS", children: ["Russian doll envelopes", "Box stacking with sorted sides", "LCS of two permutations"] },
          { label: "LCS", children: ["Line-based file diff", "Longest palindromic subsequence", "Shortest common supersequence", "Insert or delete edit distance"] },
        ],
      },
    ],
    examples: [
      {
        title: "Getting an actual LIS in O(n log n)",
        explanation: "On [3, 1, 4, 1, 5, 9, 2, 6], tails ends as [1, 2, 5, 6], which is not a subsequence in that order (2 comes after 9). So we also keep tails_idx (the index of each tail) and parent (for each element, the index of the element before it in its run). At the end, start from the last tail's index and follow parents back. This prints [1, 4, 5, 6], a real increasing subsequence of length 4.",
        code: {
          lang: "python",
          code: `from bisect import bisect_left
def lis_path(a):
    tails, tails_idx, parent = [], [], [-1] * len(a)
    for i, x in enumerate(a):
        k = bisect_left(tails, x)
        if k == len(tails): tails.append(x); tails_idx.append(i)
        else: tails[k] = x; tails_idx[k] = i
        parent[i] = tails_idx[k - 1] if k else -1
    out, i = [], tails_idx[-1] if a else -1
    while i != -1: out.append(a[i]); i = parent[i]
    return out[::-1]

print(lis_path([3, 1, 4, 1, 5, 9, 2, 6]))  # [1, 4, 5, 6]`,
        },
      },
      {
        title: "Printing the LCS string",
        explanation: "For \"ABCBDAB\" and \"BDCABA\", fill the table as in the explainer, then walk back from the bottom-right corner. Matches add a letter and move diagonally; otherwise we move towards the larger neighbour, preferring up on ties. The letters come out backwards (A, B, C, B), so we reverse them to get BCBA.",
        code: {
          lang: "python",
          code: `def lcs_string(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] + 1 if a[i-1] == b[j-1] else max(dp[i-1][j], dp[i][j-1])
    out, i, j = [], m, n
    while i and j:
        if a[i-1] == b[j-1]: out.append(a[i-1]); i -= 1; j -= 1
        elif dp[i-1][j] >= dp[i][j-1]: i -= 1
        else: j -= 1
    return "".join(reversed(out))

print(lcs_string("ABCBDAB", "BDCABA"))  # BCBA`,
        },
      },
    ],
    cheatSheet: [
      "Subsequence keeps order but may skip items; substring must be contiguous",
      "LIS O(n^2): dp[i] = 1 + max(dp[j]) over j < i with a[j] < a[i]; answer max(dp)",
      "LIS O(n log n): bisect_left on tails for strict, bisect_right for non-decreasing",
      "tails gives the length only; keep indexes and parents to rebuild the sequence",
      "LCS: match takes diagonal + 1, else max(up, left); O(m x n)",
      "Longest palindromic subsequence = LCS(s, s[::-1])",
      "Insert/delete-only edit distance = m + n - 2 x LCS",
      "Envelopes: sort by width ascending, height descending, then LIS on heights",
    ],
    quiz: [
      {
        q: "What is the LIS length of [10, 9, 2, 5, 3, 7, 101, 18]?",
        options: ["3", "5", "4", "6"],
        answer: 2,
        why: "For example 2, 3, 7, 18 (or 2, 5, 7, 101).",
      },
      {
        q: "After processing [3, 1, 4, 1, 5, 9, 2, 6], tails is [1, 2, 5, 6]. Which statement is true?",
        options: ["It is the LIS", "Its length is the LIS length, but it is not itself a subsequence", "It is sorted only by chance", "It proves the LIS is unique"],
        answer: 1,
        why: "The 2 came after the 9 in the input, so the list mixes values from different runs.",
      },
      {
        q: "LCS of \"abcde\" and \"ace\" has length 3. What is the fewest insertions plus deletions to turn one into the other?",
        options: ["2", "5", "3", "8"],
        answer: 0,
        why: "m + n - 2 x LCS = 5 + 3 - 6 = 2 (delete b and d).",
      },
      {
        q: "To count a non-decreasing subsequence (equal values allowed) with the tails method, which search do you use?",
        options: ["bisect_left", "Linear search from the end", "Binary search on the input", "bisect_right"],
        answer: 3,
        why: "bisect_right places an equal value after existing equal tails, so runs can repeat values.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Return the length of the longest palindromic subsequence of s. Example: \"bbbab\" gives 4 (\"bbbb\").",
        hint: "A palindromic subsequence reads the same in s and reversed s.",
        solution: `def longest_pal_subseq(s):
    t, n = s[::-1], len(s)
    dp = [[0] * (n + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] + 1 if s[i-1] == t[j-1] else max(dp[i-1][j], dp[i][j-1])
    return dp[n][n]
print(longest_pal_subseq("bbbab"), longest_pal_subseq("cbbd"))  # 4 2`,
      },
      {
        level: "medium",
        task: "Envelopes are [width, height]. One fits inside another only if both are strictly smaller. Return the most envelopes you can nest. Example: [[5,4],[6,4],[6,7],[2,3]] gives 3.",
        hint: "Sort by width ascending and height descending, then run O(n log n) LIS on heights.",
        solution: `from bisect import bisect_left
def max_envelopes(env):
    env.sort(key=lambda e: (e[0], -e[1]))
    tails = []
    for _, h in env:
        k = bisect_left(tails, h)
        if k == len(tails): tails.append(h)
        else: tails[k] = h
    return len(tails)
print(max_envelopes([[5, 4], [6, 4], [6, 7], [2, 3]]))  # 3`,
      },
      {
        level: "hard",
        task: "Count how many longest strictly increasing subsequences exist. Example: [1, 3, 5, 4, 7] gives 2 ([1,3,4,7] and [1,3,5,7]); [2, 2, 2, 2, 2] gives 5.",
        hint: "Keep length[i] and count[i]. A longer extension resets the count; an equal one adds to it.",
        solution: `def count_lis(a):
    n = len(a)
    length, count = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if a[j] < a[i]:
                if length[j] + 1 > length[i]: length[i], count[i] = length[j] + 1, count[j]
                elif length[j] + 1 == length[i]: count[i] += count[j]
    best = max(length, default=0)
    return sum(c for l, c in zip(length, count) if l == best)
print(count_lis([1, 3, 5, 4, 7]), count_lis([2, 2, 2, 2, 2]))  # 2 5`,
      },
    ],
    faq: [
      { q: "What is the difference between a subsequence and a substring?", a: "Both keep the original order. A substring must be contiguous (no gaps), while a subsequence may skip items. \"ace\" is a subsequence of \"abcde\" but not a substring." },
      { q: "Is the longest increasing subsequence unique?", a: "Not always. [1, 3, 2, 4] has two LIS of length 3: 1, 3, 4 and 1, 2, 4. Algorithms return one of them depending on tie-breaking." },
      { q: "How does diff find changed lines?", a: "It treats each line as one symbol and finds a longest common subsequence of lines, or an equivalent shortest edit script. Lines outside it are shown as added or removed. git diff uses the Myers algorithm, which is fast when files are similar." },
      { q: "Can LCS be done faster than O(m x n)?", a: "Not by much. The best known general methods only save a logarithmic factor, and researchers believe nothing dramatically faster exists. Special cases are faster, such as two permutations, which reduce to LIS in O(n log n)." },
    ],
  },

  "dsa-greedy-dp/interval-dp": {
    plain: [
      "Some problems are about a row of things where the order is fixed but you choose how to group them. Multiplying a chain of matrices, bursting a row of balloons, or cutting a word into palindromes are like this. Interval DP solves them by answering the question for every stretch from position i to position j.",
      "Small stretches are easy. A stretch of one item usually has an obvious answer. A longer stretch is built from shorter ones. Often you try every place k where you could split it into a left part and a right part, and keep the best.",
      "Because longer stretches need shorter ones, you fill the table by length: first every stretch of length 1, then length 2, and so on, up to the whole row. The answer for the whole row sits in dp[0][n - 1].",
      "There are about n^2 / 2 stretches, and each one may try up to n split points, so the usual cost is O(n^3). That is fine for a few hundred items but too slow for many thousands.",
    ],
    deepDive: [
      {
        heading: "Two shapes of interval transition",
        body: "Split shape: dp[i][j] = best over k of combine(dp[i][k], dp[k + 1][j]) plus a cost for joining the two halves. Matrix chain, merging stones and optimal binary search trees look like this. O(n^2) intervals times O(n) splits gives O(n^3).\n\nShrink shape: dp[i][j] only looks at slightly smaller intervals, such as dp[i + 1][j - 1], dp[i + 1][j] or dp[i][j - 1]. Palindrome problems look like this: s[i..j] is a palindrome when s[i] == s[j] and s[i + 1..j - 1] is one. No split loop, so O(n^2) time.\n\nRecognising the shape tells you the complexity before you write any code, and it tells you which cells must already be filled.",
        bullets: ["Split: try every k in [i, j), usually O(n^3)", "Shrink: peel one end off, usually O(n^2)", "Base cases sit on the diagonal i == j"],
      },
      {
        heading: "Two valid fill orders",
        body: "The most readable order is by length: for length = 2 to n, for i, set j = i + length - 1. Every interval the transition reads is shorter, so it is ready.\n\nThe other common order loops i from n - 1 down to 0 and j from i + 1 up to n - 1. When you compute dp[i][j], every dp[i'][j'] with i' > i is done (later rows were filled first), and dp[i][k] with k < j is done (same row, earlier column). Both orders cover the needs of split and shrink transitions. Mixing them up, for example i ascending, reads cells that are still zero and silently gives wrong answers.",
        visual: {
          type: "compare",
          title: "Fill orders that work",
          columns: [
            { title: "By length", points: ["for length in 2..n", "for i; j = i + length - 1", "Easiest to reason about"] },
            { title: "Rows bottom-up", points: ["for i from n-1 down to 0", "for j from i+1 up to n-1", "Shorter code, same result"] },
          ],
        },
      },
      {
        heading: "Matrix chain: why order matters",
        body: "Multiplying a p x q matrix by a q x r matrix takes p x q x r scalar multiplications. The product of a chain is the same whatever the bracketing, but the cost is not. A is 10 x 30, B is 30 x 5, C is 5 x 60. (AB)C costs 10 x 30 x 5 + 10 x 5 x 60 = 1,500 + 3,000 = 4,500. A(BC) costs 30 x 5 x 60 + 10 x 30 x 60 = 9,000 + 18,000 = 27,000, six times more.\n\nThe DP tries each last multiplication split k: the cost is dp[i][k] + dp[k + 1][j] + dims[i] x dims[k + 1] x dims[j + 1]. To print the best bracketing, store the best k in split[i][j] and recurse on it. Numerical libraries face this exact question when evaluating chained products such as numpy.linalg.multi_dot, which chooses the order for you.",
      },
      {
        heading: "Burst balloons: think about the last move",
        body: "Bursting balloon k earns nums[left] x nums[k] x nums[right], where left and right are its current neighbours. If you pick the first balloon to burst, its neighbours change and the two sides stop being independent.\n\nThe trick is to choose the last balloon k to burst inside an open interval (i, j). While all the others in between burst, k is still standing, so the left part (i, k) and right part (k, j) never touch each other. When k finally bursts, its neighbours are exactly i and j. Pad the array with a 1 on each end so the borders work, and the recurrence is dp[i][j] = max over k of dp[i][k] + nums[i] x nums[k] x nums[j] + dp[k][j]. For [3, 1, 5, 8] the answer is 167, in O(n^3).",
        visual: {
          type: "flow",
          title: "Why choosing the last balloon works",
          steps: [
            { label: "Open interval (i, j)", detail: "Balloons strictly between i and j." },
            { label: "Pick last k", detail: "k bursts after all the others." },
            { label: "Sides are separate", detail: "k stands between them the whole time." },
            { label: "Burst k", detail: "Neighbours are exactly i and j." },
            { label: "Add up", detail: "dp[i][k] + nums[i] x nums[k] x nums[j] + dp[k][j]" },
          ],
        },
      },
      {
        heading: "Palindromes and speeding things up",
        body: "A table is_pal[i][j] for all substrings costs O(n^2) time and space and answers \"is s[i..j] a palindrome?\" in O(1). Counting palindromic substrings is then a count of True cells. For just the longest palindromic substring, expanding around each of the 2n - 1 centres also takes O(n^2) time but only O(1) space, and Manacher's algorithm does it in O(n).\n\nPalindrome partitioning (fewest cuts so every piece is a palindrome) combines both: build is_pal, then a 1D DP cuts[j] = min(cuts[i - 1] + 1) over every palindrome s[i..j]. That is O(n^2) overall rather than O(n^3).\n\nFor some split-shaped problems, such as optimal binary search trees, Knuth's optimisation restricts the split range and lowers the time from O(n^3) to O(n^2).",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Matrix chain on dims [10, 30, 5, 60]",
        steps: [
          { label: "Length 1", detail: "dp[0][0] = dp[1][1] = dp[2][2] = 0" },
          { label: "dp[0][1]", detail: "10 x 30 x 5 = 1,500" },
          { label: "dp[1][2]", detail: "30 x 5 x 60 = 9,000" },
          { label: "dp[0][2], k = 0", detail: "0 + 9,000 + 10 x 30 x 60 = 27,000" },
          { label: "dp[0][2], k = 1", detail: "1,500 + 0 + 10 x 5 x 60 = 4,500" },
          { label: "Answer", detail: "4,500 with (AB)C" },
        ],
      },
    ],
    examples: [
      {
        title: "Burst balloons",
        explanation: "nums = [3, 1, 5, 8]. Pad it to [1, 3, 1, 5, 8, 1]. dp[i][j] is the most coins from bursting everything strictly between i and j. Fill by gap length (j - i from 2 upwards), try every last balloon k, and read the answer at dp[0][5]. One best order is burst 1, then 5, then 3, then 8: 3 x 1 x 5 + 3 x 5 x 8 + 1 x 3 x 8 + 1 x 8 x 1 = 15 + 120 + 24 + 8 = 167.",
        code: {
          lang: "python",
          code: `def max_coins(nums):                  # O(n^3) time, O(n^2) space
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for gap in range(2, n):
        for i in range(n - gap):
            j = i + gap
            dp[i][j] = max(dp[i][k] + a[i] * a[k] * a[j] + dp[k][j]
                           for k in range(i + 1, j))
    return dp[0][n - 1]

print(max_coins([3, 1, 5, 8]))  # 167
print(max_coins([1, 5]))        # 10`,
        },
      },
      {
        title: "Fewest cuts for a palindrome partition",
        explanation: "Cut \"aab\" so every piece is a palindrome, using as few cuts as possible. Step 1: an interval table pal[i][j] says whether s[i..j] is a palindrome, filled with i going down so pal[i + 1][j - 1] is ready. Step 2: cuts[j] is the fewest cuts for s[0..j]: 0 if the whole prefix is a palindrome, else 1 + cuts[i - 1] for the best palindrome s[i..j]. \"aa\" plus \"b\" needs 1 cut. Both steps are O(n^2).",
        code: {
          lang: "python",
          code: `def min_cut(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
    cuts = [0] * n
    for j in range(n):
        cuts[j] = 0 if pal[0][j] else min(cuts[i - 1] + 1 for i in range(1, j + 1) if pal[i][j])
    return cuts[-1]

print(min_cut("aab"), min_cut("abccbc"), min_cut("a"))  # 1 2 0`,
        },
      },
    ],
    cheatSheet: [
      "State dp[i][j] covers the contiguous range i..j; answer at dp[0][n - 1]",
      "Split transitions: O(n^2) states x O(n) splits = O(n^3)",
      "Fill by length, or i from n-1 down and j from i+1 up",
      "Matrix chain cost: dp[i][k] + dp[k+1][j] + dims[i] x dims[k+1] x dims[j+1]",
      "Burst balloons: pad with 1s and choose the last balloon in each open interval",
      "pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i+1][j-1])",
      "Store the best split k to print the actual bracketing",
      "Python handles n up to a few hundred for O(n^3) interval DP",
    ],
    quiz: [
      {
        q: "A is 10 x 30, B is 30 x 5, C is 5 x 60. How many scalar multiplications does A(BC) need?",
        options: ["4,500", "9,000", "18,000", "27,000"],
        answer: 3,
        why: "BC costs 30 x 5 x 60 = 9,000 and A times the 30 x 60 result costs 10 x 30 x 60 = 18,000.",
      },
      {
        q: "In burst balloons, why choose the last balloon to burst instead of the first?",
        options: ["The last one keeps the left and right parts independent", "It earns the most coins", "It makes the table 1D", "It avoids padding the array"],
        answer: 0,
        why: "While k stands, nothing on its left is ever adjacent to anything on its right.",
      },
      {
        q: "Which loop order is wrong for dp[i][j] that reads dp[i + 1][j - 1]?",
        options: ["By increasing length", "i from n - 1 down to 0, j from i up", "i from 0 up to n - 1, j from i up", "Top-down memoisation"],
        answer: 2,
        why: "Row i + 1 has not been filled yet when row i is computed with i ascending.",
      },
      {
        q: "What is the time of a palindrome table pal[i][j] over all substrings?",
        options: ["O(n)", "O(n^2)", "O(n^3)", "O(n log n)"],
        answer: 1,
        why: "There are O(n^2) cells and each uses one O(1) comparison plus one lookup.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Count the palindromic substrings of s, counting each position separately. Example: \"aaa\" gives 6.",
        hint: "Fill pal[i][j] with i going down and count the True cells.",
        solution: `def count_substrings(s):
    n, count = len(s), 0
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
            count += pal[i][j]
    return count
print(count_substrings("abc"), count_substrings("aaa"))  # 3 6`,
      },
      {
        level: "medium",
        task: "Extend matrix chain to also return the best bracketing as a string, like \"((AB)C)\". Use dims [10, 30, 5, 60].",
        hint: "Store the best k in split[i][j], then build the string recursively.",
        solution: `def chain_order(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]; split = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j], split[i][j] = min((dp[i][k] + dp[k+1][j] + dims[i] * dims[k+1] * dims[j+1], k) for k in range(i, j))
    def show(i, j):
        return chr(65 + i) if i == j else "(" + show(i, split[i][j]) + show(split[i][j] + 1, j) + ")"
    return dp[0][n - 1], show(0, n - 1)
print(chain_order([10, 30, 5, 60]))  # (4500, '((AB)C)')`,
      },
      {
        level: "hard",
        task: "A stick of length n must be cut at given positions, in any order. Each cut costs the length of the piece being cut. Return the minimum total cost. Example: n = 7, cuts [1, 3, 4, 5] gives 16.",
        hint: "Sort the cuts and add 0 and n. dp[i][j] = cheapest way to make all cuts strictly between points i and j.",
        solution: `def min_cost_cuts(n, cuts):
    c = [0] + sorted(cuts) + [n]
    m = len(c)
    dp = [[0] * m for _ in range(m)]
    for gap in range(2, m):
        for i in range(m - gap):
            j = i + gap
            dp[i][j] = c[j] - c[i] + min(dp[i][k] + dp[k][j] for k in range(i + 1, j))
    return dp[0][m - 1]
print(min_cost_cuts(7, [1, 3, 4, 5]))  # 16`,
      },
    ],
    faq: [
      { q: "How do I recognise an interval DP problem?", a: "The input is a sequence whose order cannot change, and the answer for a range depends on how you split or shrink that range. Words like merge, burst, cut, bracket or palindrome over a contiguous range are strong hints." },
      { q: "Why is interval DP usually O(n^3)?", a: "There are about n^2 / 2 intervals, and each tries up to n split points. Problems without a split loop, like palindrome tables, are O(n^2)." },
      { q: "Should I loop by length or by i descending?", a: "Both are correct when the transition reads only shorter or inner intervals. Looping by length is easier to explain; i descending is a little shorter to write." },
    ],
  },
};

export default extra;
