import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "rag/rag-pipeline": {
    plain: [
      "A language model only knows what it saw during training. It has never read your company handbook, your product docs or last week's support tickets. Retrieval-augmented generation (RAG) fixes this without retraining the model. Before the model answers, your app looks up the most relevant passages and pastes them into the prompt. The model then answers like a student in an open-book exam.",
      "RAG has two halves. The first half runs ahead of time: you load your documents, cut them into small pieces called chunks, turn each chunk into a list of numbers called an embedding, and save everything in a searchable store. The second half runs for every question: turn the question into an embedding, find the closest chunks, and send them to the model together with the question.",
      "The model can only be as good as the passages it receives. If search returns the wrong pages, even the best model gives a wrong or vague answer. That is why most RAG work is really search work: clean documents, sensible chunks, useful metadata and a way to test retrieval.",
      "A first version fits in under a hundred lines of Python. The real skill is testing it with questions real users ask, finding where it fails, and fixing the half that is actually broken.",
    ],
    deepDive: [
      {
        heading: "Ingestion is a repeatable job, not a one-off script",
        body: "Documents change. Pages get edited, policies get replaced, files get deleted. If ingestion only ever adds chunks, your index fills up with old and contradicting text, and the model happily quotes last year's price. Treat ingestion as a job you can run again and again with the same result.\n\nGive every document a stable ID (for example its path or URL) and store a hash of its content. On each run, skip documents whose hash did not change. For changed documents, delete all their old chunks and insert the new ones. For documents that disappeared, delete their chunks. Store metadata with every chunk: source, title, URL, section and last-updated date. You will need it for citations and filters later.\n\nOne more rule: if you switch embedding models, re-embed everything. Vectors from two different models live in different spaces and cannot be compared.",
        bullets: ["Stable doc ID plus content hash makes re-runs cheap", "Delete old chunks before inserting new ones for a changed doc", "Keep source, URL and updated_at on every chunk"],
        visual: {
          type: "flow",
          title: "Re-indexing one document safely",
          steps: [
            { label: "Read document", detail: "Get its stable ID and text" },
            { label: "Hash content", detail: "sha256 of the text" },
            { label: "Compare hash", detail: "Same as stored? Skip it" },
            { label: "Delete old chunks", detail: "Remove every chunk with this doc ID" },
            { label: "Chunk and embed", detail: "Same embedding model as before" },
            { label: "Insert and save hash", detail: "In one transaction if possible" },
          ],
        },
      },
      {
        heading: "Retrieval: top-k, thresholds and the token budget",
        body: "At query time you embed the question with the same model you used for the chunks, then ask the store for the k nearest chunks. A good starting point is k = 5 with chunks of a few hundred tokens. Tune both later with evals, not by feel.\n\nTop-k always returns k results, even when nothing is relevant. A question about the office parking rules will still get five chunks back from a product manual. Add a similarity threshold so weak matches are dropped. The right value depends on the embedding model, so pick it by looking at scores for real questions.\n\nThe chunks also cost tokens. Five chunks of 400 tokens is about 2,000 tokens of context on every request. More context is not always better: extra loosely related text can distract the model and makes every call slower and more expensive.",
        bullets: ["pgvector: ORDER BY embedding <=> query LIMIT 5 (cosine distance)", "Add an HNSW index so search stays fast as the table grows", "Log the retrieved chunk IDs and scores for every question"],
      },
      {
        heading: "Building the prompt: order and structure",
        body: "A RAG prompt has a clear shape. Rules come first: answer only from the context, cite sources, say you don't know when the answer is missing. Then the retrieved chunks, each wrapped with an ID, its source and maybe its date, inside clear delimiters such as context tags. The user's question comes last, right before the model starts writing.\n\nOrder inside the context matters too. Research on long contexts (often called lost in the middle) found that models use information at the start and end of a long prompt more reliably than information buried in the middle. Put the best-scoring chunk first, remove near-duplicate chunks, and keep the total short.\n\nIncluding the document title and date with each chunk helps the model resolve conflicts, for example preferring the 2026 policy over the 2024 one.",
        visual: {
          type: "layers",
          title: "The parts of a RAG prompt, top to bottom",
          layers: [
            { label: "System rules", detail: "Use only the context, cite, admit gaps" },
            { label: "Context block", detail: "Numbered chunks with source and date" },
            { label: "Recent chat turns", detail: "Only if this is a conversation" },
            { label: "User question", detail: "Last, right before the answer" },
          ],
        },
      },
      {
        heading: "When you do not need RAG",
        body: "RAG is not always the right tool. If your whole document set is small, say a 30-page handbook, it may fit in the model's context window. Sending all of it is simpler and avoids retrieval misses. Many providers offer prompt caching, which makes resending the same long prefix much cheaper.\n\nSome questions are not search questions at all. How many tickets mentioned billing last month? needs counting over every record, so a SQL query (possibly written by the model) fits better than top-k chunks. Fine-tuning is another option people reach for, but it mostly changes style and format; it is a poor way to teach facts that change every week, and it cannot cite sources.\n\nUse RAG when the knowledge is large, changes often, must stay private in your own store, or needs citations.",
      },
      {
        heading: "Testing with real questions",
        body: "Before you tune anything, collect 20 to 30 questions that real users asked, from support tickets, chat logs or by watching someone use the system. For each question, write down which document should answer it. That label lets you test retrieval on its own: did the right document appear in the top k?\n\nThen read the answers. When one is wrong, look at the logged chunks first. If the right chunk was missing, fix retrieval: chunking, metadata, hybrid keyword search or a reranker. If the right chunk was there and the answer was still wrong, fix the prompt or the model.\n\nA very common retrieval failure is vocabulary mismatch: users write cancel my plan while the docs say terminate subscription. Keyword plus vector (hybrid) search and query rewriting both help with this.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Closed-book model vs RAG",
        columns: [
          { title: "Model alone", points: ["Knowledge frozen at training time", "Has never seen your private docs", "Cannot point to a source", "Updating means retraining"] },
          { title: "Model with RAG", points: ["Reads current docs at question time", "Private data stays in your store", "Can cite the passages it used", "Updating means re-indexing"] },
        ],
      },
      {
        type: "tree",
        title: "Where RAG answers go wrong",
        root: "Wrong answer",
        children: [
          { label: "Data", children: ["Outdated or duplicate docs", "Contradicting versions"] },
          { label: "Ingestion", children: ["PDF text extracted badly", "Tables split mid-row", "Missing metadata"] },
          { label: "Retrieval", children: ["Right chunk not in top k", "Wording mismatch", "No relevance threshold"] },
          { label: "Generation", children: ["Ignores the context", "Fills gaps from memory", "Too many chunks"] },
        ],
      },
    ],
    examples: [
      {
        title: "A RAG table and query in Postgres with pgvector",
        explanation: "You want to store chunks and search them without running a separate vector database. Step 1: enable the pgvector extension. Step 2: create a table with the chunk text, its source and an embedding column whose size matches your embedding model (1024 here is just an example). Step 3: add an HNSW index for fast approximate search with cosine distance. Step 4: at query time, pass the question's embedding as a parameter and order by distance. The <=> operator is cosine distance, so 1 minus it gives a similarity you can compare with a threshold.",
        code: {
          lang: "sql",
          code: "CREATE EXTENSION IF NOT EXISTS vector;\n\nCREATE TABLE chunks (\n  id         bigserial PRIMARY KEY,\n  doc_id     text NOT NULL,\n  source     text NOT NULL,\n  content    text NOT NULL,\n  embedding  vector(1024) NOT NULL\n);\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);\n\n-- $1 = the question's embedding\nSELECT source, content, 1 - (embedding <=> $1) AS similarity\nFROM chunks ORDER BY embedding <=> $1 LIMIT 5;",
        },
      },
      {
        title: "Debugging one wrong answer",
        explanation: "A user asks: Can I get a refund after 30 days? The bot says yes, but the current policy says no.\nStep 1: open the log for that request and read the retrieved chunks, not the answer.\nStep 2: the top chunk comes from refund-policy-2023.pdf, which allowed 60 days. The 2026 policy is in the index but ranked seventh, outside the top 5.\nStep 3: the real bug is in ingestion: the old file was never removed. Delete it, add updated_at metadata, and re-run ingestion.\nStep 4: ask again. The 2026 chunk is now first and the answer is correct.\nStep 5: add this question and its expected source to your eval set so the bug cannot come back silently.",
      },
    ],
    cheatSheet: [
      "Ingest offline: load, chunk, embed, store. Query online: embed, retrieve, build prompt, generate",
      "Embed questions and chunks with the same model; vectors from different models are not comparable",
      "Start with k = 5 and chunks of a few hundred tokens, then tune with evals",
      "pgvector operators: <=> cosine distance, <-> L2 distance, <#> negative inner product",
      "Context cost is about k times chunk size in tokens, paid on every request",
      "Prompt order: rules first, delimited numbered context next, question last",
      "When an answer is wrong, read the retrieved chunks before touching the prompt",
      "If the whole corpus fits in the context window, try sending it all before building RAG",
    ],
    quiz: [
      {
        q: "You start embedding new documents with a different embedding model but keep the old vectors. What happens?",
        options: ["Search gets faster", "Nothing, all embeddings share one space", "Search quality breaks because old and new vectors are not comparable", "Only the stored chunk text changes"],
        answer: 2,
        why: "Each embedding model has its own vector space, so mixing them makes distances meaningless.",
      },
      {
        q: "A RAG answer is wrong. What should you look at first?",
        options: ["The chunks that were retrieved for that question", "The model's temperature", "The front-end code", "The API key permissions"],
        answer: 0,
        why: "Most RAG errors start in retrieval, and the logged chunks show whether the right text was even there.",
      },
      {
        q: "Which question is the worst fit for plain top-k RAG?",
        options: ["What is our refund window?", "How do I reset my password?", "Which doc explains SSO setup?", "How many support tickets mentioned billing last month?"],
        answer: 3,
        why: "Counting over every record needs a database query, not the five most similar chunks.",
      },
      {
        q: "You send 8 chunks of about 500 tokens each. Roughly how much context does that add per request?",
        options: ["400 tokens", "4,000 tokens", "40,000 tokens", "500 tokens"],
        answer: 1,
        why: "8 times 500 is about 4,000 tokens, paid on every call.",
      },
      {
        q: "Why add a similarity threshold on top of top-k?",
        options: ["To make embeddings smaller", "To speed up ingestion", "Top-k always returns k results, so weak unrelated chunks must be dropped", "To meet the context window minimum"],
        answer: 2,
        why: "Without a threshold, an off-topic question still gets k chunks and the model may answer from noise.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write format_context(chunks, max_tokens) that numbers chunks as [1], [2] with their source, and stops adding chunks once an estimated token budget is reached (use about 4 characters per token).",
        hint: "Keep a running total of estimated tokens and break before you go over.",
        solution: "def format_context(chunks: list[dict], max_tokens: int = 2000) -> str:\n    parts, used = [], 0\n    for i, c in enumerate(chunks, 1):\n        block = f\"[{i}] ({c['source']})\\n{c['text']}\"\n        cost = len(block) // 4\n        if used + cost > max_tokens:\n            break\n        parts.append(block)\n        used += cost\n    return \"\\n\\n\".join(parts)",
      },
      {
        level: "medium",
        task: "Make ingestion idempotent. Given docs as {doc_id: text} and a store with get_hash, delete_chunks, add_chunks and set_hash methods, only re-index documents whose content changed.",
        hint: "Hash the text with hashlib.sha256 and compare with the stored hash.",
        solution: "import hashlib\ndef ingest(docs: dict[str, str], store, chunk, embed) -> int:\n    changed = 0\n    for doc_id, text in docs.items():\n        h = hashlib.sha256(text.encode()).hexdigest()\n        if store.get_hash(doc_id) == h:\n            continue\n        store.delete_chunks(doc_id)\n        store.add_chunks(doc_id, [(c, embed(c)) for c in chunk(text)])\n        store.set_hash(doc_id, h)\n        changed += 1\n    return changed",
      },
      {
        level: "hard",
        task: "Write a retrieval test. Each test case has a question and the expected source. Report the hit rate at k (share of cases whose expected source is in the top k) and print the misses.",
        hint: "Call your search function, collect the sources of the results, and check membership.",
        solution: "def hit_rate(cases: list[dict], search, k: int = 5) -> float:\n    hits = 0\n    for c in cases:\n        sources = [r['source'] for r in search(c['question'], k=k)]\n        if c['expected_source'] in sources:\n            hits += 1\n        else:\n            print('MISS:', c['question'], '->', sources)\n    return hits / len(cases)\n\n# print(hit_rate(cases, search, k=5))",
      },
    ],
    faq: [
      { q: "Is RAG better than fine-tuning?", a: "For answering from documents, usually yes. RAG uses current data, can cite sources and updates by re-indexing. Fine-tuning is better for changing style, format or behaviour." },
      { q: "Do I need a dedicated vector database for RAG?", a: "Not to start. Postgres with pgvector, or even an in-memory array for a few thousand chunks, works well. Move to a dedicated store only when scale or features demand it." },
      { q: "How many chunks should I retrieve?", a: "Start with about 5 and measure. Too few risks missing the answer; too many adds cost and can distract the model." },
      { q: "Why does my RAG bot still make things up?", a: "Usually retrieval returned nothing useful and the model filled the gap from memory. Add a relevance threshold, clear grounding rules and a refusal path." },
    ],
  },

  "rag/citations": {
    plain: [
      "A citation is a small label in an answer, like [2], that points to the passage a claim came from. It lets readers click through and check for themselves. For anything that matters, like a policy, a price or a legal rule, people trust an answer much more when they can see its source.",
      "Grounding means the model sticks to the text you gave it. You tell it plainly: use only the context below, and say you don't know when the answer is not there. Models follow this well most of the time, but not every time, so your code double-checks the result.",
      "Refusing is a feature, not a failure. A bot that says I could not find that in the docs is far more useful than one that invents a confident wrong answer. You can even refuse before calling the model at all, when search finds nothing close enough.",
      "The full loop is simple: number the chunks, ask for a citation after each claim, check in code that every cited number really exists, and show the sources as links the user can open.",
    ],
    deepDive: [
      {
        heading: "Three ways to ask for citations",
        body: "The simplest format is inline IDs: the model writes Refunds take 5 days [1]. It is easy to read and easy to parse with a regular expression, but it only tells you which chunk was used, not which sentence in it.\n\nA stronger format asks for a short exact quote from the chunk for each claim. Your code can then check that the quote really appears in that chunk. A made-up quote is a strong sign of a made-up claim.\n\nThe most robust format uses structured output: the model returns JSON with an answer field and a list of citations, each with a chunk ID and a quote. You validate it with a schema such as a Pydantic model. Some provider APIs also have built-in citation features that return exact source spans; when your provider offers one, it is usually more reliable than parsing text yourself.",
        visual: {
          type: "compare",
          title: "Citation formats",
          columns: [
            { title: "Inline IDs", points: ["Text like [1] [3]", "Easy to read and parse", "Checks the chunk, not the claim"] },
            { title: "Quotes", points: ["Exact words from the chunk", "Code checks the quote exists", "Catches invented support"] },
            { title: "Structured JSON", points: ["answer plus citations list", "Validated with a schema", "Easiest to render as links"] },
          ],
        },
      },
      {
        heading: "Verifying citations in code",
        body: "Never show a citation you have not checked. First, every cited ID must be one you actually put in the prompt. Models sometimes cite [4] when only three chunks were given. Second, if you asked for quotes, check that each quote appears in its chunk. Normalise first: collapse whitespace and compare in lowercase so a line break does not cause a false alarm.\n\nA deeper check asks whether the sentence is really supported by the quoted text. This needs a second model call (an LLM judge or an entailment model) and costs time and money, so many teams run it offline in evals rather than on every request.\n\nWhen a check fails, you have three choices: drop the bad citation, drop the unsupported sentence, or replace the whole answer with a refusal. For high-stakes domains, refusing is the safer default.",
        bullets: ["Cited ID not provided: invalid citation", "Quote not found in chunk: likely invented", "No citations at all: treat the answer as ungrounded"],
        visual: {
          type: "flow",
          title: "Checking an answer before showing it",
          steps: [
            { label: "Parse citations", detail: "IDs and quotes from the answer" },
            { label: "Check IDs", detail: "Every ID was in the prompt" },
            { label: "Check quotes", detail: "Each quote appears in its chunk" },
            { label: "Decide", detail: "Show, strip bad parts, or refuse" },
            { label: "Render sources", detail: "Titles and links for valid IDs" },
          ],
        },
      },
      {
        heading: "Grounding instructions that hold up",
        body: "Vague rules like be accurate do little. Clear, testable rules work better. Tell the model to answer only from the context, to cite the chunk ID after every factual sentence, and to prefer the context over its own knowledge even when they disagree. Give it an exact refusal sentence to use when the context does not contain the answer, so your code and your evals can detect refusals with a simple string match.\n\nTell it what to do with partial answers too, for example: answer the part the context supports and say which part is missing. With long contexts, repeating a one-line reminder of the rules after the context block helps.\n\nUse a low temperature for factual Q and A. It does not guarantee correctness, but it reduces creative wandering away from the sources.",
        bullets: ["Answer only from the context inside the context tags", "Cite like [2] after each factual sentence", "If the context does not contain the answer, reply exactly: I could not find this in the documentation."],
      },
      {
        heading: "Refusing before and after generation",
        body: "There are two places to refuse. Before generation: if the best retrieval score is below a threshold, skip the model call and return a not found message. This is cheap and blocks the most common source of invented answers, which is a question with no relevant context. Choose the threshold from data. Run your eval questions, look at the top score for answerable and unanswerable ones, and pick a value between the two groups.\n\nAfter generation: detect the model's refusal phrase and show a helpful not found screen, perhaps with links to search or support.\n\nTrack your refusal rate in production. A sudden jump often means ingestion broke or a new topic appeared that your docs do not cover. A very low rate on a narrow bot can mean it is answering questions it should not.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Refuse early, or answer with checked sources",
        actors: ["User", "App", "Retriever", "LLM"],
        messages: [
          { from: 0, to: 1, label: "Ask a question" },
          { from: 1, to: 2, label: "Search" },
          { from: 2, to: 1, label: "Chunks with scores" },
          { from: 1, to: 1, label: "Best score too low? Refuse" },
          { from: 1, to: 3, label: "Numbered chunks plus rules" },
          { from: 3, to: 1, label: "Answer citing [1] [2]" },
          { from: 1, to: 1, label: "Verify every citation" },
          { from: 1, to: 0, label: "Answer with source links" },
        ],
      },
    ],
    examples: [
      {
        title: "Checking quote-based citations",
        explanation: "You ask the model for structured output: an answer plus a list of citations, each with a chunk_id and a short exact quote. Step 1: validate the JSON with Pydantic. Step 2: for each citation, check the chunk ID exists in the chunks you sent. Step 3: normalise whitespace and case, then check the quote is inside that chunk's text. Step 4: if any citation is bad, log it and either strip it or refuse. In this example a citation pointing to chunk 9, which was never sent, would be reported.",
        code: {
          lang: "python",
          code: "from pydantic import BaseModel\n\nclass Cite(BaseModel):\n    chunk_id: int\n    quote: str\n\ndef norm(s: str) -> str:\n    return \" \".join(s.split()).lower()\n\ndef bad_citations(cites: list[Cite], chunks: dict[int, str]) -> list[str]:\n    bad = []\n    for c in cites:\n        if c.chunk_id not in chunks or norm(c.quote) not in norm(chunks[c.chunk_id]):\n            bad.append(f\"[{c.chunk_id}] {c.quote[:40]}\")\n    return bad",
        },
      },
      {
        title: "Picking a refusal threshold from data",
        explanation: "Your bot answers HR questions. Step 1: take 30 eval questions, 20 that the docs answer and 10 that they do not (like what is the CEO's salary?). Step 2: run retrieval only and record the best similarity score for each. Step 3: sort and compare. In this run the answerable questions mostly score above 0.55 and the unanswerable ones mostly below 0.45. Step 4: set the threshold at 0.50 and count mistakes on both sides. Step 5: one answerable question scored 0.48 because the user wrote PTO and the docs say paid leave. Rather than lowering the threshold for everyone, add the synonym to the doc or use hybrid search. Re-check the numbers whenever you change the embedding model, because scores shift.",
      },
    ],
    cheatSheet: [
      "Number chunks in the prompt and ask for [n] after each factual sentence",
      "Reject any cited ID that was not in the prompt",
      "Ask for exact quotes when you need proof; check them with a normalised substring match",
      "Give the model one exact refusal sentence so code and evals can detect it",
      "Refuse before calling the model when the best retrieval score is below a threshold",
      "Choose the threshold from scores of answerable vs unanswerable eval questions",
      "A valid citation shows the source used; it does not prove the claim is correct",
      "Track refusal rate in production; sudden changes signal ingestion or coverage problems",
    ],
    quiz: [
      {
        q: "The model cites [4], but you only sent chunks [1] to [3]. What should the app do?",
        options: ["Show it, the model probably knows best", "Treat it as invalid and strip it or refuse", "Renumber it as [3]", "Ask the user to find chunk 4"],
        answer: 1,
        why: "A citation to a chunk you never provided cannot support the claim.",
      },
      {
        q: "Why give the model an exact refusal sentence?",
        options: ["It makes answers shorter", "It lowers token cost", "It improves retrieval recall", "Code and evals can detect refusals with a simple match"],
        answer: 3,
        why: "A fixed phrase makes refusals easy to count, test and render in the UI.",
      },
      {
        q: "What is the cheapest way to avoid answering questions your docs do not cover?",
        options: ["Skip the model call when the best retrieval score is below a threshold", "Use a bigger model", "Raise the temperature", "Retrieve 50 chunks"],
        answer: 0,
        why: "If nothing relevant was found, refusing early saves a model call and avoids invented answers.",
      },
      {
        q: "An answer includes a quote that does not appear in the cited chunk. What does that most likely mean?",
        options: ["The chunk is too long", "The embedding model is wrong", "The model invented support for the claim", "The citation format is inline IDs"],
        answer: 2,
        why: "A quote that is not in the source is a strong sign the claim was not grounded.",
      },
      {
        q: "Your refusal rate jumps from 5% to 40% overnight with no code change. What is a likely cause?",
        options: ["Users became more polite", "Ingestion failed or documents went missing from the index", "The model became more accurate", "Citations were turned off"],
        answer: 1,
        why: "If retrieval suddenly finds less, more questions fall below the threshold or lack context.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function that finds all [n] citation IDs in an answer and returns the ones that were not provided.",
        hint: "Use re.findall with a pattern for digits inside square brackets.",
        solution: "import re\n\ndef invalid_ids(answer: str, provided: set[int]) -> set[int]:\n    cited = {int(n) for n in re.findall(r\"\\[(\\d+)\\]\", answer)}\n    return cited - provided\n\nprint(invalid_ids(\"A [1]. B [4].\", {1, 2, 3}))  # {4}",
      },
      {
        level: "medium",
        task: "Write answer_or_refuse(question, search, generate, threshold) that refuses without calling the model when the best score is below the threshold.",
        hint: "Search first, look at the maximum score, and return early.",
        solution: "REFUSAL = \"I could not find this in the documentation.\"\n\ndef answer_or_refuse(question, search, generate, threshold=0.5):\n    results = search(question, k=5)\n    if not results or max(r['score'] for r in results) < threshold:\n        return {'answer': REFUSAL, 'sources': []}\n    good = [r for r in results if r['score'] >= threshold]\n    return generate(question, good)",
      },
      {
        level: "hard",
        task: "Turn a checked answer into display text: keep only valid [n] markers, remove invalid ones, and append a numbered source list with titles and URLs for the IDs actually used.",
        hint: "Use re.sub with a function that returns the match or an empty string.",
        solution: "import re\ndef render(answer: str, sources: dict[int, dict]) -> str:\n    used: dict[int, bool] = {}  # keeps first-seen order\n    def keep(m):\n        n = int(m.group(1))\n        if n in sources:\n            used[n] = True\n            return m.group(0)\n        return \"\"\n    text = re.sub(r\"\\[(\\d+)\\]\", keep, answer)\n    refs = [f\"[{n}] {sources[n]['title']} {sources[n]['url']}\" for n in used]\n    return text + \"\\n\\nSources:\\n\" + \"\\n\".join(refs)",
      },
    ],
    faq: [
      { q: "Can a model with citations still hallucinate?", a: "Yes. It can cite a real chunk and still misstate what it says. Citations make checking possible; quote checks and faithfulness evals catch more of the errors." },
      { q: "Should the model cite per sentence or per answer?", a: "Per sentence or per claim is better. It shows exactly which source supports which statement and makes unsupported sentences easy to spot." },
      { q: "What should a RAG bot say when it does not know?", a: "A short, honest message that the docs do not cover it, ideally with a next step like a search link or a way to contact support." },
    ],
  },

  "rag/rag-advanced": {
    plain: [
      "Real users chat. They ask What does the Pro plan cost? and then And for teams? The second message makes sense to a person, but on its own it is a terrible search query. It has no subject, so search returns random chunks about teams.",
      "Query rewriting fixes this. Before searching, a small model call turns the follow-up into a full standalone question, using the chat history: How much does the Team plan cost per month? That question finds the right chunks.",
      "Metadata filters narrow the search to the right slice of documents: only this customer's files, only pricing pages, only documents from this year. Filters are also how you keep users from seeing documents they are not allowed to read.",
      "Conversation memory is the history your app stores and sends back each turn, because the model itself remembers nothing between calls. Long chats need trimming or summarising, or they become slow and expensive.",
    ],
    deepDive: [
      {
        heading: "Query rewriting and its cousins",
        body: "The basic rewrite is one extra model call: give it the recent history and the new message, and ask for a standalone search query only. Use a small, fast model and a low temperature, and skip the call on the first turn, where there is no history to resolve.\n\nThere are related techniques for harder cases. Multi-query asks the model for three or four different phrasings, searches with each, and merges the results, which helps with vocabulary mismatch. Decomposition splits a question with several parts (compare plan A and plan B) into sub-questions that are searched separately. HyDE (hypothetical document embeddings) asks the model to write a fake answer first and searches with that, because an answer often looks more like the documents than a short question does.\n\nEvery extra call adds latency and cost, so measure whether it improves retrieval on your eval set before keeping it.",
        visual: {
          type: "tree",
          title: "Ways to transform a query before search",
          root: "User message",
          children: [
            { label: "Standalone rewrite", children: ["Resolves it and that", "One cheap call"] },
            { label: "Multi-query", children: ["3 to 4 phrasings", "Merge the results"] },
            { label: "Decomposition", children: ["Split multi-part questions", "Search each part"] },
            { label: "HyDE", children: ["Write a fake answer", "Search with its embedding"] },
          ],
        },
      },
      {
        heading: "Metadata filters: before or after the search?",
        body: "A filter like doc_type = pricing can be applied in two places. Post-filtering takes the top k results and then throws away the ones that do not match. That is simple but dangerous: if all five top results are from other document types, you end up with nothing. Pre-filtering puts the condition inside the database query, so the k results all match.\n\nWith approximate indexes such as HNSW there is a subtlety. The index walks a graph of nearest neighbours and the filter is checked on the way, so a strict filter can still return fewer than k rows. pgvector 0.8 added iterative index scans (the hnsw.iterative_scan setting) that keep searching until enough matching rows are found. Another fix for very selective filters is a separate index or partition per tenant.\n\nA model can also choose filters from the question (self-query): from 2025 billing docs becomes year = 2025 and type = billing. Validate those values like any untrusted input.",
        visual: {
          type: "compare",
          title: "Post-filter vs pre-filter",
          columns: [
            { title: "Post-filter", points: ["Search top k, then drop non-matches", "Can leave zero results", "Restricted text may already be loaded"] },
            { title: "Pre-filter", points: ["Filter inside the database query", "All k results match", "Restricted rows never leave the database"] },
          ],
        },
      },
      {
        heading: "Permissions belong to the server, not the model",
        body: "In a multi-user app, the most important filter is who may see what. Store access data on every chunk, such as tenant_id and a list of allowed groups. At query time, take the user's tenant and groups from the authenticated session on your server, and add them to the search query.\n\nNever let the model decide security filters, and never read them from the request body. A prompt injection or a curious user could otherwise ask for another tenant's documents. The model may pick convenience filters like date or document type; the server always adds the security ones on top.\n\nIn Postgres, the array overlap operator makes group checks simple: allowed_groups && the user's groups. Row-level security policies can act as a second safety net, so even a bug in your query code cannot return another tenant's rows.",
        bullets: ["tenant_id comes from the session, never from the prompt", "allowed_groups && ARRAY['sales','all'] checks group access", "Filter before retrieval so restricted text never reaches the prompt"],
      },
      {
        heading: "Conversation memory: window, summary and long-term facts",
        body: "Chat APIs are stateless, so your app stores each conversation (for example in a table keyed by conversation_id) and sends history back every turn. Sending everything forever does not scale: cost and latency grow with each turn, and very long histories can push out room for retrieved chunks.\n\nA common pattern is a sliding window plus a summary. Keep the last few turns word for word, because recent details matter most. Every few turns, ask a small model to fold older turns into a short running summary, and send that instead of the old messages.\n\nSome apps also keep long-term memory: durable facts like the user prefers metric units, stored separately and retrieved when relevant, much like documents. Treat stored memory as user data: let people see and delete it, and avoid saving secrets.",
        visual: {
          type: "layers",
          title: "Splitting the context budget in a chat RAG app",
          layers: [
            { label: "System prompt", detail: "Rules and refusal phrase" },
            { label: "Summary of older turns", detail: "A few hundred tokens" },
            { label: "Last few turns verbatim", detail: "Recent details stay exact" },
            { label: "Retrieved chunks", detail: "Usually the biggest share" },
            { label: "New question", detail: "Always last" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "One follow-up turn, start to finish",
        actors: ["User", "App", "Small LLM", "Vector store"],
        messages: [
          { from: 0, to: 1, label: "And for teams?" },
          { from: 1, to: 1, label: "Load history for this chat" },
          { from: 1, to: 2, label: "History plus message: rewrite" },
          { from: 2, to: 1, label: "Team plan price per month" },
          { from: 1, to: 3, label: "Search with tenant and type filters" },
          { from: 3, to: 1, label: "Matching chunks" },
          { from: 1, to: 0, label: "Answer from main model" },
        ],
      },
    ],
    examples: [
      {
        title: "Rewriting a follow-up with a safe fallback",
        explanation: "History: the user asked What does the Pro plan cost? and the bot said 20 dollars per month. Now the user writes And for teams?\nStep 1: if there is no history, search with the message as it is.\nStep 2: otherwise send the last few turns and the message to a small model with the rewrite prompt.\nStep 3: if the rewrite comes back empty or very long, fall back to the raw message rather than failing.\nStep 4: search with the rewritten query, but show the user's original words in the chat. Log both versions so you can debug bad rewrites later.",
        code: {
          lang: "python",
          code: "PROMPT = (\"Rewrite the last message as a standalone search query. \"\n          \"Use the history only to fill in missing details. Return only the query.\\n\\n\"\n          \"History:\\n{history}\\n\\nLast message: {message}\")\n\ndef search_query(history: list[dict], message: str, small_llm) -> str:\n    if not history:\n        return message\n    recent = \"\\n\".join(f\"{m['role']}: {m['content']}\" for m in history[-6:])\n    query = small_llm(PROMPT.format(history=recent, message=message)).strip()\n    if not query or len(query) > 300:\n        return message  # fall back instead of failing\n    return query",
        },
      },
      {
        title: "A tenant-safe filtered vector search in pgvector",
        explanation: "A SaaS app keeps every customer's documents in one chunks table. Step 1: read tenant_id and the user's groups from the verified session, never from the request body. Step 2: put both into the WHERE clause together with optional filters the user picked, like document type. Step 3: on pgvector 0.8 or newer, turn on iterative scans so a selective filter still returns up to k rows from the HNSW index. Step 4: order by cosine distance and limit to k.",
        code: {
          lang: "sql",
          code: "SET hnsw.iterative_scan = relaxed_order;  -- pgvector 0.8+\n\n-- $1 query embedding, $2 tenant_id, $3 user's groups, $4 allowed doc types\nSELECT id, source, content\nFROM chunks\nWHERE tenant_id = $2\n  AND allowed_groups && $3\n  AND doc_type = ANY($4)\n  AND updated_at >= now() - interval '1 year'\nORDER BY embedding <=> $1\nLIMIT 5;",
        },
      },
    ],
    cheatSheet: [
      "Rewrite follow-ups into standalone queries; skip the rewrite on the first turn",
      "Use a small fast model at low temperature for rewriting, and fall back to the raw message",
      "Search with the rewritten query but show and store the user's original words",
      "Pre-filter inside the database query; post-filtering can leave zero results",
      "Security filters (tenant, groups) come from the session, never from the model or request",
      "pgvector 0.8+: SET hnsw.iterative_scan = relaxed_order helps filtered HNSW queries return k rows",
      "Memory pattern: last few turns verbatim plus a running summary of older ones",
    ],
    quiz: [
      {
        q: "Why does searching with the raw follow-up And for teams? usually fail?",
        options: ["It is too long", "It lacks the subject, so it matches the wrong chunks", "Embeddings cannot handle questions", "The vector store rejects short queries"],
        answer: 1,
        why: "The subject (the plan price) lives in the history, not in the follow-up text.",
      },
      {
        q: "You post-filter top 5 results by doc_type = pricing and get zero results. What is the better approach?",
        options: ["Increase temperature", "Retrieve only 1 chunk", "Remove the filter", "Apply the filter inside the database query (pre-filter)"],
        answer: 3,
        why: "Pre-filtering guarantees the returned rows already match, so you do not throw everything away.",
      },
      {
        q: "Where should the tenant_id used in the retrieval filter come from?",
        options: ["The authenticated session on the server", "The model's output", "A field in the JSON request body", "The rewritten query"],
        answer: 0,
        why: "Only the server-side session is trusted; anything else can be manipulated.",
      },
      {
        q: "What does HyDE do?",
        options: ["Hides documents from unauthorised users", "Compresses chat history", "Searches using the embedding of a model-written hypothetical answer", "Deletes duplicate chunks"],
        answer: 2,
        why: "A fake answer often looks more like the real documents than a short question does.",
      },
      {
        q: "A chat is 80 turns long and every request is slow and costly. What is a common fix?",
        options: ["Send only the system prompt", "Keep the last few turns verbatim and summarise older turns", "Raise max output tokens", "Start a new API key"],
        answer: 1,
        why: "Recent turns keep exact details while a summary keeps older context short.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write trim_history(history, keep) that returns only the last keep messages, but always keeps the very first user message (the original goal).",
        hint: "Slice from the end and prepend the first message if it was cut off.",
        solution: "def trim_history(history: list[dict], keep: int = 6) -> list[dict]:\n    if len(history) <= keep:\n        return history\n    return [history[0]] + history[-(keep - 1):]",
      },
      {
        level: "medium",
        task: "Build a safe filter builder: it takes user-chosen filters (doc_type, year) and the session, validates doc_type against an allowed list, and always adds tenant_id from the session.",
        hint: "Ignore any tenant_id the user sends; take it from the session object.",
        solution: "ALLOWED_TYPES = {\"pricing\", \"faq\", \"manual\"}\n\ndef build_filters(user_filters: dict, session: dict) -> dict:\n    f = {\"tenant_id\": session[\"tenant_id\"]}\n    if user_filters.get(\"doc_type\") in ALLOWED_TYPES:\n        f[\"doc_type\"] = user_filters[\"doc_type\"]\n    year = user_filters.get(\"year\")\n    if isinstance(year, int) and 2000 <= year <= 2100:\n        f[\"year\"] = year\n    return f",
      },
      {
        level: "hard",
        task: "Implement a memory class that keeps the last N messages verbatim and, when it grows past N, folds the oldest messages into a running summary using a summarise(old_summary, messages) function.",
        hint: "Pop messages off the front of the list until it is back to N, and pass them to summarise.",
        solution: "class Memory:\n    def __init__(self, summarise, keep: int = 6):\n        self.summary, self.recent = \"\", []\n        self.summarise, self.keep = summarise, keep\n    def add(self, role: str, content: str) -> None:\n        self.recent.append({\"role\": role, \"content\": content})\n        if len(self.recent) > self.keep:\n            old, self.recent = self.recent[:-self.keep], self.recent[-self.keep:]\n            self.summary = self.summarise(self.summary, old)\n    def context(self) -> str:\n        return f\"Summary: {self.summary}\" if self.summary else \"\"",
      },
    ],
    faq: [
      { q: "Do I always need query rewriting?", a: "Only for conversational apps where follow-ups are common. For single-question search boxes it adds cost and latency without much gain." },
      { q: "Can I just send the whole chat history as the search query?", a: "It usually works poorly. Long mixed text produces a blurry embedding; a short standalone rewrite matches documents much better." },
      { q: "How do I stop users seeing other customers' documents in RAG?", a: "Store tenant and access data on each chunk and filter on it in the retrieval query using values from the authenticated session. Row-level security adds a second safety net." },
      { q: "What is the difference between conversation memory and RAG?", a: "Memory is what was said in this chat; RAG retrieves facts from your document store. Many apps use both and give each a share of the context budget." },
    ],
  },
};

export default extra;
