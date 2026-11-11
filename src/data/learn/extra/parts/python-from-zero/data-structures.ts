import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "data-structures/lists-tuples": {
    plain: [
      "A list holds many values in a fixed order, written inside square brackets: [3, 1, 2]. Lists can grow, shrink and change after you create them, which is what mutable means. They can hold any type, even a mix, but most lists hold one kind of thing, such as names or prices.",
      "Positions start at 0, and negative positions count from the end, so items[-1] is the last item. Slicing, items[1:3], cuts out a piece as a new list. These are the same rules you already know from strings.",
      "Sorting comes in two forms. sorted(items) gives you a new sorted list and leaves the original alone. items.sort() sorts the list itself and returns None. Both accept a key function that says what to compare: the length, one field of a record, or a lower-case version of a word.",
      "A tuple is like a list that cannot change. Use it for a small record where each position has a meaning, like (name, age) or (x, y). You can unpack a tuple into separate names in one step: name, age = person. Functions often return tuples for exactly this reason.",
    ],
    deepDive: [
      {
        heading: "How a list is stored, and what each operation costs",
        body: "In CPython, the standard Python, a list is a dynamic array: one block of memory holding references (pointers) to the item objects, side by side. That layout explains its speed.\n\nReading or writing items[i] jumps straight to position i, so it takes the same time for any size. append() is also fast: the list reserves a little spare room, and only occasionally has to move to a bigger block. Working at the front is slow, though. insert(0, x) and pop(0) must shift every other item one place, so they get slower as the list grows. x in items and items.remove(x) scan from the start until they find a match.\n\nFor a queue where you add at one end and remove at the other, use collections.deque, whose appendleft() and popleft() are fast. For frequent membership tests on big data, use a set.",
        visual: {
          type: "compare",
          title: "Fast vs slow list operations",
          columns: [
            { title: "Fast: same time at any size", points: ["items[i] and items[i] = x", "append(x)", "pop() from the end", "len(items)"] },
            { title: "Slow: time grows with length", points: ["insert(0, x)", "pop(0)", "remove(x)", "x in items"] },
          ],
        },
      },
      {
        heading: "Slicing in full",
        body: "A slice has three parts, items[start:stop:step], and every part is optional. A missing start means the beginning, a missing stop means the end, and the step defaults to 1. A negative step walks backwards, so items[::-1] is a reversed copy. Slices never raise IndexError: items[5:100] on a short list just returns what exists, often an empty list.\n\nA slice always builds a new list (a shallow copy), so changing the slice does not change the original.\n\nSlices also work on the left side of =. items[1:3] = [\"a\", \"b\", \"c\"] replaces two items with three, so the list can grow or shrink. del items[::2] deletes every second item. items[:] = [] empties the list in place, which matters when other names point at the same list: they all see it emptied, while items = [] would only move one name to a new list.",
        bullets: [
          "items[:3] is the first three, items[-3:] the last three",
          "items[::2] is every second item",
          "items[:] is a quick shallow copy",
        ],
      },
      {
        heading: "Sorting with key functions",
        body: "sorted() accepts any iterable (a list, tuple, set, dict keys, even a string) and always returns a list. It uses an algorithm called Timsort, which takes O(n log n) time and is stable: items that compare equal keep their original order.\n\nThe key function is called once per item, and the items are ordered by those results. key=len sorts words by length, key=str.lower ignores case, and key=lambda p: p[1] sorts records by their second field. Return a tuple to sort by several things: key=lambda p: (p[1], -p[2]) sorts by field 1, then by field 2 in descending order (the minus sign flips numbers). reverse=True reverses the whole order.\n\nmin() and max() take the same key argument, so max(staff, key=lambda s: s[2]) finds the best-paid person without sorting. Sorting a list that mixes types that cannot be ordered, such as ints and strings, raises TypeError.",
        visual: {
          type: "flow",
          title: "What sorted(words, key=len) does",
          steps: [
            { label: "Call key on each item", detail: "len(\"kiwi\") is 4, len(\"fig\") is 3" },
            { label: "Compare the keys", detail: "The words themselves are not compared" },
            { label: "Keep ties in order", detail: "Stable: equal keys stay as they were" },
            { label: "Build a new list", detail: "The original list is unchanged" },
          ],
        },
      },
      {
        heading: "Tuples, packing and unpacking",
        body: "It is the comma that makes a tuple, not the parentheses: t = 1, 2 is a tuple, and a one-item tuple needs a trailing comma, (5,). Building a tuple like this is called packing; pulling it apart is unpacking.\n\nUnpacking needs the counts to match, or you get ValueError. A starred name collects the rest into a list: first, *middle, last = [1, 2, 3, 4, 5] gives 1, [2, 3, 4] and 5. Unpacking also works in for loops (for name, age in people) and for nested data, and it is how a, b = b, a swaps two values.\n\nA tuple cannot change, but the objects inside it can. A tuple holding a list can still see that list change, and such a tuple is not hashable. A tuple of numbers or strings is hashable, so it can be a dict key: {(0, 0): \"origin\"}.\n\nChoose by meaning: a list for a collection of similar things that changes, a tuple for one fixed record. For records with many fields, a named tuple or a dataclass makes the fields readable by name.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "List methods by job",
        root: "list methods",
        children: [
          { label: "Add", children: ["append(x): one item at the end", "extend(other): every item of other", "insert(i, x): at position i"] },
          { label: "Remove", children: ["remove(x): first match by value", "pop(i): by index, returns it", "clear(): everything"] },
          { label: "Find", children: ["index(x): position or ValueError", "count(x): how many", "x in items: True or False"] },
          { label: "Reorder", children: ["sort(): in place, returns None", "reverse(): in place"] },
          { label: "Copy", children: ["copy() or items[:]", "Shallow: nested items are shared"] },
        ],
      },
      {
        type: "compare",
        title: "append vs extend vs +",
        columns: [
          { title: "a.append([4, 5])", points: ["Adds one item: the list itself", "a becomes [1, 2, [4, 5]]", "Changes a in place"] },
          { title: "a.extend([4, 5])", points: ["Adds each item separately", "a becomes [1, 2, 4, 5]", "Changes a in place"] },
          { title: "a + [4, 5]", points: ["Builds a brand-new list", "a itself is unchanged", "Assign it to keep the result"] },
        ],
      },
    ],
    examples: [
      {
        title: "Sorting staff by department, then salary",
        explanation: "Each record is a tuple (name, department, salary). Step 1: the key returns a tuple, so Python sorts by department first and, for equal departments, by the second element. Step 2: -s[2] turns a high salary into a low number, giving descending pay inside each department. Step 3: Bo and Di have the same department and pay, so the stable sort keeps them in their original order. Step 4: max() with the same style of key finds the top earner without sorting at all.",
        code: {
          lang: "python",
          code: "staff = [(\"Ana\", \"dev\", 5200), (\"Bo\", \"ops\", 4100),\n         (\"Cy\", \"dev\", 6100), (\"Di\", \"ops\", 4100)]\n\nby_dept = sorted(staff, key=lambda s: (s[1], -s[2]))\nfor name, dept, pay in by_dept:\n    print(f\"{dept:<5}{name:<4}{pay}\")\n# dev  Cy  6100\n# dev  Ana 5200\n# ops  Bo  4100\n# ops  Di  4100\n\ntop = max(staff, key=lambda s: s[2])\nprint(top[0])   # Cy",
        },
      },
      {
        title: "A leaderboard with slicing and star unpacking",
        explanation: "You have raw scores and want the podium. Step 1: sorted(..., reverse=True) puts the highest first without touching the original list. Step 2: [:3] takes the top three; if there were fewer scores, the slice would simply be shorter. Step 3: star unpacking separates the winner from the rest. Step 4: [-1] gives the lowest score and [::2] every second one, all without loops or index arithmetic.",
        code: {
          lang: "python",
          code: "scores = [72, 95, 88, 61, 99, 80]\nranked = sorted(scores, reverse=True)   # [99, 95, 88, 80, 72, 61]\n\ntop3 = ranked[:3]\nfirst, *others = top3\nprint(first, others)     # 99 [95, 88]\nprint(ranked[-1])        # 61, the lowest\nprint(ranked[::2])       # [99, 88, 72]\nprint(scores)            # unchanged: [72, 95, 88, 61, 99, 80]",
        },
      },
    ],
    cheatSheet: [
      "items[-1] is the last item, items[-2:] the last two, items[::-1] a reversed copy",
      "append(x) adds one item; extend(other) adds every item of other",
      "items.pop() removes and returns the last item; pop(0) is slow on big lists, use deque",
      "sorted(people, key=lambda p: (p[1], -p[2])) sorts by two fields, the second descending",
      "Python's sort is stable: items with equal keys keep their original order",
      "first, *rest = items splits off the first item and puts the rest in a list",
      "t = 5, is a one-item tuple: the comma makes the tuple, not the parentheses",
      "items[:] = [] empties a list in place, so every other name sees the change",
    ],
    quiz: [
      {
        q: "nums = [1, 2, 3], then nums.append([4, 5]). What is len(nums)?",
        options: ["5", "4", "3", "TypeError"],
        answer: 1,
        why: "append adds its argument as one item, here a nested list; extend would add two items.",
      },
      {
        q: "What is [10, 20, 30, 40, 50][1:4:2]?",
        options: ["[20, 40]", "[20, 30, 40]", "[10, 30, 50]", "[20, 30]"],
        answer: 0,
        why: "Start at index 1, stop before 4, step 2: indexes 1 and 3.",
      },
      {
        q: "Which call sorts a list of names without caring about upper or lower case?",
        options: ["sorted(names, reverse=True)", "sorted(names).lower()", "names.sort(lower)", "sorted(names, key=str.lower)"],
        answer: 3,
        why: "The key function compares the lower-case versions while returning the original names.",
      },
      {
        q: "a, *b, c = [1, 2, 3, 4]. What is b?",
        options: ["2", "(2, 3)", "[2, 3]", "[1, 2, 3]"],
        answer: 2,
        why: "The starred name collects the middle items, always into a list.",
      },
      {
        q: "Why can (1, 2) be a dict key but [1, 2] cannot?",
        options: ["Tuples are faster", "Tuples are immutable and hashable; lists can change", "Lists are too long", "Dict keys must be strings"],
        answer: 1,
        why: "A key's hash must never change, and a list's contents can change at any time.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given nums = [4, 8, 15, 16, 23, 42], use only slicing to print the first three items, the last two, every second item and the whole list reversed.",
        hint: "[:3], [-2:], [::2] and [::-1].",
        solution: "nums = [4, 8, 15, 16, 23, 42]\nprint(nums[:3])    # [4, 8, 15]\nprint(nums[-2:])   # [23, 42]\nprint(nums[::2])   # [4, 15, 23]\nprint(nums[::-1])  # [42, 23, 16, 15, 8, 4]",
      },
      {
        level: "medium",
        task: "Sort people = [(\"Cy\", 30), (\"Ana\", 25), (\"Bo\", 30), (\"Di\", 25)] by age from oldest to youngest, and alphabetically by name for equal ages. Then get the first person's name with unpacking.",
        hint: "A tuple key with a negative age: (-age, name).",
        solution: "people = [(\"Cy\", 30), (\"Ana\", 25), (\"Bo\", 30), (\"Di\", 25)]\nordered = sorted(people, key=lambda p: (-p[1], p[0]))\nprint(ordered)  # [('Bo', 30), ('Cy', 30), ('Ana', 25), ('Di', 25)]\n\n(name, age), *_ = ordered\nprint(name)     # Bo",
      },
      {
        level: "hard",
        task: "Write rotate(items, k) that returns a new list rotated right by k places, so rotate([1, 2, 3, 4, 5], 2) is [4, 5, 1, 2, 3]. It must work when k is larger than the length and for an empty list, and use no loops.",
        hint: "k % len(items) handles big k; then glue two slices together.",
        solution: "def rotate(items, k):\n    if not items:\n        return []\n    k %= len(items)\n    return items[-k:] + items[:-k]\n\nassert rotate([1, 2, 3, 4, 5], 2) == [4, 5, 1, 2, 3]\nassert rotate([1, 2, 3], 7) == [3, 1, 2]\nassert rotate([1, 2, 3], 0) == [1, 2, 3]\nassert rotate([], 3) == []",
      },
    ],
    faq: [
      { q: "What is the difference between a Python list and an array?", a: "A list is a dynamic array of references that can hold any objects. The array module and NumPy arrays store one numeric type compactly, which is much better for large amounts of numbers." },
      { q: "How do I remove duplicates from a list but keep the order?", a: "Use list(dict.fromkeys(items)). Dicts keep insertion order, so the first copy of each item stays in place; set(items) also removes duplicates but loses the order." },
      { q: "Why does sort fail with TypeError: '<' not supported?", a: "The list mixes values that cannot be compared, such as numbers and strings or None. Clean the data first, or pass a key that returns comparable values." },
      { q: "Is a tuple faster than a list?", a: "Tuples are slightly smaller and quicker to create, but the difference rarely matters. Choose by meaning: a tuple for a fixed record, a list for a collection that changes." },
    ],
  },

  "data-structures/dicts-sets": {
    plain: [
      "A dictionary, or dict, stores pairs: a key and its value, like {\"apple\": 3, \"pear\": 5}. You look things up by key instead of by position, just as you look up a word in a real dictionary to find its meaning.",
      "Keys are unique. Assigning to a key that already exists replaces its value. Values can be anything, including lists or other dicts, but keys must be hashable, which in practice means unchangeable values such as strings, numbers or tuples.",
      "Dicts are the main tool for counting and grouping. You walk through your data once, and for each item you update an entry in the dict: add one to a count, or append to a list for that group. This one pattern solves a huge number of everyday problems.",
      "A set is a collection of unique items with no particular order: {\"red\", \"blue\"}. Adding something twice keeps one copy. Sets answer \"have I seen this before?\" very quickly and can compare groups: what is in both, in either, or in one but not the other.",
    ],
    deepDive: [
      {
        heading: "How hashing makes lookups fast",
        body: "A dict is a hash table. To store a key, Python calls hash(key) to get a number, uses that number to pick a slot in an internal table, and stores the key and value there. To find it again, it does the same calculation and jumps to the same slot, then confirms with == that it is really the right key. If two keys land on the same slot (a collision), Python tries other slots in a fixed sequence. On average a lookup takes the same time whether the dict holds ten items or ten million.\n\nTwo rules follow. A key's hash must never change, so mutable lists and dicts cannot be keys. And equal values must hash the same, which is why 1, 1.0 and True count as the same key: d[1] = \"a\" then d[True] = \"b\" leaves one entry.\n\nSince Python 3.7, dicts are guaranteed to keep keys in insertion order. Sets use the same kind of table, just without values.",
        visual: {
          type: "compare",
          title: "Finding one item: list vs dict or set",
          columns: [
            { title: "x in a list", points: ["Checks items one by one", "Time grows with the size", "1 million items: up to 1 million checks", "Works with any items"] },
            { title: "key in a dict or set", points: ["Hash jumps near the right slot", "About the same time at any size", "1 million items: a few checks", "Keys must be hashable"] },
          ],
        },
      },
      {
        heading: "Reading and changing dicts safely",
        body: "d[key] raises KeyError when the key is missing, which is right when a missing key means a bug. When it is normal for a key to be missing, use d.get(key, default), which returns the default and leaves d unchanged, or test first with key in d. d.setdefault(key, default) returns the existing value or inserts the default and returns it; that makes grouping a one-liner.\n\nTo remove entries, del d[key] raises KeyError if missing, while d.pop(key, None) does not. To merge, d.update(other) changes d in place, and since Python 3.9, a | b builds a new merged dict and a |= b updates a. In every merge, the right-hand side wins when both have the same key.\n\nd.keys(), d.values() and d.items() return views: live windows onto the dict that reflect later changes. Two dicts are equal when they hold the same pairs, regardless of order.",
        bullets: [
          "d.get(\"x\") returns None if \"x\" is missing",
          "d.pop(\"x\", None) removes \"x\" if present, no error",
          "defaults | user_settings: user settings win",
        ],
      },
      {
        heading: "Counting and grouping patterns",
        body: "Counting: counts[x] = counts.get(x, 0) + 1 inside a loop. get() supplies 0 the first time a key appears. collections.Counter does the same in one call, and Counter(words).most_common(3) gives the top three with their counts.\n\nGrouping: groups.setdefault(key, []).append(item). The first time a key appears, setdefault inserts an empty list; every time, it returns the list for that key, and append adds the item. collections.defaultdict(list) does this automatically: groups[key].append(item).\n\nTwo more recipes come up often. To sort a dict by value, sort its items: sorted(d.items(), key=lambda kv: kv[1], reverse=True). To find the key with the biggest value, max(d, key=d.get). To invert a dict, {v: k for k, v in d.items()} works, but if two keys share a value, only the last one survives.",
        visual: {
          type: "flow",
          title: "Grouping words by first letter",
          steps: [
            { label: "Take the next word", detail: "for w in words" },
            { label: "Compute its key", detail: "w[0], the first letter" },
            { label: "New key?", detail: "setdefault inserts an empty list" },
            { label: "Append the word", detail: "To the list for that key" },
            { label: "Result", detail: "A dict of lists, one per letter" },
          ],
        },
      },
      {
        heading: "Sets and set algebra",
        body: "Create a set with braces, {1, 2, 3}, or from any iterable with set(items). An empty set must be set(), because {} is an empty dict. add(x) inserts, discard(x) removes without complaining, and remove(x) raises KeyError if x is missing.\n\nThe operators are where sets shine. a | b is the union (in either), a & b the intersection (in both), a - b the difference (in a but not b) and a ^ b the symmetric difference (in exactly one). a <= b asks whether a is a subset of b, and a.isdisjoint(b) whether they share nothing. The method forms, such as a.union(some_list), accept any iterable, not just sets.\n\nSet items must be hashable, so you cannot put lists in a set. A frozenset is an immutable set that can itself be a dict key or an item of another set. Sets have no order, so print sorted(s) when you need stable output.",
        visual: {
          type: "tree",
          title: "Set operations on a = {1, 2, 3} and b = {3, 4}",
          root: "a and b",
          children: [
            { label: "a | b", children: ["{1, 2, 3, 4}", "In either"] },
            { label: "a & b", children: ["{3}", "In both"] },
            { label: "a - b", children: ["{1, 2}", "Only in a"] },
            { label: "b - a", children: ["{4}", "Only in b"] },
            { label: "a ^ b", children: ["{1, 2, 4}", "In exactly one"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to read a key that may be missing",
        columns: [
          { title: "d[key]", points: ["Returns the value", "Missing: raises KeyError", "Use when missing means a bug"] },
          { title: "d.get(key, default)", points: ["Returns value or default", "Never changes d", "Use for optional data"] },
          { title: "d.setdefault(key, default)", points: ["Returns value or default", "Inserts the default if missing", "Use for grouping into lists"] },
        ],
      },
    ],
    examples: [
      {
        title: "A word-frequency report",
        explanation: "You want the two most common words in a sentence, ignoring case. Step 1: lower() and split() turn the text into a clean list of words. Step 2: the loop counts each word with get(), which supplies 0 the first time. Step 3: sorting the (word, count) pairs by count, biggest first, and slicing [:2] gives the top two. Step 4: Counter produces the same answer in one line; knowing both lets you understand Counter instead of treating it as magic.",
        code: {
          lang: "python",
          code: "from collections import Counter\n\ntext = \"the cat and the hat and THE bat\"\nwords = text.lower().split()\n\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\n\ntop = sorted(counts.items(), key=lambda kv: kv[1], reverse=True)[:2]\nprint(top)                            # [('the', 3), ('and', 2)]\nprint(Counter(words).most_common(2))  # [('the', 3), ('and', 2)]",
        },
      },
      {
        title: "Comparing two guest lists",
        explanation: "Two events had overlapping guests. Step 1: store each list as a set, which also drops any accidental duplicates. Step 2: & finds people who came both days. Step 3: | gives everyone, so its length is the number of unique guests. Step 4: - finds Monday-only guests and ^ those who came exactly once. Step 5: wrap results in sorted() so the output order is predictable; sets themselves have no order.",
        code: {
          lang: "python",
          code: "monday = {\"ana\", \"bo\", \"cy\", \"di\"}\ntuesday = {\"cy\", \"di\", \"ed\"}\n\nprint(sorted(monday & tuesday))   # ['cy', 'di']  both days\nprint(len(monday | tuesday))      # 5  unique guests\nprint(sorted(monday - tuesday))   # ['ana', 'bo']  Monday only\nprint(sorted(monday ^ tuesday))   # ['ana', 'bo', 'ed']  exactly one day\nprint(\"ed\" in tuesday)            # True, a fast lookup",
        },
      },
    ],
    cheatSheet: [
      "d.get(k, 0) returns 0 instead of raising KeyError; d.setdefault(k, []) also inserts it",
      "merged = defaults | overrides (Python 3.9+): the right side wins on duplicate keys",
      "Dicts keep insertion order, guaranteed since Python 3.7",
      "sorted(d.items(), key=lambda kv: kv[1], reverse=True) sorts by value, biggest first",
      "Counter(words).most_common(3) gives the 3 most frequent items with their counts",
      "set() is an empty set; {} is an empty dict",
      "s.discard(x) never fails; s.remove(x) raises KeyError if x is missing",
      "1, 1.0 and True are the same dict key, because they are equal and hash the same",
    ],
    quiz: [
      {
        q: "d = {\"a\": 1}. What does d.get(\"b\") return?",
        options: ["KeyError", "0", "None", "\"\""],
        answer: 2,
        why: "get() returns None for a missing key unless you give a default.",
      },
      {
        q: "What is {1, 2, 3} - {2, 3, 4}?",
        options: ["{1}", "{4}", "{1, 4}", "{2, 3}"],
        answer: 0,
        why: "Difference keeps items of the left set that are not in the right set.",
      },
      {
        q: "Which of these cannot be a dict key?",
        options: ["(1, 2)", "\"name\"", "42", "[1, 2]"],
        answer: 3,
        why: "Lists are mutable and therefore not hashable.",
      },
      {
        q: "a = {\"x\": 1, \"y\": 2} and b = {\"y\": 9}. What is a | b?",
        options: ["{'x': 1, 'y': 2}", "{'x': 1, 'y': 9}", "TypeError", "{'y': 9}"],
        answer: 1,
        why: "In a merge, the right-hand dict wins for keys that appear in both.",
      },
      {
        q: "Why is x in my_set usually much faster than x in my_list for big collections?",
        options: ["Sets are kept sorted", "Sets use the hash of x to jump to where it would be", "Lists are compressed", "Sets store fewer bytes per item"],
        answer: 1,
        why: "A hash lookup checks a few slots; a list check may compare every item.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given prices = {\"apple\": 0.5, \"bread\": 2.2, \"milk\": 1.1}, add cheese at 4.0, raise milk by 10%, remove bread, and print each item and price on its own line.",
        hint: "Assign to a new key, multiply an existing one, then use del or pop().",
        solution: "prices = {\"apple\": 0.5, \"bread\": 2.2, \"milk\": 1.1}\nprices[\"cheese\"] = 4.0\nprices[\"milk\"] = round(prices[\"milk\"] * 1.1, 2)\ndel prices[\"bread\"]\nfor item, price in prices.items():\n    print(f\"{item}: {price:.2f}\")\n# apple: 0.50  milk: 1.21  cheese: 4.00",
      },
      {
        level: "medium",
        task: "Group [\"ana\", \"bo\", \"amy\", \"cy\", \"ben\"] into a dict of lists by first letter, then print the groups in alphabetical order of the letter.",
        hint: "setdefault(letter, []).append(name), then loop over sorted(groups).",
        solution: "names = [\"ana\", \"bo\", \"amy\", \"cy\", \"ben\"]\ngroups = {}\nfor n in names:\n    groups.setdefault(n[0], []).append(n)\nfor letter in sorted(groups):\n    print(letter, groups[letter])\n# a ['ana', 'amy']\n# b ['bo', 'ben']\n# c ['cy']",
      },
      {
        level: "hard",
        task: "Write first_repeat(text) that returns the first character that appears a second time (\"swiss\" gives \"s\", \"abc\" gives None) and common(a, b) that returns the set of characters found in both strings. Both must run in linear time.",
        hint: "Keep a set of characters seen so far; for common, intersect two sets.",
        solution: "def first_repeat(text):\n    seen = set()\n    for ch in text:\n        if ch in seen:\n            return ch\n        seen.add(ch)\n    return None\n\ndef common(a, b):\n    return set(a) & set(b)\n\nprint(first_repeat(\"swiss\"), first_repeat(\"abc\"))  # s None\nprint(sorted(common(\"python\", \"typhoon\")))   # ['h', 'n', 'o', 'p', 't', 'y']",
      },
    ],
    faq: [
      { q: "Are Python dictionaries ordered?", a: "Yes. Since Python 3.7, dicts officially keep keys in the order they were inserted. Sets do not keep any order." },
      { q: "How do I sort a dictionary by value?", a: "Sort its items with a key: sorted(d.items(), key=lambda kv: kv[1]). Wrap the result in dict() if you want a dict back in that order." },
      { q: "What is the difference between a set and a frozenset?", a: "A set can change with add() and remove(). A frozenset is immutable and hashable, so it can be a dict key or an item inside another set." },
      { q: "How do I merge two dictionaries in Python?", a: "In Python 3.9 and later, a | b returns a new merged dict and a |= b updates a in place. On older versions, copy a and call update(b) on the copy." },
    ],
  },

  "data-structures/comprehensions": {
    plain: [
      "A comprehension is a short way to build a new list, dict or set from another collection in one line. Instead of making an empty list, writing a loop and calling append, you describe the result you want, and Python builds it.",
      "It reads left to right almost like a sentence. [price * 2 for price in prices if price > 10] means \"price times two, for each price in prices, if the price is over 10\". The part before for says what goes into the new list; the if at the end decides which items get in.",
      "Curly braces with a colon build a dict, {name: len(name) for name in names}, and curly braces without a colon build a set, which drops duplicates. Round brackets give a generator expression, which produces values one at a time, perfect for feeding straight into sum(), max() or any().",
      "Comprehensions are not always better. If each item needs several steps, error handling or printing, a normal loop is easier to read and to debug. The goal is always clear code, not the shortest code.",
    ],
    deepDive: [
      {
        heading: "How a comprehension maps onto a loop",
        body: "Every list comprehension has an exact loop equivalent. [EXPR for X in SOURCE if COND] does the same as: result = [], then for X in SOURCE:, then if COND:, then result.append(EXPR). The only reorder is that EXPR, which runs last, is written first.\n\nMore clauses follow the same rule. Several for clauses nest in the order you write them, outer first: [(x, y) for x in \"ab\" for y in \"12\"] gives ('a', '1'), ('a', '2'), ('b', '1'), ('b', '2'). Several if clauses must all be true.\n\nA comprehension has its own scope, so its loop variable does not leak out and does not overwrite a variable with the same name outside. Python 3.12 made comprehensions faster by running them inline, but kept that isolation. For simple build-a-list work they are usually a little faster than a loop with append, though readability is the better reason to use them.",
        visual: {
          type: "compare",
          title: "The same logic as a loop and as a comprehension",
          columns: [
            { title: "Loop", points: ["result = []", "for n in nums:", "if n % 2 == 0:", "result.append(n * n)"] },
            { title: "Comprehension", points: ["[ ... ] creates the list", "for n in nums", "if n % 2 == 0", "n * n, written first"] },
          ],
        },
      },
      {
        heading: "Filter vs transform: where if and else go",
        body: "There are two different ifs, and they live in different places. A trailing if filters: [x for x in nums if x > 0] drops items that fail, and it cannot have an else. A conditional expression at the front transforms: [\"even\" if n % 2 == 0 else \"odd\" for n in nums] keeps every item but changes what is stored, and it must have an else.\n\nYou can use both at once: [x if x > 0 else 0 for x in readings if x is not None] first drops missing readings, then turns negatives into 0. Writing [x for x in nums if x > 0 else 0] is a SyntaxError, which is the usual sign that the condition belongs at the front.\n\nIf the expression is expensive and you need its result in both the filter and the output, the walrus operator (Python 3.8+) avoids calling it twice: [y for x in data if (y := score(x)) > 50]. Use it sparingly; a loop is often clearer.",
      },
      {
        heading: "Dict and set comprehensions",
        body: "A dict comprehension uses braces and a colon: {name: len(name) for name in names}. Two everyday uses are filtering a dict, {k: v for k, v in stock.items() if v > 0}, and transforming its values, {k: round(v, 2) for k, v in prices.items()}. If the same key is produced twice, the last value wins. For pairing two lists, dict(zip(keys, values)) is simpler than a comprehension.\n\nA set comprehension uses braces without a colon, {w.lower() for w in words}, and naturally removes duplicates. That makes it ideal for questions like \"which domains appear in this email list?\".\n\nThere is no tuple comprehension. Round brackets make a generator expression instead, so write tuple(x for x in items) when you need a tuple.",
        visual: {
          type: "tree",
          title: "The comprehension family",
          root: "Comprehensions",
          children: [
            { label: "List [ ... ]", children: ["Keeps order and duplicates", "[x * 2 for x in xs]"] },
            { label: "Dict { k: v ... }", children: ["Last duplicate key wins", "{w: len(w) for w in ws}"] },
            { label: "Set { ... }", children: ["Unique items, no order", "{w.lower() for w in ws}"] },
            { label: "Generator ( ... )", children: ["Lazy, one pass only", "sum(x * x for x in xs)"] },
          ],
        },
      },
      {
        heading: "Generator expressions and memory",
        body: "A list comprehension builds the whole list in memory at once. A generator expression, written with round brackets, builds nothing up front: it produces one value each time it is asked. (x * x for x in range(1_000_000)) is an object of about 200 bytes, while the equivalent list needs over 8 MB just for its slots.\n\nWhen you pass a generator straight into a function, the function's own parentheses are enough: sum(x * x for x in nums), max(len(w) for w in words), any(line.startswith(\"ERROR\") for line in f). any() and all() even stop early once they know the answer.\n\nThe catch is that a generator is used up after one pass. Looping over it a second time gives nothing, and it has no len() or indexing. Use a list when you need to look at the results more than once, count them or pick items by position.",
      },
      {
        heading: "When a plain loop is clearer",
        body: "Comprehensions are for building a collection from simple expressions. Switch to a normal for loop when any of these is true. Each item needs several statements, such as parsing, validating and converting. You need try/except around part of the work. You want side effects like print() or writing to a file; [print(x) for x in xs] builds a useless list of None values. You need break to stop early. Or the comprehension has more than two for clauses, or nested ifs that you cannot read aloud in one breath.\n\nA good test: if it does not fit comfortably on one or two lines, or a teammate would need to stop and decode it, write the loop. Another good option is to move the per-item logic into a small named function, then use it in a short comprehension: [parse_row(r) for r in rows].",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Order of [(r, c) for r in range(2) for c in range(3)]",
        steps: [
          { label: "r = 0", detail: "Outer for clause, written first" },
          { label: "c = 0, 1, 2", detail: "Inner clause runs fully: (0, 0) (0, 1) (0, 2)" },
          { label: "r = 1", detail: "Outer clause moves on" },
          { label: "c = 0, 1, 2", detail: "(1, 0) (1, 1) (1, 2)" },
          { label: "Done", detail: "6 pairs, same order as nested loops" },
        ],
      },
    ],
    examples: [
      {
        title: "Cleaning a messy list of emails",
        explanation: "A sign-up form gave you emails with stray spaces, mixed case and blank entries. Step 1: a list comprehension strips and lower-cases each email, and its trailing if drops entries that are empty after stripping. Step 2: the same logic as a set comprehension removes duplicates, and sorted() gives a stable order. Step 3: a dict comprehension maps each email to its domain. Each step is one readable line.",
        code: {
          lang: "python",
          code: "raw = [\" Ana@Mail.com\", \"bo@mail.com \", \"\", \"ANA@mail.com\", \"  \"]\n\ncleaned = [e.strip().lower() for e in raw if e.strip()]\nprint(cleaned)   # ['ana@mail.com', 'bo@mail.com', 'ana@mail.com']\n\nunique = sorted({e.strip().lower() for e in raw if e.strip()})\nprint(unique)    # ['ana@mail.com', 'bo@mail.com']\n\ndomains = {e: e.split(\"@\")[1] for e in unique}\nprint(domains)   # {'ana@mail.com': 'mail.com', 'bo@mail.com': 'mail.com'}",
        },
      },
      {
        title: "Flattening and transposing a grid",
        explanation: "grid is a list of rows. Step 1: two for clauses flatten it; read them as nested loops, rows first, then the numbers in each row. Step 2: a nested comprehension transposes it: the outer one walks column numbers, the inner one picks that column from every row. Step 3: a generator expression feeds sum() directly, with a filter, and no temporary list is built.",
        code: {
          lang: "python",
          code: "grid = [[1, 2, 3],\n        [4, 5, 6]]\n\nflat = [n for row in grid for n in row]\nprint(flat)            # [1, 2, 3, 4, 5, 6]\n\ntransposed = [[row[i] for row in grid] for i in range(3)]\nprint(transposed)      # [[1, 4], [2, 5], [3, 6]]\n\nprint(sum(n for n in flat if n % 2 == 0))   # 12",
        },
      },
    ],
    cheatSheet: [
      "[f(x) for x in xs if test(x)]: the trailing if filters items out",
      "[a if cond else b for x in xs]: if/else at the front transforms every item",
      "{k: v for k, v in d.items() if v} keeps only entries with truthy values",
      "{v: k for k, v in d.items()} inverts a dict; duplicate values keep only the last key",
      "[n for row in grid for n in row] flattens: for clauses read like nested loops",
      "sum(x * x for x in nums) uses a generator, so no temporary list is built",
      "A generator can be looped over only once; build a list if you need it twice",
      "Never use a comprehension just for side effects like print(); write a for loop",
    ],
    quiz: [
      {
        q: "What is [x * 2 for x in range(5) if x % 2]?",
        options: ["[2, 6]", "[0, 4, 8]", "[1, 3]", "[0, 2, 4, 6, 8]"],
        answer: 0,
        why: "x % 2 is truthy only for 1 and 3, which are then doubled.",
      },
      {
        q: "Which of these is a SyntaxError?",
        options: ["[x for x in xs if x > 0]", "[x if x > 0 else 0 for x in xs]", "[x for x in xs if x > 0 else 0]", "{x for x in xs if x > 0}"],
        answer: 2,
        why: "A filtering if cannot have an else; move the condition to the front to transform.",
      },
      {
        q: "What kind of object does (n * n for n in nums) create?",
        options: ["A tuple", "A list", "A set", "A generator"],
        answer: 3,
        why: "Round brackets make a lazy generator expression, not a tuple.",
      },
      {
        q: "What is {w[0]: w for w in [\"apple\", \"avocado\", \"banana\"]}?",
        options: ["{'a': 'apple', 'b': 'banana'}", "{'a': 'avocado', 'b': 'banana'}", "{'a': ['apple', 'avocado'], 'b': ['banana']}", "KeyError"],
        answer: 1,
        why: "Both a-words produce the key 'a', and the last value written wins.",
      },
      {
        q: "In [(x, y) for x in \"ab\" for y in \"12\"], which pair comes second?",
        options: ["('b', '1')", "('a', '2')", "('a', '1')", "('1', 'a')"],
        answer: 1,
        why: "The last for clause is the inner loop, so y changes fastest.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From temps_c = [12, 25, 31, 18, 40], build a list of the same temperatures in Fahrenheit (F = C * 9 / 5 + 32) and a list of only the Celsius values above 20.",
        hint: "One comprehension transforms, the other filters.",
        solution: "temps_c = [12, 25, 31, 18, 40]\ntemps_f = [c * 9 / 5 + 32 for c in temps_c]\nhot = [c for c in temps_c if c > 20]\nprint(temps_f)   # [53.6, 77.0, 87.8, 64.4, 104.0]\nprint(hot)       # [25, 31, 40]",
      },
      {
        level: "medium",
        task: "From words = [\"Apple\", \"bob\", \"kayak\", \"Level\", \"python\"], build a dict that maps each palindrome, in lower case, to its length, and a set of the lower-case first letters of all words.",
        hint: "A word is a palindrome if w.lower() == w.lower()[::-1].",
        solution: "words = [\"Apple\", \"bob\", \"kayak\", \"Level\", \"python\"]\npals = {w.lower(): len(w) for w in words if w.lower() == w.lower()[::-1]}\nfirsts = {w[0].lower() for w in words}\nprint(pals)            # {'bob': 3, 'kayak': 5, 'level': 5}\nprint(sorted(firsts))  # ['a', 'b', 'k', 'l', 'p']",
      },
      {
        level: "hard",
        task: "Parse lines = [\"# config\", \"port=8080\", \"\", \"host=localhost\", \"debug=0\"] into a dict, skipping blank lines and comments and turning digit-only values into ints. Decide whether a comprehension or a loop is clearer, and justify it.",
        hint: "Count the steps each line needs: strip, skip, split, strip again, convert.",
        solution: "lines = [\"# config\", \"port=8080\", \"\", \"host=localhost\", \"debug=0\"]\nconfig = {}\nfor line in lines:\n    line = line.strip()\n    if not line or line.startswith(\"#\"):\n        continue\n    key, value = line.split(\"=\", 1)\n    value = value.strip()\n    config[key.strip()] = int(value) if value.isdigit() else value\nprint(config)   # {'port': 8080, 'host': 'localhost', 'debug': 0}\n# Five steps per line: a plain loop reads better than one huge comprehension.",
      },
    ],
    faq: [
      { q: "Are list comprehensions faster than for loops?", a: "Usually a little faster for simple build-a-list work, because the appending happens inside the interpreter. The main reason to use them is readability, not speed." },
      { q: "Is there a tuple comprehension in Python?", a: "No. Round brackets make a generator expression. Use tuple(x for x in items) to build a tuple." },
      { q: "Can I use else in a list comprehension?", a: "Only in the expression at the front: [a if cond else b for x in xs]. The filtering if at the end cannot have an else." },
      { q: "Does a comprehension's loop variable leak out?", a: "No. In Python 3 a comprehension has its own scope, so its loop variable never overwrites a variable with the same name outside it." },
    ],
  },

  "data-structures/mutability": {
    plain: [
      "Some objects can change after they are created, and some cannot. Lists, dicts and sets are mutable: you can add, remove and replace what is inside. Numbers, strings and tuples are immutable: every \"change\" really creates a new object.",
      "A variable is a label stuck on an object, not a box holding its own copy. b = a sticks a second label on the same list. If you then change the list through b, you see the change through a as well, because there is only one list.",
      "When you need an independent object, you must copy it on purpose. A shallow copy makes a new outer container but shares what is inside. A deep copy duplicates every level, so nothing at all is shared.",
      "Many puzzling bugs come from this: a function that changes a list you passed in, a default argument that remembers old values, a grid where every row changes together. Once you picture names as labels pointing at objects, these bugs suddenly make sense and are easy to fix.",
    ],
    deepDive: [
      {
        heading: "id, is and ==",
        body: "Every object has an identity that never changes while it exists; id(obj) returns it as a number (in CPython, its memory address). a is b compares identities: are these two names pointing at the very same object? a == b compares values: do these objects hold equal contents? Two separate lists [1, 2] and [1, 2] are equal but not identical.\n\nFor immutable values the difference rarely matters, and CPython quietly reuses some objects to save memory: small integers from -5 to 256 and many short strings are shared. That is why 5 is 5 may print True while a large number computed two ways gives False. This caching is an implementation detail, so never use is to compare numbers or strings. Use == for values, and keep is for None and for checking aliasing.",
        visual: {
          type: "flow",
          title: "Two names, one list, and a look-alike",
          steps: [
            { label: "a = [1, 2]", detail: "a points at list L1" },
            { label: "b = a", detail: "b points at L1 too" },
            { label: "c = [1, 2]", detail: "A separate list L2 with equal values" },
            { label: "a == c is True", detail: "Same contents" },
            { label: "a is c is False", detail: "Different objects; a is b is True" },
          ],
        },
      },
      {
        heading: "Mutation vs rebinding",
        body: "There are two very different ways to \"change a variable\". Mutation changes the object itself: a.append(3), a[0] = 9, d[\"k\"] = 1. Every name pointing at that object sees the change. Rebinding points the name at a different object: a = a + [3] builds a new list and moves only a, so other names keep the old list.\n\nThe tricky one is +=. On a list, a += [3] mutates in place, exactly like extend(). On an int, string or tuple, which cannot change, += has to create a new object and rebind the name. Same symbol, different effect depending on mutability.\n\nFunction calls follow the same rules. Python passes a reference to the object (often called call by sharing). If the function mutates its parameter, the caller sees it. If the function assigns a new object to its parameter, only the local name moves, and the caller's variable is untouched.",
        visual: {
          type: "compare",
          title: "a += [x] vs a = a + [x] when b = a",
          columns: [
            { title: "a.append(x) or a += [x]", points: ["Changes the existing list", "a is b stays True", "b sees the new item"] },
            { title: "a = a + [x]", points: ["Builds a new list", "Only a moves to it", "b keeps the old list"] },
          ],
        },
      },
      {
        heading: "Shallow and deep copies in practice",
        body: "There are several ways to make a shallow copy of a list: list(a), a[:], a.copy() and copy.copy(a). For a dict, dict(d) or d.copy(). They all create a new outer container whose slots point at the same inner objects. That is perfect for a flat list of numbers or strings, because immutable items never need copying.\n\nNested data is where shallow copies bite. Copy a list of lists, append to an inner list, and the original sees it, because the inner lists are shared. copy.deepcopy() walks the whole structure and copies every mutable level. It also handles objects that refer to each other. It is slower, and some objects, such as open files or network connections, cannot be deep-copied.\n\nOften the clearest option is to build exactly the structure you need: [row[:] for row in grid] copies each row of a grid. The classic grid bug is [[0] * 3] * 3, which repeats one row object three times; [[0] * 3 for _ in range(3)] creates three separate rows.",
      },
      {
        heading: "Mutable default arguments",
        body: "Default values are evaluated once, when the def statement runs, and then stored on the function object. With an immutable default like 0 or \"\" that is harmless. With def add(item, items=[]):, there is one list created at definition time, and every call that does not pass items appends to that same list. The first call returns [1], the second [1, 2], and so on.\n\nThe standard fix is a sentinel: write items=None and create a fresh list inside with if items is None: items = []. The same trap applies to dict and set defaults, and to values like the current time: def log(msg, when=datetime.now()) fixes the time at definition, not at each call.\n\nLinters catch this. Ruff and flake8-bugbear report it as rule B006, which is one more good reason to run a linter from day one.",
        visual: {
          type: "sequence",
          title: "Why def add(x, items=[]) remembers",
          actors: ["Caller", "add()", "Default list"],
          messages: [
            { from: 0, to: 1, label: "add(1)" },
            { from: 1, to: 2, label: "Use the one default list" },
            { from: 1, to: 0, label: "Returns [1]" },
            { from: 0, to: 1, label: "add(2)" },
            { from: 1, to: 2, label: "Same list again, append 2" },
            { from: 1, to: 0, label: "Returns [1, 2]" },
          ],
        },
      },
      {
        heading: "Using immutability on purpose",
        body: "Immutable objects are safe to share: no function can change a string or a tuple behind your back, which is why they can be dict keys and set items. Returning new objects instead of mutating inputs makes functions predictable and easy to test, as you saw with pure functions.\n\nMutation has its place too. Changing a large list in place avoids copying millions of items, and building a list with append in a loop is normal and efficient. The skill is to be deliberate: mutate objects your function created, and treat objects you received as read-only unless the function's name and docstring clearly say it changes them, like sort() or update().\n\nRemember that immutability is shallow. A tuple holding a list cannot have its slots replaced, but the list inside can still change, and such a tuple is not hashable. For truly fixed records, use tuples of immutable values or frozen dataclasses.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Built-in types by mutability",
        root: "Built-in types",
        children: [
          { label: "Mutable", children: ["list", "dict", "set", "bytearray"] },
          { label: "Immutable", children: ["int, float, bool", "str", "tuple", "frozenset", "bytes, None"] },
        ],
      },
    ],
    examples: [
      {
        title: "The tic-tac-toe grid where every row changes",
        explanation: "You build a 3 by 3 board and place an X in the top-left corner, but X appears in all three rows. Step 1: [[\" \"] * 3] * 3 creates one row list and repeats a reference to it three times. Step 2: grid[0] is grid[1] confirms all rows are the same object. Step 3: the comprehension runs [\" \"] * 3 three separate times, creating three independent rows. Step 4: now only one cell changes.",
        code: {
          lang: "python",
          code: "grid = [[\" \"] * 3] * 3\ngrid[0][0] = \"X\"\nprint(grid)                # [['X', ' ', ' '], ['X', ' ', ' '], ['X', ' ', ' ']]\nprint(grid[0] is grid[1])  # True: one row, three references\n\ngrid = [[\" \"] * 3 for _ in range(3)]\ngrid[0][0] = \"X\"\nprint(grid)                # [['X', ' ', ' '], [' ', ' ', ' '], [' ', ' ', ' ']]\nprint(grid[0] is grid[1])  # False",
        },
      },
      {
        title: "A function that leaked changes through a shallow copy",
        explanation: "promote_shallow() copies the user dict to be safe, yet the caller's tags still change. Step 1: u.copy() creates a new outer dict, but its \"tags\" value is the same list object. Step 2: appending to that list changes the caller's data. Step 3: copy.deepcopy() copies the inner list as well, so the new tag stays in the returned dict only. Step 4: the printout proves the original is safe this time.",
        code: {
          lang: "python",
          code: "import copy\n\ndef promote_shallow(u):\n    new = u.copy()             # new outer dict, same inner list\n    new[\"tags\"].append(\"vip\")\n    return new\n\ndef promote(u):\n    new = copy.deepcopy(u)     # inner list copied too\n    new[\"tags\"].append(\"vip\")\n    return new\n\nuser = {\"name\": \"ana\", \"tags\": [\"new\"]}\nvip = promote(user)\nprint(user[\"tags\"], vip[\"tags\"])   # ['new'] ['new', 'vip']",
        },
      },
    ],
    cheatSheet: [
      "a is b checks for the same object; a == b checks for equal values",
      "a.append(x) and a += [x] change the list in place; a = a + [x] makes a new list",
      "a[:], list(a) and a.copy() are shallow copies: nested lists stay shared",
      "copy.deepcopy(x) copies every level; slower, but fully independent",
      "Build grids with [[0] * cols for _ in range(rows)], never [[0] * cols] * rows",
      "Use def f(items=None): and create items = [] inside when it is None",
      "Never use is to compare numbers or strings; small-value caching makes it unreliable",
      "A tuple holding a list can still change inside, and it is not hashable",
    ],
    quiz: [
      {
        q: "a = [1, 2]; b = a; a += [3]. What is b?",
        options: ["[1, 2]", "[1, 2, 3]", "[3]", "TypeError"],
        answer: 1,
        why: "+= on a list mutates it in place, and b points at the same list.",
      },
      {
        q: "a = [1, 2]; b = a; a = a + [3]. What is b?",
        options: ["[1, 2]", "[1, 2, 3]", "None", "[3]"],
        answer: 0,
        why: "a + [3] builds a new list and only a is rebound to it.",
      },
      {
        q: "a = [[1], [2]]; b = a.copy(); b[0].append(9). What is a?",
        options: ["[[1], [2]]", "[[1, 9], [2], 9]", "[[1], [2], [9]]", "[[1, 9], [2]]"],
        answer: 3,
        why: "A shallow copy shares the inner lists, so a[0] and b[0] are the same list.",
      },
      {
        q: "def f(x, seen=[]): seen.append(x); return seen. After f(1), what does f(2) return?",
        options: ["[2]", "[1]", "[1, 2]", "None"],
        answer: 2,
        why: "The default list is created once and shared by every call.",
      },
      {
        q: "Which of these types is mutable?",
        options: ["tuple", "str", "frozenset", "dict"],
        answer: 3,
        why: "dicts can be changed in place; the other three cannot.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Predict, then check: x = [1, 2, 3]; y = x; z = x[:]; x.append(4). Print y, z, y is x and z is x.",
        hint: "y is an alias; z is a shallow copy made before the append.",
        solution: "x = [1, 2, 3]\ny = x\nz = x[:]\nx.append(4)\nprint(y)        # [1, 2, 3, 4]\nprint(z)        # [1, 2, 3]\nprint(y is x)   # True\nprint(z is x)   # False",
      },
      {
        level: "medium",
        task: "Fix def add_tag(tag, tags=[]): tags.append(tag); return tags so calls do not share data. Show that two calls without a tags argument each return a one-item list.",
        hint: "Use None as the default and create the list inside the function.",
        solution: "def add_tag(tag, tags=None):\n    if tags is None:\n        tags = []\n    tags.append(tag)\n    return tags\n\nprint(add_tag(\"a\"))   # ['a']\nprint(add_tag(\"b\"))   # ['b'], not ['a', 'b']",
      },
      {
        level: "hard",
        task: "Write deep_clone(data) for nested lists and dicts without using the copy module. Prove that changing an inner list of the clone leaves the original alone.",
        hint: "Recurse: rebuild lists and dicts, and return any other value as it is (assume the leaves are immutable).",
        solution: "def deep_clone(data):\n    if isinstance(data, list):\n        return [deep_clone(x) for x in data]\n    if isinstance(data, dict):\n        return {k: deep_clone(v) for k, v in data.items()}\n    return data   # immutable leaves can be shared safely\n\norig = {\"a\": [1, [2, 3]], \"b\": {\"c\": [4]}}\nclone = deep_clone(orig)\nclone[\"a\"][1].append(99)\nprint(orig[\"a\"], clone[\"a\"])   # [1, [2, 3]] [1, [2, 3, 99]]",
      },
    ],
    faq: [
      { q: "Does Python pass arguments by value or by reference?", a: "Neither exactly: it passes references to objects, often called call by sharing. A function can mutate a list you pass in, but assigning a new object to the parameter does not change the caller's variable." },
      { q: "When should I use deepcopy?", a: "When you need a fully independent copy of nested mutable data, such as a config dict containing lists. For flat lists of numbers or strings, a shallow copy is enough and much faster." },
      { q: "Why are strings immutable in Python?", a: "It makes them safe to share between names and usable as dict keys, and it lets Python reuse them. Methods like replace() simply return a new string." },
      { q: "Why does my linter warn about a list as a default argument?", a: "The default list is created once and shared by every call, which Ruff and flake8-bugbear report as rule B006. Use None as the default and create the list inside the function." },
    ],
  },

  "data-structures/ds-practice": {
    plain: [
      "Reading about lists and dicts is not the same as using them. This topic is about practice: small problems that appear again and again in real code, such as filtering, counting, grouping and cleaning text. Solving them without help is what turns syntax into skill.",
      "Each problem follows the same routine. Understand what goes in and what should come out, choose the data structure, write a small function, then test it with normal and unusual input. Most solutions are a function of five to ten lines.",
      "A handful of patterns covers most beginner problems. Filtering is a loop with an if, or a comprehension. Counting uses dict.get() or Counter. Grouping uses setdefault() or defaultdict. Text problems use lower(), split() and strip().",
      "Test every solution with assert lines, including odd cases: an empty list, a single item, ties, capital letters, punctuation. When all the asserts pass, close your notes and solve the same problem again the next day. If you can, you have really learned it.",
    ],
    deepDive: [
      {
        heading: "Four patterns behind most beginner problems",
        body: "Almost every small data problem is one of four shapes, or two of them chained together. Filter keeps some items and drops others. Transform turns each item into something else. Aggregate boils many items down to one answer: a count, a total, a minimum or maximum. Group sorts items into buckets by some key, often followed by an aggregate per bucket.\n\nThe wording of the problem usually gives the pattern away. \"Only\", \"which\" and \"remove\" suggest a filter. \"Convert\", \"each\" and \"format\" suggest a transform. \"How many\", \"total\" and \"most\" suggest an aggregate. \"By\", \"per\" and \"for each kind of\" suggest grouping.\n\nNaming the pattern before you code is a big shortcut: you go straight to the matching tool instead of staring at a blank editor.",
        visual: {
          type: "tree",
          title: "From problem words to pattern and tool",
          root: "Problem statement",
          children: [
            { label: "only, which, remove", children: ["Filter", "if inside a loop or comprehension"] },
            { label: "convert, each, format", children: ["Transform", "[f(x) for x in items]"] },
            { label: "how many, total, most", children: ["Aggregate", "len, sum, max, Counter"] },
            { label: "by, per, for each kind", children: ["Group", "setdefault or defaultdict(list)"] },
          ],
        },
      },
      {
        heading: "Choosing the data structure",
        body: "Pick the structure by the question you need to answer quickly. Need order and duplicates, such as a sequence of readings? Use a list. Need to look things up by a key or keep a count per key? Use a dict. Need uniqueness or fast \"is it in here?\" checks? Use a set. Need one fixed record? Use a tuple.\n\nThe choice can change speed dramatically. Finding which of 10,000 emails also appear in another list of 10,000 with a nested loop, or with in on a list, can take up to 100 million comparisons. Turning the second list into a set first makes each check almost instant, so the whole job takes about 20,000 steps.\n\nYou do not need complexity theory yet. Just remember: in on a list inside a loop is a warning sign; convert to a set or dict first.",
        visual: {
          type: "compare",
          title: "Common emails in two lists of 10,000",
          columns: [
            { title: "Nested loop or list in", points: ["for e in a: if e in b", "Each check scans b", "Up to 100 million comparisons", "Seconds or worse"] },
            { title: "Set first", points: ["b_set = set(b)", "Each check is a hash lookup", "About 20,000 steps", "Milliseconds"] },
          ],
        },
      },
      {
        heading: "An edge-case checklist",
        body: "Most wrong solutions work on the example in the problem and fail on input nobody thought about. Before you call a solution done, run it against this list.\n\nEmpty input: an empty list, empty string or empty dict. One item. All items the same. Ties, such as two words with the same top count: which one should win? Case and spacing: \"Apple\", \"apple \" and \"APPLE\". Punctuation stuck to words, like \"end.\". Zero, negative numbers and very large numbers.\n\nFor each case, decide the expected behaviour first, then write an assert for it. Sometimes the right answer is not obvious, such as the maximum of an empty list. Choose deliberately: return None, return a default, or raise ValueError with a clear message, and write that choice in the docstring.",
        bullets: [
          "Empty, one item, all equal",
          "Ties and their order",
          "Case, spaces and punctuation",
          "Zero, negatives, very large values",
        ],
      },
      {
        heading: "Testing with assert",
        body: "assert condition raises AssertionError when the condition is False and does nothing when it is True. That makes it the quickest possible test: assert count_vowels(\"Hello\") == 2. Add a message to see what went wrong: assert result == 3, f\"got {result}\".\n\nWrite two or three asserts before writing the function. It forces you to pin down the exact output format, such as a list or a dict, sorted or not, before you get lost in code. When order does not matter, compare sorted(result) == sorted(expected) or compare sets.\n\nWhen an assert fails, print the intermediate values, or open the function in the VS Code debugger and step through one line at a time. Later in this path you will move these asserts into pytest, which runs them all and gives a clear report; the habit you build now carries straight over.",
      },
      {
        heading: "Ten exercises to finish without help",
        body: "Work through these in order, each as a function with at least three asserts. 1: return the even numbers from a list. 2: return words longer than n letters. 3: count the vowels in a string. 4: find the three most common words in a text, ignoring case. 5: group words by length. 6: remove duplicates while keeping the original order. 7: find the second largest unique number, or None. 8: check whether two words are anagrams. 9: merge two dicts of totals, adding values for shared keys. 10: find all pairs in a list that add up to a target.\n\nGive each one 15 to 20 minutes of real effort before looking at a hint. Then solve it a second way, for example with a loop and then with a comprehension or Counter. Read other people's solutions only after yours passes. Redo any you needed help with two days later.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to count words",
        columns: [
          { title: "if/else in a loop", points: ["if w in counts: counts[w] += 1", "else: counts[w] = 1", "Most explicit", "Good for learning"] },
          { title: "dict.get()", points: ["counts[w] = counts.get(w, 0) + 1", "One line in the loop", "Plain dict result", "Everyday choice"] },
          { title: "Counter", points: ["Counter(words)", "No loop needed", "most_common(n) built in", "Best in real code"] },
        ],
      },
    ],
    examples: [
      {
        title: "Second largest unique number",
        explanation: "The problem: return the second largest distinct number, or None if there is none. Step 1: decide the edge cases first: duplicates of the maximum must not count, and lists with fewer than two distinct values give None. Step 2: set() removes duplicates, and sorting in reverse puts the largest first. Step 3: return index 1 only when it exists. Step 4: asserts cover duplicates, too few values, an empty list and negative numbers.",
        code: {
          lang: "python",
          code: "def second_largest(nums):\n    \"\"\"Return the second largest distinct number, or None.\"\"\"\n    unique = sorted(set(nums), reverse=True)\n    return unique[1] if len(unique) >= 2 else None\n\nassert second_largest([4, 1, 4, 3]) == 3\nassert second_largest([5, 5]) is None\nassert second_largest([]) is None\nassert second_largest([-2, -7]) == -7\nprint(\"all good\")",
        },
      },
      {
        title: "Grouping anagrams",
        explanation: "Find groups of words that use the same letters. Step 1: recognise the pattern: group by a key. Step 2: the key is the word's letters in sorted order, lower-cased, so \"listen\" and \"Silent\" both give \"eilnst\". Step 3: setdefault() collects words per key. Step 4: keep only groups with more than one word. Step 5: test the empty input too.",
        code: {
          lang: "python",
          code: "def anagram_groups(words):\n    \"\"\"Return lists of words that are anagrams of each other.\"\"\"\n    groups = {}\n    for w in words:\n        key = \"\".join(sorted(w.lower()))\n        groups.setdefault(key, []).append(w)\n    return [g for g in groups.values() if len(g) > 1]\n\nprint(anagram_groups([\"listen\", \"Silent\", \"enlist\", \"google\", \"cat\", \"act\"]))\n# [['listen', 'Silent', 'enlist'], ['cat', 'act']]\nassert anagram_groups([]) == []",
        },
      },
    ],
    cheatSheet: [
      "Filter: [x for x in items if test(x)]",
      "Count: counts[k] = counts.get(k, 0) + 1, or simply Counter(items)",
      "Group: groups.setdefault(key, []).append(item)",
      "Remove duplicates but keep order: list(dict.fromkeys(items))",
      "Using in inside a loop? Make the other collection a set first",
      "Order does not matter? Compare sorted(result) == sorted(expected)",
      "Always test: empty input, one item, duplicates, ties and mixed case",
      "max(d, key=d.get) returns the key with the biggest value",
    ],
    quiz: [
      {
        q: "Which tool best answers \"which emails appear in both lists?\"",
        options: ["Two nested for loops", "A dict of counts", "A set intersection", "A sorted list"],
        answer: 2,
        why: "set(a) & set(b) does it directly and in linear time.",
      },
      {
        q: "What does list(dict.fromkeys([3, 1, 3, 2, 1])) return?",
        options: ["[3, 1, 2]", "[1, 2, 3]", "[3, 1, 3, 2, 1]", "{3, 1, 2}"],
        answer: 0,
        why: "Dict keys are unique and keep insertion order, so first occurrences survive in order.",
      },
      {
        q: "A task says \"total sales per region\". Which pattern is it?",
        options: ["Filter", "Transform", "Sort", "Group, then aggregate"],
        answer: 3,
        why: "\"Per region\" means grouping by region, and \"total\" means summing inside each group.",
      },
      {
        q: "Checking each of 10,000 items with in against a 10,000-item list takes about how many comparisons in the worst case?",
        options: ["20,000", "100 million", "10,000", "About 14"],
        answer: 1,
        why: "10,000 checks times up to 10,000 comparisons each; a set avoids this.",
      },
      {
        q: "counts = {\"a\": 2, \"b\": 5}. What does max(counts, key=counts.get) return?",
        options: ["5", "\"a\"", "\"b\"", "(\"b\", 5)"],
        answer: 2,
        why: "max walks the keys and compares them by their values, returning the key itself.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write evens_above(nums, limit) that returns the even numbers greater than limit, in their original order. Test it with a normal list, an empty list and a list with no matches.",
        hint: "One comprehension with two conditions joined by and.",
        solution: "def evens_above(nums, limit):\n    return [n for n in nums if n % 2 == 0 and n > limit]\n\nassert evens_above([1, 4, 10, 7, 12], 5) == [10, 12]\nassert evens_above([], 5) == []\nassert evens_above([1, 3, 5], 0) == []\nprint(\"ok\")",
      },
      {
        level: "medium",
        task: "Write top_words(text, n) that returns the n most common words as (word, count) pairs, ignoring case and the punctuation marks . , ! ? and breaking ties alphabetically.",
        hint: "Replace punctuation with spaces, count with a dict, then sort by (-count, word).",
        solution: "def top_words(text, n):\n    for p in \".,!?\":\n        text = text.replace(p, \" \")\n    counts = {}\n    for w in text.lower().split():\n        counts[w] = counts.get(w, 0) + 1\n    return sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:n]\n\nassert top_words(\"The cat. The dog! the end?\", 2) == [(\"the\", 3), (\"cat\", 1)]\nassert top_words(\"\", 3) == []",
      },
      {
        level: "hard",
        task: "Write pair_sums(nums, target) that returns a set of unique pairs (smaller number first) that add up to target, in a single pass using a set. pair_sums([1, 5, 3, 3, 7, -1], 6) should give {(1, 5), (3, 3), (-1, 7)}.",
        hint: "For each n, check whether target - n was seen earlier; store pairs as sorted tuples so duplicates collapse.",
        solution: "def pair_sums(nums, target):\n    seen, pairs = set(), set()\n    for n in nums:\n        if target - n in seen:\n            pairs.add((min(n, target - n), max(n, target - n)))\n        seen.add(n)\n    return pairs\n\nassert pair_sums([1, 5, 3, 3, 7, -1], 6) == {(1, 5), (3, 3), (-1, 7)}\nassert pair_sums([3], 6) == set()\nassert pair_sums([], 0) == set()",
      },
    ],
    faq: [
      { q: "Where can I find more beginner Python exercises?", a: "Exercism's free Python track and the easy problems on sites like LeetCode or Codewars are good next steps. Solve them in your own editor with asserts first, then compare with other solutions." },
      { q: "How long should I struggle before looking at the answer?", a: "About 15 to 20 minutes of real effort. Then read only a hint, and solve the problem again from scratch a day or two later so it sticks." },
      { q: "Should I use Counter and defaultdict or plain dicts?", a: "Learn the plain-dict versions first so you understand what happens. In real code, Counter and defaultdict are clearer and leave less room for mistakes." },
      { q: "How do I know my solution is good enough?", a: "It passes asserts for normal and edge cases, has a clear name, and you can explain every line. Speed only matters once the inputs get large." },
    ],
  },
};

export default extra;
