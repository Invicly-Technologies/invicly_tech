import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  "linux/fs-perms": {
    summary:
      "Every file in Linux has an owner, a group and three sets of permission bits. Most 'permission denied' errors come from the wrong owner or a missing bit, so reading ls -l output fixes them fast.",
    analogy: "Like an office key card that opens different doors for you, your team and visitors.",
    visuals: [
      {
        type: "tree",
        title: "Reading -rwxr-x--- (mode 750)",
        root: "-rwxr-x--- deploy:web",
        children: [
          { label: "Owner rwx = 7", children: ["r read = 4", "w write = 2", "x execute = 1"] },
          { label: "Group r-x = 5", children: ["Members of group web", "Can read and run"] },
          { label: "Others --- = 0", children: ["Everyone else", "No access at all"] },
        ],
      },
      {
        type: "flow",
        title: "Fixing permission denied",
        steps: [
          { label: "Read the error", detail: "Note the exact path and the user running the command." },
          { label: "Check with ls -l", detail: "See owner, group and mode of the file and parent dirs." },
          { label: "Check your identity", detail: "Run id to list your user and groups." },
          { label: "Fix owner or mode", detail: "Use chown for wrong owner, chmod for missing bits." },
          { label: "Retest as that user", detail: "Use sudo -u to confirm the fix for the real user." },
        ],
      },
    ],
    keyPoints: [
      "Permissions are read, write and execute for owner, group and others.",
      "Octal modes add up: r=4, w=2, x=1, so 640 means rw-r-----.",
      "Directories need x to be entered and r to list their contents.",
      "Give access through groups and sudo rules instead of chmod 777.",
    ],
    terms: [
      { term: "chmod", meaning: "Changes the permission bits of a file or directory." },
      { term: "chown", meaning: "Changes the owner and group of a file." },
      { term: "Octal mode", meaning: "Three digits encoding owner, group and others permissions." },
      { term: "sudo", meaning: "Runs a command as another user, usually root, if allowed." },
      { term: "du", meaning: "Shows how much disk space files and directories use." },
    ],
    example: {
      lang: "bash",
      code: "ls -l /srv/app/config.yml\nsudo chown deploy:web /srv/app/config.yml\nsudo chmod 640 /srv/app/config.yml\nfind /srv/app -type f -perm -o+w\ndu -sh /var/log/* | sort -h | tail -5\nsudo usermod -aG web alice\nid alice",
      caption: "Inspect, fix ownership and mode, and find world-writable files.",
    },
    pitfalls: [
      "Using chmod -R 777 to make an error go away; it opens files to everyone.",
      "Forgetting -a in usermod -aG, which removes the user from other groups.",
      "Expecting new group membership to apply before the user logs in again.",
    ],
    check: [
      { q: "What does chmod 640 allow?", a: "The owner can read and write, the group can read, and others get nothing." },
      { q: "Why can't you cd into a directory with mode 644?", a: "Entering a directory needs the execute bit, and 644 has no x for anyone." },
    ],
  },

  "linux/processes": {
    summary:
      "A process is a running program with a PID, an owner and resources. systemd starts services at boot, restarts them when they crash and collects their logs, which journalctl lets you read.",
    analogy: "systemd is a building manager who starts every machine in the morning and restarts any that stall.",
    visuals: [
      {
        type: "flow",
        title: "Run your app as a service",
        steps: [
          { label: "Write unit file", detail: "Create /etc/systemd/system/app.service with ExecStart." },
          { label: "daemon-reload", detail: "Tell systemd to read new or changed unit files." },
          { label: "enable --now", detail: "Start it now and on every boot." },
          { label: "Check status", detail: "systemctl status shows state, PID and recent log lines." },
          { label: "Read logs", detail: "journalctl -u app -f follows the service output live." },
        ],
      },
      {
        type: "compare",
        title: "Common signals",
        columns: [
          { title: "SIGTERM (15)", points: ["Default for kill", "Asks politely to stop", "App can clean up", "Try this first"] },
          { title: "SIGKILL (9)", points: ["kill -9", "Kernel stops it instantly", "No cleanup possible", "Last resort only"] },
          { title: "SIGHUP (1)", points: ["Hang-up signal", "Many daemons reload config", "Behaviour depends on the app"] },
        ],
      },
    ],
    keyPoints: [
      "Use ps, top or htop to find a process, its PID and its CPU and memory use.",
      "Send SIGTERM first so the process can shut down cleanly; SIGKILL cannot be caught.",
      "A systemd unit with Restart=on-failure brings a crashed service back automatically.",
      "journalctl -u name shows a service's logs; add -f to follow or --since to filter.",
    ],
    terms: [
      { term: "PID", meaning: "The unique number identifying a running process." },
      { term: "Signal", meaning: "A small message the kernel delivers to a process, like TERM or KILL." },
      { term: "systemd", meaning: "The init system that starts and supervises services on most distros." },
      { term: "Unit file", meaning: "A config file describing how systemd runs a service." },
      { term: "journalctl", meaning: "The tool for reading logs collected by systemd's journal." },
    ],
    example: {
      lang: "ini",
      code: "[Unit]\nDescription=FastAPI app\nAfter=network.target\n\n[Service]\nUser=deploy\nWorkingDirectory=/srv/app\nExecStart=/srv/app/.venv/bin/uvicorn main:app --port 8000\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target",
      caption: "Save as /etc/systemd/system/app.service, then systemctl enable --now app.",
    },
    pitfalls: [
      "Editing a unit file and forgetting systemctl daemon-reload.",
      "Reaching for kill -9 first, which can leave temp files and locks behind.",
    ],
    check: [
      { q: "Why send SIGTERM before SIGKILL?", a: "SIGTERM lets the program finish work and clean up, while SIGKILL stops it instantly with no cleanup." },
      { q: "What does systemctl enable do?", a: "It makes the service start automatically at boot; --now also starts it immediately." },
    ],
  },

  "linux/bash": {
    summary:
      "Bash scripts glue Linux commands together into repeatable tasks. Quoting variables, checking exit codes and using strict mode make scripts fail loudly instead of silently doing damage.",
    visuals: [
      {
        type: "tree",
        title: "Anatomy of a safe script",
        root: "backup.sh",
        children: [
          { label: "Header", children: ["#!/usr/bin/env bash", "set -euo pipefail"] },
          { label: "Variables", children: ["SRC=\"$1\"", "Always quote \"$VAR\"", "${2:-default} fallbacks"] },
          { label: "Functions", children: ["log() and die() helpers", "One job per function"] },
          { label: "Control flow", children: ["if [[ -d $dir ]]", "case for options", "for f in *.log"] },
          { label: "Exit codes", children: ["0 means success", "Non-zero means failure", "$? holds the last code"] },
        ],
      },
    ],
    keyPoints: [
      "set -euo pipefail stops on errors, unset variables and failed pipeline stages.",
      "Quote every variable expansion so spaces in file names do not break commands.",
      "Every command returns an exit code; 0 is success and anything else is failure.",
      "Use functions and clear names so a script still reads well months later.",
    ],
    terms: [
      { term: "Shebang", meaning: "First line naming the interpreter, like #!/usr/bin/env bash." },
      { term: "Exit code", meaning: "Number a command returns; 0 means it succeeded." },
      { term: "$1, $2", meaning: "Positional arguments passed to the script." },
      { term: "pipefail", meaning: "Makes a pipeline fail if any command in it fails." },
      { term: "case", meaning: "Matches a value against several patterns, like a switch." },
    ],
    example: {
      lang: "bash",
      code: "#!/usr/bin/env bash\nset -euo pipefail\n\nSRC=\"${1:?usage: backup.sh SRC [DEST]}\"\nDEST=\"${2:-/backups}\"\n\nlog() { echo \"[$(date +%T)] $*\"; }\n\n[[ -d \"$SRC\" ]] || { log \"No such dir: $SRC\"; exit 1; }\nmkdir -p \"$DEST\"\nfile=\"$DEST/$(basename \"$SRC\")-$(date +%F).tar.gz\"\ntar -czf \"$file\" \"$SRC\"\nlog \"Saved $file\"",
      caption: "A small backup script with strict mode and argument checks.",
    },
    pitfalls: [
      "Unquoted $file breaks on names with spaces and can delete the wrong things.",
      "Piping into another command hides the first command's failure without pipefail.",
    ],
    check: [
      { q: "What does set -u do?", a: "It makes the script exit when it uses a variable that was never set." },
      { q: "How do you check whether the last command succeeded?", a: "Check its exit code in $?, or use it directly in an if or with ||." },
    ],
  },

  "linux/networking": {
    summary:
      "A web request travels through DNS to find an IP, TCP to open a connection, TLS to encrypt it and HTTP to ask for data. Knowing each layer tells you which tool to use when something breaks.",
    visuals: [
      {
        type: "layers",
        title: "TCP/IP model (top to bottom)",
        layers: [
          { label: "Application", detail: "HTTP, DNS, SSH. Debug with curl, dig, ssh -v." },
          { label: "Transport", detail: "TCP or UDP with port numbers like 22, 80, 443." },
          { label: "Internet", detail: "IP addresses, subnets like 10.0.1.0/24, and routing." },
          { label: "Link", detail: "Ethernet or Wi-Fi frames on the local network." },
        ],
      },
      {
        type: "sequence",
        title: "What curl https://api.example.com does",
        actors: ["curl", "DNS resolver", "Server"],
        messages: [
          { from: 0, to: 1, label: "Where is api.example.com?" },
          { from: 1, to: 0, label: "A record: 203.0.113.10" },
          { from: 0, to: 2, label: "TCP SYN to port 443" },
          { from: 2, to: 0, label: "SYN-ACK, connection open" },
          { from: 0, to: 2, label: "TLS handshake" },
          { from: 0, to: 2, label: "GET /health HTTP/1.1" },
          { from: 2, to: 0, label: "200 OK with body" },
        ],
      },
    ],
    keyPoints: [
      "Debug layer by layer: name resolves, port is open, service answers, response is right.",
      "dig shows DNS answers; curl -v shows the TCP, TLS and HTTP exchange.",
      "ss -tlnp lists listening TCP ports and which process owns each one.",
      "SSH keys beat passwords; ~/.ssh/config saves hosts, users and key paths.",
    ],
    terms: [
      { term: "Port", meaning: "A number that identifies a service on a host, like 443 for HTTPS." },
      { term: "Subnet", meaning: "A block of IP addresses, written like 10.0.1.0/24." },
      { term: "DNS", meaning: "The system that turns names into IP addresses." },
      { term: "TLS", meaning: "Encryption layer that makes HTTP into HTTPS." },
      { term: "ss", meaning: "Shows open sockets and listening ports on a Linux host." },
    ],
    example: {
      lang: "bash",
      code: "dig +short api.example.com\ncurl -v https://api.example.com/health\nss -tlnp | grep 8000\nssh-keygen -t ed25519 -C \"me@laptop\"\nssh-copy-id deploy@203.0.113.10\nssh -v deploy@203.0.113.10",
      caption: "Resolve, request, check listeners and set up key-based SSH.",
    },
    pitfalls: [
      "App bound to 127.0.0.1 is unreachable from other machines; bind 0.0.0.0 when needed.",
      "Private key readable by others makes SSH refuse it; use chmod 600.",
    ],
    check: [
      { q: "curl says 'Could not resolve host'. Which layer failed?", a: "DNS failed, so check the name with dig before looking at the server." },
      { q: "How do you confirm your app is listening on port 8000?", a: "Run ss -tlnp and look for :8000 with your process name." },
      { q: "How many addresses does a /24 subnet contain?", a: "256 addresses, from .0 to .255, with a few reserved." },
    ],
  },

  "python/py-core": {
    summary:
      "Python's built-in types and data structures cover most automation work. Knowing when to use a list, dict or set, and writing small functions, turns long shell scripts into readable tools.",
    visuals: [
      {
        type: "tree",
        title: "Built-in collections",
        root: "Python collections",
        children: [
          { label: "list [ ]", children: ["Ordered, changeable", "Duplicates allowed", "Server names to loop over"] },
          { label: "dict { k: v }", children: ["Key to value lookup", "Fast access by key", "Config or JSON data"] },
          { label: "set { }", children: ["Unique items only", "Fast membership test", "Find missing hosts"] },
          { label: "tuple ( )", children: ["Ordered, unchangeable", "Fixed records", "Return multiple values"] },
        ],
      },
    ],
    keyPoints: [
      "Pick the structure by the question: order matters, look up by key, or uniqueness.",
      "Comprehensions build lists and dicts in one readable line from existing data.",
      "Small functions with clear names and default arguments make scripts reusable.",
      "*args and **kwargs collect extra positional and keyword arguments.",
    ],
    terms: [
      { term: "Comprehension", meaning: "Compact syntax to build a collection from a loop and condition." },
      { term: "f-string", meaning: "String with {expressions} filled in, like f\"{host}:{port}\"." },
      { term: "Mutable", meaning: "Can be changed after creation, like lists and dicts." },
      { term: "**kwargs", meaning: "Collects extra keyword arguments into a dict." },
    ],
    example: {
      lang: "python",
      code: "servers = [\n    {\"name\": \"web1\", \"cpu\": 82, \"env\": \"prod\"},\n    {\"name\": \"web2\", \"cpu\": 35, \"env\": \"prod\"},\n    {\"name\": \"dev1\", \"cpu\": 91, \"env\": \"dev\"},\n]\n\ndef busy(items, limit=80, env=None):\n    return [s[\"name\"] for s in items\n            if s[\"cpu\"] > limit and (env is None or s[\"env\"] == env)]\n\nprint(busy(servers))              # ['web1', 'dev1']\nprint(busy(servers, env=\"prod\"))  # ['web1']\nby_name = {s[\"name\"]: s[\"cpu\"] for s in servers}\nprint(by_name.get(\"web3\", \"unknown\"))",
      caption: "Lists of dicts, a comprehension and default arguments.",
    },
    pitfalls: [
      "Using a mutable default like def f(x=[]); the same list is shared between calls.",
      "Indexing a dict with d[key] when the key may be missing; use d.get(key).",
    ],
    check: [
      { q: "Which structure finds whether a host is in a big group fastest?", a: "A set, because membership checks are close to constant time." },
      { q: "What does [x * 2 for x in nums if x > 0] return?", a: "A new list with every positive number from nums doubled." },
    ],
  },

  "python/py-env": {
    summary:
      "Modules and packages organise Python code into importable files and folders. A virtual environment gives each project its own Python packages, so projects never fight over versions.",
    visuals: [
      {
        type: "layers",
        title: "Where your imports come from",
        layers: [
          { label: "Your project code", detail: "main.py imports from your own package folder." },
          { label: "Virtual environment .venv", detail: "Project-only packages installed by pip." },
          { label: "Standard library", detail: "Modules shipped with Python, like json and pathlib." },
          { label: "Python interpreter", detail: "The python binary the venv was created from." },
        ],
      },
    ],
    keyPoints: [
      "A module is one .py file; a package is a folder of modules you import together.",
      "Create one venv per project and activate it before installing anything.",
      "Pin versions in requirements.txt so every machine installs the same packages.",
      "Never commit the .venv folder; commit requirements.txt instead.",
    ],
    terms: [
      { term: "Module", meaning: "A single .py file you can import." },
      { term: "Package", meaning: "A folder of modules, imported by its name." },
      { term: "venv", meaning: "An isolated folder with its own Python packages." },
      { term: "pip", meaning: "Python's package installer." },
      { term: "requirements.txt", meaning: "List of pinned packages a project needs." },
    ],
    example: {
      lang: "bash",
      code: "python3 -m venv .venv\nsource .venv/bin/activate\npip install requests==2.32.3 pyyaml\npip freeze > requirements.txt\necho \".venv/\" >> .gitignore\n# later, on another machine\npip install -r requirements.txt\npython -m mytool.cli --help",
      caption: "Create, use and reproduce a virtual environment.",
    },
    pitfalls: [
      "Installing packages with sudo pip into the system Python.",
      "Forgetting to activate the venv, so pip installs somewhere else.",
    ],
    check: [
      { q: "Why use a venv per project?", a: "Each project gets its own package versions without affecting others or the system." },
      { q: "How does a teammate install the same dependencies?", a: "They create a venv and run pip install -r requirements.txt." },
    ],
  },

  "python/py-files": {
    summary:
      "Most automation tools read a config file, accept command-line flags and write results. Python's json, PyYAML and argparse cover all three with very little code.",
    visuals: [
      {
        type: "layers",
        title: "Config precedence (top wins)",
        layers: [
          { label: "CLI flags", detail: "--env prod overrides everything below." },
          { label: "Environment variables", detail: "Handy in containers and CI." },
          { label: "Config file", detail: "config.yaml checked into the repo." },
          { label: "Defaults in code", detail: "Safe values used when nothing else is set." },
        ],
      },
    ],
    keyPoints: [
      "Open files with a with block so they always close, even on errors.",
      "Use yaml.safe_load, never yaml.load, for untrusted YAML.",
      "argparse gives you --help, types and required flags for free.",
      "Let CLI flags override file values so one config serves many runs.",
    ],
    terms: [
      { term: "with open", meaning: "Context manager that closes the file automatically." },
      { term: "JSON", meaning: "Text data format; json.load and json.dump read and write it." },
      { term: "YAML", meaning: "Human-friendly config format, read with PyYAML." },
      { term: "argparse", meaning: "Standard library module for command-line arguments." },
    ],
    example: {
      lang: "python",
      code: "import argparse, json, yaml\n\nparser = argparse.ArgumentParser(description=\"Deploy helper\")\nparser.add_argument(\"--config\", default=\"config.yaml\")\nparser.add_argument(\"--env\", choices=[\"dev\", \"prod\"])\nparser.add_argument(\"--dry-run\", action=\"store_true\")\nargs = parser.parse_args()\n\nwith open(args.config) as f:\n    cfg = yaml.safe_load(f) or {}\nif args.env:\n    cfg[\"env\"] = args.env\ncfg[\"dry_run\"] = args.dry_run\nprint(json.dumps(cfg, indent=2))",
      caption: "Load YAML config, apply CLI overrides, print as JSON.",
    },
    pitfalls: [
      "Using yaml.load on untrusted input, which can run arbitrary code.",
      "Opening files relative to the current directory instead of the script's location.",
    ],
    check: [
      { q: "Why use a with block to open files?", a: "It closes the file automatically, even if an exception is raised." },
      { q: "Which should win: a config file value or a CLI flag?", a: "The CLI flag, because it is the most specific, deliberate choice for that run." },
    ],
  },

  "python/py-os": {
    summary:
      "pathlib handles file paths cleanly and subprocess runs system commands from Python. Passing arguments as a list and checking return codes keeps automation safe and predictable.",
    visuals: [
      {
        type: "compare",
        title: "Running a command",
        columns: [
          { title: "List args (safe)", points: ["run([\"du\", \"-sh\", path])", "No shell involved", "Spaces and symbols are safe", "Use by default"] },
          { title: "shell=True (risky)", points: ["run(f\"du -sh {path}\", shell=True)", "Shell parses the string", "Input can inject commands", "Only for trusted fixed strings"] },
        ],
      },
    ],
    keyPoints: [
      "pathlib joins paths with / and works on Linux, macOS and Windows.",
      "check=True raises an error when a command fails instead of continuing silently.",
      "capture_output=True and text=True give you stdout and stderr as strings.",
      "Never build shell strings from user input; pass a list of arguments.",
    ],
    terms: [
      { term: "pathlib.Path", meaning: "Object-oriented file paths with handy methods." },
      { term: "subprocess.run", meaning: "Runs a command and waits for it to finish." },
      { term: "Return code", meaning: "Exit status of the command; 0 means success." },
      { term: "Command injection", meaning: "Untrusted input executed as extra shell commands." },
    ],
    example: {
      lang: "python",
      code: "import subprocess, time\nfrom pathlib import Path\n\nlog_dir = Path(\"/var/log/myapp\")\ncutoff = time.time() - 7 * 86400\nfor f in log_dir.glob(\"*.log.gz\"):\n    if f.stat().st_mtime < cutoff:\n        print(\"Deleting\", f)\n        f.unlink()\n\nresult = subprocess.run([\"df\", \"-h\", str(log_dir)],\n                        capture_output=True, text=True, check=True)\nprint(result.stdout)",
      caption: "Delete week-old compressed logs, then report disk usage.",
    },
    pitfalls: [
      "Ignoring the return code, so a failed command looks like success.",
      "Using shell=True with an f-string that contains a user-supplied file name.",
    ],
    check: [
      { q: "What does check=True do in subprocess.run?", a: "It raises CalledProcessError if the command exits with a non-zero code." },
      { q: "Why pass arguments as a list?", a: "No shell parses them, so special characters cannot inject extra commands." },
    ],
  },

  "python/py-http": {
    summary:
      "The requests library makes calling REST APIs simple. Real automation also needs timeouts, auth headers, status checks, retries with backoff and pagination.",
    visuals: [
      {
        type: "sequence",
        title: "A robust API client",
        actors: ["Script", "API"],
        messages: [
          { from: 0, to: 1, label: "GET /repos?page=1 with token" },
          { from: 1, to: 0, label: "429 Too Many Requests" },
          { from: 0, to: 1, label: "Retry after 2 second backoff" },
          { from: 1, to: 0, label: "200 OK, items and next link" },
          { from: 0, to: 1, label: "GET /repos?page=2" },
          { from: 1, to: 0, label: "200 OK, no next link" },
        ],
      },
    ],
    keyPoints: [
      "Always set a timeout; without one, requests can wait forever.",
      "Call raise_for_status so 4xx and 5xx responses become exceptions.",
      "Retry only on temporary errors like 429 and 503, with growing delays.",
      "Keep following the next page until the API says there are no more.",
    ],
    terms: [
      { term: "REST API", meaning: "HTTP interface using URLs and methods like GET and POST." },
      { term: "Status code", meaning: "Number showing the result, like 200, 404 or 500." },
      { term: "Bearer token", meaning: "Auth credential sent in the Authorization header." },
      { term: "Backoff", meaning: "Waiting longer between each retry attempt." },
      { term: "Pagination", meaning: "Splitting large results across several requests." },
    ],
    example: {
      lang: "python",
      code: "import os, requests\nfrom requests.adapters import HTTPAdapter\nfrom urllib3.util.retry import Retry\n\ns = requests.Session()\ns.headers[\"Authorization\"] = f\"Bearer {os.environ['GITHUB_TOKEN']}\"\nretry = Retry(total=5, backoff_factor=1, status_forcelist=[429, 502, 503])\ns.mount(\"https://\", HTTPAdapter(max_retries=retry))\n\nurl = \"https://api.github.com/user/repos?per_page=100\"\nwhile url:\n    r = s.get(url, timeout=10)\n    r.raise_for_status()\n    print([repo[\"name\"] for repo in r.json()])\n    url = r.links.get(\"next\", {}).get(\"url\")",
      caption: "Auth, retries with backoff, timeouts and Link-header pagination.",
    },
    pitfalls: [
      "No timeout, so one hung connection freezes the whole job.",
      "Retrying non-idempotent POST requests and creating duplicates.",
    ],
    check: [
      { q: "Why should you retry 503 but not 400?", a: "503 is usually temporary; 400 means the request itself is wrong and will fail again." },
      { q: "What does raise_for_status do?", a: "It raises an HTTPError if the response status is 4xx or 5xx." },
    ],
  },

  "python/py-test": {
    summary:
      "Logging shows what your automation did, specific exceptions explain what went wrong, and pytest proves it works before it touches real servers. Mocks let you test code that calls commands or APIs.",
    visuals: [
      {
        type: "cycle",
        title: "The test loop",
        steps: [
          { label: "Write a test", detail: "Describe expected behaviour with plain assert." },
          { label: "Run pytest", detail: "See it fail for the right reason." },
          { label: "Write the code", detail: "Smallest change that makes the test pass." },
          { label: "Run again", detail: "All tests green, including old ones." },
          { label: "Refactor safely", detail: "Tests catch anything you break." },
        ],
      },
    ],
    keyPoints: [
      "Use logging levels: DEBUG for detail, INFO for progress, WARNING and ERROR for problems.",
      "Catch specific exceptions, not bare except, so real bugs are not hidden.",
      "Fixtures provide reusable setup; parametrize runs one test with many inputs.",
      "Mock subprocess and HTTP calls so tests are fast and never touch real systems.",
    ],
    terms: [
      { term: "Log level", meaning: "Severity of a message, from DEBUG to CRITICAL." },
      { term: "Fixture", meaning: "Reusable setup that pytest passes into tests." },
      { term: "parametrize", meaning: "Runs one test function with several sets of inputs." },
      { term: "Mock", meaning: "A fake object that replaces a real dependency in tests." },
      { term: "monkeypatch", meaning: "pytest fixture for temporarily replacing attributes." },
    ],
    example: {
      lang: "python",
      code: "import subprocess, pytest\n\ndef disk_usage(path):\n    out = subprocess.run([\"du\", \"-s\", path], capture_output=True, text=True, check=True)\n    return int(out.stdout.split()[0])\n\n@pytest.mark.parametrize(\"stdout,expected\", [(\"42\\t/tmp\", 42), (\"0\\t/x\", 0)])\ndef test_disk_usage(monkeypatch, stdout, expected):\n    fake = subprocess.CompletedProcess([], 0, stdout=stdout)\n    monkeypatch.setattr(subprocess, \"run\", lambda *a, **k: fake)\n    assert disk_usage(\"/tmp\") == expected",
      caption: "Parametrized test with subprocess.run mocked out.",
    },
    pitfalls: [
      "Using print instead of logging, so there are no levels or timestamps.",
      "A bare except: that swallows KeyboardInterrupt and real bugs alike.",
    ],
    check: [
      { q: "Why mock subprocess.run in tests?", a: "Tests stay fast and repeatable and never run real system commands." },
      { q: "What does pytest.mark.parametrize do?", a: "It runs the same test once for each set of inputs you list." },
    ],
  },

  "python/py-web": {
    summary:
      "FastAPI builds web APIs from plain Python functions with type hints. Pydantic models validate requests automatically, and this small service is what you will containerise and deploy later.",
    visuals: [
      {
        type: "sequence",
        title: "POST /items in FastAPI",
        actors: ["Client", "FastAPI", "Pydantic", "Route function"],
        messages: [
          { from: 0, to: 1, label: "POST /items with JSON body" },
          { from: 1, to: 2, label: "Validate body against Item model" },
          { from: 2, to: 1, label: "Valid Item, or errors" },
          { from: 1, to: 0, label: "422 with details if invalid" },
          { from: 1, to: 3, label: "Call create_item(item)" },
          { from: 3, to: 1, label: "Return dict" },
          { from: 1, to: 0, label: "201 Created with JSON" },
        ],
      },
    ],
    keyPoints: [
      "Type hints on parameters drive validation and the automatic /docs page.",
      "A /health endpoint lets load balancers and Kubernetes check the app.",
      "Read settings from environment variables so one image runs in every environment.",
      "TestClient calls endpoints in tests without starting a real server.",
    ],
    terms: [
      { term: "FastAPI", meaning: "Python web framework built on type hints." },
      { term: "Pydantic model", meaning: "Class that validates and parses data by type." },
      { term: "Route", meaning: "A URL path and method mapped to a function." },
      { term: "uvicorn", meaning: "ASGI server that runs FastAPI apps." },
      { term: "422", meaning: "Status FastAPI returns when request validation fails." },
    ],
    example: {
      lang: "python",
      code: "import os\nfrom fastapi import FastAPI\nfrom fastapi.testclient import TestClient\nfrom pydantic import BaseModel\n\napp = FastAPI()\nclass Item(BaseModel):\n    name: str\n    qty: int = 1\n\n@app.get(\"/health\")\ndef health(): return {\"status\": \"ok\", \"env\": os.getenv(\"APP_ENV\", \"dev\")}\n@app.post(\"/items\", status_code=201)\ndef create_item(item: Item): return item\nassert TestClient(app).post(\"/items\", json={\"name\": \"bolt\"}).json()[\"qty\"] == 1",
      caption: "A health check, a validated POST route and a quick test.",
    },
    pitfalls: [
      "Hard-coding database URLs instead of reading them from environment variables.",
      "A health check that always returns ok even when the app is broken.",
    ],
    check: [
      { q: "What happens if a client sends qty as \"abc\"?", a: "Pydantic validation fails and FastAPI returns 422 with error details." },
      { q: "Why read settings from environment variables?", a: "The same code and image can run in dev and prod with different config." },
    ],
  },

  "git/git-basics": {
    summary:
      "Git records snapshots of your code as commits. Branches let you work without breaking main, and pull requests let teammates review changes before they merge.",
    visuals: [
      {
        type: "flow",
        title: "Feature branch to merged PR",
        steps: [
          { label: "Branch from main", detail: "git switch -c feature/health-check" },
          { label: "Stage and commit", detail: "Small commits with clear messages." },
          { label: "Push branch", detail: "git push -u origin feature/health-check" },
          { label: "Open pull request", detail: "Describe what changed and how to test it." },
          { label: "Review and fix", detail: "Address comments with new commits." },
          { label: "Merge to main", detail: "CI passes, reviewer approves, branch is deleted." },
        ],
      },
    ],
    keyPoints: [
      "git add stages changes; git commit saves the staged snapshot with a message.",
      "Write messages in the imperative: 'Add health check endpoint'.",
      "Conflicts happen when both sides change the same lines; edit, add, commit.",
      "Keep branches short-lived and pull main often to avoid big conflicts.",
    ],
    terms: [
      { term: "Commit", meaning: "A saved snapshot of the project with a message and author." },
      { term: "Branch", meaning: "A movable pointer to a line of commits." },
      { term: "Staging area", meaning: "Where you choose which changes go into the next commit." },
      { term: "Pull request", meaning: "A GitHub request to review and merge one branch into another." },
      { term: "Merge conflict", meaning: "Both branches changed the same lines and Git needs you to choose." },
    ],
    example: {
      lang: "bash",
      code: "git switch main && git pull\ngit switch -c feature/health-check\ngit add app/health.py\ngit commit -m \"Add /health endpoint\"\ngit push -u origin feature/health-check\ngh pr create --fill",
      caption: "From fresh main to an open pull request.",
    },
    pitfalls: [
      "Committing secrets or .env files; add them to .gitignore before the first commit.",
      "Huge PRs that mix many changes are slow and hard to review.",
    ],
    check: [
      { q: "What is the difference between git add and git commit?", a: "git add stages changes; git commit records the staged changes as a snapshot." },
      { q: "Why work on a branch instead of main?", a: "It keeps main stable and lets others review your changes before they land." },
    ],
  },

  "containers/docker-basics": {
    summary:
      "An image is a read-only template built from layers; a container is a running instance with its own writable layer. Volumes keep data after containers are removed, and user networks let containers find each other by name.",
    analogy: "An image is a recipe card; a container is a dish cooked from it.",
    visuals: [
      {
        type: "layers",
        title: "A running container",
        layers: [
          { label: "Writable container layer", detail: "Changes made at runtime; lost when the container is removed." },
          { label: "COPY . /app", detail: "Your code; changes most often, so it goes last." },
          { label: "RUN pip install", detail: "Dependencies; cached while requirements.txt is unchanged." },
          { label: "COPY requirements.txt", detail: "Copied alone so the install layer stays cached." },
          { label: "Base image python:3.12-slim", detail: "OS files and the Python runtime." },
        ],
      },
      {
        type: "compare",
        title: "Keeping data",
        columns: [
          { title: "Named volume", points: ["Managed by Docker", "-v pgdata:/var/lib/postgresql/data", "Best for databases", "Survives container removal"] },
          { title: "Bind mount", points: ["A host folder you choose", "-v $(pwd):/app", "Best for live code in dev", "Depends on host paths"] },
        ],
      },
    ],
    keyPoints: [
      "Each Dockerfile instruction makes a layer; unchanged layers are reused from cache.",
      "Copy dependency files before source code so code edits do not reinstall packages.",
      "docker logs and docker exec are the first tools for debugging a container.",
      "Containers on the same user-defined network reach each other by container name.",
    ],
    terms: [
      { term: "Image", meaning: "Read-only, layered template used to start containers." },
      { term: "Container", meaning: "An isolated running process started from an image." },
      { term: "Volume", meaning: "Docker-managed storage that outlives containers." },
      { term: "Bind mount", meaning: "A host directory mounted into a container." },
      { term: "User network", meaning: "A Docker network with built-in DNS by container name." },
    ],
    example: {
      lang: "bash",
      code: "docker network create appnet\ndocker run -d --name db --network appnet -v pgdata:/var/lib/postgresql/data -e POSTGRES_PASSWORD=dev postgres:16\ndocker run -d --name api --network appnet -p 8000:8000 myapi:dev\ndocker logs -f api\ndocker exec -it api sh\ndocker stop api && docker rm api",
      caption: "The api container reaches the database at host name db.",
    },
    pitfalls: [
      "Writing important data inside the container layer, then losing it on docker rm.",
      "Using the default bridge network and wondering why names do not resolve.",
    ],
    check: [
      { q: "Why copy requirements.txt before the rest of the code?", a: "So the dependency install layer stays cached when only your code changes." },
      { q: "What happens to a named volume when you remove the container?", a: "The volume and its data remain until you delete the volume itself." },
    ],
  },

  "containers/dockerfile": {
    summary:
      "A Dockerfile is the recipe for your image. Ordering layers for caching, using a slim base, a multi-stage build and a non-root user gives a small, fast and safer image.",
    visuals: [
      {
        type: "compare",
        title: "Single-stage vs multi-stage",
        columns: [
          { title: "Single-stage", points: ["Build tools stay in image", "Often several hundred MB", "More packages to patch", "Simple to write"] },
          { title: "Multi-stage", points: ["Build in one stage", "Copy only results to final", "Small slim runtime image", "Smaller attack surface"] },
        ],
      },
    ],
    keyPoints: [
      "Copy requirements.txt and install before copying code to keep the install layer cached.",
      "python:3.12-slim is far smaller than the full image and works for most apps.",
      "Run as a non-root user so a compromised app has fewer powers.",
      "A .dockerignore keeps .git, .venv and secrets out of the build context.",
    ],
    terms: [
      { term: "Base image", meaning: "The starting image named in FROM." },
      { term: "Build context", meaning: "Files sent to Docker when building, filtered by .dockerignore." },
      { term: "Multi-stage build", meaning: "Several FROM stages; only the last becomes the image." },
      { term: "Non-root user", meaning: "Running the process as an unprivileged user via USER." },
    ],
    example: {
      lang: "dockerfile",
      code: "FROM python:3.12-slim AS build\nWORKDIR /app\nRUN python -m venv /venv\nCOPY requirements.txt .\nRUN /venv/bin/pip install --no-cache-dir -r requirements.txt\n\nFROM python:3.12-slim\nRUN useradd --create-home app\nCOPY --from=build /venv /venv\nWORKDIR /app\nCOPY --chown=app . .\nUSER app\nENV PATH=\"/venv/bin:$PATH\"\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
      caption: "Build a venv in stage one, copy it into a clean slim image.",
    },
    pitfalls: [
      "COPY . . before installing dependencies, so every code change reinstalls everything.",
      "No .dockerignore, which copies .env files and secrets into the image.",
    ],
    check: [
      { q: "Why does layer order matter?", a: "Docker reuses cached layers until one changes, so rarely changing steps should come first." },
      { q: "What ends up in the final image of a multi-stage build?", a: "Only the last stage plus whatever you copy into it with COPY --from." },
    ],
  },

  "containers/compose": {
    summary:
      "Docker Compose describes a multi-container app in one YAML file. One command starts the API, database and cache together, wired up with networking, volumes and health checks.",
    visuals: [
      {
        type: "tree",
        title: "compose.yaml",
        root: "compose.yaml",
        children: [
          { label: "services: api", children: ["build: .", "ports 8000:8000", "env DATABASE_URL", "depends_on db healthy"] },
          { label: "services: db", children: ["image postgres:16", "volume pgdata", "healthcheck pg_isready"] },
          { label: "services: cache", children: ["image redis:7"] },
          { label: "volumes", children: ["pgdata"] },
        ],
      },
    ],
    keyPoints: [
      "Services reach each other by service name, like db:5432, on the default network.",
      "Named volumes keep database data across docker compose down and up.",
      "depends_on with condition: service_healthy waits for the database to be ready.",
      "docker compose logs -f api and exec are the main debugging tools.",
    ],
    terms: [
      { term: "Service", meaning: "One container definition in a compose file." },
      { term: "depends_on", meaning: "Controls start order between services." },
      { term: "Health check", meaning: "Command Docker runs to decide if a container is healthy." },
      { term: "docker compose up", meaning: "Builds, creates and starts all services." },
    ],
    example: {
      lang: "yaml",
      code: "services:\n  api:\n    build: .\n    ports: [\"8000:8000\"]\n    environment:\n      DATABASE_URL: postgresql://app:dev@db:5432/app\n    depends_on: { db: { condition: service_healthy } }\n  db:\n    image: postgres:16\n    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: dev }\n    volumes: [\"pgdata:/var/lib/postgresql/data\"]\n    healthcheck: { test: [\"CMD\", \"pg_isready\", \"-U\", \"app\"], interval: 5s }\n  cache: { image: \"redis:7\" }\nvolumes: { pgdata: {} }",
      caption: "API, Postgres and Redis started with docker compose up.",
    },
    pitfalls: [
      "Using localhost to reach the database from the api container; use the service name.",
      "Running docker compose down -v and wiping the database volume by accident.",
    ],
    check: [
      { q: "How does the api container find Postgres?", a: "By the service name db, which Compose resolves on its network." },
      { q: "Why add a health check to the database?", a: "So dependent services start only once the database accepts connections." },
    ],
  },

  "containers/registry": {
    summary:
      "A registry stores and serves images so servers and clusters can pull them. Clear tags such as a version and the git SHA tell you exactly which code is running.",
    visuals: [
      {
        type: "sequence",
        title: "Pushing to Amazon ECR",
        actors: ["You", "AWS CLI", "Docker", "ECR"],
        messages: [
          { from: 0, to: 1, label: "aws ecr get-login-password" },
          { from: 1, to: 0, label: "Temporary token (12 hours)" },
          { from: 0, to: 2, label: "docker login with token" },
          { from: 2, to: 3, label: "Authenticate" },
          { from: 0, to: 2, label: "docker tag and docker push" },
          { from: 2, to: 3, label: "Upload missing layers" },
          { from: 3, to: 2, label: "Image digest sha256:..." },
        ],
      },
    ],
    keyPoints: [
      "An image name is registry/repository:tag, like ghcr.io/acme/api:1.4.0.",
      "Tag each build with the git SHA, and releases with a semantic version.",
      "Tags can be moved; the sha256 digest always points to the same image.",
      "ECR uses short-lived tokens from the AWS CLI instead of a password.",
    ],
    terms: [
      { term: "Registry", meaning: "A server that stores and distributes container images." },
      { term: "Tag", meaning: "A human-friendly, movable label for an image version." },
      { term: "Digest", meaning: "Content hash that uniquely and permanently identifies an image." },
      { term: "GHCR", meaning: "GitHub Container Registry at ghcr.io." },
      { term: "ECR", meaning: "Amazon Elastic Container Registry, AWS's private registry." },
    ],
    example: {
      lang: "bash",
      code: "SHA=$(git rev-parse --short HEAD)\nREPO=123456789012.dkr.ecr.us-east-1.amazonaws.com/api\naws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com\ndocker build -t api:$SHA .\ndocker tag api:$SHA $REPO:$SHA\ndocker tag api:$SHA $REPO:1.4.0\ndocker push --all-tags $REPO",
      caption: "Build once, tag with SHA and version, push both.",
    },
    pitfalls: [
      "Deploying :latest, which makes it unclear what is running and hard to roll back.",
      "Pushing to a repository that does not exist yet; ECR repos must be created first.",
    ],
    check: [
      { q: "Why tag images with the git SHA?", a: "It links every running image to the exact commit that built it." },
      { q: "What is the difference between a tag and a digest?", a: "A tag can be repointed to another image; a digest always identifies the same content." },
    ],
  },

  "cicd/cicd-concepts": {
    summary:
      "CI merges and tests every change automatically; CD keeps the result ready to release or ships it straight to production. A good pipeline fails fast on cheap checks and promotes one build through each environment.",
    visuals: [
      {
        type: "compare",
        title: "CI vs delivery vs deployment",
        columns: [
          { title: "Continuous integration", points: ["Merge small changes often", "Lint and test every push", "Broken builds fixed fast"] },
          { title: "Continuous delivery", points: ["Every build is releasable", "Auto deploy to staging", "Human approves production"] },
          { title: "Continuous deployment", points: ["No manual gate", "Passing builds go to prod", "Needs strong tests and monitoring"] },
        ],
      },
      {
        type: "flow",
        title: "Pipeline stages",
        steps: [
          { label: "Lint", detail: "Seconds; catches style and obvious errors." },
          { label: "Test", detail: "Unit and integration tests with pytest." },
          { label: "Build", detail: "One image, tagged with the git SHA." },
          { label: "Scan", detail: "Check image and dependencies for known CVEs." },
          { label: "Deploy staging", detail: "Automatic, followed by smoke tests." },
          { label: "Promote to prod", detail: "Same image, after approval or checks." },
        ],
      },
    ],
    keyPoints: [
      "Order stages from fastest and cheapest to slowest so failures show up early.",
      "Build the artifact once and promote that same image through every environment.",
      "Trunk-based development uses short branches merged to main daily.",
      "GitFlow adds develop, release and hotfix branches for scheduled releases.",
    ],
    terms: [
      { term: "Pipeline", meaning: "Automated sequence of stages run on each change." },
      { term: "Promotion", meaning: "Moving the same build from one environment to the next." },
      { term: "Trunk-based", meaning: "Everyone integrates into main through small, short-lived branches." },
      { term: "GitFlow", meaning: "Branching model with long-lived develop and release branches." },
      { term: "Feature flag", meaning: "A switch that hides unfinished code in production." },
    ],
    pitfalls: [
      "Rebuilding the image for each environment, so prod runs something never tested.",
      "Long-lived branches that turn every merge into a painful conflict.",
    ],
    check: [
      { q: "What separates continuous delivery from continuous deployment?", a: "Delivery keeps a manual approval before production; deployment releases automatically when checks pass." },
      { q: "Why put lint before integration tests?", a: "Lint is fast and cheap, so obvious errors fail the pipeline in seconds." },
    ],
  },

  "cicd/gha-python": {
    summary:
      "A GitHub Actions workflow is a YAML file that runs jobs on GitHub's machines when events happen. For the Python service it lints and tests every push and PR, then builds and pushes the image only on main.",
    visuals: [
      {
        type: "sequence",
        title: "A push to main",
        actors: ["Developer", "GitHub", "Runner", "Registry"],
        messages: [
          { from: 0, to: 1, label: "git push to main" },
          { from: 1, to: 2, label: "Queue job from ci.yml" },
          { from: 2, to: 1, label: "Checkout: fetch the code" },
          { from: 2, to: 1, label: "Logs: lint and pytest pass" },
          { from: 2, to: 3, label: "Push image tagged with SHA" },
          { from: 2, to: 1, label: "Report status: success" },
          { from: 1, to: 0, label: "Green check on commit" },
        ],
      },
    ],
    keyPoints: [
      "Workflows live in .github/workflows and trigger on events like push and pull_request.",
      "setup-python with cache: pip reuses downloaded packages between runs.",
      "Use an if condition so image pushes happen only on main, not on PRs.",
      "Store registry credentials as secrets, never in the workflow file.",
    ],
    terms: [
      { term: "Workflow", meaning: "A YAML file describing automated jobs and their triggers." },
      { term: "Job", meaning: "A set of steps that runs on one runner." },
      { term: "Runner", meaning: "The machine that executes a job." },
      { term: "Status badge", meaning: "README image showing whether the workflow is passing." },
    ],
    example: {
      lang: "yaml",
      code: "name: ci\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: { python-version: \"3.12\", cache: pip }\n      - run: pip install -r requirements.txt ruff pytest\n      - run: ruff check . && pytest -q\n      - if: github.ref == 'refs/heads/main' && github.event_name == 'push'\n        run: echo \"build and push image here\"",
      caption: ".github/workflows/ci.yml: test everywhere, publish only from main.",
    },
    pitfalls: [
      "Pushing images from pull request runs, which publishes untested or untrusted code.",
      "Not pinning the Python version, so CI silently changes when defaults move.",
    ],
    check: [
      { q: "How do you stop image pushes on pull requests?", a: "Add an if condition checking the event is a push to refs/heads/main." },
      { q: "What does cache: pip in setup-python save?", a: "It restores pip's download cache so dependencies install faster on later runs." },
    ],
  },

  "cicd/jenkins": {
    summary:
      "Jenkins is a self-hosted automation server still common in older and enterprise setups. A declarative Jenkinsfile in the repo defines stages, agents, credentials and post-build actions.",
    visuals: [
      {
        type: "compare",
        title: "Jenkins vs GitHub Actions",
        columns: [
          { title: "Jenkins", points: ["You host and patch it", "Huge plugin ecosystem", "Groovy Jenkinsfile", "Works with any Git host"] },
          { title: "GitHub Actions", points: ["Hosted by GitHub", "Marketplace actions", "YAML workflows", "Tightly integrated with PRs"] },
        ],
      },
    ],
    keyPoints: [
      "The controller schedules jobs; agents are the machines that run them.",
      "A declarative pipeline has pipeline, agent, stages and steps blocks.",
      "post { always / failure } runs clean-up or notifications after stages.",
      "Store secrets in Jenkins credentials and bind them with withCredentials.",
    ],
    terms: [
      { term: "Controller", meaning: "The main Jenkins server that schedules and stores jobs." },
      { term: "Agent", meaning: "A machine or container that executes pipeline steps." },
      { term: "Jenkinsfile", meaning: "Pipeline definition stored in the repository." },
      { term: "Plugin", meaning: "Add-on that extends Jenkins with new features." },
      { term: "Credentials", meaning: "Jenkins store for secrets used by pipelines." },
    ],
    example: {
      lang: "groovy",
      code: "pipeline {\n  agent { docker { image 'python:3.12-slim' } }\n  stages {\n    stage('Test') {\n      steps { sh 'pip install -r requirements.txt && pytest -q' }\n    }\n    stage('Build') {\n      when { branch 'main' }\n      steps { sh 'docker build -t api:${GIT_COMMIT} .' }\n    }\n  }\n  post {\n    failure { echo 'Build failed, notify the team' }\n  }\n}",
      caption: "A declarative Jenkinsfile with test, build and a failure hook.",
    },
    pitfalls: [
      "Running builds on the controller itself instead of on agents.",
      "Letting plugins go unpatched; old plugins are a common attack path.",
    ],
    check: [
      { q: "What is the difference between the controller and an agent?", a: "The controller schedules and manages jobs; agents actually run the build steps." },
      { q: "What does a post failure block do?", a: "It runs its steps only when the pipeline fails, often to send a notification." },
    ],
  },

  "aws/aws-iam": {
    summary:
      "IAM decides who can do what in an AWS account. Everything is denied by default, and policies grant only the actions and resources a person or service needs.",
    analogy: "IAM is the building's security desk that hands out badges with specific door access.",
    visuals: [
      {
        type: "tree",
        title: "IAM building blocks",
        root: "AWS account",
        children: [
          { label: "Root user", children: ["Full control", "Enable MFA", "Lock away, never use daily"] },
          { label: "Users and groups", children: ["People who sign in", "Attach policies to groups"] },
          { label: "Roles", children: ["Assumed by services or people", "Temporary credentials", "EC2, Lambda, CI pipelines"] },
          { label: "Policies", children: ["JSON documents", "Effect, Action, Resource", "Explicit deny always wins"] },
        ],
      },
    ],
    keyPoints: [
      "Protect the root user with MFA and do not create root access keys.",
      "Grant permissions to groups and roles, not to individual users one by one.",
      "Roles give short-lived credentials, so prefer them over long-lived access keys.",
      "Start with the smallest policy that works and widen only when something fails.",
    ],
    terms: [
      { term: "Principal", meaning: "The user, role or service making a request." },
      { term: "Policy", meaning: "JSON that allows or denies actions on resources." },
      { term: "Role", meaning: "An identity with permissions that others assume temporarily." },
      { term: "MFA", meaning: "A second factor, like an authenticator app, at sign-in." },
      { term: "Least privilege", meaning: "Granting only the permissions actually needed." },
    ],
    example: {
      lang: "json",
      code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Action\": [\"s3:GetObject\", \"s3:PutObject\"],\n    \"Resource\": \"arn:aws:s3:::acme-uploads/*\"\n  }]\n}",
      caption: "Read and write objects in one bucket, nothing else.",
    },
    pitfalls: [
      "Attaching AdministratorAccess to get unblocked and never removing it.",
      "Committing access keys to Git; bots find and abuse them within minutes.",
    ],
    check: [
      { q: "If one policy allows an action and another explicitly denies it, what happens?", a: "The request is denied, because an explicit deny always overrides an allow." },
      { q: "Why prefer roles over access keys for an EC2 app?", a: "Roles provide temporary credentials that rotate automatically, so there is no secret to leak." },
    ],
  },

  "aws/aws-compute": {
    summary:
      "A VPC is your private network in AWS. Public subnets face the internet through a load balancer, while servers sit in private subnets reachable only through tightly scoped security groups.",
    visuals: [
      {
        type: "layers",
        title: "Request path into a VPC",
        layers: [
          { label: "Internet", detail: "Users send HTTPS requests to the load balancer's DNS name." },
          { label: "Internet gateway", detail: "Connects the VPC to the internet; public routes point here." },
          { label: "ALB in public subnets", detail: "Spread over two availability zones; SG allows 443." },
          { label: "EC2 in private subnets", detail: "SG allows app port only from the ALB's security group." },
          { label: "NAT gateway", detail: "Lets private instances reach out for updates, not in." },
        ],
      },
    ],
    keyPoints: [
      "A subnet is public only if its route table sends 0.0.0.0/0 to an internet gateway.",
      "Security groups are stateful allow lists; reply traffic is allowed automatically.",
      "Reference the ALB's security group instead of opening app ports to 0.0.0.0/0.",
      "Use key pairs or Session Manager for access, and never open SSH to the world.",
    ],
    terms: [
      { term: "VPC", meaning: "An isolated virtual network for your AWS resources." },
      { term: "Subnet", meaning: "An IP range inside a VPC, tied to one availability zone." },
      { term: "Route table", meaning: "Rules that decide where subnet traffic is sent." },
      { term: "Security group", meaning: "A stateful firewall attached to instances and load balancers." },
      { term: "ALB", meaning: "Application Load Balancer that spreads HTTP traffic across targets." },
    ],
    example: {
      lang: "bash",
      code: "aws ec2 authorize-security-group-ingress --group-id sg-app123 --protocol tcp --port 8000 --source-group sg-alb456\naws ec2 run-instances --image-id ami-0abc123 --instance-type t3.micro --subnet-id subnet-priv1 --security-group-ids sg-app123 --key-name deploy-key\naws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/api/abc",
      caption: "Allow traffic only from the ALB, launch privately, check target health.",
    },
    pitfalls: [
      "Opening port 22 to 0.0.0.0/0 to make SSH work.",
      "Placing the ALB in only one availability zone, which AWS does not allow anyway.",
    ],
    check: [
      { q: "What makes a subnet public?", a: "Its route table has a default route 0.0.0.0/0 to an internet gateway." },
      { q: "How can private instances download updates?", a: "Through a NAT gateway, which allows outbound connections but blocks inbound ones." },
    ],
  },

  "aws/aws-data": {
    summary:
      "S3 stores files, RDS runs a managed relational database and Lambda runs code on demand. Together they cover storage, data and event-driven tasks without managing servers.",
    visuals: [
      {
        type: "compare",
        title: "Three managed services",
        columns: [
          { title: "S3", points: ["Object storage for files", "Pay per GB stored", "Lifecycle rules move or expire data", "Public access blocked by default"] },
          { title: "RDS", points: ["Managed Postgres or MySQL", "Backups and patching handled", "Runs in private subnets", "Pay per hour while running"] },
          { title: "Lambda", points: ["Runs a function per event", "Up to 15 minutes per run", "Pay per request and duration", "No servers to manage"] },
        ],
      },
      {
        type: "flow",
        title: "Event-driven thumbnail job",
        steps: [
          { label: "Upload to S3", detail: "User uploads photo to uploads/ prefix." },
          { label: "S3 event fires", detail: "ObjectCreated notification sent to Lambda." },
          { label: "Lambda runs", detail: "Python handler reads bucket and key from event." },
          { label: "Write result", detail: "Saves thumbnail to a different prefix or bucket." },
        ],
      },
    ],
    keyPoints: [
      "Bucket names are globally unique; keep Block Public Access on unless you truly need it.",
      "Put RDS in private subnets and allow port 5432 only from the app's security group.",
      "Store database passwords in Secrets Manager, not in code or environment files in Git.",
      "A Lambda handler receives event and context; keep it small and fast.",
    ],
    terms: [
      { term: "Bucket", meaning: "A top-level container for objects in S3." },
      { term: "Lifecycle rule", meaning: "Policy that moves or deletes objects after a set age." },
      { term: "RDS", meaning: "Relational Database Service, managed databases on AWS." },
      { term: "Handler", meaning: "The function Lambda calls with each event." },
      { term: "Event notification", meaning: "An S3 message sent when objects are created or deleted." },
    ],
    example: {
      lang: "python",
      code: "import boto3\n\ns3 = boto3.client(\"s3\")\n\ndef handler(event, context):\n    for record in event[\"Records\"]:\n        bucket = record[\"s3\"][\"bucket\"][\"name\"]\n        key = record[\"s3\"][\"object\"][\"key\"]\n        size = record[\"s3\"][\"object\"][\"size\"]\n        print(f\"New object {key} ({size} bytes) in {bucket}\")\n    return {\"processed\": len(event[\"Records\"])}",
      caption: "A Lambda handler triggered by S3 ObjectCreated events.",
    },
    pitfalls: [
      "Lambda writing back to the same bucket prefix that triggers it, causing an endless loop.",
      "Making the RDS instance publicly accessible to connect from a laptop.",
    ],
    check: [
      { q: "Why should a triggered Lambda write to a different prefix?", a: "Writing to the triggering prefix fires the event again and creates a recursive loop." },
      { q: "Who should be allowed to reach the RDS port?", a: "Only the application's security group, not the internet." },
    ],
  },

  "aws/boto3": {
    summary:
      "boto3 is the AWS SDK for Python. It lets you script audits and clean-ups, such as finding untagged instances, with real error handling and a dry-run mode before anything is deleted.",
    visuals: [
      {
        type: "flow",
        title: "A safe clean-up script",
        steps: [
          { label: "Create session", detail: "Pick profile and region; credentials come from the default chain." },
          { label: "Create client", detail: "boto3 client for ec2, s3 or another service." },
          { label: "Paginate results", detail: "Paginators fetch every page, not just the first." },
          { label: "Filter candidates", detail: "Untagged, stopped or idle resources." },
          { label: "Report in dry run", detail: "Print what would change; default to no action." },
          { label: "Act with --apply", detail: "Only then stop or delete, with logging." },
        ],
      },
    ],
    keyPoints: [
      "Credentials come from env vars, ~/.aws files or an attached IAM role, in that order.",
      "List APIs return pages; use get_paginator so large accounts are fully covered.",
      "Catch botocore ClientError and read the error code to handle failures clearly.",
      "Make dry run the default so a mistake only prints, never deletes.",
    ],
    terms: [
      { term: "Session", meaning: "Holds credentials, profile and region for clients." },
      { term: "Client", meaning: "Low-level object that maps directly to AWS API calls." },
      { term: "Paginator", meaning: "Helper that loops through all pages of a list API." },
      { term: "ClientError", meaning: "Exception raised when an AWS API call fails." },
      { term: "Dry run", meaning: "A mode that reports actions without performing them." },
    ],
    example: {
      lang: "python",
      code: "import boto3\nfrom botocore.exceptions import ClientError\nsession = boto3.Session(profile_name=\"dev\", region_name=\"us-east-1\")\nec2 = session.client(\"ec2\")\npages = ec2.get_paginator(\"describe_instances\").paginate()\nfor page in pages:\n    for res in page[\"Reservations\"]:\n        for inst in res[\"Instances\"]:\n            tags = {t[\"Key\"]: t[\"Value\"] for t in inst.get(\"Tags\", [])}\n            if \"owner\" not in tags:\n                print(\"DRY RUN would stop\", inst[\"InstanceId\"])\ntry:\n    ec2.describe_instances(InstanceIds=[\"i-doesnotexist\"])\nexcept ClientError as e:\n    print(\"Error:\", e.response[\"Error\"][\"Code\"])",
      caption: "Find instances missing an owner tag, safely.",
    },
    pitfalls: [
      "Reading only the first page of results and missing most resources.",
      "Hard-coding access keys in the script instead of using profiles or roles.",
    ],
    check: [
      { q: "Why use a paginator?", a: "List calls return limited pages, and the paginator fetches all of them for you." },
      { q: "Why make dry run the default?", a: "So running the script by accident only reports, and deleting requires an explicit flag." },
    ],
  },

  "iac/tf-basics": {
    summary:
      "Terraform describes infrastructure in HCL files and makes the real cloud match them. You always preview changes with plan before apply changes anything.",
    visuals: [
      {
        type: "cycle",
        title: "The Terraform loop",
        steps: [
          { label: "Write HCL", detail: "Provider, resources, variables and outputs." },
          { label: "terraform init", detail: "Downloads providers and sets up the backend." },
          { label: "terraform plan", detail: "Shows what will be created, changed or destroyed." },
          { label: "terraform apply", detail: "Makes the changes and updates state." },
          { label: "Change the code", detail: "Edit config and plan again." },
        ],
      },
    ],
    keyPoints: [
      "A provider plugin talks to an API; resources are the things it creates.",
      "Read every plan, especially lines marked destroy or must be replaced.",
      "Data sources look up existing things, like the latest Ubuntu AMI.",
      "terraform destroy removes everything the configuration created.",
    ],
    terms: [
      { term: "Provider", meaning: "Plugin that manages one platform, like AWS." },
      { term: "Resource", meaning: "A piece of infrastructure Terraform creates and manages." },
      { term: "Data source", meaning: "Read-only lookup of existing infrastructure." },
      { term: "Plan", meaning: "Preview of the changes Terraform would make." },
      { term: "Output", meaning: "A value printed after apply, like an IP address." },
    ],
    example: {
      lang: "hcl",
      code: "provider \"aws\" { region = \"us-east-1\" }\n\nresource \"aws_vpc\" \"main\" {\n  cidr_block = \"10.0.0.0/16\"\n  tags       = { Name = \"demo\" }\n}\n\nresource \"aws_subnet\" \"public\" {\n  vpc_id     = aws_vpc.main.id\n  cidr_block = \"10.0.1.0/24\"\n}\n\noutput \"vpc_id\" { value = aws_vpc.main.id }",
      caption: "A VPC and subnet; run init, plan and apply.",
    },
    pitfalls: [
      "Changing resources by hand in the console, causing drift from the code.",
      "Running apply without reading the plan and replacing a database by accident.",
    ],
    check: [
      { q: "What does terraform plan do?", a: "It compares code with state and real infrastructure and lists the changes it would make." },
      { q: "How does the subnet know which VPC to use?", a: "It references aws_vpc.main.id, which also tells Terraform to create the VPC first." },
    ],
  },

  "iac/tf-modules": {
    summary:
      "Terraform modules package infrastructure you can reuse, and variables make them configurable per environment. Remote state in S3 with locking lets a team share one source of truth without overwriting each other.",
    visuals: [
      {
        type: "tree",
        title: "Repo layout",
        root: "infra/",
        children: [
          { label: "modules/vpc", children: ["main.tf", "variables.tf", "outputs.tf"] },
          { label: "envs/dev", children: ["main.tf calls modules", "dev.tfvars", "backend: dev state key"] },
          { label: "envs/prod", children: ["main.tf calls modules", "prod.tfvars", "backend: prod state key"] },
        ],
      },
      {
        type: "sequence",
        title: "terraform apply with remote state",
        actors: ["Terraform", "Lock", "S3 state", "AWS API"],
        messages: [
          { from: 0, to: 1, label: "Acquire lock" },
          { from: 0, to: 2, label: "Read current state" },
          { from: 0, to: 3, label: "Refresh and compare" },
          { from: 0, to: 3, label: "Create or update resources" },
          { from: 0, to: 2, label: "Write new state" },
          { from: 0, to: 1, label: "Release lock" },
        ],
      },
    ],
    keyPoints: [
      "Variables are inputs, outputs are return values, and a module is a folder of .tf files.",
      "Pin module versions so a registry update cannot change your infrastructure silently.",
      "Store state in S3 with versioning and locking so two applies cannot collide.",
      "Give dev and prod separate state files so a dev mistake cannot touch prod.",
    ],
    terms: [
      { term: "Module", meaning: "A reusable folder of Terraform configuration." },
      { term: "Variable", meaning: "An input value passed into a module or root config." },
      { term: "tfvars", meaning: "A file that sets variable values for one environment." },
      { term: "State", meaning: "Terraform's record mapping config to real resources." },
      { term: "State lock", meaning: "Prevents two runs from changing the same state at once." },
    ],
    example: {
      lang: "hcl",
      code: "terraform {\n  backend \"s3\" {\n    bucket       = \"acme-tf-state\"\n    key          = \"prod/network.tfstate\"\n    region       = \"us-east-1\"\n    use_lockfile = true\n  }\n}\n\nmodule \"vpc\" {\n  source   = \"../../modules/vpc\"\n  cidr     = var.vpc_cidr\n  az_count = 2\n}",
      caption: "Prod uses the shared VPC module with S3 state and locking.",
    },
    pitfalls: [
      "Keeping terraform.tfstate on a laptop or in Git, where it leaks secrets and drifts.",
      "Using variables inside the backend block; backend settings cannot use them.",
    ],
    check: [
      { q: "What does state locking prevent?", a: "Two people or pipelines applying at the same time and corrupting the state." },
      { q: "Why pin a registry module version?", a: "So upgrades happen deliberately after review instead of on the next init." },
    ],
  },

  "iac/ansible": {
    summary:
      "Ansible configures servers over SSH using YAML playbooks, with no agent to install. Tasks are idempotent, so running a playbook twice changes nothing the second time.",
    visuals: [
      {
        type: "tree",
        title: "An Ansible project",
        root: "ansible/",
        children: [
          { label: "inventory.ini", children: ["[web] host groups", "SSH user and addresses"] },
          { label: "site.yml playbook", children: ["hosts: web", "roles: [nginx, app]"] },
          { label: "roles/nginx", children: ["tasks/main.yml", "handlers/main.yml", "templates/site.conf.j2", "defaults/main.yml"] },
        ],
      },
    ],
    keyPoints: [
      "The inventory lists hosts and groups; playbooks map groups to tasks.",
      "Modules like apt, copy and service describe desired state, not shell steps.",
      "Handlers run only when notified by a changed task, like restarting nginx.",
      "A second run reporting changed=0 proves the playbook is idempotent.",
    ],
    terms: [
      { term: "Inventory", meaning: "List of managed hosts, organised into groups." },
      { term: "Playbook", meaning: "YAML file mapping hosts to ordered tasks." },
      { term: "Module", meaning: "Built-in unit of work, like apt or template." },
      { term: "Handler", meaning: "Task that runs only when another task notifies it." },
      { term: "Role", meaning: "Reusable bundle of tasks, handlers, templates and defaults." },
      { term: "Idempotent", meaning: "Running again produces the same result with no extra changes." },
    ],
    example: {
      lang: "yaml",
      code: "- hosts: web\n  become: true\n  vars: { server_name: example.com }\n  tasks:\n    - name: Install nginx\n      apt: { name: nginx, state: present, update_cache: true }\n    - name: Configure site\n      template: { src: site.conf.j2, dest: /etc/nginx/sites-enabled/default }\n      notify: Reload nginx\n  handlers:\n    - name: Reload nginx\n      service: { name: nginx, state: reloaded }",
      caption: "Run with ansible-playbook -i inventory.ini site.yml.",
    },
    pitfalls: [
      "Using shell or command for everything, which breaks idempotency.",
      "Putting passwords in plain YAML instead of Ansible Vault.",
    ],
    check: [
      { q: "When does a handler run?", a: "At the end of the play, only if a task that notifies it reported a change." },
      { q: "How do you check a playbook is idempotent?", a: "Run it twice; the second run should report no changed tasks." },
    ],
  },

  "k8s/k8s-arch": {
    summary:
      "A Kubernetes cluster has a control plane that decides what should run and worker nodes that run it. You describe desired state with kubectl, and controllers keep reality matching it.",
    visuals: [
      {
        type: "tree",
        title: "Cluster components",
        root: "Kubernetes cluster",
        children: [
          { label: "Control plane", children: ["kube-apiserver", "etcd", "kube-scheduler", "kube-controller-manager"] },
          { label: "Worker node", children: ["kubelet", "kube-proxy", "Container runtime (containerd)", "Your Pods"] },
        ],
      },
      {
        type: "sequence",
        title: "kubectl apply a Pod",
        actors: ["kubectl", "API server", "Scheduler", "kubelet"],
        messages: [
          { from: 0, to: 1, label: "Create Pod spec" },
          { from: 1, to: 0, label: "Validated, saved to etcd" },
          { from: 2, to: 1, label: "Watch: unscheduled Pod found" },
          { from: 2, to: 1, label: "Bind Pod to node-1" },
          { from: 3, to: 1, label: "Watch: Pod assigned to me" },
          { from: 3, to: 1, label: "Image pulled, status Running" },
        ],
      },
    ],
    keyPoints: [
      "Everything talks to the API server; etcd stores the cluster's desired and current state.",
      "The scheduler picks a node; the kubelet on that node actually starts containers.",
      "kind runs a whole cluster inside Docker containers, ideal for local practice.",
      "Namespaces group resources; contexts choose which cluster and user kubectl uses.",
    ],
    terms: [
      { term: "Pod", meaning: "The smallest deployable unit: one or more containers sharing network." },
      { term: "Node", meaning: "A machine, virtual or physical, that runs Pods." },
      { term: "etcd", meaning: "Key-value store holding all cluster data." },
      { term: "kubelet", meaning: "Agent on each node that runs and reports on Pods." },
      { term: "Namespace", meaning: "A virtual partition for grouping resources in a cluster." },
      { term: "Context", meaning: "kubectl setting naming a cluster, user and namespace." },
    ],
    example: {
      lang: "bash",
      code: "kind create cluster --name dev\nkubectl config current-context\nkubectl get nodes\nkubectl run web --image=nginx:1.27\nkubectl get pods -o wide\nkubectl describe pod web\nkubectl logs web\nkubectl get pods -n kube-system",
      caption: "Create a local cluster and inspect your first Pod.",
    },
    pitfalls: [
      "Running commands against the wrong cluster; always check the current context.",
      "Treating Pods as permanent; they are replaced, so use Deployments for real apps.",
    ],
    check: [
      { q: "Which component decides where a Pod runs?", a: "The kube-scheduler, which assigns the Pod to a suitable node." },
      { q: "Where does the cluster store its state?", a: "In etcd, accessed only through the API server." },
    ],
  },

  "k8s/k8s-workloads": {
    summary:
      "A Deployment keeps a set number of identical Pods running and rolls out new versions. A Service gives them a stable address, an Ingress routes outside traffic in, and ConfigMaps and Secrets supply settings.",
    visuals: [
      {
        type: "layers",
        title: "How traffic reaches the app",
        layers: [
          { label: "Ingress", detail: "Routes api.example.com to a Service; needs an ingress controller." },
          { label: "Service", detail: "Stable name and IP; selects Pods by label app=api." },
          { label: "Deployment", detail: "Desired replicas and image; manages ReplicaSets for rollouts." },
          { label: "Pods", detail: "FastAPI containers with readiness and liveness probes." },
          { label: "ConfigMap and Secret", detail: "Environment variables and files injected into Pods." },
        ],
      },
    ],
    keyPoints: [
      "Labels connect everything: the Service selector must match the Pod template labels.",
      "Readiness probes keep a Pod out of the Service until it can handle traffic.",
      "Liveness probes restart a container that is stuck or deadlocked.",
      "Secrets are only base64 encoded by default; restrict access and enable encryption.",
    ],
    terms: [
      { term: "Deployment", meaning: "Manages replicated Pods and rolling updates." },
      { term: "Service", meaning: "Stable network endpoint that load balances to matching Pods." },
      { term: "Ingress", meaning: "HTTP routing rules from outside the cluster to Services." },
      { term: "ConfigMap", meaning: "Non-secret configuration stored as key-value pairs." },
      { term: "Secret", meaning: "Object for sensitive values like passwords and tokens." },
      { term: "Probe", meaning: "A health check kubelet runs against a container." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: api }\nspec:\n  replicas: 3\n  selector: { matchLabels: { app: api } }\n  template:\n    metadata: { labels: { app: api } }\n    spec:\n      containers:\n        - name: api\n          image: ghcr.io/acme/api:1.4.0\n          ports: [{ containerPort: 8000 }]\n          envFrom: [{ configMapRef: { name: api-config } }, { secretRef: { name: api-secrets } }]\n          readinessProbe: { httpGet: { path: /health, port: 8000 } }",
      caption: "Three replicas with config, secrets and a readiness probe.",
    },
    pitfalls: [
      "Service selector labels that do not match the Pods, so it has no endpoints.",
      "A liveness probe that checks the database, restarting every Pod when the DB blips.",
    ],
    check: [
      { q: "What is the difference between readiness and liveness probes?", a: "Readiness controls whether a Pod receives traffic; liveness restarts a container that is unhealthy." },
      { q: "Why does an Ingress do nothing in a fresh cluster?", a: "It needs an ingress controller, such as ingress-nginx, installed to act on the rules." },
    ],
  },

  "k8s/helm": {
    summary:
      "Helm packages Kubernetes manifests into a chart with templates and values. One chart installs the same app into dev and prod with different settings, and every upgrade can be rolled back.",
    visuals: [
      {
        type: "tree",
        title: "Chart structure",
        root: "charts/api",
        children: [
          { label: "Chart.yaml", children: ["Name, version, appVersion"] },
          { label: "values.yaml", children: ["Default settings", "image.tag, replicas"] },
          { label: "values-prod.yaml", children: ["Overrides for production"] },
          { label: "templates/", children: ["deployment.yaml", "service.yaml", "ingress.yaml", "_helpers.tpl"] },
        ],
      },
      {
        type: "flow",
        title: "Release lifecycle",
        steps: [
          { label: "helm install", detail: "Creates release revision 1." },
          { label: "helm upgrade", detail: "New values or image tag, revision 2." },
          { label: "helm history", detail: "Lists every revision and its status." },
          { label: "helm rollback", detail: "Returns to a previous good revision." },
        ],
      },
    ],
    keyPoints: [
      "Templates use {{ .Values.x }} so one chart serves many environments.",
      "Pass environment overrides with -f values-prod.yaml or --set.",
      "helm template renders manifests locally so you can review them first.",
      "Each upgrade is a numbered revision you can roll back to.",
    ],
    terms: [
      { term: "Chart", meaning: "A package of templated Kubernetes manifests." },
      { term: "Values", meaning: "Settings injected into chart templates." },
      { term: "Release", meaning: "One installed instance of a chart in a cluster." },
      { term: "Revision", meaning: "A numbered version of a release after each change." },
    ],
    example: {
      lang: "bash",
      code: "helm create api\nhelm template api ./api -f api/values-prod.yaml | less\nhelm install api ./api -n prod --create-namespace -f api/values-prod.yaml\nhelm upgrade api ./api -n prod -f api/values-prod.yaml --set image.tag=1.4.1\nhelm history api -n prod\nhelm rollback api 1 -n prod",
      caption: "Render, install, upgrade and roll back a release.",
    },
    pitfalls: [
      "Editing resources with kubectl after Helm installs them, causing drift.",
      "Committing secrets in values.yaml in plain text.",
    ],
    check: [
      { q: "How do you deploy different replica counts to dev and prod?", a: "Keep one chart and pass a different values file for each environment." },
      { q: "How do you undo a bad upgrade?", a: "Run helm rollback with the release name and a previous revision number." },
    ],
  },

  "k8s/k8s-python": {
    summary:
      "The official Kubernetes Python client talks to the same API as kubectl. It lets you script checks and clean-ups, like removing failed Pods, with real logic and a dry-run mode.",
    visuals: [
      {
        type: "flow",
        title: "Clean up failed Pods",
        steps: [
          { label: "Load kubeconfig", detail: "Same credentials and context kubectl uses." },
          { label: "Create CoreV1Api", detail: "Client for Pods, Services and namespaces." },
          { label: "List Pods", detail: "All namespaces, filtered by status.phase=Failed." },
          { label: "Report in dry run", detail: "Print namespace and name of each match." },
          { label: "Delete with flag", detail: "Only when --apply is passed." },
        ],
      },
    ],
    keyPoints: [
      "config.load_kube_config uses your local kubeconfig; load_incluster_config works inside Pods.",
      "Field and label selectors filter on the server, so less data comes back.",
      "Inside a cluster, the script's ServiceAccount needs RBAC permissions for its actions.",
      "Default to dry run, exactly as with AWS clean-up scripts.",
    ],
    terms: [
      { term: "kubeconfig", meaning: "File holding clusters, users and contexts for API access." },
      { term: "CoreV1Api", meaning: "Client class for core resources like Pods." },
      { term: "Field selector", meaning: "Server-side filter on fields like status.phase." },
      { term: "ServiceAccount", meaning: "Identity used by Pods to call the Kubernetes API." },
      { term: "RBAC", meaning: "Role-based rules controlling what an identity may do." },
    ],
    example: {
      lang: "python",
      code: "import sys\nfrom kubernetes import client, config\n\nconfig.load_kube_config()\nv1 = client.CoreV1Api()\napply = \"--apply\" in sys.argv\npods = v1.list_pod_for_all_namespaces(field_selector=\"status.phase=Failed\")\nfor pod in pods.items:\n    ns, name = pod.metadata.namespace, pod.metadata.name\n    print(\"DELETE\" if apply else \"DRY RUN\", ns, name)\n    if apply:\n        v1.delete_namespaced_pod(name, ns)",
      caption: "Find failed Pods everywhere; delete only with --apply.",
    },
    pitfalls: [
      "Running against the wrong context because kubeconfig points at production.",
      "Granting cluster-admin to a script that only needs to list and delete Pods.",
    ],
    check: [
      { q: "Which config loader do you use inside a Pod?", a: "config.load_incluster_config, which uses the Pod's ServiceAccount token." },
      { q: "Why use a field selector instead of filtering in Python?", a: "The API server filters first, so less data is sent and processed." },
    ],
  },

  "observability/prometheus": {
    summary:
      "Prometheus pulls numeric metrics from your services on a schedule and stores them as time series. You query them with PromQL and define alert rules that fire when something goes wrong.",
    visuals: [
      {
        type: "sequence",
        title: "Scrape to alert",
        actors: ["FastAPI app", "Prometheus", "Alertmanager", "On-call"],
        messages: [
          { from: 1, to: 0, label: "GET /metrics every 15s" },
          { from: 0, to: 1, label: "Counters and histograms" },
          { from: 1, to: 2, label: "Rule fires: HighErrorRate" },
          { from: 2, to: 3, label: "Grouped notification sent" },
          { from: 3, to: 2, label: "Silence while fixing" },
        ],
      },
    ],
    keyPoints: [
      "Prometheus pulls metrics; your app just exposes them on /metrics.",
      "Counters only go up; use rate() to turn them into per-second values.",
      "Histograms record durations in buckets so you can compute percentiles.",
      "Alert rules need a for: duration so brief blips do not page anyone.",
    ],
    terms: [
      { term: "Scrape", meaning: "Prometheus fetching metrics from a target over HTTP." },
      { term: "Counter", meaning: "Metric that only increases, like total requests." },
      { term: "Histogram", meaning: "Metric that counts observations in value buckets." },
      { term: "PromQL", meaning: "Prometheus query language for time series." },
      { term: "Alertmanager", meaning: "Routes, groups and silences alerts from Prometheus." },
    ],
    example: {
      lang: "python",
      code: "from prometheus_client import Counter, Histogram, start_http_server\nimport random, time\n\nREQUESTS = Counter(\"http_requests_total\", \"Requests\", [\"status\"])\nLATENCY = Histogram(\"http_request_duration_seconds\", \"Latency\")\n\nstart_http_server(8001)  # serves /metrics\nwhile True:\n    with LATENCY.time():\n        time.sleep(random.random() / 10)\n    REQUESTS.labels(status=\"200\").inc()\n# PromQL: sum(rate(http_requests_total{status=~\"5..\"}[5m]))",
      caption: "Expose a counter and histogram, then query the error rate.",
    },
    pitfalls: [
      "Labels with unbounded values like user ID, which explode memory use.",
      "Graphing a raw counter instead of rate(), which only shows a rising line.",
    ],
    check: [
      { q: "Why wrap counters in rate()?", a: "Counters only grow, so rate() turns them into a useful per-second value." },
      { q: "Does Prometheus push or pull metrics?", a: "It pulls them by scraping each target's /metrics endpoint on an interval." },
    ],
  },

  "observability/grafana": {
    summary:
      "Grafana turns Prometheus queries into dashboards. A good service dashboard answers four questions at a glance: how much traffic, how many errors, how slow, and how full.",
    visuals: [
      {
        type: "tree",
        title: "A golden-signals dashboard",
        root: "API dashboard",
        children: [
          { label: "Traffic", children: ["Requests per second", "Split by route"] },
          { label: "Errors", children: ["5xx rate", "Error percentage"] },
          { label: "Latency", children: ["p50", "p95", "p99"] },
          { label: "Saturation", children: ["CPU vs limit", "Memory vs limit", "Pod restarts"] },
        ],
      },
    ],
    keyPoints: [
      "Add Prometheus as a data source, then build panels from PromQL queries.",
      "Show latency as percentiles; averages hide the slow requests users notice.",
      "Dashboard variables like $namespace let one dashboard serve every environment.",
      "Export dashboards as JSON and keep them in Git with the rest of the code.",
    ],
    terms: [
      { term: "Data source", meaning: "A backend Grafana queries, like Prometheus or Loki." },
      { term: "Panel", meaning: "One chart or stat on a dashboard." },
      { term: "Percentile", meaning: "p95 means 95% of requests were faster than this." },
      { term: "Variable", meaning: "Dropdown value reused in every panel's query." },
      { term: "Saturation", meaning: "How close a resource is to its limit." },
    ],
    example: {
      lang: "promql",
      code: "# p95 latency per route\nhistogram_quantile(0.95,\n  sum by (le, route) (rate(http_request_duration_seconds_bucket{namespace=\"$namespace\"}[5m])))\n\n# error percentage\n100 * sum(rate(http_requests_total{status=~\"5..\"}[5m]))\n    / sum(rate(http_requests_total[5m]))",
      caption: "Two core panel queries using a $namespace variable.",
    },
    pitfalls: [
      "Dashboards with dozens of panels that nobody can read during an incident.",
      "Plotting average latency, which hides a slow tail.",
    ],
    check: [
      { q: "Why show p95 or p99 instead of average latency?", a: "Averages hide slow outliers; percentiles show what the slowest users experience." },
      { q: "How do you keep dashboards reproducible?", a: "Export them as JSON and store them in version control or provision them from files." },
    ],
  },

  "observability/logging": {
    summary:
      "Centralised logging collects logs from every container into one searchable place. Structured JSON logs with request IDs let you filter by service, level or a single user request.",
    visuals: [
      {
        type: "flow",
        title: "Log pipeline with Loki",
        steps: [
          { label: "App logs JSON", detail: "One JSON object per line to stdout." },
          { label: "Runtime stores logs", detail: "Container runtime writes stdout to node log files." },
          { label: "Agent ships logs", detail: "Grafana Alloy or Promtail adds labels and sends them." },
          { label: "Loki stores", detail: "Indexes labels only; compresses the log lines." },
          { label: "Grafana queries", detail: "LogQL filters by labels, then parses JSON fields." },
        ],
      },
    ],
    keyPoints: [
      "Log to stdout and let the platform collect logs, rather than writing files in the container.",
      "Structured JSON makes fields like level and request_id searchable.",
      "Loki labels should be low-cardinality, like app and namespace, not user IDs.",
      "Pass a request ID through every service to follow one request end to end.",
    ],
    terms: [
      { term: "Structured log", meaning: "A log line with named fields, usually JSON." },
      { term: "Loki", meaning: "Grafana's log store that indexes labels, not full text." },
      { term: "LogQL", meaning: "Loki's query language for filtering and parsing logs." },
      { term: "Request ID", meaning: "A unique ID attached to every log line for one request." },
      { term: "Cardinality", meaning: "How many distinct values a label can have." },
    ],
    example: {
      lang: "python",
      code: "import json, logging, sys, uuid\n\nclass JsonFormatter(logging.Formatter):\n    def format(self, record):\n        return json.dumps({\"level\": record.levelname, \"msg\": record.getMessage(),\n                           \"request_id\": getattr(record, \"request_id\", None)})\n\nhandler = logging.StreamHandler(sys.stdout)\nhandler.setFormatter(JsonFormatter())\nlog = logging.getLogger(\"api\")\nlog.addHandler(handler)\nlog.setLevel(logging.INFO)\nlog.info(\"order created\", extra={\"request_id\": str(uuid.uuid4())})\n# LogQL: {app=\"api\"} | json | level=\"ERROR\"",
      caption: "JSON logs to stdout, then filter errors in Grafana.",
    },
    pitfalls: [
      "Using request_id as a Loki label, which explodes the index; keep it in the log line.",
      "Logging passwords, tokens or personal data that then lives in the log store.",
    ],
    check: [
      { q: "Why log JSON instead of plain text?", a: "Fields can be parsed and filtered reliably, such as all ERROR lines for one request." },
      { q: "What should be a Loki label?", a: "Low-cardinality values like app, namespace or environment." },
    ],
  },

  "capstone/capstone": {
    summary:
      "The capstone ties every module into one repo: a tested FastAPI service, built into an image by GitHub Actions, deployed with Helm to Kubernetes on Terraform-built AWS infrastructure, and watched with Grafana.",
    visuals: [
      {
        type: "flow",
        title: "Build order",
        steps: [
          { label: "FastAPI and tests", detail: "Endpoints, /health and pytest passing locally." },
          { label: "Multi-stage Dockerfile", detail: "Small runtime image, non-root user." },
          { label: "Actions pipeline", detail: "Lint, test, build, push image tagged with SHA." },
          { label: "Terraform infra", detail: "VPC, cluster and registry with remote state." },
          { label: "Helm deploy", detail: "Chart with Deployment, Service, Ingress and probes." },
          { label: "Grafana dashboards", detail: "Request rate, errors, latency and logs." },
          { label: "README diagram", detail: "Explain the architecture and how to run it." },
        ],
      },
      {
        type: "layers",
        title: "Final architecture",
        layers: [
          { label: "GitHub repo and Actions", detail: "Code, CI pipeline and image builds." },
          { label: "Container registry", detail: "Versioned images, tagged by git SHA." },
          { label: "Kubernetes via Helm", detail: "FastAPI Pods behind a Service and Ingress." },
          { label: "AWS via Terraform", detail: "VPC, subnets, cluster and IAM roles." },
          { label: "Prometheus, Loki, Grafana", detail: "Metrics, logs and dashboards across the stack." },
        ],
      },
    ],
    keyPoints: [
      "Get each stage working end to end before polishing any single one.",
      "Everything is code: app, Dockerfile, workflow, Terraform and Helm chart.",
      "A README diagram and clear run steps make the repo easy to walk through.",
      "Destroy cloud resources with terraform destroy when you are done to avoid bills.",
    ],
    terms: [
      { term: "Multi-stage build", meaning: "Dockerfile that builds in one stage and copies results into a slim one." },
      { term: "Helm chart", meaning: "A templated package of Kubernetes manifests." },
      { term: "Golden signals", meaning: "Latency, traffic, errors and saturation." },
      { term: "Infrastructure as Code", meaning: "Managing infrastructure through versioned config files." },
    ],
    example: {
      lang: "dockerfile",
      code: "FROM python:3.12-slim AS build\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --prefix=/install -r requirements.txt\n\nFROM python:3.12-slim\nWORKDIR /app\nCOPY --from=build /install /usr/local\nCOPY app/ app/\nUSER 1000\nEXPOSE 8000\nCMD [\"uvicorn\", \"app.main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]",
      caption: "Multi-stage image for the FastAPI service.",
    },
    pitfalls: [
      "Building everything at once and debugging five broken layers together.",
      "Leaving a cluster and NAT gateway running for weeks and getting a surprise bill.",
    ],
    check: [
      { q: "Why use a multi-stage Dockerfile?", a: "Build tools stay in the first stage, so the final image is smaller and has less attack surface." },
      { q: "What should the README diagram show?", a: "How code flows from a push through CI, the registry and Helm into the cluster, plus monitoring." },
    ],
  },
};

export default explainers;
