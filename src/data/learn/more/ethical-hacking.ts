import type { LearningPath } from "../types";

const L = (label: string, url: string) => ({ label, url });

const path: LearningPath = {
  slug: "ethical-hacking",
  title: "Ethical Hacking & Penetration Testing",
  tagline: "Find weaknesses legally, in your lab, and help fix them.",
  description:
    "Learn how professional penetration testers work, strictly within the law and with written authorization. You build an isolated lab first, then practise recon, scanning, web testing, and reporting against deliberately vulnerable machines you own, always pairing each finding with its remediation.",
  level: "Intermediate",
  category: "Security",
  icon: "bug",
  outcomes: [
    "Explain the legal and ethical rules of testing and write a scope and rules of engagement",
    "Build an isolated practice lab with Kali and deliberately vulnerable targets",
    "Enumerate lab networks and web apps with nmap and Burp Suite",
    "Explain common vulnerability classes and recommend concrete fixes for each",
    "Walk a lab machine through an attack path and document each step",
    "Write a professional penetration test report with risk ratings and remediation",
  ],
  tools: ["Kali Linux", "VirtualBox", "nmap", "Burp Suite Community", "Metasploit Framework", "Gobuster", "Wireshark", "Hashcat", "John the Ripper", "BloodHound", "OWASP Juice Shop", "DVWA"],
  modules: [
    {
      key: "eh-foundations",
      title: "Ethics, law & lab setup",
      summary: "Permission first, then a safe place to practise.",
      links: [L("Kali Linux docs", "https://www.kali.org/docs/"), L("TryHackMe", "https://tryhackme.com/"), L("Hack The Box", "https://www.hackthebox.com/")],
      topics: [
        { key: "ethics-law", title: "Ethics, law & responsible disclosure", hours: 2.5, goal: "Explain why testing without written permission is illegal and how responsible disclosure works.", subtopics: ["Read your country's computer misuse law", "Explain authorization and its limits", "Compare pentests, bug bounties and crime", "Follow a responsible disclosure process"] },
        { key: "scope-roe", title: "Scope, authorization & rules of engagement", hours: 2.5, goal: "Write a scope and rules of engagement that a client could sign.", subtopics: ["Define in-scope and out-of-scope assets", "Set testing windows and contacts", "List forbidden techniques like DoS", "Get signed written authorization"] },
        { key: "pentest-methodology", title: "Pentest phases & methodologies", hours: 2, goal: "Describe the phases of a pentest and the standards that structure them.", subtopics: ["Name the pentest phases", "Compare black, grey and white box", "Skim PTES and the OWASP WSTG", "Keep notes and evidence from day one"] },
        { key: "lab-setup", title: "Build an isolated lab", hours: 6, goal: "Run Kali and vulnerable VMs on a host-only network that cannot reach real systems.", subtopics: ["Install a hypervisor like VirtualBox", "Install Kali Linux as a VM", "Create a host-only lab network", "Add deliberately vulnerable practice VMs", "Take snapshots before every exercise"], links: [L("Kali Linux docs", "https://www.kali.org/docs/")] },
        { key: "practice-platforms", title: "Practice platforms: TryHackMe, HTB, Juice Shop, DVWA", hours: 3, goal: "Practise legally on hosted labs and local vulnerable apps you are allowed to test.", subtopics: ["Connect to TryHackMe or HTB VPN", "Run OWASP Juice Shop locally", "Run DVWA in a container", "Read each platform's rules"], links: [L("OWASP Juice Shop", "https://owasp.org/www-project-juice-shop/")] },
      ],
    },
    {
      key: "eh-recon",
      title: "Reconnaissance & OSINT",
      summary: "Learn about an in-scope target before testing it.",
      topics: [
        { key: "passive-recon", title: "Passive recon & OSINT", hours: 4, goal: "Collect public information about an authorized target without sending it traffic.", subtopics: ["Explain passive vs active recon", "Query WHOIS and public records", "Use search engine operators", "Record sources in your notes"] },
        { key: "dns-enum", title: "DNS & subdomain discovery", hours: 3, goal: "Map an in-scope domain's hosts using DNS data in your authorized scope.", subtopics: ["Explain DNS record types", "Enumerate subdomains of a scope", "Resolve hosts to addresses", "Keep results inside the agreed scope"] },
        { key: "footprinting", title: "Footprinting an authorized target", hours: 2.5, goal: "Build a picture of an authorized target's technology and exposure.", subtopics: ["Identify technologies in use", "Note exposed services from public data", "Map the attack surface", "Summarise findings for the client"] },
      ],
    },
    {
      key: "eh-scanning",
      title: "Scanning & enumeration",
      summary: "Map lab hosts and services with nmap.",
      links: [L("Nmap Reference Guide", "https://nmap.org/book/man.html")],
      topics: [
        { key: "host-discovery", title: "Host discovery & port scanning", hours: 6, goal: "Find live lab hosts and their open ports with nmap, staying inside scope.", subtopics: ["Run host discovery on a lab subnet", "Choose TCP scan types", "Scan and interpret port states", "Save output for the report"], links: [L("Nmap book", "https://nmap.org/book/")] },
        { key: "service-enum", title: "Service & version enumeration", hours: 5, goal: "Identify service versions and configurations on lab hosts with nmap scripts.", subtopics: ["Run version detection", "Use safe NSE scripts", "Enumerate common services", "Note findings and their evidence"] },
        { key: "vuln-mapping", title: "Mapping findings to known vulnerabilities", hours: 4, goal: "Match enumerated versions to known issues and rate them by CVSS.", subtopics: ["Look up CVEs for a version", "Read CVSS vectors", "Confirm relevance in the lab", "Prioritise by real risk"] },
      ],
    },
    {
      key: "eh-web",
      title: "Web application testing",
      summary: "Test deliberately vulnerable web apps with Burp Suite.",
      links: [L("PortSwigger Web Security Academy", "https://portswigger.net/web-security"), L("OWASP Top 10", "https://owasp.org/www-project-top-ten/")],
      topics: [
        { key: "burp-workflow", title: "Burp Suite workflow", hours: 6, goal: "Proxy, inspect and replay requests to a lab app with Burp Suite.", subtopics: ["Configure the Burp proxy", "Intercept and edit a request", "Use Repeater to test changes", "Map the app in the site tree"], links: [L("PortSwigger Web Security Academy", "https://portswigger.net/web-security")] },
        { key: "authn-testing", title: "Testing authentication & sessions", hours: 5, goal: "Find weak authentication and session handling in a lab app and recommend fixes.", subtopics: ["Test login and lockout behaviour", "Inspect session cookies and flags", "Check logout and timeout", "Recommend hardening for each issue"] },
        { key: "injection-xss-lab", title: "Injection & XSS in the lab", hours: 6, goal: "Demonstrate injection and XSS on a lab app and explain the server-side fix.", subtopics: ["Find input that reaches an interpreter", "Confirm the issue in Juice Shop or DVWA", "Explain parameterisation as the fix", "Explain output encoding and CSP"], links: [L("OWASP Top 10", "https://owasp.org/www-project-top-ten/")] },
        { key: "access-control-lab", title: "Access control & business logic flaws", hours: 5, goal: "Find missing authorization and logic flaws in a lab app and propose server-side checks.", subtopics: ["Test for IDOR on lab objects", "Try forced browsing to hidden pages", "Probe business logic assumptions", "Recommend server-side authorization"] },
      ],
    },
    {
      key: "eh-vuln-classes",
      title: "Common vulnerability classes",
      summary: "Understand the bug categories conceptually, with their fixes.",
      links: [L("OWASP", "https://owasp.org/")],
      topics: [
        { key: "memory-safety", title: "Memory safety issues (concepts)", hours: 2.5, goal: "Explain at a high level how memory safety bugs arise and how modern mitigations help.", subtopics: ["Explain buffer overflow concepts", "Explain use-after-free at a high level", "Describe ASLR, DEP and stack canaries", "Explain memory-safe languages as prevention"] },
        { key: "injection-concepts", title: "Injection vulnerabilities (concepts)", hours: 2.5, goal: "Explain why injection happens across SQL, command and template contexts and how to prevent it.", subtopics: ["Explain untrusted data meeting an interpreter", "Compare SQL, command and template injection", "Explain parameterisation and allowlists", "Explain least-privilege service accounts"] },
        { key: "misconfig-concepts", title: "Misconfiguration & default credentials", hours: 2, goal: "Explain how insecure defaults and exposed services lead to compromise and how to harden them.", subtopics: ["Explain risky default settings", "Explain exposed admin interfaces", "Explain default and reused credentials", "Recommend secure baselines"] },
        { key: "crypto-failures", title: "Cryptographic failures (concepts)", hours: 2, goal: "Explain how weak or misused cryptography exposes data and how to use it correctly.", subtopics: ["Explain weak algorithms and keys", "Explain transport without TLS", "Explain secrets in source code", "Recommend vetted libraries and TLS"] },
      ],
    },
    {
      key: "eh-exploitation",
      title: "Exploitation in the lab",
      summary: "Use Metasploit against your own vulnerable machines to understand impact.",
      links: [L("Metasploit docs", "https://docs.metasploit.com/")],
      topics: [
        { key: "metasploit-basics", title: "Metasploit concepts & lab use", hours: 6, goal: "Use the Metasploit Framework against a vulnerable lab VM to demonstrate impact safely.", subtopics: ["Explain modules, payloads and sessions", "Search for a module for a lab issue", "Configure and run it against a lab VM", "Record evidence and clean up"], links: [L("Metasploit docs", "https://docs.metasploit.com/")] },
        { key: "proof-of-impact", title: "Demonstrating impact responsibly", hours: 2.5, goal: "Capture just enough proof of a finding without causing damage or touching real data.", subtopics: ["Define minimal proof of access", "Avoid destructive actions", "Protect any sensitive data seen", "Document steps for reproduction"] },
        { key: "remediation-mapping", title: "From finding to remediation", hours: 4, goal: "Turn each lab finding into a concrete, prioritised fix for the owner.", subtopics: ["Describe the root cause", "Recommend a specific fix", "Rate severity and effort", "Suggest a detection for the issue"] },
      ],
    },
    {
      key: "eh-postexploit",
      title: "Privilege escalation & post-exploitation (concepts)",
      summary: "How attackers go deeper, explained so defenders can stop it.",
      topics: [
        { key: "linux-privesc", title: "Linux privilege escalation concepts", hours: 4, goal: "Explain common Linux privilege escalation paths and the configuration that prevents them.", subtopics: ["Explain misconfigured sudo and SUID", "Explain weak file permissions", "Explain vulnerable services and cron", "Recommend hardening for each"] },
        { key: "windows-privesc", title: "Windows privilege escalation concepts", hours: 4, goal: "Explain common Windows privilege escalation paths and their mitigations.", subtopics: ["Explain unquoted service paths", "Explain token and privilege abuse", "Explain weak service permissions", "Recommend hardening for each"] },
        { key: "password-attacks", title: "Password attacks against lab hashes", hours: 4, goal: "Crack hashes you generated in your lab with Hashcat or John and explain stronger storage.", subtopics: ["Generate test hashes in the lab", "Run a dictionary attack with Hashcat", "Compare fast and slow hash formats", "Recommend salted Argon2 and MFA"] },
        { key: "lateral-persistence", title: "Lateral movement & persistence concepts", hours: 2.5, goal: "Explain how attackers move sideways and persist, and which telemetry catches it.", subtopics: ["Explain credential reuse and pivoting", "Explain common persistence mechanisms", "Map behaviour to MITRE ATT&CK", "Name detections for each"] },
      ],
    },
    {
      key: "eh-wireless-ad",
      title: "Wireless & Active Directory basics",
      summary: "Conceptual tours of two big attack surfaces.",
      topics: [
        { key: "wireless-concepts", title: "Wireless security concepts", hours: 2.5, goal: "Explain how Wi-Fi authentication works and the weaknesses defenders must close.", subtopics: ["Compare WPA2 and WPA3", "Explain the handshake at a high level", "Explain rogue access points", "Recommend strong Wi-Fi configuration"] },
        { key: "ad-concepts", title: "Active Directory attack surface", hours: 5, goal: "Explain how AD authentication works and the common weaknesses defenders harden.", subtopics: ["Explain Kerberos and NTLM at a high level", "Explain common AD misconfigurations", "Explore relationships with BloodHound", "Recommend tiering and hardening"] },
      ],
    },
    {
      key: "eh-capstone",
      title: "Capstone: lab pentest & report",
      summary: "Run a full engagement against your own lab and write it up professionally.",
      links: [L("OWASP", "https://owasp.org/"), L("PortSwigger Web Security Academy", "https://portswigger.net/web-security")],
      topics: [
        { key: "engagement-plan", title: "Plan the engagement", hours: 2.5, goal: "Write the scope, rules of engagement and test plan for your own lab environment.", subtopics: ["Define the lab scope and goals", "Write rules of engagement", "Plan the phases and timeline", "Set up note-taking and evidence"] },
        { key: "run-pentest", title: "Run the lab pentest", hours: 9, goal: "Work a vulnerable lab machine through recon, enumeration and validated findings.", subtopics: ["Recon and enumerate the lab targets", "Validate each finding with evidence", "Capture minimal proof of impact", "Track findings in your notes"] },
        { key: "write-report", title: "Write the professional report", hours: 7, goal: "Produce a report with an executive summary, ranked findings and remediation.", subtopics: ["Write an executive summary", "Describe each finding and risk rating", "Give concrete remediation steps", "Add reproduction and evidence appendices"] },
        { key: "debrief-next", title: "Debrief & next steps", hours: 2, goal: "Present findings as you would to a client and plan continued, legal practice.", subtopics: ["Walk through findings and priorities", "Explain remediation to non-experts", "Plan a retest of fixed issues", "Choose your next certification path"] },
      ],
    },
  ],
};

export default path;
