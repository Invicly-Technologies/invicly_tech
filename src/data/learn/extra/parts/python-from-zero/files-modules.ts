import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "files-modules/files": {
    plain: [
      "Until now your programs forgot everything when they stopped. Files let a program keep data: notes, logs, settings, results. Reading a file brings text into your program; writing a file saves text for later or for another program.",
      "A path is the address of a file, like data/notes.txt. Windows writes paths with backslashes and macOS and Linux with forward slashes. The pathlib module hides that difference. You build a Path object, and Python writes the right kind of path for whatever computer runs the code.",
      "Opening a file is like borrowing a book: you must give it back. If you forget to close a file, your changes may not be saved yet, and on some systems other programs cannot use it. The with-block closes the file for you as soon as the block ends, even if your code crashes.",
      "Text in a file is stored as bytes. An encoding is the rule that turns bytes into letters. UTF-8 handles every language and emoji, so always say encoding=\"utf-8\". If you skip it, Python uses your computer's default, and the same script may break on a colleague's machine.",
    ],
    deepDive: [
      {
        heading: "Path objects: the parts you will use every day",
        body: "A Path is not the file itself; it is just the address. Creating Path(\"report.txt\") does not touch the disk. Methods like exists(), is_file() and read_text() actually look at the disk.\n\nUseful attributes for p = Path(\"data/2026/sales.csv\"): p.name is sales.csv, p.stem is sales, p.suffix is .csv, and p.parent is data/2026. p.with_suffix(\".json\") gives a new path with a different extension. Join parts with the / operator: Path(\"data\") / \"2026\" / \"sales.csv\".\n\nRelative paths are relative to the current working directory, which is wherever you ran python from, not where your script lives. That is a classic bug: the script works from one folder and fails from another. To find files next to your script, use Path(__file__).resolve().parent as the base. Path.home() gives the user's home folder, and Path.cwd() the current working directory.",
        bullets: ["mkdir(parents=True, exist_ok=True) creates nested folders safely", "unlink(missing_ok=True) deletes a file without failing if it is gone", "resolve() turns a relative path into a full absolute one"],
      },
      {
        heading: "File modes and what really happens when you write",
        body: "open() takes a mode. \"r\" reads (the default) and fails with FileNotFoundError if the file is missing. \"w\" creates the file or empties an existing one immediately, before you write anything. \"a\" appends to the end. \"x\" creates a new file and raises FileExistsError if it already exists, which is a safe way to avoid overwriting. Add \"b\" for binary data like images (\"rb\", \"wb\"), where you get bytes instead of str.\n\nWrites are buffered: Python collects text in memory and sends it to the disk in chunks. The data is only guaranteed to be handed to the OS when the buffer is flushed, which happens when the file is closed. If the program crashes before that, the last writes can be lost.\n\nIn text mode, Python also translates line endings. Reading turns Windows \\r\\n into \\n. Writing turns \\n into the system's line ending. Binary mode never changes bytes.",
        visual: {
          type: "compare",
          title: "Choosing a file mode",
          columns: [
            { title: "\"r\" read", points: ["File must exist", "Starts at the beginning", "Default mode", "FileNotFoundError if missing"] },
            { title: "\"w\" write", points: ["Creates or empties the file", "Erases old content at once", "Use for fresh output", "\"x\" instead to refuse overwriting"] },
            { title: "\"a\" append", points: ["Creates if missing", "Always writes at the end", "Keeps old content", "Ideal for logs"] },
          ],
        },
      },
      {
        heading: "Reading big files without running out of memory",
        body: "read_text() and f.read() load the whole file into one string. That is fine for a config file, but a 5 GB log would need 5 GB of memory. Iterating over the file object instead (for line in f) reads one line at a time, so memory stays small no matter how big the file is.\n\nEach line keeps its newline at the end, so use line.rstrip(\"\\n\") or line.strip() before comparing. f.readlines() looks handy but also loads everything into a list. For binary files, read in fixed-size chunks with f.read(65536) in a loop.\n\nTo count lines, find matches or build totals, streaming line by line is the normal pattern. You can also stream into another file at the same time, as in the explainer's example, so the whole job runs in constant memory.",
        bullets: ["sum(1 for _ in f) counts lines without storing them", "enumerate(f, start=1) gives line numbers for error messages", "Use errors=\"replace\" to read files with a few broken bytes"],
      },
      {
        heading: "Saving safely: write to a temp file, then replace",
        body: "If your program crashes or the power fails while writing data.json with mode \"w\", you can be left with a half-written file, and the old data is already gone. For important files, use a two-step pattern. First write the new content to a temporary file in the same folder, such as data.json.tmp. Then call Path.replace() to swap it into place.\n\nOn the same filesystem, replace is atomic: anyone reading the file sees either the complete old version or the complete new one, never a mix. It also overwrites the target on both Windows and Unix, unlike rename, which fails on Windows if the target exists.\n\nThis matters for your capstone too: an expense tracker that corrupts its own JSON file on a crash loses the user's data.",
        visual: {
          type: "flow",
          title: "Atomic save of data.json",
          steps: [
            { label: "Build new content", detail: "json.dumps(items, indent=2)" },
            { label: "Write data.json.tmp", detail: "Same folder as the real file" },
            { label: "Close the temp file", detail: "Buffers flushed to the OS" },
            { label: "tmp.replace(target)", detail: "Atomic swap on the same disk" },
            { label: "Old or new, never half", detail: "Readers always see a whole file" },
          ],
        },
      },
      {
        heading: "Listing and filtering files in a folder",
        body: "folder.iterdir() yields every entry directly inside a folder, files and subfolders, in no guaranteed order, so wrap it in sorted() if order matters. folder.glob(\"*.txt\") matches names with a pattern: * matches any characters, ? matches one character, and [0-9] matches one digit. folder.rglob(\"*.txt\") searches all subfolders too.\n\nGlob patterns only look at names. To filter by other things, combine with a condition: p.is_file(), p.stat().st_size for size in bytes, or p.stat().st_mtime for the last-modified time as a timestamp. Hidden files that start with a dot are matched by * in pathlib, unlike in many shells.\n\nFor very large trees, os.scandir is faster because it reads file types along with names. Python 3.12 also added Path.walk(), which works like os.walk and returns each folder with its subfolders and files.",
        bullets: ["sorted(Path(\"logs\").glob(\"*.log\")) gives a stable order", "max(files, key=lambda p: p.stat().st_mtime) finds the newest file", "datetime.fromtimestamp(p.stat().st_mtime) shows a readable date"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Anatomy of Path(\"/home/ana/data/sales.csv\")",
        root: "/home/ana/data/sales.csv",
        children: [
          { label: "parent", children: ["/home/ana/data"] },
          { label: "name", children: ["sales.csv"] },
          { label: "stem", children: ["sales"] },
          { label: "suffix", children: [".csv"] },
          { label: "parts", children: ["('/', 'home', 'ana', 'data', 'sales.csv')"] },
        ],
      },
    ],
    examples: [
      {
        title: "A script that works from any folder",
        explanation: "Your script reads settings.txt from the same folder. It works when you run python app.py inside the folder, but fails with FileNotFoundError when run from the parent folder as python tools/app.py. Step 1: realise that \"settings.txt\" is relative to the current working directory, not to the script. Step 2: build a base path from __file__. Step 3: join the file name onto it. Now the script finds its file wherever you run it from.",
        code: {
          lang: "python",
          code: "from pathlib import Path\n\nBASE = Path(__file__).resolve().parent\nsettings = BASE / \"settings.txt\"\n\nprint(\"cwd:   \", Path.cwd())\nprint(\"script:\", BASE)\nfor line in settings.read_text(encoding=\"utf-8\").splitlines():\n    key, _, value = line.partition(\"=\")\n    print(key.strip(), \"->\", value.strip())",
        },
      },
      {
        title: "Saving a to-do list without risking corruption",
        explanation: "A small to-do app saves its list to todo.txt every time you add an item. Step 1: build the new text in memory. Step 2: write it to todo.txt.tmp with the same encoding. Step 3: replace the real file in one atomic step. Step 4: on start, if todo.txt does not exist yet, begin with an empty list instead of crashing. A crash at any moment leaves either the old list or the new one.",
        code: {
          lang: "python",
          code: "from pathlib import Path\n\nTODO = Path(\"todo.txt\")\ndef load() -> list[str]:\n    if not TODO.exists():\n        return []\n    return TODO.read_text(encoding=\"utf-8\").splitlines()\n\ndef save(items: list[str]) -> None:\n    tmp = TODO.with_suffix(\".txt.tmp\")\n    tmp.write_text(\"\\n\".join(items) + \"\\n\", encoding=\"utf-8\")\n    tmp.replace(TODO)\nitems = load()\nitems.append(\"buy milk\")\nsave(items)",
        },
      },
    ],
    cheatSheet: [
      "Path(__file__).resolve().parent is the folder of the running script",
      "p.name, p.stem, p.suffix, p.parent split a path into parts",
      "Mode \"x\" creates a new file and raises FileExistsError instead of overwriting",
      "for line in f streams a file line by line in constant memory",
      "Write to a .tmp file, then tmp.replace(target) for an atomic save",
      "folder.rglob(\"*.py\") searches all subfolders",
      "p.stat().st_size is the size in bytes; st_mtime is the last-modified time",
    ],
    quiz: [
      {
        q: "What happens to an existing file when you open it with mode \"w\"?",
        options: ["New text is added at the end", "Python raises FileExistsError", "It is emptied immediately, before you write anything", "It is opened read-only"],
        answer: 2,
        why: "Mode \"w\" truncates the file as soon as it is opened.",
      },
      {
        q: "Your script opens Path(\"config.txt\") and fails only when run from another folder. Why?",
        options: ["Relative paths are resolved against the current working directory, not the script's folder", "pathlib only works in the home folder", "The file is locked", "You forgot encoding=\"utf-8\""],
        answer: 0,
        why: "Use Path(__file__).resolve().parent to build paths relative to the script.",
      },
      {
        q: "Which is the best way to count lines in a 10 GB log file?",
        options: ["len(p.read_text().splitlines())", "len(f.readlines())", "Read it with read_bytes() and count newlines", "sum(1 for _ in f) inside a with-block"],
        answer: 3,
        why: "Iterating the file object reads one line at a time, so memory use stays small.",
      },
      {
        q: "Why write to a temporary file and then call replace()?",
        options: ["It is faster than writing directly", "A crash never leaves a half-written target file", "It compresses the file", "It is required for UTF-8"],
        answer: 1,
        why: "replace() swaps the complete new file in atomically on the same filesystem.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a script that asks for a line of text and appends it, with the current date, to journal.txt. Run it three times and print the file.",
        hint: "Use mode \"a\" and date.today().isoformat().",
        solution: "from datetime import date\nfrom pathlib import Path\n\nj = Path(\"journal.txt\")\ntext = input(\"Note: \")\nwith j.open(\"a\", encoding=\"utf-8\") as f:\n    f.write(f\"{date.today().isoformat()} {text}\\n\")\nprint(j.read_text(encoding=\"utf-8\"))",
      },
      {
        level: "medium",
        task: "Print the five largest files under a folder (including subfolders), with their sizes in KB, largest first.",
        hint: "rglob(\"*\"), filter with is_file(), sort by stat().st_size.",
        solution: "from pathlib import Path\n\nfolder = Path(\".\")\nfiles = [p for p in folder.rglob(\"*\") if p.is_file()]\nfiles.sort(key=lambda p: p.stat().st_size, reverse=True)\nfor p in files[:5]:\n    print(f\"{p.stat().st_size / 1024:10.1f} KB  {p}\")",
      },
      {
        level: "hard",
        task: "Read a large app.log line by line and write every line containing ERROR to errors.txt, prefixed with its line number. Print how many errors were found. Use constant memory.",
        hint: "Open both files in one with-statement and use enumerate(f, start=1).",
        solution: "from pathlib import Path\n\ncount = 0\nwith Path(\"app.log\").open(encoding=\"utf-8\", errors=\"replace\") as src, \\\n     Path(\"errors.txt\").open(\"w\", encoding=\"utf-8\") as out:\n    for n, line in enumerate(src, start=1):\n        if \"ERROR\" in line:\n            out.write(f\"{n}: {line}\")\n            count += 1\nprint(count, \"errors\")",
      },
    ],
    faq: [
      { q: "Should I use pathlib or os.path?", a: "Use pathlib in new code. It is part of the standard library, works on every OS and is easier to read; os.path still works and you will see it in older code." },
      { q: "Why do I get UnicodeDecodeError when reading a file?", a: "The file's bytes do not match the encoding Python used, often because no encoding was given. Pass encoding=\"utf-8\", or the file's real encoding if you know it, and use errors=\"replace\" only if a few bad characters are acceptable." },
      { q: "Do I need to call close() if I use with?", a: "No. The with-block closes the file automatically when it ends, even if an exception happens inside it." },
      { q: "How do I delete a folder with files in it?", a: "Path.rmdir() only removes empty folders. Use shutil.rmtree(path) for a folder with contents, carefully, because it deletes everything inside without asking." },
    ],
  },

  "files-modules/exceptions": {
    plain: [
      "When Python hits a problem it cannot handle, like dividing by zero or opening a file that does not exist, it stops and raises an exception. If nobody catches it, the program ends and prints a traceback: a report of where it happened and why.",
      "Errors are normal. Users type letters where you expect numbers. Networks drop. Files go missing. Good programs expect these problems and react sensibly: show a helpful message, try again, or use a default value. That is what try and except are for.",
      "But catching errors has a cost. If you catch everything and ignore it, real bugs hide and your program quietly does the wrong thing. The rule is: catch only the errors you expect and know how to handle. Let the surprising ones crash loudly so you can fix them.",
      "Your own functions can raise errors too. If someone calls withdraw(-50), it is better to raise ValueError(\"amount must be positive\") right away than to return a strange balance. A clear error at the right place saves hours of debugging later.",
    ],
    deepDive: [
      {
        heading: "Reading a traceback like a pro",
        body: "A traceback starts with \"Traceback (most recent call last):\" and lists the chain of function calls, oldest first. Each entry shows the file, the line number, the function name and the line of code. The last line is the most important: the exception type and its message, such as KeyError: 'email'.\n\nRead from the bottom up. First the error type and message tell you what went wrong. Then the last frame shows where it happened. Then walk upwards until you reach a line in your own code, because frames inside libraries are usually just the messenger. Since Python 3.11, tracebacks also underline the exact part of the line that failed with ^ markers, which is very helpful in long expressions like data[\"user\"][\"email\"].\n\nIf you see \"During handling of the above exception, another exception occurred\", there are two errors: the first one, and a second raised inside an except block.",
        visual: {
          type: "layers",
          title: "Parts of a traceback, top to bottom",
          layers: [
            { label: "Traceback header", detail: "Most recent call last" },
            { label: "Outer frames", detail: "Where the call started, often main()" },
            { label: "Your code's frame", detail: "Usually where the bug really is" },
            { label: "Innermost frame", detail: "The line that raised, with ^ markers" },
            { label: "Type and message", detail: "Read this first: KeyError: 'email'" },
          ],
        },
      },
      {
        heading: "How except chooses a handler",
        body: "When an exception is raised inside try, Python checks each except clause from top to bottom and runs the first one whose type matches. A clause matches the exception's own class or any of its parent classes. So except OSError also catches FileNotFoundError and PermissionError, because they are subclasses of OSError.\n\nThat means order matters: put specific handlers before general ones. If except Exception comes first, a later except ValueError never runs. You can catch several types at once with a tuple: except (ValueError, TypeError) as err. The as err part gives you the exception object, so you can print it or read attributes like err.filename on an OSError.\n\nIf no clause matches, the exception keeps travelling up to the caller, and then the caller's caller, until something catches it or the program ends. This is why you can handle an error far from where it was raised, at the level that knows what to do.",
        bullets: ["Specific before general: FileNotFoundError, then OSError", "except Exception does not catch KeyboardInterrupt or SystemExit", "A bare except: catches even Ctrl+C; avoid it"],
      },
      {
        heading: "else, finally and with: who cleans up",
        body: "Keep the try block small: only the line that can fail. Code that should run only if it succeeded goes in else. That way, an error in the follow-up code is not accidentally caught by an except meant for the first line.\n\nfinally always runs: after success, after a handled error, and even when an unhandled error is on its way out or a return happens inside try. Use it for cleanup such as releasing a lock or deleting a temporary file. Never put return in finally, because it silently throws away any exception in flight; newer Python versions warn about it.\n\nFor most cleanup you do not need finally at all: a with-statement (context manager) does it for you. with open(...) closes the file, and with lock: releases the lock. Inside, the context manager uses the same try/finally idea.",
      },
      {
        heading: "Raising well: messages, chaining and custom types",
        body: "Raise the most fitting built-in type: ValueError for a right type but bad value (age = -3), TypeError for the wrong type, KeyError or LookupError for something missing, and RuntimeError when nothing else fits. Write messages that help: include the bad value and what was expected, such as f\"amount must be positive, got {amount}\".\n\nWhen you catch a low-level error and raise a higher-level one, chain them with raise NewError(...) from err. The traceback then shows both, with \"The above exception was the direct cause of the following exception\", so no information is lost. Inside an except block, a bare raise re-raises the current exception unchanged, which is useful after logging.\n\nFor your own projects, define a small family: class TrackerError(Exception), then class StorageError(TrackerError) and so on. Callers can catch TrackerError to handle all of them, or one subclass for a specific case.",
        visual: {
          type: "tree",
          title: "A small custom exception family",
          root: "TrackerError(Exception)",
          children: [
            { label: "StorageError", children: ["File missing or corrupt JSON"] },
            { label: "ValidationError", children: ["Negative amount, bad date"] },
            { label: "RateApiError", children: ["Currency API down or slow"] },
          ],
        },
      },
      {
        heading: "EAFP vs LBYL: two styles of handling problems",
        body: "LBYL means look before you leap: check first, then act. if key in d: value = d[key]. EAFP means easier to ask forgiveness than permission: just try it and handle the failure. try: value = d[key] except KeyError: ... Python code often prefers EAFP.\n\nEAFP avoids race conditions. Checking if path.exists() and then opening the file can still fail, because another program may delete it between the two lines. Trying to open it and catching FileNotFoundError is always correct. EAFP also avoids doing the same lookup twice.\n\nLBYL is better when failure is common and cheap to check, or when the action is hard to undo. For simple cases, the best answer is often neither: d.get(key, default) returns a default with no exception at all. And contextlib.suppress(FileNotFoundError) is a tidy way to say \"this error is fine, ignore it\".",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "An exception travelling up the call stack",
        steps: [
          { label: "parse_amount()", detail: "float(\"abc\") raises ValueError" },
          { label: "No handler here", detail: "Function stops, error goes to caller" },
          { label: "add_expense()", detail: "No matching except, keeps going up" },
          { label: "main()", detail: "except ValueError prints a friendly message" },
          { label: "Program continues", detail: "Or exits cleanly with an exit code" },
        ],
      },
    ],
    examples: [
      {
        title: "Asking for a number until the user gets it right",
        explanation: "A program asks for an age. Step 1: put only the risky conversion inside try. Step 2: catch ValueError, the error int() raises for text like \"twenty\". Step 3: check the range yourself and raise or print a clear message. Step 4: loop until the input is valid. Step 5: notice Ctrl+C still stops the program, because we did not catch everything.",
        code: {
          lang: "python",
          code: "def ask_age() -> int:\n    while True:\n        raw = input(\"Your age: \")\n        try:\n            age = int(raw)\n        except ValueError:\n            print(f\"{raw!r} is not a whole number, try again.\")\n            continue\n        if 0 < age < 130:\n            return age\n        print(\"Age must be between 1 and 129.\")\n\nprint(\"Next year you will be\", ask_age() + 1)",
        },
      },
      {
        title: "Turning low-level errors into clear app errors",
        explanation: "Your app loads settings from JSON. Two things can go wrong: the file is missing (FileNotFoundError) or it is broken (json.JSONDecodeError, a subclass of ValueError). Step 1: catch each one where it happens. Step 2: raise your own ConfigError with a message the user understands. Step 3: use from err so the original cause still appears in the traceback for developers. Step 4: main() catches only ConfigError and exits with a non-zero code.",
        code: {
          lang: "python",
          code: "import json, sys\nfrom pathlib import Path\nclass ConfigError(Exception): pass\n\ndef load_config(path: Path) -> dict:\n    try:\n        return json.loads(path.read_text(encoding=\"utf-8\"))\n    except FileNotFoundError as err:\n        raise ConfigError(f\"Config file not found: {path}\") from err\n    except json.JSONDecodeError as err:\n        raise ConfigError(f\"{path} line {err.lineno}: invalid JSON\") from err\ntry:\n    cfg = load_config(Path(\"config.json\"))\nexcept ConfigError as err:\n    sys.exit(f\"Error: {err}\")",
        },
      },
    ],
    cheatSheet: [
      "Read tracebacks bottom up: error type and message, then the last frame in your own code",
      "except clauses run top to bottom; put specific types before general ones",
      "except (ValueError, TypeError) as err catches either type",
      "Keep try tiny; put follow-up code in else and cleanup in finally or a with-block",
      "raise AppError(\"message\") from err keeps the original cause in the traceback",
      "A bare raise inside except re-raises the current exception unchanged",
      "d.get(key, default) and contextlib.suppress(...) avoid needless try blocks",
    ],
    quiz: [
      {
        q: "Which handler runs for open(\"missing.txt\") when the clauses are: except OSError, then except FileNotFoundError?",
        options: ["except FileNotFoundError", "Both, in order", "except OSError, because it matches first", "Neither"],
        answer: 2,
        why: "FileNotFoundError is a subclass of OSError, and the first matching clause wins.",
      },
      {
        q: "When does a finally block run?",
        options: ["Only when no exception happened", "Always, whether the try succeeded, failed or returned", "Only when an exception was caught", "Only when the program exits"],
        answer: 1,
        why: "finally is guaranteed cleanup and runs on every path out of the try.",
      },
      {
        q: "What does raise ConfigError(\"bad file\") from err add?",
        options: ["It links the original exception as the direct cause, shown in the traceback", "It hides the original exception", "It retries the code", "It converts the error to a warning"],
        answer: 0,
        why: "Chaining keeps both errors visible, with the original listed as the cause.",
      },
      {
        q: "Why is if path.exists(): open(path) not fully safe?",
        options: ["exists() is slow", "exists() only works on folders", "open() ignores missing files", "The file can be deleted between the check and the open"],
        answer: 3,
        why: "That gap is a race condition; trying open() and catching FileNotFoundError avoids it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write safe_divide(a, b) that returns a / b, but returns None and prints a message when b is zero.",
        hint: "Catch ZeroDivisionError only.",
        solution: "def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        print(\"Cannot divide by zero.\")\n        return None\n\nprint(safe_divide(10, 2))   # 5.0\nprint(safe_divide(1, 0))    # message, then None",
      },
      {
        level: "medium",
        task: "Read numbers.txt (one number per line), sum the valid ones, and report each bad line with its line number instead of crashing.",
        hint: "Use enumerate and wrap only float(line) in try.",
        solution: "from pathlib import Path\n\ntotal = 0.0\nwith Path(\"numbers.txt\").open(encoding=\"utf-8\") as f:\n    for n, line in enumerate(f, start=1):\n        try:\n            total += float(line)\n        except ValueError:\n            print(f\"line {n}: skipped {line.strip()!r}\")\nprint(\"total:\", total)",
      },
      {
        level: "hard",
        task: "Create a BankError base class with InsufficientFunds and AccountLocked subclasses. InsufficientFunds should store needed and available as attributes. Show one handler for each and one that catches both.",
        hint: "Call super().__init__(message) in the subclass so str(err) works.",
        solution: "class BankError(Exception): pass\nclass AccountLocked(BankError): pass\nclass InsufficientFunds(BankError):\n    def __init__(self, needed, available):\n        super().__init__(f\"need {needed}, have {available}\")\n        self.needed, self.available = needed, available\n\ntry:\n    raise InsufficientFunds(120, 80)\nexcept InsufficientFunds as e:\n    print(\"short by\", e.needed - e.available)\nexcept BankError as e:      # catches AccountLocked and any future subclass\n    print(\"bank problem:\", e)",
      },
    ],
    faq: [
      { q: "What is the difference between an error and an exception in Python?", a: "In everyday talk they mean the same thing. Technically, exceptions are objects raised at run time, and most built-in error types end in Error; a SyntaxError is detected when the code is compiled, before it runs." },
      { q: "Should I catch Exception?", a: "Only at the top of a program or a long-running loop, where you log the error and keep going or exit cleanly. Deep inside your code, catch the specific types you can actually handle." },
      { q: "How do I log an exception with its traceback?", a: "Inside an except block, call logging.exception(\"message\"). It logs at ERROR level and adds the full traceback automatically." },
      { q: "What is ExceptionGroup?", a: "Added in Python 3.11, it bundles several exceptions raised together, for example by concurrent tasks. You handle its members with the except* syntax." },
    ],
  },

  "files-modules/modules": {
    plain: [
      "As a program grows, one long file becomes hard to read. Modules let you split it into smaller files, each with one job. Any .py file is a module. If you have storage.py, another file can write import storage and use the functions inside it.",
      "Python also ships with hundreds of ready-made modules called the standard library: math for maths, random for random numbers, datetime for dates, json for JSON, pathlib for files. You do not install them; you just import them.",
      "A package is a folder of modules. Putting related modules in one folder, like tracker/models.py and tracker/storage.py, keeps a bigger project tidy. You then import with dots: from tracker.storage import save.",
      "Every file can be both a script you run and a module you import. The if __name__ == \"__main__\": check tells them apart. Code under it runs only when you run the file directly, not when another file imports it, so importing never starts the program by accident.",
    ],
    deepDive: [
      {
        heading: "Where Python looks when you import",
        body: "import name searches the folders listed in sys.path, in order, and uses the first match. The first entry is the folder of the script you ran (or the current directory when you use python -m or the interactive prompt). Then come any folders in the PYTHONPATH environment variable, then the standard library, then site-packages, where pip installs third-party packages.\n\nBecause your script's folder comes first, a file of yours named random.py or json.py hides the real standard module. Then import random loads your file, and you get confusing errors like AttributeError: module 'random' has no attribute 'randint'. Rename the file and delete any __pycache__ folder next to it.\n\nTo see exactly where a module came from, print module.__file__. To see the search list, print sys.path. Python also caches compiled bytecode in __pycache__/*.pyc files so later imports start faster; you can safely delete them and should not commit them.",
        visual: {
          type: "flow",
          title: "import search order (sys.path)",
          steps: [
            { label: "sys.modules cache", detail: "Already imported? Reuse it" },
            { label: "Script's folder", detail: "Your own files win, even json.py" },
            { label: "PYTHONPATH", detail: "Extra folders, if the variable is set" },
            { label: "Standard library", detail: "math, json, pathlib, datetime" },
            { label: "site-packages", detail: "Packages installed with pip" },
            { label: "Not found", detail: "ModuleNotFoundError" },
          ],
        },
      },
      {
        heading: "The import forms and when to use each",
        body: "import math keeps the module name, so code reads math.sqrt(2); it is clear where sqrt came from. from math import sqrt copies just that name into your file, which is shorter for names you use often. import numpy as np and from datetime import datetime as dt give shorter or clearer aliases.\n\nAvoid from module import * in real code: it dumps every public name into your file, can silently overwrite your own names, and makes it hard to see where anything comes from. A module can limit what * exports by defining __all__ = [\"save\", \"load\"].\n\nPEP 8, the Python style guide, says to put imports at the top of the file, grouped as standard library, then third-party, then your own modules, with a blank line between groups. Tools like Ruff can sort them automatically.",
        bullets: ["One import per line for modules: import os, then import sys", "Absolute imports (from tracker.storage import save) are the clearest", "A name starting with _ signals private: do not import it from outside"],
      },
      {
        heading: "Packages, __init__.py and relative imports",
        body: "A folder with an __init__.py file is a regular package. When you import the package, Python runs its __init__.py once; it can be empty, or it can re-export the main names so users can write from tracker import Expense instead of from tracker.models import Expense. Keep it light, because heavy work there slows every import.\n\nSince Python 3.3, folders without __init__.py also work as namespace packages, but for your own projects include __init__.py so the intent is clear and tools behave predictably.\n\nInside a package, modules can use relative imports: from . import storage (same package) or from .models import Expense. Relative imports only work in modules that are part of a package. If you run such a file directly with python tracker/cli.py, you get ImportError: attempted relative import with no known parent package. Run it as a module instead, from the project root: python -m tracker.cli.",
        visual: {
          type: "compare",
          title: "Running code: path vs -m",
          columns: [
            { title: "python tracker/cli.py", points: ["Runs the file as a plain script", "sys.path starts at tracker/", "Relative imports fail", "Fine for single-file scripts"] },
            { title: "python -m tracker.cli", points: ["Runs it as part of the package", "sys.path starts at the current folder", "Relative and package imports work", "Use from the project root"] },
          ],
        },
      },
      {
        heading: "Circular imports and how to untangle them",
        body: "A circular import happens when a.py imports b.py and b.py imports a.py. Python starts running a.py, reaches import b, pauses a halfway, and runs b. When b asks for something from a that has not been defined yet, you get an error like: ImportError: cannot import name 'save' from partially initialized module 'a' (most likely due to a circular import).\n\nIt is a design smell: two modules depend on each other. The best fix is to move the shared code into a third module that both import, for example models.py that both storage.py and report.py use. Another fix is to import the module rather than names (import a, then use a.save() inside a function), because the name is looked up later, after both files have finished loading. As a last resort, move the import inside the function that needs it.\n\nA healthy project has dependencies that flow one way: cli uses services, services use models and storage, and models import nothing of yours.",
      },
      {
        heading: "What __name__ really is",
        body: "Every module has a built-in variable __name__. When the module is imported, __name__ is its import name, such as \"tracker.storage\". When the file is run directly, Python sets __name__ to \"__main__\" instead. The guard if __name__ == \"__main__\": simply checks which case you are in.\n\nThe usual pattern is to put all real work in a main() function and call it only under the guard. Then tests and other modules can import your functions without the program starting, asking for input or writing files. It also avoids a subtle problem: multiprocessing on Windows and macOS starts new processes that import your main file, and without the guard they would start the whole program again.\n\nA package can be runnable too: add a __main__.py file inside it, and python -m tracker runs that file.",
        bullets: ["Imported: __name__ is the module path, like \"tracker.storage\"", "Run directly: __name__ is \"__main__\"", "python -m tracker runs tracker/__main__.py"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Healthy dependency direction in a small app",
        layers: [
          { label: "cli.py", detail: "Imports services; nothing imports cli" },
          { label: "services.py", detail: "Business rules; imports models and storage" },
          { label: "storage.py", detail: "Reads and writes files; imports models" },
          { label: "models.py", detail: "Dataclasses only; imports no project code" },
          { label: "Standard library", detail: "json, pathlib, dataclasses" },
        ],
      },
    ],
    examples: [
      {
        title: "Splitting one file into a package",
        explanation: "You have a 300-line expenses.py. Step 1: create a folder expenses/ with an empty __init__.py. Step 2: move the dataclass to models.py, file reading and writing to storage.py, and the totals logic to report.py. Step 3: each module imports only what it needs, always downwards (report and storage import models). Step 4: create expenses/__main__.py with the main() function and the guard. Step 5: run it from the project folder with python -m expenses.",
        code: {
          lang: "python",
          code: "# expenses/report.py\nfrom collections import defaultdict\nfrom .models import Expense\ndef totals_by_category(items: list[Expense]) -> dict[str, float]:\n    out: dict[str, float] = defaultdict(float)\n    for e in items:\n        out[e.category] += e.amount\n    return dict(out)\n# expenses/__main__.py\nfrom .storage import load\nfrom .report import totals_by_category\nif __name__ == \"__main__\":\n    print(totals_by_category(load()))",
        },
      },
      {
        title: "Fixing \"module has no attribute\" caused by a file name",
        explanation: "You write a script called random.py to practise, and it crashes with AttributeError: module 'random' has no attribute 'choice'. Step 1: print random.__file__ to see which file was imported; it is your own random.py. Step 2: understand why: the script's folder comes first in sys.path. Step 3: rename your file to dice.py. Step 4: delete __pycache__ in that folder so the old compiled copy is gone. Step 5: run again; now the standard module loads.",
        code: {
          lang: "python",
          code: "# dice.py (renamed from random.py)\nimport random\nprint(random.__file__)   # now a path inside the standard library\nprint(random.choice([\"rock\", \"paper\", \"scissors\"]))",
        },
      },
    ],
    cheatSheet: [
      "print(module.__file__) shows which file was actually imported",
      "Never name your files after standard modules: random.py, json.py, email.py",
      "Group imports: standard library, third-party, your own; one blank line between",
      "from . import x works only inside a package; run it with python -m package.module",
      "A module's top-level code runs once; later imports reuse sys.modules",
      "Fix circular imports by moving shared code into a third module",
      "Add __main__.py to a package so python -m package runs it",
    ],
    quiz: [
      {
        q: "You run python tracker/cli.py and get \"attempted relative import with no known parent package\". What fixes it?",
        options: ["Delete __init__.py", "Run python -m tracker.cli from the project root", "Rename cli.py to __main__.py", "Add the file to PYTHONPATH"],
        answer: 1,
        why: "Running it as a module tells Python it belongs to the tracker package, so relative imports work.",
      },
      {
        q: "What is __name__ inside storage.py when main.py does import storage?",
        options: ["\"storage\"", "\"__main__\"", "\"main\"", "None"],
        answer: 0,
        why: "Imported modules get their import name; only the file being run gets \"__main__\".",
      },
      {
        q: "a.py does from b import helper and b.py does from a import config. What usually happens?",
        options: ["Python merges the files", "It always works", "Both files run twice", "ImportError about a partially initialized module"],
        answer: 3,
        why: "One module is still half-loaded when the other asks for its names.",
      },
      {
        q: "Which import style is discouraged by PEP 8 for normal code?",
        options: ["import math", "from math import sqrt", "from math import *", "import numpy as np"],
        answer: 2,
        why: "Wildcard imports hide where names come from and can overwrite your own names.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create greet.py with a function hello(name) and a __main__ guard that calls it with \"world\". Import it from another file and check the guard code does not run.",
        hint: "Put a print under the guard and see whether it appears on import.",
        solution: "# greet.py\ndef hello(name):\n    return f\"Hello, {name}!\"\n\nif __name__ == \"__main__\":\n    print(hello(\"world\"))   # only when run directly\n\n# use.py\nfrom greet import hello\nprint(hello(\"Ana\"))          # prints only Hello, Ana!",
      },
      {
        level: "medium",
        task: "Build a package shapes/ with circle.py (area(r)) and square.py (area(s)). In shapes/__init__.py re-export both as circle_area and square_area, then use them from main.py.",
        hint: "Use relative imports with aliases inside __init__.py.",
        solution: "# shapes/circle.py\nimport math\ndef area(r): return math.pi * r ** 2\n# shapes/square.py\ndef area(s): return s * s\n# shapes/__init__.py\nfrom .circle import area as circle_area\nfrom .square import area as square_area\n# main.py\nfrom shapes import circle_area, square_area\nprint(round(circle_area(1), 2), square_area(3))   # 3.14 9",
      },
      {
        level: "hard",
        task: "models.py imports format_money from report.py, and report.py imports Expense from models.py, causing a circular import. Restructure so it works and dependencies flow one way.",
        hint: "Which module should know nothing about the others?",
        solution: "# Move the shared helper out of report.py into its own module.\n# money.py (imports nothing from the project)\ndef format_money(x: float) -> str:\n    return f\"{x:,.2f}\"\n# models.py\nfrom dataclasses import dataclass\nfrom .money import format_money\n@dataclass\nclass Expense:\n    amount: float\n    def label(self) -> str: return format_money(self.amount)\n# report.py imports from models and money; models never imports report.",
      },
    ],
    faq: [
      { q: "Do I still need __init__.py in Python 3?", a: "Python can import folders without it (namespace packages), but you should include it in your own packages. It makes the package explicit and avoids surprises with tools and tests." },
      { q: "What is the difference between a module and a package?", a: "A module is a single .py file. A package is a folder that groups modules, and it can contain sub-packages." },
      { q: "Why does my module's code only run once even if I import it many times?", a: "After the first import, Python stores the module in sys.modules and later imports reuse it. Use importlib.reload(module) if you really need to re-run it, for example in an interactive session." },
      { q: "What is ModuleNotFoundError: No module named 'requests'?", a: "Python cannot find the package on sys.path, usually because it is not installed in the environment you are running. Activate the right virtual environment and run python -m pip install requests." },
    ],
  },

  "files-modules/venv-pip": {
    plain: [
      "When you install a package with pip, it goes into a folder that Python searches when you import. If every project shares one folder, they also share versions. Project A needs version 1 of a library, project B needs version 2, and one of them breaks.",
      "A virtual environment (venv) gives each project its own private folder of packages. You create it once inside the project, turn it on (activate it), and from then on pip installs into that folder only. Other projects never see those packages.",
      "pip is the tool that downloads packages from PyPI, the Python Package Index, and installs them. pip freeze lists exactly what is installed with version numbers. Saving that list in requirements.txt lets anyone rebuild the same setup later with one command.",
      "Think of the venv as disposable. If it ever gets messy, delete the .venv folder and recreate it from requirements.txt in a minute. That is also why you never commit .venv to Git: the requirements file is the recipe, the venv is just the cooked dish.",
    ],
    deepDive: [
      {
        heading: "What a venv actually contains",
        body: "python -m venv .venv creates a small folder. Inside is pyvenv.cfg, a text file that points to the base Python it was made from. There is a bin folder (Scripts on Windows) with a python that refers back to the base interpreter, pip, and the activate scripts. And there is lib/python3.X/site-packages (Lib\\site-packages on Windows), which starts almost empty.\n\nWhen this python starts, it sees pyvenv.cfg and uses the venv's site-packages instead of the global one. The standard library still comes from the base install, so a venv is small.\n\nActivation is less magic than it looks. It mostly puts the venv's bin folder first in your PATH and sets the VIRTUAL_ENV variable, so typing python or pip finds the venv's copies. You can skip activation entirely and run .venv/bin/python script.py directly, which is handy in cron jobs and systemd services. A venv stores absolute paths, so moving or renaming the folder breaks it; just recreate it.",
        visual: {
          type: "tree",
          title: "Inside .venv on Linux or macOS",
          root: ".venv/",
          children: [
            { label: "pyvenv.cfg", children: ["home = path to the base Python", "version of Python used"] },
            { label: "bin/ (Scripts\\ on Windows)", children: ["python, pip", "activate scripts", "Command-line tools you install"] },
            { label: "lib/python3.X/site-packages/", children: ["Packages pip installs", "Starts nearly empty"] },
          ],
        },
      },
      {
        heading: "Version specifiers and what pip install really does",
        body: "You can ask pip for a version range. requests==2.32.3 pins one exact version. requests>=2.31 allows that or newer. requests>=2.31,<3 allows newer versions but not the next major one, which might break your code. requests~=2.32.0 means compatible release: at least 2.32.0 but below 2.33.\n\nWhen you install a package, pip also installs its dependencies, and theirs. Installing requests brings in urllib3, idna, charset-normalizer and certifi. pip's resolver looks for a set of versions that satisfies every requirement at once. If none exists, it stops with a ResolutionImpossible error that names the conflicting packages.\n\nMost packages download as wheels (.whl files), which are pre-built and install quickly. If no wheel matches your Python version and OS, pip falls back to building from source, which may need a compiler. That is a common reason installs fail on brand-new Python versions.",
        bullets: ["pip list shows installed packages; pip show requests shows details and dependencies", "pip install --upgrade requests updates to the newest allowed version", "pip uninstall requests does not remove its dependencies"],
      },
      {
        heading: "requirements.txt done well",
        body: "pip freeze > requirements.txt writes every installed package with an exact version, including indirect dependencies you never asked for. That is good for reproducibility: the same file gives the same environment next month. The downside is that it is hard to see which packages you actually chose.\n\nA common improvement is to keep two files. requirements.in lists only your direct dependencies with loose ranges, like requests>=2.31. A tool such as pip-tools (pip-compile) or uv then resolves them into a fully pinned requirements.txt. You edit the .in file and regenerate the .txt file.\n\nYou can also split development tools from runtime needs: requirements-dev.txt can start with -r requirements.txt and then add pytest and ruff. Production installs only the first file. Modern projects often declare dependencies in pyproject.toml instead, and use a lock file for exact versions, but the idea is the same: a loose list you write and an exact list a tool generates.",
        visual: {
          type: "compare",
          title: "Loose list vs pinned lock",
          columns: [
            { title: "requirements.in (you write)", points: ["Only direct dependencies", "Loose ranges like >=2.31", "Short and readable", "Edited by hand"] },
            { title: "requirements.txt (generated)", points: ["Every package, direct and indirect", "Exact == versions", "Same install every time", "Regenerated by a tool"] },
          ],
        },
      },
      {
        heading: "Common errors and their fixes",
        body: "error: externally-managed-environment. Recent Debian, Ubuntu and Homebrew Pythons refuse pip installs into the system Python (PEP 668), so that pip cannot break OS tools. The fix is exactly what this topic teaches: create a venv and install there. For command-line tools you want globally, use pipx.\n\nModuleNotFoundError after a successful install. The package went into a different Python than the one running your code. Check with python -m pip --version, which prints the Python it belongs to, and which python (where python on Windows). Always use python -m pip so pip matches python.\n\nOn Windows PowerShell, running .venv\\Scripts\\Activate.ps1 may fail because scripts are disabled. Run Set-ExecutionPolicy -Scope CurrentUser RemoteSigned once, or use the activate.bat script from cmd.\n\nIn VS Code, choose the interpreter inside .venv (Python: Select Interpreter), or the editor will show import errors even when the terminal works.",
        bullets: ["python -m pip --version shows which Python pip installs into", "pipx install ruff installs a CLI tool in its own isolated venv", "Deleting and recreating .venv fixes most strange states"],
      },
      {
        heading: "Faster tools: uv and friends",
        body: "pip and venv are built in and work everywhere, so learn them first. In real teams you will also meet newer tools. uv, written in Rust, is a very fast drop-in for many pip and venv tasks: uv venv creates an environment, uv pip install -r requirements.txt installs into it, and uv pip compile turns a requirements.in into a pinned file. uv can also manage Python versions and whole projects with a pyproject.toml and a uv.lock file.\n\nPoetry and PDM are other project managers built around pyproject.toml and lock files. Conda manages environments that include non-Python libraries, which is popular in data science.\n\nAll of them solve the same three problems this topic covers: isolate each project, record the dependencies, and recreate the same environment anywhere. If you understand venv and requirements.txt, switching tools later is easy.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A teammate recreates your environment",
        actors: ["You", "Git repo", "Teammate", "PyPI"],
        messages: [
          { from: 0, to: 0, label: "pip freeze > requirements.txt" },
          { from: 0, to: 1, label: "Commit requirements.txt, not .venv" },
          { from: 2, to: 1, label: "git clone" },
          { from: 2, to: 2, label: "python -m venv .venv, activate" },
          { from: 2, to: 3, label: "pip install -r requirements.txt" },
          { from: 3, to: 2, label: "Same exact versions downloaded" },
        ],
      },
    ],
    examples: [
      {
        title: "Two projects needing different versions",
        explanation: "An old project needs Django 4.2, a new one needs Django 5.x. Step 1: in each project folder, create its own .venv. Step 2: activate the first and install django<5; activate the second and install django>=5. Step 3: check with python -m pip show django in each; they report different versions. Step 4: freeze each into its own requirements.txt. Neither project can break the other now.",
        code: {
          lang: "bash",
          code: "cd ~/old-site\npython -m venv .venv && source .venv/bin/activate\npython -m pip install \"django>=4.2,<5\"\npython -m pip freeze > requirements.txt\ndeactivate\n\ncd ~/new-site\npython -m venv .venv && source .venv/bin/activate\npython -m pip install \"django>=5\"\npython -m django --version",
        },
      },
      {
        title: "Running a venv script from cron without activating",
        explanation: "You have a report script that needs requests, installed in /opt/report/.venv. Cron jobs do not read your shell setup, so source activate is awkward there. Step 1: remember that activation only changes PATH. Step 2: call the venv's python by its full path; it uses the venv's packages automatically. Step 3: write output to a log so you can see errors. Step 4: test the exact command in a fresh shell before adding it to crontab.",
        code: {
          lang: "bash",
          code: "# test it first, with no venv active\n/opt/report/.venv/bin/python /opt/report/report.py\n\n# crontab -e : run every day at 07:30\n30 7 * * * /opt/report/.venv/bin/python /opt/report/report.py >> /var/log/report.log 2>&1",
        },
      },
    ],
    cheatSheet: [
      "python -m venv .venv creates it; source .venv/bin/activate (Windows: .venv\\Scripts\\activate)",
      "Always python -m pip install ... so pip matches the active python",
      "==2.32.3 exact; >=2.31,<3 range; ~=2.32.0 means >=2.32.0 and <2.33",
      "pip freeze > requirements.txt pins everything; pip install -r requirements.txt restores it",
      "Add .venv/ to .gitignore; commit requirements.txt",
      "externally-managed-environment error: use a venv, or pipx for global CLI tools",
      "No activation needed: .venv/bin/python script.py uses the venv's packages",
    ],
    quiz: [
      {
        q: "What does activating a venv mainly do?",
        options: ["Copies Python into the project", "Downloads the standard library", "Puts the venv's bin folder first on PATH", "Installs pip globally"],
        answer: 2,
        why: "After activation, typing python or pip finds the venv's copies first.",
      },
      {
        q: "You pip installed requests, but python app.py says ModuleNotFoundError. What is the most likely cause?",
        options: ["pip installed into a different Python than the one running app.py", "requests does not support Python 3", "app.py has a syntax error", "PyPI is down"],
        answer: 0,
        why: "Using python -m pip guarantees the install goes into the same interpreter.",
      },
      {
        q: "Which specifier allows any 2.x version from 2.31 up but never 3.0?",
        options: ["==2.31", "~=2.31.0", ">=2.31", ">=2.31,<3"],
        answer: 3,
        why: "The upper bound <3 blocks the next major version; ~=2.31.0 would stop below 2.32.",
      },
      {
        q: "Why should .venv not be committed to Git?",
        options: ["Git cannot store binary files", "It is large, OS-specific and contains absolute paths; requirements.txt can rebuild it", "It contains your passwords", "pip deletes it automatically"],
        answer: 1,
        why: "The venv is a disposable build product; the requirements file is the real source.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a venv, activate it, install requests, and prove that python and pip both come from the venv.",
        hint: "python -m pip --version and a one-line Python print help.",
        solution: "python -m venv .venv\nsource .venv/bin/activate          # Windows: .venv\\Scripts\\activate\npython -m pip install requests\npython -m pip --version             # path ends in .venv/...\npython -c \"import sys, requests; print(sys.prefix, requests.__version__)\"",
      },
      {
        level: "medium",
        task: "Freeze your environment, delete the venv completely, recreate it from requirements.txt, and confirm the versions match.",
        hint: "Save the freeze output before and after, then compare the files.",
        solution: "python -m pip freeze > requirements.txt\ndeactivate\nrm -rf .venv\npython -m venv .venv && source .venv/bin/activate\npython -m pip install -r requirements.txt\npython -m pip freeze > after.txt\ndiff requirements.txt after.txt && echo identical",
      },
      {
        level: "hard",
        task: "Set up requirements.in with only requests and rich (loose ranges), generate a fully pinned requirements.txt with pip-tools, and add a requirements-dev.txt that includes it plus pytest.",
        hint: "pip install pip-tools gives you pip-compile; -r includes another file.",
        solution: "python -m pip install pip-tools\nprintf 'requests>=2.31,<3\\nrich>=13\\n' > requirements.in\npip-compile requirements.in          # writes pinned requirements.txt\nprintf -- '-r requirements.txt\\npytest>=8\\n' > requirements-dev.txt\npython -m pip install -r requirements-dev.txt\n# Edit requirements.in, then re-run pip-compile to update pins.",
      },
    ],
    faq: [
      { q: "Should I name it .venv or venv?", a: "Either works. .venv is a common convention that editors like VS Code detect automatically, and the leading dot hides it in many file listings." },
      { q: "Do I need a new venv for every script?", a: "One per project is the norm. For tiny scripts that only use the standard library, you do not need one at all." },
      { q: "What is the difference between pip and pipx?", a: "pip installs libraries into the current environment. pipx installs a command-line application into its own hidden venv and puts its command on your PATH, so tools like ruff or httpie do not clash with your projects." },
      { q: "How do I use a different Python version in a venv?", a: "Create the venv with that interpreter, for example python3.12 -m venv .venv, or py -3.12 -m venv .venv on Windows. A venv always uses the Python that created it." },
    ],
  },
};

export default extra;
