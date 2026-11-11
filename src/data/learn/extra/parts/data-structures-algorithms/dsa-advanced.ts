import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-advanced/two-pointers": {
    plain: [
      "Many array problems are about pairs: two numbers that add up to a target, or two walls that hold the most water. The slow way checks every pair, which is about n times n steps. With two pointers you keep two positions (indexes) in the array and move them in a smart way, so you look at each element only a few times.",
      "The most common shape puts one pointer at the start and one at the end, and moves them toward each other. This works when the array is sorted, because the order tells you which way to move. If the sum is too small, move the left pointer right to get a bigger number. If it is too big, move the right pointer left.",
      "The second shape moves both pointers in the same direction. A read pointer looks at every element, and a write pointer marks where the next element you keep should go. This lets you remove duplicates or filter an array in place, without making a second array.",
      "A third shape is fast and slow: one pointer moves two steps at a time, the other moves one. In a linked list with a loop, the fast pointer will catch the slow one. If there is no loop, the fast pointer simply reaches the end first.",
    ],
    deepDive: [
      {
        heading: "Why skipping pairs is safe",
        body: "Converging pointers look at only n - 1 pairs out of about n^2 / 2, so you need a reason why the skipped pairs cannot be the answer. The reason is elimination. Suppose the array is sorted and a[left] + a[right] is less than the target. Every other partner for a[left] that is still in play sits at an index below right, so it is no larger than a[right]. All those sums are also too small, so a[left] can never be in a solution. You drop it for good with left += 1.\n\nThe same argument works the other way when the sum is too big: a[right] is dropped. Each step removes one element forever, so the loop runs at most n - 1 times. Saying this out loud in an interview is what turns a guess into a proof.",
        bullets: ["Each step discards one element permanently", "At most n - 1 steps, so O(n) time", "The proof needs sorted order (or another monotonic rule)"],
      },
      {
        heading: "Three-sum without repeated triplets",
        body: "Three-sum asks for all unique triplets that add up to 0. Sort first, in O(n log n). Then fix the first element a[i] and run converging pointers on the part to its right, looking for a pair that sums to -a[i]. Each fixed i costs O(n), so the total is O(n^2). That is the expected answer; no known approach is much faster in general.\n\nDuplicates are where most bugs live. Skip i when a[i] equals a[i - 1], because that first value was already tried. After you record a triplet, move both pointers inward, then keep moving left while it equals the value you just used. You can also stop early: once a[i] is greater than 0, every later sum is positive.\n\nThe same idea extends to four-sum with two fixed loops and O(n^3) time. In general k-sum this way costs O(n^(k-1)).",
        visual: {
          type: "flow",
          title: "Three-sum on sorted input",
          steps: [
            { label: "Sort", detail: "O(n log n), once." },
            { label: "Fix a[i]", detail: "Skip it if it equals a[i - 1]." },
            { label: "Two pointers", detail: "Find pairs summing to -a[i] in a[i+1..]." },
            { label: "Record hit", detail: "Move both pointers, skip equal values." },
            { label: "Next i", detail: "Stop early once a[i] is above 0." },
          ],
        },
      },
      {
        heading: "Container with most water: move the shorter wall",
        body: "You get heights h[0..n-1] and want two lines that, with the x-axis, hold the most water. The area of a pair is min(h[left], h[right]) * (right - left). Start with the widest pair and move inward.\n\nWhy move the shorter wall? Say h[left] is the shorter one. Any pair that keeps left and moves right inward has a smaller width, and its height is still capped by h[left]. So none of those pairs can beat the area you just measured, and left can be discarded. Moving the taller wall would throw away nothing useful and might skip the best pair. When both walls are equal you may move either one.\n\nThe result is O(n) time and O(1) space, against O(n^2) for trying every pair.",
      },
      {
        heading: "Same-direction pointers: filter and partition in place",
        body: "The read and write pattern keeps a[0..w-1] as the finished part. For every r from left to right, if a[r] should be kept, copy it to a[w] and add 1 to w. At the end, w is the new length. This removes duplicates from a sorted array (keep a[r] if it differs from a[w - 1]) and moves zeros to the end (keep non-zeros, then fill the rest with 0).\n\nA neat variation allows at most two copies of each value: keep a[r] when w is less than 2 or a[r] differs from a[w - 2].\n\nThree pointers solve the Dutch national flag problem, sorting an array of 0s, 1s and 2s in one pass. low marks the end of the 0s, high the start of the 2s, and mid scans. A 0 swaps to low, a 2 swaps to high, and a 1 just moves on. It costs O(n) time and O(1) space.",
        bullets: ["Keep invariant: a[0..w-1] is the answer so far", "Do not advance mid after swapping with high", "In-place matters when the task says O(1) extra space"],
      },
      {
        heading: "Fast and slow pointers",
        body: "Floyd's cycle detection moves slow one node and fast two nodes per step on a linked list. If there is no cycle, fast reaches None. If there is one, both pointers end up inside it, and the gap between them shrinks by one each step, so they must meet. This uses O(n) time and O(1) space, where a visited set would need O(n) memory.\n\nTo find where the cycle starts, put one pointer back at the head after they meet, then move both one step at a time. They meet again exactly at the cycle's first node.\n\nThe same trick finds the middle of a list: when fast reaches the end, slow is in the middle. It even works on arrays where each value points to another index, as in finding the duplicate number in an array of n + 1 values from 1 to n.",
        visual: {
          type: "cycle",
          title: "One step of Floyd's loop",
          steps: [
            { label: "slow = slow.next", detail: "One step." },
            { label: "fast = fast.next.next", detail: "Two steps." },
            { label: "fast is None?", detail: "Yes: no cycle, stop." },
            { label: "slow is fast?", detail: "Yes: cycle found, stop." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "The three shapes of two pointers",
        root: "Two pointers",
        children: [
          { label: "Converging", children: ["Pair sum on sorted array", "Three-sum", "Container with most water", "Valid palindrome"] },
          { label: "Same direction", children: ["Remove duplicates", "Move zeros", "Merge two sorted arrays"] },
          { label: "Fast and slow", children: ["Linked list cycle", "Middle of a list", "Find the duplicate number"] },
        ],
      },
      {
        type: "compare",
        title: "Two ways to find a pair with a given sum",
        columns: [
          { title: "Hash set", points: ["O(n) time", "O(n) extra memory", "Works on unsorted input", "Keeps original indexes"] },
          { title: "Sort plus two pointers", points: ["O(n log n) with the sort", "O(1) extra if sorting in place", "O(n) if already sorted", "Original indexes are lost after sorting"] },
        ],
      },
    ],
    examples: [
      {
        title: "Three-sum on [-1, 0, 1, 2, -1, -4]",
        explanation: "Step 1: sort to [-4, -1, -1, 0, 1, 2]. Step 2: i = 0 fixes -4, so we need a pair summing to 4, but the largest pair is 1 + 2 = 3, so nothing is found. Step 3: i = 1 fixes -1. left points at -1 and right at 2: the sum is 0, so record [-1, -1, 2]. Move both: left at 0, right at 1, sum 0, record [-1, 0, 1]. Step 4: i = 2 is another -1, so skip it. Step 5: i = 3 fixes 0; 1 + 2 is too big and the pointers cross. Result: two triplets.",
        code: {
          lang: "python",
          code: `def three_sum(a):                 # O(n^2) time
    a.sort(); out = []
    for i in range(len(a) - 2):
        if i > 0 and a[i] == a[i - 1]: continue
        l, r = i + 1, len(a) - 1
        while l < r:
            s = a[i] + a[l] + a[r]
            if s < 0: l += 1
            elif s > 0: r -= 1
            else:
                out.append([a[i], a[l], a[r]])
                l += 1; r -= 1
                while l < r and a[l] == a[l - 1]: l += 1
    return out`,
        },
      },
      {
        title: "Container with most water on [1, 8, 6, 2, 5, 4, 8, 3, 7]",
        explanation: "Step 1: left = 0 (height 1), right = 8 (height 7). Area = min(1, 7) * 8 = 8. The left wall is shorter, so move it. Step 2: left = 1 (height 8), right = 8 (height 7). Area = 7 * 7 = 49. Now the right wall is shorter, so move right. Step 3: right = 7 (height 3) gives 3 * 6 = 18, still worse. The loop continues until the pointers meet, and no later pair beats 49. Nine heights, eight area checks, instead of 36 pairs.",
        code: {
          lang: "python",
          code: `def max_area(h):                  # O(n) time, O(1) space
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        best = max(best, min(h[l], h[r]) * (r - l))
        if h[l] < h[r]: l += 1
        else: r -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))   # 49`,
        },
      },
    ],
    cheatSheet: [
      "Converging pointers need sorted input (or another monotonic rule) to know which side to move",
      "Pair sum: sorted plus two pointers is O(n) time, O(1) space; a hash set is O(n) time and O(n) space",
      "Three-sum: sort, fix i, two pointers on the rest; O(n^2); skip equal a[i] and equal a[l] after a hit",
      "Container with most water: area = min(h[l], h[r]) * (r - l); always move the shorter wall",
      "Read/write pointers: if a[r] is kept, write it to a[w] and do w += 1; w is the new length",
      "At most two copies in a sorted array: keep a[r] when w < 2 or a[r] != a[w - 2]",
      "Floyd: slow moves 1, fast moves 2; they meet only if there is a cycle; O(n) time, O(1) space",
      "Dutch national flag (0s, 1s, 2s): low, mid and high pointers, one pass, O(1) extra space",
    ],
    quiz: [
      {
        q: "In two-sum on a sorted array, a[left] + a[right] is smaller than the target. What do you do?",
        options: ["Move right one step left", "Move left one step right", "Move both pointers inward", "Restart with left = 0"],
        answer: 1,
        why: "a[left] is too small to pair with anything still in range, so it is discarded.",
      },
      {
        q: "What is the time complexity of three-sum with sorting and two pointers?",
        options: ["O(n log n)", "O(n^3)", "O(n^2)", "O(n)"],
        answer: 2,
        why: "There are n choices for the fixed element and each runs an O(n) two-pointer scan.",
      },
      {
        q: "In container with most water, why is it safe to move the shorter wall?",
        options: ["Every remaining pair that keeps it is narrower and no taller, so none can beat the current area", "The taller wall is always part of the answer", "Moving the taller wall would make the loop O(n^2)", "Water can only be held by equal walls"],
        answer: 0,
        why: "The shorter wall caps the height, and width only shrinks, so it is eliminated.",
      },
      {
        q: "How much extra memory does Floyd's cycle detection use?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        answer: 3,
        why: "It keeps only two pointers, unlike a visited set which grows with the list.",
      },
      {
        q: "Which task is a poor fit for converging pointers on the raw input?",
        options: ["Checking if a string is a palindrome", "Two-sum on an unsorted array where you must return the original indexes", "Pair sum on a sorted array", "Reversing an array in place"],
        answer: 1,
        why: "Without sorted order you cannot tell which pointer to move, and sorting would lose the original indexes; use a hash map.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Move all zeros in a list to the end, in place, keeping the order of the other numbers. Example: [0, 1, 0, 3, 12] becomes [1, 3, 12, 0, 0].",
        hint: "Use a write pointer for the next non-zero, then fill the tail with zeros.",
        solution: `def move_zeros(a):
    w = 0
    for r in range(len(a)):
        if a[r] != 0:
            a[w] = a[r]; w += 1
    for i in range(w, len(a)):
        a[i] = 0`,
      },
      {
        level: "medium",
        task: "Given a sorted list, remove duplicates in place so each value appears at most twice. Return the new length. Example: [1, 1, 1, 2, 2, 3] gives 5 and starts with [1, 1, 2, 2, 3].",
        hint: "Compare the incoming value with the one two places behind the write pointer.",
        solution: `def remove_dups_2(a):
    w = 0
    for x in a:
        if w < 2 or x != a[w - 2]:
            a[w] = x; w += 1
    return w`,
      },
      {
        level: "hard",
        task: "Trapping rain water: given bar heights, return how much water is trapped after rain, in O(n) time and O(1) space. [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] gives 6.",
        hint: "Water above a bar is limited by the smaller of the tallest bars on each side. Move the side with the lower bar.",
        solution: `def trap(h):
    l, r = 0, len(h) - 1
    lmax = rmax = water = 0
    while l < r:
        if h[l] < h[r]:
            lmax = max(lmax, h[l]); water += lmax - h[l]; l += 1
        else:
            rmax = max(rmax, h[r]); water += rmax - h[r]; r -= 1
    return water`,
      },
    ],
    faq: [
      { q: "Does the array have to be sorted for two pointers?", a: "Only for the converging pattern that compares sums. Same-direction pointers (filtering, removing duplicates) and fast and slow pointers work on unsorted data." },
      { q: "When should I use a hash map instead of two pointers?", a: "Use a hash map when the input is unsorted and you need original indexes, as in the classic two-sum. Use two pointers when the data is sorted or you need O(1) extra space." },
      { q: "What is the difference between two pointers and sliding window?", a: "A sliding window is a same-direction two-pointer pattern where everything between the pointers matters, such as a sum or a character count. In plain two pointers, usually only the two pointed-at elements matter." },
    ],
  },

  "dsa-advanced/sliding-window": {
    plain: [
      "A window is a part of an array or string where the items sit next to each other, from a left index to a right index. Questions like \"the biggest total of 3 days in a row\" or \"the longest piece of text with no repeated letter\" are window questions.",
      "The slow way tries every start and every end and adds everything up again each time. A sliding window is smarter: when it moves one step, it adds the new item on the right and removes the old item on the left. Think of a train window: as the train moves, one tree comes into view and one leaves.",
      "There are two kinds. A fixed window always has the same size k, like a 7-day moving average. A variable window grows on the right while things are fine and shrinks from the left when a rule is broken, like \"no repeated letters\".",
      "It is fast because each item enters the window once and leaves at most once. Even with a loop inside a loop, the total work is about 2n steps, which is O(n).",
    ],
    deepDive: [
      {
        heading: "When a variable window is allowed",
        body: "A variable window only works when validity is monotonic. That means: if a window is invalid, every bigger window that contains it is also invalid, and shrinking from the left moves you back toward valid. This is true for \"at most k distinct characters\", \"no repeated characters\" and \"sum at most S\" when all numbers are non-negative.\n\nNegative numbers break it. For \"subarray with sum exactly k\" on [1, -1, 5, -2, 3], removing an element on the left can make the sum bigger, so the window cannot decide which way to move. The standard fix is prefix sums with a hash map: keep a count of every prefix sum seen so far, and at each index add count[prefix - k] to the answer. That is O(n) time and O(n) space.",
        bullets: ["Non-negative numbers: sliding window is fine", "Negative numbers: prefix sums plus a hash map", "Character counts are always non-negative, so string windows are safe"],
      },
      {
        heading: "Two templates: longest valid and shortest valid",
        body: "Almost every variable window problem fits one of two loops. For the longest valid window, add a[right], then shrink while the window is invalid, then record right - left + 1. The answer is recorded when the window is valid and as wide as it can be.\n\nFor the shortest valid window, add a[right], then while the window is valid, record its length and shrink from the left. The answer is recorded inside the loop, each time you find a smaller valid window.\n\nMixing these up is the most common bug: recording in the wrong place gives answers that are off by one or always zero. Before coding, say which template you need. Example: \"smallest subarray with sum at least 7\" is the shortest-valid template; \"longest substring with at most 2 distinct letters\" is the longest-valid one.",
        visual: {
          type: "compare",
          title: "Where to record the answer",
          columns: [
            { title: "Longest valid window", points: ["Add a[right]", "While invalid: remove a[left]", "Record after the while loop", "Answer only grows"] },
            { title: "Shortest valid window", points: ["Add a[right]", "While valid: record, then remove a[left]", "Record inside the while loop", "Answer only shrinks"] },
          ],
        },
      },
      {
        heading: "Minimum window substring, step by step",
        body: "Given s and t, find the shortest part of s that contains every character of t, with repeats counted. Keep need, a Counter of t, and missing, the number of characters still needed (len(t) at the start).\n\nMove right across s. When need[ch] is above 0, this character was really needed, so missing goes down by 1. Always do need[ch] -= 1; negative values mean extra copies. When missing reaches 0, the window covers t. Now shrink: while need[s[left]] is negative, that character is extra, so give it back and move left. The window is now as small as it can be for this right end, so compare it with the best so far.\n\nThen drop s[left] on purpose, which makes missing 1 again, and keep going. Time is O(len(s) + len(t)) and memory is O(size of the alphabet).",
        visual: {
          type: "flow",
          title: "Minimum window loop for one right step",
          steps: [
            { label: "Take s[right]", detail: "If needed, missing -= 1." },
            { label: "missing == 0?", detail: "No: keep expanding." },
            { label: "Drop extras", detail: "Shrink while need[s[left]] is negative." },
            { label: "Record", detail: "Keep it if it is the shortest so far." },
            { label: "Break cover", detail: "Remove s[left], missing becomes 1." },
          ],
        },
      },
      {
        heading: "Counting subarrays and the exactly k trick",
        body: "Some problems ask how many subarrays satisfy a rule, not the longest one. In the longest-valid template, once the window [left, right] is valid, every subarray that ends at right and starts at left or later is valid too. That is right - left + 1 subarrays, so add it at each step.\n\nWindows handle \"at most k\" naturally but not \"exactly k\", because an exactly-k window can be invalid on both sides. The trick: exactly(k) = atMost(k) - atMost(k - 1). For example, the number of subarrays with exactly 2 distinct integers in [1, 2, 1, 2, 3] is atMost(2) - atMost(1) = 12 - 5 = 7. Both calls are O(n), so the whole thing stays O(n).",
        bullets: ["Valid window adds right - left + 1 subarrays ending at right", "exactly(k) = atMost(k) - atMost(k - 1)"],
      },
      {
        heading: "Sliding window maximum with a deque",
        body: "For the maximum of every window of size k, a running sum does not help, because you cannot \"subtract\" a maximum. A heap works in O(n log n). A monotonic deque does it in O(n).\n\nThe deque holds indexes whose values are in decreasing order. When a new value x arrives, pop from the back every index whose value is at most x: those elements can never be a maximum again, because x is newer and at least as big. Push the new index. If the front index has slid out of the window (index at most i - k), pop it from the front. The front is now the maximum.\n\nEach index is pushed once and popped at most once, so the total is O(n), with O(k) memory. The same idea, with the order flipped, gives the window minimum.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Fixed window k = 3 over [2, 1, 5, 1, 3, 2]",
        steps: [
          { label: "First window", detail: "2 + 1 + 5 = 8." },
          { label: "Slide", detail: "+1 -2 = 7." },
          { label: "Slide", detail: "+3 -1 = 9." },
          { label: "Slide", detail: "+2 -5 = 6." },
          { label: "Best", detail: "9, from [5, 1, 3]." },
        ],
      },
      {
        type: "tree",
        title: "What should the window remember?",
        root: "Window state",
        children: [
          { label: "A running sum", children: ["Moving averages", "Smallest subarray with sum at least S"] },
          { label: "Character counts", children: ["Anagrams in a string", "Minimum window substring", "At most k distinct"] },
          { label: "Last seen index", children: ["Longest substring without repeats"] },
          { label: "Monotonic deque", children: ["Window maximum", "Window minimum"] },
        ],
      },
    ],
    examples: [
      {
        title: "Minimum window substring: s = ADOBECODEBANC, t = ABC",
        explanation: "Step 1: expand right until A, B and C are all inside. That happens at ADOBEC (missing hits 0); nothing on the left is extra, so record length 6. Step 2: drop A on purpose and keep expanding. The next full cover arrives when the second A is added (DOBECODEBA); shrinking past the extra letters leaves CODEBA, length 6, not better. Step 3: drop C, expand to the final C, and shrink: the window becomes BANC, length 4. That is the answer.",
        code: {
          lang: "python",
          code: `from collections import Counter

def min_window(s, t):             # O(len(s) + len(t))
    need, missing = Counter(t), len(t)
    left = start = end = 0
    for right, ch in enumerate(s, 1):   # right is exclusive
        if need[ch] > 0: missing -= 1
        need[ch] -= 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1; left += 1
            if end == 0 or right - left < end - start:
                start, end = left, right
            need[s[left]] += 1; missing += 1; left += 1
    return s[start:end]`,
        },
      },
      {
        title: "Smallest subarray with sum at least 7 in [2, 3, 1, 2, 4, 3]",
        explanation: "All numbers are non-negative, so a variable window is safe, and we want the shortest valid window. Add 2, 3, 1, 2: sum 8 is valid at length 4. Shrink: remove 2, sum 6, invalid. Add 4: sum 10, length 4; remove 3, sum 7, length 3; remove 1, sum 6. Add 3: sum 9, length 3; remove 2, sum 7, length 2 ([4, 3]); remove 4, sum 3. End of array: the answer is 2.",
        code: {
          lang: "python",
          code: `def min_len(target, a):           # O(n)
    left = s = 0
    best = float("inf")
    for right, x in enumerate(a):
        s += x
        while s >= target:
            best = min(best, right - left + 1)
            s -= a[left]; left += 1
    return 0 if best == float("inf") else best

print(min_len(7, [2, 3, 1, 2, 4, 3]))   # 2`,
        },
      },
    ],
    cheatSheet: [
      "Fixed window: start with sum(a[:k]), then s += a[i] - a[i - k] for i from k to n - 1",
      "Longest valid: add a[right], shrink while invalid, then record right - left + 1",
      "Shortest valid: add a[right], then while valid record the length and shrink",
      "Variable windows need monotonic validity; with negative numbers use prefix sums plus a hash map",
      "exactly(k) = atMost(k) - atMost(k - 1); a valid window adds right - left + 1 subarrays",
      "Window maximum: deque of indexes with decreasing values, pop stale front, O(n) total",
      "Minimum window substring: Counter of t plus a missing count, O(len(s) + len(t))",
    ],
    quiz: [
      {
        q: "What does the fixed sliding window cost for the maximum sum of every size-k window in an array of length n?",
        options: ["O(n x k)", "O(n log n)", "O(k)", "O(n)"],
        answer: 3,
        why: "Each slide is one addition and one subtraction, so the scan is linear.",
      },
      {
        q: "Why does a variable window fail for \"subarray sum equals k\" when numbers can be negative?",
        options: ["Removing an element on the left can increase the sum, so validity is not monotonic", "Negative numbers cannot be stored in a window", "The window would need O(n^2) memory", "Python sums are slow for negatives"],
        answer: 0,
        why: "The window cannot tell whether to grow or shrink; prefix sums with a hash map solve it in O(n).",
      },
      {
        q: "How do you count subarrays with exactly k distinct values using windows?",
        options: ["Run one window and record when the count equals k", "atMost(k) + atMost(k - 1)", "atMost(k) - atMost(k - 1)", "Sort first, then use two pointers"],
        answer: 2,
        why: "Subarrays with at most k distinct, minus those with at most k - 1, leaves exactly k.",
      },
      {
        q: "Which structure gives the maximum of every size-k window in O(n) total?",
        options: ["A min-heap of all values", "A deque of indexes with decreasing values", "A sorted list rebuilt each step", "A stack of window sums"],
        answer: 1,
        why: "Each index enters and leaves the deque once, and the front is always the window maximum.",
      },
      {
        q: "What is the length of the longest substring of \"eceba\" with at most 2 distinct characters?",
        options: ["2", "3", "4", "5"],
        answer: 1,
        why: "\"ece\" has only e and c; adding b makes three distinct characters.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Return the maximum number of vowels in any substring of s with length k. For s = \"abciiidef\" and k = 3 the answer is 3.",
        hint: "Fixed window: add 1 if the new character is a vowel and subtract 1 if the leaving one is.",
        solution: `def max_vowels(s, k):
    v = set("aeiou")
    cur = sum(c in v for c in s[:k]); best = cur
    for i in range(k, len(s)):
        cur += (s[i] in v) - (s[i - k] in v)
        best = max(best, cur)
    return best`,
      },
      {
        level: "medium",
        task: "Return the length of the longest substring of s that contains at most k distinct characters.",
        hint: "Longest-valid template with a dict of counts; delete keys whose count reaches 0 so len(dict) is the distinct count.",
        solution: `from collections import defaultdict

def longest_k_distinct(s, k):
    cnt = defaultdict(int); left = best = 0
    for right, ch in enumerate(s):
        cnt[ch] += 1
        while len(cnt) > k:
            cnt[s[left]] -= 1
            if cnt[s[left]] == 0: del cnt[s[left]]
            left += 1
        best = max(best, right - left + 1)
    return best`,
      },
      {
        level: "hard",
        task: "Return the maximum of every window of size k. [1, 3, -1, -3, 5, 3, 6, 7] with k = 3 gives [3, 3, 5, 5, 6, 7]. Use O(n) time.",
        hint: "Keep a deque of indexes whose values decrease from front to back.",
        solution: `from collections import deque

def max_window(a, k):
    dq, out = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x: dq.pop()
        dq.append(i)
        if dq[0] <= i - k: dq.popleft()
        if i >= k - 1: out.append(a[dq[0]])
    return out`,
      },
    ],
    faq: [
      { q: "How do I recognise a sliding window problem?", a: "Look for the words contiguous, subarray or substring, together with longest, shortest, at most or count. If the items must sit next to each other, a window is a strong first guess." },
      { q: "Is a nested while loop really O(n)?", a: "Yes. The left pointer only moves forward and can move at most n times in the whole run, so the inner loop does at most n steps in total, not n per outer step." },
      { q: "Why is my window answer off by one?", a: "Usually the window length is computed as right - left instead of right - left + 1 for inclusive indexes, or the answer is recorded in the wrong template position. Trace a two-element input by hand to check." },
    ],
  },

  "dsa-advanced/fenwick-tree": {
    plain: [
      "Imagine one million player scores that change all the time, and you often ask: what is the total of players 1 to 5000? Adding them up each time is slow. A prefix sum array answers fast, but every score change forces you to rewrite many entries. A Fenwick tree does both jobs in about 20 steps for a million items, because log2 of one million is about 20.",
      "The idea: each box in a helper array stores the total of a small block of the original array that ends at that box. The block sizes are powers of two (1, 2, 4, 8 and so on), and the binary form of the box number decides the size.",
      "To get a prefix total, you add up a few boxes, jumping backward each time. To change one element, you update the few boxes whose blocks contain it, jumping forward each time. Both jumps use one small bit trick.",
      "It is also called a binary indexed tree (BIT). Peter Fenwick described it in 1994. It is tiny: an array of n + 1 numbers and two loops of three lines each, which makes it a favourite in contests and interviews.",
    ],
    deepDive: [
      {
        heading: "What each cell really stores",
        body: "Use 1-based indexes. lowbit(i) is the value of the lowest set bit of i, computed as i & -i. In two's complement, -i flips every bit of i and adds 1, so only the lowest 1 bit survives the AND. Python integers behave like infinite two's complement for &, so the trick works there too.\n\nCell t[i] stores the sum of a[i - lowbit(i) + 1] through a[i], a block of length lowbit(i) that ends at i. So t[6] (binary 110, lowbit 2) holds a[5] + a[6]. t[8] (1000, lowbit 8) holds a[1] through a[8]. Every odd index has lowbit 1 and holds just one element.\n\nThese blocks nest neatly: each block is either inside another or does not touch it. That nesting forms a tree, which is where the name comes from, even though it is stored as a flat array.",
        visual: {
          type: "tree",
          title: "Which elements each cell covers (n = 8)",
          root: "t[8] covers a[1..8]",
          children: [
            { label: "t[4] covers a[1..4]", children: ["t[2] covers a[1..2]", "t[1] covers a[1]", "t[3] covers a[3]"] },
            { label: "t[6] covers a[5..6]", children: ["t[5] covers a[5]"] },
            { label: "t[7] covers a[7]" },
          ],
        },
      },
      {
        heading: "Why both walks take O(log n)",
        body: "The query walk does i -= i & -i, which clears the lowest set bit of i. A number up to n has at most floor(log2 n) + 1 set bits, so the walk takes at most that many steps. prefix(13) reads t[13], t[12] and t[8], then stops at 0: three cells for 13 = 1101 in binary, one per set bit.\n\nThe update walk does i += i & -i. Adding the lowest set bit causes a carry, so the lowest set bit of the new i is in a strictly higher position. Positions only go up and stop once i passes n, so this walk also takes at most about log2 n + 1 steps. Updating a[5] in a tree of size 16 touches t[5], t[6], t[8] and t[16]: exactly the blocks that contain position 5.\n\nFor n = 10^6, that is at most 20 steps either way.",
        visual: {
          type: "flow",
          title: "prefix(13) walks down by clearing bits",
          steps: [
            { label: "i = 13 (1101)", detail: "Add t[13], covers a[13]." },
            { label: "i = 12 (1100)", detail: "Add t[12], covers a[9..12]." },
            { label: "i = 8 (1000)", detail: "Add t[8], covers a[1..8]." },
            { label: "i = 0", detail: "Stop: total is a[1..13]." },
          ],
        },
      },
      {
        heading: "Building in O(n) and setting values",
        body: "The simple build calls add(i, a[i]) for every i, which is O(n log n). There is a linear build: copy the array into t with a 0 in front, then for i from 1 to n, let j = i + (i & -i), and if j is at most n do t[j] += t[i]. Each cell pushes its finished total into its parent once, so the build is O(n).\n\nA Fenwick tree only knows how to add a delta. To set a[i] to a new value v, you must add v - a[i], which means you keep a plain copy of the array next to the tree. Forgetting this and calling add(i, v) is a very common bug: the element ends up as old plus new.\n\nThere is also a 0-based variant: query uses r = (r & (r + 1)) - 1, update uses i = i | (i + 1). Both are correct; pick one and stay with it.",
      },
      {
        heading: "Range updates and other variations",
        body: "Flip the roles to get range update with point query. Build the tree over a difference array: to add d to every element from l to r, call add(l, d) and add(r + 1, -d). Then prefix(i) is the current value of a[i]. Both operations are O(log n).\n\nIf you need range update and range sum at the same time, use two Fenwick trees. With B1 and B2, a range add of d on [l, r] does B1.add(l, d), B1.add(r + 1, -d), B2.add(l, d * (l - 1)) and B2.add(r + 1, -d * r). Then prefix(i) = B1.prefix(i) * i - B2.prefix(i).\n\nThe structure also extends to two dimensions: a grid of n by m with point updates and rectangle sums, each costing O(log n * log m).",
        bullets: ["Range add, point query: tree over the difference array", "Range add, range sum: two trees", "2D Fenwick: O(log n * log m) per operation"],
      },
      {
        heading: "Counting with a Fenwick tree, and its limits",
        body: "A Fenwick tree over value ranks works as a dynamic counter. To count inversions, scan left to right. Before inserting x, prefix(rank(x)) is how many earlier values are at most x, so seen - prefix(rank(x)) of the earlier values are greater than x. Add that, then add(rank(x), 1). Total O(n log n).\n\nWhen values are large or negative, compress them first: sort the distinct values and map each to its position plus 1. This keeps the tree size equal to the number of distinct values.\n\nThe limit: range sum(l, r) relies on subtraction, prefix(r) - prefix(l - 1). That works for sum and xor, which can be undone, but not for min, max or gcd over an arbitrary range. For those, or for range assignments, use a segment tree.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Fenwick tree or segment tree?",
        columns: [
          { title: "Fenwick tree", points: ["n + 1 cells", "Sum, xor and counts (invertible ops)", "About 10 lines of code", "Small constant factor, fast in practice"] },
          { title: "Segment tree", points: ["About 4n cells recursive, 2n iterative", "Any associative op: min, max, gcd", "Range updates with lazy propagation", "More code, more ways to slip"] },
        ],
      },
    ],
    examples: [
      {
        title: "Range sums on a changing array",
        explanation: "a = [3, 2, -1, 6, 5, 4, -3, 3] (positions 1 to 8). After the linear build, t = [3, 5, -1, 10, 5, 9, -3, 19]. Step 1: sum of positions 3 to 6 = prefix(6) - prefix(2). prefix(6) reads t[6] + t[4] = 9 + 10 = 19, and prefix(2) reads t[2] = 5, so the answer is 14 (check: -1 + 6 + 5 + 4 = 14). Step 2: add 2 to position 4. The update walk touches t[4] and t[8] only. Step 3: the same query now returns 21 - 5 = 16.",
        code: {
          lang: "python",
          code: `class BIT:
    def __init__(self, a):              # O(n) build, a is a normal list
        self.n = len(a); self.t = [0] + list(a)
        for i in range(1, self.n + 1):
            j = i + (i & -i)
            if j <= self.n: self.t[j] += self.t[i]
    def add(self, i, d):                # 1-based, O(log n)
        while i <= self.n: self.t[i] += d; i += i & -i
    def prefix(self, i):                # sum of a[1..i], O(log n)
        s = 0
        while i > 0: s += self.t[i]; i -= i & -i
        return s
    def range_sum(self, l, r): return self.prefix(r) - self.prefix(l - 1)
b = BIT([3, 2, -1, 6, 5, 4, -3, 3])
print(b.range_sum(3, 6)); b.add(4, 2); print(b.range_sum(3, 6))   # 14 16`,
        },
      },
      {
        title: "Counting inversions in [3, 1, 2]",
        explanation: "An inversion is a pair i < j with a[i] > a[j]. Ranks are 1 -> 1, 2 -> 2, 3 -> 3. Step 1: x = 3, nothing seen yet, add 0, then mark rank 3. Step 2: x = 1, one value seen, prefix(1) = 0 of them are at most 1, so 1 - 0 = 1 inversion. Mark rank 1. Step 3: x = 2, two seen, prefix(2) = 1 (the 1), so 2 - 1 = 1 more. Total 2: the pairs (3, 1) and (3, 2). For [8, 4, 2, 1] the same code returns 6, the maximum for 4 elements.",
        code: {
          lang: "python",
          code: `def inversions(a):                # O(n log n)
    rank = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
    t, inv = [0] * (len(rank) + 1), 0
    for seen, x in enumerate(a):
        i, s = rank[x], 0
        while i > 0: s += t[i]; i -= i & -i      # earlier values <= x
        inv += seen - s                          # earlier values > x
        i = rank[x]
        while i < len(t): t[i] += 1; i += i & -i
    return inv

print(inversions([3, 1, 2]), inversions([8, 4, 2, 1]))   # 2 6`,
        },
      },
    ],
    cheatSheet: [
      "lowbit(i) = i & -i; t[i] holds the sum of a[i - lowbit(i) + 1 .. i] with 1-based indexes",
      "Update: while i <= n: t[i] += d; i += i & -i  (O(log n))",
      "Query: while i > 0: s += t[i]; i -= i & -i  (O(log n))",
      "sum(l..r) = prefix(r) - prefix(l - 1)",
      "Linear build: for each i, add t[i] into t[i + (i & -i)] when that index is at most n",
      "To set a[i] = v, add v - a[i]; keep a plain copy of the array",
      "Range add, point query: add(l, d), add(r + 1, -d), then a[i] = prefix(i)",
      "Range min or max with updates is not a Fenwick job: use a segment tree",
    ],
    quiz: [
      {
        q: "What is lowbit(12), that is 12 & -12?",
        options: ["1", "2", "4", "8"],
        answer: 2,
        why: "12 is 1100 in binary, and its lowest set bit has value 4.",
      },
      {
        q: "Which cells does prefix(13) read?",
        options: ["t[13], t[12], t[8]", "t[13], t[14], t[16]", "t[1] through t[13]", "t[8] and t[13] only"],
        answer: 0,
        why: "Clearing the lowest bit each time goes 13, 12, 8, then 0.",
      },
      {
        q: "Why does the classic Fenwick tree use 1-based indexes?",
        options: ["Python lists start at 1", "It saves one cell of memory", "Prefix sums are undefined at 0", "0 & -0 is 0, so the update loop would never move"],
        answer: 3,
        why: "With lowbit 0 the index never changes and the loop runs forever.",
      },
      {
        q: "Roughly how many cells does one point update touch when n = 1,000,000?",
        options: ["About 1,000", "At most about 20", "About 500,000", "Exactly 1"],
        answer: 1,
        why: "The update walk is O(log n), and log2 of a million is just under 20.",
      },
      {
        q: "Which query can a single standard Fenwick tree not answer for any range [l, r] with updates?",
        options: ["Range sum", "Range xor", "Range minimum", "How many stored values are at most x"],
        answer: 2,
        why: "Range answers come from prefix(r) - prefix(l - 1), and minimum cannot be undone by subtraction.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "With n = 16, list the cells touched by add(5, d) and the cells read by prefix(11). Do it by hand using binary.",
        hint: "Update adds the lowest set bit; query removes it.",
        solution: "add(5): 5 (0101) -> 6 (0110) -> 8 (1000) -> 16 (10000), then 32 is past n.\nCells touched: t[5], t[6], t[8], t[16].\nprefix(11): 11 (1011) -> 10 (1010) -> 8 (1000) -> 0.\nCells read: t[11] (a[11]), t[10] (a[9..10]), t[8] (a[1..8]).",
      },
      {
        level: "medium",
        task: "Implement NumArray(nums) with update(index, val) that sets nums[index] = val and sumRange(left, right), both inclusive and 0-based, each in O(log n).",
        hint: "Shift to 1-based inside the class and remember the old values so update can add the difference.",
        solution: `class NumArray:
    def __init__(self, nums):
        self.a = nums[:]; self.n = len(nums); self.t = [0] * (self.n + 1)
        for i, x in enumerate(nums): self._add(i + 1, x)
    def _add(self, i, d):
        while i <= self.n: self.t[i] += d; i += i & -i
    def _pre(self, i):
        s = 0
        while i > 0: s += self.t[i]; i -= i & -i
        return s
    def update(self, index, val): self._add(index + 1, val - self.a[index]); self.a[index] = val
    def sumRange(self, left, right): return self._pre(right + 1) - self._pre(left)`,
      },
      {
        level: "hard",
        task: "Count of smaller numbers after self: for each element, count how many elements to its right are strictly smaller. [5, 2, 6, 1] gives [2, 1, 1, 0]. Aim for O(n log n).",
        hint: "Scan from the right, and before inserting x ask how many inserted values have a rank below rank(x).",
        solution: `def count_smaller(a):
    rank = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
    t, out = [0] * (len(rank) + 1), []
    for x in reversed(a):
        i, s = rank[x] - 1, 0
        while i > 0: s += t[i]; i -= i & -i
        out.append(s)
        i = rank[x]
        while i < len(t): t[i] += 1; i += i & -i
    return out[::-1]`,
      },
    ],
    faq: [
      { q: "Is a Fenwick tree better than a segment tree?", a: "For prefix sums with point updates it is shorter, uses less memory and is usually faster. A segment tree is more flexible: it handles min, max, gcd and range updates with lazy propagation." },
      { q: "Why is it called a tree if it is just an array?", a: "The blocks each cell covers nest inside each other, and following i += i & -i from any cell leads to its parent. That parent relation forms a tree, stored implicitly in a flat array." },
      { q: "Can I use a Fenwick tree with 0-based indexes?", a: "Yes. A common 0-based variant uses i = i | (i + 1) for updates and r = (r & (r + 1)) - 1 for queries. Many people simply shift indexes by one and keep the classic 1-based version." },
      { q: "What is the time to build a Fenwick tree?", a: "O(n log n) if you call add for each element, or O(n) with the linear build that pushes each cell into its parent once." },
    ],
  },

  "dsa-advanced/segment-tree": {
    plain: [
      "A segment tree answers questions like \"what is the smallest value between position 100 and 900?\" quickly, even while the values keep changing. Picture a sports tournament bracket: players stand at the bottom, and each match sends one result upward. Each node in the tree knows the answer (sum, min or max) for its group of elements.",
      "The root covers the whole array. It splits into a left half and a right half, and each half splits again, until every node covers a single element. For n elements there are about 2n nodes and the height is about log2 n.",
      "To answer a range question, you pick a few nodes that together cover exactly that range and combine their answers. To change one element, you change its leaf and recompute every node on the path up to the root. Both cost about log n steps.",
      "There is also a trick called lazy propagation. It lets you do things like \"add 5 to every element from 100 to 900\" quickly, by leaving a note on a few big nodes instead of touching every element.",
    ],
    deepDive: [
      {
        heading: "Layout, building and the 4n rule",
        body: "The usual recursive version stores nodes in an array. Node 1 is the root. Node v has children 2v and 2v + 1. If v covers [lo, hi], let mid = (lo + hi) // 2: the left child covers [lo, mid] and the right child covers [mid + 1, hi]. A node with lo == hi is a leaf holding one array value.\n\nBuild recursively: build both children, then set t[v] = combine(t[2v], t[2v + 1]). There are 2n - 1 real nodes and each is visited once, so building is O(n).\n\nWhy allocate 4n slots and not 2n? When n is not a power of two the tree is not perfectly balanced, and the numbering skips slots, so indexes can go beyond 2n. They always stay below 4n, which is why 4n is the safe size. The iterative bottom-up version stores leaves at t[n..2n-1] and needs only 2n.",
        bullets: ["Children of v: 2v and 2v + 1", "Build O(n), height about ceil(log2 n)", "Recursive: 4n slots; iterative: 2n slots"],
      },
      {
        heading: "How a range query picks its nodes",
        body: "query(l, r) at node v covering [lo, hi] has three cases. No overlap (r < lo or hi < l): return the identity value, such as 0 for sum. Full overlap (l <= lo and hi <= r): return t[v] without going deeper. Partial overlap: ask both children and combine the results.\n\nThe key fact: at each level of the tree, at most 4 nodes are visited, and at most 2 of them recurse further. The ones fully inside stop at once. So a query costs O(log n) no matter how wide the range is.\n\nFor example, on 8 elements, the range [1, 5] is answered by exactly three nodes: [1], [2..3] and [4..5]. A point update is simpler: walk down to the leaf, change it, and recompute each parent on the way back up, touching one node per level.",
        visual: {
          type: "tree",
          title: "Nodes used for query [1, 5] on 8 elements",
          root: "[0..7] partial",
          children: [
            { label: "[0..3] partial", children: ["[0..1] partial, use [1]", "[2..3] fully inside, used"] },
            { label: "[4..7] partial", children: ["[4..5] fully inside, used", "[6..7] no overlap, skipped"] },
          ],
        },
      },
      {
        heading: "Beyond sums: min, max, gcd and custom nodes",
        body: "A segment tree works for any associative operation, meaning (a op b) op c equals a op (b op c). You also need an identity value for the no-overlap case: 0 for sum and xor, 1 for product, +infinity for min, -infinity for max, and 0 for gcd, since gcd(0, x) = x.\n\nThe operation does not have to be commutative, as long as you always combine the left child before the right one. That allows things like matrix products over a range.\n\nNodes can also store several numbers. For \"maximum subarray sum inside [l, r]\", each node keeps four values: total, best prefix, best suffix and best overall. Combining two children: total adds up, best prefix is max(left prefix, left total + right prefix), best suffix is the mirror, and best is max(left best, right best, left suffix + right prefix). The tree code stays the same; only combine changes.",
      },
      {
        heading: "Lazy propagation for range updates",
        body: "Adding d to every element in [l, r] one by one costs O(k log n) for k elements. Lazy propagation makes it O(log n). Each node gets a second field, lazy, meaning \"this much still needs to be added to every element below me\".\n\nDuring a range add, when a node is fully inside [l, r], update its own value right away (for a sum tree, sum += d * (hi - lo + 1)), add d to its lazy field, and stop. Do not visit its children. When a later query or update needs to go below a node, first push: apply that node's lazy value to both children and reset it to 0. Then recurse, and on the way back recompute the node from its children.\n\nRange add on a min or max tree is simpler: the node value just increases by d. Range assign needs a different tag, and mixing assign and add tags needs a clear rule for which applies first.",
        visual: {
          type: "flow",
          title: "Range add at one node with lazy tags",
          steps: [
            { label: "No overlap?", detail: "Return, nothing to do." },
            { label: "Fully inside?", detail: "sum += d * length, lazy += d, return." },
            { label: "Push", detail: "Give this node's lazy to both children." },
            { label: "Recurse", detail: "Left child, then right child." },
            { label: "Pull", detail: "sum = left sum + right sum." },
          ],
        },
      },
      {
        heading: "Choosing the right range structure",
        body: "Do not reach for a segment tree first. If the array never changes, a prefix sum array gives range sums in O(1) after O(n) setup. For range minimum on a static array, a sparse table gives O(1) queries after O(n log n) setup, because min can overlap two blocks safely.\n\nIf values change and you only need sums, a Fenwick tree is shorter and faster. Use a segment tree when you need min, max, gcd or a custom combine with updates, or range updates with range queries.\n\nIn Python, recursion has real overhead. The iterative bottom-up tree (leaves at n to 2n - 1, parents computed downward from n - 1) is usually several times faster than the recursive one. For lazy propagation most people still use recursion, but keep the code tight and avoid creating objects inside the loop.",
        bullets: ["Static sums: prefix sums", "Static min or max: sparse table", "Sums with point updates: Fenwick tree", "Min, max, custom or range updates: segment tree"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Point update a[2] = 7 in the sum tree for [2, 1, 5, 3]",
        steps: [
          { label: "Set leaf [2]", detail: "5 becomes 7." },
          { label: "Parent [2..3]", detail: "7 + 3 = 10." },
          { label: "Root [0..3]", detail: "3 + 10 = 13." },
          { label: "Done", detail: "One node per level touched." },
        ],
      },
      {
        type: "compare",
        title: "Adding d to k elements",
        columns: [
          { title: "Point updates only", points: ["k separate updates", "O(k log n) time", "Simple code", "Fine when k is tiny"] },
          { title: "Lazy propagation", points: ["One range update", "O(log n) time", "Extra lazy array", "Push before visiting children"] },
        ],
      },
    ],
    examples: [
      {
        title: "Range minimum on a = [5, 2, 8, 6, 3, 7]",
        explanation: "Step 1: build. Leaves hold the values; [0..2] holds min(5, 2, 8) = 2, [3..5] holds min(6, 3, 7) = 3, and the root holds 2. Step 2: query(2, 4). The root is a partial overlap, so ask both halves. In [0..2], only [2] is inside, giving 8. In [3..5], the left part [3..4] is fully inside, giving 3, and [5] has no overlap, giving infinity. Step 3: combine: min(8, 3) = 3. A point update would set a leaf and recompute min on the way up.",
        code: {
          lang: "python",
          code: `INF = float("inf")
class MinTree:
    def __init__(self, a):
        self.n = len(a); self.t = [INF] * (4 * self.n); self._build(a, 1, 0, self.n - 1)
    def _build(self, a, v, lo, hi):
        if lo == hi: self.t[v] = a[lo]; return
        mid = (lo + hi) // 2
        self._build(a, 2 * v, lo, mid); self._build(a, 2 * v + 1, mid + 1, hi)
        self.t[v] = min(self.t[2 * v], self.t[2 * v + 1])
    def query(self, l, r, v=1, lo=0, hi=None):    # min of a[l..r], O(log n)
        if hi is None: hi = self.n - 1
        if r < lo or hi < l: return INF
        if l <= lo and hi <= r: return self.t[v]
        mid = (lo + hi) // 2
        return min(self.query(l, r, 2 * v, lo, mid), self.query(l, r, 2 * v + 1, mid + 1, hi))`,
        },
      },
      {
        title: "Lazy range add on a sum tree",
        explanation: "Start with 8 zeros and call add(2, 6, 5). At the root [0..7] the range is partial, so push (nothing pending) and recurse. [0..3] is partial: [0..1] has no overlap, [2..3] is fully inside, so its sum becomes 5 * 2 = 10 with lazy 5, and we stop there. [4..7] is partial: [4..5] is fully inside (sum 10, lazy 5), and [6..7] goes one level deeper to update [6]. Parents then pull their sums: the root becomes 25. Only a handful of nodes were touched, not all five elements one by one.",
        code: {
          lang: "python",
          code: `class LazySum:
    def __init__(self, n): self.n, self.s, self.lz = n, [0] * (4 * n), [0] * (4 * n)
    def _apply(self, v, lo, hi, d): self.s[v] += d * (hi - lo + 1); self.lz[v] += d
    def _push(self, v, lo, mid, hi):
        if self.lz[v]:
            self._apply(2 * v, lo, mid, self.lz[v]); self._apply(2 * v + 1, mid + 1, hi, self.lz[v])
            self.lz[v] = 0
    def add(self, l, r, d, v=1, lo=0, hi=None):    # add d to a[l..r], O(log n)
        hi = self.n - 1 if hi is None else hi
        if r < lo or hi < l: return
        if l <= lo and hi <= r: return self._apply(v, lo, hi, d)
        mid = (lo + hi) // 2; self._push(v, lo, mid, hi)
        self.add(l, r, d, 2 * v, lo, mid); self.add(l, r, d, 2 * v + 1, mid + 1, hi)
        self.s[v] = self.s[2 * v] + self.s[2 * v + 1]
# A range-sum query has the same shape: push before recursing into children.`,
        },
      },
    ],
    cheatSheet: [
      "Recursive layout: root is node 1, children of v are 2v and 2v + 1; allocate 4n slots",
      "Build O(n), point update O(log n), range query O(log n)",
      "Query cases: no overlap returns the identity, full overlap returns t[v], partial recurses",
      "Identities: sum 0, product 1, min +inf, max -inf, gcd 0, xor 0",
      "Lazy range add on sums: sum += d * length, lazy += d; push before visiting children",
      "Static range min with no updates: sparse table, O(n log n) build and O(1) query",
      "Iterative bottom-up tree uses 2n slots and is much faster in Python than recursion",
    ],
    quiz: [
      {
        q: "During a range query, at most how many nodes are visited on any single level of the tree?",
        options: ["1", "4", "log n", "n"],
        answer: 1,
        why: "Only the two boundary paths go deeper, so each level sees at most 4 nodes, giving O(log n).",
      },
      {
        q: "What identity value should a gcd segment tree return for no overlap?",
        options: ["1", "-infinity", "0", "+infinity"],
        answer: 2,
        why: "gcd(0, x) = x, so 0 never changes the answer.",
      },
      {
        q: "Why does a recursive segment tree allocate 4n slots instead of 2n?",
        options: ["When n is not a power of two, node indexes can go past 2n", "Each node stores four values", "Python lists need extra room", "Lazy tags need two extra slots per node"],
        answer: 0,
        why: "The 2v and 2v + 1 numbering leaves gaps in unbalanced trees, but indexes always stay below 4n.",
      },
      {
        q: "A sum-tree node covering 6 elements is fully inside a range add of d. What happens there?",
        options: ["Its sum increases by d", "All 6 leaves are updated immediately", "Nothing until the next query", "Its sum increases by 6 * d and its lazy value by d"],
        answer: 3,
        why: "The node is fixed at once and the children are updated later when someone pushes.",
      },
      {
        q: "The array never changes and you need 10^6 range-sum queries. What is the best choice?",
        options: ["A segment tree", "A prefix sum array", "A lazy segment tree", "A balanced BST"],
        answer: 1,
        why: "Prefix sums give O(1) per query after O(n) setup, with no update support needed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Draw the max segment tree for [4, 9, 2, 7] and show which nodes answer max over [1, 3].",
        hint: "Label each node with its range and value, then apply the three query cases from the root.",
        solution: "Leaves: [0]=4, [1]=9, [2]=2, [3]=7.\n[0..1] = max(4, 9) = 9, [2..3] = max(2, 7) = 7, root [0..3] = 9.\nQuery [1, 3]: root is partial.\nLeft [0..1] is partial: [0] no overlap, [1] full -> 9.\nRight [2..3] is fully inside -> 7.\nAnswer: max(9, 7) = 9, using nodes [1] and [2..3].",
      },
      {
        level: "medium",
        task: "Add a method update(i, x) to the MinTree example that sets a[i] = x in O(log n).",
        hint: "Recurse to the side that contains i, set the leaf, then recompute t[v] on the way back.",
        solution: `def update(self, i, x, v=1, lo=0, hi=None):
    if hi is None: hi = self.n - 1
    if lo == hi:
        self.t[v] = x; return
    mid = (lo + hi) // 2
    if i <= mid: self.update(i, x, 2 * v, lo, mid)
    else: self.update(i, x, 2 * v + 1, mid + 1, hi)
    self.t[v] = min(self.t[2 * v], self.t[2 * v + 1])`,
      },
      {
        level: "hard",
        task: "Design the node and combine function for a segment tree that answers the maximum subarray sum inside any [l, r], with point updates.",
        hint: "Store total, best prefix, best suffix and best. The best answer may cross the middle.",
        solution: `def leaf(x):                       # (total, prefix, suffix, best)
    return (x, x, x, x)

def combine(L, R):                 # left then right, never swapped
    total = L[0] + R[0]
    pref = max(L[1], L[0] + R[1])
    suf = max(R[2], R[0] + L[2])
    best = max(L[3], R[3], L[2] + R[1])
    return (total, pref, suf, best)
# For no overlap return None and let combine skip a None side.
# The answer for [l, r] is the best field of the combined result.`,
      },
    ],
    faq: [
      { q: "What is the difference between a segment tree and a Fenwick tree?", a: "Both give O(log n) updates and queries. A Fenwick tree is smaller and simpler but mainly handles sums; a segment tree handles any associative operation and range updates with lazy propagation." },
      { q: "How much memory does a segment tree use?", a: "A recursive array-based tree uses up to 4n slots. An iterative bottom-up tree uses exactly 2n." },
      { q: "What does lazy propagation actually do?", a: "It records a pending update on a node that is fully covered, instead of updating every element below it. The update is passed down to the children only when a later operation needs to look inside that node." },
      { q: "Are segment trees asked in coding interviews?", a: "They are uncommon in typical company interviews, which favour prefix sums, heaps and Fenwick-style ideas, but they are standard in competitive programming. Knowing how to build and query one is enough for most interviews." },
    ],
  },
};

export default extra;
