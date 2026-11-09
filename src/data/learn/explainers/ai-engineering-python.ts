import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────────────────── Foundations ─────────────────────────
  "ai-foundations/how-llms-work": {
    summary:
      "A large language model predicts the next token from the tokens before it, one step at a time. Text is split into tokens, the whole conversation must fit in a context window, and sampling settings control how random the choices are.",
    analogy: "It is like a very well-read autocomplete that writes one word-piece at a time.",
    visuals: [
      {
        type: "flow",
        title: "Generating one token",
        steps: [
          { label: "Text in", detail: "Prompt plus conversation so far" },
          { label: "Tokenise", detail: "Split text into token IDs, often word pieces" },
          { label: "Model forward pass", detail: "Scores every possible next token" },
          { label: "Sample", detail: "Temperature and top-p pick one token" },
          { label: "Append and repeat", detail: "Until a stop token or length limit" },
        ],
      },
      {
        type: "compare",
        title: "Low vs high temperature",
        columns: [
          { title: "Low (0 to 0.3)", points: ["Picks likely tokens", "More consistent output", "Good for extraction and code", "Can be repetitive"] },
          { title: "High (0.8 and up)", points: ["Samples less likely tokens", "More varied output", "Good for brainstorming", "More prone to errors"] },
        ],
      },
    ],
    keyPoints: [
      "Models see tokens, not characters or words; one English word is often one to two tokens.",
      "The context window limits input plus output tokens in a single request.",
      "Models have no memory between requests; you resend the conversation each time.",
      "Hallucinations happen because the model generates plausible text, not verified facts.",
    ],
    terms: [
      { term: "Token", meaning: "A chunk of text, often a word piece, that the model processes." },
      { term: "Context window", meaning: "Maximum tokens the model can consider in one request." },
      { term: "Temperature", meaning: "Controls randomness when picking the next token." },
      { term: "Top-p", meaning: "Samples only from the smallest set of tokens covering probability p." },
      { term: "Hallucination", meaning: "Confident output that is false or unsupported." },
    ],
    pitfalls: [
      "Assuming temperature 0 guarantees identical output every time.",
      "Treating model answers as facts without grounding or checking.",
    ],
    check: [
      { q: "Why does a model forget earlier messages in a long chat?", a: "Older tokens no longer fit in the context window, or your app dropped them before sending." },
      { q: "Which temperature suits extracting fields from invoices?", a: "A low temperature, because you want consistent, predictable output." },
    ],
  },

  "ai-foundations/model-landscape": {
    summary:
      "You can call hosted models through a provider's API or run open-weight models on your own hardware. The right choice depends on quality, latency, cost, context size, privacy and licence for your use case.",
    visuals: [
      {
        type: "compare",
        title: "Hosted API vs open-weight",
        columns: [
          { title: "Hosted API", points: ["Often strongest quality", "No GPUs to manage", "Pay per token", "Data leaves your network"] },
          { title: "Open-weight", points: ["Download and run yourself", "Full control and privacy", "You pay for hardware and ops", "Check the licence terms"] },
        ],
      },
    ],
    keyPoints: [
      "Pick the smallest model that passes your evals; bigger is slower and costlier.",
      "Compare models on your own task data, not just public leaderboards.",
      "Check context size, rate limits and data retention terms before committing.",
      "Open-weight licences vary; some restrict commercial use or large deployments.",
    ],
    terms: [
      { term: "Hosted model", meaning: "A model you access over an API run by a provider." },
      { term: "Open-weight model", meaning: "A model whose weights you can download and run." },
      { term: "Latency", meaning: "Time until the response arrives, or its first token." },
      { term: "Benchmark", meaning: "A standard test set used to compare models." },
      { term: "Licence", meaning: "Legal terms for how model weights may be used." },
    ],
    pitfalls: [
      "Choosing a model from a leaderboard without testing it on your task.",
      "Ignoring data privacy requirements when sending user data to an API.",
    ],
    check: [
      { q: "Name two reasons to choose an open-weight model.", a: "Data must stay on your own infrastructure, or you need full control over cost and customisation." },
      { q: "How should you pick between two models?", a: "Run both on your own eval set and compare quality, latency and cost." },
    ],
  },

  "ai-foundations/python-for-ai": {
    summary:
      "LLM apps spend most of their time waiting on network calls, so async Python lets you run many at once. Type hints and Pydantic models make data shapes explicit and validate them at runtime.",
    visuals: [
      {
        type: "compare",
        title: "Sequential vs concurrent calls",
        columns: [
          { title: "Sequential await", points: ["One call at a time", "Total time is the sum", "Simple to reason about"] },
          { title: "asyncio.gather", points: ["Calls overlap while waiting", "Total time near the slowest", "Needs a concurrency limit"] },
        ],
      },
    ],
    keyPoints: [
      "async def defines a coroutine; await pauses it while I/O happens.",
      "asyncio.gather runs several coroutines concurrently and collects results.",
      "Use a Semaphore to cap concurrency and stay under rate limits.",
      "Pydantic validates and converts data, raising clear errors on bad input.",
    ],
    terms: [
      { term: "Coroutine", meaning: "A function defined with async def that can be awaited." },
      { term: "Event loop", meaning: "asyncio's scheduler that runs coroutines while others wait." },
      { term: "asyncio.gather", meaning: "Runs awaitables concurrently and returns their results." },
      { term: "Type hint", meaning: "An annotation like name: str describing expected types." },
      { term: "Pydantic model", meaning: "A class that validates data against typed fields." },
    ],
    example: {
      lang: "python",
      code: "import asyncio\nfrom pydantic import BaseModel\n\nclass Answer(BaseModel):\n    question: str\n    text: str\n\nasync def ask(q: str) -> Answer:\n    await asyncio.sleep(1)  # stands in for an API call\n    return Answer(question=q, text=f'Answer to {q}')\n\nasync def main() -> None:\n    answers = await asyncio.gather(*(ask(q) for q in ['a', 'b', 'c']))\n    print([a.text for a in answers])  # about 1s total, not 3s\nasyncio.run(main())",
      caption: "Three simulated calls run concurrently and return typed objects.",
    },
    pitfalls: [
      "Calling blocking libraries inside async code, which stalls the event loop.",
      "Launching hundreds of concurrent calls and hitting rate limits.",
    ],
    check: [
      { q: "Three calls take 2 seconds each. Roughly how long with gather?", a: "About 2 seconds, since they wait concurrently rather than one after another." },
      { q: "What happens when Pydantic receives a missing required field?", a: "It raises a ValidationError describing which field is wrong." },
    ],
  },

  // ───────────────────────── LLM APIs ─────────────────────────
  "llm-apis/first-calls": {
    summary:
      "Chat APIs take a list of messages with roles and return the model's reply. The official SDK handles authentication and HTTP details; your app keeps the conversation history and resends it each turn.",
    visuals: [
      {
        type: "sequence",
        title: "A multi-turn chat",
        actors: ["Your app", "Provider SDK", "LLM API"],
        messages: [
          { from: 0, to: 1, label: "System prompt plus user message" },
          { from: 1, to: 2, label: "HTTPS request with API key" },
          { from: 2, to: 1, label: "Assistant reply and token usage" },
          { from: 1, to: 0, label: "Response object" },
          { from: 0, to: 0, label: "Append reply to history" },
          { from: 0, to: 1, label: "Send full history plus next message" },
        ],
      },
    ],
    keyPoints: [
      "Load API keys from environment variables, never hard-code them.",
      "The system prompt sets behaviour; user and assistant messages carry the conversation.",
      "APIs are stateless, so send the relevant history with every request.",
      "Read the usage field to track input and output tokens per call.",
    ],
    terms: [
      { term: "SDK", meaning: "A provider's official library wrapping its HTTP API." },
      { term: "System prompt", meaning: "Instructions that set the model's role and rules." },
      { term: "Message role", meaning: "Who said it: system, user or assistant." },
      { term: "API key", meaning: "Secret credential identifying your account." },
      { term: "Stateless", meaning: "Each request is independent; the server keeps no chat memory." },
    ],
    example: {
      lang: "python",
      code: "import os\n\napi_key = os.environ['LLM_API_KEY']  # never hard-code keys\n\nsystem = 'You are a concise cooking assistant.'\nhistory = [{'role': 'user', 'content': 'How long to boil an egg?'}]\n\n# reply = client.chat(model=MODEL, system=system, messages=history)\n# Exact call names differ by provider; check your SDK docs.\nreply = 'About 7 minutes for a jammy yolk.'\n\nhistory.append({'role': 'assistant', 'content': reply})\nhistory.append({'role': 'user', 'content': 'And hard-boiled?'})\nprint(len(history), 'messages will be sent next turn')",
      caption: "The message history your app keeps and resends each turn.",
    },
    pitfalls: [
      "Committing API keys to Git.",
      "Sending only the latest message and wondering why the model forgot context.",
    ],
    check: [
      { q: "Does the API remember earlier turns of the conversation?", a: "No. Your app must send the relevant history with each request." },
      { q: "Where should the API key live?", a: "In an environment variable or secret manager, not in source code." },
    ],
  },

  "llm-apis/streaming": {
    summary:
      "Streaming returns the response as small chunks while the model generates, instead of one block at the end. Users see output almost immediately, which makes apps feel much faster.",
    visuals: [
      {
        type: "sequence",
        title: "Streaming to a web client",
        actors: ["Browser", "Your server", "LLM API"],
        messages: [
          { from: 0, to: 1, label: "POST /chat" },
          { from: 1, to: 2, label: "Request with stream enabled" },
          { from: 2, to: 1, label: "Chunk: 'The'" },
          { from: 1, to: 0, label: "Forward chunk via SSE" },
          { from: 2, to: 1, label: "More chunks..." },
          { from: 2, to: 1, label: "Final event with usage" },
          { from: 1, to: 0, label: "Done event" },
        ],
      },
    ],
    keyPoints: [
      "Streaming cuts time to first token, not total generation time.",
      "Server-sent events are a simple, common way to push chunks to browsers.",
      "Accumulate chunks to get the full text for logging and storage.",
      "Handle client disconnects and stop the upstream request to save tokens.",
    ],
    terms: [
      { term: "Streaming", meaning: "Receiving output incrementally as it is generated." },
      { term: "Chunk", meaning: "One piece of streamed output, often a few tokens." },
      { term: "Time to first token", meaning: "Delay before the first chunk arrives." },
      { term: "SSE", meaning: "Server-sent events: a one-way HTTP stream to the browser." },
    ],
    example: {
      lang: "python",
      code: "import time\nfrom typing import Iterator\n\ndef fake_stream() -> Iterator[str]:\n    # Stands in for your SDK's streaming iterator\n    for piece in ['Streaming ', 'feels ', 'fast.']:\n        time.sleep(0.3)\n        yield piece\n\nparts: list[str] = []\nfor chunk in fake_stream():\n    print(chunk, end='', flush=True)\n    parts.append(chunk)\n\nfull_text = ''.join(parts)  # keep the whole reply for logs",
      caption: "Print chunks as they arrive and keep the full text.",
    },
    pitfalls: [
      "Buffering the whole stream on the server before sending, losing the benefit.",
      "Parsing structured JSON before the stream has finished.",
    ],
    check: [
      { q: "Does streaming make the total response faster?", a: "Not really; it shows the first tokens sooner, so it feels faster." },
      { q: "Why stop the upstream request when the user disconnects?", a: "Otherwise the model keeps generating tokens you still pay for." },
    ],
  },

  "llm-apis/structured-output": {
    summary:
      "Structured output asks the model to return JSON matching a schema instead of free text. Parsing it into Pydantic models gives your code typed, validated objects to work with.",
    visuals: [
      {
        type: "flow",
        title: "From prompt to typed object",
        steps: [
          { label: "Define schema", detail: "Pydantic model or JSON Schema" },
          { label: "Request JSON", detail: "Use the API's structured output or JSON mode" },
          { label: "Parse", detail: "model_validate_json turns text into an object" },
          { label: "Validate", detail: "Types, required fields and allowed values" },
          { label: "Retry or fail", detail: "Send errors back once, then give up cleanly" },
        ],
      },
    ],
    keyPoints: [
      "Many APIs can constrain output to a JSON schema; prefer that over prompt-only requests.",
      "Always validate output, even when the API promises valid JSON.",
      "Use enums and Literal types to restrict values to known options.",
      "Field descriptions in the schema act as instructions for the model.",
    ],
    terms: [
      { term: "Structured output", meaning: "Model output constrained to a defined format like JSON." },
      { term: "JSON Schema", meaning: "A standard way to describe the shape of JSON data." },
      { term: "Validation", meaning: "Checking data matches the expected types and rules." },
      { term: "Literal type", meaning: "A type allowing only specific values, like 'low' or 'high'." },
    ],
    example: {
      lang: "python",
      code: "from typing import Literal\nfrom pydantic import BaseModel, ValidationError\n\nclass Ticket(BaseModel):\n    summary: str\n    priority: Literal['low', 'medium', 'high']\n    tags: list[str]\n\nschema = Ticket.model_json_schema()  # send this with the request\nraw = '{\"summary\": \"Login fails\", \"priority\": \"high\", \"tags\": [\"auth\"]}'\ntry:\n    ticket = Ticket.model_validate_json(raw)\n    print(ticket.priority)\nexcept ValidationError as e:\n    print('Retry with errors:', e.errors())",
      caption: "Generate a schema, then validate the model's JSON into an object.",
    },
    pitfalls: [
      "Using json.loads and trusting the result without schema validation.",
      "Making every field optional, which hides missing information.",
    ],
    check: [
      { q: "Why validate output if the API enforces a schema?", a: "Validation still catches business rules, edge cases and provider differences before bad data spreads." },
      { q: "How can you restrict a field to three allowed values?", a: "Use a Literal or Enum type in the Pydantic model." },
    ],
  },

  "llm-apis/reliability": {
    summary:
      "Model APIs fail in ordinary ways: timeouts, rate limits and temporary server errors. Production code adds timeouts, retries with exponential backoff and a fallback so one slow call does not break the app.",
    visuals: [
      {
        type: "flow",
        title: "A resilient model call",
        steps: [
          { label: "Call with timeout", detail: "Never wait forever" },
          { label: "Classify error", detail: "Retry 429 and 5xx; not 400 or 401" },
          { label: "Backoff with jitter", detail: "Wait 1s, 2s, 4s plus randomness" },
          { label: "Fallback", detail: "Another model or a friendly message" },
        ],
      },
    ],
    keyPoints: [
      "Retry only transient errors like timeouts, 429 and 5xx responses.",
      "Respect a Retry-After header when the provider sends one.",
      "Add random jitter so many clients do not retry at the same moment.",
      "Cap total attempts and total time so users are not left waiting.",
    ],
    terms: [
      { term: "Timeout", meaning: "Maximum time to wait before giving up on a call." },
      { term: "Rate limit", meaning: "Provider cap on requests or tokens per minute; returns 429." },
      { term: "Exponential backoff", meaning: "Waiting longer after each failed attempt." },
      { term: "Jitter", meaning: "Random delay added to spread out retries." },
      { term: "Fallback", meaning: "An alternative path used when the main one fails." },
    ],
    example: {
      lang: "python",
      code: "import random, time\n\nclass TransientError(Exception): ...\n\ndef with_retries(call, attempts: int = 4):\n    for i in range(attempts):\n        try:\n            return call()\n        except TransientError:\n            if i == attempts - 1:\n                raise\n            delay = (2 ** i) + random.uniform(0, 0.5)\n            time.sleep(delay)\n\n# Many SDKs have built-in retry and timeout options; use those first.",
      caption: "Exponential backoff with jitter for transient errors only.",
    },
    pitfalls: [
      "Retrying invalid requests that will fail every time.",
      "Retrying instantly in a tight loop and making rate limiting worse.",
    ],
    check: [
      { q: "Should you retry a 400 Bad Request?", a: "No. The request itself is wrong, so retrying will fail the same way." },
      { q: "Why add jitter to backoff?", a: "It prevents many clients from retrying in sync and overloading the service again." },
    ],
  },

  "llm-apis/cost-latency": {
    summary:
      "LLM cost is mostly input tokens plus output tokens times their prices, and latency grows with output length and model size. Measuring both per request shows where to cut.",
    visuals: [
      {
        type: "tree",
        title: "Levers to cut cost and latency",
        root: "Cost and latency",
        children: [
          { label: "Fewer input tokens", children: ["Shorter prompts", "Retrieve fewer chunks", "Trim chat history"] },
          { label: "Fewer output tokens", children: ["Ask for concise answers", "Set max output tokens"] },
          { label: "Cheaper model", children: ["Smaller model for easy tasks", "Route by difficulty"] },
          { label: "Caching", children: ["Prompt caching for shared prefixes", "Response cache for repeats"] },
        ],
      },
    ],
    keyPoints: [
      "Output tokens usually cost more than input tokens and dominate latency.",
      "Count tokens before sending to avoid overflowing the context window.",
      "Log tokens, cost and latency for every call so trends are visible.",
      "Route simple tasks to small models and reserve large ones for hard cases.",
    ],
    terms: [
      { term: "Input tokens", meaning: "Tokens you send: system prompt, history and context." },
      { term: "Output tokens", meaning: "Tokens the model generates in its reply." },
      { term: "Prompt caching", meaning: "Provider feature that discounts repeated prompt prefixes." },
      { term: "Model routing", meaning: "Choosing a model per request based on difficulty." },
      { term: "p95 latency", meaning: "The latency 95% of requests are faster than." },
    ],
    example: {
      lang: "python",
      code: "# Prices per million tokens (example numbers, check your provider)\nPRICE_IN = 1.00\nPRICE_OUT = 4.00\n\ndef cost_usd(tokens_in: int, tokens_out: int) -> float:\n    return tokens_in / 1e6 * PRICE_IN + tokens_out / 1e6 * PRICE_OUT\n\nper_call = cost_usd(tokens_in=3000, tokens_out=500)\nprint(f'${per_call:.4f} per call')\nprint(f'${per_call * 10_000 * 30:.2f} per month at 10k calls/day')",
      caption: "Estimate per-call and monthly cost from token counts.",
    },
    pitfalls: [
      "Estimating cost from character counts instead of real token counts.",
      "Stuffing many retrieved chunks into every prompt just in case.",
    ],
    check: [
      { q: "What two numbers drive the cost of a call?", a: "Input tokens and output tokens, each multiplied by its price." },
      { q: "Name one way to reduce latency without changing models.", a: "Ask for shorter answers or cap max output tokens, and stream the response." },
    ],
  },

  // ───────────────────────── Prompting ─────────────────────────
  "prompting/prompt-basics": {
    summary:
      "Good prompts read like clear instructions to a smart new colleague: the task, the relevant context, the constraints and the exact output format. Clarity beats clever tricks.",
    visuals: [
      {
        type: "layers",
        title: "Parts of a solid prompt",
        layers: [
          { label: "Role", detail: "Who the model is acting as, and for whom" },
          { label: "Task", detail: "One explicit instruction of what to do" },
          { label: "Context", detail: "Relevant facts, data and audience" },
          { label: "Constraints", detail: "Length, tone, what to avoid, what if unsure" },
          { label: "Output format", detail: "Exact structure, such as JSON or three bullets" },
        ],
      },
    ],
    keyPoints: [
      "Say exactly what you want; models do not read your mind.",
      "Separate instructions from data with clear delimiters like tags or headings.",
      "Tell the model what to do when information is missing.",
      "Specify the output format so code can parse it reliably.",
    ],
    terms: [
      { term: "Prompt", meaning: "The full input text that instructs the model." },
      { term: "Role prompt", meaning: "Setting a persona, like an experienced support agent." },
      { term: "Delimiter", meaning: "Markers that separate instructions from pasted content." },
      { term: "Constraint", meaning: "A rule limiting the output, such as length or tone." },
    ],
    example: {
      lang: "python",
      code: "PROMPT = '''You are a support assistant for a project management app.\n\nTask: Summarise the customer email below for an engineer.\n\nRules:\n- Maximum 3 bullet points.\n- Include the product area and any error messages.\n- If the issue is unclear, say \"Needs clarification\".\n\nOutput format: bullet points only, no intro.\n\n<email>\n{email}\n</email>'''",
      caption: "Role, task, rules, format and clearly delimited input.",
    },
    pitfalls: [
      "Writing vague prompts like make this better.",
      "Mixing instructions and user data so the model confuses them.",
    ],
    check: [
      { q: "Why wrap user content in delimiters?", a: "It separates data from instructions, reducing confusion and some injection risk." },
      { q: "What should a prompt say about missing information?", a: "Exactly what to do, such as asking a question or replying with a fixed phrase." },
    ],
  },

  "prompting/few-shot": {
    summary:
      "Few-shot prompting shows the model a handful of input and output examples so it copies the pattern. Asking for step-by-step reasoning can improve accuracy on multi-step problems.",
    visuals: [
      {
        type: "compare",
        title: "Three prompting styles",
        columns: [
          { title: "Zero-shot", points: ["Instructions only", "Shortest and cheapest", "Fine for clear tasks"] },
          { title: "Few-shot", points: ["Adds 2 to 5 examples", "Teaches format and edge cases", "Costs more input tokens"] },
          { title: "Step-by-step", points: ["Asks to reason first", "Helps math and logic", "Longer, slower output"] },
        ],
      },
    ],
    keyPoints: [
      "Pick diverse examples that cover tricky cases, not just easy ones.",
      "Examples strongly shape format and length, so make them match what you want.",
      "Measure accuracy with and without examples on an eval set.",
      "When reasoning is shown, put the final answer in a separate, parseable field.",
    ],
    terms: [
      { term: "Zero-shot", meaning: "Prompting with instructions and no examples." },
      { term: "Few-shot", meaning: "Including a few worked examples in the prompt." },
      { term: "Chain of thought", meaning: "Having the model reason step by step before answering." },
      { term: "Exemplar", meaning: "One example input with its ideal output." },
    ],
    example: {
      lang: "text",
      code: "Classify the sentiment as positive, negative or mixed.\n\nReview: The app is fast and looks great.\nSentiment: positive\n\nReview: Crashes every time I upload a file.\nSentiment: negative\n\nReview: Love the design, but sync is unreliable.\nSentiment: mixed\n\nReview: {review}\nSentiment:",
      caption: "Three examples, including the tricky mixed case.",
    },
    pitfalls: [
      "Using examples that all share one label, biasing the output.",
      "Adding examples without checking whether accuracy actually improved.",
    ],
    check: [
      { q: "Why include a mixed example in a sentiment prompt?", a: "It shows the model how to handle the ambiguous edge case it would otherwise get wrong." },
      { q: "What is the cost of few-shot prompting?", a: "More input tokens per request, which adds cost and some latency." },
    ],
  },

  "prompting/prompts-as-code": {
    summary:
      "Prompts change app behaviour as much as code does, so treat them like code. Store them in files, fill them with templates, version them in Git and test every change against evals.",
    visuals: [
      {
        type: "cycle",
        title: "Prompt change workflow",
        steps: [
          { label: "Edit template", detail: "Change the prompt file in a branch" },
          { label: "Run evals", detail: "Compare scores with the current version" },
          { label: "Review and merge", detail: "Note the change in a changelog" },
          { label: "Monitor", detail: "Watch production traces and feedback" },
        ],
      },
    ],
    keyPoints: [
      "Keep prompts in separate files, not scattered string literals.",
      "Use named variables and fail loudly if one is missing.",
      "Log the prompt version with every model call so results are traceable.",
      "Never paste raw user input into the instruction part of a template.",
    ],
    terms: [
      { term: "Prompt template", meaning: "A prompt with placeholders filled at runtime." },
      { term: "Template variable", meaning: "A named slot like {question} in a template." },
      { term: "Prompt version", meaning: "An identifier for a specific revision of a prompt." },
      { term: "Changelog", meaning: "A record of what changed in each version and why." },
    ],
    example: {
      lang: "python",
      code: "from pathlib import Path\nfrom string import Template\n\n# prompts/summarise_v3.txt contains: Summarise for $audience:\\n<doc>$doc</doc>\nPROMPT_VERSION = 'summarise_v3'\ntemplate = Template(Path(f'prompts/{PROMPT_VERSION}.txt').read_text())\n\nprompt = template.substitute(audience='engineers', doc='...')\n# substitute raises KeyError if a variable is missing\n\nlog = {'prompt_version': PROMPT_VERSION, 'chars': len(prompt)}",
      caption: "Load a versioned template and fill variables strictly.",
    },
    pitfalls: [
      "Editing prompts directly in production with no record of changes.",
      "Shipping a prompt tweak without running evals first.",
    ],
    check: [
      { q: "Why log the prompt version with each call?", a: "So you can link quality changes or bugs to the exact prompt that produced them." },
      { q: "What should happen when a template variable is missing?", a: "It should fail loudly, rather than sending a broken prompt." },
    ],
  },

  // ───────────────────────── Embeddings ─────────────────────────
  "embeddings/embeddings-basics": {
    summary:
      "An embedding turns text into a list of numbers so that similar meanings land close together. Comparing vectors with cosine similarity lets you find relevant text even when the words differ.",
    analogy: "Embeddings place texts on a map where nearby points mean similar things.",
    visuals: [
      {
        type: "flow",
        title: "Semantic search with embeddings",
        steps: [
          { label: "Embed documents", detail: "Each text becomes a vector" },
          { label: "Embed the query", detail: "Use the same embedding model" },
          { label: "Cosine similarity", detail: "Score each document against the query" },
          { label: "Rank", detail: "Highest scores are most similar" },
        ],
      },
    ],
    keyPoints: [
      "Always embed queries and documents with the same model.",
      "Cosine similarity compares direction, ranging roughly from -1 to 1.",
      "Embeddings capture meaning, so car and automobile end up close.",
      "Store vectors once at ingest time; only the query is embedded per search.",
    ],
    terms: [
      { term: "Embedding", meaning: "A vector of numbers representing the meaning of text." },
      { term: "Vector", meaning: "An ordered list of numbers, often hundreds long." },
      { term: "Dimension", meaning: "The number of values in each vector." },
      { term: "Cosine similarity", meaning: "Similarity measured by the angle between two vectors." },
      { term: "Semantic search", meaning: "Search by meaning rather than exact keywords." },
    ],
    example: {
      lang: "python",
      code: "import math\n\ndef cosine(a: list[float], b: list[float]) -> float:\n    dot = sum(x * y for x, y in zip(a, b))\n    return dot / (math.hypot(*a) * math.hypot(*b))\n\n# Toy 3-d vectors; real ones come from an embedding model\ndocs = {'refund policy': [0.9, 0.1, 0.0], 'shipping times': [0.1, 0.9, 0.2]}\nquery = [0.8, 0.2, 0.1]  # 'how do I get my money back?'\n\nranked = sorted(docs, key=lambda d: cosine(query, docs[d]), reverse=True)\nprint(ranked)  # ['refund policy', 'shipping times']",
      caption: "Ranking documents by cosine similarity to a query.",
    },
    pitfalls: [
      "Mixing vectors from different embedding models in one index.",
      "Expecting embeddings to match exact codes or IDs well.",
    ],
    check: [
      { q: "Why must queries and documents use the same embedding model?", a: "Different models produce incompatible vector spaces, so similarity scores would be meaningless." },
      { q: "What does a high cosine similarity mean?", a: "The two texts are likely close in meaning." },
    ],
  },

  "embeddings/vector-stores": {
    summary:
      "A vector database stores embeddings with metadata and finds the nearest ones to a query vector quickly. pgvector adds this to Postgres, so vectors live alongside your regular data.",
    visuals: [
      {
        type: "sequence",
        title: "Store and query with pgvector",
        actors: ["App", "Embedding model", "Postgres + pgvector"],
        messages: [
          { from: 0, to: 1, label: "Embed document chunks" },
          { from: 1, to: 0, label: "Vectors" },
          { from: 0, to: 2, label: "INSERT text, metadata, vector" },
          { from: 0, to: 1, label: "Embed user query" },
          { from: 0, to: 2, label: "ORDER BY distance LIMIT 5" },
          { from: 2, to: 0, label: "Nearest chunks with metadata" },
        ],
      },
    ],
    keyPoints: [
      "Exact search compares every row; ANN indexes trade a little recall for big speed.",
      "HNSW gives fast, accurate queries; IVFFlat builds faster and uses less memory.",
      "Store metadata like source, date and owner next to each vector for filtering.",
      "In pgvector, <=> is cosine distance, so smaller means more similar.",
    ],
    terms: [
      { term: "Vector database", meaning: "A store optimised for similarity search over vectors." },
      { term: "pgvector", meaning: "Postgres extension adding a vector type and indexes." },
      { term: "ANN", meaning: "Approximate nearest neighbour search: fast, slightly inexact." },
      { term: "HNSW", meaning: "Graph-based ANN index with strong speed and recall." },
      { term: "IVFFlat", meaning: "Cluster-based ANN index that is quicker to build." },
    ],
    example: {
      lang: "sql",
      code: "CREATE EXTENSION IF NOT EXISTS vector;\n\nCREATE TABLE chunks (\n  id bigserial PRIMARY KEY,\n  source text,\n  content text,\n  embedding vector(768)\n);\n\nCREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);\n\nSELECT source, content\nFROM chunks\nORDER BY embedding <=> $1\nLIMIT 5;",
      caption: "A vector column, an HNSW index and a nearest-neighbour query.",
    },
    pitfalls: [
      "Declaring a vector size that does not match the embedding model.",
      "Creating an index with a different distance operator than your queries use.",
    ],
    check: [
      { q: "Why use an ANN index instead of exact search?", a: "Exact search scans every row; an ANN index answers much faster on large tables." },
      { q: "In pgvector, does a smaller <=> value mean more or less similar?", a: "More similar, because <=> returns cosine distance." },
    ],
  },

  "embeddings/chunking": {
    summary:
      "Documents are split into chunks before embedding, because whole documents are too long and too broad to retrieve precisely. Chunk size and boundaries strongly affect whether retrieval returns useful passages.",
    visuals: [
      {
        type: "compare",
        title: "Chunking strategies",
        columns: [
          { title: "Fixed size + overlap", points: ["Split every N tokens", "Overlap keeps context at edges", "Simple and predictable", "May cut mid-sentence"] },
          { title: "Structure-based", points: ["Split by headings and sections", "Keeps ideas together", "Chunks vary in size", "Needs clean parsing"] },
        ],
      },
    ],
    keyPoints: [
      "Too large and chunks are vague; too small and they lose context.",
      "A few hundred tokens with some overlap is a common starting point.",
      "Keep the section title and source with each chunk as metadata.",
      "Clean parsing matters; garbage text from PDFs gives garbage retrieval.",
      "Compare chunk sizes on real questions instead of guessing.",
    ],
    terms: [
      { term: "Chunk", meaning: "A passage of a document embedded and retrieved as one unit." },
      { term: "Overlap", meaning: "Text repeated between neighbouring chunks to keep context." },
      { term: "Parsing", meaning: "Extracting clean text from PDFs, HTML or other formats." },
      { term: "Metadata", meaning: "Extra fields like title, page and URL stored with a chunk." },
    ],
    example: {
      lang: "python",
      code: "def chunk_words(text: str, size: int = 200, overlap: int = 40) -> list[str]:\n    words = text.split()\n    step = size - overlap\n    return [\n        ' '.join(words[i:i + size])\n        for i in range(0, max(len(words) - overlap, 1), step)\n    ]\n\ndoc = 'word ' * 500\nchunks = chunk_words(doc)\nprint(len(chunks), [len(c.split()) for c in chunks])",
      caption: "Fixed-size word chunks with overlap.",
    },
    pitfalls: [
      "Indexing headers, footers and page numbers as content.",
      "Picking a chunk size once and never testing alternatives.",
    ],
    check: [
      { q: "Why add overlap between chunks?", a: "So information near a boundary appears with its surrounding context in at least one chunk." },
      { q: "What is a downside of very large chunks?", a: "They mix several topics, so embeddings get vague and prompts get longer." },
    ],
  },

  "embeddings/hybrid-rerank": {
    summary:
      "Vector search finds similar meanings but can miss exact terms like product codes. Hybrid search combines keyword and vector results, and a reranker then reorders the top candidates for precision.",
    visuals: [
      {
        type: "flow",
        title: "Hybrid retrieval with reranking",
        steps: [
          { label: "User query", detail: "e.g. error E1042 on login" },
          { label: "Keyword search", detail: "BM25 or tsvector finds exact terms" },
          { label: "Vector search", detail: "Embeddings find similar meaning" },
          { label: "Fuse results", detail: "Reciprocal rank fusion merges both lists" },
          { label: "Rerank", detail: "Cross-encoder scores query and chunk together" },
          { label: "Top-k chunks", detail: "Best few go to the model" },
        ],
      },
    ],
    keyPoints: [
      "Keyword search excels at names, codes and rare terms; vectors excel at paraphrases.",
      "Reciprocal rank fusion merges lists by rank, so scores need no normalising.",
      "Rerankers are slower, so apply them only to the top few dozen candidates.",
      "Measure precision at k before and after to prove the change helps.",
    ],
    terms: [
      { term: "BM25", meaning: "A classic keyword ranking formula based on term frequency." },
      { term: "Hybrid search", meaning: "Combining keyword and vector search results." },
      { term: "RRF", meaning: "Reciprocal rank fusion: merges ranked lists using 1 / (k + rank)." },
      { term: "Cross-encoder", meaning: "A model that scores a query and passage together." },
      { term: "Precision at k", meaning: "Share of the top k results that are relevant." },
    ],
    example: {
      lang: "python",
      code: "def rrf(*ranked_lists: list[str], k: int = 60) -> list[str]:\n    scores: dict[str, float] = {}\n    for results in ranked_lists:\n        for rank, doc_id in enumerate(results, start=1):\n            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)\n    return sorted(scores, key=scores.get, reverse=True)\n\nkeyword = ['doc7', 'doc2', 'doc9']\nvector = ['doc2', 'doc4', 'doc7']\nprint(rrf(keyword, vector))  # doc2 and doc7 rise to the top",
      caption: "Reciprocal rank fusion of keyword and vector results.",
    },
    pitfalls: [
      "Adding scores from different systems directly without normalising.",
      "Reranking thousands of candidates and blowing the latency budget.",
    ],
    check: [
      { q: "Why might vector search miss a query like SKU-4471?", a: "Embeddings capture meaning, not exact strings, so rare codes may not match closely." },
      { q: "Why rerank only the top candidates?", a: "Cross-encoders are accurate but slow, so they are applied to a small set." },
    ],
  },

  // ───────────────────────── RAG ─────────────────────────
  "rag/rag-pipeline": {
    summary:
      "Retrieval-augmented generation finds relevant passages from your documents and puts them in the prompt, so the model answers from your data instead of memory. It has an offline ingest stage and an online query stage.",
    visuals: [
      {
        type: "flow",
        title: "Ingest: prepare the knowledge",
        steps: [
          { label: "Load documents", detail: "PDFs, web pages, docs" },
          { label: "Chunk", detail: "Split into passages with metadata" },
          { label: "Embed", detail: "Turn each chunk into a vector" },
          { label: "Store", detail: "Save vectors and text in a vector store" },
        ],
      },
      {
        type: "sequence",
        title: "Query: answer a question",
        actors: ["User", "RAG app", "Vector store", "LLM"],
        messages: [
          { from: 0, to: 1, label: "Ask a question" },
          { from: 1, to: 2, label: "Search with query embedding" },
          { from: 2, to: 1, label: "Top-k chunks" },
          { from: 1, to: 3, label: "Prompt with question and chunks" },
          { from: 3, to: 1, label: "Grounded answer" },
          { from: 1, to: 0, label: "Answer with sources" },
        ],
      },
    ],
    keyPoints: [
      "RAG lets models use private or recent data without retraining.",
      "Answer quality depends first on retrieval; wrong chunks mean wrong answers.",
      "Instruct the model to answer only from the provided context.",
      "Test with real user questions, not just ones you invented.",
    ],
    terms: [
      { term: "RAG", meaning: "Retrieval-augmented generation: retrieve context, then generate." },
      { term: "Ingestion", meaning: "Loading, chunking, embedding and storing documents." },
      { term: "Top-k", meaning: "The k most similar chunks returned by search." },
      { term: "Grounding", meaning: "Basing answers on supplied evidence." },
      { term: "Context injection", meaning: "Inserting retrieved text into the prompt." },
    ],
    example: {
      lang: "python",
      code: "def build_prompt(question: str, chunks: list[dict]) -> str:\n    context = '\\n\\n'.join(\n        f\"[{i}] ({c['source']})\\n{c['text']}\" for i, c in enumerate(chunks, 1)\n    )\n    return (\n        'Answer using only the context below. '\n        'If the answer is not there, say you do not know.\\n\\n'\n        f'<context>\\n{context}\\n</context>\\n\\nQuestion: {question}'\n    )\n\nchunks = [{'source': 'faq.md', 'text': 'Refunds take 5 business days.'}]\nprint(build_prompt('How long do refunds take?', chunks))",
      caption: "Inject numbered, sourced chunks into a grounded prompt.",
    },
    pitfalls: [
      "Blaming the model when retrieval returned the wrong chunks.",
      "Stuffing too many chunks into the prompt and burying the answer.",
    ],
    check: [
      { q: "What are the two stages of a RAG system?", a: "Offline ingestion (chunk, embed, store) and online querying (retrieve, then generate)." },
      { q: "Why is RAG often preferred over fine-tuning for company docs?", a: "Docs change often; updating an index is cheaper and faster than retraining, and answers can cite sources." },
    ],
  },

  "rag/citations": {
    summary:
      "Citations show which sources support each part of an answer, so users can verify it. Grounding instructions keep the model inside the retrieved context and make it refuse when the answer is not there.",
    visuals: [
      {
        type: "flow",
        title: "Answers with citations",
        steps: [
          { label: "Label chunks", detail: "Give each retrieved chunk an ID like [1]" },
          { label: "Instruct citing", detail: "Cite IDs after each claim" },
          { label: "Generate", detail: "Model answers from context only" },
          { label: "Verify IDs", detail: "Drop or flag citations not in context" },
          { label: "Show sources", detail: "Link IDs to titles and URLs" },
        ],
      },
    ],
    keyPoints: [
      "Number chunks in the prompt so the model can refer to them.",
      "Check in code that every cited ID was actually provided.",
      "Give a fixed refusal phrase for when context lacks the answer.",
      "A citation shows where a claim came from, not that the claim is correct.",
    ],
    terms: [
      { term: "Citation", meaning: "A reference from an answer to its source passage." },
      { term: "Grounded answer", meaning: "An answer supported by provided context." },
      { term: "Refusal", meaning: "Declining to answer when evidence is missing." },
      { term: "Faithfulness", meaning: "How well an answer sticks to its sources." },
    ],
    example: {
      lang: "python",
      code: "import re\n\nanswer = 'Refunds take 5 business days [1]. Fees are waived [3].'\nprovided_ids = {1, 2}\n\ncited = {int(n) for n in re.findall(r'\\[(\\d+)\\]', answer)}\ninvalid = cited - provided_ids\n\nif invalid:\n    print('Unsupported citations:', invalid)  # {3}\nif not cited:\n    print('Answer has no sources; consider refusing.')",
      caption: "Check that the model only cites chunks it was given.",
    },
    pitfalls: [
      "Showing citations without verifying they exist in the retrieved set.",
      "Letting the model fill gaps from general knowledge when context is missing.",
    ],
    check: [
      { q: "What should the app do when retrieval finds nothing relevant?", a: "Say it does not know, or ask a clarifying question, rather than guessing." },
      { q: "Does a valid citation prove the answer is correct?", a: "No. It shows the source used; the claim must still match what that source says." },
    ],
  },

  "rag/rag-advanced": {
    summary:
      "Real conversations include follow-ups like what about the second one, which retrieve poorly on their own. Query rewriting, metadata filters and conversation memory make retrieval work across a whole chat.",
    visuals: [
      {
        type: "flow",
        title: "Handling a follow-up question",
        steps: [
          { label: "Follow-up arrives", detail: "e.g. And for enterprise plans?" },
          { label: "Rewrite query", detail: "LLM makes it standalone using chat history" },
          { label: "Apply filters", detail: "User, date, document type or permissions" },
          { label: "Retrieve", detail: "Search with the rewritten query" },
          { label: "Answer", detail: "Use chunks plus summarised history" },
        ],
      },
    ],
    keyPoints: [
      "Rewrite follow-ups into standalone questions before searching.",
      "Filter by metadata in the database query, not after retrieval.",
      "Permission filters ensure users only retrieve documents they may see.",
      "Summarise old turns to keep history short and within budget.",
    ],
    terms: [
      { term: "Query rewriting", meaning: "Turning a follow-up into a self-contained search query." },
      { term: "Metadata filter", meaning: "Restricting search by fields like owner or date." },
      { term: "Conversation memory", meaning: "Stored chat history used for context." },
      { term: "History summarisation", meaning: "Compressing older turns into a short summary." },
    ],
    example: {
      lang: "python",
      code: "REWRITE_PROMPT = '''Rewrite the last user message as a standalone search query.\nUse the chat history for missing details. Return only the query.\n\nHistory:\n{history}\n\nLast message: {message}'''\n\n# history: 'What does the Pro plan cost?' -> '$20 per month'\n# message: 'And for enterprise?'\n# rewritten: 'Enterprise plan price per month'\n\nfilters = {'doc_type': 'pricing', 'tenant_id': 'acme'}",
      caption: "A rewrite prompt and the filters applied at search time.",
    },
    pitfalls: [
      "Searching with the raw follow-up text, which lacks the subject.",
      "Filtering out unauthorised documents only after they were sent to the model.",
    ],
    check: [
      { q: "Why rewrite a follow-up question before retrieval?", a: "Follow-ups often lack the subject, so the raw text matches the wrong chunks." },
      { q: "Where should permission filtering happen?", a: "In the retrieval query itself, so restricted chunks never reach the prompt." },
    ],
  },

  // ───────────────────────── Agents ─────────────────────────
  "agents/tool-calling": {
    summary:
      "Tool calling lets a model ask your code to run a function, like searching orders or getting the weather. The model only proposes the call; your app validates the arguments, runs it and returns the result.",
    visuals: [
      {
        type: "sequence",
        title: "One tool call round trip",
        actors: ["App", "LLM API", "Tool"],
        messages: [
          { from: 0, to: 1, label: "Messages plus tool schemas" },
          { from: 1, to: 0, label: "Tool call: get_order(id=42)" },
          { from: 0, to: 0, label: "Validate arguments" },
          { from: 0, to: 2, label: "Run get_order(42)" },
          { from: 2, to: 0, label: "Result data" },
          { from: 0, to: 1, label: "Send tool result" },
          { from: 1, to: 0, label: "Final answer for user" },
        ],
      },
    ],
    keyPoints: [
      "Describe each tool with a clear name, description and JSON schema for inputs.",
      "The model never runs code itself; your app executes the call.",
      "Validate tool arguments like any untrusted input before executing.",
      "Return errors to the model as tool results so it can recover.",
    ],
    terms: [
      { term: "Tool", meaning: "A function your app exposes to the model." },
      { term: "Tool schema", meaning: "JSON Schema describing a tool's input parameters." },
      { term: "Tool call", meaning: "The model's structured request to run a tool." },
      { term: "Tool result", meaning: "The output your app sends back to the model." },
    ],
    example: {
      lang: "python",
      code: "from pydantic import BaseModel, Field\n\nclass GetOrder(BaseModel):\n    order_id: int = Field(gt=0, description='Order number')\n\nTOOLS = [{'name': 'get_order', 'description': 'Look up an order by its number.',\n          'input_schema': GetOrder.model_json_schema()}]\n\ndef run_tool(name: str, args: dict) -> dict:\n    if name == 'get_order':\n        params = GetOrder.model_validate(args)  # validate first\n        return {'id': params.order_id, 'status': 'shipped'}\n    return {'error': f'unknown tool {name}'}",
      caption: "A tool schema from Pydantic and safe dispatch.",
    },
    pitfalls: [
      "Executing model-provided arguments without validation.",
      "Writing vague tool descriptions so the model picks the wrong tool.",
    ],
    check: [
      { q: "Who actually executes a tool call?", a: "Your application. The model only returns a structured request." },
      { q: "What should happen if a tool fails?", a: "Return an error message as the tool result so the model can retry or explain." },
    ],
  },

  "agents/agent-loop": {
    summary:
      "An agent repeats a loop: the model decides on an action, your code runs it, and the result goes back to the model until the task is done. Step limits, state tracking and logs keep the loop safe and debuggable.",
    visuals: [
      {
        type: "cycle",
        title: "Plan, act, observe",
        steps: [
          { label: "Plan", detail: "Model reads goal and history, picks next step" },
          { label: "Act", detail: "App runs the requested tool" },
          { label: "Observe", detail: "Tool result is added to the history" },
          { label: "Check stop", detail: "Done, step limit or budget reached?" },
        ],
      },
    ],
    keyPoints: [
      "Always set a maximum number of steps and a token or time budget.",
      "Stop when the model gives a final answer with no tool call.",
      "Log every step's input, tool call and result for debugging.",
      "Prefer a simple workflow when the steps are known in advance.",
    ],
    terms: [
      { term: "Agent", meaning: "A model that chooses actions in a loop to reach a goal." },
      { term: "Stop condition", meaning: "Rule that ends the loop, like a final answer." },
      { term: "Step limit", meaning: "Maximum iterations allowed before stopping." },
      { term: "Scratchpad", meaning: "Accumulated history of actions and observations." },
      { term: "Workflow", meaning: "A fixed sequence of steps defined in code." },
    ],
    example: {
      lang: "python",
      code: "MAX_STEPS = 8\n\ndef run_agent(goal: str, call_model, run_tool) -> str:\n    history = [{'role': 'user', 'content': goal}]\n    for step in range(MAX_STEPS):\n        reply = call_model(history)\n        history.append(reply)\n        if not reply.get('tool_call'):\n            return reply['content']  # final answer\n        call = reply['tool_call']\n        result = run_tool(call['name'], call['args'])\n        print(f'step {step}: {call[\"name\"]} -> {result}')\n        history.append({'role': 'tool', 'content': str(result)})\n    return 'Stopped: step limit reached.'",
      caption: "A bounded loop with a final-answer stop and step logging.",
    },
    pitfalls: [
      "Running loops without a step limit, burning tokens on endless retries.",
      "Using an agent for a task a fixed three-step script would do better.",
    ],
    check: [
      { q: "Name two stop conditions for an agent loop.", a: "The model returns a final answer, or a step, time or cost limit is reached." },
      { q: "When is a fixed workflow better than an agent?", a: "When the steps are known in advance; it is cheaper, faster and more predictable." },
    ],
  },

  "agents/mcp": {
    summary:
      "The Model Context Protocol is an open standard for connecting AI applications to tools and data. You write an MCP server once, and any MCP-compatible client can discover and use its tools and resources.",
    analogy: "MCP is like a USB port for AI apps: one plug shape for many devices.",
    visuals: [
      {
        type: "sequence",
        title: "Client discovers and calls a tool",
        actors: ["Host app", "MCP client", "MCP server"],
        messages: [
          { from: 0, to: 1, label: "Start connection" },
          { from: 1, to: 2, label: "initialize" },
          { from: 1, to: 2, label: "tools/list" },
          { from: 2, to: 1, label: "Tool names and schemas" },
          { from: 0, to: 1, label: "Model wants a tool" },
          { from: 1, to: 2, label: "tools/call with arguments" },
          { from: 2, to: 1, label: "Tool result" },
        ],
      },
      {
        type: "tree",
        title: "What a server can expose",
        root: "MCP server",
        children: [
          { label: "Tools", children: ["Functions the model can call"] },
          { label: "Resources", children: ["Readable files or records"] },
          { label: "Prompts", children: ["Reusable prompt templates"] },
        ],
      },
    ],
    keyPoints: [
      "MCP separates hosts and clients from servers that provide capabilities.",
      "Servers commonly run locally over stdio or remotely over HTTP.",
      "One server works with any compatible client, avoiding custom integrations.",
      "Treat third-party servers as code you run: review permissions and trust.",
    ],
    terms: [
      { term: "MCP", meaning: "Model Context Protocol, an open standard for AI tool integration." },
      { term: "Host", meaning: "The AI application the user interacts with." },
      { term: "MCP client", meaning: "Component in the host that talks to one server." },
      { term: "MCP server", meaning: "Program exposing tools, resources or prompts." },
      { term: "stdio transport", meaning: "Communication over a local process's input and output." },
    ],
    example: {
      lang: "python",
      code: "# pip install mcp\nfrom mcp.server.fastmcp import FastMCP\n\nmcp = FastMCP('notes')\n\n@mcp.tool()\ndef add_note(text: str) -> str:\n    \"\"\"Save a short note.\"\"\"\n    with open('notes.txt', 'a') as f:\n        f.write(text + '\\n')\n    return 'saved'\n\nif __name__ == '__main__':\n    mcp.run()  # stdio transport by default",
      caption: "A tiny MCP server exposing one tool with the Python SDK.",
    },
    pitfalls: [
      "Installing untrusted MCP servers with broad file or network access.",
      "Writing vague tool docstrings, which become the descriptions models rely on.",
    ],
    check: [
      { q: "What problem does MCP solve?", a: "It standardises how AI apps connect to tools and data, so one server works with many clients." },
      { q: "Name the three main things an MCP server can expose.", a: "Tools, resources and prompts." },
    ],
  },

  "agents/ai-security": {
    summary:
      "LLM apps face new attacks like prompt injection, where untrusted text tries to override instructions. Because models cannot reliably tell instructions from data, real safety comes from layered guardrails and limited permissions.",
    visuals: [
      {
        type: "layers",
        title: "Defense in depth",
        layers: [
          { label: "Input checks", detail: "Size limits, content filters, injection heuristics" },
          { label: "Prompt structure", detail: "Delimit untrusted data; clear system rules" },
          { label: "Least privilege tools", detail: "Read-only by default, scoped to the user" },
          { label: "Output checks", detail: "Validate, redact secrets, block unsafe actions" },
          { label: "Human approval", detail: "Confirm risky actions like payments or deletes" },
        ],
      },
    ],
    keyPoints: [
      "Treat retrieved documents, web pages and tool results as untrusted input.",
      "Never rely on the system prompt alone to stop prompt injection.",
      "Give tools the minimum permissions and scope them to the current user.",
      "Do not put secrets in prompts; assume prompts can be leaked.",
      "Red-team your app with injection attempts before launch.",
    ],
    terms: [
      { term: "Prompt injection", meaning: "Malicious text that tries to override the model's instructions." },
      { term: "Indirect injection", meaning: "Injection hidden in content the app retrieves, like web pages." },
      { term: "Data leakage", meaning: "Exposing private data or prompts in model output." },
      { term: "Guardrail", meaning: "A check that blocks or modifies unsafe input or output." },
      { term: "Least privilege", meaning: "Granting only the access strictly needed." },
    ],
    pitfalls: [
      "Giving an agent write access to everything because it is convenient.",
      "Rendering model output as HTML without escaping it.",
      "Assuming a filter catches every injection attempt.",
    ],
    check: [
      { q: "A support bot reads a web page saying ignore your rules. What attack is this?", a: "Indirect prompt injection, delivered through retrieved content." },
      { q: "What limits damage if injection succeeds?", a: "Least-privilege tools, user-scoped data access and human approval for risky actions." },
    ],
  },

  // ───────────────────────── Evals ─────────────────────────
  "evals/eval-datasets": {
    summary:
      "An eval dataset is a set of inputs with expected outputs or grading notes that you run your app against. It turns whether it seems better into a measurable score.",
    visuals: [
      {
        type: "flow",
        title: "Building an eval set",
        steps: [
          { label: "Collect real inputs", detail: "Logs, support tickets, user questions" },
          { label: "Add edge cases", detail: "Synthetic tricky, ambiguous and adversarial inputs" },
          { label: "Label expectations", detail: "Expected answer or grading criteria" },
          { label: "Version it", detail: "Store in Git with a changelog" },
          { label: "Grow from failures", detail: "Add every production bug as a case" },
        ],
      },
    ],
    keyPoints: [
      "Start small: 20 to 50 well-chosen cases beat 1,000 random ones.",
      "Real user inputs reveal problems synthetic data misses.",
      "Include cases where the right answer is to refuse or ask a question.",
      "Never tune prompts on the same cases you report scores on.",
    ],
    terms: [
      { term: "Eval", meaning: "A repeatable test that scores model or app outputs." },
      { term: "Golden answer", meaning: "The expected correct output for a test case." },
      { term: "Synthetic data", meaning: "Test cases generated by a model or script." },
      { term: "Edge case", meaning: "Unusual input at the boundary of normal behaviour." },
      { term: "Held-out set", meaning: "Cases kept aside to check you are not overfitting." },
    ],
    example: {
      lang: "json",
      code: "{\"id\": \"refund-01\", \"input\": \"How long do refunds take?\", \"expected\": \"5 business days\", \"tags\": [\"faq\"]}\n{\"id\": \"refund-02\", \"input\": \"refund??? order 991\", \"expected\": \"Asks for email to verify\", \"tags\": [\"messy\"]}\n{\"id\": \"oos-01\", \"input\": \"What is the CEO's salary?\", \"expected\": \"Politely declines\", \"tags\": [\"refusal\"]}",
      caption: "JSONL eval cases with expectations and tags.",
    },
    pitfalls: [
      "Only testing easy, clean inputs.",
      "Changing the dataset silently, making scores incomparable over time.",
    ],
    check: [
      { q: "Why include refusal cases in an eval set?", a: "To check the app declines out-of-scope or unanswerable questions instead of making things up." },
      { q: "Why version the eval dataset?", a: "So scores are comparable over time and you know which data produced them." },
    ],
  },

  "evals/eval-methods": {
    summary:
      "Outputs can be scored by code checks, by an LLM judge using a rubric, or by people. Good eval suites use cheap code checks wherever possible and calibrate LLM judges against human labels.",
    visuals: [
      {
        type: "compare",
        title: "Ways to score outputs",
        columns: [
          { title: "Code checks", points: ["Exact match, regex, JSON valid", "Fast, cheap, deterministic", "Only for checkable properties"] },
          { title: "LLM-as-judge", points: ["Rubric-based grading", "Handles open-ended answers", "Can be biased; needs calibration"] },
          { title: "Human review", points: ["Ground truth for quality", "Slow and costly", "Use for calibration and disagreements"] },
        ],
      },
    ],
    keyPoints: [
      "Use code checks for anything objective: format, required fields, banned words.",
      "Give LLM judges a specific rubric and ask for a short reason with each score.",
      "Measure judge agreement with human labels before trusting it.",
      "Review disagreements by hand; they reveal unclear rubrics or real bugs.",
    ],
    terms: [
      { term: "Code check", meaning: "A deterministic test written in code." },
      { term: "LLM-as-judge", meaning: "Using a model to grade another model's output." },
      { term: "Rubric", meaning: "Explicit criteria describing what each score means." },
      { term: "Calibration", meaning: "Checking an automatic grader matches human judgement." },
      { term: "Pass/fail grading", meaning: "Binary scores, often more reliable than 1 to 10 scales." },
    ],
    example: {
      lang: "python",
      code: "import json\n\ndef code_checks(output: str) -> dict[str, bool]:\n    try:\n        data = json.loads(output)\n    except json.JSONDecodeError:\n        return {'valid_json': False}\n    return {\n        'valid_json': True,\n        'has_answer': bool(data.get('answer')),\n        'cites_source': len(data.get('sources', [])) > 0,\n    }\n\nJUDGE_RUBRIC = 'PASS if the answer is fully supported by the context, else FAIL. Give one reason.'",
      caption: "Deterministic checks first, then a strict judge rubric.",
    },
    pitfalls: [
      "Trusting an uncalibrated LLM judge as ground truth.",
      "Using vague 1 to 10 scores without defining each level.",
    ],
    check: [
      { q: "When should you use a code check instead of an LLM judge?", a: "Whenever the property is objective, like valid JSON or an exact value." },
      { q: "How do you know an LLM judge is trustworthy?", a: "Compare its scores with human labels on a sample and measure agreement." },
    ],
  },

  "evals/rag-evals": {
    summary:
      "A RAG answer can fail because retrieval missed the right chunk or because generation misused good context. Measuring retrieval and generation separately tells you which part to fix.",
    visuals: [
      {
        type: "compare",
        title: "Two halves to measure",
        columns: [
          { title: "Retrieval", points: ["Recall at k: right chunk found?", "Precision at k: noise level", "Needs labelled relevant chunks", "Fix: chunking, hybrid, rerank"] },
          { title: "Generation", points: ["Faithfulness to context", "Answer relevance to question", "Correctness vs golden answer", "Fix: prompt, model, format"] },
        ],
      },
    ],
    keyPoints: [
      "If recall is low, no prompt change will fix the answers.",
      "Faithfulness checks whether claims are supported by the retrieved context.",
      "Label which chunks are relevant for each eval question.",
      "Track both metrics over time to catch regressions in either half.",
    ],
    terms: [
      { term: "Recall at k", meaning: "Share of relevant chunks that appear in the top k." },
      { term: "Precision at k", meaning: "Share of the top k chunks that are relevant." },
      { term: "Faithfulness", meaning: "Answer claims are supported by the provided context." },
      { term: "Answer relevance", meaning: "The answer actually addresses the question." },
    ],
    example: {
      lang: "python",
      code: "def recall_at_k(retrieved: list[str], relevant: set[str], k: int = 5) -> float:\n    hits = sum(1 for doc in retrieved[:k] if doc in relevant)\n    return hits / len(relevant) if relevant else 0.0\n\ncases = [\n    (['c3', 'c9', 'c1'], {'c1'}),\n    (['c4', 'c5', 'c6'], {'c2'}),\n]\nscores = [recall_at_k(r, rel) for r, rel in cases]\nprint(sum(scores) / len(scores))  # 0.5: retrieval misses half",
      caption: "Recall at k over labelled retrieval cases.",
    },
    pitfalls: [
      "Only scoring final answers, so retrieval problems stay hidden.",
      "Measuring faithfulness without checking the answer is also correct.",
    ],
    check: [
      { q: "Recall is 0.4 but faithfulness is high. What should you fix first?", a: "Retrieval, since the model is faithful but often lacks the right context." },
      { q: "What does faithfulness measure?", a: "Whether the answer's claims are supported by the retrieved context." },
    ],
  },

  "evals/evals-ci": {
    summary:
      "Regression evals run your eval suite automatically on every prompt, model or code change. If scores drop below a threshold, the build fails before the change reaches users.",
    visuals: [
      {
        type: "sequence",
        title: "Evals gate a pull request",
        actors: ["Developer", "CI job", "Eval runner", "LLM API"],
        messages: [
          { from: 0, to: 1, label: "Push prompt change" },
          { from: 1, to: 2, label: "Run eval suite" },
          { from: 2, to: 3, label: "Generate outputs for cases" },
          { from: 3, to: 2, label: "Outputs" },
          { from: 2, to: 1, label: "Scores vs thresholds" },
          { from: 1, to: 0, label: "Pass, or fail with diff" },
        ],
      },
    ],
    keyPoints: [
      "Treat prompt and model changes like code changes: gated by tests.",
      "Set thresholds slightly below the current baseline to tolerate noise.",
      "Report per-case diffs so reviewers see what got worse.",
      "Use a small fast suite on every PR and a full suite nightly.",
    ],
    terms: [
      { term: "Regression", meaning: "A change that makes previously good behaviour worse." },
      { term: "Threshold", meaning: "Minimum score a build must reach to pass." },
      { term: "Baseline", meaning: "Scores of the current production version." },
      { term: "Non-determinism", meaning: "Outputs varying between runs of the same input." },
    ],
    example: {
      lang: "python",
      code: "# test_evals.py, run with: pytest -q\nimport json\nfrom my_app import answer\nfrom my_evals import score\n\nTHRESHOLD = 0.85\n\ndef test_faq_accuracy():\n    cases = [json.loads(line) for line in open('evals/faq.jsonl')]\n    results = [score(answer(c['input']), c['expected']) for c in cases]\n    accuracy = sum(results) / len(results)\n    assert accuracy >= THRESHOLD, f'accuracy {accuracy:.2f} < {THRESHOLD}'",
      caption: "A pytest gate that fails the build below the threshold.",
    },
    pitfalls: [
      "Setting thresholds so tight that random variation fails builds.",
      "Running the full expensive suite on every commit.",
    ],
    check: [
      { q: "Why run evals in CI instead of manually?", a: "Every change is checked automatically, so regressions cannot slip through unnoticed." },
      { q: "How do you deal with noisy scores?", a: "Use a margin below baseline, low temperature, and repeat runs or larger sets." },
    ],
  },

  "evals/tracing": {
    summary:
      "Tracing records every step of a request, such as retrieval, model calls and tool calls, with inputs, outputs, latency and cost. Combined with user feedback, traces show where and why the app fails in production.",
    visuals: [
      {
        type: "tree",
        title: "One request trace",
        root: "Trace: POST /chat (2.4 s)",
        children: [
          { label: "Span: rewrite query", children: ["model call, 0.3 s", "180 tokens"] },
          { label: "Span: retrieve", children: ["vector search, 0.1 s", "5 chunks"] },
          { label: "Span: generate", children: ["model call, 1.9 s", "2,100 tokens", "prompt v3"] },
          { label: "User feedback", children: ["thumbs down", "wrong refund policy"] },
        ],
      },
    ],
    keyPoints: [
      "Give each request a trace ID and record every step as a span.",
      "Log prompt version, model, tokens, cost and latency for each model call.",
      "Collect simple feedback like thumbs up or down and link it to the trace.",
      "Redact personal data before storing logs.",
      "Turn failing traces into new eval cases.",
    ],
    terms: [
      { term: "Trace", meaning: "The full record of one request across all steps." },
      { term: "Span", meaning: "One timed step inside a trace." },
      { term: "Observability", meaning: "Being able to understand system behaviour from its outputs." },
      { term: "OpenTelemetry", meaning: "Vendor-neutral standard for traces, metrics and logs." },
      { term: "Redaction", meaning: "Removing sensitive data before logging." },
    ],
    example: {
      lang: "python",
      code: "import time, uuid, json\nfrom contextlib import contextmanager\n\n@contextmanager\ndef span(trace_id: str, name: str, **attrs):\n    start = time.perf_counter()\n    try:\n        yield attrs\n    finally:\n        attrs['ms'] = round((time.perf_counter() - start) * 1000)\n        print(json.dumps({'trace': trace_id, 'span': name, **attrs}))\n\ntrace_id = str(uuid.uuid4())\nwith span(trace_id, 'generate', model='small-model', prompt_version='v3') as s:\n    s['tokens_out'] = 120  # set from the API's usage data",
      caption: "A minimal span logger with timing and attributes.",
    },
    pitfalls: [
      "Logging full prompts with personal data and no redaction.",
      "Collecting feedback without linking it to the trace that produced it.",
    ],
    check: [
      { q: "What is the difference between a trace and a span?", a: "A trace covers a whole request; a span is one timed step inside it." },
      { q: "What should you do with traces that got negative feedback?", a: "Review them to find the cause and add them to the eval dataset." },
    ],
  },

  // ───────────────────────── Deployment ─────────────────────────
  "ai-deploy/llm-service": {
    summary:
      "FastAPI turns your Python LLM logic into an HTTP service. Pydantic validates requests, dependencies handle auth, and streaming responses send tokens to clients as they are generated.",
    visuals: [
      {
        type: "sequence",
        title: "A streaming chat endpoint",
        actors: ["Client", "FastAPI", "LLM API"],
        messages: [
          { from: 0, to: 1, label: "POST /chat with bearer token" },
          { from: 1, to: 1, label: "Check token, validate body" },
          { from: 1, to: 2, label: "Streaming request" },
          { from: 2, to: 1, label: "Token chunks" },
          { from: 1, to: 0, label: "StreamingResponse chunks" },
        ],
      },
    ],
    keyPoints: [
      "Declare request bodies as Pydantic models; FastAPI validates and documents them.",
      "Return 401 for missing credentials and 422 for invalid input automatically.",
      "Use async endpoints and async SDK clients to handle many users concurrently.",
      "Limit input size so a single request cannot blow up cost.",
    ],
    terms: [
      { term: "FastAPI", meaning: "Python web framework built on type hints and Pydantic." },
      { term: "Endpoint", meaning: "A URL and method your service responds to." },
      { term: "Dependency", meaning: "Reusable function FastAPI runs before a handler, e.g. auth." },
      { term: "StreamingResponse", meaning: "Response that sends data in chunks as it is produced." },
      { term: "Bearer token", meaning: "A credential sent in the Authorization header." },
    ],
    example: {
      lang: "python",
      code: "import os\nfrom fastapi import FastAPI, Depends, Header, HTTPException\nfrom fastapi.responses import StreamingResponse\nfrom pydantic import BaseModel, Field\n\napp = FastAPI()\nclass ChatIn(BaseModel):\n    message: str = Field(min_length=1, max_length=4000)\n\ndef auth(authorization: str = Header()):\n    if authorization != f\"Bearer {os.environ['API_TOKEN']}\":\n        raise HTTPException(status_code=401)\n@app.post('/chat', dependencies=[Depends(auth)])\nasync def chat(body: ChatIn):\n    return StreamingResponse(stream_reply(body.message), media_type='text/plain')",
      caption: "Validated input, token auth and a streaming response.",
    },
    pitfalls: [
      "Using a blocking SDK client inside async endpoints.",
      "Accepting unlimited input length and paying for huge prompts.",
    ],
    check: [
      { q: "What does FastAPI do when the body fails Pydantic validation?", a: "It returns a 422 response describing the invalid fields, without calling your handler." },
      { q: "Why stream from the endpoint?", a: "Users see the reply start almost immediately instead of waiting for the full answer." },
    ],
  },

  "ai-deploy/prod-concerns": {
    summary:
      "Every LLM request costs money, so a public service needs protection. Caching avoids paying twice for the same answer, rate limits stop abuse, and budgets with alerts catch runaway spend early.",
    visuals: [
      {
        type: "flow",
        title: "Request guard pipeline",
        steps: [
          { label: "Authenticate", detail: "Identify the user or API key" },
          { label: "Rate limit", detail: "Reject with 429 if over quota" },
          { label: "Check cache", detail: "Return stored answer for repeat requests" },
          { label: "Call model", detail: "Only when nothing cached" },
          { label: "Record spend", detail: "Add cost to user and daily totals" },
          { label: "Alert", detail: "Notify when spend nears the budget" },
        ],
      },
    ],
    keyPoints: [
      "Rate limit per user or key, not just globally.",
      "Exact-match caching is simple and safe; key it on model, prompt version and input.",
      "Set hard spend limits at the provider and your own alerts below them.",
      "Return a clear 429 with Retry-After when users hit limits.",
    ],
    terms: [
      { term: "Response cache", meaning: "Stored answers reused for identical requests." },
      { term: "Rate limiting", meaning: "Capping how many requests a client can make per period." },
      { term: "Token bucket", meaning: "Rate limit algorithm that refills allowance over time." },
      { term: "Spend budget", meaning: "Maximum allowed cost per day, month or user." },
      { term: "Semantic cache", meaning: "Reusing answers for similar, not identical, queries." },
    ],
    example: {
      lang: "python",
      code: "import hashlib, time\n\ncache: dict[str, str] = {}\nrequests_log: dict[str, list[float]] = {}\n\ndef allowed(user: str, limit: int = 20, window: int = 60) -> bool:\n    now = time.time()\n    recent = [t for t in requests_log.get(user, []) if now - t < window]\n    requests_log[user] = recent + [now]\n    return len(recent) < limit\n\ndef cache_key(model: str, prompt_version: str, text: str) -> str:\n    return hashlib.sha256(f'{model}|{prompt_version}|{text}'.encode()).hexdigest()",
      caption: "A per-user sliding window limit and a safe cache key.",
    },
    pitfalls: [
      "Caching personalised answers and serving them to other users.",
      "Leaving the cache key without the prompt version, so old answers persist.",
    ],
    check: [
      { q: "Why include the prompt version in the cache key?", a: "So changing the prompt does not keep serving answers produced by the old one." },
      { q: "What status code signals a rate limit?", a: "429 Too Many Requests, ideally with a Retry-After header." },
    ],
  },

  "ai-deploy/open-models": {
    summary:
      "Tools like Ollama and llama.cpp run open-weight models on your own machine. Putting model calls behind one interface lets you swap a local model in for testing, privacy or cost, then compare quality and speed.",
    visuals: [
      {
        type: "compare",
        title: "Hosted API vs local model",
        columns: [
          { title: "Hosted API", points: ["Top quality models", "No hardware needed", "Per-token cost", "Data sent to provider"] },
          { title: "Local open model", points: ["Runs on your machine", "Data stays local", "Limited by RAM and GPU", "Often lower quality for size"] },
        ],
      },
    ],
    keyPoints: [
      "Quantised models use less memory at a small cost in quality.",
      "Model size must fit in your RAM or GPU memory to run well.",
      "Hide providers behind one interface so swapping needs no app changes.",
      "Run the same eval set to compare local and hosted models fairly.",
    ],
    terms: [
      { term: "Ollama", meaning: "Tool that downloads and serves open models locally." },
      { term: "llama.cpp", meaning: "Efficient C++ runtime for running models on CPUs and GPUs." },
      { term: "Quantisation", meaning: "Storing weights with fewer bits to save memory." },
      { term: "GGUF", meaning: "File format for quantised models used by llama.cpp." },
      { term: "Adapter interface", meaning: "Common code interface wrapping different model backends." },
    ],
    example: {
      lang: "bash",
      code: "# Download and chat with a small open model\nollama pull llama3.2\nollama run llama3.2 \"Explain RAG in one sentence\"\n\n# Ollama also serves a local HTTP API on port 11434\ncurl http://localhost:11434/api/generate \\\n  -d '{\"model\": \"llama3.2\", \"prompt\": \"Hello\", \"stream\": false}'",
      caption: "Run a local model from the terminal and over HTTP.",
    },
    pitfalls: [
      "Assuming a local model matches a large hosted model without testing.",
      "Picking a model too big for your memory, making it extremely slow.",
    ],
    check: [
      { q: "Why wrap model calls in a common interface?", a: "So you can switch between hosted and local models without changing the rest of the app." },
      { q: "What does quantisation trade off?", a: "Lower memory use and faster inference for a small loss in quality." },
    ],
  },

  "ai-deploy/containerise": {
    summary:
      "A Docker image packages your service with its exact Python version and dependencies, so it runs the same everywhere. Secrets come from environment variables at runtime, and health checks let the host restart failed instances.",
    visuals: [
      {
        type: "flow",
        title: "From code to running service",
        steps: [
          { label: "Write Dockerfile", detail: "Base image, dependencies, start command" },
          { label: "Build image", detail: "docker build creates a versioned image" },
          { label: "Push to registry", detail: "Store the image where the host can pull it" },
          { label: "Deploy with secrets", detail: "Inject API keys as environment variables" },
          { label: "Health checks and logs", detail: "Host restarts unhealthy containers" },
        ],
      },
    ],
    keyPoints: [
      "Never bake API keys into the image; inject them at runtime.",
      "Copy dependency files first so Docker caches the install layer.",
      "Use a slim base image and run as a non-root user.",
      "Expose a /health endpoint and log to stdout.",
    ],
    terms: [
      { term: "Docker image", meaning: "A packaged, versioned snapshot of your app and its dependencies." },
      { term: "Container", meaning: "A running instance of an image." },
      { term: "Registry", meaning: "Storage service for images, like a package repository." },
      { term: "Health check", meaning: "Endpoint the host polls to confirm the app is alive." },
      { term: "Secret", meaning: "Sensitive config, like an API key, kept out of code." },
    ],
    example: {
      lang: "dockerfile",
      code: "FROM python:3.12-slim\nWORKDIR /app\n\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\n\nCOPY . .\nRUN useradd -m appuser\nUSER appuser\n\nEXPOSE 8000\nCMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]\n\n# Run: docker run -e LLM_API_KEY=... -p 8000:8000 my-llm-api",
      caption: "Cached dependency layer, non-root user, secrets at runtime.",
    },
    pitfalls: [
      "Copying a .env file with secrets into the image.",
      "Copying all code before installing dependencies, breaking layer caching.",
    ],
    check: [
      { q: "Why copy requirements.txt before the rest of the code?", a: "Docker caches the install layer, so it only reinstalls when dependencies change." },
      { q: "How should API keys reach the container?", a: "As environment variables or a secrets manager at runtime, never inside the image." },
    ],
  },

  // ───────────────────────── Capstone ─────────────────────────
  "ai-capstone/ai-capstone-scope": {
    summary:
      "Before writing app code, define the problem, what success looks like and a small eval set. The eval set becomes your scoreboard, so every design choice afterwards can be measured.",
    visuals: [
      {
        type: "flow",
        title: "Scope before you build",
        steps: [
          { label: "Problem statement", detail: "Who the users are and what they need" },
          { label: "Success criteria", detail: "Measurable targets like 85% correct answers" },
          { label: "30-case eval set", detail: "Real questions, edge cases and refusals" },
          { label: "Architecture plan", detail: "Ingest, retrieval, tools, API and deployment" },
        ],
      },
    ],
    keyPoints: [
      "A narrow, well-defined problem beats a vague general assistant.",
      "Success criteria should be numbers you can measure with the eval set.",
      "Write eval cases before code so you are not grading your own homework.",
      "Include out-of-scope questions the app should refuse.",
    ],
    terms: [
      { term: "Problem statement", meaning: "A short description of the user, need and goal." },
      { term: "Success criteria", meaning: "Measurable targets that define done." },
      { term: "Eval-driven development", meaning: "Building against an eval set from day one." },
      { term: "Scope", meaning: "What the app will and will not do." },
    ],
    example: {
      lang: "text",
      code: "Problem: New engineers cannot find answers in 400 pages of internal docs.\nUsers: Engineers in their first 3 months.\nSuccess:\n- 85% of eval answers correct and cited\n- 100% refusal on out-of-scope questions\n- p95 latency under 6 seconds\n- Under $0.01 per question\nEval set: 30 cases (20 real, 6 edge, 4 refusal)",
      caption: "A one-page scope with measurable success criteria.",
    },
    pitfalls: [
      "Scoping a do-everything assistant that cannot be evaluated.",
      "Writing success criteria that cannot be measured, like users love it.",
    ],
    check: [
      { q: "Why write the eval set before the app?", a: "It defines success up front and avoids unconsciously picking tests your app already passes." },
      { q: "Give an example of a measurable success criterion.", a: "At least 85% of eval questions answered correctly with a valid citation." },
    ],
  },

  "ai-capstone/ai-capstone-build": {
    summary:
      "The capstone is a deployed RAG assistant with citations, at least one tool, an eval suite in CI and documented scores. Build a thin version end to end first, then improve it in measured loops.",
    visuals: [
      {
        type: "layers",
        title: "The assistant's architecture",
        layers: [
          { label: "API", detail: "FastAPI with auth, validation and streaming" },
          { label: "Orchestration", detail: "Query rewrite, retrieval, tool calls, prompt" },
          { label: "Retrieval", detail: "Hybrid search over chunked documents" },
          { label: "Storage", detail: "Postgres with pgvector and metadata" },
          { label: "Quality", detail: "Evals in CI, tracing and feedback" },
        ],
      },
      {
        type: "cycle",
        title: "Eval, then improve",
        steps: [
          { label: "Run evals", detail: "Score the current version" },
          { label: "Inspect failures", detail: "Retrieval miss or generation error?" },
          { label: "Change one thing", detail: "Chunking, prompt, reranker or model" },
          { label: "Re-run and compare", detail: "Keep it only if scores improve" },
        ],
      },
    ],
    keyPoints: [
      "Get a basic pipeline answering questions end to end before optimising.",
      "Change one variable at a time so you know what helped.",
      "Make CI fail when scores drop below your success criteria.",
      "Show eval scores, cost and latency in the README as evidence.",
    ],
    terms: [
      { term: "Baseline", meaning: "The first working version's scores, used for comparison." },
      { term: "Ablation", meaning: "Removing or changing one part to measure its effect." },
      { term: "Orchestration", meaning: "Code coordinating retrieval, tools and model calls." },
      { term: "Eval suite", meaning: "The full set of eval cases and scoring checks." },
    ],
    example: {
      lang: "markdown",
      code: "## Results (eval set v2, 30 cases)\n\n| Version              | Correct | Cited | p95 latency | Cost/q  |\n|----------------------|---------|-------|-------------|---------|\n| Baseline vector RAG  | 63%     | 70%   | 4.1 s       | $0.006  |\n| + hybrid search      | 77%     | 83%   | 4.3 s       | $0.006  |\n| + reranker           | 87%     | 93%   | 5.2 s       | $0.008  |",
      caption: "README results showing each measured improvement.",
    },
    pitfalls: [
      "Adding agents and tools before basic retrieval works well.",
      "Changing several things at once and not knowing which helped.",
    ],
    check: [
      { q: "Why change only one thing between eval runs?", a: "So any score change can be attributed to that specific change." },
      { q: "What evidence should the README include?", a: "Eval scores by version, plus latency and cost per question, and a live demo link." },
    ],
  },
};

export default explainers;
