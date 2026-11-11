import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "eh-foundations/ethics-law": {
    plain: [
      "Ethical hacking uses the same tools and tricks as criminals. The difference is not skill or intent. The difference is permission. If the owner of a system has given you written permission to test it, your work is a job. If they have not, the very same scan or login attempt can be a crime.",
      "Most countries have a law about computer misuse. In the UK it is the Computer Misuse Act 1990. In the US it is the Computer Fraud and Abuse Act (CFAA). In India it is the Information Technology Act 2000. They all make it an offence to access a computer you are not allowed to access, even if you change nothing.",
      "\"I only wanted to help\" is not a legal defence in most places. Courts look at whether you had authorization, not at how kind your reasons were. That is why professionals never test anything until a person with real authority over the system has signed a document that names it.",
      "When you do find a flaw, there is a polite and safe way to report it. This is called responsible (or coordinated) disclosure. You tell the owner privately, give them time to fix it, and only talk about it in public after the fix is out, if at all.",
    ],
    deepDive: [
      {
        heading: "What the laws actually forbid",
        body: "Computer misuse laws usually have a few layers. The base offence is unauthorised access: logging in, reading files or getting past a password check that you were not allowed to pass. Harsher offences cover access with intent to commit another crime, and acts that impair a system, such as deleting data or knocking a service offline. Some laws also cover making or supplying tools for these crimes, which is why intent and context matter when you share scripts.\n\nThe key word is authorization. A website being public does not mean every part of it is authorised for you. Guessing a hidden admin URL, using someone else's password, or changing an ID in a URL to read another person's data can all count as unauthorised access, even with no hacking tool involved.",
        bullets: ["UK: Computer Misuse Act 1990", "US: Computer Fraud and Abuse Act, 18 U.S.C. 1030", "India: IT Act 2000, sections 43 and 66", "EU countries: national laws based on Directive 2013/40/EU"],
      },
      {
        heading: "Authorization has limits",
        body: "Permission is never a blank cheque. It covers specific systems, a specific time window and specific methods. A signed letter to test the web app at shop.example.com does not let you test the office Wi-Fi, the payment provider behind the checkout, or the cloud account of a supplier.\n\nAlso check who signed. An employee can only authorise testing of systems their company owns or controls. A company cannot give you permission to test a third party, such as its SaaS email provider or hosting company. Those providers have their own rules or require their own approval. If the person who signed had no authority, your permission may be worthless.",
        bullets: ["Permission names systems, dates and methods", "The signer must have authority over the asset", "Third-party services need their own permission", "Anything not written down is not authorised"],
      },
      {
        heading: "Pentests, bug bounties and crime",
        body: "A penetration test is a paid contract. The client defines the scope, you test inside it for a fixed period, and you deliver a report. A bug bounty is a public or private program where a company invites many researchers to test listed assets under published rules, and pays for valid reports. Both are authorised; the program rules or contract are your permission.\n\nCrime starts the moment you step outside that permission. Testing a company with no bounty program, testing assets the program excludes, or breaking a program rule (for example, using automated scanners when they are banned) can remove your protection. Many programs include a safe harbor statement, a promise not to take legal action against researchers who follow the rules.",
        visual: {
          type: "compare",
          title: "Three ways people test systems",
          columns: [
            { title: "Penetration test", points: ["Signed contract with the client", "Fixed scope and dates", "Paid for time and a report", "Legal inside the contract"] },
            { title: "Bug bounty", points: ["Published program rules", "Many researchers at once", "Paid per valid finding", "Legal only inside the rules"] },
            { title: "Unauthorised testing", points: ["No permission at all", "No scope or contact", "Can be prosecuted", "Even with good intent"] },
          ],
        },
      },
      {
        heading: "How coordinated disclosure works",
        body: "Coordinated vulnerability disclosure means the finder and the owner work together on timing. First, find the right contact. Many sites publish a security.txt file at /.well-known/security.txt (defined in RFC 9116) with an email address and policy link. Send a clear private report: what is affected, how to reproduce it, and the impact. Do not include more data than needed to prove the issue.\n\nThe owner confirms, fixes and releases a patch. A common deadline is 90 days, made popular by Google Project Zero, with extensions if the vendor is working in good faith. After the fix, a CVE ID may be assigned and details published. ISO/IEC 29147 and ISO/IEC 30111 describe the vendor side of this process.",
        visual: {
          type: "flow",
          title: "Coordinated disclosure, step by step",
          steps: [
            { label: "Find contact", detail: "security.txt, bounty page or vendor PSIRT" },
            { label: "Private report", detail: "Steps, impact, minimal evidence" },
            { label: "Vendor confirms", detail: "Acknowledges and plans a fix" },
            { label: "Fix released", detail: "Patch or config change ships" },
            { label: "Public advisory", detail: "Often with a CVE ID and credit" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Questions to ask before you touch any system",
        root: "Am I allowed to test this?",
        children: [
          { label: "Who owns it?", children: ["Is it really the client's?", "Or a third party's service?"] },
          { label: "Who signed?", children: ["Do they have authority?", "Is it in writing?"] },
          { label: "Is it in scope?", children: ["Named host, range or app", "Not on the excluded list"] },
          { label: "Is it allowed now?", children: ["Inside the test window", "Using allowed methods only"] },
        ],
      },
    ],
    examples: [
      {
        title: "A student finds a bug in the school portal",
        explanation: "Step 1: While checking grades, a student notices that changing a number in the URL shows another student's report. Step 2: The right move is to stop immediately. Viewing more records, even \"to check\", is unauthorised access to personal data. Step 3: Write down what happened and the URL pattern, without saving other people's data. Step 4: Report it privately to the IT department or the address in security.txt. Step 5: Do not post about it until the school has fixed it. The defender's fix is a server-side check that the logged-in student owns the requested report.",
      },
      {
        title: "Reading a bug bounty policy before testing",
        explanation: "Step 1: Open the program page and list the in-scope assets, for example app.example.com and the mobile API. Step 2: Note the exclusions, for example the marketing site and any third-party help desk. Step 3: Read the rules: often no denial of service, no social engineering, no automated scanning above a rate limit, and only test with your own accounts. Step 4: Check for a safe harbor statement. Step 5: Only then start, and keep notes with timestamps so you can show you stayed inside the rules.",
      },
    ],
    cheatSheet: [
      "No written permission from someone with authority means no testing",
      "Good intent is not a legal defence for unauthorised access",
      "Your permission covers named systems, dates and methods only",
      "A client cannot authorise you to test its SaaS or hosting providers",
      "Look for /.well-known/security.txt (RFC 9116) to find a security contact",
      "A common disclosure deadline is 90 days after the vendor is told",
      "Stop and report if you stumble on personal data; do not collect more",
    ],
    quiz: [
      {
        q: "What makes a penetration test legal?",
        options: ["Using only free tools", "Written authorization from someone with authority over the systems", "Not changing any data", "Telling the target afterwards"],
        answer: 1,
        why: "Authorization from the owner is what turns the same actions from a crime into a job.",
      },
      {
        q: "A client asks you to also test the email service they rent from a big SaaS company. What do you do?",
        options: ["Test it, the client pays for it", "Test it slowly so nobody notices", "Ask the client to sign a second letter", "Explain that only the SaaS provider can authorise testing of its platform"],
        answer: 3,
        why: "The client does not own the provider's infrastructure, so they cannot give permission for it.",
      },
      {
        q: "Where do many sites publish their security contact?",
        options: ["/.well-known/security.txt", "/robots.txt", "/admin/contact", "In the DNS MX record"],
        answer: 0,
        why: "RFC 9116 defines security.txt in the /.well-known/ path for exactly this purpose.",
      },
      {
        q: "What does a safe harbor statement in a bug bounty program usually promise?",
        options: ["A guaranteed payout", "That any testing method is allowed", "Not to take legal action against researchers who follow the rules", "That all assets are in scope"],
        answer: 2,
        why: "Safe harbor protects good-faith researchers who stay inside the published rules.",
      },
      {
        q: "During coordinated disclosure, when should full details go public?",
        options: ["Immediately, to warn users", "After the fix is available or the agreed deadline passes", "Never under any condition", "Before contacting the vendor"],
        answer: 1,
        why: "Waiting for a fix protects users, while a deadline stops vendors from ignoring reports.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the main computer misuse law in your country and write down, in your own words, what counts as unauthorised access.",
        hint: "Search for your country's name plus \"computer misuse law\" or \"cybercrime act\" and read the official text.",
        solution: "Example for the UK:\nLaw: Computer Misuse Act 1990, section 1.\nOffence: causing a computer to perform a function to secure access\nto a program or data, knowing that access is unauthorised.\nMeaning: logging in or reading data without permission is a crime,\neven if nothing is changed.",
      },
      {
        level: "medium",
        task: "Pick three real websites and check whether they publish /.well-known/security.txt. Note the contact and policy fields.",
        hint: "Just open the URL in your browser. Reading a public file is normal browsing, not testing.",
        solution: "curl -s https://www.google.com/.well-known/security.txt\n# Look for lines like:\n# Contact: mailto:... or https://...\n# Policy: ...\n# Expires: ...\n# If there is no file, look for a \"security\" or \"bug bounty\" page instead.",
      },
      {
        level: "hard",
        task: "Write a short private disclosure email for a made-up flaw: a lab app that shows other users' orders when the order ID in the URL changes.",
        hint: "Include: affected URL, steps, impact, minimal evidence, suggested fix, and your proposed timeline.",
        solution: "Subject: Security issue: order details visible to other users\nAffected: https://shop.example.test/orders/<id>\nSteps: log in as user A, open /orders/1002 (an order of user B).\nImpact: any user can read other customers' names and addresses.\nEvidence: one screenshot, personal data blurred. No data kept.\nFix: check on the server that the order belongs to the session user.\nTimeline: I will not share details for 90 days or until fixed.\nContact me with any questions.",
      },
    ],
    faq: [
      { q: "Is it illegal to scan a website with nmap without permission?", a: "It depends on the country and what you do, and the law is not always clear about scanning alone. Professionals avoid the question entirely: they only scan systems they own or have written permission to test." },
      { q: "Can I get in trouble for reporting a bug I found by accident?", a: "Usually not if you stopped at once, did not collect data, and reported privately. Going further to \"explore\" or demanding money for the details can turn a good deed into a crime or extortion." },
      { q: "What is the difference between responsible and coordinated disclosure?", a: "They mean almost the same thing. Coordinated disclosure is the newer term and stresses that finder and vendor agree on timing together." },
      { q: "Do I need a certification to do ethical hacking legally?", a: "No. Certifications show skill, but legality comes only from authorization. A certified tester without permission is still breaking the law." },
    ],
  },

  "eh-foundations/scope-roe": {
    plain: [
      "Before a test starts, the client and the tester write down two things. The scope says exactly what may be tested: these IP addresses, these domains, this app. The rules of engagement (often shortened to RoE) say how and when: test hours, forbidden techniques, who to call, and what to do if something breaks.",
      "Think of it like a map for a building inspector. The map shows which rooms to inspect and which rooms are private. The rules say the inspector may open doors but not knock down walls, and must call the manager if a pipe bursts.",
      "A good scope is precise. \"Our website\" is too vague. \"https://app.example.com and the API at api.example.com, IP range 203.0.113.0/28, excluding 203.0.113.5\" is clear. When in doubt, the tester asks and gets the answer in writing.",
      "The final piece is the signed authorization letter. It is your proof of permission. Keep a copy with you during the test, because if someone at the client spots your traffic and calls the police, this letter is what shows you are working legally.",
    ],
    deepDive: [
      {
        heading: "Writing a scope that leaves no gaps",
        body: "List every in-scope asset in a form a machine could check: full domain names, URLs, IP ranges in CIDR notation (for example 10.10.20.0/24), cloud account IDs, and app or API versions. Then list the out-of-scope assets explicitly, such as production databases, a payment provider, a partner's network, or a fragile legacy server.\n\nWatch out for wildcards. *.example.com might include a subdomain that points to a third-party service the client does not own. Agree how new discoveries are handled: the usual rule is that anything not listed is out of scope until the client confirms it in writing. Also ask which user accounts you will get and what test data you may create.",
        bullets: ["Use exact hostnames and CIDR ranges", "Write an explicit out-of-scope list", "Unlisted discoveries need written approval", "Agree on test accounts and test data"],
      },
      {
        heading: "Timing, contacts and stop conditions",
        body: "Rules of engagement set test windows, for example weekdays 09:00 to 17:00 in the client's time zone, and blackout periods such as month-end payroll. They list the tester's source IP addresses so the client's security team can recognise the traffic, and decide whether that team is told about the test at all.\n\nContacts matter most. You need a technical contact for questions and an emergency contact who answers the phone 24/7. Agree on stop conditions: if a system crashes, if you find signs that a real attacker is already inside, or if you find a critical issue, you pause and call. Critical findings are usually reported at once, not saved for the final report.",
        visual: {
          type: "flow",
          title: "When something goes wrong during a test",
          steps: [
            { label: "Notice the problem", detail: "Service down or signs of a real intruder" },
            { label: "Stop testing", detail: "Pause all tools at once" },
            { label: "Call emergency contact", detail: "Use the number in the RoE" },
            { label: "Record what happened", detail: "Time, command, target, result" },
            { label: "Resume only on approval", detail: "Written go-ahead from the client" },
          ],
        },
      },
      {
        heading: "Forbidden and restricted techniques",
        body: "Most RoE documents ban denial of service (anything meant to overload or crash a system), social engineering of staff unless explicitly ordered, physical entry, and changes to production data. Some allow techniques only with extra approval, such as password spraying against real accounts, which can lock users out.\n\nCloud providers add their own rules. AWS, Azure and Google Cloud do not require pre-approval for testing most of a customer's own resources, but their published policies still forbid things like DoS and stress testing and attacks on the provider's shared infrastructure. Read the current policy for each provider involved and reference it in the RoE.",
        bullets: ["No DoS or stress testing", "No social engineering unless ordered", "No changes to real production data", "Account lockout risks need sign-off", "Follow each cloud provider's testing policy"],
      },
      {
        heading: "The authorization letter",
        body: "The authorization letter (sometimes jokingly called the \"get out of jail\" letter) is a short, signed statement. It names the client company, the testing company and testers, the in-scope assets, the dates, and a 24/7 contact who can confirm the test is real. It must be signed by someone with authority over those assets, such as the CISO or CTO, not just the project manager who hired you.\n\nThe letter does not replace the full contract. The contract also covers liability, confidentiality, how findings and data are stored and destroyed, and payment. Testers must never start before both documents are signed, even when the client says \"go ahead, the paperwork is coming\".",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "From first call to first packet",
        actors: ["Client", "Tester", "Client SOC"],
        messages: [
          { from: 0, to: 1, label: "Request a test, share goals" },
          { from: 1, to: 0, label: "Draft scope and RoE" },
          { from: 0, to: 1, label: "Corrections, out-of-scope list" },
          { from: 0, to: 1, label: "Signed contract and letter" },
          { from: 1, to: 2, label: "Source IPs and test window" },
          { from: 1, to: 0, label: "Testing starts in the window" },
        ],
      },
    ],
    examples: [
      {
        title: "Turning a vague request into a scope",
        explanation: "The client says: \"Test our online shop.\" Step 1: Ask which hosts make up the shop. Answer: www.shop.example, api.shop.example and an admin panel at admin.shop.example. Step 2: Ask about hosting. The checkout uses a payment provider, so that goes on the out-of-scope list. Step 3: Ask for test accounts: one customer and one admin. Step 4: Agree on hours and an emergency phone number. Step 5: Write it in a scope file that tools can use, and get it signed.",
        code: {
          lang: "text",
          code: "# scope.txt (in scope, from the signed RoE)\nwww.shop.example\napi.shop.example\nadmin.shop.example\n203.0.113.16/29\n\n# out-of-scope.txt\npay.provider.example     # third-party payments\n203.0.113.20             # legacy server, too fragile\n\nWindow: Mon-Fri 09:00-17:00 UTC, 3-14 March\nEmergency: J. Lee, +44 20 7946 0000 (24/7)",
        },
      },
      {
        title: "A subdomain that turns out not to be the client's",
        explanation: "During recon you find help.shop.example. It is under the client's domain, so it looks in scope. Step 1: Resolve it and see that it points to a hosted help-desk SaaS company. Step 2: Stop. The client owns the name, but not the server behind it. Step 3: Note it as a finding for the client (for example, check that the DNS record is still needed) and ask in writing whether anything about it may be tested. Step 4: Do not test the SaaS platform itself; only its owner can allow that.",
      },
    ],
    cheatSheet: [
      "Scope = what you may test; RoE = how, when and with what limits",
      "Write targets as exact hostnames and CIDR ranges, plus an explicit exclusion list",
      "Anything not listed is out of scope until confirmed in writing",
      "Always have a 24/7 emergency contact and clear stop conditions",
      "Report critical findings immediately, not only in the final report",
      "Keep the signed authorization letter with you during the test",
      "Feed scope files to tools, for example nmap -iL scope.txt --excludefile out.txt",
    ],
    quiz: [
      {
        q: "Which scope entry is the most precise?",
        options: ["Our website", "Everything under example.com", "203.0.113.0/28 except 203.0.113.5", "All company servers"],
        answer: 2,
        why: "A CIDR range with an explicit exclusion leaves no doubt about which addresses may be tested.",
      },
      {
        q: "You find a host that looks related but is not on the scope list. What is the rule?",
        options: ["Treat it as out of scope until the client confirms in writing", "Test it lightly", "Test it if it uses the same domain", "Ignore it and do not mention it"],
        answer: 0,
        why: "Only written confirmation can add assets, but the discovery is still worth reporting.",
      },
      {
        q: "Why share your testing source IP addresses with the client?",
        options: ["To get faster internet", "So their security team can tell your traffic from a real attack", "Because nmap needs it", "To bypass their firewall"],
        answer: 1,
        why: "Known source IPs let defenders recognise test traffic and spot anything else as real.",
      },
      {
        q: "Who should sign the authorization letter?",
        options: ["Any employee of the client", "The tester's manager", "Nobody, an email is enough", "Someone with authority over the in-scope assets, such as the CISO"],
        answer: 3,
        why: "Permission is only valid when it comes from someone who controls the systems.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a scope section for your own home lab: list the in-scope VMs and the out-of-scope devices on your home network.",
        hint: "Use the host-only lab range for in scope; your router, phones and smart TV are out of scope.",
        solution: "In scope:\n  192.168.56.0/24 (VirtualBox host-only network)\n  Targets: 192.168.56.101 (Metasploitable), 192.168.56.102 (DVWA)\nOut of scope:\n  192.168.1.0/24 (home LAN: router, phones, TV)\n  192.168.56.1 (host adapter of my own PC)\nWindow: any time, lab only",
      },
      {
        level: "medium",
        task: "Draft a one-page rules of engagement for a made-up client web app, with timing, forbidden techniques, contacts and stop conditions.",
        hint: "Use four headings and keep each item to one line.",
        solution: "Timing: 3-14 March, Mon-Fri 09:00-17:00 UTC; no tests on 31 March.\nForbidden: DoS, social engineering, physical access, production data changes.\nRestricted: login brute force only on test accounts we provide.\nContacts: tech: a.khan@client.example; 24/7 emergency: +1 555 0100.\nStop conditions: service outage, evidence of a real intruder,\n  critical finding (call within 1 hour).\nData: no copies of customer data; evidence encrypted, deleted 90 days\n  after report.",
      },
      {
        level: "hard",
        task: "Make nmap refuse to touch excluded hosts by using scope files, and prove it with a list scan that sends no packets.",
        hint: "nmap -sL lists the targets it would scan without probing them.",
        solution: "printf '192.168.56.0/24\\n' > scope.txt\nprintf '192.168.56.1\\n192.168.56.100\\n' > out.txt\nnmap -sL -n -iL scope.txt --excludefile out.txt | grep -c 'Nmap scan report'\n# 254 instead of 256: the two excluded hosts are gone.\n# Network and broadcast addresses are still listed by -sL.\n# Use the same -iL / --excludefile flags on every real scan.",
      },
    ],
    faq: [
      { q: "What is the difference between scope and rules of engagement?", a: "Scope is the list of what you may test. Rules of engagement are the conditions: when, how, which techniques are forbidden, and who to contact." },
      { q: "Do I need permission from AWS or Azure to pentest my cloud app?", a: "For most services, no pre-approval is needed when you test your own resources, but each provider's published policy still applies and forbids things like DoS. Always check the current policy before you start." },
      { q: "Is an email saying \"go ahead\" enough authorization?", a: "It is risky. Use a signed letter and contract from someone with authority, listing assets and dates. An informal email can be disputed later." },
    ],
  },

  "eh-foundations/pentest-methodology": {
    plain: [
      "A penetration test is not random hacking until something breaks. It follows phases, like a doctor's check-up: first the paperwork, then gathering information, then careful tests, then a written result. Following phases means you do not skip anything and another tester could repeat your work.",
      "Many teams follow a published standard so everyone speaks the same language. PTES (Penetration Testing Execution Standard) describes the whole engagement. The OWASP Web Security Testing Guide, called WSTG, is a detailed checklist for web apps. NIST SP 800-115 is a US government guide for security testing.",
      "Tests also differ by how much you know before you start. In a black box test you get almost nothing, like an outside attacker. In a white box test you get source code, diagrams and accounts. A grey box test sits between, usually with a normal user login.",
      "The habit that separates good testers from average ones is note-taking. From the first minute, write down what you ran, when, against what, and what came back. The report is built from these notes, and clients will ask you to prove every claim.",
    ],
    deepDive: [
      {
        heading: "The seven PTES phases",
        body: "PTES splits a test into seven sections. Pre-engagement interactions cover scope, RoE and contracts. Intelligence gathering is recon. Threat modeling asks what the client's valuable assets are and who would attack them, which tells you where to focus. Vulnerability analysis finds weaknesses. Exploitation confirms them by actually using them, carefully and inside the rules. Post-exploitation asks how much an attacker could do from there, such as reaching sensitive data. Reporting turns everything into findings with fixes.\n\nIn practice the middle phases loop: a new finding during exploitation often sends you back to recon on a host you could not see before.",
        visual: {
          type: "cycle",
          title: "The testing loop inside an engagement",
          steps: [
            { label: "Gather information", detail: "Hosts, services, users, tech" },
            { label: "Find weaknesses", detail: "Versions, misconfigurations, logic flaws" },
            { label: "Confirm safely", detail: "Minimal proof, inside the RoE" },
            { label: "Assess new access", detail: "What can be reached from here?" },
          ],
        },
      },
      {
        heading: "Black, grey and white box trade-offs",
        body: "Black box feels realistic, but a real attacker has months while you have days. Much of a black box budget goes into discovery, so deep bugs may be missed. White box gives the best coverage for the money: with source code and configs you can find issues a scan never would, and confirm them faster. Grey box is the most common compromise for web apps: you get user accounts for each role, so you can test what logged-in users can do to each other.\n\nThe choice depends on the question the client is asking. \"Can an outsider get in?\" fits black box. \"Is this app secure before launch?\" fits grey or white box.",
        visual: {
          type: "compare",
          title: "How much the tester knows",
          columns: [
            { title: "Black box", points: ["No accounts or docs", "Simulates an outsider", "Time spent on discovery", "May miss deep bugs"] },
            { title: "Grey box", points: ["User accounts per role", "Some docs or diagrams", "Good for web apps", "Most common choice"] },
            { title: "White box", points: ["Source code and configs", "Best coverage per day", "Finds subtle logic bugs", "Needs code review skill"] },
          ],
        },
      },
      {
        heading: "Pentest, vulnerability scan and red team",
        body: "A vulnerability scan runs an automated tool that lists likely issues by version and configuration. It is fast and cheap but produces false positives and cannot judge business impact. A penetration test adds a human who confirms findings, chains small issues into bigger ones, and explains real risk. A red team exercise is goal-based and longer: it tests whether the defenders notice and respond, often with only a few people at the client knowing about it.\n\nThe OWASP WSTG fits mostly in the web part of a pentest. It groups tests by area with IDs like WSTG-ATHN (authentication) and WSTG-ATHZ (authorization), which makes it easy to show coverage in a report.",
      },
      {
        heading: "Notes and evidence from day one",
        body: "Keep one folder per engagement with subfolders for scans, screenshots and notes. Save raw tool output, for example nmap -oA, so you can prove what you ran. Log your terminal: the script command records a whole shell session to a file. Name screenshots with the date, host and finding.\n\nFor each finding, note the exact request or command, the time in UTC, the target, the result, and why it matters. Treat evidence as sensitive client data: store it encrypted, never in personal cloud drives, and delete it when the contract says so. Good notes also protect you: if the client sees an outage, your timestamps show whether your traffic was the cause.",
        bullets: ["One folder per engagement: scans, screenshots, notes", "Save raw output, not only summaries", "Record times in UTC", "Encrypt evidence and follow the retention rule"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Which standard covers what",
        layers: [
          { label: "PTES", detail: "The whole engagement, from contract to report" },
          { label: "NIST SP 800-115", detail: "Planning, discovery, attack, reporting" },
          { label: "OWASP WSTG", detail: "Detailed web app test cases by ID" },
          { label: "MITRE ATT&CK", detail: "Names attacker techniques for the report" },
        ],
      },
    ],
    examples: [
      {
        title: "Setting up an engagement folder",
        explanation: "Before the first scan, create a clean folder structure and start a logged shell. Step 1: make folders for scans, web, screenshots and notes. Step 2: start script so every command and its output is saved with a timestamp in the file name. Step 3: save every scan in all nmap formats with -oA. Step 4: when the test ends, exit the script session and archive the folder encrypted.",
        code: {
          lang: "bash",
          code: "ENG=~/engagements/2026-03-acme\nmkdir -p \"$ENG\"/{scans,web,screens,notes}\ncd \"$ENG\"\n# record the whole terminal session\nscript -a \"notes/session-$(date -u +%Y%m%dT%H%MZ).log\"\n# every scan is saved as .nmap, .gnmap and .xml\nnmap -sn -oA scans/discovery 192.168.56.0/24\nexit   # stops the recording",
        },
      },
      {
        title: "Choosing the test type for a client",
        explanation: "A startup will launch a new web app in four weeks and has five days of budget. Step 1: The question is \"is this app safe to launch?\", not \"can outsiders find us?\". Step 2: Black box would waste days on discovery of an app the client can simply describe. Step 3: Recommend grey box with a customer account, an admin account and the API documentation. Step 4: Use WSTG sections for authentication, authorization, input validation and business logic as the test plan, so the report can show exactly what was covered.",
      },
    ],
    cheatSheet: [
      "PTES phases: pre-engagement, intel, threat model, vuln analysis, exploitation, post-exploitation, reporting",
      "Black box = no info; grey box = user accounts; white box = code and configs",
      "Vulnerability scan lists likely issues; a pentest confirms and explains them",
      "OWASP WSTG IDs (for example WSTG-ATHN, WSTG-ATHZ) show web test coverage",
      "nmap -oA name saves normal, grepable and XML output at once",
      "script -a file.log records your whole terminal session",
      "Write times in UTC and keep evidence encrypted",
    ],
    quiz: [
      {
        q: "Which PTES phase decides which assets matter most and who would attack them?",
        options: ["Intelligence gathering", "Reporting", "Exploitation", "Threat modeling"],
        answer: 3,
        why: "Threat modeling focuses testing on the client's valuable assets and likely attackers.",
      },
      {
        q: "A client wants maximum coverage of a new app in a short time. Which test type fits best?",
        options: ["White or grey box", "Black box", "Red team", "Automated scan only"],
        answer: 0,
        why: "Giving the tester code or accounts removes discovery time and reaches deeper logic.",
      },
      {
        q: "What does a red team exercise mainly test that a normal pentest does not?",
        options: ["The speed of the web server", "Whether defenders detect and respond to a realistic attack", "Only the list of open ports", "The code style of developers"],
        answer: 1,
        why: "Red teams are goal-based and measure the blue team's detection and response.",
      },
      {
        q: "Why save raw tool output instead of only writing a summary?",
        options: ["It makes the report longer", "Clients prefer XML", "It proves exactly what you ran and saw, and when", "Tools require it"],
        answer: 2,
        why: "Raw output is evidence that supports each finding and protects you in disputes.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the PTES phases from memory, then add one example activity for each.",
        hint: "There are seven; the first one happens before any packet is sent.",
        solution: "1 Pre-engagement: sign scope and RoE\n2 Intelligence gathering: WHOIS, DNS, public docs\n3 Threat modeling: list crown jewels and likely attackers\n4 Vulnerability analysis: nmap -sV, review versions\n5 Exploitation: confirm one finding with minimal proof\n6 Post-exploitation: see what data is reachable\n7 Reporting: findings, risk ratings, fixes",
      },
      {
        level: "medium",
        task: "Open the OWASP WSTG and pick five test IDs you would use for a login page. Write one line on what each checks.",
        hint: "Look in the Authentication (ATHN) and Session Management (SESS) sections.",
        solution: "WSTG-ATHN-01: credentials sent over an encrypted channel\nWSTG-ATHN-02: default credentials\nWSTG-ATHN-03: weak lockout mechanism\nWSTG-SESS-02: cookie attributes (Secure, HttpOnly, SameSite)\nWSTG-SESS-06: logout really ends the session\n(IDs from WSTG v4.2; check the version you use.)",
      },
      {
        level: "hard",
        task: "Create a reusable shell function that starts a new engagement: folders, a notes file with a header, and a logged session.",
        hint: "Put it in ~/.bashrc and take the client name as an argument.",
        solution: "newengage() {\n  d=~/engagements/$(date -u +%F)-$1\n  mkdir -p \"$d\"/{scans,web,screens,notes} && cd \"$d\" || return\n  printf '# %s\\nStart: %s UTC\\nScope file: scope.txt\\n' \\\n    \"$1\" \"$(date -u +%FT%TZ)\" > notes/notes.md\n  script -a \"notes/session-$(date -u +%H%MZ).log\"\n}\n# usage: newengage acme",
      },
    ],
    faq: [
      { q: "What is the difference between a pentest and a vulnerability assessment?", a: "A vulnerability assessment finds and lists likely weaknesses, often with scanners. A pentest goes further: a human confirms them, shows real impact and chains issues together." },
      { q: "Is PTES still used?", a: "Yes, as a common reference for the phases, even though the site is not updated often. Many companies combine it with the OWASP WSTG for web apps and their own internal checklists." },
      { q: "What note-taking app do pentesters use?", a: "Popular choices are Obsidian, CherryTree, Joplin and plain Markdown files in a Git repo. The tool matters less than the habit: timestamps, exact commands and raw output for every finding." },
    ],
  },

  "eh-foundations/lab-setup": {
    plain: [
      "A lab is your private practice ground. It is made of virtual machines (VMs), which are whole computers running as programs inside your real computer. One VM is your attacker workstation, usually Kali Linux. The others are targets that were built to be broken.",
      "The most important rule is isolation. The deliberately vulnerable targets must never be reachable from your home network or the internet. Otherwise a stranger could break into them, or your tools could hit a real device by mistake. A host-only network solves this: VMs can talk to each other and to your PC, but nowhere else.",
      "VirtualBox is a free hypervisor (the program that runs VMs) for Windows, Linux and macOS on Intel. VMware Workstation Pro is now also free for personal use. Kali offers ready-made VM images, so you can import one instead of installing from scratch.",
      "Snapshots are save points. Take one when a VM is clean and working. After an exercise, or when you break something, restore the snapshot and you are back in a minute. This makes it safe to experiment.",
    ],
    deepDive: [
      {
        heading: "VirtualBox network modes compared",
        body: "Each VM network adapter has a mode, and the mode decides who it can reach. NAT gives the VM internet through your PC but other machines cannot reach it. Bridged puts the VM directly on your home network, like another laptop; never use it for vulnerable targets. Internal network connects only VMs that use the same network name, with no access to your PC. Host-only connects VMs and your PC on a private network, by default 192.168.56.0/24 with your PC at 192.168.56.1.\n\nA common safe design: targets get only a host-only adapter. Kali gets a host-only adapter for the lab and, when you need updates, a second NAT adapter that you can disconnect while you test.",
        visual: {
          type: "compare",
          title: "Which adapter mode for which VM",
          columns: [
            { title: "Host-only", points: ["VMs and your PC only", "No internet, no home LAN", "Use for all targets", "Use for Kali's lab side"] },
            { title: "NAT", points: ["VM reaches the internet", "Nobody can reach the VM", "Kali updates only", "Never on vulnerable targets"] },
            { title: "Bridged", points: ["VM joins your home LAN", "Visible to every device", "Not for this lab", "Risky with vulnerable VMs"] },
          ],
        },
      },
      {
        heading: "Sizing your host and your VMs",
        body: "Plan for at least 16 GB of RAM on the host if you want Kali and two targets running together, and a CPU with hardware virtualization (Intel VT-x or AMD-V) turned on in the BIOS or UEFI. Give Kali 2 CPUs and about 4 GB of RAM; small Linux targets often need only 512 MB to 1 GB. Leave 60 GB or more of free disk space, because snapshots grow over time.\n\nOn Windows, Hyper-V or other features such as Virtual Machine Platform can make VirtualBox slower, because both want the CPU's virtualization features. On Apple Silicon Macs, use ARM images with UTM or VMware Fusion, because most old vulnerable VMs are x86 and will not run natively.",
        bullets: ["Host: 16 GB RAM or more, VT-x or AMD-V enabled", "Kali: 2 vCPU, 4 GB RAM", "Small targets: 512 MB to 1 GB RAM", "60 GB or more free disk for VMs and snapshots"],
      },
      {
        heading: "Choosing deliberately vulnerable targets",
        body: "Good beginner targets are Metasploitable 2 (an old Ubuntu server full of vulnerable services, default login msfadmin/msfadmin), DVWA and OWASP Juice Shop for web practice, and machines from VulnHub, a library of downloadable practice VMs. Download only from the official project pages and check the checksum if one is given.\n\nThese machines are dangerous by design. Metasploitable's own documentation warns never to expose it to an untrusted network. Turn off shared folders, shared clipboard and drag-and-drop on targets, so nothing on the target can reach your host's files. Treat any VM from the internet as untrusted.",
      },
      {
        heading: "Proving the lab is really isolated",
        body: "Do not just trust the settings; test them. From each target, try to reach the internet and your home router. Both should fail. From Kali, a host discovery scan of the host-only range should only show your lab VMs and the host adapter at .1.\n\nAlso check your PC's side. The VirtualBox host-only adapter (vboxnet0 on Linux, \"VirtualBox Host-Only Ethernet Adapter\" on Windows) has an address on 192.168.56.0/24. Services you run on your PC that listen on all interfaces are reachable from the lab at 192.168.56.1, so treat that address as out of scope in your lab rules. Repeat the isolation check whenever you add a new VM.",
        visual: {
          type: "flow",
          title: "Isolation check for a new target VM",
          steps: [
            { label: "Adapter settings", detail: "Host-only only, no NAT or bridged" },
            { label: "Ping the internet", detail: "ping -c 2 8.8.8.8 must fail" },
            { label: "Ping home router", detail: "For example 192.168.1.1, must fail" },
            { label: "Scan from Kali", detail: "nmap -sn shows only lab hosts" },
            { label: "Take a snapshot", detail: "Name it clean-isolated" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A typical beginner lab",
        root: "Your PC (VirtualBox)",
        children: [
          { label: "NAT adapter", children: ["Kali only, for apt updates", "Disconnect while testing"] },
          { label: "Host-only 192.168.56.0/24", children: ["Host at 192.168.56.1", "Kali, for example .101", "Targets, for example .102 and .103"] },
          { label: "Targets", children: ["Metasploitable 2", "DVWA or Juice Shop VM", "VulnHub machines"] },
          { label: "Snapshots", children: ["clean after install", "before each exercise"] },
        ],
      },
    ],
    examples: [
      {
        title: "Create the lab network and attach VMs from the command line",
        explanation: "VBoxManage is VirtualBox's command-line tool. Step 1: create a host-only interface and give it an address (on Linux and Windows hosts). Step 2: attach the target's first adapter to it and remove any NAT. Step 3: give Kali a host-only adapter plus a NAT adapter for updates. Step 4: take a clean snapshot of each VM while it is powered off.",
        code: {
          lang: "bash",
          code: "VBoxManage hostonlyif create          # prints the name, e.g. vboxnet0\nVBoxManage hostonlyif ipconfig vboxnet0 --ip 192.168.56.1 --netmask 255.255.255.0\n\n# Target: host-only only\nVBoxManage modifyvm \"Metasploitable2\" --nic1 hostonly --hostonlyadapter1 vboxnet0\nVBoxManage modifyvm \"Metasploitable2\" --nic2 none\n\n# Kali: lab side plus NAT for updates\nVBoxManage modifyvm \"Kali\" --nic1 hostonly --hostonlyadapter1 vboxnet0\nVBoxManage modifyvm \"Kali\" --nic2 nat\n\nVBoxManage snapshot \"Metasploitable2\" take \"clean\" --description \"fresh import\"",
        },
      },
      {
        title: "Reset a target after a messy exercise",
        explanation: "You changed configs on a target while practising and now it behaves oddly. Step 1: power it off; VirtualBox restores snapshots only on a VM that is not running. Step 2: list the snapshots to find the right name. Step 3: restore the clean one and start it headless (without a window). The VM is back exactly as it was, ready for the next exercise.",
        code: {
          lang: "bash",
          code: "VBoxManage controlvm \"Metasploitable2\" poweroff\nVBoxManage snapshot \"Metasploitable2\" list\nVBoxManage snapshot \"Metasploitable2\" restore \"clean\"\nVBoxManage startvm \"Metasploitable2\" --type headless",
        },
      },
    ],
    cheatSheet: [
      "Targets: host-only adapter only; never bridged, never NAT",
      "VirtualBox host-only default: 192.168.56.0/24, host at .1",
      "Kali VM images use the login kali / kali; change it after import",
      "sudo apt update && sudo apt full-upgrade -y keeps Kali current",
      "Disable shared folders, clipboard and drag-and-drop on targets",
      "VBoxManage snapshot VM take NAME and VBoxManage snapshot VM restore NAME",
      "Test isolation from each target: ping 8.8.8.8 must fail",
    ],
    quiz: [
      {
        q: "Which network mode lets lab VMs talk to each other and to your PC, but not to the internet?",
        options: ["Bridged", "NAT", "Host-only", "NAT with port forwarding"],
        answer: 2,
        why: "Host-only creates a private network between the VMs and the host adapter only.",
      },
      {
        q: "Why should a vulnerable target never use a bridged adapter?",
        options: ["It would be reachable by every device on your home network", "It makes the VM slower", "Kali cannot scan bridged hosts", "Snapshots stop working"],
        answer: 0,
        why: "Bridged mode puts the VM on your real LAN, where others could attack it or it could reach real devices.",
      },
      {
        q: "Your target VM can ping 8.8.8.8. What does that tell you?",
        options: ["The lab is working correctly", "DNS is broken", "The host-only network is too small", "The target is not isolated and has a route to the internet"],
        answer: 3,
        why: "A truly isolated target has no path to the internet, so the ping must fail.",
      },
      {
        q: "What must you do before restoring a VirtualBox snapshot of a running VM?",
        options: ["Delete all other snapshots", "Power off the VM (or save its state)", "Remove the network adapter", "Reinstall Guest Additions"],
        answer: 1,
        why: "VirtualBox restores snapshots only on a VM that is not running.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Import the official Kali VirtualBox image, log in, change the default password and update the system.",
        hint: "The prebuilt image uses kali / kali; passwd changes it.",
        solution: "# In Kali after first login (user kali, password kali):\npasswd\nsudo apt update && sudo apt full-upgrade -y\nsudo reboot\n# Then take a snapshot named \"clean-updated\" in VirtualBox.",
      },
      {
        level: "medium",
        task: "Add Metasploitable 2 on the host-only network and find its IP from Kali without logging into it.",
        hint: "The VirtualBox DHCP server hands out addresses from .101 upwards by default; use host discovery.",
        solution: "ip -br addr           # find Kali's host-only interface, e.g. eth0 192.168.56.101\nsudo nmap -sn 192.168.56.0/24\n# Expect: .1 (host), .100 (DHCP server), Kali, and the new target\n# The new IP that was not there before is Metasploitable.",
      },
      {
        level: "hard",
        task: "Write an isolation test you can run inside any Linux target VM that prints PASS only if it cannot reach the internet or your home router.",
        hint: "Use ping with a short timeout and check the exit codes. Replace the router IP with yours.",
        solution: "#!/bin/sh\nfail=0\nfor ip in 8.8.8.8 1.1.1.1 192.168.1.1; do\n  if ping -c 1 -W 2 \"$ip\" >/dev/null 2>&1; then\n    echo \"REACHABLE: $ip\"; fail=1\n  fi\ndone\n[ \"$fail\" -eq 0 ] && echo PASS || echo FAIL",
      },
    ],
    faq: [
      { q: "Can I install Kali directly on my laptop instead of a VM?", a: "You can, but a VM is safer and easier for a lab: you can snapshot it, run targets next to it and keep your normal OS untouched. Many testers use a VM or WSL for daily work." },
      { q: "Do I need a powerful PC for a hacking lab?", a: "Not very. 16 GB of RAM and a CPU with virtualization support run Kali plus two small targets well. With 8 GB, run one target at a time." },
      { q: "Is it safe to download vulnerable VMs?", a: "Download only from official sources like the Metasploitable, OWASP or VulnHub pages, and keep them on a host-only network. Treat them as untrusted machines that should never touch your real network." },
      { q: "Does VirtualBox work on Apple Silicon Macs?", a: "VirtualBox now has an Apple Silicon version for ARM guests, but x86 practice VMs like Metasploitable 2 still will not run on it natively. Many Mac users run ARM Kali in UTM or VMware Fusion and use hosted platforms for x86 targets." },
    ],
  },

  "eh-foundations/practice-platforms": {
    plain: [
      "You do not have to build every target yourself. Practice platforms give you legal machines to attack. TryHackMe teaches step by step with guided rooms. Hack The Box offers harder, more open challenge machines. Both connect you to their private lab network over a VPN, or give you a ready attack machine in the browser.",
      "For web hacking you can run vulnerable apps on your own computer. OWASP Juice Shop is a modern online shop full of security bugs, with a hidden score board that tracks the challenges you solve. DVWA (Damn Vulnerable Web Application) is an older PHP app with clear lessons and a difficulty switch.",
      "The legal rule is simple: you may only attack the targets the platform gives you, during the time it gives you. The VPN connects you to a network with other players too. Attacking them, or the platform itself, breaks the rules and maybe the law.",
      "Each platform has its own rules on sharing answers. For example, Hack The Box allows public write-ups only for retired machines. Read the rules once, and you will avoid getting banned.",
    ],
    deepDive: [
      {
        heading: "How the VPN connection works",
        body: "TryHackMe and Hack The Box give you an OpenVPN configuration file (.ovpn) tied to your account. When you run it, your machine gets a new network interface, usually tun0, with an address inside the platform's lab range. Traffic to lab targets goes through the tunnel; your normal internet traffic does not.\n\nThis means your Kali VM is now on a network shared with other users. Keep your own services closed while connected: do not run a test web server on all interfaces or leave weak passwords on your VM. Disconnect the VPN when you are not practising. If you would rather not run a VPN at all, both platforms offer a browser-based attack machine (TryHackMe AttackBox, HTB Pwnbox), with limits on free use.",
        visual: {
          type: "sequence",
          title: "Connecting to a hosted lab",
          actors: ["Your Kali VM", "Platform VPN server", "Lab target"],
          messages: [
            { from: 0, to: 1, label: "sudo openvpn user.ovpn" },
            { from: 1, to: 0, label: "tun0 gets a lab IP address" },
            { from: 0, to: 2, label: "Scan and test the assigned target IP" },
            { from: 2, to: 0, label: "Responses through the tunnel" },
            { from: 0, to: 1, label: "Disconnect when finished" },
          ],
        },
      },
      {
        heading: "Running Juice Shop and DVWA locally",
        body: "Containers are the easiest way. Juice Shop has an official image: docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop, then open http://localhost:3000. DVWA ships a compose file in its GitHub repository; docker compose up -d starts it on http://localhost:4280. Log in with admin and password, then click Create / Reset Database on the setup page.\n\nNotice the 127.0.0.1 in the Juice Shop port mapping. Without it, Docker publishes the port on every interface, so anyone on your Wi-Fi could reach your deliberately vulnerable app. Binding to localhost keeps it private. The same lesson applies to real servers: publish only what must be public.",
        bullets: ["Juice Shop: port 3000, score board hidden in the app", "DVWA: port 4280 with the repo's compose file", "DVWA security levels: low, medium, high, impossible", "Bind to 127.0.0.1 so the LAN cannot reach it"],
      },
      {
        heading: "Learning from each difficulty level",
        body: "DVWA's security levels are a great way to learn defence as well as attack. On low, the code has no protection. On medium and high, the developers added partial fixes such as filtering certain characters, which teaches you why blocklists fail. The impossible level shows the correct fix, such as parameterised queries and anti-CSRF tokens. DVWA lets you view the source of each level, so compare them side by side.\n\nJuice Shop works differently: its challenges are rated by stars from 1 to 6 and cover the OWASP Top 10 and more. Its companion book, Pwning OWASP Juice Shop, explains each challenge and the matching fix.",
      },
      {
        heading: "Platform rules worth knowing",
        body: "All platforms forbid attacking their infrastructure, other users' machines and VPN connections, or anything that is not an assigned target. Most forbid sharing flags (the secret strings that prove you solved a challenge). Hack The Box allows public write-ups only after a machine retires. TryHackMe allows write-ups for many rooms but not for some, so check the room's notes.\n\nAutomated tools are allowed against your targets, but heavy brute force or huge scans can slow shared machines for others; be considerate. Finally, a platform account does not give you permission anywhere else. A technique you practised on HTB is still illegal against a real company without authorization.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A learning path across platforms",
        steps: [
          { label: "DVWA on low", detail: "See each bug with source code" },
          { label: "DVWA higher levels", detail: "Learn why partial fixes fail" },
          { label: "Juice Shop", detail: "Modern app, star-rated challenges" },
          { label: "TryHackMe rooms", detail: "Guided network and web labs" },
          { label: "HTB machines", detail: "Open-ended, less guidance" },
        ],
      },
    ],
    examples: [
      {
        title: "Start Juice Shop and find the score board",
        explanation: "Step 1: Run the official container bound to localhost. Step 2: Open http://localhost:3000 in your browser. Step 3: Finding the score board is the first challenge. Open your browser's developer tools and look in the main JavaScript file for route names; one of them leads to the score board page. Step 4: Once there, the score board lists all challenges with their difficulty. The defender lesson: hiding a page is not protecting it, because the client code reveals every route.",
        code: {
          lang: "bash",
          code: "docker run --rm -d --name juice -p 127.0.0.1:3000:3000 bkimminich/juice-shop\ncurl -s -o /dev/null -w '%{http_code}\\n' http://localhost:3000   # 200\n# stop it when done\ndocker stop juice",
        },
      },
      {
        title: "Connect to TryHackMe and check the route",
        explanation: "Step 1: Download your .ovpn file from your account's access page. Step 2: Start OpenVPN in Kali. Step 3: In a second terminal, check that tun0 exists and has an address. Step 4: Deploy a room's machine and note its IP. Step 5: Check that the route to that IP goes through tun0 before scanning it. If it does not, your traffic would go out of your normal internet connection to an address that is not your target.",
        code: {
          lang: "bash",
          code: "sudo openvpn ~/Downloads/yourname.ovpn\n# in another terminal:\nip -br addr show tun0\nip route get 10.10.123.45      # replace with your target IP\n# expect: ... dev tun0 ...\nping -c 2 10.10.123.45",
        },
      },
    ],
    cheatSheet: [
      "Only test the target IPs the platform assigns to you",
      "sudo openvpn file.ovpn connects; tun0 is the lab interface",
      "ip route get TARGET_IP should show dev tun0 before you scan",
      "docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop",
      "DVWA default login: admin / password, then Create / Reset Database",
      "HTB: public write-ups only for retired machines",
      "Disconnect the VPN when you stop practising",
    ],
    quiz: [
      {
        q: "Why bind Juice Shop to 127.0.0.1 instead of publishing the port on all interfaces?",
        options: ["It makes the app faster", "Juice Shop requires it", "So other devices on your network cannot reach the vulnerable app", "To enable HTTPS"],
        answer: 2,
        why: "A deliberately vulnerable app should only be reachable from your own machine.",
      },
      {
        q: "While on the HTB VPN, you see another player's IP in the same range. May you scan it?",
        options: ["No, only your assigned targets are allowed", "Yes, everyone on the VPN is fair game", "Yes, if you do not exploit it", "Only with a SYN scan"],
        answer: 0,
        why: "Platform rules allow attacks only on the machines they assign, never on other users.",
      },
      {
        q: "What does DVWA's impossible security level show you?",
        options: ["A version with every bug at once", "A broken install", "The admin panel", "The correctly fixed version of the code"],
        answer: 3,
        why: "Impossible demonstrates the proper defence, so you can compare it with the vulnerable levels.",
      },
      {
        q: "On Hack The Box, when may you publish a write-up for a machine?",
        options: ["Any time", "After the machine is retired", "Only on the first day", "Never"],
        answer: 1,
        why: "HTB forbids spoilers for active machines; retired ones may be written up.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run Juice Shop locally and prove it is not reachable from another device on your network.",
        hint: "Bind to 127.0.0.1, then try your PC's LAN IP from your phone's browser.",
        solution: "docker run --rm -d --name juice -p 127.0.0.1:3000:3000 bkimminich/juice-shop\nss -ltn | grep 3000      # shows 127.0.0.1:3000, not 0.0.0.0:3000\n# From your phone: http://<PC-LAN-IP>:3000 should fail to load.\ndocker stop juice",
      },
      {
        level: "medium",
        task: "Start DVWA with its official compose file, log in, reset the database and set the security level to low.",
        hint: "Clone the DVWA GitHub repository; the compose file is in its root.",
        solution: "git clone https://github.com/digininja/DVWA.git\ncd DVWA\ndocker compose up -d\n# Browse to http://localhost:4280, log in as admin / password\n# Click \"Create / Reset Database\", log in again\n# DVWA Security menu: choose Low, Submit",
      },
      {
        level: "hard",
        task: "Pick one DVWA module (for example SQL Injection) and compare the source of the low and impossible levels. Write down the exact change that fixes the bug.",
        hint: "Use the View Source button at the bottom of the module page.",
        solution: "Low level: the id from the request is put straight into the SQL\n  string, so input can change the query.\nImpossible level:\n  - checks an anti-CSRF token\n  - checks that id is numeric\n  - uses a PDO prepared statement with a bound parameter\n  - returns a result only if exactly one row comes back\nKey fix: the prepared statement keeps data separate from SQL code.",
      },
    ],
    faq: [
      { q: "TryHackMe or Hack The Box: which should a beginner start with?", a: "Most beginners start with TryHackMe because its rooms explain each step. Hack The Box suits people who want less guidance; its Academy and Starting Point offer a gentler path in." },
      { q: "Are TryHackMe and Hack The Box free?", a: "Both have free content. Paid plans unlock more machines, faster browser attack boxes and learning paths." },
      { q: "Is it legal to use Kali tools on these platforms?", a: "Yes, against the targets they assign you. The platforms give you permission for those machines only, under their terms of service." },
      { q: "Why does DVWA say the database is not set up?", a: "On first start you must click Create / Reset Database on the setup page. After that, log in again with admin and password." },
    ],
  },
};

export default extra;
