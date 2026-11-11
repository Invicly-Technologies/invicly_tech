import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "control-flow/conditionals": {
    plain: [
      "Programs make choices all the time. Is the password right? Is the cart empty? Is the user old enough? An if statement runs a block of code only when its condition is True. Python marks the block with indentation, usually 4 spaces, instead of curly braces.",
      "A condition is any expression that can be judged true or false. You build them from comparisons (==, !=, <, >, <=, >=), membership tests (in, not in) and the logic words and, or and not. They read almost like English: if age >= 18 and has_ticket.",
      "elif (short for \"else if\") adds more options and else catches everything left over. Python checks the branches from top to bottom and runs only the first one whose condition is True. So the order of your branches matters.",
      "Any value can be used as a condition, not just True and False. Zero, empty text, empty lists and None count as false; almost everything else counts as true. This lets you write if items: instead of if len(items) > 0:, which is shorter and is the normal Python style.",
    ],
    deepDive: [
      {
        heading: "Short-circuiting, and what and/or really return",
        body: "and and or are lazy. a and b looks at a first: if a is falsy, the answer is already known, so Python returns a without even looking at b. a or b returns a straight away if a is truthy. This is called short-circuit evaluation.\n\nThey also return one of the two values, not necessarily True or False. \"\" or \"guest\" gives \"guest\", and 0 and crash() gives 0 without calling crash(). That enables two common patterns. The guard: if user and user.is_admin: never touches user.is_admin when user is None. The default: name = name or \"Anonymous\". Be careful with the second one: it also replaces 0 and empty strings, which may be valid values.\n\nPrecedence is not, then and, then or. So a or b and c means a or (b and c). When you mix them, add parentheses; readers should never have to remember the rule.",
        visual: {
          type: "flow",
          title: "How Python evaluates a and b",
          steps: [
            { label: "Evaluate a", detail: "Work out the left side first" },
            { label: "Is a falsy?", detail: "0, \"\", None, empty, or False" },
            { label: "Yes: return a", detail: "b is never evaluated" },
            { label: "No: evaluate b", detail: "Only now is the right side run" },
            { label: "Return b", detail: "The result is b itself, not a bool" },
          ],
        },
      },
      {
        heading: "Comparisons: chaining, ==, is and in",
        body: "Python lets you chain comparisons the way you write them in maths: 0 <= x < 10 means 0 <= x and x < 10, with x evaluated only once.\n\n== asks \"are these values equal?\" while is asks \"are these the same object?\". Use is only for None (and other single objects like True or a sentinel); use == for numbers, strings and everything else. 1 == 1.0 is True even though the types differ.\n\nStrings compare letter by letter by their Unicode number, so \"apple\" < \"banana\" is True, but so is \"Zebra\" < \"apple\", because capital letters come first. Compare lower() versions when case should not matter. Ordering a string against a number with < raises TypeError, while == simply returns False.\n\nin on a string checks for a substring: \"py\" in \"python\" is True. On a list it scans item by item; on a set or dict it is almost instant, which matters once the collection is large.",
        bullets: [
          "x == 1 or x == 2 can become x in (1, 2)",
          "\"10\" == 10 is False: different types are never equal here",
          "not x in items works, but x not in items reads better",
        ],
      },
      {
        heading: "Simplifying redundant and nested checks",
        body: "Because an elif only runs when every earlier test failed, it never needs to repeat them. After if score >= 90, the next branch can be elif score >= 75; adding and score < 90 is dead weight that can drift out of sync later.\n\nOther simplifications come up all the time. Return a comparison directly: return n % 2 == 0 instead of an if that returns True or False. Write if is_valid: instead of if is_valid == True:. Use not to flip a test, and De Morgan's rule to tidy it: not (a and b) is the same as not a or not b.\n\nDeep nesting is the other enemy. Guard clauses check the bad cases first and leave the function early with return or raise, so the main logic sits at the left edge instead of four levels deep. Code with fewer levels has fewer places for bugs to hide.",
        visual: {
          type: "compare",
          title: "Nested checks vs guard clauses",
          columns: [
            { title: "Nested", points: ["if user: then if user.active: then if order:", "Main logic 3 levels deep", "else branches far from their if", "Hard to see every exit"] },
            { title: "Guard clauses", points: ["if not user: return early", "if not user.active: return early", "Main logic at the left edge", "Each problem handled in one line"] },
          ],
        },
      },
      {
        heading: "Conditional expressions, any() and all()",
        body: "When you only need to choose between two values, a conditional expression fits on one line: label = \"even\" if n % 2 == 0 else \"odd\". Read it as \"even, if n is even, otherwise odd\". Keep it to simple cases; nesting one inside another quickly becomes unreadable.\n\nWhen a condition depends on many items, any() and all() replace a loop with a flag. any(c.isdigit() for c in password) is True if at least one character is a digit. all(score >= 50 for score in scores) is True only if every score passes. Both stop as soon as the answer is known. Note that all() of an empty collection is True, which can surprise you.\n\nFor long chains of if x == \"a\" ... elif x == \"b\" that only pick a value, a dictionary lookup is often clearer: prices.get(size, 0) does in one line what five branches did.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What you can test in an if",
        root: "Condition",
        children: [
          { label: "Comparison", children: ["x == y, x != y", "0 <= x < 10"] },
          { label: "Membership", children: ["x in items", "key in my_dict"] },
          { label: "Identity", children: ["x is None", "x is not None"] },
          { label: "Truthiness", children: ["if items:", "if not name:"] },
          { label: "Combined", children: ["a and b, a or b, not a", "any(...), all(...)"] },
        ],
      },
      {
        type: "compare",
        title: "and vs or vs not",
        columns: [
          { title: "and", points: ["True only if both sides are", "Stops at the first falsy value", "Returns that value or the last one"] },
          { title: "or", points: ["True if either side is", "Stops at the first truthy value", "Returns that value or the last one"] },
          { title: "not", points: ["Flips truthiness", "Always returns True or False", "Binds tighter than and and or"] },
        ],
      },
    ],
    examples: [
      {
        title: "Shipping rules without repeated checks",
        explanation: "A shop charges 15.00 outside its home countries, ships free at home for orders of 50 or more, charges 4.99 otherwise, and adds 10 for express. Step 1: reject impossible input first with a guard clause. Step 2: test the most special case (abroad) first, so later branches do not need to repeat it. Step 3: the elif for free shipping only runs for home orders, so it needs no country check. Step 4: express is independent of the rest, so it gets its own if, not an elif.",
        code: {
          lang: "python",
          code: "def shipping_cost(total, country, express=False):\n    if total <= 0:\n        raise ValueError(\"total must be positive\")\n    if country not in (\"DE\", \"FR\", \"NL\"):\n        cost = 15.0\n    elif total >= 50:\n        cost = 0.0\n    else:\n        cost = 4.99\n    if express:\n        cost += 10\n    return cost\n\nprint(shipping_cost(60, \"DE\"), shipping_cost(20, \"FR\", True))  # 0.0 14.99",
        },
      },
      {
        title: "Checking a password with guard clauses and any()",
        explanation: "Each rule is checked in its own short if that returns a clear message as soon as something fails. Step 1: check the length. Step 2: any() looks for at least one digit and stops at the first one it finds. Step 3: the same for letters. Step 4: compare a lower-cased copy with a few known weak passwords using in. Step 5: if nothing failed, the function reaches the final return. There is no nesting at all, and adding a rule means adding one more if.",
        code: {
          lang: "python",
          code: "def check_password(pw):\n    if len(pw) < 12:\n        return \"Too short: use at least 12 characters\"\n    if not any(c.isdigit() for c in pw):\n        return \"Add at least one digit\"\n    if not any(c.isalpha() for c in pw):\n        return \"Add at least one letter\"\n    if pw.lower() in (\"password1234\", \"qwerty123456\"):\n        return \"Too common\"\n    return \"OK\"\n\nprint(check_password(\"hunter2\"))          # Too short: ...\nprint(check_password(\"correct-horse-42\"))  # OK",
        },
      },
    ],
    cheatSheet: [
      "0 <= x < 10 is a chained comparison: the same as 0 <= x and x < 10",
      "Test for None with x is None, never x == None",
      "x in (\"a\", \"b\") replaces x == \"a\" or x == \"b\"",
      "a or b returns a if a is truthy, else b: name = name or \"guest\"",
      "Precedence: not first, then and, then or; add parentheses when mixing them",
      "return n > 0 instead of if n > 0: return True else: return False",
      "label = \"even\" if n % 2 == 0 else \"odd\" chooses a value in one line",
      "any(...) is True if one item passes; all(...) if every item passes (all([]) is True)",
    ],
    quiz: [
      {
        q: "What does \"\" or \"guest\" evaluate to?",
        options: ["\"guest\"", "True", "\"\"", "False"],
        answer: 0,
        why: "or returns the first truthy value, and the empty string is falsy.",
      },
      {
        q: "Which condition checks that x is between 1 and 10, both included?",
        options: ["1 < x < 10", "x >= 1 or x <= 10", "1 <= x <= 10", "x in 1..10"],
        answer: 2,
        why: "A chained comparison with <= on both sides includes both ends; the or version is always True.",
      },
      {
        q: "score = 95. What does this print? if score >= 60: print(\"C\") then elif score >= 90: print(\"A\")",
        options: ["A", "C", "A and then C", "Nothing"],
        answer: 1,
        why: "The first true branch wins, so the broader test must come after the more specific one.",
      },
      {
        q: "What is the value of True or False and False?",
        options: ["False", "An error", "None", "True"],
        answer: 3,
        why: "and binds tighter, so it is True or (False and False), which is True.",
      },
      {
        q: "Why is if user and user.is_admin: safe when user might be None?",
        options: ["and turns None into an empty user", "and stops before reading user.is_admin when user is falsy", "Python ignores errors inside if conditions", "None has an is_admin attribute"],
        answer: 1,
        why: "Short-circuiting means the right side is never evaluated when the left side is falsy.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Classify a temperature t: below 0 is \"freezing\", below 15 is \"cold\", below 25 is \"mild\", anything else is \"hot\". Write it with no redundant checks.",
        hint: "Go from the lowest threshold up; each elif already knows the earlier tests failed.",
        solution: "t = 18\nif t < 0:\n    label = \"freezing\"\nelif t < 15:\n    label = \"cold\"\nelif t < 25:\n    label = \"mild\"\nelse:\n    label = \"hot\"\nprint(label)   # mild",
      },
      {
        level: "medium",
        task: "Write is_leap(year) as a single return expression. A year is a leap year if it is divisible by 4, except century years, which must also be divisible by 400. Test 1900, 2000, 2024 and 2026.",
        hint: "Combine with and and or, and use parentheses to make the grouping obvious.",
        solution: "def is_leap(year):\n    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)\n\nfor y in (1900, 2000, 2024, 2026):\n    print(y, is_leap(y))\n# 1900 False, 2000 True, 2024 True, 2026 False",
      },
      {
        level: "hard",
        task: "Write ticket_price(age, member=False): under 3 is free, under 12 pays 5, 65 and over pays 7, everyone else pays 12. Members get 2 off any price that is not free. A negative age raises ValueError. Use guard clauses and no nesting.",
        hint: "Handle the error and the free case first and return early; apply the member discount once at the end.",
        solution: "def ticket_price(age, member=False):\n    if age < 0:\n        raise ValueError(\"age cannot be negative\")\n    if age < 3:\n        return 0\n    if age < 12:\n        price = 5\n    elif age >= 65:\n        price = 7\n    else:\n        price = 12\n    return price - 2 if member else price",
      },
    ],
    faq: [
      { q: "Does Python have a switch statement?", a: "Since Python 3.10 it has match/case, which covers switch and more. For simple value-to-result mappings, a dictionary lookup like prices.get(size, 0) is often shorter." },
      { q: "Why does Python use indentation instead of braces?", a: "Indentation is part of the syntax: the lines indented under an if form its block. Use 4 spaces per level and never mix tabs and spaces, or you get IndentationError or TabError." },
      { q: "What is the difference between == and is?", a: "== checks whether two values are equal; is checks whether two names point to the very same object. Use is for None and == for everything else." },
      { q: "Can I write an if statement on one line?", a: "if x: print(x) is valid, but style guides discourage it. To choose between two values, use a conditional expression instead: y = a if condition else b." },
    ],
  },

  "control-flow/loops": {
    plain: [
      "Loops let a program repeat work without copying code. A for loop says \"for each item in this collection, do this\". It works on lists, strings (letter by letter), ranges of numbers, dictionaries, and even files (line by line).",
      "range() produces numbers on demand. range(5) gives 0, 1, 2, 3 and 4: it starts at 0 and stops just before the number you give. Use it when you need to repeat something a fixed number of times or count in steps.",
      "A while loop repeats as long as a condition stays True. Use it when you do not know in advance how many rounds you need, such as asking again until the user types something valid. Something inside the loop must eventually make the condition False, or it runs forever.",
      "break leaves a loop early and continue skips to the next round. Helpers like enumerate() (adds a counter) and zip() (walks two lists side by side) keep loops short and clear, so you almost never need to manage index numbers by hand.",
    ],
    deepDive: [
      {
        heading: "What a for loop really does",
        body: "A for loop works with any iterable, which means any object that can hand out its items one at a time. Behind the scenes Python calls iter() on the object to get an iterator, then calls next() on that iterator again and again. Each value is bound to the loop variable and the body runs. When the iterator has nothing left, it raises a special signal called StopIteration and the loop ends quietly.\n\nThis one protocol is why the same for syntax works on lists, strings, sets, dict keys, file lines and range objects. It is also why some things can only be looped over once: a file or a zip object is its own iterator, and once it is used up, a second loop gets nothing.\n\nOne more detail: the loop variable is an ordinary variable. After the loop it still holds the last value, and assigning to it inside the loop does not change the list.",
        visual: {
          type: "sequence",
          title: "for letter in \"ab\", behind the scenes",
          actors: ["for loop", "str \"ab\"", "iterator"],
          messages: [
            { from: 0, to: 1, label: "iter(\"ab\")" },
            { from: 1, to: 0, label: "Here is an iterator" },
            { from: 0, to: 2, label: "next(): gives \"a\", run body" },
            { from: 0, to: 2, label: "next(): gives \"b\", run body" },
            { from: 0, to: 2, label: "next() again" },
            { from: 2, to: 0, label: "StopIteration: loop ends" },
          ],
        },
      },
      {
        heading: "range() in depth",
        body: "range has three forms: range(stop), range(start, stop) and range(start, stop, step). The stop value is never included, which makes range(len(x)) and range(0, 10, 2) line up neatly with indexes. A negative step counts down: range(10, 0, -2) gives 10, 8, 6, 4, 2.\n\nA range does not build a list of numbers. It stores only start, stop and step and calculates each number when asked, so range(1_000_000_000) uses almost no memory, and len() and in on it are instant. Wrap it in list() when you want to see the numbers.\n\nA common beginner habit is for i in range(len(items)) followed by items[i]. Loop over the items directly instead, use enumerate() when you also need the position, and reversed(items) to walk backwards. Keep range for real counting jobs: repeat ten times, every third number, a countdown.",
        bullets: [
          "list(range(3)) is [0, 1, 2]",
          "range(5, 0, -1) gives 5, 4, 3, 2, 1",
          "range(0) and range(5, 2) are empty: the body never runs",
        ],
      },
      {
        heading: "while loops, exit conditions and the loop else",
        body: "Every while loop needs a clear answer to \"what makes this stop?\". Usually it is a variable that changes each round (a counter, the remaining input) or a break when you have what you need. The ask-until-valid pattern is while True: with a break on success; the condition is always True, so break is the only exit and is easy to spot.\n\nIf a loop runs away, press Ctrl+C. Python raises KeyboardInterrupt and stops.\n\nfor and while loops can also have an else block. It runs only when the loop ends normally, without break. That fits search loops perfectly: break when you find the item, and put the \"not found\" code in else. No extra found flag is needed. It reads strangely at first; think of it as \"no break\".",
        visual: {
          type: "cycle",
          title: "The ask-until-valid loop",
          steps: [
            { label: "Ask", detail: "input() returns the typed text" },
            { label: "Try to convert", detail: "int() or another check" },
            { label: "Valid?", detail: "Yes: break out of the loop" },
            { label: "Invalid", detail: "Print a helpful message" },
            { label: "Go again", detail: "while True starts the next round" },
          ],
        },
      },
      {
        heading: "enumerate, zip and looping over dicts",
        body: "enumerate(items) yields pairs of (position, item); start=1 makes it count from 1 for humans. zip(a, b) yields pairs of items taken side by side and stops at the end of the shortest input, silently dropping leftovers. From Python 3.10, zip(a, b, strict=True) raises ValueError instead, which catches mismatched data early.\n\nYou can unpack nested pairs right in the for line: for i, (name, score) in enumerate(zip(names, scores)):. dict(zip(keys, values)) builds a dictionary from two lists.\n\nLooping over a dict gives its keys. Use d.values() for values and d.items() for (key, value) pairs. Wrap any of these in sorted() to loop in a defined order, for example sorted(d.items()) for alphabetical keys.",
      },
      {
        heading: "Changing a collection while looping over it",
        body: "Removing items from a list while a for loop walks over it skips elements. The loop keeps an internal position; when you remove the current item, everything after it shifts left and the next item is jumped over. Try it: with nums = [1, 2, 2, 3], removing every 2 inside the loop leaves [1, 2, 3].\n\nThe fix is to build a new list with the items you want to keep, or to loop over a copy (for n in nums[:]) while changing the original. Dictionaries and sets are stricter: changing their size during a loop raises RuntimeError. Loop over list(d) when you need to delete keys.\n\nAlso remember that for x in nums: x = x * 2 changes nothing in nums, because x is only a name for each item. To change items in place, assign through the index, or build a new list.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "break vs continue vs loop else",
        columns: [
          { title: "break", points: ["Leaves the loop at once", "Skips the loop's else block", "Use when the job is done early"] },
          { title: "continue", points: ["Skips the rest of this round", "The loop goes on with the next item", "Use to ignore bad items"] },
          { title: "else", points: ["Runs when the loop ends without break", "Perfect for \"not found\"", "Read it as \"no break\""] },
        ],
      },
      {
        type: "tree",
        title: "What a for loop walks over",
        root: "for x in ...",
        children: [
          { label: "list or tuple", children: ["Each item in order"] },
          { label: "str", children: ["Each character"] },
          { label: "dict", children: ["Keys by default", "items() for key and value"] },
          { label: "range", children: ["Numbers, made on demand"] },
          { label: "open file", children: ["Each line, newline included"] },
          { label: "zip or enumerate", children: ["Tuples you can unpack"] },
        ],
      },
    ],
    examples: [
      {
        title: "Ranking players with zip and enumerate",
        explanation: "You have names and scores in two lists in the same order. Step 1: zip() pairs them, putting the score first so it is used for sorting. Step 2: sorted(..., reverse=True) puts the highest score first. Step 3: enumerate(..., start=1) adds the place number. Step 4: unpack the nested tuple right in the for line, so the body reads naturally. No index arithmetic anywhere.",
        code: {
          lang: "python",
          code: "names = [\"Ana\", \"Bo\", \"Cy\"]\nscores = [88, 95, 70]\n\nranked = sorted(zip(scores, names), reverse=True)\nfor place, (score, name) in enumerate(ranked, start=1):\n    print(f\"{place}. {name:<4} {score}\")\n# 1. Bo   95\n# 2. Ana  88\n# 3. Cy   70",
        },
      },
      {
        title: "Three tries to enter a valid number",
        explanation: "The user gets three attempts to pick a number from 1 to 10. Step 1: the while condition limits the attempts. Step 2: continue skips the rest of the round when the text is not a number. Step 3: break leaves the loop as soon as the value is valid. Step 4: the loop's else block runs only if the user used all three attempts without a break, so the failure message needs no extra flag variable.",
        code: {
          lang: "python",
          code: "attempts = 0\nwhile attempts < 3:\n    text = input(\"Pick 1-10: \").strip()\n    attempts += 1\n    if not text.isdigit():\n        print(\"Digits only, please\")\n        continue\n    n = int(text)\n    if 1 <= n <= 10:\n        print(\"Thanks, you picked\", n)\n        break\n    print(\"Out of range\")\nelse:\n    print(\"Too many tries, giving up\")",
        },
      },
    ],
    cheatSheet: [
      "range(10, 0, -2) gives 10, 8, 6, 4, 2: a negative step counts down, stop excluded",
      "for i, item in enumerate(items, start=1) gives a counter without range(len(...))",
      "zip(a, b, strict=True) raises ValueError when the lengths differ (Python 3.10+)",
      "for k, v in d.items() loops over a dict's keys and values together",
      "A loop's else block runs only if the loop finished without break",
      "while True: ... break is the standard pattern for ask-until-valid loops",
      "Never remove items from a list you are looping over; build a new list instead",
      "Ctrl+C stops a runaway loop in the terminal by raising KeyboardInterrupt",
    ],
    quiz: [
      {
        q: "What does list(range(1, 10, 3)) give?",
        options: ["[1, 4, 7]", "[1, 4, 7, 10]", "[3, 6, 9]", "[1, 3, 6, 9]"],
        answer: 0,
        why: "Start at 1, add 3 each time, and stop before 10.",
      },
      {
        q: "What does list(zip([1, 2, 3], \"ab\")) give?",
        options: ["ValueError, the lengths differ", "[(1, 'a'), (2, 'b'), (3, None)]", "[(1, 'a'), (2, 'b')]", "[1, 'a', 2, 'b']"],
        answer: 2,
        why: "zip stops at the shortest input unless you pass strict=True.",
      },
      {
        q: "When does the else block of a for loop run?",
        options: ["Always, after the loop", "Only if the loop body never ran", "Only when break was used", "When the loop finished without hitting break"],
        answer: 3,
        why: "else on a loop means \"no break happened\".",
      },
      {
        q: "nums = [1, 2, 3], then for x in nums: x = x * 10. What is nums afterwards?",
        options: ["[10, 20, 30]", "[1, 2, 3]", "[1, 2, 30]", "An error"],
        answer: 1,
        why: "x is just a name for each item; rebinding it does not change the list.",
      },
      {
        q: "Which loop fits \"keep asking until the user types a valid email\"?",
        options: ["for i in range(10)", "for c in email", "while True with a break when the input is valid", "A list comprehension"],
        answer: 2,
        why: "The number of rounds is unknown, which is exactly what while is for.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the 7 times table from 7 x 1 to 7 x 10. Then print only the results that are even.",
        hint: "range(1, 11) gives 1 to 10; use continue or an if to skip odd results.",
        solution: "for i in range(1, 11):\n    print(f\"7 x {i} = {7 * i}\")\n\nfor i in range(1, 11):\n    result = 7 * i\n    if result % 2:\n        continue\n    print(result)   # 14 28 42 56 70",
      },
      {
        level: "medium",
        task: "Given words = [\"go\", \"python\", \"is\", \"fun\", \"stop\", \"never\"], print each word with its position starting at 1. Skip words shorter than 3 letters and stop completely when you reach \"stop\".",
        hint: "enumerate(words, start=1), then continue for short words and break for \"stop\".",
        solution: "words = [\"go\", \"python\", \"is\", \"fun\", \"stop\", \"never\"]\nfor i, w in enumerate(words, start=1):\n    if w == \"stop\":\n        break\n    if len(w) < 3:\n        continue\n    print(i, w)\n# 2 python\n# 4 fun",
      },
      {
        level: "hard",
        task: "Write a guessing game: pick a secret number from 1 to 100 with random.randint, answer each guess with Higher or Lower, allow at most 7 guesses, and use the loop's else to reveal the number if the player runs out.",
        hint: "Seven guesses are always enough if you halve the range each time, because 2 to the power 7 is 128.",
        solution: "import random\nsecret = random.randint(1, 100)\ntries = 0\nwhile tries < 7:\n    guess = int(input(\"Guess 1-100: \"))\n    tries += 1\n    if guess == secret:\n        print(f\"Got it in {tries} tries!\")\n        break\n    print(\"Higher\" if guess < secret else \"Lower\")\nelse:\n    print(\"Out of tries, it was\", secret)",
      },
    ],
    faq: [
      { q: "How do I loop over a list backwards in Python?", a: "Use for item in reversed(items), or items[::-1] if you want a reversed copy. range(len(items) - 1, -1, -1) also works but is harder to read." },
      { q: "How do I get the index in a for loop?", a: "Use for i, item in enumerate(items). Use range(len(items)) only when you really need just the index, for example to change items in place." },
      { q: "Does Python have a do-while loop?", a: "No. Write while True:, put the body first, and end it with if condition: break, so the body always runs at least once." },
      { q: "How do I stop an infinite loop?", a: "Press Ctrl+C in the terminal, which raises KeyboardInterrupt. Then make sure something inside the loop changes the condition or reaches a break." },
    ],
  },

  "control-flow/functions": {
    plain: [
      "A function is a named piece of code you can run as often as you like. You write it once with def, and run it by calling its name with parentheses. Parameters are the inputs it expects; return sends a result back to whoever called it.",
      "Functions make programs readable. A good name like calculate_tax tells the reader what happens without reading every line. They also stop copy-paste: when a calculation lives in one function, you fix a bug in one place and every caller gets the fix.",
      "You can pass arguments by position, in order, or by name, like greet(name=\"Ana\"). Default values make some parameters optional. A parameter written with one star, like *args, collects any number of extra positional values, and the two-star kwargs parameter collects extra named values.",
      "A good function does one job, is short enough to read without scrolling, returns its result instead of printing it, and starts with a docstring that says what it does. Functions like that are easy to test, reuse and change.",
    ],
    deepDive: [
      {
        heading: "What happens during a call",
        body: "When you call area(3, 4), Python first evaluates the arguments. Then it creates a fresh frame, a private workspace for this one call, and binds each parameter name to the argument object. Nothing is copied: the parameter is a new name for the same object the caller passed. The body runs, and return hands one object back and throws the frame away. A function that ends without return gives back None.\n\nCalls can nest: main() calls total(), which calls round(). Python keeps a call stack of frames, one per active call, and returns to the right place when each one finishes. A traceback is simply a printout of that stack at the moment of an error.\n\nFunctions are objects too. You can store them in variables and pass them around without calling them. sorted(words, key=len) passes the len function itself, and sorted calls it on each word.",
        visual: {
          type: "layers",
          title: "The call stack while round() runs",
          layers: [
            { label: "round(13.5)", detail: "Running now; returns first" },
            { label: "total(prices)", detail: "Paused, waiting for round()" },
            { label: "main()", detail: "Paused, waiting for total()" },
            { label: "Module level", detail: "The script that called main()" },
          ],
        },
      },
      {
        heading: "Parameter kinds and the order rules",
        body: "Python has several kinds of parameters, and the def line must list them in this order. Plain parameters can be passed by position or by name. Parameters with defaults come after the ones without. *args then collects any extra positional arguments into a tuple. Any parameter after *args, or after a bare *, is keyword-only: callers must write its name. Last comes the two-star kwargs parameter, which collects extra named arguments into a dict. Since Python 3.8 you can also put a / in the list: parameters before it are positional-only.\n\nKeyword-only parameters are great for options: def connect(host, *, timeout=10) forces connect(\"db\", timeout=5), so nobody writes a mysterious connect(\"db\", 5).\n\nCalls have rules too: positional arguments first, then keywords. Passing the same parameter twice, or forgetting a required one, raises TypeError with a clear message. A star in a call does the opposite of a star in def: f(*point) spreads a list or tuple into separate arguments.",
        visual: {
          type: "tree",
          title: "Parameter kinds",
          root: "def parameters",
          children: [
            { label: "Normal", children: ["def f(a, b)", "f(1, 2) or f(b=2, a=1)"] },
            { label: "Default", children: ["def f(a, b=2)", "Caller may leave b out"] },
            { label: "*args", children: ["Extra positional values", "Arrives as a tuple"] },
            { label: "Keyword-only", children: ["Names after * or *args", "Must be passed by name"] },
            { label: "kwargs (two stars)", children: ["Extra named values", "Arrives as a dict"] },
            { label: "Positional-only", children: ["Names before /", "Cannot be passed by name"] },
          ],
        },
      },
      {
        heading: "Return values: one, many, or None",
        body: "return ends the function immediately, even in the middle of a loop. That makes early returns a clean way to handle special cases first.\n\nA function always returns exactly one object, but that object can be a tuple, so return low, high effectively returns two values. The caller unpacks them with low, high = min_max(data).\n\nThe difference between print and return confuses many beginners. print() shows text to a human and the function still returns None. return gives the value to the calling code, which can store it, test it or pass it on. Most functions should return; only the outer layer of a program should print.\n\nTry to return one kind of thing. A function that returns a number on success but the string \"error\" on failure forces every caller to check the type. Raise an exception for failures instead, and the normal return value stays simple.",
      },
      {
        heading: "Docstrings, names and lambdas",
        body: "A docstring is a string literal written as the first statement in the function body. Python stores it, help(func) prints it, and editors show it when you hover over a call. The common convention (PEP 257) is a one-line summary in command form, such as \"Return the area of a rectangle.\", then a blank line and details: arguments, the return value and errors it may raise.\n\nNames matter as much as code. Use verbs for actions (parse_date, send_email, load_config) and is_ or has_ prefixes for functions that return True or False (is_valid, has_access). If you cannot name a function without the word and, it probably does two jobs.\n\nlambda creates a tiny unnamed function from one expression, like lambda p: p[1]. It is handy as a key for sorted() or max(). If you need a name, a docstring or more than one expression, write a normal def.",
      },
      {
        heading: "Refactoring a script into small functions",
        body: "Most programs start as one long script that reads input, calculates and prints. Refactoring means restructuring that code without changing what it does. Read through and mark blocks that do one job: parse the input, validate it, compute a result, format the output. Move each block into a function, turn the variables it reads into parameters, and return what it produces instead of setting globals.\n\nFinally, write a main() function that calls the pieces in order; that is the only place that talks to the user. Run the program after each step to check that it still behaves the same.\n\nThe payoff is testability. A function like apply_discount(total, percent) can be checked with a few assert lines in seconds, with no typing at a prompt. The rule of thumb: pure calculation in small functions, input and output at the edges.",
        visual: {
          type: "flow",
          title: "Refactoring one block into a function",
          steps: [
            { label: "Spot one job", detail: "A block that parses, checks or computes" },
            { label: "Name it", detail: "A verb that says what it does" },
            { label: "Move into def", detail: "Variables it reads become parameters" },
            { label: "Return the result", detail: "No print or global changes inside" },
            { label: "Call from main()", detail: "main() is the only place doing I/O" },
            { label: "Test with assert", detail: "Check a few inputs in seconds" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How arguments are matched to parameters",
        steps: [
          { label: "Positional first", detail: "Filled left to right" },
          { label: "Then keywords", detail: "Matched by name" },
          { label: "Extras collected", detail: "Into *args or the kwargs dict, if present" },
          { label: "Defaults fill gaps", detail: "For parameters nobody passed" },
          { label: "Anything missing?", detail: "A required parameter left empty raises TypeError" },
        ],
      },
      {
        type: "compare",
        title: "print() inside vs return",
        columns: [
          { title: "print() inside", points: ["Shows text to a person", "Function returns None", "Caller cannot reuse the value", "Hard to test"] },
          { title: "return", points: ["Hands the value to the caller", "Caller decides to print, save or combine", "Easy to check with assert", "The normal choice"] },
        ],
      },
    ],
    examples: [
      {
        title: "A logging helper with *args and keyword options",
        explanation: "You want log(\"info\", \"User\", \"logged in\", user=\"ana\") to print one tidy line. Step 1: level is a normal parameter. Step 2: *parts collects any number of message pieces into a tuple. Step 3: sep is keyword-only because it comes after *parts, so it can never be filled by accident. Step 4: the two-star context parameter collects all other named arguments into a dict. Step 5: a caller with a ready-made dict can spread it into the call with two stars.",
        code: {
          lang: "python",
          code: "def log(level, *parts, sep=\" \", **context):\n    \"\"\"Print a log line with optional key=value context.\"\"\"\n    message = sep.join(str(p) for p in parts)\n    extras = \" \".join(f\"{k}={v}\" for k, v in context.items())\n    print(f\"[{level.upper()}] {message} {extras}\".rstrip())\n\nlog(\"info\", \"User\", \"logged in\", user=\"ana\", ip=\"10.0.0.5\")\n# [INFO] User logged in user=ana ip=10.0.0.5\nlog(\"debug\", \"a\", \"b\", \"c\", sep=\"/\")\n# [DEBUG] a/b/c\nsettings = {\"user\": \"bo\", \"attempt\": 3}\nlog(\"warn\", \"Retrying\", **settings)\n# [WARN] Retrying user=bo attempt=3",
        },
      },
      {
        title: "Turning a script into three small functions",
        explanation: "The original script read a line of prices, added them, took 10% off and printed the total, all in one block. Step 1: parsing the text becomes parse_prices(), which returns a list. Step 2: the discount becomes apply_discount() with a default of 0 and a guard against silly percentages. Step 3: main() is the only part that uses input() and print(). Now both helpers can be tested with assert without typing anything.",
        code: {
          lang: "python",
          code: "def parse_prices(text):\n    \"\"\"Turn \"3.50, 2, 4.25\" into a list of floats.\"\"\"\n    return [float(p) for p in text.split(\",\") if p.strip()]\n\ndef apply_discount(total, percent=0):\n    \"\"\"Return total reduced by percent (0 to 100).\"\"\"\n    if not 0 <= percent <= 100:\n        raise ValueError(\"percent must be between 0 and 100\")\n    return total * (1 - percent / 100)\n\ndef main():\n    prices = parse_prices(input(\"Prices: \"))\n    total = apply_discount(sum(prices), percent=10)\n    print(f\"{len(prices)} items, total {total:.2f}\")\nmain()",
        },
      },
    ],
    cheatSheet: [
      "A function without a return statement returns None",
      "return a, b returns a tuple; unpack it with x, y = f()",
      "def connect(host, *, timeout=10): names after * must be passed by keyword",
      "def f(a, /, b): a is positional-only (Python 3.8+)",
      "f(*point) spreads a list or tuple into separate positional arguments",
      "help(func) prints its docstring; editors show it on hover",
      "Defaults are evaluated once, when def runs: use None for list and dict defaults",
      "Name functions with verbs (parse_date) and yes/no functions with is_ or has_",
    ],
    quiz: [
      {
        q: "def f(a, b=2, *args): ... What is args inside the call f(1, 2, 3, 4)?",
        options: ["[3, 4]", "(3, 4)", "(2, 3, 4)", "{3, 4}"],
        answer: 1,
        why: "a and b take 1 and 2, and the remaining positional values are collected into a tuple.",
      },
      {
        q: "Which call to def area(width, height=1) is a SyntaxError?",
        options: ["area(3)", "area(3, 4)", "area(height=2, width=3)", "area(width=3, 4)"],
        answer: 3,
        why: "A positional argument cannot follow a keyword argument in a call.",
      },
      {
        q: "def add(a, b): print(a + b). What is x after x = add(2, 3)?",
        options: ["None", "5", "\"5\"", "An error"],
        answer: 0,
        why: "The function prints 5 but has no return statement, so it returns None.",
      },
      {
        q: "Why write def send(msg, *, retries=3)?",
        options: ["To make retries positional-only", "To accept any number of messages", "To force callers to write retries=... by name", "To make retries a dict"],
        answer: 2,
        why: "A bare * makes every parameter after it keyword-only.",
      },
      {
        q: "What does sorted(words, key=len) pass to sorted?",
        options: ["The length of the list", "The result of calling len() once", "A string", "The len function itself, which sorted calls on each word"],
        answer: 3,
        why: "Without parentheses, len is the function object, not a call.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write bmi(weight_kg, height_m) with a docstring that returns the body mass index rounded to 1 decimal. Call it once with positional and once with keyword arguments.",
        hint: "BMI is weight divided by height squared; round(x, 1) rounds to one decimal.",
        solution: "def bmi(weight_kg, height_m):\n    \"\"\"Return the body mass index, rounded to 1 decimal.\"\"\"\n    return round(weight_kg / (height_m * height_m), 1)\n\nprint(bmi(70, 1.75))                       # 22.9\nprint(bmi(height_m=1.6, weight_kg=55))     # 21.5",
      },
      {
        level: "medium",
        task: "Write stats(*numbers) that returns (minimum, maximum, average) as a tuple and raises ValueError when called with no numbers. Unpack the result at the call site.",
        hint: "numbers is a tuple, so min(), max(), sum() and len() all work on it directly.",
        solution: "def stats(*numbers):\n    \"\"\"Return (min, max, average) of the given numbers.\"\"\"\n    if not numbers:\n        raise ValueError(\"need at least one number\")\n    return min(numbers), max(numbers), sum(numbers) / len(numbers)\n\nlow, high, avg = stats(3, 9, 6)\nprint(low, high, avg)   # 3 9 6.0",
      },
      {
        level: "hard",
        task: "Write build_url(base, *parts, plus a two-star query parameter) so that build_url(\"https://api.example.com\", \"users\", 42, page=2, sort=\"name\") returns https://api.example.com/users/42?page=2&sort=name.",
        hint: "Join the path parts with /, then add ? and key=value pairs joined with &. Real code should use urllib.parse.urlencode to escape values.",
        solution: "def build_url(base, *parts, **query):\n    \"\"\"Join path parts and add a query string.\"\"\"\n    url = base.rstrip(\"/\")\n    for part in parts:\n        url += \"/\" + str(part).strip(\"/\")\n    if query:\n        url += \"?\" + \"&\".join(f\"{k}={v}\" for k, v in query.items())\n    return url\n\nprint(build_url(\"https://api.example.com\", \"users\", 42, page=2, sort=\"name\"))",
      },
    ],
    faq: [
      { q: "What is the difference between a parameter and an argument?", a: "A parameter is the name in the def line; an argument is the actual value passed in a call. In def greet(name), name is the parameter; in greet(\"Ana\"), \"Ana\" is the argument." },
      { q: "What do *args and kwargs mean in Python?", a: "*args collects extra positional arguments into a tuple, and the two-star kwargs parameter collects extra keyword arguments into a dict. The names are only a convention; the stars do the work." },
      { q: "How long should a function be?", a: "Long enough to do one clear job, often under 20 to 30 lines. If you need the word and to describe it, or you must scroll to read it, split it up." },
      { q: "Can a Python function return more than one value?", a: "It returns one object, but that object can be a tuple: return low, high. The caller unpacks it with low, high = f()." },
    ],
  },

  "control-flow/scope": {
    plain: [
      "Scope answers one question: when the code says a name, which variable does it mean right here? A name created inside a function exists only inside that function, and only while it runs. Names created at the top level of a file are global to that file.",
      "Python looks names up in a fixed order: Local (this function), Enclosing (any outer function), Global (the file), then Built-in (Python's own names like print and len). Because each function has its own local names, two functions can both use a variable called total without clashing.",
      "None is Python's special \"nothing here\" value. Functions that do not return anything give back None, and you can use None as a placeholder meaning \"no value yet\" or \"not found\".",
      "A pure function uses only its inputs and changes nothing outside itself, so the same inputs always give the same output. Real programs must print, save and talk to the network, but keeping those side effects at the edges and the calculations pure makes code far easier to test and trust.",
    ],
    deepDive: [
      {
        heading: "Why UnboundLocalError happens",
        body: "Python decides which names are local before the function ever runs, when it compiles the function. The rule: any name that is assigned anywhere in the function body is local for the whole function. Assignment includes =, +=, a for loop variable, def and import.\n\nSo this fails: count = 0 at the top of the file, then a function containing count += 1. Because count is assigned inside the function, Python treats it as local everywhere in that function. count += 1 first needs to read the local count, which has no value yet, and you get UnboundLocalError: cannot access local variable 'count' where it is not associated with a value.\n\nA function that only reads count, without assigning it, would happily see the global. The clean fix is almost never the global keyword. Pass the value in as a parameter and return the new value.",
        visual: {
          type: "flow",
          title: "How count += 1 becomes UnboundLocalError",
          steps: [
            { label: "Compile the function", detail: "Python scans the whole body first" },
            { label: "Sees count += 1", detail: "That is an assignment to count" },
            { label: "Marks count local", detail: "For the entire function body" },
            { label: "Call the function", detail: "count += 1 must read count first" },
            { label: "No local value yet", detail: "UnboundLocalError, the global is ignored" },
          ],
        },
      },
      {
        heading: "global, nonlocal and closures",
        body: "global x inside a function says \"x here means the module-level x\", so assigning to it changes the global. nonlocal x does the same for a variable of an enclosing function. Both work, but they create hidden links between parts of a program, so use them rarely.\n\nThere is a sneakier case. Changing a global object, such as items.append(x) on a global list, needs no keyword at all, because you are not rebinding the name, only changing the object it points to. That is exactly why such code is easy to miss in review.\n\nAn inner function can remember variables of the outer function even after the outer function has returned. This is called a closure. make_counter() can define count = 0 and an inner function that does nonlocal count; count += 1. Each call to make_counter() creates its own independent count. Closures power decorators, which you will meet later.",
      },
      {
        heading: "None in practice",
        body: "There is exactly one None object in a running program, and its type is NoneType. You meet it in three common places. First, every function without a return gives None. Second, methods that change an object in place return None on purpose: list.sort(), list.append(), dict.update() and random.shuffle(). That is why items = items.sort() leaves you with None. Third, lookups that can fail often return None, such as d.get(\"missing\").\n\nNone is also the standard default for optional parameters: def greet(name=None):, then fill in a real value inside.\n\nAlways test with is None or is not None. It checks identity with the one None object, cannot be fooled by a class's own == logic, and linters flag == None. Be careful with if not x: it is also True for 0, \"\" and [], which might be perfectly valid values.",
        visual: {
          type: "compare",
          title: "if x is None vs if not x",
          columns: [
            { title: "if x is None", points: ["True only for None", "0 and \"\" pass as real values", "Use for \"was anything given?\"", "Exact and explicit"] },
            { title: "if not x", points: ["True for None, 0, \"\", [], {}", "Treats empty like missing", "Use for \"is there anything in it?\"", "Short, but broader"] },
          ],
        },
      },
      {
        heading: "Pure functions and side effects",
        body: "A side effect is anything a function does besides returning a value: printing, writing files, sending HTTP requests, changing a global, or changing a list that was passed in. Reading hidden inputs, such as the clock or random numbers, also makes results unpredictable.\n\nA pure function has neither. Same inputs, same output, nothing else touched. That buys a lot: you can test it with one assert, call it in any order, cache its results with functools.lru_cache, and run it safely in parallel.\n\nMutating arguments is the most common hidden side effect. A function that does prices[i] *= 1.2 on the list it was given changes the caller's list too, because the parameter is just another name for the same object. Returning a new list avoids the surprise.\n\nA practical design is often called functional core, imperative shell: pure functions do the thinking, and a thin main() does all the input and output.",
        visual: {
          type: "layers",
          title: "Functional core, imperative shell",
          layers: [
            { label: "Shell: main()", detail: "Reads input, prints, saves files" },
            { label: "Core: pure functions", detail: "Parse, calculate, format" },
            { label: "Plain data", detail: "Numbers, strings, lists and dicts passed in and out" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A closure keeps its own variable",
        actors: ["Caller", "make_counter()", "inc()"],
        messages: [
          { from: 0, to: 1, label: "c = make_counter()" },
          { from: 1, to: 1, label: "count = 0, define inc" },
          { from: 1, to: 0, label: "Returns inc, which remembers count" },
          { from: 0, to: 2, label: "c()" },
          { from: 2, to: 0, label: "nonlocal count becomes 1, returns 1" },
          { from: 0, to: 2, label: "c() again" },
          { from: 2, to: 0, label: "Returns 2" },
        ],
      },
      {
        type: "tree",
        title: "Common side effects to watch for",
        root: "Side effects",
        children: [
          { label: "Output", children: ["print()", "Logging"] },
          { label: "Outside world", children: ["Writing files", "HTTP requests, databases"] },
          { label: "Shared state", children: ["Rebinding globals", "Mutating arguments"] },
          { label: "Hidden inputs", children: ["Current time", "random numbers"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing UnboundLocalError in a score counter",
        explanation: "A game keeps score in a global, and add_points_broken() crashes on its first call. Step 1: because score is assigned inside the function, Python treats it as local, and += needs to read it before it has a value. Step 2: instead of adding global score, pass the current score in and return the new one. Step 3: the caller stores the result. The function is now pure, and the flow of data is visible in the call itself.",
        code: {
          lang: "python",
          code: "score = 0\n\ndef add_points_broken(points):\n    score += points\n\ntry:\n    add_points_broken(10)\nexcept UnboundLocalError as err:\n    print(err)  # cannot access local variable 'score' where it is not ...\n\ndef add_points(current, points):\n    return current + points\n\nscore = add_points(score, 10)\nscore = add_points(score, 5)\nprint(score)    # 15",
        },
      },
      {
        title: "A function that secretly changed its caller's list",
        explanation: "apply_discount_in_place() looked harmless, but after calling it the original cart prices were gone. Step 1: the parameter prices is a second name for the caller's list, so assigning prices[i] changes that list. Step 2: the pure version builds and returns a new list and leaves the input alone. Step 3: the printout proves the difference: cart is unchanged after the pure call and changed after the in-place call.",
        code: {
          lang: "python",
          code: "def apply_discount_in_place(prices, pct):\n    for i in range(len(prices)):\n        prices[i] = round(prices[i] * (1 - pct / 100), 2)\n\ndef apply_discount(prices, pct):\n    return [round(p * (1 - pct / 100), 2) for p in prices]\n\ncart = [10.0, 25.0]\nsale = apply_discount(cart, 20)\nprint(cart, sale)    # [10.0, 25.0] [8.0, 20.0]\napply_discount_in_place(cart, 20)\nprint(cart)          # [8.0, 20.0]  the caller's list changed",
        },
      },
    ],
    cheatSheet: [
      "Any name assigned inside a function is local for the whole function",
      "items.append(x) on a global list needs no global keyword, which makes it easy to miss",
      "nonlocal x rebinds an enclosing function's name; global x rebinds a module-level name",
      "list.sort(), list.append() and dict.update() return None: never assign their result",
      "if x is None tests for missing; if not x is also True for 0, \"\" and []",
      "Shadowed a built-in in the REPL (list = ...)? del list brings the real one back",
      "Pure core, thin shell: calculate in pure functions, do input and output in main()",
      "A for loop does not create a scope: its variable still exists after the loop",
    ],
    quiz: [
      {
        q: "x = 10 at module level. Inside f(), the first line is print(x) and the second is x = 5. What happens when you call f()?",
        options: ["Prints 10", "Prints 5", "UnboundLocalError", "NameError"],
        answer: 2,
        why: "The later assignment makes x local for the whole function, so print(x) reads an unset local.",
      },
      {
        q: "What does result = [3, 1, 2].sort() leave in result?",
        options: ["[1, 2, 3]", "None", "[3, 1, 2]", "An error"],
        answer: 1,
        why: "list.sort() sorts in place and returns None; use sorted() for a new list.",
      },
      {
        q: "Which function is pure?",
        options: ["def f(x): print(x); return x", "def f(items): items.append(1)", "def f(): return random.random()", "def f(a, b): return a * b"],
        answer: 3,
        why: "It depends only on its inputs and has no side effects; the others print, mutate or use hidden randomness.",
      },
      {
        q: "Inside a nested function, which keyword lets you rebind a variable of the outer function?",
        options: ["nonlocal", "global", "outer", "static"],
        answer: 0,
        why: "nonlocal targets the nearest enclosing function scope; global targets the module.",
      },
      {
        q: "Why prefer x is None over x == None?",
        options: ["is is slower but safer", "is checks identity with the single None object, so a class's own == cannot fool it", "== None is a SyntaxError", "They differ only in Python 2"],
        answer: 1,
        why: "There is only one None, so an identity check is exact, and linters flag == None.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Predict the output, then run it to check: name = \"global\", a function show() that sets name = \"local\" and prints it, then show() and print(name).",
        hint: "The assignment inside show() creates a new local name; the global is untouched.",
        solution: "name = \"global\"\n\ndef show():\n    name = \"local\"\n    print(name)\n\nshow()        # local\nprint(name)   # global",
      },
      {
        level: "medium",
        task: "This code uses a global list: cart = [] and def add(item): cart.append(item). Rewrite add as a pure function add(cart, item) that returns a new list and leaves the original alone. Prove it with a print.",
        hint: "cart + [item] builds a brand-new list.",
        solution: "def add(cart, item):\n    \"\"\"Return a new cart with item added.\"\"\"\n    return cart + [item]\n\nempty = []\nfull = add(empty, \"milk\")\nprint(empty, full)   # [] ['milk']",
      },
      {
        level: "hard",
        task: "Write make_counter(start=0, step=1) that returns a function; each call of that function returns the next number. Two counters must not affect each other. Then explain why the returned function is not pure.",
        hint: "Store the running value in the outer function and use nonlocal in the inner one.",
        solution: "def make_counter(start=0, step=1):\n    value = start - step\n    def next_value():\n        nonlocal value\n        value += step\n        return value\n    return next_value\n\na, b = make_counter(), make_counter(10, 5)\nprint(a(), a(), b(), b())   # 0 1 10 15\n# Not pure: the same call gives a different result each time.",
      },
    ],
    faq: [
      { q: "Are global variables bad in Python?", a: "Module-level constants like MAX_SIZE = 100 are fine and common. The trouble comes from many functions changing shared global state, because then any function can silently change what another one sees." },
      { q: "Is None the same as null?", a: "It plays the same role: no value. When you save data as JSON, Python's None becomes null, and null becomes None when you load it back." },
      { q: "Why did my variable disappear after the function ended?", a: "Local names only live while the function runs. To keep a result, return it and store it in a variable where you called the function." },
      { q: "Does a for loop or an if block create its own scope?", a: "No. Only functions, classes and modules create scopes in Python, so a loop variable still exists after the loop. Comprehensions are the exception: their loop variable stays inside." },
    ],
  },

  "control-flow/match": {
    plain: [
      "match looks at one value and compares it with a list of shapes, called patterns. The first case whose pattern fits runs, and the rest are skipped. Think of a sorting machine with slots of different shapes: each parcel drops into the first slot it fits.",
      "It is more than a switch statement. A pattern can check an exact value, the structure of a list or tuple, the keys of a dictionary, or the type of an object, and it can pull pieces out into variables in the same step.",
      "match needs Python 3.10 or newer. End the list with case _: as a catch-all, like else. If nothing matches and there is no catch-all, nothing happens and no error is raised.",
      "It is not a replacement for every if. match shines when you branch on the shape of data: commands typed by a user, JSON messages from an API, tokens in a parser. For range checks like score >= 90, a plain if/elif stays clearer.",
    ],
    deepDive: [
      {
        heading: "The pattern kinds",
        body: "Literal patterns match exact values: numbers, strings, None, True and False. A capture pattern is a bare name like x; it matches anything and binds the value to that name. The wildcard _ also matches anything but binds nothing. A value pattern is a dotted name like Color.RED or HTTPStatus.OK; it is compared with ==.\n\nStructural patterns go further. Sequence patterns like [x, y] or [first, *rest] match lists and tuples by length and position. Mapping patterns like {\"type\": \"click\", \"x\": x} match dicts that contain those keys. Class patterns like Point(x=0, y=y) check the type, then the attributes.\n\nYou can combine patterns. An OR pattern, 200 | 201 | 204, matches any of the alternatives. An as pattern, case [x, y] as pair, binds the whole matched value too. Patterns nest freely, so one case can describe a dict that holds a list of numbers.",
        visual: {
          type: "tree",
          title: "Pattern kinds with examples",
          root: "case patterns",
          children: [
            { label: "Literal", children: ["case 404:", "case \"quit\":", "case None:"] },
            { label: "Capture and wildcard", children: ["case x: binds anything", "case _: matches, binds nothing"] },
            { label: "Value", children: ["case Color.RED:", "Dotted names compare with =="] },
            { label: "Sequence", children: ["case [x, y]:", "case [first, *rest]:"] },
            { label: "Mapping", children: ["case {\"type\": \"click\"}:", "Extra keys are ignored"] },
            { label: "Class", children: ["case Point(x=0, y=y):", "case str(s):"] },
          ],
        },
      },
      {
        heading: "Guards, order and unreachable cases",
        body: "A guard adds an if to a case: case int(n) if n < 0:. The pattern is tried first; if it fits, the guard is checked; if the guard is False, Python simply moves on to the next case. Guards let you mix structure checks with value checks such as ranges.\n\nCases are tried strictly top to bottom, so put specific cases before general ones. Python helps a little: a case that can match anything, such as case _: or case x:, followed by more cases is a SyntaxError (\"makes remaining patterns unreachable\"), because those later cases could never run.\n\nUnlike switch in C or Java, there is no fall-through. Exactly one case block runs, or none, and you never need break. To share a body between several values, use an OR pattern instead of stacking cases.",
      },
      {
        heading: "Sequence and mapping patterns in detail",
        body: "A sequence pattern matches lists, tuples and other sequences, but deliberately not strings or bytes, so case [a, b] will not split \"ab\" into letters. The length must match exactly unless you use a star: [first, *rest] needs at least one item, and [*_, last] grabs the final one. Matching command.split() against [\"go\", direction] is a neat way to parse simple text commands.\n\nA mapping pattern matches any dict that has at least the listed keys with matching values; extra keys are ignored, which is exactly what you want for JSON from an API. Values inside can be any pattern, including type checks: {\"user\": {\"name\": str(name)}} matches only when name is really a string.\n\nThese structural checks replace a lot of defensive code: isinstance, len and key in checks that you would otherwise write by hand before touching the data.",
        visual: {
          type: "flow",
          title: "Checking case {\"type\": \"move\", \"x\": int(x)}",
          steps: [
            { label: "Is it a mapping?", detail: "Lists, strings and None fail here" },
            { label: "Has key \"type\"?", detail: "Missing key: try the next case" },
            { label: "Value is \"move\"?", detail: "Compared with ==" },
            { label: "Has key \"x\" with an int?", detail: "int(x) checks the type" },
            { label: "Bind x and run", detail: "Extra keys never matter" },
          ],
        },
      },
      {
        heading: "Class patterns and their traps",
        body: "case Point(x=0, y=y): first checks isinstance(subject, Point), then compares subject.x with 0 and binds subject.y to y. Keyword sub-patterns work with any class. Positional sub-patterns such as Point(0, y) need the class to define __match_args__, which dataclasses create for you automatically.\n\nBuilt-in types have a shortcut: int(n), str(s), float(f) and similar check the type and bind the whole value. Watch the order with numbers: bool is a subclass of int, so case int(): also matches True. Put case bool(): first if you treat them differently.\n\nThe classic trap is constants. case MAX: with a bare name is a capture pattern: it matches everything and overwrites MAX. Use a dotted name (Limits.MAX, an Enum member) or a literal value. Linters and the SyntaxError for unreachable cases often catch this, but not always.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "When to use match and when to keep if",
        columns: [
          { title: "Use match", points: ["One subject, many shapes", "Unpacking lists, dicts or objects", "Commands, events, parsed tokens", "Several values share one branch"] },
          { title: "Keep if/elif", points: ["Range checks like x >= 90", "Conditions on different variables", "Only two or three simple branches", "Code must run on Python before 3.10"] },
        ],
      },
    ],
    examples: [
      {
        title: "Handling JSON-like events from a web app",
        explanation: "A front end sends dicts such as {\"type\": \"click\", \"x\": 3, \"y\": 7, \"time\": 1}. Step 1: the first case matches clicks only when x and y are ints, and binds them. Step 2: an OR pattern catches the two closing keys. Step 3: any other key event binds its key name. Step 4: any dict with a type is acknowledged. Step 5: case _ handles anything that is not an event at all. Without match this would need several isinstance, in and len checks.",
        code: {
          lang: "python",
          code: "def handle(event):\n    match event:\n        case {\"type\": \"click\", \"x\": int(x), \"y\": int(y)}:\n            return f\"Click at {x},{y}\"\n        case {\"type\": \"key\", \"key\": \"Escape\" | \"q\"}:\n            return \"Closing\"\n        case {\"type\": \"key\", \"key\": str(k)}:\n            return f\"Key {k}\"\n        case {\"type\": t}:\n            return f\"Ignored event {t!r}\"\n        case _:\n            return \"Not an event\"\n\nprint(handle({\"type\": \"click\", \"x\": 3, \"y\": 7, \"time\": 1}))  # Click at 3,7\nprint(handle([1, 2]))                                          # Not an event",
        },
      },
      {
        title: "Refactoring an HTTP status chain",
        explanation: "The old code was if status == 200 or status == 201 or status == 204, then more elifs. Step 1: OR patterns group the success codes and the redirect codes on one line each. Step 2: 404 is a simple literal. Step 3: a class pattern with a guard handles every 5xx code without listing them. Step 4: case _ replaces the final else. Each line now says what it means, and adding a code is a one-word change.",
        code: {
          lang: "python",
          code: "def describe(status):\n    match status:\n        case 200 | 201 | 204:\n            return \"Success\"\n        case 301 | 302 | 307 | 308:\n            return \"Redirect\"\n        case 404:\n            return \"Not found\"\n        case int(code) if 500 <= code < 600:\n            return f\"Server error {code}\"\n        case _:\n            return \"Other\"\n\nprint(describe(204), describe(503), describe(418))\n# Success Server error 503 Other",
        },
      },
    ],
    cheatSheet: [
      "match needs Python 3.10 or newer; check with python3 --version",
      "case 200 | 201 | 204: an OR pattern matches any of the alternatives",
      "case [first, *rest]: matches a list or tuple with at least one item",
      "case {\"type\": \"click\"}: matches any dict with that key and value; extra keys are ignored",
      "case Point(x=0, y=y): checks the type, then compares and binds attributes",
      "case Color.RED: dotted names compare values; a bare name always captures",
      "Sequence patterns never match strings, so case [a, b] ignores \"ab\"",
      "No case matched and no case _? Nothing runs and no error is raised",
    ],
    quiz: [
      {
        q: "What does case [x, *rest]: match?",
        options: ["Only lists of exactly two items", "Any list or tuple with at least one item", "Any string", "Only an empty list"],
        answer: 1,
        why: "x needs one item and *rest takes zero or more remaining items.",
      },
      {
        q: "Does case {\"type\": \"key\", \"key\": k}: match {\"type\": \"key\", \"key\": \"a\", \"shift\": True}?",
        options: ["No, the dict has an extra key", "Only if shift is False", "Yes: extra keys are ignored and k becomes \"a\"", "It raises KeyError"],
        answer: 2,
        why: "Mapping patterns only require the listed keys to be present and match.",
      },
      {
        q: "MAX = 10 is defined, then match n: case MAX: ... What does case MAX do?",
        options: ["Compares n with 10", "Raises NameError", "Matches nothing", "Matches any value and rebinds MAX to it"],
        answer: 3,
        why: "A bare name is a capture pattern; only dotted names are compared as values.",
      },
      {
        q: "What happens when no case matches and there is no case _?",
        options: ["Nothing runs and execution continues after the match", "MatchError is raised", "The last case runs anyway", "SyntaxError"],
        answer: 0,
        why: "match is silent when nothing fits, so add case _ if you need to handle the rest.",
      },
      {
        q: "Why does case [a, b]: not match the string \"hi\"?",
        options: ["The string is too short", "Sequence patterns deliberately exclude str and bytes", "Strings are immutable", "It does match"],
        answer: 1,
        why: "Treating text as a sequence of letters is rarely intended, so str is excluded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write day_type(day) using match. Return \"weekend\" for \"sat\" or \"sun\", \"weekday\" for the other five short names, and \"unknown\" for anything else.",
        hint: "Use OR patterns with | and finish with case _.",
        solution: "def day_type(day):\n    match day.lower():\n        case \"sat\" | \"sun\":\n            return \"weekend\"\n        case \"mon\" | \"tue\" | \"wed\" | \"thu\" | \"fri\":\n            return \"weekday\"\n        case _:\n            return \"unknown\"\n\nprint(day_type(\"Sun\"), day_type(\"wed\"), day_type(\"x\"))",
      },
      {
        level: "medium",
        task: "Write where(p) that describes a point given as a 2-item tuple: \"origin\" for (0, 0), \"on the x-axis at X\", \"on the y-axis at Y\", \"at X, Y\" otherwise, and \"not a point\" for anything that is not a 2-item sequence.",
        hint: "Mix literals and captures inside one tuple pattern, most specific first.",
        solution: "def where(p):\n    match p:\n        case (0, 0):\n            return \"origin\"\n        case (x, 0):\n            return f\"on the x-axis at {x}\"\n        case (0, y):\n            return f\"on the y-axis at {y}\"\n        case (x, y):\n            return f\"at {x}, {y}\"\n        case _:\n            return \"not a point\"",
      },
      {
        level: "hard",
        task: "Build a tiny shopping-list shell with the commands add ITEM [QTY], remove ITEM, show and quit. QTY defaults to 1 and must be digits. Match on input().split() and print a help line for anything else.",
        hint: "Two add cases: one without a quantity, one with a guard qty.isdigit(). A short case body may sit on the same line as its case.",
        solution: "items = {}\nwhile True:\n    match input(\"> \").split():\n        case [\"add\", name]:\n            items[name] = items.get(name, 0) + 1\n        case [\"add\", name, qty] if qty.isdigit():\n            items[name] = items.get(name, 0) + int(qty)\n        case [\"remove\", name]: items.pop(name, None)\n        case [\"show\"]: print(items)\n        case [\"quit\"]: break\n        case _: print(\"Try: add ITEM [QTY], remove ITEM, show, quit\")",
      },
    ],
    faq: [
      { q: "Is match/case the same as switch in other languages?", a: "It can do everything a switch does, and it also unpacks lists, dicts and objects. There is no fall-through between cases, so you never write break." },
      { q: "Is match faster than if/elif?", a: "Not in a way that matters for normal code. Choose it for readability when you check one value against many shapes." },
      { q: "Why does my case catch everything?", a: "A bare name such as case status: is a capture pattern that matches any value. Compare against constants with dotted names like Status.OK or with literal values." },
      { q: "Can match check the type of a value?", a: "Yes, with class patterns such as case int(): or case str(s):. Put case bool() before case int(), because True and False are ints too." },
    ],
  },
};

export default extra;
