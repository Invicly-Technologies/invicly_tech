import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sd-practice/self-mocks": {
    plain: [
      "A self-mock is a practice system design interview you do alone. You pick a question, such as design a URL shortener, set a 45-minute timer, and work through it as if an interviewer were watching. You talk out loud and draw boxes and arrows.",
      "Reading about system design is not the same as doing it. Under a timer you find out what you really know. Many people understand caching when they read about it, but forget to add a cache when designing on their own.",
      "After each session you write down the main choices you made, what else you could have chosen, and why you picked one. This short note is your trade-off log. Then you compare your design with a good published answer and list what you missed.",
      "Four sessions on four different questions is a good first goal. Choose questions that stress different things: one read-heavy, one write-heavy, one real-time, one with heavy data processing. Then redo your weakest one a few days later.",
    ],
    deepDive: [
      {
        heading: "Choosing four prompts that cover different skills",
        body: "Each classic prompt tests a different muscle, so pick a spread rather than four similar ones. A read-heavy prompt (URL shortener, news feed) tests caching, ID generation and read replicas. A real-time prompt (chat, live comments) tests WebSockets, presence and ordering. A data-heavy prompt (video platform, web crawler) tests pipelines, queues, object storage and cost. A correctness-heavy prompt (payments, ticket booking, ride matching) tests transactions, idempotency and race conditions.\n\nWrite each prompt on a card with just one line, the way an interviewer says it, for example: Design a system like Dropbox. Do not add details. Clarifying the vague prompt is part of the practice. Keep a list of prompts you have done with the date and a 1 to 5 score for each phase, so you can see trends rather than just feelings.",
        visual: {
          type: "tree",
          title: "A balanced set of four prompts",
          root: "Four self-mocks",
          children: [
            { label: "Read-heavy", children: ["URL shortener", "News feed"] },
            { label: "Real-time", children: ["Chat system", "Live comments"] },
            { label: "Data-heavy", children: ["Video streaming", "Web crawler"] },
            { label: "Correctness-heavy", children: ["Ticket booking", "Ride matching", "Payment system"] },
          ],
        },
      },
      {
        heading: "Running the 45 minutes",
        body: "Set up like the real thing: a blank whiteboard tool (Excalidraw, a tablet or paper), a visible timer, no notes, no searching. Speak out loud the whole time. If you can, record your screen and voice; watching ten minutes of yourself later shows long silences and unclear explanations that you never notice live.\n\nUse alarms at the phase boundaries so you move on even if a phase feels unfinished. A complete simple design beats a perfect half design, because interviewers need to see the whole flow before they can ask deep questions. When the timer for high-level design ends, pick the one or two parts most likely to break at scale and go deep there: the hot shard, the fan-out, the race condition, the single point of failure.",
        bullets: ["Say assumptions out loud and write them in a corner", "Draw the request path end to end before details", "End with bottlenecks, failures and what you would do next"],
      },
      {
        heading: "Covering requirements, API and data model fast",
        body: "Most solo designs fail early because the first ten minutes are vague. Use a fixed checklist. Functional requirements: three to five verbs the user can do. Non-functional: scale (daily users, reads and writes per second), latency target, availability, consistency needs. Quick numbers: requests per second, storage per year, bandwidth.\n\nThen write the API as real endpoints with inputs and outputs, for example POST /v1/urls { longUrl } returns { code }. Then the data model: main tables or collections with their keys, and how you will look data up. Naming the partition key early forces good questions, such as what happens when one user is very hot. Every later box on your diagram should trace back to one of these requirements; if a box serves none, remove it.",
      },
      {
        heading: "Writing trade-offs and comparing with references",
        body: "Right after the timer ends, spend 10 to 15 minutes writing the trade-off log. For each major decision use one line in the form: chose X over Y because Z, at the cost of W. The cost part is what most people skip, and it is exactly what interviewers probe. For example: chose Cassandra over Postgres for messages because of the write rate and simple access pattern, at the cost of no joins and limited transactions.\n\nOnly then open a reference solution, such as a well-known book chapter, an engineering blog post from a company that built the real system, or a course answer. Compare by phase, not just by final picture. Mark each gap as one of three types: I did not know this concept, I knew it but forgot it, or I chose differently for a valid reason. Only the first two need study; the third is fine if you can defend it.",
        visual: {
          type: "compare",
          title: "Three kinds of gap after comparing",
          columns: [
            { title: "Did not know", points: ["Concept was new to you", "Study it, then write a summary", "Add a prompt that uses it"] },
            { title: "Knew but forgot", points: ["You know it when you read it", "Add it to your checklist", "Retry the same prompt soon"] },
            { title: "Chose differently", points: ["Reference picked another option", "Fine if you can defend it", "Note the trade-off for next time"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What a finished 45-minute board should show",
        layers: [
          { label: "Assumptions", detail: "Scale, latency target, consistency choice" },
          { label: "API", detail: "Three to five endpoints with inputs and outputs" },
          { label: "Data model", detail: "Main tables, keys and partitioning" },
          { label: "High-level diagram", detail: "Client to storage, every box justified" },
          { label: "Deep dives", detail: "One or two bottlenecks, with fixes" },
          { label: "Wrap-up", detail: "Failures, monitoring, what you would do next" },
        ],
      },
    ],
    examples: [
      {
        title: "A self-mock score sheet after session one",
        explanation: "After a 45-minute attempt at a ticket booking system, fill in a short score sheet. Step 1: score each phase 1 to 5 and write the time you actually spent. Step 2: list the top two gaps from the reference comparison. Step 3: decide one action for each gap. Here the person spent 14 minutes on requirements (planned 5), so the design had no time for the hard part: two users booking the same seat. The action is a tighter requirements checklist and studying seat holds with expiry.",
        code: {
          lang: "text",
          code: "Prompt: Ticket booking    Date: 2026-11-03\nPhase           Planned  Actual  Score\nRequirements      5        14      3\nEstimates         5         4      4\nAPI + data        8         9      3\nHigh-level       12        12      3\nDeep dive        15         6      1\nGaps: 1) no seat hold or lock (did not know)\n      2) forgot idempotent payment call (forgot)\nActions: study holds with TTL; add idempotency to checklist",
        },
      },
      {
        title: "Turning one decision into a defended trade-off",
        explanation: "In a URL shortener self-mock you chose random 7-character codes. Write it as a full trade-off. Step 1: state the choice and the alternative (a counter encoded in base62). Step 2: state why: random codes are not guessable and need no central counter. Step 3: state the cost: you must check for collisions on insert. Step 4: add a number: 62 to the power 7 is about 3.5 trillion codes, so with 1 billion links the chance a new random code collides is under 0.03 percent per try, and a retry handles it.",
        code: {
          lang: "text",
          code: "Chose: random 7-char base62 codes\nOver:  global counter + base62\nWhy:   codes not guessable, no counter bottleneck\nCost:  collision check on insert (unique index + retry)\nMath:  62^7 ≈ 3.5e12; 1e9 used -> ~0.03% collide per try",
        },
      },
    ],
    cheatSheet: [
      "45 minutes, visible timer, talk out loud, no notes",
      "Pick prompts across read-heavy, real-time, data-heavy, correctness-heavy",
      "Finish a complete simple design before going deep",
      "Trade-off line: chose X over Y because Z, at the cost of W",
      "Write your log before opening any reference solution",
      "Tag each gap: did not know, forgot, or chose differently",
      "Record yourself; replay 10 minutes to find silences",
      "Retry the weakest prompt after 3 to 7 days",
    ],
    quiz: [
      {
        q: "Your deep dive keeps getting only 5 minutes. What is the best fix?",
        options: ["Skip estimates entirely", "Tighten earlier time boxes with phase alarms and a requirements checklist", "Practise only easy prompts", "Draw fewer boxes in the deep dive"],
        answer: 1,
        why: "Overruns usually start in the first phases, so fixing those frees time for depth.",
      },
      {
        q: "When should you read the reference solution?",
        options: ["Before starting, to learn the shape", "Halfway through, to check direction", "After finishing the design and writing your trade-off log", "Never"],
        answer: 2,
        why: "Reading it early hides what you would have missed on your own.",
      },
      {
        q: "Which trade-off line is most complete?",
        options: ["Used Redis because it is fast", "Used a cache", "Redis is popular in industry", "Chose Redis over Memcached for feeds because of sorted sets, at the cost of more memory per item"],
        answer: 3,
        why: "It names the alternative, the reason and the cost.",
      },
      {
        q: "A reference used Kafka but you used SQS, and you can explain why. How should you tag it?",
        options: ["Chose differently, which is fine if you can defend it", "Did not know", "Forgot", "Wrong answer"],
        answer: 0,
        why: "Different valid choices are not gaps; the reasoning is what is scored.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pick your four prompts for the first week and write each as a one-line interviewer question, one from each category.",
        hint: "Read-heavy, real-time, data-heavy, correctness-heavy.",
        solution: "1. Design a URL shortener like bit.ly. (read-heavy)\n2. Design WhatsApp-style chat. (real-time)\n3. Design YouTube. (data-heavy)\n4. Design a concert ticket booking system. (correctness-heavy)",
      },
      {
        level: "medium",
        task: "Do one 45-minute self-mock with phase alarms, then fill in a score sheet with planned time, actual time and a 1 to 5 score per phase.",
        hint: "Set alarms at 5, 10, 20, 30 and 45 minutes.",
        solution: "Sheet columns: Phase | Planned | Actual | Score | Note\nRows: Requirements, Estimates, API + data, High-level,\n      Deep dive, Wrap-up\nThen list the top 2 gaps and one action each.\nA good first result: every phase reached, even with low scores.",
      },
      {
        level: "hard",
        task: "After four sessions, write a one-page review: your most common gap type, your slowest phase, and a two-week plan to fix both. Then retry your worst prompt.",
        hint: "Look across all four score sheets, not just the last one.",
        solution: "Example review:\n- Common gap: forgot (idempotency, failure handling)\n- Slowest phase: requirements, avg 11 min vs 5 planned\nPlan:\n- Laminate a 10-line requirements checklist, use it every time\n- Add a failure-modes step to every wrap-up\n- Week 2: retry ticket booking; target deep dive >= 12 min",
      },
    ],
    faq: [
      { q: "Is practising alone really useful without an interviewer?", a: "Yes, for structure, timing and finding knowledge gaps. It does not train reacting to questions and hints, so combine it with peer mocks later." },
      { q: "What tool should I use to draw?", a: "Use what your real interview will use if you know it, often a shared whiteboard like Excalidraw or a company tool. Otherwise Excalidraw or paper are fine; the tool matters far less than the structure." },
      { q: "How many self-mocks should I do before real interviews?", a: "Four to eight solid sessions across different prompt types is a common target, followed by several peer mocks. Quality of review matters more than the count." },
    ],
  },

  "sd-practice/peer-mocks": {
    plain: [
      "A peer mock is a practice interview where another person plays the interviewer. They give you a question, ask follow-ups, push back on your ideas and sometimes change the requirements halfway. This is much closer to the real thing than practising alone.",
      "The value is in the feedback. A good mock ends with specific notes: you never asked how many users there are, your database choice was not explained, you went quiet for three minutes. These notes show gaps you cannot see yourself.",
      "You can find partners among friends and colleagues, in online communities, or on mock interview platforms, some free and some paid with experienced interviewers. Swapping roles helps a lot: when you play the interviewer, you see clearly what good and weak answers look like.",
      "Aim for at least three mocks. After each one, fix the one or two biggest gaps before the next. Then retry a question you did badly on, to prove to yourself that the fix worked.",
    ],
    deepDive: [
      {
        heading: "Finding partners and setting up a session",
        body: "Good options: colleagues preparing at the same time, study groups in online communities for interview prep, and mock interview platforms. Peer-matching platforms pair you with another candidate for free or low cost and you take turns. Paid platforms give you an experienced interviewer, often from a large tech company, which is worth it for one or two sessions close to real interviews.\n\nSet the session up like the real one: video call, shared whiteboard, 45 to 60 minutes, camera on. Agree on roles in advance and give the interviewer a prompt they have prepared, ideally with their own notes on what a strong answer covers. Reserve the last 10 to 15 minutes for feedback, and protect that time; feedback is the main reason you are there.",
        bullets: ["Peer platforms: cheap, you swap roles", "Paid experts: closest to real bar, use sparingly", "Always leave 10 to 15 minutes for feedback"],
      },
      {
        heading: "How to be a useful interviewer for your peer",
        body: "When it is your turn to interview, prepare a prompt you know well and a short list of probes. Start vague, just one line, and answer clarifying questions honestly with numbers. Let the candidate lead; do not rescue them in the first minutes.\n\nPlan two or three probing questions for the middle: what happens if this database node dies, how does this work at ten times the traffic, how do you stop the same payment being charged twice. Add one curveball, a requirement change such as now we need it to work offline, to see how they adapt. Take timestamped notes of what they said, not your opinion of them, for example 12:30 chose SQL, no reason given. Concrete evidence makes the feedback useful and hard to argue with.",
        visual: {
          type: "sequence",
          title: "Shape of a 45-minute peer mock",
          actors: ["Interviewer", "Candidate"],
          messages: [
            { from: 0, to: 1, label: "One-line prompt" },
            { from: 1, to: 0, label: "Clarifying questions and assumptions" },
            { from: 0, to: 1, label: "Answers with numbers" },
            { from: 1, to: 0, label: "API, data model, high-level design" },
            { from: 0, to: 1, label: "Probe: what fails at 10x?" },
            { from: 0, to: 1, label: "Curveball: requirement change" },
            { from: 1, to: 0, label: "Adapts design, states trade-offs" },
            { from: 0, to: 1, label: "Rubric feedback with examples" },
          ],
        },
      },
      {
        heading: "Collecting structured feedback",
        body: "Vague praise like that was good wastes the session. Use the same rubric every time so results compare across mocks: requirements, high-level design, depth, trade-offs and communication, each scored 1 to 4, plus an overall hire or no-hire signal. Ask the interviewer for one example behind each score and one thing to do differently.\n\nAsk direct questions if they are shy: Where did I lose you? Which choice did you disagree with? At what point would a real interviewer have worried? Write the feedback down yourself during the call, in your own words, and read it back to confirm. Store all your feedback in one document so patterns jump out after three sessions, for example every interviewer saying you did not discuss failures.",
        bullets: ["Same rubric every time", "One example per score", "Ask: where did I lose you?", "Keep all feedback in one document"],
      },
      {
        heading: "Fixing gaps and retrying a failed prompt",
        body: "After each mock, pick at most two gaps to fix, the ones that appeared most often or cost the most. Turn each into a concrete action. Knowledge gap, such as did not know how consistent hashing works: study it, then explain it out loud in two minutes without notes. Habit gap, such as forgot to estimate: add it to your opening checklist. Communication gap, such as long silences: practise narrating every step, even saying I am now thinking about the write path.\n\nThen retry a prompt you failed, with a different peer if possible so they do not know your earlier answer. Compare rubric scores before and after. If a gap persists across two retries, change approach: a different resource, a focused drill, or a session with an experienced interviewer.",
        visual: {
          type: "flow",
          title: "From feedback to proven fix",
          steps: [
            { label: "Collect rubric notes", detail: "Scores plus concrete examples" },
            { label: "Pick top two gaps", detail: "Most frequent or most costly" },
            { label: "Choose an action", detail: "Study, checklist item or narration drill" },
            { label: "Practise the fix", detail: "Solo drill or short self-mock" },
            { label: "Retry failed prompt", detail: "New peer, same rubric" },
            { label: "Compare scores", detail: "Keep, or change approach" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Self-mocks vs peer mocks vs paid mocks",
        columns: [
          { title: "Self-mock", points: ["Free, any time", "Trains structure and timing", "No follow-up questions", "You must judge yourself"] },
          { title: "Peer mock", points: ["Free or cheap, needs scheduling", "Real questions and curveballs", "Feedback quality varies", "Swap roles to learn both sides"] },
          { title: "Paid expert mock", points: ["Costs money", "Closest to the real hiring bar", "Calibrated, detailed feedback", "Best close to real interviews"] },
        ],
      },
    ],
    examples: [
      {
        title: "Feedback notes from mock one",
        explanation: "The candidate designed a chat system. The interviewer scored with the rubric and gave an example per score. The pattern is clear: strong design, weak depth and failures. The candidate writes two actions: study gateway failure and reconnect flows, and add a failures step to the end of every design. In mock two, on a different prompt, depth rose from 2 to 3.",
        code: {
          lang: "text",
          code: "Mock 1: Chat system      Interviewer: peer A\nRequirements   3  asked group size, missed multi-device\nDesign         4  clean gateway + registry + store\nDepth          2  no answer for gateway crash at 32:10\nTrade-offs     3  Cassandra justified, ordering not\nCommunication  3  4 min silence during data model\nOverall: lean no-hire\nActions: 1) study reconnect + offline sync\n         2) add 'what fails?' step before wrap-up",
        },
      },
      {
        title: "Handling a curveball well",
        explanation: "Twenty-five minutes into a URL shortener, the interviewer says: now links must expire after a custom time, and analytics must show clicks per country. Step 1: restate the new requirements to confirm. Step 2: say what changes and what does not: the read path stays, the table gains an expires_at column, and redirects check it. Step 3: add an asynchronous click stream (redirect service sends events to a queue, a consumer aggregates by country) so redirects stay fast. Step 4: name the trade-off: analytics are eventually consistent, a few seconds behind. Adapting calmly scores better than defending the old design.",
      },
    ],
    cheatSheet: [
      "Do at least three mocks, fixing one or two gaps between each",
      "Leave 10 to 15 minutes of every session for feedback",
      "Rubric: requirements, design, depth, trade-offs, communication",
      "Ask for one concrete example behind each score",
      "As interviewer: start vague, probe at 10x scale, add one curveball",
      "Treat hints as signals of what is being evaluated",
      "Retry a failed prompt with a new peer and the same rubric",
      "Keep all feedback in one document to spot patterns",
    ],
    quiz: [
      {
        q: "What makes mock feedback most useful?",
        options: ["A final pass or fail only", "Scores per rubric area with concrete examples from the session", "A long list of every small mistake", "Comparing you with other candidates"],
        answer: 1,
        why: "Specific evidence per area shows exactly what to fix next.",
      },
      {
        q: "The interviewer asks: what happens if this cache cluster goes down? What is the best response?",
        options: ["Say it will not go down", "Change topic to the API", "Treat it as a hint, explain the impact and add a mitigation", "Ask to skip the question"],
        answer: 2,
        why: "Hints point at what they want to evaluate, so engage with them directly.",
      },
      {
        q: "Why swap roles and act as interviewer for a peer?",
        options: ["You see from the other side what strong and weak answers look like", "It is required by mock platforms", "It saves money only", "Interviewers are not scored"],
        answer: 0,
        why: "Judging answers sharpens your sense of what interviewers look for.",
      },
      {
        q: "After three mocks, every interviewer says you skip failure handling. What should you do?",
        options: ["Book ten more mocks right away", "Ignore it since your design scores are high", "Switch to different prompts", "Add a fixed failures step to your structure, drill it, then retry a failed prompt"],
        answer: 3,
        why: "A repeated gap needs a concrete change and a retry to prove it is fixed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a one-page rubric you will hand to every mock interviewer.",
        hint: "Five areas, a 1 to 4 scale, and space for one example each.",
        solution: "Score 1 (weak) to 4 (strong), plus one example each:\n- Requirements: clarified scope and scale?\n- Design: complete end-to-end flow?\n- Depth: found real bottlenecks and failures?\n- Trade-offs: named alternatives and costs?\n- Communication: clear, structured, drove the session?\nOverall: hire / lean hire / lean no-hire / no-hire\nOne thing to change next time:",
      },
      {
        level: "medium",
        task: "Prepare to interview a peer on design a rate limiter: a one-line prompt, answers to likely clarifying questions, three probes and one curveball.",
        hint: "Decide the numbers before the session so your answers are consistent.",
        solution: "Prompt: Design a rate limiter for our public API.\nAnswers: 10M users, 100 req/min per key, 50K req/s total,\n  limits per API key, distributed across 20 servers\nProbes: 1) token bucket vs sliding window?\n  2) where is state kept, and what if Redis is down?\n  3) how do you avoid a race between two servers?\nCurveball: now limits must differ per pricing tier\n  and change without a deploy.",
      },
      {
        level: "hard",
        task: "Run three peer mocks over two weeks, then write a review comparing rubric scores and show one retried prompt with before and after scores.",
        hint: "Change only one or two things between mocks so you can see what helped.",
        solution: "Mock 1 (chat): Req 3, Design 4, Depth 2, TO 3, Comm 3\nFix: failure step + reconnect study\nMock 2 (crawler): Req 4, Design 3, Depth 3, TO 3, Comm 3\nFix: narrate while drawing\nMock 3 (retry chat, new peer):\n  Req 4, Design 4, Depth 3, TO 4, Comm 4\nResult: depth and communication improved; next focus:\n  estimation speed.",
      },
    ],
    faq: [
      { q: "Where can I find people for system design mock interviews?", a: "Colleagues and friends preparing at the same time, interview prep communities online, and mock interview platforms that either match peers for free or connect you with paid experienced interviewers." },
      { q: "Are paid mock interviews worth it?", a: "One or two can be, especially close to real interviews, because experienced interviewers know the real bar and give calibrated feedback. Do cheaper peer mocks first so you are not paying to discover basic gaps." },
      { q: "What if my peer gives only positive feedback?", a: "Give them the rubric and ask direct questions such as where did you get lost and which choice would you challenge. Concrete questions make honest answers easier." },
      { q: "How many mocks should I do before real interviews?", a: "At least three, with fixes in between, is a good minimum. Stop adding mocks when your rubric scores are steady across different prompts, not after a fixed number." },
    ],
  },
};

export default extra;
