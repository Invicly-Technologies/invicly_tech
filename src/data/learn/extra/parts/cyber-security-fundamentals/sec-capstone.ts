import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-capstone/lab-build": {
    plain: [
      "A home SOC lab is a small, private copy of a company network that runs inside your own computer. SOC means security operations centre, the team that watches for attacks. In your lab you play both sides: you create activity on the machines and then try to spot it in the logs.",
      "You need three kinds of virtual machines (VMs), which are computers simulated by software called a hypervisor, such as VirtualBox, VMware Workstation or Proxmox. One Windows VM acts like an employee laptop. One Linux VM acts like a server. One more VM runs the SIEM, the tool that collects and searches logs.",
      "The most important rule is isolation. Your lab must not be able to reach your home network, your work laptop or the internet while you run tests. You put the VMs on a private virtual network that only they share, so nothing you do can escape.",
      "Plan your hardware. A comfortable lab wants about 16 GB of RAM or more and 150 GB of free disk. The SIEM is the hungriest part: an all-in-one Wazuh or Elastic server wants around 8 GB of RAM on its own. If your machine is smaller, run fewer VMs at once.",
    ],
    deepDive: [
      {
        heading: "Designing an isolated network",
        body: "Hypervisors offer several network modes. NAT gives the VM internet access through your host. Bridged puts the VM directly on your home network, which you should never use for an attack lab. Host-only creates a private network shared by the VMs and your host computer. Internal network (VirtualBox) or a custom LAN segment (VMware) connects VMs to each other only, not even to the host.\n\nA practical design: put all lab VMs on one host-only or internal network, for example 10.10.10.0/24, with static IPs. During setup you will need the internet to download updates and packages, so add a temporary NAT adapter, install everything, then disconnect it and take a snapshot. Some people add a small pfSense or OPNsense VM as a router and firewall, which also gives you firewall logs to collect.\n\nRun the lab on a personal machine, never on an employer's laptop or network, and never point lab tools at systems you do not own.",
        visual: {
          type: "layers",
          title: "A simple lab layout",
          layers: [
            { label: "Your physical computer", detail: "Hypervisor, no tools aimed outward" },
            { label: "Internal lab network 10.10.10.0/24", detail: "No route to home network or internet" },
            { label: "SIEM VM 10.10.10.10", detail: "Wazuh or Elastic, 4 vCPU, 8 GB RAM" },
            { label: "Windows VM 10.10.10.20", detail: "Sysmon plus SIEM agent" },
            { label: "Linux VM 10.10.10.30", detail: "SSH, auth logs, SIEM agent" },
          ],
        },
      },
      {
        heading: "Choosing a SIEM for the lab",
        body: "Wazuh is free and open source. Its all-in-one install script sets up the server (which analyses events with its own rules), an OpenSearch-based indexer and a web dashboard on one VM. Agents send events to the server on TCP port 1514 and enrol on TCP 1515. It ships with many ready rules, including ones mapped to MITRE ATT&CK, so you see alerts quickly.\n\nElastic Security uses Elasticsearch and Kibana, with Elastic Agent managed centrally through Fleet. It has a strong query language and a large prebuilt detection rule set. Splunk offers a free licence limited to a small daily ingest volume, which suits a lab and teaches SPL, a language many SOCs use. Security Onion bundles network monitoring (Suricata and Zeek) with Elastic for a network-focused lab.\n\nPick one and go deep. Employers care more that you can ingest, search, detect and investigate than which brand you used.",
        bullets: [
          "Wazuh: fastest route to alerts, good ATT&CK tagging",
          "Elastic: strong search and prebuilt rules",
          "Splunk free licence: learn SPL",
          "Security Onion: network monitoring focus",
        ],
      },
      {
        heading: "Making Windows produce useful logs",
        body: "A fresh Windows install logs surprisingly little. Fix three things. First, install Sysmon from Microsoft Sysinternals with a community configuration, such as the SwiftOnSecurity config or Olaf Hartong's sysmon-modular. Sysmon writes to the Microsoft-Windows-Sysmon/Operational log: process creation (event 1), network connections (3), file creation (11), registry changes (12 to 14) and DNS queries (22).\n\nSecond, turn on advanced audit policy for logon events and process creation, and the group policy setting that includes command lines in event 4688. Third, enable PowerShell Script Block Logging so event 4104 records scripts.\n\nThen tell the SIEM agent to read the Sysmon channel. In Wazuh this is a localfile block in the agent's ossec.conf with log_format eventchannel. For Windows evaluation licences, Microsoft offers time-limited evaluation copies of Windows 11 Enterprise and Windows Server, which are fine for a lab.",
      },
      {
        heading: "Linux logs and keeping time in sync",
        body: "On the Linux VM, the most useful sources are authentication logs (/var/log/auth.log on Debian and Ubuntu, /var/log/secure on RHEL family, or the systemd journal), auditd for detailed process and file auditing, and any web server logs if you run a service. Install the SIEM agent and confirm it reads these.\n\nTime matters more than beginners expect. If the Windows VM clock is five minutes off, your timeline will show effects before causes. Make every VM sync with the same time source (the SIEM VM can act as an NTP server on the isolated network) and store or display times in UTC.\n\nFinally, take snapshots. Make a clean baseline snapshot of every VM after setup and before any test. Name them clearly, for example win11-baseline-sysmon, so you can roll back in seconds.",
        bullets: [
          "timedatectl shows Linux time sync status",
          "w32tm /query /status shows Windows time sync",
          "Snapshot after setup, before every test",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How one Windows event reaches the SIEM",
        actors: ["Windows VM", "Wazuh agent", "Wazuh server", "Dashboard"],
        messages: [
          { from: 0, to: 1, label: "Sysmon writes event 1 (process created)" },
          { from: 1, to: 2, label: "Agent sends event on TCP 1514" },
          { from: 2, to: 1, label: "Acknowledges receipt" },
          { from: 2, to: 3, label: "Decoded, matched, indexed with rule level" },
          { from: 3, to: 2, label: "Analyst search queries the index" },
        ],
      },
    ],
    examples: [
      {
        title: "Install Sysmon and forward it to Wazuh",
        explanation: "On the Windows VM, open an admin PowerShell. Step 1: download Sysmon from the official Sysinternals site and a community config file into a folder. Step 2: install Sysmon with the config. Step 3: check that events appear in the Sysmon log. Step 4: add the Sysmon channel to the Wazuh agent configuration and restart the agent. Step 5: open the Wazuh dashboard, filter on the Windows agent, and run notepad.exe to see a process creation event arrive.",
        code: {
          lang: "powershell",
          code: ".\\Sysmon64.exe -accepteula -i .\\sysmonconfig.xml\nGet-WinEvent -LogName 'Microsoft-Windows-Sysmon/Operational' -MaxEvents 3\n\n# Add inside <ossec_config> in\n# C:\\Program Files (x86)\\ossec-agent\\ossec.conf :\n#   <localfile>\n#     <location>Microsoft-Windows-Sysmon/Operational</location>\n#     <log_format>eventchannel</log_format>\n#   </localfile>\nRestart-Service -Name wazuh"
        },
      },
      {
        title: "Prove the lab is isolated",
        explanation: "Before any test, check isolation from inside each VM. Step 1: from the Windows VM, ping the SIEM VM (should work) and a public address like 1.1.1.1 (should fail). Step 2: try to reach your home router's IP (should fail). Step 3: on Linux, check the routing table has no default route to the outside. Step 4: write the results in your lab notes with the date. This takes two minutes and is the most important safety check in the whole capstone.",
        code: {
          lang: "bash",
          code: "ping -c 2 10.10.10.10        # SIEM: should reply\nping -c 2 -W 2 1.1.1.1       # internet: should fail\nping -c 2 -W 2 192.168.1.1   # home router: should fail\nip route                     # no default route expected\ncurl -m 5 https://example.com || echo \"no internet: good\""
        },
      },
    ],
    cheatSheet: [
      "Never use bridged networking for an attack lab; use internal or host-only",
      "Add NAT only to install updates, then remove it and snapshot",
      "Wazuh agents use TCP 1514 for events and 1515 for enrolment",
      "Sysmon log: Microsoft-Windows-Sysmon/Operational; key events 1, 3, 11, 13, 22",
      "Enable command line in 4688 and PowerShell Script Block Logging (4104)",
      "Linux auth: /var/log/auth.log (Debian, Ubuntu) or /var/log/secure (RHEL)",
      "Sync all VM clocks to one source and view times in UTC",
      "Snapshot names should say what state they hold, e.g. win11-baseline-sysmon",
    ],
    quiz: [
      {
        q: "Which VM network mode should you avoid for an attack lab?",
        options: ["Internal network", "Host-only", "Bridged", "A custom isolated LAN segment"],
        answer: 2,
        why: "Bridged puts the VM directly on your real network, so tests could reach real devices.",
      },
      {
        q: "Which Sysmon event ID records process creation?",
        options: ["1", "3", "11", "22"],
        answer: 0,
        why: "Event 1 is process creation; 3 is network, 11 is file creation, 22 is DNS.",
      },
      {
        q: "Your timeline shows a file being run before it was downloaded. What is the most likely lab problem?",
        options: ["Sysmon is not installed", "The SIEM ran out of disk", "Too many snapshots", "VM clocks are not synchronised"],
        answer: 3,
        why: "Clock drift between hosts makes events appear in the wrong order.",
      },
      {
        q: "Why install the SIEM agent's internet packages and then remove the NAT adapter?",
        options: ["NAT slows down log forwarding", "So the lab can be set up but stays isolated during tests", "Agents only work without NAT", "To save disk space"],
        answer: 1,
        why: "You need the internet briefly to install software, but tests must run with no outside route.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Draw your lab plan: list each VM with its OS, IP, RAM, role and which logs it sends. Check the total RAM fits your computer with 4 GB left for the host.",
        hint: "Three VMs on one internal network is enough to start.",
        solution: "SIEM    Ubuntu Server  10.10.10.10  8 GB  Wazuh all-in-one\nWIN     Windows 11     10.10.10.20  4 GB  Sysmon, Security, PowerShell\nLINUX   Ubuntu Server  10.10.10.30  2 GB  auth.log, auditd\nTotal 14 GB + 4 GB host = 18 GB -> needs a 32 GB machine,\nor give the SIEM 6 GB and run WIN and LINUX one at a time.",
      },
      {
        level: "medium",
        task: "Install Sysmon with a community config on the Windows VM and confirm in the SIEM that you can see event IDs 1, 3 and 22 from that host.",
        hint: "Run notepad, browse to the SIEM dashboard IP and run nslookup to generate the three events.",
        solution: "Sysmon64.exe -accepteula -i sysmonconfig.xml\nnotepad.exe                 # event 1\nnslookup siem.lab           # event 22 (DNS query)\nStart-Process https://10.10.10.10   # event 3 (network)\nIn the SIEM, filter on the WIN agent and the Sysmon channel,\nthen group by event ID and confirm 1, 3 and 22 appear.",
      },
      {
        level: "hard",
        task: "Add a pfSense or OPNsense VM as the only router of the lab network, forward its firewall logs to the SIEM via syslog, and show a blocked connection attempt from the Windows VM in the SIEM.",
        hint: "Give the firewall two interfaces (lab and a NAT that you leave disabled during tests) and set remote syslog to the SIEM IP.",
        solution: "1. Firewall VM: LAN = lab network 10.10.10.1, WAN = NAT (disabled in tests).\n2. Set Windows and Linux default gateway to 10.10.10.1.\n3. Firewall: Status > System Logs > Settings > remote syslog to 10.10.10.10:514.\n4. SIEM: enable a syslog listener for that source (Wazuh: remote block in ossec.conf).\n5. Add a block rule for lab to WAN, then Test-NetConnection 1.1.1.1 -Port 443 on WIN.\n6. Search the SIEM for the firewall source and the blocked 10.10.10.20 -> 1.1.1.1 line.",
      },
    ],
    faq: [
      { q: "Can I build a SOC lab in the cloud instead?", a: "Yes, but watch costs and the provider's rules. Most cloud providers allow testing your own resources, and you must keep instances private and shut them down when idle so you do not leave exposed machines or a large bill." },
      { q: "Do I need a Windows licence for the lab?", a: "Microsoft provides free evaluation versions of Windows 11 Enterprise and Windows Server for a limited period, which are enough for learning. You can rebuild from your notes or snapshots when they expire." },
      { q: "Wazuh or Elastic: which should a beginner pick?", a: "Wazuh gives ready alerts faster with less tuning, which is motivating for beginners. Elastic teaches a search and rule ecosystem many companies use. Either is fine; what matters is finishing the whole pipeline." },
      { q: "What is the minimum computer for a home lab?", a: "16 GB of RAM and an SSD with about 150 GB free can run a SIEM and one endpoint at a time. 32 GB makes running everything together comfortable." },
    ],
  },

  "sec-capstone/attack-simulation": {
    plain: [
      "To know whether your detections work, you have to see what an attack looks like in your own logs. Waiting for a real attacker is not a plan. So defenders use adversary emulation: running small, safe, documented copies of attacker actions in a lab, on purpose.",
      "Atomic Red Team, from the security company Red Canary, is a free library of these small tests, called atomics. Each atomic is mapped to one MITRE ATT&CK technique, lists its commands, says what it needs to run, and includes a cleanup command to undo its changes.",
      "Most atomics do not use real malware. They do what attackers do with normal tools: create a scheduled task, add a registry key that runs at startup, list domain admins, or read sensitive memory. That is enough to create realistic telemetry, the logs and events your SIEM sees.",
      "The workflow is simple and repeatable: take a snapshot, run one test, look at what the SIEM saw, write down the result, then restore the snapshot. Doing this carefully, one technique at a time, gives you an honest map of what you catch and what you miss.",
    ],
    deepDive: [
      {
        heading: "Safety rules before you run anything",
        body: "Run tests only in your isolated lab, on machines you own. Confirm isolation again before each session. Some atomics download files from the internet; with the lab offline, download prerequisites during the setup window, then disconnect.\n\nRead each test before you run it. Atomic tests are real commands that change the system: they create accounts, change security settings or stop services. The test YAML shows exactly what will run and what the cleanup does. Some tests are designed to be destructive (for example ones that delete shadow copies or wipe logs), so read the description and pick tests deliberately.\n\nAntivirus and Microsoft Defender will block some tests. That is useful information: record it as prevented. If you want to see the raw telemetry, add a narrow exclusion for the Atomic Red Team folder in the lab only, and write down that you did, since it changes the result.",
        bullets: [
          "Snapshot first, every time",
          "Read the test definition before running",
          "Run one technique at a time so results are clear",
          "Record any security setting you changed",
        ],
      },
      {
        heading: "Running atomics with Invoke-AtomicRedTeam",
        body: "Invoke-AtomicRedTeam is a PowerShell module that runs the tests. It works on Windows PowerShell and on PowerShell 7 (pwsh), so it can run Linux and macOS tests too. Install it, with the atomics folder, during your online setup window.\n\nThe main command is Invoke-AtomicTest followed by a technique ID. Useful switches: -ShowDetailsBrief lists the tests for a technique, -ShowDetails prints the full commands, -CheckPrereqs checks whether the test can run, -GetPrereqs installs what it needs, -TestNumbers picks specific tests, and -Cleanup undoes a test.\n\nEach run is written to an execution log, a CSV file in your temp folder by default, with the time, technique, test name and host. Keep it: it is your ground truth when you later check which alerts fired.",
        visual: {
          type: "flow",
          title: "One atomic test, start to finish",
          steps: [
            { label: "Snapshot VM", detail: "Clean restore point" },
            { label: "ShowDetails", detail: "Read exactly what will run" },
            { label: "CheckPrereqs", detail: "Fix missing items while online" },
            { label: "Run test", detail: "Note the UTC time" },
            { label: "Observe SIEM", detail: "Telemetry? Alert?" },
            { label: "Cleanup or restore", detail: "Return to clean state" },
          ],
        },
      },
      {
        heading: "Choosing a good first test set",
        body: "Start with common, low-risk techniques that real attackers use often and that teach you different log sources. A sensible first set covers several tactics.\n\nDiscovery: T1082 System Information Discovery and T1087.001 Local Account discovery create process events with simple commands. Execution: T1059.001 PowerShell tests generate script block logs. Persistence: T1053.005 Scheduled Task and T1547.001 Registry Run Keys produce process, registry and task events. Credential Access: T1003.001 LSASS Memory shows process access events (Sysmon event 10) and is a great detection target. Defense Evasion: T1070.001 Clear Windows Event Logs produces event 1102, one of the most important alerts. On Linux, T1053.003 Cron and T1136.001 Create Local Account generate useful auth and audit logs.\n\nAim for about ten techniques across five or more tactics. Breadth first, then depth: later, run several tests for the same technique to see how detections cope with variations.",
      },
      {
        heading: "Recording results honestly",
        body: "For every test, record five things: technique ID and test number, UTC start time, whether it was prevented, whether telemetry appeared in the SIEM, and whether an alert fired (and which rule). These are different outcomes. Prevented means a control stopped it. Telemetry only means you could find it by searching, but nobody would be told. Alerted means a rule fired on it.\n\nTelemetry without an alert is the most common result and the most useful. It tells you the logs are there and you only need a rule. No telemetry means you must fix collection first, for example a missing Sysmon config section or an audit policy.\n\nTurn the table into an ATT&CK Navigator layer: green for alerted, yellow for telemetry only, red for nothing. This colour map becomes your to-do list for the next topic, where you write detections for the gaps.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Possible outcomes of one test",
        root: "Atomic test run",
        children: [
          { label: "Prevented", children: ["Defender or EDR blocked it", "Record the control that stopped it"] },
          { label: "Alerted", children: ["Rule fired with useful detail", "Check alert severity and context"] },
          { label: "Telemetry only", children: ["Logs exist, no rule", "Next step: write a detection"] },
          { label: "Nothing seen", children: ["Logs missing or not forwarded", "Next step: fix collection"] },
        ],
      },
    ],
    examples: [
      {
        title: "Emulate scheduled task persistence (T1053.005)",
        explanation: "Goal: see whether creating a scheduled task is detected. Step 1: restore the Windows VM baseline snapshot. Step 2: list the tests for T1053.005 and read test 1 in full. Step 3: check prerequisites. Step 4: run only test 1 and note the UTC time. Step 5: in the SIEM, search for schtasks.exe process creation around that time and for event 4698 if task auditing is on. Step 6: record the outcome, then run cleanup and restore the snapshot.",
        code: {
          lang: "powershell",
          code: "Import-Module invoke-atomicredteam\nInvoke-AtomicTest T1053.005 -ShowDetailsBrief\nInvoke-AtomicTest T1053.005 -TestNumbers 1 -ShowDetails\nInvoke-AtomicTest T1053.005 -TestNumbers 1 -CheckPrereqs\n(Get-Date).ToUniversalTime()\nInvoke-AtomicTest T1053.005 -TestNumbers 1\nInvoke-AtomicTest T1053.005 -TestNumbers 1 -Cleanup",
        },
      },
      {
        title: "Generate SSH password guessing against your own Linux VM",
        explanation: "Goal: check that repeated failed SSH logins raise an alert. Step 1: on the Linux VM, create a test user with a known weak password used only in the lab. Step 2: from another lab VM, make a few failed SSH logins in a loop (no special tools needed). Step 3: on the Linux VM, confirm the failures in auth.log or the journal. Step 4: in the SIEM, check whether a brute-force rule fired and how many failures it needed. Step 5: delete the test user and restore the snapshot. This maps to T1110.001 Password Guessing.",
        code: {
          lang: "bash",
          code: "# from another lab VM, against your own lab host only\nfor i in $(seq 1 10); do\n  sshpass -p \"wrong$i\" ssh -o StrictHostKeyChecking=no \\\n    -o PreferredAuthentications=password labuser@10.10.10.30 true\ndone\n# on the Linux VM\nsudo journalctl -u ssh --since \"5 min ago\" | grep -c \"Failed password\"",
        },
      },
    ],
    cheatSheet: [
      "Invoke-AtomicTest T1053.005 -ShowDetailsBrief lists the tests for a technique",
      "-ShowDetails prints commands; -CheckPrereqs and -GetPrereqs handle dependencies",
      "-TestNumbers 1 runs one test; -Cleanup undoes it",
      "Keep the execution log CSV as ground truth for what ran and when",
      "Four outcomes: prevented, alerted, telemetry only, nothing seen",
      "Event 1102 (audit log cleared) is a must-have alert",
      "Sysmon event 10 (process access) is key for detecting LSASS dumping",
      "Navigator colours: green alerted, yellow telemetry only, red nothing",
    ],
    quiz: [
      {
        q: "What is the main purpose of adversary emulation in a home lab?",
        options: ["To attack other people's systems for practice", "To produce realistic attack telemetry so you can test your detections", "To install real ransomware safely", "To speed up the SIEM"],
        answer: 1,
        why: "Emulation creates known activity so you can check what your logs and rules catch.",
      },
      {
        q: "A test ran, you can find its events by searching, but no alert fired. How do you record it?",
        options: ["Prevented", "Alerted", "Not run", "Telemetry only, a detection gap"],
        answer: 3,
        why: "Logs exist but nobody would be notified, so a rule is needed.",
      },
      {
        q: "Which Invoke-AtomicTest switch shows the full commands a test will run?",
        options: ["-ShowDetails", "-Cleanup", "-GetPrereqs", "-TestNumbers"],
        answer: 0,
        why: "-ShowDetails prints the test's commands, inputs and cleanup steps.",
      },
      {
        q: "Microsoft Defender blocked an atomic test. What is the best way to treat it?",
        options: ["Disable Defender permanently", "Ignore the test", "Record it as prevented, and only add a narrow lab exclusion if you need raw telemetry", "Run it on your work laptop instead"],
        answer: 2,
        why: "Prevention is a valid result; any change to protections must be scoped and written down.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run T1082 System Information Discovery test 1 on your Windows VM and find the resulting process creation events in your SIEM.",
        hint: "The test runs systeminfo and similar commands; filter on Sysmon event 1 around the run time.",
        solution: "Invoke-AtomicTest T1082 -TestNumbers 1 -ShowDetails\nInvoke-AtomicTest T1082 -TestNumbers 1\nSIEM search: host = WIN, Sysmon event 1, Image ends with systeminfo.exe,\ntime = run time plus or minus 2 minutes.\nRecord: telemetry yes; alert usually no (discovery is noisy).",
      },
      {
        level: "medium",
        task: "Run one test each for T1059.001, T1547.001, T1003.001 and T1070.001, restoring the snapshot between them, and fill in a results table with the four outcomes.",
        hint: "Note the UTC time before each run so you can line up SIEM events.",
        solution: "Technique  Test  UTC    Prevented  Telemetry  Alert (rule)\nT1059.001  1     10:02  no         yes        yes (PowerShell download)\nT1547.001  1     10:15  no         yes        no\nT1003.001  1     10:30  yes        yes        yes (Defender)\nT1070.001  1     10:41  no         yes        yes (1102 log cleared)\nYour values will differ; what matters is one row per test with evidence.",
      },
      {
        level: "hard",
        task: "Turn your results table into an ATT&CK Navigator layer file with scores (2 alerted, 1 telemetry only, 0 nothing), load it into Navigator and export a picture for your report.",
        hint: "Write the JSON by hand or with a short script; set a gradient from red (0) to green (2).",
        solution: "import json\nrows = {'T1059.001': 2, 'T1547.001': 1, 'T1003.001': 2, 'T1070.001': 2}\nlayer = {\n  'name': 'Lab emulation results', 'domain': 'enterprise-attack',\n  'gradient': {'colors': ['#ff6666', '#ffe766', '#8ec843'], 'minValue': 0, 'maxValue': 2},\n  'techniques': [{'techniqueID': t, 'score': s} for t, s in rows.items()],\n}\njson.dump(layer, open('lab_layer.json', 'w'), indent=2)\n# Navigator: Open Existing Layer > Upload from local > lab_layer.json\n# Then use the export (camera) button to save an SVG image.",
      },
    ],
    faq: [
      { q: "Is Atomic Red Team legal to use?", a: "Yes, it is a free, open-source tool made for defenders. Using it on systems you own or are explicitly authorised to test is legal; running it against other people's systems without permission is not." },
      { q: "What is the difference between Atomic Red Team and Caldera?", a: "Atomic Red Team runs small, single tests that you choose one by one. MITRE Caldera is a platform that chains many techniques automatically through an agent, closer to a full attack scenario." },
      { q: "Do atomic tests use real malware?", a: "Mostly no. They usually use built-in commands or well-known security testing tools to imitate attacker behaviour, though some download tools that antivirus flags, which is why they belong in an isolated lab." },
    ],
  },

  "sec-capstone/detect-investigate": {
    plain: [
      "After the simulations, you know which attacks your lab missed. Now you close those gaps and then practise the core job of a SOC analyst: when an alert fires, find out what really happened, from first step to last, and explain it clearly in writing.",
      "A detection is a saved search or rule that runs automatically and raises an alert when it matches. Many teams write detections in Sigma, a shared format for log rules written in YAML (a simple text format). A converter then turns a Sigma rule into the query language of your SIEM.",
      "An investigation starts with one alert and keeps asking questions. Which user? Which machine? What started this process? What did it do next? Did it talk to the network? Did the same thing happen anywhere else? Each answer points to the next log to check.",
      "Finally you write an incident report. It has two audiences. Managers need a short summary of what happened, what it means for the business and what to decide. Engineers need the technical detail: timeline, evidence, indicators and specific fixes.",
    ],
    deepDive: [
      {
        heading: "From gap to tested detection",
        body: "Take a technique that showed telemetry but no alert, such as scheduled task creation. Step 1: look at the raw event from your test and note the exact fields: image path, command line, parent process, user. Step 2: write a rule on the behaviour, not on the test's exact strings, so it catches variations. Step 3: convert it for your SIEM. Step 4: replay the atomic test and confirm the alert fires. Step 5: run normal activity for a while to see how noisy the rule is, and add narrow exclusions for known good software.\n\nSigma rules have a logsource (for example product windows, category process_creation), a detection block with named selections and a condition, plus metadata like level and ATT&CK tags. The sigma-cli tool converts rules with backends installed as plugins, for example sigma plugin install splunk, then sigma convert -t splunk -p sysmon rule.yml. Wazuh uses its own XML rules, so many Wazuh users write rules directly in local_rules.xml.",
        visual: {
          type: "cycle",
          title: "Detection engineering loop",
          steps: [
            { label: "Study telemetry", detail: "Fields from the test event" },
            { label: "Write rule", detail: "Target the behaviour" },
            { label: "Convert and deploy", detail: "Sigma to SIEM query" },
            { label: "Replay test", detail: "Does it fire?" },
            { label: "Tune", detail: "Measure noise, add exclusions" },
          ],
        },
      },
      {
        heading: "Investigating an alert step by step",
        body: "Start with the five Ws: who (user account), what (process and command), where (host), when (exact UTC time), and how it started (parent process chain). Sysmon helps a lot here: every process has a ProcessGuid, and each event 1 includes the ParentProcessGuid, so you can walk up the tree reliably even when process IDs are reused.\n\nThen widen out in time and space. Look 30 minutes before the alert on the same host: what was the user doing, which files were downloaded (event 11), which domains were queried (event 22)? Look after: new network connections (event 3), registry changes (event 13), new services or tasks. Then search other hosts for the same hash, command line or domain to find the scope.\n\nWrite as you go. Every finding gets a timestamp, source and a short note. Keeping notes during the investigation, not afterwards, saves hours and prevents mistakes in the report.",
        bullets: [
          "Pivot on: user, host, process GUID, hash, domain, IP",
          "Expand time window before and after the alert",
          "Check other hosts for the same indicators to find scope",
        ],
      },
      {
        heading: "Building a timeline that tells the story",
        body: "A timeline is a table of events in time order, all in UTC. Typical columns: time, host, user, source log, event, ATT&CK technique and a note. Include only events that matter to the story; a timeline of 2,000 rows is a log dump, not an analysis.\n\nMark the key moments clearly: first sign of malicious activity (initial access), when persistence was added, first contact with command and control, the most serious action (for example credential dumping), when the alert fired, and when containment happened. The gap between initial access and detection is called dwell time, and it is one of the most important numbers in a report.\n\nWhen events come from different sources, check clock alignment. If Sysmon and the firewall disagree by a few seconds, note it rather than silently reordering events.",
      },
      {
        heading: "Writing the report for two audiences",
        body: "Start with an executive summary of half a page in plain language: what happened, when it was found, the business impact, whether it is contained, and the two or three decisions or investments you recommend. No event IDs here.\n\nThe technical sections follow: scope (hosts, accounts, data involved), detailed timeline, analysis of each stage mapped to ATT&CK, indicators of compromise (defanged), root cause (the underlying reason, such as no MFA on the VPN, not just user clicked link), and recommendations. Make each recommendation specific and owned: enable PowerShell Script Block Logging on all endpoints, owner endpoint team, due in 30 days.\n\nAdd an appendix with queries you used and screenshots of key events, so another analyst can repeat your work. In a lab report, state clearly that the activity was simulated with Atomic Red Team in an isolated environment.",
        visual: {
          type: "layers",
          title: "Incident report structure",
          layers: [
            { label: "Executive summary", detail: "Impact, status, decisions needed" },
            { label: "Scope and timeline", detail: "Hosts, accounts, ordered events" },
            { label: "Technical analysis", detail: "Each stage with ATT&CK and evidence" },
            { label: "IOCs and root cause", detail: "Defanged indicators, real cause" },
            { label: "Recommendations", detail: "Specific, owned, dated" },
            { label: "Appendix", detail: "Queries, screenshots, raw evidence" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Walking a process tree from one alert",
        actors: ["Analyst", "SIEM", "Sysmon events"],
        messages: [
          { from: 0, to: 1, label: "Open alert: schtasks /create by powershell.exe" },
          { from: 1, to: 2, label: "Find parent by ParentProcessGuid" },
          { from: 2, to: 0, label: "Parent: powershell.exe started by WINWORD.EXE" },
          { from: 0, to: 1, label: "Search file events before Word opened" },
          { from: 2, to: 0, label: "invoice.docm downloaded by browser" },
          { from: 0, to: 1, label: "Search network events after the task ran" },
          { from: 2, to: 0, label: "Beacon to a new domain every 60 s" },
        ],
      },
    ],
    examples: [
      {
        title: "Sigma rule for scheduled task creation",
        explanation: "Your test showed schtasks.exe with /create in the command line, but no alert. This Sigma rule matches that behaviour on any host. Then convert it (for example with sigma convert -t splunk -p sysmon) and replay the atomic test to prove it fires. Expect some noise from software installers and updaters; tune by excluding specific known parent processes, not by removing the whole rule. The level is medium because scheduled tasks are also used legitimately.",
        code: {
          lang: "yaml",
          code: "title: Scheduled Task Created With schtasks\nstatus: experimental\ndescription: Detects creation of a scheduled task via schtasks.exe\ntags:\n  - attack.persistence\n  - attack.t1053.005\nlogsource:\n  product: windows\n  category: process_creation\ndetection:\n  selection:\n    Image|endswith: '\\schtasks.exe'\n    CommandLine|contains: '/create'\n  condition: selection\nfalsepositives:\n  - Software installers and update agents\nlevel: medium",
        },
      },
      {
        title: "Investigate and build a five-row timeline",
        explanation: "The alert fired for the scheduled task. Step 1: pivot to the parent process: powershell.exe with an encoded command, started by WINWORD.EXE. Step 2: decode the command in a safe VM: it downloaded a script. Step 3: search events before: a .docm file was created in Downloads. Step 4: search after: new network connections every 60 seconds to one IP. Step 5: search all hosts for that IP: none. Build the timeline below, compute dwell time (11 minutes from file to alert), and note root cause: macros allowed from internet files.",
        code: {
          lang: "text",
          code: "Time (UTC)  Host  Event                                   ATT&CK\n09:02:10    WIN   invoice.docm saved to Downloads (S11)   T1566.001\n09:03:45    WIN   WINWORD.EXE -> powershell.exe -enc (S1) T1059.001\n09:04:02    WIN   schtasks /create /sc onlogon (S1)       T1053.005\n09:04:30    WIN   First connection to 10.10.10.66:443 (S3) T1071.001\n09:13:10    SIEM  Alert: Scheduled Task Created           -",
        },
      },
    ],
    cheatSheet: [
      "Sigma rule parts: title, logsource, detection (selections + condition), level, tags",
      "sigma plugin install splunk, then sigma convert -t splunk -p sysmon rule.yml",
      "Write rules on behaviour (image + key arguments), not on one test's exact strings",
      "Use ProcessGuid and ParentProcessGuid to walk Sysmon process trees",
      "Timeline columns: UTC time, host, user, source, event, ATT&CK, note",
      "Dwell time = detection time minus first malicious activity",
      "Root cause is the underlying gap, e.g. no MFA on VPN, not just user clicked",
      "Recommendations must be specific, owned and dated",
    ],
    quiz: [
      {
        q: "Why use ProcessGuid rather than process ID to link Sysmon events?",
        options: ["It is shorter", "Process IDs get reused, while ProcessGuid is unique for each process", "ProcessGuid includes the user's password hash", "Only ProcessGuid appears in event 1"],
        answer: 1,
        why: "PIDs are recycled by Windows, so a GUID avoids linking unrelated processes.",
      },
      {
        q: "Which is the best root cause statement?",
        options: ["The user clicked a link", "Malware was present", "Office macros were allowed from internet files, so a phishing document could run code", "The SIEM was slow"],
        answer: 2,
        why: "A root cause names the underlying control gap that allowed the incident, which can be fixed.",
      },
      {
        q: "What belongs in the executive summary of an incident report?",
        options: ["Impact, status and recommended decisions in plain language", "Full list of Sysmon event IDs", "Every SIEM query used", "Raw log lines"],
        answer: 0,
        why: "Executives need business impact and decisions; technical detail goes in later sections.",
      },
      {
        q: "Your new rule fires on the atomic test and also 200 times a day on a software updater. What should you do?",
        options: ["Delete the rule", "Lower the level to informational and forget it", "Ignore the noise", "Add a narrow exclusion for that updater's specific parent process and path"],
        answer: 3,
        why: "Narrow exclusions keep the detection while removing known benign noise.",
      },
      {
        q: "What does dwell time measure?",
        options: ["How long the report took to write", "Time from first malicious activity to detection", "How long the SIEM keeps logs", "Time to restore from backup"],
        answer: 1,
        why: "Dwell time is how long the attacker was active before being detected.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For one alert from your simulations, answer the five Ws (who, what, where, when, how it started) using only SIEM data, with the event that proves each answer.",
        hint: "Event 1 for the process holds most answers; its parent fields answer how it started.",
        solution: "Who: User field in Sysmon event 1 (LAB\\alice)\nWhat: Image + CommandLine (schtasks.exe /create ...)\nWhere: Computer / agent name (WIN)\nWhen: UtcTime of event 1 (2026-03-02 09:04:02)\nHow it started: ParentImage + ParentCommandLine (powershell.exe -enc ...)\nCite the event ID and time for each line.",
      },
      {
        level: "medium",
        task: "Write and test a Sigma rule that detects the Windows Security event log being cleared, convert it for your SIEM, and prove it fires using Atomic test T1070.001.",
        hint: "Event 1102 in the Security log; Sigma logsource product windows, service security.",
        solution: "title: Security Event Log Cleared\nlogsource:\n  product: windows\n  service: security\ndetection:\n  selection:\n    EventID: 1102\n  condition: selection\nlevel: high\ntags: [attack.defense-evasion, attack.t1070.001]\nThen: sigma convert -t <backend> rule.yml, deploy,\nInvoke-AtomicTest T1070.001 -TestNumbers 1, confirm the alert.",
      },
      {
        level: "hard",
        task: "Run a chain of three atomics (execution, persistence, credential access) on one host, then investigate it as if you did not know what ran, and write a two-page report with an executive summary, timeline, ATT&CK mapping, root cause and three recommendations.",
        hint: "Ask a friend to choose the tests, or wait a day so you investigate from the logs, not from memory.",
        solution: "Structure:\n1. Executive summary (5 sentences, no jargon)\n2. Scope: 1 host, 1 user, no data exfiltration seen\n3. Timeline: 6-10 rows, UTC, with sources\n4. Analysis: one paragraph per stage + ATT&CK ID\n5. IOCs (defanged) and root cause\n6. Recommendations: 3 items with owner and due date\n7. Appendix: queries and screenshots\nState that activity was simulated in an isolated lab.",
      },
    ],
    faq: [
      { q: "What is Sigma and why not write SIEM queries directly?", a: "Sigma is an open, vendor-neutral format for detection rules. Writing in Sigma lets you share rules and convert them to Splunk, Elastic, Microsoft Sentinel and other SIEMs, instead of rewriting each one." },
      { q: "How long should an incident report be?", a: "As short as possible while still complete. For a single-host lab incident, two to four pages plus an appendix is typical; the executive summary should fit on half a page." },
      { q: "What is the difference between a true positive and a benign true positive?", a: "A true positive is real malicious activity. A benign true positive is when the rule correctly detected the behaviour, but it was authorised, such as an admin's script or your own lab test." },
      { q: "Where can I find example detection rules?", a: "The SigmaHQ repository on GitHub has thousands of community Sigma rules, and Elastic and Splunk publish their detection rules openly. Reading them is a great way to learn patterns." },
    ],
  },

  "sec-capstone/practice-portfolio": {
    plain: [
      "Your home lab proves you can build things. Guided practice platforms add many more realistic scenarios than you could create alone: phishing emails to analyse, memory dumps, packet captures and full SIEM datasets from simulated breaches. They also track your progress, which keeps you motivated.",
      "A portfolio is a public collection of your work that an employer can look at. For a SOC role, that means clear write-ups of investigations, your lab design with a diagram, and detection rules you wrote and tested. It shows how you think, which a certificate alone cannot.",
      "Hiring managers for junior SOC roles often say the same thing: they want to see curiosity, clear writing and a structured approach. A short, well-written investigation with a timeline and lessons learned impresses more than a list of 300 completed rooms.",
      "Certifications still matter, especially to get past HR filters. The trick is to choose them in a sensible order, so each one builds on the last and matches the job you want, rather than collecting badges at random.",
    ],
    deepDive: [
      {
        heading: "Choosing practice platforms",
        body: "Beginner guided paths: TryHackMe offers SOC-focused learning paths with browser-based labs, so you need no powerful computer. LetsDefend simulates a SOC alert queue where you triage alerts and write case notes. Both are good for building daily habits.\n\nInvestigation challenges: CyberDefenders and Blue Team Labs Online provide scenarios with evidence files (logs, PCAPs, disk or memory images) and questions to answer. Hack The Box has defensive Sherlocks in the same style. Splunk's Boss of the SOC (BOTS) datasets are free to download and load into your own Splunk instance, giving you a realistic breach to hunt through.\n\nMix the two: guided paths teach the tools, and open challenges teach you to investigate without instructions, which is closer to real work. A rhythm of a few hours a week, every week, beats occasional weekend marathons.",
        bullets: [
          "Guided: TryHackMe SOC paths, LetsDefend",
          "Challenges: CyberDefenders, Blue Team Labs Online, HTB Sherlocks",
          "Datasets: Splunk BOTS for your own SIEM",
        ],
      },
      {
        heading: "What makes a write-up good",
        body: "A strong write-up reads like a short incident report, not a list of answers. Use a consistent structure: scenario and goal, tools used, investigation steps with the reasoning behind each, key findings with screenshots, a timeline, ATT&CK mapping, and what you learned or would do differently.\n\nExplain why, not just what. Instead of I searched for event 4625, write: I suspected password guessing, so I counted failed logons (4625) per source IP and found one IP with 900 failures in ten minutes, followed by a success. That sentence shows method.\n\nRespect platform rules. Many platforms ask you not to publish answers for active challenges, and some allow write-ups only after a challenge is retired. Check each platform's policy, and focus your public write-ups on your own lab, retired challenges and datasets that allow it. Never include real company data, real IPs from work or anyone's credentials.",
        visual: {
          type: "flow",
          title: "Structure of a portfolio write-up",
          steps: [
            { label: "Scenario", detail: "What you were given and asked" },
            { label: "Approach", detail: "Tools and first hypothesis" },
            { label: "Investigation", detail: "Steps with reasoning and screenshots" },
            { label: "Findings", detail: "Timeline and ATT&CK mapping" },
            { label: "Lessons", detail: "Detections or fixes you would add" },
          ],
        },
      },
      {
        heading: "Where and how to publish",
        body: "A GitHub repository works well as the home of your portfolio. Use a clear README as the landing page: who you are, what role you want, and links to your best three to five pieces. Keep folders for lab design (with a network diagram), detection rules (Sigma files with test notes), Navigator layers, and write-ups in Markdown or PDF.\n\nA simple blog (GitHub Pages, Hashnode, Medium or your own site) is good for longer write-ups and is easy to share on LinkedIn. Post a short summary on LinkedIn with a link each time you publish; recruiters do search there.\n\nQuality beats quantity. Five excellent, well-structured pieces are better than fifty rushed ones. Update the README as you improve, and remove early work that no longer represents your level.",
      },
      {
        heading: "Planning your certifications",
        body: "A common path for blue-team beginners looks like this. First, a broad foundation: CompTIA Security+ is widely requested in job ads and covers core concepts. Then a hands-on defensive certification that proves practical skill, such as Security Blue Team's BTL1, a TryHackMe or Hack The Box defensive analyst certification, or CompTIA CySA+ for a more traditional exam. Then specialise based on the role: Microsoft SC-200 for Sentinel and Defender environments, Splunk certifications for Splunk-heavy SOCs, or GIAC options such as GCIH later in your career, often with employer funding.\n\nBefore paying, read 20 job ads for the role and city you want and count which certifications appear. Exam names and versions change every few years, so check the vendor's website for the current exam objectives. Your lab and portfolio help you prepare: many exam topics are things you will have already done.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A SOC analyst portfolio",
        root: "Portfolio repository",
        children: [
          { label: "README", children: ["About you and target role", "Links to best 3 to 5 pieces"] },
          { label: "Lab", children: ["Network diagram", "Build notes and configs"] },
          { label: "Detections", children: ["Sigma rules", "Test results per rule", "Navigator layers"] },
          { label: "Write-ups", children: ["Lab incident report", "Retired challenge investigations"] },
          { label: "Learning log", children: ["Certifications and dates", "Next goals"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turn a solved challenge into a portfolio piece",
        explanation: "You solved a CyberDefenders challenge about a compromised web server (and its rules allow write-ups). Step 1: rewrite your notes as a story: the alert, your first hypothesis, the logs you checked and why. Step 2: add a timeline table and map each step to ATT&CK. Step 3: crop and annotate three screenshots that prove the key findings. Step 4: end with two detections that would have caught the attack earlier, written as Sigma rules. Step 5: publish it in your repo, link it from the README, and share a three-line summary on LinkedIn.",
      },
      {
        title: "Lay out the portfolio repository",
        explanation: "Create one public repository and keep a predictable structure so a hiring manager can find things in seconds. Step 1: README at the top with links. Step 2: a lab folder with your diagram and setup notes, with any secrets removed. Step 3: detections with one file per rule and a short test note. Step 4: write-ups, newest first. The tree below is a good starting point.",
        code: {
          lang: "text",
          code: "soc-portfolio/\n  README.md\n  lab/\n    network-diagram.png\n    build-notes.md\n  detections/\n    sigma/schtasks-create.yml\n    sigma/security-log-cleared.yml\n    tests.md\n    navigator/lab-coverage.json\n  writeups/\n    2026-03-lab-phishing-incident.md\n    2026-04-web-server-investigation.md",
        },
      },
    ],
    cheatSheet: [
      "Mix guided paths (learn tools) with open challenges (learn to investigate)",
      "Splunk BOTS datasets are free realistic breaches for your own Splunk",
      "Write-up structure: scenario, approach, investigation, findings, lessons",
      "Explain why you checked each log, not only what you found",
      "Check each platform's write-up policy; publish only retired or permitted content",
      "Never publish real company data, work IPs or credentials",
      "Five excellent write-ups beat fifty rushed ones",
      "Read 20 job ads before choosing your next certification",
    ],
    quiz: [
      {
        q: "What do hiring managers usually value most in a junior SOC portfolio?",
        options: ["The number of rooms completed", "Expensive certifications only", "Clear write-ups that show a structured investigation method", "Screenshots of hacking tools"],
        answer: 2,
        why: "Write-ups show how you think and communicate, which is the daily work of an analyst.",
      },
      {
        q: "Before publishing a write-up for a challenge, what should you check?",
        options: ["The platform's write-up policy and whether the challenge is retired", "Nothing, all write-ups are allowed", "That it contains every flag", "That it is over 20 pages"],
        answer: 0,
        why: "Many platforms forbid publishing answers for active content.",
      },
      {
        q: "Which sentence best shows investigative reasoning?",
        options: ["I found the answer in the logs", "I searched for 4625", "The attacker was bad", "I suspected password guessing, so I counted failed logons per source IP and found one with 900 failures then a success"],
        answer: 3,
        why: "It states a hypothesis, the method used to test it and the evidence found.",
      },
      {
        q: "What is a sensible way to choose your next certification?",
        options: ["Pick the most expensive one", "Count which certifications appear in job ads for your target role and region", "Pick the one with the shortest exam", "Collect as many as possible at once"],
        answer: 1,
        why: "Job ads show what employers you want actually request.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a public GitHub repository for your portfolio with a README that states your target role and links to three planned sections: lab, detections and write-ups.",
        hint: "Start small; empty sections with a short plan are fine at first.",
        solution: "mkdir soc-portfolio && cd soc-portfolio\ngit init\nmkdir lab detections writeups\nprintf '# SOC Analyst Portfolio\\n\\nTarget role: Junior SOC Analyst\\n\\n- [Lab](lab/)\\n- [Detections](detections/)\\n- [Write-ups](writeups/)\\n' > README.md\ngit add . && git commit -m \"Portfolio skeleton\"\n# create the repo on GitHub and push",
      },
      {
        level: "medium",
        task: "Write and publish one full write-up of your home lab incident from the detect-investigate topic, using the five-part structure, with a timeline and at least two annotated screenshots.",
        hint: "Remove any passwords or real IPs; state that the activity was simulated.",
        solution: "Sections:\n1. Scenario: simulated phishing chain in isolated lab (Atomic Red Team)\n2. Approach: SIEM, Sysmon, first hypothesis\n3. Investigation: 4-6 steps, each with why + screenshot\n4. Findings: timeline table + ATT&CK IDs\n5. Lessons: 2 new detections, 1 hardening change\nLink it from README and share a short LinkedIn post.",
      },
      {
        level: "hard",
        task: "Make a 12-week plan that combines platform practice, lab work, portfolio pieces and one certification, with a measurable goal for each month.",
        hint: "Give each week a theme and end each month with something published.",
        solution: "Month 1: SOC learning path weeks 1-4; lab build; publish lab design.\n  Goal: lab running, 1 write-up.\nMonth 2: 4 investigation challenges; atomics + 5 Sigma rules.\n  Goal: coverage layer + 2 write-ups.\nMonth 3: certification study (objectives list) + practice exams;\n  1 Splunk BOTS hunt.\n  Goal: exam booked or passed, 5 portfolio pieces total.\nReview every Sunday: hours done, what was published.",
      },
    ],
    faq: [
      { q: "Do I need a degree to get a SOC analyst job?", a: "Not always. Many employers accept practical skills, certifications and a strong portfolio in place of a degree, though requirements vary by country and company." },
      { q: "TryHackMe or Hack The Box: which is better for blue team?", a: "TryHackMe is usually easier for beginners because of its guided paths. Hack The Box offers harder, less guided content, including defensive Sherlocks. Many people start with TryHackMe and add HTB later." },
      { q: "Is Security+ enough to get a SOC job?", a: "It helps you pass HR filters, but most employers also want evidence of hands-on skill. Pair it with lab work, a practical certification or a portfolio of investigations." },
      { q: "How many write-ups should my portfolio have?", a: "Three to five strong pieces covering different skills (for example email analysis, endpoint investigation and network analysis) are enough to start applying. Keep adding and replacing weaker ones over time." },
    ],
  },
};

export default extra;
