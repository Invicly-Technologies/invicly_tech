import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  "dsa-foundations/asymptotic-notation": {
    plain: [
      "When you write a program, you want to know: will it still be fast when the input gets big? Big-O notation is a short way to answer that. It does not tell you seconds. It tells you how the amount of work grows as the input grows.",
      "Imagine washing plates. If washing one plate takes one minute, then 10 plates take 10 minutes and 100 plates take 100 minutes. The work grows in a straight line with the number of plates. We call that O(n), where n is the number of plates.",
      "Now imagine you must compare every plate with every other plate to find matching pairs. With 10 plates that is about 100 comparisons. With 100 plates it is about 10,000. That is O(n^2), and it gets slow very fast. Big-O helps you spot this before your program meets real data.",
      "There are three related words. Big-O is a ceiling: the work grows no faster than this. Big-Omega is a floor: the work grows at least this fast. Big-Theta means both at once, a tight fit. In everyday talk, people say Big-O and usually mean the tight answer.",
    ],
    deepDive: [
      {
        heading: "What \"upper bound\" really means",
        body: "Saying f(n) is O(g(n)) means: after some starting size n0, f(n) is never more than c times g(n), for some fixed number c. You get to choose c and n0.\n\nTake f(n) = 3n + 5. Pick c = 4. Is 3n + 5 at most 4n? That is true when n is 5 or more. So with c = 4 and n0 = 5, we have shown 3n + 5 is O(n). Small inputs before n0 do not matter, because Big-O only cares about large n.",
        bullets: ["You choose the constant c and the starting point n0", "Only behaviour for large n counts", "A formal proof is just finding one valid c and n0"],
      },
      {
        heading: "Why constants and small terms are dropped",
        body: "Constants depend on the machine, the language and the compiler. A loop doing 2 steps per item on a slow laptop might beat a loop doing 1 step per item on a fast server. Big-O ignores this so you can compare ideas, not hardware.\n\nSmaller terms vanish for the same reason. In n^2 + 1000n, when n is one million, n^2 is a thousand times larger than 1000n. The biggest term always wins in the end, so it is the only one we keep.",
      },
      {
        heading: "Best, average and worst case are different questions",
        body: "Case and bound are two separate ideas. The case picks which input you are talking about. The bound describes how that cost grows.\n\nLinear search finds the target first try in the best case, which is Theta(1). In the worst case it checks all n items, which is Theta(n). On average, over random positions, it checks about n/2 items, still Theta(n). Interviews and real systems usually care about the worst case, because that is what users feel on a bad day.",
        visual: {
          type: "compare",
          title: "Linear search: three cases",
          columns: [
            { title: "Best case", points: ["Target is the first item", "1 check", "Theta(1)"] },
            { title: "Average case", points: ["Target at a random spot", "About n/2 checks", "Theta(n)"] },
            { title: "Worst case", points: ["Target last or missing", "n checks", "Theta(n)"] },
          ],
        },
      },
      {
        heading: "Turning Big-O into a feeling for speed",
        body: "A simple rule: plain Python does roughly 10 to 50 million simple steps per second. Plug your input size into the growth rate to guess the running time.\n\nWith n = 100,000, an O(n log n) solution does about 1.7 million steps and finishes in well under a second. An O(n^2) solution does 10 billion steps and takes minutes. That one calculation tells you whether to start coding or look for a better idea.",
        bullets: ["n up to about 10: O(n!) may be fine", "n up to about 20: O(2^n) is fine", "n up to about 5,000: O(n^2) is fine", "n up to about 10^6: aim for O(n log n) or O(n)"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Proving 3n + 5 is O(n)",
        steps: [
          { label: "Write the claim", detail: "3n + 5 <= c * n for large n" },
          { label: "Pick c = 4", detail: "Now need 3n + 5 <= 4n" },
          { label: "Solve", detail: "5 <= n, so n0 = 5" },
          { label: "Check n = 10", detail: "35 <= 40, holds" },
          { label: "Conclude", detail: "3n + 5 is O(n)" },
        ],
      },
      {
        type: "compare",
        title: "Steps needed when n = 1,000",
        columns: [
          { title: "Fast", points: ["O(1): 1 step", "O(log n): about 10 steps", "O(n): 1,000 steps"] },
          { title: "Fine", points: ["O(n log n): about 10,000 steps", "O(n^2): 1,000,000 steps", "Both run in well under a second"] },
          { title: "Hopeless", points: ["O(2^n): a 302-digit number", "O(n!): even bigger", "Would not finish before the sun burns out"] },
        ],
      },
    ],
    examples: [
      {
        title: "Counting the steps of a small function",
        explanation: "The function below has one loop over the list and one nested loop over all pairs. We count steps for n = 4. The first loop runs 4 times. The pair loop runs 3 + 2 + 1 + 0 = 6 times. In general that is n + n(n-1)/2 steps. Drop the constant 1/2 and the smaller n term, and you get O(n^2). The pair loop decides everything.",
        code: {
          lang: "python",
          code: "def steps(xs):\n    count = 0\n    for x in xs:                    # n steps\n        count += 1\n    for i in range(len(xs)):        # n(n-1)/2 steps\n        for j in range(i + 1, len(xs)):\n            count += 1\n    return count\n\nfor n in (4, 100, 1000):\n    print(n, steps(list(range(n))))\n# 4 10\n# 100 5050\n# 1000 500500  -> grows like n^2 / 2",
        },
      },
      {
        title: "Best, average and worst case of linear search",
        explanation: "Search for a value in [7, 3, 9, 1, 5]. Looking for 7: found at index 0 after 1 check (best case). Looking for 5: found after 5 checks. Looking for 8: not there, so all 5 items are checked (worst case). If the target is equally likely to be anywhere, the average is (1+2+3+4+5)/5 = 3 checks, about n/2. Both average and worst are O(n); only the best case is O(1).",
        code: {
          lang: "python",
          code: "def linear_search(xs, target):\n    checks = 0\n    for i, x in enumerate(xs):\n        checks += 1\n        if x == target:\n            return i, checks\n    return -1, checks\n\ndata = [7, 3, 9, 1, 5]\nfor t in (7, 5, 8):\n    print(t, linear_search(data, t))\n# 7 (0, 1)   5 (4, 5)   8 (-1, 5)",
        },
      },
    ],
    cheatSheet: [
      "Order: O(1) < O(log n) < O(n) < O(n log n) < O(n^2) < O(2^n) < O(n!)",
      "Keep the biggest term, drop constants: 5n^2 + 3n + 9 is O(n^2)",
      "O = ceiling, Omega = floor, Theta = both (tight)",
      "Case (best, average, worst) is a separate question from the bound",
      "Python does roughly 10^7 to 10^8 simple steps per second",
      "n = 10^5 means you need about O(n log n) or better",
      "log2(1,000,000) is about 20",
    ],
    quiz: [
      {
        q: "What is 7n + 3n^2 + 100 in Big-O?",
        options: ["O(n)", "O(n^2)", "O(100)", "O(n^3)"],
        answer: 1,
        why: "The n^2 term grows fastest, so it is the only one kept.",
      },
      {
        q: "Which statement about binary search on a sorted list of n items is correct?",
        options: ["It is O(n^2)", "It is Omega(n) in the worst case", "Its worst case is O(log n)", "It is O(1) in the worst case"],
        answer: 2,
        why: "Each step halves the range, so at most about log2 n steps are needed.",
      },
      {
        q: "An algorithm is Theta(n). Which of these is also true?",
        options: ["It is O(n^2)", "It is O(log n)", "It is O(1)", "It is Omega(n^2)"],
        answer: 0,
        why: "Big-O is an upper bound, so anything at most linear is also at most quadratic.",
      },
      {
        q: "With n = 100,000, which running time is too slow for a one-second limit in Python?",
        options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"],
        answer: 3,
        why: "n^2 is 10 billion steps, which takes minutes in Python.",
      },
      {
        q: "Linear search on n items has which average-case cost when the target is present at a random position?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        answer: 2,
        why: "On average it checks about n/2 items, and the constant 1/2 is dropped.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write largest(xs) that returns the biggest number in a non-empty list without using max(). Example: [4, 9, 2] returns 9. State its time complexity.",
        hint: "Keep the best value seen so far and update it as you walk the list once.",
        solution: "def largest(xs):\n    best = xs[0]\n    for x in xs[1:]:\n        if x > best:\n            best = x\n    return best\n\nprint(largest([4, 9, 2]))  # 9\n# Time O(n), space O(1) (xs[1:] copies, so use a for i loop for true O(1))",
      },
      {
        level: "medium",
        task: "has_duplicate(xs) returns True if any value appears twice. The obvious version compares all pairs in O(n^2). Write an O(n) version. Example: [3, 1, 4, 1] returns True, [1, 2, 3] returns False.",
        hint: "A set answers \"have I seen this?\" in O(1) on average.",
        solution: "def has_duplicate(xs):\n    seen = set()\n    for x in xs:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False\n\nprint(has_duplicate([3, 1, 4, 1]))  # True\nprint(has_duplicate([1, 2, 3]))  # False\n# Time O(n) average, space O(n)",
      },
      {
        level: "hard",
        task: "Given a sorted list and a number k, count pairs (i < j) with xs[i] + xs[j] <= k. Checking all pairs is O(n^2); do it in O(n). Example: [1, 2, 3, 4], k = 5 gives 4 pairs: (1,2), (1,3), (1,4), (2,3).",
        hint: "Use two pointers at both ends. If xs[lo] + xs[hi] <= k, then lo pairs with everything up to hi.",
        solution: "def count_pairs(xs, k):\n    lo, hi, total = 0, len(xs) - 1, 0\n    while lo < hi:\n        if xs[lo] + xs[hi] <= k:\n            total += hi - lo\n            lo += 1\n        else:\n            hi -= 1\n    return total\n\nprint(count_pairs([1, 2, 3, 4], 5))  # 4\n# Time O(n), space O(1)",
      },
    ],
    faq: [
      { q: "Does Big-O tell me how many seconds my code takes?", a: "No. It tells you how the work grows as input grows. To get seconds, combine it with a rough speed like 10 to 50 million simple Python steps per second, or measure with timeit." },
      { q: "Why do people say Big-O when they mean Big-Theta?", a: "Habit. In interviews and daily work, \"this is O(n)\" usually means \"this is exactly linear\". In proofs and textbooks, the difference matters." },
      { q: "Is O(2n) different from O(n)?", a: "No, they are the same class because constants are dropped. Two passes over the data is still linear." },
      { q: "Can an O(n^2) algorithm beat an O(n log n) one?", a: "Yes, for small inputs. Insertion sort beats merge sort on about 20 items, which is why real sort functions use it for small pieces." },
    ],
  },
  "dsa-foundations/analyzing-code": {
    plain: [
      "You do not need to run code to know how it will scale. You can read it, like reading a recipe and guessing how long dinner will take. Each loop, each nested loop and each recursive call adds a predictable amount of work.",
      "Steps that come one after another add up. Loops inside loops multiply. If you walk a list once and then walk it again, that is n + n, still O(n). If for every item you walk the whole list again, that is n times n, which is O(n^2).",
      "A loop that cuts its range in half each time is special. Think of tearing a phone book in half again and again until one page is left. A book of 1,000 pages needs only about 10 tears. That kind of loop is O(log n).",
      "Recursive functions are functions that call themselves. To analyse them, you write a small equation called a recurrence, such as \"the work for n equals the work for n/2 plus a little extra\". Then you solve it by drawing the calls as a tree and adding up each level.",
    ],
    deepDive: [
      {
        heading: "Count what the inner line does in total",
        body: "The most reliable trick is to ask: how many times does the innermost line run, added up over the whole program?\n\nFor \"for i in range(n): for j in range(i)\", the inner line runs 0 + 1 + 2 + ... + (n-1) times. That sum is n(n-1)/2, so it is O(n^2) even though the inner loop is shorter at the start.\n\nBut if the inner loop is \"for j in range(5)\", it runs 5n times in total, which is O(n). A nested loop is only quadratic when both loops grow with n.",
        bullets: ["Sequential blocks: add", "Nested loops: multiply only if both depend on n", "Watch built-ins: xs.insert(0, v), slicing and x in list are O(n)"],
      },
      {
        heading: "Spotting logarithms",
        body: "Any loop where the variable is multiplied or divided by a constant each round runs O(log n) times. \"i = 1; while i < n: i *= 2\" runs about log2 n times. Binary search is the classic example.\n\nA common trap: \"for i in range(n): j = n; while j > 1: j //= 2\" is O(n log n). The outer loop runs n times and the inner halving loop runs log n times each round. Multiply them.",
      },
      {
        heading: "Writing a recurrence from code",
        body: "For a recursive function, write T(n), the cost for input size n. Look at the body. Each recursive call adds a T(smaller size). Everything else is the extra work f(n).\n\nMerge sort calls itself on two halves and then merges in linear time: T(n) = 2T(n/2) + n. Binary search makes one call on half the range and does constant work: T(n) = T(n/2) + 1. Computing factorial makes one call on n - 1: T(n) = T(n-1) + 1, which is O(n).",
      },
      {
        heading: "The master theorem in plain words",
        body: "For T(n) = a T(n/b) + n^d, compare a (how many calls) with b^d (how much the extra work shrinks per level).\n\nIf a < b^d, the top level dominates: O(n^d). If a = b^d, every level costs about the same, and there are log n levels: O(n^d log n). If a > b^d, the leaves dominate because calls multiply faster than work shrinks: O(n^(log_b a)).",
        bullets: ["Merge sort: a=2, b=2, d=1, equal, so O(n log n)", "Binary search: a=1, b=2, d=0, equal, so O(log n)", "Karatsuba: a=3, b=2, d=1, leaves win, so O(n^1.58)"],
        visual: {
          type: "tree",
          title: "Master theorem: three outcomes",
          root: "T(n) = a T(n/b) + n^d",
          children: [
            { label: "a < b^d", children: ["Top level dominates", "O(n^d)"] },
            { label: "a = b^d", children: ["Every level costs the same", "O(n^d log n)", "Merge sort, binary search"] },
            { label: "a > b^d", children: ["Leaves dominate", "O(n^(log_b a))", "Karatsuba: O(n^1.58)"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Recursion tree for binary search, T(n) = T(n/2) + 1",
        root: "n = 16: 1 unit of work",
        children: [
          { label: "n = 8: 1 unit", children: ["only one branch per level"] },
          { label: "n = 4: 1 unit", children: ["range halves each time"] },
          { label: "n = 2: 1 unit" },
          { label: "n = 1: 1 unit", children: ["about log2(16) + 1 = 5 levels", "total O(log n)"] },
        ],
      },
      {
        type: "compare",
        title: "Loop shapes and their cost",
        columns: [
          { title: "Linear shapes", points: ["One loop over n: O(n)", "Two loops one after another: O(n)", "Inner loop of fixed size 5: O(n)"] },
          { title: "Quadratic shapes", points: ["for i in n, for j in n: O(n^2)", "for j in range(i): O(n^2)", "x in list inside a loop: O(n^2)"] },
          { title: "Log shapes", points: ["i *= 2 until n: O(log n)", "n loop with halving inside: O(n log n)", "Halving recursion, one call: O(log n)"] },
        ],
      },
    ],
    examples: [
      {
        title: "Tracing a halving loop on n = 20",
        explanation: "Start with n = 20. Each round does n //= 2: 20 -> 10 -> 5 -> 2 -> 1. That is 4 rounds. log2(20) is about 4.3, and rounding down gives 4. If n were one million, the loop would run only 19 times. That is why logarithmic loops feel almost free.",
        code: {
          lang: "python",
          code: "def halvings(n):\n    rounds = 0\n    while n > 1:\n        n //= 2\n        rounds += 1\n    return rounds\n\nprint(halvings(20))         # 4\nprint(halvings(1_000_000))  # 19",
        },
      },
      {
        title: "Analysing a hidden quadratic",
        explanation: "The code below looks like one loop, so it seems O(n). But \"x not in result\" scans the list result, which can hold up to n items. So each round may cost O(n), and n rounds cost O(n^2). On 10,000 distinct items, that is up to 50 million comparisons. Swapping the list for a set makes the check O(1) on average, and the whole function O(n).",
        code: {
          lang: "python",
          code: "def unique_slow(xs):          # O(n^2)\n    result = []\n    for x in xs:\n        if x not in result:   # scans result: O(n)\n            result.append(x)\n    return result\n\ndef unique_fast(xs):          # O(n)\n    seen, result = set(), []\n    for x in xs:\n        if x not in seen:     # O(1) average\n            seen.add(x)\n            result.append(x)\n    return result",
        },
      },
    ],
    cheatSheet: [
      "One loop over n: O(n). Two nested loops over n: O(n^2)",
      "0 + 1 + ... + (n-1) = n(n-1)/2, which is O(n^2)",
      "Multiply or divide the loop variable each round: O(log n)",
      "T(n) = T(n/2) + O(1) gives O(log n)",
      "T(n) = 2T(n/2) + O(n) gives O(n log n)",
      "T(n) = T(n-1) + O(1) gives O(n); T(n) = 2T(n-1) + O(1) gives O(2^n)",
      "Count built-in costs: x in list, slicing and insert(0, x) are O(n)",
    ],
    quiz: [
      {
        q: "What is the cost of: for i in range(n): for j in range(10): work()?",
        options: ["O(n)", "O(n^2)", "O(10^n)", "O(log n)"],
        answer: 0,
        why: "The inner loop is a fixed 10 steps, so the total is 10n, which is O(n).",
      },
      {
        q: "What does T(n) = 2T(n/2) + n solve to?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(n^2)"],
        answer: 2,
        why: "Each of the log n levels does about n work in total.",
      },
      {
        q: "A loop starts at i = n and does i = i // 3 until i is 0. How many rounds?",
        options: ["About n/3", "About log3 n", "About n^3", "Exactly 3"],
        answer: 1,
        why: "Dividing by a constant each round gives a logarithmic number of rounds.",
      },
      {
        q: "What does T(n) = 2T(n-1) + 1 solve to?",
        options: ["O(n)", "O(n^2)", "O(n log n)", "O(2^n)"],
        answer: 3,
        why: "Each level doubles the number of calls, and there are n levels.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write count_digits(n) that counts the decimal digits of a positive integer using a loop that divides by 10. Example: 4096 returns 4. What is its complexity in terms of n?",
        hint: "Each division by 10 removes one digit.",
        solution: "def count_digits(n):\n    digits = 0\n    while n > 0:\n        n //= 10\n        digits += 1\n    return digits\n\nprint(count_digits(4096))  # 4\n# Time O(log n) (base 10), space O(1)",
      },
      {
        level: "medium",
        task: "Write power(x, n) that computes x to the power n using recursion with halving: x^n = (x^(n/2))^2, times x if n is odd. Example: power(3, 5) returns 243. Write its recurrence.",
        hint: "Make one recursive call on n // 2 and reuse its result twice.",
        solution: "def power(x, n):\n    if n == 0:\n        return 1\n    half = power(x, n // 2)\n    result = half * half\n    return result * x if n % 2 else result\n\nprint(power(3, 5))  # 243\n# T(n) = T(n/2) + O(1) -> O(log n) time, O(log n) stack space",
      },
      {
        level: "hard",
        task: "Write count_calls(n) that returns how many times a naive recursive fib(n) gets called, where fib(n) = fib(n-1) + fib(n-2) and fib(0), fib(1) are base cases. Example: count_calls(5) returns 15. Explain why the growth is exponential.",
        hint: "calls(n) = 1 + calls(n-1) + calls(n-2), with calls(0) = calls(1) = 1. Compute it with a loop.",
        solution: "def count_calls(n):\n    a, b = 1, 1          # calls(0), calls(1)\n    for _ in range(n - 1):\n        a, b = b, 1 + a + b\n    return b if n > 0 else a\n\nprint(count_calls(5))   # 15\nprint(count_calls(30))  # 2692537\n# Calls grow like 1.618^n, because each call spawns two more.\n# This helper itself runs in O(n) time, O(1) space.",
      },
    ],
    faq: [
      { q: "Do I need the master theorem for interviews?", a: "Rarely by name. But knowing the three common results, O(log n), O(n log n) and O(2^n), for the usual recursions is expected." },
      { q: "How do I analyse code with a while loop that moves two pointers?", a: "Count the total moves. If each round moves at least one pointer forward and pointers never move back, the total is at most n rounds, so O(n)." },
      { q: "Why is my one-loop function slow?", a: "Look for hidden loops inside it: x in list, list.index, string concatenation, slicing or sorting inside the loop each cost O(n) or more per round." },
    ],
  },
  "dsa-foundations/amortized-space": {
    plain: [
      "Some operations are usually cheap but sometimes expensive. Adding to a Python list is like this. Most of the time it takes one tiny step. Once in a while the list runs out of room and has to move everything into a bigger space. Amortised analysis asks: averaged over many operations, what does each one really cost?",
      "Think of a monthly train pass. One day you pay a lot, but spread over 30 rides, each ride is cheap. Amortised cost spreads the rare big cost over all the cheap ones. For list append, the answer is O(1) per append, even counting the big moves.",
      "Space complexity is the other side of the coin. It asks how much extra memory your code needs. A function that builds a new list of size n uses O(n) extra space. A function that only keeps a few counters uses O(1).",
      "Recursion uses hidden memory. Every call waiting for an answer sits on the call stack, like a pile of sticky notes. A recursion that goes n levels deep needs n notes, so O(n) space, even if it never creates a list.",
    ],
    deepDive: [
      {
        heading: "The aggregate method, step by step",
        body: "The aggregate method is the simplest way to find amortised cost. Add up the total cost of n operations, then divide by n.\n\nFor a list that doubles its capacity, append n items starting from capacity 1. Ordinary appends cost 1 each, so n total. Resizes copy 1, 2, 4, 8 and so on up to less than n items. That geometric series adds up to less than 2n. Total work is under 3n, so each append costs under 3 steps on average: O(1).",
        bullets: ["Total for n appends < n + 2n = 3n", "3n / n = 3, a constant", "Growing by a fixed +10 instead gives O(n) per append"],
      },
      {
        heading: "Why growing by a fixed amount fails",
        body: "Suppose the list grows by 10 slots each time instead of doubling. Then a resize happens every 10 appends, and each resize copies everything so far: 10, 20, 30, up to n. That sum is about n^2 / 20, which is O(n^2) in total and O(n) per append.\n\nThe lesson: growing by a percentage (double, or Python's roughly 1.125 times plus a bit) keeps appends cheap. Growing by a fixed number does not.",
        visual: {
          type: "flow",
          title: "Growing by a fixed 10 slots",
          steps: [
            { label: "Resize every 10 appends" },
            { label: "Each resize copies all", detail: "10, 20, 30, up to n items" },
            { label: "Total copies", detail: "About n^2 / 20" },
            { label: "Per append", detail: "O(n), not O(1)" },
          ],
        },
      },
      {
        heading: "Amortised is not the same as average case",
        body: "Average case assumes something about the input, like \"the target is at a random spot\". Bad luck can still give you the worst case.\n\nAmortised cost makes no such assumption. It is a promise about any sequence of operations: no matter what you append, n appends cost O(n) in total. One single append can still be slow, which matters in real-time systems such as games, where one long pause is noticeable.",
        visual: {
          type: "compare",
          title: "Average case vs amortised",
          columns: [
            { title: "Average case", points: ["Assumes something about the input", "Bad luck still gives the worst case", "Example: linear search checks about n/2"] },
            { title: "Amortised", points: ["No assumption about the input", "Promise over any sequence of operations", "One operation can still be slow", "Example: n appends cost O(n) total"] },
          ],
        },
      },
      {
        heading: "Counting space honestly",
        body: "Input space is the memory holding your input. Auxiliary space is everything extra you allocate. When people say an algorithm is \"O(1) space\" they mean auxiliary space.\n\nCount these: new lists, dicts and sets; copies made by slicing like xs[1:]; strings built along the way; and the recursion stack depth. A recursive function that slices its list on every call can quietly use O(n^2) memory, because each level keeps its own copy.",
        bullets: ["Slicing creates a copy: O(k) space for k items", "Recursion depth d means O(d) stack space", "Python's default recursion limit is about 1000"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Appending 9 items to a doubling list",
        steps: [
          { label: "Appends 1-2", detail: "Capacity 1 -> 2, copy 1 item" },
          { label: "Append 3", detail: "Capacity 2 -> 4, copy 2 items" },
          { label: "Append 5", detail: "Capacity 4 -> 8, copy 4 items" },
          { label: "Append 9", detail: "Capacity 8 -> 16, copy 8 items" },
          { label: "Total", detail: "9 writes + 15 copies = 24 steps, under 3 per append" },
        ],
      },
      {
        type: "compare",
        title: "Where the extra memory goes",
        columns: [
          { title: "O(1) extra", points: ["A few counters", "Swapping in place", "Two-pointer loops"] },
          { title: "O(n) extra", points: ["A new result list", "A set of seen items", "Recursion n levels deep"] },
          { title: "Surprise O(n^2)", points: ["Slicing on every recursive call", "Building a 2D table n by n", "Storing every prefix as a string"] },
        ],
      },
    ],
    examples: [
      {
        title: "Measuring the resize cost yourself",
        explanation: "We simulate a doubling array and count copies. With 1,000 appends, copies add up to 1 + 2 + 4 + ... + 512 = 1,023. Total work is 1,000 writes plus 1,023 copies, about 2 per append. Doubling the number of appends roughly doubles the total, which is exactly linear growth.",
        code: {
          lang: "python",
          code: "def append_cost(n):\n    cap, size, copies = 1, 0, 0\n    for _ in range(n):\n        if size == cap:\n            copies += size   # move everything\n            cap *= 2\n        size += 1\n    return n + copies\n\nprint(append_cost(1000))   # 2023\nprint(append_cost(2000))   # 4047",
        },
      },
      {
        title: "Same answer, different space",
        explanation: "Both functions sum a list. The recursive one makes n nested calls, and each call slices the list, copying it. For n = 5 that is copies of length 4, 3, 2, 1, so about n^2 / 2 items in total, plus 5 stack frames. The loop version uses one counter: O(1) extra space. Try the recursive one on 5,000 items and Python raises RecursionError.",
        code: {
          lang: "python",
          code: "def sum_rec(xs):          # O(n) stack, O(n^2) copied items\n    if not xs:\n        return 0\n    return xs[0] + sum_rec(xs[1:])\n\ndef sum_loop(xs):         # O(1) extra space\n    total = 0\n    for x in xs:\n        total += x\n    return total\n\nprint(sum_rec([1, 2, 3, 4, 5]), sum_loop([1, 2, 3, 4, 5]))  # 15 15",
        },
      },
    ],
    cheatSheet: [
      "Amortised cost = total cost of n operations / n",
      "Doubling capacity: n appends cost under 3n steps, so O(1) each",
      "Growing by a fixed +k: O(n) per append, avoid it",
      "Amortised is a guarantee for any sequence; average case assumes random input",
      "Auxiliary space = extra memory beyond the input",
      "Recursion depth d costs O(d) stack space",
      "xs[1:] copies; pass an index instead to save memory",
      "Measure: timeit for time, tracemalloc for memory",
    ],
    quiz: [
      {
        q: "A dynamic array doubles when full. What is the amortised cost of append?",
        options: ["O(log n)", "O(n)", "O(1)", "O(n^2)"],
        answer: 2,
        why: "Total copying over n appends is under 2n, so each append costs a constant on average.",
      },
      {
        q: "What is the auxiliary space of reversing a list in place with two pointers?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        answer: 0,
        why: "Only two index variables are needed, no matter how long the list is.",
      },
      {
        q: "How does amortised cost differ from average-case cost?",
        options: ["They are the same thing", "Amortised needs random inputs", "Average case is always worse", "Amortised holds for any sequence of operations, with no luck involved"],
        answer: 3,
        why: "Amortised analysis bounds the total for every sequence, not an expected value over random inputs.",
      },
      {
        q: "A recursive function calls itself on n - 1 until 0, keeping no lists. What is its space?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        answer: 1,
        why: "n calls are waiting on the call stack at the deepest point.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write reverse_in_place(xs) that reverses a list without creating a new list. Example: [1, 2, 3, 4] becomes [4, 3, 2, 1]. State the time and auxiliary space.",
        hint: "Swap the two ends, then move both pointers inward.",
        solution: "def reverse_in_place(xs):\n    i, j = 0, len(xs) - 1\n    while i < j:\n        xs[i], xs[j] = xs[j], xs[i]\n        i += 1\n        j -= 1\n    return xs\n\nprint(reverse_in_place([1, 2, 3, 4]))  # [4, 3, 2, 1]\n# Time O(n), auxiliary space O(1)",
      },
      {
        level: "medium",
        task: "Write copies_for(n, grow) that simulates n appends to an array starting at capacity 1, where grow(cap) returns the new capacity, and returns the total number of copied items. Compare grow = lambda c: c * 2 with grow = lambda c: c + 10 for n = 10,000.",
        hint: "Each time size equals capacity, add size to copies and call grow.",
        solution: "def copies_for(n, grow):\n    cap, size, copies = 1, 0, 0\n    for _ in range(n):\n        if size == cap:\n            copies += size\n            cap = grow(cap)\n        size += 1\n    return copies\n\nprint(copies_for(10_000, lambda c: c * 2))   # 16383\nprint(copies_for(10_000, lambda c: c + 10))  # 4996000\n# Simulation is O(n) time, O(1) space",
      },
      {
        level: "hard",
        task: "Design a stack with push, pop and get_min, all O(1) amortised time. Example: push 5, push 2, push 7, get_min is 2; pop, pop, get_min is 5. What is its space?",
        hint: "Store pairs (value, smallest value so far) on one list.",
        solution: "class MinStack:\n    def __init__(self):\n        self.items = []          # (value, min so far)\n    def push(self, x):\n        low = min(x, self.items[-1][1]) if self.items else x\n        self.items.append((x, low))\n    def pop(self):\n        return self.items.pop()[0]\n    def get_min(self):\n        return self.items[-1][1]\n# All O(1) amortised (list append/pop); space O(n)",
      },
    ],
    faq: [
      { q: "Is list.append really O(1)?", a: "It is O(1) amortised. A single append that triggers a resize costs O(n), but these are rare enough that the average over many appends is constant." },
      { q: "Does the input count toward space complexity?", a: "Usually not. Most people quote auxiliary space, the extra memory beyond the input. Say which one you mean if it matters." },
      { q: "Why does my recursive code crash with RecursionError?", a: "Python limits the stack to about 1000 nested calls by default. Rewrite deep recursion as a loop with an explicit stack, or raise the limit with sys.setrecursionlimit carefully." },
    ],
  },
  "dsa-foundations/math-basics": {
    plain: [
      "You only need a small toolbox of math for algorithms. Most of it you already know from school. It just has a few new names.",
      "A logarithm answers: how many times can I cut this in half before I reach 1? Fold a sheet of paper in half again and again. log2 of 1,024 is 10 because you can halve 1,024 ten times. That is why binary search over a billion items needs only about 30 steps.",
      "Sums tell you how much a loop does in total. Adding 1 + 2 + 3 up to n gives about n^2 / 2. Doubling sums like 1 + 2 + 4 + 8 add up to just under twice the last number. These two facts explain most loop costs.",
      "Modular arithmetic means working with remainders, like a clock. After 12 comes 1 again. Programs use it to keep huge numbers small, for hashing and for answers \"modulo 10^9 + 7\". Counting formulas, like how many ways to arrange or choose items, tell you if trying every option is even possible.",
    ],
    deepDive: [
      {
        heading: "Logarithms you should know by heart",
        body: "log2 n is the number of halvings to get from n down to 1. It is also the number of bits needed to write n in binary, roughly.\n\nThe base barely matters in Big-O, because log2 n and log10 n differ only by a constant factor (about 3.32). That is why we just write O(log n).\n\nUseful anchors: log2 of 1,000 is about 10, of a million about 20, of a billion about 30. Two rules cover most algebra: log(a times b) = log a + log b, and log(a^k) = k log a.",
        bullets: ["2^10 = 1,024, about a thousand", "2^20 is about a million", "2^30 is about a billion", "log(n!) is about n log n"],
      },
      {
        heading: "The two sums behind most loops",
        body: "Arithmetic series: 1 + 2 + ... + n = n(n+1)/2. A trick: pair the first and last numbers. 1 + n, 2 + (n-1), and so on, each pair adds to n + 1, and there are n/2 pairs. Any loop where the inner part grows by one each round has this shape, so it is O(n^2).\n\nGeometric series: 1 + 2 + 4 + ... + 2^k = 2^(k+1) - 1. The last term is about half the total. So when work doubles each step, the final step dominates. That is why doubling a dynamic array costs only O(n) overall.",
        visual: {
          type: "compare",
          title: "The two sums behind most loops",
          columns: [
            { title: "Arithmetic series", points: ["1 + 2 + ... + n", "= n(n+1)/2", "Inner loop grows by one each round", "Total O(n^2)"] },
            { title: "Geometric series", points: ["1 + 2 + 4 + ... + 2^k", "= 2^(k+1) - 1", "Work doubles each step", "Last step is about half the total"] },
          ],
        },
      },
      {
        heading: "Modular arithmetic rules",
        body: "a mod m is the remainder after dividing a by m. Python writes it a % m, and the result is always between 0 and m - 1 for positive m.\n\nYou can take the remainder at every step of addition and multiplication without changing the final answer: (a + b) % m = ((a % m) + (b % m)) % m, and the same for times. This keeps numbers small. Subtraction works too, but in other languages add m before taking the remainder to avoid negatives. Division does not work directly; you need a modular inverse, which for a prime m is pow(b, m - 2, m).",
        visual: {
          type: "flow",
          title: "Taking remainders early: (17 + 25) % 7",
          steps: [
            { label: "17 % 7 = 3" },
            { label: "25 % 7 = 4" },
            { label: "3 + 4 = 7" },
            { label: "7 % 7 = 0" },
            { label: "Check", detail: "42 % 7 = 0, same answer" },
          ],
        },
      },
      {
        heading: "Counting how big a search space is",
        body: "Before brute forcing, count the options. Arranging n distinct items in order gives n! permutations: 10! is about 3.6 million, but 15! is over a trillion. Choosing k items from n, ignoring order, gives n choose k = n! / (k! (n-k)!). Every subset of n items: 2^n, because each item is in or out.\n\nSo n = 20 means 2^20, about a million subsets, which is fine. n = 40 means 2^40, a trillion, which is not.",
        bullets: ["Permutations of n: n!", "Subsets of n: 2^n", "Choose k of n: n! / (k! (n-k)!)", "math.comb(n, k) and math.perm(n, k) compute these"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Fast power: 3^13 by squaring",
        steps: [
          { label: "13 in binary", detail: "1101 = 8 + 4 + 1" },
          { label: "Square repeatedly", detail: "3^1, 3^2, 3^4, 3^8" },
          { label: "Keep the 1-bits", detail: "3^8 * 3^4 * 3^1" },
          { label: "Multiply", detail: "6561 * 81 * 3 = 1,594,323" },
          { label: "Cost", detail: "About log2(13) squarings, not 12 multiplies" },
        ],
      },
      {
        type: "compare",
        title: "How fast the counts grow",
        columns: [
          { title: "n = 10", points: ["log2 n is about 3.3", "n^2 = 100", "2^n = 1,024", "n! = 3,628,800"] },
          { title: "n = 20", points: ["log2 n is about 4.3", "n^2 = 400", "2^n is about a million", "n! is about 2.4 x 10^18"] },
          { title: "n = 40", points: ["log2 n is about 5.3", "n^2 = 1,600", "2^n is about a trillion", "n! is about 8 x 10^47"] },
        ],
      },
    ],
    examples: [
      {
        title: "Last digit of a huge power",
        explanation: "What is the last digit of 7^222? The last digit is the number mod 10. Powers of 7 mod 10 go 7, 9, 3, 1, then repeat every 4. Since 222 mod 4 = 2, the answer is the second in the cycle: 9. Python's pow(7, 222, 10) uses fast exponentiation and confirms it without ever building the full 188-digit number.",
        code: {
          lang: "python",
          code: "cycle = [pow(7, k, 10) for k in range(1, 5)]\nprint(cycle)             # [7, 9, 3, 1]\nprint(pow(7, 222, 10))   # 9\nprint(len(str(7**222)))  # 188",
        },
      },
      {
        title: "Is brute force possible? Counting first",
        explanation: "You have 25 numbers and want a subset that sums to a target. There are 2^25, about 33 million subsets. Each needs up to 25 additions, so close to a billion steps, too slow for Python. With 15 numbers it is only 32,768 subsets, instantly fine. Counting first saves you from writing code that will never finish.",
        code: {
          lang: "python",
          code: "import math\n\nfor n in (15, 25, 40):\n    print(n, 2 ** n, math.comb(n, n // 2))\n# 15 32768 6435\n# 25 33554432 5200300\n# 40 1099511627776 137846528820",
        },
      },
    ],
    cheatSheet: [
      "log2(1e3) is about 10, log2(1e6) about 20, log2(1e9) about 30",
      "1 + 2 + ... + n = n(n+1)/2",
      "1 + 2 + 4 + ... + 2^k = 2^(k+1) - 1",
      "(a * b) % m = ((a % m) * (b % m)) % m",
      "pow(a, b, m) computes a^b mod m in O(log b)",
      "Subsets: 2^n; permutations: n!; choose: math.comb(n, k)",
      "10^9 + 7 is a common prime modulus in problems",
    ],
    quiz: [
      {
        q: "About how many halvings take one billion down to 1?",
        options: ["30", "1,000", "9", "500 million"],
        answer: 0,
        why: "2^30 is about 1.07 billion, so log2 of a billion is about 30.",
      },
      {
        q: "What is 1 + 2 + 4 + ... + 512?",
        options: ["512", "1,024", "1,023", "2,048"],
        answer: 2,
        why: "The sum of powers of two up to 2^k is 2^(k+1) - 1, here 1024 - 1.",
      },
      {
        q: "How many multiplications does fast exponentiation need for a^b?",
        options: ["O(b)", "O(b^2)", "O(1)", "O(log b)"],
        answer: 3,
        why: "It squares once per bit of b, and b has about log2 b bits.",
      },
      {
        q: "How many subsets does a set of 10 items have?",
        options: ["100", "1,024", "3,628,800", "10"],
        answer: 1,
        why: "Each item is either in or out, giving 2^10 subsets.",
      },
      {
        q: "Which identity is NOT safe to apply directly in modular arithmetic?",
        options: ["Taking mod after each addition", "Taking mod after each multiplication", "Dividing both sides by a number", "Taking mod at the very end only"],
        answer: 2,
        why: "Division needs a modular inverse; plain division does not work with remainders.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write sum_to(n) that returns 1 + 2 + ... + n in O(1) using the formula, and check it against a loop for n = 100. Expected: 5050.",
        hint: "Pair the first and last numbers.",
        solution: "def sum_to(n):\n    return n * (n + 1) // 2\n\nprint(sum_to(100))  # 5050\nprint(sum_to(100) == sum(range(1, 101)))  # True\n# Time O(1), space O(1)",
      },
      {
        level: "medium",
        task: "Write fast_pow(a, b, m) that returns a^b mod m without using pow's third argument. Example: fast_pow(2, 10, 1000) returns 24.",
        hint: "Look at b's bits from lowest to highest; square a each round and multiply into the result when the bit is 1.",
        solution: "def fast_pow(a, b, m):\n    result, a = 1, a % m\n    while b > 0:\n        if b & 1:\n            result = result * a % m\n        a = a * a % m\n        b >>= 1\n    return result\n\nprint(fast_pow(2, 10, 1000))  # 24\n# Time O(log b), space O(1)",
      },
      {
        level: "hard",
        task: "Write n_choose_k_mod(n, k) that returns n choose k modulo the prime 10^9 + 7, for n up to 10^6. Example: n_choose_k_mod(5, 2) returns 10, and n_choose_k_mod(1000, 500) matches math.comb(1000, 500) % (10^9 + 7).",
        hint: "Compute n! / (k! (n-k)!) mod p using modular inverses: x^(p-2) mod p is the inverse of x.",
        solution: "import math\nP = 10**9 + 7\ndef n_choose_k_mod(n, k):\n    num = den = 1\n    for i in range(k):\n        num = num * (n - i) % P\n        den = den * (i + 1) % P\n    return num * pow(den, P - 2, P) % P\n\nprint(n_choose_k_mod(5, 2))  # 10\nprint(n_choose_k_mod(1000, 500) == math.comb(1000, 500) % P)  # True\n# Time O(k + log P), space O(1)",
      },
    ],
    faq: [
      { q: "Why do problems ask for answers modulo 10^9 + 7?", a: "The true answer would have thousands of digits. Taking it modulo a large prime keeps numbers inside 64 bits in most languages, and being prime makes modular division possible." },
      { q: "Does the base of the logarithm matter in Big-O?", a: "No. Changing the base only multiplies by a constant, which Big-O ignores. Inside an exponent, like n^(log2 3), the base does matter." },
      { q: "Do I need calculus for algorithms?", a: "Almost never for everyday problems. Logs, sums, remainders and counting cover the vast majority of what you will meet." },
    ],
  },
  "dsa-foundations/python-for-dsa": {
    plain: [
      "Python gives you ready-made data structures. A list is a growable row of boxes. A dict is a labelled cabinet where you find things by name. A set is a bag that only cares whether something is inside. Picking the right one is often the whole trick to a fast solution.",
      "Each one is quick at some jobs and slow at others. Finding the 5th item in a list is instant, but checking if a value is somewhere in a list means looking through every box. A set answers \"is it in here?\" almost instantly, but it has no order and no positions.",
      "The collections module adds handy tools. deque is a line of people where you can join or leave at either end quickly. Counter counts things for you. defaultdict creates an empty value the first time you use a key, so you skip the \"if key not in dict\" dance.",
      "Two more modules round out the kit. heapq keeps the smallest item ready to grab, like a to-do list sorted by urgency. bisect finds where a value belongs in a sorted list using binary search. Together these cover almost every structure you need in coding problems.",
    ],
    deepDive: [
      {
        heading: "Why the list is fast at the end and slow at the front",
        body: "A Python list stores pointers in one continuous block of memory. Reading xs[i] is one calculation: start address plus i times the pointer size. That is O(1).\n\nAppending to the end usually just fills the next free slot. But inserting or removing at the front means every other element must shift one place, which is O(n). That is why xs.pop(0) in a loop of n items costs O(n^2) overall, and why queues should use deque.",
        bullets: ["xs[i], xs[i] = v, append, pop(): O(1)", "insert(0, v), pop(0), remove(v): O(n)", "v in xs, xs.index(v), min, max: O(n)", "xs.sort(): O(n log n)", "xs[a:b] copies: O(b - a)"],
      },
      {
        heading: "Dicts and sets: hashing behind the scenes",
        body: "Dicts and sets are hash tables. When you look up a key, Python computes a number from it (its hash), jumps to a slot, and checks the few items there. That is O(1) on average, no matter how big the dict.\n\nKeys must be hashable, meaning they cannot change. Strings, numbers and tuples work. Lists and dicts do not, so convert a list to a tuple to use it as a key. Since Python 3.7, dicts remember insertion order, which is handy for output.",
        visual: {
          type: "flow",
          title: "One dict lookup",
          steps: [
            { label: "d[\"apple\"]", detail: "Look up a key" },
            { label: "hash(\"apple\")", detail: "Turn the key into a number" },
            { label: "Jump to a slot", detail: "Slot index comes from the hash" },
            { label: "Compare keys", detail: "Check the few entries found there" },
            { label: "Return value", detail: "O(1) on average" },
          ],
        },
      },
      {
        heading: "Counter and defaultdict save lines and bugs",
        body: "Counter(\"banana\") gives counts for each letter in one call, and most_common(k) returns the top k. Two Counters can be compared with == to check if two words are anagrams.\n\ndefaultdict(list) gives you an empty list the first time you touch a new key. Grouping becomes one line: groups[key].append(item). defaultdict(int) starts counts at zero. Both are still plain dicts, with the same O(1) average costs.",
      },
      {
        heading: "heapq and bisect in one minute",
        body: "heapq turns a plain list into a min-heap. heappush and heappop cost O(log n), and h[0] is always the smallest item. For a max-heap, push negative numbers. heapify turns an existing list into a heap in O(n).\n\nbisect works on a list that is already sorted. bisect_left(xs, v) returns the first index where v could go, in O(log n). insort inserts and keeps the list sorted, but the insert itself still shifts items, so it is O(n).",
        bullets: ["heapq.nlargest(k, xs) is O(n log k)", "Push tuples like (priority, item) to sort by priority", "bisect_left: first index with xs[i] >= v", "bisect_right: first index with xs[i] > v"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which container should I use?",
        root: "What do you need to do most?",
        children: [
          { label: "Access by position", children: ["list"] },
          { label: "Is x present? Look up by key", children: ["set", "dict"] },
          { label: "Add or remove at both ends", children: ["collections.deque"] },
          { label: "Always grab the smallest", children: ["heapq on a list"] },
          { label: "Count or group things", children: ["Counter", "defaultdict"] },
          { label: "Search a sorted list", children: ["bisect"] },
        ],
      },
    ],
    examples: [
      {
        title: "Same task, 1,000 times faster",
        explanation: "We check 10,000 lookups against 10,000 numbers. With a list, each \"in\" scans up to 10,000 items, so up to 100 million comparisons. With a set, each \"in\" is one hash and a jump. The only change is wrapping the data in set(). On a typical laptop the list version takes around a second; the set version takes about a millisecond.",
        code: {
          lang: "python",
          code: "import timeit\n\nnums = list(range(10_000))\nqueries = list(range(5_000, 15_000))\nnum_set = set(nums)\n\nslow = timeit.timeit(lambda: sum(q in nums for q in queries), number=1)\nfast = timeit.timeit(lambda: sum(q in num_set for q in queries), number=1)\nprint(f\"list: {slow:.3f}s  set: {fast:.5f}s\")",
        },
      },
      {
        title: "A word-count tool with Counter and defaultdict",
        explanation: "Given a sentence, find the most common word and group words by their first letter. Counter does the counting in one line. defaultdict(list) builds the groups without checking whether each key exists. For \"the cat and the hat\", \"the\" appears twice, and the letter t group holds \"the\", \"the\".",
        code: {
          lang: "python",
          code: "from collections import Counter, defaultdict\n\nwords = \"the cat and the hat\".split()\nprint(Counter(words).most_common(1))  # [('the', 2)]\n\nby_letter = defaultdict(list)\nfor w in words:\n    by_letter[w[0]].append(w)\nprint(dict(by_letter))\n# {'t': ['the', 'the'], 'c': ['cat'], 'a': ['and'], 'h': ['hat']}",
        },
      },
    ],
    cheatSheet: [
      "list: index and append O(1); insert(0)/pop(0) and x in list O(n)",
      "dict/set: get, add, delete, x in s are O(1) average",
      "deque: append, appendleft, pop, popleft all O(1)",
      "heapq: push/pop O(log n), h[0] is the min, heapify O(n)",
      "bisect_left on a sorted list: O(log n)",
      "Max-heap trick: push -x, negate again when popping",
      "Use tuples, not lists, as dict keys",
      "sorted(xs, key=...) is stable and O(n log n)",
    ],
    quiz: [
      {
        q: "Which container should hold a BFS queue?",
        options: ["list with pop(0)", "set", "collections.deque", "dict"],
        answer: 2,
        why: "deque.popleft is O(1), while list.pop(0) shifts every item.",
      },
      {
        q: "What is the cost of heapq.heappush on a heap of n items?",
        options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
        answer: 0,
        why: "The new item bubbles up at most the height of the tree, about log n levels.",
      },
      {
        q: "Why can a list not be a dict key?",
        options: ["Lists are too slow", "Lists can change, so their hash would not be stable", "Dicts only accept strings", "Lists have no length"],
        answer: 1,
        why: "A key's hash must never change; mutable lists break that rule, so Python makes them unhashable.",
      },
      {
        q: "xs is a sorted list of n items. What does bisect_left(xs, v) cost?",
        options: ["O(n)", "O(1)", "O(n log n)", "O(log n)"],
        answer: 3,
        why: "It is a binary search, halving the range each step.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write first_unique(s) that returns the index of the first character that appears exactly once in s, or -1. Example: \"leetcode\" returns 0, \"aabb\" returns -1.",
        hint: "Count with Counter first, then scan the string in order.",
        solution: "from collections import Counter\n\ndef first_unique(s):\n    counts = Counter(s)\n    for i, ch in enumerate(s):\n        if counts[ch] == 1:\n            return i\n    return -1\n\nprint(first_unique(\"leetcode\"))  # 0\nprint(first_unique(\"aabb\"))  # -1\n# Time O(n), space O(alphabet)",
      },
      {
        level: "medium",
        task: "Write k_smallest(xs, k) that returns the k smallest numbers in sorted order using heapq, without sorting the whole list. Example: [7, 2, 9, 4, 1], k = 3 returns [1, 2, 4].",
        hint: "heapify the list, then pop k times.",
        solution: "import heapq\n\ndef k_smallest(xs, k):\n    h = list(xs)\n    heapq.heapify(h)          # O(n)\n    return [heapq.heappop(h) for _ in range(k)]\n\nprint(k_smallest([7, 2, 9, 4, 1], 3))  # [1, 2, 4]\n# Time O(n + k log n), space O(n)",
      },
      {
        level: "hard",
        task: "Write count_in_range(xs, queries) where xs is a list of numbers and each query is (lo, hi). Return how many numbers fall in [lo, hi] for each query, fast enough for 10^5 numbers and 10^5 queries. Example: xs = [5, 1, 8, 3, 9], queries [(2, 8), (10, 20)] returns [3, 0].",
        hint: "Sort once, then two bisects per query.",
        solution: "from bisect import bisect_left, bisect_right\n\ndef count_in_range(xs, queries):\n    s = sorted(xs)\n    return [bisect_right(s, hi) - bisect_left(s, lo) for lo, hi in queries]\n\nprint(count_in_range([5, 1, 8, 3, 9], [(2, 8), (10, 20)]))  # [3, 0]\n# Time O(n log n + q log n), space O(n)",
      },
    ],
    faq: [
      { q: "Is a Python list a linked list or an array?", a: "An array of pointers that grows automatically. That is why indexing is fast and inserting at the front is slow." },
      { q: "Why does heapq not have a max-heap?", a: "It only implements a min-heap. Push negated numbers, or tuples like (-priority, item), to get max-heap behaviour." },
      { q: "When should I use OrderedDict now that dicts keep order?", a: "Rarely. It still helps when you need move_to_end or popitem(last=False), for example when building an LRU cache." },
      { q: "Is set lookup always O(1)?", a: "On average, yes. In theory many keys with the same hash could make it O(n), but with built-in types this almost never happens in practice." },
    ],
  },
  "dsa-arrays-strings/static-arrays": {
    plain: [
      "An array is a row of boxes, all the same size, sitting side by side in memory. Each box has a number called its index, starting at 0. Because the boxes are equal and touching, the computer can jump straight to any box without looking at the others.",
      "Picture a street where every house is exactly 10 metres wide and house 0 starts at the corner. House 7 must be 70 metres down the road. You do not walk past each house; you just do the math. That is why reading arr[7] takes the same time as reading arr[0].",
      "The catch is that the row cannot easily make room in the middle. To squeeze a new value into position 2, everything from position 2 onwards must slide one place right, like people in a cinema row shuffling over for a latecomer. Deleting works the same way in reverse.",
      "A static array has a fixed size chosen when it is created. If you need more room, you must make a new, bigger array and copy everything over. Dynamic arrays, like Python lists, do this for you automatically.",
    ],
    deepDive: [
      {
        heading: "The address formula",
        body: "Memory is one long numbered strip of bytes. An array of 4-byte integers that starts at address 1000 keeps element 0 at bytes 1000-1003, element 1 at 1004-1007, and so on.\n\nSo the address of element i is: base + i times size. For i = 5, that is 1000 + 5 x 4 = 1020. One multiply and one add, no matter if the array has ten items or ten million. This is the whole reason indexing is O(1), and it only works because every element is the same size and they sit with no gaps.",
        bullets: ["address(i) = base + i x element_size", "Same cost for any i: O(1)", "Index 0 is the base itself, which is one reason indexes start at 0"],
      },
      {
        heading: "Insert and delete mean shifting",
        body: "To insert at index i in an array holding n items, move items n-1 down to i one step right, starting from the end so nothing gets overwritten. Then write the new value at i. That is n - i moves.\n\nDeleting at i is the mirror image: move items i+1 up to n-1 one step left, starting from i+1. Inserting at the end costs nothing extra, but inserting at the front moves all n items. So the worst case is O(n). If you do not care about order, there is a trick: delete by copying the last item into the hole, which is O(1).",
      },
      {
        heading: "Why arrays are fast in real hardware",
        body: "The CPU does not fetch one number at a time from main memory. It fetches a whole cache line, usually 64 bytes, and keeps it in a small, very fast cache. When you read arr[0], arr[1] up to about arr[15] (for 4-byte ints) arrive for free.\n\nA loop that walks an array in order hits the cache almost every time. A linked list scatters nodes across memory, so each step may wait for main memory, which can be around 100 times slower. Same Big-O, very different real speed.",
      },
      {
        heading: "Grids stored as one long row",
        body: "A 2D grid with R rows and C columns is usually stored row by row in one block. This is called row-major order. Cell (r, c) lives at index r x C + c.\n\nThis matters for speed: looping over rows on the outside and columns on the inside reads memory in order. Swapping the loops jumps C elements at a time and can be several times slower on large grids. In Python, a list of lists is not one block, but the habit still pays off with NumPy arrays and in languages like C and Java.",
        bullets: ["Row-major index: r x C + c", "Recover row and column: divmod(index, C)", "Loop rows outside, columns inside"],
        visual: {
          type: "compare",
          title: "Loop order over a row-major grid",
          columns: [
            { title: "Rows outside, columns inside", points: ["Reads cells in memory order", "Index r x C + c steps by 1", "Each cache line fully used"] },
            { title: "Columns outside, rows inside", points: ["Jumps C cells each step", "Often a new cache line per read", "Can be several times slower"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Inserting 9 at index 1 of [4, 7, 2, _]",
        steps: [
          { label: "Start", detail: "[4, 7, 2, _], size 3, capacity 4" },
          { label: "Move index 2 to 3", detail: "[4, 7, 2, 2]" },
          { label: "Move index 1 to 2", detail: "[4, 7, 7, 2]" },
          { label: "Write 9 at index 1", detail: "[4, 9, 7, 2], size 4" },
          { label: "Cost", detail: "2 moves = size - index" },
        ],
      },
      {
        type: "compare",
        title: "Array operations by position",
        columns: [
          { title: "At the end", points: ["Read: O(1)", "Insert (if room): O(1)", "Delete: O(1)"] },
          { title: "In the middle", points: ["Read: O(1)", "Insert: O(n) shifting", "Delete: O(n) shifting"] },
          { title: "At the front", points: ["Read: O(1)", "Insert: O(n), moves everything", "Delete: O(n), moves everything"] },
        ],
      },
    ],
    examples: [
      {
        title: "Delete by shifting left, traced",
        explanation: "Delete index 1 from [5, 8, 3, 6] with size 4. Move index 2 into 1: [5, 3, 3, 6]. Move index 3 into 2: [5, 3, 6, 6]. Lower size to 3. The last slot still holds a stale 6, but it is outside size, so it does not count. Two moves were needed: size - 1 - index.",
        code: {
          lang: "python",
          code: "def delete_at(arr, size, i):\n    for j in range(i, size - 1):   # shift left, front to back\n        arr[j] = arr[j + 1]\n    return size - 1\n\narr = [5, 8, 3, 6]\nsize = delete_at(arr, 4, 1)\nprint(arr[:size])  # [5, 3, 6]",
        },
      },
      {
        title: "Finding a cell in a flattened grid",
        explanation: "A 3 x 4 grid is stored as one list of 12 numbers. To read row 2, column 1, compute 2 x 4 + 1 = 9. To go back from index 9 to (row, column), use divmod(9, 4) = (2, 1). Many grid problems are easier when you flatten, for example to store visited cells in a single list.",
        code: {
          lang: "python",
          code: "R, C = 3, 4\nflat = list(range(R * C))     # 0..11, row by row\n\ndef get(r, c):\n    return flat[r * C + c]\n\nprint(get(2, 1))     # 9\nprint(divmod(9, C))  # (2, 1)",
        },
      },
    ],
    cheatSheet: [
      "address(i) = base + i x element_size, so indexing is O(1)",
      "Insert or delete at i shifts n - i items: O(n) worst case",
      "Insert: shift from the back; delete: shift from the front",
      "Unordered delete trick: copy the last item into the hole, O(1)",
      "Row-major grid: index = r x C + c; back with divmod(index, C)",
      "Sequential scans are cache friendly; random jumps are not",
    ],
    quiz: [
      {
        q: "An int array starts at address 2000 and each int takes 4 bytes. Where is element 10?",
        options: ["2010", "2040", "2014", "2400"],
        answer: 1,
        why: "2000 + 10 x 4 = 2040.",
      },
      {
        q: "What is the worst-case cost of inserting into an array of n items?",
        options: ["O(1)", "O(log n)", "O(n log n)", "O(n)"],
        answer: 3,
        why: "Inserting at the front shifts all n items one place.",
      },
      {
        q: "When inserting at index i, why shift from the back first?",
        options: ["So no value is overwritten before it is moved", "It is faster in Big-O", "Arrays can only be read backwards", "To keep the array sorted"],
        answer: 0,
        why: "Moving front to back would copy arr[i] over arr[i+1] before arr[i+1] was saved.",
      },
      {
        q: "In a row-major 5 x 6 grid, what is the flat index of row 3, column 2?",
        options: ["17", "32", "20", "15"],
        answer: 2,
        why: "3 x 6 + 2 = 20.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write move_zeros(xs) that moves every 0 to the end while keeping the order of the other numbers, in place. Example: [0, 1, 0, 3, 12] becomes [1, 3, 12, 0, 0].",
        hint: "Keep a write index; copy each non-zero forward, then fill the rest with zeros.",
        solution: "def move_zeros(xs):\n    w = 0\n    for x in xs:\n        if x != 0:\n            xs[w] = x\n            w += 1\n    for i in range(w, len(xs)):\n        xs[i] = 0\n    return xs\n\nprint(move_zeros([0, 1, 0, 3, 12]))  # [1, 3, 12, 0, 0]\n# Time O(n), space O(1)",
      },
      {
        level: "medium",
        task: "Write rotate_grid(g) that rotates a square n x n grid 90 degrees clockwise in place. Example: [[1, 2], [3, 4]] becomes [[3, 1], [4, 2]].",
        hint: "Transpose (swap g[i][j] with g[j][i]), then reverse each row.",
        solution: "def rotate_grid(g):\n    n = len(g)\n    for i in range(n):\n        for j in range(i + 1, n):\n            g[i][j], g[j][i] = g[j][i], g[i][j]\n    for row in g:\n        row.reverse()\n    return g\n\nprint(rotate_grid([[1, 2], [3, 4]]))  # [[3, 1], [4, 2]]\n# Time O(n^2), space O(1)",
      },
      {
        level: "hard",
        task: "Write spiral(g) that returns the values of an R x C grid in clockwise spiral order. Example: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] returns [1, 2, 3, 6, 9, 8, 7, 4, 5].",
        hint: "Repeatedly take the top row, then rotate what is left counter-clockwise: zip(*rows) reversed.",
        solution: "def spiral(g):\n    out = []\n    while g:\n        out += g[0]\n        g = [list(r) for r in zip(*g[1:])][::-1]\n    return out\n\nprint(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))  # [1, 2, 3, 6, 9, 8, 7, 4, 5]\n# Simple but O((R*C) * min(R, C)) time from rebuilding;\n# a four-boundary loop gives O(R*C) time, O(1) extra space.",
      },
    ],
    faq: [
      { q: "Why do arrays start at index 0?", a: "Because the index is an offset from the start. Element 0 is zero steps from the base address, so the formula base + i x size needs no extra subtraction." },
      { q: "Is a Python list a static array?", a: "No, it is a dynamic array. Underneath it uses a static block of pointers and swaps in a bigger block when it fills up." },
      { q: "When would I use a fixed-size array on purpose?", a: "When the size is known up front, like 26 letter counts or a grid, or in low-level code where predictable memory matters. Python's array module and NumPy give compact fixed-type arrays." },
    ],
  },
  "dsa-arrays-strings/dynamic-arrays": {
    plain: [
      "A dynamic array is an array that grows by itself. You keep appending, and it never says \"full\". Python's list, Java's ArrayList and C++'s vector are all dynamic arrays.",
      "Underneath, it is still a plain fixed-size array. The trick is that it keeps two numbers: size, how many items you stored, and capacity, how many slots it has. When size reaches capacity, it gets a bigger array, usually twice as big, copies everything across, and throws the old one away.",
      "It is like a family moving house. Most days, a new item just goes into a free cupboard. When the house is full, they move to a house twice the size, which is a big job. But because each move doubles the space, moves become rarer and rarer.",
      "So most appends are instant, and the occasional slow one is paid for by all the fast ones. On average, appending costs a constant amount of work. Reading and writing by index stay instant, just like a normal array.",
    ],
    deepDive: [
      {
        heading: "Size versus capacity",
        body: "Size is what the user sees: len(xs). Capacity is hidden: the number of slots really allocated. Slots between size and capacity hold junk and must never be read.\n\nThis is why get(i) must check i < size, not i < capacity. A bug here returns leftover data that looks real. Every method in a dynamic array keeps one rule true: items live at indexes 0 to size - 1, and size is at most capacity.",
        bullets: ["0 <= size <= capacity, always", "Bounds checks use size", "Slots from size to capacity - 1 are free space"],
      },
      {
        heading: "Why doubling gives amortised O(1)",
        body: "Count the copies. Starting at capacity 1, resizes copy 1, 2, 4, 8 and so on, up to the largest power of two below n. That adds to less than 2n. Add the n normal writes and the total is under 3n.\n\nAnother way to see it: after a resize to capacity 2k, the next k appends are cheap. Charge each of those appends 2 extra coins, and you have exactly 2k coins saved when the next resize copies 2k items. Every append pays a constant, so the cost is O(1) amortised.",
      },
      {
        heading: "Choosing the growth factor",
        body: "Any factor above 1 gives amortised O(1). Bigger factors mean fewer copies but more wasted space. Factor 2 can waste up to half the memory right after a resize. Factor 1.5 wastes less and lets old memory blocks be reused more easily.\n\nCPython grows lists by about 1.125 times plus a small constant. Java's ArrayList uses 1.5. Many C++ vectors use 2. The choice is an engineering trade-off, not a correctness rule.",
      },
      {
        heading: "Shrinking without thrashing",
        body: "If you pop many items, you may want to give memory back. The naive rule \"halve when half full\" has a trap. At exactly the boundary, one push grows the array and one pop shrinks it, so alternating push and pop costs O(n) every time.\n\nThe fix is a gap: grow when full, but only halve when size drops to a quarter of capacity. After a shrink, the array is half full, so it takes many operations to reach either boundary again. Python lists do shrink, using a similar safe margin.",
        visual: {
          type: "compare",
          title: "Two shrink rules",
          columns: [
            { title: "Halve at half full", points: ["One push at the boundary grows", "The next pop shrinks again", "Alternating push and pop: O(n) each"] },
            { title: "Halve at a quarter full", points: ["Gap between grow and shrink points", "After a shrink, array is half full", "Amortised O(1) is kept"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Growth strategies for 1,000 appends",
        columns: [
          { title: "Double (x2)", points: ["10 resizes", "1,023 items copied", "Up to 50% unused space"] },
          { title: "Grow by 1.5", points: ["About 16 resizes", "Roughly 2,000 items copied", "Up to 33% unused space"] },
          { title: "Add 10 slots", points: ["100 resizes", "About 50,000 items copied", "O(n) per append, avoid"] },
        ],
      },
    ],
    examples: [
      {
        title: "Watching CPython lists grow",
        explanation: "sys.getsizeof shows the bytes a list object uses, including spare capacity. If we append one item at a time and print only when the size jumps, we see resizes happening at lengths 1, 5, 9, 17, 25, 33 and so on. The jumps get further apart as the list grows, which is the geometric growth that makes append cheap on average. Exact numbers can differ by Python version.",
        code: {
          lang: "python",
          code: "import sys\n\nxs, last = [], sys.getsizeof([])\nfor i in range(40):\n    xs.append(i)\n    now = sys.getsizeof(xs)\n    if now != last:\n        print(f\"len {len(xs):2d}: {now} bytes\")\n        last = now",
        },
      },
      {
        title: "A tiny dynamic array with insert",
        explanation: "This class doubles when full and supports insert at any index. Insert [10, 20] then insert 15 at index 1: capacity grows 1 -> 2 -> 4, and 20 shifts right to make room. The result is [10, 15, 20] with capacity 4. Note how insert reuses the same grow step as append.",
        code: {
          lang: "python",
          code: "class DynArray:\n    def __init__(self):\n        self.size, self.cap, self.data = 0, 1, [None]\n    def _grow(self):\n        self.cap *= 2\n        self.data = self.data + [None] * (self.cap - len(self.data))\n    def insert(self, i, x):\n        if self.size == self.cap:\n            self._grow()\n        for j in range(self.size, i, -1):\n            self.data[j] = self.data[j - 1]\n        self.data[i] = x\n        self.size += 1\na = DynArray(); a.insert(0, 10); a.insert(1, 20); a.insert(1, 15)\nprint(a.data[:a.size], a.cap)  # [10, 15, 20] 4",
        },
      },
    ],
    cheatSheet: [
      "size = items stored; capacity = slots allocated",
      "Grow by a factor (1.5 or 2), never by a fixed amount",
      "append: O(1) amortised, O(n) on the resizing call",
      "get/set by index: O(1); insert/delete in middle: O(n)",
      "Shrink at 1/4 full, not 1/2, to avoid thrashing",
      "Pre-size when you know n: [0] * n avoids repeated growth",
    ],
    quiz: [
      {
        q: "A dynamic array has size 8 and capacity 8. What happens on the next append with doubling?",
        options: ["The append fails", "Capacity becomes 16 and 8 items are copied", "Capacity becomes 9", "Only the new item is copied"],
        answer: 1,
        why: "It is full, so it allocates 16 slots and copies the existing 8 before writing.",
      },
      {
        q: "Why should get(i) check i < size rather than i < capacity?",
        options: ["Capacity can be negative", "It is faster", "Slots past size hold leftover junk, not real items", "Python requires it"],
        answer: 2,
        why: "Only indexes 0 to size - 1 hold real data.",
      },
      {
        q: "What is the amortised cost of append if the array grows by 100 slots each time?",
        options: ["O(1)", "O(log n)", "O(n log n)", "O(n)"],
        answer: 3,
        why: "Resizes happen every 100 appends and each copies O(n) items, so the total is O(n^2).",
      },
      {
        q: "Why shrink at one quarter full instead of one half?",
        options: ["To prevent alternating push/pop from resizing every time", "To save more memory", "Because halving is not allowed", "To keep indexes valid"],
        answer: 0,
        why: "A gap between the grow and shrink thresholds stops thrashing at the boundary.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write resizes_needed(n) that returns how many times a doubling array starting at capacity 1 must resize to hold n items. Example: n = 9 needs 4 resizes (1 -> 2 -> 4 -> 8 -> 16).",
        hint: "Double a capacity variable until it is at least n, counting steps.",
        solution: "def resizes_needed(n):\n    cap, count = 1, 0\n    while cap < n:\n        cap *= 2\n        count += 1\n    return count\n\nprint(resizes_needed(9))  # 4\n# Time O(log n), space O(1)",
      },
      {
        level: "medium",
        task: "Write a Stack class on top of a fixed-size Python list that doubles when full and halves when only a quarter full (minimum capacity 1). Support push, pop and len. Example: push 1..5 gives capacity 8; pop 4 times gives capacity 2.",
        hint: "Resize by building a new list of the new capacity and copying the first size items.",
        solution: "class Stack:\n    def __init__(self): self.data, self.n = [None], 0\n    def _resize(self, cap):\n        self.data = self.data[:self.n] + [None] * (cap - self.n)\n    def push(self, x):\n        if self.n == len(self.data): self._resize(2 * len(self.data))\n        self.data[self.n] = x; self.n += 1\n    def pop(self):\n        self.n -= 1; x = self.data[self.n]\n        if 0 < self.n <= len(self.data) // 4: self._resize(len(self.data) // 2)\n        return x\n# push/pop O(1) amortised; space O(n)",
      },
      {
        level: "hard",
        task: "Write merge_sorted_in_place(a, m, b) where list a has m real items followed by len(b) spare slots, and both parts are sorted. Fill a with all items sorted, without extra lists. Example: a = [1, 4, 7, 0, 0], m = 3, b = [2, 5] gives [1, 2, 4, 5, 7].",
        hint: "Fill from the back: compare the largest remaining items of each part.",
        solution: "def merge_sorted_in_place(a, m, b):\n    i, j, k = m - 1, len(b) - 1, m + len(b) - 1\n    while j >= 0:\n        if i >= 0 and a[i] > b[j]:\n            a[k] = a[i]; i -= 1\n        else:\n            a[k] = b[j]; j -= 1\n        k -= 1\n    return a\n\nprint(merge_sorted_in_place([1, 4, 7, 0, 0], 3, [2, 5]))  # [1, 2, 4, 5, 7]\n# Time O(m + n), space O(1)",
      },
    ],
    faq: [
      { q: "If append is O(1), why is my loop of appends sometimes slow?", a: "The rare resize copies everything, which can cause a small pause. Over the whole loop it averages out, but if you know the final size, building [None] * n first avoids resizes entirely." },
      { q: "Does Python ever shrink a list?", a: "Yes. When a list loses many items, CPython may reallocate it smaller, using a margin so it does not grow and shrink back and forth." },
      { q: "Is a dynamic array better than a linked list?", a: "For most tasks, yes: indexing is O(1) and memory is cache friendly. Linked lists win only when you insert or delete in the middle often and already hold a pointer to the spot." },
    ],
  },
  "dsa-arrays-strings/strings": {
    plain: [
      "A string is a sequence of characters, like letters on a necklace. You can read any bead by its position, ask how many beads there are, and slice off a section. In Python, strings cannot be changed once made. They are immutable.",
      "Immutable means every \"change\" builds a brand-new string. s = s + \"x\" does not add to s; it makes a new string and copies all of s into it. Do that in a loop thousands of times and you copy the same letters over and over.",
      "The fix is simple: collect pieces in a list and join them once at the end. A list can grow cheaply, and join copies each character exactly one time.",
      "Most string puzzles use the same few moves. Count how often each letter appears. Compare characters from both ends. Or walk through once, keeping track of where you are. Once you see these moves, anagram, palindrome and parsing problems stop being scary.",
    ],
    deepDive: [
      {
        heading: "Characters are numbers underneath",
        body: "Every character has a code point, a number from the Unicode table. ord(\"a\") is 97 and chr(97) is \"a\". Lowercase letters are consecutive, so ord(ch) - ord(\"a\") maps \"a\" to 0 and \"z\" to 25.\n\nThat turns letter counting into array indexing: a list of 26 zeros works like a tiny hash map with no hashing. It is fast and its size never grows, which is why many solutions call it O(1) space. When the input may contain any Unicode text, use a dict or Counter instead.",
        bullets: ["ord(\"A\") = 65, ord(\"a\") = 97, ord(\"0\") = 48", "ch.isalnum(), ch.isdigit(), ch.lower() help with cleanup", "26 counts = constant space"],
      },
      {
        heading: "Hidden costs of string operations",
        body: "len(s) and s[i] are O(1). But many friendly-looking operations copy or scan. s[i:j] creates a new string of length j - i. s.replace, s.split, s.lower and s.strip scan the whole string. sub in s searches, which can cost up to O(n x m) in theory, though CPython is fast in practice.\n\nThe worst habit is slicing inside a loop: for i in range(n): check(s[i:]) quietly copies about n^2 / 2 characters. Pass indexes instead of slices.",
      },
      {
        heading: "Two pointers for palindromes",
        body: "A palindrome reads the same both ways, like \"level\". Put one pointer at the start and one at the end. If the characters match, move both inward. If they differ, it is not a palindrome. Stop when the pointers meet.\n\nThis uses O(1) extra space, while s == s[::-1] builds a reversed copy, O(n) space. For \"A man, a plan, a canal: Panama\", skip characters that are not letters or digits and compare in lowercase.",
      },
      {
        heading: "Parsing: scan once and keep state",
        body: "Parsing means turning raw text into pieces, like numbers and words. Instead of many split calls, walk the string one character at a time and keep a little state: the number you are building, or whether you are inside a word.\n\nTo read \"12+345\", keep num = 0. For each digit, do num = num x 10 + digit. When you hit a non-digit, the number is finished. This single pass is O(n) and handles multi-digit numbers naturally, which is the core of every calculator and tokenizer.",
        bullets: ["Build numbers with num = num * 10 + int(ch)", "Flush the last token after the loop ends", "Use str.isdigit() to classify characters"],
        visual: {
          type: "flow",
          title: "Scanning \"12+345\" once",
          steps: [
            { label: "Read 1", detail: "num = 0 x 10 + 1 = 1" },
            { label: "Read 2", detail: "num = 1 x 10 + 2 = 12" },
            { label: "Read +", detail: "Flush 12, record +, reset num" },
            { label: "Read 3, 4, 5", detail: "num = 3, then 34, then 345" },
            { label: "End of string", detail: "Flush the last token: 345" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Two-pointer palindrome check on \"racecar\"",
        steps: [
          { label: "i=0, j=6", detail: "r == r, move in" },
          { label: "i=1, j=5", detail: "a == a, move in" },
          { label: "i=2, j=4", detail: "c == c, move in" },
          { label: "i=3, j=3", detail: "Pointers meet, stop" },
          { label: "Result", detail: "Palindrome, 3 comparisons, O(1) space" },
        ],
      },
      {
        type: "compare",
        title: "Anagram check: three ways",
        columns: [
          { title: "Sort both", points: ["sorted(a) == sorted(b)", "O(n log n) time", "O(n) space", "Shortest code"] },
          { title: "Counter", points: ["Counter(a) == Counter(b)", "O(n) time", "Works for any characters", "Clear and safe"] },
          { title: "26-count array", points: ["counts[ord(c) - 97]", "O(n) time", "O(1) space", "Lowercase a-z only"] },
        ],
      },
    ],
    examples: [
      {
        title: "Grouping anagrams with a signature",
        explanation: "Given [\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"], group words that are anagrams. Give each word a signature: its letters sorted. \"eat\", \"tea\" and \"ate\" all become \"aet\". \"tan\" and \"nat\" become \"ant\". \"bat\" becomes \"abt\". Use the signature as a dict key and append the word. Each word costs O(k log k) for its length k.",
        code: {
          lang: "python",
          code: "from collections import defaultdict\n\ndef group_anagrams(words):\n    groups = defaultdict(list)\n    for w in words:\n        groups[\"\".join(sorted(w))].append(w)\n    return list(groups.values())\n\nprint(group_anagrams([\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]))\n# [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
        },
      },
      {
        title: "Compressing a string, the join way",
        explanation: "Turn \"aaabccdddd\" into \"a3b1c2d4\". Walk the string and count runs of the same character. When the character changes, push the letter and its count into a list. Trace: a run of 3 a's, then 1 b, 2 c's, 4 d's. Joining once at the end keeps the whole thing O(n).",
        code: {
          lang: "python",
          code: "def compress(s):\n    parts, i = [], 0\n    while i < len(s):\n        j = i\n        while j < len(s) and s[j] == s[i]:\n            j += 1\n        parts.append(s[i] + str(j - i))\n        i = j\n    return \"\".join(parts)\n\nprint(compress(\"aaabccdddd\"))  # a3b1c2d4",
        },
      },
    ],
    cheatSheet: [
      "Strings are immutable: every change makes a new string",
      "Build with a list and \"\".join(parts), not s += piece in a loop",
      "ord(ch) - ord(\"a\") maps a..z to 0..25",
      "s[i:j] copies j - i characters; pass indexes instead",
      "Palindrome: two pointers from both ends, O(1) space",
      "Anagram: Counter(a) == Counter(b), O(n)",
      "Parse numbers with num = num * 10 + int(ch)",
    ],
    quiz: [
      {
        q: "Why is s += c inside a loop of n steps potentially O(n^2)?",
        options: ["Strings are stored in a hash table", "Each += may copy the whole string built so far", "Python strings are linked lists", "The loop runs n^2 times"],
        answer: 1,
        why: "Immutability means each concatenation can create a new string and copy all previous characters.",
      },
      {
        q: "What is the extra space of a two-pointer palindrome check?",
        options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
        answer: 3,
        why: "Only two indexes are stored, regardless of string length.",
      },
      {
        q: "What does ord(\"d\") - ord(\"a\") return?",
        options: ["3", "4", "100", "d"],
        answer: 0,
        why: "Letters are consecutive code points, and d is three after a.",
      },
      {
        q: "Checking anagrams by sorting both strings of length n costs:",
        options: ["O(n)", "O(1)", "O(n log n)", "O(n^2)"],
        answer: 2,
        why: "Sorting each string is O(n log n), which dominates the final comparison.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write is_clean_palindrome(s) that ignores case and any character that is not a letter or digit. Example: \"A man, a plan, a canal: Panama\" returns True, \"race a car\" returns False.",
        hint: "Two pointers; skip non-alphanumeric characters with isalnum().",
        solution: "def is_clean_palindrome(s):\n    i, j = 0, len(s) - 1\n    while i < j:\n        if not s[i].isalnum(): i += 1\n        elif not s[j].isalnum(): j -= 1\n        elif s[i].lower() != s[j].lower(): return False\n        else: i, j = i + 1, j - 1\n    return True\n\nprint(is_clean_palindrome(\"A man, a plan, a canal: Panama\"))  # True\nprint(is_clean_palindrome(\"race a car\"))  # False\n# Time O(n), space O(1)",
      },
      {
        level: "medium",
        task: "Write reverse_words(s) that reverses the order of words, removing extra spaces. Example: \"  the sky  is blue \" returns \"blue is sky the\".",
        hint: "split() with no argument already drops repeated spaces.",
        solution: "def reverse_words(s):\n    return \" \".join(reversed(s.split()))\n\nprint(reverse_words(\"  the sky  is blue \"))  # blue is sky the\n# Time O(n), space O(n)",
      },
      {
        level: "hard",
        task: "Write evaluate(s) for a string with non-negative integers, +, - and spaces (no brackets). Example: \"12 + 30 - 5\" returns 37 and \"100-1-1\" returns 98. Do it in one pass without eval.",
        hint: "Keep total, the current number and the last sign. When you see an operator, add sign * num to total.",
        solution: "def evaluate(s):\n    total, num, sign = 0, 0, 1\n    for ch in s + \"+\":\n        if ch.isdigit():\n            num = num * 10 + int(ch)\n        elif ch in \"+-\":\n            total += sign * num\n            num, sign = 0, (1 if ch == \"+\" else -1)\n    return total\nprint(evaluate(\"12 + 30 - 5\"))  # 37\nprint(evaluate(\"100-1-1\"))  # 98\n# Time O(n), space O(1)",
      },
    ],
    faq: [
      { q: "Is s += \"x\" in a loop always slow in Python?", a: "CPython sometimes optimises it in place when nothing else references the string, so it can look fast. That trick is not guaranteed, so join is the safe habit." },
      { q: "How do I change one character in a Python string?", a: "You cannot change it in place. Build a new one, like s[:i] + \"x\" + s[i+1:], or convert to a list, edit it, and join it back when doing many edits." },
      { q: "Should I use a 26-length array or a Counter for letter counts?", a: "Use the array when the input is guaranteed lowercase a-z and speed matters. Use Counter when characters can be anything; it is clearer and still O(n)." },
    ],
  },
  "dsa-arrays-strings/prefix-sums": {
    plain: [
      "Imagine a shop that writes down its total sales so far at the end of each day. To find sales from Tuesday to Friday, you do not add four days. You take Friday's running total and subtract Monday's. That running total is a prefix sum.",
      "In code, you make a new list where each spot holds the sum of everything before it. Building it takes one pass. After that, the sum of any section is just one subtraction, no matter how long the section is.",
      "This matters when you have many questions about the same data. Adding up a range each time costs O(n) per question. With prefix sums, you pay O(n) once and then every question is O(1).",
      "A related family of tricks rearranges an array without making a copy, called in-place. You can reverse, rotate, or split an array into two groups by swapping items, using only a couple of index variables.",
    ],
    deepDive: [
      {
        heading: "Why the leading zero helps",
        body: "Define p[0] = 0 and p[k] = a[0] + ... + a[k-1]. So p has one more slot than a. Then the sum of a[i] through a[j] is p[j+1] - p[i].\n\nWithout the leading zero, a range that starts at index 0 needs a special case. With it, every query uses the same formula. Think of p[k] as \"the total before index k\", and the off-by-one errors disappear.",
        bullets: ["p has length n + 1", "sum(a[i..j]) = p[j+1] - p[i]", "Build: p[k+1] = p[k] + a[k]"],
      },
      {
        heading: "Prefix sums plus a hash map",
        body: "To count subarrays that sum to k, notice that the sum of a[i..j] equals k exactly when p[j+1] - p[i] = k, which means p[i] = p[j+1] - k.\n\nSo walk the array once, keeping the running total, and a dict counting how often each earlier prefix total appeared. At each step, add the count of (total - k) to the answer. This handles negative numbers too, which sliding windows cannot. The same idea finds the longest subarray with sum k by storing the first index of each total.",
      },
      {
        heading: "2D prefix sums for rectangles",
        body: "For a grid, let P[r][c] be the sum of everything above and to the left of (r, c), with an extra zero row and column. Build it with P[r+1][c+1] = g[r][c] + P[r][c+1] + P[r+1][c] - P[r][c]. The subtraction removes the corner area counted twice.\n\nThen any rectangle from (r1, c1) to (r2, c2) is P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]. Four lookups, O(1), no matter how large the rectangle.",
      },
      {
        heading: "In-place moves: reverse, rotate, partition",
        body: "Reverse: swap the ends and walk inward. Rotate right by k: reverse the whole array, then reverse the first k items, then reverse the rest. For [1,2,3,4,5] and k = 2: [5,4,3,2,1], then [4,5,3,2,1], then [4,5,1,2,3].\n\nPartition: to put all items matching a rule first, keep a write index w. For each item that matches, swap it into position w and increase w. One pass, O(1) space, and it is the heart of quicksort.",
        bullets: ["Rotate by k: reverse all, reverse [0, k), reverse [k, n)", "Always do k %= n first", "Partition with a write pointer"],
        visual: {
          type: "flow",
          title: "Rotate [1,2,3,4,5] right by 2",
          steps: [
            { label: "Start", detail: "[1, 2, 3, 4, 5], k = 2" },
            { label: "Reverse all", detail: "[5, 4, 3, 2, 1]" },
            { label: "Reverse first k", detail: "[4, 5, 3, 2, 1]" },
            { label: "Reverse the rest", detail: "[4, 5, 1, 2, 3]" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Counting subarrays with sum 3 in [1, 2, 1, 2]",
        steps: [
          { label: "Start", detail: "total=0, seen {0:1}, count=0" },
          { label: "Add 1", detail: "total=1, need -2: none; seen {0:1, 1:1}" },
          { label: "Add 2", detail: "total=3, need 0: +1; count=1" },
          { label: "Add 1", detail: "total=4, need 1: +1; count=2" },
          { label: "Add 2", detail: "total=6, need 3: +1; count=3" },
          { label: "Answer", detail: "[1,2], [2,1], [1,2] = 3 subarrays" },
        ],
      },
    ],
    examples: [
      {
        title: "Range queries traced",
        explanation: "a = [2, 4, 1, 3, 5]. Build p = [0, 2, 6, 7, 10, 15]. Query sum of indexes 1 to 3 (4 + 1 + 3 = 8): p[4] - p[1] = 10 - 2 = 8. Query 0 to 4: p[5] - p[0] = 15. Query 2 to 2: p[3] - p[2] = 1. Three queries, each one subtraction.",
        code: {
          lang: "python",
          code: "a = [2, 4, 1, 3, 5]\np = [0]\nfor x in a:\n    p.append(p[-1] + x)\nprint(p)  # [0, 2, 6, 7, 10, 15]\n\nfor i, j in [(1, 3), (0, 4), (2, 2)]:\n    print(i, j, p[j + 1] - p[i])\n# 1 3 8 / 0 4 15 / 2 2 1",
        },
      },
      {
        title: "Rectangle sums in a grid",
        explanation: "Grid [[1, 2, 3], [4, 5, 6], [7, 8, 9]]. We want the sum of the bottom-right 2 x 2 block: 5 + 6 + 8 + 9 = 28. Build P with an extra zero row and column. The formula takes the big rectangle up to (2, 2), removes the strip above and the strip to the left, and adds back the corner removed twice: 45 - 6 - 12 + 1 = 28.",
        code: {
          lang: "python",
          code: "g = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\nR, C = len(g), len(g[0])\nP = [[0] * (C + 1) for _ in range(R + 1)]\nfor r in range(R):\n    for c in range(C):\n        P[r+1][c+1] = g[r][c] + P[r][c+1] + P[r+1][c] - P[r][c]\n\ndef rect(r1, c1, r2, c2):\n    return P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]\n\nprint(rect(1, 1, 2, 2))  # 28",
        },
      },
    ],
    cheatSheet: [
      "p[0] = 0, p[k+1] = p[k] + a[k]",
      "sum(a[i..j]) = p[j+1] - p[i]",
      "Subarrays with sum k: count earlier prefix totals equal to total - k",
      "2D rectangle: big - top - left + corner",
      "Rotate right by k: reverse all, reverse first k, reverse rest",
      "Frequent updates? Use a Fenwick tree, not prefix sums",
      "itertools.accumulate(a) builds running totals",
    ],
    quiz: [
      {
        q: "With p = [0, 3, 4, 8, 9], what is the sum of a[1..3]?",
        options: ["9", "6", "8", "5"],
        answer: 1,
        why: "p[4] - p[1] = 9 - 3 = 6.",
      },
      {
        q: "After O(n) preprocessing, what does each range-sum query cost?",
        options: ["O(n)", "O(log n)", "O(1)", "O(sqrt n)"],
        answer: 2,
        why: "Each query is a single subtraction of two stored values.",
      },
      {
        q: "Why use prefix sums with a hash map instead of a sliding window for \"count subarrays with sum k\"?",
        options: ["It handles negative numbers", "It uses less memory", "It is O(1) total", "Sliding windows cannot be written in Python"],
        answer: 0,
        why: "With negatives, growing a window does not always increase its sum, so window logic fails.",
      },
      {
        q: "The array changes after every query. Why are plain prefix sums a poor fit?",
        options: ["They cannot store negative numbers", "Queries become O(n^2)", "They need sorted input", "Each update forces an O(n) rebuild"],
        answer: 3,
        why: "Changing one value shifts every later prefix total.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write pivot_index(a) that returns the first index where the sum of items to the left equals the sum to the right, or -1. Example: [1, 7, 3, 6, 5, 6] returns 3 (1+7+3 = 5+6).",
        hint: "Track the left sum while walking; the right sum is total - left - a[i].",
        solution: "def pivot_index(a):\n    total, left = sum(a), 0\n    for i, x in enumerate(a):\n        if left == total - left - x:\n            return i\n        left += x\n    return -1\n\nprint(pivot_index([1, 7, 3, 6, 5, 6]))  # 3\n# Time O(n), space O(1)",
      },
      {
        level: "medium",
        task: "Write count_subarrays(a, k) returning how many contiguous subarrays sum to exactly k. Numbers can be negative. Example: [1, 1, 1], k = 2 returns 2; [3, 4, -7, 3], k = 3 returns 3.",
        hint: "Running total plus a Counter of earlier totals, starting with {0: 1}.",
        solution: "from collections import Counter\ndef count_subarrays(a, k):\n    seen, total, count = Counter({0: 1}), 0, 0\n    for x in a:\n        total += x\n        count += seen[total - k]\n        seen[total] += 1\n    return count\n\nprint(count_subarrays([1, 1, 1], 2))  # 2\nprint(count_subarrays([3, 4, -7, 3], 3))  # 3\n# Time O(n), space O(n)",
      },
      {
        level: "hard",
        task: "Write product_except_self(a) that returns a list where out[i] is the product of every item except a[i], without division, in O(n). Example: [1, 2, 3, 4] returns [24, 12, 8, 6].",
        hint: "A prefix product from the left and a suffix product from the right, multiplied together.",
        solution: "def product_except_self(a):\n    n = len(a)\n    out = [1] * n\n    for i in range(1, n):\n        out[i] = out[i - 1] * a[i - 1]\n    right = 1\n    for i in range(n - 1, -1, -1):\n        out[i] *= right\n        right *= a[i]\n    return out\nprint(product_except_self([1, 2, 3, 4]))  # [24, 12, 8, 6]\n# Time O(n), space O(1) besides the output",
      },
    ],
    faq: [
      { q: "Do prefix sums work for products or maximums?", a: "Products work if there are no zeros (or you handle them), using division instead of subtraction. Maximums do not, because you cannot \"subtract\" a max; use a sparse table or segment tree." },
      { q: "Should the prefix array have n or n + 1 items?", a: "Use n + 1 with a leading zero. Every range sum then uses one formula with no special cases." },
      { q: "What is the difference between prefix sums and a sliding window?", a: "Prefix sums answer any range after preprocessing and handle negatives. A sliding window walks one range along the array and needs a rule like all numbers being positive." },
    ],
  },
};

export default extra;
