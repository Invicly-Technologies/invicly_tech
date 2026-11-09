import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────────────────── getting-started ─────────────────────────
  "getting-started/setup": {
    summary:
      "Python is a program that reads your code and runs it. You can type code into the interactive REPL to try ideas instantly, or save it in a .py file and run the whole script from the terminal or VS Code.",
    analogy: "The REPL is a calculator you chat with; a script is a recipe you hand over to cook start to finish.",
    visuals: [
      {
        type: "flow",
        title: "How Python runs a script",
        steps: [
          { label: "Write hello.py", detail: "Plain text file saved in your editor" },
          { label: "python hello.py", detail: "Terminal starts the interpreter with your file" },
          { label: "Parse & compile", detail: "Code is checked for syntax and turned into bytecode" },
          { label: "Interpreter executes", detail: "Bytecode runs top to bottom, one statement at a time" },
          { label: "Output or error", detail: "print() shows text; a bug shows a traceback" },
        ],
      },
      {
        type: "compare",
        title: "REPL vs script",
        columns: [
          {
            title: "REPL (>>>)",
            points: ["Start with python or py", "Runs each line immediately", "Echoes expression results", "Lost when you exit"],
          },
          {
            title: "Script (.py file)",
            points: ["Run with python file.py", "Runs the whole file in order", "Only print() shows output", "Saved and reusable"],
          },
        ],
      },
    ],
    keyPoints: [
      "Install Python 3 and confirm it with python --version (or py --version on Windows).",
      "Use the REPL to test small expressions; exit with exit() or Ctrl+D.",
      "Save real programs in .py files and run them from the terminal.",
      "VS Code with the Python extension gives highlighting, linting and a Run button.",
    ],
    terms: [
      { term: "Interpreter", meaning: "The program that reads and executes Python code." },
      { term: "REPL", meaning: "Read-Eval-Print Loop: an interactive Python prompt." },
      { term: "Script", meaning: "A .py file run from start to finish." },
      { term: "Terminal", meaning: "A text window where you type commands." },
      { term: "Bytecode", meaning: "Low-level instructions Python compiles your code into before running." },
    ],
    example: {
      lang: "python",
      code: "# hello.py\nname = \"Ada\"\nprint(\"Hello,\", name)\nprint(2 + 3 * 4)\n\n# In the terminal:\n# $ python hello.py\n# Hello, Ada\n# 14",
      caption: "Save as hello.py, then run it from the folder that contains it.",
    },
    pitfalls: [
      "Running python from a different folder than the file, causing 'No such file' errors.",
      "Typing terminal commands like python hello.py inside the REPL instead of the shell.",
      "Having several Python versions and installing packages into the wrong one.",
    ],
    check: [
      { q: "What is the difference between the REPL and a script?", a: "The REPL runs each line as you type it; a script is a saved file run all at once." },
      { q: "How do you check which Python version is installed?", a: "Run python --version (or python3 --version, or py --version on Windows) in a terminal." },
    ],
  },

  "getting-started/values-types": {
    summary:
      "Every value in Python has a type, such as int, float, str or bool. A variable is just a name that points to a value, and you can point it at a new value at any time.",
    analogy: "A variable is a sticky note with a name; you can peel it off and stick it on a different value.",
    visuals: [
      {
        type: "tree",
        title: "Basic built-in types",
        root: "Python values",
        children: [
          { label: "Numbers", children: ["int: 42, -7", "float: 3.14, 0.5"] },
          { label: "Text", children: ["str: \"hello\""] },
          { label: "Truth", children: ["bool: True, False"] },
          { label: "Nothing", children: ["NoneType: None"] },
        ],
      },
      {
        type: "flow",
        title: "Converting a typed-in number",
        steps: [
          { label: "\"42\" (str)", detail: "Text, e.g. from input() or a file" },
          { label: "int(\"42\")", detail: "Parse the text as a whole number" },
          { label: "42 (int)", detail: "Now you can do arithmetic with it" },
          { label: "str(42)", detail: "Turn it back into text for output" },
        ],
      },
    ],
    keyPoints: [
      "Assignment uses = and creates or rebinds a name: x = 5 then x = x + 1.",
      "type(value) tells you a value's type; Python is dynamically typed.",
      "Use int(), float(), str() and bool() to convert between types.",
      "/ always gives a float; // is floor division and % is the remainder.",
      "Floats are approximate: 0.1 + 0.2 is 0.30000000000000004.",
    ],
    terms: [
      { term: "Variable", meaning: "A name bound to a value." },
      { term: "int", meaning: "Whole number of any size." },
      { term: "float", meaning: "Number with a decimal point, stored approximately." },
      { term: "str", meaning: "Text: a sequence of characters in quotes." },
      { term: "bool", meaning: "True or False." },
      { term: "Type conversion", meaning: "Making a new value of another type, like int(\"7\")." },
    ],
    example: {
      lang: "python",
      code: "age = 30\nprice = 9.99\nname = \"Sam\"\nis_member = True\n\nprint(type(age), type(price))  # <class 'int'> <class 'float'>\nprint(7 / 2, 7 // 2, 7 % 2)    # 3.5 3 1\n\ntext = \"42\"\nnumber = int(text) + 1\nprint(number)                  # 43\nprint(\"Age: \" + str(age))      # Age: 30",
    },
    pitfalls: [
      "Adding a str and an int (\"Age: \" + 30) raises TypeError; convert with str() first.",
      "int(\"3.5\") fails with ValueError; use float() first, or int() on a float to truncate.",
      "Comparing floats with == after arithmetic; use round() or math.isclose().",
    ],
    check: [
      { q: "What does type(3 / 1) return?", a: "float, because the / operator always produces a float, even for whole results." },
      { q: "How do you turn the string \"12\" into a number you can add to?", a: "Call int(\"12\") for a whole number or float(\"12\") for a decimal." },
      { q: "What happens to a variable when you assign it a new value?", a: "The name is simply rebound to the new value; the old value is discarded if nothing else uses it." },
    ],
  },

  "getting-started/strings-io": {
    summary:
      "Strings are sequences of characters you can index, slice and transform with methods. input() reads a line the user types, and print() with f-strings shows results neatly formatted.",
    visuals: [
      {
        type: "flow",
        title: "A tiny interactive program",
        steps: [
          { label: "input() prompt", detail: "User types text and presses Enter" },
          { label: "Get a str", detail: "input() always returns a string" },
          { label: "Clean & convert", detail: "strip() spaces, then float() or int()" },
          { label: "Compute", detail: "Do the calculation with real numbers" },
          { label: "print(f\"...\")", detail: "Format the result inside an f-string" },
        ],
      },
      {
        type: "compare",
        title: "Indexing vs slicing \"Python\"",
        columns: [
          { title: "Indexing s[i]", points: ["s[0] is \"P\"", "s[-1] is \"n\"", "Returns one character", "Out of range raises IndexError"] },
          { title: "Slicing s[a:b]", points: ["s[0:2] is \"Py\"", "Stop index is excluded", "s[::-1] reverses: \"nohtyP\"", "Out of range is safe"] },
        ],
      },
    ],
    keyPoints: [
      "Strings are immutable: methods like upper() return a new string.",
      "Indexes start at 0; negative indexes count from the end.",
      "f-strings embed expressions: f\"{total:.2f}\" shows two decimal places.",
      "input() always returns a str, so convert it before doing maths.",
    ],
    terms: [
      { term: "Index", meaning: "Position of a character, starting at 0." },
      { term: "Slice", meaning: "A sub-string taken with s[start:stop:step]." },
      { term: "Method", meaning: "A function attached to a value, called as s.lower()." },
      { term: "f-string", meaning: "A string prefixed with f that fills in {expressions}." },
      { term: "input()", meaning: "Reads one line from the keyboard as a string." },
    ],
    example: {
      lang: "python",
      code: "word = \"Python\"\nprint(word[0], word[-1], word[1:4])  # P n yth\nprint(word.upper(), word.lower())\n\na = float(input(\"First number: \"))\nb = float(input(\"Second number: \"))\nop = input(\"Operator (+ - * /): \").strip()\n\nif op == \"+\":\n    result = a + b\nelif op == \"-\":\n    result = a - b\nelse:\n    result = a * b if op == \"*\" else a / b\nprint(f\"{a} {op} {b} = {result:.2f}\")",
      caption: "A minimal calculator: read, convert, compute, format.",
    },
    pitfalls: [
      "Forgetting that input() returns text, so \"2\" + \"3\" gives \"23\".",
      "Expecting s.upper() to change s in place; strings never change.",
      "Forgetting the f prefix, so {name} prints literally.",
    ],
    check: [
      { q: "What does \"hello\"[1:3] return?", a: "\"el\" — the slice starts at index 1 and stops before index 3." },
      { q: "Why does int(input()) sometimes crash?", a: "If the user types something that is not a whole number, int() raises ValueError." },
    ],
  },

  // ───────────────────────── control-flow ─────────────────────────
  "control-flow/conditionals": {
    summary:
      "Conditionals let a program choose what to do. Python checks if, then each elif, top to bottom, and runs only the first branch whose condition is true; else catches everything left.",
    visuals: [
      {
        type: "flow",
        title: "How if / elif / else is checked",
        steps: [
          { label: "Check if", detail: "True? Run this block and skip the rest" },
          { label: "Check each elif", detail: "Only reached when every earlier test was False" },
          { label: "Fall to else", detail: "Runs when no condition matched" },
          { label: "Continue after", detail: "Exactly one branch ran, or none without else" },
        ],
      },
    ],
    keyPoints: [
      "Only the first true branch runs, so order conditions from most specific to least.",
      "Combine tests with and, or, not; chain comparisons like 0 <= x < 10.",
      "Use in to test membership: if color in (\"red\", \"green\").",
      "Empty strings, 0, None and empty collections are falsy; most other values are truthy.",
    ],
    terms: [
      { term: "Condition", meaning: "An expression evaluated as True or False." },
      { term: "elif", meaning: "\"else if\": another test tried only if earlier ones failed." },
      { term: "Boolean operators", meaning: "and, or, not for combining conditions." },
      { term: "Truthy / falsy", meaning: "How non-bool values behave in an if test." },
      { term: "Short-circuit", meaning: "and/or stop evaluating once the result is known." },
    ],
    example: {
      lang: "python",
      code: "score = 72\n\nif score >= 90:\n    grade = \"A\"\nelif score >= 75:   # no need to also check score < 90\n    grade = \"B\"\nelif score >= 60:\n    grade = \"C\"\nelse:\n    grade = \"F\"\nprint(grade)  # C\n\nname = \"\"\nif not name:\n    print(\"Name is empty\")",
    },
    pitfalls: [
      "Writing if x == 1 or 2 — it is always true; write x == 1 or x == 2, or x in (1, 2).",
      "Using = (assignment) where you meant == (comparison).",
      "Repeating checks an earlier branch already ruled out.",
    ],
    check: [
      { q: "If two elif conditions are both true, which runs?", a: "Only the first one in order; Python skips the rest once a branch runs." },
      { q: "Is the empty list [] truthy or falsy?", a: "Falsy, so if items: is False when the list is empty." },
    ],
  },

  "control-flow/loops": {
    summary:
      "Loops repeat work. A for loop walks through each item of a sequence or range; a while loop repeats as long as a condition stays true. break stops a loop early and continue skips to the next round.",
    visuals: [
      {
        type: "cycle",
        title: "One for-loop iteration",
        steps: [
          { label: "Ask for next item", detail: "The loop pulls the next value from the iterable" },
          { label: "Bind loop variable", detail: "for item in ... assigns it to item" },
          { label: "Run the body", detail: "continue jumps back, break exits entirely" },
          { label: "Repeat or stop", detail: "No items left? The loop ends" },
        ],
      },
      {
        type: "compare",
        title: "for vs while",
        columns: [
          { title: "for", points: ["Walks a known collection", "Stops automatically at the end", "Great with range(), enumerate()", "Hard to loop forever by mistake"] },
          { title: "while", points: ["Repeats while a condition holds", "You must update the condition", "Good for unknown repeat counts", "Easy to create infinite loops"] },
        ],
      },
    ],
    keyPoints: [
      "range(start, stop, step) excludes stop: range(3) gives 0, 1, 2.",
      "enumerate(items) gives (index, item) pairs; zip(a, b) pairs items from two lists.",
      "break leaves the loop immediately; continue skips the rest of this iteration.",
      "Every while loop needs something inside that eventually makes its condition False.",
    ],
    terms: [
      { term: "Iteration", meaning: "One pass through the loop body." },
      { term: "Iterable", meaning: "Anything a for loop can walk: list, str, range, dict." },
      { term: "range()", meaning: "Produces a sequence of integers on demand." },
      { term: "break / continue", meaning: "Exit the loop / skip to the next iteration." },
      { term: "enumerate()", meaning: "Adds a counter to each item while looping." },
    ],
    example: {
      lang: "python",
      code: "fruits = [\"apple\", \"banana\", \"cherry\"]\nfor i, fruit in enumerate(fruits, start=1):\n    print(i, fruit)\n\nfor n in range(10):\n    if n % 2 == 0:\n        continue      # skip even numbers\n    if n > 7:\n        break         # stop at 9\n    print(n)          # 1 3 5 7\n\ncount = 3\nwhile count > 0:\n    print(\"T-minus\", count)\n    count -= 1",
    },
    pitfalls: [
      "Forgetting to change the variable a while loop tests, causing an infinite loop.",
      "Off-by-one errors: range(1, 10) stops at 9, not 10.",
      "Adding or removing items from a list while looping over it.",
    ],
    check: [
      { q: "What numbers does range(2, 8, 2) produce?", a: "2, 4 and 6 — the stop value 8 is excluded." },
      { q: "What is the difference between break and continue?", a: "break ends the whole loop; continue skips only the rest of the current iteration." },
      { q: "When is a while loop a better fit than for?", a: "When you do not know in advance how many repetitions you need, such as retrying until input is valid." },
    ],
  },

  "control-flow/functions": {
    summary:
      "A function is a named, reusable block of code. You define it once with def, call it with arguments, and it hands a value back with return. Small functions make programs easier to read, test and change.",
    analogy: "A function is like a vending machine: put in inputs, press the button, get one result back.",
    visuals: [
      {
        type: "sequence",
        title: "Calling a function",
        actors: ["Caller", "area()", "round()"],
        messages: [
          { from: 0, to: 1, label: "area(3, 4.5)" },
          { from: 1, to: 1, label: "width=3, height=4.5" },
          { from: 1, to: 2, label: "round(13.5)" },
          { from: 2, to: 1, label: "returns 14" },
          { from: 1, to: 0, label: "return 14" },
        ],
      },
    ],
    keyPoints: [
      "Define with def name(params): and send a result back with return.",
      "A function without return gives back None.",
      "Default values make parameters optional; keyword arguments make calls readable.",
      "*args collects extra positional arguments; **kwargs collects extra keyword arguments.",
      "Write a docstring as the first line to explain what the function does.",
    ],
    terms: [
      { term: "Parameter", meaning: "A name in the def line that receives a value." },
      { term: "Argument", meaning: "The actual value passed when calling." },
      { term: "Return value", meaning: "The result a function hands back to its caller." },
      { term: "Default argument", meaning: "A parameter value used when the caller omits it." },
      { term: "Keyword argument", meaning: "An argument passed by name, like greet(name=\"Ana\")." },
      { term: "Docstring", meaning: "A string right after def that documents the function." },
    ],
    example: {
      lang: "python",
      code: "def greet(name, greeting=\"Hello\"):\n    \"\"\"Return a friendly greeting.\"\"\"\n    return f\"{greeting}, {name}!\"\n\nprint(greet(\"Ana\"))                  # Hello, Ana!\nprint(greet(\"Bo\", greeting=\"Hi\"))    # Hi, Bo!\n\ndef total(*prices, tax=0.0):\n    return sum(prices) * (1 + tax)\n\ndef show(**info):\n    print(info)\n\nprint(total(10, 20, 5, tax=0.2))     # 42.0\nshow(city=\"Pune\", year=2026)         # {'city': 'Pune', 'year': 2026}",
    },
    pitfalls: [
      "Printing a result inside the function instead of returning it, so callers get None.",
      "Forgetting the parentheses: greet refers to the function, greet() calls it.",
      "Writing one huge function instead of several small, named steps.",
    ],
    check: [
      { q: "What does a function return if it has no return statement?", a: "None." },
      { q: "Why use keyword arguments when calling?", a: "They make the call self-explaining and let you skip or reorder optional parameters." },
    ],
  },

  "control-flow/scope": {
    summary:
      "Scope decides which variable a name refers to. Python looks up names Local first, then Enclosing, Global and finally Built-in. Pure functions only use their inputs and return outputs, so they are easy to predict and test.",
    visuals: [
      {
        type: "layers",
        title: "Name lookup order (LEGB)",
        layers: [
          { label: "Local", detail: "Names assigned inside the current function" },
          { label: "Enclosing", detail: "Names in any outer function, for nested functions" },
          { label: "Global", detail: "Names assigned at the top level of the module" },
          { label: "Built-in", detail: "Python's own names like print, len, range" },
        ],
      },
      {
        type: "compare",
        title: "Impure vs pure function",
        columns: [
          { title: "Impure", points: ["Reads or changes globals", "Same input, different results", "Hidden side effects", "Hard to test alone"] },
          { title: "Pure", points: ["Uses only its parameters", "Same input, same output", "Returns a new value", "Trivial to test"] },
        ],
      },
    ],
    keyPoints: [
      "Assigning to a name inside a function makes it local to that function.",
      "Reading a global works, but reassigning one needs the global keyword — avoid that.",
      "None means \"no value\"; check it with is None, not == None.",
      "Pass data in as arguments and return results instead of sharing global state.",
    ],
    terms: [
      { term: "Scope", meaning: "The region of code where a name is visible." },
      { term: "Local variable", meaning: "A name created inside a function, gone when it returns." },
      { term: "Global variable", meaning: "A name defined at module level." },
      { term: "None", meaning: "Python's single \"nothing here\" value." },
      { term: "Pure function", meaning: "Output depends only on inputs, with no side effects." },
    ],
    example: {
      lang: "python",
      code: "total = 0  # global state\n\ndef add_impure(x):\n    global total\n    total += x          # hidden side effect\n\ndef add_pure(current, x):\n    return current + x  # no side effects\n\nrunning = add_pure(0, 5)\nrunning = add_pure(running, 3)\nprint(running)          # 8\n\nresult = print(\"hi\")\nprint(result is None)   # True: print returns None",
    },
    pitfalls: [
      "UnboundLocalError: reading a name before assigning it in the same function.",
      "Using global to share data between functions instead of passing arguments.",
      "Shadowing built-ins, e.g. naming a variable list or sum.",
    ],
    check: [
      { q: "In what order does Python look up a name?", a: "Local, Enclosing, Global, then Built-in (LEGB)." },
      { q: "What makes a function pure?", a: "It depends only on its arguments, changes nothing outside itself, and always returns the same output for the same input." },
    ],
  },

  "control-flow/match": {
    summary:
      "match/case (Python 3.10+) compares one value against a list of patterns and runs the first that fits. It can match literals, unpack tuples and check object types, often replacing long if/elif chains.",
    visuals: [
      {
        type: "flow",
        title: "How match tries each case",
        steps: [
          { label: "Evaluate subject", detail: "match command: computes the value once" },
          { label: "Try case 1", detail: "Pattern fits? Bind names and run its block" },
          { label: "Try next case", detail: "Only if earlier patterns did not fit" },
          { label: "case _", detail: "Wildcard: matches anything left over" },
          { label: "Done", detail: "At most one case block runs" },
        ],
      },
    ],
    keyPoints: [
      "Cases are tried top to bottom; the first matching pattern wins.",
      "case (x, y): unpacks a 2-item sequence and binds x and y.",
      "case _: is the catch-all, like else.",
      "Combine options with |, and add conditions with a guard: case n if n < 0.",
    ],
    terms: [
      { term: "Subject", meaning: "The value after match that cases are compared to." },
      { term: "Literal pattern", meaning: "Matches an exact value like 200 or \"quit\"." },
      { term: "Capture pattern", meaning: "A bare name that matches anything and binds it." },
      { term: "Wildcard", meaning: "_ matches anything without binding." },
      { term: "Guard", meaning: "An if clause that must also be true for the case." },
    ],
    example: {
      lang: "python",
      code: "def handle(command):\n    match command.split():\n        case [\"quit\"]:\n            return \"Bye\"\n        case [\"go\", direction]:\n            return f\"Going {direction}\"\n        case [\"add\", x, y]:\n            return int(x) + int(y)\n        case _:\n            return \"Unknown command\"\n\nprint(handle(\"go north\"))  # Going north\nprint(handle(\"add 2 3\"))   # 5\nprint(handle(\"dance\"))     # Unknown command",
    },
    pitfalls: [
      "case RED: with a bare name captures anything; use a dotted name like Color.RED.",
      "Using match on Python older than 3.10, which gives a SyntaxError.",
      "Rewriting simple two-branch ifs as match where if is clearer.",
    ],
    check: [
      { q: "What does case _: do?", a: "It matches any value that no earlier case matched, like a final else." },
      { q: "Why is case status: dangerous when status is meant to be a constant?", a: "A bare name is a capture pattern, so it matches everything and rebinds the name." },
    ],
  },

  // ───────────────────────── data-structures ─────────────────────────
  "data-structures/lists-tuples": {
    summary:
      "Lists hold an ordered, changeable sequence of items; tuples hold an ordered, fixed record. Both support indexing, slicing and unpacking, and sorted() can order any sequence by a key you choose.",
    visuals: [
      {
        type: "compare",
        title: "list vs tuple vs set",
        columns: [
          { title: "list [1, 2, 2]", points: ["Ordered, allows duplicates", "Mutable: append, remove, sort", "For collections that grow", "Index and slice"] },
          { title: "tuple (1, 2, 2)", points: ["Ordered, allows duplicates", "Immutable once created", "For fixed records like (x, y)", "Can be a dict key"] },
          { title: "set {1, 2}", points: ["Unordered, no duplicates", "Mutable: add, discard", "Fast membership tests", "No indexing"] },
        ],
      },
    ],
    keyPoints: [
      "items[1:3] slices; items[-1] is the last item.",
      "append() adds one item, insert(i, x) adds at a position, remove(x) deletes by value.",
      "sorted(items) returns a new list; items.sort() sorts in place and returns None.",
      "Pass key= to sort by something else, e.g. sorted(words, key=len).",
      "Unpack tuples directly: name, age = (\"Ana\", 31).",
    ],
    terms: [
      { term: "List", meaning: "Mutable ordered sequence written with square brackets." },
      { term: "Tuple", meaning: "Immutable ordered sequence written with parentheses." },
      { term: "Slice", meaning: "A sub-sequence taken with [start:stop:step]." },
      { term: "Key function", meaning: "A function sorted() calls on each item to compare them." },
      { term: "Unpacking", meaning: "Assigning a sequence's items to several names at once." },
    ],
    example: {
      lang: "python",
      code: "nums = [5, 2, 9, 1]\nnums.append(7)\nnums.insert(0, 10)\nnums.remove(9)\nprint(nums, nums[1:3], nums[-1])  # [10, 5, 2, 1, 7] [5, 2] 7\n\nprint(sorted(nums))               # [1, 2, 5, 7, 10]\nprint(sorted(nums, reverse=True))\n\npeople = [(\"Ana\", 31), (\"Bo\", 25), (\"Cy\", 40)]\nby_age = sorted(people, key=lambda p: p[1])\nprint(by_age[0])                  # ('Bo', 25)\n\nname, age = people[0]\nprint(name, age)                  # Ana 31",
    },
    pitfalls: [
      "Writing nums = nums.sort(), which sets nums to None.",
      "Forgetting the comma in a one-item tuple: (5,) not (5).",
      "Using a list where a set would make membership checks much faster.",
    ],
    check: [
      { q: "When should you choose a tuple over a list?", a: "For a fixed record whose items should not change, like coordinates or a (name, age) pair." },
      { q: "What is the difference between sorted(x) and x.sort()?", a: "sorted(x) returns a new sorted list; x.sort() sorts the list in place and returns None." },
    ],
  },

  "data-structures/dicts-sets": {
    summary:
      "A dict maps keys to values for instant lookup, which makes it ideal for counting and grouping. A set stores unique items and answers \"is this in here?\" quickly, plus union and intersection.",
    analogy: "A dict is a phone book: look up a name, get a number, without reading every page.",
    visuals: [
      {
        type: "flow",
        title: "How a dict lookup stays fast",
        steps: [
          { label: "ages[\"Ana\"]", detail: "You ask for a key" },
          { label: "hash(\"Ana\")", detail: "Key is turned into a number" },
          { label: "Jump to slot", detail: "The number points straight to a storage slot" },
          { label: "Confirm key", detail: "Check the stored key really equals \"Ana\"" },
          { label: "Return value", detail: "Missing key raises KeyError instead" },
        ],
      },
    ],
    keyPoints: [
      "Use d.get(key, default) to avoid KeyError when a key might be missing.",
      "Loop with for key, value in d.items() to get both at once.",
      "Count with counts[x] = counts.get(x, 0) + 1.",
      "set(items) removes duplicates; | is union, & is intersection, - is difference.",
      "Dict keys and set items must be hashable, e.g. str, int or tuple.",
    ],
    terms: [
      { term: "Dictionary", meaning: "Mapping of unique keys to values." },
      { term: "Key", meaning: "The lookup label; must be hashable and unique." },
      { term: "Set", meaning: "Unordered collection of unique items." },
      { term: "Hashable", meaning: "Has a fixed hash value; immutable types usually are." },
      { term: "items()", meaning: "View of (key, value) pairs in a dict." },
    ],
    example: {
      lang: "python",
      code: "words = \"the cat and the hat and the bat\".split()\n\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(counts[\"the\"])          # 3\n\nby_letter = {}\nfor w in words:\n    by_letter.setdefault(w[0], []).append(w)\nprint(by_letter[\"t\"])         # ['the', 'the', 'the']\nunique = set(words)\nrhymes = {\"cat\", \"hat\", \"mat\"}\nprint(unique & rhymes)        # {'cat', 'hat'}\nprint(len(unique))            # 5",
    },
    pitfalls: [
      "Reading d[key] for a key that may not exist; use get() or check with in.",
      "Expecting a set to keep insertion order or allow indexing.",
      "Writing {} for an empty set — that is an empty dict; use set().",
    ],
    check: [
      { q: "Why is looking up a key in a dict faster than searching a list?", a: "The dict hashes the key and jumps straight to its slot instead of scanning every item." },
      { q: "How do you get the unique values of a list?", a: "Convert it to a set with set(my_list)." },
    ],
  },

  "data-structures/comprehensions": {
    summary:
      "A comprehension builds a list, dict or set in a single readable expression: loop over a source, optionally filter, and transform each item. It replaces the common create-empty-then-append pattern.",
    visuals: [
      {
        type: "flow",
        title: "[x * x for x in nums if x > 0]",
        steps: [
          { label: "for x in nums", detail: "Take each item from the source" },
          { label: "if x > 0", detail: "Optional filter: skip items that fail" },
          { label: "x * x", detail: "Transform the item that passed" },
          { label: "Collect", detail: "Add result to the new list, dict or set" },
        ],
      },
    ],
    keyPoints: [
      "List: [expr for item in source if condition].",
      "Dict: {key: value for item in source}; set: {expr for item in source}.",
      "The result is always a brand-new collection; the source is unchanged.",
      "If it needs several statements or nested logic, a plain loop is clearer.",
    ],
    terms: [
      { term: "List comprehension", meaning: "Builds a list in one expression with square brackets." },
      { term: "Dict comprehension", meaning: "Builds a dict from key: value expressions." },
      { term: "Set comprehension", meaning: "Builds a set, so duplicates are dropped." },
      { term: "Filter clause", meaning: "The trailing if that keeps only some items." },
    ],
    example: {
      lang: "python",
      code: "nums = [3, -1, 4, -5, 9]\n\n# loop version\nsquares = []\nfor x in nums:\n    if x > 0:\n        squares.append(x * x)\n\n# comprehension version\nsquares = [x * x for x in nums if x > 0]   # [9, 16, 81]\n\nnames = [\"ana\", \"bo\", \"cy\"]\nlengths = {n: len(n) for n in names}       # {'ana': 3, 'bo': 2, 'cy': 2}\nfirst_letters = {n[0] for n in names}      # {'a', 'b', 'c'}\nprint(squares, lengths, first_letters)",
    },
    pitfalls: [
      "Cramming nested loops and conditions into one unreadable line.",
      "Using a comprehension only for side effects like print(); use a loop.",
      "Putting if/else in the wrong place: [a if c else b for x in xs] transforms, it does not filter.",
    ],
    check: [
      { q: "Rewrite as a comprehension: result = []; for w in words: result.append(w.upper())", a: "result = [w.upper() for w in words]" },
      { q: "When should you prefer a normal loop?", a: "When the logic needs several steps, side effects or nesting that would make one line hard to read." },
    ],
  },

  "data-structures/mutability": {
    summary:
      "Variables hold references to objects, not copies. If two names point to the same mutable list, changing it through one name changes what the other sees. Copies give you an independent object when you need one.",
    analogy: "Two names for one list are like two keys to the same house: rearrange the furniture and both see it.",
    visuals: [
      {
        type: "compare",
        title: "Mutable vs immutable",
        columns: [
          { title: "Mutable", points: ["list, dict, set", "Can change in place", "Changes visible via every alias", "Not usable as dict keys"] },
          { title: "Immutable", points: ["int, float, str, tuple", "Operations create new objects", "Safe to share between names", "Hashable, usable as keys"] },
        ],
      },
      {
        type: "compare",
        title: "Alias vs shallow vs deep copy",
        columns: [
          { title: "b = a", points: ["Same object, two names", "a is b is True", "Every change is shared"] },
          { title: "copy.copy(a)", points: ["New outer list", "Inner objects still shared", "Same as a[:] or list(a)"] },
          { title: "copy.deepcopy(a)", points: ["Copies everything recursively", "Fully independent", "Slower for big data"] },
        ],
      },
    ],
    keyPoints: [
      "Assignment never copies; it just adds another name for the same object.",
      "== compares values; is checks whether two names point to the same object.",
      "A shallow copy duplicates only the outer container.",
      "Never use a mutable default like def f(items=[]); use None and create inside.",
    ],
    terms: [
      { term: "Reference", meaning: "A pointer from a name to an object in memory." },
      { term: "Aliasing", meaning: "Two names referring to the same object." },
      { term: "Mutable", meaning: "Can be changed after creation." },
      { term: "Shallow copy", meaning: "New container whose items are the same objects." },
      { term: "Deep copy", meaning: "Recursive copy of the container and everything inside." },
    ],
    example: {
      lang: "python",
      code: "import copy\n\na = [[1, 2], [3]]\nb = a                   # alias\nc = copy.copy(a)        # shallow\nd = copy.deepcopy(a)    # deep\n\na[0].append(99)\nprint(b[0], c[0], d[0])  # [1, 2, 99] [1, 2, 99] [1, 2]\n\ndef add_item(item, items=None):\n    if items is None:\n        items = []      # fresh list each call\n    items.append(item)\n    return items",
    },
    pitfalls: [
      "Mutable default arguments: the same list is reused across every call.",
      "Expecting list.copy() to copy nested lists too.",
      "Building a grid with [[0] * 3] * 3, which repeats one inner list three times.",
    ],
    check: [
      { q: "After b = a; b.append(1), does a change?", a: "Yes, if a is a list: a and b are the same object." },
      { q: "Why is def f(x=[]) a bug?", a: "The default list is created once and shared by every call, so items pile up between calls." },
    ],
  },

  "data-structures/ds-practice": {
    summary:
      "Practice turns syntax into skill. Each small problem follows the same loop: understand the input and output, plan with the right data structure, code it, then test normal and edge cases.",
    visuals: [
      {
        type: "cycle",
        title: "Solving one exercise",
        steps: [
          { label: "Restate the problem", detail: "Write the input, output and one example" },
          { label: "Pick a structure", detail: "List to keep order, dict to count, set for uniques" },
          { label: "Write the code", detail: "Small function with a clear name" },
          { label: "Test edge cases", detail: "Empty input, one item, duplicates, odd casing" },
          { label: "Refine", detail: "Simplify, rename, then try the next exercise" },
        ],
      },
    ],
    keyPoints: [
      "Most beginner problems are filter, count, group or transform.",
      "Wrap each solution in a function so you can call it with test inputs.",
      "Always try the empty input and a single-item input.",
      "Struggle for 15 minutes before peeking at hints; that effort builds memory.",
    ],
    terms: [
      { term: "Edge case", meaning: "Unusual input like empty, huge or duplicate data." },
      { term: "Filtering", meaning: "Keeping only the items that pass a test." },
      { term: "Grouping", meaning: "Collecting items under a shared key in a dict." },
      { term: "assert", meaning: "Statement that raises an error if a condition is false." },
    ],
    example: {
      lang: "python",
      code: "def group_by_length(words):\n    \"\"\"Group words by their length.\"\"\"\n    groups = {}\n    for w in words:\n        groups.setdefault(len(w), []).append(w)\n    return groups\n\nassert group_by_length([]) == {}\nassert group_by_length([\"a\"]) == {1: [\"a\"]}\nassert group_by_length([\"hi\", \"yo\", \"cat\"]) == {2: [\"hi\", \"yo\"], 3: [\"cat\"]}\nprint(\"all good\")",
      caption: "Write a few asserts for edge cases before calling it done.",
    },
    pitfalls: [
      "Testing only the happy path from the problem statement.",
      "Copying a solution without retyping and understanding it.",
      "Using index-based loops where a direct for item in items is simpler.",
    ],
    check: [
      { q: "Which structure fits \"count how often each word appears\"?", a: "A dict mapping each word to its count (or collections.Counter)." },
      { q: "Name two edge cases worth testing for most list problems.", a: "An empty list and a list with only one item; duplicates are a good third." },
    ],
  },

  // ───────────────────────── files-modules ─────────────────────────
  "files-modules/files": {
    summary:
      "pathlib.Path represents file paths as objects that work on every OS. Opening files inside a with-block guarantees they are closed, even if an error happens while reading or writing.",
    visuals: [
      {
        type: "flow",
        title: "Safe file processing",
        steps: [
          { label: "Build a Path", detail: "Path(\"data\") / \"notes.txt\" joins parts safely" },
          { label: "Open in with-block", detail: "Mode \"r\" read, \"w\" overwrite, \"a\" append" },
          { label: "Read line by line", detail: "for line in f keeps memory use low" },
          { label: "Process & write", detail: "Write results to another file" },
          { label: "Auto close", detail: "Leaving the with-block closes the file" },
        ],
      },
    ],
    keyPoints: [
      "Use the / operator to join paths instead of gluing strings with slashes.",
      "Always pass encoding=\"utf-8\" when reading or writing text.",
      "Mode \"w\" erases the file first; use \"a\" to add to the end.",
      "path.read_text() is fine for small files; loop over lines for big ones.",
      "folder.glob(\"*.csv\") lists matching files in a folder.",
    ],
    terms: [
      { term: "Path", meaning: "pathlib object representing a file or folder location." },
      { term: "Context manager", meaning: "Object used with with that sets up and cleans up." },
      { term: "File mode", meaning: "How a file is opened: r, w, a, plus b for binary." },
      { term: "Encoding", meaning: "How text characters map to bytes, usually UTF-8." },
      { term: "glob", meaning: "Pattern matching for file names, like *.txt." },
    ],
    example: {
      lang: "python",
      code: "from pathlib import Path\n\nsrc = Path(\"data\") / \"log.txt\"\nout = Path(\"data\") / \"errors.txt\"\n\nwith src.open(encoding=\"utf-8\") as f, out.open(\"w\", encoding=\"utf-8\") as w:\n    for line in f:\n        if \"ERROR\" in line:\n            w.write(line)\n\nfor p in Path(\"data\").glob(\"*.txt\"):\n    print(p.name, p.stat().st_size, \"bytes\")",
    },
    pitfalls: [
      "Opening with \"w\" by accident and wiping the existing file.",
      "Relying on the current working directory; build paths from a known base.",
      "Forgetting each line keeps its trailing newline; use line.rstrip().",
    ],
    check: [
      { q: "Why open files with a with-block?", a: "It closes the file automatically when the block ends, even if an exception occurs." },
      { q: "What is the difference between mode \"w\" and \"a\"?", a: "\"w\" truncates the file and starts fresh; \"a\" keeps the content and appends to the end." },
    ],
  },

  "files-modules/exceptions": {
    summary:
      "An exception is Python's way of signalling that something went wrong. try/except lets you catch the specific errors you expect and recover, while raise lets your own code report problems clearly.",
    visuals: [
      {
        type: "tree",
        title: "Part of the exception hierarchy",
        root: "BaseException",
        children: [
          { label: "Exception", children: ["ValueError", "TypeError", "LookupError: KeyError, IndexError", "OSError: FileNotFoundError", "ArithmeticError: ZeroDivisionError"] },
          { label: "KeyboardInterrupt" },
          { label: "SystemExit" },
        ],
      },
      {
        type: "flow",
        title: "try / except / else / finally",
        steps: [
          { label: "try", detail: "Run code that might fail" },
          { label: "except", detail: "Runs only if a matching error was raised" },
          { label: "else", detail: "Runs only if try raised nothing" },
          { label: "finally", detail: "Always runs, for cleanup" },
        ],
      },
    ],
    keyPoints: [
      "Read a traceback from the bottom: the last line names the error type and message.",
      "Catch the narrowest exception you can handle, like ValueError, not everything.",
      "except Exception catches its subclasses too, because the hierarchy is a tree.",
      "raise ValueError(\"clear message\") when your function receives bad input.",
      "Custom exceptions subclass Exception and name problems in your domain.",
    ],
    terms: [
      { term: "Exception", meaning: "An object describing an error that interrupts normal flow." },
      { term: "Traceback", meaning: "Report showing the call chain and error that occurred." },
      { term: "try/except", meaning: "Run code and handle specific errors if they happen." },
      { term: "raise", meaning: "Signal an error yourself." },
      { term: "finally", meaning: "Block that always runs, error or not." },
    ],
    example: {
      lang: "python",
      code: "class InsufficientFunds(Exception):\n    \"\"\"Raised when a withdrawal exceeds the balance.\"\"\"\n\ndef withdraw(balance, amount):\n    if amount > balance:\n        raise InsufficientFunds(f\"Need {amount}, have {balance}\")\n    return balance - amount\ntry:\n    new_balance = withdraw(100, int(input(\"Amount: \")))\nexcept ValueError:\n    print(\"Please type a whole number.\")\nexcept InsufficientFunds as err:\n    print(\"Declined:\", err)\nelse:\n    print(\"New balance:\", new_balance)",
    },
    pitfalls: [
      "A bare except: hides bugs and even catches Ctrl+C.",
      "Wrapping huge blocks in try, so you cannot tell what failed.",
      "Silently passing on errors instead of logging or re-raising them.",
    ],
    check: [
      { q: "When does an else block after try run?", a: "Only when the try block finished without raising an exception." },
      { q: "Why catch ValueError rather than Exception?", a: "It handles just the failure you expect and lets unexpected bugs surface instead of hiding them." },
    ],
  },

  "files-modules/modules": {
    summary:
      "A module is any .py file; a package is a folder of modules. Importing lets you split a program into focused files and reuse the huge standard library without copying code.",
    visuals: [
      {
        type: "tree",
        title: "A small project layout",
        root: "tracker/ (project)",
        children: [
          { label: "main.py", children: ["Entry point with __main__ guard"] },
          { label: "tracker/ (package)", children: ["__init__.py", "models.py", "storage.py", "report.py"] },
          { label: "tests/", children: ["test_storage.py"] },
        ],
      },
      {
        type: "flow",
        title: "What import does",
        steps: [
          { label: "Check sys.modules", detail: "Already imported? Reuse it, do not rerun" },
          { label: "Find the file", detail: "Search the script folder, stdlib, site-packages" },
          { label: "Run it once", detail: "Top-level code executes, creating functions" },
          { label: "Bind the name", detail: "Your file can now use storage.save()" },
        ],
      },
    ],
    keyPoints: [
      "import math then math.sqrt(); or from math import sqrt.",
      "A module's top-level code runs once, the first time it is imported.",
      "if __name__ == \"__main__\": runs code only when the file is executed directly.",
      "Circular imports happen when two modules import each other; move shared code out.",
    ],
    terms: [
      { term: "Module", meaning: "A single .py file you can import." },
      { term: "Package", meaning: "A folder of modules, usually with __init__.py." },
      { term: "Standard library", meaning: "Modules that ship with Python, like json and pathlib." },
      { term: "__name__", meaning: "Set to \"__main__\" when a file is run directly." },
      { term: "Circular import", meaning: "Two modules importing each other, often causing errors." },
    ],
    example: {
      lang: "python",
      code: "# tracker/storage.py\nimport json\nfrom pathlib import Path\n\ndef save(items, path=Path(\"items.json\")):\n    path.write_text(json.dumps(items), encoding=\"utf-8\")\n# main.py\nfrom tracker.storage import save\n\ndef main():\n    save([\"milk\", \"eggs\"])\n    print(\"saved\")\n\nif __name__ == \"__main__\":\n    main()",
    },
    pitfalls: [
      "Naming your file random.py or json.py, which shadows the standard module.",
      "Putting work at module top level, so it runs on every import.",
      "Using from module import * and losing track of where names come from.",
    ],
    check: [
      { q: "What does the if __name__ == \"__main__\" guard do?", a: "It runs the block only when the file is executed directly, not when it is imported." },
      { q: "If two files import the same module, does its code run twice?", a: "No. It runs once and is cached in sys.modules; later imports reuse it." },
    ],
  },

  "files-modules/venv-pip": {
    summary:
      "A virtual environment is a private folder of installed packages for one project. pip installs packages into it, and a requirements.txt file records exact versions so anyone can recreate the same setup.",
    analogy: "A venv is a separate toolbox per project, so tools for one job never clash with another.",
    visuals: [
      {
        type: "layers",
        title: "What your code runs on",
        layers: [
          { label: "Your code", detail: "import requests in main.py" },
          { label: "Project packages", detail: "Installed by pip into .venv/site-packages" },
          { label: "venv Python", detail: ".venv/bin/python, active after activate" },
          { label: "Base Python install", detail: "The interpreter and standard library" },
          { label: "Operating system", detail: "Windows, macOS or Linux" },
        ],
      },
      {
        type: "flow",
        title: "Recreating an environment",
        steps: [
          { label: "python -m venv .venv", detail: "Create the environment once per project" },
          { label: "Activate", detail: "source .venv/bin/activate or .venv\\Scripts\\activate" },
          { label: "pip install", detail: "Add packages as you need them" },
          { label: "pip freeze", detail: "Save versions to requirements.txt" },
          { label: "pip install -r", detail: "Teammates rebuild the same environment" },
        ],
      },
    ],
    keyPoints: [
      "One venv per project keeps package versions from clashing.",
      "Your prompt shows (.venv) when the environment is active.",
      "python -m pip install ensures pip matches the active Python.",
      "Commit requirements.txt, but add .venv/ to .gitignore.",
    ],
    terms: [
      { term: "Virtual environment", meaning: "Isolated Python setup with its own installed packages." },
      { term: "pip", meaning: "Python's package installer." },
      { term: "PyPI", meaning: "The public index pip downloads packages from." },
      { term: "requirements.txt", meaning: "File listing packages and pinned versions." },
      { term: "Pinning", meaning: "Fixing an exact version, like requests==2.32.3." },
    ],
    example: {
      lang: "bash",
      code: "python -m venv .venv\nsource .venv/bin/activate        # Windows: .venv\\Scripts\\activate\npython -m pip install requests\npython -m pip freeze > requirements.txt\ndeactivate\n\n# on another machine\npython -m venv .venv\nsource .venv/bin/activate\npython -m pip install -r requirements.txt",
    },
    pitfalls: [
      "Installing packages globally, then wondering why another project broke.",
      "Forgetting to activate the venv, so pip installs to the wrong Python.",
      "Committing the .venv folder to Git.",
    ],
    check: [
      { q: "Why use a separate venv per project?", a: "Each project gets its own package versions, so upgrading one cannot break another." },
      { q: "How does a teammate install the same packages you used?", a: "Create and activate a venv, then run pip install -r requirements.txt." },
    ],
  },

  // ───────────────────────── oop ─────────────────────────
  "oop/classes": {
    summary:
      "A class is a blueprint that bundles data (attributes) with behaviour (methods). Each object created from it is an instance with its own attribute values, set up by the __init__ method.",
    analogy: "A class is a cookie cutter; each cookie is an instance with its own decorations.",
    visuals: [
      {
        type: "flow",
        title: "What happens on Account(\"Ana\", 50)",
        steps: [
          { label: "Call the class", detail: "Account(\"Ana\", 50) looks like a function call" },
          { label: "New empty object", detail: "Python creates a fresh instance" },
          { label: "__init__ runs", detail: "self is the new object; set self.owner, self.balance" },
          { label: "Instance returned", detail: "Assigned to a variable, ready for methods" },
        ],
      },
      {
        type: "tree",
        title: "One class, many instances",
        root: "class Account",
        children: [
          { label: "acct1", children: ["owner = \"Ana\"", "balance = 50"] },
          { label: "acct2", children: ["owner = \"Bo\"", "balance = 200"] },
          { label: "Shared methods", children: ["deposit()", "withdraw()"] },
        ],
      },
    ],
    keyPoints: [
      "Methods are functions defined in a class; their first parameter is self.",
      "Instance attributes (self.x) belong to one object; class attributes are shared by all.",
      "Call methods on an instance: acct.deposit(10) passes acct as self.",
      "Use classes when data and the operations on it naturally belong together.",
    ],
    terms: [
      { term: "Class", meaning: "Blueprint defining attributes and methods." },
      { term: "Instance", meaning: "A single object created from a class." },
      { term: "__init__", meaning: "Initialiser that sets up a new instance's attributes." },
      { term: "self", meaning: "The instance a method is working on." },
      { term: "Attribute", meaning: "A value stored on an object, like acct.balance." },
      { term: "Method", meaning: "A function defined inside a class." },
    ],
    example: {
      lang: "python",
      code: "class Account:\n    bank = \"Invicly Bank\"          # class attribute, shared\n\n    def __init__(self, owner, balance=0):\n        self.owner = owner           # instance attributes\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\na = Account(\"Ana\", 50)\nb = Account(\"Bo\")\na.deposit(25)\nprint(a.balance, b.balance, a.bank)  # 75 0 Invicly Bank",
    },
    pitfalls: [
      "Forgetting self as the first method parameter.",
      "Storing a mutable list as a class attribute, so all instances share it.",
      "Making a class for something that is just one function.",
    ],
    check: [
      { q: "What is self in a method?", a: "The specific instance the method was called on, passed in automatically." },
      { q: "What is the difference between a class attribute and an instance attribute?", a: "A class attribute is shared by all instances; an instance attribute is stored separately on each object." },
    ],
  },

  "oop/inheritance": {
    summary:
      "Inheritance lets a subclass reuse and override a parent class's behaviour. Composition builds objects out of other objects instead. Dunder methods like __repr__ and __eq__ make your objects print and compare nicely.",
    visuals: [
      {
        type: "tree",
        title: "A shallow inheritance tree",
        root: "Shape (area, __repr__)",
        children: [
          { label: "Circle", children: ["overrides area()"] },
          { label: "Rectangle", children: ["overrides area()"] },
          { label: "Square(Rectangle)", children: ["calls super().__init__"] },
        ],
      },
      {
        type: "compare",
        title: "Inheritance vs composition",
        columns: [
          { title: "Inheritance (is-a)", points: ["Square is a Rectangle", "Reuses parent methods", "Tightly coupled to parent", "Keep hierarchies shallow"] },
          { title: "Composition (has-a)", points: ["Car has an Engine", "Delegates to parts", "Swap parts easily", "Usually the safer default"] },
        ],
      },
    ],
    keyPoints: [
      "class Dog(Animal): makes Dog inherit Animal's attributes and methods.",
      "super().__init__(...) runs the parent's setup before adding your own.",
      "__repr__ controls how an object prints in the REPL and in debug output.",
      "__eq__ defines ==; without it, objects compare by identity.",
      "Prefer composition when the relationship is \"has a\" rather than \"is a\".",
    ],
    terms: [
      { term: "Subclass", meaning: "Class that inherits from another class." },
      { term: "Override", meaning: "Redefine a parent method in the subclass." },
      { term: "super()", meaning: "Access the parent class's methods." },
      { term: "Dunder method", meaning: "Special method with double underscores, like __repr__." },
      { term: "Composition", meaning: "Building an object from other objects it holds." },
    ],
    example: {
      lang: "python",
      code: "class Rectangle:\n    def __init__(self, w, h):\n        self.w, self.h = w, h\n    def area(self):\n        return self.w * self.h\n    def __repr__(self):\n        return f\"{type(self).__name__}({self.w}x{self.h})\"\n    def __eq__(self, other):\n        return isinstance(other, Rectangle) and (self.w, self.h) == (other.w, other.h)\n\nclass Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)\n\nprint(Square(3), Square(3).area(), Square(2) == Rectangle(2, 2))  # Square(3x3) 9 True",
    },
    pitfalls: [
      "Deep inheritance chains where behaviour is hard to trace.",
      "Forgetting to call super().__init__(), leaving parent attributes unset.",
      "Defining __eq__ without __hash__, which makes instances unhashable.",
    ],
    check: [
      { q: "When is composition better than inheritance?", a: "When one object has or uses another (a has-a relationship), since parts can be swapped without a rigid hierarchy." },
      { q: "What does __repr__ do?", a: "It returns the developer-friendly text shown when the object is printed in the REPL or debug output." },
    ],
  },

  "oop/dataclasses": {
    summary:
      "@dataclass writes the boring parts of a class for you: __init__, __repr__ and __eq__ from the fields you list. Enums give a fixed set of named choices, replacing error-prone magic strings.",
    visuals: [
      {
        type: "compare",
        title: "Plain class vs dataclass",
        columns: [
          { title: "Plain class", points: ["Write __init__ by hand", "Write __repr__ by hand", "Write __eq__ by hand", "Easy to forget a field"] },
          { title: "@dataclass", points: ["Fields declared with type hints", "__init__, __repr__, __eq__ generated", "frozen=True makes it immutable", "field(default_factory=list) for lists"] },
        ],
      },
    ],
    keyPoints: [
      "Each field needs a type annotation: name: str.",
      "Fields with defaults must come after fields without defaults.",
      "Use field(default_factory=list) for mutable defaults, never = [].",
      "An Enum like Status.PAID catches typos that \"piad\" strings would hide.",
    ],
    terms: [
      { term: "@dataclass", meaning: "Decorator that generates class boilerplate from fields." },
      { term: "Field", meaning: "An annotated class attribute that becomes an init parameter." },
      { term: "frozen", meaning: "Option that makes instances read-only and hashable." },
      { term: "Enum", meaning: "A class whose members are a fixed set of named constants." },
      { term: "Magic string", meaning: "A raw text value used as a code, easy to mistype." },
    ],
    example: {
      lang: "python",
      code: "from dataclasses import dataclass, field\nfrom enum import Enum\nclass Status(Enum):\n    PENDING = \"pending\"\n    PAID = \"paid\"\n\n@dataclass\nclass Order:\n    id: int\n    status: Status = Status.PENDING\n    items: list[str] = field(default_factory=list)\n\no = Order(1, items=[\"book\"])  # status defaults to PENDING\nprint(o)  # Order(id=1, status=<Status.PENDING: 'pending'>, items=['book'])\nprint(o == Order(1, items=[\"book\"]), Status(\"paid\") is Status.PAID)  # True True",
    },
    pitfalls: [
      "Writing items: list = [] in a dataclass, which raises ValueError.",
      "Comparing an Enum member to its raw string: Status.PAID == \"paid\" is False.",
      "Expecting type hints on fields to be checked at runtime; they are not.",
    ],
    check: [
      { q: "Which methods does @dataclass generate by default?", a: "__init__, __repr__ and __eq__, based on the declared fields." },
      { q: "Why replace \"paid\" strings with an Enum?", a: "Typos become errors, editors can autocomplete, and the valid options are listed in one place." },
    ],
  },

  // ───────────────────────── idiomatic ─────────────────────────
  "idiomatic/stdlib": {
    summary:
      "Python ships with a rich standard library. Counter and defaultdict simplify counting and grouping, itertools combines and slices iterables, datetime handles dates and times, and random makes samples and choices.",
    visuals: [
      {
        type: "tree",
        title: "Everyday standard library tools",
        root: "Standard library",
        children: [
          { label: "collections", children: ["Counter", "defaultdict", "deque", "namedtuple"] },
          { label: "itertools", children: ["chain", "groupby", "islice", "combinations"] },
          { label: "datetime", children: ["date", "datetime", "timedelta", "strptime / strftime"] },
          { label: "random", children: ["choice", "sample", "shuffle", "seed"] },
        ],
      },
    ],
    keyPoints: [
      "Counter(words).most_common(3) gives the three most frequent items.",
      "defaultdict(list) creates an empty list for a new key automatically.",
      "itertools.groupby only groups adjacent items, so sort by the same key first.",
      "strptime parses text into a datetime; strftime formats a datetime as text.",
      "random.seed(42) makes random results repeatable for tests.",
    ],
    terms: [
      { term: "Counter", meaning: "Dict subclass that counts hashable items." },
      { term: "defaultdict", meaning: "Dict that builds a default value for missing keys." },
      { term: "itertools", meaning: "Module of fast tools for working with iterables." },
      { term: "timedelta", meaning: "A duration you can add to or subtract from dates." },
      { term: "Seed", meaning: "Starting value that makes random output reproducible." },
    ],
    example: {
      lang: "python",
      code: "from collections import Counter, defaultdict\nfrom datetime import datetime, timedelta\nimport itertools, random\n\nwords = \"a b a c b a\".split()\nprint(Counter(words).most_common(2))     # [('a', 3), ('b', 2)]\nby_len = defaultdict(list)\nfor w in [\"hi\", \"yo\", \"cat\"]:\n    by_len[len(w)].append(w)\n\nprint(list(itertools.chain([1, 2], [3])))  # [1, 2, 3]\n\nd = datetime.strptime(\"2026-03-01\", \"%Y-%m-%d\")\nprint((d + timedelta(days=30)).strftime(\"%d %b %Y\"))  # 31 Mar 2026\nrandom.seed(1); print(random.choice(words))",
    },
    pitfalls: [
      "Using groupby on unsorted data and getting many tiny groups.",
      "Mixing naive and timezone-aware datetimes in comparisons.",
      "Using random for passwords or tokens; use the secrets module.",
    ],
    check: [
      { q: "Which tool would you use to count word frequencies?", a: "collections.Counter, then most_common() to get the top items." },
      { q: "Why might itertools.groupby give duplicate groups?", a: "It only groups consecutive equal keys, so the data must be sorted by that key first." },
    ],
  },

  "idiomatic/iterators": {
    summary:
      "An iterator hands out values one at a time when asked with next(). Generators are the easy way to write iterators: a function with yield pauses after each value, so huge or endless data never has to sit in memory.",
    analogy: "A generator is a ticket dispenser: it prints the next ticket only when someone pulls.",
    visuals: [
      {
        type: "sequence",
        title: "A for loop driving a generator",
        actors: ["for loop", "count_up(3)"],
        messages: [
          { from: 0, to: 1, label: "next()" },
          { from: 1, to: 0, label: "yield 1, then pause" },
          { from: 0, to: 1, label: "next()" },
          { from: 1, to: 0, label: "yield 2, then pause" },
          { from: 0, to: 1, label: "next()" },
          { from: 1, to: 0, label: "yield 3, then pause" },
          { from: 0, to: 1, label: "next()" },
          { from: 1, to: 0, label: "StopIteration: loop ends" },
        ],
      },
    ],
    keyPoints: [
      "iter(x) gets an iterator; next(it) gets the next value or raises StopIteration.",
      "A function containing yield returns a generator instead of running immediately.",
      "Generator expressions use parentheses: (x * x for x in nums).",
      "Generators are single-use: once exhausted, they yield nothing more.",
      "Looping over a file with a generator processes gigabytes using little memory.",
    ],
    terms: [
      { term: "Iterable", meaning: "Something you can loop over, like a list or file." },
      { term: "Iterator", meaning: "Object that returns the next value on each next() call." },
      { term: "Generator", meaning: "Iterator created by a function that uses yield." },
      { term: "yield", meaning: "Produce a value and pause until the next request." },
      { term: "Lazy evaluation", meaning: "Computing values only when they are needed." },
    ],
    example: {
      lang: "python",
      code: "def read_errors(path):\n    with open(path, encoding=\"utf-8\") as f:\n        for line in f:\n            if \"ERROR\" in line:\n                yield line.rstrip()\n\ndef count_up(n):\n    for i in range(1, n + 1):\n        yield i\n\nprint(list(count_up(3)))                # [1, 2, 3]\nprint(sum(x * x for x in range(1000)))  # no list built\ngen = count_up(2)\nprint(next(gen), next(gen))             # 1 2",
    },
    pitfalls: [
      "Looping over the same generator twice and getting nothing the second time.",
      "Calling list() on a huge generator and losing the memory benefit.",
      "Expecting a generator function's body to run before the first next().",
    ],
    check: [
      { q: "What happens when a generator has no more values?", a: "It raises StopIteration, which a for loop treats as the signal to stop." },
      { q: "Why process a large file with a generator?", a: "It reads and yields one line at a time, so memory use stays small regardless of file size." },
    ],
  },

  "idiomatic/decorators": {
    summary:
      "A decorator is a function that wraps another function to add behaviour, like timing or logging, without changing its code. A context manager wraps a block with setup and cleanup, which is what with-statements use.",
    visuals: [
      {
        type: "layers",
        title: "A decorated call, outside in",
        layers: [
          { label: "Caller", detail: "Calls slow_sum(10), unaware of the wrapper" },
          { label: "wrapper()", detail: "Starts timer, then calls the original" },
          { label: "Original slow_sum", detail: "Does the real work and returns" },
          { label: "wrapper() again", detail: "Stops timer, prints time, passes result back" },
        ],
      },
      {
        type: "flow",
        title: "Inside a with-block",
        steps: [
          { label: "__enter__", detail: "Setup: open, lock, start timer" },
          { label: "Run the body", detail: "Your indented code" },
          { label: "__exit__", detail: "Cleanup runs even if the body raised" },
        ],
      },
    ],
    keyPoints: [
      "@timer above def f is shorthand for f = timer(f).",
      "Wrappers should accept *args, **kwargs and return the original result.",
      "Use functools.wraps so the wrapped function keeps its name and docstring.",
      "@contextmanager turns a generator with one yield into a context manager.",
    ],
    terms: [
      { term: "Decorator", meaning: "Function that takes a function and returns a wrapped version." },
      { term: "Wrapper", meaning: "The inner function that adds behaviour around the original." },
      { term: "functools.wraps", meaning: "Copies name and docstring onto the wrapper." },
      { term: "Context manager", meaning: "Object with __enter__ and __exit__ used by with." },
      { term: "@contextmanager", meaning: "Builds a context manager from a generator function." },
    ],
    example: {
      lang: "python",
      code: "import functools, time\n\ndef timer(func):\n    @functools.wraps(func)\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f\"{func.__name__} took {time.perf_counter() - start:.4f}s\")\n        return result\n    return wrapper\n\n@timer\ndef slow_sum(n):\n    return sum(range(n))\nprint(slow_sum(1_000_000))  # prints the timing line, then 499999500000",
      caption: "A timing decorator; @contextmanager works similarly with a single yield.",
    },
    pitfalls: [
      "Forgetting to return the result from the wrapper, so calls return None.",
      "Leaving out @wraps, which breaks names in logs and tracebacks.",
      "Not using try/finally around yield, so cleanup is skipped on errors.",
    ],
    check: [
      { q: "What does @timer above a function definition actually do?", a: "It replaces the function with timer(function), the wrapped version." },
      { q: "When does a context manager's cleanup run?", a: "When the with-block exits, whether it finished normally or raised an exception." },
    ],
  },

  "idiomatic/type-hints": {
    summary:
      "Type hints label what types a function expects and returns. Python ignores them when running, but editors and type checkers like mypy or Pyright read them to catch mistakes before you run the code.",
    visuals: [
      {
        type: "flow",
        title: "Where type hints help",
        steps: [
          { label: "Annotate code", detail: "def total(prices: list[float]) -> float" },
          { label: "Editor reads hints", detail: "Better autocomplete and inline warnings" },
          { label: "Run mypy / Pyright", detail: "Checks every call against the hints" },
          { label: "Fix reported errors", detail: "Before users ever hit them" },
          { label: "Python runs", detail: "Hints are not enforced at runtime" },
        ],
      },
    ],
    keyPoints: [
      "Annotate parameters with name: type and returns with -> type.",
      "Use built-in generics: list[int], dict[str, float], tuple[int, int].",
      "int | None (or Optional[int]) means the value may be None.",
      "Dataclass fields are already annotated, so checkers understand them for free.",
    ],
    terms: [
      { term: "Type hint", meaning: "An annotation describing the expected type." },
      { term: "Optional", meaning: "A type that also allows None." },
      { term: "Union", meaning: "One of several types, written A | B." },
      { term: "Type checker", meaning: "Tool like mypy or Pyright that verifies hints statically." },
      { term: "Static analysis", meaning: "Checking code without running it." },
    ],
    example: {
      lang: "python",
      code: "from dataclasses import dataclass\n\n@dataclass\nclass Item:\n    name: str\n    price: float\n\ndef total(items: list[Item], discount: float | None = None) -> float:\n    subtotal = sum(i.price for i in items)\n    if discount is None:\n        return subtotal\n    return subtotal * (1 - discount)\n\nprint(total([Item(\"pen\", 2.5)]))\ntotal(\"pen\")  # mypy: incompatible type \"str\"; runtime: crashes later",
    },
    pitfalls: [
      "Assuming hints validate data at runtime; they do not.",
      "Using Any everywhere, which switches checking off.",
      "Forgetting to handle None when a hint says the value is optional.",
    ],
    check: [
      { q: "Does Python raise an error if you pass a str to a parameter hinted as int?", a: "No. Hints are ignored at runtime; only a type checker or editor will flag it." },
      { q: "How do you hint a function that returns an int or None?", a: "Write -> int | None (or -> Optional[int])." },
    ],
  },

  // ───────────────────────── tooling ─────────────────────────
  "tooling/pytest": {
    summary:
      "pytest finds functions named test_* and runs them, reporting which assertions fail. Fixtures share setup and parametrize runs one test over many inputs, so checking your code after every change takes seconds.",
    visuals: [
      {
        type: "cycle",
        title: "Test-driven loop",
        steps: [
          { label: "Write a test", detail: "Describe the behaviour you want" },
          { label: "Run: it fails", detail: "Red: proves the test can catch a bug" },
          { label: "Write the code", detail: "Simplest code that passes" },
          { label: "Run: it passes", detail: "Green: behaviour confirmed" },
          { label: "Refactor", detail: "Clean up while tests keep you safe" },
        ],
      },
    ],
    keyPoints: [
      "Put tests in files named test_*.py and functions named test_*.",
      "Plain assert statements are enough; pytest shows the values that differed.",
      "with pytest.raises(ValueError): checks that an error is raised.",
      "@pytest.fixture provides shared setup; built-in tmp_path gives a temp folder.",
      "@pytest.mark.parametrize runs one test against many input cases.",
    ],
    terms: [
      { term: "Unit test", meaning: "Small test checking one function or behaviour." },
      { term: "Assertion", meaning: "A condition that must be true for the test to pass." },
      { term: "Fixture", meaning: "Reusable setup injected into tests by parameter name." },
      { term: "Parametrize", meaning: "Run the same test with different inputs." },
      { term: "Test discovery", meaning: "How pytest finds tests by file and function names." },
    ],
    example: {
      lang: "python",
      code: "# test_pricing.py\nimport pytest\nfrom pricing import apply_discount\n\n@pytest.mark.parametrize(\"price, pct, expected\", [\n    (100, 10, 90),\n    (50, 0, 50),\n    (20, 100, 0),\n])\ndef test_apply_discount(price, pct, expected):\n    assert apply_discount(price, pct) == expected\n\ndef test_rejects_negative_percent():\n    with pytest.raises(ValueError):\n        apply_discount(100, -5)  # run with: pytest -q",
    },
    pitfalls: [
      "Tests that depend on each other's order or shared global state.",
      "Only testing the happy path, never the error cases.",
      "Comparing floats with == instead of pytest.approx().",
    ],
    check: [
      { q: "How does pytest find your tests?", a: "It collects files named test_*.py (or *_test.py) and runs functions whose names start with test_." },
      { q: "What is a fixture for?", a: "Sharing setup, like sample data or a temporary folder, across tests without repeating code." },
    ],
  },

  "tooling/debugging": {
    summary:
      "Debugging is finding out why code does something you did not expect. Read the traceback first, then pause the program at a breakpoint and inspect real values instead of guessing with scattered prints.",
    visuals: [
      {
        type: "flow",
        title: "A calm debugging routine",
        steps: [
          { label: "Reproduce", detail: "Find the smallest input that triggers the bug" },
          { label: "Read the traceback", detail: "Last line: error type; frames above: where" },
          { label: "Set a breakpoint", detail: "breakpoint() or click the editor gutter" },
          { label: "Step & inspect", detail: "Check variables line by line" },
          { label: "Fix & add a test", detail: "So the bug cannot quietly return" },
        ],
      },
    ],
    keyPoints: [
      "Tracebacks list the most recent call last; start reading at the bottom.",
      "breakpoint() drops you into pdb at that line.",
      "In pdb: n next line, s step into, c continue, p x prints x, q quits.",
      "VS Code breakpoints show all local variables without changing your code.",
    ],
    terms: [
      { term: "Traceback", meaning: "The error report with the chain of calls that failed." },
      { term: "Breakpoint", meaning: "A marker where execution pauses for inspection." },
      { term: "pdb", meaning: "Python's built-in command-line debugger." },
      { term: "Step over / into", meaning: "Run the next line, or enter the function it calls." },
      { term: "Stack frame", meaning: "One function call's local state in the traceback." },
    ],
    example: {
      lang: "python",
      code: "def average(nums):\n    total = sum(nums)\n    breakpoint()          # pauses here in pdb\n    return total / len(nums)\n\naverage([])\n\n# (Pdb) p nums          -> []\n# (Pdb) p len(nums)     -> 0\n# (Pdb) n               -> ZeroDivisionError: division by zero\n# Fix: return 0 or raise ValueError for empty input",
    },
    pitfalls: [
      "Reading only the top of the traceback and blaming library code.",
      "Changing many things at once, so you never learn what fixed it.",
      "Leaving breakpoint() calls in committed code.",
    ],
    check: [
      { q: "Where in a traceback is the actual error message?", a: "On the last line, which names the exception type and message." },
      { q: "What does the pdb command n do?", a: "Runs the next line in the current function without stepping into calls." },
    ],
  },

  "tooling/lint-format": {
    summary:
      "A formatter rewrites code into one consistent style, and a linter flags likely bugs and bad habits. Ruff does both very fast, so style debates disappear and small mistakes get caught automatically.",
    visuals: [
      {
        type: "flow",
        title: "Ruff in your workflow",
        steps: [
          { label: "Write code", detail: "Focus on logic, not spacing" },
          { label: "ruff format .", detail: "Rewrites layout, quotes and line breaks" },
          { label: "ruff check .", detail: "Reports unused imports, undefined names and more" },
          { label: "ruff check --fix", detail: "Auto-fixes the safe issues" },
          { label: "Commit clean code", detail: "Optionally enforced by CI or a pre-commit hook" },
        ],
      },
    ],
    keyPoints: [
      "Install with pip install ruff inside your venv.",
      "ruff format handles style; ruff check finds problems.",
      "Configure rules and line length under [tool.ruff] in pyproject.toml.",
      "Run Ruff on save in VS Code so issues appear as you type.",
    ],
    terms: [
      { term: "Linter", meaning: "Tool that flags suspicious or error-prone code." },
      { term: "Formatter", meaning: "Tool that rewrites code into a consistent style." },
      { term: "Ruff", meaning: "Fast Python linter and formatter written in Rust." },
      { term: "PEP 8", meaning: "Python's official style guide." },
      { term: "pyproject.toml", meaning: "Project config file where tool settings live." },
    ],
    example: {
      lang: "bash",
      code: "pip install ruff\nruff format .            # reformat every file\nruff check .             # list problems\nruff check --fix .       # fix what can be fixed safely\n\n# pyproject.toml\n# [tool.ruff]\n# line-length = 100\n# [tool.ruff.lint]\n# select = [\"E\", \"F\", \"I\"]",
    },
    pitfalls: [
      "Ignoring warnings like unused variables that often hide real bugs.",
      "Mixing two formatters with conflicting rules.",
      "Reformatting a whole old project in a commit with other changes.",
    ],
    check: [
      { q: "What is the difference between ruff format and ruff check?", a: "format rewrites code style; check analyses code and reports possible bugs and rule violations." },
      { q: "Why automate formatting?", a: "It keeps style consistent without manual effort and removes style debates from code review." },
    ],
  },

  "tooling/git-basics": {
    summary:
      "Git records snapshots of your project called commits, so you can see history, undo mistakes and try ideas on branches. Pushing to GitHub backs up your work and lets others see it.",
    visuals: [
      {
        type: "sequence",
        title: "From edit to GitHub",
        actors: ["Working folder", "Staging area", "Local repo", "GitHub"],
        messages: [
          { from: 0, to: 1, label: "git add file.py" },
          { from: 1, to: 2, label: "git commit -m \"msg\"" },
          { from: 2, to: 3, label: "git push" },
          { from: 3, to: 2, label: "git fetch / pull" },
          { from: 2, to: 0, label: "merge updates files" },
        ],
      },
    ],
    keyPoints: [
      "git status shows what changed; git diff shows exactly how.",
      "Stage with git add, then commit with a short message saying why.",
      "Create a branch per feature: git switch -c add-export.",
      "A .gitignore keeps .venv/, __pycache__/ and secrets out of the repo.",
      "A README explains what the project does and how to run it.",
    ],
    terms: [
      { term: "Repository", meaning: "A project folder whose history Git tracks." },
      { term: "Commit", meaning: "A saved snapshot with a message and author." },
      { term: "Staging area", meaning: "Changes selected for the next commit." },
      { term: "Branch", meaning: "A movable line of commits for separate work." },
      { term: "Remote", meaning: "A copy of the repo elsewhere, like GitHub." },
      { term: "Merge", meaning: "Combine one branch's commits into another." },
    ],
    example: {
      lang: "bash",
      code: "git init\nprintf \".venv/\\n__pycache__/\\n.env\\n\" > .gitignore\ngit add .\ngit commit -m \"Initial commit\"\n\ngit switch -c add-export\n# ...edit files...\ngit commit -am \"Add CSV export\"\ngit switch main\ngit merge add-export\n\ngit remote add origin https://github.com/you/tracker.git\ngit push -u origin main",
    },
    pitfalls: [
      "Committing passwords or API keys; they stay in history even if deleted later.",
      "Huge commits that mix unrelated changes.",
      "Messages like \"stuff\" that explain nothing.",
    ],
    check: [
      { q: "What does git add do?", a: "It stages changes so they are included in the next commit." },
      { q: "Why work on a branch?", a: "It keeps unfinished work separate from main until it is ready to merge." },
    ],
  },

  // ───────────────────────── practical ─────────────────────────
  "practical/csv-json": {
    summary:
      "CSV is the common format for tables and JSON for nested data. Python's csv and json modules read them into lists and dicts, so you can clean, summarise and export data with the tools you already know.",
    visuals: [
      {
        type: "flow",
        title: "From messy CSV to JSON summary",
        steps: [
          { label: "csv.DictReader", detail: "Each row becomes a dict keyed by header" },
          { label: "Clean fields", detail: "strip() text, convert numbers, skip bad rows" },
          { label: "Summarise", detail: "Totals per group with a dict or Counter" },
          { label: "json.dump", detail: "Write the result to a .json file" },
        ],
      },
      {
        type: "compare",
        title: "CSV vs JSON",
        columns: [
          { title: "CSV", points: ["Flat rows and columns", "Every value is text", "Opens in spreadsheets", "csv.DictReader / DictWriter"] },
          { title: "JSON", points: ["Nested objects and lists", "Has numbers, booleans, null", "Common for APIs", "json.load / json.dump"] },
        ],
      },
    ],
    keyPoints: [
      "Open CSV files with newline=\"\" and encoding=\"utf-8\".",
      "csv values are always strings; convert with int() or float().",
      "Wrap conversions in try/except to skip or report bad rows.",
      "json.dump(data, f, indent=2) writes readable JSON.",
    ],
    terms: [
      { term: "CSV", meaning: "Comma-separated values: plain-text table format." },
      { term: "JSON", meaning: "Text format for objects, arrays, numbers and strings." },
      { term: "DictReader", meaning: "Reads CSV rows as dicts using the header row." },
      { term: "Serialise", meaning: "Turn Python objects into text like JSON." },
      { term: "Data cleaning", meaning: "Fixing or removing malformed values before analysis." },
    ],
    example: {
      lang: "python",
      code: "import csv, json\nfrom collections import Counter\n\ntotals = Counter()\nwith open(\"sales.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    for row in csv.DictReader(f):\n        try:\n            amount = float(row[\"amount\"].strip())\n        except ValueError:\n            continue  # skip bad rows\n        totals[row[\"region\"].strip().title()] += amount\n\nwith open(\"summary.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(dict(totals), f, indent=2)",
    },
    pitfalls: [
      "Doing maths on CSV values without converting them from strings.",
      "Splitting lines on commas by hand, which breaks on quoted fields.",
      "Forgetting that JSON object keys always come back as strings.",
    ],
    check: [
      { q: "What type is every value read by csv.DictReader?", a: "str, so numbers must be converted before calculating." },
      { q: "When is JSON a better fit than CSV?", a: "When data is nested, such as an order containing a list of items." },
    ],
  },

  "practical/http-apis": {
    summary:
      "Web APIs return data over HTTP, usually as JSON. The requests library sends a request with parameters and headers, then you check the status, parse the JSON and save or use the result.",
    visuals: [
      {
        type: "sequence",
        title: "Fetching data from an API",
        actors: ["Your script", "requests", "API server"],
        messages: [
          { from: 0, to: 1, label: "get(url, params, timeout=10)" },
          { from: 1, to: 2, label: "GET /forecast?city=Pune" },
          { from: 2, to: 1, label: "200 OK + JSON body" },
          { from: 1, to: 0, label: "Response object" },
          { from: 0, to: 0, label: "raise_for_status()" },
          { from: 0, to: 0, label: "data = r.json()" },
        ],
      },
    ],
    keyPoints: [
      "Pass query parameters as a dict with params= instead of building URLs by hand.",
      "Always set timeout=; requests waits forever by default.",
      "r.raise_for_status() turns 4xx and 5xx responses into exceptions.",
      "Keep API keys in environment variables, never in your code.",
    ],
    terms: [
      { term: "API", meaning: "A way for programs to request data from a service." },
      { term: "HTTP GET", meaning: "Request to read data from a URL." },
      { term: "Status code", meaning: "Number showing the result: 200 OK, 404 Not Found, 500 error." },
      { term: "Query parameters", meaning: "Key=value pairs after ? in a URL." },
      { term: "Header", meaning: "Extra request info, like an API key or accepted format." },
    ],
    example: {
      lang: "python",
      code: "import json, os\nimport requests\n\nurl = \"https://api.example.com/forecast\"\nheaders = {\"Authorization\": f\"Bearer {os.environ['API_KEY']}\"}\n\ntry:\n    r = requests.get(url, params={\"city\": \"Pune\"}, headers=headers, timeout=10)\n    r.raise_for_status()\nexcept requests.RequestException as err:\n    raise SystemExit(f\"Request failed: {err}\")\n\ndata = r.json()\nwith open(\"forecast.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(data, f, indent=2)",
    },
    pitfalls: [
      "No timeout, so the script hangs when the server is slow.",
      "Calling r.json() without checking the status, then parsing an error page.",
      "Committing API keys to Git.",
    ],
    check: [
      { q: "What does raise_for_status() do?", a: "Raises an HTTPError if the response status is 4xx or 5xx, and does nothing on success." },
      { q: "Why pass params= instead of formatting the URL yourself?", a: "requests encodes the values safely, handling spaces and special characters for you." },
    ],
  },

  "practical/cli": {
    summary:
      "argparse turns a script into a proper command-line tool. You declare the arguments and options it accepts, and argparse parses them, converts types, applies defaults and writes the --help text for you.",
    visuals: [
      {
        type: "flow",
        title: "From command line to your code",
        steps: [
          { label: "User types command", detail: "tracker add 12.5 --category food" },
          { label: "sys.argv", detail: "Raw list of strings from the shell" },
          { label: "parse_args()", detail: "Validates, converts types, fills defaults" },
          { label: "Namespace", detail: "args.amount, args.category ready to use" },
          { label: "Run & exit", detail: "Bad input prints usage and exits with error" },
        ],
      },
    ],
    keyPoints: [
      "Positional arguments are required; options start with -- and are usually optional.",
      "type=int converts and validates; default= fills missing options.",
      "action=\"store_true\" makes a simple on/off flag.",
      "-h / --help is generated automatically from your help= strings.",
      "Add [project.scripts] in pyproject.toml to install it as a real command.",
    ],
    terms: [
      { term: "CLI", meaning: "Command-line interface: a program driven by typed commands." },
      { term: "Positional argument", meaning: "Required value identified by its position." },
      { term: "Option / flag", meaning: "Named setting like --limit 5 or --verbose." },
      { term: "Namespace", meaning: "Object holding parsed arguments as attributes." },
      { term: "Exit code", meaning: "Number a program returns: 0 success, non-zero failure." },
    ],
    example: {
      lang: "python",
      code: "import argparse\n\ndef main():\n    parser = argparse.ArgumentParser(description=\"Track expenses.\")\n    parser.add_argument(\"amount\", type=float, help=\"amount spent\")\n    parser.add_argument(\"--category\", default=\"other\", help=\"expense category\")\n    parser.add_argument(\"--verbose\", action=\"store_true\", help=\"show details\")\n    args = parser.parse_args()\n    if args.verbose:\n        print(\"Parsed:\", args)\n    print(f\"Added {args.amount:.2f} to {args.category}\")\n\nif __name__ == \"__main__\":\n    main()\n# python tracker.py 12.5 --category food --verbose",
    },
    pitfalls: [
      "Reading sys.argv by hand and re-inventing parsing and help text.",
      "Forgetting type=, so numbers arrive as strings.",
      "Printing errors but exiting with code 0, which hides failures from scripts.",
    ],
    check: [
      { q: "How do you add an on/off flag with argparse?", a: "add_argument(\"--verbose\", action=\"store_true\"), which is False unless the flag is given." },
      { q: "What happens when the user passes an invalid value for a type=int argument?", a: "argparse prints a usage error and exits with a non-zero status." },
    ],
  },

  "practical/automation": {
    summary:
      "Automation means letting a script do a boring, repeatable task: renaming files, sorting downloads, or building a weekly report. Start with a dry run that only prints what would happen, then let it act.",
    visuals: [
      {
        type: "flow",
        title: "A safe file-sorting script",
        steps: [
          { label: "Scan the folder", detail: "Path.iterdir() lists every entry" },
          { label: "Decide per file", detail: "Pick a target folder from the suffix" },
          { label: "Dry run", detail: "Print planned moves, change nothing" },
          { label: "Act", detail: "Create folders, move or rename files" },
          { label: "Report", detail: "Summarise counts per category" },
        ],
      },
    ],
    keyPoints: [
      "Good automation targets tasks you repeat often with clear rules.",
      "Always add a --dry-run mode before moving or deleting anything.",
      "Use Path.suffix, Path.stem and Path.rename or shutil.move.",
      "Never overwrite silently: check if the target already exists.",
    ],
    terms: [
      { term: "Dry run", meaning: "Run that reports actions without performing them." },
      { term: "Idempotent", meaning: "Running it twice gives the same result as once." },
      { term: "suffix", meaning: "File extension, like .pdf, from a Path." },
      { term: "shutil", meaning: "Standard module for moving and copying files." },
    ],
    example: {
      lang: "python",
      code: "import shutil\nfrom pathlib import Path\n\nTYPES = {\".jpg\": \"images\", \".png\": \"images\", \".pdf\": \"docs\", \".csv\": \"data\"}\n\ndef sort_folder(folder: Path, dry_run: bool = True) -> None:\n    for p in folder.iterdir():\n        target = TYPES.get(p.suffix.lower())\n        if not p.is_file() or target is None:\n            continue\n        dest = folder / target / p.name\n        print(f\"{p.name} -> {target}/\")\n        if not dry_run and not dest.exists():\n            dest.parent.mkdir(exist_ok=True)\n            shutil.move(p, dest)",
      caption: "Run with dry_run=True first, check the printout, then pass False.",
    },
    pitfalls: [
      "Running a destructive script on real files without a dry run or backup.",
      "Hard-coding absolute paths that only exist on your machine.",
      "Not handling name clashes when two files map to the same destination.",
    ],
    check: [
      { q: "Why build a dry-run mode first?", a: "It shows exactly what would change so you can catch mistakes before files are moved or deleted." },
      { q: "What makes a task a good candidate for automation?", a: "It is repeated often, follows clear rules and is tedious or error-prone by hand." },
    ],
  },

  // ───────────────────────── py-capstone ─────────────────────────
  "py-capstone/py-capstone-plan": {
    summary:
      "A short plan saves hours of rework. List the features you must have, sketch the data as dataclasses, and decide which module owns which job before writing any real code.",
    visuals: [
      {
        type: "tree",
        title: "Example: expense tracker plan",
        root: "expense-tracker",
        children: [
          { label: "Must-have features", children: ["Add expense", "List by month", "Category totals"] },
          { label: "Nice-to-have", children: ["Currency conversion via API", "CSV export"] },
          { label: "Data model", children: ["Expense dataclass", "Category enum"] },
          { label: "Modules", children: ["models.py", "storage.py", "rates.py", "cli.py"] },
        ],
      },
    ],
    keyPoints: [
      "Keep the must-have list small enough to finish in one week.",
      "Each module should have one clear responsibility.",
      "Sketch dataclass fields with types before writing logic.",
      "Write one example command and its expected output per feature.",
    ],
    terms: [
      { term: "Spec", meaning: "Short document describing what the program must do." },
      { term: "MVP", meaning: "Minimum viable product: the smallest useful version." },
      { term: "Data model", meaning: "The shapes of data your program stores and passes around." },
      { term: "Separation of concerns", meaning: "Each module handles one kind of job." },
    ],
    example: {
      lang: "python",
      caption: "A first sketch of models.py.",
      code: "from dataclasses import dataclass\nfrom datetime import date\nfrom enum import Enum\n\nclass Category(Enum):\n    FOOD = \"food\"\n    TRAVEL = \"travel\"\n    OTHER = \"other\"\n\n@dataclass\nclass Expense:\n    amount: float\n    category: Category\n    spent_on: date\n    note: str = \"\"",
    },
    pitfalls: [
      "Starting with nice-to-haves before the core works.",
      "Putting storage, logic and printing all in one file.",
      "Skipping the plan and discovering the data model halfway through.",
    ],
    check: [
      { q: "Why decide module responsibilities up front?", a: "It keeps each file focused, avoids circular imports and makes testing each part easier." },
      { q: "What belongs in must-have versus nice-to-have?", a: "Must-have is the minimum that makes the tool useful; nice-to-have is anything that can wait until it works." },
    ],
  },

  "py-capstone/py-capstone-build": {
    summary:
      "The build brings every module of the path together: a venv and Ruff-checked repo, dataclass models, JSON storage, an argparse CLI, one web API call and pytest tests, documented in a README.",
    visuals: [
      {
        type: "layers",
        title: "Architecture of the CLI app",
        layers: [
          { label: "cli.py", detail: "argparse commands, printing, exit codes" },
          { label: "Service logic", detail: "Add, list and summarise expenses" },
          { label: "models.py", detail: "Expense dataclass and Category enum" },
          { label: "storage.py / rates.py", detail: "JSON file storage and API client" },
          { label: "Files & network", detail: "expenses.json and the remote API" },
        ],
      },
      {
        type: "flow",
        title: "Build order",
        steps: [
          { label: "Repo, venv, Ruff", detail: "git init, .gitignore, requirements" },
          { label: "Model & storage", detail: "Save and load round-trip with tests" },
          { label: "CLI commands", detail: "add, list, summary via argparse" },
          { label: "API integration", detail: "With timeout and error handling" },
          { label: "Tests & README", detail: "pytest green, usage examples written" },
        ],
      },
    ],
    keyPoints: [
      "Keep logic out of cli.py so it can be tested without the command line.",
      "Test storage with tmp_path so tests never touch real data.",
      "Mock or wrap the API call so tests run offline.",
      "Commit after each working step with a clear message.",
    ],
    terms: [
      { term: "Layered design", meaning: "Separating interface, logic and storage code." },
      { term: "Round-trip test", meaning: "Save then load data and check it is unchanged." },
      { term: "Mock", meaning: "Fake stand-in for something slow or external, like an API." },
      { term: "README", meaning: "Front-page doc explaining setup and usage." },
    ],
    example: {
      lang: "python",
      code: "# test_storage.py\nfrom datetime import date\nfrom tracker.models import Expense, Category\nfrom tracker.storage import save_expenses, load_expenses\n\ndef test_round_trip(tmp_path):\n    path = tmp_path / \"expenses.json\"\n    items = [Expense(12.5, Category.FOOD, date(2026, 3, 1))]\n    save_expenses(items, path)\n    assert load_expenses(path) == items",
      caption: "A round-trip test proves storage works without touching your real data.",
    },
    pitfalls: [
      "Calling the real API in tests, making them slow and flaky.",
      "Building every feature before writing a single test.",
      "A README with no install or usage instructions.",
    ],
    check: [
      { q: "Why keep business logic out of cli.py?", a: "Logic in its own module can be tested directly, without simulating command-line input." },
      { q: "How can tests avoid overwriting your real expenses file?", a: "Use pytest's tmp_path fixture to read and write in a temporary folder." },
    ],
  },
};

export default explainers;
