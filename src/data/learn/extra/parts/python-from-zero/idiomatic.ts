import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "idiomatic/stdlib": {
    plain: [
      "Python is often called \"batteries included\". It ships with hundreds of ready-made modules, called the standard library, that you can import without installing anything. Before you write a helper function yourself, it is worth asking: does Python already have this?",
      "Four modules cover a surprising amount of daily work. collections has smarter containers, like Counter for counting things and defaultdict for grouping. itertools has building blocks for loops, like joining several lists or grouping neighbours. datetime handles dates, times and durations. random picks, shuffles and samples.",
      "Using these tools makes your code shorter and also more correct. Counter already handles a missing key. datetime already knows that February has 28 or 29 days and that clocks change in spring. Your hand-written version might not.",
      "A good habit: when you write a loop that counts, groups, pairs up items or does maths with dates, stop and check these four modules first. Experienced Python developers read and recognise this style instantly, so it also makes your code easier for others.",
    ],
    deepDive: [
      {
        heading: "Counter: more than a counting dict",
        body: "Counter is a dict subclass where each key maps to a count. Asking for a missing key returns 0 instead of raising KeyError, and it does not add the key. You can build one from any iterable, including a generator, so Counter(line.split()[0] for line in f) counts the first word of every line in a file without building a list.\n\nCounters support maths. c.update(more) adds counts, c.subtract(other) removes them, and c1 + c2 combines two counters (dropping zero and negative results). most_common(3) returns the top three (item, count) pairs, sorted by count. c.total() (Python 3.10+) sums all the counts. Because it is still a dict, json.dumps(c) works directly.",
        bullets: ["Counter(\"banana\") gives Counter({'a': 3, 'n': 2, 'b': 1})", "c[\"missing\"] returns 0 and does not insert the key", "c.most_common()[-1] is the least common item"],
      },
      {
        heading: "defaultdict, and the read that inserts",
        body: "defaultdict(factory) calls factory() the first time you use a missing key with square brackets, stores the result, and returns it. defaultdict(list) gives an empty list, defaultdict(int) gives 0, defaultdict(set) gives an empty set. That is why groups[key].append(x) works without any if statement.\n\nThe surprise: even reading groups[\"nope\"] inserts \"nope\" with an empty list. If you only want to check, use \"nope\" in groups or groups.get(\"nope\"), which do not call the factory. When you are done building, convert with dict(groups) before returning it, so callers do not get the auto-insert behaviour by accident. A plain dict with setdefault(key, []).append(x) does the same job without a special type.",
        visual: {
          type: "flow",
          title: "What groups[key] does on a defaultdict(list)",
          steps: [
            { label: "Key present?", detail: "Yes: return the stored list" },
            { label: "Call list()", detail: "No: make a new empty list" },
            { label: "Store it", detail: "groups[key] now exists" },
            { label: "Return it", detail: "So .append(x) works at once" },
          ],
        },
      },
      {
        heading: "itertools: lazy building blocks",
        body: "Most itertools functions return iterators, which produce values only when asked. That keeps memory low even for huge inputs. chain(a, b) walks through several iterables as if they were one. islice(it, 10) takes the first 10 items of anything, even an endless generator. accumulate([3, 1, 4]) gives running totals 3, 4, 8. pairwise (3.10+) gives neighbours: (a, b), (b, c). batched(it, 100) (3.12+) yields tuples of 100, handy for sending data to an API in chunks.\n\ngroupby(data, key=f) is the one that trips people up. It starts a new group every time the key changes, so unsorted data gives the same key many times. Sort by the same key first. Also, each group is itself an iterator that is used up when groupby moves on, so turn it into a list right away if you need it later.",
        bullets: ["product(\"ab\", repeat=2): aa, ab, ba, bb", "combinations([1, 2, 3], 2): (1, 2), (1, 3), (2, 3)", "count(1) counts forever; pair it with islice or zip"],
      },
      {
        heading: "datetime: naive, aware and time zones",
        body: "A naive datetime has no time zone; it is just a wall-clock reading. An aware datetime carries tzinfo and points to one exact moment. Comparing or subtracting a naive and an aware value raises TypeError, so pick one style. The safe rule: store and compute in UTC, convert to local time only for display.\n\ndatetime.now(timezone.utc) gives the current aware UTC time. The zoneinfo module (Python 3.9+) gives real time zones with daylight saving rules: ZoneInfo(\"Europe/Berlin\"). On Windows, install the tzdata package for it to work. Parse ISO text with datetime.fromisoformat, and other formats with strptime and codes like %d/%m/%Y %H:%M. Subtracting two datetimes gives a timedelta; .total_seconds() turns it into a number.",
        bullets: ["strptime: string parse time (text to datetime)", "strftime: string format time (datetime to text)", "%Y year, %m month, %d day, %H hour (24h), %M minute, %S second", "date.today() and datetime.now() are naive local time"],
      },
      {
        heading: "random: choose the right function, and when not to use it",
        body: "random.choice(seq) picks one item. random.choices(seq, k=5) picks five with replacement, so repeats are possible, and accepts weights=[...] for unequal odds. random.sample(seq, 5) picks five different positions, without replacement. random.shuffle(lst) reorders a list in place and returns None, a classic bug when written as lst = random.shuffle(lst). random.randint(1, 6) includes both ends, while randrange(1, 6) stops before 6.\n\nrandom.seed(42) makes the sequence repeatable, which is great for tests and simulations. For anything secret, such as passwords, reset links or API tokens, use the secrets module instead: secrets.token_urlsafe(32) or secrets.choice(alphabet). The random module is predictable by design, so an attacker who sees enough outputs can work out the rest.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Picking items with random",
        columns: [
          { title: "choices(seq, k=n)", points: ["With replacement", "Repeats possible", "Supports weights=", "k can exceed len(seq)"] },
          { title: "sample(seq, k=n)", points: ["Without replacement", "No position picked twice", "Returns a new list", "k must be at most len(seq)"] },
          { title: "shuffle(lst)", points: ["Reorders all items", "Changes the list in place", "Returns None", "Needs a mutable list"] },
        ],
      },
      {
        type: "flow",
        title: "From user text to a correct stored time",
        steps: [
          { label: "Parse text", detail: "strptime(\"30/03/2027 09:30\", \"%d/%m/%Y %H:%M\")" },
          { label: "Attach the zone", detail: ".replace(tzinfo=ZoneInfo(\"Europe/Berlin\"))" },
          { label: "Convert to UTC", detail: ".astimezone(timezone.utc)" },
          { label: "Store as ISO text", detail: ".isoformat() gives 2027-03-30T07:30:00+00:00" },
          { label: "Display locally", detail: ".astimezone(viewer_zone) when showing it" },
        ],
      },
    ],
    examples: [
      {
        title: "Summarising a web server log",
        explanation: "Each line has a method, a path and a status code. Step 1: Counter counts status codes straight from a generator expression. Step 2: defaultdict(set) groups the paths by status, and a set removes duplicates. Step 3: most_common(2) shows the busiest codes, and the 500 group tells you which page is failing.",
        code: {
          lang: "python",
          code: "from collections import Counter, defaultdict\n\nlines = [\n    \"GET /home 200\", \"GET /login 500\", \"POST /login 200\",\n    \"GET /home 200\", \"GET /cart 404\", \"GET /login 500\",\n]\nstatus = Counter(line.split()[2] for line in lines)\npaths_by_status = defaultdict(set)\nfor line in lines:\n    _, path, code = line.split()\n    paths_by_status[code].add(path)\n\nprint(status.most_common(2))           # [('200', 3), ('500', 2)]\nprint(sorted(paths_by_status[\"500\"]))  # ['/login']",
        },
      },
      {
        title: "One meeting, three time zones",
        explanation: "A meeting is set for 09:30 in Berlin on 30 March 2027, just after Europe switches to summer time (UTC+2). Step 1: create an aware datetime with ZoneInfo. Step 2: astimezone shows it in India (UTC+5:30) and in UTC. Step 3: subtract the current UTC time to get a timedelta until the meeting. Both sides are aware, so the subtraction is allowed.",
        code: {
          lang: "python",
          code: "from datetime import datetime, timezone\nfrom zoneinfo import ZoneInfo\n\nstart = datetime(2027, 3, 30, 9, 30, tzinfo=ZoneInfo(\"Europe/Berlin\"))\nprint(start.astimezone(ZoneInfo(\"Asia/Kolkata\")))  # 2027-03-30 13:00:00+05:30\nprint(start.astimezone(timezone.utc).isoformat())  # 2027-03-30T07:30:00+00:00\n\nleft = start - datetime.now(timezone.utc)\nprint(f\"{left.days} days and {left.seconds // 3600} hours to go\")",
        },
      },
    ],
    cheatSheet: [
      "Counter(items).most_common(n) gives the top n (item, count) pairs",
      "defaultdict(list): groups[k].append(x) with no key check; even reading groups[k] inserts k",
      "Sort by the same key before itertools.groupby, or groups repeat",
      "islice(it, n) takes the first n items of any iterator, even an endless one",
      "Store datetimes in UTC: datetime.now(timezone.utc); show local with astimezone(ZoneInfo(...))",
      "datetime - datetime gives a timedelta; use .total_seconds() for a number",
      "random.shuffle returns None; random.randint(a, b) includes b",
      "Use secrets, not random, for passwords and tokens",
    ],
    quiz: [
      {
        q: "c = Counter(\"aab\"). What does c[\"z\"] return?",
        options: ["KeyError", "None", "0", "1"],
        answer: 2,
        why: "Counter returns 0 for missing items and does not insert them.",
      },
      {
        q: "You run groupby on [\"a\", \"b\", \"a\"] without sorting. How many groups do you get?",
        options: ["3", "2", "1", "An error"],
        answer: 0,
        why: "groupby starts a new group each time the key changes, so the two a's are not adjacent and form separate groups.",
      },
      {
        q: "Which call can return the same item twice?",
        options: ["random.sample(items, 3)", "random.shuffle(items)", "random.choice on an empty list", "random.choices(items, k=3)"],
        answer: 3,
        why: "choices picks with replacement; sample never picks the same position twice.",
      },
      {
        q: "What happens when you subtract a naive datetime from an aware one?",
        options: ["Python assumes UTC", "TypeError: can't subtract offset-naive and offset-aware datetimes", "It returns a negative timedelta", "It silently uses local time"],
        answer: 1,
        why: "Python refuses to mix the two because a naive time does not say which moment it means.",
      },
      {
        q: "groups = defaultdict(list). After print(groups[\"x\"]), what is len(groups)?",
        options: ["0", "An error was raised", "1", "None"],
        answer: 2,
        why: "Square-bracket access on a missing key calls the factory and stores the result, even when you only read it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given a sentence, print the three most common words, ignoring case.",
        hint: "Lowercase the text, split it, and pass the words to Counter.",
        solution: "from collections import Counter\n\ntext = \"The cat and the hat and THE bat\"\nprint(Counter(text.lower().split()).most_common(3))\n# [('the', 3), ('and', 2), ('cat', 1)]",
      },
      {
        level: "medium",
        task: "Given a list of (name, team) tuples, build a dict mapping each team to a sorted list of names. Then do it a second way with itertools.groupby.",
        hint: "defaultdict(list) for the first; for groupby, sort by team first and use key=lambda p: p[1].",
        solution: "from collections import defaultdict\nfrom itertools import groupby\npeople = [(\"Ana\", \"ops\"), (\"Bo\", \"dev\"), (\"Cy\", \"ops\")]\n\nteams = defaultdict(list)\nfor name, team in people:\n    teams[team].append(name)\nresult1 = {t: sorted(n) for t, n in teams.items()}\n\nby_team = sorted(people, key=lambda p: p[1])\nresult2 = {t: sorted(n for n, _ in g) for t, g in groupby(by_team, key=lambda p: p[1])}\nassert result1 == result2",
      },
      {
        level: "hard",
        task: "Write days_until_birthday(birthday: date, today: date) that returns how many days until the next birthday. Handle a birthday that already passed this year, and 29 February in non-leap years (use 1 March).",
        hint: "Try today's year first; date.replace raises ValueError for 29 Feb in a non-leap year.",
        solution: "from datetime import date\ndef next_on(bday, year):\n    try:\n        return bday.replace(year=year)\n    except ValueError:              # 29 Feb in a non-leap year\n        return date(year, 3, 1)\n\ndef days_until_birthday(bday, today):\n    nxt = next_on(bday, today.year)\n    if nxt < today:\n        nxt = next_on(bday, today.year + 1)\n    return (nxt - today).days",
      },
    ],
    faq: [
      { q: "Is the standard library always installed?", a: "Yes, it comes with every normal Python installation, so you never pip install collections or datetime. Some Linux distributions split a few modules (like venv or tkinter) into separate system packages." },
      { q: "Should I use datetime or a library like Arrow or Pendulum?", a: "Start with datetime plus zoneinfo; since Python 3.9 they cover time zones well. Reach for a library only if you need features like natural language parsing." },
      { q: "What is the difference between a dict with get() and a defaultdict?", a: "d.get(k, default) only returns a default and leaves d unchanged. A defaultdict creates and stores the default, which is what you want when building groups or counts." },
      { q: "Why does random give the same numbers every run?", a: "Something called random.seed() with a fixed value, often in test setup. Remove the seed call, or call random.seed() with no argument to reseed from the system." },
    ],
  },

  "idiomatic/iterators": {
    plain: [
      "When you write for x in something, Python does not grab everything at once. It asks the thing for a helper object called an iterator, then asks that helper \"next, please\" again and again until it says \"I'm done\". Lists, strings, dicts, files and ranges all support this.",
      "A generator is the easiest way to make your own iterator. It looks like a normal function, but it uses yield instead of return. Each yield hands one value out and freezes the function in place. The next request wakes it up exactly where it stopped, with all its variables still there.",
      "Why bother? Because a generator only holds one value at a time. Reading a 20 GB log file into a list would need 20 GB of memory. A generator that yields one line at a time needs about as much memory as one line, so it works even on a small laptop.",
      "The catch is that iterators are one-way and single-use, like a tape that only plays forward. Once a generator has given out all its values, it is empty. If you need the data twice, either keep a list or call the generator function again to get a fresh one.",
    ],
    deepDive: [
      {
        heading: "Iterable vs iterator: the protocol",
        body: "An iterable is anything with an __iter__ method that returns an iterator. An iterator has a __next__ method that returns the next value or raises StopIteration, and its own __iter__ simply returns itself. A for loop is really: it = iter(obj), then call next(it) repeatedly, and stop quietly when StopIteration appears.\n\nThis split explains a lot of behaviour. A list is an iterable but not an iterator: each loop calls iter() and gets a fresh iterator, so you can loop over a list many times. A file object or a generator is its own iterator, so a second loop continues from where the first stopped, usually at the end. next(it, default) returns default instead of raising when the iterator is empty.",
        bullets: ["iter([1, 2]) is not iter([1, 2]): two independent iterators", "iter(gen) is gen: a generator is its own iterator", "next(it, None) avoids StopIteration for an empty iterator"],
      },
      {
        heading: "How a generator pauses and resumes",
        body: "Calling a generator function runs none of its body. It just creates a generator object in the created state. The first next() runs the code up to the first yield, hands out that value and suspends: the local variables and the current line are saved. Each later next() resumes on the line after the yield.\n\nWhen the function body finishes or reaches return, the generator raises StopIteration and becomes closed. A return value inside a generator is attached to that StopIteration, and yield from passes it back to the outer generator. You can watch the states with inspect.getgeneratorstate(gen), which returns GEN_CREATED, GEN_RUNNING, GEN_SUSPENDED or GEN_CLOSED. gen.close() ends a suspended generator early and still runs its finally blocks, so cleanup code is safe.",
        visual: {
          type: "flow",
          title: "Generator states",
          steps: [
            { label: "GEN_CREATED", detail: "gen = f(): no code has run yet" },
            { label: "GEN_RUNNING", detail: "next(gen): runs until the next yield" },
            { label: "GEN_SUSPENDED", detail: "Paused at yield; locals kept" },
            { label: "GEN_CLOSED", detail: "Body ended, return, or gen.close()" },
          ],
        },
      },
      {
        heading: "Generator expressions and memory",
        body: "A list comprehension [x * x for x in range(1_000_000)] builds the full list right away; just the list's slots for a million items take about 8 MB on a 64-bit machine, before counting the numbers themselves. The generator expression (x * x for x in range(1_000_000)) is a small object of a couple of hundred bytes that computes one value per request. When it is the only argument to a function, you can drop the extra parentheses: sum(x * x for x in nums).\n\nUse a list when you need len(), indexing, slicing, sorting or more than one pass. Use a generator when you will consume the values once, in order, especially if the data is large or the consumer may stop early, like any(), next() or islice(). Many built-ins accept any iterable, so passing a generator to sum, min, max, any, all, sorted, set, dict or str.join just works.",
      },
      {
        heading: "Pipelines: chaining generators",
        body: "Generators combine like pipes on the command line. One generator reads lines, the next parses each line into a record, the next filters records, and the last step consumes the result. Each stage pulls one item from the stage before it, so only one record is in flight at a time, no matter how big the input is.\n\nyield from other_iterable inside a generator hands out every item of another iterable, which keeps stage functions short. The pipeline is lazy: building it does nothing; work starts only when the final consumer asks for values. That also means a consumer that stops early, like islice(pipeline, 5), stops the whole chain early, so you only read as much of the file as needed.",
        visual: {
          type: "flow",
          title: "A lazy log pipeline, one line at a time",
          steps: [
            { label: "read_lines(path)", detail: "Yields raw lines from the file" },
            { label: "parse(lines)", detail: "Yields a dict per line" },
            { label: "errors(records)", detail: "Yields only level == ERROR" },
            { label: "islice(..., 5)", detail: "Stops after 5, so reading stops too" },
          ],
        },
      },
      {
        heading: "Large files: what really happens, and one trap",
        body: "for line in f reads the file through a buffer (usually several kilobytes), splitting it into lines as you go, so memory stays flat. f.read() and f.readlines() load the whole file, so avoid them for big data. csv.reader and csv.DictReader are lazy too, yielding one row at a time.\n\nThe trap is closing the file too early. If a function opens a file in a with block and returns a generator expression over it, the with block closes the file on return, and the first next() fails with ValueError: I/O operation on closed file. Put the with block inside a generator function (with yield) instead. Then the file stays open while the caller iterates and closes when the generator finishes or is closed.",
        bullets: ["Good: def rows(p): with open(p) as f: yield from f", "Bad: def rows(p): with open(p) as f: return (l for l in f)", "Count lines cheaply: sum(1 for _ in open(path))"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "List comprehension vs generator expression",
        columns: [
          { title: "[x for x in data]", points: ["Builds everything now", "Memory grows with size", "len(), indexing, many passes", "Good for small or reused data"] },
          { title: "(x for x in data)", points: ["Computes on demand", "Tiny, constant memory", "One pass, forward only", "Good for big data or early stop"] },
        ],
      },
      {
        type: "tree",
        title: "Iterables you use every day",
        root: "Iterable",
        children: [
          { label: "Reusable (fresh iterator each loop)", children: ["list, tuple, str", "dict, set", "range"] },
          { label: "Single-use (are iterators)", children: ["generator", "open file", "map, filter, zip", "csv.reader"] },
        ],
      },
    ],
    examples: [
      {
        title: "A hand-written iterator class",
        explanation: "To see the protocol without any magic, write it yourself. Step 1: __iter__ returns self, because the object is its own iterator. Step 2: __next__ returns the next number or raises StopIteration when it reaches zero. Step 3: list() drives it to the end. Step 4: a second list() gets nothing, because the iterator is used up. A generator function does all of this in four lines.",
        code: {
          lang: "python",
          code: "class Countdown:\n    def __init__(self, start):\n        self.current = start\n    def __iter__(self):\n        return self\n    def __next__(self):\n        if self.current <= 0:\n            raise StopIteration\n        self.current -= 1\n        return self.current + 1\n\nc = Countdown(3)\nprint(list(c))   # [3, 2, 1]\nprint(list(c))   # []: the iterator is used up",
        },
      },
      {
        title: "First five errors from a huge log",
        explanation: "app.log may be gigabytes in size. Step 1: read_lines yields lines from inside the with block, so the file stays open while we iterate. Step 2: parse turns each line into a dict. Step 3: errors filters with a generator expression. Step 4: islice takes five results. Because everything is lazy, Python reads only until the fifth error is found, then stops.",
        code: {
          lang: "python",
          code: "from itertools import islice\n\ndef read_lines(path):\n    with open(path, encoding=\"utf-8\") as f:\n        yield from f\n\ndef parse(lines):\n    for line in lines:\n        ts, level, msg = line.rstrip(\"\\n\").split(\" \", 2)\n        yield {\"ts\": ts, \"level\": level, \"msg\": msg}\n\ndef errors(records):\n    return (r for r in records if r[\"level\"] == \"ERROR\")\n\nfirst5 = list(islice(errors(parse(read_lines(\"app.log\"))), 5))",
        },
      },
    ],
    cheatSheet: [
      "A for loop is it = iter(obj) plus next(it) until StopIteration",
      "next(it, default) returns default instead of raising when empty",
      "Calling a generator function runs nothing until the first next()",
      "sum(x * x for x in nums): a lone generator argument needs no extra parentheses",
      "yield from iterable hands out every item of another iterable",
      "Keep the with block inside the generator, or the file closes too early",
      "Need the data twice? Use a list, or call the generator function again",
    ],
    quiz: [
      {
        q: "gen = (x for x in [1, 2, 3]). What does list(gen) + list(gen) give?",
        options: ["[1, 2, 3, 1, 2, 3]", "[1, 2, 3]", "An error", "[]"],
        answer: 1,
        why: "The first list() uses up the generator, so the second one is an empty list.",
      },
      {
        q: "A generator function prints \"start\" on its first line. When is it printed?",
        options: ["When the function is called", "When the module is imported", "On the first next() call", "Never"],
        answer: 2,
        why: "Calling a generator function only creates the generator; the body starts on the first next().",
      },
      {
        q: "Which of these is an iterator (single-use), not just an iterable?",
        options: ["An open file object", "A list", "A range", "A dict"],
        answer: 0,
        why: "Files are their own iterators; lists, ranges and dicts return a fresh iterator for each loop.",
      },
      {
        q: "def rows(p): with open(p) as f: return (l for l in f). What happens when you loop over rows(\"a.txt\")?",
        options: ["It works normally", "It reads the file twice", "It returns an empty list", "ValueError: I/O operation on closed file"],
        answer: 3,
        why: "The with block closes the file as soon as the function returns, before the generator expression reads anything.",
      },
      {
        q: "Why is any(line.startswith(\"ERROR\") for line in f) efficient?",
        options: ["It reads the file in parallel", "It stops at the first matching line", "It caches the file in memory", "It skips empty lines"],
        answer: 1,
        why: "any() stops at the first True, and the lazy generator means no further lines are read.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a generator evens(limit) that yields 0, 2, 4, ... up to and including limit if it is even. Print list(evens(10)).",
        hint: "Loop over range(0, limit + 1, 2) and yield each value.",
        solution: "def evens(limit):\n    for n in range(0, limit + 1, 2):\n        yield n\n\nprint(list(evens(10)))   # [0, 2, 4, 6, 8, 10]",
      },
      {
        level: "medium",
        task: "Write chunked(iterable, size) that yields lists of up to size items, with the last list possibly shorter. It must work on generators, not just lists.",
        hint: "Collect items into a list and yield it when it is full; yield the leftover at the end. (Python 3.12 has itertools.batched, which yields tuples.)",
        solution: "def chunked(iterable, size):\n    chunk = []\n    for item in iterable:\n        chunk.append(item)\n        if len(chunk) == size:\n            yield chunk\n            chunk = []\n    if chunk:\n        yield chunk\n\nprint(list(chunked(range(7), 3)))   # [[0, 1, 2], [3, 4, 5], [6]]",
      },
      {
        level: "hard",
        task: "An access log has the client IP as the first word of each line. Find the 3 busiest IPs in a file of any size, using generators so memory stays small, and skip blank lines.",
        hint: "A generator that yields the first word of each non-blank line can be passed straight into Counter.",
        solution: "from collections import Counter\n\ndef ips(path):\n    with open(path, encoding=\"utf-8\") as f:\n        for line in f:\n            if line.strip():\n                yield line.split(maxsplit=1)[0]\n\nprint(Counter(ips(\"access.log\")).most_common(3))\n# Memory grows with the number of distinct IPs, not the file size.",
      },
    ],
    faq: [
      { q: "What is the difference between yield and return?", a: "return ends the function and sends back one value. yield sends back a value and pauses, so the function can continue and produce more values later." },
      { q: "Can I get the length of a generator?", a: "Not without consuming it. sum(1 for _ in gen) counts the items, but afterwards the generator is empty." },
      { q: "Is a generator faster than a list?", a: "Not always. For small data a list can be a little faster. Generators win on memory and when you can stop early." },
      { q: "How do I restart a generator?", a: "You can't rewind one. Call the generator function again to get a new generator that starts from the beginning." },
    ],
  },

  "idiomatic/decorators": {
    plain: [
      "Sometimes you want extra behaviour around many functions: time them, log their calls, retry them if the network fails. Copying that code into every function is messy. A decorator lets you write the extra behaviour once and attach it with one line, @name, above any function.",
      "This works because in Python a function is a normal object. You can pass it to another function and get a new function back. A decorator is exactly that: a function that takes your function, wraps it in a new one that adds the extra steps, and returns the wrapper.",
      "A context manager does a similar job for a block of code instead of a function. The with statement runs setup before the block and cleanup after it, even if the block crashes. open() is the famous example: the file is always closed, whatever happens inside the with block.",
      "You use both every day already: @property, @dataclass and with open(...) are all examples. Learning to write simple ones yourself lets you remove repeated setup and cleanup code from your projects.",
    ],
    deepDive: [
      {
        heading: "Definition time vs call time",
        body: "A decorator runs once, when Python reaches the def statement, which for module-level functions means when the module is imported. Writing @timer above def slow_sum is the same as defining slow_sum and then running slow_sum = timer(slow_sum). From then on the name slow_sum points to the wrapper.\n\nThe wrapper is what runs on every call. It can still use func because of a closure: an inner function remembers the variables of the outer function that created it, even after the outer function has returned. Keep this split in mind. Code directly inside the decorator (outside the wrapper) runs only once, at import. Code inside the wrapper runs on every call.",
        visual: {
          type: "flow",
          title: "What @timer does when Python reads def slow_sum",
          steps: [
            { label: "Create function", detail: "A function object for slow_sum is built" },
            { label: "Call timer(func)", detail: "The decorator runs once, now" },
            { label: "Build wrapper", detail: "A closure that remembers func" },
            { label: "Rebind the name", detail: "slow_sum now refers to wrapper" },
          ],
        },
      },
      {
        heading: "Why functools.wraps matters",
        body: "Without help, the wrapper replaces the original's identity. slow_sum.__name__ becomes \"wrapper\", its docstring disappears, and help(slow_sum) shows the wrapper's generic signature instead of the real parameters. Logs, tracebacks, pytest output and debuggers all get confusing, especially when ten functions share one decorator.\n\n@functools.wraps(func) on the wrapper copies __name__, __qualname__, __doc__, __module__ and the function's attribute dict onto the wrapper, and stores the original in wrapper.__wrapped__. Tools like inspect.signature follow __wrapped__, so help() shows the real parameters again. There is no good reason to leave it out, so make it a habit for every decorator you write.",
        bullets: ["Without wraps: slow_sum.__name__ == \"wrapper\"", "With wraps: slow_sum.__name__ == \"slow_sum\"", "slow_sum.__wrapped__ gives back the undecorated function"],
      },
      {
        heading: "Decorators with arguments, and stacking",
        body: "@retry(times=3) has an extra layer. Python first calls retry(times=3), which must return the real decorator, which then receives the function and returns the wrapper. So a decorator with arguments is a function that returns a decorator: three nested functions.\n\nYou can stack decorators. With @a above @b above def f, Python applies the closest one first: f = a(b(f)). At call time the outer wrapper from a runs first and calls b's wrapper, which calls f. Order matters: put @functools.cache outside a logging decorator and cached calls are never logged. The standard library has useful ones: @functools.cache and @functools.lru_cache(maxsize=128) remember results, @property, @classmethod and @staticmethod change methods, and @dataclass changes a whole class.",
        bullets: ["@retry(times=3) means retry(times=3)(func)", "@a @b def f means f = a(b(f))", "@functools.cache needs hashable arguments"],
      },
      {
        heading: "The context manager protocol",
        body: "with EXPR as x: calls EXPR.__enter__() and binds its return value to x. When the block ends, Python calls __exit__(exc_type, exc_value, traceback). If the block finished normally, all three are None. If it raised, they describe the exception.\n\nIf __exit__ returns a true value, the exception is swallowed and the program continues after the with block. Returning None (the normal case) lets it propagate. Swallowing errors on purpose is rare; contextlib.suppress(FileNotFoundError) is the clear way to do it. You can open several managers in one statement: with open(a) as src, open(b, \"w\") as dst:. Other useful managers in the standard library: threading.Lock(), tempfile.TemporaryDirectory(), and contextlib.chdir(path) (Python 3.11+).",
        visual: {
          type: "sequence",
          title: "with Timer() as t: body raises an error",
          actors: ["with statement", "Timer object", "Your block"],
          messages: [
            { from: 0, to: 1, label: "__enter__()" },
            { from: 1, to: 0, label: "returns self, bound to t" },
            { from: 0, to: 2, label: "run the block" },
            { from: 2, to: 0, label: "raises ValueError" },
            { from: 0, to: 1, label: "__exit__(ValueError, err, tb)" },
            { from: 1, to: 0, label: "returns None: error propagates" },
          ],
        },
      },
      {
        heading: "@contextmanager: rules for the generator",
        body: "contextlib.contextmanager turns a generator function into a context manager. Code before yield is the setup. The yielded value is what as binds. Code after yield is the cleanup.\n\nTwo rules keep it correct. First, wrap the yield in try/finally. If the with block raises, the exception is thrown into your generator at the yield line, so cleanup written after a bare yield is skipped. Second, yield exactly once; yielding zero times raises RuntimeError: generator didn't yield, and twice raises generator didn't stop. If you need to manage a varying number of resources, for example opening every file in a list, use contextlib.ExitStack, which closes everything you registered in reverse order.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Three-level decorator with arguments: @retry(times=3)",
        layers: [
          { label: "retry(times=3)", detail: "Runs at import; stores the settings" },
          { label: "decorator(func)", detail: "Runs at import; receives the function" },
          { label: "wrapper(...)", detail: "Runs on every call; loops and retries" },
          { label: "func(...)", detail: "Your original function, same arguments" },
        ],
      },
    ],
    examples: [
      {
        title: "A retry decorator with arguments",
        explanation: "Network calls fail now and then. Step 1: retry(times, delay, exceptions) stores the settings and returns decorator. Step 2: decorator receives the function and returns wrapper, keeping the name with functools.wraps. Step 3: wrapper calls the function, catches only the listed exceptions, waits, and tries again. On the last attempt it re-raises with a bare raise, so the caller still sees the real error.",
        code: {
          lang: "python",
          code: "import functools, time\n\ndef retry(times=3, delay=0.5, exceptions=(Exception,)):\n    def decorator(func):\n        @functools.wraps(func)\n        def wrapper(*args, **kwargs):\n            for attempt in range(1, times + 1):\n                try:\n                    return func(*args, **kwargs)\n                except exceptions:\n                    if attempt == times:\n                        raise\n                    time.sleep(delay)\n        return wrapper\n    return decorator",
        },
      },
      {
        title: "Temporarily setting an environment variable",
        explanation: "Tests often need a setting changed for a short time and then restored. Step 1: remember the old value. Step 2: set the new one and yield. Step 3: in finally, put the old value back, or delete the variable if it did not exist. Because of try/finally, the environment is restored even if the code inside the with block fails.",
        code: {
          lang: "python",
          code: "import os\nfrom contextlib import contextmanager\n\n@contextmanager\ndef env_var(name, value):\n    old = os.environ.get(name)\n    os.environ[name] = value\n    try:\n        yield\n    finally:\n        if old is None: os.environ.pop(name, None)\n        else: os.environ[name] = old\n\nwith env_var(\"APP_MODE\", \"test\"):\n    print(os.environ[\"APP_MODE\"])   # test",
        },
      },
    ],
    cheatSheet: [
      "@deco above def f is f = deco(f), run once at definition time",
      "A wrapper takes *args and keyword args, passes all of them to func, and returns func's result",
      "Always put @functools.wraps(func) on the wrapper",
      "@a @b def f means f = a(b(f)); a's wrapper runs first at call time",
      "@functools.cache memoises results for hashable arguments",
      "__exit__ returning True swallows the exception; return None to let it propagate",
      "In @contextmanager, wrap yield in try/finally and yield exactly once",
      "contextlib.suppress(FileNotFoundError) ignores one error type on purpose",
    ],
    quiz: [
      {
        q: "A decorator prints \"registering\" outside its wrapper. When does that print?",
        options: ["Every time the function is called", "Only on the first call", "Never", "Once, when the decorated def is executed (usually at import)"],
        answer: 3,
        why: "The decorator body runs when Python applies it at definition time; only the wrapper runs per call.",
      },
      {
        q: "Your wrapper calls the original function but has no return statement. What do decorated calls return?",
        options: ["None", "The original result", "The wrapper function", "An error"],
        answer: 0,
        why: "A Python function without return gives None, so the original result is lost.",
      },
      {
        q: "With @log above @cache above def f, what happens on a repeated call with the same argument?",
        options: ["Nothing is logged", "The call is logged, then the cached result is returned", "f runs again", "TypeError"],
        answer: 1,
        why: "f = log(cache(f)), so the log wrapper runs on every call and then asks the cache.",
      },
      {
        q: "In a @contextmanager generator, cleanup code is written after a bare yield with no try/finally. The with block raises. What happens?",
        options: ["Cleanup runs normally", "Cleanup runs twice", "The cleanup is skipped because the error is raised at the yield", "The error is swallowed"],
        answer: 2,
        why: "The exception is thrown into the generator at the yield line, so code after it never runs.",
      },
      {
        q: "Which statement about functools.wraps is true?",
        options: ["It makes the wrapper faster", "It copies the name and docstring and sets __wrapped__", "It is required for the decorator to run", "It caches results"],
        answer: 1,
        why: "wraps copies metadata from the original onto the wrapper and links back through __wrapped__.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a @log_calls decorator that prints the function name and its arguments before each call and returns the original result.",
        hint: "Use functools.wraps, accept any positional and keyword arguments, and print func.__name__.",
        solution: "import functools\n\ndef log_calls(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        print(f\"calling {func.__name__} args={args} kwargs={kwargs}\")\n        return func(*args, **kwargs)\n    return wrapper\n\n@log_calls\ndef add(a, b): return a + b\nprint(add(2, b=3))",
      },
      {
        level: "medium",
        task: "Write a class-based context manager Timer that stores the elapsed seconds in t.elapsed, even when the block raises, and never hides the error.",
        hint: "Record time.perf_counter() in __enter__ and return self; compute elapsed in __exit__ and return None.",
        solution: "import time\nclass Timer:\n    def __enter__(self):\n        self.start = time.perf_counter()\n        return self\n    def __exit__(self, exc_type, exc, tb):\n        self.elapsed = time.perf_counter() - self.start\n        # no return: None means exceptions propagate\n\nwith Timer() as t:\n    sum(range(10**6))\nprint(f\"{t.elapsed:.4f}s\")",
      },
      {
        level: "hard",
        task: "Write a context manager atomic_write(path) that gives you a file to write into, and only replaces path if the block succeeds. On an error, the old file must stay untouched.",
        hint: "Write to path + \".tmp\", then os.replace it over path on success; delete the temp file on failure.",
        solution: "import os\nclass atomic_write:\n    def __init__(self, path):\n        self.path, self.tmp = path, path + \".tmp\"\n    def __enter__(self):\n        self.f = open(self.tmp, \"w\", encoding=\"utf-8\")\n        return self.f\n    def __exit__(self, exc_type, exc, tb):\n        self.f.close()\n        if exc_type is None: os.replace(self.tmp, self.path)  # atomic swap\n        else: os.remove(self.tmp)\n        # returning None lets any error propagate",
      },
    ],
    faq: [
      { q: "Can a class be a decorator?", a: "Yes. Anything callable that takes a function and returns a callable works. A class with __call__ can be a decorator, and decorators can also be applied to classes, like @dataclass." },
      { q: "What is the difference between functools.cache and lru_cache?", a: "cache (Python 3.9+) keeps every result forever. lru_cache(maxsize=128) keeps only the most recently used results, which caps memory." },
      { q: "When should I write a context manager instead of try/finally?", a: "When the same setup and cleanup appear in more than one place. A context manager puts that pair in one reusable, well-named object." },
      { q: "Do decorators slow my code down?", a: "Each call goes through one extra function call, which costs well under a microsecond. That only matters inside very hot loops." },
    ],
  },

  "idiomatic/type-hints": {
    plain: [
      "A type hint is a small label in your code that says what kind of value is expected. In def total(prices: list[float]) -> float, the hints say: give me a list of floats, and I give back a float. They are like the labels on the sockets of a machine: they do not stop you plugging in the wrong cable, but they make it obvious.",
      "Python itself ignores the hints when it runs your code. The value comes from tools that read them. Your editor uses them to suggest the right methods and to underline mistakes as you type. A type checker such as mypy or Pyright reads the whole project and reports every place where the types do not fit.",
      "The most common bug they catch is None. A function that can return either a user or None is written -> User | None. If you then call .name on the result without checking, the checker warns you before a user ever sees a crash.",
      "You can add hints step by step. Start with the function signatures that other code calls, run a checker, and fix what it reports. Every hint you add makes the next change a little safer.",
    ],
    deepDive: [
      {
        heading: "What hints are at runtime",
        body: "Hints are stored on the function in __annotations__ and can be read with typing.get_type_hints(f), which is how libraries like dataclasses, Pydantic and FastAPI use them. Python does not check them: total(\"pen\") still runs and fails, or worse, succeeds with a wrong result. That is why you pair hints with a checker.\n\nHints cost almost nothing at runtime. Older code sometimes starts with from __future__ import annotations, which stores hints as strings and lets a class refer to itself before it is fully defined. Since Python 3.14, annotations are evaluated lazily by default (PEP 649), which solves the same forward-reference problem without the import. If you need real runtime validation of outside data, such as JSON from an API, use a library such as Pydantic that reads the hints and checks values.",
      },
      {
        heading: "The vocabulary you need first",
        body: "Built-in types work as hints: int, str, float, bool, bytes. Containers take their item types in square brackets (Python 3.9+): list[int], set[str], dict[str, float]. Tuples list each position, tuple[str, int], or use tuple[int, ...] for any length. X | None (Python 3.10+, same as Optional[X]) means the value may be missing. A | B means either type.\n\nFor parameters, accept the widest thing you actually need. If a function only loops over its input, hint it as Iterable[str] from collections.abc, so callers can pass a list, a set or a generator. If it needs indexing, use Sequence. Return the concrete type you build, like list[str]. Use Any only as a last resort: it switches checking off for that value. Literal[\"r\", \"w\"] restricts a value to exact constants, and Callable[[int], str] describes a function argument.",
        bullets: ["def first(xs: Sequence[str]) -> str | None:", "def load(mode: Literal[\"r\", \"w\"]) -> None:", "def apply(f: Callable[[int], int], x: int) -> int:", "type UserId = int  (alias syntax, Python 3.12+)"],
      },
      {
        heading: "Narrowing: how checkers follow your if statements",
        body: "Type checkers do not just read signatures; they track what each variable can be at each line. If name has type str | None, calling name.upper() is an error, because None has no upper method. After if name is None: return, the checker knows name is a str for the rest of the function. This is called narrowing.\n\nisinstance(x, int), truthiness checks like if name:, early returns and raising all narrow types. When you are unsure what the checker thinks, write reveal_type(x) and run the checker; it prints the inferred type. Avoid silencing errors with cast() or # type: ignore unless you truly know better than the checker; if you must ignore, add the specific error code, like # type: ignore[union-attr], so other problems on that line still show.",
        visual: {
          type: "flow",
          title: "How a checker narrows str | None",
          steps: [
            { label: "name = find(uid)", detail: "Type is str | None" },
            { label: "name.upper()", detail: "Error: None has no attribute upper" },
            { label: "if name is None: return", detail: "The None case leaves the function" },
            { label: "name.upper()", detail: "OK: name is now known to be str" },
          ],
        },
      },
      {
        heading: "Typing classes and dataclasses",
        body: "In methods, leave self unannotated; checkers know what it is. Annotate the other parameters and the return as usual. For a classmethod that builds an instance, return typing.Self (Python 3.11+) so subclasses get the right type. A method that returns nothing is -> None.\n\nDataclasses are typed by design: each field already has a hint, so checkers verify Order(id=\"x\") calls for free. To mark a class-level constant that should not become a dataclass field, annotate it with ClassVar[int]. For a value that must never be reassigned, use Final. When a plain dict has a fixed shape, for example parsed JSON, TypedDict describes its keys and value types without turning it into a class.",
        bullets: ["def from_row(cls, row: dict[str, str]) -> Self:", "MAX_ITEMS: ClassVar[int] = 50 inside a dataclass", "class Movie(TypedDict): title: str; year: int"],
      },
      {
        heading: "Running mypy or Pyright on a project",
        body: "Install a checker in the project's venv: pip install mypy, then run mypy src/ (or mypy . for a small project). Clean output is Success: no issues found in N source files. Errors look like app.py:12: error: Argument 1 to \"total\" has incompatible type \"str\"; expected \"list[Item]\"  [arg-type]. Pyright is the engine behind VS Code's Pylance extension, so you may already see its warnings; run it in the terminal with pip install pyright, then pyright.\n\nOne important default: mypy does not check the bodies of functions that have no annotations at all. Add check_untyped_defs = true under [tool.mypy] in pyproject.toml, or aim for mypy --strict on new code. For third-party packages without built-in hints, install their stub packages, such as types-requests. Run the checker in CI next to your tests so new code stays typed.",
        visual: {
          type: "compare",
          title: "mypy vs Pyright",
          columns: [
            { title: "mypy", points: ["pip install mypy; mypy src/", "Config: [tool.mypy] in pyproject.toml", "Skips unannotated function bodies by default", "--strict for full checking"] },
            { title: "Pyright", points: ["pip install pyright; pyright", "Config: [tool.pyright] in pyproject.toml", "Infers and checks unannotated code too", "Powers Pylance in VS Code"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Choosing a hint",
        root: "What is the value?",
        children: [
          { label: "A simple value", children: ["int, str, float, bool", "Literal[\"a\", \"b\"] for fixed constants"] },
          { label: "Maybe missing", children: ["X | None", "Check for None before use"] },
          { label: "A collection", children: ["list[int], set[str]", "dict[str, float]", "tuple[str, int]"] },
          { label: "Something you only loop over", children: ["Iterable[T] for parameters", "Sequence[T] if you index it"] },
          { label: "A record", children: ["@dataclass fields", "TypedDict for dict-shaped JSON"] },
        ],
      },
    ],
    examples: [
      {
        title: "The checker finds a None bug",
        explanation: "find_user can return None when the id is unknown. Step 1: greet calls .upper() on the result without checking. Step 2: mypy reports the exact line and the reason. Step 3: handle the None case first; after the early return, the checker narrows name to str and the error disappears. At runtime the old version would have crashed only for unknown users, the kind of bug that slips through manual testing.",
        code: {
          lang: "python",
          code: "def find_user(users: dict[int, str], uid: int) -> str | None:\n    return users.get(uid)\n\ndef greet(users: dict[int, str], uid: int) -> str:\n    name = find_user(users, uid)\n    return \"Hello \" + name.upper()\n# mypy: error: Item \"None\" of \"str | None\" has no attribute \"upper\"  [union-attr]\n\ndef greet_fixed(users: dict[int, str], uid: int) -> str:\n    name = find_user(users, uid)\n    if name is None:\n        return \"Hello stranger\"\n    return \"Hello \" + name.upper()",
        },
      },
      {
        title: "A typed dataclass with an alternative constructor",
        explanation: "Step 1: the dataclass fields carry the types. Step 2: from_row returns Self, so a subclass would get its own type back. Step 3: total accepts any Iterable[Expense], so a list, a tuple or a generator all work. Step 4: run mypy --strict expenses.py. If you write total([\"12\"]), mypy reports a list item of the wrong type before the code ever runs.",
        code: {
          lang: "python",
          code: "from collections.abc import Iterable\nfrom dataclasses import dataclass\nfrom typing import Self\n\n@dataclass\nclass Expense:\n    amount: float\n    category: str\n\n    @classmethod\n    def from_row(cls, row: dict[str, str]) -> Self:\n        return cls(float(row[\"amount\"]), row[\"category\"])\n\ndef total(items: Iterable[Expense]) -> float:\n    return sum(e.amount for e in items)",
        },
      },
    ],
    cheatSheet: [
      "def f(name: str, tries: int = 3) -> bool: is the basic signature form",
      "list[int], dict[str, float], tuple[str, int] work directly since Python 3.9",
      "X | None means optional (3.10+); check for None before using the value",
      "Accept Iterable or Sequence in parameters; return concrete types like list",
      "reveal_type(x) makes the checker print what it thinks x is",
      "mypy skips unannotated functions unless check_untyped_defs = true or --strict",
      "Hints are not enforced at runtime; use Pydantic to validate outside data",
    ],
    quiz: [
      {
        q: "def f(x: int) -> int: return x * 2. What does f(\"ab\") do when run with plain python?",
        options: ["Returns \"abab\"", "Raises TypeError because of the hint", "Raises SyntaxError", "Returns None"],
        answer: 0,
        why: "Python ignores hints at runtime, and \"ab\" * 2 is valid string repetition.",
      },
      {
        q: "A function only loops over its argument. Which parameter hint is most flexible?",
        options: ["list[str]", "tuple[str, ...]", "Any", "Iterable[str]"],
        answer: 3,
        why: "Iterable accepts lists, tuples, sets and generators, while still checking the item type.",
      },
      {
        q: "You run mypy on a file where no function has any annotations. Typical result?",
        options: ["Hundreds of errors", "Few or no errors, because mypy skips unannotated function bodies by default", "mypy refuses to run", "It adds hints automatically"],
        answer: 1,
        why: "By default mypy treats unannotated functions as untyped and does not check their bodies.",
      },
      {
        q: "How do you hint a function that returns a list of strings or None?",
        options: ["-> list | str | None", "-> Optional[list] of str", "-> list[str] | None", "-> [str] | None"],
        answer: 2,
        why: "list[str] describes the list's items, and | None adds the missing case.",
      },
      {
        q: "What does reveal_type(x) do?",
        options: ["Converts x to its hinted type", "Makes the type checker report the type it inferred for x", "Prints the type at runtime only", "Raises an error if x has no hint"],
        answer: 1,
        why: "reveal_type is a checker feature for debugging types; imported from typing (3.11+), at runtime it only prints the runtime type.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add type hints to: def average(nums): return sum(nums) / len(nums) if nums else None",
        hint: "The input is a list of numbers; the result is a float or None.",
        solution: "def average(nums: list[float]) -> float | None:\n    return sum(nums) / len(nums) if nums else None\n\n# Passing ints also checks: int is accepted where float is expected.",
      },
      {
        level: "medium",
        task: "Write and type word_index(lines) that maps each word to the sorted list of line numbers where it appears. Run mypy --strict on it.",
        hint: "Accept Iterable[str], return dict[str, list[int]], and use enumerate(lines, start=1).",
        solution: "from collections import defaultdict\nfrom collections.abc import Iterable\n\ndef word_index(lines: Iterable[str]) -> dict[str, list[int]]:\n    index: defaultdict[str, set[int]] = defaultdict(set)\n    for no, line in enumerate(lines, start=1):\n        for word in line.lower().split():\n            index[word].add(no)\n    return {w: sorted(nums) for w, nums in index.items()}\n\n# mypy --strict words.py -> Success: no issues found in 1 source file",
      },
      {
        level: "hard",
        task: "Write a generic function first(items, default) that returns the first item of a sequence or the default, so that first([1, 2], 0) is int and first([\"a\"], \"\") is str for the checker.",
        hint: "Python 3.12+ allows def first[T](...); on older versions use T = TypeVar(\"T\").",
        solution: "from collections.abc import Sequence\nfrom typing import reveal_type   # runtime use needs 3.11+\n\ndef first[T](items: Sequence[T], default: T) -> T:\n    return items[0] if items else default\n\nreveal_type(first([1, 2], 0))     # checker: int\nreveal_type(first([\"a\"], \"\"))    # checker: str\n# Before 3.12:\n# from typing import TypeVar\n# T = TypeVar(\"T\")\n# def first(items: Sequence[T], default: T) -> T: ...",
      },
    ],
    faq: [
      { q: "Do type hints make Python faster?", a: "No. Standard CPython ignores them when running. Tools like mypyc can compile typed code, but that is a separate step." },
      { q: "Should I use List[int] from typing or list[int]?", a: "Use list[int]. The capitalised versions from typing are older and deprecated aliases; built-in generics work since Python 3.9." },
      { q: "mypy or Pyright: which should I use?", a: "Both are good. If you use VS Code, Pyright (through Pylance) already runs as you type; mypy is the long-standing standard in many CI setups. Pick one per project and run it in CI." },
      { q: "Do I need to annotate every variable?", a: "No. Checkers infer most local variable types from their values. Annotate function signatures, and only add variable hints when inference cannot work, like an empty dict you fill later." },
    ],
  },
};

export default extra;
