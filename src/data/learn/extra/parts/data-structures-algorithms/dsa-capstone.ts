import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "dsa-capstone/algorithms-library": {
    plain: [
      "By now you have written many small solutions: a heap here, a binary search there, a graph search in some notebook. They are scattered, half-tested and hard to find again. Building a library means gathering them into one Python package that you can install, import and trust.",
      "Trust comes from tests. A test is a small piece of code that runs your function and checks the answer. If you change something later and break it, the test fails at once and tells you where. Good tests try the boring cases (an empty list, one item, all items equal), because that is where bugs hide.",
      "You will also measure speed. A benchmark runs your code many times on the same input and records how long it takes. Comparing your merge sort with Python's sorted shows how much a fast built-in written in C really helps, and doubling the input size shows the growth rate you predicted.",
      "Finally you write down the cost of every function, its time and space complexity, and publish the project with a clear README. The result is a portfolio piece you can show an employer and a reference you understand line by line.",
    ],
    deepDive: [
      {
        heading: "A clean project layout",
        body: "Use the src layout: your package lives in src/mylib/ and tests live in tests/, outside the package. A small pyproject.toml describes the project. With a recent setuptools, a [build-system] table (requires = [\"setuptools>=61\"], build-backend = \"setuptools.build_meta\") and a [project] table with name, version and requires-python are enough; setuptools finds packages under src/ automatically.\n\nInstall it in editable mode with pip install -e . inside a virtual environment. Now import mylib works from anywhere, and code changes are picked up without reinstalling. The src layout has one real benefit: tests import the installed package, not the folder they happen to sit next to, so a file you forgot to include shows up as a test failure on your machine instead of on someone else's.\n\nGroup modules by topic: structures (heap, trie, union-find, Fenwick), sorting, searching, graphs and dp.",
        visual: {
          type: "tree",
          title: "Repository layout",
          root: "mylib-dsa/",
          children: [
            { label: "pyproject.toml", children: ["Name, version, requires-python", "pytest settings"] },
            { label: "src/mylib/", children: ["structures/ (heap, trie, dsu)", "sorting.py, searching.py", "graphs.py, dp.py"] },
            { label: "tests/", children: ["test_heap.py", "test_sorting.py", "test_graphs.py"] },
            { label: "bench/", children: ["bench_sorting.py"] },
            { label: "README.md and LICENSE" },
          ],
        },
      },
      {
        heading: "Tests that actually catch bugs",
        body: "Start with pytest: any function named test_something in a file named test_*.py is collected and run by pytest. Use plain assert statements; pytest shows the values when one fails.\n\n@pytest.mark.parametrize runs one test body over a list of inputs, which is perfect for edge cases: empty input, one element, two elements, all duplicates, already sorted, reverse sorted, negative numbers and the target missing. Add a regression test every time you find a bug, so it can never return.\n\nProperty-based testing goes further. The Hypothesis library generates hundreds of random inputs from a description such as st.lists(st.integers()) and checks a property, for example \"my sort equals sorted()\". When it finds a failure it shrinks the input to the smallest example that still fails, which makes debugging much easier. For data structures, compare a random sequence of operations against a trusted model like heapq or a plain dict.",
        bullets: ["pytest -q runs everything quietly", "pytest -k heap runs only tests matching heap", "pytest --cov=mylib needs the pytest-cov plugin", "Every bug you fix gets a regression test"],
      },
      {
        heading: "Benchmarking without fooling yourself",
        body: "Use timeit, not a single time.time() call. timeit.repeat(stmt, number=5, repeat=5) runs the code 5 times per round for 5 rounds and returns each round's total. Take the minimum: background noise can only make code slower, so the fastest round is the best estimate of the real cost. From a shell, python -m timeit -s \"setup\" \"statement\" does the same and picks the loop count for you.\n\nAlways copy mutable inputs inside the timed code (sorting an already sorted list is a different benchmark), and use the same random seed so runs are comparable.\n\nThe most useful test is doubling. Time the function at n, 2n and 4n. If time roughly doubles, it is O(n); a bit more than double suggests O(n log n); four times means O(n^2). Expect Python's built-ins such as sorted and heapq to beat your pure Python versions by a large factor, because they run in C.",
        visual: {
          type: "compare",
          title: "What doubling n tells you",
          columns: [
            { title: "Time x2", points: ["O(n)", "Linear scan, prefix sums", "Sliding window"] },
            { title: "Time a bit over x2", points: ["O(n log n)", "Merge sort, heap sort", "Sorting plus a scan"] },
            { title: "Time x4", points: ["O(n^2)", "Insertion sort", "Nested loops over pairs"] },
          ],
        },
      },
      {
        heading: "Documenting complexity and the API",
        body: "Every public function gets a docstring with what it takes, what it returns, what it raises, and its cost. Write Time: O(log n) and Space: O(1), and say when a bound is amortized (averaged over many calls), as with a dynamic array's append, or expected rather than worst case, as with randomized quicksort or hash lookups.\n\nAdd type hints such as def binary_search(xs: list[int], target: int) -> int. They document the contract and let tools like mypy check callers.\n\nKeep the API small and consistent. If one structure uses push and pop, the others should too. Decide once what \"not found\" means (return -1, return None, or raise) and use it everywhere. Put a single table in the README listing every function with its time and space, and make sure it matches the docstrings.",
        bullets: ["State worst, amortized or expected explicitly", "One convention for not found across the library", "Type hints double as documentation"],
      },
      {
        heading: "Publishing: README, CI and versioning",
        body: "A good README answers four questions in order: what is this, how do I install it, how do I use it (a five-line example), and what is inside (the complexity table). Add a LICENSE file, such as MIT, so others may legally reuse the code.\n\nSet up continuous integration (CI): a GitHub Actions workflow that installs the package and runs pytest on every push and pull request, ideally on two or three Python versions. A green badge in the README shows the tests pass.\n\nYou can go further and build a distribution with python -m build, which writes a wheel and a source archive into dist/, and upload it to PyPI with twine. For a learning project, a tidy GitHub repository with tags such as v0.1.0 is often enough.",
        visual: {
          type: "flow",
          title: "What CI does on every push",
          steps: [
            { label: "Checkout", detail: "Get the commit." },
            { label: "Set up Python", detail: "One job per version." },
            { label: "Install", detail: "pip install -e . plus test tools." },
            { label: "Run pytest", detail: "Fail the build on any failure." },
            { label: "Report", detail: "Green or red check on the commit." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Adding one structure to the library",
        steps: [
          { label: "Write tests first", detail: "Edge cases and a property test." },
          { label: "Implement", detail: "Until every test passes." },
          { label: "Document", detail: "Docstring with time and space." },
          { label: "Benchmark", detail: "Against the built-in, at n, 2n, 4n." },
          { label: "Commit", detail: "CI runs everything again." },
        ],
      },
    ],
    examples: [
      {
        title: "Testing a MinHeap with edge cases and Hypothesis",
        explanation: "Step 1: list edge cases: empty, one item, duplicates, negatives. Step 2: write one parametrized test that pushes everything and checks that popping returns sorted order. Step 3: add a Hypothesis test with the same check on random lists, so cases you never thought of are tried too. Step 4: run pytest -q. If Hypothesis finds a bug, it prints the smallest failing list, for example [0, -1], which points straight at a sift-down mistake.",
        code: {
          lang: "python",
          code: `import pytest
from hypothesis import given, strategies as st
from mylib.structures.heap import MinHeap

def drain(xs):
    h = MinHeap()
    for x in xs: h.push(x)
    return [h.pop() for _ in xs]

@pytest.mark.parametrize("xs", [[], [1], [2, 2, 2], [5, -1, 3, 0]])
def test_edge_cases(xs):
    assert drain(xs) == sorted(xs)

@given(st.lists(st.integers()))
def test_matches_sorted(xs):
    assert drain(xs) == sorted(xs)`,
        },
      },
      {
        title: "Benchmarking merge sort against sorted with doubling",
        explanation: "Step 1: fix a seed and create random lists of size 10,000, 20,000 and 40,000. Step 2: time each sort with timeit.repeat and keep the minimum. Step 3: copy the list inside the timed lambda so every run sorts unsorted data. Step 4: read the output. Your merge sort should grow a little faster than 2x per doubling (O(n log n)), and sorted() should be much faster at every size, because Timsort runs in C.",
        code: {
          lang: "python",
          code: `import random, timeit
from mylib.sorting import merge_sort

random.seed(42)
for n in (10_000, 20_000, 40_000):
    xs = [random.random() for _ in range(n)]
    mine = min(timeit.repeat(lambda: merge_sort(xs[:]), number=5, repeat=5))
    ref = min(timeit.repeat(lambda: sorted(xs), number=5, repeat=5))
    print(f"n={n:>6}  merge_sort {mine:.3f}s  sorted {ref:.3f}s")`,
        },
      },
    ],
    cheatSheet: [
      "pip install -e . installs your package in editable mode inside a virtual environment",
      "pytest finds test_*.py files and test_* functions; run pytest -q for short output",
      "@pytest.mark.parametrize runs one test over many inputs: ideal for edge cases",
      "Hypothesis: @given(st.lists(st.integers())) generates inputs and shrinks failures",
      "timeit.repeat(...) then min(...): the fastest run is the best estimate",
      "Doubling test: x2 time is O(n), a bit over x2 is O(n log n), x4 is O(n^2)",
      "Docstrings say Time and Space, and whether a bound is amortized or expected",
      "python -m build writes a wheel and an sdist into dist/",
    ],
    quiz: [
      {
        q: "Why take the minimum of timeit.repeat results instead of the average?",
        options: ["The minimum is always exactly the true cost", "Noise from other programs only adds time, so the fastest run is closest to the real cost", "The average is not available in timeit", "The minimum hides bugs in the code"],
        answer: 1,
        why: "Python's timeit docs recommend the minimum because higher values are usually caused by interference, not your code.",
      },
      {
        q: "When n doubles, your function takes about four times as long. What growth does that suggest?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"],
        answer: 2,
        why: "(2n)^2 = 4n^2, so quadratic code quadruples when the input doubles.",
      },
      {
        q: "What does Hypothesis do when it finds a failing input?",
        options: ["Shrinks it to a smaller input that still fails and reports that", "Retries until the test passes", "Skips the test silently", "Rewrites your function"],
        answer: 0,
        why: "Shrinking gives you the simplest counterexample, which is much easier to debug.",
      },
      {
        q: "How should a docstring describe the cost of list-style append on a dynamic array?",
        options: ["O(n) worst case only", "O(log n)", "O(1) always, no exceptions", "O(1) amortized, O(n) for a single resize"],
        answer: 3,
        why: "Most appends are O(1), and the occasional O(n) resize averages out to O(1) per call.",
      },
      {
        q: "What is the main benefit of the src layout?",
        options: ["It makes code run faster", "Tests import the installed package, so packaging mistakes show up early", "It is required by pytest", "It removes the need for pyproject.toml"],
        answer: 1,
        why: "Without it, tests may import files from the working folder that never made it into the package.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a parametrized pytest test for binary_search(xs, target), which returns an index or -1. Cover empty input, one element (found and not found), first, last and missing targets.",
        hint: "Use @pytest.mark.parametrize with three names: xs, target and expected.",
        solution: `import pytest
from mylib.searching import binary_search

@pytest.mark.parametrize("xs, target, expected", [
    ([], 3, -1), ([3], 3, 0), ([3], 4, -1),
    ([1, 3, 5, 7], 1, 0), ([1, 3, 5, 7], 7, 3), ([1, 3, 5, 7], 4, -1),
])
def test_binary_search(xs, target, expected):
    assert binary_search(xs, target) == expected`,
      },
      {
        level: "medium",
        task: "Write growth(fn) that times fn on random lists of size 1,000, 2,000 and 4,000 and prints how many times slower each size is than the previous one. Run it on insertion sort and on merge sort.",
        hint: "Use time.perf_counter around one call, and pass a copy of the list.",
        solution: `import random, time

def growth(fn, sizes=(1000, 2000, 4000)):
    prev = None
    for n in sizes:
        xs = [random.random() for _ in range(n)]
        t0 = time.perf_counter(); fn(xs[:]); t = time.perf_counter() - t0
        if prev: print(f"n={n}: {t / prev:.1f}x the previous time")
        prev = t
# insertion sort: close to 4x per step (O(n^2))
# merge sort: a little over 2x per step (O(n log n))`,
      },
      {
        level: "hard",
        task: "Write a Hypothesis test that runs a random sequence of push and pop operations on your MinHeap and on heapq side by side, and checks they always agree. Assume MinHeap supports len().",
        hint: "Let each operation be an integer (push it) or None (pop if not empty).",
        solution: `import heapq
from hypothesis import given, strategies as st
from mylib.structures.heap import MinHeap

@given(st.lists(st.one_of(st.integers(), st.none())))
def test_heap_matches_heapq(ops):
    mine, ref = MinHeap(), []
    for op in ops:
        if op is not None:
            mine.push(op); heapq.heappush(ref, op)
        elif ref:
            assert mine.pop() == heapq.heappop(ref)
    assert len(mine) == len(ref)`,
      },
    ],
    faq: [
      { q: "Why write my own heap or sort when Python already has heapq and sorted?", a: "To learn and to prove you understand them. In real projects you should use the built-ins, which are faster and well tested; your library's benchmarks will show that clearly." },
      { q: "Do I need 100% test coverage?", a: "No. Coverage tells you which lines ran, not whether the answers were checked. Aim for every public function tested on its edge cases plus a property test against a reference." },
      { q: "Should I publish my library on PyPI?", a: "It is optional. A clean GitHub repository with a README, tests and passing CI is what most reviewers look at. If you publish, choose a unique name and try TestPyPI first." },
    ],
  },

  "dsa-capstone/timed-problem-sets": {
    plain: [
      "Knowing patterns is one skill. Using them on a new problem, with a clock running and someone watching, is another. Timed sessions train that second skill. You pick problems you have not seen, set a timer for 30 to 45 minutes each, and work through them with the same steps every time.",
      "The steps are simple: clarify the problem, try small examples by hand, plan an approach and its cost, write the code, then test it. Having a fixed routine means you never freeze. When you are stuck, you just move to the next step of the routine.",
      "Talk out loud while you work, even when alone. In an interview, the person listening wants to see how you think, not only the final code. Practising this makes it natural, and saying your idea aloud often reveals a flaw before you write a line.",
      "After each session, write down what went wrong in a mistake log. A week later, solve the failed problems again from a blank file. This is where most of the learning happens.",
    ],
    deepDive: [
      {
        heading: "Let the constraints choose the complexity",
        body: "The input limits in a problem are a strong hint about the expected solution. A useful rule: a fast compiled language does roughly 10^8 simple operations per second, and Python closer to 10^7. Most judges allow one or two seconds.\n\nSo if n can be 10^5, an O(n^2) solution needs about 10^10 steps and will time out; you need O(n log n) or O(n). If n is at most 20, 2^20 is about a million, so trying every subset is fine. If n is at most 500, O(n^3) is about 1.25 * 10^8, which is borderline in Python. If n can be 10^9 or more, you cannot even read every value, so think O(log n) (binary search) or a formula.\n\nRead the limits before planning. They tell you whether to look for a smarter pattern at all, and which family to look in.",
        visual: {
          type: "tree",
          title: "Typical target complexity by input size",
          root: "Largest n",
          children: [
            { label: "Up to about 12", children: ["O(n!)", "All permutations"] },
            { label: "Up to about 20", children: ["O(2^n)", "All subsets, bitmask DP"] },
            { label: "Up to about 500", children: ["O(n^3)", "Interval or Floyd style DP"] },
            { label: "Up to about 5,000", children: ["O(n^2)", "Pairs, 2D DP"] },
            { label: "Up to about 10^6", children: ["O(n log n) or O(n)", "Sort, heap, two pointers, hashing"] },
            { label: "10^9 and above", children: ["O(log n) or O(1)", "Binary search, math"] },
          ],
        },
      },
      {
        heading: "Clarify: the questions worth asking",
        body: "Spend the first few minutes making the problem precise. Ask about size: how large can n get, and how large are the values? Ask about shape: can the input be empty, can it contain negatives or duplicates, is it already sorted? Ask about the output: return indexes or values, any order or a specific one, what to return when there is no answer, and how to break ties. Ask about rules: may you change the input in place, and is extra memory allowed?\n\nThen restate the problem in your own words and work one small example by hand, ideally one you make up, not the one given. Many wrong solutions come from a misunderstanding that a single hand-worked example would have exposed.\n\nAlone, write the answers as comments at the top of your file. It builds the habit for real interviews, where the interviewer often hides a detail on purpose to see if you ask.",
        bullets: ["Size of n and of values", "Empty, negative, duplicate, sorted?", "Exact output format and ties", "In place allowed? Memory limits?"],
      },
      {
        heading: "Plan and think out loud",
        body: "Always say the brute force first, with its complexity: \"Checking every pair is O(n^2), which is too slow for n = 10^5.\" It proves you have a correct baseline and frames the goal. Next, find the bottleneck: what work is repeated? Repeated lookups suggest a hash map. Repeated range sums suggest prefix sums. Repeated \"best so far\" choices suggest a heap or greedy. Overlapping subproblems suggest dynamic programming.\n\nState the final plan and its time and space before coding, and get agreement if someone is listening. While coding, narrate briefly: what this loop maintains, why this index starts at 1. When stuck, say what you tried and why it fails; that often unlocks the next idea, and interviewers can only give hints when they know where you are.\n\nUse clear names like left, right and best, not i2 and tmp. Clean code is easier to test and to explain.",
      },
      {
        heading: "Test like a reviewer",
        body: "Do not run the code in your head the way you meant it to work. Trace it line by line on a small input and write down the variables after each loop step, like a table. This catches most off-by-one errors.\n\nThen try edge cases: empty input, one element, two elements, all equal values, the answer at the very start or end, and the largest allowed input for complexity. Python has a few traps of its own: recursion stops at a depth of about 1000 unless you raise sys.setrecursionlimit, [[0] * m] * n creates n references to the same row, and a mutable default argument such as def f(memo={}) is shared across calls.\n\nIf you find a bug, fix it calmly and re-run the same trace. In an interview, finding your own bug is a positive signal, not a failure.",
        bullets: ["Trace variables in a table", "Empty, single, duplicates, extremes", "[[0] * m for _ in range(n)], not [[0] * m] * n", "Recursion depth limit is about 1000 by default"],
      },
      {
        heading: "Sessions, mistake log and the one-week revisit",
        body: "A good session mixes topics so you practise recognising the pattern, not just applying the one from today's chapter. For example: three medium problems in 2 hours, drawn from different topics, with a hard stop at 45 minutes each.\n\nWhen time runs out, stop. Read a good solution, understand why it works, then close it and write it yourself. Log the problem: date, pattern, what went wrong, the one insight you were missing, and a date to retry. Classify the failure: did not recognise the pattern, chose a wrong approach, had the idea but a bug, or was too slow. Each type needs a different fix.\n\nA week later, solve it again from a blank file, under the timer. If you solve it, schedule another review further out. If not, reset and try again in a few days.",
        visual: {
          type: "cycle",
          title: "The practice loop",
          steps: [
            { label: "Attempt", detail: "Timed, from a blank file." },
            { label: "Stop at the limit", detail: "Solved or not." },
            { label: "Study", detail: "Understand the missing insight." },
            { label: "Log", detail: "Pattern, failure type, retry date." },
            { label: "Re-solve in a week", detail: "Without looking at notes." },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three common reasons a timed problem fails",
        columns: [
          { title: "Did not see the pattern", points: ["Signal was missed", "Fix: drill pattern recognition", "Add to the cheat sheet"] },
          { title: "Right idea, buggy code", points: ["Off-by-one or edge case", "Fix: trace a table before running", "Write the bug in the log"] },
          { title: "Too slow to finish", points: ["Spent too long planning or coding", "Fix: stricter time boxes", "Practise standard templates"] },
        ],
      },
    ],
    examples: [
      {
        title: "One 40-minute run: top k frequent elements",
        explanation: "Clarify (4 min): n up to 10^5, k is valid, any order is fine, ties can go either way. Example: [1, 1, 1, 2, 2, 3] with k = 2 gives [1, 2]. Plan (6 min): counting is O(n). Sorting the counts is O(n log n); a heap of size k is O(n log k); but counts are between 1 and n, so bucket them by count for O(n). Code (15 min): below. Test (10 min): trace the example; then k equal to the number of distinct values, all elements equal, and one element.",
        code: {
          lang: "python",
          code: `from collections import Counter

def top_k_frequent(nums, k):      # O(n) time and space
    count = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for x, c in count.items():
        buckets[c].append(x)
    out = []
    for c in range(len(buckets) - 1, 0, -1):
        for x in buckets[c]:
            out.append(x)
            if len(out) == k: return out
    return out

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))   # [1, 2]`,
        },
      },
      {
        title: "Turning a failed attempt into a useful log entry",
        explanation: "You spent 45 minutes on \"subarray sum equals k\" and your sliding window gave wrong answers. A weak log entry says \"wrong answer\". A useful one names the cause and the insight: the window broke because numbers can be negative. Step 1: write the entry. Step 2: study the prefix sum plus hash map approach and re-code it from memory. Step 3: set the retry date a week out. Step 4: add \"negatives present, so no sliding window\" to your pattern cheat sheet.",
        code: {
          lang: "text",
          code: `date:      2026-11-03
problem:   Subarray Sum Equals K
pattern:   prefix sums + hash map
failure:   wrong approach (tried sliding window)
insight:   negatives break window monotonicity;
           count[prefix - k] gives the answer in O(n)
retry on:  2026-11-10
result:    solved in 18 min`,
        },
      },
    ],
    cheatSheet: [
      "Routine: clarify, examples, plan with Big-O, code, test; never skip clarify",
      "n up to 10^5 or 10^6 needs O(n log n) or better; O(n^2) is about 10^10 steps",
      "n up to 20 allows O(2^n); n up to 12 allows O(n!)",
      "Say the brute force and its cost first, then name the bottleneck",
      "Trace a small input in a variable table before running anything",
      "Python traps: recursion limit near 1000, [[0] * m] * n shares rows, mutable defaults",
      "Hard stop at the time limit; study, log the insight, re-solve in a week",
    ],
    quiz: [
      {
        q: "A problem says n is at most 20. Which approach is usually acceptable?",
        options: ["Only O(n)", "Only O(log n)", "O(n^4) is required", "O(2^n), such as trying every subset"],
        answer: 3,
        why: "2^20 is about one million, which runs in well under a second.",
      },
      {
        q: "What should you do in the first minutes of a timed problem?",
        options: ["Clarify constraints and edge cases, and work an example by hand", "Start coding the most likely pattern", "Look up a similar problem", "Write the tests for the final solution"],
        answer: 0,
        why: "A misunderstood problem wastes the whole session, and constraints guide the plan.",
      },
      {
        q: "n can be 10^5 and your idea is O(n^2). What is the right move?",
        options: ["Code it, it will be fine", "Look for an O(n log n) or O(n) idea, since O(n^2) is about 10^10 steps", "Switch to a faster laptop", "Use recursion instead of loops"],
        answer: 1,
        why: "About 10^10 operations is far beyond a typical one or two second limit.",
      },
      {
        q: "Which mistake-log entry is most useful?",
        options: ["Wrong answer", "Hard problem, skip", "Negative numbers broke my sliding window; prefix sums with a hash map is O(n)", "Took 45 minutes"],
        answer: 2,
        why: "It records the cause and the missing insight, which is what you need to recognise next time.",
      },
      {
        q: "In Python, what does grid = [[0] * 3] * 3 followed by grid[0][0] = 1 produce?",
        options: ["Only the first row changes", "All three rows show 1 in the first column", "A TypeError", "The grid is unchanged"],
        answer: 1,
        why: "The outer * copies references to the same inner list, so all rows are one object.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For each limit, write the target complexity: (a) n at most 15, (b) n at most 2,000, (c) n at most 2 * 10^5, (d) n at most 10^18.",
        hint: "Use the rule of thumb of about 10^7 to 10^8 simple steps per second.",
        solution: "(a) O(2^n) or O(2^n * n) is fine: about 32,768 subsets.\n(b) O(n^2): about 4 million steps.\n(c) O(n log n) or O(n): O(n^2) would be 4 * 10^10.\n(d) O(log n) or O(1): binary search or a formula.",
      },
      {
        level: "medium",
        task: "Before coding \"longest consecutive sequence\" (unsorted list, return the length of the longest run of consecutive integers in O(n)), spend 10 minutes writing the clarify questions, the brute force with its cost, and the better plan.",
        hint: "A run can only start at x if x - 1 is not present.",
        solution: "Clarify: empty list? (return 0) duplicates? (count once) negatives? (yes)\nBrute force: sort, then scan for runs: O(n log n).\nBetter: put everything in a set (O(n)).\nFor each x with x - 1 not in the set, count x, x + 1, ... while present.\nEach number is visited at most twice, so O(n) time and O(n) space.\nTests: [], [5], [1, 2, 2, 3], [100, 4, 200, 1, 3, 2] -> 4.",
      },
      {
        level: "hard",
        task: "Solve \"merge intervals\" in 30 minutes using the full routine, and finish with asserts for the edge cases you found.",
        hint: "Sort by start. Overlap happens when the next start is at most the current end.",
        solution: `def merge(intervals):              # O(n log n)
    intervals.sort(key=lambda iv: iv[0])
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out
assert merge([]) == [] and merge([[1, 4], [4, 5]]) == [[1, 5]]
assert merge([[1, 10], [2, 3]]) == [[1, 10]]
assert merge([[8, 10], [1, 3], [2, 6]]) == [[1, 6], [8, 10]]`,
      },
    ],
    faq: [
      { q: "How many problems should I solve per day?", a: "Quality beats count. Two or three medium problems done with the full routine, a mistake log and a later re-solve teach more than ten problems where you read the answer early." },
      { q: "When should I look at the solution?", a: "After the time limit, or after about 15 to 20 minutes with no new idea at all. Then study it, close it and write it yourself." },
      { q: "Is it okay to solve problems in Python for interviews?", a: "Yes. Most companies allow it, and its short syntax saves time. Know its built-ins well (collections, heapq, bisect) and the costs of common operations like list.pop(0), which is O(n)." },
      { q: "How do I practise explaining out loud when I study alone?", a: "Talk to yourself or record your screen with audio, then watch one recording a week. Long silences and unexplained jumps in the recording show exactly what to work on." },
    ],
  },

  "dsa-capstone/pattern-review": {
    plain: [
      "After many weeks of practice, you have seen hundreds of problems. The good news: most of them are built from a few dozen ideas, called patterns. Two pointers, sliding window, BFS, heap, binary search, dynamic programming and so on. If you can match a new problem to the right pattern quickly, you are most of the way there.",
      "A pattern cheat sheet is your map. For each pattern, write the clues in a problem statement that point to it (the signals), a short code skeleton, its usual cost, and one classic problem that shows it best.",
      "Memory fades quickly if you do not use it. Spaced repetition fights this: you review something just as you are about to forget it, and each successful review lets you wait longer before the next one. One day, then three, then a week, then three weeks.",
      "Review does not mean rereading. It means solving again from a blank page. Picking one representative problem per pattern and re-solving it on a schedule keeps every topic fresh with little time.",
    ],
    deepDive: [
      {
        heading: "Signals that point to a pattern",
        body: "Look for words and limits in the statement. \"Sorted\" suggests binary search or two pointers. \"Contiguous subarray\" or \"substring\" suggests sliding window or prefix sums. \"Top k\", \"kth largest\" or \"merge k lists\" suggests a heap. \"Next greater\" or \"previous smaller\" suggests a monotonic stack. \"Intervals\" usually means sort by start first.\n\nGraph words matter too. \"Fewest steps\" in an unweighted grid means BFS. Weighted with non-negative costs means Dijkstra. \"Prerequisites\" or \"order of tasks\" means topological sort. \"Connected groups\" with merging means union-find. \"Prefix\" or \"autocomplete\" means a trie.\n\nTwo signals are easy to miss. \"Minimum largest\" or \"smallest value that works\" often means binary search on the answer: guess a value, check if it is feasible, and narrow down. \"Count the ways\" or \"best value with choices at each step\" means dynamic programming.",
        bullets: ["Sorted: binary search or two pointers", "Next greater: monotonic stack", "Prerequisites: topological sort", "Smallest value that works: binary search on the answer"],
      },
      {
        heading: "What goes on one cheat sheet card",
        body: "Keep each card short enough to read in a minute. It has five parts. Signals: the phrases from the last section. Template: the 5 to 10 line skeleton, such as the deque loop for BFS or the while left <= right loop for binary search. Cost: the time and space of the template, such as O(V + E) for BFS. Classic problem: one problem that shows the pattern clearly, which you will re-solve during review. Trap: the mistake you personally made last time, taken from your mistake log.\n\nThe trap line is the most valuable part, because it is specific to you. Examples: \"marked visited when popping, not when pushing, so BFS added nodes twice\" or \"forgot that sliding window fails with negative numbers\".\n\nWrite cards by hand or in a plain text file. The act of writing them is part of the learning.",
        visual: {
          type: "layers",
          title: "Anatomy of a pattern card",
          layers: [
            { label: "Signals", detail: "Phrases that suggest this pattern." },
            { label: "Template", detail: "5 to 10 lines of skeleton code." },
            { label: "Cost", detail: "Time and space of the template." },
            { label: "Classic problem", detail: "The one you re-solve in review." },
            { label: "My trap", detail: "The mistake you made last time." },
          ],
        },
      },
      {
        heading: "One representative problem per pattern",
        body: "Pick one problem per pattern that contains the core idea with little extra noise. Good choices from LeetCode: Two Sum II (two pointers), Longest Substring Without Repeating Characters (sliding window), Koko Eating Bananas (binary search on the answer), Daily Temperatures (monotonic stack), Kth Largest Element in an Array (heap), Merge Intervals (intervals), Number of Islands (grid DFS or BFS), Course Schedule (topological sort), Network Delay Time (Dijkstra), Redundant Connection (union-find), Implement Trie (trie), Subsets (backtracking), Coin Change (1D DP) and Longest Common Subsequence (2D DP).\n\nIn review, re-solve each from a blank file within 20 minutes, without notes. If it takes longer or fails, that pattern goes back to the short interval and gets one extra new problem that week.",
      },
      {
        heading: "How spaced repetition works",
        body: "Memory of a fact decays quickly at first and then more slowly, a shape psychologists call the forgetting curve. Each time you successfully recall something, the decay slows down. Spaced repetition uses this: review an item just before you would forget it, then wait longer next time.\n\nA simple system: start at 1 day. After each review, grade yourself. If you failed, reset the interval to 1 day. If it was hard, grow the interval a little (about 1.2 times). If it was fine, multiply it by about 2.5. The 2.5 comes from SM-2, the algorithm behind early SuperMemo and the basis of Anki's classic scheduler. So a pattern you know well goes roughly 1, 3, 7, 18, 45 days.\n\nYou can use Anki, a spreadsheet, or a small script. The tool matters less than doing the reviews on the day they are due.",
        visual: {
          type: "cycle",
          title: "One review card's life",
          steps: [
            { label: "Due today", detail: "Re-solve the classic problem." },
            { label: "Grade", detail: "Fail, hard or good." },
            { label: "Set interval", detail: "Fail: 1 day. Good: about x2.5." },
            { label: "Wait", detail: "Work on new problems meanwhile." },
          ],
        },
      },
      {
        heading: "Mixing review into a weekly plan",
        body: "Practising one topic at a time (blocked practice) feels productive, because the pattern is always the one from today's chapter. But in an interview, the hard part is deciding which pattern applies. Mixing topics (interleaved practice) trains exactly that decision, and learning research consistently finds it helps more with this kind of choice, even though it feels harder.\n\nA sustainable week might look like this: on most days, first do whatever review cards are due, then one or two new problems from mixed topics. Once a week, do a timed set of three unseen problems. Once a week, read your mistake log and update the trap lines on your cards.\n\nKeep a simple list of patterns with a confidence mark next to each. Any pattern marked weak gets one extra new problem per week until it is solid.",
        bullets: ["Due reviews first, then new problems", "Mixed topics, not one chapter at a time", "Weekly timed set and weekly log review"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "More signals: graphs, stacks and searching the answer",
        root: "Statement says",
        children: [
          { label: "Prerequisites or task order", children: ["Topological sort", "Kahn's algorithm, O(V + E)"] },
          { label: "Weighted shortest path", children: ["Dijkstra if weights are non-negative", "Bellman-Ford if negatives"] },
          { label: "Groups that merge", children: ["Union-find", "Near O(1) per operation"] },
          { label: "Next greater or smaller", children: ["Monotonic stack", "O(n)"] },
          { label: "Smallest value that works", children: ["Binary search on the answer", "Needs a monotonic check"] },
          { label: "Prefix or autocomplete", children: ["Trie", "O(length of word) per lookup"] },
        ],
      },
    ],
    examples: [
      {
        title: "Mapping a new problem: minimum days to make m bouquets",
        explanation: "Flowers bloom on day bloom[i]. A bouquet needs k adjacent bloomed flowers; you need m bouquets. What is the earliest day? Signal: \"minimum day such that something is possible\", and if day d works, every later day works too. That is binary search on the answer. Step 1: if m * k exceeds the number of flowers, return -1. Step 2: write ok(day), a linear scan counting runs. Step 3: binary search days between min(bloom) and max(bloom). Cost: O(n log(max - min)).",
        code: {
          lang: "python",
          code: `def min_days(bloom, m, k):
    if m * k > len(bloom): return -1
    def ok(day):                      # O(n) feasibility check
        made = run = 0
        for b in bloom:
            run = run + 1 if b <= day else 0
            if run == k: made += 1; run = 0
        return made >= m
    lo, hi = min(bloom), max(bloom)
    while lo < hi:                    # smallest day where ok is True
        mid = (lo + hi) // 2
        if ok(mid): hi = mid
        else: lo = mid + 1
    return lo
print(min_days([1, 10, 3, 10, 2], 3, 1))   # 3`,
        },
      },
      {
        title: "A tiny spaced-repetition scheduler",
        explanation: "You keep one card per pattern. After re-solving its classic problem, you grade the attempt and the function returns the next interval. Starting at 1 day, a card graded good every time goes 2, 5, 12 days (Python rounds 2.5 down to 2), while a failure sends it back to 1. Step 1: grade honestly. Step 2: store the due date. Step 3: each morning, do the due cards before anything new.",
        code: {
          lang: "python",
          code: `from datetime import date, timedelta

def next_interval(days, grade):
    if grade == "fail": return 1
    if grade == "hard": return max(1, round(days * 1.2))
    return max(2, round(days * 2.5))          # "good"

days = 1
for grade in ["good", "good", "good", "fail", "good"]:
    days = next_interval(days, grade)
    print(grade, days, date.today() + timedelta(days=days))`,
        },
      },
    ],
    cheatSheet: [
      "Sorted input: binary search or two pointers; contiguous range: sliding window or prefix sums",
      "Top k or kth largest: heap of size k, O(n log k)",
      "Next greater or smaller element: monotonic stack, O(n)",
      "Prerequisites or ordering: topological sort; merging groups: union-find",
      "Smallest value that works and a monotonic check: binary search on the answer",
      "Card = signals, template, cost, classic problem, my trap",
      "Review intervals: fail resets to 1 day, good multiplies by about 2.5",
      "Review means re-solving from a blank file, not rereading",
    ],
    quiz: [
      {
        q: "\"Find the minimum ship capacity so all packages ship within D days.\" Which pattern fits best?",
        options: ["Sliding window", "Binary search on the answer", "Topological sort", "Backtracking"],
        answer: 1,
        why: "If capacity c works, every larger capacity works, so you can binary search the smallest feasible c.",
      },
      {
        q: "\"For each day, how many days until a warmer temperature?\" Which pattern fits?",
        options: ["Heap", "Union-find", "Monotonic stack", "Trie"],
        answer: 2,
        why: "This is a next greater element problem, solved in O(n) with a stack of indexes.",
      },
      {
        q: "In a spaced-repetition system, what happens when you fail a review?",
        options: ["The interval resets to a short one, such as 1 day", "The card is deleted", "The interval doubles", "Nothing changes"],
        answer: 0,
        why: "A failure shows the memory has faded, so you need to see it again soon.",
      },
      {
        q: "\"Courses have prerequisites; return an order to take them all.\" Which pattern fits?",
        options: ["Dijkstra", "Sliding window", "Binary search", "Topological sort"],
        answer: 3,
        why: "Prerequisites form a directed graph, and a valid order exists only if it has no cycle.",
      },
      {
        q: "Why mix topics in practice instead of doing one topic per week?",
        options: ["It is faster to code", "It trains choosing the pattern, which is the hard part in interviews", "It avoids writing tests", "Interviewers only ask mixed problems"],
        answer: 1,
        why: "Blocked practice tells you the pattern in advance; interleaving makes you identify it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Name the pattern for each: (a) longest substring with at most k distinct letters, (b) number of islands in a grid, (c) kth largest in a stream, (d) all subsets of a set, (e) cheapest flight with non-negative prices, (f) can you split the array into two equal-sum halves.",
        hint: "Look for the signal words in each statement.",
        solution: "(a) variable sliding window with a count map\n(b) grid DFS or BFS (or union-find)\n(c) min-heap of size k\n(d) backtracking (or bitmask), 2^n results\n(e) Dijkstra\n(f) dynamic programming (0/1 knapsack on sum / 2)",
      },
      {
        level: "medium",
        task: "Write the template for your monotonic stack card using Daily Temperatures: return, for each day, how many days until a warmer one (0 if none).",
        hint: "Keep a stack of indexes whose temperatures are decreasing; a warmer day pops them.",
        solution: `def daily_temperatures(t):          # O(n) time, O(n) space
    ans, stack = [0] * len(t), []     # stack of indexes, temps decreasing
    for i, x in enumerate(t):
        while stack and t[stack[-1]] < x:
            j = stack.pop()
            ans[j] = i - j
        stack.append(i)
    return ans
# Trap: store indexes, not values, so you can compute distances.`,
      },
      {
        level: "hard",
        task: "Write a script that reads reviews.csv (columns: problem, pattern, due as YYYY-MM-DD) and prints the cards due today or earlier, oldest first.",
        hint: "csv.DictReader gives one dict per row, and date.fromisoformat parses the date.",
        solution: `import csv
from datetime import date

with open("reviews.csv", newline="") as f:
    rows = list(csv.DictReader(f))
due = [r for r in rows if date.fromisoformat(r["due"]) <= date.today()]
for r in sorted(due, key=lambda r: r["due"]):
    print(f'{r["due"]}  {r["pattern"]:<16} {r["problem"]}')
print(len(due), "cards due")`,
      },
    ],
    faq: [
      { q: "How many DSA patterns are there?", a: "Lists vary, but around 15 to 25 core patterns cover most interview problems. What matters is that your own cheat sheet covers every pattern you have studied, each with one classic problem." },
      { q: "Should I use Anki for coding problems?", a: "It works well if each card asks you to re-solve a problem or write a template, not just to recognise an answer. A spreadsheet or a small script with due dates works too." },
      { q: "What should I do when a new problem matches no pattern I know?", a: "Start from brute force, find the repeated work, and ask which structure removes it. Afterwards, add the problem to your cheat sheet as a new pattern or as a variation of an existing one." },
    ],
  },
};

export default extra;
