import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-foundations/network-basics": {
    plain: [
      "A network is simply two or more devices joined together so they can share data. Each device that sends or receives data is called a host: your laptop, your phone, a printer or a server in a data centre. The path between two devices is a link, which can be a cable, a fibre or a radio signal like Wi-Fi.",
      "Inside a home or office, hosts plug into a switch (or connect to a Wi-Fi access point). The switch passes data between local devices. That local group is a LAN, a local area network. To reach anything outside, such as a website, traffic goes to a router, which connects your LAN to other networks.",
      "When networks in different cities or countries are joined, we call it a WAN, a wide area network. The internet is a huge collection of networks run by thousands of companies and internet service providers (ISPs), all agreeing to pass traffic for each other.",
      "Three numbers describe how good a network feels. Bandwidth is how much data a link could carry per second, like the width of a pipe. Latency is how long one piece of data takes to arrive, like the length of the pipe. Throughput is what you really get, which is almost always less than the bandwidth.",
    ],
    deepDive: [
      {
        heading: "Hosts, links, switches and routers: who does what",
        body: "Every network is built from the same few parts. Hosts are the endpoints that create and use data. Links carry bits between two points. A switch joins hosts inside one LAN and forwards data using hardware addresses called MAC addresses. A router joins different networks and forwards data using IP addresses, choosing the next step towards the destination.\n\nYour home router is really several devices in one box: a router, a small switch with four ports, a Wi-Fi access point, a firewall and often a DHCP server that hands out addresses. In an office these are usually separate boxes, which makes them easier to scale and to troubleshoot. Knowing which job each part does tells you where to look when something breaks.",
        bullets: ["Switch: forwards inside a LAN, uses MAC addresses", "Router: forwards between networks, uses IP addresses", "Access point: bridges Wi-Fi clients onto the wired LAN", "Home router: router, switch, Wi-Fi, firewall and DHCP in one"],
      },
      {
        heading: "Topologies: star, mesh and bus",
        body: "Topology means the shape of the connections. Old Ethernet used a bus: every host tapped into one shared coaxial cable, so a single break took everyone down and only one host could talk at a time. Modern LANs use a star: every host has its own cable to a central switch. One bad cable affects one host, and the switch lets many pairs talk at once.\n\nA full mesh connects every device to every other device. It is very resilient but expensive: n devices need n(n-1)/2 links, so 10 sites need 45 links. Real WANs and data centres use a partial mesh, adding just enough extra links that no single failure cuts anyone off.",
        visual: {
          type: "compare",
          title: "Three topologies side by side",
          columns: [
            { title: "Bus", points: ["One shared cable", "Only one sender at a time", "One break stops everyone", "Mostly historic"] },
            { title: "Star", points: ["Each host cabled to a switch", "Many conversations at once", "One bad cable hits one host", "Standard for LANs"] },
            { title: "Mesh", points: ["Many paths between nodes", "Survives link failures", "Full mesh needs n(n-1)/2 links", "Used for WAN and core links"] },
          ],
        },
      },
      {
        heading: "Where latency really comes from",
        body: "Latency is the sum of four delays. Propagation delay is the time the signal takes to travel; light in fibre covers about 200 km per millisecond, so London to New York (about 5,600 km) costs roughly 28 ms one way before anything else. Transmission (or serialization) delay is the time to push all the bits onto the wire: a 1500-byte packet takes 12 microseconds at 1 Gbps but 1.2 ms at 10 Mbps. Processing delay is the time a device spends reading headers. Queuing delay is the time a packet waits in a buffer behind other packets.\n\nOn a quiet network, propagation dominates and you cannot beat physics. On a busy network, queuing grows fast, which is why a congested home link can push ping times from 20 ms to 300 ms.",
        visual: {
          type: "flow",
          title: "The four parts of one-way delay",
          steps: [
            { label: "Processing", detail: "Device reads headers and picks a port" },
            { label: "Queuing", detail: "Packet waits behind others in a buffer" },
            { label: "Transmission", detail: "Bits are pushed onto the link" },
            { label: "Propagation", detail: "Signal travels about 200 km per ms in fibre" },
          ],
        },
      },
      {
        heading: "Bandwidth, throughput and the bandwidth-delay product",
        body: "Bandwidth is the raw line rate, such as 1 Gbps. Throughput is the useful data rate you measure, and it is always lower: headers take space, other users share the link, and protocols like TCP need time to speed up. On a 1 Gbps Ethernet link a single TCP transfer tops out around 940 Mbps of real data because of header overhead.\n\nLatency and bandwidth also interact. The bandwidth-delay product says how much data must be in flight to keep a link full: bandwidth multiplied by round-trip time. A 100 Mbps path with 50 ms RTT needs 100,000,000 x 0.05 = 5,000,000 bits, about 625 KB, in flight. If the sender or receiver allows less than that, throughput falls no matter how fast the link is.",
        bullets: ["Units: network speeds use bits (Mbps), file sizes use bytes (MB)", "8 bits = 1 byte, so 100 Mbps is at most 12.5 MB/s", "Bandwidth-delay product = bandwidth x RTT", "Measure real throughput with iperf3"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Network types by size",
        root: "Networks",
        children: [
          { label: "PAN", children: ["Personal area network", "Bluetooth headset and phone"] },
          { label: "LAN", children: ["One home, office or floor", "Ethernet and Wi-Fi"] },
          { label: "MAN / campus", children: ["Several buildings in one city", "Often fibre between buildings"] },
          { label: "WAN", children: ["Sites in different cities", "Leased lines, MPLS, SD-WAN, VPNs"] },
          { label: "Internet", children: ["Network of networks", "ISPs joined by BGP"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why the 1 GB download takes longer than you expected",
        explanation: "Your plan says 100 Mbps and you download a 1 GB file. Step 1: convert units. 1 GB is about 8,000 megabits. Step 2: divide by the speed: 8,000 / 100 = 80 seconds in a perfect world. Step 3: remove overhead. Headers use about 5 percent, so real TCP data runs near 94 Mbps, giving about 85 seconds. Step 4: share the link. If someone else is streaming 25 Mbps of video, you get roughly 70 Mbps, and the download takes around 115 seconds. Step 5: measure instead of guessing, using iperf3 against a server you control.",
        code: {
          lang: "bash",
          code: "# on the server\niperf3 -s\n# on the client: 10-second test, then the reverse direction\niperf3 -c 203.0.113.10 -t 10\niperf3 -c 203.0.113.10 -t 10 -R",
        },
      },
      {
        title: "Telling high latency from low bandwidth",
        explanation: "Users say a cloud app feels slow. Step 1: ping the server. An average of 180 ms means every request and reply costs at least 180 ms, so a page that needs 10 sequential requests waits almost 2 seconds even on a fast link. Step 2: run a throughput test. If iperf3 shows 300 Mbps, bandwidth is not the problem. Step 3: conclude the issue is latency, which you fix by moving the server closer (another region or a CDN) or by making fewer round trips, not by buying a bigger line.",
        code: {
          lang: "bash",
          code: "ping -c 10 app.example.com      # look at avg and mdev\nmtr -rwc 50 app.example.com     # where along the path delay appears",
        },
      },
    ],
    cheatSheet: [
      "Switch = inside a LAN (MAC addresses); router = between networks (IP addresses)",
      "Star topology: every host on its own switch port; the LAN standard",
      "Full mesh of n nodes needs n(n-1)/2 links",
      "Light in fibre: about 200 km per ms, so 1,000 km adds about 5 ms one way",
      "100 Mbps = 12.5 MB/s at most; divide bits by 8 to get bytes",
      "Bandwidth-delay product = bandwidth x RTT = data needed in flight",
      "ip route shows your default gateway; ping shows round-trip latency",
    ],
    quiz: [
      {
        q: "Which device forwards traffic between two different IP networks?",
        options: ["Hub", "Switch", "Router", "Patch panel"],
        answer: 2,
        why: "Routers read IP addresses and move packets between networks; switches stay inside one LAN.",
      },
      {
        q: "How many links does a full mesh of 6 routers need?",
        options: ["15", "6", "12", "30"],
        answer: 0,
        why: "n(n-1)/2 = 6 x 5 / 2 = 15.",
      },
      {
        q: "A link is rated 1 Gbps, but a file copy shows 600 Mbps. What is 600 Mbps?",
        options: ["Latency", "Bandwidth", "Jitter", "Throughput"],
        answer: 3,
        why: "Throughput is the rate you actually achieve; bandwidth is the link's maximum.",
      },
      {
        q: "Ping times jump from 20 ms to 300 ms only while a big upload runs. Which delay grew?",
        options: ["Queuing delay", "Propagation delay", "Processing delay", "Speed of light"],
        answer: 0,
        why: "The upload fills buffers, so every other packet waits in a queue; distance did not change.",
      },
      {
        q: "Why did star topology replace bus topology in LANs?",
        options: ["Stars need less cable", "One cable fault affects only one host and many hosts can talk at once", "Stars use no electricity", "Bus networks cannot carry IP"],
        answer: 1,
        why: "Each host has its own link to the switch, isolating faults and allowing parallel conversations.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find your own IP address, your default gateway and your round-trip time to 1.1.1.1.",
        hint: "Use ip addr, ip route and ping on Linux (ipconfig and ping on Windows).",
        solution: "ip -br addr show            # brief list of interfaces and IPs\nip route show default       # 'default via X' is your gateway\nping -c 4 1.1.1.1           # read the avg value in the last line",
      },
      {
        level: "medium",
        task: "A 500 MB backup must cross a 20 Mbps WAN link. Estimate the minimum time, then a realistic time with 5 percent overhead and the link 50 percent busy with other traffic.",
        hint: "Convert MB to megabits first, then divide by the available rate.",
        solution: "500 MB x 8 = 4,000 Mb\nIdeal: 4,000 / 20 = 200 s (3 min 20 s)\nAfter 5% overhead: about 19 Mbps usable\nHalf the link is busy: about 9.5 Mbps for you\nRealistic: 4,000 / 9.5 = about 421 s (about 7 minutes)",
      },
      {
        level: "hard",
        task: "A TCP receiver allows at most 64 KB in flight. What is the best possible throughput across a path with 80 ms RTT? How big must the window be to fill a 200 Mbps link on that path?",
        hint: "Throughput is at most window / RTT. Window needed is bandwidth x RTT.",
        solution: "Max throughput = 65,536 bytes / 0.08 s = 819,200 bytes/s\n= about 6.6 Mbps, no matter how fast the link is\nNeeded window = 200,000,000 bits/s x 0.08 s = 16,000,000 bits\n= 2,000,000 bytes, about 2 MB in flight\nThis is why TCP window scaling exists.",
      },
    ],
    faq: [
      { q: "Is Wi-Fi the same as the internet?", a: "No. Wi-Fi is just the radio link between your device and your access point inside your LAN. The internet is reached through your router and your ISP, so Wi-Fi can work perfectly while the internet is down." },
      { q: "What is a good latency?", a: "Inside a LAN, under 1 ms. Within one country, usually 5 to 30 ms. Across an ocean, 70 to 150 ms. For gaming and video calls, under about 50 ms feels smooth." },
      { q: "Why is my download speed in MB/s much lower than my plan in Mbps?", a: "Plans are sold in megabits per second, while downloads are shown in megabytes per second. Divide by 8: a 100 Mbps plan gives at most about 12 MB/s." },
      { q: "What is the difference between a modem and a router?", a: "A modem converts your ISP's signal (cable, DSL or fibre) into Ethernet. A router then connects your LAN to that link and forwards traffic between them. Many ISP boxes combine both." },
    ],
  },

  "net-foundations/osi-model": {
    plain: [
      "Sending data across a network involves many jobs: turning bits into signals, finding the right machine, making sure nothing is lost, and understanding what the data means. The OSI model splits these jobs into seven layers, stacked on top of each other, so you can think about one job at a time.",
      "Each layer only talks to the layer directly above and below it on the same machine. But it acts as if it were talking to the same layer on the other machine. Your browser speaks HTTP to the web server; it does not care whether the bits travel over Wi-Fi or fibre.",
      "Engineers use the layer numbers as shorthand. A layer 2 problem is about switches and MAC addresses. A layer 3 problem is about IP addresses and routing. A layer 7 load balancer understands HTTP. If you know the numbers, you can follow almost any networking conversation.",
      "The model is also a checklist for fixing problems. Is the cable plugged in (layer 1)? Does the switch see the device (layer 2)? Does it have the right IP address (layer 3)? Is the port open (layer 4)? Is the app replying (layer 7)? Checking in order stops you from guessing.",
    ],
    deepDive: [
      {
        heading: "Services down, peers across",
        body: "Two ideas make the model work. Vertically, each layer offers a service to the one above. TCP (layer 4) offers a reliable byte stream; it uses IP (layer 3), which only offers best-effort delivery of packets. Horizontally, each layer has a peer on the other machine, and the two follow a protocol with each other by reading and writing their own header.\n\nThis is why you can change one layer without touching the others. Moving from Wi-Fi to Ethernet changes layers 1 and 2, but TCP, TLS and HTTP keep working unchanged. Moving from HTTP/1.1 to HTTP/2 changes layer 7 without new cables. Clean boundaries are what let the internet evolve piece by piece for decades.",
        visual: {
          type: "sequence",
          title: "Peer layers talk through their own headers",
          actors: ["Browser L7", "Client TCP L4", "Server TCP L4", "Web server L7"],
          messages: [
            { from: 0, to: 1, label: "Hand down: send these HTTP bytes" },
            { from: 1, to: 2, label: "Segment with TCP header (ports, seq)" },
            { from: 2, to: 3, label: "Hand up: HTTP bytes in order" },
            { from: 3, to: 2, label: "Hand down: HTTP response" },
            { from: 2, to: 1, label: "Segments plus ACKs" },
            { from: 1, to: 0, label: "Hand up: response bytes" },
          ],
        },
      },
      {
        heading: "Protocols that refuse to sit in one box",
        body: "Real protocols were designed for TCP/IP, not for OSI, so some sit awkwardly. ARP maps IP addresses (layer 3) to MAC addresses (layer 2) and is carried directly in Ethernet frames, so people call it layer 2.5. ICMP is carried inside IP packets but is part of the network layer's own control system. OSPF runs directly over IP as protocol number 89, while BGP runs over TCP port 179, yet both exist to serve layer 3 routing.\n\nTLS is the classic puzzle: it encrypts (a layer 6 idea), keeps a session (layer 5) and runs over TCP. Most engineers simply say TLS sits between transport and application. The goal is clear thinking, not perfect boxes.",
        bullets: ["ARP: between layers 2 and 3", "ICMP: layer 3 control messages", "OSPF: IP protocol 89; BGP: TCP port 179", "TLS: between layer 4 and layer 7", "DNS: layer 7, usually over UDP or TCP port 53"],
      },
      {
        heading: "Mapping devices to layers",
        body: "A device's layer is the highest header it reads to make a forwarding decision. A hub, repeater or media converter only regenerates bits: layer 1. A switch reads the Ethernet header and forwards by MAC address: layer 2. A router reads the IP header and forwards by destination IP: layer 3. A layer 3 switch does both in hardware and is common in office cores.\n\nHigher up, a stateful firewall tracks layer 4 connections (addresses, ports and TCP state), and a next-generation firewall also inspects layer 7. A layer 4 load balancer spreads TCP or UDP flows by address and port; a layer 7 load balancer reads HTTP and can route by URL path or header. Asking which header a box reads tells you what it can and cannot do.",
      },
      {
        heading: "Troubleshooting by layer",
        body: "There are three common strategies. Bottom-up starts at layer 1 and moves up; use it when nothing works at all, for example a new machine with no network. Top-down starts at the application and moves down; use it when most things work and only one app fails, since lower layers are probably fine. Divide-and-conquer starts in the middle, often with a ping at layer 3: if ping works, layers 1 to 3 are fine and you move up; if not, you move down.\n\nWhatever you choose, test one layer at a time and write down what you proved. A successful ping to the gateway proves the cable, the switch port, the VLAN and the IP settings in one step.",
        visual: {
          type: "compare",
          title: "Three ways to walk the layers",
          columns: [
            { title: "Bottom-up", points: ["Start at cables and link lights", "Best when nothing works", "Thorough but slow"] },
            { title: "Top-down", points: ["Start at the failing app", "Best when only one app fails", "Fast when lower layers are fine"] },
            { title: "Divide and conquer", points: ["Start with ping (layer 3)", "Go up if it works, down if not", "Usually the quickest"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "One test per layer",
        layers: [
          { label: "7 Application", detail: "curl -v https://site returns 200" },
          { label: "4 Transport", detail: "nc -zv host 443 says succeeded" },
          { label: "3 Network", detail: "ping gateway and remote IP" },
          { label: "2 Data link", detail: "ip neigh shows the gateway MAC" },
          { label: "1 Physical", detail: "ethtool shows Link detected: yes" },
        ],
      },
    ],
    examples: [
      {
        title: "A new desktop has no network at all",
        explanation: "Nothing works, so go bottom-up. Layer 1: ethtool shows Link detected: no. The link light is off. You swap the patch cable and the link comes up at 1000Mb/s full duplex. Layer 2: ip neigh shows no gateway entry yet, so you ping the gateway, and now it appears as REACHABLE. Layer 3: ip addr shows a 169.254.x.x address, which means DHCP failed earlier; you renew the lease and get 10.0.10.57/24. Layer 7: the browser now loads pages. Each step proved one layer before moving on.",
        code: {
          lang: "bash",
          code: "ethtool eth0 | grep -E 'Speed|Duplex|Link detected'\nip -br addr show eth0\nsudo dhclient -r eth0 && sudo dhclient eth0   # or: nmcli device reapply eth0\nping -c 2 10.0.10.1\nip neigh show dev eth0",
        },
      },
      {
        title: "Only one website fails",
        explanation: "Everything else works, so go top-down. Layer 7: curl -v https://shop.example.com hangs after Connected to, then times out during the TLS handshake. Layer 4: nc -zv shop.example.com 443 succeeds, so the TCP port is open. That narrows the fault to TLS or the app. Trying curl with -4 and -6 shows IPv4 works but IPv6 hangs, so the real issue is a broken IPv6 path to that one site. You report it to the site owner with the exact test results.",
        code: {
          lang: "bash",
          code: "curl -v --max-time 10 https://shop.example.com\nnc -zv shop.example.com 443\ncurl -4 -sS -o /dev/null -w '%{http_code}\\n' https://shop.example.com\ncurl -6 -sS -o /dev/null -w '%{http_code}\\n' https://shop.example.com",
        },
      },
    ],
    cheatSheet: [
      "Mnemonic, layers 1 to 7: Please Do Not Throw Sausage Pizza Away",
      "Hub = L1, switch = L2, router = L3, L4 and L7 for load balancers and firewalls",
      "PDUs: bits (L1), frame (L2), packet (L3), segment or datagram (L4), data (L5-7)",
      "A device's layer = the highest header it reads to forward traffic",
      "Nothing works: go bottom-up. One app fails: go top-down",
      "A ping to the gateway proves layers 1 to 3 on the local link in one step",
    ],
    quiz: [
      {
        q: "A load balancer sends /api requests to one pool and /images to another. Which layer is it working at?",
        options: ["Layer 2", "Layer 3", "Layer 4", "Layer 7"],
        answer: 3,
        why: "Routing by URL path means it reads HTTP, which is application layer.",
      },
      {
        q: "Which layer is responsible for delivering packets between different networks?",
        options: ["Network", "Data link", "Transport", "Session"],
        answer: 0,
        why: "Layer 3 handles logical addressing and routing between networks.",
      },
      {
        q: "Ping to a remote server works, but the web page will not load. Which layers are most likely fine?",
        options: ["Only layer 7", "Layers 1 to 3", "Layers 4 to 7", "None of them"],
        answer: 1,
        why: "A working ping proves the physical, data link and network path, so look at layer 4 and up.",
      },
      {
        q: "Which statement about OSPF and BGP is true?",
        options: ["Both run over UDP", "OSPF runs over TCP 179 and BGP over IP 89", "OSPF runs directly over IP (protocol 89) and BGP over TCP port 179", "Both are layer 2 protocols"],
        answer: 2,
        why: "OSPF uses IP protocol number 89, while BGP sessions use TCP port 179.",
      },
      {
        q: "Why is the layered model useful when changing technology?",
        options: ["You can change one layer, like Wi-Fi to Ethernet, without changing the others", "It makes packets smaller", "It removes the need for headers", "It lets switches route IP"],
        answer: 0,
        why: "Each layer only depends on the service of the one below, so layers can be swapped independently.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Place each item on its OSI layer: Ethernet switch, HTTP, IP router, fibre cable, TCP, MAC address, port 443.",
        hint: "Ask which header or signal each one deals with.",
        solution: "Fibre cable: layer 1\nEthernet switch, MAC address: layer 2\nIP router: layer 3\nTCP, port 443: layer 4\nHTTP: layer 7",
      },
      {
        level: "medium",
        task: "Write one Linux command that tests each of layers 1, 2, 3, 4 and 7 for the web server 10.0.20.15 on port 443.",
        hint: "ethtool, ip neigh, ping, nc and curl cover the five layers.",
        solution: "L1: ethtool eth0 | grep 'Link detected'\nL2: ping -c1 10.0.20.15; ip neigh | grep 10.0.20.15   # if on the same subnet\nL3: ping -c 3 10.0.20.15\nL4: nc -zv 10.0.20.15 443\nL7: curl -vk https://10.0.20.15/",
      },
      {
        level: "hard",
        task: "A user reports: email works, websites by name fail, but ping 1.1.1.1 works. Using layers, list your next three tests and what each result would prove.",
        hint: "Layer 3 is proven. Names involve DNS, which is an application protocol.",
        solution: "1. dig example.com: fails = DNS (L7) problem; works = names resolve\n2. dig @1.1.1.1 example.com: works = local resolver broken, not DNS itself\n3. curl -v --resolve example.com:80:IP_FROM_STEP_2 http://example.com/\n   works = HTTP path fine, so only name lookup is broken\nCheck /etc/resolv.conf or resolvectl status for a wrong DNS server.",
      },
    ],
    faq: [
      { q: "Do real networks use the OSI model?", a: "Not its protocols. The internet runs the TCP/IP suite, but everyone still uses OSI layer numbers to describe where a device or problem sits." },
      { q: "What is the easiest way to remember the seven layers?", a: "From layer 1 up: Please Do Not Throw Sausage Pizza Away (Physical, Data link, Network, Transport, Session, Presentation, Application)." },
      { q: "Is a layer 3 switch a router?", a: "Functionally yes for routing between VLANs: it forwards by IP address in hardware. It usually has fewer WAN features than a dedicated router, such as advanced NAT or VPNs." },
      { q: "Which layer is DNS?", a: "DNS is an application layer (layer 7) protocol. It normally uses UDP port 53 and falls back to TCP port 53 for large answers." },
    ],
  },

  "net-foundations/tcpip-encapsulation": {
    plain: [
      "The TCP/IP model is the one the internet really uses. It has four layers instead of seven: application, transport, internet and link. The top three OSI layers fold into application, and the bottom two fold into link.",
      "When you send data, it travels down the layers. Each layer wraps what it got from above in its own header, like putting a letter in an envelope, then that envelope in a bigger one. When the data arrives, the receiver opens the envelopes in reverse order. This wrapping is called encapsulation.",
      "Each wrapped unit has a name. TCP makes segments, UDP makes datagrams, IP makes packets, and Ethernet makes frames. Knowing the names helps you read tools like Wireshark and talk clearly with other engineers.",
      "Every header costs bytes. A normal Ethernet frame can carry 1500 bytes of payload, called the MTU. IP and TCP headers take at least 40 of those bytes, so a full packet carries at most 1460 bytes of your actual data. When tunnels add more headers, the space for data shrinks further.",
    ],
    deepDive: [
      {
        heading: "TCP/IP layers next to OSI",
        body: "The TCP/IP model, described in RFC 1122, has four layers. The application layer covers OSI layers 5, 6 and 7: HTTP, DNS, TLS and SSH all live here, and each app handles its own sessions and encoding. The transport layer matches OSI layer 4: TCP and UDP, with port numbers. The internet layer matches OSI layer 3: IPv4, IPv6 and ICMP. The link layer covers OSI layers 1 and 2: Ethernet, Wi-Fi and the physical signals.\n\nSome textbooks show a five-layer hybrid that splits link into data link and physical. It is the same idea, just with the hardware layer named separately. Whichever version you use, the numbers engineers say out loud (layer 2, layer 3, layer 7) are still the OSI numbers.",
        visual: {
          type: "compare",
          title: "How the two models line up",
          columns: [
            { title: "OSI (7 layers)", points: ["5, 6, 7: session, presentation, application", "4: transport", "3: network", "1, 2: physical, data link"] },
            { title: "TCP/IP (4 layers)", points: ["Application: HTTP, DNS, TLS, SSH", "Transport: TCP, UDP", "Internet: IPv4, IPv6, ICMP", "Link: Ethernet, Wi-Fi"] },
          ],
        },
      },
      {
        heading: "The exact headers, byte by byte",
        body: "Each layer adds a known number of bytes. TCP adds a 20-byte header, up to 60 with options. UDP adds a fixed 8 bytes. IPv4 adds 20 bytes, up to 60 with options, and IPv6 adds a fixed 40-byte header. Ethernet II adds a 14-byte header (two 6-byte MAC addresses and a 2-byte EtherType) and a 4-byte FCS trailer. An 802.1Q VLAN tag adds 4 more bytes.\n\nOn the wire there is more: every frame is preceded by a 7-byte preamble and 1-byte start frame delimiter, and followed by a 12-byte interframe gap. So a full 1500-byte IP packet costs 1538 bytes of wire time. The smallest Ethernet frame is 64 bytes (header, 46-byte payload and FCS); shorter payloads are padded.",
        bullets: ["TCP 20 to 60, UDP 8", "IPv4 20 to 60, IPv6 40 fixed", "Ethernet header 14 + FCS 4, VLAN tag +4", "Preamble and SFD 8, interframe gap 12", "Minimum frame 64 bytes, maximum standard 1518 (1522 tagged)"],
      },
      {
        heading: "What changes at each hop, and what does not",
        body: "As a packet crosses the internet, each router removes the incoming Ethernet frame, reads the IP header, decides the next hop and builds a brand-new frame for the next link with new source and destination MAC addresses. The IP addresses stay the same end to end, unless a NAT device rewrites them.\n\nThe router does change two IP fields: it lowers the TTL (hop limit in IPv6) by one, and in IPv4 it recalculates the header checksum because the TTL changed. The TCP segment inside is not touched by plain routers, which is why TCP's own checksum still works at the far end. Firewalls and load balancers may look deeper, but a pure router stops at layer 3.",
        visual: {
          type: "flow",
          title: "Inside one router hop",
          steps: [
            { label: "Frame arrives", detail: "Destination MAC is the router's" },
            { label: "Strip frame", detail: "Check FCS, remove Ethernet header" },
            { label: "Read IP header", detail: "Look up destination, TTL minus 1" },
            { label: "Find next hop MAC", detail: "ARP or neighbour cache lookup" },
            { label: "New frame out", detail: "New MACs, new FCS, same IPs" },
          ],
        },
      },
      {
        heading: "MTU, MSS and tunnel overhead",
        body: "The MTU is the largest IP packet a link can carry: 1500 bytes on standard Ethernet. TCP's maximum segment size (MSS) is the data that fits after the IP and TCP headers: 1500 - 20 - 20 = 1460 bytes for IPv4, and 1440 for IPv6. Linux usually enables TCP timestamps, which add 12 option bytes, so each full segment really carries 1448 bytes.\n\nTunnels shrink the space further. PPPoE DSL links have an MTU of 1492. VXLAN adds 50 bytes of outer headers. WireGuard adds 60 bytes over IPv4 (80 over IPv6), which is why its default interface MTU is 1420. When a packet is too big and cannot be fragmented, it is dropped and an ICMP message should report it. If that message is blocked, you get the classic symptom: small requests work, big ones hang.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Byte budget of one full TCP/IPv4 frame on the wire",
        layers: [
          { label: "Preamble + SFD", detail: "8 bytes, before the frame" },
          { label: "Ethernet header", detail: "14 bytes: MACs and EtherType" },
          { label: "IPv4 header", detail: "20 bytes" },
          { label: "TCP header", detail: "20 bytes (32 with timestamps)" },
          { label: "Your data", detail: "1460 bytes (1448 with timestamps)" },
          { label: "FCS + interframe gap", detail: "4 + 12 bytes" },
        ],
      },
    ],
    examples: [
      {
        title: "Why 1 Gbps Ethernet gives about 941 Mbps in iperf3",
        explanation: "Step 1: one full frame uses 1538 bytes of wire time (1500 IP packet + 14 header + 4 FCS + 8 preamble + 12 gap). Step 2: with TCP timestamps, the data inside is 1500 - 20 IP - 32 TCP = 1448 bytes. Step 3: efficiency is 1448 / 1538 = 94.1 percent. Step 4: 94.1 percent of 1000 Mbps is about 941 Mbps, which is exactly the number iperf3 usually shows on a clean gigabit link. Nothing is broken; that is the overhead of the headers.",
      },
      {
        title: "Finding the real path MTU with ping",
        explanation: "Over a VPN, web pages half-load. Step 1: send a ping that exactly fills a 1500-byte packet: 1472 bytes of data + 8 ICMP header + 20 IPv4 header = 1500. Step 2: set the do-not-fragment flag with -M do. Step 3: if it fails with Message too long or no reply, lower the size until it works. Step 4: if 1392 works but 1393 does not, the path MTU is 1392 + 28 = 1420. Step 5: set the interface MTU or clamp TCP MSS on the VPN gateway to fit.",
        code: {
          lang: "bash",
          code: "ping -M do -s 1472 -c 2 10.8.0.1   # 1500-byte packet, DF set\nping -M do -s 1392 -c 2 10.8.0.1   # 1420-byte packet\ntracepath 10.8.0.1                 # reports pmtu per hop\nip link show wg0 | grep mtu",
        },
      },
    ],
    cheatSheet: [
      "PDUs: segment (TCP) or datagram (UDP), packet (IP), frame (Ethernet), bits",
      "Headers: TCP 20+, UDP 8, IPv4 20+, IPv6 40, Ethernet 14 + 4 FCS",
      "Ethernet MTU 1500, so TCP MSS is 1460 over IPv4 and 1440 over IPv6",
      "ping -M do -s 1472 tests a full 1500-byte path without fragmentation",
      "Routers change MACs and TTL at every hop; IPs stay the same unless NAT",
      "Tunnel MTUs: PPPoE 1492, WireGuard 1420 by default, VXLAN needs 50 extra bytes",
      "IPv6 minimum link MTU is 1280 bytes",
    ],
    quiz: [
      {
        q: "What is the TCP MSS on a standard Ethernet link with IPv4 and no TCP options?",
        options: ["1500", "1480", "1460", "1440"],
        answer: 2,
        why: "1500 MTU minus 20 bytes of IPv4 header and 20 bytes of TCP header leaves 1460.",
      },
      {
        q: "Which TCP/IP layer corresponds to OSI layers 5, 6 and 7?",
        options: ["Transport", "Application", "Internet", "Link"],
        answer: 1,
        why: "TCP/IP folds session, presentation and application into one application layer.",
      },
      {
        q: "A packet crosses three routers. Which field is rewritten at every hop?",
        options: ["Destination MAC address", "Destination IP address", "TCP destination port", "TCP sequence number"],
        answer: 0,
        why: "Each router builds a new frame for the next link, with new MAC addresses.",
      },
      {
        q: "How large is the fixed IPv6 header?",
        options: ["20 bytes", "8 bytes", "60 bytes", "40 bytes"],
        answer: 3,
        why: "IPv6 uses a fixed 40-byte header; options move to extension headers.",
      },
      {
        q: "Small web requests over a tunnel work, but large downloads hang. What is the most likely cause?",
        options: ["Wrong DNS server", "An MTU problem with blocked ICMP Packet Too Big messages", "TCP port 80 is closed", "The MAC table is full"],
        answer: 1,
        why: "Large packets exceed the tunnel MTU and are dropped, and the sender never hears why.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Capture three packets of a web request and identify the Ethernet, IP and TCP parts of one packet.",
        hint: "tcpdump -e shows the Ethernet header; -nn keeps numbers instead of names.",
        solution: "sudo tcpdump -i any -nn -e -c 3 'tcp port 80' &\ncurl -s http://example.com > /dev/null\n# Each line shows: MACs and ethertype IPv4 (link),\n# source.port > dest.port with IPs (internet + transport),\n# Flags [S], seq, win, length (TCP header fields)",
      },
      {
        level: "medium",
        task: "Compute the maximum UDP payload in one unfragmented packet over a standard Ethernet link, for IPv4 and for IPv6.",
        hint: "Subtract the IP header and the 8-byte UDP header from 1500.",
        solution: "IPv4: 1500 - 20 - 8 = 1472 bytes\nIPv6: 1500 - 40 - 8 = 1452 bytes\n(1472 is also why ping -s 1472 fills a 1500-byte packet:\n ICMP echo header is 8 bytes, the same size as UDP's)",
      },
      {
        level: "hard",
        task: "A VXLAN overlay runs over an underlay with MTU 1500. What inner MTU should VMs use? What underlay MTU would let VMs keep 1500?",
        hint: "Inside the underlay IP packet you need an outer IPv4 header (20), UDP (8), VXLAN (8) and the inner Ethernet header (14).",
        solution: "Outer headers inside the underlay MTU: IPv4 20 + UDP 8 + VXLAN 8 = 36\nplus the inner Ethernet header 14 = 50 bytes total overhead\nInner MTU on a 1500 underlay: 1500 - 50 = 1450\nTo keep VMs at 1500: underlay MTU at least 1550\nIn practice, data centres set jumbo frames (9000 or 9216).",
      },
    ],
    faq: [
      { q: "What is the difference between a segment and a packet?", a: "A segment is the TCP unit: a TCP header plus data. A packet is the IP unit: an IP header plus whatever it carries, usually a segment. The segment sits inside the packet." },
      { q: "What are jumbo frames?", a: "Ethernet frames with an MTU above 1500, commonly 9000 bytes. They cut header overhead and CPU work in data centres and storage networks, but every device on the path must support the same size." },
      { q: "Does every router fragment packets that are too big?", a: "Only for IPv4 packets without the Don't Fragment bit. IPv6 routers never fragment; only the sending host can, after learning the path MTU from ICMPv6 Packet Too Big messages." },
      { q: "Why does Wireshark show frames bigger than 1500 bytes?", a: "Usually because the network card does segmentation offload (TSO or GRO), joining or splitting packets in hardware. Wireshark sees them before splitting or after joining, so they look larger than the MTU." },
    ],
  },
};

export default extra;
