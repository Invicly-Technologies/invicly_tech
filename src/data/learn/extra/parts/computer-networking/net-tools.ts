import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-tools/troubleshooting-method": {
    plain: [
      "When the network \"is broken\", the worst thing you can do is start changing settings at random. Good engineers follow a method. They first ask simple questions: what exactly fails, for whom, since when, and what changed just before? These answers often point to the cause before you touch a single command.",
      "Networks are built in layers, like floors in a building. The cable and Wi-Fi are the ground floor. Above that sit MAC addresses and VLANs, then IP addresses and routes, then ports, and finally the application, such as a website. A problem on a low floor breaks everything above it, so checking floor by floor is a reliable way to find it.",
      "You can start at the bottom (cable first) or at the top (the app first). A smart shortcut is to start in the middle: if you can ping the server by IP, layers 1 to 3 already work, and you only need to look higher. This is called divide and conquer.",
      "Two habits make the method work. Change one thing at a time, then test again, so you know what really fixed it. And write everything down: each test, its result, and the final fix. Your notes become the incident report, and next time they become a runbook (a written recipe for a known problem).",
    ],
    deepDive: [
      {
        heading: "Defining the problem and its scope",
        body: "A vague report like \"the internet is slow\" cannot be tested. Turn it into a precise symptom: \"Since 09:40, users on floor 2 get a timeout when opening the CRM at crm.internal; other sites load fine.\" Now you know the time, the group affected, the target and the exact error.\n\nScope is the most powerful clue. One user failing points to that device or its cable. One whole VLAN failing points to the switch, trunk or DHCP for that VLAN. Everyone failing to one service points to that service or its path. Everyone failing to everything points to the gateway, firewall or internet link. Always ask what changed: a deploy, a firewall rule, a new switch, an expired certificate. Most outages follow a change.",
        bullets: ["What exactly fails, and what is the exact error?", "Who is affected, and who is not?", "Since when, and is it constant or intermittent?", "What changed just before it started?"],
        visual: {
          type: "tree",
          title: "Scope points to the likely culprit",
          root: "Who is affected?",
          children: [
            { label: "One user", children: ["Device settings", "Cable, port or Wi-Fi"] },
            { label: "One VLAN or floor", children: ["Access switch or trunk", "DHCP scope or relay"] },
            { label: "Everyone, one service", children: ["The server or app", "Firewall rule or DNS record"] },
            { label: "Everyone, everything", children: ["Gateway or firewall", "Internet link or upstream DNS"] },
          ],
        },
      },
      {
        heading: "Bottom-up, top-down and divide and conquer",
        body: "Bottom-up starts at the physical layer and climbs. It is thorough and good for new installs or when you suspect hardware: link lights, then VLAN and ARP, then IP and routes, then ports, then the app. Top-down starts at the application: what does the browser or the log say? It is fast when the error message is specific, such as an HTTP 502 or a TLS certificate error.\n\nDivide and conquer starts in the middle, usually with a ping by IP address. If it works, layers 1 to 3 are fine and you go up. If it fails, you go down. Experienced engineers mix the three: they pick the starting point that the symptom suggests, and they fall back to bottom-up when the clues run out.",
        bullets: ["Bottom-up: new hardware, nothing works at all", "Top-down: clear error from the app", "Middle-out: start with ping by IP, then move up or down"],
      },
      {
        heading: "Compare with a working baseline",
        body: "The fastest way to find what is wrong is to compare with something that is right. If laptop A works and laptop B does not, compare their IP, mask, gateway, DNS servers and VLAN side by side: ip addr, ip route, and resolvectl status on Linux, or ipconfig /all on Windows. The difference is usually the cause.\n\nA baseline is a record of normal behaviour taken while things are healthy: typical ping times to the gateway and to key servers, normal interface error counters, the usual traceroute path, normal bandwidth use. Without a baseline, you cannot tell whether 40 ms latency is a problem or just normal for that link. Saving a few command outputs every month costs minutes and saves hours later.",
      },
      {
        heading: "One change at a time, and write it down",
        body: "If you change the DNS server, the gateway and the firewall all at once and things start working, you have learned nothing. Worse, one of those changes may have created a new hidden problem. Make one change, test the original failing case, and record the result. If the change did not help, undo it before trying the next one, so you do not stack unknown changes.\n\nKeep a simple log while you work: time, what you tested, what you saw, and what you changed. At the end, write a short report: symptom, scope, root cause, fix, and how to prevent it. Root cause means the real reason, not the symptom: \"the DHCP pool was full\" rather than \"users had no IP\". These reports turn into runbooks the whole team can use.",
        visual: {
          type: "cycle",
          title: "The troubleshooting loop",
          steps: [
            { label: "Observe", detail: "Collect symptoms and scope" },
            { label: "Hypothesis", detail: "Pick the most likely cause" },
            { label: "Test", detail: "Run one check or make one change" },
            { label: "Record", detail: "Write down the result" },
            { label: "Decide", detail: "Fixed? If not, undo and try the next idea" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to walk the layers",
        columns: [
          { title: "Bottom-up", points: ["Start at cable and link", "Thorough, never skips a layer", "Best for new installs", "Slow if the fault is in the app"] },
          { title: "Top-down", points: ["Start at the app and its error", "Fast with a clear message", "Uses logs and HTTP codes", "Can miss low-level faults"] },
          { title: "Divide and conquer", points: ["Start with ping by IP", "Halves the search space", "Needs some experience", "The usual choice in practice"] },
        ],
      },
    ],
    examples: [
      {
        title: "\"The internet is down\" for one user",
        explanation: "Step 1, scope: only Priya's laptop fails; her neighbour is fine, so the switch and internet link are healthy. Step 2, middle-out: ping 1.1.1.1 works, so layers 1 to 3 are fine. Step 3: ping example.com fails with \"Temporary failure in name resolution\", so the problem is DNS. Step 4, compare with the neighbour: his DNS server is 10.20.40.10, hers is a stale 10.20.40.53 typed by hand last month. Step 5: switch her adapter back to DHCP, test again, and record the root cause (static DNS left over) and the fix.",
        code: {
          lang: "bash",
          code: "ip -br addr               # has an IP? on the right subnet?\nip route | grep default   # gateway present?\nping -c 3 1.1.1.1         # works: routing is fine\nping -c 3 example.com     # fails: name resolution\nresolvectl status         # compare DNS servers with a working laptop",
        },
      },
      {
        title: "A web app is slow for everyone after lunch",
        explanation: "Step 1, define it: since 13:15, every page of the intranet app takes 8 to 10 seconds; other sites are fast. Step 2, ask what changed: a new firewall rule set was pushed at 13:10. Step 3, top-down: curl timing shows time_connect is fast but time_starttransfer is 8 s, so the network path is fine and the server is waiting on something. Step 4: the app log shows each request waiting on the LDAP server, which the new rules now silently drop on TCP 636. Step 5: restore that one rule, re-test, and note in the report that rule changes need a test checklist.",
      },
    ],
    cheatSheet: [
      "Ask first: what fails, who is affected, since when, and what changed?",
      "Ping by IP works but by name fails: suspect DNS, not routing",
      "One user broken: check the device. One VLAN broken: check switch, trunk and DHCP",
      "Start with ping by IP to split layers 1-3 from layers 4-7",
      "Compare a broken host with a working one: IP, mask, gateway, DNS, VLAN",
      "Make one change, re-test the original failure, undo it if it did not help",
      "Log time, test, result and change as you go; it becomes the report",
      "Report the root cause and prevention, not just the symptom",
    ],
    quiz: [
      {
        q: "Users in one VLAN cannot get an IP address, but other VLANs on the same switch are fine. Where should you look first?",
        options: ["The internet link", "The public DNS servers", "The trunk and DHCP scope or relay for that VLAN", "The users' web browsers"],
        answer: 2,
        why: "A fault limited to one VLAN points to what that VLAN alone depends on: its trunk, DHCP scope or relay.",
      },
      {
        q: "You can ping a server by IP. Which layers have you just shown are working?",
        options: ["Physical, data link and network", "Only the application layer", "Only the physical layer", "Transport and application"],
        answer: 0,
        why: "A successful ping by IP needs a working link, layer 2 delivery and IP routing.",
      },
      {
        q: "Why should you change only one thing at a time?",
        options: ["Devices can only accept one change per hour", "So you know which change fixed it and do not stack new problems", "It makes the network faster", "Logs can only record one change"],
        answer: 1,
        why: "With several changes at once you cannot tell which one mattered, and others may cause new faults.",
      },
      {
        q: "What is a baseline in troubleshooting?",
        options: ["The cheapest router model", "The first layer of the OSI model", "A rule that blocks all traffic", "A record of normal behaviour to compare against"],
        answer: 3,
        why: "Knowing normal latency, paths and counters lets you see what is actually abnormal.",
      },
      {
        q: "Which is a root cause rather than a symptom?",
        options: ["Users see 169.254 addresses", "The DHCP pool for VLAN 20 was exhausted", "The website will not load", "Ping times out"],
        answer: 1,
        why: "The exhausted pool explains why the symptoms happened; the others are what users observed.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Rewrite this vague report as a precise problem statement: \"Email is broken.\" Invent realistic details and list the four scoping questions you would ask.",
        hint: "Include what fails, who, since when and the exact error.",
        solution: "Statement: Since 08:30 today, staff on the 3rd floor (VLAN 10)\ncannot send email from Outlook; receiving works. Error:\n\"Cannot connect to smtp.example.com on port 587\".\nQuestions:\n1. What exactly fails and what is the error?\n2. Who is affected and who is not?\n3. Since when, constant or intermittent?\n4. What changed just before it started?",
      },
      {
        level: "medium",
        task: "Write a short Linux checklist script that prints, in bottom-up order, the facts you need to compare a broken host with a working one.",
        hint: "Use ip, ping and resolvectl; print a heading before each block.",
        solution: "#!/usr/bin/env bash\necho \"== Link ==\";    ip -br link\necho \"== Address ==\"; ip -br addr\necho \"== Routes ==\";  ip route\necho \"== Neighbours ==\"; ip neigh\necho \"== Gateway ==\"; ping -c 2 -W 1 \"$(ip route | awk '/default/{print $3; exit}')\"\necho \"== Internet ==\"; ping -c 2 -W 1 1.1.1.1\necho \"== DNS ==\";     resolvectl status | grep -i 'dns servers'\ngetent hosts example.com || echo \"name lookup failed\"",
      },
      {
        level: "hard",
        task: "Write a one-page incident report template and fill it in for this case: the guest Wi-Fi stopped reaching the internet after a firewall change; the fix was re-adding a NAT rule.",
        hint: "Sections: summary, timeline, scope, tests run, root cause, fix, prevention.",
        solution: "Summary: Guest Wi-Fi had no internet 14:05-14:50.\nTimeline: 14:00 firewall change; 14:05 first report;\n  14:30 cause found; 14:50 fixed and verified.\nScope: VLAN 20 guests only; staff unaffected.\nTests: guests got DHCP leases; ping gateway OK;\n  ping 1.1.1.1 failed; firewall showed no NAT for 10.20.20.0/24.\nRoot cause: change removed the source NAT rule for VLAN 20.\nFix: re-added the NAT rule; verified from a guest laptop.\nPrevention: peer review for firewall changes and a\n  post-change test from every VLAN.",
      },
    ],
    faq: [
      { q: "What is the OSI model troubleshooting approach?", a: "It means testing the network one layer at a time, from cable and Wi-Fi up to the application, so you can find the lowest layer that fails. Everything above a broken layer will also fail." },
      { q: "Should I start bottom-up or top-down?", a: "Start where the symptom points. A clear app error suggests top-down; nothing working at all suggests bottom-up; otherwise start with a ping by IP and move up or down from there." },
      { q: "Why does my network work again after a reboot?", a: "A reboot clears caches, renews DHCP leases and resets stuck processes, which hides the real cause. Note what you saw before rebooting so the problem can be found if it returns." },
    ],
  },

  "net-tools/ping-traceroute": {
    plain: [
      "ping is the simplest network test. It sends a small \"are you there?\" message to another computer and waits for the answer. If the answer comes back, the path works both ways. ping also tells you how long the round trip took, in milliseconds. That time is called RTT (round-trip time).",
      "traceroute shows the road, not just the destination. Packets cross many routers on their way, and each router is one hop. traceroute lists those hops in order, with the time to reach each one. When something breaks, it shows roughly where the path stops.",
      "mtr is ping and traceroute combined, running again and again. After a minute it shows, for every hop, how many probes were lost and how much the time jumps around. That makes it the best tool for \"it is slow sometimes\" problems.",
      "One warning: many routers and firewalls treat these test messages as low priority or block them. A missing reply does not always mean traffic is broken. You will learn to read the output carefully so you do not chase false alarms.",
    ],
    deepDive: [
      {
        heading: "What ping really sends",
        body: "ping uses ICMP (Internet Control Message Protocol). It sends an Echo Request (ICMP type 8) and the target answers with an Echo Reply (type 0). Each request carries a sequence number, so ping can spot lost or reordered replies. The ttl value in each reply is the TTL left when it arrived: Linux usually starts at 64 and Windows at 128, so a reply with ttl=57 likely came from a Linux host about 7 hops away.\n\nUseful Linux options: -c sets the count, -i the interval in seconds, -W the timeout per reply, -s the payload size, and -M do forbids fragmentation. With -M do -s 1472 you test a 1500-byte path (1472 data + 8 ICMP + 20 IP header). If that fails but smaller sizes work, the path has a smaller MTU, a classic cause of VPN hangs. On Windows, ping -n sets the count and -f -l 1472 does the same MTU test.",
        bullets: ["Echo Request is type 8, Echo Reply type 0", "Destination Unreachable is type 3, Time Exceeded type 11", "Look at min/avg/max/mdev: mdev shows jitter", "ping -M do -s 1472 tests a full 1500-byte packet"],
      },
      {
        heading: "How traceroute finds each hop",
        body: "Every IP packet has a TTL (time to live) field. Each router lowers it by one and drops the packet when it reaches zero, sending back an ICMP Time Exceeded message from its own address. traceroute uses this on purpose. It sends probes with TTL 1, then 2, then 3, and each router that drops a probe reveals itself.\n\nOn Linux, traceroute sends UDP probes to high ports starting at 33434 by default, and the destination answers with ICMP Port Unreachable, which tells traceroute it has arrived. traceroute -I uses ICMP echo instead, and -T uses TCP SYN (root needed), which passes firewalls that allow only web traffic. Windows tracert uses ICMP. By default it sends 3 probes per hop and gives up after 30 hops (-m changes that). Use -n to skip reverse DNS lookups, which are often the slowest part.",
        visual: {
          type: "sequence",
          title: "traceroute uses TTL to reveal each router",
          actors: ["Your host", "Router 1", "Router 2", "Target"],
          messages: [
            { from: 0, to: 1, label: "Probe with TTL 1" },
            { from: 1, to: 0, label: "ICMP Time Exceeded (hop 1)" },
            { from: 0, to: 2, label: "Probe with TTL 2, passes R1" },
            { from: 2, to: 0, label: "ICMP Time Exceeded (hop 2)" },
            { from: 0, to: 3, label: "Probe with TTL 3 reaches target" },
            { from: 3, to: 0, label: "Port Unreachable or reply: done" },
          ],
        },
      },
      {
        heading: "Reading mtr without fooling yourself",
        body: "mtr shows one row per hop with Loss%, Snt (sent), Last, Avg, Best, Wrst and StDev. The golden rule: loss is real only if it continues to the final hop. Routers forward traffic in fast hardware, but answering probes is done by their slower CPU, and many limit how many ICMP replies they send. So a middle hop showing 30% loss while later hops show 0% is just a busy router ignoring probes, not a problem.\n\nThe same logic applies to latency. A hop that shows 200 ms while the next hops show 20 ms is slow to reply, not slow to forward. Real trouble looks like a step: loss or latency that starts at hop N and stays for every hop after it. Run mtr in both directions if you can, because the return path may be different. For reports, use mtr -rwzc 100 host to get a text summary with AS numbers.",
        visual: {
          type: "compare",
          title: "Real problem or false alarm?",
          columns: [
            { title: "False alarm", points: ["Loss at one middle hop only", "Later hops show 0% loss", "High RTT at one hop, normal after", "Asterisks in the middle, target replies"] },
            { title: "Real problem", points: ["Loss starts at hop N and continues", "Final hop shows the same loss", "RTT jumps and stays high after a hop", "Target never replies on any protocol"] },
          ],
        },
      },
      {
        heading: "When ICMP is filtered",
        body: "Many cloud servers and firewalls drop ICMP echo, so ping fails while the website works perfectly. Before declaring a host down, test the real service: curl for HTTP, nc -zv host 22 for SSH, or traceroute -T -p 443 to trace with TCP to the web port. tcptraceroute and mtr -T -P 443 do the same.\n\nRows of three asterisks (* * *) mean no reply arrived for that TTL. If later hops reply, the router just does not answer probes. If every row after a point is asterisks, the probes may be blocked by a firewall there, or the path is truly broken; test with a different probe type to tell which. Note that blocking all ICMP is a bad idea: ICMP type 3 code 4 (Fragmentation Needed) is how path MTU discovery works, and dropping it causes connections that start fine and then hang.",
        bullets: ["traceroute -T -p 443 host traces with TCP SYN to port 443", "mtr -T -P 443 host does the same continuously", "nc -zv host 443 checks the port without ICMP"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Anatomy of one mtr row",
        layers: [
          { label: "Host", detail: "Router IP or name at this hop" },
          { label: "Loss% and Snt", detail: "Share of probes with no reply, out of how many sent" },
          { label: "Last, Avg", detail: "Latest and average round-trip time in ms" },
          { label: "Best, Wrst", detail: "Fastest and slowest reply seen" },
          { label: "StDev", detail: "How much RTT varies: high means jitter" },
        ],
      },
    ],
    examples: [
      {
        title: "Finding where packets are lost",
        explanation: "Users report video calls breaking up. Step 1: ping the gateway for 100 packets; 0% loss, so the LAN is fine. Step 2: run mtr in report mode to the call server. Hop 3 (ISP edge) shows 0%, hop 4 shows 12% loss, and every hop after it, including the target, also shows around 12%. Step 3: since the loss starts at hop 4 and continues to the end, the fault is real and lies between hops 3 and 4. Step 4: send the mtr report to the ISP with the time and your public IP.",
        code: {
          lang: "bash",
          code: "ping -c 100 -i 0.2 192.168.1.1 | tail -2\nmtr -rwzc 200 calls.example.net\n# HOST                Loss%  Snt   Avg  Wrst\n# 3. isp-edge-1        0.0%  200   8.1  12.0\n# 4. isp-core-7       12.0%  200  14.3  80.2\n# 5. peer-xyz         11.5%  200  15.0  77.9\n# 9. calls.example.net 12.0% 200  21.4  90.1",
        },
      },
      {
        title: "A VPN where SSH connects but then freezes",
        explanation: "SSH over a new VPN logs in, but listing a big directory hangs. That smells like an MTU problem: small packets pass, big ones vanish. Step 1: ping the server with full 1500-byte packets and the do-not-fragment bit set; it fails. Step 2: lower the size until it works; 1392 bytes of payload pass, so the path MTU is 1420 (1392 + 28). Step 3: set the tunnel interface MTU to 1420, or allow ICMP Fragmentation Needed through the firewall so path MTU discovery works.",
        code: {
          lang: "bash",
          code: "ping -c 2 -M do -s 1472 10.0.5.20   # fails: message too long or no reply\nping -c 2 -M do -s 1392 10.0.5.20   # works\n# path MTU = 1392 + 8 (ICMP) + 20 (IP) = 1420\nsudo ip link set dev wg0 mtu 1420",
        },
      },
    ],
    cheatSheet: [
      "ping -c 5 host: five echo requests, then a summary with loss and min/avg/max",
      "ping -M do -s 1472 host: test a 1500-byte path with fragmentation forbidden (Linux)",
      "traceroute -n host: skip reverse DNS so the trace is fast",
      "traceroute -I uses ICMP, -T uses TCP SYN; Linux default is UDP from port 33434",
      "Windows: ping -n 5 host, tracert host, pathping host",
      "mtr -rwzc 100 host: 100-cycle text report with AS numbers",
      "Loss that does not continue to the last hop is ICMP rate limiting, not a fault",
      "Reply ttl near 64 suggests Linux, near 128 suggests Windows",
    ],
    quiz: [
      {
        q: "Which ICMP message does a router send back when a traceroute probe's TTL reaches zero?",
        options: ["Echo Reply (type 0)", "Redirect (type 5)", "Destination Unreachable (type 3)", "Time Exceeded (type 11)"],
        answer: 3,
        why: "Routers that drop a packet because its TTL expired send ICMP Time Exceeded, type 11.",
      },
      {
        q: "mtr shows 25% loss at hop 6 and 0% at hops 7 to 12, including the target. What does this mean?",
        options: ["Hop 6 rate-limits ICMP replies; forwarding is fine", "Hop 6 is dropping a quarter of your traffic", "The target is down", "Your local network is overloaded"],
        answer: 0,
        why: "Traffic through hop 6 reaches later hops without loss, so only its own replies are limited.",
      },
      {
        q: "On Linux, what does traceroute send by default?",
        options: ["ICMP Echo Requests", "TCP SYN to port 80", "UDP probes to high ports starting at 33434", "ARP requests"],
        answer: 2,
        why: "Classic Linux traceroute uses UDP to ports from 33434 upward; -I and -T change that.",
      },
      {
        q: "ping -M do -s 1472 fails but ping -M do -s 1400 works. What have you found?",
        options: ["DNS is broken", "The path MTU is smaller than 1500 bytes", "The host blocks all ICMP", "The TTL is too low"],
        answer: 1,
        why: "1472 bytes of payload makes a 1500-byte packet; failure with fragmentation forbidden means a smaller MTU somewhere.",
      },
      {
        q: "A cloud server does not answer ping, but its website loads. What is the best next test?",
        options: ["Reboot the server", "Increase the ping count to 1000", "Assume the network is broken", "Test the service directly, for example traceroute -T -p 443 or curl"],
        answer: 3,
        why: "Many hosts drop ICMP, so test with the protocol and port the service actually uses.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Ping your gateway and a public IP 20 times each. Write down the loss and the average RTT, and explain what the difference between them tells you.",
        hint: "Find your gateway with ip route; read the summary line at the end.",
        solution: "ip route | grep default          # e.g. via 192.168.1.1\nping -c 20 192.168.1.1 | tail -2  # ~1-3 ms, 0% loss\nping -c 20 1.1.1.1 | tail -2      # ~10-30 ms\n# The gateway RTT is your LAN or Wi-Fi cost.\n# The extra time to 1.1.1.1 is your ISP and internet path.",
      },
      {
        level: "medium",
        task: "Trace the path to a website three ways (UDP, ICMP, TCP 443) and compare where each one stops or shows asterisks.",
        hint: "TCP traceroute needs sudo on Linux.",
        solution: "traceroute -n example.com\ntraceroute -n -I example.com\nsudo traceroute -n -T -p 443 example.com\n# Often UDP or ICMP traces end in * * * near the target,\n# while the TCP 443 trace reaches it, because the\n# firewall in front only allows web traffic.",
      },
      {
        level: "hard",
        task: "Find the path MTU to a host with a small bash loop that lowers the ping payload until a do-not-fragment ping succeeds.",
        hint: "Start at 1472 and step down; add 28 bytes for the headers.",
        solution: "host=${1:-1.1.1.1}\nfor s in $(seq 1472 -8 1200); do\n  if ping -c 1 -W 1 -M do -s \"$s\" \"$host\" >/dev/null 2>&1; then\n    echo \"Largest payload $s, path MTU $((s + 28))\"\n    exit 0\n  fi\ndone\necho \"No size between 1200 and 1472 worked\"",
      },
    ],
    faq: [
      { q: "Why does traceroute show * * * for some hops?", a: "That router did not answer the probe in time, usually because it drops or rate-limits ICMP replies. If later hops answer, traffic is passing through it fine." },
      { q: "What is a good ping time?", a: "On a wired LAN, under 1 to 2 ms; on Wi-Fi, a few ms; across a country, 20 to 60 ms. Steady times matter as much as low times, because jitter hurts voice and video." },
      { q: "What is the difference between traceroute and tracert?", a: "tracert is the Windows tool and uses ICMP echo probes. Linux traceroute uses UDP probes by default but can use ICMP with -I or TCP with -T." },
      { q: "Is it safe to block ping on my server?", a: "Blocking ICMP echo is common and mostly harmless, but do not block all ICMP. Messages such as Fragmentation Needed and Packet Too Big are needed for path MTU discovery." },
    ],
  },

  "net-tools/dns-tools": {
    plain: [
      "DNS turns names like example.com into IP addresses. When a website \"cannot be found\", DNS is often the reason. The tools dig and nslookup let you ask DNS servers questions directly and see their exact answers, instead of guessing from a browser error.",
      "There are two kinds of DNS servers to keep apart. A resolver is the helper your computer asks; it does the searching and remembers (caches) answers. An authoritative server is the official source for one domain. A problem can sit in either one, and dig lets you ask each of them separately.",
      "Every answer comes with a status. NOERROR means the question was answered. NXDOMAIN means the name does not exist. SERVFAIL means the resolver tried but could not get a good answer. Reading this status is the first step of every DNS check.",
      "Your own computer also has a DNS setup: which resolvers it uses, a local file of names (/etc/hosts), and sometimes its own small cache. Many \"DNS problems\" are really a wrong setting on the client, so checking it is part of the job.",
    ],
    deepDive: [
      {
        heading: "Reading dig output",
        body: "dig prints a header, then sections. The header line shows status (NOERROR, NXDOMAIN, SERVFAIL, REFUSED) and flags. qr means this is a response, rd means recursion was asked for, ra means the server offers recursion, aa means the answer is authoritative (it came from the zone owner, not a cache), and ad means DNSSEC validation succeeded.\n\nThe ANSWER section holds records in the form name, TTL, class, type, data. The TTL is in seconds; from a resolver it counts down as the cached copy ages, so asking twice shows a smaller number. The AUTHORITY section lists name servers or, for a missing name, the SOA record. At the bottom, SERVER shows who actually answered and Query time shows how long it took, a quick check on a slow resolver.",
        bullets: ["+short prints only the data", "+noall +answer prints only the answer section", "-x 8.8.8.8 does a reverse (PTR) lookup", "+tcp forces TCP, useful for large answers"],
      },
      {
        heading: "Asking the right server",
        body: "By default dig asks the resolver from your system configuration. Adding @server sends the question elsewhere, which is how you isolate the fault. If dig example.com fails but dig @1.1.1.1 example.com works, your local resolver is the problem. If both fail, look at the domain itself.\n\nTo see the source of truth, find the zone's name servers with dig NS example.com +short, then ask one of them directly with dig @ns1.example.com example.com. Add +norecurse so the server answers only from its own data. If the authoritative answer is right but resolvers show the old value, you are seeing caching: they will update when the old record's TTL runs out. Lowering the TTL a day before a planned change makes switches faster.",
        visual: {
          type: "flow",
          title: "Where does the wrong answer come from?",
          steps: [
            { label: "Client lookup", detail: "getent hosts name uses /etc/hosts and the resolver" },
            { label: "Local resolver", detail: "dig name: what the system resolver says" },
            { label: "Public resolver", detail: "dig @1.1.1.1 name: an independent cache" },
            { label: "Authoritative", detail: "dig @ns1 name +norecurse: the truth" },
            { label: "Conclusion", detail: "First place the answer goes wrong is the fault" },
          ],
        },
      },
      {
        heading: "Following the delegation with +trace",
        body: "dig +trace ignores your resolver and walks the tree itself: it asks a root server, which refers it to the servers for .com, which refer it to the domain's name servers, which give the final answer. You see every referral, so a broken step stands out.\n\nCommon findings: the parent zone (the registrar's NS records) points to name servers that no longer host the zone, called lame delegation; one of several name servers has an old copy of the zone (compare the SOA serial with dig @each-server example.com SOA +short); or DNSSEC records at the parent do not match the zone's keys, which makes validating resolvers return SERVFAIL. For DNSSEC, dig +dnssec shows signatures, and comparing with dig +cd (checking disabled) tells you if validation is the cause.",
        visual: {
          type: "sequence",
          title: "What dig +trace walks through",
          actors: ["dig", "Root server", ".com servers", "example.com NS"],
          messages: [
            { from: 0, to: 1, label: "Who handles example.com?" },
            { from: 1, to: 0, label: "Ask the .com servers (referral)" },
            { from: 0, to: 2, label: "Who handles example.com?" },
            { from: 2, to: 0, label: "Ask ns1.example.com (referral)" },
            { from: 0, to: 3, label: "A record for example.com?" },
            { from: 3, to: 0, label: "Answer with aa flag set" },
          ],
        },
      },
      {
        heading: "Checking the client's resolver setup",
        body: "On most modern Linux systems, systemd-resolved runs a local stub resolver at 127.0.0.53, and /etc/resolv.conf just points to it. So reading resolv.conf shows nameserver 127.0.0.53, not your real DNS servers. Use resolvectl status to see the real upstream servers per interface, resolvectl query name to test through it, and resolvectl flush-caches to clear its cache.\n\nRemember that dig and nslookup talk DNS directly and skip /etc/hosts. Normal programs use the system library, which follows /etc/nsswitch.conf (usually files first, then dns). So a stale line in /etc/hosts can break a browser while dig looks perfect. getent hosts name tests the same path real programs use. On Windows, ipconfig /all shows DNS servers and ipconfig /flushdns clears the cache; on macOS, scutil --dns shows the resolver setup.",
        bullets: ["resolvectl status: real DNS servers per link", "getent hosts name: lookup as applications do it", "DNS uses UDP and TCP port 53; DoT uses TCP 853; DoH uses 443"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What the response code tells you",
        root: "dig status",
        children: [
          { label: "NOERROR with answer", children: ["Name resolves", "Check the data is the right IP"] },
          { label: "NOERROR, no answer", children: ["Name exists, not this type", "Called NODATA, e.g. no AAAA"] },
          { label: "NXDOMAIN", children: ["Name does not exist", "Typo, or record never created"] },
          { label: "SERVFAIL", children: ["Resolver could not get a valid answer", "Broken delegation or DNSSEC"] },
          { label: "REFUSED", children: ["Server will not answer you", "Not authoritative, or recursion denied"] },
        ],
      },
    ],
    examples: [
      {
        title: "A new record works for you but not for your colleague",
        explanation: "You changed app.example.com from 203.0.113.10 to 203.0.113.50. Step 1: ask the authoritative server; it returns .50 with the aa flag, so the zone is correct. Step 2: ask your colleague's resolver; it returns .10 with a TTL of 2900 seconds. Step 3: that is the old answer still cached, and it will expire in about 48 minutes. Step 4: either wait, flush that resolver if you control it, or next time lower the TTL to 300 a day before the change.",
        code: {
          lang: "bash",
          code: "dig NS example.com +short\ndig @ns1.example.com app.example.com A +norecurse +noall +answer\n# app.example.com. 3600 IN A 203.0.113.50\ndig @10.0.0.53 app.example.com A +noall +answer\n# app.example.com. 2900 IN A 203.0.113.10   (cached old value)",
        },
      },
      {
        title: "Browser fails, dig works",
        explanation: "On a developer laptop, the browser cannot open api.internal, yet dig api.internal returns the right IP. Step 1: test the way applications resolve with getent hosts api.internal; it returns 127.0.0.1. Step 2: grep /etc/hosts and find an old line from a local test. Step 3: remove the line and run getent again. The lesson: dig skips /etc/hosts, so always confirm with getent hosts.",
        code: {
          lang: "bash",
          code: "dig +short api.internal        # 10.20.40.25 (correct)\ngetent hosts api.internal      # 127.0.0.1 api.internal (wrong)\ngrep api.internal /etc/hosts   # stale test entry\nsudo sed -i '/api.internal/d' /etc/hosts\ngetent hosts api.internal      # 10.20.40.25",
        },
      },
    ],
    cheatSheet: [
      "dig name A +short: just the IPv4 addresses",
      "dig @1.1.1.1 name: ask a specific resolver to bypass your local one",
      "dig name MX, TXT, NS, SOA, AAAA, CNAME: ask for a specific record type",
      "dig -x 192.0.2.1: reverse lookup (PTR record)",
      "dig +trace name: follow referrals from the root down",
      "nslookup name 8.8.8.8: quick query of a given server (works on Windows too)",
      "resolvectl status shows real upstream servers; resolv.conf may only show 127.0.0.53",
      "getent hosts name resolves like applications do, including /etc/hosts",
    ],
    quiz: [
      {
        q: "What does the aa flag in a dig response mean?",
        options: ["The answer came from an authoritative server for the zone", "The answer was encrypted", "The answer has an AAAA record", "The resolver used TCP"],
        answer: 0,
        why: "aa (authoritative answer) is set only by a server that owns the zone data.",
      },
      {
        q: "dig example.com fails with SERVFAIL, but dig +cd example.com works. What is the likely cause?",
        options: ["A typo in the name", "The server refuses your IP", "The /etc/hosts file", "A DNSSEC validation failure"],
        answer: 3,
        why: "+cd disables DNSSEC checking; if it then works, validation was failing.",
      },
      {
        q: "/etc/resolv.conf shows only nameserver 127.0.0.53. What does that mean?",
        options: ["DNS is disabled", "The system uses the systemd-resolved local stub; check resolvectl status for real servers", "The machine is its own authoritative server", "All lookups go to Google"],
        answer: 1,
        why: "127.0.0.53 is systemd-resolved's stub; it forwards to the upstream servers shown by resolvectl.",
      },
      {
        q: "A colleague still gets the old IP an hour after you changed a record. What most likely explains it?",
        options: ["The record was never saved", "dig is broken", "Their resolver cached the old answer and its TTL has not expired", "DNS updates take exactly 48 hours"],
        answer: 2,
        why: "Resolvers keep cached records until the TTL runs out, so changes appear gradually.",
      },
      {
        q: "Why can dig return the right IP while the browser uses the wrong one?",
        options: ["dig asks DNS directly and skips /etc/hosts, which the browser's lookup uses", "Browsers do not use DNS", "dig only works for IPv6", "The browser uses port 853"],
        answer: 0,
        why: "Applications use the system resolver, which checks /etc/hosts first per nsswitch.conf.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Look up the A, AAAA, MX and NS records for a domain you use, printing only the data.",
        hint: "Use +short and the record type after the name.",
        solution: "for t in A AAAA MX NS; do\n  echo \"== $t\"\n  dig example.com $t +short\ndone",
      },
      {
        level: "medium",
        task: "Check that all of a domain's name servers serve the same zone version by comparing their SOA serial numbers.",
        hint: "Get the NS list, then ask each one for SOA +short; the third field is the serial.",
        solution: "zone=example.com\nfor ns in $(dig NS \"$zone\" +short); do\n  serial=$(dig @\"$ns\" \"$zone\" SOA +short +norecurse | awk '{print $3}')\n  echo \"$ns $serial\"\ndone\n# Different serials mean a secondary has not synced yet.",
      },
      {
        level: "hard",
        task: "Write a small script that, for one name, prints the answer from the system lookup, the local resolver, a public resolver and the authoritative server, so a mismatch is obvious.",
        hint: "Use getent, dig, dig @1.1.1.1 and dig @first-NS +norecurse.",
        solution: "n=${1:?name}; zone=${2:?zone}\nns=$(dig NS \"$zone\" +short | head -1)\necho \"system:  $(getent hosts \"$n\" | awk '{print $1}')\"\necho \"local:   $(dig +short \"$n\" | tail -1)\"\necho \"public:  $(dig @1.1.1.1 +short \"$n\" | tail -1)\"\necho \"auth:    $(dig @\"$ns\" +short +norecurse \"$n\" | tail -1)\"",
      },
    ],
    faq: [
      { q: "Should I use dig or nslookup?", a: "dig gives clearer, more complete output and is the usual choice on Linux and macOS. nslookup is installed on Windows by default and is fine for quick checks." },
      { q: "How do I flush my DNS cache?", a: "On Linux with systemd-resolved, run resolvectl flush-caches. On Windows, run ipconfig /flushdns. On macOS, run sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder." },
      { q: "Why does DNS propagation take so long?", a: "Nothing is really pushed out. Each resolver keeps its cached copy until the record's TTL expires, so a 24-hour TTL can mean up to a day of old answers." },
      { q: "Does DNS use UDP or TCP?", a: "Both on port 53. Most queries use UDP; TCP is used for large answers, zone transfers and as a fallback when a UDP reply is truncated." },
    ],
  },

  "net-tools/host-tools": {
    plain: [
      "When a server or laptop has network trouble, the first place to look is the machine itself. On Linux, a few commands tell you almost everything: which network cards exist, which IP addresses they have, where traffic is sent, and which programs are waiting for connections.",
      "ip shows and changes interfaces, addresses and routes. ss lists sockets, which are the open connections and listening ports, along with the program that owns each one. Together they answer \"does this machine have the right address and route?\" and \"is my service actually listening?\"",
      "curl talks to web services the way a browser does, but shows every detail: the request, the response headers, the status code and how long each stage took. It is the standard way to test an API or website from the command line.",
      "nmap checks which ports are open on a machine from the outside, like a visitor knocking on every door. It is great for checking your own firewall, but scanning systems you do not own or have no permission to test can be illegal, so only use it on your own hosts.",
    ],
    deepDive: [
      {
        heading: "ip: interfaces, addresses, routes and neighbours",
        body: "ip comes from the iproute2 package and replaces ifconfig, route and arp. Its objects are link (the interface itself), addr (IP addresses), route (the routing table) and neigh (the ARP and IPv6 neighbour cache). Add -br for short tables and -c for colour.\n\nip -br link shows each interface as UP or DOWN. ip -s link shows packet and error counters; rising errors or drops hint at a bad cable or an overloaded card. ip route get 10.1.2.3 is the most useful single command: it asks the kernel which route, interface and source address it would use for that destination. ip neigh shows MAC addresses learned for local IPs; FAILED or INCOMPLETE for the gateway means layer 2 cannot reach it.\n\nChanges made with ip are temporary and vanish on reboot. Permanent settings belong in NetworkManager (nmcli), netplan or systemd-networkd, depending on the distribution.",
        bullets: ["sudo ip addr add 10.0.0.5/24 dev eth0", "sudo ip route add 10.9.0.0/16 via 10.0.0.1", "sudo ip link set eth0 up", "ip -6 route shows IPv6 routes"],
      },
      {
        heading: "ss: who is listening and who is connected",
        body: "ss replaces netstat and reads socket information straight from the kernel, so it is fast even with thousands of connections. The common flags are -t (TCP), -u (UDP), -l (listening only), -n (numbers, no name lookups), -p (owning process, needs sudo for other users' processes) and -a (all states).\n\nThe Local Address column matters most. 0.0.0.0:8080 or [::]:8080 means the service accepts connections on every interface. 127.0.0.1:8080 means only local programs can connect, a very common reason a service \"works on the server but not from outside\". You can filter by state and port: ss -tn state established '( dport = :443 )'. ss -s prints a summary of sockets per state; thousands of TIME-WAIT or SYN-RECV sockets point to connection churn or a SYN flood. ss -ti shows TCP internals such as RTT and retransmits for each connection.",
        visual: {
          type: "compare",
          title: "What the listen address means",
          columns: [
            { title: "127.0.0.1:8080", points: ["Loopback only", "Reachable from the same host", "Safe default for dev servers", "Remote clients get connection refused"] },
            { title: "0.0.0.0:8080", points: ["All IPv4 interfaces", "Reachable from the network", "Firewall must allow the port", "Typical for real services"] },
            { title: "10.0.0.5:8080", points: ["One specific address", "Only via that interface", "Used on multi-homed hosts", "Fails if that IP is removed"] },
          ],
        },
      },
      {
        heading: "curl: testing the application layer",
        body: "curl -v shows the whole conversation: DNS result, TCP connect, TLS handshake and certificate, request headers and response headers. curl -I sends a HEAD request to see only headers; curl -L follows redirects; -H adds a header; -k skips certificate checks (for testing only).\n\nTwo options solve tricky cases. --resolve name:443:10.0.0.7 sends the request to a chosen IP while keeping the real host name for TLS and the Host header, so you can test one backend behind a load balancer, or a new server before DNS changes. -w prints timings: time_namelookup (DNS), time_connect (TCP done), time_appconnect (TLS done), time_starttransfer (first byte) and time_total. Each one is cumulative from the start, so subtract to get each stage. Set --connect-timeout and --max-time in scripts so a dead host does not hang them.",
        visual: {
          type: "flow",
          title: "Where curl -w timings are measured",
          steps: [
            { label: "time_namelookup", detail: "DNS answer received" },
            { label: "time_connect", detail: "TCP handshake complete" },
            { label: "time_appconnect", detail: "TLS handshake complete" },
            { label: "time_starttransfer", detail: "First byte of the response" },
            { label: "time_total", detail: "Whole response received" },
          ],
        },
      },
      {
        heading: "nmap: seeing your host from outside",
        body: "ss shows what listens; nmap shows what is reachable through firewalls. With root, the default scan is a SYN scan (-sS): it sends a SYN and reads the reply without finishing the handshake. Without root it uses a full connect scan (-sT). By default it scans the 1000 most common TCP ports; -p 22,80,443 picks ports and -p- scans all 65535.\n\nnmap reports each port as open (a service answered), closed (the host replied with a reset, so nothing listens), or filtered (no reply or an ICMP error, so a firewall drops it). Filtered versus closed tells you whether a firewall or the service is the problem. -sV probes for service versions, -sU scans UDP (slow), -sn does host discovery only, and -Pn skips discovery for hosts that ignore ping. Always get written permission before scanning anything you do not own.",
        bullets: ["open: something accepted the connection", "closed: host reachable, nothing listening", "filtered: a firewall dropped or rejected the probe"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "\"My service is not reachable\" checklist",
        steps: [
          { label: "Is it running?", detail: "systemctl status app" },
          { label: "Is it listening?", detail: "ss -tlnp | grep 8080" },
          { label: "On which address?", detail: "127.0.0.1 or 0.0.0.0" },
          { label: "Local test", detail: "curl -v http://127.0.0.1:8080/" },
          { label: "Firewall", detail: "nft list ruleset or ufw status" },
          { label: "Remote test", detail: "nc -zv host 8080 or nmap -p 8080 host" },
        ],
      },
    ],
    examples: [
      {
        title: "A new API works on the server but not from your laptop",
        explanation: "Step 1: ss shows the process listening on 127.0.0.1:8000, so it only accepts local connections. Step 2: change the app to bind to 0.0.0.0 and restart. Step 3: ss now shows 0.0.0.0:8000. Step 4: from the laptop, nmap reports 8000/tcp filtered, meaning the host firewall still drops it. Step 5: allow the port in the firewall; nmap now says open and curl returns 200.",
        code: {
          lang: "bash",
          code: "sudo ss -tlnp | grep 8000\n# LISTEN 0 4096 127.0.0.1:8000 0.0.0.0:* users:((\"uvicorn\",pid=812,fd=6))\n# fix: start with --host 0.0.0.0, then:\nsudo ss -tlnp | grep 8000      # 0.0.0.0:8000\nnmap -Pn -p 8000 10.0.0.5      # from laptop: filtered\nsudo ufw allow 8000/tcp\nnmap -Pn -p 8000 10.0.0.5      # open\ncurl -s -o /dev/null -w '%{http_code}\\n' http://10.0.0.5:8000/health",
        },
      },
      {
        title: "Testing one backend behind a load balancer",
        explanation: "Users see errors only sometimes, so one of three backends may be bad. Step 1: find the backend IPs from the load balancer config. Step 2: send the same HTTPS request to each one with --resolve, which keeps the real host name for TLS and routing. Step 3: compare status codes and timings. The backend that returns 502 or takes far longer is the culprit.",
        code: {
          lang: "bash",
          code: "for ip in 10.0.10.11 10.0.10.12 10.0.10.13; do\n  curl -s -o /dev/null --max-time 5 \\\n    --resolve shop.example.com:443:$ip \\\n    -w \"$ip %{http_code} connect=%{time_connect} total=%{time_total}\\n\" \\\n    https://shop.example.com/health\ndone",
        },
      },
    ],
    cheatSheet: [
      "ip -br addr / ip -br link: one-line view of addresses and link state",
      "ip route get 8.8.8.8: which route, interface and source IP the kernel would use",
      "ip neigh: ARP cache; FAILED for the gateway means a layer 2 problem",
      "ss -tlnp: TCP listeners with process; ss -s: socket counts per state",
      "curl -v URL: full request, response headers and TLS details",
      "curl --resolve host:443:IP URL: hit a chosen server but keep the real host name",
      "nmap -Pn -p 22,80,443 host: check ports even if the host ignores ping",
      "nmap states: open (listening), closed (reset), filtered (firewall)",
    ],
    quiz: [
      {
        q: "Which command shows the route, interface and source address the kernel would use to reach 10.1.2.3?",
        options: ["ip neigh show 10.1.2.3", "ss -tn dst 10.1.2.3", "ip route get 10.1.2.3", "ip -s link"],
        answer: 2,
        why: "ip route get performs a real route lookup for that destination and prints the result.",
      },
      {
        q: "nmap reports a port as filtered. What does that usually mean?",
        options: ["The service is running normally", "A firewall dropped or rejected the probe", "Nothing is listening and the host sent a reset", "The port number is invalid"],
        answer: 1,
        why: "Filtered means nmap got no useful reply, typically because a firewall is in the way.",
      },
      {
        q: "ss shows a service on 127.0.0.1:5432. What happens when another host connects to port 5432?",
        options: ["It connects normally", "It is redirected to port 80", "It works only over IPv6", "It fails, because the service only accepts loopback connections"],
        answer: 3,
        why: "A socket bound to 127.0.0.1 is reachable only from the same machine.",
      },
      {
        q: "In curl -w output, time_connect is 0.02 s and time_starttransfer is 3.1 s. Where is most of the delay?",
        options: ["In the server, after the connection and handshakes were done", "In DNS resolution", "In the TCP handshake", "In downloading a huge body"],
        answer: 0,
        why: "Connecting was fast; the wait until the first byte is server or backend processing time (plus TLS, if any).",
      },
      {
        q: "Which ss options list listening TCP sockets with numeric ports and owning processes?",
        options: ["ss -ua", "ss -tlnp", "ss -s", "ss -x"],
        answer: 1,
        why: "-t TCP, -l listening, -n numeric, -p process.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every TCP and UDP port your machine is listening on, and for each one say whether it is reachable from the network or only from the machine itself.",
        hint: "Look at the Local Address column for 127.0.0.1, ::1, 0.0.0.0 or [::].",
        solution: "sudo ss -tulpn\n# 127.0.0.1:631 or [::1]:631   -> local only (e.g. cupsd)\n# 0.0.0.0:22 or [::]:22        -> all interfaces (sshd)\n# 127.0.0.53%lo:53             -> local DNS stub\n# Anything on 0.0.0.0 or [::] can be reached if the firewall allows it.",
      },
      {
        level: "medium",
        task: "Measure DNS, TCP connect, TLS and server time separately for an HTTPS site, printing each stage on its own line.",
        hint: "curl -w values are cumulative; put the format in a file with -w @file or compute differences.",
        solution: "cat > fmt.txt <<'EOF'\ndns      %{time_namelookup}\\n\nconnect  %{time_connect}\\n\ntls      %{time_appconnect}\\n\nttfb     %{time_starttransfer}\\n\ntotal    %{time_total}\\n\nEOF\ncurl -s -o /dev/null -w @fmt.txt https://example.com\n# Stage times are differences, e.g. TLS = tls - connect.",
      },
      {
        level: "hard",
        task: "On a VM you own, compare what ss says is listening with what nmap sees from another machine, and explain every difference.",
        hint: "Run ss on the VM and nmap -Pn -p- from outside; differences come from loopback binding and firewall rules.",
        solution: "# On the VM\nsudo ss -tlnp | awk 'NR>1{print $4}' | sort -u\n# From another host you own\nsudo nmap -Pn -p- --min-rate 1000 10.0.0.5\n# Listening but not seen: bound to 127.0.0.1, or 'filtered' by firewall.\n# Seen as closed: host reachable, nothing listening.\n# Seen open but not in ss: port forwarded by NAT or Docker (iptables DNAT).",
      },
    ],
    faq: [
      { q: "Is ifconfig deprecated?", a: "Yes, on Linux ifconfig, route, arp and netstat come from the old net-tools package and are no longer installed on many distributions. Use ip and ss from iproute2 instead." },
      { q: "Is it legal to use nmap?", a: "Scanning your own systems, or systems you have written permission to test, is normal practice. Scanning other people's networks without permission can break laws and terms of service in many countries." },
      { q: "What is the difference between netstat and ss?", a: "Both list sockets, but ss reads them directly from the kernel and is faster with many connections. ss -tulpn gives the same view as the old netstat -tulpn." },
      { q: "How do I see the response headers of a website?", a: "Run curl -I https://site to send a HEAD request, or curl -sv https://site -o /dev/null to see headers from a normal GET request." },
    ],
  },

  "net-tools/tcpdump": {
    plain: [
      "Sometimes logs and error messages are not enough, and you need to see the actual packets. tcpdump is a command-line tool that records the traffic on a network card. It runs almost everywhere, including servers with no screen, so it is the go-to tool when you need proof of what really happened.",
      "A busy server sends thousands of packets per second. If you record everything, you will drown. tcpdump lets you write a filter, a short rule like \"only traffic to port 443 from this IP\", so you catch just the conversation you care about.",
      "You can watch packets live in the terminal, or save them to a file (a pcap file) and open it later in Wireshark, which shows everything in a friendly window. A common pattern is: capture with tcpdump on the server, copy the file, analyse it on your laptop.",
      "Captures can contain passwords, cookies and personal data, so treat them as secrets. Capturing also needs admin rights. Only capture on networks you are responsible for, and delete files you no longer need.",
    ],
    deepDive: [
      {
        heading: "Choosing where to capture",
        body: "A capture only sees traffic that passes the chosen interface. tcpdump -D lists the interfaces it can use. On a server, pick the one that carries the traffic, such as eth0 or ens5. On Linux, -i any captures on all interfaces at once; it is handy when you are unsure, but it records a \"cooked\" header instead of the real Ethernet header, so the destination MAC and VLAN tags are missing.\n\nWhere you capture also matters. On the client you see what it sent and received. On the server you see what actually arrived. Capturing on both ends at once is the best way to prove packet loss in between: if the client sent a SYN and the server never saw it, the problem is on the path. In containers, capture inside the container's network namespace or on its veth interface; on a switch, use a mirror (SPAN) port. tcpdump puts the card in promiscuous mode by default; -p turns that off.",
        bullets: ["tcpdump -D: list capture interfaces", "-i any: all interfaces (Linux), no full Ethernet header", "-e: print MAC addresses and VLAN tags", "Capture both ends to locate loss"],
      },
      {
        heading: "Writing capture filters",
        body: "Capture filters use BPF (Berkeley Packet Filter) syntax and are checked in the kernel, so unwanted packets are never copied. The building blocks are type (host, net, port, portrange), direction (src, dst) and protocol (tcp, udp, icmp, arp, ip6). Combine them with and, or, not, and group with parentheses. Put the whole filter in single quotes so the shell does not touch the parentheses.\n\nExamples: host 10.0.0.5 and tcp port 443; net 10.20.0.0/16 and not port 22; src host 10.0.0.5 and dst port 53. You can also test header bits: 'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0' catches only connection starts and ends, which keeps captures tiny on busy links. Always exclude your own SSH session (not port 22) when capturing remotely, or tcpdump will capture its own output in a loop.",
        visual: {
          type: "tree",
          title: "Parts of a capture filter",
          root: "BPF capture filter",
          children: [
            { label: "Type", children: ["host 10.0.0.5", "net 10.0.0.0/24", "port 443", "portrange 8000-8100"] },
            { label: "Direction", children: ["src host 10.0.0.5", "dst port 53"] },
            { label: "Protocol", children: ["tcp, udp, icmp", "arp, ip6, vlan"] },
            { label: "Logic", children: ["and, or, not", "Parentheses inside quotes"] },
            { label: "Header bits", children: ["tcp[tcpflags] & tcp-syn != 0", "icmp[icmptype] == icmp-echo"] },
          ],
        },
      },
      {
        heading: "Saving captures safely",
        body: "-w file.pcap writes raw packets to a file instead of printing them; -r file.pcap reads one back. Always add a limit so a forgotten capture cannot fill the disk. -c 5000 stops after 5000 packets. For long captures, use a ring buffer: -C 100 -W 10 starts a new file every 100 MB (millions of bytes) and keeps only the 10 newest. -G 3600 rotates every hour instead (use a strftime name like trace-%H.pcap).\n\nThe default snap length (-s) is 262144 bytes, which captures whole packets. If you only need headers, -s 128 keeps files small and leaves most payload, including secrets, out of the file. Note that -w writes buffered data, so stop tcpdump with Ctrl+C or kill -INT to flush the file properly. The pcap files open directly in Wireshark and tshark.",
        bullets: ["-c 5000: stop after 5000 packets", "-C 100 -W 10: ring of ten 100 MB files", "-s 128: headers only, smaller and safer", "-w writes; -r reads, and filters work with -r too"],
      },
      {
        heading: "Reading the output and TCP flags",
        body: "A typical line looks like: 10:42:01.123 IP 10.0.0.5.51514 > 93.184.216.34.443: Flags [S], seq 1234, win 64240, options [mss 1460,sackOK,TS,nop,wscale 7], length 0. That is time, protocol, source IP.port, destination IP.port, TCP flags, sequence number, window size, TCP options and payload length.\n\nFlags print as letters: S is SYN, F is FIN, R is RST, P is PUSH, and a dot means ACK. So [S] opens a connection, [S.] is the SYN-ACK reply, [.] is a plain ACK, [P.] is data with ACK, [F.] closes politely and [R] or [R.] aborts. By default tcpdump shows relative sequence numbers after the first packet; -S shows absolute ones. -nn prints numbers for both hosts and ports. -v adds IP details like TTL; -X shows payload in hex and ASCII and -A in ASCII only, useful for plain HTTP.",
        visual: {
          type: "sequence",
          title: "A short TCP connection as tcpdump prints it",
          actors: ["Client", "Server"],
          messages: [
            { from: 0, to: 1, label: "Flags [S]: SYN, open" },
            { from: 1, to: 0, label: "Flags [S.]: SYN-ACK" },
            { from: 0, to: 1, label: "Flags [.]: ACK, handshake done" },
            { from: 0, to: 1, label: "Flags [P.]: request data" },
            { from: 1, to: 0, label: "Flags [P.]: response data" },
            { from: 0, to: 1, label: "Flags [F.]: FIN, close" },
            { from: 1, to: 0, label: "Flags [F.] then final [.]" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "What a failed connection looks like",
        columns: [
          { title: "Nothing listening", points: ["Client sends [S]", "Server replies [R.] at once", "App shows connection refused", "Check ss -tlnp on the server"] },
          { title: "Firewall drops", points: ["Client sends [S]", "No reply at all", "Client retries [S] after about 1 s, then 2 s, 4 s", "App shows a timeout"] },
          { title: "Path problem", points: ["Client sends [S]", "Server capture never sees it", "Or server's [S.] never arrives", "Check routes, NAT, security groups"] },
        ],
      },
    ],
    examples: [
      {
        title: "Refused or dropped? Proving it with packets",
        explanation: "An app cannot reach a database on 10.0.20.15:5432. Step 1: capture on the app server only for that host and port. Step 2: trigger a connection. Step 3: read the flags. If you see [S] followed by [R.], the database host is reachable but nothing listens on 5432, so check the service. If you see [S] repeated with growing gaps and no reply, something drops the SYN: a firewall, security group or wrong route.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i eth0 -nn 'host 10.0.20.15 and tcp port 5432'\n# Case A, refused:\n# IP 10.0.10.11.40422 > 10.0.20.15.5432: Flags [S], seq 99..., length 0\n# IP 10.0.20.15.5432 > 10.0.10.11.40422: Flags [R.], seq 0, ack 1, length 0\n# Case B, dropped:\n# IP 10.0.10.11.40424 > 10.0.20.15.5432: Flags [S], ... (no reply)\n# IP 10.0.10.11.40424 > 10.0.20.15.5432: Flags [S], ... (retransmit)",
        },
      },
      {
        title: "Catching a rare error with a ring buffer",
        explanation: "A partner's webhook fails a few times per day. You cannot watch all day, and a full capture would fill the disk. Step 1: start a ring-buffer capture of only that partner's traffic, headers only, keeping ten 50 MB files. Step 2: when the error appears in the app log, note the time. Step 3: stop the capture and read only the file that covers that time, filtering for resets. Step 4: copy that one file to your laptop for Wireshark.",
        code: {
          lang: "bash",
          code: "sudo tcpdump -i eth0 -nn -s 256 -C 50 -W 10 \\\n  -w /var/tmp/hook.pcap 'net 198.51.100.0/24 and tcp port 443'\n# files: hook.pcap0 ... hook.pcap9 (oldest overwritten)\nls -l --time-style=+%H:%M /var/tmp/hook.pcap*\ntcpdump -nn -r /var/tmp/hook.pcap3 'tcp[tcpflags] & tcp-rst != 0'",
        },
      },
    ],
    cheatSheet: [
      "sudo tcpdump -D: list interfaces you can capture on",
      "-nn: no host or port name lookups; always use it for speed and clarity",
      "'host A and (port 80 or port 443)': quote filters that use parentheses",
      "Add 'and not port 22' when capturing over SSH",
      "-w f.pcap -c 10000: save to file with a hard packet limit",
      "-C 100 -W 10: ring buffer of ten 100 MB files",
      "Flags: [S] SYN, [S.] SYN-ACK, [.] ACK, [P.] data, [F.] FIN, [R] reset",
      "'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0': only connection starts and ends",
    ],
    quiz: [
      {
        q: "You capture on the client and see [S] sent three times with growing gaps and no reply. What is most likely?",
        options: ["The server sent a reset", "The handshake succeeded", "The SYN is being dropped, for example by a firewall", "DNS failed"],
        answer: 2,
        why: "Repeated SYNs without any reply mean nothing came back, the classic sign of a silent drop.",
      },
      {
        q: "What does Flags [R.] mean in tcpdump output?",
        options: ["Retransmission with ACK", "Reset with the ACK flag set", "Request with push", "Receive window full"],
        answer: 1,
        why: "R is RST and the dot is ACK; a reset immediately after a SYN means the port is closed.",
      },
      {
        q: "Why is -i any less useful when you need MAC addresses?",
        options: ["It only captures IPv6", "It needs a GUI", "It cannot write pcap files", "It records a Linux cooked header instead of the real Ethernet header"],
        answer: 3,
        why: "The any pseudo-interface uses a cooked capture format without the original link-layer header.",
      },
      {
        q: "Which option set keeps a capture from filling the disk during a long run?",
        options: ["-C 100 -W 10", "-nn -v", "-X -A", "-D -p"],
        answer: 0,
        why: "-C sets the file size in millions of bytes and -W how many files to keep in the ring.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Capture 10 DNS packets while you run a lookup, and identify the query and the answer in the output.",
        hint: "DNS uses UDP port 53; use -c 10 and run dig in a second terminal.",
        solution: "sudo tcpdump -i any -nn -c 10 'udp port 53'\n# in another terminal:\ndig example.com\n# Query:  IP 10.0.0.5.48211 > 10.0.0.1.53: 4711+ A? example.com. (29)\n# Answer: IP 10.0.0.1.53 > 10.0.0.5.48211: 4711 1/0/0 A 93.184.216.34 (45)\n# The number 4711 is the DNS ID linking question and answer.",
      },
      {
        level: "medium",
        task: "Save a capture of one HTTPS page load to a file, then read it back showing only the SYN, SYN-ACK, FIN and RST packets.",
        hint: "Write with -w, then read with -r and a tcpflags filter.",
        solution: "sudo tcpdump -i eth0 -nn -w /tmp/page.pcap 'tcp port 443' &\ncurl -s -o /dev/null https://example.com\nsudo kill -INT %1\ntcpdump -nn -r /tmp/page.pcap \\\n  'tcp[tcpflags] & (tcp-syn|tcp-fin|tcp-rst) != 0'",
      },
      {
        level: "hard",
        task: "Prove whether packet loss happens on the path between two of your servers by capturing on both ends at the same time and comparing SYN counts.",
        hint: "Run the same filter on both hosts, make 50 connections, then count SYNs in each file.",
        solution: "# On A (10.0.0.5) and on B (10.0.0.9), same filter:\nsudo tcpdump -i eth0 -nn -w /tmp/side.pcap 'host 10.0.0.5 and host 10.0.0.9 and tcp port 8080'\n# From A, open 50 connections:\nfor i in $(seq 50); do curl -s -o /dev/null --max-time 2 http://10.0.0.9:8080/; done\n# Stop both, then count SYNs (no ACK) on each side:\ntcpdump -nn -r /tmp/side.pcap 'tcp[tcpflags] == tcp-syn' | wc -l\n# A shows 50 but B fewer: packets lost between them.",
      },
    ],
    faq: [
      { q: "Can tcpdump see HTTPS content?", a: "No. It captures the packets, but the payload is encrypted by TLS. You can still see IPs, ports, timing, TCP flags and the server name in the TLS ClientHello." },
      { q: "Why does tcpdump need root?", a: "Capturing raw packets is a privileged action. You can run it as root or give the binary the CAP_NET_RAW and CAP_NET_ADMIN capabilities." },
      { q: "How do I stop tcpdump and keep the file?", a: "Press Ctrl+C, or send it SIGINT with kill -INT. tcpdump then flushes its buffer and closes the pcap file cleanly." },
      { q: "What is the difference between a capture filter and a display filter?", a: "A capture filter (BPF, used by tcpdump) decides what gets recorded. A display filter (Wireshark syntax) only hides or shows packets that were already captured." },
    ],
  },

  "net-tools/wireshark": {
    plain: [
      "Wireshark opens a capture file and shows every packet in a clear window. It knows hundreds of protocols, so it can show a TCP packet, the TLS handshake inside it and the HTTP request inside that, each layer as a section you can expand.",
      "A capture often holds thousands of packets. Display filters are how you find the few that matter. You type a short rule, such as dns or ip.addr == 10.0.0.5, and Wireshark hides everything else. The original packets are still there; you are only changing the view.",
      "Wireshark also does the boring work for you. It can rebuild a whole conversation into readable text, list which hosts talked the most, and mark suspicious packets such as retransmissions (packets sent again because they got lost) and resets (connections cut off).",
      "Most web traffic today is encrypted with TLS, so the content looks like random bytes. If you control the browser or the app, you can make it save its session keys to a file, and Wireshark will use them to show the real requests. This works only for your own traffic.",
    ],
    deepDive: [
      {
        heading: "Display filter language",
        body: "Display filters use field names from the protocol tree: ip.src, ip.addr, tcp.port, udp.port, dns.qry.name, http.host, tls.handshake.extensions_server_name. Compare with ==, !=, >, <, >=, <=, and combine with && (and), || (or) and ! (not). Strings need double quotes: http.host == \"api.example.com\". contains matches part of a value and matches uses a regular expression.\n\nThe bar turns green for valid syntax and red for errors, which catches the common mistake of typing tcpdump syntax like host 10.0.0.5. A quick trick: right-click any field in the packet details and choose Apply as Filter, and Wireshark writes the filter for you. Save filters you use often as filter buttons. tcp.stream eq 7 shows exactly one TCP connection, because Wireshark numbers every connection it sees.",
        bullets: ["ip.addr == 10.0.0.5 matches source or destination", "!(arp || dns) hides background noise", "tls.handshake.extensions_server_name contains \"bank\"", "frame.time_delta_displayed > 1 finds long gaps"],
      },
      {
        heading: "Following streams and measuring response time",
        body: "Follow TCP Stream (right-click a packet, Follow, TCP Stream) joins all the data of one connection and shows it as a conversation, client in one colour and server in another. For HTTP/1.1 you can read the whole request and response. Follow HTTP Stream also undoes compression. Closing the window applies a tcp.stream filter for that connection.\n\nFor timing, change View, Time Display Format to Seconds Since Previous Displayed Packet, then filter one stream: big gaps jump out. Wireshark also calculates times for you: http.time is the time from a request to its response, dns.time does the same for DNS, and tcp.time_delta (after enabling Calculate conversation timestamps in the TCP protocol preferences) shows the time since the previous packet in the same connection. Add any of these as a column (right-click, Apply as Column) and sort to find the slowest responses.",
        visual: {
          type: "flow",
          title: "Finding the slowest request in a capture",
          steps: [
            { label: "Filter responses", detail: "http.response or dns.flags.response == 1" },
            { label: "Add a timing column", detail: "http.time or dns.time, Apply as Column" },
            { label: "Sort descending", detail: "Slowest response at the top" },
            { label: "Follow its stream", detail: "See the request that caused it" },
            { label: "Check the gap", detail: "Server delay or network retransmits?" },
          ],
        },
      },
      {
        heading: "Statistics views for the big picture",
        body: "Before reading single packets, get an overview from the Statistics menu. Protocol Hierarchy shows what share of traffic is TCP, UDP, TLS, DNS and so on, which quickly reveals odd traffic. Conversations lists every pair of hosts (and every TCP or UDP connection) with packets, bytes and duration; sort by bytes to find the heavy talkers. Endpoints does the same per host.\n\nI/O Graphs plots packets or bytes per second over time; add a graph with the filter tcp.analysis.retransmission to see whether retransmissions line up with a slowdown. Statistics, TCP Stream Graphs, Stevens plots sequence numbers over time for one connection: a smooth line is a healthy transfer, flat parts are stalls. Analyze, Expert Information groups all warnings (retransmissions, duplicate ACKs, zero windows, resets) in one place.",
        bullets: ["Protocol Hierarchy: what kinds of traffic", "Conversations: who talks to whom, how much", "I/O Graphs: rate over time with filters", "Expert Information: all warnings grouped"],
      },
      {
        heading: "Spotting retransmissions, resets and zero windows",
        body: "Wireshark tracks sequence numbers and flags problems for you, all under tcp.analysis. tcp.analysis.retransmission marks data sent again because no ACK arrived; a few are normal, but many point to loss on the path. tcp.analysis.duplicate_ack and tcp.analysis.fast_retransmission show the receiver telling the sender that a segment is missing. tcp.analysis.zero_window means the receiver's buffer is full, so the slow side is the receiving application, not the network.\n\nResets are matched with tcp.flags.reset == 1. A reset right after a SYN means the port is closed. A reset in the middle of a session often comes from a firewall or load balancer that timed out an idle connection, or from an app that crashed. Check which IP sent it and the TTL: a TTL very different from the server's other packets suggests a middlebox forged the reset.",
        visual: {
          type: "compare",
          title: "Who is slow? Network versus application",
          columns: [
            { title: "Network problem", points: ["Many retransmissions", "Duplicate ACKs", "Gaps right after lost segments", "Loss shows on the I/O graph"] },
            { title: "Server app slow", points: ["Quick ACK to the request", "Long wait before the first response byte", "High http.time, clean TCP", "No retransmissions"] },
            { title: "Client app slow", points: ["Client advertises zero window", "Server waits to send", "tcp.analysis.zero_window hits", "Receiver not reading fast enough"] },
          ],
        },
      },
      {
        heading: "Decrypting TLS with a key log file",
        body: "TLS encrypts the payload with session keys that never cross the network, so a capture alone cannot be decrypted. But Chrome, Firefox and curl (when built with OpenSSL and similar libraries) write those session secrets to a file if the SSLKEYLOGFILE environment variable is set. Start the browser from a terminal with SSLKEYLOGFILE=$HOME/tls-keys.log, browse, and capture at the same time.\n\nIn Wireshark open Edit, Preferences, Protocols, TLS, and set (Pre)-Master-Secret log filename to that file. Packets that showed Application Data now show HTTP or HTTP/2 frames. This works for TLS 1.2 and 1.3, including forward-secret ciphers, because it uses per-session secrets rather than the server's private key. Use it only on traffic you own, delete the key file afterwards, and never share it with a capture unless you mean to share the decrypted content.",
        bullets: ["SSLKEYLOGFILE=~/tls-keys.log firefox", "Preferences, Protocols, TLS, (Pre)-Master-Secret log filename", "Works for TLS 1.3, unlike the old RSA private key method"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Handy display filters by question",
        root: "What do you want to find?",
        children: [
          { label: "One host or service", children: ["ip.addr == 10.0.0.5", "tcp.port == 443", "tcp.stream eq 7"] },
          { label: "Connection problems", children: ["tcp.flags.reset == 1", "tcp.analysis.retransmission", "tcp.analysis.zero_window"] },
          { label: "Slow answers", children: ["http.time > 1", "dns.time > 0.5"] },
          { label: "Errors", children: ["http.response.code >= 400", "dns.flags.rcode == 3"] },
          { label: "TLS", children: ["tls.handshake.type == 2", "tls.alert_message"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why does the report page take 6 seconds?",
        explanation: "Step 1: open the capture and filter http.response. Step 2: add http.time as a column and sort it; one response to GET /report took 5.8 s. Step 3: follow that TCP stream. The server ACKed the request in 1 ms and sent no data for 5.8 s, and there are no retransmissions. Step 4: conclusion: the network is healthy and the server app is slow, so the next step is the app's database queries, not the network.",
        code: {
          lang: "text",
          code: "http.response && http.time > 1\n# right-click http.time > Apply as Column, sort descending\ntcp.stream eq 14\n# then check for network trouble in the same stream:\ntcp.stream eq 14 && tcp.analysis.flags",
        },
      },
      {
        title: "Uploads stall over the VPN",
        explanation: "Large uploads stop after a few seconds. Step 1: open Expert Information; it shows many retransmissions in one stream. Step 2: filter that stream and look at the sizes: segments of 1448 bytes are retransmitted over and over, while small packets pass. Step 3: filter icmp.type == 3 && icmp.code == 4 and find no Fragmentation Needed messages, so path MTU discovery is being blocked. Step 4: lower the MTU on the VPN interface or allow that ICMP type, then capture again to confirm the stalls are gone.",
        code: {
          lang: "text",
          code: "tcp.analysis.retransmission\ntcp.stream eq 3 && tcp.len > 1400\nicmp.type == 3 && icmp.code == 4\n# tshark equivalent on a server:\n# tshark -r up.pcap -Y 'tcp.analysis.retransmission' -T fields -e tcp.stream -e tcp.len",
        },
      },
    ],
    cheatSheet: [
      "Display filter: ip.addr == X; capture filter: host X; do not mix them",
      "tcp.stream eq N shows one connection; Follow TCP Stream sets it for you",
      "tcp.analysis.flags shows every TCP problem Wireshark detected",
      "http.time and dns.time measure request-to-response time; add them as columns",
      "Statistics, Conversations: sort by bytes to find the heaviest talkers",
      "Analyze, Expert Information: retransmissions, resets and zero windows in one list",
      "SSLKEYLOGFILE plus the TLS key log preference decrypts your own HTTPS",
      "tshark -r f.pcap -Y 'filter' gives the same filtering on the command line",
    ],
    quiz: [
      {
        q: "Which is a valid Wireshark display filter for traffic to or from 10.0.0.5?",
        options: ["host 10.0.0.5", "ip.addr == 10.0.0.5", "src or dst 10.0.0.5", "ip host 10.0.0.5"],
        answer: 1,
        why: "ip.addr matches either source or destination; host is capture-filter syntax.",
      },
      {
        q: "A server's response took 4 s, the request was ACKed at once, and there are no retransmissions. What is the likely cause?",
        options: ["Packet loss on the path", "A DNS failure", "A zero window on the client", "Slow processing in the server application"],
        answer: 3,
        why: "A clean TCP exchange with a long wait before the first byte points to the server app.",
      },
      {
        q: "What does tcp.analysis.zero_window indicate?",
        options: ["The receiver's buffer is full and it asks the sender to pause", "The connection was reset", "A packet was lost", "The TLS handshake failed"],
        answer: 0,
        why: "A zero window means the receiving application is not reading data fast enough.",
      },
      {
        q: "Why can a key log file decrypt TLS 1.3 when the server's private key cannot?",
        options: ["TLS 1.3 does not really encrypt", "The private key is never used in TLS", "TLS 1.3 uses ephemeral key exchange, so you need the per-session secrets", "Key log files contain the certificate"],
        answer: 2,
        why: "With forward secrecy, session keys come from an ephemeral exchange and are only known to the endpoints.",
      },
      {
        q: "Which view shows which pairs of hosts exchanged the most bytes?",
        options: ["Follow TCP Stream", "Statistics, Conversations", "Expert Information", "Time Display Format"],
        answer: 1,
        why: "Conversations lists every host pair and connection with packet and byte counts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Open any capture of your own browsing and write display filters that show only DNS queries for names containing \"google\", and only TLS ClientHello messages.",
        hint: "DNS query name field is dns.qry.name; ClientHello is handshake type 1.",
        solution: "dns.flags.response == 0 && dns.qry.name contains \"google\"\ntls.handshake.type == 1\n# Optional: add tls.handshake.extensions_server_name as a column\n# to see which site each ClientHello was for.",
      },
      {
        level: "medium",
        task: "Use tshark to list the five slowest HTTP responses in a capture with their stream number, host and time.",
        hint: "Use -Y to filter, -T fields with -e for each field, then sort.",
        solution: "tshark -r web.pcap -Y 'http.response' \\\n  -T fields -e tcp.stream -e http.response_for.uri -e http.time \\\n  | sort -k3 -nr | head -5",
      },
      {
        level: "hard",
        task: "Capture and decrypt your own HTTPS traffic to a site using a key log file, and show the HTTP/2 request path in Wireshark.",
        hint: "Start the browser with SSLKEYLOGFILE set, capture tcp port 443, then set the TLS key log preference.",
        solution: "export SSLKEYLOGFILE=$HOME/tls-keys.log\nsudo tcpdump -i any -nn -w /tmp/tls.pcap 'tcp port 443' &\nfirefox https://example.com   # or chrome; then close it\nsudo kill -INT %1\n# Wireshark: Edit > Preferences > Protocols > TLS >\n#   (Pre)-Master-Secret log filename = ~/tls-keys.log\n# Filter: http2.header.name == \":path\"\n# Afterwards: rm $HOME/tls-keys.log",
      },
    ],
    faq: [
      { q: "Is Wireshark free?", a: "Yes. Wireshark is free, open-source software released under the GNU GPL, and it runs on Windows, macOS and Linux." },
      { q: "Can Wireshark capture other people's traffic on my Wi-Fi?", a: "On a normal switched or encrypted network you mostly see only your own traffic and broadcasts. Capturing others' traffic without permission is illegal in many places." },
      { q: "What is the difference between Wireshark and tshark?", a: "tshark is Wireshark's command-line version. It uses the same dissectors and display filters, so it is ideal for servers and scripts." },
      { q: "Why are some packets shown in black with red text?", a: "That is the default colouring rule for packets with TCP problems, such as retransmissions, duplicate ACKs or out-of-order segments." },
    ],
  },
};

export default extra;
