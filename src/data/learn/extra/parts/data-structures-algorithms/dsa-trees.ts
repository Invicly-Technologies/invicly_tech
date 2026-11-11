import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-trees/tree-traversals": {
    plain: [
      "A tree is like a family tree or a folder structure on your computer. There is one top item, the root. Each item can have children below it. Items with no children are leaves. In a binary tree, every item (called a node) has at most two children: a left one and a right one.",
      "Traversing a tree means visiting every node once. There are two big styles. Depth-first goes as deep as possible down one branch before coming back. Breadth-first visits the tree level by level, like reading a page line by line.",
      "Depth-first has three flavours, depending on when you handle the node itself. Pre-order: the node first, then its children. In-order: left child, then the node, then right child. Post-order: both children first, then the node.",
      "Which one you choose depends on the question. Copying a tree? Pre-order, because you need the parent before its children. Deleting a tree or adding up sizes? Post-order, because you need the children's answers first. Printing a search tree in sorted order? In-order.",
    ],
    deepDive: [
      {
        heading: "Tree vocabulary with exact numbers",
        body: "The depth of a node is the number of edges from the root to it; the root has depth 0. The height of a tree is the largest depth of any node, so a single node has height 0 and an empty tree is often given height -1. Some books count nodes instead of edges, so always check which convention a problem uses.\n\nA binary tree of height h holds at most 2^(h+1) - 1 nodes, when every level is full. So n nodes need height at least floor(log2 n). The other extreme is a chain where each node has one child: height n - 1.\n\nA full binary tree has 0 or 2 children at every node. A complete binary tree fills every level except possibly the last, which fills from the left (this is the shape of a heap). A perfect tree has every level completely full. A tree with n nodes always has exactly n - 1 edges.",
        bullets: ["Depth counts down from the root; height is the maximum depth", "Height h: at most 2^(h+1) - 1 nodes", "n nodes: exactly n - 1 edges"],
      },
      {
        heading: "Iterative traversals with an explicit stack",
        body: "Recursive traversals use the call stack, which in Python fails on chains deeper than about 1000 nodes. An explicit stack has no such limit.\n\nPre-order is the easiest: push the root; pop a node, record it, push its right child and then its left child (so left is popped first).\n\nIn-order needs a pointer. Starting at the root, push nodes while going left. When you cannot go left, pop a node, record it, and move to its right child. Repeat while the pointer is not None or the stack is not empty.\n\nPost-order can be done by reversing a modified pre-order: record node, then visit right before left, and reverse the result at the end. That gives left, right, node. It uses O(n) extra memory for the output, which you need anyway.\n\nAll of these take O(n) time and O(h) stack. Morris traversal achieves O(1) extra space for in-order by temporarily rewiring right pointers, then restoring them.",
        visual: {
          type: "cycle",
          title: "Iterative in-order loop",
          steps: [
            { label: "Go left", detail: "Push the current node, move to its left child." },
            { label: "Hit None", detail: "No more left children." },
            { label: "Pop", detail: "Record the popped node's value." },
            { label: "Go right", detail: "Move to the popped node's right child." },
          ],
        },
      },
      {
        heading: "Level order and per-level answers",
        body: "Breadth-first traversal uses a queue (collections.deque, whose popleft is O(1)). Put the root in. Repeatedly take the front node, record it and add its children to the back.\n\nMany questions need the levels separated: the right side view, the average per level, or zigzag order. The trick is to read len(queue) at the start of each round. That many nodes belong to the current level; process exactly that many, and everything added meanwhile belongs to the next level.\n\nBFS memory is O(w), where w is the maximum width. For a perfect tree, the last level holds about half the nodes, so BFS can need O(n) memory while DFS needs only O(log n). For a chain it is the reverse. BFS also finds the shallowest node that satisfies a condition first, such as the minimum depth to a leaf, and can stop early.",
        bullets: ["for _ in range(len(q)) processes exactly one level", "BFS memory O(width), DFS memory O(height)", "Minimum depth: BFS stops at the first leaf"],
      },
      {
        heading: "Post-order thinking: height and diameter",
        body: "Many tree problems follow one pattern: ask each child for an answer, combine those answers at the node, and return the result upward. That is a post-order traversal.\n\nHeight: h(node) = 1 + max(h(left), h(right)), with h(None) = -1 when counting edges.\n\nDiameter is the longest path between any two nodes, measured in edges. It may not pass through the root. At each node, the longest path that bends there goes down the left side and down the right side: (h(left) + 1) + (h(right) + 1). Keep the best such value in a variable while computing heights, and you get the diameter in one O(n) pass. Computing height separately at every node would be O(n^2) for a chain.\n\nThe same pattern solves balanced-tree checks, maximum path sum, subtree sums and lowest common ancestor. Return what the parent needs, and update a global answer for what the whole tree needs.",
        visual: {
          type: "flow",
          title: "Diameter in one pass",
          steps: [
            { label: "Recurse left", detail: "Get left height L." },
            { label: "Recurse right", detail: "Get right height R." },
            { label: "Path through node", detail: "(L + 1) + (R + 1) edges." },
            { label: "Update best", detail: "best = max(best, path)." },
            { label: "Return", detail: "1 + max(L, R) to the parent." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which traversal for which job",
        columns: [
          { title: "Pre-order", points: ["Node before children", "Copy or serialise a tree", "Print folder structure", "Path from root to each node"] },
          { title: "In-order", points: ["Left, node, right", "BST keys in sorted order", "k-th smallest in a BST", "Validate a BST"] },
          { title: "Post-order", points: ["Children before node", "Height, size, sums", "Delete or free a tree", "Evaluate an expression tree"] },
        ],
      },
    ],
    examples: [
      {
        title: "Iterative in-order on a deep tree",
        explanation: "We build a chain of 5,000 nodes, each the left child of the next, so the tree has height 4,999. A recursive in-order would raise RecursionError at the default limit of 1000. The stack-based version walks down the left spine, pushing every node, then pops them in increasing order. It visits all 5,000 values in O(n) time.",
        code: {
          lang: "python",
          code: "class TreeNode:\n    def __init__(self, val, left=None, right=None):\n        self.val, self.left, self.right = val, left, right\n\ndef inorder_iter(root):\n    out, stack, node = [], [], root\n    while node or stack:\n        while node:\n            stack.append(node); node = node.left\n        node = stack.pop()\n        out.append(node.val)\n        node = node.right\n    return out\n\nroot = None\nfor v in range(5000): root = TreeNode(v, left=root)\nprint(inorder_iter(root)[:3], len(inorder_iter(root)))  # [0, 1, 2] 5000",
        },
      },
      {
        title: "Diameter and right side view",
        explanation: "Take the tree 1 with children 2 and 3, where 2 has children 4 and 5. The diameter is 3 edges (4 to 2 to 1 to 3, or 5 to 2 to 1 to 3). The right side view lists the last node of each level: [1, 3, 5]. Both use the reusable patterns: post-order with a running best, and BFS level by level.",
        code: {
          lang: "python",
          code: "from collections import deque\n\ndef diameter(root):\n    best = 0\n    def h(n):\n        nonlocal best\n        if not n: return -1\n        L, R = h(n.left), h(n.right)\n        best = max(best, L + R + 2)\n        return 1 + max(L, R)\n    h(root); return best\n\ndef right_view(root):\n    out, q = [], deque([root] if root else [])\n    while q:\n        out.append(q[-1].val)\n        for _ in range(len(q)):\n            n = q.popleft(); q.extend(c for c in (n.left, n.right) if c)\n    return out",
        },
      },
    ],
    cheatSheet: [
      "Pre: node, left, right. In: left, node, right. Post: left, right, node",
      "All traversals: O(n) time; DFS O(h) space, BFS O(max width) space",
      "Height h binary tree: at most 2^(h+1) - 1 nodes; n nodes have n - 1 edges",
      "BFS levels: for _ in range(len(q)) inside while q",
      "Iterative pre-order: pop, record, push right then left",
      "Diameter = max over nodes of (left height + 1) + (right height + 1)",
      "Preorder plus inorder (distinct values) uniquely rebuild a binary tree",
    ],
    quiz: [
      {
        q: "A binary tree has height 3 (counted in edges). What is the maximum number of nodes?",
        options: ["8", "7", "15", "16"],
        answer: 2,
        why: "2^(h+1) - 1 = 2^4 - 1 = 15.",
      },
      {
        q: "Which traversal should you use to compute the size of every subtree?",
        options: ["Post-order", "Pre-order", "Level order", "Any random order"],
        answer: 0,
        why: "A node's size needs its children's sizes first: 1 + size(left) + size(right).",
      },
      {
        q: "In iterative pre-order, why push the right child before the left child?",
        options: ["Right children are smaller", "To save memory", "It is required for BSTs only", "The stack is last-in first-out, so left is popped first"],
        answer: 3,
        why: "Pushing right then left makes the left child come off the stack next.",
      },
      {
        q: "For a perfect binary tree of n nodes, which uses more memory?",
        options: ["DFS, O(n)", "BFS, about n/2 nodes in the queue at the last level", "Both use O(1)", "Both use O(log n)"],
        answer: 1,
        why: "The last level holds about half the nodes, while DFS only holds one root-to-leaf path.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write max_depth(root) that returns the number of nodes on the longest root-to-leaf path (0 for an empty tree), recursively. Example: the tree 1 -> (2 -> (4, 5), 3) has max depth 3.",
        hint: "Depth of None is 0; otherwise 1 plus the larger child depth.",
        solution: "def max_depth(n):\n    if n is None:\n        return 0\n    return 1 + max(max_depth(n.left), max_depth(n.right))\n\nt = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3))\nprint(max_depth(t))  # 3",
      },
      {
        level: "medium",
        task: "Write zigzag(root) that returns level order values with direction alternating each level: left to right, then right to left. Example: tree 1 -> (2 -> (4, 5), 3) gives [[1], [3, 2], [4, 5]].",
        hint: "Do a normal BFS by level and reverse every second level.",
        solution: "from collections import deque\n\ndef zigzag(root):\n    out, q = [], deque([root] if root else [])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            n = q.popleft(); level.append(n.val)\n            q.extend(c for c in (n.left, n.right) if c)\n        out.append(level[::-1] if len(out) % 2 else level)\n    return out",
      },
      {
        level: "hard",
        task: "Write build(preorder, inorder) that rebuilds a binary tree with distinct values in O(n). Example: preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7] gives root 3, left 9, right 20 with children 15 and 7.",
        hint: "The first preorder value is the root. Its index in inorder (use a dict) splits the left and right subtrees.",
        solution: "def build(pre, ino):\n    pos = {v: i for i, v in enumerate(ino)}\n    it = iter(pre)\n    def go(lo, hi):\n        if lo > hi: return None\n        v = next(it)\n        node = TreeNode(v)\n        node.left = go(lo, pos[v] - 1)\n        node.right = go(pos[v] + 1, hi)\n        return node\n    return go(0, len(ino) - 1)",
      },
    ],
    faq: [
      { q: "Is height counted in nodes or edges?", a: "Both conventions exist. Most textbooks count edges (a single node has height 0), while many coding problems such as maximum depth count nodes. Read the problem's examples to check." },
      { q: "When should I use BFS instead of DFS on a tree?", a: "Use BFS when you need levels or the shallowest match, such as minimum depth. Use DFS for most other problems, because it is shorter to write and uses O(h) memory." },
      { q: "Can one traversal order rebuild a tree?", a: "Not in general. With distinct values, preorder plus inorder (or postorder plus inorder) is enough. A serialisation that records None children, like preorder with null markers, works with a single list." },
    ],
  },

  "dsa-trees/bst": {
    plain: [
      "A binary search tree, or BST, is a binary tree with one sorting rule. Everything in a node's left subtree is smaller than the node, and everything in its right subtree is larger. That rule holds at every node, not just between a parent and its direct children.",
      "Searching works like a number guessing game. Start at the root. If your key is smaller, go left; if larger, go right. Each step drops a whole subtree from consideration. You either find the key or fall off the bottom, which means it is not there.",
      "Inserting is the same walk: when you fall off the bottom, attach the new node right there. Deleting is trickier when the node has two children, but there is a neat trick using the next larger key.",
      "A BST is fast only if it is bushy. If you insert 1, 2, 3, 4, 5 in order, every node goes to the right, and the tree becomes a straight line. Then searching is as slow as scanning a list. Balanced trees, covered next, fix this.",
    ],
    deepDive: [
      {
        heading: "Search and insert follow one path",
        body: "Search compares the key with the current node and moves left or right. The work is one comparison per level, so the cost is O(h), where h is the height. Iterative search needs no stack at all: while node and node.val != key: node = node.left if key < node.val else node.right.\n\nInsert walks the same path and attaches a new leaf where the search fell off. New keys always become leaves, so the tree's shape depends entirely on insertion order. Duplicates need a policy: ignore them, keep a count in the node, or always send equal keys to one side.\n\nWith n keys inserted in random order, the expected depth of a node is about 1.39 log2 n, and the expected height is also O(log n). But real data is often not random: sorted IDs, timestamps or alphabetical names produce a chain of height n - 1, where every operation is O(n).",
        bullets: ["Cost O(h) for search, insert and delete", "Random insertion order: expected O(log n) height", "Sorted insertion order: height n - 1"],
      },
      {
        heading: "Deleting with zero, one or two children",
        body: "First find the node. A leaf is simply removed: its parent's pointer becomes None. A node with one child is replaced by that child, which keeps the BST rule because the whole child subtree was already on the correct side of the parent.\n\nA node with two children cannot just vanish. Replace its value with its in-order successor, the smallest key in its right subtree, found by going right once and then left as far as possible. The successor is larger than everything in the left subtree and smaller than everything else in the right subtree, so the rule still holds. Then delete the successor from the right subtree. The successor has no left child (otherwise that child would be smaller), so this second delete is an easy case.\n\nUsing the in-order predecessor (largest key in the left subtree) works equally well. Every case is O(h).",
        visual: {
          type: "flow",
          title: "Delete 50 (two children) from a BST",
          steps: [
            { label: "Find 50", detail: "It has left and right subtrees." },
            { label: "Go right once", detail: "To 70, the root of the right subtree." },
            { label: "Go left to the end", detail: "Reach 60: the successor." },
            { label: "Copy", detail: "Write 60 into the node that held 50." },
            { label: "Remove old 60", detail: "It had at most a right child: easy case." },
          ],
        },
      },
      {
        heading: "Successor, predecessor and range queries",
        body: "The in-order successor of node x is the next larger key. If x has a right child, it is the leftmost node of the right subtree. If not, it is the nearest ancestor for which x lies in the left subtree. Without parent pointers, find it from the root: walk down as in a search, and every time you go left, remember that node as a candidate; the last candidate is the successor.\n\nThis same idea answers floor and ceiling queries: the largest key <= x, or the smallest key >= x, in O(h). Python lists with bisect answer these too, but inserting into a list is O(n).\n\nRange queries, such as all keys between 20 and 40, use a pruned in-order traversal: skip the left subtree when the node is below the range and the right subtree when it is above. The cost is O(h + k) for k results.",
        bullets: ["Successor with right child: leftmost of right subtree", "Without: last ancestor where you went left", "Range query: O(h + k)"],
      },
      {
        heading: "Validating a BST correctly",
        body: "The tempting check, left.val < node.val < right.val at every node, is wrong. Consider root 10 with left child 5, and 5 has a right child 15. Each parent-child pair looks fine, but 15 sits in the left subtree of 10, which breaks the rule.\n\nThe correct approach passes down bounds. The root may hold anything. Going left, the upper bound becomes the node's value; going right, the lower bound becomes the node's value. Every node must lie strictly within its bounds. This is O(n) time and O(h) space.\n\nAn equivalent check uses in-order traversal: a tree is a valid BST (with distinct keys) exactly when its in-order sequence is strictly increasing. Compare each visited value with the previous one, and stop at the first violation. Watch the duplicate policy: if equal keys are allowed on one side, use <= on that side only.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Same keys, different insertion orders",
        columns: [
          { title: "Inserted 4, 2, 6, 1, 3, 5, 7", points: ["Root 4, perfectly balanced", "Height 2", "Search: at most 3 comparisons", "O(log n) per operation"] },
          { title: "Inserted 1, 2, 3, 4, 5, 6, 7", points: ["Every node is a right child", "Height 6", "Search: up to 7 comparisons", "O(n) per operation, like a list"] },
        ],
      },
    ],
    examples: [
      {
        title: "Full delete with all three cases",
        explanation: "This recursive delete returns the new root of each subtree, which keeps the parent links correct without tracking parents. Build the BST from [50, 30, 70, 20, 40, 60, 80], then delete 20 (a leaf), 30 (now one child, 40) and 50 (two children; its successor 60 moves up). The in-order traversal shows the remaining keys stay sorted.",
        code: {
          lang: "python",
          code: "def delete(node, key):\n    if node is None: return None\n    if key < node.val: node.left = delete(node.left, key)\n    elif key > node.val: node.right = delete(node.right, key)\n    else:\n        if node.left is None: return node.right\n        if node.right is None: return node.left\n        s = node.right\n        while s.left: s = s.left\n        node.val = s.val\n        node.right = delete(node.right, s.val)\n    return node\n\nroot = None\nfor k in [50, 30, 70, 20, 40, 60, 80]: root = insert(root, k)\nfor k in [20, 30, 50]: root = delete(root, k)\nprint(inorder(root), root.val)  # [40, 60, 70, 80] 60",
        },
      },
      {
        title: "k-th smallest and range sum",
        explanation: "In-order traversal of a BST visits keys in sorted order, so the k-th smallest is the k-th node visited. A generator lets us stop after k nodes, costing O(h + k). For a range sum between lo and hi, prune: if a node is below lo, only its right subtree can contribute; if above hi, only its left subtree.",
        code: {
          lang: "python",
          code: "def inorder_gen(n):\n    if n:\n        yield from inorder_gen(n.left)\n        yield n.val\n        yield from inorder_gen(n.right)\n\ndef kth_smallest(root, k):\n    for i, v in enumerate(inorder_gen(root), 1):\n        if i == k: return v\n\ndef range_sum(n, lo, hi):\n    if n is None: return 0\n    if n.val < lo: return range_sum(n.right, lo, hi)\n    if n.val > hi: return range_sum(n.left, lo, hi)\n    return n.val + range_sum(n.left, lo, hi) + range_sum(n.right, lo, hi)",
        },
      },
    ],
    cheatSheet: [
      "BST rule: all keys in left subtree < node < all keys in right subtree",
      "Search, insert, delete, min, max, successor: O(h)",
      "Sorted insertion gives height n - 1; random insertion gives expected O(log n)",
      "Two-child delete: copy the successor (leftmost of right subtree), then delete it",
      "Validate with (lo, hi) bounds or a strictly increasing in-order sequence",
      "Range query lo..hi: O(h + k) with pruning",
      "Number of distinct BST shapes on n keys: the Catalan number C(n); 42 for n = 5",
    ],
    quiz: [
      {
        q: "Root 10 has left child 5, and 5 has right child 15. Is it a valid BST?",
        options: ["Yes, each child is on the correct side of its parent", "Yes, because 15 > 5", "No, 15 is in the left subtree of 10 but larger than 10", "Only if duplicates are allowed"],
        answer: 2,
        why: "The rule covers all descendants, not just direct children.",
      },
      {
        q: "When deleting a node with two children, why does its in-order successor have no left child?",
        options: ["Because successors are always leaves", "A left child would be a smaller key in the right subtree, contradicting minimality", "Because the tree is balanced", "It may have one; you must handle that case"],
        answer: 1,
        why: "The successor is the smallest key of the right subtree, so nothing smaller can hang to its left.",
      },
      {
        q: "You insert 1,000 sorted IDs into a plain BST. What is the cost of searching for the largest?",
        options: ["About 10 comparisons", "1 comparison", "About 32 comparisons", "1,000 comparisons"],
        answer: 3,
        why: "Sorted inserts build a right-leaning chain of height 999, so the search visits every node.",
      },
      {
        q: "What does an in-order traversal of a valid BST with distinct keys produce?",
        options: ["Keys in strictly increasing order", "Keys in insertion order", "Keys level by level", "Keys in decreasing order"],
        answer: 0,
        why: "Left subtree, node, right subtree visits smaller keys, then the node, then larger keys.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write bst_min(root) and bst_max(root) iteratively. Example: for a BST built from [8, 3, 10, 1, 6, 14], min is 1 and max is 14.",
        hint: "The minimum is the leftmost node; the maximum is the rightmost.",
        solution: "def bst_min(n):\n    while n.left: n = n.left\n    return n.val\n\ndef bst_max(n):\n    while n.right: n = n.right\n    return n.val\n\nroot = None\nfor k in [8, 3, 10, 1, 6, 14]: root = insert(root, k)\nprint(bst_min(root), bst_max(root))  # 1 14",
      },
      {
        level: "medium",
        task: "Write successor(root, x) that returns the smallest key greater than x in a BST without parent pointers, or None. x may or may not be in the tree. Example: for keys [8, 3, 10, 1, 6, 14], successor(root, 6) is 8.",
        hint: "Walk from the root; whenever you go left, the current node is a candidate.",
        solution: "def successor(n, x):\n    best = None\n    while n:\n        if x < n.val:\n            best, n = n.val, n.left\n        else:\n            n = n.right\n    return best\n\nprint(successor(root, 6), successor(root, 14))  # 8 None",
      },
      {
        level: "hard",
        task: "Write sorted_to_bst(a) that builds a height-balanced BST from a sorted list in O(n), then check its height is floor(log2 n) (in edges). Example: 7 keys give height 2.",
        hint: "Make the middle element the root and recurse on each half using indexes, not slices.",
        solution: "def sorted_to_bst(a, lo=0, hi=None):\n    if hi is None: hi = len(a) - 1\n    if lo > hi: return None\n    mid = (lo + hi) // 2\n    return TreeNode(a[mid], sorted_to_bst(a, lo, mid - 1),\n                    sorted_to_bst(a, mid + 1, hi))\n\ndef height(n):\n    return -1 if n is None else 1 + max(height(n.left), height(n.right))\n\nprint(height(sorted_to_bst(list(range(7)))))  # 2",
      },
    ],
    faq: [
      { q: "Does Python have a built-in BST?", a: "No. dict and set are hash tables with no ordering by key. For sorted containers, use bisect on a list for mostly-read data, or the third-party sortedcontainers package." },
      { q: "How should a BST handle duplicate keys?", a: "Choose one policy and apply it everywhere: ignore duplicates, store a count in each node, or always send equal keys to the same side (for example right). Validation must match that policy." },
      { q: "Why learn plain BSTs if balanced trees exist?", a: "Balanced trees are plain BSTs plus rebalancing. Search, successor, range queries and validation work exactly the same, so the plain version is the foundation." },
    ],
  },

  "dsa-trees/balanced-trees": {
    plain: [
      "A plain binary search tree can turn into a long chain if keys arrive in a bad order, and then it is as slow as a list. A balanced tree checks itself after every insert and delete. If one side has become too tall, it rearranges a few nodes to even things out.",
      "The rearranging move is called a rotation. Picture a mobile hanging from the ceiling: if it tilts to the left, you lift the left arm up to be the new top and let the old top swing down to the right. Only a few pointers change, and the sorted order of the keys stays exactly the same.",
      "Two famous designs use rotations. AVL trees are strict: at every node, the heights of the left and right subtrees may differ by at most one. Red-black trees colour each node red or black and follow a few colour rules, which allow a bit more imbalance but need fewer fixes.",
      "Either way, the height stays around log n. So search, insert and delete are guaranteed O(log n), even if keys come in sorted order. These trees power ordered maps in Java, C++ and the Linux kernel.",
    ],
    deepDive: [
      {
        heading: "Rotations: the one operation that rebalances",
        body: "A right rotation at node y with left child x makes x the new subtree root, y becomes x's right child, and x's old right subtree (call it B) becomes y's new left subtree. In sorted order, the keys are A < x < B < y < C both before and after, so the BST rule still holds. A left rotation is the mirror image.\n\nA rotation changes only three pointers (plus the link from the parent), so it costs O(1). Its effect on heights is what matters: the left side loses one level and the right side gains one. After a rotation you recompute the stored heights of y first (it is now lower), then x.\n\nSome imbalances need two rotations. If the left child is itself right-heavy (a zigzag shape), one right rotation would just make a mirror zigzag. Rotate the child left first to straighten the path, then rotate the node right. This is called a double rotation.",
        bullets: ["O(1) work, in-order sequence unchanged", "Update heights bottom-up: old root first, new root second", "Zigzag shapes need a double rotation"],
        visual: {
          type: "compare",
          title: "Right rotation at y",
          columns: [
            { title: "Before", points: ["y is the subtree root", "x is y's left child", "x has subtrees A and B", "y's right subtree is C"] },
            { title: "After", points: ["x is the subtree root", "y is x's right child", "x keeps A on the left", "y gets B on the left, keeps C"] },
          ],
        },
      },
      {
        heading: "AVL trees: balance factors and the four cases",
        body: "Every AVL node stores its height. The balance factor is height(left) - height(right) and must stay in -1, 0 or 1. After inserting a leaf, walk back up the path, updating heights. The first node whose balance factor becomes 2 or -2 needs fixing.\n\nThere are four cases, named by the path from that node to the inserted key. LL (left child, then its left): one right rotation. RR: one left rotation. LR (left child, then its right): rotate the child left, then the node right. RL: the mirror.\n\nOn insert, one single or double rotation always fixes the whole tree, because it restores the subtree's height to what it was before the insert. On delete, a rotation may shorten the subtree, so imbalance can move upward and up to O(log n) rotations may be needed.\n\nAVL trees are very tightly balanced: height is less than about 1.44 log2(n + 2). That makes lookups slightly faster than in red-black trees.",
        visual: {
          type: "tree",
          title: "AVL imbalance cases at node z",
          root: "z has balance factor +2 or -2",
          children: [
            { label: "LL", children: ["New key in left of left", "Fix: rotate z right"] },
            { label: "RR", children: ["New key in right of right", "Fix: rotate z left"] },
            { label: "LR", children: ["New key in right of left", "Fix: rotate child left, then z right"] },
            { label: "RL", children: ["New key in left of right", "Fix: rotate child right, then z left"] },
          ],
        },
      },
      {
        heading: "Red-black trees: the rules and why they work",
        body: "Each node is red or black, and empty child slots (None) count as black leaves. The rules: the root is black; a red node never has a red child; and every path from a node down to an empty leaf has the same number of black nodes, called the black height.\n\nWhy does this bound the height? The shortest possible root-to-leaf path is all black. The longest alternates red and black, because two reds cannot be adjacent. So no path is more than twice as long as another, which gives height at most 2 log2(n + 1).\n\nInsert colours the new node red (which keeps black heights equal) and then fixes any red-red violation by recolouring or rotating. Recolouring can push the problem up the tree, but insert needs at most 2 rotations and delete at most 3. Fewer structural changes make red-black trees a popular choice when writes are frequent.",
        bullets: ["Root black, no red-red parent and child, equal black height", "Height at most 2 log2(n + 1)", "At most 2 rotations per insert, 3 per delete"],
      },
      {
        heading: "Where balanced trees appear, and Python options",
        body: "Java's TreeMap and TreeSet are red-black trees, offering floorKey, ceilingKey and subMap range views. C++ std::map and std::set are typically red-black trees. The Linux kernel has a widely used red-black tree library, used for example by its process scheduler and memory management.\n\nDatabases and file systems mostly use B-trees and B+ trees instead. These are balanced trees with hundreds of keys per node, so a lookup touches only 3 or 4 disk pages even for billions of rows. Redis sorted sets use a skip list, a randomised structure with the same expected O(log n) costs.\n\nPython's standard library has no balanced tree. For sorted data with updates, the third-party sortedcontainers package (SortedList, SortedDict) is the usual answer; it stores a list of sorted sublists and is fast in practice. For read-mostly data, a sorted list plus bisect is often enough.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Inserting 1, 2, 3 into an AVL tree",
        steps: [
          { label: "Insert 1", detail: "Single node, balance 0." },
          { label: "Insert 2", detail: "Right child of 1; balance at 1 is -1." },
          { label: "Insert 3", detail: "Right of 2; balance at 1 becomes -2." },
          { label: "Case RR", detail: "Rotate left at 1." },
          { label: "Result", detail: "2 is root with children 1 and 3, height 1." },
        ],
      },
    ],
    examples: [
      {
        title: "A complete AVL insert",
        explanation: "Each node stores its height. After recursive insertion, we update the height and compute the balance. If it is +2 the left side is too tall: an LR shape is first straightened by rotating the child left. If it is -2, the mirror. Inserting 1 to 7 in sorted order, which would make a chain in a plain BST, yields a perfect tree of height 3 (counting nodes) with 4 at the root.",
        code: {
          lang: "python",
          code: "class N:\n    def __init__(s, k): s.k, s.l, s.r, s.h = k, None, None, 1\nh = lambda n: n.h if n else 0\ndef fix(n): n.h = 1 + max(h(n.l), h(n.r)); return n\ndef rot_r(y): x = y.l; y.l, x.r = x.r, y; fix(y); return fix(x)\ndef rot_l(x): y = x.r; x.r, y.l = y.l, x; fix(x); return fix(y)\ndef insert(n, k):\n    if not n: return N(k)\n    if k < n.k: n.l = insert(n.l, k)\n    else: n.r = insert(n.r, k)\n    b = h(fix(n).l) - h(n.r)\n    if b > 1:\n        if k > n.l.k: n.l = rot_l(n.l)          # LR\n        return rot_r(n)\n    if b < -1:\n        if k < n.r.k: n.r = rot_r(n.r)          # RL\n        return rot_l(n)\n    return n",
        },
      },
      {
        title: "Ordered-map queries with a sorted list",
        explanation: "Python has no TreeMap, but floor and ceiling queries are easy with bisect on a sorted list. Here a list of price levels answers \"highest price at or below 105\" and \"lowest price at or above 105\". Lookups are O(log n); inserting with insort is O(n) because of shifting, which is fine for thousands of items. For heavy updates, sortedcontainers.SortedList gives the same API with fast inserts.",
        code: {
          lang: "python",
          code: "from bisect import bisect_left, bisect_right, insort\n\nprices = [90, 100, 110, 120]\ninsort(prices, 104)                      # [90, 100, 104, 110, 120]\n\ndef floor_key(a, x):\n    i = bisect_right(a, x)\n    return a[i - 1] if i else None\n\ndef ceiling_key(a, x):\n    i = bisect_left(a, x)\n    return a[i] if i < len(a) else None\n\nprint(floor_key(prices, 105), ceiling_key(prices, 105))  # 104 110",
        },
      },
    ],
    cheatSheet: [
      "Rotation: O(1), keeps in-order order, moves one level of height between sides",
      "AVL: balance factor in {-1, 0, 1}; height < about 1.44 log2(n + 2)",
      "AVL cases: LL rotate right, RR rotate left, LR left-then-right, RL right-then-left",
      "AVL insert: at most one single or double rotation; delete: up to O(log n)",
      "Red-black: root black, no red-red, equal black height; height <= 2 log2(n + 1)",
      "Red-black: at most 2 rotations per insert, 3 per delete",
      "Java TreeMap and C++ std::map use red-black trees; databases use B+ trees",
    ],
    quiz: [
      {
        q: "An AVL node has balance factor +2 and the new key went into its left child's right subtree. Which fix applies?",
        options: ["One right rotation", "One left rotation", "Rotate the left child left, then the node right", "Recolour the node"],
        answer: 2,
        why: "This is the LR case: straighten the zigzag with a left rotation on the child, then rotate the node right.",
      },
      {
        q: "What is the maximum height of a red-black tree with n keys?",
        options: ["log2 n", "2 log2(n + 1)", "n / 2", "1.44 log2 n exactly"],
        answer: 1,
        why: "The longest path alternates red and black, so it is at most twice the shortest all-black path.",
      },
      {
        q: "Which statement about rotations is true?",
        options: ["They preserve the in-order sequence of keys", "They cost O(log n)", "They change which keys are stored", "They only apply to red-black trees"],
        answer: 0,
        why: "A rotation rearranges pointers but keeps A < x < B < y < C, so in-order order is unchanged.",
      },
      {
        q: "Why do new red-black tree nodes start red?",
        options: ["Red nodes are faster to search", "The root must be red", "Red nodes never need rotations", "Adding a red node does not change any black height"],
        answer: 3,
        why: "Only the no-red-red rule can break, and it is fixed locally by recolouring or rotating.",
      },
      {
        q: "Which data structure do relational databases typically use for indexes?",
        options: ["AVL trees", "Red-black trees", "B+ trees", "Tries"],
        answer: 2,
        why: "B+ trees pack many keys per node, so lookups read only a few disk pages.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Using N, fix, rot_l and rot_r from the AVL example, build the chain 1 -> 2 -> 3 (each a right child), apply one rotation to balance it, and print the new root and its children. Expected: 2 1 3.",
        hint: "A right-right chain needs a left rotation at the top.",
        solution: "a, b, c = N(1), N(2), N(3)\na.r, b.r = b, c\nfix(c); fix(b); fix(a)\nroot = rot_l(a)\nprint(root.k, root.l.k, root.r.k)  # 2 1 3\nprint(root.h)                      # 2",
      },
      {
        level: "medium",
        task: "Write is_avl(root) for the N class that checks the AVL balance rule at every node in O(n) without trusting the stored h values. Return True or False.",
        hint: "Return the height from a helper, or -1 as a signal that a subtree is already unbalanced.",
        solution: "def is_avl(root):\n    def check(n):\n        if not n: return 0\n        L, R = check(n.l), check(n.r)\n        if L < 0 or R < 0 or abs(L - R) > 1:\n            return -1\n        return 1 + max(L, R)\n    return check(root) >= 0\n\nroot = None\nfor k in range(1, 100): root = insert(root, k)\nprint(is_avl(root), root.h)  # True 7",
      },
      {
        level: "hard",
        task: "Insert the keys 1 to 2**k - 1 in sorted order into the AVL tree for k = 10 and confirm the tree height (in nodes) is exactly k. Then compare with a plain BST, where the height would be 2**k - 1.",
        hint: "Loop over range(1, 2**k) and read root.h. Explain why sorted input gives a perfect tree here.",
        solution: "k = 10\nroot = None\nfor x in range(1, 2 ** k):\n    root = insert(root, x)\nprint(root.h, root.k)  # 10 512\n# A plain BST would be a chain of height 1023.\n# Sorted inserts trigger RR rotations that keep\n# the tree perfect after each 2^j - 1 keys.",
      },
    ],
    faq: [
      { q: "Should I use AVL or red-black trees?", a: "AVL trees are more tightly balanced, so lookups are slightly faster. Red-black trees do fewer rotations on updates, which is why most standard libraries use them. In practice you use the library's tree rather than writing your own." },
      { q: "Do I need to implement red-black deletion for interviews?", a: "Almost never. Knowing the rules, the height bound, rotations and when balanced trees are needed is usually enough; AVL insertion is the most common one asked to code." },
      { q: "What should I use in Python instead of a TreeMap?", a: "The sortedcontainers package (SortedDict, SortedList) for frequent updates, or a sorted list with bisect for mostly read-only data. heapq works if you only need the minimum." },
    ],
  },

  "dsa-trees/binary-heaps": {
    plain: [
      "A heap is a tree shape built for one job: always knowing the smallest item (in a min-heap) or the largest item (in a max-heap). The rule is simple: every parent is smaller than or equal to its children. So the smallest item is always at the top.",
      "Unlike a search tree, a heap does not keep everything sorted. The left child can be bigger or smaller than the right child. Only the parent-child order matters. This looser rule is what makes heaps cheap to update.",
      "Heaps are stored in a plain array, not with pointers. The tree is always complete: filled level by level, left to right. That means the children of the item at index i are at 2i + 1 and 2i + 2, and you can find any parent with simple maths.",
      "Adding an item puts it at the end and lets it bubble up while it is smaller than its parent. Removing the top moves the last item to the top and lets it sink down. Both take about log n steps, because the tree is only log n levels tall.",
    ],
    deepDive: [
      {
        heading: "Array layout and why the tree stays short",
        body: "With 0-based indexes, node i has children 2i + 1 and 2i + 2 and parent (i - 1) // 2. Some textbooks use 1-based arrays, where children are 2i and 2i + 1 and the parent is i // 2. Be sure which one your code uses.\n\nBecause the tree is complete, n items always form a tree of height floor(log2 n). For one million items that is 19 levels. There are no gaps in the array, no pointers and no wasted memory, and walking down the tree touches memory in a predictable pattern.\n\nIndexes beyond the array show where nodes would be: if 2i + 1 >= n, node i is a leaf. That means the leaves are exactly the second half of the array, indexes n // 2 to n - 1. Only the first n // 2 nodes have children, which matters for heapify.",
        bullets: ["0-based: children 2i+1, 2i+2; parent (i-1)//2", "Height floor(log2 n): 19 for one million", "Leaves are indexes n//2 to n-1"],
      },
      {
        heading: "Sift up and sift down, step by step",
        body: "Push appends the new item at index n, which keeps the tree complete, but may break the heap rule with its parent. Sift up: while the item is smaller than its parent, swap them. It stops at the root at the latest, so at most floor(log2 n) swaps.\n\nPop removes the root. To keep the tree complete, move the last item into the root, then sift down: compare it with both children and swap with the smaller child if that child is smaller. Choosing the smaller child is essential: swapping with the larger child would put a larger item above a smaller one. Repeat until neither child is smaller. At most floor(log2 n) levels, with two comparisons per level.\n\nA small optimisation used by CPython's heapq: instead of swapping at each step, hold the moving item aside, shift the other items into the hole, and write the item once at the end. heapq's pop even sifts the hole all the way to a leaf first and then sifts up, which saves comparisons on average.",
        visual: {
          type: "flow",
          title: "Pop from min-heap [1, 3, 2, 7, 4, 5]",
          steps: [
            { label: "Take root", detail: "Return 1." },
            { label: "Move last to root", detail: "[5, 3, 2, 7, 4]" },
            { label: "Compare children 3, 2", detail: "Smaller is 2; 5 > 2, swap." },
            { label: "Now [2, 3, 5, 7, 4]", detail: "5 at index 2 has no children." },
            { label: "Done", detail: "Valid heap with minimum 2 at the root." },
          ],
        },
      },
      {
        heading: "Why bottom-up heapify is O(n)",
        body: "Pushing n items one by one costs O(n log n). Floyd's bottom-up heapify is faster: call sift-down on every non-leaf node, from index n // 2 - 1 back to 0. When a node is processed, both its subtrees are already heaps, so one sift-down fixes it.\n\nThe saving comes from where the work happens. A node at height k sifts down at most k levels. About n/2 nodes are leaves (height 0, no work), about n/4 have height 1, n/8 have height 2, and so on. The total is about n (1/4 + 2/8 + 3/16 + ...), and that series sums to n. So heapify does O(n) work, at most about 2n comparisons.\n\nThe intuition: most nodes are near the bottom and cheap to fix. With push-one-by-one, most nodes are also near the bottom, but sift-up moves them towards the far-away root, which is the expensive direction.",
        bullets: ["Sift down indexes n//2 - 1 down to 0", "Sum over heights of (nodes x height) is O(n)", "heapq.heapify(list) does this in place"],
      },
      {
        heading: "heapq in practice",
        body: "Python's heapq is a set of functions on an ordinary list, implementing a min-heap. heappush and heappop are O(log n). h[0] peeks at the minimum in O(1). heapify is O(n). heappushpop(h, x) pushes then pops in one efficient step, and heapreplace(h, x) pops then pushes; both are O(log n) and faster than two calls.\n\nFor a max-heap, the classic trick is to push negated numbers and negate again when popping. Python 3.14 added max-heap functions such as heapq.heappush_max and heapq.heappop_max, but negation works in every version.\n\nheapq has no decrease-key operation and no way to delete an arbitrary item quickly. The usual workaround is lazy deletion: push a new entry with the updated priority, and when popping, skip entries that are out of date. This is exactly how Dijkstra's algorithm is written with heapq.",
        bullets: ["h[0] is the min; h[1] is not necessarily the second smallest", "Max-heap: push -x, pop and negate", "No decrease-key: push again and skip stale entries"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Heapify work by level (n = 15)",
        layers: [
          { label: "Height 3: 1 node", detail: "Sifts at most 3 levels: up to 3 swaps." },
          { label: "Height 2: 2 nodes", detail: "Up to 2 swaps each: 4." },
          { label: "Height 1: 4 nodes", detail: "Up to 1 swap each: 4." },
          { label: "Height 0: 8 leaves", detail: "No work at all." },
          { label: "Total", detail: "At most 11 swaps for 15 items: linear." },
        ],
      },
    ],
    examples: [
      {
        title: "Bottom-up heapify traced",
        explanation: "Start with [9, 4, 7, 1, 2, 6, 3]. Non-leaves are indexes 2, 1, 0. Index 2 (value 7) has children 6 and 3: swap with 3, giving [9, 4, 3, 1, 2, 6, 7]. Index 1 (value 4) has children 1 and 2: swap with 1, giving [9, 1, 3, 4, 2, 6, 7]. Index 0 (value 9) swaps with 1, then with 2: [1, 2, 3, 4, 9, 6, 7]. Done in 4 swaps.",
        code: {
          lang: "python",
          code: "def sift_down(h, i, n):\n    while (c := 2 * i + 1) < n:\n        if c + 1 < n and h[c + 1] < h[c]:\n            c += 1\n        if h[i] <= h[c]:\n            break\n        h[i], h[c] = h[c], h[i]\n        i = c\n\ndef heapify(h):\n    for i in range(len(h) // 2 - 1, -1, -1):\n        sift_down(h, i, len(h))\n    return h\n\nprint(heapify([9, 4, 7, 1, 2, 6, 3]))  # [1, 2, 3, 4, 9, 6, 7]",
        },
      },
      {
        title: "A max-heap of tasks with heapq",
        explanation: "We want the most urgent task first, where a bigger number means more urgent. heapq is a min-heap, so we store (-priority, order, name). The order counter breaks ties so that equal priorities pop first-in first-out, and Python never has to compare the names. heappushpop adds a task and removes the most urgent in one O(log n) call.",
        code: {
          lang: "python",
          code: "import heapq, itertools\n\nh, order = [], itertools.count()\nfor pri, name in [(2, 'email'), (5, 'outage'), (2, 'lunch'), (3, 'review')]:\n    heapq.heappush(h, (-pri, next(order), name))\n\nprint(h[0][2])                                  # outage (peek)\nprint(heapq.heappushpop(h, (-4, next(order), 'deploy'))[2])  # outage\nwhile h:\n    print(heapq.heappop(h)[2], end=' ')         # deploy review email lunch",
        },
      },
    ],
    cheatSheet: [
      "0-based: children 2i+1 and 2i+2, parent (i-1)//2, leaves from n//2",
      "Peek O(1); push and pop O(log n); heapify O(n)",
      "Sift down swaps with the smaller child in a min-heap",
      "heappushpop(h, x) and heapreplace(h, x) beat separate push and pop",
      "Max-heap: store -x (or use heappush_max in Python 3.14+)",
      "Ties: push (priority, counter, item) so items are never compared",
      "No decrease-key in heapq: push a new entry and skip stale ones on pop",
    ],
    quiz: [
      {
        q: "In a 0-based array heap, what are the children of index 4?",
        options: ["8 and 9", "5 and 6", "9 and 10", "3 and 5"],
        answer: 2,
        why: "2 * 4 + 1 = 9 and 2 * 4 + 2 = 10.",
      },
      {
        q: "What is the time to build a heap from n items with bottom-up heapify?",
        options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"],
        answer: 0,
        why: "Most nodes are low in the tree and sift down only a few levels; the total sums to linear.",
      },
      {
        q: "During sift-down in a min-heap, why swap with the smaller child?",
        options: ["It is faster to find", "To keep the tree complete", "To make the heap stable", "So the new parent is not larger than the other child"],
        answer: 3,
        why: "Promoting the larger child would place it above the smaller sibling, breaking the heap rule.",
      },
      {
        q: "Which statement about h = [1, 5, 2, 9, 6] (a valid min-heap) is true?",
        options: ["h[1] is the second smallest item", "h[0] is the smallest item", "The list is sorted", "h[-1] is the largest item"],
        answer: 1,
        why: "Only the root is guaranteed; here the second smallest is 2 at index 2.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write is_min_heap(a) that checks whether a list satisfies the min-heap property in O(n). Example: [1, 3, 2, 7, 4, 5] is True, [1, 3, 2, 0] is False.",
        hint: "Every index i >= 1 must be no smaller than its parent (i - 1) // 2.",
        solution: "def is_min_heap(a):\n    return all(a[(i - 1) // 2] <= a[i] for i in range(1, len(a)))\n\nprint(is_min_heap([1, 3, 2, 7, 4, 5]))  # True\nprint(is_min_heap([1, 3, 2, 0]))        # False",
      },
      {
        level: "medium",
        task: "Write a MaxHeap class with push, pop and peek using heapq and negation. Example: after pushing 3, 10, 5, pop returns 10, then 5.",
        hint: "Store -x in the list and negate on the way out.",
        solution: "import heapq\n\nclass MaxHeap:\n    def __init__(self): self.h = []\n    def push(self, x): heapq.heappush(self.h, -x)\n    def pop(self): return -heapq.heappop(self.h)\n    def peek(self): return -self.h[0]\n    def __len__(self): return len(self.h)\n\nm = MaxHeap()\nfor x in [3, 10, 5]: m.push(x)\nprint(m.pop(), m.pop())  # 10 5",
      },
      {
        level: "hard",
        task: "Write kth_smallest_matrix(m, k) for an n x n matrix whose rows and columns are sorted ascending, in O(k log n) using a heap. Example: [[1, 5, 9], [10, 11, 13], [12, 13, 15]], k = 8 gives 13.",
        hint: "Start with the first element of each row in a heap. Pop k - 1 times, each time pushing the next element of the popped row.",
        solution: "import heapq\n\ndef kth_smallest_matrix(m, k):\n    h = [(row[0], r, 0) for r, row in enumerate(m)]\n    heapq.heapify(h)\n    for _ in range(k - 1):\n        v, r, c = heapq.heappop(h)\n        if c + 1 < len(m[r]):\n            heapq.heappush(h, (m[r][c + 1], r, c + 1))\n    return h[0][0]\n\nprint(kth_smallest_matrix([[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8))  # 13",
      },
    ],
    faq: [
      { q: "Is a heap the same as heap memory?", a: "No. The heap data structure is a tree-shaped priority structure. Heap memory is the region where a program allocates objects at runtime; the names are unrelated." },
      { q: "Why is heapq a min-heap only?", a: "It was designed that way for simplicity. Use negated keys for a max-heap; Python 3.14 added dedicated max-heap functions as well." },
      { q: "Is a sorted list a valid heap?", a: "Yes. A list sorted in ascending order always satisfies the min-heap property, but a heap does not need to be sorted, which is why it is cheaper to maintain." },
    ],
  },

  "dsa-trees/priority-queues": {
    plain: [
      "A normal queue serves people in arrival order. A priority queue serves the most important one first, like an emergency room that treats the most serious case next, no matter who arrived first. You can add items at any time, and you can always take out the current most important one.",
      "A heap is the usual way to build one, because adding and removing both take about log n steps. In Python, you use the heapq module on a normal list.",
      "Priority queues solve many everyday problems. Find the 10 biggest numbers in a stream of millions without sorting it all. Merge many sorted lists into one. Keep track of the middle value as numbers keep arriving. Decide which job a computer should run next.",
      "There is even a sorting algorithm built on a heap, called heap sort. It builds a heap, then repeatedly takes out the top. It sorts in place in O(n log n) time, but it is not stable.",
    ],
    deepDive: [
      {
        heading: "Top-k: choosing the right tool",
        body: "To keep the k largest of n items, use a min-heap of size k. Its root is the smallest of the current top k, the first to be evicted. For each new item x: if the heap has fewer than k items, push x; otherwise if x > h[0], call heapreplace(h, x). That is O(n log k) time and O(k) memory, and it works on a stream you cannot store.\n\nheapq.nlargest(k, iterable) and heapq.nsmallest(k, iterable) do exactly this, and accept key=. They are best when k is small compared with n. When k is close to n, sorted(iterable)[:k] is simpler and faster. For k = 1, use max() or min().\n\nQuickselect finds the k-th element in expected O(n) but needs the whole array in memory and reorders it. Heaps win for streams and when you need the top k items in order.",
        bullets: ["Stream top-k: size-k min-heap, O(n log k), O(k) memory", "nlargest / nsmallest accept key=", "k close to n: just sort"],
      },
      {
        heading: "Merging k sorted lists",
        body: "Put the first item of each list into a heap as (value, list index, position). Pop the smallest, output it, and push the next item from the same list. The heap never holds more than k entries, so each of the N total items costs O(log k): O(N log k) overall.\n\nThe list index in the tuple serves two purposes: it tells you where to get the next item, and it breaks ties so Python never compares the payloads, which might not be comparable (linked list nodes, for example).\n\nheapq.merge(*iterables) does this lazily and supports key= and reverse=. Merging is how external sorting combines sorted chunks on disk, how databases merge sorted runs, and how log-structured storage engines compact sorted files.\n\nCompare with merging the lists pairwise one after another: that costs O(N k) in the worst case. Merging pairs in rounds (like merge sort) also reaches O(N log k).",
        visual: {
          type: "sequence",
          title: "Merging [1, 4], [2, 5], [3] with a heap",
          actors: ["Lists", "Heap", "Output"],
          messages: [
            { from: 0, to: 1, label: "push heads 1, 2, 3" },
            { from: 1, to: 2, label: "pop 1" },
            { from: 0, to: 1, label: "push 4 from list 0" },
            { from: 1, to: 2, label: "pop 2" },
            { from: 0, to: 1, label: "push 5 from list 1" },
            { from: 1, to: 2, label: "pop 3, 4, 5 in order" },
          ],
        },
      },
      {
        heading: "Running median with two heaps",
        body: "Keep the smaller half of the numbers in a max-heap (low) and the larger half in a min-heap (high). Maintain two rules: every number in low is at most every number in high, and the sizes differ by at most one (say low may have one extra).\n\nTo add x: push it onto low, then move low's largest to high (this enforces the ordering rule). If high now has more items than low, move high's smallest back to low. Each add is a constant number of heap operations, O(log n).\n\nThe median is then the top of low if it has more items, or the average of both tops if the sizes are equal, which is O(1). With heapq, low stores negated values.\n\nThe same two-heap idea works for sliding-window medians, combined with lazy deletion for numbers that leave the window.",
        visual: {
          type: "flow",
          title: "Adding 5, 15, 1, 3",
          steps: [
            { label: "Add 5", detail: "low [5], high []. Median 5." },
            { label: "Add 15", detail: "low [5], high [15]. Median 10." },
            { label: "Add 1", detail: "low [5, 1], high [15]. Median 5." },
            { label: "Add 3", detail: "low [3, 1], high [5, 15]. Median 4." },
          ],
        },
      },
      {
        heading: "Scheduling and event simulation",
        body: "Many scheduling problems sort events by start time and keep a heap of end times. For the minimum number of meeting rooms: sort meetings by start. For each meeting, if the earliest ending meeting (h[0]) has ended by this start, reuse that room with heapreplace; otherwise push a new room. The heap size at the end is the answer. Time O(n log n).\n\nOperating systems, game engines and simulations keep a priority queue of future events ordered by time: pop the next event, process it, push any new events it creates. Timers in event loops like asyncio work this way, keeping scheduled callbacks in a heap.\n\nTwo practical notes. If several threads share a queue, use queue.PriorityQueue, which wraps heapq with locking. And to cancel or reprioritise items in heapq, mark the old entry as removed and skip it when popped, as recommended in the heapq documentation.",
        bullets: ["Meeting rooms: heap of end times, O(n log n)", "Event loop: pop earliest event, push new ones", "Threads: queue.PriorityQueue"],
      },
      {
        heading: "Heap sort in place",
        body: "Build a max-heap from the array in O(n) with bottom-up heapify. The largest item is now at index 0. Swap it with the last item, shrink the heap size by one, and sift the new root down. The largest item is now in its final place at the end. Repeat until the heap is empty.\n\nEach of the n - 1 extraction steps costs O(log n), so heap sort is O(n log n) in the best, average and worst case, using O(1) extra memory. That combination (guaranteed n log n and in place) is why introsort uses heap sort as its fallback.\n\nDownsides: it is not stable, because the swaps move items over long distances. And its memory access jumps around the array, so on modern CPUs it is usually slower than quicksort and merge sort. Python's sorted() is faster still for everyday use.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Finding the k largest of n items",
        columns: [
          { title: "Sort everything", points: ["sorted(a)[-k:]", "O(n log n)", "O(n) memory", "Best when k is close to n"] },
          { title: "Size-k heap", points: ["heapq.nlargest(k, a)", "O(n log k)", "O(k) memory, works on streams", "Best when k is small"] },
          { title: "Quickselect", points: ["Partition around pivots", "Expected O(n)", "Needs the whole array, reorders it", "Top k come out unsorted"] },
        ],
      },
    ],
    examples: [
      {
        title: "Running median class",
        explanation: "We add 5, 15, 1 and 3 and print the median after each. low is a max-heap via negation and high is a min-heap. The add method pushes through low into high to keep the order rule, then rebalances so low has the same number of items or one more. Medians: 5, 10.0, 5, 4.0.",
        code: {
          lang: "python",
          code: "import heapq\n\nclass RunningMedian:\n    def __init__(self): self.low, self.high = [], []   # low stores -x\n    def add(self, x):\n        heapq.heappush(self.high, -heapq.heappushpop(self.low, -x))\n        if len(self.high) > len(self.low):\n            heapq.heappush(self.low, -heapq.heappop(self.high))\n    def median(self):\n        if len(self.low) > len(self.high): return -self.low[0]\n        return (-self.low[0] + self.high[0]) / 2\n\nrm = RunningMedian()\nfor x in [5, 15, 1, 3]:\n    rm.add(x); print(rm.median(), end=' ')   # 5 10.0 5 4.0",
        },
      },
      {
        title: "Heap sort in place",
        explanation: "For [4, 10, 3, 5, 1], heapify into the max-heap [10, 5, 3, 4, 1]. Swap 10 to the end and sift down within the first four items, then swap 5 into place, and so on. After n - 1 rounds the array is ascending. Memory use is O(1) beyond the input.",
        code: {
          lang: "python",
          code: "def sift_down_max(a, i, n):\n    while (c := 2 * i + 1) < n:\n        if c + 1 < n and a[c + 1] > a[c]: c += 1\n        if a[i] >= a[c]: break\n        a[i], a[c] = a[c], a[i]; i = c\n\ndef heap_sort(a):\n    n = len(a)\n    for i in range(n // 2 - 1, -1, -1):\n        sift_down_max(a, i, n)\n    for end in range(n - 1, 0, -1):\n        a[0], a[end] = a[end], a[0]\n        sift_down_max(a, 0, end)\n    return a\n\nprint(heap_sort([4, 10, 3, 5, 1]))  # [1, 3, 4, 5, 10]",
        },
      },
    ],
    cheatSheet: [
      "k largest: size-k min-heap or heapq.nlargest(k, a), O(n log k)",
      "Merge k sorted lists: heap of (value, list_id, pos), O(N log k)",
      "Running median: max-heap low half, min-heap high half, sizes differ by at most 1",
      "Meeting rooms: sort by start, heap of end times; answer is the heap size",
      "Heap sort: heapify O(n), then n - 1 pops O(log n) each; in place, not stable",
      "Thread-safe priority queue: queue.PriorityQueue",
      "Cancel an entry: mark it removed and skip it when popped",
    ],
    quiz: [
      {
        q: "To keep the 100 largest values from a stream of 10 million, which heap do you use?",
        options: ["A max-heap of all values", "A min-heap of size 100", "A max-heap of size 100", "Two heaps of size 50"],
        answer: 1,
        why: "The min-heap's root is the weakest of the current top 100, which is the one to replace.",
      },
      {
        q: "What is the time to merge k sorted lists with N items in total using a heap?",
        options: ["O(N k)", "O(N + k)", "O(k log N)", "O(N log k)"],
        answer: 3,
        why: "Each of N items is pushed and popped once on a heap of at most k entries.",
      },
      {
        q: "In the two-heap running median, which heap holds the smaller half?",
        options: ["A max-heap", "A min-heap", "Either, it does not matter", "A sorted list"],
        answer: 0,
        why: "The smaller half needs fast access to its largest item, which a max-heap provides.",
      },
      {
        q: "Why is heap sort not stable?",
        options: ["It uses recursion", "It needs extra memory", "Swapping the root with the last item moves equal items past each other", "It only works on integers"],
        answer: 2,
        why: "Long-distance swaps between the root and the end can reverse the order of equal keys.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use heapq.nsmallest with a key to find the 2 points closest to the origin. Example: [(1, 3), (-2, 2), (5, 8), (0, 1)] gives [(0, 1), (-2, 2)].",
        hint: "Key on x*x + y*y; no square root is needed for comparison.",
        solution: "import heapq\n\npts = [(1, 3), (-2, 2), (5, 8), (0, 1)]\nprint(heapq.nsmallest(2, pts, key=lambda p: p[0] ** 2 + p[1] ** 2))\n# [(0, 1), (-2, 2)]",
      },
      {
        level: "medium",
        task: "Write min_meeting_rooms(meetings) for a list of (start, end) pairs, where a meeting ending at t frees its room for one starting at t. Example: [(0, 30), (5, 10), (15, 20)] needs 2 rooms.",
        hint: "Sort by start and keep a min-heap of end times.",
        solution: "import heapq\n\ndef min_meeting_rooms(meetings):\n    ends = []\n    for s, e in sorted(meetings):\n        if ends and ends[0] <= s:\n            heapq.heapreplace(ends, e)\n        else:\n            heapq.heappush(ends, e)\n    return len(ends)\n\nprint(min_meeting_rooms([(0, 30), (5, 10), (15, 20)]))  # 2",
      },
      {
        level: "hard",
        task: "Write reorganize(s) that rearranges a string so no two adjacent characters are equal, or returns '' if impossible. Example: 'aab' gives 'aba'; 'aaab' gives ''.",
        hint: "Max-heap of (-count, char). Pop the most frequent, append it, and hold it back one step before pushing it again.",
        solution: "import heapq\nfrom collections import Counter\n\ndef reorganize(s):\n    h = [(-c, ch) for ch, c in Counter(s).items()]\n    heapq.heapify(h)\n    out, prev = [], None\n    while h:\n        c, ch = heapq.heappop(h)\n        out.append(ch)\n        if prev: heapq.heappush(h, prev)\n        prev = (c + 1, ch) if c + 1 < 0 else None\n    return '' if prev else ''.join(out)\n\nprint(reorganize('aab'), repr(reorganize('aaab')))  # aba ''",
      },
    ],
    faq: [
      { q: "What is the difference between a priority queue and a heap?", a: "A priority queue is the idea: insert items and remove the best one. A heap is one data structure that implements it efficiently; a sorted list or balanced tree could also implement it." },
      { q: "Should I use heapq or queue.PriorityQueue?", a: "Use heapq in normal single-threaded code; it is faster and more flexible. Use queue.PriorityQueue when several threads put and get items, because it handles locking." },
      { q: "How do I update an item's priority in heapq?", a: "heapq cannot change priorities in place. Push a new entry with the new priority and mark or ignore the old one when it is popped." },
    ],
  },

  "dsa-trees/tries": {
    plain: [
      "A trie (often said like \"try\") is a tree for storing words. Each step down the tree adds one letter. Words that start the same way share the same path at the top. So 'car', 'cat' and 'cart' all share the c-a path.",
      "Finding a word is like following road signs letter by letter. To check 'cat', go to c, then a, then t. If at any point the next letter is missing, the word is not stored. The time depends only on the length of the word, not on how many words are in the trie.",
      "Each node also needs a small flag that says \"a word ends here\". Without it, you could not tell whether 'car' is a stored word or just the beginning of 'cart'.",
      "Tries are perfect for questions about beginnings of words. \"Which words start with 'ca'?\" is answered by walking to the c-a node and listing everything below it. This is how simple autocomplete and spell-check suggestions work.",
    ],
    deepDive: [
      {
        heading: "Node design and memory cost",
        body: "There are two common node designs. A dict of children (like the explainer's version) stores only the letters actually used, which suits large alphabets such as Unicode. An array of 26 slots for lowercase letters gives fast indexing but wastes memory when most slots are empty.\n\nThe number of nodes is at most the total number of characters inserted, plus one for the root, and shared prefixes reduce it. But each Python node is a separate object, often a few hundred bytes. A trie of 100,000 English words can easily use tens of megabytes in Python, far more than a set of the same words.\n\nCompressed tries, called radix trees or Patricia tries, merge chains of single-child nodes into one edge labelled with a whole substring. This cuts the node count dramatically. Radix trees are used for IP routing tables and inside many key-value stores and web routers.",
        bullets: ["Dict children: flexible, any alphabet", "Array of 26: fast, memory hungry", "Radix tree: merge single-child chains"],
      },
      {
        heading: "Insert, search and startsWith",
        body: "Insert walks the word letter by letter, creating missing children, and sets the end flag on the last node. Search walks the same path; it fails if a letter is missing, and succeeds only if the final node has the end flag. startsWith walks the prefix and succeeds if the walk completes, regardless of the flag.\n\nAll three cost O(L) for a string of length L. That cost does not grow with the number of stored words, which is the trie's selling point. A hash set lookup is also O(L) on average, because hashing the string reads every character, so for exact lookups a set is usually faster in Python.\n\nUseful extras: store a count of words passing through each node to answer \"how many words start with this prefix\" in O(L). Store the full word or a frequency at end nodes for autocomplete ranking. Deletion clears the end flag and then removes nodes on the way back up that have no children and no flag.",
        visual: {
          type: "flow",
          title: "search('cap') versus startsWith('ca')",
          steps: [
            { label: "Root to c", detail: "Child c exists." },
            { label: "c to a", detail: "Child a exists: startsWith('ca') is True." },
            { label: "a to p?", detail: "No child p: search('cap') is False." },
            { label: "Rule", detail: "search also needs the end flag at the last node." },
          ],
        },
      },
      {
        heading: "Autocomplete: collecting words under a prefix",
        body: "Walk to the prefix node in O(P). Then run a DFS over its subtree, building the current string as you go and recording it whenever you reach an end flag. Visiting children in alphabetical order (sort the dict keys, or use the 26-slot array) yields suggestions in sorted order. Stop after k results to keep it fast.\n\nThe cost is O(P + size of the subtree visited). For a short prefix like 'a', the subtree might be huge, which is why real autocomplete systems precompute the top few suggestions at each node, or rank by stored frequency and use a heap to pick the best k.\n\nTries also power word games and grid searches. In Word Search II, you DFS over a letter grid while walking the trie in parallel, abandoning a path as soon as the trie has no matching child. One trie handles thousands of target words at once.",
        bullets: ["Walk to prefix, then DFS for end flags", "Sorted child order gives sorted results", "Prune grid searches when the trie has no child"],
      },
      {
        heading: "Tries versus hash sets and sorted lists",
        body: "A hash set answers \"is this exact word stored?\" in O(L) average time with low memory and C-speed hashing. It cannot answer prefix questions without scanning every word.\n\nA sorted list with bisect answers prefix questions surprisingly well: all words with prefix p lie in one contiguous block starting at bisect_left(words, p). Walk forward while words start with p. That is O(L log n) to find the block, and very memory efficient. Inserting new words is O(n), though.\n\nA trie gives O(L) insert, search and prefix queries, plus extras: longest common prefix, the longest stored prefix of a query (used in routing and tokenisers), and prefix counts, all naturally. Choose a trie when prefix operations are the core of the problem and data changes often; otherwise a set or sorted list is simpler in Python.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Storing a word list",
        columns: [
          { title: "Hash set", points: ["Exact lookup O(L) average", "No prefix queries", "Compact in memory", "Built into Python"] },
          { title: "Sorted list + bisect", points: ["Lookup O(L log n)", "Prefix = one contiguous block", "Very compact", "Insert O(n)"] },
          { title: "Trie", points: ["Lookup and insert O(L)", "Prefix queries O(P) plus results", "Many node objects", "Prefix counts, longest prefix match"] },
        ],
      },
    ],
    examples: [
      {
        title: "Trie with prefix counts and autocomplete",
        explanation: "Each node is a dict of children plus a count of how many words pass through it and an end flag. After inserting 'car', 'card', 'care', 'cat' and 'dog', count_prefix('car') is 3 and complete('car') returns ['car', 'card', 'care'] in alphabetical order, by walking to the prefix node and doing a sorted DFS.",
        code: {
          lang: "python",
          code: "class TrieNode:\n    def __init__(self): self.kids, self.count, self.end = {}, 0, False\n\nclass Trie:\n    def __init__(self): self.root = TrieNode()\n    def insert(self, w):\n        n = self.root\n        for ch in w:\n            n = n.kids.setdefault(ch, TrieNode()); n.count += 1\n        n.end = True\n    def _walk(self, p):\n        n = self.root\n        for ch in p:\n            n = n.kids.get(ch)\n            if n is None: return None\n        return n",
        },
      },
      {
        title: "Longest common prefix of a word list",
        explanation: "Insert all words into the trie, then walk down from the root while the current node has exactly one child and is not the end of a word. For ['flower', 'flow', 'flight'] the walk goes f, l and then stops because l has two children (o and i). The answer is 'fl'. A single-node trie dict keeps this short.",
        code: {
          lang: "python",
          code: "def longest_common_prefix(words):\n    root = {}\n    for w in words:\n        node = root\n        for ch in w:\n            node = node.setdefault(ch, {})\n        node['$'] = True\n    prefix, node = [], root\n    while len(node) == 1 and '$' not in node:\n        ch = next(iter(node))\n        prefix.append(ch)\n        node = node[ch]\n    return ''.join(prefix)\n\nprint(longest_common_prefix(['flower', 'flow', 'flight']))  # fl",
        },
      },
    ],
    cheatSheet: [
      "Insert, search, startsWith: O(L) for a string of length L",
      "search needs the end flag; startsWith only needs the path",
      "Store a pass-through count per node to count words with a prefix in O(P)",
      "Autocomplete: walk to the prefix node, then DFS collecting end flags",
      "Radix tree: compress single-child chains into one edge",
      "Exact lookups only? A Python set is simpler and faster",
      "Sorted list: words with prefix p start at bisect_left(words, p)",
    ],
    quiz: [
      {
        q: "A trie holds 'cart' only. What do search('car') and startsWith('car') return?",
        options: ["True, True", "False, False", "True, False", "False, True"],
        answer: 3,
        why: "The path c-a-r exists, but no word ends at r, so search fails and startsWith succeeds.",
      },
      {
        q: "What is the time to search a word of length L in a trie with a million words?",
        options: ["O(L)", "O(log n)", "O(n)", "O(L log n)"],
        answer: 0,
        why: "The walk takes one step per character, independent of how many words are stored.",
      },
      {
        q: "What does a radix (compressed) trie change?",
        options: ["It stores words in a hash table", "It merges chains of single-child nodes into one edge", "It sorts words by length", "It removes the end flag"],
        answer: 1,
        why: "Compressing single-child paths cuts the number of nodes dramatically.",
      },
      {
        q: "Which question can a trie answer efficiently that a hash set cannot?",
        options: ["Is 'cat' stored?", "How many words are stored?", "Which stored words start with 'ca'?", "Is the set empty?"],
        answer: 2,
        why: "Prefix queries follow one path in a trie, but would require scanning every word in a set.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add search(w) and starts_with(p) to the Trie class from the first example. Example: after inserting 'car', search('ca') is False and starts_with('ca') is True.",
        hint: "Both use _walk; search also checks the end flag.",
        solution: "def search(self, w):\n    n = self._walk(w)\n    return n is not None and n.end\n\ndef starts_with(self, p):\n    return self._walk(p) is not None\n\nTrie.search, Trie.starts_with = search, starts_with\nt = Trie(); t.insert('car')\nprint(t.search('ca'), t.starts_with('ca'))  # False True",
      },
      {
        level: "medium",
        task: "Add complete(p, k=10) to the Trie class that returns up to k stored words starting with p, in alphabetical order. Example: after 'car', 'card', 'care', 'cat', complete('car') gives ['car', 'card', 'care'].",
        hint: "Walk to the prefix node, then DFS over sorted children, appending to a path list.",
        solution: "def complete(self, p, k=10):\n    start, out = self._walk(p), []\n    def dfs(n, path):\n        if len(out) == k: return\n        if n.end: out.append(path)\n        for ch in sorted(n.kids):\n            dfs(n.kids[ch], path + ch)\n    if start: dfs(start, p)\n    return out\n\nTrie.complete = complete",
      },
      {
        level: "hard",
        task: "Write replace_words(roots, sentence) that replaces each word with the shortest root that is its prefix. Example: roots ['cat', 'bat', 'rat'], sentence 'the cattle was rattled by the battery' gives 'the cat was rat by the bat'.",
        hint: "Build a dict trie of the roots. For each word, walk letters and stop at the first end flag.",
        solution: "def replace_words(roots, sentence):\n    trie = {}\n    for r in roots:\n        n = trie\n        for ch in r: n = n.setdefault(ch, {})\n        n['$'] = True\n    def shortest(w):\n        n = trie\n        for i, ch in enumerate(w):\n            if ch not in n: return w\n            n = n[ch]\n            if '$' in n: return w[:i + 1]\n        return w\n    return ' '.join(shortest(w) for w in sentence.split())",
      },
    ],
    faq: [
      { q: "How do you pronounce trie?", a: "Most people say \"try\" to avoid confusion with \"tree\", although the name comes from retrieval and some say \"tree\"." },
      { q: "Is a trie faster than a dict in Python?", a: "For exact lookups, usually no: a dict or set hashes the whole string in fast C code. A trie wins when you need prefix queries, prefix counts or longest-prefix matching." },
      { q: "Where are tries used in real systems?", a: "In autocomplete and spell checkers, IP routing (longest prefix match on addresses), tokenisers that match the longest known piece, and URL routers in web frameworks, often in compressed radix-tree form." },
    ],
  },
};

export default extra;
