import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "getting-started/setup": {
    plain: [
      "Python is two things at once. It is a language, which means a set of rules for writing code. It is also a program, called the interpreter, that reads your code and does what it says. When people say \"install Python\", they mean installing that interpreter, plus the standard library (thousands of ready-made tools) and pip, the tool that downloads extra packages.",
      "You talk to the interpreter through a terminal: a text window where you type a command, press Enter and get text back. On Windows that is PowerShell or Windows Terminal. On macOS it is the Terminal app. On Linux it is whatever terminal your desktop offers. It looks old-fashioned, but it is the fastest way to run and control programs.",
      "There are two ways to run Python code. The REPL is an interactive prompt (it shows >>>) where every line runs the moment you press Enter. It is perfect for quick experiments. A script is a .py file that you save and run from start to finish. Real programs are always scripts.",
      "An editor like VS Code makes writing scripts much easier. It colors your code, points out mistakes while you type, and runs the file with one click. Under the hood, the Run button simply starts the interpreter with your file, exactly as you would in the terminal. Knowing both ways means you are never stuck when one of them misbehaves.",
    ],
    deepDive: [
      {
        heading: "What an install really puts on your computer",
        body: "The python.org installer copies four main things: the interpreter (python.exe on Windows, python3 elsewhere), the standard library (folders of modules such as json, math and pathlib), pip, and IDLE, a very simple editor. On Windows it also installs the py launcher, a small tool that finds and starts the right Python for you.\n\nOn macOS you can use the python.org installer or Homebrew (brew install python). Most Linux systems already have python3, because the operating system's own tools use it. Do not remove or replace that system Python. On Debian and Ubuntu, venv and pip come as separate packages: sudo apt install python3-venv python3-pip.\n\nA new 3.x version comes out every October and each one gets fixes for about five years. Install the newest stable release unless a course or tool asks for another. Python 2 reached its end of life in 2020; never start a project with it.",
        bullets: [
          "Windows: tick \"Add python.exe to PATH\" in the installer",
          "macOS: brew install python, or the python.org installer",
          "Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip",
        ],
      },
      {
        heading: "Which Python runs? PATH and the three command names",
        body: "When you type a command like python3, the shell does not search your whole disk. It reads an environment variable called PATH, which is a list of folders, and checks them in order. The first folder that contains a matching program wins. So if two Pythons are installed, the one whose folder comes first in PATH is the one you get.\n\nThe command name differs by system. On macOS and Linux use python3; plain python may be missing or point to something else. On Windows use py (the launcher) or python. The launcher can pick a version for you: py -3.12 runs 3.12, and py -0 lists every version it found.\n\nWhen in doubt, ask Python itself: python3 -c \"import sys; print(sys.executable)\" prints the full path of the interpreter that is actually running. This one line solves most \"I installed it but it does not work\" problems.",
        visual: {
          type: "flow",
          title: "How the shell finds python3",
          steps: [
            { label: "You type python3", detail: "The shell needs to find a program with that name" },
            { label: "Read PATH", detail: "A list of folders, for example /usr/local/bin then /usr/bin" },
            { label: "Check folders in order", detail: "Look for an executable called python3 in each one" },
            { label: "First match runs", detail: "Later folders are never checked" },
            { label: "Confirm it", detail: "sys.executable shows the path that really ran" },
          ],
        },
      },
      {
        heading: "Getting more out of the REPL",
        body: "The REPL (Read, Eval, Print, Loop) reads one line, runs it, prints the result and waits again. It only prints results for expressions, like 2 + 3. In a script you need print() to see anything.\n\nA few tricks make it a real learning tool. The underscore _ holds the last result, so you can keep calculating with it. help(str) shows the documentation for any object, and dir(\"text\") lists everything a value can do. When a line ends with a colon, such as the first line of a loop, the prompt changes to ... and you finish the block with an empty line.\n\nSince Python 3.13 the REPL is friendlier: it uses colors, lets you edit a whole block with the arrow keys, accepts exit and quit without parentheses, and has F1 for help, F2 for history and F3 for paste mode. python3 -i app.py runs a script and then opens a REPL with all of its variables, which is great for poking at results.",
        bullets: [
          "_ is the last result (only in the REPL)",
          "help(x) explains x; dir(x) lists its attributes",
          "Exit: exit(), Ctrl+D on macOS/Linux, Ctrl+Z then Enter on Windows",
        ],
      },
      {
        heading: "Running scripts: folders, flags and exit codes",
        body: "python3 hello.py looks for hello.py in the current working directory, the folder your terminal is in right now. Run pwd (macOS, Linux, PowerShell) to see it and cd to move. Most \"No such file or directory\" errors simply mean you are in the wrong folder.\n\nThe interpreter has useful flags. -c runs a short piece of code: python3 -c \"print(2 + 2)\". -m runs a module as a program, for example python3 -m pip, python3 -m venv, or python3 -m http.server 8000, which serves the current folder on port 8000. -i opens the REPL after the script ends.\n\nEvery program ends with an exit code. 0 means success; an uncaught error gives 1. Shells and CI systems use this number to decide if a step passed. Check it with echo $? in bash or $LASTEXITCODE in PowerShell. On macOS and Linux a first line of #!/usr/bin/env python3 plus chmod +x lets you run the file as ./hello.py.",
      },
      {
        heading: "A VS Code setup that actually works",
        body: "Install VS Code, then the Python extension published by Microsoft. It also brings Pylance (smart completions and error hints) and the Python Debugger. Open your project with File, Open Folder rather than opening single files, so VS Code can find your settings and virtual environment.\n\nThe most important setting is the interpreter. Press Ctrl+Shift+P (Cmd+Shift+P on macOS), choose \"Python: Select Interpreter\" and pick the Python you want. The chosen version shows in the status bar at the bottom. If the Run button and your terminal behave differently, they are almost always using two different interpreters.\n\nThe Run button (the triangle at the top right) runs the current file in the built-in terminal. Shift+Enter sends selected lines to a Python REPL. F5 starts the debugger, which lets you pause on a line and look at every variable. That habit will save you hours later.",
        visual: {
          type: "sequence",
          title: "What the VS Code Run button does",
          actors: ["You", "VS Code", "Terminal", "Python"],
          messages: [
            { from: 0, to: 1, label: "Click Run Python File" },
            { from: 1, to: 2, label: "Open the built-in terminal" },
            { from: 2, to: 3, label: "Start the selected interpreter with the file path" },
            { from: 3, to: 2, label: "Print output or a traceback" },
            { from: 2, to: 0, label: "You read the result" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Ways to run Python code",
        root: "Python code",
        children: [
          { label: "REPL", children: ["python3 or py", "python3 -i app.py"] },
          { label: "Script file", children: ["python3 app.py", "./app.py with a shebang line"] },
          { label: "One-liner", children: ["python3 -c \"print(42)\""] },
          { label: "Module", children: ["python3 -m pip", "python3 -m http.server"] },
          { label: "Editor", children: ["VS Code Run button", "F5 for the debugger"] },
        ],
      },
      {
        type: "compare",
        title: "The same tasks on each system",
        columns: [
          { title: "Windows", points: ["Install from python.org", "Command: py or python", "Check: py --version", "Exit REPL: Ctrl+Z, Enter"] },
          { title: "macOS", points: ["python.org or brew install python", "Command: python3", "Check: python3 --version", "Exit REPL: Ctrl+D"] },
          { title: "Linux", points: ["Usually preinstalled; apt or dnf", "Command: python3", "Check: python3 --version", "Exit REPL: Ctrl+D"] },
        ],
      },
    ],
    examples: [
      {
        title: "First check on a fresh machine",
        explanation: "You just installed Python and want to be sure it works. Step 1: ask for the version. Step 2: ask which file is actually running, so you know which install you got. Step 3: open the REPL and do a quick calculation, using _ to reuse the last result. Step 4: leave the REPL. If step 1 fails with \"command not found\", the install folder is not on PATH; re-run the installer (on Windows, tick Add python.exe to PATH) or open a new terminal.",
        code: {
          lang: "bash",
          code: "python3 --version          # Windows: py --version\n# Python 3.x.y\npython3 -c \"import sys; print(sys.executable)\"\n# /usr/bin/python3\npython3\n>>> 60 * 60 * 24\n86400\n>>> _ * 7\n604800\n>>> exit()",
        },
      },
      {
        title: "Your first script and the wrong-folder error",
        explanation: "You saved hello.py in a folder called projects, but your terminal is still in your home folder. Step 1: running it fails because Python looks in the current folder. Step 2: move into the right folder with cd. Step 3: run it again. Step 4: check the exit code, 0 means it finished without errors. Reading the error message closely, it tells you exactly which path it tried.",
        code: {
          lang: "bash",
          code: "python3 hello.py\n# python3: can't open file '/home/ana/hello.py': [Errno 2] No such file or directory\npwd                     # /home/ana\ncd projects\npython3 hello.py\n# Hello, Ada\necho $?                 # 0 (PowerShell: $LASTEXITCODE)",
        },
      },
    ],
    cheatSheet: [
      "python3 --version (macOS/Linux) or py --version (Windows) shows the installed version",
      "py -0 lists every Python on Windows; py -3.12 runs that exact version",
      "python3 -c \"import sys; print(sys.executable)\" shows which interpreter really runs",
      "In the REPL, _ is the last result; help(x) and dir(x) explain any object",
      "Exit the REPL with exit(), Ctrl+D (macOS/Linux) or Ctrl+Z then Enter (Windows)",
      "python3 -i app.py runs the script, then opens a REPL with its variables",
      "python3 -m http.server 8000 serves the current folder at localhost:8000",
      "VS Code: Ctrl+Shift+P, then \"Python: Select Interpreter\" picks which Python runs",
    ],
    quiz: [
      {
        q: "You run python3 hello.py and get \"[Errno 2] No such file or directory\". What is the most likely cause?",
        options: ["Python is not installed", "The file has a syntax error", "The terminal is in a different folder than hello.py", "The file needs a shebang line"],
        answer: 2,
        why: "Python looks for the file relative to the current working directory, so cd to the right folder first.",
      },
      {
        q: "In the REPL you type 6 * 7, then _ + 1. What is shown?",
        options: ["43", "42", "NameError: _ is not defined", "1"],
        answer: 0,
        why: "In the REPL, _ holds the last result, 42, so _ + 1 is 43.",
      },
      {
        q: "Two Pythons are installed and both folders are on PATH. Which one does python3 start?",
        options: ["Always the newest version", "The one in the first PATH folder that contains python3", "The one installed first", "A random one each time"],
        answer: 1,
        why: "The shell checks PATH folders in order and runs the first match.",
      },
      {
        q: "What does python3 -m http.server 8000 do?",
        options: ["Downloads a web server package", "Opens the REPL on port 8000", "Edits the http module", "Runs a standard library module that serves the current folder on port 8000"],
        answer: 3,
        why: "-m runs a module as a program, and http.server ships with Python.",
      },
      {
        q: "The VS Code Run button and your terminal show different Python versions. What should you check first?",
        options: ["The interpreter chosen with \"Python: Select Interpreter\"", "The font size", "Whether the file is saved as UTF-8", "The Git branch"],
        answer: 0,
        why: "VS Code runs files with the interpreter you selected, which may differ from the one first on PATH.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use the REPL as a calculator: work out how many seconds are in a week, then use _ to turn that into minutes. Leave the REPL cleanly.",
        hint: "_ holds the previous result. Dividing with / gives a float.",
        solution: ">>> 7 * 24 * 60 * 60\n604800\n>>> _ / 60\n10080.0\n>>> exit()",
      },
      {
        level: "medium",
        task: "Write info.py that prints the Python version and the full path of the interpreter running it. Run it from the terminal and from the VS Code Run button, and compare the two outputs.",
        hint: "The sys module has version and executable.",
        solution: "# info.py\nimport sys\n\nprint(\"Version:\", sys.version)\nprint(\"Interpreter:\", sys.executable)\n\n# Terminal: python3 info.py\n# If the paths differ, change \"Python: Select Interpreter\" in VS Code.",
      },
      {
        level: "hard",
        task: "On macOS or Linux, make a script you can run as ./hello.py. It should print which interpreter runs it and finish with exit code 3. Show the exit code in the shell.",
        hint: "The shebang must be the very first line; sys.exit(n) sets the exit code; chmod +x makes it executable.",
        solution: "cat > hello.py <<'EOF'\n#!/usr/bin/env python3\nimport sys\nprint(\"Hello from\", sys.executable)\nsys.exit(3)\nEOF\nchmod +x hello.py\n./hello.py\necho $?        # 3\n# On Windows, py hello.py also reads the shebang line.",
      },
    ],
    faq: [
      { q: "Should I type python or python3?", a: "On macOS and Linux use python3, because python may be missing or point somewhere else. On Windows use py or python. Inside an active virtual environment, python always means that environment's Python." },
      { q: "Which Python version should I install?", a: "The newest stable 3.x release from python.org, unless a course or tool you need asks for a specific one. Python 2 reached its end of life in 2020, so never start with it." },
      { q: "Why does typing python on Windows open the Microsoft Store?", a: "Windows has an app execution alias called python that opens the Store when no Python is installed. Install Python, or turn the alias off in Settings, Apps, Advanced app settings, App execution aliases." },
      { q: "Do I need an IDE like PyCharm to learn Python?", a: "No. Any editor plus a terminal is enough. VS Code with the Python extension is free and popular, and PyCharm is a good alternative; the skills are the same in both." },
    ],
  },

  "getting-started/values-types": {
    plain: [
      "A value is one piece of data: 42, 3.5, \"hello\" or True. Every value has a type, which says what kind of data it is and what you can do with it. You can add two numbers or join two pieces of text, but you cannot add a number to a word without converting one of them first.",
      "A variable is a name that points to a value. When you write age = 30, Python creates the value 30 and ties the name age to it. Later, age = 31 moves the name to a new value. Names are case-sensitive, so Age and age are two different variables.",
      "Python works out types by itself while the program runs. This is called dynamic typing. You never write \"int age\" like in some other languages. A name can even point to a string later, but that confuses readers, so keep one name for one kind of thing.",
      "Data from the outside world, like the keyboard, files or the web, usually arrives as text. Converting it with int(), float() or bool() turns it into real values you can calculate with, and str() turns numbers back into text when you want to show them. Most beginner bugs in this area are a missing conversion.",
    ],
    deepDive: [
      {
        heading: "Names and objects: what = really does",
        body: "Everything in Python is an object: a box in memory with a type, a value and an identity (id() shows a number for it). A variable does not contain the box; it points at it. y = x does not copy anything, it just adds a second name for the same object.\n\nNumbers and strings are immutable, which means the object itself can never change. So x = x + 1 does not change the 5 that x points to. Python computes a new object, 6, and moves the name x to it. Any other name that pointed at 5 still sees 5.\n\nThis model explains a lot of behaviour later, especially with lists, which can change. For now, remember: = binds a name, it never copies. You can bind several names at once, a, b = 1, 2, and swap two values with a, b = b, a, without a temporary variable.",
        visual: {
          type: "flow",
          title: "Rebinding a name, step by step",
          steps: [
            { label: "x = 5", detail: "Name x points at the int object 5" },
            { label: "y = x", detail: "Name y points at the same object" },
            { label: "x = x + 1", detail: "Python builds a new object 6" },
            { label: "Move x", detail: "x now points at 6" },
            { label: "Result", detail: "x is 6, y is still 5" },
          ],
        },
      },
      {
        heading: "int and float under the hood",
        body: "Python ints have no fixed size. 2 to the power 100 is stored exactly, all 31 digits of it. Very big ints are just slower.\n\nFloats are different. They use the standard 64-bit format (IEEE 754) that almost every language uses, which keeps about 15 to 17 significant digits and stores numbers in binary. Many simple decimals, like 0.1, have no exact binary form, so 0.1 + 0.2 gives 0.30000000000000004. That is not a Python bug. Round for display, compare with math.isclose(), and use decimal.Decimal or whole cents for money.\n\nDivision has three operators. / always returns a float. // is floor division: it rounds down toward minus infinity, so -7 // 2 is -4, not -3. % gives the remainder, and its sign follows the right-hand number, so -7 % 2 is 1. round() sends exact halves to the even neighbour: round(2.5) is 2 and round(3.5) is 4.",
        bullets: [
          "1_000_000 is a valid int; underscores are just for reading",
          "divmod(135, 60) returns (2, 15) in one step",
          "math.isclose(0.1 + 0.2, 0.3) is True",
        ],
      },
      {
        heading: "bool is a kind of int, and what counts as true",
        body: "True and False are the only two bool values, and bool is actually a subtype of int: True == 1 and False == 0, so True + True is 2. That is why sum(flags) counts how many items in a list are True.\n\nAny value can be turned into a bool with bool(). The rule is simple: zero and empty things are False, everything else is True. 0, 0.0, an empty string \"\", None and empty collections are False. Every other number and every non-empty string is True.\n\nThis catches beginners out: bool(\"False\") is True, and so is bool(\"0\"), because both are non-empty strings. To turn text such as yes or no into a bool, compare the text itself, for example answer.strip().lower() in (\"y\", \"yes\"). None is a separate type, NoneType, and means \"no value at all\"; check for it with is None.",
      },
      {
        heading: "Conversions that work and ones that fail",
        body: "Conversion functions build a new value of another type; they never change the original. int() accepts text that looks like a whole number and ignores spaces around it, so int(\" 42 \") is 42. It rejects anything else with ValueError, including \"4.2\" and the empty string. Given a float, int() cuts off the decimals toward zero: int(4.9) is 4 and int(-4.9) is -4.\n\nfloat() understands \"3.5\", \"1e3\" (1000.0), and even \"inf\" and \"nan\". str() works on anything and gives you its text form. int(\"ff\", 16) reads a number in another base, here 255.\n\nWhen the conversion might fail because the text came from a user or a file, wrap it in try/except ValueError and handle the bad case. Passing the wrong kind of thing, such as int(None), raises TypeError instead, which usually points to a bug in your own code.",
        visual: {
          type: "compare",
          title: "Conversions: works vs fails",
          columns: [
            { title: "Works", points: ["int(\"42\") gives 42", "int(\" 7 \") gives 7", "float(\"2.5\") gives 2.5", "int(9.99) gives 9", "str(3.0) gives \"3.0\""] },
            { title: "Fails", points: ["int(\"4.2\"): ValueError", "int(\"\"): ValueError", "int(\"seven\"): ValueError", "float(\"1,5\"): ValueError", "int(None): TypeError"] },
          ],
        },
      },
      {
        heading: "Naming rules and style",
        body: "A name may contain letters, digits and underscores, but cannot start with a digit and cannot be a keyword such as if, for, class or None. Python's style guide, PEP 8, recommends snake_case for variables (total_price) and UPPER_CASE for values meant to stay constant (MAX_RETRIES). Python does not enforce constants; the capitals are a promise to readers.\n\nAvoid names that hide built-in functions: list, str, sum, type, input, max and id are all real functions. If you write sum = 10, the sum() function is gone for the rest of that file, and the error appears far from the cause.\n\nYou can add optional type hints, such as age: int = 30. Editors and checkers like mypy use them to warn you, but Python itself ignores them when running.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "int vs float vs str",
        columns: [
          { title: "int", points: ["Whole numbers: 42, -7", "Exact, any size", "+ - * // % work", "int(\"42\") from text"] },
          { title: "float", points: ["Decimals: 3.14, 1e3", "Approximate, about 16 digits", "/ always returns a float", "float(\"3.5\") from text"] },
          { title: "str", points: ["Text: \"hi\", '42'", "+ joins, * repeats", "\"2\" + \"3\" is \"23\"", "str(42) from a number"] },
        ],
      },
      {
        type: "tree",
        title: "What bool(x) gives",
        root: "bool(x)",
        children: [
          { label: "False", children: ["0 and 0.0", "Empty string \"\"", "None", "Empty list, dict, tuple, set"] },
          { label: "True", children: ["Any other number, even -1", "Any non-empty string, even \"False\"", "Any non-empty collection"] },
        ],
      },
    ],
    examples: [
      {
        title: "Splitting a bill fairly",
        explanation: "Three friends share a 100.00 bill, and both numbers arrive as text, just like input() would give them. Step 1: convert the text with float() and int(). Step 2: divide; / gives a float with many digits because 100 / 3 has no exact decimal form. Step 3: round to cents for display. Step 4: notice that 3 x 33.33 is 99.99, so one cent is missing; real billing code works in whole cents (ints) and gives the leftover cent to one person.",
        code: {
          lang: "python",
          code: "total_text, people_text = \"100.00\", \"3\"\n\ntotal = float(total_text)\npeople = int(people_text)\nshare = total / people\nprint(share)               # 33.333333333333336\nprint(round(share, 2))     # 33.33\n\ncents = round(total * 100)          # 10000, an exact int\nbase, extra = divmod(cents, people) # 3333 each, 1 left over\nprint(base / 100, \"each, plus\", extra, \"cent for one person\")",
        },
      },
      {
        title: "Turning minutes into hours and minutes",
        explanation: "A timer gives you 135 minutes and you want to show \"2 h 15 min\". Step 1: // 60 gives the whole hours, 2. Step 2: % 60 gives what is left, 15. Step 3: divmod() does both at once. Step 4: notice that a negative number behaves differently because // rounds down, so check your inputs if negatives are possible. Step 5: str() or an f-string turns the numbers back into text.",
        code: {
          lang: "python",
          code: "minutes = 135\nhours = minutes // 60     # 2\nrest = minutes % 60       # 15\nprint(str(hours) + \" h \" + str(rest) + \" min\")\n\nhours, rest = divmod(minutes, 60)\nprint(f\"{hours} h {rest} min\")   # 2 h 15 min\n\nprint(-135 // 60, -135 % 60)     # -3 45  (rounds down!)\nprint(type(hours), type(minutes / 60))",
        },
      },
    ],
    cheatSheet: [
      "type(x) shows the type; isinstance(x, int) checks it (True for bools too)",
      "7 / 2 is 3.5, 7 // 2 is 3, 7 % 2 is 1; -7 // 2 is -4 because // rounds down",
      "int(3.9) is 3 and int(-3.9) is -3: int() drops the decimals toward zero",
      "round(2.5) is 2 and round(3.5) is 4: exact halves go to the even number",
      "bool(\"False\") is True: every non-empty string is truthy",
      "1_000_000 is the same int as 1000000; underscores only help reading",
      "Compare floats with math.isclose(a, b), never with ==",
      "a, b = b, a swaps two variables in one line",
    ],
    quiz: [
      {
        q: "What is the value of 7 // -2?",
        options: ["-3", "-4", "-3.5", "3"],
        answer: 1,
        why: "// rounds down toward minus infinity, and -3.5 rounded down is -4.",
      },
      {
        q: "What does bool(\"0\") return?",
        options: ["False", "0", "ValueError", "True"],
        answer: 3,
        why: "\"0\" is a non-empty string, and all non-empty strings are truthy.",
      },
      {
        q: "x = 10, then y = x, then x = x + 5. What is y now?",
        options: ["10", "15", "5", "It depends on the computer"],
        answer: 0,
        why: "x = x + 5 makes a new object and moves only the name x; y still points at 10.",
      },
      {
        q: "Which of these conversions raises ValueError?",
        options: ["int(\"  12 \")", "float(\"1e3\")", "int(\"12.5\")", "int(12.5)"],
        answer: 2,
        why: "int() only parses text that looks like a whole number; int(12.5) on a float works and gives 12.",
      },
      {
        q: "Why is 0.1 + 0.2 == 0.3 False in Python?",
        options: ["Python has a bug in addition", "Floats are stored in binary and 0.1 has no exact binary form", "== does not work on floats", "0.3 is stored as an int"],
        answer: 1,
        why: "Tiny binary rounding errors add up, which is why you compare floats with math.isclose().",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Set price = \"19.99\" and qty = \"3\" as strings, as if they came from a form. Convert them and print the total with exactly two decimals.",
        hint: "float() for the price, int() for the quantity, and :.2f inside an f-string.",
        solution: "price = \"19.99\"\nqty = \"3\"\ntotal = float(price) * int(qty)\nprint(f\"Total: {total:.2f}\")   # Total: 59.97",
      },
      {
        level: "medium",
        task: "Convert a number of seconds, such as 3725, into hours, minutes and seconds and print it as \"1 h 2 min 5 s\".",
        hint: "Take whole hours with // 3600, then work on the remainder with divmod(rest, 60).",
        solution: "seconds = 3725\nhours, rest = divmod(seconds, 3600)   # 1, 125\nminutes, secs = divmod(rest, 60)      # 2, 5\nprint(f\"{hours} h {minutes} min {secs} s\")",
      },
      {
        level: "hard",
        task: "Write to_bool(text) that turns \"yes\", \"y\", \"true\" and \"1\" (any case, extra spaces allowed) into True, \"no\", \"n\", \"false\" and \"0\" into False, and raises ValueError for anything else. Explain why bool(text) is not enough.",
        hint: "Normalise with strip() and lower(), then test membership with in.",
        solution: "def to_bool(text):\n    t = text.strip().lower()\n    if t in (\"yes\", \"y\", \"true\", \"1\"):\n        return True\n    if t in (\"no\", \"n\", \"false\", \"0\"):\n        return False\n    raise ValueError(f\"Not a yes/no value: {text!r}\")\n\nprint(to_bool(\" YES \"), to_bool(\"0\"))   # True False\n# bool(\"no\") is True, because any non-empty string is truthy.",
      },
    ],
    faq: [
      { q: "Is there a maximum size for an int in Python?", a: "No, ints grow as large as memory allows, so 2 to the power 1000 is exact. One safety limit exists: converting an int with more than 4300 digits to or from text raises ValueError by default." },
      { q: "Why don't I have to declare variable types in Python?", a: "Python is dynamically typed: the type belongs to the value, not the name, and is checked while the program runs. You can still add type hints like age: int = 30 for editors and checkers, but Python does not enforce them." },
      { q: "How should I store amounts of money?", a: "Floats can drift by tiny amounts, so avoid them for money. Store whole cents in an int, or use decimal.Decimal(\"19.99\"), created from a string rather than a float." },
      { q: "What is the difference between None, 0 and an empty string?", a: "0 is a number, \"\" is text with no characters, and None means no value at all. All three are falsy, but they are different types, so test for None with is None." },
    ],
  },

  "getting-started/strings-io": {
    plain: [
      "A string is text: a sequence of characters inside quotes. Single and double quotes mean exactly the same thing, so you can use one kind outside and the other inside, like 'She said \"hi\"'. Triple quotes (three double quotes) let a string run over several lines.",
      "Every character has a position number called an index, starting at 0. You can pick out one character, cut out a piece (a slice), or call methods, which are built-in actions such as upper(), replace() and split(). Strings never change after they are created; every method gives you back a new string.",
      "print() shows output on the screen. input() shows a prompt, waits for the user to type something and press Enter, and returns what they typed. It always returns a string, even when the user types digits, so you convert it before doing maths.",
      "f-strings are the modern way to put values into text. Put an f before the quotes and write any expression inside braces: f\"Total: {total}\". After a colon inside the braces you can control the look: number of decimals, width, alignment and thousands separators. One small f-string often replaces a lot of messy joining with +.",
    ],
    deepDive: [
      {
        heading: "Strings are immutable Unicode text",
        body: "Each character in a Python string is a Unicode code point, so any language works: len(\"café\") is 4 and len(\"日本\") is 2. ord(\"A\") gives the number 65 and chr(65) gives \"A\" back.\n\nStrings are immutable. s[0] = \"J\" raises TypeError. To change text, build a new string, for example \"J\" + s[1:], or s.replace(\"old\", \"new\"), and assign the result to a name. When you build a long string from many pieces in a loop, collect the pieces in a list and join them once at the end with \"\".join(parts). That is the clear, standard way and it stays fast for big inputs.\n\nA backslash starts an escape sequence: \\n is a new line, \\t a tab and \\\\ a real backslash. That is a trap with Windows paths, because \"C:\\new\" contains a newline. Use a raw string, r\"C:\\new\", or simply forward slashes, which Python accepts on Windows too.",
        bullets: [
          "len(s) counts characters, not bytes",
          "\"ab\" * 3 is \"ababab\"",
          "\"py\" in \"python\" is True",
        ],
      },
      {
        heading: "The string methods you will use every day",
        body: "Cleaning: strip() removes spaces and newlines from both ends; lstrip() and rstrip() do one side. lower() and upper() change case; casefold() is the stronger version for comparing text in any language.\n\nSplitting and joining: split() with no argument splits on any run of whitespace and drops empty pieces, which is what you want for words. split(\",\") splits on exactly that character and keeps empty fields, which matters for data. \", \".join(words) glues a list of strings back together.\n\nSearching: find(x) returns the index of x or -1 if it is missing; index(x) does the same but raises ValueError. count(x) counts non-overlapping matches. startswith() and endswith() accept a tuple, so name.endswith((\".jpg\", \".png\")) checks both. removeprefix() and removesuffix() (Python 3.9+) remove an exact piece only if it is there.\n\nTesting: isdigit(), isalpha() and isspace() return True or False for the whole string.",
        visual: {
          type: "compare",
          title: "split() vs split(\" \") on \" a  b \"",
          columns: [
            { title: "split()", points: ["Splits on any run of whitespace", "Ignores spaces at the ends", "Result: ['a', 'b']", "Best for words"] },
            { title: "split(\" \")", points: ["Splits on every single space", "Keeps empty pieces", "Result: ['', 'a', '', 'b', '']", "Use split(\",\") style for data"] },
          ],
        },
      },
      {
        heading: "f-string format specs, decoded",
        body: "Inside the braces of an f-string you write {value:spec}. The spec is a tiny language read from left to right. An optional fill character and an alignment sign come first: < left, > right, ^ center. Then a width, the minimum number of characters. Then a comma for thousands separators. Then a precision such as .2 and a type letter: f for fixed decimals, % for percent, e for scientific notation, d for whole numbers.\n\nSo f\"{1234.5:>10,.2f}\" gives \"  1,234.50\": right-aligned in 10 characters, with a comma and two decimals. f\"{7:03}\" gives \"007\" and f\"{0.256:.1%}\" gives \"25.6%\".\n\nTwo extras are very handy. f\"{x=}\" prints both the expression and its value, like x=5, which is perfect for quick debugging. !r shows a value's repr, so f\"{name!r}\" prints quotes and makes hidden spaces visible. From Python 3.12 you can reuse the same quote type inside the braces; on older versions use the other kind.",
        visual: {
          type: "flow",
          title: "Reading the spec in f\"{price:>10,.2f}\"",
          steps: [
            { label: "price", detail: "The expression to show" },
            { label: ">", detail: "Align right" },
            { label: "10", detail: "Use at least 10 characters" },
            { label: ",", detail: "Add thousands separators" },
            { label: ".2f", detail: "Fixed point with 2 decimals" },
          ],
        },
      },
      {
        heading: "print() and input() in more detail",
        body: "print() takes any number of values and turns each into text. sep sets what goes between them (a space by default) and end sets what goes after the last one (a newline by default). print(\"a\", \"b\", sep=\"-\") shows a-b, and print(\"Loading\", end=\"\") keeps the cursor on the same line. flush=True forces the text out immediately, which helps before a slow step.\n\ninput(prompt) prints the prompt, waits for Enter, removes the final newline and returns the rest as a str. If the input ends without a line, for example the user presses Ctrl+D or the program reads from an empty file, it raises EOFError. Ctrl+C raises KeyboardInterrupt.\n\nUsers type surprising things: spaces, empty lines, \"twelve\". Strip the text, check for the empty case, and wrap int() or float() in try/except ValueError inside a loop that asks again. A program that survives silly input feels professional.",
        visual: {
          type: "sequence",
          title: "One round of input() and print()",
          actors: ["Your code", "input()", "User"],
          messages: [
            { from: 0, to: 1, label: "input(\"Age: \")" },
            { from: 1, to: 2, label: "Shows Age: and waits" },
            { from: 2, to: 1, label: "Types \" 42\" and presses Enter" },
            { from: 1, to: 0, label: "Returns \" 42\" as a str" },
            { from: 0, to: 0, label: "int(\" 42\") gives 42" },
            { from: 0, to: 2, label: "print(f\"Next year: {age + 1}\")" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "String methods by job",
        root: "str methods",
        children: [
          { label: "Clean", children: ["strip()", "lower(), casefold()", "removeprefix()"] },
          { label: "Split and join", children: ["split()", "splitlines()", "\"sep\".join(list)"] },
          { label: "Search", children: ["find(), index()", "count()", "startswith(), endswith()"] },
          { label: "Change", children: ["replace()", "upper(), title()"] },
          { label: "Test", children: ["isdigit()", "isalpha()", "isspace()"] },
        ],
      },
      {
        type: "compare",
        title: "Three ways to put values into text",
        columns: [
          { title: "% formatting", points: ["\"Hi %s\" % name", "Oldest style", "Still seen in logging", "Easy to get wrong"] },
          { title: "str.format()", points: ["\"Hi {}\".format(name)", "Same spec language", "Good for reusable templates", "More typing"] },
          { title: "f-string", points: ["f\"Hi {name}\"", "Python 3.6+", "Expression right in place", "Use this by default"] },
        ],
      },
    ],
    examples: [
      {
        title: "Printing a receipt with aligned columns",
        explanation: "You want a tidy receipt instead of ragged text. Step 1: print a header using the same widths you will use for the rows. Step 2: for each item, compute the line total. Step 3: print the name left-aligned in 14 characters, the quantity right-aligned in 4 and the money right-aligned in 9 with two decimals. Step 4: print a separator with \"-\" * 27 and the grand total. Because every row uses the same specs, the columns line up perfectly.",
        code: {
          lang: "python",
          code: "items = [(\"Coffee\", 2, 3.5), (\"Bagel\", 1, 2.25), (\"Orange juice\", 3, 4.0)]\n\nprint(f\"{'Item':<14}{'Qty':>4}{'Total':>9}\")\ntotal = 0\nfor name, qty, price in items:\n    line = qty * price\n    total += line\n    print(f\"{name:<14}{qty:>4}{line:>9.2f}\")\nprint(\"-\" * 27)\nprint(f\"{'TOTAL':<18}{total:>9.2f}\")\n# Coffee           2     7.00\n# ...\n# TOTAL                 21.25",
        },
      },
      {
        title: "Cleaning up a name the user typed",
        explanation: "Users type \"  aDa   lovelace \" with odd spaces and casing. Step 1: split() breaks the text on any run of whitespace and drops the ends. Step 2: \" \".join() puts the words back with single spaces. Step 3: title() fixes the casing. Step 4: split(\" \", 1) splits once into first and last name. Step 5: take the first letter of each for initials. Note that a single-word name would make step 4 fail, so real code should check len(parts) first.",
        code: {
          lang: "python",
          code: "raw = input(\"Full name: \")             # \"  aDa   lovelace \"\nname = \" \".join(raw.split()).title()    # \"Ada Lovelace\"\nfirst, last = name.split(\" \", 1)\ninitials = first[0] + last[0]\n\nprint(f\"Hello, {first}! Your initials are {initials}.\")\nprint(f\"{raw!r} became {name!r}\")",
        },
      },
    ],
    cheatSheet: [
      "s.strip() trims spaces and newlines at both ends; s.split() splits on any run of whitespace",
      "\", \".join(words) glues a list of strings with \", \" between them",
      "s.find(x) returns -1 if x is missing; s.index(x) raises ValueError instead",
      "f\"{n:,}\" adds thousands separators; f\"{x:.1%}\" shows 0.256 as 25.6%",
      "f\"{name:<10}\" pads to 10 characters left-aligned; > aligns right and ^ centers",
      "f\"{x=}\" prints x=5, handy for quick debugging (Python 3.8+)",
      "print(a, b, sep=\", \", end=\"\") changes the separator and the line ending",
      "Raw strings like r\"C:\\new\" keep backslashes as typed (Windows paths, regex)",
    ],
    quiz: [
      {
        q: "What does \"banana\".find(\"x\") return?",
        options: ["None", "-1", "ValueError", "0"],
        answer: 1,
        why: "find() returns -1 when the text is missing; index() is the one that raises ValueError.",
      },
      {
        q: "What is \"a,,b\".split(\",\")?",
        options: ["['a', 'b']", "['a', ',', 'b']", "['a,,b']", "['a', '', 'b']"],
        answer: 3,
        why: "Splitting on an explicit separator keeps the empty field between the two commas.",
      },
      {
        q: "What does f\"{3.14159:.2f}\" produce?",
        options: ["3.14", "3.1", "3.14159", "3.15"],
        answer: 0,
        why: ".2f means fixed point with two digits after the decimal point.",
      },
      {
        q: "The user types 5 at x = input(). What is x * 2?",
        options: ["10", "TypeError", "\"55\", a string", "10.0"],
        answer: 2,
        why: "input() returns the string \"5\", and multiplying a string by 2 repeats it.",
      },
      {
        q: "s = \"hello\". What happens when you run s[0] = \"H\"?",
        options: ["s becomes \"Hello\"", "A new string is returned", "TypeError, because strings cannot be changed in place", "Nothing happens"],
        answer: 2,
        why: "Strings are immutable; build a new one with \"H\" + s[1:] instead.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given s = \"  Hello, World  \", print it stripped, then in lower case, then with the comma removed, and finally print how many letters o it contains.",
        hint: "strip(), lower(), replace(\",\", \"\") and count(\"o\").",
        solution: "s = \"  Hello, World  \"\nclean = s.strip()\nprint(clean)                    # Hello, World\nprint(clean.lower())            # hello, world\nprint(clean.replace(\",\", \"\"))   # Hello World\nprint(clean.count(\"o\"))         # 2",
      },
      {
        level: "medium",
        task: "Ask for some text and print whether it is a palindrome, ignoring case and spaces. \"Never odd or even\" should count as one.",
        hint: "Remove spaces with \"\".join(text.split()), lower it, and compare with its reverse s[::-1].",
        solution: "text = input(\"Text: \")\nclean = \"\".join(text.lower().split())\nif clean and clean == clean[::-1]:\n    print(\"Palindrome!\")\nelse:\n    print(\"Not a palindrome\")",
      },
      {
        level: "hard",
        task: "Build a calculator loop. It reads lines like 12 * 3.5, prints the result rounded to 4 decimals, survives bad numbers, unknown operators and division by zero, and stops when the user types q.",
        hint: "Map operator symbols to functions from the operator module, and catch ValueError, KeyError and ZeroDivisionError together.",
        solution: "import operator\nOPS = {\"+\": operator.add, \"-\": operator.sub, \"*\": operator.mul, \"/\": operator.truediv}\nwhile True:\n    line = input(\"> \").strip()\n    if line == \"q\":\n        break\n    try:\n        a, op, b = line.split()\n        result = OPS[op](float(a), float(b))\n    except (ValueError, KeyError, ZeroDivisionError):\n        print(\"Use: number operator number (and no dividing by zero)\")\n        continue\n    print(round(result, 4))",
      },
    ],
    faq: [
      { q: "Should I use single or double quotes in Python?", a: "They are identical. Pick one style for the project (the Black and Ruff formatters use double quotes) and switch only when it saves escaping, as in 'She said \"hi\"'." },
      { q: "How do I print without a new line?", a: "Pass end=\"\", as in print(\"Loading\", end=\"\"). Add flush=True if the text must appear immediately, for example before a slow step." },
      { q: "Why use f-strings instead of joining with +?", a: "f-strings convert values to text for you, so you avoid TypeError from mixing str and int, and they format numbers in the same place. They are also easier to read." },
      { q: "How do I read a number safely with input()?", a: "Call int() or float() inside try/except ValueError, in a loop that asks again until the conversion works. Strip the text first so checks like == \"q\" are not fooled by spaces." },
    ],
  },
};

export default extra;
