import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-graphs/graph-representations": {
    plain: [
      "A graph is a way to draw relationships. The things are called vertices (or nodes), and the links between them are called edges. Cities and roads, people and friendships, web pages and links: all of these are graphs. Once a problem is a graph, a small set of well-known algorithms can solve it.",
      "Edges come in a few flavours. An undirected edge works both ways, like a friendship. A directed edge points one way, like following someone on social media. A weighted edge carries a number, such as a distance, a price or a time.",
      "A computer cannot see a drawing, so we must store the graph in memory. The most common way is an adjacency list: for every vertex, keep a list of its neighbours. Another way is an adjacency matrix: a big table where cell [u][v] says whether u links to v. A third way is a plain list of edges.",
      "The choice matters because every later algorithm reads the graph again and again. Pick a storage that wastes memory or makes neighbour lookups slow, and even a good algorithm becomes slow. For most real problems the adjacency list is the right default.",
    ],
    deepDive: [
      {
        heading: "The vocabulary you need",
        body: "The degree of a vertex is the number of edges touching it. In a directed graph we split this into out-degree (edges leaving) and in-degree (edges arriving). A path is a sequence of vertices where each step follows an edge; a simple path never repeats a vertex. A cycle is a path that returns to its start.\n\nTwo counting facts are worth remembering. In an undirected graph, the degrees add up to exactly 2E, because every edge touches two ends. This is called the handshake lemma. And a simple graph (no self-loops, no repeated edges) with V vertices has at most V(V-1)/2 undirected edges, or V(V-1) directed ones. That maximum is why a dense graph has E close to V^2, and a sparse graph has E closer to V.",
        bullets: [
          "Sum of all degrees = 2E in an undirected graph",
          "Sum of out-degrees = sum of in-degrees = E in a directed graph",
          "A tree with V vertices has exactly V - 1 edges",
          "Connected means every vertex can reach every other one",
        ],
      },
      {
        heading: "Adjacency lists in Python: three common shapes",
        body: "If vertices are numbered 0 to n-1, a list of lists is the fastest and simplest: adj = [[] for _ in range(n)]. Every vertex has a slot, even one with no edges. If vertices are names like \"DEL\" or \"alice\", use a dict that maps each name to a list. For weighted graphs, store (neighbour, weight) tuples in the list.\n\nWhen you often ask \"is there an edge from u to v?\", store neighbours in a set instead of a list. The check becomes O(1) on average instead of O(degree), at the cost of extra memory and no fixed order.\n\nA common bug with collections.defaultdict: just reading adj[x] creates an empty entry for x. That is handy while building, but it can silently add vertices while you search. Also remember that vertices with no edges never appear in a dict built only from an edge list.",
        visual: {
          type: "compare",
          title: "Which adjacency list shape to use",
          columns: [
            { title: "List of lists", points: ["Vertices are 0..n-1", "Fastest access by index", "Isolated vertices still have a slot", "Edge check O(degree)"] },
            { title: "Dict of lists", points: ["Vertices have names", "Only stores vertices you add", "Keeps neighbour order", "Edge check O(degree)"] },
            { title: "Dict of sets", points: ["Many edge-exists checks", "Edge check O(1) on average", "Drops duplicate edges", "No stable neighbour order"] },
          ],
        },
      },
      {
        heading: "Matrix versus list with real numbers",
        body: "Picture a road network with 1,000,000 junctions and 2,500,000 roads. An adjacency matrix needs V^2 = 10^12 cells. Even at one bit per cell that is about 125 GB, so it simply does not fit. An adjacency list stores one entry per vertex plus two per undirected edge, about 6 million entries in total. That fits easily.\n\nNow picture 300 cities where almost every pair has a direct flight. Here E is close to V^2 anyway, so the matrix costs about the same memory as a list, and it answers \"is there a flight from A to B?\" in O(1). Algorithms that touch every pair, like Floyd-Warshall for all-pairs shortest paths in O(V^3), are also natural on a matrix.\n\nThe cost that hurts most with a matrix is listing neighbours: you must scan a whole row, O(V), even if the vertex has only two neighbours. So BFS or DFS on a matrix costs O(V^2), not O(V + E).",
        bullets: [
          "Matrix: O(V^2) memory, BFS or DFS in O(V^2)",
          "List: O(V + E) memory, BFS or DFS in O(V + E)",
          "Rule of thumb: use a matrix only when V is a few thousand or less and the graph is dense",
        ],
      },
      {
        heading: "Grids are graphs you never build",
        body: "A maze or a game map stored as rows of characters is already a graph. Each cell (r, c) is a vertex. Its neighbours are the cells up, down, left and right that are inside the grid and not walls. This is called an implicit graph: you compute neighbours on the fly instead of storing an adjacency list.\n\nA grid with R rows and C columns has V = R x C vertices. With 4-direction moves, the number of undirected edges is R(C-1) + C(R-1), a bit less than 2RC. So BFS or DFS on a grid costs O(R x C). If you need a single number per cell, for example to use a list as a visited array, map (r, c) to r x C + c and back with divmod(i, C).\n\nSome problems allow diagonal moves too. Then each cell has up to 8 neighbours. Always read the problem carefully: 4 or 8 directions changes both the answer and the edge count.",
        visual: {
          type: "flow",
          title: "Getting the neighbours of one grid cell",
          steps: [
            { label: "Start at (r, c)", detail: "The current vertex" },
            { label: "Try each direction", detail: "(1,0), (-1,0), (0,1), (0,-1)" },
            { label: "Bounds check", detail: "0 <= nr < R and 0 <= nc < C" },
            { label: "Wall check", detail: "Skip blocked cells like '#'" },
            { label: "Yield neighbour", detail: "The algorithm treats it as an edge" },
          ],
        },
      },
      {
        heading: "Turning problem input into a graph",
        body: "Most problems hand you the graph as n plus an edge list, like edges = [[0, 1], [1, 2]]. Your first job is almost always the same three lines: create n empty lists, loop over the edges, and append. For an undirected graph append both ways; for a directed graph only u to v.\n\nCheck three details before you code. Are vertices numbered from 0 or from 1? If from 1, make n + 1 slots or subtract 1. Does [a, b] mean a points to b, or the reverse? Course schedule problems often list [course, prerequisite], so the edge goes from the prerequisite to the course. And can there be duplicate edges or self-loops? They rarely break traversal, but they change degree counts.\n\nSome algorithms need the reverse graph, where every edge is flipped. Build it in the same loop: radj[v].append(u). It costs another O(V + E) memory and is used, for example, by Kosaraju's algorithm for strongly connected components.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Kinds of graphs you will meet",
        root: "Graph",
        children: [
          { label: "By direction", children: ["Undirected: friendships", "Directed: links, follows"] },
          { label: "By edge cost", children: ["Unweighted: every edge costs 1", "Weighted: distance, price, time"] },
          { label: "By cycles", children: ["Tree: connected, no cycles, V - 1 edges", "DAG: directed, no cycles"] },
          { label: "By density", children: ["Sparse: E close to V", "Dense: E close to V^2"] },
          { label: "By storage", children: ["Explicit: you build adj", "Implicit: grids, puzzle states"] },
        ],
      },
    ],
    examples: [
      {
        title: "A directed, weighted flight network",
        explanation: "You get a list of flights as (from, to, hours). Step 1: since a flight from DEL to BOM does not mean one from BOM to DEL, store each edge only one way. Step 2: keep the hours with the neighbour as a tuple. Step 3: count in-degrees while building, because a city with in-degree 0 cannot be reached by any flight. The out-degrees add up to 4 and so do the in-degrees, matching E = 4.",
        code: {
          lang: "python",
          code: `from collections import defaultdict

flights = [("DEL", "BOM", 2), ("BOM", "BLR", 1.5),
           ("DEL", "BLR", 2.75), ("BLR", "DEL", 2.75)]
adj = defaultdict(list)
indeg = defaultdict(int)
for u, v, hours in flights:
    adj[u].append((v, hours))   # directed: one way only
    indeg[v] += 1

for city in sorted(set(adj) | set(indeg)):
    print(city, "out:", len(adj[city]), "in:", indeg[city])
# BLR out: 1 in: 2 / BOM out: 1 in: 1 / DEL out: 2 in: 1`,
        },
      },
      {
        title: "Counting the edges of a grid without building it",
        explanation: "A 3 x 4 grid has 12 cells. Step 1: write a neighbours generator that checks the bounds. Step 2: add up every cell's degree. Step 3: divide by 2 (the handshake lemma), because each undirected edge was counted from both ends. The result, 17, matches the formula R(C-1) + C(R-1) = 3 x 3 + 4 x 2.",
        code: {
          lang: "python",
          code: `def neighbours(r, c, rows, cols):
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            yield nr, nc

rows, cols = 3, 4
degree_sum = sum(len(list(neighbours(r, c, rows, cols)))
                 for r in range(rows) for c in range(cols))
print(degree_sum // 2)   # 17`,
        },
      },
    ],
    cheatSheet: [
      "adj = [[] for _ in range(n)]; never [[]] * n, which shares one list",
      "Undirected edge: adj[u].append(v) and adj[v].append(u)",
      "Weighted edge: adj[u].append((v, w))",
      "Sum of degrees = 2E (undirected); a tree has V - 1 edges",
      "Max edges in a simple graph: V(V-1)/2 undirected, V(V-1) directed",
      "Grid cell (r, c) <-> index r * C + c; back with divmod(i, C)",
      "Adjacency list traversal O(V + E); matrix traversal O(V^2)",
      "Use a dict of sets when you need fast edge-exists checks",
    ],
    quiz: [
      {
        q: "An undirected graph has 12 edges. What is the sum of all vertex degrees?",
        options: ["12", "24", "6", "144"],
        answer: 1,
        why: "Every edge adds 1 to the degree of each of its two ends, so the total is 2E.",
      },
      {
        q: "What is the maximum number of edges in a simple undirected graph with 10 vertices?",
        options: ["45", "90", "100", "10"],
        answer: 0,
        why: "V(V-1)/2 = 10 x 9 / 2 = 45, since each pair can have at most one edge.",
      },
      {
        q: "Why is adj = [[]] * n a bug?",
        options: ["It creates n + 1 lists", "Lists cannot be nested in Python", "All n slots point to the same list, so one append shows up everywhere", "It makes the graph directed"],
        answer: 2,
        why: "Multiplying a list copies the reference, so every slot shares one inner list.",
      },
      {
        q: "You run BFS on a graph stored as an adjacency matrix. What is the running time?",
        options: ["O(V + E)", "O(E log V)", "O(E)", "O(V^2)"],
        answer: 3,
        why: "Finding the neighbours of each vertex means scanning a full row of V cells.",
      },
      {
        q: "A grid has 50 rows and 40 columns with 4-direction moves. How many vertices does its graph have?",
        options: ["90", "2,000", "4,000", "8,000"],
        answer: 1,
        why: "Every cell is one vertex, so V = 50 x 40 = 2,000.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given n = 5 and undirected edges [[0, 1], [1, 2], [2, 0], [3, 2]], build a list-of-lists adjacency list and print the degree of every vertex, including vertex 4.",
        hint: "Make n slots up front so isolated vertices still appear.",
        solution: `n, edges = 5, [[0, 1], [1, 2], [2, 0], [3, 2]]
adj = [[] for _ in range(n)]
for u, v in edges:
    adj[u].append(v)
    adj[v].append(u)
print([len(nbrs) for nbrs in adj])   # [2, 2, 3, 1, 0]`,
      },
      {
        level: "medium",
        task: "Write two functions: matrix_to_list(m) that turns a 0/1 adjacency matrix into an adjacency list, and reverse_graph(adj) that flips every edge of a directed graph.",
        hint: "A row index is the source vertex; in the reverse graph, v gets u as a neighbour.",
        solution: `def matrix_to_list(m):
    return [[v for v, bit in enumerate(row) if bit] for row in m]

def reverse_graph(adj):
    radj = [[] for _ in adj]
    for u, nbrs in enumerate(adj):
        for v in nbrs:
            radj[v].append(u)
    return radj`,
      },
      {
        level: "hard",
        task: "A grid uses '.' for open cells and '#' for walls. Build an explicit adjacency list over open cells only, using index r * cols + c, and return the number of undirected edges.",
        hint: "Only look right and down from each cell, so every edge is found exactly once.",
        solution: `def grid_graph(grid):
    rows, cols = len(grid), len(grid[0])
    adj, edges = {}, 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '.':
                adj.setdefault(r * cols + c, [])
                for nr, nc in ((r + 1, c), (r, c + 1)):
                    if nr < rows and nc < cols and grid[nr][nc] == '.':
                        a, b = r * cols + c, nr * cols + nc
                        adj[a].append(b); adj.setdefault(b, []).append(a); edges += 1
    return adj, edges`,
      },
    ],
    faq: [
      { q: "Should I use an adjacency list or an adjacency matrix?", a: "Use an adjacency list by default, because most real graphs are sparse and it costs O(V + E) memory. Use a matrix only for small, dense graphs or when you need O(1) edge checks." },
      { q: "Is a tree a graph?", a: "Yes. A tree is a connected undirected graph with no cycles, and it always has exactly V - 1 edges." },
      { q: "Do I need a graph library like NetworkX for interviews?", a: "No. Interviews expect you to build the adjacency list yourself with lists or dicts. NetworkX is great for analysis work, but it is much slower than plain lists for tight loops." },
      { q: "What is the difference between sparse and dense graphs?", a: "A sparse graph has E on the order of V, like road maps. A dense graph has E close to V^2, where most pairs of vertices are connected." },
    ],
  },

  "dsa-graphs/bfs": {
    plain: [
      "Breadth-first search, or BFS, explores a graph one layer at a time. First it visits the start. Then every vertex one edge away. Then every vertex two edges away, and so on. It never goes deeper until the current layer is finished.",
      "To do this, BFS uses a queue: a line where the first one in is the first one out. You put the start in the queue. Then you repeat: take the vertex at the front, look at its neighbours, and put every new one at the back of the line.",
      "Because the layers come out in order, the first time BFS reaches a vertex is through the fewest possible edges. That makes BFS the tool for shortest paths when every edge costs the same, such as moves in a maze or steps between friends.",
      "BFS also needs a visited set, a memory of who has already been found. Without it, BFS would walk in circles forever on any graph with a cycle.",
    ],
    deepDive: [
      {
        heading: "Why the queue keeps distances in order",
        body: "At any moment, the queue holds vertices from at most two neighbouring layers: some at distance d at the front and some at distance d + 1 at the back. When you pop a vertex at distance d, every new neighbour you push gets distance d + 1, so the order is never broken. This is the invariant (a rule that is always true) behind BFS.\n\nSo when BFS first discovers a vertex v, no shorter route can exist. A shorter route would pass through a vertex at a smaller distance, and all of those were processed earlier and would have found v first. That is why dist[v] is final the moment you set it, and why you can stop as soon as you discover the goal.\n\nThe proof needs every edge to cost the same. With different weights, a route with more edges can be cheaper, and plain BFS gives wrong answers. Then you need Dijkstra's algorithm, or 0-1 BFS if weights are only 0 and 1.",
        visual: {
          type: "layers",
          title: "BFS layers from start S",
          layers: [
            { label: "Layer 0", detail: "S itself, distance 0" },
            { label: "Layer 1", detail: "Direct neighbours of S" },
            { label: "Layer 2", detail: "New neighbours of layer 1" },
            { label: "Layer 3", detail: "New neighbours of layer 2" },
            { label: "Done", detail: "Queue empty: all reachable vertices found" },
          ],
        },
      },
      {
        heading: "Where O(V + E) comes from",
        body: "Each vertex is pushed into the queue at most once, because you mark it visited at the moment you push it. So there are at most V pushes and V pops. Each popped vertex scans its own adjacency list once. Over the whole run, that scans every directed edge once, or every undirected edge twice (once from each end). Total: O(V + E) time and O(V) extra space for the queue and visited set.\n\nTwo Python details keep this bound real. Use collections.deque: its popleft() is O(1), while list.pop(0) shifts every element and is O(n), turning BFS into O(V^2). And mark visited on push, not on pop. If you mark on pop, one vertex can be pushed by many neighbours before it is popped, so the queue can grow to O(E) and you do repeated work.",
        bullets: [
          "deque.popleft() is O(1); list.pop(0) is O(n)",
          "Mark visited when pushing, not when popping",
          "On a grid, V = R x C and the run is O(R x C)",
        ],
      },
      {
        heading: "Rebuilding the actual path",
        body: "A distance tells you how far, but often you need the route itself. Keep a parent map: when you discover v from u, store parent[v] = u. The start gets parent None. When BFS reaches the goal, walk backwards from the goal through the parents until you reach None, then reverse the list.\n\nThe walk back costs O(length of path), which is at most V. Every vertex has exactly one parent, so the parent links form a tree rooted at the start, called the BFS tree. Every path in that tree is a shortest path from the start.\n\nIf many shortest paths exist, BFS returns just one of them, chosen by the order in which you scan neighbours. To count all shortest paths, keep ways[v] and add ways[u] to it for every u at distance dist[v] - 1 that has an edge to v.",
        visual: {
          type: "flow",
          title: "Walking the parent links back",
          steps: [
            { label: "Goal G found", detail: "BFS stored parent[G] = C" },
            { label: "Step to C", detail: "parent[C] = A" },
            { label: "Step to A", detail: "parent[A] = S" },
            { label: "Reach S", detail: "parent[S] is None, stop" },
            { label: "Reverse", detail: "S, A, C, G is the shortest path" },
          ],
        },
      },
      {
        heading: "Multi-source BFS",
        body: "Some questions ask for the distance from each cell to the nearest of many sources: the nearest exit, the nearest hospital, or how many minutes until every orange rots. Running one BFS per source costs O(k x (V + E)) for k sources. Instead, put all sources into the queue at distance 0 before you start, then run BFS normally. It costs a single O(V + E).\n\nWhy it works: imagine a fake super-source connected to every real source with edges of length 0. BFS from that super-source is exactly the same as starting with all sources at distance 0. Each vertex is reached first by whichever source is closest.\n\nIf you also need to know which source is closest, store it in a second array and copy it from parent to child as you discover vertices.",
      },
      {
        heading: "Level-by-level loops and useful variants",
        body: "Many problems want the number of layers, such as minutes, moves or word changes. Instead of a dist map, process one layer at a time: read size = len(q), pop exactly that many vertices, and count one step after each layer. Because Python evaluates range(len(q)) once, new vertices pushed during the loop wait for the next layer.\n\nBidirectional BFS runs two searches, one from the start and one from the goal, and stops when they meet. If each vertex has about b neighbours and the answer is d steps away, this explores roughly 2 x b^(d/2) vertices instead of b^d. That is a large win for puzzles like word ladders.\n\n0-1 BFS handles graphs where edges cost 0 or 1. Use a deque: push to the front for a 0 edge and to the back for a 1 edge. It still runs in O(V + E), faster than Dijkstra's O((V + E) log V).",
        bullets: [
          "for _ in range(len(q)) processes exactly one layer",
          "Bidirectional BFS: about 2 x b^(d/2) instead of b^d vertices",
          "0-1 BFS: appendleft for weight 0, append for weight 1",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which shortest-path tool fits the edge weights",
        columns: [
          { title: "Plain BFS", points: ["All edges cost the same", "Queue (deque)", "O(V + E)", "Mazes, friend hops, word ladders"] },
          { title: "0-1 BFS", points: ["Edge costs are 0 or 1", "Deque, push 0-edges to the front", "O(V + E)", "Free moves plus paid moves"] },
          { title: "Dijkstra", points: ["Any non-negative weights", "Min-heap (heapq)", "O((V + E) log V)", "Road maps, network latency"] },
        ],
      },
    ],
    examples: [
      {
        title: "Shortest route through a maze, with the path",
        explanation: "The maze is a list of strings where '#' is a wall. Step 1: start BFS at the entrance with parent[start] = None; the parent dict also works as the visited set. Step 2: for each popped cell, try the 4 directions and skip walls, cells outside the grid and cells already in parent. Step 3: when the goal is popped, follow the parents back and reverse. If the queue empties first, there is no route and the function returns None.",
        code: {
          lang: "python",
          code: `from collections import deque

def maze_path(grid, start, goal):
    rows, cols = len(grid), len(grid[0])
    parent, q = {start: None}, deque([start])
    while q:
        cur = q.popleft()
        if cur == goal:
            out = []
            while cur is not None: out.append(cur); cur = parent[cur]
            return out[::-1]
        r, c = cur
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] != '#' and (nr, nc) not in parent:
                parent[(nr, nc)] = cur; q.append((nr, nc))
    return None`,
        },
      },
      {
        title: "Minutes until every orange rots (multi-source BFS)",
        explanation: "In the grid, 2 is a rotten orange, 1 is fresh and 0 is empty. Each minute, rot spreads to fresh neighbours in 4 directions. Step 1: put every rotten orange in the queue at once and count the fresh ones. Step 2: process one layer per minute with for _ in range(len(q)). Step 3: stop when nothing is fresh. If fresh oranges remain when the queue is empty, some are unreachable, so return -1. Each cell enters the queue at most once, so the run is O(rows x cols).",
        code: {
          lang: "python",
          code: `from collections import deque

def minutes_to_rot(grid):
    rows, cols = len(grid), len(grid[0])
    q = deque((r, c) for r in range(rows) for c in range(cols) if grid[r][c] == 2)
    fresh = sum(row.count(1) for row in grid)
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2; fresh -= 1; q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`,
        },
      },
    ],
    cheatSheet: [
      "from collections import deque; q = deque([start]); u = q.popleft()",
      "Mark visited (or set dist) when you push, never when you pop",
      "BFS is O(V + E) time and O(V) space; on a grid O(rows x cols)",
      "Store parent[v] = u, then walk back from the goal and reverse",
      "Multi-source BFS: push every source at distance 0 before the loop",
      "Layer loop: for _ in range(len(q)) handles one distance level",
      "BFS is only correct for shortest paths when all edges cost the same",
    ],
    quiz: [
      {
        q: "Why should you use collections.deque instead of a list for the BFS queue?",
        options: ["deque keeps items sorted", "list cannot hold tuples", "deque.popleft() is O(1) while list.pop(0) is O(n)", "deque uses less memory per item"],
        answer: 2,
        why: "Removing from the front of a list shifts every element, which can turn BFS into O(V^2).",
      },
      {
        q: "A graph has weighted edges with costs 1, 5 and 10. Can plain BFS find the cheapest path?",
        options: ["No, it minimises the number of edges, not their total cost", "Yes, if you mark visited on push", "Yes, if you use a deque", "Only if the graph is undirected"],
        answer: 0,
        why: "BFS treats every edge as cost 1, so a route with fewer but heavier edges can win wrongly.",
      },
      {
        q: "You need the distance from every cell to its nearest exit, and there are 50 exits. What is the best approach?",
        options: ["Run BFS 50 times and take the minimum", "Run DFS from every cell", "Use Dijkstra with a heap", "Run one BFS with all 50 exits in the queue at distance 0"],
        answer: 3,
        why: "Multi-source BFS solves it in a single O(V + E) pass.",
      },
      {
        q: "What happens if you mark vertices visited when you pop them instead of when you push them?",
        options: ["BFS becomes DFS", "The same vertex can be pushed many times, wasting time and memory", "Distances become negative", "Nothing changes"],
        answer: 1,
        why: "Several neighbours can each push the same unvisited vertex before it is popped.",
      },
      {
        q: "In bidirectional BFS with branching factor b and answer distance d, roughly how many vertices are explored?",
        options: ["b x d", "b^d", "2 x b^(d/2)", "d^2"],
        answer: 2,
        why: "Each side only needs to go about half the distance before the two searches meet.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write bfs_order(adj, start) that returns the vertices in the order BFS visits them, for an adjacency list with vertices 0..n-1.",
        hint: "Use a deque and a visited list; append to the result when you pop.",
        solution: `from collections import deque

def bfs_order(adj, start):
    seen = [False] * len(adj); seen[start] = True
    q, order = deque([start]), []
    while q:
        u = q.popleft(); order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v] = True; q.append(v)
    return order`,
      },
      {
        level: "medium",
        task: "Given a grid of 0s and 1s, return a grid where each cell holds its distance to the nearest 0 (4-direction moves).",
        hint: "Start a multi-source BFS from every 0 at once; use -1 as unvisited.",
        solution: `from collections import deque

def nearest_zero(grid):
    R, C = len(grid), len(grid[0])
    dist = [[0 if grid[r][c] == 0 else -1 for c in range(C)] for r in range(R)]
    q = deque((r, c) for r in range(R) for c in range(C) if grid[r][c] == 0)
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1; q.append((nr, nc))
    return dist`,
      },
      {
        level: "hard",
        task: "Word ladder: given begin, end and a word list, return the number of words in the shortest chain where each step changes one letter and every word is in the list. Return 0 if impossible.",
        hint: "Each word is a vertex. Generate neighbours by trying all 26 letters at each position and checking a set.",
        solution: `from collections import deque
from string import ascii_lowercase

def ladder_length(begin, end, words):
    words = set(words)
    q, seen = deque([(begin, 1)]), {begin}
    while q:
        w, steps = q.popleft()
        if w == end: return steps
        for i in range(len(w)):
            for ch in ascii_lowercase:
                nxt = w[:i] + ch + w[i + 1:]
                if nxt in words and nxt not in seen: seen.add(nxt); q.append((nxt, steps + 1))
    return 0`,
      },
    ],
    faq: [
      { q: "Does BFS find the shortest path in a weighted graph?", a: "No. BFS minimises the number of edges. For non-negative weights use Dijkstra's algorithm, and for weights of only 0 and 1 use 0-1 BFS." },
      { q: "When should I use BFS instead of DFS?", a: "Use BFS when you need the fewest steps or want to explore by distance. Use DFS for reachability, components, cycle detection and topological sort, where the order of exploration matters less." },
      { q: "How much memory does BFS use?", a: "O(V) for the queue and visited set. On wide graphs the queue can hold a whole layer at once, which may be most of the graph." },
      { q: "Can BFS work on an infinite or very large graph?", a: "Yes, if you generate neighbours on the fly and stop at the goal. The work depends on how many vertices are within the goal's distance, which is why bidirectional BFS helps so much." },
    ],
  },

  "dsa-graphs/dfs": {
    plain: [
      "Depth-first search, or DFS, explores a graph like a person in a cave with a ball of string. It takes one tunnel and keeps going until it hits a dead end. Then it walks back to the last junction and tries the next tunnel.",
      "DFS needs a memory of where it has been, the visited set, so it never enters the same room twice. It also needs a way to go back. The simplest way is recursion: the function calls itself for each new neighbour, and returning from the call means walking back.",
      "DFS does not find shortest paths. Its strength is answering structure questions: Which vertices can I reach? How many separate groups are there? Is there a loop? It is also the engine behind flood fill in paint programs and island counting in grids.",
      "Like BFS, DFS looks at each vertex and each edge once, so it runs in O(V + E) time.",
    ],
    deepDive: [
      {
        heading: "Recursive or iterative: the Python stack limit",
        body: "Recursive DFS is short and clear, but every call uses a stack frame. CPython limits recursion depth to 1,000 by default, so a path of 5,000 vertices, or a 100 x 100 grid shaped like a snake, raises RecursionError. You can call sys.setrecursionlimit with a bigger number, but very deep recursion can still crash the interpreter, because the real C stack runs out.\n\nThe safe choice for large inputs is an explicit stack, a Python list used with append() and pop(). For reachability and counting components, a simple version works: pop a vertex, then push each unvisited neighbour and mark it. The visiting order differs slightly from recursive DFS, but every reachable vertex is found exactly once.\n\nWhen you need the exact recursive order, such as finish times for topological sort, push (vertex, iterator over neighbours) pairs instead. Each step advances the top iterator, and a vertex is finished when its iterator runs out.",
        bullets: [
          "Default recursion limit: sys.getrecursionlimit() returns 1000",
          "A 1000 x 1000 grid can need up to 1,000,000 levels",
          "Simple stack DFS is enough for reachability and components",
        ],
      },
      {
        heading: "Connected components",
        body: "A connected component is a group of vertices that can all reach each other, and cannot reach anything outside the group. To count components in an undirected graph, loop over every vertex. If it is not visited yet, you have found a new component: add one to the count and run a DFS from it to mark the whole group. Every vertex is visited once overall, so the total is still O(V + E), not O(V x (V + E)).\n\nYou can label each vertex with its component number instead of just counting. Then \"are a and b connected?\" becomes an O(1) check: comp[a] == comp[b].\n\nIn directed graphs the idea splits in two. Weakly connected ignores edge direction. Strongly connected means every vertex can reach every other one following the arrows. Strongly connected components are found with Tarjan's or Kosaraju's algorithm, both O(V + E).",
      },
      {
        heading: "Three colours for cycles in directed graphs",
        body: "In a directed graph, reaching an already visited vertex does not prove a cycle. In A to B, A to C, B to C, the vertex C is reached twice, yet there is no loop. What matters is whether the vertex is still on the current path.\n\nSo DFS gives every vertex one of three colours. White: not visited yet. Grey: entered, and its DFS call is still running, so it is on the current path. Black: finished, all its descendants explored. When you follow an edge u to v and v is grey, you have found a back edge, and that closes a cycle. An edge to a black vertex is safe.\n\nFor undirected graphs, two states are enough, but you must ignore the edge back to the parent you just came from. Otherwise every edge looks like a tiny cycle. Union-find is another simple way to detect cycles in undirected graphs.",
        visual: {
          type: "flow",
          title: "One vertex in three-colour DFS",
          steps: [
            { label: "Enter u", detail: "Colour u grey: it is on the path" },
            { label: "Edge to white v", detail: "Recurse into v" },
            { label: "Edge to grey v", detail: "Back edge: cycle found" },
            { label: "Edge to black v", detail: "Already finished: ignore" },
            { label: "Leave u", detail: "Colour u black: finished" },
          ],
        },
      },
      {
        heading: "Discovery times, finish times and edge types",
        body: "If you write down a counter value when DFS enters a vertex (discovery time) and when it leaves (finish time), the intervals nest like brackets. If v is discovered inside u's call, v also finishes before u. This is called the parenthesis property.\n\nThese times let you classify every edge in a directed graph. A tree edge leads to a new white vertex. A back edge goes to a grey ancestor and means a cycle. A forward edge jumps to an already finished descendant. A cross edge goes to a finished vertex in another branch. In an undirected graph only tree edges and back edges can appear.\n\nFinish times are the key to topological sort: listing vertices by decreasing finish time puts every edge pointing forward. The same times power Tarjan's algorithms for bridges, articulation points and strongly connected components.",
        visual: {
          type: "tree",
          title: "Edge types in a directed DFS",
          root: "Edge u to v",
          children: [
            { label: "Tree edge", children: ["v was white", "Builds the DFS tree"] },
            { label: "Back edge", children: ["v is grey (an ancestor)", "Means a cycle"] },
            { label: "Forward edge", children: ["v is a finished descendant", "Shortcut down the tree"] },
            { label: "Cross edge", children: ["v is finished, other branch", "No cycle"] },
          ],
        },
      },
      {
        heading: "Flood fill on grids",
        body: "Flood fill is DFS on a grid: start at one cell and mark every connected cell with the same value. Paint bucket tools, island counting and \"surrounded regions\" puzzles all use it. The run is O(R x C) because each cell is marked once.\n\nYou can mark visited cells in two ways. Changing the grid itself, for example setting '1' to '0', needs no extra memory but destroys the input; copy it first if the caller still needs it. A separate visited set or 2D boolean list keeps the input intact.\n\nDecide on 4-connectivity (up, down, left, right) or 8-connectivity (diagonals too) from the problem statement. Two diagonal land cells are one island under 8-connectivity and two islands under 4. On big grids, prefer an explicit stack or BFS, because a single snake-shaped island can be deeper than Python's recursion limit.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "DFS and BFS side by side",
        columns: [
          { title: "DFS", points: ["Stack or recursion", "Goes deep first, then backtracks", "Cycles, components, topological order", "Memory: depth of the path"] },
          { title: "BFS", points: ["Queue (deque)", "Explores layer by layer", "Fewest-edges shortest paths", "Memory: width of a layer"] },
        ],
      },
    ],
    examples: [
      {
        title: "Counting friend groups with an iterative DFS",
        explanation: "There are n people and a list of friendships. Step 1: build an undirected adjacency list. Step 2: loop over every person; each one not yet seen starts a new group, so count += 1. Step 3: run a stack-based DFS from that person and mark everyone reachable. For n = 5 and edges [[0, 1], [1, 2], [3, 4]], the starts are 0 and 3, so the answer is 2. No recursion is used, so a long chain of a million people is fine.",
        code: {
          lang: "python",
          code: `def count_groups(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    seen, count = [False] * n, 0
    for s in range(n):
        if seen[s]:
            continue
        count += 1
        seen[s], stack = True, [s]
        while stack:
            u = stack.pop()
            for v in adj[u]:
                if not seen[v]:
                    seen[v] = True; stack.append(v)
    return count`,
        },
      },
      {
        title: "Finding a cycle in task dependencies",
        explanation: "Tasks 0, 1, 2 have edges 0 to 1, 1 to 2 and 2 to 0. Step 1: visit 0 and colour it grey. Step 2: follow 0 to 1, colour 1 grey; follow 1 to 2, colour 2 grey. Step 3: follow 2 to 0 and see that 0 is grey, so it is still on the current path: a back edge, so a cycle. Remove the edge 2 to 0 and every vertex ends black with no grey hit, so there is no cycle.",
        code: {
          lang: "python",
          code: `def has_cycle(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v)
    WHITE, GREY, BLACK = 0, 1, 2
    colour = [WHITE] * n
    def visit(u):
        colour[u] = GREY
        for v in adj[u]:
            if colour[v] == GREY or (colour[v] == WHITE and visit(v)):
                return True
        colour[u] = BLACK
        return False
    return any(colour[u] == WHITE and visit(u) for u in range(n))`,
        },
      },
    ],
    cheatSheet: [
      "DFS is O(V + E) time; O(V) space for visited plus the stack",
      "Python's default recursion limit is 1000; use an explicit stack for deep graphs",
      "Components: count how many times you start a new DFS from an unvisited vertex",
      "Directed cycle: an edge to a grey (in-progress) vertex",
      "Undirected cycle: a visited neighbour that is not the parent",
      "Reverse of DFS finish order is a topological order of a DAG",
      "Flood fill: 4 directions or 8 directions changes the answer",
    ],
    quiz: [
      {
        q: "In a directed graph with edges A to B, A to C and B to C, DFS reaches C twice. Is there a cycle?",
        options: ["Yes, because C was visited twice", "Yes, because A has two edges", "No, because C is already black (finished) the second time", "It depends on the start vertex"],
        answer: 2,
        why: "Only an edge to a grey vertex, one still on the current path, proves a cycle.",
      },
      {
        q: "Recursive DFS on a 300 x 300 grid with one huge island crashes. What is the most likely cause?",
        options: ["The recursion depth passed Python's limit", "The grid is too wide for a list", "DFS cannot handle grids", "The visited set was too big"],
        answer: 0,
        why: "One island can force a path of up to 90,000 nested calls, far beyond the default 1000.",
      },
      {
        q: "How many times is each vertex visited when you count components by looping over all vertices and running DFS?",
        options: ["Once per component", "V times", "Once per edge", "Exactly once overall"],
        answer: 3,
        why: "The shared visited set means later DFS runs skip vertices that were already marked.",
      },
      {
        q: "In an undirected DFS, why do you skip the parent when checking for visited neighbours?",
        options: ["To make DFS faster", "Because the edge back to the parent is the same edge you just used, not a cycle", "Because parents are always black", "To keep the recursion depth low"],
        answer: 1,
        why: "Undirected edges are stored both ways, so the parent always appears as a visited neighbour.",
      },
      {
        q: "Which edge types can appear in a DFS of an undirected graph?",
        options: ["Only tree and back edges", "Only cross edges", "Tree, back, forward and cross edges", "Only forward edges"],
        answer: 0,
        why: "Any edge to an already visited vertex in an undirected DFS leads to an ancestor, so it is a back edge.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write reachable(adj, start) that returns the set of all vertices reachable from start, using an explicit stack.",
        hint: "Push start, then pop and push unvisited neighbours until the stack is empty.",
        solution: `def reachable(adj, start):
    seen, stack = {start}, [start]
    while stack:
        u = stack.pop()
        for v in adj[u]:
            if v not in seen:
                seen.add(v); stack.append(v)
    return seen`,
      },
      {
        level: "medium",
        task: "Return the area of the largest island in a grid of 0s and 1s (4-direction). Use an explicit stack, not recursion.",
        hint: "For each unvisited 1, flood it with a stack and count the cells you mark.",
        solution: `def max_island(grid):
    R, C, best = len(grid), len(grid[0]), 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 1:
                grid[r][c], stack, area = 0, [(r, c)], 0
                while stack:
                    y, x = stack.pop(); area += 1
                    for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                        if 0 <= ny < R and 0 <= nx < C and grid[ny][nx] == 1:
                            grid[ny][nx] = 0; stack.append((ny, nx))
                best = max(best, area)
    return best`,
      },
      {
        level: "hard",
        task: "Detect whether an undirected graph with n vertices has a cycle, using iterative DFS that tracks each vertex's parent.",
        hint: "Push (vertex, parent). A visited neighbour that is not the parent closes a cycle. This simple version assumes no duplicate edges.",
        solution: `def undirected_cycle(n, edges):
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    seen = [False] * n
    for s in range(n):
        if seen[s]: continue
        seen[s], stack = True, [(s, -1)]
        while stack:
            u, p = stack.pop()
            for v in adj[u]:
                if v == p: continue
                if seen[v]: return True
                seen[v] = True; stack.append((v, u))
    return False`,
      },
    ],
    faq: [
      { q: "Does DFS find the shortest path?", a: "No. DFS finds some path, often a long one. Use BFS for the fewest edges or Dijkstra for weighted graphs." },
      { q: "How do I avoid RecursionError in Python DFS?", a: "Rewrite the DFS with an explicit list as a stack. Raising the limit with sys.setrecursionlimit helps a little, but very deep recursion can still crash the interpreter." },
      { q: "What is the time complexity of DFS?", a: "O(V + E) with an adjacency list, because each vertex is visited once and each edge is examined once per direction. On a grid it is O(rows x cols)." },
    ],
  },

  "dsa-graphs/topological-sort": {
    plain: [
      "Some jobs must happen before others. You must put on socks before shoes. A course needs its prerequisite first. A program module must be compiled after the modules it imports. A topological sort turns these rules into one ordered list where every \"before\" rule is respected.",
      "We draw each job as a vertex and each rule \"A before B\" as an arrow from A to B. Then a topological order is a line-up of all vertices where every arrow points forward, from left to right.",
      "This only works if the rules never loop. If A must come before B, B before C, and C before A, nothing can go first. A directed graph with no loops is called a DAG (directed acyclic graph). Every DAG has at least one topological order.",
      "There are two standard algorithms, Kahn's algorithm and the DFS method. Both run in O(V + E), and both tell you when a loop makes the order impossible.",
    ],
    deepDive: [
      {
        heading: "Why every DAG can be ordered",
        body: "Kahn's algorithm rests on one fact: every DAG has at least one vertex with in-degree 0, meaning no arrow points into it. Why? Pick any vertex and keep walking backwards along incoming arrows. If every vertex had an incoming arrow, you could walk forever. With only V vertices, you would eventually repeat one, and that repeat is a cycle. A DAG has no cycle, so the walk must stop at a vertex with nothing pointing in.\n\nThat vertex can safely go first. Remove it and its outgoing arrows. What remains is still a DAG, so it also has a vertex with in-degree 0. Repeat until nothing is left.\n\nThe same argument explains cycle detection. If the graph has a cycle, the vertices on it never reach in-degree 0, because each one keeps an arrow from the previous one. Kahn's algorithm then stops early with fewer than V vertices in the output.",
      },
      {
        heading: "Kahn's algorithm in practice",
        body: "Count the in-degree of every vertex in one pass over the edges. Push every vertex with in-degree 0 into a queue. Then repeat: pop a vertex, add it to the output, and lower the in-degree of each of its neighbours by one. A neighbour that drops to 0 is now free and goes into the queue. Each vertex is pushed once and each edge is decreased once: O(V + E).\n\nWhen several vertices are free at once, any choice is valid, which is why many topological orders can exist. If the problem wants the lexicographically smallest order, replace the queue with a min-heap (heapq). That costs O(V log V + E).\n\nThe vertices left with in-degree above 0 at the end are either on a cycle or wait on something that is. That list is useful in error messages, such as \"cannot install: these packages depend on each other\".",
        bullets: [
          "Queue gives any valid order in O(V + E)",
          "heapq gives the smallest order in O(V log V + E)",
          "Leftover in-degree above 0 means a cycle blocks those vertices",
        ],
      },
      {
        heading: "The DFS method: reverse post-order",
        body: "Run a DFS and add each vertex to a list at the moment it finishes, after all its descendants are done. This is called post-order. Then reverse the list.\n\nWhy does that work? Take any edge u to v. If DFS reaches v from u, v finishes first, so v appears earlier in the post-order and later after reversing. If v was already finished, the same is true. The only bad case is when v is still grey, on the current path, but then u to v is a back edge, which means the graph has a cycle. So the three-colour rule from DFS doubles as the cycle check.\n\nIn Python, appending to a list and reversing once at the end is O(V). Avoid list.insert(0, x) inside the loop, which costs O(V) per call. For large graphs, use an iterative DFS to stay under the recursion limit.",
        visual: {
          type: "sequence",
          title: "DFS topological sort on A to B, B to C, A to C",
          actors: ["Driver loop", "DFS calls", "Finished list"],
          messages: [
            { from: 0, to: 1, label: "visit(A) enters B, then C" },
            { from: 1, to: 2, label: "C has no edges: append C" },
            { from: 1, to: 2, label: "B is done: append B" },
            { from: 1, to: 2, label: "A to C: C is already black, skip" },
            { from: 1, to: 2, label: "A is done: list is C, B, A" },
            { from: 2, to: 0, label: "Reverse: A, B, C" },
          ],
        },
      },
      {
        heading: "Levels, parallel work and the critical path",
        body: "If you run Kahn's algorithm one layer at a time, each layer is a group of jobs that can run in parallel, because none of them waits on another in the same layer. Build tools and CI systems use this idea to run independent steps together. The number of layers is the minimum number of rounds needed, for example the fewest semesters to finish all courses when there is no limit on courses per term.\n\nA topological order also makes dynamic programming on DAGs easy. Process vertices in order, and when you reach v, all of its predecessors are already final. This gives the longest path in a DAG in O(V + E). With job durations as weights, that longest path is the critical path: the chain of jobs that decides the earliest possible finish time. Longest path is hard on general graphs, but easy on DAGs thanks to this order.\n\nThe order is unique exactly when the queue never holds more than one vertex at a time.",
        visual: {
          type: "layers",
          title: "Kahn's layers for a small build",
          layers: [
            { label: "Layer 0", detail: "config and utils: no dependencies" },
            { label: "Layer 1", detail: "db and auth: need utils or config" },
            { label: "Layer 2", detail: "api: needs db and auth" },
            { label: "Layer 3", detail: "app: needs api" },
          ],
        },
      },
      {
        heading: "Getting the edge direction right",
        body: "Most wrong answers in topological sort problems come from arrows that point the wrong way. Decide the meaning once: an arrow from A to B means A must come before B. Then translate the input carefully.\n\nIn the classic course schedule problem, prerequisites[i] = [a, b] means you must take b before a. So the edge goes from b to a, and you increase the in-degree of a. If you build it the other way, you get the reverse order, which is still \"valid\" for the reversed graph, so tests with symmetric data may even pass.\n\nTwo more checks: include vertices that have no edges at all (they still need a place in the order), and decide what to return for a cycle. An empty list, None or an exception are all fine, as long as you never return a partial order that looks complete.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Kahn's algorithm versus DFS post-order",
        columns: [
          { title: "Kahn (BFS style)", points: ["Needs in-degree counts", "No recursion, no depth limit", "Cycle: output shorter than V", "Easy to get layers and smallest order"] },
          { title: "DFS post-order", points: ["Needs three colours", "Recursion or iterative stack", "Cycle: edge to a grey vertex", "Easy to report the cycle itself"] },
        ],
      },
    ],
    examples: [
      {
        title: "Tracing Kahn's algorithm by hand, and hitting a cycle",
        explanation: "Courses: math before physics, math before cs, cs before ai, physics before ai. Step 1: in-degrees are math 0, physics 1, cs 1, ai 2. Step 2: the queue starts with math. Pop math and output it; physics and cs drop to 0 and join the queue. Step 3: pop physics, then cs; ai drops 2 to 1 to 0. Step 4: pop ai. Output: math, physics, cs, ai. All 4 placed, so it is valid. Now add ai before math. math starts at in-degree 1, the queue starts empty, nothing is output, and 0 is less than 4: a cycle.",
      },
      {
        title: "DFS topological sort with a clear cycle error",
        explanation: "Here graph[u] lists the jobs that must come after u. Step 1: visit each unvisited job. Step 2: mark it grey, visit its successors, then mark it black and append it. Step 3: if a successor is grey, raise an error that names the edge, which is much more helpful than an empty list. For the example, the finished list is app, api, db, utils, and reversing gives utils, db, api, app.",
        code: {
          lang: "python",
          code: `def topo_dfs(graph):              # graph[u] = jobs that must come after u
    state, order = {}, []          # missing = white, 1 = grey, 2 = black
    def visit(u):
        state[u] = 1
        for v in graph.get(u, []):
            if state.get(v) == 1:
                raise ValueError(f"cycle through {u} -> {v}")
            if v not in state:
                visit(v)
        state[u] = 2
        order.append(u)
    for u in graph:
        if u not in state:
            visit(u)
    return order[::-1]

print(topo_dfs({"app": [], "utils": ["db", "api"], "db": ["api"], "api": ["app"]}))`,
        },
      },
    ],
    cheatSheet: [
      "Topological order exists if and only if the directed graph has no cycle",
      "Kahn: queue the in-degree 0 vertices, pop, decrement neighbours, repeat",
      "Kahn output shorter than V means there is a cycle",
      "DFS method: append on finish, reverse at the end",
      "Lexicographically smallest order: use heapq, O(V log V + E)",
      "Course schedule [a, b] means b before a: edge b -> a",
      "Longest path in a DAG: DP in topological order, O(V + E)",
    ],
    quiz: [
      {
        q: "Kahn's algorithm outputs 7 vertices for a graph with 9 vertices. What does that tell you?",
        options: ["Two vertices have no edges", "The graph is undirected", "The graph contains a cycle", "The order is not unique"],
        answer: 2,
        why: "Vertices on or behind a cycle never reach in-degree 0, so they are never output.",
      },
      {
        q: "In the DFS method, when is a vertex added to the list that you later reverse?",
        options: ["When it is first discovered", "When all of its descendants are finished", "When its in-degree reaches 0", "When it is pushed on the stack"],
        answer: 1,
        why: "Post-order adds a vertex after its whole subtree, and reversing puts it before all of them.",
      },
      {
        q: "prerequisites = [[1, 0]] in the course schedule problem means you take course 0 before course 1. Which edge do you add?",
        options: ["1 -> 0", "Both directions", "No edge, it is a self-loop", "0 -> 1"],
        answer: 3,
        why: "The arrow points from what comes first (0) to what comes after (1).",
      },
      {
        q: "When is the topological order of a DAG unique?",
        options: ["When Kahn's queue never holds more than one vertex", "When the graph has fewer than 10 vertices", "When all edges have the same weight", "When there is exactly one source vertex"],
        answer: 0,
        why: "Two free vertices at the same time could be output in either order, giving two valid answers.",
      },
      {
        q: "What is the time complexity of Kahn's algorithm with a plain queue?",
        options: ["O(V log V)", "O(V^2)", "O(V + E)", "O(E log E)"],
        answer: 2,
        why: "Each vertex is pushed and popped once, and each edge lowers one in-degree once.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Edges: a -> c, b -> c, c -> d. List every valid topological order by hand.",
        hint: "Find which vertices can go first, then see what each choice frees up.",
        solution: "a and b both start with in-degree 0, so either can go first.\nc needs both a and b; d needs c.\nValid orders: a, b, c, d and b, a, c, d. There are exactly 2.",
      },
      {
        level: "medium",
        task: "Return the minimum number of semesters to finish all n courses, if you can take any number of courses per semester once their prerequisites are done. Return -1 if impossible.",
        hint: "Run Kahn's algorithm layer by layer and count the layers. Build adj and indeg as usual first.",
        solution: `level = [v for v in range(n) if indeg[v] == 0]   # after building adj and indeg
terms = done = 0
while level:
    terms += 1; done += len(level); nxt = []
    for u in level:
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0: nxt.append(v)
    level = nxt
return terms if done == n else -1             # -1: a cycle`,
      },
      {
        level: "hard",
        task: "Return the lexicographically smallest topological order of vertices 0..n-1, or [] if there is a cycle.",
        hint: "Replace the queue in Kahn's algorithm with a min-heap.",
        solution: `import heapq

def smallest_order(n, edges):
    adj, indeg = [[] for _ in range(n)], [0] * n
    for u, v in edges:
        adj[u].append(v); indeg[v] += 1
    heap = [i for i in range(n) if indeg[i] == 0]; heapq.heapify(heap); order = []
    while heap:
        u = heapq.heappop(heap); order.append(u)
        for v in adj[u]:
            indeg[v] -= 1
            if indeg[v] == 0: heapq.heappush(heap, v)
    return order if len(order) == n else []`,
      },
    ],
    faq: [
      { q: "Can a graph with a cycle be topologically sorted?", a: "No. In a cycle every vertex must come before another vertex of the same cycle, which is impossible. Both Kahn's algorithm and the DFS method detect this." },
      { q: "Should I use Kahn's algorithm or DFS for topological sort?", a: "Kahn's algorithm is easier to get right, has no recursion limit and gives layers naturally. DFS is handy when you already have a DFS or want to report the exact cycle." },
      { q: "Where is topological sort used in real software?", a: "Build systems like make and Bazel, package managers resolving dependencies, task schedulers such as Airflow, and spreadsheets recalculating cells all order work this way." },
    ],
  },

  "dsa-graphs/union-find": {
    plain: [
      "Imagine a party where people arrive alone and then start forming groups. Every few seconds, someone says \"these two people are now in the same group\". Now and then, you are asked \"are Ana and Ben in the same group?\" Union-find is the data structure built for exactly this.",
      "It supports two operations. union(a, b) merges the group of a with the group of b. find(a) returns the leader of a's group, called the representative. Two people are in the same group when their finds return the same leader.",
      "Inside, every element points to a parent, and following parents upward leads to the leader. With two small tricks, path compression and union by rank or size, these chains stay so short that each operation is almost constant time, even for millions of elements.",
      "Union-find is also called disjoint set union, or DSU. Disjoint means the groups never overlap: every element belongs to exactly one group.",
    ],
    deepDive: [
      {
        heading: "The forest inside: parents and roots",
        body: "Union-find stores a forest, a set of trees, in one list called parent. At the start parent[i] = i: everyone is their own root and their own group. find(x) follows parent links upward until it reaches a root, a node that points to itself. union(a, b) finds both roots and, if they differ, makes one root point to the other. Only roots change during a union.\n\nWithout any tricks this can go badly. Union 0 with 1, then 1 with 2, then 2 with 3, always hanging the old tree under the new element, and you get a chain. find(0) now walks the whole chain, O(n) per call, and n operations cost O(n^2).\n\nThe two optimisations attack this from both sides. Union by rank or size keeps trees short when they are built. Path compression flattens them whenever find walks through them.",
        visual: {
          type: "flow",
          title: "What union(a, b) does",
          steps: [
            { label: "ra = find(a)", detail: "Walk up to a's root" },
            { label: "rb = find(b)", detail: "Walk up to b's root" },
            { label: "Same root?", detail: "Yes: already together, return False" },
            { label: "Pick the bigger tree", detail: "By size or rank" },
            { label: "Link the roots", detail: "Smaller root points to bigger root" },
          ],
        },
      },
      {
        heading: "Union by rank or by size",
        body: "Union by size keeps a size count at each root and hangs the smaller tree under the bigger one. Union by rank keeps a rank, an upper bound on the tree's height, and hangs the lower-rank tree under the higher one; the rank grows by one only when two equal ranks are joined.\n\nEither rule guarantees a tree height of at most log2(n). The reason, for size: a node only moves one level deeper when its tree joins one at least as big, so its tree at least doubles each time. A tree cannot double more than log2(n) times. So even without path compression, find is O(log n) in the worst case.\n\nSize has a practical bonus: size[find(x)] tells you how big x's group is, a common question in problems like \"largest connected group\".",
        bullets: [
          "Size rule: smaller group goes under the larger",
          "Rank rule: lower rank goes under higher; equal ranks add 1",
          "Height stays at most log2(n) with either rule",
        ],
      },
      {
        heading: "Path compression and the inverse Ackermann bound",
        body: "Path compression makes every node visited during find point closer to the root. Full compression, usually written recursively, makes every node on the path point straight to the root. Path halving, used in the explainer's code, makes every other node skip to its grandparent in a single loop. Path splitting does the same for every node. All three give the same bound, and halving and splitting need no recursion.\n\nWith compression alone, a sequence of operations costs O(log n) amortised per operation. Amortised means averaged over the whole sequence; one single call can still be slow. With compression and union by rank or size together, Tarjan proved the amortised cost is O(alpha(n)), where alpha is the inverse Ackermann function. It grows so slowly that alpha(n) is at most 4 for any n you could ever store, so in practice each operation is constant time.\n\nOne honest caveat: compression changes the shape on reads, so a find is not a pure read-only operation, which matters if you share the structure between threads.",
      },
      {
        heading: "Counting components as edges arrive",
        body: "Keep a counter that starts at n, the number of elements. Every union that joins two different roots lowers it by one. A union of two elements that are already together changes nothing. At any moment the counter is the number of groups, with no extra traversal.\n\nThis is where union-find beats BFS and DFS. If the graph is fixed and you ask once, a single DFS in O(V + E) is just as good. But if edges keep arriving and you must answer after each one, rerunning DFS costs O(V + E) per edge, while union-find costs nearly O(1) per edge. Examples: islands appearing on a map one cell at a time, network cables being connected, or Kruskal's algorithm adding edges in order of weight.\n\nThe limitation: union-find cannot split groups. Deleting an edge has no cheap operation. Problems with removals are usually solved offline, by processing the events in reverse so removals become additions.",
        visual: {
          type: "compare",
          title: "Connectivity: DFS versus union-find",
          columns: [
            { title: "BFS or DFS", points: ["Graph is fixed", "One full pass: O(V + E)", "Can also give paths", "Must redo work after each new edge"] },
            { title: "Union-find", points: ["Edges arrive over time", "About O(1) per union or find", "Tracks group count and sizes", "Cannot remove edges"] },
          ],
        },
      },
      {
        heading: "Variations you will meet",
        body: "When elements are strings or tuples instead of 0..n-1, use dicts for parent and size and create each element the first time it is seen. This is common in problems like merging accounts that share an email address.\n\nCycle detection in an undirected graph is one line of logic: process the edges one by one, and if both ends already have the same root, that edge closes a cycle. This is how Kruskal's algorithm skips edges, and how the \"redundant connection\" problem finds the extra edge in a tree.\n\nWeighted union-find stores, for each node, a value relative to its parent, such as \"a is 2 times b\". find adds or multiplies these values while compressing the path. It solves problems like evaluating division equations, where you must answer a / c from given ratios a / b and b / c. Always compare roots, find(a) == find(b), never parent[a] == parent[b], since parents are not roots in general.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "The parent list through four operations (size rule, path halving)",
        steps: [
          { label: "Start", detail: "parent = [0, 1, 2, 3]: four groups" },
          { label: "union(0, 1)", detail: "parent = [0, 0, 2, 3]: three groups" },
          { label: "union(2, 3)", detail: "parent = [0, 0, 2, 2]: two groups" },
          { label: "union(1, 3)", detail: "Roots 0 and 2 join: [0, 0, 0, 2]" },
          { label: "find(3)", detail: "3 jumps to its grandparent 0: [0, 0, 0, 0]" },
        ],
      },
    ],
    examples: [
      {
        title: "Finding the redundant edge in a network",
        explanation: "A network of n computers was a tree, but one extra cable was added, creating a loop. The cables are given in order and labelled 1..n. Step 1: start with every computer as its own group. Step 2: for each cable (u, v), find both roots. Step 3: if the roots are equal, u and v were already connected, so this cable closes the loop: return it. Otherwise union them. For [[1, 2], [1, 3], [2, 3]], the first two cables join everyone, and [2, 3] is returned. This version links roots without the size rule to stay short; path halving still keeps it fast.",
        code: {
          lang: "python",
          code: `def redundant_edge(edges):          # vertices 1..n, n = len(edges)
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            return [u, v]
        parent[ru] = rv
    return None`,
        },
      },
      {
        title: "Counting friend groups live, with names as keys",
        explanation: "A chat app shows how many separate friend groups exist as friendships are added. Step 1: use dicts so any name works, and create a person the first time find sees them, which adds one group. Step 2: each successful union removes one group. Trace: union(\"ana\", \"ben\") creates two people (count 2) and joins them (count 1). union(\"cy\", \"dee\") brings it to 3 then 2. union(\"ben\", \"dee\") joins the two groups: count 1. Each step is nearly O(1).",
        code: {
          lang: "python",
          code: `class Groups:                       # works with any hashable keys
    def __init__(self):
        self.parent, self.size, self.count = {}, {}, 0
    def find(self, x):
        if x not in self.parent:
            self.parent[x], self.size[x] = x, 1; self.count += 1
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x
    def union(self, a, b):
        a, b = self.find(a), self.find(b)
        if a == b: return
        if self.size[a] < self.size[b]: a, b = b, a
        self.parent[b] = a; self.size[a] += self.size[b]; self.count -= 1`,
        },
      },
    ],
    cheatSheet: [
      "Start: parent = list(range(n)); every element is its own root",
      "Same group test: find(a) == find(b), never parent[a] == parent[b]",
      "Union by size or rank alone: height at most log2(n), find O(log n)",
      "Both optimisations: O(alpha(n)) amortised, alpha(n) <= 4 in practice",
      "Group count: start at n, subtract 1 on every successful union",
      "Edge whose ends already share a root closes a cycle",
      "Union-find cannot split groups; handle removals offline in reverse",
    ],
    quiz: [
      {
        q: "With union by size but no path compression, what is the worst-case cost of find?",
        options: ["O(1)", "O(n)", "O(alpha(n))", "O(log n)"],
        answer: 3,
        why: "The size rule keeps tree height at most log2(n), and find walks at most that height.",
      },
      {
        q: "You start with 10 elements and perform 6 unions, of which 2 join elements already in the same group. How many groups remain?",
        options: ["4", "6", "8", "2"],
        answer: 1,
        why: "Only the 4 successful unions reduce the count, so 10 - 4 = 6.",
      },
      {
        q: "Which task is union-find bad at?",
        options: ["Answering whether two elements are connected", "Counting groups as edges are added", "Splitting a group when an edge is removed", "Detecting a cycle in an undirected graph"],
        answer: 2,
        why: "There is no cheap way to undo a union, so deletions need other techniques.",
      },
      {
        q: "What does path compression do during find(x)?",
        options: ["Makes nodes on the path point closer to (or directly at) the root", "Merges two groups", "Sorts the parent list", "Moves the root to the bottom of the tree"],
        answer: 0,
        why: "Later finds on those nodes then take only one or two steps.",
      },
      {
        q: "In union by rank, when does a root's rank increase?",
        options: ["On every union", "On every find", "Never", "When it absorbs another root with the same rank"],
        answer: 3,
        why: "Joining two trees of equal rank makes the result one level taller, so the new root's rank goes up by 1.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "With the explainer's DSU (size rule, path halving) on 5 elements, run union(0, 1), union(2, 3), union(3, 4), union(1, 4). Write the parent list after each step.",
        hint: "Find both roots first. Equal sizes keep the first root; otherwise the bigger root stays.",
        solution: "Start:       [0, 1, 2, 3, 4]\nunion(0, 1): [0, 0, 2, 3, 4]   sizes equal, 0 stays root\nunion(2, 3): [0, 0, 2, 2, 4]\nunion(3, 4): [0, 0, 2, 2, 2]   root 2 has size 2, takes 4\nunion(1, 4): roots 0 (size 2) and 2 (size 3), so 0 goes under 2\n             [2, 0, 2, 2, 2]",
      },
      {
        level: "medium",
        task: "Friendship logs are [time, a, b] for n people. Return the earliest time when everyone is in one group, or -1 if that never happens.",
        hint: "Sort logs by time, union as you go, and check the group count after each successful union.",
        solution: `def earliest_all_connected(logs, n):
    parent, count = list(range(n)), n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    for t, a, b in sorted(logs):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb; count -= 1
            if count == 1: return t
    return -1`,
      },
      {
        level: "hard",
        task: "Given equations like \"a==b\" and \"b!=c\" over lowercase letters, return True if all of them can be true at once.",
        hint: "Union every == pair first. Then check that no != pair shares a root.",
        solution: `def equations_possible(eqs):
    parent = list(range(26))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    for e in eqs:
        if e[1] == "=":
            parent[find(ord(e[0]) - 97)] = find(ord(e[3]) - 97)
    return all(find(ord(e[0]) - 97) != find(ord(e[3]) - 97)
               for e in eqs if e[1] == "!")`,
      },
    ],
    faq: [
      { q: "Is union-find really O(1)?", a: "Not exactly. With path compression and union by rank or size, it is O(alpha(n)) amortised, and alpha(n) is at most 4 for any realistic n, so it behaves like constant time." },
      { q: "When should I use union-find instead of BFS or DFS?", a: "Use union-find when edges arrive over time and you must answer connectivity questions between additions, or inside Kruskal's algorithm. For a fixed graph and a single question, BFS or DFS is just as fast and can also return paths." },
      { q: "Do I need both path compression and union by rank?", a: "For the best bound, yes. In practice, path compression alone is often fast enough, but adding union by size costs only a few lines and protects against bad input orders." },
      { q: "What is the difference between union by rank and union by size?", a: "Rank tracks an upper bound on tree height, while size tracks the number of elements. Both give the same guarantees; size is often preferred because it also tells you how big each group is." },
    ],
  },
};

export default extra;
