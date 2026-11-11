import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-backtracking-bits/backtracking": {
    plain: [
      "Imagine trying every outfit you could make from your clothes. You pick a shirt, then trousers, then shoes. After you look at one outfit, you take the shoes off and try other shoes. When all shoes are tried, you change the trousers. That habit of trying, undoing and trying the next thing is backtracking.",
      "In code, backtracking builds an answer one choice at a time. The choices made so far are called the path. When the path is complete, you save a copy of it. Then you undo the last choice and try the next option at that step.",
      "The same pattern answers many \"list them all\" questions: every subset of a set, every ordering of some items (a permutation), every group of k items (a combination), or every way to reach a target sum.",
      "These answers can be huge in number. A set of 20 items has over a million subsets, and 10 items can be ordered in over 3.6 million ways. So backtracking is for small inputs, and its main skill is not wasting time on paths that cannot work.",
    ],
    deepDive: [
      {
        heading: "One template, three shapes",
        body: "Every backtracking function has the same skeleton: if the path is complete, record a copy; otherwise loop over the options for the next step, and for each one choose it (append to path), explore (recurse), and unchoose (pop). What changes between problems is what counts as an option.\n\nFor subsets and combinations, order does not matter, so you pass a start index and only consider items after the last one picked. That stops [1, 2] and [2, 1] both appearing. For permutations, order matters, so every unused item is an option at every step, and a used list (or set) remembers what is already in the path.\n\nRecording happens at different moments too: subsets record at every node of the tree, combinations only when the path has k items, permutations only when it has n items.",
        visual: {
          type: "compare",
          title: "What changes between the three",
          columns: [
            { title: "Subsets", points: ["Options: items after start", "Record at every call", "2^n results"] },
            { title: "Combinations of k", points: ["Options: items after start", "Record when len(path) == k", "C(n, k) results"] },
            { title: "Permutations", points: ["Options: any unused item", "Record when len(path) == n", "n! results"] },
          ],
        },
      },
      {
        heading: "How much work is it really?",
        body: "The run time is roughly the number of results times the cost to copy each one. Subsets: 2^n results, each copied in O(n), so O(n x 2^n). Permutations: n! results, so O(n x n!). Combinations of k: C(n, k) results, each of length k, so O(k x C(n, k)).\n\nThose numbers grow terrifyingly fast. 2^20 = 1,048,576 subsets is fine in Python. 2^30 is about a billion, which is not. 10! = 3,628,800 permutations takes a few seconds; 12! = 479,001,600 is far too many. So when a problem says n <= 15 or n <= 20, that is a strong hint that exponential search is the intended solution.\n\nThe recursion depth equals the path length, at most n, so Python's recursion limit is rarely a problem here.",
        bullets: ["n <= 20: 2^n search is fine", "n <= 10: n! search is fine", "Depth = length of the path"],
      },
      {
        heading: "Skipping duplicate answers",
        body: "With input [1, 2, 2], picking \"the first 2\" or \"the second 2\" gives the same subset, so naive code prints duplicates. The fix has two parts. First, sort the input so equal values sit next to each other. Second, at one level of the loop, skip a value equal to the one just tried: if i > start and nums[i] == nums[i - 1], continue. You may still use both 2s in one path (going deeper), but you never start the same branch twice at the same depth.\n\nFor permutations with duplicates, the rule is: skip nums[i] if it equals nums[i - 1] and nums[i - 1] is not currently used. This forces equal values to be placed in their original order, so each distinct ordering appears once.",
        visual: {
          type: "tree",
          title: "Subsets of [1, 2, 2]: branches at the first level",
          root: "[] (start = 0)",
          children: [
            { label: "Pick 1", children: ["[1, 2]", "[1, 2, 2]"] },
            { label: "Pick first 2", children: ["[2, 2]"] },
            { label: "Pick second 2", children: ["Skipped: same value as the 2 just tried"] },
          ],
        },
      },
      {
        heading: "Combination sum and pruning by order",
        body: "Combination sum asks for every list of candidates (each usable many times) that adds up to a target. Reuse is a one-character change: recurse with i instead of i + 1, so the same item can be picked again but earlier items cannot come back.\n\nSorting helps a second time here. If the candidates are sorted and candidates[i] is already bigger than the remaining amount, every later candidate is bigger too, so you can break out of the loop instead of just skipping one item. This simple prune often cuts the search by a large factor.\n\nIf each candidate may be used only once and the input has duplicates (combination sum II), combine both rules: recurse with i + 1 and skip equal neighbours at the same depth.",
        bullets: ["Reuse allowed: recurse with i", "Use once: recurse with i + 1", "Sorted input: break when the item exceeds what is left"],
      },
      {
        heading: "Backtracking in real Python code",
        body: "For plain generation, the standard library already does the job in fast C code: itertools.combinations(items, k), itertools.permutations(items), and itertools.product(options, repeat=n). Subsets can be built by chaining combinations for every size.\n\nWrite your own backtracking when you need rules applied during generation, such as \"the sum may not exceed the target\" or \"no two neighbours may be equal\". Filtering itertools output after the fact visits every candidate, while a hand-written search can cut a branch the moment it breaks a rule.\n\nTwo habits prevent most bugs. Append path[:] (a copy), never path itself, because the list keeps changing. And undo exactly what you did, in reverse order, right after the recursive call.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Choose, explore, unchoose",
        steps: [
          { label: "Choose", detail: "path.append(option)" },
          { label: "Explore", detail: "Recurse to the next step." },
          { label: "Unchoose", detail: "path.pop() restores the state." },
          { label: "Next option", detail: "Loop to the next candidate." },
        ],
      },
      {
        type: "tree",
        title: "Permutations of [1, 2, 3]",
        root: "[]",
        children: [
          { label: "1 first", children: ["[1, 2, 3]", "[1, 3, 2]"] },
          { label: "2 first", children: ["[2, 1, 3]", "[2, 3, 1]"] },
          { label: "3 first", children: ["[3, 1, 2]", "[3, 2, 1]"] },
        ],
      },
    ],
    examples: [
      {
        title: "Combination sum",
        explanation: "Candidates [2, 3, 6, 7], target 7, each candidate usable many times. Step 1: sort. Step 2: from the start index, try each candidate; if it is larger than what remains, stop the loop. Step 3: recurse with the same index so it can be reused. Trace: 2, 2, 2 leaves 1, and 2 > 1, so back up; 2, 2, 3 hits 0, record it; 7 alone hits 0, record it. The answer is [[2, 2, 3], [7]].",
        code: {
          lang: "python",
          code: `def combination_sum(cands, target):
    cands.sort()
    out, path = [], []
    def go(start, remain):
        if remain == 0:
            out.append(path[:]); return
        for i in range(start, len(cands)):
            if cands[i] > remain: break   # sorted: the rest are bigger too
            path.append(cands[i])
            go(i, remain - cands[i])      # i, not i + 1: reuse allowed
            path.pop()
    go(0, target)
    return out

print(combination_sum([2, 3, 6, 7], 7))  # [[2, 2, 3], [7]]`,
        },
      },
      {
        title: "Subsets without duplicates",
        explanation: "Input [2, 1, 2]. Sorting gives [1, 2, 2]. This version records the path at every call, which lists every subset exactly once. The skip rule i > start and nums[i] == nums[i - 1] stops the second 2 from starting a branch the first 2 already started at the same depth. Result: [], [1], [1, 2], [1, 2, 2], [2], [2, 2], which is 6 subsets instead of 8.",
        code: {
          lang: "python",
          code: `def subsets_with_dup(nums):
    nums.sort()
    out, path = [], []
    def go(start):
        out.append(path[:])               # every node is a subset
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue                  # same value at the same depth
            path.append(nums[i]); go(i + 1); path.pop()
    go(0)
    return out

print(subsets_with_dup([2, 1, 2]))
# [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]`,
        },
      },
    ],
    cheatSheet: [
      "Template: if done, record path[:]; else for each option: choose, recurse, unchoose",
      "Subsets O(n x 2^n), permutations O(n x n!), combinations O(k x C(n, k))",
      "Order does not matter: pass a start index; order matters: keep a used list",
      "Duplicates: sort, then skip if i > start and nums[i] == nums[i - 1]",
      "Reuse allowed: recurse with i; use once: recurse with i + 1",
      "Sorted candidates: break (not continue) when one is larger than what remains",
      "itertools.combinations, permutations and product cover plain generation",
      "n <= 20 in the constraints often signals exponential search",
    ],
    quiz: [
      {
        q: "How many permutations does [1, 2, 3, 4] have?",
        options: ["16", "12", "4", "24"],
        answer: 3,
        why: "4! = 4 x 3 x 2 x 1 = 24.",
      },
      {
        q: "Your results list ends up full of empty lists. What is the most likely bug?",
        options: ["The base case is missing", "You appended path instead of path[:]", "The input was not sorted", "You recursed with i instead of i + 1"],
        answer: 1,
        why: "Every entry is the same list object, which is empty again after all the pops.",
      },
      {
        q: "In combination sum where each candidate can be reused, what index do you pass to the recursive call?",
        options: ["i", "i + 1", "0", "start + 1"],
        answer: 0,
        why: "Passing i allows the same candidate again while still blocking earlier ones.",
      },
      {
        q: "How many distinct subsets does [1, 2, 2] have?",
        options: ["8", "4", "6", "7"],
        answer: 2,
        why: "The value 2 can appear 0, 1 or 2 times and 1 can appear 0 or 1 times: 3 x 2 = 6.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write combine(n, k) that returns every combination of k numbers from 1 to n. Example: combine(4, 2) has 6 lists.",
        hint: "Use a start number and record when the path has k items.",
        solution: `def combine(n, k):
    out, path = [], []
    def go(start):
        if len(path) == k:
            out.append(path[:]); return
        for x in range(start, n + 1):
            path.append(x); go(x + 1); path.pop()
    go(1)
    return out
print(combine(4, 2))  # [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]`,
      },
      {
        level: "medium",
        task: "Return all distinct permutations of a list that may contain duplicates. Example: [1, 1, 2] gives 3 permutations.",
        hint: "Sort, keep a used list, and skip nums[i] when it equals nums[i - 1] and nums[i - 1] is not used.",
        solution: `def permute_unique(nums):
    nums.sort()
    out, path, used = [], [], [False] * len(nums)
    def go():
        if len(path) == len(nums): out.append(path[:]); return
        for i, x in enumerate(nums):
            if used[i] or (i and x == nums[i - 1] and not used[i - 1]): continue
            used[i] = True; path.append(x); go(); path.pop(); used[i] = False
    go()
    return out
print(permute_unique([1, 1, 2]))  # [[1, 1, 2], [1, 2, 1], [2, 1, 1]]`,
      },
      {
        level: "hard",
        task: "Return every way to split a string into pieces that are all palindromes. Example: \"aab\" gives [[\"a\", \"a\", \"b\"], [\"aa\", \"b\"]].",
        hint: "At each start index, try every end index whose piece is a palindrome, then recurse after it.",
        solution: `def partition(s):
    out, path = [], []
    def go(start):
        if start == len(s): out.append(path[:]); return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece == piece[::-1]:
                path.append(piece); go(end); path.pop()
    go(0)
    return out
print(partition("aab"))  # [['a', 'a', 'b'], ['aa', 'b']]`,
      },
    ],
    faq: [
      { q: "What is the difference between backtracking and recursion?", a: "Recursion is the tool: a function calling itself. Backtracking is a strategy that uses recursion to build choices step by step and undo them to try alternatives." },
      { q: "Is backtracking the same as DFS?", a: "Backtracking is a depth-first search over the tree of choices. The difference is mostly in wording: DFS usually walks an existing graph, while backtracking builds the tree as it goes and prunes it." },
      { q: "When should I use itertools instead of writing backtracking?", a: "Use itertools when you need every combination or permutation with no extra rules. Write backtracking when rules can cut branches early, because filtering itertools output still visits every candidate." },
    ],
  },

  "dsa-backtracking-bits/constraint-search": {
    plain: [
      "Some puzzles have rules that every answer must follow. In Sudoku, each row, column and 3 x 3 box must contain the digits 1 to 9 once. In N-Queens, no two queens on a chessboard may attack each other. These rules are called constraints.",
      "You can solve such puzzles by backtracking: fill one spot, move to the next, and undo when you get stuck. The key trick is to check the rules immediately after every move. If a move already breaks a rule, there is no point exploring anything after it.",
      "Throwing away a whole branch of choices at once is called pruning, like cutting a dead branch off a tree. Good pruning is the difference between a solver that finishes in milliseconds and one that would run for years.",
      "Three things make pruning work well: checking rules in O(1) with sets or bitmasks, choosing the hardest spot to fill first, and remembering to undo every change when you step back.",
    ],
    deepDive: [
      {
        heading: "N-Queens: why r - c and r + c",
        body: "Place one queen per row, so rows never clash. Columns are easy: keep a set of used columns. For diagonals, notice that along a down-right diagonal both row and column grow by 1, so r - c stays the same. Along a down-left diagonal, r + c stays the same. Each diagonal therefore has one number, and a set lookup checks it in O(1).\n\nThe counts are well known: n = 1 has 1 solution, n = 2 and 3 have none, n = 4 has 2, n = 8 has 92 and n = 10 has 724. Symmetry can halve the work: count solutions with the first queen in the left half of row 0, double it, and handle the middle column separately when n is odd.\n\nFor more speed, replace the three sets with three integers used as bitmasks. Then the free squares in a row are one expression: ~(cols | d1 | d2) & ((1 << n) - 1).",
        bullets: ["Column: c; diagonals: r - c and r + c", "Solutions: n=4 has 2, n=8 has 92, n=10 has 724", "Bitmask version: shift the diagonal masks by one each row"],
      },
      {
        heading: "Word search on a grid",
        body: "To find a word in a letter grid by moving up, down, left or right without reusing a cell, start a DFS from every cell that matches the first letter. At each step, check bounds and the next letter before going further, which is the pruning. Mark the current cell as used (for example, overwrite it with \"#\") and put the letter back when the call returns.\n\nThe worst case is O(R x C x 4 x 3^(L - 1)) for a word of length L: 4 directions for the first step, then at most 3, since you cannot go back to the cell you came from. Cheap pre-checks help in practice: if the grid has fewer copies of some letter than the word needs, return False at once. If the last letter is rarer than the first, search for the reversed word, so the search fails sooner.\n\nTo look for many words at once, put them in a trie and walk the trie during the DFS.",
        visual: {
          type: "flow",
          title: "One DFS step in word search",
          steps: [
            { label: "Check cell", detail: "In bounds and equals word[i]?" },
            { label: "Mark", detail: "board[r][c] = \"#\"" },
            { label: "Try neighbours", detail: "Four directions, index i + 1." },
            { label: "Restore", detail: "Put the letter back." },
            { label: "Return", detail: "True if any neighbour finished the word." },
          ],
        },
      },
      {
        heading: "Sudoku: constant-time checks and the hardest cell first",
        body: "Keep three lists of sets: digits used in each row, each column and each box. The box of cell (r, c) is r // 3 * 3 + c // 3, a number from 0 to 8. Placing a digit adds it to three sets; undoing removes it from the same three. Checking a digit is three set lookups.\n\nA plain solver fills cells in reading order. A much faster one picks the empty cell with the fewest legal digits each time. This is the minimum remaining values (MRV) heuristic, also called most constrained first. A cell with one option is filled with no guessing, and a cell with zero options proves the current path is dead immediately. Real solvers add constraint propagation: after each placement, remove that digit from the options of every cell it affects, which often solves easy puzzles with no backtracking at all.",
        bullets: ["Box index: r // 3 * 3 + c // 3", "MRV: branch on the cell with the fewest options", "Zero options anywhere: backtrack now"],
      },
      {
        heading: "A toolbox of pruning ideas",
        body: "Feasibility checks reject a partial answer that already breaks a rule. Bounds reject a partial answer that cannot beat the best one found so far; this is called branch and bound, and it is how many optimisation searches stay fast. Ordering helps in two ways: branch on the most constrained variable, and try the most promising value first so a good bound appears early.\n\nSymmetry breaking avoids exploring mirror images of the same answer. For example, when splitting numbers into k equal buckets, putting the first number into bucket 1 or bucket 2 is the same thing, so only ever try one empty bucket.\n\nWhen a search keeps meeting the same sub-state, memoise it, and the backtracking turns into DP. For industrial-size constraint problems, people reach for dedicated solvers such as Google OR-Tools' CP-SAT instead of hand-written search.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Pruning techniques",
        root: "Cut the search",
        children: [
          { label: "Feasibility", children: ["Reject a move that breaks a rule", "Check with sets or bitmasks in O(1)"] },
          { label: "Bounds", children: ["Stop if it cannot beat the best so far", "Branch and bound"] },
          { label: "Ordering", children: ["Most constrained variable first", "Most promising value first"] },
          { label: "Symmetry", children: ["Skip mirror images", "Try only one empty bucket"] },
          { label: "Memoisation", children: ["Repeated sub-states become DP"] },
        ],
      },
      {
        type: "compare",
        title: "Three classic constraint searches",
        columns: [
          { title: "N-Queens", points: ["One queen per row", "Sets: columns, r - c, r + c", "Count or list placements"] },
          { title: "Sudoku", points: ["81 cells, digits 1 to 9", "Sets per row, column and box", "MRV makes it fast"] },
          { title: "Word search", points: ["DFS from each start cell", "Mark and restore cells", "Trie for many words"] },
        ],
      },
    ],
    examples: [
      {
        title: "Word search",
        explanation: "Grid rows ABCE, SFCS, ADEE. Is \"ABCCED\" there? Start at A (0, 0), go right to B, right to C, down to C, down to E, left to D. Found. \"SEE\" is found starting at S (1, 3). \"ABCB\" fails because the only B next to that C is the one already used, which is marked \"#\" and so does not match. The generator inside any() stops as soon as one direction succeeds.",
        code: {
          lang: "python",
          code: `def exist(board, word):
    R, C = len(board), len(board[0])
    def dfs(r, c, i):
        if i == len(word): return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]: return False
        board[r][c] = "#"                         # mark as used
        found = any(dfs(r + dr, c + dc, i + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        board[r][c] = word[i]                     # restore
        return found
    return any(dfs(r, c, 0) for r in range(R) for c in range(C))

board = [list("ABCE"), list("SFCS"), list("ADEE")]
print(exist(board, "ABCCED"), exist(board, "SEE"), exist(board, "ABCB"))  # True True False`,
        },
      },
      {
        title: "A compact Sudoku solver",
        explanation: "The board is 9 lists of 9 characters with \".\" for empty cells. Step 1: record every given digit in its row, column and box set, and collect the empty cells. Step 2: go(k) fills empty cell k with each digit that is not in its three sets. Step 3: if a later cell gets stuck, undo the digit in the cell and all three sets, then try the next digit. It changes the board in place and returns True when solved. Choosing the next cell by fewest options (MRV) would make it much faster on hard puzzles.",
        code: {
          lang: "python",
          code: `def solve_sudoku(b):                          # b: 9 lists of 9 chars, "." = empty
    rows, cols, boxes = [set() for _ in range(9)], [set() for _ in range(9)], [set() for _ in range(9)]
    empty = [(r, c) for r in range(9) for c in range(9) if b[r][c] == "."]
    for r, c in [(r, c) for r in range(9) for c in range(9) if b[r][c] != "."]:
        rows[r].add(b[r][c]); cols[c].add(b[r][c]); boxes[r // 3 * 3 + c // 3].add(b[r][c])
    def go(k):
        if k == len(empty): return True
        r, c = empty[k]; x = r // 3 * 3 + c // 3
        for d in "123456789":
            if d in rows[r] or d in cols[c] or d in boxes[x]: continue
            b[r][c] = d; rows[r].add(d); cols[c].add(d); boxes[x].add(d)
            if go(k + 1): return True
            b[r][c] = "."; rows[r].remove(d); cols[c].remove(d); boxes[x].remove(d)
        return False
    return go(0)`,
        },
      },
    ],
    cheatSheet: [
      "Check constraints right after each move, never only when the board is full",
      "N-Queens: sets of columns, r - c and r + c give O(1) checks",
      "N-Queens counts: n=4 has 2, n=6 has 4, n=8 has 92",
      "Sudoku box index: r // 3 * 3 + c // 3",
      "MRV: fill the cell with the fewest legal values next",
      "Grid DFS: mark the cell, recurse, then restore it",
      "Word search worst case: O(R x C x 4 x 3^(L - 1))",
      "Repeated sub-states? Memoise and the search becomes DP",
    ],
    quiz: [
      {
        q: "Queens at (2, 5) and (4, 3). Do they attack each other?",
        options: ["No, different rows and columns", "Yes, they share r + c = 7", "Yes, they share r - c", "Only if n is even"],
        answer: 1,
        why: "2 + 5 = 7 and 4 + 3 = 7, so they are on the same down-left diagonal.",
      },
      {
        q: "Which box index does Sudoku cell (row 4, column 7) belong to, using r // 3 * 3 + c // 3?",
        options: ["4", "7", "6", "5"],
        answer: 3,
        why: "4 // 3 * 3 + 7 // 3 = 3 + 2 = 5, the middle-right box.",
      },
      {
        q: "In word search, what happens if you forget to restore the cell after the recursive call?",
        options: ["Later searches see \"#\" and miss valid paths", "The DFS loops forever", "Nothing, because Python copies the board", "It finds duplicate words"],
        answer: 0,
        why: "The board is shared and mutable, so the mark stays and blocks other starting points.",
      },
      {
        q: "What is the main idea of the MRV heuristic?",
        options: ["Try digits from 9 down to 1", "Fill cells in random order", "Branch on the cell with the fewest legal options", "Fill the cell with the most options first"],
        answer: 2,
        why: "Few options means less branching, and zero options reveals a dead end at once.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Generate every string of n pairs of balanced parentheses. Example: n = 3 gives 5 strings.",
        hint: "Two rules prune everything invalid: add \"(\" while open < n, add \")\" while close < open.",
        solution: `def gen_parens(n):
    out = []
    def go(s, open_, close):
        if len(s) == 2 * n: out.append(s); return
        if open_ < n: go(s + "(", open_ + 1, close)
        if close < open_: go(s + ")", open_, close + 1)
    go("", 0, 0)
    return out
print(gen_parens(3))  # ['((()))', '(()())', '(())()', '()(())', '()()()']`,
      },
      {
        level: "medium",
        task: "Count N-Queens solutions using three integer bitmasks instead of sets. Check that n = 8 gives 92.",
        hint: "free = ~(cols | d1 | d2) & full. Take the lowest free bit with free & -free; shift d1 left and d2 right for the next row.",
        solution: `def queens_bits(n):
    full = (1 << n) - 1
    def go(cols, d1, d2):
        if cols == full: return 1
        count, free = 0, ~(cols | d1 | d2) & full
        while free:
            bit = free & -free                    # lowest free column
            free -= bit
            count += go(cols | bit, (d1 | bit) << 1 & full, (d2 | bit) >> 1)
        return count
    return go(0, 0, 0)
print(queens_bits(4), queens_bits(8))  # 2 92`,
      },
      {
        level: "hard",
        task: "Can nums be split into k groups with equal sums? Example: [4, 3, 2, 3, 5, 2, 1], k = 4 is True (5, 1+4, 2+3, 2+3).",
        hint: "Sort descending to fail fast, fill k buckets, and break after trying an empty bucket (all empty buckets are the same).",
        solution: `def can_partition_k(nums, k):
    target, rem = divmod(sum(nums), k)
    nums = sorted(nums, reverse=True)
    if rem or nums[0] > target: return False
    buckets = [0] * k
    def go(i):
        if i == len(nums): return True
        for b in range(k):
            if buckets[b] + nums[i] <= target:
                buckets[b] += nums[i]
                if go(i + 1): return True
                buckets[b] -= nums[i]
            if buckets[b] == 0: break             # symmetry: empty buckets are identical
        return False
    return go(0)
print(can_partition_k([4, 3, 2, 3, 5, 2, 1], 4), can_partition_k([1, 2, 3, 4], 3))  # True False`,
      },
    ],
    faq: [
      { q: "What is the difference between backtracking and brute force?", a: "Brute force builds every complete candidate and then checks it. Backtracking checks partial candidates and abandons them early, so it usually explores a tiny part of the full space." },
      { q: "How many solutions does the 8-queens puzzle have?", a: "92 solutions in total. Counting rotations and reflections of the board as the same, there are 12 distinct ones." },
      { q: "How do real Sudoku solvers work?", a: "Most combine constraint propagation (removing digits that cannot fit) with backtracking on the cell with the fewest options. Some model the puzzle as exact cover and use Knuth's Dancing Links (Algorithm X)." },
      { q: "Is word search with many words just running the single-word search many times?", a: "That works but repeats a lot of work. Putting all words in a trie lets one DFS from each cell follow every word that shares the current prefix." },
    ],
  },

  "dsa-backtracking-bits/bit-manipulation": {
    plain: [
      "Computers store every integer as a row of bits, which are 0s and 1s. The number 13 is 1101 in binary: 8 + 4 + 0 + 1. Each position is worth twice the one to its right. Bit manipulation means reading and changing those 0s and 1s directly.",
      "There are a few operators. AND (&) keeps a bit only where both numbers have a 1. OR (|) keeps a bit where either has a 1. XOR (^) keeps a bit where exactly one has a 1. NOT (~) flips every bit. Shifts (<< and >>) slide all bits left or right, which multiplies or divides by powers of 2.",
      "Why bother? These operations are among the fastest things a CPU can do. They also let one integer act as a tiny set: bit i is 1 if item i is in the set. Twenty items fit in one number, and checking membership is a single AND.",
      "In Python there is one surprise: integers have no fixed size. They never overflow, and negative numbers behave as if they had infinitely many 1 bits on the left. That is handy, but it means some tricks from C or Java need a mask to work the same way.",
    ],
    deepDive: [
      {
        heading: "Negative numbers and Python's endless bits",
        body: "Computers store negative integers in two's complement: to negate x, flip all bits and add 1, so -x == ~x + 1. In an 8-bit world, 5 is 00000101 and -5 is 11111011. Python follows the same rules but with an unlimited number of bits, so -5 is \"...11111011\" with 1s forever to the left. That is why ~5 == -6 and why bin(-5) prints \"-0b101\" (a minus sign, not the raw bits).\n\nTo copy 32-bit behaviour, mask with & 0xFFFFFFFF, which keeps the low 32 bits as a non-negative number. To turn that back into a signed value, subtract 2^32 if the result is at least 2^31. Right shift on negatives rounds down: -5 >> 1 == -3, the same as -5 // 2.",
        bullets: ["-x == ~x + 1 and ~x == -x - 1", "Low 32 bits: x & 0xFFFFFFFF", "Back to signed: x - (1 << 32) if x >= 1 << 31", "-5 >> 1 == -3 (floor)"],
      },
      {
        heading: "The lowest set bit",
        body: "Two expressions do most of the clever work. x & (x - 1) clears the lowest 1 bit. Subtracting 1 turns the lowest 1 into 0 and every 0 to its right into 1; ANDing with the original wipes all of those. For 12 (1100), x - 1 is 1011, and the AND is 1000, which is 8.\n\nx & -x isolates the lowest 1 bit. In two's complement, -x flips every bit above the lowest 1 and keeps that bit itself, so only it survives the AND. For 12 that is 0100, which is 4. Fenwick trees are built on exactly this value.\n\nCounting bits by repeatedly clearing the lowest one (Brian Kernighan's method) loops once per 1 bit, not once per bit position. In Python 3.10 and later, x.bit_count() returns the count directly, and x.bit_length() gives the number of bits needed to write x.",
        visual: {
          type: "flow",
          title: "x = 12 (1100)",
          steps: [
            { label: "x - 1", detail: "1011: lowest 1 becomes 0, zeros to its right become 1" },
            { label: "x & (x - 1)", detail: "1000 = 8: lowest 1 cleared" },
            { label: "-x", detail: "...10100 in two's complement" },
            { label: "x & -x", detail: "0100 = 4: lowest 1 isolated" },
          ],
        },
      },
      {
        heading: "XOR, the cancelling operator",
        body: "XOR has three properties that power many tricks: a ^ a == 0, a ^ 0 == a, and the order does not matter. So XOR-ing a list cancels every value that appears an even number of times.\n\nMissing number: the list holds 0 to n with one value missing. XOR every index 0 to n with every value; everything pairs up except the missing one. Two single numbers: when exactly two values appear once and all others twice, XOR everything to get x = a ^ b. Since a and b differ, x has at least one 1 bit; take it with x & -x. That bit splits the list into two groups, one holding a and the other b, and XOR-ing each group gives each answer. All of these are O(n) time and O(1) space.\n\nXOR also detects which bits changed between two values: a ^ b has 1s exactly where they differ, so (a ^ b).bit_count() is their Hamming distance.",
      },
      {
        heading: "Bitmasks as small sets",
        body: "With n items, any subset is an integer from 0 to 2^n - 1. Set operations become single instructions: union a | b, intersection a & b, difference a & ~b, add item i with mask | 1 << i, and test it with mask >> i & 1.\n\nTo visit every submask of a mask, use sub = (sub - 1) & mask, starting from mask and stopping after 0. Doing that for every mask of n bits costs 3^n in total, because each item is either outside the mask, in the mask but not the submask, or in both.\n\nBitmask DP uses the mask as part of the state. The travelling salesperson problem with Held-Karp DP has states (visited set, current city): 2^n x n states with n transitions each, O(2^n x n^2). That is about 400 million steps for n = 20, which is slow in Python but standard in C++.",
        bullets: ["Every subset: for mask in range(1 << n)", "Every submask: sub = (sub - 1) & mask", "All submasks of all masks: 3^n total"],
        visual: {
          type: "flow",
          title: "Submasks of 101 (items 0 and 2)",
          steps: [
            { label: "sub = 101", detail: "Both items" },
            { label: "(101 - 1) & 101", detail: "100 & 101 = 100: item 2" },
            { label: "(100 - 1) & 101", detail: "011 & 101 = 001: item 0" },
            { label: "(001 - 1) & 101", detail: "000: empty set, stop after it" },
          ],
        },
      },
      {
        heading: "Precedence traps",
        body: "Python's operator priority, from tighter to looser, goes: unary ~ and -, then * and /, then + and -, then << and >>, then &, then ^, then |, then comparisons like ==. So 1 << n - 1 means 1 << (n - 1), and x & 1 == 0 means (x & 1) == 0 in Python.\n\nThat last one is a trap when you move to C, C++ or Java, where == binds tighter than &, so x & 1 == 0 means x & (1 == 0). Parentheses cost nothing and make code portable, so write (x & 1) == 0 anyway.\n\nShifts in Python never overflow: 1 << 100 is a valid 101-bit integer. In C, shifting a 32-bit int by 32 or more is undefined behaviour, and in Java the shift amount is taken modulo 32 for int, so 1 << 32 == 1.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Python versus C and Java bits",
        columns: [
          { title: "Python", points: ["Integers never overflow", "~5 == -6, -5 >> 1 == -3", "x & 1 == 0 is (x & 1) == 0", "Mask with 0xFFFFFFFF for 32 bits"] },
          { title: "C and Java", points: ["Fixed 32 or 64 bits", "Java: >>> is an unsigned shift", "x & 1 == 0 is x & (1 == 0)", "Overflow wraps or is undefined"] },
        ],
      },
    ],
    examples: [
      {
        title: "Two numbers that appear once",
        explanation: "In [1, 2, 1, 3, 2, 5], every value appears twice except 3 and 5. Step 1: XOR everything: the pairs cancel and x = 3 ^ 5 = 6 (110). Step 2: the lowest set bit of 6 is 2 (010); 3 has that bit and 5 does not. Step 3: XOR the numbers with that bit (2, 3, 2 gives 3) and those without it (1, 1, 5 gives 5). Answer: 3 and 5. One extra pass, no extra memory.",
        code: {
          lang: "python",
          code: `from functools import reduce
from operator import xor

def two_singles(nums):
    x = reduce(xor, nums)          # a ^ b
    bit = x & -x                   # a bit where a and b differ
    a = 0
    for v in nums:
        if v & bit:
            a ^= v                 # group that contains one of them
    return sorted((a, x ^ a))

print(two_singles([1, 2, 1, 3, 2, 5]))  # [3, 5]`,
        },
      },
      {
        title: "Words with no shared letters",
        explanation: "Find the largest product of lengths of two words that share no letters. Step 1: turn each word into a 26-bit mask, with bit i set if letter i appears. \"abcw\" gets bits for a, b, c and w. Step 2: two words share no letter exactly when their masks AND to 0, one fast operation instead of comparing letters. For [\"abcw\", \"baz\", \"foo\", \"bar\", \"xtfn\", \"abcdef\"], the best pair is \"abcw\" and \"xtfn\": 4 x 4 = 16.",
        code: {
          lang: "python",
          code: `def max_product(words):
    masks = []
    for w in words:
        m = 0
        for ch in w:
            m |= 1 << (ord(ch) - ord("a"))
        masks.append(m)
    best = 0
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            if masks[i] & masks[j] == 0:
                best = max(best, len(words[i]) * len(words[j]))
    return best

print(max_product(["abcw", "baz", "foo", "bar", "xtfn", "abcdef"]))  # 16`,
        },
      },
    ],
    cheatSheet: [
      "Test bit i: x >> i & 1; set: x | 1 << i; clear: x & ~(1 << i); flip: x ^ 1 << i",
      "x & (x - 1) clears the lowest 1 bit; x & -x keeps only the lowest 1 bit",
      "x.bit_count() counts 1 bits (Python 3.10+); x.bit_length() counts digits",
      "XOR of a list cancels pairs: a ^ a == 0, a ^ 0 == a",
      "Every submask: sub = (sub - 1) & mask until 0; all masks together cost 3^n",
      "Python ~x == -x - 1; emulate 32 bits with & 0xFFFFFFFF",
      "In C and Java, write (x & 1) == 0 with parentheses",
      "Power of two: x > 0 and x & (x - 1) == 0",
    ],
    quiz: [
      {
        q: "What is 22 & -22? (22 is 10110 in binary.)",
        options: ["22", "2", "20", "4"],
        answer: 1,
        why: "x & -x keeps only the lowest set bit of 10110, which is 00010 = 2.",
      },
      {
        q: "What does Python print for ~7?",
        options: ["-8", "248", "-7", "0"],
        answer: 0,
        why: "~x == -x - 1, so ~7 == -8.",
      },
      {
        q: "How many submask steps does enumerating every submask of every mask of n bits take in total?",
        options: ["2^n", "n x 2^n", "4^n", "3^n"],
        answer: 3,
        why: "Each bit is either out of the mask, in the mask only, or in both mask and submask.",
      },
      {
        q: "In Java, what does x & 1 == 0 compute?",
        options: ["Whether x is even", "Whether x is odd", "x & (1 == 0), which does not compile for an int x", "x shifted by one"],
        answer: 2,
        why: "In Java == binds tighter than &, and int & boolean is a type error.",
      },
      {
        q: "nums holds every number from 0 to n except one. Which XOR finds the missing one?",
        options: ["XOR of all nums only", "XOR of all indexes 0 to n and all nums", "XOR of the first and last items", "XOR of nums with n only"],
        answer: 1,
        why: "Every present value cancels with its matching index, leaving the missing value.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Return a list where entry i is the number of 1 bits in i, for i from 0 to n, in O(n). Example: n = 5 gives [0, 1, 1, 2, 1, 2].",
        hint: "i >> 1 drops the last bit, and you already know its count.",
        solution: `def count_bits(n):
    out = [0] * (n + 1)
    for i in range(1, n + 1):
        out[i] = out[i >> 1] + (i & 1)
    return out
print(count_bits(5))  # [0, 1, 1, 2, 1, 2]`,
      },
      {
        level: "medium",
        task: "Every number appears three times except one, which appears once. Values are signed 32-bit integers. Find the single one in O(n) time and O(1) space. Example: [0, 1, 0, 1, 0, 1, -99] gives -99.",
        hint: "For each of the 32 bit positions, count how many numbers have it set; the count mod 3 is the single number's bit.",
        solution: `def single_number_ii(nums):
    ans = 0
    for i in range(32):
        if sum(x >> i & 1 for x in nums) % 3:
            ans |= 1 << i
    return ans - (1 << 32) if ans >= 1 << 31 else ans   # back to signed 32-bit
print(single_number_ii([2, 2, 3, 2]), single_number_ii([0, 1, 0, 1, 0, 1, -99]))  # 3 -99`,
      },
      {
        level: "hard",
        task: "Solve the travelling salesperson problem for a small distance matrix with bitmask DP: start at city 0, visit every city once, return to 0. The 4-city example below gives 80.",
        hint: "dp[mask][u] = cheapest way to visit exactly the cities in mask, ending at u. O(2^n x n^2).",
        solution: `def tsp(d):
    n, INF = len(d), float("inf")
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0                              # only city 0 visited, standing at 0
    for mask in range(1 << n):
        for u in range(n):
            if dp[mask][u] == INF: continue
            for v in range(n):
                if not mask >> v & 1:
                    dp[mask | 1 << v][v] = min(dp[mask | 1 << v][v], dp[mask][u] + d[u][v])
    return min(dp[-1][u] + d[u][0] for u in range(1, n))
print(tsp([[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]))  # 80`,
      },
    ],
    faq: [
      { q: "Are bitwise operations faster than normal arithmetic in Python?", a: "Not by much for single operations, because the interpreter overhead dominates. The real wins are packing many booleans into one integer and replacing loops with a few whole-mask operations." },
      { q: "How do I print a number in binary with leading zeros?", a: "Use format(x, \"08b\") or f\"{x:08b}\" for 8 digits. For negative numbers, mask first, for example format(x & 0xFF, \"08b\")." },
      { q: "Why does Python show negative numbers in binary with a minus sign?", a: "Python integers have no fixed width, so there is no natural number of leading 1 bits to print. bin() shows the sign and the size instead; mask with a width like 0xFFFFFFFF to see the two's complement bits." },
      { q: "How many items can a bitmask hold?", a: "In Python, any number, because integers are unbounded. Algorithms that loop over all masks are limited by 2^n, so around 20 to 25 items is the practical ceiling." },
    ],
  },
};

export default extra;
