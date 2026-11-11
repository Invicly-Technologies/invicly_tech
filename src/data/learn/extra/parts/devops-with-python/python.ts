import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "python/py-core": {
    plain: [
      "Python is a programming language that reads almost like English. For DevOps work you mostly use a small part of it: text (strings), numbers, true or false values (booleans), and a few ways to group data. With just those pieces you can replace long, fragile shell scripts with code that is easy to read and test.",
      "Data comes in collections. A list is an ordered row of items, like server names. A dict (dictionary) maps a key to a value, like a server name to its IP address. A set holds unique items and answers \"is this in here?\" very quickly. A tuple is a small fixed group, like (host, port).",
      "Control flow decides what runs. if picks a path, for repeats work for each item, and while repeats until something changes. A function wraps steps under a name, so you write the logic once and call it many times with different inputs.",
      "A comprehension is a short way to build a new list or dict from an old one in one line, for example [name.upper() for name in names]. It replaces three or four lines of loop code. Used with care, it makes scripts shorter and clearer, not cleverer.",
    ],
    deepDive: [
      {
        heading: "Names, objects and the mutable default trap",
        body: "In Python a variable is a name tag stuck on an object, not a box that holds a copy. After b = a, both names point to the same list, so b.append(1) also changes a. Strings, numbers and tuples are immutable (they cannot change), so sharing them is safe. Lists, dicts and sets are mutable, so sharing them can surprise you.\n\nTo get a separate list, copy it: a.copy() or list(a). That is a shallow copy: the outer list is new, but nested lists inside are still shared. For nested data use copy.deepcopy(a).\n\nDefault argument values are created once, when def runs, not on every call. So def add(x, items=[]) keeps one list that grows across calls. The fix is items=None, then items = [] inside the function.",
        bullets: ["b = a shares one object; b = a.copy() makes a new one", "Shallow copy: new outer container, shared inner items", "Use None as the default for list and dict parameters"],
        visual: {
          type: "compare",
          title: "Immutable vs mutable",
          columns: [
            { title: "Immutable", points: ["str, int, float, bool, tuple", "A change makes a new object", "Safe to share between names", "Can be dict keys and set items"] },
            { title: "Mutable", points: ["list, dict, set", "Changed in place", "Every name sees the change", "Cannot be dict keys or set items"] },
          ],
        },
      },
      {
        heading: "Why dict and set lookups are fast",
        body: "A list checks membership by looking at each item in turn, so host in big_list gets slower as the list grows. This is O(n): time grows with the number of items. A dict or set stores items in a hash table. Python runs hash() on the key, which turns it into a number, and that number points almost directly to the right slot. On average a lookup takes about the same time for ten items or ten million (O(1)).\n\nThis is why keys must be hashable: their value must never change. Strings, numbers and tuples of those work as keys. Lists and dicts do not, and Python raises TypeError: unhashable type.\n\nSince Python 3.7, dicts keep insertion order, so looping over a dict gives keys in the order you added them. Sets have no guaranteed order, so sort them before printing.",
        visual: {
          type: "flow",
          title: "What d[key] does",
          steps: [
            { label: "hash(key)", detail: "Turn the key into a number" },
            { label: "Pick a slot", detail: "The number points into the table" },
            { label: "Compare keys", detail: "Check the stored key equals yours" },
            { label: "Return value", detail: "Or raise KeyError if no match" },
          ],
        },
      },
      {
        heading: "Truthiness, None and comparisons",
        body: "In an if, Python treats some values as false: False, None, 0, 0.0, the empty string, and empty collections like [], {} and set(). Everything else is true. So if hosts: means \"if the list is not empty\", which is the normal way to write it.\n\n== compares values, while is checks whether two names point to the very same object. Use is only for None (if x is None), because two equal strings or numbers may or may not be the same object.\n\nComparisons can be chained: 0 <= cpu < 80 reads like maths and works. and and or stop early (short-circuit) and return one of their operands, so name = given or \"default\" picks the first truthy value. Be careful: it also replaces 0 and the empty string, which may be valid inputs.",
        bullets: ["Falsy: False, None, 0, 0.0, \"\", [], {}, set()", "Write x is None, not x == None", "port = cfg.get(\"port\") or 8080 also replaces a real port 0"],
      },
      {
        heading: "Comprehensions, generators and when to stop",
        body: "A list comprehension builds the whole list in memory at once. A generator expression uses round brackets instead, (x for x in items), and produces one item at a time when asked. Passing a generator to sum(), any(), max() or \"\".join() lets you process a huge file without holding it all in memory: sum(1 for line in f if \"ERROR\" in line).\n\nDict and set comprehensions use curly brackets: {h: ip for h, ip in pairs} and {line.split()[0] for line in lines}.\n\nA comprehension is great for one loop with one filter. Once you need two nested loops plus conditions, or a try/except, a normal for loop is easier to read and debug. Readable beats short. Also avoid comprehensions used only for side effects, like [print(x) for x in items]; that builds a list nobody uses.",
      },
      {
        heading: "Function arguments in full",
        body: "Python matches arguments to parameters in a fixed order. Positional arguments fill the named parameters left to right. Extra positional values go into *args as a tuple. Parameters after *args (or after a bare *) are keyword-only: callers must write their name, which prevents unclear calls like deploy(\"web\", True, False). Extra keyword arguments go into **kwargs as a dict.\n\nThe same stars work in reverse at the call site: f(*hosts) spreads a list into positional arguments, and f(**opts) spreads a dict into keyword arguments. This is common when passing settings through to another function.\n\nA function returns None unless you return something. Returning several values (return ok, msg) really returns one tuple, which the caller can unpack: ok, msg = check(host).",
        bullets: ["def f(a, b=2, *args, force=False, **kwargs)", "def deploy(env, *, dry_run=False) forces callers to write dry_run=True", "ok, msg = check(host) unpacks a returned tuple"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How f(1, 2, 3, force=True, tag=\"x\") binds to def f(a, *args, force=False, **kw)",
        steps: [
          { label: "a = 1", detail: "First positional value fills a" },
          { label: "args = (2, 3)", detail: "Extra positional values become a tuple" },
          { label: "force = True", detail: "Keyword-only, matched by name" },
          { label: "kw = {\"tag\": \"x\"}", detail: "Unknown keywords become a dict" },
        ],
      },
      {
        type: "compare",
        title: "Three ways to process many items",
        columns: [
          { title: "for loop", points: ["Any logic, try/except, logging", "Easiest to debug", "Use when it grows past one filter"] },
          { title: "List comprehension", points: ["Builds the whole list at once", "One loop plus one filter", "Short and fast"] },
          { title: "Generator expression", points: ["One item at a time", "Tiny memory use", "Feed it to sum, any, max or join"] },
        ],
      },
    ],
    examples: [
      {
        title: "Count HTTP status codes in an access log",
        explanation: "You want to know how many 5xx errors nginx served today. Step 1: open the log with a with block and loop over it line by line, so even a huge file uses little memory. Step 2: split each line on whitespace; in the default combined log format the status code is field 8 (counting from 0). Step 3: count with collections.Counter, which is a dict built for counting. Step 4: print the most common codes and add up everything starting with 5.",
        code: {
          lang: "python",
          code: `from collections import Counter

counts = Counter()
with open("access.log", encoding="utf-8") as f:
    for line in f:
        parts = line.split()
        if len(parts) > 8 and parts[8].isdigit():
            counts[parts[8]] += 1

for status, n in counts.most_common(5):
    print(f"{status}: {n}")
errors = sum(n for s, n in counts.items() if s.startswith("5"))
print("5xx total:", errors)`,
        },
      },
      {
        title: "Compare expected and running hosts with sets",
        explanation: "Your inventory lists the hosts that should exist, and monitoring reports the hosts that are actually up. Step 1: put both into sets. Step 2: expected minus running gives hosts that are missing. Step 3: running minus expected gives surprise hosts, such as a forgotten test machine still costing money. Step 4: the intersection gives the healthy ones. Sorting before printing makes the output stable, because sets have no order.",
        code: {
          lang: "python",
          code: `expected = {"web1", "web2", "web3", "db1"}
running = {"web1", "web3", "db1", "tmp-test"}

missing = expected - running        # {'web2'}
unexpected = running - expected     # {'tmp-test'}
healthy = expected & running

print("Missing:", sorted(missing))
print("Unexpected:", sorted(unexpected))
print(f"{len(healthy)}/{len(expected)} expected hosts are up")`,
        },
      },
    ],
    cheatSheet: [
      "d.get(key, default) avoids KeyError when a key may be missing",
      "for i, item in enumerate(items, start=1) gives a counter without range(len(items))",
      "for host, ip in zip(hosts, ips) walks two lists side by side",
      "sorted(servers, key=lambda s: s[\"cpu\"], reverse=True) sorts dicts by one field",
      "collections.Counter(words).most_common(3) counts and ranks in one line",
      "Sets: a - b is difference, a & b intersection, a | b union",
      "f\"{value:.1f}%\" rounds to one decimal; f\"{name:<10}\" pads to a column",
      "Use def f(x, items=None) instead of items=[] to avoid a shared default list",
    ],
    quiz: [
      {
        q: "After a = [1, 2]; b = a; b.append(3), what is a?",
        options: ["[1, 2]", "[1, 2, 3]", "[3]", "It raises an error"],
        answer: 1,
        why: "b = a does not copy; both names point to the same list.",
      },
      {
        q: "Which of these can be used as a dict key?",
        options: ["[\"web\", 80]", "{\"web\": 80}", "(\"web\", 80)", "{\"web\", 80}"],
        answer: 2,
        why: "A tuple of immutable values is hashable; lists, dicts and sets are not.",
      },
      {
        q: "What does def f(*, dry_run=False) mean for callers?",
        options: ["dry_run must be passed by position", "f accepts any number of positional arguments", "dry_run is ignored", "dry_run can only be passed by name, like f(dry_run=True)"],
        answer: 3,
        why: "A bare * makes every parameter after it keyword-only.",
      },
      {
        q: "Why is host in hosts_set faster than host in hosts_list for 100,000 hosts?",
        options: ["A set uses a hash table, so it does not scan every item", "Sets are sorted, so Python uses binary search", "Lists are stored on disk", "Sets compress their items"],
        answer: 0,
        why: "Set membership is O(1) on average, while a list check is O(n).",
      },
      {
        q: "What is the value of port after port = 0 or 8080?",
        options: ["0", "8080", "None", "True"],
        answer: 1,
        why: "or returns the first truthy operand, and 0 is falsy.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given a list of dicts with name and env keys, print the names of the prod servers in alphabetical order using one comprehension.",
        hint: "Filter with if inside the comprehension, then wrap it in sorted().",
        solution: `servers = [{"name": "web2", "env": "prod"},
           {"name": "dev1", "env": "dev"},
           {"name": "web1", "env": "prod"}]
print(sorted(s["name"] for s in servers if s["env"] == "prod"))
# ['web1', 'web2']`,
      },
      {
        level: "medium",
        task: "Write parse_kv(text) that turns lines like key=value into a dict. Skip blank lines and lines starting with #, and strip spaces around keys and values.",
        hint: "str.partition(\"=\") splits on the first = only, so values may contain = too.",
        solution: `def parse_kv(text):
    result = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        key, _, value = line.partition("=")
        result[key.strip()] = value.strip()
    return result

print(parse_kv("a = 1\\n# note\\n\\nb=two"))  # {'a': '1', 'b': 'two'}`,
      },
      {
        level: "hard",
        task: "Write group_by(items, key) that returns a dict of lists grouped by one field. Use it to count servers per env and to find the env with the most busy servers (cpu over 80).",
        hint: "collections.defaultdict(list) removes the \"does the key exist yet?\" check; max() takes a key function.",
        solution: `from collections import defaultdict

def group_by(items, key):
    groups = defaultdict(list)
    for item in items:
        groups[item[key]].append(item)
    return dict(groups)

by_env = group_by(servers, "env")
print({env: len(v) for env, v in by_env.items()})
busy = {env: sum(1 for s in v if s["cpu"] > 80) for env, v in by_env.items()}
print(max(busy, key=busy.get))`,
      },
    ],
    faq: [
      { q: "Should I learn Python 2 or Python 3?", a: "Python 3 only. Python 2 reached end of life on 1 January 2020 and receives no fixes, and every current tool expects Python 3." },
      { q: "What is the difference between a list and a tuple?", a: "A list can change after you create it; a tuple cannot. Use tuples for small fixed records like (host, port) and lists for collections that grow or shrink." },
      { q: "When should I use a class instead of a dict?", a: "When the same shape of data appears all over your code. A dataclass gives named fields, type hints and a readable repr, and typos become errors instead of silent new keys." },
      { q: "Is Python fast enough for DevOps scripts?", a: "Yes. Automation scripts spend most of their time waiting for disks, networks and other programs, so Python's speed is rarely the bottleneck." },
    ],
  },

  "python/py-env": {
    plain: [
      "As a script grows, one file is not enough. A module is just a .py file, and you can import its functions into another file. A package is a folder of modules. Splitting code this way keeps each file small and lets tests import exactly the piece they need.",
      "Python projects also depend on code other people wrote, like requests or PyYAML. pip downloads those packages from PyPI (the Python Package Index, the public package store). The problem: if every project installs into the same place, one project's upgrade can break another.",
      "A virtual environment (venv) solves this. It is a folder, usually called .venv, with its own python command and its own place for packages. When it is active, pip installs into that folder only. Delete the folder and the project is clean again.",
      "Finally, you write down exactly which versions you used, usually in requirements.txt. A teammate, a CI server or a Docker build reads that file and installs the same versions. That is how \"works on my machine\" becomes \"works on every machine\".",
    ],
    deepDive: [
      {
        heading: "How import finds a module",
        body: "When you write import tools, Python searches the folders listed in sys.path, in order, and uses the first match. The list starts with the folder of the script you ran (or the current folder when you use python -m), then any folders in the PYTHONPATH variable, then the standard library, then site-packages, where pip puts installed packages. Once loaded, a module is cached in sys.modules, so importing it again is free and its top-level code runs only once.\n\nThe first-match rule causes a classic bug: name your own file json.py or requests.py and it hides the real library. Avoid names that clash with the standard library or your dependencies.\n\nThe check if __name__ == \"__main__\": lets a file work both as an importable module and as a script. The block runs only when the file is executed directly.",
        bullets: ["python -c \"import sys; print(sys.path)\" prints the search list", "python -m mytool.cli runs a module that lives inside a package", "A folder with __init__.py is a regular package"],
        visual: {
          type: "flow",
          title: "Where import tools looks, in order",
          steps: [
            { label: "sys.modules", detail: "Already imported? Reuse it" },
            { label: "Script folder", detail: "Or the current folder with -m" },
            { label: "PYTHONPATH", detail: "Extra folders you set" },
            { label: "Standard library", detail: "json, pathlib, subprocess" },
            { label: "site-packages", detail: "Packages pip installed" },
            { label: "Not found", detail: "ModuleNotFoundError" },
          ],
        },
      },
      {
        heading: "What a venv really is",
        body: "A venv is less magic than it looks. python3 -m venv .venv creates a folder with a pyvenv.cfg file that points to the base interpreter, a bin folder (Scripts on Windows) holding python and pip, and lib/pythonX.Y/site-packages for packages. The python inside is a link to the original interpreter; at startup Python notices pyvenv.cfg and switches to the venv's package folder.\n\nsource .venv/bin/activate only changes your current shell: it puts .venv/bin first on PATH and sets VIRTUAL_ENV. You can skip it by calling .venv/bin/python directly, which is the reliable choice in cron jobs, systemd units and Dockerfiles.\n\nA venv is tied to its location and to the Python it was made from. Moving or copying it breaks the paths written inside its scripts, and upgrading the system Python can break it too. Treat it as disposable: delete it and recreate it from requirements.txt.",
        visual: {
          type: "tree",
          title: "Inside .venv after python3 -m venv .venv",
          root: ".venv",
          children: [
            { label: "pyvenv.cfg", children: ["home = folder of the base Python", "version of that Python"] },
            { label: "bin/", children: ["python and python3 links", "pip", "activate scripts for each shell"] },
            { label: "lib/python3.X/site-packages/", children: ["Where pip installs packages", "Only pip at the start"] },
          ],
        },
      },
      {
        heading: "Pinning versions without pain",
        body: "pip install requests installs the newest version today, and maybe a breaking one next month. Version specifiers control this: ==2.32.3 means exactly that version, >=2.32 means that or newer, and ~=2.32.0 is the compatible release operator, meaning at least 2.32.0 but below 2.33.\n\npip freeze prints every installed package with its exact version, including the dependencies of your dependencies (transitive dependencies). That works as a lock file, but it mixes what you chose with what came along. Many teams keep a short requirements.in with their direct choices and generate the fully pinned requirements.txt from it with pip-compile from the pip-tools project.\n\nFor stricter builds, pin hashes too. pip install --require-hashes -r requirements.txt refuses any download whose checksum does not match the file, which protects you against a tampered package.",
        bullets: ["== exact, >= minimum, ~= compatible release, != exclude", "pip list --outdated shows what could be upgraded", "pip check reports missing or conflicting dependencies"],
      },
      {
        heading: "pyproject.toml and installable tools",
        body: "Modern Python projects describe themselves in pyproject.toml. The [project] table holds the name, version, required Python version and dependencies. A [project.scripts] entry like mytool = \"mytool.cli:main\" makes pip create a mytool command that calls that function.\n\nDuring development run pip install -e . (an editable install). Your package becomes importable from anywhere in the venv, and code changes apply without reinstalling. Many projects use a src layout (src/mytool/...) so tests import the installed package instead of a folder that just happens to be on the path.\n\nA common modern error: on recent Debian and Ubuntu releases (and some other distributions), pip install outside a venv fails with externally-managed-environment. That is deliberate (PEP 668): the system Python belongs to the operating system's package manager. Use a venv for projects, or pipx for standalone command-line tools.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "What pip install -r requirements.txt does",
        actors: ["You", "pip", "PyPI", ".venv"],
        messages: [
          { from: 0, to: 1, label: "pip install -r requirements.txt" },
          { from: 1, to: 2, label: "Ask for requests==2.32.3" },
          { from: 2, to: 1, label: "Wheel file plus its dependency list" },
          { from: 1, to: 2, label: "Fetch dependencies like urllib3 and idna" },
          { from: 1, to: 3, label: "Unpack everything into site-packages" },
          { from: 1, to: 0, label: "Successfully installed ..." },
        ],
      },
      {
        type: "tree",
        title: "A typical small Python project",
        root: "diskcheck/",
        children: [
          { label: "pyproject.toml", children: ["Name, version, dependencies", "Console script entry point"] },
          { label: "src/diskcheck/", children: ["__init__.py", "cli.py (argparse, main)", "core.py (logic)"] },
          { label: "tests/", children: ["test_core.py", "conftest.py for shared fixtures"] },
          { label: "requirements.txt", children: ["Exact pins for deploys and CI"] },
          { label: ".gitignore", children: [".venv/", "__pycache__/"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turn a script into an installable command",
        explanation: "You have a disk-check script that teammates keep copying around. Step 1: move the code into src/diskcheck/ with a cli.py that has a main() function. Step 2: write a pyproject.toml with the name, dependencies and a [project.scripts] entry. Step 3: in a fresh venv, run pip install -e . during development. Step 4: now diskcheck is a real command on PATH inside that venv, and anyone can install it the same way, or with pipx from a git URL.",
        code: {
          lang: "toml",
          code: `[project]
name = "diskcheck"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = ["pyyaml>=6"]

[project.scripts]
diskcheck = "diskcheck.cli:main"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"

# then: pip install -e .   and run: diskcheck --help`,
        },
      },
      {
        title: "Rebuild a broken environment",
        explanation: "After a system Python upgrade your tool fails with ImportError or \"No such file or directory\" for .venv/bin/python. Step 1: check which interpreter is actually running. Step 2: throw the old venv away; it is disposable. Step 3: create a new one and install from requirements.txt, calling the venv's python directly so there is no doubt where packages go. Step 4: run pip check and the tests to confirm everything resolves.",
        code: {
          lang: "bash",
          code: `which python; python --version      # which interpreter is active?
deactivate 2>/dev/null
rm -rf .venv
python3 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python -m pip check
.venv/bin/python -m pytest -q`,
        },
      },
    ],
    cheatSheet: [
      "python3 -m venv .venv creates a venv; source .venv/bin/activate turns it on",
      "python -m pip install X guarantees pip matches the python you are running",
      "pip freeze > requirements.txt records the exact version of everything installed",
      "pip install -r requirements.txt reproduces the environment on another machine",
      "~=2.32.0 means >=2.32.0 and <2.33; == pins one exact version",
      "pip install -e . installs your own project in editable mode",
      "python -c \"import sys; print(sys.prefix)\" shows which environment is active",
      "Add .venv/ to .gitignore; commit requirements.txt, never the venv",
    ],
    quiz: [
      {
        q: "You created a file named json.py next to your script, and now import json behaves strangely. Why?",
        options: ["json is not part of the standard library", "The venv is not activated", "Your file is found first on sys.path and hides the real module", "json must be installed with pip first"],
        answer: 2,
        why: "The script's folder comes before the standard library in sys.path, and the first match wins.",
      },
      {
        q: "Which versions does the specifier ~=1.4.2 allow?",
        options: ["1.4.2 and later, but below 1.5", "Only 1.4.2", "Anything above 1.4.2, including 2.0", "Anything except 1.4.2"],
        answer: 0,
        why: "The compatible release operator allows changes only in the last given part of the version.",
      },
      {
        q: "In a cron job, what is the most reliable way to run a script inside a venv?",
        options: ["Put source activate on its own crontab line first", "Install the packages globally with sudo", "Set PYTHONPATH to the project folder", "Call /path/to/.venv/bin/python script.py directly"],
        answer: 3,
        why: "The venv's own python already uses the venv's packages; activation only edits the shell's PATH.",
      },
      {
        q: "pip install fails with externally-managed-environment. What is the right fix?",
        options: ["Add --break-system-packages to every install", "Create and use a venv, or pipx for a command-line tool", "Reinstall Python from source", "Run pip with sudo"],
        answer: 1,
        why: "PEP 668 protects the system Python; project packages belong in a venv.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a venv, install requests into it, and prove where it was installed. Then show that the system python3 cannot import it (if it was not already installed there).",
        hint: "pip show prints a Location field; compare sys.prefix inside and outside the venv.",
        solution: `python3 -m venv .venv
.venv/bin/pip install requests
.venv/bin/pip show requests | grep Location
.venv/bin/python -c "import sys, requests; print(sys.prefix)"
python3 -c "import requests" || echo "not in system Python"`,
      },
      {
        level: "medium",
        task: "Split a one-file script into a package mytool with core.py (the logic) and cli.py (argparse and main), and run it with python -m mytool.cli from the project root.",
        hint: "cli.py should import from mytool.core, and the run guard goes at the bottom of cli.py.",
        solution: `mkdir -p mytool && touch mytool/__init__.py
# mytool/core.py
def count_lines(path):
    with open(path, encoding="utf-8") as f:
        return sum(1 for _ in f)
# mytool/cli.py
import sys
from mytool.core import count_lines
def main():
    print(count_lines(sys.argv[1]))
if __name__ == "__main__":
    main()
# run: python -m mytool.cli README.md`,
      },
      {
        level: "hard",
        task: "Use pip-tools: keep direct dependencies in requirements.in, compile a fully pinned requirements.txt with hashes, then install it with --require-hashes into a brand-new venv.",
        hint: "pip-compile has a --generate-hashes flag.",
        solution: `python3 -m venv .venv && . .venv/bin/activate
pip install pip-tools
printf 'requests>=2.31\\npyyaml\\n' > requirements.in
pip-compile --generate-hashes -o requirements.txt requirements.in
deactivate && rm -rf .venv
python3 -m venv .venv
.venv/bin/pip install --require-hashes -r requirements.txt
.venv/bin/pip check`,
      },
    ],
    faq: [
      { q: "Do I need to activate the venv every time?", a: "Only for interactive work in a shell. Scripts, cron jobs, systemd units and Dockerfiles can call .venv/bin/python directly, which needs no activation." },
      { q: "What is the difference between pip and pipx?", a: "pip installs libraries into the current environment. pipx installs a command-line application into its own hidden venv and puts just the command on your PATH, which is ideal for tools like ansible or httpie." },
      { q: "Should I use uv, Poetry or plain pip?", a: "All work. uv is a very fast replacement for pip and venv, and Poetry manages pyproject.toml and a lock file for you. Plain venv plus pip is built in and works everywhere, which is why this path uses it." },
      { q: "Why does the python command not exist on my Linux server?", a: "Many distributions only ship python3. Use python3 outside a venv; inside an activated venv, python and python3 both work." },
    ],
  },

  "python/py-files": {
    plain: [
      "Almost every automation tool does the same three things: read some settings, accept options when you run it, and write a result. Python has a ready-made tool for each: open() for files, json and yaml for structured data, and argparse for command-line options.",
      "Files are opened with a with block. It works like a door that closes itself: when the block ends, the file is closed, even if something crashed in the middle. That prevents half-finished writes and \"too many open files\" errors.",
      "JSON and YAML are two ways to write structured data as text. JSON is strict and is what most APIs speak. YAML is easier for humans, with indentation instead of brackets and support for comments, so it is popular for config files like Docker Compose, Kubernetes and Ansible.",
      "argparse turns the words after your command, like --env prod --dry-run, into Python values. It also writes the --help text for you and shows a clear error when someone types an option wrong. Together these make a script feel like a real tool.",
    ],
    deepDive: [
      {
        heading: "Reading and writing text correctly",
        body: "Always pass encoding=\"utf-8\" to open(). Without it, the default encoding can depend on the machine's locale settings, so a file that works on your laptop may fail with UnicodeDecodeError on a server. Mode \"r\" reads, \"w\" creates the file or empties it first, \"a\" appends, and \"x\" creates only if the file does not exist yet. Add \"b\" for binary data such as images or gzip files.\n\nFor big files, loop over the file object: for line in f reads one line at a time, so a 5 GB log uses almost no memory, while f.read() loads everything at once. Each line keeps its trailing newline, so call line.rstrip(\"\\n\") or line.strip().\n\nFor small files pathlib is shorter: Path(\"notes.txt\").read_text(encoding=\"utf-8\") and write_text() open and close the file for you.",
        bullets: ["\"w\" empties the file immediately, before you write anything", "\"x\" fails if the file exists, a cheap safety check", "errors=\"replace\" keeps reading past bad bytes in messy logs"],
      },
      {
        heading: "Writing files safely with an atomic replace",
        body: "If your script crashes or the disk fills up halfway through writing config.json, the file is left broken and the next run cannot read it. The safe pattern is to write the new content to a temporary file in the same folder, flush it to disk, and then call os.replace(tmp, target).\n\nos.replace swaps the file in one step on the same filesystem: readers see either the complete old file or the complete new one, never a half-written mix. The temporary file must live on the same filesystem (so put it in the same folder) for this guarantee. Editors, package managers and databases all use this trick.\n\nFor files that other users read, check permissions too. tempfile.mkstemp and NamedTemporaryFile create files with mode 600 (owner only), so set the mode you want with os.chmod before the swap.",
        visual: {
          type: "flow",
          title: "Atomic write in four steps",
          steps: [
            { label: "Write temp file", detail: "In the same folder as the target" },
            { label: "flush and fsync", detail: "Make sure the bytes reach the disk" },
            { label: "os.replace", detail: "Swap old for new in one step" },
            { label: "Readers", detail: "See old or new, never half" },
          ],
        },
      },
      {
        heading: "JSON and YAML gotchas",
        body: "JSON has no comments, keys must be strings, and json.dumps fails on values like datetime. Pass default=str to turn unknown types into strings, indent=2 for readable output, and sort_keys=True for stable diffs.\n\nYAML is friendlier but has traps. PyYAML follows YAML 1.1, where unquoted yes, no, on and off become booleans, so a country code NO turns into False. A version like 3.10 becomes the float 3.1, and 0755 is read as an octal number (493). Quote anything that must stay a string: version: \"3.10\".\n\nyaml.safe_load builds only plain data (dicts, lists, strings, numbers). The full loader can create arbitrary Python objects, which is a code-execution risk with untrusted files, and since PyYAML 6 yaml.load even demands an explicit Loader argument. Use safe_load to read and safe_dump (with sort_keys=False to keep your key order) to write.",
        bullets: ["An empty YAML file loads as None, so write yaml.safe_load(f) or {}", "yaml.safe_load_all reads files with several documents split by ---", "json.load reads a file; json.loads reads a string"],
      },
      {
        heading: "argparse beyond the basics",
        body: "Positional arguments are required and identified by position (deploy.py web1). Options start with dashes and are optional unless you add required=True. type=int converts and checks the value, choices limits it to a fixed set, and action=\"store_true\" makes a flag that is False unless given. action=\"append\" lets a flag repeat: --tag a --tag b gives [\"a\", \"b\"]. Dashes become underscores, so --dry-run is read as args.dry_run.\n\nFor tools with several actions, like git, use subcommands: parser.add_subparsers(dest=\"cmd\", required=True), then one sub-parser per action, each with its own options.\n\nWhen the user makes a mistake, argparse prints the usage line and exits with code 2, which shells and CI treat as a failure. In tests, pass a list to parse_args([\"--env\", \"dev\"]) instead of reading the real command line.",
        visual: {
          type: "tree",
          title: "A CLI with subcommands",
          root: "infra.py",
          children: [
            { label: "deploy", children: ["version (positional)", "--env dev or prod", "--dry-run"] },
            { label: "status", children: ["--host, repeatable", "--json"] },
            { label: "rollback", children: ["--to version", "--yes to skip the prompt"] },
          ],
        },
      },
      {
        heading: "Merging config layers",
        body: "A good tool reads settings from several places and lets the most specific one win: defaults in code, then the config file, then environment variables, then CLI flags. The trick is telling \"the user did not pass this flag\" apart from \"the user passed the default value\". Give CLI options default=None, and only override when the value is not None.\n\nFor nested config, a plain dict.update replaces whole sections: updating with {\"db\": {\"host\": \"x\"}} wipes db.port. Write a small recursive merge that walks into nested dicts instead.\n\nValidate after merging, not before, and fail early with a clear message (\"db.host is required\") instead of a KeyError ten steps later. A --show-config flag that prints the final merged config, with secrets masked, saves hours of debugging.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What happens when you run tool.py --env prod",
        steps: [
          { label: "Shell splits words", detail: "sys.argv becomes [tool.py, --env, prod]" },
          { label: "argparse parses", detail: "Checks types and choices, or exits 2" },
          { label: "Load file", detail: "yaml.safe_load(config.yaml)" },
          { label: "Merge layers", detail: "Defaults, file, env vars, flags" },
          { label: "Validate", detail: "Clear error if something is wrong" },
          { label: "Run", detail: "Do the work, write the output" },
        ],
      },
      {
        type: "compare",
        title: "JSON vs YAML for config",
        columns: [
          { title: "JSON", points: ["Strict syntax, no comments", "Spoken by almost every API", "json module is built in", "Easy for programs to generate"] },
          { title: "YAML", points: ["Indentation and comments allowed", "Used by Compose, Kubernetes, Ansible", "Needs PyYAML (pip install pyyaml)", "Implicit types can surprise you"] },
        ],
      },
    ],
    examples: [
      {
        title: "Update one value in a JSON state file safely",
        explanation: "Your deploy tool keeps the last deployed time in state.json, and other scripts read that file. Step 1: read and parse the current file. Step 2: change the value in memory. Step 3: create a temporary file in the same folder with tempfile.mkstemp. Step 4: write, flush and fsync so the data really reaches the disk. Step 5: os.replace swaps it in. If the script dies at any point, state.json is still the complete old version.",
        code: {
          lang: "python",
          code: `import json, os, tempfile
from pathlib import Path

path = Path("state.json")
data = json.loads(path.read_text(encoding="utf-8"))
data["last_deploy"] = "2026-11-10T09:00:00Z"

fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
with os.fdopen(fd, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.flush()
    os.fsync(f.fileno())
os.chmod(tmp, 0o644)
os.replace(tmp, path)`,
        },
      },
      {
        title: "Defaults, YAML file, env var and flag in one loader",
        explanation: "Step 1: start from safe defaults in code. Step 2: deep-merge the YAML file on top, so a file that sets only db.host keeps the default db.port. Step 3: let the APP_ENV environment variable override env, which is handy in containers. Step 4: let --workers override everything, but only if it was actually passed (default=None). Try it with and without --workers and with APP_ENV=prod set.",
        code: {
          lang: "python",
          code: `import argparse, os, yaml

DEFAULTS = {"env": "dev", "workers": 2, "db": {"host": "localhost", "port": 5432}}

def merge(base, extra):
    out = dict(base)
    for k, v in extra.items():
        both_dicts = isinstance(v, dict) and isinstance(out.get(k), dict)
        out[k] = merge(out[k], v) if both_dicts else v
    return out

p = argparse.ArgumentParser()
p.add_argument("--workers", type=int)
args = p.parse_args()
with open("config.yaml", encoding="utf-8") as f:
    cfg = merge(DEFAULTS, yaml.safe_load(f) or {})
cfg["env"] = os.environ.get("APP_ENV", cfg["env"])
if args.workers is not None: cfg["workers"] = args.workers`,
        },
      },
    ],
    cheatSheet: [
      "open(path, encoding=\"utf-8\") avoids surprises from the server's locale",
      "for line in f: reads a huge file one line at a time",
      "json.dumps(obj, indent=2, default=str) prints readable JSON even with dates",
      "yaml.safe_load(f) or {} also handles an empty YAML file",
      "Quote YAML values like \"3.10\", \"no\" and \"0755\" so they stay strings",
      "action=\"store_true\" makes a flag; --dry-run is read as args.dry_run",
      "argparse exits with code 2 on bad arguments, so CI notices",
      "Write to a temp file in the same folder, then os.replace() it over the target",
    ],
    quiz: [
      {
        q: "What happens to config.txt the moment you call open(\"config.txt\", \"w\")?",
        options: ["Nothing until you call write()", "It is locked against other readers", "It is opened in append mode", "It is emptied (truncated) immediately"],
        answer: 3,
        why: "Mode w truncates the file as soon as it is opened.",
      },
      {
        q: "With PyYAML, what does the line country: NO load as?",
        options: ["The string \"NO\"", "The boolean False", "None", "A parse error"],
        answer: 1,
        why: "PyYAML follows YAML 1.1, where unquoted NO is a boolean.",
      },
      {
        q: "Which argparse setting makes --verbose a simple on/off flag?",
        options: ["action=\"store_true\"", "type=bool", "nargs=0", "choices=[True, False]"],
        answer: 0,
        why: "type=bool is a trap: bool(\"False\") is True, because any non-empty string is truthy.",
      },
      {
        q: "Why give CLI options default=None when merging them with a config file?",
        options: ["argparse requires it", "It shortens the help text", "So you can tell an option that was not passed apart from one that was", "So the config file is ignored"],
        answer: 2,
        why: "Only values the user actually passed should override the file.",
      },
      {
        q: "Why should the temporary file sit in the same folder as the target for an atomic replace?",
        options: ["Python cannot write to /tmp", "Files in /tmp are deleted instantly", "It makes the file smaller", "os.replace is only atomic within one filesystem"],
        answer: 3,
        why: "Across filesystems a rename becomes a copy, which is not atomic and may fail.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Read hosts.yaml, which contains a list under the key hosts, and print it as pretty JSON.",
        hint: "yaml.safe_load gives you a dict; json.dumps has an indent parameter.",
        solution: `import json, yaml

with open("hosts.yaml", encoding="utf-8") as f:
    data = yaml.safe_load(f) or {}
print(json.dumps(data.get("hosts", []), indent=2))`,
      },
      {
        level: "medium",
        task: "Write count_errors.py that takes a log file path and an optional --level (default ERROR) and prints how many lines contain that level. Exit with code 1 and a clear message if the file does not exist.",
        hint: "Use a positional argument with type=Path and parser.error() or sys.exit() for the message.",
        solution: `import argparse, sys
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("log", type=Path)
p.add_argument("--level", default="ERROR")
a = p.parse_args()
if not a.log.is_file():
    sys.exit(f"no such file: {a.log}")   # exits with code 1
with a.log.open(encoding="utf-8", errors="replace") as f:
    print(sum(1 for line in f if a.level in line))`,
      },
      {
        level: "hard",
        task: "Build a loader with the order defaults < config.yaml < APP_* environment variables < CLI flags. Add --show-config, which prints the merged result as JSON with any key named password masked.",
        hint: "Map APP_DB_HOST to cfg[\"db\"][\"host\"] by lowercasing and splitting on _ ; mask recursively before printing.",
        solution: `def from_env(prefix="APP_"):
    out = {}
    for k, v in os.environ.items():
        if k.startswith(prefix):
            *parents, leaf = k[len(prefix):].lower().split("_")
            node = out
            for p in parents: node = node.setdefault(p, {})
            node[leaf] = v
    return out
def mask(d):
    return {k: mask(v) if isinstance(v, dict) else ("***" if k == "password" else v) for k, v in d.items()}
cfg = merge(merge(DEFAULTS, file_cfg), from_env())   # then apply flags
if args.show_config: print(json.dumps(mask(cfg), indent=2))`,
      },
    ],
    faq: [
      { q: "Should I use JSON, YAML or TOML for config files?", a: "YAML is the norm in the DevOps world, JSON is best for data exchanged between programs, and TOML is used by pyproject.toml. Python 3.11 and later can read TOML with the built-in tomllib module." },
      { q: "What is the difference between json.load and json.loads?", a: "json.load reads from an open file object; json.loads parses a string. The same pair exists for writing: json.dump and json.dumps." },
      { q: "Are click or typer better than argparse?", a: "They are popular third-party libraries with nicer syntax for big CLIs. argparse is built in, needs no install, and is perfectly fine for most automation tools." },
      { q: "Why does my script fail to find config.yaml when cron runs it?", a: "cron starts in a different working folder. Build the path from the script's location, Path(__file__).resolve().parent / \"config.yaml\", or pass an absolute path." },
    ],
  },

  "python/py-os": {
    plain: [
      "Automation scripts constantly touch the operating system: they find files, delete old ones, create folders and run other programs like git, docker or df. Python has two tools that make this clean: pathlib for file paths and subprocess for running commands.",
      "pathlib treats a path as an object instead of a plain string. You join parts with a slash, Path(\"/var/log\") / \"app\", and ask questions like .exists() or .suffix. It handles the differences between Linux and Windows paths for you.",
      "subprocess.run starts another program, waits for it, and tells you how it went. The exit code (also called the return code) is the program's answer: 0 means success, anything else means something went wrong. A good script always checks it.",
      "The big safety rule: pass the command as a list of words, not as one long string. Then no shell reads your text, so a strange file name cannot sneak in an extra command. This one habit prevents a whole class of security bugs.",
    ],
    deepDive: [
      {
        heading: "pathlib and shutil methods you will use every day",
        body: "Build paths with /: base / \"logs\" / \"app.log\". Pull them apart with .name (app.log), .stem (app), .suffix (.log) and .parent (the folder). Path.home() gives your home folder, and Path(__file__).resolve().parent gives the folder of the current script, which is the right base for files that ship next to it.\n\nfolder.mkdir(parents=True, exist_ok=True) works like mkdir -p. path.unlink(missing_ok=True) deletes a file without failing if it is already gone. folder.glob(\"*.log\") matches one level and rglob(\"*.log\") searches every subfolder. p.stat() returns the size (st_size) and the last modified time (st_mtime).\n\nFor work pathlib does not cover, use shutil: copy2 copies a file with its timestamps, move moves it, rmtree deletes a whole folder tree, disk_usage reports free space, and which finds a program on PATH.",
        bullets: ["Path(__file__).resolve().parent / \"config.yaml\" finds a file next to the script", "shutil.disk_usage(\"/\").free gives free bytes without running df", "shutil.which(\"docker\") returns None if docker is not installed"],
      },
      {
        heading: "What subprocess.run does under the hood",
        body: "With a list like [\"git\", \"pull\"], Python asks the operating system to start the program directly. The OS looks up git on PATH and hands it the list as its arguments. No shell is involved, so quotes, *, $ and ; have no special meaning. Python then waits until the child exits and returns a CompletedProcess with args, returncode, stdout and stderr.\n\nIf the program does not exist, you get FileNotFoundError before anything runs. If you pass timeout=30 and the command takes longer, Python kills the child and raises TimeoutExpired, so a hung command cannot freeze your job forever.\n\nThe child inherits your environment variables and current folder. Change them per call with cwd=\"/srv/app\" and env={**os.environ, \"LANG\": \"C\"}. Passing env without copying os.environ first wipes PATH and everything else.",
        visual: {
          type: "sequence",
          title: "subprocess.run([\"git\", \"pull\"], capture_output=True, check=True)",
          actors: ["Python script", "Operating system", "git process"],
          messages: [
            { from: 0, to: 1, label: "Start git with argv [git, pull]" },
            { from: 1, to: 2, label: "Run it with inherited env and cwd" },
            { from: 2, to: 1, label: "Write output into pipes" },
            { from: 2, to: 1, label: "Exit with a return code" },
            { from: 1, to: 0, label: "Return code and captured output" },
          ],
        },
      },
      {
        heading: "Return codes, output, and commands that bend the rules",
        body: "capture_output=True collects stdout and stderr, and text=True decodes them to strings. check=True raises CalledProcessError on any non-zero exit; the exception carries .returncode, .stdout and .stderr, so log stderr when you catch it.\n\nSome commands use non-zero codes for normal answers. grep exits 1 when nothing matched and 2 on a real error. diff exits 1 when files differ. systemctl is-active exits non-zero when a unit is not running. For these, skip check=True and test result.returncode yourself.\n\ncapture_output waits until the program finishes and keeps all output in memory. For a long build whose output you want to see live, leave output uncaptured (it goes straight to your terminal) or use subprocess.Popen and read line by line. To feed data to the command's stdin, pass input=\"text\".",
        bullets: ["grep: 0 found, 1 not found, 2 error", "stderr=subprocess.STDOUT merges both streams into stdout", "Do the filtering in Python instead of using shell=True for a pipe"],
      },
      {
        heading: "Injection, concretely",
        body: "Imagine a user supplies the file name report; rm -rf ~. With run(f\"wc -l {name}\", shell=True), the shell sees two commands and runs both. With run([\"wc\", \"-l\", name]), wc simply receives one strange file name and reports that it does not exist.\n\nA quieter cousin is argument injection: a file named -rf or --help is read as an option even in list form. Put -- before user-supplied names (rm -- name), which tells most tools that options have ended, or prefix relative paths with ./ so they cannot start with a dash.\n\nIf you truly need shell features like pipes or globs, prefer doing them in Python (glob, sorted, filtering lines). When a shell string is unavoidable, quote every untrusted piece with shlex.quote. To turn a trusted command string from a config file into a safe list, use shlex.split(\"rsync -av src/ dst/\").",
      },
      {
        heading: "Scripting a disk clean-up responsibly",
        body: "Clean-up scripts are where automation does real damage, so build in brakes. First, make dry-run the default and require an explicit --apply flag to delete anything. Second, restrict scope: resolve the target folder, refuse to run on / or the home folder, and only touch files that match a pattern. Third, do not follow symlinks out of the folder; check that each resolved path is still inside the base with path.resolve().is_relative_to(base) (Python 3.9 and later).\n\nLog every file you delete together with its size, and print a summary of freed space at the end. Handle files that disappear while you run (FileNotFoundError) and files you cannot delete (PermissionError) without stopping the whole job.\n\nFinally, measure free space before and after with shutil.disk_usage, and exit non-zero if it is still below your threshold, so monitoring notices.",
        visual: {
          type: "flow",
          title: "A safe clean-up run",
          steps: [
            { label: "Parse args", detail: "Dry run unless --apply is given" },
            { label: "Resolve base", detail: "Refuse / and the home folder" },
            { label: "Find candidates", detail: "Name pattern and age filter" },
            { label: "Check each path", detail: "Still inside base, not a symlink" },
            { label: "Delete or report", detail: "Log the name and size" },
            { label: "Summarise", detail: "Freed space and exit code" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Python's OS automation toolbox",
        root: "Standard library",
        children: [
          { label: "pathlib", children: ["Build and inspect paths", "glob, rglob, read_text, stat"] },
          { label: "shutil", children: ["copy2, move, rmtree", "disk_usage, which"] },
          { label: "os", children: ["environ, getuid", "replace, chmod"] },
          { label: "subprocess", children: ["run with a list of args", "Popen to stream output"] },
          { label: "shlex", children: ["split a trusted string", "quote an untrusted value"] },
        ],
      },
    ],
    examples: [
      {
        title: "Pre-deploy checks: tools present, git tree clean",
        explanation: "Before deploying, the script makes sure the needed tools exist and that nobody is deploying uncommitted code. Step 1: shutil.which checks each tool without running it. Step 2: git rev-parse gives the short commit SHA for the release name. Step 3: git status --porcelain prints nothing when the tree is clean, so any output means stop. sys.exit with a string prints it to stderr and exits with code 1, which CI shows as a failure.",
        code: {
          lang: "python",
          code: `import shutil, subprocess, sys

for tool in ["git", "docker", "kubectl"]:
    if shutil.which(tool) is None:
        sys.exit(f"missing tool: {tool}")

def git(*args):
    return subprocess.run(["git", *args], capture_output=True,
                          text=True, check=True, timeout=30).stdout.strip()

sha = git("rev-parse", "--short", "HEAD")
if git("status", "--porcelain"):
    sys.exit("working tree has uncommitted changes")
print(f"deploying {sha}")`,
        },
      },
      {
        title: "Delete old logs with a dry-run default",
        explanation: "Step 1: take the folder as an argument and resolve it to an absolute path. Step 2: refuse dangerous targets. Step 3: walk the tree with rglob and pick regular files (not symlinks) older than 14 days. Step 4: without --apply, only print what would happen; with it, delete. Step 5: report how much space was or would be freed. Run it once without --apply and read the list before trusting it.",
        code: {
          lang: "python",
          code: `import argparse, time
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument("base", type=Path)
p.add_argument("--apply", action="store_true")
a = p.parse_args()
base = a.base.resolve()
if base in (Path("/"), Path.home()): raise SystemExit("refusing to clean this folder")
cutoff, freed = time.time() - 14 * 86400, 0
for f in base.rglob("*.log*"):
    if f.is_file() and not f.is_symlink() and f.stat().st_mtime < cutoff:
        freed += f.stat().st_size
        print("delete" if a.apply else "would delete", f)
        if a.apply: f.unlink(missing_ok=True)`,
        },
      },
    ],
    cheatSheet: [
      "Path(__file__).resolve().parent is the folder your script lives in",
      "p.mkdir(parents=True, exist_ok=True) is the Python version of mkdir -p",
      "run(cmd, capture_output=True, text=True, check=True) is the safe default",
      "timeout=60 stops a hung command and raises TimeoutExpired",
      "env={**os.environ, \"KEY\": \"v\"} adds a variable without losing PATH",
      "grep returns 1 for no match; check returncode yourself for such commands",
      "shlex.split turns a trusted string into a list; shlex.quote escapes one value",
      "Put -- before user-supplied file names so they cannot be read as options",
    ],
    quiz: [
      {
        q: "What does subprocess.run([\"grep\", \"x\", \"f.txt\"], check=True) do when grep finds no match?",
        options: ["Returns an empty CompletedProcess", "Returns None", "Raises CalledProcessError, because grep exits with 1", "Prints a warning and continues"],
        answer: 2,
        why: "check=True treats every non-zero exit code as an error, including grep's normal no-match code.",
      },
      {
        q: "You pass env={\"APP_ENV\": \"prod\"} to subprocess.run and now the command is \"not found\". Why?",
        options: ["The new env replaced everything, including PATH", "APP_ENV is a reserved name", "env only works with shell=True", "Child processes cannot read environment variables"],
        answer: 0,
        why: "env replaces the whole environment, so copy os.environ and add to it.",
      },
      {
        q: "What does Path(\"backup.tar.gz\").suffix return?",
        options: [".tar.gz", "backup", "tar.gz", ".gz"],
        answer: 3,
        why: "suffix is only the last extension; .suffixes returns ['.tar', '.gz'].",
      },
      {
        q: "Why can run([\"rm\", name]) still be risky if name comes from a user?",
        options: ["rm cannot take a list", "A name like -rf is read as an option; use rm -- name", "The shell will expand * in the name", "Lists run more slowly"],
        answer: 1,
        why: "List form stops shell injection, but not argument injection through names starting with a dash.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the 5 largest files under a folder with their sizes in MB, using only pathlib.",
        hint: "rglob(\"*\"), keep is_file(), and sort by stat().st_size.",
        solution: `from pathlib import Path

files = [p for p in Path(".").rglob("*") if p.is_file()]
for p in sorted(files, key=lambda p: p.stat().st_size, reverse=True)[:5]:
    print(f"{p.stat().st_size / 1e6:8.1f} MB  {p}")`,
      },
      {
        level: "medium",
        task: "Write a helper sh(*args) that logs the command, runs it with a 60 second timeout, returns stdout, and on failure raises RuntimeError containing the exit code and stderr.",
        hint: "Catch CalledProcessError and TimeoutExpired and re-raise with from.",
        solution: `import logging, subprocess
log = logging.getLogger(__name__)

def sh(*args, timeout=60):
    log.info("running: %s", " ".join(args))
    try:
        r = subprocess.run(args, capture_output=True, text=True, check=True, timeout=timeout)
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"{args[0]} exited {e.returncode}: {e.stderr.strip()}") from e
    except subprocess.TimeoutExpired as e:
        raise RuntimeError(f"{args[0]} timed out after {timeout}s") from e
    return r.stdout`,
      },
      {
        level: "hard",
        task: "Find every git repository under ~/code (folders containing .git) and report which ones have uncommitted changes or commits not yet pushed to their upstream branch.",
        hint: "git -C path status --porcelain and git -C path rev-list --count @{u}..HEAD; the second fails when no upstream is set.",
        solution: `import subprocess
from pathlib import Path

def git(repo, *args):
    return subprocess.run(["git", "-C", str(repo), *args], capture_output=True, text=True)

for dot_git in (Path.home() / "code").rglob(".git"):
    repo = dot_git.parent
    dirty = bool(git(repo, "status", "--porcelain").stdout.strip())
    ahead = git(repo, "rev-list", "--count", "@{u}..HEAD")
    unpushed = ahead.stdout.strip() if ahead.returncode == 0 else "no upstream"
    if dirty or unpushed not in ("0",):
        print(f"{repo}: dirty={dirty} unpushed={unpushed}")`,
      },
    ],
    faq: [
      { q: "When is shell=True acceptable?", a: "Only for fixed command strings you wrote yourself that genuinely need shell features, with no outside input mixed in. Even then, doing the pipe or glob in Python is usually cleaner." },
      { q: "Should I use os.path or pathlib?", a: "pathlib for new code. os.path works with plain strings and still appears in older scripts, but pathlib is easier to read and most standard library functions accept Path objects." },
      { q: "How do I see a command's output live while it runs?", a: "Do not capture it: subprocess.run(cmd, check=True) lets the output go straight to your terminal. If you need to process lines as they arrive, use subprocess.Popen with stdout=subprocess.PIPE and loop over proc.stdout." },
      { q: "Why does my script work in the terminal but fail under cron?", a: "cron runs with a tiny PATH and a different working folder. Use absolute paths for files and commands, or set PATH at the top of the crontab." },
    ],
  },

  "python/py-http": {
    plain: [
      "Most tools you automate have an HTTP API: GitHub, Slack, cloud providers, monitoring systems. Your script sends a request (a method like GET or POST plus a URL) and gets back a response with a status code and usually some JSON. The requests library makes this a one-liner.",
      "Most APIs want to know who you are. You usually send a token in a header, a small labelled line attached to the request, like Authorization: Bearer abc123. Keep tokens in environment variables or a secret store, never in the code or in logs.",
      "Networks fail in boring, everyday ways: a server is slow, a connection drops, an API says \"too many requests\". A robust script expects this. It sets a timeout so it never hangs, checks the status code, and retries temporary failures after a short wait.",
      "Big result sets come in pages, for example 100 items at a time. Your script keeps asking for the next page until the API says there are no more. Once you have these habits, any API becomes easy to automate.",
    ],
    deepDive: [
      {
        heading: "What one requests call really does",
        body: "requests.get(url) looks simple, but a lot happens. The hostname is turned into an IP address with DNS. A TCP connection opens, and for https a TLS handshake checks the server's certificate against trusted authorities (requests uses the certifi bundle). Then the request line, headers and body are sent, and the response status, headers and body come back.\n\nrequests helps build each part. params={\"q\": \"x\"} encodes the query string for you. json={...} sends a JSON body and sets Content-Type: application/json. data={...} sends form fields. On the way back, r.status_code is the number, r.headers is a case-insensitive dict, r.text is the decoded body and r.json() parses JSON.\n\nNever pass verify=False just to silence certificate errors in real automation; it turns off the check that you are talking to the right server. Point verify at your company's CA bundle file instead.",
        visual: {
          type: "flow",
          title: "Inside requests.get(url, timeout=5)",
          steps: [
            { label: "DNS lookup", detail: "Hostname to IP address" },
            { label: "TCP connect", detail: "The connect timeout applies here" },
            { label: "TLS handshake", detail: "The certificate is checked" },
            { label: "Send request", detail: "Method, path, headers, body" },
            { label: "Read response", detail: "The read timeout applies between bytes" },
            { label: "Response object", detail: "status_code, headers, json()" },
          ],
        },
      },
      {
        heading: "Timeouts and exceptions",
        body: "requests has no default timeout. Without one, a server that accepts the connection but never answers can block your script forever. timeout=10 sets both the connect timeout and the read timeout to 10 seconds. A tuple like timeout=(3.05, 30) sets them separately: 3.05 seconds to connect, and up to 30 seconds of silence while reading.\n\nThe read timeout is not a limit on the total download time; it is the longest allowed gap between bytes. A slow but steady download can take longer.\n\nEvery requests error inherits from requests.exceptions.RequestException. The useful subclasses are ConnectionError (DNS failure, refused connection), Timeout (with ConnectTimeout and ReadTimeout), and HTTPError, which raise_for_status() raises for 4xx and 5xx codes. Catch the specific ones you can handle and let the rest fail loudly.",
        visual: {
          type: "tree",
          title: "The requests exception family",
          root: "RequestException",
          children: [
            { label: "ConnectionError", children: ["DNS lookup failed", "Connection refused or reset"] },
            { label: "Timeout", children: ["ConnectTimeout (also a ConnectionError)", "ReadTimeout"] },
            { label: "HTTPError", children: ["Raised by raise_for_status()", "For 4xx and 5xx responses"] },
            { label: "JSONDecodeError", children: ["r.json() on a body that is not JSON"] },
          ],
        },
      },
      {
        heading: "Sessions, auth and secrets",
        body: "A requests.Session keeps settings and connections between calls. Headers you set on s.headers are sent with every request, and its connection pool reuses open TCP and TLS connections, which can make a script that makes hundreds of calls several times faster.\n\nAuth styles you will meet: auth=(\"user\", \"pass\") for HTTP Basic, a Bearer token in the Authorization header, and API keys in a custom header such as X-API-Key. Read them from environment variables. os.environ[\"TOKEN\"] fails loudly if the variable is missing, which is better than quietly sending an empty token.\n\nBe careful with logging. Do not log full headers, or URLs that carry keys in the query string. When a call fails, log the status and a short slice of the body, not the request headers. Note also that requests drops the Authorization header when a redirect sends you to a different host, a deliberate safety feature.",
      },
      {
        heading: "Retries with backoff, done right",
        body: "Retry only what can succeed the second time: connection errors, timeouts, 429 Too Many Requests, and 502, 503 or 504 from a gateway. Do not retry 400, 401, 403 or 404; the request itself is wrong and will fail again.\n\nWait longer after each failure (exponential backoff), and add a little randomness (jitter) so a hundred clients do not all retry at the same instant. If the server sends a Retry-After header, honour it. urllib3's Retry, mounted on a Session through HTTPAdapter, handles this: it honours Retry-After by default and caps each wait at 120 seconds unless you change backoff_max.\n\nMind the method. GET, PUT and DELETE are idempotent (repeating them has the same effect as doing them once), so Retry allows them by default, but not POST. A retried POST whose first attempt actually succeeded can create a duplicate. If you must retry POST, use an idempotency key if the API supports one.",
        visual: {
          type: "cycle",
          title: "The retry loop",
          steps: [
            { label: "Send request", detail: "With a timeout" },
            { label: "Temporary failure?", detail: "Timeout, 429, 502, 503, 504" },
            { label: "Wait", detail: "Retry-After, or a doubling delay plus jitter" },
            { label: "Count attempts", detail: "Give up and raise after the limit" },
          ],
        },
      },
      {
        heading: "Pagination and rate limits",
        body: "APIs split large results in three common ways. Page numbers (?page=3&per_page=100) are simple, but items can shift between pages if data changes while you read. Cursors (?cursor=abc) return a token pointing at the next chunk and stay stable; you stop when the response has no next cursor. Link headers, used by GitHub, put the next URL in a response header, which requests parses into r.links.\n\nWhatever the style, use the largest page size the API allows to cut the number of calls, and put a sanity limit on pages so a bug cannot loop forever.\n\nRate limits are the other half. Many APIs report your remaining budget in headers. GitHub, for example, sends X-RateLimit-Remaining and X-RateLimit-Reset (a Unix timestamp). A polite script slows down, or sleeps until the reset time, when the remaining count gets low, instead of hammering the API until it answers with 403 or 429.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Status code families and what your script should do",
        columns: [
          { title: "2xx success", points: ["200 OK, 201 Created", "204 No Content: no body to parse", "Carry on"] },
          { title: "4xx your request", points: ["400 bad input, 404 not found", "401 missing or bad token, 403 not allowed", "Fix the request; only 429 is worth retrying"] },
          { title: "5xx server side", points: ["500 a bug on the server", "502, 503, 504 gateway or overload", "Retry with backoff, then alert"] },
        ],
      },
    ],
    examples: [
      {
        title: "Post a deploy message to a Slack webhook",
        explanation: "At the end of a deploy you want a message in the team channel. Step 1: read the incoming webhook URL from an environment variable; the URL itself is the secret. Step 2: POST a small JSON body with json=, which also sets the Content-Type header. Step 3: use a short timeout and raise_for_status. Step 4: if the notification fails, warn but do not fail the deploy. Notice that only the exception's class name is printed: the full error message can contain the webhook URL.",
        code: {
          lang: "python",
          code: `import os, requests

url = os.environ["SLACK_WEBHOOK_URL"]
msg = {"text": "api v1.4.0 deployed to prod"}
try:
    r = requests.post(url, json=msg, timeout=(3.05, 10))
    r.raise_for_status()
except requests.exceptions.RequestException as e:
    # a failed notification must not fail the deploy
    print(f"warning: Slack notify failed: {e.__class__.__name__}")`,
        },
      },
      {
        title: "A cursor-paginated fetch that respects 429",
        explanation: "An internal inventory API returns {\"items\": [...], \"next_cursor\": \"...\"}. Step 1: a generator yields items one by one, so callers can stop early. Step 2: ask for the largest page the API allows. Step 3: on 429, sleep for the Retry-After seconds and try the same page again (this code assumes the header holds seconds; it may also be a date). Step 4: stop when next_cursor is empty. Step 5: the max_pages guard turns a looping bug into a clear error.",
        code: {
          lang: "python",
          code: `import time, requests

def fetch_all(session, url, max_pages=500):
    params = {"limit": 100}
    for _ in range(max_pages):
        r = session.get(url, params=params, timeout=10)
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", "5")))
            continue
        r.raise_for_status()
        body = r.json()
        yield from body["items"]
        if not body.get("next_cursor"):
            return
        params["cursor"] = body["next_cursor"]
    raise RuntimeError("too many pages, stopping")`,
        },
      },
    ],
    cheatSheet: [
      "requests.get(url, params={...}, timeout=10) encodes the query string for you",
      "json=payload sends JSON and sets Content-Type: application/json",
      "timeout=(3.05, 30): 3.05 s to connect, 30 s max silence while reading",
      "r.raise_for_status() turns 4xx and 5xx responses into requests.HTTPError",
      "Retry timeouts, 429, 502, 503 and 504; do not retry 400, 401, 403 or 404",
      "r.links[\"next\"][\"url\"] follows GitHub-style Link header pagination",
      "A Session reuses connections and shares headers across many calls",
      "Do not use verify=False; point verify at your CA bundle instead",
    ],
    quiz: [
      {
        q: "What is the default timeout in requests?",
        options: ["30 seconds", "There is none, so a call can wait forever", "10 seconds", "60 seconds"],
        answer: 1,
        why: "requests waits indefinitely unless you pass timeout.",
      },
      {
        q: "An endpoint returns 403 with a message saying your token lacks a permission. Should the script retry?",
        options: ["Yes, with exponential backoff", "Yes, immediately", "Only with a new Session", "No, the request will keep failing until the permission is granted"],
        answer: 3,
        why: "A permission error is not temporary, so retries only waste time and rate limit.",
      },
      {
        q: "Why does urllib3's Retry skip POST by default?",
        options: ["POST is not idempotent, so a repeat could create duplicates", "POST requests never fail", "Servers reject repeated POST requests", "POST responses have no status code"],
        answer: 0,
        why: "Repeating a POST may perform the action twice.",
      },
      {
        q: "What does timeout=(3.05, 30) mean?",
        options: ["Retry 3 times, 30 seconds apart", "A total limit of 33.05 seconds", "3.05 s to connect, then up to 30 s between bytes while reading", "30 s to connect, 3.05 s to read"],
        answer: 2,
        why: "The tuple is (connect timeout, read timeout).",
      },
      {
        q: "Which pagination style stays stable when new items are added while you read?",
        options: ["Page numbers", "Cursor tokens", "Offset and limit", "Sorting by name"],
        answer: 1,
        why: "A cursor points at a position in the data, so inserts do not shift what you see next.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Call https://api.github.com/repos/python/cpython with a 10 second timeout and print the star count and the default branch.",
        hint: "The JSON has stargazers_count and default_branch fields.",
        solution: `import requests

r = requests.get("https://api.github.com/repos/python/cpython", timeout=10)
r.raise_for_status()
repo = r.json()
print(repo["stargazers_count"], repo["default_branch"])`,
      },
      {
        level: "medium",
        task: "Write get_json(session, url) that retries up to 4 attempts on ConnectionError, Timeout, or status 429/502/503/504, sleeping about 1, 2, 4 seconds plus random jitter, and raises on anything else.",
        hint: "Loop over attempts; raise_for_status for non-retryable codes; re-raise on the last attempt.",
        solution: `import random, time, requests
RETRY = {429, 502, 503, 504}

def get_json(s, url, attempts=4):
    for i in range(attempts):
        try:
            r = s.get(url, timeout=10)
            if r.status_code not in RETRY:
                r.raise_for_status(); return r.json()
        except (requests.ConnectionError, requests.Timeout):
            if i == attempts - 1: raise
        if i < attempts - 1: time.sleep(2 ** i + random.random())
    r.raise_for_status()`,
      },
      {
        level: "hard",
        task: "List all public repos of a GitHub org, following Link pagination, and print the 5 with the most open issues. If X-RateLimit-Remaining reaches 0, sleep until X-RateLimit-Reset.",
        hint: "Endpoint /orgs/{org}/repos?per_page=100; each repo has open_issues_count.",
        solution: `import time, requests
s, repos = requests.Session(), []
url = "https://api.github.com/orgs/python/repos?per_page=100"
while url:
    r = s.get(url, timeout=10); r.raise_for_status()
    repos += r.json()
    if r.headers.get("X-RateLimit-Remaining") == "0":
        time.sleep(max(0, int(r.headers["X-RateLimit-Reset"]) - time.time()) + 1)
    url = r.links.get("next", {}).get("url")
for repo in sorted(repos, key=lambda x: x["open_issues_count"], reverse=True)[:5]:
    print(repo["open_issues_count"], repo["name"])`,
      },
    ],
    faq: [
      { q: "Should I use requests or httpx?", a: "Both are fine. requests is the long-standing standard for synchronous scripts; httpx has a very similar API and adds async support and HTTP/2, which matters inside async apps like FastAPI." },
      { q: "Why do I get SSLError CERTIFICATE_VERIFY_FAILED?", a: "The server's certificate is not trusted by the CA bundle requests uses, often because of a company proxy or a private CA. Pass verify=\"/path/to/ca.pem\" or set REQUESTS_CA_BUNDLE, rather than turning verification off." },
      { q: "How do I upload a file with requests?", a: "Pass files={\"file\": open(\"report.csv\", \"rb\")} to requests.post. requests builds a multipart/form-data body for you." },
      { q: "What does status 429 mean?", a: "Too Many Requests: you hit the API's rate limit. Wait, ideally for the time in the Retry-After header, and slow down." },
    ],
  },

  "python/py-test": {
    plain: [
      "When automation runs at 3 a.m. with nobody watching, it needs to leave a trail. Logging writes timestamped messages with a level (how serious each one is), so later you can see exactly what happened and where it stopped. print is fine while learning; logging is what real tools use.",
      "Errors in Python are exceptions. When something goes wrong, code raises one, and the program stops unless some code catches it. Good scripts catch only the errors they know how to handle, and let surprises crash loudly with a clear message instead of carrying on in a broken state.",
      "Tests are small pieces of code that run your code and check the result. pytest is the standard tool: write a function whose name starts with test_, use a plain assert, and run pytest. If the assert is false, pytest shows you the actual values.",
      "Automation code talks to the outside world: it runs commands and calls APIs. In tests you replace those parts with fakes (mocks) that return prepared answers. Tests then run in milliseconds, never touch a real server, and still prove your logic is right.",
    ],
    deepDive: [
      {
        heading: "How the logging module is wired",
        body: "logging has four parts. Loggers are what your code calls, created with logging.getLogger(__name__) so each module gets one named after it. Handlers decide where records go: the console, a file, syslog. Formatters decide how a line looks. Levels filter on both loggers and handlers.\n\nLoggers form a tree by their dotted names: mytool.cli is a child of mytool, and everything is a child of the root logger. A record travels up the tree (propagation) to the handlers of its ancestors, so you usually configure handlers only on the root, once, at program start, with logging.basicConfig(level=logging.INFO, format=...).\n\nbasicConfig does nothing if the root logger already has handlers, which confuses people; pass force=True to replace them. Libraries should never call basicConfig; only the application decides where logs go. Without any configuration, only WARNING and above are shown.",
        bullets: ["DEBUG 10, INFO 20, WARNING 30, ERROR 40, CRITICAL 50", "logger.info(\"copied %s files\", n) builds the text only if it is logged", "logger.exception(\"msg\") inside except also logs the traceback"],
        visual: {
          type: "flow",
          title: "Life of logger.info(\"Deploy started\")",
          steps: [
            { label: "Logger level check", detail: "Dropped if below the logger's level" },
            { label: "Create record", detail: "Message, level, time, logger name" },
            { label: "Propagate up", detail: "mytool.cli, then mytool, then root" },
            { label: "Handler level check", detail: "Each handler filters again" },
            { label: "Formatter", detail: "Turns the record into a line of text" },
            { label: "Output", detail: "Console, file or syslog" },
          ],
        },
      },
      {
        heading: "Raising and catching exceptions well",
        body: "Catch the narrowest exception you can handle: except FileNotFoundError, not except Exception, and never a bare except:, which also catches KeyboardInterrupt (Ctrl+C) and SystemExit. Keep the try block small so you know which line failed.\n\ntry has two lesser-known parts. else runs only if no exception happened, which keeps the happy path out of the try block. finally always runs, so it is a place for clean-up, though a with block is usually better.\n\nWhen you turn a low-level error into a clearer one, chain it: raise ConfigError(\"db.host missing\") from err. The traceback then shows both, so nothing is hidden. For a tool, define a small hierarchy, such as class ToolError(Exception) with subclasses, catch ToolError once in main(), log a one-line message and exit with code 1. Unexpected exceptions still crash with a full traceback, which is what you want for real bugs.",
      },
      {
        heading: "How pytest finds and runs tests",
        body: "pytest collects files named test_*.py or *_test.py, then functions whose names start with test, and classes named Test... that have no __init__ method. It rewrites assert statements, so a failure shows both sides of the comparison and the values that led there. No special assertEqual methods are needed.\n\nUseful flags: -x stops at the first failure, -k \"disk and not slow\" selects tests by name, -v lists each test, --lf reruns only the last failures, and -q keeps output short. pytest exits with code 0 when all tests pass and 1 when some fail, which CI uses to mark the build red.\n\nFixtures shared by many test files go in a conftest.py file, which pytest finds automatically without imports. Built-in fixtures cover a lot: tmp_path gives a fresh temporary folder, monkeypatch replaces attributes and environment variables, capsys captures printed output and caplog captures log records.",
        bullets: ["pytest -x -q for a fast feedback loop", "with pytest.raises(ValueError, match=\"port\"): checks the error and its message", "caplog.text contains every log line emitted during the test"],
      },
      {
        heading: "Fixtures and parametrize in depth",
        body: "A fixture is a function marked @pytest.fixture. Any test that names it as a parameter receives its value. If the fixture uses yield instead of return, the code after yield runs as teardown, even when the test failed. That is how you create a temporary config, a fake server or a database connection and clean up afterwards.\n\nFixtures have a scope. The default, function, builds a fresh one for every test. module, package and session reuse one object across many tests, which is faster for expensive setup but lets tests leak state into each other. Fixtures can depend on other fixtures.\n\n@pytest.mark.parametrize(\"value,expected\", [...]) runs one test once per row, and each row is reported as its own test with an id like test_parse[42-42]. Use pytest.param(..., id=\"empty\") for readable names. Stacking two parametrize decorators runs every combination.",
      },
      {
        heading: "Mocking: patch where the name is looked up",
        body: "unittest.mock.patch and pytest's monkeypatch replace an object for the duration of one test. The rule people trip on: patch the name where your code looks it up, not where it was defined. If deploy.py does from subprocess import run, deploy now has its own name run, and you must patch deploy.run. If it does import subprocess and calls subprocess.run, patch subprocess.run.\n\nA MagicMock records every call, so you can check how your code used it: mock_run.assert_called_once_with([\"systemctl\", \"restart\", \"app\"], check=True). Set return_value for normal answers, and side_effect to raise an exception or return different values on successive calls.\n\nFor HTTP, the responses library intercepts requests calls at the transport level, so your real requests code runs against fake responses. Do not over-mock: a test that mocks everything only proves that the mocks agree with each other.",
        visual: {
          type: "compare",
          title: "Where to patch subprocess.run",
          columns: [
            { title: "deploy.py: from subprocess import run", points: ["deploy has its own name run", "Patch deploy.run", "Patching subprocess.run has no effect"] },
            { title: "deploy.py: import subprocess", points: ["deploy calls subprocess.run", "Patch subprocess.run", "The name is looked up at call time"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A yield fixture around one test",
        actors: ["pytest", "fixture", "test"],
        messages: [
          { from: 0, to: 1, label: "Call the fixture" },
          { from: 1, to: 0, label: "Run setup, yield the value" },
          { from: 0, to: 2, label: "Run the test with that value" },
          { from: 2, to: 0, label: "Pass or fail" },
          { from: 0, to: 1, label: "Resume after yield" },
          { from: 1, to: 0, label: "Teardown finished" },
        ],
      },
      {
        type: "tree",
        title: "A small exception hierarchy for a deploy tool",
        root: "ToolError(Exception)",
        children: [
          { label: "ConfigError", children: ["Missing or invalid settings", "Raised from the original KeyError"] },
          { label: "RemoteCommandError", children: ["A command exited non-zero", "Stores returncode and stderr"] },
          { label: "ApiError", children: ["HTTP call failed after retries", "Stores the status code"] },
          { label: "Anything else", children: ["Real bugs like TypeError", "Crash with a full traceback"] },
        ],
      },
    ],
    examples: [
      {
        title: "Test an API helper with the responses library",
        explanation: "latest_tag() asks GitHub for a repo's latest release. Step 1: decorate the test with @responses.activate, so no real network call can happen. Step 2: register a fake 200 response with the JSON your code expects and check the result. Step 3: replace it with a 404 and check that the helper raises HTTPError instead of returning garbage. Install with pip install responses.",
        code: {
          lang: "python",
          code: `import pytest, requests, responses

URL = "https://api.github.com/repos/acme/api/releases/latest"
def latest_tag(repo):
    r = requests.get(f"https://api.github.com/repos/{repo}/releases/latest", timeout=5)
    r.raise_for_status()
    return r.json()["tag_name"]

@responses.activate
def test_latest_tag_ok_and_missing():
    responses.add(responses.GET, URL, json={"tag_name": "v1.4.0"})
    assert latest_tag("acme/api") == "v1.4.0"
    responses.replace(responses.GET, URL, status=404)
    with pytest.raises(requests.HTTPError):
        latest_tag("acme/api")`,
        },
      },
      {
        title: "Logging setup and one error boundary in main()",
        explanation: "Step 1: each module gets a named logger. Step 2: main() configures logging once, with timestamps, and a -v flag switches to DEBUG. Step 3: known problems raise ToolError, which main() catches and logs as one clean line before returning exit code 1. Step 4: anything else is a bug and crashes with a full traceback. Run it and you see a single timestamped ERROR line and exit code 1.",
        code: {
          lang: "python",
          code: `import logging, sys
log = logging.getLogger("mytool")
class ToolError(Exception): pass
def sync_files():
    raise ToolError("target folder /srv/data does not exist")

def main(verbose=False):
    logging.basicConfig(level=logging.DEBUG if verbose else logging.INFO,
                        format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    try:
        sync_files()
    except ToolError as e:
        log.error("%s", e)
        return 1
    return 0
sys.exit(main("-v" in sys.argv))`,
        },
      },
    ],
    cheatSheet: [
      "log = logging.getLogger(__name__) in each module; configure handlers once in main",
      "logging.basicConfig(level=logging.INFO, format=\"%(asctime)s %(levelname)s %(message)s\")",
      "logger.exception(\"msg\") inside except logs the message plus the traceback",
      "raise NewError(\"clear message\") from err keeps the original cause visible",
      "pytest -x -q --lf reruns the last failures and stops at the first one",
      "with pytest.raises(KeyError): asserts that the code raises the right error",
      "tmp_path, monkeypatch, capsys and caplog are built-in pytest fixtures",
      "After from subprocess import run, patch deploy.run, not subprocess.run",
    ],
    quiz: [
      {
        q: "You call logger.info(\"hi\") without configuring logging. What is printed?",
        options: ["Nothing, because only WARNING and above are shown by default", "hi", "INFO:root:hi", "An error about missing handlers"],
        answer: 0,
        why: "Unconfigured logging falls back to a handler that shows WARNING and above.",
      },
      {
        q: "deploy.py contains from subprocess import run. What must a test patch?",
        options: ["subprocess.run", "subprocess.Popen", "deploy.run", "os.system"],
        answer: 2,
        why: "The from-import created a separate name in deploy, and that is what the code calls.",
      },
      {
        q: "Why avoid a bare except: clause?",
        options: ["It is a syntax error in Python 3", "It is slower than except Exception", "It only catches the first error", "It also catches KeyboardInterrupt and SystemExit and hides real bugs"],
        answer: 3,
        why: "A bare except catches everything, including Ctrl+C and sys.exit().",
      },
      {
        q: "In a pytest fixture, when does the code after yield run?",
        options: ["Never; yield ends the fixture", "As teardown, after the test finishes, even if it failed", "Before the test starts", "Only when the test passes"],
        answer: 1,
        why: "pytest resumes the fixture after the test to run its clean-up.",
      },
      {
        q: "Which pytest exit code means that some tests failed?",
        options: ["0", "2", "1", "5"],
        answer: 2,
        why: "0 is all passed, 1 is test failures, 2 is interrupted and 5 is no tests collected.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write is_valid_port(p) that returns True only for integers 1 to 65535, and test it with parametrize using at least 5 cases, including 0, 65536 and the string \"80\".",
        hint: "Check isinstance(p, int) first; bool is a subclass of int, so exclude it too.",
        solution: `import pytest

def is_valid_port(p):
    return isinstance(p, int) and not isinstance(p, bool) and 1 <= p <= 65535

@pytest.mark.parametrize("p,ok", [(1, True), (80, True), (65535, True),
                                  (0, False), (65536, False), ("80", False)])
def test_is_valid_port(p, ok):
    assert is_valid_port(p) is ok`,
      },
      {
        level: "medium",
        task: "Write read_config(path) that raises your own ConfigError (chained from the original error) if the file is missing. Test the happy path with tmp_path and the missing-file path with pytest.raises.",
        hint: "raise ConfigError(...) from e; tmp_path / \"c.json\" gives a writable path.",
        solution: `import json, pytest
class ConfigError(Exception): pass
def read_config(path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as e:
        raise ConfigError(f"config not found: {path}") from e
def test_read_ok(tmp_path):
    (tmp_path / "c.json").write_text('{"env": "dev"}')
    assert read_config(tmp_path / "c.json") == {"env": "dev"}
def test_read_missing(tmp_path):
    with pytest.raises(ConfigError, match="not found"): read_config(tmp_path / "nope.json")`,
      },
      {
        level: "hard",
        task: "A module svc has restart_service(name), which runs systemctl restart, logs a warning containing \"retrying\" and retries once if the first call fails. Test it: make the fake subprocess.run fail first and succeed second, then check the call count and the log.",
        hint: "svc does import subprocess, so patch svc.subprocess.run; caplog.set_level makes WARNING visible.",
        solution: `def test_restart_retries_once(monkeypatch, caplog):
    calls = []
    def fake_run(cmd, **kw):
        calls.append(cmd)
        if len(calls) == 1:
            raise subprocess.CalledProcessError(1, cmd)
        return subprocess.CompletedProcess(cmd, 0)
    monkeypatch.setattr(svc.subprocess, "run", fake_run)
    caplog.set_level("WARNING")
    svc.restart_service("app")
    assert len(calls) == 2
    assert "retrying" in caplog.text`,
      },
    ],
    faq: [
      { q: "Does logging really matter for small scripts?", a: "As soon as a script runs unattended, yes. Logging gives timestamps and levels, can go to a file or the journal, and can be turned up to DEBUG without editing code." },
      { q: "Where should I put my tests?", a: "In a tests/ folder next to your package, in files named test_*.py. Put shared fixtures in tests/conftest.py." },
      { q: "Should I use unittest or pytest?", a: "pytest for new code: plain asserts, fixtures and better output. It also runs existing unittest-style tests, so you can switch gradually." },
      { q: "Why do I not see my print output when tests run?", a: "pytest captures output and shows it only for failing tests. Run pytest -s to let it through, or use capsys to check it in the test." },
    ],
  },

  "python/py-web": {
    plain: [
      "FastAPI is a Python framework for building web APIs. You write normal functions, put a decorator like @app.get(\"/health\") above them, and FastAPI turns each one into a URL that returns JSON. It is fast, popular, and small enough to learn in an afternoon.",
      "Its trick is type hints. When you write qty: int, FastAPI checks that the client really sent a number. Bad input gets an automatic, detailed error with status 422, so your function only ever sees clean data. Pydantic, a data validation library, does this checking.",
      "FastAPI also writes documentation for you. Open /docs in a browser and you get an interactive page listing every endpoint, where you can try requests without any extra tools.",
      "In this path, this app is what you will ship. So it needs what every production service needs: a health check that load balancers and Kubernetes can call, settings read from environment variables, and tests. Get those right now and Docker and Kubernetes become much easier later.",
    ],
    deepDive: [
      {
        heading: "From the socket to your function",
        body: "FastAPI does not listen on a port itself; a server such as uvicorn does that. uvicorn speaks ASGI (Asynchronous Server Gateway Interface), the standard way async Python web servers talk to apps. FastAPI is built on Starlette, which provides routing and the request and response objects; FastAPI adds validation, dependency injection and the docs.\n\nPlain def endpoints run in a thread pool, so blocking calls inside them (a requests call, a slow file read) are fine. async def endpoints run directly on the event loop, which handles many concurrent requests efficiently, but one blocking call inside them freezes every request on that worker. Rule of thumb: use async def only when everything slow inside it is awaited (httpx.AsyncClient, asyncpg); otherwise use def.\n\nuvicorn app.main:app --host 0.0.0.0 --port 8000 starts it. In a container, 0.0.0.0 is required, because 127.0.0.1 is not reachable from outside the container.",
        visual: {
          type: "layers",
          title: "The request stack",
          layers: [
            { label: "Client", detail: "curl, a browser, another service" },
            { label: "uvicorn", detail: "Parses HTTP and calls the ASGI app" },
            { label: "Starlette", detail: "Routing, request and response objects" },
            { label: "FastAPI", detail: "Validation, dependencies, docs" },
            { label: "Your function", detail: "Business logic, returns data" },
          ],
        },
      },
      {
        heading: "Pydantic models, validation and responses",
        body: "FastAPI decides where each function parameter comes from. Names in the path (/items/{item_id}) are path parameters, simple types not in the path are query parameters (?limit=10), and Pydantic models are read from the JSON body.\n\nField adds rules: name: str = Field(min_length=1, max_length=50) or qty: int = Field(gt=0). Pydantic v2 runs in lax mode by default, so the string \"5\" is accepted for an int field, but \"abc\" is not. When validation fails, FastAPI returns 422 with a detail list; each entry has loc (where, such as [\"body\", \"qty\"]), msg and type.\n\nresponse_model controls what goes out. If you return a user record with a password_hash field but declare response_model=UserOut without that field, FastAPI filters it away. That makes accidental data leaks much less likely.",
        bullets: ["Field(gt=0, le=1000) for numbers; min_length and max_length for strings", "Optional field: note: str | None = None", "item.model_dump() turns a model into a plain dict"],
      },
      {
        heading: "Health checks that tell the truth",
        body: "Two different questions hide behind \"is the app healthy?\". Liveness asks: is the process stuck? Readiness asks: can it serve traffic right now, for example is the database reachable? Kubernetes uses both: a failing liveness probe restarts the container, while a failing readiness probe only removes the pod from the Service's load balancing until it recovers.\n\nKeep the liveness endpoint (often /health or /livez) cheap and free of dependencies. If it checked the database, a short database outage would make Kubernetes restart every pod at once, which makes things worse. Put dependency checks in the readiness endpoint (/ready or /readyz), give each check a short timeout, and return 503 when something is down.\n\nReturn something useful in the body, such as the version and git SHA, so you can see which build is running with a single curl.",
        visual: {
          type: "compare",
          title: "Liveness vs readiness",
          columns: [
            { title: "Liveness: /health", points: ["Is the process alive?", "No dependency checks", "Fails: the container is restarted"] },
            { title: "Readiness: /ready", points: ["Can it take traffic now?", "Checks the database and cache", "Fails: removed from load balancing"] },
          ],
        },
      },
      {
        heading: "Settings from the environment",
        body: "The same image should run in dev, staging and prod, with only configuration changing. That configuration comes from environment variables, as the twelve-factor app method recommends. The pydantic-settings package (a separate install since Pydantic v2) makes this tidy: subclass BaseSettings, declare typed fields, and it reads matching environment variables, case-insensitively by default.\n\nA field without a default, such as database_url: str, is required, so the app fails at startup with a clear error instead of crashing on the first request. Values are converted and checked: APP_WORKERS=abc fails immediately for an int field. env_prefix=\"APP_\" in model_config namespaces your variables, and env_file=\".env\" loads a local file for development (never commit it).\n\nCreate the settings once and share them, for example through a function decorated with functools.lru_cache and injected with Depends. Tests can then override that dependency with different values.",
      },
      {
        heading: "Testing endpoints and running for real",
        body: "TestClient (it needs the httpx package installed) calls your app in-process, with no server and no port. client.get(\"/health\") returns a response object much like requests does. To swap a real dependency, such as the database session or settings, set app.dependency_overrides[get_settings] = lambda: Settings(...) in the test and clear it afterwards.\n\nUse the with TestClient(app) as client: form when your app has startup and shutdown logic (a lifespan function), because only then do those events run.\n\nIn production you can run uvicorn with several worker processes (--workers 4), or run one process per container and let Kubernetes scale the number of containers; the second is the common choice. The fastapi run command (from fastapi-cli, included with pip install \"fastapi[standard]\") starts uvicorn with production-style defaults, listening on 0.0.0.0 port 8000.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where FastAPI reads each parameter",
        root: "Route function parameters",
        children: [
          { label: "Path", children: ["item_id: int", "Declared in /items/{item_id}"] },
          { label: "Query", children: ["limit: int = 10", "From ?limit=10, optional with a default"] },
          { label: "Body", children: ["item: Item", "JSON parsed into a Pydantic model"] },
          { label: "Dependencies", children: ["Header() for headers", "Depends(get_settings) for shared objects"] },
        ],
      },
      {
        type: "flow",
        title: "Settings at startup",
        steps: [
          { label: "Container starts", detail: "Env vars set by Docker or Kubernetes" },
          { label: "Settings() created", detail: "Reads APP_ variables" },
          { label: "Validate types", detail: "Fail fast if missing or wrong" },
          { label: "Serve requests", detail: "Routes get settings via Depends" },
        ],
      },
    ],
    examples: [
      {
        title: "Separate liveness and readiness endpoints",
        explanation: "Step 1: /health answers instantly with the version, so it only fails if the process is broken. Step 2: /ready tries to open a TCP connection to the database host with a 1 second timeout. Step 3: if that fails, it returns 503, so Kubernetes stops sending traffic but does not restart the pod. Step 4: test it with curl -i localhost:8000/ready while the database is stopped and started. A real app would run a cheap query such as SELECT 1 instead of a bare socket check.",
        code: {
          lang: "python",
          code: `import os, socket
from fastapi import FastAPI
from fastapi.responses import JSONResponse
app = FastAPI()
VERSION = os.getenv("APP_VERSION", "dev")
@app.get("/health")
def health():
    return {"status": "ok", "version": VERSION}
@app.get("/ready")
def ready():
    try:
        socket.create_connection((os.getenv("DB_HOST", "localhost"), 5432), timeout=1).close()
    except OSError:
        return JSONResponse({"status": "db unreachable"}, status_code=503)
    return {"status": "ready"}`,
        },
      },
      {
        title: "Typed settings with a test override",
        explanation: "Step 1: Settings reads APP_ENV from the environment because of env_prefix. Step 2: get_settings is cached, so the environment is read once. Step 3: the route receives settings through Depends instead of a global. Step 4: the test replaces the dependency with app.dependency_overrides, so it controls the value without touching real environment variables. Install with pip install fastapi pydantic-settings httpx.",
        code: {
          lang: "python",
          code: `from functools import lru_cache
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="APP_")
    env: str = "dev"
@lru_cache
def get_settings() -> Settings:
    return Settings()
app = FastAPI()
@app.get("/info")
def info(s: Settings = Depends(get_settings)):
    return {"env": s.env}
app.dependency_overrides[get_settings] = lambda: Settings(env="test")
assert TestClient(app).get("/info").json()["env"] == "test"`,
        },
      },
    ],
    cheatSheet: [
      "uvicorn app.main:app --reload for development; --host 0.0.0.0 inside containers",
      "/docs is the interactive Swagger UI; /openapi.json is the raw schema",
      "Path params come from the URL, simple types are query params, models are the body",
      "Field(gt=0, max_length=50) adds validation rules to a model field",
      "response_model=UserOut filters out fields you never want to return",
      "Liveness: cheap, no dependencies. Readiness: check dependencies, return 503 when down",
      "app.dependency_overrides[get_db] = fake_db swaps a dependency in tests",
      "Use def for blocking code; use async def only when everything slow inside is awaited",
    ],
    quiz: [
      {
        q: "An async def endpoint calls requests.get() on a slow API. What happens?",
        options: ["Nothing special; FastAPI moves it to a thread", "FastAPI refuses to start", "requests becomes async automatically", "The event loop is blocked, so other requests on that worker wait"],
        answer: 3,
        why: "Only plain def endpoints run in the thread pool; blocking code in async def stalls the loop.",
      },
      {
        q: "Why should a liveness probe not check the database?",
        options: ["A short database outage would make Kubernetes restart every pod at once", "Liveness probes cannot open network connections", "It slows down /docs", "Databases block health checks"],
        answer: 0,
        why: "Restarting healthy pods does not fix the database and adds load during the incident.",
      },
      {
        q: "uvicorn in a container listens on 127.0.0.1:8000, and docker run -p 8000:8000 cannot reach it. Why?",
        options: ["Port 8000 is reserved", "FastAPI needs --reload", "127.0.0.1 inside the container is unreachable from outside; listen on 0.0.0.0", "TestClient is still holding the port"],
        answer: 2,
        why: "Published ports forward to the container's network interface, not its loopback.",
      },
      {
        q: "For @app.get(\"/items/{item_id}\") with def get(item_id: int, limit: int = 10), where does limit come from?",
        options: ["The URL path", "The query string, like ?limit=5", "The JSON body", "An environment variable"],
        answer: 1,
        why: "A simple-typed parameter that is not in the path is treated as a query parameter.",
      },
      {
        q: "Which status does FastAPI return when a request body fails Pydantic validation?",
        options: ["400", "500", "422", "404"],
        answer: 2,
        why: "FastAPI returns 422 with a detail list describing each validation error.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add GET /version that returns the APP_VERSION environment variable (default \"dev\"), and write a TestClient test that sets it with monkeypatch.setenv.",
        hint: "Read the variable inside the function, not at import time, so the test's value is seen.",
        solution: `import os
from fastapi import FastAPI
from fastapi.testclient import TestClient
app = FastAPI()
@app.get("/version")
def version():
    return {"version": os.getenv("APP_VERSION", "dev")}
def test_version(monkeypatch):
    monkeypatch.setenv("APP_VERSION", "1.4.0")
    assert TestClient(app).get("/version").json() == {"version": "1.4.0"}`,
      },
      {
        level: "medium",
        task: "Create POST /items that accepts an Item with name (1 to 50 characters) and qty (greater than 0) and returns 201. Prove with TestClient that a valid body gives 201 and an empty name with qty 0 gives 422.",
        hint: "Use Field(min_length=1, max_length=50) and Field(gt=0), and status_code=201 on the decorator.",
        solution: `from fastapi import FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel, Field
app = FastAPI()
class Item(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    qty: int = Field(gt=0)
@app.post("/items", status_code=201)
def create(item: Item):
    return item
assert TestClient(app).post("/items", json={"name": "bolt", "qty": 2}).status_code == 201
assert TestClient(app).post("/items", json={"name": "", "qty": 0}).status_code == 422`,
      },
      {
        level: "hard",
        task: "Make /ready depend on a check_db dependency that returns True or False. Return 503 when it is False. Test both the 200 and 503 cases by overriding the dependency, and clean up the override afterwards.",
        hint: "Depends(check_db) in the route; app.dependency_overrides[check_db] = lambda: False in the test.",
        solution: `def check_db() -> bool:
    return True   # real version: SELECT 1 with a short timeout
@app.get("/ready")
def ready(db_ok: bool = Depends(check_db)):
    if not db_ok:
        raise HTTPException(503, "database unreachable")
    return {"status": "ready"}
def test_ready():
    assert TestClient(app).get("/ready").status_code == 200
    app.dependency_overrides[check_db] = lambda: False
    assert TestClient(app).get("/ready").status_code == 503
    app.dependency_overrides.clear()`,
      },
    ],
    faq: [
      { q: "Should I use FastAPI or Flask?", a: "Both are solid. FastAPI gives you request validation, async support and automatic API docs out of the box; Flask is older, simpler and has a huge ecosystem. For a new JSON API, FastAPI is a common choice." },
      { q: "What is the difference between uvicorn and gunicorn?", a: "uvicorn is an ASGI server that runs FastAPI. gunicorn is a process manager for Python web servers and can supervise several uvicorn worker processes. In Kubernetes, many teams simply run one uvicorn process per container." },
      { q: "Where are the API docs FastAPI generates?", a: "At /docs (Swagger UI) and /redoc while the app is running. The raw OpenAPI schema is at /openapi.json." },
      { q: "Why do I get 422 when I send an HTML form?", a: "A Pydantic model parameter expects a JSON body. For form fields, declare parameters with Form(), which also needs the python-multipart package installed." },
    ],
  },
};

export default extra;
