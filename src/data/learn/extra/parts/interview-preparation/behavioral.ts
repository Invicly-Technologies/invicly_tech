import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "behavioral/resume": {
    plain: [
      "Your resume has one job: to get you a first call. It is not your life story. A recruiter may look at it for only a few seconds before deciding, so the most important facts must be easy to find at the top.",
      "Each line about your work should say what changed because of you. \"Worked on the login page\" tells the reader nothing. \"Cut login errors by 30% by adding input checks\" tells them what you did, how, and why it mattered. Numbers make your work real.",
      "LinkedIn and GitHub are the second look. When a recruiter or engineer likes your resume, they often open your profiles. A clear headline, a short summary and a few tidy projects with good READMEs make them trust what the resume says.",
      "You do not need a fancy design. A simple, one-column page with clear headings is easier for people to read and for software to parse. Spend your time on the words, not the layout.",
    ],
    deepDive: [
      {
        heading: "How resumes are screened in practice",
        body: "Most companies use an applicant tracking system (ATS) such as Greenhouse, Lever or Workday. It stores applications and parses your resume into fields like job titles, dates and skills. Recruiters then search and filter those fields, often by keywords from the job description. Few systems reject people automatically on keywords alone, but if the parser cannot read your file, or the skills the recruiter searches for are missing, you are simply not found.\n\nAfter that, a person skims. They check recent titles, companies, dates, the tech stack and one or two strong bullets. Then, for engineering roles, a hiring manager or engineer often reads it more carefully before the phone screen. Write for all three readers: the parser (plain structure), the recruiter (clear keywords and titles), and the engineer (specific, believable details).",
        visual: {
          type: "flow",
          title: "The path your resume takes",
          steps: [
            { label: "Apply", detail: "PDF uploaded to the ATS" },
            { label: "Parse", detail: "Text split into titles, dates, skills" },
            { label: "Recruiter search", detail: "Filters and keywords from the job post" },
            { label: "Quick skim", detail: "Titles, stack, one strong bullet" },
            { label: "Engineer review", detail: "Checks depth and believability" },
            { label: "Phone screen", detail: "Every bullet is now a question" },
          ],
        },
      },
      {
        heading: "Writing bullets with real impact",
        body: "A strong bullet follows a pattern like: action verb, what you built or changed, how you did it, and the measurable result. Put the result early when it is impressive. Good metrics are latency (p95 from 800 ms to 200 ms), cost (saved 3,000 dollars a month), time (cut deploy time from 40 to 8 minutes), scale (serves 2 million requests a day), quality (reduced on-call pages by half) or adoption (used by 5 teams).\n\nIf you do not have an exact number, use an honest estimate and be ready to explain how you got it. If there is truly no metric, describe scope and difficulty instead: \"Led migration of 14 services from Jenkins to GitHub Actions with zero downtime.\" Never invent numbers; interviewers will ask how you measured them.\n\nKeep 3 to 5 bullets for recent roles and 1 to 3 for older ones. Start each with a different strong verb, and cut words like \"responsible for\" or \"helped with\".",
        bullets: ["Built, migrated, automated, reduced, designed, led, launched", "Students: use projects, internships and hackathons with the same pattern", "Each bullet should survive the follow-up: how did you measure that?"],
      },
      {
        heading: "Fitting it on one page",
        body: "One page is the norm for people with less than about ten years of experience, and recruiters prefer it. The usual order: name and contact links, a short skills line, experience (newest first), projects, education. Fresh graduates can put education and projects above experience.\n\nTo cut length, remove the objective statement, old or unrelated jobs, school details beyond your degree, soft skills like \"team player\", and any bullet that does not show impact. Combine small items into one line. Keep margins around 1.5 to 2 cm and the font around 10 to 11 points; do not squeeze below that.\n\nTailor a little for each role. Keep a longer master resume with every bullet you have, then for each application choose the bullets and skills that match the job post. Save as PDF with a clear file name like Firstname-Lastname-Resume.pdf, and check that you can select and copy the text, which shows the parser can read it.",
        bullets: ["Skip photos, age and full address in most countries", "No tables, text boxes or two-column layouts for the main content", "Link GitHub and LinkedIn with short, clean URLs"],
      },
      {
        heading: "LinkedIn that recruiters find",
        body: "Recruiters search LinkedIn by title, skills and location, so your headline and skills section matter most. A good headline names the role you want and your main stack: \"Backend Engineer | Java, Spring Boot, AWS\". Your current title and the skills you list are used in search, so keep them accurate and specific.\n\nThe About section is 3 to 5 short sentences: what you do, what you are best at, one or two proud results, and what you are looking for. Fill Experience with the same impact bullets as your resume, slightly shorter. Turn on Open to Work (you can show it only to recruiters), set your preferred locations and job titles, and use a clear, friendly photo. Ask two or three colleagues for short recommendations that mention specific work.",
      },
      {
        heading: "GitHub as proof of skill",
        body: "Few reviewers read your code line by line, but many open your profile to check that projects are real. Pin 3 to 6 repositories that match the jobs you want. Quality beats quantity: one well-finished project is worth more than twenty tutorial copies.\n\nEach pinned repo needs a README that answers, in order: what it is (one sentence), a screenshot or example output, how to run it (copy-paste commands), the tech used, and what you would improve next. Add tests and a CI badge if you can, because they show professional habits. Keep commit messages meaningful.\n\nYou can also create a profile README by making a public repo with the same name as your username; its README shows at the top of your profile. Keep it short: who you are, your stack and links to your best work. Remove or archive repos with secrets, broken builds or nothing in them.",
        visual: {
          type: "layers",
          title: "A pinned repo README, top to bottom",
          layers: [
            { label: "Title and one-line pitch", detail: "What it does and for whom" },
            { label: "Screenshot or demo output", detail: "Proof it works in 3 seconds" },
            { label: "Quick start", detail: "Copy-paste install and run commands" },
            { label: "Features and tech stack", detail: "Short list, with key design choices" },
            { label: "Tests and CI", detail: "How to run tests, CI badge" },
            { label: "What I would do next", detail: "Shows you think beyond the tutorial" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One-page resume layout",
        root: "Resume (one page)",
        children: [
          { label: "Header", children: ["Name, email, phone", "LinkedIn and GitHub links"] },
          { label: "Skills", children: ["Languages", "Frameworks", "Cloud and tools"] },
          { label: "Experience", children: ["Newest first", "3 to 5 impact bullets each"] },
          { label: "Projects", children: ["2 to 3 with links", "Stack and result"] },
          { label: "Education", children: ["Degree, school, year", "Certifications if relevant"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turning a duty into an impact bullet",
        explanation: "Start with a weak line: \"Responsible for CI/CD pipelines.\" Step 1: ask what changed because of you. Maybe you moved builds to GitHub Actions and added caching. Step 2: find a number: build time went from 25 minutes to 7. Step 3: add scope: 12 services, used by 30 developers. Step 4: pick a strong verb and put it together. Step 5: check you can explain the how in an interview, such as the caching strategy and why builds were slow.",
        code: {
          lang: "text",
          code: "Before: Responsible for CI/CD pipelines.\n\nAfter:  Cut CI build time from 25 to 7 minutes for 12 services by\n        migrating to GitHub Actions with dependency caching and\n        parallel test jobs, saving 30 developers about an hour a day.",
        },
      },
      {
        title: "Tailoring a resume to one job post",
        explanation: "The job asks for Python, AWS, Terraform and Kubernetes, with on-call experience. Step 1: highlight these words in the post. Step 2: from your master resume, choose bullets that prove each one; for example the Terraform migration and the incident you led. Step 3: move those bullets to the top of each role. Step 4: update the skills line so the same words appear exactly as in the post (Terraform, not just IaC), but only if they are true. Step 5: drop a less relevant project to keep one page. This takes 15 minutes and makes the match obvious to both the ATS and the recruiter.",
      },
    ],
    cheatSheet: [
      "Bullet formula: action verb + what you did + how + measurable result",
      "One page, one column, plain headings, saved as a text-selectable PDF",
      "3 to 5 bullets for recent roles, 1 to 3 for older ones",
      "Use the job post's exact words for skills you really have",
      "LinkedIn headline: target role | main stack | focus area",
      "Pin 3 to 6 repos, each with a screenshot, run steps and tests",
      "Never invent a metric: every number is a future interview question",
    ],
    quiz: [
      {
        q: "Which bullet is strongest?",
        options: ["Responsible for the payments API", "Worked with a team on many backend features", "Reduced payment failures 40% by adding retries with idempotency keys (Java, Kafka)", "Hard-working engineer with good communication skills"],
        answer: 2,
        why: "It states the action, the method, the stack and a measurable result.",
      },
      {
        q: "Why avoid two-column layouts and text boxes?",
        options: ["ATS parsers can read the text in the wrong order or miss it", "They use more ink", "Recruiters cannot print them", "They are not allowed in PDF files"],
        answer: 0,
        why: "Many parsers read left to right across the page, mixing columns into nonsense.",
      },
      {
        q: "You improved a report, but you have no exact number. What should you do?",
        options: ["Invent a realistic number", "Leave the bullet out entirely", "Write \"improved performance significantly\"", "Use an honest estimate or describe scope, and be ready to explain it"],
        answer: 3,
        why: "Estimates and scope are fine if you can defend them; invented numbers fall apart under questions.",
      },
      {
        q: "What should a pinned GitHub repository's README show first?",
        options: ["The full license text", "What the project does, with a screenshot or example output", "A list of every commit", "Your contact details"],
        answer: 1,
        why: "A reviewer decides in seconds whether the project is real and relevant.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Rewrite this bullet with a verb, method and result: \"Worked on improving the website speed.\"",
        hint: "Invent a realistic scenario for practice: what did you change, and what was measured?",
        solution: "Reduced homepage load time from 4.1 s to 1.6 s (Lighthouse score 52 to 91)\nby compressing images, lazy-loading below-the-fold content and caching\nstatic assets on a CDN.",
      },
      {
        level: "medium",
        task: "Write a LinkedIn headline and a 4-sentence About section for a junior DevOps engineer who knows Linux, Docker, Kubernetes and GitHub Actions.",
        hint: "Role and stack in the headline; what you do, a result, and what you want in the About.",
        solution: "Headline: Junior DevOps Engineer | Linux, Docker, Kubernetes, GitHub Actions\n\nAbout: I build and automate the path from code to production.\nRecently I containerised a Flask app and set up a GitHub Actions pipeline\nthat tests, builds and deploys it to a k3s cluster in under 5 minutes.\nI enjoy debugging Linux and networking problems and writing clear runbooks.\nI am looking for a junior DevOps or SRE role where I can learn on call.",
      },
      {
        level: "hard",
        task: "Take your current resume and produce a tailored one-page version for a specific job post. List the five keywords you targeted and which bullet proves each.",
        hint: "Highlight required skills in the post first, then map each to evidence.",
        solution: "1. Copy the job post; highlight required skills and responsibilities.\n2. Pick the 5 that appear most or are listed first.\n3. For each, find or write one bullet that proves it with a result.\n4. Move those bullets to the top of the relevant roles.\n5. Align skill names exactly with the post where true.\n6. Cut unrelated items until it fits one page.\n7. Export to PDF and confirm the text can be selected and copied.",
      },
    ],
    faq: [
      { q: "Can my resume be two pages?", a: "With more than about ten years of relevant experience, two pages is acceptable. For students and early-career engineers, one page is strongly preferred because recruiters skim." },
      { q: "Should I include a photo?", a: "In the US, UK, Canada and India tech hiring, usually no; it takes space and can invite bias. Some European countries still expect one, so follow local norms." },
      { q: "Do I need a cover letter?", a: "Many tech applications do not require one, and many are never read. When a role asks for it, or you are changing careers, a short and specific letter can help." },
      { q: "Should I list every technology I have touched?", a: "No. List the ones you could answer interview questions about. A long list of half-known tools invites questions you cannot answer well." },
    ],
  },

  "behavioral/star": {
    plain: [
      "Behavioural questions start with phrases like \"Tell me about a time when...\". The interviewer is not testing your code. They want to know how you act at work: how you handle a disagreement, a mistake, pressure or unclear goals.",
      "The idea behind these questions is simple: what you did before is the best guess for what you will do next. So they want real stories from your past, not what you would do in theory. A real, specific story is much more convincing than a general answer.",
      "STAR is a simple shape for each story. Situation: where and when. Task: what you had to do. Action: what you did, step by step. Result: what happened, ideally with a number, and what you learned.",
      "You do not need a new story for every question. Six to eight good stories, practised until they feel natural, can answer almost anything. You just choose which part of the story to stress for each question.",
    ],
    deepDive: [
      {
        heading: "What the interviewer is scoring",
        body: "Behind each behavioural question is a short list of signals the interviewer writes down. Common ones are ownership (did you take responsibility?), collaboration (how did you work with others?), communication (were you clear and honest?), dealing with ambiguity (did you move forward without perfect information?), growth (did you learn and change?) and impact (did it matter?). Senior roles add scope and influence: did you lead people you did not manage, or change how a team works?\n\nAmazon makes this explicit with its Leadership Principles, such as Customer Obsession and Ownership, and many companies have similar values. Read the company's values page before the interview and tag your stories with the values they show. Interviewers usually fill a feedback form after the call, so give them clear, quotable evidence: specific actions, specific results, and your personal role in them.",
        visual: {
          type: "tree",
          title: "Signals hiding behind common questions",
          root: "Behavioural signals",
          children: [
            { label: "Ownership", children: ["A time you went beyond your role", "A mistake you made"] },
            { label: "Collaboration", children: ["A conflict with a teammate", "Working with another team"] },
            { label: "Ambiguity", children: ["Unclear requirements", "A decision without full data"] },
            { label: "Impact", children: ["Your proudest project", "Something you improved"] },
            { label: "Growth", children: ["Hard feedback you received", "Learning something fast"] },
          ],
        },
      },
      {
        heading: "Timing each part of the story",
        body: "A good STAR answer takes about two minutes, and the parts are not equal. Situation and Task together should take 15 to 30 seconds: just enough context for the story to make sense. Action is the heart, about one minute or more. Result takes 15 to 30 seconds and ends with what you learned or would do differently.\n\nIn Action, use \"I\", not \"we\". It feels unnatural at first, but the interviewer is hiring you, not your team. Describe your thinking as well as your steps: what options you saw, why you chose one, and who you talked to. Name concrete things, like the metric you checked, the document you wrote, the meeting you set up.\n\nEnd with a clear result. If the outcome was bad, say so honestly, then explain what you changed afterwards. Then stop talking. A short silence is fine; the interviewer will ask follow-ups.",
        visual: {
          type: "compare",
          title: "Weak vs strong Action section",
          columns: [
            { title: "Weak", points: ["We decided to fix it", "Vague: worked hard on it", "No reasoning shown", "Two sentences long"] },
            { title: "Strong", points: ["I proposed and tested a fix", "Specific steps and tools", "Explains why this option", "About half of the answer"] },
          ],
        },
      },
      {
        heading: "Conflict and failure stories",
        body: "These two cause the most trouble. For conflict, choose a real disagreement about work, such as a design choice or a deadline, not a personal fight. Show that you listened first, understood the other side's goal, used data or a small experiment to decide, and kept the relationship good. Avoid stories where the other person is simply wrong and you are the hero; the interviewer is checking how you treat colleagues.\n\nFor failure, choose a real mistake with real consequences that you owned, for example a bug you shipped or a project you estimated badly. Do not pick a disguised strength like \"I work too hard\". Spend little time on the failure itself and more on what you did right after (fixed, communicated, apologised) and what you changed so it would not happen again, like a test, a checklist or a review process. The lesson is the most important part.",
        bullets: ["Conflict: listen, find shared goals, use data, keep the relationship", "Failure: own it fast, fix it, change the process", "Never blame a named person or a former employer"],
      },
      {
        heading: "Leadership and impact without a manager title",
        body: "Juniors often think they have no leadership stories. Leadership in interviews means influence: you made something better without being told to. Examples: you noticed flaky tests and organised a fix, you wrote onboarding docs that new hires now use, you mentored an intern, you pushed for a postmortem after an outage, or you coordinated with another team to unblock a release.\n\nImpact stories need a number or a clear before-and-after. \"The deploy used to take an hour and fail one in five times; after my change it took ten minutes and failed rarely.\" If you cannot share exact business numbers, give relative ones (cut by half) or user-facing effects (support tickets dropped). For senior roles, show wider scope: changing team practices, aligning several teams, or making a trade-off between speed and quality that you can defend.",
      },
      {
        heading: "Rehearsing so it sounds natural",
        body: "Write each story as short bullet notes, not a script. A memorised script sounds robotic and breaks when the interviewer interrupts. For each story note: a one-line title, the situation in one line, three or four key actions, the result with a number, the lesson, and two or three themes it covers.\n\nThen say it out loud with a timer. Record yourself on your phone and listen once: cut filler, long setups and any \"we\" in the Action. After a few rounds, practise with a friend who interrupts with follow-ups such as: \"Why did you choose that?\", \"What would you do differently?\", \"What did your manager think?\", \"What was the hardest part?\". Prepare one extra detail for each so you can go deeper smoothly.\n\nFinally, build a story matrix: stories as rows, common questions as columns, so you can quickly pick the best fit in the interview.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A behavioural question with follow-ups",
        actors: ["Interviewer", "You"],
        messages: [
          { from: 0, to: 1, label: "Tell me about a conflict" },
          { from: 1, to: 0, label: "Situation and task, 20 seconds" },
          { from: 1, to: 0, label: "Actions with I, about 1 minute" },
          { from: 1, to: 0, label: "Result with a number and lesson" },
          { from: 0, to: 1, label: "Why did you choose that approach?" },
          { from: 1, to: 0, label: "Options you weighed and why" },
          { from: 0, to: 1, label: "What would you do differently?" },
          { from: 1, to: 0, label: "One honest, specific change" },
        ],
      },
    ],
    examples: [
      {
        title: "A failure story, built step by step",
        explanation: "Question: tell me about a time you made a mistake. Step 1: choose a real one, such as a migration that locked a production table for 10 minutes. Step 2: keep the setup short. Step 3: in Action, show ownership: you noticed, rolled back, told the team immediately, and wrote the incident note. Step 4: Result: service restored and no data lost. Step 5: the lesson and the process change: you now test migrations on a copy of production data and use a lock timeout. Notice the failure itself takes only one sentence.",
        code: {
          lang: "text",
          code: "S: I ran a schema migration on our orders database during the day.\nT: I owned the change and its rollout.\nA: It locked the table and checkouts failed. I saw the alert within a\n   minute, cancelled the migration, posted in the incident channel,\n   and confirmed recovery. I then rewrote it to add the column without\n   a default and backfill in small batches.\nR: 10 minutes of failed checkouts, no data lost. I added a lock_timeout\n   and a staging test with production-sized data to our checklist,\n   and we have had no migration outages since.",
        },
      },
      {
        title: "Reusing one story for three questions",
        explanation: "Story: you led a migration from cron jobs to a queue-based worker system. For \"leadership\", stress how you wrote the proposal, got buy-in from two teams and split the work. For \"conflict\", stress the disagreement with the senior engineer who preferred keeping cron, and how a one-week prototype settled it. For \"impact\", stress the result: failed jobs dropped from about 50 a week to 2, and on-call pages fell by half. Same facts, different emphasis. Tag the story with all three themes in your story bank.",
      },
    ],
    cheatSheet: [
      "STAR: Situation, Task, Action, Result; about 2 minutes in total",
      "Situation plus Task in 30 seconds or less; Action is the longest part",
      "Say I for your actions, and we only for the team's shared result",
      "End with a number and a lesson, then stop and wait for follow-ups",
      "Failure stories: one sentence on the mistake, the rest on fixing and learning",
      "Keep notes as bullets, not scripts, so you can handle interruptions",
      "Read the company's values and tag each story with the ones it shows",
    ],
    quiz: [
      {
        q: "Which part of a STAR answer should usually take the most time?",
        options: ["Situation", "Task", "Result", "Action"],
        answer: 3,
        why: "Action shows what you personally did and how you think, which is what is being assessed.",
      },
      {
        q: "Which is the best choice for a \"tell me about a failure\" question?",
        options: ["A real mistake you owned, how you fixed it and what you changed after", "\"I am a perfectionist\"", "A project that failed because a teammate was lazy", "Saying you have never really failed"],
        answer: 0,
        why: "Interviewers look for ownership and learning, not perfection or blame.",
      },
      {
        q: "Why should notes be bullets rather than a full script?",
        options: ["Scripts are too short", "Interviewers ban scripts", "Scripts sound robotic and fall apart when you are interrupted", "Bullets are required by STAR"],
        answer: 2,
        why: "Bullets keep the key facts while letting you speak naturally and adapt to questions.",
      },
      {
        q: "You are junior and have no team-lead experience. What is a good leadership story?",
        options: ["Say leadership is not relevant to you", "Organising a fix for flaky tests that nobody owned", "Describe your manager's leadership", "Invent a team you led"],
        answer: 1,
        why: "Leadership in interviews means taking initiative and influencing others, not having a title.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a STAR outline (one line per letter) for a time you learned a new technology quickly.",
        hint: "Pick a specific tool and a deadline that forced you to learn it.",
        solution: "S: Our team needed a dashboard for a launch in two weeks, built in React.\nT: I had only used plain JavaScript, and I owned the dashboard.\nA: I did the official tutorial in two evenings, built a small prototype,\n   asked a senior dev for one code review per day, and reused the design system.\nR: Shipped on time; the dashboard is still used. I learned to get early\n   reviews instead of polishing alone.",
      },
      {
        level: "medium",
        task: "Build a story matrix: list six of your stories and mark which of these they can answer: conflict, failure, leadership, impact, ambiguity, feedback.",
        hint: "Each story should cover at least two themes, and every theme should have two stories.",
        solution: "Story                      | Conf | Fail | Lead | Impact | Ambig | Feedback\nCron to queue migration    |  x   |      |  x   |   x    |       |\nMigration outage           |      |  x   |      |        |       |    x\nOnboarding docs            |      |      |  x   |   x    |       |\nUnclear analytics request  |      |      |      |        |   x   |    x\nCode review disagreement   |  x   |      |      |        |       |    x\nLaunch with no spec        |      |  x   |  x   |        |   x   |\n# Gaps are fine as long as each theme has at least two stories.",
      },
      {
        level: "hard",
        task: "Record yourself answering \"Tell me about a time you disagreed with your manager\" in under two minutes, then answer three follow-up questions a friend asks without notes.",
        hint: "Likely follow-ups: why, what would you change, what did they think.",
        solution: "1. Draft bullets: situation, the disagreement, your evidence, the outcome.\n2. Record, time it, and cut the setup to under 30 seconds.\n3. Replace every we in the Action with what you did.\n4. Prepare answers to: Why did you push back? What was their view?\n   What would you do differently? How is the relationship now?\n5. Have a friend ask them in random order; answer in under 45 seconds each.\n6. Re-record once and compare with the first take.",
      },
    ],
    faq: [
      { q: "What if I do not have work experience yet?", a: "Use stories from university projects, internships, hackathons, open source, part-time jobs or volunteering. The behaviours being tested, like ownership and teamwork, are the same." },
      { q: "Is it okay to use the same story twice in one interview loop?", a: "Across different interviewers it is fine and common, because each writes separate feedback. Within one interview, try to use different stories so you show range." },
      { q: "How do I answer \"What is your greatest weakness?\"", a: "Name a real, work-related weakness that is not core to the job, give a short example, and explain the concrete steps you are taking to improve it." },
      { q: "Should I memorise my answers word for word?", a: "No. Memorise the key facts and numbers, and practise telling the story in slightly different words each time so it stays natural." },
    ],
  },

  "behavioral/mocks": {
    plain: [
      "A mock interview is a practice interview that feels like the real one: a timer, a stranger or friend watching, and no pausing to look things up. It is the closest you can get to the real pressure without risking a real job.",
      "Solving problems alone at home trains your knowledge. Mocks train your performance: talking while you think, staying calm when stuck, managing time, and answering follow-up questions. Many people who know the material well still fail because they never practised the performance.",
      "The real value comes after the mock. Write down what went wrong while it is fresh. Then practise exactly that weakness before the next mock. Over four to six mocks, the same mistakes should slowly disappear.",
      "Mix the types. If your target companies have coding, system design and behavioural rounds, practise all three. Doing only coding mocks and then meeting your first design round in a real interview is a common and avoidable mistake.",
    ],
    deepDive: [
      {
        heading: "Planning a mock schedule",
        body: "Count back from your first real interview. A common plan is four to eight mocks over three to six weeks, with at least two or three days between them so you have time to drill what each one revealed. Put your weakest round type first, so you have the most time to improve it.\n\nMatch the real format. Find out each company's loop from the recruiter: how many coding rounds, whether there is system design, the language allowed, and whether they use a shared editor without autocomplete or a whiteboard. Then mock that exact setup. For example, a typical loop might be two coding rounds of 45 minutes, one system design of 45 to 60 minutes and one behavioural round. Do at least one full mock day with several rounds back to back, because tiredness in the fourth interview is real.\n\nSchedule real interviews in rough order of how much you want the job, with the most wanted ones last, so earlier interviews act as practice too.",
        visual: {
          type: "flow",
          title: "A four-week mock plan",
          steps: [
            { label: "Week 1", detail: "Two coding mocks, find weak patterns" },
            { label: "Week 2", detail: "One coding, one behavioural mock" },
            { label: "Week 3", detail: "One or two system design mocks" },
            { label: "Week 4", detail: "Full mock loop, back to back" },
            { label: "Real interviews", detail: "Less wanted companies first" },
          ],
        },
      },
      {
        heading: "Where to find mock partners",
        body: "Peers are free and good enough for most practice: classmates, colleagues, or people from online communities preparing for the same roles. Take turns being interviewer and candidate. Being the interviewer teaches a lot, because you see how unclear explanations sound from the other side.\n\nSome platforms pair you with other candidates for free peer mocks. Paid services like interviewing.io and Exponent connect you with experienced engineers from big tech companies, which is worth it before a big loop or for system design, where peers often lack depth. Some bootcamps and university career centres also run mocks.\n\nWhatever the source, give your partner a clear brief: the round type, the target company, and what feedback you want, such as \"tell me when I go quiet\" or \"was my design deep enough?\". Ask them to use a real rubric instead of only saying \"good job\".",
      },
      {
        heading: "Getting feedback you can act on",
        body: "Vague feedback like \"pretty good\" does not help. Ask your partner to rate you on the same areas real interviewers use. For coding: problem understanding, communication, solution quality, code quality, testing and speed. For system design: requirements, high-level design, deep dives, trade-offs and handling scale. For behavioural: clear structure, personal actions, results and self-awareness.\n\nAsk for one strength to keep and two things to fix, each tied to a moment: \"at minute 12 you started coding before agreeing on the approach\". Recording the session (with permission) is even better, because you can see your own silences and filler words.\n\nWrite everything in a feedback log right away: date, round type, problem, outcome, what went well, what went badly, and the next drill. After three or four mocks, read the log and look for repeating issues; those are your real weak areas.",
        bullets: ["Ask for a hire or no-hire decision and the reason", "One strength, two fixes, each with a timestamp", "Look for patterns across mocks, not single bad moments"],
      },
      {
        heading: "Thinking aloud without losing focus",
        body: "Interviewers grade your process, and they can only grade what they hear. Talking also lets them give hints before you go far down a wrong path. But talking and thinking at the same time is a skill you must practise.\n\nUse simple phrases that buy time and show structure: \"Let me restate the problem to make sure I understand.\" \"A brute force would be O(n squared); can we do better with a hash map?\" \"I am going to handle the empty input first.\" \"I am not sure yet; let me try a small example.\" When you need silence to think, say so: \"Give me 30 seconds to think about the edge cases.\" That is far better than going quiet for five minutes.\n\nWhen you are stuck, talk about what you know: the pattern you suspect, what has failed, and why. Interviewers often hint at this point. Practise by solving problems alone while speaking aloud, even to an empty room, until it feels normal.",
      },
      {
        heading: "Drilling weak areas between mocks",
        body: "Turn each weakness into a specific drill with a target. If graph problems keep beating you, do five to ten graph problems in a few days, starting with the standard templates (BFS on a grid, topological sort) until you can write them quickly from memory. If you run out of time, practise with a strict timer: 5 minutes clarifying, 10 planning, 20 coding, 5 testing. If your code is buggy, practise tracing one example by hand before saying you are done.\n\nFor system design weaknesses, rehearse the framework (requirements, estimates, API, data model, high-level design, deep dives) on two new problems, out loud and timed. For behavioural ones, re-record the weak story.\n\nThen test the fix in the next mock. If the same issue shows up again, the drill was not enough; change it or do more. This loop of mock, log, drill and re-test is what makes improvement steady instead of random.",
        bullets: ["Bugs: trace a small example by hand before saying done", "Time: 5 clarify, 10 plan, 20 code, 5 test", "Silence: practise speaking aloud even when alone"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Peer mocks vs expert mocks",
        columns: [
          { title: "Peer mock", points: ["Free, easy to repeat often", "You also practise interviewing", "Feedback may be shallow", "Great for coding and behavioural"] },
          { title: "Expert mock", points: ["Paid, an experienced interviewer", "Realistic bar and rubric", "Deep feedback on design", "Best before an important loop"] },
        ],
      },
    ],
    examples: [
      {
        title: "Running a 45-minute coding mock",
        explanation: "You and a friend agree to swap roles. Step 1: the interviewer picks an unseen medium problem and pastes it into a shared editor with no autocomplete. Step 2: you spend about 5 minutes asking questions about input size, duplicates and edge cases. Step 3: you state a brute force and its complexity, then improve it, and agree on the approach before coding. Step 4: you code for about 20 minutes, narrating. Step 5: you test with a small example and an edge case. Step 6: the last 5 to 10 minutes are feedback using a rubric, written into your log immediately.",
        code: {
          lang: "text",
          code: "00:00  Interviewer reads problem\n00:01  Clarify: input size, duplicates, empty input, return format\n00:06  Brute force + complexity, then optimised idea + complexity\n00:12  Agree on approach, start coding while narrating\n00:32  Trace an example, test edge cases, fix bugs\n00:37  Interviewer follow-up: can you do it in O(1) extra space?\n00:40  Feedback: rubric scores, 1 strength, 2 fixes",
        },
      },
      {
        title: "Turning a feedback log into a plan",
        explanation: "After four mocks your log shows: lost time in mocks 1 and 3 by coding before planning, went silent in mocks 2 and 3, and the system design mock lacked capacity estimates. Step 1: list the three repeating issues. Step 2: assign a drill to each: always say the plan out loud before coding; solve three problems alone while speaking; practise back-of-envelope estimates on two designs. Step 3: in mock 5, ask your partner to watch specifically for these three. Step 4: if they are fixed, move on to new weaknesses; if not, repeat the drill.",
      },
    ],
    cheatSheet: [
      "Do at least four timed mocks; aim for six to eight before an important loop",
      "Mock the real format: same time limit, same editor or whiteboard, same round types",
      "Coding time budget: about 5 clarify, 10 plan, 20 code, 5 test",
      "Ask for one strength and two fixes, each tied to a moment in the mock",
      "Log every mock right away: problem, result, went well, went badly, next drill",
      "Say \"give me 30 seconds to think\" instead of going silent",
      "Peers for volume, paid experts before the interviews that matter most",
    ],
    quiz: [
      {
        q: "You keep running out of time in coding mocks. What is the most useful drill?",
        options: ["Read more theory", "Practise with a strict per-phase timer and agree on the plan before coding", "Skip clarifying questions", "Only do easy problems"],
        answer: 1,
        why: "Time problems usually come from unplanned coding, and a phase timer fixes the habit directly.",
      },
      {
        q: "You need a minute of quiet to think during a coding interview. What should you do?",
        options: ["Go silent and hope they wait", "Start typing anything", "Tell the interviewer you need 30 seconds to think, then share what you found", "Ask for the answer"],
        answer: 2,
        why: "Announcing the pause keeps the interviewer informed and is fully acceptable.",
      },
      {
        q: "What is the main reason to keep a feedback log across mocks?",
        options: ["To spot repeating weaknesses and plan targeted drills", "To show recruiters", "To memorise the problems", "It is required by mock platforms"],
        answer: 0,
        why: "Patterns across several mocks reveal the real weak areas, not one bad day.",
      },
      {
        q: "Your target loop has coding, system design and behavioural rounds. Which mock plan is best?",
        options: ["Only coding, because it is the hardest", "Only behavioural, because it is easy to practise", "One random mock the day before", "Mocks of all three types, plus at least one full loop back to back"],
        answer: 3,
        why: "Each round type is a separate skill, and a full loop also trains stamina.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Solve one medium problem alone with a 40-minute timer while speaking every thought out loud, and record your voice. Count how many times you were silent for more than 30 seconds.",
        hint: "Use any problem you have not seen; your phone's voice recorder is enough.",
        solution: "1. Pick an unseen medium problem and start the recorder and timer.\n2. Restate the problem aloud, list edge cases, state brute force.\n3. Narrate the optimised plan before coding.\n4. Code and test while speaking.\n5. Listen back and mark every silence over 30 seconds.\n6. Write one sentence per silence: what were you thinking then?",
      },
      {
        level: "medium",
        task: "Create a feedback log template and fill it in after a real peer mock.",
        hint: "Include round type, problem, timing, rubric scores, strengths, fixes and next drill.",
        solution: "Date: 2026-11-12   Round: coding   Partner: peer\nProblem: Course Schedule (topological sort)   Solved: yes, 41 min\nScores (1-4): understanding 4, communication 2, code 3, testing 2\nWent well: found the graph model quickly, clear complexity\nWent badly: silent 4 min on cycle detection, did not test empty input\nNext drills: 3 graph problems aloud; always test empty and single input\nNext mock: 2026-11-15, system design",
      },
      {
        level: "hard",
        task: "Plan and run a full mock loop: two coding rounds, one system design and one behavioural, back to back with short breaks, using at least two different interviewers.",
        hint: "Book partners in advance and give each one a rubric and the target company.",
        solution: "1. Book 4 slots of 45-60 min in one afternoon, 10-min breaks between.\n2. Send each interviewer: round type, target company, rubric.\n3. Coding 1 and 2: unseen medium problems, shared editor, no autocomplete.\n4. Design: e.g. design a notification service, 45 min, with estimates.\n5. Behavioural: 4 questions from your story matrix, follow-ups allowed.\n6. Log each round right after; note energy level by round 4.\n7. Pick the two weakest areas and drill them for the next week.",
      },
    ],
    faq: [
      { q: "How many mock interviews should I do?", a: "At least four, and six to eight before an important interview loop. Stop adding mocks when the same mistakes no longer appear and feedback is consistently positive." },
      { q: "Are free peer mocks good enough?", a: "For coding and behavioural practice, yes, especially for building comfort with being watched. For system design or a high-stakes loop, one or two mocks with an experienced interviewer are often worth paying for." },
      { q: "What if I freeze during a mock?", a: "That is the point of practising. Say what you know, try a tiny example by hand, and state a brute force; then write down what triggered the freeze and practise that situation." },
      { q: "Should I do mocks on problems I have already solved?", a: "No. Use unseen problems so you practise the real skill of working through something new; reviewing solved problems is a separate drill." },
    ],
  },
};

export default extra;
