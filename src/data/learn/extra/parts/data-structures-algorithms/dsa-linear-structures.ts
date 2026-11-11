import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-linear-structures/singly-linked-lists": {
    plain: [
      "An array keeps its items side by side in memory, like houses on one street with numbers. A linked list is different. Each item lives in its own small box called a node, which can be anywhere in memory. Every node holds a value and an arrow, called a pointer, to the next node.",
      "To use the list you only need the first node, the head. From there you follow the arrows one by one until an arrow points to nothing (None in Python). That last node is the tail.",
      "This makes some jobs very cheap and others slow. Adding a node at the front is instant: make it point to the old head, and it becomes the new head. But finding the 500th item means walking 499 arrows, because there is no way to jump straight there.",
      "Most linked list problems in interviews are about rewiring arrows without losing any nodes. Draw boxes and arrows on paper, change one arrow at a time, and always save the node you are about to lose before you overwrite its pointer.",
    ],
    deepDive: [
      {
        heading: "Node and list classes, and what each operation costs",
        body: "A Node holds val and next. A small LinkedList wrapper usually stores head, an optional tail and a size counter, so len() is O(1) instead of a full walk.\n\nInsert at head is O(1): new.next = head, then head = new. Insert at tail is O(1) only if you keep a tail pointer; without it you must walk the whole list, O(n). Delete at head is O(1). Delete at tail is O(n) even with a tail pointer, because you need the node before the tail, and a singly linked list cannot step backwards. Insert or delete after a node you already hold is O(1). Search by value or by index is O(n).\n\nIn Python, adding __slots__ = ('val', 'next') to the Node class stops each node from carrying its own attribute dictionary, which saves a lot of memory for long lists.",
        bullets: ["Head insert or delete: O(1)", "Tail insert: O(1) with a tail pointer, else O(n)", "Tail delete: O(n), needs the previous node", "Access by index or search: O(n)"],
      },
      {
        heading: "Reversing recursively, and what it really costs",
        body: "The recursive reversal reads like a definition: reverse the rest of the list, then put the current node at the end of that reversed rest. The base case is an empty list or a single node, which is already reversed. After the recursive call returns new_head, head.next is the last node of the reversed rest, so head.next.next = head attaches head behind it, and head.next = None makes head the new tail.\n\nThe time is O(n), the same as the loop. The space is not: each call waits on the call stack until the deeper calls finish, so it uses O(n) stack frames. CPython's default recursion limit is 1000, so reversing a list of a few thousand nodes this way raises RecursionError. That is why the iterative O(1)-space version is the one to use in real code, and the recursive one is mainly a good test of recursive thinking.",
      },
      {
        heading: "The dummy head node and merging sorted lists",
        body: "Many list operations treat the head as a special case: deleting the first node, inserting before it, or building a result list from nothing. A dummy node is a throwaway node placed in front of the real head. Now every real node has a node before it, so one loop handles every case, and the answer is dummy.next.\n\nMerging two sorted lists shows the idea clearly. Keep a tail pointer that starts at the dummy. Compare the two front nodes, attach the smaller one to tail, move forward in that list, and move tail forward. When one list runs out, attach the rest of the other in one step, because it is already sorted. This takes O(n + m) time and O(1) extra space, since it reuses the existing nodes instead of creating new ones. Using <= when comparing keeps equal values in their original order, which makes the merge stable.",
        visual: {
          type: "flow",
          title: "Merging 1 3 5 with 2 4 using a dummy",
          steps: [
            { label: "Start", detail: "tail = dummy; fronts are 1 and 2" },
            { label: "Take 1", detail: "dummy -> 1; fronts 3 and 2" },
            { label: "Take 2", detail: "-> 1 -> 2; fronts 3 and 4" },
            { label: "Take 3, then 4", detail: "-> 1 -> 2 -> 3 -> 4; second list empty" },
            { label: "Attach rest", detail: "tail.next = 5 in one step" },
            { label: "Return dummy.next", detail: "1 -> 2 -> 3 -> 4 -> 5" },
          ],
        },
      },
      {
        heading: "Two pointers with a gap, and splitting",
        body: "Because you cannot index into a list, many problems use two pointers moving through it together. To find the k-th node from the end in one pass, move a fast pointer k steps ahead first, then move both pointers one step at a time. When fast reaches the end, slow is exactly k nodes behind it. Starting both at a dummy node makes removing the first node work with no special case.\n\nSplitting a list in two is just cutting one pointer: walk to the node where the first part should end, save its next as the head of the second part, then set its next to None. Splitting at the middle plus merging gives merge sort for linked lists, which runs in O(n log n) time and needs no random access, so it suits lists better than quicksort does.",
        bullets: ["k-th from end: gap of k between two pointers", "Split: save next, then set next = None", "Merge sort on a list: O(n log n), O(log n) recursion stack"],
      },
      {
        heading: "Linked list or array: the honest trade-off",
        body: "On paper, linked lists win at inserting in the middle: O(1) once you hold the node, while an array must shift elements, O(n). In practice arrays are often faster anyway. Array elements sit next to each other in memory, so the CPU cache loads many at once. Linked nodes are scattered, so each step can be a cache miss, and every node also pays for a pointer.\n\nThat is why Python's list is a dynamic array and there is no linked list in the standard library. Linked structures shine when you already hold references to nodes and must splice them in O(1): LRU caches, free lists in memory allocators, adjacency lists, and the hash table chains you meet in the hashing module.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Python list vs singly linked list",
        columns: [
          { title: "Python list (dynamic array)", points: ["Index access: O(1)", "Append at end: amortised O(1)", "Insert or delete at front: O(n)", "Items next to each other in memory"] },
          { title: "Singly linked list", points: ["Index access: O(n)", "Insert or delete at head: O(1)", "Insert after a held node: O(1)", "Nodes scattered, one pointer each"] },
        ],
      },
    ],
    examples: [
      {
        title: "Merge two sorted lists",
        explanation: "Input: 1 -> 3 -> 5 and 2 -> 4. Step 1: create a dummy and point tail at it. Step 2: while both lists have nodes, attach the smaller front node and advance. Step 3: attach whatever is left. Step 4: return dummy.next. No new value nodes are created; the existing nodes are relinked, so extra space is O(1) and time is O(n + m).",
        code: {
          lang: "python",
          code: "class Node:\n    def __init__(self, val, next=None):\n        self.val, self.next = val, next\n\ndef merge(a, b):                  # O(n + m) time, O(1) extra space\n    dummy = tail = Node(0)\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next",
        },
      },
      {
        title: "Remove the n-th node from the end in one pass",
        explanation: "List 1 -> 2 -> 3 -> 4 -> 5, n = 2, so node 4 must go. Step 1: put fast and slow on a dummy before the head. Step 2: move fast n steps ahead, to node 2. Step 3: move both until fast is on the last node; slow is now on node 3, just before the target. Step 4: skip the target with slow.next = slow.next.next. The dummy makes removing the real head (n equal to the length) work with the same code. O(L) time, O(1) space.",
        code: {
          lang: "python",
          code: "def remove_nth_from_end(head, n):\n    dummy = Node(0, head)\n    fast = slow = dummy\n    for _ in range(n):\n        fast = fast.next\n    while fast.next:\n        fast, slow = fast.next, slow.next\n    slow.next = slow.next.next\n    return dummy.next",
        },
      },
    ],
    cheatSheet: [
      "Head insert and delete: O(1). Tail insert: O(1) only with a tail pointer",
      "Tail delete in a singly linked list is O(n): you need the previous node",
      "Iterative reverse: O(n) time, O(1) space. Recursive reverse: O(n) stack space",
      "Use a dummy node whenever the head might change; return dummy.next",
      "Merging two sorted lists: O(n + m) time, O(1) extra space",
      "k-th from end: advance fast k steps, then move both until fast ends",
      "Save cur.next before you overwrite it, or the rest of the list is lost",
    ],
    quiz: [
      {
        q: "A singly linked list keeps both head and tail pointers. What does deleting the tail cost?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        answer: 2,
        why: "You must walk to the node before the tail to set its next to None.",
      },
      {
        q: "What is the extra space used by the recursive list reversal?",
        options: ["O(n), one stack frame per node", "O(1)", "O(log n)", "None, Python optimises tail calls"],
        answer: 0,
        why: "Each call stays on the call stack until the deeper calls return, and CPython does not eliminate tail calls.",
      },
      {
        q: "Why do merge functions often start with dummy = Node(0)?",
        options: ["To make the merge faster than O(n)", "To store the length of the list", "To keep the lists sorted", "So the first attached node needs no special case"],
        answer: 3,
        why: "With a fixed node before the result, every attachment is the same tail.next = node step.",
      },
      {
        q: "You hold a reference to node X. What does inserting a new node right after X cost?",
        options: ["O(n)", "O(1)", "O(log n)", "It depends on the position of X"],
        answer: 1,
        why: "Only two pointers change: new.next = X.next and X.next = new.",
      },
      {
        q: "To find the 3rd node from the end in one pass, how far ahead should fast start?",
        options: ["1 step", "2 steps", "3 steps", "Half the list"],
        answer: 2,
        why: "Start both at the head, move fast 3 steps, then move both until fast is None; slow is then the 3rd node from the end.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write from_list(values) that builds a linked list from a Python list, and to_list(head) that turns it back into a Python list.",
        hint: "Build with a dummy and a tail pointer so the order is preserved.",
        solution: "def from_list(values):\n    dummy = tail = Node(0)\n    for v in values:\n        tail.next = Node(v)\n        tail = tail.next\n    return dummy.next\n\ndef to_list(head):\n    out = []\n    while head:\n        out.append(head.val); head = head.next\n    return out",
      },
      {
        level: "medium",
        task: "Reverse a linked list recursively, and explain why it fails for a list of 5,000 nodes in default CPython.",
        hint: "Reverse the rest first, then hook the current node onto the end of it.",
        solution: "def reverse_rec(head):\n    if head is None or head.next is None:\n        return head\n    new_head = reverse_rec(head.next)\n    head.next.next = head\n    head.next = None\n    return new_head\n# 5,000 nested calls exceed the default recursion limit of 1000,\n# so Python raises RecursionError. The loop version has no such limit.",
      },
      {
        level: "hard",
        task: "Check whether a linked list is a palindrome in O(n) time and O(1) extra space.",
        hint: "Find the middle with slow and fast pointers, reverse the second half, then compare both halves.",
        solution: "def is_palindrome(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n    prev = None                      # reverse the second half\n    while slow:\n        slow.next, prev, slow = prev, slow, slow.next\n    a, b = head, prev\n    while b:\n        if a.val != b.val: return False\n        a, b = a.next, b.next\n    return True",
      },
    ],
    faq: [
      { q: "Does Python have a built-in linked list?", a: "Not as a public type. list is a dynamic array, and collections.deque is built from linked blocks but does not expose nodes. For algorithm practice you write a small Node class." },
      { q: "When should I use a linked list instead of an array?", a: "When you hold references to nodes and must insert, remove or move them in O(1), as in an LRU cache. For most other jobs an array is simpler and faster because of memory locality." },
      { q: "Why are linked lists so common in interviews?", a: "They test careful pointer handling, edge cases like empty and one-node lists, and the ability to reason about O(1) space solutions." },
    ],
  },

  "dsa-linear-structures/doubly-circular-lists": {
    plain: [
      "A doubly linked list is a linked list where every node has two arrows: one to the next node and one back to the previous node. That extra arrow costs a little memory, but now you can walk in both directions.",
      "The big win is removal. In a singly linked list, to remove a node you first need the node before it, which may mean walking from the head. In a doubly linked list the node already knows its neighbours, so you can unlink it in a few steps, no matter how long the list is.",
      "In a circular list, the last node does not point to nothing. It points back to the first node, so the chain becomes a ring. That is handy for things that take turns forever, like players in a game or tasks in a round-robin scheduler.",
      "Sometimes a ring appears by accident, from a bug. Then a simple loop over the list never ends. The fast and slow pointer trick, also called Floyd's algorithm, detects such a loop using only two variables.",
    ],
    deepDive: [
      {
        heading: "Sentinels: no more None checks",
        body: "A plain doubly linked list has many edge cases: inserting into an empty list, removing the only node, changing the head or the tail. Each needs its own if statement, and each is a place for bugs.\n\nSentinels remove them. Create two permanent dummy nodes, head and tail, linked to each other at the start. Real nodes always live between them. Now every real node has a real prev and a real next, so insert after any node and remove any node are each one short block of code with no conditions. The list is empty when head.next is tail.\n\nInserting X after node A changes four pointers: X.prev = A, X.next = A.next, A.next.prev = X, A.next = X. Removing node X changes two: X.prev.next = X.next and X.next.prev = X.prev. Both are O(1). Always set the new node's own pointers first, then update the neighbours.",
        visual: {
          type: "flow",
          title: "Removing node B from A <-> B <-> C",
          steps: [
            { label: "Hold B", detail: "From a hash map or a previous step" },
            { label: "Bypass forward", detail: "B.prev.next = B.next, so A -> C" },
            { label: "Bypass backward", detail: "B.next.prev = B.prev, so A <- C" },
            { label: "Done in O(1)", detail: "B is detached; no walk from the head" },
          ],
        },
      },
      {
        heading: "Circular lists in practice",
        body: "In a circular singly linked list the tail points to the head. A neat trick is to keep only a pointer to the tail: then the head is tail.next, so you can insert at both the front and the back in O(1).\n\nThe danger is traversal. A loop that stops at None never ends, because there is no None. Instead, stop when you come back to the node you started from, using a do-while style: process the start node, move on, and continue until cur is start again.\n\nCircular structures appear in round-robin scheduling (each task gets a turn, then the pointer moves on), in the Josephus problem, and in ring buffers, which are the array version of the same idea and come up in the next topic. A doubly circular list with one sentinel, whose next is the first node and whose prev is the last, is how many standard libraries implement their linked lists.",
        bullets: ["Keep a tail pointer: head is tail.next", "Stop traversal when you return to the start node", "Rotate a list: make it circular, then cut at the new tail"],
      },
      {
        heading: "Floyd's algorithm, phase two: where does the cycle start?",
        body: "Phase one (fast moves 2, slow moves 1) tells you whether a cycle exists. Phase two finds the node where it begins. After they meet, put one pointer back at the head and move both one step at a time. The node where they meet again is the start of the cycle.\n\nWhy? Let a be the distance from the head to the cycle start, b the distance from the start to the meeting point, and c the cycle length. When they meet, slow has walked a + b and fast twice that. Fast's extra distance a + b is a whole number of laps, so a + b = k times c. That means a = k times c minus b: walking a steps from the meeting point lands exactly on the cycle start, which is also a steps from the head.\n\nTo get the cycle length, keep one pointer at the meeting point and count steps until the other returns. Everything stays O(n) time and O(1) space.",
        visual: {
          type: "flow",
          title: "Finding the start of a cycle",
          steps: [
            { label: "Phase 1", detail: "slow +1, fast +2 until they meet" },
            { label: "No meeting?", detail: "fast hit None: there is no cycle" },
            { label: "Reset", detail: "Move slow back to head; fast stays" },
            { label: "Phase 2", detail: "Both move +1 per step" },
            { label: "Meet again", detail: "That node is where the cycle starts" },
          ],
        },
      },
      {
        heading: "Middle of the list: first or second middle?",
        body: "With slow moving 1 and fast moving 2, slow is at the middle when fast runs out. For an odd length there is one middle. For an even length there are two, and the loop condition decides which one you get.\n\nWith while fast and fast.next, slow stops on the second middle: for 1 2 3 4 it returns 3. With while fast.next and fast.next.next (and a non-empty list), slow stops on the first middle, 2. The first middle is what you want when splitting a list for merge sort, because you then cut after slow and both halves are non-empty for any list of two or more nodes.\n\nThe same idea gives other positions too: a fast pointer moving 3 steps finds the node one third of the way in.",
        bullets: ["while fast and fast.next: second middle", "while fast.next and fast.next.next: first middle", "Merge sort splits after the first middle"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Singly, doubly and circular lists",
        columns: [
          { title: "Singly linked", points: ["One pointer per node", "Remove a node: needs its predecessor", "Walk forward only", "Ends at None"] },
          { title: "Doubly linked", points: ["Two pointers per node", "Remove a held node: O(1)", "Walk both ways", "Sentinels remove edge cases"] },
          { title: "Circular", points: ["Tail points back to head", "No None to stop at", "Good for round-robin turns", "Tail pointer gives O(1) at both ends"] },
        ],
      },
    ],
    examples: [
      {
        title: "A doubly linked list with two sentinels",
        explanation: "Goal: a list where insert_after and remove are O(1) with no if statements. Step 1: create the head and tail sentinels and link them to each other. Step 2: insert_after sets the new node's pointers first, then makes both neighbours point at it. Step 3: remove makes the two neighbours point at each other. This is the core of an LRU cache, where a dict maps keys to these nodes.",
        code: {
          lang: "python",
          code: "class DNode:\n    def __init__(self, val=None):\n        self.val, self.prev, self.next = val, None, None\n\nclass DList:\n    def __init__(self):\n        self.head, self.tail = DNode(), DNode()      # sentinels\n        self.head.next, self.tail.prev = self.tail, self.head\n    def insert_after(self, node, val):               # O(1)\n        new = DNode(val)\n        new.prev, new.next = node, node.next\n        node.next.prev = new\n        node.next = new\n        return new\n    def remove(self, node):                          # O(1)\n        node.prev.next, node.next.prev = node.next, node.prev",
        },
      },
      {
        title: "Find the node where a cycle begins",
        explanation: "A list 3 -> 2 -> 0 -> -4 whose last node points back to 2. Step 1: run slow and fast until they meet inside the cycle; if fast reaches None, return None. Step 2: move slow back to the head. Step 3: advance both by one; they meet at node 2, the cycle start. The while-else runs the else branch only if the loop ended without break, which means no cycle. O(n) time, O(1) space.",
        code: {
          lang: "python",
          code: "def cycle_start(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast:\n            break\n    else:\n        return None               # fast reached the end: no cycle\n    slow = head\n    while slow is not fast:\n        slow, fast = slow.next, fast.next\n    return slow",
        },
      },
    ],
    cheatSheet: [
      "Doubly linked remove of a held node: X.prev.next = X.next; X.next.prev = X.prev (O(1))",
      "Insert after A: set new.prev and new.next first, then A.next.prev and A.next",
      "Sentinels: list is empty when head.next is tail",
      "Floyd phase 1 detects a cycle; phase 2 (reset one pointer to head) finds its start",
      "while fast and fast.next stops slow on the second middle of an even list",
      "Circular traversal: stop when cur returns to the start node, not at None",
      "LRU cache = dict of key to node + doubly linked list ordered by recent use",
    ],
    quiz: [
      {
        q: "After Floyd's pointers meet, one is reset to the head and both move one step at a time. Where do they meet next?",
        options: ["At the head", "At the start of the cycle", "At the middle of the list", "They never meet again"],
        answer: 1,
        why: "The distance from the head to the cycle start equals the distance from the meeting point to it, modulo the cycle length.",
      },
      {
        q: "How many pointer assignments does removing a node from a doubly linked list with sentinels need?",
        options: ["Two", "One", "Four", "It depends on the position"],
        answer: 0,
        why: "Only the two neighbours change: prev.next and next.prev.",
      },
      {
        q: "For the list 1 2 3 4, where does slow stop with the loop while fast and fast.next?",
        options: ["1", "2", "4", "3"],
        answer: 3,
        why: "fast goes 1, 3, then None; slow goes 1, 2, 3, which is the second middle.",
      },
      {
        q: "Why can a loop like while cur: cur = cur.next run forever on a circular list?",
        options: ["Python limits loop length", "The prev pointers are missing", "There is no node whose next is None", "Circular lists have no head"],
        answer: 2,
        why: "In a ring every node has a successor, so the stopping condition is never met.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Count the nodes of a circular singly linked list, given any node in it.",
        hint: "Walk until you are back at the node you started from.",
        solution: "def count_circular(node):\n    if node is None:\n        return 0\n    n, cur = 1, node.next\n    while cur is not node:\n        n, cur = n + 1, cur.next\n    return n",
      },
      {
        level: "medium",
        task: "Rotate a singly linked list to the right by k places (1 2 3 4 5 with k = 2 becomes 4 5 1 2 3) in O(n).",
        hint: "Find the length and tail, make the list circular, then cut it n - k % n steps after the old tail.",
        solution: "def rotate_right(head, k):\n    if not head or not head.next: return head\n    n, tail = 1, head\n    while tail.next:\n        tail, n = tail.next, n + 1\n    tail.next = head                 # make it circular\n    for _ in range(n - k % n):\n        tail = tail.next\n    head, tail.next = tail.next, None\n    return head",
      },
      {
        level: "hard",
        task: "Build an LRU cache with get(key) and put(key, value), both O(1), that evicts the least recently used key when over capacity.",
        hint: "collections.OrderedDict is a dict plus a doubly linked list; use move_to_end and popitem(last=False).",
        solution: "from collections import OrderedDict\nclass LRUCache:\n    def __init__(self, capacity):\n        self.cap, self.data = capacity, OrderedDict()\n    def get(self, key):\n        if key not in self.data: return -1\n        self.data.move_to_end(key)\n        return self.data[key]\n    def put(self, key, value):\n        self.data[key] = value\n        self.data.move_to_end(key)\n        if len(self.data) > self.cap: self.data.popitem(last=False)",
      },
    ],
    faq: [
      { q: "Is a doubly linked list always better than a singly linked one?", a: "No. It uses an extra pointer per node and more pointer updates per change. Use it when you need O(1) removal of held nodes or backward traversal." },
      { q: "Can I detect a cycle with a set instead of Floyd's algorithm?", a: "Yes: store each visited node in a set and stop when you see one twice. That is O(n) time but O(n) extra space, while Floyd's uses O(1)." },
      { q: "How does Python's OrderedDict keep its order?", a: "Besides the hash table, OrderedDict keeps its keys in a doubly linked list, which makes move_to_end and popitem at either end O(1). That is why it is a quick way to build an LRU cache." },
    ],
  },

  "dsa-linear-structures/stacks": {
    plain: [
      "A stack is a pile where you only touch the top. You put a new item on top (push), and you take the top item off (pop). The last thing you put in is the first thing you get back, which is called LIFO: last in, first out.",
      "Stacks appear wherever things are nested or need to be undone in reverse order. The back button in a browser, the undo history in an editor, and matching brackets in code all follow the same rule: the most recent open thing must be dealt with first.",
      "Your computer uses a stack every time a function calls another function. The call stack remembers where each function should continue when the inner one returns. That is why very deep recursion can crash a program: the call stack runs out of room.",
      "In Python you do not need a special class. A normal list is a fine stack: append pushes onto the end, pop removes from the end, and stack[-1] peeks at the top. All three are fast.",
    ],
    deepDive: [
      {
        heading: "Why the end of a Python list is the top",
        body: "A Python list is a dynamic array: one block of memory holding pointers to its items. append writes into the next free slot, and when the block is full, CPython allocates a bigger one (roughly one eighth larger plus a little) and copies everything over. Copies are rare enough that the average cost per append is O(1), which is called amortised O(1). pop() from the end is O(1) and never copies.\n\nThe front of the list is a different story. pop(0) and insert(0, x) must shift every other pointer by one slot, so they are O(n). Use the end as the top and the stack is fast; use the front and every operation slows down as the stack grows.\n\nIf you need a stack that several threads share, queue.LifoQueue adds locking. For algorithms, a list is the right choice.",
        bullets: ["push: append, amortised O(1)", "pop: pop(), O(1)", "peek: stack[-1], O(1)", "empty check: if not stack"],
      },
      {
        heading: "Evaluating postfix expressions",
        body: "In postfix notation, also called reverse Polish notation, operators come after their operands: 3 4 + means 3 + 4. There are no brackets and no precedence rules, because the order is already fixed.\n\nOne stack evaluates it in a single left-to-right pass. When you read a number, push it. When you read an operator, pop two numbers, apply the operator, and push the result. At the end, the stack holds exactly one value: the answer. If you ever need to pop from an empty stack, or more than one value remains at the end, the expression was malformed.\n\nOrder matters for minus and divide. The first value you pop is the right operand and the second is the left one, so for 8 2 - you pop 2, then 8, and compute 8 - 2. The whole evaluation is O(n) time and O(n) space for n tokens.",
        visual: {
          type: "flow",
          title: "Evaluating 5 1 2 + 4 * + 3 -",
          steps: [
            { label: "5 1 2", detail: "Push all three. Stack: 5 1 2" },
            { label: "+", detail: "Pop 2 and 1, push 3. Stack: 5 3" },
            { label: "4 *", detail: "Push 4, then pop 4 and 3, push 12. Stack: 5 12" },
            { label: "+", detail: "Pop 12 and 5, push 17. Stack: 17" },
            { label: "3 -", detail: "Push 3, then pop 3 and 17, push 14" },
            { label: "End", detail: "One value left: the answer is 14" },
          ],
        },
      },
      {
        heading: "From normal notation to postfix: the shunting-yard idea",
        body: "People write infix expressions like 3 + 4 * 2, where precedence decides the order. Dijkstra's shunting-yard algorithm converts them to postfix with one stack for operators.\n\nRead tokens left to right. Numbers go straight to the output. For an operator, first pop to the output every operator on the stack with higher or equal precedence (equal, because + - * / are left-associative), then push the new one. An opening bracket is pushed. A closing bracket pops operators to the output until the matching opening bracket, which is then discarded. At the end, pop everything that is left.\n\nSo 3 + 4 * 2 becomes 3 4 2 * +, and (3 + 4) * 2 becomes 3 4 + 2 *. Each token is pushed and popped at most once, so the conversion is O(n). Calculators and many expression parsers work this way.",
        bullets: ["Numbers: straight to output", "Operator: pop higher or equal precedence first", "Right-associative ^ pops only strictly higher precedence"],
      },
      {
        heading: "Replacing recursion with an explicit stack",
        body: "A recursive function stores its unfinished work on the call stack. You can store that work on your own list instead. The pattern: push the starting item; while the stack is not empty, pop an item, process it, and push the sub-items it would have recursed on.\n\nWhy bother? CPython's default recursion limit is 1000 frames, and each frame costs far more memory than a list entry. A deeply nested structure, a long chain in a graph, or a degenerate tree can trigger RecursionError, while the explicit stack only grows a list on the heap. Raising the limit with sys.setrecursionlimit is possible but can crash the interpreter if the real C stack overflows.\n\nOne thing changes: items come off in reverse order of pushing. If processing order matters, as in preorder tree traversal, push the right child before the left so the left is handled first.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Undo and redo with two stacks",
        actors: ["Editor", "Undo stack", "Redo stack"],
        messages: [
          { from: 0, to: 1, label: "Type A: push A" },
          { from: 0, to: 1, label: "Type B: push B" },
          { from: 1, to: 0, label: "Undo: pop B, revert it" },
          { from: 0, to: 2, label: "Push B onto redo" },
          { from: 2, to: 0, label: "Redo: pop B, apply again" },
          { from: 0, to: 1, label: "Push B back onto undo" },
          { from: 0, to: 2, label: "New edit C: clear redo" },
        ],
      },
    ],
    examples: [
      {
        title: "A postfix calculator",
        explanation: "Input tokens: 5 1 2 + 4 * + 3 -. Step 1: push numbers. Step 2: on an operator, pop the right operand first, then the left, and push the result. Step 3: the last value on the stack is the answer, 14. Division uses int(a / b), which truncates toward zero like most calculator problems expect, while Python's // rounds toward minus infinity (-7 // 2 is -4, but int(-7 / 2) is -3).",
        code: {
          lang: "python",
          code: "def eval_postfix(tokens):         # O(n) time, O(n) space\n    ops = {'+': lambda a, b: a + b, '-': lambda a, b: a - b,\n           '*': lambda a, b: a * b, '/': lambda a, b: int(a / b)}\n    stack = []\n    for tok in tokens:\n        if tok in ops:\n            b = stack.pop()       # right operand comes off first\n            a = stack.pop()\n            stack.append(ops[tok](a, b))\n        else:\n            stack.append(int(tok))\n    return stack.pop()\n\nprint(eval_postfix(\"5 1 2 + 4 * + 3 -\".split()))  # 14",
        },
      },
      {
        title: "Summing a deeply nested list without recursion",
        explanation: "A recursive sum over nested lists crashes with RecursionError once nesting passes about 1000 levels. Step 1: put the outer list on a stack. Step 2: pop an item; if it is a list, push its elements; otherwise add it to the total. Step 3: repeat until the stack is empty. The test builds 10,000 levels of nesting, and the explicit stack handles it easily in O(n) time.",
        code: {
          lang: "python",
          code: "def total(nested):\n    stack, s = [nested], 0\n    while stack:\n        item = stack.pop()\n        if isinstance(item, list):\n            stack.extend(item)\n        else:\n            s += item\n    return s\n\ndeep = [1]\nfor _ in range(10_000):\n    deep = [deep, 1]\nprint(total(deep))                # 10001",
        },
      },
    ],
    cheatSheet: [
      "Python stack: append to push, pop() to pop, stack[-1] to peek, all O(1)",
      "Never use pop(0) or insert(0, x) for a stack: both are O(n)",
      "Postfix: number -> push; operator -> pop right, pop left, push result",
      "Shunting-yard turns infix into postfix in O(n) with one operator stack",
      "CPython's default recursion limit is 1000; an explicit stack has no such limit",
      "Undo and redo: two stacks; a new edit clears the redo stack",
      "Min stack: store (value, min so far) pairs for O(1) get_min",
    ],
    quiz: [
      {
        q: "What does the postfix expression 8 2 - 3 * evaluate to?",
        options: ["-18", "2", "18", "12"],
        answer: 2,
        why: "8 2 - is 6, then 6 3 * is 18.",
      },
      {
        q: "Why is list.append amortised O(1) rather than always O(1)?",
        options: ["It occasionally copies everything into a larger block", "It sorts the list", "It hashes the item", "It shifts all items right"],
        answer: 0,
        why: "Resizes are rare and grow the capacity proportionally, so the average cost per append stays constant.",
      },
      {
        q: "What does shunting-yard produce for 3 + 4 * 2?",
        options: ["3 4 + 2 *", "+ 3 * 4 2", "3 4 2 + *", "3 4 2 * +"],
        answer: 3,
        why: "* has higher precedence, so it is applied to 4 and 2 before the +.",
      },
      {
        q: "You convert a recursive preorder tree traversal to an explicit stack. Which child do you push first to visit left before right?",
        options: ["Left", "Right", "Either, the order is the same", "Neither; use a queue"],
        answer: 1,
        why: "The stack returns the last pushed item first, so pushing right first means left is popped next.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Reverse a string using a stack (not slicing).",
        hint: "Push every character, then pop them all.",
        solution: "def reverse(s):\n    stack = list(s)\n    out = []\n    while stack:\n        out.append(stack.pop())\n    return ''.join(out)\n\nprint(reverse('stack'))   # kcats",
      },
      {
        level: "medium",
        task: "Design a MinStack with push, pop, top and get_min, all O(1).",
        hint: "Store each value together with the minimum of the stack at the time it was pushed.",
        solution: "class MinStack:\n    def __init__(self):\n        self.s = []                    # (value, min so far)\n    def push(self, x):\n        m = min(x, self.s[-1][1]) if self.s else x\n        self.s.append((x, m))\n    def pop(self): return self.s.pop()[0]\n    def top(self): return self.s[-1][0]\n    def get_min(self): return self.s[-1][1]",
      },
      {
        level: "hard",
        task: "Convert a tokenised infix expression with + - * / and brackets into postfix (shunting-yard).",
        hint: "Pop operators of higher or equal precedence before pushing; a closing bracket pops until the opening one.",
        solution: "def to_postfix(tokens):\n    prec, out, ops = {'+': 1, '-': 1, '*': 2, '/': 2}, [], []\n    for t in tokens:\n        if t in prec:\n            while ops and ops[-1] != '(' and prec[ops[-1]] >= prec[t]:\n                out.append(ops.pop())\n            ops.append(t)\n        elif t == '(': ops.append(t)\n        elif t == ')':\n            while ops[-1] != '(': out.append(ops.pop())\n            ops.pop()\n        else: out.append(t)\n    return out + ops[::-1]",
      },
    ],
    faq: [
      { q: "Should I use a list or collections.deque as a stack in Python?", a: "Both give O(1) push and pop at the end. A list is the usual choice; deque helps only if you also need fast operations at the front." },
      { q: "What is a stack overflow?", a: "It happens when the call stack runs out of space, usually because of very deep or endless recursion. In Python you see RecursionError when the recursion limit is reached." },
      { q: "Is a stack the same as the stack memory in a program?", a: "They are related. The call stack is a stack data structure that the runtime uses to store function frames; the idea of last in, first out is the same." },
      { q: "Can a stack be built on a linked list?", a: "Yes. Push and pop at the head of a singly linked list are both O(1). In Python a list is usually faster in practice." },
    ],
  },

  "dsa-linear-structures/queues-deques": {
    plain: [
      "A queue works like a line at a ticket counter. People join at the back and leave from the front, so the first to arrive is the first to be served. This is called FIFO: first in, first out.",
      "Queues are everywhere in software. A printer queue, messages waiting to be processed, web requests waiting for a worker, and the breadth-first search algorithm all use the same idea: handle things in the order they arrived.",
      "The obvious way to build a queue in Python, a list with append and pop(0), is a trap. Removing from the front of a list moves every remaining item one step to the left, so it gets slower as the queue grows.",
      "The right tools are collections.deque, a double-ended queue that is fast at both ends, and the ring buffer, a fixed-size array whose ends wrap around in a circle. Both add and remove items in constant time.",
    ],
    deepDive: [
      {
        heading: "Why list.pop(0) is O(n)",
        body: "A Python list stores pointers to its items in one contiguous block of memory, and item i must always be in slot i. When you remove item 0, the list moves every other pointer one slot to the left to close the gap. For a list of n items that is n - 1 moves, so pop(0) is O(n). insert(0, x) does the same in the other direction.\n\nFor a few items you will not notice. For a BFS over a million nodes, using pop(0) does about n squared over 2 pointer moves in total, which turns a fast O(V + E) algorithm into one that takes minutes.\n\nThe fix is a structure that can drop items from the front without moving the rest. A ring buffer just advances a head index. A deque keeps its items in linked blocks and frees a block once it is empty.",
        bullets: ["list.pop(0): O(n)", "list.pop(): O(1)", "deque.popleft(): O(1)"],
      },
      {
        heading: "The ring buffer: a queue in a fixed array",
        body: "A ring buffer is an array of fixed capacity plus two numbers: head, the index of the front item, and count, how many items are stored. The back slot is (head + count) % capacity. Enqueue writes there and increases count. Dequeue reads buf[head], moves head to (head + 1) % capacity and decreases count. The modulo makes the indexes wrap from the last slot back to slot 0, so the array is used in a circle and nothing ever shifts.\n\nThe classic trap is telling full from empty. If you only store head and tail indexes, head == tail can mean either. Two fixes are common: keep a count, as here, or always leave one slot unused so full means (tail + 1) % capacity == head.\n\nRing buffers have fixed memory and no allocation, which is why they are used in audio, network cards, logging and kernels. To grow one, allocate a bigger array and copy the items in order from head, unwrapping them.",
        visual: {
          type: "cycle",
          title: "Ring buffer of capacity 4: indexes wrap around",
          steps: [
            { label: "Enqueue a, b, c", detail: "Slots 0, 1, 2; head 0, count 3" },
            { label: "Dequeue twice", detail: "a and b leave; head 2, count 1" },
            { label: "Enqueue d, e", detail: "d in slot 3, e wraps to slot 0" },
            { label: "Enqueue f", detail: "Slot 1; count 4: the buffer is full" },
            { label: "Dequeue", detail: "c leaves from slot 2; head moves to 3" },
          ],
        },
      },
      {
        heading: "Inside collections.deque",
        body: "CPython's deque is a doubly linked list of fixed-size blocks, each holding 64 items. Appending or popping at either end touches only the end block and allocates or frees a block now and then, so append, appendleft, pop and popleft are all O(1). Because items live in blocks, it has far fewer pointers and better memory locality than a linked list of single nodes.\n\nThe cost is indexing. The documentation states that indexed access is O(1) at both ends but slows to O(n) in the middle, because deque must walk through blocks. So use a deque for its ends, not as a general array.\n\nTwo useful features: deque(maxlen=k) keeps only the last k items, dropping from the opposite end when full, which is perfect for recent history or tail -n. rotate(n) moves items from one end to the other. deque operations at the ends are also thread-safe, though queue.Queue is the better tool for producer and consumer threads because it can block and wait.",
        bullets: ["append, appendleft, pop, popleft: O(1)", "dq[i] near the middle: O(n)", "deque(maxlen=k): bounded, drops the oldest"],
      },
      {
        heading: "Choosing between queue, deque and the others",
        body: "Use a plain FIFO queue (deque with append and popleft) when items must be handled in arrival order: BFS, task scheduling, buffering.\n\nUse a deque when you need both ends. The sliding window maximum in the explainer pushes new indexes at the back, pops dominated ones from the back and expired ones from the front. 0-1 BFS, a shortest-path trick for edges of weight 0 or 1, pushes weight-0 neighbours at the front and weight-1 neighbours at the back.\n\nUse a priority queue (heapq) when the most important item should leave first rather than the oldest. That is not FIFO, and push and pop cost O(log n).\n\nFor threads, queue.Queue gives blocking put and get with an optional maximum size. For asyncio code, asyncio.Queue does the same for coroutines. Neither is needed for single-threaded algorithms, and both are slower than a deque.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which queue-like tool to use in Python",
        root: "Items wait their turn",
        children: [
          { label: "Oldest first (FIFO)", children: ["collections.deque", "append + popleft"] },
          { label: "Both ends needed", children: ["collections.deque", "Sliding windows, 0-1 BFS"] },
          { label: "Most important first", children: ["heapq", "O(log n) push and pop"] },
          { label: "Between threads", children: ["queue.Queue", "Blocking get and put"] },
          { label: "Fixed memory", children: ["Ring buffer", "Or deque(maxlen=k)"] },
        ],
      },
    ],
    examples: [
      {
        title: "A ring buffer queue with fixed capacity",
        explanation: "Goal: a queue that never allocates after creation. Step 1: create the array, head = 0 and count = 0. Step 2: enqueue computes the back slot with modulo and refuses when count equals capacity. Step 3: dequeue reads the head slot, clears it so the object can be freed, and advances head with modulo. Both operations are O(1), and keeping count makes full and empty easy to tell apart.",
        code: {
          lang: "python",
          code: "class RingQueue:\n    def __init__(self, capacity):\n        self.buf, self.head, self.count = [None] * capacity, 0, 0\n    def enqueue(self, x):                       # O(1)\n        if self.count == len(self.buf):\n            raise OverflowError(\"queue full\")\n        self.buf[(self.head + self.count) % len(self.buf)] = x\n        self.count += 1\n    def dequeue(self):                          # O(1)\n        if self.count == 0:\n            raise IndexError(\"queue empty\")\n        x, self.buf[self.head] = self.buf[self.head], None\n        self.head = (self.head + 1) % len(self.buf)\n        self.count -= 1\n        return x",
        },
      },
      {
        title: "Counting requests in the last 3 seconds",
        explanation: "A rate limiter needs to know how many requests arrived in the last 3000 ms. Step 1: append each new timestamp to the back of a deque. Step 2: pop from the front every timestamp older than t - 3000. Step 3: the deque's length is the answer. Each timestamp is appended once and removed at most once, so each call is amortised O(1).",
        code: {
          lang: "python",
          code: "from collections import deque\n\nclass RecentCounter:\n    def __init__(self):\n        self.q = deque()\n    def ping(self, t):\n        self.q.append(t)\n        while self.q[0] < t - 3000:\n            self.q.popleft()\n        return len(self.q)\n\nrc = RecentCounter()\nprint([rc.ping(t) for t in (1, 100, 3001, 3002)])  # [1, 2, 3, 3]",
        },
      },
    ],
    cheatSheet: [
      "Queue in Python: deque.append(x) to enqueue, deque.popleft() to dequeue, both O(1)",
      "list.pop(0) and list.insert(0, x) are O(n): never use them for queues",
      "Ring buffer back slot: (head + count) % capacity",
      "Ring buffer full vs empty: keep a count, or leave one slot unused",
      "deque(maxlen=k) keeps only the last k items",
      "deque indexing is O(1) at the ends but O(n) in the middle",
      "queue.Queue is for threads; heapq is for priority order, not FIFO",
    ],
    quiz: [
      {
        q: "A ring buffer has capacity 8, head = 6 and count = 3. Which index does the next enqueue write to?",
        options: ["9", "0", "1", "7"],
        answer: 2,
        why: "(6 + 3) % 8 = 1, because the items sit in slots 6, 7 and 0.",
      },
      {
        q: "What is the time complexity of BFS on a graph with V vertices if you use list.pop(0) as the queue?",
        options: ["Still O(V + E)", "O(log V) per step", "O(E log V)", "Up to O(V^2 + E), because each pop(0) costs O(V)"],
        answer: 3,
        why: "Each of the V dequeues can shift up to V items.",
      },
      {
        q: "What happens when you append to a full deque(maxlen=3)?",
        options: ["The item at the opposite end is dropped", "It raises an exception", "It grows to hold 4 items", "The new item is ignored"],
        answer: 0,
        why: "A bounded deque discards from the other end to make room.",
      },
      {
        q: "In a ring buffer that stores only head and tail indexes, why is head == tail ambiguous?",
        options: ["The modulo is wrong", "It can mean either empty or full", "It means the array must grow", "It only happens with capacity 1"],
        answer: 1,
        why: "After filling every slot, tail wraps around to equal head, just like when empty.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the last 5 lines of a text file without reading them all into a list.",
        hint: "A file object is an iterable of lines, and deque accepts a maxlen.",
        solution: "from collections import deque\n\ndef tail(path, n=5):\n    with open(path) as f:\n        return list(deque(f, maxlen=n))\n\nprint(''.join(tail('/etc/passwd')))",
      },
      {
        level: "medium",
        task: "Implement a queue using two stacks (Python lists) with amortised O(1) enqueue and dequeue.",
        hint: "Push into an inbox. When the outbox is empty, move everything from inbox to outbox, which reverses the order.",
        solution: "class TwoStackQueue:\n    def __init__(self):\n        self.inbox, self.outbox = [], []\n    def enqueue(self, x):\n        self.inbox.append(x)\n    def dequeue(self):                 # each item moves at most once\n        if not self.outbox:\n            while self.inbox:\n                self.outbox.append(self.inbox.pop())\n        return self.outbox.pop()",
      },
      {
        level: "hard",
        task: "Find the length of the longest contiguous subarray in which max minus min is at most limit, in O(n).",
        hint: "Keep a decreasing deque for the maximum and an increasing deque for the minimum; shrink from the left when the window breaks the rule.",
        solution: "from collections import deque\ndef longest(nums, limit):\n    mx, mn, left, best = deque(), deque(), 0, 0\n    for right, x in enumerate(nums):\n        while mx and mx[-1] < x: mx.pop()\n        while mn and mn[-1] > x: mn.pop()\n        mx.append(x); mn.append(x)\n        while mx[0] - mn[0] > limit:\n            if mx[0] == nums[left]: mx.popleft()\n            if mn[0] == nums[left]: mn.popleft()\n            left += 1\n        best = max(best, right - left + 1)\n    return best",
      },
    ],
    faq: [
      { q: "What is the difference between a queue and a deque?", a: "A queue adds at the back and removes from the front. A deque (double-ended queue) can add and remove at both ends, so it can act as a queue, a stack, or both." },
      { q: "Should I use queue.Queue for BFS?", a: "No. queue.Queue adds locks for thread safety, which makes it slower. Use collections.deque in single-threaded algorithms." },
      { q: "Is collections.deque a linked list?", a: "Partly. CPython builds it as a doubly linked list of blocks that each hold 64 items, which gives O(1) operations at both ends with good memory use." },
      { q: "What is a circular buffer used for in real systems?", a: "Anywhere a fixed amount of memory must hold a stream of data: audio and video buffers, network card packet rings, kernel logs (dmesg) and lock-free queues between threads." },
    ],
  },

  "dsa-linear-structures/monotonic-stack": {
    plain: [
      "Imagine people standing in a line, each a different height, all looking to the right. For each person you want to know who is the first taller person they can see. Checking every pair works, but for a long line that is very slow.",
      "A monotonic stack solves this in one pass. Monotonic means always going one way: the values in the stack are always decreasing (or always increasing) from bottom to top. When a new value arrives that would break that order, you pop values until the order is fine again, then push the new one.",
      "The useful part is what popping means. When a taller person arrives and you pop a shorter one, the taller person is exactly the answer for the one you popped: their first taller person to the right. Each value gets its answer at the moment it leaves the stack.",
      "Every element is pushed once and popped at most once, so the whole scan takes time proportional to the length of the array, even though the code has a loop inside a loop.",
    ],
    deepDive: [
      {
        heading: "Which stack order answers which question",
        body: "Four questions come up again and again: for each element, find the next greater, next smaller, previous greater or previous smaller element. They all use the same loop with a different comparison.\n\nTo find the next greater element, scan left to right and keep the stack decreasing: pop while the top is smaller than the current value, and each popped element's answer is the current value. For the next smaller element, keep the stack increasing and pop while the top is larger.\n\nPrevious answers come for free from the same scan. After popping, whatever is left on top is the nearest element to the left that survived. With a decreasing stack, that top is the previous greater (or equal) element; with an increasing stack it is the previous smaller (or equal) one. You can also scan from right to left to turn next into previous.\n\nStore indexes, not values. With an index you can read the value, compute a distance such as days to wait, or a width in a histogram.",
        bullets: ["Next greater: decreasing stack, pop while top < x", "Next smaller: increasing stack, pop while top > x", "Previous answer: the top after popping", "Store indexes for distances and widths"],
      },
      {
        heading: "Why the nested loop is still O(n)",
        body: "The inner while loop can pop many elements in one step, so a single iteration of the outer loop may cost O(n). It is tempting to multiply and say O(n^2). But count operations over the whole run instead of per step: each index is pushed exactly once, and an index can only be popped after it was pushed, so there are at most n pops in total. The whole algorithm does at most 2n stack operations plus n comparisons that end the inner loop, which is O(n).\n\nThis way of counting is called amortised analysis: an expensive step is paid for by earlier cheap steps. It is the same argument that makes dynamic array appends O(1) on average.\n\nThe extra space is O(n) in the worst case, for example a fully decreasing array when you look for the next greater element: nothing is ever popped until the end.",
      },
      {
        heading: "Largest rectangle in a histogram",
        body: "Given bar heights, find the largest rectangle that fits under them. For each bar, the widest rectangle of exactly its height reaches left to just after the previous smaller bar and right to just before the next smaller bar. An increasing stack finds both in one pass.\n\nScan left to right with a 0 added at the end. While the current bar is lower than or equal to the bar on top of the stack, pop it: the current index is its right boundary, and the new top of the stack, or -1 if the stack is empty, is its left boundary. Its width is i - left - 1 and its area is height times width. The added 0 forces every remaining bar off the stack at the end.\n\nThe result is O(n) time and O(n) space, compared with O(n^2) for checking every pair of boundaries. The same routine, run row by row on a 0/1 matrix where each row's heights count consecutive 1s above, solves maximal rectangle in O(rows times columns).",
        visual: {
          type: "flow",
          title: "Histogram 2 1 5 6 2 3: the key pops",
          steps: [
            { label: "i=1, height 1", detail: "Pop 2: width 1, area 2" },
            { label: "Push 5 and 6", detail: "Stack heights: 1 5 6" },
            { label: "i=4, height 2", detail: "Pop 6: width 1, area 6" },
            { label: "Still at i=4", detail: "Pop 5: width 2, area 10" },
            { label: "Sentinel 0 at i=6", detail: "Pop 3, 2, 1: areas 3, 8, 6" },
            { label: "Answer", detail: "Largest area is 10" },
          ],
        },
      },
      {
        heading: "Equal values and circular arrays",
        body: "Duplicates are where monotonic stack solutions break. Decide for each problem whether equal values should pop (use <= or >=) or stay (use < or >). For next greater, popping only on strictly smaller values means an equal later value is not counted as greater, which is usually what you want.\n\nWhen you count something over all subarrays, such as the sum of subarray minimums, an equal minimum can be counted twice. The standard fix is asymmetric: use strictly smaller on one side and smaller or equal on the other, so each subarray is assigned to exactly one of its tied minimums.\n\nFor a circular array, where the search may wrap past the end, loop i from 0 to 2n - 1 and read nums[i % n]. Push indexes only in the first pass so each still enters the stack once. That keeps the scan O(n).",
        bullets: ["Decide strict vs non-strict comparison up front", "Counting problems: strict on one side, non-strict on the other", "Circular: iterate 2n times with i % n"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Brute force vs monotonic stack for next greater",
        columns: [
          { title: "Brute force", points: ["For each i, scan right until a bigger value", "O(n^2) time in the worst case", "O(1) extra space", "Simple but too slow for 10^5 items"] },
          { title: "Monotonic stack", points: ["One left-to-right pass", "Each index pushed and popped once", "O(n) time", "O(n) extra space"] },
        ],
      },
    ],
    examples: [
      {
        title: "Next greater element in a circular array",
        explanation: "Input: 1 2 1. For the last 1, the search wraps around and finds 2, so the answer is 2 -1 2. Step 1: loop i over 2n positions and use nums[i % n]. Step 2: pop every index whose value is smaller than the current value and set its answer. Step 3: push indexes only during the first pass. Indexes still on the stack at the end, here only the 2, have no greater element. O(n) time, O(n) space.",
        code: {
          lang: "python",
          code: "def next_greater_circular(nums):\n    n = len(nums)\n    ans, stack = [-1] * n, []        # indexes, values decreasing\n    for i in range(2 * n):\n        x = nums[i % n]\n        while stack and nums[stack[-1]] < x:\n            ans[stack.pop()] = x\n        if i < n:\n            stack.append(i)\n    return ans\n\nprint(next_greater_circular([1, 2, 1]))   # [2, -1, 2]",
        },
      },
      {
        title: "Largest rectangle in a histogram",
        explanation: "Heights 2 1 5 6 2 3. Step 1: append a 0 so all bars get popped at the end. Step 2: keep indexes with increasing heights. Step 3: when a bar is lower than or equal to the top, pop the top; its right edge is i and its left edge is the new top. Step 4: track the best area. The bars of height 5 and 6 give the answer 5 times 2 = 10.",
        code: {
          lang: "python",
          code: "def largest_rectangle(h):         # O(n) time, O(n) space\n    stack, best = [], 0               # indexes, heights increasing\n    for i, x in enumerate(h + [0]):   # the 0 flushes the stack\n        while stack and h[stack[-1]] >= x:\n            height = h[stack.pop()]\n            left = stack[-1] if stack else -1\n            best = max(best, height * (i - left - 1))\n        stack.append(i)\n    return best\n\nprint(largest_rectangle([2, 1, 5, 6, 2, 3]))  # 10",
        },
      },
    ],
    cheatSheet: [
      "Each index is pushed once and popped at most once: O(n) time, O(n) space",
      "Next greater: keep values decreasing, pop while nums[top] < x",
      "Next smaller: keep values increasing, pop while nums[top] > x",
      "After popping, the top is the nearest surviving element to the left",
      "Histogram: width = i - stack[-1] - 1, or i if the stack is empty",
      "Circular arrays: loop 2n times with i % n, push only when i < n",
      "Subarray counting with ties: strict on one side, non-strict on the other",
    ],
    quiz: [
      {
        q: "Which stack order finds the next smaller element for every index?",
        options: ["Decreasing", "Unsorted", "Increasing", "Either order works"],
        answer: 2,
        why: "A larger top is popped when a smaller value arrives, and that value is its next smaller.",
      },
      {
        q: "For nums = 2 1 2 4 3, what are the next greater elements (-1 if none)?",
        options: ["4 2 4 -1 -1", "4 2 4 -1 3", "1 2 4 3 -1", "-1 2 4 -1 -1"],
        answer: 0,
        why: "2 sees 4 first, 1 sees 2, the second 2 sees 4, and nothing is greater after 4 or 3.",
      },
      {
        q: "Why is a monotonic stack scan O(n) even though it has a nested while loop?",
        options: ["The while loop runs at most once per step", "Python optimises the inner loop", "The input must be sorted", "Total pops over the whole run can never exceed n"],
        answer: 3,
        why: "Amortised over the run, there are at most n pushes and n pops.",
      },
      {
        q: "In the histogram algorithm, why add a 0 at the end of the heights?",
        options: ["To avoid an index error", "To force every remaining bar to be popped and measured", "To make the stack decreasing", "To handle negative heights"],
        answer: 1,
        why: "A height of 0 is lower than every bar, so all bars still on the stack get their area computed.",
      },
      {
        q: "What is the largest rectangle in the histogram 2 4?",
        options: ["4", "2", "6", "8"],
        answer: 0,
        why: "Height 2 across both bars gives 4, and the bar of height 4 alone also gives 4.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Return the next greater element for every position, or -1 if there is none.",
        hint: "Decreasing stack of indexes; answer each index as it is popped.",
        solution: "def next_greater(nums):\n    ans, stack = [-1] * len(nums), []\n    for i, x in enumerate(nums):\n        while stack and nums[stack[-1]] < x:\n            ans[stack.pop()] = x\n        stack.append(i)\n    return ans\n\nprint(next_greater([2, 1, 2, 4, 3]))   # [4, 2, 4, -1, -1]",
      },
      {
        level: "medium",
        task: "Stock span: for each day, count how many consecutive days up to and including today had a price less than or equal to today's.",
        hint: "This is the distance to the previous strictly greater price.",
        solution: "def stock_span(prices):\n    ans, stack = [], []              # indexes, prices decreasing\n    for i, p in enumerate(prices):\n        while stack and prices[stack[-1]] <= p:\n            stack.pop()\n        ans.append(i - stack[-1] if stack else i + 1)\n        stack.append(i)\n    return ans\n\nprint(stock_span([100, 80, 60, 70, 60, 75, 85]))  # [1, 1, 1, 2, 1, 4, 6]",
      },
      {
        level: "hard",
        task: "Return the sum of min(sub) over every contiguous subarray, modulo 10^9 + 7, in O(n). For 3 1 2 4 the answer is 17.",
        hint: "Each a[i] is the minimum of left[i] * right[i] subarrays. Use strict on one side and non-strict on the other for ties.",
        solution: "def sum_subarray_mins(a, MOD=10**9 + 7):\n    n = len(a); left, right, stack = [0] * n, [0] * n, []\n    for i in range(n):                    # previous strictly smaller\n        while stack and a[stack[-1]] >= a[i]: stack.pop()\n        left[i] = i - stack[-1] if stack else i + 1\n        stack.append(i)\n    stack = []\n    for i in range(n - 1, -1, -1):        # next smaller or equal\n        while stack and a[stack[-1]] > a[i]: stack.pop()\n        right[i] = stack[-1] - i if stack else n - i\n        stack.append(i)\n    return sum(a[i] * left[i] * right[i] for i in range(n)) % MOD",
      },
    ],
    faq: [
      { q: "How do I recognise a monotonic stack problem?", a: "Look for phrases like next greater, previous smaller, how many days until, or the nearest bigger value, especially when the brute force is O(n^2). Histogram, rain water and stock span problems are classic cases." },
      { q: "What is the difference between a monotonic stack and a monotonic deque?", a: "A monotonic stack only works at one end and answers nearest greater or smaller questions. A monotonic deque also removes from the front, which lets it track the maximum or minimum of a sliding window." },
      { q: "Should the stack hold values or indexes?", a: "Usually indexes. You can always read the value from the array, and indexes let you compute distances and widths." },
    ],
  },
};

export default extra;
