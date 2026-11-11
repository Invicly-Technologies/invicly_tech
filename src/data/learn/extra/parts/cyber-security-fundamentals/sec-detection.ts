import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-detection/log-sources": {
    plain: [
      "A log is a line of text that a system writes when something happens: a user logs in, a program starts, a file is downloaded. Defenders read logs the way detectives read witness statements. If nothing was written down, there is nothing to investigate.",
      "You cannot collect everything. It costs money and buries the useful lines. So you pick the sources that show attacker behaviour: endpoints (laptops and servers), identity (logins and account changes), network (firewall, DNS and web proxy) and cloud (API activity in AWS, Azure or Google Cloud).",
      "Logs are not safe on the machine that wrote them. An attacker who becomes admin can delete them. So a small program called an agent or forwarder copies them to a central place, usually a SIEM, within seconds of being written.",
      "Two more decisions matter. Time: every system must agree on the clock, and you store times in UTC so events from different machines line up. Retention: you keep logs long enough to look back, because attackers often stay hidden for weeks before anyone notices.",
    ],
    deepDive: [
      {
        heading: "The high-value sources, with real event IDs",
        body: "Start with sources that see the most attacker steps for the least volume. On Windows, the Security log records logons (4624 success, 4625 failure), new accounts (4720), changes to security groups (4728, 4732) and the log itself being cleared (1102). Process creation (4688) is very useful, but only if you turn on the policy that adds the full command line. Sysmon, a free Microsoft tool, adds richer events: process creation with hashes and the parent process (ID 1), network connections (ID 3), file creation (ID 11) and DNS queries (ID 22).\n\nOn Linux, collect authentication logs (/var/log/auth.log on Debian and Ubuntu, /var/log/secure on RHEL) and auditd. Domain controller and Entra ID sign-in logs show who logged in from where. Cloud audit logs such as AWS CloudTrail record every API call. DNS and proxy logs show where machines are talking to.",
        bullets: [
          "A burst of 4625 then a 4624 for the same account: possible password guessing that worked",
          "7045 in the System log: a new service was installed",
          "Sysmon needs a config file; community configs are a good start",
          "DNS logs catch malware calling home even when its traffic is encrypted",
        ],
      },
      {
        heading: "Agents, forwarders and syslog",
        body: "There are two ways to move logs. With an agent, a small program on each host reads local logs and ships them: Elastic Agent, the Splunk Universal Forwarder, the Wazuh agent or Fluent Bit. Good agents buffer to disk when the network is down, compress and encrypt data with TLS, and resend anything the server did not acknowledge. Agentless options include Windows Event Forwarding, which is built into Windows and moves events over WinRM, and syslog, the classic Unix protocol.\n\nSyslog over UDP port 514 is simple but can drop messages silently and sends them in clear text. Prefer TCP, or syslog over TLS on port 6514. Firewalls and switches often speak only syslog, so many teams run a central collector that receives syslog and forwards it to the SIEM.",
        visual: {
          type: "sequence",
          title: "How a good agent avoids losing logs",
          actors: ["Log file", "Agent", "SIEM"],
          messages: [
            { from: 0, to: 1, label: "Agent reads new lines" },
            { from: 1, to: 2, label: "Batch sent over TLS" },
            { from: 2, to: 1, label: "Acknowledged, agent moves on" },
            { from: 1, to: 2, label: "Next batch: no reply, network down" },
            { from: 1, to: 2, label: "Retry later from disk buffer" },
            { from: 2, to: 1, label: "Acknowledged, nothing lost" },
          ],
        },
      },
      {
        heading: "Time: UTC, NTP and timestamp formats",
        body: "Correlation means putting events from different machines on one timeline. That breaks if clocks disagree. A firewall five minutes fast makes a connection look like it happened before the phishing click that caused it. Keep every system in sync with NTP (chrony or systemd-timesyncd on Linux, the Windows Time service on Windows). Kerberos logons even fail by default when a clock is more than 5 minutes off.\n\nFormat is the second problem. Old-style syslog (RFC 3164) timestamps look like Oct 11 22:14:15, with no year and no time zone, so the SIEM must guess. Prefer ISO 8601 with an offset, such as 2026-03-08T14:05:09Z, and store everything in UTC. Analysts can still view local time on screen. Keep both the event time and the time the SIEM received it: a big gap points to a delayed or broken forwarder.",
        bullets: ["timedatectl shows whether a Linux clock is synchronised", "chronyc tracking shows the current offset", "w32tm /query /status shows the Windows time source"],
      },
      {
        heading: "Retention and storage sizing",
        body: "Retention is how long you keep logs. It must be longer than the time it takes to notice an attack, and some intrusions are found months after they start. Rules can set minimums too: PCI DSS, the card payment standard, asks for 12 months of audit logs, with the latest 3 months ready to search right away.\n\nKeeping everything on fast disks is expensive, so most SIEMs use tiers. Hot storage holds recent days for instant searches. Warm and cold tiers hold older data more cheaply but search more slowly. Archive storage, often object storage like S3, keeps the long tail.\n\nSize it with simple maths: events per second times average event size times 86,400 seconds. 2,000 events per second at 500 bytes is about 86 GB a day before compression. Note that AWS CloudTrail event history only covers 90 days unless you create a trail that saves logs to S3.",
        visual: {
          type: "layers",
          title: "Storage tiers, fastest at the top",
          layers: [
            { label: "Hot", detail: "Last days, fast disks, instant search" },
            { label: "Warm", detail: "Weeks, cheaper disks, still searchable" },
            { label: "Cold", detail: "Months, slow but available" },
            { label: "Archive", detail: "Object storage, restore before searching" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What to collect first",
        root: "High-value log sources",
        children: [
          { label: "Endpoint", children: ["Sysmon process and network events", "Windows Security log", "Linux auth log and auditd", "EDR telemetry"] },
          { label: "Identity", children: ["Domain controller logons", "Entra ID or Okta sign-ins", "MFA and password resets"] },
          { label: "Network", children: ["Firewall allow and deny", "DNS queries", "Web proxy", "VPN logins"] },
          { label: "Cloud", children: ["CloudTrail or Azure Activity Log", "Storage access logs", "Kubernetes audit log"] },
          { label: "Email and SaaS", children: ["Mail gateway verdicts", "Mailbox rule changes", "File sharing events"] },
        ],
      },
    ],
    examples: [
      {
        title: "Choosing sources for a 50-person company",
        explanation: "The company fears three things: phishing, stolen passwords and ransomware. Step 1: map each threat to the logs that would show it. Phishing shows up in mail gateway logs and in DNS and proxy logs when someone clicks. Stolen passwords show up in Entra ID or VPN sign-in logs. Ransomware shows up in endpoint process logs (Sysmon or EDR) before files are encrypted. Step 2: collect those first, from every laptop and server. Step 3: add firewall logs for internet-facing systems. Step 4: write down what you are not collecting yet (for example database query logs), so gaps are a choice, not a surprise.",
      },
      {
        title: "Forwarding Linux auth logs with rsyslog over TCP",
        explanation: "A Linux server should send its login events to a central collector at 10.0.0.50. Step 1: add a forwarding rule that uses TCP and a disk-assisted queue, so messages wait instead of being lost when the collector is down. Step 2: check the config syntax. Step 3: restart rsyslog. Step 4: write a test message and search for it on the collector.",
        code: {
          lang: "bash",
          code: `# /etc/rsyslog.d/90-forward.conf
auth,authpriv.* action(type="omfwd" target="10.0.0.50" port="514" protocol="tcp"
                       queue.type="LinkedList" queue.filename="fwd_auth"
                       queue.saveOnShutdown="on" action.resumeRetryCount="-1")

# then, on the server:
sudo rsyslogd -N1                 # check config syntax
sudo systemctl restart rsyslog
logger -p auth.notice "forwarding test"`,
        },
      },
    ],
    cheatSheet: [
      "Windows: 4624 logon OK, 4625 logon failed, 4720 user created, 1102 Security log cleared",
      "Turn on command-line logging so event 4688 shows what was run, not just the program name",
      "Sysmon IDs: 1 process create, 3 network connection, 11 file create, 22 DNS query",
      "Linux logins: /var/log/auth.log (Debian, Ubuntu) or /var/log/secure (RHEL family)",
      "Syslog over UDP 514 can drop messages; prefer TCP, or TLS on port 6514",
      "Daily volume is about events per second x average size x 86,400",
      "Store UTC, sync clocks with NTP, and keep both event time and ingest time",
      "CloudTrail event history covers 90 days; create a trail to keep logs longer",
    ],
    quiz: [
      {
        q: "Which Windows event ID shows that the Security log was cleared?",
        options: ["4624", "4720", "1102", "4688"],
        answer: 2,
        why: "Event 1102 is written when the Security audit log is cleared, a classic sign of an attacker covering tracks.",
      },
      {
        q: "Why is plain syslog over UDP a weak choice for security logs?",
        options: ["It can lose messages without anyone noticing, and it is not encrypted", "It cannot carry Windows events", "It only works on port 6514", "It needs an agent on every host"],
        answer: 0,
        why: "UDP has no delivery confirmation and classic syslog has no encryption, so TCP or TLS is safer.",
      },
      {
        q: "An old syslog line starts with Oct 11 22:14:15. What important information is missing?",
        options: ["The hostname", "The seconds", "The process name", "The year and the time zone"],
        answer: 3,
        why: "RFC 3164 timestamps have no year and no zone, so the SIEM has to guess them.",
      },
      {
        q: "A source sends 1,000 events per second averaging 1 KB each. Roughly how much raw data is that per day?",
        options: ["About 8.6 GB", "About 86 GB", "About 860 GB", "About 1 GB"],
        answer: 1,
        why: "1,000 x 1,000 bytes x 86,400 seconds is about 86.4 GB.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On a Linux machine, show the last 10 failed SSH logins and the last 5 successful ones.",
        hint: "sshd writes \"Failed password\" and \"Accepted\" lines to the auth log or the journal.",
        solution: "sudo grep \"Failed password\" /var/log/auth.log | tail -n 10\nsudo grep \"Accepted\" /var/log/auth.log | tail -n 5\n# RHEL family: use /var/log/secure instead\n# journal only (unit is ssh on Ubuntu, sshd on RHEL):\nsudo journalctl -u ssh --since today | grep -E \"Failed|Accepted\"",
      },
      {
        level: "medium",
        task: "Write a one-page log source plan for a small web shop: one web server, one database, 20 laptops and Microsoft 365. For each source say what to collect, how it is forwarded, and why.",
        hint: "Think about which attack each source would reveal, then about the transport.",
        solution: "Web server: access and error logs, auth log, auditd; agent; shows web attacks and logins.\nDatabase: auth failures, privilege changes; agent; shows data theft attempts.\nLaptops: Sysmon or EDR, Security log 4624/4625/4688; agent; shows malware and misuse.\nMicrosoft 365: Entra ID sign-ins, audit log, mailbox rule changes; cloud API connector; shows stolen accounts.\nFirewall: allow/deny and VPN logins; syslog over TCP to a collector.\nAll: NTP synced, UTC, 90 days hot, 12 months archive.",
      },
      {
        level: "hard",
        task: "Estimate storage: 300 laptops at 5 events per second each, 10 servers at 20 each, and a firewall at 400, average 600 bytes. Give raw GB per day, 90 days hot, and 12 months of archive at 10:1 compression.",
        hint: "Add up events per second first, then multiply by size and 86,400.",
        solution: "EPS = 300x5 + 10x20 + 400 = 2,100\nPer day = 2,100 x 600 x 86,400 = about 109 GB raw\n90 days hot = about 9.8 TB (plus index overhead)\n12 months archive = 109 x 365 / 10 = about 4 TB\nAdd 20 to 30% headroom for growth and bursts.",
      },
    ],
    faq: [
      { q: "Should I just collect every log I can?", a: "No. Volume costs money and slows searches. Collect the sources that map to the attacks you care about, then add more as you find gaps." },
      { q: "What is the difference between Sysmon and the Windows Security log?", a: "The Security log records logons, account changes and basic process starts. Sysmon adds detail such as file hashes, parent processes, network connections and DNS queries, which makes detections much stronger." },
      { q: "Do I need an agent on every machine?", a: "For endpoints and servers, usually yes, because agents buffer, encrypt and resend. Network devices and many cloud services send logs by syslog or through an API connector instead." },
      { q: "How long should I keep security logs?", a: "At least as long as any rule you follow requires, such as 12 months for PCI DSS, and long enough to cover how late intrusions are often found. Many teams keep 90 days searchable and a year or more in cheap archive storage." },
    ],
  },

  "sec-detection/siem-basics": {
    plain: [
      "A SIEM (Security Information and Event Management system) is a big search engine for logs, built for security teams. It pulls logs from servers, laptops, firewalls and cloud accounts into one place, so an analyst can ask one question and get an answer from all of them at once.",
      "Raw logs are just text, and every product writes them differently. The SIEM breaks each line into named fields, such as user, source IP and action. Once a line becomes fields, you can filter (only failed logins), count (failures per user) and sort (worst first).",
      "On top of searching, a SIEM runs saved searches on a schedule. When a search finds something, it creates an alert. Dashboards show the same searches as charts, so you can spot a spike at a glance.",
      "Popular SIEMs include Splunk, Microsoft Sentinel, Elastic Security, Google Security Operations and the open-source Wazuh. Their query languages and prices differ, but the ideas in this lesson work in all of them.",
    ],
    deepDive: [
      {
        heading: "The parts of a SIEM",
        body: "Every SIEM has the same main parts, even if the names differ. Collectors receive logs from agents, syslog and cloud APIs. An ingest pipeline parses each event into fields, renames them to a common schema and enriches them, for example adding the country of an IP, the owner of a host, or a threat intelligence match. Storage indexes the events so searches are fast. A search and rules engine runs queries by hand and on a schedule. Finally, alerts become cases that analysts work through.\n\nIn Splunk, a universal forwarder sends to indexers, and you search on a search head using SPL. In Elastic, Elastic Agent sends to Elasticsearch, and you search in Kibana. In Wazuh, agents send to a manager that applies decoders and rules, then to an indexer and dashboard. Microsoft Sentinel is cloud-only and uses KQL over a Log Analytics workspace.",
      },
      {
        heading: "Parsing and normalisation",
        body: "Parsing turns a raw line into fields. Take the SSH line \"Failed password for admin from 203.0.113.9 port 50122\". A pattern (a regular expression, or a grok pattern in Elastic) pulls out user=admin, source IP=203.0.113.9 and port=50122. If parsing fails, the event is still stored, but searches on those fields will silently miss it. Always check a sample of new data after adding a source.\n\nNormalisation renames fields to one shared schema. A firewall may call it src, Windows calls it IpAddress, and a proxy calls it client_ip. Mapping all of them to one name, such as source.ip in the Elastic Common Schema (ECS), lets one search cover every product. Splunk uses the Common Information Model (CIM), and many vendors now support OCSF, an open schema.",
        visual: {
          type: "flow",
          title: "One SSH line on its way to the index",
          steps: [
            { label: "Raw text", detail: "Failed password for admin from 203.0.113.9" },
            { label: "Parse", detail: "Pattern extracts user, IP and port" },
            { label: "Normalise", detail: "Rename to user.name and source.ip" },
            { label: "Enrich", detail: "Add country, asset owner, intel match" },
            { label: "Index", detail: "Stored and searchable in seconds" },
          ],
        },
      },
      {
        heading: "Schema on write vs schema on read",
        body: "SIEMs decide when to extract fields. Schema on write means parsing happens when data arrives, before it is stored. Elastic and Wazuh mostly work this way. Searches are fast and fields are consistent, but if you get a parser wrong, old data stays wrong unless you re-ingest it.\n\nSchema on read means the raw event is stored and fields are extracted when you search. Splunk works mostly this way. You can fix or add a field extraction later and it applies to old data too, but searches do more work and field names can drift between teams.\n\nIn practice, most platforms mix both. What matters for you as an analyst is knowing which fields exist for a source and checking that they are filled in before you trust a search that returns zero results.",
        visual: {
          type: "compare",
          title: "When fields are extracted",
          columns: [
            { title: "Schema on write", points: ["Parse at ingest", "Fast, consistent searches", "Fixing a parser needs re-ingest", "Examples: Elastic, Wazuh"] },
            { title: "Schema on read", points: ["Store raw, parse at search", "Fix extractions any time", "Searches do more work", "Example: Splunk"] },
          ],
        },
      },
      {
        heading: "Searches that answer questions, and dashboards people use",
        body: "Good searches have the same shape: choose the data, limit the time, filter, then summarise. Picking an index or table and a short time range first is the biggest speed win, because the SIEM can skip most of its storage. Filter down to the events you care about, and only then count and group.\n\nTurn each investigation question into that shape. Which accounts had more than 20 failed logins in the last hour? Which hosts talked to this IP this week? Which processes ran for the first time today? The last kind, comparing against a baseline, is powerful because attackers do new things.\n\nA dashboard is several saved searches drawn as charts. Keep it to a few panels that answer clear questions, such as failed logins over time, top alerting hosts and log volume per source. A sudden drop in volume is itself a warning: a forwarder broke or someone turned logging off.",
        bullets: [
          "KQL: SecurityEvent | where EventID == 4625 | summarize count() by TargetAccount",
          "SPL: index=wineventlog EventCode=4625 | stats count by user",
          "ES|QL: FROM logs-* | WHERE event.code == \"4625\" | STATS n = COUNT(*) BY user.name",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Inside a typical SIEM",
        layers: [
          { label: "Cases and dashboards", detail: "Where analysts work and managers look" },
          { label: "Search and detection rules", detail: "Ad hoc queries and scheduled alerts" },
          { label: "Index and storage tiers", detail: "Hot, warm, cold and archive" },
          { label: "Parse, normalise, enrich", detail: "Raw text becomes named fields" },
          { label: "Collection", detail: "Agents, syslog and cloud API connectors" },
        ],
      },
    ],
    examples: [
      {
        title: "Finding password spraying in Microsoft Sentinel",
        explanation: "Password spraying means trying one or two common passwords against many accounts, to stay under lockout limits. Counting failures per account will not show it, because each account fails only once or twice. Step 1: group failures by source IP and count distinct accounts. Step 2: keep IPs that tried more than 10 accounts. Step 3: for each suspicious IP, check whether any logon from it succeeded (event 4624), since that account needs a reset now.",
        code: {
          lang: "kql",
          code: `SecurityEvent
| where TimeGenerated > ago(1h) and EventID == 4625
| summarize Accounts = dcount(TargetAccount), Attempts = count() by IpAddress
| where Accounts > 10
| sort by Accounts desc

// then, for one suspicious IP:
SecurityEvent
| where TimeGenerated > ago(1h) and EventID == 4624 and IpAddress == "203.0.113.45"
| project TimeGenerated, Computer, TargetAccount, LogonType`,
        },
      },
      {
        title: "Parsing SSH failures with an Elasticsearch ingest pipeline",
        explanation: "Your SSH logs arrive as a single message field, so nobody can search by user or IP. Step 1: create an ingest pipeline with a grok processor that extracts the user, source IP and port into ECS field names, and a set processor that marks the outcome. Step 2: test it with POST _ingest/pipeline/sshd-failed/_simulate and a sample document. Step 3: point the data stream at the pipeline. Step 4: search a few new events to confirm the fields are filled.",
        code: {
          lang: "json",
          code: `PUT _ingest/pipeline/sshd-failed
{
  "processors": [
    { "grok": {
        "field": "message",
        "patterns": ["Failed password for (invalid user )?%{USERNAME:user.name} from %{IP:source.ip} port %{NUMBER:source.port:int}"]
    } },
    { "set": { "field": "event.outcome", "value": "failure" } }
  ]
}`,
        },
      },
    ],
    cheatSheet: [
      "Search shape: data source, time range, filter, then aggregate, then threshold and sort",
      "Filter before you aggregate: it is faster and keeps results readable",
      "KQL distinct count: summarize dcount(TargetAccount) by IpAddress",
      "SPL top talkers: index=fw | stats sum(bytes) as total by src | sort - total",
      "Normalise to one schema (ECS, CIM or OCSF) so one search covers many products",
      "Zero results? Check the field is actually parsed for that source before trusting it",
      "Alert when a source goes quiet: a drop in volume can mean a broken forwarder or tampering",
      "Splunk Free allows 500 MB of data per day, enough for a home lab",
    ],
    quiz: [
      {
        q: "What does parsing do in a SIEM?",
        options: ["Deletes duplicate logs", "Splits raw text into named fields such as user and source IP", "Encrypts logs at rest", "Sends alerts by email"],
        answer: 1,
        why: "Parsing extracts fields so you can filter, count and group on them.",
      },
      {
        q: "Which search pattern best finds password spraying?",
        options: ["Count failures per account", "Sort all events by time", "List all successful logons", "Count distinct accounts per source IP"],
        answer: 3,
        why: "Spraying tries many accounts from one source with few attempts each, so distinct accounts per IP reveals it.",
      },
      {
        q: "What is the main benefit of normalising logs to a common schema like ECS?",
        options: ["One search works across logs from many different products", "Logs use no storage", "Logs become encrypted", "Timestamps change to local time"],
        answer: 0,
        why: "When every product's source IP is called source.ip, one query covers them all.",
      },
      {
        q: "Splunk extracts most fields when you search, while Elastic mostly does it when data arrives. What are these approaches called?",
        options: ["Hot and cold storage", "Push and pull", "Schema on read and schema on write", "Correlation and enrichment"],
        answer: 2,
        why: "Schema on read parses at search time; schema on write parses at ingest.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Without a SIEM, use Linux tools to count failed SSH logins per source IP and show the top 5. This is exactly what a SIEM stats search does.",
        hint: "grep the lines, pull out the IP after \"from\", then sort and uniq -c.",
        solution: "sudo grep \"Failed password\" /var/log/auth.log | grep -oE 'from [0-9.]+ ' | awk '{print $2}' | sort | uniq -c | sort -rn | head -5\n# SIEM equivalent (KQL style):\n# Syslog | where SyslogMessage has \"Failed password\" | summarize count() by SrcIP",
      },
      {
        level: "medium",
        task: "Write a KQL search that finds accounts with 10 or more failed logons followed by a successful logon from the same IP in the last hour.",
        hint: "Build the failures with let, then join them to 4624 events on account and IP.",
        solution: "let fails = SecurityEvent\n| where TimeGenerated > ago(1h) and EventID == 4625\n| summarize Failures = count() by TargetAccount, IpAddress\n| where Failures >= 10;\nSecurityEvent\n| where TimeGenerated > ago(1h) and EventID == 4624\n| join kind=inner fails on TargetAccount, IpAddress\n| project TimeGenerated, Computer, TargetAccount, IpAddress, Failures",
      },
      {
        level: "hard",
        task: "Design a four-panel SOC dashboard and write the query for a \"silent source\" panel that lists hosts which have not sent logs for 30 minutes.",
        hint: "Find the latest event time per table and computer, then keep the old ones.",
        solution: "Panels: 1) failed logons over time, 2) top 10 alerting hosts,\n3) log volume per source per hour, 4) silent sources.\n\nunion withsource=Table SecurityEvent, Syslog\n| where TimeGenerated > ago(1d)\n| summarize LastSeen = max(TimeGenerated) by Table, Computer\n| where LastSeen < ago(30m)\n| sort by LastSeen asc",
      },
    ],
    faq: [
      { q: "Is a SIEM the same as a log management tool?", a: "They overlap. Log management stores and searches logs; a SIEM adds security parsing, detection rules, alerting and case handling on top." },
      { q: "Which SIEM should a beginner learn first?", a: "Splunk and Microsoft Sentinel appear in many job adverts, and Wazuh and Elastic are free to run at home. The search skills transfer, so learn one well and the others come quickly." },
      { q: "Why is my SIEM search so slow?", a: "Usually the time range is too wide or the search starts without choosing an index or table. Narrow the time, pick the data source first, and filter before you aggregate." },
      { q: "Does a SIEM stop attacks?", a: "No. A SIEM detects and helps you investigate. Blocking is done by other tools such as EDR, firewalls or a SOAR playbook that the SIEM can trigger." },
    ],
  },

  "sec-detection/detection-rules": {
    plain: [
      "A detection rule is a saved question that the SIEM asks again and again: did anyone do this suspicious thing? If the answer is yes, it raises an alert. Writing good rules is the core job of a detection engineer, the person who builds and maintains alerts.",
      "Every SIEM has its own query language, so a rule written for Splunk will not run in Elastic. Sigma solves this. You write the rule once in a simple YAML file, and a converter translates it into your SIEM's language, like translating one recipe into many languages.",
      "A Sigma rule has three main parts: which logs to look at (logsource), what to look for (detection), and notes for the analyst who gets the alert (title, level and known false positives). The public SigmaHQ library holds thousands of community rules you can learn from.",
      "A rule is not finished when it is written. You test it: does it fire when the bad thing happens, and does it stay quiet during normal work? A rule that fires 500 times a day on routine admin work will be ignored, which is as bad as having no rule.",
    ],
    deepDive: [
      {
        heading: "Anatomy of a Sigma rule",
        body: "A Sigma rule is a YAML document with a small set of known keys. title is a short name. id is a UUID, so the rule can be tracked even if it is renamed. status shows maturity: experimental, test or stable (plus deprecated and unsupported). description, references, author and date help the next person. tags link the rule to MITRE ATT&CK, for example attack.t1059.001 for PowerShell.\n\nlogsource says which data the rule needs, using category (such as process_creation), product (such as windows) and service (such as security). detection holds one or more named selections and a condition that combines them. falsepositives lists known harmless causes, which is gold for the analyst at 3 a.m. level is one of informational, low, medium, high or critical.",
        visual: {
          type: "tree",
          title: "Sigma rule structure",
          root: "rule.yml",
          children: [
            { label: "Metadata", children: ["title, id", "status, author, date", "description, references"] },
            { label: "tags", children: ["ATT&CK tactic", "ATT&CK technique ID"] },
            { label: "logsource", children: ["category", "product", "service"] },
            { label: "detection", children: ["selections", "filters", "condition"] },
            { label: "Analyst notes", children: ["falsepositives", "level"] },
          ],
        },
      },
      {
        heading: "Selections, modifiers and conditions",
        body: "Inside detection, each selection is a map of field names to values. Fields in the same map are combined with AND. A list of values under one field is combined with OR. So Image ending in powershell.exe AND CommandLine containing any of several flags is one selection with two fields.\n\nModifiers come after a pipe and change how values match: contains, startswith, endswith, all (every listed value must match instead of any), re for regular expressions, cidr for IP ranges, base64offset for finding text hidden in base64, and windash, which matches both -flag and /flag styles. String matching is case-insensitive by default.\n\nThe condition combines selections with and, or, not and brackets. Shortcuts help: 1 of selection_* means any selection whose name starts with selection_, and all of them means every selection.",
        bullets: ["condition: selection and not filter_admin_tools", "condition: 1 of selection_*", "Image|endswith beats Image equals: the drive letter and folder can vary"],
      },
      {
        heading: "Converting with pySigma and sigma-cli",
        body: "Conversion is done by pySigma, a Python library, usually through its command-line tool sigma-cli. Install it with pipx install sigma-cli, then install a backend plugin for your SIEM, for example sigma plugin install splunk. sigma list targets shows the backends you have, and sigma list pipelines shows the processing pipelines.\n\nThe pipeline is the part people forget. Sigma uses generic field names like Image and CommandLine and generic log sources like process_creation. Your SIEM may store the same data under different names and in a specific index. A processing pipeline maps one to the other. With the wrong pipeline, the converted query is valid but never matches anything, which is worse than an error because nobody notices.\n\nThe usual command is sigma convert -t splunk -p sysmon rule.yml. Run sigma check rule.yml first to catch mistakes in the rule itself.",
        visual: {
          type: "flow",
          title: "From Sigma YAML to a live alert",
          steps: [
            { label: "rule.yml", detail: "Generic fields and log source" },
            { label: "sigma check", detail: "Validate the rule" },
            { label: "Pipeline", detail: "Map fields and log source to your SIEM" },
            { label: "Backend", detail: "Write the SIEM query" },
            { label: "Deploy", detail: "Saved search or rule in the SIEM" },
          ],
        },
      },
      {
        heading: "Testing and tuning before production",
        body: "Test in two directions. The positive test proves the rule fires: run the technique in a lab (an Atomic Red Team test is ideal) and check that the alert appears with the right fields. The negative test estimates noise: run the converted query as a normal search over the last 30 days of real data and count the hits. Review a sample. Every harmless hit is either a future false positive or a filter you should add now.\n\nAdd filters as separate named selections, such as filter_sccm, so the reason for each exclusion is readable. Keep filters narrow: an exact path plus a parent process, never a whole folder like C:\\Temp. Start new rules as experimental, move them to test after a week or two in production, and to stable once they behave.\n\nStore rules in git with their test notes. This practice, called detection as code, gives you review, history and a quick way to undo a bad change.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The detection engineering loop",
        steps: [
          { label: "Research", detail: "Pick a technique and its log evidence" },
          { label: "Write", detail: "Sigma rule with tags and notes" },
          { label: "Test", detail: "Positive in lab, negative on real data" },
          { label: "Deploy", detail: "Start as experimental" },
          { label: "Tune", detail: "Learn from every alert and miss" },
        ],
      },
      {
        type: "compare",
        title: "Brittle vs robust detections",
        columns: [
          { title: "Brittle", points: ["Matches one file hash", "Matches an exact tool name", "Breaks when the attacker renames a file", "Easy to write, easy to dodge"] },
          { title: "Robust", points: ["Matches behaviour, like Office starting a shell", "Uses OriginalFileName, not just Image", "Survives small attacker changes", "Needs more testing and tuning"] },
        ],
      },
    ],
    examples: [
      {
        title: "A Sigma rule for encoded PowerShell",
        explanation: "Attackers often hide scripts with powershell -EncodedCommand followed by base64 text. PowerShell accepts short forms such as -enc, -en, -e and the alias -ec. Step 1: choose the log source, Windows process creation (Sysmon event 1 or Security 4688 with command lines). Step 2: select PowerShell by the end of its path. Step 3: select the command line flags, with spaces around them so -ExecutionPolicy does not match. Step 4: require both selections. Step 5: note the known false positive. In a real rule you would also add pwsh.exe and an id generated with uuidgen.",
        code: {
          lang: "yaml",
          code: `title: PowerShell With Encoded Command
status: experimental
tags: [attack.execution, attack.t1059.001]
logsource:
  category: process_creation
  product: windows
detection:
  selection_img:
    Image|endswith: '\\powershell.exe'
  selection_cli:
    CommandLine|contains: [' -e ', ' -en ', ' -enc ', ' -ec ', ' -encodedcommand ']
  condition: all of selection_*
falsepositives:
  - Management tools that pass encoded scripts
level: medium`,
        },
      },
      {
        title: "Converting the rule and testing it both ways",
        explanation: "Step 1: install sigma-cli and the Splunk backend and Sysmon pipeline plugins. Step 2: check and convert the rule. Step 3: paste the query into Splunk and run it over 30 days to count normal hits. Step 4: on a lab Windows VM, run a harmless encoded command (it only prints hi) and confirm the alert appears within a few minutes. If step 3 shows hundreds of hits from one management tool, add a narrow filter for its exact parent process.",
        code: {
          lang: "bash",
          code: `pipx install sigma-cli
sigma plugin install splunk
sigma plugin install sysmon
sigma check enc_powershell.yml
sigma convert -t splunk -p sysmon enc_powershell.yml

# On the lab Windows VM (PowerShell), a harmless positive test:
# $b = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes('Write-Output hi'))
# powershell.exe -enc $b`,
        },
      },
    ],
    cheatSheet: [
      "Sigma core keys: title, logsource, detection (selections plus condition), falsepositives, level",
      "Fields in one selection are ANDed; a list of values for one field is ORed",
      "Common modifiers: contains, startswith, endswith, all, re, cidr, base64offset, windash",
      "Condition examples: selection and not filter, 1 of selection_*, all of them",
      "Tag rules with ATT&CK, for example attack.t1059.001, to measure coverage",
      "sigma convert -t TARGET -p PIPELINE rule.yml; sigma list targets shows backends",
      "Before deploying, run the query over 30 days of real data and count the hits",
      "Match OriginalFileName as well as Image to catch renamed tools",
    ],
    quiz: [
      {
        q: "In a Sigma selection, one field has a list of three values. How are they combined?",
        options: ["All three must match", "Only the first one counts", "They are ignored", "Any one of them can match"],
        answer: 3,
        why: "A list under a single field is an OR; use the all modifier if every value must match.",
      },
      {
        q: "What does a processing pipeline do during Sigma conversion?",
        options: ["Maps Sigma's generic field names and log sources to your SIEM's names", "Runs the attack in a lab", "Uploads rules to GitHub", "Scores the rule's severity"],
        answer: 0,
        why: "Without the right mapping the query is valid but searches fields that do not exist.",
      },
      {
        q: "Why match OriginalFileName as well as Image?",
        options: ["It is faster", "It works on Linux too", "An attacker can rename a file, but its embedded original name stays the same", "It removes all false positives"],
        answer: 2,
        why: "OriginalFileName comes from the file's version information, so copying powershell.exe to notes.exe does not change it.",
      },
      {
        q: "Your new rule fires 400 times a day, all from one backup tool. What is the best fix?",
        options: ["Delete the rule", "Add a narrow, documented filter for that tool's exact path and parent process", "Set the level to informational and ignore it", "Exclude the whole host forever"],
        answer: 1,
        why: "A narrow filter removes the known noise while keeping the rule useful everywhere else.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write only the detection block of a Sigma rule that catches net.exe or net1.exe adding a user to the local Administrators group (net localgroup administrators NAME /add).",
        hint: "Use endswith with a list for the two programs, and contains|all for the three words.",
        solution: "detection:\n  selection:\n    Image|endswith: ['\\net.exe', '\\net1.exe']\n    CommandLine|contains|all: ['localgroup', 'administrators', '/add']\n  condition: selection",
      },
      {
        level: "medium",
        task: "Write a full Sigma rule for scheduled task creation with schtasks.exe /create, with a filter that excludes one known updater as the parent process.",
        hint: "A named filter_ selection plus \"selection and not filter_...\" keeps the reason visible.",
        solution: "title: Scheduled Task Created With Schtasks\ntags: [attack.persistence, attack.t1053.005]\nlogsource: {category: process_creation, product: windows}\ndetection:\n  selection:\n    Image|endswith: '\\schtasks.exe'\n    CommandLine|contains: '/create'\n  filter_updater:\n    ParentImage: 'C:\\Program Files\\ExampleUpdater\\updater.exe'\n  condition: selection and not filter_updater\nfalsepositives: [Software installers and updaters]\nlevel: low",
      },
      {
        level: "hard",
        task: "Take one community rule from SigmaHQ, convert it for your SIEM, and write a short test report: positive test result, 30-day hit count, filters added, and the status you would give it.",
        hint: "Use an Atomic Red Team test with the same ATT&CK ID as the rule's tag for the positive test.",
        solution: "1. sigma convert -t <target> -p <pipeline> rule.yml\n2. Positive: run the matching atomic test in the lab, record time and alert ID.\n3. Negative: run the query over 30 days, count hits, sample 20.\n4. For each harmless pattern, add a filter_ selection with a comment.\n5. Re-run the 30-day search to confirm the drop.\n6. Status: experimental if still noisy, test if under a few hits a day.\n7. Commit the rule and the report to git.",
      },
    ],
    faq: [
      { q: "Is Sigma a SIEM?", a: "No. Sigma is only a rule format plus converters. You still need a SIEM or log platform to run the converted queries." },
      { q: "What is the difference between Sigma, YARA and Suricata rules?", a: "Sigma matches log events, YARA matches patterns inside files or memory, and Suricata or Snort rules match network traffic. Mature teams use all three." },
      { q: "Can I deploy SigmaHQ community rules straight to production?", a: "Not blindly. Convert them, run them against your own data to see the noise, and add filters for your environment before they create alerts." },
      { q: "How do I get a UUID for the id field?", a: "Run uuidgen on Linux or macOS, or [guid]::NewGuid() in PowerShell. Never copy the id from another rule." },
    ],
  },

  "sec-detection/alert-triage": {
    plain: [
      "A SOC (security operations centre) may see hundreds of alerts a day. Triage, a word borrowed from hospital emergency rooms, means quickly deciding which alerts are real, how serious they are and what to do next. Most alerts turn out to be harmless, so speed and good judgement both matter.",
      "Each alert ends with a verdict. True positive: real malicious activity. False positive: the rule matched something it should not have. Benign true positive: the rule worked and the activity really happened, but it was allowed, like an IT admin running a scanner on purpose.",
      "Good triage is mostly about context. Who is the user, and is this normal for them? What is the host, and how important is it? What happened just before and just after? An alert that looks scary on its own often becomes obvious once you see its neighbours.",
      "Always write down why you decided what you decided. Notes let the next analyst pick up the case, let your lead check your work, and show which rules are noisy and need tuning.",
    ],
    deepDive: [
      {
        heading: "A triage checklist you can follow every time",
        body: "A fixed checklist keeps you calm and consistent, especially at the end of a long shift. First, read the rule: what behaviour does it look for, and what are its known false positives? Second, open the raw event and confirm the fields are what the alert claims. Third, check how wide it is: has the same indicator, hash or user appeared on other hosts? Fourth, enrich: IP and domain reputation, file hash lookups, asset and user details. Fifth, look around the event, about 30 minutes before and after, at logons, processes and network connections on that host. Then decide, act and write it up.\n\nSet a timebox, for example 30 minutes for a medium alert. If you still cannot rule out compromise when it runs out, escalate rather than guess.",
        bullets: ["Read the rule and its false positives", "Verify the raw event", "Check spread to other hosts", "Enrich and look around the event", "Decide, act, document"],
      },
      {
        heading: "Context on the user, host and process",
        body: "For the user, ask: what is their job, are they an admin, where and when do they normally work, and did anything change recently, such as a password reset, a new MFA device, or a notice that they are leaving? For the host: who owns it, how critical is it (a domain controller matters more than a test VM), is it internet-facing, and is its EDR agent healthy?\n\nFor the process, the parent-child chain tells a story. explorer.exe starting chrome.exe is normal. winword.exe starting powershell.exe almost never is. Check whether the file is signed, where it lives (a program in a user's Downloads or AppData folder is more suspicious than one in Program Files) and how common it is. Prevalence is powerful: a binary seen on one host in your fleet deserves more attention than one seen on 2,000.",
        visual: {
          type: "tree",
          title: "Context to gather for one alert",
          root: "Alert",
          children: [
            { label: "User", children: ["Role and privileges", "Normal hours and places", "Recent resets or MFA changes"] },
            { label: "Host", children: ["Owner and criticality", "Internet-facing?", "EDR healthy?"] },
            { label: "Process", children: ["Parent and children", "Signed? Where on disk?", "How many hosts run it"] },
            { label: "Network", children: ["Destination reputation", "Domain age", "Bytes sent"] },
            { label: "History", children: ["Same alert before?", "Past verdicts and notes"] },
          ],
        },
      },
      {
        heading: "Prioritising the queue",
        body: "Not every alert deserves the same speed. A simple way to rank them is rule severity times asset importance times confidence. A medium alert on a domain controller can outrank a high alert on a sandbox VM. Many SOCs set response targets per priority, for example acknowledging critical alerts within minutes, and track two numbers: mean time to acknowledge (MTTA) and mean time to respond or resolve (MTTR).\n\nBe careful with metrics. If analysts are judged only on how fast they close alerts, they will close real attacks by mistake. Good teams also review a sample of closed alerts every week to check quality.",
      },
      {
        heading: "Escalate or close, and what to write",
        body: "Escalate when activity is confirmed or likely malicious, when a privileged account or critical server is involved, when several hosts are affected, when data may be leaving, or when your timebox runs out. An escalation should let the next tier act without redoing your work: a one-line summary, what you checked, the evidence (search links, process tree, hashes, IPs), any action already taken, and open questions.\n\nWhen you close, write the verdict and the reason in one or two sentences. \"Benign true positive: IT ran an approved Nessus scan, change ticket CHG-1234\" is useful. \"FP\" is not. If the same harmless cause keeps appearing, raise a tuning request instead of closing it again and again.",
        visual: {
          type: "sequence",
          title: "Checking with the owner, then escalating",
          actors: ["Tier 1", "Host owner", "Tier 2"],
          messages: [
            { from: 0, to: 1, label: "Did you run this tool at 09:14?" },
            { from: 1, to: 0, label: "No, never heard of it" },
            { from: 0, to: 2, label: "Escalate with evidence and timeline" },
            { from: 2, to: 0, label: "Accepted, isolating the host" },
          ],
        },
      },
      {
        heading: "Tuning noisy rules safely",
        body: "A noisy rule trains people to ignore it, so tuning is part of triage. Suppression hides repeats of the same alert for a while; tuning changes the rule logic. Prefer tuning, and keep each exclusion as narrow as possible: an exact file path plus the signer or parent process, not a wildcard like any user containing admin or any path under C:\\Temp. Attackers read the same blog posts and will happily drop their tools in a folder you excluded.\n\nGive every exclusion a reason, an owner and a review date, and keep it in version control with the rule. After tuning, re-run the rule over past data to confirm the noise dropped and the true positives still match.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Three verdicts and what follows",
        root: "Verdict",
        children: [
          { label: "True positive", children: ["Malicious and real", "Escalate or open an incident", "Contain if needed"] },
          { label: "Benign true positive", children: ["Real but allowed", "Record the approval", "Consider a narrow exclusion"] },
          { label: "False positive", children: ["Rule matched wrongly", "Fix the rule logic", "Record why"] },
        ],
      },
      {
        type: "compare",
        title: "Bad vs good exclusions",
        columns: [
          { title: "Too broad", points: ["Any process in a Temp folder", "Any user with admin in the name", "Whole host excluded", "No reason or end date"] },
          { title: "Narrow", points: ["Exact path plus signer", "Specific parent process", "Only the noisy rule", "Reason, owner, review date"] },
        ],
      },
    ],
    examples: [
      {
        title: "Triage: Word started PowerShell",
        explanation: "Alert: winword.exe spawned powershell.exe on FIN-LT-042 for user a.patel. Step 1: the rule looks for Office apps starting shells, a common sign of a malicious macro. Step 2: the raw event shows powershell -enc followed by base64. Decoding it reveals a download from an unknown domain. Step 3: no other hosts show the same command. Step 4: the domain was registered two days ago and the user is in finance, not IT. Step 5: within a minute, the host made an outbound connection to that domain. Verdict: true positive. Action: escalate to tier 2 with the decoded command, domain, timeline and a request to isolate the host and find the source email.",
      },
      {
        title: "Triage: impossible travel sign-in",
        explanation: "Alert: user amira signed in from London, then from Singapore 20 minutes later. Step 1: pull her last 24 hours of sign-ins. Step 2: the Singapore IP belongs to the company's own VPN provider, and both sign-ins come from the same device ID with MFA satisfied. Step 3: IT confirms she connects through that VPN exit. Verdict: benign true positive. Action: close with the reason and ask the identity team to mark the VPN ranges as a trusted named location, so the rule stops firing for them but still fires for unknown IPs.",
        code: {
          lang: "kql",
          code: `SigninLogs
| where TimeGenerated > ago(24h) and UserPrincipalName == "amira@example.com"
| project TimeGenerated, IPAddress, Location, AppDisplayName,
          DeviceId = tostring(DeviceDetail.deviceId),
          AuthenticationRequirement, ResultType
| sort by TimeGenerated asc`,
        },
      },
    ],
    cheatSheet: [
      "Verdicts: true positive, benign true positive, false positive; write the reason for each",
      "Office or a browser starting cmd.exe or powershell.exe is a classic red flag",
      "Prevalence: a binary on 1 host is more suspicious than one on 2,000",
      "Priority is roughly severity x asset importance x confidence",
      "Look about 30 minutes before and after the alert for logons, processes and connections",
      "Set a timebox; if you still cannot rule out compromise, escalate",
      "Exclusions must be narrow (path plus signer or parent), with a reason and review date",
      "MTTA = mean time to acknowledge; MTTR = mean time to respond or resolve",
    ],
    quiz: [
      {
        q: "An IT admin runs an approved vulnerability scanner and triggers a port scan alert. What is the best verdict?",
        options: ["True positive, escalate", "False positive, delete the rule", "Benign true positive", "Unknown, ignore it"],
        answer: 2,
        why: "The rule worked and the scan really happened, but it was authorised.",
      },
      {
        q: "Which parent and child process pair is most suspicious?",
        options: ["explorer.exe starting chrome.exe", "winword.exe starting powershell.exe", "services.exe starting svchost.exe", "explorer.exe starting notepad.exe"],
        answer: 1,
        why: "Word has no normal reason to start PowerShell; this pattern often means a malicious macro.",
      },
      {
        q: "Which exclusion is safest for a noisy rule?",
        options: ["Exclude any path containing Temp", "Exclude all admin accounts", "Disable the rule for a week", "Exclude the exact signed binary path when started by its known parent"],
        answer: 3,
        why: "It removes the known noise while leaving almost no room for an attacker to hide.",
      },
      {
        q: "The same medium alert fires on a test VM and on a domain controller. Which do you look at first?",
        options: ["The domain controller, because its compromise affects every account", "The test VM, because it fired first", "Both are equal priority", "Neither, server alerts are usually noise"],
        answer: 0,
        why: "Asset importance raises priority, and a domain controller controls the whole domain.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Give a verdict for each: (a) a login alert from a known VPN IP after a help desk password reset; (b) a malware alert on a file that turns out to be a clean, signed installer; (c) PowerShell downloading from a two-day-old domain on a finance laptop.",
        hint: "Ask: did it really happen, was it allowed, and did the rule match correctly?",
        solution: "(a) Benign true positive: real login, explained by the reset.\n(b) False positive: the rule or engine misjudged a clean file.\n(c) Likely true positive: escalate with the domain, command and host.",
      },
      {
        level: "medium",
        task: "Write a reusable triage note template that a tier 1 analyst can fill in for any alert.",
        hint: "Cover what fired, what you checked, what you found, the verdict and the next step.",
        solution: "Alert: name, rule ID, time (UTC), host, user\nWhat the rule looks for: one line\nChecks done: raw event, spread, reputation, user, host, +/- 30 min\nFindings: bullet list with evidence links\nVerdict: TP / BTP / FP, with reason\nActions taken: none / isolated / account disabled\nNext step: close / escalate to / tuning request\nTime spent: minutes",
      },
      {
        level: "hard",
        task: "A rule for new Windows services (event 7045) fires about 60 times a day, mostly from your software deployment tool. Plan a tuning change and explain how you will prove it is safe.",
        hint: "Find the common fields of the noisy events first, then exclude as little as possible.",
        solution: "1. Group 30 days of hits by service file path, account and host.\n2. Confirm the noise is the deployment tool's agent path, signed by its vendor.\n3. Add a filter: exact ImagePath of that agent AND service account used by it.\n4. Do not exclude hosts or whole folders.\n5. Re-run 30 days: expect a few hits a day, review them.\n6. Run a lab test (sc.exe create) to prove a new service still alerts.\n7. Commit with reason, owner and a 6-month review date.",
      },
    ],
    faq: [
      { q: "Is it normal that most alerts are not real attacks?", a: "Yes. In many SOCs most alerts end up benign or false positives. The goal is to tune rules so the share of useful alerts keeps rising, not to expect every alert to be an attack." },
      { q: "What is the difference between a false positive and a benign true positive?", a: "In a false positive the rule matched something it should not have. In a benign true positive the rule worked correctly and the activity happened, but it was authorised." },
      { q: "When should a junior analyst escalate?", a: "When activity looks malicious, involves privileged accounts or critical systems, spreads to several hosts, or when you cannot rule it out within your timebox. Escalating with good notes is never a mistake." },
      { q: "What is alert fatigue?", a: "It is what happens when analysts see so many low-value alerts that they start skimming or ignoring them, and real attacks slip through. Tuning and good prioritisation are the cure." },
    ],
  },

  "sec-detection/ids-edr": {
    plain: [
      "Attackers leave traces in two places: on the network, as they move data around, and on computers, as they run programs. Defenders watch both. Network tools look at traffic on the wire. Endpoint tools sit on each laptop or server.",
      "An IDS (intrusion detection system) such as Suricata or Snort watches a copy of network traffic and compares it with rules that describe known attacks. When something matches, it writes an alert. An IPS (intrusion prevention system) sits in the traffic path, so it can also drop the bad packets.",
      "An EDR (endpoint detection and response) agent runs on each computer. It records which programs start, which files they touch and where they connect. It can also act: stop a process, quarantine a file, or cut the machine off the network while keeping a line open for the security team.",
      "In between sits network metadata: NetFlow and Zeek logs. They do not store full packets, just a summary of each connection. That is cheap to keep for months and very good for spotting odd patterns, like a laptop talking to the same rare server every minute.",
    ],
    deepDive: [
      {
        heading: "Where network sensors sit",
        body: "An IDS needs to see traffic. The usual way is a SPAN port, where a switch copies traffic to the sensor, or a network TAP, a small device that splits a cable. Both are passive: if the sensor crashes, the network keeps working, but the sensor can only alert, not block. An IPS sits inline, so traffic flows through it. It can drop packets, but it adds a little delay, and you must choose what happens when it fails: fail open (traffic passes uninspected) or fail closed (traffic stops).\n\nPlace sensors where traffic crosses trust boundaries: the internet edge, between user and server networks, and in front of critical systems. Encryption limits what they see. With TLS, the payload is hidden, but the server name (SNI), the TLS fingerprint (JA3 or JA4) and connection sizes and timing are still visible and useful.",
        visual: {
          type: "compare",
          title: "Passive sensor vs inline sensor",
          columns: [
            { title: "Passive (SPAN or TAP)", points: ["Gets a copy of traffic", "Can alert, cannot block", "Failure does not break the network", "May miss packets when overloaded"] },
            { title: "Inline (IPS)", points: ["Traffic flows through it", "Can drop bad packets", "Adds a little latency", "Must fail open or fail closed"] },
          ],
        },
      },
      {
        heading: "Reading a Suricata alert",
        body: "Suricata writes JSON events, one per line, to eve.json. An alert has event_type set to alert, a timestamp, the five-tuple (src_ip, src_port, dest_ip, dest_port, proto) and an alert object. Inside it, signature is the human-readable rule message, signature_id (the SID) and rev identify the exact rule, category gives the class, severity runs from 1 (most severe) downward, and action says allowed or blocked.\n\nRead it in order. Which way did traffic go: from your host out, or from outside in? Is the destination internal or external? Look up the rule by its SID to see exactly what it matched. Then use flow_id: every event Suricata writes about the same connection, including http, dns, tls and flow records, shares it, so you can see the full conversation and whether the server answered. Rules are commonly kept up to date with suricata-update, which pulls the free ET Open ruleset by default.",
        bullets: ["Rule shape: action proto src port -> dst port (options; sid:N; rev:N;)", "Local rules use SIDs of 1000000 and above", "suricata -T -c /etc/suricata/suricata.yaml tests the config"],
      },
      {
        heading: "NetFlow and Zeek: a diary of connections",
        body: "NetFlow (and its standard cousin IPFIX) is exported by routers and firewalls. Each record says who talked to whom: source and destination IP and port, protocol, start and end time, bytes and packets. There is no payload, and busy routers often sample, recording only some packets.\n\nZeek is a network analysis tool that watches traffic and writes rich, structured logs: conn.log for every connection, plus dns.log, http.log, ssl.log, files.log, x509.log and notice.log. Every connection gets a uid, so you can join its DNS lookup, TLS details and file transfers across logs. The conn_state field tells you how a connection went: SF is a normal open and close, S0 means no reply, REJ means it was refused.\n\nUse this metadata to hunt: regular small connections (beaconing), large uploads (orig_bytes much bigger than resp_bytes), very long connections and destinations no other host visits.",
        visual: {
          type: "tree",
          title: "One connection across Zeek logs (same uid)",
          root: "uid CHhAvVGS1DHFjwGM9",
          children: [
            { label: "conn.log", children: ["IPs and ports", "duration and bytes", "conn_state"] },
            { label: "dns.log", children: ["query name", "answers"] },
            { label: "ssl.log", children: ["server_name (SNI)", "TLS version"] },
            { label: "files.log", children: ["file type", "hashes"] },
          ],
        },
      },
      {
        heading: "What EDR records and how it responds",
        body: "An EDR agent hooks deep into the operating system. On Windows it uses kernel callbacks and Event Tracing for Windows (ETW); on Linux it often uses eBPF or similar kernel features. It records process starts with command line, hash, signer and parent; file writes; registry changes; network connections; DLL and module loads; and attempts to read another process's memory, such as LSASS, where Windows keeps login secrets. Many also capture script content through AMSI.\n\nThe agent streams this to a backend that applies behaviour rules and machine learning, and draws the process tree for each alert. Response actions include isolating the host (blocking all traffic except to the EDR console), killing a process, quarantining a file, running a remote shell for live response and collecting files or memory.\n\nAttackers try to stop or blind EDR, so turn on tamper protection and alert when an agent goes silent.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Following one threat across network and endpoint tools",
        steps: [
          { label: "Suricata alert", detail: "Known bad TLS fingerprint to a rare IP" },
          { label: "Zeek conn.log", detail: "Same host connects every 60 seconds" },
          { label: "Zeek dns.log", detail: "Reveals the domain behind the IP" },
          { label: "EDR process tree", detail: "Shows which program made the calls" },
          { label: "EDR response", detail: "Isolate host, collect evidence" },
        ],
      },
    ],
    examples: [
      {
        title: "Reading Suricata alerts with jq",
        explanation: "You get a ticket about Suricata alerts from host 10.0.5.23. Step 1: print the latest alerts in a compact form with the fields that matter. Step 2: note the signature, direction and action (allowed means it was not blocked). Step 3: copy the flow_id of one alert and print every event with that ID, which shows the matching dns, tls or http records. Step 4: look up the SID in the rules file to see exactly what matched, then decide whether to pivot to the EDR for that host.",
        code: {
          lang: "bash",
          code: `jq -c 'select(.event_type=="alert" and .src_ip=="10.0.5.23")
  | {ts: .timestamp, dst: .dest_ip, dport: .dest_port, sid: .alert.signature_id,
     sig: .alert.signature, sev: .alert.severity, action: .alert.action}' \\
  /var/log/suricata/eve.json | tail -n 5

# all events for one connection
jq -c 'select(.flow_id==1234567890123456)' /var/log/suricata/eve.json

# what the rule matches (use the SID from the alert)
grep "sid:2027865;" /var/lib/suricata/rules/suricata.rules`,
        },
      },
      {
        title: "Spotting beaconing in Zeek conn.log",
        explanation: "Malware often checks in with its server at a fixed interval. Step 1: list connections from one host to one rare destination. Step 2: compute the seconds between each connection and its previous one, rounded to whole numbers. Step 3: count how often each gap appears. If most gaps are 60 seconds and the bytes are small and similar, you are looking at a likely beacon. Step 4: check dns.log and ssl.log with the same uid values, then the EDR for the process.",
        code: {
          lang: "bash",
          code: `zeek-cut ts id.orig_h id.resp_h id.resp_p orig_bytes resp_bytes < conn.log \\
  | awk '$2=="10.0.5.23" && $3=="198.51.100.7"' | head

# gaps between connections, most common first
zeek-cut ts id.orig_h id.resp_h < conn.log \\
  | awk '$2=="10.0.5.23" && $3=="198.51.100.7" {if (p) printf "%d\\n", $1-p; p=$1}' \\
  | sort -n | uniq -c | sort -rn | head`,
        },
      },
    ],
    cheatSheet: [
      "IDS alerts on a copy of traffic; an IPS sits inline and can drop packets",
      "Suricata writes JSON to eve.json; event_type alert holds the rule matches",
      "Use flow_id to join a Suricata alert with its http, dns, tls and flow events",
      "suricata-update keeps rules current; ET Open is the free default ruleset",
      "Zeek uid links one connection across conn.log, dns.log, http.log and ssl.log",
      "zeek-cut picks columns: zeek-cut id.orig_h id.resp_h id.resp_p < conn.log",
      "NetFlow and IPFIX: who talked to whom, when and how much, with no payload",
      "EDR response: isolate host, kill process, quarantine file, collect evidence",
    ],
    quiz: [
      {
        q: "Which sensor placement lets you block malicious traffic?",
        options: ["Inline, with traffic passing through the sensor", "A SPAN port", "A network TAP", "A NetFlow collector"],
        answer: 0,
        why: "Only an inline device sees packets before they are delivered, so only it can drop them.",
      },
      {
        q: "In Suricata's eve.json, which field links an alert to the http and dns events of the same connection?",
        options: ["alert.rev", "proto", "flow_id", "alert.severity"],
        answer: 2,
        why: "Every event about one flow carries the same flow_id.",
      },
      {
        q: "A laptop sends about 300 bytes to the same rare IP every 60 seconds all night. What is this pattern?",
        options: ["A port scan", "Likely beaconing to a command-and-control server", "Normal DNS caching", "A TLS handshake failure"],
        answer: 1,
        why: "Regular, small, repeated check-ins to a rare destination are the signature of a beacon.",
      },
      {
        q: "What does EDR host isolation do?",
        options: ["Powers off the computer", "Wipes the disk", "Moves the host to guest Wi-Fi", "Blocks network traffic except to the EDR console, so responders keep access"],
        answer: 3,
        why: "Isolation stops the attacker and any spread while the team can still investigate remotely.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run Suricata offline against a sample PCAP file and list the alert signatures by count.",
        hint: "suricata -r reads a PCAP file; -l sets the output folder.",
        solution: "sudo suricata-update\nmkdir -p out\nsuricata -r sample.pcap -l ./out -k none\njq -r 'select(.event_type==\"alert\") | .alert.signature' out/eve.json | sort | uniq -c | sort -rn",
      },
      {
        level: "medium",
        task: "Write a local Suricata rule that alerts when a host on your network sends HTTP requests with a user agent containing curl, then test that the config still loads.",
        hint: "Use the http.user_agent sticky buffer and a SID of 1000000 or higher.",
        solution: "# /etc/suricata/rules/local.rules\nalert http $HOME_NET any -> $EXTERNAL_NET any (msg:\"LOCAL curl user agent outbound\"; flow:established,to_server; http.user_agent; content:\"curl\"; nocase; classtype:policy-violation; sid:1000001; rev:1;)\n\n# add local.rules under rule-files in suricata.yaml, then:\nsudo suricata -T -c /etc/suricata/suricata.yaml",
      },
      {
        level: "hard",
        task: "Run Zeek on a PCAP and find the top 5 internal hosts (10.x.x.x) by bytes sent to external addresses.",
        hint: "orig_bytes is what the connection's originator sent; skip rows where it is \"-\".",
        solution: "zeek -r sample.pcap\nzeek-cut id.orig_h id.resp_h orig_bytes < conn.log \\\n  | awk '$3 != \"-\" && $1 ~ /^10\\./ && $2 !~ /^10\\./ {up[$1]+=$3} END {for (h in up) print up[h], h}' \\\n  | sort -rn | head -5",
      },
    ],
    faq: [
      { q: "Do I still need an IDS if I have EDR?", a: "They see different things. EDR cannot run on printers, cameras, network gear or unmanaged devices, and an IDS or Zeek sensor still sees their traffic. Many teams use both." },
      { q: "What is the difference between EDR and antivirus?", a: "Antivirus mainly blocks known bad files. EDR records detailed behaviour over time, detects suspicious activity even from unknown tools, and gives responders actions such as isolation and live response." },
      { q: "Can an IDS see inside HTTPS traffic?", a: "Not the content, unless traffic is decrypted at a proxy. It can still see metadata like the server name, TLS fingerprint, certificate details in older TLS versions, and connection timing and size." },
      { q: "What is XDR?", a: "Extended detection and response combines EDR with other sources such as email, identity, network and cloud in one product, so alerts from different places are correlated automatically." },
    ],
  },
};

export default extra;
