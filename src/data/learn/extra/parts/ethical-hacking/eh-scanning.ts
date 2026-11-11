import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "eh-scanning/host-discovery": {
    plain: [
      "Scanning is the first time you knock on the target's doors. A network is like a street of houses (hosts), and each house has 65,535 numbered doors called ports for TCP, and the same again for UDP. A service, such as a web server, waits behind a port, for example port 80 or 443.",
      "nmap first asks \"which houses are lived in?\" This is host discovery. Then it asks \"which doors open?\" This is port scanning. Each answer comes back as a state: open (a service answered), closed (the host answered, but nothing listens there) or filtered (something, usually a firewall, blocked the question).",
      "Scanning is active. It sends real packets to the target, it shows up in logs, and a careless scan can upset fragile devices. That is why you only scan hosts that are in your lab or in a signed scope, and why you save the results as evidence.",
      "In your own lab you can scan as much as you like. Use that freedom to learn what each option does, and watch the traffic in Wireshark at the same time. Seeing the packets makes the port states much easier to understand.",
    ],
    deepDive: [
      {
        heading: "How nmap decides a host is up",
        body: "With -sn, nmap does host discovery only, without a port scan. What it sends depends on where you are and who you are. On a local Ethernet network, run as root, it uses ARP requests: every live machine must answer ARP, even if its firewall drops everything else, so this is very reliable. Against hosts on other networks, a root user's default probes are an ICMP echo request, a TCP SYN to port 443, a TCP ACK to port 80 and an ICMP timestamp request. Without root, nmap can only try TCP connections to ports 80 and 443.\n\nIf a host blocks all of those, nmap reports it as down and skips it. -Pn tells nmap to skip discovery and treat every target as up, which is slower but finds hosts that hide from ping.",
        bullets: ["-sn: discovery only, no port scan", "Local LAN as root: ARP requests", "Remote as root: ICMP echo, SYN 443, ACK 80, ICMP timestamp", "-Pn: assume all hosts are up", "-PS22,3389: add SYN probes to chosen ports"],
      },
      {
        heading: "SYN, connect and UDP scans",
        body: "The default scan for root is the SYN scan (-sS). nmap sends a SYN, the first packet of a TCP handshake. A SYN/ACK reply means open; nmap then sends a RST instead of finishing the handshake. A RST reply means closed. No reply, or certain ICMP unreachable errors, means filtered. Without root, nmap uses a connect scan (-sT), which asks the operating system to complete the full handshake; it is slower and more likely to be logged by the application.\n\nUDP scanning (-sU) is harder because UDP has no handshake. No reply usually means open|filtered (nmap cannot tell). An ICMP port unreachable reply means closed. Many systems limit how many ICMP errors they send per second, so a full UDP scan can take hours; scan the top UDP ports (for example --top-ports 100) instead.",
        visual: {
          type: "sequence",
          title: "A SYN scan of one open and one closed port",
          actors: ["Kali (nmap)", "Lab target"],
          messages: [
            { from: 0, to: 1, label: "SYN to port 22" },
            { from: 1, to: 0, label: "SYN/ACK: port 22 is open" },
            { from: 0, to: 1, label: "RST: handshake never completes" },
            { from: 0, to: 1, label: "SYN to port 23" },
            { from: 1, to: 0, label: "RST: port 23 is closed" },
          ],
        },
      },
      {
        heading: "All six port states",
        body: "nmap uses six states. Open: a service accepts connections. Closed: the host is reachable and replied, but nothing listens. Filtered: no answer or an ICMP error, so a firewall probably dropped the probe. Unfiltered: only from an ACK scan (-sA); the port is reachable but nmap cannot tell if it is open. Open|filtered: nmap got no reply and cannot choose, common in UDP scans. Closed|filtered: rare, from the IP ID idle scan.\n\nThe --reason flag prints why nmap chose each state, for example syn-ack, reset or no-response. That makes your report much stronger, and it helps you spot firewall behaviour: a firewall that sends RST for blocked ports makes them look closed, not filtered.",
        bullets: ["open: syn-ack received", "closed: reset received", "filtered: no-response or ICMP unreachable", "open|filtered: typical for silent UDP ports", "--reason shows the evidence for each state"],
      },
      {
        heading: "Speed, scope safety and output",
        body: "By default nmap scans the 1,000 most common TCP ports. -p- scans all 65,535, and -F only the top 100. Timing templates run from -T0 (very slow) to -T5 (very fast); -T3 is the default and -T4 is fine on a lab network. On real client networks, fragile devices such as old printers or industrial controllers can crash under fast scans, so agree limits in the RoE and use --max-rate if needed.\n\nFeed scope files with -iL and exclusions with --excludefile, so a typo cannot hit the wrong range. -n skips reverse DNS lookups, which is faster and quieter. Always save output: -oA name writes .nmap (human), .gnmap (grep-friendly) and .xml (for tools and reports).",
      },
      {
        heading: "What defenders see and how they respond",
        body: "A port scan is noisy. One source touching many ports or many hosts in a short time is easy to spot in firewall logs, and intrusion detection systems such as Suricata, Snort and Zeek ship with scan detection. A SYN scan leaves many half-open connections that the target never completes. In your lab, run tcpdump or Wireshark on the target side to see exactly what a defender would see.\n\nThe defences are simple. Use a default-deny firewall that only allows the ports a host really needs. Turn off services nobody uses. Separate networks so a scan from one segment cannot reach everything. And alert on scans from inside the network: an internal host scanning its neighbours is a strong sign of compromise.",
        visual: {
          type: "compare",
          title: "Scanner view and defender view",
          columns: [
            { title: "What the tester sees", points: ["Hosts up or down", "Port states with reasons", "Fewer open ports behind a firewall", "Timing and retries"] },
            { title: "What the defender sees", points: ["Many SYNs from one IP", "Half-open connections", "IDS scan alerts", "Firewall deny logs per port"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Choosing an nmap command for the job",
        steps: [
          { label: "Who is alive?", detail: "nmap -sn -iL scope.txt" },
          { label: "Quick look", detail: "nmap -F live hosts" },
          { label: "Full TCP sweep", detail: "nmap -p- --open on interesting hosts" },
          { label: "Top UDP ports", detail: "nmap -sU --top-ports 100" },
          { label: "Save everything", detail: "-oA with a clear name" },
        ],
      },
    ],
    examples: [
      {
        title: "Scan the whole lab, step by step",
        explanation: "Lab: 192.168.56.0/24, with your own PC at .1 and the DHCP server at .100 out of scope. Step 1: discover live hosts and keep only their IPs. Step 2: run a full TCP scan of those hosts, showing only open ports and the reason. Step 3: run a short UDP scan of the top 50 ports. Step 4: everything is saved with -oA, so the report can quote it.",
        code: {
          lang: "bash",
          code: "printf '192.168.56.1\\n192.168.56.100\\n' > out.txt\nsudo nmap -sn -n 192.168.56.0/24 --excludefile out.txt -oA scans/disc\ngrep 'Status: Up' scans/disc.gnmap | awk '{print $2}' > live.txt\n\nsudo nmap -sS -p- --open --reason -n -T4 -iL live.txt -oA scans/tcp-all\nsudo nmap -sU --top-ports 50 -n -iL live.txt -oA scans/udp-top50",
        },
      },
      {
        title: "Why does nmap say the host is down?",
        explanation: "You know a lab VM is running, but nmap -sn from another subnet says 0 hosts up. Step 1: the VM's firewall drops ICMP and the default discovery ports. Step 2: try -Pn to skip discovery and scan ports anyway. Step 3: or add discovery probes to ports you expect, such as SSH or RDP. Step 4: compare the results with --reason. The defender lesson: blocking ping only hides a host from lazy scans, not from careful ones.",
        code: {
          lang: "bash",
          code: "sudo nmap -sn 192.168.57.20                 # Host seems down\nsudo nmap -sn -PS22,80,443,3389 192.168.57.20\nsudo nmap -Pn -p 22,80,443,3389 --reason 192.168.57.20",
        },
      },
    ],
    cheatSheet: [
      "nmap -sn RANGE finds live hosts without port scanning",
      "nmap -Pn skips discovery and treats every target as up",
      "sudo nmap -sS is the default SYN scan; -sT is used without root",
      "-p- scans all 65,535 TCP ports; -F scans the top 100",
      "--open shows only open ports; --reason shows why each state was chosen",
      "-iL scope.txt --excludefile out.txt keeps scans inside the agreed scope",
      "-oA NAME saves .nmap, .gnmap and .xml in one go",
      "Practise freely on your lab; scanme.nmap.org allows light test scans",
    ],
    quiz: [
      {
        q: "In a SYN scan, the target replies to your SYN with a RST. What is the port state?",
        options: ["Open", "Filtered", "Closed", "Open|filtered"],
        answer: 2,
        why: "A RST means the host is reachable but no service listens on that port.",
      },
      {
        q: "Why is ARP host discovery so reliable on a local Ethernet network?",
        options: ["Every live host must answer ARP to communicate on the LAN", "ARP is encrypted", "ARP bypasses the scope file", "ARP uses port 443"],
        answer: 0,
        why: "Hosts cannot work on a LAN without answering ARP, even if they drop ICMP.",
      },
      {
        q: "A UDP port gives no reply at all. How does nmap usually report it?",
        options: ["Closed", "Open", "Unfiltered", "Open|filtered"],
        answer: 3,
        why: "Silence could mean an open service that ignored the probe or a firewall that dropped it.",
      },
      {
        q: "Which flag saves output in normal, grepable and XML formats at once?",
        options: ["-oN", "-oA", "-oX", "-v"],
        answer: 1,
        why: "-oA writes all three main formats using the same base name.",
      },
      {
        q: "What is the best defence against port scans revealing too much?",
        options: ["Changing all services to high ports", "Blocking only ping", "A default-deny firewall and switching off unused services", "Using UDP for everything"],
        answer: 2,
        why: "If only needed ports are reachable, a scan has little to find.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find every live host on your lab network and list only their IP addresses.",
        hint: "Use -sn with grepable output and filter for Status: Up.",
        solution: "sudo nmap -sn -n 192.168.56.0/24 -oG - | awk '/Status: Up/{print $2}'\n# -oG - prints grepable output to the screen",
      },
      {
        level: "medium",
        task: "Scan one lab target with -sS while capturing the packets with tcpdump. Find one open and one closed port in the capture.",
        hint: "Filter tcpdump on the target IP, and scan only two ports so the capture is small.",
        solution: "# terminal 1\nsudo tcpdump -ni eth0 host 192.168.56.103 and tcp\n# terminal 2\nsudo nmap -sS -p 22,23,9999 --reason 192.168.56.103\n# Open port: [S] -> [S.] (SYN/ACK) -> [R] from Kali\n# Closed port: [S] -> [R.] (RST/ACK) from the target",
      },
      {
        level: "hard",
        task: "On a lab target, add a firewall rule that drops traffic to one open port, then show how nmap's state and reason change.",
        hint: "Use iptables on the target (it is your lab VM). Compare --reason before and after, then remove the rule.",
        solution: "# on Kali, before:\nsudo nmap -p 80 --reason 192.168.56.103   # open, syn-ack\n# on the lab target:\nsudo iptables -I INPUT -p tcp --dport 80 -j DROP\n# on Kali, after:\nsudo nmap -p 80 --reason 192.168.56.103   # filtered, no-response\n# with -j REJECT --reject-with tcp-reset it would look closed (reset)\n# on the lab target, clean up:\nsudo iptables -D INPUT -p tcp --dport 80 -j DROP",
      },
    ],
    faq: [
      { q: "Is nmap scanning illegal?", a: "nmap itself is a legal tool used by admins every day. Scanning systems you do not own or have permission to test can break computer misuse laws or contracts, so stick to your lab, practice platforms and signed scopes." },
      { q: "Why does nmap need sudo for a SYN scan?", a: "A SYN scan builds raw packets by hand, which needs root privileges. Without root, nmap falls back to a connect scan through the operating system." },
      { q: "Why is my UDP scan so slow?", a: "UDP has no handshake, so nmap waits for timeouts, and many systems rate-limit the ICMP errors that mark closed ports. Scan only the top UDP ports unless you really need all of them." },
      { q: "What does filtered mean in nmap?", a: "nmap got no answer or an ICMP error, so it cannot tell whether a service is there. Usually a firewall is dropping the probes." },
    ],
  },

  "eh-scanning/service-enum": {
    plain: [
      "Knowing that port 21 is open is a start. Knowing that it runs vsftpd version 2.3.4 with anonymous login allowed is much more useful. Enumeration means asking each open port politely for details: what software, which version, which settings.",
      "Services often introduce themselves. When you connect, many send a short greeting called a banner, like \"220 (vsFTPd 2.3.4)\" or \"SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.10\". nmap's version detection (-sV) goes further: it sends a series of probes and compares the answers with a large database of known services.",
      "nmap also has a scripting engine called NSE. Scripts can read a web page title, list SSH encryption options, show SMB settings, or check whether FTP allows anonymous login. Scripts are grouped into categories, and some are safe while others are intrusive or even harmful, so you choose them deliberately.",
      "Everything you learn here feeds the next step: matching versions to known vulnerabilities. Write down each detail together with the command that produced it, so the evidence is ready for the report.",
    ],
    deepDive: [
      {
        heading: "How version detection works",
        body: "For each open port, nmap first waits a few seconds for a banner (the NULL probe), because many services talk first. If that is not enough, it sends probes from its nmap-service-probes file, starting with the ones most likely for that port, and matches the replies against thousands of patterns. A match can name the product, version, extra info such as the OS, and a CPE (Common Platform Enumeration) name used later for vulnerability lookups.\n\n--version-intensity from 0 to 9 sets how many probes to try; the default is 7. --version-light is 2 and --version-all is 9. A question mark after a service name, such as http?, means nmap is guessing. tcpwrapped means the connection opened and then closed without data, often because a wrapper or firewall only accepts certain clients.",
        bullets: ["NULL probe: listen for a banner first", "Then targeted probes from nmap-service-probes", "Output includes product, version and CPE", "--version-intensity 0-9, default 7", "tcpwrapped: connection closed with no data"],
      },
      {
        heading: "NSE script categories and how to choose",
        body: "NSE scripts belong to categories: auth, broadcast, brute, default, discovery, dos, exploit, external, fuzzer, intrusive, malware, safe, version and vuln. -sC runs the default category, which is useful but, as the nmap documentation warns, includes some scripts considered intrusive. For a cautious first pass, run --script \"default and safe\". Avoid brute, dos, exploit, fuzzer and intrusive unless the RoE clearly allows them; dos scripts can crash services.\n\nAsk before you run: nmap --script-help ftp-anon shows what a script does and its categories. Scripts in external send data to third-party services, which matters if the scope or confidentiality terms forbid that. -A is a shortcut for -O, -sV, -sC and --traceroute, which is convenient in a lab but noisy on a real engagement.",
        visual: {
          type: "compare",
          title: "NSE categories by risk",
          columns: [
            { title: "Usually fine in scope", points: ["safe", "version", "discovery (most scripts)", "default and safe together"] },
            { title: "Check the RoE first", points: ["default (some intrusive)", "auth", "vuln", "external (sends data out)"] },
            { title: "Only with explicit approval", points: ["brute", "intrusive", "exploit", "dos (can crash services)"] },
          ],
        },
      },
      {
        heading: "Enumerating common services",
        body: "Each common service has a few standard questions. FTP (21): does anonymous login work (ftp-anon)? SSH (22): which version and algorithms (ssh2-enum-algos, ssh-hostkey)? HTTP and HTTPS (80, 443, 8080): the title, headers, methods and certificate (http-title, http-headers, http-methods, ssl-cert). SMB (139, 445): OS, signing and shares (smb-os-discovery, smb2-security-mode; smbclient -L //host -N for an anonymous share list). Databases such as MySQL (3306), PostgreSQL (5432) and Redis (6379): are they exposed at all, and do they require a password? SNMP (UDP 161): does it accept a default community string like public?\n\nManual checks complement nmap. nc -nv host 21 shows the raw FTP banner, and curl -sI shows web headers. Comparing manual and automated results catches mistakes.",
        bullets: ["FTP: anonymous login, banner", "SSH: version, algorithms, auth methods", "HTTP(S): title, headers, methods, certificate", "SMB: OS, signing, anonymous shares", "Databases and SNMP: exposed? default credentials?"],
      },
      {
        heading: "Trusting versions and helping defenders",
        body: "Version strings can mislead. Linux distributions backport security fixes: Ubuntu may ship a patched package that still reports the old upstream version, with the patch shown only in the suffix (for example 3ubuntu0.10). Admins can also change banners on purpose. So record the full banner exactly as seen, and treat the version as a strong hint, not proof.\n\nFor defenders, enumeration findings map to clear fixes: disable anonymous FTP or replace FTP with SFTP; require SMB signing and disable SMBv1; never expose database ports to untrusted networks; move SNMP to v3 with authentication; remove unnecessary version details from banners. Defenders can also spot NSE in logs: its HTTP requests carry a default user agent that mentions the Nmap Scripting Engine, and version probes leave unusual entries in service logs.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What to enumerate on common ports",
        root: "Open port",
        children: [
          { label: "21 FTP", children: ["Banner and version", "Anonymous login?"] },
          { label: "22 SSH", children: ["Version", "Algorithms and host key"] },
          { label: "80/443 HTTP(S)", children: ["Title and headers", "Methods", "Certificate"] },
          { label: "445 SMB", children: ["OS and domain", "Signing required?", "Anonymous shares"] },
          { label: "3306/5432 DB", children: ["Should it be exposed?", "Version", "Authentication"] },
          { label: "161/udp SNMP", children: ["Version", "Default community string"] },
        ],
      },
    ],
    examples: [
      {
        title: "Enumerate Metasploitable 2 in the lab",
        explanation: "Metasploitable 2 is your own lab VM at 192.168.56.103. Step 1: run version detection on the ports found earlier, with only default-and-safe scripts. Step 2: read the results: vsftpd 2.3.4 on 21, OpenSSH 4.7p1 on 22, Apache 2.2.8 on 80, MySQL 5.0.51a on 3306, and many more. Step 3: ftp-anon reports whether anonymous FTP is allowed. Step 4: grab one banner by hand to double-check. Step 5: everything goes into scans/ for the report.",
        code: {
          lang: "bash",
          code: "T=192.168.56.103\nPORTS=$(grep -oP '\\d+/open' scans/tcp-all.gnmap | cut -d/ -f1 | sort -un | paste -sd,)\nsudo nmap -sV --script \"default and safe\" -p \"$PORTS\" -oA scans/svc \"$T\"\n\n# check one banner by hand\nnc -nv -w 3 \"$T\" 21\n# 220 (vsFTPd 2.3.4)",
        },
      },
      {
        title: "Enumerate SMB on a lab host safely",
        explanation: "Step 1: run the SMB discovery scripts, which only read information. Step 2: smb-os-discovery shows the OS, computer name and workgroup or domain. Step 3: smb2-security-mode shows whether message signing is required; \"enabled but not required\" is a finding, because unsigned SMB allows relay attacks. Step 4: list shares with a null (anonymous) session. Step 5: recommendations: require signing, disable SMBv1, and remove anonymous share access.",
        code: {
          lang: "bash",
          code: "T=192.168.56.103\nsudo nmap -p 139,445 --script smb-os-discovery,smb2-security-mode \"$T\"\nsmbclient -L \"//$T\" -N        # anonymous share list\n# Look for: Message signing enabled but not required\n# and shares readable without a password",
        },
      },
    ],
    cheatSheet: [
      "nmap -sV detects service and version; add --version-all for stubborn ports",
      "-sC equals --script=default; --script \"default and safe\" is more cautious",
      "nmap --script-help NAME shows what a script does and its categories",
      "Avoid brute, dos, exploit and intrusive scripts unless the RoE allows them",
      "nc -nv HOST PORT grabs a raw banner by hand",
      "smbclient -L //HOST -N lists SMB shares without a password",
      "A version string is a hint: distributions backport fixes without changing it",
    ],
    quiz: [
      {
        q: "What does tcpwrapped mean in nmap output?",
        options: ["The port is closed", "The service is encrypted", "The connection opened but closed without sending data", "nmap crashed"],
        answer: 2,
        why: "Something accepted the TCP handshake and then closed it, so the real service is unknown.",
      },
      {
        q: "Which NSE category should you avoid unless explicitly approved, because it can crash services?",
        options: ["dos", "safe", "version", "discovery"],
        answer: 0,
        why: "Scripts in the dos category test for denial of service and can take services down.",
      },
      {
        q: "nmap reports OpenSSH 8.9p1 Ubuntu-3ubuntu0.10. Why can't you assume every 8.9p1 CVE applies?",
        options: ["SSH cannot have CVEs", "nmap always guesses versions", "Only Windows backports fixes", "Ubuntu backports security fixes and shows the patch level in the suffix"],
        answer: 3,
        why: "The upstream version stays the same while the package suffix shows applied fixes.",
      },
      {
        q: "smb2-security-mode reports \"Message signing enabled but not required\". What do you recommend?",
        options: ["Disable SMB signing", "Require SMB signing on clients and servers", "Open port 445 to the internet", "Switch to SMBv1"],
        answer: 1,
        why: "Requiring signing stops relay and tampering attacks on SMB traffic.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run version detection on your DVWA or Juice Shop container and write down the product and version for each open port.",
        hint: "Scan only the published port on 127.0.0.1.",
        solution: "nmap -sV -p 4280 127.0.0.1      # DVWA\nnmap -sV -p 3000 127.0.0.1      # Juice Shop\n# Example: 4280/tcp open http Apache httpd 2.4.x ((Debian))\n# Juice Shop may show as http with a Node.js / Express hint",
      },
      {
        level: "medium",
        task: "List all NSE scripts for SSH and HTTP that are in the safe category, then run two of them against a lab host.",
        hint: "Scripts live in /usr/share/nmap/scripts; --script-help accepts wildcards.",
        solution: "nmap --script-help \"ssh-* and safe\" | grep -E '^ssh|Categories'\nnmap --script-help \"http-* and safe\" | grep -E '^http' | head\nsudo nmap -p 22,80 --script ssh2-enum-algos,http-title 192.168.56.103",
      },
      {
        level: "hard",
        task: "Write a script that reads an nmap XML file and prints a CSV of host, port, service, product and version for every open port.",
        hint: "Python's xml.etree.ElementTree can parse nmap XML; ports are under host/ports/port.",
        solution: "import sys, xml.etree.ElementTree as ET\nroot = ET.parse(sys.argv[1]).getroot()\nprint(\"host,port,service,product,version\")\nfor h in root.iter(\"host\"):\n    ip = h.find(\"address\").get(\"addr\")\n    for p in h.iter(\"port\"):\n        if p.find(\"state\").get(\"state\") != \"open\": continue\n        s = p.find(\"service\")\n        g = (lambda k: s.get(k, \"\") if s is not None else \"\")\n        print(f\"{ip},{p.get('portid')}/{p.get('protocol')},{g('name')},{g('product')},{g('version')}\")\n# usage: python3 nmap2csv.py scans/svc.xml",
      },
    ],
    faq: [
      { q: "What is the difference between -sV and -A in nmap?", a: "-sV only detects service versions. -A also turns on OS detection, default scripts and traceroute, which gives more information but is noisier." },
      { q: "Are nmap NSE scripts safe to run?", a: "Many are, but not all. Check categories with --script-help, prefer safe and default scripts, and only run intrusive, brute or dos scripts when the rules of engagement allow them." },
      { q: "Why does nmap show a different version than the software really runs?", a: "Banners can be changed by admins, and Linux distributions often backport fixes without changing the upstream version number. Confirm with the package version or the vendor's advisory." },
    ],
  },

  "eh-scanning/vuln-mapping": {
    plain: [
      "You now know that a lab host runs, say, Apache 2.4.49 and vsftpd 2.3.4. The next question is: are these versions known to be vulnerable? Security researchers and vendors publish known flaws in public databases, each with an ID called a CVE, like CVE-2021-41773.",
      "Each CVE usually comes with a CVSS score from 0 to 10. CVSS (Common Vulnerability Scoring System) rates how bad a flaw is in general: can it be used over the network, does the attacker need an account, and what can they read, change or break? 9.0 and above is Critical.",
      "But a matching version is only a lead. The vulnerable feature may be turned off, the distribution may have patched it quietly, or the host may be hidden behind other protections. In the lab you check whether the conditions really apply before you call it a finding.",
      "Finally you sort the findings by real risk, not by score alone. A medium flaw on an internet-facing login page that attackers are known to exploit can matter more than a critical flaw on an isolated test box.",
    ],
    deepDive: [
      {
        heading: "Where to look up a version",
        body: "The main sources are the CVE list at cve.org (the official IDs and descriptions), the US National Vulnerability Database at nvd.nist.gov (adds CVSS scores and CPE product names), vendor advisories (often the most accurate about which versions and settings are affected), and distribution trackers such as the Debian Security Tracker and the Ubuntu CVE tracker (they tell you which package version contains the fix).\n\nOn Kali, searchsploit searches a local copy of Exploit-DB, which tells you whether public exploit code exists for a product; that raises the likelihood of attack. nmap's vulners script uses the CPE from -sV to list CVEs, but it sends the product names to an external service, so check that your scope allows it.",
        bullets: ["cve.org: official CVE IDs", "nvd.nist.gov: CVSS scores and CPE names", "Vendor advisories: exact affected versions and settings", "Distro trackers: which package fixed it", "searchsploit: is there public exploit code?"],
      },
      {
        heading: "Reading a CVSS v3.1 vector",
        body: "A CVSS v3.1 vector looks like CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H. AV is the attack vector: N network, A adjacent network, L local, P physical. AC is attack complexity: L low or H high. PR is the privileges required: N none, L low, H high. UI is user interaction: N none or R required. S is scope: U unchanged or C changed (the impact reaches beyond the vulnerable component). C, I and A are the impact on confidentiality, integrity and availability: H high, L low or N none.\n\nThe vector above scores 9.8, Critical. Bands: 0.1 to 3.9 Low, 4.0 to 6.9 Medium, 7.0 to 8.9 High, 9.0 to 10.0 Critical. CVSS v4.0, released in 2023, adds metrics such as Attack Requirements (AT) and splits impact on the vulnerable system from impact on other systems, so you will see both versions in databases.",
        visual: {
          type: "layers",
          title: "Parts of a CVSS v3.1 base vector",
          layers: [
            { label: "AV: attack vector", detail: "Network, adjacent, local or physical" },
            { label: "AC: attack complexity", detail: "Low or high" },
            { label: "PR and UI", detail: "Privileges needed, user interaction needed" },
            { label: "S: scope", detail: "Does impact reach other components?" },
            { label: "C / I / A", detail: "Impact on confidentiality, integrity, availability" },
          ],
        },
      },
      {
        heading: "Confirming relevance in the lab",
        body: "A version match is a hypothesis. Read the advisory and list the conditions: which versions, which modules or settings, which platform. Then check each one on the lab host. For example, CVE-2021-41773 affects only Apache 2.4.49, and only when the configuration allows access to files outside the document root; a default configuration that denies it is not exposed in the same way. CVE-2024-6387 (regreSSHion) affects OpenSSH 8.5p1 to 9.7p1 on glibc-based Linux, but distributions shipped fixed packages that keep the 8.9p1 or 9.6p1 version label.\n\nCheck package versions with dpkg -l or rpm -q on your lab host, compare with the distro tracker, and look at configuration files. Only when the conditions hold, and the RoE allows it, do you move to a controlled proof in the exploitation phase. Mark anything unconfirmed as \"potential\" in the report.",
        visual: {
          type: "flow",
          title: "From version match to confirmed finding",
          steps: [
            { label: "Version matches", detail: "Banner or -sV says affected" },
            { label: "Read the advisory", detail: "List versions, settings, platform" },
            { label: "Check the package", detail: "dpkg -l or rpm -q vs distro tracker" },
            { label: "Check the config", detail: "Is the vulnerable feature enabled?" },
            { label: "Label it", detail: "Confirmed, potential or false positive" },
          ],
        },
      },
      {
        heading: "Prioritising by real risk",
        body: "CVSS base scores describe the flaw in general, not in the client's network. To rank findings, combine several signals. Exposure: is the service reachable from the internet, or only from an internal segment? Known exploitation: is the CVE in CISA's Known Exploited Vulnerabilities (KEV) catalogue? Likelihood: EPSS (Exploit Prediction Scoring System, from FIRST) estimates the probability of exploitation in the next 30 days. Asset value: does the host hold sensitive data or control other systems? Compensating controls: is there MFA, a WAF or segmentation in front of it?\n\nCVSS also has environmental metrics, which let you adjust a score for a specific network. In the report, state both the base score and your reasoning, so the client understands why a 7.5 might come before a 9.8.",
        bullets: ["Internet-facing beats internal at equal severity", "In CISA KEV: attackers are using it now", "EPSS: probability of exploitation in 30 days", "Asset value and compensating controls", "Explain your ranking in the report"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Two findings, ranked by real risk",
        columns: [
          { title: "Finding A: CVSS 9.8", points: ["Old service on isolated lab segment", "Not reachable from users", "No public exploit known", "Priority: medium"] },
          { title: "Finding B: CVSS 7.5", points: ["Internet-facing VPN portal", "Listed in CISA KEV", "High EPSS score", "Priority: fix first"] },
        ],
      },
    ],
    examples: [
      {
        title: "Map vsftpd 2.3.4 on Metasploitable 2",
        explanation: "Step 1: -sV reported vsftpd 2.3.4 on port 21 of your lab VM. Step 2: searchsploit shows public entries for that exact version. Step 3: the NVD entry for CVE-2011-2523 explains that the vsftpd 2.3.4 download was replaced for a few days in 2011 with a copy containing a backdoor; it is rated critical. Step 4: relevance in the lab: the banner matches and Metasploitable is built to include it, so you record it as likely and plan a controlled confirmation for the exploitation phase. Step 5: the fix is to remove the package and install a clean, current build from a trusted source, or replace FTP with SFTP.",
        code: {
          lang: "bash",
          code: "searchsploit vsftpd 2.3.4\nsearchsploit --nmap scans/svc.xml      # check every -sV result at once\n\n# Read the official record and its CVSS data\ncurl -s 'https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=CVE-2011-2523' \\\n  | jq '.vulnerabilities[0].cve.metrics'",
        },
      },
      {
        title: "A version match that is not a finding",
        explanation: "Step 1: -sV on a lab Ubuntu 22.04 VM shows OpenSSH_8.9p1 Ubuntu-3ubuntu0.10. Step 2: 8.9p1 is inside the range for CVE-2024-6387. Step 3: the Ubuntu CVE tracker lists the fixed package for 22.04 as 1:8.9p1-3ubuntu0.10. Step 4: on the lab host, dpkg confirms that version is installed. Step 5: result: not vulnerable; record it as a checked false positive. Writing down the check saves the client from a needless emergency patch and shows your work.",
        code: {
          lang: "bash",
          code: "# on the lab host\ndpkg -l openssh-server | awk '/^ii/{print $2, $3}'\n# openssh-server 1:8.9p1-3ubuntu0.10\n# Compare with the 'fixed' version on the Ubuntu CVE page for CVE-2024-6387",
        },
      },
    ],
    cheatSheet: [
      "CVSS v3.1 bands: Low 0.1-3.9, Medium 4.0-6.9, High 7.0-8.9, Critical 9.0-10.0",
      "AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H scores 9.8 (Critical)",
      "searchsploit PRODUCT VERSION searches a local Exploit-DB copy",
      "searchsploit --nmap scan.xml checks every detected service version",
      "Distro trackers tell you if a backported package already fixed a CVE",
      "CISA KEV = known exploited; EPSS = chance of exploitation in 30 days",
      "Label each item: confirmed, potential or false positive",
    ],
    quiz: [
      {
        q: "In a CVSS v3.1 vector, what does PR:N mean?",
        options: ["Physical access required", "Patch released: no", "No privileges are required to exploit it", "Probability is none"],
        answer: 2,
        why: "PR is Privileges Required, and N means the attacker needs no account.",
      },
      {
        q: "A score of 7.2 falls into which CVSS v3.1 band?",
        options: ["High", "Medium", "Critical", "Low"],
        answer: 0,
        why: "High covers 7.0 to 8.9.",
      },
      {
        q: "nmap shows an affected version, but the distro tracker lists your installed package as fixed. What is it?",
        options: ["A critical finding", "A zero-day", "A KEV entry", "A false positive from a backported fix"],
        answer: 3,
        why: "Distributions often backport fixes without changing the upstream version label.",
      },
      {
        q: "What does it mean if a CVE is in CISA's KEV catalogue?",
        options: ["It has a CVSS of 10", "There is evidence it is being exploited in the wild", "It only affects government systems", "It cannot be fixed"],
        answer: 1,
        why: "KEV lists vulnerabilities with confirmed real-world exploitation.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look up CVE-2021-41773 on NVD and write down the affected version, the CVSS base score and severity, and the fixed version.",
        hint: "Read the description and the Apache httpd security page linked from the record.",
        solution: "CVE-2021-41773: path traversal in Apache HTTP Server 2.4.49 only.\nNeeds a config that does not deny access outside the document root.\nCVSS v3.1: copy the base score, severity and vector exactly as NVD shows them.\nFirst fix: 2.4.50 (incomplete, see CVE-2021-42013); upgrade to 2.4.51+.",
      },
      {
        level: "medium",
        task: "Run searchsploit against your Metasploitable 2 service scan and list the three services with the most public entries.",
        hint: "searchsploit --nmap reads -sV results from nmap XML.",
        solution: "searchsploit --nmap scans/svc.xml > sploit.txt\n# Count entries per searched product line in the output, e.g.:\ngrep -c 'vsftpd' sploit.txt\ngrep -c 'Samba' sploit.txt\ngrep -c 'UnrealIRCd' sploit.txt\n# More public entries usually means higher likelihood of attack.",
      },
      {
        level: "hard",
        task: "Write a script that takes a list of CVE IDs and prints each one's CVSS v3.1 base score, whether it is in CISA KEV, and its EPSS score.",
        hint: "Use the NVD 2.0 API, the KEV JSON feed and the FIRST EPSS API. Respect NVD rate limits with a sleep.",
        solution: "KEV=$(curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json)\nwhile read -r c; do\n  s=$(curl -s \"https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=$c\" \\\n    | jq -r '.vulnerabilities[0].cve.metrics.cvssMetricV31[0].cvssData.baseScore // \"n/a\"')\n  k=$(echo \"$KEV\" | jq -r --arg c \"$c\" 'any(.vulnerabilities[]; .cveID==$c)')\n  e=$(curl -s \"https://api.first.org/data/v1/epss?cve=$c\" | jq -r '.data[0].epss // \"n/a\"')\n  echo \"$c,cvss=$s,kev=$k,epss=$e\"; sleep 6\ndone < cves.txt",
      },
    ],
    faq: [
      { q: "What is the difference between a CVE and CVSS?", a: "A CVE is an ID for one specific vulnerability. CVSS is a scoring system that rates how severe a vulnerability is, from 0 to 10." },
      { q: "Should I fix every critical CVE first?", a: "Not blindly. Combine the score with exposure, known exploitation (CISA KEV), likelihood (EPSS) and asset value. An exploited high-severity flaw on an internet-facing system often comes first." },
      { q: "What is CVSS 4.0 and do I need to learn it?", a: "CVSS 4.0 is the newer version released in 2023, with extra metrics such as Attack Requirements. Many databases still show v3.1, so learn to read both." },
      { q: "Is a vulnerability scanner result a confirmed finding?", a: "No. Scanners mostly match versions and signatures, so they produce false positives. A tester checks the conditions before reporting it as confirmed." },
    ],
  },
};

export default extra;
