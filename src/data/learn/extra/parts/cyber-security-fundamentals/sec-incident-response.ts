import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-incident-response/ir-lifecycle": {
    plain: [
      "An incident is a security event that actually causes harm, or clearly threatens to: a hacked account, ransomware on a server, customer data posted online. Incident response (IR) is the plan for handling it, so people know what to do instead of panicking.",
      "Most teams follow the lifecycle from NIST, the US standards body: prepare, detect and analyse, contain, eradicate and recover, then learn lessons. It is a loop, because every incident teaches you how to prepare better for the next one.",
      "Not every incident is equally serious. A severity scale, often from SEV1 (worst) to SEV4, decides how fast you move, who gets woken up at night and who must be told. One infected laptop is not the same as every server being encrypted.",
      "People matter as much as tools. An incident needs one person in charge, the incident commander, plus people to investigate, to fix systems, to take notes and to talk to everyone else. Agreeing on these roles before an incident saves hours during one.",
    ],
    deepDive: [
      {
        heading: "The NIST phases in practice",
        body: "NIST Special Publication 800-61 Revision 2 describes four phases. Preparation: the plan, contact lists, tools, logging, training and practice. Detection and analysis: noticing signs, confirming that an incident is real, judging its scope and severity, and starting the written record. Containment, eradication and recovery: stopping the spread, removing the attacker and safely returning systems to service. Post-incident activity: the lessons-learned meeting and the follow-up fixes.\n\nIn real life the phases overlap. You keep analysing while you contain, and you may find a new infected host during recovery and step back. In April 2025 NIST published Revision 3, which ties incident response to the six functions of its Cybersecurity Framework 2.0 instead of a separate cycle. The four phases remain the common language in plans, interviews and exams. SANS teaches a similar six-step version: preparation, identification, containment, eradication, recovery and lessons learned.",
      },
      {
        heading: "Defining severity levels",
        body: "A severity level is a shared shortcut that tells everyone how serious an incident is and what that means for the response. Base it on a few clear questions: how badly are business operations affected, what data is involved and how much, how many systems or users are hit, is the attacker still active, and is there legal or regulatory exposure?\n\nEach level should come with concrete rules: how quickly someone must respond, who is paged, how often updates go out, and when executives, legal or the privacy officer must be told. Severity can go up or down as you learn more. Raising it early is better than discovering on day three that you should have called legal on day one.",
        visual: {
          type: "layers",
          title: "An example severity scale",
          layers: [
            { label: "SEV1 Critical", detail: "Widespread outage or confirmed data theft; all hands, execs told now" },
            { label: "SEV2 High", detail: "Active compromise of key systems or privileged accounts" },
            { label: "SEV3 Medium", detail: "Contained compromise of one host or user" },
            { label: "SEV4 Low", detail: "Minor policy breach or blocked attempt; normal hours" },
          ],
        },
      },
      {
        heading: "What goes into an IR plan",
        body: "An IR plan does not need to be long. It needs to be findable, current and practised. A good outline covers: purpose and scope (which systems, which teams); definitions of event, incident and each severity level; roles and an up-to-date contact list with backups for each person; how to declare an incident and where the team meets; the phases and who decides what in each, including who may shut down a production system; communication rules for staff, customers, regulators and the press; and external contacts such as an incident response retainer firm, the cyber insurer and law enforcement.\n\nAdd legal duties. Under GDPR, for example, a personal data breach must normally be reported to the supervisory authority within 72 hours of becoming aware of it. Keep a printed or offline copy, because during ransomware the wiki may be encrypted too.",
        bullets: ["Scope, definitions and severity levels", "Roles, contacts and backups", "Declaring an incident and the war room", "Decision rights, including shutting systems down", "Communication and legal deadlines"],
      },
      {
        heading: "Roles in the IR team",
        body: "The incident commander coordinates: sets priorities, makes or escalates decisions and keeps everyone working on the same plan. They should not also be the main hands-on investigator, because nobody can do both well under pressure. A technical lead directs the investigation. Analysts and responders collect evidence and hunt. IT and operations make changes such as isolating hosts or resetting accounts. A scribe records decisions and times. A communications lead handles updates for leaders, staff and outsiders.\n\nOther people join when needed: legal and privacy for notification duties, HR when an employee is involved, an executive sponsor for big business decisions such as taking a service offline, and outside experts from a retainer firm. Work in a dedicated channel, and switch to an out-of-band one, such as phones or a separate chat tool, if company email or chat may be compromised.",
      },
      {
        heading: "Practising with tabletop exercises",
        body: "A plan nobody has practised will fail in small, painful ways: an old phone number, a missing admin password, nobody sure who can approve shutting down the website. A tabletop exercise finds these gaps safely. The team sits together for one or two hours while a facilitator describes a realistic scenario and adds new facts, called injects, over time: \"The attacker has posted a sample of customer data\" or \"The CEO is on a plane\".\n\nAt each step the team says what they would do and who would do it. Nothing is touched for real. Afterwards, list every gap found and fix it like any other lesson learned. Run a tabletop at least once a year and after big changes, and add technical drills such as restoring a server from backup.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Who does what in an incident",
        root: "Incident commander",
        children: [
          { label: "Technical lead", children: ["Analysts and hunters", "Forensics"] },
          { label: "IT and operations", children: ["Isolate hosts", "Reset accounts", "Restore systems"] },
          { label: "Scribe", children: ["Timeline of actions", "Decision log"] },
          { label: "Communications lead", children: ["Executives", "Staff", "Customers and press"] },
          { label: "Advisers", children: ["Legal and privacy", "HR", "Retainer firm", "Insurer"] },
        ],
      },
      {
        type: "flow",
        title: "The first hour after declaring a SEV1",
        steps: [
          { label: "Declare", detail: "Name the incident commander and severity" },
          { label: "Assemble", detail: "Open the channel, page the roles" },
          { label: "Assess", detail: "What do we know, what is at risk" },
          { label: "First containment", detail: "Stop the obvious spread" },
          { label: "First update", detail: "Brief leaders, set the next update time" },
        ],
      },
    ],
    examples: [
      {
        title: "A ransomware case through the lifecycle",
        explanation: "Preparation: the company had offline backups, EDR on all servers and a tested IR plan. Detection and analysis: at 02:10 UTC the EDR alerts on mass file renames on a file server; the on-call analyst confirms encrypted files and a ransom note and declares a SEV1. Containment: the EDR isolates the file server and two other hosts showing the same process; the attacker's admin account is disabled and its sessions revoked. Eradication: responders find a scheduled task and a remote access tool, remove them, and reset all admin passwords. Recovery: the file server is rebuilt and data restored from backups taken before the first attacker activity. Lessons learned: the entry point was an unpatched VPN appliance, so patching of edge devices gets a 72-hour target.",
      },
      {
        title: "Choosing severity for two incidents",
        explanation: "Incident A: one employee clicked a phishing link, but the proxy blocked the page and no password was entered. Impact is minimal and nothing spread, so it is SEV4: handled in normal hours with a short note. Incident B: an attacker logged into a domain administrator account from an unknown IP and created a new account on a domain controller. They control identity for the whole company and are active now, so it is SEV1: page the incident commander, legal and executives immediately, and update leaders every hour. Same team, same process, very different speed.",
      },
    ],
    cheatSheet: [
      "NIST 800-61r2: Preparation; Detection and Analysis; Containment, Eradication, Recovery; Post-Incident",
      "SANS PICERL: Preparation, Identification, Containment, Eradication, Recovery, Lessons learned",
      "Event = something observable; incident = an event that harms or threatens security",
      "Severity sets speed, who is paged, how often updates go out and who must be told",
      "One incident commander coordinates; they should not be the main hands-on investigator",
      "Keep an offline copy of the IR plan and contact list",
      "GDPR: notify the supervisory authority within 72 hours of becoming aware of a breach",
      "Run a tabletop exercise at least once a year and after big changes",
    ],
    quiz: [
      {
        q: "In NIST SP 800-61 Rev. 2, which phase includes confirming an incident and judging its scope?",
        options: ["Preparation", "Detection and Analysis", "Post-Incident Activity", "Recovery"],
        answer: 1,
        why: "Detection and Analysis covers spotting signs, confirming the incident and assessing scope and severity.",
      },
      {
        q: "What is the main job of the incident commander?",
        options: ["Reverse engineering the malware", "Writing the press release", "Restoring backups", "Coordinating the response and making decisions, not doing all the hands-on work"],
        answer: 3,
        why: "The commander keeps everyone on one plan; specialists do the technical work.",
      },
      {
        q: "An attacker is active on a domain controller with domain admin rights. Which severity fits best?",
        options: ["The highest level (SEV1)", "SEV3", "SEV4", "Not an incident yet"],
        answer: 0,
        why: "An active attacker controlling identity for the whole company is a critical incident.",
      },
      {
        q: "Why run tabletop exercises?",
        options: ["To test antivirus signatures", "To tune the firewall", "To find gaps in the plan, contacts and decision rights before a real incident", "To train attackers"],
        answer: 2,
        why: "Talking through a scenario exposes missing contacts, unclear roles and slow decisions safely.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Define a four-level severity scale for a small online shop, with one example incident and a response time for each level.",
        hint: "Think about the shop's money, customer data and website uptime.",
        solution: "SEV1: card data stolen or site down; respond in 15 min, 24/7.\nSEV2: admin account compromised; respond in 1 hour, 24/7.\nSEV3: one staff laptop infected and isolated; same business day.\nSEV4: blocked phishing attempt; next business day.",
      },
      {
        level: "medium",
        task: "Write the table of contents for a two-page IR plan for a 100-person company.",
        hint: "Cover scope, definitions, roles, process, communication and outside help.",
        solution: "1. Purpose and scope\n2. Definitions and severity levels\n3. Roles and contact list (with backups)\n4. How to declare an incident; war room and out-of-band channel\n5. Phases and decision rights (who can shut down what)\n6. Communication: internal, customers, regulators, press\n7. Legal duties and deadlines (for example GDPR 72 hours)\n8. External contacts: retainer firm, insurer, police\n9. Plan review and exercise schedule",
      },
      {
        level: "hard",
        task: "Design a 60-minute tabletop exercise about a stolen cloud admin key. Write the opening scenario, three injects and the decision you expect at each.",
        hint: "Each inject should force a decision about containment, communication or business impact.",
        solution: "Opening: CloudTrail shows CreateUser and AttachUserPolicy at 03:00 from an unknown IP using a CI key.\nInject 1 (10 min): new EC2 instances appear in an unused region.\n  Expect: deactivate the key, declare SEV2, scope all API calls by that key.\nInject 2 (25 min): an S3 bucket with customer data was read.\n  Expect: raise to SEV1, bring in legal and privacy, start the 72-hour clock.\nInject 3 (40 min): a journalist emails asking about a leak.\n  Expect: comms lead uses the holding statement; no speculation.\nDebrief (50 min): list gaps, owners and dates.",
      },
    ],
    faq: [
      { q: "What is the difference between an event and an incident?", a: "An event is anything observable, such as a login or a blocked connection. An incident is an event, or a group of them, that harms or seriously threatens the confidentiality, integrity or availability of systems or data." },
      { q: "Is NIST SP 800-61 mandatory?", a: "For most private companies it is voluntary guidance, but it is widely used as the reference model. US federal agencies are expected to follow NIST guidance, and auditors often ask which model your plan is based on." },
      { q: "Who should be the incident commander?", a: "Someone calm and organised who knows the business and the plan, usually a security or IT lead. It does not have to be the most technical person, and there should always be a named backup." },
      { q: "Does a small company really need an IR plan?", a: "Yes, even a two-page one. Knowing who to call, where the backups are and who can make decisions saves hours, and some insurers and customers require a plan." },
    ],
  },

  "sec-incident-response/triage-containment": {
    plain: [
      "When an incident is confirmed, the urge is to fix the first infected machine right away. Experienced responders pause and ask: how far has this spread? That question is called scoping. Cleaning one laptop while the attacker sits on five more only warns them.",
      "Containment means stopping the damage from growing. Short-term containment is the quick move, like cutting a laptop off the network or disabling a stolen account. Long-term containment holds the line for days, like extra firewall rules, while you prepare a clean fix.",
      "Eradication means removing the attacker completely: their malware, their hidden ways back in (called persistence) and any passwords or keys they may have stolen. If you skip the passwords, they simply log back in.",
      "Before calling it done, verify. Search again for every sign of the attacker, watch closely for a while, and only then return systems to normal work. That final step is recovery.",
    ],
    deepDive: [
      {
        heading: "Scoping: pivot until nothing new appears",
        body: "Scoping starts with what you already know: a host, a user, a file hash, an IP or domain, a technique. Search for each of these everywhere: EDR, SIEM, DNS, proxy, email and cloud logs. Each hit can give you new indicators, such as another account the attacker used or another host that talked to the same server. Add those to the list and search again. Stop when a full round finds nothing new.\n\nKeep a scope table with every affected host, account and indicator, plus its status: suspected, confirmed, contained, cleaned. Do not forget identity. Any account that logged on to a compromised host while the attacker was there may have had its credentials stolen, so it belongs in scope even if it shows no odd activity yet.",
        visual: {
          type: "cycle",
          title: "The scoping loop",
          steps: [
            { label: "Known indicators", detail: "Hosts, users, hashes, IPs, domains" },
            { label: "Search everywhere", detail: "EDR, SIEM, DNS, proxy, cloud" },
            { label: "New findings", detail: "More hosts or accounts involved" },
            { label: "Extract indicators", detail: "Add them to the scope table" },
          ],
        },
      },
      {
        heading: "Short-term vs long-term containment",
        body: "Short-term containment buys time. Typical actions: isolate a host with the EDR agent, disable an account and revoke its sessions, block a domain or IP at DNS, proxy and firewall, and pull a malicious email from all mailboxes. Long-term containment keeps the attacker boxed in while you plan a clean rebuild: temporary firewall rules between network segments, moving a critical service to a clean server, patching the exploited flaw, and extra monitoring.\n\nThree trade-offs shape every choice. Business impact: isolating the payment server stops sales, so leaders may need to decide. Evidence: isolate rather than power off, because shutting down destroys memory. Tipping off: a hands-on attacker who sees one door close may use another or turn destructive. When they are active on many systems, plan the actions and execute them all at the same agreed time.",
        visual: {
          type: "compare",
          title: "Two kinds of containment",
          columns: [
            { title: "Short-term", points: ["Isolate host with EDR", "Disable account, revoke sessions", "Block IP or domain", "Purge malicious email"] },
            { title: "Long-term", points: ["Temporary segment firewall rules", "Move services to clean systems", "Patch the exploited flaw", "Extra monitoring for weeks"] },
          ],
        },
      },
      {
        heading: "Finding and removing persistence",
        body: "Persistence is anything that brings the attacker back after a reboot or a password change. On Windows, look at Run and RunOnce registry keys, scheduled tasks, services, WMI event subscriptions, the Startup folder and new local admin accounts. On Linux, check cron jobs, systemd services and timers, authorized_keys files, shell start-up files such as .bashrc, and any user besides root with UID 0. In cloud and SaaS, look for new IAM users and access keys, OAuth apps granted access, new MFA devices and mailbox forwarding rules.\n\nTools such as Sysinternals Autoruns list Windows start-up locations in one place, and EDR can sweep all hosts at once. If an attacker had admin rights, rebuilding from a known-good image is usually safer than cleaning, because you can never be sure you found every change.",
        bullets: ["autorunsc -accepteula -a * -c -h -s -m > autoruns.csv", "schtasks /query /fo LIST /v", "reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run", "systemctl list-timers --all"],
      },
      {
        heading: "Credential resets done right",
        body: "Reset every credential the attacker used or could have stolen: accounts they logged in with, accounts that logged on to compromised hosts, service accounts, API keys, SSH keys and cloud access keys. A password reset alone may not end existing sessions, so also revoke sessions and refresh tokens in your identity provider.\n\nTiming matters. If you reset passwords while a keylogger or backdoor is still running, the attacker simply captures the new ones. Remove persistence and block their infrastructure first, then reset, ideally all in one planned window. If the whole Active Directory domain was compromised, reset the krbtgt account password twice, waiting for replication and at least the maximum ticket lifetime (10 hours by default) between resets, so forged Kerberos tickets stop working.",
        visual: {
          type: "flow",
          title: "Order of a coordinated reset",
          steps: [
            { label: "Remove persistence", detail: "Tasks, services, keys, rules" },
            { label: "Block infrastructure", detail: "Attacker IPs and domains" },
            { label: "Reset secrets", detail: "Passwords, API and SSH keys" },
            { label: "Revoke sessions", detail: "Tokens and refresh tokens" },
            { label: "Watch for reuse", detail: "Alert on old creds and IPs" },
          ],
        },
      },
      {
        heading: "Verifying eradication before recovery",
        body: "Do not trust a single clean scan. Sweep every host again for all known indicators with your EDR, and with YARA rules if you have them. Check DNS, proxy and network logs for any further contact with attacker infrastructure. Check identity logs for logons from attacker IPs or with reset accounts. Confirm the original entry point is closed, for example the vulnerability is patched or the exposed service removed.\n\nRestore only from backups taken before the earliest known attacker activity, and scan them before use. Bring systems back in stages, less critical ones first, and keep heightened monitoring with extra alerts for the known indicators for several weeks. If the attacker comes back, it is far better to see it on day two of recovery than on day ninety.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where attackers hide persistence",
        root: "Persistence",
        children: [
          { label: "Windows", children: ["Run and RunOnce keys", "Scheduled tasks", "Services", "WMI subscriptions", "Startup folder"] },
          { label: "Linux", children: ["cron jobs", "systemd units and timers", "authorized_keys", "Shell start-up files", "Extra UID 0 users"] },
          { label: "Identity", children: ["New accounts", "New MFA devices", "Added group memberships"] },
          { label: "Cloud and SaaS", children: ["New access keys", "OAuth app consents", "Mailbox forwarding rules"] },
        ],
      },
    ],
    examples: [
      {
        title: "Scoping a stolen VPN account",
        explanation: "Alert: user k.ito logged into the VPN from an unknown country at 01:30 UTC. Step 1: search VPN logs for the attacker IP: it also logged in as a second user, m.lee. Both accounts go into scope. Step 2: search for internal hosts reached from the VPN addresses given to those sessions: two file servers and one workstation. Step 3: EDR on the workstation shows a remote access tool installed at 01:52; its hash appears nowhere else. Step 4: DNS logs show the tool's domain queried only from that workstation. Step 5: another loop finds nothing new. Containment, all at 09:00: isolate the workstation, disable both accounts and revoke sessions, block the IP and domain, then reset passwords and enforce MFA on the VPN.",
      },
      {
        title: "Hunting for persistence on a Linux server",
        explanation: "A web server was compromised. Before deciding between cleaning and rebuilding, you check the usual hiding places. Step 1: users with UID 0 other than root. Step 2: every user's crontab and the system cron folders. Step 3: enabled services and timers, plus unit files changed in the last 30 days. Step 4: all authorized_keys files and their owners. Anything unexpected goes in the scope table with its hash and timestamps before you remove it.",
        code: {
          lang: "bash",
          code: `awk -F: '$3 == 0 {print $1}' /etc/passwd
for u in $(cut -d: -f1 /etc/passwd); do
  sudo crontab -l -u "$u" 2>/dev/null | sed "s/^/$u: /"
done
ls -la /etc/crontab /etc/cron.*
systemctl list-unit-files --state=enabled
systemctl list-timers --all
sudo find /etc/systemd /usr/lib/systemd -name "*.service" -mtime -30
sudo find / -xdev -name authorized_keys -exec ls -l {} \\; 2>/dev/null`,
        },
      },
    ],
    cheatSheet: [
      "Scope first: hosts, accounts and indicators; repeat searches until nothing new appears",
      "Isolate with EDR instead of powering off, so memory evidence survives",
      "Disable the account AND revoke its sessions and refresh tokens",
      "Against an active attacker, act on all known footholds at the same time",
      "Windows persistence: Run keys, scheduled tasks, services, WMI subscriptions, Startup folder",
      "Linux persistence: cron, systemd units and timers, authorized_keys, shell files, UID 0 users",
      "Domain compromise: reset krbtgt twice, at least 10 hours (default ticket lifetime) apart",
      "Restore only from backups taken before the earliest known attacker activity",
    ],
    quiz: [
      {
        q: "Why scope an incident before containing it?",
        options: ["Scoping is required by law", "Containment is always slow", "Cleaning one host while the attacker controls others warns them and they stay", "Scoping deletes the malware"],
        answer: 2,
        why: "Partial containment tips off the attacker, who keeps their other footholds.",
      },
      {
        q: "Which is a short-term containment action?",
        options: ["Isolating a host with the EDR agent", "Redesigning the whole network", "Hiring more analysts", "Writing the lessons-learned report"],
        answer: 0,
        why: "EDR isolation is fast, reversible and keeps the host available for investigation.",
      },
      {
        q: "A user's password was reset, but the attacker can still read their mailbox. What is the most likely cause?",
        options: ["The new password is weak", "Email is not encrypted", "DNS caching", "Existing sessions and refresh tokens were not revoked"],
        answer: 3,
        why: "Tokens issued before the reset can stay valid until they are revoked or expire.",
      },
      {
        q: "Why rebuild a server instead of just deleting the malware you found?",
        options: ["Rebuilding is always faster", "An attacker with admin rights may have left changes you did not find", "Deleting malware is illegal", "Backups expire after a week"],
        answer: 1,
        why: "With full control, an attacker can hide changes anywhere; a known-good image removes doubt.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the short-term containment actions for: (a) a stolen user account, (b) a laptop running malware, (c) a phishing email delivered to 200 inboxes.",
        hint: "Think identity, endpoint and email controls.",
        solution: "(a) Disable or reset the account, revoke sessions and tokens, check MFA methods.\n(b) Isolate the laptop with EDR, keep it powered on, block its malware domains.\n(c) Purge the message from all mailboxes, block the sender and URLs,\n    then find who clicked in proxy and DNS logs.",
      },
      {
        level: "medium",
        task: "Write PowerShell commands to check a Windows host for common persistence: non-Microsoft scheduled tasks, Run keys, services outside System32, WMI event consumers and local admins.",
        hint: "Get-ScheduledTask, Get-ItemProperty, Get-CimInstance and Get-LocalGroupMember cover these.",
        solution: `Get-ScheduledTask | Where-Object TaskPath -notlike '\\Microsoft\\*' |
  Select-Object TaskName, TaskPath, State
Get-ItemProperty 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
  'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'
Get-CimInstance Win32_Service |
  Where-Object { $_.PathName -notmatch 'Windows\\\\System32' } |
  Select-Object Name, PathName, StartMode
Get-CimInstance -Namespace root/subscription -ClassName __EventConsumer
Get-LocalGroupMember -Group Administrators`,
      },
      {
        level: "hard",
        task: "An attacker controls 3 workstations, 2 user accounts and 1 service account, and has a scheduled task on each workstation. Write a coordinated eradication plan in order, with timing.",
        hint: "Prepare quietly, then act in one window so the attacker cannot react.",
        solution: "Prep (quiet): confirm scope, prepare new passwords and keys, get approvals,\n  stage clean images, brief IT and the service owner.\nT0: isolate the 3 workstations with EDR.\nT0: block attacker IPs and domains at DNS, proxy and firewall.\nT0+5 min: disable the 2 user accounts, revoke sessions and tokens.\nT0+10 min: rotate the service account password and update the app using it.\nT0+1 h: capture evidence, then rebuild the 3 workstations from images.\nAfter: re-enable users with new passwords and MFA re-registration.\nVerify: sweep all hosts for the task names and hashes; alert on old creds.",
      },
    ],
    faq: [
      { q: "Should I unplug or shut down an infected computer?", a: "Usually isolate it from the network with EDR or by disconnecting the cable, but leave it powered on so memory evidence survives. Shutting down is a last resort, for example if ransomware is actively encrypting shared drives and you cannot isolate it any other way." },
      { q: "Is it better to clean or rebuild a compromised system?", a: "If the attacker had admin or root rights, rebuild from a known-good image and restore clean data. Cleaning is only reasonable for limited, well-understood infections." },
      { q: "How do I know the attacker is really gone?", a: "You never know for certain, but you gain confidence by sweeping all hosts for known indicators, confirming no further contact with attacker infrastructure, closing the entry point and watching closely for several weeks." },
      { q: "What is the difference between containment and eradication?", a: "Containment stops the damage from spreading, for example by isolating a host. Eradication removes the attacker's tools, persistence and stolen credentials so they cannot come back." },
    ],
  },

  "sec-incident-response/forensics-basics": {
    plain: [
      "Digital forensics is the careful collection and study of evidence from computers, so that what you conclude is true and can be proven. In incident response it answers questions like: how did they get in, what did they touch, and when?",
      "Some evidence disappears fast. What is in memory (RAM) is gone when a machine powers off, and network connections change by the second. Files on disk last much longer. So you collect in order of volatility: the most fragile evidence first.",
      "Evidence must be provably unchanged. Right after collecting an item, you compute its hash, a kind of digital fingerprint. If even one bit changes later, the hash changes. A chain of custody form records who had each item, when and why.",
      "Finally, you put everything on a timeline: logins, programs run, files changed and network connections, all in UTC and in order. A good timeline turns thousands of scattered clues into a short story you can explain to anyone.",
    ],
    deepDive: [
      {
        heading: "Order of volatility in detail",
        body: "RFC 3227, the classic guide to evidence collection, lists sources from most to least volatile: CPU registers and cache; then the routing table, ARP cache, process table, kernel statistics and memory; temporary file systems; disk; remote logging and monitoring data; physical configuration and network layout; and finally archival media such as backups.\n\nIn practice, on a live Windows or Linux host you capture memory first, then a quick record of running processes and network connections, then either a full disk image or a targeted collection of key files. Every action you take changes the system a little, so run trusted tools from external media or a network share, write output to a different drive, and log each command with its time. In the cloud, snapshot the disk volumes and capture memory before stopping an instance, because stopping it loses RAM.",
      },
      {
        heading: "Capturing memory and disks",
        body: "Memory capture tools include WinPmem, DumpIt and Magnet RAM Capture on Windows, and AVML or LiME on Linux. A memory image shows what was running: processes, command lines, network connections, injected code and sometimes keys or passwords. Volatility 3 is the standard free tool to analyse it.\n\nFor disks you choose between a full image and a triage collection. A full image copies every sector, including deleted data, and can take hours. A triage collection with tools like KAPE or Velociraptor grabs the most useful files (event logs, registry hives, Prefetch, browser history) in minutes, which is often enough to start. Physical drives should be read through a write blocker, a device that prevents any writes. Common image formats are raw (made with dd) and E01, which also stores case notes and hashes inside the file.",
        bullets: ["vol -f mem.raw windows.pstree: process tree", "vol -f mem.raw windows.cmdline: command lines", "vol -f mem.raw windows.netscan: network connections", "vol -f mem.raw windows.malfind: possible injected code"],
      },
      {
        heading: "Hashing and chain of custody",
        body: "Hash every evidence item as soon as it is collected, again after each transfer, and before analysis. Use SHA-256. MD5 and SHA-1 have known collision attacks, although many tools still record them alongside SHA-256 for compatibility. Analyse a verified copy and keep the original untouched.\n\nThe chain of custody is the paper trail. For each item record: a unique ID, a description (make, model, serial number), the hash, who collected it, when (in UTC), where it was found, and every handover after that: from whom, to whom, when and why. Store evidence in a locked, access-controlled place. If a case could end up with police, a court or a regulator, a gap in this record can make the evidence useless, so involve legal counsel early.",
        visual: {
          type: "sequence",
          title: "Chain of custody for one disk image",
          actors: ["Responder", "Evidence store", "Analyst"],
          messages: [
            { from: 0, to: 1, label: "Image plus SHA-256, signed in with time" },
            { from: 1, to: 2, label: "Working copy signed out, reason noted" },
            { from: 2, to: 2, label: "Re-hash: matches the recorded value" },
            { from: 2, to: 1, label: "Copy returned, hash checked again" },
          ],
        },
      },
      {
        heading: "Building a timeline from artefacts",
        body: "An artefact is any trace a system leaves behind. On Windows, useful ones include event logs, Prefetch files (C:\\Windows\\Prefetch, which show programs that ran), Amcache, the NTFS Master File Table ($MFT) with created, modified, accessed and changed times, LNK files and Jump Lists (recently opened files), registry key last-write times and browser history. On Linux: auth logs, the journal, wtmp and btmp (read with last and lastb), shell history and file timestamps.\n\nPlaso (log2timeline) parses hundreds of artefact types into one super timeline; Timeline Explorer or a SIEM makes it easy to filter. Start from a pivot point, such as the alert time, and work outwards. Normalise everything to UTC, since some logs use local time. Be alert to timestomping: attackers can fake a file's standard timestamps, but the $FILE_NAME timestamps in the $MFT are much harder to change.",
        visual: {
          type: "flow",
          title: "From artefacts to a story",
          steps: [
            { label: "Collect", detail: "Logs, $MFT, Prefetch, registry" },
            { label: "Parse", detail: "Plaso builds one super timeline" },
            { label: "Filter", detail: "Window around the pivot time" },
            { label: "Annotate", detail: "Mark attacker steps and ATT&CK IDs" },
            { label: "Narrate", detail: "Short story of what happened" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Live response vs dead-box forensics",
        columns: [
          { title: "Live response", points: ["Machine still running", "Captures memory and connections", "Changes the system slightly", "Fast answers during an incident"] },
          { title: "Dead-box", points: ["Machine powered off", "Disk image only, no memory", "Cleanest for court use", "Slower, more complete for disk data"] },
        ],
      },
      {
        type: "tree",
        title: "Which artefact answers which question (Windows)",
        root: "Investigation question",
        children: [
          { label: "Who logged in?", children: ["Security 4624 and 4625", "RDP logs", "Entra ID sign-ins"] },
          { label: "What ran?", children: ["Prefetch", "Amcache", "Sysmon 1 or 4688"] },
          { label: "What files changed?", children: ["$MFT timestamps", "USN journal", "LNK and Jump Lists"] },
          { label: "Where did it connect?", children: ["Sysmon 3 and 22", "Firewall and proxy logs", "Memory netscan"] },
        ],
      },
    ],
    examples: [
      {
        title: "Imaging a USB drive and proving integrity",
        explanation: "A USB stick was found plugged into a compromised server. Step 1: identify the device with lsblk. Step 2: make the block device read-only (a hardware write blocker is better if you have one). Step 3: copy every sector to an image file. Step 4: hash both the device and the image; they should match. Step 5: save the hash to a file and record it on the chain of custody form. Before any later analysis, verify the hash again. Note: if the drive has bad sectors, conv=noerror,sync fills them with zeros, so the image hash may not match the device; record that in your notes.",
        code: {
          lang: "bash",
          code: `lsblk                                 # find the device, e.g. /dev/sdb
sudo blockdev --setro /dev/sdb
sudo dd if=/dev/sdb of=/cases/2026-014/usb.img bs=4M conv=noerror,sync status=progress
sudo sha256sum /dev/sdb /cases/2026-014/usb.img
sha256sum /cases/2026-014/usb.img > /cases/2026-014/usb.img.sha256

# later, before analysis
sha256sum -c /cases/2026-014/usb.img.sha256`,
        },
      },
      {
        title: "First look at a memory image with Volatility 3",
        explanation: "You have a RAM capture from a laptop that raised an EDR alert. Step 1: confirm Volatility recognises the image and the Windows version. Step 2: view the process tree and look for odd parents, such as a shell under an Office app. Step 3: print the command line of the suspicious process (PID 4312 here). Step 4: list its network connections. Step 5: check it for injected code. Record each finding with the PID, time and plugin used, so someone else can repeat it.",
        code: {
          lang: "bash",
          code: `pip install volatility3
vol -f mem.raw windows.info
vol -f mem.raw windows.pstree
vol -f mem.raw windows.cmdline --pid 4312
vol -f mem.raw windows.netscan | grep -i established
vol -f mem.raw windows.malfind --pid 4312`,
        },
      },
    ],
    cheatSheet: [
      "RFC 3227: collect memory and network state before disk, and disk before backups",
      "Isolate, do not power off: shutting down destroys memory evidence",
      "Hash with SHA-256 at collection and after every transfer; analyse copies only",
      "Chain of custody: item, hash, who, when (UTC), where stored, every handover and why",
      "Volatility 3 plugins: windows.pstree, windows.cmdline, windows.netscan, windows.malfind",
      "Windows execution evidence: Prefetch, Amcache, Sysmon 1, Security 4688",
      "Linux logins: last reads wtmp (sessions), lastb reads btmp (failed logins)",
      "Plaso (log2timeline) builds one super timeline from many artefact types",
    ],
    quiz: [
      {
        q: "Following the order of volatility, what do you collect first from a running compromised server?",
        options: ["Backup tapes", "A full disk image", "The firewall configuration", "Memory (RAM)"],
        answer: 3,
        why: "RAM is lost on power-off and changes constantly, so it comes first.",
      },
      {
        q: "Why compute a SHA-256 hash right after imaging a disk?",
        options: ["To compress the image", "To prove later that the image has not changed", "To encrypt the image", "To speed up analysis"],
        answer: 1,
        why: "Matching hashes later show the evidence is exactly what was collected.",
      },
      {
        q: "What is a chain of custody?",
        options: ["A record of everyone who handled evidence, when and why", "A list of malware families", "A set of firewall rules", "Another name for the order of volatility"],
        answer: 0,
        why: "It proves the evidence was controlled and unchanged from collection to analysis.",
      },
      {
        q: "A file's standard created time says 2019, but its $FILE_NAME time is last week. What might this mean?",
        options: ["The disk is failing", "The clock was set to UTC", "The timestamp may have been faked (timestomping)", "The file is a Prefetch file"],
        answer: 2,
        why: "Attackers often change the standard timestamps, but the $FILE_NAME ones are harder to alter.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a text file, hash it with SHA-256, change one character, and hash it again. Explain what this shows about evidence integrity.",
        hint: "Use sha256sum on Linux or Get-FileHash in PowerShell.",
        solution: "echo \"evidence\" > e.txt; sha256sum e.txt\necho \"evidencf\" > e.txt; sha256sum e.txt\n# The two hashes are completely different.\n# Any change, even one bit, is detectable if you recorded the first hash.",
      },
      {
        level: "medium",
        task: "Write a complete chain of custody entry for a laptop collected from an employee's desk, including one handover to an analyst.",
        hint: "Include identity of the item, integrity, who, when, where and why.",
        solution: "Item ID: 2026-014-01\nDescription: Dell Latitude 5440 laptop, serial ABC1234, powered on\nCollected: 2026-03-08 10:42 UTC by R. Singh, desk 4.12, finance floor\nActions: memory captured (mem.raw SHA-256 9f2c...), then shut down\nStorage: evidence locker 2, bag seal 55871\nHandover: 2026-03-08 14:05 UTC, R. Singh to A. Gomez (analyst)\n  Reason: disk imaging; seal intact; signatures of both",
      },
      {
        level: "hard",
        task: "On a Linux server, build a mini timeline for 08 March 2026 09:00 to 12:00 UTC: successful SSH logins, reboots and files changed under /etc and /usr/local/bin in that window.",
        hint: "grep the auth log, use last with full times, and find with -newermt.",
        solution: "sudo grep -h \"Accepted\" /var/log/auth.log* 2>/dev/null | grep \"Mar  8\"\nlast -F -i | grep \"Mar  8\"\nlast -x reboot -F | head\nsudo find /etc /usr/local/bin -newermt \"2026-03-08 09:00\" ! -newermt \"2026-03-08 12:00\" \\\n  -printf \"%T+ %p\\n\" | sort\n# Check the server's time zone first (timedatectl) and convert to UTC.\n# Merge all lines into one table sorted by time.",
      },
    ],
    faq: [
      { q: "Can I just copy files instead of making a full disk image?", a: "For a fast first look, a targeted triage collection is common and fine. A plain file copy can change access times and misses deleted data, so use proper tools and record what you collected." },
      { q: "Is MD5 still acceptable for hashing evidence?", a: "Use SHA-256 as your main hash. MD5 has known collision attacks, so it is only kept alongside SHA-256 for compatibility with older tools and records." },
      { q: "Do I need forensics if we are going to rebuild the machine anyway?", a: "Yes, collect first. Without evidence you cannot tell how the attacker got in, what they took or whether other systems are affected, and you may need it for legal or insurance reasons." },
      { q: "What is the difference between forensics and incident response?", a: "Incident response manages the whole incident, from detection to recovery. Forensics is one part of it: collecting and analysing evidence carefully enough that the conclusions can be trusted." },
    ],
  },

  "sec-incident-response/playbooks-lessons": {
    plain: [
      "A playbook is a written, step-by-step guide for one type of incident, like a recipe. When a phishing report arrives at 2 a.m., nobody has to invent the steps. They follow the playbook, so the response is fast and the same every time.",
      "Communication is half of incident response. Leaders need to make decisions, staff may need to act, and customers or regulators may need to be told, sometimes within legal deadlines. A communication plan decides in advance who tells whom, what, and when.",
      "After every significant incident, the team meets for a lessons-learned review. It is blameless: the goal is to find what in the system let this happen, not to punish the person who clicked. People only tell the full story when they feel safe.",
      "The review only matters if something changes. Each lesson becomes an action with an owner and a due date: a new detection, a fixed setting, some training, an updated playbook. These actions feed straight back into preparation.",
    ],
    deepDive: [
      {
        heading: "Anatomy of a phishing response playbook",
        body: "A good playbook starts with its trigger (a user report or a mail gateway alert) and its owner. Triage comes next: read the headers, compare the From address with the Return-Path, and check the Authentication-Results header for SPF, DKIM and DMARC results. Open links and attachments only in a sandbox. Then scope: search the mail system for every recipient of the same message, sender or URL.\n\nContain by purging the message from all mailboxes and blocking the sender, domain and URLs. Then find out who interacted, using proxy, DNS and EDR logs, because the next steps depend on what each person did. Finish by thanking the reporter, recording the indicators and noting how long each step took. Clear decision points make the playbook usable at 2 a.m.",
        visual: {
          type: "tree",
          title: "Phishing: what each user did decides the next step",
          root: "User interaction",
          children: [
            { label: "Only received it", children: ["Purge from mailbox", "Block sender and URLs"] },
            { label: "Clicked the link", children: ["Check proxy for downloads", "Review recent sign-ins"] },
            { label: "Entered password", children: ["Reset and revoke sessions", "Check MFA methods", "Check mailbox rules"] },
            { label: "Opened attachment", children: ["Isolate the host", "Run the malware playbook"] },
          ],
        },
      },
      {
        heading: "Playbooks, runbooks and automation",
        body: "A playbook describes what to do and decide for a type of incident: phishing, ransomware, lost laptop, stolen cloud key. A runbook gives the exact technical steps for one task, such as how to purge a message in your mail platform or how to isolate a host in your EDR. Playbooks link to runbooks, so the high-level flow stays short and readable.\n\nSOAR (security orchestration, automation and response) tools can run the repetitive parts automatically: pulling headers, checking URL reputation, finding all recipients, opening a ticket. Keep a human approval step for disruptive actions such as disabling an executive's account or isolating a server. Store playbooks in version control, give each an owner, and review it after every real use and every tabletop exercise.",
      },
      {
        heading: "Communication: who hears what, and when",
        body: "Internally, run the incident in a dedicated channel, and switch to an out-of-band one if email or chat may be compromised. Give leaders updates at a fixed rhythm, for example every two hours during a SEV1, each covering what we know, what we do not know, what we are doing and when the next update comes. Share details only with people who need them.\n\nExternally, legal and privacy staff decide who must be told. Under GDPR, a personal data breach must normally be reported to the supervisory authority within 72 hours, and to affected people without undue delay when the risk to them is high. US public companies must disclose material cybersecurity incidents on Form 8-K within four business days of deciding they are material. Cyber insurers usually expect prompt notice too. Use one spokesperson, prepare a holding statement in advance, and never speculate.",
        visual: {
          type: "sequence",
          title: "Communication during a SEV1",
          actors: ["IR lead", "Executives", "Legal", "Regulator"],
          messages: [
            { from: 0, to: 1, label: "SEV1 declared: facts, unknowns, next update" },
            { from: 1, to: 2, label: "Do we have notification duties?" },
            { from: 0, to: 2, label: "Data types and number of people affected" },
            { from: 2, to: 3, label: "Breach notice within the legal deadline" },
            { from: 0, to: 1, label: "Update every 2 hours until stable" },
          ],
        },
      },
      {
        heading: "Running a blameless lessons-learned review",
        body: "Hold the review within about one to two weeks, while memories are fresh. Invite everyone who took part, and have someone who was not deeply involved facilitate. Start from the timeline, then ask: what went well, what was hard, what surprised us, and where did detection or response slow down?\n\nLook for contributing factors rather than a single root cause. Incidents usually come from several conditions together: a missing patch, a noisy rule that was ignored, an unclear owner. Watch the language. \"What made this hard to spot?\" gets honest answers; \"Why didn't you see it?\" gets silence.\n\nThe output is a short written report with the timeline, impact, key metrics such as time to detect and time to contain, and a list of actions, each with one owner and a due date. Track those actions to completion like any other work.",
        visual: {
          type: "flow",
          title: "A one-hour review agenda",
          steps: [
            { label: "Timeline", detail: "Agree on what happened, in UTC" },
            { label: "Went well", detail: "Keep doing these" },
            { label: "Was hard", detail: "Delays, gaps, confusion" },
            { label: "Factors", detail: "Conditions that allowed it" },
            { label: "Actions", detail: "Owner and due date for each" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "How each incident improves the next response",
        steps: [
          { label: "Incident", detail: "Handled with the current playbook" },
          { label: "Review", detail: "Blameless, timeline first" },
          { label: "Actions", detail: "Owners and due dates" },
          { label: "Updates", detail: "Playbooks, detections, training" },
          { label: "Exercise", detail: "Test the changes in a tabletop" },
        ],
      },
    ],
    examples: [
      {
        title: "Running the phishing playbook on one report",
        explanation: "A user reports an email that claims to be from the company's bank. Step 1: the headers show SPF and DMARC failing for the bank's domain, and the link goes to a look-alike domain registered yesterday. Step 2: a mail search finds the same message in 37 inboxes. Step 3: purge all 37 and block the domain at the mail gateway and proxy. Step 4: proxy logs show 3 users visited the link, and sign-in logs show 1 of them then signed in from a foreign IP. Step 5: for that user, reset the password, revoke sessions, remove a new inbox rule that forwarded mail outside, and check MFA methods. Step 6: thank the reporter and record the indicators.",
        code: {
          lang: "text",
          code: `From: "Example Bank" <alerts@examplebank.com>
Return-Path: <bounce@examp1ebank-secure.net>
Authentication-Results: mx.ourcompany.com;
  spf=fail smtp.mailfrom=examp1ebank-secure.net;
  dkim=none;
  dmarc=fail header.from=examplebank.com`,
        },
      },
      {
        title: "Writing up a blameless review",
        explanation: "A short, structured write-up is easier to read and act on than a long story. It records facts and conditions, not blame. Every action has one owner and a date, so it can be tracked. Notice that \"user clicked\" is not listed as a cause: people will always click sometimes, so the actions focus on what would catch or stop it next time.",
        code: {
          lang: "text",
          code: `Incident 2026-031: credential phishing, SEV3
Impact: 1 mailbox accessed for 40 min; no data sent out
Time to detect: 25 min (user report); time to contain: 15 min
Went well: user reported fast; purge took 4 min
Was hard: no alert for the new forwarding rule
Contributing factors: look-alike domain not blocked;
  phishing-resistant MFA not yet rolled out to finance
Actions:
  1. Alert on new external forwarding rules (SOC, 15 Apr)
  2. Block newly registered domains at proxy (Network, 30 Apr)
  3. Passkeys for finance team (IAM, 31 May)`,
        },
      },
    ],
    cheatSheet: [
      "Playbook = what to do and decide for an incident type; runbook = exact steps for one task",
      "Phishing triage: check SPF, DKIM and DMARC in the Authentication-Results header",
      "Find every recipient before purging, then find who clicked in proxy and DNS logs",
      "Password entered? Reset, revoke sessions, check MFA methods and mailbox rules",
      "Use an out-of-band channel when email or chat might be compromised",
      "Leader updates: what we know, what we don't, what we're doing, next update time",
      "Blameless review: ask what made it hard, not who failed",
      "Every lesson becomes an action with one owner and a due date",
    ],
    quiz: [
      {
        q: "A user typed their password into a phishing page. What matters most right away?",
        options: ["Reset the password and revoke active sessions", "Delete the email from their inbox only", "Send them a security poster", "Block the sender's display name"],
        answer: 0,
        why: "The attacker may already be signing in, so the credential and its sessions must be cut off.",
      },
      {
        q: "Why use an out-of-band channel during a major incident?",
        options: ["It is cheaper", "It is faster to type in", "The attacker may be able to read company email or chat", "Regulators require it"],
        answer: 2,
        why: "If internal systems are compromised, the attacker could follow the response.",
      },
      {
        q: "What is the main goal of a blameless review?",
        options: ["Find who to discipline", "Find the system and process causes so they can be fixed", "Avoid writing a report", "Close the ticket faster"],
        answer: 1,
        why: "When people feel safe they share the full story, and the real weaknesses get fixed.",
      },
      {
        q: "Which email header shows the receiving server's SPF, DKIM and DMARC results?",
        options: ["Subject", "Message-ID", "X-Mailer", "Authentication-Results"],
        answer: 3,
        why: "The receiving server records its checks in Authentication-Results.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the trigger and the first five steps of a \"lost or stolen laptop\" playbook.",
        hint: "Think about the device, the accounts on it and any data it held.",
        solution: "Trigger: employee reports a lost or stolen company laptop.\n1. Record who, which device, when and where it was last seen.\n2. Check that disk encryption was on (MDM or EDR console).\n3. Lock or wipe the device remotely through MDM.\n4. Revoke the user's sessions and reset the password.\n5. Check sign-ins and VPN logs for use of the device after the loss.",
      },
      {
        level: "medium",
        task: "Write two short messages for a ransomware incident on the file server: a staff update and a holding statement for customers.",
        hint: "State facts, what people should do, and when the next update comes. Do not guess about causes.",
        solution: "Staff: \"The shared file server is offline while we investigate a security\nissue. Please do not try to reconnect to it. Save new work locally or in\nthe cloud drive. Next update at 14:00 UTC.\"\n\nCustomers: \"We are investigating a security incident affecting some\ninternal systems. Our services remain available. We will share more\ninformation as soon as we can.\"",
      },
      {
        level: "hard",
        task: "From this timeline, write the review's contributing factors and four actions with owners: 09:00 phishing email; 09:05 user enters password; 09:20 attacker signs in from abroad; 11:30 inbox forwarding rule added; next day 10:00 finance notices a fake invoice was paid.",
        hint: "Look at each gap: why was each step not caught or stopped?",
        solution: "Factors: no phishing-resistant MFA; no alert on foreign sign-in;\nno alert on new forwarding rules; payment change not verified by phone.\nActions:\n1. Alert on sign-ins from new countries (SOC, 2 weeks)\n2. Alert on external forwarding rules (SOC, 2 weeks)\n3. Passkeys for finance and executives (IAM, 2 months)\n4. Call-back check for bank detail changes (Finance, 1 month)",
      },
    ],
    faq: [
      { q: "What is the difference between a playbook and a runbook?", a: "A playbook covers the overall response to a type of incident, including decisions. A runbook gives detailed technical steps for one task inside it, such as isolating a host in a specific EDR tool." },
      { q: "How soon after an incident should the lessons-learned meeting happen?", a: "Usually within one to two weeks of closing the incident, while details are fresh but people have had time to rest." },
      { q: "Do we have to tell customers about every incident?", a: "No. The duty depends on the laws that apply, your contracts and the risk to people. Legal and privacy staff decide, which is why they are part of the plan." },
      { q: "Should playbooks be fully automated?", a: "Automate repetitive, low-risk steps like enrichment and searching. Keep a human decision for disruptive actions, because a wrong automatic block can cause its own outage." },
    ],
  },
};

export default extra;
