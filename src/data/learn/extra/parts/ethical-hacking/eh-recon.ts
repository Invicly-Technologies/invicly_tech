import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "eh-recon/passive-recon": {
    plain: [
      "Before an authorised test begins, you want to know as much as possible about the target. Passive recon means learning from sources that are already public, without sending a single packet to the target's own systems. You ask other people's databases, not the target.",
      "Think of a journalist preparing an interview. They read the company website archive, news stories and job adverts before they ever call. In the same way, you read domain registration records, certificate logs, search engine results and old copies of web pages.",
      "A lot leaks this way. Job adverts name the software the company uses. Old PDFs carry employee names in their metadata. Public code repositories sometimes contain passwords. Certificate logs list server names the company never meant to advertise.",
      "Passive does not mean \"anything goes\". You still work only for a client who authorised the engagement, you collect the minimum personal data, and you write down where every fact came from, so the report can be checked.",
    ],
    deepDive: [
      {
        heading: "Registration data: WHOIS and RDAP",
        body: "Every domain and IP block has an owner on record. For domains, the classic tool is whois example.com. Since 2018, privacy rules such as GDPR mean most personal details are redacted, but you still see the registrar, creation and expiry dates, and name servers. Since January 2025, ICANN treats RDAP (Registration Data Access Protocol) as the official source for generic top-level domains like .com. RDAP returns structured JSON, for example from https://rdap.org/domain/example.com.\n\nFor IP addresses, the five Regional Internet Registries (ARIN, RIPE NCC, APNIC, LACNIC and AFRINIC) record who holds each block. whois 203.0.113.10 tells you the organisation and the network range, and often the Autonomous System Number (ASN), which groups all the client's announced networks.",
        bullets: ["whois example.com: registrar, dates, name servers", "RDAP is the JSON successor to WHOIS", "whois IP: owner and network range", "An ASN can reveal more of the client's IP ranges"],
      },
      {
        heading: "Search operators and archives",
        body: "Search engines index far more than people think. Operators narrow the results. site:example.com limits to one domain. filetype:pdf finds documents. intitle:\"index of\" finds open directory listings. inurl:login finds login pages. A minus sign excludes, so site:example.com -site:www.example.com shows other subdomains. Combining them is often called dorking.\n\nThe Internet Archive's Wayback Machine keeps old copies of pages. Old versions may show removed staff pages, earlier technology or forgotten paths. Its CDX API lists every archived URL for a domain, which is a fast way to find old endpoints without touching the live site. Note that Google removed its cache: operator in 2024, so the archive is now the main source for old copies.",
        bullets: ["site: limits to a domain", "filetype: finds documents such as pdf or xlsx", "intitle: and inurl: match the title or URL", "\"exact phrase\" and -exclude refine results"],
      },
      {
        heading: "Certificates, code and leaked files",
        body: "Certificate Transparency (CT) logs are public records of every TLS certificate that public CAs issue. Searching them at crt.sh for %.example.com lists names such as vpn.example.com or staging.example.com, because each needed a certificate. This is one of the richest passive sources.\n\nPublic code hosting is another. A search on GitHub for the client's domain may show configuration files, internal hostnames or even API keys. If you find a secret, do not try it. Record where it is, tell the client quickly, and let them revoke it. Document metadata matters too: exiftool on a published PDF often shows the author's username and the software version used.",
        visual: {
          type: "tree",
          title: "Passive sources and what they reveal",
          root: "Public sources",
          children: [
            { label: "WHOIS / RDAP", children: ["Registrar and dates", "Name servers", "IP owner and ASN"] },
            { label: "CT logs (crt.sh)", children: ["Subdomain names", "Certificate issuers"] },
            { label: "Search and archives", children: ["Documents", "Old pages and paths"] },
            { label: "Code hosting", children: ["Configs and hostnames", "Leaked keys to report"] },
            { label: "Jobs and social", children: ["Technology in use", "Team structure"] },
          ],
        },
      },
      {
        heading: "Ethics, scope and the defender's view",
        body: "Passive recon can easily wander into people's private lives. Collect only what the engagement needs: names and roles for a phishing test the client ordered, yes; home addresses and family photos, no. Do not buy or download breached databases. Store what you collect as confidential client data.\n\nFor each fact, record the source, the URL and the date, because public data changes and the client must be able to verify it. Also mark which items are confirmed and which are guesses.\n\nDefenders can reduce what passive recon finds. Watch CT logs for unexpected certificates on your domains, turn on secret scanning in code repositories, strip metadata from documents before publishing, and avoid naming exact software versions in job adverts.",
        bullets: ["Collect the minimum personal data", "Never use leaked credentials; report them", "Record source, URL and date for each fact", "Defenders: CT monitoring, secret scanning, metadata stripping"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A passive recon session",
        steps: [
          { label: "Confirm scope", detail: "Which domains and brands are authorised" },
          { label: "Registration data", detail: "WHOIS, RDAP, IP owner, ASN" },
          { label: "Certificate logs", detail: "crt.sh for subdomain names" },
          { label: "Search and archive", detail: "Operators, Wayback Machine" },
          { label: "Code and documents", detail: "Repos, metadata, leaks" },
          { label: "Write up sources", detail: "Fact, URL, date, confidence" },
        ],
      },
    ],
    examples: [
      {
        title: "Collect subdomain names from CT logs and the archive",
        explanation: "Your client authorised example.com. Step 1: Query crt.sh for certificates covering any name under the domain. This talks to crt.sh, not to the client. Step 2: Extract and deduplicate the names. Step 3: Ask the Wayback Machine for every archived URL to spot old paths. Step 4: Save both lists with today's date in your notes. Nothing here sends traffic to the client's servers.",
        code: {
          lang: "bash",
          code: "D=example.com\ncurl -s \"https://crt.sh/?q=%25.$D&output=json\" \\\n  | jq -r '.[].name_value' | tr 'A-Z' 'a-z' | sed 's/^\\*\\.//' \\\n  | sort -u > ct-names-$(date -u +%F).txt\n\ncurl -s \"https://web.archive.org/cdx/search/cdx?url=$D/*&fl=original&collapse=urlkey\" \\\n  > wayback-urls-$(date -u +%F).txt\nwc -l ct-names-*.txt wayback-urls-*.txt",
        },
      },
      {
        title: "Checking a published PDF for metadata",
        explanation: "A search for site:example.com filetype:pdf finds an annual report. Step 1: Download it from the search engine result (fetching a public file from the client's website is normal browsing, but note it). Step 2: Run exiftool. Step 3: The Author field shows a username like jsmith, and the Creator field shows the exact word processor version. Step 4: Note both: usernames hint at the login format, versions hint at desktop software. Step 5: The fix for the client is to strip metadata before publishing, for example with exiftool -all= file.pdf.",
        code: {
          lang: "bash",
          code: "exiftool annual-report.pdf | grep -Ei 'author|creator|producer|create date'\n# Author      : jsmith\n# Creator     : Microsoft Word for Microsoft 365\n# Producer    : Microsoft Word for Microsoft 365\n# Fix: remove metadata before publishing\nexiftool -all= -overwrite_original annual-report.pdf",
        },
      },
    ],
    cheatSheet: [
      "Passive = ask third-party sources; never send packets to the target itself",
      "whois example.com and https://rdap.org/domain/example.com for registration data",
      "crt.sh with %.example.com lists names from certificate logs",
      "site:example.com -site:www.example.com shows other subdomains in search results",
      "exiftool file.pdf shows author names and software versions",
      "Found a secret? Do not use it; report it so the client can revoke it",
      "Write down source, URL and date for every fact you collect",
    ],
    quiz: [
      {
        q: "Which activity is passive recon?",
        options: ["Running nmap against the client's web server", "Brute-forcing subdomains against the client's DNS server", "Logging in to the client's VPN portal", "Searching certificate transparency logs on crt.sh"],
        answer: 3,
        why: "crt.sh is a third-party database, so the client's systems receive no traffic.",
      },
      {
        q: "Why do WHOIS results often show \"REDACTED FOR PRIVACY\"?",
        options: ["The domain is expired", "Privacy rules such as GDPR require hiding personal data", "The registrar is offline", "The domain uses DNSSEC"],
        answer: 1,
        why: "Since 2018 most registrars redact personal contact details from public registration data.",
      },
      {
        q: "You find a working-looking API key in a public repo belonging to the client. What do you do?",
        options: ["Report it to the client quickly without using it", "Test it to prove it works", "Post it publicly to warn others", "Ignore it because it is public"],
        answer: 0,
        why: "Using a found credential goes beyond passive recon; the client must revoke it.",
      },
      {
        q: "What does the search query site:example.com -site:www.example.com do?",
        options: ["Searches only www.example.com", "Searches all sites except example.com", "Shows results from example.com subdomains other than www", "Finds sites that link to example.com"],
        answer: 2,
        why: "The minus sign excludes the main site, leaving other subdomains under example.com.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look up the registration data for a domain you own (or example.com) with both whois and RDAP, and note the registrar, creation date and name servers.",
        hint: "RDAP returns JSON; jq helps you read it.",
        solution: "whois example.com | grep -Ei 'registrar:|creation date|name server'\ncurl -sL https://rdap.org/domain/example.com \\\n  | jq '{events: [.events[] | {eventAction, eventDate}], nameservers: [.nameservers[].ldhName]}'\n# The registrar is in .entities (role \"registrar\"); browse with jq . first.",
      },
      {
        level: "medium",
        task: "For a domain you own, list all names in CT logs and compare them with the subdomains you think exist. Are there any surprises?",
        hint: "Use the crt.sh JSON output, remove the leading *. from wildcards, and sort -u.",
        solution: "curl -s 'https://crt.sh/?q=%25.yourdomain.com&output=json' \\\n  | jq -r '.[].name_value' | sed 's/^\\*\\.//' | sort -u > ct.txt\nsort -u known.txt > known-sorted.txt\ncomm -23 ct.txt known-sorted.txt   # names in CT logs you did not list\n# Surprises are often old staging or test hosts. Remove the DNS\n# records you no longer need.",
      },
      {
        level: "hard",
        task: "Build a small recon notes template (CSV) with columns that make every fact traceable, and fill in three rows from your own domain.",
        hint: "Think: what, where it came from, when, how sure, in scope?",
        solution: "fact,type,source,url,retrieved_utc,confidence,in_scope\nvpn.mydomain.com,subdomain,crt.sh,https://crt.sh/?q=%25.mydomain.com,2026-03-02T10:14Z,confirmed,yes\nRegistrar is Namecheap,registration,RDAP,https://rdap.org/domain/mydomain.com,2026-03-02T10:20Z,confirmed,n/a\nUses Jira,technology,job advert,https://jobs.example/123,2026-03-02T10:31Z,likely,n/a",
      },
    ],
    faq: [
      { q: "Is OSINT legal?", a: "Reading public information is generally legal, but how you use it matters. Privacy and data protection laws still apply to personal data, and using leaked credentials is unauthorised access." },
      { q: "What is Google dorking?", a: "It means using advanced search operators such as site:, filetype: and intitle: to find specific pages or files that a search engine has indexed." },
      { q: "Is using Shodan passive recon?", a: "From the target's point of view, yes: you query Shodan's existing scan data and send nothing to the target. The results may be old, so confirm them later with authorised active scans." },
      { q: "What is the difference between OSINT and passive recon?", a: "OSINT (open-source intelligence) is the wider practice of using public information for any purpose. Passive recon is the part of a pentest that uses OSINT about the target without touching it." },
    ],
  },

  "eh-recon/dns-enum": {
    plain: [
      "DNS (Domain Name System) is the internet's phone book. It turns names like shop.example.com into IP addresses that computers use. Every domain publishes records in DNS, and many of them are public by design, because the whole internet needs to read them.",
      "DNS enumeration means reading those records carefully to build a list of the domain's hosts. Where is the mail server? Which name servers answer for the domain? Which subdomains exist, like vpn, dev or staging? Each answer is a possible target for later, authorised testing.",
      "Some of this is passive, such as reading certificate logs. Some is active, such as asking the domain's own name servers thousands of guessed names. Active steps touch the client's systems, so they must be in scope.",
      "One rule matters more than any tool: a name under the client's domain is not always the client's server. A subdomain might point to a cloud service or another company. You check who owns the IP address before treating it as in scope.",
    ],
    deepDive: [
      {
        heading: "The records that matter in recon",
        body: "Beyond A, AAAA, MX and NS, several records reveal a lot. CNAME is an alias: shop.example.com may be a CNAME to a hosting platform, which tells you who really runs it. SOA (Start of Authority) names the primary name server and a contact mailbox. TXT records hold SPF rules that list every service allowed to send the domain's email, plus verification tokens that reveal SaaS tools, for example google-site-verification or MS= for Microsoft 365. SRV records advertise services such as _sip._tcp. CAA records list which certificate authorities may issue certificates for the domain. PTR records map an IP back to a name (reverse DNS).\n\nDMARC lives at _dmarc.example.com and describes the domain's email authentication policy, which you can note in the report as an email security finding.",
        bullets: ["CNAME: who really hosts a name", "TXT: SPF senders and SaaS verification tokens", "SOA: primary name server and contact", "SRV: service locations; CAA: allowed CAs", "PTR: reverse lookup from IP to name"],
      },
      {
        heading: "Zone transfers and why they are usually blocked",
        body: "A zone transfer (AXFR) is how a primary name server copies the whole zone to its secondary servers, over TCP port 53. If a server allows AXFR from anyone, one query reveals every record in the zone, including internal names. That is a classic misconfiguration and a real finding.\n\nTesting it is one query per name server: dig axfr @ns1.example.com example.com. A refusal (\"Transfer failed\") is the healthy result. Only run it against name servers in your scope. For practice, zonetransfer.me was set up by its owner to allow transfers on purpose.\n\nThe fix is to allow transfers only to the known secondary servers, for example with allow-transfer in BIND, and ideally to protect them with TSIG keys (shared secrets that sign the transfer).",
        visual: {
          type: "sequence",
          title: "A zone transfer request, safe and unsafe",
          actors: ["Tester", "Name server"],
          messages: [
            { from: 0, to: 1, label: "SOA query: who is primary?" },
            { from: 1, to: 0, label: "SOA record and serial" },
            { from: 0, to: 1, label: "AXFR request over TCP 53" },
            { from: 1, to: 0, label: "Secure: REFUSED" },
            { from: 1, to: 0, label: "Misconfigured: every record" },
          ],
        },
      },
      {
        heading: "Finding subdomains: passive first, then active",
        body: "Start with passive sources: certificate logs, search results, archives and tools like subfinder that combine many public sources. They often find most names without touching the client.\n\nActive brute force comes next if the RoE allows it. A tool sends DNS queries for words from a list (www, vpn, dev, api, and thousands more) and keeps the names that resolve. This sends traffic to the client's name servers, so it is active recon. Keep the rate moderate.\n\nWatch for wildcard DNS: if *.example.com is set, every guessed name seems to exist. Test it by resolving a random name like q7x2k9-nothere.example.com. If it returns an address, filter out every result that matches that wildcard answer.",
        visual: {
          type: "flow",
          title: "From names to an in-scope host list",
          steps: [
            { label: "Passive names", detail: "CT logs, search, subfinder" },
            { label: "Active guesses", detail: "Wordlist brute force if allowed" },
            { label: "Remove wildcards", detail: "Drop answers matching a random name" },
            { label: "Resolve to IPs", detail: "A, AAAA and CNAME targets" },
            { label: "Check ownership", detail: "whois each IP, compare with scope" },
            { label: "Final list", detail: "In scope, out of scope, ask client" },
          ],
        },
      },
      {
        heading: "Staying in scope and the defender's side",
        body: "After resolving names, group the IPs by owner. Addresses in the client's own ranges are usually in scope. Addresses belonging to a CDN, a SaaS vendor or a hosting company need explicit written confirmation, and some can never be tested by you at all.\n\nTwo DNS issues are findings in themselves. A dangling CNAME points to a cloud resource that was deleted; if someone else can claim that resource name, they could serve content on the client's subdomain (subdomain takeover). Report it, but do not claim the resource yourself unless the RoE explicitly allows it. The other is an open zone transfer.\n\nDefenders should keep an inventory of DNS records, remove stale ones when services are retired, restrict AXFR, and watch DNS query logs for brute-force patterns: many NXDOMAIN (non-existent name) answers from one source.",
        bullets: ["Group resolved IPs by owner before testing", "Dangling CNAME: report possible subdomain takeover", "Defenders: remove stale records when services retire", "Many NXDOMAIN replies from one source suggest brute forcing"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What a domain's DNS tells you, layer by layer",
        layers: [
          { label: "Registrar and NS", detail: "Who manages the domain and its DNS" },
          { label: "Mail: MX, SPF, DMARC", detail: "Email providers and policy" },
          { label: "Web: A, AAAA, CNAME", detail: "Servers, CDNs and hosting platforms" },
          { label: "TXT verification tokens", detail: "SaaS tools the company uses" },
          { label: "Subdomains", detail: "vpn, dev, staging, api and more" },
        ],
      },
    ],
    examples: [
      {
        title: "Read a domain's public records with dig",
        explanation: "Your scope includes example.com. Step 1: ask for the name servers and the SOA. Step 2: ask for mail and TXT records; the SPF line shows which providers send mail. Step 3: check the DMARC policy. Step 4: check whether ANY works; many servers now give a minimal answer to ANY queries (RFC 8482), so ask for each type instead. Step 5: do a reverse lookup on the web server's IP.",
        code: {
          lang: "bash",
          code: "D=example.com\ndig +short NS $D\ndig +short SOA $D\ndig +short MX $D\ndig +short TXT $D          # SPF and verification tokens\ndig +short TXT _dmarc.$D\ndig +short CAA $D\nIP=$(dig +short A $D | head -n1)\ndig +short -x \"$IP\"        # reverse DNS (PTR)",
        },
      },
      {
        title: "Test zone transfers on every in-scope name server",
        explanation: "Step 1: list the domain's name servers. Step 2: ask each one for a zone transfer. Step 3: a \"Transfer failed\" line is the healthy, secure result; a long list of records is a finding. Step 4: if it works, save the output as evidence, report it as a misconfiguration, and recommend restricting transfers to the secondary servers. Practise first on zonetransfer.me, which allows it on purpose.",
        code: {
          lang: "bash",
          code: "D=zonetransfer.me    # practice domain; use your in-scope domain at work\nfor ns in $(dig +short NS $D); do\n  echo \"== $ns\"\n  dig axfr @\"$ns\" \"$D\" +noall +answer | head -n 20\ndone\n# Secure servers print: ; Transfer failed.",
        },
      },
    ],
    cheatSheet: [
      "dig +short TYPE name, where TYPE is A, AAAA, MX, NS, TXT, SOA, CAA or SRV",
      "dig -x IP does a reverse (PTR) lookup",
      "dig axfr @ns1.example.com example.com tests a zone transfer; refused is good",
      "Resolve a random name first to detect wildcard DNS",
      "subfinder -d example.com -silent collects subdomains from passive sources",
      "dnsrecon -d example.com -t std runs standard record checks",
      "whois each resolved IP: a name under the domain may be a third party's server",
    ],
    quiz: [
      {
        q: "Which record would tell you the domain uses Microsoft 365 or Google Workspace?",
        options: ["PTR", "SOA", "TXT (SPF or verification token)", "CAA"],
        answer: 2,
        why: "SPF includes and verification tokens in TXT records name the services a domain uses.",
      },
      {
        q: "A name server answers a zone transfer request with every record. What is the fix?",
        options: ["Allow AXFR only to the authorised secondary servers", "Turn off DNS", "Move to UDP only", "Add more A records"],
        answer: 0,
        why: "Restricting transfers (ideally with TSIG) stops anyone else from copying the zone.",
      },
      {
        q: "Every guessed subdomain resolves to the same IP. What is the most likely reason?",
        options: ["The wordlist is perfect", "The client has thousands of servers", "DNSSEC is enabled", "A wildcard DNS record answers any name"],
        answer: 3,
        why: "A wildcard record returns an answer for any name, so results must be filtered.",
      },
      {
        q: "help.example.com is a CNAME to a SaaS help-desk vendor. Is the vendor's server in scope?",
        options: ["Yes, because it is under example.com", "Not unless the vendor itself authorises testing", "Yes, if you only scan it", "Only at night"],
        answer: 1,
        why: "The client owns the name but not the vendor's infrastructure.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For a domain you own or example.com, list the NS, MX, TXT and SOA records and explain each in one sentence.",
        hint: "Use dig +short for each type.",
        solution: "for t in NS MX TXT SOA; do echo \"== $t\"; dig +short $t example.com; done\n# NS: which servers answer for the domain\n# MX: where its email is delivered\n# TXT: SPF and other text data\n# SOA: primary server, contact, serial and timers",
      },
      {
        level: "medium",
        task: "Practise zone transfers on zonetransfer.me and list the record types you received.",
        hint: "Find its name servers first, then dig axfr against one of them.",
        solution: "ns=$(dig +short NS zonetransfer.me | head -n1)\ndig axfr @\"$ns\" zonetransfer.me +noall +answer > zt.txt\nawk '{print $4}' zt.txt | sort | uniq -c | sort -rn\n# Typical output includes A, CNAME, MX, TXT, SRV, PTR, HINFO...",
      },
      {
        level: "hard",
        task: "Write a script that takes a file of subdomains, removes wildcard answers, resolves the rest and prints name, IP and the IP's owning organisation.",
        hint: "Resolve a random name first to learn the wildcard IP. whois output field names vary by registry.",
        solution: "D=$1; LIST=$2\nWILD=$(dig +short A \"zz$RANDOM-none.$D\" | tail -n1)\nwhile read -r h; do\n  ip=$(dig +short A \"$h\" | tail -n1)\n  [ -z \"$ip\" ] || [ \"$ip\" = \"$WILD\" ] && continue\n  org=$(whois \"$ip\" | grep -iE '^(org-?name|orgname|netname|descr):' | head -n1)\n  echo \"$h,$ip,${org#*:}\"\ndone < \"$LIST\"\n# usage: ./resolve.sh example.com subs.txt",
      },
    ],
    faq: [
      { q: "What is the difference between subfinder and a brute-force tool?", a: "subfinder asks public sources such as certificate logs, so it is passive. A brute-force tool sends guesses to the target's DNS servers, so it is active and must be in scope." },
      { q: "Why does dig ANY return almost nothing?", a: "Many DNS servers now answer ANY queries with a minimal response (RFC 8482) to prevent abuse. Ask for each record type separately instead." },
      { q: "What is a subdomain takeover?", a: "It happens when a DNS record points to a cloud resource that was deleted, and someone else can claim that resource and serve content on the subdomain. The fix is to remove DNS records when services are retired." },
    ],
  },

  "eh-recon/footprinting": {
    plain: [
      "After recon you have lists: names, IPs, documents, technologies. Footprinting is the step where you turn those lists into a picture. What does the client expose to the internet, what software runs it, and which parts look weakest?",
      "It is like a builder walking around a house before a renovation. They note every door and window, the type of locks, which walls look old. They do not break anything yet; they plan where to look closely.",
      "Technology identification is a big part of it. HTTP headers, cookie names, error pages and certificates all give hints. A cookie called JSESSIONID suggests Java. A header saying Server: nginx/1.18.0 names the web server and its version.",
      "Some of this is passive (search engines and Shodan's stored data), and some is active, because you send normal web requests to the client's servers. Active requests need to be in scope. The output is a short attack surface summary the client can read and act on.",
    ],
    deepDive: [
      {
        heading: "Reading technology from normal responses",
        body: "A single HTTP request reveals a lot. The Server header may name the web server and version. X-Powered-By may name the language or framework, such as PHP/8.1 or Express. Session cookie names are strong hints: PHPSESSID (PHP), JSESSIONID (Java), ASP.NET_SessionId (ASP.NET), connect.sid (Node.js Express), laravel_session (Laravel), csrftoken (often Django).\n\nOther clues: the TLS certificate's Subject Alternative Names list other hostnames on the same certificate; default error pages identify the server; robots.txt and sitemap.xml list paths the site owner thinks about; HTML comments and JavaScript file names can reveal frameworks and build tools. Browser extensions like Wappalyzer and the command-line tool whatweb automate this recognition.",
        bullets: ["Server and X-Powered-By headers", "Session cookie names", "Certificate Subject Alternative Names", "Error pages, robots.txt, sitemap.xml", "Script names and HTML comments"],
      },
      {
        heading: "Exposure from public scan data",
        body: "Services like Shodan and Censys scan the whole internet all the time and store what they find: open ports, banners, certificates and screenshots. Searching them for the client's IP ranges or organisation name shows what has been exposed, without you scanning anything. Typical surprises are a remote desktop port, an old database, a forgotten admin panel or a camera.\n\nTreat this data as a lead, not a fact. It may be weeks old, and the service may have moved or closed. You confirm it later with your own authorised scan. The same data is available to attackers, which is why it belongs in the report: \"this is what anyone on the internet can already see about you\".",
      },
      {
        heading: "Building the attack surface map",
        body: "Put every asset in one table: hostname, IP, owner, in scope or not, open services, technology and version, and notes. Then rank where to focus. High-interest items are login pages and single sign-on portals, admin panels, APIs, file upload features, remote access (VPN, RDP, SSH), anything that looks like a test or staging system, and software with old versions.\n\nAlso note what is missing. If a domain has no DMARC record, or a site has no HTTPS redirect, those are findings even before active testing. The map becomes the test plan for scanning and web testing, and it shows the client what you will look at and why.",
        visual: {
          type: "tree",
          title: "An attack surface map for one client",
          root: "example.com exposure",
          children: [
            { label: "Web apps", children: ["www (WordPress)", "app (React + API)", "staging (old build)"] },
            { label: "Remote access", children: ["vpn portal", "SSH on a jump host"] },
            { label: "Email", children: ["Microsoft 365 via MX", "No DMARC record"] },
            { label: "Third parties", children: ["help desk SaaS", "CDN in front of www"] },
            { label: "Unexpected", children: ["Admin panel on port 8080", "Database port in Shodan"] },
          ],
        },
      },
      {
        heading: "Summarising for the client and fixing exposure",
        body: "Clients often do not know their own footprint, so the summary is valuable on its own. Keep it short: how many hosts and services are exposed, which ones look most risky and why, which assets you found that were not in their inventory, and what you will test next. Avoid jargon in the first paragraph; a manager should understand it.\n\nPair every exposure with a defensive step. Remove version numbers from banners (Apache: ServerTokens Prod and ServerSignature Off; nginx: server_tokens off; PHP: expose_php = Off). Put admin panels behind a VPN or an IP allowlist. Shut down or protect staging systems. Keep an asset inventory and run attack surface monitoring, so the client sees new exposure before attackers do.",
        bullets: ["Apache: ServerTokens Prod, ServerSignature Off", "nginx: server_tokens off;", "PHP: expose_php = Off", "Admin panels behind VPN or IP allowlist", "Keep an asset inventory and monitor it"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Passive and active footprinting sources",
        columns: [
          { title: "Passive (no contact)", points: ["Shodan and Censys data", "Search results and archives", "CT logs and DNS data", "Job adverts and docs"] },
          { title: "Active (in scope only)", points: ["HTTP headers with curl", "whatweb fingerprinting", "TLS certificate details", "robots.txt and error pages"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fingerprint a lab web app with a few requests",
        explanation: "Your lab runs DVWA at 192.168.56.102. Step 1: fetch only the headers with curl -I. Step 2: note the Server and X-Powered-By values and the cookie names. Step 3: run whatweb at its gentlest level (one request) for a summary. Step 4: check robots.txt. Step 5: write one line in your attack surface table, for example: Apache 2.4, PHP, PHPSESSID cookie, login page at /login.php.",
        code: {
          lang: "bash",
          code: "T=http://192.168.56.102    # lab target in scope\ncurl -sI \"$T/\" | grep -Ei '^(server|x-powered-by|set-cookie):'\nwhatweb -a 1 \"$T/\"\ncurl -s \"$T/robots.txt\"\n# Record: host, server, language, cookies, interesting paths",
        },
      },
      {
        title: "Read the certificate for extra hostnames",
        explanation: "An in-scope HTTPS site may share a certificate with other names. Step 1: connect with openssl and print the certificate's subject, issuer and Subject Alternative Names. Step 2: the SAN list shows other hosts, for example mail and intranet names. Step 3: add any new names to your list as \"to confirm with the client\", because sharing a certificate does not prove they are in scope. Step 4: note the issuer and the expiry date; an expired or self-signed certificate is a small finding of its own.",
        code: {
          lang: "bash",
          code: "H=www.example.com\necho | openssl s_client -connect \"$H:443\" -servername \"$H\" 2>/dev/null \\\n  | openssl x509 -noout -subject -issuer -enddate -ext subjectAltName",
        },
      },
    ],
    cheatSheet: [
      "curl -sI URL shows response headers such as Server and Set-Cookie",
      "whatweb -a 1 URL fingerprints a site with a single request",
      "PHPSESSID = PHP, JSESSIONID = Java, ASP.NET_SessionId = .NET, connect.sid = Express",
      "openssl s_client plus x509 -ext subjectAltName lists names on a certificate",
      "Shodan and Censys show past exposure without you sending traffic",
      "Hide versions: ServerTokens Prod (Apache), server_tokens off (nginx), expose_php = Off",
      "Rank focus: logins, admin panels, APIs, uploads, remote access, staging",
    ],
    quiz: [
      {
        q: "A site sets a cookie called JSESSIONID. What does that suggest?",
        options: ["A PHP application", "A Java-based application server", "A static site with no backend", "A Python Django app"],
        answer: 1,
        why: "JSESSIONID is the default session cookie of Java servlet containers.",
      },
      {
        q: "Shodan shows port 3389 open on a client IP. What should you do?",
        options: ["Report it as confirmed", "Log in to test it", "Ignore Shodan data", "Treat it as a lead and confirm it with an authorised scan"],
        answer: 3,
        why: "Third-party scan data can be outdated, so you confirm it inside scope before reporting.",
      },
      {
        q: "Which nginx setting hides the version number in the Server header?",
        options: ["server_tokens off;", "hide_version on;", "ServerTokens Prod", "expose_php = Off"],
        answer: 0,
        why: "server_tokens off makes nginx send just \"nginx\" without the version.",
      },
      {
        q: "Why does footprinting with curl and whatweb require scope?",
        options: ["The tools are illegal", "They are too slow", "They send requests to the client's own servers, so they are active", "They need a licence"],
        answer: 2,
        why: "Any traffic to the target makes the activity active, which needs authorization.",
      },
      {
        q: "What is the best first line of a footprinting summary for a client manager?",
        options: ["A full nmap output dump", "A plain statement of how much is exposed and the biggest risks", "A list of tools used", "The CVSS formula"],
        answer: 1,
        why: "Managers need the key exposure and risks first; technical detail follows.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run Juice Shop or DVWA locally and identify its web server, language or framework from headers and cookies alone.",
        hint: "curl -sI shows headers; log in once in the browser and look at the cookie names in developer tools.",
        solution: "curl -sI http://localhost:4280/login.php | grep -Ei 'server|x-powered-by|set-cookie'\n# DVWA: Server: Apache/2.4.x (Debian), Set-Cookie: PHPSESSID=...\n# -> Apache web server, PHP application\ncurl -sI http://localhost:3000/ | head\n# Juice Shop: Node.js Express app (X-Powered-By may be absent; look at\n# the scripts and the Angular front end)",
      },
      {
        level: "medium",
        task: "Create an attack surface table (CSV) for your lab with at least four assets and rank them by interest.",
        hint: "Columns: host, ip, owner, in_scope, services, tech, notes, priority.",
        solution: "host,ip,owner,in_scope,services,tech,notes,priority\ndvwa,192.168.56.102,me,yes,80/http,Apache PHP,login form,high\njuice,127.0.0.1,me,yes,3000/http,Node Angular,API + upload,high\nmeta2,192.168.56.103,me,yes,21 22 80 445...,old Ubuntu,many old services,high\nhost,192.168.56.1,me,no,-,my PC,out of scope,-",
      },
      {
        level: "hard",
        task: "Harden a test nginx container so its responses reveal less, and prove the difference with curl before and after.",
        hint: "Add server_tokens off; to the http block and also hide the default error page details.",
        solution: "docker run -d --name ng -p 127.0.0.1:8081:80 nginx\ncurl -sI http://127.0.0.1:8081/ | grep -i ^server   # nginx/1.x.y\ndocker exec ng sh -c \"sed -i 's/http {/http {\\n    server_tokens off;/' /etc/nginx/nginx.conf && nginx -s reload\"\ncurl -sI http://127.0.0.1:8081/ | grep -i ^server   # nginx\ncurl -s http://127.0.0.1:8081/nope | grep -i nginx  # 404 page no longer shows version\ndocker rm -f ng",
      },
    ],
    faq: [
      { q: "What is the difference between footprinting and reconnaissance?", a: "Recon is collecting information. Footprinting is organising that information into a profile of the target's technology and exposure, which then guides scanning." },
      { q: "Does hiding version numbers make a server secure?", a: "No. It only removes an easy hint; attackers can still test for flaws directly. Patching is the real fix, and hiding versions is a small extra layer." },
      { q: "Is Wappalyzer passive?", a: "It reads the pages your browser already loads, so it adds little traffic, but you are still visiting the target's site. Use it only on sites you are allowed to test or normally browse." },
    ],
  },
};

export default extra;
