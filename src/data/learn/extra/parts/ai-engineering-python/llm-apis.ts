import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "llm-apis/first-calls": {
    plain: [
      "A chat API is a web address that takes a list of messages and sends back the model's reply. You could call it with plain HTTP, but every provider offers an official SDK (software development kit): a Python package that handles the web request, the login and the error details for you.",
      "Each message has a role. The system prompt sets the rules, such as \"You are a polite support agent. Answer in two sentences.\" User messages are what the person typed. Assistant messages are what the model said earlier. Together they form the conversation the model reads.",
      "The API remembers nothing between calls. To have a conversation, your app keeps the list of messages and sends the whole list every time, adding the newest question at the end. If you only send the last question, the model has no idea what came before.",
      "Your API key is like a password linked to your bill. Anyone who has it can spend your money. Keep it in an environment variable or a secret store, never in your code, and never in Git.",
    ],
    deepDive: [
      {
        heading: "What the SDK does between your code and the model",
        body: "Install the SDK inside a virtual environment with pip, and pin the version in your requirements file so an upgrade cannot change behaviour by surprise. The SDK builds the HTTPS request, adds your API key as a header, turns your Python objects into JSON, and turns the JSON reply into typed response objects. Most official SDKs also add timeouts and a small number of automatic retries, and offer both a normal and an async client.\n\nMany SDKs read the key from a provider-specific environment variable automatically if you do not pass one. In development, a .env file loaded with python-dotenv is convenient; add .env to .gitignore before creating it. In production, use your platform's secret store. Use separate keys for development and production so you can revoke one without breaking the other.",
        visual: {
          type: "layers",
          title: "From your code to the model",
          layers: [
            { label: "Your app code", detail: "Builds messages, reads the reply" },
            { label: "Provider SDK", detail: "Objects to JSON, retries, timeouts" },
            { label: "HTTPS request", detail: "API key sent in a header" },
            { label: "Provider API gateway", detail: "Checks key, rate limits, routes" },
            { label: "Model servers", detail: "Run the model and count tokens" },
          ],
        },
      },
      {
        heading: "Anatomy of a request and a response",
        body: "A request names the model and carries the messages. Common settings are the maximum number of output tokens, temperature, and stop sequences (text that ends the reply early). Some APIs take the system prompt as its own field; others take it as the first message with a system role. Check which shape your SDK uses.\n\nThe response holds the reply content, a stop or finish reason, and a usage section with input and output token counts. Always check the stop reason. If it says the reply hit the token limit (the name differs by provider, such as length or max_tokens), the answer was cut off mid-sentence, and showing it as complete is a bug.\n\nLog the model name, token usage and a request ID with every call. Provider support teams ask for the request ID when you report a problem.",
        bullets: ["Request: model, messages, max output tokens, temperature", "Response: content, stop reason, usage", "Hit the token limit? The reply is incomplete", "Pin the exact model version you tested"],
      },
      {
        heading: "Writing the system prompt",
        body: "The system prompt is where stable rules go: who the assistant is, who it serves, what it must never do, and the format of its answers. Models give it more weight than user messages, which makes it the right place for rules the user should not be able to override.\n\nIt is not a secret, though. Users can often get a model to repeat its system prompt, so never put API keys, internal URLs or private data in it. Keep it focused: a short, clear system prompt beats a long list of rules that contradict each other.\n\nPut things that change per request, such as the user's name or retrieved documents, in the user message or a clearly marked section, so the stable part stays identical across calls. That also helps prompt caching later.",
      },
      {
        heading: "Managing conversation history",
        body: "Messages normally alternate user, assistant, user, assistant, and many APIs require the list to start with a user message. Each turn resends everything, so turn 20 sends all 19 earlier exchanges. Total tokens across a conversation therefore grow roughly with the square of its length, and long chats eventually overflow the context window.\n\nThree strategies keep history under control. Keep only the last N messages: simple, but the model forgets early facts. Summarise older turns into a short note that you keep at the top: keeps key facts, costs an extra call now and then. Store all turns and retrieve only those related to the new question: best memory, most work.\n\nWhatever you choose, count tokens before sending and leave room for the reply.",
        visual: {
          type: "compare",
          title: "Ways to trim chat history",
          columns: [
            { title: "Last N messages", points: ["Easiest to build", "Predictable token cost", "Forgets early details"] },
            { title: "Summarise old turns", points: ["Keeps key facts", "Extra model call sometimes", "Summary can lose nuance"] },
            { title: "Retrieve relevant turns", points: ["Best long-term memory", "Needs embeddings and storage", "Most moving parts"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One chat API call",
        root: "Chat API call",
        children: [
          { label: "Request: model", children: ["Exact version you tested"] },
          { label: "Request: instructions", children: ["System prompt", "Rules and output format"] },
          { label: "Request: messages", children: ["user and assistant turns", "Newest question last"] },
          { label: "Request: settings", children: ["Max output tokens", "Temperature", "Stop sequences"] },
          { label: "Response", children: ["Reply content", "Stop reason", "Token usage", "Request ID"] },
        ],
      },
    ],
    examples: [
      {
        title: "A terminal chatbot that keeps recent history",
        explanation: "You want a small command-line chat. Step 1: keep a history list. Step 2: on each turn, append the user's message, send the system prompt plus the last few messages, and append the reply. Step 3: keep an odd number of messages (7) so the slice always starts with a user message. The send function is a stub; replace its body with your SDK's chat call and return the reply text.",
        code: {
          lang: "python",
          code: "SYSTEM = \"You are a concise cooking assistant.\"\nKEEP = 7  # odd, so the slice starts with a user message\nhistory: list[dict[str, str]] = []\n\ndef send(system: str, messages: list[dict[str, str]]) -> str:\n    # Replace with your SDK call and return the reply text\n    return f\"(reply to: {messages[-1]['content']})\"\n\nwhile (text := input(\"you> \").strip()) not in (\"\", \"quit\"):\n    history.append({\"role\": \"user\", \"content\": text})\n    reply = send(SYSTEM, history[-KEEP:])\n    history.append({\"role\": \"assistant\", \"content\": reply})\n    print(\"bot>\", reply)",
        },
      },
      {
        title: "You pushed an API key to GitHub",
        explanation: "A key ended up in a public commit. Step 1: revoke it in the provider's console right away, because bots scan public repos for keys within minutes. Deleting the file is not enough; the key stays in Git history. Step 2: create a new key. Step 3: put it in a .env file that Git ignores, and load it in development. Step 4: in production, set it in your host's secret settings. Step 5: turn on a secret scanner (such as GitHub secret scanning or gitleaks) so it cannot happen again.",
        code: {
          lang: "bash",
          code: "# after revoking the old key and creating a new one:\necho \".env\" >> .gitignore\necho \"LLM_API_KEY=paste-new-key-here\" > .env\npip install python-dotenv\npython -c \"from dotenv import load_dotenv; import os; load_dotenv(); print('LLM_API_KEY' in os.environ)\"\ngit status   # .env must not appear in the list",
        },
      },
    ],
    cheatSheet: [
      "Install the SDK in a virtual environment and pin its version",
      "Read the API key from an environment variable; add .env to .gitignore first",
      "The API is stateless: send the system prompt and history on every call",
      "Check the stop reason: hitting the token limit means the reply was cut off",
      "Log model, token usage and request ID for every call",
      "Many APIs require messages to start with user and then alternate roles",
      "A leaked key must be revoked; deleting it from the repo is not enough",
    ],
    quiz: [
      {
        q: "Your bot forgets the user's name after one message. What is the most likely cause?",
        options: ["The temperature is too low", "The app sends only the newest message, not the history", "The API key is wrong", "The model is too small"],
        answer: 1,
        why: "The API keeps no memory, so earlier messages must be sent again each turn.",
      },
      {
        q: "The response stop reason says the token limit was reached. What does that mean?",
        options: ["The reply was cut off before the model finished", "The account ran out of credit", "The prompt was too long and was rejected", "The model refused to answer"],
        answer: 0,
        why: "The model stopped because it hit max output tokens, so the text is incomplete.",
      },
      {
        q: "What should you never put in a system prompt?",
        options: ["The assistant's role", "The output format", "API keys or private internal data", "Rules about tone"],
        answer: 2,
        why: "Users can often make the model reveal its system prompt, so it is not a safe place for secrets.",
      },
      {
        q: "A chat sends its full history each turn. How do total tokens grow as the conversation gets longer?",
        options: ["They stay the same each turn", "They shrink because of caching", "They grow by a fixed small amount overall", "They grow roughly with the square of the number of turns"],
        answer: 3,
        why: "Each turn resends all earlier turns, so the sum over the chat grows quadratically.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install your provider's SDK, store the key in a .env file, and send one single-turn request. Print the reply, the stop reason and the token usage.",
        hint: "Find the quickstart page in the provider's official docs; the usage and stop reason are fields on the response object.",
        solution: "python -m venv .venv && source .venv/bin/activate\npip install <provider-sdk> python-dotenv\necho \".env\" >> .gitignore\n# in Python:\n# load_dotenv(); client = <SDK client>()\n# resp = <chat call>(model=..., messages=[{\"role\": \"user\", \"content\": \"Hi\"}])\n# print(<reply text>, <stop reason>, <usage>)",
      },
      {
        level: "medium",
        task: "Turn the terminal chatbot into one that keeps a running summary: when history passes 10 messages, replace the oldest 6 with a one-paragraph summary made by the model.",
        hint: "Keep the summary as text and add it to the system prompt, rather than inventing a fake message role.",
        solution: "summary = \"\"\nif len(history) > 10:\n    old, history = history[:6], history[6:]\n    summary = send(\"Summarise the key facts in 3 sentences.\",\n        [{\"role\": \"user\", \"content\": summary + \"\\n\" + str(old)}])\nsystem = SYSTEM + \"\\nEarlier conversation: \" + summary\nreply = send(system, history)",
      },
      {
        level: "hard",
        task: "Write a provider-neutral ChatClient Protocol with one method, complete(system, messages) -> Reply, and two implementations: a fake for tests and a real one using your SDK. Make the chatbot depend only on the Protocol.",
        hint: "Use typing.Protocol and a small dataclass Reply(text, stop_reason, tokens_in, tokens_out).",
        solution: "from dataclasses import dataclass\nfrom typing import Protocol\n@dataclass\nclass Reply:\n    text: str; stop_reason: str; tokens_in: int; tokens_out: int\nclass ChatClient(Protocol):\n    def complete(self, system: str, messages: list[dict]) -> Reply: ...\nclass FakeClient:\n    def complete(self, system, messages):\n        return Reply(\"ok\", \"end\", 10, 1)\n# RealClient.complete wraps the SDK call and maps its fields to Reply.",
      },
    ],
    faq: [
      { q: "Should I use the official SDK or plain HTTP requests?", a: "Use the official SDK for most work. It handles auth, retries, streaming and typed responses, and it is updated when the API changes." },
      { q: "Is there a free way to practise with chat APIs?", a: "Some providers offer free trial credit or free tiers with low limits. You can also run a small open-weight model locally with Ollama, which exposes a local HTTP API." },
      { q: "What is the difference between the system prompt and the first user message?", a: "The system prompt holds standing rules that apply to the whole conversation and carries more weight. User messages hold what the person asks, turn by turn." },
      { q: "Why does my request fail with a 401 error?", a: "401 means the API key is missing, wrong or revoked. Check that the environment variable is set in the process that runs your code." },
    ],
  },

  "llm-apis/streaming": {
    plain: [
      "Without streaming, your app asks a question and waits until the model has written the whole answer, which can take 10 seconds or more. Only then does anything appear on screen. Users stare at a spinner and often think the app is broken.",
      "With streaming, the API sends the answer in small pieces while the model is still writing. The first words can appear in under a second, and the rest flows in like someone typing. The total time is about the same, but it feels much faster.",
      "To show the stream in a browser, your server passes each piece on as it arrives. A common way is server-sent events (SSE): one long HTTP response that the server keeps writing small messages into.",
      "Streams can break. The user closes the tab, the network drops, or the model hits its length limit. Good streaming code keeps the text received so far, knows whether the answer actually finished, and stops paying for tokens nobody will read.",
    ],
    deepDive: [
      {
        heading: "What a stream looks like on the wire",
        body: "Most LLM APIs stream using server-sent events. The response has the content type text/event-stream and stays open. Each event is a few text lines, such as an optional event: line naming the type and a data: line holding JSON, followed by a blank line that ends the event.\n\nA typical stream starts with a start event, then many delta events that each carry a few new characters of text, then a final event with the stop reason and token usage. Exact event names and shapes differ by provider, and the SDK hides them: you loop over a stream object and read the text deltas.\n\nUsage numbers often arrive only at the end, and some APIs require an option to include them. If you need cost tracking, make sure you capture that last event and do not stop reading early.",
        bullets: ["Content type: text/event-stream", "Each event ends with a blank line", "Deltas carry new text only, not the whole reply", "Stop reason and usage usually come last"],
      },
      {
        heading: "Passing the stream on to a browser",
        body: "Your server sits in the middle: it reads chunks from the model and writes them to the browser as they arrive. In FastAPI, return a StreamingResponse with media_type text/event-stream and an async generator that yields lines like data: {...} followed by a blank line. Set Cache-Control: no-cache.\n\nBuffering is the usual reason a stream arrives all at once at the end. Reverse proxies such as nginx buffer responses by default; turn it off with proxy_buffering off for that route, or send the header X-Accel-Buffering: no.\n\nIn the browser, the built-in EventSource is simplest, but it only makes GET requests and reconnects automatically when the stream ends, so close it when you receive your done event. For POST requests with a JSON body, use fetch and read response.body with a stream reader, splitting events on blank lines yourself.",
        bullets: ["FastAPI: StreamingResponse(gen(), media_type=\"text/event-stream\")", "nginx: proxy_buffering off, or X-Accel-Buffering: no", "EventSource: GET only, auto-reconnects", "fetch + reader: any method, parse events yourself"],
      },
      {
        heading: "Partial and interrupted output",
        body: "A stream can end in four ways: the model finished normally, it hit the max output token limit, an error arrived mid-stream, or the connection dropped. Only the first is a complete answer. Keep appending deltas to a buffer and check the final stop reason before you mark the message as done.\n\nIf the stream breaks, keep what you received. Save it marked as incomplete, show the user what arrived, and offer a retry button. Retrying usually means a fresh request, because most APIs cannot resume a stream where it stopped.\n\nWhen the user closes the tab, stop the model call too. In FastAPI (built on Starlette), a disconnect cancels your streaming generator, so put cleanup in a finally block and close the upstream stream, for example by using the SDK stream inside async with. Otherwise the model keeps generating tokens that you pay for and nobody sees.",
        visual: {
          type: "sequence",
          title: "User closes the tab mid-answer",
          actors: ["Browser", "Your server", "LLM API"],
          messages: [
            { from: 0, to: 1, label: "Ask a question" },
            { from: 1, to: 2, label: "Streaming request" },
            { from: 2, to: 1, label: "Text deltas" },
            { from: 1, to: 0, label: "Forward deltas" },
            { from: 0, to: 1, label: "Tab closed: connection drops" },
            { from: 1, to: 2, label: "Close stream: stop generating" },
            { from: 1, to: 1, label: "Save partial text as incomplete" },
          ],
        },
      },
      {
        heading: "Streaming JSON and tool calls",
        body: "When the model streams JSON, each chunk is a fragment such as {\"na, which is not valid JSON on its own. Do not parse until the stream has finished, then validate the whole thing. If you want to show fields as they fill in, use a parser that tolerates incomplete JSON, but treat the result as a preview, not as data.\n\nTool calls stream the same way: the tool name usually arrives first, then the arguments as JSON fragments. Join all fragments, parse once, validate, and only then run the tool.\n\nStreaming also makes output checks harder. If you filter replies for unsafe or private content, text has already reached the screen before you see the whole answer. Options are checking in small windows as text arrives, or not streaming for high-risk features.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Life of one streamed reply",
        steps: [
          { label: "Open connection", detail: "Request sent with streaming on" },
          { label: "First token", detail: "Time to first token ends here" },
          { label: "Text deltas", detail: "Append each to a buffer and display" },
          { label: "Final event", detail: "Stop reason and token usage" },
          { label: "Close and save", detail: "Store full text, mark complete or not" },
        ],
      },
    ],
    examples: [
      {
        title: "An SSE endpoint in FastAPI",
        explanation: "You want a /chat endpoint that streams to the browser. Step 1: write an async generator that reads chunks from the model (faked here). Step 2: wrap each chunk as an SSE event: a data: line with JSON and a blank line. Step 3: send a final done event so the browser knows the answer is complete. Step 4: return a StreamingResponse with the SSE media type and headers that stop caching and proxy buffering. Run it with uvicorn app:app and open /chat?q=hi to watch the events arrive.",
        code: {
          lang: "python",
          code: "import asyncio, json\nfrom fastapi import FastAPI\nfrom fastapi.responses import StreamingResponse\napp = FastAPI()\nasync def fake_llm(q: str):\n    for word in [\"Streaming \", \"over \", \"SSE \", \"works.\"]:\n        await asyncio.sleep(0.2)\n        yield word\n@app.get(\"/chat\")\nasync def chat(q: str):\n    async def events():\n        async for piece in fake_llm(q):\n            yield f\"data: {json.dumps({'text': piece})}\\n\\n\"\n        yield \"event: done\\ndata: {}\\n\\n\"\n    return StreamingResponse(events(), media_type=\"text/event-stream\", headers={\"Cache-Control\": \"no-cache\", \"X-Accel-Buffering\": \"no\"})",
        },
      },
      {
        title: "Showing the stream in the browser",
        explanation: "The page must display text as it arrives from the endpoint above. Step 1: open an EventSource to /chat with the question in the URL. Step 2: on each default message event, parse the JSON and append the text. Step 3: listen for the custom done event and close the connection, because EventSource otherwise reconnects and asks the same question again. Step 4: on error, close it and tell the user the answer may be incomplete.",
        code: {
          lang: "javascript",
          code: "const output = document.querySelector(\"#answer\");\nconst es = new EventSource(\"/chat?q=\" + encodeURIComponent(\"What is SSE?\"));\n\nes.onmessage = (e) => {\n  output.textContent += JSON.parse(e.data).text;\n};\nes.addEventListener(\"done\", () => es.close()); // stop auto-reconnect\nes.onerror = () => {\n  es.close();\n  output.textContent += \" [connection lost, answer may be incomplete]\";\n};",
        },
      },
    ],
    cheatSheet: [
      "Streaming lowers time to first token; total generation time stays about the same",
      "SSE event format: data: {json} followed by a blank line",
      "FastAPI: StreamingResponse(generator, media_type=\"text/event-stream\")",
      "Turn off proxy buffering: nginx proxy_buffering off or header X-Accel-Buffering: no",
      "EventSource is GET-only and auto-reconnects: close it on your done event",
      "Check the final stop reason before marking a streamed answer complete",
      "Parse streamed JSON only after the stream ends",
      "On client disconnect, close the upstream stream so you stop paying for tokens",
    ],
    quiz: [
      {
        q: "Your SSE stream works locally but arrives all at once in production behind nginx. What is the likely cause?",
        options: ["The model is slower in production", "SSE does not work over HTTPS", "nginx is buffering the response", "The browser does not support EventSource"],
        answer: 2,
        why: "Proxies buffer responses by default; turn buffering off for the streaming route.",
      },
      {
        q: "Why should the browser close its EventSource when it gets the done event?",
        options: ["EventSource automatically reconnects, which would resend the question", "It saves memory on the server only", "The done event is an error", "Browsers limit EventSource to one message"],
        answer: 0,
        why: "When the stream ends, EventSource reconnects by default and would start a new request.",
      },
      {
        q: "A stream ends normally, but the final stop reason says the token limit was hit. What should you do?",
        options: ["Treat the answer as complete", "Parse it as JSON anyway", "Retry with temperature 0", "Mark it incomplete, then raise the limit or ask for a shorter answer"],
        answer: 3,
        why: "Hitting the limit means the model was cut off, even though the connection closed cleanly.",
      },
      {
        q: "What usually arrives in the last event of a streamed response?",
        options: ["The system prompt", "The stop reason and token usage", "The full text again", "The API key"],
        answer: 1,
        why: "Providers send summary data such as stop reason and usage once generation ends.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Stream a reply from your SDK to the terminal, printing each piece as it arrives, then print the time to first token and the total time.",
        hint: "Use time.perf_counter() before the call and record the time when the first chunk arrives.",
        solution: "import time\nstart = time.perf_counter(); first = None; parts = []\nfor text in stream_text(prompt):   # your SDK's streaming loop\n    if first is None:\n        first = time.perf_counter() - start\n    print(text, end=\"\", flush=True); parts.append(text)\nprint(f\"\\nTTFT {first:.2f}s total {time.perf_counter() - start:.2f}s\")",
      },
      {
        level: "medium",
        task: "Change the FastAPI example so that if the client disconnects, the server logs how many characters were sent and stops reading from the model.",
        hint: "Wrap the loop in try/finally; cancellation raises inside the generator.",
        solution: "async def events():\n    sent = 0\n    try:\n        async for piece in fake_llm(q):\n            sent += len(piece)\n            yield f\"data: {json.dumps({'text': piece})}\\n\\n\"\n        yield \"event: done\\ndata: {}\\n\\n\"\n    finally:\n        print(\"stream closed after\", sent, \"chars\")\n        # close the upstream SDK stream here",
      },
      {
        level: "hard",
        task: "Write a browser client that sends a POST with a JSON body to a streaming endpoint and displays SSE data events, using fetch instead of EventSource.",
        hint: "Pipe response.body through TextDecoderStream, buffer text, split on a blank line, and keep the last partial piece.",
        solution: "const res = await fetch(\"/chat\", { method: \"POST\",\n  headers: { \"Content-Type\": \"application/json\" },\n  body: JSON.stringify({ q: \"Hi\" }) });\nconst reader = res.body.pipeThrough(new TextDecoderStream()).getReader();\nlet buf = \"\";\nfor (;;) {\n  const { value, done } = await reader.read();\n  if (done) break;\n  buf += value; const events = buf.split(\"\\n\\n\"); buf = events.pop();\n  for (const ev of events) for (const line of ev.split(\"\\n\"))\n    if (line.startsWith(\"data: \")) out.textContent += JSON.parse(line.slice(6)).text ?? \"\";\n}",
      },
    ],
    faq: [
      { q: "Does streaming cost more?", a: "No. You pay for the same input and output tokens whether or not you stream." },
      { q: "Should I use SSE or WebSockets for a chat app?", a: "SSE is enough when the server only pushes the reply and the client sends each new question as a normal request. WebSockets help when both sides must send messages over one long connection, such as live voice or collaborative editing." },
      { q: "Can I stream structured JSON output?", a: "Yes, but each chunk is an incomplete fragment. Parse and validate only after the stream finishes, or use a partial-JSON parser for a preview." },
    ],
  },

  "llm-apis/structured-output": {
    plain: [
      "Normally a model replies with free text, like a person would. That is fine for a chat window, but your code cannot easily use \"The priority is probably high, and it's about login.\" Code wants something exact, like priority = \"high\" and area = \"auth\".",
      "Structured output means asking the model to reply in a fixed format, usually JSON, that matches a description of the fields you need. That description is called a schema. It says which fields exist, what type each one is, and which values are allowed.",
      "In Python, you write the schema as a Pydantic class. Pydantic can turn the class into a JSON Schema to send with the request, and it can check the reply and turn it into a real Python object. If a field is missing or has a wrong value, you get a clear error instead of silent bad data.",
      "Even with the best API settings, check every reply. A model can return a valid shape with wrong content, refuse to answer, or be cut off. Validation is the gate between the model's text and the rest of your system.",
    ],
    deepDive: [
      {
        heading: "Three levels of strictness",
        body: "The weakest approach is asking in the prompt: reply only with JSON in this shape. It mostly works, but models sometimes add a sentence before the JSON, wrap it in a code fence, or miss a field.\n\nJSON mode is a setting on some APIs that guarantees syntactically valid JSON, but not your shape: field names and types can still be wrong.\n\nThe strongest is schema-constrained output, often called structured outputs or strict mode, where you send a JSON Schema and the API guarantees the reply fits it. Tool or function calling gives a similar result: you define a tool whose parameters are your schema, and the model's tool call arguments are your data. Use the strictest option your provider supports, and still validate.",
        visual: {
          type: "compare",
          title: "How sure can you be of the shape?",
          columns: [
            { title: "Prompt only", points: ["Ask for JSON in words", "Works with any model", "Extra text and missing fields happen"] },
            { title: "JSON mode", points: ["Always valid JSON syntax", "Shape is not enforced", "Wrong field names still possible"] },
            { title: "Schema-constrained", points: ["Reply must fit your schema", "Supports a subset of JSON Schema", "Content can still be wrong"] },
          ],
        },
      },
      {
        heading: "How constrained decoding works",
        body: "Schema-constrained output works at the sampling step. At each position, the system knows which tokens could legally come next in a JSON document that matches your schema. All other tokens get zero probability before the next token is drawn. After {\"priority\": \" only the starts of low, medium or high are allowed, so the model cannot invent \"urgent\".\n\nThis guarantees the shape, not the truth. The model can still pick the wrong value, leave a field empty, or copy a number incorrectly.\n\nStrict modes usually support only part of JSON Schema. Common rules are that every property must be listed as required and that additionalProperties must be false. Some keywords, such as certain string formats or length limits, may be rejected or ignored. Read your provider's list of supported features, and keep the checks it cannot enforce in your Pydantic model.",
      },
      {
        heading: "Designing a schema the model can fill well",
        body: "Field names and descriptions act as instructions. invoice_date with the description \"Date printed on the invoice, YYYY-MM-DD\" is far clearer than date. Use Literal or Enum for fixed choices, so the model picks from your list.\n\nFor information that may be missing, use a required field that can be null, such as str | None, and say in the description when to use null. That is better than making the field optional, because the model must decide explicitly, and strict modes often require every field anyway.\n\nThe model writes fields in order, from first to last. If you want it to reason before deciding, put a short reasoning field before the answer field. Keep nesting shallow, and do not ask the model to compute things code can compute, such as totals or counts; check those in code instead.",
        bullets: ["Descriptions are instructions: be specific", "Literal or Enum for every fixed choice", "Required but nullable for maybe-missing values", "Field order matters: reasoning before the answer", "Compute totals in code, not in the model"],
      },
      {
        heading: "Handling failures without breaking the app",
        body: "Plan for four failure types. A validation error: the JSON parses but breaks a rule, such as a missing field or a total that does not add up. A truncated reply: the model hit the token limit and the JSON is cut off, which the stop reason tells you. A refusal: the model declines, and some APIs return this in a separate refusal field instead of your schema. And a correct shape with wrong content, which only business checks and evals catch.\n\nFor validation errors, one repair attempt usually works: send the model its own output plus the list of errors, and ask for corrected JSON. Do not loop forever; after one or two attempts, return a clear failure, queue the item for human review, or use a fallback.\n\nLog every failure with the raw output. Patterns in those logs tell you which field descriptions to improve.",
        visual: {
          type: "tree",
          title: "When structured output fails",
          root: "Failed reply",
          children: [
            { label: "Validation error", children: ["Send errors back once", "Then human review"] },
            { label: "Cut off by token limit", children: ["Check stop reason", "Raise limit or shorten task"] },
            { label: "Refusal", children: ["Do not retry blindly", "Show a clear message"] },
            { label: "Valid but wrong", children: ["Business-rule checks", "Catch it with evals"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A one-time repair after a failed check",
        actors: ["Your app", "LLM API"],
        messages: [
          { from: 0, to: 1, label: "Document plus JSON Schema" },
          { from: 1, to: 0, label: "JSON reply" },
          { from: 0, to: 0, label: "Pydantic: total does not match items" },
          { from: 0, to: 1, label: "Your reply plus the error list" },
          { from: 1, to: 0, label: "Corrected JSON" },
          { from: 0, to: 0, label: "Validates: save the object" },
        ],
      },
    ],
    examples: [
      {
        title: "An invoice schema with a business rule",
        explanation: "You extract line items and totals from invoices. Step 1: describe each line item and the invoice as Pydantic models. Step 2: make invoice_date required but nullable, with a description saying when to use null. Step 3: use Decimal for money so 19.99 stays exact. Step 4: add a model_validator that checks the items add up to the total; the API's schema enforcement cannot check that, but Pydantic can. Step 5: send Invoice.model_json_schema() with the request and validate the reply with Invoice.model_validate_json.",
        code: {
          lang: "python",
          code: "from decimal import Decimal\nfrom pydantic import BaseModel, Field, model_validator\nclass Item(BaseModel):\n    description: str\n    quantity: int = Field(ge=1)\n    unit_price: Decimal\nclass Invoice(BaseModel):\n    invoice_date: str | None = Field(description=\"YYYY-MM-DD, or null if not printed\")\n    items: list[Item]\n    total: Decimal\n    @model_validator(mode=\"after\")\n    def check_total(self) -> \"Invoice\":\n        if sum(i.quantity * i.unit_price for i in self.items) != self.total:\n            raise ValueError(\"total does not match the line items\")\n        return self",
        },
      },
      {
        title: "Retry once with the errors, then give up cleanly",
        explanation: "Some invoices fail validation. Step 1: send the document and the schema. Step 2: try to validate the reply. Step 3: on ValidationError, add the model's reply and the error list to the conversation and ask for corrected JSON. Step 4: after two attempts, return None so the caller can send the invoice to a human review queue. call_model stands for your SDK call with structured output turned on.",
        code: {
          lang: "python",
          code: "from pydantic import ValidationError\n\ndef extract(text: str, call_model, attempts: int = 2) -> Invoice | None:\n    messages = [{\"role\": \"user\", \"content\": f\"Extract the invoice.\\n<doc>{text}</doc>\"}]\n    for _ in range(attempts):\n        raw = call_model(messages, schema=Invoice.model_json_schema())\n        try:\n            return Invoice.model_validate_json(raw)\n        except ValidationError as e:\n            messages += [\n                {\"role\": \"assistant\", \"content\": raw},\n                {\"role\": \"user\", \"content\": f\"Fix these errors, reply with JSON only: {e.errors(include_url=False)}\"},\n            ]\n    return None  # caller sends it to human review",
        },
      },
    ],
    cheatSheet: [
      "Model.model_json_schema() gives the JSON Schema to send with the request",
      "Model.model_validate_json(raw) parses and validates in one step",
      "JSON mode guarantees valid JSON, not your schema; strict schema mode enforces the shape",
      "Use Literal or Enum for fixed choices and required-but-nullable for maybe-missing values",
      "Put a reasoning field before the answer field; models fill fields in order",
      "Check the stop reason: a reply cut off by the token limit is broken JSON",
      "Retry once with the error list, then fail cleanly or send to human review",
    ],
    quiz: [
      {
        q: "What does JSON mode guarantee?",
        options: ["The reply matches your schema exactly", "The reply is syntactically valid JSON", "The values are factually correct", "The reply contains no extra fields"],
        answer: 1,
        why: "JSON mode only ensures parseable JSON; schema-constrained output is needed for the shape.",
      },
      {
        q: "How does schema-constrained decoding stop the model from writing an invalid value?",
        options: ["It retries until the JSON is valid", "It fixes the JSON after generation", "It blocks tokens that would break the schema at each sampling step", "It asks a second model to check"],
        answer: 2,
        why: "Disallowed tokens get zero probability, so only schema-valid continuations can be sampled.",
      },
      {
        q: "A field may be missing from some documents. What schema design is usually best?",
        options: ["Required field that allows null, with a description of when to use null", "Leave it out of the schema", "Make it a free-text field", "Make every field optional"],
        answer: 0,
        why: "The model must decide explicitly, and strict modes often require every field to be present.",
      },
      {
        q: "Strict structured output is on, and the reply validates. Which problem can still remain?",
        options: ["Missing required fields", "Invalid JSON syntax", "A value outside the enum", "A wrong value, such as a misread invoice total"],
        answer: 3,
        why: "The shape is guaranteed, but the content can still be wrong, so business checks and evals are needed.",
      },
      {
        q: "Why put a short reasoning field before the final answer field?",
        options: ["JSON requires alphabetical order", "The model writes fields in order, so it reasons before committing to an answer", "It makes the reply shorter", "Validators run faster"],
        answer: 1,
        why: "Generation is left to right, so earlier fields can inform later ones.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a Pydantic model for a support ticket with summary, priority (low, medium, high) and product_area, print its JSON Schema, and validate one good and one bad JSON string.",
        hint: "Use Literal for priority and print json.dumps(Model.model_json_schema(), indent=2).",
        solution: "import json\nfrom typing import Literal\nfrom pydantic import BaseModel, ValidationError\nclass Ticket(BaseModel):\n    summary: str\n    priority: Literal[\"low\", \"medium\", \"high\"]\n    product_area: str\nprint(json.dumps(Ticket.model_json_schema(), indent=2))\nprint(Ticket.model_validate_json('{\"summary\": \"x\", \"priority\": \"low\", \"product_area\": \"auth\"}'))\ntry: Ticket.model_validate_json('{\"summary\": \"x\", \"priority\": \"urgent\"}')\nexcept ValidationError as e: print(e.error_count(), \"errors\")",
      },
      {
        level: "medium",
        task: "Extract tickets from 20 real or made-up customer emails twice: once with a prompt-only JSON request, once with your API's structured output feature. Count how many replies fail validation in each run.",
        hint: "Wrap model_validate_json in try/except and keep a counter per run.",
        solution: "fails = {\"prompt_only\": 0, \"structured\": 0}\nfor mode in fails:\n    for email in emails:\n        raw = call_model(email, mode=mode)\n        try:\n            Ticket.model_validate_json(raw)\n        except ValidationError:\n            fails[mode] += 1\nprint(fails)  # structured output should fail far less often",
      },
      {
        level: "hard",
        task: "Add a business rule to the Ticket model: if priority is high, a non-empty error_message field is required. Then run the repair loop from the examples and log every first-attempt failure with the raw output.",
        hint: "Add error_message: str | None and a model_validator(mode=\"after\").",
        solution: "class Ticket(BaseModel):\n    summary: str\n    priority: Literal[\"low\", \"medium\", \"high\"]\n    error_message: str | None\n    @model_validator(mode=\"after\")\n    def need_error(self):\n        if self.priority == \"high\" and not self.error_message:\n            raise ValueError(\"high priority needs error_message\")\n        return self\n# in extract(): on ValidationError, log.warning(\"retry\", raw=raw, errors=e.errors())",
      },
    ],
    faq: [
      { q: "Can I use structured output with any model?", a: "Prompt-only JSON works with any model, but guaranteed schema output depends on the provider and model. Check the docs, and keep Pydantic validation either way." },
      { q: "Should I use tool calling or structured output to get JSON?", a: "Use the structured output feature when you just need data back. Use tool calling when the model should choose between actions; its arguments are also schema-shaped JSON." },
      { q: "Why do I get a code fence or a sentence around the JSON?", a: "That happens with prompt-only requests. Switch to the API's structured output mode, or as a stopgap, extract the text between the first { and the last } before validating." },
      { q: "Does structured output make answers less accurate?", a: "For extraction and classification it usually helps. For complex reasoning, tight formats can hurt slightly, so give the model a reasoning field or let it think before the structured step, and measure with evals." },
    ],
  },

  "llm-apis/reliability": {
    plain: [
      "Calling a model is a network call to a busy service. Sometimes it is slow, sometimes the provider says you are sending too much, and sometimes its servers have a bad minute. None of this is rare. If your code assumes every call works, your app will break in front of users.",
      "A timeout is the longest you are willing to wait. Without one, a stuck call can hang a user's request forever. With one, you give up after, say, 30 seconds and can try something else.",
      "A retry tries the same call again after a short wait. Waiting a bit longer after each failure (1 second, then 2, then 4) is called exponential backoff. Adding a small random amount, called jitter, stops thousands of clients from retrying at the exact same moment.",
      "Only some errors are worth retrying. A busy server or a rate limit will likely pass. A bad request or a wrong API key will fail the same way every time. When retries run out, a fallback (a backup model or a friendly message) keeps the app useful.",
    ],
    deepDive: [
      {
        heading: "Sort errors before you retry",
        body: "HTTP status codes tell you what kind of failure you have. 400 means the request itself is wrong, for example an invalid parameter or a prompt longer than the context window. 401 and 403 mean the key is wrong or lacks permission. 404 often means a model name that does not exist. These will fail every time, so fix the request instead of retrying.\n\n429 means you hit a rate limit, and 500, 502, 503 and 504 are server-side problems. Network errors and timeouts belong here too. Some providers also return a special overloaded error when demand is high. These are transient: they usually succeed if you wait and try again.\n\nOfficial SDKs raise different exception classes for these cases, such as a rate limit error, a connection error and a timeout error. Catch the specific classes, not every exception.",
        visual: {
          type: "tree",
          title: "Which errors to retry",
          root: "Failed call",
          children: [
            { label: "Retry with backoff", children: ["Timeout or connection error", "429 rate limited", "500, 502, 503, 504", "Provider overloaded"] },
            { label: "Do not retry: fix it", children: ["400 bad request", "401 or 403 key or permission", "404 unknown model", "Prompt too long for context"] },
            { label: "Handle separately", children: ["Refusal or content filter", "Reply cut off by token limit"] },
          ],
        },
      },
      {
        heading: "Timeouts that match the work",
        body: "There are two kinds of timeout. A connect timeout limits how long you wait to reach the server, and a few seconds is plenty. A read timeout limits how long you wait for data. A long non-streaming answer can legitimately take a minute or more, so set it from your real p99 latency, not a guess.\n\nOfficial SDKs often have generous default timeouts (several minutes) and a couple of automatic retries. Set both yourself, per client or per request.\n\nAlso set a total deadline for the whole user request. If the user will only wait 20 seconds, then three attempts of 30 seconds each is meaningless. With streaming, you can use a short time-to-first-token limit and a longer idle limit between chunks: if no chunk arrives for 20 seconds, the stream is probably stuck.",
        bullets: ["Connect timeout: a few seconds", "Read timeout: based on measured p99", "Total deadline: what the user will wait", "Streaming: idle timeout between chunks"],
      },
      {
        heading: "Rate limits and backoff in practice",
        body: "Providers limit requests per minute and tokens per minute, often separately for input and output tokens, per model and per organisation. Many responses include headers showing how much quota is left, and a 429 may include a Retry-After header saying how many seconds to wait. If it is present, obey it.\n\nOtherwise, use exponential backoff with jitter. A common formula is: wait a random time between 0 and min(cap, base x 2 to the power of attempt). Cap the number of attempts (3 to 5) and the total time.\n\nWatch for stacked retries. If the SDK retries twice and your wrapper retries five times, one call can become 15 requests. Pick one layer to own retries, and set the other to zero.\n\nBetter still, avoid 429s: limit concurrency with a semaphore, spread batch jobs over time, and use the provider's batch API for work that can wait.",
      },
      {
        heading: "Fallbacks and circuit breakers",
        body: "A fallback is what you do when the main path fails. Options include a second model from the same provider, a model from another provider, a cached answer for common questions, or a clear message: the assistant is busy, please try again in a minute. A fallback model needs its own eval run, because the same prompt can behave differently on another model.\n\nIf the main provider is having an outage, retrying every request just adds load and makes users wait. A circuit breaker tracks recent failures. When they pass a threshold, it opens: calls skip the main provider and go straight to the fallback. After a cool-down it lets one test call through; if that works, it closes and traffic returns.\n\nLog every retry, fallback and breaker change with a reason. A sudden rise in fallbacks is often your first sign of a provider problem.",
        visual: {
          type: "cycle",
          title: "Circuit breaker states",
          steps: [
            { label: "Closed", detail: "Calls go to the main model; failures are counted" },
            { label: "Open", detail: "Too many failures: use the fallback at once" },
            { label: "Half-open", detail: "After a cool-down, let one test call through" },
            { label: "Back to closed", detail: "Test call works: normal traffic resumes" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A rate limit handled politely",
        actors: ["Your app", "LLM API"],
        messages: [
          { from: 0, to: 1, label: "Request" },
          { from: 1, to: 0, label: "429 with Retry-After: 2" },
          { from: 0, to: 0, label: "Wait 2 seconds" },
          { from: 0, to: 1, label: "Same request again" },
          { from: 1, to: 0, label: "200 OK with the reply" },
        ],
      },
    ],
    examples: [
      {
        title: "Retries with tenacity",
        explanation: "You want backoff without writing the loop yourself. Step 1: install tenacity. Step 2: map your SDK's transient errors (timeouts, 429, 5xx) to one exception type, or list the SDK's own classes. Step 3: decorate the call: retry only that type, wait a random exponential time capped at 30 seconds, stop after 5 attempts, and re-raise the last error. Step 4: set the SDK's own max retries to 0 so retries do not stack.",
        code: {
          lang: "python",
          code: "# pip install tenacity\nfrom tenacity import (retry, retry_if_exception_type,\n                      stop_after_attempt, wait_random_exponential)\n\nclass TransientError(Exception):\n    \"\"\"Raised for timeouts, 429 and 5xx responses.\"\"\"\n\n@retry(retry=retry_if_exception_type(TransientError),\n       wait=wait_random_exponential(multiplier=1, max=30),\n       stop=stop_after_attempt(5),\n       reraise=True)\ndef call_model(prompt: str) -> str:\n    ...  # SDK call (with its own retries off); raise TransientError when needed",
        },
      },
      {
        title: "A deadline with a fallback model",
        explanation: "Users will wait about 6 seconds. Step 1: give the main model 3 seconds with asyncio.timeout. Step 2: if it times out or the connection fails, give a smaller, faster model 3 seconds. Step 3: if that also fails, return a friendly message instead of an error page. In this simulation the main model takes 10 seconds, so the backup answers.",
        code: {
          lang: "python",
          code: "import asyncio\nasync def primary(q: str) -> str:\n    await asyncio.sleep(10); return \"big model answer\"  # too slow today\nasync def backup(q: str) -> str:\n    await asyncio.sleep(0.5); return \"small model answer\"\nasync def answer(q: str) -> str:\n    for model in (primary, backup):\n        try:\n            async with asyncio.timeout(3):\n                return await model(q)\n        except (TimeoutError, ConnectionError):\n            continue\n    return \"The assistant is busy. Please try again in a minute.\"\n\nprint(asyncio.run(answer(\"hi\")))  # small model answer",
        },
      },
    ],
    cheatSheet: [
      "Retry: timeouts, connection errors, 429, 500, 502, 503, 504",
      "Do not retry: 400, 401, 403, 404 or prompt-too-long errors",
      "Obey Retry-After when a 429 includes it",
      "Backoff with full jitter: sleep random(0, min(cap, base * 2^attempt))",
      "Let one layer own retries: SDK retries x wrapper retries multiply",
      "Set a total deadline per user request, not just per attempt",
      "Run your evals on the fallback model before you rely on it",
    ],
    quiz: [
      {
        q: "Which error should you retry?",
        options: ["401 Unauthorized", "400 Bad Request", "404 Not Found for the model name", "503 Service Unavailable"],
        answer: 3,
        why: "503 is a temporary server-side problem; the others fail the same way every time.",
      },
      {
        q: "A 429 response includes Retry-After: 5. What should your client do?",
        options: ["Wait about 5 seconds before retrying", "Retry immediately", "Switch API keys", "Give up permanently"],
        answer: 0,
        why: "The provider is telling you exactly when capacity should be available again.",
      },
      {
        q: "The SDK retries 2 times and your wrapper retries 4 times. How many requests can one failing call cause?",
        options: ["4", "6", "12", "2"],
        answer: 2,
        why: "Each of the 4 wrapper attempts makes up to 3 SDK requests (1 + 2 retries), so 12.",
      },
      {
        q: "What does an open circuit breaker do?",
        options: ["Retries faster", "Sends calls straight to the fallback without trying the failing service", "Closes the user's connection", "Raises the rate limit"],
        answer: 1,
        why: "It stops adding load to a failing service and gives users a fast fallback.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function is_retryable(status: int) that returns True for 408, 429 and 5xx codes, and False otherwise. Test it with 200, 400, 401, 429, 500 and 503.",
        hint: "500 <= status <= 599 covers server errors.",
        solution: "def is_retryable(status: int) -> bool:\n    return status in (408, 429) or 500 <= status <= 599\n\nfor s in (200, 400, 401, 429, 500, 503):\n    print(s, is_retryable(s))\n# 200 False, 400 False, 401 False, 429 True, 500 True, 503 True",
      },
      {
        level: "medium",
        task: "Write backoff_delays(attempts, base=1, cap=20) that returns the list of sleep times using full jitter, and a retry loop that obeys a Retry-After value when one is given.",
        hint: "Full jitter: pick a random wait between 0 and min(cap, base times 2 to the power i).",
        solution: "import random, time\ndef backoff_delay(i: int, base=1.0, cap=20.0) -> float:\n    return random.uniform(0, min(cap, base * 2 ** i))\ndef call_with_retries(call, attempts=4):\n    for i in range(attempts):\n        status, retry_after, body = call()\n        if status < 400: return body\n        if not is_retryable(status) or i == attempts - 1:\n            raise RuntimeError(f\"failed with {status}\")\n        time.sleep(float(retry_after) if retry_after else backoff_delay(i))",
      },
      {
        level: "hard",
        task: "Implement a simple circuit breaker class with failure_threshold and cool_down_s. It should open after N failures in a row, use the fallback while open, and allow one test call after the cool-down.",
        hint: "Store the failure count and the time the breaker opened; check time.monotonic() on each call.",
        solution: "import time\nclass Breaker:\n    def __init__(self, threshold=5, cool_down_s=30):\n        self.threshold, self.cool, self.fails, self.opened = threshold, cool_down_s, 0, None\n    def call(self, main, fallback):\n        if self.opened and time.monotonic() - self.opened < self.cool: return fallback()\n        try:\n            result = main(); self.fails, self.opened = 0, None; return result\n        except Exception:\n            self.fails += 1\n            if self.fails >= self.threshold: self.opened = time.monotonic()\n            return fallback()",
      },
    ],
    faq: [
      { q: "What is a good timeout for LLM calls?", a: "Measure your own latencies and set it a little above your p99, often 30 to 120 seconds for non-streaming calls. Streaming calls can use a short first-token limit plus an idle limit between chunks." },
      { q: "How do I avoid 429 rate limit errors?", a: "Limit concurrency with a semaphore, spread batch work over time, use the provider's batch API for jobs that can wait, and ask for higher limits once your usage grows." },
      { q: "Is it safe to retry an LLM call?", a: "A plain text generation call has no side effects apart from cost, so retrying is safe. Be careful with flows where a tool call already changed something, such as sending an email." },
    ],
  },

  "llm-apis/cost-latency": {
    plain: [
      "You pay for an LLM call by the token. Every token you send (input) has a price, and every token the model writes (output) has a usually higher price. A long system prompt, a long chat history or many pasted documents all add input tokens on every single call.",
      "Latency means waiting time. Two numbers matter: how long until the first words appear, and how long until the whole answer is done. The model writes output one token at a time, so a long answer takes longer than a long question.",
      "You cannot improve what you do not measure. Log the token counts, the cost and the time for every call. After a day you will see which feature, prompt or user drives most of the bill.",
      "Then use the levers: send fewer tokens, ask for shorter answers, use a smaller model for easy jobs, and use caching so repeated work is cheaper. Each change should be checked with your evals so quality does not quietly drop.",
    ],
    deepDive: [
      {
        heading: "Counting tokens before you send",
        body: "Each model family has its own tokenizer, so the same text gives different counts on different models. Options for counting: a local tokenizer library for that model (for example tiktoken for OpenAI models, or the model's tokenizer loaded with Hugging Face transformers for open models), or a token counting endpoint if your provider offers one. Character-based estimates (about 4 characters per English token) are fine for rough planning but not for hard limits.\n\nThe usage numbers in each API response are the ground truth for billing. Record them on every call.\n\nBefore sending, check the budget: context window minus the max output tokens minus a safety margin must be at least your input count. If not, trim history or retrieved chunks first, rather than letting the API reject the call. Chat formatting and tool definitions add some tokens beyond your visible text, so keep a margin.",
        bullets: ["Different model, different tokenizer, different count", "Usage in the response is what you are billed", "Input budget = window - max output - margin", "Trim history and context before sending, not after an error"],
      },
      {
        heading: "Where the waiting time goes",
        body: "A call's latency has three parts. First, network and queueing: reaching the provider and waiting for capacity. Second, prefill: the model reads your whole prompt; this is fast per token because it runs in parallel, but very long prompts still add noticeable time. The end of prefill is when the first token appears: time to first token (TTFT). Third, decode: the model writes the answer one token at a time at a roughly steady speed, measured in output tokens per second.\n\nSo total latency is roughly TTFT plus output tokens divided by speed. Cutting a 600-token answer to 200 tokens saves far more time than trimming the prompt by the same amount.\n\nMeasure with time.perf_counter() around each call, and record TTFT when streaming. Report p50 and p95, not the average: a few very slow calls hide in an average.",
        visual: {
          type: "flow",
          title: "Anatomy of one call's latency",
          steps: [
            { label: "Network and queue", detail: "Reach the provider, wait for capacity" },
            { label: "Prefill", detail: "Read the whole prompt in parallel" },
            { label: "First token", detail: "TTFT is measured here" },
            { label: "Decode", detail: "One token at a time, steady speed" },
            { label: "Done", detail: "Total = TTFT + output tokens / speed" },
          ],
        },
      },
      {
        heading: "Prompt caching: reuse the start of your prompt",
        body: "Many requests start the same way: the same system prompt, tool definitions or reference document, followed by a different question. Prompt caching lets the provider keep the processed start (the prefix) for a short time. Later requests with exactly the same prefix are billed at a reduced input price and usually get a faster TTFT.\n\nThe key word is exactly. A cache hit needs an identical prefix, token for token. Put stable content first and changing content last. A timestamp or user name near the top of the system prompt breaks caching for everything after it.\n\nDetails vary by provider: some cache automatically, others need you to mark cache points; most need a minimum prefix length; caches expire after a few minutes without use; and some charge extra to write the cache. The response usage usually reports how many input tokens were read from cache, so you can confirm it works.",
        visual: {
          type: "layers",
          title: "Order a prompt for cache hits",
          layers: [
            { label: "System prompt", detail: "Same on every call" },
            { label: "Tool definitions", detail: "Same on every call" },
            { label: "Reference documents", detail: "Same for a session" },
            { label: "Conversation history", detail: "Grows, but its start stays the same" },
            { label: "New user message", detail: "Changes every call: keep it last" },
          ],
        },
      },
      {
        heading: "Smaller models, routing and other levers",
        body: "Model choice is the biggest lever: small models can cost ten or more times less per token than the largest ones and respond faster. Routing sends each request to the cheapest model likely to handle it. Simple rules work (classification and extraction to the small model, long reasoning to the large one), or a small model can try first and pass low-confidence cases up.\n\nOther levers: ask for concise answers and set max output tokens; send fewer retrieved chunks; trim or summarise chat history; cache full responses for exact repeated questions; and use the provider's batch API, which is often around half price, for work that can wait hours.\n\nWatch hidden costs too. Retries, agent loops that call the model many times, reasoning tokens billed as output, and embedding calls all add up. Your logs should show cost per feature and per user, not just one monthly total.",
        bullets: ["Route easy tasks to small models", "Cap max output tokens and ask for brevity", "Batch APIs for offline work", "Count retries, loops and reasoning tokens"],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The cost and latency tuning loop",
        steps: [
          { label: "Log every call", detail: "Tokens, cost, TTFT, total time, feature" },
          { label: "Find the top spender", detail: "Group by feature, prompt and model" },
          { label: "Apply one lever", detail: "Shorter prompt, smaller model or caching" },
          { label: "Re-run evals", detail: "Quality must stay above the bar" },
          { label: "Ship and watch", detail: "Compare the new numbers with the old" },
        ],
      },
    ],
    examples: [
      {
        title: "Measuring TTFT and output speed",
        explanation: "Users say answers feel slow. Step 1: wrap the streaming call with time.perf_counter(). Step 2: record the moment the first chunk arrives (TTFT). Step 3: count chunks and divide by the decode time to get the output speed. The fake stream waits 0.8 seconds, then sends 50 chunks at about 50 per second. Real chunks can hold more than one token, so use the token usage from the final event for exact speed. If TTFT is the problem, look at prompt length and queueing; if decode is, shorten the answers or use a faster model.",
        code: {
          lang: "python",
          code: "import time\n\ndef fake_stream():\n    time.sleep(0.8)                 # waiting for the first token\n    for _ in range(50):\n        time.sleep(0.02)            # about 50 chunks per second\n        yield \"tok \"\n\nstart, ttft, n = time.perf_counter(), None, 0\nfor chunk in fake_stream():\n    if ttft is None:\n        ttft = time.perf_counter() - start\n    n += 1\ntotal = time.perf_counter() - start\nprint(f\"TTFT {ttft:.2f}s, total {total:.2f}s, {n / (total - ttft):.0f} chunks/s\")",
        },
      },
      {
        title: "What a 20-turn chat really costs",
        explanation: "A support chat has a 2,000-token system prompt, and each turn adds about 200 tokens of history (question plus answer). The new question is about 50 tokens. Step 1: add up the input tokens for all 20 turns: because history is resent every time, it comes to 79,000 input tokens, not 20 x 2,250. Step 2: with prompt caching, the repeated prefix from turn 2 onward is billed at a discount. With an example rate of 10% of the normal price (and ignoring any cache-write fee), you pay the equivalent of about 10,600 tokens. Check your provider's real rates.",
        code: {
          lang: "python",
          code: "SYSTEM, PER_TURN, NEW_MSG, TURNS = 2000, 200, 50, 20\nCACHED_RATE = 0.10  # example: cached input billed at 10%\n\nfull = cached = 0.0\nfor turn in range(1, TURNS + 1):\n    prefix = SYSTEM + PER_TURN * (turn - 1)\n    full += prefix + NEW_MSG\n    rate = CACHED_RATE if turn > 1 else 1.0\n    cached += prefix * rate + NEW_MSG\n\nprint(full, cached)  # 79000.0 10600.0 (billed-equivalent input tokens)",
        },
      },
    ],
    cheatSheet: [
      "Cost = input tokens x input price + output tokens x output price",
      "Latency is about TTFT + output tokens / tokens per second",
      "Report p50 and p95 latency, never only the average",
      "Count tokens with the model's own tokenizer or the API's usage numbers",
      "Prompt caching needs an identical prefix: stable content first, new message last",
      "Batch APIs are often around half price for work that can wait",
      "Set max output tokens and ask for concise answers to cut both cost and time",
      "Log cost per feature and per user, including retries and agent loops",
    ],
    quiz: [
      {
        q: "Which change usually cuts latency the most?",
        options: ["Removing 200 tokens from the prompt", "Using a longer system prompt", "Making the answer 400 tokens shorter", "Lowering temperature"],
        answer: 2,
        why: "Output is generated one token at a time, so fewer output tokens save the most time.",
      },
      {
        q: "Your system prompt starts with the current time. What happens to prompt caching?",
        options: ["The prefix changes on every call, so caching rarely hits", "Caching works normally", "The provider strips the time automatically", "Only output caching is affected"],
        answer: 0,
        why: "A cache hit needs an identical prefix, and anything that changes near the top breaks it.",
      },
      {
        q: "Why report p95 latency instead of the average?",
        options: ["It is always lower", "Providers bill by p95", "It removes slow calls from the data", "It shows how slow the slowest common experiences are, which an average hides"],
        answer: 3,
        why: "A few very slow calls barely move an average but matter a lot to users.",
      },
      {
        q: "Where do you get the token counts you are actually billed for?",
        options: ["Character count divided by 4", "The usage field in each API response", "The length of the Python string", "The number of words times 2"],
        answer: 1,
        why: "The provider reports exact input and output tokens in the response usage.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write cost_usd(tokens_in, tokens_out, price_in, price_out) with prices per million tokens, and compute the monthly cost of 2,000 calls a day with 1,500 input and 400 output tokens.",
        hint: "Divide tokens by 1e6 before multiplying by the price; a month is about 30 days.",
        solution: "def cost_usd(t_in, t_out, p_in, p_out):\n    return t_in / 1e6 * p_in + t_out / 1e6 * p_out\n\nper_call = cost_usd(1500, 400, p_in=1.00, p_out=4.00)  # example prices\nprint(round(per_call, 5), \"per call\")\nprint(round(per_call * 2000 * 30, 2), \"per month\")\n# 0.0031 per call, 186.0 per month",
      },
      {
        level: "medium",
        task: "Write a decorator or context manager that logs model, tokens in, tokens out, cost and latency for every call as one JSON line.",
        hint: "Use time.perf_counter() and read the token counts from the response usage.",
        solution: "import json, time\nfrom contextlib import contextmanager\n@contextmanager\ndef track(model: str, feature: str):\n    rec = {\"model\": model, \"feature\": feature}\n    start = time.perf_counter()\n    yield rec                     # caller sets rec[\"in\"], rec[\"out\"]\n    rec[\"ms\"] = round((time.perf_counter() - start) * 1000)\n    rec[\"usd\"] = cost_usd(rec[\"in\"], rec[\"out\"], *PRICES[model])\n    print(json.dumps(rec))\n# with track(\"small\", \"summary\") as r: resp = call(); r[\"in\"], r[\"out\"] = usage(resp)",
      },
      {
        level: "hard",
        task: "Build a simple router: send each request to a small model first, and escalate to a large model only when the small model's structured reply has confidence below 0.7. Measure cost and accuracy on 50 eval examples versus always using the large model.",
        hint: "Add a confidence field to the output schema, and log which model answered each item.",
        solution: "def route(item):\n    small = call(\"small\", item)          # returns label and confidence\n    if small.confidence >= 0.7:\n        return small.label, \"small\"\n    return call(\"large\", item).label, \"large\"\n# Run all 50 items through route() and through large only.\n# Compare: accuracy, total cost, share escalated.\n# Note: model-reported confidence is rough; check it against\n# the eval labels before trusting the 0.7 threshold.",
      },
    ],
    faq: [
      { q: "Why are output tokens more expensive than input tokens?", a: "Input is processed in parallel in one pass, while output needs a separate step for each token. That makes output more expensive for the provider to serve." },
      { q: "Is prompt caching the same as caching responses?", a: "No. Prompt caching reuses the provider's work on a repeated prompt start, and the model still writes a fresh answer. A response cache in your app returns a stored answer and skips the model completely." },
      { q: "How can I see my LLM spend per feature?", a: "Tag every call with a feature name in your logs or tracing tool, record tokens and cost per call, and group by that tag. Provider dashboards usually only show totals per key or model." },
    ],
  },
};

export default extra;
