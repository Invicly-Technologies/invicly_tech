import type { LearningPath } from "../types";

const L = (label: string, url: string) => ({ label, url });

const path: LearningPath = {
  slug: "cyber-security-fundamentals",
  title: "Cyber Security Fundamentals",
  tagline: "Think like a defender and get SOC-ready.",
  description:
    "A defensive, blue-team track from security principles to a working home SOC lab. Learn the networking, operating system, cryptography and identity basics defenders rely on, then detect, investigate and respond to attacks using logs, a SIEM, MITRE ATT&CK and a real incident response process.",
  level: "Beginner → Intermediate",
  category: "Security",
  icon: "shield",
  outcomes: [
    "Explain core security principles and threat-model a simple system with STRIDE",
    "Analyse network traffic and Windows and Linux logs to spot suspicious activity",
    "Explain how TLS, PKI, MFA and OAuth/OIDC protect data and identities",
    "Write and tune detections in a SIEM and map them to MITRE ATT&CK",
    "Run an incident through the NIST lifecycle and write a clear incident report",
    "Build a home SOC lab and document investigations for a portfolio",
  ],
  tools: ["Wireshark", "Linux CLI", "Windows Event Viewer", "Sysmon", "Elastic Stack", "Splunk Free", "Wazuh", "Sigma", "Suricata", "MITRE ATT&CK Navigator", "CyberChef", "VirtualBox"],
  modules: [
    {
      key: "sec-foundations",
      title: "Security principles & threat modelling",
      summary: "The vocabulary and mental models every defender uses.",
      links: [L("Cyber security roadmap", "https://roadmap.sh/cyber-security"), L("CISA", "https://www.cisa.gov/")],
      topics: [
        { key: "cia-triad", title: "CIA triad, AAA & non-repudiation", hours: 2.5, goal: "Classify any security incident by which of confidentiality, integrity or availability it harmed.", subtopics: ["Define confidentiality, integrity and availability", "Explain authentication, authorization and accounting", "Explain non-repudiation with an example", "Classify real breaches by CIA impact"] },
        { key: "risk-basics", title: "Assets, threats, vulnerabilities & risk", hours: 2.5, goal: "Describe a risk as a threat exploiting a vulnerability in an asset and estimate its likelihood and impact.", subtopics: ["Distinguish threat, vulnerability and risk", "Identify assets and their owners", "Score likelihood and impact", "Choose to mitigate, transfer, accept or avoid"] },
        { key: "threat-modelling", title: "Threat modelling with STRIDE", hours: 3, goal: "Draw a data flow diagram for a small app and list STRIDE threats with mitigations.", subtopics: ["Draw a data flow diagram", "Mark trust boundaries", "Apply STRIDE to each element", "Propose a mitigation per threat"], links: [L("OWASP Threat Modeling", "https://owasp.org/www-community/Threat_Modeling")] },
        { key: "defence-in-depth", title: "Security controls & defence in depth", hours: 2.5, goal: "Layer preventive, detective and corrective controls so one failure does not mean a breach.", subtopics: ["Classify controls by type and function", "Explain defence in depth layers", "Apply least privilege and zero trust ideas", "Map controls to a sample network"] },
        { key: "soc-roles", title: "Security careers & the SOC", hours: 1.5, goal: "Describe what SOC tiers, analysts and incident responders do day to day.", subtopics: ["Compare SOC tier 1, 2 and 3", "Explain blue, red and purple teams", "List common entry-level certifications"], links: [L("TryHackMe", "https://tryhackme.com/")] },
      ],
    },
    {
      key: "sec-networking",
      title: "Networking for security",
      summary: "Know normal traffic so you can spot abnormal traffic.",
      links: [L("Wireshark docs", "https://www.wireshark.org/docs/")],
      topics: [
        { key: "osi-tcpip", title: "OSI & TCP/IP models", hours: 3, goal: "Place protocols, devices and attacks on the right OSI and TCP/IP layer.", subtopics: ["Name the seven OSI layers", "Map OSI to the TCP/IP model", "Explain the TCP three-way handshake", "Compare TCP and UDP"] },
        { key: "ports-protocols", title: "Common ports, protocols & DNS", hours: 3, goal: "Recognise common services by port and explain how DNS resolution works.", subtopics: ["Memorise key well-known ports", "Explain IP addressing and subnets", "Trace a DNS lookup step by step", "Explain HTTP, SMTP, SSH and RDP basics"] },
        { key: "packet-analysis", title: "Packet analysis with Wireshark", hours: 4, goal: "Open a pcap, filter it and reconstruct what a host did on the network.", subtopics: ["Capture traffic on a lab interface", "Use display filters effectively", "Follow TCP and HTTP streams", "Spot scans and beaconing in a pcap"], links: [L("Wireshark User's Guide", "https://www.wireshark.org/docs/")] },
        { key: "firewalls-segmentation", title: "Firewalls, NAT & network segmentation", hours: 3, goal: "Design a segmented network with a DMZ and write default-deny firewall rules.", subtopics: ["Compare stateless and stateful firewalls", "Explain NAT and private ranges", "Design VLANs and a DMZ", "Write default-deny allow rules"] },
        { key: "network-attacks", title: "Common network attacks & defences", hours: 2.5, goal: "Explain spoofing, man-in-the-middle and DoS attacks and the controls that stop them.", subtopics: ["Explain ARP spoofing and MITM", "Explain DoS and DDoS", "Explain DNS spoofing and tunnelling", "Match each attack to a defence"] },
      ],
    },
    {
      key: "sec-systems",
      title: "Linux & Windows security basics",
      summary: "Harden the endpoints and read the logs they produce.",
      topics: [
        { key: "linux-permissions", title: "Linux users, permissions & sudo", hours: 3, goal: "Read and set file permissions and audit who can run what with sudo.", subtopics: ["Read rwx permissions and ownership", "Change permissions with chmod and chown", "Explain SUID, SGID and sticky bits", "Audit sudoers rules"] },
        { key: "linux-hardening", title: "Linux hardening & logs", hours: 3, goal: "Harden SSH, disable unused services and find authentication events in Linux logs.", subtopics: ["Harden sshd configuration", "Disable unused services", "Read auth logs and journalctl", "Set up a host firewall"] },
        { key: "windows-accounts", title: "Windows accounts, UAC & Group Policy", hours: 3, goal: "Explain local vs domain accounts, UAC and how Group Policy enforces settings.", subtopics: ["Compare local and domain accounts", "Explain UAC and admin tokens", "Apply a Group Policy setting", "Review local administrators group"] },
        { key: "windows-event-logs", title: "Windows Event Logs & Sysmon", hours: 3, goal: "Find logons, process creation and service installs in Windows logs.", subtopics: ["Navigate Event Viewer channels", "Know key event IDs like 4624 and 4688", "Install Sysmon with a community config", "Query events with PowerShell"] },
        { key: "vuln-patching", title: "Vulnerability scanning & patch management", hours: 3, goal: "Scan lab hosts, prioritise findings by CVSS and exploitability, and track patching.", subtopics: ["Explain CVE, CVSS and KEV", "Run an authenticated scan in a lab", "Prioritise findings by real risk", "Track remediation and rescan"], links: [L("CISA KEV catalog", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog")] },
      ],
    },
    {
      key: "sec-crypto-identity",
      title: "Cryptography, PKI & identity",
      summary: "How data is protected and how users prove who they are.",
      links: [L("OWASP Cheat Sheet Series", "https://cheatsheetseries.owasp.org/")],
      topics: [
        { key: "crypto-basics", title: "Symmetric vs asymmetric encryption", hours: 3, goal: "Choose symmetric or asymmetric encryption for a use case and explain key exchange.", subtopics: ["Explain symmetric ciphers like AES", "Explain public and private key pairs", "Explain hybrid encryption", "Describe Diffie-Hellman key exchange"] },
        { key: "hashing", title: "Hashing, MACs & digital signatures", hours: 2.5, goal: "Use hashes to verify integrity and explain how signatures prove origin.", subtopics: ["Explain one-way hash properties", "Verify a file with SHA-256", "Compare hashes, MACs and signatures", "Explain why MD5 and SHA-1 are retired"] },
        { key: "pki-tls", title: "PKI, certificates & TLS", hours: 3.5, goal: "Read a certificate chain and explain what a TLS handshake establishes.", subtopics: ["Explain CAs and chains of trust", "Inspect a certificate with openssl", "Walk through a TLS 1.3 handshake", "Explain revocation and expiry problems"] },
        { key: "authn-authz", title: "Authentication, authorization & password storage", hours: 2.5, goal: "Separate authentication from authorization and explain safe password storage.", subtopics: ["Separate authentication from authorization", "Explain salted slow password hashing", "Compare bcrypt, scrypt and Argon2", "Explain credential stuffing defences"], links: [L("OWASP Password Storage", "https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html")] },
        { key: "mfa", title: "MFA & phishing-resistant authentication", hours: 2, goal: "Compare MFA factors and explain why FIDO2 passkeys resist phishing.", subtopics: ["Name the three factor categories", "Compare SMS, TOTP, push and FIDO2", "Explain MFA fatigue attacks", "Explain passkeys at a high level"] },
        { key: "oauth-oidc", title: "OAuth 2.0 & OpenID Connect", hours: 3, goal: "Trace the authorization code flow with PKCE and say what each token is for.", subtopics: ["Explain OAuth roles", "Trace the authorization code flow", "Explain PKCE and why it matters", "Compare access, refresh and ID tokens"], links: [L("OAuth 2.0", "https://oauth.net/2/")] },
        { key: "least-privilege", title: "Least privilege, RBAC & privileged access", hours: 2.5, goal: "Design role-based access with least privilege and protect admin accounts.", subtopics: ["Apply least privilege to roles", "Compare RBAC and ABAC", "Separate admin and daily accounts", "Run a periodic access review"] },
      ],
    },
    {
      key: "sec-web",
      title: "Web security from the defender's view",
      summary: "The OWASP Top 10 explained as risks to prevent and detect.",
      links: [L("OWASP Top 10", "https://owasp.org/www-project-top-ten/"), L("PortSwigger Web Security Academy", "https://portswigger.net/web-security")],
      topics: [
        { key: "http-web-basics", title: "HTTP, cookies & sessions", hours: 2.5, goal: "Read HTTP requests and responses and explain how sessions and cookies work.", subtopics: ["Read request methods and status codes", "Explain cookies and their flags", "Explain session management", "Inspect traffic in browser dev tools"] },
        { key: "owasp-top-10", title: "OWASP Top 10 overview", hours: 3, goal: "Name each OWASP Top 10 category and give one prevention for each.", subtopics: ["Read the current Top 10 list", "Summarise each category in a sentence", "Match each category to a defence", "Find each category in web server logs"] },
        { key: "injection-xss", title: "Injection & XSS defences", hours: 3, goal: "Explain why injection and XSS happen and fix them with parameterisation and output encoding.", subtopics: ["Explain untrusted input reaching interpreters", "Fix queries with parameterised statements", "Apply context-aware output encoding", "Add a Content Security Policy"] },
        { key: "access-control-ssrf", title: "Broken access control & SSRF", hours: 2.5, goal: "Spot missing server-side authorization checks and explain SSRF risks in the cloud.", subtopics: ["Explain IDOR with an example", "Enforce authorization on the server", "Explain SSRF and metadata endpoints", "Restrict outbound requests from servers"] },
        { key: "web-defences", title: "Security headers, WAF & secure SDLC", hours: 2.5, goal: "Add browser security headers, explain what a WAF can and cannot do and build security into development.", subtopics: ["Set HSTS, CSP and X-Content-Type-Options", "Explain WAF strengths and limits", "Add dependency scanning to CI", "Describe a secure SDLC"] },
      ],
    },
    {
      key: "sec-threats",
      title: "Malware & the attack lifecycle",
      summary: "How attackers operate, described in frameworks defenders share.",
      links: [L("MITRE ATT&CK", "https://attack.mitre.org/")],
      topics: [
        { key: "malware-types", title: "Malware families & how they spread", hours: 2.5, goal: "Classify malware by behaviour and name the defences for each family.", subtopics: ["Compare viruses, worms and trojans", "Explain ransomware and double extortion", "Explain infostealers and RATs", "Explain fileless and living-off-the-land"] },
        { key: "social-engineering", title: "Phishing & social engineering", hours: 2.5, goal: "Analyse a phishing email's headers and links and recommend controls.", subtopics: ["Recognise phishing red flags", "Read email headers and SPF, DKIM, DMARC", "Safely inspect links and attachments", "Design awareness and reporting"] },
        { key: "kill-chain", title: "The Cyber Kill Chain", hours: 2, goal: "Place each step of an attack on the kill chain and pick where to break it.", subtopics: ["Name the seven kill chain phases", "Map a real attack to phases", "Choose a control per phase"] },
        { key: "mitre-attack", title: "MITRE ATT&CK", hours: 3.5, goal: "Map observed behaviour to ATT&CK tactics and techniques and find coverage gaps.", subtopics: ["Explain tactics, techniques and procedures", "Look up a technique and its detections", "Map an incident report to ATT&CK", "Build a coverage layer in Navigator"], links: [L("ATT&CK Navigator", "https://mitre-attack.github.io/attack-navigator/")] },
        { key: "threat-intel", title: "Threat intelligence & IOCs", hours: 2.5, goal: "Use indicators of compromise and threat reports to hunt and enrich alerts.", subtopics: ["Compare IOCs and TTPs", "Explain the Pyramid of Pain", "Enrich an IP or hash with intel", "Read a public threat advisory"] },
      ],
    },
    {
      key: "sec-detection",
      title: "Logging, SIEM & detection",
      summary: "Turn raw logs into alerts an analyst can act on.",
      links: [L("Sigma rules", "https://github.com/SigmaHQ/sigma")],
      topics: [
        { key: "log-sources", title: "Log sources & what to collect", hours: 2.5, goal: "Choose the endpoint, network, identity and cloud logs that matter most.", subtopics: ["List high-value log sources", "Explain log forwarding and agents", "Normalise timestamps to UTC", "Plan retention and storage"] },
        { key: "siem-basics", title: "SIEM fundamentals: ingest, parse, search", hours: 4, goal: "Ingest logs into a SIEM and write searches that answer investigation questions.", subtopics: ["Explain SIEM architecture", "Ingest and parse a log source", "Write searches with filters and stats", "Build a simple dashboard"] },
        { key: "detection-rules", title: "Writing detection rules with Sigma", hours: 3.5, goal: "Write a Sigma rule for a technique, convert it to your SIEM and test it.", subtopics: ["Read the Sigma rule format", "Write a rule for one technique", "Convert it for your SIEM", "Test with benign and malicious samples"] },
        { key: "alert-triage", title: "Alert triage & false positives", hours: 3, goal: "Triage an alert to true positive, false positive or benign and document why.", subtopics: ["Follow a triage checklist", "Gather context on user and host", "Decide and escalate or close", "Tune noisy rules safely"] },
        { key: "ids-edr", title: "IDS, EDR & network monitoring", hours: 3, goal: "Explain what IDS and EDR detect and read a Suricata or EDR alert.", subtopics: ["Compare IDS, IPS and EDR", "Read a Suricata alert", "Explain NetFlow and Zeek logs", "Explain EDR telemetry and response"] },
      ],
    },
    {
      key: "sec-incident-response",
      title: "Incident response",
      summary: "A calm, repeatable process for when things go wrong.",
      links: [L("NIST Cybersecurity Framework", "https://www.nist.gov/cyberframework"), L("CISA incident response", "https://www.cisa.gov/")],
      topics: [
        { key: "ir-lifecycle", title: "The incident response lifecycle", hours: 2.5, goal: "Walk an incident through preparation, detection, containment, recovery and lessons learned.", subtopics: ["Describe each NIST IR phase", "Define incident severity levels", "Build a basic IR plan outline", "Assign roles in an IR team"] },
        { key: "triage-containment", title: "Scoping, containment & eradication", hours: 3, goal: "Scope an incident and choose containment that stops harm without destroying evidence.", subtopics: ["Scope affected hosts and accounts", "Compare short and long-term containment", "Remove persistence and reset credentials", "Verify eradication before recovery"] },
        { key: "forensics-basics", title: "Evidence handling & forensics basics", hours: 3, goal: "Collect evidence in order of volatility and keep a chain of custody.", subtopics: ["Explain order of volatility", "Keep a chain of custody record", "Hash evidence for integrity", "Build a timeline from artefacts"] },
        { key: "playbooks-lessons", title: "Playbooks, communication & lessons learned", hours: 2, goal: "Write a playbook for a common incident and run a blameless post-incident review.", subtopics: ["Write a phishing response playbook", "Plan internal and external communication", "Run a blameless lessons-learned review"] },
      ],
    },
    {
      key: "sec-cloud-grc",
      title: "Cloud security & governance",
      summary: "Secure cloud accounts and connect security work to risk and compliance.",
      links: [L("NIST Cybersecurity Framework", "https://www.nist.gov/cyberframework")],
      topics: [
        { key: "shared-responsibility", title: "Shared responsibility & cloud IAM", hours: 3, goal: "Say which security tasks belong to you vs the provider and lock down cloud identities.", subtopics: ["Explain the shared responsibility model", "Compare IaaS, PaaS and SaaS duties", "Secure the root or owner account", "Use roles instead of long-lived keys"] },
        { key: "cloud-misconfig", title: "Cloud misconfigurations & logging", hours: 3, goal: "Find public storage, open security groups and missing audit logs in a cloud account.", subtopics: ["Find public buckets and open ports", "Enable audit logging like CloudTrail", "Use a posture management checker", "Alert on risky configuration changes"] },
        { key: "frameworks", title: "NIST CSF, ISO 27001 & CIS Controls", hours: 2.5, goal: "Explain what each framework is for and map a control to NIST CSF functions.", subtopics: ["Name the NIST CSF 2.0 functions", "Explain ISO 27001 and certification", "Explain the CIS Critical Security Controls", "Map one control across frameworks"] },
        { key: "risk-compliance", title: "Risk management, policies & compliance", hours: 2.5, goal: "Maintain a simple risk register and explain how policies, standards and audits fit together.", subtopics: ["Build a simple risk register", "Compare policy, standard and procedure", "Explain GDPR, PCI DSS and SOC 2", "Explain audits and evidence collection"] },
      ],
    },
    {
      key: "sec-capstone",
      title: "Capstone: home SOC lab",
      summary: "Build, attack and defend your own lab, then document it like a SOC analyst.",
      links: [L("TryHackMe", "https://tryhackme.com/"), L("MITRE ATT&CK", "https://attack.mitre.org/")],
      topics: [
        { key: "lab-build", title: "Build a home SOC lab", hours: 5, goal: "Run an isolated lab with a Windows host, a Linux host and a SIEM collecting their logs.", subtopics: ["Create an isolated virtual network", "Deploy Windows and Linux VMs", "Install a SIEM like Wazuh or Elastic", "Forward Sysmon and auth logs"] },
        { key: "attack-simulation", title: "Simulate attacks in the lab", hours: 4, goal: "Generate realistic attack telemetry in your own lab with safe emulation tools.", subtopics: ["Snapshot VMs before testing", "Run Atomic Red Team tests in lab", "Record which ATT&CK techniques ran", "Check which ones raised alerts"] },
        { key: "detect-investigate", title: "Detect, investigate & write an incident report", hours: 5, goal: "Detect the simulated activity, investigate it end to end and write an incident report.", subtopics: ["Write detections for missed techniques", "Triage and investigate each alert", "Build a timeline of events", "Write an executive and technical report"] },
        { key: "practice-portfolio", title: "Practice rooms & portfolio", hours: 3, goal: "Practise on guided blue-team labs and publish your lab write-ups as a portfolio.", subtopics: ["Complete a SOC learning path", "Solve a blue-team investigation challenge", "Publish lab write-ups and diagrams", "Plan your next certification"] },
      ],
    },
  ],
};

export default path;
