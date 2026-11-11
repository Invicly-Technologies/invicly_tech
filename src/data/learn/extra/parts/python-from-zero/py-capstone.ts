import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "py-capstone/py-capstone-plan": {
    plain: [
      "Before you build a house, you draw a plan. A program is the same. A one-page plan tells you what to build first, what can wait, and where each piece of code will live. It takes an hour or two and saves days of rewriting.",
      "Start with features. Write the few things the program must do to be useful, and keep a separate list of nice ideas for later. A small list you finish is much better than a big list you abandon halfway.",
      "Then describe your data. What does one expense, one weather reading or one task look like? Write it as a Python dataclass with a name and a type for every field. When the data is clear, most of the code becomes obvious.",
      "Finally, split the work into modules, one file per job: one for the data model, one for saving and loading, one for the web API, one for the command line. Each file stays small, easy to read and easy to test.",
    ],
    deepDive: [
      {
        heading: "Turning ideas into a feature list you can test",
        body: "Write each must-have feature as a short user story and an example: \"I can add an expense\" becomes tracker add 12.50 --category food, which prints Added 12.50 (food). These examples are your acceptance criteria: when the real program prints that, the feature is done. They also become your first tests and the usage section of your README.\n\nSort ideas into must-have and nice-to-have honestly. A useful test is: \"Is the tool still useful without this?\" If yes, it waits. For a first capstone, three to five must-haves is plenty, for example add, list by month, totals by category, and one API feature such as currency conversion. Also write down what is out of scope (no web interface, no multiple users). Saying no early protects your time.",
        bullets: ["One line per feature: command, then expected output", "Must-have: the tool is useless without it", "Nice-to-have: parked in a list, not in the code"],
        visual: {
          type: "flow",
          title: "From idea to a buildable spec",
          steps: [
            { label: "Brain dump", detail: "Every idea, no filtering" },
            { label: "Must vs nice", detail: "Keep 3 to 5 must-haves" },
            { label: "Example commands", detail: "Input and expected output" },
            { label: "Data model", detail: "Dataclasses with typed fields" },
            { label: "Modules", detail: "One job per file" },
          ],
        },
      },
      {
        heading: "Designing the dataclass model",
        body: "Look at your example commands and ask what information each one needs. Every noun that you store (expense, category, rate) is a candidate type. Give every field a precise type: decimal.Decimal for money (floats cannot store 0.10 exactly), datetime.date for days, an Enum for a fixed set of choices like categories, and str for free text.\n\nGive each stored record a stable id, for example uuid.uuid4().hex, so you can delete or edit it later. Put required fields first and fields with defaults last, because dataclasses require that order. Mutable defaults like a list need field(default_factory=list). Simple validation, such as rejecting a negative amount, fits in __post_init__. Decide now how the model becomes JSON: dates as ISO strings (2026-03-01), Decimals as strings, Enums by their value. Writing to_dict and from_dict by hand keeps this explicit.",
        bullets: ["@dataclass(frozen=True) for values that should never change", "tags: list[str] = field(default_factory=list)", "def __post_init__(self): raise ValueError on bad data"],
      },
      {
        heading: "Module responsibilities and the direction of imports",
        body: "A layout that works for most small CLI apps: models.py holds dataclasses and Enums and imports nothing from your project. storage.py reads and writes files and knows only about models. rates.py (or api.py) talks to the web API. service.py holds the real logic, like adding an expense or computing totals, using models, storage and rates. cli.py parses arguments, calls the service and prints results.\n\nThe key rule: imports point one way, from the top layer down. models never imports cli, and storage never imports service. This avoids circular imports (two modules importing each other, which fails at start-up) and means you can test lower layers without the ones above. Printing and sys.exit belong only in cli.py; lower layers return values or raise exceptions.",
        visual: {
          type: "layers",
          title: "Who may import whom (top imports below)",
          layers: [
            { label: "cli.py", detail: "argparse, printing, exit codes" },
            { label: "service.py", detail: "Business rules: add, list, summarise" },
            { label: "storage.py and rates.py", detail: "Files and the network" },
            { label: "models.py", detail: "Dataclasses and Enums, no project imports" },
          ],
        },
      },
      {
        heading: "Choosing storage and configuration",
        body: "For a personal CLI, a single JSON file is a good first choice: human readable, easy to back up and handled by the standard library. Add a top-level version field, like {\"version\": 1, \"expenses\": [...]}, so a future version of your program can recognise and upgrade old files. If you expect thousands of records or need queries, the built-in sqlite3 module is the next step up, with no server to install.\n\nDecide where the file lives. Hard-coding a path in your project folder works only on your laptop. A better default is a file in the user's home directory, overridable with an option like --file or an environment variable such as TRACKER_FILE. Configuration that varies by user, like an API key, also comes from environment variables. Write these decisions into the spec so you do not invent them under pressure later.",
      },
      {
        heading: "Milestones that always leave a working program",
        body: "Break the build into milestones, and make each one end in a program that runs and is committed to Git. A typical order: models with tests, then storage with a save and load test, then the add and list commands, then summaries, then the API call, then the README. If you run out of time, you still have a working, smaller tool instead of many half-finished parts.\n\nEstimate each milestone in hours and note the risks. Common ones are an API that needs sign-up or has a low rate limit, date and currency edge cases, and scope creep (adding features nobody asked for). Many developers write the README usage section first, because explaining how the tool will be used often reveals missing or confusing features before any code exists.",
        bullets: ["Each milestone: code, tests pass, git commit", "Check the API's sign-up, limits and response format on day one", "Re-read the must-have list before starting anything new"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A planned project layout",
        root: "expense-tracker/",
        children: [
          { label: "pyproject.toml", children: ["Name, dependencies", "[project.scripts] tracker", "Ruff and pytest config"] },
          { label: "src/tracker/", children: ["models.py", "storage.py", "rates.py", "service.py", "cli.py"] },
          { label: "tests/", children: ["test_models.py", "test_storage.py", "test_service.py", "test_cli.py"] },
          { label: "README.md", children: ["Install", "Usage examples", "Configuration"] },
          { label: ".gitignore", children: [".venv/", "__pycache__/", "Local data files"] },
        ],
      },
    ],
    examples: [
      {
        title: "A one-page spec for an expense tracker",
        explanation: "Step 1: one sentence says what the tool is for. Step 2: must-haves are written as commands with expected output. Step 3: nice-to-haves and out-of-scope items are listed so they do not creep in. Step 4: storage and configuration decisions are written down. This page is short enough to read in two minutes and precise enough to build from.",
        code: {
          lang: "text",
          code: "Goal: track personal expenses from the terminal.\n\nMust-have\n  tracker add 12.50 --category food   -> Added 12.50 (food)\n  tracker list --month 2026-03        -> table of that month\n  tracker summary --by category       -> total per category\n  tracker convert --to USD            -> monthly total in USD (web API)\nNice-to-have: CSV export, budgets, recurring expenses\nOut of scope: web UI, multiple users, cloud sync\n\nStorage: ~/.tracker.json {\"version\": 1, \"expenses\": [...]}\nConfig: --file overrides path; RATES_API_KEY from environment\nModules: models, storage, rates, service, cli",
        },
      },
      {
        title: "The model sketch with validation and JSON conversion",
        explanation: "Step 1: the Category Enum fixes the allowed values. Step 2: the dataclass uses Decimal and date, with the id generated by default_factory. Step 3: __post_init__ rejects negative amounts. Step 4: to_dict decides now how each type is stored in JSON, so storage.py stays simple.",
        code: {
          lang: "python",
          code: "import enum, uuid\nfrom dataclasses import dataclass, field\nfrom datetime import date\nfrom decimal import Decimal\nclass Category(enum.Enum): FOOD = \"food\"; TRAVEL = \"travel\"; OTHER = \"other\"\n@dataclass\nclass Expense:\n    amount: Decimal\n    category: Category\n    spent_on: date\n    id: str = field(default_factory=lambda: uuid.uuid4().hex)\n    def __post_init__(self):\n        if self.amount < 0: raise ValueError(\"amount must be positive\")\n    def to_dict(self):\n        return {\"id\": self.id, \"amount\": str(self.amount), \"category\": self.category.value, \"spent_on\": self.spent_on.isoformat()}",
        },
      },
    ],
    cheatSheet: [
      "Write each must-have as a command plus its expected output",
      "Keep 3 to 5 must-haves; park everything else in a nice-to-have list",
      "Use Decimal for money, date for days, Enum for fixed choices",
      "Mutable defaults need field(default_factory=list)",
      "Imports point down: cli, service, storage/rates, models",
      "Only cli.py prints and exits; lower layers return or raise",
      "Add a version field to your JSON file format from day one",
      "Every milestone ends with passing tests and a git commit",
    ],
    quiz: [
      {
        q: "Why use decimal.Decimal instead of float for money?",
        options: ["It is faster", "It stores values like 0.10 exactly", "JSON supports it directly", "It uses less memory"],
        answer: 1,
        why: "Binary floats cannot represent most decimal fractions exactly, so totals can be off by tiny amounts.",
      },
      {
        q: "Which module should be allowed to import cli.py?",
        options: ["models.py", "storage.py", "service.py", "None of them"],
        answer: 3,
        why: "cli.py is the top layer; lower modules must not depend on it, or you risk circular imports.",
      },
      {
        q: "What is the best way to give a dataclass field an empty list as default?",
        options: ["tags: list = []", "tags: list = None", "tags: list[str] = field(default_factory=list)", "tags = list"],
        answer: 2,
        why: "dataclasses reject a mutable default like [] and need a factory so each object gets its own list.",
      },
      {
        q: "Why write example commands with expected output in the plan?",
        options: ["They become acceptance criteria, tests and README examples", "argparse needs them", "They replace the data model", "Git requires them"],
        answer: 0,
        why: "Concrete input and output make it clear when a feature is done.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For a weather logger, write three must-have features as example commands with expected output, and two nice-to-haves.",
        hint: "Think: record a reading, show recent readings, summarise.",
        solution: "Must-have\n  weather log Pune           -> Logged Pune: 31.2 C, humidity 48%\n  weather history Pune -n 5  -> last 5 readings as a table\n  weather stats Pune         -> min, max, average temperature\nNice-to-have\n  CSV export\n  Alerts when temperature passes a limit",
      },
      {
        level: "medium",
        task: "Write a Reading dataclass for the weather logger with city, temperature in Celsius, humidity percent and a timestamp, rejecting humidity outside 0 to 100.",
        hint: "Use datetime for the timestamp and validate in __post_init__.",
        solution: "from dataclasses import dataclass\nfrom datetime import datetime\n\n@dataclass(frozen=True)\nclass Reading:\n    city: str\n    temp_c: float\n    humidity: int\n    taken_at: datetime\n    def __post_init__(self):\n        if not 0 <= self.humidity <= 100:\n            raise ValueError(\"humidity must be 0-100\")",
      },
      {
        level: "hard",
        task: "List the modules for the weather logger with one-line responsibilities, and state which modules each may import.",
        hint: "Follow the one-way rule: interface, logic, storage and API, model.",
        solution: "models.py   Reading dataclass; imports nothing from the project\nstorage.py  load/save readings as JSON; imports models\nweather.py  fetch current weather from the API; imports models\nservice.py  log, history, stats logic; imports models, storage, weather\ncli.py      argparse commands and printing; imports service (and models for types)\nRule: no module imports one above it, so there are no circular imports.",
      },
    ],
    faq: [
      { q: "What is a good first Python capstone project?", a: "A small command-line tool you would really use, such as an expense tracker, a weather logger, a reading list or a habit tracker. It should store data, call one web API and have a few commands." },
      { q: "How detailed should my plan be?", a: "About one page: goal, must-haves with example commands, nice-to-haves, the data model, the module list and the storage choice. More detail than that usually changes once you start coding." },
      { q: "Should I use a dataclass or a plain dict for my data?", a: "Use a dataclass. Field names and types are written down in one place, typos become errors instead of silent bugs, and editors can autocomplete fields." },
      { q: "JSON file or SQLite for storage?", a: "Start with JSON for a personal tool with hundreds or a few thousand records. Move to the built-in sqlite3 module when you need fast queries, many records or safe concurrent access." },
    ],
  },

  "py-capstone/py-capstone-build": {
    plain: [
      "Now you build the plan for real. This project uses almost everything from the path: a virtual environment, Git, dataclasses, files, a web API, argparse and pytest. Do not try to write it all at once. Build one small working piece, test it, commit it, then move to the next.",
      "Start with the boring setup: a Git repository, a virtual environment and a linter called Ruff that catches mistakes and formats your code. Ten minutes of setup here keeps the whole project tidy.",
      "Next, write the data model and the code that saves and loads it, with a test that saves some data and checks it comes back the same. Then add the command-line commands on top. The web API call comes after the core works, so a slow or broken API never blocks you.",
      "Finish with more tests and a README that shows someone else how to install and use your tool. A project that a stranger can run in five minutes is a strong portfolio piece.",
    ],
    deepDive: [
      {
        heading: "Repository, virtual environment and Ruff",
        body: "Create the folder, run git init, and add a .gitignore with .venv/, __pycache__/, .pytest_cache/ and any local data files. Create the environment with python -m venv .venv and activate it (source .venv/bin/activate on Linux and macOS, .venv\\Scripts\\activate on Windows). Use a src layout, src/tracker/, and describe the project in pyproject.toml: name, version, requires-python, dependencies such as requests, an optional dev group with pytest and ruff, and the [project.scripts] entry for your command.\n\nInstall everything with pip install -e \".[dev]\" so the package and your command work while you edit. Ruff is a fast linter and formatter: ruff check . finds bugs like unused imports and undefined names, ruff check --fix repairs the simple ones, and ruff format . formats the code. Configure it under [tool.ruff] in pyproject.toml and run both before each commit.",
        bullets: ["python -m venv .venv", "pip install -e \".[dev]\"", "ruff check . && ruff format .", "git commit -m \"Set up project skeleton\""],
      },
      {
        heading: "Storage that never corrupts your data",
        body: "storage.py needs two functions: load_expenses(path) and save_expenses(items, path). Loading a file that does not exist yet should return an empty list, not crash, so the first run just works. Loading a file that is not valid JSON should raise a clear error that names the file, rather than silently starting empty and then overwriting the user's data.\n\nSave atomically: write the JSON to a temporary file next to the real one, then call Path.replace to swap it in. A rename within one folder is atomic on the same file system, so a crash or power cut leaves either the old file or the new one, never half of each. Convert models with their to_dict and from_dict methods, and wrap the list in {\"version\": 1, \"expenses\": [...]} so the format can evolve. Test both functions with tmp_path, including the missing file and broken file cases.",
        visual: {
          type: "sequence",
          title: "tracker add, end to end",
          actors: ["cli.py", "service.py", "storage.py", "Disk"],
          messages: [
            { from: 0, to: 1, label: "add_expense(amount, category)" },
            { from: 1, to: 2, label: "load_expenses(path)" },
            { from: 2, to: 3, label: "read expenses.json" },
            { from: 1, to: 1, label: "create and validate Expense" },
            { from: 1, to: 2, label: "save_expenses(items, path)" },
            { from: 2, to: 3, label: "write .tmp, then replace" },
            { from: 1, to: 0, label: "return the new Expense" },
          ],
        },
      },
      {
        heading: "CLI commands that stay thin",
        body: "Each subcommand handler in cli.py does three things: turn parsed arguments into proper types, call one service function, and print the result. All decisions, like how to group totals by month, live in service.py, where tests can call them directly.\n\nConvert user input at the edge. argparse can parse the amount with type=Decimal and the date with type=date.fromisoformat, so the service only ever sees clean types. Catch expected errors, such as a ValueError from validation or a storage error, in one place in main, print a short message to stderr and return exit code 1. Unexpected errors should still show a traceback while you develop. For tables, f-strings with alignment are enough: f\"{e.spent_on}  {e.category.value:<8} {e.amount:>8}\" lines up columns without any library.",
      },
      {
        heading: "Integrating the web API safely",
        body: "Put every network detail in rates.py behind one function, such as get_rate(base, target) returning a Decimal. Inside it, use requests with a timeout, call raise_for_status(), and convert the JSON number with Decimal(str(value)). Read any API key from an environment variable and raise a clear error if it is missing.\n\nTwo design choices keep the rest of the program simple. First, convert requests exceptions into your own error, like RatesUnavailable, so cli.py can print \"Could not reach the rates service, try again later\" without knowing about requests. Second, cache results: rates change at most daily for most free APIs, so store the last answer with its date in a small JSON file and reuse it. The cache saves your rate limit and lets the tool work offline with yesterday's rate, with a warning.",
        visual: {
          type: "flow",
          title: "get_rate with a daily cache",
          steps: [
            { label: "Check cache", detail: "Rate for today already saved?" },
            { label: "Call the API", detail: "timeout=10, raise_for_status()" },
            { label: "Parse to Decimal", detail: "Decimal(str(value))" },
            { label: "Save to cache", detail: "With today's date" },
            { label: "On failure", detail: "Use the old rate with a warning, or raise RatesUnavailable" },
          ],
        },
      },
      {
        heading: "Tests that cover the core, and a README",
        body: "Aim tests at the code with rules: model validation, the storage round-trip, missing and broken files, and service calculations such as totals per category. Test the CLI too, by calling main([\"add\", \"12.50\", \"--file\", str(path)]) and checking the exit code and capsys output. Never call the real API in tests: use monkeypatch.setattr to replace rates.get_rate with a function that returns a fixed Decimal, or one that raises RatesUnavailable to test the error path. The whole suite should run offline in about a second.\n\nThe README is the front door. Include one sentence on what the tool does, install steps (clone, create venv, pip install -e .), three or four usage examples copied from a real terminal, configuration (environment variables, data file location), how to run tests, and a license. Run every command in it once from a fresh clone to prove it works.",
        bullets: ["pytest -q runs the suite; pytest --cov=tracker shows untested lines", "monkeypatch.setattr(rates, \"get_rate\", lambda b, t: Decimal(\"1.10\"))", "README: what, install, usage, config, tests, license"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where each kind of test points",
        columns: [
          { title: "Unit tests", points: ["models and service functions", "No files, no network", "Many small, fast tests", "Catch logic bugs"] },
          { title: "Storage tests", points: ["Real files in tmp_path", "Round-trip, missing, broken file", "A handful of tests", "Catch data loss"] },
          { title: "CLI tests", points: ["Call main(argv) directly", "API replaced by monkeypatch", "Check output and exit code", "Catch wiring mistakes"] },
        ],
      },
    ],
    examples: [
      {
        title: "Atomic JSON storage with clear errors",
        explanation: "Step 1: a missing file means no expenses yet, so return an empty list. Step 2: broken JSON raises a StorageError naming the file, instead of silently losing data. Step 3: save writes to a .tmp file first. Step 4: Path.replace swaps the new file in with one atomic rename.",
        code: {
          lang: "python",
          code: "import json\nfrom pathlib import Path\nfrom tracker.models import Expense\nclass StorageError(Exception): pass\ndef load_expenses(path: Path) -> list[Expense]:\n    if not path.exists(): return []\n    try:\n        data = json.loads(path.read_text(encoding=\"utf-8\"))\n    except json.JSONDecodeError as e:\n        raise StorageError(f\"{path} is not valid JSON: {e}\") from e\n    return [Expense.from_dict(d) for d in data[\"expenses\"]]\ndef save_expenses(items: list[Expense], path: Path) -> None:\n    tmp = path.with_suffix(\".tmp\")\n    tmp.write_text(json.dumps({\"version\": 1, \"expenses\": [e.to_dict() for e in items]}, indent=2), encoding=\"utf-8\")\n    tmp.replace(path)",
        },
      },
      {
        title: "Testing the convert command without the network",
        explanation: "The convert command calls rates.get_rate, which normally hits the web. Step 1: monkeypatch replaces it with a lambda returning a fixed rate. Step 2: tmp_path holds a data file with one expense. Step 3: call main with a list of arguments. Step 4: check the exit code and the printed total. The test runs offline and gives the same result every time.",
        code: {
          lang: "python",
          code: "from datetime import date\nfrom decimal import Decimal\nfrom tracker import cli, rates\nfrom tracker.models import Category, Expense\nfrom tracker.storage import save_expenses\n\ndef test_convert(tmp_path, monkeypatch, capsys):\n    path = tmp_path / \"data.json\"\n    save_expenses([Expense(Decimal(\"10.00\"), Category.FOOD, date(2026, 3, 1))], path)\n    monkeypatch.setattr(rates, \"get_rate\", lambda base, target: Decimal(\"1.10\"))\n    code = cli.main([\"--file\", str(path), \"convert\", \"--to\", \"USD\", \"--month\", \"2026-03\"])\n    assert code == 0\n    assert \"11.00 USD\" in capsys.readouterr().out",
        },
      },
    ],
    cheatSheet: [
      "git init, .gitignore (.venv/, __pycache__/), python -m venv .venv",
      "pip install -e \".[dev]\" installs your package and dev tools together",
      "ruff check --fix . then ruff format . before every commit",
      "Missing data file: return []; broken data file: raise a clear error",
      "Save atomically: write path.tmp, then tmp.replace(path)",
      "Wrap requests errors in your own exception for cli.py to report",
      "monkeypatch.setattr(module, \"name\", fake) keeps tests offline",
      "Run every README command from a fresh clone before you share it",
    ],
    quiz: [
      {
        q: "Why write to a temporary file and then call Path.replace when saving?",
        options: ["It is faster than writing directly", "It compresses the file", "A crash leaves the old or new file intact, never a half-written one", "It is required by json.dump"],
        answer: 2,
        why: "A rename within one file system is atomic, so readers see either the complete old file or the complete new one.",
      },
      {
        q: "What should load_expenses do when the data file does not exist yet?",
        options: ["Return an empty list", "Raise FileNotFoundError to the user", "Create a file with sample data", "Exit the program"],
        answer: 0,
        why: "On the first run there is simply no data yet, so an empty list lets the tool work immediately.",
      },
      {
        q: "How should tests handle the function that calls the web API?",
        options: ["Call the real API with a test key", "Skip testing the command that uses it", "Use a very short timeout", "Replace it with monkeypatch so tests run offline"],
        answer: 3,
        why: "A fake gives fast, repeatable results and lets you test the error path too.",
      },
      {
        q: "Where should the code that groups totals by month live?",
        options: ["cli.py", "service.py", "storage.py", "README.md"],
        answer: 1,
        why: "Business rules belong in the service layer, where tests can call them without the command line.",
      },
      {
        q: "What does pip install -e \".[dev]\" do?",
        options: ["Installs only the dev tools", "Builds a wheel for PyPI", "Installs your package in editable mode plus the dev extras", "Upgrades pip"],
        answer: 2,
        why: "-e links your source so edits apply at once, and [dev] adds the optional dev dependencies such as pytest and ruff.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a test that saving an empty list and loading it back returns an empty list.",
        hint: "Use the tmp_path fixture for the file location.",
        solution: "from tracker.storage import load_expenses, save_expenses\n\ndef test_empty_round_trip(tmp_path):\n    path = tmp_path / \"data.json\"\n    save_expenses([], path)\n    assert load_expenses(path) == []",
      },
      {
        level: "medium",
        task: "Write totals_by_category(expenses) in service.py returning a dict from category value to Decimal total, and a test for it.",
        hint: "defaultdict(Decimal) starts every total at Decimal(\"0\").",
        solution: "from collections import defaultdict\nfrom decimal import Decimal\n\ndef totals_by_category(expenses):\n    totals = defaultdict(Decimal)\n    for e in expenses:\n        totals[e.category.value] += e.amount\n    return dict(totals)\n\n# test: two FOOD expenses of 2.50 and 1.50 give {\"food\": Decimal(\"4.00\")}",
      },
      {
        level: "hard",
        task: "Write get_rate(base, target) that calls an API with a timeout and turns any requests error into RatesUnavailable.",
        hint: "Catch requests.RequestException and ValueError (bad JSON), and use raise ... from err.",
        solution: "from decimal import Decimal\nimport requests\n\nclass RatesUnavailable(Exception): pass\n\ndef get_rate(base: str, target: str) -> Decimal:\n    try:\n        r = requests.get(\"https://api.example.com/latest\", params={\"from\": base, \"to\": target}, timeout=10)\n        r.raise_for_status()\n        return Decimal(str(r.json()[\"rates\"][target]))\n    except (requests.RequestException, ValueError, KeyError) as err:\n        raise RatesUnavailable(f\"{base}->{target}: {err}\") from err",
      },
    ],
    faq: [
      { q: "How do I make my Python project installable as a command?", a: "Add a [project.scripts] entry in pyproject.toml, such as tracker = \"tracker.cli:main\", then run pip install -e . in your virtual environment. pip creates a tracker command that calls main()." },
      { q: "What is Ruff and do I need it?", a: "Ruff is a very fast Python linter and formatter written in Rust. It replaces several older tools like flake8 and isort, and catching unused imports and undefined names early is worth the two minutes of setup." },
      { q: "How many tests should a capstone project have?", a: "There is no magic number. Cover every rule in the service layer, the storage round-trip and error cases, and one test per CLI command; for a small tool that is often 15 to 30 short tests." },
      { q: "What should a good README include?", a: "What the tool does, how to install it, real usage examples, configuration such as environment variables, how to run the tests, and the license." },
    ],
  },
};

export default extra;
