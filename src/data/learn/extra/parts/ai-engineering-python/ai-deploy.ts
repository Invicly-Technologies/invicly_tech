import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "ai-deploy/llm-service": {
    plain: [
      "A notebook works for you alone. A service lets a website, a mobile app or another program use your AI feature over HTTP. FastAPI is a popular Python framework for this. You write normal Python functions, and FastAPI turns them into web endpoints.",
      "FastAPI leans on type hints. You describe the request body as a Pydantic model, and FastAPI checks every incoming request against it. If the text is missing or too long, the request is rejected with a clear error before your code even runs.",
      "Streaming makes chat feel fast. Instead of waiting ten seconds for the whole answer, the endpoint sends each piece of text as soon as the model produces it, and the user watches the reply appear word by word.",
      "Because every model call costs money, the endpoint must also know who is calling. A token or API key in the Authorization header identifies the caller, so strangers cannot use your service and you can apply per-user limits.",
    ],
    deepDive: [
      {
        heading: "One shared client and settings, created at startup",
        body: "Creating a new HTTP or SDK client on every request wastes time on new connections and TLS handshakes. Create one async client when the app starts and reuse it. FastAPI's lifespan feature is the place for this: an async context manager that runs setup code before the app takes requests and cleanup code when it shuts down.\n\nLoad settings the same way. The pydantic-settings package lets you declare a Settings class whose fields are read from environment variables, with types and defaults. If a required value like the API key is missing, the app fails at startup with a clear message, instead of failing on the first user request at 3 a.m.\n\nKeep the model name, prompt version and limits in settings too, so you can change them per environment without changing code.",
        bullets: ["FastAPI(lifespan=lifespan) runs setup once and cleanup at shutdown", "pydantic-settings reads typed config from environment variables", "Fail fast at startup when a secret is missing"],
      },
      {
        heading: "Streaming: plain text or Server-Sent Events",
        body: "StreamingResponse takes an async generator and sends each value it yields as soon as it is ready. The simplest format is plain text chunks. It works with curl -N, but the client cannot tell a normal end from an error, and there is no room for extra data such as citations.\n\nServer-Sent Events (SSE) add structure. Each event is one or more lines starting with data:, followed by a blank line, sent with the media type text/event-stream. Encode each chunk as JSON so a newline inside a token cannot break the framing, and send a final done event, or an error event, so the client knows how the stream ended.\n\nThe browser's EventSource API only supports GET requests, so chat front ends that POST a message usually read the stream with fetch instead. Reverse proxies like nginx may buffer responses; the X-Accel-Buffering: no header turns that off for nginx.",
        visual: {
          type: "flow",
          title: "Life of a streamed reply",
          steps: [
            { label: "Validate and auth", detail: "Before any model call" },
            { label: "Open model stream", detail: "Shared async client" },
            { label: "Yield SSE events", detail: "data: JSON chunk, blank line" },
            { label: "Client renders", detail: "Appends each chunk" },
            { label: "Finish", detail: "done event, or error event" },
          ],
        },
      },
      {
        heading: "Errors and disconnects in the middle of a stream",
        body: "Once the first chunk is sent, the HTTP status 200 is already on the wire. If the model fails halfway, you cannot change it to 500. So catch errors inside the generator and send an error event that the client can show, then end the stream. Log the failure with the request ID.\n\nUsers also close tabs mid-answer. When the client disconnects, keep in mind that the upstream model may keep generating, and you keep paying for those tokens. Use the SDK's stream as an async context manager, so it closes the upstream connection when your generator stops, and check await request.is_disconnected() inside the loop to stop early.\n\nSet timeouts on the upstream call: a connect timeout and a read timeout between chunks. A stream that stalls for a minute should end with an error event, not hang forever.",
        bullets: ["After the first chunk, report errors as an error event", "Close the upstream stream when the client leaves", "Use a read timeout between chunks, not only a total timeout"],
      },
      {
        heading: "Validation and auth that hold up",
        body: "Make the Pydantic model strict. Limit message length with Field(max_length=...), limit the number of history messages, and restrict roles with Literal['user', 'assistant'] so a caller cannot inject a fake system message. Set model_config = ConfigDict(extra='forbid') to reject unknown fields with a 422 instead of silently ignoring them.\n\nFor service-to-service calls, give each client its own API key, store only a hash of it, and compare with secrets.compare_digest, which takes the same time whether the first or last character differs. For browser apps, accept a token from your identity provider (often a JWT) and verify its signature and expiry. FastAPI's HTTPBearer helper reads the Authorization: Bearer header for you.\n\nAlways take the user's identity from the verified token, never from a user_id field in the body. Return 401 when credentials are missing or wrong, and 403 when they are valid but not allowed.",
      },
      {
        heading: "Running and testing the service",
        body: "In development, fastapi dev main.py (from the fastapi[standard] package) or uvicorn main:app --reload restarts on every code change. In production, run uvicorn without reload, binding to 0.0.0.0, and add --workers to use several CPU cores.\n\nAsync endpoints run on one event loop per worker. A single blocking call inside an async def, such as a synchronous SDK client or time.sleep, freezes every request on that worker. Use the async version of your SDK, or declare the endpoint with plain def so FastAPI runs it in a thread pool, or wrap the blocking call with asyncio.to_thread.\n\nTest without spending money. FastAPI's TestClient sends requests to the app in memory, and app.dependency_overrides lets you swap the real model client or auth for fakes, so tests are fast and deterministic.",
        bullets: ["uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4", "Never call blocking code inside async def", "TestClient plus dependency_overrides for free, fast tests"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What a request passes through in FastAPI",
        layers: [
          { label: "Uvicorn", detail: "ASGI server: sockets and HTTP" },
          { label: "Middleware", detail: "CORS, request ID, access logs" },
          { label: "Dependencies", detail: "Auth, settings, rate limits" },
          { label: "Pydantic validation", detail: "Bad body returns 422" },
          { label: "Your handler", detail: "Calls the model, streams the reply" },
        ],
      },
    ],
    examples: [
      {
        title: "An SSE chat endpoint with clean endings",
        explanation: "This endpoint streams a reply as Server-Sent Events. Step 1: an inner async generator reads tokens from your model stream (stream_reply is your own function around the SDK). Step 2: each token is JSON-encoded inside a data: line followed by a blank line. Step 3: if the client disconnected, stop reading so you stop paying. Step 4: a done event marks a normal end; an error event replaces a crash, because the 200 status was already sent. Step 5: headers turn off caching and nginx buffering.",
        code: {
          lang: "python",
          code: String.raw`import json
from fastapi import Request
from fastapi.responses import StreamingResponse
@app.post("/chat/stream", dependencies=[Depends(auth)])
async def chat_stream(body: ChatIn, request: Request):
    async def events():
        try:
            async for token in stream_reply(body.message):
                if await request.is_disconnected():
                    break
                yield f"data: {json.dumps({'token': token})}\n\n"
            yield "event: done\ndata: {}\n\n"
        except Exception:
            yield f"event: error\ndata: {json.dumps({'error': 'generation failed'})}\n\n"
    return StreamingResponse(events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})`,
        },
      },
      {
        title: "Testing validation without calling a model",
        explanation: "You want CI to prove that bad input never reaches the model. Step 1: import the app and its auth dependency. Step 2: override auth with a function that does nothing, so tests do not need a real token. Step 3: send an empty message and expect 422 from Pydantic. Step 4: send an unknown field and expect 422 too; this works because the ChatIn model sets extra='forbid'. Step 5: in a separate test without the override, send no Authorization header and expect a 401 or 403 from the real auth.",
        code: {
          lang: "python",
          code: "from fastapi.testclient import TestClient\nfrom main import app, auth\n\napp.dependency_overrides[auth] = lambda: None  # skip auth in these tests\nclient = TestClient(app)\n\ndef test_rejects_empty_message():\n    assert client.post(\"/chat\", json={\"message\": \"\"}).status_code == 422\n\ndef test_rejects_unknown_fields():\n    r = client.post(\"/chat\", json={\"message\": \"hi\", \"role\": \"system\"})\n    assert r.status_code == 422",
        },
      },
    ],
    cheatSheet: [
      "fastapi dev main.py for development; uvicorn main:app --host 0.0.0.0 --workers 4 in production",
      "Create one async client in the lifespan handler and reuse it for every request",
      "SSE event format: data: <json> then a blank line; media type text/event-stream",
      "After streaming starts the status is fixed, so send an error event instead of a 500",
      "Field(max_length=...) and ConfigDict(extra='forbid') stop oversized and unexpected input",
      "Compare API keys with secrets.compare_digest; store only their hashes",
      "Never call blocking code inside async def; use async SDKs or asyncio.to_thread",
      "app.dependency_overrides swaps the model and auth for fakes in tests",
    ],
    quiz: [
      {
        q: "The model fails halfway through a streamed reply. What can the endpoint still do?",
        options: ["Change the status to 500", "Send an error event in the stream and end it", "Restart the request automatically", "Nothing, the client will hang"],
        answer: 1,
        why: "The 200 status was sent with the first chunk, so the stream itself must carry the error.",
      },
      {
        q: "Your async endpoint uses a synchronous SDK client, and under load every request becomes slow. Why?",
        options: ["The blocking call freezes the event loop for all requests on that worker", "Pydantic validation is slow", "Streaming is disabled", "Uvicorn limits connections to one"],
        answer: 0,
        why: "Inside async def, a blocking call stops the loop from serving any other request.",
      },
      {
        q: "Why restrict history roles to Literal['user', 'assistant']?",
        options: ["It saves tokens", "It makes streaming faster", "Pydantic needs it", "So a caller cannot inject a fake system message"],
        answer: 3,
        why: "Accepting any role would let clients smuggle in instructions with system authority.",
      },
      {
        q: "Where should the endpoint get the user's identity from?",
        options: ["A user_id field in the JSON body", "The client's IP address", "The verified token in the Authorization header", "The model's reply"],
        answer: 2,
        why: "Only a verified credential proves who the caller is; body fields can be set to anything.",
      },
      {
        q: "Why is the browser's EventSource often not used for chat streaming?",
        options: ["It only supports GET requests, and chat usually POSTs a message body", "It cannot parse text", "It only works over HTTP/1.0", "It is deprecated in all browsers"],
        answer: 0,
        why: "EventSource cannot send a POST body, so chat front ends read the stream with fetch.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a ChatIn Pydantic model with a message of 1 to 4,000 characters, a history list of at most 20 items with role limited to user or assistant, and no extra fields allowed.",
        hint: "Use Field(min_length, max_length), Literal, and ConfigDict(extra='forbid').",
        solution: "from typing import Literal\nfrom pydantic import BaseModel, ConfigDict, Field\n\nclass Turn(BaseModel):\n    role: Literal[\"user\", \"assistant\"]\n    content: str = Field(max_length=8000)\n\nclass ChatIn(BaseModel):\n    model_config = ConfigDict(extra=\"forbid\")\n    message: str = Field(min_length=1, max_length=4000)\n    history: list[Turn] = Field(default_factory=list, max_length=20)",
      },
      {
        level: "medium",
        task: "Write a FastAPI auth dependency that reads a Bearer token with HTTPBearer, compares its SHA-256 hash to a set of stored key hashes in constant time, and returns the client name.",
        hint: "HTTPBearer returns credentials with a .credentials attribute; loop with secrets.compare_digest.",
        solution: "import hashlib, secrets\nfrom fastapi import Depends, HTTPException\nfrom fastapi.security import HTTPAuthorizationCredentials, HTTPBearer\n\nKEY_HASHES = {\"mobile-app\": \"<sha256 hex of its key>\"}\n\ndef auth(creds: HTTPAuthorizationCredentials = Depends(HTTPBearer())) -> str:\n    h = hashlib.sha256(creds.credentials.encode()).hexdigest()\n    for client, stored in KEY_HASHES.items():\n        if secrets.compare_digest(h, stored):\n            return client\n    raise HTTPException(status_code=401, detail=\"Invalid API key\")",
      },
      {
        level: "hard",
        task: "Add a lifespan handler that creates one shared httpx.AsyncClient with connect and read timeouts at startup, stores it on app.state, and closes it at shutdown.",
        hint: "Use contextlib.asynccontextmanager and httpx.Timeout(read, connect=...).",
        solution: "from contextlib import asynccontextmanager\nimport httpx\nfrom fastapi import FastAPI\n\n@asynccontextmanager\nasync def lifespan(app: FastAPI):\n    app.state.http = httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=5.0))\n    yield\n    await app.state.http.aclose()\n\napp = FastAPI(lifespan=lifespan)",
      },
    ],
    faq: [
      { q: "How do I stream LLM responses with FastAPI?", a: "Return a StreamingResponse built from an async generator that yields chunks as your SDK produces them. Use the text/event-stream media type and SSE framing if the client needs structured events." },
      { q: "Should my FastAPI endpoints be async def or def?", a: "Use async def with async clients for model calls. If a library only offers blocking calls, use plain def or asyncio.to_thread so the event loop is not blocked." },
      { q: "Why does FastAPI return 422?", a: "422 Unprocessable Content means the request body or parameters failed validation against your Pydantic model or type hints. The response lists which fields were wrong." },
      { q: "Why does my stream arrive all at once behind nginx?", a: "The proxy is buffering the response. Disable buffering for that route, for example with the X-Accel-Buffering: no response header or proxy_buffering off in nginx." },
    ],
  },

  "ai-deploy/prod-concerns": {
    plain: [
      "A normal web page costs almost nothing per visit. An LLM request can cost a noticeable fraction of a cent, or much more for long prompts. Put a public AI feature online without protection, and one script or one curious user can run up a large bill overnight.",
      "Caching is the first defence. If many users ask the same question, store the answer once and reuse it. The reply is instant and costs nothing.",
      "Rate limiting is the second. Each user or API key gets a fair allowance, such as 20 requests per minute. Above that, the service answers 429 Too Many Requests and says when to try again.",
      "Budgets are the safety net. Track what each user and the whole service spends, send alerts before limits are reached, and have a plan for what happens when they are: a smaller model, shorter answers, or a polite pause.",
    ],
    deepDive: [
      {
        heading: "Exact caching, done safely",
        body: "An exact cache stores answers under a key built from everything that affects the output: model, prompt version, generation parameters, the normalised input (trimmed, maybe lowercased) and, for RAG, the index version. Hash that list with SHA-256 to get a short key, and store the answer in Redis with a time to live (TTL), such as one day.\n\nThe big danger is caching personal answers. If the reply depends on who asks (their orders, their documents, their permissions), the user or tenant ID must be part of the key, or one person's answer can be served to another. When in doubt, do not cache that endpoint.\n\nAlso think about freshness. Including the index version in the key means re-indexing documents automatically retires old answers. Do not cache errors or partial streamed answers. Measure the hit rate: FAQ-heavy bots often see many repeats, while open-ended chat rarely repeats exactly.",
        bullets: ["Key: model, prompt version, params, index version, normalised input", "Add user or tenant ID whenever the answer is personal", "Set a TTL; never cache errors or cut-off answers"],
      },
      {
        heading: "Semantic caching and provider prompt caching",
        body: "A semantic cache embeds each new question and reuses a stored answer when a previous question is similar enough. It raises the hit rate, because how do I reset my password and password reset how? can share one answer. The risk is false matches: cancel my order and do not cancel my order have very similar embeddings. Use a strict similarity threshold, restrict it to FAQ-style questions, scope it per tenant, and test it with your eval set.\n\nProvider prompt caching is a different thing with a similar name. Many providers can reuse the computation for a long prompt prefix they have seen recently, such as your system prompt and documents, which makes those input tokens cheaper and faster. It never returns an old answer; the model still generates a fresh reply. To benefit, put stable content first in the prompt and the changing question last. Check your provider's docs for how it is enabled and priced.",
        visual: {
          type: "compare",
          title: "Three kinds of caching",
          columns: [
            { title: "Exact cache", points: ["Same input, same answer", "Very safe if the key is complete", "Hit rate depends on repeats"] },
            { title: "Semantic cache", points: ["Similar question, stored answer", "Higher hit rate", "Risk of wrong matches"] },
            { title: "Provider prompt cache", points: ["Reuses a repeated prompt prefix", "Cheaper, faster input tokens", "Still generates a new answer"] },
          ],
        },
      },
      {
        heading: "Rate limiting by requests, tokens and concurrency",
        body: "Counting requests is a start, but one request with a 50-page document can cost a hundred times more than a short question. Good LLM services limit several things per user or key: requests per minute, tokens per minute or per day, and concurrent requests (for example two streams at a time).\n\nCommon algorithms: a fixed window counts requests in each clock minute and is simplest. A sliding window smooths the burst at window edges. A token bucket holds up to N permits that refill at a steady rate, allowing short bursts while capping the average. In a multi-server deployment, keep counters in a shared store like Redis, not in process memory.\n\nWhen a limit is hit, return 429 with a Retry-After header giving seconds to wait. Different plans can get different limits. Protect yourself from the provider's limits too: a global semaphore or queue stops your own traffic from triggering their 429s.",
        visual: {
          type: "cycle",
          title: "How a token bucket works",
          steps: [
            { label: "Bucket holds N permits", detail: "Full bucket allows a burst" },
            { label: "Request takes a permit", detail: "Or a number equal to its tokens" },
            { label: "Bucket refills steadily", detail: "e.g. one permit every 3 seconds" },
            { label: "Empty bucket", detail: "429 with Retry-After until refill" },
          ],
        },
      },
      {
        heading: "Spend budgets, alerts and graceful degradation",
        body: "Compute the cost of every call from the token usage the API returns and a price table in config. Then add budget layers. Per request: cap input size and set a maximum output token limit. Per user: a daily spend limit. Per feature and per month: a team budget. Global: a hard spending limit or alert in the provider's console, if offered, set above your own limits as the last line of defence.\n\nAlert early and in steps, for example at 50%, 80% and 100% of a budget. Add an anomaly alert too: spend this hour is three times the usual hour. That catches a stuck agent loop or abuse long before the monthly total looks scary.\n\nDecide in advance what happens at the limit. Options include switching to a smaller, cheaper model, shortening answers, serving cached answers only, or pausing the feature with a clear message. A feature flag that changes this without a deploy is a cheap emergency brake.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Layers of cost defence",
        layers: [
          { label: "Input size limit", detail: "Reject huge prompts with 413 or 422" },
          { label: "Max output tokens", detail: "Caps each reply's cost" },
          { label: "Per-user rate and token limits", detail: "429 with Retry-After" },
          { label: "Per-user daily budget", detail: "Stops one account running away" },
          { label: "Global budget and alerts", detail: "Provider limit as a last resort" },
        ],
      },
    ],
    examples: [
      {
        title: "A Redis rate limiter as a FastAPI dependency",
        explanation: "You run three API servers, so counters must be shared. Step 1: build a key from the user ID and the current window number (time divided by 60). Step 2: INCR the key atomically; on the first hit, set it to expire after the window, so old keys clean themselves up. Step 3: over the limit, raise 429 with Retry-After set to the seconds left in this window. Step 4: add Depends(rate_limit) to the chat route. Limits are module constants, because extra parameters on a dependency would become query parameters anyone could change.",
        code: {
          lang: "python",
          code: "import time\nimport redis.asyncio as redis\nfrom fastapi import Depends, HTTPException\n\nr = redis.from_url(\"redis://localhost:6379\")\nLIMIT, WINDOW = 20, 60  # 20 requests per minute\n\nasync def rate_limit(user: str = Depends(current_user)) -> None:\n    key = f\"rl:{user}:{int(time.time() // WINDOW)}\"\n    count = await r.incr(key)\n    if count == 1:\n        await r.expire(key, WINDOW)\n    if count > LIMIT:\n        retry = WINDOW - int(time.time() % WINDOW)\n        raise HTTPException(429, \"Too many requests\", headers={\"Retry-After\": str(retry)})",
        },
      },
      {
        title: "A per-user daily spend budget with an early alert",
        explanation: "Each user may spend up to an example budget of 2 dollars per day. Step 1: before the model call, read today's total for the user and refuse with a clear message if it is spent. Step 2: after the call, compute the real cost from usage and add it with INCRBYFLOAT, which is atomic across servers. Step 3: let the key expire after two days so storage stays small. Step 4: when a user crosses 80% of the budget, send an alert (notify is your own function, for example a Slack webhook).",
        code: {
          lang: "python",
          code: "import datetime\nDAILY_BUDGET = 2.00  # dollars per user per day, example value\n\ndef spend_key(user: str) -> str:\n    return f\"spend:{user}:{datetime.date.today().isoformat()}\"\n\nasync def check_budget(user: str) -> None:\n    if float(await r.get(spend_key(user)) or 0) >= DAILY_BUDGET:\n        raise HTTPException(429, \"Daily usage limit reached. Please try again tomorrow.\")\n\nasync def record_spend(user: str, cost: float) -> None:\n    total = await r.incrbyfloat(spend_key(user), cost)\n    await r.expire(spend_key(user), 2 * 86400)\n    if total >= 0.8 * DAILY_BUDGET:\n        notify(f\"{user} has used {total / DAILY_BUDGET:.0%} of today's budget\")",
        },
      },
    ],
    cheatSheet: [
      "Cache key: model, prompt version, params, index version and input; add user ID if answers are personal",
      "Never cache errors or cut-off streamed answers; always set a TTL",
      "Semantic caches need a strict threshold: cancel and do not cancel look alike to embeddings",
      "Provider prompt caching cuts input cost for repeated prefixes; put stable content first",
      "Limit requests, tokens and concurrent streams per user, in a shared store like Redis",
      "Return 429 with a Retry-After header in seconds",
      "Cap max output tokens and input size on every request",
      "Alert at 50%, 80% and 100% of budget, plus on sudden hourly spikes",
    ],
    quiz: [
      {
        q: "A bot answers questions about each user's own orders. What must the cache key include?",
        options: ["Only the question text", "The user or tenant ID, plus model and prompt version", "The current time", "Nothing: do not use keys"],
        answer: 1,
        why: "Without the user in the key, one user's personal answer could be served to another.",
      },
      {
        q: "What does provider-side prompt caching do?",
        options: ["Returns a stored answer for repeat questions", "Stores answers in your Redis", "Reuses computation for a repeated prompt prefix, making those input tokens cheaper", "Caches images only"],
        answer: 2,
        why: "The model still generates a fresh answer; only processing of the repeated prefix is reused.",
      },
      {
        q: "Why limit tokens per minute and not only requests per minute?",
        options: ["Tokens are easier to count", "Requests cannot be counted in Redis", "Providers forbid request limits", "One huge request can cost as much as hundreds of small ones"],
        answer: 3,
        why: "Cost follows tokens, so request counts alone let a few large prompts blow the budget.",
      },
      {
        q: "Spend this hour is three times the normal hourly spend. What is the most likely value of an alert on this?",
        options: ["It catches runaway loops or abuse long before the monthly budget is hit", "It lowers prices", "It improves cache hit rate", "It has no value"],
        answer: 0,
        why: "Anomaly alerts react to sudden changes much faster than monthly totals do.",
      },
      {
        q: "Your service runs on four servers and each keeps rate limit counters in local memory. What goes wrong?",
        options: ["Nothing", "Each user effectively gets four times the limit", "Requests become slower", "Redis is required for HTTP"],
        answer: 1,
        why: "Each server counts separately, so a user spread across servers multiplies their allowance.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write cache_key(model, prompt_version, index_version, text, user=None) that normalises the text (trim, collapse spaces, lowercase) and returns a SHA-256 hex key, including the user only when given.",
        hint: "json.dumps a list of the parts so separators cannot collide.",
        solution: "import hashlib, json\n\ndef cache_key(model, prompt_version, index_version, text, user=None) -> str:\n    norm = \" \".join(text.split()).lower()\n    parts = [model, prompt_version, index_version, norm, user]\n    return \"cache:\" + hashlib.sha256(json.dumps(parts).encode()).hexdigest()",
      },
      {
        level: "medium",
        task: "Implement an in-memory token bucket class with capacity and refill_per_second, and a take(n) method that returns True if n permits were available.",
        hint: "On each call, add elapsed time times the refill rate, capped at capacity.",
        solution: "import time\n\nclass TokenBucket:\n    def __init__(self, capacity: float, refill_per_second: float):\n        self.capacity, self.rate = capacity, refill_per_second\n        self.tokens, self.last = capacity, time.monotonic()\n\n    def take(self, n: float = 1) -> bool:\n        now = time.monotonic()\n        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)\n        self.last = now\n        if self.tokens >= n:\n            self.tokens -= n; return True\n        return False",
      },
      {
        level: "hard",
        task: "Limit each user to two concurrent streams. A third request should get 429 immediately, and the slot must be released even if the stream errors or the client disconnects.",
        hint: "Count active streams per user and release in a finally block inside the generator.",
        solution: "from collections import defaultdict\nfrom fastapi import HTTPException\nactive: dict[str, int] = defaultdict(int)\nMAX_STREAMS = 2\n\ndef acquire(user: str) -> None:\n    if active[user] >= MAX_STREAMS:\n        raise HTTPException(429, \"Too many open streams\", headers={\"Retry-After\": \"5\"})\n    active[user] += 1\n\nasync def guarded(user: str, gen):\n    try:\n        async for chunk in gen: yield chunk\n    finally:\n        active[user] -= 1  # runs on success, error or disconnect",
      },
    ],
    faq: [
      { q: "How do I reduce LLM API costs in production?", a: "Cache repeated answers, use provider prompt caching for long stable prefixes, cap input and output tokens, route simple requests to smaller models, and set per-user limits and budgets." },
      { q: "What HTTP status code should a rate limit return?", a: "429 Too Many Requests, with a Retry-After header telling the client how many seconds to wait." },
      { q: "Is semantic caching safe?", a: "It can serve a wrong answer when two questions look similar but mean different things. Use a strict threshold, limit it to general FAQ-style questions and test it before enabling it widely." },
      { q: "What should happen when a user reaches their budget?", a: "Tell them clearly and when it resets, and optionally fall back to a cheaper model or cached answers. Never fail silently." },
    ],
  },

  "ai-deploy/open-models": {
    plain: [
      "Open-weight models are models whose trained weights you can download and run yourself, on a laptop, a workstation or your own server. Popular families include Llama, Mistral, Qwen and Gemma. You pay for hardware and electricity instead of per token, and your data never leaves your machine.",
      "Tools make this easy. Ollama downloads a model with one command and serves it on your computer. llama.cpp is the fast engine underneath many tools, and you can run it directly for more control.",
      "The big limit is memory. A model must fit in your RAM, or ideally your GPU's memory, to run at a useful speed. Quantisation shrinks models by storing each weight with fewer bits, so a model that needs 16 GB can run in about 5 GB with a small loss in quality.",
      "Smart apps keep model calls behind one interface. Then you can switch between a hosted API and a local model with a config change, and compare both on your own eval set before deciding.",
    ],
    deepDive: [
      {
        heading: "How much memory a model needs",
        body: "The rough rule is parameters times bytes per weight. At 16-bit precision each weight takes 2 bytes, so an 8-billion-parameter (8B) model needs about 16 GB just for weights. At 8-bit it is about 8 GB, and at 4-bit about 4 to 5 GB, because some layers stay at higher precision and there is metadata.\n\nOn top of the weights comes the KV cache, the memory that holds the attention state for the tokens in the context. It grows with context length and with the number of requests served at once, so a long 32,000-token context can need several extra gigabytes.\n\nFor good speed the whole model should fit in GPU memory (VRAM). If it does not fit, tools can keep some layers on the CPU, but generation slows down a lot. Apple Silicon Macs share one pool of memory between CPU and GPU, which is why they run fairly large models well.",
        bullets: ["16-bit: about 2 GB per billion parameters", "8-bit: about 1 GB per billion parameters", "4-bit: about 0.5 to 0.6 GB per billion parameters", "Add room for the KV cache: more context, more memory"],
      },
      {
        heading: "Quantisation: picking a size",
        body: "Quantisation stores weights with fewer bits. llama.cpp's GGUF files use names that describe the method. Q8_0 is 8-bit and nearly indistinguishable from the original for most tasks. Q6_K and Q5_K_M are a little smaller with very small losses. Q4_K_M is a popular balance of size and quality. Below 4 bits, quality usually drops noticeably, and small models suffer more than large ones.\n\nA useful rule of thumb: a bigger model at 4-bit often beats a smaller model at 8-bit for the same memory. But rules of thumb are not data. Your task might need precise numbers, strict JSON or a language the model rarely saw, and quantisation can hurt exactly those.\n\nIn Ollama, model tags pick the size and often the quantisation, and the model page lists the available tags. Run your eval set on two or three options and pick the smallest one that meets your quality bar.",
      },
      {
        heading: "Ollama, llama.cpp and vLLM in practice",
        body: "Ollama is the easiest start. ollama pull downloads a model, ollama run chats with it, ollama list shows downloaded models, and ollama ps shows what is loaded and how much runs on GPU or CPU. It serves an HTTP API on port 11434, with its own endpoints like /api/chat and an OpenAI-compatible endpoint under /v1. Set OLLAMA_HOST to listen on another address. A Modelfile sets a system prompt and parameters such as num_ctx, the context length; Ollama's default context is often much smaller than the model's maximum, so set it for RAG.\n\nllama.cpp gives finer control. Its llama-server program loads a GGUF file and serves an OpenAI-compatible API, with flags for context size (-c) and how many layers go to the GPU (-ngl).\n\nFor production GPU serving to many users, vLLM is common. It batches requests continuously and manages KV cache memory efficiently, giving much higher throughput than a single-user tool.",
        visual: {
          type: "tree",
          title: "Local and self-hosted runtimes",
          root: "Run an open model",
          children: [
            { label: "Ollama", children: ["One-command install and pull", "API on port 11434", "Great for laptops and dev"] },
            { label: "llama.cpp", children: ["GGUF files, CPU and GPU", "llama-server, OpenAI-compatible", "Fine control with flags"] },
            { label: "vLLM", children: ["GPU servers", "Continuous batching", "High throughput for many users"] },
          ],
        },
      },
      {
        heading: "One interface, many backends",
        body: "Wrap model access in a small interface, for example a Protocol with an async chat(messages) method that returns text. Write one adapter per backend: your hosted provider's SDK, Ollama, llama-server. The rest of the app only knows the interface, and a setting chooses the adapter.\n\nMany local servers speak an OpenAI-compatible API, so one client pointed at a different base URL often works for several backends. Do not assume features match, though. Tool calling, structured output and long contexts depend on the model and the server; a small local model may ignore tool schemas a large hosted one follows perfectly.\n\nKeep prompts per model if needed. A prompt tuned for one model family may need changes for another, so version prompts by model and let the eval set decide.",
        visual: {
          type: "layers",
          title: "Swappable model backends",
          layers: [
            { label: "App code", detail: "RAG, tools, API endpoints" },
            { label: "ChatModel interface", detail: "async chat(messages) returns text" },
            { label: "Adapters", detail: "Hosted SDK, Ollama, llama-server" },
            { label: "Backends", detail: "Provider API or local process" },
          ],
        },
      },
      {
        heading: "Comparing quality, speed, cost and licence",
        body: "Compare like for like. Run the same eval set through each model with the same prompt version and record quality scores, time to first token, tokens per second and peak memory. ollama run --verbose prints timing statistics, including the generation rate, after each reply.\n\nCost comparisons need honest numbers. A local model has no per-token bill, but hardware, power and your time are real costs, and a GPU server sitting idle at night still costs money. Hosted APIs are often cheaper at low volume; self-hosting can win at steady high volume or when data must stay in-house.\n\nCheck the licence before shipping. Some open-weight models use permissive licences such as Apache 2.0, while others use custom licences with conditions on use or scale. Read the licence of the exact model you deploy.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Swapping in a local model, step by step",
        steps: [
          { label: "Install a runtime", detail: "Ollama or llama.cpp" },
          { label: "Pull a quantised model", detail: "Small enough for your memory" },
          { label: "Write an adapter", detail: "Same interface as the hosted one" },
          { label: "Run the eval set", detail: "Both models, same prompts" },
          { label: "Compare", detail: "Quality, speed, memory, cost" },
          { label: "Choose per use case", detail: "Local for some tasks, hosted for others" },
        ],
      },
    ],
    examples: [
      {
        title: "An Ollama adapter behind a shared interface",
        explanation: "Your app already calls a hosted model through a ChatModel interface. Step 1: define the interface with typing.Protocol, so any class with a matching chat method fits. Step 2: write OllamaChat, which posts the messages to Ollama's /api/chat endpoint with stream set to false. Step 3: the reply's message.content field holds the text. Step 4: choose the adapter from config, for example MODEL_BACKEND=ollama, and the rest of the app does not change. In a real service, reuse one AsyncClient instead of opening one per call.",
        code: {
          lang: "python",
          code: "from typing import Protocol\nimport httpx\n\nclass ChatModel(Protocol):\n    async def chat(self, messages: list[dict]) -> str: ...\n\nclass OllamaChat:\n    def __init__(self, model: str = \"llama3.2\", url: str = \"http://localhost:11434\"):\n        self.model, self.url = model, url\n\n    async def chat(self, messages: list[dict]) -> str:\n        async with httpx.AsyncClient(timeout=120) as client:\n            r = await client.post(f\"{self.url}/api/chat\", json={\"model\": self.model, \"messages\": messages, \"stream\": False})\n            r.raise_for_status()\n            return r.json()[\"message\"][\"content\"]",
        },
      },
      {
        title: "A custom model with a bigger context, and a speed check",
        explanation: "Your RAG prompts are about 6,000 tokens, but answers seem to ignore the first chunks. The cause: the context length was too small, so the start of the prompt was cut off. Step 1: write a Modelfile that starts from the base model and sets num_ctx to 8192 and a low temperature. Step 2: create a named model from it. Step 3: run it with --verbose to see timing, including the eval rate in tokens per second. Step 4: ollama ps shows how much memory the model uses and whether it runs fully on the GPU. A larger context uses more memory, so check that it still fits.",
        code: {
          lang: "bash",
          code: `cat > Modelfile <<'EOF'
FROM llama3.2
PARAMETER num_ctx 8192
PARAMETER temperature 0.2
SYSTEM """You answer questions about our internal docs. Be concise."""
EOF
ollama create docs-bot -f Modelfile
ollama run docs-bot --verbose "Explain RAG in one sentence"
ollama ps    # memory used and the GPU/CPU split`,
        },
      },
    ],
    cheatSheet: [
      "Memory for weights is about parameters x bytes per weight: 8B at 4-bit is roughly 5 GB",
      "Q4_K_M is a popular size and quality balance; Q8_0 is close to the original",
      "ollama pull, run, list, ps; the API listens on localhost:11434",
      "Ollama has an OpenAI-compatible endpoint under /v1 as well as /api/chat",
      "Set num_ctx in a Modelfile when prompts are long; defaults are often small",
      "llama-server -m model.gguf -c 8192 -ngl 99 serves an OpenAI-compatible API",
      "Use vLLM for high-throughput GPU serving to many users",
      "Compare models on your own eval set and read each model's licence before shipping",
    ],
    quiz: [
      {
        q: "Roughly how much memory do the weights of an 8B model need at 16-bit precision?",
        options: ["About 4 GB", "About 8 GB", "About 16 GB", "About 64 GB"],
        answer: 2,
        why: "8 billion weights at 2 bytes each is about 16 GB.",
      },
      {
        q: "A local model seems to ignore the first part of a long RAG prompt. What is a likely cause?",
        options: ["The context length (num_ctx) is set smaller than the prompt", "The model is too accurate", "Quantisation removed the system prompt", "Port 11434 is closed"],
        answer: 0,
        why: "When the prompt exceeds the configured context, the earliest tokens are dropped.",
      },
      {
        q: "Which tool is designed for high-throughput GPU serving to many concurrent users?",
        options: ["ollama list", "A Modelfile", "GGUF", "vLLM"],
        answer: 3,
        why: "vLLM uses continuous batching and efficient KV cache management for many parallel requests.",
      },
      {
        q: "Why keep model calls behind one interface such as ChatModel?",
        options: ["It makes models more accurate", "You can switch between hosted and local backends without changing the app", "Ollama requires it", "It removes the need for evals"],
        answer: 1,
        why: "The app depends only on the interface, so a config change picks the backend.",
      },
      {
        q: "Your 4-bit local model passes 70% of evals while the hosted model passes 88%. What is the most sensible next step?",
        options: ["Ship the local model anyway", "Delete the eval set", "Try a larger or less-quantised local model, or keep hosted for this task", "Raise the temperature"],
        answer: 2,
        why: "Let the eval set guide the choice; a larger quant or model may close the gap, or hosted remains the right call.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install Ollama, pull a small model, ask it one question from the terminal and once over HTTP with curl, and note the generation speed with --verbose.",
        hint: "The HTTP endpoint is /api/generate or /api/chat on port 11434.",
        solution: "ollama pull llama3.2\nollama run llama3.2 --verbose \"What is a vector database?\"\ncurl http://localhost:11434/api/chat -d '{\n  \"model\": \"llama3.2\", \"stream\": false,\n  \"messages\": [{\"role\": \"user\", \"content\": \"What is a vector database?\"}]\n}'",
      },
      {
        level: "medium",
        task: "Write estimate_gb(params_billion, bits) that estimates weight memory in GB with a 10% overhead, and print estimates for 8B and 70B at 16, 8 and 4 bits.",
        hint: "bytes = params x bits / 8; divide by 1e9 for GB.",
        solution: "def estimate_gb(params_billion: float, bits: int, overhead: float = 0.10) -> float:\n    return round(params_billion * bits / 8 * (1 + overhead), 1)\n\nfor size in (8, 70):\n    print(size, \"B:\", {b: estimate_gb(size, b) for b in (16, 8, 4)})\n# 8 B: {16: 17.6, 8: 8.8, 4: 4.4}\n# 70 B: {16: 154.0, 8: 77.0, 4: 38.5}",
      },
      {
        level: "hard",
        task: "Write a benchmark that runs the same list of prompts through two ChatModel adapters and reports, for each, the average latency and how many answers pass a checker function.",
        hint: "Time each call with time.perf_counter and collect pass counts per model.",
        solution: "import time\n\nasync def compare(models: dict, cases: list[dict], check) -> None:\n    for name, model in models.items():\n        passed, total_s = 0, 0.0\n        for c in cases:\n            t0 = time.perf_counter()\n            out = await model.chat([{\"role\": \"user\", \"content\": c[\"input\"]}])\n            total_s += time.perf_counter() - t0\n            passed += bool(check(out, c))\n        print(f\"{name}: {passed}/{len(cases)} passed, {total_s / len(cases):.2f}s avg\")",
      },
    ],
    faq: [
      { q: "Can I run an LLM on my laptop without a GPU?", a: "Yes, small quantised models run on a CPU with tools like Ollama or llama.cpp, just more slowly. A few billion parameters at 4-bit is a comfortable start on a laptop." },
      { q: "Are open-weight models as good as hosted frontier models?", a: "The best open models are strong, but the largest hosted models usually still lead on hard tasks. For narrow tasks a smaller open model can be good enough; measure on your eval set." },
      { q: "What is the difference between Ollama and llama.cpp?", a: "llama.cpp is an efficient inference engine and set of tools for GGUF models. Ollama is a friendlier wrapper that handles downloading, model management and a local API." },
      { q: "Is open-weight the same as open source?", a: "Not always. Open-weight means you can download the weights; the licence may still restrict use, and the training data and code are often not released." },
    ],
  },

  "ai-deploy/containerise": {
    plain: [
      "Your service works on your laptop because your laptop has the right Python version, the right packages and your environment variables. A container packages the app with its exact Python and libraries into one image, so it runs the same on any machine that has Docker or a container platform.",
      "A Dockerfile is the recipe for that image. Each line adds a layer: start from a small Python base, install dependencies, copy your code, and say how to start the server. Docker reuses unchanged layers, so rebuilds after small code changes are fast.",
      "Secrets never go into the image. Anyone who can pull an image can read everything inside it. API keys arrive at runtime as environment variables, set by the hosting platform or a secrets manager.",
      "Once running, the platform needs to know the app is healthy. A small /health endpoint lets it restart a stuck container, and logs written to standard output let you see what happened.",
    ],
    deepDive: [
      {
        heading: "A production Dockerfile, line by line",
        body: "Start from a pinned slim base image such as python:3.12-slim, not a moving latest tag. Set PYTHONUNBUFFERED=1 so logs appear immediately instead of sitting in a buffer, and PYTHONDONTWRITEBYTECODE=1 to skip .pyc files.\n\nCopy requirements.txt and install dependencies before copying the rest of the code. Docker caches layers in order, so editing main.py then reuses the slow install layer. Use pip install --no-cache-dir to keep the image smaller.\n\nIf some packages need compilers to build, use a multi-stage build: build wheels in a first stage that has the tools, then copy only the wheels into a clean final stage. Create a normal user and switch to it with USER, so a bug in your app does not run as root.\n\nWrite CMD in exec form, the JSON array style. Then uvicorn runs as process 1 and receives the SIGTERM signal the platform sends on shutdown, so it can finish open requests.",
        visual: {
          type: "layers",
          title: "Image layers, from rarely to often changed",
          layers: [
            { label: "Base image", detail: "python:3.12-slim, pinned" },
            { label: "System packages", detail: "Only what you truly need" },
            { label: "Python dependencies", detail: "Cached until requirements change" },
            { label: "App code", detail: "Changes on almost every build" },
            { label: "Runtime settings", detail: "USER, EXPOSE, HEALTHCHECK, CMD" },
          ],
        },
      },
      {
        heading: "Keeping secrets and junk out of the image",
        body: "COPY . . copies everything in the build folder unless a .dockerignore file excludes it. Without one, your .env file with real API keys, the .git history, virtual environments and local data can all end up inside the image. Add .env, .git, .venv, __pycache__, notebooks and eval output folders to .dockerignore.\n\nDo not pass secrets with ARG or ENV in the Dockerfile either. Their values can be seen with docker history or docker inspect. Secrets belong at runtime: docker run -e or --env-file locally, and the platform's secret store in the cloud, which injects them as environment variables or files.\n\nIf the build itself needs a secret, for example a token for a private package index, use BuildKit secret mounts (RUN --mount=type=secret,id=...). The secret is available to that one command and is not saved in any layer.",
        bullets: [".dockerignore: .env, .git, .venv, __pycache__, data folders", "Never put secrets in ARG or ENV lines", "Runtime: -e, --env-file or the platform's secret store", "Build-time: RUN --mount=type=secret"],
      },
      {
        heading: "Health checks and graceful shutdown",
        body: "Platforms ask two different questions. Liveness: is the process alive, or should it be restarted? Readiness: can it serve traffic right now? A liveness endpoint like /health should be cheap and check only the process itself. A readiness check may also confirm the database connection or that the index has loaded.\n\nDo not call the LLM provider in either check. Probes run every few seconds, so that costs money, and a short provider outage would make the platform restart every container, turning a small problem into a full outage.\n\nThe Dockerfile HEALTHCHECK instruction is used by Docker and Docker Compose. Kubernetes and many cloud platforms ignore it and use their own probe settings, so configure health checks there too.\n\nOn deploys, the platform sends SIGTERM and waits a grace period before killing the container. Long LLM streams need a grace period longer than a typical reply, or users will see answers cut off at every release.",
        visual: {
          type: "compare",
          title: "Liveness vs readiness",
          columns: [
            { title: "Liveness", points: ["Is the process alive?", "Cheap, no external calls", "Failure: restart the container"] },
            { title: "Readiness", points: ["Can it serve traffic now?", "May check DB and index", "Failure: stop sending traffic"] },
          ],
        },
      },
      {
        heading: "Deploying to a cloud host",
        body: "The flow is the same on most platforms. Build the image in CI, tag it with the git commit SHA (not only latest, so you always know what is running and can roll back), push it to a registry, and deploy that exact tag.\n\nManaged container platforms such as Google Cloud Run, AWS App Runner or ECS, Azure Container Apps, Fly.io and Render run the image for you. Read their rules carefully. Cloud Run, for example, tells the container which port to listen on through the PORT environment variable (8080 by default). Exec-form CMD does not expand variables, so to use $PORT you start the server through sh -c or read the variable in Python.\n\nCheck request timeouts and idle timeouts, since long streams can hit them. Platforms that scale to zero save money but add cold starts, so set a minimum of one instance if first-request latency matters.",
      },
      {
        heading: "Logs that work in containers",
        body: "Containers should not write log files. Write logs to standard output and standard error, and let the platform collect, store and search them. Files inside a container disappear when it is replaced, and nobody reads them anyway.\n\nWrite one structured JSON line per event, with fields such as time, level, request ID, trace ID, route, status, latency, model, tokens and cost. JSON is easy for log platforms to parse and filter, and the trace ID links a log line to its trace.\n\nTurn off uvicorn's default access log if you write your own richer request log, so each request is not logged twice. And apply the same redaction rules as for traces: do not log raw API keys, full prompts with personal data, or authorization headers.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "From commit to live traffic",
        steps: [
          { label: "Commit", detail: "Pull request merged to main" },
          { label: "CI checks", detail: "Unit tests and eval gate" },
          { label: "Build image", detail: "Tagged with the git SHA" },
          { label: "Push to registry", detail: "Immutable, versioned image" },
          { label: "Deploy revision", detail: "Secrets injected at runtime" },
          { label: "Health checks pass", detail: "Traffic shifts to the new version" },
        ],
      },
    ],
    examples: [
      {
        title: "A multi-stage Dockerfile with a health check",
        explanation: "Step 1: the build stage turns requirements.txt into wheels, so any compilers stay out of the final image. Step 2: the final stage starts clean, sets the two Python environment variables, installs only the wheels and creates a non-root user. Step 3: copy the code last so code changes reuse cached layers. Step 4: the HEALTHCHECK uses Python's urllib, because slim images do not include curl; urlopen raises on an error status, so the check fails. Step 5: run with docker run --env-file .env -p 8000:8000 my-llm-api, keeping secrets outside the image.",
        code: {
          lang: "dockerfile",
          code: `FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app
COPY --from=build /wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels && useradd -m appuser
COPY . .
USER appuser
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
        },
      },
      {
        title: "Local stack with Docker Compose and pgvector",
        explanation: "For development you want the API and a Postgres database with pgvector, started with one command. Step 1: the api service builds from your Dockerfile and reads secrets from .env at runtime; .dockerignore keeps that file out of the image. Step 2: the db service uses the pgvector image with a development-only password. Step 3: a healthcheck runs pg_isready, and depends_on with condition service_healthy makes the API wait until the database is accepting connections. Step 4: docker compose up --build starts both.",
        code: {
          lang: "yaml",
          code: `services:
  api:
    build: .
    ports: ["8000:8000"]
    env_file: .env   # read at runtime, never copied into the image
    depends_on:
      db:
        condition: service_healthy
  db:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_PASSWORD: dev-only
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s`,
        },
      },
    ],
    cheatSheet: [
      "Copy requirements.txt and install before COPY . . so the dependency layer is cached",
      "Add .env, .git, .venv and __pycache__ to .dockerignore",
      "Never put secrets in ARG or ENV; inject them at runtime",
      "Set PYTHONUNBUFFERED=1 so logs appear immediately",
      "Use exec-form CMD so the server gets SIGTERM and can shut down gracefully",
      "Tag images with the git SHA so you know what runs and can roll back",
      "Health checks must not call the LLM provider",
      "Log JSON lines to stdout with request ID and trace ID; no log files",
    ],
    quiz: [
      {
        q: "You edit one line in main.py and the rebuild reinstalls every dependency. What is the likely cause?",
        options: ["The base image is too big", "COPY . . comes before the pip install step", "PYTHONUNBUFFERED is not set", "The image runs as root"],
        answer: 1,
        why: "Any code change invalidates the COPY layer and every layer after it, including the install.",
      },
      {
        q: "Why should a liveness check not call the LLM provider?",
        options: ["Probes run often, cost money, and a provider outage would restart every container", "The provider blocks health checks", "It would be too fast", "Docker forbids outbound calls"],
        answer: 0,
        why: "Liveness should reflect your process; tying it to an external API turns their blip into your outage.",
      },
      {
        q: "A teammate passes the API key with ARG in the Dockerfile. What is the problem?",
        options: ["ARG values are encrypted", "The build will fail", "Nothing, ARG is safe", "The value can be read from the image history"],
        answer: 3,
        why: "Build arguments and ENV values are visible with docker history or docker inspect.",
      },
      {
        q: "Your app on Cloud Run fails to start, though it works locally on port 8000. What should you check first?",
        options: ["The Python version", "The eval thresholds", "That it listens on the port given in the PORT environment variable", "The .dockerignore file"],
        answer: 2,
        why: "Cloud Run sends traffic to the port in PORT (8080 by default), so a fixed 8000 does not receive requests.",
      },
      {
        q: "Users see streamed answers cut off during every deploy. What helps most?",
        options: ["A bigger image", "A shutdown grace period longer than a typical stream, with graceful handling of SIGTERM", "Running as root", "Disabling health checks"],
        answer: 1,
        why: "The old container needs time to finish open streams before it is killed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a .dockerignore for a Python LLM service that keeps secrets, Git data, virtual environments, caches and local data out of the image.",
        hint: "One pattern per line; directories can end with a slash.",
        solution: ".env\n.env.*\n.git/\n.venv/\n__pycache__/\n*.pyc\n.pytest_cache/\nnotebooks/\ndata/\nevals/outputs/",
      },
      {
        level: "medium",
        task: "Add /health (liveness) and /ready (readiness) endpoints to a FastAPI app. Readiness should check the database with a cheap query and return 503 if it fails; neither should call the model.",
        hint: "Return a JSONResponse with status_code 503 on failure.",
        solution: "from fastapi.responses import JSONResponse\n\n@app.get(\"/health\")\nasync def health():\n    return {\"status\": \"ok\"}\n\n@app.get(\"/ready\")\nasync def ready():\n    try:\n        await app.state.db.execute(\"SELECT 1\")\n    except Exception:\n        return JSONResponse({\"status\": \"db unavailable\"}, status_code=503)\n    return {\"status\": \"ready\"}",
      },
      {
        level: "hard",
        task: "Make the container listen on the PORT environment variable when it is set (as on Cloud Run) and on 8000 otherwise, while still receiving SIGTERM directly.",
        hint: "Use sh -c with exec so the shell is replaced by uvicorn.",
        solution: "# In the Dockerfile:\nCMD [\"sh\", \"-c\", \"exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}\"]\n# sh expands ${PORT:-8000}; exec replaces the shell with uvicorn,\n# so uvicorn becomes PID 1 and receives SIGTERM on shutdown.",
      },
    ],
    faq: [
      { q: "How do I pass API keys to a Docker container?", a: "At runtime: docker run -e NAME=value or --env-file locally, and your cloud platform's secrets manager in production. Never bake them into the image." },
      { q: "Should I use python:3.12-slim or alpine for a Python service?", a: "Slim is usually the safer choice. Alpine uses musl instead of glibc, so many Python packages need compiling, which makes builds slower and can cause subtle issues." },
      { q: "Why is my container's print output not showing in the logs?", a: "Python buffers output when it is not attached to a terminal. Set PYTHONUNBUFFERED=1 or use a logger that flushes, and write to stdout or stderr." },
      { q: "Do I need Kubernetes to deploy an LLM app?", a: "No. Managed container platforms run a single image with secrets, health checks and autoscaling, which is plenty for most apps. Kubernetes helps when you run many services and need fine control." },
    ],
  },
};

export default extra;
