import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-threats/malware-types": {
    plain: [
      "Malware means malicious software: any program built to harm you, spy on you or take control of your computer. Security people sort malware into families by what it does, not by its name. Knowing the family tells you how it got in, what it wants and which defence stops it.",
      "Some malware spreads. A virus hides inside another file and runs when a person opens that file. A worm needs no help: it scans the network, finds machines with the same weakness and copies itself to them. Worms can infect thousands of machines in hours.",
      "Some malware hides. A trojan pretends to be something useful, like a free game or a cracked app. A RAT (remote access trojan) quietly gives the attacker remote control. An infostealer grabs saved passwords, browser cookies and crypto wallets, then sends them away within minutes.",
      "Ransomware locks your files with encryption and demands payment. Today most gangs also copy your data first and threaten to publish it, which is called double extortion. Fileless attacks avoid dropping a new program at all. They misuse tools already on the machine, such as PowerShell, so there is no strange file to scan.",
    ],
    deepDive: [
      {
        heading: "Viruses, worms and trojans: how each one spreads",
        body: "The key question is: what does the malware need to move? A virus needs a host file and a person to run it, so it spreads at human speed through shared files and USB sticks. Classic file-infecting viruses are rare today; macro malware inside Office documents is the modern cousin.\n\nA worm needs only a reachable, vulnerable service. WannaCry in 2017 used the EternalBlue exploit against SMBv1 (Windows file sharing, TCP port 445) and hit hundreds of thousands of machines in a few days, even though Microsoft had released the fix (MS17-010) two months earlier. A trojan needs trust: the user installs it on purpose because it looks legitimate.\n\nSo the defences differ. Patching and network segmentation slow worms. Application control and blocking macros from the internet stop many trojans and macro droppers. User awareness helps against all three.",
        bullets: [
          "Virus: host file plus user action",
          "Worm: vulnerable network service, no user needed",
          "Trojan: user trust, installed willingly",
          "Loader or dropper: small first stage that downloads the real payload",
        ],
      },
      {
        heading: "Modern ransomware is a business process",
        body: "Big ransomware attacks are not a single click. Operators buy or steal access (often from an initial access broker), spend days exploring the network, steal domain admin credentials, copy data out, delete backups and shadow copies, and only then start encryption, often at night or on a weekend. Many groups run as ransomware-as-a-service: developers write the malware and affiliates carry out the attacks for a share of the ransom.\n\nThis long middle phase is the defender's best chance. Signs include new admin accounts, remote tools like AnyDesk appearing, mass file access over SMB, large uploads to cloud storage, and commands like vssadmin delete shadows. Stopping the attack before encryption is far cheaper than recovering after it.\n\nBackups are the last line. Keep at least one copy offline or immutable (cannot be changed or deleted for a set time), and test restores regularly.",
        visual: {
          type: "flow",
          title: "Typical ransomware intrusion timeline",
          steps: [
            { label: "Initial access", detail: "Phishing, stolen VPN login or exposed service" },
            { label: "Discovery", detail: "Map hosts, shares and admins" },
            { label: "Credential theft", detail: "Reach domain admin" },
            { label: "Exfiltration", detail: "Copy data out for leverage" },
            { label: "Sabotage recovery", detail: "Delete backups and shadow copies" },
            { label: "Encrypt", detail: "Often at night, many hosts at once" },
          ],
        },
      },
      {
        heading: "Infostealers and RATs: the access economy",
        body: "Infostealers such as RedLine and Lumma are cheap, sold as a monthly service, and usually spread through fake software downloads, cracked games, malicious ads and fake browser updates. They run once, collect saved browser passwords, session cookies, crypto wallets and VPN or chat tokens, upload a small archive called a log, and often delete themselves. Those logs are sold on criminal markets.\n\nStolen session cookies are especially dangerous because they can let an attacker reuse a logged-in session and skip MFA. Many big breaches started with one infected personal laptop that held work logins.\n\nRATs are different: they stay. They give the attacker a remote shell, screen capture, keylogging and file transfer, and they phone home to a command and control (C2) server on a schedule. Look for regular outbound connections (beaconing) and unknown programs that start at boot.",
        bullets: [
          "After an infostealer: reset passwords and revoke all sessions, not just passwords",
          "Phishing-resistant MFA (passkeys, FIDO2 keys) blocks password replay",
          "Short session lifetimes limit the value of stolen cookies",
        ],
      },
      {
        heading: "Fileless and living off the land",
        body: "Living off the land (LotL) means using tools the operating system already trusts: PowerShell, WMI, rundll32, mshta, certutil, regsvr32 on Windows, or bash, curl and cron on Linux. The LOLBAS project documents which Windows binaries can be abused and how. Because these tools are signed by Microsoft, antivirus that only scans new files sees nothing wrong.\n\nFileless often means the payload lives in memory or in the registry instead of a file on disk. For example, a script downloads code and runs it directly in memory, and a registry Run key starts it again after reboot.\n\nDetection moves from files to behaviour. Turn on PowerShell Script Block Logging (event 4104), collect process creation with full command lines (Sysmon event 1 or Windows 4688), and alert on odd parent and child pairs, such as Word starting PowerShell. AMSI (Antimalware Scan Interface) lets security tools inspect scripts after they are decoded.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which defence fits which family",
        columns: [
          { title: "Worms and ransomware", points: ["Patch exposed services fast", "Segment the network", "Offline or immutable backups", "Alert on shadow copy deletion"] },
          { title: "Trojans and infostealers", points: ["Application control", "Block macros from the internet", "Phishing-resistant MFA", "Revoke sessions after infection"] },
          { title: "RATs and fileless", points: ["EDR behaviour detection", "Script block logging", "Watch parent and child processes", "Alert on beaconing to new domains"] },
        ],
      },
    ],
    examples: [
      {
        title: "Classify a sample from its behaviour report",
        explanation: "A sandbox report says the file arrived as setup.exe from a cracked software site. When run, it reads the Chrome and Edge password databases, zips them, sends one HTTPS upload to an unknown domain and deletes itself. It never scans the network and adds no startup entry. Step 1: no spreading, so it is not a worm or virus. Step 2: disguised as useful software, so it was delivered as a trojan. Step 3: one-time theft of credentials, so the family is infostealer. Step 4: the response is not just cleaning the laptop: reset every saved password, revoke active sessions and check sign-in logs for logins from new places.",
      },
      {
        title: "Spot a living-off-the-land chain in process logs",
        explanation: "A user opened an invoice document. Sysmon event 1 logs show WINWORD.EXE as the parent of powershell.exe, with an encoded command. Step 1: Word has no normal reason to start PowerShell, which is the first red flag. Step 2: decode the Base64 command (it is UTF-16LE text) in an isolated analysis VM to see what it downloads. Step 3: check event 4104 for the decoded script block. Step 4: look for persistence, such as a new Run key in Sysmon event 13. The query below finds the suspicious parent and child pair in a Splunk-style SIEM.",
        code: {
          lang: "spl",
          code: "index=sysmon EventCode=1\n  (ParentImage=\"*\\\\WINWORD.EXE\" OR ParentImage=\"*\\\\EXCEL.EXE\")\n  (Image=\"*\\\\powershell.exe\" OR Image=\"*\\\\cmd.exe\" OR Image=\"*\\\\mshta.exe\")\n| table _time host User ParentImage Image CommandLine",
        },
      },
    ],
    cheatSheet: [
      "Worm = spreads by itself over the network; virus = needs a host file and a user",
      "WannaCry (2017) spread through SMBv1 on TCP 445; the fix MS17-010 was already out",
      "Ransomware warning sign: vssadmin delete shadows or wbadmin delete catalog",
      "After an infostealer, revoke sessions and tokens as well as resetting passwords",
      "PowerShell Script Block Logging writes event 4104 with the decoded script",
      "Office app starting powershell.exe, cmd.exe or mshta.exe is a classic alert",
      "LOLBAS lists Windows binaries attackers abuse; GTFOBins does the same for Unix",
      "Keep one backup copy offline or immutable and test that it restores",
    ],
    quiz: [
      {
        q: "Malware infects a server and, with no user action, starts scanning other hosts on port 445 and copying itself. What is it?",
        options: ["A trojan", "A worm", "A virus", "An infostealer"],
        answer: 1,
        why: "Self-propagation over the network without user action is what defines a worm.",
      },
      {
        q: "Why do modern ransomware groups copy data out before encrypting it?",
        options: ["Encryption is faster on copied data", "To check the files are not already encrypted", "So they can threaten to leak it even if the victim restores from backup", "To make antivirus ignore the encryption"],
        answer: 2,
        why: "Double extortion keeps pressure on victims who have good backups.",
      },
      {
        q: "An infostealer took a user's browser cookies. Which response matters most beyond a password reset?",
        options: ["Revoke all active sessions and tokens for the account", "Reinstall the browser", "Change the user's username", "Disable the user's email signature"],
        answer: 0,
        why: "Stolen session cookies can stay valid after a password change, so sessions must be revoked.",
      },
      {
        q: "Why is fileless or living-off-the-land activity hard for traditional antivirus to catch?",
        options: ["It only runs on Linux", "It is always encrypted with TLS", "It deletes the antivirus first", "It uses trusted, signed system tools instead of a new malicious file"],
        answer: 3,
        why: "Scanning files finds nothing when the attacker runs legitimate tools like PowerShell.",
      },
      {
        q: "Which log source best helps detect fileless PowerShell attacks?",
        options: ["Firewall deny logs", "PowerShell Script Block Logging (event 4104)", "Printer logs", "DHCP leases"],
        answer: 1,
        why: "Event 4104 records the script content, even after it has been decoded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Sort these five into families: (a) spreads through an unpatched VPN service, (b) fake PDF reader that opens a remote shell, (c) encrypts shares and demands bitcoin, (d) uploads saved passwords once and deletes itself, (e) macro inside a Word file that runs when opened.",
        hint: "Ask: does it spread alone, does it disguise itself, what does it want?",
        solution: "a) worm\nb) trojan delivering a RAT\nc) ransomware\nd) infostealer\ne) macro virus or macro dropper (needs a user to open the file)",
      },
      {
        level: "medium",
        task: "Pick three living-off-the-land binaries from the LOLBAS project and, for each, write what attackers use it for and one detection idea.",
        hint: "Look at certutil, mshta and rundll32 pages and the parent process that would be unusual.",
        solution: "certutil.exe: downloads or decodes files (-urlcache, -decode).\n  Detect: certutil with -urlcache or a URL in the command line.\nmshta.exe: runs HTA or script from a URL.\n  Detect: mshta with http in the command line, or started by Office.\nrundll32.exe: runs code from a DLL.\n  Detect: rundll32 loading a DLL from a user-writable folder like AppData or Temp.",
      },
      {
        level: "hard",
        task: "Write a one-page ransomware readiness checklist for a small company that covers the stages before encryption, not just backups. Give at least two controls and one detection per stage.",
        hint: "Use the intrusion timeline: access, discovery, credentials, exfiltration, recovery sabotage, encryption.",
        solution: "Access: MFA on VPN and email, patch internet-facing systems. Detect: logins from new countries.\nDiscovery: limit admin tools to admins. Detect: AD enumeration tools, mass net commands.\nCredentials: LAPS for local admin, tiered admin accounts. Detect: LSASS access events.\nExfiltration: egress filtering, block unknown cloud storage. Detect: large uploads.\nRecovery sabotage: immutable backups, separate backup credentials. Detect: vssadmin delete.\nEncryption: EDR with ransomware protection. Detect: mass file renames.\nTest a full restore every quarter.",
      },
    ],
    faq: [
      { q: "Is a trojan the same as a virus?", a: "No. A virus copies itself into other files. A trojan does not copy itself; it tricks you into installing it by pretending to be useful software." },
      { q: "Should a company pay the ransom?", a: "Law enforcement agencies such as the FBI and CISA advise against paying, because payment does not guarantee working decryption or deleted data, and it funds more attacks. Some payments can also break sanctions law, so the decision involves legal counsel." },
      { q: "Can Macs and Linux machines get malware?", a: "Yes. There are infostealers for macOS, and Linux servers are common targets for cryptominers, botnets and ransomware aimed at virtualisation hosts. They are less often targeted than Windows desktops, but not immune." },
      { q: "Does antivirus still matter if attacks are fileless?", a: "Yes, it still blocks a lot of commodity malware. But you also need behaviour-based detection, such as EDR and good process and script logging, to catch attacks that use built-in tools." },
    ],
  },

  "sec-threats/social-engineering": {
    plain: [
      "Social engineering means tricking people instead of hacking machines. It is often easier to ask an employee for a password than to break the login system. Attackers play on normal human feelings: fear, hurry, helpfulness, curiosity and respect for the boss.",
      "Phishing is social engineering by message. Email is most common, but there are variants: smishing (text messages), vishing (voice calls) and quishing (a QR code that leads to a fake login page). Spear phishing is a phishing message written for one specific person, using details found online.",
      "Email was designed in a trusting time, so anyone can write any name in the From line. Three DNS-based checks help a mail server spot fakes. SPF lists which servers may send for a domain. DKIM adds a digital signature to each message. DMARC tells receivers what to do when those checks fail.",
      "Technology cannot stop everything, so people are the last filter. A good programme makes reporting easy (one button), thanks people who report, and never shames anyone who clicked. Fast reports let the security team remove the same email from every inbox before more people fall for it.",
    ],
    deepDive: [
      {
        heading: "Reading email headers in the right order",
        body: "Every mail server that handles a message adds a Received line at the top of the header. So you read Received lines from the bottom up: the lowest one is closest to the real sender, and the top one is your own mail server. Only the lines added by your own servers can be fully trusted; anything below them could be forged by the sender.\n\nThree addresses can differ. The From header is what the user sees. The Return-Path (envelope sender) is where bounces go, and SPF checks this domain. The Reply-To decides where replies go, and a Reply-To pointing to a free webmail address is a classic sign of business email compromise (BEC) fraud.\n\nYour own mail server writes an Authentication-Results header summarising the checks, for example spf=pass, dkim=pass header.d=example.com and dmarc=pass header.from=example.com. Start your analysis there.",
        bullets: [
          "Look for: display name says CEO but address is a random Gmail",
          "Look-alike domains: rn instead of m, or extra words like example-support.com",
          "Message-ID domain that does not match the sending service can be a hint",
        ],
      },
      {
        heading: "SPF, DKIM and DMARC: what each really checks",
        body: "SPF is a TXT record such as v=spf1 include:_spf.google.com -all. The receiver checks whether the connecting server's IP is allowed to send for the Return-Path domain. SPF breaks when mail is forwarded, and it allows at most 10 DNS lookups.\n\nDKIM signs chosen headers and the body with a private key. The receiver fetches the public key from DNS at selector._domainkey.domain and verifies the signature, so it proves the message was not changed and was signed by that domain (the d= tag). It survives forwarding.\n\nNeither checks the visible From address by itself. DMARC adds alignment: SPF or DKIM must pass for a domain that matches the From domain. The policy p=none only reports, p=quarantine sends failures to spam, and p=reject refuses them. Since 2024, Google and Yahoo require bulk senders to publish DMARC. Aim for p=reject once your reports show all legitimate senders pass.",
        visual: {
          type: "sequence",
          title: "How a receiving server checks one email",
          actors: ["Sending server", "Receiving server", "Sender's DNS"],
          messages: [
            { from: 0, to: 1, label: "Delivers mail, MAIL FROM bounce@ex.com" },
            { from: 1, to: 2, label: "Get SPF record for ex.com" },
            { from: 1, to: 2, label: "Get DKIM key for selector s1" },
            { from: 1, to: 2, label: "Get DMARC policy for From domain" },
            { from: 2, to: 1, label: "Policy p=reject, report address" },
            { from: 1, to: 0, label: "Aligned pass: accept; fail: apply policy" },
          ],
        },
      },
      {
        heading: "Inspecting links and attachments safely",
        body: "Never click a suspicious link on your work machine. First, copy it as text and defang it (hxxps://evil[.]com) so it cannot be clicked by accident in a ticket or chat. Look at the real domain, which is the part just before the first single slash. In https://login.microsoft.com.secure-check.net/ the real domain is secure-check.net.\n\nThen use tools that visit it for you, such as urlscan.io, which records the page, redirects and screenshot. For attachments, compute the hash (sha256sum on Linux, Get-FileHash in PowerShell) and look it up on VirusTotal. Be careful: uploading a file to a public service shares it with other users, so never upload documents that may contain company data. Use an internal or private sandbox for those.\n\nModern phishing often uses adversary-in-the-middle kits that proxy the real login page and steal the session cookie, defeating SMS and app-push MFA. Passkeys and FIDO2 keys resist this because they are bound to the real domain.",
      },
      {
        heading: "Designing awareness and reporting that work",
        body: "Annual slide shows change little. What works is short, frequent training tied to real attacks, plus simulated phishing used to teach rather than to punish. Track the report rate, not only the click rate: a programme where 60 percent of people report a test email is healthier than one with few clicks and few reports.\n\nMake reporting one click, with a Report button in the mail client that sends the full original message (with headers) to the security mailbox. Reply quickly to every report, even with an automated thank you, so people keep doing it.\n\nAdd process controls for the costliest scams. For payment changes, require a call-back to a known phone number, never the number in the email. For help desk password resets, verify identity strongly, because attackers now phone help desks pretending to be employees to get MFA reset.",
        bullets: [
          "Measure: report rate, time to first report, repeat clickers",
          "Tag external email with a banner",
          "Call-back rule for any change of bank details",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Social engineering channels",
        root: "Social engineering",
        children: [
          { label: "Email", children: ["Mass phishing", "Spear phishing", "Business email compromise"] },
          { label: "Phone and text", children: ["Vishing", "Smishing", "MFA fatigue push spam"] },
          { label: "Web", children: ["Fake login pages", "Malicious ads", "Fake browser updates"] },
          { label: "In person", children: ["Tailgating", "Dropped USB sticks", "Fake technician"] },
          { label: "QR codes", children: ["Quishing posters and emails"] },
        ],
      },
    ],
    examples: [
      {
        title: "Analyse a fake invoice email",
        explanation: "The email comes from billing@contoso-invoices.com, shown as Accounts, and asks you to pay an overdue invoice today. Step 1: red flags are urgency, an unexpected invoice and a domain that is not the supplier's real one. Step 2: in the headers, Authentication-Results shows spf=pass for contoso-invoices.com and dmarc=pass. That only proves the attacker owns that look-alike domain, not that it is the real supplier. Step 3: the link text says View invoice, but the URL goes to a newly registered domain. Step 4: check the domain age with whois and the page in urlscan.io. Step 5: report it, then search the mail gateway for the same sender and purge all copies.",
        code: {
          lang: "text",
          code: "Return-Path: <bounce@contoso-invoices.com>\nAuthentication-Results: mx.example.org;\n  spf=pass smtp.mailfrom=contoso-invoices.com;\n  dkim=pass header.d=contoso-invoices.com;\n  dmarc=pass header.from=contoso-invoices.com\nFrom: Accounts <billing@contoso-invoices.com>\nReply-To: payments.contoso@outlook.com\nSubject: URGENT: overdue invoice 4471",
        },
      },
      {
        title: "Check a domain's email protection",
        explanation: "Your manager asks whether attackers could spoof your company domain. Step 1: query the SPF record and check it ends in -all or ~all. Step 2: query the DMARC record at _dmarc.yourdomain. Step 3: if the policy is p=none, spoofed mail is only reported, not blocked. Step 4: read the aggregate reports (sent to the rua address) for a few weeks to find every real sender, fix them, then move to p=quarantine and finally p=reject.",
        code: {
          lang: "bash",
          code: "dig +short TXT example.com | grep spf1\n# \"v=spf1 include:_spf.google.com ~all\"\ndig +short TXT _dmarc.example.com\n# \"v=DMARC1; p=none; rua=mailto:dmarc@example.com\"\ndig +short TXT google._domainkey.example.com\n# DKIM public key for selector \"google\"",
        },
      },
    ],
    cheatSheet: [
      "Read Received headers from the bottom up; trust only lines your own servers added",
      "SPF checks the Return-Path domain, not the From address users see",
      "DMARC needs SPF or DKIM to pass for a domain aligned with the From domain",
      "DMARC policies: p=none (report), p=quarantine (spam), p=reject (refuse)",
      "Defang IOCs before sharing: hxxps://bad[.]example",
      "Real domain is the part just before the first single slash in a URL",
      "Never upload internal documents to public sandboxes; hashes are safe to look up",
      "Bank detail change by email? Call back on a known number, never the one in the email",
    ],
    quiz: [
      {
        q: "An email shows spf=pass, dkim=pass and dmarc=pass. What does that prove?",
        options: ["The email is safe to open", "The message really came from the domain in the From line, which may still be a look-alike", "The attachment has no malware", "The sender is a known business partner"],
        answer: 1,
        why: "Authentication proves domain ownership, and attackers can register and authenticate look-alike domains.",
      },
      {
        q: "Which header does SPF evaluate?",
        options: ["The visible From address", "The Subject line", "The Reply-To address", "The envelope sender (Return-Path) domain"],
        answer: 3,
        why: "SPF checks whether the sending IP is allowed for the MAIL FROM or Return-Path domain.",
      },
      {
        q: "What does a DMARC policy of p=none do with messages that fail?",
        options: ["Delivers them normally and only sends reports", "Rejects them", "Moves them to spam", "Deletes them silently"],
        answer: 0,
        why: "p=none is monitoring mode: receivers report failures but take no action.",
      },
      {
        q: "Which MFA type best resists phishing kits that proxy the real login page?",
        options: ["SMS codes", "Push notifications", "FIDO2 security keys or passkeys", "Email codes"],
        answer: 2,
        why: "FIDO2 credentials are bound to the real domain, so a proxy site cannot use them.",
      },
      {
        q: "Which metric best shows a healthy phishing awareness programme?",
        options: ["Number of slides in the training", "High report rate and fast first report", "Number of people disciplined", "Zero simulated phishing emails"],
        answer: 1,
        why: "Reports let the team respond quickly, so a high, fast report rate means users act as sensors.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the real domain in each URL: (a) https://paypal.com.account-verify.co/login (b) https://accounts.google.com/signin (c) https://microsoft-365.support/reset (d) https://www.amazon.com@evil.example/",
        hint: "Find the host part; text before an @ is a username, not the host.",
        solution: "a) account-verify.co\nb) google.com (real)\nc) microsoft-365.support (look-alike)\nd) evil.example (everything before @ is ignored as userinfo)",
      },
      {
        level: "medium",
        task: "Check the SPF and DMARC records of three domains you use (for example your university, a bank and a small shop). For each, say whether spoofing the From address would likely be blocked.",
        hint: "Use dig TXT domain and dig TXT _dmarc.domain, then read the p= value.",
        solution: "for d in example.edu examplebank.com smallshop.example; do\n  echo \"== $d\"\n  dig +short TXT $d | grep spf1\n  dig +short TXT _dmarc.$d\ndone\n# p=reject: spoofing likely blocked\n# p=quarantine: likely sent to spam\n# p=none or no record: spoofed mail may reach inboxes",
      },
      {
        level: "hard",
        task: "Write a phishing triage checklist for a SOC analyst that goes from a user report to closing the case, including how to find and remove other copies.",
        hint: "Cover headers, links, attachments, scope (who else got it), clicks, and containment.",
        solution: "1. Get the original .eml with full headers.\n2. Note sender, Return-Path, Reply-To, auth results.\n3. Defang and scan URLs in urlscan.io; hash attachments.\n4. Search the mail gateway for same sender, subject or URL.\n5. Purge all copies; block sender domain and URL.\n6. Check proxy and DNS logs for anyone who visited the URL.\n7. For visitors: check sign-ins, reset passwords, revoke sessions.\n8. Thank the reporter; record IOCs and close with a verdict.",
      },
    ],
    faq: [
      { q: "How can I see the full headers of an email?", a: "In Gmail, open the message, click the three-dot menu and choose Show original. In Outlook, open the message and use View message source or the message properties. Many tools also let you download the .eml file." },
      { q: "What is business email compromise?", a: "BEC is fraud where attackers pose as a boss, supplier or partner by email, often with no malware at all, to get a payment or data sent to them. It causes larger financial losses than most other cybercrime types." },
      { q: "I clicked a phishing link. What should I do?", a: "Report it right away, even if you think nothing happened. If you typed a password, change it and tell the security team so they can revoke your sessions and watch your account." },
      { q: "Is SPF alone enough to stop spoofing?", a: "No. SPF does not check the From address that users see. You need DMARC with an enforcing policy, backed by SPF and DKIM, to stop direct spoofing of your domain." },
    ],
  },

  "sec-threats/kill-chain": {
    plain: [
      "The Cyber Kill Chain is a model published by Lockheed Martin in 2011. It says an intrusion is not one event but a series of steps, and an attacker has to finish every step to succeed. The word comes from the military, where a kill chain is the sequence needed to hit a target.",
      "There are seven phases: Reconnaissance (research the target), Weaponization (build the malicious file or exploit), Delivery (send it), Exploitation (make it run), Installation (set up a lasting foothold), Command and Control (open a remote channel), and Actions on Objectives (steal, encrypt or destroy).",
      "The big idea for defenders is simple: if you break any link, the chain fails. You do not need to be perfect everywhere. Blocking the email, stopping the exploit, or catching the C2 traffic each ends the attack, and the earlier you stop it, the less damage there is.",
      "The model also helps you talk about an incident. Instead of saying we got hacked, you can say: delivery was by email, exploitation was a macro, and we caught it at command and control. That shows where controls worked and where they failed.",
    ],
    deepDive: [
      {
        heading: "The seven phases with real examples",
        body: "Reconnaissance: the attacker reads LinkedIn to find finance staff, scans for exposed VPNs, and collects email address formats. Weaponization: they pair a payload with a delivery file, such as a document with a macro or an ISO image containing a shortcut file. Defenders rarely see these first two phases because they happen on the attacker's side.\n\nDelivery: email attachment, link, USB stick, or a direct connection to an exposed service. Exploitation: the code runs, through a software bug or simply a user enabling content. Installation: the attacker adds persistence such as a scheduled task, a service or a web shell on a server. Command and Control (C2): the implant calls out over HTTPS or DNS to receive instructions. Actions on Objectives: data theft, encryption or sabotage.\n\nYou see more evidence in later phases, but each later phase also means more damage. Good programmes invest in early phases and still keep strong detection for later ones.",
      },
      {
        heading: "Courses of action: the defender's matrix",
        body: "The original paper paired each phase with six possible actions: detect, deny, disrupt, degrade, deceive and destroy. In practice most teams focus on the first four. Detect means you see it happen. Deny means you prevent it, for example blocking an attachment type. Disrupt means you break it in progress, such as EDR killing a process. Degrade means you slow it down or reduce its effect, such as rate limiting.\n\nFilling this grid for your organisation is a useful exercise. For each phase, list which control you have for each action. Empty cells are gaps. A phase with only detect and no deny means you will see the attack but must respond by hand, fast.\n\nDeceive is used by mature teams with honeypots and honey tokens: fake credentials or files that no real user touches, so any use is a high-confidence alert.",
        visual: {
          type: "compare",
          title: "Controls per phase (examples)",
          columns: [
            { title: "Delivery", points: ["Detect: mail gateway alerts", "Deny: block ISO and macro attachments", "Disrupt: URL rewriting and sandboxing"] },
            { title: "Installation", points: ["Detect: new service or Run key alerts", "Deny: application control", "Disrupt: EDR quarantines the file"] },
            { title: "Command and control", points: ["Detect: beaconing and new-domain DNS alerts", "Deny: egress firewall and proxy rules", "Degrade: DNS sinkhole for known C2"] },
          ],
        },
      },
      {
        heading: "Limits of the model, and what came after",
        body: "The kill chain was designed around malware breaking in from outside. It fits less well for insider threats, attacks using stolen valid accounts with no malware, or cloud attacks that never touch an endpoint. It also has one Actions on Objectives box for everything that happens after the foothold, while real intrusions spend most of their time there: discovery, privilege escalation and lateral movement.\n\nThat is why many teams now use MITRE ATT&CK for detail, which breaks the post-compromise stage into many tactics, and use the kill chain as a high-level story. The Unified Kill Chain, published by Paul Pols in 2017, combines both ideas into 18 phases grouped into getting in, spreading through the network, and acting on objectives.\n\nUse the kill chain for executive briefings and control planning, and ATT&CK for detection engineering.",
        bullets: [
          "Kill chain: 7 phases, good for strategy and storytelling",
          "ATT&CK: many tactics and techniques, good for detections",
          "Attackers can skip or repeat phases; the chain is not strictly linear",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "The seven phases with one control each",
        steps: [
          { label: "Reconnaissance", detail: "Reduce public exposure" },
          { label: "Weaponization", detail: "Threat intel on attacker tools" },
          { label: "Delivery", detail: "Mail and web filtering" },
          { label: "Exploitation", detail: "Patching and macro blocking" },
          { label: "Installation", detail: "EDR and application control" },
          { label: "Command and control", detail: "Egress filtering and DNS monitoring" },
          { label: "Actions on objectives", detail: "Least privilege and backups" },
        ],
      },
    ],
    examples: [
      {
        title: "Map a real-style phishing intrusion",
        explanation: "Incident summary: an attacker found the HR team on LinkedIn, sent a CV as a ZIP file containing a shortcut (.lnk) file, which ran PowerShell to download a loader. The loader added a scheduled task, beaconed to a domain every 60 seconds, and two days later uploaded payroll files. Mapping: LinkedIn research is Reconnaissance. Building the ZIP and LNK is Weaponization. The email is Delivery. The LNK running PowerShell is Exploitation (abusing user trust, not a software bug). The scheduled task is Installation. The 60-second beacon is Command and Control. The payroll upload is Actions on Objectives. Cheapest break point: blocking LNK files inside archives at the mail gateway.",
      },
      {
        title: "Find where a missed attack could have been stopped",
        explanation: "After an incident, run a short review per phase. Step 1: list the evidence you have for each phase (email logs, EDR events, proxy logs). Step 2: for each, ask whether a control existed and why it did not fire. Step 3: pick the earliest phase where a new control is cheap and reliable. In the example, the mail gateway allowed LNK inside ZIP (fix: block it), EDR saw the scheduled task but only logged it (fix: alert on schtasks created by PowerShell), and DNS logs showed regular beaconing nobody watched (fix: beaconing alert). Three fixes in three phases give defence in depth.",
      },
    ],
    cheatSheet: [
      "Order: Recon, Weaponization, Delivery, Exploitation, Installation, C2, Actions on Objectives",
      "Published by Lockheed Martin in 2011",
      "Break any one link and the intrusion fails",
      "Earlier breaks cost less damage; later phases leave more evidence",
      "Courses of action: detect, deny, disrupt, degrade, deceive, destroy",
      "Weak spots: insider threats, stolen valid accounts, cloud-only attacks",
      "Use the kill chain for strategy, ATT&CK for detection detail",
    ],
    quiz: [
      {
        q: "A user opens a document and enables macros, which runs the attacker's code. Which phase is this?",
        options: ["Delivery", "Installation", "Exploitation", "Reconnaissance"],
        answer: 2,
        why: "Exploitation is when the malicious code is triggered on the victim system.",
      },
      {
        q: "Which two phases do defenders usually have the least visibility into?",
        options: ["Reconnaissance and Weaponization", "Installation and C2", "Delivery and Exploitation", "C2 and Actions on Objectives"],
        answer: 0,
        why: "Weaponization happens on the attacker's own systems, and much recon is passive.",
      },
      {
        q: "An implant contacts a domain every 60 seconds for instructions. Which phase?",
        options: ["Weaponization", "Delivery", "Actions on Objectives", "Command and Control"],
        answer: 3,
        why: "Regular outbound check-ins for instructions are the C2 channel.",
      },
      {
        q: "Why is the kill chain often paired with MITRE ATT&CK?",
        options: ["The kill chain is newer", "ATT&CK details the post-compromise steps that the kill chain groups together", "ATT&CK only covers reconnaissance", "They are the same model with different names"],
        answer: 1,
        why: "ATT&CK breaks discovery, lateral movement and more into separate tactics and techniques.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Put these in kill chain order: scheduled task created, LinkedIn research, data uploaded, email sent, HTTPS beacon, macro runs, malicious document built.",
        hint: "There are seven items, one per phase.",
        solution: "1. LinkedIn research (Reconnaissance)\n2. Malicious document built (Weaponization)\n3. Email sent (Delivery)\n4. Macro runs (Exploitation)\n5. Scheduled task created (Installation)\n6. HTTPS beacon (Command and Control)\n7. Data uploaded (Actions on Objectives)",
      },
      {
        level: "medium",
        task: "For a small company with Microsoft 365 email and Windows laptops, name one detect and one deny control for Delivery, Installation and Command and Control.",
        hint: "Think mail filtering, endpoint controls and network egress.",
        solution: "Delivery: detect = alert on emails with archive attachments from new senders;\n  deny = block .iso, .lnk and macro files from the internet.\nInstallation: detect = alert on new scheduled tasks or Run keys;\n  deny = application control (WDAC or AppLocker) on user folders.\nC2: detect = alert on regular connections to newly registered domains;\n  deny = proxy or DNS filtering that blocks uncategorised domains.",
      },
      {
        level: "hard",
        task: "Take a public incident report (for example a CISA #StopRansomware advisory) and map every described step to a kill chain phase. Note which phases the report says nothing about and why.",
        hint: "Advisories usually list initial access methods, tools and impact; look for gaps.",
        solution: "Make a table: Step | Evidence in report | Phase.\nExample rows:\n  Exploited public VPN flaw | Initial access | Delivery + Exploitation\n  Installed remote tool | Persistence | Installation\n  Used Cobalt Strike beacons | C2 | Command and Control\n  Encrypted VMware hosts | Impact | Actions on Objectives\nGaps: Weaponization (happens off-site), Recon (rarely observed).\nNote that most activity falls in Actions on Objectives, showing the model's coarse end.",
      },
    ],
    faq: [
      { q: "Is the Cyber Kill Chain still used?", a: "Yes, mainly for high-level planning and explaining incidents to non-specialists. For detailed detection work most teams use MITRE ATT&CK alongside it." },
      { q: "Do attackers always follow the phases in order?", a: "Not strictly. They can skip phases, for example logging in with stolen credentials skips weaponization and exploitation, and they often loop back to discovery and lateral movement many times." },
      { q: "What is the difference between the kill chain and ATT&CK?", a: "The kill chain is a short linear model of an intrusion. ATT&CK is a large catalogue of specific techniques grouped by goal, with detection and mitigation advice for each." },
    ],
  },

  "sec-threats/mitre-attack": {
    plain: [
      "MITRE ATT&CK (Adversarial Tactics, Techniques and Common Knowledge) is a free, public catalogue of what real attackers do once they target a system. MITRE, a US non-profit, builds it from public incident reports. It is like a dictionary of attacker behaviour that every security team can share.",
      "It has three levels. A tactic is the attacker's goal at that moment, such as Persistence (staying on the machine) or Credential Access (stealing passwords). A technique is one way to reach that goal, such as Scheduled Task. A procedure is the exact way one specific group did it.",
      "Every technique has an ID. T1059 is Command and Scripting Interpreter, and T1059.001 is its sub-technique for PowerShell. Each page explains how the technique works, which groups use it, how to detect it and how to reduce the risk.",
      "Defenders use ATT&CK in three ways: to describe incidents with precise shared words, to check which techniques their tools can detect, and to choose which detections to build next. ATT&CK Navigator, a free web tool, lets you colour the matrix to show this coverage.",
    ],
    deepDive: [
      {
        heading: "How the matrix is organised",
        body: "ATT&CK has separate matrices for Enterprise (Windows, macOS, Linux, cloud, network devices and containers), Mobile and ICS (industrial control systems). Most SOC work uses Enterprise. Its columns are tactics in rough attack order, from Reconnaissance and Resource Development, through Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection and Command and Control, to Exfiltration and Impact.\n\nEach object has an ID with a prefix: TA for tactics (TA0003 Persistence), T for techniques (T1053 Scheduled Task/Job), a decimal for sub-techniques (T1053.005 Scheduled Task on Windows), G for groups (G0016 is APT29), S for software and M for mitigations (M1032 Multi-factor Authentication).\n\nOne technique can sit under several tactics. A scheduled task can be used for Execution, Persistence and Privilege Escalation, so it appears in all three columns. ATT&CK is updated about twice a year, so check the version you map against.",
        visual: {
          type: "layers",
          title: "From goal to exact behaviour",
          layers: [
            { label: "Tactic: TA0003 Persistence", detail: "Why: stay on the host after reboot" },
            { label: "Technique: T1053 Scheduled Task/Job", detail: "How, in general" },
            { label: "Sub-technique: T1053.005 Scheduled Task", detail: "How, on Windows specifically" },
            { label: "Procedure", detail: "schtasks /create /sc onlogon running a script in AppData" },
          ],
        },
      },
      {
        heading: "Reading a technique page for detection",
        body: "A technique page has a description, a list of procedure examples (which groups and malware used it, with links to reports), mitigations, and detection guidance. In recent versions, detection guidance is organised into detection strategies and analytics, which describe what to look for and which log sources hold the evidence, such as process creation, command line, file creation or network connection logs.\n\nTurn this into work. For T1053.005, the evidence includes schtasks.exe process creation with /create in the command line, Windows Security event 4698 (a scheduled task was created, if auditing is on), and new files under C:\\Windows\\System32\\Tasks. Then check: do you collect those logs? Is there a rule? Has anyone tested it?\n\nThe procedure examples are useful for prioritising. A technique used by many groups that target your industry deserves attention before an exotic one.",
        bullets: [
          "T1566 Phishing, T1078 Valid Accounts: common initial access",
          "T1059.001 PowerShell: very common execution",
          "T1003.001 LSASS Memory: credential dumping",
          "T1486 Data Encrypted for Impact: ransomware",
        ],
      },
      {
        heading: "Mapping an incident report correctly",
        body: "Mapping means tagging each observed behaviour with a technique. CISA and MITRE publish best practices, and a few rules prevent most mistakes. Map behaviour, not tools: Mimikatz is a tool, and what it did (for example LSASS memory access, T1003.001) is the technique. Use the most specific sub-technique the evidence supports, but do not guess one when the report is vague. Tag the tactic too, because the same technique can serve different goals.\n\nA practical method: read the report once for the story, then go sentence by sentence and highlight verbs that describe attacker actions (sent, ran, created, dumped, moved, uploaded). For each, search ATT&CK, pick the technique and note the evidence sentence beside it. Have a second person review, because mapping is a judgement call.\n\nThe result is a list you can compare with your detection coverage, or with other incidents to see patterns.",
      },
      {
        heading: "Coverage layers in ATT&CK Navigator",
        body: "Navigator is a web app (hosted by MITRE on GitHub Pages, or self-hosted) that displays the matrix and lets you create layers. A layer is a JSON file that stores a score, colour and comment for each technique. You can build one layer for techniques used by groups that target you, another for techniques your rules detect, and then combine them with a score expression to show the gaps.\n\nBe honest when scoring. A technique is not covered because one rule mentions it. Use levels such as: no data, data collected, rule exists, rule tested in the lab. Coverage of a broad technique is usually partial, because there are many procedures for it.\n\nLayers are easy to share and version in Git, which makes them good artefacts for a portfolio or a quarterly report.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Finding and closing a coverage gap",
        steps: [
          { label: "Threat layer", detail: "Techniques used by groups that target you" },
          { label: "Detection layer", detail: "Techniques your tested rules catch" },
          { label: "Compare", detail: "High threat, no detection = gap" },
          { label: "Build rule", detail: "Collect logs, write and test detection" },
          { label: "Update layer", detail: "Re-score and share" },
        ],
      },
    ],
    examples: [
      {
        title: "Map four sentences from an incident report",
        explanation: "Report text: The actor sent spearphishing emails with malicious Excel attachments. A macro launched PowerShell, which downloaded a payload. The payload created a registry Run key. The actor later dumped LSASS memory with a renamed copy of a dumping tool. Step 1: the email with an attachment is Initial Access, T1566.001 Spearphishing Attachment. Step 2: user opening it is T1204.002 User Execution: Malicious File, and PowerShell is Execution, T1059.001. Step 3: the Run key is Persistence, T1547.001 Registry Run Keys / Startup Folder. Step 4: LSASS dumping is Credential Access, T1003.001 LSASS Memory, and renaming the tool is Defense Evasion, T1036 Masquerading. Each tag keeps a link to its sentence as evidence.",
      },
      {
        title: "Build a tiny coverage layer",
        explanation: "You have tested detections for PowerShell and scheduled tasks, and only logs (no rule) for Run keys. Step 1: open Navigator, create a new Enterprise layer. Step 2: give tested techniques score 2, logs-only score 1. Step 3: set a colour gradient so 0 is red and 2 is green. Step 4: export the JSON and save it in Git. A trimmed layer file looks like the code below; Navigator can load it directly, though exported files contain more fields.",
        code: {
          lang: "json",
          code: "{\n  \"name\": \"Lab detection coverage\",\n  \"domain\": \"enterprise-attack\",\n  \"techniques\": [\n    { \"techniqueID\": \"T1059.001\", \"score\": 2, \"comment\": \"Rule tested\" },\n    { \"techniqueID\": \"T1053.005\", \"score\": 2, \"comment\": \"Rule tested\" },\n    { \"techniqueID\": \"T1547.001\", \"score\": 1, \"comment\": \"Logs only\" }\n  ]\n}",
        },
      },
    ],
    cheatSheet: [
      "Tactic = why (goal), technique = how, procedure = exactly how one group did it",
      "ID prefixes: TA tactic, T technique, T1234.001 sub-technique, G group, S software, M mitigation",
      "T1059.001 PowerShell, T1053.005 Scheduled Task, T1547.001 Run keys, T1003.001 LSASS",
      "Map behaviour, not tool names; keep the evidence sentence for every tag",
      "One technique can appear under several tactics",
      "Navigator layers are JSON: score, colour and comment per technique",
      "Score coverage honestly: no data, logs only, rule exists, rule tested",
    ],
    quiz: [
      {
        q: "In ATT&CK, what is Credential Access?",
        options: ["A technique", "A procedure", "A tactic", "A mitigation"],
        answer: 2,
        why: "Credential Access is a tactic, an attacker goal; techniques like LSASS dumping sit under it.",
      },
      {
        q: "A report says the attacker used Mimikatz. What is the best mapping practice?",
        options: ["Map the behaviour Mimikatz performed, such as T1003.001 LSASS Memory", "Map only the software entry and stop", "Skip it because tools are not in ATT&CK", "Map it to every credential technique to be safe"],
        answer: 0,
        why: "Mapping should describe the observed behaviour; tool names alone do not say what happened.",
      },
      {
        q: "What does the ID T1053.005 represent?",
        options: ["A tactic", "A threat group", "A mitigation", "A sub-technique of Scheduled Task/Job"],
        answer: 3,
        why: "The decimal suffix marks a sub-technique under technique T1053.",
      },
      {
        q: "Why should a coverage layer separate rule exists from rule tested?",
        options: ["Navigator requires it", "An untested rule may never fire on real activity", "Tested rules use less storage", "Only tested rules can be exported"],
        answer: 1,
        why: "Rules fail silently because of wrong fields or missing logs, so only testing proves coverage.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look up T1547.001 on attack.mitre.org. Write down its tactic or tactics, two procedure examples, and the log sources that would show it.",
        hint: "The tactic list is in the box on the right side of the page.",
        solution: "T1547.001 Registry Run Keys / Startup Folder\nTactics: Persistence, Privilege Escalation\nProcedures: many malware families and groups (list two from the page)\nEvidence: registry value set events (Sysmon 13),\nfile creation in Startup folders (Sysmon 11),\nprocess creation of programs started at logon.",
      },
      {
        level: "medium",
        task: "Map this paragraph to techniques: The attacker logged in to the VPN with stolen credentials, ran net group \"Domain Admins\" /domain, used RDP to reach a file server, compressed files with 7-Zip and uploaded them to a cloud storage site.",
        hint: "Five behaviours, five techniques; check Discovery and Exfiltration tactics.",
        solution: "VPN login with stolen creds: T1078 Valid Accounts (+ T1133 External Remote Services)\nnet group query: T1069.002 Permission Groups Discovery: Domain Groups\nRDP to file server: T1021.001 Remote Services: RDP\n7-Zip compression: T1560.001 Archive via Utility\nUpload to cloud storage: T1567.002 Exfiltration to Cloud Storage",
      },
      {
        level: "hard",
        task: "Pick one threat group on ATT&CK that targets your industry. Create a Navigator layer of its techniques, a second layer of your lab detections, and combine them to list the top five gaps.",
        hint: "Navigator can open a group's techniques from the group page; use the create layer from other layers option with a score expression.",
        solution: "1. Group page -> ATT&CK Navigator layer link -> score each technique 1.\n2. Your lab layer: score tested detections 1.\n3. Navigator: create layer from other layers, expression a - b\n   (a = group layer, b = your layer).\n4. Techniques with score 1 are used by the group but not detected.\n5. Rank them by how often they appear in reports and how cheap the logs are.\n6. Export all three layers as JSON into your portfolio repository.",
      },
    ],
    faq: [
      { q: "Is MITRE ATT&CK free to use?", a: "Yes. The content is free for any use, including commercial, under MITRE's terms of use. Navigator is also free and open source." },
      { q: "How is ATT&CK different from CVE?", a: "CVE lists specific software vulnerabilities, such as a bug in one product version. ATT&CK lists attacker behaviours, which stay similar even when the vulnerabilities used change." },
      { q: "Do I need to detect every ATT&CK technique?", a: "No, and nobody can. Prioritise techniques used by groups relevant to you and techniques that appear in many intrusions, and aim for tested, reliable detections on those." },
      { q: "What is MITRE D3FEND?", a: "D3FEND is a companion knowledge base from MITRE that catalogues defensive techniques and links them to the attacker techniques they counter." },
    ],
  },

  "sec-threats/threat-intel": {
    plain: [
      "Threat intelligence is useful knowledge about attackers: who they are, what they want, how they operate and what traces they leave. Raw data like a list of bad IP addresses is not yet intelligence. It becomes intelligence when someone adds context and it helps you make a decision.",
      "An indicator of compromise (IOC) is a clue that shows a system may be attacked, such as a file hash, an IP address, a domain name or a strange file path. IOCs are quick to search for, but attackers can change them easily. A new server gives a new IP in minutes.",
      "TTPs (tactics, techniques and procedures) describe how attackers behave, for example stealing passwords from memory or using scheduled tasks to stay on a machine. Behaviour is much harder for attackers to change, so detections built on behaviour keep working longer.",
      "In a SOC, intel is used every day. When an alert fires, analysts enrich it: they look up the IP or hash to see if others have reported it. When a government agency publishes an advisory, analysts search their logs for its indicators and check their detections against its techniques.",
    ],
    deepDive: [
      {
        heading: "Four kinds of intelligence, four audiences",
        body: "Strategic intelligence is for leaders: trends and risks, such as ransomware groups targeting hospitals this year. It informs budget and priorities. Operational intelligence describes specific campaigns: who is behind them, what they target and when. Tactical intelligence describes TTPs, which detection engineers and threat hunters use. Technical intelligence is the machine-readable layer: IOCs such as hashes, IPs, domains and URLs that go straight into blocklists and SIEM lookups.\n\nGood intel work follows a lifecycle: direction (what questions do we need answered?), collection, processing, analysis, dissemination to the right people, and feedback. Without direction, teams drown in feeds full of indicators that do not match their environment.\n\nWhen sharing intel, teams use the Traffic Light Protocol (TLP 2.0): TLP:RED (named recipients only), TLP:AMBER and TLP:AMBER+STRICT (your organisation, and its clients for AMBER), TLP:GREEN (your community) and TLP:CLEAR (public).",
        visual: {
          type: "cycle",
          title: "The intelligence lifecycle",
          steps: [
            { label: "Direction", detail: "Decide which questions matter" },
            { label: "Collection", detail: "Feeds, reports, own telemetry" },
            { label: "Processing", detail: "Normalise and remove duplicates" },
            { label: "Analysis", detail: "Add context, judge relevance" },
            { label: "Dissemination", detail: "Right format for each audience" },
            { label: "Feedback", detail: "Was it useful? Adjust" },
          ],
        },
      },
      {
        heading: "The Pyramid of Pain in practice",
        body: "David Bianco described the Pyramid of Pain in 2013. From the bottom: hash values, IP addresses, domain names, network and host artefacts, tools, and TTPs at the top. The higher you detect, the more it costs the attacker to avoid you.\n\nA hash changes if one byte of the file changes, so a hash blocklist catches only that exact file. IPs change when the attacker rents a new server, and many are shared, for example CDN or cloud addresses, so blocking them can hurt legitimate traffic. Domains cost a little money and time to replace. Artefacts such as a specific user agent string, named pipe or registry path take some rework. Tools take real development effort to replace. TTPs require the attacker to learn new ways of working.\n\nIOCs are still worth using: they are cheap, precise and great for quick retro hunts after an advisory. Just do not build your whole defence on them.",
      },
      {
        heading: "Enriching an IP or hash the right way",
        body: "Enrichment answers: is this indicator known, how bad is it, and is it relevant to us? For an IP, check reputation (AbuseIPDB, VirusTotal), ownership and network (whois or RDAP), whether it is internet background noise (GreyNoise tells you if an IP scans the whole internet), and passive DNS (which domains pointed to it over time). For a hash, check VirusTotal for detections, first-seen date and behaviour reports, and MalwareBazaar for the malware family.\n\nAlways read results critically. An IP flagged once two years ago may now belong to someone else. A cloud or CDN IP may host thousands of unrelated sites. A hash with zero detections might be new malware, not a safe file.\n\nLook up by hash, IP or domain rather than uploading files. Searching a hash reveals nothing, while uploading a sample makes it available to other users and can tip off an attacker who watches for their file.",
        visual: {
          type: "flow",
          title: "Enriching an alert IP",
          steps: [
            { label: "Extract IOC", detail: "IP from the alert" },
            { label: "Reputation", detail: "AbuseIPDB, VirusTotal" },
            { label: "Context", detail: "Owner, ASN, GreyNoise, passive DNS" },
            { label: "Internal check", detail: "Which other hosts talked to it?" },
            { label: "Verdict", detail: "Record evidence and confidence" },
          ],
        },
      },
      {
        heading: "Reading a public threat advisory",
        body: "Agencies like CISA (with partners such as the FBI and NCSC) publish advisories about active threats, including the #StopRansomware series. Most follow a pattern: a summary, technical details of how the actors operate, a table of ATT&CK techniques, IOCs (often also as STIX files you can import), detection ideas, and recommended mitigations.\n\nRead it with three questions. Does this actor target organisations like us? Which of its techniques could we detect today? Which mitigations do we already have? Then act: run a retro hunt for the IOCs over your log retention period, check the listed techniques against your coverage layer, and send leaders a short note on exposure.\n\nIOCs in advisories are often months old by the time they are published, so a hit may point to past activity. Behaviour sections usually give the longer-lasting value.",
        bullets: [
          "STIX 2.1 is the JSON format for intel; TAXII 2.1 is the protocol to share it",
          "MISP and OpenCTI are open-source platforms to store and share intel",
          "abuse.ch runs free feeds: URLhaus, MalwareBazaar, ThreatFox",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "IOCs versus TTPs",
        columns: [
          { title: "IOCs", points: ["Hashes, IPs, domains, URLs", "Easy to search and block", "Easy for attackers to change", "Expire quickly", "Great for retro hunts"] },
          { title: "TTPs", points: ["Behaviour like LSASS dumping", "Need good logs and tuning", "Hard for attackers to change", "Stay useful for years", "Great for durable detections"] },
        ],
      },
    ],
    examples: [
      {
        title: "Enrich an outbound connection alert",
        explanation: "An alert says a laptop connected to 203.0.113.50 on port 443. Step 1: look up the IP on AbuseIPDB and VirusTotal: several recent reports of C2 activity. Step 2: whois shows a small hosting provider, not a CDN, so blocking is low risk. Step 3: passive DNS shows a domain registered last week pointing to it. Step 4: search your proxy and firewall logs for other hosts contacting that IP or domain in the last 30 days. Step 5: one more host appears. Verdict: likely true positive, escalate both hosts, block the IP and domain, and record the evidence with timestamps in the ticket.",
      },
      {
        title: "Retro hunt hashes from an advisory",
        explanation: "An advisory lists SHA-256 hashes for a loader. Step 1: put the hashes in a lookup file in your SIEM. Step 2: search process creation events (Sysmon event 1 includes hashes when configured) across your retention period. Step 3: any match is a host to investigate, even if the file was later deleted. Step 4: because hashes are fragile, also check the advisory's techniques, such as rundll32 loading a DLL from a user folder, and search for that behaviour. On a single Linux host, you can do a quick check for one hash with standard tools, shown below.",
        code: {
          lang: "bash",
          code: "# advisory_hashes.txt: one SHA-256 per line, lowercase\nfind /home /tmp -type f -size -50M -print0 \\\n  | xargs -0 sha256sum 2>/dev/null \\\n  | grep -F -f advisory_hashes.txt",
        },
      },
    ],
    cheatSheet: [
      "Pyramid of Pain, bottom to top: hashes, IPs, domains, artefacts, tools, TTPs",
      "IOC = observable clue; TTP = behaviour; detect TTPs for durable coverage",
      "Search hashes, do not upload internal files to public sandboxes",
      "GreyNoise tells you if an IP is internet-wide scanning noise",
      "TLP 2.0 labels: RED, AMBER+STRICT, AMBER, GREEN, CLEAR",
      "STIX 2.1 = intel data format; TAXII 2.1 = sharing protocol",
      "After an advisory: retro hunt IOCs, check ATT&CK techniques, brief leaders",
      "IOCs age fast; record first-seen and last-seen dates",
    ],
    quiz: [
      {
        q: "Which indicator is lowest on the Pyramid of Pain (easiest for an attacker to change)?",
        options: ["TTPs", "Tools", "Domain names", "File hashes"],
        answer: 3,
        why: "Changing one byte of a file gives a new hash, so hashes cost the attacker almost nothing to change.",
      },
      {
        q: "An alert IP belongs to a large CDN and appears in one old abuse report. What is the best interpretation?",
        options: ["Weak evidence, since CDN IPs are shared by many unrelated sites", "Definitely malicious, block the whole CDN", "Proof the laptop is compromised", "The CDN itself is the attacker"],
        answer: 0,
        why: "Shared infrastructure and old reports make IP reputation unreliable on its own.",
      },
      {
        q: "Why look up a hash instead of uploading the file to a public sandbox?",
        options: ["Uploads are always slower", "Hash lookups give better malware names", "Uploading shares the file with others and can expose data or alert the attacker", "Sandboxes cannot read executables"],
        answer: 2,
        why: "Public uploads are visible to other users, so sensitive or targeted files should stay private.",
      },
      {
        q: "Which audience is strategic threat intelligence written for?",
        options: ["Firewall rules", "Executives and decision makers", "Detection engineers writing Sigma rules", "Malware reverse engineers"],
        answer: 1,
        why: "Strategic intel describes trends and risk to guide priorities and budget.",
      },
      {
        q: "What does TLP:CLEAR mean on a shared report?",
        options: ["Named recipients only", "Your organisation only", "Your sector community only", "It can be shared publicly"],
        answer: 3,
        why: "TLP:CLEAR, which replaced TLP:WHITE in TLP 2.0, has no sharing limits.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Classify each as IOC or TTP and place it on the Pyramid of Pain: (a) 45.33.32.156 (b) a SHA-256 hash (c) evil-update[.]com (d) dumping LSASS with a renamed tool (e) a unique user agent string.",
        hint: "Behaviour is a TTP; observable values are IOCs.",
        solution: "a) IOC, IP address (low)\nb) IOC, hash value (lowest)\nc) IOC, domain name (low-middle)\nd) TTP (top)\ne) IOC, network artefact (middle)",
      },
      {
        level: "medium",
        task: "Pick a recent CISA advisory. Write a five-line summary for your manager: who, what they target, top three techniques, whether you are exposed, and one action.",
        hint: "Use the summary, the ATT&CK table and the mitigations section.",
        solution: "Template:\n1. Actor: [name], financially motivated ransomware affiliate.\n2. Targets: [sectors]; we are in scope because [reason].\n3. Top techniques: T1133 VPN access, T1003.001 LSASS, T1486 encryption.\n4. Exposure: VPN has MFA; LSASS detection tested; backups immutable.\n5. Action: retro hunt advisory IOCs over 90 days by Friday.",
      },
      {
        level: "hard",
        task: "Write a small script that reads IPs from a file and prints which ones appear in a local blocklist file, with a count of total matches. Then explain two reasons a match may be a false positive.",
        hint: "Use sets for fast lookups; strip whitespace and skip comments.",
        solution: "def load(path):\n    with open(path) as f:\n        return {l.strip() for l in f if l.strip() and not l.startswith('#')}\nseen = load('alert_ips.txt')\nbad = load('blocklist.txt')\nhits = sorted(seen & bad)\nfor ip in hits:\n    print('MATCH', ip)\nprint(len(hits), 'matches')\n# False positives: shared CDN or cloud IPs; stale entries for reassigned IPs.",
      },
    ],
    faq: [
      { q: "Where can I get free threat intelligence?", a: "Good free sources include CISA advisories, abuse.ch feeds (URLhaus, MalwareBazaar, ThreatFox), AlienVault OTX, and vendor threat research blogs. Pick a few that match your environment rather than importing everything." },
      { q: "What is the difference between an IOC and an IOA?", a: "An indicator of compromise is evidence that something bad already happened, such as a known malware hash. An indicator of attack describes behaviour in progress, such as a process reading LSASS memory, and is closer to a TTP." },
      { q: "Should I block every IP on a threat feed?", a: "No. Feeds contain old and shared addresses, and blind blocking can break legitimate services. Use feeds to enrich and alert first, and block only high-confidence, recent indicators." },
    ],
  },
};

export default extra;
