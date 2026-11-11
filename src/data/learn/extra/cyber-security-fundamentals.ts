import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  // ───────────── Security principles & threat modelling ─────────────
  "sec-foundations/cia-triad": {
    plain: [
      "Security people need a quick way to say what went wrong. The CIA triad gives them three words. Confidentiality means secrets stay secret. Integrity means information stays correct. Availability means people can use the system when they need it. Almost every attack hurts at least one of these.",
      "Think about your phone. If a stranger reads your messages, confidentiality is broken. If someone changes your saved bank details, integrity is broken. If the phone will not turn on before an important call, availability is broken. Same phone, three very different problems.",
      "AAA adds the people side. Authentication asks \"who are you?\". Authorization asks \"what are you allowed to do?\". Accounting (also called auditing) writes down what you actually did. Non-repudiation goes one step further: the record is strong enough that a person cannot honestly deny the action later.",
      "Why bother with labels? Because the label decides the response. A confidentiality breach may mean telling customers and regulators. An integrity problem means finding and fixing bad data. An availability problem means getting the service back up fast. Naming the harm first keeps everyone working on the right thing.",
    ],
    deepDive: [
      {
        heading: "One incident can hit more than one goal",
        body: "Real incidents rarely touch only one letter. Modern ransomware is a good example. It first copies data out of the network (confidentiality), then encrypts the files (availability), and sometimes changes backups so they cannot be trusted (integrity).\n\nWhen you classify an incident, list every goal that was harmed, then mark the one that hurts the business most right now. That main harm sets the first priority, but the others still need a plan. A team that only restores files after ransomware may forget that customer data has already leaked and must be reported.",
        bullets: ["List all harmed goals, not just the obvious one", "Pick the main harm to set first priority", "Each harmed goal needs its own follow-up task"],
      },
      {
        heading: "Controls for each goal",
        body: "Each goal has its own family of tools. Confidentiality relies on encryption, access control and data classification (labelling data as public, internal or secret). Integrity relies on hashing, digital signatures, input validation and change control. Availability relies on backups, redundancy (spare copies of systems), capacity planning and protection against floods of traffic.\n\nKnowing these pairs helps you review any design quickly. Ask three questions: who can read this, who can change this, and what happens if it goes down? Gaps in the answers point straight at missing controls.",
        visual: {
          type: "tree",
          title: "Controls for each goal",
          root: "Security controls",
          children: [
            { label: "Confidentiality", children: ["Encryption", "Access control", "Data classification"] },
            { label: "Integrity", children: ["Hashing", "Digital signatures", "Input validation", "Change control"] },
            { label: "Availability", children: ["Backups", "Redundancy", "Capacity planning", "Flood protection"] },
          ],
        },
      },
      {
        heading: "AAA in a real login",
        body: "When you sign in to a work laptop, all three A's happen in a few seconds. Authentication checks your password and maybe a code from your phone. Authorization looks up your groups and decides you may open the finance share but not the HR share. Accounting writes an event to a log with the time, your username and the computer name.\n\nDefenders lean on the third A most. Without accounting, there is no evidence to investigate. That is why logging is treated as a security control, not just a debugging tool.",
        visual: {
          type: "sequence",
          title: "AAA during one work login",
          actors: ["User", "Directory", "File server", "Log system"],
          messages: [
            { from: 0, to: 1, label: "Password + phone code" },
            { from: 1, to: 0, label: "Authenticated, groups attached" },
            { from: 0, to: 2, label: "Open finance share" },
            { from: 2, to: 0, label: "Allowed (finance group)" },
            { from: 0, to: 2, label: "Open HR share" },
            { from: 2, to: 0, label: "Denied" },
            { from: 2, to: 3, label: "Event: time, user, host, result" },
          ],
        },
      },
      {
        heading: "What makes non-repudiation hold up",
        body: "A plain log line saying \"alice approved the payment\" is weak evidence. An administrator could have edited it, or someone could have used Alice's shared password. Non-repudiation needs stronger proof.\n\nThe usual ingredients are a unique identity per person (no shared accounts), strong authentication, a digital signature that only the person's private key could create, and logs that are protected from editing, for example sent to a separate system the admins cannot change. Together these make denial hard to believe.",
        bullets: ["No shared accounts", "Strong, ideally multi-factor, login", "Digital signatures for key actions", "Tamper-resistant, centrally stored logs"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Same company, three kinds of harm",
        columns: [
          { title: "Confidentiality lost", points: ["Customer list posted online", "Wrong person sees payslips", "Fix: access control, encryption", "Often triggers breach notification"] },
          { title: "Integrity lost", points: ["Invoice bank details changed", "Database rows silently edited", "Fix: hashes, signatures, approvals", "Hard to notice without checks"] },
          { title: "Availability lost", points: ["Website down from traffic flood", "Files encrypted by ransomware", "Fix: backups, redundancy, DDoS defence", "Cost grows every hour of outage"] },
        ],
      },
    ],
    examples: [
      {
        title: "Classifying a lost laptop",
        explanation: "Step 1: A sales manager leaves a laptop on a train. Step 2: Ask what data was on it: a customer spreadsheet. Step 3: Ask if the disk was encrypted. If yes, the thief sees nothing useful and confidentiality likely holds. If no, confidentiality is harmed. Step 4: Availability is slightly harmed for the manager, fixed with a spare laptop and cloud copies. Step 5: Integrity is not harmed. Result: the key fact is disk encryption, which decides whether this is a minor IT ticket or a reportable data breach.",
      },
      {
        title: "Proving who approved a payment",
        explanation: "Step 1: A finance clerk claims they never approved a large transfer. Step 2: Check the app log: the approval came from the clerk's personal account, not a shared one. Step 3: Check the login log: the account used a password plus a phone prompt that the clerk accepted. Step 4: Check that logs were shipped to a central server the clerk cannot edit. Step 5: Conclusion: unique identity, MFA and protected logs together provide non-repudiation. If any piece were missing, for example a shared login, the evidence would be much weaker.",
      },
    ],
    cheatSheet: [
      "C = only the right people can read it; I = it is correct; A = it works when needed",
      "Ask of every system: who can read it, who can change it, what if it goes down?",
      "Authentication = who you are; authorization = what you may do; accounting = what you did",
      "Non-repudiation needs unique accounts, strong login, signatures and tamper-proof logs",
      "Ransomware today often hits all three: data stolen, files locked, backups damaged",
      "Classify the main harm first; it decides who you call and what you fix first",
    ],
    quiz: [
      {
        q: "An attacker quietly changes the bank account number on supplier invoices. Which goal is mainly harmed?",
        options: ["Confidentiality", "Availability", "Integrity", "Accounting"],
        answer: 2,
        why: "The data was altered without permission, which is an integrity failure.",
      },
      {
        q: "Which control mainly supports availability?",
        options: ["Tested offline backups", "Data classification labels", "Digital signatures", "Password hashing"],
        answer: 0,
        why: "Backups let you restore service when systems or data are lost.",
      },
      {
        q: "Why do shared admin accounts weaken non-repudiation?",
        options: ["They use weaker encryption", "Nobody can prove which person performed an action", "They cannot be logged", "They break availability"],
        answer: 1,
        why: "If several people know one login, the log cannot tie an action to one person.",
      },
      {
        q: "A user logs in correctly but opens a folder they should not see. Which part of AAA failed?",
        options: ["Authentication", "Accounting", "Availability", "Authorization"],
        answer: 3,
        why: "Their identity was confirmed, but the rules about what they may access were wrong.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For each event, name the main CIA goal harmed: (a) a website is down after a traffic flood, (b) payslips are emailed to the wrong team, (c) a student edits their grade in a school database.",
        hint: "Ask: was something seen, changed, or made unusable?",
        solution: "(a) Availability: the service could not be used.\n(b) Confidentiality: private data was seen by the wrong people.\n(c) Integrity: data was changed without permission.",
      },
      {
        level: "medium",
        task: "Pick one app you use daily (for example a banking app). Write one control for each of C, I and A, and say which of the three A's each login step covers.",
        hint: "Think about what happens when you open the app, view a balance and send money.",
        solution: "C: TLS encryption and a PIN to open the app.\nI: transfers need confirmation and are signed by the server.\nA: the bank runs servers in several data centres.\nAuthentication: PIN or fingerprint. Authorization: you see only your accounts.\nAccounting: every transfer is recorded with time and device.",
      },
      {
        level: "hard",
        task: "Read a public breach summary (for example a CISA advisory or a news story about a ransomware attack). Classify the impact on C, I and A, and list which AAA or non-repudiation controls would have helped the investigation.",
        hint: "Look for words like stolen, leaked, encrypted, altered and offline.",
        solution: "Example for a double-extortion ransomware case:\nC: harmed, data copied out before encryption.\nI: possibly harmed, backups deleted or altered.\nA: harmed most, servers encrypted for days.\nHelpful controls: MFA on remote access (authentication),\nleast privilege for admin accounts (authorization),\ncentral, tamper-resistant logs to rebuild the timeline (accounting).",
      },
    ],
    faq: [
      { q: "Is the CIA triad still used, or is it outdated?", a: "It is still the standard starting point in exams, policies and incident reports. Some models add extras such as authenticity or safety, but they build on C, I and A rather than replacing them." },
      { q: "Is privacy the same as confidentiality?", a: "They overlap but are not the same. Confidentiality is about keeping data from unauthorized eyes; privacy is also about whether data should be collected and used at all, and the person's rights over it." },
      { q: "Which part of the triad matters most?", a: "It depends on the system. A hospital monitor cares most about availability and integrity, while a password vault cares most about confidentiality." },
    ],
  },

  "sec-foundations/risk-basics": {
    plain: [
      "Risk is a way of asking \"how worried should we be?\". It needs three things. An asset is something you care about, like customer data or a website. A vulnerability is a weakness in it, like an old unpatched server. A threat is someone or something that could use that weakness, like a criminal group or a flood.",
      "Think of a bike. The bike is the asset. A weak lock is the vulnerability. A thief walking past is the threat. The risk is how likely the bike is stolen and how much that would hurt you. A cheap old bike in a quiet village is low risk. A new bike in a busy city is high risk.",
      "You cannot fix everything, so you score each risk. Likelihood asks how probable it is. Impact asks how bad it would be. Multiply or combine them to get a rough score, then work on the biggest scores first.",
      "For each risk you then choose a response. Mitigate means add a control, like a better lock. Transfer means pass the cost to someone else, like insurance. Accept means live with it and write that down. Avoid means stop the risky activity entirely.",
    ],
    deepDive: [
      {
        heading: "Start with an asset inventory",
        body: "You cannot protect what you do not know you have. An asset inventory lists systems, data, accounts and even key people or suppliers. For each asset, record an owner (the person responsible for decisions about it), where it lives and how important it is.\n\nOwners matter because risk decisions belong to the business, not just to the security team. The security team can say \"this server is likely to be attacked\". The owner decides whether to spend money fixing it or to accept the risk. Many breaches start on forgotten assets nobody owned, such as an old test server still facing the internet.",
        bullets: ["Every asset gets a named owner", "Note where data lives and how sensitive it is", "Forgotten assets are a top source of breaches"],
      },
      {
        heading: "Scoring likelihood and impact",
        body: "Most teams use a simple 1 to 5 scale for each. Likelihood 1 means rare, 5 means almost certain this year. Impact 1 means a minor annoyance, 5 means serious money loss, legal trouble or harm to people. Multiply them for a score from 1 to 25 and colour it on a heat map: green, amber, red.\n\nTo keep scores honest, define each level in writing. For example, impact 4 might mean \"more than 100,000 customer records\" or \"more than one day offline\". Without definitions, two people score the same risk very differently.",
      },
      {
        heading: "Inherent and residual risk",
        body: "Inherent risk is the risk before any controls. Residual risk is what remains after your controls are in place. If a public web server has a likelihood of 4 and impact of 5 (score 20), adding a web application firewall, patching and monitoring might lower likelihood to 2, giving a residual score of 10.\n\nResidual risk is what management actually accepts. A risk is never zero. The goal is to bring it below the organisation's risk appetite, which is the level of risk leaders have agreed they can live with.",
        visual: {
          type: "flow",
          title: "From inherent to residual risk",
          steps: [
            { label: "Inherent risk", detail: "Likelihood 4 x impact 5 = 20" },
            { label: "Add controls", detail: "WAF, patching, monitoring" },
            { label: "Likelihood drops", detail: "From 4 to 2; impact stays 5" },
            { label: "Residual risk", detail: "2 x 5 = 10" },
            { label: "Check appetite", detail: "Below the agreed level? Owner accepts it" },
          ],
        },
      },
      {
        heading: "Choosing the right treatment",
        body: "Mitigation is the most common choice, but it is not always the best. If fixing a risk costs more than the harm it prevents, accepting it may be sensible, as long as the owner signs off and it is reviewed later. Transfer through insurance or a contract helps with money, but not with reputation: customers still blame you. Avoid is powerful but blunt, for example switching off an old feature that nobody uses but that keeps a risky service running.",
        bullets: ["Mitigate: add or improve controls", "Transfer: insurance, contracts, outsourcing", "Accept: documented, owned, reviewed", "Avoid: stop the risky activity"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Four ways to treat one risk: an old file server",
        columns: [
          { title: "Mitigate or avoid", points: ["Mitigate: patch it and restrict who can reach it", "Avoid: move files to a managed service and switch it off", "Both reduce the chance of harm itself"] },
          { title: "Transfer", points: ["Buy cyber insurance for breach costs", "Pay a provider under contract to run it", "Reputation damage still stays with you"] },
          { title: "Accept", points: ["Owner signs a written acceptance", "Set a review date, e.g. in 6 months", "Only sensible when the score is low"] },
        ],
      },
    ],
    examples: [
      {
        title: "Scoring two risks for a small online shop",
        explanation: "Risk A: the shop's WordPress plugins are months out of date. Plugins are attacked constantly, so likelihood is 4. A hacked shop could leak card details, so impact is 5. Score 20, red. Risk B: the office printer has a default password. It is not reachable from the internet, so likelihood is 2, and it holds little data, so impact is 2. Score 4, green. Decision: patch the plugins this week and turn on automatic updates (mitigate). Note the printer password on the risk list and change it when convenient.",
        code: {
          lang: "python",
          code: "risks = [\n    (\"Outdated shop plugins\", 4, 5),\n    (\"Printer default password\", 2, 2),\n    (\"No offline backups\", 3, 5),\n]\nfor name, likelihood, impact in sorted(risks, key=lambda r: -r[1] * r[2]):\n    score = likelihood * impact\n    level = \"RED\" if score >= 15 else \"AMBER\" if score >= 8 else \"GREEN\"\n    print(f\"{score:>2} {level:<5} {name}\")",
        },
      },
      {
        title: "Residual risk after controls",
        explanation: "Step 1: A school's student portal faces the internet with only passwords. Inherent: likelihood 4 (password guessing is common), impact 4 (student records). Score 16. Step 2: Add MFA, lock accounts after repeated failures, and alert on many failed logins. Step 3: Re-score: likelihood drops to 2, impact stays 4 because the data is just as sensitive. Residual score 8. Step 4: The head teacher, as owner, accepts the residual risk in writing with a yearly review.",
      },
    ],
    cheatSheet: [
      "Risk = threat + vulnerability + asset; remove any one and the risk shrinks",
      "Score = likelihood (1-5) x impact (1-5); 15+ is usually red",
      "Write down what each score level means so scores are consistent",
      "Inherent risk is before controls; residual risk is after",
      "Every risk needs an owner who makes the treatment decision",
      "Accepted risks must be documented and reviewed, not forgotten",
    ],
    quiz: [
      {
        q: "A company stops offering an old file upload feature because it is too risky. Which treatment is this?",
        options: ["Accept", "Avoid", "Transfer", "Mitigate"],
        answer: 1,
        why: "Removing the activity that creates the risk is avoidance.",
      },
      {
        q: "What is residual risk?",
        options: ["Risk that remains after controls are applied", "Risk before any controls exist", "Risk that has been transferred", "Risk from former employees"],
        answer: 0,
        why: "Residual means what is left over once controls reduce the original risk.",
      },
      {
        q: "Why should every asset have an owner?",
        options: ["So it can be patched faster", "Because auditors require names on servers", "So someone accountable can make risk decisions about it", "So the security team does not need to"],
        answer: 2,
        why: "Risk treatment is a business decision that needs an accountable person.",
      },
      {
        q: "Two risks score 12: one is likelihood 4, impact 3; the other likelihood 2, impact 6 on a wider scale. What should you also consider?",
        options: ["Nothing, equal scores mean equal priority", "Only the likelihood", "Only the cost to fix", "Whether the high-impact one could be catastrophic even if rare"],
        answer: 3,
        why: "Scores hide detail, and rare but devastating events often deserve extra attention.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List five assets in your own home network (devices or data). For each, name one vulnerability and one threat.",
        hint: "Think about your router, phone, laptop, cloud photos and email account.",
        solution: "Router: default admin password; threat: neighbour or malware.\nLaptop: missing updates; threat: drive-by download.\nEmail: reused password; threat: credential stuffing.\nCloud photos: no MFA; threat: account takeover.\nPhone: no screen lock; threat: theft.",
      },
      {
        level: "medium",
        task: "Turn your five home risks into a small risk register: likelihood 1-5, impact 1-5, score, treatment and new residual score.",
        hint: "Use a spreadsheet with columns: asset, risk, L, I, score, treatment, residual.",
        solution: "Email | reused password | L4 I5 = 20 | mitigate: unique password + MFA | L1 I5 = 5\nRouter | default password | L3 I4 = 12 | mitigate: change password, update | L1 I4 = 4\nLaptop | no updates | L3 I4 = 12 | mitigate: auto updates | L2 I4 = 8\nPhone | no lock | L2 I4 = 8 | mitigate: PIN + remote wipe | L1 I4 = 4\nPhotos | no backup | L2 I3 = 6 | accept, review yearly | 6",
      },
      {
        level: "hard",
        task: "Write impact definitions for levels 1-5 for a small company, covering money, data and downtime, so two people would score the same risk the same way.",
        hint: "Use numbers: currency amounts, record counts and hours offline.",
        solution: "1: < $1k loss, no personal data, < 1 hour down.\n2: < $10k, < 100 records, < 4 hours.\n3: < $100k, < 10k records, < 1 day.\n4: < $1M, < 100k records or regulator notice, < 1 week.\n5: > $1M, > 100k records, legal action or harm to people, > 1 week.",
      },
    ],
    faq: [
      { q: "What is the difference between a threat and a vulnerability?", a: "A vulnerability is a weakness you have, like an unpatched server. A threat is who or what could take advantage of it, like a ransomware gang." },
      { q: "Can risk ever be zero?", a: "No. Controls lower likelihood or impact, but some residual risk always remains. The aim is to keep it within what the organisation has agreed to accept." },
      { q: "Is a risk register just a spreadsheet?", a: "For small teams, yes, and that is fine. Larger companies use GRC tools, but the content is the same: risk, owner, score, treatment and review date." },
    ],
  },

  "sec-foundations/threat-modelling": {
    plain: [
      "Threat modelling means thinking about what could go wrong with a system before attackers find out for you. You do it with a simple drawing and a structured list of questions. It works best during design, when changes are cheap.",
      "It is like planning a house with a security expert. Before building, you look at the plan and ask: where are the doors, who has keys, where are the valuables? Moving a window on paper is easy. Moving it after the walls are up is expensive.",
      "The drawing is a data flow diagram. It shows people and outside systems, the processes that handle data, where data is stored, and arrows for how data moves. You then draw trust boundaries: lines where data passes from a less trusted area to a more trusted one, like from the internet to your server.",
      "Next you walk through STRIDE for each part of the drawing and ask \"could this happen here?\". Every yes becomes a threat with a fix next to it. The output is a short, concrete to-do list, not a vague feeling.",
    ],
    deepDive: [
      {
        heading: "The four questions",
        body: "A popular way to frame threat modelling uses four questions. What are we working on? What can go wrong? What are we going to do about it? Did we do a good job?\n\nThe first question is answered by the data flow diagram. The second by STRIDE or a similar list. The third by mitigations, each with an owner and a ticket. The fourth is a review: did the fixes ship, and is the diagram still accurate after the latest changes? Treat the model as a living document that changes when the system changes, not a one-time report.",
        bullets: ["What are we working on? (diagram)", "What can go wrong? (STRIDE)", "What will we do about it? (mitigations)", "Did we do a good job? (review)"],
        visual: {
          type: "cycle",
          title: "The four questions as a loop",
          steps: [
            { label: "What are we working on?", detail: "Data flow diagram" },
            { label: "What can go wrong?", detail: "STRIDE or a similar list" },
            { label: "What will we do about it?", detail: "Mitigations with owners and tickets" },
            { label: "Did we do a good job?", detail: "Fixes shipped, diagram still accurate" },
          ],
        },
      },
      {
        heading: "Drawing a useful data flow diagram",
        body: "Keep the diagram small enough to fit on one page. Use four shapes: external entities (users, partner systems) as boxes, processes (your code) as circles, data stores (databases, files, queues) as parallel lines, and data flows as labelled arrows.\n\nThen draw dashed lines for trust boundaries. Common ones are between the internet and your web app, between your app and the database, and between your system and any third-party API. Most serious threats sit on arrows that cross these boundaries, because that is where data changes hands and checks are needed.",
      },
      {
        heading: "STRIDE per element",
        body: "Not every STRIDE category applies to every shape. External entities mostly face spoofing and repudiation. Data flows face tampering, information disclosure and denial of service. Data stores face tampering, disclosure, denial of service and sometimes repudiation if they hold logs. Processes can face all six.\n\nUsing this table keeps sessions focused. Instead of asking all six questions about everything, you ask only the ones that make sense, which keeps a one-hour workshop productive.",
      },
      {
        heading: "Ranking and closing threats",
        body: "A workshop can produce dozens of threats. Rank them using the risk scoring you already know: likelihood times impact. Fix the high ones before launch, schedule the medium ones, and record any you accept.\n\nGood mitigations are specific. \"Improve security\" is not a mitigation. \"Require MFA for admin logins\" or \"use parameterised queries in the search endpoint\" are. Each one should become a ticket in the team's normal backlog so it is tracked like any other work.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A threat modelling session in one hour",
        steps: [
          { label: "Scope", detail: "Pick one feature or service." },
          { label: "Diagram", detail: "Entities, processes, stores, flows." },
          { label: "Boundaries", detail: "Mark where trust changes." },
          { label: "STRIDE", detail: "Ask the relevant letters per element." },
          { label: "Rank", detail: "Score likelihood and impact." },
          { label: "Tickets", detail: "One owned fix per real threat." },
        ],
      },
      {
        type: "tree",
        title: "Which STRIDE letters apply where",
        root: "Diagram element",
        children: [
          { label: "External entity", children: ["Spoofing", "Repudiation"] },
          { label: "Process", children: ["All six categories"] },
          { label: "Data flow", children: ["Tampering", "Information disclosure", "Denial of service"] },
          { label: "Data store", children: ["Tampering", "Information disclosure", "Denial of service", "Repudiation (if logs)"] },
        ],
      },
    ],
    examples: [
      {
        title: "Threat modelling a password reset feature",
        explanation: "Step 1: Diagram: User -> Web app (process) -> Users DB (store), and Web app -> Email service (external). Boundaries: internet to web app, web app to email provider. Step 2: Spoofing: an attacker requests a reset for someone else's email. Fix: send the link only to the registered address. Step 3: Tampering: the reset token is guessable. Fix: long random token, single use, expires in 15 minutes. Step 4: Information disclosure: the form says \"no such user\", which reveals who has accounts. Fix: always show the same message. Step 5: Denial of service: thousands of reset emails. Fix: rate limit per IP and account. Step 6: Repudiation: log every reset request and use.",
      },
      {
        title: "Writing threats as a simple table",
        explanation: "Recording threats in a consistent format makes them easy to track. Each row names the element, the STRIDE letter, the threat in plain words, the fix and a priority. This example shows three rows for a mobile app talking to an API.",
        code: {
          lang: "text",
          code: "Element          | STRIDE | Threat                              | Mitigation                       | Prio\nApp -> API flow  | T, I   | Traffic read or changed on wifi     | TLS everywhere, HSTS             | High\nAPI process      | E      | Normal user calls admin endpoint    | Server-side role check per route | High\nOrders DB store  | I      | Backups readable by all engineers   | Encrypt backups, restrict access | Med\nUser entity      | S      | Stolen password used to log in      | MFA, alert on new device login   | High\nAPI process      | R      | User denies placing an order        | Signed, central audit log        | Low",
        },
      },
    ],
    cheatSheet: [
      "Four questions: what are we building, what can go wrong, what will we do, did we do well?",
      "DFD shapes: box = external entity, circle = process, two lines = data store, arrow = flow",
      "Threats cluster on arrows that cross trust boundaries",
      "External entities: S and R. Data flows: T, I, D. Processes: all six",
      "A mitigation must be specific enough to become a ticket",
      "Update the model when the design changes",
    ],
    quiz: [
      {
        q: "When is threat modelling cheapest and most useful?",
        options: ["After a breach", "During design, before most code is written", "Only during a penetration test", "Once a year for the whole company"],
        answer: 1,
        why: "Design changes on paper cost far less than rework after release.",
      },
      {
        q: "On a data flow diagram, what does a data store represent?",
        options: ["A user of the system", "A firewall", "A network cable", "A place where data rests, like a database or file"],
        answer: 3,
        why: "Data stores are where information is kept, such as databases, files or queues.",
      },
      {
        q: "A reset form says \"no account with that email\". Which STRIDE category does this fit?",
        options: ["Information disclosure", "Spoofing", "Elevation of privilege", "Denial of service"],
        answer: 0,
        why: "It reveals which emails have accounts, leaking information to an attacker.",
      },
      {
        q: "Which of these is a good mitigation statement?",
        options: ["Make the API more secure", "Be careful with user input", "Require a server-side role check on every admin route", "Hire a hacker"],
        answer: 2,
        why: "It is specific, testable and can be turned into a ticket.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Draw a data flow diagram (paper is fine) for a simple to-do list web app: a user, a web server, a database. Mark the trust boundaries.",
        hint: "There are at least two boundaries: one at the internet edge, one before the database.",
        solution: "User (box) --HTTPS--> Web app (circle) --SQL--> Tasks DB (two lines)\nBoundary 1: between User and Web app (internet to server).\nBoundary 2: between Web app and Tasks DB (app tier to data tier).",
      },
      {
        level: "medium",
        task: "Using your to-do app diagram, list one threat for each STRIDE letter and a specific mitigation for each.",
        hint: "Use the per-element table: S on the user, T and I on flows, E on the process.",
        solution: "S: stolen password -> MFA option, login alerts.\nT: task data changed in transit -> HTTPS with HSTS.\nR: user denies deleting tasks -> audit log of deletes.\nI: user reads another user's tasks via ID in URL -> check owner on server.\nD: login endpoint flooded -> rate limiting.\nE: user reaches /admin -> role check on every admin route.",
      },
      {
        level: "hard",
        task: "Add a third-party payment provider and a background email worker to your diagram. Identify the new trust boundaries and the two highest-risk new threats with mitigations and scores.",
        hint: "Webhooks from the payment provider are data flowing in from outside.",
        solution: "New boundaries: app <-> payment provider; app -> queue -> email worker.\nThreat 1 (S/T, L4 I5 = 20): fake payment webhook marks orders paid.\n  Fix: verify webhook signature with provider secret, check amount via API.\nThreat 2 (I, L3 I4 = 12): email worker logs full user data.\n  Fix: send only needed fields, scrub logs, restrict worker credentials.",
      },
    ],
    faq: [
      { q: "Do I need special software for threat modelling?", a: "No. A whiteboard or paper works. Free tools like OWASP Threat Dragon and Microsoft Threat Modeling Tool help draw diagrams and keep lists, but the thinking matters more than the tool." },
      { q: "Are there alternatives to STRIDE?", a: "Yes. PASTA is a more detailed risk-based process, LINDDUN focuses on privacy, and attack trees break one goal into steps. STRIDE is the easiest place to start." },
      { q: "Who should attend a threat modelling session?", a: "The developers and architect who know the design, someone from security, and ideally a product owner who can decide on trade-offs. Three to six people works well." },
    ],
  },

  "sec-foundations/defence-in-depth": {
    plain: [
      "Defence in depth means never relying on a single protection. You stack several, so if one fails, another still stands. Attackers then have to beat many different things, and defenders get more chances to notice them.",
      "A medieval castle is the classic picture: a moat, high walls, a gate, guards, and a locked treasure room. Crossing the moat does not get you the gold. In computers, the layers might be a firewall, updated software, antivirus, strong logins, encrypted data and someone watching the logs.",
      "Controls can be grouped in two ways. By type: technical (software and hardware), administrative (policies and training) and physical (locks and badges). By function: preventive controls stop bad things, detective controls notice them, and corrective controls clean up and restore.",
      "Two ideas push this further. Least privilege gives every person and program only the access it truly needs. Zero trust means no request is trusted just because it comes from inside the office network. Each request must prove who it is and that it is allowed.",
    ],
    deepDive: [
      {
        heading: "Layers must be independent",
        body: "Stacking layers only helps if they fail for different reasons. Two firewalls from the same vendor with the same rule set are really one layer, because one mistake or one bug affects both.\n\nGood layering mixes kinds of controls. A phishing email might pass the email filter (technical), but the user has had training and reports it (administrative). If they click anyway, the endpoint protection blocks the download (technical, different system). If that fails, the account has least privilege so the damage is limited, and the SIEM raises an alert (detective). Each layer catches different mistakes.",
        bullets: ["Mix technical, administrative and physical controls", "Avoid layers that share the same weakness", "Always include at least one detective layer"],
      },
      {
        heading: "More control functions than three",
        body: "Beyond preventive, detective and corrective, many frameworks add three more. Deterrent controls discourage attempts, like warning banners or visible cameras. Compensating controls stand in when the ideal control is not possible, for example extra monitoring on an old machine that cannot be patched. Directive controls tell people what to do, like an acceptable use policy.\n\nA single tool can serve several functions. EDR software prevents some malware from running, detects suspicious behaviour, and can isolate a host to correct the situation.",
        visual: {
          type: "tree",
          title: "Six control functions",
          root: "Control functions",
          children: [
            { label: "Preventive", children: ["Stops it happening"] },
            { label: "Detective", children: ["Spots it happening"] },
            { label: "Corrective", children: ["Fixes the damage"] },
            { label: "Deterrent", children: ["Warning banners", "Visible cameras"] },
            { label: "Compensating", children: ["Extra monitoring on an unpatchable host"] },
            { label: "Directive", children: ["Acceptable use policy"] },
          ],
        },
      },
      {
        heading: "Least privilege in practice",
        body: "Least privilege applies to people, services and machines. A help desk worker can reset passwords but cannot change firewall rules. A web app's database account can read and write its own tables but cannot drop them or read other databases. A backup server can read files but cannot log in interactively.\n\nIt limits the blast radius, which is how much damage one compromised account can do. Most serious breaches involve an attacker gaining an account with too many rights, then using those rights to spread.",
      },
      {
        heading: "Zero trust without the buzzwords",
        body: "Old networks worked like a hard shell with a soft centre: once inside, you could reach almost anything. Zero trust removes the soft centre. Every request is checked using who the user is, the health of their device, and what they want to reach.\n\nPractical first steps are MFA everywhere, a single sign-on system that checks device status, segmenting the network so laptops cannot talk directly to servers they do not need, and logging every access decision. Zero trust is a direction you move towards, not a product you buy.",
        visual: {
          type: "compare",
          title: "Hard shell vs zero trust",
          columns: [
            { title: "Hard shell, soft centre", points: ["Inside the network means trusted", "Laptops can reach most servers", "Login checked once at the edge", "Few access decisions logged"] },
            { title: "Zero trust", points: ["Every request is checked", "Identity + device health + target", "Segments block unneeded paths", "Every access decision logged"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "One phishing attack meets several layers",
        steps: [
          { label: "Email filter", detail: "Blocks most bad mail (preventive)." },
          { label: "Trained user", detail: "Spots and reports it (administrative)." },
          { label: "EDR on laptop", detail: "Blocks or flags the payload (preventive and detective)." },
          { label: "Least privilege", detail: "Stolen account can reach little." },
          { label: "SIEM alert", detail: "Analyst sees odd login (detective)." },
          { label: "Restore and reset", detail: "Backups and password reset (corrective)." },
        ],
      },
    ],
    examples: [
      {
        title: "Layering controls around a customer database",
        explanation: "Step 1 Network: the database sits in its own segment and accepts connections only from the app servers. Step 2 Host: the server is patched monthly and has only needed services running. Step 3 Identity: admins use separate admin accounts with MFA; the app uses a limited account. Step 4 Data: disks and backups are encrypted, and card numbers are tokenised. Step 5 Detection: database logins and unusual large queries are sent to the SIEM. Step 6 Recovery: daily backups, with a restore test each quarter. If any one layer fails, the others still protect or reveal the problem.",
      },
      {
        title: "Classifying controls in a small office",
        explanation: "Take a list of controls and sort each by type and function. This habit shows gaps quickly. In this office, most controls are preventive. There is little detection, so an attack that slips through might go unnoticed for weeks. The fix is to add log monitoring and alerts.",
        code: {
          lang: "text",
          code: "Control                    | Type           | Function\nFirewall default deny      | Technical      | Preventive\nSecurity awareness course  | Administrative | Preventive\nBadge door to server room  | Physical       | Preventive\nCCTV in reception          | Physical       | Deterrent, detective\nAntivirus on laptops       | Technical      | Preventive, detective\nNightly backups            | Technical      | Corrective\nGap: no log review         | -              | Detective missing",
        },
      },
    ],
    cheatSheet: [
      "Layers only help if they fail for different reasons",
      "Types: technical, administrative, physical",
      "Functions: preventive, detective, corrective, plus deterrent, compensating, directive",
      "Least privilege shrinks the blast radius of a stolen account",
      "Zero trust: verify user, device and request every time; location alone proves nothing",
      "If every control you list is preventive, you have a detection gap",
    ],
    quiz: [
      {
        q: "An old machine cannot be patched, so the team adds extra monitoring and isolates it. What kind of control is this?",
        options: ["Directive", "Deterrent", "Compensating", "Physical"],
        answer: 2,
        why: "It makes up for a control that cannot be applied, which is a compensating control.",
      },
      {
        q: "Why are two identical firewalls in a row weak defence in depth?",
        options: ["They slow traffic", "They share the same weaknesses, so one mistake defeats both", "Firewalls are not technical controls", "They break zero trust"],
        answer: 1,
        why: "Layers need to fail independently to add real protection.",
      },
      {
        q: "What does least privilege mainly limit?",
        options: ["The blast radius of a compromised account", "Network speed", "The number of users", "Password length"],
        answer: 0,
        why: "Fewer rights means an attacker with that account can do less damage.",
      },
      {
        q: "Which statement best describes zero trust?",
        options: ["Nobody gets any access", "Only the firewall decides access", "Users inside the office are trusted", "Each request is verified based on identity, device and context"],
        answer: 3,
        why: "Zero trust removes automatic trust based on network location.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the security controls on your own laptop or phone and label each as preventive, detective or corrective.",
        hint: "Think about screen lock, updates, antivirus, backups and login alerts.",
        solution: "Screen lock PIN: preventive.\nAutomatic updates: preventive.\nBuilt-in antivirus: preventive and detective.\nNew-login email alert: detective.\nCloud backup: corrective.\nFind-my-device remote wipe: corrective.",
      },
      {
        level: "medium",
        task: "A small company has a firewall, antivirus and a password policy. Propose four more controls so that every function (preventive, detective, corrective) and every type (technical, administrative, physical) is covered.",
        hint: "Look for the missing detective and physical controls first.",
        solution: "1. Central log collection with alerts on failed logins (technical, detective).\n2. Offline backups tested quarterly (technical, corrective).\n3. Locked server cupboard with key log (physical, preventive).\n4. Incident response plan and reporting process (administrative, corrective).",
      },
      {
        level: "hard",
        task: "Design least-privilege access for a web shop with three staff roles (support, warehouse, developer) and one app service account. Say what each can and cannot do, and how admin access is handled.",
        hint: "Separate daily accounts from admin accounts, and give the app account only the tables it needs.",
        solution: "Support: view orders, issue refunds up to a limit; no product or code access.\nWarehouse: view and update shipping status only.\nDeveloper: deploy via CI pipeline; no direct production DB access day to day.\nApp account: read/write orders and products tables; no schema changes.\nAdmin: separate admin accounts with MFA, used only for admin tasks,\nall actions logged to the SIEM, access reviewed every quarter.",
      },
    ],
    faq: [
      { q: "Is antivirus still worth having if I have a firewall?", a: "Yes. They protect against different things. A firewall controls network connections, while antivirus or EDR checks what runs on the device, which matters when malware arrives by email or USB." },
      { q: "Is zero trust a product I can buy?", a: "No. Vendors sell parts of it, but zero trust is a design approach: verify identity and device for every request and limit access. You reach it step by step." },
      { q: "How many layers are enough?", a: "There is no magic number. A useful test is to imagine each control failing in turn and ask whether something else would still stop or detect the attack." },
    ],
  },

  "sec-foundations/soc-roles": {
    plain: [
      "A SOC, or Security Operations Centre, is the team that watches an organisation's systems for attacks, day and night. Some companies build their own. Many smaller ones pay a provider to do it, called a managed SOC or MDR (managed detection and response).",
      "It works a bit like a hospital emergency room. Tier 1 analysts are the triage nurses. They look at every incoming alert and decide how serious it is. Tier 2 analysts are the doctors who investigate the real cases. Tier 3 experts are the specialists who handle the hardest problems and look for hidden threats.",
      "Around the SOC are other security roles. Detection engineers write and tune the alert rules. Incident responders lead big incidents. Threat intelligence analysts study attacker groups. Red teams attack the company with permission, and purple team exercises have attackers and defenders work side by side.",
      "Tier 1 analyst is the most common first job in security. It needs curiosity, careful note taking, and solid basics in networking, Windows, Linux and logs, which is exactly what this path teaches.",
    ],
    deepDive: [
      {
        heading: "A day in the life of a tier 1 analyst",
        body: "A shift starts with a handover: what happened on the last shift, which incidents are open, and any new threat advisories. Then the analyst works through the alert queue in the SIEM or SOAR tool, usually highest severity first.\n\nFor each alert they gather context: who is the user, what is the host, has this happened before, is the IP known bad? They decide: false positive (close with a note), benign but expected (close and suggest tuning), or suspicious (escalate to tier 2 with findings). Clear written notes are as important as technical skill, because the next person must understand the decision.",
        bullets: ["Shift handover and open cases", "Work the alert queue by severity", "Gather context, decide, document", "Escalate with evidence, not just a link"],
      },
      {
        heading: "How SOCs measure their work",
        body: "SOCs track a few key numbers. Mean time to detect (MTTD) is how long attacks go unnoticed. Mean time to respond (MTTR) is how long it takes to contain them once found. False positive rate shows how much time is wasted on noisy rules.\n\nThese metrics can be misused. Rewarding analysts only for closing many alerts quickly pushes them to close real attacks by mistake. Good SOCs balance speed with quality reviews of closed cases.",
        visual: {
          type: "flow",
          title: "What MTTD and MTTR measure",
          steps: [
            { label: "Attack begins", detail: "The MTTD clock starts" },
            { label: "Attack detected", detail: "MTTD ends, MTTR clock starts" },
            { label: "Attack contained", detail: "MTTR ends" },
          ],
        },
      },
      {
        heading: "Tools you will meet",
        body: "Most SOCs use a similar toolkit. A SIEM (security information and event management) gathers logs and runs detection rules. EDR (endpoint detection and response) watches laptops and servers and can isolate them. A SOAR (security orchestration, automation and response) platform runs automated playbooks, such as enriching an IP or disabling an account. A ticketing or case system tracks investigations.\n\nThe brand names change between jobs, but the ideas stay the same. Learning one SIEM well, like Splunk, Elastic or Wazuh, makes the others easy to pick up.",
        visual: {
          type: "tree",
          title: "The usual SOC toolkit",
          root: "SOC tools",
          children: [
            { label: "SIEM", children: ["Gathers logs", "Runs detection rules"] },
            { label: "EDR", children: ["Watches endpoints", "Can isolate a host"] },
            { label: "SOAR", children: ["Automated playbooks", "Enrich an IP", "Disable an account"] },
            { label: "Case system", children: ["Tracks investigations"] },
          ],
        },
      },
      {
        heading: "Getting the first job",
        body: "Employers hiring tier 1 analysts look for proof you can do the work. Certifications such as CompTIA Security+, or vendor SOC learning paths, show you know the basics. A home lab and written investigations show you can apply them.\n\nPractical routes include help desk or IT support roles, which teach real systems and users, then moving into the SOC. Blue team platforms such as TryHackMe SOC paths, Blue Team Labs Online and LetsDefend give realistic practice with alerts and logs.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "An alert's journey through the SOC",
        actors: ["SIEM", "Tier 1", "Tier 2", "Incident lead"],
        messages: [
          { from: 0, to: 1, label: "Alert: odd login from new country" },
          { from: 1, to: 0, label: "Search user, host, history" },
          { from: 1, to: 2, label: "Escalate with notes and evidence" },
          { from: 2, to: 0, label: "Search wider: other hosts, mailbox rules" },
          { from: 2, to: 3, label: "Confirmed compromise, declare incident" },
          { from: 3, to: 2, label: "Contain: reset, revoke sessions" },
        ],
      },
    ],
    examples: [
      {
        title: "Handling one alert as tier 1",
        explanation: "Alert: \"Multiple failed logins followed by success\" for user j.smith. Step 1: Check the source IP: it belongs to the company VPN. Step 2: Check history: j.smith returned from leave this morning and had a password reset ticket. Step 3: Check after the success: normal email and file access, no new mailbox rules. Step 4: Decision: benign, user forgot a password. Step 5: Close with notes and suggest tuning the rule to ignore failures followed by a help desk reset. Had the IP been from an unknown foreign host with new mailbox rules, the analyst would escalate.",
      },
      {
        title: "Writing a good escalation note",
        explanation: "Tier 2 should be able to act on an escalation without redoing tier 1's work. A short, structured note does this. It states what fired, what was checked, what was found and what the analyst thinks should happen next.",
        code: {
          lang: "text",
          code: "Alert: Suspicious PowerShell (rule PS-ENC-01), host FIN-LT-042, 09:14 UTC\nUser: a.patel (finance), not an admin\nFindings:\n - powershell.exe -enc ... launched by WINWORD.EXE\n - Same host contacted 203.0.113.50 on port 443 at 09:15\n - No similar alerts on other hosts in the last 7 days\nAssessment: likely malicious document macro\nRecommend: isolate host via EDR, check a.patel mailbox for the source email\nEvidence: SIEM search link, process tree screenshot",
        },
      },
    ],
    cheatSheet: [
      "Tier 1: triage and document. Tier 2: investigate and contain. Tier 3: hunt and hard cases",
      "MTTD = time to detect; MTTR = time to respond and contain",
      "Core SOC tools: SIEM, EDR, SOAR, case management",
      "An escalation note says what fired, what you checked, what you found, what to do next",
      "Free practice: TryHackMe SOC paths, Blue Team Labs Online, LetsDefend",
      "Help desk experience is a common and valid route into a SOC",
    ],
    quiz: [
      {
        q: "What does MTTD measure?",
        options: ["How long it takes to notice an attack", "How many tools the SOC uses", "Time to restore backups", "Number of analysts per shift"],
        answer: 0,
        why: "Mean time to detect is the gap between an attack starting and the SOC noticing it.",
      },
      {
        q: "Which tool runs automated response steps such as disabling an account?",
        options: ["A packet capture", "A vulnerability scanner", "A SOAR platform", "A password manager"],
        answer: 2,
        why: "SOAR tools orchestrate and automate playbook actions.",
      },
      {
        q: "A tier 1 analyst finds an alert was caused by a known, approved backup job. What is the best action?",
        options: ["Escalate to tier 3", "Delete the rule", "Ignore it without notes", "Close as benign with notes and suggest tuning"],
        answer: 3,
        why: "Documenting the reason and tuning cuts noise without losing the detection.",
      },
      {
        q: "Who usually writes and improves detection rules?",
        options: ["Red team", "Detection engineers", "Help desk", "Auditors"],
        answer: 1,
        why: "Detection engineering is the role focused on building and tuning alerts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write down the three tiers of a SOC and one task each would do when an alert says \"malware detected on a laptop\".",
        hint: "Think: who checks first, who digs in, who looks for the same thing elsewhere?",
        solution: "Tier 1: confirm the alert, check host and user, see if EDR already blocked it.\nTier 2: investigate how it arrived, isolate the host, collect evidence.\nTier 3: hunt for the same file hash or behaviour across all hosts.",
      },
      {
        level: "medium",
        task: "Complete a free introductory SOC room on TryHackMe (or a similar blue-team platform) and write a short note on what the SOC analyst workflow looked like.",
        hint: "Note the tools, the decision points, and how cases are documented.",
        solution: "Example note:\nTools: SIEM dashboard, ticket system, IP reputation lookup.\nFlow: alert arrives -> check fields -> enrich IP and user -> decide.\nTrue positives were escalated with a short summary and evidence.\nFalse positives were closed with the reason recorded.\nLesson: most time goes into gathering context, not clicking buttons.",
      },
      {
        level: "hard",
        task: "Design a simple metrics page for a small SOC. Pick four metrics, explain how each is calculated, and name one way each could be gamed.",
        hint: "Combine speed, quality and noise metrics.",
        solution: "MTTD: avg(alert time - first malicious event); gamed by not counting late finds.\nMTTR: avg(contained time - alert time); gamed by closing cases early.\nFalse positive rate per rule: FPs / total alerts; gamed by disabling rules.\nEscalation quality: % of escalations tier 2 rates useful; gamed by\nescalating only easy cases. Balance with random reviews of closed alerts.",
      },
    ],
    faq: [
      { q: "Do I need a degree to work in a SOC?", a: "Not always. Many teams hire based on certifications, labs and IT experience. A degree helps in some companies but practical skills and clear write-ups often matter more." },
      { q: "Is SOC work all night shifts?", a: "Many SOCs run 24/7, so shifts are common for junior roles. Some use follow-the-sun teams in different time zones, and day-only roles exist at smaller companies." },
      { q: "Do SOC analysts need to code?", a: "You do not need to be a developer, but basic scripting in Python or PowerShell and writing search queries make you much faster and help you grow into tier 2 and detection engineering." },
    ],
  },

  // ───────────── Networking for security ─────────────
  "sec-networking/osi-tcpip": {
    plain: [
      "When two computers talk, many jobs happen at once: turning data into signals, finding the right machine, making sure nothing is lost, and understanding the message. Network models split these jobs into layers, so each layer can do one job and trust the layers below for the rest.",
      "Sending a parcel is a good picture. You write a letter (the application data), put it in an envelope with a name (transport), the post office adds a street address (network), a van carries it between depots (data link), and roads carry the van (physical). Each step adds its own label and does not care what is inside.",
      "The OSI model has seven layers and is mainly used for teaching and talking. The TCP/IP model has four layers and matches how the internet really works. Security people use both to say exactly where a problem lives, for example \"this is a layer 2 attack on the local network\".",
      "TCP and UDP are the two main transport protocols. TCP is like a phone call: it sets up a connection, numbers every piece and resends lost ones. UDP is like shouting across a room: fast, no setup, and no guarantee anyone heard.",
    ],
    deepDive: [
      {
        heading: "Encapsulation: wrapping at every layer",
        body: "As data goes down the layers, each one adds a header with its own information. Your browser's HTTP request becomes the payload of a TCP segment, which adds source and destination ports. That becomes the payload of an IP packet, which adds source and destination IP addresses. That becomes the payload of an Ethernet frame, which adds MAC addresses (hardware addresses of network cards).\n\nAt the other end, each layer removes its header and passes the rest up. Tools like Wireshark show these layers as nested sections, which is why understanding encapsulation makes packet captures readable.",
        bullets: ["Data at application layer", "Segment at transport (TCP) or datagram (UDP)", "Packet at network layer", "Frame at data link layer", "Bits on the wire"],
      },
      {
        heading: "Mapping OSI to TCP/IP",
        body: "The TCP/IP model merges some OSI layers. OSI layers 5, 6 and 7 (session, presentation, application) become one application layer. OSI layer 4 is the transport layer in both. OSI layer 3 is called the internet layer. OSI layers 1 and 2 become the link (or network access) layer.\n\nIn practice, people still say \"layer 7\" for application traffic and \"layer 3\" for IP, even when using TCP/IP. A \"layer 7 firewall\" understands web requests, while a \"layer 3/4 firewall\" only sees addresses and ports.",
      },
      {
        heading: "TCP flags tell the story",
        body: "Every TCP segment carries flags. SYN asks to start a connection. ACK acknowledges data. FIN politely closes a connection. RST abruptly resets it. PSH and URG are less common.\n\nDefenders read flags to understand behaviour. Many SYNs to different ports with no completed handshakes suggest a port scan. Lots of RST replies mean ports are closed or a firewall is rejecting traffic. A flood of SYNs from many sources to one server without the final ACK is a SYN flood, a denial of service attack that fills the server's table of half-open connections.",
        visual: {
          type: "sequence",
          title: "TCP flags in one connection",
          actors: ["Client", "Server"],
          messages: [
            { from: 0, to: 1, label: "SYN" },
            { from: 1, to: 0, label: "SYN-ACK" },
            { from: 0, to: 1, label: "ACK (handshake done)" },
            { from: 0, to: 1, label: "Data with PSH, ACK" },
            { from: 0, to: 1, label: "FIN" },
            { from: 1, to: 0, label: "ACK, then its own FIN" },
            { from: 0, to: 1, label: "ACK (closed)" },
          ],
        },
      },
      {
        heading: "Placing attacks and defences on layers",
        body: "Layers give you a map for attacks and controls. Layer 1: cutting cables or plugging into an open wall port; defence is physical security and port control. Layer 2: ARP spoofing or MAC flooding on a switch; defences include dynamic ARP inspection and port security. Layer 3: IP spoofing and routing attacks; defences include ingress filtering. Layer 4: SYN floods and port scans; defences include SYN cookies and firewalls. Layer 7: SQL injection and phishing; defences include secure code, WAFs and user training.",
        visual: {
          type: "layers",
          title: "Attacks and defences by layer",
          layers: [
            { label: "Layer 7 Application", detail: "SQL injection, phishing; secure code, WAF, training" },
            { label: "Layer 4 Transport", detail: "SYN floods, port scans; SYN cookies, firewalls" },
            { label: "Layer 3 Network", detail: "IP spoofing, routing attacks; ingress filtering" },
            { label: "Layer 2 Data link", detail: "ARP spoofing, MAC flooding; DAI, port security" },
            { label: "Layer 1 Physical", detail: "Cut cables, open wall ports; physical security" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Wrapping one web request on the way out",
        steps: [
          { label: "HTTP request", detail: "GET /login, created by the browser." },
          { label: "+ TCP header", detail: "Ports 51544 -> 443, sequence numbers." },
          { label: "+ IP header", detail: "192.168.1.20 -> 93.184.215.14." },
          { label: "+ Ethernet header", detail: "Laptop MAC -> router MAC." },
          { label: "Bits on the wire", detail: "Electrical or radio signals." },
        ],
      },
      {
        type: "compare",
        title: "TCP vs UDP from a defender's view",
        columns: [
          { title: "TCP", points: ["Handshake, so spoofed sources rarely complete it", "Flags reveal scans and floods", "Used by HTTP(S), SSH, SMB, RDP", "Streams can be rebuilt in Wireshark"] },
          { title: "UDP", points: ["No handshake, so source IPs are easy to fake", "Used in reflection and amplification DDoS", "Used by DNS, NTP, DHCP, many games", "Also used for tunnelling data out via DNS"] },
        ],
      },
    ],
    examples: [
      {
        title: "Reading a TCP handshake in a capture",
        explanation: "Step 1: Packet 1 shows 10.0.0.5 -> 10.0.0.10, port 51000 -> 22, flag SYN: the client asks to talk to SSH. Step 2: Packet 2 shows the reverse direction with SYN, ACK: the server agrees. Step 3: Packet 3 shows ACK from the client: connection open. Step 4: SSH data follows. If instead packet 2 had shown RST, ACK, the port was closed. If there was no reply at all, a firewall probably dropped the SYN silently.",
        code: {
          lang: "text",
          code: "No. Source     Destination  Proto Info\n1   10.0.0.5   10.0.0.10    TCP   51000 -> 22 [SYN] Seq=0\n2   10.0.0.10  10.0.0.5     TCP   22 -> 51000 [SYN, ACK] Seq=0 Ack=1\n3   10.0.0.5   10.0.0.10    TCP   51000 -> 22 [ACK] Seq=1 Ack=1\n4   10.0.0.10  10.0.0.5     SSH   Server: Protocol (SSH-2.0-OpenSSH_9.6)",
        },
      },
      {
        title: "Placing an incident on the right layer",
        explanation: "Users on one office floor report slow internet and certificate warnings. Step 1: Certificate warnings suggest someone is intercepting HTTPS. Step 2: Only one floor is affected, so the cause is local, likely layer 2. Step 3: On an affected PC, run \"arp -a\": the gateway IP shows the same MAC address as another PC on the floor. Step 4: Conclusion: ARP spoofing (layer 2) enabling a man-in-the-middle. Step 5: Defence: unplug the rogue machine, enable dynamic ARP inspection on the switch, and investigate how it got there.",
      },
    ],
    cheatSheet: [
      "OSI top to bottom: Application, Presentation, Session, Transport, Network, Data link, Physical",
      "TCP/IP: Application, Transport, Internet, Link",
      "Data unit names: segment (TCP), packet (IP), frame (Ethernet)",
      "SYN -> SYN-ACK -> ACK opens TCP; FIN closes politely; RST slams the door",
      "Many SYNs, few handshakes, many ports = likely port scan",
      "Layer 2 attacks stay on the local network; layer 7 attacks travel across the internet",
    ],
    quiz: [
      {
        q: "Which header carries MAC addresses?",
        options: ["TCP header", "IP header", "Ethernet frame header", "HTTP header"],
        answer: 2,
        why: "MAC addresses belong to the data link layer, which Ethernet frames represent.",
      },
      {
        q: "A client sends SYN and gets RST, ACK back. What does this most likely mean?",
        options: ["The port is closed on the target", "The connection succeeded", "Packets were encrypted", "The DNS lookup failed"],
        answer: 0,
        why: "A reset in reply to a SYN means nothing is listening on that port.",
      },
      {
        q: "Why is UDP popular for reflection DDoS attacks?",
        options: ["It is encrypted", "It is slower than TCP", "It only works locally", "It has no handshake, so the source IP can be faked easily"],
        answer: 3,
        why: "Without a handshake, servers reply to forged addresses, sending traffic to the victim.",
      },
      {
        q: "Which OSI layers are merged into the TCP/IP application layer?",
        options: ["1 and 2", "5, 6 and 7", "3 and 4", "2, 3 and 4"],
        answer: 1,
        why: "Session, presentation and application are combined in the TCP/IP model.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Place each item on an OSI layer: switch, router, TLS encryption, HTTP, Ethernet cable, TCP port 443.",
        hint: "Ask what each one uses to make decisions: signals, MAC, IP, port or content.",
        solution: "Ethernet cable: layer 1.\nSwitch: layer 2 (MAC addresses).\nRouter: layer 3 (IP addresses).\nTCP port 443: layer 4.\nTLS encryption: layer 6 in OSI terms (often described as between 4 and 7).\nHTTP: layer 7.",
      },
      {
        level: "medium",
        task: "In a lab VM, capture traffic in Wireshark while visiting one HTTP site, then find and screenshot the three-way handshake. Note the ports used.",
        hint: "Use the display filter tcp.flags.syn == 1 to find handshake starts.",
        solution: "1. Start capture on the lab interface.\n2. Browse to a test site such as http://neverssl.com.\n3. Stop capture and filter: tcp.flags.syn == 1\n4. Pick the SYN to port 80, then find its SYN-ACK and the ACK.\n5. Note: client uses a random high port (e.g. 49832), server uses 80.",
      },
      {
        level: "hard",
        task: "Make a table of five attacks, one per layer (1, 2, 3, 4, 7). For each, give one sign you would see in logs or captures and one defence.",
        hint: "Physical port use, ARP, IP spoofing, SYN flood, SQL injection are good choices.",
        solution: "L1 rogue device plugged in: switch log new MAC on port; fix: 802.1X.\nL2 ARP spoofing: two IPs claim one MAC; fix: dynamic ARP inspection.\nL3 IP spoofing: private source IPs arriving from internet; fix: ingress filtering.\nL4 SYN flood: many SYNs, few ACKs; fix: SYN cookies, upstream DDoS service.\nL7 SQL injection: quotes and UNION in web logs; fix: parameterised queries, WAF.",
      },
    ],
    faq: [
      { q: "Do I really need to memorise the OSI layers?", a: "Yes, at least the names and numbers. Interviews and certifications ask about them, and colleagues will say things like \"layer 7 attack\" expecting you to know what that means." },
      { q: "Where does TLS fit in the OSI model?", a: "It does not map neatly. It is often placed at layer 6 (presentation) because it encrypts data, but it runs on top of TCP and below HTTP, so some people call it layer 4.5." },
      { q: "Is UDP less secure than TCP?", a: "Neither is encrypted on its own. UDP is easier to spoof and abuse for amplification attacks, but security comes from what runs on top, such as TLS, DTLS or QUIC." },
    ],
  },

  "sec-networking/ports-protocols": {
    plain: [
      "A computer can run many network services at once, like a web server and an email server. Ports are numbers that tell incoming traffic which service it is for. An IP address is like a building's street address, and a port is like the apartment number.",
      "Some ports are well known. Web traffic uses 80 and 443. SSH remote login uses 22. Windows Remote Desktop uses 3389. When a defender sees traffic to port 3389 from the internet, they immediately think \"someone is trying Remote Desktop\".",
      "DNS (Domain Name System) is the internet's phone book. People type names like example.com, but computers need IP addresses. DNS turns names into addresses. Because almost everything starts with a DNS lookup, DNS logs are one of the best places to spot malware calling home.",
      "IP addresses are grouped into subnets. A subnet is a block of addresses that sit on the same network, written like 192.168.1.0/24. Knowing subnets tells you whether two machines are neighbours or whether traffic has to cross a router.",
    ],
    deepDive: [
      {
        heading: "Ports worth knowing by heart",
        body: "Analysts recognise ports instantly the way drivers recognise road signs. The important ones are 20/21 FTP, 22 SSH, 23 Telnet, 25 SMTP, 53 DNS, 80 HTTP, 110 POP3, 123 NTP, 143 IMAP, 389 LDAP, 443 HTTPS, 445 SMB, 3306 MySQL, 3389 RDP and 5432 PostgreSQL.\n\nRemember that a port number is a convention, not a guarantee. Attackers sometimes run their tools on port 443 to blend in with web traffic. A port tells you what to expect, and the traffic itself tells you what is really happening.",
        bullets: ["0-1023: well-known ports for system services", "1024-49151: registered ports for apps", "49152-65535: temporary client ports"],
      },
      {
        heading: "Reading CIDR notation",
        body: "CIDR notation writes a network as an address and a slash number, such as 10.20.0.0/16. The slash number says how many bits are fixed for the network. The rest are free for hosts. A /24 has 8 free bits, so 256 addresses (254 usable). A /16 has 65,536. A /32 is one single address.\n\nThree ranges are private and never routed on the internet: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16. If you see a private address coming from the internet side of a firewall, it is spoofed or misconfigured.",
        visual: {
          type: "layers",
          title: "Prefix length and network size",
          layers: [
            { label: "/8", detail: "16,777,216 addresses, e.g. 10.0.0.0/8" },
            { label: "/16", detail: "65,536 addresses" },
            { label: "/24", detail: "256 addresses, 254 usable" },
            { label: "/32", detail: "One single address" },
          ],
        },
      },
      {
        heading: "DNS record types defenders meet",
        body: "An A record maps a name to an IPv4 address and AAAA to IPv6. CNAME points one name to another. MX lists mail servers. TXT holds text, used for email security records like SPF and DMARC. PTR does reverse lookups from IP to name. NS lists the authoritative name servers.\n\nIn investigations, newly registered domains, very long random-looking subdomains and lots of TXT queries can all hint at malware or data being sneaked out through DNS.",
      },
      {
        heading: "Cleartext vs encrypted protocols",
        body: "Older protocols send everything, including passwords, as plain readable text. Telnet, FTP, HTTP, POP3 and plain SMTP are examples. Anyone who can capture the traffic can read it. Modern replacements wrap the same job in encryption: SSH instead of Telnet, SFTP or FTPS instead of FTP, HTTPS instead of HTTP, IMAPS and POP3S for mail.\n\nA quick audit question for any network is: which cleartext protocols are still in use, and why? Finding Telnet or FTP on a production network is a common, easy win.",
        visual: {
          type: "compare",
          title: "Cleartext protocols and their replacements",
          columns: [
            { title: "Cleartext (readable)", points: ["Telnet, port 23", "FTP, port 21", "HTTP, port 80", "POP3, port 110"] },
            { title: "Encrypted replacement", points: ["SSH, port 22", "SFTP (over SSH) or FTPS", "HTTPS, port 443", "POP3S 995, IMAPS 993"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Common services grouped by job",
        root: "Well-known ports",
        children: [
          { label: "Remote access", children: ["22 SSH", "23 Telnet (cleartext)", "3389 RDP"] },
          { label: "Web", children: ["80 HTTP", "443 HTTPS"] },
          { label: "Email", children: ["25 SMTP", "143 IMAP", "993 IMAPS"] },
          { label: "Infrastructure", children: ["53 DNS", "123 NTP", "67/68 DHCP"] },
          { label: "Windows and directory", children: ["445 SMB", "389 LDAP", "88 Kerberos"] },
          { label: "Databases", children: ["3306 MySQL", "5432 PostgreSQL", "1433 MSSQL"] },
        ],
      },
    ],
    examples: [
      {
        title: "Investigating a domain with dig",
        explanation: "A user clicked a link to invoice-portal.example. Step 1: Look up the A record to find the server IP. Step 2: Look up NS records to see who hosts the DNS. Step 3: Check MX to see if it also receives mail. Step 4: Run a reverse lookup on the IP. Step 5: Search the domain in your DNS logs to see which other users looked it up. The lookups themselves are safe; they do not visit the site.",
        code: {
          lang: "bash",
          code: "dig +short invoice-portal.example A\ndig +short invoice-portal.example NS\ndig +short invoice-portal.example MX\ndig +short -x 203.0.113.50        # reverse lookup (PTR)\ndig +short invoice-portal.example TXT",
        },
      },
      {
        title: "Is this traffic local or routed?",
        explanation: "A firewall log shows 192.168.10.45 talking to 192.168.12.8. Step 1: The network uses /24 subnets. Step 2: 192.168.10.45 is in 192.168.10.0/24 and 192.168.12.8 is in 192.168.12.0/24. Step 3: Different subnets, so traffic passed through a router or firewall, which is why it appears in this log at all. Step 4: If the network were a single /16, both would be local and the firewall would never see this traffic. Knowing the subnet layout tells you which logs can see which conversations.",
      },
    ],
    cheatSheet: [
      "22 SSH, 25 SMTP, 53 DNS, 80 HTTP, 443 HTTPS, 445 SMB, 3389 RDP",
      "Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16",
      "/24 = 256 addresses, /16 = 65,536, /32 = one host",
      "dig +short name A  |  dig +short -x IP  (forward and reverse DNS)",
      "DNS uses UDP 53 for most queries, TCP 53 for large answers and zone transfers",
      "Port numbers are hints, not proof; check the actual traffic",
      "SMB (445) and RDP (3389) should never face the internet directly",
    ],
    quiz: [
      {
        q: "A firewall shows internet traffic arriving with source IP 10.1.2.3. What does that suggest?",
        options: ["Normal home user traffic", "A DNS server", "Spoofed or misrouted traffic, since 10.x is private", "A VPN connection"],
        answer: 2,
        why: "Private ranges are not routed on the internet, so they should not appear from outside.",
      },
      {
        q: "Which DNS record lists mail servers for a domain?",
        options: ["MX", "A", "PTR", "CNAME"],
        answer: 0,
        why: "MX (mail exchanger) records tell senders where to deliver email.",
      },
      {
        q: "How many addresses are in a /24 network?",
        options: ["24", "1,024", "65,536", "256"],
        answer: 3,
        why: "A /24 leaves 8 host bits, and 2 to the power 8 is 256.",
      },
      {
        q: "Which protocol should replace Telnet for remote admin?",
        options: ["FTP", "SSH", "SMTP", "SNMPv1"],
        answer: 1,
        why: "SSH provides the same remote shell over an encrypted connection.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On your own computer, list which ports are listening. Name the service for any well-known port you see.",
        hint: "Linux: ss -tulpn. Windows: netstat -ano or Get-NetTCPConnection -State Listen.",
        solution: "Linux:   sudo ss -tulpn\nWindows: Get-NetTCPConnection -State Listen | Select LocalPort, OwningProcess\nTypical results: 22 (sshd) on Linux, 135/445 (RPC/SMB) on Windows,\n53 on 127.0.0.53 (local DNS stub) on many Linux desktops.\nAnything unexpected: find the process and decide if it is needed.",
      },
      {
        level: "medium",
        task: "Use dig to query A, MX, TXT and NS records for a domain you own or a well-known public one. Identify the SPF record in the TXT results and explain what it says.",
        hint: "SPF records start with v=spf1.",
        solution: "dig +short example.org A\ndig +short example.org MX\ndig +short example.org TXT\ndig +short example.org NS\nAn SPF record like v=spf1 include:_spf.google.com -all means only\nGoogle's mail servers may send for this domain; -all says reject others.",
      },
      {
        level: "hard",
        task: "Given these subnets: users 10.10.0.0/22, servers 10.10.8.0/24, guests 10.10.20.0/24. Work out the address range of each and decide whether 10.10.3.77 and 10.10.8.200 are in the same subnet.",
        hint: "A /22 covers four consecutive /24 blocks.",
        solution: "Users /22: 10.10.0.0 - 10.10.3.255 (1,024 addresses).\nServers /24: 10.10.8.0 - 10.10.8.255.\nGuests /24: 10.10.20.0 - 10.10.20.255.\n10.10.3.77 is in users; 10.10.8.200 is in servers.\nDifferent subnets, so traffic between them crosses a router or firewall.",
      },
    ],
    faq: [
      { q: "Can a service run on a non-standard port?", a: "Yes. Any service can listen on any port. Admins sometimes move SSH to another port to reduce noise, and attackers sometimes use 443 or 53 to blend in." },
      { q: "Does changing the SSH port make it secure?", a: "It reduces automated noise in logs but is not real security. Key-based login, disabling root login and rate limiting are what actually protect SSH." },
      { q: "What is DNS over HTTPS and why do defenders care?", a: "It sends DNS queries inside encrypted HTTPS, which protects privacy but hides lookups from network DNS logs. Companies often require their own resolver so they can still monitor DNS." },
    ],
  },

  "sec-networking/packet-analysis": {
    plain: [
      "Every action on a network creates packets: small chunks of data with addresses on them. Packet analysis means recording those packets and reading them to see exactly what happened. It is the most detailed evidence a network can give you.",
      "Wireshark is the free, standard tool for this. Think of it as a microscope for network traffic. A capture file, usually ending in .pcap or .pcapng, is like a recording you can replay, pause and search as often as you want.",
      "Real captures are huge, so the skill is narrowing them down. You start broad (which hosts talked the most?), then filter to one conversation, then read the details. Wireshark's Statistics menu answers the broad questions in seconds.",
      "Only capture traffic on networks you own or have written permission to monitor. Captures can contain passwords and private messages, so treat the files as sensitive evidence. For practice, use your own lab or the free sample captures on the Wireshark wiki and malware-traffic-analysis.net.",
    ],
    deepDive: [
      {
        heading: "Start with the Statistics menu",
        body: "Before reading single packets, get the big picture. Statistics > Conversations lists every pair of hosts with bytes and duration, sorted however you like. Statistics > Endpoints shows every IP seen. Statistics > Protocol Hierarchy shows what share of traffic is HTTP, DNS, TLS and so on.\n\nThese views answer \"who talked to whom, how much, and using what?\" in under a minute. A workstation that sent 2 GB to an unknown external IP stands out instantly in Conversations, even in a capture with a million packets.",
        bullets: ["Conversations: top talkers and long sessions", "Endpoints: every IP and its traffic volume", "Protocol Hierarchy: unexpected protocols", "I/O Graph: spikes and regular patterns over time"],
      },
      {
        heading: "Display filters that do most of the work",
        body: "Display filters use field names and comparisons. ip.addr == 10.0.0.5 shows traffic to or from one host. tcp.port == 445 shows SMB. dns shows DNS only. http.request shows web requests. tls.handshake.type == 1 shows TLS Client Hello messages, which reveal the server name the client asked for, even though the rest is encrypted.\n\nCombine with and, or and not: ip.src == 10.0.0.5 and not dns. Right-clicking any field and choosing Apply as Filter writes the filter for you, which is the fastest way to learn field names.",
        visual: {
          type: "tree",
          title: "Display filters by question",
          root: "Display filter",
          children: [
            { label: "One host", children: ["ip.addr == 10.0.0.5"] },
            { label: "One service", children: ["tcp.port == 445"] },
            { label: "One protocol", children: ["dns", "http.request"] },
            { label: "TLS server names", children: ["tls.handshake.type == 1"] },
            { label: "Combine", children: ["and", "or", "not"] },
          ],
        },
      },
      {
        heading: "What a scan looks like",
        body: "In a TCP port scan, one source sends SYN packets to many ports on one or many targets in a short time. Most get RST replies (closed) or no reply (filtered). A few get SYN-ACK (open).\n\nThe filter tcp.flags.syn == 1 and tcp.flags.ack == 0 shows only connection attempts. Then Statistics > Conversations, sorted by the source, shows one IP touching hundreds of ports. In a real network this is either an approved vulnerability scanner, or an attacker exploring after getting a foothold. Check the source against your list of scanner IPs.",
        visual: {
          type: "sequence",
          title: "Three answers to a SYN scan",
          actors: ["Scanner", "Target"],
          messages: [
            { from: 0, to: 1, label: "SYN to port 22" },
            { from: 1, to: 0, label: "SYN-ACK: open" },
            { from: 0, to: 1, label: "SYN to port 23" },
            { from: 1, to: 0, label: "RST: closed" },
            { from: 0, to: 1, label: "SYN to port 3389: no reply, filtered" },
          ],
        },
      },
      {
        heading: "What beaconing looks like",
        body: "Malware often checks in with its command and control (C2) server on a schedule, for example every 60 seconds. This is called beaconing. In a capture, you see small connections from one host to the same destination at very regular times, often with similar sizes.\n\nTo spot it, filter on one destination and look at the Time column, or use the I/O Graph with a 1-second interval: beacons show as evenly spaced spikes. Attackers add jitter (random delays) to hide this, but even jittered beacons are usually far more regular than a human browsing.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "From whole capture to one answer",
        layers: [
          { label: "Whole capture", detail: "Millions of packets, many hosts." },
          { label: "Statistics views", detail: "Top talkers, protocols, timeline." },
          { label: "Display filter", detail: "One host, port or protocol." },
          { label: "Follow stream", detail: "One full conversation." },
          { label: "Packet details", detail: "Exact fields, headers and bytes." },
        ],
      },
    ],
    examples: [
      {
        title: "Finding what a host downloaded",
        explanation: "Scenario: an alert says host 10.0.0.23 downloaded a suspicious file. Step 1: Filter ip.addr == 10.0.0.23 and http.request. Step 2: A GET for /update.bin from an unfamiliar domain stands out. Step 3: Right-click it and choose Follow > HTTP Stream to see the request and response headers, including Content-Type and size. Step 4: Use File > Export Objects > HTTP to save the file inside your isolated lab, then hash it with sha256sum. Step 5: Look up the hash on a reputation service rather than opening the file.",
        code: {
          lang: "text",
          code: "ip.addr == 10.0.0.23 and http.request\nhttp.request.uri contains \".bin\"\nhttp.response.code == 200 and ip.dst == 10.0.0.23\n# Then: File > Export Objects > HTTP, save in lab, run:\n# sha256sum update.bin",
        },
      },
      {
        title: "Spotting a beacon with tshark",
        explanation: "tshark is Wireshark's command-line version. Step 1: List the time and destination of every TLS Client Hello from one host. Step 2: Look at the gaps between times to the same server. Step 3: If the gaps are nearly identical (here about 60 seconds) and the server name is unfamiliar, treat it as possible beaconing. Step 4: Check which process made the connections using EDR or Sysmon network events on that host.",
        code: {
          lang: "bash",
          code: "tshark -r lab.pcapng \\\n  -Y \"ip.src==10.0.0.23 && tls.handshake.type==1\" \\\n  -T fields -e frame.time_relative -e ip.dst -e tls.handshake.extensions_server_name\n# 12.01   198.51.100.7  cdn-update.example\n# 72.03   198.51.100.7  cdn-update.example\n# 132.02  198.51.100.7  cdn-update.example   <- every ~60s",
        },
      },
    ],
    cheatSheet: [
      "ip.addr == X | tcp.port == 445 | dns | http.request | tls.handshake.type == 1",
      "tcp.flags.syn == 1 and tcp.flags.ack == 0  -> connection attempts only",
      "Statistics > Conversations first; packets second",
      "Follow > TCP Stream rebuilds a whole conversation",
      "TLS Client Hello reveals the server name (SNI) even when content is encrypted",
      "File > Export Objects saves transferred files; only open them in an isolated lab",
      "Practice captures: Wireshark sample captures, malware-traffic-analysis.net exercises",
    ],
    quiz: [
      {
        q: "Which Wireshark view quickly shows which pair of hosts exchanged the most data?",
        options: ["Expert Info", "Statistics > Conversations", "Follow UDP Stream", "Capture Options"],
        answer: 1,
        why: "Conversations lists every host pair with bytes and duration, sortable by size.",
      },
      {
        q: "In encrypted HTTPS traffic, what can you usually still see?",
        options: ["The server name in the Client Hello (SNI) and connection timing", "The full URL path", "Usernames and passwords", "The page content"],
        answer: 0,
        why: "SNI, IPs, sizes and timing are visible; content and paths are encrypted.",
      },
      {
        q: "A host connects to the same external server every 300 seconds with tiny payloads. What is the most likely concern?",
        options: ["A port scan", "A DNS misconfiguration", "A slow website", "Malware beaconing to command and control"],
        answer: 3,
        why: "Regular, small, repeated check-ins are the classic beacon pattern.",
      },
      {
        q: "What is the safest way to examine a file extracted from a capture?",
        options: ["Open it on your work laptop", "Email it to a colleague", "Hash it and check reputation, opening it only in an isolated lab", "Upload it to a public file share"],
        answer: 2,
        why: "Hashing lets you research the file without running it, and isolation contains any harm.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Download a sample capture from the Wireshark wiki (for example an HTTP one). Find the top three talkers using Statistics > Conversations.",
        hint: "Use the IPv4 tab and sort by Bytes.",
        solution: "1. Open the pcap in Wireshark.\n2. Statistics > Conversations > IPv4 tab.\n3. Click the Bytes column header to sort descending.\n4. Note the top three address pairs and their byte counts.\n5. Right-click the top one > Apply as Filter > Selected > A<->B to inspect it.",
      },
      {
        level: "medium",
        task: "In your lab, capture traffic while running a port scan with nmap from one VM against another VM you own. Then write a display filter that shows only the scan's connection attempts and count the ports probed.",
        hint: "Filter SYN without ACK from the scanner IP, then use Statistics > Endpoints or Conversations.",
        solution: "Scanner 192.168.56.10, target 192.168.56.20 (both your lab VMs).\nnmap -sS 192.168.56.20  (run with sudo on the scanner)\nFilter:\nip.src==192.168.56.10 && tcp.flags.syn==1 && tcp.flags.ack==0\nStatistics > Conversations > TCP tab: about 1,000 rows,\none per probed port (nmap's default top 1000 ports).",
      },
      {
        level: "hard",
        task: "Pick an exercise pcap from malware-traffic-analysis.net (training captures, never live malware). Identify the infected host, the first suspicious domain, and evidence of C2 or beaconing. Write a five-line summary.",
        hint: "Start with DNS queries and HTTP requests from internal hosts, then look for regular repeated connections.",
        solution: "Approach:\n1. Statistics > Endpoints: find internal hosts.\n2. Filter dns.flags.response == 0: list queried names, look for odd ones.\n3. Filter http.request or tls.handshake.type == 1 for those names.\n4. Check timing of repeats to one IP (I/O Graph) for beacons.\nSummary: host, user if known, first bad domain + time,\nC2 IP and interval, files downloaded with hashes.",
      },
    ],
    faq: [
      { q: "Is using Wireshark legal?", a: "Yes, on networks you own or have explicit permission to monitor. Capturing other people's traffic without permission can break wiretap and privacy laws, so stick to your lab and sample files." },
      { q: "Can Wireshark decrypt HTTPS?", a: "Only if you have the session keys. In your own lab you can set the SSLKEYLOGFILE environment variable in a browser and point Wireshark at that file; otherwise TLS content stays encrypted." },
      { q: "Why do I see so much traffic I did not cause?", a: "Computers constantly do background work: updates, DNS lookups, time sync, device discovery and cloud sync. Learning what normal background noise looks like is part of the skill." },
    ],
  },

  "sec-networking/firewalls-segmentation": {
    plain: [
      "A firewall is a gatekeeper between networks. It reads each connection's source, destination and port, then checks its rule list to decide whether to let it through. Rules are read from top to bottom, and the first match wins.",
      "Segmentation means splitting one big network into smaller zones with firewalls between them. Think of a ship with watertight compartments. If one fills with water, the doors stay shut and the ship stays afloat. If an attacker takes over one laptop, segmentation stops them reaching every server.",
      "NAT (network address translation) lets many devices with private addresses share one public address. Your home router does this. It also means outsiders cannot start connections to your devices unless you set up port forwarding, which is a useful side effect, but NAT is not a full firewall.",
      "The safest firewall stance is default deny. Everything is blocked unless a rule says otherwise. You then add narrow allow rules for what the business really needs, with a note explaining each one.",
    ],
    deepDive: [
      {
        heading: "Writing good rules",
        body: "A good rule is as narrow as possible: a specific source, a specific destination, a specific port, and a reason. \"Allow 10.10.1.0/24 to 10.10.8.15 on TCP 443, for the HR app, ticket CHG-1042\" is a good rule. \"Allow any to any\" is not.\n\nBecause rules are processed in order, put specific rules above general ones. End with an explicit deny-all rule that logs what it blocks. Those deny logs are valuable: they show scanning, misconfigured apps and attackers trying to move between zones.",
        bullets: ["Narrow source, destination and port", "A reason and owner for every rule", "Specific rules above general ones", "Final deny-all with logging", "Review and remove stale rules regularly"],
      },
      {
        heading: "Stateful inspection and egress filtering",
        body: "A stateful firewall remembers connections it has allowed. If a laptop opens a connection to a website, the reply is automatically allowed back in. You do not need a rule for return traffic, which keeps rule sets short and safe.\n\nMany organisations filter inbound traffic carefully but allow all outbound traffic. That is a gap. Egress filtering (controlling outbound traffic) makes malware's job harder: servers should not browse the internet freely, and only the DNS servers should send DNS queries outward. Blocked outbound attempts are a strong detection signal.",
        visual: {
          type: "sequence",
          title: "Stateful firewall and return traffic",
          actors: ["Laptop", "Firewall", "Website"],
          messages: [
            { from: 0, to: 1, label: "Open TCP 443 to website" },
            { from: 1, to: 2, label: "Rule allows it, connection recorded" },
            { from: 2, to: 1, label: "Reply packets" },
            { from: 1, to: 0, label: "Matches state, allowed with no extra rule" },
          ],
        },
      },
      {
        heading: "Designing zones",
        body: "A typical segmented design has several zones. The DMZ holds internet-facing servers. User networks hold laptops and phones. Server networks hold internal apps. A management network holds admin interfaces, reachable only from admin jump hosts. A guest Wi-Fi network reaches only the internet.\n\nVLANs (virtual LANs) separate zones on shared switches, and a firewall routes between them with rules. The key question for each zone is: what does it truly need to talk to? Everything else is denied.",
        visual: {
          type: "tree",
          title: "Typical zones",
          root: "Firewall between zones",
          children: [
            { label: "DMZ", children: ["Internet-facing servers"] },
            { label: "User networks", children: ["Laptops", "Phones"] },
            { label: "Server networks", children: ["Internal apps"] },
            { label: "Management", children: ["Admin interfaces", "Reached from jump hosts only"] },
            { label: "Guest Wi-Fi", children: ["Internet only"] },
          ],
        },
      },
      {
        heading: "Host firewalls and microsegmentation",
        body: "Network firewalls control traffic between zones, but machines inside the same zone can often talk freely. Host firewalls, like Windows Defender Firewall or nftables on Linux, close that gap by filtering on each machine.\n\nA common example: workstations should never need to connect to each other's SMB port 445. Blocking workstation-to-workstation SMB with a host firewall stops a big share of ransomware and worm spreading. Microsegmentation takes this further with per-application rules, often in cloud or data centre platforms.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How a firewall decides on one packet",
        steps: [
          { label: "Packet arrives", detail: "Source, destination, port, protocol." },
          { label: "Existing connection?", detail: "If tracked as established, allow." },
          { label: "Check rules top to bottom", detail: "First matching rule wins." },
          { label: "Allow or deny", detail: "Act on the matching rule." },
          { label: "No match", detail: "Default deny, and log it." },
        ],
      },
    ],
    examples: [
      {
        title: "A default-deny rule set for a small web app",
        explanation: "Zones: internet, DMZ (web server 10.0.1.10), app zone (database 10.0.2.20), admin zone (10.0.9.0/24). Read the rules top to bottom. The web server can be reached on 443 from anywhere. Only the web server can reach the database on 5432. SSH is allowed only from the admin zone. Everything else is denied and logged. Note there is no rule allowing the database to reach the internet.",
        code: {
          lang: "text",
          code: "# action  source         destination   port      reason\nallow     any            10.0.1.10     tcp/443   public website\nallow     10.0.1.10      10.0.2.20     tcp/5432  web app to database\nallow     10.0.9.0/24    10.0.1.10     tcp/22    admin SSH to web\nallow     10.0.9.0/24    10.0.2.20     tcp/22    admin SSH to db\nallow     10.0.1.10      10.0.0.53     udp/53    DNS via internal resolver\ndeny      any            any           any       default deny (log)",
        },
      },
      {
        title: "Host firewall on a Linux server with ufw",
        explanation: "ufw (uncomplicated firewall) is a friendly front end for Linux firewalling. Step 1: Set defaults: deny incoming, allow outgoing (tighten outgoing later). Step 2: Allow SSH only from the admin subnet. Step 3: Allow HTTPS from anywhere. Step 4: Turn on logging. Step 5: Enable and check the status. Always add the SSH allow rule before enabling, or you may lock yourself out of a remote server.",
        code: {
          lang: "bash",
          code: "sudo ufw default deny incoming\nsudo ufw default allow outgoing\nsudo ufw allow from 10.0.9.0/24 to any port 22 proto tcp\nsudo ufw allow 443/tcp\nsudo ufw logging on\nsudo ufw enable\nsudo ufw status numbered",
        },
      },
    ],
    cheatSheet: [
      "Rules run top to bottom; first match wins; end with deny all + log",
      "Every rule: narrow source, destination, port, plus a reason and owner",
      "Stateful firewalls allow replies automatically; no return rules needed",
      "Filter outbound too: servers rarely need open internet access",
      "Block workstation-to-workstation SMB (445) to slow ransomware spread",
      "NAT hides private addresses but is not a security policy",
      "Review rules quarterly; remove unused and \"temporary\" ones",
    ],
    quiz: [
      {
        q: "Rule 1 says deny any to any. Rule 2 says allow any to web server on 443. What happens to HTTPS traffic to the web server?",
        options: ["It is allowed by rule 2", "It is denied, because rule 1 matches first", "It is allowed because HTTPS is encrypted", "It is logged but allowed"],
        answer: 1,
        why: "Rules are processed in order and the first match wins.",
      },
      {
        q: "Why is egress filtering useful?",
        options: ["It speeds up downloads", "It replaces antivirus", "It is required for NAT", "It limits where malware can send data and reveals blocked attempts"],
        answer: 3,
        why: "Controlling outbound traffic blocks many C2 and exfiltration paths and creates alerts.",
      },
      {
        q: "Which zone should hold admin interfaces like switch and hypervisor management?",
        options: ["A management network reachable only from admin hosts", "The DMZ", "Guest Wi-Fi", "The user network"],
        answer: 0,
        why: "Isolating management interfaces stops ordinary users and attackers reaching them.",
      },
      {
        q: "What does a stateful firewall remember?",
        options: ["Every user's password", "Website content", "Active connections, so replies are allowed", "Which antivirus is installed"],
        answer: 2,
        why: "Tracking connection state lets return traffic in without extra rules.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On a lab Linux VM, enable ufw with default deny incoming, allow SSH only from your host machine's IP, and confirm the rule list.",
        hint: "Find your host's IP on the lab network first, then add the allow rule before enabling.",
        solution: "ip a                      # find the VM and host addresses\nsudo ufw default deny incoming\nsudo ufw allow from 192.168.56.1 to any port 22 proto tcp\nsudo ufw enable\nsudo ufw status verbose\nTest: SSH from host works; SSH from another VM is refused.",
      },
      {
        level: "medium",
        task: "Design zones for a small office with staff laptops, a file server, a printer, guest Wi-Fi and a public website. List the zones and the allow rules between them.",
        hint: "Start from default deny and only add flows each zone really needs.",
        solution: "Zones: Users, Servers, Printers, Guest, DMZ.\nUsers -> Servers: tcp/445 (file share), tcp/443 (intranet).\nUsers -> Printers: tcp/9100, tcp/631.\nUsers, Servers -> Internet: tcp/443 via proxy.\nGuest -> Internet only: tcp/80, tcp/443, udp/53 to public DNS.\nInternet -> DMZ web: tcp/443. DMZ -> anything internal: deny.\nEverything else: deny and log.",
      },
      {
        level: "hard",
        task: "Audit this rule list and fix it: (1) allow any any tcp/3389, (2) allow 10.0.0.0/8 any any, (3) allow any 10.0.1.10 tcp/443, (4) deny any any.",
        hint: "Look for internet-facing RDP, overly broad internal rules and missing logging.",
        solution: "Rule 1: RDP open to the internet. Remove; use VPN, then allow\n  VPN pool -> specific servers tcp/3389 only.\nRule 2: any internal host to anything. Replace with per-zone rules\n  (users -> servers on needed ports only).\nRule 3: fine if 10.0.1.10 is the public web server in a DMZ.\nRule 4: keep, but add logging.\nAdd: egress rules so servers only reach update sites and DNS resolvers.",
      },
    ],
    faq: [
      { q: "Is my home router's NAT enough protection?", a: "It blocks unsolicited inbound connections, which helps a lot, but it does not stop malware on your devices from connecting out. Keep devices updated and turn off UPnP if you do not need it." },
      { q: "What is a next-generation firewall?", a: "A firewall that understands applications and users, not just IPs and ports. It can, for example, allow a business app but block file sharing tools, and often includes intrusion prevention." },
      { q: "Do I still need a firewall with zero trust?", a: "Yes. Zero trust adds identity checks to each request, but firewalls and segmentation still reduce what an attacker can reach and create useful logs." },
    ],
  },

  "sec-networking/network-attacks": {
    plain: [
      "Many network protocols were designed when everyone on a network was trusted. They believe what they are told. Network attacks abuse that trust by lying about who someone is, sitting secretly in the middle of a conversation, or overwhelming a service until it stops working.",
      "Spoofing means faking an identity: a fake IP address, a fake MAC address, or a fake DNS answer. It is like someone answering the door wearing a delivery uniform they do not own.",
      "A man-in-the-middle (MITM) attacker places themselves between two parties so traffic flows through them. They can read or change it. Denial of service (DoS) floods a target so real users cannot get through. When the flood comes from thousands of machines at once, it is called DDoS (distributed denial of service).",
      "The good news is that each attack has well-known defences. Encryption with TLS makes intercepted data useless. Switch features stop spoofing on local networks. DDoS protection services absorb floods. Monitoring spots the warning signs early.",
    ],
    deepDive: [
      {
        heading: "Why ARP spoofing works",
        body: "On a local network, devices use ARP (address resolution protocol) to find which MAC address owns an IP. A laptop broadcasts \"who has 192.168.1.1?\" and the router replies with its MAC. The laptop stores the answer in its ARP cache.\n\nARP has no authentication. Any device can send a reply saying \"I am 192.168.1.1\", and many systems simply accept it. The attacker then receives traffic meant for the router. Defences include dynamic ARP inspection on managed switches, which checks ARP replies against known DHCP leases, and alerts when one MAC claims several IPs.",
        bullets: ["ARP trusts any reply", "Spoofing redirects local traffic", "Fix: dynamic ARP inspection, DHCP snooping", "Detect: one MAC claiming many IPs"],
      },
      {
        heading: "DNS spoofing and DNS tunnelling",
        body: "DNS spoofing gives a victim a false answer, so a real name points to an attacker's server. It can happen through a poisoned resolver cache, a rogue DHCP server handing out a bad DNS server, or malware changing a host's settings. DNSSEC (signed DNS records) and locked-down resolver settings help.\n\nDNS tunnelling is different: malware hides data inside DNS queries, like long random subdomains, because DNS is rarely blocked. Signs include very long query names, high volumes of TXT queries, and many unique subdomains under one domain.",
        visual: {
          type: "sequence",
          title: "Data hidden in DNS (tunnelling)",
          actors: ["Malware", "Company resolver", "Attacker's DNS server"],
          messages: [
            { from: 0, to: 1, label: "Query: long random label under attacker's domain" },
            { from: 1, to: 2, label: "Forwarded, since DNS is rarely blocked" },
            { from: 2, to: 1, label: "TXT answer carrying data" },
            { from: 1, to: 0, label: "Answer passed back" },
          ],
        },
      },
      {
        heading: "Types of denial of service",
        body: "Volumetric attacks fill the network pipe with traffic, often using amplification: small spoofed requests to open DNS, NTP or memcached servers trigger huge replies to the victim. Protocol attacks, like SYN floods, exhaust connection tables in servers and firewalls. Application attacks send many expensive but legitimate-looking requests, such as repeated searches, to wear out the app.\n\nDefences differ by type. Volumetric floods need upstream help from an ISP or a DDoS protection service, because your own link is already full. SYN cookies handle SYN floods. Rate limiting, caching and a CDN help with application floods.",
        visual: {
          type: "compare",
          title: "Three kinds of denial of service",
          columns: [
            { title: "Volumetric", points: ["Fills the network link", "Amplified via DNS, NTP, memcached", "Needs ISP or DDoS service help"] },
            { title: "Protocol", points: ["Exhausts connection tables", "Example: SYN flood", "SYN cookies"] },
            { title: "Application", points: ["Costly, legit-looking requests", "Example: repeated searches", "Rate limiting, caching, CDN"] },
          ],
        },
      },
      {
        heading: "Rogue devices and Wi-Fi attacks",
        body: "An attacker with physical access can plug a small device into a spare network port, or set up an evil twin Wi-Fi access point with the same name as the real one. Users who connect to the fake network send their traffic through the attacker.\n\nDefences include 802.1X network access control (devices must authenticate before a port works), WPA3-Enterprise Wi-Fi with certificate checks, wireless intrusion detection that spots unknown access points broadcasting your network name, and disabling unused wall ports.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three attack families and how they show up",
        columns: [
          { title: "Spoofing", points: ["Fake IP, MAC or DNS answer", "Sign: one MAC claims many IPs", "Sign: DNS answers that differ from public ones", "Fix: DAI, DHCP snooping, DNSSEC"] },
          { title: "Man-in-the-middle", points: ["Attacker relays traffic", "Sign: certificate warnings", "Sign: gateway MAC suddenly changes", "Fix: TLS everywhere, HSTS, 802.1X"] },
          { title: "Denial of service", points: ["Floods links, tables or apps", "Sign: traffic spike, many half-open connections", "Sign: one URL hit thousands of times", "Fix: DDoS service, SYN cookies, rate limits"] },
        ],
      },
    ],
    examples: [
      {
        title: "Spotting ARP spoofing in your lab",
        explanation: "In your own isolated lab, compare ARP tables before and after suspicious activity. Step 1: On a lab client, note the gateway's MAC with \"ip neigh\". Step 2: Later, check again. Step 3: If the gateway IP now shows a different MAC, and that MAC also belongs to another lab host, something is claiming to be the gateway. Step 4: In Wireshark, the filter arp.duplicate-address-detected or Expert Info warnings highlight the conflict. Step 5: Response: find the switch port for that MAC and disconnect it.",
        code: {
          lang: "bash",
          code: "# Before\nip neigh show 192.168.56.1\n# 192.168.56.1 dev eth0 lladdr 52:54:00:aa:bb:01 REACHABLE\n# After\nip neigh show 192.168.56.1\n# 192.168.56.1 dev eth0 lladdr 08:00:27:3c:4d:5e REACHABLE   <- changed\nip neigh | grep 08:00:27:3c:4d:5e\n# 192.168.56.30 ... lladdr 08:00:27:3c:4d:5e   <- same MAC as another host",
        },
      },
      {
        title: "Recognising DNS tunnelling in logs",
        explanation: "Step 1: Pull DNS query logs from your resolver for one host over an hour. Step 2: Group by parent domain and count unique subdomains. Step 3: Normal domains show a handful of names like www and api. One domain shows 4,000 unique, long, random-looking subdomains. Step 4: Check the domain's age and reputation: registered last week. Step 5: Conclusion: likely data being sent out through DNS. Block the domain at the resolver and investigate the host.",
        code: {
          lang: "text",
          code: "Query name                                                   Type\naGVsbG8gd29ybGQgdGhpcyBpcyBkYXRh.x7q.badcdn.example          TXT\nc2VjcmV0IGZpbGUgY29udGVudHMgaGVyZQ.x7q.badcdn.example        TXT\nbW9yZSBkYXRhIGluIGNodW5rcyBvZiAzMg.x7q.badcdn.example        TXT\n# 4,012 unique subdomains in 60 minutes, all under badcdn.example",
        },
      },
    ],
    cheatSheet: [
      "ARP has no authentication; dynamic ARP inspection fixes that on managed switches",
      "Certificate warnings on many machines at once can mean a MITM",
      "Amplification DDoS abuses open DNS, NTP or memcached servers with spoofed requests",
      "SYN cookies defend against SYN floods",
      "DNS tunnelling signs: long random subdomains, many TXT queries, one new domain",
      "802.1X stops rogue devices getting network access from wall ports",
    ],
    quiz: [
      {
        q: "Why can't you stop a large volumetric DDoS with your own firewall alone?",
        options: ["Firewalls cannot read packets", "Your internet link is already full before traffic reaches the firewall", "DDoS uses encrypted traffic", "Firewalls only work on layer 7"],
        answer: 1,
        why: "The flood saturates the connection upstream, so mitigation must happen at the ISP or a scrubbing service.",
      },
      {
        q: "Which sign most strongly suggests DNS tunnelling?",
        options: ["Thousands of unique long random subdomains under one new domain", "A few A record lookups for google.com", "DNS over port 53", "A single failed lookup"],
        answer: 0,
        why: "Encoding data in subdomains creates many unique, random-looking names.",
      },
      {
        q: "An evil twin attack targets which kind of network?",
        options: ["Fibre backbone", "VPN tunnels", "Data centre storage", "Wi-Fi"],
        answer: 3,
        why: "An evil twin is a fake access point using the same name as a real Wi-Fi network.",
      },
      {
        q: "What does HSTS help prevent?",
        options: ["ARP spoofing", "SYN floods", "Being downgraded from HTTPS to HTTP by a MITM", "DNS tunnelling"],
        answer: 2,
        why: "HSTS tells browsers to always use HTTPS for a site, blocking SSL stripping.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look at the ARP table on your own computer and identify your gateway's MAC address. Explain what would change if someone spoofed it.",
        hint: "Linux: ip neigh. Windows: arp -a. Your gateway IP is in ip route or ipconfig.",
        solution: "ip route | grep default     # e.g. via 192.168.1.1\nip neigh show 192.168.1.1   # note lladdr (MAC)\nIf spoofed, the same IP would map to a different MAC,\noften one that also belongs to another device on the network,\nand your traffic to the internet would pass through that device.",
      },
      {
        level: "medium",
        task: "Generate one hour of DNS logs in your lab (for example with Pi-hole or systemd-resolved logging). Write a short script or query that lists the parent domains with the most unique subdomains.",
        hint: "Split each name on dots and keep the last two or three labels as the parent.",
        solution: "import collections, sys\nsubs = collections.defaultdict(set)\nfor line in open(sys.argv[1]):\n    name = line.split()[-1].rstrip(\".\")\n    parts = name.split(\".\")\n    parent = \".\".join(parts[-2:])\n    subs[parent].add(name)\nfor p, s in sorted(subs.items(), key=lambda x: -len(x[1]))[:10]:\n    print(len(s), p)",
      },
      {
        level: "hard",
        task: "Write a one-page defence plan for a small company against these four attacks: ARP spoofing, evil twin Wi-Fi, SYN flood on the website, DNS tunnelling. Include one prevention and one detection for each.",
        hint: "Pair every preventive control with a log source or alert.",
        solution: "ARP spoofing: prevent with DAI + DHCP snooping; detect via switch DAI drop logs.\nEvil twin: prevent with WPA3-Enterprise + cert validation;\n  detect via wireless IDS rogue AP alerts.\nSYN flood: prevent with CDN/DDoS service + SYN cookies;\n  detect via half-open connection count alerts on the load balancer.\nDNS tunnelling: prevent by forcing all DNS through internal resolver;\n  detect via unique-subdomain and long-query alerts in the SIEM.",
      },
    ],
    faq: [
      { q: "Is public Wi-Fi dangerous?", a: "Less than it used to be, because most sites use HTTPS. The main risks are fake hotspots and devices with old apps. Use HTTPS sites, keep devices updated and consider a VPN on untrusted networks." },
      { q: "Can a small business afford DDoS protection?", a: "Often yes. Many CDNs and hosting providers include basic DDoS protection on free or low-cost plans, which is enough for most small sites." },
      { q: "Does a VPN stop all man-in-the-middle attacks?", a: "It protects traffic between you and the VPN server from local attackers. It does not protect against a compromised VPN provider or attacks after traffic leaves the VPN." },
    ],
  },
};

export default extra;
