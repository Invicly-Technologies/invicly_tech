import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "embeddings/embeddings-basics": {
    plain: [
      "Computers are good with numbers, not meaning. An embedding model turns a piece of text into a long list of numbers, called a vector. It is trained so that texts with similar meaning get similar lists of numbers, even when they use different words.",
      "Think of each vector as a point on a giant map with hundreds of directions instead of two. \"How do I get a refund?\" and \"I want my money back\" land close together. \"Shipping to Canada\" lands somewhere else.",
      "To search by meaning, you turn all your documents into vectors once and save them. When a question comes in, you turn the question into a vector too, then find the saved vectors closest to it. Closeness is usually measured with cosine similarity, which compares the direction of two vectors.",
      "This is called semantic search, and it is the first half of most AI apps that answer questions about your own documents. It is not magic, though: embeddings are weaker at exact codes, numbers and negation, so you test them on your own data.",
    ],
    deepDive: [
      {
        heading: "Where embeddings come from",
        body: "An embedding model is usually a transformer encoder. It reads the text, produces a vector for every token, and then combines them into one vector for the whole text, often by averaging (mean pooling). The model is trained on huge numbers of pairs that belong together, such as a question and its answer, a title and its article. Training pulls matching pairs closer and pushes unrelated texts apart. This is called contrastive learning.\n\nEvery model outputs vectors of a fixed size, its dimension, whatever the length of the input. Common sizes are 384, 768, 1024 and higher; for example, the small open model all-MiniLM-L6-v2 outputs 384 numbers. Each model also has a maximum input length. Text beyond it is usually cut off silently, so a long document may be embedded from its first part only.",
        bullets: ["Fixed dimension per model, any text length in", "Input beyond the model's limit is usually cut off", "Different models give incompatible vectors", "Changing models means re-embedding everything"],
        visual: {
          type: "flow",
          title: "What an embedding model does",
          steps: [
            { label: "Text in", detail: "A sentence, paragraph or query" },
            { label: "Tokenise", detail: "Split into tokens, up to a length limit" },
            { label: "Encoder", detail: "A vector for every token" },
            { label: "Pool", detail: "Combine into one vector, often the mean" },
            { label: "Normalise", detail: "Scale to length 1 (many models do this)" },
          ],
        },
      },
      {
        heading: "Cosine, dot product and distance",
        body: "Cosine similarity is the dot product of two vectors divided by the product of their lengths. It measures the angle between them: 1 means the same direction, 0 means unrelated, and negative values mean opposite directions, though with text embeddings most scores fall between 0 and 1.\n\nIf vectors are normalised to length 1, the dot product equals cosine similarity, and ranking by Euclidean distance gives the same order too. Many embedding APIs return normalised vectors, and libraries such as sentence-transformers can normalise for you. Then you can use the fastest operation, a plain dot product.\n\nScores are not comparable across models. A score of 0.8 may mean very similar in one model and only loosely related in another. Never hard-code a similarity threshold without checking it on labelled examples for that exact model.",
        visual: {
          type: "compare",
          title: "Three ways to compare vectors",
          columns: [
            { title: "Cosine similarity", points: ["Angle between vectors", "Ignores vector length", "Higher means more similar"] },
            { title: "Dot product", points: ["Sum of element products", "Equals cosine for unit vectors", "Fastest to compute"] },
            { title: "Euclidean distance", points: ["Straight-line distance", "Lower means more similar", "Same ranking as cosine for unit vectors"] },
          ],
        },
      },
      {
        heading: "Generating embeddings: API or local model",
        body: "With a hosted embedding API, you send a list of texts in one request and get a list of vectors back in the same order. Batch your requests (dozens to hundreds of texts per call, within the provider's limits), because one text per call is slow and hits rate limits. Embeddings are cheap per token compared with chat models, but re-embedding a large corpus still costs time and money, so store the results.\n\nWith a local model, such as one loaded through sentence-transformers, you call model.encode(texts) and pass normalize_embeddings=True. It runs on a CPU for small jobs and much faster on a GPU.\n\nSome models are asymmetric: they expect queries and documents to be marked differently. The E5 family expects the prefixes query: and passage:, and some APIs have an input type option. Read the model card; skipping this can noticeably lower search quality.",
        bullets: ["Batch texts per request", "Store vectors with the model name and version", "Use query and document prefixes if the model expects them", "Same model for queries and documents"],
      },
      {
        heading: "Where embeddings struggle",
        body: "Embeddings capture general meaning, which brings predictable blind spots. Negation is weak: refundable and not refundable can land close together because they share the topic. Exact identifiers such as SKU-4471, error codes and version numbers carry little meaning, so the right document may not rank first. Numbers and dates are treated as text, not values.\n\nLong texts get blurred. A vector for a five-page document averages many topics, so it matches none of them strongly. This is why documents are split into chunks before embedding.\n\nDomain language can also be a problem: a general model may not know that two internal product names mean the same thing. Fixes include hybrid search with keywords for exact terms, adding titles or synonyms to chunk text, trying a domain-specific model, and always testing retrieval on real questions.",
      },
      {
        heading: "Seeing your embeddings",
        body: "You cannot look at 384 dimensions directly, but you can squash them into 2 for a picture. PCA (principal component analysis) is fast and keeps the broad structure. t-SNE and UMAP keep local neighbourhoods better, so clusters stand out more clearly.\n\nColour each point by a known label, such as product area or document type. Good embeddings show tight groups for each label; overlapping groups suggest the model cannot tell those topics apart, which predicts retrieval mistakes. Outliers are often parsing errors or empty chunks.\n\nTreat the plot as a hint, not a measurement. Squashing hundreds of dimensions into two distorts distances, and t-SNE in particular can make the gaps between clusters look more meaningful than they are. Use real retrieval tests to decide.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Choosing an embedding model",
        root: "Embedding model",
        children: [
          { label: "Quality", children: ["Test on your own queries", "Public retrieval benchmarks for a shortlist"] },
          { label: "Size", children: ["Dimension drives storage and speed", "Max input tokens per text"] },
          { label: "Languages", children: ["English-only or multilingual"] },
          { label: "Hosting", children: ["API: no servers, per-token price", "Local: private, needs CPU or GPU"] },
          { label: "Lock-in", children: ["Switching means re-embedding everything"] },
        ],
      },
    ],
    examples: [
      {
        title: "Semantic search with sentence-transformers",
        explanation: "You want to find the right help article for a customer's question on your own machine. Step 1: install sentence-transformers and load a small model (it downloads once). Step 2: embed the documents with normalisation, so a dot product equals cosine similarity. Step 3: embed the question the same way. Step 4: score all documents with one matrix product and sort. The refund article should rank first even though the question never says refund.",
        code: {
          lang: "python",
          code: "# pip install sentence-transformers\nfrom sentence_transformers import SentenceTransformer\n\nmodel = SentenceTransformer(\"all-MiniLM-L6-v2\")   # 384 dimensions\ndocs = [\"Refunds are paid to the original card within 5 days.\",\n        \"We ship to Canada and the US.\",\n        \"Reset your password from the login page.\"]\ndoc_vecs = model.encode(docs, normalize_embeddings=True)\nq_vec = model.encode(\"How do I get my money back?\", normalize_embeddings=True)\n\nscores = doc_vecs @ q_vec                         # cosine, since vectors are unit length\nfor i in scores.argsort()[::-1]:\n    print(f\"{scores[i]:.3f}  {docs[i]}\")",
        },
      },
      {
        title: "A 2D picture of your documents",
        explanation: "You suspect the billing and account help articles are confused in search. Step 1: embed every article. Step 2: reduce the vectors to 2 dimensions with PCA from scikit-learn. Step 3: plot them and colour by category. Step 4: if billing and account points overlap heavily, expect retrieval mix-ups between them; look at the overlapping articles and consider clearer titles or a better model. Remember the plot distorts distances, so confirm with real queries.",
        code: {
          lang: "python",
          code: "# pip install scikit-learn matplotlib\nimport matplotlib.pyplot as plt\nfrom sklearn.decomposition import PCA\n\n# vecs: array of shape (n_docs, 384); labels: one category per doc\npoints = PCA(n_components=2).fit_transform(vecs)\nfor label in sorted(set(labels)):\n    idx = [i for i, l in enumerate(labels) if l == label]\n    plt.scatter(points[idx, 0], points[idx, 1], label=label, s=12)\nplt.legend()\nplt.title(\"Help articles, PCA of embeddings\")\nplt.savefig(\"embeddings.png\", dpi=150)",
        },
      },
    ],
    cheatSheet: [
      "Same embedding model for documents and queries, always",
      "normalize_embeddings=True makes dot product equal cosine similarity",
      "Similarity scores are not comparable across models: calibrate thresholds per model",
      "Text past the model's max input length is usually cut off silently",
      "Batch texts per API call and store vectors with the model name",
      "E5-style models need query: and passage: prefixes",
      "Weak spots: negation, exact codes, numbers; add keyword search for those",
      "PCA, t-SNE or UMAP give a 2D picture; confirm with retrieval tests",
    ],
    quiz: [
      {
        q: "Two vectors are normalised to length 1. Which is true?",
        options: ["Cosine similarity and dot product are equal", "Dot product is always 0", "Euclidean distance gives the opposite ranking", "Cosine similarity cannot be computed"],
        answer: 0,
        why: "Cosine divides the dot product by the lengths, which are both 1.",
      },
      {
        q: "You switch to a new embedding model. What must you do with stored document vectors?",
        options: ["Nothing", "Normalise them again", "Re-embed all documents with the new model", "Average old and new vectors"],
        answer: 2,
        why: "Vectors from different models live in different spaces and cannot be compared.",
      },
      {
        q: "A user searches for SKU-4471 and the right product page ranks 9th. Why?",
        options: ["The vector is too long", "Cosine similarity cannot handle numbers", "The query was not normalised", "Embeddings capture meaning, and an exact code carries little meaning"],
        answer: 3,
        why: "Exact identifiers are a known weak spot; keyword search handles them better.",
      },
      {
        q: "What happens if you embed a 3,000-token document with a model whose limit is 512 tokens?",
        options: ["The API always rejects it", "Usually only the first part is embedded and the rest is ignored", "The model splits it into chunks for you", "The vector gets 3,000 dimensions"],
        answer: 1,
        why: "Most models truncate silently, which is one reason to chunk documents first.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Embed 5 sentences of your own and print the similarity matrix. Check that the two sentences you meant to be similar score highest together.",
        hint: "With normalised vectors, vecs @ vecs.T gives all pairwise cosine similarities.",
        solution: "from sentence_transformers import SentenceTransformer\nimport numpy as np\nmodel = SentenceTransformer(\"all-MiniLM-L6-v2\")\ns = [\"I lost my password\", \"How do I reset my login?\", \"Pizza recipe\",\n     \"Ship to Germany?\", \"Delivery to Europe\"]\nv = model.encode(s, normalize_embeddings=True)\nnp.set_printoptions(precision=2)\nprint(v @ v.T)   # diagonal is 1.0; 0-1 and 3-4 should be high",
      },
      {
        level: "medium",
        task: "Write a function search(query, docs, k) that embeds the documents once (cached), embeds the query, and returns the top k documents with scores, using numpy argpartition for speed.",
        hint: "Cache document vectors in a module-level dict keyed by the tuple of docs.",
        solution: "import numpy as np\n_cache = {}\ndef search(query, docs, k=3):\n    key = tuple(docs)\n    if key not in _cache:\n        _cache[key] = model.encode(docs, normalize_embeddings=True)\n    scores = _cache[key] @ model.encode(query, normalize_embeddings=True)\n    top = np.argpartition(-scores, min(k, len(docs) - 1))[:k]\n    top = top[np.argsort(-scores[top])]\n    return [(docs[i], float(scores[i])) for i in top]",
      },
      {
        level: "hard",
        task: "Test negation: make 10 pairs like refundable and not refundable. Measure how close each pair is, and compare with pairs of truly different topics. Write down what this means for your app.",
        hint: "Compute cosine for each negation pair and for random topic pairs, and compare the averages.",
        solution: "pairs = [(\"This ticket is refundable\", \"This ticket is not refundable\"), ...]\nneg = [float(a @ b) for a, b in (model.encode(p, normalize_embeddings=True) for p in pairs)]\nrnd = [float(a @ b) for a, b in (model.encode(p, normalize_embeddings=True) for p in random_pairs)]\nprint(sum(neg) / len(neg), sum(rnd) / len(rnd))\n# Negation pairs usually score much closer than unrelated pairs.\n# So retrieval finds the topic; the LLM must read the text to get\n# yes or no right, and evals should include negated questions.",
      },
    ],
    faq: [
      { q: "What is a good embedding dimension?", a: "Bigger vectors can capture more detail but cost more storage and slower search. Many apps do well with 384 to 1024 dimensions; pick based on retrieval tests, not size alone." },
      { q: "Can I use a chat model to make embeddings?", a: "Use a model built for embeddings. Providers offer separate embedding models that are far cheaper and designed for similarity search." },
      { q: "Do embeddings work across languages?", a: "Multilingual embedding models place a sentence and its translation close together, so a query in one language can find documents in another. English-only models do this poorly." },
      { q: "Is cosine similarity the same as accuracy?", a: "No. It is a similarity score between two vectors. Whether the top results are actually right must be measured with labelled questions, using metrics like recall at k." },
    ],
  },

  "embeddings/vector-stores": {
    plain: [
      "Once you have thousands or millions of embeddings, you need somewhere to keep them and a fast way to find the closest ones to a question. That is what a vector database does: it stores vectors next to the text and details they came from, and answers which ones are nearest to this.",
      "Comparing a question with every stored vector is exact but gets slow as data grows. Vector databases use special indexes that find almost the closest vectors far faster, by checking only a small, smart part of the data. This is called approximate nearest neighbour search (ANN).",
      "pgvector is an extension for PostgreSQL, the popular open-source database. It adds a vector column type, distance operators and ANN indexes. Your embeddings then live in the same database as your users, documents and permissions, and you can query them with normal SQL.",
      "The basics are simple: create the extension, add a vector column of the right size, insert rows, and sort by distance. The skill is in the details: choosing the index, tuning it, and filtering results without losing them.",
    ],
    deepDive: [
      {
        heading: "Installing pgvector and getting data in",
        body: "pgvector must be installed on the database server, then enabled per database with CREATE EXTENSION vector. On Debian or Ubuntu with the PostgreSQL apt repository, the package is named postgresql-17-pgvector (match your server's major version). For local work, the Docker image pgvector/pgvector:pg17 comes ready to use. Most managed Postgres services already include it; you only run CREATE EXTENSION.\n\nDeclare the column with the exact dimension of your embedding model, such as vector(384) or vector(768). Inserting a vector of a different size fails.\n\nFrom Python, install the pgvector package and call register_vector on a psycopg connection, so numpy arrays are sent and received as vectors. For bulk loads, insert in batches inside one transaction, or use COPY, and build the index after loading when you can, which is faster.",
        bullets: ["CREATE EXTENSION IF NOT EXISTS vector; once per database", "vector(n) must match the model's dimension", "pip install pgvector psycopg[binary]", "Bulk load first, then create the index"],
      },
      {
        heading: "Distance operators and index types",
        body: "pgvector has one operator per distance. <-> is Euclidean (L2) distance, <=> is cosine distance (1 minus cosine similarity), <#> is the negative inner product, and <+> is L1 distance. In all of them, smaller means closer, which is why queries use ORDER BY ... LIMIT k.\n\nAn index only helps when it was built for the same operator: vector_cosine_ops for <=>, vector_l2_ops for <->, vector_ip_ops for <#>. And the query must have the shape ORDER BY embedding operator value LIMIT k; otherwise Postgres does an exact scan.\n\nThe two index types are HNSW and IVFFlat. Indexes on the vector type support up to 2,000 dimensions; the halfvec type, which stores half-precision numbers, can be indexed up to 4,000 and halves storage. With normalised vectors, inner product gives the same ranking as cosine and is slightly faster.",
        bullets: ["<=> cosine distance, <-> L2, <#> negative inner product", "Index operator class must match the query operator", "Use ORDER BY distance LIMIT k to use the index", "Index limit: 2,000 dims for vector, 4,000 for halfvec"],
      },
      {
        heading: "How HNSW finds neighbours, and how to tune it",
        body: "HNSW (hierarchical navigable small world) builds a graph in layers. The top layer has few vectors with long links; each lower layer has more vectors and shorter links; the bottom layer has every vector. A search starts at the top, greedily walks toward the query, then drops down a layer and repeats, ending with a careful local search at the bottom.\n\nTwo build settings matter: m, the links per node (default 16), and ef_construction, the candidate list size while building (default 64). Higher values give better recall but slower builds and more memory. At query time, hnsw.ef_search (default 40) sets how many candidates are kept; raise it for better recall at some cost in speed.\n\nIVFFlat instead groups vectors into lists (clusters). A query checks only the nearest ivfflat.probes lists (default 1). Build it after loading data; a starting point is lists = rows / 1000 up to a million rows, and probes around the square root of lists.",
        visual: {
          type: "layers",
          title: "An HNSW search, top to bottom",
          layers: [
            { label: "Top layer", detail: "Few nodes, long jumps toward the query" },
            { label: "Middle layers", detail: "More nodes, shorter jumps" },
            { label: "Bottom layer", detail: "Every vector, careful local search" },
            { label: "Candidate list", detail: "Keeps the best ef_search nodes" },
            { label: "Result", detail: "Return the top k by distance" },
          ],
        },
      },
      {
        heading: "Filtering by metadata without losing results",
        body: "Real queries filter: only this customer's documents, only the last year, only manuals. With an ANN index, Postgres first gets candidates from the index, then applies the WHERE clause. If the filter removes most candidates, you can get fewer rows than your LIMIT, even zero, although matching rows exist.\n\npgvector 0.8.0 added iterative index scans: SET hnsw.iterative_scan = relaxed_order (or strict_order) makes the scan keep fetching more candidates until enough rows pass the filter, up to a limit you can tune.\n\nOther fixes depend on the filter. For a few large categories, a partial index per category (CREATE INDEX ... WHERE category = 'manual') works well. For many tenants, partitioning by tenant helps. For very selective filters, a normal B-tree index on the filter column lets Postgres pick the few matching rows and compare them exactly, which is fast because there are few.",
        visual: {
          type: "flow",
          title: "Why a filter can return too few rows",
          steps: [
            { label: "ANN index scan", detail: "Returns about ef_search candidates" },
            { label: "WHERE tenant_id = 7", detail: "Most candidates belong to others" },
            { label: "Only 3 rows survive", detail: "LIMIT 10 is not met" },
            { label: "Fix", detail: "Iterative scan, partial index or partitioning" },
          ],
        },
      },
      {
        heading: "Checking recall, and when to use a dedicated vector database",
        body: "ANN means approximate, so measure how approximate. Take 50 to 100 real queries, get the exact top 10 by running them with index scans turned off (SET enable_indexscan = off inside a transaction), then compare with the indexed results. Recall at 10 is the share of the exact top 10 that the index also returned. Raise ef_search until recall is good enough for your app, while watching latency.\n\npgvector is a strong default: one database, transactions, joins with your other tables, and backups you already run. Dedicated vector databases such as Qdrant, Weaviate, Milvus or Pinecone can make sense at very large scale, for heavy filtered search across many tenants, or when you want built-in features like hybrid search and automatic sharding. Most apps can start with pgvector and move later if measurements say so.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "HNSW vs IVFFlat in pgvector",
        columns: [
          { title: "HNSW", points: ["Layered graph of neighbours", "Better speed and recall trade-off", "Slower to build, more memory", "Can be created on an empty table", "Tune with m, ef_construction, ef_search"] },
          { title: "IVFFlat", points: ["Vectors grouped into lists", "Faster to build, less memory", "Build after the data is loaded", "Tune with lists and probes"] },
        ],
      },
    ],
    examples: [
      {
        title: "Inserting and querying from Python",
        explanation: "You have chunk texts and their 768-dimension embeddings and want to store and search them. Step 1: install psycopg and pgvector, and make sure the chunks table from the explainer exists. Step 2: register the vector type on the connection so numpy arrays work. Step 3: insert a row with its source and content. Step 4: query the 5 nearest chunks by cosine distance, also returning the distance. The random vector stands in for a real embedding.",
        code: {
          lang: "python",
          code: "# pip install \"psycopg[binary]\" pgvector numpy\nimport numpy as np\nimport psycopg\nfrom pgvector.psycopg import register_vector\n\nconn = psycopg.connect(\"dbname=rag\", autocommit=True)\nregister_vector(conn)\nemb = np.random.rand(768).astype(np.float32)   # stand-in for a real embedding\nconn.execute(\"INSERT INTO chunks (source, content, embedding) VALUES (%s, %s, %s)\",\n             (\"faq.md\", \"Refunds take 5 working days.\", emb))\nrows = conn.execute(\"SELECT source, content, embedding <=> %s AS dist FROM chunks \"\n                    \"ORDER BY embedding <=> %s LIMIT 5\", (emb, emb)).fetchall()\nfor source, content, dist in rows:\n    print(f\"{dist:.3f} {source}: {content}\")",
        },
      },
      {
        title: "Tuning HNSW recall on a real table",
        explanation: "Search on 2 million chunks sometimes misses an obvious answer. Step 1: build the HNSW index with the default settings written out, so the choice is visible. Step 2: in a session, raise hnsw.ef_search from 40 to 100. Step 3: check with EXPLAIN ANALYZE that the plan uses the index and see the time. Step 4: compare results with an exact search (index scans off) for a sample of queries to measure recall, and keep the lowest ef_search that gives the recall you need.",
        code: {
          lang: "sql",
          code: "CREATE INDEX chunks_embedding_hnsw ON chunks\n  USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);\n\nSET hnsw.ef_search = 100;   -- default 40; higher = better recall, slower\n\nEXPLAIN ANALYZE\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 10;\n\n-- exact results for comparison:\nBEGIN;\nSET LOCAL enable_indexscan = off;\nSELECT id FROM chunks ORDER BY embedding <=> $1 LIMIT 10;\nCOMMIT;",
        },
      },
    ],
    cheatSheet: [
      "CREATE EXTENSION IF NOT EXISTS vector; enables pgvector in the current database",
      "<=> cosine distance, <-> L2 distance, <#> negative inner product; smaller is closer",
      "Index ops must match the operator: vector_cosine_ops goes with <=>",
      "HNSW defaults: m = 16, ef_construction = 64, hnsw.ef_search = 40",
      "IVFFlat: lists about rows / 1000 (up to 1M rows); probes about sqrt(lists)",
      "Filtered ANN can return too few rows: try SET hnsw.iterative_scan = relaxed_order (0.8.0+)",
      "Measure recall against an exact search before and after tuning",
    ],
    quiz: [
      {
        q: "Your index uses vector_l2_ops but queries sort by embedding <=> $1. What happens?",
        options: ["The index is used normally", "Postgres converts the distance automatically", "The index is not used, so the query scans every row", "The query fails with an error"],
        answer: 2,
        why: "An index serves only the operator it was built for; <=> needs vector_cosine_ops.",
      },
      {
        q: "Which setting improves HNSW recall at query time?",
        options: ["Raising hnsw.ef_search", "Lowering m", "Raising ivfflat.probes", "Setting enable_indexscan = off"],
        answer: 0,
        why: "ef_search controls how many candidates the search keeps, trading speed for recall.",
      },
      {
        q: "A query with WHERE tenant_id = 7 ORDER BY embedding <=> $1 LIMIT 10 returns only 2 rows, though tenant 7 has thousands. Why?",
        options: ["pgvector does not support WHERE", "LIMIT is ignored with indexes", "The vectors are not normalised", "The filter is applied after the index returned its candidates, and most belonged to other tenants"],
        answer: 3,
        why: "Post-filtering an ANN candidate list can leave fewer rows than the limit.",
      },
      {
        q: "When should you create an IVFFlat index?",
        options: ["Before inserting any data", "After the table has representative data", "Only on tables under 1,000 rows", "Never, it is deprecated"],
        answer: 1,
        why: "IVFFlat learns its clusters from the existing rows, so it needs data first.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start pgvector in Docker, create a table with a vector(3) column, insert three vectors and return them ordered by cosine distance to [1,0,0].",
        hint: "Use the pgvector/pgvector image and psql inside the container.",
        solution: "docker run -d --name pgv -e POSTGRES_PASSWORD=pw -p 5432:5432 pgvector/pgvector:pg17\ndocker exec -it pgv psql -U postgres\n-- in psql:\nCREATE EXTENSION IF NOT EXISTS vector;\nCREATE TABLE items (id serial PRIMARY KEY, embedding vector(3));\nINSERT INTO items (embedding) VALUES ('[1,0,0]'), ('[0.9,0.1,0]'), ('[0,1,0]');\nSELECT id, embedding <=> '[1,0,0]' AS dist FROM items ORDER BY dist;",
      },
      {
        level: "medium",
        task: "Add tenant_id and created_at columns to the chunks table and write a query that returns the 5 nearest chunks for one tenant from the last 90 days, with iterative scans enabled.",
        hint: "Set hnsw.iterative_scan in the session and keep ORDER BY distance LIMIT k.",
        solution: "ALTER TABLE chunks ADD COLUMN tenant_id int, ADD COLUMN created_at timestamptz DEFAULT now();\nCREATE INDEX ON chunks (tenant_id);\nSET hnsw.iterative_scan = relaxed_order;\nSELECT id, content\nFROM chunks\nWHERE tenant_id = $2 AND created_at > now() - interval '90 days'\nORDER BY embedding <=> $1\nLIMIT 5;",
      },
      {
        level: "hard",
        task: "Measure recall at 10 for your HNSW index at ef_search 20, 40, 100 and 200 on 50 sample queries, and record the median query time for each.",
        hint: "Compute exact results once with index scans off, then compare sets of ids.",
        solution: "def top_ids(cur, q, exact=False):\n    if exact: cur.execute(\"SET LOCAL enable_indexscan = off\")\n    cur.execute(\"SELECT id FROM chunks ORDER BY embedding <=> %s LIMIT 10\", (q,))\n    return {r[0] for r in cur.fetchall()}\nwith conn.transaction(): truth = [top_ids(conn.cursor(), q, True) for q in queries]\nfor ef in (20, 40, 100, 200):\n    conn.execute(f\"SET hnsw.ef_search = {ef}\")\n    t = time.perf_counter(); got = [top_ids(conn.cursor(), q) for q in queries]\n    ms = (time.perf_counter() - t) / len(queries) * 1000\n    recall = sum(len(a & b) for a, b in zip(got, truth)) / (10 * len(queries))\n    print(ef, round(recall, 3), round(ms, 1), \"ms avg\")",
      },
    ],
    faq: [
      { q: "Do I need a separate vector database for RAG?", a: "Usually not at first. pgvector handles millions of vectors well and keeps everything in one database; move to a dedicated store only if measurements show you need its scale or features." },
      { q: "Should I use HNSW or IVFFlat?", a: "Start with HNSW for its better speed and recall trade-off. Choose IVFFlat if build time or memory is the main constraint." },
      { q: "How much storage do vectors need?", a: "A vector uses 4 bytes per dimension plus a small header, so a 768-dimension vector is about 3 KB. A million of them is about 3 GB before indexes; halfvec halves that." },
      { q: "Does pgvector work on managed Postgres?", a: "Most major managed Postgres services include pgvector. You enable it with CREATE EXTENSION vector, but check which version they offer, since features like iterative scans need 0.8.0 or newer." },
    ],
  },

  "embeddings/chunking": {
    plain: [
      "Before you can search your documents by meaning, you have to cut them into pieces. A whole 50-page manual is too long to embed well and far too long to paste into every prompt. The pieces are called chunks, and each one is embedded and retrieved on its own.",
      "Getting clean text out comes first. PDFs and web pages are messy: page numbers, headers, menus, cookie banners and broken tables all end up mixed with the real content. If junk goes in, search returns junk.",
      "Then you decide where to cut. The simplest way is every few hundred tokens with a little overlap, so a sentence near a cut appears in both pieces. A smarter way follows the document's own structure, cutting at headings and sections so each chunk covers one idea.",
      "There is no perfect chunk size for every case. Small chunks are precise but can lose context; big chunks keep context but blur the meaning and fill up the prompt. You find the right size by testing retrieval on real questions.",
    ],
    deepDive: [
      {
        heading: "Getting clean text out of PDFs",
        body: "A PDF does not store paragraphs. It stores characters and their positions on a page, so a text extractor must guess the reading order. Two-column layouts can come out interleaved, words split across lines arrive with hyphens, tables become a stream of numbers, and every page repeats its header, footer and page number. Scanned PDFs contain only images and need OCR (optical character recognition) first.\n\nTools differ: pypdf is simple and pure Python; PyMuPDF is fast and gives layout details such as font sizes, which help find headings; pdfplumber is good at tables; layout-aware tools such as docling or unstructured try to recover headings, lists and tables as structure.\n\nWhatever you use, print the extracted text for a few real documents and read it. Remove repeated headers and footers, rejoin hyphenated words, and keep the page number as metadata for citations.",
        bullets: ["Read the extracted text before indexing it", "Strip repeated headers, footers and page numbers", "Keep page numbers as metadata, not content", "Scanned pages need OCR"],
        visual: {
          type: "flow",
          title: "Ingestion pipeline",
          steps: [
            { label: "Load", detail: "PDF, HTML, Markdown, Word" },
            { label: "Extract text", detail: "Keep headings and page numbers" },
            { label: "Clean", detail: "Drop boilerplate, fix hyphens" },
            { label: "Chunk", detail: "By structure, then by size" },
            { label: "Add metadata", detail: "Source, section path, page, date" },
            { label: "Embed and store", detail: "Vector plus text plus metadata" },
          ],
        },
      },
      {
        heading: "HTML pages: keep the content, drop the chrome",
        body: "A web page wraps its real content in menus, sidebars, footers, cookie notices and scripts. Feeding all of that to the embedder adds the same noise to every chunk, which makes unrelated pages look similar.\n\nUse a main-content extractor such as trafilatura, or BeautifulSoup with rules for your site: remove script, style, nav, header and footer elements, then take the main or article element. Keep the heading elements (h1 to h6), because they give you a free structure to chunk by. Converting the page to Markdown-like text is a practical middle ground: headings become # lines, lists stay lists, and links can be kept or dropped.\n\nFor your own documentation, it is often better to index the source files (Markdown or similar) directly instead of the rendered HTML.",
      },
      {
        heading: "Size-based chunking done well",
        body: "Measure chunk size in tokens, not characters, because embedding models have token limits. Common starting sizes are 200 to 800 tokens with 10 to 20% overlap. Check your embedding model's maximum input: many small open models stop at 512 tokens or less, and anything longer is cut off silently, so a 1,000-token chunk would only be half embedded.\n\nAvoid cutting mid-sentence. A recursive splitter tries the biggest natural break first: blank lines between paragraphs. If a piece is still too big, it splits on single line breaks, then on sentences, then on words, and finally merges small neighbouring pieces back up to the target size.\n\nOverlap helps when an answer straddles a boundary, but it duplicates text: with 20% overlap you store and embed about 25% more tokens, and search can return near-duplicate chunks.",
        visual: {
          type: "flow",
          title: "Recursive splitting",
          steps: [
            { label: "Split on blank lines", detail: "Paragraphs first" },
            { label: "Still too big?", detail: "Split on line breaks" },
            { label: "Still too big?", detail: "Split on sentence ends" },
            { label: "Last resort", detail: "Split on words" },
            { label: "Merge", detail: "Join small pieces up to the target size" },
          ],
        },
      },
      {
        heading: "Structure-aware chunking and context headers",
        body: "Documents written by people already have structure: titles, sections, subsections, lists, tables and code blocks. Splitting at headings keeps each idea together. Long sections still need size-based splitting inside them, and very short sections can be merged with their neighbours.\n\nKeep tables and code blocks whole when you can; half a table is rarely useful. Then add a context header to each chunk: the document title and the heading path, such as User guide > Billing > Refunds. Prepending it to the chunk text before embedding helps a lot, because a chunk that just says this takes 5 days now carries what this is.\n\nA related pattern is small-to-big retrieval: embed small chunks for precise matching, but when one matches, send the larger parent section to the model so it has the full context.",
        visual: {
          type: "tree",
          title: "Chunks follow the document's structure",
          root: "User guide.pdf",
          children: [
            { label: "1 Billing", children: ["1.1 Refunds: chunk 1", "1.1 Refunds: chunk 2", "1.2 Invoices: chunk 3"] },
            { label: "2 Account", children: ["2.1 Passwords: chunk 4", "2.2 Two-factor login: chunk 5"] },
            { label: "3 Limits", children: ["Table kept whole: chunk 6"] },
          ],
        },
      },
      {
        heading: "Comparing chunk sizes with real questions",
        body: "Do not pick a chunk size by feel. Write 30 to 50 real questions, and for each note where the answer lives: the document and a short exact phrase from the answer. Then build an index for each setting you want to compare, for example 256, 512 and 1,024 tokens, or fixed-size against heading-based.\n\nFor each setting, retrieve the top 5 chunks per question and check whether the answer phrase appears in any of them. The share of questions where it does is the hit rate at 5. Also record the total tokens the top 5 chunks would add to a prompt, because larger chunks cost more on every call.\n\nPick the smallest setting with a good hit rate, then read the questions it still misses. Misses often point to parsing problems, like a table that came out as noise, rather than chunk size.",
        bullets: ["30 to 50 questions with a known answer phrase", "Metric: hit rate at k", "Track prompt tokens per setting", "Read the misses: often a parsing problem"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Small vs large chunks",
        columns: [
          { title: "Small (about 100 to 250 tokens)", points: ["Precise matches", "Can lose surrounding context", "More chunks to store and search", "Cheap to put in the prompt"] },
          { title: "Large (about 800 tokens or more)", points: ["Keeps context together", "Embedding blurs several topics", "May exceed the embedder's limit", "Fills the prompt quickly"] },
        ],
      },
    ],
    examples: [
      {
        title: "Splitting Markdown by headings with a context header",
        explanation: "Your help centre is written in Markdown. Step 1: read the file line by line. Step 2: when a heading appears, close the current chunk and update the heading path, trimming it to the heading's level so a new ## replaces the old one. Step 3: start every chunk's text with its heading path, such as Billing > Refunds, so the embedding knows what the chunk is about. Step 4: keep the section path as metadata for filtering and citations. Long sections can then be split further by size.",
        code: {
          lang: "python",
          code: "import re\ndef split_by_headings(md: str) -> list[dict[str, str]]:\n    chunks, path, buf = [], [], []\n    def flush():\n        if \"\".join(buf).strip():\n            section = \" > \".join(path)\n            chunks.append({\"section\": section, \"text\": section + \"\\n\" + \"\\n\".join(buf).strip()})\n        buf.clear()\n    for line in md.splitlines():\n        if m := re.match(r\"^(#{1,6})\\s+(.*)\", line):\n            flush()\n            path[:] = path[: len(m.group(1)) - 1] + [m.group(2).strip()]\n        else:\n            buf.append(line)\n    flush()\n    return chunks",
        },
      },
      {
        title: "Testing three chunk sizes",
        explanation: "You must choose a chunk size for 400 product manuals. Step 1: write 40 questions, each with a short answer phrase copied from the manual. Step 2: build three indexes with 256, 512 and 1,024 token chunks and about 12% overlap. Step 3: for each, count how often the answer phrase appears in the top 5 chunks. Step 4: print the hit rate next to the prompt tokens the top 5 would add. build_index, docs and questions are your own code and data.",
        code: {
          lang: "python",
          code: "def hit_rate(questions: list[dict], search, k: int = 5) -> float:\n    hits = 0\n    for q in questions:\n        chunks = search(q[\"question\"], k)\n        hits += any(q[\"answer_phrase\"] in c for c in chunks)\n    return hits / len(questions)\n\nfor size in (256, 512, 1024):\n    index = build_index(docs, chunk_tokens=size, overlap_tokens=size // 8)\n    rate = hit_rate(questions, index.search)\n    print(f\"{size:>5} tokens: hit@5 = {rate:.0%}, prompt adds ~{5 * size} tokens\")",
        },
      },
    ],
    cheatSheet: [
      "Read the extracted text of a few real documents before indexing anything",
      "Measure chunk size in tokens; stay under the embedding model's max input",
      "Start around 200 to 800 tokens with 10 to 20% overlap, then test",
      "Split at headings first, then by size inside long sections",
      "Prepend the title and heading path to each chunk before embedding",
      "Store source, page and section path as metadata for filters and citations",
      "Compare settings by hit rate at k on 30 to 50 real questions",
    ],
    quiz: [
      {
        q: "Your embedding model accepts 512 tokens, and your chunks are 1,000 tokens. What happens?",
        options: ["The model averages two halves", "Usually only about the first half of each chunk is embedded", "The API splits chunks for you", "Nothing, longer is better"],
        answer: 1,
        why: "Text beyond the model's limit is typically cut off silently, so the rest is invisible to search.",
      },
      {
        q: "Why prepend the heading path, like Billing > Refunds, to each chunk?",
        options: ["It gives the chunk context, so a sentence like this takes 5 days is findable", "It makes chunks shorter", "Vector databases require it", "It removes the need for overlap"],
        answer: 0,
        why: "The header tells the embedding and the model what the chunk is about.",
      },
      {
        q: "Two-column PDF pages come out with lines from both columns mixed together. What is the best first step?",
        options: ["Use bigger chunks", "Add more overlap", "Switch embedding models", "Use a layout-aware extractor and check its output"],
        answer: 3,
        why: "This is a parsing problem; chunking settings cannot fix scrambled text.",
      },
      {
        q: "With 20% overlap, roughly how much more text do you store and embed?",
        options: ["About 2% more", "About 200% more", "About 25% more", "No extra"],
        answer: 2,
        why: "Each step advances only 80% of a chunk, so total text is about 1 / 0.8 = 1.25 times.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Extract text from a PDF with pypdf, print the first 1,000 characters of three pages, and list the junk you see (headers, page numbers, broken words).",
        hint: "PdfReader(path).pages is a list; each page has extract_text().",
        solution: "# pip install pypdf\nfrom pypdf import PdfReader\nreader = PdfReader(\"guide.pdf\")\nfor number, page in enumerate(reader.pages[:3], start=1):\n    text = page.extract_text() or \"\"\n    print(f\"--- page {number} ---\")\n    print(text[:1000])\n# Note repeated lines across pages: those are headers/footers to strip.",
      },
      {
        level: "medium",
        task: "Write a function that removes lines repeated on more than half of the pages (headers and footers) from a list of page texts.",
        hint: "Count in how many pages each stripped line appears, using a set per page.",
        solution: "from collections import Counter\ndef strip_repeated(pages: list[str]) -> list[str]:\n    counts = Counter()\n    for p in pages:\n        counts.update({l.strip() for l in p.splitlines() if l.strip()})\n    junk = {l for l, n in counts.items() if n > len(pages) / 2}\n    return [\"\\n\".join(l for l in p.splitlines() if l.strip() not in junk)\n            for p in pages]",
      },
      {
        level: "hard",
        task: "Implement a token-based chunker with overlap that never cuts inside a sentence: build chunks from whole sentences up to max_tokens, and start each new chunk with the last sentences that fit in overlap_tokens.",
        hint: "Split into sentences with a simple regex, count tokens per sentence with your tokenizer, and keep a running window.",
        solution: "import re\ndef chunk(text, count, max_tokens=400, overlap_tokens=60):\n    sents = re.split(r\"(?<=[.!?])\\s+\", text.strip())\n    chunks, cur = [], []\n    for s in sents:\n        if cur and sum(map(count, cur + [s])) > max_tokens:\n            chunks.append(\" \".join(cur))\n            keep = []\n            while cur and sum(map(count, keep + cur[-1:])) <= overlap_tokens:\n                keep.insert(0, cur.pop())\n            cur = keep\n        cur.append(s)\n    return chunks + ([\" \".join(cur)] if cur else [])",
      },
    ],
    faq: [
      { q: "What is the best chunk size for RAG?", a: "There is no universal best. A few hundred tokens with some overlap is a good start; test two or three sizes on your own questions and keep the smallest that retrieves well." },
      { q: "Should I use a library like LangChain or LlamaIndex for chunking?", a: "Their splitters are handy and well tested, especially the recursive ones. Still read the output, and make sure sizes are measured in tokens for your embedding model." },
      { q: "How do I handle tables in documents?", a: "Extract them with a table-aware tool, keep each table whole in one chunk if it fits, and add a short description or the column headers so the chunk is understandable on its own." },
    ],
  },

  "embeddings/hybrid-rerank": {
    plain: [
      "Vector search is great at meaning: it knows that money back and refund are related. But it is weak at exact words. Search for error E1042 or part SKU-4471 and the right page may not come first, because a code has little meaning to an embedding model.",
      "Keyword search is the opposite. It finds exact words and codes very well, but it misses a page that says reimbursement when the user typed refund. Hybrid search runs both kinds of search and combines the two result lists, so you get the strengths of each.",
      "Even then, the order is not perfect. A reranker is a second, more careful model. It reads the question and each candidate passage together and gives a precise relevance score. It is slower, so you use it only on the top few dozen results.",
      "Each step should earn its place. You measure how many of the top results are relevant before and after adding keywords and reranking, and keep only what helps.",
    ],
    deepDive: [
      {
        heading: "How BM25 ranks keyword matches",
        body: "BM25 is the standard formula behind most keyword search engines. It scores a document for a query by adding up a score for each query word. Two ideas drive it. Rare words count more: a word that appears in few documents, like E1042, is worth far more than a common word like login. This is inverse document frequency (IDF). And repeats help, but with diminishing returns: the tenth mention of a word adds much less than the first. This is term frequency saturation, controlled by a parameter k1 (often 1.2 to 2.0).\n\nBM25 also adjusts for length, so a long document does not win just by containing more words. The parameter b (usually 0.75) sets how strong that adjustment is.\n\nIn Python, the rank_bm25 package gives a quick in-memory BM25. Search engines such as Elasticsearch and OpenSearch use BM25 by default.",
        bullets: ["Rare words weigh more (IDF)", "Repeated words help less and less (k1)", "Long documents are normalised (b)", "Exact tokens matter: tokenise codes carefully"],
      },
      {
        heading: "Keyword search inside Postgres",
        body: "If your vectors are in Postgres, you can do keyword search in the same table. to_tsvector('english', content) turns text into a list of normalised words (lexemes): lowercased, stemmed so refunds becomes refund, with common stop words removed. Store it in a generated column and add a GIN index so matching is fast. websearch_to_tsquery('english', $1) turns user input into a query, and understands quoted phrases, or, and a minus sign for exclusion.\n\nRank matches with ts_rank or ts_rank_cd. Note that these are not BM25: they do not use corpus-wide word rarity, so a common word can score as well as a rare one. For many apps that is good enough, especially when fused with vector results. If you need true BM25 inside Postgres, extensions exist, or you can use a search engine alongside.\n\nThe english configuration stems words, which can mangle codes; the simple configuration does not stem.",
        bullets: ["Generated tsvector column plus a GIN index", "websearch_to_tsquery accepts user-style queries", "ts_rank is not BM25: no corpus-wide IDF", "simple config for codes and names"],
      },
      {
        heading: "Fusing two ranked lists",
        body: "BM25 scores and cosine distances are on completely different scales, so you cannot simply add them. Reciprocal rank fusion (RRF) avoids the problem by using only positions. Each document gets 1 / (k + rank) from each list it appears in, and the scores are summed. k = 60 comes from the original paper and works well in practice; it stops the very top rank from dominating.\n\nA document ranked 1st in one list and absent from the other gets 1/61, about 0.0164. A document ranked 3rd in both gets 2/63, about 0.0317, so it wins. Agreement between the two searches is rewarded.\n\nThe alternative is score blending: normalise each list's scores to 0 to 1, then mix with a weight, such as 0.7 vector and 0.3 keyword. It can be tuned more finely but is sensitive to score distributions. Either way, fetch more candidates from each search than you need, such as 20 to 50 each.",
        visual: {
          type: "compare",
          title: "RRF vs score blending",
          columns: [
            { title: "Reciprocal rank fusion", points: ["Uses ranks only", "No score normalising", "k = 60 is a solid default", "Rewards agreement between lists"] },
            { title: "Weighted score blend", points: ["Normalise each list to 0 to 1", "Mix with a weight like 0.7 / 0.3", "Finer control", "Sensitive to score shapes"] },
          ],
        },
      },
      {
        heading: "Rerankers: bi-encoders vs cross-encoders",
        body: "The embedding search you already have uses a bi-encoder: the query and each document are turned into vectors separately, and documents are embedded ahead of time. That is what makes it fast, but the model never sees the query and the document together.\n\nA cross-encoder takes the query and one passage as a single input and outputs a relevance score. Because it reads both at once, it notices details such as whether the passage actually answers the question or just mentions the same topic. It is much more accurate and much slower, since nothing can be computed in advance: every query and candidate pair needs a full model pass.\n\nSo rerank only the top 20 to 50 fused candidates and keep the best 3 to 10. Options include open cross-encoder models via sentence-transformers, hosted rerank APIs, or asking an LLM to judge relevance, which is the slowest and most expensive.",
        visual: {
          type: "compare",
          title: "Bi-encoder vs cross-encoder",
          columns: [
            { title: "Bi-encoder (embeddings)", points: ["Query and document encoded apart", "Document vectors pre-computed", "Searches millions quickly", "Good recall, rougher order"] },
            { title: "Cross-encoder (reranker)", points: ["Reads query and passage together", "Nothing can be pre-computed", "Only practical for dozens of items", "Sharper precision at the top"] },
          ],
        },
      },
      {
        heading: "Proving it helps",
        body: "Build a labelled set: 30 to 100 real queries, each with the ids of the chunks that answer it. Include queries with exact codes, paraphrases and vague wording. Then compare configurations on the same set: vector only, keyword only, hybrid, and hybrid plus reranking.\n\nUseful metrics: precision at k, the share of the top k that are relevant; recall at k, the share of all relevant chunks that appear in the top k; and MRR (mean reciprocal rank), which rewards putting the first relevant chunk near the top. For RAG, recall at k matters most for the retrieval step, and precision near the top matters for prompt size and answer quality.\n\nTrack latency next to quality. A reranker that adds 300 ms for a 2 point gain may or may not be worth it; the numbers let you decide.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "One hybrid query with reranking",
        actors: ["App", "Postgres", "Reranker", "LLM"],
        messages: [
          { from: 0, to: 1, label: "Keyword search: top 30" },
          { from: 0, to: 1, label: "Vector search: top 30" },
          { from: 1, to: 0, label: "Two ranked lists" },
          { from: 0, to: 0, label: "RRF merge: about 40 unique" },
          { from: 0, to: 2, label: "Score 40 query and chunk pairs" },
          { from: 2, to: 0, label: "Relevance scores" },
          { from: 0, to: 3, label: "Top 5 chunks plus the question" },
        ],
      },
    ],
    examples: [
      {
        title: "Hybrid search with RRF in one SQL query",
        explanation: "Your chunks table has an embedding column and a generated tsv column. Step 1: the kw CTE takes the top 30 keyword matches and numbers them by rank. Step 2: the vec CTE takes the top 30 by cosine distance, also numbered. Step 3: a full outer join keeps chunks found by either search. Step 4: each chunk scores 1 / (60 + rank) per list, missing lists count as 0, and the 10 best come back. $1 is the query text and $2 its embedding.",
        code: {
          lang: "sql",
          code: "WITH kw AS (\n  SELECT id, row_number() OVER (ORDER BY ts_rank_cd(tsv, q) DESC) AS r\n  FROM chunks, websearch_to_tsquery('english', $1) q\n  WHERE tsv @@ q ORDER BY ts_rank_cd(tsv, q) DESC LIMIT 30\n), vec AS (\n  SELECT id, row_number() OVER (ORDER BY embedding <=> $2) AS r\n  FROM chunks ORDER BY embedding <=> $2 LIMIT 30\n)\nSELECT COALESCE(kw.id, vec.id) AS id,\n       COALESCE(1.0 / (60 + kw.r), 0) + COALESCE(1.0 / (60 + vec.r), 0) AS score\nFROM kw FULL OUTER JOIN vec ON kw.id = vec.id\nORDER BY score DESC\nLIMIT 10;",
        },
      },
      {
        title: "Reranking candidates with a cross-encoder",
        explanation: "Hybrid search returns 40 candidates, and you want the best 3 for the prompt. Step 1: load a small open cross-encoder trained for search relevance. Step 2: build one pair per candidate: the query and the chunk text. Step 3: score all pairs in one predict call. Step 4: sort by score and keep the top 3. The chunk that explains error E1042 should now rank above chunks that merely mention login.",
        code: {
          lang: "python",
          code: "# pip install sentence-transformers\nfrom sentence_transformers import CrossEncoder\n\nreranker = CrossEncoder(\"cross-encoder/ms-marco-MiniLM-L-6-v2\")\nquery = \"error E1042 on login\"\ncandidates = [\n    \"Login page redesign: new colours and layout.\",\n    \"E1042 means your session token expired. Sign out and sign in again.\",\n    \"How to enable two-factor login.\",\n]\nscores = reranker.predict([(query, text) for text in candidates])\nranked = sorted(zip(scores, candidates), reverse=True)\nfor score, text in ranked[:3]:\n    print(f\"{score:.2f}  {text}\")",
        },
      },
    ],
    cheatSheet: [
      "Keyword search wins on codes, names and rare terms; vectors win on paraphrases",
      "Postgres: tsvector generated column + GIN index + websearch_to_tsquery",
      "ts_rank is not BM25; it has no corpus-wide word rarity",
      "RRF score = sum of 1 / (60 + rank) across lists",
      "Fetch 20 to 50 candidates per search, rerank them, keep 3 to 10",
      "Cross-encoders read query and passage together: accurate but slow",
      "Compare vector, hybrid and hybrid + rerank on precision, recall, MRR and latency",
    ],
    quiz: [
      {
        q: "In BM25, why does the word E1042 count more than the word login?",
        options: ["It is longer", "It contains digits", "It appears in fewer documents, so its IDF is higher", "It appears first in the query"],
        answer: 2,
        why: "Inverse document frequency gives rare terms more weight than common ones.",
      },
      {
        q: "Using RRF with k = 60, which document scores higher?",
        options: ["Ranked 3rd in both lists", "Ranked 1st in one list only", "They score the same", "It depends on the cosine values"],
        answer: 0,
        why: "2 / 63 (about 0.032) beats 1 / 61 (about 0.016), so agreement wins.",
      },
      {
        q: "Why not rerank all 100,000 chunks with a cross-encoder?",
        options: ["Cross-encoders only accept 100 inputs", "It would lower accuracy", "Rerankers need GPUs that do not exist", "Each pair needs a full model pass, which is far too slow at that scale"],
        answer: 3,
        why: "Nothing can be pre-computed for a cross-encoder, so cost grows with every candidate.",
      },
      {
        q: "What does MRR reward?",
        options: ["Retrieving many chunks", "Putting the first relevant result near the top", "Fast query times", "Shorter chunks"],
        answer: 1,
        why: "Mean reciprocal rank averages 1 / rank of the first relevant result per query.",
      },
      {
        q: "Why can't you just add a BM25 score to a cosine similarity?",
        options: ["They are on different, unrelated scales", "Postgres cannot add numbers from two CTEs", "Cosine similarity is always negative", "BM25 scores are always zero"],
        answer: 0,
        why: "Different scales mean one score dominates; RRF or normalisation is needed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Use rank_bm25 to rank 5 short documents for the query reset password, and print the scores.",
        hint: "Tokenise by lowercasing and splitting on spaces; BM25Okapi takes a list of token lists.",
        solution: "# pip install rank_bm25\nfrom rank_bm25 import BM25Okapi\ndocs = [\"How to reset your password\", \"Billing and invoices\",\n        \"Password rules and length\", \"Reset two-factor login\", \"Shipping times\"]\nbm25 = BM25Okapi([d.lower().split() for d in docs])\nscores = bm25.get_scores(\"reset password\".split())\nfor score, doc in sorted(zip(scores, docs), reverse=True):\n    print(f\"{score:.2f}  {doc}\")",
      },
      {
        level: "medium",
        task: "Add keyword search to the pgvector chunks table: a generated tsvector column, a GIN index, and a query that returns the top 10 matches for a user query with their rank.",
        hint: "GENERATED ALWAYS AS (to_tsvector('english', content)) STORED.",
        solution: "ALTER TABLE chunks ADD COLUMN tsv tsvector\n  GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;\nCREATE INDEX chunks_tsv_gin ON chunks USING gin (tsv);\n\nSELECT id, ts_rank_cd(tsv, q) AS rank, left(content, 80)\nFROM chunks, websearch_to_tsquery('english', 'reset password -admin') q\nWHERE tsv @@ q\nORDER BY rank DESC\nLIMIT 10;",
      },
      {
        level: "hard",
        task: "Compare vector only, hybrid (RRF) and hybrid plus rerank on 30 labelled queries. Report precision at 5, MRR and median latency for each.",
        hint: "Write one function per configuration that returns ranked chunk ids, then score them all the same way.",
        solution: "import statistics, time\ndef evaluate(search):\n    p5, rr, ms = [], [], []\n    for q in labelled:                      # {\"query\": str, \"relevant\": set_of_ids}\n        t = time.perf_counter(); ids = search(q[\"query\"])[:5]\n        ms.append((time.perf_counter() - t) * 1000)\n        p5.append(len(set(ids) & q[\"relevant\"]) / 5)\n        rr.append(next((1 / (i + 1) for i, d in enumerate(ids) if d in q[\"relevant\"]), 0))\n    return statistics.mean(p5), statistics.mean(rr), statistics.median(ms)\nfor name, fn in [(\"vector\", vector_search), (\"hybrid\", hybrid_search), (\"rerank\", hybrid_rerank)]:\n    print(name, [round(x, 3) for x in evaluate(fn)])",
      },
    ],
    faq: [
      { q: "Is hybrid search always better than vector search?", a: "Usually it helps when users search with exact terms such as codes, names or error messages. Measure it on your own queries; for purely conversational questions the gain can be small." },
      { q: "What is the difference between a reranker and an embedding model?", a: "An embedding model turns each text into a vector separately, so it can search huge collections fast. A reranker reads the query and one passage together and scores them, which is more accurate but only practical for a short list." },
      { q: "Why is k = 60 used in reciprocal rank fusion?", a: "It is the value from the original RRF paper and works well across many datasets. It keeps a single top rank from outweighing consistent good ranks in both lists." },
      { q: "Do I need Elasticsearch for hybrid search?", a: "No. Postgres full-text search plus pgvector can do hybrid search in one database. A dedicated search engine helps if you need true BM25, advanced text analysis or very large scale." },
    ],
  },
};

export default extra;
