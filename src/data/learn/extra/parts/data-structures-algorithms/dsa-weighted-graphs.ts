import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-weighted-graphs/dijkstra": {
    plain: [
      "Think of a map app. Roads connect places, and each road has a length or a travel time. You want the quickest way from your home to every other place. Dijkstra's algorithm (say \"DYKE-stra\") solves exactly this, as long as no road has a negative length.",
      "The idea is simple. Keep a best-known distance for every place. Start with 0 for home and infinity for the rest. Then, again and again, pick the closest place you have not finished yet. Its distance can no longer get better, so you lock it in.",
      "From that locked place, look at each road leaving it. If going through it gives a shorter trip to a neighbour, write down the new, smaller distance. This step is called relaxing an edge. An edge is one road in the graph, and its weight is its length.",
      "To find the closest unfinished place quickly, we use a min-heap (a priority queue that always gives back the smallest item). In Python that is the heapq module. With it, Dijkstra handles graphs with millions of edges in seconds.",
    ],
    deepDive: [
      {
        heading: "Why the closest vertex is safe to lock in",
        body: "When Dijkstra pops vertex u with distance d, every other unfinished vertex has a distance of at least d. Any other route to u must leave the finished area through one of those vertices, so it already costs at least d before it even reaches u. With non-negative weights, the rest of that route can only add length, never remove it. So d is final.\n\nThis argument is the whole reason for the \"non-negative\" rule. One negative edge lets a long detour suddenly become cheaper, and a vertex you already locked could improve later. Dijkstra never looks back, so it would keep the wrong answer.",
        bullets: ["Finished vertices come out of the heap in order of distance", "Each vertex is finalised exactly once", "Zero-weight edges are fine; negative ones are not"],
      },
      {
        heading: "Lazy deletion and the real cost",
        body: "A textbook priority queue has a decrease-key operation to lower a vertex's priority in place. Python's heapq does not. Instead we push a new (distance, vertex) pair every time a distance improves, and when an old pair is popped later we notice it is stale (its distance is bigger than the best one) and skip it.\n\nEach successful relaxation pushes one entry, so the heap holds at most E entries in total, where E is the number of edges. Every push and pop costs O(log E). Since E is at most V^2, log E is at most 2 log V, so the total is O((V + E) log V), the same bound as the decrease-key version.\n\nFor very dense graphs (E close to V^2), a version without a heap that scans an array for the closest vertex runs in O(V^2), which is better than O(V^2 log V).",
        visual: {
          type: "flow",
          title: "Life of one heap entry",
          steps: [
            { label: "Push (5, B)", detail: "First route to B found, cost 5." },
            { label: "Push (3, B)", detail: "A cheaper route appears; best[B] = 3." },
            { label: "Pop (3, B)", detail: "Smaller pair comes out first; B is final." },
            { label: "Pop (5, B)", detail: "5 > best[B], so it is stale." },
            { label: "Skip", detail: "No edges are relaxed for it." },
          ],
        },
      },
      {
        heading: "Rebuilding the route and stopping early",
        body: "Distances alone rarely satisfy a user; they want the route. Keep a parent dictionary. Whenever you relax edge u to v, set parent[v] = u. At the end, walk from the target back through parents to the source and reverse the list.\n\nIf you only need one target, you can stop the moment that target is popped from the heap. Its distance is final by the argument above, and any work after that point is wasted. On a road network this often cuts the search to a small circle around the source.",
        bullets: ["parent[v] = u on every successful relaxation", "Walk back from the target, then reverse", "Unreachable targets never get a parent"],
      },
      {
        heading: "Variants you will meet",
        body: "Many problems are Dijkstra in disguise. A grid where each cell has a cost is a graph with up to 4 edges per cell. Several starting points? Push all of them with distance 0 at the start (multi-source Dijkstra). Extra rules, such as \"you may use one free ticket\", become extra fields in the state: the vertex becomes (place, ticket_used), and the graph doubles in size.\n\nWhen every weight is 0 or 1, use 0-1 BFS instead: a deque where 0-weight edges go to the front and 1-weight edges to the back. It runs in O(V + E). When all weights are equal, plain BFS is enough. A* search is Dijkstra plus a guess of the remaining distance, which helps it head towards the target.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Trace: A to B 4, A to C 1, C to B 2, B to D 1, C to D 5",
        steps: [
          { label: "Pop (0, A)", detail: "Push (4, B) and (1, C)." },
          { label: "Pop (1, C)", detail: "B improves to 3, D set to 6; push both." },
          { label: "Pop (3, B)", detail: "D improves to 4; push (4, D)." },
          { label: "Pop (4, B)", detail: "Stale: 4 > 3, skip." },
          { label: "Pop (4, D)", detail: "D is final at 4." },
          { label: "Result", detail: "A 0, C 1, B 3, D 4." },
        ],
      },
      {
        type: "tree",
        title: "Which shortest-path tool fits?",
        root: "Edge weights",
        children: [
          { label: "All equal", children: ["BFS, O(V + E)"] },
          { label: "Only 0 or 1", children: ["0-1 BFS with a deque, O(V + E)"] },
          { label: "Non-negative", children: ["Dijkstra, O((V + E) log V)"] },
          { label: "Some negative", children: ["Bellman-Ford, O(V x E)"] },
          { label: "Graph is a DAG", children: ["Relax in topological order, O(V + E)"] },
        ],
      },
    ],
    examples: [
      {
        title: "Shortest route with the actual path",
        explanation: "We use the graph from the trace diagram and want the route from A to D. Step 1: run Dijkstra and record parent[v] each time a distance improves. Step 2: stop when D is popped, because its distance is final. Step 3: walk back D, B, C, A through the parents and reverse. The answer is cost 4 via A, C, B, D. Note that the direct-looking route A, C, D costs 6 and loses.",
        code: {
          lang: "python",
          code: `import heapq
adj = {"A": [("B", 4), ("C", 1)], "C": [("B", 2), ("D", 5)], "B": [("D", 1)]}
def route(src, dst):
    dist, parent, heap = {src: 0}, {src: None}, [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if u == dst: break               # first pop of dst is final
        if d > dist[u]: continue         # stale entry
        for v, w in adj.get(u, []):
            if d + w < dist.get(v, float("inf")):
                dist[v], parent[v] = d + w, u; heapq.heappush(heap, (d + w, v))
    path, node = [], dst
    while node is not None: path.append(node); node = parent[node]
    return dist[dst], path[::-1]
print(route("A", "D"))  # (4, ['A', 'C', 'B', 'D'])`,
        },
      },
      {
        title: "Network delay time",
        explanation: "A signal starts at node k and travels along directed cables, each with a delay. How long until every node has the signal? That is the largest shortest distance from k. If some node is never reached, the answer is -1. This version finalises a node the first time it is popped and ignores later pops, which is another common way to handle stale entries. For times [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2: nodes 1 and 3 get the signal at time 1, node 4 at time 2, so the answer is 2.",
        code: {
          lang: "python",
          code: `import heapq
from collections import defaultdict

def network_delay(times, n, k):
    adj = defaultdict(list)
    for u, v, w in times: adj[u].append((v, w))
    dist, heap = {}, [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist: continue          # already final
        dist[u] = d
        for v, w in adj[u]:
            if v not in dist: heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1

print(network_delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))  # 2`,
        },
      },
    ],
    cheatSheet: [
      "Binary-heap Dijkstra: O((V + E) log V) time, O(V + E) space",
      "Lazy deletion: the heap holds at most E entries; skip a pop when d > dist[u]",
      "The first time the target is popped, its distance is final, so you can stop",
      "Dense graph (E near V^2): the array version without a heap is O(V^2)",
      "Weights only 0 or 1: 0-1 BFS with a deque, O(V + E)",
      "Equal weights: plain BFS; any negative weight: Bellman-Ford",
      "Store parent[v] = u when relaxing to rebuild the path",
      "Extra rules (stops, tickets, keys) become extra fields in the state tuple",
    ],
    quiz: [
      {
        q: "Edges: A to B weight 4, A to C weight 1, C to B weight 2. What is the shortest distance from A to B?",
        options: ["4", "2", "3", "1"],
        answer: 2,
        why: "Going through C costs 1 + 2 = 3, which beats the direct edge of 4.",
      },
      {
        q: "With lazy deletion in heapq, what is the most entries the heap can ever hold, roughly?",
        options: ["About E, one per successful relaxation", "Exactly V", "About V^2 always", "Exactly log V"],
        answer: 0,
        why: "Every improvement pushes one entry, and each edge can improve a distance at most once when its tail is finalised.",
      },
      {
        q: "Edges: A to B weight 2, A to C weight 3, C to B weight -2. What does Dijkstra report for B?",
        options: ["1, the correct answer", "3", "It crashes", "2, which is wrong"],
        answer: 3,
        why: "B is popped and locked at 2 before C's negative edge is seen; the true distance is 3 - 2 = 1.",
      },
      {
        q: "All edge weights are either 0 or 1. Which approach is asymptotically fastest?",
        options: ["Floyd-Warshall", "0-1 BFS with a deque", "Bellman-Ford", "Dijkstra with a sorted list"],
        answer: 1,
        why: "0-1 BFS pushes 0-edges to the front and 1-edges to the back, running in O(V + E).",
      },
      {
        q: "Why can't you fix negative weights by adding the same constant to every edge?",
        options: ["Python floats overflow", "Dijkstra rejects large weights", "Paths with more edges get penalised more, so the best path can change", "It works, but is slower"],
        answer: 2,
        why: "A path with 5 edges gains 5 times the constant while a path with 1 edge gains it once.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Using the dijkstra function from the explainer (dist is a dict), write within(adj, src, limit) that returns how many vertices, including src, are at distance at most limit.",
        hint: "Unreachable vertices are simply missing from the dict.",
        solution: `def within(adj, src, limit):
    dist = dijkstra(adj, src)
    return sum(1 for d in dist.values() if d <= limit)

adj = {0: [(1, 2), (2, 5)], 1: [(2, 1)], 2: []}
print(within(adj, 0, 3))  # 3: distances are 0, 2, 3`,
      },
      {
        level: "medium",
        task: "A grid holds a cost in each cell. You start at the top-left, pay for every cell you enter (including the start), and may move up, down, left or right. Return the minimum total cost to reach the bottom-right.",
        hint: "Each cell is a vertex; the weight of moving into a cell is that cell's cost.",
        solution: `import heapq
def grid_cost(g):
    R, C = len(g), len(g[0])
    dist = {(0, 0): g[0][0]}; heap = [(g[0][0], 0, 0)]
    while heap:
        d, r, c = heapq.heappop(heap)
        if (r, c) == (R - 1, C - 1): return d
        if d > dist[(r, c)]: continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and d + g[nr][nc] < dist.get((nr, nc), float("inf")):
                dist[(nr, nc)] = d + g[nr][nc]; heapq.heappush(heap, (dist[(nr, nc)], nr, nc))
print(grid_cost([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))  # 7`,
      },
      {
        level: "hard",
        task: "You may make exactly one edge free (cost 0) on your trip. Find the cheapest cost from src to dst. adj maps u to a list of (v, w).",
        hint: "Make the state (vertex, used) where used is 0 or 1, and run Dijkstra on that doubled graph.",
        solution: `import heapq
def with_coupon(adj, src, dst):
    dist = {(src, 0): 0}; heap = [(0, src, 0)]
    while heap:
        d, u, used = heapq.heappop(heap)
        if u == dst: return d
        if d > dist[(u, used)]: continue
        for v, w in adj.get(u, []):
            for nd, nu in (((d + w, 1),) if used else ((d + w, 0), (d, 1))):
                if nd < dist.get((v, nu), float("inf")):
                    dist[(v, nu)] = nd; heapq.heappush(heap, (nd, v, nu))
    return -1
print(with_coupon({"A": [("B", 10)], "B": [("C", 3)]}, "A", "C"))  # 3`,
      },
    ],
    faq: [
      { q: "Does Dijkstra work on undirected graphs?", a: "Yes. Add every undirected edge in both directions to the adjacency list. The weights must still be non-negative." },
      { q: "Why not just use BFS for shortest paths?", a: "BFS finds the path with the fewest edges, which is the shortest only when every edge has the same weight. With different weights, a path with more but cheaper edges can win." },
      { q: "What is the difference between Dijkstra and A*?", a: "A* is Dijkstra that orders the heap by distance so far plus an estimate of the distance left. If the estimate never overestimates, A* still finds a shortest path and usually explores far fewer vertices." },
      { q: "Can Dijkstra handle a graph with a zero-weight cycle?", a: "Yes. Zero weights are non-negative, so the proof still holds; a zero cycle never makes any distance smaller." },
    ],
  },

  "dsa-weighted-graphs/bellman-ford": {
    plain: [
      "Sometimes an edge has a negative weight. Think of a delivery route where one stop pays you a bonus, or a currency trade that gains money. Dijkstra breaks on such graphs. Bellman-Ford is slower, but it still gives the right answer.",
      "Bellman-Ford is almost too simple. It looks at every edge in the graph and relaxes it: if going through this edge gives a shorter distance, it writes the new value down. One full pass over all edges is called a round. It repeats V - 1 rounds, where V is the number of vertices.",
      "Why V - 1? A shortest path that does not repeat vertices has at most V - 1 edges. Each round fixes at least one more edge of every shortest path. So after V - 1 rounds, every distance is correct.",
      "There is a bonus. If one more round still makes something shorter, the graph has a negative cycle: a loop whose total weight is below zero. You could go around it forever and keep getting \"shorter\", so there is no real shortest path. Floyd-Warshall, the other algorithm here, finds shortest paths between all pairs of vertices at once.",
    ],
    deepDive: [
      {
        heading: "What one round really guarantees",
        body: "Claim: after round k, dist[v] is at most the cost of the cheapest path from the source to v that uses at most k edges. Proof by induction: the cheapest path with k edges is a cheapest path with k - 1 edges plus one last edge (u, v). After round k - 1, dist[u] is good enough, and round k relaxes (u, v).\n\nBecause updates happen in place, a round can do better than this and fix several edges of one path at once, depending on the edge order. That is why a common speed-up works: if a round changes nothing, every later round will change nothing too, so stop. On many real graphs this ends after a few rounds, and the best case is O(E).",
        bullets: ["Worst case: O(V x E) time, O(V) extra space", "Early exit when a round makes no change", "Edge order affects speed, never correctness"],
      },
      {
        heading: "Finding a negative cycle, not just detecting it",
        body: "Run V rounds instead of V - 1 and remember parent[v] on every relaxation. If round V still relaxes some vertex x, x is on a negative cycle or reachable from one. Walk parent pointers back from x V times: you are now guaranteed to stand on the cycle itself. Then keep following parents until you return to the same vertex, and you have the whole cycle.\n\nTo check the whole graph rather than only what one source can reach, start with dist = 0 for every vertex. That acts like an invisible extra source with a 0-weight edge to everyone.",
        visual: {
          type: "flow",
          title: "Recovering a negative cycle",
          steps: [
            { label: "Run V rounds", detail: "Track parent[v] on each relaxation." },
            { label: "Round V relaxes x?", detail: "No: no negative cycle." },
            { label: "Step back V times", detail: "x = parent[x], now on the cycle." },
            { label: "Follow parents", detail: "Until you return to x." },
            { label: "Reverse", detail: "That list is the cycle in edge order." },
          ],
        },
      },
      {
        heading: "Hop limits: cheapest path with at most k stops",
        body: "Some problems cap the number of edges, such as \"cheapest flight with at most k stops\". k stops means k + 1 flights, so you run exactly k + 1 rounds. But the in-place speed-up from above is now a bug: within one round, a distance updated early could be used again later in the same round, letting a path sneak in an extra edge.\n\nThe fix is to read from the old array and write to a copy: new = dist[:] at the start of each round, relax using dist[u], store into new[v], then replace dist with new. Now round r really means \"at most r edges\". The cost is O(k x E) time and O(V) space.",
        bullets: ["k stops = k + 1 edges = k + 1 rounds", "Copy the array each round", "Dijkstra on (city, stops) states also works"],
      },
      {
        heading: "Floyd-Warshall: all pairs in a triple loop",
        body: "Floyd-Warshall keeps a V x V matrix d, starting from edge weights, 0 on the diagonal and infinity elsewhere. It then allows vertex k as an intermediate stop, for k = 0, 1, ..., V - 1, updating d[i][j] = min(d[i][j], d[i][k] + d[k][j]). After phase k, d[i][j] is the shortest path whose intermediate vertices all come from 0..k.\n\nTime is exactly V^3 inner steps, O(V^3), and space O(V^2). In Python, V = 200 is 8 million steps (fine); V = 1,000 is 10^9 steps (far too slow). After it finishes, any d[i][i] < 0 means vertex i lies on a negative cycle. To rebuild paths, keep a next matrix and update it whenever d[i][j] improves.",
      },
      {
        heading: "Where it shows up in practice",
        body: "Distance-vector routing protocols such as RIP are a distributed Bellman-Ford: each router tells its neighbours its current distances, and they relax. RIP caps paths at 15 hops and treats 16 as unreachable, to limit the \"count to infinity\" problem.\n\nCurrency arbitrage is a classic negative-cycle search. Give the edge from currency i to j the weight -log(rate). Multiplying rates becomes adding logs, so a loop of trades that ends with more money than it started has a negative total weight.\n\nA queue-based version called SPFA only relaxes edges out of vertices that changed. It is often faster in practice, but its worst case is still O(V x E).",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Rounds on edges (1,3,3), (2,1,-2), (0,1,4), (0,2,5), source 0",
        steps: [
          { label: "Start", detail: "dist = [0, inf, inf, inf]" },
          { label: "Round 1", detail: "0 to 1 and 0 to 2 relax: [0, 4, 5, inf]" },
          { label: "Round 2", detail: "3 = 7, then 1 = 5 - 2 = 3: [0, 3, 5, 7]" },
          { label: "Round 3", detail: "3 = 3 + 3 = 6: [0, 3, 5, 6]" },
          { label: "Check pass", detail: "No change, so no negative cycle." },
        ],
      },
    ],
    examples: [
      {
        title: "Cheapest flights within k stops",
        explanation: "Flights: 0 to 1 costs 100, 1 to 2 costs 100, 2 to 0 costs 100, 1 to 3 costs 600, 2 to 3 costs 200. From 0 to 3 with at most 1 stop: round 1 reaches 1 for 100; round 2 reaches 2 for 200 and 3 for 700. The answer is 700. With 2 stops, round 3 finds 0, 1, 2, 3 for 400. The copied array is what stops round 2 from chaining 0 to 1 to 2 in a single round.",
        code: {
          lang: "python",
          code: `def cheapest(n, flights, src, dst, k):   # O(k * E)
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0
    for _ in range(k + 1):               # k stops = k + 1 edges
        new = dist[:]                    # read old, write new
        for u, v, w in flights:
            if dist[u] + w < new[v]:
                new[v] = dist[u] + w
        dist = new
    return -1 if dist[dst] == INF else dist[dst]

flights = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]]
print(cheapest(4, flights, 0, 3, 1))     # 700
print(cheapest(4, flights, 0, 3, 2))     # 400`,
        },
      },
      {
        title: "Spotting currency arbitrage",
        explanation: "Rates: 1 USD buys 0.9 EUR, 1 EUR buys 0.9 GBP, 1 GBP buys 1.3 USD. Trading around the loop turns 1 USD into 0.9 x 0.9 x 1.3 = 1.053 USD, free money. Step 1: weight each edge -log(rate), so a profitable loop has a negative sum. Step 2: start every distance at 0 so all currencies are checked. Step 3: run V - 1 rounds, then one more check pass. A small tolerance avoids false alarms from floating-point rounding.",
        code: {
          lang: "python",
          code: `import math
def has_arbitrage(rates):        # rates[i][j]: 1 unit of i buys this much j
    n = len(rates)
    edges = [(i, j, -math.log(rates[i][j]))
             for i in range(n) for j in range(n) if i != j]
    dist = [0.0] * n             # every currency is a start
    for _ in range(n - 1):
        for u, v, w in edges:
            if dist[u] + w < dist[v] - 1e-12:
                dist[v] = dist[u] + w
    return any(dist[u] + w < dist[v] - 1e-12 for u, v, w in edges)

rates = [[1, 0.9, 0.8], [1.1, 1, 0.9], [1.3, 1.1, 1]]   # USD, EUR, GBP
print(has_arbitrage(rates))  # True`,
        },
      },
    ],
    cheatSheet: [
      "Bellman-Ford: V - 1 rounds over all E edges, O(V x E) time, O(V) space",
      "An extra round that still relaxes an edge means a reachable negative cycle",
      "Stop early when a whole round changes nothing",
      "At most k stops: k + 1 rounds, and copy dist at the start of each round",
      "Floyd-Warshall: for k, for i, for j, with k outermost; O(V^3) time, O(V^2) space",
      "After Floyd-Warshall, d[i][i] < 0 means i is on a negative cycle",
      "Arbitrage: weight = -log(rate), then look for a negative cycle",
      "An undirected negative edge is already a negative cycle (go back and forth)",
    ],
    quiz: [
      {
        q: "A graph has 6 vertices and no negative cycle. How many rounds does plain Bellman-Ford need in the worst case?",
        options: ["6", "36", "1", "5"],
        answer: 3,
        why: "A shortest simple path has at most V - 1 = 5 edges, and each round fixes at least one more.",
      },
      {
        q: "In the k-stops problem, why do we copy the distance array each round?",
        options: ["So a path cannot use more than one new edge per round", "To save memory", "Because Python lists are immutable", "To detect negative cycles"],
        answer: 0,
        why: "Without the copy, a value updated earlier in the same round can be extended again, adding extra edges.",
      },
      {
        q: "In Floyd-Warshall, which loop must be the outermost?",
        options: ["The source i", "The target j", "The intermediate vertex k", "Any order works"],
        answer: 2,
        why: "Phase k assumes all paths using intermediates 0 to k - 1 are already final.",
      },
      {
        q: "Floyd-Warshall finishes and d[3][3] = -2. What does that mean?",
        options: ["Vertex 3 is unreachable", "Vertex 3 lies on a negative cycle", "The graph has a self-loop of weight 2", "The algorithm ran too few phases"],
        answer: 1,
        why: "A path from 3 back to itself with negative total weight is a negative cycle through 3.",
      },
      {
        q: "What is the worst-case time of SPFA, the queue-based Bellman-Ford?",
        options: ["O(E log V)", "O(V + E)", "O(V^3)", "O(V x E)"],
        answer: 3,
        why: "It often runs fast, but crafted graphs force it into the same bound as plain Bellman-Ford.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add an early exit to Bellman-Ford: stop as soon as a whole round makes no change. Keep the negative-cycle check working.",
        hint: "Use a changed flag per round. If the last allowed round still changed something, do the extra check.",
        solution: `def bellman_ford(n, edges, src):
    dist = [float("inf")] * n; dist[src] = 0
    for _ in range(n):                   # n rounds: the last one is the check
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w; changed = True
        if not changed:
            return dist                  # settled: no negative cycle
    return None                          # still changing in round n
print(bellman_ford(3, [(0, 1, 4), (0, 2, 5), (2, 1, -2)], 0))  # [0, 3, 5]`,
      },
      {
        level: "medium",
        task: "Write floyd_warshall(n, edges) that returns the all-pairs distance matrix, or None if any negative cycle exists. edges are (u, v, w) directed.",
        hint: "Start with 0 on the diagonal and min() for parallel edges. Check the diagonal at the end.",
        solution: `def floyd_warshall(n, edges):
    INF = float("inf")
    d = [[0 if i == j else INF for j in range(n)] for i in range(n)]
    for u, v, w in edges:
        d[u][v] = min(d[u][v], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    return None if any(d[i][i] < 0 for i in range(n)) else d
print(floyd_warshall(3, [(0, 1, 4), (1, 2, -2), (0, 2, 3)]))  # [[0, 4, 2], [inf, 0, -2], [inf, inf, 0]]`,
      },
      {
        level: "hard",
        task: "Write find_neg_cycle(n, edges) that returns the list of vertices on some negative cycle (in edge order), or None.",
        hint: "Start all distances at 0, run n rounds with parents, step back n times from the last relaxed vertex, then walk the loop.",
        solution: `def find_neg_cycle(n, edges):
    dist, parent, x = [0] * n, [-1] * n, -1
    for _ in range(n):
        x = -1
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v], parent[v], x = dist[u] + w, u, v
    if x == -1: return None
    for _ in range(n): x = parent[x]      # now surely on the cycle
    cycle, v = [x], parent[x]
    while v != x: cycle.append(v); v = parent[v]
    return cycle[::-1]
print(find_neg_cycle(3, [(0, 1, 1), (1, 2, -3), (2, 1, 1)]))  # [1, 2]`,
      },
    ],
    faq: [
      { q: "When should I use Bellman-Ford instead of Dijkstra?", a: "Only when edges can be negative, when you need a negative-cycle check, or when the number of edges in the path is limited. Otherwise Dijkstra is much faster." },
      { q: "Does Bellman-Ford work on undirected graphs?", a: "Only if all weights are non-negative. An undirected edge with a negative weight is a two-edge negative cycle, because you can walk it back and forth forever." },
      { q: "Should I run Dijkstra V times or Floyd-Warshall for all pairs?", a: "With non-negative weights on a sparse graph, V runs of Dijkstra cost O(V (V + E) log V), which beats O(V^3). Floyd-Warshall is simpler, handles negative edges, and suits small dense graphs." },
      { q: "What does the shortest path mean if there is a negative cycle?", a: "For vertices the cycle can reach, it is undefined: you can loop and make the cost as low as you like. Algorithms report the cycle or mark those distances as minus infinity." },
    ],
  },

  "dsa-weighted-graphs/mst": {
    plain: [
      "Imagine you must connect five villages with water pipes. Every possible pipe has a price. You do not need a pipe between every pair, only enough so water can reach every village somehow. Which pipes should you build to spend the least? The answer is a minimum spanning tree, or MST.",
      "Spanning means it touches every vertex. Tree means it has no loops, because a loop would always contain a pipe you could remove and still keep everyone connected. A tree on V vertices always has exactly V - 1 edges.",
      "Two famous algorithms build it. Kruskal's algorithm sorts all edges from cheapest to most expensive and takes each one unless it would close a loop. Prim's algorithm starts at one vertex and keeps adding the cheapest edge that reaches a new vertex.",
      "Both are greedy: they take the cheapest safe edge and never change their mind. Unlike many greedy ideas, this one is provably correct, thanks to a simple rule called the cut property.",
    ],
    deepDive: [
      {
        heading: "The cut property, and why greedy is safe here",
        body: "Split the vertices into any two groups. That split is called a cut. The edges with one end in each group cross the cut. The cut property says: the cheapest crossing edge belongs to some MST.\n\nWhy? Take any MST that does not use that cheapest edge e. Add e to it, and you create exactly one loop. That loop must cross the cut a second time, through some other edge f that costs at least as much as e. Remove f. You still have a spanning tree, and it costs no more. So a best tree with e exists. This swap is an exchange argument.\n\nKruskal and Prim are just two ways of picking cuts. Prim's cut is \"tree so far versus the rest\". Kruskal's cut is \"one component versus everything else\" at the moment it adds an edge.",
        bullets: ["Cycle property: the strictly heaviest edge on a loop is in no MST", "Distinct weights mean exactly one MST", "Every MST of a graph has the same total weight"],
      },
      {
        heading: "Kruskal in detail",
        body: "Sort the edges by weight, then scan them. For each edge (u, v), ask union-find whether u and v are already in the same component. If not, keep the edge and merge the two components. Stop after V - 1 edges.\n\nSorting costs O(E log E). Since E is at most V^2, that equals O(E log V). The union-find work is O(E alpha(V)), where alpha is the inverse Ackermann function, which is at most 4 for any input you could ever store. So sorting dominates.\n\nIf the graph is not connected, Kruskal never reaches V - 1 edges. What it builds instead is a minimum spanning forest, one tree per component. Checking len(used) == V - 1 tells you whether the graph was connected.",
      },
      {
        heading: "Prim, and choosing by density",
        body: "Prim keeps a set of vertices already in the tree and a heap of edges leaving it. Pop the cheapest edge. If its far end is already in the tree, skip it (a stale entry). Otherwise add that vertex and push its edges. With heapq and lazy deletion, the heap holds up to E entries and the total is O(E log V).\n\nFor a dense graph, where almost every pair has an edge, use the array version instead. Keep best[v], the cheapest edge from the tree to v, and on each step scan all vertices for the smallest one. That is V steps of O(V) work, O(V^2) total, with no heap and no edge list. When E is close to V^2, this beats both Kruskal and heap Prim.",
        visual: {
          type: "compare",
          title: "Which MST algorithm?",
          columns: [
            { title: "Kruskal", points: ["O(E log E) for the sort", "Needs union-find", "Best with an edge list", "Builds a forest if disconnected"] },
            { title: "Prim with heap", points: ["O(E log V)", "Needs adjacency lists", "Grows from one vertex"] },
            { title: "Prim with array", points: ["O(V^2), no heap", "Best for dense graphs", "Great for all-pairs point distances"] },
          ],
        },
      },
      {
        heading: "MST is not a shortest-path tree",
        body: "A common mix-up: the MST minimises the total cost of the whole network, not the distance from one vertex to another. Take a triangle with A to B 2, B to C 2 and A to C 3. The MST uses A-B and B-C, total 4. But the shortest path from A to C is the direct edge 3, while the MST route from A to C costs 4.\n\nOther facts worth knowing: MST algorithms work with negative weights, because only the order of weights matters. A maximum spanning tree is found by sorting in descending order. The MST also minimises the largest edge used (a minimum bottleneck tree), which is useful for questions like \"the lowest bridge height you must pass\".",
      },
      {
        heading: "Real uses",
        body: "Designing cheap networks is the obvious use: cables, roads, pipes, circuit wiring. A less obvious one is clustering. Run Kruskal but stop when k components remain. The result is k groups, and the gap between groups (the next edge Kruskal would take) is as large as possible. This is called single-linkage clustering.\n\nMSTs also appear inside other algorithms. For the travelling salesperson problem with distances that obey the triangle inequality, walking around an MST and skipping repeated cities gives a tour at most twice the optimal length.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Prim from A: A-B 1, A-C 4, B-C 2, B-D 5, C-D 3",
        steps: [
          { label: "Start at A", detail: "Heap: (1, B), (4, C)." },
          { label: "Pop (1, B)", detail: "Add B, total 1; push (2, C), (5, D)." },
          { label: "Pop (2, C)", detail: "Add C, total 3; push (3, D)." },
          { label: "Pop (3, D)", detail: "Add D, total 6." },
          { label: "Done", detail: "4 vertices, 3 edges; (4, C) and (5, D) are stale." },
        ],
      },
      {
        type: "compare",
        title: "Triangle A-B 2, B-C 2, A-C 3",
        columns: [
          { title: "Minimum spanning tree", points: ["Edges A-B and B-C", "Total weight 4", "A to C costs 4 inside it"] },
          { title: "Shortest-path tree from A", points: ["Edges A-B and A-C", "Total weight 5", "A to C costs 3 inside it"] },
        ],
      },
    ],
    examples: [
      {
        title: "Prim with heapq, step by step",
        explanation: "We use the graph from the trace diagram. Step 1: put A in the tree and push its edges. Step 2: pop the cheapest edge; if it leads to a new vertex, add it and push that vertex's edges. Step 3: skip popped edges whose end is already inside. Step 4: stop once all vertices are in. Adjacency entries are stored as (weight, vertex) so the heap orders them by weight.",
        code: {
          lang: "python",
          code: `import heapq
def prim(adj, start):                    # adj[u] = [(w, v)], undirected
    seen, total, heap = {start}, 0, list(adj[start])
    heapq.heapify(heap)
    while heap and len(seen) < len(adj):
        w, v = heapq.heappop(heap)
        if v in seen: continue           # stale: already in the tree
        seen.add(v); total += w
        for e in adj[v]:
            if e[1] not in seen: heapq.heappush(heap, e)
    return total
adj = {"A": [(1, "B"), (4, "C")], "B": [(1, "A"), (2, "C"), (5, "D")],
       "C": [(4, "A"), (2, "B"), (3, "D")], "D": [(5, "B"), (3, "C")]}
print(prim(adj, "A"))  # 6`,
        },
      },
      {
        title: "Connect all points (a dense graph)",
        explanation: "Given points on a grid, connecting two costs their Manhattan distance |x1 - x2| + |y1 - y2|. Every pair is a possible edge, so with n points there are n(n - 1)/2 edges. Building and sorting them all is wasteful. The array version of Prim never builds the edge list: it keeps best[v] for every point and updates it from each newly added point. Time O(n^2), space O(n). For points (0,0), (2,2), (3,10), (5,2), (7,0) the answer is 20.",
        code: {
          lang: "python",
          code: `def min_cost_connect(points):            # O(n^2) Prim, no heap
    n = len(points)
    best = [float("inf")] * n            # cheapest edge into the tree
    best[0], in_tree, total = 0, [False] * n, 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=best.__getitem__)
        in_tree[u] = True; total += best[u]
        x, y = points[u]
        for v in range(n):
            if not in_tree[v]:
                best[v] = min(best[v], abs(x - points[v][0]) + abs(y - points[v][1]))
    return total
print(min_cost_connect([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]))  # 20`,
        },
      },
    ],
    cheatSheet: [
      "An MST of a connected graph with V vertices has exactly V - 1 edges",
      "Kruskal: sort edges, keep each one whose ends are in different union-find sets; O(E log E)",
      "Prim with heapq and lazy deletion: O(E log V); array Prim: O(V^2) for dense graphs",
      "Cut property: the cheapest edge crossing any cut is in some MST",
      "Distinct weights mean the MST is unique",
      "Kruskal stopped at k components gives k clusters with the widest gaps",
      "Negative weights are fine for MST; directed graphs are not (that is a different problem)",
      "MST minimises the total, not the distance between two vertices",
    ],
    quiz: [
      {
        q: "A connected graph has 12 vertices and 40 edges. How many edges does its MST have?",
        options: ["40", "12", "11", "39"],
        answer: 2,
        why: "Any spanning tree on V vertices has V - 1 edges.",
      },
      {
        q: "Your graph has 5,000 vertices and nearly every pair is connected. Which approach is the best fit?",
        options: ["Prim with an array, O(V^2)", "Kruskal, after sorting about 12.5 million edges", "Bellman-Ford", "Prim with a sorted Python list"],
        answer: 0,
        why: "For dense graphs, O(V^2) Prim avoids building and sorting the huge edge list.",
      },
      {
        q: "Which statement about MSTs is true?",
        options: ["The MST contains the shortest path between every pair", "MST algorithms fail on negative weights", "A graph always has exactly one MST", "Every MST of a graph has the same total weight"],
        answer: 3,
        why: "Several MSTs can exist with ties, but by definition they all have the minimum total.",
      },
      {
        q: "In Kruskal, what does it mean when find(u) == find(v) for the next edge?",
        options: ["The edge is the heaviest so far", "Adding it would create a cycle, so skip it", "The graph is disconnected", "Kruskal must stop"],
        answer: 1,
        why: "u and v are already connected by chosen edges, so this edge would close a loop.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Change the explainer's kruskal so it returns None when the graph is not connected, instead of a forest.",
        hint: "A connected graph's MST has exactly n - 1 edges.",
        solution: `def kruskal_or_none(n, edges):
    total, used = kruskal(n, edges)      # from the explainer
    return (total, used) if len(used) == n - 1 else None

print(kruskal_or_none(4, [(1, 0, 1), (2, 2, 3)]))  # None: two pieces`,
      },
      {
        level: "medium",
        task: "Group n items into exactly k clusters so the smallest distance between two different clusters is as large as possible. edges are (w, u, v). Return that spacing.",
        hint: "Run Kruskal. When k components remain, the next edge that joins two different components is the spacing.",
        solution: `def max_spacing(n, edges, k):
    parent = list(range(n))
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    groups = n
    for w, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru == rv: continue
        if groups == k: return w         # this merge would join two clusters
        parent[ru] = rv; groups -= 1
print(max_spacing(4, [(1, 0, 1), (2, 2, 3), (5, 1, 2), (9, 0, 3)], 2))  # 5`,
      },
      {
        level: "hard",
        task: "n houses (1 to n). Digging a well at house i costs wells[i - 1]; a pipe [u, v, c] connects two houses for cost c. Find the minimum cost so every house has water.",
        hint: "Add a virtual vertex 0 (the water source) with an edge to each house that costs its well. Then it is a plain MST.",
        solution: `def min_cost_water(n, wells, pipes):
    edges = [(c, 0, i + 1) for i, c in enumerate(wells)] + [(c, u, v) for u, v, c in pipes]
    parent = list(range(n + 1))
    def find(x):
        while parent[x] != x: parent[x] = parent[parent[x]]; x = parent[x]
        return x
    total = 0
    for c, u, v in sorted(edges):
        ru, rv = find(u), find(v)
        if ru != rv: parent[ru] = rv; total += c
    return total
print(min_cost_water(3, [1, 2, 2], [[1, 2, 1], [2, 3, 1]]))  # 3`,
      },
    ],
    faq: [
      { q: "Is the minimum spanning tree unique?", a: "If all edge weights are different, yes. With equal weights there can be several MSTs, but they all have the same total weight." },
      { q: "Kruskal or Prim: which should I use?", a: "Use Kruskal when you already have an edge list or the graph is sparse; it is short to write with union-find. Use array Prim when the graph is dense, such as all pairs of points." },
      { q: "Can I find an MST of a directed graph with Kruskal or Prim?", a: "No. The directed version is called a minimum spanning arborescence and needs a different method, the Chu-Liu/Edmonds algorithm." },
      { q: "Do MST algorithms work with negative edge weights?", a: "Yes. Kruskal and Prim only compare weights, so negative values cause no problem, unlike in shortest-path algorithms." },
    ],
  },
};

export default extra;
