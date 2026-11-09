import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Ethics, law & lab setup ─────────────
  "eh-foundations/ethics-law": {
    summary:
      "Testing someone else's systems without written permission is a crime in most countries, regardless of intent. Ethical hacking is defined by authorization: a signed agreement makes the same actions legal. Responsible disclosure governs how found issues are reported.",
    analogy: "Like a locksmith hired to test a lock: the contract is what separates a professional from a burglar.",
    visuals: [
      {
        type: "compare",
        title: "Authorized vs unauthorized",
        columns: [
          { title: "Authorized test", points: ["Written permission", "Agreed scope", "Legal", "Findings reported to owner"] },
          { title: "Unauthorized access", points: ["No permission", "No scope", "A crime", "Causes harm"] },
        ],
      },
    ],
    keyPoints: [
      "Authorization, in writing, is what makes testing legal.",
      "Good intent does not make unauthorized access lawful.",
      "Responsible disclosure gives owners time to fix issues.",
      "Bug bounty programs grant permission within set rules.",
    ],
    terms: [
      { term: "Authorization", meaning: "Written permission to test defined systems." },
      { term: "Scope", meaning: "The systems you are allowed to test." },
      { term: "Responsible disclosure", meaning: "Reporting a flaw privately before public release." },
      { term: "Bug bounty", meaning: "Program paying for authorized vulnerability reports." },
    ],
    pitfalls: [
      "Assuming a verbal okay is enough; get it in writing.",
      "Testing a system that is in use but outside the agreed scope.",
    ],
    check: [
      { q: "What single thing separates ethical hacking from a crime?", a: "Written authorization to test the defined systems." },
      { q: "What is responsible disclosure?", a: "Reporting a vulnerability privately to the owner and giving time to fix before any public release." },
    ],
  },

  "eh-foundations/scope-roe": {
    summary:
      "The scope lists exactly which systems may be tested, and the rules of engagement set the conditions: when, how, and what is forbidden. A clear, signed document protects both tester and client and prevents accidental harm.",
    visuals: [
      {
        type: "tree",
        title: "Rules of engagement",
        root: "Engagement",
        children: [
          { label: "Scope", children: ["In-scope assets", "Out-of-scope assets"] },
          { label: "Timing", children: ["Test windows", "Blackout periods"] },
          { label: "Limits", children: ["No DoS", "No real data"] },
          { label: "Contacts", children: ["Emergency contact", "Escalation"] },
        ],
      },
    ],
    keyPoints: [
      "Scope names in-scope and explicitly out-of-scope assets.",
      "Rules of engagement set timing and forbidden techniques.",
      "An emergency contact lets testing stop quickly if needed.",
      "Both parties sign before any testing begins.",
    ],
    terms: [
      { term: "Scope", meaning: "Systems authorised for testing." },
      { term: "Rules of engagement", meaning: "Conditions and limits on the test." },
      { term: "Blackout period", meaning: "Time when no testing is allowed." },
      { term: "Authorization letter", meaning: "Signed proof of permission to test." },
    ],
    check: [
      { q: "Why define out-of-scope assets explicitly?", a: "To make clear what must not be touched and avoid accidental harm or liability." },
      { q: "What should happen before any testing starts?", a: "Both parties sign the scope and rules of engagement." },
    ],
  },

  "eh-foundations/pentest-methodology": {
    summary:
      "A penetration test follows recognised phases so nothing is missed and work is repeatable. Standards like PTES and the OWASP Web Security Testing Guide give structure, and the test type (black, grey or white box) sets how much the tester knows upfront.",
    visuals: [
      {
        type: "flow",
        title: "Pentest phases",
        steps: [
          { label: "Planning", detail: "Scope and rules of engagement." },
          { label: "Recon", detail: "Gather information." },
          { label: "Scanning", detail: "Enumerate services." },
          { label: "Testing", detail: "Validate findings in lab." },
          { label: "Reporting", detail: "Document and remediate." },
        ],
      },
    ],
    keyPoints: [
      "Phases make a test thorough and repeatable.",
      "Black box knows nothing, white box knows everything.",
      "PTES and OWASP WSTG give recognised structure.",
      "Keep notes and evidence from the first phase.",
    ],
    terms: [
      { term: "PTES", meaning: "Penetration Testing Execution Standard." },
      { term: "WSTG", meaning: "OWASP Web Security Testing Guide." },
      { term: "Black box", meaning: "Testing with no prior knowledge." },
      { term: "White box", meaning: "Testing with full knowledge and access." },
    ],
    check: [
      { q: "What does a grey-box test assume?", a: "Partial knowledge, such as a normal user account." },
      { q: "Why follow a standard like PTES?", a: "It ensures the test is structured, thorough and repeatable." },
    ],
  },

  "eh-foundations/lab-setup": {
    summary:
      "Practising safely means an isolated lab that cannot reach real systems. A hypervisor runs Kali alongside deliberately vulnerable VMs on a host-only network, and snapshots let you reset instantly after each exercise.",
    visuals: [
      {
        type: "layers",
        title: "Lab components",
        layers: [
          { label: "Hypervisor", detail: "VirtualBox or similar." },
          { label: "Host-only network", detail: "Isolated, no internet." },
          { label: "Kali VM", detail: "Your testing workstation." },
          { label: "Target VMs", detail: "Deliberately vulnerable machines." },
        ],
      },
    ],
    keyPoints: [
      "Use a host-only network so the lab cannot reach real systems.",
      "Kali provides a ready set of testing tools.",
      "Use intentionally vulnerable VMs built for practice.",
      "Snapshot before each exercise to reset cleanly.",
    ],
    terms: [
      { term: "Hypervisor", meaning: "Software that runs virtual machines." },
      { term: "Host-only network", meaning: "Isolated virtual network with no internet." },
      { term: "Kali Linux", meaning: "Distribution bundling security tools." },
      { term: "Snapshot", meaning: "Saved VM state you can revert to." },
    ],
    pitfalls: [
      "Bridging the lab to your real network by accident.",
      "Forgetting to snapshot before a destructive exercise.",
    ],
    check: [
      { q: "Why use a host-only network for the lab?", a: "So testing activity stays isolated and cannot reach real systems." },
      { q: "What is the benefit of snapshots?", a: "You can reset a VM to a clean state after each exercise." },
    ],
  },

  "eh-foundations/practice-platforms": {
    summary:
      "Hosted platforms like TryHackMe and Hack The Box provide legal targets over a VPN, and local apps like OWASP Juice Shop and DVWA run deliberately vulnerable web apps on your own machine. Each has rules you must read and follow.",
    visuals: [
      {
        type: "compare",
        title: "Practice options",
        columns: [
          { title: "Hosted (THM/HTB)", points: ["Connect over VPN", "Maintained targets", "Guided and free rooms", "Follow platform rules"] },
          { title: "Local (Juice Shop/DVWA)", points: ["Run on your machine", "Full control", "Great for web practice", "No internet needed"] },
        ],
      },
    ],
    keyPoints: [
      "Hosted platforms give legal targets over a VPN.",
      "Juice Shop and DVWA run locally for web practice.",
      "Only test the targets each platform provides.",
      "Read and follow every platform's rules.",
    ],
    terms: [
      { term: "TryHackMe", meaning: "Guided hands-on security learning platform." },
      { term: "Hack The Box", meaning: "Platform of challenge machines to practise on." },
      { term: "Juice Shop", meaning: "OWASP deliberately insecure web app." },
      { term: "DVWA", meaning: "Damn Vulnerable Web Application for practice." },
    ],
    check: [
      { q: "Where may you practise legally?", a: "On targets the platform provides or on your own deliberately vulnerable VMs." },
      { q: "What runs locally rather than over a VPN?", a: "Apps like OWASP Juice Shop and DVWA." },
    ],
  },

  // ───────────── Reconnaissance & OSINT ─────────────
  "eh-recon/passive-recon": {
    summary:
      "Passive reconnaissance gathers information about an authorized target from public sources without sending it any traffic. It builds a picture from WHOIS records, public documents and search engines, leaving no trace on the target.",
    visuals: [
      {
        type: "compare",
        title: "Passive vs active recon",
        columns: [
          { title: "Passive", points: ["No traffic to target", "Public sources only", "Leaves no trace", "WHOIS, search engines"] },
          { title: "Active", points: ["Sends traffic", "Scans and probes", "Can be detected", "Needs clear scope"] },
        ],
      },
    ],
    keyPoints: [
      "Passive recon never touches the target directly.",
      "Public records and search engines reveal a lot.",
      "It leaves no trace in the target's logs.",
      "Record every source in your notes for the report.",
    ],
    terms: [
      { term: "OSINT", meaning: "Open-source intelligence from public data." },
      { term: "Passive recon", meaning: "Information gathering without touching the target." },
      { term: "WHOIS", meaning: "Registration data for domains and IP ranges." },
      { term: "Dork", meaning: "A focused search engine query." },
    ],
    check: [
      { q: "What distinguishes passive from active recon?", a: "Passive recon does not send any traffic to the target." },
      { q: "Why record your sources?", a: "So findings in the report are traceable and verifiable." },
    ],
  },

  "eh-recon/dns-enum": {
    summary:
      "DNS enumeration maps an in-scope domain's hosts by querying its records and discovering subdomains. Within the agreed scope it reveals servers and services worth examining later, and it is a staple of the recon phase.",
    visuals: [
      {
        type: "tree",
        title: "DNS records",
        root: "example.com",
        children: [
          { label: "A / AAAA", children: ["Host addresses"] },
          { label: "MX", children: ["Mail servers"] },
          { label: "NS", children: ["Name servers"] },
          { label: "TXT", children: ["SPF, verification"] },
        ],
      },
    ],
    keyPoints: [
      "DNS records reveal hosts, mail and name servers.",
      "Subdomain discovery expands the known attack surface.",
      "Stay strictly within the authorized scope.",
      "Resolve discovered names to addresses for later phases.",
    ],
    terms: [
      { term: "A record", meaning: "Maps a name to an IPv4 address." },
      { term: "MX record", meaning: "Names mail servers for a domain." },
      { term: "Subdomain", meaning: "A host under a parent domain." },
      { term: "Zone", meaning: "A portion of the DNS namespace for a domain." },
    ],
    check: [
      { q: "What does an MX record identify?", a: "The mail servers for a domain." },
      { q: "Why keep DNS enumeration within scope?", a: "Discovering hosts you are not authorised to test could lead to unauthorised access." },
    ],
  },

  "eh-recon/footprinting": {
    summary:
      "Footprinting assembles recon findings into a clear picture of an authorized target's technology and exposure. Identifying frameworks, exposed services and the overall attack surface tells you where to focus the later, active phases.",
    visuals: [
      {
        type: "flow",
        title: "Footprinting",
        steps: [
          { label: "Collect", detail: "Gather recon data." },
          { label: "Identify tech", detail: "Frameworks and versions." },
          { label: "Map surface", detail: "Exposed hosts and services." },
          { label: "Summarise", detail: "Brief the client." },
        ],
      },
    ],
    keyPoints: [
      "Footprinting turns scattered recon into a clear picture.",
      "Identifying technology narrows where to look next.",
      "The attack surface is everything exposed to test.",
      "Summarise exposure clearly for the client.",
    ],
    terms: [
      { term: "Footprinting", meaning: "Building a profile of a target's exposure." },
      { term: "Attack surface", meaning: "All exposed, testable points." },
      { term: "Technology fingerprint", meaning: "Identifying the software a target runs." },
      { term: "Exposure", meaning: "What of the target is reachable publicly." },
    ],
    check: [
      { q: "What is the attack surface?", a: "The sum of a target's exposed, testable points." },
      { q: "Why identify the target's technology early?", a: "It focuses later testing on the relevant weaknesses." },
    ],
  },

  // ───────────── Scanning & enumeration ─────────────
  "eh-scanning/host-discovery": {
    summary:
      "Scanning begins by finding which lab hosts are live, then which ports are open. nmap is the standard tool: host discovery identifies responsive machines, and port scanning reveals the services to examine, all kept inside the authorized scope.",
    visuals: [
      {
        type: "flow",
        title: "Scanning with nmap",
        steps: [
          { label: "Discover hosts", detail: "Find live machines in scope." },
          { label: "Scan ports", detail: "Find open TCP ports." },
          { label: "Read states", detail: "Open, closed, filtered." },
          { label: "Save output", detail: "Keep evidence for the report." },
        ],
      },
    ],
    keyPoints: [
      "Host discovery finds which lab machines respond.",
      "Port scanning reveals open services to examine.",
      "Ports are open, closed or filtered.",
      "Save scan output as evidence for the report.",
    ],
    terms: [
      { term: "nmap", meaning: "The standard network scanning tool." },
      { term: "Host discovery", meaning: "Finding which hosts are live." },
      { term: "Port state", meaning: "Whether a port is open, closed or filtered." },
      { term: "SYN scan", meaning: "Fast TCP scan that does not fully connect." },
    ],
    example: {
      lang: "bash",
      code: "# Against a host you own in the lab (e.g. 192.168.56.10)\nnmap -sn 192.168.56.0/24          # host discovery\nnmap -sS -p- 192.168.56.10        # all TCP ports\nnmap -oN scan.txt 192.168.56.10   # save output as evidence",
      caption: "All commands target an isolated lab host inside the agreed scope.",
    },
    check: [
      { q: "What are the three common nmap port states?", a: "Open, closed and filtered." },
      { q: "Why save nmap output?", a: "It is evidence for the report and a record of what was tested." },
    ],
  },

  "eh-scanning/service-enum": {
    summary:
      "Once ports are known, enumeration identifies the exact service and version behind each one. nmap's version detection and safe NSE scripts gather this detail on lab hosts, which later maps to known vulnerabilities.",
    visuals: [
      {
        type: "flow",
        title: "Service enumeration",
        steps: [
          { label: "Version detect", detail: "Identify service and version." },
          { label: "Run NSE", detail: "Use safe info scripts." },
          { label: "Enumerate", detail: "Gather service details." },
          { label: "Record", detail: "Note findings and evidence." },
        ],
      },
    ],
    keyPoints: [
      "Version detection names the service behind a port.",
      "NSE scripts gather extra detail safely.",
      "Accurate versions enable vulnerability mapping.",
      "Document each finding with its evidence.",
    ],
    terms: [
      { term: "Version detection", meaning: "nmap identifying service versions." },
      { term: "NSE", meaning: "nmap Scripting Engine for extra checks." },
      { term: "Banner", meaning: "Text a service returns identifying itself." },
      { term: "Enumeration", meaning: "Extracting detailed information from a service." },
    ],
    example: {
      lang: "bash",
      code: "# Against a lab host you are authorised to test\nnmap -sV 192.168.56.10            # service and version\nnmap -sV --script=default 192.168.56.10   # safe NSE scripts",
      caption: "Run only against lab hosts in scope.",
    },
    check: [
      { q: "What does nmap version detection add over a plain port scan?", a: "It names the service and version behind each open port." },
      { q: "Why do accurate versions matter?", a: "They let you map the service to known vulnerabilities." },
    ],
  },

  "eh-scanning/vuln-mapping": {
    summary:
      "With services and versions enumerated, you match them to publicly known vulnerabilities and rate each by CVSS. In the lab you confirm relevance rather than assume it, then prioritise by realistic risk for the report.",
    visuals: [
      {
        type: "flow",
        title: "Mapping to vulnerabilities",
        steps: [
          { label: "Look up", detail: "Find CVEs for the version." },
          { label: "Read CVSS", detail: "Understand severity." },
          { label: "Confirm", detail: "Verify relevance in the lab." },
          { label: "Prioritise", detail: "Rank by real risk." },
        ],
      },
    ],
    keyPoints: [
      "Map enumerated versions to known CVEs.",
      "CVSS gives a severity baseline.",
      "Confirm relevance instead of assuming it.",
      "Prioritise by realistic risk, not raw score.",
    ],
    terms: [
      { term: "CVE", meaning: "Identifier for a specific vulnerability." },
      { term: "CVSS", meaning: "Severity score from 0 to 10." },
      { term: "Vulnerability database", meaning: "Catalogue of known flaws by product." },
      { term: "False positive", meaning: "A reported issue that is not actually present." },
    ],
    check: [
      { q: "Why confirm a mapped vulnerability in the lab?", a: "A version match does not guarantee the flaw is exploitable in context." },
      { q: "What does CVSS provide?", a: "A standard severity score to help prioritise." },
    ],
  },

  // ───────────── Web application testing ─────────────
  "eh-web/burp-workflow": {
    summary:
      "Burp Suite sits between your browser and a lab web app as an intercepting proxy, letting you inspect, modify and replay requests. Mapping the app, intercepting a request and using Repeater to test changes is the core manual web testing workflow.",
    visuals: [
      {
        type: "sequence",
        title: "Burp as a proxy",
        actors: ["Browser", "Burp", "Lab app"],
        messages: [
          { from: 0, to: 1, label: "Request" },
          { from: 1, to: 0, label: "Intercepted for review" },
          { from: 1, to: 2, label: "Forwarded (maybe edited)" },
          { from: 2, to: 1, label: "Response" },
          { from: 1, to: 0, label: "Shown to tester" },
        ],
      },
    ],
    keyPoints: [
      "Burp is an intercepting proxy between browser and app.",
      "Intercept lets you view and edit requests.",
      "Repeater resends a request with tweaks.",
      "The site map records the app's structure.",
    ],
    terms: [
      { term: "Intercepting proxy", meaning: "Tool that pauses and shows requests." },
      { term: "Repeater", meaning: "Burp tool to resend and tweak a request." },
      { term: "Site map", meaning: "Burp's tree of discovered app content." },
      { term: "Scope", meaning: "Burp setting limiting activity to in-scope hosts." },
    ],
    check: [
      { q: "What role does Burp play between browser and app?", a: "An intercepting proxy that lets you inspect and modify traffic." },
      { q: "What is Repeater used for?", a: "Resending a request with modifications to observe the response." },
    ],
  },

  "eh-web/authn-testing": {
    summary:
      "Authentication testing probes how a lab app handles logins, lockout and sessions. Weaknesses like missing lockout, insecure cookies or sessions that never expire are noted, each paired with a concrete server-side fix.",
    visuals: [
      {
        type: "flow",
        title: "Testing authentication",
        steps: [
          { label: "Login behaviour", detail: "Errors, lockout, rate limits." },
          { label: "Session cookies", detail: "Flags and randomness." },
          { label: "Timeout", detail: "Logout and expiry." },
          { label: "Recommend", detail: "Fix for each weakness." },
        ],
      },
    ],
    keyPoints: [
      "Check lockout and rate limiting on login.",
      "Inspect session cookies for Secure and HttpOnly flags.",
      "Confirm sessions expire and logout works.",
      "Pair every weakness with a server-side fix.",
    ],
    terms: [
      { term: "Account lockout", meaning: "Blocking logins after repeated failures." },
      { term: "Session fixation", meaning: "Reusing a known session identifier." },
      { term: "Secure flag", meaning: "Cookie sent only over HTTPS." },
      { term: "Session timeout", meaning: "Ending an idle session automatically." },
    ],
    check: [
      { q: "Why check cookie flags during authentication testing?", a: "Missing Secure or HttpOnly flags make session cookies easier to steal." },
      { q: "What weakness does missing lockout create?", a: "It allows unlimited login attempts, enabling guessing attacks." },
    ],
  },

  "eh-web/injection-xss-lab": {
    summary:
      "In a lab app like Juice Shop or DVWA you can safely demonstrate injection and XSS, then explain the server-side fix. The point is to understand why the flaw exists and how parameterisation, output encoding and CSP eliminate it.",
    visuals: [
      {
        type: "flow",
        title: "Find, confirm, fix",
        steps: [
          { label: "Find input", detail: "Where input reaches a sink." },
          { label: "Confirm", detail: "Demonstrate in the lab app." },
          { label: "Explain cause", detail: "Data treated as code." },
          { label: "Fix", detail: "Parameterise, encode, add CSP." },
        ],
      },
    ],
    keyPoints: [
      "Demonstrate the flaw only in your lab app.",
      "The cause is untrusted input treated as code.",
      "Parameterised queries fix injection.",
      "Output encoding and CSP fix XSS.",
    ],
    terms: [
      { term: "Injection", meaning: "Input altering a query or command." },
      { term: "XSS", meaning: "Script injected to run in a browser." },
      { term: "Sink", meaning: "Point where input is used dangerously." },
      { term: "Output encoding", meaning: "Escaping data for its output context." },
    ],
    pitfalls: [
      "Testing injection or XSS on anything outside your lab.",
      "Reporting the symptom without the server-side fix.",
    ],
    check: [
      { q: "What is the server-side fix for SQL injection?", a: "Parameterised queries that keep data separate from the query." },
      { q: "Why demonstrate these only in a lab app?", a: "Doing so elsewhere without authorization is illegal and harmful." },
    ],
  },

  "eh-web/access-control-lab": {
    summary:
      "Access control testing checks whether a lab app enforces who can do what on the server. IDOR, forced browsing and logic flaws are found by manipulating requests, and every finding is paired with a server-side authorization fix.",
    visuals: [
      {
        type: "flow",
        title: "Access control testing",
        steps: [
          { label: "Map actions", detail: "Note sensitive operations." },
          { label: "Change identifiers", detail: "Test for IDOR." },
          { label: "Force browse", detail: "Try hidden URLs." },
          { label: "Recommend", detail: "Server-side checks." },
        ],
      },
    ],
    keyPoints: [
      "Access control must be enforced on the server.",
      "IDOR exposes data by changing an identifier.",
      "Forced browsing reaches pages by guessing URLs.",
      "Fix by checking authorization on every request.",
    ],
    terms: [
      { term: "IDOR", meaning: "Reaching objects by changing their identifier." },
      { term: "Forced browsing", meaning: "Guessing URLs to reach hidden pages." },
      { term: "Business logic flaw", meaning: "Abuse of intended workflow assumptions." },
      { term: "Privilege check", meaning: "Server test of what a user may do." },
    ],
    check: [
      { q: "How is IDOR typically tested?", a: "By changing an object identifier in a request to reach data you should not." },
      { q: "Where must access control be enforced?", a: "On the server, for every request." },
    ],
  },

  // ───────────── Common vulnerability classes ─────────────
  "eh-vuln-classes/memory-safety": {
    summary:
      "Memory safety bugs happen when a program reads or writes memory it should not, as with a buffer overflow or use-after-free. Understanding them conceptually explains many severe vulnerabilities, while mitigations and memory-safe languages reduce their impact.",
    visuals: [
      {
        type: "compare",
        title: "Cause vs mitigation",
        columns: [
          { title: "Cause", points: ["Unchecked bounds", "Freed memory reused", "Mixing data and control", "Native languages"] },
          { title: "Mitigation", points: ["ASLR and DEP", "Stack canaries", "Bounds checks", "Memory-safe languages"] },
        ],
      },
    ],
    keyPoints: [
      "Memory safety bugs misuse memory beyond intended bounds.",
      "ASLR, DEP and canaries raise the cost of exploitation.",
      "Memory-safe languages prevent whole classes of these bugs.",
      "These concepts explain many high-severity CVEs.",
    ],
    terms: [
      { term: "Buffer overflow", meaning: "Writing past the end of a buffer." },
      { term: "Use-after-free", meaning: "Using memory after it was freed." },
      { term: "ASLR", meaning: "Randomising memory layout to hinder attacks." },
      { term: "DEP", meaning: "Marking data memory non-executable." },
    ],
    check: [
      { q: "What is a buffer overflow in concept?", a: "Writing beyond a buffer's bounds, corrupting adjacent memory." },
      { q: "How do memory-safe languages help?", a: "They prevent whole classes of memory bugs by design." },
    ],
  },

  "eh-vuln-classes/injection-concepts": {
    summary:
      "Injection vulnerabilities share one root cause across SQL, command and template contexts: untrusted data is interpreted as code. The prevention is always to keep data and code separate with parameterisation, allowlists and least privilege.",
    visuals: [
      {
        type: "tree",
        title: "Injection family",
        root: "Injection",
        children: [
          { label: "SQL injection", children: ["Database queries"] },
          { label: "Command injection", children: ["OS commands"] },
          { label: "Template injection", children: ["Template engines"] },
          { label: "LDAP injection", children: ["Directory queries"] },
        ],
      },
    ],
    keyPoints: [
      "All injection shares the same root cause.",
      "Untrusted data must never be interpreted as code.",
      "Parameterisation and allowlists prevent injection.",
      "Least-privilege service accounts limit the damage.",
    ],
    terms: [
      { term: "Injection", meaning: "Untrusted data treated as executable code." },
      { term: "Parameterisation", meaning: "Binding data separately from code." },
      { term: "Allowlist", meaning: "Permitting only known-good values." },
      { term: "Template injection", meaning: "Input evaluated by a template engine." },
    ],
    check: [
      { q: "What root cause do all injection types share?", a: "Untrusted data being interpreted as code." },
      { q: "What is the general prevention?", a: "Keep data separate from code, for example with parameterisation." },
    ],
  },

  "eh-vuln-classes/misconfig-concepts": {
    summary:
      "Misconfiguration turns otherwise secure software into an easy target: insecure defaults, exposed admin interfaces and default or reused credentials. The fix is a hardened, documented baseline applied consistently.",
    visuals: [
      {
        type: "flow",
        title: "From default to hardened",
        steps: [
          { label: "Default install", detail: "Risky defaults, sample data." },
          { label: "Exposed interface", detail: "Admin panel reachable." },
          { label: "Weak credentials", detail: "Default or reused." },
          { label: "Harden", detail: "Baseline and least exposure." },
        ],
      },
    ],
    keyPoints: [
      "Insecure defaults are a common root cause.",
      "Exposed admin interfaces invite attack.",
      "Default and reused credentials are easily abused.",
      "A documented hardened baseline prevents this.",
    ],
    terms: [
      { term: "Misconfiguration", meaning: "Unsafe setup or default settings." },
      { term: "Hardening baseline", meaning: "Standard secure configuration." },
      { term: "Default credentials", meaning: "Preset accounts shipped with software." },
      { term: "Attack surface", meaning: "Exposed points an attacker can reach." },
    ],
    check: [
      { q: "Why are default credentials dangerous?", a: "They are publicly known and often left unchanged." },
      { q: "What prevents misconfiguration at scale?", a: "A documented, consistently applied hardening baseline." },
    ],
  },

  "eh-vuln-classes/crypto-failures": {
    summary:
      "Cryptographic failures expose data through weak algorithms, missing transport encryption, or secrets left in source code. The fixes are well established: use vetted libraries, strong modern algorithms, TLS everywhere, and a secrets manager.",
    visuals: [
      {
        type: "compare",
        title: "Failure vs fix",
        columns: [
          { title: "Failure", points: ["Weak or old algorithm", "No TLS in transit", "Hardcoded secrets", "Home-grown crypto"] },
          { title: "Fix", points: ["Modern vetted algorithms", "TLS everywhere", "Secrets manager", "Standard libraries"] },
        ],
      },
    ],
    keyPoints: [
      "Weak algorithms and keys expose protected data.",
      "Data in transit needs TLS.",
      "Secrets must never live in source code.",
      "Use vetted libraries, not home-grown crypto.",
    ],
    terms: [
      { term: "Cryptographic failure", meaning: "Weak or misused cryptography." },
      { term: "TLS", meaning: "Encryption for data in transit." },
      { term: "Secrets manager", meaning: "System that stores credentials safely." },
      { term: "Hardcoded secret", meaning: "A key or password written into code." },
    ],
    check: [
      { q: "Why avoid writing your own crypto?", a: "Subtle mistakes are easy; vetted libraries are reviewed and tested." },
      { q: "Where should application secrets be stored?", a: "In a secrets manager, never in source code." },
    ],
  },

  // ───────────── Exploitation in the lab ─────────────
  "eh-exploitation/metasploit-basics": {
    summary:
      "The Metasploit Framework is used, against vulnerable machines you own, to demonstrate the real impact of a finding. It organises modules, payloads and sessions so you can show that a vulnerability matters, then clean up and document it.",
    visuals: [
      {
        type: "flow",
        title: "Lab exploitation flow",
        steps: [
          { label: "Search", detail: "Find a module for the lab issue." },
          { label: "Configure", detail: "Set target and options." },
          { label: "Run", detail: "Against your lab VM only." },
          { label: "Record & clean", detail: "Evidence, then restore snapshot." },
        ],
      },
    ],
    keyPoints: [
      "Metasploit is used only against machines you own or are authorised to test.",
      "Modules, payloads and sessions organise the framework.",
      "The goal is to demonstrate impact, not to cause damage.",
      "Record evidence, then restore the lab snapshot.",
    ],
    terms: [
      { term: "Module", meaning: "A reusable component such as an exploit or scanner." },
      { term: "Payload", meaning: "Code that runs on a target after exploitation." },
      { term: "Session", meaning: "An interactive connection to a compromised lab host." },
      { term: "Listener", meaning: "Component waiting for a payload to connect back." },
    ],
    pitfalls: [
      "Running a module against anything outside the lab.",
      "Leaving a session or artefact behind after testing.",
    ],
    check: [
      { q: "What is the purpose of exploitation in an authorized test?", a: "To demonstrate the real impact of a vulnerability, not to cause harm." },
      { q: "What should you do after a lab exploitation exercise?", a: "Record evidence and restore the clean snapshot." },
    ],
  },

  "eh-exploitation/proof-of-impact": {
    summary:
      "Proof of impact is the minimum evidence that a finding is real, captured without damaging systems or exposing sensitive data. A screenshot of limited access is enough; destructive actions and data exfiltration are not part of an ethical test.",
    visuals: [
      {
        type: "flow",
        title: "Responsible proof",
        steps: [
          { label: "Define minimum", detail: "What proves the issue." },
          { label: "Capture", detail: "Screenshot or limited output." },
          { label: "Protect data", detail: "Avoid real sensitive data." },
          { label: "Document", detail: "Steps to reproduce." },
        ],
      },
    ],
    keyPoints: [
      "Capture only the minimum needed to prove the issue.",
      "Avoid destructive actions entirely.",
      "Protect any sensitive data you encounter.",
      "Document clear steps so the owner can reproduce it.",
    ],
    terms: [
      { term: "Proof of impact", meaning: "Minimal evidence a finding is real." },
      { term: "Reproduction steps", meaning: "Instructions to recreate the finding." },
      { term: "Data handling", meaning: "Protecting sensitive data seen during testing." },
      { term: "Non-destructive", meaning: "Testing that causes no damage." },
    ],
    check: [
      { q: "How much access should you demonstrate?", a: "The minimum that proves the finding is real." },
      { q: "What must you avoid when capturing proof?", a: "Destructive actions and exposing real sensitive data." },
    ],
  },

  "eh-exploitation/remediation-mapping": {
    summary:
      "A finding is only useful if the owner can fix it. Each one is turned into a root cause, a concrete remediation, a severity rating and, ideally, a detection so the issue can be caught if it recurs.",
    visuals: [
      {
        type: "flow",
        title: "Finding to fix",
        steps: [
          { label: "Root cause", detail: "Why the issue exists." },
          { label: "Remediation", detail: "A specific fix." },
          { label: "Severity", detail: "Rate risk and effort." },
          { label: "Detection", detail: "How to catch it later." },
        ],
      },
    ],
    keyPoints: [
      "Describe the root cause, not just the symptom.",
      "Give a concrete, actionable fix.",
      "Rate severity so owners prioritise.",
      "Suggest a detection for recurrence.",
    ],
    terms: [
      { term: "Root cause", meaning: "The underlying reason a flaw exists." },
      { term: "Remediation", meaning: "The action that fixes a finding." },
      { term: "Severity", meaning: "How serious a finding is." },
      { term: "Compensating control", meaning: "A mitigation when a fix is not yet possible." },
    ],
    check: [
      { q: "Why describe root cause rather than just the symptom?", a: "Fixing the root cause prevents the issue recurring in other places." },
      { q: "What makes a remediation useful to an owner?", a: "It is concrete, specific and prioritised by severity." },
    ],
  },

  // ───────────── Privilege escalation & post-exploitation (concepts) ─────────────
  "eh-postexploit/linux-privesc": {
    summary:
      "Privilege escalation on Linux usually abuses configuration rather than exotic exploits: misconfigured sudo, dangerous SUID binaries, weak file permissions or vulnerable scheduled jobs. Knowing these paths conceptually tells defenders exactly what to harden.",
    visuals: [
      {
        type: "tree",
        title: "Common Linux privesc paths",
        root: "Linux privesc",
        children: [
          { label: "sudo misconfig", children: ["Overly broad rules"] },
          { label: "SUID binaries", children: ["Unsafe programs"] },
          { label: "File permissions", children: ["Writable sensitive files"] },
          { label: "Cron jobs", children: ["Writable scripts"] },
        ],
      },
    ],
    keyPoints: [
      "Most Linux privesc abuses configuration, not zero-days.",
      "Broad sudo rules and risky SUID binaries are classic paths.",
      "Writable sensitive files and cron scripts are dangerous.",
      "Hardening each path is the defensive takeaway.",
    ],
    terms: [
      { term: "Privilege escalation", meaning: "Gaining higher rights than granted." },
      { term: "sudo", meaning: "Runs commands as another user, often root." },
      { term: "SUID", meaning: "Binary running as its owner's identity." },
      { term: "Cron", meaning: "Scheduler that runs jobs automatically." },
    ],
    check: [
      { q: "Why is misconfigured sudo a privesc risk?", a: "Overly broad rules can let a user run commands as root." },
      { q: "What is the defensive takeaway from these paths?", a: "Harden sudo, SUID binaries, permissions and scheduled jobs." },
    ],
  },

  "eh-postexploit/windows-privesc": {
    summary:
      "On Windows, escalation commonly abuses service and permission misconfigurations such as unquoted service paths, weak service permissions, or token and privilege abuse. Understanding these conceptually shows defenders which settings to review.",
    visuals: [
      {
        type: "tree",
        title: "Common Windows privesc paths",
        root: "Windows privesc",
        children: [
          { label: "Service issues", children: ["Unquoted paths", "Weak permissions"] },
          { label: "Token abuse", children: ["Impersonation privileges"] },
          { label: "Credentials", children: ["Stored secrets"] },
          { label: "Misconfig", children: ["AlwaysInstallElevated"] },
        ],
      },
    ],
    keyPoints: [
      "Service misconfigurations are a frequent Windows path.",
      "Unquoted service paths can run attacker files.",
      "Certain privileges enable token impersonation.",
      "Reviewing service and privilege settings is the defence.",
    ],
    terms: [
      { term: "Unquoted service path", meaning: "A service path that can resolve to an attacker file." },
      { term: "Token", meaning: "Object representing a security context." },
      { term: "Service permission", meaning: "Who may modify or control a service." },
      { term: "Impersonation", meaning: "Acting under another account's context." },
    ],
    check: [
      { q: "Why is an unquoted service path a risk?", a: "Windows may resolve it to a file an attacker controls, running it with service privileges." },
      { q: "What is the defensive focus for Windows privesc?", a: "Reviewing service configurations and privilege assignments." },
    ],
  },

  "eh-postexploit/password-attacks": {
    summary:
      "Password attacks are practised against hashes you generate in your own lab, never real credentials. Cracking them with Hashcat or John shows why fast hashes and weak passwords fail, and why salted slow hashing plus MFA is the fix.",
    visuals: [
      {
        type: "compare",
        title: "Weak vs strong storage",
        columns: [
          { title: "Weak", points: ["Fast hash like MD5", "No salt", "Cracks quickly", "No MFA"] },
          { title: "Strong", points: ["Slow hash like Argon2", "Per-user salt", "Slow to crack", "MFA added"] },
        ],
      },
    ],
    keyPoints: [
      "Only crack hashes you generated in your lab.",
      "Fast, unsalted hashes crack quickly.",
      "Slow, salted hashing resists mass cracking.",
      "MFA defends even if a password is cracked.",
    ],
    terms: [
      { term: "Hashcat", meaning: "Fast password-hash cracking tool." },
      { term: "John the Ripper", meaning: "Classic password-cracking tool." },
      { term: "Dictionary attack", meaning: "Trying words from a list." },
      { term: "Salt", meaning: "Random value making each hash unique." },
    ],
    pitfalls: [
      "Attempting to crack hashes you were not authorised to have.",
      "Confusing a fast hash with a password-storage hash.",
    ],
    check: [
      { q: "What hashes may you practise cracking?", a: "Only ones you generated in your own lab." },
      { q: "What storage choices resist cracking?", a: "Salted, slow hashing such as Argon2, backed by MFA." },
    ],
  },

  "eh-postexploit/lateral-persistence": {
    summary:
      "After a foothold, attackers move sideways using reused credentials and establish persistence to survive reboots. Described conceptually and mapped to ATT&CK, these behaviours tell defenders which telemetry and detections to put in place.",
    visuals: [
      {
        type: "flow",
        title: "Deeper into a network",
        steps: [
          { label: "Foothold", detail: "Initial access." },
          { label: "Lateral move", detail: "Reuse creds to pivot." },
          { label: "Persistence", detail: "Survive reboots." },
          { label: "Detect", detail: "Telemetry and ATT&CK mapping." },
        ],
      },
    ],
    keyPoints: [
      "Credential reuse enables lateral movement.",
      "Persistence lets attackers return after reboots.",
      "These map cleanly to MITRE ATT&CK techniques.",
      "The value is knowing what telemetry detects them.",
    ],
    terms: [
      { term: "Lateral movement", meaning: "Moving between hosts in a network." },
      { term: "Persistence", meaning: "Keeping access across restarts." },
      { term: "Pivoting", meaning: "Using one host to reach others." },
      { term: "ATT&CK", meaning: "Knowledge base of attacker techniques." },
    ],
    check: [
      { q: "What commonly enables lateral movement?", a: "Reusing credentials harvested from the first host." },
      { q: "Why map these behaviours to ATT&CK?", a: "To identify the telemetry and detections that would catch them." },
    ],
  },

  // ───────────── Wireless & Active Directory basics ─────────────
  "eh-wireless-ad/wireless-concepts": {
    summary:
      "Wi-Fi security rests on the authentication handshake between a client and access point. WPA3 improves on WPA2, and rogue access points trick clients into connecting. Defenders focus on strong configuration and detecting rogue devices.",
    visuals: [
      {
        type: "compare",
        title: "WPA2 vs WPA3",
        columns: [
          { title: "WPA2", points: ["Widely deployed", "Weaker handshake", "Offline attack risk", "Still common"] },
          { title: "WPA3", points: ["Stronger handshake", "Resists offline attacks", "Forward secrecy", "Preferred where available"] },
        ],
      },
    ],
    keyPoints: [
      "Wi-Fi security centres on the authentication handshake.",
      "WPA3 improves resistance to offline attacks over WPA2.",
      "Rogue access points impersonate legitimate networks.",
      "Strong config and rogue detection are the defences.",
    ],
    terms: [
      { term: "WPA2", meaning: "Common Wi-Fi security protocol." },
      { term: "WPA3", meaning: "Newer, stronger Wi-Fi security protocol." },
      { term: "Handshake", meaning: "Exchange that authenticates a client." },
      { term: "Rogue access point", meaning: "Unauthorised AP impersonating a network." },
    ],
    check: [
      { q: "What does WPA3 improve over WPA2?", a: "Resistance to offline attacks on the handshake, among other things." },
      { q: "What is a rogue access point?", a: "An unauthorised access point that tricks clients into connecting." },
    ],
  },

  "eh-wireless-ad/ad-concepts": {
    summary:
      "Active Directory authenticates users and computers across a Windows domain, mainly via Kerberos. Its interconnected permissions create a large attack surface, which tools like BloodHound visualise. Defenders apply tiering and harden misconfigurations.",
    visuals: [
      {
        type: "tree",
        title: "AD attack surface",
        root: "Active Directory",
        children: [
          { label: "Authentication", children: ["Kerberos", "NTLM"] },
          { label: "Permissions", children: ["Group nesting", "Delegation"] },
          { label: "Misconfig", children: ["Weak service accounts"] },
          { label: "Analysis", children: ["BloodHound graphs"] },
        ],
      },
    ],
    keyPoints: [
      "AD authenticates domain users mainly via Kerberos.",
      "Interconnected permissions create a broad attack surface.",
      "BloodHound maps relationships and attack paths.",
      "Tiering and hardening reduce the risk.",
    ],
    terms: [
      { term: "Active Directory", meaning: "Windows directory and identity service." },
      { term: "Kerberos", meaning: "Ticket-based authentication protocol." },
      { term: "BloodHound", meaning: "Tool that graphs AD relationships." },
      { term: "Tiering", meaning: "Separating admin levels to limit exposure." },
    ],
    check: [
      { q: "What protocol does AD mainly use to authenticate?", a: "Kerberos." },
      { q: "What does BloodHound help reveal?", a: "Relationships and potential attack paths within Active Directory." },
    ],
  },

  // ───────────── Capstone: lab pentest & report ─────────────
  "eh-capstone/engagement-plan": {
    summary:
      "Even a lab engagement starts with a plan: scope, rules of engagement, goals and a timeline. Planning first keeps the test focused, sets up good note-taking, and mirrors how a real, authorized engagement begins.",
    visuals: [
      {
        type: "flow",
        title: "Engagement plan",
        steps: [
          { label: "Scope", detail: "Which lab systems and goals." },
          { label: "Rules", detail: "Timing and limits." },
          { label: "Plan phases", detail: "Order and timeline." },
          { label: "Set up notes", detail: "Evidence capture ready." },
        ],
      },
    ],
    keyPoints: [
      "Define the lab scope and objectives up front.",
      "Write rules of engagement even for a lab.",
      "Plan the phases and a realistic timeline.",
      "Prepare note-taking before you begin.",
    ],
    terms: [
      { term: "Engagement", meaning: "A defined testing project." },
      { term: "Scope", meaning: "The systems and goals of the test." },
      { term: "Timeline", meaning: "Schedule for the testing phases." },
      { term: "Evidence log", meaning: "Record of findings as they occur." },
    ],
    check: [
      { q: "Why plan a lab engagement like a real one?", a: "It builds the discipline and documentation habits a real engagement requires." },
      { q: "What should be ready before testing starts?", a: "Scope, rules of engagement and a note-taking setup." },
    ],
  },

  "eh-capstone/run-pentest": {
    summary:
      "The hands-on capstone works a vulnerable lab machine through recon, enumeration and validated findings, capturing minimal proof for each. The emphasis is on methodical coverage and good evidence, not speed.",
    visuals: [
      {
        type: "cycle",
        title: "Running the test",
        steps: [
          { label: "Recon", detail: "Gather information in scope." },
          { label: "Enumerate", detail: "Map services and weaknesses." },
          { label: "Validate", detail: "Confirm each finding." },
          { label: "Evidence", detail: "Capture minimal proof." },
        ],
      },
    ],
    keyPoints: [
      "Work the machine methodically through each phase.",
      "Validate every finding before reporting it.",
      "Capture minimal, non-destructive proof.",
      "Keep organised notes as you go.",
    ],
    terms: [
      { term: "Enumeration", meaning: "Detailed discovery of services and data." },
      { term: "Validation", meaning: "Confirming a finding is real." },
      { term: "Evidence", meaning: "Proof supporting a reported finding." },
      { term: "Methodology", meaning: "The ordered process you follow." },
    ],
    check: [
      { q: "Why validate each finding before reporting?", a: "To avoid false positives and give the owner accurate, actionable results." },
      { q: "What kind of proof should you capture?", a: "Minimal, non-destructive evidence that the finding is real." },
    ],
  },

  "eh-capstone/write-report": {
    summary:
      "The report is the deliverable that gives the engagement value. It opens with an executive summary, then details each finding with a risk rating, evidence and concrete remediation, so both leaders and engineers can act.",
    visuals: [
      {
        type: "layers",
        title: "Report structure",
        layers: [
          { label: "Executive summary", detail: "Impact and priorities for leaders." },
          { label: "Findings", detail: "Each with risk rating and evidence." },
          { label: "Remediation", detail: "Concrete fixes per finding." },
          { label: "Appendices", detail: "Reproduction steps and scope." },
        ],
      },
    ],
    keyPoints: [
      "The executive summary speaks to decision-makers.",
      "Each finding has a risk rating and evidence.",
      "Remediation must be concrete and prioritised.",
      "Appendices hold reproduction steps and scope.",
    ],
    terms: [
      { term: "Executive summary", meaning: "Short, non-technical overview of results." },
      { term: "Risk rating", meaning: "Severity assigned to a finding." },
      { term: "Remediation", meaning: "The recommended fix." },
      { term: "Appendix", meaning: "Supporting detail and evidence." },
    ],
    check: [
      { q: "Who is the executive summary written for?", a: "Decision-makers who need impact and priorities, not technical depth." },
      { q: "What must accompany each finding?", a: "A risk rating, evidence and concrete remediation." },
    ],
  },

  "eh-capstone/debrief-next": {
    summary:
      "A debrief presents findings to the owner as you would to a client, explaining impact and priorities in plain language and planning a retest of fixes. It closes the loop and points to continued, legal practice.",
    visuals: [
      {
        type: "flow",
        title: "Closing the engagement",
        steps: [
          { label: "Present", detail: "Walk through findings." },
          { label: "Explain", detail: "Impact in plain language." },
          { label: "Plan retest", detail: "Verify fixes later." },
          { label: "Next steps", detail: "Continued learning path." },
        ],
      },
    ],
    keyPoints: [
      "Present findings and priorities clearly.",
      "Explain impact without jargon.",
      "Plan a retest to confirm fixes work.",
      "Choose your next legal practice and certification.",
    ],
    terms: [
      { term: "Debrief", meaning: "Presenting results and answering questions." },
      { term: "Retest", meaning: "Verifying that fixes resolved findings." },
      { term: "Prioritisation", meaning: "Ordering fixes by risk." },
      { term: "Continuous learning", meaning: "Ongoing legal skill development." },
    ],
    check: [
      { q: "Why plan a retest after remediation?", a: "To confirm the fixes actually resolved the findings." },
      { q: "How should impact be explained in a debrief?", a: "In plain language that non-technical stakeholders can act on." },
    ],
  },
};

export default explainers;
