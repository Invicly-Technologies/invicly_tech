import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "net-routing/routing-fundamentals": {
    plain: [
      "A router is a device that connects different networks and passes packets between them. When a packet arrives, the router reads only one thing to decide where it goes: the destination IP address. Then it looks in its routing table, a list that says \"for these addresses, send the packet that way\".",
      "Each line in the table has a prefix, such as 10.1.2.0/24, which is a group of addresses, and a next hop, which is the neighbour router to hand the packet to. Often several lines match the same address. The rule is simple: the most specific line wins. A /24 is more specific than a /16, which is more specific than a /8. This rule is called longest-prefix match.",
      "Your laptop has a routing table too, usually with just two lines: \"my own local network is right here\" and \"everything else goes to the default gateway\". The default gateway is your home router, the door out of your network.",
      "No router knows the whole path. Each one only picks the next hop, and the next router decides again. A packet crosses the internet like a parcel passed between post offices, each one only knowing which office is closer to the address.",
    ],
    deepDive: [
      {
        heading: "Reading a real routing table",
        body: "On Linux, ip route prints one route per line. default via 192.168.1.1 dev wlan0 proto dhcp metric 600 means: anything without a better match goes to 192.168.1.1 out of wlan0, the route came from DHCP, and its metric (preference, lower is better) is 600. A line like 192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.42 has no via, so that network is directly attached: scope link means destinations are reachable on the wire without a gateway, and src is the source address Linux will use.\n\nOn Cisco IOS, show ip route marks each route with a code: C connected, L local (the router's own address as a /32), S static, O OSPF, B BGP, and an asterisk for a candidate default. A route like O 10.1.0.0/16 [110/20] via 172.16.0.6 shows the administrative distance (110) and the metric (20) in brackets.",
        bullets: ["via = next hop; no via = directly connected", "proto kernel, static, dhcp or a routing daemon name", "Cisco [110/20] = [distance/metric]", "Gateway of last resort = the default route"],
      },
      {
        heading: "Longest prefix first, then distance, then metric",
        body: "Lookups follow a strict order. First, find every route whose prefix contains the destination and keep only the longest prefix length. Prefix length always wins: a /24 from RIP beats a /16 from OSPF, even though OSPF is more trusted.\n\nOnly when two sources offer the same prefix does trust matter. Cisco calls this administrative distance (AD): connected 0, static 1, eBGP 20, OSPF 110, IS-IS 115, RIP 120, iBGP 200. The lowest AD gets installed in the table. If one protocol offers several paths to the same prefix, its own metric decides, such as OSPF cost. Equal metrics can all be installed, which is called ECMP (equal-cost multipath), and traffic is spread across them, usually per flow so packets of one connection stay in order.\n\nLinux has no AD; it simply uses the metric field, and the proto field records where a route came from.",
        visual: {
          type: "flow",
          title: "How one route is chosen",
          steps: [
            { label: "All matches", detail: "Prefixes that contain the destination." },
            { label: "Longest prefix", detail: "Most specific always wins." },
            { label: "Lowest distance", detail: "Only for the same prefix from different sources." },
            { label: "Lowest metric", detail: "Within one routing protocol." },
            { label: "ECMP", detail: "Equal metrics: spread flows across paths." },
          ],
        },
      },
      {
        heading: "What the default gateway really does",
        body: "Before sending, a host compares the destination with its own prefix. If the destination is on the same subnet, the host uses ARP to find the destination's MAC address and sends the frame straight to it. If not, it uses ARP to find the gateway's MAC address instead.\n\nThis is the key detail: the IP destination in the packet stays the final server, but the Ethernet frame is addressed to the gateway's MAC. The gateway strips the frame, looks up the IP destination in its own table, and builds a brand new frame for the next link. MAC addresses change on every hop; IP addresses do not (unless NAT rewrites them).\n\nThat is also why the gateway must be inside the host's own subnet. A host cannot ARP for an address that is not on its local link, so a gateway outside the subnet simply does not work.",
        visual: {
          type: "sequence",
          title: "Host 192.168.1.42 sends to 93.184.215.14",
          actors: ["Host", "Gateway R1", "Router R2", "Server"],
          messages: [
            { from: 0, to: 1, label: "ARP: who has 192.168.1.1?" },
            { from: 1, to: 0, label: "ARP reply: R1's MAC" },
            { from: 0, to: 1, label: "Frame to R1's MAC, IP to the server, TTL 64" },
            { from: 1, to: 2, label: "New frame to R2's MAC, TTL 63" },
            { from: 2, to: 3, label: "New frame to the server's MAC, TTL 62" },
          ],
        },
      },
      {
        heading: "Following a packet hop by hop",
        body: "Every router makes an independent decision based on its own table. Nothing in the packet records the planned path. That has three consequences.\n\nFirst, the return path is a separate decision made by other tables, so traffic can go out one way and come back another (asymmetric routing). That is normal on the internet but can confuse stateful firewalls.\n\nSecond, if two routers point at each other for some destination, the packet bounces between them. The TTL (time to live) field stops it: every router subtracts 1, and at 0 the packet is dropped and an ICMP Time Exceeded message (type 11) is sent back. Linux starts at TTL 64 and Windows at 128.\n\nThird, you can test each decision directly. ip route get 8.8.8.8 asks the Linux kernel which route, interface and source address it would use. traceroute and mtr exploit the TTL to list each hop.",
        bullets: ["ip route get ADDRESS tests one lookup", "traceroute -n skips slow DNS lookups", "mtr combines ping and traceroute over time"],
      },
      {
        heading: "Under the hood: RIB, FIB and multiple tables",
        body: "Routers keep two tables. The RIB (routing information base) holds every route learned from every source, including the losers. The best ones are copied into the FIB (forwarding information base), a structure optimised for fast lookup. Hardware routers often use special memory called TCAM that checks all prefixes in parallel; software routers use tries (prefix trees). show ip route shows the RIB view.\n\nLinux also has several routing tables. The local table holds the host's own and broadcast addresses (ip route show table local), and main is the one ip route shows by default. ip rule decides which table each packet consults, which enables policy routing: for example, traffic from one source address uses a different default gateway. VPN clients often add rules and tables this way, which is why ip route alone does not always explain what happens.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where routes come from",
        root: "Routing table",
        children: [
          { label: "Connected", children: ["Interface has an address and is up", "Cisco AD 0"] },
          { label: "Static", children: ["Typed by an admin", "Cisco AD 1"] },
          { label: "Interior protocols", children: ["OSPF AD 110", "IS-IS AD 115", "RIP AD 120"] },
          { label: "BGP", children: ["eBGP AD 20", "iBGP AD 200"] },
          { label: "Host extras", children: ["DHCP default route", "VPN client routes"] },
        ],
      },
    ],
    examples: [
      {
        title: "Predicting the next hop on a Cisco router",
        explanation: "Four lookups against the table below. 10.1.2.50 matches the /8, the /16 and the /24; the /24 wins, and it is directly connected, so the router ARPs for 10.1.2.50 itself. 10.1.9.9 matches the /8 and the /16; the /16 wins, so it goes via 172.16.0.6, even though the static /8 has a better AD. 10.200.0.1 matches only the /8, so it goes via 172.16.0.2. 8.8.8.8 matches only the default route and goes to the ISP at 203.0.113.1.",
        code: {
          lang: "text",
          code: `R1# show ip route
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 203.0.113.1
S     10.0.0.0/8 [1/0] via 172.16.0.2
O     10.1.0.0/16 [110/20] via 172.16.0.6, 00:12:01, GigabitEthernet0/1
C     10.1.2.0/24 is directly connected, GigabitEthernet0/2
L     10.1.2.1/32 is directly connected, GigabitEthernet0/2`,
        },
      },
      {
        title: "Why a laptop on a VPN uses two routes",
        explanation: "The laptop is on home Wi-Fi and connected to a company VPN. Step 1: ip route shows a default via the home router, the home /24, and a 10.8.0.0/24 route on the tun0 VPN interface. Step 2: ip route get 10.8.0.10 picks tun0, because the /24 is longer than the default /0. Step 3: ip route get 1.1.1.1 matches only the default, so normal internet traffic leaves through Wi-Fi. This is called split tunnelling: only company prefixes enter the VPN.",
        code: {
          lang: "bash",
          code: `$ ip route
default via 192.168.1.1 dev wlan0 proto dhcp metric 600
10.8.0.0/24 dev tun0 proto kernel scope link src 10.8.0.2
192.168.1.0/24 dev wlan0 proto kernel scope link src 192.168.1.42 metric 600

$ ip route get 10.8.0.10
10.8.0.10 dev tun0 src 10.8.0.2 uid 1000

$ ip route get 1.1.1.1
1.1.1.1 via 192.168.1.1 dev wlan0 src 192.168.1.42 uid 1000`,
        },
      },
    ],
    cheatSheet: [
      "Longest prefix wins first; administrative distance only breaks ties for the same prefix",
      "Cisco AD: connected 0, static 1, eBGP 20, OSPF 110, IS-IS 115, RIP 120, iBGP 200",
      "ip route get 8.8.8.8 shows the route, interface and source IP Linux would use",
      "ip route show table local lists the host's own and broadcast addresses",
      "Each router lowers TTL by 1; at 0 it drops the packet and sends ICMP Time Exceeded (type 11)",
      "The gateway must be in the host's subnet; the IP destination stays fixed while MACs change per hop",
      "Cisco codes: C connected, L local /32, S static, O OSPF, B BGP, * candidate default",
      "Routing is decided per direction: always check the return path",
    ],
    quiz: [
      {
        q: "A router has 10.0.0.0/8 (static, AD 1) and 10.1.0.0/16 (OSPF, AD 110). Where does a packet to 10.1.4.4 go?",
        options: ["The static route, because AD 1 is lower", "It is load-balanced across both", "The OSPF route, because /16 is the longer prefix", "It is dropped as ambiguous"],
        answer: 2,
        why: "Longest-prefix match is applied before administrative distance.",
      },
      {
        q: "Host 192.168.1.42/24 sends a packet to 8.8.8.8. What is the destination MAC of the frame it sends?",
        options: ["The default gateway's MAC address", "8.8.8.8's MAC address", "The broadcast MAC ff:ff:ff:ff:ff:ff", "The host's own MAC address"],
        answer: 0,
        why: "Off-subnet traffic is framed to the gateway, while the IP destination stays 8.8.8.8.",
      },
      {
        q: "In the Cisco route O 10.1.0.0/16 [110/20], what do 110 and 20 mean?",
        options: ["TTL 110, hop count 20", "Metric 110, distance 20", "Age 110 seconds, 20 hops", "Administrative distance 110, OSPF metric 20"],
        answer: 3,
        why: "The bracket shows [administrative distance/metric].",
      },
      {
        q: "A static route and an OSPF route both exist for exactly 10.5.0.0/16. Which goes into the routing table on Cisco?",
        options: ["The OSPF route", "The static route", "Both, as ECMP", "Whichever was learned first"],
        answer: 1,
        why: "Same prefix, so the lower administrative distance wins: static 1 beats OSPF 110.",
      },
      {
        q: "A routing loop makes a packet bounce between two routers. What eventually stops it?",
        options: ["The checksum fails", "ARP times out", "The TTL reaches 0 and the packet is dropped", "The packet grows too large"],
        answer: 2,
        why: "Each hop decrements TTL, and at 0 the router discards the packet and sends ICMP Time Exceeded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A router has routes 0.0.0.0/0 via A, 172.16.0.0/12 via B, 172.16.8.0/21 via C and 172.16.10.0/24 via D. Give the next hop for 172.16.10.5, 172.16.12.1, 172.20.1.1 and 192.168.0.1.",
        hint: "A /21 covers 8 consecutive /24s starting at a multiple of 8.",
        solution: "172.16.10.5 -> D (the /24 is the longest match)\n172.16.12.1 -> C (172.16.8.0/21 covers 172.16.8.0 to 172.16.15.255)\n172.20.1.1 -> B (172.16.0.0/12 covers 172.16.0.0 to 172.31.255.255)\n192.168.0.1 -> A (only the default matches)",
      },
      {
        level: "medium",
        task: "Routes 172.16.4.0/23 and 172.16.5.128/25 exist. Show in binary which routes match 172.16.5.130 and 172.16.5.100, and which one wins for each.",
        hint: "Only the third and fourth octets matter. Write 5 and the last octet in binary.",
        solution: "/23 fixes the first 23 bits: third octet 0000010x, so 4 and 5 both match.\n/25 fixes third octet 00000101 and the top bit of the fourth octet = 1 (128-255).\n172.16.5.130: fourth octet 10000010, top bit 1 -> matches /23 and /25; /25 wins.\n172.16.5.100: fourth octet 01100100, top bit 0 -> matches only /23.",
      },
      {
        level: "hard",
        task: "Write a Python longest-prefix-match lookup using the standard ipaddress module for a table with a default route, a /8, a /16 and a /24. Test four destinations.",
        hint: "ip in network tests membership; pick the match with the largest prefixlen.",
        solution: `import ipaddress

routes = {"0.0.0.0/0": "ISP", "10.0.0.0/8": "R2", "10.1.0.0/16": "R3", "10.1.2.0/24": "eth1"}
table = [(ipaddress.ip_network(p), hop) for p, hop in routes.items()]

def lookup(dst):
    ip = ipaddress.ip_address(dst)
    return max((net.prefixlen, hop) for net, hop in table if ip in net)[1]

for d in ["10.1.2.3", "10.1.9.9", "10.200.0.1", "8.8.8.8"]:
    print(d, "->", lookup(d))     # eth1, R3, R2, ISP`,
      },
    ],
    faq: [
      { q: "What is the difference between a router and a default gateway?", a: "A router is any device that forwards packets between networks. The default gateway is the specific router a host sends traffic to when the destination is not on its own subnet." },
      { q: "Why does my laptop show two default routes?", a: "Usually one per connection, such as Wi-Fi and Ethernet. Linux uses the one with the lowest metric, which is why wired connections normally get a lower metric than Wi-Fi." },
      { q: "What is the difference between the RIB and the FIB?", a: "The RIB holds all routes learned from every source. The FIB holds only the chosen best routes, in a form built for fast forwarding lookups." },
      { q: "Does traceroute show the path my replies take?", a: "No. It shows the forward path only. The return path is chosen by other routers' tables and can be different." },
    ],
  },

  "net-routing/static-routing": {
    plain: [
      "A static route is a line you type into a router's table by hand: \"to reach network X, send packets to neighbour Y\". It stays exactly as you typed it until you change it. The router never learns it, checks it or updates it on its own.",
      "Static routes are perfect for small, simple setups. A branch office with one internet link needs just one: a default route pointing at the ISP. Two small offices joined by one link need one route on each side.",
      "The catch is that static routes do not react to problems. If a link far away breaks, the static route still points that way, and traffic disappears into a black hole. And in a big network, you would have to type and maintain hundreds of routes on every router.",
      "The most common mistake is forgetting that traffic must come back. If router A knows how to reach network B, but router B does not know how to reach network A, your ping goes out fine and the replies are lost.",
    ],
    deepDive: [
      {
        heading: "Three ways to write a static route",
        body: "On Cisco IOS the format is ip route NETWORK MASK NEXT-HOP-OR-INTERFACE [DISTANCE]. With a next-hop IP, such as ip route 10.2.0.0 255.255.255.0 172.16.0.2, the router does a second lookup to find how to reach 172.16.0.2 (a recursive lookup). With only an exit interface, such as ip route 10.2.0.0 255.255.255.0 Serial0/0, it treats the network as directly attached. That is fine on point-to-point links, but on Ethernet the router must ARP for every single destination and relies on the neighbour answering for them (proxy ARP). The fully specified form gives both: ip route 10.2.0.0 255.255.255.0 GigabitEthernet0/1 172.16.0.2.\n\nThe default distance is 1. Adding a number at the end, such as 250, makes it a floating static route: it only appears in the table when every better route to the same prefix is gone.",
        bullets: ["Next hop IP: recursive lookup", "Exit interface only: OK on point-to-point links", "Both: clearest on Ethernet", "Distance at the end makes it a backup"],
      },
      {
        heading: "When a static route disappears, and when it does not",
        body: "A static route is removed from the table when its exit interface goes down, or when the next hop can no longer be reached through any route. That covers a cable unplugged from the router itself.\n\nIt does not cover a failure further away. If the next hop router is still up but its own uplink to the ISP is dead, your router keeps sending traffic there, and it is silently dropped. Floating backups only help if the main route actually leaves the table.\n\nCisco solves this with IP SLA and object tracking: the router pings a target beyond the link and removes the route when the pings fail. Dynamic routing protocols solve it naturally, because they detect lost neighbours and recalculate. Linux is similar: a route stays while its interface is up, whatever lies beyond the next hop, and by default even a cable losing carrier only marks the route linkdown.",
        visual: {
          type: "compare",
          title: "Does the static route leave the table?",
          columns: [
            { title: "Removed automatically", points: ["Exit interface goes down", "Cable unplugged at this router", "Next hop no longer reachable by any route"] },
            { title: "Stays, traffic black-holed", points: ["Next hop router's uplink fails", "A link two hops away breaks", "Next hop is up but misconfigured"] },
          ],
        },
      },
      {
        heading: "Static routes on Linux",
        body: "ip route add 10.2.0.0/24 via 172.16.0.2 dev eth0 adds a route, ip route del removes it, and ip route replace adds or overwrites in one step, which is handy in scripts. ip route add default via 192.168.1.1 sets the default gateway. ip route add blackhole 10.9.0.0/16 silently drops traffic to a range.\n\nThese commands change only the running kernel and are lost on reboot. To make them permanent, put them in your network configuration. With netplan (Ubuntu), add a routes list under the interface with to: 10.2.0.0/24 and via: 172.16.0.2. With NetworkManager, run nmcli connection modify eth0 +ipv4.routes \"10.2.0.0/24 172.16.0.2\" and bring the connection up again.\n\nIf the Linux box should forward packets between interfaces, enable forwarding: sysctl -w net.ipv4.ip_forward=1, and save it in a file under /etc/sysctl.d/ so it survives reboots.",
        bullets: ["ip route replace is idempotent: safe to run twice", "Routes from ip route add vanish on reboot", "Forwarding is off by default on most distributions"],
      },
      {
        heading: "Troubleshooting a missing return route",
        body: "The classic symptom: from LAN A you ping a host in LAN B and get timeouts, yet the far router's interface answers. Work in both directions. On the far host, run tcpdump -ni eth0 icmp. If echo requests arrive and replies leave, the forward path is fine and the reply is lost on the way back. Then check, router by router, whether each one has a route to LAN A: show ip route 10.1.0.5 on Cisco or ip route get 10.1.0.5 on Linux.\n\nOften the far router has no route back and sends the reply to its own default route, usually the ISP, which drops private addresses. A second cause on Linux is reverse path filtering. With net.ipv4.conf.all.rp_filter=1 (strict mode), the kernel drops packets that arrive on an interface it would not use to reply, which breaks asymmetric paths. Setting 2 (loose mode) only checks that some route back exists.",
        visual: {
          type: "sequence",
          title: "Ping fails because R2 has no route back",
          actors: ["Host A 10.1.0.5", "R1", "R2", "Host B 10.2.0.9"],
          messages: [
            { from: 0, to: 1, label: "Echo request to 10.2.0.9" },
            { from: 1, to: 2, label: "R1 has a route to 10.2.0.0/24" },
            { from: 2, to: 3, label: "Delivered on LAN B" },
            { from: 3, to: 2, label: "Echo reply to 10.1.0.5" },
            { from: 2, to: 2, label: "No route to 10.1.0.0/24: reply lost" },
          ],
        },
      },
      {
        heading: "Summaries, null routes and when to stop using static",
        body: "You can cover many networks with one summary route. If a branch uses 10.2.0.0/24 to 10.2.3.0/24, one route to 10.2.0.0/22 replaces four. On the branch router, add ip route 10.2.0.0 255.255.252.0 Null0 too. Null0 is a discard interface: traffic for an unused part of the summary is dropped there instead of following the default route back to headquarters and looping until the TTL runs out. More specific routes still win, so the real subnets keep working.\n\nStatic routing scales badly. Every router needs a route to every network it is not connected to, in both directions, and every change means editing several devices by hand. A good rule: static for stub sites, default routes and a few fixed paths; a dynamic protocol such as OSPF once you have several routers or more than one path. Cloud route tables, such as those in a VPC, are static routes too, and follow the same longest-prefix rules.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Adding a static route safely",
        steps: [
          { label: "Plan both directions", detail: "Forward and return route on every hop." },
          { label: "Check the next hop", detail: "It must be directly reachable." },
          { label: "Add the route", detail: "ip route on Cisco, ip route add on Linux." },
          { label: "Verify the lookup", detail: "show ip route x or ip route get x." },
          { label: "Test end to end", detail: "Ping and traceroute from a host." },
          { label: "Make it permanent", detail: "Save config, netplan or nmcli." },
        ],
      },
    ],
    examples: [
      {
        title: "Two offices with an ISP and a backup LTE link",
        explanation: "R1 (office A, 10.1.0.0/24) connects to R2 (office B, 10.2.0.0/24) over 172.16.0.0/30. R1 also has the internet uplink. Step 1: on R1, a route to LAN B via R2, a default route to the ISP, and a floating default with distance 250 via an LTE router, used only if the main uplink interface goes down. Step 2: on R2, a route back to LAN A and a default route via R1, so office B also reaches the internet. Step 3: verify with show ip route static and a sourced ping, which tests the return path too.",
        code: {
          lang: "text",
          code: `! R1
ip route 10.2.0.0 255.255.255.0 172.16.0.2
ip route 0.0.0.0 0.0.0.0 203.0.113.1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 250
! R2
ip route 10.1.0.0 255.255.255.0 172.16.0.1
ip route 0.0.0.0 0.0.0.0 172.16.0.1
! verify on R1
show ip route static
ping 10.2.0.10 source 10.1.0.1`,
        },
      },
      {
        title: "A Linux server as a router to a lab network",
        explanation: "A Linux box has eth0 on the office LAN and eth1 on 192.168.50.0/24, where another router at 192.168.50.2 leads to a lab network 10.3.0.0/24. Step 1: enable forwarding now and on every boot. Step 2: add the route to the lab with ip route replace, so the script is safe to rerun. Step 3: check the lookup with ip route get. Step 4: remember the office routers and the lab router also need routes pointing back through this box, or replies will be lost.",
        code: {
          lang: "bash",
          code: `sudo sysctl -w net.ipv4.ip_forward=1
echo 'net.ipv4.ip_forward=1' | sudo tee /etc/sysctl.d/99-forward.conf
sudo ip route replace 10.3.0.0/24 via 192.168.50.2 dev eth1
ip route get 10.3.0.20
# 10.3.0.20 via 192.168.50.2 dev eth1 src 192.168.50.1 uid 1000
ping -c 3 10.3.0.20`,
        },
      },
    ],
    cheatSheet: [
      "Cisco: ip route 10.2.0.0 255.255.255.0 172.16.0.2; default: ip route 0.0.0.0 0.0.0.0 NEXT-HOP",
      "Floating static: add a distance, e.g. ip route 0.0.0.0 0.0.0.0 198.51.100.1 250",
      "Linux: ip route add 10.2.0.0/24 via 172.16.0.2 dev eth0; ip route replace is safe to rerun",
      "Linux routes added by hand vanish on reboot: use netplan or nmcli to persist them",
      "Enable forwarding: sysctl -w net.ipv4.ip_forward=1 and save it under /etc/sysctl.d/",
      "A summary route plus a Null0 (or blackhole) route prevents loops for unused subnets",
      "Ping works one way only? Check the return route on every router, then rp_filter",
    ],
    quiz: [
      {
        q: "A floating static default route has distance 250, and OSPF also provides a default route. Which is used?",
        options: ["The OSPF route, until it disappears", "The static route, because static always wins", "Both, as ECMP", "Neither, they conflict"],
        answer: 0,
        why: "OSPF's distance 110 is lower than 250, so the static route stays hidden as a backup.",
      },
      {
        q: "You added a route with ip route add on Linux, and it is gone after a reboot. Why?",
        options: ["The kernel deletes unused routes", "The route had a syntax error", "DHCP removed it", "ip route only changes the running kernel; nothing saved it"],
        answer: 3,
        why: "Persistent routes belong in netplan, NetworkManager or your distribution's network config.",
      },
      {
        q: "What is the drawback of a static route that names only an Ethernet exit interface?",
        options: ["It cannot be used for default routes", "The router must ARP for every destination and relies on proxy ARP", "It always has distance 0", "It disables recursive lookups for all routes"],
        answer: 1,
        why: "Without a next hop, every destination looks directly connected, so the router ARPs for each one.",
      },
      {
        q: "R1's static default route points at R2. R2 is up, but R2's ISP link has failed. What happens on R1?",
        options: ["R1 removes the route automatically", "R1 switches to OSPF", "The route stays and traffic is black-holed at R2", "R1 sends ICMP redirects to every host"],
        answer: 2,
        why: "R1's interface and next hop are fine, so nothing tells R1 the path beyond R2 is broken.",
      },
      {
        q: "Why add ip route 10.2.0.0 255.255.252.0 Null0 on a branch that advertises the 10.2.0.0/22 summary?",
        options: ["To speed up the real /24 subnets", "To drop traffic for unused parts of the summary instead of looping it back", "To make the summary the default route", "To enable proxy ARP"],
        answer: 1,
        why: "Without it, traffic for unused addresses follows the default route back to headquarters and loops.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the Cisco and Linux commands for: (a) a route to 192.168.20.0/24 via 10.0.0.2, (b) a default route via 10.0.0.1.",
        hint: "Cisco uses dotted masks; Linux uses prefix lengths.",
        solution: "Cisco:\nip route 192.168.20.0 255.255.255.0 10.0.0.2\nip route 0.0.0.0 0.0.0.0 10.0.0.1\nLinux:\nsudo ip route add 192.168.20.0/24 via 10.0.0.2\nsudo ip route add default via 10.0.0.1",
      },
      {
        level: "medium",
        task: "Three routers in a line: LAN1 10.1.0.0/24 - R1 - 172.16.12.0/30 - R2 - 172.16.23.0/30 - R3 - LAN3 10.3.0.0/24. R1 uses .1 on its link to R2, R2 uses .2 and .5 (to R3), R3 uses .6. List every static route needed so LAN1 and LAN3 can talk.",
        hint: "Each router needs a route to every network it is not connected to, if traffic to it must pass.",
        solution: "R1: ip route 10.3.0.0 255.255.255.0 172.16.12.2\n    ip route 172.16.23.0 255.255.255.252 172.16.12.2 (optional, for pinging R3's link)\nR2: ip route 10.1.0.0 255.255.255.0 172.16.12.1\n    ip route 10.3.0.0 255.255.255.0 172.16.23.6\nR3: ip route 10.1.0.0 255.255.255.0 172.16.23.5\n    ip route 172.16.12.0 255.255.255.252 172.16.23.5 (optional)\nHosts in each LAN use their own router as default gateway.",
      },
      {
        level: "hard",
        task: "A Linux router has two uplinks: eth0 via 203.0.113.1 (main) and eth1 via 198.51.100.1 (backup). Make the backup take over when eth0's link goes down, and explain why it will not take over if only the ISP behind eth0 fails.",
        hint: "Use two default routes with different metrics.",
        solution: "sudo ip route add default via 203.0.113.1 dev eth0 metric 100\nsudo ip route add default via 198.51.100.1 dev eth1 metric 200\nsudo sysctl -w net.ipv4.conf.all.ignore_routes_with_linkdown=1\n# Lowest metric wins, so eth0 is used normally. When eth0 loses\n# carrier its route is flagged linkdown; with the sysctl above the\n# kernel skips it and the metric 200 route takes over.\n# If only the ISP beyond 203.0.113.1 fails, eth0 is still up, so the\n# route stays and traffic is lost. Fix: a health check script that\n# pings through eth0 and deletes or replaces the route on failure.",
      },
    ],
    faq: [
      { q: "When should I use static routing instead of OSPF?", a: "For small or stub networks with one exit, for default routes to an ISP, and for a few fixed paths. Once you have several routers or redundant links, a dynamic protocol saves work and reacts to failures." },
      { q: "What is a floating static route?", a: "A static route with a higher administrative distance than the main route for the same prefix. It stays hidden and only enters the table when the main route disappears." },
      { q: "Why can I ping the far router but not the hosts behind it?", a: "The far router answers from its own interface, but the hosts' replies need a route back to you on every router along their path. Usually one router is missing that return route, or the hosts have the wrong default gateway." },
    ],
  },

  "net-routing/ospf": {
    plain: [
      "In a big network, typing routes by hand on every router is slow and fragile. A dynamic routing protocol lets routers talk to each other, learn which networks exist, and fix the routes by themselves when a link breaks. OSPF (Open Shortest Path First) is the most widely used one inside companies.",
      "OSPF is a link-state protocol. Each router tells every other router about its own links: \"I am connected to these networks and these neighbours, at this cost\". Soon every router holds the same complete map of the network.",
      "With the map in hand, each router calculates the shortest path to every network using Dijkstra's algorithm, the same one you may know from graph lessons. Shortest here means lowest total cost, and cost is usually based on link speed, so faster links are preferred.",
      "Large networks are split into areas, like neighbourhoods in a city. Routers know the detailed map of their own area and only a summary of the others. Area 0, the backbone, sits in the middle and every other area connects to it.",
    ],
    deepDive: [
      {
        heading: "Distance-vector versus link-state",
        body: "A distance-vector protocol such as RIP shares conclusions, not facts. Each router tells its neighbours \"I can reach network X in 3 hops\", and they add one. RIP sends its whole table every 30 seconds and uses hop count as its metric, with 15 as the maximum and 16 meaning unreachable. When a link fails, bad news spreads slowly and routers can keep raising each other's counts (count to infinity). Split horizon and poison reverse reduce this but convergence still takes a long time.\n\nA link-state protocol shares facts. Each router describes its own links, these descriptions are flooded unchanged to every router in the area, and each router computes paths itself. Because everyone has the same map, they reach consistent answers quickly, typically within seconds. The cost is more memory and CPU for the database and the SPF calculation, which is why areas exist.",
        visual: {
          type: "compare",
          title: "RIP and OSPF side by side",
          columns: [
            { title: "RIP (distance-vector)", points: ["Shares its routing table with neighbours", "Metric: hop count, max 15", "Full updates every 30 seconds", "Slow convergence, count to infinity"] },
            { title: "OSPF (link-state)", points: ["Floods link descriptions to all routers", "Metric: cost from bandwidth", "Updates on change, refresh every 30 minutes", "Converges in seconds, uses Dijkstra"] },
          ],
        },
      },
      {
        heading: "How two routers become neighbours",
        body: "OSPF runs directly on IP as protocol number 89, not over TCP or UDP. Routers send Hello packets to the multicast address 224.0.0.5 (all OSPF routers), by default every 10 seconds on Ethernet and point-to-point links, and declare a neighbour dead after 40 seconds of silence.\n\nTo become neighbours, both sides must agree on the area ID, the hello and dead intervals, the subnet and mask on the link, the authentication settings and the area type (for example, both stub). They must have different router IDs. Once they see each other in Hellos they reach 2-Way, then exchange database summaries (ExStart, Exchange), request missing pieces (Loading) and finally reach Full.\n\nIf the interface MTUs differ, they usually get stuck in ExStart or Exchange. On a shared Ethernet segment, routers elect a designated router (DR) and a backup (BDR) by highest priority (default 1), then highest router ID. Other routers stay at 2-Way with each other, which is normal.",
        visual: {
          type: "flow",
          title: "OSPF neighbour states",
          steps: [
            { label: "Down", detail: "No Hellos heard." },
            { label: "Init", detail: "Hello heard, my ID not in it yet." },
            { label: "2-Way", detail: "Both see each other; DR election." },
            { label: "ExStart / Exchange", detail: "Agree roles, swap database summaries." },
            { label: "Loading", detail: "Request missing LSAs." },
            { label: "Full", detail: "Databases match." },
          ],
        },
      },
      {
        heading: "LSAs, the database and the five packet types",
        body: "OSPF uses five packet types: Hello (1), Database Description or DBD (2), Link State Request (3), Link State Update (4) and Link State Acknowledgement (5). Updates carry LSAs (link-state advertisements), and every update must be acknowledged, so flooding is reliable even though OSPF does not use TCP.\n\nThe common LSA types are: type 1 router LSA (each router's links, stays in its area), type 2 network LSA (made by the DR for a shared segment), type 3 summary LSA (made by an area border router to describe networks in other areas), type 4 ASBR summary, type 5 external LSA (routes redistributed from outside OSPF, flooded through all normal areas) and type 7 for NSSA areas.\n\nEach LSA has a sequence number so newer copies replace older ones. The originating router refreshes it every 30 minutes, and an LSA that reaches MaxAge, one hour, is flushed. All LSAs together form the LSDB (link-state database).",
        bullets: ["Type 1 router, type 2 network: intra-area", "Type 3 summary: from the ABR", "Type 5 external: from the ASBR", "Refresh every 30 minutes, MaxAge 1 hour"],
      },
      {
        heading: "Cost, SPF and the reference bandwidth trap",
        body: "Each interface has a cost, and the cost of a path is the sum of the outgoing interface costs along it. By default Cisco calculates cost = reference bandwidth / interface bandwidth, with a reference of 100 Mbps, and the result is at least 1. So 10 Mbps costs 10, 100 Mbps costs 1, and 1 Gbps, 10 Gbps and 100 Gbps also cost 1. OSPF then cannot tell them apart.\n\nThe fix is auto-cost reference-bandwidth, given in Mbps. With auto-cost reference-bandwidth 100000 (100 Gbps), 1 Gbps costs 100, 10 Gbps costs 10 and 100 Gbps costs 1. Set the same value on every router, or paths will be compared on different scales. You can also set a cost per interface with ip ospf cost.\n\nAfter any change in the LSDB, each router runs SPF (Dijkstra) with itself as the root and installs the best paths. Equal-cost paths are installed together; Cisco IOS installs up to 4 by default, changeable with maximum-paths.",
      },
      {
        heading: "Areas, border routers and stub areas",
        body: "Every OSPF network has area 0, the backbone. Other areas must attach to it directly (a virtual link can patch a broken design, but avoid that). A router with interfaces in area 0 and another area is an ABR (area border router). A router that brings in routes from outside OSPF, such as static routes or BGP, is an ASBR (AS boundary router).\n\nAreas limit how far detail spreads. Type 1 and 2 LSAs stay inside their area, so a flapping link in area 1 makes only area 1's routers rerun the full SPF; others just see a type 3 summary change. ABRs can also summarise a range, such as many /24s into one /16.\n\nStub areas block type 5 external LSAs and get a default route from the ABR instead. Totally stubby areas, a Cisco feature, also block type 3 summaries. NSSAs allow a local ASBR inside a stub-like area by using type 7 LSAs. For IPv6, OSPFv3 (RFC 5340) uses the same ideas.",
        visual: {
          type: "tree",
          title: "A multi-area OSPF domain",
          root: "OSPF domain",
          children: [
            { label: "Area 0 (backbone)", children: ["Core routers", "Every ABR has a link here"] },
            { label: "Area 1", children: ["Connected via ABR1", "Sees other areas as type 3 summaries"] },
            { label: "Area 2 (stub)", children: ["No type 5 externals", "Default route from the ABR"] },
            { label: "Outside OSPF", children: ["ASBR redistributes static or BGP", "Appears as type 5 external LSAs"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Two routers forming a full adjacency",
        actors: ["R1", "R2"],
        messages: [
          { from: 0, to: 1, label: "Hello (neighbours: none)" },
          { from: 1, to: 0, label: "Hello (neighbours: R1): 2-Way" },
          { from: 0, to: 1, label: "DBD: summary of my LSAs" },
          { from: 1, to: 0, label: "DBD: summary of my LSAs" },
          { from: 0, to: 1, label: "LSR: send me the LSAs I lack" },
          { from: 1, to: 0, label: "LSU: the requested LSAs" },
          { from: 0, to: 1, label: "LSAck: received, state Full" },
        ],
      },
    ],
    examples: [
      {
        title: "Single-area OSPF on Cisco IOS with sensible defaults",
        explanation: "Three routers, all in area 0. Step 1: give each router a fixed router ID, so it does not change when interfaces change. Step 2: raise the reference bandwidth on every router so gigabit and 10-gigabit links get different costs. Step 3: enable OSPF per interface with ip ospf 1 area 0. Step 4: make the LAN interface passive, so it advertises the LAN but sends no Hellos to hosts. Step 5: check that neighbours reach FULL and that O routes appear. In a simulator such as Packet Tracer, GNS3 or containerlab, repeat on R2 and R3.",
        code: {
          lang: "text",
          code: `router ospf 1
 router-id 1.1.1.1
 auto-cost reference-bandwidth 100000
 passive-interface GigabitEthernet0/2
interface GigabitEthernet0/0
 ip ospf 1 area 0
interface GigabitEthernet0/2
 ip ospf 1 area 0
!
R1# show ip ospf neighbor
Neighbor ID  Pri  State     Dead Time  Address     Interface
2.2.2.2        1  FULL/DR   00:00:36   172.16.0.2  GigabitEthernet0/0
R1# show ip route ospf`,
        },
      },
      {
        title: "Why the reference bandwidth matters: a path cost walk",
        explanation: "R1 can reach R4 two ways. Path A: two 1 Gbps links. Path B: one 10 Gbps link, then one 100 Mbps link. With the default reference of 100 Mbps, every link of 100 Mbps or faster costs 1, so path A = 1 + 1 = 2 and path B = 1 + 1 = 2. OSPF sees a tie and splits traffic, sending half of it over the slow 100 Mbps link. With a reference of 100,000 Mbps: 1 Gbps costs 100, 10 Gbps costs 10 and 100 Mbps costs 1000. Path A = 200, path B = 1010, so OSPF correctly picks path A.",
      },
    ],
    cheatSheet: [
      "OSPF is IP protocol 89; Hellos go to 224.0.0.5, and to the DR/BDR at 224.0.0.6",
      "Default timers on Ethernet: hello 10 s, dead 40 s; they must match on both sides",
      "Neighbour states: Down, Init, 2-Way, ExStart, Exchange, Loading, Full",
      "Stuck in ExStart or Exchange? Check for an MTU mismatch",
      "Cisco cost = 100 Mbps reference / bandwidth; set auto-cost reference-bandwidth on every router",
      "Area 0 is the backbone; ABRs join areas, ASBRs bring in external routes",
      "LSA types: 1 router, 2 network, 3 summary, 4 ASBR summary, 5 external, 7 NSSA",
      "show ip ospf neighbor, show ip ospf interface brief, show ip route ospf",
    ],
    quiz: [
      {
        q: "Two OSPF routers are stuck in the ExStart state. What is the most likely cause?",
        options: ["Different router IDs", "An MTU mismatch on the link", "Different OSPF process numbers", "The link is too fast"],
        answer: 1,
        why: "Database description packets are refused when the MTUs differ, so the exchange never completes. Process numbers are local and need not match.",
      },
      {
        q: "With Cisco's default reference bandwidth of 100 Mbps, what is the OSPF cost of a 10 Gbps interface?",
        options: ["0.01", "10", "100", "1"],
        answer: 3,
        why: "100 / 10,000 is less than 1, and OSPF cost is never below 1.",
      },
      {
        q: "Which LSA type does an area border router use to describe networks from one area to another?",
        options: ["Type 3 summary LSA", "Type 1 router LSA", "Type 2 network LSA", "Type 5 external LSA"],
        answer: 0,
        why: "Type 1 and 2 stay inside their area; the ABR summarises them as type 3 for other areas.",
      },
      {
        q: "What is the maximum usable hop count in RIP?",
        options: ["255", "16", "15", "30"],
        answer: 2,
        why: "A metric of 16 means unreachable, so 15 hops is the limit.",
      },
      {
        q: "On a shared Ethernet segment, two non-DR routers show each other in the 2-Way state. What does it mean?",
        options: ["A configuration error", "An MTU mismatch", "Authentication has failed", "Normal behaviour: they only go Full with the DR and BDR"],
        answer: 3,
        why: "DROTHER routers stay at 2-Way with each other and exchange databases only with the DR and BDR.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "With auto-cost reference-bandwidth 10000 (10 Gbps), calculate the OSPF cost of 100 Mbps, 1 Gbps, 10 Gbps and 40 Gbps interfaces.",
        hint: "Cost = 10,000 Mbps divided by the interface speed in Mbps, and at least 1.",
        solution: "100 Mbps: 10000 / 100 = 100\n1 Gbps:   10000 / 1000 = 10\n10 Gbps:  10000 / 10000 = 1\n40 Gbps:  0.25, rounded up to the minimum of 1\n(So 10 and 40 Gbps tie: pick a higher reference if you have 40G links.)",
      },
      {
        level: "medium",
        task: "Configure single-area OSPF on two FRRouting routers joined by 172.16.0.0/30, each with a LAN (10.1.0.0/24 and 10.2.0.0/24). Then name the commands to check neighbours and routes.",
        hint: "In FRR, enter vtysh; network statements use prefix notation and an area.",
        solution: "! R1 (vtysh, configure terminal)\nrouter ospf\n ospf router-id 1.1.1.1\n network 172.16.0.0/30 area 0\n network 10.1.0.0/24 area 0\n exit\ninterface eth1\n ip ospf passive\n! R2: same with router-id 2.2.2.2 and 10.2.0.0/24\n! verify\nshow ip ospf neighbor\nshow ip route ospf",
      },
      {
        level: "hard",
        task: "R1 and R2 are cabled together but show ip ospf neighbor is empty on both. Write a checklist of what to compare, and the command for each on Cisco.",
        hint: "Think about what must match in the Hello packet, and what could stop Hellos entirely.",
        solution: "1. Interface up/up and in OSPF: show ip ospf interface brief\n2. Same subnet and mask: show ip interface brief / show run interface\n3. Same area ID on the link: show ip ospf interface\n4. Same hello/dead timers: show ip ospf interface (Timer intervals)\n5. Not passive on this link: show ip protocols (Passive Interface)\n6. Matching authentication type and key: show ip ospf interface\n7. Same area type (stub flags): show ip ospf\n8. Unique router IDs: show ip ospf (Routing Process ... with ID)\n9. ACLs not blocking protocol 89: show ip access-lists\n10. Watch Hellos live: debug ip ospf adj (in a lab only)",
      },
    ],
    faq: [
      { q: "Is OSPF still used, or has everything moved to BGP?", a: "OSPF is still very common inside enterprise and campus networks. Large data centres often run BGP even internally, and service providers often use IS-IS, but OSPF concepts carry over to both." },
      { q: "Does the OSPF process ID have to match between routers?", a: "No. The number in router ospf 1 is only local to that router. The area ID, timers, subnet and authentication are what must match." },
      { q: "What is the OSPF router ID and how is it chosen?", a: "A 32-bit number written like an IPv4 address that names the router in OSPF. If you do not set it, Cisco uses the highest loopback address, or else the highest active interface address, so it is best to set it by hand." },
      { q: "What is the difference between OSPFv2 and OSPFv3?", a: "OSPFv2 (RFC 2328) carries IPv4 routes. OSPFv3 (RFC 5340) was built for IPv6, runs over IPv6 link-local addresses, and with later extensions can carry IPv4 as well." },
    ],
  },

  "net-routing/bgp": {
    plain: [
      "The internet is not one network. It is tens of thousands of separate networks, run by ISPs, cloud providers, universities and companies, all connected to each other. Each one is called an autonomous system (AS) and has a number, its ASN.",
      "BGP (Border Gateway Protocol) is how these networks tell each other what they can reach. A network announces \"I own these addresses\" to its neighbours, they pass the message on, and each network that passes it adds its own number to a list called the AS path. That list shows the route the message travelled.",
      "BGP does not just pick the shortest path. Each network applies its own rules, called policy, often based on money: a route through a paying customer is preferred over one through a provider you must pay. That is why BGP is said to route by policy.",
      "BGP mostly works on trust. If a network announces addresses it does not own, by accident or on purpose, others may believe it and send traffic the wrong way. Such mistakes have taken big websites offline. Newer tools such as RPKI help check who may announce what.",
    ],
    deepDive: [
      {
        heading: "Autonomous systems and ASNs",
        body: "ASNs were originally 16 bits (0 to 65535); 32-bit ASNs (RFC 6793) extend the range to over 4 billion. Regional internet registries assign them: ARIN, RIPE NCC, APNIC, LACNIC and AFRINIC. Some ranges are reserved. Private ASNs, like private IP addresses, are 64512 to 65534 and 4200000000 to 4294967294; they are used inside organisations and must not leak onto the internet. 64496 to 64511 and 65536 to 65551 are for documentation.\n\nNetworks connect in two main business relationships. In transit, a customer pays a provider to carry its traffic to the whole internet. In peering, two networks exchange traffic between their own customers for free, often at an internet exchange point (IXP), a building where many networks plug into a shared switch.\n\nThese relationships decide which routes a network passes on, and to whom, which is the core of BGP policy.",
        bullets: ["Private: 64512 to 65534 (16-bit), 4200000000 to 4294967294 (32-bit)", "Transit: customer pays provider", "Peering: settlement-free exchange, often at an IXP"],
      },
      {
        heading: "Sessions, messages and states",
        body: "BGP neighbours (peers) are configured by hand; there is no automatic discovery. A session is a TCP connection to port 179, which gives BGP reliable, ordered delivery for free. There are four message types in the base standard: OPEN (start a session, exchange ASN, hold time and capabilities), UPDATE (announce or withdraw routes), KEEPALIVE (I am still here) and NOTIFICATION (an error; the session closes). ROUTE-REFRESH (RFC 2918) asks a peer to resend its routes.\n\nThe session moves through Idle, Connect, Active, OpenSent, OpenConfirm and Established. A session stuck in Active is actively trying, and failing, to make the TCP connection: often a wrong address, a firewall, or the other side not configured yet.\n\nIf no message arrives within the hold time, the session is torn down. RFC 4271 suggests a hold time of 90 seconds; Cisco defaults to 180 seconds with keepalives every 60. Unlike OSPF, BGP sends full updates only once and afterwards only changes.",
        visual: {
          type: "sequence",
          title: "Bringing up an eBGP session",
          actors: ["Router AS 64500", "Router AS 64501"],
          messages: [
            { from: 0, to: 1, label: "TCP SYN to port 179" },
            { from: 1, to: 0, label: "TCP SYN-ACK, then ACK" },
            { from: 0, to: 1, label: "OPEN: AS 64500, hold 180, capabilities" },
            { from: 1, to: 0, label: "OPEN: AS 64501, hold 180" },
            { from: 0, to: 1, label: "KEEPALIVE: OPEN accepted" },
            { from: 1, to: 0, label: "KEEPALIVE: Established" },
            { from: 0, to: 1, label: "UPDATE: 198.51.100.0/24, path 64500" },
          ],
        },
      },
      {
        heading: "eBGP, iBGP and why iBGP needs a full mesh",
        body: "eBGP runs between routers in different ASes. By default the peers must be directly connected (packets are sent with TTL 1), and Cisco gives eBGP routes administrative distance 20. Each eBGP hop prepends its own ASN to the AS path.\n\niBGP runs between routers in the same AS, to share what the border routers learned. It does not change the AS path, and Cisco gives it distance 200. To prevent loops, a route learned from one iBGP peer is never passed to another iBGP peer. So every BGP router in an AS must peer with every other one: a full mesh of n(n - 1) / 2 sessions, which is 45 for 10 routers.\n\nLarge networks avoid this with route reflectors (RFC 4456), which are allowed to pass iBGP routes on to their clients, or with confederations. One more trap: iBGP keeps the external next hop unchanged, so inside routers need a route to it, or the border router sets next-hop-self.",
      },
      {
        heading: "How BGP picks the best path",
        body: "When several paths to the same prefix exist, BGP compares them attribute by attribute and stops at the first difference. On Cisco the order is: highest weight (Cisco-only, local to one router), highest local preference (default 100, shared across the AS), a route this router originated, shortest AS path, lowest origin type (IGP before EGP before incomplete), lowest MED, eBGP over iBGP, lowest IGP cost to the next hop, then tie-breakers such as the oldest route and lowest router ID.\n\nOperators steer outbound traffic with local preference: set it higher on routes from customers than from peers, and higher from peers than from providers. Steering inbound traffic is harder, because other networks decide. Tools include AS path prepending (repeating your own ASN to look longer), MED towards a neighbour with several links, and communities (tags such as NO_EXPORT that ask neighbours to treat a route a certain way).",
        visual: {
          type: "flow",
          title: "BGP best path, first steps (Cisco order)",
          steps: [
            { label: "Highest weight", detail: "Cisco-only, this router." },
            { label: "Highest local pref", detail: "Default 100, whole AS." },
            { label: "Locally originated", detail: "Own network or aggregate." },
            { label: "Shortest AS path", detail: "Fewest ASNs in the list." },
            { label: "Lowest origin, then MED", detail: "IGP before EGP before incomplete." },
            { label: "eBGP over iBGP", detail: "Then lowest IGP cost to next hop." },
          ],
        },
      },
      {
        heading: "Hijacks, leaks and RPKI",
        body: "A prefix hijack is an announcement of address space by an AS that does not hold it. Announcing a more specific prefix is especially powerful, because longest-prefix match beats any AS path: in 2008, Pakistan Telecom announced a /24 inside YouTube's /22, and much of the internet sent YouTube traffic to Pakistan. A route leak (RFC 7908) is a route passed on beyond its intended scope, such as a customer re-announcing one provider's routes to another. In June 2019 a leak through a small ISP and Verizon caused wide outages for Cloudflare and others.\n\nRPKI (Resource Public Key Infrastructure) lets an address holder sign a ROA (Route Origin Authorization): this prefix, up to this max length, may be originated by this ASN. Routers doing route origin validation mark each route Valid, Invalid or NotFound (RFC 6811), and many large networks drop Invalid. RPKI checks only the origin AS, not the whole path, so filters on customer routes are still needed.",
        bullets: ["Hijack: wrong origin, often a more specific prefix", "Leak: right origin, wrong propagation", "ROV states: Valid, Invalid, NotFound", "Most networks filter IPv4 prefixes longer than /24"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "eBGP and iBGP",
        columns: [
          { title: "eBGP", points: ["Between different ASes", "Prepends its ASN to the AS path", "TTL 1 by default: direct neighbours", "Cisco distance 20"] },
          { title: "iBGP", points: ["Inside one AS", "AS path unchanged", "Needs a full mesh or route reflectors", "Cisco distance 200"] },
        ],
      },
      {
        type: "flow",
        title: "Route origin validation for one announcement",
        steps: [
          { label: "UPDATE arrives", detail: "203.0.113.0/24 from origin AS 64510." },
          { label: "Find covering ROAs", detail: "Signed prefix, max length, ASN." },
          { label: "No ROA covers it", detail: "NotFound: usually accepted." },
          { label: "ROA matches", detail: "Same ASN, within max length: Valid." },
          { label: "ROA exists, no match", detail: "Invalid: dropped by many networks." },
        ],
      },
    ],
    examples: [
      {
        title: "Reading a BGP table and picking the best path",
        explanation: "The router has two paths to 203.0.113.0/24. The first, via 192.0.2.2, has a longer AS path (three ASNs) but local preference 200. The second, via 192.0.2.6, is shorter (two ASNs) with the default 100. Step 1: weights are equal (0). Step 2: local preference is compared next, and 200 beats 100, so the first path wins even though it is longer; it is marked with *>. If the operator removed the local preference policy, step 4 (AS path length) would choose the second path. The i at the end means origin IGP.",
        code: {
          lang: "text",
          code: `R1# show ip bgp 203.0.113.0/24
   Network          Next Hop      Metric LocPrf Weight Path
*> 203.0.113.0/24   192.0.2.2                200      0 64502 64503 64510 i
*                   192.0.2.6                100      0 64501 64510 i`,
        },
      },
      {
        title: "An eBGP session in FRRouting with filters both ways",
        explanation: "AS 64500 wants to announce 198.51.100.0/24 to its provider AS 64501. Step 1: a blackhole static route puts the prefix in the routing table, because BGP's network statement only announces prefixes that exist there. Step 2: a prefix list and an outbound route map allow only that prefix out, so a typo cannot leak other routes. Step 3: an inbound route map is required too; FRR follows RFC 8212, which says eBGP sessions exchange nothing until policy is applied. Here IN accepts everything, which is fine for a lab but should filter in production.",
        code: {
          lang: "text",
          code: `ip prefix-list MINE seq 5 permit 198.51.100.0/24
ip route 198.51.100.0/24 blackhole
route-map OUT permit 10
 match ip address prefix-list MINE
route-map IN permit 10
!
router bgp 64500
 bgp router-id 192.0.2.1
 neighbor 192.0.2.2 remote-as 64501
 address-family ipv4 unicast
  network 198.51.100.0/24
  neighbor 192.0.2.2 route-map IN in
  neighbor 192.0.2.2 route-map OUT out
 exit-address-family`,
        },
      },
    ],
    cheatSheet: [
      "BGP runs over TCP port 179; messages: OPEN, UPDATE, KEEPALIVE, NOTIFICATION (+ ROUTE-REFRESH)",
      "States: Idle, Connect, Active, OpenSent, OpenConfirm, Established; stuck in Active = TCP failing",
      "Private ASNs: 64512 to 65534 and 4200000000 to 4294967294",
      "Best path starts: weight, local pref, locally originated, AS path, origin, MED, eBGP over iBGP",
      "iBGP routes are not passed to other iBGP peers: full mesh or route reflectors",
      "Steer outbound with local preference; inbound with prepending, MED or communities",
      "RPKI ROV results: Valid, Invalid, NotFound; it validates the origin AS, not the full path",
      "FRR: show bgp summary, show ip bgp PREFIX; Cisco: show ip bgp summary",
    ],
    quiz: [
      {
        q: "Ignoring Cisco's weight, which attribute does BGP compare first when choosing between paths?",
        options: ["AS path length", "MED", "Local preference", "Router ID"],
        answer: 2,
        why: "Highest local preference is checked before AS path length, which is why operators use it to set policy.",
      },
      {
        q: "Why does iBGP normally need a full mesh of sessions inside an AS?",
        options: ["A route learned from an iBGP peer is not advertised to other iBGP peers", "iBGP sessions use UDP and are unreliable", "iBGP cannot carry IPv6", "iBGP changes the AS path on each hop"],
        answer: 0,
        why: "This rule prevents loops, since iBGP does not add to the AS path; route reflectors relax it.",
      },
      {
        q: "A legitimate network announces 192.0.2.0/22. An attacker announces 192.0.2.0/24. Where does traffic for 192.0.2.10 go on networks that accept both?",
        options: ["To the legitimate network, because it was first", "It is split evenly", "To whichever AS path is shorter", "To the attacker, because the /24 is more specific"],
        answer: 3,
        why: "Forwarding uses longest-prefix match, which beats any BGP attribute.",
      },
      {
        q: "What RPKI validation state does a route get when no ROA covers its prefix at all?",
        options: ["Valid", "NotFound", "Invalid", "Unknown peer"],
        answer: 1,
        why: "NotFound means there is no ROA to compare with, and most networks still accept such routes.",
      },
      {
        q: "A BGP session sits in the Active state for minutes. What does that usually mean?",
        options: ["It is working and exchanging routes", "The routes are all Invalid", "The router keeps trying to open the TCP connection and failing", "The hold timer is too long"],
        answer: 2,
        why: "Active means the TCP connection to port 179 is not succeeding: wrong address, firewall or missing config on the peer.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "A route to 203.0.113.0/24 arrives with AS path 64501 64502 64502 64502 64510. Which AS originated it, how long is the path for best-path comparison, and what do the repeated ASNs suggest?",
        hint: "The origin is at the right end. Every entry counts toward length.",
        solution: "Origin: AS 64510 (the rightmost ASN).\nNeighbour that sent it: AS 64501 (the leftmost ASN).\nPath length: 5, because repeats count.\nThe three copies of 64502 suggest AS 64502 is prepending to make\nthis path look longer, so other networks prefer another path.",
      },
      {
        level: "medium",
        task: "Three paths to the same prefix: A (local pref 100, AS path length 2, eBGP), B (local pref 150, length 4, iBGP), C (local pref 150, length 3, iBGP). Weights are equal. Which wins, and at which step?",
        hint: "Compare in order and stop at the first difference.",
        solution: "Step 1, weight: all equal.\nStep 2, local preference: B and C (150) beat A (100). A is out.\nStep 3, locally originated: neither.\nStep 4, AS path: C (3) beats B (4).\nWinner: C, decided at AS path length.\nNote that A's short path and eBGP origin never mattered.",
      },
      {
        level: "hard",
        task: "Your company holds 198.51.100.0/22, originated by AS 64500, and announces only the /22. Write the ROA you should create, and explain why setting max length to /24 would be risky.",
        hint: "Think about what an attacker could announce while still looking Valid.",
        solution: "ROA: prefix 198.51.100.0/22, max length 22, origin AS 64500.\nWith max length 24, any /23 or /24 inside the /22 originated by\nAS 64500 is Valid. An attacker could announce 198.51.100.0/24 with\na forged path ending in 64500. RPKI checks only the origin, so it\nwould be Valid, and as a more specific prefix it would attract the\ntraffic. RFC 9319 therefore advises max length equal to the\nprefixes you actually announce.",
      },
    ],
    faq: [
      { q: "Why is BGP called the protocol that runs the internet?", a: "It is the only protocol used between independent networks to exchange reachability. Every ISP, cloud and large company that connects to more than one network speaks it." },
      { q: "Do I need BGP for my company network?", a: "Usually not if you have a single ISP: a default route is enough. You need BGP when you connect to two or more providers with your own address space and ASN, or in some cloud and data centre designs." },
      { q: "What happened in the 2021 Facebook outage?", a: "On 4 October 2021, a maintenance command disconnected Facebook's backbone, and its DNS servers then withdrew their BGP routes, so the rest of the internet could no longer reach Facebook's DNS or services for several hours." },
      { q: "What is the difference between a route leak and a hijack?", a: "In a hijack, someone announces address space they do not hold as if they were its origin. In a leak, a valid route is passed on to neighbours who should never have received it, often by mistake." },
    ],
  },

  "net-routing/nat": {
    plain: [
      "There are not enough IPv4 addresses for every device in the world. NAT (network address translation) helps by letting many devices with private addresses, like 192.168.1.20, share one public address. The router changes the addresses in each packet as it passes through.",
      "When your phone opens a website, the router swaps the phone's private address for the router's public one, and remembers that swap in a table. When the reply comes back, it looks in the table and swaps the address back, so the reply reaches your phone.",
      "If two devices at home talk to the same website at the same time, how does the router tell the replies apart? It also changes the port number, a second small label in each packet. This is called PAT (port address translation) or NAT overload, and it is what nearly every home router does.",
      "NAT has a side effect: devices outside cannot start a conversation with a device inside, because the router has no table entry for it. That is why hosting a game server or a camera at home needs port forwarding, and why some video calls need extra tricks to connect.",
    ],
    deepDive: [
      {
        heading: "Static NAT, dynamic NAT and PAT",
        body: "Static NAT maps one private address to one public address permanently, in both directions. It suits a server that must be reachable from outside, but it uses one public address per host.\n\nDynamic NAT gives inside hosts a public address from a pool, first come, first served, while they are active. If the pool has 10 addresses and an 11th host wants out, it fails. It is rare today.\n\nPAT, also called NAT overload or masquerading on Linux, maps many private addresses to one public address and tells connections apart by rewriting the source port as well. A port is a 16-bit number, so one public address has about 64,000 ports per protocol (TCP and UDP separately), and many NATs can reuse the same public port for connections to different destinations. That is enough for a home or small office; large sites use several public addresses.",
        visual: {
          type: "compare",
          title: "Three kinds of NAT",
          columns: [
            { title: "Static NAT", points: ["1 private to 1 public, fixed", "Works inbound and outbound", "Used for servers", "One public IP per host"] },
            { title: "Dynamic NAT", points: ["Private to a pool of publics", "Mapping while active", "Fails when the pool is empty", "Rare today"] },
            { title: "PAT / overload", points: ["Many private to 1 public", "Ports tell flows apart", "Outbound only by default", "Home and office routers"] },
          ],
        },
      },
      {
        heading: "Reading the translation table",
        body: "Cisco names four addresses. Inside local is the host's real private address. Inside global is the public address that represents it. Outside global is the remote server's real address, and outside local is how the server appears from inside, which is usually the same. show ip nat translations prints one row per flow, such as tcp 203.0.113.7:40001 10.0.0.5:51000 93.184.215.14:443 93.184.215.14:443.\n\nLinux keeps the same information in connection tracking (conntrack). conntrack -L shows each flow with two tuples: the original direction, as the inside host sent it, and the expected reply, as it will arrive from outside. When the reply tuple's destination differs from the original source, NAT has been applied.\n\nEntries expire. On Linux an established TCP flow stays for 5 days of idle time by default (nf_conntrack_tcp_timeout_established = 432000 seconds), while UDP entries expire far sooner. That is why apps behind NAT send keepalives on long, quiet UDP sessions.",
        bullets: ["Inside local: real private address", "Inside global: public address used for it", "conntrack -L: original and reply tuples", "conntrack -D can delete a stuck entry"],
      },
      {
        heading: "Port forwarding and hairpin NAT",
        body: "Port forwarding is destination NAT: packets that arrive at the public address on a chosen port are rewritten to an inside host and port. On a Linux router with nftables, a prerouting rule such as iifname eth0 tcp dport 8443 dnat to 10.0.0.20:443 does it, and the forward chain of your firewall must allow the traffic. On Cisco, ip nat inside source static tcp 10.0.0.20 443 203.0.113.7 8443 creates the same mapping.\n\nA common surprise: it works from outside, but not from inside when you use the public address. The packet reaches the router from the LAN, gets DNATed to 10.0.0.20, and the server replies directly to the client on the same LAN, which does not recognise the reply. Hairpin NAT (NAT loopback) fixes this by also rewriting the source, so the reply goes back through the router. Split DNS, which gives inside clients the private address, is often cleaner.",
      },
      {
        heading: "What NAT breaks, and how apps get through",
        body: "NAT breaks protocols that write IP addresses inside their payload, such as active FTP and SIP. Routers use helpers called ALGs (application layer gateways) to rewrite those too, though they often cause their own bugs. IPsec ESP has no ports at all, so VPNs use NAT traversal: ESP is wrapped in UDP port 4500.\n\nPeer-to-peer apps (video calls, games) have it hardest, because both sides may be behind NAT. RFC 4787 describes NAT behaviour. With endpoint-independent mapping, a host's inside address and port always map to the same public port, whatever the destination, which makes hole punching possible. With address-dependent or port-dependent mapping (often called symmetric NAT), each new destination gets a new public port, and hole punching usually fails.\n\nThe toolkit: STUN (RFC 8489) tells a host its public address and port; ICE (RFC 8445) tries every candidate pair; TURN (RFC 8656) relays the traffic through a server when nothing else works.",
        visual: {
          type: "sequence",
          title: "UDP hole punching with STUN",
          actors: ["Peer A", "STUN and signalling server", "Peer B"],
          messages: [
            { from: 0, to: 1, label: "STUN: what is my public address?" },
            { from: 1, to: 0, label: "You are 203.0.113.7:40001" },
            { from: 2, to: 1, label: "STUN: what is my public address?" },
            { from: 1, to: 2, label: "You are 198.51.100.9:52000" },
            { from: 1, to: 0, label: "Signalling: B is at 198.51.100.9:52000" },
            { from: 0, to: 2, label: "UDP to B: opens a mapping in A's NAT" },
            { from: 2, to: 0, label: "UDP to A: passes A's NAT, direct path works" },
          ],
        },
      },
      {
        heading: "CGNAT, IPv6 and NAT as security",
        body: "Many ISPs now put customers behind carrier-grade NAT (CGNAT): your home router gets an address from 100.64.0.0/10, the shared address space reserved by RFC 6598, and the ISP translates again to a public address shared by many homes. Port forwarding on your router then cannot work, because the ISP's NAT has no mapping for you. Shared addresses also mean one abusive user can get an address blocked for everyone, and ISPs must log port ranges to trace abuse.\n\nIPv6 has enough addresses for every device, so NAT is not needed. For IPv6-only networks that must reach IPv4 servers, NAT64 with DNS64 translates, often using the well-known prefix 64:ff9b::/96.\n\nNAT is not a firewall. PAT drops unsolicited inbound packets only as a side effect of having no mapping. A stateful firewall that allows established traffic and blocks new inbound connections gives the same protection, on IPv4 and IPv6, without rewriting addresses.",
        bullets: ["CGNAT range: 100.64.0.0/10", "NAT64 well-known prefix: 64:ff9b::/96", "A stateful firewall, not NAT, is the security control"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Double NAT under CGNAT",
        layers: [
          { label: "Internet server", detail: "Sees the ISP's public address." },
          { label: "ISP CGNAT", detail: "100.64.x.x to a shared public IP." },
          { label: "Home router NAT", detail: "192.168.1.x to 100.64.x.x." },
          { label: "Laptop", detail: "Private address 192.168.1.20." },
        ],
      },
    ],
    examples: [
      {
        title: "Reading Linux conntrack entries on a NAT router",
        explanation: "The router's public address is 203.0.113.7, and a laptop at 10.0.0.5 is browsing. Step 1: in the first entry, the original tuple shows 10.0.0.5:51000 to 93.184.215.14:443. Step 2: the reply tuple expects packets from 93.184.215.14:443 to 203.0.113.7:40001, so the router rewrote the source to its own address and port 40001. Step 3: 431999 is the seconds left before the idle entry expires. Step 4: the UDP DNS entry has only seconds left, which shows how short UDP mappings are.",
        code: {
          lang: "bash",
          code: `$ sudo conntrack -L
tcp      6 431999 ESTABLISHED src=10.0.0.5 dst=93.184.215.14 sport=51000 dport=443
         src=93.184.215.14 dst=203.0.113.7 sport=443 dport=40001 [ASSURED] mark=0 use=1
udp      17 25 src=10.0.0.5 dst=1.1.1.1 sport=48211 dport=53
         src=1.1.1.1 dst=203.0.113.7 sport=53 dport=48211 mark=0 use=1
$ sudo conntrack -L -p tcp --dport 443 | wc -l    # count HTTPS flows`,
        },
      },
      {
        title: "Port-forwarding a web server on a Linux router",
        explanation: "The router has eth0 on the internet (203.0.113.7) and the server is 10.0.0.20:443 on the LAN. Step 1: enable forwarding. Step 2: create a nat table with a prerouting chain for DNAT and a postrouting chain for masquerading. Step 3: rewrite TCP port 8443 arriving on eth0 to 10.0.0.20:443. Step 4: masquerade LAN traffic leaving eth0. Step 5: test from outside the network, not from the LAN, because hairpin traffic needs an extra rule. If you also run a filter forward chain with a drop policy, allow this traffic there.",
        code: {
          lang: "bash",
          code: `sudo sysctl -w net.ipv4.ip_forward=1
sudo nft add table ip nat
sudo nft add chain ip nat pre '{ type nat hook prerouting priority -100; }'
sudo nft add chain ip nat post '{ type nat hook postrouting priority 100; }'
sudo nft add rule ip nat pre iifname eth0 tcp dport 8443 dnat to 10.0.0.20:443
sudo nft add rule ip nat post oifname eth0 masquerade
sudo nft list table ip nat
# from outside: curl -k https://203.0.113.7:8443/`,
        },
      },
    ],
    cheatSheet: [
      "PAT (overload, masquerade) = many private hosts behind one public IP, told apart by port",
      "Cisco PAT: ip nat inside source list 1 interface Gi0/1 overload",
      "Cisco terms: inside local = private address, inside global = its public address",
      "Linux: conntrack -L lists translations; nft ... masquerade for SNAT, dnat to for forwarding",
      "CGNAT uses 100.64.0.0/10; port forwarding on your own router cannot fix it",
      "IPsec through NAT: NAT-T wraps ESP in UDP 4500",
      "STUN finds your public mapping, ICE tries candidate paths, TURN relays as a last resort",
      "NAT is not a firewall: use stateful filtering for security, on IPv4 and IPv6",
    ],
    quiz: [
      {
        q: "Which form of NAT lets a whole office share one public IPv4 address?",
        options: ["Static NAT", "PAT (NAT overload)", "Dynamic NAT with a pool of one", "NAT64"],
        answer: 1,
        why: "PAT tells flows apart by rewriting source ports, so one address serves many hosts.",
      },
      {
        q: "Your home router's WAN address is 100.72.14.9. What does that tell you?",
        options: ["It is a public address", "It is a link-local address", "You are behind carrier-grade NAT at your ISP", "Your router is misconfigured"],
        answer: 2,
        why: "100.64.0.0/10 is the shared address space for CGNAT, so a second NAT sits at the ISP.",
      },
      {
        q: "Which port does IPsec use when it detects NAT on the path?",
        options: ["UDP 4500", "TCP 443", "UDP 500 only", "ESP has no port and cannot cross NAT"],
        answer: 0,
        why: "NAT traversal wraps ESP in UDP 4500 so PAT has ports to translate.",
      },
      {
        q: "In Cisco NAT terms, what is the inside global address?",
        options: ["The remote server's real address", "The inside host's private address", "The router's loopback", "The public address that represents an inside host"],
        answer: 3,
        why: "Inside global is how the inside host appears to the outside world.",
      },
      {
        q: "A port forward works from the internet but not from a laptop on the same LAN using the public IP. Why?",
        options: ["The router lacks hairpin NAT, so the server replies directly and the laptop rejects it", "Port forwarding only works for UDP", "The LAN laptop needs a public IP", "conntrack is disabled"],
        answer: 0,
        why: "The DNATed packet keeps the laptop's source, so the reply bypasses the router; hairpin NAT or split DNS fixes it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Hosts 10.0.0.5 and 10.0.0.6 both open connections from source port 50000 to 93.184.215.14:443 through a PAT router with public address 203.0.113.7. Write the two translation rows the router might create.",
        hint: "The public address is the same; something else must differ.",
        solution: "Inside local        Inside global         Outside\n10.0.0.5:50000  ->  203.0.113.7:40001    93.184.215.14:443\n10.0.0.6:50000  ->  203.0.113.7:40002    93.184.215.14:443\nThe public ports differ (the exact numbers are chosen by the router),\nso replies to 40001 go to .5 and replies to 40002 go to .6.",
      },
      {
        level: "medium",
        task: "Configure PAT on a Cisco router: LAN 10.0.0.0/24 on Gi0/0, internet on Gi0/1. Then add a port forward of public TCP 8443 to 10.0.0.20:443.",
        hint: "Mark inside and outside interfaces, match the LAN with an ACL, and overload the outside interface.",
        solution: "interface GigabitEthernet0/0\n ip nat inside\ninterface GigabitEthernet0/1\n ip nat outside\naccess-list 1 permit 10.0.0.0 0.0.0.255\nip nat inside source list 1 interface GigabitEthernet0/1 overload\nip nat inside source static tcp 10.0.0.20 443 interface GigabitEthernet0/1 8443\n! verify\nshow ip nat translations\nshow ip nat statistics",
      },
      {
        level: "hard",
        task: "Two friends try a peer-to-peer video call. Both are behind NATs that assign a new public port for every new destination. Explain why hole punching fails, and what the app does instead.",
        hint: "Compare the port STUN reports with the port used when talking to the peer.",
        solution: "STUN reports the public port used toward the STUN server.\nWith address- or port-dependent mapping, packets to the peer get a\ndifferent public port, so the address shared via signalling is wrong.\nEach side's packets arrive at ports the other NAT never opened, and\nare dropped. ICE detects that no candidate pair works and falls back\nto a TURN relay: both peers send to the TURN server, which forwards\nthe media. It works through any NAT but adds latency and server cost.",
      },
    ],
    faq: [
      { q: "Is NAT a security feature?", a: "Not by design. It blocks unsolicited inbound traffic only because there is no mapping for it. Real protection comes from a stateful firewall, which works the same on IPv4 and IPv6." },
      { q: "Why can't I port forward even though I configured my router correctly?", a: "Your ISP may use CGNAT: check whether your router's WAN address is in 100.64.0.0/10 or differs from what a what-is-my-IP site shows. If so, ask the ISP for a public IPv4 address, use IPv6, or use a tunnel or relay service." },
      { q: "Does IPv6 use NAT?", a: "Normally no. IPv6 has enough addresses for every device to have a global one, and a stateful firewall provides the inbound protection. NAT64 exists only to let IPv6-only networks reach IPv4 servers." },
      { q: "What is the difference between SNAT and DNAT?", a: "SNAT rewrites the source address, as PAT does for outgoing traffic. DNAT rewrites the destination address, as port forwarding does for incoming traffic." },
    ],
  },
};

export default extra;
