import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "evals/eval-datasets": {
    plain: [
      "An eval dataset is an exam for your app. It is a list of inputs, each with a note on what a good answer looks like. You run the app on every input, score the answers, and get a number. Change a prompt, run the exam again, and compare the numbers. Now better or worse is a fact, not a feeling.",
      "The best test cases come from real users: chat logs, support tickets, questions colleagues ask. Real inputs are messy. They have typos, missing details and two questions in one message. That mess is exactly what breaks AI apps, so your exam needs it.",
      "Then add cases that are rare but important: tricky edge cases, questions the app must refuse, and attempts to misuse it. A model can help you write these, but a person should check every one.",
      "Every case needs a label: the expected answer, or a short list of what a good answer must and must not do. Keep the whole set in Git with a version number, so scores from different weeks can be compared honestly.",
    ],
    deepDive: [
      {
        heading: "What a good test case contains",
        body: "A test case needs more than a question. Give it a stable ID so you can track it over time. Store the input exactly as the app receives it, including chat history or attached data when that matters. Then store the expectation, which comes in two styles.\n\nReference-based cases have a golden answer to compare against, which works well for short facts like a date or a price. Criteria-based cases list what a good answer must and must not do, such as mentions the 5 business day refund window and does not promise an exact date. Criteria work better for open-ended answers, where many wordings are correct.\n\nFor RAG apps, also store which documents should be retrieved, so retrieval can be scored on its own. Finally add tags such as topic, difficulty and origin (real or synthetic), so you can see scores per slice instead of one blended number.",
        bullets: ["id, input, expected or criteria", "Expected sources for RAG cases", "Tags: topic, difficulty, real or synthetic", "Optional notes explaining tricky labels"],
      },
      {
        heading: "Collecting real examples without leaking data",
        body: "Do not just take the first 50 questions from the logs. They will mostly be the same few common questions. Group logged questions by topic, then sample a few from each group so rare topics are represented too. Remove near-duplicates, because ten copies of the same question make one behaviour count ten times.\n\nScrub personal data before a case goes into your repository: names, emails, phone numbers, account and order numbers. Replace them with realistic fake values so the case still makes sense. Check that your privacy policy allows using logs this way.\n\nNo users yet? Ask domain experts and colleagues to write questions without looking at the documents first, so they phrase them the way real users would. Run a short beta, collect what testers ask, and promote the best examples into the dataset.",
      },
      {
        heading: "Generating synthetic edge cases systematically",
        body: "Asking a model to write 50 test questions gives you 50 similar, polite, easy questions. A better method is to define dimensions first. For a support bot these might be persona (new user, expert, angry customer), topic (billing, login, data export) and kind (simple, two questions in one, missing a key detail, out of scope). Combine them into tuples, then ask a model to write one realistic message for each tuple.\n\nThis gives coverage you control: 3 personas times 3 topics times 4 kinds is 36 distinct cases. Add adversarial cases by hand: prompt injection attempts, requests in another language, extremely long inputs and empty ones.\n\nReview every generated case. Delete ones that no real user would write, fix unrealistic wording, and tag them as synthetic so you can compare scores on real versus generated inputs.",
        visual: {
          type: "flow",
          title: "Synthetic cases from dimensions",
          steps: [
            { label: "Pick dimensions", detail: "Persona, topic, kind of request" },
            { label: "Combine tuples", detail: "Every mix, or a sampled subset" },
            { label: "Generate inputs", detail: "One realistic message per tuple" },
            { label: "Human review", detail: "Drop or fix unrealistic ones" },
            { label: "Label and tag", detail: "Expected behaviour, tag synthetic" },
          ],
        },
      },
      {
        heading: "Labelling: guidelines and agreement",
        body: "Labels are only useful if two people would write the same one. Before labelling, write short guidelines: what counts as a correct answer, when the app should refuse, when it should ask a clarifying question, and how strict to be about wording.\n\nThen test the guidelines. Have two people label the same 20 cases independently and compare. Where they disagree, the guideline is usually unclear, so fix it rather than just picking a winner. A domain expert, such as the support lead or a lawyer, should have the final word on facts.\n\nRemember that the right behaviour is not always an answer. For out-of-scope or unanswerable questions, the label is the behaviour you want: politely declines, or asks which account the user means. Those cases catch the confident, invented answers that hurt trust most.",
      },
      {
        heading: "Versioning, size and splits",
        body: "Store cases as JSONL (one JSON object per line) in Git next to your code. Give the dataset a version and record that version with every score you publish, because a score on v3 cannot be compared with a score on v2. Never silently edit a case; if a label was wrong, fix it in a commit with a clear message, or retire the case and add a new ID.\n\nStart with 20 to 50 cases. Know the limit: with 50 cases, one case is worth 2 percentage points, so small differences are noise. Grow toward a few hundred as the app matures.\n\nKeep a dev set you look at and tune against every day, and a held-out test set you run rarely. If you tune prompts on the same cases you report, your score will look better than real-world quality.",
        bullets: ["JSONL in Git, version recorded with every score", "50 cases: each case moves the score 2 points", "Dev set for tuning, held-out set for reporting", "Every production bug becomes a new case"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A balanced eval set",
        root: "Eval set",
        children: [
          { label: "Common questions", children: ["About half the set", "From real logs"] },
          { label: "Messy real inputs", children: ["Typos and slang", "Two questions in one", "Vague wording"] },
          { label: "Edge cases", children: ["Very long or empty input", "Other languages", "Boundary values"] },
          { label: "Should refuse or ask", children: ["Out of scope", "Missing key detail", "Not in the docs"] },
          { label: "Adversarial", children: ["Prompt injection", "Requests for private data"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turning a month of logs into 40 test cases",
        explanation: "Your support bot logged 2,000 questions last month.\nStep 1: export them and tag each with a topic, using simple keywords or a cheap model.\nStep 2: drop exact and near duplicates.\nStep 3: take a stratified sample: up to 5 per topic, with a fixed random seed so the sample is reproducible.\nStep 4: scrub names, emails and order numbers, replacing them with fake values.\nStep 5: sit with the support lead and label each case with expected behaviour.\nStep 6: commit as evals/support-v1.jsonl with a changelog line.",
        code: {
          lang: "python",
          code: "import random\nfrom collections import defaultdict\n\ndef stratified_sample(rows: list[dict], per_tag: int = 5, seed: int = 42) -> list[dict]:\n    rng = random.Random(seed)\n    by_tag = defaultdict(list)\n    for r in rows:\n        by_tag[r[\"tag\"]].append(r)\n    sample = []\n    for tag in sorted(by_tag):\n        items = by_tag[tag]\n        sample += rng.sample(items, min(per_tag, len(items)))\n    return sample",
        },
      },
      {
        title: "Generating 36 synthetic cases from dimensions",
        explanation: "You want coverage of personas, topics and request types you rarely see in logs. Step 1: list the values for each dimension. Step 2: itertools.product gives every combination, 3 times 3 times 4 = 36. Step 3: for each combination, ask a model to write one realistic message (the generate function is your own model call). Step 4: save each one with its dimensions as tags and an empty expected field. Step 5: a person reviews every case, deletes the unrealistic ones and writes the expected behaviour.",
        code: {
          lang: "python",
          code: "import itertools, json\n\npersonas = [\"new customer\", \"power user\", \"frustrated customer\"]\ntopics = [\"billing\", \"login\", \"data export\"]\nkinds = [\"simple question\", \"two questions in one\", \"missing key detail\", \"out of scope\"]\nPROMPT = \"Write one realistic support message from a {p} about {t}. Make it a {k}. Return only the message.\"\n\nwith open(\"evals/synthetic-draft.jsonl\", \"w\") as f:\n    for i, (p, t, k) in enumerate(itertools.product(personas, topics, kinds)):\n        case = {\"id\": f\"syn-{i:03d}\", \"input\": generate(PROMPT.format(p=p, t=t, k=k)),\n                \"expected\": \"\", \"tags\": [p, t, k, \"synthetic\"]}\n        f.write(json.dumps(case) + \"\\n\")",
        },
      },
    ],
    cheatSheet: [
      "Each case: stable id, exact input, expected answer or criteria, tags",
      "Sample logs by topic, not just the first N rows; remove near-duplicates",
      "Scrub names, emails and account numbers before committing cases",
      "Generate synthetic cases from dimensions (persona x topic x kind), then review by hand",
      "Label refusals and clarifying questions as expected behaviour",
      "Store as JSONL in Git and record the dataset version with every score",
      "With n cases, one case is worth 100/n percentage points",
      "Tune on a dev set; report on a held-out set",
    ],
    quiz: [
      {
        q: "Your eval set has 50 cases. Version A scores 84% and version B scores 86%. What is the most honest conclusion?",
        options: ["B is clearly better", "A is clearly better", "The difference is one case, so it may be noise", "The eval set is broken"],
        answer: 2,
        why: "With 50 cases each case is 2 points, so a 2-point gap is a single case.",
      },
      {
        q: "Why is asking a model for 50 test questions in one go a weak method?",
        options: ["It tends to produce similar, clean, easy questions", "Models cannot write questions", "It is too expensive", "The questions will be in the wrong format"],
        answer: 0,
        why: "Without explicit dimensions, generated cases cluster around the obvious and miss edge cases.",
      },
      {
        q: "What is the right label for an out-of-scope question like What is the CEO's salary?",
        options: ["Leave it unlabelled", "The real salary", "Remove the case from the set", "The expected behaviour: politely declines"],
        answer: 3,
        why: "The correct output is a behaviour, and refusal cases catch invented answers.",
      },
      {
        q: "Two labellers disagree on 30% of cases. What should you do first?",
        options: ["Average their labels", "Clarify the labelling guidelines where they disagree", "Use only one labeller", "Drop the disagreeing cases"],
        answer: 1,
        why: "Frequent disagreement usually means the criteria are unclear, which would also confuse any grader.",
      },
      {
        q: "Why keep a held-out test set separate from the cases you tune prompts on?",
        options: ["To report a score that is not inflated by tuning on the same cases", "To save storage", "Because Git requires it", "To make evals run faster"],
        answer: 0,
        why: "Prompts tuned on specific cases overfit to them, so only unseen cases show real quality.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a script that loads a JSONL eval file and checks every case has a unique id, a non-empty input and at least one tag.",
        hint: "Read line by line with json.loads and collect problems in a list.",
        solution: "import json\n\nids, problems = set(), []\nfor n, line in enumerate(open(\"evals/support-v1.jsonl\"), 1):\n    case = json.loads(line)\n    if case[\"id\"] in ids:\n        problems.append(f\"line {n}: duplicate id {case['id']}\")\n    ids.add(case[\"id\"])\n    if not case.get(\"input\", \"\").strip() or not case.get(\"tags\"):\n        problems.append(f\"line {n}: missing input or tags\")\nprint(\"\\n\".join(problems) or \"OK\")",
      },
      {
        level: "medium",
        task: "Write a scrubber that replaces emails and long digit runs (like order or phone numbers) in a case's input with placeholder values.",
        hint: "Two regular expressions with re.sub; keep the text readable.",
        solution: "import re\n\nEMAIL = re.compile(r\"[\\w.+-]+@[\\w-]+\\.[\\w.]+\")\nDIGITS = re.compile(r\"\\b\\d{6,}\\b\")\n\ndef scrub(text: str) -> str:\n    text = EMAIL.sub(\"user@example.com\", text)\n    return DIGITS.sub(\"1234567\", text)\n\nprint(scrub(\"Order 99881234 for jo.smith@corp.io\"))\n# Order 1234567 for user@example.com",
      },
      {
        level: "hard",
        task: "Split an eval set into dev and test so that each tag keeps roughly the same share in both (70/30), using a fixed seed, and write them to two files.",
        hint: "Group by tag, shuffle each group with a seeded Random, then cut each group at 70%.",
        solution: "import json, random\nfrom collections import defaultdict\ncases = [json.loads(l) for l in open(\"evals/all.jsonl\")]\nrng, groups = random.Random(7), defaultdict(list)\nfor c in cases:\n    groups[c[\"tags\"][0]].append(c)\ndev, test = [], []\nfor tag in sorted(groups):\n    g = groups[tag]; rng.shuffle(g); cut = round(len(g) * 0.7)\n    dev += g[:cut]; test += g[cut:]\nfor name, rows in [(\"dev\", dev), (\"test\", test)]:\n    open(f\"evals/{name}.jsonl\", \"w\").write(\"\".join(json.dumps(r) + \"\\n\" for r in rows))",
      },
    ],
    faq: [
      { q: "How many examples does an LLM eval set need?", a: "Start with 20 to 50 carefully chosen cases; that is enough to catch big regressions. Grow to a few hundred when you need to detect smaller differences." },
      { q: "Can I use only synthetic data for evals?", a: "It is a fine start before launch, but real user inputs reveal problems synthetic data misses. Replace and extend with real cases as soon as you have them." },
      { q: "What format should eval datasets use?", a: "JSONL is the common choice: one JSON object per line, easy to diff in Git, stream and append to." },
      { q: "Should eval cases have exact expected answers?", a: "Only for short factual outputs. For open-ended answers, write criteria that a good answer must meet and must avoid." },
    ],
  },

  "evals/eval-methods": {
    plain: [
      "Once you have test cases, you need a way to score the answers. There are three kinds of grader: code, another model (called an LLM judge), and people. Good eval suites use all three, each for what it does best.",
      "Code checks are the first choice whenever they fit. Is the output valid JSON? Does it include the order number? Is it under 100 words? Did it use the refusal phrase? Code answers these instantly, for free, and the same way every time.",
      "Many qualities cannot be checked by code. Is the answer helpful? Polite? Supported by the sources? An LLM judge reads the answer with a written rubric and returns pass or fail with a reason. It is cheap and scales, but it can be wrong, so you first check it against human labels.",
      "Human review is the ground truth. People label a sample, you compare the judge with them, and you read every case where they disagree. Those disagreements teach you the most.",
    ],
    deepDive: [
      {
        heading: "Code checks go further than you think",
        body: "Before reaching for a judge, list every property you can test with code. Format: does the output parse as JSON and match the schema? Content: is a required value present (5 business days), is a banned phrase absent (we guarantee), does it use the exact refusal sentence? Length: under a word or token limit? Citations: are all cited IDs valid? Tools: did the agent call the right tool with the right arguments? Numbers: is the computed total within a small tolerance of the expected value?\n\nKeep each check separate and report it as its own metric, such as valid_json 100%, cites_source 92%, refusal_correct 88%, instead of one blended score. Separate metrics tell you what broke.\n\nCode checks also make good gates: if the output is not valid JSON, there is no point paying a judge to grade it.",
        bullets: ["Schema validation for structured output", "Regex for required or banned phrases", "Exact refusal phrase match", "Correct tool name and arguments", "Numeric tolerance for computed values"],
      },
      {
        heading: "Writing a judge rubric that works",
        body: "Rate the quality from 1 to 10 is a weak rubric. Two runs disagree, and nobody knows what a 6 means. Strong rubrics judge one criterion at a time, with a binary verdict and a clear definition. For example: PASS if every factual claim in the answer is supported by the context; FAIL if any claim is missing from or contradicts the context.\n\nGive the judge what it needs: the question, the answer, and the context or reference answer. Include one or two short examples of a pass and a fail. Ask for a brief reasoning first and the verdict last, using structured output such as a JSON object with reasoning and verdict fields, so the verdict is easy to parse and the reasoning is there when you review.\n\nUse a capable model at low temperature, and keep the judge prompt versioned in Git like any other prompt.",
        visual: {
          type: "flow",
          title: "One judge call",
          steps: [
            { label: "Gather inputs", detail: "Question, answer, context or reference" },
            { label: "Apply rubric", detail: "One criterion, PASS and FAIL defined" },
            { label: "Show examples", detail: "A short pass and a short fail" },
            { label: "Reason first", detail: "Brief explanation before the verdict" },
            { label: "Parse verdict", detail: "Structured JSON, PASS or FAIL" },
          ],
        },
      },
      {
        heading: "Known judge biases",
        body: "LLM judges have predictable biases. Position bias: when comparing two answers, many judges favour the one shown first (or second). Verbosity bias: longer, more detailed answers tend to score higher even when they are not better. Self-preference: a model may rate answers written by itself or its own model family more kindly. Leniency: judges often pass borderline answers that a strict expert would fail.\n\nEach bias has a counter. For pairwise comparisons, run the judge twice with the order swapped and count only consistent wins. Tell the judge explicitly that length is not a quality signal, and add a length check in code if conciseness matters. Where possible, use a judge from a different model family than the one being graded. To fight leniency, include clear fail examples in the rubric and calibrate against strict human labels.",
        bullets: ["Position bias: swap order, keep consistent wins", "Verbosity bias: say length is not quality", "Self-preference: use a different model family", "Leniency: add fail examples, calibrate"],
      },
      {
        heading: "Calibrating the judge against human labels",
        body: "Before trusting a judge, measure it. Have a domain expert label 50 to 100 real outputs as pass or fail. Run the judge on the same outputs and compare.\n\nRaw agreement can mislead. If 90% of outputs pass and the judge passes everything, agreement is 90% while it catches zero failures. So also measure two rates: of the outputs humans passed, how many did the judge pass (true positive rate), and of the outputs humans failed, how many did the judge fail (true negative rate). The second number is usually the one that matters, because failures are what you are hunting. Cohen's kappa is a single number that corrects agreement for chance: 1 is perfect, 0 is no better than guessing.\n\nImprove the rubric on part of the labelled data and check the final version on the rest, so you do not overfit the judge to the cases you looked at.",
        visual: {
          type: "cycle",
          title: "Calibration loop",
          steps: [
            { label: "Label a sample", detail: "Expert marks pass or fail" },
            { label: "Run the judge", detail: "Same outputs, same rubric" },
            { label: "Compare", detail: "Agreement, TPR, TNR, kappa" },
            { label: "Read disagreements", detail: "Judge wrong, label wrong, or unclear?" },
            { label: "Fix rubric or labels", detail: "Then run again" },
          ],
        },
      },
      {
        heading: "Reviewing disagreements by hand",
        body: "Every case where the judge and the human disagree falls into one of three buckets. The judge is wrong: the rubric is unclear or misses a rule, so fix the wording or add an example. The human is wrong: a tired labeller made a mistake or the guideline was ambiguous, so fix the label and clarify the guideline. The case is genuinely ambiguous: reasonable people could disagree, so decide the policy explicitly and write it down.\n\nKeep a simple review sheet with the case, both verdicts, the judge's reasoning and your decision. Patterns appear quickly, for example the judge always passes answers that are correct but miss the citation.\n\nCalibration is not one-off. User questions drift and models change, so re-check the judge on a fresh human-labelled sample every month or after changing the judge model.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Grading pipeline: cheapest checks first",
        steps: [
          { label: "Code checks", detail: "Format, required fields, banned words" },
          { label: "Gate", detail: "Broken format fails without a judge call" },
          { label: "LLM judge", detail: "One criterion per rubric" },
          { label: "Human sample", detail: "Spot-check and calibrate" },
          { label: "Report per metric", detail: "Separate scores, not one blend" },
        ],
      },
    ],
    examples: [
      {
        title: "Pairwise comparison with an order swap",
        explanation: "You want to know whether prompt v4 beats v3. For each case you have two answers. Step 1: ask the judge which answer is better with v3 shown first. Step 2: ask again with v4 shown first. Step 3: count a win only when the judge picks the same underlying answer both times. Step 4: if it flips, record a tie, because the order, not the content, decided. Over 100 cases, compare wins for each version and look at how many ties you got; many ties means the judge or the rubric is not sharp enough.",
        code: {
          lang: "python",
          code: "def pairwise(judge, question: str, a: str, b: str) -> str:\n    \"\"\"judge(question, first, second) returns 'first' or 'second'.\"\"\"\n    run1 = judge(question, a, b)\n    run2 = judge(question, b, a)\n    if run1 == \"first\" and run2 == \"second\":\n        return \"a\"\n    if run1 == \"second\" and run2 == \"first\":\n        return \"b\"\n    return \"tie\"  # the verdict followed the position, not the content",
        },
      },
      {
        title: "Calibrating a faithfulness judge with real numbers",
        explanation: "An expert labels 60 answers: 45 pass and 15 fail. The judge agrees on 42 of the 45 passes and 9 of the 15 fails. Agreement is 51 of 60, or 85%, which looks fine. But the true negative rate is only 9 of 15 (60%): the judge misses 4 in 10 real failures. Cohen's kappa is about 0.57. You read the 6 missed failures: all had one small unsupported number. You add a fail example with a wrong number to the rubric and re-run on held-out cases, where it now catches 13 of 15 failures.",
        code: {
          lang: "python",
          code: "def judge_report(human: list[bool], judge: list[bool]) -> dict:\n    n, pos = len(human), sum(human)\n    tp = sum(h and j for h, j in zip(human, judge))\n    tn = sum(not h and not j for h, j in zip(human, judge))\n    po = (tp + tn) / n\n    ph, pj = pos / n, sum(judge) / n\n    pe = ph * pj + (1 - ph) * (1 - pj)\n    return {\"agreement\": round(po, 2), \"tpr\": round(tp / pos, 2),\n            \"tnr\": round(tn / (n - pos), 2), \"kappa\": round((po - pe) / (1 - pe), 2)}\n\nhuman = [True] * 45 + [False] * 15\njudge = [True] * 42 + [False] * 3 + [False] * 9 + [True] * 6\nprint(judge_report(human, judge))  # agreement 0.85, tnr 0.6, kappa 0.57",
        },
      },
    ],
    cheatSheet: [
      "Use code checks for anything objective: schema, required values, banned phrases, length",
      "Report each check as its own metric instead of one blended score",
      "Judge one criterion per rubric, with PASS and FAIL defined and a short example of each",
      "Ask the judge for brief reasoning first and the verdict last, as structured output",
      "Pairwise judging: run both orders and count only consistent wins",
      "Calibrate on 50 to 100 human labels; check true negative rate, not just agreement",
      "Cohen's kappa: 1 is perfect, 0 is chance-level agreement",
      "Re-calibrate after changing the judge model or when user traffic shifts",
    ],
    quiz: [
      {
        q: "Your judge agrees with humans 90% of the time, but it simply passes everything. What metric exposes this?",
        options: ["Raw agreement", "Average output length", "Latency", "The true negative rate (failures it catches)"],
        answer: 3,
        why: "A judge that never fails anything catches zero real failures, even with high agreement.",
      },
      {
        q: "Which is the best fit for a code check rather than an LLM judge?",
        options: ["Is the answer polite?", "Does the output parse as JSON with an order_id field?", "Is the explanation clear?", "Is the tone on brand?"],
        answer: 1,
        why: "Format and required fields are objective and can be checked exactly in code.",
      },
      {
        q: "In a pairwise comparison, the judge prefers whichever answer is shown first. What is the fix?",
        options: ["Run both orders and count only consistent wins", "Always show the new version first", "Use a 1 to 10 scale instead", "Raise temperature"],
        answer: 0,
        why: "Swapping order cancels position bias; inconsistent verdicts become ties.",
      },
      {
        q: "Why is PASS or FAIL often better than a 1 to 10 score for a judge?",
        options: ["It uses fewer tokens", "Models cannot count to 10", "Binary verdicts with clear definitions are more consistent and easier to calibrate", "It is required by the API"],
        answer: 2,
        why: "Undefined middle scores vary between runs and graders; a sharp binary rule does not.",
      },
      {
        q: "A judge and a human disagree on a case. Which of these is NOT one of the usual explanations?",
        options: ["The rubric is unclear", "The human label is wrong", "The case is genuinely ambiguous", "The dataset has too many cases"],
        answer: 3,
        why: "Disagreements come from the rubric, the label or a truly ambiguous case, not dataset size.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write code_checks(output, case) that returns separate booleans for: valid JSON, has a non-empty answer field, answer under 120 words, and does not contain the word guarantee.",
        hint: "Return early with valid_json False if parsing fails.",
        solution: "import json\n\ndef code_checks(output: str, case: dict) -> dict[str, bool]:\n    try:\n        data = json.loads(output)\n    except json.JSONDecodeError:\n        return {\"valid_json\": False}\n    answer = str(data.get(\"answer\", \"\"))\n    return {\"valid_json\": True, \"has_answer\": bool(answer.strip()),\n            \"short\": len(answer.split()) <= 120,\n            \"no_guarantee\": \"guarantee\" not in answer.lower()}",
      },
      {
        level: "medium",
        task: "Write a faithfulness judge prompt template with one criterion, PASS and FAIL definitions, and a required JSON output with reasoning and verdict. Then write a parser that defaults to FAIL on bad output.",
        hint: "Ask for the reasoning field before the verdict field.",
        solution: "import json\nJUDGE = \"\"\"Criterion: every factual claim in ANSWER is supported by CONTEXT.\nPASS: all claims are supported. FAIL: any claim is missing from or contradicts CONTEXT.\nReturn JSON: {{\"reasoning\": \"<one or two sentences>\", \"verdict\": \"PASS\" or \"FAIL\"}}\nCONTEXT:\\n{context}\\nANSWER:\\n{answer}\"\"\"\n\ndef parse_verdict(raw: str) -> bool:\n    try:\n        return json.loads(raw).get(\"verdict\") == \"PASS\"\n    except (json.JSONDecodeError, AttributeError):\n        return False  # unparseable counts as FAIL",
      },
      {
        level: "hard",
        task: "Given lists of case IDs, human labels and judge labels, print a disagreement review sheet as CSV with columns id, human, judge, and an empty decision column, sorted so judge false passes come first.",
        hint: "A false pass is human False and judge True; sort on that boolean.",
        solution: "import csv, sys\n\ndef review_sheet(ids, human, judge):\n    rows = [(i, h, j) for i, h, j in zip(ids, human, judge) if h != j]\n    rows.sort(key=lambda r: not (r[2] and not r[1]))  # false passes first\n    w = csv.writer(sys.stdout)\n    w.writerow([\"id\", \"human\", \"judge\", \"decision\"])\n    for i, h, j in rows:\n        w.writerow([i, \"PASS\" if h else \"FAIL\", \"PASS\" if j else \"FAIL\", \"\"])",
      },
    ],
    faq: [
      { q: "Is LLM-as-a-judge reliable?", a: "It can be, for clear single-criterion rubrics, once you have measured its agreement with human labels. Uncalibrated judges often pass too much." },
      { q: "Should the judge be the same model as the app?", a: "Prefer a different and capable model where possible, since models can favour their own outputs. Whatever you choose, calibrate it." },
      { q: "How many human labels do I need to calibrate a judge?", a: "Around 50 to 100 labelled outputs, with enough failures among them, is a practical start. More labels give tighter estimates." },
      { q: "What is Cohen's kappa?", a: "A measure of agreement between two graders that corrects for agreement expected by chance. 1 means perfect agreement and 0 means no better than chance." },
    ],
  },

  "evals/rag-evals": {
    plain: [
      "A RAG answer has two chances to fail. Search can bring back the wrong text, or the model can misuse the right text. If you only score the final answer, both failures look the same, and you may spend a week rewriting prompts when the real problem is search.",
      "So measure the two halves separately. For retrieval, ask: did the chunks that hold the answer come back? For generation, ask: is the answer supported by those chunks, and does it actually answer the question?",
      "Retrieval scores need labels: for each test question, which documents contain the answer. With those labels, scoring is simple counting and costs nothing to run.",
      "Generation scores usually need a judge. The most important one is faithfulness: does every claim in the answer appear in the retrieved text? A faithful answer can still be wrong if the source is outdated, so check correctness too.",
    ],
    deepDive: [
      {
        heading: "Retrieval metrics: recall, precision, hit rate and MRR",
        body: "Say a question has 2 relevant chunks and you retrieve 5, one of which is relevant. Recall at 5 is 1 of 2, or 0.5: you found half of what matters. Precision at 5 is 1 of 5, or 0.2: most of the context is noise. Hit rate at 5 asks a simpler question across all test cases: in what share of questions did at least one relevant chunk appear? MRR (mean reciprocal rank) rewards ranking: if the first relevant chunk is at rank 1 you score 1, at rank 3 you score one third, and if it never appears you score 0, averaged over all questions.\n\nFor RAG, recall matters most. A model can often ignore some noise, but it cannot use text it never received. Precision matters for cost and distraction. MRR matters when you pass only the top few chunks, because a relevant chunk at rank 9 is useless with k = 5.",
        bullets: ["Recall@k = relevant found in top k / all relevant", "Precision@k = relevant in top k / k", "Hit rate@k = share of questions with any relevant hit", "MRR = average of 1 / rank of the first relevant result"],
      },
      {
        heading: "Labelling relevance without endless work",
        body: "Labelling every chunk for every question is slow, and chunk IDs change whenever you change the chunking. A practical shortcut is to label at document level: for each question, note which document (or document plus section) holds the answer. A retrieved chunk counts as relevant if it comes from that document. These labels survive re-chunking, so you can compare chunk sizes fairly.\n\nFor finer checks, store a short key phrase from the answer, like 5 business days, and treat any retrieved chunk containing it as relevant. This is fast and needs no model.\n\nWhen you have no labels at all, an LLM judge can rate each retrieved chunk as relevant or not to the question. This estimates precision (sometimes called context precision) without labels, but it cannot measure recall, because it never sees the chunks that were missed.",
      },
      {
        heading: "Measuring faithfulness and answer quality",
        body: "Faithfulness asks whether the answer sticks to the retrieved context. The common method has two steps. First, split the answer into individual claims: Refunds take 5 business days and are sent to the original card becomes two claims. Second, check each claim against the context with a judge. The score is supported claims divided by total claims, so one invented detail in four claims gives 0.75.\n\nFaithfulness is not correctness. If the retrieved document is outdated, a perfectly faithful answer is still wrong. So also score correctness against a reference answer, and answer relevance: does the answer address what was asked, or does it wander?\n\nOpen-source libraries such as Ragas implement these metrics with LLM judges. They are handy, but read how each metric is computed, and calibrate on a few human labels before trusting the numbers.",
        visual: {
          type: "flow",
          title: "Scoring faithfulness",
          steps: [
            { label: "Take the answer", detail: "Plus the retrieved context" },
            { label: "Split into claims", detail: "One fact per claim" },
            { label: "Check each claim", detail: "Judge: supported by context?" },
            { label: "Score", detail: "Supported claims / total claims" },
          ],
        },
      },
      {
        heading: "Diagnosing: retrieval or generation?",
        body: "For each wrong answer, ask two questions: was the relevant chunk retrieved, and is the answer supported by the context? The answers sort every failure into a bucket with its own fix.\n\nRelevant chunk missing: a retrieval failure. Fix chunking, add hybrid keyword search, add a reranker, raise k, or rewrite the query. Relevant chunk present but answer unsupported or wrong: a generation failure. Fix the prompt, the order of chunks, the model, or reduce noise. Relevant chunk present and answer faithful but still wrong: the source itself is wrong or out of date, so fix the documents. Correct answer but no relevant chunk retrieved: the model answered from memory. That looks like success but is risky, because next time memory may be wrong.\n\nCount the buckets over your eval set before changing anything, and fix the biggest one first.",
        visual: {
          type: "tree",
          title: "Sorting failures into buckets",
          root: "Wrong or risky answer",
          children: [
            { label: "Relevant chunk missing", children: ["Retrieval failure", "Fix: chunking, hybrid, rerank, k"] },
            { label: "Chunk present, answer unsupported", children: ["Generation failure", "Fix: prompt, chunk order, model"] },
            { label: "Faithful but wrong", children: ["Bad or outdated source", "Fix: the documents"] },
            { label: "Correct, nothing retrieved", children: ["Answered from memory", "Risky: tighten grounding"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "One RAG eval run",
        steps: [
          { label: "Load cases", detail: "Questions, relevant docs, reference answers" },
          { label: "Retrieve", detail: "Log chunk IDs and ranks" },
          { label: "Score retrieval", detail: "Recall@k, hit rate, MRR" },
          { label: "Generate", detail: "Same prompt as production" },
          { label: "Score answers", detail: "Faithfulness, correctness, relevance" },
          { label: "Bucket failures", detail: "Retrieval, generation or source" },
        ],
      },
    ],
    examples: [
      {
        title: "Hit rate and MRR from document-level labels",
        explanation: "Each case lists the documents that answer it. Step 1: run retrieval and keep the ordered list of document IDs for the returned chunks. Step 2: find the rank of the first relevant one. Step 3: a hit is any rank within k; the reciprocal rank is 1 divided by that rank, or 0 if none. Step 4: average over all cases. In this example the first case hits at rank 2 (0.5), the second at rank 1 (1.0), and the third misses (0), so hit rate is 0.67 and MRR is 0.5.",
        code: {
          lang: "python",
          code: "def first_rank(retrieved: list[str], relevant: set[str]) -> int | None:\n    for rank, doc in enumerate(retrieved, 1):\n        if doc in relevant:\n            return rank\n    return None\n\ncases = [([\"faq\", \"refunds\", \"pricing\"], {\"refunds\"}),\n         ([\"login\", \"sso\"], {\"login\"}),\n         ([\"pricing\", \"faq\"], {\"export\"})]\nranks = [first_rank(r, rel) for r, rel in cases]\nk = 5\nhit_rate = sum(1 for r in ranks if r and r <= k) / len(ranks)\nmrr = sum(1 / r for r in ranks if r) / len(ranks)\nprint(round(hit_rate, 2), round(mrr, 2))  # 0.67 0.5",
        },
      },
      {
        title: "Finding the real problem in 40 cases",
        explanation: "Your docs bot scores 68% correct on 40 eval questions, and the team wants to try a bigger model.\nStep 1: score retrieval first. Recall at 5 is 0.70, so 12 questions never got the relevant document.\nStep 2: score faithfulness on the answers: 0.95. The model rarely invents things.\nStep 3: bucket the 13 wrong answers: 10 are retrieval misses, 2 are generation errors, 1 is an outdated document.\nStep 4: retrieval is clearly the biggest bucket. Many misses use product codes like ERR-4012 that vector search handles badly, so you add keyword search (hybrid).\nStep 5: re-run: recall rises to 0.88 and correctness to 83%, without changing the model.",
      },
    ],
    cheatSheet: [
      "Score retrieval and generation separately; one blended score hides the cause",
      "Recall@k: share of relevant chunks found; the first metric to fix in RAG",
      "MRR: average of 1/rank of the first relevant result; 0 when nothing relevant is found",
      "Label relevance at document level so labels survive re-chunking",
      "Faithfulness = supported claims / total claims, checked against the retrieved context",
      "Faithful is not correct: an outdated source gives a faithful wrong answer",
      "Low recall, high faithfulness: fix retrieval, not the prompt",
      "Count failure buckets before changing anything; fix the biggest first",
    ],
    quiz: [
      {
        q: "A question has 4 relevant chunks and 2 of them appear in your top 5. What is recall at 5?",
        options: ["0.4", "0.2", "0.5", "0.8"],
        answer: 2,
        why: "Recall is relevant found divided by all relevant: 2 of 4.",
      },
      {
        q: "The first relevant result is at rank 4. What is that question's reciprocal rank?",
        options: ["0.25", "4", "0.4", "1"],
        answer: 0,
        why: "Reciprocal rank is 1 divided by the rank of the first relevant result.",
      },
      {
        q: "Recall@5 is 0.55 and faithfulness is 0.97. What should you work on first?",
        options: ["The prompt wording", "A bigger generation model", "Lower temperature", "Retrieval: chunking, hybrid search or reranking"],
        answer: 3,
        why: "The model sticks to its context; it just often lacks the right context.",
      },
      {
        q: "An answer is fully supported by the retrieved chunk but is still wrong. What is the likely cause?",
        options: ["The judge is broken", "The source document is outdated or wrong", "Recall is too high", "The model ignored the context"],
        answer: 1,
        why: "A faithful answer repeats its source, so a wrong source gives a wrong answer.",
      },
      {
        q: "Why can an LLM judge estimate context precision but not recall without labels?",
        options: ["It only sees the retrieved chunks, not the relevant ones that were missed", "Recall needs a GPU", "Judges cannot read chunks", "Precision is always 1"],
        answer: 0,
        why: "Missed chunks are invisible to a judge that only looks at what was retrieved.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write precision_at_k(retrieved, relevant, k) and test it: retrieved [a, b, c, d, e], relevant {b, e, z}, k 5.",
        hint: "Count relevant items in the first k, divide by k.",
        solution: "def precision_at_k(retrieved: list[str], relevant: set[str], k: int) -> float:\n    top = retrieved[:k]\n    return sum(1 for d in top if d in relevant) / k\n\nprint(precision_at_k([\"a\", \"b\", \"c\", \"d\", \"e\"], {\"b\", \"e\", \"z\"}, 5))  # 0.4",
      },
      {
        level: "medium",
        task: "Treat a retrieved chunk as relevant if it contains a case's key phrase (case-insensitive). Compute the hit rate at k over a list of cases using your search function.",
        hint: "Each case has question and key_phrase; search returns chunk dicts with text.",
        solution: "def phrase_hit_rate(cases: list[dict], search, k: int = 5) -> float:\n    hits = 0\n    for c in cases:\n        texts = [r[\"text\"].lower() for r in search(c[\"question\"], k=k)]\n        if any(c[\"key_phrase\"].lower() in t for t in texts):\n            hits += 1\n    return hits / len(cases)",
      },
      {
        level: "hard",
        task: "Write bucket(case_result) that sorts each result into retrieval_miss, generation_error, bad_source, memory_answer or ok, using three booleans: retrieved_relevant, faithful, correct. Then count buckets over all results.",
        hint: "Check retrieval first, then faithfulness, then correctness.",
        solution: "from collections import Counter\n\ndef bucket(r: dict) -> str:\n    if not r[\"retrieved_relevant\"]:\n        return \"memory_answer\" if r[\"correct\"] else \"retrieval_miss\"\n    if not r[\"faithful\"]:\n        return \"generation_error\"\n    return \"ok\" if r[\"correct\"] else \"bad_source\"\n\n# print(Counter(bucket(r) for r in results).most_common())",
      },
    ],
    faq: [
      { q: "What is a good recall@k for RAG?", a: "It depends on the domain, but aim high, often above 0.85 on your eval set, because answers cannot be better than what retrieval finds. Track it over time rather than chasing a universal number." },
      { q: "What is the difference between faithfulness and correctness?", a: "Faithfulness checks the answer against the retrieved context. Correctness checks it against the true answer. A faithful answer from a wrong source is still incorrect." },
      { q: "Do I need a library like Ragas to evaluate RAG?", a: "No. Recall, hit rate and MRR are a few lines of code. Libraries help with judge-based metrics, but understand and calibrate them before trusting their scores." },
    ],
  },

  "evals/evals-ci": {
    plain: [
      "Prompts and model settings are code. Changing one word in a prompt, or switching to a newer model, can quietly break answers that worked yesterday. Regression evals run your eval set automatically on every such change, just like unit tests run on every code change.",
      "A CI job (continuous integration, the robot that checks every pull request) runs your app on the eval cases, scores the outputs and compares the scores with a threshold. If the score is too low, the job fails and the change cannot be merged until someone looks.",
      "LLM outputs vary a little from run to run, so scores wobble even when nothing changed. Thresholds therefore need a small margin, and you need enough cases to tell a real drop from noise.",
      "Evals cost money and time. Run a small, fast set on every pull request that touches prompts or model code, and the full set every night or before a release.",
    ],
    deepDive: [
      {
        heading: "What should trigger an eval run",
        body: "Run evals when anything that affects model behaviour changes: prompt files, model names and parameters, retrieval settings such as chunk size or k, tool definitions, the eval data itself, and the app code around them. Path filters in your CI config let you skip expensive evals for pull requests that only touch the README or the CSS.\n\nAlso run on a schedule. Hosted models can change behind the same name: some providers offer aliases that move to newer versions over time. A nightly run catches drift you did not cause. Where your provider offers dated or pinned model versions, use them in production so changes happen only when you choose, through a pull request that runs the evals.\n\nRecord, with every run, the git commit, the model version, the prompt version and the dataset version. A score without that context cannot be reproduced.",
      },
      {
        heading: "Noise: why scores wobble and what to do",
        body: "Even with temperature 0, many hosted models are not perfectly deterministic, and LLM judges add their own variation. So the same commit can score 86% on one run and 83% on the next.\n\nThe number of cases sets how much wobble to expect. The standard error of a pass rate is roughly the square root of p times (1 minus p) divided by n. For a pass rate of 0.85 on 50 cases, that is about 0.05, or 5 points. A 3-point drop on 50 cases is therefore not strong evidence of a regression. On 400 cases the standard error falls below 2 points.\n\nYou have four tools. Use more cases. Repeat runs and average them. Compare per case against the baseline (paired), which is more sensitive than comparing two averages. And set thresholds with a margin rather than exactly at today's score.",
        bullets: ["Standard error is about sqrt(p(1-p)/n)", "p 0.85, n 50: about 5 points of wobble", "Paired per-case comparison beats comparing averages", "Low temperature reduces, but rarely removes, variation"],
      },
      {
        heading: "Thresholds, baselines and must-pass cases",
        body: "A good gate combines three rules. An absolute floor taken from your success criteria: correctness must never drop below 80%. A relative check against the baseline, the scores of the current main branch: the pull request may not be more than 3 points worse. And must-pass cases: a small tagged group, such as safety refusals or legally sensitive answers, that must pass every time, because one failure there is unacceptable no matter the average.\n\nKeep thresholds per metric. A blended score lets a gain in tone hide a loss in correctness. Store the baseline as a JSON file of per-case results, updated automatically when main changes, so every pull request compares against a known reference.\n\nWhen a change is a deliberate trade-off, such as a slight drop in one metric for a big cost saving, update the threshold explicitly in the same pull request, so the decision is reviewed and recorded.",
        visual: {
          type: "compare",
          title: "Three gate rules",
          columns: [
            { title: "Absolute floor", points: ["From success criteria", "e.g. correctness at least 80%", "Never goes below, ever"] },
            { title: "Relative to baseline", points: ["Compared with main", "e.g. no more than 3 points worse", "Catches gradual decay"] },
            { title: "Must-pass cases", points: ["Small tagged set", "Safety and legal cases", "One failure fails the build"] },
          ],
        },
      },
      {
        heading: "Reporting: show what got worse",
        body: "A red X with accuracy 0.81 < 0.85 tells the developer almost nothing. A useful report shows each metric next to its baseline and threshold, then lists the cases that flipped from pass to fail, with the input, the old output and the new output. Cases that flipped from fail to pass are worth listing too, because they show what improved.\n\nIn GitHub Actions you can append Markdown to the file named in the GITHUB_STEP_SUMMARY environment variable, and it appears on the job's summary page. Many teams also post a short comment on the pull request. Save the full outputs as a build artifact so reviewers can read every answer, not just the failing ones.\n\nReviewers then judge the change like any code review: is this a real regression, an acceptable trade-off, or a case whose label needs fixing?",
      },
      {
        heading: "Keeping CI evals fast and affordable",
        body: "Split the suite into tiers. A smoke set of 20 to 50 tagged cases runs on every relevant pull request in a few minutes. The full set runs nightly and before releases. Run cases concurrently, with a semaphore to stay under the provider's rate limits.\n\nCache model outputs keyed by a hash of the model, the prompt version and the input. If a pull request only changes one prompt, cases using other prompts reuse cached outputs instead of paying again. Never let the cache hide a real change, so include everything that affects the output in the key.\n\nStore the API key as a CI secret and give CI its own key with a spend limit. Note that in GitHub Actions, workflows triggered by pull requests from forks do not receive repository secrets by default, which protects your key but means evals for outside contributors need a maintainer-triggered run.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Test tiers for an LLM app",
        layers: [
          { label: "Unit tests", detail: "No model calls, every commit" },
          { label: "Smoke evals", detail: "20 to 50 cases, every relevant PR" },
          { label: "Full eval suite", detail: "Hundreds of cases, nightly" },
          { label: "Human review", detail: "Sampled outputs before a release" },
        ],
      },
    ],
    examples: [
      {
        title: "A GitHub Actions workflow for evals",
        explanation: "Step 1: trigger on pull requests that touch prompts, app code or eval data, using a paths filter. Step 2: also run every night at 03:00 UTC to catch provider-side drift. Step 3: check out the code, set up Python and install dependencies. Step 4: run the eval tests with pytest, passing the API key from repository secrets as an environment variable. If any assert fails, pytest exits non-zero and the check goes red on the pull request.",
        code: {
          lang: "yaml",
          code: "name: evals\non:\n  pull_request:\n    paths: [\"prompts/**\", \"app/**\", \"evals/**\"]\n  schedule: [{ cron: \"0 3 * * *\" }]\njobs:\n  evals:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: { python-version: \"3.12\" }\n      - run: pip install -r requirements.txt\n      - run: pytest -q tests/evals\n        env: { LLM_API_KEY: \"${{ secrets.LLM_API_KEY }}\" }",
        },
      },
      {
        title: "Comparing against a baseline, case by case",
        explanation: "The eval run writes results.json as a map from case ID to pass or fail. main's last run is stored as baseline.json. Step 1: find cases that passed on the baseline and fail now; these are the regressions to show reviewers. Step 2: compute both pass rates. Step 3: fail the job if the score is below the absolute floor of 0.80 or more than 3 points under the baseline. Step 4: print everything, so the job log explains the verdict.",
        code: {
          lang: "python",
          code: "import json, sys\n\nbase = json.load(open(\"evals/baseline.json\"))  # {\"case-id\": true, ...}\nnew = json.load(open(\"evals/results.json\"))\nregressed = [cid for cid, ok in base.items() if ok and not new.get(cid, False)]\nscore = sum(new.values()) / len(new)\nbase_score = sum(base.values()) / len(base)\nprint(f\"score {score:.1%} (baseline {base_score:.1%})\")\nfor cid in regressed:\n    print(\"REGRESSED:\", cid)\nif score < 0.80 or score < base_score - 0.03:\n    sys.exit(1)",
        },
      },
    ],
    cheatSheet: [
      "Trigger evals on changes to prompts, model settings, retrieval config, tools and eval data",
      "Run nightly too: hosted model aliases can change behaviour without a commit",
      "Wobble on a pass rate is about sqrt(p(1-p)/n): about 5 points for p 0.85 and n 50",
      "Gate with an absolute floor, a margin below baseline, and must-pass cases",
      "Report per-case regressions with input, old output and new output",
      "GitHub Actions: append Markdown to $GITHUB_STEP_SUMMARY for a readable report",
      "Cache outputs keyed by model, prompt version and input to save cost",
      "Give CI its own API key with a spend limit; fork PRs do not get secrets by default",
    ],
    quiz: [
      {
        q: "Your main branch scores 86% on 50 cases. A PR scores 84%. What is the best reading?",
        options: ["A definite regression, block it", "Within normal noise for 50 cases; check per-case flips", "The eval set is wrong", "The PR improved quality"],
        answer: 1,
        why: "Each case is 2 points and run-to-run wobble is about 5 points, so look at which cases flipped.",
      },
      {
        q: "Why run evals on a nightly schedule even when nobody pushed code?",
        options: ["Hosted models behind an alias can change behaviour", "CI servers need exercise", "To delete old outputs", "It is required by pytest"],
        answer: 0,
        why: "Provider-side updates can cause regressions without any commit from you.",
      },
      {
        q: "Which tagged cases should fail the build after a single failure?",
        options: ["The easiest cases", "Synthetic cases", "Cases added this week", "Must-pass cases such as safety refusals"],
        answer: 3,
        why: "Some behaviours are unacceptable to break even once, regardless of the average.",
      },
      {
        q: "What should the eval cache key include?",
        options: ["Only the input text", "Only the model name", "Model, prompt version and input (everything that affects the output)", "The date"],
        answer: 2,
        why: "If anything that changes the output is missing from the key, the cache can hide real changes.",
      },
      {
        q: "An outside contributor opens a PR from a fork, and the eval job fails with a missing API key. Why?",
        options: ["The fork deleted the key", "By default, workflows for fork PRs do not receive repository secrets", "pytest blocks forks", "The key expired"],
        answer: 1,
        why: "GitHub withholds secrets from fork-triggered pull_request workflows to protect them.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a pytest test that loads must-pass cases (tag must_pass) from a JSONL file and asserts each one passes, so a single failure fails the build with the case ID in the message.",
        hint: "Use pytest.mark.parametrize over the filtered cases.",
        solution: "import json, pytest\nfrom my_app import answer\nfrom my_evals import passes\n\nCASES = [c for c in map(json.loads, open(\"evals/cases.jsonl\"))\n         if \"must_pass\" in c[\"tags\"]]\n\n@pytest.mark.parametrize(\"case\", CASES, ids=[c[\"id\"] for c in CASES])\ndef test_must_pass(case):\n    assert passes(answer(case[\"input\"]), case), case[\"id\"]",
      },
      {
        level: "medium",
        task: "Write a function that returns the standard error of a pass rate and use it to decide if a drop from baseline is bigger than two standard errors.",
        hint: "se = sqrt(p * (1 - p) / n), using the baseline pass rate.",
        solution: "import math\n\ndef significant_drop(base: float, new: float, n: int) -> bool:\n    se = math.sqrt(base * (1 - base) / n)\n    return (base - new) > 2 * se\n\nprint(significant_drop(0.86, 0.84, 50))   # False: about 1 case\nprint(significant_drop(0.86, 0.74, 50))   # True",
      },
      {
        level: "hard",
        task: "Write a script that appends a Markdown table of metric, baseline, new score and status to the GitHub job summary, using the GITHUB_STEP_SUMMARY environment variable.",
        hint: "Open the file path from os.environ in append mode and write table rows.",
        solution: "import os\n\ndef write_summary(rows: list[tuple[str, float, float, float]]) -> None:\n    lines = [\"| Metric | Baseline | New | Status |\", \"|---|---|---|---|\"]\n    for name, base, new, floor in rows:\n        ok = new >= floor and new >= base - 0.03\n        lines.append(f\"| {name} | {base:.1%} | {new:.1%} | {'pass' if ok else 'FAIL'} |\")\n    with open(os.environ[\"GITHUB_STEP_SUMMARY\"], \"a\") as f:\n        f.write(\"\\n\".join(lines) + \"\\n\")\n\nwrite_summary([(\"correctness\", 0.86, 0.84, 0.80), (\"faithfulness\", 0.95, 0.90, 0.92)])",
      },
    ],
    faq: [
      { q: "How do I test LLM prompts in CI?", a: "Treat the eval set as a test suite: run the app on each case in a CI job, score the outputs, and fail the job when scores fall below set thresholds." },
      { q: "Should I set temperature to 0 for evals?", a: "Use the same settings as production so you test what users get. If production uses a higher temperature, run cases more than once and average." },
      { q: "How do I stop evals from making CI too expensive?", a: "Run a small smoke set on relevant pull requests, the full set nightly, cache outputs that did not change, and give CI a key with a spend limit." },
      { q: "What if a prompt change is better overall but fails a few old cases?", a: "Review those cases. If the trade-off is acceptable, update the baseline or thresholds in the same pull request so the decision is visible and recorded." },
    ],
  },

  "evals/tracing": {
    plain: [
      "In production you cannot watch over every user's shoulder. Tracing records the journey of each request: the rewritten query, the chunks found, each model call, each tool call. For every step it notes what went in, what came out, how long it took and what it cost.",
      "A trace is the record of one whole request. A span is one timed step inside it, and spans can contain smaller spans, like folders inside folders. A slow answer becomes easy to explain: you can see that 1.9 of its 2.4 seconds went to one model call.",
      "Logs show what happened. Feedback shows whether users were happy. A simple thumbs up or down, linked to the trace ID, tells you which traces to read first.",
      "The real value comes from a habit: every week, read failing and down-voted traces, find patterns, fix the biggest one, and add those cases to your eval set. That loop is how an LLM app gets better after launch.",
    ],
    deepDive: [
      {
        heading: "What to record on every model call",
        body: "A model call span should answer: which model, with which prompt, cost how much, took how long, and how did it end? Record the model name and exact version, the prompt template version, and key parameters such as temperature and the maximum output tokens. Record token usage from the API response: input tokens, output tokens, and cached input tokens if your provider reports them. Compute cost from usage and a price table you keep in config.\n\nRecord latency two ways: total time and, for streaming, time to first token, which is what users feel. Record the stop or finish reason; a reason meaning the output hit the length limit tells you the answer was cut off. Record retries and errors.\n\nWhether to store full inputs and outputs depends on privacy rules. They are the most useful debugging data, so store them redacted if you can, with limited access and a short retention period.",
        bullets: ["Model and version, prompt version, parameters", "Input, output and cached tokens, plus cost", "Total latency and time to first token", "Finish reason, retries and errors", "Redacted input and output, if policy allows"],
      },
      {
        heading: "OpenTelemetry and the GenAI conventions",
        body: "OpenTelemetry (OTel) is the vendor-neutral standard for traces, metrics and logs. Its Python SDK creates spans, and an exporter sends them, usually over the OTLP protocol, to whatever backend you choose: general tools like Jaeger or Grafana Tempo, or LLM-focused tools such as Langfuse or Arize Phoenix. Because the format is standard, you can switch backends without touching your code.\n\nOTel defines semantic conventions for generative AI, so tools agree on attribute names, for example gen_ai.request.model, gen_ai.usage.input_tokens and gen_ai.usage.output_tokens. These conventions are still evolving, so check the current specification before relying on exact names.\n\nTraces also cross service boundaries. When your API calls a separate retrieval service, the trace context travels in the traceparent HTTP header, and both services' spans join the same trace.",
        visual: {
          type: "layers",
          title: "How a span reaches your dashboard",
          layers: [
            { label: "Your code", detail: "Creates spans and sets attributes" },
            { label: "OTel SDK", detail: "Batches finished spans" },
            { label: "OTLP exporter", detail: "Sends them over the network" },
            { label: "Collector (optional)", detail: "Filters, samples, redacts, routes" },
            { label: "Backend", detail: "Search, timelines, dashboards" },
          ],
        },
      },
      {
        heading: "Cost and latency from traces",
        body: "Once every model span carries tokens and cost, you can answer questions that otherwise need guesswork. Which feature costs the most? Which prompt version doubled the output length? Which ten users produce 40% of the spend? Group cost by feature, user, prompt version and model.\n\nFor latency, use percentiles, not averages. If p50 is 1.2 seconds but p95 is 9 seconds, one user in twenty waits a long time, and the average hides it. Look at the slow traces: often the cause is one huge input, a retry after a timeout, or an agent that took eight steps.\n\nFor streaming apps, chart time to first token separately. Users tolerate a long answer that starts quickly much better than a short one that starts late.",
      },
      {
        heading: "Feedback that is actually useful",
        body: "Explicit feedback is a thumbs up or down, ideally with a few reason buttons such as wrong, not helpful, unsafe, too long, plus an optional comment. Always send the trace ID with it, so every vote points to the exact request, prompt version and retrieved chunks.\n\nMost users never click anything, so collect implicit signals too: the user copied the answer (good sign), pressed regenerate, asked the same question again in different words, abandoned the chat, or asked for a human (bad signs). These are noisier but far more plentiful.\n\nFeedback is a pointer, not a score. A thumbs down may mean the answer was wrong, or simply that the policy is unpopular. Read the trace, decide what really went wrong, and turn real failures into eval cases with the correct expected behaviour.",
        visual: {
          type: "cycle",
          title: "The improvement loop",
          steps: [
            { label: "Trace every request", detail: "Spans, tokens, cost, latency" },
            { label: "Collect feedback", detail: "Votes and implicit signals" },
            { label: "Review bad traces", detail: "Group failures by cause" },
            { label: "Add eval cases", detail: "With the correct expected behaviour" },
            { label: "Fix and ship", detail: "Gated by evals in CI" },
          ],
        },
      },
      {
        heading: "Privacy, retention and sampling",
        body: "Traces of LLM apps contain what users typed, which may include names, health details or passwords pasted by mistake. Redact before storage: replace emails, phone and card numbers with placeholders, and store a pseudonymous user ID instead of a real name. Decide a retention period, such as 30 days for full content and longer for metrics only, and restrict who can read raw traces.\n\nAt high volume, storing every trace gets expensive. Sampling keeps a share. Head sampling decides at the start of a request, which is cheap but random. Tail sampling decides after the request finishes, so you can keep every trace with an error, high latency or negative feedback, and only a small percentage of normal ones. The OpenTelemetry Collector supports tail sampling.\n\nNever sample away the traces that explain your failures.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How a thumbs down finds its trace",
        actors: ["User", "API", "LLM", "Trace store"],
        messages: [
          { from: 0, to: 1, label: "Question" },
          { from: 1, to: 2, label: "Model call" },
          { from: 2, to: 1, label: "Reply plus token usage" },
          { from: 1, to: 3, label: "Spans with trace_id" },
          { from: 1, to: 0, label: "Answer plus trace_id" },
          { from: 0, to: 1, label: "Thumbs down, trace_id, reason" },
          { from: 1, to: 3, label: "Attach feedback to trace" },
        ],
      },
    ],
    examples: [
      {
        title: "Nested spans with OpenTelemetry",
        explanation: "You want each chat request to show up as one trace with a retrieve span and a generate span. Step 1: get a tracer. Step 2: open a root span for the request and tag the prompt version. Step 3: open child spans for retrieval and generation; spans opened inside another become its children automatically. Step 4: set GenAI attributes from the API's usage data. Note: without configuring a TracerProvider and an exporter at startup, the API calls do nothing, which is safe for tests but shows no data.",
        code: {
          lang: "python",
          code: "from opentelemetry import trace\n\ntracer = trace.get_tracer(\"rag-app\")\n\ndef answer(question: str) -> str:\n    with tracer.start_as_current_span(\"chat\") as root:\n        root.set_attribute(\"app.prompt_version\", \"v3\")\n        with tracer.start_as_current_span(\"retrieve\") as s:\n            chunks = search(question)\n            s.set_attribute(\"app.chunks\", len(chunks))\n        with tracer.start_as_current_span(\"generate\") as s:\n            reply = call_model(question, chunks)\n            s.set_attribute(\"gen_ai.usage.input_tokens\", reply.input_tokens)\n            s.set_attribute(\"gen_ai.usage.output_tokens\", reply.output_tokens)\n        return reply.text",
        },
      },
      {
        title: "A weekly trace review that found two problems",
        explanation: "Last week the app handled 4,200 requests, and 38 got a thumbs down.\nStep 1: filter traces with negative feedback and read 20 of them, noting a cause for each.\nStep 2: the causes group up: 9 retrieved an old pricing page, 6 answers were too long, 3 called the wrong tool, 2 were users unhappy with a correct policy answer.\nStep 3: the biggest bucket is retrieval of stale pages. The ingestion job had skipped a folder; fix it and re-index.\nStep 4: a cost view shows one API key producing 30% of spend by sending 50-page documents. Add an input size limit.\nStep 5: add the 9 pricing questions and 3 tool cases to the eval set, so CI guards both fixes.",
      },
    ],
    cheatSheet: [
      "Trace = one request; span = one timed step; spans nest",
      "Log model, prompt version, tokens, cost, latency, time to first token and finish reason",
      "OTel GenAI attributes: gen_ai.request.model, gen_ai.usage.input_tokens, gen_ai.usage.output_tokens",
      "Return the trace ID to the client so feedback can be attached to it",
      "Use p50 and p95 latency, not averages",
      "Redact personal data before storing traces; set a retention period",
      "Tail sampling keeps all errors, slow requests and down-voted traces",
      "Every reviewed failure becomes an eval case",
    ],
    quiz: [
      {
        q: "What is the relationship between a trace and a span?",
        options: ["They are the same thing", "A span contains many traces", "A trace is one request; spans are the timed steps inside it", "Traces are for errors only"],
        answer: 2,
        why: "A trace groups all the spans for one request, and spans can nest.",
      },
      {
        q: "p50 latency is 1.2 s and p95 is 9 s. What does that tell you?",
        options: ["Most requests are fast, but about 1 in 20 is very slow", "The average is 9 s", "Every request takes 1.2 s", "Latency is fine"],
        answer: 0,
        why: "p95 is the time that 95% of requests finish within; the slow tail is hidden by p50 and averages.",
      },
      {
        q: "Why should the API return the trace ID with each answer?",
        options: ["For SEO", "To speed up the next request", "To encrypt the answer", "So user feedback can be linked to the exact request"],
        answer: 3,
        why: "Without the ID, a thumbs down cannot be connected to the prompt, chunks and model that produced it.",
      },
      {
        q: "A model span's finish reason shows the output hit the length limit. What happened?",
        options: ["The answer was cut off by the max output tokens setting", "The model refused", "The request timed out", "The cache returned it"],
        answer: 0,
        why: "A length finish reason means generation stopped at the token limit, not because the answer was complete.",
      },
      {
        q: "Why use tail sampling instead of keeping a random 5% of traces?",
        options: ["It is cheaper to compute", "It keeps every error, slow or down-voted trace while sampling normal ones", "It removes personal data", "It is required by OpenTelemetry"],
        answer: 1,
        why: "Deciding after the request finishes lets you keep exactly the traces you need for debugging.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function that computes the cost of a model call from input and output token counts and per-million-token prices.",
        hint: "Divide tokens by 1,000,000 and multiply by the price.",
        solution: "def call_cost(input_tokens: int, output_tokens: int,\n              in_price_per_m: float, out_price_per_m: float) -> float:\n    return (input_tokens / 1_000_000 * in_price_per_m\n            + output_tokens / 1_000_000 * out_price_per_m)\n\n# example prices, not real ones: $1 in, $4 out per million tokens\nprint(round(call_cost(2_000, 500, 1.0, 4.0), 6))  # 0.004",
      },
      {
        level: "medium",
        task: "Write a redaction function for traces that replaces emails, card-like numbers (13 to 19 digits, spaces or dashes allowed) and phone-like numbers with placeholders.",
        hint: "Apply the card pattern before the phone pattern so long numbers are caught first.",
        solution: "import re\n\nEMAIL = re.compile(r\"[\\w.+-]+@[\\w-]+\\.[\\w.]+\")\nCARD = re.compile(r\"\\b(?:\\d[ -]?){13,19}\\b\")\nPHONE = re.compile(r\"\\+?\\d[\\d ()-]{7,}\\d\")\n\ndef redact(text: str) -> str:\n    text = EMAIL.sub(\"[email]\", text)\n    text = CARD.sub(\"[card]\", text)\n    return PHONE.sub(\"[phone]\", text)",
      },
      {
        level: "hard",
        task: "Given a list of span dicts (trace_id, name, ms, cost, feedback), print p50 and p95 latency of generate spans, total cost per trace, and the IDs of traces with negative feedback sorted by cost.",
        hint: "Use statistics.quantiles with n=20 for p95, and a defaultdict for cost per trace.",
        solution: "import statistics\nfrom collections import defaultdict\ndef report(spans: list[dict]) -> None:\n    gen = sorted(s[\"ms\"] for s in spans if s[\"name\"] == \"generate\")\n    q = statistics.quantiles(gen, n=20)\n    print(\"p50\", statistics.median(gen), \"p95\", q[18])\n    cost, bad = defaultdict(float), set()\n    for s in spans:\n        cost[s[\"trace_id\"]] += s.get(\"cost\", 0.0)\n        if s.get(\"feedback\") == \"down\":\n            bad.add(s[\"trace_id\"])\n    print(sorted(bad, key=lambda t: -cost[t]))",
      },
    ],
    faq: [
      { q: "What is LLM observability?", a: "Being able to see what your LLM app did on each request: inputs, outputs, retrieved context, tool calls, tokens, cost and latency, plus user feedback, so you can find and fix failures." },
      { q: "Do I need a special tool to trace LLM calls?", a: "No. OpenTelemetry works with any backend, and even structured JSON logs with a trace ID are a good start. LLM-focused tools add nicer views for prompts and evals." },
      { q: "Is it safe to log prompts and responses?", a: "Only with care. Redact personal data, restrict access, set a retention period, and follow your privacy policy and local law." },
      { q: "What is time to first token?", a: "The delay between sending a request and receiving the first streamed token. It is the latency users feel most in chat apps." },
    ],
  },
};

export default extra;
