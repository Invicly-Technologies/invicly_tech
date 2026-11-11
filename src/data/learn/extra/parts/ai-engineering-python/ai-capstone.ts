import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "ai-capstone/ai-capstone-scope": {
    plain: [
      "Most AI side projects fail in the same way. Someone starts coding a chatbot, it gives a few nice answers in a demo, and then nobody can say whether it is actually good. This topic stops that from happening. Before you write any app code, you decide what the app is for and how you will measure it.",
      "You write three short things. A problem statement says who the users are and what they need help with. Success criteria are numbers that say when the app is good enough, such as \"85% of answers correct\". An eval set is a list of test questions with the answers you expect.",
      "The eval set is like the exam you write before you study. Because it exists before the app, you cannot accidentally choose easy questions that your app already passes. Every later choice, a new chunk size, a different prompt, another model, gets scored against the same exam.",
      "Finally, you sketch the architecture: the parts of the system and how a question flows through them. Keep it simple. The first version only needs to answer questions with sources. Extras come later, and only if the scores say they help.",
    ],
    deepDive: [
      {
        heading: "A problem statement you can test",
        body: "A good problem statement is narrow and concrete. It names the users (\"support agents in their first month\"), the job (\"answer billing questions from our help center and policy docs\"), and today's pain (\"they search three tools and still escalate 30% of tickets\"). It also lists the sources the app may use, because a RAG app can only be as good as its documents.\n\nJust as important is what the app will not do. Write a short list of non-goals: no legal advice, no account changes, no questions about other products. Non-goals turn into refusal cases in your eval set, and they keep the project small enough to finish.\n\nAdd constraints you already know: data that must stay private, a maximum cost per question, a language the users need. A reviewer should be able to read the page in two minutes and know exactly what \"done\" means.",
        bullets: [
          "Users: who, and how they ask today",
          "Job: the one thing the app helps with",
          "Sources: which documents it may read",
          "Non-goals: what it must refuse",
        ],
      },
      {
        heading: "Success criteria: quality, refusals, speed and cost",
        body: "Every criterion should be a number you can compute from an eval run or from logs. Vague goals like \"accurate\" or \"fast\" cannot fail, so they cannot guide you.\n\nCover four areas. Quality: the share of answers judged correct, and the share whose citations really support the answer. Refusals: out-of-scope questions should get a polite refusal, ideally 100% of them. Latency: use p95, the time under which 95% of requests finish, because averages hide slow outliers. Cost: dollars per question, computed from input and output tokens times your provider's current prices.\n\nAlso write down a baseline to beat. What does the existing search box or a plain prompt without retrieval score on the same eval set? If your RAG app cannot beat that, the extra complexity is not earning its keep.",
        visual: {
          type: "tree",
          title: "Success criteria for a docs assistant",
          root: "Done means",
          children: [
            { label: "Quality", children: ["At least 85% judged correct", "At least 90% citations valid"] },
            { label: "Safety", children: ["100% refusal on out-of-scope", "No made-up sources"] },
            { label: "Speed", children: ["p95 latency under 6 s", "First token under 2 s when streaming"] },
            { label: "Cost", children: ["Under $0.01 per question", "Monthly budget alert set"] },
          ],
        },
      },
      {
        heading: "Building the 30-case eval set",
        body: "Collect real questions first: support tickets, chat logs, Slack threads, or ask five future users to write what they would type. Real questions are messier than the ones you would invent, and that is the point. Then add edge cases: vague questions, typos, questions whose answer is split across two documents, questions about recently changed policies. Finally add out-of-scope questions the app must refuse.\n\nFor each case store the input, the key facts a correct answer must contain, the IDs of the documents that hold the answer, and a few tags such as \"edge\" or \"refusal\". Save it as JSONL (one JSON object per line) in the repository so it is versioned with the code.\n\nThirty cases is a starting size, not a statistic. Each case is worth about 3.3 percentage points, so moving from 80% to 83% is one case and may be noise. Grow the set over time by adding every real failure you see.",
        bullets: [
          "Mix used here: 20 typical, 6 edge, 4 refusal",
          "Store expected facts, not one exact sentence",
          "Store expected document IDs to test retrieval alone",
          "Version the file: evals/cases.jsonl",
        ],
      },
      {
        heading: "Deciding how each case is scored",
        body: "Decide the scoring before the app exists, or you will be tempted to pick whatever scores well. Use the cheapest reliable check for each property.\n\nCode checks are free and exact: does the answer cite at least one source, are all cited IDs among the chunks you actually sent, did a refusal case get refused. Retrieval can be scored on its own: recall@5 asks whether at least one expected document appears in the top 5 retrieved chunks. That tells you if a failure came from search or from the model.\n\nCorrectness of free text needs judgement. An LLM judge with a short rubric (\"PASS if the answer states all key facts and says nothing that contradicts them\") scales well, but it can be wrong. Grade 10 to 15 cases by hand and compare. If you and the judge disagree often, fix the rubric before you trust its numbers.",
        visual: {
          type: "flow",
          title: "Scoring one eval case",
          steps: [
            { label: "Run the app", detail: "Save answer, sources, latency, tokens" },
            { label: "Retrieval check", detail: "Expected doc in the top 5?" },
            { label: "Code checks", detail: "Cited IDs valid, refusal when required" },
            { label: "Judge correctness", detail: "Rubric against the key facts" },
            { label: "Record result", detail: "Pass or fail plus a short reason" },
          ],
        },
      },
      {
        heading: "Planning the architecture",
        body: "Draw the path one question takes: the API receives it, retrieval finds chunks, the model writes an answer with citations, and the API returns the answer and its sources. Next to it, draw the offline path: load documents, split them into chunks, embed them and store them, for example in Postgres with pgvector.\n\nFor each box, pick the simplest option that could work and write down why. One embedding model, vector search with k = 5, one prompt, one model. Plan the tool you will add later, but do not build it on day one.\n\nDo a rough cost check now. A RAG prompt with 5 chunks of about 500 tokens plus instructions is roughly 3,000 to 4,000 input tokens. Multiply by your provider's price per token, add the output tokens, and compare with your budget. If the number is far too high, you will want a smaller model or fewer chunks, and it is better to know before you build.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What goes into the 30-case eval set",
        root: "30 cases",
        children: [
          { label: "20 typical", children: ["Real user questions", "Answer is in one document", "Common phrasing and typos"] },
          { label: "6 edge cases", children: ["Answer spread over two docs", "Recently changed policy", "Vague or very short question"] },
          { label: "4 refusals", children: ["Out of scope topic", "Answer not in any document", "Request the app must not do"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turning a vague idea into a one-page scope",
        explanation: "The idea: \"an AI bot for our docs\". Step 1: pick one user group and one job, here new support agents answering billing questions. Step 2: name the sources, the help center and the refund policy, and write non-goals. Step 3: turn wishes into numbers: \"good answers\" becomes 85% judged correct with valid citations, \"safe\" becomes 100% refusals on the 4 out-of-scope cases. Step 4: record the baseline: the current keyword search finds the right article for 12 of 30 questions.",
        code: {
          lang: "text",
          code: `Users:     support agents in their first month
Job:       answer billing and refund questions with sources
Sources:   help center (220 articles), refund policy PDF
Non-goals: legal advice, changing accounts, other products
Success:   >= 85% correct, >= 90% citations valid,
           100% refusals on out-of-scope, p95 < 6 s, < $0.01/question
Baseline:  keyword search finds the right article for 12/30
Eval set:  evals/cases.jsonl, 30 cases (20 typical, 6 edge, 4 refusal)`,
        },
      },
      {
        title: "Writing and sanity-checking eval cases",
        explanation: "Each line of the JSONL file is one case. Step 1: give every case an ID, the question, the key facts and the expected document IDs. Refusal cases have no facts and no documents, and a flag says the app must refuse. Step 2: load the file with a Pydantic model so a typo in a field name fails loudly instead of silently skipping a check. Step 3: print the mix by tag to confirm it matches the plan before any app code exists.",
        code: {
          lang: "python",
          code: `import json
from collections import Counter
from pydantic import BaseModel

class Case(BaseModel):
    id: str
    question: str
    key_facts: list[str] = []
    expected_docs: list[str] = []
    must_refuse: bool = False
    tags: list[str] = []

cases = [Case.model_validate(json.loads(l)) for l in open("evals/cases.jsonl")]
print(len(cases), Counter(t for c in cases for t in c.tags))`,
        },
      },
    ],
    cheatSheet: [
      "Problem statement = users + job + sources + non-goals + known constraints",
      "Every success criterion must be a number computed from evals or logs",
      "Report p95 latency, not the average",
      "30 cases: each case is about 3.3 points, so 1 or 2 cases of change can be noise",
      "Store key facts and expected doc IDs per case, not one exact answer",
      "recall@5: is an expected document among the top 5 retrieved chunks?",
      "Check your LLM judge against 10 to 15 hand-graded cases",
      "Measure a baseline (plain search or no retrieval) on the same eval set",
    ],
    quiz: [
      {
        q: "Your eval set has 30 cases. Version B scores 83% and version A scored 80%. What is the most careful conclusion?",
        options: ["B is clearly better", "B is 3% cheaper", "The eval set is broken", "B passed one more case, which may be noise; look at which case changed"],
        answer: 3,
        why: "With 30 cases, one case is about 3.3 points, so a single-case difference is weak evidence.",
      },
      {
        q: "Which success criterion is measurable?",
        options: ["Users find it helpful", "At least 90% of cited sources support the answer on the eval set", "Answers feel accurate", "The bot is fast enough"],
        answer: 1,
        why: "It names a number and how it is computed, so it can pass or fail.",
      },
      {
        q: "Why store expected document IDs for each eval case?",
        options: ["To score retrieval separately from the model's answer", "To make the JSONL file smaller", "Because the model needs them in the prompt", "To skip the LLM judge"],
        answer: 0,
        why: "Knowing which documents should be found lets you tell a search miss from a generation error.",
      },
      {
        q: "Why should some eval cases be questions the app must refuse?",
        options: ["They make the scores look higher", "Providers require them", "They test that the app stays in scope and does not invent answers", "They speed up the eval run"],
        answer: 2,
        why: "Without refusal cases, an app that confidently answers everything would never be caught.",
      },
      {
        q: "Why is p95 latency a better target than average latency?",
        options: ["It is always lower", "It shows the slow requests that users notice, which averages hide", "It ignores network time", "It is easier to compute"],
        answer: 1,
        why: "A few very slow answers can hide inside a good-looking average.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Rewrite these goals as measurable success criteria: \"answers should be accurate\", \"it should be cheap\", \"it should not make things up\".",
        hint: "Each one needs a number and a way to compute it from the eval set or logs.",
        solution: "Accurate: at least 85% of eval cases judged correct against their key facts.\nCheap: average cost under $0.01 per question, from logged token counts.\nNo made-up content: 100% of cited IDs are among the chunks sent,\nand 100% of must_refuse cases are refused.",
      },
      {
        level: "medium",
        task: "Write 3 JSONL eval cases for a docs assistant: one typical, one edge case, one refusal.",
        hint: "Use the same fields every time: id, question, key_facts, expected_docs, must_refuse, tags.",
        solution: `{"id": "t01", "question": "How long do refunds take?", "key_facts": ["5 business days"], "expected_docs": ["refund-policy"], "tags": ["typical"]}
{"id": "e01", "question": "refund after annual plan downgrade??", "key_facts": ["prorated", "credited to the account"], "expected_docs": ["refund-policy", "plan-changes"], "tags": ["edge"]}
{"id": "r01", "question": "Can I sue you over a late refund?", "must_refuse": true, "tags": ["refusal"]}`,
      },
      {
        level: "hard",
        task: "Write score_case(case, result) returning a dict of checks: retrieval hit in the top 5, all cited IDs valid, and refusal correct. result has retrieved_ids, sent_ids, cited_ids and refused.",
        hint: "Refusal cases pass only when refused; other cases pass only when not refused.",
        solution: `def score_case(case, result):
    top5 = result["retrieved_ids"][:5]
    hit = not case["expected_docs"] or any(d in top5 for d in case["expected_docs"])
    cited_ok = set(result["cited_ids"]) <= set(result["sent_ids"])
    refusal_ok = result["refused"] == case.get("must_refuse", False)
    return {"retrieval_hit": hit, "citations_valid": cited_ok, "refusal_ok": refusal_ok}`,
      },
    ],
    faq: [
      { q: "How many eval cases do I need?", a: "Thirty is enough to start and to catch big regressions. Grow it to 100 or more over time by adding every real failure, because small sets cannot detect small improvements." },
      { q: "Can I use an LLM to generate my eval questions?", a: "It can help with variety, but base the set on real user questions first. Generated questions tend to match the documents' wording too closely, which makes retrieval look better than it is." },
      { q: "What if I do not have real users yet?", a: "Ask a few people from the target group to write questions they would really ask, and mine old tickets, forum posts or search logs. Even 10 real questions are worth more than 50 invented ones." },
    ],
  },

  "ai-capstone/ai-capstone-build": {
    plain: [
      "This is where you build the real thing: an assistant that answers questions from your documents, shows where each answer came from, can use at least one tool, and proves its quality with scores. It is the project you can show in an interview or a portfolio.",
      "The most important rule is to build a thin slice first. That means the simplest version that works from start to finish: load a few documents, search them, ask the model, and print an answer with sources. It will not be great, but it gives you a baseline score.",
      "Then you improve it in small, measured steps. Change one thing, run the eval set, and keep the change only if the scores get better. Better search, a reranker or a smarter prompt each earn their place with numbers, not with a good feeling.",
      "Finally, you make the quality visible. The eval suite runs automatically on every change in CI (continuous integration, the server that tests your code), the app is deployed with a link people can try, and the README shows the scores of every version.",
    ],
    deepDive: [
      {
        heading: "The thin slice: end to end in a day",
        body: "Resist building the perfect ingestion pipeline first. Start with 10 to 20 documents, split them by headings, embed them, store them, and write one function answer(question) that retrieves the top 5 chunks and asks the model for a cited answer. Call it from a small script that runs the whole eval set and writes a results file.\n\nNow you have a baseline: maybe 60% correct and 70% cited. Every number after this is a comparison, and you can see where the failures are. Often the first surprise is that retrieval, not the model, causes most errors.\n\nOnly then wrap the function in a FastAPI endpoint, add the tool, and add the remaining documents. Because the eval script already exists, each step is checked right away instead of at the end.",
        visual: {
          type: "flow",
          title: "Order of work for the capstone",
          steps: [
            { label: "Thin slice", detail: "Few docs, top-5 search, cited answer" },
            { label: "Baseline eval", detail: "Score all 30 cases, save results" },
            { label: "Improve retrieval", detail: "Chunking, hybrid search, reranker" },
            { label: "Add the tool", detail: "One action users really need" },
            { label: "API and deploy", detail: "FastAPI, Docker, secrets, logs" },
            { label: "CI and README", detail: "Evals gate merges, scores published" },
          ],
        },
      },
      {
        heading: "Ingesting and indexing the documents",
        body: "Ingestion turns raw files into searchable chunks. Parse each format into clean text (HTML, Markdown, PDF), and drop navigation menus and footers, which pollute search. Split by headings first, then by length, aiming for a few hundred tokens per chunk with a little overlap. Keep the heading in the chunk text so a chunk still makes sense on its own.\n\nStore metadata with every chunk: document ID, title, URL, section heading and updated_at. Citations need it, and filters such as \"only current policies\" need it too. Also store a hash of each document's content. When you re-run ingestion, skip documents whose hash did not change, and delete all old chunks of a document before inserting its new ones. That keeps the job idempotent: running it twice gives the same index.\n\nEmbed queries with the same model you used for the chunks; vectors from different models are not comparable. In pgvector, an HNSW index keeps vector search fast as the table grows, and a generated tsvector column with a GIN index adds keyword search.",
        bullets: [
          "Same embedding model for chunks and queries, always",
          "Delete old chunks of a changed doc before inserting new ones",
          "Keep doc ID, URL, heading and updated_at on every chunk",
        ],
      },
      {
        heading: "Retrieval with citations you can verify",
        body: "Pure vector search misses exact terms such as error codes, product names and version numbers. Hybrid search runs a vector query and a keyword query, then merges the two ranked lists. A simple, robust merge is reciprocal rank fusion (RRF): each chunk scores the sum of 1 / (k + rank) over the lists it appears in, with k = 60 as the usual constant. Optionally, a reranker model then reorders the top 20 or so and you keep the best 5.\n\nIn the prompt, number the chunks [1] to [5] and show each one's title and source. Instruct the model to cite numbers after each claim and to say it does not know when the chunks do not contain the answer. After generation, check in code that every cited number was actually sent. If none were cited, or the best retrieval score is below a threshold you tuned on the eval set, return a refusal instead of a guess.\n\nReturn the sources (title and URL) next to the answer so the user can click and check.",
        visual: {
          type: "sequence",
          title: "One question through the assistant",
          actors: ["User", "API", "Postgres", "Model"],
          messages: [
            { from: 0, to: 1, label: "POST /chat with a question" },
            { from: 1, to: 2, label: "Vector and keyword search" },
            { from: 2, to: 1, label: "Top chunks with IDs and URLs" },
            { from: 1, to: 3, label: "Rules plus numbered chunks [1] to [5]" },
            { from: 3, to: 1, label: "Answer with [n] citations" },
            { from: 1, to: 0, label: "Checked answer plus source links" },
          ],
        },
      },
      {
        heading: "Adding a tool the right way",
        body: "Pick a tool that answers questions the documents cannot. For a support bot that might be get_order_status(order_id) or search_changelog(version). For a docs assistant it might be fetching the latest release notes. Start with read-only tools; a tool that changes data needs confirmation from the user and much stricter checks.\n\nYou describe the tool to the model with a name, a description and a JSON schema for its arguments. When the model decides to use it, it returns a tool call with JSON arguments instead of a final answer. Your code validates the arguments (Pydantic works well), runs the tool with a timeout, and sends the result back in the next message. The model then writes the answer, or asks for another tool call.\n\nPut a hard limit on this loop, for example 3 tool rounds per question, so a confused model cannot loop forever and burn tokens. Log every call with its arguments and result. Add eval cases that check the right tool was called with the right arguments.",
        bullets: [
          "Validate tool arguments before running anything",
          "Timeouts and a maximum number of tool rounds",
          "Eval cases for tool choice and arguments, not just final text",
        ],
      },
      {
        heading: "Evals in CI and a README that proves it",
        body: "Turn the eval script into a test that fails when scores drop below your success criteria, and run it in GitHub Actions on every pull request. Store the API key as a repository secret, never in the code. Note that secrets are not passed to workflows triggered by pull requests from forks, so outside contributors' runs will skip or fail the eval step.\n\nModel outputs vary between runs. Use a low temperature where your provider supports it, set thresholds a little below your current score so one flaky case does not block every merge, and re-run a failing case before you trust it. If the full suite is slow or costly, run a fast subset on every pull request and the full set on main or nightly.\n\nThe README is your evidence: the problem statement, an architecture diagram, how to run it locally, a results table with one row per version (correct, cited, p95 latency, cost per question), a demo link and known limitations. Honest limitations make the project more credible, not less.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Diagnosing a failed eval case",
        root: "Case failed",
        children: [
          { label: "Right doc not retrieved", children: ["Fix chunking or cleaning", "Add keyword search (hybrid)", "Try a larger k plus a reranker"] },
          { label: "Retrieved but answer wrong", children: ["Tighten the prompt rules", "Put the best chunk first", "Try a stronger model"] },
          { label: "Bad or missing citation", children: ["Number chunks clearly", "Validate cited IDs in code"] },
          { label: "Should have refused", children: ["Add a score threshold", "Add more refusal examples"] },
          { label: "Tool problem", children: ["Wrong tool or bad arguments", "Improve tool description"] },
        ],
      },
    ],
    examples: [
      {
        title: "The chunk table in Postgres with pgvector",
        explanation: "Step 1: enable the extension. Step 2: create a table with the metadata citations need, a content hash for re-ingestion, and a vector column whose size matches your embedding model (384 for all-MiniLM-L6-v2). Step 3: add a generated tsvector column so Postgres keeps keyword search data in sync automatically. Step 4: add an HNSW index for cosine distance and a GIN index for keyword search. Queries then use embedding <=> query_vector for vector search and tsv @@ plainto_tsquery('english', question) for keywords.",
        code: {
          lang: "sql",
          code: `CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (
  id           bigserial PRIMARY KEY,
  doc_id       text NOT NULL,
  url          text NOT NULL,
  heading      text,
  content      text NOT NULL,
  doc_hash     text NOT NULL,
  updated_at   timestamptz NOT NULL,
  embedding    vector(384) NOT NULL,
  tsv          tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON chunks USING gin (tsv);`,
        },
      },
      {
        title: "Running the eval suite in GitHub Actions",
        explanation: "Step 1: save this file as .github/workflows/evals.yml. Step 2: add LLM_API_KEY under the repository's Settings, Secrets and variables, Actions. Step 3: open a pull request; the job installs dependencies and runs the eval test, which asserts your thresholds (for example accuracy of at least 0.85). If retrieval needs a database, add a Postgres service container built from the pgvector/pgvector image and run ingestion on a small fixture set first. Step 4: in the branch protection rules, mark this job as required so a quality drop blocks the merge.",
        code: {
          lang: "yaml",
          code: `name: evals
on: [pull_request]
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest -q tests/test_evals.py
        env:
          LLM_API_KEY: \${{ secrets.LLM_API_KEY }}`,
        },
      },
    ],
    cheatSheet: [
      "Build a thin slice end to end first, then record the baseline scores",
      "Change one thing per eval run and log what changed",
      "pgvector HNSW index: CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops)",
      "RRF score = sum over lists of 1 / (60 + rank)",
      "Check in code that every cited [n] was actually sent to the model",
      "Cap the tool loop, for example 3 rounds per question",
      "API keys go in repository secrets: ${{ secrets.LLM_API_KEY }} in the workflow",
      "README: problem, architecture, how to run, results per version, limits, demo",
    ],
    quiz: [
      {
        q: "Your app often answers \"I don't know\" even though the answer is in the docs. The logs show the right document is never in the top 5. What should you fix first?",
        options: ["The prompt wording", "Retrieval: chunking, hybrid search or a reranker", "The model temperature", "The README"],
        answer: 1,
        why: "The model cannot use a chunk it never receives, so this is a retrieval miss.",
      },
      {
        q: "Users search for error codes like E1042 and vector search misses them. Which change helps most directly?",
        options: ["Add keyword search and merge results with RRF", "Use longer chunks", "Raise the temperature", "Remove citations"],
        answer: 0,
        why: "Keyword search matches exact tokens that embeddings often blur together.",
      },
      {
        q: "Why put a maximum on the number of tool-call rounds per question?",
        options: ["Providers reject more than one tool", "It improves retrieval recall", "It is required for citations", "So a confused model cannot loop forever and waste time and tokens"],
        answer: 3,
        why: "Without a cap, a model that keeps calling tools can run up cost and latency with no answer.",
      },
      {
        q: "A pull request from a fork fails the eval step with an authentication error. Why?",
        options: ["Forks cannot run Python", "pytest needs a different flag", "Repository secrets are not passed to pull_request workflows from forks", "The model is down"],
        answer: 2,
        why: "GitHub withholds secrets from fork pull requests to protect them.",
      },
      {
        q: "After re-running ingestion, search results show old and new versions of the same policy. What is missing?",
        options: ["A bigger embedding model", "Deleting a document's old chunks before inserting the new ones", "A GIN index", "A higher k"],
        answer: 1,
        why: "Ingestion must replace a changed document's chunks, not just add more.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function that turns a list of eval results (dicts with correct, cited and latency_ms) into one README table row: accuracy, cited rate and p95 latency.",
        hint: "Sort the latencies and take the value at index ceil(0.95 * n) - 1.",
        solution: `import math

def summary_row(name, results):
    n = len(results)
    acc = sum(r["correct"] for r in results) / n
    cited = sum(r["cited"] for r in results) / n
    lat = sorted(r["latency_ms"] for r in results)
    p95 = lat[math.ceil(0.95 * n) - 1] / 1000
    return f"| {name} | {acc:.0%} | {cited:.0%} | {p95:.1f} s |"`,
      },
      {
        level: "medium",
        task: "Write rrf(rankings, k=60, top=5) that merges several ranked lists of chunk IDs with reciprocal rank fusion and returns the best IDs.",
        hint: "Ranks start at 1. A chunk's score is the sum of 1 / (k + rank) over every list it appears in.",
        solution: `from collections import defaultdict

def rrf(rankings, k=60, top=5):
    scores = defaultdict(float)
    for ranking in rankings:
        for rank, chunk_id in enumerate(ranking, start=1):
            scores[chunk_id] += 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)[:top]

# rrf([["a", "b", "c"], ["c", "a", "d"]])  ->  ['a', 'c', 'b', 'd']`,
      },
      {
        level: "hard",
        task: "Write a pytest test that fails CI if accuracy is below 0.85, any must_refuse case was answered, or p95 latency is above 6 seconds. Assume run_evals() returns a list of result dicts.",
        hint: "Use separate asserts with clear messages so the CI log shows which criterion failed.",
        solution: `import math
from my_evals import run_evals

def test_success_criteria():
    rs = run_evals()
    acc = sum(r["correct"] for r in rs) / len(rs)
    leaks = [r["id"] for r in rs if r["must_refuse"] and not r["refused"]]
    lat = sorted(r["latency_ms"] for r in rs)
    p95 = lat[math.ceil(0.95 * len(lat)) - 1]
    assert acc >= 0.85, f"accuracy {acc:.2f} < 0.85"
    assert not leaks, f"answered out-of-scope cases: {leaks}"
    assert p95 <= 6000, f"p95 {p95} ms > 6000 ms"`,
      },
    ],
    faq: [
      { q: "Do I need an agent framework like LangChain for the capstone?", a: "No. A RAG assistant with one tool is a few hundred lines of plain Python with your provider's SDK, FastAPI and Postgres. Writing it yourself makes it easier to debug and to explain in an interview." },
      { q: "How do I stop the assistant from making things up?", a: "Answer only from retrieved chunks, require citations, check in code that cited IDs were actually sent, and refuse when retrieval finds nothing relevant. Then measure it with refusal and citation checks in your eval set." },
      { q: "Is it expensive to run evals on every pull request?", a: "Usually not: 30 cases at around a cent each is well under a dollar per run. If the suite grows large, run a small subset on pull requests and the full suite nightly or on main." },
      { q: "What makes a capstone stand out to employers?", a: "Evidence. A live demo, a results table that shows how each change moved the scores, honest limitations, and CI that blocks regressions show you can ship AI features responsibly." },
    ],
  },
};

export default extra;
