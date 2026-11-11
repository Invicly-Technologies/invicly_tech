import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "tooling/pytest": {
    plain: [
      "A test is a small piece of code that runs your real code and checks the answer. Instead of starting your program and clicking around after every change, you run one command and see in seconds whether everything still works.",
      "pytest is the most popular tool for this in Python. You write normal functions whose names start with test_, and inside them you use plain assert statements, like assert add(2, 3) == 5. pytest finds these functions, runs them all, and shows a clear report of what passed and what failed.",
      "When a test fails, pytest shows both sides of the comparison, so you can see exactly what came back. A green run gives you confidence to change code. A red run tells you which change broke what, while it is still fresh in your mind.",
      "Two features save a lot of typing. Fixtures prepare things a test needs, such as sample data or a temporary folder. Parametrize runs one test many times with different inputs. Together they let you test many cases with very little code.",
    ],
    deepDive: [
      {
        heading: "How a pytest run works",
        body: "pytest starts from the current folder (or the testpaths you configure) and collects tests: files named test_*.py or *_test.py, functions named test_*, and methods named test_* inside classes named Test* (which must not have an __init__). For each test, it creates the fixtures the test asks for, runs it, then tears the fixtures down.\n\npytest rewrites assert statements when it imports test files, which is how it can show the values on both sides of a failed comparison. The process exit code tells scripts and CI what happened: 0 means all passed, 1 means some failed, 2 means the run was interrupted, and 5 means no tests were collected, often a sign of a naming mistake.",
        bullets: ["pytest -x stops at the first failure", "pytest -k discount runs only tests whose names match", "pytest --lf reruns only the tests that failed last time", "pytest -s shows print() output while tests run"],
        visual: {
          type: "flow",
          title: "One pytest run",
          steps: [
            { label: "Collect", detail: "Find test_*.py files and test_* functions" },
            { label: "Set up fixtures", detail: "Build what each test asks for" },
            { label: "Run the test", detail: "Rewritten asserts record values" },
            { label: "Tear down", detail: "Code after yield in fixtures runs" },
            { label: "Report and exit", detail: "Exit code 0 only if all passed" },
          ],
        },
      },
      {
        heading: "Checking errors and floats properly",
        body: "with pytest.raises(ValueError): passes only if the block raises ValueError (or a subclass). Add match=\"negative\" to also check the message; match is a regular expression searched in str(error). Write with pytest.raises(ValueError) as excinfo: when you want to inspect the error afterwards through excinfo.value. Keep only the one line that should fail inside the block, so an earlier line cannot raise by accident and make the test pass for the wrong reason.\n\nFloats need care: 0.1 + 0.2 == 0.3 is False in Python because of how binary floating point works. Use assert 0.1 + 0.2 == pytest.approx(0.3), which allows a tiny relative difference (one millionth by default). approx also works on lists and dicts of numbers.",
        bullets: ["with pytest.raises(KeyError, match=\"user\"):", "assert total == pytest.approx(19.99)", "assert result == pytest.approx([0.33, 0.67], abs=0.01)"],
      },
      {
        heading: "Fixtures: setup, teardown and scope",
        body: "A fixture is a function marked with @pytest.fixture. A test asks for it simply by naming it as a parameter, and pytest passes in the return value. If the fixture uses yield instead of return, the code after yield runs as teardown, even when the test fails, which is perfect for closing connections or deleting files.\n\nBy default a fixture is rebuilt for every test (scope=\"function\"), so tests cannot leak state into each other. For expensive setup, use scope=\"module\" or scope=\"session\" to share one instance. Put fixtures in a file named conftest.py and every test in that folder can use them without importing anything. Learn three built-ins early: tmp_path gives a fresh temporary folder, monkeypatch changes environment variables or attributes and undoes it after, and capsys captures printed output.",
        visual: {
          type: "sequence",
          title: "A yield fixture around one test",
          actors: ["pytest", "fixture db", "test_add"],
          messages: [
            { from: 0, to: 1, label: "run code before yield" },
            { from: 1, to: 0, label: "yield connection" },
            { from: 0, to: 2, label: "call test_add(db=connection)" },
            { from: 2, to: 0, label: "pass or fail" },
            { from: 0, to: 1, label: "resume after yield: close it" },
          ],
        },
      },
      {
        heading: "Parametrize in more detail",
        body: "@pytest.mark.parametrize(\"a, b, expected\", [(1, 2, 3), (0, 0, 0)]) turns one test function into one test per tuple. Each case is reported on its own, with an id built from the values, like test_add[1-2-3], so one failing case does not hide the others. Pass ids=[\"small\", \"zero\"] for readable names.\n\nStacking two parametrize decorators runs every combination: 3 values times 4 values gives 12 tests. Wrap a single case in pytest.param(..., marks=pytest.mark.xfail) to mark a known bug without deleting the case. Parametrize is ideal for edge cases: empty input, zero, negative numbers, very large values, unusual characters. Writing them as a table makes missing cases easy to spot.",
      },
      {
        heading: "Making tests part of every change",
        body: "A common layout is your code in a package (for example src/tracker/) and tests in a tests/ folder. Configure pytest in pyproject.toml under [tool.pytest.ini_options], for example testpaths = [\"tests\"]. Run python -m pytest rather than plain pytest if imports fail: it adds the current folder to the import path.\n\nThen make running tests automatic. Run the suite before every commit, or let CI (for example GitHub Actions) run it on every push and pull request, so a failing test blocks the merge. Keep unit tests fast, ideally the whole suite in seconds, by avoiding real network calls and big files. The pytest-cov plugin (pytest --cov=tracker) shows which lines were never run by any test, which is a good guide to what to test next.",
        bullets: ["pip install pytest pytest-cov", "python -m pytest -q", "pytest --cov=tracker --cov-report=term-missing"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Built-in fixtures worth knowing",
        root: "pytest fixtures",
        children: [
          { label: "tmp_path", children: ["Fresh temporary folder per test", "A pathlib.Path"] },
          { label: "monkeypatch", children: ["setenv / delenv", "setattr to replace a function", "Undone after the test"] },
          { label: "capsys", children: ["readouterr().out", "Checks what was printed"] },
          { label: "Your own (conftest.py)", children: ["Sample data", "A database connection", "Shared by a whole folder"] },
        ],
      },
    ],
    examples: [
      {
        title: "A fixture with teardown shared through conftest.py",
        explanation: "Several test files need a fresh store backed by a real file. Step 1: put the fixture in conftest.py so every test file can use it without importing. Step 2: build the store inside tmp_path, so real data is never touched. Step 3: yield it to the test; the close() after yield always runs. Step 4: the test only names store as a parameter.",
        code: {
          lang: "python",
          code: "# tests/conftest.py\nimport pytest\nfrom tracker.storage import Store\n\n@pytest.fixture\ndef store(tmp_path):\n    s = Store(tmp_path / \"data.json\")\n    yield s            # the test runs here\n    s.close()          # teardown, even if the test failed\n\n# tests/test_store.py\ndef test_add_then_list(store):\n    store.add(\"coffee\", 3.5)\n    assert store.list() == [(\"coffee\", 3.5)]",
        },
      },
      {
        title: "Testing environment variables and printed output",
        explanation: "greet() reads a name from an environment variable and prints a greeting. Step 1: monkeypatch.setenv sets the variable for this test only and restores it afterwards. Step 2: call the function. Step 3: capsys.readouterr().out returns everything printed so far, including the newline that print adds.",
        code: {
          lang: "python",
          code: "# greet.py\nimport os\ndef greet():\n    name = os.environ.get(\"USER_NAME\", \"friend\")\n    print(f\"Hello, {name}!\")\n\n# test_greet.py\nfrom greet import greet\n\ndef test_greet_uses_env(monkeypatch, capsys):\n    monkeypatch.setenv(\"USER_NAME\", \"Ana\")\n    greet()\n    assert capsys.readouterr().out == \"Hello, Ana!\\n\"",
        },
      },
    ],
    cheatSheet: [
      "Files test_*.py, functions test_*; run with python -m pytest -q",
      "with pytest.raises(ValueError, match=\"negative\"): checks type and message",
      "Compare floats with pytest.approx, never plain ==",
      "Fixtures in conftest.py are available to every test in that folder",
      "yield in a fixture: code after it is teardown and always runs",
      "pytest -x stops at first failure; --lf reruns last failures; -k filters by name",
      "Exit code 5 means no tests were collected: check your file and function names",
    ],
    quiz: [
      {
        q: "pytest reports \"no tests ran\" and exits with code 5. What is the most likely cause?",
        options: ["A test failed", "The test file or functions are not named test_*", "pytest is not installed", "An assert was wrong"],
        answer: 1,
        why: "Exit code 5 means nothing was collected, usually because names do not match pytest's discovery rules.",
      },
      {
        q: "What does assert 0.1 + 0.2 == 0.3 do in a test?",
        options: ["Passes", "Raises TypeError", "Fails, because of floating point rounding; use pytest.approx", "Is skipped by pytest"],
        answer: 2,
        why: "0.1 + 0.2 is 0.30000000000000004 in binary floating point.",
      },
      {
        q: "A fixture has code after its yield statement. When does that code run?",
        options: ["After the test finishes, even if it failed", "Before the test", "Only if the test passed", "Never, yield ends the fixture"],
        answer: 0,
        why: "pytest resumes the fixture after the test as teardown, regardless of the outcome.",
      },
      {
        q: "Two stacked parametrize decorators have 3 and 4 values. How many tests run?",
        options: ["7", "4", "3", "12"],
        answer: 3,
        why: "Stacked parametrize decorators produce every combination: 3 x 4 = 12.",
      },
      {
        q: "Which built-in fixture lets a test set an environment variable that is restored afterwards?",
        options: ["tmp_path", "capsys", "monkeypatch", "request"],
        answer: 2,
        why: "monkeypatch.setenv changes the variable for that test and undoes it at teardown.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write slugify(text) that lowercases text and replaces spaces with hyphens, plus two tests: a normal title and an empty string.",
        hint: "Put the function in slug.py and the tests in test_slug.py, then run python -m pytest -q.",
        solution: "# slug.py\ndef slugify(text):\n    return \"-\".join(text.lower().split())\n\n# test_slug.py\nfrom slug import slugify\n\ndef test_title():\n    assert slugify(\"Hello Big World\") == \"hello-big-world\"\n\ndef test_empty():\n    assert slugify(\"\") == \"\"",
      },
      {
        level: "medium",
        task: "Test apply_discount(price, pct) over at least four cases with readable ids, including a float result, and check that pct above 100 raises ValueError with a message containing \"pct\".",
        hint: "Use parametrize with ids=, pytest.approx for the float case, and pytest.raises(..., match=\"pct\").",
        solution: "import pytest\nfrom pricing import apply_discount\n\n@pytest.mark.parametrize(\"price, pct, expected\", [\n    (100, 10, 90), (50, 0, 50), (20, 100, 0), (19.99, 15, 16.9915),\n], ids=[\"ten\", \"zero\", \"full\", \"float\"])\ndef test_discount(price, pct, expected):\n    assert apply_discount(price, pct) == pytest.approx(expected)\n\ndef test_pct_too_high():\n    with pytest.raises(ValueError, match=\"pct\"):\n        apply_discount(10, 150)",
      },
      {
        level: "hard",
        task: "weather.py has temp(city) which calls requests.get(URL, params={\"city\": city}, timeout=10) and returns r.json()[\"temp\"]. Test it offline, and check which params were sent.",
        hint: "monkeypatch.setattr(weather.requests, \"get\", fake_get) with a fake response that has raise_for_status() and json().",
        solution: "import weather\nclass FakeResponse:\n    def raise_for_status(self): pass\n    def json(self): return {\"temp\": 21.5}\n\ndef test_temp_offline(monkeypatch):\n    calls = []\n    def fake_get(url, **kwargs):\n        calls.append(kwargs.get(\"params\"))\n        return FakeResponse()\n    monkeypatch.setattr(weather.requests, \"get\", fake_get)\n    assert weather.temp(\"Pune\") == 21.5 and calls == [{\"city\": \"Pune\"}]",
      },
    ],
    faq: [
      { q: "pytest or unittest?", a: "unittest is built in and uses classes with methods like self.assertEqual. pytest needs an install but is shorter, has fixtures and parametrize, and can also run unittest-style tests, so most new projects use it." },
      { q: "Why does pytest say ModuleNotFoundError for my own module?", a: "The project folder is not on the import path. Run python -m pytest from the project root, install your package in the venv with pip install -e ., or set pythonpath in the pytest config." },
      { q: "How many tests should I write?", a: "Cover every important behaviour and every bug you fix, plus edge cases like empty input. Coverage reports help find untested code, but 100% coverage is not the goal by itself." },
      { q: "Should tests print things?", a: "No, use asserts. pytest hides output of passing tests anyway; run with -s if you need to see prints while debugging." },
    ],
  },

  "tooling/debugging": {
    plain: [
      "Every programmer writes bugs every day. The skill is not avoiding them completely but finding them quickly. Debugging is detective work: the program did something you did not expect, and you collect evidence until you know why.",
      "Python gives you the first clue for free: the traceback. It is the error report printed when the program crashes. It looks scary, but it always has the same shape, and the most useful part is the very last line, which names the error and gives a short message.",
      "The second tool is a debugger. Instead of adding print() everywhere and running again and again, you pause the program at a line you choose, called a breakpoint. While it is paused you can look at every variable, then move forward one line at a time and watch what changes.",
      "Python has a debugger built in, called pdb, which works in any terminal. VS Code has a graphical one with buttons and a variables panel. Both do the same job. Learn a handful of commands and you will solve bugs in minutes that used to take hours.",
    ],
    deepDive: [
      {
        heading: "Anatomy of a traceback",
        body: "A traceback starts with Traceback (most recent call last):, then lists the chain of calls, oldest at the top. Each entry, called a frame, shows the file, the line number, the function name and the line of code. The last line is the exception type and its message. Since Python 3.11, many tracebacks also mark the exact part of the line that failed with ^ and ~ characters.\n\nRead it from the bottom up. First the error type and message: what went wrong. Then find the lowest frame that is in your own code: that is usually where to look, even if deeper frames are inside a library. If you see During handling of the above exception, another exception occurred, a second error happened inside an except block. The above exception was the direct cause of the following exception means someone used raise ... from err to wrap the original error.",
        visual: {
          type: "layers",
          title: "Reading a traceback, top to bottom",
          layers: [
            { label: "Traceback (most recent call last):", detail: "The header" },
            { label: "Outer frames", detail: "Where the call chain started, often main()" },
            { label: "Your lowest frame", detail: "Usually the line to inspect first" },
            { label: "Library frames", detail: "Inside code you did not write" },
            { label: "ErrorType: message", detail: "Read this first: what went wrong" },
          ],
        },
      },
      {
        heading: "The pdb commands that matter",
        body: "Put breakpoint() on a line, run the program normally, and you get a (Pdb) prompt there. n runs the next line, s steps into a function call, r runs until the current function returns, and c continues to the next breakpoint. p expr prints any expression and pp pretty-prints big dicts. l shows code around the current line, and ll shows the whole function.\n\nw (where) prints the call stack, and u and d move up and down it, so you can inspect the caller's variables too. b 42 sets another breakpoint at line 42, and b 42, total < 0 makes it conditional. q quits. Setting the environment variable PYTHONBREAKPOINT=0 makes every breakpoint() call do nothing, a safety net if one slips into production.",
        bullets: ["n next, s step into, r return, c continue", "p x, pp data, ll list the function", "w where, u up, d down", "b 42, x > 100 sets a conditional breakpoint"],
      },
      {
        heading: "Post-mortem: debugging after the crash",
        body: "You do not always know where to put a breakpoint. Post-mortem debugging lets you inspect the program at the moment it crashed. Run python -m pdb script.py and type c; when an uncaught exception happens, pdb stops right at the failing line with every variable still available. With pytest, run pytest --pdb and you land in the debugger at the first failing assertion or error.\n\nIn an interactive session, run python -i script.py; after the crash you stay in the Python prompt, and import pdb; pdb.pm() opens the debugger on the last error. This is often the fastest route: no code changes, no guessing, just look at what the values really were when it failed.",
        visual: {
          type: "flow",
          title: "Post-mortem with python -m pdb",
          steps: [
            { label: "python -m pdb app.py", detail: "Starts paused on the first line" },
            { label: "c", detail: "Run normally until something breaks" },
            { label: "Uncaught exception", detail: "pdb stops at the failing frame" },
            { label: "p, w, u", detail: "Inspect values and the callers" },
            { label: "Fix, then add a test", detail: "So the bug stays fixed" },
          ],
        },
      },
      {
        heading: "Debugging in VS Code",
        body: "With the Python extension installed (it brings the Python Debugger, based on debugpy), click in the gutter left of a line number to set a red breakpoint dot, then press F5 and choose Python File. When execution stops, the Variables panel shows all locals, Watch tracks expressions you type, Call Stack shows the frames from the traceback, and the Debug Console runs any Python expression in the paused program.\n\nThe default keys: F5 continue, F10 step over, F11 step into, Shift+F11 step out, Shift+F5 stop. Right-click a breakpoint to make it conditional (stop only when count == 500) or turn it into a logpoint that prints a message without pausing, like a print you never have to delete. By default, the debugger skips library code (justMyCode); turn that off in launch.json when the bug is inside a package.",
      },
      {
        heading: "A method, not luck",
        body: "Good debugging follows the scientific method. Reproduce the bug reliably, ideally with the smallest input that still fails. Form one guess about the cause. Test it by inspecting values, not by changing code at random. Change one thing at a time and rerun.\n\nWhen the cause is hard to find, cut the search space in half: check the value halfway through the process; if it is already wrong, the bug is earlier, otherwise later. git bisect applies the same idea to history, finding the commit that introduced a bug. Explaining the code line by line to someone, or even to a rubber duck, often reveals a wrong assumption. Finish by writing a test that fails without your fix, so the same bug cannot return quietly.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Common errors and their usual cause",
        root: "Error on the last line",
        children: [
          { label: "NameError", children: ["Typo in a name", "Used before it was assigned"] },
          { label: "TypeError", children: ["Wrong type, like str + int", "'NoneType' object is not subscriptable: a function returned None"] },
          { label: "AttributeError", children: ["Method on the wrong type", "Often a None you did not expect"] },
          { label: "KeyError / IndexError", children: ["Missing dict key", "List shorter than you thought"] },
          { label: "ModuleNotFoundError", children: ["Package not installed", "Wrong venv is active"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reading a real traceback",
        explanation: "Step 1: the last line says ZeroDivisionError: division by zero. Step 2: the lowest frame is report.py line 9, in summary, and the carets point at total / len(items), so len(items) was 0. Step 3: the frame above shows summary was called with load(\"expenses.json\"), so load returned an empty list. Step 4: the real question is now why the file had no expenses, and whether summary should handle an empty list.",
        code: {
          lang: "text",
          code: "Traceback (most recent call last):\n  File \"/home/ana/tracker/cli.py\", line 41, in <module>\n    main()\n  File \"/home/ana/tracker/cli.py\", line 37, in main\n    print(summary(load(\"expenses.json\")))\n          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n  File \"/home/ana/tracker/report.py\", line 9, in summary\n    return total / len(items)\n           ~~~~~~^~~~~~~~~~~~\nZeroDivisionError: division by zero",
        },
      },
      {
        title: "Post-mortem on a KeyError from a CSV",
        explanation: "A report crashes with KeyError: 'amount' somewhere in thousands of rows. Step 1: run it under pdb and continue until it crashes. Step 2: pdb stops in the generator expression that failed. Step 3: p row shows the bad row: its header says amt, not amount. Step 4: the fix is in the data or in the column name mapping, found without adding a single print.",
        code: {
          lang: "text",
          code: "$ python -m pdb report.py\n> /home/ana/report.py(1)<module>()\n-> import csv\n(Pdb) c\nTraceback (most recent call last):\n  ...\nKeyError: 'amount'\nUncaught exception. Entering post mortem debugging\nRunning 'cont' or 'step' will restart the program\n> /home/ana/report.py(7)<genexpr>()\n-> return sum(float(row[\"amount\"]) for row in rows)\n(Pdb) p row\n{'date': '2026-03-02', 'amt': '4.50', 'category': 'food'}\n(Pdb) q",
        },
      },
    ],
    cheatSheet: [
      "Read tracebacks bottom up: error line first, then the lowest frame in your own code",
      "breakpoint() pauses in pdb; PYTHONBREAKPOINT=0 disables all of them",
      "pdb: n next, s step in, r return, c continue, p x print, w where, q quit",
      "python -m pdb app.py then c: stops at the crash with all variables",
      "pytest --pdb opens the debugger at the first failing test",
      "VS Code: F5 run, F10 step over, F11 step in, Shift+F11 step out",
      "'NoneType' object has no attribute ... means something returned None",
    ],
    quiz: [
      {
        q: "Where does a Python traceback show the error type and message?",
        options: ["On the first line", "On the last line", "In the middle frame", "Only in the log file"],
        answer: 1,
        why: "The final line holds ErrorType: message; the frames above show how the program got there.",
      },
      {
        q: "In pdb, which command runs the current line and stops at the next one without entering called functions?",
        options: ["s", "c", "r", "n"],
        answer: 3,
        why: "n (next) steps over calls; s steps into them.",
      },
      {
        q: "You get TypeError: 'NoneType' object is not subscriptable on data[0]. What is the likely cause?",
        options: ["data is None, often because a function returned nothing", "data is an empty list", "The index must be a string", "Python lists start at 1"],
        answer: 0,
        why: "Subscripting None fails this way; an empty list would give IndexError instead.",
      },
      {
        q: "What is the quickest way to inspect variables at the moment of a crash without editing code?",
        options: ["Add print() calls everywhere", "Read the source again", "Run python -m pdb script.py and continue until it crashes", "Increase the log level"],
        answer: 2,
        why: "pdb enters post-mortem mode at the failing frame, with all values available.",
      },
      {
        q: "During handling of the above exception, another exception occurred. What does this tell you?",
        options: ["The same error happened twice", "A second error was raised inside an except or finally block", "Python retried the code", "It is only a warning"],
        answer: 1,
        why: "Python shows both errors because the second one happened while the first was being handled.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A program stops with TypeError: can only concatenate str (not \"int\") to str on the line msg = \"Total: \" + total. Explain the error and fix it two ways.",
        hint: "total is a number; + between a str and an int is not allowed.",
        solution: "# The last line says a str and an int were joined with +.\n# total is an int, so convert it or use an f-string:\nmsg = \"Total: \" + str(total)\nmsg = f\"Total: {total}\"",
      },
      {
        level: "medium",
        task: "largest([-5, -2, -9]) returns 0 instead of -2. Use pdb to find out why, then fix it.",
        hint: "Put breakpoint() at the start of the loop and print best on each pass with p best.",
        solution: "def largest(nums):\n    best = 0                 # bug: starts above every negative number\n    for n in nums:\n        breakpoint()         # (Pdb) p n, best  -> (-5, 0), (-2, 0) ...\n        if n > best:\n            best = n\n    return best\n# Fix: best = nums[0], or simply return max(nums).",
      },
      {
        level: "hard",
        task: "A loop over 50,000 CSV rows crashes with ValueError: could not convert string to float: '' on one row. Stop exactly on that row, see its line number, and inspect it, without stepping 50,000 times.",
        hint: "Use a conditional breakpoint, or post-mortem debugging, and enumerate the rows so you know the line number.",
        solution: "# report.py, line 12:  amount = float(row[\"amount\"])\n# Option 1: conditional breakpoint in pdb\n#   python -m pdb report.py\n#   (Pdb) b 12, row[\"amount\"].strip() == \"\"\n#   (Pdb) c\n#   (Pdb) p lineno, row\n# Option 2: python -m pdb report.py, then c; at the crash: p lineno, row\n# (loop is: for lineno, row in enumerate(reader, start=2))\n# VS Code: right-click the gutter, Add Conditional Breakpoint, same expression.",
      },
    ],
    faq: [
      { q: "Is print debugging bad?", a: "No, a quick print is fine for small checks. A debugger is better when you need many values, or need to see how they change step by step, and nothing has to be deleted afterwards." },
      { q: "Why does VS Code not stop at my breakpoint?", a: "Usually the code never reached that line, a different file or interpreter is running, or the line is in library code with justMyCode on. Check the selected interpreter in the status bar." },
      { q: "How do I debug code inside a library?", a: "Step into it with s in pdb, or set justMyCode to false in VS Code's launch.json. Remember the bug is usually in how you call the library." },
      { q: "What does the ^^^^ under a line in a traceback mean?", a: "Since Python 3.11 the traceback points at the exact expression that failed, which helps when one line has several calls or operations." },
    ],
  },

  "tooling/lint-format": {
    plain: [
      "Code is read far more often than it is written. When every file uses the same spacing, quotes and line breaks, your eyes can focus on what the code does instead of how it looks. A formatter is a tool that rewrites your files into one standard style automatically.",
      "A linter is a different tool. It reads your code without running it and points out likely mistakes: an import you never use, a variable you assign and forget, a name that does not exist, a comparison that should use is. Many of these are real bugs waiting to happen.",
      "Ruff does both jobs and is extremely fast, so it can check a whole project in a fraction of a second. It replaces several older tools (such as Flake8, isort and Black) with one install and one config section.",
      "Once it is set up, you hardly think about it. Your editor formats the file every time you save, and fixes simple problems for you. The style debates in code review disappear, because the tool decides.",
    ],
    deepDive: [
      {
        heading: "What a linter actually finds",
        body: "Each Ruff rule has a code. The letter prefix says which family it comes from. F rules come from Pyflakes and catch real errors: F401 an unused import, F841 a local variable that is assigned but never used, F821 an undefined name (often a typo). E and W rules come from pycodestyle and cover style, like E711 for == None instead of is None. I rules sort imports, B rules (from flake8-bugbear) catch bug patterns like B006, a mutable default argument such as def f(items=[]), and UP rules upgrade old syntax to modern Python.\n\nOut of the box, Ruff enables only a safe core: the F rules plus the E4, E7 and E9 groups. Add more families with select. Run ruff rule F401 to read a full explanation of any rule, with examples.",
        bullets: ["F401 unused import, F841 unused variable, F821 undefined name", "E711: use is None, not == None", "B006: mutable default argument", "I001: imports are not sorted"],
      },
      {
        heading: "How ruff format decides the style",
        body: "ruff format is designed to produce the same output as Black, the most widely used Python formatter. Defaults: lines up to 88 characters, double quotes, four-space indents, and spaces around operators. When a call is too long, it is split one argument per line. If you add a trailing comma after the last item yourself (the magic trailing comma), the formatter keeps the list exploded, one item per line, even if it would fit.\n\nFormatting never changes what code does, and it does not remove unused imports: that is the linter's job. In CI, run ruff format --check . to fail if any file is not formatted, or ruff format --diff . to see the changes without writing them. For a hand-aligned table you want to keep, wrap it in # fmt: off and # fmt: on comments.",
      },
      {
        heading: "Fixing automatically, and safely",
        body: "ruff check --fix applies the fixes Ruff marks as safe, meaning they keep the code's behaviour, like removing an unused import or sorting imports. Some fixes are unsafe, because they might change behaviour, for example deleting an unused variable whose right-hand side calls a function. Those are applied only with --unsafe-fixes, so review the diff when you use it. --diff previews fixes without changing files.\n\nWhen a warning is wrong for one line, silence just that rule on that line with a comment like # noqa: F401, and never a bare # noqa that hides everything. For whole groups of files, use per-file-ignores in the config, for example allowing unused imports in __init__.py files that re-export names. ruff check --watch reruns on every save if you like working in the terminal.",
        visual: {
          type: "compare",
          title: "Safe vs unsafe fixes",
          columns: [
            { title: "Safe (--fix)", points: ["Remove unused import", "Sort imports", "Upgrade old syntax", "Behaviour is unchanged"] },
            { title: "Unsafe (--unsafe-fixes)", points: ["Delete an unused variable", "Might drop a side effect", "Review the diff first", "Off by default"] },
          ],
        },
      },
      {
        heading: "Configuring Ruff in pyproject.toml",
        body: "Settings live under [tool.ruff] in pyproject.toml (or in a ruff.toml file, without the tool.ruff prefix). Top-level options apply to both tools: line-length = 100 and target-version = \"py312\", which tells Ruff which Python syntax it may assume. Linter options go under [tool.ruff.lint]: select lists rule families to enable, ignore removes single rules, and [tool.ruff.lint.per-file-ignores] tunes rules by path. Formatter options go under [tool.ruff.format], such as quote-style = \"single\".\n\nA good starting set for a new project is select = [\"E\", \"F\", \"I\", \"B\", \"UP\"]. Turn on more only when you understand what each family checks, otherwise the warnings become noise that everyone learns to ignore.",
      },
      {
        heading: "Running it everywhere, automatically",
        body: "Tools only help if they run every time. In VS Code, install the Ruff extension (charliermarsh.ruff), set it as the default Python formatter, and turn on format on save; codeActionsOnSave with source.fixAll and source.organizeImports applies safe fixes and sorts imports on save too.\n\nA second safety net is a Git pre-commit hook. The pre-commit framework with the official ruff-pre-commit hooks runs Ruff on the changed files before each commit. The final net is CI: run ruff check . and ruff format --check . on every push, so unformatted or failing code cannot be merged. Pin the Ruff version in your requirements so everyone gets identical results, because new versions can add rules or change formatting slightly.",
        visual: {
          type: "flow",
          title: "Three places Ruff runs",
          steps: [
            { label: "Editor on save", detail: "Formats and fixes as you work" },
            { label: "pre-commit hook", detail: "Checks changed files before each commit" },
            { label: "CI on push", detail: "ruff check . and ruff format --check ." },
            { label: "Merge allowed", detail: "Only clean code reaches main" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Formatter vs linter",
        columns: [
          { title: "ruff format", points: ["Changes how code looks", "Spacing, quotes, line breaks", "Never changes behaviour", "No warnings, just rewrites"] },
          { title: "ruff check", points: ["Finds likely bugs and bad patterns", "Reports rule codes like F401", "Some issues auto-fixable", "Configured with select and ignore"] },
        ],
      },
    ],
    examples: [
      {
        title: "What Ruff finds in a small file",
        explanation: "Step 1: run ruff check app.py with the default rules. Step 2: read the findings: two unused imports on one line, an unused variable, and a None comparison. Step 3: ruff check --fix removes the unused imports, which is safe. Step 4: enable the B family and Ruff also flags items=[], the shared mutable default bug from the functions topic. The other two need a small manual edit.",
        code: {
          lang: "python",
          code: "# app.py\nimport os, sys\n\ndef add_item(item, items=[]):\n    unused = 1\n    if item == None:\n        return items\n    items.append(item)\n    return items\n\n# ruff check app.py (default rules) reports:\n#   E401 multiple imports on one line   F401 os, sys imported but unused\n#   F841 local variable never used      E711 comparison to None\n# with select = [\"E\", \"F\", \"B\"] it also reports:\n#   B006 mutable default argument items=[]",
        },
      },
      {
        title: "A project configuration and a CI check",
        explanation: "Step 1: add the config to pyproject.toml: a 100-character limit, Python 3.12 syntax, and a useful rule set. Step 2: let the formatter handle long lines, so E501 (line too long) is ignored. Step 3: allow unused imports in __init__.py, where they re-export names. Step 4: in CI, run both commands; either one fails the build if something is wrong.",
        code: {
          lang: "toml",
          code: "[tool.ruff]\nline-length = 100\ntarget-version = \"py312\"\n\n[tool.ruff.lint]\nselect = [\"E\", \"F\", \"I\", \"B\", \"UP\"]\nignore = [\"E501\"]\n\n[tool.ruff.lint.per-file-ignores]\n\"__init__.py\" = [\"F401\"]\n\n# CI steps:\n#   ruff check .\n#   ruff format --check .",
        },
      },
    ],
    cheatSheet: [
      "pip install ruff; then ruff format . and ruff check .",
      "ruff check --fix applies safe fixes; --unsafe-fixes only after reviewing",
      "ruff format --check . fails CI if any file needs formatting",
      "ruff rule F401 explains a rule with examples",
      "# noqa: F401 silences one rule on one line; avoid bare # noqa",
      "Good starter: select = [\"E\", \"F\", \"I\", \"B\", \"UP\"] under [tool.ruff.lint]",
      "Default line length is 88; set line-length under [tool.ruff]",
    ],
    quiz: [
      {
        q: "Which command removes an unused import?",
        options: ["ruff check --fix .", "ruff format .", "ruff format --check .", "ruff rule F401"],
        answer: 0,
        why: "Removing imports is a lint fix; the formatter only changes layout.",
      },
      {
        q: "What does rule F821 (undefined name) usually point to?",
        options: ["A line that is too long", "Unsorted imports", "A typo in a variable or function name", "Wrong indentation"],
        answer: 2,
        why: "Pyflakes reports names that are never defined, which is very often a misspelling.",
      },
      {
        q: "Which rules does Ruff enable when you do not configure select?",
        options: ["All rules", "Only formatting rules", "None", "The F rules plus the E4, E7 and E9 groups"],
        answer: 3,
        why: "Ruff starts with a small, reliable core so default output is mostly real problems.",
      },
      {
        q: "You add a trailing comma after the last argument of a call that fits on one line. What does ruff format do?",
        options: ["Removes the comma", "Keeps the call split one argument per line", "Reports an error", "Moves the call to a new line"],
        answer: 1,
        why: "The magic trailing comma tells the formatter to keep the collection exploded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install Ruff in your venv, write a messy file with odd spacing and single quotes, run ruff format on it, and compare before and after.",
        hint: "Use ruff format --diff file.py first to preview, then ruff format file.py.",
        solution: "pip install ruff\nprintf \"x=[1,2 ,3]\\ndef f( a,b ):\\n  return {'a':a,'b':b}\\n\" > messy.py\nruff format --diff messy.py   # preview\nruff format messy.py\ncat messy.py\n# x = [1, 2, 3]\n#\n#\n# def f(a, b):\n#     return {\"a\": a, \"b\": b}",
      },
      {
        level: "medium",
        task: "Turn on import sorting and bugbear rules for your project, fix everything safe automatically, and list what is left.",
        hint: "Add \"I\" and \"B\" to select under [tool.ruff.lint], then run check with --fix.",
        solution: "# pyproject.toml\n# [tool.ruff.lint]\n# select = [\"E\", \"F\", \"I\", \"B\"]\nruff check --fix .        # sorts imports, removes unused ones\nruff check .              # what is left needs a manual fix\nruff check --statistics . # counts per rule code",
      },
      {
        level: "hard",
        task: "Make Ruff format and fix on save in VS Code, and make CI fail when code is unformatted or has lint errors.",
        hint: "Use the charliermarsh.ruff extension and editor settings scoped to [python]; in CI run check and format --check.",
        solution: "// .vscode/settings.json\n{\n  \"[python]\": {\n    \"editor.defaultFormatter\": \"charliermarsh.ruff\",\n    \"editor.formatOnSave\": true,\n    \"editor.codeActionsOnSave\": {\n      \"source.fixAll\": \"explicit\",\n      \"source.organizeImports\": \"explicit\"\n    }\n  }\n}\n// CI: ruff check . && ruff format --check .",
      },
    ],
    faq: [
      { q: "Do I still need Black or Flake8 if I use Ruff?", a: "Usually not. ruff format is designed to match Black, and ruff check covers Flake8, isort and many plugins. Running both formatters would only fight each other." },
      { q: "Is Ruff a type checker?", a: "No. Ruff checks style and common mistakes; it does not verify types. Use mypy or Pyright alongside it." },
      { q: "Should I reformat an old project in one go?", a: "Yes, but in a separate commit that contains only formatting, so the history of real changes stays readable. Git can skip that commit in blame using a .git-blame-ignore-revs file." },
      { q: "What line length should I use?", a: "88 is the default and works well. Many teams use 100 or 120; pick one and put it in the config so everyone and every tool agrees." },
    ],
  },

  "tooling/git-basics": {
    plain: [
      "Git is a tool that remembers every saved version of your project. Each saved version is called a commit. If you break something, you can see exactly what changed and go back. If you want to try a risky idea, you can do it on the side and throw it away if it fails.",
      "Saving a version takes two steps. First you choose which changes to include with git add; this is called staging. Then git commit saves them with a short message saying what you did and why. The two steps let you split a messy afternoon of work into clean, separate commits.",
      "A branch is a separate line of work. You make a branch for a new feature, commit on it as much as you like, and main stays safe and working. When the feature is done, you merge it back into main.",
      "GitHub is a website that stores a copy of your repository online. Pushing your commits there backs up your work, lets you work from other computers, and shows your projects to others. For a learner, a GitHub profile full of small finished projects is also a great portfolio.",
    ],
    deepDive: [
      {
        heading: "What a commit really is",
        body: "A Git repository is your project folder plus a hidden .git folder that stores the history. A commit is a snapshot of every tracked file at one moment, plus the author, the date, the message and a pointer to the previous commit (its parent). Each commit gets an ID, a long hash like 3f9a1c2..., which you usually shorten to the first seven characters.\n\nBecause each commit points to its parent, history forms a chain. A branch is just a name that points to one commit, and HEAD is Git's way of saying \"the branch you are on now\". When you commit, the current branch name moves forward to the new commit. That is why creating a branch is instant: Git only writes a tiny pointer, it does not copy any files.",
        bullets: ["git log --oneline --graph --all shows the history as a graph", "git show 3f9a1c2 shows one commit's changes", "git diff shows unstaged changes; git diff --staged shows what will be committed"],
      },
      {
        heading: "Good commits and how to undo mistakes",
        body: "A good commit contains one logical change, such as \"Add CSV export\" or \"Fix total for empty list\", and the code works after it. Write the subject line in the imperative mood, short (around 50 characters), and add a body after a blank line if the reason is not obvious. git add -p lets you stage only some parts of a file, so unrelated edits can go into separate commits.\n\nMost mistakes are easy to undo. git restore --staged file unstages it but keeps your edits. git restore file throws away unstaged edits for good, so be careful. git commit --amend fixes the last commit's message or adds a forgotten file, but only do that before pushing. For a commit already pushed and shared, use git revert followed by its ID: it creates a new commit that undoes the old one, without rewriting history.",
      },
      {
        heading: "A .gitignore that fits Python projects",
        body: "Some files must never be committed: your virtual environment (.venv/), bytecode caches (__pycache__/ and *.pyc), tool caches (.pytest_cache/, .ruff_cache/, .mypy_cache/), build output (dist/, build/, *.egg-info/), editor folders, and above all secrets in .env files. List them in a file named .gitignore at the repository root. GitHub publishes a ready-made Python template, which is a good start.\n\nPattern rules: a trailing slash matches only folders, a leading slash anchors to the repository root, * matches anything except a slash, and ! re-includes something excluded earlier. One surprise: .gitignore only affects untracked files. If a file is already committed, ignoring it does nothing until you run git rm --cached file, which stops tracking it but keeps it on disk.",
        bullets: [".venv/ and __pycache__/ and *.pyc", ".env (commit a .env.example with dummy values instead)", "git check-ignore -v path explains which rule matched"],
      },
      {
        heading: "Branches, merges and conflicts",
        body: "git switch -c add-export creates a branch and moves to it; git switch main goes back. When you run git merge add-export on main, there are two cases. If main has not moved since you branched, Git just slides the main pointer forward to your latest commit: a fast-forward, with no new commit. If both branches have new commits, Git creates a merge commit with two parents.\n\nIf both sides changed the same lines, Git cannot choose and reports a conflict. The file then contains both versions between markers: <<<<<<< HEAD, your current branch's version, =======, then the other branch's version, ending with >>>>>>> and the branch name. Edit the file to the correct final text, delete the markers, git add the file, and git commit to finish. git merge --abort cancels and returns to before the merge.",
        visual: {
          type: "flow",
          title: "Resolving a merge conflict",
          steps: [
            { label: "git merge feature", detail: "CONFLICT (content): Merge conflict in report.py" },
            { label: "git status", detail: "Lists files with conflicts as both modified" },
            { label: "Edit the file", detail: "Keep the right code, delete the markers" },
            { label: "git add report.py", detail: "Marks the conflict as resolved" },
            { label: "git commit", detail: "Creates the merge commit" },
          ],
        },
      },
      {
        heading: "Pushing to GitHub, and a README people can use",
        body: "Create an empty repository on GitHub (without adding a README there, so histories do not clash). Then connect and push: git remote add origin with the repository URL, git branch -M main to make sure your branch is called main (older Git versions default to master), and git push -u origin main. The -u sets the upstream, so later a plain git push and git pull know where to go. git pull is a fetch (download new commits) followed by a merge.\n\nGitHub does not accept your account password for Git over HTTPS. Use the GitHub CLI (gh auth login), a personal access token, or an SSH key with a git@github.com: URL. A README.md at the root is the front page of the repository. It should say what the project does, how to install it, one or two usage examples with real commands, and how to run the tests.",
        visual: {
          type: "tree",
          title: "What a useful README contains",
          root: "README.md",
          children: [
            { label: "What and why", children: ["One-sentence description", "A screenshot or sample output"] },
            { label: "Install", children: ["python -m venv .venv", "pip install -r requirements.txt"] },
            { label: "Usage", children: ["2 or 3 real commands", "Expected output"] },
            { label: "Development", children: ["How to run tests", "How to run Ruff"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Undo tools: which one when",
        columns: [
          { title: "Not committed yet", points: ["git restore --staged f: unstage", "git restore f: discard edits", "Edits gone for good with restore", "Nothing shared, no risk to others"] },
          { title: "Committed, not pushed", points: ["git commit --amend: fix last commit", "git reset --soft HEAD~1: uncommit, keep changes", "Rewrites local history only", "Fine because nobody has it"] },
          { title: "Already pushed", points: ["git revert ID: new undo commit", "History stays intact", "Safe for shared branches", "Never force-push shared main"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing three everyday mistakes",
        explanation: "Mistake 1: you staged notes.txt by accident; unstage it and keep the file. Mistake 2: the last commit message has a typo and is not pushed yet; amend it. Mistake 3: .env with a real password was committed; add it to .gitignore and stop tracking it. The password is still in older commits, so treat it as leaked and change it. Finally, revert a bad commit that was already pushed.",
        code: {
          lang: "bash",
          code: "git restore --staged notes.txt          # unstage, keep the edits\ngit commit --amend -m \"Add CSV export\"  # fix last message (not pushed yet)\n\necho \".env\" >> .gitignore\ngit rm --cached .env                    # stop tracking, keep the file on disk\ngit commit -m \"Stop tracking .env\"\n# then rotate the leaked password: it is still in history\n\ngit log --oneline -5                    # find the bad pushed commit, e.g. a1b2c3d\ngit revert a1b2c3d                      # new commit that undoes it",
        },
      },
      {
        title: "A feature branch with a conflict",
        explanation: "Step 1: create a branch and change how totals are rounded. Step 2: meanwhile main changed the same line. Step 3: merging reports a conflict, and the file shows both versions between markers. Step 4: choose the final line, delete the markers, stage and commit. Step 5: delete the merged branch to keep things tidy.",
        code: {
          lang: "bash",
          code: "git switch -c fix-rounding\n# edit report.py, then: git commit -am \"Round totals to 2 places\"\ngit switch main\ngit merge fix-rounding\n# CONFLICT (content): Merge conflict in report.py\n# report.py now contains:\n#   <<<<<<< HEAD\n#       return round(total)\n#   =======\n#       return round(total, 2)\n#   >>>>>>> fix-rounding\n# keep the correct line, delete the 3 marker lines, then:\ngit add report.py && git commit --no-edit\ngit branch -d fix-rounding",
        },
      },
    ],
    cheatSheet: [
      "git status and git diff first; git diff --staged shows what the next commit contains",
      "git add -p stages parts of a file, so each commit stays focused",
      "git switch -c name creates a branch; git switch main goes back",
      "git log --oneline --graph --all shows branches and merges",
      "Ignoring a tracked file needs git rm --cached file as well",
      "Amend or reset only unpushed commits; use git revert for pushed ones",
      "git push -u origin main once; later just git push and git pull",
      "A committed secret is leaked even after deletion: rotate it",
    ],
    quiz: [
      {
        q: "You added secrets.txt to .gitignore, but git status still shows it as modified. Why?",
        options: [".gitignore needs a restart", "The file is already tracked; run git rm --cached secrets.txt", "The pattern needs a leading slash", "Git ignores .gitignore on main"],
        answer: 1,
        why: ".gitignore only affects untracked files; a tracked file stays tracked until removed from the index.",
      },
      {
        q: "Which command safely undoes a commit that teammates have already pulled?",
        options: ["git reset --hard HEAD~1 then force-push", "git commit --amend", "git restore", "git revert followed by the commit ID"],
        answer: 3,
        why: "revert adds a new commit that undoes the change, without rewriting shared history.",
      },
      {
        q: "You merge feature into main and main has no new commits since you branched. What happens?",
        options: ["A fast-forward: main simply moves to feature's latest commit", "A merge conflict", "A merge commit with two parents", "Git refuses to merge"],
        answer: 0,
        why: "With no diverging history, Git just moves the branch pointer forward.",
      },
      {
        q: "What does git add do?",
        options: ["Uploads files to GitHub", "Creates a new branch", "Stages changes for the next commit", "Saves a commit"],
        answer: 2,
        why: "add moves changes into the staging area; commit then saves exactly what is staged.",
      },
      {
        q: "git push asks for a password and rejects your GitHub account password. What should you use instead?",
        options: ["A longer password", "A personal access token, gh auth login, or an SSH key", "git push --force", "Your email address"],
        answer: 1,
        why: "GitHub no longer accepts account passwords for Git operations over HTTPS.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Turn a project folder into a repository with a Python .gitignore and a first commit, and check that .venv is not included.",
        hint: "Create .gitignore before running git add .",
        solution: "cd tracker\ngit init\nprintf \".venv/\\n__pycache__/\\n*.pyc\\n.env\\n.pytest_cache/\\n.ruff_cache/\\n\" > .gitignore\ngit add .\ngit status            # .venv/ must not appear\ngit commit -m \"Initial commit\"\ngit log --oneline",
      },
      {
        level: "medium",
        task: "Create a branch add-readme, commit a README.md on it, merge it into main, delete the branch and show the history graph.",
        hint: "Since main did not move, the merge will be a fast-forward.",
        solution: "git switch -c add-readme\nprintf \"# Tracker\\n\\nTrack expenses from the command line.\\n\" > README.md\ngit add README.md\ngit commit -m \"Add README\"\ngit switch main\ngit merge add-readme      # Fast-forward\ngit branch -d add-readme\ngit log --oneline --graph --all",
      },
      {
        level: "hard",
        task: "Publish the project to a new empty GitHub repository, set the upstream, then push a feature branch so it can be opened as a pull request.",
        hint: "Use git remote add origin, git branch -M main and git push -u; with the GitHub CLI, gh repo create can do the first steps.",
        solution: "git remote add origin https://github.com/you/tracker.git\ngit branch -M main\ngit push -u origin main\ngit switch -c add-export\n# ...edit, test, commit...\ngit push -u origin add-export\n# GitHub shows a \"Compare & pull request\" button for add-export\n# With the GitHub CLI instead:\n# gh repo create tracker --public --source=. --push\n# gh pr create --fill",
      },
    ],
    faq: [
      { q: "What is the difference between Git and GitHub?", a: "Git is the version control program that runs on your computer. GitHub is a website that hosts Git repositories and adds pull requests, issues and collaboration features." },
      { q: "What is the difference between git fetch and git pull?", a: "fetch downloads new commits from the remote but does not change your files. pull does a fetch and then merges (or rebases) them into your current branch." },
      { q: "Should my branch be called main or master?", a: "Either works, but main is the default on GitHub. Set git config --global init.defaultBranch main so new repositories start with main." },
      { q: "I committed an API key. Is deleting the file enough?", a: "No. It is still in the history, and if it was pushed, assume it is compromised. Revoke and replace the key first, then clean the history with a tool like git filter-repo if needed." },
    ],
  },
};

export default extra;
