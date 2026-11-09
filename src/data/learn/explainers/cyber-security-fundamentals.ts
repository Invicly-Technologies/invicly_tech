import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Security principles & threat modelling ─────────────
  "sec-foundations/cia-triad": {
    summary:
      "The CIA triad names the three goals security protects: keeping data secret (confidentiality), correct (integrity) and available. AAA and non-repudiation extend this to proving who did what. Classifying an incident by which goal it harmed is the first instinct of a defender.",
    analogy: "Like a bank vault: secrets stay locked, records stay accurate, and the door still opens for staff.",
    visuals: [
      {
        type: "tree",
        title: "Security goals",
        root: "Security",
        children: [
          { label: "Confidentiality", children: ["Encryption", "Access control"] },
          { label: "Integrity", children: ["Hashing", "Signatures"] },
          { label: "Availability", children: ["Redundancy", "DoS defence"] },
          { label: "Accountability", children: ["Authentication", "Logging"] },
        ],
      },
    ],
    keyPoints: [
      "Every control ultimately serves confidentiality, integrity or availability.",
      "AAA means authentication, authorization and accounting.",
      "Non-repudiation stops someone denying an action they took.",
      "Naming the harmed goal focuses the response.",
    ],
    terms: [
      { term: "Confidentiality", meaning: "Only authorised parties can read the data." },
      { term: "Integrity", meaning: "Data is accurate and unaltered." },
      { term: "Availability", meaning: "Systems are reachable when needed." },
      { term: "Non-repudiation", meaning: "Proof a party performed an action." },
    ],
    check: [
      { q: "A ransomware attack encrypts files so staff cannot open them. Which CIA goal is harmed most?", a: "Availability, because the data is inaccessible." },
      { q: "What does the second A in AAA stand for?", a: "Authorization, deciding what an authenticated user may do." },
    ],
  },

  "sec-foundations/risk-basics": {
    summary:
      "Risk is a threat exploiting a vulnerability in an asset, scored by how likely it is and how badly it would hurt. Defenders cannot fix everything, so they rank risks and choose to mitigate, transfer, accept or avoid each one.",
    visuals: [
      {
        type: "flow",
        title: "From asset to decision",
        steps: [
          { label: "Asset", detail: "Something of value to protect." },
          { label: "Vulnerability", detail: "A weakness in that asset." },
          { label: "Threat", detail: "Something that could exploit it." },
          { label: "Risk", detail: "Likelihood times impact." },
          { label: "Decision", detail: "Mitigate, transfer, accept or avoid." },
        ],
      },
    ],
    keyPoints: [
      "A vulnerability alone is not a risk without a threat and an asset.",
      "Risk is usually expressed as likelihood times impact.",
      "You can mitigate, transfer, accept or avoid a risk.",
      "Rank risks so limited effort goes to the biggest ones.",
    ],
    terms: [
      { term: "Asset", meaning: "Data or system worth protecting." },
      { term: "Vulnerability", meaning: "A weakness that can be exploited." },
      { term: "Threat", meaning: "An actor or event that could cause harm." },
      { term: "Risk appetite", meaning: "How much risk an organisation accepts." },
    ],
    check: [
      { q: "Buying cyber insurance is which risk treatment?", a: "Transfer, moving the financial impact to another party." },
      { q: "Why is a vulnerability with no matching threat low priority?", a: "Without a threat to exploit it, the realistic risk is low." },
    ],
  },

  "sec-foundations/threat-modelling": {
    summary:
      "Threat modelling asks, for a specific design, what can go wrong before it is built. STRIDE gives six categories to walk through against each part of a data flow diagram, turning vague worry into a concrete list of threats and mitigations.",
    analogy: "Like a pre-flight checklist: you reason through failure before leaving the ground.",
    visuals: [
      {
        type: "tree",
        title: "STRIDE categories",
        root: "STRIDE",
        children: [
          { label: "Spoofing", children: ["Fake identity"] },
          { label: "Tampering", children: ["Altered data"] },
          { label: "Repudiation", children: ["Denying actions"] },
          { label: "Information disclosure", children: ["Leaked data"] },
          { label: "Denial of service", children: ["Lost availability"] },
          { label: "Elevation of privilege", children: ["Gaining rights"] },
        ],
      },
    ],
    keyPoints: [
      "Threat model the design, before and during building.",
      "A data flow diagram with trust boundaries is the starting point.",
      "STRIDE pairs with the CIA triad plus authentication and accountability.",
      "Each threat should end with a proposed mitigation.",
    ],
    terms: [
      { term: "STRIDE", meaning: "Six threat categories from Microsoft." },
      { term: "Data flow diagram", meaning: "Map of data moving between components." },
      { term: "Trust boundary", meaning: "Where data crosses between privilege levels." },
      { term: "Mitigation", meaning: "A control that reduces a threat." },
    ],
    check: [
      { q: "Which STRIDE letter covers a user pretending to be someone else?", a: "S for Spoofing." },
      { q: "What do trust boundaries on a diagram highlight?", a: "Points where data crosses privilege levels and needs checks." },
    ],
  },

  "sec-foundations/defence-in-depth": {
    summary:
      "Defence in depth layers independent controls so that one failure does not become a breach. Controls are grouped by type (technical, administrative, physical) and by function (preventive, detective, corrective). Least privilege and zero trust push this idea further.",
    visuals: [
      {
        type: "layers",
        title: "Layers of defence",
        layers: [
          { label: "Policy & training", detail: "Administrative controls and awareness." },
          { label: "Perimeter", detail: "Firewalls and network segmentation." },
          { label: "Endpoint", detail: "Hardening, patching and EDR." },
          { label: "Application", detail: "Secure code and input validation." },
          { label: "Data", detail: "Encryption and access control." },
        ],
      },
    ],
    keyPoints: [
      "No single control is trusted to never fail.",
      "Controls are preventive, detective or corrective.",
      "Least privilege gives each account only what it needs.",
      "Zero trust verifies every request instead of trusting the network.",
    ],
    terms: [
      { term: "Defence in depth", meaning: "Multiple independent layers of control." },
      { term: "Preventive control", meaning: "Stops an event happening." },
      { term: "Detective control", meaning: "Notices an event that happened." },
      { term: "Zero trust", meaning: "Trust nothing by default, verify every request." },
    ],
    check: [
      { q: "A SIEM alert is which function of control?", a: "Detective, it notices suspicious activity." },
      { q: "Why layer controls instead of relying on one strong firewall?", a: "So a single failure does not expose everything behind it." },
    ],
  },

  "sec-foundations/soc-roles": {
    summary:
      "A Security Operations Centre monitors, detects and responds to threats, usually in tiers. Tier 1 triages alerts, tier 2 investigates, and tier 3 hunts and handles complex incidents. Blue, red and purple teams describe defence, offence and the two working together.",
    visuals: [
      {
        type: "layers",
        title: "SOC tiers",
        layers: [
          { label: "Tier 1 analyst", detail: "Triages alerts, escalates real ones." },
          { label: "Tier 2 analyst", detail: "Investigates and contains incidents." },
          { label: "Tier 3 / hunter", detail: "Threat hunting and hard cases." },
          { label: "SOC lead", detail: "Process, tuning and reporting." },
        ],
      },
    ],
    keyPoints: [
      "Tier 1 is the common entry point into security operations.",
      "Blue team defends, red team attacks, purple team bridges both.",
      "Analysts rely on a SIEM and documented playbooks.",
      "Entry certifications include Security+ and vendor SOC badges.",
    ],
    terms: [
      { term: "SOC", meaning: "Security Operations Centre." },
      { term: "Blue team", meaning: "Defenders who detect and respond." },
      { term: "Red team", meaning: "Authorised attackers testing defences." },
      { term: "Purple team", meaning: "Red and blue collaborating to improve detection." },
    ],
    check: [
      { q: "Which SOC tier usually triages incoming alerts first?", a: "Tier 1." },
      { q: "What is a purple team?", a: "Red and blue teams working together to improve detection." },
    ],
  },

  // ───────────── Networking for security ─────────────
  "sec-networking/osi-tcpip": {
    summary:
      "The OSI model splits networking into seven layers and the TCP/IP model into four. Defenders use the layers to place protocols, devices and attacks precisely, which makes troubleshooting and threat analysis systematic rather than guesswork.",
    visuals: [
      {
        type: "layers",
        title: "OSI model",
        layers: [
          { label: "7 Application", detail: "HTTP, DNS, SMTP." },
          { label: "6 Presentation", detail: "Encoding and encryption." },
          { label: "5 Session", detail: "Sessions between hosts." },
          { label: "4 Transport", detail: "TCP and UDP." },
          { label: "3 Network", detail: "IP and routing." },
          { label: "2 Data link", detail: "MAC addresses and switches." },
          { label: "1 Physical", detail: "Cables and signals." },
        ],
      },
    ],
    keyPoints: [
      "OSI has seven layers; TCP/IP collapses them into four.",
      "TCP sets up a connection with a three-way handshake.",
      "UDP is connectionless and faster but unreliable.",
      "Placing an attack on a layer suggests where to defend.",
    ],
    terms: [
      { term: "OSI model", meaning: "Seven-layer conceptual networking model." },
      { term: "Three-way handshake", meaning: "SYN, SYN-ACK, ACK to start a TCP connection." },
      { term: "Encapsulation", meaning: "Wrapping data in headers at each layer." },
      { term: "TCP/IP model", meaning: "Four-layer practical networking model." },
    ],
    check: [
      { q: "At which OSI layer do IP addresses and routing live?", a: "Layer 3, the network layer." },
      { q: "What are the three messages of the TCP handshake?", a: "SYN, SYN-ACK, ACK." },
    ],
  },

  "sec-networking/ports-protocols": {
    summary:
      "Services listen on well-known ports, so recognising a port suggests the protocol in use. DNS turns names into addresses through a chain of resolvers. Knowing the common ports and how DNS resolves is essential for reading scans and logs.",
    visuals: [
      {
        type: "sequence",
        title: "DNS resolution",
        actors: ["Client", "Resolver", "Root/TLD", "Authoritative"],
        messages: [
          { from: 0, to: 1, label: "Where is example.com?" },
          { from: 1, to: 2, label: "Ask root then TLD" },
          { from: 2, to: 1, label: "Try this authoritative server" },
          { from: 1, to: 3, label: "Where is example.com?" },
          { from: 3, to: 1, label: "Here is the IP" },
          { from: 1, to: 0, label: "Answer, cached with TTL" },
        ],
      },
    ],
    keyPoints: [
      "HTTP is 80, HTTPS 443, SSH 22, DNS 53, RDP 3389.",
      "The resolver walks root, TLD and authoritative servers.",
      "Answers are cached for the record's time to live.",
      "Subnets group addresses and shape routing.",
    ],
    terms: [
      { term: "Port", meaning: "Number identifying a service on a host." },
      { term: "Resolver", meaning: "Server that answers DNS queries for clients." },
      { term: "TTL", meaning: "How long a DNS answer may be cached." },
      { term: "Subnet", meaning: "A division of an IP network." },
    ],
    check: [
      { q: "Which port does HTTPS use by default?", a: "443." },
      { q: "What does a DNS resolver return for a name?", a: "The IP address, cached for the record's TTL." },
    ],
  },

  "sec-networking/packet-analysis": {
    summary:
      "Wireshark captures and decodes packets so you can see exactly what crossed a network. Defenders use display filters to isolate traffic, follow streams to reconstruct conversations, and recognise patterns like port scans or malware beaconing.",
    visuals: [
      {
        type: "flow",
        title: "Packet analysis workflow",
        steps: [
          { label: "Capture", detail: "Record traffic on a lab interface." },
          { label: "Filter", detail: "Narrow with display filters." },
          { label: "Follow stream", detail: "Reassemble a conversation." },
          { label: "Interpret", detail: "Identify normal vs suspicious." },
        ],
      },
    ],
    keyPoints: [
      "Display filters like ip.addr and http narrow huge captures.",
      "Following a TCP stream reconstructs a full conversation.",
      "A single host hitting many ports suggests a port scan.",
      "Regular small connections to one host can be beaconing.",
    ],
    terms: [
      { term: "pcap", meaning: "A saved packet capture file." },
      { term: "Display filter", meaning: "Expression that hides non-matching packets." },
      { term: "Follow stream", meaning: "Reassemble the bytes of one conversation." },
      { term: "Beaconing", meaning: "Malware checking in on a regular interval." },
    ],
    check: [
      { q: "What is the difference between a capture filter and a display filter?", a: "A capture filter limits what is recorded; a display filter hides packets after capture." },
      { q: "What pattern suggests a host is scanning ports?", a: "One source touching many destination ports in a short time." },
    ],
  },

  "sec-networking/firewalls-segmentation": {
    summary:
      "Firewalls decide which traffic may pass based on rules, and stateful firewalls track connections so replies are allowed automatically. Segmentation with VLANs and a DMZ limits how far an attacker can move. A default-deny stance only allows what is explicitly needed.",
    visuals: [
      {
        type: "layers",
        title: "Segmented network",
        layers: [
          { label: "Internet", detail: "Untrusted." },
          { label: "DMZ", detail: "Public-facing servers, isolated." },
          { label: "Internal network", detail: "Workstations and apps." },
          { label: "Restricted zone", detail: "Databases and secrets." },
        ],
      },
    ],
    keyPoints: [
      "Stateful firewalls track connections; stateless judge each packet.",
      "Default-deny blocks everything not explicitly allowed.",
      "A DMZ isolates public servers from the internal network.",
      "NAT lets private addresses share a public one.",
    ],
    terms: [
      { term: "Stateful firewall", meaning: "Tracks connections to allow return traffic." },
      { term: "DMZ", meaning: "Isolated zone for public-facing services." },
      { term: "NAT", meaning: "Maps private addresses to a public one." },
      { term: "Default deny", meaning: "Block all traffic except explicitly allowed." },
    ],
    check: [
      { q: "Why place a web server in a DMZ?", a: "To isolate it so a compromise does not reach the internal network directly." },
      { q: "What does a default-deny rule set require you to do?", a: "Explicitly allow each kind of traffic you need." },
    ],
  },

  "sec-networking/network-attacks": {
    summary:
      "Classic network attacks target the gaps between trusting hosts: spoofing forges identity, man-in-the-middle sits between two parties, and denial of service exhausts resources. Each has a known defence, from encryption to rate limiting and monitoring.",
    visuals: [
      {
        type: "sequence",
        title: "Man-in-the-middle",
        actors: ["Victim", "Attacker", "Gateway"],
        messages: [
          { from: 1, to: 0, label: "I am the gateway (spoof)" },
          { from: 0, to: 1, label: "Traffic sent to attacker" },
          { from: 1, to: 2, label: "Relayed on" },
          { from: 2, to: 1, label: "Reply" },
          { from: 1, to: 0, label: "Relayed back, now readable" },
        ],
      },
    ],
    keyPoints: [
      "ARP spoofing lets an attacker intercept local traffic.",
      "Encryption like TLS defeats passive man-in-the-middle reading.",
      "DoS and DDoS exhaust bandwidth or resources.",
      "Rate limiting and filtering blunt denial of service.",
    ],
    terms: [
      { term: "ARP spoofing", meaning: "Forging MAC-to-IP mappings on a LAN." },
      { term: "Man-in-the-middle", meaning: "Attacker relaying and reading traffic." },
      { term: "DDoS", meaning: "Distributed denial of service from many hosts." },
      { term: "DNS spoofing", meaning: "Returning false DNS answers to redirect victims." },
    ],
    check: [
      { q: "How does TLS help against a man-in-the-middle?", a: "It encrypts and authenticates the channel so relayed traffic cannot be read or trusted falsely." },
      { q: "What is the main goal of a DoS attack?", a: "To make a service unavailable by exhausting its resources." },
    ],
  },

  // ───────────── Linux & Windows security basics ─────────────
  "sec-systems/linux-permissions": {
    summary:
      "Linux files have read, write and execute permissions for owner, group and others. Special bits like SUID change how programs run. Auditing permissions and sudo rules shows who can do what, which is the foundation of least privilege on Linux.",
    visuals: [
      {
        type: "flow",
        title: "Reading permissions",
        steps: [
          { label: "Type", detail: "File, directory or link." },
          { label: "Owner rwx", detail: "What the owner may do." },
          { label: "Group rwx", detail: "What the group may do." },
          { label: "Other rwx", detail: "What everyone else may do." },
        ],
      },
    ],
    keyPoints: [
      "Permissions apply to owner, group and others.",
      "chmod changes permissions, chown changes ownership.",
      "SUID runs a program as its owner, often root.",
      "Overly broad sudo rules undermine least privilege.",
    ],
    terms: [
      { term: "rwx", meaning: "Read, write and execute permission bits." },
      { term: "SUID", meaning: "Run a file with its owner's privileges." },
      { term: "sudoers", meaning: "File defining who may run sudo commands." },
      { term: "chmod", meaning: "Command to change file permissions." },
    ],
    example: {
      lang: "bash",
      code: "ls -l report.txt\n# -rw-r----- 1 alice staff report.txt\n\nchmod 640 report.txt   # owner rw, group r, others none\nchown alice:staff report.txt\nfind / -perm -4000 -type f 2>/dev/null   # list SUID files",
    },
    check: [
      { q: "What does chmod 640 grant others?", a: "Nothing; others have no permissions." },
      { q: "Why audit SUID files?", a: "A vulnerable SUID program can let a user run code as its owner, often root." },
    ],
  },

  "sec-systems/linux-hardening": {
    summary:
      "Hardening removes unnecessary exposure: lock down SSH, disable unused services, run a host firewall and keep patches current. Linux auth logs then record who logged in and who failed, which is where many investigations start.",
    visuals: [
      {
        type: "flow",
        title: "Hardening checklist",
        steps: [
          { label: "Patch", detail: "Apply updates promptly." },
          { label: "Harden SSH", detail: "Keys only, no root login." },
          { label: "Reduce services", detail: "Disable what you do not use." },
          { label: "Firewall", detail: "Allow only needed ports." },
          { label: "Log", detail: "Collect and review auth logs." },
        ],
      },
    ],
    keyPoints: [
      "Prefer SSH keys and disable direct root login.",
      "Every running service is attack surface; remove the unused.",
      "A host firewall backs up network controls.",
      "Auth logs record successful and failed logins.",
    ],
    terms: [
      { term: "sshd", meaning: "The SSH server daemon." },
      { term: "Attack surface", meaning: "The sum of exposed, exploitable points." },
      { term: "journalctl", meaning: "Reads logs from the systemd journal." },
      { term: "Host firewall", meaning: "Firewall running on the machine itself." },
    ],
    check: [
      { q: "Why disable root login over SSH?", a: "It removes a universal, high-value target and forces use of named accounts." },
      { q: "Where would you look for failed SSH logins?", a: "The authentication log, for example via journalctl or auth.log." },
    ],
  },

  "sec-systems/windows-accounts": {
    summary:
      "Windows has local accounts on one machine and domain accounts managed centrally by Active Directory. User Account Control limits admin power until explicitly needed, and Group Policy pushes settings to many machines at once.",
    visuals: [
      {
        type: "compare",
        title: "Local vs domain accounts",
        columns: [
          { title: "Local account", points: ["Exists on one machine", "Managed on that host", "No central policy", "Fine for standalone PCs"] },
          { title: "Domain account", points: ["Managed in Active Directory", "Signs in anywhere in domain", "Group Policy applies", "Central control and audit"] },
        ],
      },
    ],
    keyPoints: [
      "Local accounts live on a single machine only.",
      "Domain accounts are centrally managed in Active Directory.",
      "UAC withholds admin rights until a user approves.",
      "Group Policy enforces settings across the domain.",
    ],
    terms: [
      { term: "Local account", meaning: "Account valid on one computer." },
      { term: "Domain account", meaning: "Account managed by Active Directory." },
      { term: "UAC", meaning: "User Account Control prompt for elevation." },
      { term: "Group Policy", meaning: "Central mechanism to push settings." },
    ],
    check: [
      { q: "What does UAC do when a program requests admin rights?", a: "It prompts the user to approve elevation rather than granting it silently." },
      { q: "Where are domain accounts managed?", a: "In Active Directory." },
    ],
  },

  "sec-systems/windows-event-logs": {
    summary:
      "Windows records security events with numeric IDs, such as 4624 for a logon and 4688 for process creation. Sysmon adds richer telemetry. Knowing the key event IDs and how to query them turns raw logs into an investigation trail.",
    visuals: [
      {
        type: "tree",
        title: "Key Windows events",
        root: "Security log",
        children: [
          { label: "Logon", children: ["4624 success", "4625 failure"] },
          { label: "Process", children: ["4688 process created"] },
          { label: "Account", children: ["4720 user created", "4672 admin logon"] },
          { label: "Sysmon", children: ["1 process", "3 network"] },
        ],
      },
    ],
    keyPoints: [
      "4624 is a successful logon, 4625 a failed one.",
      "4688 records process creation, useful for spotting malware.",
      "Sysmon adds process, network and file telemetry.",
      "PowerShell can query the event logs for analysis.",
    ],
    terms: [
      { term: "Event ID", meaning: "Number identifying a type of Windows event." },
      { term: "Sysmon", meaning: "System Monitor adding detailed telemetry." },
      { term: "Event Viewer", meaning: "Built-in tool to browse Windows logs." },
      { term: "Logon type", meaning: "Code showing how a logon occurred." },
    ],
    check: [
      { q: "Which event ID shows a successful logon?", a: "4624." },
      { q: "What does Sysmon add over the default logs?", a: "Richer telemetry such as process creation, network connections and file events." },
    ],
  },

  "sec-systems/vuln-patching": {
    summary:
      "Vulnerability management finds weaknesses, rates them and tracks their fix. A CVE names a specific flaw, CVSS scores its severity, and the KEV catalog flags those known to be exploited. Risk-based prioritisation patches what attackers actually use first.",
    visuals: [
      {
        type: "cycle",
        title: "Vulnerability management loop",
        steps: [
          { label: "Scan", detail: "Find vulnerabilities on hosts." },
          { label: "Prioritise", detail: "Rank by CVSS and exploitability." },
          { label: "Remediate", detail: "Patch or mitigate." },
          { label: "Rescan", detail: "Confirm the fix." },
        ],
      },
    ],
    keyPoints: [
      "A CVE is a unique identifier for one vulnerability.",
      "CVSS gives a severity score from 0 to 10.",
      "The KEV catalog lists vulnerabilities seen exploited in the wild.",
      "Prioritise by real exploitability, not just raw score.",
    ],
    terms: [
      { term: "CVE", meaning: "Common Vulnerabilities and Exposures identifier." },
      { term: "CVSS", meaning: "Common Vulnerability Scoring System severity." },
      { term: "KEV", meaning: "Known Exploited Vulnerabilities catalog from CISA." },
      { term: "Authenticated scan", meaning: "Scan with credentials for deeper detail." },
    ],
    check: [
      { q: "What does a CVSS score tell you?", a: "The technical severity of a vulnerability on a 0 to 10 scale." },
      { q: "Why patch KEV-listed issues first?", a: "They are confirmed to be exploited in the wild, so the risk is immediate." },
    ],
  },

  // ───────────── Cryptography, PKI & identity ─────────────
  "sec-crypto-identity/crypto-basics": {
    summary:
      "Symmetric encryption uses one shared key and is fast; asymmetric uses a public and private key pair and solves key distribution. Real systems combine them: asymmetric crypto exchanges a symmetric key, which then encrypts the bulk of the data.",
    visuals: [
      {
        type: "compare",
        title: "Symmetric vs asymmetric",
        columns: [
          { title: "Symmetric", points: ["One shared key", "Very fast", "Key distribution is hard", "Example: AES"] },
          { title: "Asymmetric", points: ["Public and private keys", "Slower", "Solves key sharing", "Example: RSA, ECC"] },
        ],
      },
    ],
    keyPoints: [
      "Symmetric encryption uses the same key to encrypt and decrypt.",
      "Asymmetric encryption uses a matched public and private key.",
      "Hybrid schemes use asymmetric to share a symmetric key.",
      "Diffie-Hellman agrees a shared secret over an open channel.",
    ],
    terms: [
      { term: "Symmetric key", meaning: "Single secret key for both directions." },
      { term: "Public key", meaning: "Shareable key that encrypts or verifies." },
      { term: "Private key", meaning: "Secret key that decrypts or signs." },
      { term: "Diffie-Hellman", meaning: "Protocol to agree a shared secret publicly." },
    ],
    check: [
      { q: "Why do real systems combine symmetric and asymmetric crypto?", a: "Asymmetric safely shares a key, symmetric then encrypts data quickly." },
      { q: "Which key do you share with others in an asymmetric pair?", a: "The public key." },
    ],
  },

  "sec-crypto-identity/hashing": {
    summary:
      "A hash is a one-way fingerprint of data: the same input always gives the same output, but you cannot reverse it. Hashes verify integrity, MACs add a secret key, and digital signatures prove origin. Old algorithms like MD5 are retired because collisions are feasible.",
    visuals: [
      {
        type: "compare",
        title: "Integrity primitives",
        columns: [
          { title: "Hash", points: ["No key", "Detects change", "Anyone can compute", "SHA-256"] },
          { title: "MAC", points: ["Shared secret key", "Detects change", "Proves shared secret", "HMAC"] },
          { title: "Signature", points: ["Private key signs", "Public key verifies", "Proves origin", "RSA, ECDSA"] },
        ],
      },
    ],
    keyPoints: [
      "A hash is deterministic and one-way.",
      "Hashes verify that data was not altered.",
      "A MAC uses a shared key; a signature uses a private key.",
      "MD5 and SHA-1 are broken for security use.",
    ],
    terms: [
      { term: "Hash function", meaning: "One-way function producing a fixed digest." },
      { term: "Collision", meaning: "Two inputs with the same hash." },
      { term: "MAC", meaning: "Keyed hash proving integrity and a shared secret." },
      { term: "Digital signature", meaning: "Private-key proof of origin and integrity." },
    ],
    check: [
      { q: "Why is a hash alone not proof of who sent data?", a: "Anyone can compute it; a MAC or signature is needed to prove origin." },
      { q: "Why avoid MD5 for security?", a: "Collisions can be produced, so it no longer guarantees integrity." },
    ],
  },

  "sec-crypto-identity/pki-tls": {
    summary:
      "Public key infrastructure binds identities to public keys through certificates signed by trusted certificate authorities. TLS uses these certificates to authenticate a server and establish an encrypted session, which is what the padlock in a browser represents.",
    visuals: [
      {
        type: "sequence",
        title: "TLS handshake (simplified)",
        actors: ["Client", "Server"],
        messages: [
          { from: 0, to: 1, label: "Hello, supported ciphers" },
          { from: 1, to: 0, label: "Hello, certificate chosen cipher" },
          { from: 0, to: 1, label: "Verify cert, agree key material" },
          { from: 1, to: 0, label: "Finished, switch to encrypted" },
          { from: 0, to: 1, label: "Encrypted application data" },
        ],
      },
    ],
    keyPoints: [
      "A certificate authority signs certificates that bind a key to a name.",
      "Clients trust a chain up to a root they already trust.",
      "TLS authenticates the server and encrypts the session.",
      "Expired or revoked certificates break the chain of trust.",
    ],
    terms: [
      { term: "PKI", meaning: "System of CAs, certificates and trust." },
      { term: "Certificate authority", meaning: "Trusted issuer that signs certificates." },
      { term: "Chain of trust", meaning: "Path from a certificate to a trusted root." },
      { term: "Revocation", meaning: "Marking a certificate no longer valid." },
    ],
    check: [
      { q: "What does a server's certificate let a client do?", a: "Verify the server's identity and set up an encrypted session." },
      { q: "Why does an expired certificate cause a browser warning?", a: "The trust it provided is no longer considered valid." },
    ],
  },

  "sec-crypto-identity/authn-authz": {
    summary:
      "Authentication proves who you are; authorization decides what you may do. Passwords must be stored as salted, slow hashes so a stolen database is hard to crack, which is why Argon2, scrypt and bcrypt replace plain or fast hashes.",
    visuals: [
      {
        type: "flow",
        title: "Login then access",
        steps: [
          { label: "Authenticate", detail: "Verify identity with credentials." },
          { label: "Issue token/session", detail: "Represent the proven identity." },
          { label: "Authorize", detail: "Check permissions per request." },
          { label: "Allow or deny", detail: "Based on the user's rights." },
        ],
      },
    ],
    keyPoints: [
      "Authentication and authorization are separate steps.",
      "Never store passwords in plain text or fast hashes.",
      "Salt makes identical passwords hash differently.",
      "Slow hashes like Argon2 resist mass cracking.",
    ],
    terms: [
      { term: "Authentication", meaning: "Proving who a user is." },
      { term: "Authorization", meaning: "Deciding what a user may do." },
      { term: "Salt", meaning: "Random value added before hashing a password." },
      { term: "Credential stuffing", meaning: "Reusing leaked passwords across sites." },
    ],
    check: [
      { q: "What is the purpose of a salt?", a: "To make identical passwords hash differently and defeat precomputed tables." },
      { q: "Why use a slow hash for passwords?", a: "It makes mass cracking of a stolen database far more expensive." },
    ],
  },

  "sec-crypto-identity/mfa": {
    summary:
      "Multi-factor authentication combines factors from different categories: something you know, have or are. SMS and push can be phished or fatigued, while FIDO2 passkeys bind the login to the real site and resist phishing by design.",
    visuals: [
      {
        type: "compare",
        title: "MFA methods",
        columns: [
          { title: "SMS / TOTP", points: ["Widely supported", "Phishable codes", "SIM-swap risk", "Better than nothing"] },
          { title: "Push", points: ["Convenient", "MFA fatigue risk", "Approve prompts", "Add number matching"] },
          { title: "FIDO2 passkey", points: ["Phishing resistant", "Bound to the site", "No shared secret", "Strongest option"] },
        ],
      },
    ],
    keyPoints: [
      "Factors are something you know, have or are.",
      "True MFA uses factors from different categories.",
      "SMS and TOTP codes can be phished.",
      "FIDO2 passkeys resist phishing by binding to the origin.",
    ],
    terms: [
      { term: "Factor", meaning: "A category of authentication evidence." },
      { term: "TOTP", meaning: "Time-based one-time code from an app." },
      { term: "MFA fatigue", meaning: "Spamming push prompts until a user approves." },
      { term: "FIDO2", meaning: "Standard for phishing-resistant passkeys." },
    ],
    check: [
      { q: "Why are FIDO2 passkeys phishing resistant?", a: "They are bound to the real site's origin, so a fake site cannot use them." },
      { q: "What is an MFA fatigue attack?", a: "Flooding a user with push approvals hoping they accept one." },
    ],
  },

  "sec-crypto-identity/oauth-oidc": {
    summary:
      "OAuth 2.0 lets an app act on a user's behalf without their password by using tokens. OpenID Connect adds an identity layer with an ID token. The authorization code flow with PKCE is the recommended path for web and mobile apps.",
    visuals: [
      {
        type: "sequence",
        title: "Authorization code flow",
        actors: ["User", "App", "Auth server", "API"],
        messages: [
          { from: 1, to: 2, label: "Redirect to log in" },
          { from: 0, to: 2, label: "Authenticate and consent" },
          { from: 2, to: 1, label: "Authorization code" },
          { from: 1, to: 2, label: "Exchange code for tokens" },
          { from: 2, to: 1, label: "Access and ID tokens" },
          { from: 1, to: 3, label: "Call API with access token" },
        ],
      },
    ],
    keyPoints: [
      "OAuth delegates access without sharing the password.",
      "OIDC adds an ID token describing the user.",
      "PKCE protects the code exchange from interception.",
      "Access tokens are short-lived; refresh tokens renew them.",
    ],
    terms: [
      { term: "Access token", meaning: "Credential to call an API." },
      { term: "ID token", meaning: "OIDC token asserting who the user is." },
      { term: "PKCE", meaning: "Proof key protecting the code exchange." },
      { term: "Refresh token", meaning: "Longer-lived token to get new access tokens." },
    ],
    check: [
      { q: "What does the ID token in OIDC convey?", a: "The authenticated user's identity." },
      { q: "Why add PKCE to the authorization code flow?", a: "To stop an intercepted authorization code from being exchanged by an attacker." },
    ],
  },

  "sec-crypto-identity/least-privilege": {
    summary:
      "Least privilege gives each account only the access it needs, no more. Role-based access control groups permissions into roles, separate admin accounts limit blast radius, and periodic reviews remove access that is no longer needed.",
    visuals: [
      {
        type: "tree",
        title: "RBAC",
        root: "Roles",
        children: [
          { label: "Viewer", children: ["Read only"] },
          { label: "Editor", children: ["Read", "Write"] },
          { label: "Admin", children: ["Manage users", "Change config"] },
        ],
      },
    ],
    keyPoints: [
      "Grant only the access each task requires.",
      "RBAC assigns permissions through roles, not individuals.",
      "Keep admin and daily-use accounts separate.",
      "Review access regularly and revoke what is unused.",
    ],
    terms: [
      { term: "Least privilege", meaning: "Minimum access needed to do the job." },
      { term: "RBAC", meaning: "Access granted via roles." },
      { term: "ABAC", meaning: "Access decided from attributes and policy." },
      { term: "Access review", meaning: "Periodic check that access is still needed." },
    ],
    check: [
      { q: "How does RBAC differ from assigning permissions directly?", a: "Permissions are bundled into roles and users get roles, making access easier to manage and audit." },
      { q: "Why use a separate admin account?", a: "To limit the damage if the everyday account is compromised." },
    ],
  },

  // ───────────── Web security from the defender's view ─────────────
  "sec-web/http-web-basics": {
    summary:
      "HTTP is a request and response protocol with methods and status codes. Because it is stateless, sites use cookies and sessions to remember a logged-in user. Understanding this is the basis for both attacking and defending web apps.",
    visuals: [
      {
        type: "sequence",
        title: "A logged-in request",
        actors: ["Browser", "Server"],
        messages: [
          { from: 0, to: 1, label: "POST /login (credentials)" },
          { from: 1, to: 0, label: "Set-Cookie: session=..." },
          { from: 0, to: 1, label: "GET /account (sends cookie)" },
          { from: 1, to: 0, label: "200 OK, account page" },
        ],
      },
    ],
    keyPoints: [
      "HTTP methods include GET, POST, PUT and DELETE.",
      "Status codes group into 2xx, 3xx, 4xx and 5xx.",
      "HTTP is stateless; cookies carry the session.",
      "Cookie flags like HttpOnly and Secure protect sessions.",
    ],
    terms: [
      { term: "HTTP method", meaning: "Verb describing the request intent." },
      { term: "Status code", meaning: "Numeric result of a request." },
      { term: "Cookie", meaning: "Small value the browser stores and returns." },
      { term: "Session", meaning: "Server-side state tied to a cookie." },
    ],
    check: [
      { q: "Why does a web app need cookies or sessions?", a: "HTTP is stateless, so it needs them to remember a logged-in user between requests." },
      { q: "What does the HttpOnly cookie flag prevent?", a: "JavaScript from reading the cookie, limiting theft via XSS." },
    ],
  },

  "sec-web/owasp-top-10": {
    summary:
      "The OWASP Top 10 is a widely used list of the most critical web application security risks. For a defender it is a checklist: know each category, its typical cause, one prevention and how it might show up in logs.",
    visuals: [
      {
        type: "tree",
        title: "Top 10 themes",
        root: "OWASP Top 10",
        children: [
          { label: "Access", children: ["Broken access control"] },
          { label: "Crypto", children: ["Cryptographic failures"] },
          { label: "Input", children: ["Injection", "SSRF"] },
          { label: "Design & config", children: ["Insecure design", "Misconfiguration"] },
          { label: "Components", children: ["Vulnerable dependencies"] },
        ],
      },
    ],
    keyPoints: [
      "The Top 10 ranks the most critical web risks.",
      "Broken access control is consistently near the top.",
      "Each category pairs with a known prevention.",
      "Use it as a review and detection checklist.",
    ],
    terms: [
      { term: "OWASP", meaning: "Open Worldwide Application Security Project." },
      { term: "Broken access control", meaning: "Missing checks on what a user may do." },
      { term: "Insecure design", meaning: "Flaws built into the design itself." },
      { term: "Security misconfiguration", meaning: "Unsafe default or setup choices." },
    ],
    check: [
      { q: "What kind of list is the OWASP Top 10?", a: "The most critical web application security risks, used as a checklist." },
      { q: "Which category is consistently ranked highest in recent lists?", a: "Broken access control." },
    ],
  },

  "sec-web/injection-xss": {
    summary:
      "Injection and cross-site scripting both happen when untrusted input is treated as code. SQL injection fixes with parameterised queries; XSS fixes with context-aware output encoding and a Content Security Policy. The defender's job is to keep data and code apart.",
    visuals: [
      {
        type: "flow",
        title: "Why injection happens",
        steps: [
          { label: "Untrusted input", detail: "From a user or request." },
          { label: "Mixed with code", detail: "Concatenated into a query or page." },
          { label: "Interpreter runs it", detail: "As SQL or script." },
          { label: "Fix: separate", detail: "Parameterise and encode output." },
        ],
      },
    ],
    keyPoints: [
      "Injection and XSS both stem from mixing data with code.",
      "Parameterised queries stop SQL injection.",
      "Context-aware output encoding stops most XSS.",
      "A Content Security Policy limits the damage of XSS.",
    ],
    terms: [
      { term: "SQL injection", meaning: "Untrusted input altering a database query." },
      { term: "XSS", meaning: "Injecting script that runs in a victim's browser." },
      { term: "Parameterised query", meaning: "Query with data bound separately from code." },
      { term: "CSP", meaning: "Content Security Policy restricting what loads." },
    ],
    pitfalls: [
      "Trying to block injection with input filtering alone.",
      "Encoding for HTML but forgetting attribute or JavaScript contexts.",
    ],
    check: [
      { q: "What is the root cause shared by injection and XSS?", a: "Untrusted input being treated as executable code." },
      { q: "What is the primary fix for SQL injection?", a: "Parameterised queries that bind data separately from the query." },
    ],
  },

  "sec-web/access-control-ssrf": {
    summary:
      "Broken access control lets a user reach data or actions they should not, such as changing an ID to view another's record (IDOR). Server-side request forgery tricks a server into making requests, often to internal or cloud metadata endpoints. Both demand checks on the server.",
    visuals: [
      {
        type: "sequence",
        title: "SSRF to metadata",
        actors: ["Attacker", "Vulnerable server", "Metadata endpoint"],
        messages: [
          { from: 0, to: 1, label: "Give me this URL (internal)" },
          { from: 1, to: 2, label: "Server fetches it" },
          { from: 2, to: 1, label: "Returns secrets" },
          { from: 1, to: 0, label: "Leaks them in response" },
        ],
      },
    ],
    keyPoints: [
      "Authorization must be enforced on the server, never the client.",
      "IDOR exposes records by changing an identifier.",
      "SSRF makes a server fetch attacker-chosen URLs.",
      "Restrict outbound requests and block metadata endpoints.",
    ],
    terms: [
      { term: "IDOR", meaning: "Accessing objects by guessing their identifier." },
      { term: "SSRF", meaning: "Forcing a server to make requests for you." },
      { term: "Metadata endpoint", meaning: "Cloud URL returning instance credentials." },
      { term: "Forced browsing", meaning: "Reaching pages by guessing URLs." },
    ],
    check: [
      { q: "Why is hiding a button in the UI not real access control?", a: "The server must enforce it; a request can be sent without the UI." },
      { q: "What makes SSRF dangerous in the cloud?", a: "It can reach internal metadata endpoints that return credentials." },
    ],
  },

  "sec-web/web-defences": {
    summary:
      "Browser security headers, a web application firewall and a secure development lifecycle work together. Headers like HSTS and CSP harden the browser, a WAF filters obvious attacks, and building security into development prevents flaws from shipping.",
    visuals: [
      {
        type: "layers",
        title: "Web defence layers",
        layers: [
          { label: "Secure SDLC", detail: "Design review and testing before release." },
          { label: "CI scanning", detail: "Dependency and code checks." },
          { label: "WAF", detail: "Filters common attack patterns." },
          { label: "Security headers", detail: "Hardens the browser side." },
        ],
      },
    ],
    keyPoints: [
      "HSTS forces HTTPS; CSP limits what the page can load.",
      "A WAF blocks common patterns but is not a substitute for fixes.",
      "Dependency scanning catches known-vulnerable libraries.",
      "A secure SDLC builds security in rather than bolting it on.",
    ],
    terms: [
      { term: "HSTS", meaning: "Header forcing browsers to use HTTPS." },
      { term: "WAF", meaning: "Web application firewall filtering requests." },
      { term: "Secure SDLC", meaning: "Security built into each development stage." },
      { term: "Dependency scanning", meaning: "Checking libraries for known flaws." },
    ],
    check: [
      { q: "Why is a WAF not a replacement for fixing code?", a: "It filters known patterns but can be bypassed; the underlying flaw remains." },
      { q: "What does HSTS enforce?", a: "That browsers only connect to the site over HTTPS." },
    ],
  },

  // ───────────── Malware & the attack lifecycle ─────────────
  "sec-threats/malware-types": {
    summary:
      "Malware is classified by how it behaves: viruses attach to files, worms spread by themselves, trojans hide in useful programs, ransomware encrypts for extortion, and infostealers harvest data. Many modern attacks are fileless, abusing legitimate tools.",
    visuals: [
      {
        type: "tree",
        title: "Malware families",
        root: "Malware",
        children: [
          { label: "Self-spreading", children: ["Virus", "Worm"] },
          { label: "Disguised", children: ["Trojan", "RAT"] },
          { label: "Extortion", children: ["Ransomware"] },
          { label: "Theft", children: ["Infostealer", "Keylogger"] },
        ],
      },
    ],
    keyPoints: [
      "Worms spread on their own; viruses need a host file.",
      "Ransomware often adds data theft for double extortion.",
      "Infostealers and RATs focus on access and data.",
      "Fileless malware abuses built-in tools to avoid detection.",
    ],
    terms: [
      { term: "Worm", meaning: "Malware that self-propagates across hosts." },
      { term: "Trojan", meaning: "Malware disguised as legitimate software." },
      { term: "Ransomware", meaning: "Malware that encrypts data for ransom." },
      { term: "Living off the land", meaning: "Abusing legitimate system tools." },
    ],
    check: [
      { q: "What distinguishes a worm from a virus?", a: "A worm spreads by itself; a virus needs a host file and user action." },
      { q: "What is double extortion ransomware?", a: "Encrypting data and also threatening to leak stolen copies." },
    ],
  },

  "sec-threats/social-engineering": {
    summary:
      "Social engineering targets people rather than software, and phishing is its most common form. Defenders analyse email headers and authentication results (SPF, DKIM, DMARC), inspect links safely, and build easy reporting so users become sensors.",
    visuals: [
      {
        type: "flow",
        title: "Analysing a suspect email",
        steps: [
          { label: "Spot red flags", detail: "Urgency, mismatch, odd sender." },
          { label: "Check headers", detail: "SPF, DKIM, DMARC results." },
          { label: "Inspect links", detail: "Hover and expand, do not click." },
          { label: "Report", detail: "Use the reporting process." },
        ],
      },
    ],
    keyPoints: [
      "Phishing exploits trust, urgency and authority.",
      "SPF, DKIM and DMARC help verify sender legitimacy.",
      "Inspect links and attachments without opening them live.",
      "Easy reporting turns users into an early warning system.",
    ],
    terms: [
      { term: "Phishing", meaning: "Fraudulent messages to steal data or access." },
      { term: "SPF", meaning: "Records authorised sending servers for a domain." },
      { term: "DKIM", meaning: "Signs mail so recipients can verify it." },
      { term: "DMARC", meaning: "Policy tying SPF and DKIM to the from domain." },
    ],
    check: [
      { q: "What do SPF, DKIM and DMARC together help establish?", a: "Whether an email genuinely came from the domain it claims." },
      { q: "Why is a simple report button valuable?", a: "It makes users effective sensors by lowering the effort to report." },
    ],
  },

  "sec-threats/kill-chain": {
    summary:
      "The Cyber Kill Chain breaks an intrusion into ordered phases from reconnaissance to actions on objectives. Its value for defenders is that breaking any one link disrupts the whole attack, so controls can be placed at the cheapest or earliest phase.",
    visuals: [
      {
        type: "cycle",
        title: "Kill chain phases",
        steps: [
          { label: "Recon", detail: "Research the target." },
          { label: "Delivery", detail: "Get the payload to the victim." },
          { label: "Exploitation", detail: "Trigger the vulnerability." },
          { label: "Installation", detail: "Establish a foothold." },
          { label: "C2", detail: "Command and control channel." },
          { label: "Objectives", detail: "Steal, encrypt or disrupt." },
        ],
      },
    ],
    keyPoints: [
      "The kill chain orders the phases of an intrusion.",
      "Breaking one link disrupts the whole attack.",
      "Earlier disruption is usually cheaper and safer.",
      "It helps map controls to attack stages.",
    ],
    terms: [
      { term: "Kill chain", meaning: "Ordered phases of a cyber attack." },
      { term: "Delivery", meaning: "Getting the payload to the victim." },
      { term: "Command and control", meaning: "Attacker's channel to the foothold." },
      { term: "Actions on objectives", meaning: "The attacker's final goal." },
    ],
    check: [
      { q: "Why is breaking an early kill chain phase valuable?", a: "It stops the attack before it reaches its objective and is often cheaper to do." },
      { q: "What is the command and control phase?", a: "The attacker maintaining a channel to control the compromised host." },
    ],
  },

  "sec-threats/mitre-attack": {
    summary:
      "MITRE ATT&CK is a knowledge base of real attacker tactics (the why) and techniques (the how), observed in the wild. Defenders map alerts and incidents to it to describe behaviour precisely, measure detection coverage and find gaps.",
    visuals: [
      {
        type: "tree",
        title: "ATT&CK structure",
        root: "ATT&CK",
        children: [
          { label: "Tactic: Initial Access", children: ["Phishing", "Valid accounts"] },
          { label: "Tactic: Execution", children: ["Command interpreter"] },
          { label: "Tactic: Persistence", children: ["Scheduled task"] },
          { label: "Tactic: Exfiltration", children: ["Over C2 channel"] },
        ],
      },
    ],
    keyPoints: [
      "Tactics are goals; techniques are the methods.",
      "ATT&CK describes behaviour seen in real intrusions.",
      "Mapping incidents to ATT&CK gives a shared language.",
      "Navigator visualises detection coverage and gaps.",
    ],
    terms: [
      { term: "Tactic", meaning: "An attacker's objective, the why." },
      { term: "Technique", meaning: "How a tactic is achieved." },
      { term: "TTP", meaning: "Tactics, techniques and procedures." },
      { term: "Navigator", meaning: "Tool to annotate the ATT&CK matrix." },
    ],
    check: [
      { q: "What is the difference between a tactic and a technique?", a: "A tactic is the goal; a technique is how it is achieved." },
      { q: "Why map detections to ATT&CK?", a: "To describe behaviour consistently and see coverage gaps." },
    ],
  },

  "sec-threats/threat-intel": {
    summary:
      "Threat intelligence turns data about adversaries into action. Indicators of compromise like IPs and hashes are easy to use but easy for attackers to change; behaviours and TTPs are harder to change, which the Pyramid of Pain captures.",
    visuals: [
      {
        type: "layers",
        title: "Pyramid of Pain",
        layers: [
          { label: "TTPs", detail: "Hardest for attacker to change." },
          { label: "Tools", detail: "Painful to swap." },
          { label: "Network/host artefacts", detail: "Some effort." },
          { label: "Domains", detail: "Annoying." },
          { label: "IPs and hashes", detail: "Trivial to change." },
        ],
      },
    ],
    keyPoints: [
      "IOCs are observable facts like IPs, domains and hashes.",
      "TTPs describe behaviour and are harder to change.",
      "The Pyramid of Pain ranks indicators by attacker cost.",
      "Enrich alerts with intel to speed triage.",
    ],
    terms: [
      { term: "IOC", meaning: "Indicator of compromise, an observable artefact." },
      { term: "TTP", meaning: "Tactics, techniques and procedures." },
      { term: "Pyramid of Pain", meaning: "Model ranking indicators by attacker effort." },
      { term: "Enrichment", meaning: "Adding context to an alert from intel." },
    ],
    check: [
      { q: "Why are TTPs more valuable to detect than IPs?", a: "They are much harder for attackers to change than an IP or hash." },
      { q: "What is enrichment in triage?", a: "Adding context, such as reputation of an IP, to help decide on an alert." },
    ],
  },

  // ───────────── Logging, SIEM & detection ─────────────
  "sec-detection/log-sources": {
    summary:
      "Detection is only as good as the logs collected. High-value sources include endpoint (process and Sysmon), network, identity and cloud logs. Logs must be forwarded reliably, timestamped consistently, and retained long enough to investigate.",
    visuals: [
      {
        type: "flow",
        title: "Log pipeline",
        steps: [
          { label: "Source", detail: "Endpoint, network, identity, cloud." },
          { label: "Agent", detail: "Collects and forwards." },
          { label: "SIEM", detail: "Parses and indexes." },
          { label: "Analyst", detail: "Searches and alerts." },
        ],
      },
    ],
    keyPoints: [
      "Endpoint, network, identity and cloud logs cover most attacks.",
      "Agents forward logs reliably to the SIEM.",
      "Normalise timestamps to UTC to correlate events.",
      "Retention must outlast the time to detect an incident.",
    ],
    terms: [
      { term: "Log source", meaning: "A system producing security-relevant logs." },
      { term: "Forwarder", meaning: "Agent that ships logs to the SIEM." },
      { term: "Normalisation", meaning: "Mapping logs to a common schema." },
      { term: "Retention", meaning: "How long logs are kept." },
    ],
    check: [
      { q: "Why normalise timestamps to UTC?", a: "So events from different systems can be correlated on one timeline." },
      { q: "What limits how far back you can investigate?", a: "The log retention period." },
    ],
  },

  "sec-detection/siem-basics": {
    summary:
      "A SIEM ingests logs from many sources, parses them into fields, and lets analysts search and alert across everything in one place. It is the central workbench of a SOC, turning scattered logs into correlated, searchable events.",
    visuals: [
      {
        type: "flow",
        title: "SIEM processing",
        steps: [
          { label: "Ingest", detail: "Receive logs from sources." },
          { label: "Parse", detail: "Extract fields from raw text." },
          { label: "Index", detail: "Store for fast search." },
          { label: "Search & alert", detail: "Query and trigger rules." },
        ],
      },
    ],
    keyPoints: [
      "A SIEM centralises logs from across the environment.",
      "Parsing turns raw text into searchable fields.",
      "Correlation links events that are suspicious together.",
      "Dashboards summarise activity for quick review.",
    ],
    terms: [
      { term: "SIEM", meaning: "Security Information and Event Management." },
      { term: "Parsing", meaning: "Extracting fields from raw log text." },
      { term: "Correlation", meaning: "Linking related events into one picture." },
      { term: "Dashboard", meaning: "Visual summary of activity." },
    ],
    check: [
      { q: "Why parse logs into fields?", a: "So they can be searched, filtered and aggregated efficiently." },
      { q: "What is correlation in a SIEM?", a: "Linking related events, such as a failed logon burst followed by a success." },
    ],
  },

  "sec-detection/detection-rules": {
    summary:
      "Sigma is a generic, vendor-neutral format for detection rules. You write a rule describing suspicious log patterns, convert it to your SIEM's query language, and test it against both benign and malicious samples so it fires on threats without drowning analysts.",
    visuals: [
      {
        type: "flow",
        title: "Writing a detection",
        steps: [
          { label: "Pick technique", detail: "Choose behaviour to detect." },
          { label: "Write Sigma", detail: "Describe the log pattern." },
          { label: "Convert", detail: "Translate to the SIEM query." },
          { label: "Test & tune", detail: "Check true and false positives." },
        ],
      },
    ],
    keyPoints: [
      "Sigma is a portable, SIEM-agnostic rule format.",
      "Convert a Sigma rule to your platform's query language.",
      "Test against benign data to estimate false positives.",
      "Map rules to ATT&CK techniques for coverage.",
    ],
    terms: [
      { term: "Sigma", meaning: "Generic detection rule format in YAML." },
      { term: "Detection rule", meaning: "Logic that fires an alert on a log pattern." },
      { term: "True positive", meaning: "Alert that correctly flags real activity." },
      { term: "Backend", meaning: "Target SIEM a Sigma rule converts to." },
    ],
    check: [
      { q: "Why is Sigma useful across different SIEMs?", a: "It is vendor-neutral and converts to each platform's query language." },
      { q: "Why test a new rule against benign data?", a: "To estimate its false-positive rate before deploying it." },
    ],
  },

  "sec-detection/alert-triage": {
    summary:
      "Triage decides whether an alert is a true positive, a false positive or benign activity, and documents why. A consistent checklist, context on the user and host, and a clear escalation path keep decisions fast and defensible.",
    visuals: [
      {
        type: "flow",
        title: "Triage decision",
        steps: [
          { label: "Read alert", detail: "What fired and why." },
          { label: "Gather context", detail: "User, host, recent activity." },
          { label: "Decide", detail: "True, false or benign." },
          { label: "Act", detail: "Escalate or close with notes." },
        ],
      },
    ],
    keyPoints: [
      "Classify each alert as true positive, false positive or benign.",
      "Context on user and host drives the decision.",
      "Document the reasoning for every decision.",
      "Tune noisy rules rather than ignoring them.",
    ],
    terms: [
      { term: "Triage", meaning: "Quickly assessing and prioritising alerts." },
      { term: "False positive", meaning: "Alert flagging harmless activity." },
      { term: "Benign true positive", meaning: "Real but authorised activity." },
      { term: "Escalation", meaning: "Passing an incident to a higher tier." },
    ],
    check: [
      { q: "What is a false positive?", a: "An alert that flags activity that is not actually malicious." },
      { q: "Why document triage reasoning?", a: "So decisions are consistent, auditable and can be reviewed later." },
    ],
  },

  "sec-detection/ids-edr": {
    summary:
      "Intrusion detection systems watch network traffic for known patterns, while endpoint detection and response watches process and file behaviour on hosts and can act. Flow logs and Zeek add network context. Together they give both network and endpoint visibility.",
    visuals: [
      {
        type: "compare",
        title: "IDS vs EDR",
        columns: [
          { title: "IDS/IPS", points: ["Watches network traffic", "Signature and anomaly based", "IPS can block inline", "Blind to encrypted payloads"] },
          { title: "EDR", points: ["Watches endpoint behaviour", "Rich process telemetry", "Can isolate a host", "Needs an agent installed"] },
        ],
      },
    ],
    keyPoints: [
      "IDS detects; IPS can also block inline.",
      "EDR focuses on endpoint process and file behaviour.",
      "EDR can respond, for example isolating a host.",
      "NetFlow and Zeek add network context without full capture.",
    ],
    terms: [
      { term: "IDS", meaning: "Intrusion detection system for network traffic." },
      { term: "IPS", meaning: "Like an IDS but can block inline." },
      { term: "EDR", meaning: "Endpoint detection and response agent." },
      { term: "NetFlow", meaning: "Summary records of network connections." },
    ],
    check: [
      { q: "What can an IPS do that an IDS cannot?", a: "Block malicious traffic inline, not just alert on it." },
      { q: "What is a key response action EDR can take?", a: "Isolating a compromised host from the network." },
    ],
  },

  // ───────────── Incident response ─────────────
  "sec-incident-response/ir-lifecycle": {
    summary:
      "Incident response follows a repeatable lifecycle: prepare, detect and analyse, contain, eradicate and recover, then learn. Working the cycle calmly, with defined severities and roles, keeps a crisis from becoming chaos.",
    visuals: [
      {
        type: "cycle",
        title: "IR lifecycle",
        steps: [
          { label: "Prepare", detail: "Plans, tools and training." },
          { label: "Detect & analyse", detail: "Confirm and scope the incident." },
          { label: "Contain", detail: "Stop the spread." },
          { label: "Eradicate & recover", detail: "Remove and restore." },
          { label: "Lessons learned", detail: "Improve for next time." },
        ],
      },
    ],
    keyPoints: [
      "Preparation makes every later phase faster.",
      "Severity levels set the pace and who is involved.",
      "Containment comes before eradication and recovery.",
      "Lessons learned feed back into preparation.",
    ],
    terms: [
      { term: "Incident", meaning: "A confirmed harmful security event." },
      { term: "Severity", meaning: "How serious an incident is." },
      { term: "Containment", meaning: "Limiting the spread of an incident." },
      { term: "Lessons learned", meaning: "Review that improves future response." },
    ],
    check: [
      { q: "Which IR phase makes all the others faster?", a: "Preparation." },
      { q: "Why contain before eradicating?", a: "To stop further spread and damage before cleaning up." },
    ],
  },

  "sec-incident-response/triage-containment": {
    summary:
      "Scoping finds every affected host and account before you act. Short-term containment stops immediate harm; long-term containment holds the line while you prepare a clean recovery. Eradication removes persistence and resets compromised credentials.",
    visuals: [
      {
        type: "flow",
        title: "Contain and eradicate",
        steps: [
          { label: "Scope", detail: "Find all affected systems." },
          { label: "Contain", detail: "Isolate to stop harm." },
          { label: "Eradicate", detail: "Remove persistence, reset creds." },
          { label: "Verify", detail: "Confirm the threat is gone." },
        ],
      },
    ],
    keyPoints: [
      "Scope fully before containing to avoid missing hosts.",
      "Short-term containment stops immediate harm.",
      "Eradication removes persistence and resets credentials.",
      "Verify eradication before moving to recovery.",
    ],
    terms: [
      { term: "Scoping", meaning: "Determining the full extent of an incident." },
      { term: "Containment", meaning: "Isolating affected systems." },
      { term: "Persistence", meaning: "Attacker's means to regain access." },
      { term: "Eradication", meaning: "Removing the attacker's presence." },
    ],
    check: [
      { q: "Why scope before containing?", a: "So containment covers every affected host and account, not just the first one found." },
      { q: "Why reset credentials during eradication?", a: "The attacker may have stolen them and could reuse them to return." },
    ],
  },

  "sec-incident-response/forensics-basics": {
    summary:
      "Digital forensics collects and preserves evidence so conclusions hold up. Volatile data like memory is captured before disk, every item is hashed for integrity, and a chain of custody records who handled what. A timeline ties the artefacts together.",
    visuals: [
      {
        type: "layers",
        title: "Order of volatility",
        layers: [
          { label: "CPU and memory", detail: "Most volatile, capture first." },
          { label: "Network state", detail: "Connections and caches." },
          { label: "Disk", detail: "Files and logs." },
          { label: "Archives and backups", detail: "Least volatile." },
        ],
      },
    ],
    keyPoints: [
      "Capture the most volatile evidence first.",
      "Hash evidence so later changes are detectable.",
      "A chain of custody records every handler.",
      "A timeline turns artefacts into a narrative.",
    ],
    terms: [
      { term: "Order of volatility", meaning: "Sequence from most to least perishable data." },
      { term: "Chain of custody", meaning: "Record of who handled evidence and when." },
      { term: "Imaging", meaning: "Making a verified copy of storage." },
      { term: "Timeline", meaning: "Ordered sequence of events from artefacts." },
    ],
    check: [
      { q: "Why capture memory before disk?", a: "Memory is more volatile and is lost when the system powers off." },
      { q: "What does hashing evidence provide?", a: "Proof the evidence has not changed since collection." },
    ],
  },

  "sec-incident-response/playbooks-lessons": {
    summary:
      "Playbooks turn hard-won experience into repeatable steps for common incidents like phishing. Clear communication plans decide who is told what and when, and a blameless lessons-learned review turns each incident into lasting improvement.",
    visuals: [
      {
        type: "flow",
        title: "Phishing playbook",
        steps: [
          { label: "Confirm", detail: "Validate the report." },
          { label: "Contain", detail: "Pull mail, reset if clicked." },
          { label: "Hunt", detail: "Find others who received it." },
          { label: "Review", detail: "Lessons learned." },
        ],
      },
    ],
    keyPoints: [
      "Playbooks make response consistent under pressure.",
      "Communication plans define who is informed and when.",
      "Blameless reviews focus on systems, not individuals.",
      "Actions from reviews feed back into preparation.",
    ],
    terms: [
      { term: "Playbook", meaning: "Step-by-step guide for a type of incident." },
      { term: "Runbook", meaning: "Detailed operational procedure." },
      { term: "Blameless review", meaning: "Post-incident analysis without blame." },
      { term: "Communication plan", meaning: "Who is told what, and when." },
    ],
    check: [
      { q: "Why run blameless post-incident reviews?", a: "People share honestly, so the real systemic causes get fixed." },
      { q: "What is the value of a playbook during an incident?", a: "It provides tested steps so responders act consistently under pressure." },
    ],
  },

  // ───────────── Cloud security & governance ─────────────
  "sec-cloud-grc/shared-responsibility": {
    summary:
      "In the cloud, security duties are split between the provider and you. The provider secures the underlying infrastructure; you secure your data, identities and configuration. The split shifts with the service model, and identity is the new perimeter.",
    visuals: [
      {
        type: "compare",
        title: "Who secures what",
        columns: [
          { title: "Provider", points: ["Physical data centres", "Host and hypervisor", "Managed service internals", "Global network"] },
          { title: "You", points: ["Your data", "Identity and access", "Configuration", "App-level security"] },
        ],
      },
    ],
    keyPoints: [
      "Security is shared between provider and customer.",
      "You always own your data, identities and configuration.",
      "The split shifts across IaaS, PaaS and SaaS.",
      "Prefer roles over long-lived access keys.",
    ],
    terms: [
      { term: "Shared responsibility", meaning: "Split of security duties in the cloud." },
      { term: "IaaS", meaning: "Infrastructure as a service." },
      { term: "IAM", meaning: "Identity and access management." },
      { term: "Role", meaning: "Temporary credentials an identity assumes." },
    ],
    check: [
      { q: "In the shared model, who always owns the data?", a: "You, the customer." },
      { q: "Why prefer roles over long-lived keys?", a: "Roles give short-lived credentials, reducing the damage from a leak." },
    ],
  },

  "sec-cloud-grc/cloud-misconfig": {
    summary:
      "Most cloud breaches come from misconfiguration, not provider flaws: public storage buckets, wide-open security groups and disabled audit logs. Enabling audit logging and running posture checks finds these before an attacker does.",
    visuals: [
      {
        type: "flow",
        title: "Finding misconfigurations",
        steps: [
          { label: "Enable logging", detail: "Turn on the audit trail." },
          { label: "Scan posture", detail: "Run a configuration checker." },
          { label: "Prioritise", detail: "Public and privileged first." },
          { label: "Alert on drift", detail: "Catch risky changes." },
        ],
      },
    ],
    keyPoints: [
      "Misconfiguration causes most cloud incidents.",
      "Public buckets and open security groups are common.",
      "Audit logging such as CloudTrail is foundational.",
      "Posture tools and drift alerts catch regressions.",
    ],
    terms: [
      { term: "Misconfiguration", meaning: "Unsafe cloud resource settings." },
      { term: "Audit log", meaning: "Record of API actions in the account." },
      { term: "Security group", meaning: "Virtual firewall around cloud resources." },
      { term: "Posture management", meaning: "Continuous config checking against best practice." },
    ],
    check: [
      { q: "What is the most common cause of cloud breaches?", a: "Customer misconfiguration, such as public storage or open ports." },
      { q: "Why enable audit logging first?", a: "Without it, you cannot investigate what happened in the account." },
    ],
  },

  "sec-cloud-grc/frameworks": {
    summary:
      "Security frameworks give a common structure for a programme. The NIST Cybersecurity Framework organises work into functions, ISO 27001 defines a certifiable management system, and the CIS Controls give a prioritised list of concrete actions.",
    visuals: [
      {
        type: "flow",
        title: "NIST CSF 2.0 functions",
        steps: [
          { label: "Govern", detail: "Set strategy and roles." },
          { label: "Identify", detail: "Know assets and risks." },
          { label: "Protect", detail: "Put safeguards in place." },
          { label: "Detect", detail: "Find events." },
          { label: "Respond", detail: "Act on incidents." },
          { label: "Recover", detail: "Restore operations." },
        ],
      },
    ],
    keyPoints: [
      "NIST CSF organises work into six functions.",
      "ISO 27001 is a certifiable management system.",
      "CIS Controls are a prioritised action list.",
      "Frameworks map to each other for a common language.",
    ],
    terms: [
      { term: "NIST CSF", meaning: "Framework of functions for cyber risk." },
      { term: "ISO 27001", meaning: "Standard for an information security management system." },
      { term: "CIS Controls", meaning: "Prioritised set of defensive actions." },
      { term: "Control mapping", meaning: "Linking one control across frameworks." },
    ],
    check: [
      { q: "What are the six NIST CSF 2.0 functions?", a: "Govern, Identify, Protect, Detect, Respond and Recover." },
      { q: "How do CIS Controls differ from NIST CSF?", a: "CIS gives a prioritised list of concrete actions rather than high-level functions." },
    ],
  },

  "sec-cloud-grc/risk-compliance": {
    summary:
      "Governance, risk and compliance connects security work to the business. A risk register tracks risks and their treatment, policies and standards set expectations, and regulations like GDPR or PCI DSS impose requirements that audits verify with evidence.",
    visuals: [
      {
        type: "tree",
        title: "Policy hierarchy",
        root: "Governance",
        children: [
          { label: "Policy", children: ["What and why"] },
          { label: "Standard", children: ["Specific requirements"] },
          { label: "Procedure", children: ["Step-by-step how"] },
          { label: "Guideline", children: ["Recommended practice"] },
        ],
      },
    ],
    keyPoints: [
      "A risk register tracks risks, owners and treatment.",
      "Policies say what and why; procedures say how.",
      "GDPR, PCI DSS and SOC 2 impose external requirements.",
      "Audits confirm controls with collected evidence.",
    ],
    terms: [
      { term: "GRC", meaning: "Governance, risk and compliance." },
      { term: "Risk register", meaning: "Living list of risks and their treatment." },
      { term: "Policy", meaning: "High-level statement of intent and rules." },
      { term: "Audit", meaning: "Independent check that controls work." },
    ],
    check: [
      { q: "What is the difference between a policy and a procedure?", a: "A policy states what and why; a procedure gives the step-by-step how." },
      { q: "What does an audit need from you?", a: "Evidence that the required controls exist and operate." },
    ],
  },

  // ───────────── Capstone: home SOC lab ─────────────
  "sec-capstone/lab-build": {
    summary:
      "A home SOC lab is an isolated virtual environment where you can safely generate and analyse security data. A Windows host, a Linux host and a SIEM collecting their logs give you the full detection pipeline on your own machine.",
    visuals: [
      {
        type: "flow",
        title: "Lab build",
        steps: [
          { label: "Isolated network", detail: "Host-only, no real systems." },
          { label: "Endpoints", detail: "Windows and Linux VMs." },
          { label: "Telemetry", detail: "Sysmon and auth logs." },
          { label: "SIEM", detail: "Wazuh or Elastic collects logs." },
        ],
      },
    ],
    keyPoints: [
      "Keep the lab isolated from real networks.",
      "Include at least one Windows and one Linux endpoint.",
      "Forward Sysmon and auth logs into the SIEM.",
      "Snapshot VMs so you can reset cleanly.",
    ],
    terms: [
      { term: "Home lab", meaning: "Personal isolated environment for practice." },
      { term: "Host-only network", meaning: "Virtual network with no internet access." },
      { term: "Wazuh", meaning: "Open-source SIEM and XDR platform." },
      { term: "Snapshot", meaning: "Saved VM state you can restore to." },
    ],
    check: [
      { q: "Why must the lab be isolated?", a: "So practice attacks cannot reach real or production systems." },
      { q: "Why forward Sysmon logs to the SIEM?", a: "They provide rich endpoint telemetry to build detections on." },
    ],
  },

  "sec-capstone/attack-simulation": {
    summary:
      "To test detections you need realistic attacker activity. Safe emulation tools like Atomic Red Team run small, documented tests mapped to ATT&CK techniques in your own lab, letting you see which ones your detections catch.",
    visuals: [
      {
        type: "cycle",
        title: "Emulation loop",
        steps: [
          { label: "Snapshot", detail: "Save a clean VM state." },
          { label: "Run test", detail: "Execute an atomic test." },
          { label: "Observe", detail: "Check alerts and logs." },
          { label: "Reset", detail: "Restore the snapshot." },
        ],
      },
    ],
    keyPoints: [
      "Emulation generates realistic telemetry safely.",
      "Atomic tests map to specific ATT&CK techniques.",
      "Snapshot before and reset after each test.",
      "Record which techniques raised an alert.",
    ],
    terms: [
      { term: "Adversary emulation", meaning: "Reproducing attacker behaviour to test defences." },
      { term: "Atomic Red Team", meaning: "Library of small tests mapped to ATT&CK." },
      { term: "Detection gap", meaning: "A technique your tools do not catch." },
      { term: "Telemetry", meaning: "The log data a test produces." },
    ],
    check: [
      { q: "Why map emulation tests to ATT&CK?", a: "To know exactly which techniques your detections cover and which they miss." },
      { q: "Why snapshot before each test?", a: "So you can reset the VM to a clean state afterward." },
    ],
  },

  "sec-capstone/detect-investigate": {
    summary:
      "The core SOC skill is turning telemetry into a story: detect the activity, investigate it across hosts and users, build a timeline, and write a report that both executives and engineers can act on. This is the capstone that proves readiness.",
    visuals: [
      {
        type: "flow",
        title: "Investigation to report",
        steps: [
          { label: "Detect", detail: "Alert or hunt finds activity." },
          { label: "Investigate", detail: "Pull logs across hosts." },
          { label: "Timeline", detail: "Order the events." },
          { label: "Report", detail: "Executive and technical writeup." },
        ],
      },
    ],
    keyPoints: [
      "Write detections for techniques you initially missed.",
      "Investigate across endpoint, network and identity logs.",
      "A timeline connects the events into a narrative.",
      "Report for both executive and technical readers.",
    ],
    terms: [
      { term: "Investigation", meaning: "Gathering evidence to understand an alert." },
      { term: "Timeline", meaning: "Ordered sequence of what happened." },
      { term: "Executive summary", meaning: "Short, non-technical overview of impact." },
      { term: "Root cause", meaning: "The underlying reason an incident occurred." },
    ],
    check: [
      { q: "Why build a timeline during investigation?", a: "It turns scattered events into a clear story of what happened and when." },
      { q: "Who are the two audiences for an incident report?", a: "Executives who need impact and decisions, and engineers who need technical detail." },
    ],
  },

  "sec-capstone/practice-portfolio": {
    summary:
      "Guided blue-team labs build fluency, and documented write-ups make your skills visible to employers. Publishing clear investigations, with diagrams and lessons, turns practice into a portfolio that supports a SOC job application.",
    visuals: [
      {
        type: "flow",
        title: "Build a portfolio",
        steps: [
          { label: "Practise", detail: "Complete guided labs." },
          { label: "Document", detail: "Write clear investigations." },
          { label: "Publish", detail: "Share write-ups and diagrams." },
          { label: "Plan", detail: "Choose your next certification." },
        ],
      },
    ],
    keyPoints: [
      "Guided labs build detection and investigation fluency.",
      "Write-ups demonstrate your reasoning, not just results.",
      "Diagrams make complex investigations easy to follow.",
      "A portfolio supports job and certification goals.",
    ],
    terms: [
      { term: "Blue-team lab", meaning: "Guided defensive practice scenario." },
      { term: "Write-up", meaning: "Documented account of an investigation." },
      { term: "Portfolio", meaning: "Collection of work shown to employers." },
      { term: "Certification", meaning: "Credential validating skills." },
    ],
    check: [
      { q: "Why document your lab investigations?", a: "Write-ups show employers how you reason, not just that you solved a box." },
      { q: "What makes a write-up easier to follow?", a: "Clear diagrams and a timeline of the investigation." },
    ],
  },
};

export default explainers;
