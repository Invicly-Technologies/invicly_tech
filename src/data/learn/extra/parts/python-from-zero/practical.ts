import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "practical/csv-json": {
    plain: [
      "A lot of real data arrives as files. Bank statements, sales reports and exports from spreadsheets are usually CSV files: plain text where each line is a row and commas separate the columns. Data from websites and apps is usually JSON, which can hold lists inside objects inside lists.",
      "Python has a built-in module for each. The csv module reads a CSV file row by row, so you never have to split lines yourself. The json module turns JSON text into normal Python dicts and lists, and turns them back into text when you save.",
      "Real files are messy. Some cells have extra spaces, some numbers use commas like 1,234.50, some rows are empty or broken. Cleaning means fixing what you can, skipping what you cannot, and counting what you skipped so nothing disappears silently.",
      "Once the data is clean, summarising it is just the dict and list skills you already have: add up totals per group, count how often things appear, sort, and pick the top results. Then save the answer as JSON or CSV for the next program or person.",
    ],
    deepDive: [
      {
        heading: "Why the csv module beats split(\",\")",
        body: "A CSV cell may contain a comma, a quote or even a line break. The format handles this with quoting: \"Pune, India\" is one cell, and a quote inside a quoted cell is written twice, like \"\"\". line.split(\",\") breaks on these cases, while csv.reader and csv.DictReader follow the rules for you.\n\nAlways open CSV files with newline=\"\". This lets the csv module see the real line endings, so a line break inside a quoted cell stays inside that cell. Files saved by Excel often start with an invisible byte order mark (BOM); open them with encoding=\"utf-8-sig\" or your first header will look like \\ufeffdate. Files that use semicolons or tabs need delimiter=\";\" or delimiter=\"\\t\". If you do not know the format, csv.Sniffer().sniff(sample) can guess the dialect from a sample of text.",
        bullets: ["csv.reader gives lists; csv.DictReader gives dicts keyed by the header", "Rows with extra cells put the extras under the key None (restkey)", "Short rows fill missing keys with None (restval)"],
        visual: {
          type: "compare",
          title: "One line, two ways to split it",
          columns: [
            { title: "line.split(\",\")", points: ["\"Pune, India\" becomes two cells", "Quote characters stay in the text", "Line breaks inside cells break rows", "Column count changes row to row"] },
            { title: "csv.reader", points: ["\"Pune, India\" stays one cell", "Quotes are removed correctly", "Multi-line cells are kept whole", "Same column count every row"] },
          ],
        },
      },
      {
        heading: "Cleaning and converting messy fields",
        body: "Every value from the csv module is a str, so cleaning is a set of small string steps before conversion. strip() removes spaces and stray newlines. An empty string after strip() usually means missing data: decide whether to skip the row, use a default, or store None. For numbers, remove thousands separators and currency signs first: \"1,234.50\".replace(\",\", \"\") then float(). For dates, datetime.strptime(\"03/01/2026\", \"%d/%m/%Y\") parses a known format; check which order (day or month first) the file uses.\n\nFor money, floats can show tiny errors (0.1 + 0.2 is 0.30000000000000004). decimal.Decimal(\"19.99\") keeps exact cents, which matters when totals must match a bank statement. Put each conversion in a small function that raises ValueError on bad input, then catch it in the loop, count the bad row and keep its line number (reader.line_num) for a report.",
        bullets: ["Normalise text with strip().lower() or .title() before grouping", "Keep a list of rejected rows instead of silently dropping them", "Convert once, early, then work only with clean types"],
      },
      {
        heading: "Summarising with dicts, defaultdict and Counter",
        body: "Most summaries are \"for each group, combine the values\". A plain dict works with totals[key] = totals.get(key, 0) + amount. collections.defaultdict(list) creates an empty list for new keys, so you can group whole rows: groups[row[\"region\"]].append(row). Counter is a dict built for counting: Counter(words) counts items, counter[key] += 1 never raises KeyError, and counter.most_common(3) returns the top three as (key, count) pairs.\n\nFor sorted output use sorted(totals.items(), key=lambda kv: kv[1], reverse=True). For averages, keep both a sum and a count per group, then divide at the end. These tools handle files of millions of rows, because DictReader reads one row at a time and only the small summary stays in memory.",
        visual: {
          type: "flow",
          title: "One row through a grouped summary",
          steps: [
            { label: "Row dict", detail: "{\"region\": \" north \", \"amount\": \"1,200\"}" },
            { label: "Clean", detail: "region North, amount 1200.0" },
            { label: "Group key", detail: "totals[\"North\"]" },
            { label: "Combine", detail: "Add to sum, add 1 to count" },
            { label: "After the loop", detail: "Sort and pick the top groups" },
          ],
        },
      },
      {
        heading: "How JSON maps to Python types",
        body: "json.load(f) reads from an open file and json.loads(text) reads from a string; json.dump and json.dumps do the reverse. JSON objects become dicts, arrays become lists, true/false become True/False and null becomes None. Going the other way, tuples become arrays, so they come back as lists.\n\nThree things surprise people. Object keys are always strings in JSON, so {1: \"a\"} is saved as {\"1\": \"a\"}. Dates, Decimals, sets and dataclasses are not JSON types: json.dump raises TypeError unless you convert them, for example with default=str or by building a plain dict first. And by default non-ASCII text is escaped as \\u codes; pass ensure_ascii=False to keep it readable. Invalid JSON raises json.JSONDecodeError, which is a subclass of ValueError and tells you the line and column.",
        bullets: ["json.dump(data, f, indent=2, ensure_ascii=False)", "json.dumps(obj, default=str) for dates and Decimals", "float(\"nan\") is written as NaN, which strict JSON parsers reject"],
      },
      {
        heading: "Writing CSV output correctly",
        body: "csv.DictWriter(f, fieldnames=[...]) writes dicts as rows in the column order you choose. Call writer.writeheader() once, then writer.writerow(row) or writer.writerows(rows). Open the output with newline=\"\" too, otherwise Windows can add a blank line between rows. If a dict has keys that are not in fieldnames, DictWriter raises ValueError; pass extrasaction=\"ignore\" to drop them on purpose.\n\nThe writer quotes cells that contain commas or quotes automatically, so the file opens correctly in a spreadsheet. If people will open the file in Excel and it contains non-English text, writing with encoding=\"utf-8-sig\" adds the BOM that helps Excel detect UTF-8. Choose CSV when the result is a flat table for humans; choose JSON when another program will read it or the data is nested.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Kinds of messy data and the fix",
        root: "Messy CSV cell",
        children: [
          { label: "Extra spaces", children: ["\" north \"", "Fix: strip()"] },
          { label: "Formatted numbers", children: ["\"1,234.50\" or \"$12\"", "Fix: remove symbols, then float()"] },
          { label: "Missing values", children: ["\"\" or \"N/A\"", "Fix: skip, default or None"] },
          { label: "Inconsistent text", children: ["\"NORTH\", \"North\"", "Fix: .title() or a mapping dict"] },
          { label: "Dates in many formats", children: ["\"03/01/2026\"", "Fix: datetime.strptime"] },
        ],
      },
    ],
    examples: [
      {
        title: "Clean a bank export and write a tidy CSV",
        explanation: "The bank file has spaces, amounts like \"1,234.50\" and a few broken rows. Step 1: open with utf-8-sig to drop the Excel BOM. Step 2: clean each field in a helper that raises ValueError on bad input. Step 3: write good rows with DictWriter and remember bad line numbers. Step 4: print how many rows were rejected so nothing is lost silently.",
        code: {
          lang: "python",
          code: "import csv\nfrom datetime import datetime\ndef clean(row):\n    return {\"date\": datetime.strptime(row[\"Date\"].strip(), \"%d/%m/%Y\").date().isoformat(),\n            \"amount\": float(row[\"Amount\"].replace(\",\", \"\").strip()),\n            \"desc\": row[\"Description\"].strip()}\nbad = []\nwith open(\"bank.csv\", newline=\"\", encoding=\"utf-8-sig\") as src, \\\n     open(\"clean.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as dst:\n    reader, writer = csv.DictReader(src), csv.DictWriter(dst, fieldnames=[\"date\", \"amount\", \"desc\"])\n    writer.writeheader()\n    for row in reader:\n        try: writer.writerow(clean(row))\n        except (ValueError, KeyError, AttributeError): bad.append(reader.line_num)\nprint(f\"{len(bad)} bad rows at lines {bad}\")",
        },
      },
      {
        title: "Flatten nested JSON orders into a CSV table",
        explanation: "orders.json holds a list of orders, each with a list of items. A spreadsheet needs one row per item. Step 1: json.load the file into a list of dicts. Step 2: loop over orders, then over each order's items. Step 3: build one flat dict per item that repeats the order id and customer. Step 4: write the rows with DictWriter.",
        code: {
          lang: "python",
          code: "import csv, json\n\nwith open(\"orders.json\", encoding=\"utf-8\") as f:\n    orders = json.load(f)\n\nrows = [\n    {\"order_id\": o[\"id\"], \"customer\": o[\"customer\"],\n     \"sku\": item[\"sku\"], \"qty\": item[\"qty\"]}\n    for o in orders for item in o[\"items\"]\n]\n\nwith open(\"items.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    w = csv.DictWriter(f, fieldnames=[\"order_id\", \"customer\", \"sku\", \"qty\"])\n    w.writeheader()\n    w.writerows(rows)",
        },
      },
    ],
    cheatSheet: [
      "open(path, newline=\"\", encoding=\"utf-8\") for every CSV read or write",
      "encoding=\"utf-8-sig\" removes the BOM that Excel adds to the first header",
      "csv.DictReader(f, delimiter=\";\") for semicolon-separated files",
      "Counter(...).most_common(5) gives the top five (key, count) pairs",
      "defaultdict(list) groups rows: groups[key].append(row)",
      "json.load(f) / json.dump(obj, f, indent=2); loads/dumps work on strings",
      "json.dumps(obj, default=str) converts dates and Decimals to strings",
      "JSON keys are always strings: {1: \"a\"} comes back as {\"1\": \"a\"}",
    ],
    quiz: [
      {
        q: "Your first header reads \\ufeffdate instead of date. What is the simplest fix?",
        options: ["Open the file with encoding=\"utf-8-sig\"", "Use newline=\"\\n\"", "Call strip() on every value", "Switch to csv.reader"],
        answer: 0,
        why: "The utf-8-sig codec removes the byte order mark that Excel writes at the start of the file.",
      },
      {
        q: "What does json.dumps({\"when\": date(2026, 1, 5)}) do without extra arguments?",
        options: ["Writes the date as \"2026-01-05\"", "Writes the date as a number", "Raises TypeError", "Silently drops the key"],
        answer: 2,
        why: "date is not a JSON type; pass default=str or convert it yourself first.",
      },
      {
        q: "Which tool gives the three most frequent categories most directly?",
        options: ["sorted(set(categories))[:3]", "dict.fromkeys(categories)", "max(categories)", "Counter(categories).most_common(3)"],
        answer: 3,
        why: "most_common(n) returns the n highest counts as (item, count) pairs.",
      },
      {
        q: "Why open CSV files with newline=\"\"?",
        options: ["It makes reading faster", "It lets the csv module handle line breaks inside quoted cells correctly", "It removes empty rows", "It converts the file to UTF-8"],
        answer: 1,
        why: "The csv module needs the raw line endings to keep multi-line cells together and to avoid blank lines on Windows.",
      },
      {
        q: "A DictWriter gets a row with a key that is not in fieldnames. What happens by default?",
        options: ["The key is ignored", "A new column is added", "The row is skipped", "ValueError is raised"],
        answer: 3,
        why: "extrasaction defaults to \"raise\"; set extrasaction=\"ignore\" to drop unknown keys on purpose.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Read people.csv (name, city) and print how many people live in each city, most common first.",
        hint: "Strip and title-case the city, then use Counter.most_common().",
        solution: "import csv\nfrom collections import Counter\n\nwith open(\"people.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    cities = Counter(r[\"city\"].strip().title() for r in csv.DictReader(f))\nfor city, n in cities.most_common():\n    print(f\"{city}: {n}\")",
      },
      {
        level: "medium",
        task: "From sales.csv (region, amount), write summary.json with the total and average amount per region, skipping rows where amount is not a number.",
        hint: "Keep a sum and a count per region with two dicts or a dict of lists.",
        solution: "import csv, json\nfrom collections import defaultdict\n\namounts = defaultdict(list)\nwith open(\"sales.csv\", newline=\"\", encoding=\"utf-8\") as f:\n    for r in csv.DictReader(f):\n        try: amounts[r[\"region\"].strip()].append(float(r[\"amount\"].replace(\",\", \"\")))\n        except ValueError: continue\nsummary = {k: {\"total\": sum(v), \"avg\": sum(v) / len(v)} for k, v in amounts.items()}\nwith open(\"summary.json\", \"w\", encoding=\"utf-8\") as f:\n    json.dump(summary, f, indent=2)",
      },
      {
        level: "hard",
        task: "Write a function that saves a list of Expense dataclasses (amount: Decimal, spent_on: date) to JSON and loads them back as equal objects.",
        hint: "Convert to plain dicts with str() for Decimal and isoformat() for date, then rebuild with Decimal() and date.fromisoformat().",
        solution: "import json\nfrom datetime import date\nfrom decimal import Decimal\n# Expense is the dataclass from the task\n\ndef save(items, path):\n    path.write_text(json.dumps([{\"amount\": str(e.amount), \"spent_on\": e.spent_on.isoformat()} for e in items]))\n\ndef load(path):\n    return [Expense(Decimal(d[\"amount\"]), date.fromisoformat(d[\"spent_on\"])) for d in json.loads(path.read_text())]",
      },
    ],
    faq: [
      { q: "Should I use pandas instead of the csv module?", a: "For quick analysis of large tables, pandas.read_csv is very convenient. For scripts that need no extra install, or where you want full control over cleaning row by row, the csv module is enough and is always available." },
      { q: "How do I read a CSV file that has no header row?", a: "Use csv.reader to get lists, or pass fieldnames=[\"date\", \"amount\"] to csv.DictReader so it uses your names instead of the first line." },
      { q: "What is the difference between json.load and json.loads?", a: "json.load reads from an open file object; json.loads (load string) parses a str you already have, such as an API response body." },
      { q: "Why does my CSV have blank lines between rows on Windows?", a: "The file was opened without newline=\"\". The csv writer already writes its own line endings, so Python's newline translation adds an extra one." },
    ],
  },

  "practical/http-apis": {
    plain: [
      "An API is a door that a web service opens for programs instead of people. Instead of a web page, it sends back data, usually as JSON. Weather, exchange rates, GitHub repositories and thousands of other services work this way.",
      "To ask an API for data, your program sends an HTTP request to a URL. The server answers with a status code (a number like 200 for OK or 404 for not found), some headers, and a body. The requests library makes this one line of Python.",
      "Networks fail. Servers are slow, keys expire, and you can hit limits on how many calls you may make. A good script sets a timeout, checks the status, catches errors and tells the user clearly what went wrong instead of crashing with a long traceback.",
      "When the data arrives, you turn it into Python dicts with r.json(), pick out the fields you need and save them to a file. Saving lets you work with the data later without calling the API again.",
    ],
    deepDive: [
      {
        heading: "What one requests.get() call really does",
        body: "When you call requests.get(url, params=..., timeout=10), requests first builds the full URL, encoding your params so spaces become %20 or + and special characters are safe. It then looks up the host name with DNS, opens a TCP connection to port 443 for https, and performs a TLS handshake to check the server's certificate. Only then does it send the request line and headers, like GET /forecast?city=Pune HTTP/1.1.\n\nThe server replies with a status line, headers and a body. requests wraps it in a Response: r.status_code, r.headers (case-insensitive), r.text (decoded string), r.content (raw bytes) and r.json(). If you make many calls to the same host, use a requests.Session: it keeps the TCP and TLS connection open and reuses it, which can make repeated calls much faster, and it remembers shared headers.",
        visual: {
          type: "flow",
          title: "Inside requests.get()",
          steps: [
            { label: "Build URL", detail: "Encode params after the ?" },
            { label: "DNS lookup", detail: "Host name to IP address" },
            { label: "TCP + TLS", detail: "Connect to 443, verify certificate" },
            { label: "Send request", detail: "Method, path, headers" },
            { label: "Read response", detail: "Status, headers, body" },
            { label: "Response object", detail: "status_code, headers, json()" },
          ],
        },
      },
      {
        heading: "Query parameters, headers and authentication",
        body: "params takes a dict and handles encoding. A list value repeats the key: params={\"tag\": [\"a\", \"b\"]} sends tag=a&tag=b. Values that are None are left out, which is handy for optional filters. Print r.url to see the exact URL that was sent.\n\nHeaders carry extra information. Accept: application/json asks for JSON. User-Agent identifies your client, and some APIs reject requests without a sensible one. Authentication is usually one of three styles: an API key in a header (often X-API-Key or Authorization: Bearer token), an API key as a query parameter, or HTTP Basic auth with auth=(\"user\", \"password\"). Read the key from an environment variable with os.environ, so it never lands in Git. For sending data, use json={...} on requests.post, which serialises the dict and sets Content-Type: application/json for you.",
        bullets: ["r.url shows the final, encoded URL", "Session().headers.update({...}) sets headers once for every call", "Keys in query strings can end up in server logs; prefer headers"],
      },
      {
        heading: "Errors and timeouts in detail",
        body: "requests has no timeout by default, so a stuck server can hang your script forever. timeout=10 limits the connect step and the wait between bytes of the response; it is not a limit on the total download time. A tuple like timeout=(3.05, 27) sets connect and read separately.\n\nA 404 or 500 is not an exception by itself: the request worked, the server just said no. r.raise_for_status() raises HTTPError for any 4xx or 5xx code. Network problems raise ConnectionError, slow servers raise Timeout, and everything inherits from requests.RequestException, so one except can catch them all. r.json() on a body that is not JSON (for example an HTML error page) raises requests.exceptions.JSONDecodeError. Catch specific errors where you can act differently, such as retrying on Timeout but stopping on 401.",
        visual: {
          type: "tree",
          title: "Exceptions you will meet",
          root: "requests.RequestException",
          children: [
            { label: "ConnectionError", children: ["DNS failure", "Connection refused"] },
            { label: "Timeout", children: ["ConnectTimeout", "ReadTimeout"] },
            { label: "HTTPError", children: ["From raise_for_status()", "4xx or 5xx status"] },
            { label: "JSONDecodeError", children: ["Body is not valid JSON"] },
            { label: "TooManyRedirects" },
          ],
        },
      },
      {
        heading: "Rate limits and retries",
        body: "Most APIs limit how many calls you may make, for example per minute or per hour. When you go over, the server returns 429 Too Many Requests, often with a Retry-After header saying how many seconds to wait. Many APIs also send headers showing how many calls you have left; read them in r.headers.\n\nRetrying makes sense for temporary failures: timeouts, 429, and 502, 503 or 504. It does not make sense for 400, 401, 403 or 404, which will fail the same way again. Wait longer between each try (exponential backoff: 1, 2, 4 seconds) so you do not hammer a struggling server. requests can do this for you: mount an HTTPAdapter with a urllib3 Retry object on a Session. By default Retry only retries idempotent methods like GET, and it respects Retry-After.",
        bullets: ["Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])", "session.mount(\"https://\", HTTPAdapter(max_retries=retry))", "Cache results locally so reruns do not spend your limit"],
      },
      {
        heading: "Pagination and saving results",
        body: "APIs rarely return everything at once. They split results into pages. Common styles are page numbers (?page=2&per_page=50), offsets (?offset=100&limit=50), cursors (the response includes a next_cursor token you send back) and Link headers that hold the URL of the next page; requests parses these into r.links. Loop until there is no next page, and stop after a safe maximum so a bug cannot loop forever.\n\nWhen saving, write the parsed data with json.dump(data, f, indent=2). Add a small wrapper with when you fetched it and from which URL, so you know later how fresh the file is. Write to a temporary file and rename it over the old one, so a crash halfway never leaves a broken, half-written file.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Status code families and what your script should do",
        columns: [
          { title: "2xx success", points: ["200 OK: parse the body", "201 Created: after a POST", "204 No Content: nothing to parse"] },
          { title: "4xx your request", points: ["400: fix the parameters", "401/403: check the key or permissions", "404: wrong URL or id", "429: wait, then retry"] },
          { title: "5xx server problem", points: ["500: server bug, report or retry later", "502/503/504: temporary, retry with backoff", "Not your code, but handle it"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fetch every page of GitHub issues",
        explanation: "GitHub's REST API returns 30 items per page by default (up to 100 with per_page) and puts the next page's URL in a Link header. Step 1: create a Session with the Accept header GitHub recommends. Step 2: request the first page with params. Step 3: raise on errors, then extend the list. Step 4: follow r.links[\"next\"] until it is missing. Without a token, GitHub allows only 60 requests per hour, so keep max_pages small.",
        code: {
          lang: "python",
          code: "import requests\ns = requests.Session()\ns.headers.update({\"Accept\": \"application/vnd.github+json\"})\nurl = \"https://api.github.com/repos/python/cpython/issues\"\nparams = {\"state\": \"open\", \"per_page\": 100}\nissues, max_pages = [], 3\n\nfor _ in range(max_pages):\n    r = s.get(url, params=params, timeout=10)\n    r.raise_for_status()\n    issues.extend(r.json())\n    if \"next\" not in r.links:\n        break\n    url, params = r.links[\"next\"][\"url\"], None  # next URL already has the params\nprint(len(issues), \"issues fetched\")",
        },
      },
      {
        title: "A session with automatic retries and a safe save",
        explanation: "A daily script calls an exchange-rate API that sometimes returns 503. Step 1: configure Retry for temporary errors with backoff. Step 2: mount it on a Session. Step 3: make the call and handle any final failure with one clear message and a non-zero exit. Step 4: save with a timestamp, writing to a temp file first and then replacing the old file in one step.",
        code: {
          lang: "python",
          code: "import json, datetime as dt\nfrom pathlib import Path\nimport requests\nfrom requests.adapters import HTTPAdapter\nfrom urllib3.util import Retry\n\ns = requests.Session()\ns.mount(\"https://\", HTTPAdapter(max_retries=Retry(total=3, backoff_factor=1, status_forcelist=[429, 500, 502, 503, 504])))\ntry:\n    r = s.get(\"https://api.example.com/rates\", params={\"base\": \"EUR\"}, timeout=10)\n    r.raise_for_status()\nexcept requests.RequestException as e:\n    raise SystemExit(f\"Could not fetch rates: {e}\")\ntmp = Path(\"rates.json.tmp\"); tmp.write_text(json.dumps({\"fetched_at\": dt.datetime.now(dt.timezone.utc).isoformat(), \"data\": r.json()}, indent=2))\ntmp.replace(\"rates.json\")",
        },
      },
    ],
    cheatSheet: [
      "pip install requests (it is not in the standard library)",
      "requests.get(url, params={...}, headers={...}, timeout=10)",
      "r.raise_for_status() turns 4xx and 5xx into HTTPError",
      "except requests.RequestException catches every requests error",
      "timeout=(3.05, 27) sets connect and read timeouts separately",
      "requests.post(url, json=payload) sends JSON and sets Content-Type",
      "Retry 429 and 5xx with backoff; never retry 400, 401, 403 or 404",
      "Read secrets with os.environ[\"API_KEY\"]; never hard-code them",
    ],
    quiz: [
      {
        q: "A request returns status 404. What does requests do by default?",
        options: ["Raises HTTPError", "Returns a Response with status_code 404", "Retries three times", "Returns None"],
        answer: 1,
        why: "Only raise_for_status() turns error codes into exceptions; otherwise you get a normal Response.",
      },
      {
        q: "Which errors are worth retrying with backoff?",
        options: ["400 Bad Request", "401 Unauthorized", "404 Not Found", "503 Service Unavailable"],
        answer: 3,
        why: "503 is usually temporary; the others will fail the same way until you change the request.",
      },
      {
        q: "What does timeout=10 limit?",
        options: ["The connect step and each wait for data from the server", "The total download time", "How many retries happen", "Nothing unless you also use a Session"],
        answer: 0,
        why: "It is a connect and read timeout, not a limit on the total response time.",
      },
      {
        q: "What does params={\"tag\": [\"a\", \"b\"]} send?",
        options: ["tag=[a,b]", "tag=a,b", "tag=a&tag=b", "An error"],
        answer: 2,
        why: "requests repeats the key for each item in a list value.",
      },
      {
        q: "Why use a requests.Session for many calls to one API?",
        options: ["It disables TLS checks", "It reuses connections and shares headers", "It makes calls run in parallel", "It caches every response forever"],
        answer: 1,
        why: "A Session pools connections, saving the TCP and TLS setup cost on every call.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Call https://api.github.com/users/octocat and print the user's name and number of public repos, with a timeout and status check.",
        hint: "r.json() returns a dict with keys name and public_repos.",
        solution: "import requests\n\nr = requests.get(\"https://api.github.com/users/octocat\", timeout=10)\nr.raise_for_status()\nuser = r.json()\nprint(user[\"name\"], user[\"public_repos\"])",
      },
      {
        level: "medium",
        task: "Write fetch_json(url, params) that returns the parsed JSON, or prints a friendly message and returns None on any network error, error status or invalid JSON.",
        hint: "requests.exceptions.JSONDecodeError is also a RequestException subclass in recent requests versions, but catching ValueError covers older ones too.",
        solution: "import requests\n\ndef fetch_json(url, params=None):\n    try:\n        r = requests.get(url, params=params, timeout=10)\n        r.raise_for_status()\n        return r.json()\n    except (requests.RequestException, ValueError) as e:\n        print(f\"Request to {url} failed: {e}\")\n        return None",
      },
      {
        level: "hard",
        task: "Write a function that GETs a URL and, on 429, waits for the Retry-After seconds (default 5) and tries again, up to 3 attempts in total.",
        hint: "Check r.status_code before raise_for_status(); Retry-After may be missing.",
        solution: "import time, requests\n\ndef get_with_retry(url, attempts=3):\n    for i in range(attempts):\n        r = requests.get(url, timeout=10)\n        if r.status_code != 429 or i == attempts - 1:\n            r.raise_for_status()\n            return r\n        wait = r.headers.get(\"Retry-After\", \"5\")\n        time.sleep(int(wait) if wait.isdigit() else 5)",
      },
    ],
    faq: [
      { q: "Is requests built into Python?", a: "No. Install it with pip install requests inside your virtual environment. The standard library has urllib.request, but it is far less convenient." },
      { q: "Should I use requests or httpx?", a: "requests is the classic choice for simple synchronous scripts. httpx has a very similar API and also supports async code and HTTP/2, so it is worth learning once you need those." },
      { q: "Where should I keep my API key?", a: "In an environment variable or a .env file that is listed in .gitignore. Read it with os.environ in your code, so the key never appears in your repository." },
      { q: "Why does r.json() fail even though the request worked?", a: "The body is not JSON, often an HTML error page or an empty body from a 204. Check r.status_code and r.headers[\"Content-Type\"] before parsing." },
    ],
  },

  "practical/cli": {
    plain: [
      "A command-line tool is a program you run by typing its name and some words after it, like git commit -m \"fix\". Those extra words are called arguments. They tell the program what to do without changing its code.",
      "Python gives your script all those words as a list of strings in sys.argv. Turning that list into checked, typed values by hand is boring and full of edge cases. The argparse module does it for you, and it writes the help text too.",
      "You describe what your tool accepts: required values, optional settings with a default, and simple on or off switches. argparse checks what the user typed, converts numbers, shows a clear error if something is wrong, and gives you an object with each value as an attribute.",
      "Finally, you can install your script as a real command. After that, users type tracker add 12 instead of python path/to/tracker.py add 12, from any folder.",
    ],
    deepDive: [
      {
        heading: "How parse_args reads the command line",
        body: "The shell splits what you type into words (respecting quotes) and passes them to Python. sys.argv[0] is the script name; parse_args() reads sys.argv[1:] by default. Words that start with - or -- are options; everything else fills positional arguments in order. A bare -- means \"no more options\", so tracker add -- -5 treats -5 as a value.\n\nargparse also accepts --opt=value and unique prefixes of long options, like --cat for --category (turn this off with allow_abbrev=False). When input is wrong, it prints the usage line and a message to stderr and exits with status 2. -h and --help print the help and exit with 0. For tests, write def main(argv=None) and call parser.parse_args(argv): passing a list lets you test parsing without a real shell.",
        visual: {
          type: "flow",
          title: "From typed words to a Namespace",
          steps: [
            { label: "Shell splits words", detail: "Quotes keep \"two words\" together" },
            { label: "sys.argv[1:]", detail: "[\"add\", \"12.5\", \"--category\", \"food\"]" },
            { label: "Match options", detail: "--category consumes the next word" },
            { label: "Fill positionals", detail: "In the order they were added" },
            { label: "Convert and check", detail: "type=, choices=, required=" },
            { label: "Namespace or exit 2", detail: "Usage error goes to stderr" },
          ],
        },
      },
      {
        heading: "Options, flags and defaults",
        body: "Beyond type and default, a few settings cover most needs. choices=[\"food\", \"travel\"] rejects anything else and lists the valid values in the help. nargs controls how many values an argument takes: \"?\" for zero or one, \"*\" for any number, \"+\" for at least one, or a number like 2. required=True makes an option mandatory, though a positional argument is usually clearer.\n\nFor flags, action=\"store_true\" gives False unless the flag appears. action=\"count\" lets users type -vv for more detail (args.verbose == 2). action=\"append\" collects repeated options into a list. argparse.BooleanOptionalAction (Python 3.9+) creates a pair like --color and --no-color. type can be any function that takes a string: type=pathlib.Path gives Path objects, and your own function can raise argparse.ArgumentTypeError with a helpful message.",
        bullets: ["add_argument(\"-n\", \"--limit\", type=int, default=10)", "add_argument(\"files\", nargs=\"+\", type=Path)", "add_argument(\"-v\", \"--verbose\", action=\"count\", default=0)"],
      },
      {
        heading: "Subcommands like git add and git commit",
        body: "Many tools have verbs: tracker add, tracker list, tracker summary. Create them with sub = parser.add_subparsers(dest=\"command\", required=True), then p_add = sub.add_parser(\"add\", help=\"add an expense\"). Each subparser has its own arguments and its own --help page.\n\nA clean pattern is to attach the function that handles each command: p_add.set_defaults(func=cmd_add). After parsing, main simply calls args.func(args). Options shared by every command, like --file, can go on the main parser (typed before the subcommand) or on a parent parser passed with parents=[common], so they work after the subcommand too. Keep each cmd_ function thin: read args, call your real logic in another module, print the result and return an exit code.",
        visual: {
          type: "tree",
          title: "A CLI with subcommands",
          root: "tracker [--file PATH]",
          children: [
            { label: "add", children: ["amount (float)", "--category", "--date"] },
            { label: "list", children: ["--month YYYY-MM", "--limit N"] },
            { label: "summary", children: ["--by category or month"] },
            { label: "export", children: ["--format csv or json", "--out PATH"] },
          ],
        },
      },
      {
        heading: "Help text, errors and exit codes",
        body: "Good help is the manual most users will ever read. Give the parser a description (shown at the top) and an epilog (shown at the bottom, great for examples). Write help= for every argument, and use metavar=\"AMOUNT\" for readable placeholders. formatter_class=argparse.ArgumentDefaultsHelpFormatter adds each default to the help automatically; RawDescriptionHelpFormatter keeps your line breaks in the epilog.\n\nFollow the conventions scripts rely on. Results go to stdout and errors go to stderr (print(..., file=sys.stderr)), so output can be piped without mixing in messages. Exit with 0 on success and non-zero on failure: return an int from main and call sys.exit(main()). For a problem argparse cannot detect, such as a start date after the end date, call parser.error(\"...\"), which prints usage and exits with 2 like the built-in checks.",
      },
      {
        heading: "Turning the script into an installed command",
        body: "Put your code in a package, for example src/tracker/cli.py with a main() function. In pyproject.toml add a [project.scripts] table: tracker = \"tracker.cli:main\". When the package is installed, pip creates a small launcher called tracker in the environment's bin (or Scripts on Windows) folder. The launcher imports tracker.cli, calls main() and passes its return value to sys.exit.\n\nDuring development, run pip install -e . inside your virtual environment: the command works immediately and picks up code changes without reinstalling. Add a src/tracker/__main__.py that calls main() so python -m tracker works too. To share the tool, people can install it with pipx install . (or from a Git URL), which gives the command its own isolated environment.",
        visual: {
          type: "flow",
          title: "What happens when you type tracker",
          steps: [
            { label: "Shell finds tracker", detail: "In the venv bin folder on PATH" },
            { label: "Launcher script", detail: "Created by pip from [project.scripts]" },
            { label: "Import tracker.cli", detail: "Your installed package" },
            { label: "sys.exit(main())", detail: "Return value becomes the exit code" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Positional argument, option and flag",
        columns: [
          { title: "Positional", points: ["tracker add 12.5", "Required by default", "Identified by order", "Use for the main input"] },
          { title: "Option", points: ["--category food", "Takes a value", "Optional, with a default", "Use for settings"] },
          { title: "Flag", points: ["--verbose", "No value: on or off", "action=\"store_true\"", "Use for switches"] },
        ],
      },
    ],
    examples: [
      {
        title: "A testable CLI with subcommands",
        explanation: "Step 1: main(argv=None) builds the parser. Step 2: add one subparser per command and attach its handler with set_defaults. Step 3: parse argv and dispatch to args.func, returning its exit code. Step 4: a test calls main([\"add\", \"12.5\"]) directly, no shell needed.",
        code: {
          lang: "python",
          code: "import argparse, sys\ndef cmd_add(args):\n    print(f\"Added {args.amount:.2f} ({args.category})\")\n    return 0\ndef main(argv=None):\n    p = argparse.ArgumentParser(prog=\"tracker\", description=\"Track expenses.\")\n    sub = p.add_subparsers(dest=\"command\", required=True)\n    a = sub.add_parser(\"add\", help=\"add an expense\")\n    a.add_argument(\"amount\", type=float)\n    a.add_argument(\"-c\", \"--category\", choices=[\"food\", \"travel\", \"other\"], default=\"other\")\n    a.set_defaults(func=cmd_add)\n    args = p.parse_args(argv)\n    return args.func(args)\nif __name__ == \"__main__\":\n    sys.exit(main())",
        },
      },
      {
        title: "A custom type that validates a month",
        explanation: "tracker list --month should accept 2026-03 but reject 2026-13 with a clear message. Step 1: write a function that takes the string and returns a date, raising ArgumentTypeError if it fails. Step 2: pass it as type=. Step 3: argparse calls it and turns the error into a normal usage error with exit code 2.",
        code: {
          lang: "python",
          code: "import argparse\nfrom datetime import datetime, date\n\ndef month(text: str) -> date:\n    try:\n        return datetime.strptime(text, \"%Y-%m\").date()\n    except ValueError:\n        raise argparse.ArgumentTypeError(f\"expected YYYY-MM, got {text!r}\")\n\nparser = argparse.ArgumentParser(prog=\"tracker list\")\nparser.add_argument(\"--month\", type=month, help=\"month to show, e.g. 2026-03\")\nprint(parser.parse_args([\"--month\", \"2026-03\"]).month)  # 2026-03-01\n# parser.parse_args([\"--month\", \"2026-13\"]) -> error, exit code 2",
        },
      },
    ],
    cheatSheet: [
      "parser.add_argument(\"name\") positional; add_argument(\"--name\") option",
      "type=int, choices=[...], default=..., required=True, help=\"...\"",
      "action=\"store_true\" flag; action=\"count\" for -vv; action=\"append\" for lists",
      "nargs=\"?\" zero or one, \"*\" any, \"+\" one or more",
      "add_subparsers(dest=\"command\", required=True) plus set_defaults(func=...)",
      "argparse errors exit with code 2; --help exits with 0",
      "main(argv=None) with parse_args(argv) makes parsing testable",
      "[project.scripts] tracker = \"tracker.cli:main\" then pip install -e .",
    ],
    quiz: [
      {
        q: "What exit code does argparse use when the user passes invalid arguments?",
        options: ["0", "1", "2", "127"],
        answer: 2,
        why: "argparse prints usage to stderr and exits with status 2 on parsing errors.",
      },
      {
        q: "How do you let users type -vv to get more detailed output?",
        options: ["action=\"count\"", "action=\"store_true\"", "nargs=\"+\"", "type=int"],
        answer: 0,
        why: "action=\"count\" counts how many times the flag appears.",
      },
      {
        q: "In [project.scripts], what does tracker = \"tracker.cli:main\" mean?",
        options: ["Run the file tracker/cli in a shell", "Copy cli.py to /usr/bin", "Rename the package", "Create a tracker command that imports tracker.cli and calls main()"],
        answer: 3,
        why: "pip generates a launcher that imports the module and passes main()'s return value to sys.exit.",
      },
      {
        q: "Why define main(argv=None) and call parse_args(argv)?",
        options: ["It is required by argparse", "It makes the program faster", "Tests can pass a list of arguments without a shell", "It hides the help text"],
        answer: 2,
        why: "With argv=None argparse reads sys.argv, but a test can pass its own list.",
      },
      {
        q: "Where should a CLI print error messages?",
        options: ["stderr, with a non-zero exit code", "stdout, with exit code 0", "A log file only", "Nowhere; just exit"],
        answer: 0,
        why: "Keeping errors on stderr lets stdout be piped safely, and the exit code tells scripts it failed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write greet.py that takes a name and an optional --times N (default 1) and prints Hello, NAME! N times.",
        hint: "One positional argument and one option with type=int.",
        solution: "import argparse\n\np = argparse.ArgumentParser(description=\"Say hello.\")\np.add_argument(\"name\", help=\"who to greet\")\np.add_argument(\"--times\", type=int, default=1, help=\"how many times\")\nargs = p.parse_args()\nfor _ in range(args.times):\n    print(f\"Hello, {args.name}!\")",
      },
      {
        level: "medium",
        task: "Write wc.py that accepts one or more file paths and a -l flag; it prints the line count of each file, or the character count without -l.",
        hint: "nargs=\"+\" with type=Path, and action=\"store_true\" for -l.",
        solution: "import argparse\nfrom pathlib import Path\n\np = argparse.ArgumentParser()\np.add_argument(\"files\", nargs=\"+\", type=Path)\np.add_argument(\"-l\", \"--lines\", action=\"store_true\")\nargs = p.parse_args()\nfor f in args.files:\n    text = f.read_text(encoding=\"utf-8\")\n    print(f, len(text.splitlines()) if args.lines else len(text))",
      },
      {
        level: "hard",
        task: "Add a check that --start is not after --end (both dates as YYYY-MM-DD), reporting the problem the same way argparse reports its own errors.",
        hint: "Use type=date.fromisoformat, then parser.error() after parsing.",
        solution: "import argparse\nfrom datetime import date\n\np = argparse.ArgumentParser()\np.add_argument(\"--start\", type=date.fromisoformat, required=True)\np.add_argument(\"--end\", type=date.fromisoformat, required=True)\nargs = p.parse_args()\nif args.start > args.end:\n    p.error(\"--start must be on or before --end\")  # exits with code 2\nprint(args.start, \"to\", args.end)",
      },
    ],
    faq: [
      { q: "Should I use argparse, click or typer?", a: "argparse is in the standard library and covers most tools well. click and typer (built on click) are third-party libraries that use decorators or type hints and are popular for larger CLIs; they are worth trying once argparse feels repetitive." },
      { q: "How do I make an option required?", a: "Pass required=True to add_argument. If the value is the main input of the command, a positional argument is usually clearer." },
      { q: "Why does my installed command say command not found?", a: "The virtual environment is not active, or its bin folder is not on PATH. Activate the venv, or install with pipx, which puts commands on PATH for you." },
      { q: "How do I show default values in --help?", a: "Create the parser with formatter_class=argparse.ArgumentDefaultsHelpFormatter, or write %(default)s inside your help strings." },
    ],
  },

  "practical/automation": {
    plain: [
      "Automation means writing a small program to do a boring job for you. If you rename 200 photos, sort your Downloads folder every week, or copy numbers into the same report every Monday, a script can do it in seconds and never gets tired or careless.",
      "The best tasks to automate happen often, follow clear rules, and take real time or cause mistakes when done by hand. If you cannot write the rules down in a few sentences, the task is probably not ready for a script yet.",
      "Scripts that move or rename files can also make a mess very quickly. That is why every good automation script starts in dry-run mode: it prints what it would do and changes nothing. You read the list, and only then let it act.",
      "When the script runs, it should tell you what happened: how many files it moved, which ones it skipped and why. Once you trust it, you can even schedule it to run by itself every day or week.",
    ],
    deepDive: [
      {
        heading: "Picking a task worth automating",
        body: "A useful rule of thumb: multiply how often you do a task by how long it takes, and compare that with the time to write and test a script. Renaming 50 files once may not be worth it; sorting a folder every day for a year certainly is. Time is not the only gain. Scripts also remove mistakes, such as a typo in a file name or a forgotten step.\n\nBefore coding, write the rules as plain sentences: \"Every .pdf goes to docs. Files older than 30 days go to archive. Never touch files starting with a dot.\" Then list the edge cases: two files with the same name, files with no extension, upper-case extensions like .JPG, and files that are still being downloaded. If an action cannot easily be undone, such as deleting, plan a safety net first: move to a trash folder instead, or keep a log of every change.",
        bullets: ["Good: repeated, rule-based, tedious, error-prone", "Bad: rare, needs human judgement, rules keep changing", "Start with the read-only part: a report, then add actions"],
      },
      {
        heading: "Listing and inspecting files with pathlib",
        body: "Path(\"~/Downloads\").expanduser() turns ~ into your home folder. folder.iterdir() yields every entry directly inside a folder, in no guaranteed order, so call sorted() when order matters. folder.glob(\"*.pdf\") matches a pattern in one folder, and folder.rglob(\"*.pdf\") searches all subfolders too. Python 3.12 added Path.walk(), similar to os.walk, for full control over walking a tree.\n\nEach Path tells you a lot without opening the file: p.name (\"report.final.pdf\"), p.stem (\"report.final\"), p.suffix (\".pdf\"), p.suffixes ([\".final\", \".pdf\"]) and p.parent. p.is_file() and p.is_dir() filter entries. p.stat() gives st_size in bytes and st_mtime, the last modification time as a timestamp, which datetime.fromtimestamp() turns into a date. Use p.suffix.lower() so .JPG and .jpg are treated the same.",
        bullets: ["sorted(folder.glob(\"*.csv\"), key=lambda p: p.stat().st_mtime)", "p.with_suffix(\".txt\") and p.with_name(\"new.pdf\") build new paths", "Skip hidden files: if p.name.startswith(\".\"): continue"],
      },
      {
        heading: "Renaming and moving without losing files",
        body: "Path.rename(target) behaves differently by operating system. On Linux and macOS it silently replaces an existing file at target; on Windows it raises FileExistsError. Path.replace(target) always overwrites. shutil.move(src, dst) also works across disks (it copies then deletes) and, when dst is an existing folder, moves the file inside it. None of these protect you, so check dest.exists() yourself and pick a free name, like photo (1).jpg.\n\nBatch renames have a subtle trap: renaming a to b and b to c in the wrong order destroys a file. Plan the full list of (old, new) pairs first, check that every new name is unique and does not already exist, and only then act. Write each completed move to a log file (a CSV of old and new paths), so you can undo the whole run with a ten-line script if something looks wrong.",
        visual: {
          type: "flow",
          title: "A safe batch rename",
          steps: [
            { label: "Plan all moves", detail: "Build a list of (old, new) paths" },
            { label: "Check clashes", detail: "New names unique and free" },
            { label: "Dry run", detail: "Print the plan, change nothing" },
            { label: "Act and log", detail: "Move, write old,new to a CSV" },
            { label: "Undo if needed", detail: "Replay the log in reverse" },
          ],
        },
      },
      {
        heading: "Sorting into folders and generating a report",
        body: "Sorting is a mapping from a file to a target folder. A dict from suffix to folder name is simplest and easy to change. For broader groups, mimetypes.guess_type(p.name) returns a type like (\"image/jpeg\", None), so you can sort by the part before the slash. You can also sort by date: build a folder name like 2026/03 from st_mtime. Create targets with dest.mkdir(parents=True, exist_ok=True), which is safe to run every time.\n\nWhile looping, collect facts for a report: a Counter of files per category, total bytes per folder, and a list of skipped files with reasons. At the end print a short summary, or write it to a CSV or text file with today's date in the name. A run that ends with \"Moved 42 files, skipped 3 (name clash)\" builds the trust you need before scheduling it.",
      },
      {
        heading: "Running it on a schedule",
        body: "Once the script is reliable, let the computer start it. On Linux and macOS, cron runs commands on a timetable: crontab -e opens your list, and the line 0 9 * * 1 /home/me/venv/bin/python /home/me/sort_downloads.py runs it at 09:00 every Monday. The five fields are minute, hour, day of month, month and day of week. On Linux, a systemd timer is a modern alternative with better logging. On Windows, use Task Scheduler.\n\nScheduled jobs run without your terminal, so they behave differently. Use absolute paths for Python, the script and every folder, because cron starts with a minimal environment and a different working directory. Redirect output to a log (>> /home/me/sort.log 2>&1) so you can see what happened. Make the script idempotent: running it twice should do no harm, because the second run finds nothing left to move.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Growing a script you can trust",
        steps: [
          { label: "Write the rules", detail: "Plain sentences and edge cases" },
          { label: "Report only", detail: "Count and list, change nothing" },
          { label: "Dry run", detail: "Print planned actions" },
          { label: "Act with a log", detail: "Every change recorded" },
          { label: "Review and refine", detail: "Fix rules from what you see" },
        ],
      },
    ],
    examples: [
      {
        title: "Rename photos by date taken, with clash handling",
        explanation: "A folder holds IMG_4831.JPG and similar names. Goal: 2026-03-14_001.jpg style names ordered by modification time. Step 1: sort files by st_mtime. Step 2: build the new name from the date plus a counter. Step 3: skip if the new name already exists. Step 4: only rename when --apply is passed; otherwise print the plan.",
        code: {
          lang: "python",
          code: "import sys\nfrom datetime import datetime\nfrom pathlib import Path\n\nfolder, apply = Path(sys.argv[1]), \"--apply\" in sys.argv\nphotos = sorted((p for p in folder.iterdir() if p.suffix.lower() in {\".jpg\", \".jpeg\"}),\n                key=lambda p: p.stat().st_mtime)\nfor i, p in enumerate(photos, start=1):\n    day = datetime.fromtimestamp(p.stat().st_mtime).strftime(\"%Y-%m-%d\")\n    new = p.with_name(f\"{day}_{i:03}.jpg\")\n    if new.exists():\n        print(f\"skip {p.name}: {new.name} exists\"); continue\n    print(f\"{p.name} -> {new.name}\")\n    if apply:\n        p.rename(new)",
        },
      },
      {
        title: "A weekly folder report as CSV",
        explanation: "You want to know what fills a shared folder. Step 1: walk it with rglob(\"*\") and keep only files. Step 2: add each file's size to a total per extension and count files with a Counter. Step 3: write report-YYYY-MM-DD.csv sorted by size. Step 4: schedule it with cron for Monday mornings.",
        code: {
          lang: "python",
          code: "import csv\nfrom collections import Counter\nfrom datetime import date\nfrom pathlib import Path\ncount, size = Counter(), Counter()\nfor p in Path(\"/srv/shared\").rglob(\"*\"):\n    if p.is_file():\n        ext = p.suffix.lower() or \"(none)\"\n        count[ext] += 1\n        size[ext] += p.stat().st_size\nwith open(f\"report-{date.today()}.csv\", \"w\", newline=\"\", encoding=\"utf-8\") as f:\n    w = csv.writer(f)\n    w.writerow([\"extension\", \"files\", \"megabytes\"])\n    for ext, b in size.most_common():\n        w.writerow([ext, count[ext], round(b / 1_000_000, 1)])",
        },
      },
    ],
    cheatSheet: [
      "Path(\"~/Downloads\").expanduser().iterdir() lists a folder",
      "folder.glob(\"*.pdf\") one level; folder.rglob(\"*.pdf\") all subfolders",
      "p.stem, p.suffix.lower(), p.stat().st_size, p.stat().st_mtime",
      "dest.mkdir(parents=True, exist_ok=True) is safe to run every time",
      "Path.rename silently overwrites on Linux and macOS; check dest.exists() first",
      "shutil.move(src, dst) works across disks; shutil.copy2 keeps timestamps",
      "cron: minute hour day-of-month month day-of-week, e.g. 0 9 * * 1",
      "Use absolute paths and log to a file in scheduled jobs",
    ],
    quiz: [
      {
        q: "On Linux, what does Path(\"a.txt\").rename(\"b.txt\") do if b.txt already exists?",
        options: ["Raises FileExistsError", "Silently replaces b.txt", "Creates b (1).txt", "Does nothing"],
        answer: 1,
        why: "On POSIX systems rename replaces an existing file without warning, so check first.",
      },
      {
        q: "Which call finds .log files in a folder and all its subfolders?",
        options: ["folder.iterdir(\"*.log\")", "folder.glob(\"*.log\")", "folder.listdir(\".log\")", "folder.rglob(\"*.log\")"],
        answer: 3,
        why: "rglob searches recursively; glob with a simple pattern like *.log only looks inside the one folder.",
      },
      {
        q: "A script works in your terminal but fails under cron with file not found. The most likely cause?",
        options: ["Relative paths and a different working directory", "cron does not support Python", "The script needs sudo", "cron runs scripts twice"],
        answer: 0,
        why: "cron starts jobs with a minimal environment and a different current folder, so use absolute paths.",
      },
      {
        q: "What does it mean that an automation script is idempotent?",
        options: ["It runs in parallel", "It never fails", "Running it again causes no extra changes", "It needs no configuration"],
        answer: 2,
        why: "An idempotent script finds nothing left to do on the second run, so repeats are harmless.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print every file in a folder with its size in kilobytes, largest first.",
        hint: "Filter with is_file(), sort by p.stat().st_size with reverse=True.",
        solution: "from pathlib import Path\n\nfolder = Path(\".\")\nfiles = sorted((p for p in folder.iterdir() if p.is_file()),\n               key=lambda p: p.stat().st_size, reverse=True)\nfor p in files:\n    print(f\"{p.stat().st_size / 1024:8.1f} KB  {p.name}\")",
      },
      {
        level: "medium",
        task: "Move files older than 30 days from a folder into an archive subfolder, with a dry-run default and a --apply flag.",
        hint: "Compare time.time() - p.stat().st_mtime with 30 * 24 * 3600.",
        solution: "import shutil, sys, time\nfrom pathlib import Path\n\nfolder, apply = Path(sys.argv[1]), \"--apply\" in sys.argv\narchive = folder / \"archive\"\ncutoff = time.time() - 30 * 24 * 3600\nfor p in folder.iterdir():\n    if p.is_file() and p.stat().st_mtime < cutoff and not (archive / p.name).exists():\n        print(f\"{p.name} -> archive/\")\n        if apply:\n            archive.mkdir(exist_ok=True)\n            shutil.move(p, archive / p.name)",
      },
      {
        level: "hard",
        task: "Write free_name(dest) that returns dest if it does not exist, otherwise the first free name like report (1).pdf, report (2).pdf.",
        hint: "Loop over a counter and build names with dest.with_name(f\"{dest.stem} ({n}){dest.suffix}\").",
        solution: "from itertools import count\nfrom pathlib import Path\n\ndef free_name(dest: Path) -> Path:\n    if not dest.exists():\n        return dest\n    for n in count(1):\n        candidate = dest.with_name(f\"{dest.stem} ({n}){dest.suffix}\")\n        if not candidate.exists():\n            return candidate",
      },
    ],
    faq: [
      { q: "Should I use os or pathlib for file automation?", a: "Prefer pathlib for new code: paths are objects with readable methods like .suffix and .glob(). Use shutil for copying and moving, and os only for things pathlib does not cover." },
      { q: "How do I undo a script that moved the wrong files?", a: "Only if you planned for it: keep a log of every old and new path, then write a short script that moves each file back. This is why dry runs and logs come before the first real run." },
      { q: "How do I run a Python script automatically every day?", a: "Use cron or a systemd timer on Linux, launchd or cron on macOS, and Task Scheduler on Windows. Point the job at the full path of your virtual environment's python and your script." },
      { q: "Can Python automate tasks in a web browser or Excel too?", a: "Yes. Playwright or Selenium can drive a browser, and openpyxl reads and writes Excel files. Start with file and folder tasks, which need only the standard library." },
    ],
  },
};

export default extra;
