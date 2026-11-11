import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "aws-exam-prep/official-practice": {
    plain: [
      "AWS writes the real exam, so its own practice questions are the best preview of what you will face. They show the length of the stories, the style of the wrong answers, and how small words like \"least\" or \"most\" change the right choice.",
      "There are two free starting points: the sample questions at the end of the official exam guide, and the Official Practice Question Set on AWS Skill Builder, which has around 20 questions with full explanations. A full-length Official Practice Exam is also on Skill Builder with a paid subscription.",
      "The score is not the point. The point is to learn exactly what you got wrong and why. So keep a miss log: a simple table where each wrong answer gets a row with the exam domain, the AWS service, and the reason you missed it.",
      "After 20 questions the log already shows patterns. Maybe you keep mixing up storage classes, or you miss the word \"NOT\". Those patterns tell you what to study next much better than a single percentage does.",
    ],
    deepDive: [
      {
        heading: "What the SAA-C03 exam looks like",
        body: "The Solutions Architect Associate exam (SAA-C03) has 65 questions in 130 minutes. Fifty are scored and 15 are unscored test questions that AWS is trying out; you cannot tell which is which, so treat every question seriously. Results are a scaled score from 100 to 1000, and you need 720 to pass. There is no penalty for a wrong answer, so never leave one blank.\n\nQuestions are either multiple choice (one right answer out of four) or multiple response (two or more right answers out of five or more, and the question says how many). A multiple-response question only counts if you pick all the correct options.\n\nThe four domains and their weights are: Design Secure Architectures 30%, Design Resilient Architectures 26%, Design High-Performing Architectures 24%, and Design Cost-Optimized Architectures 20%. Always check the current exam guide in case AWS updates it.",
        bullets: ["130 minutes, 65 questions, pass mark 720 of 1000", "Non-native English speakers can request 30 extra minutes", "Exam fee is 150 USD; the certification lasts 3 years"],
        visual: {
          type: "tree",
          title: "SAA-C03 domains and weights",
          root: "SAA-C03 (65 questions)",
          children: [
            { label: "Secure 30%", children: ["IAM, KMS, VPC security", "Data protection"] },
            { label: "Resilient 26%", children: ["Multi-AZ, DR", "Decoupling with SQS, SNS"] },
            { label: "High-performing 24%", children: ["Compute, storage, caching", "Database choices"] },
            { label: "Cost-optimized 20%", children: ["Pricing models", "Storage classes, right-sizing"] },
          ],
        },
      },
      {
        heading: "When to take the official set",
        body: "Official questions are limited, so do not burn them on day one. Take the free Official Practice Question Set after you have studied every domain once, roughly two to four weeks before your exam date. At that point the result is a fair calibration: it tells you where you stand against the real style, not just that you have not studied yet.\n\nAnswer under light exam conditions: no notes, no console, about two minutes per question. Commit to an answer before you look at the explanation, and mark how confident you were (sure, unsure, guess). That confidence mark is important. A correct guess is a hidden gap, and should go into your miss log just like a wrong answer.\n\nSave the full Official Practice Exam, if you buy it, for the last week as a final rehearsal.",
      },
      {
        heading: "Building a miss log that teaches you something",
        body: "A miss log is a spreadsheet with one row per wrong or guessed question. Useful columns: question topic in your own words, exam domain, main services, the option you chose, the right option, the reason you missed it, and the doc page that fixes it.\n\nThe reason column is the most valuable. Use a fixed set of reasons so you can count them. Knowledge gap: you did not know a fact, such as that S3 Glacier Deep Archive standard retrieval takes up to 12 hours. Misread: you missed a keyword like NOT, cheapest or within minutes. Overthinking: you picked a complex design when a simple managed feature worked. Confusion: you mixed up two similar services, such as EFS and FSx.\n\nKnowledge gaps call for reading and labs. Misreads call for a slower reading routine. Each reason has a different fix, which is why a raw score cannot guide you.",
        visual: {
          type: "compare",
          title: "Miss reasons and their fixes",
          columns: [
            { title: "Knowledge gap", points: ["Did not know a fact or limit", "Read the service FAQ", "Do a short lab", "Retest in a few days"] },
            { title: "Misread", points: ["Missed NOT, LEAST or a time limit", "Read the last line first", "Note every requirement", "Slow down on long stems"] },
            { title: "Service confusion", points: ["Mixed up similar services", "Make a side-by-side table", "Learn one deciding feature each", "Quiz yourself on pairs"] },
          ],
        },
      },
      {
        heading: "Reading explanations properly",
        body: "Read the explanation for every option, not just the right one. AWS explanations usually say why each wrong option fails: it does not meet the availability requirement, it needs more operational effort, or it costs more. Those reasons are reusable. The same wrong pattern, such as \"run a cron script on an EC2 instance\", appears again and again as a distractor.\n\nFor each miss, write one sentence that would have led you to the right answer, for example: \"Needs a shared POSIX file system across many Linux instances, so EFS, not EBS.\" Then open the linked documentation or the service FAQ and read that section. Ten focused minutes on the exact gap beats an hour of rereading a whole course.\n\nFinally, put every missed question in a retest list and answer it again after three to five days, without looking at your notes.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Turning one missed question into progress",
        steps: [
          { label: "Answer and rate confidence", detail: "Sure, unsure or guess" },
          { label: "Read all explanations", detail: "Why each option is right or wrong" },
          { label: "Log the miss", detail: "Domain, services, reason category" },
          { label: "Fix the gap", detail: "FAQ section or a 15 minute lab" },
          { label: "Retest in 3 to 5 days", detail: "Answer again without notes" },
        ],
      },
    ],
    examples: [
      {
        title: "A miss log entry, step by step",
        explanation: "Question: a company needs a shared file system for 20 Linux EC2 instances across three Availability Zones with the least management. You chose EBS Multi-Attach. Step 1: the right answer is Amazon EFS. Step 2: why yours fails: EBS Multi-Attach works only for io1 or io2 volumes within one Availability Zone and needs a cluster-aware file system. Step 3: reason category: service confusion. Step 4: fix: read the EFS FAQ and the EBS Multi-Attach page. Step 5: add it to the retest list.",
        code: {
          lang: "text",
          code: "Topic          | Shared Linux file system across AZs\nDomain         | High-performing (storage)\nServices       | EFS vs EBS Multi-Attach\nMy answer      | EBS Multi-Attach\nCorrect        | Amazon EFS\nReason         | Service confusion\nKey sentence   | Many Linux instances, many AZs, POSIX -> EFS\nFix            | EFS FAQ; EBS Multi-Attach limits\nRetest date    | +4 days",
        },
      },
      {
        title: "Reading a score of 14 out of 20",
        explanation: "You scored 70% on the official set. The log shows six misses: three in security (KMS key policies, SCPs, S3 bucket policies), two in cost (Savings Plans vs Reserved Instances) and one misread NOT. Step 1: security is both the heaviest domain (30%) and your weakest, so it goes first. Step 2: schedule a KMS and S3 policy lab. Step 3: make a side-by-side note for compute pricing models. Step 4: adopt a rule to circle NOT and EXCEPT in the stem. Step 5: move on to full timed exams once those fixes are done.",
      },
    ],
    cheatSheet: [
      "SAA-C03: 65 questions, 130 minutes, scaled score 100 to 1000, pass at 720",
      "15 of the 65 questions are unscored, and you cannot tell which",
      "No penalty for wrong answers: always answer every question",
      "Multiple response: pick exactly the number asked; partial answers score zero",
      "Domains: Secure 30%, Resilient 26%, High-performing 24%, Cost 20%",
      "Log guesses as misses; a lucky guess still hides a gap",
      "Retest every miss 3 to 5 days later without notes",
    ],
    quiz: [
      {
        q: "What score do you need to pass SAA-C03?",
        options: ["650", "700", "720", "800"],
        answer: 2,
        why: "The exam uses a scaled score from 100 to 1000 with 720 as the pass mark.",
      },
      {
        q: "You answer a practice question correctly but it was a pure guess. What should you do?",
        options: ["Log it in the miss log like a wrong answer", "Ignore it, it counted", "Skip that domain", "Retake the whole set immediately"],
        answer: 0,
        why: "A guess means the knowledge is not there yet, and the real exam may not be as lucky.",
      },
      {
        q: "Which domain carries the most weight on SAA-C03?",
        options: ["Design Cost-Optimized Architectures", "Design Resilient Architectures", "Design High-Performing Architectures", "Design Secure Architectures"],
        answer: 3,
        why: "Security is 30% of the scored content, the largest share.",
      },
      {
        q: "A question says \"Choose two\" and you select one correct option and one wrong option. How is it scored?",
        options: ["Half a point", "As incorrect", "As correct", "It is not scored"],
        answer: 1,
        why: "Multiple-response questions need all correct options; there is no partial credit.",
      },
      {
        q: "Most of your misses were caused by missing words like NOT and LEAST. What is the best fix?",
        options: ["Read more service FAQs", "Do more labs", "Change your reading routine: read the last line first and mark every requirement", "Take the same set again tomorrow"],
        answer: 2,
        why: "Misreads are a reading habit problem, not a knowledge problem.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Set up your miss log with the columns used in this lesson and add the first three entries from any practice questions.",
        hint: "Use a fixed list of reason categories so you can count them later.",
        solution: "Columns: topic | domain | services | my answer | correct | reason | key sentence | fix | retest date\nReason list: knowledge gap, misread, overthinking, service confusion\nAdd one row per wrong or guessed answer.",
      },
      {
        level: "medium",
        task: "Take the Official Practice Question Set on Skill Builder under exam timing, rate your confidence on each answer, and log every miss and guess.",
        hint: "About two minutes per question, no notes, and commit before reading explanations.",
        solution: "1. Timer: 2 minutes x number of questions.\n2. Mark each answer S (sure), U (unsure) or G (guess).\n3. Score it; log all wrong answers plus every U and G.\n4. Count misses per domain and per reason.\n5. Write your top two study priorities.",
      },
      {
        level: "hard",
        task: "From your miss log, build a one-week study plan that fixes your top three gaps, each with a doc to read, a lab, and a retest date.",
        hint: "Weight priorities by both your miss count and the domain's exam weight.",
        solution: "Gap 1: KMS key policies (Secure, 4 misses)\n  Read: KMS FAQ, key policy docs; Lab: encrypt S3 with a CMK, deny one role\n  Retest: day 4\nGap 2: Savings Plans vs RIs (Cost, 2 misses)\n  Read: pricing pages; Lab: Cost Explorer recommendations; Retest: day 5\nGap 3: Misreads (all domains, 3 misses)\n  Habit: last line first, circle NOT/LEAST; Retest: next timed exam",
      },
    ],
    faq: [
      { q: "Are the official practice questions free?", a: "The sample questions in the exam guide and the Official Practice Question Set on AWS Skill Builder are free with a Skill Builder account. The full-length Official Practice Exam needs a paid Skill Builder subscription." },
      { q: "Can I get extra time if English is not my first language?", a: "Yes. AWS offers an ESL accommodation that adds 30 minutes. Request it in your AWS Certification account before you schedule the exam." },
      { q: "Is the real exam harder than the official practice set?", a: "The style is the same. Many people find the real exam's scenarios a little longer, so practise reading carefully under time." },
      { q: "If I fail, how soon can I retake?", a: "You must wait 14 days before retaking, and you pay the exam fee again." },
    ],
  },

  "aws-exam-prep/timed-exams": {
    plain: [
      "Knowing AWS is not the same as passing the exam. The exam is 130 minutes of reading long stories and choosing between answers that all look reasonable. That takes focus and pacing, and both improve only with practice under real conditions.",
      "A timed practice exam is a dress rehearsal. Sit 65 questions in one go, with a 130 minute timer, no notes and no breaks you would not get on the day. You will learn how your attention holds up after an hour and where you lose time.",
      "The exam itself is only half the work. Reviewing it takes as long again. Go through every question, including the ones you got right, read the explanation, and add misses to your log.",
      "Do at least three full exams, from different question sources, spread over two or three weeks. Track your score per domain each time. When you score 80% or more on fresh exams you have not seen before, you are likely ready.",
    ],
    deepDive: [
      {
        heading: "Setting real exam conditions",
        body: "Recreate the test as closely as you can. Choose a time of day like your booked slot. Sit at a clear desk with only the practice exam open; if you will test online through Pearson VUE, remember the proctor will not allow notes, a second monitor or leaving the camera view. Silence your phone and put it in another room.\n\nUse the full 130 minutes, or 160 if you have the ESL accommodation, and do not pause. Pausing hides the most common late-exam problem: slower reading and careless mistakes in the last 20 questions. Use the exam's flag feature for questions you want to revisit.\n\nIf your practice platform has a review mode that shows answers after each question, turn it off. Seeing answers mid-exam changes how you think and makes the score meaningless.",
      },
      {
        heading: "Pacing with checkpoints",
        body: "130 minutes for 65 questions is exactly 2 minutes each, but you want time left for a second pass. Aim to finish the first pass at about 1 minute 40 seconds per question, which takes around 108 minutes and leaves about 20 minutes for flagged questions.\n\nCheckpoints make this easy to follow without constant clock-watching. By question 22 you should be at or under 37 minutes. By question 44, at or under 74 minutes. By question 65, at or under 110 minutes. If you are behind at a checkpoint, guess faster on the next hard question and flag it, rather than rushing the easy ones.\n\nShort questions often take 30 seconds, and they buy time for long scenario questions. Never spend more than about 3 minutes on one question in the first pass.",
        visual: {
          type: "flow",
          title: "Time checkpoints for 130 minutes",
          steps: [
            { label: "Start", detail: "Question 1 at 0 minutes" },
            { label: "Checkpoint 1", detail: "Question 22 by about 37 minutes" },
            { label: "Checkpoint 2", detail: "Question 44 by about 74 minutes" },
            { label: "First pass done", detail: "Question 65 by about 110 minutes" },
            { label: "Second pass", detail: "About 20 minutes for flagged questions" },
          ],
        },
      },
      {
        heading: "Reviewing an exam properly",
        body: "Plan two to three hours of review for each practice exam. Go question by question. For wrong answers, find the requirement you missed or the fact you did not know, and log it with a reason category. For correct answers you flagged or felt unsure about, check that your reasoning matched the explanation; if it did not, log it too.\n\nAlso look at your flags. If most flagged questions turned out right, you are underconfident and can flag less. If you changed answers on the second pass, count whether changes helped or hurt. Many people find their first instinct was right more often, but only your own data can tell you.\n\nEnd the review by writing your three biggest takeaways, such as \"I keep missing that NAT gateways are per AZ\". Those notes become the input for the weak-areas plan.",
      },
      {
        heading: "Tracking scores and knowing when you are ready",
        body: "A single total score hides a lot. Record each exam's total and per-domain percentages in a table. Most practice platforms break results down by domain; the real exam's score report also shows each domain as meeting or needing improvement.\n\nLook at the trend, not one number. Three exams at 68%, 74% and 81% with a rising security score tell you the plan is working. A flat score suggests you are reviewing too shallowly.\n\nUse fresh exams. Retaking the same exam measures memory: people often score 90% on a repeat while their first-try score was 65%. Mix sources, for example the Official Practice Exam and one or two well-reviewed third-party sets. A reasonable readiness rule is 80% or higher on at least two exams you have never seen, with no domain below about 70%.",
        visual: {
          type: "cycle",
          title: "The practice exam loop",
          steps: [
            { label: "Sit a fresh timed exam", detail: "130 minutes, no pauses" },
            { label: "Review every question", detail: "2 to 3 hours, log misses" },
            { label: "Record domain scores", detail: "Look for the trend" },
            { label: "Fix the weakest domain", detail: "Docs, a lab, a targeted retest" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Readiness signals",
        columns: [
          { title: "Ready", points: ["80%+ on two or more fresh exams", "No domain below about 70%", "First pass finished with time left", "Misses are rare edge facts"] },
          { title: "Not yet", points: ["High scores only on repeated exams", "One domain far below the rest", "Running out of time", "Misses on core services like VPC or IAM"] },
        ],
      },
    ],
    examples: [
      {
        title: "Running practice exam one",
        explanation: "Saturday, 9:00, matching your booked time. Step 1: phone away, one browser tab, 130 minute timer. Step 2: first pass, flag 11 questions, reach question 22 at 35 minutes and question 44 at 76 minutes (slightly behind, so guess and flag the next long one). Step 3: first pass ends at 112 minutes; second pass covers 9 of the 11 flags. Step 4: result 71%. Step 5: after a break, a 2.5 hour review logs 19 misses and 4 lucky guesses.",
      },
      {
        title: "A score tracking table across three exams",
        explanation: "After three exams from two sources, the totals rise from 71% to 82%. The table shows resilience lagging behind the others even on exam three, so the next step is a resilience deep dive (Multi-AZ, Route 53 failover, backup and DR patterns) before booking.",
        code: {
          lang: "text",
          code: "Exam          Total  Secure  Resilient  Perform  Cost  Time left\nOfficial      71%    68%     65%        78%      74%   18 min\nSource B #1   77%    80%     66%        80%      82%   22 min\nSource B #2   82%    86%     72%        84%      85%   25 min\nAction: resilience review and targeted retest before booking",
        },
      },
    ],
    cheatSheet: [
      "130 min / 65 questions = 2 min each; target 1:40 on the first pass",
      "Checkpoints: Q22 by ~37 min, Q44 by ~74 min, Q65 by ~110 min",
      "Never pause a practice exam; stamina is part of the test",
      "Review time is about equal to exam time or more",
      "Repeat exams measure memory, not readiness: use fresh ones",
      "Readiness rule: 80%+ on two fresh exams, no domain below ~70%",
      "Count whether second-pass answer changes helped or hurt you",
    ],
    quiz: [
      {
        q: "You scored 92% on a practice exam you already took two weeks ago. What does it tell you?",
        options: ["You are definitely ready", "Your weakest domain is fixed", "You should book the exam today", "Very little, because you may remember the questions"],
        answer: 3,
        why: "Repeat attempts mostly measure memory; only fresh questions show readiness.",
      },
      {
        q: "At question 44 your timer shows 85 minutes used. What should you do?",
        options: ["Speed up by guessing and flagging the next hard questions", "Skip all remaining long questions", "Stop flagging and slow down", "Restart the exam"],
        answer: 0,
        why: "You are about 10 minutes behind the 74 minute checkpoint, so recover time on hard questions, not easy ones.",
      },
      {
        q: "Why should you avoid pausing a timed practice exam?",
        options: ["The platform will delete your answers", "Pausing hides fatigue and late-exam mistakes", "It lowers the score automatically", "AWS can see it"],
        answer: 1,
        why: "The real exam runs 130 minutes straight, and focus usually drops near the end.",
      },
      {
        q: "Which result pattern best suggests you are ready to book?",
        options: ["One exam at 85% and two at 65%", "90% on the same exam taken three times", "82% and 84% on two fresh exams, all domains above 70%", "75% with 40 minutes unused"],
        answer: 2,
        why: "Consistent scores on unseen questions, with no weak domain, are the reliable signal.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write your exam-day checkpoint card for a 130 minute exam, and a second one for 160 minutes with the ESL accommodation.",
        hint: "Divide the first pass into thirds and leave about 20 minutes for flagged questions.",
        solution: "130 min: Q22 by 37, Q44 by 74, Q65 by 110, review 20\n160 min: Q22 by 46, Q44 by 92, Q65 by 135, review 25",
      },
      {
        level: "medium",
        task: "Sit one full timed practice exam and fill in a tracking row: total, four domain scores, time left, number of flags, and how many answer changes helped or hurt.",
        hint: "Note the time at each checkpoint during the exam.",
        solution: "Exam 1 | total 74% | Sec 70 Res 68 Perf 80 Cost 79 | left 15 min\nFlags 12 (8 right) | changes 5: helped 2, hurt 3\nCheckpoints: Q22 at 38, Q44 at 79 (behind), Q65 at 115\nTakeaway: speed up mid-exam; trust first answers more.",
      },
      {
        level: "hard",
        task: "After three exams, write a one-paragraph readiness decision using your table: book now, or name exactly what you will fix and how you will retest.",
        hint: "Use the 80% and 70% rules and the trend over the three exams.",
        solution: "Totals 71, 77, 82 (rising). Exam 3 domains: Sec 86, Res 72,\nPerf 84, Cost 85. Only one fresh exam is at 80%+, and resilience\nsits just above 70. Decision: not yet. Two days on DR patterns,\nRoute 53 failover and Aurora/RDS Multi-AZ with one lab, then one\nmore fresh exam. Book if it is 80%+ with resilience 75%+.",
      },
    ],
    faq: [
      { q: "How many practice exams should I take for SAA-C03?", a: "At least three full timed exams from more than one source, each followed by a full review. Quality of review matters more than the number." },
      { q: "Are third-party practice exams harder than the real exam?", a: "Some are harder and some are easier. Treat them as practice for reasoning and timing, and use the official materials to calibrate the real style." },
      { q: "Can I take breaks during the real exam?", a: "Online proctored exams do not allow breaks, and test centre breaks do not stop the clock. Plan as if you will sit the full time without a break." },
    ],
  },

  "aws-exam-prep/weak-areas": {
    plain: [
      "After a few practice exams your scores show a shape: some domains are strong and one or two are weak. The fastest way to raise your total is to fix the weak ones, even though it feels better to keep studying what you already like.",
      "Fixing a weak area has three steps. First read the right material: the service FAQs and AWS decision guides are short and full of the facts the exam uses. Then build something small in the console so the service feels real. Then test yourself again on just that topic.",
      "Labs matter more than people expect. Reading that \"a NAT gateway lives in one Availability Zone\" is easy to forget. Building one, routing a private subnet through it and watching traffic fail when you remove the route makes it stick.",
      "Keep each fix small and measurable. \"Study networking\" is too vague. \"Understand when to use a gateway endpoint, an interface endpoint or a NAT gateway, build one of each, and score 16 out of 20 on networking questions\" is a plan you can finish.",
    ],
    deepDive: [
      {
        heading: "Ranking what to fix first",
        body: "Do not just pick the lowest domain. Multiply how weak it is by how much it counts. Security is 30% of the exam, so moving it from 65% to 80% gains more than the same jump in cost optimisation at 20%. A simple priority score is (target score minus your score) times the domain weight.\n\nThen go one level deeper, inside the domain. Your miss log probably shows that most security misses come from two or three topics, such as KMS key policies, S3 access control or cross-account access. Those topics, not the whole domain, are what you study.\n\nAlso check the reason column. If many misses in a domain are misreads, the fix is a reading habit, not more study. Only knowledge gaps and service confusions go into the reading and lab plan.",
        visual: {
          type: "flow",
          title: "From scores to a study list",
          steps: [
            { label: "Domain scores", detail: "From your last two or three exams" },
            { label: "Weight by exam share", detail: "Gap x weight gives the priority" },
            { label: "Find topics inside", detail: "Group misses by service and concept" },
            { label: "Filter by reason", detail: "Gaps and confusions need study" },
            { label: "Top three topics", detail: "Each gets reading, a lab and a retest" },
          ],
        },
      },
      {
        heading: "Reading that pays off: FAQs, decision guides and Well-Architected",
        body: "AWS service FAQs read almost like exam answers: limits, behaviours and \"when should I use X instead of Y\". For storage, the S3 FAQ covers storage classes, minimum storage durations and retrieval times. For databases, the RDS and Aurora FAQs explain Multi-AZ, read replicas and failover times.\n\nAWS decision guides compare options for one need, for example choosing a database, a container service or a messaging service. They help most with service confusion, because they list the single feature that decides between two similar services.\n\nThe AWS Well-Architected Framework, especially the reliability, security and cost optimisation pillars, explains the reasoning the exam rewards: prefer managed services, design for failure across Availability Zones, and pay only for what you use. Read the pillar for your weakest domain, not the whole framework.",
        bullets: ["Weak resilience: Route 53 routing policies, RDS Multi-AZ, Aurora Global Database", "Weak security: IAM policy evaluation, KMS, S3 Block Public Access", "Weak cost: Savings Plans, Spot, S3 storage classes and lifecycle rules"],
      },
      {
        heading: "Labs that close gaps fast",
        body: "A good weak-area lab takes 30 to 60 minutes and proves one behaviour. Write the question first, such as \"what happens to an instance in a private subnet when I delete the NAT gateway route?\" Then build only what you need to see the answer, and clean up right away.\n\nProtect your wallet. Before any lab, create an AWS Budgets alert at a few dollars, use the smallest instance sizes, and delete NAT gateways, load balancers and RDS instances as soon as you are done, because they bill by the hour even when idle. Tag lab resources so they are easy to find and remove.\n\nWrite two lines after each lab: what you expected and what actually happened. Surprises are exactly the facts the exam likes to test, and those notes become your final review sheet.",
        visual: {
          type: "cycle",
          title: "A 45 minute weak-area lab",
          steps: [
            { label: "Write the question", detail: "One behaviour you want to see" },
            { label: "Build the minimum", detail: "Small sizes, tagged, budget alert on" },
            { label: "Break it on purpose", detail: "Remove a route, a policy, an AZ" },
            { label: "Note the surprise", detail: "Expected vs actual, two lines" },
            { label: "Clean up", detail: "Delete hourly-billed resources first" },
          ],
        },
      },
      {
        heading: "Retesting until the gap is closed",
        body: "A topic is fixed only when your score proves it. After reading and a lab, answer 15 to 20 questions on that topic alone. Most practice platforms let you filter by domain or service; otherwise reuse the questions in your miss log that you have not seen for a few days.\n\nSet a clear bar, such as 80% on the targeted set. If you reach it, mark the topic done and move to the next. If you do not, look at the new misses: are they the same concept (study it from a different source) or a new sub-topic (add it to the list)?\n\nFinally, confirm in context. The next full timed exam should show the domain closer to your strongest one. If the targeted score was high but the full-exam domain score stayed low, the questions you practised were too narrow; widen the topic and retest.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Common weak spots and their fixes",
        root: "Weak area",
        children: [
          { label: "VPC networking", children: ["NAT gateway vs endpoints", "Lab: private subnet egress"] },
          { label: "IAM and policies", children: ["Explicit deny wins", "Lab: SCP blocks an admin"] },
          { label: "Storage classes", children: ["Retrieval times, minimum days", "Lab: lifecycle rule"] },
          { label: "Disaster recovery", children: ["Backup, pilot light, warm standby, active-active", "Lab: Route 53 failover"] },
          { label: "Decoupling", children: ["SQS vs SNS vs EventBridge", "Lab: SNS fan-out to two queues"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing a weak resilience domain",
        explanation: "Resilience sits at 64% while everything else is above 78%. Step 1: the miss log shows six misses on DR strategies and RDS failover. Step 2: read the RDS Multi-AZ FAQ and AWS's disaster recovery whitepaper section on the four strategies (backup and restore, pilot light, warm standby, multi-site active-active). Step 3: lab: create a small RDS instance with Multi-AZ, reboot with failover, and time how long the endpoint takes to answer again (often one to two minutes). Step 4: answer 20 resilience questions: 17 right. Step 5: the next full exam shows resilience at 78%.",
      },
      {
        title: "A networking lab with the CLI",
        explanation: "Question to answer: does an instance in a private subnet reach S3 without a NAT gateway if I add a gateway endpoint? Step 1: create a gateway endpoint for S3 and attach it to the private route table. Step 2: from the instance, run aws s3 ls (needs an instance role with S3 read). Step 3: confirm the route table now lists the S3 prefix list. Step 4: delete the endpoint and see the command hang. Takeaway: gateway endpoints exist only for S3 and DynamoDB and are free.",
        code: {
          lang: "bash",
          code: "aws ec2 create-vpc-endpoint --vpc-id vpc-0abc123 \\\n  --service-name com.amazonaws.eu-west-1.s3 \\\n  --vpc-endpoint-type Gateway --route-table-ids rtb-0def456\naws ec2 describe-route-tables --route-table-ids rtb-0def456 \\\n  --query 'RouteTables[0].Routes[].DestinationPrefixListId'\n# on the private instance:\naws s3 ls --region eu-west-1",
        },
      },
    ],
    cheatSheet: [
      "Priority = (target score - your score) x domain weight",
      "Fix misreads with a reading habit; fix gaps with docs and labs",
      "Service FAQs and AWS decision guides are the densest exam reading",
      "Set an AWS Budgets alert before every lab session",
      "Delete NAT gateways, load balancers and RDS first: they bill hourly when idle",
      "Done means 80%+ on 15 to 20 targeted questions, then confirmed in a full exam",
      "Gateway endpoints: only S3 and DynamoDB, and no hourly charge",
    ],
    quiz: [
      {
        q: "Security is at 66% (weight 30%) and cost at 62% (weight 20%). With a target of 80%, which comes first by the priority rule?",
        options: ["Security", "Cost", "Both are equal", "Neither, focus on your strongest domain"],
        answer: 0,
        why: "Security: 14 x 0.30 = 4.2; cost: 18 x 0.20 = 3.6, so security gains more.",
      },
      {
        q: "Most misses in one domain are labelled misread. What should you do?",
        options: ["Read all the service FAQs again", "Do three labs in that domain", "Skip the domain", "Practise a slower reading routine and keywords"],
        answer: 3,
        why: "The knowledge is there; the error comes from how you read the question.",
      },
      {
        q: "Which lab resource is most important to delete right away to avoid charges?",
        options: ["An empty S3 bucket", "An IAM role", "A NAT gateway", "A security group"],
        answer: 2,
        why: "NAT gateways bill per hour even with no traffic; the others are free when idle.",
      },
      {
        q: "You score 90% on targeted networking questions, but networking stays weak in full exams. Why?",
        options: ["Full exams are scored differently", "The targeted set was too narrow for the real scenarios", "Networking is not on the exam", "You need more breaks"],
        answer: 1,
        why: "Widen the topic so your practice matches how the exam mixes concepts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Compute a priority score for each of your four domains from your last practice exam, with a target of 80%.",
        hint: "Use weights 0.30, 0.26, 0.24 and 0.20; a domain already above target scores zero.",
        solution: "Secure    (80-70) x 0.30 = 3.0\nResilient (80-64) x 0.26 = 4.2   <- first\nPerform   (80-79) x 0.24 = 0.2\nCost      (80-81) x 0.20 = 0 (already above target)\nOrder: Resilient, Secure, Perform.",
      },
      {
        level: "medium",
        task: "Design a 45 minute lab for one weak service. Write the question it answers, the minimum resources, how you will break it, and the cleanup list.",
        hint: "One behaviour per lab; list the hourly-billed resources for cleanup.",
        solution: "Question: does SNS fan-out deliver one message to two SQS queues?\nBuild: 1 SNS topic, 2 SQS queues, 2 subscriptions, queue policies\nTest: publish once, receive from both queues\nBreak: remove one queue policy, publish, see that queue stay empty\nCleanup: delete subscriptions, queues, topic (none bill hourly)",
      },
      {
        level: "hard",
        task: "Write a full fix plan for your weakest domain: three topics, the exact docs for each, one lab each, the targeted retest and the full-exam confirmation step.",
        hint: "Make each step something you can tick off in one sitting.",
        solution: "Domain: Resilient (64%)\n1. DR strategies: DR whitepaper; lab: AWS Backup copy to a 2nd Region\n2. RDS/Aurora HA: RDS Multi-AZ FAQ; lab: reboot with failover, time it\n3. Route 53: routing policies docs; lab: failover record + health check\nRetest: 20 resilience questions, need 16+\nConfirm: next fresh timed exam, resilience 75%+",
      },
    ],
    faq: [
      { q: "Do I need to do labs to pass SAA-C03?", a: "It is possible to pass by reading, but short labs make service behaviour and limits much easier to remember, which helps with scenario questions." },
      { q: "Is the AWS Free Tier enough for exam labs?", a: "Most labs fit in free usage or new-account credits, but some services like NAT gateways, load balancers and some RDS options cost money per hour. Set a budget alert and clean up after each lab." },
      { q: "Which AWS documents are best for exam revision?", a: "Service FAQs, AWS decision guides, and the Well-Architected Framework pillars match the exam's style and reasoning closely." },
    ],
  },

  "aws-exam-prep/exam-strategy": {
    plain: [
      "Many SAA-C03 questions have two or three answers that would work. The question decides between them with a few words: \"most cost-effective\", \"least operational overhead\", \"highest availability\" or \"with minimal changes to the application\". Learning to spot those words is a skill in itself.",
      "A keyword cheat sheet links those phrases and common needs to the AWS services that usually answer them. For example, \"decouple\" points to SQS, \"shared file system for Linux\" points to EFS, and \"block SQL injection\" points to AWS WAF.",
      "The second skill is elimination. Instead of hunting for the right answer, cross out every option that breaks a requirement. Often only one is left, and you can answer confidently even if you are unsure about one service.",
      "The third skill is time. Hard questions are worth the same as easy ones. If a question stumps you, choose your best guess, flag it, and move on. You can come back in the second pass with fresh eyes and the time you saved.",
    ],
    deepDive: [
      {
        heading: "Decoding the question stem",
        body: "Read the last sentence first. It tells you what is actually being asked, such as \"Which solution meets these requirements with the LEAST operational overhead?\" Then read the story and mark every requirement: availability, latency, cost, security, data size, time limits, and constraints like \"cannot change the application code\".\n\nPriority words decide between valid answers. \"Least operational overhead\" favours managed and serverless services over anything you patch yourself. \"Most cost-effective\" favours cheaper pricing models and storage classes, as long as every other requirement still holds. \"Minimal changes\" favours lift-and-shift options like moving a database to RDS with the same engine rather than rewriting for DynamoDB.\n\nWatch for NOT and EXCEPT, numbers (\"within 15 minutes\", \"RPO of 1 hour\") and the required number of answers in multiple-response questions.",
        bullets: ["Least overhead: managed, serverless, built-in features", "Most cost-effective: cheapest option that still meets all requirements", "Highly available: Multi-AZ at least; fault tolerant means no interruption"],
      },
      {
        heading: "Eliminating wrong answers fast",
        body: "Go through each option and ask one question: does it break any requirement? Cross it out if it does. Typical reasons: it is a single point of failure (one EC2 instance, one Availability Zone), it adds operational work (a custom script on EC2 with cron when a managed feature exists), it is technically impossible (a gateway endpoint for a service other than S3 or DynamoDB), or it costs far more than needed (Provisioned IOPS for a rarely used archive).\n\nDistractors often contain a real service used wrongly. \"Use Amazon Kinesis to decouple a web tier from an order processor\" sounds advanced, but SQS is the simpler fit for job queues. Too many moving parts is a warning sign: when two answers both work, the one with fewer services and less custom code usually wins.\n\nIf two options remain, reread the priority keyword. It almost always breaks the tie.",
        visual: {
          type: "flow",
          title: "Elimination in four checks",
          steps: [
            { label: "Breaks a requirement?", detail: "Wrong AZ count, wrong latency, too slow" },
            { label: "Impossible?", detail: "Feature does not exist or does not fit" },
            { label: "Extra custom work?", detail: "Scripts where a managed feature exists" },
            { label: "Priority keyword", detail: "Cost, overhead or speed breaks the tie" },
          ],
        },
      },
      {
        heading: "Building your keyword-to-service sheet",
        body: "Build the sheet yourself from your miss log; writing it is half the learning. Group lines by need, and keep each line short: phrase, service, and the one feature that decides it.\n\nSome lines almost everyone needs. Decouple or buffer: SQS (FIFO for strict order and exactly-once processing). One message to many subscribers: SNS, often fanning out to SQS queues. Microsecond reads for DynamoDB: DAX. Shared Linux file system: EFS; Windows SMB shares: FSx for Windows File Server; HPC scratch storage: FSx for Lustre. Unknown or changing S3 access patterns: S3 Intelligent-Tiering. Static IP addresses for global users: Global Accelerator. Cache static content near users: CloudFront. Private access to S3 from a VPC: gateway endpoint. Consistent private link to on-premises: Direct Connect; quick encrypted link: Site-to-Site VPN.\n\nReview the sheet daily in the last week, and add every new keyword you meet.",
      },
      {
        heading: "Time plan and flag-and-return",
        body: "Plan two passes. In the first pass, answer every question, even the hard ones, and flag those you are unsure about. Leaving an answer blank risks running out of time with nothing selected; a guess has at least a one in four chance.\n\nUse a two-minute rule: if you have read a question carefully, eliminated what you can, and are still stuck after about two minutes, pick the best remaining option, flag it, and move on. Later questions sometimes remind you of a fact you needed.\n\nIn the second pass, start with flagged questions where you were split between two options; those are the easiest to fix. Change an answer only when you find a clear reason, such as a missed requirement, not just a feeling. With five minutes left, stop reviewing and make sure every question has an answer.",
        visual: {
          type: "compare",
          title: "First pass vs second pass",
          columns: [
            { title: "First pass (about 110 min)", points: ["Answer every question", "Flag anything unsure", "Two-minute rule on hard ones", "Keep to the checkpoints"] },
            { title: "Second pass (about 20 min)", points: ["Start with 50/50 flags", "Change only for a clear reason", "Recheck NOT and EXCEPT stems", "Final check: nothing blank"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Priority keywords and what they favour",
        root: "Which solution is best?",
        children: [
          { label: "Least operational overhead", children: ["Managed and serverless", "Built-in features over scripts"] },
          { label: "Most cost-effective", children: ["Spot for interruptible work", "Savings Plans for steady use", "Cheaper storage classes"] },
          { label: "Highly available", children: ["Multi-AZ", "Load balancer plus Auto Scaling"] },
          { label: "Minimal changes", children: ["Same engine on RDS", "Lift and shift first"] },
          { label: "Lowest latency globally", children: ["CloudFront", "Global Accelerator", "DynamoDB global tables"] },
        ],
      },
    ],
    examples: [
      {
        title: "Working through a scenario",
        explanation: "Question: \"A company runs a nightly batch job on one EC2 instance that resizes images uploaded to S3. Jobs can be retried if interrupted. The company wants to reduce cost with the LEAST operational overhead.\" Options: A) Move to a Reserved Instance. B) Trigger an AWS Lambda function on each S3 upload. C) Run the batch on Spot Instances managed by a custom script. D) Use a larger On-Demand instance to finish faster. Step 1: last line: cost plus least overhead. Step 2: D raises cost: out. Step 3: C adds a custom script: out on overhead. Step 4: A cuts cost but still leaves a server to manage. Step 5: B removes the server entirely and you pay per invocation: answer B (assuming each resize fits Lambda's 15 minute limit).",
      },
      {
        title: "A multiple-response question",
        explanation: "\"Which TWO actions improve the availability of a web app running on one EC2 instance with a MySQL database on the same instance?\" Options: A) Move the database to Amazon RDS Multi-AZ. B) Increase the instance size. C) Put instances in an Auto Scaling group across two AZs behind an Application Load Balancer. D) Add an EBS snapshot schedule. E) Enable detailed CloudWatch monitoring. Step 1: availability means surviving failures. Step 2: B, D and E do not remove a single point of failure (snapshots help recovery, not uptime). Step 3: A and C each remove one: answer A and C, both required for the point.",
      },
    ],
    cheatSheet: [
      "Read the last line first, then mark every requirement in the story",
      "Least operational overhead: managed or serverless beats scripts on EC2",
      "Decouple: SQS; fan-out: SNS to SQS; event routing with rules: EventBridge",
      "Shared Linux files: EFS; Windows SMB: FSx for Windows; HPC: FSx for Lustre",
      "Static IPs and fast global TCP/UDP: Global Accelerator; cache content: CloudFront",
      "Two-minute rule: best guess, flag, move on",
      "Change an answer only for a clear reason, never a vague feeling",
      "Last 5 minutes: make sure nothing is left blank",
    ],
    quiz: [
      {
        q: "A question asks for the solution with the LEAST operational overhead. Two options work: a cron script on EC2, and an S3 Lifecycle rule. Which should you pick?",
        options: ["The cron script, because it is more flexible", "The S3 Lifecycle rule", "Either, they are equal", "Neither, add a third service"],
        answer: 1,
        why: "A built-in managed feature needs no server, patching or monitoring.",
      },
      {
        q: "A company needs static IP addresses that global users connect to, with traffic routed to the nearest healthy Region. Which service fits?",
        options: ["Amazon CloudFront", "Route 53 latency routing", "AWS Global Accelerator", "An Elastic IP on one instance"],
        answer: 2,
        why: "Global Accelerator gives two static anycast IPs and routes to the closest healthy endpoint.",
      },
      {
        q: "You are stuck on a question after about two minutes. What is the best move?",
        options: ["Keep working on it until you are sure", "Leave it blank and come back", "Restart reading from the first question", "Choose the best remaining option, flag it, and move on"],
        answer: 3,
        why: "An answered and flagged question keeps both your time and your chance of a point.",
      },
      {
        q: "Which phrase most strongly suggests SQS in an answer?",
        options: ["Decouple the web tier from the processing tier and buffer spikes", "Deliver one notification to email and SMS subscribers", "Query data with SQL", "Serve static files with low latency worldwide"],
        answer: 0,
        why: "SQS is the managed queue for decoupling and buffering work between components.",
      },
      {
        q: "An option describes running a custom replication script on EC2 to copy data between Regions. Why is it usually wrong?",
        options: ["Scripts cannot copy data", "EC2 is not available in all Regions", "It adds operational work when managed replication features exist", "It is always the most expensive option"],
        answer: 2,
        why: "Features like S3 Cross-Region Replication or Aurora Global Database do it with no servers to run.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write ten keyword-to-service lines for your cheat sheet from memory, then check each against AWS docs.",
        hint: "Format: phrase -> service -> the one feature that decides it.",
        solution: "decouple, buffer spikes -> SQS -> managed queue\nstrict order, no duplicates -> SQS FIFO -> ordered, exactly-once processing\nfan-out -> SNS + SQS -> one publish, many queues\nmicrosecond DynamoDB reads -> DAX -> in-memory cache\nshared Linux files -> EFS -> NFS across AZs\nWindows shares -> FSx for Windows -> SMB, AD integration\nunknown S3 access -> Intelligent-Tiering -> automatic tiering\nstatic global IPs -> Global Accelerator -> anycast IPs\nprivate S3 from VPC -> gateway endpoint -> free, route table\nblock SQL injection -> AWS WAF -> managed rules",
      },
      {
        level: "medium",
        task: "Take five practice questions and, before choosing, write for each option why you kept or eliminated it.",
        hint: "Use the four checks: breaks a requirement, impossible, extra custom work, priority keyword.",
        solution: "Q1 A: out, single AZ (breaks HA)\nQ1 B: out, custom script (overhead)\nQ1 C: kept, managed and Multi-AZ\nQ1 D: out, Provisioned IOPS not needed (cost)\n-> answer C. Repeat for Q2 to Q5; compare with the explanations\nand note which check you used least.",
      },
      {
        level: "hard",
        task: "During your next full timed exam, apply the two-minute rule strictly and record every flag. Afterwards, measure how many flags you fixed and how many answer changes helped.",
        hint: "Write the question number and your first choice next to each flag.",
        solution: "Flags: 10 (Q7, Q12, Q19, ...), first choices noted\nSecond pass: changed 4 answers\n  helped 3 (missed requirement found), hurt 1 (gut feeling)\nFlags right after review: 7 of 10\nRule for exam day: change only when a requirement was missed.",
      },
    ],
    faq: [
      { q: "Is there negative marking on AWS exams?", a: "No. A wrong answer scores the same as a blank one, so always choose an answer for every question." },
      { q: "What does least operational overhead mean?", a: "The option that needs the least ongoing work to run: no servers to patch, scale or monitor yourself. Managed and serverless services usually win." },
      { q: "Can I bring a cheat sheet into the exam?", a: "No. Notes are not allowed in the test centre or in online proctored exams. The cheat sheet is a study tool for the weeks before." },
      { q: "Should I change answers on review?", a: "Only when you find a concrete reason, such as a requirement you missed. Track your own practice data to see whether changes help you." },
    ],
  },
};

export default extra;
