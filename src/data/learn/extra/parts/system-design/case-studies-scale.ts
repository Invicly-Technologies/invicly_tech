import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "case-studies-scale/news-feed": {
    plain: [
      "A news feed is the scrolling list you see when you open a social app: recent posts from the people and pages you follow. It looks simple, but a big network has hundreds of millions of users opening the app many times a day. Each feed must load in well under a second.",
      "There are two basic ways to build a feed. You can do the work when someone posts: copy the new post into the feed of every follower (fan-out on write, also called push). Or you can do the work when someone reads: collect the latest posts from everyone they follow and merge them (fan-out on read, also called pull).",
      "Push makes reading fast but makes posting expensive. If a pop star with 100 million followers posts, push means 100 million writes. Pull makes posting cheap but makes every read slow. Real systems mix both: push for normal accounts, pull for very popular ones.",
      "After you collect the candidate posts, you still need to decide the order. A simple feed sorts by time. Most modern feeds rank posts with a score, for example how likely you are to like or comment. Ranking is a separate step that runs on a few hundred candidates, not on everything.",
    ],
    deepDive: [
      {
        heading: "Requirements and the numbers that drive the design",
        body: "Start by asking what the feed must do. Typical answers: show posts from followed accounts, newest or ranked first, with text, images and video; support likes and comments; load the first page in under 200 ms at p99. Ask whether the feed must be perfectly fresh. Usually a delay of a few seconds is fine, which allows eventual consistency (data that becomes correct after a short delay).\n\nThen estimate. Say 300 million daily active users, each opening the feed 10 times a day. That is 3 billion feed reads a day, about 35,000 per second on average and around 100,000 at peak. If each user posts once a day and has 200 followers on average, push fan-out creates 300 million times 200, or 60 billion feed inserts a day, about 700,000 per second. That write number is why the fan-out choice matters so much.",
        bullets: ["Reads outnumber posts by about 10 to 1 here", "Average follower counts hide a long tail of huge accounts", "Fresh within seconds is usually acceptable"],
      },
      {
        heading: "APIs and the data model",
        body: "Keep the public API small. POST /v1/posts creates a post and returns its ID. GET /v1/feed?cursor=X&limit=20 returns one page plus a nextCursor. Use cursor pagination (the cursor is the last post ID or timestamp you showed) instead of page numbers, because new posts arrive at the top all the time and page numbers would shift and show duplicates.\n\nStore three kinds of data separately. Posts live in a sharded database keyed by post ID. The follow graph stores edges in both directions: who I follow, for building my pull feed, and who follows me, for push fan-out. Feeds live in a cache such as Redis as a list of post IDs per user, trimmed to a few hundred entries. Post IDs that sort by time (for example Snowflake-style IDs with a timestamp in the high bits) let you sort and paginate without reading the post itself.",
        visual: {
          type: "layers",
          title: "Where each piece of feed data lives",
          layers: [
            { label: "Feed cache", detail: "feed:{userId} holds the latest post IDs" },
            { label: "Post cache", detail: "Hot posts by ID, used to fill in the page" },
            { label: "Social graph store", detail: "Follower and following lists, sharded by user" },
            { label: "Post database", detail: "Source of truth, sharded by post ID" },
            { label: "Media in object storage", detail: "Images and video served through a CDN" },
          ],
        },
      },
      {
        heading: "The hybrid fan-out in detail",
        body: "With a hybrid, the system marks some accounts as hot, for example anyone with more than about 10,000 to 100,000 followers (the exact threshold is a tuning knob). When a normal user posts, a fan-out worker reads their follower list in batches and prepends the post ID to each follower's feed list. When a hot account posts, nothing is pushed; the post just sits in that account's own recent-posts list.\n\nAt read time the feed service takes your precomputed list, then fetches recent posts from the hot accounts you follow, merges the lists by time, removes duplicates and hands the candidates to ranking. A further saving: skip push for users who have not opened the app in weeks. Build their feed by pull when they come back, since pushing to inactive users wastes most of the writes.",
        bullets: ["Hot threshold is tuned, not fixed", "Skip push for inactive followers", "Merge pushed and pulled lists, then deduplicate"],
      },
      {
        heading: "Ranking, caching and keeping feeds correct",
        body: "Ranking usually runs in stages. Candidate generation gathers a few hundred to a few thousand post IDs. A light model scores them quickly, then a heavier model reorders the top part using signals like how often you interact with the author, post age, and engagement so far. The result for the first page can be cached briefly per user.\n\nPrecomputed feeds go stale when something changes. If a post is deleted or its privacy changes, you cannot cheaply remove it from millions of lists. The common fix is to filter at read time: when hydrating post IDs into full posts, drop any that are deleted, hidden or from someone you have since blocked or unfollowed. Hydration (turning IDs into full posts) uses a multi-get against the post cache, so one page needs only a few round trips.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Reading one feed page (hybrid)",
        steps: [
          { label: "GET /v1/feed", detail: "Feed service gets user ID and cursor" },
          { label: "Read pushed IDs", detail: "Range read on feed:{userId} after the cursor" },
          { label: "Pull hot accounts", detail: "Recent posts of followed celebrities" },
          { label: "Merge and filter", detail: "Sort by time, drop deleted or blocked" },
          { label: "Rank", detail: "Score candidates, keep the top 20" },
          { label: "Hydrate and return", detail: "Multi-get posts, return page and nextCursor" },
        ],
      },
    ],
    examples: [
      {
        title: "Estimating the cost of pure push",
        explanation: "An interviewer asks: why not just push everything? Step 1: take 300 million users posting once a day with 200 followers on average, which is 60 billion inserts a day. Step 2: now add the tail. One account with 100 million followers posting 10 times a day adds 1 billion inserts by itself, all in short bursts. Step 3: store only 8-byte post IDs, capped at 500 per user: 300 million times 500 times 8 bytes is about 1.2 TB of cache, which is fine. Conclusion: memory is affordable, but the write bursts from hot accounts are not, so pull those.",
        code: {
          lang: "text",
          code: "push writes/day = 300M users * 1 post * 200 followers = 60B\n               ≈ 700K inserts/s average\none celebrity  = 100M followers * 10 posts = 1B inserts/day\nfeed cache     = 300M * 500 IDs * 8 B ≈ 1.2 TB (plus overhead)",
        },
      },
      {
        title: "A fan-out worker with Redis",
        explanation: "When a normal user posts, the post service saves the post and puts a job on a queue. A worker picks it up, pages through the follower list, and for each follower adds the post ID to the front of their list and trims it to 500 entries. Using a pipeline sends many commands in one round trip. If the worker crashes halfway, the job is retried, so the insert should be safe to repeat; a sorted set keyed by post ID gives that for free because adding the same member twice changes nothing.",
        code: {
          lang: "python",
          code: "import redis\nr = redis.Redis()\n\ndef fan_out(post_id: int, ts: float, follower_ids: list[int]) -> None:\n    pipe = r.pipeline(transaction=False)\n    for uid in follower_ids:\n        key = f\"feed:{uid}\"\n        pipe.zadd(key, {post_id: ts})       # same post twice is a no-op\n        pipe.zremrangebyrank(key, 0, -501)  # keep the newest 500\n    pipe.execute()",
        },
      },
    ],
    cheatSheet: [
      "Push for normal users, pull for hot accounts, merge at read time",
      "Store post IDs in feeds; hydrate full posts from a post cache",
      "Use cursor pagination, never page numbers, for feeds",
      "Time-sortable IDs (Snowflake style) let you sort and page by ID",
      "Filter deleted, private or blocked posts at read time",
      "Skip push for long-inactive users; build their feed on return",
      "Run fan-out asynchronously through a queue with retries",
      "Cap each feed list (for example 500 IDs) to bound memory",
    ],
    quiz: [
      {
        q: "Why do feed caches usually store post IDs instead of full posts?",
        options: ["IDs are easier to rank", "Full posts would be copied into every follower's list, wasting memory and making edits hard", "Redis cannot store text", "IDs are encrypted"],
        answer: 1,
        why: "One post would be duplicated thousands of times, and every edit or delete would need to update all copies.",
      },
      {
        q: "Which accounts are best served by fan-out on read?",
        options: ["Accounts with very many followers", "New accounts", "Accounts that post rarely", "Private accounts"],
        answer: 0,
        why: "Pushing a post to millions of followers causes huge write bursts, so their posts are pulled at read time.",
      },
      {
        q: "Why use cursor pagination for a feed?",
        options: ["It uses less bandwidth", "It is required by HTTP", "It hides the total count", "New posts keep arriving, so page numbers would shift and repeat items"],
        answer: 3,
        why: "A cursor marks a fixed position, so new posts at the top do not change what the next page contains.",
      },
      {
        q: "A post is deleted after it was pushed to 2 million feeds. What is the usual approach?",
        options: ["Remove it from all 2 million lists before confirming the delete", "Rebuild every feed overnight", "Filter it out when hydrating posts at read time", "Leave it visible"],
        answer: 2,
        why: "Read-time filtering is cheap and immediate; lazy cleanup can follow later.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the two main API endpoints for a feed, including request and response fields.",
        hint: "One endpoint writes a post, one reads a page of the feed with a cursor.",
        solution: "POST /v1/posts\n  body: { text, mediaIds[] }  -> 201 { postId, createdAt }\nGET /v1/feed?cursor=<lastPostId>&limit=20\n  -> 200 { posts: [{ postId, author, text, media, createdAt }],\n           nextCursor }",
      },
      {
        level: "medium",
        task: "Estimate the push fan-out rate for 100 million DAU who post twice a day with 150 followers on average. Is it feasible?",
        hint: "Multiply posts by followers, then divide by about 86,400 seconds.",
        solution: "posts/day = 100M * 2 = 200M\ninserts/day = 200M * 150 = 30B\ninserts/s ≈ 30B / 86,400 ≈ 350K average, maybe 1M peak\nFeasible with a sharded Redis cluster and async workers,\nbut only if hot accounts are excluded from push.",
      },
      {
        level: "hard",
        task: "Describe the read path when a user follows 300 normal accounts and 5 celebrities, and say how you keep p99 under 200 ms.",
        hint: "Think about how many network calls you make and which ones can run in parallel.",
        solution: "1. Range read feed:{me} after the cursor (1 call)\n2. In parallel, read recent IDs of the 5 celebrities (1 pipelined call)\n3. Merge by timestamp, dedupe, drop blocked authors\n4. Rank ~500 candidates with a fast model, keep 20\n5. Multi-get the 20 posts from the post cache (1 call)\n6. Cache the ranked first page for a short time\nAbout 3 round trips, all to in-memory stores.",
      },
    ],
    faq: [
      { q: "Does Twitter or Instagram use push or pull?", a: "Public talks from these companies describe hybrids: precomputed timelines for most users, with posts from very large accounts merged in at read time. The exact details change over time and are not fully public." },
      { q: "How is a ranked feed different from a chronological one?", a: "A chronological feed sorts candidates by time. A ranked feed scores the same candidates with a model that predicts how much you will care, then sorts by that score." },
      { q: "Where should I start in a news feed interview?", a: "Clarify features and scale, then sketch the post and feed APIs, the data stores, and the fan-out choice. The celebrity problem is the deep dive most interviewers expect." },
    ],
  },

  "case-studies-scale/chat": {
    plain: [
      "A chat system lets people send messages that arrive almost instantly, like WhatsApp or Slack. The phone keeps a long-lived connection open to a server, so the server can push a new message the moment it arrives instead of the phone asking again and again.",
      "There are two main kinds of chat. One-to-one chat is between two people. Group chat sends each message to many members. Groups need extra care, because one message may need to reach hundreds of people, some online and some offline.",
      "Messages must not get lost, must show up in the right order, and should not appear twice. The server saves each message before saying it was sent. When someone is offline, the app gets a push notification and downloads missed messages when it reconnects.",
      "Chat also shows presence: whether a friend is online or when they were last seen. This is done with small heartbeat messages every few seconds. If the heartbeats stop, the person is marked offline after a short timeout.",
    ],
    deepDive: [
      {
        heading: "Requirements and scale",
        body: "Ask first: one-to-one only, or groups too? How big can a group get? Do we need read receipts, typing indicators, media, multiple devices per user, end-to-end encryption? Must history be kept forever? Each answer changes the design. A typical scope: one-to-one and groups up to a few hundred members, text plus media links, delivered and read receipts, history kept, several devices per user.\n\nFor scale, assume 50 million daily active users sending 40 messages each. That is 2 billion messages a day, about 23,000 per second on average and maybe 70,000 at peak. At around 100 bytes of text each, that is about 200 GB of new text per day, roughly 73 TB a year before replication. Connections matter as much as messages: if 10 million users are online at once and one server can hold about 100,000 to 500,000 idle WebSockets, you need tens to a hundred gateway servers.",
        bullets: ["Messages per second sizes the message service", "Concurrent connections size the gateway fleet", "Group size limits fan-out cost"],
      },
      {
        heading: "Handling WebSocket connections",
        body: "A WebSocket starts as an HTTP request with an Upgrade header, then stays open so both sides can send frames at any time. Gateway servers hold these connections. They are stateful: Bob's connection lives on exactly one server. So each gateway writes user ID to server ID into a session registry (often Redis) when a user connects, and removes it when the connection closes.\n\nLoad balancers in front of gateways must support long-lived connections, and you need idle timeouts longer than your heartbeat interval. When a gateway is restarted for a deploy, its clients disconnect and reconnect to another server, so clients should retry with exponential backoff plus random jitter. Without jitter, thousands of clients reconnect in the same second and overload the remaining servers (a thundering herd).",
        visual: {
          type: "sequence",
          title: "Connect, register and receive",
          actors: ["Bob's phone", "Gateway B", "Session registry", "Message svc"],
          messages: [
            { from: 0, to: 1, label: "WebSocket upgrade with auth token" },
            { from: 1, to: 2, label: "SET session:bob = gateway-B" },
            { from: 0, to: 1, label: "Heartbeats keep session and presence fresh" },
            { from: 3, to: 2, label: "Where is bob?" },
            { from: 2, to: 3, label: "gateway-B" },
            { from: 3, to: 1, label: "Deliver message" },
            { from: 1, to: 0, label: "Push frame to the phone" },
          ],
        },
      },
      {
        heading: "Storing messages and keeping order",
        body: "Chat data is write-heavy and is almost always read by conversation, newest first. That fits a wide-column store like Cassandra or ScyllaDB with conversation ID as the partition key and a sequence number as the clustering key, so one conversation's messages sit together on disk in order. Very active conversations can be split into time buckets (conversation ID plus month) so no partition grows without limit.\n\nWall clocks on different servers drift, so do not order by timestamp. Instead, give each message a per-conversation sequence number when it is stored. The client also sends a client message ID; if the network drops and the client resends, the server sees the same ID and does not store a duplicate. Clients track the last sequence they have, and on reconnect ask for everything after it. Gaps in sequence numbers tell a client it missed something.",
        bullets: ["Partition key: conversation ID", "Clustering key: sequence number, descending", "Client message ID makes retries idempotent", "Sync with after_seq on reconnect"],
      },
      {
        heading: "Groups, presence and delivery guarantees",
        body: "For small groups, the message service stores the message once, then looks up each member in the session registry and forwards it to their gateways. Offline members get a push notification through APNs (Apple) or FCM (Google). For very large groups or channels, fan-out to every member on every message is expensive, so clients may fetch new messages when they open the channel instead.\n\nPresence is a cheap but chatty feature. Clients send heartbeats; a missing heartbeat for, say, 60 seconds marks the user offline. Send presence changes only to contacts who are currently viewing that person, not to everyone, or a single popular user can generate huge traffic.\n\nMost chat systems give at-least-once delivery: the server retries until the device acks, and the client drops duplicates using message IDs. Combined, the user sees each message exactly once.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Ways to get new messages to a client",
        columns: [
          { title: "Short polling", points: ["Client asks every few seconds", "Simple, works everywhere", "Wasteful, slow to notice"] },
          { title: "Long polling", points: ["Server holds request until data", "Better latency than polling", "Reconnect after every message"] },
          { title: "WebSocket", points: ["One persistent two-way connection", "Lowest latency, little overhead", "Stateful servers need a registry", "Standard choice for chat"] },
        ],
      },
    ],
    examples: [
      {
        title: "Bob is offline when Alice writes",
        explanation: "Step 1: Alice's app sends the message with a client message ID over her WebSocket. Step 2: the message service assigns sequence 1043 in that conversation, stores it, and acks Alice, who sees one tick. Step 3: the registry has no live session for Bob, so the service sends a push notification through FCM or APNs. Step 4: Bob opens the app, connects, and asks for messages after the last sequence he has. Step 5: his app acks 1043 and Alice sees the delivered tick.",
        code: {
          lang: "text",
          code: "Bob reconnects:\n  GET /v1/conversations/c42/messages?after_seq=1042\n  -> [{ seq: 1043, sender: alice, body: \"Lunch?\" }]\n  WS send { type: \"ack\", conv: \"c42\", seq: 1043 }\nServer -> Alice: { type: \"delivered\", conv: \"c42\", seq: 1043 }",
        },
      },
      {
        title: "A resend after a network drop",
        explanation: "Alice sends a message in a tunnel. The server stores it, but the ack never reaches her. Her app times out and resends with the same client message ID. Step 1: the server checks a recent-IDs table (or a unique index on conversation plus client message ID). Step 2: it finds the existing message and returns the original sequence number instead of storing a second copy. Step 3: Alice sees one message, Bob sees one message. Without the client ID, Bob would see the text twice.",
        code: {
          lang: "sql",
          code: "-- one way to enforce it in a relational store\nCREATE TABLE messages (\n  conversation_id bigint,\n  seq            bigint,\n  client_msg_id  uuid,\n  sender_id      bigint,\n  body           text,\n  PRIMARY KEY (conversation_id, seq),\n  UNIQUE (conversation_id, client_msg_id)\n);",
        },
      },
    ],
    cheatSheet: [
      "WebSocket = HTTP Upgrade, then a persistent two-way connection",
      "Session registry maps user ID to the gateway holding their socket",
      "Order by per-conversation sequence number, not server clocks",
      "Persist first, then ack the sender",
      "Client message IDs turn at-least-once delivery into no duplicates",
      "Offline users: push via APNs or FCM, then sync after_seq on reconnect",
      "Reconnect with exponential backoff plus jitter to avoid a thundering herd",
      "Partition messages by conversation ID; bucket by time for huge chats",
    ],
    quiz: [
      {
        q: "Why do chat gateways need a session registry?",
        options: ["To store message history", "To encrypt messages", "Each user's connection lives on one specific server, so others must find it", "To rate limit users"],
        answer: 2,
        why: "Gateways are stateful, so the message service must look up which server holds the recipient's socket.",
      },
      {
        q: "What is the safest way to order messages in one conversation?",
        options: ["A per-conversation sequence number assigned on write", "The sender's phone clock", "The gateway server's timestamp", "Alphabetical order of message IDs from random UUIDs"],
        answer: 0,
        why: "Clocks drift across devices and servers, while a sequence number is strictly increasing per conversation.",
      },
      {
        q: "A client resends a message after a timeout. How does the server avoid storing it twice?",
        options: ["It compares message text", "It checks the client message ID it already stored", "It drops all resends", "It waits 10 seconds before saving"],
        answer: 1,
        why: "The client message ID identifies the same logical message, so the retry is recognised.",
      },
      {
        q: "Why add random jitter to client reconnect delays?",
        options: ["To save battery only", "To improve encryption", "To keep message order", "So thousands of clients don't reconnect in the same instant after a server restart"],
        answer: 3,
        why: "Jitter spreads reconnects out and prevents a thundering herd on the remaining servers.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Estimate messages per second and daily storage for 20 million DAU sending 50 messages a day at 150 bytes each.",
        hint: "A day has about 86,400 seconds; use 10^5 for a quick estimate.",
        solution: "messages/day = 20M * 50 = 1B\navg rate ≈ 1B / 86,400 ≈ 11,600 msg/s (peak ~3x ≈ 35K)\nstorage/day = 1B * 150 B = 150 GB\nwith 3 replicas ≈ 450 GB/day",
      },
      {
        level: "medium",
        task: "Design the message table for a wide-column store so that loading the latest 50 messages of a chat is one fast read, even for chats with millions of messages.",
        hint: "Pick the partition key, the clustering order, and a way to cap partition size.",
        solution: "PRIMARY KEY ((conversation_id, month_bucket), seq)\nWITH CLUSTERING ORDER BY (seq DESC)\nRead: SELECT * FROM messages\n      WHERE conversation_id = ? AND month_bucket = ?\n      LIMIT 50;\nIf fewer than 50 rows, read the previous month bucket.",
      },
      {
        level: "hard",
        task: "A gateway server crashes with 200,000 users connected. Walk through what happens to connections, the registry and in-flight messages.",
        hint: "Think about stale registry entries, client retries and messages not yet acked by devices.",
        solution: "1. Clients see the socket close and reconnect with backoff+jitter\n2. They land on other gateways, which overwrite session:{user}\n3. Stale entries pointing at the dead server expire via TTL\n   or fail on send, so the message svc treats user as offline\n4. Messages were persisted before ack, so nothing is lost\n5. Unacked messages are found via after_seq sync on reconnect\n6. Offline users in the gap get push notifications",
      },
    ],
    faq: [
      { q: "Why not use plain HTTP requests for chat?", a: "You can, with polling, but it adds delay and wastes requests. WebSockets keep one connection open so the server can push messages the moment they arrive." },
      { q: "Is exactly-once delivery possible?", a: "Not over an unreliable network on its own. Systems use at-least-once delivery with retries and remove duplicates on the client using message IDs, which looks exactly-once to the user." },
      { q: "Which database is good for chat messages?", a: "Wide-column stores such as Cassandra or ScyllaDB are common because they handle heavy writes and read one conversation in order. A sharded relational database can also work at smaller scale." },
      { q: "How does end-to-end encryption change the design?", a: "The server can no longer read or search message bodies; it only stores and forwards encrypted blobs. Key exchange (for example the Signal protocol) and multi-device key handling become part of the design." },
    ],
  },

  "case-studies-scale/video-streaming": {
    plain: [
      "A video platform like YouTube or Netflix has two jobs. First, accept videos that people upload and prepare them for watching. Second, send those videos to millions of viewers smoothly, on fast and slow connections alike.",
      "Preparing a video is called transcoding. The original file is converted into several versions: small and low quality for weak mobile signals, large and sharp for fast home internet. Each version is also cut into short pieces, a few seconds long, called segments.",
      "When you press play, the player downloads a small list file (a manifest) that says which versions exist. It then downloads segments one by one. If your connection gets slower, it switches to a lower quality for the next segment. This is adaptive bitrate streaming, and it is why video rarely stops completely.",
      "Almost all the bytes come from a CDN (content delivery network), a set of servers placed close to viewers around the world. Storage and network traffic are the biggest costs, so many design choices are about spending less on them.",
    ],
    deepDive: [
      {
        heading: "Requirements and estimates",
        body: "Clarify what matters: upload size limits, how fast a new video must be watchable, which devices play it, whether live streaming is in scope (usually not in a first pass), and target start-up time, for example under 2 seconds. Playback must be highly available; upload processing can take minutes.\n\nThe explainer's numbers show storage of several petabytes per day for a huge platform. Bandwidth is the other big figure. A useful mental table of rough bitrates for H.264 video: 480p about 1 to 2 Mbps, 720p about 3 to 5 Mbps, 1080p about 5 to 8 Mbps, and 4K about 15 to 25 Mbps. Newer codecs such as VP9 and AV1 need roughly 30 to 50 percent less for similar quality, at the cost of much slower encoding. Multiply bitrate by concurrent viewers to get egress, and you quickly see why only a CDN can serve it.",
        bullets: ["1 Mbps for 1 hour ≈ 450 MB", "Egress = concurrent viewers * average bitrate", "Better codecs trade encode CPU for less storage and egress"],
      },
      {
        heading: "The upload and transcoding pipeline",
        body: "Large files should go straight to object storage (such as S3) using a pre-signed URL and multipart upload, so a lost connection only retries one part. When the upload finishes, storage emits an event that starts a workflow.\n\nThe workflow first inspects the file (duration, resolution, codec), then splits it into chunks at keyframes (frames that can be decoded on their own). Many workers transcode chunks in parallel into each rendition, which turns a two-hour encode into minutes. A packager then produces HLS or DASH segments and manifests, a thumbnail job grabs preview images, and the metadata database marks the video ready.\n\nModel this as a DAG (a graph of steps where each step runs after the ones it depends on) with retries per step. A failed 4K chunk should retry alone, not restart the whole video.",
        visual: {
          type: "tree",
          title: "One upload becomes many files",
          root: "Original upload",
          children: [
            { label: "Video renditions", children: ["240p, 360p, 480p", "720p, 1080p", "4K for popular or premium titles"] },
            { label: "Audio tracks", children: ["AAC stereo", "Extra languages if provided"] },
            { label: "Packaging", children: ["HLS segments and .m3u8 playlists", "DASH segments and .mpd manifest"] },
            { label: "Extras", children: ["Thumbnails and preview sprites", "Captions (WebVTT)"] },
          ],
        },
      },
      {
        heading: "How adaptive bitrate really decides",
        body: "The master manifest lists every rendition with its bandwidth and resolution. Each rendition has its own playlist of segments, typically 2 to 6 seconds long. The player keeps a buffer, for example 10 to 30 seconds of video downloaded ahead.\n\nPlayer algorithms combine two signals. Throughput-based logic measures how fast recent segments downloaded and picks the highest rendition that fits under that speed with a safety margin. Buffer-based logic looks at how full the buffer is: a nearly empty buffer means step down now, a full buffer means it is safe to try higher. Real players such as hls.js, Shaka Player and the native players on phones blend both.\n\nShorter segments let the player react faster but add more requests and slightly worse compression. Start-up often begins at a low rendition so the first frame appears quickly, then climbs.",
      },
      {
        heading: "CDN delivery and cost trade-offs",
        body: "Segments are static files, which is perfect for CDN caching. Popular videos sit in edge caches near viewers; a cache miss goes to a regional shield cache and only then to origin storage. Cache hit ratios above 90 percent are normal for popular content. Very large platforms also place their own cache boxes inside internet providers' networks (Netflix Open Connect is a public example) to cut transit costs further.\n\nCost levers: encode the long tail of rarely watched videos in fewer renditions and only re-encode with expensive codecs like AV1 once a video gets popular. Move old, cold originals to cheaper storage classes. Use signed URLs or tokens with short expiry so others cannot hotlink your segments and run up your bill. Watch metrics like start-up time, rebuffer ratio and average bitrate to see if savings hurt viewers.",
        bullets: ["Hot titles: all renditions, best codec, pre-warmed at the edge", "Long tail: fewer renditions, cheaper storage", "Signed URLs stop hotlinking"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Where a segment request is answered",
        layers: [
          { label: "Player", detail: "Requests seg_0042.ts for 720p" },
          { label: "CDN edge near the viewer", detail: "Most requests end here as cache hits" },
          { label: "Regional shield cache", detail: "Collapses misses from many edges" },
          { label: "Origin object storage", detail: "Holds every segment, rarely hit" },
        ],
      },
    ],
    examples: [
      {
        title: "Reading an HLS master playlist",
        explanation: "The player first fetches the master playlist. Each EXT-X-STREAM-INF line describes one rendition: its peak bandwidth in bits per second, resolution and codecs. The next line is the URL of that rendition's own playlist. The player measures its throughput, picks a line that fits, and fetches that playlist, which lists the actual segment files. If throughput falls below 2.8 Mbps, it moves to the 480p playlist for the next segment.",
        code: {
          lang: "text",
          code: "#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n360p/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=854x480\n480p/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n720p/index.m3u8\n#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n1080p/index.m3u8",
        },
      },
      {
        title: "Transcoding one rendition with ffmpeg",
        explanation: "A worker turns an input chunk into a 720p HLS rendition. Step 1: scale to 720 pixels high, keeping the aspect ratio. Step 2: encode with H.264 at a target bitrate with a cap and buffer. Step 3: force a keyframe every 4 seconds (-g 96 at 24 fps) so segments can start cleanly. Step 4: write 4-second segments and a playlist. Production pipelines run many of these in parallel, one per rendition and chunk.",
        code: {
          lang: "bash",
          code: "ffmpeg -i input.mp4 \\\n  -vf scale=-2:720 \\\n  -c:v libx264 -preset medium -b:v 3000k -maxrate 3200k -bufsize 6000k \\\n  -g 96 -keyint_min 96 -sc_threshold 0 \\\n  -c:a aac -b:a 128k \\\n  -f hls -hls_time 4 -hls_playlist_type vod \\\n  -hls_segment_filename '720p/seg_%04d.ts' 720p/index.m3u8",
        },
      },
    ],
    cheatSheet: [
      "Upload with pre-signed URLs and multipart; never through app servers",
      "Split at keyframes and transcode chunks in parallel",
      "Segments of 2 to 6 seconds; keyframe at every segment start",
      "Egress ≈ concurrent viewers * average bitrate",
      "1080p H.264 is roughly 5 to 8 Mbps; AV1 saves about 30 to 50 percent",
      "Player picks quality from measured throughput and buffer level",
      "Edge, then shield, then origin: keep origin hits rare",
      "Encode the long tail cheaply; spend on popular titles",
    ],
    quiz: [
      {
        q: "Why are videos split into short segments?",
        options: ["To hide the file from search engines", "So the player can change quality between segments and caches can store small pieces", "Because CDNs cannot store files over 1 MB", "To make uploads faster"],
        answer: 1,
        why: "Segments are the unit the player switches at, and they cache and download well.",
      },
      {
        q: "Why must keyframes line up with segment boundaries?",
        options: ["Each segment must be decodable on its own so the player can switch renditions there", "Keyframes make files smaller", "CDNs require it for caching", "It enables subtitles"],
        answer: 0,
        why: "A segment that starts without a keyframe cannot be decoded without the previous one, which breaks switching.",
      },
      {
        q: "A player's buffer is almost empty. What should it do?",
        options: ["Switch to 4K to catch up", "Stop downloading", "Clear the buffer", "Switch to a lower rendition for the next segments"],
        answer: 3,
        why: "Lower bitrate segments download faster and refill the buffer, avoiding a stall.",
      },
      {
        q: "Which change cuts storage and egress cost for a video few people watch?",
        options: ["Encoding it in AV1 and 4K right away", "Serving it from origin only", "Producing fewer renditions for it", "Making segments 1 second long"],
        answer: 2,
        why: "Fewer renditions mean less encoding and storage for content that earns little traffic.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "How much data does one viewer use watching a 2-hour movie at 5 Mbps?",
        hint: "Convert megabits to megabytes by dividing by 8.",
        solution: "5 Mbps * 7,200 s = 36,000 Mb\n36,000 / 8 = 4,500 MB ≈ 4.5 GB",
      },
      {
        level: "medium",
        task: "Design the states a video moves through from upload to playable, and say what happens if one transcode chunk fails.",
        hint: "Think of a status column in the metadata database and per-step retries.",
        solution: "UPLOADING -> UPLOADED -> PROCESSING -> READY (or FAILED)\nPROCESSING runs a DAG: probe, split, transcode chunks, package, thumbs\nEach chunk job retries with backoff (e.g. 3 times)\nOnly that chunk reruns; others are kept\nAfter retries fail: mark FAILED, alert, let the owner re-upload\nOptional: publish low renditions first, add higher ones later",
      },
      {
        level: "hard",
        task: "A live sports final expects 10 million concurrent viewers at 4 Mbps. Estimate egress and list three things you would do before the event.",
        hint: "Multiply, then think about CDN capacity, origin protection and start-up.",
        solution: "egress = 10M * 4 Mbps = 40 Tbps\n1. Reserve capacity with several CDNs and split traffic\n2. Use a shield tier and request collapsing so origin sees\n   one request per segment, not millions\n3. Pre-warm manifests and test with load at 1.5x expected\n4. Lower the default start rendition to cut start-up load\n5. Have a plan to cap the top rendition if capacity runs short",
      },
    ],
    faq: [
      { q: "What is the difference between HLS and DASH?", a: "Both serve video as segments plus a manifest. HLS was created by Apple and uses .m3u8 playlists; DASH is an international standard using .mpd manifests. Many services package both, or use CMAF segments that work with either." },
      { q: "What is a codec?", a: "A codec is the method used to compress and decompress video, such as H.264, HEVC, VP9 or AV1. Newer codecs make smaller files at the same quality but take more computing power to encode." },
      { q: "Why does video start blurry and then get sharp?", a: "The player often starts at a low rendition so playback begins quickly, then moves up once it has measured your bandwidth and filled its buffer." },
    ],
  },

  "case-studies-scale/ride-sharing": {
    plain: [
      "A ride-sharing app like Uber or Lyft connects people who need a ride with drivers nearby. The rider asks for a ride, the system finds a good driver close by, the driver accepts, and both apps follow the trip on a map until it ends and the rider pays.",
      "The hard part is that drivers move all the time. Each driver's phone sends its GPS position every few seconds. With millions of drivers, that is over a million updates every second. Most of these positions are only useful for a few seconds, so they are kept in fast memory, not written forever to a normal database.",
      "To find drivers near a rider quickly, the map is cut into small squares, and each driver is filed under the square they are in. Finding nearby drivers then means looking in the rider's square and the squares around it, instead of checking every driver in the city.",
      "A trip moves through clear steps: requested, accepted, driver arrived, in progress, completed, or cancelled. The system must make sure one driver is never given two riders at the same time, and that money is charged exactly once.",
    ],
    deepDive: [
      {
        heading: "Requirements and location volume",
        body: "Clarify scope: riders request rides and see the driver approach; drivers go online, get offers and accept; we show an ETA (estimated time of arrival) and a fare estimate; payments happen at the end. Surge pricing, pooling and scheduled rides are usually out of scope unless asked.\n\nThe big number is location updates. With 5 million drivers online sending a position every 4 seconds, that is 1.25 million writes per second. Each update is small, about 50 to 100 bytes, so bandwidth is modest (around 100 MB/s), but the write rate rules out a normal relational database for live positions. Ride requests are far fewer: 20 million trips a day is about 230 per second on average. So the design splits into a huge, simple, in-memory location path and a small, careful, transactional trip path.",
        bullets: ["Location path: very high write rate, short-lived, in memory", "Trip path: low rate, must be correct and durable", "Keep the last position, stream history to cheap storage"],
      },
      {
        heading: "Geohash, quadtrees and cells",
        body: "A geohash turns a latitude and longitude into a short string by repeatedly halving the world's longitude and latitude ranges and interleaving the bits. Each extra character makes the cell smaller: 5 characters is about 4.9 km by 4.9 km, 6 characters about 1.2 km by 0.6 km. Points with the same prefix are in the same cell, so nearby search becomes a lookup by prefix. Because two close points can sit on opposite sides of a cell edge, always search the cell plus its 8 neighbours.\n\nA quadtree splits a region into four children whenever it holds too many drivers, so dense downtown areas get small cells and empty countryside gets big ones. It adapts to density but is harder to update with millions of moving points. Uber built and open-sourced H3, a grid of hexagons; hexagons have neighbours at equal distance, which makes rings of cells around a point cleaner. In practice, Redis GEO commands (which use geohash internally) are a fine interview answer.",
        visual: {
          type: "compare",
          title: "Three ways to index driver locations",
          columns: [
            { title: "Geohash", points: ["Fixed grid, string prefixes", "Easy to shard by prefix", "Search cell plus 8 neighbours", "Built into Redis GEO"] },
            { title: "Quadtree", points: ["Splits busy areas into smaller cells", "Adapts to density", "Costly to rebalance with moving points", "Good for mostly static places"] },
            { title: "H3 hexagons", points: ["Hexagon cells at many resolutions", "All neighbours at equal distance", "Clean rings around a point", "Open-sourced by Uber"] },
          ],
        },
      },
      {
        heading: "Matching a rider to a driver",
        body: "Matching starts with candidate search: available drivers within a few kilometres, nearest first. Straight-line distance is only a first filter, because a driver 500 m away across a river may be 10 minutes by road. So the matcher asks a routing service for real ETAs for the top 10 or so candidates and ranks by ETA, plus other factors like driver rating or acceptance rate.\n\nThen it sends an offer to the best driver with a short timeout, for example 15 seconds. Before sending, it reserves the driver atomically so no other request can grab them, for example a Redis SET with NX and an expiry, or a conditional database update. If the driver declines or the timer expires, the reservation is released and the next candidate gets the offer. Busy systems can batch requests every second or two and solve the assignment for many riders at once, which beats greedy first-come matching.",
        bullets: ["Filter by distance, rank by road ETA", "Reserve the driver atomically with a TTL", "Timeout and fall back to the next candidate"],
      },
      {
        heading: "Trip state and consistency",
        body: "The trip is the part that must be correct. Store it in a transactional database and allow only valid transitions: REQUESTED to ACCEPTED, ACCEPTED to ARRIVED, ARRIVED to IN_PROGRESS, IN_PROGRESS to COMPLETED, and CANCELLED from the early states. Enforce this with a conditional update, such as UPDATE trips SET state = 'ACCEPTED' WHERE id = ? AND state = 'REQUESTED'. If zero rows change, someone else got there first.\n\nEach transition emits an event onto a queue so other services react: notifications, live tracking, pricing, and payments. Payment requests carry an idempotency key (a unique ID for that one charge) so a retry never charges twice. During the trip, the driver's location is pushed to the rider over a WebSocket, and the GPS trail is streamed to cheap storage for fare calculation, disputes and analytics.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Life of one driver location update",
        steps: [
          { label: "Driver app", detail: "Sends lat, lng, heading every ~4 s" },
          { label: "Location gateway", detail: "Validates, routes by city or cell" },
          { label: "In-memory geo index", detail: "Updates the driver's current cell" },
          { label: "Live trip push", detail: "If on a trip, forward to the rider" },
          { label: "Stream to storage", detail: "Kafka to cheap storage for history" },
        ],
      },
    ],
    examples: [
      {
        title: "Nearby search with Redis GEO",
        explanation: "Keep one geo set per city for available drivers. When a driver pings, GEOADD updates their position (it overwrites the old one). When a driver accepts a trip, remove them with ZREM, since a geo set is a sorted set underneath. A ride request runs GEOSEARCH for the 10 closest drivers within 3 km. Note that GEOADD takes longitude first, then latitude, which is a common bug.",
        code: {
          lang: "text",
          code: "GEOADD drivers:blr 77.5946 12.9716 d101\nGEOADD drivers:blr 77.6012 12.9752 d102\nGEOSEARCH drivers:blr FROMLONLAT 77.5960 12.9720 \\\n          BYRADIUS 3 km ASC COUNT 10 WITHDIST\n# 1) d101  0.17 km\n# 2) d102  0.78 km\nSET reserve:d101 trip88 NX EX 15   # lock driver for the offer\nZREM drivers:blr d101              # after accept",
        },
      },
      {
        title: "Two riders, one driver",
        explanation: "Two requests arrive in the same second and both pick driver d101 as best. Step 1: matcher A runs SET reserve:d101 tripA NX EX 15 and gets OK. Step 2: matcher B runs the same with tripB and gets nil, because the key already exists. Step 3: B moves to its next candidate. Step 4: d101 accepts trip A; the trip row moves to ACCEPTED with a conditional update. If d101 had ignored the offer, the key would expire after 15 seconds and d101 would become available again.",
      },
    ],
    cheatSheet: [
      "5M drivers every 4 s = 1.25M location writes/s: keep them in memory",
      "Geohash length 5 ≈ 4.9 km cells; length 6 ≈ 1.2 x 0.6 km",
      "Always search the rider's cell plus its 8 neighbours",
      "Rank candidates by road ETA, not straight-line distance",
      "Reserve a driver atomically (SET NX EX) before sending an offer",
      "Trip transitions use conditional updates: WHERE state = expected",
      "Redis GEOADD takes longitude first, then latitude",
      "Use idempotency keys on payment calls",
    ],
    quiz: [
      {
        q: "Why are live driver positions usually kept in memory rather than a relational database?",
        options: ["Relational databases cannot store numbers", "Memory is permanent", "The write rate is huge and each position is only useful for seconds", "Maps require Redis"],
        answer: 2,
        why: "Over a million short-lived writes per second suits an in-memory store far better.",
      },
      {
        q: "Why search neighbouring geohash cells too?",
        options: ["A nearby driver may sit just across a cell boundary", "To find drivers in other cities", "Neighbour cells are faster to read", "Geohash only works with 9 cells"],
        answer: 0,
        why: "Two close points can have different geohashes when they straddle an edge.",
      },
      {
        q: "What stops two matchers from offering the same driver at once?",
        options: ["Sorting drivers by rating", "An atomic reservation such as SET key NX with an expiry", "Sending offers by email", "Using larger geohash cells"],
        answer: 1,
        why: "Only one SET NX succeeds, so only one matcher holds the driver.",
      },
      {
        q: "How should the trip service move a trip from REQUESTED to ACCEPTED safely?",
        options: ["Overwrite the state column", "Delete and reinsert the row", "Ask the rider app to update it", "Use a conditional update that only succeeds if the state is still REQUESTED"],
        answer: 3,
        why: "The condition prevents invalid or double transitions when events race.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the trip states and the valid transitions between them, including cancellation.",
        hint: "Cancellation is allowed only before the ride starts.",
        solution: "REQUESTED -> ACCEPTED | CANCELLED\nACCEPTED  -> ARRIVED  | CANCELLED\nARRIVED   -> IN_PROGRESS | CANCELLED\nIN_PROGRESS -> COMPLETED\nCOMPLETED and CANCELLED are final.",
      },
      {
        level: "medium",
        task: "Estimate memory to hold the current position of 5 million drivers, then say how you would shard it.",
        hint: "Count bytes for ID, coordinates, status and timestamp, then add overhead.",
        solution: "per driver ≈ 8 (id) + 16 (lat,lng) + 8 (ts) + 8 (status) ≈ 40 B\nwith index and overhead say ~200 B\n5M * 200 B ≈ 1 GB: fits on one node, but writes do not\nshard by city or geohash prefix so each node handles\none region's 1.25M/s share; replicate for failover",
      },
      {
        level: "hard",
        task: "A driver drives from one city shard into another during a trip. How do you keep tracking and matching correct?",
        hint: "Think about which shard owns the driver and when ownership moves.",
        solution: "1. Location gateway computes the shard from each new cell\n2. When the cell maps to a new shard, write there and\n   remove the driver from the old shard's index\n3. Store driver -> current shard in a small lookup\n4. Trip tracking follows the trip ID, not the shard,\n   so the rider's stream is unaffected\n5. Matching near borders queries both shards",
      },
    ],
    faq: [
      { q: "What is a geohash in simple terms?", a: "It is a short string that names a box on the map. Longer strings mean smaller boxes, and places with the same starting letters are close together." },
      { q: "How does the app show the driver moving smoothly?", a: "The server pushes new positions every few seconds over a WebSocket, and the app animates the car between points so it looks smooth." },
      { q: "How is ETA calculated?", a: "A routing service finds the best road path on a map graph and adds expected travel time per road segment, often adjusted with live and historical traffic data." },
    ],
  },

  "case-studies-scale/web-crawler": {
    plain: [
      "A web crawler is a program that visits web pages automatically, saves them, finds the links on them, and then visits those links too. Search engines use crawlers to build their index. Other uses include price tracking, archiving and research.",
      "The crawler keeps a big to-do list of addresses (URLs) to visit, called the URL frontier. A worker takes a URL, downloads the page, pulls out all the links, and adds the new ones back to the list. This loop runs on many machines at once.",
      "A good crawler is polite. It reads each site's robots.txt file to learn which pages it may not visit, and it waits between requests to the same site so it does not slow that site down. An impolite crawler gets blocked quickly.",
      "The web is full of repeats: the same page under many URLs, and copies of pages on different sites. The crawler must remember which URLs it has seen and spot pages whose content it already has, or it will waste most of its time.",
    ],
    deepDive: [
      {
        heading: "Scope and estimates",
        body: "Clarify the goal: a general search crawler, or a focused one for a few sites? HTML only, or also PDFs and images? Must we run JavaScript to see content? How often should pages be refreshed? A typical interview scope: HTML only, 1 billion pages per month, refresh popular pages more often, obey robots.txt, store raw pages for an indexer.\n\nThe explainer works out about 400 pages per second and 500 TB per month. Two more numbers matter. DNS: if each fetch needed a fresh DNS lookup taking 20 to 100 ms, DNS would become the bottleneck, so run a local caching resolver. Connections: with an average fetch time around 1 second, 400 pages per second means about 400 fetches in flight, so each worker should use asynchronous I/O to keep hundreds of downloads open at once rather than one thread per page.",
        bullets: ["Concurrency ≈ pages per second * average fetch time", "Cache DNS locally", "Rendering JavaScript costs far more CPU than plain fetching"],
      },
      {
        heading: "Inside the URL frontier",
        body: "A well-known design (from the Mercator crawler) has two layers of queues. Front queues handle priority: a prioritiser scores each URL by things like page importance and how often it changes, and puts it in one of several priority queues. Back queues handle politeness: each back queue holds URLs for exactly one host, and a small table maps host to back queue.\n\nA heap (min-priority queue) stores, for each back queue, the earliest time that host may be contacted again. A worker pops the host whose time has come, fetches one URL, then sets that host's next allowed time to now plus a delay, often a small multiple of how long the last fetch took. When a back queue empties, it is refilled from the front queues. In a distributed crawler, hosts are assigned to machines by hashing the hostname, so all politeness for a host stays on one machine.",
        visual: {
          type: "flow",
          title: "A URL's path through the frontier",
          steps: [
            { label: "New URL", detail: "Normalised and not seen before" },
            { label: "Prioritiser", detail: "Scores importance and change rate" },
            { label: "Front queue", detail: "One of N priority levels" },
            { label: "Back queue per host", detail: "Fed when that host's queue runs low" },
            { label: "Ready-time heap", detail: "Host is due when its delay has passed" },
            { label: "Fetcher", detail: "Downloads, then resets the host's timer" },
          ],
        },
      },
      {
        heading: "robots.txt and rate limits",
        body: "Before crawling a host, fetch https://host/robots.txt and cache it, commonly for up to 24 hours. It contains groups that start with User-agent lines followed by Disallow and Allow rules for path prefixes. RFC 9309 (2022) standardised the format: the most specific (longest) matching rule wins, and if robots.txt returns a 4xx error the crawler may crawl freely, while a 5xx error means treat the whole site as disallowed for now.\n\nCrawl-delay is not part of the standard and some engines ignore it, but a polite crawler honours it if present. Beyond that, set your own limits: one connection per host, a delay of a second or more, and back off on 429 Too Many Requests or 503 responses, respecting a Retry-After header. Send a clear User-Agent with a URL explaining your bot, so site owners can contact you.",
        bullets: ["Cache robots.txt per host, about a day", "4xx on robots.txt: allowed; 5xx: stop for now", "Back off on 429 and 503, honour Retry-After"],
      },
      {
        heading: "Deduplicating URLs and content",
        body: "URL dedupe starts with normalisation so equal URLs look equal: lowercase the scheme and host, remove default ports (:80, :443), resolve ./ and ../, drop the #fragment, and strip known tracking parameters such as utm_source. Then check a seen-URL set. A Bloom filter (a bit array plus several hash functions) answers is-it-new in a few bits per URL; it never says a seen URL is new, but it sometimes says a new URL was seen, which only skips a few pages.\n\nContent dedupe catches the same page under different URLs. An exact hash (like SHA-256) of the normalised text finds identical copies. Near-duplicates, such as the same article with a different ad or date, need a fingerprint like SimHash, where similar documents produce fingerprints that differ in only a few bits. Also honour rel=canonical links, which tell you which URL the site considers the main one.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Components of a distributed crawler",
        layers: [
          { label: "Scheduler and frontier", detail: "Priority and per-host queues, sharded by host hash" },
          { label: "Fetchers", detail: "Async HTTP, robots cache, local DNS cache" },
          { label: "Parsers", detail: "Extract links and text, compute fingerprints" },
          { label: "Dedupe services", detail: "Bloom filter for URLs, SimHash for content" },
          { label: "Storage", detail: "Raw pages in blob storage, metadata in a database" },
        ],
      },
    ],
    examples: [
      {
        title: "Normalising URLs before the seen check",
        explanation: "These three links point at the same page: HTTP://Example.com:80/a/./b/?utm_source=x#top, http://example.com/a/b/ and http://example.com/a/c/../b/. Without normalisation the crawler fetches it three times. The function lowercases scheme and host, drops the default port, resolves dot segments, removes utm_ parameters, sorts the rest, and drops the fragment. Real crawlers add site-specific rules, but this catches the common cases.",
        code: {
          lang: "python",
          code: "from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode\nimport posixpath\n\ndef normalise(url: str) -> str:\n    s = urlsplit(url)\n    scheme, host = s.scheme.lower(), (s.hostname or \"\").lower()\n    port = s.port\n    if port and not ((scheme == \"http\" and port == 80) or (scheme == \"https\" and port == 443)):\n        host += f\":{port}\"\n    path = posixpath.normpath(s.path or \"/\") + (\"/\" if s.path.endswith(\"/\") and s.path != \"/\" else \"\")\n    query = urlencode(sorted((k, v) for k, v in parse_qsl(s.query) if not k.startswith(\"utm_\")))\n    return urlunsplit((scheme, host, path, query, \"\"))\n\nprint(normalise(\"HTTP://Example.com:80/a/./b/?utm_source=x#top\"))  # http://example.com/a/b/",
        },
      },
      {
        title: "Checking robots.txt in Python",
        explanation: "Python's standard library includes a robots.txt parser. Step 1: point it at the site's robots.txt and read it once (then cache the object per host). Step 2: before each fetch, ask can_fetch with your bot's user agent and the URL. Step 3: read crawl_delay, which returns None if the site did not set one, and use your own default then. Note that this parser is simpler than RFC 9309 in some edge cases, so large crawlers often use a stricter library.",
        code: {
          lang: "python",
          code: "from urllib.robotparser import RobotFileParser\n\nrp = RobotFileParser(\"https://example.com/robots.txt\")\nrp.read()\nagent = \"MyCrawler/1.0 (+https://mycrawler.example/bot)\"\nurl = \"https://example.com/private/page\"\nif rp.can_fetch(agent, url):\n    delay = rp.crawl_delay(agent) or 1.0\n    print(\"fetch after\", delay, \"s\")\nelse:\n    print(\"disallowed by robots.txt\")",
        },
      },
    ],
    cheatSheet: [
      "Concurrent fetches ≈ pages/s * average fetch seconds",
      "Front queues for priority, back queues for one host each",
      "Hash the hostname to pick the crawler machine",
      "Cache robots.txt per host; 5xx on robots.txt means don't crawl yet",
      "Back off on 429 and 503; honour Retry-After",
      "Normalise URLs before the Bloom filter check",
      "Exact hash for identical pages, SimHash for near-duplicates",
      "Limit depth, URL length and pages per host to escape spider traps",
    ],
    quiz: [
      {
        q: "Why assign each host to exactly one crawler machine?",
        options: ["So one place controls the delay between requests to that host", "To save disk space", "Because DNS requires it", "To make parsing faster"],
        answer: 0,
        why: "Politeness timers live in one place only if one machine owns the host.",
      },
      {
        q: "What does a Bloom filter risk getting wrong?",
        options: ["It may say a seen URL is new", "It may crash on long URLs", "It may say a new URL was already seen", "It may store the full URL"],
        answer: 2,
        why: "Bloom filters have false positives, not false negatives, so a few new URLs get skipped.",
      },
      {
        q: "Under RFC 9309, what should a crawler do if robots.txt returns a 503 error?",
        options: ["Crawl everything", "Treat the site as fully disallowed for now", "Ignore robots.txt forever", "Crawl only the homepage"],
        answer: 1,
        why: "A server error means the rules are unknown, so the safe choice is to wait.",
      },
      {
        q: "Two news sites publish the same article with different ads around it. Which technique detects that?",
        options: ["URL normalisation", "Bloom filter on URLs", "SHA-256 of the raw HTML", "A near-duplicate fingerprint such as SimHash"],
        answer: 3,
        why: "SimHash fingerprints stay close when only small parts of the text differ.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a robots.txt that blocks all bots from /admin/ and /search, but allows /search/help.",
        hint: "Longest matching rule wins under RFC 9309.",
        solution: "User-agent: *\nDisallow: /admin/\nDisallow: /search\nAllow: /search/help",
      },
      {
        level: "medium",
        task: "Size a Bloom filter for 5 billion URLs with about a 1 percent false positive rate.",
        hint: "About 9.6 bits per item gives 1 percent, with about 7 hash functions.",
        solution: "bits ≈ 5e9 * 9.6 ≈ 4.8e10 bits\nbytes ≈ 4.8e10 / 8 ≈ 6 GB\nhash functions k ≈ 0.7 * 9.6 ≈ 7\nSplit across shards by URL hash if one node is too small.",
      },
      {
        level: "hard",
        task: "A site generates calendar pages with a next-day link forever. Design defences against this spider trap without hurting normal sites.",
        hint: "Combine per-host budgets with URL pattern signals.",
        solution: "1. Max crawl depth from the seed (e.g. 15 hops)\n2. Max URL length (e.g. 2,000 chars) and max path segments\n3. Per-host page budget per crawl cycle, raised for\n   important hosts\n4. Detect repeating patterns (same path, only a number or\n   date changes) and lower their priority\n5. Content dedupe: many near-identical pages cut the budget",
      },
    ],
    faq: [
      { q: "Is robots.txt legally binding?", a: "It is a convention, not a security control, and its legal weight varies by country. Respectable crawlers follow it, and ignoring it is a fast way to get blocked." },
      { q: "Should a crawler run JavaScript?", a: "Only for pages that need it. Running a headless browser costs far more CPU and time than a plain HTTP fetch, so many crawlers fetch HTML first and render only selected pages later." },
      { q: "How often should pages be recrawled?", a: "It depends on how often they change. Crawlers track change history per page and revisit fast-changing pages, like news front pages, much more often than static ones." },
      { q: "What is a sitemap?", a: "A sitemap is an XML file, often listed in robots.txt, where a site lists its URLs and when they last changed. It helps crawlers find pages they might miss." },
    ],
  },
};

export default extra;
