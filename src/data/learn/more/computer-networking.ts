import type { LearningPath } from "../types";

const L = (label: string, url: string) => ({ label, url });

const path: LearningPath = {
  slug: "computer-networking",
  title: "Computer Networking",
  tagline: "From cables and frames to DNS, TLS and the cloud.",
  description:
    "Learn how data really moves between computers, layer by layer. You will subnet IPv4 and IPv6 networks, follow packets through switches, routers and NAT, understand TCP, DNS, HTTP and TLS, secure and troubleshoot networks with real tools, and finish by designing, building and debugging a small office network in a simulator with packet captures.",
  level: "Beginner → Intermediate",
  category: "Foundations",
  icon: "wifi",
  outcomes: [
    "Explain how a request crosses every layer from application to wire and back",
    "Design an IPv4 and IPv6 addressing plan with subnets, VLANs and routing",
    "Describe TCP, UDP, DNS, DHCP, HTTP and TLS behaviour from packet captures",
    "Troubleshoot connectivity methodically with ping, traceroute, dig, ss, tcpdump and Wireshark",
    "Apply firewall, VPN and cloud networking concepts such as VPCs, load balancers and CDNs",
  ],
  tools: [
    "Wireshark",
    "tcpdump",
    "Cisco Packet Tracer",
    "GNS3",
    "ping & traceroute / mtr",
    "dig & nslookup",
    "ip (iproute2)",
    "ss",
    "curl",
    "openssl s_client",
    "nmap",
    "ipcalc",
  ],
  modules: [
    {
      key: "net-foundations",
      title: "Network models & foundations",
      summary: "The vocabulary and layered models every other topic builds on.",
      links: [L("Cloudflare Learning Center", "https://www.cloudflare.com/learning/"), L("Cisco Networking Academy", "https://www.netacad.com/")],
      topics: [
        { key: "network-basics", title: "What a network is: hosts, LANs, WANs & topologies", hours: 2, goal: "Describe the parts of a network and how LANs, WANs and the internet relate.", subtopics: ["Name hosts, links, switches and routers", "Compare LAN, WAN and internet", "Compare star, mesh and bus topologies", "Explain bandwidth, latency and throughput"] },
        { key: "osi-model", title: "The OSI model", hours: 2.5, goal: "Place any protocol or device on the correct OSI layer and explain each layer's job.", subtopics: ["Name the seven layers in order", "Give example protocols per layer", "Map devices to layers", "Use layers to structure troubleshooting"] },
        { key: "tcpip-encapsulation", title: "TCP/IP model & encapsulation", hours: 2.5, goal: "Explain how data is wrapped into segments, packets and frames on the way down the stack.", subtopics: ["Map TCP/IP layers to OSI", "Follow headers added at each layer", "Name PDUs: segment, packet, frame", "Explain MTU and overhead"] },
      ],
    },
    {
      key: "net-link",
      title: "Physical & data link layers",
      summary: "Cables, frames, MAC addresses and the switches that forward them.",
      topics: [
        { key: "physical-media", title: "Physical media: copper, fibre & signalling", hours: 2, goal: "Choose cabling and explain speed, duplex and distance limits.", subtopics: ["Compare twisted pair cable categories", "Compare single-mode and multimode fibre", "Explain full and half duplex", "Read link speed and errors on an interface"] },
        { key: "ethernet-mac", title: "Ethernet frames & MAC addresses", hours: 2, goal: "Read an Ethernet frame and explain unicast, broadcast and multicast MAC addresses.", subtopics: ["Dissect the Ethernet II frame format", "Read MAC address OUI and NIC parts", "Distinguish unicast, broadcast and multicast", "Explain the frame check sequence"] },
        { key: "switching", title: "Switches & MAC learning", hours: 2.5, goal: "Explain how a switch learns, floods and forwards frames.", subtopics: ["Explain MAC address table learning", "Describe flooding of unknown destinations", "Compare hubs, switches and collision domains", "Inspect a MAC table in a simulator"] },
        { key: "vlans", title: "VLANs & trunking", hours: 3, goal: "Segment a switch into VLANs and carry them across trunks with 802.1Q tags.", subtopics: ["Explain broadcast domains and VLANs", "Configure access ports", "Configure 802.1Q trunk ports", "Route between VLANs with router-on-a-stick"] },
        { key: "arp", title: "ARP & neighbour discovery", hours: 2, goal: "Explain how IP addresses are resolved to MAC addresses and inspect the ARP cache.", subtopics: ["Trace an ARP request and reply", "Inspect the ARP cache", "Explain gratuitous ARP", "Compare ARP with IPv6 neighbour discovery"], links: [L("RFC 826: ARP", "https://www.rfc-editor.org/rfc/rfc826")] },
        { key: "stp", title: "Loops & Spanning Tree Protocol", hours: 2, goal: "Explain why switching loops are dangerous and how STP blocks redundant links.", subtopics: ["Explain broadcast storms from loops", "Describe root bridge election", "Identify root, designated and blocked ports", "Compare STP with RSTP"] },
      ],
    },
    {
      key: "net-ip",
      title: "IP addressing & subnetting",
      summary: "Addresses, prefixes and how to carve networks into subnets.",
      links: [L("RFC 791: IPv4", "https://www.rfc-editor.org/rfc/rfc791"), L("RFC 4632: CIDR", "https://www.rfc-editor.org/rfc/rfc4632")],
      topics: [
        { key: "ipv4-addressing", title: "IPv4 addresses, binary & the IPv4 header", hours: 2.5, goal: "Convert IPv4 addresses to binary and identify network, host and special addresses.", subtopics: ["Convert between decimal and binary octets", "Split address into network and host", "Recognise private and special ranges", "Read key IPv4 header fields"], links: [L("RFC 1918: private addresses", "https://www.rfc-editor.org/rfc/rfc1918")] },
        { key: "subnetting-cidr", title: "Subnetting & CIDR", hours: 4, goal: "Compute network, broadcast, host range and host count for any CIDR prefix by hand.", subtopics: ["Convert prefixes to subnet masks", "Find network and broadcast addresses", "Count usable hosts per subnet", "Split a network into equal subnets", "Practise until under a minute each"] },
        { key: "vlsm", title: "VLSM & address planning", hours: 2.5, goal: "Design a variable-length subnet plan that fits each segment's host count with no overlaps.", subtopics: ["Sort segments by host count", "Allocate largest subnets first", "Use /30 or /31 for point-to-point links", "Summarise routes into supernets"] },
        { key: "ipv6", title: "IPv6 addressing", hours: 3, goal: "Read, shorten and plan IPv6 addresses and explain SLAAC and address types.", subtopics: ["Shorten and expand IPv6 addresses", "Identify link-local, global and ULA addresses", "Plan /48 and /64 subnets", "Explain SLAAC and DHCPv6", "Compare IPv4 and IPv6 headers"], links: [L("RFC 8200: IPv6", "https://www.rfc-editor.org/rfc/rfc8200")] },
        { key: "icmp", title: "ICMP & ICMPv6", hours: 1.5, goal: "Interpret ICMP echo, unreachable and time-exceeded messages.", subtopics: ["Explain echo request and reply", "Read destination unreachable codes", "Explain time exceeded and TTL", "Explain path MTU discovery"], links: [L("RFC 792: ICMP", "https://www.rfc-editor.org/rfc/rfc792")] },
      ],
    },
    {
      key: "net-routing",
      title: "Routing & NAT",
      summary: "How packets find their way between networks.",
      topics: [
        { key: "routing-fundamentals", title: "Routing tables & longest-prefix match", hours: 2.5, goal: "Read a routing table and predict the next hop for any destination.", subtopics: ["Read a host and router routing table", "Apply longest-prefix match", "Explain default gateways", "Follow a packet hop by hop"] },
        { key: "static-routing", title: "Static & default routes", hours: 2, goal: "Configure static and default routes so two remote networks can reach each other.", subtopics: ["Configure static routes on routers", "Add a default route", "Add a static route on Linux", "Troubleshoot missing return routes"] },
        { key: "ospf", title: "Dynamic routing & OSPF concepts", hours: 3, goal: "Explain how link-state routing with OSPF builds a shared map and picks shortest paths.", subtopics: ["Compare distance-vector and link-state", "Explain OSPF neighbours and LSAs", "Explain areas and cost metrics", "Configure single-area OSPF in a simulator"], links: [L("RFC 2328: OSPFv2", "https://www.rfc-editor.org/rfc/rfc2328")] },
        { key: "bgp", title: "BGP & internet routing concepts", hours: 2.5, goal: "Explain how autonomous systems exchange routes with BGP and why route leaks cause outages.", subtopics: ["Define autonomous systems and ASNs", "Compare eBGP and iBGP", "Explain AS path and route selection", "Discuss hijacks, leaks and RPKI"], links: [L("RFC 4271: BGP-4", "https://www.rfc-editor.org/rfc/rfc4271")] },
        { key: "nat", title: "NAT & PAT", hours: 2.5, goal: "Explain how NAT and port address translation let private hosts share a public address.", subtopics: ["Compare static NAT, dynamic NAT and PAT", "Read a NAT translation table", "Configure port forwarding", "Explain NAT traversal problems"] },
      ],
    },
    {
      key: "net-transport",
      title: "Transport layer: TCP & UDP",
      summary: "Ports, reliable streams and fast datagrams.",
      links: [L("RFC 9293: TCP", "https://www.rfc-editor.org/rfc/rfc9293"), L("Beej's Guide to Network Programming", "https://beej.us/guide/bgnet/")],
      topics: [
        { key: "ports-sockets", title: "Ports, sockets & multiplexing", hours: 2, goal: "Explain how ports and the 5-tuple identify connections and list listening sockets.", subtopics: ["Explain well-known and ephemeral ports", "Define the connection 5-tuple", "List sockets with ss", "Write a tiny TCP client and server"] },
        { key: "tcp-connections", title: "TCP connection lifecycle", hours: 3, goal: "Trace the three-way handshake, data transfer and teardown in a packet capture.", subtopics: ["Trace SYN, SYN-ACK, ACK", "Follow sequence and acknowledgement numbers", "Trace FIN and RST teardown", "Explain TIME_WAIT and connection states"] },
        { key: "tcp-reliability", title: "TCP reliability & flow control", hours: 2.5, goal: "Explain retransmission, the receive window and how TCP avoids overwhelming a receiver.", subtopics: ["Explain retransmission timeouts", "Explain duplicate ACKs and fast retransmit", "Explain the sliding receive window", "Spot zero-window events in Wireshark"] },
        { key: "tcp-congestion", title: "TCP congestion control", hours: 2.5, goal: "Describe slow start, congestion avoidance and modern algorithms like CUBIC and BBR.", subtopics: ["Explain the congestion window", "Trace slow start and congestion avoidance", "Explain reaction to packet loss", "Compare Reno, CUBIC and BBR"], links: [L("RFC 5681: congestion control", "https://www.rfc-editor.org/rfc/rfc5681")] },
        { key: "udp-quic", title: "UDP & QUIC", hours: 2, goal: "Choose between TCP and UDP and explain how QUIC builds reliability on top of UDP.", subtopics: ["Read the UDP header", "List workloads that suit UDP", "Explain QUIC streams and 0-RTT", "Compare head-of-line blocking in TCP and QUIC"], links: [L("RFC 768: UDP", "https://www.rfc-editor.org/rfc/rfc768"), L("RFC 9000: QUIC", "https://www.rfc-editor.org/rfc/rfc9000")] },
      ],
    },
    {
      key: "net-application",
      title: "Application protocols",
      summary: "The protocols users actually touch: names, addresses, web and mail.",
      topics: [
        { key: "dns", title: "DNS: hierarchy, resolution & records", hours: 3.5, goal: "Trace a DNS lookup from stub resolver to authoritative server and choose the right record types.", subtopics: ["Explain root, TLD and authoritative servers", "Trace recursive and iterative resolution", "Use A, AAAA, CNAME, MX, TXT, NS", "Explain TTLs and caching", "Query records with dig"], links: [L("What is DNS?", "https://www.cloudflare.com/learning/dns/what-is-dns/"), L("RFC 1034: DNS concepts", "https://www.rfc-editor.org/rfc/rfc1034")] },
        { key: "dhcp", title: "DHCP", hours: 1.5, goal: "Explain the DORA exchange and what options a client receives with its lease.", subtopics: ["Trace discover, offer, request, acknowledge", "List common DHCP options", "Explain leases and renewal", "Configure a DHCP relay"], links: [L("RFC 2131: DHCP", "https://www.rfc-editor.org/rfc/rfc2131")] },
        { key: "http-1-1", title: "HTTP/1.1 semantics", hours: 2.5, goal: "Read and write raw HTTP requests and responses including methods, status codes and headers.", subtopics: ["Read request line, headers and body", "Use methods and status codes correctly", "Explain caching and cookies headers", "Send raw requests with curl -v"], links: [L("RFC 9110: HTTP semantics", "https://www.rfc-editor.org/rfc/rfc9110")] },
        { key: "http-2-3", title: "HTTP/2 & HTTP/3", hours: 2, goal: "Explain how multiplexing, header compression and QUIC improve on HTTP/1.1.", subtopics: ["Explain binary framing and streams", "Explain HPACK and QPACK compression", "Explain why HTTP/3 uses QUIC", "Check the protocol version with curl"], links: [L("RFC 9113: HTTP/2", "https://www.rfc-editor.org/rfc/rfc9113"), L("RFC 9114: HTTP/3", "https://www.rfc-editor.org/rfc/rfc9114")] },
        { key: "tls", title: "TLS & certificates", hours: 3, goal: "Explain the TLS 1.3 handshake and verify a server's certificate chain.", subtopics: ["Trace the TLS 1.3 handshake", "Explain certificates and chains of trust", "Explain SNI and ALPN", "Inspect a chain with openssl s_client"], links: [L("What happens in a TLS handshake?", "https://www.cloudflare.com/learning/ssl/what-happens-in-a-tls-handshake/"), L("RFC 8446: TLS 1.3", "https://www.rfc-editor.org/rfc/rfc8446")] },
        { key: "email-protocols", title: "Email: SMTP, IMAP & authentication", hours: 1.5, goal: "Explain how mail is relayed with SMTP and protected by SPF, DKIM and DMARC.", subtopics: ["Trace mail from client to recipient MX", "Compare SMTP, IMAP and POP3", "Explain SPF, DKIM and DMARC records"], links: [L("RFC 5321: SMTP", "https://www.rfc-editor.org/rfc/rfc5321")] },
      ],
    },
    {
      key: "net-wireless",
      title: "Wireless networking",
      summary: "Radio, Wi-Fi standards and keeping wireless networks secure.",
      links: [L("Wi-Fi Alliance", "https://www.wi-fi.org/")],
      topics: [
        { key: "wifi-standards", title: "Wi-Fi standards & radio basics", hours: 2, goal: "Compare Wi-Fi generations, frequency bands and channel widths.", subtopics: ["Compare Wi-Fi 4, 5, 6, 6E and 7", "Compare 2.4, 5 and 6 GHz bands", "Explain channels, width and interference", "Explain signal strength and SNR"] },
        { key: "wifi-operation", title: "How Wi-Fi works: SSIDs, association & roaming", hours: 2, goal: "Describe how a client discovers, joins and roams between access points.", subtopics: ["Explain SSIDs, BSSIDs and beacons", "Trace probe, authentication and association", "Explain collision avoidance with CSMA/CA", "Plan channels for several access points"] },
        { key: "wifi-security", title: "Wireless security: WPA2, WPA3 & 802.1X", hours: 2, goal: "Choose the right wireless security mode and explain common wireless attacks.", subtopics: ["Compare WEP, WPA2 and WPA3", "Explain the four-way handshake", "Compare PSK and 802.1X enterprise", "Describe rogue APs and evil twins"] },
      ],
    },
    {
      key: "net-tools",
      title: "Network tools & troubleshooting",
      summary: "A method plus the commands that reveal what the network is doing.",
      links: [L("Wireshark documentation", "https://www.wireshark.org/docs/")],
      topics: [
        { key: "troubleshooting-method", title: "Troubleshooting methodology", hours: 1.5, goal: "Troubleshoot layer by layer and isolate a fault with a repeatable method.", subtopics: ["Define the problem and scope", "Work bottom-up or top-down by layer", "Change one thing at a time", "Document findings and the fix"] },
        { key: "ping-traceroute", title: "ping, traceroute & mtr", hours: 2, goal: "Test reachability and locate where along a path packets are lost or delayed.", subtopics: ["Test reachability and latency with ping", "Trace the path with traceroute", "Read per-hop loss with mtr", "Explain ICMP filtering false alarms"] },
        { key: "dns-tools", title: "dig, nslookup & resolver checks", hours: 1.5, goal: "Diagnose DNS problems by querying specific servers and record types.", subtopics: ["Query records with dig", "Query a specific server with @", "Follow delegation with +trace", "Check the local resolver configuration"] },
        { key: "host-tools", title: "ip, ss, curl & nmap on the host", hours: 2.5, goal: "Inspect interfaces, routes, sockets and open ports from the command line.", subtopics: ["Show addresses and routes with ip", "List listening sockets with ss", "Test HTTP endpoints with curl", "Scan your own hosts with nmap"] },
        { key: "tcpdump", title: "Packet capture with tcpdump", hours: 2.5, goal: "Capture exactly the traffic you need with tcpdump filters and save it for analysis.", subtopics: ["Choose the capture interface", "Write host, port and protocol filters", "Save captures to pcap files", "Read TCP flags in the output"], links: [L("tcpdump man page", "https://www.tcpdump.org/manpages/tcpdump.1.html")] },
        { key: "wireshark", title: "Wireshark analysis", hours: 3.5, goal: "Analyse a capture in Wireshark to find handshakes, retransmissions and slow responses.", subtopics: ["Apply display filters", "Follow TCP and HTTP streams", "Use statistics and conversations views", "Spot retransmissions and resets", "Decrypt TLS with a key log file"], links: [L("Wireshark User's Guide", "https://www.wireshark.org/docs/wsug_html_chunked/")] },
      ],
    },
    {
      key: "net-security",
      title: "Network security basics",
      summary: "Control who can talk to what, encrypt across untrusted networks and detect attacks.",
      topics: [
        { key: "firewalls", title: "Firewalls & ACLs", hours: 3, goal: "Write stateful firewall rules and ACLs that follow default-deny and least privilege.", subtopics: ["Compare stateless ACLs and stateful firewalls", "Write default-deny rule sets", "Configure nftables or ufw rules", "Design DMZ and segmentation zones"] },
        { key: "vpns", title: "VPNs: IPsec, WireGuard & TLS VPNs", hours: 2.5, goal: "Explain site-to-site and remote-access VPNs and set up a WireGuard tunnel.", subtopics: ["Compare site-to-site and remote access", "Explain IPsec IKE, ESP and tunnel mode", "Set up a WireGuard tunnel", "Explain split and full tunnelling"], links: [L("WireGuard", "https://www.wireguard.com/")] },
        { key: "ids-attacks", title: "IDS/IPS & common network attacks", hours: 2.5, goal: "Recognise common network attacks and explain how IDS and IPS detect or block them.", subtopics: ["Describe ARP spoofing and MITM", "Describe DDoS and SYN floods", "Describe port scanning and reconnaissance", "Compare signature and anomaly detection", "Compare IDS and IPS placement"] },
      ],
    },
    {
      key: "net-cloud",
      title: "Cloud & data-centre networking",
      summary: "How modern applications are networked at scale.",
      topics: [
        { key: "datacenter-topologies", title: "Data-centre topologies: leaf-spine", hours: 2, goal: "Explain why data centres moved from three-tier to leaf-spine designs.", subtopics: ["Compare three-tier and leaf-spine designs", "Explain east-west versus north-south traffic", "Explain ECMP load sharing", "Explain overlays such as VXLAN"] },
        { key: "vpc", title: "Virtual private clouds", hours: 3, goal: "Design a VPC with public and private subnets, route tables and gateways.", subtopics: ["Choose a VPC CIDR block", "Create public and private subnets", "Attach internet and NAT gateways", "Compare security groups and network ACLs", "Connect VPCs with peering"], links: [L("Amazon VPC user guide", "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html")] },
        { key: "load-balancers", title: "Load balancers", hours: 2, goal: "Choose between layer 4 and layer 7 load balancing and configure health checks.", subtopics: ["Compare layer 4 and layer 7 balancing", "Compare round robin and least connections", "Configure health checks", "Explain TLS termination and sticky sessions"], links: [L("What is load balancing?", "https://www.cloudflare.com/learning/performance/what-is-load-balancing/")] },
        { key: "cdn", title: "CDNs & anycast", hours: 1.5, goal: "Explain how CDNs and anycast bring content closer to users and absorb attacks.", subtopics: ["Explain edge caching and cache keys", "Explain anycast routing", "Read cache-control headers"], links: [L("What is a CDN?", "https://www.cloudflare.com/learning/cdn/what-is-a-cdn/")] },
        { key: "sdn", title: "SDN & network automation concepts", hours: 2, goal: "Explain control and data plane separation and how networks are configured as code.", subtopics: ["Separate control and data planes", "Explain controllers and OpenFlow", "Explain intent-based networking", "Automate configs with APIs and Ansible"] },
      ],
    },
    {
      key: "net-capstone",
      title: "Capstone: design & troubleshoot an office network",
      summary: "Design, build, capture and fix a small office network end to end.",
      links: [L("Cisco Packet Tracer (NetAcad)", "https://www.netacad.com/"), L("GNS3", "https://www.gns3.com/")],
      topics: [
        { key: "network-design", title: "Design the office network", hours: 4, goal: "Produce a topology diagram and addressing plan with VLANs, subnets and services.", subtopics: ["Gather requirements for users and services", "Draw the physical and logical topology", "Write the VLAN and subnet plan", "Plan DHCP, DNS, NAT and firewall rules"] },
        { key: "network-build", title: "Build it in Packet Tracer or GNS3", hours: 6, goal: "Configure switches, router, DHCP, NAT, ACLs and Wi-Fi so every user reaches the internet.", subtopics: ["Configure VLANs and trunks on switches", "Configure inter-VLAN routing", "Set up DHCP and DNS", "Configure NAT and ACLs", "Add a wireless access point", "Verify connectivity from every VLAN"] },
        { key: "packet-analysis", title: "Capture & explain real traffic", hours: 3, goal: "Annotate captures of DHCP, ARP, DNS, TCP and TLS from your network.", subtopics: ["Capture a client joining the network", "Capture a web page load", "Annotate each protocol exchange", "Write a short traffic report"] },
        { key: "fault-scenarios", title: "Troubleshoot broken scenarios", hours: 4, goal: "Find and fix deliberately injected faults using the layered method and your tools.", subtopics: ["Inject faults such as wrong VLANs", "Break routes, DNS and gateways", "Diagnose each fault layer by layer", "Document symptoms, cause and fix"] },
      ],
    },
  ],
};

export default path;
