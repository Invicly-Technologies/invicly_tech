import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa/recursion": {
    plain: [
      "Recursion means a function calls itself on a smaller version of the same problem. To count the people in a queue, you could ask the person in front of you: \"how many people are ahead of you?\" They ask the next person, and so on. The first person in line says \"zero\". That answer is the base case, and every answer flows back down the line.",
      "Backtracking is recursion used to search. Think of walking through a maze. At each fork you pick a path. If it hits a dead end, you walk back to the fork and try the next path. In code, you add one choice, go deeper, and then remove that choice so you can try the next one.",
      "Interviewers love backtracking because it covers a whole family of problems: all subsets, all orderings (permutations), all ways to reach a target sum, placing queens on a board, or finding a word in a grid. Once you know the shape, these problems feel very similar.",
      "These searches are slow by nature, often 2^n or n! steps, so the inputs are small (usually n of 20 or less). Your job is to write the search cleanly, cut off hopeless paths early, and state the cost honestly.",
    ],
    deepDive: [
      {
        heading: "What the call stack really does",
        body: "Each call creates a stack frame: a small block of memory holding the arguments, the local variables and the place to return to. When fact(3) calls fact(2), the fact(3) frame waits on the stack until fact(2) returns. The stack grows as you go deeper and shrinks as calls return.\n\nThe stack is limited. Python stops at about 1000 nested calls by default and raises RecursionError. Java gives each thread a fixed stack (often 512 KB to 1 MB, set with -Xss) and throws StackOverflowError when it runs out, which usually happens somewhere in the thousands to tens of thousands of frames. That is why recursion depth counts as extra space: a recursive solution that goes n levels deep uses O(n) space even if it stores nothing else.",
        bullets: ["Every call pushes a frame; every return pops one", "Recursion depth is part of the space cost", "Deep inputs (10^5 levels) need an iterative version"],
        visual: {
          type: "layers",
          title: "Call stack while computing fact(3)",
          layers: [
            { label: "fact(0)", detail: "Base case: returns 1 right away" },
            { label: "fact(1)", detail: "Waiting for fact(0), then returns 1 x 1" },
            { label: "fact(2)", detail: "Waiting for fact(1), then returns 2 x 1" },
            { label: "fact(3)", detail: "Waiting for fact(2), then returns 3 x 2" },
            { label: "main", detail: "Receives 6" },
          ],
        },
      },
      {
        heading: "Three questions that define any backtracking problem",
        body: "Before coding, answer three questions. What is the path (the partial answer built so far)? What are the choices at this step? When is the path complete? For subsets, the path is the chosen numbers, the choice is take or skip the next number, and it is complete when every number has been decided.\n\nThe main difference between problem types is how you avoid repeats. Combinations and subsets use a start index so you never pick an earlier element again, which stops [1, 2] and [2, 1] both appearing. Permutations care about order, so they loop over every element and use a used[] array to skip ones already in the path.",
        visual: {
          type: "compare",
          title: "Which loop shape?",
          columns: [
            { title: "Subsets", points: ["Take or skip each item", "Record at every node or at the end", "2^n results"] },
            { title: "Combinations", points: ["Loop from a start index", "Next call uses i + 1 (or i if reuse is allowed)", "Order does not matter"] },
            { title: "Permutations", points: ["Loop over all items", "used[] array skips taken ones", "n! results"] },
          ],
        },
      },
      {
        heading: "Pruning: stop early on hopeless paths",
        body: "Pruning means not exploring a branch you already know cannot succeed. It does not change the worst-case Big-O, but it often makes the real search thousands of times faster.\n\nIn Combination Sum, sort the candidates first. When a candidate is larger than the amount still needed, every later candidate is larger too, so you can break out of the loop instead of just skipping one. In N-Queens, you place one queen per row and keep three sets of blocked columns and diagonals. A cell (r, c) is on the diagonal r - c and the anti-diagonal r + c, so checking whether a square is attacked takes O(1) instead of scanning the board.",
        bullets: ["Sort, then break when a value is too big", "Track blocked columns and diagonals in sets or boolean arrays", "Check constraints before recursing, not after"],
      },
      {
        heading: "Inputs with duplicates",
        body: "If the input has repeated values, such as [1, 2, 2], the plain subsets code produces [1, 2] twice. The fix is to sort the input so equal values sit next to each other, then skip a value at the same depth if it equals the one just before it: if i > start and nums[i] == nums[i - 1], continue.\n\nThe condition i > start matters. It still lets you pick the second 2 right after the first 2 on a deeper level (giving [2, 2]), but stops two sibling branches from both starting with a 2. The same trick fixes Combination Sum II and Permutations II, where for permutations you also check that the previous equal value is not currently used.",
      },
      {
        heading: "Grid backtracking: Word Search",
        body: "In Word Search you look for a word by moving up, down, left and right through a letter grid, without reusing a cell. Start a search from every cell. At each step, check bounds, check the letter, then mark the cell as visited by replacing it with a symbol like #, recurse into the four neighbours, and put the letter back.\n\nPutting the letter back is the unchoose step: without it, a failed path leaves cells blocked for later paths. The cost is O(m x n x 3^L) for a word of length L: m x n starting cells, and after the first step each cell has at most three new directions because you never go straight back. Pruning on the first wrong letter is what keeps it practical.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Permutations of [1, 2, 3]: each level fixes one position",
        root: "[ ] (nothing placed)",
        children: [
          { label: "start with 1", children: ["1, 2, 3", "1, 3, 2"] },
          { label: "start with 2", children: ["2, 1, 3", "2, 3, 1"] },
          { label: "start with 3", children: ["3, 1, 2", "3, 2, 1"] },
        ],
      },
    ],
    examples: [
      {
        title: "Combination Sum: candidates [2, 3, 6, 7], target 7",
        explanation: "Each number may be used many times. After sorting, start with 2: left 5. Take 2 again: left 3. Take 2 again: left 1, and 2 > 1, so break. Back up and take 3 instead: left 0, record [2, 2, 3]. Back at left 5, try 3 (left 2, then 3 > 2, break), then 6 > 5, break. Back at the top, try 3, then 6, then 7: left 0, record [7]. The recursive call passes i, not i + 1, which allows reuse but never goes back to smaller numbers, so no duplicates appear.",
        code: {
          lang: "java",
          code: `List<List<Integer>> combinationSum(int[] c, int target) {
    Arrays.sort(c);
    List<List<Integer>> res = new ArrayList<>();
    dfs(c, 0, target, new ArrayList<>(), res);
    return res;
}
void dfs(int[] c, int start, int left, List<Integer> path, List<List<Integer>> res) {
    if (left == 0) { res.add(new ArrayList<>(path)); return; }
    for (int i = start; i < c.length; i++) {
        if (c[i] > left) break;             // sorted: the rest are bigger too
        path.add(c[i]);                     // choose
        dfs(c, i, left - c[i], path, res);  // explore; i allows reuse
        path.remove(path.size() - 1);       // unchoose
    }
}`,
        },
      },
      {
        title: "N-Queens: counting solutions for n = 4",
        explanation: "Place one queen per row, so rows never clash. Row 0, column 0: this blocks column 0 and both diagonals. Row 1 can only use column 2 or 3. Try column 2: row 2 has no safe column, so back up. Try column 3: row 2 can use column 1, but then row 3 has nothing, so back up again, all the way to row 0. Row 0, column 1 works: queens at columns 1, 3, 0, 2. The mirror image (2, 0, 3, 1) is the second solution. For n = 8 the same code finds 92.",
        code: {
          lang: "java",
          code: `int count = 0; boolean[] cols, diag, anti;
int totalNQueens(int n) {
    cols = new boolean[n]; diag = new boolean[2 * n]; anti = new boolean[2 * n];
    place(0, n);
    return count;
}
void place(int r, int n) {
    if (r == n) { count++; return; }
    for (int c = 0; c < n; c++) {
        if (cols[c] || diag[r - c + n] || anti[r + c]) continue;  // attacked
        cols[c] = diag[r - c + n] = anti[r + c] = true;
        place(r + 1, n);
        cols[c] = diag[r - c + n] = anti[r + c] = false;
    }
}`,
        },
      },
    ],
    cheatSheet: [
      "Subsets cost O(n x 2^n); permutations cost O(n x n!), counting the copy of each result",
      "Combinations: recurse with i + 1 for no reuse, with i when an item can be reused",
      "Duplicates: sort, then skip when i > start and a[i] == a[i - 1]",
      "Permutations: loop over every index and track a used[] array instead of a start index",
      "Sorted candidates let you break the loop as soon as one is bigger than what is left",
      "N-Queens: cell (r, c) sits on diagonal r - c and anti-diagonal r + c",
      "Python stops at about 1000 nested calls by default; Java throws StackOverflowError",
      "Grid search: mark a cell visited before recursing and restore it after",
    ],
    quiz: [
      {
        q: "In Combination Sum, where each number can be used many times, which index do you pass to the recursive call?",
        options: ["i + 1", "start", "i", "0"],
        answer: 2,
        why: "Passing i lets the same number be picked again, while never going back to earlier numbers avoids duplicate combinations.",
      },
      {
        q: "How many permutations does a list of 4 distinct numbers have?",
        options: ["24", "16", "12", "4"],
        answer: 0,
        why: "4! = 4 x 3 x 2 x 1 = 24.",
      },
      {
        q: "For Subsets II with input [1, 2, 2], why do you sort first?",
        options: ["Backtracking only works on sorted input", "So the output is printed in order", "Sorting changes the complexity to O(n log n)", "So equal values sit side by side and repeats can be skipped"],
        answer: 3,
        why: "The skip rule compares a value with the one just before it, which only finds duplicates if they are adjacent.",
      },
      {
        q: "In N-Queens, two queens at (r1, c1) and (r2, c2) share a top-left to bottom-right diagonal when:",
        options: ["r1 + c1 == r2 + c2", "r1 - c1 == r2 - c2", "r1 == c2", "c1 + r2 == 0"],
        answer: 1,
        why: "Moving down-right adds 1 to both row and column, so r - c stays the same along that diagonal.",
      },
      {
        q: "In Word Search, why do you put the letter back after exploring from a cell?",
        options: ["To save memory", "To make the recursion shorter", "Other search paths may need that cell later", "Java requires arrays to be restored"],
        answer: 2,
        why: "Without restoring, a failed path leaves cells marked as used, so valid paths that need them are wrongly blocked.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print all binary strings of length n (for n = 3: 000, 001, ..., 111) using recursion.",
        hint: "At each position there are two choices: 0 or 1. The base case is when the string has length n.",
        solution: `def binary_strings(n, prefix=""):
    if len(prefix) == n:
        print(prefix)
        return
    binary_strings(n, prefix + "0")
    binary_strings(n, prefix + "1")

binary_strings(3)  # 2^n strings, O(n x 2^n) time`,
      },
      {
        level: "medium",
        task: "Permutations: return all orderings of a list of distinct integers.",
        hint: "Loop over every index each time and skip the ones already used in the current path.",
        solution: `def permute(nums):
    res, path, used = [], [], [False] * len(nums)
    def go():
        if len(path) == len(nums):
            res.append(path[:]); return
        for i, x in enumerate(nums):
            if used[i]: continue
            used[i] = True; path.append(x)
            go()
            used[i] = False; path.pop()
    go()
    return res  # n! results, O(n x n!) time`,
      },
      {
        level: "hard",
        task: "Word Search: return true if a word can be formed from adjacent cells (up, down, left, right) in a letter grid, using each cell at most once.",
        hint: "Start from every cell. Mark the cell with # before recursing and restore it after.",
        solution: `def exist(board, word):
    m, n = len(board), len(board[0])
    def dfs(r, c, i):
        if i == len(word): return True
        if not (0 <= r < m and 0 <= c < n) or board[r][c] != word[i]: return False
        board[r][c] = '#'                                  # choose
        found = any(dfs(r + dr, c + dc, i + 1)
                    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        board[r][c] = word[i]                              # unchoose
        return found
    return any(dfs(r, c, 0) for r in range(m) for c in range(n))`,
      },
    ],
    faq: [
      { q: "How do I know a problem needs backtracking?", a: "Look for \"return all\" combinations, subsets, orderings or placements, or \"does any arrangement exist\" under constraints. Small input limits, like n up to 15 or 20, are another strong hint." },
      { q: "Is recursion slower than a loop?", a: "Each call has a small overhead, but the Big-O is usually the same. The real risk is stack depth: very deep recursion can crash, so convert to a loop with an explicit stack when depth can reach many thousands." },
      { q: "How do I state the complexity of a backtracking solution?", a: "Count the results or leaves of the search tree and multiply by the work per result. Subsets are O(n x 2^n) and permutations O(n x n!), because copying each answer costs O(n)." },
      { q: "What is the difference between recursion and backtracking?", a: "Recursion is the technique of a function calling itself. Backtracking is a search strategy built on recursion that makes a choice, explores, and then undoes the choice to try the next option." },
    ],
  },

  "dsa/trees": {
    plain: [
      "A tree is like a family tree or a folder structure. There is one top node called the root. Each node can have children, and nodes with no children are called leaves. In a binary tree, each node has at most two children: left and right.",
      "A binary search tree (BST) adds one rule: everything in a node's left side is smaller, and everything in its right side is bigger. That rule lets you find a value the way you look up a word in a dictionary: go left or right and ignore the other half.",
      "Almost every tree problem is solved by visiting the nodes in some order. Depth-first search (DFS) goes all the way down one branch before trying the next. Breadth-first search (BFS) visits the tree level by level, like reading lines of text from top to bottom.",
      "The trick that makes tree problems easy is trust. Assume your function already works for the left and right children, then decide how to combine their answers for the current node. With practice, most tree solutions become five or six lines.",
    ],
    deepDive: [
      {
        heading: "Iterative traversals with an explicit stack",
        body: "Recursion uses the call stack, so a very deep or skewed tree (say 100,000 nodes in a line) can overflow it. Interviewers also like to ask for an iterative version to check you understand what recursion does for you.\n\nIterative inorder works like this: walk left as far as possible, pushing each node. Pop one, visit it, then move to its right child and repeat. Preorder is simpler: pop a node, visit it, push its right child and then its left child, so the left one comes out first. Postorder can be done by running a preorder that visits node, right, left and reversing the result.",
        bullets: ["Inorder: push lefts, pop and visit, go right", "Preorder: pop, visit, push right then left", "Postorder: reverse of node, right, left"],
        visual: {
          type: "flow",
          title: "Iterative inorder traversal",
          steps: [
            { label: "Go left", detail: "Push every node while moving to the left child" },
            { label: "Pop", detail: "The top node has no unvisited left side" },
            { label: "Visit", detail: "Record its value" },
            { label: "Go right", detail: "Move to its right child" },
            { label: "Repeat", detail: "Until the stack is empty and the node is null" },
          ],
        },
      },
      {
        heading: "Passing values down vs returning values up",
        body: "Tree recursions come in two flavours. Top-down solutions pass information down as parameters: the running path sum, the allowed min and max for a BST, or the current depth. Path Sum (\"is there a root-to-leaf path adding to target?\") is top-down: subtract the node's value and pass what is left.\n\nBottom-up solutions return information up: the height of a subtree, whether it is balanced, or its best path. The parent combines the children's answers. Diameter of a Binary Tree is bottom-up: each node returns its height, and along the way you update a global best of left height plus right height, because the longest path may bend at any node, not only at the root.",
        visual: {
          type: "compare",
          title: "Two recursion styles on trees",
          columns: [
            { title: "Top-down (pass down)", points: ["State travels in parameters", "Decide at the leaves", "Path Sum, Validate BST bounds", "Like preorder"] },
            { title: "Bottom-up (return up)", points: ["Children return results", "Parent combines them", "Height, Diameter, Balanced Tree", "Like postorder"] },
          ],
        },
      },
      {
        heading: "Lowest common ancestor",
        body: "The lowest common ancestor (LCA) of nodes p and q is the deepest node that has both of them below it (a node counts as below itself). In a plain binary tree, recurse into both children. If you are at p or q, return yourself. If both the left and the right calls return something, p and q are on different sides, so this node is the LCA. Otherwise pass up whichever side found something. This is O(n) time.\n\nIn a BST you can do better using the ordering. Start at the root. If both values are smaller, go left. If both are bigger, go right. Otherwise they split here, or one of them is this node, so this is the LCA. That is O(h) time and O(1) space with a loop.",
      },
      {
        heading: "BST operations and their real cost",
        body: "Search, insert and delete in a BST all cost O(h), where h is the height. In a balanced tree h is about log2(n), so a million nodes need about 20 steps. But a plain BST does not balance itself. Insert 1, 2, 3, 4, 5 in order and you get a straight line, so h = n and everything becomes O(n).\n\nDeleting a node with two children is the classic tricky case: replace its value with its inorder successor (the smallest value in its right subtree), then delete that successor, which has at most one child. Real libraries use self-balancing trees. Java's TreeMap and TreeSet are red-black trees that guarantee O(log n) and give you floorKey, ceilingKey and ordered iteration for free.",
        bullets: ["Balanced: about log2(n) levels", "Sorted inserts make a plain BST a linked list", "Kth smallest: stop the inorder walk at the kth node"],
      },
      {
        heading: "Level by level with BFS",
        body: "BFS uses a queue. The key trick for level problems is to read the queue size at the start of each round. Exactly that many nodes belong to the current level, so you process them in an inner loop while their children are added to the back of the queue for the next round.\n\nWith that one pattern you can solve Level Order Traversal (collect each level in a list), Right Side View (keep the last node of each level), Minimum Depth (return at the first leaf you meet, which BFS finds before going deeper) and Zigzag Order (reverse every other level). Space is O(w), where w is the widest level, which can be about n / 2 in a full tree.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A BST: inorder gives 1, 3, 6, 8, 10, 14",
        root: "8",
        children: [
          { label: "3 (left of 8: all smaller)", children: ["1", "6"] },
          { label: "10 (right of 8: all bigger)", children: ["14"] },
        ],
      },
      {
        type: "compare",
        title: "The three DFS orders and when to use them",
        columns: [
          { title: "Preorder", points: ["Node, left, right", "Copy or serialise a tree", "Pass state down to children"] },
          { title: "Inorder", points: ["Left, node, right", "BST values in sorted order", "Kth smallest, validate BST"] },
          { title: "Postorder", points: ["Left, right, node", "Children answer first", "Height, diameter, delete tree"] },
        ],
      },
    ],
    examples: [
      {
        title: "Lowest Common Ancestor in a binary tree",
        explanation: "Tree: 3 has children 5 and 1; 5 has children 6 and 2; 2 has children 7 and 4; 1 has children 0 and 8. For p = 5, q = 1: the call on node 5 returns 5 at once, the call on node 1 returns 1, and both sides of node 3 are non-null, so the answer is 3. For p = 5, q = 4: the left call on 3 returns 5 immediately (we never look below it), the right call finds nothing, so 5 is passed up. That is correct because 4 is below 5. One visit per node: O(n) time, O(h) stack.",
        code: {
          lang: "java",
          code: `TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root;  // p and q split here
    return left != null ? left : right;              // pass up what was found
}`,
        },
      },
      {
        title: "Right Side View with level-order BFS",
        explanation: "Imagine standing to the right of the tree. You see the last node of every level. Tree: 1 with children 2 and 3; 2 has a right child 5; 3 has a right child 4. Level 1 is [1], so you see 1. Level 2 is [2, 3]: the last is 3. Level 3 is [5, 4]: the last is 4. Answer [1, 3, 4]. The size snapshot tells you where each level ends, so you never need to store levels separately.",
        code: {
          lang: "java",
          code: `List<Integer> rightSideView(TreeNode root) {
    List<Integer> out = new ArrayList<>();
    if (root == null) return out;
    Deque<TreeNode> queue = new ArrayDeque<>(); queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();                 // nodes on this level
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (i == size - 1) out.add(node.val); // last one on the level
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return out;  // O(n) time, O(width) space
}`,
        },
      },
    ],
    cheatSheet: [
      "Inorder of a BST is sorted; kth smallest is the kth node visited in order",
      "Level problems: take size = queue.size() before the inner loop",
      "Height-style answers (depth, diameter, balanced) return values up, like postorder",
      "Path and bound problems pass values down as parameters",
      "BST search, insert and delete cost O(h): O(log n) if balanced, O(n) if skewed",
      "Java TreeMap and TreeSet are red-black trees with floorKey and ceilingKey in O(log n)",
      "LCA in a BST: go left if both are smaller, right if both are bigger, else stop",
    ],
    quiz: [
      {
        q: "What is the diameter of a binary tree?",
        options: ["The height of the root", "The number of leaves", "The height of the left subtree plus one", "The largest left height plus right height found at any node"],
        answer: 3,
        why: "The longest path can bend at any node, so you track the best left plus right height across all nodes.",
      },
      {
        q: "You insert 1, 2, 3, 4, 5 in that order into a plain (not self-balancing) BST. What is its height?",
        options: ["About log2(5), it stays balanced", "4 edges: it becomes a straight line", "2 edges", "It depends on the hash of each value"],
        answer: 1,
        why: "Each new value is bigger than all before it, so every node goes to the right and the tree becomes a list.",
      },
      {
        q: "Which traversal visits a node before both of its subtrees?",
        options: ["Preorder", "Inorder", "Postorder", "Reverse inorder"],
        answer: 0,
        why: "Preorder is node, left, right.",
      },
      {
        q: "In a BST with root 6, where 2 is in the left subtree and 8 in the right subtree, what is LCA(2, 8)?",
        options: ["2", "8", "6", "The deepest leaf"],
        answer: 2,
        why: "The two values split at the root, so the root is the lowest node that has both below it.",
      },
      {
        q: "What is the extra space of recursive DFS on a completely skewed tree with n nodes?",
        options: ["O(1)", "O(log n)", "O(n x log n)", "O(n)"],
        answer: 3,
        why: "The recursion goes n levels deep, and each level holds a stack frame.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Invert Binary Tree: swap the left and right child of every node.",
        hint: "Invert both subtrees, then swap them. The empty tree is the base case.",
        solution: `def invert_tree(root):
    if root:
        root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root  # O(n) time, O(h) stack`,
      },
      {
        level: "medium",
        task: "Kth Smallest Element in a BST, without recursion.",
        hint: "Iterative inorder visits values in sorted order. Count down k as you pop.",
        solution: `def kth_smallest(root, k):
    stack, node = [], root
    while stack or node:
        while node:                 # go as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()          # next value in sorted order
        k -= 1
        if k == 0:
            return node.val
        node = node.right`,
      },
      {
        level: "hard",
        task: "Binary Tree Maximum Path Sum: the path can start and end at any nodes, and values can be negative.",
        hint: "Each node returns the best single downward branch. The answer may bend at a node and use both branches.",
        solution: `def max_path_sum(root):
    best = float('-inf')
    def gain(node):
        nonlocal best
        if not node:
            return 0
        left = max(gain(node.left), 0)     # ignore negative branches
        right = max(gain(node.right), 0)
        best = max(best, node.val + left + right)  # path bends here
        return node.val + max(left, right)          # only one side goes up
    gain(root)
    return best`,
      },
    ],
    faq: [
      { q: "Is every binary tree a binary search tree?", a: "No. A binary tree only limits each node to two children. A BST also requires every value on the left to be smaller and every value on the right to be bigger, at every level." },
      { q: "Should I write tree solutions recursively or iteratively?", a: "Start with recursion because it is shorter and clearer. Mention the O(h) stack cost, and switch to an iterative version if the interviewer asks or if the tree can be very deep." },
      { q: "What is the difference between height and depth?", a: "Depth is measured from the root down to a node; height is measured from a node down to its deepest leaf. Some problems count edges and others count nodes (LeetCode's Maximum Depth counts nodes), so check the examples." },
      { q: "How do I build a test tree from LeetCode's array format?", a: "The array lists nodes level by level, with null for missing children. Read it with a queue: take each node in turn and attach the next two array values as its left and right child." },
    ],
  },

  "dsa/heaps": {
    plain: [
      "A heap is a structure that always knows its smallest item (or its largest, if you set it up that way). Think of a hospital waiting room. People do not leave in arrival order; the most urgent patient is always seen next. Adding a person or calling the next one is quick, even when the room is full.",
      "In code this idea is called a priority queue. In Java it is PriorityQueue, and in Python it is the heapq module. Both are min-heaps by default: the smallest value comes out first.",
      "A heap is not fully sorted. It only promises that each parent is smaller than its children. That weaker promise is exactly why it is fast: adding or removing an item costs O(log n), while keeping a whole list sorted would cost much more per change.",
      "Interviews use heaps for \"top k\" questions, merging many sorted lists, scheduling tasks, finding a running median, and inside Dijkstra's shortest path algorithm. When you hear \"k largest\", \"k closest\" or \"next smallest\", think heap.",
    ],
    deepDive: [
      {
        heading: "How a heap lives inside an array",
        body: "A heap is a complete binary tree: every level is full except maybe the last, which fills from the left. Because there are no gaps, it can be stored in a plain array with no pointers. For the node at index i, the children are at 2i + 1 and 2i + 2, and the parent is at (i - 1) / 2, rounded down.\n\nTo add an item, put it at the end of the array and sift it up: while it is smaller than its parent, swap them. The tree has about log2(n) levels, so this takes at most O(log n) swaps. Peeking at the minimum is just reading index 0, which is O(1).",
        bullets: ["Children of i: 2i + 1 and 2i + 2", "Parent of i: (i - 1) / 2", "Height is about log2(n), so pushes are O(log n)"],
        visual: {
          type: "flow",
          title: "Push 1 into the heap [2, 3, 5, 4]",
          steps: [
            { label: "Append at the end", detail: "[2, 3, 5, 4, 1], new item at index 4" },
            { label: "Compare with parent", detail: "Parent of 4 is index 1, value 3" },
            { label: "Swap up", detail: "[2, 1, 5, 4, 3], item now at index 1" },
            { label: "Compare again", detail: "Parent is index 0, value 2" },
            { label: "Swap up", detail: "[1, 2, 5, 4, 3], item reaches the root" },
          ],
        },
      },
      {
        heading: "Popping, and why heapify is O(n)",
        body: "To remove the minimum, take index 0, move the last item into its place, and sift it down: swap it with its smaller child until both children are bigger. That is O(log n).\n\nBuilding a heap from n items by pushing one at a time costs O(n log n). Heapify is smarter: it sifts down every parent, starting from the last parent and moving back to the root. Half the nodes are leaves and never move. A quarter move at most one level, an eighth at most two, and so on. That sum adds up to O(n). Use heapq.heapify(list) in Python, or new PriorityQueue(collection) in Java, which also builds the heap in linear time.",
      },
      {
        heading: "Java PriorityQueue in practice",
        body: "new PriorityQueue() gives a min-heap of comparable items. Pass a comparator for anything else: Comparator.reverseOrder() for a max-heap, or a lambda such as (a, b) -> Integer.compare(a[1], b[1]) to order arrays by their second value. Avoid the shortcut a - b: it overflows when values are large or have opposite signs, and the heap silently becomes wrong.\n\nKnow the costs: offer and poll are O(log n), peek is O(1), but remove(object) and contains are O(n) because the heap must scan. Iterating over a PriorityQueue or printing it does not give sorted order. In Python, heapq has no comparator, so push tuples like (priority, counter, item); the counter breaks ties so Python never compares the items themselves.",
        bullets: ["Integer.compare(a, b) instead of a - b", "remove(obj) is O(n): avoid it in loops", "Printing a heap does not show sorted order"],
      },
      {
        heading: "Two heaps for a running median",
        body: "To get the median of a stream of numbers at any moment, split the numbers into two halves. A max-heap holds the smaller half, so its top is the largest of the small numbers. A min-heap holds the bigger half, so its top is the smallest of the big numbers. Keep their sizes equal, or let the max-heap hold one extra.\n\nEach new number goes into one heap, and then you move one top across if the halves are out of order or out of balance. The median is either the top of the max-heap (odd count) or the average of both tops (even count). Adding costs O(log n) and reading the median costs O(1). The same two-heap idea solves sliding window median and IPO-style problems.",
        visual: {
          type: "compare",
          title: "Running median: two halves",
          columns: [
            { title: "Low half: max-heap", points: ["Holds the smaller numbers", "Top = largest small number", "May hold one extra item"] },
            { title: "High half: min-heap", points: ["Holds the bigger numbers", "Top = smallest big number", "Never bigger than the low half"] },
          ],
        },
      },
      {
        heading: "Heap, sort or quickselect for top k?",
        body: "There are three common ways to find the k largest of n items. Sorting is simplest: O(n log n), fine for small inputs. A size-k min-heap costs O(n log k) and only O(k) memory, and it works on a stream where you never see all the data at once. Quickselect, the partition step of quicksort, finds the kth largest in O(n) on average but O(n^2) in the worst case, and needs all data in memory.\n\nFor Top K Frequent Elements there is a fourth option: bucket sort by frequency. A value can appear at most n times, so make n + 1 buckets and read them from the highest. That is O(n). In an interview, give the heap solution first, then mention the faster options and their trade-offs.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Merge K Sorted Lists with a min-heap",
        steps: [
          { label: "Seed the heap", detail: "Push the head of each of the k lists" },
          { label: "Pop the smallest", detail: "It is the next node of the answer" },
          { label: "Append it", detail: "Link it after the tail of the result" },
          { label: "Push its successor", detail: "The next node from the same list, if any" },
          { label: "Repeat until empty", detail: "N nodes x O(log k) each" },
        ],
      },
    ],
    examples: [
      {
        title: "Top K Frequent Elements: [1, 1, 1, 2, 2, 3], k = 2",
        explanation: "Step 1: count with a map: 1 appears 3 times, 2 twice, 3 once. Step 2: keep a min-heap of at most k values, ordered by count. Push 1, push 2. Push 3: the size is now 3, so poll the least frequent, which is 3. Step 3: the heap holds 1 and 2, the answer. Counting is O(n); the heap work is O(m log k) for m distinct values.",
        code: {
          lang: "java",
          code: `int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int x : nums) count.merge(x, 1, Integer::sum);
    // min-heap by count: the least frequent value sits on top and is evicted first
    PriorityQueue<Integer> heap =
        new PriorityQueue<>((a, b) -> Integer.compare(count.get(a), count.get(b)));
    for (int x : count.keySet()) {
        heap.offer(x);
        if (heap.size() > k) heap.poll();
    }
    int[] out = new int[k];
    for (int i = k - 1; i >= 0; i--) out[i] = heap.poll();  // most frequent first
    return out;
}`,
        },
      },
      {
        title: "Merge K Sorted Lists: [1, 4, 5], [1, 3, 4], [2, 6]",
        explanation: "The heap starts with the three heads: 1, 1, 2. Pop a 1, append it, push its next node 4. Pop the other 1, push 3. Pop 2, push 6. Pop 3, push 4. Now pop 4, 4, 5 and 6 in turn. Result: 1, 1, 2, 3, 4, 4, 5, 6. The heap never holds more than k nodes, so each step is O(log k) and the total is O(N log k) for N nodes. A dummy head node avoids a special case for the first append.",
        code: {
          lang: "java",
          code: `ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> heap =
        new PriorityQueue<>((a, b) -> Integer.compare(a.val, b.val));
    for (ListNode head : lists) if (head != null) heap.offer(head);
    ListNode dummy = new ListNode(0), tail = dummy;
    while (!heap.isEmpty()) {
        ListNode node = heap.poll();          // smallest head among the lists
        tail.next = node;
        tail = node;
        if (node.next != null) heap.offer(node.next);
    }
    return dummy.next;  // O(N log k) time, O(k) heap space
}`,
        },
      },
    ],
    cheatSheet: [
      "Array heap: children of i are 2i + 1 and 2i + 2; the parent is (i - 1) / 2",
      "peek O(1); offer and poll O(log n); heapify O(n); remove(obj) and contains O(n)",
      "k largest: keep a size-k min-heap; k smallest: keep a size-k max-heap",
      "Comparators: use Integer.compare(a, b), not a - b, to avoid overflow",
      "Running median: max-heap for the low half, min-heap for the high half",
      "Python heapq ties: push (priority, counter, item) so items are never compared",
      "Iterating a PriorityQueue is not sorted; poll repeatedly to get items in order",
    ],
    quiz: [
      {
        q: "In an array-based heap, what is the parent index of the node at index 9?",
        options: ["4", "5", "3", "8"],
        answer: 0,
        why: "The parent is (9 - 1) / 2 = 4.",
      },
      {
        q: "Why is Integer.compare(a, b) safer than a - b in a comparator?",
        options: ["It is faster", "a - b does not compile in a lambda", "It sorts in descending order", "a - b can overflow and return the wrong sign"],
        answer: 3,
        why: "For example, a large positive minus a large negative exceeds the int range and wraps to a negative number.",
      },
      {
        q: "In the two-heap running median, both heaps have the same size. What is the median?",
        options: ["The top of the min-heap", "The average of the two tops", "The bottom of the max-heap", "The size of either heap"],
        answer: 1,
        why: "With an even count, the median is the mean of the largest small number and the smallest big number.",
      },
      {
        q: "What does building a heap from n items with heapify cost?",
        options: ["O(n log n)", "O(log n)", "O(n)", "O(n^2)"],
        answer: 2,
        why: "Most nodes are near the bottom and move only a little, so the total work sums to O(n).",
      },
      {
        q: "Numbers arrive in an endless stream, and you must always know the 10th largest so far. What fits best?",
        options: ["A size-10 min-heap", "Quickselect over all numbers so far", "Sorting after each number", "A max-heap of every number"],
        answer: 0,
        why: "Each number costs O(log 10), memory stays at 10 items, and the root is always the 10th largest.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Last Stone Weight: repeatedly smash the two heaviest stones. If they differ, the difference goes back in. Return the last weight, or 0.",
        hint: "Python's heapq is a min-heap, so store negative weights to get the heaviest first.",
        solution: `import heapq
def last_stone_weight(stones):
    heap = [-s for s in stones]       # negate for a max-heap
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0`,
      },
      {
        level: "medium",
        task: "K Closest Points to Origin: return the k points nearest to (0, 0).",
        hint: "Keep a max-heap of size k by squared distance, so the farthest of the current k is easy to drop. No square root is needed.",
        solution: `import heapq
def k_closest(points, k):
    heap = []  # max-heap by distance, using negative keys
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)       # drop the farthest
    return [[x, y] for _, x, y in heap]  # O(n log k)`,
      },
      {
        level: "hard",
        task: "Find Median from Data Stream: support addNum(num) and findMedian().",
        hint: "Push into the low half, move its largest to the high half, then rebalance so the low half is never smaller.",
        solution: `import heapq
class MedianFinder:
    def __init__(self):
        self.low, self.high = [], []   # low: max-heap (negated), high: min-heap
    def addNum(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))
    def findMedian(self):
        if len(self.low) > len(self.high): return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
      },
    ],
    faq: [
      { q: "Is a heap the same thing as a priority queue?", a: "A priority queue is the idea: a queue that always serves the most important item. A binary heap is the usual way to build one, which is why the two words are often used as if they were the same." },
      { q: "Why is heapify O(n) and not O(n log n)?", a: "Heapify sifts down from the bottom up. Most nodes are near the leaves and move only a step or two, and only a few nodes near the top can move far, so the total work adds up to linear time." },
      { q: "Can I change the priority of an item already in the heap?", a: "Java's PriorityQueue and Python's heapq have no fast update. The usual trick is lazy deletion: push a new entry with the new priority and skip old entries when you pop them, exactly as Dijkstra's algorithm does." },
      { q: "Should I use a heap or just sort in an interview?", a: "If k is small compared with n, or the data is a stream, a heap is better and shows you know the trade-off. If you need everything in order anyway, sorting is simpler and perfectly fine." },
    ],
  },

  "dsa/graphs": {
    plain: [
      "A graph is a set of things (called nodes or vertices) and the links between them (called edges). Cities and roads, people and friendships, web pages and links, courses and their prerequisites: all of these are graphs. Edges can be one-way (directed) or two-way (undirected), and they can carry a cost such as distance or time (weighted).",
      "Many interview problems are graphs in disguise. A grid of land and water is a graph where each cell links to its four neighbours. A list of \"take course A before course B\" rules is a directed graph. Spotting the graph is often the hardest step.",
      "Once you see the graph, you choose how to walk it. Breadth-first search (BFS) spreads out in rings, like ripples in water, so it finds the fewest steps. Depth-first search (DFS) follows one path as far as it can, which is good for exploring whole regions and finding cycles.",
      "Two more tools cover most of the rest. Topological sort puts tasks in an order that respects every dependency. Dijkstra's algorithm finds the cheapest path when edges have costs. All of them need a seen set, so you never visit the same node twice.",
    ],
    deepDive: [
      {
        heading: "Turning the input into a graph",
        body: "Inputs usually arrive as an edge list like [[0, 1], [1, 2]]. Convert it to an adjacency list: for each node, a list of its neighbours. For an undirected edge, add it both ways; for a directed edge, add it only from source to target. An adjacency list uses O(V + E) memory, where V is the number of nodes and E the number of edges.\n\nAn adjacency matrix (a V x V table of true or false) answers \"is there an edge from a to b?\" in O(1), but it costs O(V^2) memory, which is too much for 100,000 nodes. Grids need no conversion at all: the neighbours of (r, c) are (r + 1, c), (r - 1, c), (r, c + 1) and (r, c - 1), as long as they are inside the grid.",
        bullets: ["Undirected: add the edge both ways", "Directed: only from source to target", "Grid: use a directions array and check bounds first", "Matrix only for small, dense graphs"],
      },
      {
        heading: "Grids: islands and multi-source BFS",
        body: "Number of Islands is the classic grid problem. Scan every cell. When you find unvisited land, count one island and flood-fill it: visit all connected land with DFS or BFS and mark it, often by changing 1 to 0 in place. Each cell is handled a constant number of times, so the total is O(m x n).\n\nRecursive DFS on a 1000 x 1000 grid of land can go a million calls deep and overflow the stack, so BFS or an explicit stack is safer for big inputs. When several starting points spread at the same time, like rotting oranges or distance to the nearest exit, put all of them in the queue at distance 0 before you start. This multi-source BFS finds every cell's distance to its nearest source in a single pass.",
      },
      {
        heading: "Cycles and ordering with DFS colours",
        body: "Kahn's algorithm (removing nodes with no incoming edges) is one way to do topological sort. The DFS way uses three colours. White means not visited yet. Gray means the node is on the current DFS path. Black means the node and everything below it are finished.\n\nWhile exploring a directed graph, an edge into a gray node means you have looped back onto your own path: that is a cycle. An edge into a black node is fine; that part was already checked. If you record each node when it turns black, the reversed list is a valid topological order. For an undirected graph the rule is simpler: seeing a visited node that is not the parent you came from means a cycle.",
        visual: {
          type: "flow",
          title: "DFS colours in a directed graph",
          steps: [
            { label: "White", detail: "Not visited yet" },
            { label: "Enter: gray", detail: "Node is on the current path" },
            { label: "Edge to gray?", detail: "Back edge: a cycle exists" },
            { label: "Explore children", detail: "Skip black nodes, they are done" },
            { label: "Exit: black", detail: "Add to the order; reverse it at the end" },
          ],
        },
      },
      {
        heading: "How Dijkstra really works",
        body: "Dijkstra keeps the best known distance to every node, starting with 0 for the source and infinity for the rest. A min-heap holds (distance, node) pairs. Each round, pop the closest node. Because every edge weight is zero or more, nothing found later can make that node cheaper, so its distance is now final. Then relax its edges: if going through it gives a neighbour a shorter distance, update it and push the new pair.\n\nThe heap can hold old, larger entries for the same node. When you pop one whose distance is bigger than the best known, skip it. This lazy approach costs O(E log V). With a negative edge, a node popped as final could later get cheaper, so use Bellman-Ford instead, which costs O(V x E).",
        bullets: ["Final when popped, only if weights are non-negative", "Skip stale heap entries", "Negative weights: Bellman-Ford", "All pairs on a small graph: Floyd-Warshall, O(V^3)"],
      },
      {
        heading: "Picking the algorithm from the question",
        body: "Read the question for clues. \"Fewest moves\" or \"shortest\" with no costs means BFS. Costs that are all non-negative mean Dijkstra. If every cost is 0 or 1, a 0-1 BFS with a deque (push 0-cost moves to the front, 1-cost moves to the back) runs in O(V + E). \"Can all tasks be finished\" or \"in what order\" means topological sort. \"How many groups\" or \"are these connected\" means DFS, BFS or union-find. A limit on the number of stops, as in Cheapest Flights Within K Stops, suits a Bellman-Ford variant that runs only k + 1 rounds.",
        visual: {
          type: "tree",
          title: "What does the question ask for?",
          root: "Graph question",
          children: [
            { label: "Fewest steps", children: ["No weights: BFS", "Weights 0 or 1: 0-1 BFS"] },
            { label: "Cheapest path", children: ["Non-negative: Dijkstra", "Negative or k stops: Bellman-Ford"] },
            { label: "Order of tasks", children: ["Topological sort", "Leftover nodes mean a cycle"] },
            { label: "Groups or connected?", children: ["DFS or BFS flood fill", "Union-find if edges arrive over time"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Dijkstra from A: A-B 4, A-C 1, C-B 2, B-D 1, C-D 5",
        steps: [
          { label: "Start", detail: "A = 0, all others infinity" },
          { label: "Pop A (0)", detail: "B = 4, C = 1" },
          { label: "Pop C (1)", detail: "B improves to 3, D = 6" },
          { label: "Pop B (3)", detail: "D improves to 4" },
          { label: "Pop D (4)", detail: "Old entries B 4 and D 6 are skipped" },
          { label: "Done", detail: "A 0, C 1, B 3, D 4" },
        ],
      },
    ],
    examples: [
      {
        title: "Course Schedule: can all courses be finished?",
        explanation: "numCourses = 4, prerequisites [[1, 0], [2, 1], [3, 1], [3, 2]], where [a, b] means take b before a. Build edges 0 to 1, 1 to 2, 1 to 3, 2 to 3, and count incoming edges: course 0 has none, so it starts in the queue. Take 0: course 1 drops to 0 incoming, add it. Take 1: course 2 drops to 0, course 3 drops to 1. Take 2: course 3 drops to 0. Take 3. All 4 were taken, so the answer is true. Add the rule [1, 3] and courses 1, 2 and 3 never reach zero, so only 1 course is taken: false.",
        code: {
          lang: "java",
          code: `boolean canFinish(int n, int[][] prereq) {
    List<List<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
    int[] indeg = new int[n];
    for (int[] p : prereq) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
    Deque<Integer> queue = new ArrayDeque<>();
    for (int i = 0; i < n; i++) if (indeg[i] == 0) queue.offer(i);
    int taken = 0;
    while (!queue.isEmpty()) {
        int c = queue.poll(); taken++;
        for (int next : adj.get(c)) if (--indeg[next] == 0) queue.offer(next);
    }
    return taken == n;  // fewer means a cycle blocked some courses
}`,
        },
      },
      {
        title: "Network Delay Time with Dijkstra",
        explanation: "times = [[2, 1, 1], [2, 3, 1], [3, 4, 1]], n = 4, source k = 2. Each entry is (from, to, time). Pop node 2 at time 0 and push 1 and 3 at time 1. Pop 1 (time 1, no edges out). Pop 3 (time 1) and push 4 at time 2. Pop 4 at time 2. Every node was reached, and the signal reaches the last one at time 2, so the answer is 2. If some node were never reached, the answer would be -1.",
        code: {
          lang: "python",
          code: `import heapq
from collections import defaultdict
def network_delay_time(times, n, k):
    adj = defaultdict(list)
    for u, v, w in times:
        adj[u].append((v, w))
    dist, heap = {}, [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist:
            continue                 # already final with a smaller time
        dist[u] = d
        for v, w in adj[u]:
            if v not in dist: heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1  # O(E log V)`,
        },
      },
    ],
    cheatSheet: [
      "Undirected edge u-v: add v to adj[u] and u to adj[v]",
      "Mark a node seen when you push it, not when you pop it, so it is queued only once",
      "Multi-source BFS: put every source in the queue at distance 0 before starting",
      "Directed cycle check: an edge into a gray node (on the current path) means a cycle",
      "Dijkstra: skip any popped entry whose distance is larger than the best known",
      "Negative weights: Bellman-Ford in O(V x E); at most k stops: run k + 1 rounds",
      "Deep recursive DFS on big grids can overflow the stack; use BFS or an explicit stack",
      "Weights only 0 or 1: 0-1 BFS with a deque runs in O(V + E)",
    ],
    quiz: [
      {
        q: "You need the fewest moves for a knight to reach a square on an empty chessboard. What is the best fit?",
        options: ["DFS", "BFS", "Dijkstra", "Topological sort"],
        answer: 1,
        why: "Every move costs the same, so BFS reaches each square first by the fewest moves.",
      },
      {
        q: "During DFS on a directed graph, which event proves there is a cycle?",
        options: ["Reaching a black (finished) node", "Reaching a node with no incoming edges", "Reaching a gray node that is still on the current path", "Visiting a node from two different parents"],
        answer: 2,
        why: "A gray node is an ancestor on the current path, so an edge back to it closes a loop.",
      },
      {
        q: "Why does Dijkstra's algorithm give wrong answers with negative edge weights?",
        options: ["A node treated as final could still get a cheaper distance later", "The heap cannot store negative numbers", "It runs forever", "It only works on undirected graphs"],
        answer: 0,
        why: "The proof relies on paths only getting longer as you add edges, which negative weights break.",
      },
      {
        q: "What is the time complexity of Number of Islands on an m x n grid?",
        options: ["O((m x n)^2)", "O(m + n)", "O(m x n x log(m x n))", "O(m x n)"],
        answer: 3,
        why: "Each cell is scanned once and flood-filled at most once.",
      },
      {
        q: "How much memory does an adjacency matrix use for V nodes?",
        options: ["O(V + E)", "O(V^2)", "O(E)", "O(V log V)"],
        answer: 1,
        why: "It stores one cell for every possible pair of nodes, used or not.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find if Path Exists in Graph: given n nodes, an undirected edge list, a source and a destination, return true if the destination is reachable.",
        hint: "Build an adjacency list with both directions, then BFS from the source.",
        solution: `from collections import deque
def valid_path(n, edges, source, destination):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)    # undirected
    seen, queue = {source}, deque([source])
    while queue:
        node = queue.popleft()
        if node == destination: return True
        for nxt in adj[node]:
            if nxt not in seen: seen.add(nxt); queue.append(nxt)
    return False`,
      },
      {
        level: "medium",
        task: "Rotting Oranges: each minute, rotten oranges (2) rot their fresh neighbours (1). Return the minutes until no fresh orange is left, or -1 if that never happens.",
        hint: "Multi-source BFS: start with every rotten orange at once and count levels.",
        solution: `def oranges_rotting(grid):
    m, n, minutes = len(grid), len(grid[0]), 0
    level = [(r, c) for r in range(m) for c in range(n) if grid[r][c] == 2]
    fresh = sum(row.count(1) for row in grid)
    while level and fresh:
        nxt = []                               # one minute = one BFS level
        for r, c in level:
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < m and 0 <= nc < n and grid[nr][nc] == 1:
                    grid[nr][nc] = 2; fresh -= 1; nxt.append((nr, nc))
        level, minutes = nxt, minutes + 1
    return minutes if fresh == 0 else -1`,
      },
      {
        level: "hard",
        task: "Cheapest Flights Within K Stops: find the cheapest price from src to dst using at most k stops, or -1.",
        hint: "At most k stops means at most k + 1 flights. Run k + 1 rounds of Bellman-Ford, each based on a copy of the previous round.",
        solution: `def find_cheapest_price(n, flights, src, dst, k):
    INF = float('inf')
    cost = [INF] * n
    cost[src] = 0
    for _ in range(k + 1):                # each round allows one more flight
        nxt = cost[:]                     # copy, so a round adds only one edge
        for u, v, w in flights:
            if cost[u] + w < nxt[v]:
                nxt[v] = cost[u] + w
        cost = nxt
    return -1 if cost[dst] == INF else cost[dst]  # O(k x E)`,
      },
    ],
    faq: [
      { q: "Should I use BFS or DFS?", a: "Use BFS when you need the fewest steps or want to work level by level. Use DFS for exploring whole regions, detecting cycles or building a topological order. For simply visiting everything, either works." },
      { q: "When do I need Dijkstra instead of BFS?", a: "When edges have different non-negative costs. BFS counts edges, not total cost, so it can pick a path with fewer but more expensive edges." },
      { q: "How do I spot a graph problem when the word graph never appears?", a: "Look for things linked to other things: grid cells with neighbours, tasks with dependencies, words that change one letter at a time, or states you can move between. Each thing is a node and each allowed move is an edge." },
      { q: "Do I need to know A*, Floyd-Warshall or minimum spanning trees?", a: "They come up less often. Know that Floyd-Warshall finds all-pairs shortest paths in O(V^3) for small graphs, and that Kruskal's minimum spanning tree uses sorting plus union-find; A* is rare outside game and map roles." },
    ],
  },

  "dsa/dp": {
    plain: [
      "Dynamic programming (DP) sounds scary, but the idea is simple: never solve the same small problem twice. Write down each answer the first time you work it out, and look it up the next time you need it.",
      "Picture climbing stairs where you may take 1 or 2 steps at a time. The number of ways to reach step 10 is the ways to reach step 9 plus the ways to reach step 8. A plain recursive solution recomputes step 8, step 7 and so on again and again. Remembering them turns an exponential amount of work into about 10 additions.",
      "DP needs two ingredients. First, the big answer must be built from answers to smaller versions of the same question. Second, those smaller questions must repeat. Most \"count the ways\", \"minimum cost\" and \"maximum value\" problems have both.",
      "There are two ways to write it. Top-down (memoisation) is your recursive solution plus a cache. Bottom-up (tabulation) fills a table in a loop, starting from the smallest cases. Both give the same answers; pick whichever you find easier to get right, then improve it if asked.",
    ],
    deepDive: [
      {
        heading: "Finding the state: what must I know to continue?",
        body: "The state is the smallest set of facts that fully describes a subproblem. Ask: \"if I stopped halfway, what would I need to write down to finish later?\" In House Robber, you only need the index of the next house, so the state is i. In Longest Common Subsequence (LCS), you need a position in each string, so the state is (i, j). In 0/1 knapsack, you need the item index and the remaining capacity.\n\nThe state decides the cost. Time is the number of states times the work per state. LCS has m x n states and does O(1) work for each, so it is O(m x n). If your state has too many parts, the table explodes; look for a part you can drop.",
        bullets: ["State: what you must remember", "Transition: how a state uses smaller states", "Base case: states you know without work", "Answer: which state holds the final result"],
      },
      {
        heading: "One problem, three versions: House Robber",
        body: "You cannot rob two neighbouring houses. Let best(i) be the most money from the first i houses. For the last house you either skip it, giving best(i - 1), or rob it, giving best(i - 2) + nums[i - 1]. Take the larger.\n\nWritten as plain recursion, this branches twice per call and costs O(2^n). Add a cache (memoisation) and each of the n states is solved once: O(n) time and O(n) space. Then notice that each state only uses the two before it, so a loop with two variables gives O(n) time and O(1) space. Interviewers often ask for exactly this progression, so practise walking through all three out loud.",
        visual: {
          type: "compare",
          title: "House Robber in three forms",
          columns: [
            { title: "Plain recursion", points: ["Two calls per call", "Recomputes the same houses", "O(2^n) time"] },
            { title: "Memoised", points: ["Same recursion plus a cache", "Each i solved once", "O(n) time, O(n) space"] },
            { title: "Two variables", points: ["Loop from the first house", "Keep only best(i - 1) and best(i - 2)", "O(n) time, O(1) space"] },
          ],
        },
      },
      {
        heading: "2D DP on two strings or a grid",
        body: "For two strings a and b, let dp[i][j] be the answer for the first i characters of a and the first j characters of b. Give the table an extra row and column for empty prefixes, so dp[0][j] and dp[i][0] are base cases and you never index outside the strings.\n\nIn LCS, if the last characters match, dp[i][j] = dp[i - 1][j - 1] + 1. If not, drop one character from either string and keep the better result: max(dp[i - 1][j], dp[i][j - 1]). Fill the table row by row, left to right, so every cell you read is already done. Unique Paths works the same way on a grid: paths to a cell equal paths from above plus paths from the left. When a row only reads the previous row, you can keep two rows and cut space to O(n).",
        visual: {
          type: "flow",
          title: "Filling one LCS cell dp[i][j]",
          steps: [
            { label: "Compare characters", detail: "a[i - 1] versus b[j - 1]" },
            { label: "Equal", detail: "dp[i - 1][j - 1] + 1, the diagonal plus one" },
            { label: "Different", detail: "max(dp[i - 1][j], dp[i][j - 1]), above or left" },
            { label: "Move on", detail: "Next cell to the right, then the next row" },
            { label: "Answer", detail: "dp[m][n], the bottom-right cell" },
          ],
        },
      },
      {
        heading: "The knapsack family and loop direction",
        body: "In 0/1 knapsack each item can be used once. With a one-dimensional array dp[c] (best value with capacity c), loop over items, and for each item loop capacity downward from the maximum to the item's weight. Going downward means dp[c - w] still holds the value from before this item, so the item cannot be counted twice.\n\nIn unbounded problems like Coin Change, a coin can be reused, so loop the amount upward: dp[a - c] may already include this coin, which is exactly what you want. For counting, loop order matters too. In Coin Change II, putting coins in the outer loop counts combinations (1 + 2 equals 2 + 1). Putting amounts in the outer loop counts ordered sequences, which is a different problem (Combination Sum IV).",
        bullets: ["0/1 knapsack: capacity loop goes down", "Unbounded: amount loop goes up", "Coins outer: combinations", "Amount outer: ordered sequences"],
      },
      {
        heading: "Patterns worth recognising",
        body: "Most interview DP problems fall into a few families, and knowing them makes the state obvious. Linear problems use dp[i] over a single array: Climbing Stairs, House Robber, Decode Ways, Word Break. Grid problems use dp[r][c]: Unique Paths, Minimum Path Sum. Two-sequence problems use dp[i][j]: LCS, Edit Distance. Knapsack problems use (item, capacity): Partition Equal Subset Sum, Coin Change, Target Sum. Interval problems use dp[l][r] over a range: Longest Palindromic Substring, Burst Balloons.\n\nLongest Increasing Subsequence deserves its own note. The simple DP is O(n^2): for each i, look at every earlier j with a smaller value. There is also an O(n log n) method that keeps the smallest possible tail for each length and binary searches it. Know both and mention the faster one.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Why plain recursion is slow: the calls made by fib(5)",
        root: "fib(5)",
        children: [
          { label: "fib(4)", children: ["fib(3), computed once here", "fib(2)"] },
          { label: "fib(3), computed again", children: ["fib(2), computed again", "fib(1)"] },
        ],
      },
    ],
    examples: [
      {
        title: "House Robber: [2, 7, 9, 3, 1]",
        explanation: "Keep two numbers: prev2 (best up to two houses back) and prev1 (best up to the last house), both 0 at the start. House 2: max(0, 0 + 2) = 2. House 7: max(2, 0 + 7) = 7. House 9: max(7, 2 + 9) = 11. House 3: max(11, 7 + 3) = 11. House 1: max(11, 11 + 1) = 12. The answer is 12: rob the houses with 2, 9 and 1. O(n) time, O(1) space.",
        code: {
          lang: "java",
          code: `int rob(int[] nums) {
    int prev2 = 0, prev1 = 0;                  // best two back, best one back
    for (int x : nums) {
        int cur = Math.max(prev1, prev2 + x);  // skip this house, or rob it
        prev2 = prev1;
        prev1 = cur;
    }
    return prev1;
}`,
        },
      },
      {
        title: "Longest Common Subsequence of \"abcde\" and \"ace\"",
        explanation: "A subsequence keeps the order but may skip characters. Build a 6 x 4 table with row 0 and column 0 set to 0 for empty prefixes. Matching a with a gives 1 on the diagonal. Later, c matches c, so that cell is the diagonal value 1 plus 1, which is 2. Finally e matches e, giving 3. Cells where characters differ copy the larger of the cell above and the cell to the left. The bottom-right cell holds 3, for the subsequence \"ace\".",
        code: {
          lang: "java",
          code: `int longestCommonSubsequence(String a, String b) {
    int m = a.length(), n = b.length();
    int[][] dp = new int[m + 1][n + 1];   // row 0 and column 0: empty prefix
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                ? dp[i - 1][j - 1] + 1
                : Math.max(dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];  // O(m x n) time and space
}`,
        },
      },
    ],
    cheatSheet: [
      "Time = number of states x work per state; space = the part of the table you keep",
      "0/1 knapsack in a 1D array: loop capacity downward so each item is used once",
      "Unbounded (Coin Change): loop the amount upward so a coin can be reused",
      "Count combinations: coins in the outer loop; count orderings: amount in the outer loop",
      "String DP: add an empty-prefix row and column to avoid edge checks",
      "If dp[i] needs only dp[i - 1] and dp[i - 2], keep two variables for O(1) space",
      "LIS: O(n^2) DP, or O(n log n) by binary searching the smallest tails",
      "Python memo: @functools.cache; deep recursion may need sys.setrecursionlimit",
    ],
    quiz: [
      {
        q: "Which transition is correct for House Robber, where best(i) covers the first i houses?",
        options: ["best(i - 1) + nums[i - 1]", "max(nums)", "best(i - 2) + best(i - 1)", "max(best(i - 1), best(i - 2) + nums[i - 1])"],
        answer: 3,
        why: "You either skip house i, or rob it and add the best total from two houses back.",
      },
      {
        q: "In Coin Change II (count the ways to make an amount), why do the coins go in the outer loop?",
        options: ["So each combination is counted once, not once per ordering", "Because it is faster", "To allow negative amounts", "So each coin is used at most once"],
        answer: 0,
        why: "Processing one coin at a time fixes an order of coins, so 1 + 2 and 2 + 1 count as one way.",
      },
      {
        q: "In a 1D 0/1 knapsack, why does the capacity loop run downward?",
        options: ["To save memory", "So dp[c - w] still holds the value from before this item", "Because weights must be sorted", "It turns the problem into unbounded knapsack"],
        answer: 1,
        why: "Going upward would let the same item be added again in the same pass.",
      },
      {
        q: "What is the LCS length of \"abcde\" and \"ace\"?",
        options: ["2", "5", "3", "1"],
        answer: 2,
        why: "\"ace\" appears in order inside \"abcde\", and no longer common subsequence exists.",
      },
      {
        q: "How many paths does Unique Paths give on a 3 x 7 grid (moving only right or down)?",
        options: ["21", "28", "10", "42"],
        answer: 1,
        why: "You make 2 down moves among 8 total moves: C(8, 2) = 28, the same value the DP table produces.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Min Cost Climbing Stairs: cost[i] is paid when you step on stair i, you may climb 1 or 2 stairs, and you may start on stair 0 or 1. Return the cheapest cost to reach the top (just past the last stair).",
        hint: "Let dp[i] be the cheapest cost to stand on position i. dp[0] = dp[1] = 0.",
        solution: `def min_cost_climbing_stairs(cost):
    a, b = 0, 0        # cheapest cost to reach positions i - 2 and i - 1
    for i in range(2, len(cost) + 1):
        a, b = b, min(b + cost[i - 1], a + cost[i - 2])
    return b           # [10, 15, 20] -> 15`,
      },
      {
        level: "medium",
        task: "Coin Change II: count the combinations of coins that make up an amount. Coins can be reused.",
        hint: "ways[0] = 1. For each coin, loop the amount upward and add ways[a - coin].",
        solution: `def change(amount, coins):
    ways = [1] + [0] * amount        # one way to make 0: take nothing
    for c in coins:                  # coins outer: combinations, not orderings
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]              # change(5, [1, 2, 5]) -> 4`,
      },
      {
        level: "hard",
        task: "Edit Distance: the fewest inserts, deletes and replacements to turn word a into word b.",
        hint: "dp[i][j] for the first i and j characters. Base cases: turning a prefix into an empty string costs its length.",
        solution: `def min_distance(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = i        # delete everything
    for j in range(n + 1): dp[0][j] = j        # insert everything
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:  # delete, insert, replace
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    return dp[m][n]                            # horse -> ros = 3`,
      },
    ],
    faq: [
      { q: "How do I get better at dynamic programming?", a: "Learn the families (linear, grid, two strings, knapsack, intervals) and solve three or four problems in each. For every problem, write the state and the transition in plain words before writing any code." },
      { q: "Should I use top-down or bottom-up in an interview?", a: "Top-down is usually faster to write correctly because it follows the recursion you already found. If the interviewer asks for better space or worries about recursion depth, convert it to a table and then shrink the table." },
      { q: "What is the difference between DP and divide and conquer?", a: "Both split a problem into smaller ones. In divide and conquer, like merge sort, the pieces do not overlap, so there is nothing to reuse. DP is for when the same pieces come up again and again." },
    ],
  },

  "dsa/greedy": {
    plain: [
      "A greedy algorithm makes the choice that looks best right now and never changes its mind. When you give change in cash, you hand over the biggest note that fits, then the next biggest, and so on. For normal currency, that simple habit gives the fewest notes and coins.",
      "Greedy is fast and the code is short, often a sort followed by one loop. The catch is that it is not always right. With coins of 1, 3 and 4, making 6 the greedy way gives 4 + 1 + 1, but 3 + 3 uses fewer coins. Greedy only works when you can argue that the local best choice never hurts later.",
      "Intervals are where greedy shines. An interval is a start and an end, like a meeting from 9:00 to 10:30. Questions ask you to merge overlapping meetings, fit in as many as possible, count how many rooms you need, or remove the fewest so none overlap.",
      "For almost every interval problem, the first step is to sort, either by start time or by end time. Choosing the right one is most of the solution.",
    ],
    deepDive: [
      {
        heading: "Proving a greedy choice is safe",
        body: "Interviewers may ask \"why does greedy work here?\" The usual answer is an exchange argument. Take any optimal solution. Find the first place it differs from the greedy one, and swap in the greedy choice. Show the result is still valid and no worse. Repeat, and the optimal solution turns into the greedy one, so greedy must be optimal too.\n\nFor picking the most non-overlapping meetings: greedy picks the meeting that ends first. Any optimal plan has some first meeting. Replace it with the earliest-ending one: it ends no later, so it cannot clash with anything after it. Nothing is lost. Before you rely on greedy, also try to break it with two or three tiny examples.",
        bullets: ["Exchange: swapping in the greedy choice never hurts", "Stays ahead: greedy is never behind at any step", "Always test small counterexamples first"],
      },
      {
        heading: "Sort by start, or sort by end?",
        body: "Sort by start when you need to combine intervals or sweep through time in order. Merge Intervals and Insert Interval sort by start, so overlapping intervals become neighbours. Sort by end when you want to keep as many intervals as possible. Non-overlapping Intervals (fewest removals), Minimum Number of Arrows to Burst Balloons and classic activity selection keep the one that ends first, because it leaves the most room for the rest.\n\nMeeting Rooms II (how many rooms are needed) sorts by start and keeps a min-heap of the end times of rooms in use. If the earliest end is at or before the new start, that room is free and reused; otherwise a new room opens. The heap size at the end is the answer.",
        visual: {
          type: "compare",
          title: "Which sort key?",
          columns: [
            { title: "Sort by start", points: ["Merge Intervals", "Insert Interval", "Meeting Rooms II (plus a heap)", "Sweep through time in order"] },
            { title: "Sort by end", points: ["Non-overlapping Intervals", "Minimum Arrows for Balloons", "Max number of meetings", "Earliest finish leaves most room"] },
          ],
        },
      },
      {
        heading: "Jump Game I and II",
        body: "In Jump Game, nums[i] is the longest jump from index i. Track farthest, the furthest index you can reach so far. Walk left to right: if i ever becomes greater than farthest, you are stuck and the answer is false. Otherwise update farthest = max(farthest, i + nums[i]). One pass, O(n), no DP needed.\n\nJump Game II asks for the fewest jumps. Think of it as BFS in levels without a queue. The indices reachable with one jump form a window; keep the end of the current window and the farthest reach from inside it. When i reaches the current end, you must jump: count one jump and set the end to the farthest reach. This is also O(n) and is a nice example of greedy that behaves like BFS.",
      },
      {
        heading: "Gas Station, step by step",
        body: "There are n stations in a circle; gas[i] is what you collect at station i and cost[i] is what it takes to reach the next one. First, if the total gas is less than the total cost, no start works: return -1. Otherwise exactly one answer is guaranteed by the problem.\n\nTo find it, drive from station 0 keeping a tank total. If the tank goes negative after station i, then no station from the current start up to i can be the answer: each of them would reach i with no more gas than you had. So restart at i + 1 with an empty tank. The last start you set is the answer. One pass, O(n) time, O(1) space.",
        visual: {
          type: "flow",
          title: "Gas Station scan",
          steps: [
            { label: "Check totals", detail: "Total gas below total cost: return -1" },
            { label: "Drive forward", detail: "tank += gas[i] - cost[i]" },
            { label: "Tank negative?", detail: "No start from here to i can work" },
            { label: "Restart", detail: "start = i + 1, tank = 0" },
            { label: "Return start", detail: "The last restart point is the answer" },
          ],
        },
      },
      {
        heading: "Edge cases interviewers watch for",
        body: "Ask whether touching intervals overlap. In Merge Intervals, [1, 2] and [2, 3] merge into [1, 3], so the test is start <= last end. In Non-overlapping Intervals they do not clash, so you keep both. In Meeting Rooms a meeting ending at 10 frees the room for one starting at 10. One wrong comparison operator changes the answer.\n\nOther traps: forgetting max() when extending a merge, so a short interval inside a long one cuts the end short; sorting by the wrong key; returning early on an empty input; and modifying the input array when the caller did not expect it. Saying these out loud shows care.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Non-overlapping Intervals: [1,2], [2,3], [3,4], [1,3]",
        steps: [
          { label: "Sort by end", detail: "[1,2], [2,3], [1,3], [3,4]" },
          { label: "Keep [1,2]", detail: "Last end = 2" },
          { label: "Keep [2,3]", detail: "Starts at 2, not before 2; last end = 3" },
          { label: "Remove [1,3]", detail: "Starts at 1, before 3: removals = 1" },
          { label: "Keep [3,4]", detail: "Answer: remove 1 interval" },
        ],
      },
    ],
    examples: [
      {
        title: "Meeting Rooms II: [[0, 30], [5, 10], [15, 20]]",
        explanation: "Sort by start (already sorted). Meeting 0 to 30: no rooms yet, open one; the heap of end times is {30}. Meeting 5 to 10: the earliest end is 30, after 5, so open a second room: {10, 30}. Meeting 15 to 20: the earliest end is 10, at or before 15, so that room is free: remove 10 and add 20: {20, 30}. Two rooms are in use, so the answer is 2. Sorting is O(n log n) and each heap step is O(log n).",
        code: {
          lang: "java",
          code: `int minMeetingRooms(int[][] meetings) {
    Arrays.sort(meetings, (a, b) -> Integer.compare(a[0], b[0]));  // by start
    PriorityQueue<Integer> ends = new PriorityQueue<>();  // end times of busy rooms
    for (int[] m : meetings) {
        if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll();  // reuse a free room
        ends.offer(m[1]);
    }
    return ends.size();
}`,
        },
      },
      {
        title: "Gas Station: gas [1, 2, 3, 4, 5], cost [3, 4, 5, 1, 2]",
        explanation: "Gas minus cost at each station: -2, -2, -2, 3, 3. The total is 0, which is not negative, so an answer exists. Start at 0: the tank is -2, so restart at 1. Again -2, restart at 2. Again -2, restart at 3. Now the tank goes 3, then 6, and never drops below zero. The answer is station 3. Check: from 3 you have 4 - 1 = 3, then 3 + 5 - 2 = 6, then 6 + 1 - 3 = 4, then 4 + 2 - 4 = 2, then 2 + 3 - 5 = 0, and you are back.",
        code: {
          lang: "java",
          code: `int canCompleteCircuit(int[] gas, int[] cost) {
    int total = 0, tank = 0, start = 0;
    for (int i = 0; i < gas.length; i++) {
        int diff = gas[i] - cost[i];
        total += diff;
        tank += diff;
        if (tank < 0) {       // cannot get past i from start
            start = i + 1;    // so no station from start to i works
            tank = 0;
        }
    }
    return total >= 0 ? start : -1;
}`,
        },
      },
    ],
    cheatSheet: [
      "Merge Intervals: sort by start; overlap when start <= last end; extend with max()",
      "Most intervals kept (or fewest removed): sort by end and keep the earliest finisher",
      "Meeting Rooms II: sort by start, min-heap of end times; the answer is the heap size",
      "Jump Game: farthest = max(farthest, i + nums[i]); fail if i > farthest",
      "Gas Station: total gas below total cost means -1; else restart after each negative tank",
      "Before trusting greedy, try three or four tiny counterexamples by hand",
      "Ask whether touching intervals like [1, 2] and [2, 3] count as overlapping",
    ],
    quiz: [
      {
        q: "To keep the largest number of non-overlapping meetings, how should you sort them?",
        options: ["By start, ascending", "By length, ascending", "By end, ascending", "By start, descending"],
        answer: 2,
        why: "The meeting that ends first leaves the most time for the others, which the exchange argument proves optimal.",
      },
      {
        q: "How many rooms does Meeting Rooms II need for [[1, 5], [2, 6], [5, 7]]?",
        options: ["1", "2", "3", "0"],
        answer: 1,
        why: "The first two overlap, but the third starts at 5 exactly when the first ends, so it reuses that room.",
      },
      {
        q: "What does Jump Game return for [3, 2, 1, 0, 4]?",
        options: ["true", "true, by jumping straight to the end", "false, whenever the array contains a zero", "false, because no index can reach past index 3"],
        answer: 3,
        why: "Every index from 0 to 3 reaches at most index 3, which holds 0, so index 4 is never reachable.",
      },
      {
        q: "In Gas Station, why can you skip every station between the start and i when the tank goes negative at i?",
        options: ["Starting at any of them reaches i with no more gas than you had", "Those stations always have zero gas", "The problem guarantees the answer is i", "Because the array is sorted"],
        answer: 0,
        why: "You arrived at each of them with zero or more gas, so starting there with an empty tank cannot do better.",
      },
      {
        q: "Which problem is NOT solved correctly by a simple greedy rule?",
        options: ["Fractional knapsack (you may take part of an item)", "0/1 knapsack (take an item whole or not at all)", "Merge Intervals", "Activity selection"],
        answer: 1,
        why: "Taking the best value per weight first can leave unusable space when items cannot be split, so 0/1 knapsack needs DP.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Assign Cookies: each child needs a cookie of at least their greed size. Each cookie goes to at most one child. Maximise the number of happy children.",
        hint: "Sort both lists. Give each cookie, smallest first, to the least greedy child it can satisfy.",
        solution: `def find_content_children(greed, cookies):
    greed.sort(); cookies.sort()
    child = 0
    for c in cookies:                   # smallest cookie first
        if child < len(greed) and c >= greed[child]:
            child += 1                  # it satisfies the least greedy child left
    return child`,
      },
      {
        level: "medium",
        task: "Minimum Number of Arrows to Burst Balloons: each balloon spans [start, end] on a line, and an arrow at x bursts every balloon with start <= x <= end. Find the fewest arrows.",
        hint: "Sort by end. Shoot at the end of the first balloon that the last arrow missed.",
        solution: `def find_min_arrow_shots(points):
    points.sort(key=lambda p: p[1])     # by end
    arrows, last = 0, float('-inf')
    for start, end in points:
        if start > last:                # the last arrow misses this balloon
            arrows += 1
            last = end                  # shoot at its end to hit the most
    return arrows`,
      },
      {
        level: "hard",
        task: "Candy: children stand in a line with ratings. Each gets at least one candy, and a child with a higher rating than a neighbour must get more than that neighbour. Find the minimum total.",
        hint: "Two passes: left to right for the left neighbour rule, then right to left for the right neighbour rule, keeping the max.",
        solution: `def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):                   # beat the left neighbour
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):          # beat the right neighbour too
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)                           # [1, 0, 2] -> 5`,
      },
    ],
    faq: [
      { q: "How do I know if a problem needs greedy or DP?", a: "Try to break the greedy idea with a tiny example. If you find a case where the local best choice leads to a worse total, you need DP. If you cannot, and you can explain why swapping in the greedy choice never hurts, greedy is likely right." },
      { q: "Do I have to prove my greedy solution in an interview?", a: "Not formally, but give a short reason, such as \"the meeting that ends first leaves the most room for the rest\". That sentence shows you did not just guess." },
      { q: "Why do almost all interval problems start with sorting?", a: "Unsorted intervals can overlap in any order, so you would have to compare every pair, which is O(n^2). Sorting puts related intervals next to each other, and one linear scan finishes the job." },
    ],
  },

  "dsa/tries": {
    plain: [
      "A trie (said like \"try\") is a tree for storing words, one letter per step. Think of a phone contact list: type \"ma\" and it shows Mark, Maria and Max. Those names share the path m, a, and only split after that. A trie stores that shared start once, so finding every word with a given prefix is quick.",
      "Each node in a trie holds its children (one for each next letter) and a small flag that says \"a word ends here\". Without that flag you could not tell that \"car\" is a word but \"ca\" is not.",
      "Union-find solves a different question: which things are in the same group? Picture people at a party. At first everyone stands alone. Each time two people shake hands, their whole groups merge. Union-find can tell you at any time whether two people are now connected, almost instantly.",
      "Both structures show up in interviews because they turn slow searches into fast ones. A trie makes prefix questions take time proportional to the word length. Union-find makes \"are these connected?\" nearly constant time, even as connections keep arriving.",
    ],
    deepDive: [
      {
        heading: "Children: array or hash map?",
        body: "Each trie node needs a way to find its child for the next letter. If the words use only lowercase English letters, a fixed array of 26 slots is fastest: the child for c is at index c - 'a'. The cost is memory: every node carries 26 pointers even if it uses one.\n\nA hash map of children uses memory only for letters that exist and works for any characters, such as Unicode or mixed case, but each step is a little slower. Either way, insert and search cost O(L) for a word of length L, no matter how many words are stored. The total memory is at most the number of characters inserted, and less when words share prefixes.",
        bullets: ["Array of 26: fast, more memory, lowercase only", "Hash map: flexible, less memory per node", "Insert and search: O(L)", "Memory: at most total characters stored"],
      },
      {
        heading: "Prefix queries, autocomplete and deletion",
        body: "startsWith(prefix) is a search that does not check the end flag at the last node. Autocomplete walks to the prefix node, then runs a DFS below it to collect words. Real autocomplete systems often store a small list of the top suggestions on each node, so they do not search the whole subtree on every keystroke.\n\nTo count how many words start with a prefix, keep a counter on each node and add 1 to every node you pass during insert. To delete a word, clear its end flag; then, walking back up, remove nodes that have no children and no end flag, so dead branches do not waste memory.",
      },
      {
        heading: "Word Search II: letting the trie drive the grid search",
        body: "Word Search II asks which words from a list appear in a letter grid. Running the single-word search once per word repeats a lot of work. Instead, insert all words into a trie. Then start a DFS from every cell, and only step to a neighbour if its letter is a child of the current trie node. Words that share a prefix are explored together in one walk.\n\nStore the whole word on its end node. When the DFS reaches a node with a word, add it to the results and remove it from the node so it is reported only once. A common speed-up is to delete trie branches that become empty, so later searches stop even sooner.",
        visual: {
          type: "flow",
          title: "Word Search II with a trie",
          steps: [
            { label: "Build the trie", detail: "Insert every word; store it on its end node" },
            { label: "Start at each cell", detail: "Only if its letter is a child of the root" },
            { label: "Step to neighbours", detail: "Only letters that are children of the current node" },
            { label: "Found a word node", detail: "Record the word, then clear it" },
            { label: "Restore and prune", detail: "Unmark the cell; drop empty branches" },
          ],
        },
      },
      {
        heading: "Union-find under the hood",
        body: "Union-find (also called disjoint set union, or DSU) stores a parent array. Each group is a tree, and the root is the group's name. find(x) follows parents up to the root. union(a, b) finds both roots and, if they differ, points one root at the other.\n\nTwo tricks make it fast. Path compression makes every node you pass during find point closer to the root (path halving points each node to its grandparent), so later finds are short. Union by size (or by rank) always attaches the smaller tree under the larger one, so trees stay shallow. With both, each operation costs O(α(n)) amortised. α is the inverse Ackermann function, which is at most 4 for any input that fits in the universe, so treat it as constant.",
        visual: {
          type: "compare",
          title: "Path compression during find(4)",
          columns: [
            { title: "Before", points: ["4 points to 3", "3 points to 2", "2 points to 1, the root", "find(4) takes 3 steps"] },
            { title: "After", points: ["4 points to 1", "3 points to 1", "2 points to 1", "Next find(4) takes 1 step"] },
          ],
        },
      },
      {
        heading: "When union-find beats BFS or DFS",
        body: "For a fixed graph you can count components with BFS or DFS just as well. Union-find shines when edges arrive one at a time and you need answers in between, such as \"how many islands after each new land cell?\" (Number of Islands II). It also finds the edge that creates a cycle in an undirected graph (Redundant Connection): if union(a, b) finds that a and b already share a root, that edge closes a loop.\n\nOther uses: grouping accounts that share an email (Accounts Merge), checking equations like a == b and b != c, and Kruskal's algorithm for minimum spanning trees. The one thing it cannot do is split a group again, so problems that delete edges need a different approach.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Counting components: 5 nodes, edges 0-1, 1-2, 3-4",
        steps: [
          { label: "Start", detail: "5 separate groups: 0, 1, 2, 3, 4" },
          { label: "union(0, 1)", detail: "Roots differ: merge, 4 groups" },
          { label: "union(1, 2)", detail: "Roots differ: merge, 3 groups" },
          { label: "union(3, 4)", detail: "Roots differ: merge, 2 groups" },
          { label: "Answer", detail: "5 nodes minus 3 merges = 2 components" },
        ],
      },
    ],
    examples: [
      {
        title: "Implement Trie with an array of 26 children",
        explanation: "Insert \"apple\": create nodes a, p, p, l, e and set the end flag on e. search(\"app\") walks a, p, p and finds the node, but its end flag is false, so it returns false. startsWith(\"app\") only needs the node to exist, so it returns true. Insert \"app\" and the same node gets its end flag, so search(\"app\") now returns true. Each call costs O(L) for a word of length L.",
        code: {
          lang: "java",
          code: `class Trie {
    private final Trie[] next = new Trie[26]; private boolean isWord;
    public void insert(String w) {
        Trie node = this;
        for (char ch : w.toCharArray()) {
            int i = ch - 'a';
            if (node.next[i] == null) node.next[i] = new Trie();
            node = node.next[i];
        }
        node.isWord = true;
    }
    public boolean search(String w) { Trie n = walk(w); return n != null && n.isWord; }
    public boolean startsWith(String p) { return walk(p) != null; }
    private Trie walk(String s) { Trie n = this; for (char ch : s.toCharArray()) { n = n.next[ch - 'a']; if (n == null) return null; } return n; }
}`,
        },
      },
      {
        title: "Number of Connected Components: n = 5, edges [[0, 1], [1, 2], [3, 4]]",
        explanation: "Start with 5 groups. Edge 0-1: roots 0 and 1 differ, merge, 4 groups. Edge 1-2: find(1) gives 0 (or 1, depending on which root won), find(2) gives 2, merge, 3 groups. Edge 3-4: merge, 2 groups. An edge whose ends already share a root would not reduce the count. The answer is 2. Union by size keeps the trees shallow, and path halving shortens them further on every find.",
        code: {
          lang: "python",
          code: `def count_components(n, edges):
    parent, size = list(range(n)), [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]    # path halving
            x = parent[x]
        return x
    groups = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb: continue                # already connected
        if size[ra] < size[rb]: ra, rb = rb, ra
        parent[rb] = ra; size[ra] += size[rb]   # smaller tree under larger
        groups -= 1
    return groups`,
        },
      },
    ],
    cheatSheet: [
      "Trie node: 26 child slots (lowercase only) or a hash map (any characters), plus an end flag",
      "Trie insert, search and startsWith each cost O(L) for a word of length L",
      "Prefix counts: add 1 to a counter on every node passed during insert",
      "Word Search II: store the word on its end node and clear it once found",
      "Path compression plus union by size: amortised O(α(n)), effectively constant",
      "union finding both ends already share a root means that edge closes a cycle",
      "Components = n minus the number of successful unions",
      "Union-find cannot split groups; problems that delete edges need another method",
    ],
    quiz: [
      {
        q: "A trie holds \"apple\" and \"app\". How does it know \"app\" is a whole word?",
        options: ["The second p node has no children", "The second p node has its end-of-word flag set", "The trie has exactly three levels", "It stores a separate list of words"],
        answer: 1,
        why: "The second p node has a child (l), so only the end flag can mark that a word stops there.",
      },
      {
        q: "In Redundant Connection, how does union-find spot the extra edge?",
        options: ["union finds that both ends already have the same root", "find returns -1", "The edge has the largest weight", "Both of its nodes have degree 1"],
        answer: 0,
        why: "If two nodes are already connected, adding another edge between them creates a cycle.",
      },
      {
        q: "What is the cost of searching a word of length L in a trie holding n words?",
        options: ["O(n)", "O(L log n)", "O(n x L)", "O(L)"],
        answer: 3,
        why: "You follow one child pointer per character, and the number of stored words does not matter.",
      },
      {
        q: "With path compression and union by size, what is the amortised cost per operation?",
        options: ["O(log n)", "O(n)", "O(α(n)), at most about 4 in practice", "O(1) in the worst case for every call"],
        answer: 2,
        why: "The inverse Ackermann function grows so slowly that it never exceeds about 4 for real inputs, though a single call can still be longer.",
      },
      {
        q: "Why is a trie better than running a separate grid search per word in Word Search II?",
        options: ["The trie uses less memory than the board", "One DFS walk follows all words that share a prefix at the same time", "Tries sort the words alphabetically", "It removes the need for recursion"],
        answer: 1,
        why: "Shared prefixes are explored once, and paths stop as soon as no word continues with that letter.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a countPrefix(prefix) operation to a trie that returns how many inserted words start with the prefix.",
        hint: "Keep a counter on each node and increase it on every node you pass during insert.",
        solution: `class Node:
    def __init__(self): self.kids, self.count = {}, 0   # count = words passing through
def insert(root, word):
    node = root
    for ch in word:
        node = node.kids.setdefault(ch, Node()); node.count += 1
def count_prefix(root, prefix):
    node = root
    for ch in prefix:
        if ch not in node.kids: return 0
        node = node.kids[ch]
    return node.count`,
      },
      {
        level: "medium",
        task: "Redundant Connection: a tree with nodes 1 to n had one extra edge added. Return the edge that, if removed, leaves a tree (the last such edge in the input).",
        hint: "Process edges in order with union-find. The first edge whose ends already share a root is the answer.",
        solution: `def find_redundant_connection(edges):
    parent = list(range(len(edges) + 1))     # nodes are 1..n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]                    # this edge closes a cycle
        parent[ra] = rb`,
      },
      {
        level: "hard",
        task: "Number of Islands II: an m x n grid starts as all water. positions lists cells that turn into land one by one. After each addition, return the number of islands.",
        hint: "Each new land cell is a new island. Union it with any land neighbours; every successful union removes one island.",
        solution: `def num_islands2(m, n, positions):
    parent, res, count = {}, [], 0
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    for r, c in positions:
        if (r, c) not in parent:
            parent[(r, c)] = (r, c); count += 1
            for nb in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if nb in parent and find(nb) != find((r, c)): parent[find(nb)] = find((r, c)); count -= 1
        res.append(count)
    return res`,
      },
    ],
    faq: [
      { q: "Should I use a trie or a hash set for a word list?", a: "A hash set is simpler and fast for exact lookups. Choose a trie when you need prefix queries, autocomplete, or to prune a search as soon as no word continues with the current letters." },
      { q: "What is the difference between union by rank and union by size?", a: "Union by size attaches the tree with fewer nodes under the bigger one; union by rank uses an upper bound on tree height instead. Both keep trees shallow and give the same complexity, so use whichever you remember." },
      { q: "Is union-find used outside interviews?", a: "Yes. It powers Kruskal's minimum spanning tree algorithm, grouping connected pixels in image processing, and finding which machines are linked in a network." },
    ],
  },
};

export default extra;
