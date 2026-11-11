import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "ai-foundations/how-llms-work": {
    plain: [
      "A large language model (LLM) is a program trained on a huge amount of text. Its one skill is guessing what comes next. Give it the start of a sentence and it scores every possible next piece of text, picks one, adds it to the end, and guesses again. A long answer is just this small step repeated hundreds of times.",
      "The model does not read letters or whole words. It reads tokens: small pieces of text, such as \"un\", \"believ\" and \"able\". Common words are often one token, rare words are split into several. Everything is counted in tokens: how much you can send, how fast the answer comes, and how much you pay.",
      "A model can only look at a limited number of tokens at once. This limit is the context window. Your instructions, the chat so far, any documents you paste and the answer it writes must all fit inside it. The model also has no memory between requests, so your app sends the conversation again every time.",
      "Because the model writes what sounds likely, not what it has checked, it can produce confident answers that are wrong. This is called hallucination. It is not a rare bug; it is how the system works. Good AI apps give the model real sources to read and check its answers.",
    ],
    deepDive: [
      {
        heading: "Tokenisation: how text becomes numbers",
        body: "Before the model sees anything, a tokenizer cuts the text into pieces from a fixed vocabulary, usually tens of thousands to a few hundred thousand entries. Most modern tokenizers use byte pair encoding (BPE): start from single bytes, then repeatedly merge the most common neighbouring pairs seen in training data. Frequent words become one token; rare words, names and typos become several.\n\nEach token maps to an integer ID, and the model only works with those IDs. A space is usually part of the token, so \" cat\" and \"cat\" can be different tokens. This explains some odd behaviour: models are weak at counting letters in a word because they never see the letters, only the pieces.\n\nFor English, a rough rule is 1 token for about 4 characters, or about 0.75 words. Code, numbers and many non-English languages use more tokens for the same meaning, so they cost more and fill the context faster. Each model family has its own tokenizer, so counts differ between providers.",
        bullets: ["About 4 characters or 0.75 English words per token", "Same text, different model: different token count", "Numbers are often split into several tokens", "Non-Latin scripts usually need more tokens"],
        visual: {
          type: "flow",
          title: "From text to token IDs",
          steps: [
            { label: "Raw text", detail: "Hello world!" },
            { label: "Pre-split", detail: "Split near spaces and punctuation" },
            { label: "Merge pieces", detail: "BPE joins common byte pairs" },
            { label: "Look up IDs", detail: "Each piece becomes an integer" },
            { label: "Into the model", detail: "IDs become vectors the model reads" },
          ],
        },
      },
      {
        heading: "What happens inside one prediction",
        body: "Each token ID is turned into a vector (a list of numbers). These vectors pass through many transformer layers. In each layer, an attention step lets every position look back at the earlier tokens and decide which ones matter for it, then a feed-forward step transforms the result. The last layer produces one score, called a logit, for every token in the vocabulary.\n\nGeneration has two phases. In prefill, the model reads your whole prompt at once, in parallel, which is fast per token. In decode, it produces the answer one token at a time, because each new token depends on the one before. The model keeps the work it already did for earlier tokens in a KV cache so it does not redo it. This is why long outputs, not long inputs, usually dominate the waiting time.",
        visual: {
          type: "layers",
          title: "Inside a forward pass",
          layers: [
            { label: "Token IDs", detail: "Integers from the tokenizer" },
            { label: "Embeddings", detail: "Each ID becomes a vector" },
            { label: "Transformer layers", detail: "Attention plus feed-forward, repeated many times" },
            { label: "Logits", detail: "One score per vocabulary token" },
            { label: "Sampling", detail: "Turn scores into one chosen token" },
          ],
        },
      },
      {
        heading: "Context windows in practice",
        body: "The context window counts input and output together. If a model has a 128,000 token window and your prompt uses 120,000, at most 8,000 are left for the answer. Most APIs also have a separate max output tokens setting, and they return an error if the request is too long rather than quietly cutting it.\n\nEverything counts toward the limit: the system prompt, every earlier message, pasted documents, tool definitions and tool results. Long chats therefore grow until something must be dropped. Apps handle this by keeping only recent turns, summarising old ones, or retrieving just the relevant parts.\n\nBigger is not free. Standard attention work grows faster than the length (roughly with its square), so long prompts are slower and cost more. Models can also miss facts placed in the middle of a very long prompt. Send what is relevant, not everything you have.",
        bullets: ["Input plus output must fit in the window", "Tool definitions and results use tokens too", "Long prompts cost more and respond slower", "Put key instructions where they are easy to find"],
      },
      {
        heading: "How temperature and top-p really work",
        body: "The logits are turned into probabilities with a function called softmax. Temperature divides the logits before softmax. A temperature below 1 makes the top choice even more likely; above 1 it flattens the odds so unlikely tokens get picked more often. Temperature 0 effectively means always take the top token (greedy decoding).\n\nTop-p, also called nucleus sampling, then keeps only the smallest group of tokens whose probabilities add up to p, and draws from that group. With p = 0.9, a long tail of strange tokens is cut off. Top-k is a simpler cousin that keeps the k most likely tokens.\n\nProviders usually advise changing temperature or top-p, not both. Even at temperature 0, output can differ between runs, because GPU maths and request batching are not perfectly repeatable. If you need the same answer every time, store it rather than regenerate it.",
        visual: {
          type: "flow",
          title: "How one token gets picked",
          steps: [
            { label: "Logits", detail: "Raw score for every token" },
            { label: "Divide by temperature", detail: "Low sharpens, high flattens" },
            { label: "Softmax", detail: "Scores become probabilities" },
            { label: "Top-p cut", detail: "Keep the smallest set reaching p" },
            { label: "Random draw", detail: "Pick one token from what is left" },
          ],
        },
      },
      {
        heading: "Why hallucinations happen and how to reduce them",
        body: "A model is trained to continue text in a likely way, not to look facts up. It stores patterns from training data inside its weights, and rare facts are stored weakly or not at all. It also has a knowledge cutoff: it knows nothing that happened after its training data was collected. When asked something it does not know, the most likely continuation still looks like a confident answer.\n\nLowering temperature makes output more consistent, but a consistent wrong answer is still wrong. What actually helps is changing what the model has to work with and what it is allowed to say.",
        bullets: ["Give it sources: paste or retrieve the relevant documents", "Allow it to say I don't know, and mean it", "Ask for quotes or citations you can check", "Verify with code, tools or a database where possible", "Test with questions whose answers you already know"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What fills the context window",
        root: "Context window",
        children: [
          { label: "Instructions", children: ["System prompt", "Output format rules"] },
          { label: "Conversation", children: ["Earlier user messages", "Earlier assistant replies"] },
          { label: "Knowledge", children: ["Retrieved documents", "Pasted files"] },
          { label: "Tools", children: ["Tool definitions", "Tool call results"] },
          { label: "The reply", children: ["Output tokens being generated", "Limited by max output tokens"] },
        ],
      },
      {
        type: "compare",
        title: "Training time vs request time",
        columns: [
          { title: "Training (done by the provider)", points: ["Learns weights from huge text sets", "Takes weeks and huge GPU clusters", "Fixes a knowledge cutoff date", "Happens before you ever call it"] },
          { title: "Your request (inference)", points: ["Weights are frozen and never change", "Only sees what is in the context", "No memory of earlier requests", "Paid per token, in seconds"] },
        ],
      },
    ],
    examples: [
      {
        title: "Seeing tokens for yourself",
        explanation: "You want to know why a 20-page contract fills more of the context than you expected. Step 1: install a tokenizer library. tiktoken is OpenAI's open-source tokenizer; other model families use different tokenizers, so treat its counts as an estimate for them. Step 2: encode a few strings and compare the token count with the character count. Step 3: notice that common English words are cheap, while long rare words, digits and non-Latin scripts take more tokens. Step 4: for an exact count for your model, read the usage numbers the API returns.",
        code: {
          lang: "python",
          code: "# pip install tiktoken\nimport tiktoken\n\nenc = tiktoken.get_encoding(\"o200k_base\")\nsamples = [\"hello world\", \"Hello World!\", \"antidisestablishmentarianism\",\n           \"Order 4815162342 shipped\", \"こんにちは世界\"]\nfor text in samples:\n    ids = enc.encode(text)\n    pieces = [enc.decode([i]) for i in ids]\n    print(f\"{len(text):>3} chars -> {len(ids):>2} tokens  {pieces}\")",
        },
      },
      {
        title: "Temperature on a toy example",
        explanation: "Imagine the prompt is \"The capital of France is\" and the model gives four candidate tokens raw scores (logits). Step 1: divide the scores by the temperature. Step 2: apply softmax to get probabilities. At temperature 0.5, Paris gets about 98%. At 1.0 it drops to about 84%, and at 2.0 to about 60%, while pizza rises from almost 0 to about 5%. That is why high temperatures produce more surprising, and more often wrong, text.",
        code: {
          lang: "python",
          code: "import math\n\nlogits = {\"Paris\": 5.0, \"Lyon\": 3.0, \"London\": 2.0, \"pizza\": 0.0}\n\ndef probs(temperature: float) -> dict[str, float]:\n    exps = {w: math.exp(v / temperature) for w, v in logits.items()}\n    total = sum(exps.values())\n    return {w: round(e / total, 3) for w, e in exps.items()}\n\nfor t in (0.5, 1.0, 2.0):\n    print(t, probs(t))\n# 0.5 {'Paris': 0.98, 'Lyon': 0.018, 'London': 0.002, 'pizza': 0.0}\n# 1.0 {'Paris': 0.839, 'Lyon': 0.114, 'London': 0.042, 'pizza': 0.006}\n# 2.0 {'Paris': 0.598, 'Lyon': 0.22, 'London': 0.133, 'pizza': 0.049}",
        },
      },
    ],
    cheatSheet: [
      "English rule of thumb: 1 token is about 4 characters or 0.75 words",
      "Context window = input tokens + output tokens for one request",
      "Temperature below 1 sharpens choices, above 1 flattens them, 0 is near-greedy",
      "Adjust temperature or top-p, usually not both at once",
      "The model keeps no memory: your app resends the history every turn",
      "Output tokens are generated one by one, so long answers mean long waits",
      "Knowledge cutoff: the model knows nothing after its training data ends",
      "Fewer hallucinations: give sources, allow I don't know, verify the answer",
    ],
    quiz: [
      {
        q: "Why do LLMs often fail to count the letter r in a word?",
        options: ["They see tokens, not individual letters", "Their temperature is too high", "The context window is too small", "They were not trained on English"],
        answer: 0,
        why: "The word arrives as one or a few token IDs, so the letters are never seen one by one.",
      },
      {
        q: "A model has a 128,000 token window. Your prompt is 125,000 tokens. What is the most the reply can be?",
        options: ["128,000 tokens", "125,000 tokens", "3,000 tokens", "Unlimited, output is counted separately"],
        answer: 2,
        why: "Input and output share the same window, so only 3,000 tokens are left.",
      },
      {
        q: "At temperature 1, a model gives Paris 0.84, Lyon 0.11, London 0.04 and pizza 0.01. With top-p = 0.9, which tokens can be picked?",
        options: ["Only Paris", "All four tokens", "Paris, Lyon and London", "Paris and Lyon"],
        answer: 3,
        why: "Paris alone is 0.84, below 0.9; adding Lyon reaches 0.95, so the set stops there.",
      },
      {
        q: "Why is a long answer usually slower than a long prompt?",
        options: ["Prompts are cached forever", "Output tokens are produced one at a time, while the prompt is read in parallel", "Providers slow down long answers on purpose", "Output tokens are larger than input tokens"],
        answer: 1,
        why: "Prefill processes the prompt in parallel; decoding must go token by token.",
      },
      {
        q: "Which change does the most to reduce hallucinated facts?",
        options: ["Setting temperature to 0", "Using a longer system prompt", "Giving the model the relevant source text and allowing it to say it does not know", "Asking the model to be confident"],
        answer: 2,
        why: "Grounding in real sources changes what the model can draw on; low temperature only makes errors consistent.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Take a paragraph of English and the same paragraph in another language. Estimate tokens with the 4-characters rule, then count them with a real tokenizer.",
        hint: "Use tiktoken or a Hugging Face tokenizer, and compare len(text) / 4 with len(enc.encode(text)).",
        solution: "import tiktoken\nenc = tiktoken.get_encoding(\"o200k_base\")\nfor text in [english, other_language]:\n    print(len(text) / 4, len(enc.encode(text)))\n# English is usually close to the estimate;\n# many other languages need noticeably more tokens.",
      },
      {
        level: "medium",
        task: "Write a function that applies temperature and then top-p to a dict of logits and returns the tokens that remain, with their renormalised probabilities.",
        hint: "Softmax with temperature, sort by probability, keep adding until the sum reaches p, then divide by the kept sum.",
        solution: "import math\ndef nucleus(logits, t=1.0, p=0.9):\n    exps = {w: math.exp(v / t) for w, v in logits.items()}\n    z = sum(exps.values())\n    ranked = sorted(((e / z, w) for w, e in exps.items()), reverse=True)\n    kept, total = [], 0.0\n    for prob, w in ranked:\n        kept.append((w, prob)); total += prob\n        if total >= p: break\n    return {w: prob / total for w, prob in kept}",
      },
      {
        level: "hard",
        task: "Measure hallucination on a small scale: write 10 questions about your own company or project that a public model cannot know. Ask a model each one twice, once with no context and once with the right document pasted in. Score the answers.",
        hint: "Count three outcomes: correct, says it does not know, confidently wrong.",
        solution: "1. Write 10 questions with known answers from internal docs.\n2. Run A: question only. Run B: document + question +\n   'If the answer is not in the document, say I don't know.'\n3. Label each answer: correct / I don't know / wrong.\n4. Expect many confident wrong answers in A and far fewer in B.\n5. Read the wrong ones in B: missing context or ignored context?",
      },
    ],
    faq: [
      { q: "Do LLMs understand what they write?", a: "They build rich internal patterns that capture a lot of meaning, but they are trained to predict likely text, not to check truth. Treat their output as a strong draft that still needs grounding and verification." },
      { q: "Why does the same prompt give different answers?", a: "The next token is drawn at random from a probability list, so different runs take different paths. Lower temperature reduces this, but small differences can remain even at 0." },
      { q: "Does a bigger context window mean I can skip retrieval?", a: "Not usually. Very long prompts cost more, respond slower and can bury the key facts, so sending only the relevant parts often gives better answers." },
      { q: "How many tokens is a page of text?", a: "A typical page of English prose is around 500 words, which is roughly 650 to 700 tokens. Dense tables, code or other languages can be more." },
    ],
  },

  "ai-foundations/model-landscape": {
    plain: [
      "There are two main ways to use a language model. You can call a hosted model over the internet and pay for each request, or you can download an open-weight model and run it on your own computer or servers. Both are normal choices in real products.",
      "Hosted models are run by a company. You send text and get text back, and you never see the model itself. You do not manage any hardware, and the top hosted models are often the strongest. The trade-off is that your data travels to the provider and you pay per token.",
      "Open-weight models are models whose trained numbers (the weights) you can download. You decide where they run, so data can stay inside your network. But you pay for the hardware, you keep it running, and you must read the licence, which says how you are allowed to use the model.",
      "No model is best at everything. The right choice is the smallest, cheapest model that does your task well enough, fast enough, within your privacy rules. You find it by testing a few candidates on your own examples, not by reading a leaderboard.",
    ],
    deepDive: [
      {
        heading: "Ways to get a model, from least to most work",
        body: "There are more than two options in practice. The simplest is a provider's own API with its official SDK. Large cloud platforms also offer model catalogues, so you can call well-known models through your existing cloud account, with your cloud's billing, regions and access controls. Inference providers host popular open-weight models behind an API, so you get open models without running GPUs.\n\nAt the other end you run the model yourself. On a laptop or a single machine, tools like Ollama and llama.cpp make this easy. On GPU servers that must serve many users, engines such as vLLM batch requests together to use the hardware efficiently.\n\nMany teams mix these: a hosted model for hard tasks, a small self-hosted model for cheap, private or offline work. Hiding the model behind one small interface in your code makes switching cheap.",
        visual: {
          type: "tree",
          title: "Ways to access a model",
          root: "Using an LLM",
          children: [
            { label: "Provider API", children: ["Official SDK", "Pay per token", "Newest models first"] },
            { label: "Cloud model catalogue", children: ["Your cloud account and billing", "Pick a region for data"] },
            { label: "Open-weight via inference host", children: ["Open models, no GPUs to run", "Pay per token or per hour"] },
            { label: "Self-hosted", children: ["Laptop: Ollama, llama.cpp", "Servers: vLLM on GPUs", "You run and patch it"] },
          ],
        },
      },
      {
        heading: "What open-weight really means, and what hardware it needs",
        body: "Open-weight means the weights are published. It does not always mean open source: the training data and training code are often not released, and the licence may add rules. Model size is given in parameters, such as 8B (8 billion) or 70B.\n\nA quick memory estimate is parameters times bytes per parameter. At 16-bit precision each parameter takes 2 bytes, so an 8B model needs about 16 GB just for its weights. Quantisation stores weights with fewer bits: at 4 bits the same model needs roughly 4 to 5 GB, which fits on many laptops, with a small loss in quality.\n\nOn top of the weights you need memory for the KV cache, which grows with context length and with the number of users served at once. A 70B model at 16 bits needs about 140 GB for weights alone, so it needs several data-centre GPUs or heavy quantisation.",
        bullets: ["Weights memory = parameters x bytes per parameter", "16-bit: 2 bytes; 8-bit: 1 byte; 4-bit: about half a byte", "Longer contexts and more users need more memory"],
      },
      {
        heading: "Judging quality fairly",
        body: "Public benchmarks test general skills such as maths, coding or knowledge. They are useful for a first shortlist, but they have limits. Some test questions leak into training data, which inflates scores. Leaderboards that rank by human preference reward a pleasant style, which may not matter for your task.\n\nThe reliable method is your own eval set: 30 to 100 real examples from your use case with the answers you expect, including hard and odd cases. Run every candidate model with the same prompt and score the results the same way. Often a small model scores almost as well as a large one on a narrow task, such as classifying tickets or extracting fields.\n\nRe-run the eval when a provider releases a new model version. Behaviour can change between versions even when the name looks similar, so pin an exact model version in production where your provider allows it.",
      },
      {
        heading: "Latency and cost: the numbers to compare",
        body: "Two latency numbers matter. Time to first token (TTFT) is how long until the reply starts. Output speed is how many tokens per second arrive after that. Total time is roughly TTFT plus output tokens divided by speed: 500 output tokens at 50 tokens per second take about 10 seconds plus TTFT. Smaller models are usually faster at both.\n\nHosted cost is input tokens times the input price plus output tokens times the output price, and output is usually several times more expensive. Some models first produce hidden reasoning tokens that are billed as output, so check usage numbers, not just the visible text.\n\nSelf-hosting costs a fixed amount per GPU-hour whether it is busy or idle. It only beats per-token prices when the hardware stays busy most of the time, and you must add the cost of the engineers who run it.",
      },
      {
        heading: "Context size, data terms and licences",
        body: "Check the context window and the maximum output length for each candidate, and test long inputs yourself, because quality on very long prompts varies. Then read the data terms: does the provider keep your prompts, for how long, can they use them for training, and in which regions is data processed? For personal, medical or financial data these answers can decide the choice on their own.\n\nOpen-weight licences differ a lot. Some models use permissive licences such as Apache 2.0 or MIT. Others use custom licences that add acceptable-use rules, require attribution, or need a separate agreement for very large companies. Some restrict commercial use entirely. Read the actual licence file for the exact model version, and check whether outputs may be used to train other models.",
        bullets: ["Context window and max output tokens", "Data retention and training use of your prompts", "Processing region and compliance needs", "Licence: commercial use, attribution, size limits"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Choosing a model for one use case",
        steps: [
          { label: "Write constraints", detail: "Quality bar, latency, budget, privacy" },
          { label: "Shortlist 3 or 4", detail: "Mix large, small, hosted and open" },
          { label: "Run your eval set", detail: "Same prompt and scoring for each" },
          { label: "Measure speed and cost", detail: "TTFT, tokens per second, cost per call" },
          { label: "Check terms", detail: "Context size, data terms, licence" },
          { label: "Pick the smallest pass", detail: "Re-test when versions change" },
        ],
      },
    ],
    examples: [
      {
        title: "Large or small model for a ticket classifier",
        explanation: "A support team gets 50,000 tickets a day and wants each one tagged with one of 8 categories. Each call sends about 400 input tokens and gets about 10 output tokens back. Step 1: run both candidate models on 200 labelled tickets. Say the large model scores 97% and the small one 96%. Step 2: price both with the provider's current prices. The code uses made-up example prices. Step 3: the large model costs about 67 dollars a day and the small one about 6, for one point of accuracy. Step 4: pick the small model, and send only low-confidence tickets to the large one.",
        code: {
          lang: "python",
          code: "# Example prices in dollars per million tokens (check your provider)\nMODELS = {\"large\": (3.00, 15.00), \"small\": (0.25, 1.25)}\nCALLS_PER_DAY, TOKENS_IN, TOKENS_OUT = 50_000, 400, 10\n\nfor name, (price_in, price_out) in MODELS.items():\n    per_call = TOKENS_IN / 1e6 * price_in + TOKENS_OUT / 1e6 * price_out\n    print(f\"{name}: ${per_call * CALLS_PER_DAY:.2f} per day\")\n# large: $67.50 per day\n# small: $5.63 per day",
        },
      },
      {
        title: "Patient notes must stay on site",
        explanation: "A clinic wants to summarise doctors' notes, but its rules say patient data cannot leave its network. Step 1: this rules out hosted APIs unless a contract and region meet the rules, so the team looks at open-weight models. Step 2: estimate memory. An 8B model at 4-bit quantisation needs about 4 to 5 GB for weights, so one modest GPU is enough. Step 3: read the licence to confirm medical and commercial use is allowed. Step 4: run the eval set of 50 real, anonymised notes and compare against a larger model to see the quality gap.",
        code: {
          lang: "python",
          code: "def weights_gb(params_billion: float, bits: int) -> float:\n    bytes_per_param = bits / 8\n    return params_billion * bytes_per_param  # 1e9 params x bytes = GB\n\nfor bits in (16, 8, 4):\n    print(f\"8B model at {bits}-bit: ~{weights_gb(8, bits):.0f} GB\")\n# 16-bit: ~16 GB, 8-bit: ~8 GB, 4-bit: ~4 GB (plus KV cache)",
        },
      },
    ],
    cheatSheet: [
      "Pick the smallest model that passes your own eval set",
      "Weights memory is about parameters x bytes: 8B at 16-bit is about 16 GB",
      "4-bit quantisation cuts weight memory to about a quarter of 16-bit",
      "Total latency is about TTFT + output tokens / tokens per second",
      "Output tokens usually cost several times more than input tokens",
      "Open-weight is not always open source: read the licence for each version",
      "Pin an exact model version in production and re-run evals before upgrading",
    ],
    quiz: [
      {
        q: "Roughly how much memory do the weights of a 70B model need at 16-bit precision?",
        options: ["About 7 GB", "About 35 GB", "About 70 GB", "About 140 GB"],
        answer: 3,
        why: "70 billion parameters at 2 bytes each is about 140 GB, before the KV cache.",
      },
      {
        q: "A model has 0.5 s time to first token and outputs 40 tokens per second. About how long does a 400-token answer take?",
        options: ["About 10.5 seconds", "About 0.5 seconds", "About 4 seconds", "About 40 seconds"],
        answer: 0,
        why: "400 / 40 = 10 seconds of output plus 0.5 seconds before the first token.",
      },
      {
        q: "Why is a public leaderboard not enough to choose a model?",
        options: ["Leaderboards are always fake", "It may not reflect your task, and test data can leak into training", "Leaderboards only list open-weight models", "Leaderboards ignore quality"],
        answer: 1,
        why: "General scores can be inflated or measure things your use case does not need.",
      },
      {
        q: "When does self-hosting usually become cheaper than a per-token API?",
        options: ["Always, because there is no per-token price", "Never", "When the GPUs stay busy most of the time with steady traffic", "Only for models larger than 70B"],
        answer: 2,
        why: "GPU-hours cost the same whether busy or idle, so savings need high utilisation.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pick one open-weight model you have heard of. Find its licence and answer: can you use it commercially, must you credit it, and are there any user or company size limits?",
        hint: "Look for the LICENSE file on the model's official page, not a blog summary.",
        solution: "1. Open the official model card or repository.\n2. Open the LICENSE file for that exact version.\n3. Note: licence name, commercial use yes/no,\n   attribution rules, acceptable-use policy, size limits.\n4. Note whether outputs may be used to train other models.",
      },
      {
        level: "medium",
        task: "Write a cost table for three candidate models for a summariser that receives 2,000 input tokens and returns 300 output tokens, at 5,000 calls per day. Use the providers' current price pages.",
        hint: "Cost per call = in / 1e6 x price_in + out / 1e6 x price_out; then multiply by calls per day and by 30.",
        solution: "models = {\"A\": (pi_a, po_a), \"B\": (pi_b, po_b), \"C\": (pi_c, po_c)}\nfor name, (pi, po) in models.items():\n    call = 2000 / 1e6 * pi + 300 / 1e6 * po\n    print(name, round(call, 5), round(call * 5000 * 30, 2), \"per month\")",
      },
      {
        level: "hard",
        task: "Run a mini model bake-off: 30 examples of a real task, two hosted models and one local model. Record accuracy, median latency and cost per 1,000 calls, then write a one-paragraph recommendation.",
        hint: "Keep the prompt identical, store every output in a CSV, and score with the same rule for all three.",
        solution: "1. Put 30 inputs and expected outputs in eval.jsonl.\n2. For each model: run all 30, save output, latency, tokens.\n3. Score each output the same way (exact match or rubric).\n4. Table: model | accuracy | p50 latency | cost per 1k calls.\n5. Recommend the cheapest model that meets the quality bar,\n   and say what would change the decision.",
      },
    ],
    faq: [
      { q: "Is an open-weight model the same as open source?", a: "Not always. Open-weight means you can download the weights; training data and code may stay private, and the licence may restrict how you use the model." },
      { q: "Can I run a useful model on my laptop?", a: "Yes. Small models of a few billion parameters, quantised to 4 bits, run on many laptops with tools like Ollama or llama.cpp. They are slower and weaker than top hosted models but fine for many simple tasks." },
      { q: "Do hosted providers train on my API data?", a: "It depends on the provider and your plan. Read the data usage and retention terms before sending user data, and look for business or zero-retention options if you need them." },
      { q: "Should I always use the newest model?", a: "No. Newer models can behave differently, so run your evals first and switch only if quality, speed or cost improves for your task." },
    ],
  },

  "ai-foundations/python-for-ai": {
    plain: [
      "An AI app spends most of its time waiting. It sends a question to a model and then waits a few seconds for the answer. If your code waits for each call before starting the next, ten calls take ten times as long. Async Python lets your program start many calls and wait for all of them at once.",
      "async def creates a special function called a coroutine. Inside it, await means: pause here until this is ready, and let other work run meanwhile. A scheduler called the event loop switches between paused coroutines. It is still one thread; it just never sits idle while something else could run.",
      "Type hints are labels that say what kind of data a variable holds, like name: str or scores: list[float]. Python does not enforce them while running, but your editor and tools like mypy use them to catch mistakes before you run the code.",
      "Pydantic goes further: it checks data while the program runs. You describe the shape once in a class, and Pydantic converts and validates incoming data, such as JSON from a model, and raises a clear error if something is missing or wrong. That makes model output safe for the rest of your code to use.",
    ],
    deepDive: [
      {
        heading: "How the event loop really runs your code",
        body: "asyncio runs on one thread. The event loop keeps a list of tasks that are ready to run. It runs one until that task reaches an await on something slow, such as a network reply. The task then gives control back, and the loop runs the next ready task. When the reply arrives, the paused task becomes ready again.\n\nThis only works if every slow step is awaitable. A normal blocking call such as time.sleep or requests.get does not give control back, so the whole loop freezes and every other task waits. Use async libraries instead: httpx.AsyncClient for HTTP, and the async client that most official LLM SDKs provide.\n\nIf you must call blocking code, run it in a worker thread with await asyncio.to_thread(func, args). CPU-heavy work, such as large parsing jobs, is better in a separate process pool.",
        bullets: ["One thread, many tasks, switching at each await", "time.sleep blocks; await asyncio.sleep does not", "asyncio.to_thread wraps blocking calls", "asyncio.run(main()) starts the loop once at the top"],
        visual: {
          type: "sequence",
          title: "Two tasks sharing one thread",
          actors: ["Event loop", "Task A", "Task B"],
          messages: [
            { from: 0, to: 1, label: "Run A" },
            { from: 1, to: 0, label: "await API reply: pause" },
            { from: 0, to: 2, label: "Run B meanwhile" },
            { from: 2, to: 0, label: "await API reply: pause" },
            { from: 0, to: 1, label: "A's reply arrived: resume" },
            { from: 1, to: 0, label: "A finished" },
            { from: 0, to: 2, label: "B's reply arrived: resume" },
          ],
        },
      },
      {
        heading: "Running many calls safely: gather, TaskGroup and Semaphore",
        body: "asyncio.gather(*coros) runs coroutines concurrently and returns their results in the same order you passed them in. By default, the first exception is raised to you, but the other calls keep running in the background. With return_exceptions=True, errors are returned in the list instead, so one failure does not hide all the successes.\n\nPython 3.11 added asyncio.TaskGroup. If one task fails, the group cancels the rest and raises an ExceptionGroup. Use it when partial results are useless.\n\nEither way, cap concurrency. Firing 500 calls at once will hit the provider's rate limits. An asyncio.Semaphore(5) lets only five calls run at the same time; the rest wait their turn. asyncio.timeout(30), also new in 3.11, cancels a block that takes too long.",
        visual: {
          type: "compare",
          title: "gather vs TaskGroup",
          columns: [
            { title: "asyncio.gather", points: ["Results in input order", "return_exceptions=True collects errors", "Other calls keep running after one fails", "Good for best-effort batches"] },
            { title: "asyncio.TaskGroup (3.11+)", points: ["Tasks created with tg.create_task", "One failure cancels the others", "Raises an ExceptionGroup", "Good when all results are required"] },
          ],
        },
      },
      {
        heading: "Type hints that pay off in AI code",
        body: "Type hints are not checked at runtime; a type checker such as mypy or pyright reads them. They are most useful at boundaries: what a function takes and returns. Modern syntax is short: list[str], dict[str, float], str | None (Python 3.10 and newer).\n\nA few types fit AI code well. Literal[\"low\", \"high\"] restricts a value to fixed options, which matches labels a model must choose from. TypedDict describes the shape of a plain dict, such as a chat message with role and content keys. Protocol describes any object with certain methods, so you can write code against \"anything with a complete() method\" and swap providers or test fakes without changing callers.\n\nAnnotate async functions with their result type: async def ask(q: str) -> Answer. The checker then knows that await ask(q) gives an Answer.",
        bullets: ["Literal for fixed label sets", "TypedDict for message dicts", "Protocol for swappable clients", "Run mypy or pyright in CI"],
      },
      {
        heading: "Pydantic v2 features you will use daily",
        body: "A Pydantic model is a class that inherits from BaseModel with typed fields. Model.model_validate(data) checks a dict, Model.model_validate_json(text) parses and checks a JSON string in one step, and obj.model_dump() turns it back into a dict. Model.model_json_schema() produces a JSON Schema you can send to an LLM API for structured output.\n\nField adds rules: Field(ge=1, le=5) for a 1 to 5 score, Field(min_length=1) for a non-empty string, and description=\"...\" which also ends up in the schema. By default Pydantic is lenient and converts \"3\" to 3; set strict mode when you want exact types.\n\nFor app settings, the separate pydantic-settings package provides BaseSettings, which reads values from environment variables and .env files and validates them at startup, so a missing API key fails immediately instead of on the first request.",
        bullets: ["model_validate_json: parse and validate in one step", "Field(ge=, le=, min_length=, description=)", "ValidationError.errors() lists every problem", "SecretStr hides keys when printed or logged"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Data flowing through a typed AI call",
        steps: [
          { label: "Request object", detail: "Pydantic model built from user input" },
          { label: "Async API call", detail: "await client call under a Semaphore" },
          { label: "Raw JSON text", detail: "Untrusted model output" },
          { label: "model_validate_json", detail: "Parse, convert and check types" },
          { label: "Typed result", detail: "Safe for the rest of the code" },
        ],
      },
    ],
    examples: [
      {
        title: "Summarise 100 documents without hitting rate limits",
        explanation: "You must summarise 100 documents, and your provider allows only a handful of calls at once. Step 1: write one async function per document. Step 2: wrap the call in a Semaphore(5) so at most five run at the same time. Step 3: use gather with return_exceptions=True so one failure does not lose the other 99 results. Step 4: split successes from failures and retry only the failures later. With a 1 second call, this takes about 20 seconds instead of 100.",
        code: {
          lang: "python",
          code: "import asyncio\n\nsem = asyncio.Semaphore(5)\nasync def summarise(doc: str) -> str:\n    async with sem:                  # at most 5 calls at once\n        await asyncio.sleep(1)       # stands in for the API call\n        return doc[:20]\n\nasync def main() -> None:\n    docs = [f\"document number {i}\" for i in range(100)]\n    results = await asyncio.gather(*(summarise(d) for d in docs), return_exceptions=True)\n    ok = [r for r in results if not isinstance(r, Exception)]\n    print(len(ok), \"done\")           # about 20 s total\n\nasyncio.run(main())",
        },
      },
      {
        title: "Validated settings that fail fast",
        explanation: "Your app reads an API key, a model name and a concurrency limit from the environment. Step 1: install pydantic-settings. Step 2: describe the settings as a class with types and limits. Step 3: create Settings() at startup; it reads APP_LLM_API_KEY and the others from the environment or a .env file. Step 4: if the key is missing or max_concurrency is 500, startup fails with a clear ValidationError. SecretStr prints as stars, so the key does not leak into logs.",
        code: {
          lang: "python",
          code: "# pip install pydantic-settings\nfrom pydantic import Field, SecretStr\nfrom pydantic_settings import BaseSettings, SettingsConfigDict\n\nclass Settings(BaseSettings):\n    model_config = SettingsConfigDict(env_prefix=\"APP_\", env_file=\".env\")\n    llm_api_key: SecretStr\n    model_name: str = \"small-model\"\n    max_concurrency: int = Field(default=5, ge=1, le=50)\n    request_timeout_s: float = 30.0\n\nsettings = Settings()            # raises ValidationError if invalid\nprint(settings.llm_api_key)      # **********\nkey = settings.llm_api_key.get_secret_value()",
        },
      },
    ],
    cheatSheet: [
      "asyncio.run(main()) starts the event loop once, at the top of the program",
      "Never use time.sleep or requests inside async code; use asyncio.sleep and httpx.AsyncClient",
      "await asyncio.to_thread(fn, arg) runs blocking code without freezing the loop",
      "asyncio.Semaphore(n) caps how many calls run at the same time",
      "gather(..., return_exceptions=True) keeps successes when some calls fail",
      "Model.model_validate_json(text) parses and validates JSON in one step",
      "Field(ge=1, le=5, description=...) adds rules that also appear in the JSON Schema",
    ],
    quiz: [
      {
        q: "Inside an async function you call time.sleep(2). What happens to other tasks?",
        options: ["They keep running normally", "They all wait, because the event loop is blocked", "Python converts it to asyncio.sleep", "Only tasks in the same file wait"],
        answer: 1,
        why: "time.sleep blocks the single thread, so the event loop cannot switch tasks.",
      },
      {
        q: "You run 10 calls with asyncio.gather (no extra options) and call 3 raises an error. What do you get?",
        options: ["A list with 9 results and one None", "An ExceptionGroup with all errors", "Nothing; the program exits silently", "The exception is raised to you, while the other calls are not cancelled"],
        answer: 3,
        why: "Without return_exceptions, gather raises the first exception but does not cancel the others.",
      },
      {
        q: "What does Pydantic do by default with the value \"3\" for a field typed int?",
        options: ["Converts it to the integer 3", "Raises a ValidationError", "Keeps it as the string \"3\"", "Sets the field to None"],
        answer: 0,
        why: "Pydantic's default lax mode converts compatible values; strict mode would reject it.",
      },
      {
        q: "Which tool caps the number of concurrent API calls in asyncio?",
        options: ["asyncio.Queue.join", "asyncio.Event", "asyncio.Semaphore", "asyncio.to_thread"],
        answer: 2,
        why: "A Semaphore with n permits lets only n coroutines inside its block at once.",
      },
      {
        q: "Are Python type hints checked when the program runs?",
        options: ["Yes, always", "Only in Python 3.12 and newer", "Only inside async functions", "No, tools like mypy check them before running; Pydantic checks data at runtime"],
        answer: 3,
        why: "Plain hints are ignored at runtime; Pydantic uses them to validate data while running.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write an async function fetch(i) that sleeps for 1 second and returns i * 2. Run it for i in 0..9 first one after another, then with gather, and time both.",
        hint: "Use time.perf_counter() around each version.",
        solution: "import asyncio, time\nasync def fetch(i): await asyncio.sleep(1); return i * 2\nasync def main():\n    t = time.perf_counter()\n    [await fetch(i) for i in range(10)]\n    print(\"sequential\", round(time.perf_counter() - t, 1))\n    t = time.perf_counter()\n    await asyncio.gather(*(fetch(i) for i in range(10)))\n    print(\"gather\", round(time.perf_counter() - t, 1))\nasyncio.run(main())  # about 10 s vs 1 s",
      },
      {
        level: "medium",
        task: "Define a Pydantic model Review with rating (int, 1 to 5), sentiment (positive, negative or mixed) and summary (non-empty str). Validate one good and one bad JSON string and print the errors.",
        hint: "Use Literal for sentiment and Field(ge=, le=, min_length=) for the limits.",
        solution: "from typing import Literal\nfrom pydantic import BaseModel, Field, ValidationError\nclass Review(BaseModel):\n    rating: int = Field(ge=1, le=5)\n    sentiment: Literal[\"positive\", \"negative\", \"mixed\"]\n    summary: str = Field(min_length=1)\nprint(Review.model_validate_json('{\"rating\": 4, \"sentiment\": \"mixed\", \"summary\": \"ok\"}'))\ntry:\n    Review.model_validate_json('{\"rating\": 9, \"sentiment\": \"meh\", \"summary\": \"\"}')\nexcept ValidationError as e:\n    for err in e.errors(): print(err[\"loc\"], err[\"msg\"])",
      },
      {
        level: "hard",
        task: "Build ask_all(questions, limit) that runs calls with at most limit at once, gives each call a 5 second timeout, and returns a list where failures are replaced by the string \"error\".",
        hint: "Combine a Semaphore, asyncio.timeout (3.11+) and try/except inside one helper.",
        solution: "import asyncio\nasync def ask(q: str) -> str: await asyncio.sleep(1); return q.upper()  # fake\nasync def ask_all(qs: list[str], limit: int = 5) -> list[str]:\n    sem = asyncio.Semaphore(limit)\n    async def one(q: str) -> str:\n        async with sem:\n            try:\n                async with asyncio.timeout(5):\n                    return await ask(q)\n            except Exception:\n                return \"error\"\n    return await asyncio.gather(*(one(q) for q in qs))",
      },
    ],
    faq: [
      { q: "Is async Python faster than threads?", a: "For many waiting network calls, async is light and easy to scale to hundreds of tasks on one thread. It does not speed up CPU-heavy work; use processes for that." },
      { q: "Can I use await in a normal script or Jupyter notebook?", a: "In a script, put your code in async def main() and call asyncio.run(main()). Jupyter already runs an event loop, so you can write await directly in a cell." },
      { q: "What is the difference between Pydantic v1 and v2?", a: "v2 has a faster core and renamed methods: parse_raw became model_validate_json, dict became model_dump and schema became model_json_schema. New code should use v2." },
      { q: "Do I need type hints if I use Pydantic?", a: "Pydantic reads the type hints on your model fields to know what to validate, so yes for models. Hints on ordinary functions are optional but help editors and type checkers catch bugs." },
    ],
  },
};

export default extra;
