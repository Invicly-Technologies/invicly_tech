import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  "dsa/big-o": {
    plain: [
      "Big-O is a way to describe how much work a program does as its input gets bigger. We do not count seconds, because seconds depend on the computer. We count how the number of steps grows. If doubling the input doubles the work, that is O(n). If doubling the input makes the work four times bigger, that is O(n squared).",
      "Imagine looking for a name in a phone book. Reading every page is O(n). Opening the book in the middle, then the middle of the correct half, and so on, is O(log n). Both find the name, but with a million pages the first takes a million looks and the second takes about twenty.",
      "In interviews, Big-O is how you compare ideas before writing code. You describe a brute-force solution, say its cost, then improve it. Interviewers want to hear both time (how many steps) and space (how much extra memory). Saying \"O(n) time, O(n) space because of the hash set\" is a complete answer.",
      "You do not need heavy maths. A few rules cover nearly every problem: loops one after another add, loops inside loops multiply, halving the input each step gives log n, and a recursive function costs roughly the number of calls times the work done in each call.",
    ],
    deepDive: [
      {
        heading: "Adding and multiplying loops",
        body: "Two loops one after the other over the same array cost O(n) + O(n), which is still O(n). A loop inside a loop multiplies: O(n) times O(n) is O(n squared).\n\nWatch the variable names. If you loop over array a and then over array b, the cost is O(a + b), not O(n). If you loop over b inside a loop over a, it is O(a times b). Squashing two inputs into one n hides useful detail, and interviewers notice.\n\nAn inner loop that starts at i + 1 still counts as O(n squared). It runs n - 1 times, then n - 2, and so on, which adds up to about n squared divided by 2, and we drop the constant.",
        bullets: ["Sequential loops: add", "Nested loops: multiply", "Different inputs keep different letters", "Halving each step: log n"],
      },
      {
        heading: "Counting the cost of recursion",
        body: "For recursion, draw the call tree. Total time is roughly the number of calls multiplied by the work done in each call. Naive Fibonacci calls itself twice per call and goes n levels deep, so it makes about 2 to the n calls.\n\nMerge sort splits the array in half each time, so its tree is log n levels deep. Every level touches all n elements once while merging. That gives n work times log n levels, which is O(n log n).\n\nSpace for recursion is the deepest chain of calls open at the same time, not the total number of calls. Merge sort's stack is only O(log n) deep, but its merge buffers add O(n).",
        visual: {
          type: "tree",
          title: "Merge sort's call tree",
          root: "Merge sort on n items",
          children: [
            { label: "Level 0", children: ["1 call", "n work merging"] },
            { label: "Level 1", children: ["2 calls of n/2", "n work in total"] },
            { label: "Level 2", children: ["4 calls of n/4", "n work in total"] },
            { label: "log n levels", children: ["n work x log n levels", "O(n log n)"] },
          ],
        },
      },
      {
        heading: "Amortised cost: cheap on average over time",
        body: "A Java ArrayList grows by allocating a bigger array and copying everything over when it is full. That single copy is O(n). But it happens rarely, because the capacity grows by a constant factor each time (about 1.5 times in Java).\n\nIf you add n items, the total copying work is a shrinking series that sums to O(n). Spread over n adds, each add is O(1) amortised. Amortised means \"averaged over a long run of operations\", not \"average over random inputs\". It is a guarantee about the whole sequence, which is why interviewers accept O(1) for ArrayList.add and for a queue built from two stacks.",
      },
      {
        heading: "Hidden costs that change the answer",
        body: "Many wrong complexity answers come from library calls that look free. String concatenation with += in a Java loop copies the whole string each time, so building n characters that way is O(n squared); use StringBuilder. list.contains and indexOf scan the list in O(n). Sorting is O(n log n), so a solution that sorts first can never be faster than that.\n\nInput size also hints at the expected solution. Online judges manage roughly 10 to 100 million simple steps per second, so n up to 100,000 usually needs O(n log n) or better, while n up to 20 allows trying every subset.",
        bullets: ["String += in a loop: O(n squared) total", "List contains: O(n)", "Sorting: O(n log n)", "HashMap get and put: O(1) average"],
        visual: {
          type: "compare",
          title: "Building a string of n characters in Java",
          columns: [
            { title: "s += c in a loop", points: ["New string every time", "Copies 1 + 2 + ... + n characters", "O(n squared) total"] },
            { title: "StringBuilder", points: ["Appends into a growing buffer", "Amortised O(1) per append", "O(n) total, toString() once"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Input size hints at the target complexity",
        root: "How big is n?",
        children: [
          { label: "n up to 20", children: ["O(2^n) backtracking is fine"] },
          { label: "n up to 500", children: ["O(n^3) can pass"] },
          { label: "n up to 10,000", children: ["O(n^2) is usually fine"] },
          { label: "n up to 1,000,000", children: ["Aim for O(n log n) or O(n)"] },
          { label: "n above 10^9", children: ["Need O(log n) or O(1), often maths or binary search"] },
        ],
      },
    ],
    examples: [
      {
        title: "Counting steps in three small loops",
        explanation: "Step 1: the first loop runs n times, so it is O(n). Step 2: in the nested pair, j runs from i to n, so the inner line runs n + (n - 1) + ... + 1 = n(n + 1)/2 times, which is O(n squared). Step 3: the last loop doubles i each time, so it runs about log2(n) times. Total: O(n + n squared + log n). Keep the dominant term: O(n squared). Extra space is O(1) because we only use a few counters.",
        code: {
          lang: "java",
          code: "int work(int n) {\n    int count = 0;\n    for (int i = 0; i < n; i++) count++;          // n\n    for (int i = 0; i < n; i++)\n        for (int j = i; j < n; j++) count++;      // n(n+1)/2\n    for (int i = 1; i < n; i *= 2) count++;       // about log2(n)\n    return count;  // overall O(n^2) time, O(1) space\n}",
        },
      },
      {
        title: "Merge sort, level by level",
        explanation: "Sort 8 numbers. Level 0 has one array of 8. Level 1 has two arrays of 4, level 2 has four arrays of 2, and level 3 has eight arrays of 1. That is log2(8) = 3 levels of splitting. On the way back up, each level merges 8 elements in total, so each level costs O(n). Three levels times 8 elements gives n log n. The temporary arrays used for merging add O(n) space, and the recursion stack adds O(log n).",
      },
    ],
    cheatSheet: [
      "Sequential loops add: O(a + b). Nested loops multiply: O(a × b).",
      "Halving or doubling each step gives O(log n).",
      "Recursion time ≈ number of calls × work per call.",
      "Recursion space = maximum call depth, not total calls.",
      "Sorting costs O(n log n); a sort-first solution cannot beat that.",
      "n up to 10^5 usually needs O(n log n) or better.",
      "ArrayList add is O(1) amortised; inserting at index 0 is O(n).",
      "Always state both time and extra space.",
    ],
    quiz: [
      {
        q: "What is the time complexity of a loop where i starts at 1 and doubles until it reaches n?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        answer: 1,
        why: "The number of doublings needed to reach n is about log2(n).",
      },
      {
        q: "You loop over array a and, inside that loop, over array b. What is the cost?",
        options: ["O(a + b)", "O(n)", "O(max(a, b))", "O(a × b)"],
        answer: 3,
        why: "Each of the a outer iterations runs all b inner iterations.",
      },
      {
        q: "What is the extra space of a recursive DFS on a tree of height h?",
        options: ["O(h)", "O(1)", "O(n squared)", "O(2^h)"],
        answer: 0,
        why: "At most h calls are waiting on the stack at the same time.",
      },
      {
        q: "Why is ArrayList.add O(1) amortised even though resizing copies the array?",
        options: ["Java never resizes", "Copying is free in the JVM", "Capacity grows by a constant factor, so total copying over n adds is only O(n)", "It uses a linked list internally"],
        answer: 2,
        why: "Spreading O(n) total copying over n adds gives O(1) per add.",
      },
      {
        q: "Building a string of n characters with += on a Java String inside a loop costs:",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(n squared)"],
        answer: 3,
        why: "Each += copies the whole string so far, and 1 + 2 + ... + n is O(n squared).",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "State the time and space complexity of: for i from 0 to n - 1, for j from 0 to 9, print(i * j).",
        hint: "The inner loop length does not depend on n.",
        solution: "The inner loop runs 10 times, a constant.\nTotal: 10n steps = O(n) time.\nNo extra data structures: O(1) space.",
      },
      {
        level: "medium",
        task: "A function sorts n numbers, then for each element does a binary search in the same array. What is the total time? Could a different structure make it faster?",
        hint: "Add the costs of the phases, then think about a hash set.",
        solution: "Sort: O(n log n). n binary searches: n × O(log n) = O(n log n).\nTotal: O(n log n) time.\nWith a HashSet instead: build in O(n), each lookup O(1) average,\nso O(n) time but O(n) extra space. You trade memory for speed.",
      },
      {
        level: "hard",
        task: "Give the time and space of f(n) = (n <= 1) ? 1 : f(n / 2) + f(n / 2) + 1 with integer division. Then say what changes if you compute f(n / 2) once and double it.",
        hint: "Draw the call tree: how many levels, and how many calls on each level?",
        solution: "Two calls per call, about log2(n) levels: total calls ≈ 2^(log2 n) = n.\nEach call does O(1) work, so time is O(n).\nOnly one path is open at a time, so stack space is O(log n).\nComputing f(n / 2) once: one call per level, so O(log n) time and O(log n) space.",
      },
    ],
    faq: [
      { q: "Do I need Big-Theta and Big-Omega for interviews?", a: "Mostly no. Interviewers say Big-O but usually mean the tight bound for the worst case. Knowing that Big-O is technically an upper bound helps if someone asks." },
      { q: "Is O(n) always faster than O(n squared)?", a: "For large inputs, yes. For tiny inputs a simple O(n squared) loop can win because of small constants, which is why sorting libraries use insertion sort for very short arrays." },
      { q: "Should I count the output array in space complexity?", a: "Usually not. Say \"O(1) extra space, not counting the output\" so the interviewer knows you thought about it." },
    ],
  },

  "dsa/arrays": {
    plain: [
      "An array is a row of boxes in memory, numbered from 0. Because the boxes sit side by side, the computer can jump to any box by its number instantly. A string is basically an array of characters. Many interview problems start here, because arrays are simple to explain and easy to get subtly wrong.",
      "Most array tricks are about not repeating work. If you keep asking \"what is the sum from here to there?\", you can save running totals once and answer every question with one subtraction. If you need the best value so far, you carry it along in one variable instead of looking back.",
      "\"In place\" means changing the array you were given instead of making a new one. It saves memory, but you must not overwrite a value before you have used it. A common trick is a write pointer that marks where the next value you keep should go.",
      "Strings add one more trap: in Java and Python, strings cannot be changed. Every \"change\" builds a new copy. So for heavy editing, convert to a char array or use a StringBuilder, and turn it back into a string at the end.",
    ],
    deepDive: [
      {
        heading: "The read pointer and the write pointer",
        body: "Many in-place problems use two indexes moving in the same direction. The read pointer visits every element. The write pointer only moves when you decide to keep something. Everything before the write pointer is the finished answer.\n\nTo remove all zeros, the read pointer scans the array, and each non-zero value is copied to position write, then write moves on. At the end, the first write slots hold the kept values in their original order. Remove Duplicates from Sorted Array, Move Zeroes and Remove Element all use this exact shape, in O(n) time and O(1) extra space.",
        bullets: ["read visits every index", "write marks the next free slot", "Everything left of write is final"],
        visual: {
          type: "flow",
          title: "Removing zeros from [0, 1, 0, 3, 12]",
          steps: [
            { label: "Start", detail: "write = 0" },
            { label: "read 1", detail: "Copy to index 0, write = 1" },
            { label: "read 3", detail: "Copy to index 1, write = 2" },
            { label: "read 12", detail: "Copy to index 2, write = 3" },
            { label: "Done", detail: "First 3 slots: [1, 3, 12], order kept" },
          ],
        },
      },
      {
        heading: "Kadane's algorithm for the best subarray",
        body: "Maximum Subarray asks for the contiguous run with the largest sum. Checking every start and end is O(n squared). Kadane's idea: the best subarray ending at this index either extends the best one ending at the previous index, or starts fresh here. So cur = max(x, cur + x), and the answer is the largest cur ever seen.\n\nThe reasoning matches the stock problem: carry a small summary of the past in a variable instead of looking back. It runs in O(n) time and O(1) space, and it handles all-negative arrays if you start cur and best at the first element rather than at 0.",
      },
      {
        heading: "Difference arrays: prefix sums in reverse",
        body: "Prefix sums make range queries cheap. Difference arrays make range updates cheap. To add v to every element from l to r, do diff[l] += v and diff[r + 1] -= v. After all updates, one prefix-sum pass over diff rebuilds the real array.\n\nSo q range updates cost O(q + n) instead of O(q × n). This appears in problems like Car Pooling, Corporate Flight Bookings and \"how many meetings are running at each minute\".",
        bullets: ["Add v to l..r: diff[l] += v, diff[r + 1] -= v", "Rebuild with one prefix-sum pass", "Allocate n + 1 slots to avoid an index error"],
        visual: {
          type: "flow",
          title: "Add 2 to indexes 1..3 of a 5-item array",
          steps: [
            { label: "diff with n + 1 slots", detail: "[0, 0, 0, 0, 0, 0]" },
            { label: "diff[1] += 2", detail: "[0, 2, 0, 0, 0, 0]" },
            { label: "diff[4] -= 2", detail: "[0, 2, 0, 0, -2, 0]" },
            { label: "Prefix-sum pass", detail: "[0, 2, 2, 2, 0]" },
          ],
        },
      },
      {
        heading: "Strings in Java without surprises",
        body: "Java strings are immutable, so s += c in a loop creates a new string every time. Use a StringBuilder and call toString once at the end. Read with s.charAt(i), use s.toCharArray() when you want to sort or swap characters, and rebuild with new String(chars).\n\nFor letter counts, an int[26] indexed by c - 'a' is faster and clearer than a HashMap. Compare strings with equals, never with ==, because == only checks whether two references point at the same object. Character.isLetterOrDigit and Character.toLowerCase handle the cleaning that palindrome problems need.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Rotate [1..7] right by 3 with three reversals",
        steps: [
          { label: "Start", detail: "[1, 2, 3, 4, 5, 6, 7], k = 3 (use k mod n)" },
          { label: "Reverse all", detail: "[7, 6, 5, 4, 3, 2, 1]" },
          { label: "Reverse first k", detail: "[5, 6, 7, 4, 3, 2, 1]" },
          { label: "Reverse the rest", detail: "[5, 6, 7, 1, 2, 3, 4]" },
          { label: "Done", detail: "O(n) time, O(1) extra space" },
        ],
      },
    ],
    examples: [
      {
        title: "Move Zeroes with a write pointer",
        explanation: "Input [0, 1, 0, 3, 12], write = 0. read 0 sees 0: skip. read 1 sees 1: copy to index 0, write = 1. read 2 sees 0: skip. read 3 sees 3: copy to index 1, write = 2. read 4 sees 12: copy to index 2, write = 3. Now fill indexes 3 and 4 with zeros. Result [1, 3, 12, 0, 0]. Time O(n), space O(1), and the non-zero values keep their order.",
        code: {
          lang: "java",
          code: "void moveZeroes(int[] nums) {\n    int write = 0;\n    for (int read = 0; read < nums.length; read++) {\n        if (nums[read] != 0) {\n            nums[write++] = nums[read];\n        }\n    }\n    while (write < nums.length) {\n        nums[write++] = 0;\n    }\n}",
        },
      },
      {
        title: "Maximum Subarray with Kadane",
        explanation: "Input [-2, 1, -3, 4, -1, 2, 1, -5, 4]. Start cur = best = -2. At 1: max(1, -1) = 1, best 1. At -3: max(-3, -2) = -2. At 4: max(4, 2) = 4, best 4. At -1: cur 3. At 2: cur 5, best 5. At 1: cur 6, best 6. At -5: cur 1. At 4: cur 5. The answer is 6, from [4, -1, 2, 1]. One pass, O(1) memory.",
        code: {
          lang: "java",
          code: "int maxSubArray(int[] nums) {\n    int cur = nums[0], best = nums[0];\n    for (int i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        best = Math.max(best, cur);\n    }\n    return best;  // O(n) time, O(1) space\n}",
        },
      },
    ],
    cheatSheet: [
      "Range sum l..r from prefix p: p[r + 1] - p[l]",
      "Range update l..r by v: diff[l] += v; diff[r + 1] -= v",
      "Kadane: cur = max(x, cur + x); best = max(best, cur)",
      "Read and write pointers compact an array in O(n) time, O(1) space",
      "Rotate right by k: k %= n, reverse all, reverse first k, reverse the rest",
      "Java: StringBuilder to build, equals to compare, int[26] for letter counts",
      "Edge cases: empty, one element, all negative, duplicates, sums that overflow int (use long)",
    ],
    quiz: [
      {
        q: "What does Kadane's algorithm keep at each index?",
        options: ["The sum of the whole array", "The best sum of a subarray ending at this index", "The smallest element so far", "A sorted copy of the array"],
        answer: 1,
        why: "cur is the best sum of a subarray that ends exactly at the current index.",
      },
      {
        q: "You must add 5 to every element from index 2 to 6, many times over. Which technique makes each update O(1)?",
        options: ["Prefix sum", "Binary search", "Difference array", "Sorting"],
        answer: 2,
        why: "A difference array changes only two cells per update and rebuilds once at the end.",
      },
      {
        q: "Why is s += c inside a loop slow in Java?",
        options: ["Strings are immutable, so each += copies the whole string", "The JVM cannot add characters", "It sorts the string each time", "It is not slow"],
        answer: 0,
        why: "Each new string copies all previous characters, adding up to O(n squared).",
      },
      {
        q: "Rotating [1, 2, 3, 4, 5] right by 7 is the same as rotating it by:",
        options: ["7", "5", "0", "2"],
        answer: 3,
        why: "Rotation repeats every n = 5 steps, and 7 mod 5 = 2.",
      },
      {
        q: "Does Move Zeroes with a write pointer keep the order of the non-zero values?",
        options: ["Never", "Yes, because values are copied forward in the order they are read", "Only if the array is sorted", "Only if there is one zero"],
        answer: 1,
        why: "The read pointer visits values left to right and writes them in that same order.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Remove Duplicates from Sorted Array: remove duplicates in place and return how many unique values remain at the front.",
        hint: "Keep a write pointer and write a value only when it differs from the last written one.",
        solution: "int removeDuplicates(int[] nums) {\n    if (nums.length == 0) return 0;\n    int write = 1;\n    for (int read = 1; read < nums.length; read++) {\n        if (nums[read] != nums[write - 1]) nums[write++] = nums[read];\n    }\n    return write;  // O(n) time, O(1) space\n}",
      },
      {
        level: "medium",
        task: "Subarray Sum Equals K: count contiguous subarrays whose sum is exactly k. Values can be negative.",
        hint: "sum(l..r) = prefix[r] - prefix[l - 1]. Count how many earlier prefixes equal the current prefix minus k.",
        solution: "int subarraySum(int[] nums, int k) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    seen.put(0, 1);\n    int sum = 0, count = 0;\n    for (int x : nums) {\n        sum += x;\n        count += seen.getOrDefault(sum - k, 0);\n        seen.merge(sum, 1, Integer::sum);\n    }\n    return count;  // O(n) time, O(n) space\n}",
      },
      {
        level: "hard",
        task: "Trapping Rain Water: given bar heights, compute how much water is trapped after rain, in O(n) time and O(1) space.",
        hint: "Water above i = min(maxLeft, maxRight) - height[i]. Move inward from the side whose max is smaller.",
        solution: "int trap(int[] h) {\n    int l = 0, r = h.length - 1, leftMax = 0, rightMax = 0, water = 0;\n    while (l < r) {\n        if (h[l] < h[r]) {\n            leftMax = Math.max(leftMax, h[l]);\n            water += leftMax - h[l++];\n        } else {\n            rightMax = Math.max(rightMax, h[r]);\n            water += rightMax - h[r--];\n        }\n    }\n    return water;\n}",
      },
    ],
    faq: [
      { q: "Are arrays and lists the same in interviews?", a: "Usually you can treat them the same. In Java, int[] has a fixed size while ArrayList grows; say which one you use and why." },
      { q: "When should I sort the array first?", a: "When order does not matter for the answer and sorting unlocks two pointers or binary search. Remember that sorting costs O(n log n) and loses the original indexes." },
      { q: "How do I avoid off-by-one bugs?", a: "Decide whether your ranges are inclusive or exclusive, write it as a comment, and trace a two or three element example by hand before running the code." },
    ],
  },

  "dsa/hashing": {
    plain: [
      "A hash map is like a coat check with numbered hooks. You give it a key, such as a word, and a maths function turns that key into a hook number. To find the value again, it runs the same function and goes straight to that hook. No searching through every coat.",
      "That is why hash maps feel like magic in interviews. Whenever your code says \"for each item, search the whole array for something\", you can usually store what you have seen in a map or set and replace the search with one lookup. The slow inner loop disappears.",
      "Use a set when you only care whether something exists. Use a map when you need to remember something about it: its count, its index, or a list of related items. The price is memory, since you may store up to n extra entries.",
      "The real skill interviewers test is choosing the key. For anagrams the key is the sorted letters. For \"pairs that add up to a target\" the key is the number you still need. Once the key is right, the code is usually short.",
    ],
    deepDive: [
      {
        heading: "Pick the key, then the value",
        body: "Before writing code, ask: what question will I ask the map later? The thing you will know at that moment is the key, and the answer you want back is the value.\n\nIn Two Sum, at index i you know x and need to ask \"where is target - x?\", so the key is a number and the value is its index. In Group Anagrams you know a word and ask \"which group does it belong to?\", so the key is a canonical form of the word and the value is a list. In a frequency problem the key is the item and the value is its count.",
        bullets: ["Membership only: Set", "Counting: Map item to count", "Positions: Map value to index", "Grouping: Map canonical key to list"],
      },
      {
        heading: "Longest Consecutive Sequence in O(n)",
        body: "Given unsorted numbers, find the longest run of consecutive values like 1, 2, 3, 4. Sorting gives O(n log n). The hash set trick: put everything in a set, then only start counting from numbers that begin a run, meaning x - 1 is not in the set. From each start, walk x + 1, x + 2 and so on while they exist.\n\nIt looks like a nested loop, but each number is visited by an inner walk at most once, because only run starts launch a walk. Total work is O(n) time with O(n) space for the set.",
        visual: {
          type: "flow",
          title: "Longest run in [100, 4, 200, 1, 3, 2]",
          steps: [
            { label: "Build a set", detail: "All six numbers" },
            { label: "100 and 200", detail: "99 and 199 missing: runs of 1" },
            { label: "4, 3, 2", detail: "x - 1 is present: not a start, skip" },
            { label: "1", detail: "0 missing: walk 2, 3, 4" },
            { label: "Answer: 4", detail: "Each number walked at most once: O(n)" },
          ],
        },
      },
      {
        heading: "Counting idioms in Java",
        body: "Counting is the most common map job, so learn the short forms. map.merge(key, 1, Integer::sum) adds one and creates the entry if it is missing. map.getOrDefault(key, 0) reads a count safely. map.computeIfAbsent(key, k -> new ArrayList<>()).add(item) builds groups in one line.\n\nIf keys are lowercase letters, an int[26] array is faster and avoids boxing, which is Java wrapping each int in an Integer object. Two words are anagrams when their 26 counts match, which takes O(n) instead of sorting in O(n log n).",
      },
      {
        heading: "When hashing is the wrong tool",
        body: "Hash maps do not keep order. If you need the smallest key, a range of keys, or sorted output, use a TreeMap with O(log n) operations, or sort instead. If memory is tight and the array is already sorted, two pointers may give O(1) space.\n\nAlso remember the worst case. If many keys collide, lookups slow toward O(n). Since Java 8, HashMap turns long bucket chains into small balanced trees, so the worst case becomes about O(log n) for comparable keys. In an interview, \"O(1) average\" is the precise wording.",
        visual: {
          type: "compare",
          title: "HashMap vs TreeMap in Java",
          columns: [
            { title: "HashMap", points: ["get and put: O(1) average", "No key order", "Long buckets become trees since Java 8"] },
            { title: "TreeMap", points: ["get and put: O(log n)", "Keys kept sorted", "firstKey, floorKey, subMap for ranges"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Set, map or an array of counts?",
        columns: [
          { title: "HashSet", points: ["Answers: have I seen x?", "Contains Duplicate, visited checks", "O(1) average add and contains"] },
          { title: "HashMap", points: ["Answers: what do I know about x?", "Two Sum, frequencies, grouping", "O(1) average get and put"] },
          { title: "int[26] counts", points: ["Keys are letters or small integers", "Anagrams, Ransom Note", "Fastest, fixed O(1) space"] },
        ],
      },
    ],
    examples: [
      {
        title: "Longest Consecutive Sequence step by step",
        explanation: "Input [100, 4, 200, 1, 3, 2]. The set holds all six values. 100: is 99 present? No, so it starts a run; 101 is missing, length 1. 4: 3 is present, so skip. 200: run of length 1. 1: 0 is missing, so start; walk 2, 3, 4, then 5 is missing: length 4. 3 and 2 are skipped. Answer 4. Each number is touched a constant number of times: O(n) time, O(n) space.",
        code: {
          lang: "java",
          code: "int longestConsecutive(int[] nums) {\n    Set<Integer> set = new HashSet<>();\n    for (int x : nums) set.add(x);\n    int best = 0;\n    for (int x : set) {\n        if (set.contains(x - 1)) continue;   // not a run start\n        int len = 1;\n        while (set.contains(x + len)) len++;\n        best = Math.max(best, len);\n    }\n    return best;\n}",
        },
      },
      {
        title: "First unique character in a string",
        explanation: "For \"leetcode\", pass 1 counts letters: l = 1, e = 3, t = 1, c = 1, o = 1, d = 1. Pass 2 walks the string again and returns the first index whose count is 1, which is index 0 for 'l'. For \"aabb\" no letter has count 1, so return -1. Two passes over n characters give O(n) time, and the count array always has 26 slots, so space is O(1).",
        code: {
          lang: "java",
          code: "int firstUniqChar(String s) {\n    int[] count = new int[26];\n    for (char c : s.toCharArray()) count[c - 'a']++;\n    for (int i = 0; i < s.length(); i++) {\n        if (count[s.charAt(i) - 'a'] == 1) return i;\n    }\n    return -1;\n}",
        },
      },
    ],
    cheatSheet: [
      "HashSet: O(1) average add and contains. HashMap: O(1) average get and put.",
      "Count: map.merge(k, 1, Integer::sum)",
      "Group: map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)",
      "Letters only? Use int[26] with index c - 'a'.",
      "Need order or ranges? TreeMap gives O(log n) per operation.",
      "Prefix sum + map counts subarrays with sum k in O(n).",
      "Say \"O(1) average\"; collisions make the worst case slower.",
    ],
    quiz: [
      {
        q: "In Longest Consecutive Sequence, why skip x when x - 1 is in the set?",
        options: ["To save memory", "Because duplicates are not allowed", "Because x is not the start of a run, so a smaller start will count it", "To keep the set sorted"],
        answer: 2,
        why: "Only run starts launch a walk, which keeps the total work linear.",
      },
      {
        q: "Which structure answers \"what is the smallest key greater than 50?\" efficiently?",
        options: ["TreeMap", "HashMap", "HashSet", "int[26]"],
        answer: 0,
        why: "TreeMap keeps keys sorted and offers higherKey in O(log n).",
      },
      {
        q: "Checking whether two lowercase words are anagrams with int[26] counts costs:",
        options: ["O(n log n)", "O(n squared)", "O(1)", "O(n)"],
        answer: 3,
        why: "You read each character once and compare 26 fixed slots.",
      },
      {
        q: "What does map.merge(word, 1, Integer::sum) do?",
        options: ["Removes the word", "Adds 1 to the word's count, starting at 1 if missing", "Sorts the map", "Returns the word's hash code"],
        answer: 1,
        why: "merge inserts the value if the key is absent, otherwise combines old and new with the function.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Contains Duplicate: return true if any value appears at least twice in the array.",
        hint: "Set.add returns false when the value is already there.",
        solution: "boolean containsDuplicate(int[] nums) {\n    Set<Integer> seen = new HashSet<>();\n    for (int x : nums) {\n        if (!seen.add(x)) return true;\n    }\n    return false;  // O(n) time, O(n) space\n}",
      },
      {
        level: "medium",
        task: "Contains Duplicate II: return true if two equal values sit at indexes at most k apart.",
        hint: "Store each value's most recent index in a map.",
        solution: "boolean containsNearbyDuplicate(int[] nums, int k) {\n    Map<Integer, Integer> last = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        Integer j = last.put(nums[i], i);  // previous index or null\n        if (j != null && i - j <= k) return true;\n    }\n    return false;  // O(n) time, O(n) space\n}",
      },
      {
        level: "hard",
        task: "Top K Frequent Elements in O(n): return the k most frequent values without sorting all counts.",
        hint: "Count with a map, then bucket values by frequency. Frequencies only range from 1 to n.",
        solution: "List<Integer> topK(int[] nums, int k) {\n    Map<Integer, Integer> freq = new HashMap<>();\n    for (int x : nums) freq.merge(x, 1, Integer::sum);\n    List<List<Integer>> buckets = new ArrayList<>();\n    for (int i = 0; i <= nums.length; i++) buckets.add(new ArrayList<>());\n    freq.forEach((v, f) -> buckets.get(f).add(v));\n    List<Integer> out = new ArrayList<>();\n    for (int f = nums.length; f > 0 && out.size() < k; f--)\n        for (int v : buckets.get(f)) if (out.size() < k) out.add(v);\n    return out;  // O(n) time, O(n) space\n}",
      },
    ],
    faq: [
      { q: "Why is it O(1) if the map still has to compute a hash?", a: "Computing the hash takes the same time no matter how many entries the map holds, so it is constant with respect to n. For string keys hashing depends on string length, which is usually treated as small." },
      { q: "Can I use an int array as a HashMap key in Java?", a: "Not safely. Arrays use identity for equals and hashCode, so two arrays with the same contents are different keys. Convert to a String first, for example new String(sortedChars) or Arrays.toString(counts)." },
      { q: "Is a HashMap or sorting better in an interview?", a: "A HashMap usually gives better time, O(n) instead of O(n log n), but costs O(n) memory. Mention both and let the constraints decide." },
    ],
  },

  "dsa/two-pointers": {
    plain: [
      "Two pointers means using two index variables instead of one to walk through the data. Rather than checking every pair of positions with two nested loops, the pointers move in a smart way, so each step rules out many pairs at once. The result is usually O(n) instead of O(n squared).",
      "Picture two people searching a sorted bookshelf for two books whose prices add to 50. One starts at the cheap end, one at the expensive end. If the total is too high, the person at the expensive end steps left. Too low, the cheap end steps right. They never need to check every pair.",
      "A sliding window is two pointers that mark the start and end of a block of neighbouring items. You push the end forward to grab more, and pull the start forward when the block breaks a rule, like \"no repeated letters\". It moves along the array like a caterpillar.",
      "The key question is whether the answer is a contiguous block (use a window) or a pair chosen from anywhere in sorted data (use opposite ends). Once you spot which, the code follows a template you can reuse.",
    ],
    deepDive: [
      {
        heading: "Why moving one pointer is safe",
        body: "With sorted numbers and pointers at both ends, suppose nums[left] + nums[right] is bigger than the target. Pairing nums[right] with anything to the right of left gives an even bigger sum, because those values are larger. So nums[right] can never be part of an answer, and moving right inward throws away only useless pairs.\n\nThe same \"throw away a whole row of pairs\" argument proves Container With Most Water and Two Sum II. Saying this reasoning out loud shows the interviewer you understand why the algorithm is correct, not just that it passes tests.",
      },
      {
        heading: "Fixed windows",
        body: "When the window size k is given, you never shrink based on a rule. Add the new right element, remove the element that just fell off the left (index right - k), and record the answer once the window is full.\n\nThis turns \"the sum or average of every block of k\" from O(n × k) into O(n). The same shape solves \"find all anagrams of p inside s\": keep letter counts for the current k characters and compare them with the counts of p.",
        bullets: ["Add nums[right]", "If right >= k, remove nums[right - k]", "If right >= k - 1, record the answer"],
        visual: {
          type: "flow",
          title: "Max sum of k = 3 in [2, 1, 5, 1, 3]",
          steps: [
            { label: "First window", detail: "2 + 1 + 5 = 8" },
            { label: "Slide once", detail: "Add 1, drop 2: 7" },
            { label: "Slide again", detail: "Add 3, drop 1: 9" },
            { label: "Answer: 9", detail: "O(n), not O(n x k)" },
          ],
        },
      },
      {
        heading: "Shortest window: shrink while valid",
        body: "Some windows look for the shortest block that satisfies a rule, such as Minimum Window Substring (the smallest part of s containing all letters of t). The loop flips: expand right until the window is valid, then shrink left as far as possible while it stays valid, recording the size each time.\n\nTrack how many required characters are still missing in one counter, so the validity check is O(1) instead of comparing two count maps on every step. Total time is O(n + m) because each pointer only moves forward.",
      },
      {
        heading: "Counting subarrays with the at-most trick",
        body: "\"Count subarrays with exactly k distinct values\" is awkward with one window, because shrinking can break exactness. Instead, write atMost(k), which is easy: for each right, shrink until the window has at most k distinct values. Every subarray ending at right and starting between left and right is then valid, so add right - left + 1.\n\nFinally, exactly(k) = atMost(k) - atMost(k - 1). The same trick solves Binary Subarrays With Sum and Count Number of Nice Subarrays in O(n).",
        visual: {
          type: "flow",
          title: "The at-most trick",
          steps: [
            { label: "Write atMost(k)", detail: "Easy with one window" },
            { label: "Grow right", detail: "Add nums[right]" },
            { label: "Shrink left", detail: "Until at most k distinct values" },
            { label: "Count", detail: "Add right - left + 1" },
            { label: "Subtract", detail: "exactly(k) = atMost(k) - atMost(k - 1)" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Two Sum II on [1, 2, 4, 5, 7, 11], target 9",
        steps: [
          { label: "1 + 11 = 12", detail: "Too big: move right pointer left" },
          { label: "1 + 7 = 8", detail: "Too small: move left pointer right" },
          { label: "2 + 7 = 9", detail: "Found after 3 checks instead of 15 pairs" },
        ],
      },
      {
        type: "compare",
        title: "Longest window vs shortest window",
        columns: [
          { title: "Longest valid window", points: ["Expand right every step", "Shrink only while invalid", "Record after shrinking", "Longest Substring Without Repeats"] },
          { title: "Shortest valid window", points: ["Expand right until valid", "Shrink while still valid", "Record inside the shrink loop", "Minimum Window Substring"] },
        ],
      },
    ],
    examples: [
      {
        title: "Maximum average of 4 consecutive numbers",
        explanation: "nums = [1, 12, -5, -6, 50, 3], k = 4. The first window sums to 1 + 12 - 5 - 6 = 2. Slide: add 50, remove 1, sum = 51. Slide: add 3, remove 12, sum = 42. The best sum is 51, so the best average is 51 / 4 = 12.75. Each slide is two operations instead of re-adding k numbers: O(n) time, O(1) space.",
        code: {
          lang: "java",
          code: "double findMaxAverage(int[] nums, int k) {\n    int sum = 0;\n    for (int i = 0; i < k; i++) sum += nums[i];\n    int best = sum;\n    for (int r = k; r < nums.length; r++) {\n        sum += nums[r] - nums[r - k];\n        best = Math.max(best, sum);\n    }\n    return best / (double) k;\n}",
        },
      },
      {
        title: "3Sum without duplicate triplets",
        explanation: "Sort [-1, 0, 1, 2, -1, -4] into [-4, -1, -1, 0, 1, 2]. Fix -4: no pair reaches 4. Fix the first -1: pointers find pairs summing to 1, namely (-1, 2) and (0, 1). The next -1 equals the previous fixed value, so skip it to avoid repeats. After each found pair, move both pointers and skip equal neighbours. Result [[-1, -1, 2], [-1, 0, 1]]. Time O(n squared), extra space O(1) apart from sorting and output.",
        code: {
          lang: "java",
          code: "List<List<Integer>> threeSum(int[] a) {\n    Arrays.sort(a);\n    List<List<Integer>> res = new ArrayList<>();\n    for (int i = 0; i < a.length - 2; i++) {\n        if (i > 0 && a[i] == a[i - 1]) continue;\n        int l = i + 1, r = a.length - 1;\n        while (l < r) {\n            int s = a[i] + a[l] + a[r];\n            if (s < 0) l++;\n            else if (s > 0) r--;\n            else { res.add(List.of(a[i], a[l], a[r])); l++; r--;\n                   while (l < r && a[l] == a[l - 1]) l++; }\n        }\n    }\n    return res;\n}",
        },
      },
    ],
    cheatSheet: [
      "Sorted data + pair with a target: opposite-end pointers, O(n)",
      "Contiguous block + a rule: sliding window, O(n)",
      "Fixed window: add index right, remove index right - k",
      "Longest valid: shrink while invalid, then record",
      "Shortest valid: record and shrink while still valid",
      "Exactly k = atMost(k) - atMost(k - 1)",
      "Sum targets with negative numbers need prefix sums, not a window",
    ],
    quiz: [
      {
        q: "Sorted array, pointers at both ends, the sum is too small. What do you do?",
        options: ["Move the right pointer left", "Move the left pointer right", "Move both pointers", "Restart from the middle"],
        answer: 1,
        why: "Only a bigger left value can increase the sum.",
      },
      {
        q: "Why doesn't a sliding window work for \"subarray sum equals k\" when values can be negative?",
        options: ["Adding an element can decrease the sum, so you cannot tell whether to grow or shrink", "Windows only work on strings", "Negative numbers cannot be stored in a window", "It works fine with negatives"],
        answer: 0,
        why: "Windows need adding to only push one way; negatives break that, so use prefix sums with a map.",
      },
      {
        q: "How many subarrays end at index right inside a valid window [left, right]?",
        options: ["1", "right", "right - left + 1", "left + 1"],
        answer: 2,
        why: "Each start from left to right gives one subarray ending at right.",
      },
      {
        q: "In 3Sum, why skip a fixed value equal to the previous one?",
        options: ["To get below O(n squared)", "Because the array is unsorted", "To handle negative numbers", "It would produce the same triplets again"],
        answer: 3,
        why: "The same fixed value meets the same pairs, so it would only repeat answers.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Valid Palindrome: ignoring case and non-alphanumeric characters, check whether a string reads the same both ways, with O(1) extra space.",
        hint: "Skip non-alphanumeric characters on each side before comparing.",
        solution: "boolean isPalindrome(String s) {\n    int l = 0, r = s.length() - 1;\n    while (l < r) {\n        if (!Character.isLetterOrDigit(s.charAt(l))) l++;\n        else if (!Character.isLetterOrDigit(s.charAt(r))) r--;\n        else if (Character.toLowerCase(s.charAt(l++)) != Character.toLowerCase(s.charAt(r--)))\n            return false;\n    }\n    return true;  // O(n) time, O(1) space\n}",
      },
      {
        level: "medium",
        task: "Longest Repeating Character Replacement: s has uppercase letters and you may change up to k of them. Find the longest substring that can become one repeated letter.",
        hint: "A window is valid when its length minus the count of its most frequent letter is at most k.",
        solution: "int characterReplacement(String s, int k) {\n    int[] count = new int[26];\n    int left = 0, maxFreq = 0, best = 0;\n    for (int right = 0; right < s.length(); right++) {\n        maxFreq = Math.max(maxFreq, ++count[s.charAt(right) - 'A']);\n        while (right - left + 1 - maxFreq > k) count[s.charAt(left++) - 'A']--;\n        best = Math.max(best, right - left + 1);\n    }\n    return best;  // O(n) time, O(1) space\n}",
      },
      {
        level: "hard",
        task: "Minimum Window Substring: return the smallest substring of s that contains every character of t, including repeats, or \"\" if none exists.",
        hint: "Count needs from t, track how many characters are still missing, and shrink while nothing is missing.",
        solution: "String minWindow(String s, String t) {\n    int[] need = new int[128];\n    for (char c : t.toCharArray()) need[c]++;\n    int missing = t.length(), left = 0, start = 0, len = Integer.MAX_VALUE;\n    for (int right = 0; right < s.length(); right++) {\n        if (need[s.charAt(right)]-- > 0) missing--;\n        while (missing == 0) {\n            if (right - left + 1 < len) { len = right - left + 1; start = left; }\n            if (++need[s.charAt(left++)] > 0) missing++;\n        }\n    }\n    return len == Integer.MAX_VALUE ? \"\" : s.substring(start, start + len);\n}",
      },
    ],
    faq: [
      { q: "How do I know a problem needs a sliding window?", a: "Look for words like substring, subarray, contiguous or \"longest/shortest block\" together with a rule you can update as items enter and leave. If the chosen items do not have to be next to each other, a window is probably wrong." },
      { q: "Do I always have to sort before using two pointers?", a: "For opposite-end pair problems, yes, because the logic depends on sorted order. Sliding windows and fast/slow pointers do not need sorting." },
      { q: "Is the nested while loop inside a window really O(n)?", a: "Yes. The left pointer only moves forward and can move at most n times across the whole run, so the inner loop's total work is O(n)." },
    ],
  },

  "dsa/stacks": {
    plain: [
      "A stack works like a pile of plates. You put a plate on top and take a plate from the top, so the last one added is the first one out. A queue works like a line at a ticket counter: the first person to arrive is the first person served.",
      "Stacks are perfect when the most recent thing that is still \"open\" is the one you must deal with next. An opening bracket waits for its closing bracket. A function call waits for the calls it made to finish. An undo button reverses your latest action first.",
      "A monotonic stack is a stack you keep in sorted order by popping anything that would break the order before you push. Each pop is a moment of discovery: the popped item has just met the first element bigger (or smaller) than itself. That is how \"next greater\" problems become one pass.",
      "Queues shine when you must handle things in arrival order, like tasks or the levels of a tree in BFS. In Java, use ArrayDeque for both stacks and queues. The old Stack class still works, but it is slower and not recommended.",
    ],
    deepDive: [
      {
        heading: "Which monotonic stack do I need?",
        body: "Decide two things: which direction you look (next or previous) and what you look for (greater or smaller). For \"next greater\", keep the stack decreasing and pop while the current value is greater; each popped index has found its answer. For \"previous smaller\", keep the stack increasing; after popping, the top of the stack is the answer for the current index.\n\nStore indexes, not values, so you can compute distances and still read values through the array. For circular arrays, loop over 2n positions and use i % n.",
        bullets: ["Next greater: decreasing stack, answer on pop", "Previous smaller: increasing stack, answer is the top after popping", "Store indexes", "Circular: loop 2n times with i % n"],
        visual: {
          type: "compare",
          title: "Two common monotonic stacks",
          columns: [
            { title: "Next greater", points: ["Keep the stack decreasing", "Pop while the current value is greater", "Each popped index gets its answer"] },
            { title: "Previous smaller", points: ["Keep the stack increasing", "Pop while the top is not smaller", "Answer is the top after popping"] },
          ],
        },
      },
      {
        heading: "Largest Rectangle in Histogram",
        body: "Each bar can be the shortest bar of some rectangle. That rectangle stretches left to just after the previous shorter bar and right to just before the next shorter bar. An increasing stack finds both in one pass.\n\nWhen a bar shorter than the top arrives, pop the top. Its right boundary is the current index, and its left boundary is the new top of the stack. Width = i - newTop - 1, and area = height × width. A final pretend bar of height 0 flushes the stack. Every bar is pushed and popped once, so it runs in O(n).",
      },
      {
        heading: "Evaluating expressions with stacks",
        body: "In Reverse Polish Notation, like \"3 4 + 2 *\", read tokens left to right. Push numbers. On an operator, pop two numbers, apply it (the second one popped is the left side), and push the result. The final stack holds the answer.\n\nFor normal expressions with parentheses, such as Basic Calculator, push the current result and sign when you meet \"(\", start fresh inside, and on \")\" combine the inner result with what you popped. Decode String, \"3[a2[c]]\", uses the same push-on-open, combine-on-close shape.",
      },
      {
        heading: "Queues from stacks, and the monotonic deque",
        body: "A queue can be built from two stacks. Push into an in-stack. To pop, if the out-stack is empty, move everything from in to out, which reverses the order. Each element moves at most once, so every operation is O(1) amortised.\n\nSliding Window Maximum uses a deque (double-ended queue) kept in decreasing order of values. Before adding index i, pop smaller values from the back, since they can never be the maximum again. Pop the front if it has left the window. The front is always the current maximum, so the whole array takes O(n).",
        visual: {
          type: "flow",
          title: "A queue from two stacks",
          steps: [
            { label: "Push 1, 2, 3", detail: "All go on the in-stack" },
            { label: "First pop", detail: "Out-stack empty: move all, order flips" },
            { label: "Return 1", detail: "Oldest item is now on top of out" },
            { label: "Push 4", detail: "Goes on the in-stack" },
            { label: "Next pop", detail: "Out not empty: return 2" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Evaluating RPN: 3 4 + 2 *",
        steps: [
          { label: "Push 3", detail: "Stack [3]" },
          { label: "Push 4", detail: "Stack [3, 4]" },
          { label: "+ pops 4 and 3", detail: "Pushes 7: stack [7]" },
          { label: "Push 2", detail: "Stack [7, 2]" },
          { label: "* pops 2 and 7", detail: "Pushes 14: the answer" },
        ],
      },
      {
        type: "tree",
        title: "Stack and queue problem families",
        root: "Stack and queue patterns",
        children: [
          { label: "Matching", children: ["Valid Parentheses", "Remove Adjacent Duplicates"] },
          { label: "Monotonic stack", children: ["Daily Temperatures", "Largest Rectangle in Histogram"] },
          { label: "Expressions", children: ["Evaluate RPN", "Decode String"] },
          { label: "Queue and deque", children: ["BFS", "Sliding Window Maximum"] },
        ],
      },
    ],
    examples: [
      {
        title: "Next Greater Element for every value",
        explanation: "nums = [2, 1, 2, 4, 3]. i = 0 (2): push. i = 1 (1): smaller, push. i = 2 (2): pop index 1 (value 1), its answer is 2; the top now holds 2, not smaller, so push. i = 3 (4): pop both 2s, each gets 4; push. i = 4 (3): push. Indexes left on the stack get -1. Result [4, 2, 4, -1, -1]. O(n) time, O(n) space.",
        code: {
          lang: "java",
          code: "int[] nextGreater(int[] nums) {\n    int[] ans = new int[nums.length];\n    Arrays.fill(ans, -1);\n    Deque<Integer> stack = new ArrayDeque<>();  // indexes, values decreasing\n    for (int i = 0; i < nums.length; i++) {\n        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {\n            ans[stack.pop()] = nums[i];\n        }\n        stack.push(i);\n    }\n    return ans;\n}",
        },
      },
      {
        title: "A queue built from two stacks",
        explanation: "push 1 and push 2 go into in = [1, 2]. pop: out is empty, so move everything across; out now has 1 on top, and pop returns 1. push 3 goes into in. pop: out still holds 2, so return 2 without moving anything. pop: out is empty, move 3 across, return 3. Each element is moved once, so n operations cost O(n) in total.",
        code: {
          lang: "java",
          code: "class MyQueue {\n    private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();\n    void push(int x) { in.push(x); }\n    int pop() { peek(); return out.pop(); }\n    int peek() {\n        if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());\n        return out.peek();\n    }\n    boolean empty() { return in.isEmpty() && out.isEmpty(); }\n}",
        },
      },
    ],
    cheatSheet: [
      "Java stack or queue: Deque<Integer> d = new ArrayDeque<>(); push/pop/peek or offer/poll",
      "Brackets: push openers; on a closer, the top must be its match",
      "Next greater: decreasing stack of indexes, answer when popped",
      "Monotonic stack and deque problems are O(n): each index pushed and popped once",
      "Queue from two stacks: move in to out only when out is empty",
      "Sliding window max: decreasing deque, the front is the max",
      "RPN: pop b, pop a, push a op b",
    ],
    quiz: [
      {
        q: "In Next Greater Element with a decreasing stack, when does an index get its answer?",
        options: ["When it is pushed", "At the end of the loop", "When the stack is empty", "When it is popped by a larger value"],
        answer: 3,
        why: "The value that pops it is the first larger value to its right.",
      },
      {
        q: "Which Java class is recommended for a stack?",
        options: ["ArrayDeque", "Stack", "Vector", "LinkedHashMap"],
        answer: 0,
        why: "ArrayDeque is unsynchronised and fast; the Java docs recommend it over Stack.",
      },
      {
        q: "What does the RPN expression \"5 1 2 + 4 * + 3 -\" evaluate to?",
        options: ["12", "14", "17", "20"],
        answer: 1,
        why: "1 + 2 = 3, 3 × 4 = 12, 5 + 12 = 17, 17 - 3 = 14.",
      },
      {
        q: "What is the amortised cost of pop in a queue built from two stacks?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n squared)"],
        answer: 2,
        why: "Each element is moved from in to out at most once over its lifetime.",
      },
      {
        q: "In Sliding Window Maximum, why pop smaller values from the back of the deque?",
        options: ["They can never be the maximum while the newer, larger value is in the window", "To keep the deque short for no reason", "Because they are outside the window", "To sort the array"],
        answer: 0,
        why: "The newer, larger value will outlive them in the window, so they are useless.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Remove All Adjacent Duplicates in String: repeatedly delete pairs of equal neighbouring letters, so \"abbaca\" becomes \"ca\".",
        hint: "Use a StringBuilder as a stack: if its last char equals the current one, delete it; otherwise append.",
        solution: "String removeDuplicates(String s) {\n    StringBuilder sb = new StringBuilder();\n    for (char c : s.toCharArray()) {\n        int n = sb.length();\n        if (n > 0 && sb.charAt(n - 1) == c) sb.deleteCharAt(n - 1);\n        else sb.append(c);\n    }\n    return sb.toString();  // O(n) time, O(n) space\n}",
      },
      {
        level: "medium",
        task: "Evaluate Reverse Polish Notation for tokens like [\"2\", \"1\", \"+\", \"3\", \"*\"] (answer 9). Division truncates toward zero.",
        hint: "Pop b first, then a, and compute a op b.",
        solution: "int evalRPN(String[] tokens) {\n    Deque<Integer> st = new ArrayDeque<>();\n    for (String t : tokens) {\n        switch (t) {\n            case \"+\" -> st.push(st.pop() + st.pop());\n            case \"*\" -> st.push(st.pop() * st.pop());\n            case \"-\" -> { int b = st.pop(), a = st.pop(); st.push(a - b); }\n            case \"/\" -> { int b = st.pop(), a = st.pop(); st.push(a / b); }\n            default -> st.push(Integer.parseInt(t));\n        }\n    }\n    return st.pop();  // O(n) time and space\n}",
      },
      {
        level: "hard",
        task: "Largest Rectangle in Histogram: given bar heights, return the area of the largest rectangle.",
        hint: "Keep an increasing stack of indexes. When you pop a bar, its width runs from the new top + 1 to i - 1.",
        solution: "int largestRectangleArea(int[] h) {\n    Deque<Integer> st = new ArrayDeque<>();\n    int best = 0;\n    for (int i = 0; i <= h.length; i++) {\n        int cur = (i == h.length) ? 0 : h[i];\n        while (!st.isEmpty() && h[st.peek()] >= cur) {\n            int height = h[st.pop()], left = st.isEmpty() ? -1 : st.peek();\n            best = Math.max(best, height * (i - left - 1));\n        }\n        st.push(i);\n    }\n    return best;  // O(n) time, O(n) space\n}",
      },
    ],
    faq: [
      { q: "Why not use java.util.Stack?", a: "Stack extends Vector, so every method is synchronised and slower, and it exposes list methods that break the stack idea. ArrayDeque is faster and is what the Java docs recommend." },
      { q: "How do I recognise a monotonic stack problem?", a: "Phrases like next greater, next smaller, previous larger, days until warmer, or stock span are strong hints. So is any brute force that looks left or right from each element until something bigger appears." },
      { q: "Should I store values or indexes on the stack?", a: "Indexes, almost always. You can still read the value through the array, and you also get distances and widths, which many problems ask for." },
    ],
  },

  "dsa/linked-lists": {
    plain: [
      "A linked list is a chain of small boxes called nodes. Each node holds a value and an arrow pointing to the next node. Unlike an array, the nodes can live anywhere in memory. To reach the tenth node you must follow nine arrows from the start, which is called the head.",
      "Think of a treasure hunt where each clue tells you where the next clue is hidden. Adding a new clue in the middle is easy: change one arrow. But finding clue number 50 means walking through 49 clues first. That is the trade-off: cheap inserts, slow lookups.",
      "Linked list questions are really about careful arrow surgery. If you change node.next before saving where it pointed, the rest of the list is lost for good. So the golden habit is: save the next node in a variable first, then rewire.",
      "Draw it. Sketch three or four boxes with arrows and update them step by step as your code runs. Almost every linked list bug, like a null pointer or a lost node, shows up on paper in under a minute.",
    ],
    deepDive: [
      {
        heading: "Finding where a cycle starts",
        body: "Floyd's algorithm moves slow one step and fast two steps. If they meet, there is a cycle. To find the node where the cycle begins, reset one pointer to the head and move both one step at a time. They meet again exactly at the cycle start.\n\nWhy? Say the start is a steps from the head, they met b steps into the cycle, and the cycle has length c. Fast walked twice as far as slow, which works out to a = kc - b for some whole number k. So walking a more steps from the meeting point lands on the start, just like walking a steps from the head. O(n) time, O(1) space.",
      },
      {
        heading: "The gap trick for \"nth from the end\"",
        body: "You cannot walk backwards in a singly linked list, and counting the length first takes two passes. Instead, move a fast pointer n steps ahead, then move fast and slow together. When fast reaches the last node, slow sits right before the node to delete.\n\nStart both at a dummy node that points to the head. Then deleting the head itself needs no special case, and you return dummy.next at the end.",
        bullets: ["Dummy points to head", "Advance fast n steps", "Move both until fast.next is null", "slow.next = slow.next.next"],
        visual: {
          type: "flow",
          title: "Remove 2nd from end of 1, 2, 3, 4, 5",
          steps: [
            { label: "Start at dummy", detail: "dummy points to 1" },
            { label: "Advance fast 2", detail: "fast on node 2" },
            { label: "Move both", detail: "Until fast.next is null: fast 5, slow 3" },
            { label: "Unlink", detail: "slow.next = slow.next.next drops 4" },
            { label: "Return dummy.next", detail: "1, 2, 3, 5" },
          ],
        },
      },
      {
        heading: "Combining small tools: Reorder List",
        body: "Many hard-looking list problems are three easy ones glued together. Reorder List turns 1, 2, 3, 4, 5 into 1, 5, 2, 4, 3. Step one: find the middle with fast and slow pointers. Step two: reverse the second half. Step three: merge the two halves by alternating nodes.\n\nPalindrome Linked List uses the same first two steps, then compares the halves. If you can write middle, reverse and merge from memory, you can assemble a dozen problems in O(n) time and O(1) space.",
      },
      {
        heading: "LRU cache: a list plus a map",
        body: "An LRU (least recently used) cache evicts the item that was used longest ago. A hash map gives O(1) lookup by key. A doubly linked list, where nodes point both forwards and backwards, keeps items in usage order and can unlink any node in O(1) once you hold a reference to it.\n\nOn get, move the node to the front. On put, insert at the front, and if the cache is too big, remove the node at the back and delete its key from the map. Dummy head and tail nodes remove all null checks. Java's LinkedHashMap can do this for you, but interviewers usually want it by hand.",
        visual: {
          type: "tree",
          title: "LRU cache parts and moves",
          root: "LRU cache",
          children: [
            { label: "Hash map", children: ["key to node", "O(1) lookup"] },
            { label: "Doubly linked list", children: ["Most recent at the front", "Least recent at the back", "O(1) unlink"] },
            { label: "get(key)", children: ["Move node to the front"] },
            { label: "put(key, value)", children: ["Insert at the front", "Too big: drop back node and its key"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Reorder List: 1, 2, 3, 4, 5",
        steps: [
          { label: "Find middle", detail: "slow stops at 3" },
          { label: "Split", detail: "1, 2, 3 and 4, 5" },
          { label: "Reverse second half", detail: "5, 4" },
          { label: "Merge alternately", detail: "1, 5, 2, 4, 3" },
        ],
      },
      {
        type: "compare",
        title: "Array vs linked list",
        columns: [
          { title: "Array", points: ["Access by index: O(1)", "Insert in the middle: O(n), items shift", "Cache friendly: items side by side", "No extra memory per item"] },
          { title: "Linked list", points: ["Access by index: O(n), walk the chain", "Insert after a known node: O(1)", "Nodes scattered in memory", "Extra memory for each next pointer"] },
        ],
      },
    ],
    examples: [
      {
        title: "Remove the 2nd node from the end of 1, 2, 3, 4, 5",
        explanation: "dummy, 1, 2, 3, 4, 5. Move fast 2 steps from dummy: fast is at 2. Move both until fast.next is null: (slow 1, fast 3), (slow 2, fast 4), (slow 3, fast 5). Now slow is at 3 and slow.next is 4, the 2nd node from the end. Set 3.next = 5. Result 1, 2, 3, 5. One pass, O(1) extra space.",
        code: {
          lang: "java",
          code: "ListNode removeNthFromEnd(ListNode head, int n) {\n    ListNode dummy = new ListNode(0, head), fast = dummy, slow = dummy;\n    for (int i = 0; i < n; i++) fast = fast.next;\n    while (fast.next != null) {\n        fast = fast.next;\n        slow = slow.next;\n    }\n    slow.next = slow.next.next;\n    return dummy.next;\n}",
        },
      },
      {
        title: "Finding the start of a cycle",
        explanation: "List 1, 2, 3, 4, 5, and 5 points back to 3. Both pointers start at 1. Step 1: slow 2, fast 3. Step 2: slow 3, fast 5. Step 3: slow 4, fast 4, so they meet. Reset slow to the head (1) and keep fast at 4. Move both one step: slow 2, fast 5. Again: slow 3, fast 3. They meet at 3, the cycle start.",
        code: {
          lang: "java",
          code: "ListNode detectCycle(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow == fast) {\n            slow = head;\n            while (slow != fast) { slow = slow.next; fast = fast.next; }\n            return slow;\n        }\n    }\n    return null;\n}",
        },
      },
    ],
    cheatSheet: [
      "Save next before rewiring: ListNode nxt = cur.next;",
      "Dummy node before head removes head special cases; return dummy.next",
      "Middle: slow 1 step, fast 2; loop while fast != null && fast.next != null",
      "Cycle start: after meeting, reset one pointer to head and move both 1 step",
      "Nth from end: give fast an n-step head start",
      "Recursive list code uses O(n) stack; iterative uses O(1)",
      "LRU cache = HashMap + doubly linked list",
    ],
    quiz: [
      {
        q: "After fast and slow pointers meet inside a cycle, how do you find the cycle start?",
        options: ["Count the cycle length and stop", "Reset one pointer to the head and move both one step at a time", "Move fast three steps at a time", "Reverse the list"],
        answer: 1,
        why: "The distance from the head equals the distance from the meeting point to the start, modulo the cycle length.",
      },
      {
        q: "Why use a dummy node when removing the nth node from the end?",
        options: ["It makes the list circular", "It speeds up the loop", "Removing the head then needs no special case", "Java requires it"],
        answer: 2,
        why: "There is always a node before the one being removed, even when it is the head.",
      },
      {
        q: "What is the space cost of reversing a list recursively?",
        options: ["O(n) for the call stack", "O(1)", "O(log n)", "O(n squared)"],
        answer: 0,
        why: "There is one stack frame per node.",
      },
      {
        q: "Which pair of structures gives O(1) get and put for an LRU cache?",
        options: ["Array and stack", "Two queues", "TreeMap and array", "HashMap and doubly linked list"],
        answer: 3,
        why: "The map finds the node and the list moves or evicts it in constant time.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Merge Two Sorted Lists into one sorted list by splicing the existing nodes together.",
        hint: "Use a dummy node and a tail pointer; attach the smaller head each time.",
        solution: "ListNode merge(ListNode a, ListNode b) {\n    ListNode dummy = new ListNode(0), tail = dummy;\n    while (a != null && b != null) {\n        if (a.val <= b.val) { tail.next = a; a = a.next; }\n        else { tail.next = b; b = b.next; }\n        tail = tail.next;\n    }\n    tail.next = (a != null) ? a : b;\n    return dummy.next;  // O(n + m) time, O(1) space\n}",
      },
      {
        level: "medium",
        task: "Palindrome Linked List: decide whether the values read the same both ways, in O(n) time and O(1) extra space.",
        hint: "Find the middle, reverse the second half, then compare the two halves.",
        solution: "boolean isPalindrome(ListNode head) {\n    ListNode slow = head, fast = head;\n    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }\n    ListNode prev = null;\n    while (slow != null) { ListNode nxt = slow.next; slow.next = prev; prev = slow; slow = nxt; }\n    for (ListNode a = head, b = prev; b != null; a = a.next, b = b.next) {\n        if (a.val != b.val) return false;\n    }\n    return true;\n}",
      },
      {
        level: "hard",
        task: "Design an LRU cache with get(key) and put(key, value), both in O(1).",
        hint: "HashMap from key to node; doubly linked list with dummy head and tail, most recent at the front.",
        solution: "class Node { int key, val; Node prev, next; }\nMap<Integer, Node> map; dummy head and tail linked to each other.\nremove(n): n.prev.next = n.next; n.next.prev = n.prev.\naddFront(n): n.next = head.next; n.prev = head; head.next.prev = n; head.next = n.\nget(k): missing -> -1; else remove(node), addFront(node), return node.val.\nput(k, v): present -> update val, remove, addFront.\n  else create node, addFront, map.put(k, node);\n  if map.size() > capacity: lru = tail.prev; remove(lru); map.remove(lru.key).\nAll steps are pointer changes or map calls: O(1) time, O(capacity) space.",
      },
    ],
    faq: [
      { q: "Are linked lists used in real Java code?", a: "Rarely directly. ArrayList is faster for almost everything because of memory locality, but linked structures sit inside LinkedHashMap, LRU caches and many queues, and they are a favourite way to test pointer reasoning." },
      { q: "Do I need to write the ListNode class in an interview?", a: "Usually the platform provides it. If not, write a short class with int val, ListNode next and a constructor before you start." },
      { q: "Should I write list solutions iteratively or recursively?", a: "Iterative is safer for long lists because recursion uses O(n) stack and can overflow. Recursion is fine if it is clearer, but mention the stack cost." },
    ],
  },

  "dsa/binary-search": {
    plain: [
      "Binary search is the \"guess the number\" game played perfectly. Someone picks a number from 1 to 100. You guess 50. \"Too high.\" Now you know it is between 1 and 49, so you guess 25. Every guess throws away half of what is left. Even a million options need only about 20 guesses.",
      "It only works when the data has an order you can trust. In a sorted array, if the middle value is too small, everything to its left is too small as well. That certainty is what lets you throw half away without looking at it.",
      "The surprise for many beginners is that binary search is not only for arrays. If you can ask a yes or no question like \"can I finish in time at speed k?\", and the answers go no, no, no, yes, yes, yes as k grows, you can binary search for the first yes.",
      "The hard part is not the idea but the details: where the range starts and ends, whether to use < or <=, and whether to move to mid or mid + 1. Pick one template, understand why it works, and use it everywhere.",
    ],
    deepDive: [
      {
        heading: "Think in invariants, not in plus or minus one",
        body: "An invariant is a fact your loop keeps true on every step. For the first-true template, the fact is: the answer is always inside [lo, hi]. If ok(mid) is true, the answer could be mid itself, so hi = mid. If it is false, the answer is further right, so lo = mid + 1. The loop runs while lo < hi and stops when they meet on the answer.\n\nBecause mid = lo + (hi - lo) / 2 rounds down, mid is always less than hi, so the range shrinks every step and the loop cannot run forever. Writing it this way instead of (lo + hi) / 2 also avoids int overflow in Java.",
        bullets: ["Answer always in [lo, hi]", "ok(mid): hi = mid", "not ok(mid): lo = mid + 1", "mid = lo + (hi - lo) / 2"],
      },
      {
        heading: "First and last position of a value",
        body: "To find where target starts in a sorted array, search for the first index with nums[i] >= target. That is often called lower bound. To find where it ends, search for the first index with nums[i] > target and subtract one.\n\nThe same helper answers \"how many times does target appear?\" (upper minus lower), \"where would it be inserted?\" (lower bound) and \"what is the closest value?\" (check lower bound and the index before it). Starting hi at nums.length lets the search answer \"after the last element\" when every value is smaller.",
        visual: {
          type: "flow",
          title: "Target 2 in [1, 2, 2, 2, 3]",
          steps: [
            { label: "Lower bound", detail: "First nums[i] >= 2: index 1" },
            { label: "Upper bound", detail: "First nums[i] > 2: index 4" },
            { label: "Last position", detail: "4 - 1 = index 3" },
            { label: "Count", detail: "4 - 1 = 3 copies" },
          ],
        },
      },
      {
        heading: "Rotated sorted arrays",
        body: "A rotated array like [4, 5, 6, 7, 0, 1, 2] is two sorted pieces. At any mid, at least one half is fully sorted. Compare nums[lo] with nums[mid]: if nums[lo] <= nums[mid], the left half is sorted.\n\nThen ask whether target lies inside that sorted half's range. If yes, search there; otherwise search the other half. Each step still discards half, so it stays O(log n). To find the minimum instead, compare nums[mid] with nums[hi]: if nums[mid] > nums[hi], the minimum is to the right of mid.",
      },
      {
        heading: "Binary search on the answer",
        body: "Many \"minimise the maximum\" or \"find the smallest capacity\" problems hide a binary search. In Capacity to Ship Packages Within D Days, the answer lies between the heaviest package (anything smaller cannot carry it) and the total weight (ships everything in one day). For a guessed capacity, a greedy O(n) pass counts the days needed. If that is at most D, the capacity works, and so does anything larger.\n\nThat monotonic yes or no lets you binary search the capacity in O(n log S), where S is the total weight.",
        bullets: ["Find the lowest and highest possible answer", "Write feasible(x) as a greedy check", "Confirm feasibility is monotonic", "Binary search for the first feasible x"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Searching for 0 in [4, 5, 6, 7, 0, 1, 2]",
        steps: [
          { label: "mid = 3, value 7", detail: "Left half 4..7 is sorted; 0 is not inside" },
          { label: "Search right: lo = 4", detail: "Remaining values [0, 1, 2]" },
          { label: "mid = 5, value 1", detail: "Left part 0..1 is sorted; 0 is inside" },
          { label: "Search left: hi = 4", detail: "Only index 4 remains" },
          { label: "Check index 4", detail: "Value 0: found in 3 looks" },
        ],
      },
    ],
    examples: [
      {
        title: "First and last position of 8 in [5, 7, 7, 8, 8, 10]",
        explanation: "lowerBound(8): lo = 0, hi = 6. mid 3 holds 8 >= 8, so hi = 3. mid 1 holds 7, so lo = 2. mid 2 holds 7, so lo = 3. Stop: first = 3. lowerBound(9) returns 5, the first value >= 9, so last = 5 - 1 = 4. Answer [3, 4]. If first is out of range or does not hold 8, return [-1, -1]. Two O(log n) searches.",
        code: {
          lang: "java",
          code: "int lowerBound(int[] a, int target) {  // first i with a[i] >= target\n    int lo = 0, hi = a.length;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] >= target) hi = mid;\n        else lo = mid + 1;\n    }\n    return lo;\n}\n\nint[] searchRange(int[] a, int t) {\n    int first = lowerBound(a, t);\n    if (first == a.length || a[first] != t) return new int[]{-1, -1};\n    return new int[]{first, lowerBound(a, t + 1) - 1};\n}",
        },
      },
      {
        title: "Ship weights 1 to 10 within 5 days",
        explanation: "lo = 10 (heaviest), hi = 55 (total). Try 32: needs 2 days, fits, hi = 32. Try 21: 3 days, hi = 21. Try 15: [1..5], [6, 7], [8], [9], [10] is 5 days, hi = 15. Try 12: 6 days, too many, lo = 13. Try 14: still 6 days, lo = 15. lo meets hi at 15, the smallest capacity that works.",
        code: {
          lang: "java",
          code: "int shipWithinDays(int[] w, int days) {\n    int lo = 0, hi = 0;\n    for (int x : w) { lo = Math.max(lo, x); hi += x; }\n    while (lo < hi) {\n        int cap = lo + (hi - lo) / 2, need = 1, load = 0;\n        for (int x : w) {\n            if (load + x > cap) { need++; load = 0; }\n            load += x;\n        }\n        if (need <= days) hi = cap; else lo = cap + 1;\n    }\n    return lo;  // O(n log S) time, O(1) space\n}",
        },
      },
    ],
    cheatSheet: [
      "mid = lo + (hi - lo) / 2 avoids int overflow",
      "First true: if ok(mid) hi = mid else lo = mid + 1; loop while lo < hi",
      "Lower bound = first index with a[i] >= x; start hi at a.length",
      "Last position of x = lowerBound(x + 1) - 1",
      "Rotated array: one half around mid is always sorted",
      "On the answer: range [min possible, max possible] + monotonic feasible(x)",
      "Cost: O(log of range × cost of one check)",
    ],
    quiz: [
      {
        q: "Why write mid = lo + (hi - lo) / 2 in Java?",
        options: ["It is faster", "lo + hi can overflow int for large values", "It rounds up", "The compiler requires it"],
        answer: 1,
        why: "hi - lo always fits, while lo + hi can exceed Integer.MAX_VALUE.",
      },
      {
        q: "In a rotated sorted array, if nums[lo] <= nums[mid], what do you know?",
        options: ["The right half is sorted", "The array is not rotated", "The target is at mid", "The left half lo..mid is sorted"],
        answer: 3,
        why: "No rotation point falls between lo and mid, so that part is in order.",
      },
      {
        q: "In a Koko-style search, feasibility goes no, no, yes, yes as speed grows. Which speed do you return?",
        options: ["The first yes", "The last no", "The middle value", "Any yes"],
        answer: 0,
        why: "The problem asks for the minimum speed that still works.",
      },
      {
        q: "In Capacity to Ship Packages, what is the lowest capacity worth trying?",
        options: ["1", "The average weight", "The heaviest single package", "The total weight"],
        answer: 2,
        why: "Any smaller capacity could never carry the heaviest package.",
      },
      {
        q: "lowerBound returns a.length. What does that mean?",
        options: ["The array must be empty", "Every element is smaller than the target", "The target is the first element", "There is a bug"],
        answer: 1,
        why: "No index holds a value >= target, so the insert position is after the end.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Search Insert Position: return the index of target in a sorted array, or the index where it would be inserted.",
        hint: "This is exactly lower bound.",
        solution: "int searchInsert(int[] a, int target) {\n    int lo = 0, hi = a.length;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] >= target) hi = mid; else lo = mid + 1;\n    }\n    return lo;  // O(log n) time, O(1) space\n}",
      },
      {
        level: "medium",
        task: "Find Minimum in Rotated Sorted Array (no duplicates) in O(log n).",
        hint: "Compare nums[mid] with nums[hi].",
        solution: "int findMin(int[] a) {\n    int lo = 0, hi = a.length - 1;\n    while (lo < hi) {\n        int mid = lo + (hi - lo) / 2;\n        if (a[mid] > a[hi]) lo = mid + 1;  // min is right of mid\n        else hi = mid;                      // mid could be the min\n    }\n    return a[lo];\n}",
      },
      {
        level: "hard",
        task: "Split Array Largest Sum: split nums into k non-empty contiguous parts so that the largest part sum is as small as possible.",
        hint: "Binary search the largest allowed sum, and greedily count how many parts that limit needs.",
        solution: "int splitArray(int[] nums, int k) {\n    long lo = 0, hi = 0;\n    for (int x : nums) { lo = Math.max(lo, x); hi += x; }\n    while (lo < hi) {\n        long mid = lo + (hi - lo) / 2, sum = 0; int parts = 1;\n        for (int x : nums) {\n            if (sum + x > mid) { parts++; sum = 0; }\n            sum += x;\n        }\n        if (parts <= k) hi = mid; else lo = mid + 1;\n    }\n    return (int) lo;  // O(n log S) time, O(1) space\n}",
      },
    ],
    faq: [
      { q: "Should I use lo <= hi or lo < hi?", a: "Either works if you stay consistent. lo <= hi suits exact-match searches that return mid; lo < hi with hi = mid suits \"first index where something is true\". Mixing parts of both templates causes infinite loops." },
      { q: "Can I just use Arrays.binarySearch?", a: "For a plain lookup, yes, and mentioning it is good. But with duplicates it may return any matching index, not the first, and interviewers usually want you to write the search yourself." },
      { q: "How do I spot binary search on the answer?", a: "Look for \"minimum possible maximum\", \"smallest speed, capacity or days such that\", or a huge answer range with a check you can run in O(n). If a bigger answer always stays valid, you can binary search it." },
    ],
  },
};

export default extra;
