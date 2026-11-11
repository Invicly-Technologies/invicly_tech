import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "oop/classes": {
    plain: [
      "So far you have kept data in lists and dicts and written separate functions to work on it. That works, but as a program grows you end up passing the same dict into ten functions and hoping nobody misspells a key. A class lets you put the data and the functions that change it in one place.",
      "Think of a class as a form with blank boxes, and each object as one filled-in copy of that form. The class Account says every account has an owner and a balance. Account(\"Ana\", 50) fills in one copy. Account(\"Bo\", 200) fills in another. They follow the same rules but keep their own numbers.",
      "A method is just a function that lives inside the class. When you write acct.deposit(10), Python quietly passes acct in as the first argument, which by convention is called self. That is how the method knows which account to change.",
      "You do not need classes for everything. A small script with a few functions is often clearer. Reach for a class when you have a thing with state (data that changes over time) and several actions that belong to that thing, like a bank account, a shopping cart or a game character.",
    ],
    deepDive: [
      {
        heading: "What self really is",
        body: "There is no magic in self. When you write a.deposit(25), Python looks up deposit on the class and calls Account.deposit(a, 25). The object before the dot becomes the first argument. You could write that longer form yourself and it would work the same way.\n\nThe name self is only a convention, but every Python programmer expects it, so always use it. If you forget it in the parameter list, you get an error like TypeError: deposit() takes 1 positional argument but 2 were given, because Python still passes the object in. Inside a method, you must write self.balance, not just balance. A bare name is a local variable that disappears when the method returns.",
        bullets: ["a.deposit(25) is the same as Account.deposit(a, 25)", "a.deposit without () is a bound method you can store and call later", "Forgetting self in def gives a 'takes N positional arguments' TypeError"],
      },
      {
        heading: "How Python finds an attribute",
        body: "Every instance stores its own attributes in a dict you can see with vars(a) or a.__dict__. When you read a.bank, Python first looks in the instance's dict. If the name is not there, it looks in the class, then in parent classes. If nothing is found, you get AttributeError.\n\nAssignment works differently. a.bank = \"Other\" always writes into the instance's own dict. It does not change the class attribute; it creates a new instance attribute that hides (shadows) the class one for that object only. Other instances still see the class value. To change the shared value for everyone, assign to the class: Account.bank = \"Other\".",
        visual: {
          type: "flow",
          title: "Reading a.bank, step by step",
          steps: [
            { label: "Instance dict", detail: "Is 'bank' in vars(a)? Use it" },
            { label: "Class", detail: "Else look in Account" },
            { label: "Parent classes", detail: "Else follow the inheritance chain" },
            { label: "AttributeError", detail: "Nothing found anywhere" },
          ],
        },
      },
      {
        heading: "The shared mutable class attribute trap",
        body: "Class attributes are fine for values that never change per object, like a constant rate or a bank name. They are a trap for lists and dicts. If you write history = [] at class level and then self.history.append(x) in a method, every instance appends to the same single list, because append changes the list in place and never creates an instance attribute.\n\nThe fix is simple: create mutable values inside __init__, so each object gets its own. Use class attributes only for shared constants or for things you really want shared, like a counter of how many objects were created (and then update it through the class name).",
        bullets: ["Shared constant: RATE = 0.02 at class level is fine", "Per-object list: self.history = [] inside __init__", "Count instances with Account.count += 1, not self.count += 1"],
      },
      {
        heading: "Keeping objects valid: properties and naming",
        body: "Python has no private keyword. Instead, a single leading underscore, like self._balance, tells other programmers: this is internal, do not touch it from outside. A double underscore, self.__pin, triggers name mangling: Python renames it to _Account__pin to avoid clashes in subclasses. It is not real security.\n\nTo control access, use @property. A property looks like a normal attribute from outside (acct.balance) but runs a method. Add a setter with @balance.setter to validate new values, for example raise ValueError on a negative balance. This lets you start with a plain attribute and add checks later without changing any code that uses the class.",
      },
      {
        heading: "Three kinds of methods",
        body: "A normal method takes self and works on one instance. A @classmethod takes cls (the class itself) instead. Its most common use is an alternative constructor: Account.from_dict(data) reads a dict and returns cls(data[\"owner\"], data[\"balance\"]). Because it uses cls, it also works correctly for subclasses.\n\nA @staticmethod takes neither self nor cls. It is just a plain function placed in the class because it belongs there logically, like a helper that checks whether an IBAN string looks valid. If a static method does not really relate to the class, a module-level function is usually simpler.",
        bullets: ["def deposit(self, amt): works on one object", "@classmethod def from_dict(cls, d): builds objects", "@staticmethod def is_valid(code): needs no object at all"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Dict plus functions vs a class",
        columns: [
          { title: "Dict + functions", points: ["acct = {\"owner\": \"Ana\", \"balance\": 50}", "deposit(acct, 10)", "Typos in keys fail late", "Rules spread across files"] },
          { title: "Class", points: ["acct = Account(\"Ana\", 50)", "acct.deposit(10)", "Typos raise AttributeError", "Rules live next to the data"] },
        ],
      },
      {
        type: "tree",
        title: "Modelling a small library system",
        root: "Library domain",
        children: [
          { label: "Book", children: ["title, author, isbn", "is_available()"] },
          { label: "Member", children: ["name, borrowed list", "can_borrow()"] },
          { label: "Library", children: ["books, members", "lend(book, member)", "give_back(book)"] },
        ],
      },
    ],
    examples: [
      {
        title: "A bank account that refuses bad withdrawals",
        explanation: "Step 1: store the owner and balance in __init__, with a separate history list per object. Step 2: deposit checks that the amount is positive. Step 3: withdraw refuses to go below zero by raising ValueError, so the account can never be in an invalid state. Step 4: every successful change is logged in history, so you can later show a statement.",
        code: {
          lang: "python",
          code: "class Account:\n    def __init__(self, owner, balance=0):\n        self.owner, self.balance = owner, balance\n        self.history = []          # one list per account\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError(\"amount must be positive\")\n        self.balance += amount\n        self.history.append((\"deposit\", amount))\n    def withdraw(self, amount):\n        if amount > self.balance:\n            raise ValueError(\"insufficient funds\")\n        self.balance -= amount\n        self.history.append((\"withdraw\", amount))",
        },
      },
      {
        title: "Modelling a shopping cart with two classes",
        explanation: "Nouns in the problem become classes (Product, Cart) and verbs become methods (add, total). Step 1: Product holds a name and a price. Step 2: Cart holds a dict mapping product to quantity. Step 3: total() adds price times quantity for each line. Note that Cart does not copy prices; it asks each Product, so a price change shows up everywhere.",
        code: {
          lang: "python",
          code: "class Product:\n    def __init__(self, name, price):\n        self.name, self.price = name, price\n\nclass Cart:\n    def __init__(self):\n        self.lines = {}            # Product -> quantity\n    def add(self, product, qty=1):\n        self.lines[product] = self.lines.get(product, 0) + qty\n    def total(self):\n        return sum(p.price * q for p, q in self.lines.items())\n\npen = Product(\"pen\", 1.5)\ncart = Cart(); cart.add(pen, 4); cart.add(Product(\"pad\", 3))\nprint(cart.total())   # 9.0",
        },
      },
    ],
    cheatSheet: [
      "obj.method(x) is shorthand for Class.method(obj, x)",
      "vars(obj) shows an instance's own attributes as a dict",
      "Create lists and dicts in __init__, never as class attributes",
      "self._name means internal by convention; Python does not enforce it",
      "@property lets you add validation without changing how callers use the attribute",
      "@classmethod def from_x(cls, ...): return cls(...) is the usual alternative constructor",
      "isinstance(obj, Account) checks the type, including subclasses",
    ],
    quiz: [
      {
        q: "Account has class attribute bank = \"A\". You run a.bank = \"B\". What does Account(\"Bo\").bank return?",
        options: ["\"B\"", "\"A\"", "AttributeError", "None"],
        answer: 1,
        why: "Assigning through a creates an instance attribute on a only; the class value is unchanged.",
      },
      {
        q: "A class has items = [] at class level and methods call self.items.append(x). What happens with two instances?",
        options: ["Each instance gets its own list", "The second instance raises an error", "Python copies the list on first append", "Both instances share and change the same list"],
        answer: 3,
        why: "append modifies the one class-level list in place, so every instance sees every item.",
      },
      {
        q: "What is the main use of @classmethod?",
        options: ["Alternative constructors such as from_dict that return cls(...)", "Making a method private", "Running a method without any arguments", "Making a method faster"],
        answer: 0,
        why: "A classmethod receives the class as cls, so it can build and return new instances, also for subclasses.",
      },
      {
        q: "You defined def area(): inside a class and call r.area(). What error do you get?",
        options: ["NameError: self is not defined", "AttributeError: area", "TypeError: area() takes 0 positional arguments but 1 was given", "SyntaxError"],
        answer: 2,
        why: "Python always passes the instance as the first argument, and the method accepts none.",
      },
      {
        q: "Inside a method you write balance = 100 instead of self.balance = 100. What happens?",
        options: ["The object's balance becomes 100", "A local variable is set and then lost when the method returns", "Python raises NameError", "The class attribute balance becomes 100"],
        answer: 1,
        why: "Without self., the name is a local variable of the method, not an attribute of the object.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a Counter class with a value that starts at 0, an increment() method and a reset() method. Create two counters and show that they count independently.",
        hint: "Set self.value in __init__ and change it in the methods.",
        solution: "class Counter:\n    def __init__(self):\n        self.value = 0\n    def increment(self):\n        self.value += 1\n    def reset(self):\n        self.value = 0\n\na, b = Counter(), Counter()\na.increment(); a.increment(); b.increment()\nprint(a.value, b.value)   # 2 1",
      },
      {
        level: "medium",
        task: "Write a Temperature class that stores Celsius and has a fahrenheit property. Setting celsius below -273.15 must raise ValueError.",
        hint: "Use @property for celsius with a @celsius.setter, and store the value in self._celsius.",
        solution: "class Temperature:\n    def __init__(self, celsius):\n        self.celsius = celsius          # goes through the setter\n    @property\n    def celsius(self):\n        return self._celsius\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15: raise ValueError(\"below absolute zero\")\n        self._celsius = value\n    @property\n    def fahrenheit(self): return self._celsius * 9 / 5 + 32",
      },
      {
        level: "hard",
        task: "Model a tiny library: Book (title, available flag) and Library (list of books) with lend(title) that marks a book unavailable, raising LookupError if it is missing and ValueError if it is already lent. Add a classmethod Library.from_titles(list_of_titles).",
        hint: "Search self.books for the matching title; the classmethod builds Book objects and returns cls(books).",
        solution: "class Book:\n    def __init__(self, title): self.title, self.available = title, True\nclass Library:\n    def __init__(self, books):\n        self.books = list(books)\n    @classmethod\n    def from_titles(cls, titles): return cls(Book(t) for t in titles)\n    def lend(self, title):\n        book = next((b for b in self.books if b.title == title), None)\n        if book is None: raise LookupError(title)\n        if not book.available: raise ValueError(f\"{title} is already lent\")\n        book.available = False",
      },
    ],
    faq: [
      { q: "Do I always need __init__?", a: "No. If a class has no per-object data to set up, Python uses a default initialiser. But most classes that hold data define one." },
      { q: "What is the difference between a function and a method?", a: "A method is a function defined inside a class. When called on an instance, the instance is passed in automatically as self." },
      { q: "Does Python have private attributes?", a: "Not truly. A leading underscore marks a name as internal by convention, and a double underscore only renames it. Anyone can still reach it." },
      { q: "When should I not use a class?", a: "When you only have one function, or data that never changes and has no behaviour. A function or a dict is simpler there, and a dataclass fits plain records." },
    ],
  },

  "oop/inheritance": {
    plain: [
      "Inheritance means one class builds on another. If you write class Square(Rectangle):, Square gets everything Rectangle has for free, and you only write what is different. The original is called the parent (or base class) and the new one the child (or subclass).",
      "The child can override a method, which means it defines a method with the same name to replace the parent's version. It can also extend a method: run the parent's version with super() and then add its own steps. That is how you reuse code without copying it.",
      "Composition is the other way to reuse code. Instead of saying a Car is an Engine, you say a Car has an Engine and keep one as an attribute. The car asks the engine to start. You can swap in an electric engine without touching the Car class. Most experienced developers reach for composition first.",
      "Dunder methods (short for double underscore, like __repr__) are hooks Python calls for you. Define __repr__ and your object prints nicely. Define __eq__ and == compares contents. Define __len__ and len() works. They make your classes behave like built-in types.",
    ],
    deepDive: [
      {
        heading: "Method resolution order: where Python looks",
        body: "When you call sq.area(), Python searches a fixed list of classes called the MRO (method resolution order). For class Square(Rectangle), the MRO is Square, Rectangle, object. Python uses the first class in that list that defines area. Every class ends with object, which supplies defaults like __repr__ and __eq__.\n\nYou can print the MRO with Square.__mro__ or Square.mro(). With multiple inheritance (class C(A, B)), Python builds the order with an algorithm called C3, which keeps each class before its parents and keeps the order you listed bases in. super() follows this same list, so it means \"the next class in the MRO\", not always \"my direct parent\".",
        visual: {
          type: "layers",
          title: "Square(3).area() lookup, top to bottom",
          layers: [
            { label: "Square", detail: "Defines __init__ only; keep looking" },
            { label: "Rectangle", detail: "Defines area(): use this one" },
            { label: "object", detail: "Base of everything; default __repr__, __eq__" },
          ],
        },
      },
      {
        heading: "Overriding and extending with super()",
        body: "Overriding replaces the parent's method completely. Extending keeps it and adds to it. To extend, call super().method(...) inside your version. This is most important in __init__: if the child defines its own __init__ and forgets super().__init__(...), the parent's setup never runs and its attributes do not exist. You will see AttributeError later, far from the real cause.\n\nA good override keeps the same parameters and return type as the parent, so code written for the parent still works with the child. This idea is called the Liskov substitution principle: anywhere a Rectangle is expected, a Square should work without surprises.",
        bullets: ["Override: def area(self): return math.pi * self.r * self.r", "Extend: super().save(); self.log(\"saved\")", "isinstance(sq, Rectangle) is True for a subclass instance"],
      },
      {
        heading: "__repr__, __str__ and __eq__ done right",
        body: "__repr__ should return a string for developers, ideally one that looks like code to recreate the object, such as Point(x=1, y=2). __str__ is the friendly version for users. print() and str() use __str__, but if you only define __repr__, Python uses it for both. Lists always show the repr of their items, which is why __repr__ matters most.\n\nIn __eq__, return NotImplemented (not False) when the other object is a type you do not understand. Python then tries the other side's __eq__, and falls back to an identity check. One more rule: defining __eq__ sets __hash__ to None, so your objects can no longer go in a set or be dict keys. If they are immutable, define __hash__ using the same fields as __eq__.",
        bullets: ["f\"{obj!r}\" forces the repr inside an f-string", "Equal objects must have equal hashes", "functools.total_ordering fills in <=, >, >= from __eq__ and __lt__"],
      },
      {
        heading: "Other useful dunder methods",
        body: "Dunder methods let your objects work with Python's built-in syntax. __len__ makes len(obj) work. __iter__ makes for loops work. __contains__ powers the in operator. __getitem__ enables obj[key]. __bool__ decides whether the object counts as true in an if; without it, Python uses __len__, and if neither exists the object is always true. __add__ defines +, and __lt__ defines <, which also makes sorted() work.\n\nYou rarely call dunders yourself. Write len(cart), not cart.__len__(). Implement only the ones that make your class more natural to use; a Playlist with __len__ and __iter__ feels like a built-in collection.",
      },
      {
        heading: "Refactoring a deep hierarchy into composition",
        body: "Deep trees grow fast. You start with Employee, add Manager(Employee), then RemoteManager(Manager), then RemoteContractorManager. Each new combination needs a new class, and a change near the top can break everything below it.\n\nThe fix is to pull each varying behaviour out into its own small object and pass it in. An Employee has a pay_policy (Salaried or Hourly) and a location (Office or Remote). Now any combination is just a different pair of parts, chosen at runtime, and each part is easy to test alone. Use inheritance when the child truly is a kind of the parent and the tree stays one or two levels deep.",
        visual: {
          type: "sequence",
          title: "Composition: Employee delegates pay to a policy",
          actors: ["Payroll", "Employee", "HourlyPolicy"],
          messages: [
            { from: 0, to: 1, label: "monthly_pay()" },
            { from: 1, to: 2, label: "pay(hours=160)" },
            { from: 2, to: 1, label: "160 x rate" },
            { from: 1, to: 0, label: "amount" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which dunder powers which syntax",
        root: "Your class",
        children: [
          { label: "Printing", children: ["__repr__: REPL, lists, debug", "__str__: print(), str()"] },
          { label: "Comparing", children: ["__eq__: ==", "__lt__: < and sorted()", "__hash__: sets, dict keys"] },
          { label: "Containers", children: ["__len__: len()", "__iter__: for loops", "__contains__: in", "__getitem__: obj[i]"] },
          { label: "Truth and maths", children: ["__bool__: if obj", "__add__: +"] },
        ],
      },
    ],
    examples: [
      {
        title: "Extending a parent with super()",
        explanation: "A Notifier sends messages. An EmailNotifier needs the same setup plus an address. Step 1: the child calls super().__init__(name) so the parent sets self.name and self.sent. Step 2: send() is extended: it adds the email part to the text, then calls the parent's send to record it. Without the super().__init__ call, self.sent would not exist and send() would crash.",
        code: {
          lang: "python",
          code: "class Notifier:\n    def __init__(self, name):\n        self.name = name\n        self.sent = []\n    def send(self, text):\n        self.sent.append(text)\nclass EmailNotifier(Notifier):\n    def __init__(self, name, address):\n        super().__init__(name)\n        self.address = address\n    def send(self, text):\n        super().send(f\"to {self.address}: {text}\")\n\nn = EmailNotifier(\"ops\", \"ops@example.com\")\nn.send(\"disk full\"); print(n.sent)",
        },
      },
      {
        title: "A Money value object with equality and hashing",
        explanation: "Money should compare by value: 5 EUR equals 5 EUR even if they are different objects. Step 1: __eq__ compares amount and currency, returning NotImplemented for other types. Step 2: because we defined __eq__, we must add __hash__ (using the same fields) to keep Money usable in sets. Step 3: __repr__ shows the values. The set below ends up with two items, not three.",
        code: {
          lang: "python",
          code: "class Money:\n    def __init__(self, amount, currency):\n        self.amount, self.currency = amount, currency\n    def __eq__(self, other):\n        if not isinstance(other, Money):\n            return NotImplemented\n        return (self.amount, self.currency) == (other.amount, other.currency)\n    def __hash__(self):\n        return hash((self.amount, self.currency))\n    def __repr__(self):\n        return f\"Money({self.amount!r}, {self.currency!r})\"\n\nprint({Money(5, \"EUR\"), Money(5, \"EUR\"), Money(5, \"USD\")})",
        },
      },
    ],
    cheatSheet: [
      "class Child(Parent): inherits every attribute and method of Parent",
      "super().__init__(...) runs the parent's setup; forget it and parent attributes are missing",
      "ClassName.__mro__ shows the exact order Python searches for methods",
      "print() uses __str__ and falls back to __repr__; lists always show __repr__",
      "Return NotImplemented from __eq__ for unknown types, not False",
      "Defining __eq__ removes the default __hash__; add one back for immutable objects",
      "Ask is-a or has-a: is-a may be inheritance, has-a is composition",
    ],
    quiz: [
      {
        q: "A child class defines __init__ but never calls super().__init__(). What usually happens?",
        options: ["Python calls the parent's __init__ automatically", "A SyntaxError at class definition", "Attributes set by the parent's __init__ are missing, causing AttributeError later", "The child cannot be instantiated"],
        answer: 2,
        why: "Defining __init__ in the child replaces the parent's, so the parent's setup only runs if you call it.",
      },
      {
        q: "You define __eq__ on a class but not __hash__. What happens when you put an instance in a set?",
        options: ["TypeError: unhashable type", "It works using the object's id", "It works using __eq__", "The set silently stays empty"],
        answer: 0,
        why: "Defining __eq__ sets __hash__ to None, which makes instances unhashable.",
      },
      {
        q: "A class defines only __repr__. What does print(obj) show?",
        options: ["The default <... object at 0x...> text", "An empty line", "A TypeError", "The string returned by __repr__"],
        answer: 3,
        why: "When __str__ is missing, str() and print() fall back to __repr__.",
      },
      {
        q: "Which design is composition?",
        options: ["class Car(Engine): ...", "A Car stores self.engine = engine and calls self.engine.start()", "class ElectricCar(Car): ...", "Engine.start = Car.start"],
        answer: 1,
        why: "Composition means an object holds another object and delegates work to it.",
      },
      {
        q: "What does super() refer to in a class with multiple inheritance?",
        options: ["Always the first base class listed", "The object class", "The next class in the method resolution order", "A random parent"],
        answer: 2,
        why: "super() follows the MRO, which is why cooperative multiple inheritance works.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Shape class with area() returning 0 and a __repr__ that shows the class name and area. Subclass it as Circle(r) and override area().",
        hint: "Use type(self).__name__ in __repr__ so subclasses show their own name.",
        solution: "import math\nclass Shape:\n    def area(self): return 0\n    def __repr__(self):\n        return f\"{type(self).__name__}(area={self.area():.2f})\"\n\nclass Circle(Shape):\n    def __init__(self, r): self.r = r\n    def area(self): return math.pi * self.r ** 2\n\nprint(Circle(1))   # Circle(area=3.14)",
      },
      {
        level: "medium",
        task: "Write a Playlist class that holds song titles and supports len(p), for song in p, and \"x\" in p, without inheriting from list.",
        hint: "Store a list in self._songs and implement __len__, __iter__ and __contains__ by delegating to it.",
        solution: "class Playlist:\n    def __init__(self, songs=()):\n        self._songs = list(songs)\n    def __len__(self):\n        return len(self._songs)\n    def __iter__(self):\n        return iter(self._songs)\n    def __contains__(self, title):\n        return title in self._songs\n\np = Playlist([\"Intro\", \"Rain\"])\nprint(len(p), \"Rain\" in p, list(p))",
      },
      {
        level: "hard",
        task: "You have Report, PdfReport(Report), EmailedPdfReport(PdfReport) and EmailedCsvReport(CsvReport). Refactor to one Report class that takes a formatter and a sender object.",
        hint: "Each formatter has render(data) and each sender has send(content). Report just calls both.",
        solution: "class CsvFormatter:\n    def render(self, data): return \",\".join(map(str, data))\nclass EmailSender:\n    def __init__(self, to): self.to = to\n    def send(self, content): print(f\"mail {self.to}: {content}\")\nclass Report:\n    def __init__(self, formatter, sender):\n        self.formatter, self.sender = formatter, sender\n    def publish(self, data):\n        self.sender.send(self.formatter.render(data))\nReport(CsvFormatter(), EmailSender(\"me@x.io\")).publish([1, 2])\n# PdfFormatter or SlackSender: just another small class, no new subclass",
      },
    ],
    faq: [
      { q: "Does Python support multiple inheritance?", a: "Yes. class C(A, B): inherits from both, and the method resolution order decides which method wins. Keep it for small mixin classes; it gets confusing fast." },
      { q: "What is the difference between __str__ and __repr__?", a: "__repr__ is for developers and should be unambiguous; __str__ is for end users. If you write only one, write __repr__." },
      { q: "Should I inherit from list or dict to make my own collection?", a: "Usually not. Built-in methods may bypass your overrides. Wrap a list in an attribute (composition), or use collections.UserList or collections.abc base classes." },
      { q: "What is an abstract base class?", a: "A class from the abc module that marks methods with @abstractmethod. You cannot create an instance of it until a subclass implements those methods, which documents the required interface." },
    ],
  },

  "oop/dataclasses": {
    plain: [
      "Many classes are just records: an order has an id, a customer and some items. Writing __init__, __repr__ and __eq__ by hand for each one is boring and easy to get wrong. Put @dataclass above the class and list the fields with types, and Python writes those methods for you.",
      "A field is one line like price: float. The type after the colon is required by @dataclass, because that is how it spots fields. Python does not check the type when the program runs, though. It is a label for you, your editor and tools like mypy.",
      "An Enum (short for enumeration) is a fixed list of named choices. Instead of writing status = \"paid\" all over your code and hoping nobody types \"piad\", you write Status.PAID. A typo then fails right away with AttributeError, and your editor can suggest the valid options.",
      "Together they make data clear. A dataclass says what a record contains. An Enum says which values a field may take. Your future self, and anyone reading the code, can understand the data model in a few seconds.",
    ],
    deepDive: [
      {
        heading: "What @dataclass generates, and the options that change it",
        body: "With no options, @dataclass reads the annotated class attributes in order and generates __init__ (one parameter per field), __repr__ (ClassName(field=value, ...)) and __eq__ (compares all fields as a tuple, only between objects of the same class). Because it defines __eq__, it sets __hash__ to None, so normal dataclass instances cannot go in sets.\n\nOptions switch on more. order=True adds <, <=, > and >=, comparing fields in the order they are declared, so sorting works. frozen=True blocks assignment after creation and, together with eq, generates __hash__. slots=True (Python 3.10+) uses __slots__ for less memory per object. kw_only=True (3.10+) forces callers to name every argument, which avoids mixing up two floats.",
        bullets: ["@dataclass(order=True) makes sorted(list_of_objects) work", "@dataclass(frozen=True) gives read-only, hashable objects", "@dataclass(kw_only=True) means Order(id=1, total=9.5), never Order(1, 9.5)"],
      },
      {
        heading: "Defaults, field() and __post_init__",
        body: "Fields without defaults must come before fields with defaults, just like function parameters; otherwise you get TypeError: non-default argument follows default argument. A plain list, dict or set as a default raises ValueError, because one object would be shared by every instance. Use field(default_factory=list) so each instance gets a fresh one.\n\nfield() has other useful flags: repr=False hides a field from the printout (good for passwords), compare=False leaves it out of ==, and init=False removes it from __init__ so you can compute it. Computing happens in __post_init__, a method the generated __init__ calls at the end. It is also the right place to validate: raise ValueError if quantity is negative.",
        bullets: ["tags: list[str] = field(default_factory=list)", "token: str = field(repr=False)", "total: float = field(init=False), then set it in __post_init__"],
        visual: {
          type: "flow",
          title: "What happens on Order(1, items=[\"book\"])",
          steps: [
            { label: "Generated __init__", detail: "Assigns id and items in field order" },
            { label: "Apply defaults", detail: "status gets PENDING; factories build new lists" },
            { label: "__post_init__", detail: "Your code: validate and compute derived fields" },
            { label: "Object ready", detail: "Raises early if anything was invalid" },
          ],
        },
      },
      {
        heading: "Frozen dataclasses and replace()",
        body: "With frozen=True, any assignment like p.x = 5 raises dataclasses.FrozenInstanceError. That sounds limiting, but it is very useful: a frozen object can never change behind your back, can be shared safely, and can be a dict key or set member because it is hashable.\n\nTo get a changed version, make a new object with dataclasses.replace(p, x=5). It copies every field and overrides the ones you name. Note that frozen is shallow: if a frozen object holds a list, the list itself can still be changed. Use a tuple instead of a list inside frozen dataclasses when you want full immutability.",
      },
      {
        heading: "Enums in depth: name, value, lookup and StrEnum",
        body: "Each Enum member has a .name (\"PAID\") and a .value (\"paid\"). You can look a member up by value with Status(\"paid\") or by name with Status[\"PAID\"]; a bad value raises ValueError, which is perfect for checking input. Members are singletons, so compare them with is or ==. list(Status) gives all members in order, which is handy for building menus or validating options.\n\nA plain Enum member is never equal to its raw value: Status.PAID == \"paid\" is False. If you need members that behave like strings, for example to write them straight to JSON, use StrEnum (Python 3.11+): its members are real str objects, so they compare equal to text. auto() fills in values for you; with StrEnum it uses the lowercased member name.",
        bullets: ["Status(\"paid\") finds a member by value, Status[\"PAID\"] by name", "Status.PAID.value gives the raw \"paid\" for saving", "@enum.unique raises an error if two members share a value"],
      },
      {
        heading: "Saving and loading dataclasses as JSON",
        body: "dataclasses.asdict(obj) turns a dataclass (and any nested dataclasses, lists and dicts inside it) into plain dicts, ready for json.dumps. One catch: a plain Enum member stays an Enum, and json.dumps raises TypeError: Object of type Status is not JSON serializable. Convert it first with .value, or use StrEnum.\n\nLoading is the reverse, and you write it yourself: read the dict, convert raw values back (Status(d[\"status\"])), and pass the dict to the class as keyword arguments. A @classmethod from_dict keeps this logic in one place. Remember that the type hints do not validate anything, so check the data in __post_init__ if it comes from outside your program.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "A dataclass round trip through a JSON file",
        steps: [
          { label: "Order object", detail: "Fields with Enum and list values" },
          { label: "asdict()", detail: "Nested plain dicts and lists" },
          { label: "Enum to .value", detail: "Make every value JSON friendly" },
          { label: "json.dump to file", detail: "Text on disk" },
          { label: "from_dict()", detail: "Status(raw), then Order(...) rebuilds it" },
        ],
      },
      {
        type: "compare",
        title: "Choosing a record type",
        columns: [
          { title: "dict", points: ["No fixed fields", "Typos fail late as KeyError", "Great for raw JSON", "No methods"] },
          { title: "@dataclass", points: ["Named, typed fields", "Methods and validation", "Mutable by default", "Best general choice"] },
          { title: "NamedTuple", points: ["Immutable tuple", "Unpacks like a tuple", "Very lightweight", "No validation hook"] },
        ],
      },
    ],
    examples: [
      {
        title: "An invoice line that validates itself",
        explanation: "Step 1: declare the fields; total is init=False because we compute it. Step 2: __post_init__ rejects a negative quantity and calculates total. Step 3: order=True lets us sort lines; since total is excluded from comparison with compare=False, sorting uses sku, then price, then qty. Creating a bad line fails at once, not three functions later.",
        code: {
          lang: "python",
          code: "from dataclasses import dataclass, field\n\n@dataclass(order=True)\nclass Line:\n    sku: str\n    price: float\n    qty: int = 1\n    total: float = field(init=False, compare=False)\n    def __post_init__(self):\n        if self.qty < 0:\n            raise ValueError(\"qty must be >= 0\")\n        self.total = self.price * self.qty\nlines = sorted([Line(\"B2\", 3.0, 2), Line(\"A1\", 9.5)])\nprint(lines[0])   # Line(sku='A1', price=9.5, qty=1, total=9.5)\nLine(\"C3\", 1.0, -1)   # ValueError: qty must be >= 0",
        },
      },
      {
        title: "Replacing magic strings with an Enum",
        explanation: "Old code compared task[\"state\"] == \"done\" in many places, and one place had \"Done\". Step 1: define State as a StrEnum, so values are still plain text in JSON. Step 2: parse input with State(raw), which raises ValueError for unknown text. Step 3: compare with State.DONE everywhere. A typo like State.DNOE now fails immediately with AttributeError.",
        code: {
          lang: "python",
          code: "from enum import StrEnum, auto\nimport json\n\nclass State(StrEnum):\n    TODO = auto()      # value \"todo\"\n    DOING = auto()\n    DONE = auto()\n\nraw = json.loads('{\"title\": \"ship\", \"state\": \"done\"}')\nstate = State(raw[\"state\"])\nprint(state is State.DONE, state == \"done\")   # True True\nprint(json.dumps({\"state\": state}))           # {\"state\": \"done\"}\nState(\"finished\")   # ValueError: 'finished' is not a valid State",
        },
      },
    ],
    cheatSheet: [
      "@dataclass generates __init__, __repr__ and __eq__ from annotated fields",
      "Use field(default_factory=list) for list, dict or set defaults",
      "frozen=True: read-only and hashable; change with dataclasses.replace(obj, x=1)",
      "Put validation and computed fields in __post_init__",
      "dataclasses.asdict(obj) gives nested plain dicts for JSON",
      "Status(\"paid\") looks up by value; Status[\"PAID\"] by name; bad input raises an error",
      "Plain Enum != its value; StrEnum (3.11+) members equal their text",
    ],
    quiz: [
      {
        q: "What happens with this field: tags: list = []?",
        options: ["Each instance gets its own empty list", "All instances share one list", "Class creation raises ValueError about a mutable default", "The field is ignored"],
        answer: 2,
        why: "@dataclass refuses list, dict and set defaults and tells you to use default_factory.",
      },
      {
        q: "Which option makes dataclass instances usable as dict keys while keeping == by value?",
        options: ["frozen=True", "order=True", "repr=False", "slots=True"],
        answer: 0,
        why: "frozen=True with the default eq=True makes @dataclass generate __hash__ from the fields.",
      },
      {
        q: "For class Status(Enum): PAID = \"paid\", what is Status.PAID == \"paid\"?",
        options: ["True", "TypeError", "It depends on the Python version", "False"],
        answer: 3,
        why: "A plain Enum member is a distinct object and does not compare equal to its raw value; use .value or StrEnum.",
      },
      {
        q: "Where should you validate the fields of a dataclass?",
        options: ["In a custom __init__ that replaces the generated one", "In __post_init__", "In __repr__", "Type hints validate automatically"],
        answer: 1,
        why: "The generated __init__ calls __post_init__ after setting fields, so you keep the generated code and add checks.",
      },
      {
        q: "json.dumps(asdict(order)) fails with 'Object of type Status is not JSON serializable'. Best fix?",
        options: ["Store the Enum's .value (or use StrEnum) before dumping", "Use pickle instead", "Remove type hints", "Set frozen=True"],
        answer: 0,
        why: "asdict keeps Enum members as they are, and json only knows basic types like str and int.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Convert this class into a dataclass: class Point with __init__(self, x, y) storing x and y, plus a __repr__ and __eq__.",
        hint: "Two annotated fields are all you need; @dataclass writes the three methods.",
        solution: "from dataclasses import dataclass\n\n@dataclass\nclass Point:\n    x: float\n    y: float\n\nprint(Point(1, 2), Point(1, 2) == Point(1, 2))\n# Point(x=1, y=2) True",
      },
      {
        level: "medium",
        task: "Create a Priority Enum (LOW, MEDIUM, HIGH) and a Task dataclass with title, priority defaulting to MEDIUM, and a tags list. Sort a list of tasks by priority, highest first.",
        hint: "Use IntEnum with values 1, 2, 3 so members can be compared and sorted.",
        solution: "from dataclasses import dataclass, field\nfrom enum import IntEnum\nclass Priority(IntEnum):\n    LOW = 1; MEDIUM = 2; HIGH = 3\n@dataclass\nclass Task:\n    title: str\n    priority: Priority = Priority.MEDIUM\n    tags: list[str] = field(default_factory=list)\n\ntasks = [Task(\"a\"), Task(\"b\", Priority.HIGH), Task(\"c\", Priority.LOW)]\nprint([t.title for t in sorted(tasks, key=lambda t: t.priority, reverse=True)])",
      },
      {
        level: "hard",
        task: "Write a frozen Expense dataclass (amount: float, category: Category Enum, note: str = \"\") with to_dict() and a from_dict() classmethod that round-trips through json without errors.",
        hint: "Convert the Enum with .value on the way out and Category(value) on the way in. Test: Expense.from_dict(json.loads(json.dumps(e.to_dict()))) == e.",
        solution: "from dataclasses import dataclass, asdict\nfrom enum import Enum\nclass Category(Enum):\n    FOOD = \"food\"; RENT = \"rent\"\n@dataclass(frozen=True)\nclass Expense:\n    amount: float\n    category: Category\n    note: str = \"\"\n    def to_dict(self): return {**asdict(self), \"category\": self.category.value}\n    @classmethod\n    def from_dict(cls, d): return cls(**{**d, \"category\": Category(d[\"category\"])})",
      },
    ],
    faq: [
      { q: "Does @dataclass check that field types are correct?", a: "No. Types are only annotations. If you need runtime validation, check values in __post_init__ or use a library such as Pydantic." },
      { q: "Dataclass or NamedTuple?", a: "Use a dataclass for most records, since it supports methods, defaults, mutability and validation. NamedTuple fits small immutable values you want to unpack like a tuple." },
      { q: "When should I use Enum, IntEnum or StrEnum?", a: "Use Enum by default. Use IntEnum when members must act like numbers (sorting, comparing), and StrEnum when they must act like text, for example to write them directly to JSON." },
      { q: "Can a dataclass inherit from another dataclass?", a: "Yes. Fields from the parent come first, then the child's. Watch the default rule: if a parent field has a default, every child field needs one too, unless you use kw_only=True." },
    ],
  },
};

export default extra;
